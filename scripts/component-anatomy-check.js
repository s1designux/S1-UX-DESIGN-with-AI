#!/usr/bin/env node
/**
 * Component Anatomy Check (Gate 11)
 * ─────────────────────────────────────────────────────────────────────────
 * build-components.ts 빌더가 각 상태(variant)에서 **반드시 포함해야 하는 하위 요소**
 * (예: Editing 상태의 입력 커서 "caret", selected 상태의 삭제 아이콘 "clear")를
 * 실제로 생성하는지 기계 검증한다.
 *
 * 왜 필요한가 (도입 사유 2026-06-19):
 *   기존 게이트는 전부 **토큰**만 본다 — 키 존재(8)·색 바인딩(3)·값 동기화(7)·커버리지(6).
 *   컴포넌트의 **구조(하위 요소 유무)** 를 보는 게이트가 하나도 없었다. 그래서
 *   ① 1px 입력 커서(caret), ② icon=on 축의 삭제(close) 아이콘 처럼 "작거나 보조 축에
 *   있는" 하위 요소가 빌더에서 누락돼도 모든 게이트가 ✅ 였다(Input·Search Input 2회 유출).
 *   → 상태별 필수 하위 요소를 manifest 로 1회 선언하면, 이 게이트가 영구 강제한다.
 *
 * 방법 (정적 추측 불가 → 실제 실행, Gate 8 과 동일 전략):
 *   1. esbuild 로 build-components.ts 를 CJS 번들.
 *   2. **노드 트리를 기록하는** mock figma 로 buildAllComponents 를 실행.
 *   3. combineAsVariants 로 만들어진 각 컴포넌트 세트를 순회하며, manifest 의
 *      (세트명·variant 정규식·필수 이름들) 대로 하위 요소 존재를 대조.
 *   - 매칭되는 variant 가 0개면 selector 부패로 보고 ❌ (Gate 7 "추출 0건=안됨" 과 동일 사상).
 *
 * 확장: 새 필수 하위 요소가 생기면 아래 ANATOMY 에 한 줄 추가하면 된다.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BC = path.join(ROOT, "plugins/figma-vars-installer/src/build-components.ts");

// ── 상태별 필수 하위 요소 manifest (정본) ───────────────────────────────
// set:     combineAsVariants 후 세트 이름
// variant: 해당 규칙을 적용할 variant(컴포넌트) 이름 정규식
// require: 그 variant 서브트리에 반드시 존재해야 하는 노드 이름들
// 아이콘 노드는 role 이름으로 기록됨(makeIconInstance): 삭제 아이콘 = "remove", 돋보기 = "search" 등.
const ANATOMY = [
  { set: "Input",        variant: /(^|,\s*)State=Editing(,|$)/, require: ["caret", "remove"], label: "Input / State=Editing" },
  { set: "Search Input", variant: /(^|,\s*)State=Focus(,|$)/,   require: ["caret", "remove", "search"], label: "Search Input / State=Focus" },
  // 텍스트에리어 Focus 는 커서만 — 삭제(remove) 아이콘 미포함(사용자 결정 2026-06-19).
  { set: "Text Area",    variant: /(^|,\s*)State=Focus(,|$)/,   require: ["caret"],          forbid: ["remove"], label: "Text Area / State=Focus" },
  // Select Box Open 은 Dropdown 컴포넌트 인스턴스 사용 — raw "list" 프레임 금지(2026-06-19).
  { set: "Select Box",   variant: /(^|,\s*)State=Open(,|$)/,    require: [],                 forbid: ["list"],   label: "Select Box / State=Open" },
  // Time Picker Focus 는 TPD 인스턴스 사용 — raw "dropdown" 프레임 금지(2026-06-19).
  { set: "Time Picker",  variant: /(^|,\s*)State=Focus(,|$)/,   require: [],                 forbid: ["dropdown"], label: "Time Picker / State=Focus" },
];

// ── 만능 auto-stub (콜러블 + 모든 prop) — 미목 API 호출이 throw 하지 않게 ─────
function makeStub() {
  const f = function () { return makeStub(); };
  return new Proxy(f, {
    get(_t, prop) {
      if (prop === "then") return undefined;
      if (prop === Symbol.toPrimitive) return () => 0;
      if (prop === Symbol.iterator) return undefined;
      if (prop === "children") return [];
      if (["width", "height", "x", "y", "length", "strokeWeight", "cornerRadius", "fontSize"].includes(prop)) return 0;
      return makeStub();
    },
    set() { return true; },
    apply() { return makeStub(); },
  });
}

// ── 노드 트리를 기록하는 recording 노드 ─────────────────────────────────
// { type, name, children:[state...] } 를 보유. 알 수 없는 prop/method 는 makeStub 로 폴백.
function recNode(type) {
  const state = { type, name: undefined, children: [] };
  const pushChild = (c) => {
    state.children.push(c && c.__state ? c.__state : { type: "?", name: undefined, children: [] });
    return c;
  };
  const handler = {
    get(_t, prop) {
      if (prop === "__state") return state;
      if (prop === "type") return state.type;
      if (prop === "name") return state.name;
      if (prop === "children") return state.children;
      if (prop === "appendChild") return pushChild;
      if (prop === "insertChild") return (_i, c) => pushChild(c);
      if (prop === "then") return undefined;
      if (prop === Symbol.toPrimitive) return () => 0;
      if (prop === Symbol.iterator) return undefined;
      if (["width", "height", "x", "y", "length", "strokeWeight", "cornerRadius", "fontSize"].includes(prop)) return 0;
      return makeStub();
    },
    set(_t, prop, val) {
      if (prop === "name") state.name = val;
      return true;
    },
  };
  return new Proxy(function () {}, handler);
}

// ── build-components.ts 를 CJS 로 번들해서 require ───────────────────────
function loadBuildComponents() {
  const esbuild = require("esbuild");
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: "cjs", platform: "node", write: false });
  const tmp = path.join(os.tmpdir(), `bc-anatomy-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try {
    delete require.cache[tmp];
    return require(tmp);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) { /* noop */ }
  }
}

