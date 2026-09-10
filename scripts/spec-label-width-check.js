#!/usr/bin/env node
/**
 * spec-label-width-check.js — 스펙(설명용) 시트 라벨이 상자 폭을 넘는지 기계로 판정
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜 필요한가(2026-09-10):
 *   스펙 시트의 열 헤더·행 라벨은 **상자 폭이 고정**(makeLabel 의 resize(w, …) + textAutoResize="HEIGHT")이다.
 *   글자가 상자보다 넓으면 두 줄이 되고, 두 줄은 HEADER_H(24) 를 넘겨 **바로 아래 컴포넌트를 덮는다.**
 *   정본 텍스트 스타일로 옮기면서 라벨이 11→12 · 12B→14B 로 커졌을 때 실제로 2건이 넘쳤다.
 *   Figma 캔버스는 파일이 아니라 렌더로 못 잡으므로, **설치기를 mock 으로 돌려 라벨을 전수 수집하고
 *   설치된 Pretendard 의 advance width 로 폭을 재서** 판정한다.
 *
 * 판정: 라벨폭 > 상자폭 이면 ❌. 여유가 SAFETY_PX 미만이면 ⚠️(경고 — 글자 한 자만 늘어도 넘친다).
 *   커닝(GPOS)을 무시하므로 크롬 실측보다 **넓게** 나온다(292개 대조: 최대 +2.39px, 항상 파서 ≥ 크롬).
 *   과대평가 쪽이라 판정은 보수적이다 — 통과하면 실제로도 통과다.
 *
 * 사용: node scripts/spec-label-width-check.js [--verbose]
 * 종료코드: 0 통과(또는 폰트 없어 SKIP) · 1 넘침 있음
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const fm = require('./lib/font-metrics');

const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const VERBOSE = process.argv.includes('--verbose');
const SAFETY_PX = 2;

// ── build-components.ts 를 도는 최소 Figma mock — TEXT 노드의 (글자·상자폭·크기·굵기) 만 기록 ──
const labels = [];
function makeStub() {
  return new Proxy(function () {}, {
    apply: () => makeStub(),
    get(_t, p) {
      if (p === 'then' || p === Symbol.iterator) return undefined;
      if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0;
      return makeStub();
    },
    set() { return true; },
  });
}
function recNode(type) {
  const st = { type, chars: null, fontSize: null, style: null, w: null };
  if (type === 'TEXT') labels.push(st);
  return new Proxy(function () {}, {
    get(_t, p) {
      if (p === 'then' || p === Symbol.iterator) return undefined;
      if (p === 'type') return type;
      if (p === 'appendChild') return () => {};
      if (p === 'resize') return (w) => { st.w = w; };
      if (p === 'findAll') return () => [];
      if (p === 'findOne') return () => null;
      if (p === 'setTextStyleIdAsync') return async () => {};
      if (p === 'characters') return st.chars;
      if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0;
      return makeStub();
    },
    set(_t, p, v) {
      if (p === 'characters') st.chars = v;
      if (p === 'fontSize') st.fontSize = v;
      if (p === 'fontName' && v && v.style) st.style = v.style;
      return true;
    },
  });
}

function loadBuildComponents() {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `bc-labelwidth-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try { return require(tmp); } finally { try { fs.unlinkSync(tmp); } catch (e) { /* noop */ } }
}

/** makeLabel 이 실제로 쓰는 매핑과 같은 규칙 — 여기서 어긋나면 판정이 헛돈다. */
function specStyleKey(style) { return style === 'Bold' ? { px: 14, style: 'Bold' } : { px: 12, style: 'Medium' }; }

