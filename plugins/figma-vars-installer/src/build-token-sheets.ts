// @role: 기본 토큰(색·글자·숫자) 견본 시트 빌드 로직
/**
 * build-token-sheets.ts
 * 정본 토큰 데이터(vars-data.ts · textstyles-data.ts) → Figma 견본 시트 3장.
 *
 * 왜 필요한가(river 요청 2026-09-22):
 *   설치기는 종전까지 **부품(컴포넌트)만** 화면으로 깔았다. 색·글자·숫자 토큰은 Variables/Text styles
 *   패널 안의 목록으로만 들어가, 디자이너가 "우리 회색은 몇 단계고 어떤 색인지"를 눈으로 볼 판이 없었다.
 *   → 설치할 때마다 토큰 견본 시트를 **필수로** 함께 깐다(선택 항목 아님 — river 결정 2026-09-22).
 *
 * 시트 3장(각각 Figma Section 1개):
 *   · Tokens · Color       Foundation 팔레트 격자 + Semantic 역할색 목록(Light/Dark 두 벌)
 *   · Tokens · Typography  정본 텍스트 스타일 전종 실제 표본 + 크기·굵기·행간·자간
 *   · Tokens · Number      간격·반경·두께·글자크기 등 숫자 토큰(+ Semantic 별칭)
 *
 * 규칙(하드룰):
 *   · H2 — 모든 색은 Variable 바인딩. 견본 칩 자체가 그 토큰 변수에 물려 있어, 토큰 값이 바뀌면
 *          시트도 자동으로 따라 바뀐다(손으로 hex 를 적지 않는다. 옆의 hex 글자는 '설명 텍스트').
 *   · H3 — 모든 텍스트는 Pretendard + 정본 텍스트 스타일 바인딩.
 *   · 정본을 새로 만들지 않는다 — 이 파일은 vars-data/textstyles-data 를 **읽어 그리기만** 한다.
 *
 * 멱등: 같은 이름의 시트 섹션이 있으면 통째로 걷어내고 다시 그린다(재설치 시 겹쳐 쌓이지 않게).
 */

import type { BuildMaps } from "./build-components";
import { boundPaint, setMode, findAllOfTypes, wrapCategoryInSection, primeSpecMaps, buildAreaTitle, AREA_TITLE_SPACE, AREA_TITLE_SUFFIX, AREA_RULE_SUFFIX, SECTION_HEADER_SUFFIX } from "./build-components";
import { FOUNDATION_COLOR, FOUNDATION_NUMBER, SEMANTIC_COLOR, SEMANTIC_NUMBER } from "./vars-data";
import { TEXT_STYLES as TEXT_STYLE_DEFS, TEXT_STYLE_FONT_FAMILY } from "./textstyles-data";

/** 시트가 쓰는 입력 = 컴포넌트 빌드와 같은 맵 + (있으면) Semantic Number 변수. */
export interface TokenSheetMaps extends BuildMaps {
  semanticNumber?: Record<string, Variable>;
}

export interface TokenSheetResult {
  sections: string[];      // 만든 섹션 이름
  swatches: number;        // 색 견본 칸 수
  styles: number;          // 글자 표본 줄 수
  numbers: number;         // 숫자 토큰 줄 수
  skipped: string[];       // 재료가 없어 건너뛴 시트
  reused?: boolean;        // 같은 판이 이미 있어 다시 그리지 않음
}

// 견본판 모양을 정하는 소스의 지문 — 빌드 때 넣는다(scripts/lib/token-sheet-fingerprint.js).
//   빈 값이면(빌드 스크립트 밖에서 묶은 경우) 건너뛰기를 하지 않고 늘 새로 그린다.
declare const __TOKEN_SHEET_FINGERPRINT__: string;
const SHEET_BUILD_FP: string = typeof __TOKEN_SHEET_FINGERPRINT__ === "string" ? __TOKEN_SHEET_FINGERPRINT__ : "";
// 깔린 판에 붙여 두는 표식(섹션 pluginData). 값 = 아래 sheetStamp() + 판 개수.
const SHEET_STAMP_KEY = "s1.tokenSheetStamp";

// 시트 섹션 이름 — 재설치 때 이 이름으로 옛 시트를 걷어낸다.
export const TOKEN_SHEET_SECTIONS = [
  "Tokens · Color", "Tokens · Typography", "Tokens · Number",
  // 옛 이름(라이트·다크를 따로 떼어 놨던 시기) — 재설치 때 걷어내려고 남긴다.
  "Tokens · Color (Light)", "Tokens · Color (Dark)",
];

// 시트에서 쓰는 글자·면 토큰(전부 Semantic 정본에 이미 있는 것들).
const T = {
  title: "color/text/title/primary",
  body: "color/text/body/primary",
  sub: "color/text/body/secondary",
  meta: "color/text/body/tertiary",
  surface: "color/bg/level-0",
  band: "color/bg/level-2",
  line: "color/line/default",
  mark: "color/icon/gray-light",   // 자·모서리 상자 같은 '표시용 도형'. 바탕색 계열은 흰 판에서 안 보인다(실측 2026-09-22).
};

const FONT = TEXT_STYLE_FONT_FAMILY;

// 시트의 제목·라벨이 쓰는 정본 텍스트 스타일. 하나라도 파일에 없으면 **폴백으로 때우지 않고**
//   그 판을 만들지 않는다(하드룰 H3 — 정본 스타일 없이 글자를 찍지 않는다).
const REQUIRED_STYLES = ["title/16B", "title/14B", "body/12M", "body/12R", "body/10M", "body/10R"];

function styleDef(key: string): { fontStyle: string; fontSize: number } {
  for (const d of TEXT_STYLE_DEFS) if (d.name === key) return { fontStyle: d.fontStyle, fontSize: d.fontSize };
  return { fontStyle: "Regular", fontSize: 12 };
}

async function loadSheetFonts(): Promise<void> {
  for (const style of ["Regular", "Medium", "Bold"]) {
    try { await figma.loadFontAsync({ family: FONT, style }); } catch (e) { /* 폰트 미설치 파일 → 아래에서 실패 */ }
  }
}

/** 정본 텍스트 스타일 + Semantic 색에 묶인 글자.
 *  스타일이 없는 경우는 여기 오기 전에 걸러진다(REQUIRED_STYLES·hasAllStyles) — raw 글꼴로 때우지 않는다. */
