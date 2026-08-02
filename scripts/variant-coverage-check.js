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
 * 판정(2026-08-02 개편 — 래칫 도입):
 *   ✅검증   = 옵트인 축이고 설치기 값을 전부 덮음
 *   ❌FAIL   = **baseline 에 없는** 누락/미계측 (= 새로 생긴 공백)
 *   ℹ️동결   = baseline 에 사유와 함께 등재된 기존 공백 — 차단 안 함, 목록으로 계속 보임
 *
 * 왜 래칫인가 (2026-08-02 실측): 종전에는 부품(요소) 컴포넌트의 축을 상위 섹션 검사에 합산하는
 *   매핑이 **2건뿐**이라(multi-toggle·dropdown) 나머지 부품 15개의 표출 공백은 **계측 자체가 없었다.**
 *   그래서 "37/37 검증 · 미계측 0" 이라는 완전해 보이는 숫자가 나왔다. 매핑을 전수 등재하니
 *   누락 4 · 미계측 10 이 드러났다(달력 연/월·표 셀 상태·페이지네이션 칸 상태 등).
 *   전부 즉시 차단하면 마찰이 커져 우회를 부르므로, 기존 공백은 **사유와 함께 동결**하고
 *   **새 공백만 차단**한다(Gate 20/29 와 같은 원리). 동결분은 매 실행 목록으로 보인다.
 *
 * 부품 축 합산: registry/governance/component-page-coverage.json 의 `axisSource`
 *   (섹션 → 부품 컴포넌트 배열). 부품이 어느 상위에 속하는지는 BUILD_DEPENDENCIES/실제 부착 근거.
 * baseline: registry/governance/variant-coverage-baseline.json (`--update-baseline` 로 갱신)
 *
 * 출력 끝줄: `VARCOV_SUMMARY pairs=<n> verified=<n> baselined=<n> newGaps=<n> resolved=<n>`
 * 사용: node scripts/variant-coverage-check.js [--update-baseline]  (npm run components:variantcov)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const HTML = path.join(ROOT, 'pages/components.html');
const CFG = path.join(ROOT, 'registry/governance/component-page-coverage.json');

// break=PC·Mobile 은 platform 토글이 담당(섹션이 platform-section 으로 분리 표출).
//   position 은 2026-08-02 에 **무시 목록에서 뺐다** — 멀티토글에서 위치는 내부 구현이 아니라
//   테두리 규칙이 달라지는 실제 표출 축이고(선택 칸에 닿는 면의 보더를 뺀다), 퍼블리셔가
//   `--first/--middle/--last` 클래스로 칸 단위 조립을 한다. 무시하면 그 공백이 영영 안 보인다.
const IGNORE_AXES = new Set(['break']);
const BASELINE = path.join(ROOT, 'registry/governance/variant-coverage-baseline.json');

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
  let verified = 0; const gaps = [];   // gaps: {key, kind, detail}
  for (const sid of targets) {
    // 이 섹션이 커버해야 할 축들 = main + axisSource 추가 컴포넌트들의 축 합집합
    const srcComps = [sidMain[sid], ...((axisSource[sid]) || [])].filter(Boolean);
    const axisVals = {}; // axis → Set(values) 합집합
    for (const c of srcComps) { const ax = matrix[c]; if (!ax) continue; for (const [k, set] of Object.entries(ax)) { (axisVals[k] || (axisVals[k] = new Set())); for (const x of set) axisVals[k].add(x); } }
    const cov = htmlCov[sid] || {};
    for (const [axis, vals] of Object.entries(axisVals)) {
      if (vals.size <= 1) continue; // 단일값 축은 검사 의미 없음(예: 단일 사이즈)
      const key = `${sid}.${axis}`;
      const declared = cov[axis];
      if (!declared) { gaps.push({ key, kind: 'uninstrumented', detail: `정본 [${[...vals].join(',')}] — data-cov-${axis} 미선언` }); continue; }
      const miss = [...vals].filter((v) => !declared.has(v));
      if (miss.length) gaps.push({ key, kind: 'missing', detail: `설치기 [${miss.join(', ')}] 가 data-cov-${axis} 에 없음` });
      else verified++;
    }
  }

  // ── baseline 래칫 ────────────────────────────────────────────────────────
  const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : { knownGaps: [] };
  const known = new Map((baseline.knownGaps || []).map((g) => [g.key, g]));
  const baselined = gaps.filter((g) => known.has(g.key));
  const newGaps = gaps.filter((g) => !known.has(g.key));
  const seen = new Set(gaps.map((g) => g.key));
  const resolved = [...known.keys()].filter((k) => !seen.has(k));   // 해소됨 → baseline 축소 가능

  if (process.argv.includes('--update-baseline')) {
    const out = {
      _role: 'Gate 19 변형 커버리지 — 기존 공백 동결 목록. 여기 있는 (섹션×축)은 차단하지 않고 목록으로만 보인다.',
      _policy: [
        '새 공백은 차단된다 — 여기 넣으려면 왜 지금 못 채우는지 사유를 반드시 적는다.',
        '줄이는 방향으로만 갱신한다. 항목이 늘어나는 갱신은 그 자체가 검토 대상이다.',
        '해소된 항목은 --update-baseline 으로 빼면 다시 채워졌을 때 회귀가 차단된다.',
      ],
      _updated: new Date().toISOString().slice(0, 10),
      knownGaps: gaps.map((g) => Object.assign({}, g, { reason: (known.get(g.key) || {}).reason || 'TODO: 왜 지금 못 채우는지 적을 것' })),
    };
    fs.writeFileSync(BASELINE, JSON.stringify(out, null, 2) + '\n');
    console.log(`[Gate 19] baseline 갱신 — ${out.knownGaps.length}건 등재 (해소돼 빠진 항목 ${resolved.length}건)`);
    process.exit(0);
  }

  const pairs = verified + gaps.length;
  console.log('[Gate 19] 변형 커버리지(전 축) — 설치기 변형 축 ↔ HTML data-cov-*');
  console.log(`  (섹션×축) ${pairs} · ✅검증 ${verified} · ℹ️동결 ${baselined.length} · ❌신규공백 ${newGaps.length}`);
  if (newGaps.length) {
    console.log('  ❌ 새로 생긴 표출 공백(채우거나, 못 채우는 사유를 baseline 에 적을 것):');
    newGaps.forEach((g) => console.log(`     - NEWGAP [${g.kind}] ${g.key}: ${g.detail}`));
    console.log('     → 사유를 적고 동결하려면: node scripts/variant-coverage-check.js --update-baseline');
  }
  if (baselined.length) {
    console.log('  ℹ️ 동결된 기존 공백(차단 안 함 — 채우면 baseline 에서 빼기):');
    baselined.forEach((g) => console.log(`     - FROZEN [${g.kind}] ${g.key}: ${(known.get(g.key) || {}).reason || g.detail}`));
  }
  if (resolved.length) {
    console.log(`  ⚠️ baseline 중 ${resolved.length}건 해소됨 — 축소 갱신 권장: node scripts/variant-coverage-check.js --update-baseline`);
    resolved.forEach((k) => console.log('     -', k));
  }
  console.log(`VARCOV_SUMMARY pairs=${pairs} verified=${verified} baselined=${baselined.length} newGaps=${newGaps.length} resolved=${resolved.length}`);
  process.exit(newGaps.length ? 1 : 0);
})();
