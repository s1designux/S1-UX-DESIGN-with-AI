#!/usr/bin/env node
/**
 * kotlin-compose-parity-check.js — Compose 스타일 표를 "진짜 브라우저"와 대조한다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜 필요한가: Compose 부품의 값은 생성기가 배포본 CSS 를 스스로 계산해서 뽑는다.
 * 그 계산이 브라우저와 다르면 부품 전체가 조용히 틀린다 — 자기 계산으로 자기를 증명할 수 없다.
 * 그래서 같은 요소·같은 상태를 헤드리스 크롬에 그려 getComputedStyle 로 읽고, 표와 맞춰 본다.
 *
 * 상태 흉내: :hover 같은 가상 클래스는 스크립트로 켤 수 없어, 검사용 사본에서만
 * 같은 명시도의 속성 선택자([data-force-hover])로 바꾼다. 값·순서·명시도는 그대로다.
 *
 * 사용: node scripts/kotlin-compose-parity-check.js [--keep] [--verbose]
 * 종료코드: 0 일치 · 1 불일치 · 2 실행 불가(크롬 없음 등)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const KEEP = process.argv.includes('--keep');
const VERBOSE = process.argv.includes('--verbose');

/* ── 검사용 CSS 변환 — 상태 가상 클래스를 같은 명시도의 속성으로 ───────── */
const FORCED = [
  [/:focus-within\b/g, '[data-force-focus-within]'],
  [/:focus-visible\b/g, '[data-force-focus-visible]'],
  [/:hover\b/g, '[data-force-hover]'],
  [/:active\b/g, '[data-force-active]']
];

function forceStates(css) {
  let out = css;
  for (const [pattern, replacement] of FORCED) out = out.replace(pattern, replacement);
  return unwrapHoverMedia(out);
}

/** @media (hover: hover) { ... } 를 펼친다 — 검사에서는 항상 마우스가 있는 화면으로 본다. */
function unwrapHoverMedia(css) {
  let out = '';
  let index = 0;
  while (index < css.length) {
    const at = css.indexOf('@media', index);
    if (at === -1) { out += css.slice(index); break; }
    const open = css.indexOf('{', at);
    const condition = css.slice(at + 6, open).trim();
    let depth = 0;
    let end = open;
    for (; end < css.length; end += 1) {
      if (css[end] === '{') depth += 1;
      else if (css[end] === '}') { depth -= 1; if (depth === 0) break; }
    }
    out += css.slice(index, at);
    const body = css.slice(open + 1, end);
    out += /hover/.test(condition) ? body : '';
    index = end + 1;
  }
  return out;
}

/* ── 요소 모델 → HTML ─────────────────────────────────────────────────── */
const REAL_ATTRIBUTE_STATES = { disabled: 'disabled', checked: 'checked' };

function serialize(node) {
  const attributes = { ...node.attributes };
  for (const state of node.states) {
    if (REAL_ATTRIBUTE_STATES[state]) attributes[REAL_ATTRIBUTE_STATES[state]] = '';
    else attributes[`data-force-${state}`] = '';
  }
  const text = Object.entries(attributes)
    .map(([name, value]) => (value === '' ? ` ${name}` : ` ${name}="${String(value).replace(/"/g, '&quot;')}"`))
    .join('');
  if (node.tag === 'input') return `<input${text}>`;
  const children = node.children.map(serialize).join('');
  return `<${node.tag}${text}>${children}</${node.tag}>`;
}

function pathOf(node) {
  const chain = [];
  let current = node;
  while (current.parent) {
    chain.unshift(current.parent.children.indexOf(current));
    current = current.parent;
  }
  return { root: current, chain };
}

/* ── 비교 대상 속성 ───────────────────────────────────────────────────── */
const COMPARED = [
  ['background', 'backgroundColor', 'color'],
  ['foreground', 'color', 'color'],
  ['borderColor', 'borderTopColor', 'color'],
  ['borderWidth', 'borderTopWidth', 'px'],
  ['radius', 'borderTopLeftRadius', 'px'],
  ['height', 'height', 'px'],
  ['width', 'width', 'px'],
  ['minWidth', 'minWidth', 'px'],
  ['minHeight', 'minHeight', 'px'],
  ['paddingStart', 'paddingLeft', 'px'],
  ['paddingEnd', 'paddingRight', 'px'],
  ['paddingTop', 'paddingTop', 'px'],
  ['paddingBottom', 'paddingBottom', 'px'],
  ['gap', 'rowGap', 'px'],
  ['marginStart', 'marginLeft', 'px'],
  ['fontSize', 'fontSize', 'px'],
  ['fontWeight', 'fontWeight', 'number'],
  ['letterSpacing', 'letterSpacing', 'em'],
  ['lineHeight', 'lineHeight', 'ratio']
];