async function text(
  maps: TokenSheetMaps, chars: string, styleKey: string, colorKey: string,
  x: number, y: number, w: number, align: "LEFT" | "CENTER" | "RIGHT" = "LEFT",
  noWrap = false,
): Promise<TextNode> {
  const def = styleDef(styleKey);
  const t = track(figma.createText());
  t.fontName = { family: FONT, style: def.fontStyle };
  t.fontSize = def.fontSize;
  t.characters = chars;
  const ts = maps.textStyles[styleKey];
  if (ts) { try { await t.setTextStyleIdAsync(ts.id); } catch (e) { /* raw 유지 */ } }
  if (noWrap) {
    t.textAutoResize = "WIDTH_AND_HEIGHT";     // 큰 글자 표본이 칸에서 접혀 아랫줄과 겹치는 것을 막는다
  } else {
    t.textAutoResize = "HEIGHT";
    t.resize(w, t.height);
  }
  t.textAlignHorizontal = align;
  t.x = x; t.y = y;
  const v = maps.semanticColor[colorKey];
  if (v) t.fills = [boundPaint(v)];
  else t.fills = [];                       // 토큰이 없으면 raw 색을 만들지 않는다(H2)
  return t;
}

/** 견본 칩 — 채움은 그 토큰 변수에 직접 바인딩, 테두리는 선 토큰(흰 칩도 보이게). */
function chip(maps: TokenSheetMaps, v: Variable | undefined, x: number, y: number, w: number, h: number): RectangleNode {
  const r = track(figma.createRectangle());
  r.x = x; r.y = y; r.resize(w, h);
  r.fills = v ? [boundPaint(v)] : [];
  const line = maps.semanticColor[T.line];
  if (line) { r.strokes = [boundPaint(line)]; r.strokeWeight = 1; }
  const radius = maps.foundationNumber["radius/4"];
  if (radius) {
    for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const) {
      try { r.setBoundVariable(corner, radius); } catch (e) { r.cornerRadius = 4; }
    }
  } else { r.cornerRadius = 4; }
  return r;
}

// 이번 실행에서 만든 노드. Figma 는 `createFrame()`·`createText()`·`createRectangle()` 하는 순간
//   그 노드를 페이지에 붙이므로, **만드는 즉시** 여기에 등록해야 도중에 터졌을 때 그리다 만 것까지
//   되감을 수 있다(🤖 component-verifier 실측 2026-09-22 — 판은 되감겼지만 글자 1개가 남았다).
let PENDING_NODES: SceneNode[] = [];
function track<T extends SceneNode>(n: T): T { PENDING_NODES.push(n); return n; }

/** 묶음 머리띠 — 제목 뒤에 깔리는 옅은 띠. 묶음이 어디서 시작하는지 눈으로 끊어 준다. */
function groupBand(maps: TokenSheetMaps, x: number, y: number, w: number, h: number): RectangleNode {
  const r = track(figma.createRectangle());
  r.name = "group band";
  r.x = x; r.y = y; r.resize(w, h);
  const v = maps.semanticColor[T.band];
  r.fills = v ? [boundPaint(v)] : [];
  const radius = maps.foundationNumber["radius/4"];
  if (radius) {
    for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const) {
      try { r.setBoundVariable(corner, radius); } catch (e) { r.cornerRadius = 4; }
    }
  } else { r.cornerRadius = 4; }
  return r;
}

/** 묶음 끝 구분선 — 다음 묶음과 섞이지 않게 한 줄 긋는다. */
function groupRule(maps: TokenSheetMaps, x: number, y: number, w: number): RectangleNode {
  const r = track(figma.createRectangle());
  r.name = "group rule";
  r.x = x; r.y = y; r.resize(w, 1);
  const v = maps.semanticColor[T.line];
  r.fills = v ? [boundPaint(v)] : [];
  return r;
}

/** 시트 바탕 프레임. 면 색은 Semantic 토큰, 모드는 인자로 받은 것으로 고정한다. */
function sheetFrame(maps: TokenSheetMaps, name: string, modeId: string, surfaceKey: string): FrameNode {
  const f = track(figma.createFrame());
  f.name = name;
  f.clipsContent = false;
  const v = maps.semanticColor[surfaceKey];
  f.fills = v ? [boundPaint(v)] : [];
  if (modeId) { try { setMode(f as unknown as SceneNode, maps, modeId); } catch (e) { /* 구버전 API */ } }
  return f;
}

/** 키를 첫 마디로 묶는다(삽입 순서 보존). */
function groupByHead(keys: string[]): { head: string; members: string[] }[] {
  const order: string[] = [];
  const bag: { [head: string]: string[] } = {};
  for (const k of keys) {
    const head = k.indexOf("/") >= 0 ? k.slice(0, k.indexOf("/")) : k;
    if (!Object.prototype.hasOwnProperty.call(bag, head)) { bag[head] = []; order.push(head); }
    bag[head].push(k);
  }
  return order.map((head) => ({ head, members: bag[head] }));
}

/** Semantic 색은 `color/<그룹>/…` — 두 마디까지를 묶음 이름으로 쓴다. */
function groupSemantic(keys: string[]): { head: string; members: string[] }[] {
  const order: string[] = [];
  const bag: { [head: string]: string[] } = {};
  for (const k of keys) {
    const parts = k.split("/");
    const head = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : k;
    if (!Object.prototype.hasOwnProperty.call(bag, head)) { bag[head] = []; order.push(head); }
    bag[head].push(k);
  }
  return order.map((head) => ({ head, members: bag[head] }));
}

/** Foundation 한 칸이 역할색(Semantic)에 몇 번 쓰이는지 — 정본에서 세기만 한다.
 *  Light·Dark 양쪽 별칭을 모두 센다. "무엇이 대표(Primary)인가"를 내가 정하지 않고,
 *  **정본이 실제로 가장 많이 쓰는 단계**를 그대로 표시하기 위한 근거다(river 요청 2026-09-22). */
function semanticUsage(mode: "light" | "dark"): { [foundationKey: string]: number } {
  const count: { [k: string]: number } = {};
  const bump = (k: string): void => {
    if (!k || k.indexOf("#") === 0 || k.indexOf("rgba") === 0) return;   // 색 리터럴은 Foundation 칸이 아니다
    count[k] = (Object.prototype.hasOwnProperty.call(count, k) ? count[k] : 0) + 1;
  };
  // 판마다 그 판의 별칭만 센다 — 밝은 판에 "다크에서 몇 곳" 이 섞이면 대표 판정이 흐려진다.
  for (const key of Object.keys(SEMANTIC_COLOR)) bump(mode === "dark" ? SEMANTIC_COLOR[key].dark : SEMANTIC_COLOR[key].light);
  return count;
}

