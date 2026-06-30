#!/usr/bin/env node
/**
 * variant-coverage-check.js  (Gate 19 — 변형/상태 커버리지, Level 2)
 * ─────────────────────────────────────────────────────────────────────────
 * "HTML 각 컴포넌트 섹션이 설치기가 만드는 '상태(State)'를 다 보여주나?"를 기계 대조한다.
 * 정본 = 설치기 build-components.ts 변형의 State 축(esbuild+recording mock 으로 실측).
 *
 * ★ 예방 원리(겉핥기·거짓 단정 차단): 검사기가 **자기 커버리지를 스스로 선언**한다 —
 *   섹션이 data-cov-states 로 옵트인하면 그 섹션은 '상태 검증'되고, 안 하면 '미계측'으로 **명시 보고**한다.
 *   → "다 됐다"는 거짓 완전성을 구조적으로 못 만든다(Gate 17 '추출 0건=안됨' 과 같은 사상).
 *
 * 판정:
 *   ❌ FAIL  data-cov-states 선언 섹션인데 설치기 State 중 누락(installerStates ⊄ declared)
 *   ℹ️ INFO  미계측 섹션(data-cov-states 없음) — 차단 아님, 갯수 명시
 *
 * 선언 형식(HTML): <section ... id="dropdown" data-cov-states="default,hover,selected,disabled">
 * 출력 끝줄: `VARCOV_SUMMARY mains=<n> verified=<n> uninstrumented=<n> missing=<n>`
 * 사용: node scripts/variant-coverage-check.js  (npm run components:variantcov)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const HTML = path.join(ROOT, 'pages/components-new.html');
const CFG = path.join(ROOT, 'registry/governance/component-page-coverage.json');

// ── recording mock (Gate 11/anatomy 와 동일 검증된 구조) ─────────────────────
function makeStub() {
  return new Proxy(function () {}, { get(_t, p) { if (p === 'then') return undefined; if (p === Symbol.iterator) return undefined; if (p === 'children') return []; if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0; return makeStub(); }, set() { return true; }, apply() { return makeStub(); } });
}
function recNode(type) {
  const state = { type, name: undefined, children: [] };
  const push = (c) => { state.children.push(c && c.__state ? c.__state : { type: '?', name: undefined, children: [] }); return c; };
  return new Proxy(function () {}, { get(_t, p) { if (p === '__state') return state; if (p === 'type') return state.type; if (p === 'name') return state.name; if (p === 'children') return state.children; if (p === 'appendChild') return push; if (p === 'insertChild') return (_i, c) => push(c); if (p === 'then') return undefined; if (p === Symbol.iterator) return undefined; if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0; return makeStub(); }, set(_t, p, v) { if (p === 'name') state.name = v; return true; } });
}

// 변형 이름 "Size=MD, State=Default, …" → 축별 값. State 값들을 컴포넌트별로 수집.
function installerStateMatrix() {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `bc-varcov-${process.pid}.cjs`);
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
    try { delete require.cache[tmp]; const mod = require(tmp); await mod.buildAllComponents(maps); } catch (e) { /* 변형은 throw 전까지 수집됨 */ }
    try { fs.unlinkSync(tmp); } catch (_) {}
    const matrix = {};
    for (const s of sets) {
      const st = s.__state; if (!st || !st.name) continue;
      const states = new Set();
      for (const v of st.children) {
        if (!v.name) continue;
        for (const pair of v.name.split(',')) {
          const [k, val] = pair.split('=').map((x) => x.trim());
          if (k && val && k.toLowerCase() === 'state') states.add(val.toLowerCase());
        }
      }
      if (states.size) matrix[st.name] = states;
    }
    return matrix;
  })();
}

function htmlSectionStates() {
  const t = fs.readFileSync(HTML, 'utf8');
  const map = {}; // id → Set(declared states) | null(미선언)
  for (const m of t.matchAll(/<section\b[^>]*\bid="([a-z0-9-]+)"[^>]*>/g)) {
    const tag = m[0];
    const idm = /\bid="([a-z0-9-]+)"/.exec(tag);
    const cov = /\bdata-cov-states="([^"]*)"/.exec(tag);
    if (!idm) continue;
    map[idm[1]] = cov ? new Set(cov[1].split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)) : null;
  }
  return map;
}

(async () => {
  const cfg = JSON.parse(fs.readFileSync(CFG, 'utf8'));
  const sectionFor = cfg.sectionFor || {};
  const stateSource = cfg.stateSource || {};
  const matrix = await installerStateMatrix();
  const htmlStates = htmlSectionStates();

  // 섹션 id → 상태 정본 컴포넌트 (기본=sectionFor 역매핑 main, 예외=stateSource)
  const sidToComp = {};
  for (const [comp, sid] of Object.entries(sectionFor)) if (!sidToComp[sid]) sidToComp[sid] = comp;
  for (const [sid, comp] of Object.entries(stateSource)) sidToComp[sid] = comp;

  const targets = [...new Set(Object.values(sectionFor))]; // 검사 대상 HTML 섹션(=main 연결 섹션)
  let verified = 0, uninstrumented = 0; const missing = []; const uninstr = [];
  for (const sid of targets) {
    const comp = sidToComp[sid];
    const instStates = matrix[comp];
    if (!instStates || !instStates.size) continue; // State 축 없는 컴포넌트(단일상태)는 대상 외
    const declared = htmlStates[sid];
    if (declared == null) { uninstrumented++; uninstr.push(`${sid} (정본 ${comp})`); continue; }
    const miss = [...instStates].filter((s) => !declared.has(s));
    if (miss.length) missing.push(`${sid}: 설치기 State [${miss.join(', ')}] 가 HTML data-cov-states 에 없음 (정본 ${comp})`);
    else verified++;
  }

  console.log('[Gate 19] 변형/상태 커버리지 — 설치기 State 축 ↔ HTML data-cov-states');
  console.log(`  상태축 보유 컴포넌트 섹션 ${verified + uninstrumented + missing.length} · ✅검증 ${verified} · ℹ️미계측 ${uninstrumented} · ❌누락 ${missing.length}`);
  if (missing.length) { console.log('  ❌ 상태 누락(선언했는데 설치기 상태를 못 덮음):'); missing.forEach((m) => console.log('     -', m)); }
  if (uninstr.length) { console.log('  ℹ️ 미계측(data-cov-states 미선언 — 상태검증 안 됨, 정직 보고):'); uninstr.forEach((u) => console.log('     -', u)); }
  console.log(`VARCOV_SUMMARY mains=${verified + uninstrumented + missing.length} verified=${verified} uninstrumented=${uninstrumented} missing=${missing.length}`);
  process.exit(missing.length ? 1 : 0);
})();