async function run() {
  const figmaObj = {
    createFrame: () => recNode('FRAME'), createComponent: () => recNode('COMPONENT'),
    createRectangle: () => recNode('RECTANGLE'), createText: () => recNode('TEXT'),
    createEllipse: () => recNode('ELLIPSE'), createLine: () => recNode('LINE'),
    createVector: () => recNode('VECTOR'), createNodeFromSvg: () => recNode('FRAME'),
    combineAsVariants: () => recNode('COMPONENT_SET'),
    loadFontAsync: async () => {},
    importComponentByKeyAsync: async () => ({ createInstance: () => recNode('INSTANCE') }),
    currentPage: recNode('PAGE'),
  };
  const orig = { warn: console.warn, log: console.log, error: console.error };
  console.warn = () => {}; console.log = () => {}; console.error = () => {};  // 빌더의 진행 로그는 삼킨다
  global.figma = new Proxy(figmaObj, { get: (t, p) => (p in t ? t[p] : makeStub()) });
  const maps = {
    semanticColor: new Proxy({}, { get: () => makeStub() }),
    foundationColor: new Proxy({}, { get: () => makeStub() }),
    foundationNumber: new Proxy({}, { get: () => makeStub() }),
    textStyles: new Proxy({}, { get: () => makeStub() }),
    semanticColorCollectionId: 'cid', semanticLightModeId: 'light', semanticDarkModeId: 'dark',
  };
  let threw = null;
  try { await loadBuildComponents().buildAllComponents(maps); } catch (e) { threw = e.message; }
  console.warn = orig.warn; console.log = orig.log; console.error = orig.error;

  // 스펙 라벨 = 상자 폭이 고정된 TEXT (makeLabel 만 resize 로 폭을 박는다)
  const seen = new Set();
  const rows = [];
  for (const l of labels) {
    if (!l.chars || !l.w || !l.style) continue;
    const key = `${l.chars}|${l.w}|${l.style}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const t = specStyleKey(l.style);
    const px = fm.measure(l.chars, t.px, t.style);
    if (px === null) return { skip: true };
    rows.push({ chars: l.chars, box: l.w, px: +px.toFixed(1), slack: +(l.w - px).toFixed(1), font: `${t.px}${t.style[0]}` });
  }
  return {
    threw,
    total: rows.length,
    over: rows.filter((r) => r.slack < 0),
    tight: rows.filter((r) => r.slack >= 0 && r.slack < SAFETY_PX),
    rows,
  };
}

module.exports = { run };

if (require.main === module) {
  (async () => {
    console.log('\n[Spec Label Width] 스펙 시트 라벨이 상자 폭을 넘는지');
    let r;
    try { r = await run(); } catch (e) { console.error(`  ❌ 검사 실행 실패: ${e.message}`); process.exit(1); }
    if (r.skip) {
      console.log('  ⚠️  Pretendard 가 이 컴퓨터에 설치돼 있지 않아 건너뜁니다(SKIP) — 폭 판정 불가\n');
      process.exit(0);
    }
    if (r.threw) console.warn(`  ⚠️  mock 빌드 예외(로직): ${r.threw}`);
    if (VERBOSE) for (const x of r.rows.slice().sort((a, b) => a.slack - b.slack).slice(0, 15)) {
      console.log(`     여유 ${String(x.slack).padStart(6)}px · 상자 ${x.box} · ${x.font} · "${x.chars}"`);
    }
    for (const x of r.tight) console.warn(`  ⚠️  여유 ${x.slack}px 뿐 — 상자 ${x.box} · "${x.chars}" (글자가 한 자만 늘어도 줄바꿈)`);
    if (r.over.length) {
      for (const x of r.over) console.error(`  ❌ 상자 폭 초과 ${-x.slack}px — 상자 ${x.box} · ${x.font} · "${x.chars}" → 그 스펙의 cellW/rowLabelW 를 넓히세요`);
      console.error(`  ❌ 라벨 ${r.total}개 중 ${r.over.length}개가 두 줄이 되어 아래 컴포넌트를 덮습니다\n`);
      process.exit(1);
    }
    console.log(`  ✅ 라벨 ${r.total}개 전부 한 줄 — 상자 폭 초과 0${r.tight.length ? ` (여유 ${SAFETY_PX}px 미만 ${r.tight.length}건은 경고)` : ''}\n`);
    process.exit(0);
  })();
}