// 글자 표본 문구 — river 지정 2026-09-23.
const TYPE_SAMPLE = "S-1 S/W UX 디자인가이드 타이포그래피";

// 견본 시트에 남기는 **공통** 역할색 묶음(river 결정 2026-09-23).
//   역할색 184개 중 특정 부품 전용(button·chip·date-picker…) 155개는 이 판에서 빼고,
//   빼고, 여기 남는 것은 어느 부품에도 매이지 않고 화면 전체가 공유하는 것뿐이다 —
//   한 판에 184개를 줄줄이 쌓으면 아무도 읽지 않는다. 뺀 것은 Figma Variables 패널에 그대로 있다.
//   (부품 세트 아래 「쓰는 색」 꼬리표로 옮기려던 계획은 2026-09-23 river 지시로 철거됐다.)
const COMMON_SEMANTIC_HEADS = [
  "color/bg", "color/surface", "color/text", "color/line", "color/icon", "color/overlay", "color/scroll",
];

// 대표값을 표시할 계열 — river 결정 2026-09-23: "대표색상 표시는 blue, red, blue dark, red dark 에만".
//   회색 계열은 단계가 많고 쓰임이 넓어 대표를 세워도 읽는 데 도움이 안 된다.
const PRIMARY_GROUPS = ["blue", "red", "blue-dark", "red-dark"];

/** 계열(blue·red …)마다 역할색이 가장 많이 쓰는 칸 = 그 계열의 대표값. 동률이면 앞 칸.
 *  대표를 표시하지 않는 계열은 null 을 돌려준다. */
function primaryOfGroup(head: string, members: string[], usage: { [k: string]: number }): string | null {
  if (PRIMARY_GROUPS.indexOf(head) < 0) return null;
  let best: string | null = null, bestN = 0;
  for (const k of members) {
    const n = Object.prototype.hasOwnProperty.call(usage, k) ? usage[k] : 0;
    if (n > bestN) { best = k; bestN = n; }
  }
  return bestN > 0 ? best : null;
}

// ── 시트 A: 색 ───────────────────────────────────────────────────────────────

const PAD = 40;
const SHEET_TITLE_H = 60;

/** Foundation 팔레트 격자 한 벌.
 *  dark=false → `-dark` 가 아닌 계열(밝은 화면에서 쓰는 단계)을 흰 판 위에,
 *  dark=true  → `-dark` 계열을 **Dark 모드를 박은 어두운 판** 위에 얹는다.
 *  (river 요청 2026-09-23 — 어두운 단계를 흰 바탕에 늘어놓으면 실제 쓰이는 화면과 달라 보인다.
 *   부품 세트의 Spec Dark 프레임과 같은 방식이다.) */
async function buildFoundationColor(maps: TokenSheetMaps, dark: boolean): Promise<{ frame: FrameNode; count: number }> {
  const COLS = 11, CW = 116, SW = 104, SH = 56, CH = 124, GROUP_TITLE_H = 30, GROUP_GAP = 24;
  const usage = semanticUsage(dark ? "dark" : "light");
  const modeId = dark ? maps.semanticDarkModeId : maps.semanticLightModeId;
  const f = sheetFrame(maps, `Tokens · Color — Foundation ${dark ? "Dark" : "Light"}`, modeId, T.surface);
  let y = PAD;
  f.appendChild(await text(maps, `Foundation · 기본 팔레트 (${dark ? "Dark" : "Light"})`, "title/16B", T.title, PAD, y, 600));
  y += SHEET_TITLE_H;
  let count = 0;
  const all = groupByHead(Object.keys(FOUNDATION_COLOR));
  // 계열 이름 끝이 `-dark` 인가로 두 판을 가른다 — 정본 이름 규칙 그대로이고 목록을 손으로 적지 않는다.
  const groups = all.filter((g) => (g.head.length > 5 && g.head.slice(-5) === "-dark") === dark);
  for (const g of groups) {
    const primary = primaryOfGroup(g.head, g.members, usage);
    // 대표 표시는 지정된 계열에만. 나머지는 계열 이름만 적는다(river 결정 2026-09-23).
    const head = primary
      ? `${g.head} — 대표 ${primary.slice(primary.indexOf("/") + 1)} (역할색 ${usage[primary]}곳)`
      : g.head;
    f.appendChild(await text(maps, head, "title/14B", T.body, PAD, y, 600));
    y += GROUP_TITLE_H;
    for (let i = 0; i < g.members.length; i++) {
      const key = g.members[i];
      const col = i % COLS, row = Math.floor(i / COLS);
      const x = PAD + col * CW, cy = y + row * CH;
      const used = Object.prototype.hasOwnProperty.call(usage, key) ? usage[key] : 0;
      const isPrimary = key === primary;
      const sw = chip(maps, maps.foundationColor[key], x, cy, SW, SH);
      if (isPrimary) {
        // 대표 칸은 테두리를 파란 선 토큰으로 굵게 — 눈으로 바로 찾히게(색은 정본 토큰 그대로).
        const accent = maps.semanticColor["color/line/blue"];
        if (accent) { try { sw.strokes = [boundPaint(accent)]; sw.strokeWeight = 3; } catch (e) { /* */ } }
      }
      f.appendChild(sw);
      f.appendChild(await text(maps, key.slice(key.indexOf("/") + 1), "body/10M", T.body, x, cy + SH + 6, SW));
      f.appendChild(await text(maps, FOUNDATION_COLOR[key], "body/10R", T.meta, x, cy + SH + 22, SW));
      // 쓰임 횟수도 대표를 표시하는 계열에만 적는다 — 대표 판정의 근거를 그 자리에서 보이기 위한 것이라
      //   대표를 안 세우는 계열에서는 읽을 이유가 없다.
      if (used && primary) {
        f.appendChild(await text(maps, isPrimary ? `★ 대표 · 역할색 ${used}곳` : `역할색 ${used}곳`,
          "body/10R", isPrimary ? "color/text/state/accent" : T.meta, x, cy + SH + 38, SW));
      }
      count++;
    }
    y += Math.ceil(g.members.length / COLS) * CH + GROUP_GAP;
  }
  f.resize(PAD * 2 + COLS * CW, y + PAD);
  return { frame: f, count };
}

