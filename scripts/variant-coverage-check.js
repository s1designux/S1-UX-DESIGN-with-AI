#!/usr/bin/env node
/**
 * variant-coverage-check.js  (Gate 19 — 변형 커버리지, Level 2 · v2 전 축)
 * ─────────────────────────────────────────────────────────────────────────
 * "HTML 각 컴포넌트 섹션이 설치기가 만드는 변형의 **모든 축(State·Size·Variant·Break·
 *  Label·Message·Title·Pressed·Selected …)** 값을 다 보여주나"를 기계 대조한다.
 * 정본 = 설치기 build-components.ts 변형 이름(esbuild+recording mock 실측)의 `Key=Value` 축.
 *
 * ★ 예방 원리(겉핥기·거짓 단정 차단): 검사기가 (섹션×축)별 **검증 / 미계측 / 누락**을 스스로 선언한다.
 *   섹션이 `data-cov-<axis>` (또는 복수형 `data-cov-<axis>s`)로 옵트인하면 그 축이 검증되고,
 *   안 하면 '미계측'으로 명시 보고 → "다 됐다"는 거짓 완전성을 구조적으로 못 만든다.
 *
 * 판정: ❌FAIL = 옵트인 축인데 설치기 값 누락. ℹ️미계측 = 미선언 (섹션×축) — 차단 아님, 갯수 명시.
 * 내부 축(position 등 사용자 비대면)은 IGNORE_AXES 로 제외.
 *
 * 출력 끝줄: `VARCOV_SUMMARY pairs=<n> verified=<n> uninstrumented=<n> missing=<n>`
 * 사용: node scripts/variant-coverage-check.js  (npm run components:variantcov)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const HTML = path.join(ROOT, 'pages/components-new.html');
const CFG = path.join(ROOT, 'registry/governance/component-page-coverage.json');

const IGNORE_AXES = new Set(['position', 'break']); // position=요소 내부 / break=PC·Mobile 는 platform 토글이 담당(별도)

function makeStub() {
  return new Proxy(function () {}, { get(_t, p) { if (p === 'then') return undefined; if (p === Symbol.iterator) return undefined; if (p === 'children') return []; if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0; return makeStub(); }, set() { return true; }, apply() { return makeStub(); } });
}
function recNode(type) {
  const state = { type, name: undefined, children: [] };
  const push = (c) => { state.children.push(c && c.__state ? c.__state : { type: '?', name: undefined, children: [] }); return c; };
  return new Proxy(function () {}, { get(_t, p) { if (p === '__state') return state; if (p === 'type') return state.type; if (p === 'name') return state.name; if (p === 'children') return state.children; if (p === 'appendChild') return push; if (p === 'insertChild') return (_i, c) => push(c); if (p === 'then') return undefined; if (p === Symbol.iterator) return undefined; if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0; return makeStub(); }, set(_t, p, v) { if (p === 'name') state.name = v; return true; } });
}

// {component: {axisKey(lower): Set(value(lower))}}
function installerAxisMatrix() {
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
    try { delete require.cache[tmp]; const mod = require(tmp); await mod.buildAllComponents(maps); } catch (e) {}
    try { fs.unlinkSync(tmp); } catch (_) {}
    const matrix = {};
    for (const s of sets) {
      const st = s.__state; if (!st || !st.name) continue;
      const axes = matrix[st.name] || (matrix[st.name] = {});
      for (const v of st.children) {
        if (!v.name) continue;
        for (const pair of v.name.split(',')) {
          const [k, val] = pair.split('=').map((x) => x && x.trim());
          if (!k || !val) continue;
          const ak = k.toLowerCase();
          if (IGNORE_AXES.has(ak)) continue;
          (axes[ak] || (axes[ak] = new Set())).add(val.toLowerCase());
        }
      }
    }
    return matrix;
  })();
}

// 섹션 태그의 data-cov-<axis> / data-cov-<axis>s 선언 수집
function htmlSectionCov() {
  const t = fs.readFileSync(HTML, 'utf8');
  const map = {};
  for (const m of t.matchAll(/<section\b[^>]*\bid="([a-z0-9-]+)"[^>]*>/g)) {
    const tag = m[0]; const id = /\bid="([a-z0-9-]+)"/.exec(tag)[1];
    const cov = {};
    for (const a of tag.matchAll(/\bdata-cov-([a-z]+)="([^"]*)"/g)) {
      let axis = a[1]; if (axis.endsWith('s')) axis = axis.replace(/s$/, ''); // states→state, sizes→size …
      cov[axis] = new Set(a[2].split(',').map((x) => x.trim().toLowerCase()).filter(Boolean));
    }
    map[id] = cov;
  }
  return map;
}

(async () => {
  const cfg = JSON.parse(fs.readFileSync(CFG, 'utf8'));
  const sectionFor = cfg.sectionFor || {};
  const axisSource = cfg.axisSource || cfg.stateSource ? Object.assign({}, cfg.stateSource ? Object.fromEntries(Object.entries(cfg.stateSource).map(([k, v]) => [k, [v]])) : {}, cfg.axisSource || {}) : {};
  const matrix = await installerAxisMatrix();
  const htmlCov = htmlSectionCov();

  const sidMain = {}; // 섹션 → main 컴포넌트(reverse sectionFor)
  for (const [comp, sid] of Object.entries(sectionFor)) if (!sidMain[sid]) sidMain[sid] = comp;

  const targets = [...new Set(Object.values(sectionFor))];
  let verified = 0, uninstrumented = 0; const missing = []; const uninstr = [];
  for (const sid of targets) {
    // 이 섹션이 커버해야 할 축들 = main + axisSource 추가 컴포넌트들의 축 합집합
    const srcComps = [sidMain[sid], ...((axisSource[sid]) || [])].filter(Boolean);
    const axisVals = {}; // axis → Set(values) 합집합
    for (const c of srcComps) { const ax = matrix[c]; if (!ax) continue; for (const [k, set] of Object.entries(ax)) { (axisVals[k] || (axisVals[k] = new Set())); for (const x of set) axisVals[k].add(x); } }
    const cov = htmlCov[sid] || {};
    for (const [axis, vals] of Object.entries(axisVals)) {
      if (vals.size <= 1) continue; // 단일값 축은 검사 의미 없음(예: 단일 사이즈)
      const declared = cov[axis];
      if (!declared) { uninstrumented++; uninstr.push(`${sid}.${axis} (정본 [${[...vals].join(',')}])`); continue; }
      const miss = [...vals].filter((v) => !declared.has(v));
      if (miss.length) missing.push(`${sid}.${axis}: 설치기 [${miss.join(', ')}] 가 data-cov-${axis} 에 없음`);
      else verified++;
    }
  }

  const pairs = verified + uninstrumented + missing.length;
  console.log('[Gate 19] 변형 커버리지(전 축) — 설치기 변형 축 ↔ HTML data-cov-*');
  console.log(`  (섹션×축) ${pairs} · ✅검증 ${verified} · ℹ️미계측 ${uninstrumented} · ❌누락 ${missing.length}`);
  if (missing.length) { console.log('  ❌ 누락(선언했는데 설치기 값을 못 덮음):'); missing.forEach((m) => console.log('     -', m)); }
  if (uninstr.length) { console.log('  ℹ️ 미계측(data-cov-* 미선언 — 검증 안 됨, 정직 보고):'); uninstr.forEach((u) => console.log('     -', u)); }
  console.log(`VARCOV_SUMMARY pairs=${pairs} verified=${verified} uninstrumented=${uninstrumented} missing=${missing.length}`);
  process.exit(missing.length ? 1 : 0);
})();
