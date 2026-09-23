#!/usr/bin/env node
/**
 * token-sheets-check.js — 토큰 견본 시트(색·글자·숫자) 기계 검사
 *
 * 왜: 견본 시트는 설치할 때마다 **항상** 깔린다(river 결정 2026-09-22). 사람이 Figma 를 열어야만
 *     알 수 있는 실패(정본 토큰 개수 누락 · raw hex · 비정본 텍스트 스타일 · 판끼리 겹침)를
 *     빌드 단계에서 잡는다. 실제 빌더 코드를 모의 Figma 위에서 **돌려 보고** 결과 노드를 센다.
 *
 * 검사 항목:
 *   1) 정본 토큰 전건이 견본에 올라왔는가 (Foundation 색 · Semantic 색 Light/Dark · 텍스트 스타일 · 숫자)
 *   2) 모든 칠·선이 Variable 바인딩인가 (하드룰 H2 — raw hex 0건)
 *   3) 모든 글자가 Pretendard + 정본 텍스트 스타일 바인딩인가 (하드룰 H3)
 *   4) 시트 프레임끼리 겹치지 않는가 (겹치면 Figma 에서 판이 서로 가린다)
 *
 * 실행: node scripts/token-sheets-check.js   (npm run sheets:check)
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "plugins/figma-vars-installer/src");

// ── 모의 Figma 노드 ────────────────────────────────────────────────────────
let NODE_SEQ = 0;
class Node {
  constructor(type) {
    this.type = type;
    this.id = `n${++NODE_SEQ}`;
    this.name = "";
    this.children = [];
    this.parent = null;
    this.x = 0; this.y = 0; this.width = 0; this.height = 0;
    // Figma 는 프레임·사각형에 흰 칠을 기본으로 넣는다. 모의에서도 같게 둬야
    //   "빌더가 안 덮고 지나간 자리"가 raw 색으로 드러난다(🤖 component-verifier 지적 a-4).
    this.fills = (type === "FRAME" || type === "RECTANGLE" || type === "SECTION")
      ? [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }] : [];
    this.strokes = []; this.strokeWeight = 0;
    this.boundVariables = {};
    this.fontName = null; this.fontSize = 0; this.characters = "";
    this.textStyleId = null; this.textAutoResize = "NONE"; this.textAlignHorizontal = "LEFT";
    this.cornerRadius = 0; this.clipsContent = false;
    this.modes = {};
  }
  appendChild(n) { if (n.parent) n.parent.children = n.parent.children.filter((c) => c !== n); n.parent = this; this.children.push(n); }
  resize(w, h) { this.width = w; this.height = h; }
  resizeWithoutConstraints(w, h) { this.resize(w, h); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this); this.parent = null; }
  setBoundVariable(field, v) { this.boundVariables[field] = v; }
  async setTextStyleIdAsync(id) { this.textStyleId = id; }
  setExplicitVariableModeForCollection(cid, mid) { this.modes[cid] = mid; }
  get absoluteBoundingBox() {
    let x = this.x, y = this.y, p = this.parent;
    while (p && p.type !== "PAGE") { x += p.x; y += p.y; p = p.parent; }
    return { x, y, width: this.width, height: this.height };
  }
  findAll(fn) { const out = []; const walk = (n) => { for (const c of n.children) { if (fn(c)) out.push(c); walk(c); } }; walk(this); return out; }
}

let LOAD_SEQ = 0;
function loadModule(entry) {
  const esbuild = require("esbuild");
  const out = esbuild.buildSync({ entryPoints: [entry], bundle: true, format: "cjs", platform: "node", write: false });
  // 파일명을 매번 새로 준다 — 같은 경로를 재사용하면 require 캐시가 앞서 읽은 모듈을 그대로 돌려준다.
  const tmp = path.join(os.tmpdir(), `sheets-${process.pid}-${++LOAD_SEQ}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try { return require(tmp); } finally { try { fs.unlinkSync(tmp); } catch (e) { /* noop */ } }
}

/** 새 모의 페이지를 만들고 global.figma 를 거기에 연결한다(시나리오마다 새로). */
function mockPage() {
  const page = new Node("PAGE");
  // 실제 Figma 는 create* 하는 순간 노드를 현재 페이지에 붙인다. 모의도 같게 둬야
  //   "섹션에 안 담고 흘린 판"이 드러난다(🤖 component-verifier 9회차 P2).
  const attach = (n) => { page.appendChild(n); return n; };
  global.figma = {
    createFrame: () => attach(new Node("FRAME")),
    createRectangle: () => attach(new Node("RECTANGLE")),
    createText: () => attach(new Node("TEXT")),
    createSection: () => attach(new Node("SECTION")),
    loadFontAsync: async () => {},
    currentPage: page,
    variables: {
      setBoundVariableForPaint: (paint, field, v) => Object.assign({}, paint, { boundVariables: { [field]: { id: v.id, type: "VARIABLE_ALIAS" } } }),
    },
  };
  return page;
}

function varMapFor(names, kind) {
  const map = {};
  for (const n of names) map[n] = { id: `${kind}:${n}`, name: n, resolvedType: kind };
  return map;
}

