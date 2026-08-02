#!/usr/bin/env node
/**
 * size-naming-check.js  (Gate 32 — 크기 이름 규칙)
 * ─────────────────────────────────────────────────────────────────────────
 * "같은 크기를 표면마다 다른 단어로 적는 것"을 차단한다.
 *
 * ★ 막지 않는 것 (중요): **크기의 '기준'은 컴포넌트마다 다르다.**
 *   버튼 md=44 · GNB md=56 · 표 sm=38 · 칩 sm=28 은 전부 정상이다.
 *   컴포넌트 안에서 정한 이름이므로 이 게이트는 픽셀값을 비교하지 않는다.
 *
 * ★ 막는 것: **표기(단어)의 갈림.**
 *   (A) 정본이 허용 어휘 밖 단어를 쓰는 것        — MEDIUM/SMALL/xsmall/xs …
 *   (B) variant property 이름에 공백·특수문자      — "full menu" → 웹 속성으로 못 옮겨 검사 밖에 남음
 *   (C) 파생 표면이 정본에 없는 크기 단어를 쓰는 것 — registry 가 medium, 정본은 MD
 *   (D) harness-audit 의 라벨 단어 ↔ 클래스 단어 불일치 — label 'medium (h44)' ↔ 's1-btn-lg'
 *
 * 왜 필요했나 (2026-08-02 실측): 표기가 5계보로 갈려 있었고(설치기 축약형·표셀만 풀네임·
 *   웹 CSS 가 44를 lg 로·라벨 medium·registry pc-medium), build-components.ts:958 주석이
 *   "Issue 8 리네임 잔재(XSMALL/SMALL/MEDIUM)였음"이라 적고 있듯 **과거에 통일 작업을 했는데
 *   표 셀이 누락**됐다. 그런데 Gate 19 가 대조 전에 전부 소문자로 바꿔버려 어긋남이 기계에
 *   안 보였다(표 셀만 우연히 튀어나왔다). 사람 성실성에 기대던 층을 기계 층으로 승격한다.
 *
 * 정본 = 설치기 build-components.ts (esbuild + recording mock 실측 · Gate 19 와 같은 방식)
 * 규칙 = registry/governance/size-naming-policy.json
 *
 * 출력 끝줄: `SIZENAMING_SUMMARY components=<n> checked=<n> violations=<n> unmeasured=<n>`
 * 사용: node scripts/size-naming-check.js   (npm run components:sizenaming)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const HTML = path.join(ROOT, 'pages/components.html');
const POLICY = path.join(ROOT, 'registry/governance/size-naming-policy.json');
const COVERAGE = path.join(ROOT, 'registry/governance/component-page-coverage.json');
const PRESENTATION = path.join(ROOT, 'registry/governance/component-presentation-policy.json');
const REGISTRY_DIR = path.join(ROOT, 'registry/components');
const HARNESS = path.join(ROOT, 'scripts/harness-audit.js');

const pol = JSON.parse(fs.readFileSync(POLICY, 'utf8'));
const SIZE_WORDS = new Set(pol.allowedSizeWords);
const PLATFORM_WORDS = new Set(pol.platformWords);
const NON_SIZE = new Set(pol.knownNonSizeWords || []);
const PROP_RE = new RegExp(pol.propNamePattern);

// ── 정본 판독: 설치기 mock 실행 (Gate 19 variant-coverage-check.js 와 동일 패턴) ──
function makeStub() {
  return new Proxy(function () {}, { get(_t, p) { if (p === 'then') return undefined; if (p === Symbol.iterator) return undefined; if (p === 'children') return []; if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0; return makeStub(); }, set() { return true; }, apply() { return makeStub(); } });
}
function recNode(type) {
  const state = { type, name: undefined, children: [] };
  const push = (c) => { state.children.push(c && c.__state ? c.__state : { type: '?', name: undefined, children: [] }); return c; };
  return new Proxy(function () {}, { get(_t, p) { if (p === '__state') return state; if (p === 'type') return state.type; if (p === 'name') return state.name; if (p === 'children') return state.children; if (p === 'appendChild') return push; if (p === 'insertChild') return (_i, c) => push(c); if (p === 'then') return undefined; if (p === Symbol.iterator) return undefined; if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0; return makeStub(); }, set(_t, p, v) { if (p === 'name') state.name = v; return true; } });
}

/** {componentName: {props:Set(rawPropName), sizes:Set(rawSizeValue)}} — 원본 대소문자 보존 */
function installerSizeMatrix() {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `bc-sizenaming-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  const sets = [];
  const figmaObj = {
    createFrame: () => recNode('FRAME'), createComponent: () => recNode('COMPONENT'), createRectangle: () => recNode('RECTANGLE'),
    createText: () => recNode('TEXT'), createEllipse: () => recNode('ELLIPSE'), createLine: () => recNode('LINE'), createVector: () => recNode('VECTOR'),
    createNodeFromSvg: () => recNode('FRAME'),
    combineAsVariants: (comps) => { const set = recNode('COMPONENT_SET'); for (const c of comps) set.appendChild(c); sets.push(set); return set; },
    loadFontAsync: async () => {}, importComponentByKeyAsync: async () => ({ createInstance: () => recNode('INSTANCE') }), currentPage: recNode('PAGE'),
  };
  global.figma = new Proxy(figmaObj, { get: (t, p) => (p in t ? t[p] : makeStub()) });
  const maps = { semanticColor: new Proxy({}, { get: () => makeStub() }), foundationColor: new Proxy({}, { get: () => makeStub() }), foundationNumber: new Proxy({}, { get: () => makeStub() }), textStyles: new Proxy({}, { get: () => makeStub() }), semanticColorCollectionId: 'c', semanticLightModeId: 'l', semanticDarkModeId: 'd' };
  return (async () => {
    try { delete require.cache[tmp]; const mod = require(tmp); await mod.buildAllComponents(maps); } catch (e) { /* 부분 실패는 아래 0건 판정이 잡는다 */ }
    try { fs.unlinkSync(tmp); } catch (_) {}
    const matrix = {};
    for (const s of sets) {
      const st = s.__state; if (!st || !st.name) continue;
      const rec = matrix[st.name] || (matrix[st.name] = { props: new Set(), sizes: new Set() });
      for (const v of st.children) {
        if (!v.name) continue;
        for (const pair of v.name.split(',')) {
          const idx = pair.indexOf('=');
          if (idx < 0) continue;
          const k = pair.slice(0, idx).trim();
          const val = pair.slice(idx + 1).trim();
          if (!k || !val) continue;
          rec.props.add(k);
          if (k.toLowerCase() === 'size') rec.sizes.add(val);
        }
      }
    }
    return matrix;
  })();
}

/** 복합 id("pc-md" · "mobile-md" · "md")에서 크기 단어만 뽑는다. 플랫폼 조각은 버린다. */
function sizeWordsOf(id) {
  const found = [];
  for (const seg of String(id).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)) {
    if (PLATFORM_WORDS.has(seg)) continue;
    if (/^h?\d+(px)?$/.test(seg)) continue;   // 높이 주석(h44 · 44 · 44px)은 크기 '단어'가 아니다
    found.push(seg);
  }
  return found;
}
/** 그 조각들 중 '크기 단어로 보이는데 허용 어휘 밖'인 것 = 위반 후보 */
function unknownSizeWords(id, canonical) {
  const bad = [];
  for (const w of sizeWordsOf(id)) {
    if (SIZE_WORDS.has(w)) continue;
    if (NON_SIZE.has(w)) continue;
    // 정본이 실제로 쓰는 단어면 통과(정본이 곧 기준)
    if (canonical && canonical.has(w)) continue;
    bad.push(w);
  }
  return bad;
}

function collectRegistrySizeIds(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out;
  if (Array.isArray(obj)) { for (const v of obj) collectRegistrySizeIds(v, out); return out; }
  for (const [k, v] of Object.entries(obj)) {
    const kl = k.toLowerCase();
    if (kl === 'sizing' && v && typeof v === 'object') {
      for (const [pk, pv] of Object.entries(v)) {
        if (!Array.isArray(pv)) continue;
        for (const row of pv) if (row && typeof row === 'object' && row.id) out.push({ id: row.id, where: `sizing.${pk}[].id` });
      }
    } else if (kl === 'sizes' || kl === 'size' || /size$/.test(kl)) {
      // /size$/ 는 pcSize·mobileSize 처럼 플랫폼 접두가 붙은 배열까지 잡는다.
      // (2026-08-02 🤖 검증에서 button.json 의 pcSize/mobileSize 만 옛 어휘로 남은 것이 적발됐고,
      //  당시 이 검사기가 'sizes'/'size' 만 봐서 놓쳤다. 숫자값 키(fontSize)는 아래 타입 필터가 거른다.)
      if (Array.isArray(v)) for (const s of v) { if (typeof s === 'string') out.push({ id: s, where: k }); }
      else if (v && typeof v === 'object') for (const sk of Object.keys(v)) out.push({ id: sk, where: `${k}.<key>` });
    } else if (kl === 'platforms' && v && typeof v === 'object' && !Array.isArray(v)) {
      for (const sk of Object.keys(v)) out.push({ id: sk, where: 'platforms.<key>' });
    } else {
      collectRegistrySizeIds(v, out);
    }
  }
  return out;
}

async function check({ pass, warn, fail }) {
  const violations = [];
  const unmeasured = [];

  // ── 정본 ────────────────────────────────────────────────────────────
  const matrix = await installerSizeMatrix();
  const compNames = Object.keys(matrix);
  if (compNames.length === 0) {
    fail('Gate 32: 설치기에서 변형세트를 0건 추출 — 검사 불능(추출 0건=안 됨). mock 실행 실패 가능성.');
    console.log('SIZENAMING_SUMMARY components=0 checked=0 violations=1 unmeasured=0');
    return;
  }

  // 정본이 실제로 쓰는 크기 단어 집합 (소문자)
  const canonicalWords = new Set();
  for (const rec of Object.values(matrix)) for (const s of rec.sizes) for (const w of sizeWordsOf(s)) canonicalWords.add(w);

  // (A) 정본 어휘 검사
  for (const [name, rec] of Object.entries(matrix)) {
    for (const s of rec.sizes) {
      for (const w of sizeWordsOf(s)) {
        if (!SIZE_WORDS.has(w)) violations.push(`(A) 정본 어휘 밖 — [${name}] Size="${s}" 의 "${w}" 는 허용 어휘(${[...SIZE_WORDS].join('·')}) 밖이다. build-components.ts`);
      }
    }
  }

  // (B) variant property 이름 검사
  for (const [name, rec] of Object.entries(matrix)) {
    for (const p of rec.props) {
      if (!PROP_RE.test(p)) violations.push(`(B) 속성 이름 규칙 위반 — [${name}] property "${p}" 에 공백/특수문자. 웹 속성명(data-cov-*)으로 옮길 수 없어 그 축이 검사 밖에 남는다. build-components.ts`);
    }
  }

  // ── 파생 표면 (C) ───────────────────────────────────────────────────
  // registry/components/*.json
  for (const f of fs.readdirSync(REGISTRY_DIR).filter((x) => x.endsWith('.json'))) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, f), 'utf8')); } catch (e) { continue; }
    for (const { id, where } of collectRegistrySizeIds(j)) {
      const bad = unknownSizeWords(id, canonicalWords);
      for (const w of bad) violations.push(`(C) 파생 표면 어휘 갈림 — registry/components/${f} (${where}) 의 "${id}" 안 "${w}" 는 정본에 없는 크기 단어다.`);
    }
  }
  // component-presentation-policy.json
  try {
    const pp = JSON.parse(fs.readFileSync(PRESENTATION, 'utf8'));
    for (const [comp, cfg] of Object.entries(pp)) {
      if (!cfg || typeof cfg !== 'object' || !Array.isArray(cfg.sizes)) continue;
      for (const s of cfg.sizes) for (const w of unknownSizeWords(s, canonicalWords)) violations.push(`(C) 파생 표면 어휘 갈림 — component-presentation-policy.json [${comp}] sizes 의 "${s}" 안 "${w}" 는 정본에 없는 크기 단어다.`);
    }
  } catch (e) { warn(`Gate 32: presentation-policy 판독 실패 — ${e.message}`); }
  // pages/components.html 의 data-cov-sizes
  const html = fs.readFileSync(HTML, 'utf8');
  for (const m of html.matchAll(/<section\b[^>]*\bid="([a-z0-9-]+)"[^>]*>/g)) {
    const id = m[1];
    const sm = /\bdata-cov-sizes="([^"]*)"/.exec(m[0]);
    if (!sm) continue;
    for (const s of sm[1].split(',').map((x) => x.trim()).filter(Boolean)) {
      for (const w of unknownSizeWords(s, canonicalWords)) violations.push(`(C) 파생 표면 어휘 갈림 — components.html 섹션 #${id} 의 data-cov-sizes "${s}" 안 "${w}" 는 정본에 없는 크기 단어다.`);
    }
  }

  // ── (D) harness-audit 라벨 ↔ 클래스 단어 일치 ───────────────────────
  let dChecked = 0;
  try {
    const ha = fs.readFileSync(HARNESS, 'utf8');
    for (const m of ha.matchAll(/\{\s*label:\s*'([^']*)'\s*,\s*mustContain:\s*'([^']*)'\s*\}/g)) {
      const label = m[1], must = m[2];
      const labelWords = sizeWordsOf(label.split(/[\s(]/)[0]).filter((w) => !NON_SIZE.has(w));
      const mustWords = sizeWordsOf(must).filter((w) => SIZE_WORDS.has(w));
      if (labelWords.length === 0 || mustWords.length === 0) continue; // 무수식어/기본 = 대조 대상 아님
      dChecked++;
      const hit = labelWords.some((w) => mustWords.includes(w));
      if (!hit) violations.push(`(D) 라벨↔클래스 단어 불일치 — harness-audit.js: label '${label}' 의 크기 단어(${labelWords.join('·')}) 가 클래스 '${must}' 의 크기 단어(${mustWords.join('·')}) 와 다르다.`);
    }
    if (dChecked === 0) unmeasured.push('(D) harness-audit 에서 대조 가능한 라벨↔클래스 쌍 0건 — 형식이 바뀌었을 수 있다.');
  } catch (e) { unmeasured.push(`(D) harness-audit 판독 실패 — ${e.message}`); }

  // ── 미계측 정직 보고 (Gate 19 원리) ────────────────────────────────
  try {
    const cov = JSON.parse(fs.readFileSync(COVERAGE, 'utf8'));
    const sectionFor = cov.sectionFor || {};
    // 부품(요소) 컴포넌트는 상위 섹션에 합산 대조된다(axisSource) — 그것도 '계측됨'으로 본다.
    const viaParent = new Set();
    for (const arr of Object.values(cov.axisSource || {})) if (Array.isArray(arr)) for (const n of arr) viaParent.add(n);
    for (const [name, rec] of Object.entries(matrix)) {
      if (rec.sizes.size === 0) continue;
      if (!sectionFor[name] && !viaParent.has(name)) unmeasured.push(`${name} — 크기 축은 있으나 HTML 섹션 매핑(sectionFor/axisSource)이 없어 data-cov 대조 불가`);
    }
  } catch (e) { /* Gate 18 이 별도로 잡는다 */ }

  const checked = compNames.length;
  if (violations.length === 0) {
    pass(`크기 이름 규칙 위반 0 — 정본 어휘 ${[...canonicalWords].filter((w) => SIZE_WORDS.has(w)).sort().join('·')} · 컴포넌트 ${checked}개 · 속성 이름 공백 0 · 라벨↔클래스 ${dChecked}쌍 일치`);
  } else {
    for (const v of violations) fail(`Gate 32: ${v}`);
  }
  for (const u of unmeasured) warn(`Gate 32: 미계측 — ${u}`);
  console.log(`SIZENAMING_SUMMARY components=${checked} checked=${dChecked} violations=${violations.length} unmeasured=${unmeasured.length}`);
}

module.exports = { check };

if (require.main === module) {
  let bad = 0;
  const pass = (m) => console.log(`  ✅ ${m}`);
  const warn = (m) => console.log(`  ⚠️  ${m}`);
  const fail = (m) => { bad++; console.log(`  ❌ ${m}`); };
  console.log('🔎 [Gate 32] 크기이름 검사기 (Size Naming Consistency)');
  check({ pass, warn, fail }).then(() => process.exit(bad > 0 ? 1 : 0)).catch((e) => { console.error(`  ❌ 실행 실패: ${e.message}`); process.exit(1); });
}
