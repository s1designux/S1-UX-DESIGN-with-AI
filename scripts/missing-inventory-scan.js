#!/usr/bin/env node
/**
 * missing-inventory-scan.js — "가지고 있다고 말하는 것" ↔ "실제로 쓸 수 있게 나와 있는 것" 차이 세기 (결정론)
 * ─────────────────────────────────────────────────────────────────────────────
 * ★ 무엇을 푸는가: 디자인시스템이 선언한 것과 소비자에게 실제로 나간 것 사이의 구멍을
 *   세 축으로 기계가 센다. 손으로 세면 매번 숫자가 달라진다(2026-08-24 재고조사 = 42개 기준, 지금은 49개).
 *
 * ★ 세 축:
 *   ① 정본 세트 ↔ 웹 배포본   (registry/components/component-facts.json ↔ ui-library/dist)
 *   ② registry ↔ 웹 배포본     (registry/components/*.json ↔ ui-library/dist)
 *   ③ 문서가 약속한 대체물 ↔ 부품 (registry/governance/density-policy.json 의 mobileSubstitutes)
 *
 * ★ 판정하지 않는다 — **사실만 센다.** 정본에만 있는 이름이 「속부품인가·화면 크롬인가·진짜 빠졌나」는
 *   기계가 못 가른다. 이 스크립트는 후보와 근거(선택자·파일)를 내놓고, 판정은 사람(⭐)이 한다.
 *
 * 출력: 사람용 표 + reports/missing-inventory-audit/inventory-scan.json
 * 사용: node scripts/missing-inventory-scan.js [--json]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FACTS = path.join(ROOT, 'registry/components/component-facts.json');
const DIST = path.join(ROOT, 'ui-library/dist');
const REG_DIR = path.join(ROOT, 'registry/components');
const MIGRATION = path.join(ROOT, 'registry/governance/ui-library-migration.json');
const DENSITY = path.join(ROOT, 'registry/governance/density-policy.json');
const COVERAGE = path.join(ROOT, 'registry/governance/component-page-coverage.json');
const OUT = path.join(ROOT, 'reports/missing-inventory-audit/inventory-scan.json');

// registry/components 안에서 컴포넌트가 아닌 파일 (생성물·색인)
const NON_COMPONENT = new Set(['component-facts', 'component-guide-model', 'component-behavior.pc', 'index']);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// ── ① 정본 세트 ────────────────────────────────────────────────
function canonSets() {
  return Object.keys(readJson(FACTS).components);
}

// ── ② 웹 배포본 ────────────────────────────────────────────────
function distComponents() {
  const dir = path.join(DIST, 'components');
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.manifest.json'))
    .map((f) => f.replace('.manifest.json', ''))
    .sort();
}

// 배포본 CSS·JS 에 실제로 선언된 data-s1-part 값 → 어느 컴포넌트가 가지고 있나
function distParts() {
  const dir = path.join(DIST, 'components');
  const map = new Map();          // part → Set(component)
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(css|js)$/.test(f)) continue;
    const comp = f.replace(/\.(css|js)$/, '');
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const re = /data-s1-part="([a-z0-9-]+)"/g;
    let m;
    while ((m = re.exec(src))) {
      if (!map.has(m[1])) map.set(m[1], new Set());
      map.get(m[1]).add(comp);
    }
  }
  return map;
}

// 정본 세트 이름 ↔ 웹 컴포넌트 id 가 낱말만 다른 자리. 이름이 다를 뿐 같은 것이므로 선언한다.
// 선언마다 **무엇을 보고 같다고 했는지**를 적는다 — 근거 없는 줄은 넣지 않는다.
const NAME_ALIAS = {
  'Text Area':            { web: 'textarea',     evidence: 'ui-library/dist/components/textarea.manifest.json rootSelector [data-s1-component="textarea"]' },
  'Select Box':           { web: 'select',       evidence: 'ui-library/dist/components/select.manifest.json rootSelector [data-s1-component="select"] · sizes xxsm/xsm/md = 정본 Size 축' },
  'Line Tab Set':         { web: 'tab',          evidence: 'ui-library/dist/examples/tab.html 루트 [data-s1-component="tab"] role=tablist = 정본 Set 컨테이너' },
  'Line Tab':             { web: 'tab',          evidence: 'ui-library/dist/examples/tab.html data-s1-part="tab" role=tab = 정본 셀' },
  'Search Input':         { web: 'input',        evidence: 'ui-library/dist/components/input.css:13 [data-mode="search"] · examples/input.search.html' },
  'Dropdown List':        { web: 'dropdown',     evidence: 'ui-library/dist/components/dropdown.css data-s1-part="option" = 정본 옵션 행' },
  'Multi Toggle Element': { web: 'multi-toggle', evidence: 'ui-library/dist/components/multi-toggle.css data-s1-part="cell" = 정본 셀' },
  'Time Picker Dropdown': { web: 'time-picker',  evidence: 'ui-library/dist/components/time-picker.css data-s1-part="panel"·"wheel-col" = 정본 드롭다운 패널' },
  'Time Picker Cell':     { web: 'time-picker',  evidence: 'ui-library/dist/components/time-picker.css data-s1-part="wheel-cell"' },
  'Table Cell':           { web: 'table',        evidence: 'ui-library/dist/components/table.css data-s1-part="cell"·"header-cell" = 정본 Type(Cell/Header) 축' },
  'Pagination Cell':      { web: 'pagination',   evidence: 'ui-library/dist/examples/pagination.html data-s1-part="page"(Number) · data-icon="edge"(Edge) · data-icon="chevron"(Arrow) = 정본 Element 축 3종' },
  'Calendar':             { web: 'date-picker',  evidence: 'ui-library/dist/components/date-picker.css data-s1-part="calendar"' },
  'Calendar Cell':        { web: 'date-picker',  evidence: 'ui-library/dist/components/date-picker.css data-s1-part="cell"' },
  'Calendar Tile':        { web: 'date-picker',  evidence: 'ui-library/dist/components/date-picker.css data-s1-part="tile"' },
  'Date Picker Mobile Bottom Sheet': { web: 'date-picker', evidence: 'ui-library/dist/components/date-picker.css data-s1-part="sheet"·"sheet-panel"' },
  'Time Picker Mobile Bottom Sheet': { web: 'time-picker', evidence: 'ui-library/dist/components/time-picker.css data-s1-part="sheet"·"sheet-panel"' },
  'GNB Menu':             { web: 'gnb',          evidence: 'ui-library/dist/components/gnb.css data-s1-part="menu"' },
  'GNB Utility Icon':     { web: 'gnb',          evidence: 'ui-library/dist/components/gnb.css data-s1-part="util"·"account"·"notification"' },
  'Language Icon':        { web: 'gnb',          evidence: 'ui-library/dist/components/gnb.css data-s1-part="lang"·"lang-icon"·"lang-label"' },
};

// 정본 세트 이름의 갈래 — **이 스크립트가 정하지 않는다.**
// 정본 = registry/governance/component-page-coverage.json (Gate 18 의 정본, river 결정이 들어 있다).
//   sectionFor        → 단독 컴포넌트로 취급되는 것
//   noSectionNeeded   → 사유가 함께 적혀 있다: "Platform/Shell"(화면 크롬) · "요소"(속부품) · 그 외
// 둘 다 없으면 '미분류' — 그것 자체가 구멍이다(Gate 18·32 가 경고).
function coverageIndex() {
  const cov = readJson(COVERAGE);
  const idx = new Map();
  for (const [name, section] of Object.entries(cov.sectionFor || {})) {
    idx.set(name, { kind: 'standalone', section, reason: '' });
  }
  for (const n of cov.noSectionNeeded || []) {
    const r = n.reason || '';
    const kind = /Platform\/Shell/.test(r) ? 'screen-chrome'
      : /^요소/.test(r) ? 'sub-part'
      : 'other';
    idx.set(n.name, { kind, section: null, reason: r });
  }
  return idx;
}

// 정본 세트 이름 → 웹에서 찾아볼 낱말(흔적 추적용 · 매핑 선언이 아니다)
function probeWords(setName) {
  const slug = setName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const words = new Set([slug, slug.replace(/-/g, '')]);
  const tail = slug.split('-').pop();
  if (tail) words.add(tail);
  return [...words];
}

// ── ③ registry ────────────────────────────────────────────────
function registryComponents() {
  return fs.readdirSync(REG_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .filter((id) => !NON_COMPONENT.has(id))
    .sort();
}

// ── ④ 문서가 약속한 대체물 ────────────────────────────────────
function promisedSubstitutes() {
  const d = readJson(DENSITY).mobileSubstitutes || {};
  return Object.entries(d)
    .filter(([k]) => !k.startsWith('_'))
    .map(([id, v]) => ({
      forComponent: id,
      promised: v.use,
      libraryStatus: v.libraryStatus,
      libraryNote: v.libraryNote || '',
    }));
}

// ── ⑤ 토큰 지도 커버리지 ──────────────────────────────────────
function tokenMapCoverage(dist) {
  const map = readJson(path.join(DIST, 'component-token-map.json'));
  const declared = Object.keys(map.components || {});
  return {
    declared,
    undeclared: dist.filter((c) => !declared.includes(c)),
    policy: map.policy,
  };
}

function main() {
  const canon = canonSets();
  const dist = distComponents();
  const parts = distParts();
  const registry = registryComponents();
  const migration = readJson(MIGRATION).records.filter((r) => r.kind === 'core-component').map((r) => r.id);

  // 정본 세트를 갈래별로 센다. 갈래는 component-page-coverage.json 이 정한다(이 스크립트가 아니다).
  const cov = coverageIndex();
  const classified = [];
  for (const name of canon) {
    const words = probeWords(name);
    const alias = NAME_ALIAS[name];
    // 정확한 slug 우선 — 그러지 않으면 'Filter Chip' 의 끝낱말 'chip' 이 먼저 잡힌다.
    const exact = words[0];
    const asComponent = alias && dist.includes(alias.web)
      ? [alias.web]
      : dist.includes(exact) ? [exact] : dist.filter((c) => words.includes(c));
    const asPart = [];
    for (const w of words) {
      if (parts.has(w)) asPart.push({ part: w, owners: [...parts.get(w)].sort() });
    }
    const c = cov.get(name) || { kind: 'unclassified', section: null, reason: '' };
    classified.push({
      canonSet: name,
      coverageKind: c.kind,
      coverageReason: c.reason,
      webComponent: asComponent[0] || null,
      webEvidence: alias ? alias.evidence : (asComponent[0] ? `ui-library/dist/components/${asComponent[0]}.manifest.json (이름 일치)` : null),
      partTrace: asPart,
      probeWords: words,
    });
  }
  // '진짜 빠진 것' 후보 = 단독 취급인데 웹 컴포넌트가 없다 / 미분류 / 속부품인데 흔적도 없다
  // 구멍 = 웹에 대응 컴포넌트가 선언되지 않은 것. 화면 크롬(river 2026-06-30 제외 결정)은 세지 않는다.
  // part 흔적만 있는 것은 '부모 안에 들어 있다'는 뜻이라, 단독으로 쓰라고 하는 것(standalone·other)에는 대응물로 치지 않는다.
  const gaps = classified.filter((c) =>
    c.coverageKind !== 'screen-chrome' && (!c.webComponent || c.coverageKind === 'unclassified'));

  const registryOnly = registry.filter((r) => !dist.includes(r));
  const distOnly = dist.filter((d) => !registry.includes(d));
  const migrationOnly = migration.filter((m) => !dist.includes(m));

  const report = {
    _meta: {
      generated: true,
      generator: 'scripts/missing-inventory-scan.js',
      generatedAt: new Date().toISOString().slice(0, 10),
      sources: [
        'registry/components/component-facts.json',
        'ui-library/dist/components/*.manifest.json',
        'ui-library/dist/components/*.{css,js}',
        'registry/components/*.json',
        'registry/governance/ui-library-migration.json',
        'registry/governance/density-policy.json',
        'ui-library/dist/component-token-map.json',
      ],
      caveat: '판정하지 않는다. canonOnly 는 "정본 이름으로 웹 컴포넌트를 못 찾은 것"일 뿐 "빠진 것"이 아니다 — 속부품·화면 크롬이 섞여 있다.',
    },
    counts: {
      canonSets: canon.length,
      distComponents: dist.length,
      registryComponents: registry.length,
      gapCandidates: gaps.length,
      registryOnly: registryOnly.length,
      distOnly: distOnly.length,
    },
    canonSets: canon,
    distComponents: dist,
    classified,
    gapCandidates: gaps,
    registryOnly,
    distOnly,
    migrationLedgerNotInDist: migrationOnly,
    promisedSubstitutes: promisedSubstitutes(),
    tokenMapCoverage: tokenMapCoverage(dist),
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n');

  if (process.argv.includes('--json')) { console.log(JSON.stringify(report, null, 2)); return; }

  console.log('\n🔎 빠진 재고 스캔 (Missing Inventory)\n');
  console.log(`  정본 세트 ${canon.length} · 웹 배포본 ${dist.length} · registry ${registry.length}`);
  const byKind = {};
  for (const c of classified) byKind[c.coverageKind] = (byKind[c.coverageKind] || 0) + 1;
  console.log(`\n  ■ 정본 세트 갈래 (component-page-coverage.json 이 정한 것)`);
  console.log(`     단독 ${byKind.standalone || 0} · 속부품 ${byKind['sub-part'] || 0} · 화면크롬 ${byKind['screen-chrome'] || 0} · 그 밖 ${byKind.other || 0} · 미분류 ${byKind.unclassified || 0}`);
  console.log(`\n  ■ 구멍 후보 ${gaps.length}개`);
  for (const c of gaps) {
    const trace = c.partTrace.length
      ? c.partTrace.map((t) => `part "${t.part}" ⊂ ${t.owners.join('·')}`).join(' / ')
      : '웹 흔적 없음';
    console.log(`     · ${c.canonSet.padEnd(30)} [${c.coverageKind}] ${trace}`);
  }
  console.log(`\n  ■ registry 에만 있음 ${registryOnly.length}개: ${registryOnly.join(', ') || '없음'}`);
  console.log(`  ■ 웹에만 있음 ${distOnly.length}개: ${distOnly.join(', ') || '없음'}`);
  console.log(`  ■ 이행 장부에 있으나 배포본에 없음: ${migrationOnly.join(', ') || '없음'}`);

  console.log('\n  ■ 문서가 약속한 모바일 대체물');
  for (const s of promisedSubstitutes()) {
    const mark = s.libraryStatus === 'missing-component' ? '❌ 부품 없음' : '✅ 있음';
    console.log(`     · ${s.forComponent} → ${s.promised}  ${mark}`);
  }

  const tm = tokenMapCoverage(dist);
  console.log(`\n  ■ 토큰 지도(component-token-map.json) 선언 ${tm.declared.length}/${dist.length}`);
  console.log(`     선언 없음: ${tm.undeclared.join(', ') || '없음'}`);
  console.log(`\n  → ${path.relative(ROOT, OUT)}\n`);
}

main();