// vars-data 는 TS 라 esbuild 로 읽는다.
async function main() {
  const varsData = loadModule(path.join(SRC, "vars-data.ts"));
  const textData = loadModule(path.join(SRC, "textstyles-data.ts"));

  const page = mockPage();

  // 이미 부품이 깔린 페이지를 모사한다 — 견본 판이 그 구역을 침범하는지 보기 위해.
  const existing = new Node("SECTION");
  existing.name = "Platform";
  existing.x = 0; existing.y = 0; existing.resize(4000, 3000);
  page.appendChild(existing);
  const existingLeft = 0, existingRight = 4000;

  // 행 들여쓰기는 빌더 정본에서 읽는다 — 숫자를 검사기에 박아 두면 여백을 바꿀 때 가짜로 막는다.
  const builderSrc = fs.readFileSync(path.join(SRC, "build-token-sheets.ts"), "utf8");
  const ROWS_INDENT = Number((builderSrc.match(/ROWS_INDENT\s*=\s*(\d+)/) || [])[1] || 12);

  // river 가 정한 것 — 빌더에서 읽되 **여기 적힌 정본과 같은지** 대조한다(목록을 줄여 검사를 끄는 것 차단).
  const TYPE_SAMPLE_CANON = "S-1 S/W UX 디자인가이드 타이포그래피";
  const COMMON_HEADS_CANON = ["color/bg", "color/surface", "color/text", "color/line", "color/icon", "color/overlay", "color/scroll"];
  const COMMON_HEADS = [...(builderSrc.match(/COMMON_SEMANTIC_HEADS = \[([^\]]*)\]/) || ["", ""])[1]
    .matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const TYPE_SAMPLE = ((builderSrc.match(/const TYPE_SAMPLE = "([^"]*)"/) || [])[1]) || "";

  // 밝은 판 / 어두운 판 가르기 — 계열 이름 끝이 `-dark` 인가(빌더와 같은 규칙).
  const isDarkKey = (k) => { const h = k.slice(0, k.indexOf("/")); return h.length > 5 && h.slice(-5) === "-dark"; };
  const FOUNDATION_KEYS = Object.keys(varsData.FOUNDATION_COLOR);
  const FOUNDATION_BY_MODE = { light: FOUNDATION_KEYS.filter((k) => !isDarkKey(k)), dark: FOUNDATION_KEYS.filter(isDarkKey) };
  const headOf2 = (k) => k.split("/").slice(0, 2).join("/");
  const COMMON_KEYS = Object.keys(varsData.SEMANTIC_COLOR).filter((k) => COMMON_HEADS.indexOf(headOf2(k)) >= 0);
  // 판마다 그 판의 별칭만 센다(빌더 semanticUsage 와 같은 규칙).
  const usageFor = (mode) => {
    const u = {};
    for (const k of Object.keys(varsData.SEMANTIC_COLOR)) {
      const alias = mode === "dark" ? varsData.SEMANTIC_COLOR[k].dark : varsData.SEMANTIC_COLOR[k].light;
      if (!alias || alias[0] === "#" || alias.indexOf("rgba") === 0) continue;
      u[alias] = (u[alias] || 0) + 1;
    }
    return u;
  };
  const USAGE = { light: usageFor("light"), dark: usageFor("dark") };
  const groupsOf = (keys, depth) => {
    const order = [], bag = {};
    for (const k of keys) {
      const parts = k.split("/");
      const head = depth === 1 ? parts[0] : parts.slice(0, 2).join("/");
      if (!bag[head]) { bag[head] = []; order.push(head); }
      bag[head].push(k);
    }
    return order.map((h) => ({ head: h, members: bag[h] }));
  };

  const sheets = loadModule(path.join(SRC, "build-token-sheets.ts"));
  const maps = {
    foundationColor: varMapFor(Object.keys(varsData.FOUNDATION_COLOR), "COLOR"),
    semanticColor: varMapFor(Object.keys(varsData.SEMANTIC_COLOR), "COLOR"),
    foundationNumber: varMapFor(Object.keys(varsData.FOUNDATION_NUMBER), "FLOAT"),
    semanticNumber: varMapFor(Object.keys(varsData.SEMANTIC_NUMBER), "FLOAT"),
    textStyles: (() => { const m = {}; for (const d of textData.TEXT_STYLES) m[d.name] = { id: `style:${d.name}`, name: d.name }; return m; })(),
    semanticColorCollectionId: "semantic-color",
    semanticLightModeId: "light",
    semanticLightModeNamed: true,
    semanticDarkModeId: "dark",
  };

  const result = await sheets.buildTokenSheets(maps);

  const errors = [];
  const notes = [];

  // ── 1) 정본 전건 수록 ──
  // river 결정 대조 — 목록·문구를 바꿔 검사를 무력화하는 것을 여기서 막는다.
  if (COMMON_HEADS.slice().sort().join(",") !== COMMON_HEADS_CANON.slice().sort().join(",")) {
    errors.push(`공통 역할색 묶음이 river 결정과 다릅니다: [${COMMON_HEADS.join(", ")}] ≠ [${COMMON_HEADS_CANON.join(", ")}]`);
  }
  if (TYPE_SAMPLE !== TYPE_SAMPLE_CANON) {
    errors.push(`글자 표본 문구가 river 지정과 다릅니다: "${TYPE_SAMPLE}" ≠ "${TYPE_SAMPLE_CANON}"`);
  }
  // 색 칸 = Foundation 전건(밝은 판+어두운 판) + 공통 역할색 두 벌.
  const expectSwatch = FOUNDATION_KEYS.length + COMMON_KEYS.length * 2;
  const expectStyles = textData.TEXT_STYLES.length;
  const expectNumbers = Object.keys(varsData.FOUNDATION_NUMBER).length + Object.keys(varsData.SEMANTIC_NUMBER).length;
  if (result.swatches !== expectSwatch) errors.push(`색 견본 칸 ${result.swatches} ≠ 정본 ${expectSwatch}`);
  if (result.styles !== expectStyles) errors.push(`글자 표본 ${result.styles} ≠ 정본 ${expectStyles}`);
  if (result.numbers !== expectNumbers) errors.push(`숫자 줄 ${result.numbers} ≠ 정본 ${expectNumbers}`);
  if (result.sections.length !== 4) errors.push(`시트 섹션 ${result.sections.length}장 (4장이어야 함 — 색 Light·색 Dark·글자·숫자)`);
  if (result.skipped.length) errors.push(`건너뛴 판: ${result.skipped.join(" · ")}`);

  // ── 2) raw 색 0건 (H2) ──
  // 검사 대상 = 견본 시트 섹션과 그 안의 모든 노드(모사해 둔 부품 섹션은 제외).
  const sheetSections = page.children.filter((n) => n.type === "SECTION" && n.name.indexOf("Tokens · ") === 0);
  const all = sheetSections.concat(...sheetSections.map((s0) => s0.findAll(() => true)));
  let rawPaint = 0;
  for (const n of all) {
    for (const key of ["fills", "strokes"]) {
      const arr = n[key];
      if (!Array.isArray(arr)) continue;
      for (const p of arr) {
        if (!p || p.type !== "SOLID") continue;
        if (!(p.boundVariables && p.boundVariables.color)) rawPaint++;
      }
    }
  }
  if (rawPaint) errors.push(`토큰에 안 걸린 색 ${rawPaint}건 (하드룰 H2 위반)`);

  // ── 3) 글자 = Pretendard + 정본 텍스트 스타일 (H3) ──
  const texts = all.filter((n) => n.type === "TEXT");
  const badFont = texts.filter((t) => !t.fontName || t.fontName.family !== textData.TEXT_STYLE_FONT_FAMILY);
  const noStyle = texts.filter((t) => !t.textStyleId);
  if (badFont.length) errors.push(`비-${textData.TEXT_STYLE_FONT_FAMILY} 글자 ${badFont.length}건 (하드룰 H3 위반)`);
  if (noStyle.length) errors.push(`정본 텍스트 스타일이 안 걸린 글자 ${noStyle.length}건 (하드룰 H3 위반)`);

  // ── 4) 시트 프레임끼리 겹침 없음 ──
  // 섹션 머리띠는 '판'이 아니다 — 이름이 같은 접두사로 시작하므로 여기서 갈라낸다.
  const frames = all.filter((n) => n.type === "FRAME" && n.name.indexOf("Tokens · ") === 0
    && n.name.indexOf("Section Header") < 0);

  // ── 판 ↔ 기대 낱말을 1:1 로 확정한다 ─────────────────────────────────────────
  //   판을 그때그때 `find(이름 포함)` 로 집으면, 한 판이 두 낱말을 한꺼번에 만족할 때
  //   다른 판이 통째로 검사 밖으로 빠진다(🤖 component-verifier 9회차 P7).
  //   여기서 한 번에 짝을 짓고, 짝이 1:1 이 아니면 그 자리에서 막는다.
  const EXPECTED_SHEETS = ["Foundation Light", "Foundation Dark", "Semantic Light", "Semantic Dark", "Typography", "Number"];
  const sheet = {};
  for (const want of EXPECTED_SHEETS) {
    const hit = frames.filter((f) => f.name.indexOf(want) >= 0);
    if (hit.length === 1) { sheet[want] = hit[0]; continue; }
    errors.push(hit.length === 0
      ? `판을 찾지 못했습니다: "${want}" — 판 이름이 바뀌면 그 판을 보는 검사들이 함께 꺼집니다`
      : `"${want}" 에 걸리는 판이 ${hit.length}장입니다 (${hit.map((f) => f.name).join(" / ")}) — 판과 이름은 1:1 이어야 합니다`);
  }
  for (const f of frames) {
    const hits = EXPECTED_SHEETS.filter((w) => f.name.indexOf(w) >= 0);
    if (hits.length !== 1) errors.push(`판 "${f.name}" 이 기대 이름 ${hits.length}개에 걸립니다 (${hits.join(", ") || "없음"})`);
  }
  if (frames.length !== EXPECTED_SHEETS.length) errors.push(`판이 ${frames.length}장 — 기대 ${EXPECTED_SHEETS.length}장과 다릅니다`);
  const semanticSheets = [sheet["Semantic Light"], sheet["Semantic Dark"]].filter(Boolean);
  const foundationSheets = [sheet["Foundation Light"], sheet["Foundation Dark"]].filter(Boolean);
  const modeOf = (f) => (f.name.indexOf("Dark") >= 0 ? "dark" : "light");
  // 섹션 밖에 떠 있는 견본 판 — 섹션에 안 담긴 판은 위 검사들의 사정거리 밖이라 조용히 산다.
  const loose = page.children.filter((n) => n.type !== "SECTION" && String(n.name).indexOf("Tokens · ") === 0);
  if (loose.length) errors.push(`섹션에 담기지 않은 견본 판 ${loose.length}장이 페이지에 떠 있습니다 (${loose.map((n) => n.name).join(" / ")})`);
  for (let i = 0; i < frames.length; i++) {
    for (let j = i + 1; j < frames.length; j++) {
      const a = frames[i].absoluteBoundingBox, b = frames[j].absoluteBoundingBox;
      const overlap = a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
      if (overlap) errors.push(`견본 판이 겹칩니다: "${frames[i].name}" ↔ "${frames[j].name}"`);
    }
  }

  // ── 5) 글자가 옆 칸을 침범하지 않는가 (폭은 어림값 — 한글 1자 ≈ 글자크기, 라틴 ≈ 0.55배) ──
  const styleSize = {};
  for (const d of textData.TEXT_STYLES) styleSize[`style:${d.name}`] = d.fontSize;
  const estWidth = (t) => {
    const size = styleSize[t.textStyleId] || t.fontSize || 12;
    let w = 0;
    for (const ch of String(t.characters)) w += /[\u3131-\uD79D]/.test(ch) ? size : size * 0.55;
    return w;
  };
  const byFrame = new Map();
  for (const t of texts) {
    let f = t.parent; while (f && f.type !== "FRAME") f = f.parent;
    if (!f) continue;
    if (!byFrame.has(f)) byFrame.set(f, []);
    byFrame.get(f).push(t);
  }
  for (const [f, list] of byFrame) {
    for (const t of list) {
      const right = t.x + (t.textAutoResize === "WIDTH_AND_HEIGHT" ? estWidth(t) : t.width);
      const size0 = styleSize[t.textStyleId] || t.fontSize || 12;
      if (right > f.width || t.y + size0 * 1.3 > f.height) {
        errors.push(`"${f.name}" 의 글자가 판 밖으로 나갑니다: "${t.characters.slice(0, 20)}"`);
        break;
      }
      // 같은 줄(세로 겹침)에서 오른쪽 이웃을 침범하는가
      // 같은 줄 판정 = 세로 구간이 겹치는가(글자마다 y 가 몇 px 어긋나 있어 단순 비교로는 못 잡는다).
      const vspan = (n) => { const sz = styleSize[n.textStyleId] || n.fontSize || 12; return [n.y, n.y + sz * 1.3]; };
      const [ta, tb] = vspan(t);
      const hit = list.find((o) => {
        if (o === t || o.x <= t.x || o.x >= right - 1) return false;
        const [oa, ob] = vspan(o);
        return ta < ob && oa < tb;
      });
      if (hit) { errors.push(`"${f.name}" 에서 글자가 옆 칸을 침범합니다: "${t.characters.slice(0, 16)}" → "${hit.characters.slice(0, 16)}"`); break; }
    }
  }

  // ── 6) 이미 깔린 부품 구역을 침범하지 않는가 ──
  //   부품 섹션은 x ≥ 0 에 깔린다. 견본 판은 그 왼쪽(음수 구역)에 통째로 있어야 한다.
  if (existingRight !== null) {
    for (const f of frames) {
      const b = f.absoluteBoundingBox;
      if (b.x + b.width > existingLeft) errors.push(`견본 판 "${f.name}" 이 이미 깔린 부품 구역을 침범합니다`);
    }
  }

  // 되감기 시험의 예외 주입 지점 — 판 구성이 바뀌면 고정 숫자는 범위 밖으로 나가 시험이 헛돈다.
  //   이번 설치가 실제로 만든 글자 수에서 앞/뒤 두 지점을 뽑는다(앞=색 판, 뒤=숫자 판 구간).
  const TOTAL_TEXTS = page.findAll((n) => n.type === "TEXT").length;
  const INJECT_POINTS = [Math.max(20, Math.round(TOTAL_TEXTS * 0.25)), Math.max(40, Math.round(TOTAL_TEXTS * 0.8))];
  if (TOTAL_TEXTS < 100) errors.push(`견본 글자가 ${TOTAL_TEXTS}개뿐입니다 — 판이 통째로 빠진 것으로 봅니다`);

  // ── 7) 재료가 없는 경우 · 두 번 깔기 (조용한 반쪽 · 겹쳐 쌓임 방지) ──
  const scenario = async (label, tweak, expect) => {
    const p2 = mockPage();
    const m2 = Object.assign({}, maps, tweak);
    let r2 = null, threw = null;
    try { r2 = await sheets.buildTokenSheets(m2); } catch (e) { threw = e.message; }
    if (threw) { errors.push(`[${label}] 예외로 멈춤: ${threw}`); return; }
    const secs = p2.children.filter((n) => n.type === "SECTION").length;
    const loose = p2.children.filter((n) => n.type !== "SECTION").length;
    if (loose) errors.push(`[${label}] 섹션 밖 낱개 노드 ${loose}개가 페이지에 남음`);
    expect(r2, secs, p2);
  };
  await scenario("Semantic 색 없음", { semanticColor: {} }, (r2, secs) => {
    if (secs !== 0) errors.push(`[Semantic 색 없음] 판을 ${secs}장 만들었습니다 — 만들지 않아야 합니다`);
    if (!r2.skipped.some((x) => x.indexOf("역할색") >= 0)) errors.push(`[Semantic 색 없음] 건너뛴 사유를 알리지 않음 (${JSON.stringify(r2.skipped)})`);
  });
  await scenario("텍스트 스타일 없음", { textStyles: {} }, (r2, secs) => {
    if (secs !== 0) errors.push(`[텍스트 스타일 없음] 판을 ${secs}장 만들었습니다 — raw 글꼴로 때우면 안 됩니다`);
    if (!r2.skipped.length) errors.push('[텍스트 스타일 없음] 건너뛴 사실을 알리지 않음');
  });
  await scenario("Dark 모드 없음", { semanticDarkModeId: "light" }, (r2, secs) => {
    // 색 Dark 섹션을 만들지 않으므로 3장(색 Light · 글자 · 숫자)이어야 한다.
    if (secs !== 3) errors.push(`[Dark 모드 없음] 섹션 ${secs}장 (3장이어야 함)`);
    if (!r2.skipped.some((x) => x.indexOf("Dark") >= 0)) errors.push('[Dark 모드 없음] 다크 판을 라이트 값으로 만들었거나 알리지 않음');
  });
  {
    const p3 = mockPage();
    await sheets.buildTokenSheets(maps);
    const first = p3.children.filter((n) => n.type === "SECTION").map((n) => n.absoluteBoundingBox.x);
    await sheets.buildTokenSheets(maps);
    const secs = p3.children.filter((n) => n.type === "SECTION");
    const loose = p3.children.filter((n) => n.type !== "SECTION").length;
    if (secs.length !== 4) errors.push(`[두 번 깔기] 섹션 ${secs.length}장 — 옛 판이 겹쳐 쌓였습니다`);
    if (loose) errors.push(`[두 번 깔기] 섹션 밖 낱개 노드 ${loose}개 잔류`);
    const second = secs.map((n) => n.absoluteBoundingBox.x);
    if (first.length === second.length && first.some((x, i) => x !== second[i])) {
      errors.push(`[두 번 깔기] 판 자리가 왼쪽으로 밀립니다 (${first.join(",")} → ${second.join(",")})`);
    }
  }

  // ── 8) 모드 핀 — "Dark" 판이 라이트 값으로 그려지지 않는가 ──
  for (const f of frames) {
    const want = f.name.indexOf("Dark") >= 0 ? "dark" : "light";
    const got = f.modes["semantic-color"];
    if (got !== want) errors.push(`"${f.name}" 의 모드 고정이 ${got || "없음"} — ${want} 여야 합니다`);
  }

  // ── 9) 안 보이는 칠 — 토큰 이름이 틀리면 raw 색이 아니라 '빈 칠'로 새어 글자·칩이 사라진다 ──
  const emptyFillNodes = all.filter((n) => (n.type === "TEXT" || n.type === "RECTANGLE")
    && Array.isArray(n.fills) && n.fills.length === 0);
  if (emptyFillNodes.length) {
    errors.push(`칠이 비어 보이지 않는 노드 ${emptyFillNodes.length}건 (토큰 이름 오타 의심: ${emptyFillNodes.slice(0, 3).map((n) => n.characters || n.name || n.type).join(" / ")})`);
  }

  // ── 10) 이름표 ↔ 실제 변수 — 칸 수만 세면 라벨과 칩이 어긋난 표를 못 잡는다 ──
  // 장식(묶음 머리띠·구분선)인가 = **이름 + 실제로 물린 토큰**이 둘 다 맞아야 한다.
  //   이름만 보면 진짜 칩을 "group band" 로 위장해 대조를 빠져나간다(🤖 component-verifier 6회차 M3).
  const DECOR = { "group band": "color/bg/level-2", "group rule": "color/line/gray/subtle" };
  const isDecor = (n) => {
    const want = Object.prototype.hasOwnProperty.call(DECOR, n.name) ? DECOR[n.name] : null;
    if (!want) return false;
    const p0 = n.fills && n.fills[0];
    const id = p0 && p0.boundVariables && p0.boundVariables.color && p0.boundVariables.color.id;
    if (id !== `COLOR:${want}`) { errors.push(`장식 이름("${n.name}")을 쓰면서 다른 토큰에 물린 사각형이 있습니다 — 위장 의심`); return false; }
    return true;
  };

  // 정본에서 계산한 '계열 대표 칸' 집합 — 대표 강조(파란 선)를 허용할 자리는 여기뿐이다.
  // 대표를 표시하는 계열 목록(river 결정 2026-09-23). 빌더에서 읽되 **비거나 사라지면 막는다** —
  //   목록을 지워 대표 검사를 통째로 끄는 것을 방지한다.
  //   빌더 목록을 그대로 믿지 않고 **river 가 정한 네 계열과 정확히 같은지** 대조한다
  //   (목록을 늘리거나 줄이면 그 자체가 결정 위반이다).
  const PRIMARY_GROUPS_CANON = ["blue", "red", "blue-dark", "red-dark"];
  const PRIMARY_GROUPS = [...(builderSrc.match(/PRIMARY_GROUPS = \[([^\]]*)\]/) || ["", ""])[1]
    .matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (PRIMARY_GROUPS.slice().sort().join(",") !== PRIMARY_GROUPS_CANON.slice().sort().join(",")) {
    errors.push(`대표 표시 계열이 river 결정과 다릅니다: [${PRIMARY_GROUPS.join(", ")}] ≠ [${PRIMARY_GROUPS_CANON.join(", ")}]`);
  }
  // 대표는 **그 판의 별칭**으로 센다(빌더와 같은 규칙). 밝은 계열은 라이트 사용량, `-dark` 계열은 다크 사용량.
  const primaryOf = (head, members, mode) => {
    if (PRIMARY_GROUPS.indexOf(head) < 0) return null;
    let best = null, bestN = 0;
    for (const k of members) { const n = USAGE[mode][k] || 0; if (n > bestN) { best = k; bestN = n; } }
    return bestN > 0 ? { key: best, n: bestN } : null;
  };
  const primariesFor = (mode) => {
    const out = new Map();
    for (const g of groupsOf(FOUNDATION_BY_MODE[mode], 1)) {
      const p0 = primaryOf(g.head, g.members, mode);
      if (p0) out.set(p0.key, p0.n);
    }
    return out;
  };
  const PRIMARY_BY_MODE = { light: primariesFor("light"), dark: primariesFor("dark") };
  const PRIMARY_KEYS = new Set([...PRIMARY_BY_MODE.light.keys(), ...PRIMARY_BY_MODE.dark.keys()]);

  const boundName = (n) => {
    const p0 = n.fills && n.fills[0];
    const id = p0 && p0.boundVariables && p0.boundVariables.color && p0.boundVariables.color.id;
    return id ? String(id).split(/:(.+)/)[1] : null;
  };
  let pairChecked = 0;
  for (const f of frames) {
    const kids = f.children;
    const chips = kids.filter((n) => n.type === "RECTANGLE" && boundName(n));
    const labels = kids.filter((n) => n.type === "TEXT");
    for (const c of chips) {
      // 자·모서리 표시와 묶음 머리띠·구분선은 '견본 칩'이 아니다 — 이름표 대조 대상에서 뺀다.
      if (c.name.indexOf(" bar") > 0 || c.name.indexOf(" box") > 0 || isDecor(c)) continue;
      const name = boundName(c);
      // 칩 바로 아래(Foundation) 또는 바로 오른쪽(Semantic) 글자가 그 토큰 이름을 담아야 한다.
      const near = labels.filter((t) => (Math.abs(t.y - (c.y + c.height + 6)) < 4 && Math.abs(t.x - c.x) < 4)
        || (t.x > c.x && t.x < c.x + c.width + 40 && Math.abs(t.y - c.y) < c.height));
      if (!near.length) { errors.push(`"${f.name}" 의 견본 칩 "${name}" 에 이름표가 없습니다`); break; }
      // 부분일치를 허용하면 이름표를 "color" 나 한 글자로 잘라도 통과한다(🤖 10회차 a-1~a-3).
      //   Foundation 은 첫 마디를 뗀 이름, Semantic 은 전체 이름이 **그대로** 적혀야 한다.
      const wantLabel = f.name.indexOf("Foundation") >= 0 ? name.slice(name.indexOf("/") + 1) : name;
      const hits = near.filter((t) => t.characters === wantLabel);
      const ok = hits.length === 1;
      if (hits.length > 1) errors.push(`"${f.name}" 에서 같은 이름표가 ${hits.length}개 겹쳐 있습니다: ${wantLabel}`);
      if (!ok) { errors.push(`"${f.name}" 에서 이름표와 실제 토큰이 다릅니다: 표기 "${near[0].characters}" ≠ 있어야 할 "${wantLabel}"`); break; }
      pairChecked++;
    }
  }
  if (pairChecked !== expectSwatch) errors.push(`이름표 ↔ 변수 대조가 ${pairChecked}건 — 정본 전건 ${expectSwatch} 과 달라 대조가 새고 있습니다`);

  // ── 11-a) 글자를 글자 위에 포개지 않았는가 ──
  //   좌표가 사실상 같은 쌍은 ⑤·⑪ 의 조건(x 더 오른쪽 / y 다름)에 걸리지 않아 설계상 빠져나갔다.
  //   거짓 글자를 정답 위에 덮어 그리면 사람 눈엔 뭉개지고 기계는 "정답이 하나 있다"며 통과했다
  //   (🤖 component-verifier 11회차 A).
  for (const [f, list] of byFrame) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (Math.abs(list[i].x - list[j].x) < 2 && Math.abs(list[i].y - list[j].y) < 2) {
          errors.push(`"${f.name}" 에서 글자가 같은 자리에 겹쳐 있습니다: "${String(list[i].characters).slice(0, 16)}" ↔ "${String(list[j].characters).slice(0, 16)}"`);
          i = list.length; break;
        }
      }
    }
  }

  // ── 11) 줄끼리 세로로 겹치지 않는가 (행 높이가 무너지는 실패) ──
  for (const [f, list] of byFrame) {
    const sorted = list.slice().sort((a, b) => a.y - b.y);
    for (let i = 0; i < sorted.length; i++) {
      const t = sorted[i];
      const size = styleSize[t.textStyleId] || t.fontSize || 12;
      const tRight = t.x + (t.textAutoResize === "WIDTH_AND_HEIGHT" ? estWidth(t) : t.width);
      for (let j = i + 1; j < sorted.length; j++) {
        const o = sorted[j];
        if (o.y >= t.y + size * 1.3) break;                       // 세로로 안 겹치면 이후도 안 겹친다
        const oSize = styleSize[o.textStyleId] || o.fontSize || 12;
        const oRight = o.x + (o.textAutoResize === "WIDTH_AND_HEIGHT" ? estWidth(o) : o.width);
        const xOverlap = t.x < oRight && o.x < tRight;
        const yOverlap = o.y < t.y + size * 1.3 && t.y < o.y + oSize * 1.3;
        if (xOverlap && yOverlap && Math.abs(o.y - t.y) > 0.5) {
          errors.push(`"${f.name}" 에서 글자 줄이 세로로 겹칩니다: "${String(t.characters).slice(0, 14)}" ↔ "${String(o.characters).slice(0, 14)}"`);
          i = sorted.length; break;
        }
      }
    }
  }

  // ── 12) 숫자 자(bar)의 길이가 값과 맞는가 ──
  const numberFrame = sheet["Number"];
  if (numberFrame) {
    let barChecked = 0;
    for (const n of numberFrame.children) {
      if (n.type !== "RECTANGLE" || n.name.indexOf(" bar") < 0) continue;
      const key = n.name.replace(" bar", "");
      const value = varsData.FOUNDATION_NUMBER[key];
      const want = Math.max(1, Math.min(value, 320));
      if (Math.abs(n.width - want) > 0.5) errors.push(`자 길이가 값과 다릅니다: ${key} = ${value} 인데 ${n.width}`);
      if (n.height !== 12) errors.push(`자 두께가 ${n.height} 입니다 — 12 여야 합니다 (${key})`);   // 0 이면 안 보인다(M9)
      if (value <= 320) {
        const wid = n.boundVariables.width;
        const wid_id = wid && (wid.id || wid);
        if (!wid) errors.push(`자 길이가 변수에 안 걸렸습니다: ${key}`);
        // 물린 변수가 '그 토큰'인지까지 본다 — 엉뚱한 변수에 물리면 실제 Figma 에서 길이가 통째로 바뀐다
        //   (🤖 component-verifier 14회차 n3).
        else if (String(wid_id) !== `FLOAT:${key}`) errors.push(`자 길이가 다른 변수에 걸렸습니다: ${key} → ${String(wid_id)}`);
      }
      barChecked++;
    }
    // 기대 개수는 **검사기가 따로 선언**한다. 빌더의 BAR_HEADS 를 읽어 오면 그 상수를 줄이는 순간
    //   기대치도 함께 줄어 검사가 스스로 무력해진다(🤖 component-verifier 16회차 N-B).
    //   길이로 보여 줄 묶음 = 간격·크기·두께. 빌더가 의도적으로 바꾸면 여기도 함께 고쳐야 한다.
    const headSet = new Set(["spacing", "sizing", "border-width"]);
    const wantBars = Object.keys(varsData.FOUNDATION_NUMBER)
      .filter((k) => headSet.has(k.slice(0, k.indexOf("/"))) && varsData.FOUNDATION_NUMBER[k] > 0).length;
    if (barChecked !== wantBars) errors.push(`자 길이 대조가 ${barChecked}건 — 정본 ${wantBars} 과 달라 자가 빠졌습니다`);
  }

  // ── 14) 판이 적은 '값·참조' 글자가 정본과 같은가 (M-A·M-B — 칩 색만 맞고 글자가 거짓인 판) ──
  {
    for (const foundationFrame of foundationSheets) {
      const texts0 = foundationFrame.children.filter((n) => n.type === "TEXT");
      let checked = 0;
      for (const c of foundationFrame.children) {
        if (c.type !== "RECTANGLE" || isDecor(c)) continue;
        const name = boundName(c);
        if (!name) continue;
        const hexText = texts0.find((t) => Math.abs(t.x - c.x) < 4 && Math.abs(t.y - (c.y + c.height + 22)) < 4);
        if (!hexText) { errors.push(`Foundation 칩 "${name}" 옆에 색값 글자가 없습니다`); break; }
        if (hexText.characters !== varsData.FOUNDATION_COLOR[name]) {
          errors.push(`Foundation 색값 표기가 정본과 다릅니다: ${name} → 판 "${hexText.characters}" ≠ 정본 "${varsData.FOUNDATION_COLOR[name]}"`);
          break;
        }
        checked++;
      }
      const wantF = FOUNDATION_BY_MODE[modeOf(foundationFrame)].length;
      if (checked !== wantF) errors.push(`"${foundationFrame.name}" 색값 대조가 ${checked}건 — 정본 ${wantF} 과 달라 대조가 새고 있습니다`);
    }
    for (const f of semanticSheets) {
      const dark = f.name.indexOf("Dark") >= 0;
      const texts1 = f.children.filter((n) => n.type === "TEXT");
      let checked = 0;
      for (const c of f.children) {
        if (c.type !== "RECTANGLE" || isDecor(c)) continue;
        const name = boundName(c);
        if (!name) continue;
        // 행 구성: 칩 · 토큰이름(x+34) · 참조값(x+344)
        const refText = texts1.find((t) => Math.abs(t.x - (c.x + 344)) < 4 && Math.abs(t.y - (c.y + 4)) < 4);
        if (!refText) { errors.push(`"${f.name}" 의 "${name}" 행에 참조값 글자가 없습니다`); break; }
        const want = varsData.SEMANTIC_COLOR[name] ? (dark ? varsData.SEMANTIC_COLOR[name].dark : varsData.SEMANTIC_COLOR[name].light) : null;
        if (refText.characters !== want) {
          errors.push(`"${f.name}" 의 참조값이 정본과 다릅니다: ${name} → 판 "${refText.characters}" ≠ 정본 "${want}"`);
          break;
        }
        checked++;
      }
      const wantS = COMMON_KEYS.length;
      if (checked !== wantS) errors.push(`"${f.name}" 참조값 대조가 ${checked}건 — 공통 역할색 ${wantS} 과 달라 대조가 새고 있습니다`);
    }
  }

  // ── 15-b) 옛 판이 깔린 페이지에서 도중에 터지면, 옛 판은 살아 있어야 한다 ──
  //   빈 페이지 시험만으로는 "먼저 걷어내고 만들기"로 되돌려도 안 잡힌다(🤖 component-verifier 16회차 N-G).
  for (const injectAt6 of INJECT_POINTS) {
    const p6 = new Node("PAGE");
    let made6 = 0, fail6 = false;
    const attach6 = (n) => { p6.appendChild(n); return n; };
    global.figma = {
      createFrame: () => attach6(new Node("FRAME")),
      createRectangle: () => attach6(new Node("RECTANGLE")),
      createText: () => { if (fail6 && ++made6 === injectAt6) throw new Error("되감기 시험용 실패"); return attach6(new Node("TEXT")); },
      createSection: () => attach6(new Node("SECTION")),
      loadFontAsync: async () => {},
      currentPage: p6,
      variables: { setBoundVariableForPaint: (paint, field, v) => Object.assign({}, paint, { boundVariables: { [field]: { id: v.id, type: "VARIABLE_ALIAS" } } }) },
    };
    await sheets.buildTokenSheets(maps);                    // 1차 설치(옛 판)
    const before = p6.children.filter((n) => n.type === "SECTION").length;
    const beforeTexts = p6.findAll((n) => n.type === "TEXT").length;
    fail6 = true;
    let threw6 = null;
    try { await sheets.buildTokenSheets(maps); } catch (e) { threw6 = e.message; }
    if (!threw6) errors.push('[되감기·옛 판] 예외를 주입했는데 그대로 끝났습니다 — 시험이 헛돕니다');
    const after = p6.children.filter((n) => n.type === "SECTION").length;
    const afterTexts = p6.findAll((n) => n.type === "TEXT").length;
    if (after !== before || afterTexts !== beforeTexts) {
      errors.push(`[되감기·옛 판] 도중에 터지자 먼저 깔려 있던 판이 사라졌습니다 (섹션 ${before}→${after} · 글자 ${beforeTexts}→${afterTexts})`);
    }
  }

  // ── 16) "대표(Primary)" 표시가 정본 집계와 같은가 (M1 대표 오판 · M2 숫자 위조) ──
  //   판마다 그 판의 계열·그 판의 별칭 집계로 본다(밝은 판=라이트, 어두운 판=다크).
  for (const fFrame of foundationSheets) {
    const mode = modeOf(fFrame);
    const groups = groupsOf(FOUNDATION_BY_MODE[mode], 1);
    const heads = fFrame.children.filter((n) => n.type === "TEXT" && n.textStyleId === "style:title/14B");
    let headChecked = 0;
    for (const g of groups) {
      const p0 = primaryOf(g.head, g.members, mode);
      const want = p0 ? `${g.head} — 대표 ${p0.key.slice(p0.key.indexOf("/") + 1)} (역할색 ${p0.n}곳)` : g.head;
      const got = heads.find((t) => String(t.characters) === g.head || String(t.characters).indexOf(`${g.head} —`) === 0);
      if (!got) { errors.push(`"${fFrame.name}" 에서 계열 제목을 찾지 못했습니다: ${g.head}`); continue; }
      if (got.characters !== want) { errors.push(`대표 표시가 정본 집계와 다릅니다: 판 "${got.characters}" ≠ 정본 "${want}"`); break; }
      headChecked++;
    }
    if (headChecked !== groups.length) {
      errors.push(`"${fFrame.name}" 계열 제목 대조가 ${headChecked}건 — 계열 ${groups.length} 과 달라 대조가 새고 있습니다`);
    }
    // 칸별 "역할색 N곳" 라벨도 전건 대조한다(대표 줄만 맞추고 나머지를 위조하는 수법 차단).
    const labels2 = fFrame.children.filter((n) => n.type === "TEXT");
    let cellChecked = 0;
    for (const c of fFrame.children) {
      if (c.type !== "RECTANGLE" || isDecor(c)) continue;
      const name = boundName(c);
      if (!name) continue;
      const marksHere = PRIMARY_GROUPS.indexOf(name.slice(0, name.indexOf("/"))) >= 0;
      const used = marksHere ? (USAGE[mode][name] || 0) : 0;
      const note = labels2.find((t) => Math.abs(t.x - c.x) < 4 && Math.abs(t.y - (c.y + c.height + 38)) < 4);
      if (!used) { if (note) errors.push(`쓰임 라벨을 적을 자리가 아닌데 라벨이 있습니다: ${name}`); continue; }
      if (!note) { errors.push(`쓰임 라벨이 없습니다: ${name} (역할색 ${used}곳)`); break; }
      if (String(note.characters).indexOf(`역할색 ${used}곳`) < 0) {
        errors.push(`쓰임 라벨이 정본 집계와 다릅니다: ${name} → 판 "${note.characters}" ≠ 정본 ${used}곳`);
        break;
      }
      cellChecked++;
    }
    const wantCells = FOUNDATION_BY_MODE[mode]
      .filter((k) => USAGE[mode][k] && PRIMARY_GROUPS.indexOf(k.slice(0, k.indexOf("/"))) >= 0).length;
    if (cellChecked !== wantCells) errors.push(`"${fFrame.name}" 쓰임 라벨 대조가 ${cellChecked}건 — 정본 ${wantCells} 과 달라 대조가 새고 있습니다`);
  }

  // ── 18) 정본 토큰 '집합' 이 그대로 실렸는가 — 개수만 세면 한 칸을 빼고 다른 칸을 복제해도 통과한다
  //        (🤖 component-verifier 7회차 N2·N5 실측).
  {
    const setOf = (frame) => {
      const out = new Set();
      for (const c of frame.children) {
        if (c.type !== "RECTANGLE" || isDecor(c)) continue;
        const n = boundName(c);
        if (n) out.add(n);
      }
      return out;
    };
    const diff = (got, want, label) => {
      const missing = want.filter((k) => !got.has(k));
      const extra = [...got].filter((k) => want.indexOf(k) < 0);
      if (missing.length) errors.push(`${label}: 정본에 있는데 판에 없는 토큰 ${missing.length}건 (${missing.slice(0, 4).join(", ")})`);
      if (extra.length) errors.push(`${label}: 정본에 없는 토큰이 판에 있습니다 ${extra.length}건 (${extra.slice(0, 4).join(", ")})`);
    };
    for (const fFrame of foundationSheets) diff(setOf(fFrame), FOUNDATION_BY_MODE[modeOf(fFrame)], fFrame.name);
    for (const f of semanticSheets) diff(setOf(f), COMMON_KEYS, f.name);
  }

  // ── 19) 글자 표본이 '자기 스타일'로 그려졌는가 — 줄 수만 세면 전부 같은 모양이어도 통과한다(N4) ──
  {
    const typoFrame = sheet["Typography"];
    if (typoFrame) {
      const kids = typoFrame.children.filter((n) => n.type === "TEXT");
      let checked = 0;
      for (const d of textData.TEXT_STYLES) {
        const nameLabel = kids.find((t) => t.characters === d.name);
        if (!nameLabel) { errors.push(`글자 판에 "${d.name}" 줄이 없습니다`); continue; }
        const sample = kids.find((t) => String(t.characters) === TYPE_SAMPLE_CANON && Math.abs(t.y - (nameLabel.y - 8)) < 6);
        if (!sample) { errors.push(`"${d.name}" 줄에 표본 글자가 없습니다`); continue; }
        if (sample.textStyleId !== `style:${d.name}`) {
          errors.push(`표본이 자기 스타일로 그려지지 않았습니다: ${d.name} → ${sample.textStyleId}`);
          break;
        }
        checked++;
      }
      if (checked !== textData.TEXT_STYLES.length) errors.push(`표본 스타일 대조가 ${checked}건 — 정본 ${textData.TEXT_STYLES.length} 과 다릅니다`);
      // 정본에 없는 스타일 줄을 그려 넣지 않았는가.
      const canonNames = new Set(textData.TEXT_STYLES.map((d) => d.name));
      const extraStyles = kids.map((t) => String(t.characters))
        .filter((c) => /^(title|body)\//.test(c) && !canonNames.has(c));
      if (extraStyles.length) errors.push(`글자 판에 정본에 없는 줄 ${extraStyles.length}건 (${extraStyles.slice(0, 3).join(", ")})`);
    }
  }

  // ── 20) 대표 강조 테두리가 '그 대표 칸'에만 걸렸는가 (N1) ──
  for (const fFrame of foundationSheets) {
    const primaries = PRIMARY_BY_MODE[modeOf(fFrame)];
    let marked = 0;
    for (const c of fFrame.children) {
      if (c.type !== "RECTANGLE" || isDecor(c)) continue;
      const name = boundName(c);
      if (!name) continue;
      const st = c.strokes && c.strokes[0];
      const sid = st && st.boundVariables && st.boundVariables.color && st.boundVariables.color.id;
      const isMarked = sid === "COLOR:color/line/blue" && c.strokeWeight === 3;
      if (primaries.has(name) && !isMarked) { errors.push(`대표 칸에 강조 테두리가 없습니다: ${name}`); break; }
      if (!primaries.has(name) && isMarked) { errors.push(`대표가 아닌 칸에 강조 테두리가 있습니다: ${name}`); break; }
      if (isMarked) marked++;
    }
    if (marked !== primaries.size) errors.push(`"${fFrame.name}" 강조 테두리 ${marked}칸 — 정본 대표 ${primaries.size}칸과 다릅니다`);
  }

  // ── 22) 숫자 판이 정본 '집합'과 '값 글자'를 그대로 싣는가 (🤖 10회차 a-4~a-6) ──
  {
    const nf = sheet["Number"];
    if (nf) {
      const texts3 = nf.children.filter((n) => n.type === "TEXT");
      // 열(칼럼) 시작 x = **묶음 머리띠의 실제 x** + 행 들여쓰기. 거리 어림도, 배치 우연도 쓰지 않는다
      //   (🤖 component-verifier 12회차 (c): 줄별 최좌 x 방식은 레이아웃이 바뀌면 가짜 경보를 낸다).
      const bandXs = Array.from(new Set(nf.children
        .filter((n) => n.type === "RECTANGLE" && n.name === "group band")
        .map((n) => Math.round(n.x))));
      if (!bandXs.length) errors.push("숫자 판에 묶음 머리띠가 없습니다 — 묶음 구분이 사라졌습니다");
      const colStarts = bandXs.map((x0) => x0 + ROWS_INDENT);
      const byChars = {};
      for (const t of texts3) (byChars[t.characters] = byChars[t.characters] || []).push(t);
      const seen = new Set();
      const checkRow = (key, wantValue) => {
        // 줄의 **첫 칸**만 이름 칸이다. Semantic 줄의 참조 글자("spacing/8")가 Foundation 줄 이름과
        //   같은 글자라 그대로 세면 중복으로 잡힌다 — 왼쪽에 다른 글자가 없는 칸만 이름으로 본다.
        //   열 시작 x 는 아래에서 실제 좌표로 뽑는다(어림 거리 가정 없음).
        const nameCells = (byChars[key] || []).filter((t) => colStarts.some((cx) => Math.abs(t.x - cx) < 2));
        if (nameCells.length !== 1) {
          errors.push(nameCells.length ? `숫자 판에 "${key}" 줄이 ${nameCells.length}개 있습니다` : `숫자 판에 "${key}" 줄이 없습니다`);
          return;
        }
        seen.add(key);
        const row = nameCells[0];
        const valueCell = texts3.find((t) => t !== row && Math.abs(t.y - row.y) < 4 && t.x > row.x);
        if (!valueCell) { errors.push(`숫자 판 "${key}" 줄에 값 글자가 없습니다`); return; }
        if (valueCell.characters !== String(wantValue)) {
          errors.push(`숫자 판 값 표기가 정본과 다릅니다: ${key} → 판 "${valueCell.characters}" ≠ 정본 "${wantValue}"`);
        }
      };
      for (const key of Object.keys(varsData.FOUNDATION_NUMBER)) checkRow(key, varsData.FOUNDATION_NUMBER[key]);
      for (const key of Object.keys(varsData.SEMANTIC_NUMBER)) checkRow(key, varsData.SEMANTIC_NUMBER[key]);
      const wantKeys = Object.keys(varsData.FOUNDATION_NUMBER).length + Object.keys(varsData.SEMANTIC_NUMBER).length;
      if (seen.size !== wantKeys) errors.push(`숫자 판 줄 대조가 ${seen.size}건 — 정본 ${wantKeys} 과 다릅니다`);
      // 정본에 없는 줄을 그려 넣지 않았는가(색 판의 집합 대조와 같은 잣대를 숫자 판에도).
      const canonKeys = new Set(Object.keys(varsData.FOUNDATION_NUMBER).concat(Object.keys(varsData.SEMANTIC_NUMBER)));
      const extraRows = texts3
        .filter((t) => colStarts.some((cx) => Math.abs(t.x - cx) < 2))
        .map((t) => String(t.characters))
        .filter((c) => c.indexOf("/") > 0 && !canonKeys.has(c));
      if (extraRows.length) errors.push(`숫자 판에 정본에 없는 줄 ${extraRows.length}건 (${extraRows.slice(0, 3).join(", ")})`);
    }
  }

  // ── 23) 글자 판의 규격 표기(크기·굵기·행간·자간)가 정본과 같은가 (🤖 10회차 a-7) ──
  {
    const tf = sheet["Typography"];
    if (tf) {
      const texts4 = tf.children.filter((n) => n.type === "TEXT");
      let specChecked = 0;
      for (const d of textData.TEXT_STYLES) {
        const nameLabel = texts4.find((t) => t.characters === d.name);
        if (!nameLabel) continue;                       // ⑲ 가 이미 지적한다
        const want = `${d.fontSize}px · ${d.fontStyle} · 행간 ${d.lineHeightPercent}% · 자간 ${d.letterSpacingPercent}%`;
        const specCell = texts4.find((t) => Math.abs(t.y - nameLabel.y) < 4 && t.x > nameLabel.x && String(t.characters).indexOf("px") > 0);
        if (!specCell) { errors.push(`글자 판 "${d.name}" 줄에 규격 표기가 없습니다`); continue; }
        if (specCell.characters !== want) {
          errors.push(`글자 판 규격 표기가 정본과 다릅니다: ${d.name} → 판 "${specCell.characters}" ≠ 정본 "${want}"`);
          break;
        }
        specChecked++;
      }
      if (specChecked !== textData.TEXT_STYLES.length) errors.push(`규격 표기 대조가 ${specChecked}건 — 정본 ${textData.TEXT_STYLES.length} 과 다릅니다`);
    }
  }

  // ── 17) 사각형(머리띠·구분선·자)이 글자를 덮지 않는가 — 글자끼리만 보던 사각을 메운다 ──
  for (const f of frames) {
    const rects = f.children.filter((n) => n.type === "RECTANGLE");
    const texts2 = f.children.filter((n) => n.type === "TEXT");
    for (const r of rects) {
      // 사각형끼리도 겹치면 안 된다 — 자를 키워 아랫줄 자를 덮는 수법이 글자 검사만으로는 안 잡힌다
      //   (🤖 component-verifier 15회차 NEW-8).
      for (const o of rects) {
        if (o === r) continue;
        const hit = r.x < o.x + o.width && o.x < r.x + r.width && r.y < o.y + o.height && o.y < r.y + r.height;
        if (hit) { errors.push(`"${f.name}" 에서 ${r.name || "사각형"} 과 ${o.name || "사각형"} 이 겹칩니다 (y=${Math.round(r.y)})`); break; }
      }
      // 모든 사각형을 본다 — 장식만 보던 종전에는 자·상자를 글자 위로 옮기거나 키워도 조용했다
      //   (🤖 component-verifier 15회차 NEW-7·NEW-8).
      if (r.x < -0.5 || r.y < -0.5 || r.x + r.width > f.width + 0.5 || r.y + r.height > f.height + 0.5) {
        errors.push(`"${f.name}" 의 ${r.name || "사각형"} 이 판 밖으로 나갑니다 (x=${Math.round(r.x)}, y=${Math.round(r.y)})`);
        break;
      }
      for (const t of texts2) {
        const size = styleSize[t.textStyleId] || t.fontSize || 12;
        const tw = t.textAutoResize === "WIDTH_AND_HEIGHT" ? estWidth(t) : t.width;
        const overlap = r.x < t.x + tw && t.x < r.x + r.width && r.y < t.y + size * 1.3 && t.y < r.y + r.height;
        // 머리띠 위에 얹은 제목은 의도된 배치 — 띠 안에 완전히 들어가 있으면 통과.
        const insideBand = r.name === "group band" && t.x >= r.x && t.x + tw <= r.x + r.width
          && t.y >= r.y && t.y + size * 1.3 <= r.y + r.height + 2;
        if (overlap && !insideBand) {
          errors.push(`"${f.name}" 에서 ${r.name} 이 글자를 덮습니다: "${String(t.characters).slice(0, 16)}"`);
          break;
        }
      }
    }
  }

  // ── 28) 사각형의 모서리·테두리가 '그 토큰'에 물렸는가 (자 폭과 같은 잣대를 나머지에도) ──
  //   (🤖 component-verifier 15회차 NEW-1·NEW-3·NEW-6)
  {
    const cornerIds = (n) => ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]
      .map((k) => { const v = n.boundVariables[k]; return v ? String(v.id || v) : null; });
    const strokeId = (n) => {
      const st = n.strokes && n.strokes[0];
      const id = st && st.boundVariables && st.boundVariables.color && st.boundVariables.color.id;
      return id ? String(id) : null;
    };
    let radiusChecked = 0, chipChecked = 0;
    for (const f of frames) {
      for (const r of f.children.filter((n) => n.type === "RECTANGLE")) {
        const nm = String(r.name || "");
        if (nm.indexOf(" box") > 0) {                       // 반경 견본 상자
          const key = nm.replace(" box", "");
          const want = `FLOAT:${key}`;
          if (cornerIds(r).some((id) => id !== want)) {
            errors.push(`반경 상자가 다른 변수에 걸렸습니다: ${key} → ${cornerIds(r).join("/")}`);
            break;
          }
          radiusChecked++;
          continue;
        }
        if (nm.indexOf(" bar") > 0 || isDecor(r)) continue;  // 자·장식은 앞 검사 소관
        // 견본 칩 — 모서리는 radius/4, 테두리는 선 토큰(대표 칸만 파란 선)
        if (cornerIds(r).some((id) => id !== "FLOAT:radius/4")) {
          errors.push(`견본 칩 모서리가 radius/4 가 아닌 변수에 걸렸습니다: ${cornerIds(r).join("/")}`);
          break;
        }
        const sid = strokeId(r);
        const chipKey = boundName(r);
        const mayBeBlue = chipKey && PRIMARY_KEYS.has(chipKey);
        const wantStroke = mayBeBlue ? "COLOR:color/line/blue" : "COLOR:color/line/gray/subtle";
        // 파란 선은 대표 칸에만. OR 로 두 색을 다 받으면 577칸을 전부 파랗게 칠해도 통과한다
        //   (🤖 component-verifier 16회차 N-A).
        // 두께도 본다 — 대표만 3 을 보고 나머지를 안 보면, 테두리를 0 으로 만들어 흰 칩을 지울 수 있다
        //   (🤖 component-verifier 18회차 보완 후보 M7).
        const wantWeight = mayBeBlue ? 3 : 1;
        if (r.strokeWeight !== wantWeight) {
          errors.push(`견본 칩 테두리 두께가 ${r.strokeWeight} 입니다 — ${wantWeight} 이어야 합니다 (${chipKey})`);
          break;
        }
        if (sid !== wantStroke) {
          errors.push(`견본 칩 테두리가 있어야 할 토큰이 아닙니다: ${chipKey || "?"} → ${sid || "없음"} (있어야 할 것 ${wantStroke})`);
          break;
        }
        chipChecked++;
      }
    }
    const wantRadius = Object.keys(varsData.FOUNDATION_NUMBER).filter((k) => k.indexOf("radius/") === 0).length;
    if (radiusChecked !== wantRadius) errors.push(`반경 상자 대조가 ${radiusChecked}건 — 정본 ${wantRadius} 과 다릅니다`);
    if (chipChecked !== expectSwatch) errors.push(`칩 테두리·모서리 대조가 ${chipChecked}건 — 정본 ${expectSwatch} 과 다릅니다`);
  }

  // ── 13) 라벨이 '있어야 막는 목록' 밖의 글자 스타일을 쓰지 않는가 ──
  //   정적 정규식은 변수 한 겹으로 우회된다(🤖 component-verifier M-C). 그래서 **실행으로** 본다:
  //   REQUIRED_STYLES 만 있는 파일을 흉내내고(=글자 표본 판은 건너뛰어진다), 그래도 만들어진 판의
  //   모든 글자에 정본 스타일이 걸려 있는지 센다. 목록 밖 스타일을 쓰면 그 글자만 스타일 없이 남는다.
  {
    const src = fs.readFileSync(path.join(SRC, "build-token-sheets.ts"), "utf8");
    const required = (src.match(/const REQUIRED_STYLES = \[([^\]]*)\]/) || [])[1] || "";
    const req = [...required.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const p4 = mockPage();
    const onlyRequired = {};
    for (const k of req) onlyRequired[k] = { id: `style:${k}`, name: k };
    await sheets.buildTokenSheets(Object.assign({}, maps, { textStyles: onlyRequired }));
    const built = p4.children.filter((n) => n.type === "SECTION");
    const labels = [].concat(...built.map((s0) => s0.findAll((n) => n.type === "TEXT")));
    const unstyled = labels.filter((t) => !t.textStyleId);
    if (!labels.length) errors.push('[라벨 스타일] 목록 스타일만 있는 파일에서 판을 한 장도 만들지 못했습니다');
    if (unstyled.length) {
      errors.push(`막는 목록 밖 글자 스타일을 씁니다 — 정본 스타일이 안 걸린 글자 ${unstyled.length}건 (예: "${String(unstyled[0].characters).slice(0, 20)}")`);
    }
  }

  // ── 15) 도중에 터졌을 때 페이지에 조각이 남지 않는가 (되감기 회귀 시험) ──
  //   실제 Figma 는 create* 하는 순간 노드를 페이지에 붙인다. 그 조건을 그대로 흉내내고 예외를 주입한다.
  //   주입 지점은 두 곳 — 앞(색 판)과 뒤(숫자 판)를 모두 밟아야 경로 하나만 지키는 눈속임을 막는다.
  for (const injectAt of INJECT_POINTS) {
    const p5 = new Node("PAGE");
    // 남의 노드를 하나 미리 놓는다 — "남은 조각 0" 만 보면 **페이지를 통째로 비우는 구현**도 통과한다
    //   (🤖 component-verifier V3 2026-09-22). 그 구현은 실제 파일에서 디자이너의 부품까지 지운다.
    //   종류도 이름도 다르게 셋을 놓는다 — 하나뿐이면 "SECTION 만 남기고 쓸기"·"이 이름만 피해 쓸기"
    //   같은 수법이 통과한다(🤖 component-verifier 5회차 A·E).
    const bystanders = [];
    for (const [type, name] of [["SECTION", "남의 부품"], ["FRAME", "남의 화면"], ["TEXT", ""]]) {
      const n = new Node(type);
      n.name = name;
      p5.appendChild(n);
      bystanders.push(n);
    }
    const bystanderKids = bystanders.map((n) => n.children.length);
    let made = 0;
    const attach = (n) => { p5.appendChild(n); return n; };
    global.figma = {
      createFrame: () => attach(new Node("FRAME")),
      createRectangle: () => attach(new Node("RECTANGLE")),
      createText: () => { if (++made === injectAt) throw new Error("되감기 시험용 실패"); return attach(new Node("TEXT")); },
      createSection: () => attach(new Node("SECTION")),
      loadFontAsync: async () => {},
      currentPage: p5,
      variables: { setBoundVariableForPaint: (paint, field, v) => Object.assign({}, paint, { boundVariables: { [field]: { id: v.id, type: "VARIABLE_ALIAS" } } }) },
    };
    let threw = null;
    try { await sheets.buildTokenSheets(maps); } catch (e) { threw = e.message; }
    if (!threw) errors.push('[되감기] 예외를 주입했는데 그대로 끝났습니다 — 시험이 헛돕니다');
    // 조각 세기는 **재귀로** — 남의 노드 안으로 옮겨 숨기는 수법(5회차 C)을 막는다.
    const left = p5.children.filter((n) => bystanders.indexOf(n) < 0)
      .concat(...bystanders.map((n) => n.findAll(() => true)));
    if (left.length) errors.push(`[되감기] 도중에 터진 뒤 페이지에 조각 ${left.length}개가 남습니다`);
    const gone = bystanders.filter((n) => p5.children.indexOf(n) < 0);
    if (gone.length) errors.push(`[되감기] 남의 노드 ${gone.length}개까지 지웠습니다 — 되감기가 페이지를 쓸어버립니다`);
    if (bystanders.some((n, i) => n.children.length !== bystanderKids[i])) {
      errors.push('[되감기] 조각을 남의 노드 안으로 옮겨 숨겼습니다');
    }
  }

  // ── 24) 판에 적힌 '글자 전체'가 정본에서 만든 목록과 똑같은가 ──
  //   지금까지의 검사는 "있어야 할 것"을 확인했다. 그래서 정본에 없는 안내문·주석을 **덧붙이는** 것은
  //   이름 모양일 때만 걸렸다(🤖 component-verifier 12회차 N2·N3·N8). 판마다 기대 글자 목록을
  //   정본으로 만들어 **다중집합 그대로** 비교한다 — 덧붙이기도 빠뜨리기도 한 번에 드러난다.
  {
    const expected = {};

    // Foundation 판 — 밝은 판 / 어두운 판
    for (const mode of ["light", "dark"]) {
      const want = [`Foundation · 기본 팔레트 (${mode === "dark" ? "Dark" : "Light"})`];
      for (const g of groupsOf(FOUNDATION_BY_MODE[mode], 1)) {
        const marks = PRIMARY_GROUPS.indexOf(g.head) >= 0;
        const p0 = primaryOf(g.head, g.members, mode);
        want.push(p0 ? `${g.head} — 대표 ${p0.key.slice(p0.key.indexOf("/") + 1)} (역할색 ${p0.n}곳)` : g.head);
        for (const k of g.members) {
          want.push(k.slice(k.indexOf("/") + 1));
          want.push(varsData.FOUNDATION_COLOR[k]);
          const used = marks ? (USAGE[mode][k] || 0) : 0;
          if (used) want.push(p0 && k === p0.key ? `★ 대표 · 역할색 ${used}곳` : `역할색 ${used}곳`);
        }
      }
      expected[mode === "dark" ? "Foundation Dark" : "Foundation Light"] = want;
    }

    // Semantic 판(라이트·다크) — 공통 묶음만
    for (const dark of [false, true]) {
      const want = [
        `Semantic · 공통 역할색 (${dark ? "Dark" : "Light"})`,
        "부품 전용 색은 Figma Variables 패널에서 봅니다.",
      ];
      for (const g of groupsOf(COMMON_KEYS, 2)) {
        want.push(g.head);
        for (const k of g.members) {
          want.push(k);
          want.push(dark ? varsData.SEMANTIC_COLOR[k].dark : varsData.SEMANTIC_COLOR[k].light);
        }
      }
      expected[dark ? "Semantic Dark" : "Semantic Light"] = want;
    }

    // 글자 판
    {
      const want = ["Typography · 글자 스타일"];
      for (const d of textData.TEXT_STYLES) {
        want.push(d.name);
        want.push(TYPE_SAMPLE_CANON);
        want.push(`${d.fontSize}px · ${d.fontStyle} · 행간 ${d.lineHeightPercent}% · 자간 ${d.letterSpacingPercent}%`);
      }
      expected["Typography"] = want;
    }

    // 숫자 판
    {
      const want = ["Number · 간격 · 반경 · 두께"];
      for (const g of groupsOf(Object.keys(varsData.FOUNDATION_NUMBER), 1)) {
        want.push(`${g.head} · ${g.members.length}개`);
        for (const k of g.members) { want.push(k); want.push(String(varsData.FOUNDATION_NUMBER[k])); }
      }
      const semKeys = Object.keys(varsData.SEMANTIC_NUMBER);
      want.push(`Semantic Number · ${semKeys.length}개`);
      for (const k of semKeys) { want.push(k); want.push(String(varsData.SEMANTIC_NUMBER[k])); }
      expected["Number"] = want;
    }

    for (const key of Object.keys(expected)) {
      const f = sheet[key];
      if (!f) continue;                                   // 판 자체가 없는 것은 앞에서 이미 지적한다
      // 하위까지 재귀로 모은다 — 판 안에 프레임을 하나 만들어 그 안에 숨기는 수법을 막는다
      //   (🤖 component-verifier 13회차 a-3). 하위 프레임 자체도 금지한다(판은 글자·사각형만 담는다).
      const nested = f.findAll((n) => n.type === "FRAME" || n.type === "GROUP" || n.type === "SECTION");
      if (nested.length) errors.push(`"${f.name}" 안에 하위 틀 ${nested.length}개가 있습니다 — 판은 글자·사각형만 담습니다`);
      const got = f.findAll((n) => n.type === "TEXT").map((t) => String(t.characters));
      const tally = (arr) => { const m = {}; for (const c of arr) m[c] = (m[c] || 0) + 1; return m; };
      const gm = tally(got), wm = tally(expected[key]);
      const extra = [], missing = [];
      for (const c of Object.keys(gm)) if ((wm[c] || 0) < gm[c]) extra.push(`${c}${gm[c] - (wm[c] || 0) > 1 ? ` ×${gm[c] - (wm[c] || 0)}` : ""}`);
      for (const c of Object.keys(wm)) if ((gm[c] || 0) < wm[c]) missing.push(c);
      if (extra.length) errors.push(`"${f.name}" 에 정본에 없는 글자 ${extra.length}종 (${extra.slice(0, 3).join(" / ")})`);
      if (missing.length) errors.push(`"${f.name}" 에 정본 글자가 빠졌습니다 ${missing.length}종 (${missing.slice(0, 3).join(" / ")})`);
    }
  }

  // ── 27) 숫자 판: 머리띠와 그 아래 줄의 x 가 맞는가 (머리띠만 옮겨도 조용하던 자리) ──
  //   (🤖 component-verifier 13회차 a-5) 열 시작을 '판 전체 머리띠 집합'으로 쓰면 다른 묶음의
  //   머리띠가 어긋난 머리띠를 가려 준다. 머리띠마다 자기 줄과 직접 대조한다.
  {
    const nf2 = sheet["Number"];
    if (nf2) {
      const bands = nf2.children.filter((n) => n.type === "RECTANGLE" && n.name === "group band")
        .sort((a2, b2) => (a2.x - b2.x) || (a2.y - b2.y));
      const rowTexts = nf2.children.filter((n) => n.type === "TEXT" && n.textStyleId === "style:body/12R");
      for (const b0 of bands) {
        // 이 머리띠 아래, 같은 칸(±COL 폭 안), 다음 머리띠 전까지의 첫 줄
        const next = bands.filter((o) => Math.abs(o.x - b0.x) < 4 && o.y > b0.y).sort((a2, b2) => a2.y - b2.y)[0];
        // 이름 칸 후보만 본다(값·참조 글자는 오른쪽 칸이라 제외) — 머리띠 기준 ±60px 안쪽.
        const rows = rowTexts.filter((t) => t.y > b0.y && (!next || t.y < next.y)
          && t.x > b0.x - 60 && t.x < b0.x + 60);
        if (!rows.length) { errors.push(`숫자 판 머리띠(x=${Math.round(b0.x)}, y=${Math.round(b0.y)}) 아래에 줄이 없습니다`); continue; }
        const bad = rows.filter((t) => Math.abs(t.x - (b0.x + ROWS_INDENT)) > 1);
        if (bad.length) {
          errors.push(`숫자 판에서 머리띠와 줄의 자리가 어긋납니다: 머리띠 x=${Math.round(b0.x)} ↔ 줄 x=${Math.round(bad[0].x)} ("${bad[0].characters}")`);
          break;
        }
      }
    }
  }

  // ── 26) 역할색 판의 묶음 제목이 그 묶음 줄과 맞는가 (제목만 맞바꾸면 다중집합으로는 안 잡힌다) ──
  //   (🤖 component-verifier 13회차 a-4)
  for (const f of semanticSheets) {
    const dark = f.name.indexOf("Dark") >= 0;
    const texts5 = f.children.filter((n) => n.type === "TEXT");
    // 묶음 제목 = 그 묶음 첫 줄 바로 위에 있는 title/14B 글자
    const heads2 = texts5.filter((t) => t.textStyleId === "style:title/14B");
    const order = [];
    const seenHead = {};
    for (const k of COMMON_KEYS) {
      const head = headOf2(k);
      if (!seenHead[head]) { seenHead[head] = [k]; order.push(head); } else seenHead[head].push(k);
    }
    for (const head of order) {
      const headCell = heads2.find((t) => t.characters === head);
      if (!headCell) { errors.push(`"${f.name}" 에 묶음 제목 "${head}" 이 없습니다`); continue; }
      // 그 제목 바로 아래 첫 줄의 토큰 이름이 이 묶음의 첫 토큰이어야 한다.
      const below = texts5
        .filter((t) => t.y > headCell.y && Math.abs(t.x - (headCell.x + 34)) < 4)
        .sort((a2, b2) => a2.y - b2.y)[0];
      const wantFirst = seenHead[head][0];
      if (!below || below.characters !== wantFirst) {
        errors.push(`"${f.name}" 의 묶음 제목이 줄과 어긋납니다: "${head}" 아래 첫 줄이 "${below ? below.characters : "없음"}" (있어야 할 것 "${wantFirst}")`);
        break;
      }
    }
  }

  // ── 25) 판 밖(섹션 직속)에 글자를 붙여 판 위에 덮지 않았는가 ──
  //   ⑤·⑪·⑪-a 는 판(FRAME) 안만 본다. 섹션 자식으로 붙이면 같은 자리에 겹쳐 보여도 조용했다
  //   (🤖 component-verifier 12회차 N1).
  for (const sec of sheetSections) {
    // 섹션의 자식은 견본 판(프레임)뿐이어야 한다. 글자·사각형이 섹션에 직접 붙으면 판 위에 덮인다.
    const stray = sec.children.filter((n) => n.type !== "FRAME");
    if (stray.length) errors.push(`섹션 "${sec.name}" 에 판이 아닌 노드 ${stray.length}개가 직접 붙어 있습니다 (판 위에 덮어 그리는 수법)`);
    const notSheet = sec.children.filter((n) => n.type === "FRAME" && String(n.name).indexOf("Tokens · ") !== 0);
    if (notSheet.length) errors.push(`섹션 "${sec.name}" 에 견본 판이 아닌 틀 ${notSheet.length}개가 있습니다`);
  }

  // ── 29) 섹션 머리말 — 이름·개수·설명이 붙었는가, 판을 덮지 않는가 ──
  //   (river 요청 2026-09-23) 머리띠가 조용히 빠지거나 글자 없이 빈 띠로 나가는 것을 막는다.
  {
    const bcSrc = fs.readFileSync(path.join(SRC, "build-components.ts"), "utf8");
    const subtitleMap = {};
    for (const m of (bcSrc.match(/const SECTION_SUBTITLE[\s\S]*?\n\};/) || [""])[0]
      .matchAll(/"([^"]+)":\s*"([^"]+)"/g)) subtitleMap[m[1]] = m[2];
    for (const sec of sheetSections) {
      const heads = sec.children.filter((n) => n.type === "FRAME" && String(n.name).indexOf("Section Header") >= 0);
      if (heads.length !== 1) { errors.push(`섹션 "${sec.name}" 의 머리말이 ${heads.length}개입니다 — 1개여야 합니다`); continue; }
      const h = heads[0];
      if (h.name !== `${sec.name} — Section Header`) errors.push(`머리말 이름이 섹션과 어긋납니다: "${h.name}"`);
      const ht = h.findAll((n) => n.type === "TEXT").map((t) => String(t.characters));
      if (ht.indexOf(sec.name) < 0) errors.push(`머리말에 묶음 이름이 없습니다: "${sec.name}"`);
      const wantSub = Object.prototype.hasOwnProperty.call(subtitleMap, sec.name) ? subtitleMap[sec.name] : null;
      if (!wantSub) errors.push(`묶음 "${sec.name}" 의 한 줄 설명이 정본에 없습니다`);
      else if (!ht.some((c) => c.indexOf(wantSub) === 0)) errors.push(`머리말 설명이 정본과 다릅니다: "${sec.name}" → ${JSON.stringify(ht)}`);
      // 머리말 글자도 정본 스타일·Pretendard 여야 한다(H3) — 위 ③ 은 all 을 보므로 이미 포함되지만,
      //   빈 띠(글자 0개)는 그 검사에 안 걸린다. 여기서 막는다.
      if (!ht.length) errors.push(`섹션 "${sec.name}" 의 머리말이 글자 없는 빈 띠입니다`);
      // 머리말이 판을 덮지 않는가.
      const hb = h.absoluteBoundingBox;
      for (const f of sec.children.filter((n) => n.type === "FRAME" && n !== h)) {
        const b = f.absoluteBoundingBox;
        if (hb.x < b.x + b.width && b.x < hb.x + hb.width && hb.y < b.y + b.height && b.y < hb.y + hb.height) {
          errors.push(`섹션 "${sec.name}" 의 머리말이 판 "${f.name}" 을 덮습니다`);
          break;
        }
      }
    }
  }

  notes.push(`시트 ${result.sections.length}장 · 색 ${result.swatches}칸 · 글자 ${result.styles}종 · 숫자 ${result.numbers}개 · 노드 ${all.length}개`);
  notes.push(`판 크기: ${frames.map((f) => `${f.name.replace("Tokens · ", "")} ${Math.round(f.width)}×${Math.round(f.height)}`).join(" / ")}`);

  return { errors, notes };
}

if (require.main === module) {
  main().then(({ errors, notes }) => {
    for (const n of notes) console.log(`[토큰 견본] ${n}`);
    if (errors.length) {
      for (const e of errors) console.error(`[토큰 견본] ❌ ${e}`);
      process.exit(1);
    }
    console.log("[토큰 견본] ✅ 통과");
  }).catch((e) => { console.error("[토큰 견본] 실행 실패:", e); process.exit(1); });
}

module.exports = { main };