// 서브트리 전체의 노드 이름 집합 수집
function collectNames(stateNode, acc) {
  for (const ch of stateNode.children || []) {
    if (ch.name) acc.add(ch.name);
    collectNames(ch, acc);
  }
  return acc;
}

async function audit() {
  const sets = [];
  const figmaObj = {
    createFrame: () => recNode("FRAME"),
    createComponent: () => recNode("COMPONENT"),
    createRectangle: () => recNode("RECTANGLE"),
    createText: () => recNode("TEXT"),
    createEllipse: () => recNode("ELLIPSE"),
    createLine: () => recNode("LINE"),
    createVector: () => recNode("VECTOR"),
    createNodeFromSvg: () => recNode("FRAME"),
    combineAsVariants: (comps) => {
      const set = recNode("COMPONENT_SET");
      for (const c of comps) set.appendChild(c);
      sets.push(set);
      return set;
    },
    loadFontAsync: async () => {},
    // 라이브러리 컴포넌트 import → 인스턴스. 인스턴스를 recNode 로 만들어 name("clear") 기록 가능하게.
    importComponentByKeyAsync: async () => ({ createInstance: () => recNode("INSTANCE") }),
    currentPage: recNode("PAGE"),
  };
  global.figma = new Proxy(figmaObj, { get: (t, p) => (p in t ? t[p] : makeStub()) });

  const maps = {
    semanticColor: new Proxy({}, { get: () => makeStub() }),
    foundationNumber: new Proxy({}, { get: () => makeStub() }),
    textStyles: new Proxy({}, { get: () => makeStub() }),
    semanticColorCollectionId: "cid",
    semanticLightModeId: "light",
    semanticDarkModeId: "dark",
  };

  let threw = null;
  const bc = loadBuildComponents();
  try {
    await bc.buildAllComponents(maps);
  } catch (e) {
    threw = e && e.message ? e.message : String(e);
  }

  const violations = [];
  for (const rule of ANATOMY) {
    const set = sets.find((s) => s.__state.name === rule.set);
    if (!set) { violations.push({ label: rule.label, kind: "no-set", detail: `세트 "${rule.set}" 를 빌더가 생성하지 않음` }); continue; }
    const variants = set.__state.children.filter((c) => typeof c.name === "string" && rule.variant.test(c.name));
    if (variants.length === 0) { violations.push({ label: rule.label, kind: "no-variant", detail: `정규식 ${rule.variant} 에 매칭되는 variant 0개 (selector 부패 의심)` }); continue; }
    for (const v of variants) {
      const names = collectNames(v, new Set());
      const missing = (rule.require || []).filter((n) => !names.has(n));
      if (missing.length) violations.push({ label: rule.label, kind: "missing", detail: `variant "${v.name}" 에 누락: ${missing.join(", ")}` });
      const present = (rule.forbid || []).filter((n) => names.has(n));
      if (present.length) violations.push({ label: rule.label, kind: "forbidden", detail: `variant "${v.name}" 에 있으면 안 되는 요소: ${present.join(", ")}` });
    }
  }

  return { violations, checked: ANATOMY.length, setsFound: sets.length, threw };
}

module.exports = { audit };

// ── CLI ─────────────────────────────────────────────────────────────────
if (require.main === module) {
  (async () => {
    console.log("\n[Component Anatomy] build-components.ts 상태별 필수 하위 요소");
    let r;
    try {
      r = await audit();
    } catch (e) {
      console.error(`  ❌ 검사 실행 실패: ${e.message}`);
      process.exit(1);
    }
    if (r.threw) console.warn(`  ⚠️  buildAllComponents 예외(로직): ${r.threw}`);
    if (r.violations.length === 0) {
      console.log(`  ✅ ${r.checked}개 규칙 전부 충족 — 필수 하위 요소(caret·clear 등) 누락 0\n`);
      process.exit(0);
    }
    for (const v of r.violations) console.error(`  ❌ [${v.label}] ${v.detail}`);
    console.error(`\n  ${r.violations.length}건 — 빌더가 필수 하위 요소를 생성하지 않음\n`);
    process.exit(1);
  })();
}
