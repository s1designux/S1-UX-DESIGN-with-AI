#!/usr/bin/env node
/**
 * Component Anatomy Check (Gate 11)
 * ─────────────────────────────────────────────────────────────────────────
 * build-components.ts 빌더가 각 상태(variant)에서 **반드시 포함해야 하는 하위 요소**
 * (예: Focus 상태의 입력 커서 "caret", selected 상태의 삭제 아이콘 "clear")를
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
 *
 * 사각지대 보강 (2026-10-19, project-status 0-Z 가):
 *   빌더는 부품마다 try/catch 로 예외를 삼키고 계속 간다(failed[] 에 모음). 종전 이 검사기는
 *   ANATOMY 에 적힌 8개 세트만 찾았고 예외(threw)는 경고였다 — 세트가 통째로 사라져도 초록이었다.
 *   이제 ① buildAllComponents 가 던지면 ❌ ② 반환값 failed[]·noRunner[] 가 비어 있지 않으면 ❌
 *   ③ 실제로 만들어진 세트 목록 ↔ 기대치(COMPONENT_CATEGORIES_GRID members 전부)를 대조해 빠진 것이 있으면 ❌.
 *   (기대치에 없는 보조 세트 — 예: GNB 가 함께 만드는 "GNB Menu" — 는 문제 삼지 않는다.)
 *
 * BOOLEAN 속성 결속 (2026-10-19, component-verifier 13차 관찰):
 *   addComponentProperty(…, "BOOLEAN") 로 만든 스위치가 어느 레이어의 visible 에도 묶이지 않으면
 *   Figma 에서 켜고 꺼도 아무 일도 안 일어난다. 종전 mock 은 findChild/findOne 을 빈 stub 로 돌려줘
 *   결속 대입이 그냥 사라졌고, 그래서 어느 게이트도 이걸 볼 수 없었다. 이제 mock 이 실제 기록 트리에서
 *   찾아 주고 componentPropertyReferences 대입을 기록한다 → 스위치마다 "묶인 레이어가 1개 이상"인지 ❌ 판정.
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
  { set: "Input",        variant: /(^|,\s*)State=Focus(,|$)/,   require: ["caret", "remove"], label: "Input / State=Focus" },
  // Search Input 상태 4→3(Default/Filled/Disabled) 로 축소(river D4, 2026-09-04) — Focus 행을 뺐고
  // 검색창 caret 도 함께 뺐다(웹 :focus-within 로만 표시). 값 있음(Filled) 이 이제 지우기+돋보기를 낸다.
  { set: "Search Input", variant: /(^|,\s*)State=Filled(,|$)/,  require: ["remove", "search"], label: "Search Input / State=Filled" },
  // 텍스트에리어 Focus 는 커서만 — 삭제(remove) 아이콘 미포함(사용자 결정 2026-06-19).
  { set: "Text Area",    variant: /(^|,\s*)State=Focus(,|$)/,   require: ["caret"],          forbid: ["remove"], label: "Text Area / State=Focus" },
  // Select Box Open 은 Dropdown 컴포넌트 인스턴스 사용 — raw "list" 프레임 금지(2026-06-19).
  { set: "Select Box",   variant: /(^|,\s*)State=Open(,|$)/,    require: [],                 forbid: ["list"],   label: "Select Box / State=Open" },
  // Time Picker Focus 는 TPD 인스턴스 사용 — raw "dropdown" 프레임 금지(2026-06-19).
  { set: "Time Picker",  variant: /(^|,\s*)State=Focus(,|$)/,   require: [],                 forbid: ["dropdown"],       label: "Time Picker / State=Focus" },
  // Filter Chip Selected 는 Dropdown 인스턴스 사용 — raw "list" 프레임 금지(2026-06-23).
  { set: "Filter Chip",  variant: /(^|,\s*)State=Selected(,|$)/, require: [],                forbid: ["list"],           label: "Filter Chip / State=Selected" },
  // Date Picker Open 은 Calendar 인스턴스 사용 — raw "calendar-panel" 프레임 금지(2026-06-23).
  { set: "Date Picker",  variant: /(^|,\s*)State=Open(,|$)/,     require: [],                forbid: ["calendar-panel"], label: "Date Picker / State=Open" },
  // Bottom Sheet 본문은 네이티브 Content Slot이어야 하며, 구 raw list 프레임으로 돌아가면 안 된다.
  { set: "Bottom Sheet", variant: /(^|,\s*)Footer=(None|Single|Dual)(,|$)/, require: ["Content"], forbid: ["list"], label: "Bottom Sheet / Content Slot" },
];

// ── 만능 auto-stub (콜러블 + 모든 prop) — 미목 API 호출이 throw 하지 않게 ─────
let slotPropertyCounter = 0;

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
// 서브트리 탐색(findChild/findOne/findAll) — 판정 함수에는 실제 노드(proxy)를 넘긴다.
function findIn(state, pred, deep, all) {
  const hits = [];
  const walk = (st) => {
    for (const ch of st.children || []) {
      const px = ch.__proxy;
      let ok = false;
      if (px) { try { ok = !!pred(px); } catch (_) { ok = false; } }
      if (ok) { hits.push(px); if (!all) return true; }
      if (deep && walk(ch) && !all) return true;
    }
    return false;
  };
  walk(state);
  // 기록 트리에서 못 찾으면 종전처럼 만능 stub 을 돌려준다 — 라이브러리 인스턴스(importComponentByKeyAsync)
  //   처럼 mock 이 속을 모르는 노드가 있어서, null 을 주면 빌더가 실제 Figma 에선 안 나는 실패로 빠진다.
  //   대신 stub 에 한 결속 대입은 기록되지 않으므로 BOOLEAN 검사에서 "안 묶임"으로 드러난다(안전한 방향).
  if (hits.length === 0) return makeStub();
  return all ? hits : hits[0];
}

let propCounter = 0;

function recNode(type) {
  const state = { type, name: undefined, children: [], componentPropertyDefinitions: {}, booleanProps: [], propRefs: null, visible: true };
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
      if (prop === "componentPropertyDefinitions") return state.componentPropertyDefinitions;
      if (prop === "appendChild") return pushChild;
      if (prop === "insertChild") return (_i, c) => pushChild(c);
      if (prop === "findChild") return (pred) => findIn(state, pred, false, false);
      if (prop === "findOne") return (pred) => findIn(state, pred, true, false);
      if (prop === "findAll") return (pred) => findIn(state, pred || (() => true), true, true);
      if (prop === "findChildren") return (pred) => findIn(state, pred || (() => true), false, true);
      if (prop === "componentPropertyReferences") return state.propRefs;
      if (prop === "visible") return state.visible;
      if (prop === "addComponentProperty") {
        return (propName, propType, defaultValue) => {
          const id = `${propName}#mock:${++propCounter}`;
          state.componentPropertyDefinitions[id] = { type: propType, defaultValue };
          if (propType === "BOOLEAN") state.booleanProps.push({ id, name: propName });
          return id;
        };
      }
      if (prop === "createSlot" && state.type === "COMPONENT") {
        return () => {
          // 슬롯이 둘 이상인 컴포넌트(List Row 의 왼쪽 칸 + 오른쪽 칸)를 위해 **호출마다 다른 키**를 준다.
          //   종전에는 고정 키("Slot#mock")라 두 번째 슬롯이 첫 번째를 덮어써, 빌더의 슬롯 확인이
          //   "새 슬롯 없음"으로 보고 던졌고 그 컴포넌트가 통째로 검사에서 빠졌다(조용한 실패).
          //   생성기 쪽 mock(scripts/lib/figma-build-mock.js)은 이미 같은 방식으로 일련번호를 쓴다.
          state.componentPropertyDefinitions[`Slot#mock:${++slotPropertyCounter}`] = { type: "SLOT", defaultValue: "" };
          return recNode("SLOT");
        };
      }
      if (prop === "editComponentProperty") return (propertyName) => propertyName;
      if (prop === "then") return undefined;
      if (prop === Symbol.toPrimitive) return () => 0;
      if (prop === Symbol.iterator) return undefined;
      if (["width", "height", "x", "y", "length", "strokeWeight", "cornerRadius", "fontSize"].includes(prop)) return 0;
      return makeStub();
    },
    set(_t, prop, val) {
      if (prop === "name") state.name = val;
      if (prop === "visible") state.visible = val;
      if (prop === "componentPropertyReferences") state.propRefs = val;
      return true;
    },
  };
  const px = new Proxy(function () {}, handler);
  state.__proxy = px;
  return px;
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
    foundationColor: new Proxy({}, { get: () => makeStub() }),
    foundationNumber: new Proxy({}, { get: () => makeStub() }),
    textStyles: new Proxy({}, { get: () => makeStub() }),
    semanticColorCollectionId: "cid",
    semanticLightModeId: "light",
    semanticDarkModeId: "dark",
  };

  let threw = null;
  let result = null;
  const bc = loadBuildComponents();
  try {
    result = await bc.buildAllComponents(maps);
  } catch (e) {
    threw = e && e.message ? e.message : String(e);
  }

  const violations = [];

  // ── ① 빌드 자체가 던졌나 · 건별 실패/빌더 없음이 있나 ───────────────────
  if (threw) violations.push({ label: "빌드 전체", kind: "threw", detail: `buildAllComponents 가 중간에 멈춤: ${threw}` });
  for (const f of (result && result.failed) || []) {
    violations.push({ label: f.name, kind: "failed", detail: `빌드 중 예외로 세트를 만들지 못함: ${f.reason}` });
  }
  for (const n of (result && result.noRunner) || []) {
    violations.push({ label: n, kind: "no-runner", detail: "members 에 있는데 빌더가 없음" });
  }

  // ── ② 만들어진 세트 목록 ↔ 기대치(COMPONENT_CATEGORIES_GRID members) ─────
  const builtNames = new Set(sets.map((s) => s.__state.name));
  const expected = [];
  for (const row of bc.COMPONENT_CATEGORIES_GRID || []) for (const cat of row) for (const m of cat.members) expected.push(m);
  if (expected.length === 0) violations.push({ label: "기대치", kind: "no-expected", detail: "COMPONENT_CATEGORIES_GRID 에서 부품 목록을 0개 읽음 (selector 부패 의심)" });
  const reported = new Set([...((result && result.failed) || []).map((f) => f.name), ...((result && result.noRunner) || [])]);
  for (const m of expected) {
    if (!builtNames.has(m) && !reported.has(m)) violations.push({ label: m, kind: "vanished", detail: `기대 부품 "${m}" 의 세트가 빌드 결과에 없음 (조용히 사라짐)` });
  }

  // ── ③ BOOLEAN 스위치가 실제 레이어에 묶였나 ──────────────────────────
  const boolChecks = [];
  for (const set of sets) {
    for (const bp of set.__state.booleanProps) {
      let bound = 0;
      const walk = (st) => {
        if (st.propRefs && st.propRefs.visible === bp.id) bound++;
        for (const ch of st.children || []) walk(ch);
      };
      walk(set.__state);
      boolChecks.push({ set: set.__state.name, name: bp.name, bound });
      if (bound === 0) violations.push({ label: `${set.__state.name} / ${bp.name}`, kind: "bool-unbound", detail: `BOOLEAN 스위치 "${bp.name}" 이 어느 레이어 visible 에도 묶이지 않음 (켜고 꺼도 변화 없음)` });
    }
  }

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

  return { violations, checked: ANATOMY.length, setsFound: sets.length, expected: expected.length, boolChecks, threw };
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
    if (r.violations.length === 0) {
      console.log(`  ✅ ${r.checked}개 규칙 전부 충족 — 필수 하위 요소(caret·clear 등) 누락 0 · 기대 부품 ${r.expected}개 전부 생성 · BOOLEAN 스위치 ${r.boolChecks.length}개 전부 결속\n`);
      process.exit(0);
    }
    for (const v of r.violations) console.error(`  ❌ [${v.label}] ${v.detail}`);
    console.error(`\n  ${r.violations.length}건 — 빌더 결과에 빠진 부품·하위 요소·결속이 있음\n`);
    process.exit(1);
  })();
}