/** Semantic 역할색 목록 한 벌(Light 또는 Dark). */
async function buildSemanticColor(maps: TokenSheetMaps, dark: boolean): Promise<{ frame: FrameNode; count: number }> {
  const ROW_H = 30, COL_W = 560, COL_MAX_H = 3200, GROUP_TITLE_H = 30, GROUP_GAP = 16;
  const modeId = dark ? maps.semanticDarkModeId : maps.semanticLightModeId;
  const f = sheetFrame(maps, `Tokens · Color — Semantic ${dark ? "Dark" : "Light"}`, modeId, T.surface);
  // 제목·안내는 한 칸 폭 안에 들어가야 한다 — 칸이 하나뿐인 판에서 글자가 판 밖으로 나간다.
  f.appendChild(await text(maps, `Semantic · 공통 역할색 (${dark ? "Dark" : "Light"})`, "title/16B", T.title, PAD, PAD, COL_W - 40));
  f.appendChild(await text(maps, "부품 전용 색은 Figma Variables 패널에서 봅니다.",
    "body/12R", T.meta, PAD, PAD + 26, COL_W - 40));
  const top = PAD + SHEET_TITLE_H;
  let x = PAD, y = top, maxY = top, count = 0;
  const groups = groupSemantic(Object.keys(SEMANTIC_COLOR))
    .filter((g) => COMMON_SEMANTIC_HEADS.indexOf(g.head) >= 0);
  for (const g of groups) {
    const blockH = GROUP_TITLE_H + g.members.length * ROW_H + GROUP_GAP;
    if (y > top && y + blockH > COL_MAX_H) { x += COL_W; y = top; }   // 다음 칸으로 넘긴다
    f.appendChild(await text(maps, g.head, "title/14B", T.body, x, y, COL_W - 40));
    y += GROUP_TITLE_H;
    for (const key of g.members) {
      f.appendChild(chip(maps, maps.semanticColor[key], x, y, 24, 24));
      f.appendChild(await text(maps, key, "body/12R", T.body, x + 34, y + 4, 300));
      const entry = SEMANTIC_COLOR[key];
      f.appendChild(await text(maps, dark ? entry.dark : entry.light, "body/12R", T.meta, x + 344, y + 4, COL_W - 384));
      y += ROW_H;
      count++;
    }
    y += GROUP_GAP;
    if (y > maxY) maxY = y;
  }
  f.resize(x + COL_W, Math.max(maxY, y) + PAD);
  return { frame: f, count };
}

// ── 시트 B: 글자 ─────────────────────────────────────────────────────────────

async function buildTypography(maps: TokenSheetMaps): Promise<{ frame: FrameNode; count: number }> {
  const NAME_W = 150, SAMPLE_X = 200, SAMPLE_W = 760, SPEC_X = 1020, SPEC_W = 320;
  const f = sheetFrame(maps, "Tokens · Typography", maps.semanticLightModeId, T.surface);
  let y = PAD;
  f.appendChild(await text(maps, "Typography · 글자 스타일", "title/16B", T.title, PAD, y, 600));
  y += SHEET_TITLE_H;
  let count = 0;
  for (const d of TEXT_STYLE_DEFS) {
    const rowH = Math.max(52, Math.round(d.fontSize * (d.lineHeightPercent / 100)) + 28);
    f.appendChild(await text(maps, d.name, "body/12M", T.sub, PAD, y + 8, NAME_W));
    // 표본은 그 스타일 자체로 — 이 줄이 스타일의 실물이다.
    f.appendChild(await text(maps, TYPE_SAMPLE, d.name, T.body, SAMPLE_X, y, SAMPLE_W, "LEFT", true));
    const spec = `${d.fontSize}px · ${d.fontStyle} · 행간 ${d.lineHeightPercent}% · 자간 ${d.letterSpacingPercent}%`;
    f.appendChild(await text(maps, spec, "body/12R", T.meta, SPEC_X, y + 8, SPEC_W));
    y += rowH;
    count++;
  }
  f.resize(SPEC_X + SPEC_W + PAD, y + PAD);
  return { frame: f, count };
}

// ── 시트 C: 숫자 ─────────────────────────────────────────────────────────────

// 자(bar)로 길이를 보여줄 묶음 — 나머지는 값 글자만 보여준다(굵기·투명도·중단점은 길이가 뜻이 없다).
const BAR_HEADS = ["spacing", "sizing", "border-width"];
const BAR_MAX = 320;

async function buildNumber(maps: TokenSheetMaps): Promise<{ frame: FrameNode; count: number }> {
  const ROW_H = 32, NAME_W = 190, VALUE_W = 70, BAR_X = PAD + NAME_W + VALUE_W + 20;
  // 묶음 구분(river 요청 2026-09-22): 머리띠(BAND_H) → 목록 → 구분선 → 넉넉한 여백(GROUP_GAP).
  //   종전에는 제목 한 줄과 16px 여백뿐이라 spacing·radius·sizing 이 한 덩어리로 읽혔다.
  const COL_W = BAR_X + BAR_MAX + 60, COL_MAX_H = 2400;
  const BAND_H = 32, BAND_W = COL_W - 60, GROUP_TITLE_H = BAND_H + 12, GROUP_GAP = 44, ROWS_INDENT = 12;
  const f = sheetFrame(maps, "Tokens · Number", maps.semanticLightModeId, T.surface);
  f.appendChild(await text(maps, "Number · 간격 · 반경 · 두께", "title/16B", T.title, PAD, PAD, 600));
  const top = PAD + SHEET_TITLE_H;
  let x = PAD, y = top, maxY = top, count = 0;
  const markVar = maps.semanticColor[T.mark];

  for (const g of groupByHead(Object.keys(FOUNDATION_NUMBER))) {
    const blockH = GROUP_TITLE_H + g.members.length * ROW_H + GROUP_GAP;
    if (y > top && y + blockH > COL_MAX_H) { x += COL_W; y = top; }
    f.appendChild(groupBand(maps, x, y, BAND_W, BAND_H));
    f.appendChild(await text(maps, `${g.head} · ${g.members.length}개`, "title/14B", T.body, x + 12, y + 8, 300));
    y += GROUP_TITLE_H;
    for (const key of g.members) {
      const value = FOUNDATION_NUMBER[key];
      const v = maps.foundationNumber[key];
      f.appendChild(await text(maps, key, "body/12R", T.body, x + ROWS_INDENT, y + 6, NAME_W));
      f.appendChild(await text(maps, String(value), "body/12M", T.sub, x + ROWS_INDENT + NAME_W, y + 6, VALUE_W, "RIGHT"));
      if (BAR_HEADS.indexOf(g.head) >= 0 && value > 0) {
        const bar = track(figma.createRectangle());
        bar.name = `${key} bar`;
        bar.x = x + ROWS_INDENT + NAME_W + VALUE_W + 20; bar.y = y + 10;
        bar.resize(Math.max(1, Math.min(value, BAR_MAX)), 12);
        bar.fills = markVar ? [boundPaint(markVar)] : [];
        // 값이 자 길이 그대로인 칸만 변수에 묶는다 — 잘라 그린 칸을 묶으면 길이가 거짓이 된다.
        if (v && value <= BAR_MAX) { try { bar.setBoundVariable("width", v); } catch (e) { /* 구버전 API */ } }
        f.appendChild(bar);
      } else if (g.head === "radius") {
        const box = track(figma.createRectangle());
        box.name = `${key} box`;
        box.x = x + ROWS_INDENT + NAME_W + VALUE_W + 20; box.y = y + 2;
        box.resize(28, 28);
        box.fills = markVar ? [boundPaint(markVar)] : [];
        if (v) {
          for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const) {
            try { box.setBoundVariable(corner, v); } catch (e) { box.cornerRadius = Math.min(value, 14); }
          }
        } else { box.cornerRadius = Math.min(value, 14); }
        f.appendChild(box);
      }
      y += ROW_H;
      count++;
    }
    y += 12;
    f.appendChild(groupRule(maps, x, y, BAND_W));
    y += GROUP_GAP;
    if (y > maxY) maxY = y;
  }

  // Semantic Number — 값이 아니라 "어느 Foundation 을 가리키는가"를 보여준다.
  const semKeys = Object.keys(SEMANTIC_NUMBER);
  if (semKeys.length) {
    const blockH = GROUP_TITLE_H + semKeys.length * ROW_H + GROUP_GAP;
    if (y > top && y + blockH > COL_MAX_H) { x += COL_W; y = top; }
    f.appendChild(groupBand(maps, x, y, BAND_W, BAND_H));
    f.appendChild(await text(maps, `Semantic Number · ${semKeys.length}개`, "title/14B", T.body, x + 12, y + 8, 300));
    y += GROUP_TITLE_H;
    for (const key of semKeys) {
      f.appendChild(await text(maps, key, "body/12R", T.body, x + ROWS_INDENT, y + 6, NAME_W + 60));
      f.appendChild(await text(maps, String(SEMANTIC_NUMBER[key]), "body/12R", T.meta, x + ROWS_INDENT + NAME_W + 70, y + 6, 240));
      y += ROW_H;
      count++;
    }
    y += 12;
    f.appendChild(groupRule(maps, x, y, BAND_W));
    y += GROUP_GAP;
    if (y > maxY) maxY = y;
  }

  f.resize(x + COL_W, Math.max(maxY, y) + PAD);
  return { frame: f, count };
}

