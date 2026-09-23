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
import { boundPaint, setMode, wrapCategoryInSection, primeSpecMaps } from "./build-components";
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
}

// 시트 섹션 이름 — 재설치 때 이 이름으로 옛 시트를 걷어낸다.
export const TOKEN_SHEET_SECTIONS = ["Tokens · Color", "Tokens · Typography", "Tokens · Number"];

// 시트에서 쓰는 글자·면 토큰(전부 Semantic 정본에 이미 있는 것들).
const T = {
  title: "color/text/title/primary",
  body: "color/text/body/primary",
  sub: "color/text/body/secondary",
  meta: "color/text/body/tertiary",
  surface: "color/bg/level-0",
  band: "color/bg/level-2",
  line: "color/line/gray/subtle",
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
function semanticUsage(): { [foundationKey: string]: number } {
  const count: { [k: string]: number } = {};
  const bump = (k: string): void => {
    if (!k || k.indexOf("#") === 0 || k.indexOf("rgba") === 0) return;   // 색 리터럴은 Foundation 칸이 아니다
    count[k] = (Object.prototype.hasOwnProperty.call(count, k) ? count[k] : 0) + 1;
  };
  for (const key of Object.keys(SEMANTIC_COLOR)) {
    const e = SEMANTIC_COLOR[key];
    bump(e.light);
    bump(e.dark);
  }
  return count;
}

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

/** Foundation 팔레트 격자. 반환 = 프레임. */
async function buildFoundationColor(maps: TokenSheetMaps): Promise<{ frame: FrameNode; count: number }> {
  const COLS = 11, CW = 116, SW = 104, SH = 56, CH = 124, GROUP_TITLE_H = 30, GROUP_GAP = 24;
  const usage = semanticUsage();
  const f = sheetFrame(maps, "Tokens · Color — Foundation", maps.semanticLightModeId, T.surface);
  let y = PAD;
  f.appendChild(await text(maps, "Foundation · 기본 팔레트", "title/16B", T.title, PAD, y, 600));
  y += SHEET_TITLE_H;
  let count = 0;
  for (const g of groupByHead(Object.keys(FOUNDATION_COLOR))) {
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
  f.appendChild(await text(maps, `Semantic · 역할색 (${dark ? "Dark" : "Light"})`, "title/16B", T.title, PAD, PAD, 600));
  const top = PAD + SHEET_TITLE_H;
  let x = PAD, y = top, maxY = top, count = 0;
  const groups = groupSemantic(Object.keys(SEMANTIC_COLOR));
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
    f.appendChild(await text(maps, "다람쥐 헌 쳇바퀴에 타고파 AaBbCc 0123", d.name, T.body, SAMPLE_X, y, SAMPLE_W, "LEFT", true));
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

// ── 배치 · 멱등 정리 ─────────────────────────────────────────────────────────

/** 옛 시트를 통째로 걷어낸다(섹션 + 그 안의 내용). 시트 이름은 설치기만 쓰는 이름이다. */
function removeOldSheets(): void {
  let sections: SceneNode[] = [];
  try {
    sections = figma.currentPage.findAll(
      (n) => n.type === "SECTION" && TOKEN_SHEET_SECTIONS.indexOf(n.name) >= 0,
    ) as SceneNode[];
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
        const b = (n as SceneNode).absoluteBoundingBox;
        if (!b || typeof b.x !== "number") continue;
        if (b.x < minX) minX = b.x;
        if (b.y < minY) minY = b.y;
      }
    }
  } catch (e) { /* mock */ }
  if (minX === Infinity) return { x: 0, y: 0 };
  return { x: minX - totalW - 400, y: minY };
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
  const rows: { title: string; frames: FrameNode[] }[] = [];
  try {
    if (onProgress) onProgress("토큰 견본 — 색 시트 그리는 중…", 96);
    const colorFrames: FrameNode[] = [];
    if (hasFoundationColor) {
      const r = await buildFoundationColor(maps);
      colorFrames.push(r.frame); made.push(r.frame); result.swatches += r.count;
    } else {
      result.skipped.push("Foundation 팔레트 판 — 기본 팔레트 변수가 이 파일에 없습니다");
    }
    const lightSheet = await buildSemanticColor(maps, false);
    colorFrames.push(lightSheet.frame); made.push(lightSheet.frame); result.swatches += lightSheet.count;
    if (hasDarkMode) {
      const darkSheet = await buildSemanticColor(maps, true);
      colorFrames.push(darkSheet.frame); made.push(darkSheet.frame); result.swatches += darkSheet.count;
    } else {
      result.skipped.push("역할색 Dark 판 — 이 파일에 Dark 모드가 없습니다");
    }
    rows.push({ title: "Tokens · Color", frames: colorFrames });

    if (hasAllStyles) {
      if (onProgress) onProgress("토큰 견본 — 글자 시트 그리는 중…", 97);
      const r = await buildTypography(maps);
      made.push(r.frame); result.styles = r.count;
      rows.push({ title: "Tokens · Typography", frames: [r.frame] });
    } else {
      result.skipped.push("글자 판 — 글자 스타일 일부가 이 파일에 없습니다");
    }

    if (hasNumbers) {
      if (onProgress) onProgress("토큰 견본 — 숫자 시트 그리는 중…", 98);
      const r = await buildNumber(maps);
      made.push(r.frame); result.numbers = r.count;
      rows.push({ title: "Tokens · Number", frames: [r.frame] });
    } else {
      result.skipped.push("숫자 판 — 간격·반경 변수가 이 파일에 없습니다");
    }
  } catch (e) {
    // 만들다 실패하면 이번에 만든 것을 모두 되감는다 — 그리다 만 판까지 포함해서.
    for (const n of PENDING_NODES) { try { n.remove(); } catch (err) { /* 이미 지워짐 */ } }
    PENDING_NODES = [];
    throw e;
  }

  // 다 만든 뒤에 옛 판을 걷는다(여기까지 왔으면 새 판이 확실히 있다).
  removeOldSheets();

  // 실제 폭 합으로 왼쪽 빈자리를 잡는다 — 어림값을 쓰지 않는다(겹침 위험 제거).
  const GAP = 160, ROW_GAP = 400;
  let totalW = 0;
  for (const row of rows) {
    let w = 0;
    for (let i = 0; i < row.frames.length; i++) w += row.frames[i].width + (i ? GAP : 0);
    if (w > totalW) totalW = w;
  }
  const origin = originLeftOfContent(totalW, made);

  let rowY = origin.y;
  for (const row of rows) {
    let x = origin.x, bottom = rowY;
    for (const f of row.frames) {
      f.x = x; f.y = rowY;
      x += f.width + GAP;
      if (rowY + f.height > bottom) bottom = rowY + f.height;
    }
    await wrapCategoryInSection(row.title, row.frames, 140, 64);
    result.sections.push(row.title);
    rowY = bottom + ROW_GAP;
  }

  return result;
}
