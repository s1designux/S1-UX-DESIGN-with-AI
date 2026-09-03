#!/usr/bin/env node
/**
 * css-var-reference-check.js — 「실재하지 않는 CSS 변수 참조」 검사 (Gate 45 의 판정부)
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜 만들었나 (river 지시 2026-09-03):
 *   Time Picker 안내 화면에서 ⭐ 가 하드코딩 #111827 을 「R01(HEX 금지)에 맞춘다」며
 *   `var(--color-text-default)` 로 바꿨는데 **그 토큰은 정본에도 파생에도 없었다.**
 *   선언이 통째로 무효가 되어 색이 상속으로 떨어졌고, 다크에서 글자가 읽힌 것은
 *   상속값이 우연히 맞아떨어진 결과였다. 사람 눈으로는 「잘 보이니까 됐다」로 통과한다.
 *   🤖 독립 검증이 렌더 실측(getPropertyValue = 빈 문자열)으로 겨우 잡았다.
 *
 *   river 결정: **이런 종류는 AI 검증이 아니라 기계가 잡는다.**
 *   (「검증을 줄이는 대신, 기계가 잡을 수 있는 것은 기계로 옮긴다」)
 *
 * ★ 무엇을 막나
 *   「없는 이름을 지어내고, 화면이 우연히 멀쩡해 보여서 넘어가는 것」.
 *   토큰 값 검사(Gate 7)·미사용 토큰(Gate 17)은 **정의된 토큰**만 본다.
 *   이 검사는 반대 방향 — **참조가 정의에 닿는가**를 본다.
 *
 * ★ 판정 방식 (추측 없음)
 *   1. 정의 수집: assets/css/tokens.css · typography.css 의 `--name:` 선언 전부.
 *   2. 참조 수집: 대상 CSS 의 `var(--name …)`.
 *   3. **폴백이 있으면 통과** — `var(--x, 11px)` 는 정의가 없어도 값이 정해진다(의도된 방어).
 *   4. 같은 파일 안에서 스스로 정의한 지역 변수도 통과.
 *   5. 남은 것 = 값이 정해지지 않는 죽은 선언 → 실패.
 *
 * ★ 기존 부채는 baseline 으로 분리하고 **새 참조만 차단**한다(래칫).
 *   baseline: registry/governance/css-var-reference-baseline.json
 *   줄이는 방향으로만 갱신한다 — 항목이 늘어나는 갱신은 그 자체가 검토 대상이다.
 *
 * 사용: node scripts/css-var-reference-check.js [--update-baseline] [--selftest]
 *       npm run css:varcheck
 * 출력 끝줄: CSSVARREF_SUMMARY refs=<n> undefined=<n> baselined=<n> newGaps=<n> resolved=<n>
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASELINE = path.join(ROOT, 'registry/governance/css-var-reference-baseline.json');

/** 정의 정본 — 여기 선언된 이름만 「실재하는 토큰」이다. */
const DEFINITION_FILES = ['assets/css/tokens.css', 'assets/css/typography.css'];

/** 검사 대상 — 배포본 CSS 전부 + 안내 화면 공용 CSS. */
function targetFiles() {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (p.endsWith('.css')) out.push(path.relative(ROOT, p));
    }
  };
  walk(path.join(ROOT, 'ui-library/src'));
  out.push('assets/css/ui-library-guide.css');
  return out.filter((f) => fs.existsSync(path.join(ROOT, f)));
}