// ── 같은 판이 이미 있으면 건너뛰기 (river 2026-10-02 — 설치 시간 줄이기) ─────────────
//   판의 색·글자는 변수·텍스트 스타일에 **묶여** 있어, 값만 바뀐 재설치라면 이미 깔린 판이 저절로 따라간다.
//   그래서 다시 그려야 하는 경우는 셋뿐이다: ①판 그리는 소스·토큰 목록이 바뀜(빌드 지문)
//   ②판이 가리키는 변수·스타일이 새로 만들어짐(id 가 바뀌면 옛 판의 묶음이 끊긴다) ③판이 지워졌거나 모자람.
//   셋 다 아니면 그대로 두고 지난번 개수를 그대로 알린다.

/** 판이 묶이는 재료의 신원(id)과 판 구성 조건을 한 줄로 — 짧은 해시로 줄인다. */
function sheetStamp(maps: TokenSheetMaps, flags: string): string {
  const parts: string[] = [SHEET_BUILD_FP, flags,
    String(maps.semanticColorCollectionId || ""), String(maps.semanticLightModeId || ""), String(maps.semanticDarkModeId || "")];
  const add = (tag: string, rec: Record<string, { id: string }> | undefined) => {
    if (!rec) return;
    for (const k of Object.keys(rec).sort()) {
      let id = ""; try { id = String(rec[k].id); } catch (e) { /* */ }
      parts.push(`${tag}:${k}=${id}`);
    }
  };
  add("fc", maps.foundationColor); add("sc", maps.semanticColor);
  add("fn", maps.foundationNumber); add("sn", maps.semanticNumber);
  add("ts", maps.textStyles as unknown as Record<string, { id: string }>);
  // FNV-1a 32비트 두 벌(정방향·역방향) — 충돌 걱정 없이 짧게.
  const text = parts.join("\n");
  let h1 = 0x811c9dc5, h2 = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h1 = Math.imul(h1 ^ text.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ text.charCodeAt(text.length - 1 - i), 0x01000193) >>> 0;
  }
  return `${SHEET_BUILD_FP}-${h1.toString(16)}${h2.toString(16)}`;
}

// 판 배치 수치 — 그리기 경로와 건너뛰기 경로가 같은 값을 쓴다.
const SHEET_PAD = 64;           // 섹션 안쪽 좌우·아래 여백(wrapCategoryInSection 과 같은 값)
const SHEET_TITLE_SPACE = 140;  // 섹션 머리말 자리

// 판 안의 그림 수를 셀 때 보는 종류 — 판이 만드는 것은 틀·글자·사각형뿐이고, 나머지는 여유분이다.
const SHEET_NODE_TYPES: NodeType[] = ["FRAME", "TEXT", "RECTANGLE", "LINE", "ELLIPSE", "GROUP", "VECTOR", "INSTANCE"];

/** 섹션 안 그림 수(머리띠 포함). 셀 수 없는 환경이면 -1 → 건너뛰지 않는다. */
function countSheetNodes(sec: SectionNode): number {
  try {
    const hits = (sec as any).findAllWithCriteria({ types: SHEET_NODE_TYPES });
    return Array.isArray(hits) ? hits.length : -1;
  } catch (e) { return -1; }
}

interface ReuseHit {
  result: TokenSheetResult;
  sections: SectionNode[];
  totalW: number;
  offX: number;   // 색 섹션 x − 판 원점 x (그렸을 때 기준)
  offY: number;
}

/** 기대하는 판 섹션이 전부 한 장씩 있고, 표식·머리띠·그림 수가 그렸을 때와 같으면 재사용 정보를 돌려준다.
 *  그림 수까지 대조한다 — 섹션에는 머리띠가 늘 들어 있어 "비어 있지 않음"만으로는 판 일부를 지운 것을 못 잡는다
 *  (🤖 component-verifier 2026-10-02 a-3). 머리띠가 없는 판도 다시 그린다. */
