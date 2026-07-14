#!/usr/bin/env node
/**
 * Token Role Check (Gate 22)
 * ─────────────────────────────────────────────────────────────────────────
 * "토큰 이름에 맞는 요소에만 그 토큰이 쓰였나" 를 기계 검증한다.
 * 1차 규칙(핵심): **글자(TEXT) 노드의 색은 글자 역할 토큰만** — text/* · label/* · number/* 만 허용.
 *   border/* · bg/* · surface/* 를 글자색으로 쓰면 ❌ 차단. icon/* 는 예외 허용목록에만.
 *
 * 왜 필요한가 (도입 사유 2026-07-13):
 *   Input 안내메시지 글자색이 form-control/border/error·border/correct(테두리 토큰)에
 *   연결돼 있었는데, 기존 게이트는 전부 "설치기·HTML·문서의 값이 서로 일치하나"만 봤다.
 *   → 셋이 **똑같이 틀리면** 게이트가 ✅ 통과. "이 토큰이 이 요소에 맞는 역할인가"를
 *   보는 검사가 없어서, 글자에 테두리 토큰을 쓴 오연결이 동기화로 조용히 퍼졌다.
 *   이 게이트는 그 역할-불일치를 커밋 단계에서 영구 차단한다.
 *
 * 방법 (Gate 8·11 과 동일 전략 — 정적 추측 불가, 실제 실행):
 *   1. esbuild 로 build-components.ts 를 CJS 번들.
 *   2. mock figma 로 buildAllComponents 실행 — 단, semanticColor/foundationColor 를
 *      "토큰 키를 태그로 심은" 가짜 변수로 만들고, setBoundVariableForPaint 가 그 키를
 *      paint 에 실어, 노드의 fills/strokes 세터가 노드별 바인딩 토큰을 기록하게 한다.
 *   3. 기록된 TEXT 노드를 순회하며 fill 토큰의 역할을 대조.
 *   - TEXT 노드가 하나도 안 잡히면 selector 부패로 보고 ❌ (Gate 7 "추출 0건=안됨" 사상).
 *
 * 확장: 예외는 아래 TEXT_TOKEN_ALLOW 에 (글자·토큰·사유) 한 줄 추가.
 *       새 규칙(예: stroke 는 border/* 만)은 후속 확장 슬롯.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BC = path.join(ROOT, "plugins/figma-vars-installer/src/build-components.ts");

// ── 예외 허용목록 (글자에 비-글자 토큰을 의도적으로 쓰는 곳) ────────────────
// 글자 색이 옆 아이콘 색과 맞아야 하는 소수 케이스. 각 항목은 사유 필수.
const TEXT_TOKEN_ALLOW = [
  { chars: "29",     token: "color/icon/gray",      reason: "GNB 알림 배지 카운트 — 옆 종 아이콘색(icon/gray)에 맞춤" },
  { chars: "한국어",  token: "color/icon/gray-dark", reason: "GNB 언어 라벨 — 지구본 아이콘색(icon/gray-dark)에 맞춤" },
];

// 역할 판정: 토큰 경로 세그먼트에 어떤 역할 단어가 있나.
const TEXT_ROLES = ["text", "label", "number"]; // 글자에 허용 (number=페이지번호 등 숫자 글자 color/pagination/number/*)
const NONTEXT_ROLES = ["border", "bg", "surface"]; // 글자에 금지(핵심 차단)
const ICON_ROLE = "icon";                     // 글자에 금지하되 허용목록만 통과

function segs(token) { return String(token).split("/"); }
function hasSeg(token, word) { return segs(token).includes(word); }

// TEXT fill 토큰 판정 → { ok, kind, role }
function classifyTextFill(token, chars) {
  // 허용목록 우선
  if (TEXT_TOKEN_ALLOW.some((a) => a.chars === chars && a.token === token)) return { ok: true, kind: "allowed" };
  for (const r of NONTEXT_ROLES) if (hasSeg(token, r)) return { ok: false, kind: "nontext-role", role: r };
  if (hasSeg(token, ICON_ROLE)) return { ok: false, kind: "icon-on-text", role: "icon" };
  for (const r of TEXT_ROLES) if (hasSeg(token, r)) return { ok: true, kind: "text-role", role: r };
  return { ok: true, kind: "unknown-role" }; // 알 수 없는 역할 = 통과(오탐 방지), 아래서 경고 집계
}

// ── 만능 auto-stub ───────────────────────────────────────────────────────
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

// ── 노드 기록 (type·chars·fillToken·strokeToken·children) ──────────────────
const REC = []; // 생성된 모든 노드 state
function tokenOfPaints(val) {
  if (!Array.isArray(val)) return undefined;
  for (const p of val) { if (p && p.__token) return p.__token; }
  return undefined;
}
function recNode(type) {
  const state = { type, name: undefined, chars: undefined, fillToken: undefined, strokeToken: undefined, children: [] };
  REC.push(state);
  const pushChild = (c) => { state.children.push(c && c.__state ? c.__state : { type: "?", children: [] }); return c; };
  const handler = {
    get(_t, prop) {
      if (prop === "__state") return state;
      if (prop === "type") return state.type;
      if (prop === "name") return state.name;
      if (prop === "characters") return state.chars;
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
      else if (prop === "characters") state.chars = val;
      else if (prop === "fills") { const t = tokenOfPaints(val); if (t) state.fillToken = t; }
      else if (prop === "strokes") { const t = tokenOfPaints(val); if (t) state.strokeToken = t; }
      return true;
    },
  };
  return new Proxy(function () {}, handler);
}

// 토큰 키를 태그로 심은 가짜 변수 맵 (scv/requireVar 는 map[key] 로 접근)
function taggedVarMap() {
  return new Proxy({}, {
    get(_t, key) {
      if (typeof key !== "string") return undefined;
      return { __tokenKey: key };
    },
  });
}

function loadBuildComponents() {
  const esbuild = require("esbuild");
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: "cjs", platform: "node", write: false });
  const tmp = path.join(os.tmpdir(), `bc-role-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try { delete require.cache[tmp]; return require(tmp); }
  finally { try { fs.unlinkSync(tmp); } catch (_) { /* noop */ } }
}