async function main() {
  const { PLANS, EXTRA_PLANS, extractSpec } = await import(path.join(ROOT, 'ui-library/scripts/kotlin-compose.mjs'));
  const { readTokens } = await import(path.join(ROOT, 'ui-library/scripts/platform.mjs'));

  const tokensCss = fs.readFileSync(path.join(ROOT, 'assets/css/tokens.css'), 'utf8');
  const tokenData = readTokens(tokensCss);
  const tokenValues = new Map(tokenData.tokens.map((token) => [token.name, token.value]));

  const ids = Object.keys(PLANS);
  const cases = [];
  const styleBlocks = [forceStates(tokensCss)];

  for (const id of ids) {
    const base = path.join(ROOT, 'ui-library/src/components', id);
    const css = fs.readFileSync(path.join(base, `${id}.css`), 'utf8');
    const manifest = JSON.parse(fs.readFileSync(path.join(base, 'manifest.json'), 'utf8'));
    styleBlocks.push(forceStates(css));

    const plans = [PLANS[id](manifest), ...(EXTRA_PLANS[id] ?? []).map((factory) => factory(manifest))];
    const spec = extractSpec({ id, css, manifest, tokenValues });
    const tables = { [id]: spec.table, ...Object.fromEntries(Object.entries(spec.extras).map(([key, value]) => [key, value.table])) };

    for (const plan of plans) {
      for (const combo of plan.combos) {
        const built = plan.build(combo);
        const key = plan.key(combo);
        const table = tables[plan.id];
        for (const [part, target] of Object.entries(built.targets)) {
          const { root, chain } = pathOf(target.node);
          cases.push({
            component: id,
            plan: plan.id,
            key,
            part,
            html: serialize(root),
            chain,
            pseudoElement: target.pseudoElement ? `::${target.pseudoElement}` : null,
            expected: table[key].parts[part]
          });
        }
      }
    }
  }

  const page = buildPage(styleBlocks.join('\n'), cases);
  const file = path.join(os.tmpdir(), `s1-kotlin-parity-${Date.now()}.html`);
  fs.writeFileSync(file, page);

  const measured = await runChrome(file);
  if (!KEEP) fs.unlinkSync(file);

  const failures = [];
  let checked = 0;
  let skipped = 0;
  for (let index = 0; index < cases.length; index += 1) {
    const probe = cases[index];
    const actual = measured[index];
    if (!actual) { failures.push({ ...probe, property: '(측정 없음)', expected: '', actual: '' }); continue; }
    /* ::placeholder 는 크롬 getComputedStyle 이 요소 자신의 값을 돌려준다(가상요소 값을 내주지 않는다).
       측정할 수 없는 자리라 대조에서 뺀다 — 값을 못 믿어서가 아니라 잴 자가 없어서다.
       이 자리는 skipped 로 세어 보고에 그대로 드러낸다. */
    if (probe.pseudoElement === '::placeholder') { skipped += 1; continue; }
    for (const [field, cssProperty, kind] of COMPARED) {
      const expected = probe.expected[field];
      if (expected === undefined || expected === null) continue;
      if (kind === 'color' && expected.inherit) continue;
      checked += 1;
      const expectedText = normalizeExpected(expected, kind, probe.expected, tokenValues);
      const actualText = normalizeActual(actual[cssProperty], kind, actual.fontSize);
      if (expectedText !== actualText) {
        failures.push({ ...probe, property: cssProperty, expected: expectedText, actual: actualText });
      }
    }
  }

  console.log(`🔎 Compose 스타일 표 ↔ 브라우저 실측 대조`);
  console.log(`   질의 ${cases.length}건 · 값 ${checked}개 대조${skipped ? ` · 측정 불가로 건너뜀 ${skipped}건(::placeholder — 크롬이 가상요소 값을 내주지 않음)` : ''}`);
  if (failures.length === 0) {
    console.log('✅ PASS — 표의 모든 값이 브라우저 계산과 같습니다.');
    return 0;
  }
  console.log(`❌ FAIL — ${failures.length}건 불일치`);
  for (const failure of failures.slice(0, VERBOSE ? failures.length : 40)) {
    console.log(`   · ${failure.component}/${failure.plan} ${failure.key} ${failure.part}${failure.pseudoElement ?? ''} ${failure.property}: 표 ${failure.expected} ≠ 브라우저 ${failure.actual}`);
  }
  if (!VERBOSE && failures.length > 40) console.log(`   … 외 ${failures.length - 40}건 (--verbose)`);
  return 1;
}