function reuseExistingSheets(stamp: string, titles: string[], skipped: string[]): ReuseHit | null {
  if (!SHEET_BUILD_FP) return null;
  const sections: SectionNode[] = [];
  let saved: { swatches: number; styles: number; numbers: number; totalW: number; offX: number; offY: number } | null = null;
  for (const title of titles) {
    const secs = findAllOfTypes(figma.currentPage, ["SECTION"], (n) => n.name === title);
    if (secs.length !== 1) return null;
    const sec = secs[0] as SectionNode;
    try { if (!sec.parent || sec.parent.type !== "PAGE") return null; } catch (e) { return null; }
    let hasHeader = false;
    try {
      for (const k of sec.children) {
        const nm = String(k.name);
        if (nm.length >= SECTION_HEADER_SUFFIX.length && nm.slice(nm.length - SECTION_HEADER_SUFFIX.length) === SECTION_HEADER_SUFFIX) { hasHeader = true; break; }
      }
    } catch (e) { return null; }
    if (!hasHeader) return null;
    let raw = "";
    try { raw = sec.getPluginData(SHEET_STAMP_KEY); } catch (e) { return null; }
    if (!raw) return null;
    try {
      const v = JSON.parse(raw);
      if (!v || v.stamp !== stamp) return null;
      const n = countSheetNodes(sec);
      if (n < 0 || n !== Number(v.nodes)) return null;
      if (typeof v.totalW !== "number" || typeof v.offX !== "number" || typeof v.offY !== "number") return null;
      saved = { swatches: Number(v.swatches) || 0, styles: Number(v.styles) || 0, numbers: Number(v.numbers) || 0,
        totalW: v.totalW, offX: v.offX, offY: v.offY };
    } catch (e) { return null; }
    sections.push(sec);
  }
  if (!saved || !sections.length) return null;
  return {
    result: { sections: titles.slice(), swatches: saved.swatches, styles: saved.styles, numbers: saved.numbers, skipped: skipped.slice(), reused: true },
    sections, totalW: saved.totalW, offX: saved.offX, offY: saved.offY,
  };
}

/** 새로 그린 판 섹션마다 표식을 남긴다(다음 설치의 건너뛰기 판단용).
 *  판 원점과 색 섹션의 거리도 함께 적는다 — 다음 설치에서 부품이 새로 깔려 빈자리가 바뀌면 판을 그만큼 옮긴다. */
function stampSheets(stamp: string, result: TokenSheetResult, totalW: number, origin: { x: number; y: number }): void {
  if (!SHEET_BUILD_FP) return;
  const color = findAllOfTypes(figma.currentPage, ["SECTION"], (n) => n.name === result.sections[0]);
  if (color.length !== 1) return;
  let offX = 0, offY = 0;
  try { offX = (color[0] as SectionNode).x - origin.x; offY = (color[0] as SectionNode).y - origin.y; } catch (e) { return; }
  for (const title of result.sections) {
    for (const sec of findAllOfTypes(figma.currentPage, ["SECTION"], (n) => n.name === title)) {
      const nodes = countSheetNodes(sec as SectionNode);
      if (nodes < 0) continue;   // 셀 수 없으면 표식을 남기지 않는다 → 다음에도 다시 그린다
      const value = JSON.stringify({ stamp, swatches: result.swatches, styles: result.styles, numbers: result.numbers, nodes, totalW, offX, offY });
      try { sec.setPluginData(SHEET_STAMP_KEY, value); } catch (e) { /* 표식 실패 → 다음엔 다시 그릴 뿐 */ }
    }
  }
}

// ── 배치 · 멱등 정리 ─────────────────────────────────────────────────────────

/** 옛 시트를 통째로 걷어낸다(섹션 + 그 안의 내용). 시트 이름은 설치기만 쓰는 이름이다. */
function removeOldSheets(): void {
  let sections: SceneNode[] = [];
  try {
    sections = findAllOfTypes(figma.currentPage, ["SECTION"],
      (n) => TOKEN_SHEET_SECTIONS.indexOf(n.name) >= 0,
    );
  } catch (e) { return; }
  if (!Array.isArray(sections)) return;
  for (const s of sections) { try { s.remove(); } catch (e) { /* 이미 지워짐 */ } }
}

/** 이미 깔린 것(부품 섹션 등)의 왼쪽 빈자리를 찾는다 — 시트가 부품과 겹치지 않게. */
function originLeftOfContent(totalW: number, exclude: SceneNode[]): { x: number; y: number } {
  let minX = Infinity, minY = Infinity;
  const skip = new Set<string>();
  for (const n of exclude) { try { skip.add(String(n.id)); } catch (e) { /* mock */ } }
  try {
    const kids = figma.currentPage.children;
    if (Array.isArray(kids)) {
      for (const n of kids) {
        let id = ""; try { id = String((n as SceneNode).id); } catch (e) { /* mock */ }
        if (id && skip.has(id)) continue;                 // 이번에 만든 판은 기준에서 뺀다
        // 영역 제목은 **우리가 놓은 표지**다 — 기준에 넣으면 회차마다 판이 왼쪽·위로 밀려난다.
        let nm = ""; try { nm = String((n as SceneNode).name); } catch (e) { /* mock */ }
        if (nm.length > AREA_TITLE_SUFFIX.length
          && nm.slice(nm.length - AREA_TITLE_SUFFIX.length) === AREA_TITLE_SUFFIX) continue;
        if (nm.length > AREA_RULE_SUFFIX.length
          && nm.slice(nm.length - AREA_RULE_SUFFIX.length) === AREA_RULE_SUFFIX) continue;
        const b = (n as SceneNode).absoluteBoundingBox;
        if (!b || typeof b.x !== "number") continue;
        if (b.x < minX) minX = b.x;
        if (b.y < minY) minY = b.y;
      }
    }
  } catch (e) { /* mock */ }
  if (minX === Infinity) return { x: 0, y: 0 };
  // ⚠️ 여기서 돌려주는 y 는 **판(frame)** 의 y 다. 섹션은 그보다 머리말 자리(140)만큼 위로 올라간다.
  //   그래서 부품 섹션 윗변과 토큰 섹션 윗변을 맞추려면 판을 그만큼 내려야 한다
  //   (river 지적 2026-09-28: "토큰과 코어컴포넌트 상단 라인이 안 맞는다").
  // 부품 첫 섹션(Platform)과 토큰 판 사이는 넉넉히 띄운다 — 붙어 있으면 한 덩어리로 보인다
  //   (river 지시 2026-09-28). totalW 는 섹션 여백까지 포함한 폭이다.
  return { x: minX - totalW - 1200, y: minY + 140 };
}

/**
 * 토큰 견본 시트 3장을 현재 페이지에 깐다.
 * 재료(변수·텍스트 스타일)가 없는 시트는 건너뛰고 그 사실을 반환한다 — 조용히 반쪽이 되지 않게.
 */