function collectDefinitions(text) {
  const names = new Set();
  for (const m of text.matchAll(/(^|[;{\s])(--[A-Za-z0-9_-]+)\s*:/g)) names.add(m[2]);
  return names;
}

/**
 * `var(` 를 만나면 괄호 깊이를 세어 첫 인자(이름)와 폴백 유무를 가른다.
 * 정규식만으로는 중첩 var() 의 콤마를 잘못 읽는다.
 */
function collectReferences(text) {
  const refs = [];
  const re = /var\(\s*(--[A-Za-z0-9_-]+)/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    let i = re.lastIndex;
    let depth = 1;
    let hasFallback = false;
    while (i < text.length && depth > 0) {
      const ch = text[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (ch === ',' && depth === 1) { hasFallback = true; break; }
      i++;
    }
    const line = text.slice(0, m.index).split('\n').length;
    refs.push({ name, hasFallback, line });
  }
  return refs;
}

function audit() {
  const defined = new Set();
  for (const f of DEFINITION_FILES) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) throw new Error(`정의 정본이 없습니다: ${f}`);
    for (const n of collectDefinitions(fs.readFileSync(p, 'utf8'))) defined.add(n);
  }

  let refCount = 0;
  const gaps = [];
  for (const file of targetFiles()) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    const local = collectDefinitions(text);
    for (const ref of collectReferences(text)) {
      refCount++;
      if (ref.hasFallback) continue;              // 폴백이 있으면 값이 정해진다
      if (defined.has(ref.name) || local.has(ref.name)) continue;
      gaps.push({ key: `${file}::${ref.name}`, file, name: ref.name, line: ref.line });
    }
  }
  return { refCount, gaps, defined };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();

  const { refCount, gaps } = audit();
  const baseline = fs.existsSync(BASELINE)
    ? JSON.parse(fs.readFileSync(BASELINE, 'utf8'))
    : { knownGaps: [] };
  const known = new Map((baseline.knownGaps || []).map((g) => [g.key, g]));

  const uniq = new Map();
  for (const g of gaps) if (!uniq.has(g.key)) uniq.set(g.key, g);
  const all = [...uniq.values()];
  const baselined = all.filter((g) => known.has(g.key));
  const newGaps = all.filter((g) => !known.has(g.key));
  const seen = new Set(all.map((g) => g.key));
  const resolved = [...known.keys()].filter((k) => !seen.has(k));

  if (args.includes('--update-baseline')) {
    const next = {
      _role: 'Gate 45 CSS 변수 참조 — 기존 부채 동결 목록. 여기 있는 참조는 차단하지 않고 목록으로만 보인다.',
      _policy: [
        '새 참조는 차단된다 — 여기 넣으려면 왜 지금 못 고치는지 사유를 반드시 적는다.',
        '줄이는 방향으로만 갱신한다. 항목이 늘어나는 갱신은 그 자체가 검토 대상이다.',
        '해소된 항목은 --update-baseline 으로 빼면 다시 생겼을 때 회귀가 차단된다.'
      ],
      _updated: new Date().toISOString().slice(0, 10),
      knownGaps: all.map((g) => ({
        key: g.key, file: g.file, name: g.name,
        reason: (known.get(g.key) || {}).reason || 'TODO: 왜 지금 못 고치는지 적을 것'
      }))
    };
    fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
    console.log(`baseline 갱신: ${next.knownGaps.length}건`);
  }

  for (const g of baselined) {
    console.log(`     - FROZEN ${g.key} (${(known.get(g.key) || {}).reason || '사유 없음'})`);
  }
  for (const g of newGaps) {
    console.log(`  ❌ NEWREF ${g.file}:${g.line} — ${g.name} 은 정의된 적이 없습니다(폴백도 없어 선언이 통째로 무효입니다)`);
  }
  if (resolved.length) console.log(`  ⚠️  baseline 중 ${resolved.length}건 해소됨 — 축소 갱신 권장: node scripts/css-var-reference-check.js --update-baseline`);
  if (newGaps.length === 0) console.log(`  ✅ CSS 변수 참조 ${refCount}건 전부 정의에 닿음 (동결 ${baselined.length}건)`);

  console.log(`CSSVARREF_SUMMARY refs=${refCount} undefined=${all.length} baselined=${baselined.length} newGaps=${newGaps.length} resolved=${resolved.length}`);
  process.exit(newGaps.length > 0 ? 1 : 0);
}

/** 적대 테스트 — 검사기가 실제로 잡는지 스스로 증명한다. */
function selftest() {
  const cases = [
    { name: '지어낸 이름 차단', css: 'a{color:var(--color-text-default)}', expect: 1 },
    { name: '실존 토큰 통과', css: 'a{color:var(--color-text-title-primary)}', expect: 0 },
    { name: '폴백 있으면 통과', css: 'a{font-size:var(--font-size-11, 11px)}', expect: 0 },
    { name: '같은 파일 지역 정의 통과', css: ':root{--x-local:1px} a{width:var(--x-local)}', expect: 0 },
    { name: '중첩 var 의 콤마를 폴백으로 오독하지 않음', css: 'a{color:var(--nope-nested)} b{color:var(--color-text-title-primary)}', expect: 1 },
    { name: '주석 안 참조는 세지 않음', css: '/* var(--commented-out) */ a{color:var(--color-text-title-primary)}', expect: 0 }
  ];
  const defined = new Set();
  for (const f of DEFINITION_FILES) for (const n of collectDefinitions(fs.readFileSync(path.join(ROOT, f), 'utf8'))) defined.add(n);

  let failed = 0;
  for (const c of cases) {
    const text = c.css.replace(/\/\*[\s\S]*?\*\//g, (x) => x.replace(/[^\n]/g, ' '));
    const local = collectDefinitions(text);
    const bad = collectReferences(text).filter((r) => !r.hasFallback && !defined.has(r.name) && !local.has(r.name));
    const ok = bad.length === c.expect;
    console.log(`  ${ok ? '✅' : '❌'} ${c.name} — 기대 ${c.expect}, 실제 ${bad.length}`);
    if (!ok) failed++;
  }
  console.log(`CSSVARREF_SELFTEST cases=${cases.length} failed=${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

module.exports = { audit };
if (require.main === module) main();