async function audit() {
  REC.length = 0;
  const variables = new Proxy(
    { setBoundVariableForPaint: (paint, _field, v) => ({ ...paint, __token: v && v.__tokenKey }) },
    { get: (t, p) => (p in t ? t[p] : makeStub()) }
  );
  const figmaObj = {
    createFrame: () => recNode("FRAME"),
    createComponent: () => recNode("COMPONENT"),
    createRectangle: () => recNode("RECTANGLE"),
    createText: () => recNode("TEXT"),
    createEllipse: () => recNode("ELLIPSE"),
    createLine: () => recNode("LINE"),
    createVector: () => recNode("VECTOR"),
    createNodeFromSvg: () => recNode("FRAME"),
    combineAsVariants: (comps) => { const set = recNode("COMPONENT_SET"); for (const c of comps) set.appendChild(c); return set; },
    loadFontAsync: async () => {},
    importComponentByKeyAsync: async () => ({ createInstance: () => recNode("INSTANCE") }),
    variables,
    currentPage: recNode("PAGE"),
  };
  global.figma = new Proxy(figmaObj, { get: (t, p) => (p in t ? t[p] : makeStub()) });

  const maps = {
    semanticColor: taggedVarMap(),
    foundationColor: taggedVarMap(),
    foundationNumber: taggedVarMap(),
    textStyles: new Proxy({}, { get: () => makeStub() }),
    semanticColorCollectionId: "cid",
    semanticLightModeId: "light",
    semanticDarkModeId: "dark",
  };

  let threw = null;
  const bc = loadBuildComponents();
  try { await bc.buildAllComponents(maps); }
  catch (e) { threw = e && e.message ? e.message : String(e); }

  const textNodes = REC.filter((n) => n.type === "TEXT" && n.fillToken);
  const violations = [];
  const warnings = [];
  const usedAllow = new Set();
  for (const n of textNodes) {
    const r = classifyTextFill(n.fillToken, n.chars);
    if (r.kind === "allowed") { usedAllow.add(`${n.chars} ${n.fillToken}`); continue; }
    if (!r.ok) {
      violations.push({ chars: n.chars, token: n.fillToken, kind: r.kind, role: r.role });
    } else if (r.kind === "unknown-role") {
      warnings.push({ chars: n.chars, token: n.fillToken, note: "역할 판정 불가(text/label/number/border/bg/surface/icon 세그먼트 없음)" });
    }
  }
  // stale 허용목록 (더 이상 매칭 안 되는 예외)
  const staleAllow = TEXT_TOKEN_ALLOW.filter((a) => !usedAllow.has(`${a.chars} ${a.token}`));

  // 중복 제거(변형이 많아 같은 (글자·토큰) 조합이 수십 번)
  const dedup = (arr, keyf) => { const m = new Map(); for (const x of arr) { const k = keyf(x); if (!m.has(k)) m.set(k, x); } return [...m.values()]; };
  return {
    textNodeCount: textNodes.length,
    violations: dedup(violations, (v) => `${v.chars} ${v.token}`),
    warnings: dedup(warnings, (w) => `${w.chars} ${w.token}`),
    staleAllow,
    threw,
  };
}

module.exports = { audit };

// ── CLI ─────────────────────────────────────────────────────────────────
if (require.main === module) {
  (async () => {
    console.log("\n[Token Role] 글자 요소에 글자 역할 토큰만 쓰였나 (build-components.ts)");
    let r;
    try { r = await audit(); }
    catch (e) { console.error(`  ❌ 검사 실행 실패: ${e.message}`); process.exit(1); }
    if (r.threw) console.warn(`  ⚠️  buildAllComponents 예외(로직): ${r.threw}`);
    if (r.textNodeCount === 0) {
      console.error("  ❌ 토큰 바인딩된 TEXT 노드 0개 — selector 부패 의심(빌더 미실행/미록). 검사 신뢰 불가.");
      process.exit(1);
    }
    for (const w of r.warnings) console.warn(`  ⚠️  역할 미상 글자색: "${w.chars}" ← ${w.token} (${w.note})`);
    for (const s of r.staleAllow) console.warn(`  ⚠️  허용목록 stale(더 이상 미매칭): "${s.chars}" ← ${s.token} — 정리 후보`);
    if (r.violations.length === 0) {
      console.log(`  ✅ 글자색 역할 위반 0 — TEXT ${r.textNodeCount}개 검사, 비-글자 토큰(border/bg/surface/icon) 오연결 없음\n`);
      process.exit(0);
    }
    console.error(`  ❌ 글자에 비-글자 토큰 오연결 ${r.violations.length}건:`);
    for (const v of r.violations) {
      const why = v.kind === "icon-on-text"
        ? `아이콘 토큰을 글자에 사용 — 허용목록(TEXT_TOKEN_ALLOW)에 사유와 함께 등록하거나 글자 토큰으로 교체`
        : `${v.role}/* 는 ${v.role === "border" ? "테두리" : v.role} 역할 토큰 — 글자엔 text/* 또는 label/* 사용`;
      console.error(`     · "${v.chars}" ← ${v.token}  (${why})`);
    }
    console.error("");
    process.exit(1);
  })();
}