function normalizeExpected(value, kind, box, tokenValues) {
  if (kind === 'color') {
    const raw = tokenValues.get(value.token);
    return colorText(raw);
  }
  if (kind === 'px') return `${round(value)}px`;
  if (kind === 'number') return String(value);
  if (kind === 'em') return box.fontSize ? `${round(value * box.fontSize)}px` : 'normal';
  if (kind === 'ratio') return box.fontSize ? `${round(value * box.fontSize)}px` : 'normal';
  return String(value);
}

function normalizeActual(text, kind, fontSize) {
  if (text === undefined || text === null) return '(없음)';
  if (kind === 'color') return colorText(text);
  if (kind === 'number') return String(parseInt(text, 10));
  if (text === 'normal') return kind === 'em' ? '0px' : 'normal';
  const number = parseFloat(text);
  if (Number.isNaN(number)) return text;
  return `${round(number)}px`;
}

const round = (value) => Math.round(Number(value) * 100) / 100;

function colorText(input) {
  if (!input) return '(없음)';
  const text = String(input).trim();
  const hex = /^#([0-9a-f]{3,8})$/i.exec(text);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) digits = [...digits].map((c) => c + c).join('');
    const [r, g, b] = [0, 2, 4].map((at) => parseInt(digits.slice(at, at + 2), 16));
    const alpha = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1;
    return rgbaText(r, g, b, alpha);
  }
  const rgba = /^rgba?\(([^)]+)\)$/i.exec(text);
  if (rgba) {
    const parts = rgba[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return rgbaText(parts[0], parts[1], parts[2], parts[3] === undefined ? 1 : parts[3]);
  }
  if (text === 'transparent') return rgbaText(0, 0, 0, 0);
  return text;
}

const rgbaText = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${round(a)})`;

function buildPage(css, cases) {
  const probes = cases.map(({ html, chain, pseudoElement }) => ({ html, chain, pseudoElement }));
  return `<!doctype html>
<meta charset="utf-8">
<title>대조 준비</title>
<style>
/* 검사용 사본 — 상태 가상 클래스만 같은 명시도의 속성으로 바꾼 것이다. */
${css}
</style>
<div id="stage"></div>
<script id="probes" type="application/json">${JSON.stringify(probes)}</script>
<script>
const probes = JSON.parse(document.getElementById('probes').textContent);
const stage = document.getElementById('stage');
const results = probes.map((probe) => {
  stage.innerHTML = probe.html;
  let node = stage.firstElementChild;
  for (const index of probe.chain) node = node.children[index];
  const style = getComputedStyle(node, probe.pseudoElement || undefined);
  const out = {};
  for (const name of [
    'backgroundColor','color','borderTopColor','borderTopWidth','borderTopLeftRadius',
    'height','width','minWidth','minHeight','paddingLeft','paddingRight','paddingTop','paddingBottom',
    'rowGap','marginLeft','fontSize','fontWeight','letterSpacing','lineHeight'
  ]) out[name] = style[name];
  return out;
});
stage.innerHTML = '';
const output = document.createElement('script');
output.type = 'application/json';
output.id = 'results';
output.textContent = JSON.stringify(results);
document.body.appendChild(output);
document.title = 'S1-PARITY-DONE';
</script>
`;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'
  ].filter(Boolean);
  for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
  return null;
}

/** --dump-dom 은 다 쓰고도 스스로 끝나지 않는다. 결과가 보이면 바로 끊는다. */
function runChrome(file) {
  const chrome = findChrome();
  if (!chrome) { console.error('❌ 크롬을 찾지 못했습니다. CHROME_PATH 를 지정하세요.'); process.exit(2); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 's1-parity-profile-'));
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      `--user-data-dir=${profile}`, '--virtual-time-budget=5000',
      '--dump-dom', `file://${file}`
    ], { stdio: ['ignore', 'pipe', 'ignore'] });
    let buffer = '';
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('크롬이 시간 안에 결과를 내지 못했습니다.')); }, 60000);
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      if (buffer.includes('S1-PARITY-DONE') && buffer.includes('</html>')) {
        clearTimeout(timer);
        child.kill('SIGKILL');
        const match = /<script type="application\/json" id="results">([\s\S]*?)<\/script>/.exec(buffer);
        if (!match) { reject(new Error('결과를 읽지 못했습니다.')); return; }
        try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
        resolve(JSON.parse(match[1]));
      }
    });
    child.on('error', reject);
  });
}

main().then((code) => process.exit(code)).catch((error) => { console.error(`❌ ${error.message}`); process.exit(2); });