export async function buildTokenSheets(
  maps: TokenSheetMaps,
  onProgress?: (step: string, pct: number) => void,
): Promise<TokenSheetResult> {
  const result: TokenSheetResult = { sections: [], swatches: 0, styles: 0, numbers: 0, skipped: [] };
  if (typeof figma.createFrame !== "function") return result;   // mock(키체크) 환경
  primeSpecMaps(maps);                                          // 섹션 면·선 토큰 바인딩에 사용
  PENDING_NODES = [];
  await loadSheetFonts();

  const hasFoundationColor = Object.keys(maps.foundationColor || {}).length > 0;
  const hasSemanticColor = Object.keys(maps.semanticColor || {}).length > 0;
  const hasNumbers = Object.keys(maps.foundationNumber || {}).length > 0;
  const missingStyles = REQUIRED_STYLES.filter((k) => !maps.textStyles || !maps.textStyles[k]);
  // 글자 표본 판은 정본 스타일 전종이 있어야 만든다(일부만 있으면 표본이 거짓이 된다).
  //  ⚠️ 이 가드(정본 **전종** 존재)가 글자 판 안에서 어떤 정본 스타일을 써도 안전한 근거다.
  //     완화하면 목록(REQUIRED_STYLES) 밖 스타일이 조용히 raw 글꼴로 떨어지는 구멍이 즉시 열린다
  //     (🤖 component-verifier 4회차 MC 판정 2026-09-22).
  const hasAllStyles = TEXT_STYLE_DEFS.every((d) => maps.textStyles && maps.textStyles[d.name]);

  // Semantic 색이 없으면 **어떤 판도 만들지 않는다.** 판의 글자·면·선이 전부 Semantic 토큰이라,
  //   없는 채로 그리면 글자 없는 흰 판 + 토큰에 안 걸린 Figma 기본 색(H2 위반)이 남는다.
  if (!hasSemanticColor) {
    result.skipped.push("색·글자·숫자 — 역할색(Semantic) 토큰이 이 파일에 없습니다");
    return result;
  }
  // 라벨 스타일이 없으면 마찬가지로 만들지 않는다 — raw 글꼴로 때우지 않는다(H3).
  if (missingStyles.length) {
    result.skipped.push("색·글자·숫자 — 글자 스타일이 이 파일에 없습니다");
    return result;
  }
  // Dark 모드가 없는 파일에서는 Light 로 대체되므로, "Dark" 라는 이름의 라이트 판을 만들지 않는다.
  const hasDarkMode = !!maps.semanticDarkModeId && maps.semanticDarkModeId !== maps.semanticLightModeId;

  // 순서가 중요하다: ①판을 다 만든다 ②옛 판을 걷는다 ③실제 폭으로 자리를 잡는다 ④섹션으로 묶는다.
  //   먼저 걷어내고 만들면, 중간에 실패했을 때 옛 판은 이미 사라지고 만들다 만 조각만 남는다
  //   (🤖 component-verifier 지적 2026-09-22 a-1).
  const made: FrameNode[] = [];
  // 한 줄(row)에 섹션 여러 개를 좌우로 놓는다 — 색 라이트|다크, 글자|숫자 (river 지시 2026-09-28).
  //   한 섹션 안의 판은 **세로로 쌓는다** — 공통 역할색(Semantic)이 기본 팔레트(Foundation) 아래로 간다.
  //   한 섹션 = 세로로 쌓은 판 묶음(col) 여러 개를 좌우로. 색은 한 섹션 안에서 라이트|다크 두 줄기다.
  const rows: { title: string; cols: FrameNode[][] }[][] = [];

  // 같은 판이 이미 깔려 있으면 다시 그리지 않는다. 기대 판 목록·건너뜀 안내는 아래 그리기와 같은 조건으로 만든다.
  const expectTitles = ["Tokens · Color"];
  if (hasAllStyles) expectTitles.push("Tokens · Typography");
  if (hasNumbers) expectTitles.push("Tokens · Number");
  const expectSkipped: string[] = [];
  if (!hasFoundationColor) expectSkipped.push("Foundation 팔레트 판 — 기본 팔레트 변수가 이 파일에 없습니다");
  if (!hasDarkMode) expectSkipped.push("색 Dark 섹션 — 이 파일에 Dark 모드가 없습니다");
  if (!hasAllStyles) expectSkipped.push("글자 판 — 글자 스타일 일부가 이 파일에 없습니다");
  if (!hasNumbers) expectSkipped.push("숫자 판 — 간격·반경 변수가 이 파일에 없습니다");
  const stamp = sheetStamp(maps, [hasFoundationColor, hasDarkMode, hasAllStyles, hasNumbers].map((b) => (b ? 1 : 0)).join(""));
  const reused = reuseExistingSheets(stamp, expectTitles, expectSkipped);
  if (reused) {
    if (onProgress) onProgress("토큰 견본 — 이미 최신이라 그대로 둡니다", 98);
    // 자리는 다시 잡는다 — 그사이 부품이 새로 깔려 왼쪽 빈자리가 바뀌었으면 판이 부품과 겹친다
    //   (🤖 component-verifier 2026-10-02 a-1: 토큰만 먼저 깔고 나중에 부품을 깐 경우). 새로 그릴 때와 같은 계산.
    const origin = originLeftOfContent(reused.totalW, reused.sections);
    const dx = origin.x - (reused.sections[0].x - reused.offX);
    const dy = origin.y - (reused.sections[0].y - reused.offY);
    if (dx !== 0 || dy !== 0) {
      for (const sec of reused.sections) { try { sec.x += dx; sec.y += dy; } catch (e) { /* */ } }
    }
    await buildAreaTitle("Tokens", origin.x - SHEET_PAD, origin.y - SHEET_TITLE_SPACE - AREA_TITLE_SPACE, reused.totalW);
    return reused.result;
  }

  try {
    if (onProgress) onProgress("토큰 견본 — 색 시트 그리는 중…", 96);
    // 색은 **라이트 섹션 / 다크 섹션 두 덩어리**로 나눈다(river 요청 2026-09-23).
    //   어두운 단계를 흰 바탕에 늘어놓으면 실제 쓰이는 화면과 달라 보인다 — 부품 세트의
    //   Spec Light / Spec Dark 가 갈려 있는 것과 같은 방식이다.
    const lightFrames: FrameNode[] = [];
    const darkFrames: FrameNode[] = [];
    if (hasFoundationColor) {
      const palLight = await buildFoundationColor(maps, false);
      lightFrames.push(palLight.frame); made.push(palLight.frame); result.swatches += palLight.count;
      if (hasDarkMode) {
        const palDark = await buildFoundationColor(maps, true);
        darkFrames.push(palDark.frame); made.push(palDark.frame); result.swatches += palDark.count;
      }
    } else {
      result.skipped.push("Foundation 팔레트 판 — 기본 팔레트 변수가 이 파일에 없습니다");
    }
    const semLight = await buildSemanticColor(maps, false);
    lightFrames.push(semLight.frame); made.push(semLight.frame); result.swatches += semLight.count;
    if (hasDarkMode) {
      const semDark = await buildSemanticColor(maps, true);
      darkFrames.push(semDark.frame); made.push(semDark.frame); result.swatches += semDark.count;
    } else {
      // Dark 모드가 없는 파일에서는 "Dark" 라는 이름의 밝은 판을 만들지 않는다.
      result.skipped.push("색 Dark 섹션 — 이 파일에 Dark 모드가 없습니다");
    }
    // 라이트·다크를 **한 섹션**에 좌우로 묶는다(river 지시 2026-09-28) — 같은 색의 두 얼굴이라
    //   따로 떼어 놓을 이유가 없다. 각 줄기 안에서는 Foundation 위, Semantic 아래.
    const colorCols: FrameNode[][] = [lightFrames];
    if (darkFrames.length) colorCols.push(darkFrames);
    rows.push([{ title: "Tokens · Color", cols: colorCols }]);
    const restRow: { title: string; cols: FrameNode[][] }[] = [];

    if (hasAllStyles) {
      if (onProgress) onProgress("토큰 견본 — 글자 시트 그리는 중…", 97);
      const r = await buildTypography(maps);
      made.push(r.frame); result.styles = r.count;
      restRow.push({ title: "Tokens · Typography", cols: [[r.frame]] });
    } else {
      result.skipped.push("글자 판 — 글자 스타일 일부가 이 파일에 없습니다");
    }

    if (hasNumbers) {
      if (onProgress) onProgress("토큰 견본 — 숫자 시트 그리는 중…", 98);
      const r = await buildNumber(maps);
      made.push(r.frame); result.numbers = r.count;
      restRow.push({ title: "Tokens · Number", cols: [[r.frame]] });
    } else {
      result.skipped.push("숫자 판 — 간격·반경 변수가 이 파일에 없습니다");
    }
    if (restRow.length) rows.push(restRow);
  } catch (e) {
    // 만들다 실패하면 이번에 만든 것을 모두 되감는다 — 그리다 만 판까지 포함해서.
    for (const n of PENDING_NODES) { try { n.remove(); } catch (err) { /* 이미 지워짐 */ } }
    PENDING_NODES = [];
    throw e;
  }

  // 다 만든 뒤에 옛 판을 걷는다(여기까지 왔으면 새 판이 확실히 있다).
  removeOldSheets();

  // 실제 폭 합으로 왼쪽 빈자리를 잡는다 — 어림값을 쓰지 않는다(겹침 위험 제거).
  const PAD = SHEET_PAD;
  const TITLE_SPACE = SHEET_TITLE_SPACE;
  const STACK_GAP = 120;      // 한 섹션 안에서 판과 판 사이(세로)
  const SECTION_GAP = 240;    // 같은 줄의 섹션끼리(가로)
  const ROW_GAP = 320;        // 줄과 줄 사이(세로)
  const COL_GAP = 160;        // 한 섹션 안에서 줄기끼리(가로) — 라이트|다크 (기본값)
  const colGap: number[] = [];   // 줄(row)마다 실제로 쓸 줄기 간격
  const colW = (col: FrameNode[]) => {
    let w = 0;
    for (const f of col) if (f.width > w) w = f.width;
    return w;
  };
  const secW = (sec: { cols: FrameNode[][] }, gap: number) => {
    let w = 0;
    for (let i = 0; i < sec.cols.length; i++) w += colW(sec.cols[i]) + (i ? gap : 0);
    return w + PAD * 2;
  };
  for (let i = 0; i < rows.length; i++) colGap.push(COL_GAP);
  const rowW = (ri: number) => {
    let w = 0;
    for (let i = 0; i < rows[ri].length; i++) w += secW(rows[ri][i], colGap[ri]) + (i ? SECTION_GAP : 0);
    return w;
  };
  // 줄마다 폭이 들쭉날쭉하면 판이 어긋나 보인다 — 줄기가 둘 이상인 섹션 하나뿐인 줄(=색)은
  //   줄기 간격을 늘려 **가장 넓은 줄과 폭을 맞춘다**(river 지시 2026-09-28).
  let totalW = 0;
  for (let ri = 0; ri < rows.length; ri++) { const w = rowW(ri); if (w > totalW) totalW = w; }
  for (let ri = 0; ri < rows.length; ri++) {
    if (rows[ri].length !== 1 || rows[ri][0].cols.length < 2) continue;
    const slack = totalW - rowW(ri);
    if (slack > 0) colGap[ri] += Math.floor(slack / (rows[ri][0].cols.length - 1));
  }
  totalW = 0;
  for (let ri = 0; ri < rows.length; ri++) { const w = rowW(ri); if (w > totalW) totalW = w; }
  const origin = originLeftOfContent(totalW, made);

  // 영역 제목 — 토큰 판 묶음 위에 한 줄(섹션 윗변보다 더 위).
  await buildAreaTitle("Tokens", origin.x - PAD, origin.y - TITLE_SPACE - AREA_TITLE_SPACE, totalW);

  let rowY = origin.y;
  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    let x = origin.x, bottom = rowY;
    for (const sec of row) {
      let cx = x;
      let secBottom = rowY;
      const all: FrameNode[] = [];
      for (const col of sec.cols) {
        let y = rowY;
        for (const f of col) { f.x = cx; f.y = y; y += f.height + STACK_GAP; all.push(f); }
        if (y - STACK_GAP > secBottom) secBottom = y - STACK_GAP;
        cx += colW(col) + colGap[ri];
      }
      if (secBottom > bottom) bottom = secBottom;
      await wrapCategoryInSection(sec.title, all, TITLE_SPACE, PAD);
      result.sections.push(sec.title);
      x += secW(sec, colGap[ri]) + SECTION_GAP;
    }
    // 다음 줄은 이 줄 섹션의 아래변(내용 + 아래 여백) 밑에서, 머리말 자리를 두고 시작한다.
    rowY = bottom + PAD + ROW_GAP + TITLE_SPACE;
  }

  stampSheets(stamp, result, totalW, origin);
  return result;
}
