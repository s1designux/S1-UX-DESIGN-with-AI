// @role: Figma 컴포넌트 빌드 로직
/**
 * build-components.ts
 * 코드/registry 정본 → Figma 컴포넌트 세트 생성 (Button 48-variant: 3 variant × 4 size × 4 state).
 *
 * 출처/근거:
 *   · 네이밍·내부구조: 에스원 GUI 참고 파일 (Tnihi6lixRR47N4RSAwUbF, node 1459:16301)
 *     속성 4개 = Size · State · Variant · Break (예: "Size=medium, State=Default, Variant=Primary, Break=PC")
 *   · 색·기하 바인딩: assets/css/tokens.css + pages/components.html (코드 정본, 역방향 기준)
 *     - pressed = hover (components.html:316 확인)
 *     - PC: xxsmall(28)·xsmall(34)·medium(44) / Mobile: large(48)
 *   · 색상은 Semantic Color V2 변수에 직접 바인딩 → Figma 모드 토글 시 Light/Dark 자동 전환.
 *
 * 바인딩 (variant·state→슬롯):
 *   Default  → bg/border/label  {variant}--default
 *   Hover    → {variant}--hover
 *   Pressed  → {variant}--hover (= hover)
 *   Disabled → bg/border/label  disabled (공통, 모든 variant 동일)
 */

import { SEMANTIC_SHADOW } from "./vars-data";
import { toDropShadowEffects, shadowVarName } from "./shadow-parse";

export interface BuildMaps {
  semanticColor: Record<string, Variable>;   // "color/button/bg/primary--default" 등
  foundationColor: Record<string, Variable>;  // "brand/ci","brand/blue" 등 — Foundation 색 직접 바인딩용(CI 로고)
  foundationNumber: Record<string, Variable>; // "spacing/16","spacing/8","radius/4","border-width/1"
  textStyles: Record<string, TextStyle>;      // "body/14M","body/16M" 등
  semanticColorCollectionId: string;          // Semantic Color V2 컬렉션 id (Appearance 모드 연결)
  semanticLightModeId: string;                // Light 모드 id
  semanticDarkModeId: string;                 // Dark 모드 id (다크 스펙 프레임용)
  // ── 그림자(2026-07-29) — 선택 필드 ──────────────────────────────────────────
  // "shadow/raised/layer-a/color" 처럼 겹당 변수. 설치기 runInstall 이 채워 준다.
  // 게이트 스크립트의 mock 실행에는 없으므로 optional — 없으면 바인딩 없이 값만 넣는다.
  shadowVars?: Record<string, Variable>;
  semanticShadowCollectionId?: string;        // Semantic Shadow V2 컬렉션 id (Spec Dark 프레임 모드 연결)
  semanticShadowLightModeId?: string;
  semanticShadowDarkModeId?: string;
}

// ── 크로스빌더 공유 참조 ──────────────────────────────────────────────────────
// 한 빌더가 만든 세트/컴포넌트를 다른 빌더가 인스턴스로 재사용할 수 있게 등록·조회한다.
//   예: Dropdown(패널)이 Dropdown List(옵션 세트)를, Select Open 이 Dropdown(패널)을,
//       Time Picker(Focus)가 Time Picker Dropdown(세트)을 인스턴스로 부착.
//   CATEGORIES Form 순서가 "패널 → 소비자" 로 정렬돼 있어 소비자 빌드 시점엔 이미 등록돼 있다.
//   재설치(같은 페이지)에서는 등록 캐시가 비어도 currentPage 에서 이름으로 찾아 폴백한다.
const BUILT_SETS: Record<string, ComponentSetNode> = {};
const BUILT_COMPS: Record<string, ComponentNode> = {};

// 텍스트 스타일 맵(buildAllComponents 진입 시 maps.textStyles 로 채움) — makeBoundText 가 setTextStyleIdAsync 로 바인딩.
let TEXT_STYLES: Record<string, TextStyle> = {};
// (fontSize, weight) → V2.4 텍스트 스타일 키. Bold=title/* · Medium·Regular=body/*.
//   비표준 사이즈는 인접 표준으로 매핑(사용자 결정 2026-06-30): 13→14, 9→10. (Shell 13px GNB·9px 배지)
function textStyleKey(fontSize: number, style: string): string {
  const letter = style === "Bold" ? "B" : style === "Medium" ? "M" : "R";
  let size = fontSize;
  if (size === 13) size = 14;                 // GNB 셸 서비스명·URL (Regular)
  if (size === 9) size = 10;                  // StatusBar 배지 (Medium)
  if (size === 20 && letter === "M") size = 18; // Line Tab 탭 라벨 20M → 18M (굵기 유지, 가장 가까운 Medium 크기)
  // 휠(Time Picker Mobile Bottom Sheet) 32px accent 숫자 = Regular 32 → title/32R(2026-07-07 신설).
  //   Regular 는 통상 body/* 로 가지만 32 Regular 는 title/32B(Bold) 의 Regular 형제라 title/ 그룹에 둔다.
  if (size === 32 && letter === "R") return "title/32R";
  return `${letter === "B" ? "title" : "body"}/${size}${letter}`;
}

async function getBuiltSet(name: string): Promise<ComponentSetNode | null> {
  if (BUILT_SETS[name]) return BUILT_SETS[name];
  try { const f = figma.currentPage.findOne((n) => n.type === "COMPONENT_SET" && n.name === name); return (f as ComponentSetNode) || null; } catch (e) { return null; }
}

/** 세트 안의 변형 컴포넌트를 BUILT_COMPS → 캔버스 순으로 찾고, 찾으면 BUILT_COMPS 에 **재등록**한다.
 *  재설치에서 부품 세트가 skip(기존 보존)되면 BUILT_COMPS 가 비어 부모가 조용히 fallback 을 그리는데,
 *  그 fallback 이 '빈자리'가 아니라 '가짜 부품'이면 눈에 안 보인 채 라이브러리에 고착된다.
 *  (2026-08-14 신설 — 🤖 component-verifier 가 Dropdown List 의 체크박스 18개가 통째로 가짜가 되는 것을 실측.)
 *  matches = 변형 이름에 모두 포함돼야 하는 조각(예: ["Size=MD","Type=Checkbox","State=Default"]). */
async function reuseVariant(setName: string, cacheKey: string, matches: string[]): Promise<ComponentNode | null> {
  if (BUILT_COMPS[cacheKey]) return BUILT_COMPS[cacheKey];
  const set = await getBuiltSet(setName);
  if (!set) return null;
  let found: ComponentNode | undefined;
  try {
    found = (set.children as ComponentNode[]).find(
      (c) => c.type === "COMPONENT" && matches.every((m) => c.name.includes(m)));
  } catch (e) { return null; } // mock 환경(children 이 배열 아님)
  if (found) BUILT_COMPS[cacheKey] = found;
  return found ?? null;
}

async function getBuiltComp(name: string): Promise<ComponentNode | null> {
  if (BUILT_COMPS[name]) return BUILT_COMPS[name];
  try {
    const f = figma.currentPage.findOne((n) => n.type === "COMPONENT" && n.name === name && (!n.parent || n.parent.type !== "COMPONENT_SET"));
    return (f as ComponentNode) || null;
  } catch (e) { return null; }
}

/** 노드 Appearance 에 Semantic Color V2 컬렉션의 특정 모드를 명시적으로 연결한다. */
function setMode(node: SceneNode, maps: BuildMaps, modeId: string): void {
  try {
    // 프로젝트 표준 시그니처: (collectionId, modeId), 타이핑 차이로 any 캐스팅 (figma-component-audit 동일)
    (node as unknown as {
      setExplicitVariableModeForCollection: (cid: string, mid: string) => void;
    }).setExplicitVariableModeForCollection(maps.semanticColorCollectionId, modeId);
  } catch (e) {
    console.warn("[SW Installer] 모드 연결 실패:", e);
  }
}

/**
 * 부모의 Appearance(Light/Dark) 를 그대로 물려받게 모드 핀을 푼다.
 * 인스턴스가 자기 모드를 명시하면 부모의 Dark 핀을 이겨버려서, 다크 스펙에서 그 부분만
 * 라이트로 남는다(2026-08-25 Mobile Header 안 StatusBar 가 흰 띠로 남던 원인).
 */
function clearMode(node: SceneNode, maps: BuildMaps): void {
  try {
    (node as unknown as {
      clearExplicitVariableModeForCollection: (cid: string) => void;
    }).clearExplicitVariableModeForCollection(maps.semanticColorCollectionId);
  } catch (e) {
    console.warn("[SW Installer] 모드 핀 해제 실패:", e);
  }
}

/**
 * Semantic Shadow V2 모드는 실제로 모드 전환되는 그림자 변수를 가진 노드에만 연결한다.
 * 현재 대상은 shadow/raised 변수를 쓰는 Modal과 그 Light/Dark 스펙 경로뿐이다.
 * Dropdown·Calendar·Bottom Sheet 등의 고정 그림자는 effects 값만 유지하고 Appearance 연결은 만들지 않는다.
 */
function setShadowMode(node: SceneNode, maps: BuildMaps, modeId: string | undefined): void {
  const sCid = maps.semanticShadowCollectionId;
  if (!sCid || !modeId) return;
  try {
    (node as unknown as {
      setExplicitVariableModeForCollection: (cid: string, mid: string) => void;
    }).setExplicitVariableModeForCollection(sCid, modeId);
  } catch (e) { /* 컬렉션 미설치·모의 실행 */ }
}

// ── 그림자 Effect 생성 (2026-07-29) ──────────────────────────────────────────
// 🚫 그림자 수치를 이 파일에 적지 않는다. 정본은 vars-data.ts 의 SEMANTIC_SHADOW 문자열 하나이고,
//    shadow-parse 로 풀어 쓴다. 설치기(Figma)와 웹(tokens.css)이 같은 문자열에서 파생돼야
//    두 표면이 갈리지 않는다.

/** 정본 문자열(라이트) → DropShadowEffect[]. 변수 바인딩 없음. */
function shadowEffects(token: string): DropShadowEffect[] {
  const entry = SEMANTIC_SHADOW[token];
  if (!entry) throw new Error(`[build-components] SEMANTIC_SHADOW 에 '${token}' 이 없습니다.`);
  // 라이트 값을 기본으로 넣는다. 다크는 (변수 바인딩이 있는 토큰에 한해) 모드가 뒤집는다.
  return toDropShadowEffects(entry.light);
}

/**
 * 겹당 변수 바인딩까지 붙인 Effect[]. 변수가 없으면(미설치·모의 실행) 값만 넣고 조용히 넘어간다
 * — 이 경우는 "그림자가 라이트 값으로 고정"이라 시각 손실이 없다(값 유실 아님).
 */
function boundShadowEffects(maps: BuildMaps, token: string): Effect[] {
  const base = shadowEffects(token);
  const vars = maps.shadowVars;
  if (!vars) return base;
  return base.map((eff, i) => {
    let out: Effect = eff;
    // 변수 이름은 shadow-parse 의 shadowVarName 하나로만 만든다(code.ts 생성부와 같은 정본).
    const bind = (field: VariableBindableEffectField, name: string): void => {
      const v = vars[name];
      if (!v) return;
      try { out = figma.variables.setBoundVariableForEffect(out, field, v); }
      catch (e) { /* 미지원 환경 — 값은 이미 들어가 있음 */ }
    };
    bind("color", shadowVarName(token, i, "color"));
    bind("offsetY", shadowVarName(token, i, "offset-y"));
    bind("radius", shadowVarName(token, i, "blur"));
    bind("spread", shadowVarName(token, i, "spread"));
    return out;
  });
}

function setLightMode(node: SceneNode, maps: BuildMaps): void {
  setMode(node, maps, maps.semanticLightModeId);
}

// 플랫폼 그룹 (Break) — 스펙 프레임은 플랫폼 → 사이즈 → 상태 순으로 묶는다.
const PLATFORMS: { name: string; sizes: SizeId[] }[] = [
  { name: "PC", sizes: ["MD", "XSM", "XXSM"] },
  { name: "Mobile", sizes: ["LG"] },
];

type SizeId = "MD" | "XSM" | "XXSM" | "LG";
type StateId = "Default" | "Hover" | "Pressed" | "Disabled";
type VariantId = "primary" | "secondary" | "blue-line";

// 보조 버튼(assist)은 **이 세트에 넣지 않는다** — river 지시 2026-09-08:
//   "보조버튼은 한사이즈밖에 없고 버튼에 섞여서 표출되면 안돼. 별도 컴포넌트야".
//   크기 축이 4개인 Button 과 달리 보조 버튼은 한 크기(h32)뿐이라 같은 세트에 두면 축이 거짓이 된다.
//   → 별도 세트 `Assist Button`(buildAssistButtonSet) 참조.
const VARIANTS: VariantId[] = ["primary", "secondary", "blue-line"];
// Figma Variant 속성 표기 (에스원 GUI 참고 파일 케이스)
const VARIANT_LABEL: Record<VariantId, string> = {
  primary: "Primary",
  secondary: "Secondary",
  "blue-line": "Blue-Line",
};

interface SizeConfig {
  break: "PC" | "Mobile";
  height: number;
  padPath: string;     // foundationNumber 키
  textStyle: string;   // textStyles 키
  minWidth: number;    // 디폴트 최소 너비
}

const SIZE_CONFIG: Record<SizeId, SizeConfig> = {
  MD:   { break: "PC",     height: 44, padPath: "spacing/16", textStyle: "body/14M", minWidth: 80 },
  XSM:  { break: "PC",     height: 34, padPath: "spacing/8",  textStyle: "body/14M", minWidth: 64 },
  XXSM: { break: "PC",     height: 28, padPath: "spacing/8",  textStyle: "body/12M", minWidth: 56 },
  LG:   { break: "Mobile", height: 48, padPath: "spacing/16", textStyle: "body/16M", minWidth: 80 },
};

// 매트릭스 배치: 행 = Size(위→아래), 열 = State(좌→우)
const SIZES: SizeId[] = ["MD", "XSM", "XXSM", "LG"];
const STATES: StateId[] = ["Default", "Hover", "Pressed", "Disabled"];

// 그리드 셀 치수 (버튼 최대폭~90·최대높이 48 수용)
const CELL_W = 132;
const CELL_H = 60;

// 고정 컬럼 X — 세트(라벨 포함)=x0, Light 스펙, Dark 스펙. 전 컴포넌트 공통(세로 정렬).
// 가장 넓은 컴포넌트(Input: 7 state 열)를 수용하도록 설정.
const SPEC_LIGHT_X = 1040;
const SPEC_DARK_X = 2080;
// Input 전용 시트 가로 시작점 — 세로 스택(최대 우측 ~3500)을 비켜 버튼 우측편에 독립 배치.
const INPUT_SHEET_X = 4200;

interface Slots { bg: string; border: string; label: string; }

function variantSlots(variant: VariantId, state: StateId): Slots {
  // disabled 는 모든 variant 공통 (components.html 확인)
  if (state === "Disabled") {
    return {
      bg: "color/button/bg/disabled",
      border: "color/button/border/disabled",
      label: "color/button/label/disabled",
    };
  }
  // Default → --default, Hover/Pressed → --hover (pressed = hover, components.html 확인)
  const suffix = state === "Default" ? "default" : "hover";
  return {
    bg: `color/button/bg/${variant}--${suffix}`,
    border: `color/button/border/${variant}--${suffix}`,
    label: `color/button/label/${variant}--${suffix}`,
  };
}

/** Semantic 변수에 바인딩된 SOLID paint 를 만든다. */
function boundPaint(variable: Variable): SolidPaint {
  const paint: SolidPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
  return figma.variables.setBoundVariableForPaint(paint, "color", variable) as SolidPaint;
}

function requireVar(map: Record<string, Variable>, key: string, kind: string): Variable {
  const v = map[key];
  if (!v) throw new Error(`${kind} 변수 누락: ${key} — 먼저 Variables 설치가 필요합니다.`);
  return v;
}

/**
 * 네 모서리 반경을 Foundation Number 변수에 바인딩한다.
 * 반경을 raw 숫자로 두면 Figma 에도 토큰이 안 붙고, 웹 파생과 값이 갈려도 기계가 못 잡는다
 * (알약 모양을 정본은 999·웹은 radius/full=9999 로 적어 Gate 39 가 어긋남으로 잡았다 — 2026-08-13).
 * 색이 Variable 바인딩 필수인 것과 같은 취지를 반경에 적용한다.
 */
function bindRadius(node: ComponentNode | FrameNode | RectangleNode, maps: BuildMaps, token: string): void {
  const v = requireVar(maps.foundationNumber, token, "Foundation Number");
  node.setBoundVariable("topLeftRadius", v);
  node.setBoundVariable("topRightRadius", v);
  node.setBoundVariable("bottomLeftRadius", v);
  node.setBoundVariable("bottomRightRadius", v);
}

function requireStyle(map: Record<string, TextStyle>, key: string): TextStyle {
  const s = map[key];
  if (!s) throw new Error(`Text Style 누락: ${key} — 먼저 Text Styles 설치가 필요합니다.`);
  return s;
}

async function buildOne(variant: VariantId, size: SizeId, state: StateId, maps: BuildMaps): Promise<ComponentNode> {
  const cfg = SIZE_CONFIG[size];
  const slots = variantSlots(variant, state);

  const comp = figma.createComponent();
  comp.name = `Size=${size}, State=${state}, Variant=${VARIANT_LABEL[variant]}, Break=${cfg.break}`;

  // ── auto-layout: 가로, 가운데, 너비 hug / 높이 고정 ──
  comp.layoutMode = "HORIZONTAL";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.primaryAxisSizingMode = "AUTO";   // 너비 hug
  comp.counterAxisSizingMode = "FIXED";  // 높이 고정

  // 패딩 (좌우 = foundation spacing 바인딩, 상하 0)
  const padVar = requireVar(maps.foundationNumber, cfg.padPath, "Foundation Number");
  comp.paddingTop = 0;
  comp.paddingBottom = 0;
  comp.setBoundVariable("paddingLeft", padVar);
  comp.setBoundVariable("paddingRight", padVar);
  comp.minWidth = cfg.minWidth; // 사이즈별 디폴트 최소 너비 (MD/LG=80, XSM=64, XXSM=56)

  // ── 텍스트 노드 (V2.4 텍스트 스타일 적용) ──
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  const text = figma.createText();
  text.fontName = { family: "Pretendard", style: "Medium" };
  text.characters = "버튼";
  const ts = requireStyle(maps.textStyles, cfg.textStyle);
  await text.setTextStyleIdAsync(ts.id);
  text.fills = [boundPaint(requireVar(maps.semanticColor, slots.label, "Semantic Color"))];
  comp.appendChild(text);

  // ── 배경/테두리/반경/선두께 바인딩 ──
  comp.fills = [boundPaint(requireVar(maps.semanticColor, slots.bg, "Semantic Color"))];
  comp.strokes = [boundPaint(requireVar(maps.semanticColor, slots.border, "Semantic Color"))];
  comp.strokeAlign = "INSIDE";
  const bwVar = requireVar(maps.foundationNumber, "border-width/1", "Foundation Number");
  comp.setBoundVariable("strokeWeight", bwVar);

  bindRadius(comp, maps, "radius/4");

  // 높이 고정. 오프라인 guide-model mock에서도 minWidth가 실제 폭으로 직렬화되도록
  // 현재 hug 폭과 정본 최소 폭 중 큰 값을 명시한다.
  const rootWidth = Math.max(comp.width, cfg.minWidth);
  comp.resize(rootWidth, cfg.height);

  // Appearance 에 Semantic Color V2 Light 모드 연결
  setLightMode(comp, maps);

  return comp;
}

interface GridCell { comp: ComponentNode; variant: VariantId; size: SizeId; state: StateId; row: number; col: number; }

type RGB = { r: number; g: number; b: number };

/** 도큐먼트 라벨 텍스트 (고정폭, 정렬·색 지정). */
async function makeLabel(
  text: string, fontSize: number, style: string,
  x: number, y: number, w: number,
  align: "LEFT" | "CENTER", color: RGB
): Promise<TextNode> {
  await figma.loadFontAsync({ family: "Pretendard", style });
  const t = figma.createText();
  t.fontName = { family: "Pretendard", style };
  t.fontSize = fontSize;
  t.characters = text;
  t.textAutoResize = "HEIGHT";
  t.resize(w, t.height);
  t.textAlignHorizontal = align;
  t.x = x;
  t.y = y;
  t.fills = [{ type: "SOLID", color }];
  return t;
}

/**
 * 그룹형 스펙 (Button 레이아웃 표준): 플랫폼(PC/Mobile 밴드) → 사이즈 소제목 → 상태(열) → variant(행).
 * Light + Dark 두 프레임을 lightX/darkX 고정 컬럼에 생성. 반환 = 최하단 Y.
 * platform×size 가 있는 컴포넌트(Button·Chip 등)는 이 빌더를 쓴다.
 */
interface GroupedSpecOpts {
  title: string;
  platforms: { name: string; sizes: string[] }[];
  rowLabels: string[];   // 각 사이즈 블록 내 행(variant 등)
  colHeaders: string[];  // 상태(열)
  cellAt: (platformName: string, size: string, rowIdx: number, colIdx: number) => ComponentNode | null;
  lightX: number; darkX: number; originY: number;
  cellW: number; cellH: number; rowLabelW: number;
  offsetX?: number; // 세트(원본 variant + 띄운 라벨/밴드)를 가로로 이동. 미지정=0(기존 동작).
  /** 다크 스펙을 원본 아래에 배치할 때 사용 (GNB 전용). x/y 를 각각 지정. 미지정=기존 동작(원본 우측 W+80). */
  darkOffset?: { x?: number; y?: number };
  /** 실제 Light/Dark 그림자 변수를 쓰는 컴포넌트만 켠다. 현재 Modal 전용. */
  shadowMode?: boolean;
}
function specPalette(dark: boolean): Record<string, RGB> {
  return {
    bg: dark ? { r: 0.075, g: 0.078, b: 0.094 } : { r: 1, g: 1, b: 1 },
    title: dark ? { r: 0.95, g: 0.95, b: 0.96 } : { r: 0.07, g: 0.07, b: 0.09 },
    platform: dark ? { r: 0.9, g: 0.9, b: 0.92 } : { r: 0.13, g: 0.13, b: 0.13 },
    size: dark ? { r: 0.78, g: 0.8, b: 0.84 } : { r: 0.25, g: 0.27, b: 0.3 },
    label: dark ? { r: 0.6, g: 0.62, b: 0.67 } : { r: 0.42, g: 0.45, b: 0.5 },
    band: dark ? { r: 0.14, g: 0.15, b: 0.18 } : { r: 0.93, g: 0.94, b: 0.96 },
  };
}

// 레이아웃 출력 콜백 — 스펙 프레임(인스턴스)과 세트 꾸미기(실제 comp 이동)가 같은 레이아웃 코드를 공유.
interface LayoutEmit {
  text: (s: string, x: number, y: number, w: number, align: "LEFT" | "CENTER", color: RGB, fontSize: number, style: string) => Promise<void>;
  band: (x: number, y: number, w: number, h: number, color: RGB) => void;
  cell: (comp: ComponentNode, x: number, y: number) => void;
}

function specWidth(rowLabelW: number, cols: number, cellW: number): number {
  return 24 * 2 + rowLabelW + cols * cellW;
}

/** 그룹형(플랫폼 밴드→사이즈→variant 행→상태 열) 레이아웃을 emit으로 렌더. 반환=총 높이. */
async function renderGrouped(opts: GroupedSpecOpts, dark: boolean, emit: LayoutEmit): Promise<number> {
  const PAD = 24, TITLE_H = 34, PLATFORM_GAP = 20, BAND_H = 32, SIZE_GAP = 14, SIZE_TITLE_H = 22, HEADER_H = 24;
  const gridLeft = PAD + opts.rowLabelW;
  const W = specWidth(opts.rowLabelW, opts.colHeaders.length, opts.cellW);
  const c = specPalette(dark);
  let y = PAD;
  await emit.text(`${opts.title} · ${dark ? "Dark" : "Light"}`, PAD, y, 320, "LEFT", c.title, 14, "Bold");
  y += TITLE_H;
  for (const plat of opts.platforms) {
    y += PLATFORM_GAP;
    emit.band(PAD, y, W - PAD * 2, BAND_H, c.band);
    await emit.text(plat.name, PAD + 12, y + 8, 200, "LEFT", c.platform, 13, "Bold");
    y += BAND_H + 4;
    for (const size of plat.sizes) {
      y += SIZE_GAP;
      if (size) { await emit.text(size, PAD, y, 200, "LEFT", c.size, 12, "Bold"); y += SIZE_TITLE_H; }
      for (let col = 0; col < opts.colHeaders.length; col++) {
        if (opts.colHeaders[col]) await emit.text(opts.colHeaders[col], gridLeft + col * opts.cellW, y, opts.cellW, "CENTER", c.label, 12, "Medium"); // 빈 헤더는 빈 텍스트 노드 안 만든다
      }
      y += HEADER_H;
      for (let ri = 0; ri < opts.rowLabels.length; ri++) {
        // 행 높이 = 행 내 최대 컴포넌트 높이(+패딩). 고정 cellH 대신 → 라벨-컴포넌트 밀착·빈공간 제거.
        let rowH = 0;
        for (let ci = 0; ci < opts.colHeaders.length; ci++) { const cp = opts.cellAt(plat.name, size, ri, ci); if (cp && cp.height > rowH) rowH = cp.height; }
        rowH = (rowH || opts.cellH) + 16;
        const top = y + 4; // 헤더 바로 아래(상단 정렬)
        if (opts.rowLabels[ri]) await emit.text(opts.rowLabels[ri], PAD, top, opts.rowLabelW, "LEFT", c.label, 12, "Medium");
        for (let ci = 0; ci < opts.colHeaders.length; ci++) {
          const comp = opts.cellAt(plat.name, size, ri, ci);
          if (comp) emit.cell(comp, gridLeft + ci * opts.cellW + (opts.cellW - comp.width) / 2, top);
        }
        y += rowH;
      }
    }
  }
  return y + PAD;
}

/** 프레임에 그리는 emit (인스턴스). */
function frameEmit(frame: FrameNode, maps: BuildMaps, modeId: string, shadowModeId?: string): LayoutEmit {
  return {
    text: async (s, x, y, w, al, col, fs, st) => { frame.appendChild(await makeLabel(s, fs, st, x, y, w, al, col)); },
    band: (x, y, w, h, col) => { const b = figma.createRectangle(); b.x = x; b.y = y; b.resize(w, h); b.cornerRadius = 4; b.fills = [{ type: "SOLID", color: col }]; frame.appendChild(b); },
    cell: (comp, x, y) => {
      const inst = comp.createInstance(); frame.appendChild(inst); inst.x = x; inst.y = y; setMode(inst, maps, modeId);
      setShadowMode(inst, maps, shadowModeId);
      // 중첩 인스턴스(예: Table 푸터의 Checkbox/Pagination/SelectBox)가 컴포넌트 단위 Light 고착으로
      // 부모 다크를 무시하고 라이트로 남는 것 방지 — 다크 스펙에서는 모든 하위 인스턴스에도 동일 모드 강제.
      try { (inst.findAll((n) => n.type === "INSTANCE") as SceneNode[]).forEach((d) => setMode(d, maps, modeId)); } catch (e) { /* */ }
    },
  };
}

// 컴포넌트 세트 노드는 텍스트/사각형 자식을 못 받으므로, 라벨/밴드를 캔버스에 띄워 세트 위에 정렬(절대 oy 기준).
// ox = 세트 가로 오프셋. 라벨/밴드는 페이지 절대좌표라 ox 를 더하고, cell(=세트 내부 variant)은 세트 기준 상대좌표라 ox 미적용
// (세트 자체를 set.x=ox 로 옮기므로 시각적으로 정렬됨).
function floatingEmit(oy: number, ox = 0): LayoutEmit {
  return {
    text: async (s, x, y, w, al, col, fs, st) => { await makeLabel(s, fs, st, ox + x, oy + y, w, al, col); },
    band: (x, y, w, h, col) => { const b = figma.createRectangle(); b.resize(w, h); b.cornerRadius = 4; b.fills = [{ type: "SOLID", color: col }]; b.x = ox + x; b.y = oy + y; },
    cell: (comp, x, y) => { comp.x = x; comp.y = y; },
  };
}

/** 그룹형 Dark 스펙 프레임만 생성(원본 세트=Light 기준). 위치=원본 우측 밀착. 반환=최하단 Y.
 *  (2026-06-19 사용자 결정: 라이트 스펙은 원본과 중복이라 미생성 — 공간 절약) */
async function buildGroupedSpec(opts: GroupedSpecOpts, maps: BuildMaps): Promise<number> {
  const W = specWidth(opts.rowLabelW, opts.colHeaders.length, opts.cellW);
  const modeId = maps.semanticDarkModeId;
  const frame = figma.createFrame();
  frame.name = `${opts.title} — Spec Dark`;
  frame.fills = [{ type: "SOLID", color: specPalette(true).bg }];
  frame.cornerRadius = 8;
  frame.resize(W, 2400);
  frame.x = opts.darkOffset?.x ?? ((opts.offsetX ?? 0) + W + 80); // 기본=원본 우측 밀착; darkOffset 지정 시 GNB처럼 아래 배치
  frame.y = opts.darkOffset?.y ?? opts.originY;
  const shadowModeId = opts.shadowMode ? maps.semanticShadowDarkModeId : undefined;
  const H = await renderGrouped(opts, true, frameEmit(frame, maps, modeId, shadowModeId));
  frame.resize(W, H);
  setMode(frame, maps, modeId);
  setShadowMode(frame, maps, shadowModeId);
  return Math.max(opts.originY, frame.y + H);
}

/** 컴포넌트 세트 원본을 Light 스펙처럼 꾸민다(세트=실제 variant, 라벨/밴드는 캔버스에 정렬). 반환=최하단 Y. */
async function decorateSetGrouped(set: ComponentSetNode, opts: GroupedSpecOpts, maps: BuildMaps): Promise<number> {
  const W = specWidth(opts.rowLabelW, opts.colHeaders.length, opts.cellW);
  const ox = opts.offsetX ?? 0;
  set.x = ox; set.y = opts.originY;
  try { set.fills = [{ type: "SOLID", color: specPalette(false).bg }]; } catch (e) { /* skip */ }
  const H = await renderGrouped(opts, false, floatingEmit(opts.originY, ox));
  set.resize(W, H);
  setLightMode(set, maps);
  if (opts.shadowMode) setShadowMode(set, maps, maps.semanticShadowLightModeId);
  return opts.originY + H;
}

// ── 카테고리 헤더 바 생성 (Selection, Form Control 등) ────────────────────
export async function buildButtonSet(
  maps: BuildMaps,
  onProgress?: (step: string, pct: number) => void,
  pctFrom = 85,
  pctTo = 100,
  originY = 0
): Promise<{ set: ComponentSetNode; bottomY: number }> {
  // ── 48개 컴포넌트 생성 (행=Variant×Size 12, 열=State 4) ──
  const grid: GridCell[] = [];
  let i = 0;
  const total = VARIANTS.length * SIZES.length * STATES.length;
  let rowIdx = 0;
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      for (let c = 0; c < STATES.length; c++) {
        const comp = await buildOne(variant, size, STATES[c], maps);
        grid.push({ comp, variant, size, state: STATES[c], row: rowIdx, col: c });
        i++;
        if (onProgress) {
          const pct = pctFrom + Math.round((i / total) * (pctTo - pctFrom));
          onProgress(`Button: ${VARIANT_LABEL[variant]}/${size}/${STATES[c]}`, pct);
        }
      }
      rowIdx++;
    }
  }

  // ── 컴포넌트 세트로 결합 ──
  const set = figma.combineAsVariants(grid.map((g) => g.comp), figma.currentPage);
  set.name = "Button";
  set.x = 0; set.y = originY;
  // 다른 컴포넌트(예: Date Picker Mobile Bottom Sheet 의 "적용" 버튼)에서 버튼 인스턴스 재사용.
  BUILT_SETS["Button"] = set;
  grid.forEach((g) => { BUILT_COMPS[`Button:${g.variant}:${g.size}:${g.state}`] = g.comp; });

  const opts: GroupedSpecOpts = {
    title: "Button",
    platforms: PLATFORMS,
    rowLabels: VARIANTS.map((v) => VARIANT_LABEL[v]),
    colHeaders: STATES,
    cellAt: (_p, size, ri, ci) =>
      grid.find((g) => g.variant === VARIANTS[ri] && g.size === size && g.state === STATES[ci])?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY,
    cellW: CELL_W, cellH: CELL_H, rowLabelW: 88,
  };
  // 세트 자체를 Light 스펙처럼 꾸미고, Dark 스펙 프레임을 옆에 생성
  const setH = await decorateSetGrouped(set, opts, maps);
  setLightMode(set, maps);
  let bottomY = set.y + setH;
  try {
    bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps));
  } catch (e) {
    console.warn("[SW Installer] Dark 스펙 프레임 실패 (세트는 정상):", e);
  }
  figma.viewport.scrollAndZoomIntoView([set]);
  return { set, bottomY };
}

// ── Assist Button — 보조 버튼 (한 크기 전용) ──────────────────────────────────
// 레거시 정본: A `pc_assist_button`(yE5UCFEbmXJBlYJWB24Lz2 / 540:4650) — 🤖 figma-inspector 2026-09-07 실측.
// river 지시 2026-09-08: **"보조버튼은 한사이즈밖에 없고 버튼에 섞여서 표출되면 안돼. 별도 컴포넌트야"**
//
// 왜 코어 Button 세트에 넣지 않나: **크기가 하나뿐이다.** Button 은 크기 축이 4개(MD·XSM·XXSM·LG)라
//   거기에 variant 로 끼워 넣으면 있지도 않은 크기 3개가 만들어져 축이 거짓이 된다.
//   (2026-09-08 에 실제로 Button variant 로 한 번 만들었다가 river 지적으로 별도 세트로 뺐다.)
//
// 크기 = **h32 하나**. 원본 실측 그대로다 — 정본 Button 의 28·34·44·48 중 무엇으로도 바꾸지 않는다.
//   river 가 같은 날 정한 원칙: "컴포넌트가 모두 동일한 크기 기준을 가지지 않아 … 그 안에서 나름 구분한거야."
//   그래서 크기 축 자체를 두지 않는다(Text Button 과 같은 구조).
// 실측값(원본 그대로): 높이 32 · 좌우 패딩 12 · 최소 폭 60 · 반경 4 · 폰트 14 Medium.
// 색 — **원본이 쓰는 그대로**(river 결정 2026-09-08 "원본 충실"):
//   배경(기본·hover)과 테두리(기본)는 **Secondary 토큰을 그대로 빌려 쓴다** — 원본 540:4651 이 그렇게 바인딩돼 있다.
//   보조 버튼 전용 토큰은 **3개뿐**: border/assist--hover · label/assist--default · label/assist--hover.
//   Disabled → Button 과 같은 공통 disabled 토큰(bg·border·label).
//   ⚠️ hover 배경: 원본은 변수가 아니라 흰색 위 검정 5% 겹침(≈#F2F2F2)이다. 정본은 색표에 있는
//     bg/secondary--hover(gray/50 #F5F5F5)를 쓴다 — 계획서 D-13 에 사전 등록된 근사(§두 갈래 분류 (b)).
//   다크 글자색은 river 가 결정 화면에서 직접 고른 값(일반 버튼보다 한 단계 옅게 = gray-dark/700).
// Pressed 는 원본에 없다 → 코어 Button 의 정본 규칙(pressed = hover)을 그대로 따른다.
// 범위 밖(river 결정 ②): 레거시의 앞/뒤 아이콘 변형(icon_lead·icon_trail)은 이번에 만들지 않는다.
const ASSIST_BUTTON_STATES: StateId[] = ["Default", "Hover", "Pressed", "Disabled"];

async function buildAssistButtonSet(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const comps: ComponentNode[] = [];
  const byKey = new Map<string, ComponentNode>();
  for (const state of ASSIST_BUTTON_STATES) {
    const comp = figma.createComponent();
    comp.name = `State=${state}`;
    comp.layoutMode = "HORIZONTAL";
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.paddingTop = 0; comp.paddingBottom = 0;
    const padVar = requireVar(maps.foundationNumber, "spacing/12", "Foundation Number"); // 실측 12 = spacing/12 정확히 일치
    comp.setBoundVariable("paddingLeft", padVar);
    comp.setBoundVariable("paddingRight", padVar);
    comp.resize(60, 32);                    // 최소 폭 60 · 높이 32 (원본 실측)
    try { (comp as unknown as { minWidth: number }).minWidth = 60; } catch (e) { /* 환경 미지원 */ }
    bindRadius(comp, maps, "radius/4");     // 실측 4 = radius/button/md 와 같은 값
    // Disabled 는 Button 과 같은 공통 토큰, 나머지는 assist 전용 토큰.
    const hover = state !== "Default";   // Hover·Pressed 는 같은 면(코어 Button 규칙)
    const slot = state === "Disabled"
      ? { bg: "color/button/bg/disabled", border: "color/button/border/disabled", label: "color/button/label/disabled" }
      : {
          // 배경·기본 테두리는 원본처럼 Secondary 토큰을 빌려 쓴다(전용 토큰을 만들지 않는다).
          bg: `color/button/bg/secondary--${hover ? "hover" : "default"}`,
          border: hover ? "color/button/border/assist--hover" : "color/button/border/secondary--default",
          label: `color/button/label/assist--${hover ? "hover" : "default"}`,
        };
    comp.fills = [boundPaint(scv(maps, slot.bg))];
    comp.strokes = [boundPaint(scv(maps, slot.border))];
    comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    comp.appendChild(await makeBoundText("보조버튼", 14, "Medium", scv(maps, slot.label), "body/14M"));
    setLightMode(comp, maps);
    comps.push(comp); byKey.set(state, comp);
    BUILT_COMPS[`AssistButton:${state}`] = comp;
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Assist Button"; set.x = 0; set.y = originY;
  BUILT_SETS["Assist Button"] = set;
  const opts: SpecOpts = {
    title: "Assist Button",
    colHeaders: ASSIST_BUTTON_STATES,
    rowLabels: [""],                        // 크기 축이 없으므로 행은 하나다
    cellAt: (_r, c) => byKey.get(ASSIST_BUTTON_STATES[c]) ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 132, cellH: 56, rowLabelW: 16,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Text Button — 배경·테두리 없는 글자 버튼 ─────────────────────────────────
// 레거시 정본: A `pc_text_button`(yE5UCFEbmXJBlYJWB24Lz2 / 540:4705) — 🤖 figma-inspector 2026-09-07 실측.
// river 승인 2026-09-08("나머지 9건은 추천안대로 진행하세요", 결정 ④).
//
// 왜 코어 Button 세트에 넣지 않나: 구조가 다르다. 배경·테두리·최소폭·고정 높이가 **전부 없고** 글자만 있다.
//   Button 의 SIZE_CONFIG(높이·패딩·최소폭)와 variantSlots(bg/border/label 3슬롯)가 하나도 적용되지 않으므로
//   같은 세트에 넣으면 축만 늘고 의미가 비게 된다. 그래서 별도 세트로 만든다.
//
// 축 = Variant(Primary|Secondary) × State(Default|Hover|Pressed|Disabled) = 8변형.
// 실측값(원본 그대로): 폰트 14 Medium 공통 · 패딩 0 · 반경 없음 · 아이콘 없음.
//   Primary  기본 #1d6ceb = color/text/state/accent
//   Secondary 기본 #757575 = color/text/body/tertiary
//   Disabled 공통 #c4c4c4 = color/text/state/disabled
//   Hover 는 **색을 바꾸지 않고 밑줄만** 더한다(원본 그대로).
//   Pressed 는 원본에 없다 → 코어 Button 의 정본 규칙(pressed = hover)을 그대로 따른다.
// 새 토큰 0건 — 색은 전부 기존 text 토큰 재사용.
//
// 범위 밖(river 결정 ④ = 추천안 A): 레거시 B `m_subbutton`(글자+화살표, 모바일)은 이번에 만들지 않는다.
//   원본 색이 raw hex(#000·#7f7f7f·#bfbfbf)라 정본 색표에 같은 값이 없어 색 매핑 결정이 따로 필요하다.
const TEXT_BUTTON_VARIANTS: { name: string; color: string }[] = [
  { name: "Primary", color: "color/text/state/accent" },
  { name: "Secondary", color: "color/text/body/tertiary" },
];
const TEXT_BUTTON_STATES = ["Default", "Hover", "Pressed", "Disabled"];

async function buildTextButtonSet(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const comps: ComponentNode[] = [];
  const byKey = new Map<string, ComponentNode>();
  for (const v of TEXT_BUTTON_VARIANTS) {
    for (const state of TEXT_BUTTON_STATES) {
      const comp = figma.createComponent();
      comp.name = `Variant=${v.name}, State=${state}`;
      comp.layoutMode = "HORIZONTAL";
      comp.primaryAxisSizingMode = "AUTO";   // 폭·높이 모두 글자에 맞춘다(hug) — 원본에 고정 크기가 없다.
      comp.counterAxisSizingMode = "AUTO";
      comp.primaryAxisAlignItems = "CENTER";
      comp.counterAxisAlignItems = "CENTER";
      comp.fills = [];                        // 배경 없음(원본 그대로)
      const disabled = state === "Disabled";
      // 라벨 글자는 "텍스트버튼" — 보조 버튼에서 복사해 오며 "보조버튼" 이 그대로 남아 있었다(river 지시
      //   2026-09-08 "텍스트버튼 문구도 정본에서 고치고"). 웹 배포본은 처음부터 "텍스트버튼" 이었다.
      const label = await makeBoundText("텍스트버튼", 14, "Medium",
        scv(maps, disabled ? "color/text/state/disabled" : v.color), "body/14M");
      // Hover·Pressed = 밑줄. 색은 Default 와 같다.
      if (state === "Hover" || state === "Pressed") {
        try { label.textDecoration = "UNDERLINE"; } catch (e) { /* 환경 미지원(mock) */ }
      }
      comp.appendChild(label);
      setLightMode(comp, maps);
      comps.push(comp);
      byKey.set(`${v.name}:${state}`, comp);
      BUILT_COMPS[`TextButton:${v.name}:${state}`] = comp;
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Text Button"; set.x = 0; set.y = originY;
  BUILT_SETS["Text Button"] = set;
  const opts: SpecOpts = {
    title: "Text Button",
    colHeaders: TEXT_BUTTON_STATES,
    rowLabels: TEXT_BUTTON_VARIANTS.map((v) => v.name),
    cellAt: (r, c) => byKey.get(`${TEXT_BUTTON_VARIANTS[r].name}:${TEXT_BUTTON_STATES[c]}`) ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 132, cellH: 48, rowLabelW: 96,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ════════════════════════════════════════════════════════════════════════════
//  선택 컨트롤 (Checkbox · Radio · Toggle) — color/control/* 슬롯 바인딩
//  바인딩 정본 = Variables(vars-data). tokens.css 레거시 미사용.
// ════════════════════════════════════════════════════════════════════════════

/** Semantic Color 슬롯 변수 가져오기 (없으면 명확한 오류). */
function scv(maps: BuildMaps, key: string): Variable {
  return requireVar(maps.semanticColor, key, "Semantic Color");
}

/** 변수에 바인딩된 채움색을 가진 텍스트 노드. */
async function makeBoundText(chars: string, fontSize: number, style: string, colorVar: Variable, requiredStyleKey?: string): Promise<TextNode> {
  await figma.loadFontAsync({ family: "Pretendard", style });
  const t = figma.createText();
  t.fontName = { family: "Pretendard", style };
  t.fontSize = fontSize;
  t.characters = chars;
  // V2.4 텍스트 스타일 바인딩 — 타이포(크기·행간·자간·폰트)를 정본 스타일에 연결(Button 과 동일 방식).
  //   스타일이 없으면(예: 설치 누락) raw fontSize 로 폴백해 빌드는 계속한다.
  const ts = TEXT_STYLES[requiredStyleKey ?? textStyleKey(fontSize, style)];
  if (requiredStyleKey) {
    if (!ts) throw new Error(`Text Style 누락: ${requiredStyleKey} — Mobile Header는 raw 타이포 폴백을 허용하지 않습니다.`);
    await t.setTextStyleIdAsync(ts.id);
  } else if (ts) { try { await t.setTextStyleIdAsync(ts.id); } catch (e) { /* 기존 컴포넌트 호환: raw 유지 */ } }
  t.fills = [boundPaint(colorVar)];
  return t;
}

/** 체크 아이콘 — V2.2 ic_확인(line, ✓) 라이브러리 인스턴스(16px). ic_체크는 박스형이라 ic_확인 사용(사용자 지정 97:167). */
async function makeCheckIcon(strokeVar: Variable): Promise<SceneNode> {
  const svg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.9375 8L6.13252 11.375L13.0625 4.625" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  return makeIconInstance("check", strokeVar, 16, svg);
}

/**
 * 범용 스펙 프레임 (Light + Dark 나란히) — 컬럼 헤더 × 행 라벨 매트릭스.
 * cellAt(row,col)이 인스턴스화할 컴포넌트를 반환. 반환 = 두 프레임의 최하단 Y.
 */
interface SpecOpts {
  title: string;
  colHeaders: string[];
  rowLabels: string[];
  cellAt: (row: number, col: number) => ComponentNode | null;
  lightX: number;
  darkX: number;
  originY: number;
  cellW: number;
  cellH: number;
  rowLabelW?: number;
  /** 열마다 의미가 달라 공통 컬럼 헤더를 쓸 수 없을 때, 각 셀 위에 유형명을 표시한다. */
  cellLabelAt?: (row: number, col: number) => string | null;
  /** 다크 스펙을 원본 아래에 배치할 때 사용 (GNB 전용). x/y 를 각각 지정. 미지정=기존 동작(원본 우측 W+80). */
  darkOffset?: { x?: number; y?: number };
  /** 폭이 긴 스펙은 Dark 를 Light 바로 아래에 쌓는다. 두 스펙의 높이가 같다는 renderFlat 규칙을 사용한다. */
  stackDarkBelow?: boolean;
  /** 셀을 셀폭 중앙배치 대신 좌측(gridLeft)에 정렬. 폭이 크게 다른 variant(Footer PC1920 vs Mobile360)가
   *  좌측 기준으로 일관 정렬되게 한다(라이트·다크 스펙 양쪽 동일 적용). 미지정=기존 중앙배치. */
  leftAlignCells?: boolean;
}
/** 평면(컬럼×행) 레이아웃을 emit으로 렌더. 반환=총 높이. */
async function renderFlat(opts: SpecOpts, dark: boolean, emit: LayoutEmit): Promise<number> {
  const PAD = 24, TITLE_H = 30, HEADER_H = 24;
  const rowLabelW = opts.rowLabelW ?? 96;
  const gridLeft = PAD + rowLabelW;
  const c = specPalette(dark);
  let y = PAD;
  await emit.text(`${opts.title} · ${dark ? "Dark" : "Light"}`, PAD, y, 320, "LEFT", c.title, 14, "Bold");
  y += TITLE_H;
  // 셀별 라벨을 쓰는 매트릭스는 공통 컬럼 헤더 행을 만들지 않는다.
  if (!opts.cellLabelAt) {
    for (let col = 0; col < opts.colHeaders.length; col++) {
      if (opts.colHeaders[col]) await emit.text(opts.colHeaders[col], gridLeft + col * opts.cellW, y, opts.cellW, "CENTER", c.label, 11, "Medium"); // 빈 헤더는 빈 텍스트 노드 안 만든다
    }
    y += HEADER_H;
  }
  for (let r = 0; r < opts.rowLabels.length; r++) {
    // 행 높이 = 행 내 최대 컴포넌트 높이(+패딩). 고정 cellH 대신 → 라벨-컴포넌트 밀착·빈공간 제거.
    let rowH = 0;
    for (let cc = 0; cc < opts.colHeaders.length; cc++) { const cp = opts.cellAt(r, cc); if (cp && cp.height > rowH) rowH = cp.height; }
    // 셀별 유형명 22px + 하단 여유 8px. 두 행이면 기존 수동 스펙과 같은 336px 높이가 된다.
    const cellLabelH = opts.cellLabelAt ? 22 : 0;
    rowH = (rowH || opts.cellH) + (cellLabelH ? cellLabelH + 8 : 16);
    const top = y + (cellLabelH || 4);
    if (opts.rowLabels[r]) await emit.text(opts.rowLabels[r], PAD, top, rowLabelW, "LEFT", c.label, 11, "Medium");
    for (let cc = 0; cc < opts.colHeaders.length; cc++) {
      const comp = opts.cellAt(r, cc);
      if (comp) {
        const cellLabel = opts.cellLabelAt?.(r, cc);
        if (cellLabel) await emit.text(cellLabel, gridLeft + cc * opts.cellW, y, opts.cellW, "CENTER", c.label, 11, "Medium");
        const cellX = opts.leftAlignCells ? (gridLeft + cc * opts.cellW) : (gridLeft + cc * opts.cellW + (opts.cellW - comp.width) / 2);
        emit.cell(comp, cellX, top);
      }
    }
    y += rowH;
  }
  return y + PAD;
}

/** 평면 Dark 스펙 프레임만 생성(원본 세트=Light 기준). 위치=원본(x=0) 우측 밀착. 반환=최하단 Y.
 *  (2026-06-19 사용자 결정: 라이트 스펙은 원본과 중복이라 미생성 — 공간 절약) */
async function buildSpec(opts: SpecOpts, maps: BuildMaps): Promise<number> {
  const rowLabelW = opts.rowLabelW ?? 96;
  const W = specWidth(rowLabelW, opts.colHeaders.length, opts.cellW);
  const modeId = maps.semanticDarkModeId;
  const frame = figma.createFrame();
  frame.name = `${opts.title} — Spec Dark`;
  frame.fills = [{ type: "SOLID", color: specPalette(true).bg }];
  frame.cornerRadius = 8;
  frame.resize(W, 1600);
  frame.x = opts.darkOffset?.x ?? (opts.stackDarkBelow ? 0 : W + 80); // 폭이 길면 Light 아래, 아니면 기존처럼 우측
  frame.y = opts.darkOffset?.y ?? opts.originY;
  const H = await renderFlat(opts, true, frameEmit(frame, maps, modeId));
  frame.resize(W, H);
  if (opts.stackDarkBelow && opts.darkOffset?.y === undefined) frame.y = opts.originY + H + 80;
  setMode(frame, maps, modeId);
  return Math.max(opts.originY, frame.y + H);
}

/** 컴포넌트 세트 원본을 Light 평면 스펙처럼 꾸민다(라벨은 캔버스 정렬). 반환=최하단 Y. */
async function decorateSetFlat(set: ComponentSetNode, opts: SpecOpts, maps: BuildMaps): Promise<number> {
  const rowLabelW = opts.rowLabelW ?? 96;
  const W = specWidth(rowLabelW, opts.colHeaders.length, opts.cellW);
  set.x = 0; set.y = opts.originY;
  try { set.fills = [{ type: "SOLID", color: specPalette(false).bg }]; } catch (e) { /* skip */ }
  const H = await renderFlat(opts, false, floatingEmit(opts.originY));
  set.resize(W, H);
  setLightMode(set, maps);
  return opts.originY + H;
}

async function buildCheckbox(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const states = [
    { name: "Default",     bg: "color/control/bg/default",  border: "color/control/border/default" },
    { name: "Hover",       bg: "color/control/bg/hover",    border: "color/control/border/default" },
    { name: "Checked",     bg: "color/control/bg/selected", border: "color/control/border/selected", check: "color/control/indicator/selected" },
    { name: "Disabled",    bg: "color/control/bg/disabled", border: "color/control/border/disabled" },
    { name: "Dis+Checked", bg: "color/control/bg/disabled", border: "color/control/border/disabled", check: "color/control/indicator/disabled" },
  ];
  const comps: ComponentNode[] = [];
  for (const s of states) {
    const comp = figma.createComponent();
    comp.name = `State=${s.name}`;
    comp.resize(18, 18);
    comp.cornerRadius = 2;
    comp.fills = [boundPaint(scv(maps, s.bg))];
    comp.strokes = [boundPaint(scv(maps, s.border))];
    comp.strokeWeight = 1;
    comp.strokeAlign = "INSIDE";
    if (s.check) {
      const icon = await makeCheckIcon(scv(maps, s.check));
      comp.appendChild(icon);
      icon.x = 1; icon.y = 1;
    }
    setLightMode(comp, maps);
    comps.push(comp);
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Checkbox";
  set.x = 0; set.y = originY;
  // Table 행에서 인스턴스 재사용 — BUILT_COMPS 등록 (상태명 그대로)
  states.forEach((s, i) => { BUILT_COMPS[`Checkbox:${s.name}`] = comps[i]; });
  BUILT_SETS["Checkbox"] = set;
  const opts: SpecOpts = {
    title: "Checkbox",
    colHeaders: states.map((s) => s.name),
    rowLabels: [""],
    cellAt: (_r, c) => comps[c],
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 64, cellH: 44,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

async function buildRadio(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const states = [
    { name: "Default",      bg: "color/control/bg/default",  border: "color/control/border/default" },
    { name: "Hover",        bg: "color/control/bg/hover",    border: "color/control/border/default" },
    { name: "Selected",     bg: "color/control/bg/default",  border: "color/control/border/selected", dot: "color/control/indicator/selected-alt" },
    { name: "Disabled",     bg: "color/control/bg/disabled", border: "color/control/border/disabled" },
    { name: "Dis+Selected", bg: "color/control/bg/disabled", border: "color/control/border/disabled", dot: "color/control/indicator/disabled" },
  ];
  const labels = ["Off", "On"];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; row: number; col: number }[] = [];
  for (let row = 0; row < labels.length; row++) {
    for (let col = 0; col < states.length; col++) {
      const s = states[col];
      const lab = labels[row];
      const comp = figma.createComponent();
      comp.name = `State=${s.name}, Label=${lab}`;
      comp.layoutMode = "HORIZONTAL";
      comp.counterAxisAlignItems = "CENTER";
      comp.primaryAxisSizingMode = "AUTO";
      comp.counterAxisSizingMode = "AUTO";
      comp.itemSpacing = 8;
      const circle = figma.createFrame();
      circle.name = "circle";
      circle.resize(18, 18);
      circle.cornerRadius = 9;
      circle.fills = [boundPaint(scv(maps, s.bg))];
      circle.strokes = [boundPaint(scv(maps, s.border))];
      circle.strokeWeight = 1; circle.strokeAlign = "INSIDE";
      if (s.dot) {
        const dot = figma.createEllipse();
        dot.resize(10, 10);
        dot.fills = [boundPaint(scv(maps, s.dot))];
        circle.appendChild(dot);
        dot.x = 4; dot.y = 4;
      }
      comp.appendChild(circle);
      if (lab === "On") {
        const isDis = s.name.indexOf("Dis") === 0 || s.name === "Disabled";
        const labelVar = scv(maps, isDis ? "color/control/label/disabled" : "color/control/label/default");
        comp.appendChild(await makeBoundText("라디오", 14, "Medium", labelVar));
      }
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, row, col });
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Radio";
  set.x = 0; set.y = originY;
  const opts: SpecOpts = {
    title: "Radio",
    colHeaders: states.map((s) => s.name),
    rowLabels: labels.map((l) => `Label=${l}`),
    cellAt: (r, c) => cells.find((x) => x.row === r && x.col === c)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 116, cellH: 34,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

async function buildToggle(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const press = ["Off", "On"];
  const sts = ["Default", "Disabled"];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; row: number; col: number }[] = [];
  for (let row = 0; row < sts.length; row++) {
    for (let col = 0; col < press.length; col++) {
      const st = sts[row];
      const p = press[col];
      const on = p === "On";
      const dis = st === "Disabled";
      const trackKey = dis
        ? "color/control/bg/disabled"
        : (on ? "color/control/bg/selected" : "color/control/indicator/unselected");
      const comp = figma.createComponent();
      comp.name = `Pressed=${p}, State=${st}`;
      comp.resize(40, 20);
      comp.cornerRadius = 10;
      comp.fills = [boundPaint(scv(maps, trackKey))];
      const knob = figma.createEllipse();
      knob.resize(16, 16);
      // disabled 상태는 indicator도 disabled 색으로 (다크모드에서 흰색 knob 방지)
      const knobKey = dis ? "color/control/indicator/disabled" : "color/control/indicator/selected";
      knob.fills = [boundPaint(scv(maps, knobKey))];
      comp.appendChild(knob);
      knob.y = 2; knob.x = on ? 22 : 2;
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, row, col });
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Toggle";
  set.x = 0; set.y = originY;
  const opts: SpecOpts = {
    title: "Toggle",
    colHeaders: press.map((p) => `Pressed=${p}`),
    rowLabels: sts.map((s) => `State=${s}`),
    cellAt: (r, c) => cells.find((x) => x.row === r && x.col === c)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 72, cellH: 36,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Chip (Line/Solid pill) — color/chip/* 슬롯 ────────────────────────────────
async function buildChip(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const sizes = [
    { size: "SM", brk: "PC", h: 28, font: 12, pad: 16 },
    { size: "SM", brk: "Mobile", h: 30, font: 14, pad: 12 },
    { size: "MD", brk: "PC", h: 34, font: 14, pad: 16 },
  ];
  const states = ["Default", "Hover", "Selected", "Disabled"];
  const variants = ["Line", "Solid"];
  // Hover 보더: Line=기본 테두리 유지(border/default) · Solid=스트록 삭제(fill 색 bg/hover)
  //   2026-07-06 Line 스트록 복구 — 2026-06-30 "Solid 스트록 삭제" 요청이 Line 까지 지운 회귀 수정. 정본 chip.json 일치.
  const slot = (st: string, v: string): { bg: string; bd: string; lb: string; bdGroup?: string } =>
    st === "Default" ? { bg: "default", bd: "default", lb: "default" }
    : st === "Hover" ? (
        v === "line"
          ? { bg: "hover", bd: "default", lb: "default" }                // Line: 테두리 유지 = border/default (gray/300)
          : { bg: "hover", bd: "hover", bdGroup: "bg", lb: "default" }   // Solid: 스트록 삭제 = fill 색(bg/hover)
      )
    : st === "Selected" ? { bg: "selected", bd: "selected", lb: "selected" }
    : { bg: "disabled", bd: "disabled", lb: "disabled" };
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; row: number; col: number; variant: string; size: string; brk: string; state: string }[] = [];
  let row = 0;
  for (const variant of variants) {
    const v = variant.toLowerCase();
    for (const sc of sizes) {
      for (let col = 0; col < states.length; col++) {
        const ss = slot(states[col], v);
        const comp = figma.createComponent();
        comp.name = `Size=${sc.size}, State=${states[col]}, Variant=${variant}, Break=${sc.brk}`;
        comp.layoutMode = "HORIZONTAL";
        comp.primaryAxisAlignItems = "CENTER";
        comp.counterAxisAlignItems = "CENTER";
        comp.primaryAxisSizingMode = "AUTO";
        comp.counterAxisSizingMode = "FIXED";
        comp.paddingLeft = sc.pad; comp.paddingRight = sc.pad;
        bindRadius(comp, maps, "radius/full");
        comp.fills = [boundPaint(scv(maps, `color/chip/${v}/bg/${ss.bg}`))];
        comp.strokes = [boundPaint(scv(maps, `color/chip/${v}/${ss.bdGroup ?? "border"}/${ss.bd}`))];
        comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
        comp.appendChild(await makeBoundText("라벨", sc.font, "Medium", scv(maps, `color/chip/${v}/label/${ss.lb}`)));
        comp.resize(comp.width, sc.h);
        setLightMode(comp, maps);
        comps.push(comp);
        cells.push({ comp, row, col, variant, size: sc.size, brk: sc.brk, state: states[col] });
      }
      row++;
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Chip";
  set.x = 0; set.y = originY;
  const opts: GroupedSpecOpts = {
    title: "Chip",
    platforms: [{ name: "PC", sizes: ["SM", "MD"] }, { name: "Mobile", sizes: ["SM"] }],
    rowLabels: variants, // Line / Solid
    colHeaders: states,
    cellAt: (platName, size, ri, ci) =>
      cells.find((x) => x.variant === variants[ri] && x.size === size && x.brk === platName && x.state === states[ci])?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 96, cellH: 48, rowLabelW: 96,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Input (form-control 필드) — color/form-control/* 슬롯 ─────────────────────
// 핵심 매트릭스: Size × State × Message × Break. Label은 Input Slots 패턴에서 조합한다.
async function buildInput(maps: BuildMaps, originY: number, originX: number = INPUT_SHEET_X): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const fc = (k: string) => `color/form-control/${k}`;
  const states = [
    { name: "Default",   bg: "bg/default",  border: "border/default",  txt: "입력",   tc: "text/placeholder" },
    { name: "Filled",    bg: "bg/default",  border: "border/default",  txt: "텍스트", tc: "text/default" },
    { name: "Focus",     bg: "bg/selected", border: "border/selected", txt: "텍스트", tc: "text/selected" },
    { name: "Error",     bg: "bg/default",  border: "border/error",    txt: "텍스트", tc: "text/default" },
    { name: "Correct",   bg: "bg/default",  border: "border/correct",  txt: "텍스트", tc: "text/default" },
    { name: "Read-Only", bg: "bg/disabled", border: "border/default",  txt: "텍스트", tc: "text/read-only" },
    { name: "Disabled",  bg: "bg/disabled", border: "border/disabled", txt: "입력",   tc: "text/disabled" },
  ];
  const sizes = [
    { size: "XXSM", brk: "PC",     h: 28, padL: 12, padR: 8,  font: 12, head: "XXSM" },
    { size: "XSM",  brk: "PC",     h: 34, padL: 12, padR: 8,  font: 14, head: "XSM" },
    { size: "MD",   brk: "PC",     h: 44, padL: 16, padR: 12, font: 14, head: "MD" },
    // Mobile 은 누르는 영역이 48×48 이라 padR 을 두면 아이콘이 안쪽으로 밀린다.
    // padR 0 으로 누르는 영역을 칸 끝에 붙인다. (river 지시 2026-09-04)
    { size: "MD",   brk: "Mobile", h: 48, padL: 16, padR: 0,  font: 14, head: "MD·M" },
  ];
  const messages = ["Off", "On"];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; brk: string; state: string; message: string }[] = [];
  // hover: Mobile 은 false — 손가락에는 hover 가 없고, PC 브라우저로 Mobile 화면을 볼 때
  //   48×48 누르는 영역이 통째로 칠해져 실제 아이콘보다 훨씬 큰 면이 반응하는 것처럼 보인다(river 지시 2026-09-07).
  // pullInward: Mobile 에서 아이콘이 두 개 나란히 설 때 왼쪽 그림을 자기 칸 안쪽 끝으로 붙여
  //   보이는 간격을 좁힌다. 누르는 영역 48×48 은 그대로라 탭 정확도는 잃지 않는다(river HD-3 A, 2026-09-07).
  const wrapSuffixAction = (
    icon: SceneNode,
    actionName: string,
    hitSize: number,
    opts?: { hover?: boolean; pullInward?: boolean },
  ): FrameNode => {
    const action = figma.createFrame();
    action.name = actionName;
    action.layoutMode = "HORIZONTAL";
    action.primaryAxisAlignItems = opts?.pullInward ? "MAX" : "CENTER";
    action.counterAxisAlignItems = "CENTER";
    action.primaryAxisSizingMode = "FIXED";
    action.counterAxisSizingMode = "FIXED";
    action.fills = [];
    action.resize(hitSize, hitSize);
    // Input field 자체 Hover(삭제된 상태)와 suffix action Hover를 구분한다.
    // 마우스가 있는 장치에서만 웹 :hover가 이 28px hit area의 배경을 켠다.
    if (opts?.hover !== false) {
      const hoverBg = figma.createRectangle();
      hoverBg.name = `${actionName}-hover-bg`;
      hoverBg.fills = [boundPaint(scv(maps, fc("bg/hover")))];
      bindRadius(hoverBg, maps, "radius/4");
      hoverBg.resize(hitSize, hitSize);
      hoverBg.visible = false;
      action.appendChild(hoverBg);
      hoverBg.layoutPositioning = "ABSOLUTE";
      hoverBg.x = 0;
      hoverBg.y = 0;
      hoverBg.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
    }
    action.appendChild(icon);
    return action;
  };
  for (const sc of sizes) {
    for (const st of states) {
      for (const msg of messages) {
          const dis = st.name === "Disabled";
          const field = figma.createFrame();
          field.name = "field";
          field.layoutMode = "HORIZONTAL"; field.counterAxisAlignItems = "CENTER";
          field.primaryAxisSizingMode = "FIXED"; field.counterAxisSizingMode = "FIXED";
          field.paddingLeft = sc.padL; field.paddingRight = sc.padR; field.paddingTop = 0; field.paddingBottom = 0;
          field.cornerRadius = 4;
          field.fills = [boundPaint(scv(maps, fc(st.bg)))];
          field.strokes = [boundPaint(scv(maps, fc(st.border)))];
          field.strokeWeight = 1; field.strokeAlign = "INSIDE";
          const textNode = await makeBoundText(st.txt, sc.font, "Regular", scv(maps, fc(st.tc)));
          // 모든 variant: field 정렬 MIN(좌측). 텍스트/lead 가 좌측을 grow 로 채우고,
          // 트레일링 아이콘(눈·삭제)은 우측에 [눈][×] 순으로 인접 클러스터. (검증기 적발 정렬 수정 2026-06-19)
          field.primaryAxisAlignItems = "MIN";
          let clearIcon: SceneNode | null = null;
          if (st.name === "Focus") {
            // Focus(=selected): [텍스트 + 커서] 좌측(grow), 트레일링 = [눈][삭제]. Figma 정본 564:3757 icon=on.
            const lead = figma.createFrame();
            lead.name = "lead"; lead.fills = [];
            lead.layoutMode = "HORIZONTAL"; lead.counterAxisAlignItems = "CENTER";
            lead.primaryAxisSizingMode = "AUTO"; lead.counterAxisSizingMode = "AUTO";
            lead.itemSpacing = 4; // spacing/4 — 텍스트와 커서 간격
            lead.appendChild(textNode);
            lead.appendChild(makeCaret(scv(maps, fc("text-cursor"))));
            field.appendChild(lead);
            lead.layoutGrow = 1; lead.layoutSizingHorizontal = "FILL"; // 좌측 채움 → 트레일링 우측 고정
            clearIcon = await makeClearIcon(scv(maps, fc("icon/default")), fcIconPx(sc.h, 0)); // 눈 뒤에 append
          } else {
            // 비-Focus 상태: 텍스트가 좌측을 채우고(layoutGrow=1) 눈 아이콘이 우측 HUG.
            textNode.layoutGrow = 1;
            field.appendChild(textNode);
          }
          // 비밀번호 눈(미표시) — 모든 variant field 우측. 기본 visible=false(꺼짐, 공간 미점유).
          // Password Icon BOOLEAN 속성에 바인딩(아래 set 생성 후). 표시 눈은 인스턴스 스왑으로 교체.
          const eye = await makeIconInstance("eye", scv(maps, fc("icon/default")), sc.size === "XXSM" ? 20 : 24, EYE_OFF_SVG);
          eye.name = "eye-icon";
          const actionHitSize = sc.brk === "Mobile" ? 48 : 28;
          const isMobile = sc.brk === "Mobile";
          // Mobile: 눈은 왼쪽 칸이라 그림을 안쪽(오른쪽) 끝으로 당긴다. hover 면은 두지 않는다.
          const passwordAction = wrapSuffixAction(eye, "password-action", actionHitSize, {
            hover: !isMobile,
            pullInward: isMobile,
          });
          passwordAction.visible = false;
          // 트레일링 클러스터 [눈][×] — 눈↔삭제(×) 간격 = spacing/2(2px). lead↔클러스터는 0(밀착, field 기본 itemSpacing).
          const trail = figma.createFrame();
          trail.name = "trail"; trail.fills = [];
          trail.layoutMode = "HORIZONTAL"; trail.counterAxisAlignItems = "CENTER";
          trail.primaryAxisSizingMode = "AUTO"; trail.counterAxisSizingMode = "AUTO";
          // PC 2px(spacing/2). Mobile 은 0 — 48×48 칸을 맞붙이고 왼쪽 그림만 안쪽으로 당겨
          // 보이는 간격을 좁힌다(river HD-3 A). 칸은 겹치지 않는다.
          trail.itemSpacing = isMobile ? 0 : 2;
          trail.appendChild(passwordAction);
          if (clearIcon) trail.appendChild(wrapSuffixAction(clearIcon, "clear-action", actionHitSize, { hover: !isMobile })); // Focus: 각 action hit area 독립
          field.appendChild(trail);
          field.resize(200, sc.h); // Input 예외 — 넓은 필드
          const comp = figma.createComponent();
          comp.name = `Size=${sc.size}, State=${st.name}, Message=${msg}, Break=${sc.brk}`;
          comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO"; comp.itemSpacing = 6;
          comp.fills = []; // 외곽 컨테이너는 투명 — createComponent 기본 흰색 fill 제거(미사용 FFFFFF, 2026-06-24)
          comp.appendChild(field);
          if (msg === "On") {
            // 안내메시지 = 글자(text) 역할 토큰. 보더/라벨 토큰 오연결 정정(2026-07-13):
            //   기본=text/state/caption · 오류=text/state/caution · 확인=text/state/correct · 비활성=text/state/disabled
            //   기본(caption gray/500 #757575)은 Figma 실측으로 확정(2026-07-14). helper(gray/400 #9D9D9D)는 페이지네이션 예정 토큰이라 여기서 사용 안 함.
            //   (최초엔 form-control/border·label = 테두리/라벨 토큰 오연결, 2026-07-13 정정 시 default 를 helper 로 잘못 둠 → caption 으로 재정정)
            const msgColor = dis ? "color/text/state/disabled" : st.name === "Error" ? "color/text/state/caution" : st.name === "Correct" ? "color/text/state/correct" : "color/text/state/caption";
            comp.appendChild(await makeBoundText("안내 메세지", 12, "Regular", scv(maps, msgColor)));
          }
          setLightMode(comp, maps);
          comps.push(comp);
          cells.push({ comp, size: sc.size, brk: sc.brk, state: st.name, message: msg });
      }
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Input";
  // Password Icon BOOLEAN — 비밀번호 인풋일 때만 눈 아이콘 표시. 기본 false(꺼짐).
  // 모든 variant 의 field>trail>eye 레이어 visible 을 이 속성에 바인딩(레이어명 eye 통일 필수).
  // eye 가 trail 클러스터 하위로 들어가 직계 자식이 아니므로 findOne(재귀)로 탐색.
  const pwIconPropId = set.addComponentProperty("Password Icon", "BOOLEAN", false);
  const pwHoverPropId = set.addComponentProperty("Password Action Hover", "BOOLEAN", false);
  const clearHoverPropId = set.addComponentProperty("Clear Action Hover", "BOOLEAN", false);
  for (const c of comps) {
    const f = c.findChild((n: SceneNode) => n.name === "field") as FrameNode | null;
    const passwordAction = f ? f.findOne((n: SceneNode) => n.name === "password-action") : null;
    const passwordHover = f ? f.findOne((n: SceneNode) => n.name === "password-action-hover-bg") : null;
    const clearHover = f ? f.findOne((n: SceneNode) => n.name === "clear-action-hover-bg") : null;
    if (passwordAction) passwordAction.componentPropertyReferences = { visible: pwIconPropId };
    if (passwordHover) passwordHover.componentPropertyReferences = { visible: pwHoverPropId };
    if (clearHover) clearHover.componentPropertyReferences = { visible: clearHoverPropId };
  }
  // Input 은 규모가 커서(7 상태 × 4 사이즈 × 2 그룹) 넓은 시트로 배치. originX 로 좌측정렬(섹션 컬럼 내) 가능.
  const OX = originX;
  set.x = OX; set.y = originY;
  // 그룹핑 규칙: 안내메시지 유무를 상위 그룹(밴드)으로, 그 안에서 사이즈별로 나열.
  // Label은 Input의 variant가 아니며 Input Slots 패턴에서 별도로 조합한다.
  const groups = [
    { name: "기본",         msg: "Off" },
    { name: "안내메시지",   msg: "On" },
  ];
  const opts: GroupedSpecOpts = {
    title: "Input",
    // 플랫폼(PC/Mobile) → 사이즈 → 메시지 그룹(rowLabels)으로 구분 (Button·SelectBox 패턴과 동일)
    platforms: [
      // cellAt 이 sizeName 으로 cells.size 를 직매칭(x.size === sizeName)하므로
      // cells 의 실제 키(XXSM/XSM/MD)와 동일해야 한다. Issue 8 리네임 잔재(XSMALL/SMALL/MEDIUM)였음 — PC·Mobile 스펙 시트 빈칸 유발.
      { name: "PC",     sizes: ["XXSM", "XSM", "MD"] },
      { name: "Mobile", sizes: ["MD"] },
    ],
    rowLabels: groups.map((g) => g.name),
    colHeaders: states.map((s) => s.name),
    cellAt: (platName, sizeName, ri, ci) => {
      const g = groups[ri];
      if (!g) return null;
      return cells.find((x) => x.size === sizeName && x.brk === platName && x.state === states[ci].name && x.message === g.msg)?.comp ?? null;
    },
    // 세트(원본) → Light → Dark 를 OX 기준 가로로 나란히. specWidth(110,7,224)=1726, 컬럼 간 80 gap.
    offsetX: OX, lightX: OX + 1726 + 80, darkX: OX + (1726 + 80) * 2, originY, cellW: 224, cellH: 100, rowLabelW: 110,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

/** stroke 기반 아이콘(돋보기·chevron 등) — 모든 vector stroke 를 변수에 바인딩. */
function makeStrokeIcon(svg: string, strokeVar: Variable): FrameNode {
  const node = figma.createNodeFromSvg(svg); // icon-vector-allow: 벡터 헬퍼 내부 구현(개별 호출처가 allow 마커 보유)
  node.name = "icon";
  // createNodeFromSvg 는 <circle>→ELLIPSE, <rect>→RECTANGLE 등으로 변환 → VECTOR 만 재바인딩하면
  // 시계 테두리(원) 같은 비-VECTOR 도형이 SVG 원본 stroke(#000)로 남는다. 모든 stroke 도형을 재바인딩.
  const SHAPES = ["VECTOR", "ELLIPSE", "RECTANGLE", "LINE", "POLYGON", "STAR"];
  (node.findAll((n) => SHAPES.includes(n.type)) as VectorNode[]).forEach((v) => { v.strokes = [boundPaint(strokeVar)]; v.fills = []; });
  return node;
}

/** fill 기반 아이콘(글리프 채움) — 모든 채움 도형의 fill 을 변수에 바인딩. (GNB 유틸·캘린더 등 fill="currentColor") */
function makeFillIcon(svg: string, fillVar: Variable): FrameNode {
  const node = figma.createNodeFromSvg(svg); // icon-vector-allow: 벡터 헬퍼 내부 구현(개별 호출처가 allow 마커 보유)
  node.name = "icon";
  const SHAPES = ["VECTOR", "ELLIPSE", "RECTANGLE", "LINE", "POLYGON", "STAR", "BOOLEAN_OPERATION"];
  (node.findAll((n) => SHAPES.includes(n.type)) as (VectorNode | BooleanOperationNode)[]).forEach((v) => {
    try { v.fills = [boundPaint(fillVar)]; v.strokes = []; } catch (e) { /* skip */ }
  });
  return node;
}

// 입력 커서(캐럿) — Focus 상태에서 텍스트 뒤 깜빡이는 세로선. 색=color/form-control/text-cursor(호출부 바인딩, blue/400·dark blue-dark/350). Figma 564:3757.
// 높이 = 16px(토큰 사이즈 기준, 사용자 결정 2026-06-19). 이름 "caret" 은 Anatomy Gate(11) 가 검증한다.
function makeCaret(colorVar: Variable): RectangleNode {
  const caret = figma.createRectangle();
  caret.name = "caret";
  caret.resize(1, 16);
  caret.fills = [boundPaint(colorVar)];
  caret.strokes = [];
  return caret;
}

// ── 아이콘 = V2.2 아이콘 라이브러리 컴포넌트 인스턴스 (벡터 직삽입 금지 — 사용자 결정 2026-06-19) ──
// role → "Property 1=Line" 변형 컴포넌트 키. importComponentByKeyAsync 로 인스턴스 삽입 후 색 재바인딩·사이즈.
// 라이브러리 출처: 아이콘 라이브러리 V2.2(파일 YcBbW9e0MTR9T3W5Sz0Ukx · 14.UI 섹션). 전부 게시 확인됨.
// 새 아이콘은 여기 키만 추가하고 makeIconInstance 로 삽입 — createNodeFromSvg 직삽입은 Gate 12 가 차단한다.
// export 인 이유: 검사기(scripts/icon-key-consistency-check.js)가 이 정본을 **직접 읽어**
//   registry/figma/allowed-remote-keys.json 과 대조한다. 종전엔 두 곳이 손 동기화라
//   개수가 12 / 19 / 주석 "9키" 로 셋 다 어긋나 있었다(2026-08-01 실측).
export const ICON_KEYS: Record<string, string> = {
  remove:   "24b2df622d341e0af21cd4b23b4a7d23b97a5ea7", // 삭제(원+X) 439:84
  close:    "2a1abbd3597b536e34fd9523fb61eade3afe9934", // 닫기(plain-X, 원 없음) ic_닫기 89:4927 — 바텀시트/모달 닫기. remove(원+X)와 구분
  check:    "5ab251e0d90adb555ee2fa316f84e86041f19916", // 확인(체크마크 ✓) 97:167 — 체크박스 내부용(ic_체크는 박스형이라 ic_확인 사용)
  search:   "6b764af642b8883e892754281950da0e971224d7", // 찾기/조회(돋보기) 97:127
  clock:    "ca1d043ac09be07f827e939be3d8c3c7af8a8dd9", // 시간,시계 97:271
  calendar: "ea0ffc118c38048f2cdfb5620be31c120426bb7a", // 날짜,달력 70:664
  menu:     "5157e9edc76358e2e6bc1a5ebc1539ccf5f2e787", // 메뉴(햄버거) 97:227
  account:  "a423e2e05cfff2f93062d6a83d6f3bdf79ca9647", // 계정/사용자 86:58
  chevron:  "e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581", // 화살표,더보기(쉐브론 › 우향 기준) 419:69 — 방향은 rotation 으로(우0·상90·좌180·하270 — Figma 회전은 반시계)
  globe:    "dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2", // 인터넷(지구본) 35:3317 — GNB 언어(사용자 지정)
  eye:      "d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7", // 비밀번호 미표시(눈+슬래시 ic_비밀번호미표시 Line) — Input Password Icon boolean 기본값. 표시 눈은 인스턴스 스왑으로 교체
  eye_show: "b130623bad9bf035e273501b404bf7a245af1460", // 비밀번호 표시(뜬 눈 ic_비밀번호표시 Line) — 웹 Password 옵션의 표시 중 아이콘(river C4, 2026-09-04). Figma 변형 자체는 위 eye(미표시) 하나만 쓰고, 표시 눈은 웹에서만 별도 스왑한다.
  home:     "6bf422c937034ce15f6814e5c430d8f85953ed4e", // 홈(ic_홈 Solid) 97:292 — V2.2 아이콘 라이브러리. Mobile Bottom Nav
  mobileHeaderBack: "7190e284d345ae19a679a16ed7bceafbd54073ca", // ic_이전 / Solid — Mobile Header
  mobileHeaderClose: "54469d54f16ed38de2d7b420b0e2195e4cf7c118", // ic_닫기 / Solid — Mobile Header
  mobileHeaderNotification: "13cf1b580ec982fda488f9318c6821930ddfb26e", // ic_알림(신규) / Line — Mobile Header
  mobileHeaderArrowDown: "6babc3f493e48be1e7191a7b8a68945833039fe8", // ic_화살표, 더보기, 다음장 / Solid(419:68) — Mobile Header, 아래 방향 -90°
};
// 삼성 로고 컴포넌트 — V3.0 파일 로컬 노드 333:165 (134×30 벡터). 파일 동일 시 getNodeByIdAsync 직접 접근.
const SAMSUNG_LOGO_KEY = "9b32bb9ada9e84cdd18550f641389874858fa6ee";
// 삼성 로고 인스턴스 생성(targetH 높이로 비율 축소). 로컬→키→플레이스홀더 폴백.
async function getSamsungLogoInstance(targetH: number): Promise<SceneNode> {
  try {
    const n = await figma.getNodeByIdAsync("333:165") as ComponentNode | null;
    if (n && n.type === "COMPONENT") {
      const inst = n.createInstance();
      const scale = targetH / n.height;
      inst.resize(Math.round(n.width * scale), targetH);
      return inst;
    }
  } catch {}
  try {
    const comp = await figma.importComponentByKeyAsync(SAMSUNG_LOGO_KEY);
    const inst = comp.createInstance();
    const scale = targetH / comp.height;
    inst.resize(Math.round(comp.width * scale), targetH);
    return inst;
  } catch {}
  const r = figma.createRectangle();
  r.name = "samsung-logo-placeholder";
  r.resize(Math.round(107 * targetH / 24), targetH);
  r.cornerRadius = 2;
  r.fills = [{ type: "SOLID", color: { r: 0.09, g: 0.19, b: 0.55 } }];
  return r;
}
// 비밀번호 눈(미표시) 폴백 SVG — 라이브러리 import 실패 시만 사용.
const EYE_OFF_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="#353535" stroke-width="1.5"/><circle cx="12" cy="12" r="2.5" stroke="#353535" stroke-width="1.5"/><path d="M4 4l16 16" stroke="#353535" stroke-width="1.5"/></svg>`;
// 홈(Solid) 폴백 SVG — makeIconInstance 4번째 인자. 라이브러리(ic_홈 97:292) import 실패 시만 사용.
const HOME_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 5 28 15v11a1 1 0 0 1-1 1h-6v-8h-10v8H5a1 1 0 0 1-1-1V15L16 5Z" fill="#757575"/></svg>`;
// 색 재바인딩 — 보이는(visible) 채움/선만 교체. 숨김 채움(hit-area 배경 등)은 보존(쉐브론 Fill1 처럼).
function rebindIconColor(node: SceneNode, colorVar: Variable): void {
  const SHAPES = ["VECTOR", "ELLIPSE", "RECTANGLE", "LINE", "POLYGON", "STAR", "BOOLEAN_OPERATION"];
  ((node as FrameNode).findAll((n) => SHAPES.includes(n.type)) as VectorNode[]).forEach((v) => {
    try {
      if (v.isMask) return; // 마스크 도형 보존
      if (Array.isArray(v.strokes) && v.strokes.some((p) => p.visible !== false)) v.strokes = [boundPaint(colorVar)];
      if (Array.isArray(v.fills) && v.fills.some((p) => p.visible !== false)) v.fills = [boundPaint(colorVar)];
    } catch (e) { /* skip */ }
  });
}
// 아이콘 인스턴스 1개 생성. role=ICON_KEYS 키, size=목표 정사각 px, fallbackSvg=라이브러리 미접근 폴백, rotation=회전(쉐브론 방향).
// opts.wrap=false → 회전해도 래퍼 프레임 없이 인스턴스 직접 반환(정사각 180°는 바운딩박스 불변이라 호출처 x/y 중앙정렬이 정상 동작). 기본 true=기존 동작 보존.
// opts.keepName=true → inst.name 을 덮어쓰지 않고 컴포넌트 기본명(아이콘 이름) 유지. 기본 false=role 이름 부여(기존 동작 보존).
async function makeIconInstance(role: string, colorVar: Variable, size: number, fallbackSvg: string, rotation = 0, opts: { wrap?: boolean; keepName?: boolean } = {}): Promise<SceneNode> {
  const useWrap = opts.wrap !== false;
  try {
    const comp = await figma.importComponentByKeyAsync(ICON_KEYS[role]);
    const inst = comp.createInstance();
    if (!opts.keepName) inst.name = role;
    if (size && size !== inst.width) inst.resize(size, size);
    rebindIconColor(inst, colorVar);
    if (rotation) {
      // Figma 회전은 반시계: 우0·상90·좌180·하270.
      inst.rotation = rotation;
      if (!useWrap) return inst; // 래퍼 없이 회전 인스턴스 직접 반환(페이지네이션 화살표 = 정사각 180° → x/y 중앙정렬 정상)
      // 회전 노드는 x/y 중앙정렬이 까다로워 center 정렬 오토레이아웃 프레임으로 감싼다(셀렉트=오토레이아웃 등 비정사각/직각 회전용).
      const wrap = figma.createFrame();
      wrap.name = role; wrap.fills = []; wrap.clipsContent = false;
      wrap.layoutMode = "HORIZONTAL"; wrap.primaryAxisAlignItems = "CENTER"; wrap.counterAxisAlignItems = "CENTER";
      wrap.primaryAxisSizingMode = "FIXED"; wrap.counterAxisSizingMode = "FIXED";
      wrap.resize(size || inst.width, size || inst.height);
      wrap.appendChild(inst);
      return wrap;
    }
    return inst;
  } catch (e) {
    console.warn(`icon ${role} import 실패 → 벡터 폴백:`, e);
    const node = figma.createNodeFromSvg(fallbackSvg); // icon-vector-allow: 라이브러리 import 실패 폴백
    node.name = role;
    rebindIconColor(node, colorVar);
    return node;
  }
}

/** Mobile Header 전용 아이콘 import. 원본 라이브러리 인스턴스가 아니면 빌드를 중단한다.
 *  raw SVG/hex 폴백을 두지 않아 Semantic-only·원본 provenance 규칙을 지킨다. */
async function makeRequiredIconInstance(
  role: string,
  colorVar: Variable,
  size: number,
  accentVar?: Variable,
  rotation = 0,
): Promise<SceneNode> {
  const key = ICON_KEYS[role];
  if (!key) throw new Error(`Mobile Header 아이콘 키 누락: ${role}`);
  const remote = await figma.importComponentByKeyAsync(key);
  const inst = remote.createInstance();
  inst.name = role;
  if (size && (inst.width !== size || inst.height !== size)) inst.resize(size, size);
  rebindIconColor(inst, colorVar);
  if (rotation) inst.rotation = rotation;
  if (accentVar) {
    const SHAPES = ["VECTOR", "ELLIPSE", "RECTANGLE", "LINE", "POLYGON", "STAR", "BOOLEAN_OPERATION"];
    const visible = (inst.findAll((n) => SHAPES.includes(n.type) && n.visible) as VectorNode[])
      .filter((n) => !n.isMask);
    const namedAccent = visible.find((n) => /badge|dot|new|red|알림점/i.test(n.name));
    const accent = namedAccent ?? visible.slice().sort((a, b) => (a.width * a.height) - (b.width * b.height))[0];
    if (!accent) throw new Error("Mobile Header 알림 아이콘의 accent 레이어를 찾지 못했습니다.");
    try {
      if (Array.isArray(accent.strokes) && accent.strokes.some((p) => p.visible !== false)) accent.strokes = [boundPaint(accentVar)];
      if (Array.isArray(accent.fills) && accent.fills.some((p) => p.visible !== false)) accent.fills = [boundPaint(accentVar)];
    } catch (e) { throw new Error("Mobile Header 알림 아이콘 accent Semantic 바인딩에 실패했습니다."); }
  }
  return inst;
}
// 회전 등으로 로컬 원점이 시각 바운딩박스 코너와 어긋난 노드를 부모(box, sz×sz) 정중앙에 안전 배치.
// 실제 absoluteBoundingBox 를 측정해 보정하므로 Figma 의 회전 피벗/.x 해석에 의존하지 않는다(어느 해석이든 정중앙).
function centerIconInBox(node: SceneNode, box: SceneNode, sz: number): void {
  const bb = (node as any).absoluteBoundingBox as { x: number; y: number; width: number; height: number } | null;
  const pb = (box as any).absoluteBoundingBox as { x: number; y: number; width: number; height: number } | null;
  if (!bb || !pb) { node.x = (sz - node.width) / 2; node.y = (sz - node.height) / 2; return; }
  node.x += (pb.x + (sz - bb.width) / 2) - bb.x;
  node.y += (pb.y + (sz - bb.height) / 2) - bb.y;
}
// 입력값 삭제(close) 아이콘 — remove(원+X) 인스턴스. 24px 네이티브(글리프 16) 유지. 이름 "remove" 은 Anatomy Gate(11) 검증.
// icon-fallback-not-canon: 라이브러리 import 실패용 폴백. 웹 자산으로 쓰려면 ui:icons:origin 원본 대조 PASS 가 있어야 한다.
const REMOVE_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M16 8C16 3.58588 12.4141 0 8 0C3.58588 0 0 3.58588 0 8C0 12.4141 3.58588 16 8 16C12.4141 16 16 12.4141 16 8ZM8 15.0588C4.10353 15.0588 0.941176 11.8965 0.941176 8C0.941176 4.10353 4.10353 0.941176 8 0.941176C11.8965 0.941176 15.0588 4.10353 15.0588 8C15.0588 11.8965 11.8965 15.0588 8 15.0588Z" fill="#353535"/><path d="M5.5 5.5L10.8333 10.8333" stroke="#353535" stroke-width="1.5" stroke-linejoin="round"/><path d="M10.8333 5.5L5.5 10.8333" stroke="#353535" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
// plain-X 닫기 폴백 SVG(원 없음, ✕ 2선) — 라이브러리 close(ic_닫기 89:4927) import 실패 시만. 색은 rebindIconColor 가 변수 바인딩.
// icon-fallback-not-canon: 라이브러리 import 실패용 폴백. 웹 자산으로 쓰려면 ui:icons:origin 원본 대조 PASS 가 있어야 한다.
const CLOSE_ICON_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18" stroke="#353535" stroke-width="1.5" stroke-linecap="round"/><path d="M18 6L6 18" stroke="#353535" stroke-width="1.5" stroke-linecap="round"/></svg>`;
async function makeClearIcon(colorVar: Variable, size = 0): Promise<SceneNode> {
  return makeIconInstance("remove", colorVar, size, REMOVE_ICON_SVG); // size 0 = 리사이즈 안 함(네이티브 24)
}
// form-control 아이콘 크기 규칙: XXSM(h<=28)=20px, 그 외=24px (2026-06-19 사용자 결정).
const fcIconPx = (h: number, _base: number): number => (h <= 28 ? 20 : 24);

// ── Search Input (form-control + 돋보기 아이콘) ───────────────────────────────
async function buildSearch(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const fc = (k: string) => `color/form-control/${k}`;
  const MAG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#000" stroke-width="1.3"/><path d="M10.6 10.6L14 14" stroke="#000" stroke-width="1.3" stroke-linecap="round"/></svg>`;
  // 상태 3종(river D4, 2026-09-04): Default(돋보기만) · Filled(값 있음 — 지우기+돋보기) · Disabled.
  // 이전 Focus(=selected) 행은 뺐다 — 초점 표시는 Base Input과 같은 웹 :focus-within로만 처리한다(Figma 변형 아님).
  const states = [
    { name: "Default",  bg: "bg/default",  border: "border/default",  txt: "검색",   tc: "text/placeholder", icon: "icon/default" },
    { name: "Filled",   bg: "bg/default",  border: "border/default",  txt: "검색어", tc: "text/default",     icon: "icon/default" },
    { name: "Disabled", bg: "bg/disabled", border: "border/disabled", txt: "검색",   tc: "text/disabled",    icon: "icon/disabled" },
  ];
  // Mobile MD 행 신설(river D3, 2026-09-04) — Base Input Mobile 규칙(h48·padL16·padR0)을 그대로 따른다.
  const sizes = [
    { size: "XXSM", brk: "PC",     h: 28, font: 12, padL: 12, padR: 8 },
    { size: "XSM",  brk: "PC",     h: 34, font: 14, padL: 12, padR: 8 },
    { size: "MD",   brk: "PC",     h: 44, font: 14, padL: 16, padR: 12 },
    { size: "MD",   brk: "Mobile", h: 48, font: 14, padL: 16, padR: 0 },
  ];
  // 누르는 영역(river C3): PC 28×28 · Mobile 48×48 — Base Input wrapSuffixAction과 같은 크기 규칙.
  // pullInward: Mobile 에서 아이콘 두 개가 나란히 설 때 왼쪽(지우기) 그림을 자기 칸 안쪽 끝에 붙여
  //   보이는 간격을 좁힌다. 누르는 영역 48×48 은 그대로 두어 탭 정확도를 잃지 않는다(river HD-3 A, 2026-09-07).
  // hover: PC 만 true — Base Input 의 wrapSuffixAction 과 같은 규칙으로 hit area 배경을 둔다.
  //   Search 액션에만 hover 면이 없어 Base Input 과 어긋나 있던 것을 맞춘다(river HD-2 "넣자", 2026-09-07).
  //   Mobile 은 손가락에 hover 가 없으므로 두지 않는다(D7).
  const wrapAction = (
    icon: SceneNode,
    actionName: string,
    hitSize: number,
    opts?: { hover?: boolean; pullInward?: boolean },
  ): FrameNode => {
    const action = figma.createFrame();
    action.name = actionName;
    action.layoutMode = "HORIZONTAL";
    action.primaryAxisAlignItems = opts?.pullInward ? "MAX" : "CENTER";
    action.counterAxisAlignItems = "CENTER";
    action.primaryAxisSizingMode = "FIXED";
    action.counterAxisSizingMode = "FIXED";
    action.fills = [];
    action.resize(hitSize, hitSize);
    if (opts?.hover !== false) {
      const hoverBg = figma.createRectangle();
      hoverBg.name = `${actionName}-hover-bg`;
      hoverBg.fills = [boundPaint(scv(maps, fc("bg/hover")))];
      bindRadius(hoverBg, maps, "radius/4");
      hoverBg.resize(hitSize, hitSize);
      hoverBg.visible = false;
      action.appendChild(hoverBg);
      hoverBg.layoutPositioning = "ABSOLUTE";
      hoverBg.x = 0;
      hoverBg.y = 0;
      hoverBg.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
    }
    action.appendChild(icon);
    return action;
  };
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; brk: string; state: string }[] = [];
  for (const sc of sizes) {
    for (const st of states) {
      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, State=${st.name}, Break=${sc.brk}`;
      comp.layoutMode = "HORIZONTAL";
      comp.primaryAxisAlignItems = "SPACE_BETWEEN";
      comp.counterAxisAlignItems = "CENTER";
      comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
      comp.paddingLeft = sc.padL; comp.paddingRight = sc.padR; comp.paddingTop = 0; comp.paddingBottom = 0;
      comp.cornerRadius = 4;
      comp.fills = [boundPaint(scv(maps, fc(st.bg)))];
      comp.strokes = [boundPaint(scv(maps, fc(st.border)))];
      comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
      const textNode = await makeBoundText(st.txt, sc.font, "Regular", scv(maps, fc(st.tc)));
      const actionHitSize = sc.brk === "Mobile" ? 48 : 28;
      if (st.name === "Filled") {
        // Filled(=값 있음): [검색어] 좌측 / [지우기][돋보기] 우측. 지우기는 돋보기 왼쪽(정본 trail 순서 유지).
        comp.appendChild(textNode);
        const trail = figma.createFrame();
        trail.name = "trail"; trail.fills = [];
        trail.layoutMode = "HORIZONTAL"; trail.counterAxisAlignItems = "CENTER";
        trail.primaryAxisSizingMode = "AUTO"; trail.counterAxisSizingMode = "AUTO";
        // PC 4px(spacing/4). Mobile 은 0 — 48×48 칸을 맞붙이고 왼쪽 그림만 안쪽으로 당긴다(river HD-3 A).
        trail.itemSpacing = sc.brk === "Mobile" ? 0 : 4;
        const searchIsMobile = sc.brk === "Mobile";
        // 왼쪽(지우기)만 안쪽으로 당긴다. 오른쪽(돋보기)은 칸 끝 12px 자리를 지켜야 하므로 가운데 정렬 유지.
        trail.appendChild(wrapAction(await makeClearIcon(scv(maps, fc("icon/default")), fcIconPx(sc.h, 0)), "clear-action", actionHitSize, { hover: !searchIsMobile, pullInward: searchIsMobile }));
        trail.appendChild(wrapAction(await makeIconInstance("search", scv(maps, fc(st.icon)), fcIconPx(sc.h, 0), MAG), "search-action", actionHitSize, { hover: !searchIsMobile }));
        comp.appendChild(trail);
      } else {
        comp.appendChild(textNode);
        comp.appendChild(wrapAction(await makeIconInstance("search", scv(maps, fc(st.icon)), fcIconPx(sc.h, 0), MAG), "search-action", actionHitSize, { hover: sc.brk !== "Mobile" }));
      }
      comp.resize(160, sc.h);
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, size: sc.size, brk: sc.brk, state: st.name });
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Search Input";
  set.x = 0; set.y = originY;
  const opts: GroupedSpecOpts = {
    title: "Search Input",
    platforms: [
      { name: "PC",     sizes: ["XXSM", "XSM", "MD"] },
      { name: "Mobile", sizes: ["MD"] },
    ],
    rowLabels: [""],
    colHeaders: states.map((s) => s.name),
    cellAt: (platName, sizeName, _ri, ci) =>
      cells.find((x) => x.size === sizeName && x.brk === platName && x.state === states[ci].name)?.comp ?? null,
    offsetX: 0, lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 176, cellH: 60, rowLabelW: 0,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Text Area (form-control, 멀티라인 + Helper) ──────────────────────────────
async function buildTextarea(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const fc = (k: string) => `color/form-control/${k}`;
  const states = [
    { name: "Default",  bg: "bg/default",  border: "border/default",  txt: "입력",   tc: "text/placeholder" },
    { name: "Focus",    bg: "bg/selected", border: "border/selected", txt: "텍스트", tc: "text/selected" },
    { name: "Filled",   bg: "bg/default",  border: "border/default",  txt: "텍스트", tc: "text/default" },
    { name: "Disabled", bg: "bg/disabled", border: "border/disabled", txt: "입력",   tc: "text/disabled" },
    { name: "Readonly", bg: "bg/disabled", border: "border/default",  txt: "텍스트", tc: "text/read-only" },
  ];
  // 원본 Helper=On 은 필드 하단 카운터+아이콘 툴바(별도 스펙). 1차는 필드 상태만 — 잘못된 "도움말 텍스트" 제거.
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; row: number; col: number }[] = [];
  for (let row = 0; row < states.length; row++) {
    const st = states[row];
    const comp = figma.createComponent();
    comp.name = `State=${st.name}`;
    comp.layoutMode = "HORIZONTAL"; comp.counterAxisAlignItems = "MIN";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
    comp.resize(240, 80);
    comp.paddingLeft = 12; comp.paddingRight = 12; comp.paddingTop = 10; comp.paddingBottom = 10;
    comp.cornerRadius = 4;
    comp.fills = [boundPaint(scv(maps, fc(st.bg)))];
    comp.strokes = [boundPaint(scv(maps, fc(st.border)))];
    comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    const textNode = await makeBoundText(st.txt, 14, "Regular", scv(maps, fc(st.tc)));
    if (st.name === "Focus") {
      // Focus(=selected): [텍스트 + 커서] 인풋처럼 lead 프레임(HORIZONTAL CENTER)으로 묶어 세로 중앙정렬.
      // 텍스트에리어는 삭제(close) 아이콘 미포함(사용자 결정).
      const lead = figma.createFrame();
      lead.name = "lead"; lead.fills = [];
      lead.layoutMode = "HORIZONTAL"; lead.counterAxisAlignItems = "CENTER";
      lead.primaryAxisSizingMode = "AUTO"; lead.counterAxisSizingMode = "AUTO";
      lead.itemSpacing = 4;
      lead.appendChild(textNode);
      lead.appendChild(makeCaret(scv(maps, fc("text-cursor"))));
      comp.appendChild(lead);
    } else {
      comp.appendChild(textNode);
    }
    setLightMode(comp, maps);
    comps.push(comp);
    cells.push({ comp, row, col: 0 });
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Text Area";
  set.x = 0; set.y = originY;
  const opts: SpecOpts = {
    title: "Text Area",
    colHeaders: ["Field"],
    rowLabels: states.map((s) => s.name),
    cellAt: (r, c) => cells.find((x) => x.row === r && x.col === c)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 264, cellH: 96,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Select Box (form-control 트리거 + 다운 chevron) — Break 있음 → 그룹형 ──────
// Open 상태는 1차로 트리거 하이라이트(chevron 위)만, 드롭다운 옵션 패널은 후속.
async function buildSelect(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const fc = (k: string) => `color/form-control/${k}`;
  const chevDown = (c: string) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="${c}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const chevUp = (c: string) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 10L8 6L12 10" stroke="${c}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const states = [
    { name: "Default",  bg: "bg/default",  border: "border/default",  tc: "text/placeholder", icon: "icon/default",  up: false },
    { name: "Hover",    bg: "bg/hover",    border: "border/default",  tc: "text/placeholder", icon: "icon/default",  up: false },
    { name: "Open",     bg: "bg/selected", border: "border/selected", tc: "text/placeholder", icon: "icon/default",  up: true },
    { name: "Filled",   bg: "bg/default",  border: "border/default",  tc: "text/selected",    icon: "icon/default",  up: false },
    { name: "Disabled", bg: "bg/disabled", border: "border/disabled", tc: "text/disabled",    icon: "icon/disabled", up: false },
  ];
  const sizes = [
    { size: "XXSM", brk: "PC",     h: 28, font: 12 },
    { size: "XSM",  brk: "PC",     h: 34, font: 14 },
    { size: "MD",   brk: "PC",     h: 44, font: 14 },
    { size: "MD",   brk: "Mobile", h: 48, font: 14 },
  ];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; brk: string; state: string }[] = [];
  for (const sc of sizes) {
    for (const st of states) {
      const trigger = figma.createFrame();
      trigger.name = "trigger";
      trigger.layoutMode = "HORIZONTAL";
      trigger.primaryAxisAlignItems = "SPACE_BETWEEN";
      trigger.counterAxisAlignItems = "CENTER";
      trigger.primaryAxisSizingMode = "FIXED"; trigger.counterAxisSizingMode = "FIXED";
      trigger.paddingLeft = 16; trigger.paddingRight = 8; trigger.paddingTop = 0; trigger.paddingBottom = 0;
      trigger.cornerRadius = 4;
      trigger.fills = [boundPaint(scv(maps, fc(st.bg)))];
      trigger.strokes = [boundPaint(scv(maps, fc(st.border)))];
      trigger.strokeWeight = 1; trigger.strokeAlign = "INSIDE";
      trigger.appendChild(await makeBoundText("선택", sc.font, "Regular", scv(maps, fc(st.tc))));
      // 정사각 chevron + 직각 회전(90/270)은 바운딩박스가 불변이고 부모가 오토레이아웃이라
      //   중앙정렬용 래퍼 프레임이 불필요하다(래퍼는 동일 이름 "chevron" 이 2겹으로 보이는 원인). wrap:false 로 인스턴스 1레이어만 둔다.
      trigger.appendChild(await makeIconInstance("chevron", scv(maps, fc(st.icon)), fcIconPx(sc.h, 0), (st.up ? chevUp : chevDown)("#000"), st.up ? 90 : 270, { wrap: false }));
      trigger.resize(140, sc.h);

      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, State=${st.name}, Break=${sc.brk}`;
      comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO"; comp.itemSpacing = 8;
      comp.fills = []; // 외곽 컨테이너는 투명 — createComponent 기본 흰색 fill 제거(미사용 FFFFFF, 2026-06-24)
      comp.appendChild(trigger);
      if (st.name === "Open") {
        // Dropdown 컴포넌트 인스턴스 재사용 — 사이즈별 매칭, anatomy gate: "list" raw 프레임 금지
        // Mobile MD 는 PC MD 드롭다운 사용
        const ddKey = `Dropdown:${sc.size}:Default`;
        let ddComp: ComponentNode | undefined = BUILT_COMPS[ddKey] ?? BUILT_COMPS["Dropdown:MD:Default"] ?? BUILT_COMPS["Dropdown:Default"];
        if (!ddComp) {
          // 재설치 중 Dropdown이 skip된 경우 — 페이지에서 탐색
          const ddSet = await getBuiltSet("Dropdown");
          if (ddSet) {
            // Type 축 신설(2026-08-14) 후 같은 Size 에 Text·Checkbox 두 벌이 있으므로 Type=Text 를 명시해 집는다.
            ddComp = (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes(`Size=${sc.size}`) && c.name.includes("Type=Text"))
              ?? (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes(`Size=${sc.size}`))
              ?? (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes("Type=Text"))
              ?? (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT");
          }
        }
        if (ddComp) {
          const ddInst = ddComp.createInstance();
          ddInst.name = "dropdown";
          comp.appendChild(ddInst);
          // 목록 폭 = 트리거 폭 — 규칙 ③(river 2026-09-08). 셀렉트 트리거는 항상 140 이라 하한 100 에 걸리지 않는다.
          try { ddInst.resize(Math.max(DD_MIN_W, trigger.width), ddInst.height); } catch (e) { /* mock 환경 no-op */ }
        }
      }
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, size: sc.size, brk: sc.brk, state: st.name });
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Select Box";
  set.x = 0; set.y = originY;
  // Table 푸터에서 인스턴스 재사용 — BUILT_COMPS 등록 (size:brk:state)
  cells.forEach(({ comp, size, brk, state }) => { BUILT_COMPS[`SelectBox:${size}:${brk}:${state}`] = comp; });
  BUILT_SETS["Select Box"] = set;
  const opts: GroupedSpecOpts = {
    title: "Select Box",
    platforms: [{ name: "PC", sizes: ["XXSM", "XSM", "MD"] }, { name: "Mobile", sizes: ["MD"] }],
    rowLabels: [""],
    colHeaders: states.map((s) => s.name),
    cellAt: (platName, size, _ri, ci) =>
      cells.find((x) => x.size === size && x.brk === platName && x.state === states[ci].name)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 156, cellH: 220, rowLabelW: 16,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Dropdown List (옵션 상태) — color/dropdown/option/* ──────────────────────
// 원본은 리스트 패널(Hover/Selected/Option). 재사용 단위인 옵션 상태 세트로 구성.
// #11: 3사이즈(XXSM/XSM/MD) × 4상태. 폰트·옵션높이는 Select Box 기준(2026-06-19).
//
// 2026-08-14 사용자 결정 — 다중 선택(체크박스) 유형 신설. Type 축 추가:
//   Type=Text         글자만 (기존 단일 선택 옵션)
//   Type=Checkbox     Checkbox 인스턴스 + 글자 (다중 선택 옵션)
//   Type=Checkbox+All 위 + 라벨 "전체 선택" + 하단 1px 구분선 (체크박스 패널 최상단 전용)
// 설계 근거(사용자와 합의):
//   ▸ 체크박스는 직접 그리지 않고 **Selection 카테고리의 Checkbox 컴포넌트 인스턴스**를 부착한다.
//     Table 행과 동일한 방식으로, 체크박스 규칙(색·상태·크기)이 한 벌로 유지된다. 직접 그리면 규칙이 두 벌이 된다.
//   ▸ 갈래는 이 "옵션 한 줄"에만 세우고 트리거(Select Box)는 손대지 않는다. 트리거의 다중선택 표시는
//     글자 override 수준이라 20개 variant 를 복제할 값어치가 없다(2026-08-14 검토에서 철회).
//   ▸ 체크 유형의 Selected 는 **글자를 강조하지 않는다**(사용자 결정): 체크 표시가 이미 선택을 말하므로
//     라벨색은 default 유지. 단일 선택(Text)은 종전대로 option/label/selected 강조 유지.
//   ▸ 구분선은 패널이 아니라 "전체 선택 줄"이 들고 있다 — 패널을 건드리지 않아야 이 패널을 쓰는
//     Select Box·Filter Chip 이 영향을 안 받는다.
// 새 토큰 0건 — 색은 전부 기존 color/dropdown/* · color/control/* 재사용.
// ── 드롭다운 목록 폭 규칙 (river 최종 확정 2026-09-07) ───────────────────────────
//   river 원문: "드롭다운은 최소 100px / 칩이 드롭다운보다 width값이 작은경우 드롭다운은 100px로 보여진다 /
//               칩의 width가 100px이상이 되는경우 드롭다운의 width는 칩의 width와 동일하게 표출된다"
//   ① 목록 최소 폭 100px  ② 트리거(칩·셀렉트)가 100px 미만이면 목록은 100px
//   ③ 트리거가 100px 이상이면 목록 폭 = 트리거 폭  ④ 최대 폭 상한 없음
//   ⑤ 폭을 넘는 옵션 글자는 말줄임(…) — 아래 fillRow 의 textTruncation 이 담당한다.
//
//   ※ 목록(패널·옵션 줄)은 하한 100px 그대로 만든다 — river 결정 2026-09-08:
//     "100이 최소값이니까 피그마에도 최소값으로 표출되는게 맞아". 종전 리터럴 140 을 100 으로 내렸다.
//     셀렉트 트리거(buildSelectBox 의 trigger.resize(140, …))는 웹 select.css 의 min-width:140px 과
//     한 벌이라 그대로 둔다 — 규칙 ③(목록 폭 = 트리거 폭)은 트리거가 더 넓을 때의 이야기다.
//   ※ ①~④ 의 「트리거 폭을 따라간다」는 Figma 컴포넌트가 고정 폭이라 캔버스로 표현할 수 없다.
//     그래서 정본에는 GUI 로 보이는 ⑤(말줄임)와 하한 100 만 반영하고, 폭 연동 규칙은 기계가독 사양으로 남긴다
//     → registry/components/dropdown.json 의 guide.panelWidthRule (웹 구현·실측값 포함).
//   경위(320 상한 → 폐기 → 하한 140 → 100 확정) = reports/ui-library/dropdown-max-width/ · workflow-state D22~D27.
/** 드롭다운 목록(패널·옵션 줄·구분선)의 폭 = 규칙 ①의 최소값. 트리거가 더 넓으면 웹에서 트리거 폭을 따라간다. */
const DD_MIN_W = 100;

async function buildDropdownList(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const dd = (k: string) => `color/dropdown/${k}`;
  const states = [
    { name: "Default",  bg: "option/bg/default",  label: "option/label/default",  chk: "Default" },
    { name: "Hover",    bg: "option/bg/hover",    label: "option/label/hover",    chk: "Hover"   },
    // 2026-07-08 사용자 결정: 선택 배경=default와 동일 토큰(강조는 텍스트색만). option/bg/selected(하늘색)는
    // 더 이상 여기서 안 쓰지만 Time Picker Cell(별도 컴포넌트, buildTimePickerCell)은 계속 사용 — 그대로 둠.
    { name: "Selected", bg: "option/bg/default",  label: "option/label/selected", chk: "Checked" },
  ];
  const types = [
    { name: "Text",         checkbox: false, divider: false, text: "옵션" },
    { name: "Checkbox",     checkbox: true,  divider: false, text: "옵션" },
    { name: "Checkbox+All", checkbox: true,  divider: true,  text: "전체 선택" },
  ];
  const sizes = [
    { size: "XXSM", h: 28, font: 12 },
    { size: "XSM",  h: 34, font: 14 },
    { size: "MD",   h: 44, font: 14 },
  ];
  const CHK_GAP = 8;   // 체크박스↔글자 간격 = spacing/8 (Foundation)
  const CHK_PX  = 18;  // Checkbox 컴포넌트 실치수 — 최소 행높이 28 에도 위아래 5px 여유

  /** 옵션 한 줄의 내용(배경·체크박스·글자)을 host 에 채운다. host = 컴포넌트 자신 또는 내부 content 프레임. */
  const fillRow = async (
    host: ComponentNode | FrameNode,
    sz: { h: number; font: number },
    ty: { checkbox: boolean; text: string },
    st: { bg: string; label: string; chk: string },
    rowH: number,
  ) => {
    host.layoutMode = "HORIZONTAL"; host.counterAxisAlignItems = "CENTER";
    host.primaryAxisSizingMode = "FIXED"; host.counterAxisSizingMode = "FIXED";
    host.paddingLeft = 12; host.paddingRight = 12; host.paddingTop = 0; host.paddingBottom = 0;
    host.itemSpacing = ty.checkbox ? CHK_GAP : 0;
    host.fills = [boundPaint(scv(maps, dd(st.bg)))];
    host.resize(DD_MIN_W, rowH);
    if (ty.checkbox) {
      // 이번 빌드에서 만든 Checkbox(BUILT_COMPS) → 캔버스에 이미 있는 Checkbox 세트(재설치 시 skip 됨) 순으로 찾는다.
      //   BUILT_COMPS 만 보면 "Checkbox 는 그대로 두고 Dropdown List 만 다시 만드는" 흔한 재설치에서
      //   전부 fallback 으로 떨어져 가짜 체크박스가 고착된다(🤖 component-verifier 실측 2026-08-14).
      //   BUILD_DEPENDENCIES 는 **같은 카테고리 안 순서만** 정렬하므로(buildOrderFor 의 inCat 조건)
      //   Selection↔Dropdown 처럼 카테고리가 다르면 이 사고를 막지 못한다 — 그래서 캔버스 재등록이 필요하다.
      const chkComp = await reuseVariant("Checkbox", `Checkbox:${st.chk}`, [`State=${st.chk}`]);
      if (chkComp) {
        const inst = chkComp.createInstance();
        inst.name = "checkbox";
        host.appendChild(inst);
      } else {
        // 최후 fallback — Checkbox 가 이번 빌드에도 캔버스에도 없는 경우(부품 없이 단독 설치).
        //   정본 buildCheckbox 와 **같은 토큰 + 같은 체크 표시**로 그린다. 체크 아이콘을 빼면
        //   "체크 안 보이는 파란 사각형"이 되어 체크박스 유형이 유형 구실을 못 한다.
        console.warn(`[Dropdown List] Checkbox 컴포넌트를 찾지 못해 임시 도형으로 그립니다 (State=${st.chk}) — Checkbox 를 먼저 설치하면 인스턴스로 붙습니다.`);
        const box = figma.createFrame();
        box.name = "checkbox"; box.resize(CHK_PX, CHK_PX); box.cornerRadius = 2;
        const on = st.chk === "Checked";
        // 정본 buildCheckbox 와 동일한 **3분기**(Default/Hover/Checked). 2분기로 두면 Hover 가
        //   bg/default 로 떨어져 정본과 어긋난다(🤖 component-verifier 재검증 지적 2026-08-14).
        const bgKey = on ? "color/control/bg/selected"
          : st.chk === "Hover" ? "color/control/bg/hover"
          : "color/control/bg/default";
        box.fills   = [boundPaint(scv(maps, bgKey))];
        box.strokes = [boundPaint(scv(maps, on ? "color/control/border/selected" : "color/control/border/default"))];
        box.strokeWeight = 1; box.strokeAlign = "INSIDE";
        if (on) {
          const icon = await makeCheckIcon(scv(maps, "color/control/indicator/selected"));
          box.appendChild(icon); icon.x = 1; icon.y = 1;
        }
        host.appendChild(box);
      }
    }
    // 체크 유형은 선택돼도 라벨 강조 없음(체크 표시가 선택을 표현) — 사용자 결정 2026-08-14.
    const labelKey = ty.checkbox && st.label === "option/label/selected" ? "option/label/default" : st.label;
    // 옵션 글자 — 행 폭을 채우고 넘치면 말줄임(…). river 결정 2026-09-07:
    //   "폭을 넘는 옵션 글자는 말줄임 표시하고, 마우스를 올리면 전체를 보여준다"(마우스 올림은 웹 전용).
    //   layoutGrow=1 로 폭을 레이아웃에 맡기지 않으면 텍스트가 hug 라 행 밖으로 삐져나간다.
    //   웹 배포본의 text-overflow:ellipsis 와 같은 결과를 캔버스에서도 보이게 하는 설정이다.
    const label = await makeBoundText(ty.text, sz.font, "Regular", scv(maps, dd(labelKey)));
    label.layoutGrow = 1;
    label.textAutoResize = "HEIGHT";
    label.textTruncation = "ENDING";
    label.maxLines = 1;
    host.appendChild(label);
  };

  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; rowIdx: number; colIdx: number }[] = [];
  for (const sz of sizes) {
    for (let ri = 0; ri < types.length; ri++) {
      const ty = types[ri];
      for (let col = 0; col < states.length; col++) {
        const st = states[col];
        const comp = figma.createComponent();
        comp.name = `Size=${sz.size}, Type=${ty.name}, State=${st.name}`;
        if (ty.divider) {
          // [내용 행 + 1px 구분선] 세로 스택. 총높이는 다른 줄과 같게 유지(내용 = h-1).
          comp.layoutMode = "VERTICAL"; comp.itemSpacing = 0;
          comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
          comp.paddingLeft = 0; comp.paddingRight = 0; comp.paddingTop = 0; comp.paddingBottom = 0;
          comp.fills = [];
          comp.resize(DD_MIN_W, sz.h);
          const row = figma.createFrame();
          row.name = "option";
          await fillRow(row, sz, ty, st, sz.h - 1);
          comp.appendChild(row);
          try { (row as any).layoutAlign = "STRETCH"; } catch (e) { /* mock */ }
          const div = figma.createRectangle();
          div.name = "divider";
          div.resize(DD_MIN_W, 1);
          div.fills = [boundPaint(scv(maps, "color/dropdown/list/border"))]; // 패널 테두리색 재사용(새 토큰 0)
          comp.appendChild(div);
          try { (div as any).layoutAlign = "STRETCH"; } catch (e) { /* mock */ }
        } else {
          await fillRow(comp, sz, ty, st, sz.h);
        }
        comps.push(comp);
        cells.push({ comp, size: sz.size, rowIdx: ri, colIdx: col });
        BUILT_COMPS[`DropdownList:${sz.size}:${ty.name}:${st.name}`] = comp;
        if (ty.name === "Text") {
          BUILT_COMPS[`DropdownList:${sz.size}:${st.name}`] = comp;                    // 기존 키(=Text) 유지
          if (sz.size === "MD") BUILT_COMPS[`DropdownList:${st.name}`] = comp;         // 레거시 키 (MD=기본)
        }
      }
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Dropdown List";
  set.x = 0; set.y = originY;
  setLightMode(set, maps); // ← 세트에만 (컴포넌트 단위 설정 시 인스턴스가 다크모드 상속 불가)
  BUILT_SETS["Dropdown List"] = set;
  const opts: GroupedSpecOpts = {
    title: "Dropdown List",
    platforms: [{ name: "PC", sizes: sizes.map((s) => s.size) }],
    rowLabels: types.map((t) => t.name),
    colHeaders: states.map((s) => s.name),
    cellAt: (_p, size, ri, ci) => cells.find((x) => x.size === size && x.rowIdx === ri && x.colIdx === ci)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 160, cellH: 60, rowLabelW: 96,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Dropdown (드롭다운 패널 컴포넌트 세트 — Dropdown List 인스턴스 4행 조합) ─────────
// Select Box Open 상태와 Time Picker Focus 상태에서 인스턴스로 참조한다.
// #11: 3사이즈(XXSM/XSM/MD). 각 사이즈별로 DropdownList 인스턴스 4행 조합(2026-06-19).
//
// 2026-08-14 사용자 결정 — Type 축 추가(3개 → 6개):
//   Type=Text     기존 단일 선택 패널(옵션 4행).
//   Type=Checkbox 다중 선택 패널. **최상단 "전체 선택" 줄을 기본 포함**한다(사용자 결정:
//                 "불필요한 경우엔 작업자가 논의하에 빼면 된다" → 있는/없는 두 벌로 갈래를 늘리지 않고
//                 기본형 하나만 두고, 필요 없으면 인스턴스에서 맨 윗줄을 지운다).
// 패널이 들고 있는 것(배경·테두리·모서리·그림자·안쪽여백)은 손으로 다시 그리면 매번 어긋나므로
// 완제품 패널을 유지한다 — 특히 그림자는 다크값 미확정이라 변수 바인딩 없이 고정돼 있다.
async function buildDropdown(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const dd = (k: string) => `color/dropdown/${k}`;
  const sizes = [
    { size: "XXSM", h: 28 },
    { size: "XSM",  h: 34 },
    { size: "MD",   h: 44 },
  ];
  // 각 패널이 담는 4행 = [옵션줄 Type, State]. 상태를 한눈에 보여주는 기존 관례(Default·Hover·Selected·Default) 유지.
  const panelTypes = [
    { name: "Text",     rows: [["Text", "Default"], ["Text", "Hover"], ["Text", "Selected"], ["Text", "Default"]] },
    { name: "Checkbox", rows: [["Checkbox+All", "Default"], ["Checkbox", "Selected"], ["Checkbox", "Default"], ["Checkbox", "Hover"]] },
  ];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; typeIdx: number }[] = [];
  // 슬롯에 끼울 수 있는 컴포넌트 추천값 — Figma 에서 옵션을 추가할 때 Dropdown List 세트가 먼저 뜬다.
  const ddlSet = await getBuiltSet("Dropdown List");

  for (const sz of sizes) {
  for (let ti = 0; ti < panelTypes.length; ti++) {
    const pt = panelTypes[ti];
    const comp = figma.createComponent();
    comp.name = `Size=${sz.size}, Type=${pt.name}, State=Default`;
    comp.layoutMode = "VERTICAL";
    comp.primaryAxisSizingMode = "AUTO";
    comp.counterAxisSizingMode = "FIXED";
    comp.paddingTop = 4; comp.paddingBottom = 4; comp.itemSpacing = 0; comp.cornerRadius = 4;
    comp.clipsContent = false;
    comp.fills = [boundPaint(scv(maps, "color/dropdown/list/bg"))];
    comp.strokes = [boundPaint(scv(maps, "color/dropdown/list/border"))];
    comp.strokeWeight = 1; comp.strokeAlign = "OUTSIDE";
    // 그림자 = shadow/dropdown. 다크값 미확정이라 변수 바인딩 없이 라이트 값 고정(잘못된 값 고착 방지).
    // 파서·토큰 오류는 try 밖에서 던지게 둔다(그림자가 조용히 사라지는 것 방지). try 는 대입만 감싼다.
    const ddEffects = shadowEffects("shadow/dropdown");
    try { (comp as any).effects = ddEffects; } catch (e) { /* 환경 미지원 */ }
    comp.resize(DD_MIN_W, 4 * sz.h + 8);

    const optionRows: SceneNode[] = [];
    // 4행 — Text: Default·Hover·Selected·Default / Checkbox: 전체선택·Selected·Default·Hover
    for (const [rowType, stateName] of pt.rows) {
      // BUILT_COMPS → 캔버스(재설치로 Dropdown List 가 skip 된 경우) 순으로 찾는다.
      let ddComp = await reuseVariant(
        "Dropdown List", `DropdownList:${sz.size}:${rowType}:${stateName}`,
        [`Size=${sz.size}`, `Type=${rowType}`, `State=${stateName}`]);
      if (!ddComp && rowType === "Text") {
        // Type 축이 없던 옛 캔버스(이름에 Type= 없음) 하위호환.
        ddComp = BUILT_COMPS[`DropdownList:${sz.size}:${stateName}`]
          ?? BUILT_COMPS[`DropdownList:${stateName}`]
          ?? await reuseVariant("Dropdown List", `DropdownList:${sz.size}:${stateName}`, [`Size=${sz.size}`, `State=${stateName}`])
          ?? undefined;
      }
      if (!ddComp && rowType !== "Text") {
        // 체크박스 줄은 흉내내지 않는다 — 글자 줄로 바꿔 그리면 이름만 Type=Checkbox 인
        //   "체크박스 0개 · 전체선택 라벨 없음 · 구분선 없음" 껍데기가 조용히 만들어진다
        //   (🤖 component-verifier 실측 2026-08-14). 줄을 비워 눈에 보이게 실패시킨다.
        console.warn(`[Dropdown] 옵션 줄 ${rowType}/${stateName} (${sz.size}) 을 찾지 못해 건너뜁니다 — Dropdown List 를 함께 설치하세요.`);
        continue;
      }
      if (ddComp) {
        const inst = ddComp.createInstance();
        inst.name = "ddl-row";
        optionRows.push(inst);
      } else {
        // Fallback — 글자 줄만 그린다(여기까지 오면 rowType 은 항상 Text: 위에서 체크박스 줄은 continue).
        const sn = stateName.toLowerCase();
        const row = figma.createFrame();
        row.name = "ddl-row";
        row.layoutMode = "HORIZONTAL"; row.counterAxisAlignItems = "CENTER";
        row.primaryAxisSizingMode = "FIXED"; row.counterAxisSizingMode = "FIXED";
        row.resize(DD_MIN_W, sz.h); row.paddingLeft = 12; row.paddingRight = 12;
        row.paddingTop = 0; row.paddingBottom = 0;
        row.fills = [boundPaint(scv(maps, dd(`option/bg/${sn}`)))];
        row.appendChild(await makeBoundText("옵션", sz.h <= 28 ? 12 : 14, "Regular", scv(maps, dd(`option/label/${sn}`))));
        optionRows.push(row);
      }
    }
    // 옵션 줄이 쌓이는 **패널 안쪽 전체**가 Figma 슬롯("Options") — 옵션 개수를 늘리고 줄일 수 있게 한다. (river 지시 2026-09-03)
    //   옵션 한 줄을 슬롯으로 만드는 것이 아니다. 기본 내용은 기존과 같은 4줄이다.
    //   패널의 세로 스택 설정(VERTICAL · itemSpacing 0)을 슬롯이 그대로 이어받고, 슬롯과 각 줄을
    //   STRETCH 로 늘려 종전처럼 줄이 패널 폭을 꽉 채우게 한다(패널 padding 4/4 는 comp 에 그대로 남는다).
    await makeSlot(comp, "Options",
      "옵션 줄이 놓이는 자리. 기본은 4줄이며, Dropdown List 인스턴스를 넣고 빼서 옵션 수를 늘리고 줄인다. 줄 수를 바꾸면 패널 높이는 자동으로 따라간다.",
      optionRows, ddlSet ? [{ type: "COMPONENT_SET", key: ddlSet.key }] : [],
      { layoutMode: "VERTICAL", primaryAxisSizingMode: "AUTO", counterAxisSizingMode: "FIXED",
        primaryAxisAlignItems: "MIN", counterAxisAlignItems: "MIN", itemSpacing: 0,
        stretch: true, stretchContents: true });
    comps.push(comp);
    cells.push({ comp, size: sz.size, typeIdx: ti });
    // 기존 키(=Text 패널)를 그대로 유지 — Select Box Open·Filter Chip Selected 가 이 키로 붙는다.
    if (pt.name === "Text") BUILT_COMPS[`Dropdown:${sz.size}:Default`] = comp;
    else                    BUILT_COMPS[`Dropdown:${sz.size}:${pt.name}`] = comp;
  }
  }
  // 레거시 키 → MD (Select Box 폴백 경로 유지)
  BUILT_COMPS["Dropdown:Default"] = BUILT_COMPS["Dropdown:MD:Default"];

  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Dropdown";
  set.x = 0; set.y = originY;
  setLightMode(set, maps); // ← 세트에만 (컴포넌트 단위 설정 시 인스턴스가 다크모드 상속 불가)
  BUILT_SETS["Dropdown"] = set;

  const opts: SpecOpts = {
    title: "Dropdown",
    colHeaders: panelTypes.map((t) => t.name),
    rowLabels: sizes.map((s) => s.size),
    cellAt: (r, c) => cells.find((x) => x.size === sizes[r]?.size && x.typeIdx === c)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 200, cellH: 220,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Line Tab (텍스트 + 밑줄 인디케이터) — color/navigation/* · Break 있음 → 그룹형 ──
async function buildLineTab(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const nav = (k: string) => `color/navigation/${k}`;
  const states = [
    { name: "Unselected", label: "label/default",  ind: "indicator/default" },
    { name: "Hover",      label: "label/hover",     ind: "indicator/hover" },
    { name: "Selected",   label: "label/selected",  ind: "indicator/selected" },
  ];
  // V2.4 원본 실측(540:6032): pc-md 44h/font20 · pc-sm 42h/font16 · mobile 32h/font16.
  // MD 라벨은 레거시 20 이 너무 커서 18 로 줄인다(river 결정 2026-09-02). 정본 텍스트 스타일에 20 Medium 이
  //   없어 textStyleKey 가 이미 18M 으로 치환해 왔으므로 Figma 결과물(18px)은 그대로이고 표기만 실제와 맞춘다.
  // PC XSM 은 river 승인 신규 기준(2026-08-11): 40h/body 14M · SM 과 같은 좌우 padding 16. (높이=인디케이터 포함 총 심볼 높이)
  const sizes = [
    { size: "SM", brk: "PC",     h: 42, font: 16 },
    { size: "MD", brk: "PC",     h: 44, font: 18 },
    { size: "XSM", brk: "PC",    h: 40, font: 14 },
    { size: "SM", brk: "Mobile", h: 32, font: 16 },
  ];
  const MIN_W = 76; // 최소 폭(짧은 라벨도 보기 좋게). 긴 라벨은 텍스트 폭만큼 hug.
  const PAD_X = 16; // 좌우 패딩(라벨이 셀 가장자리에 붙지 않게)
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; brk: string; state: string }[] = [];
  for (const sc of sizes) {
    for (const st of states) {
      // 셀 = 세로 오토레이아웃(라벨 + 밑줄 인디케이터). 폭은 텍스트를 hug(최소 MIN_W) → 긴 라벨도 안 잘림(#3).
      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, State=${st.name}, Break=${sc.brk}`;
      comp.layoutMode = "VERTICAL";
      comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "AUTO"; // 높이 FIXED(sc.h), 폭 HUG
      comp.primaryAxisAlignItems = "SPACE_BETWEEN"; comp.counterAxisAlignItems = "CENTER";
      // 좌우 패딩=0 (셀 자체엔 패딩 없음) — 밑줄 인디케이터가 셀 폭 전체를 채워야 Set에서 탭을 붙였을 때 하단선이 연속됨.
      //   (패딩을 셀에 주면 STRETCH 인디케이터가 패딩만큼 안쪽으로 밀려 탭마다 끊김. Figma A/B 렌더 검증 2026-06-26.)
      //   라벨 여백은 labelWrap 에 줘서 텍스트만 안쪽으로 들어가게 한다.
      comp.itemSpacing = 0; comp.paddingLeft = 0; comp.paddingRight = 0;
      comp.paddingTop = 0; comp.paddingBottom = 0;
      comp.fills = [];
      comp.clipsContent = false;
      comp.minWidth = MIN_W;
      // 인디케이터 두께: Hover·Selected = 2px(강조), Unselected = 1px(기본선). (사용자 결정 2026-06-25, 원본 540:6032 참고)
      const indH = st.name === "Unselected" ? 1 : 2;
      // 라벨 — 텍스트 폭만큼 hug(autoResize WIDTH_AND_HEIGHT 기본), 세로 가운데(레이아웃 grow 로 인디케이터 위 공간 차지)
      const t = await makeBoundText("메뉴", sc.font, "Medium", scv(maps, nav(st.label)));
      try { (t as TextNode).textAutoResize = "WIDTH_AND_HEIGHT"; } catch (e) { /* */ }
      const labelWrap = figma.createFrame();
      labelWrap.name = "label"; labelWrap.fills = [];
      labelWrap.layoutMode = "HORIZONTAL"; labelWrap.primaryAxisSizingMode = "AUTO"; labelWrap.counterAxisSizingMode = "AUTO";
      labelWrap.primaryAxisAlignItems = "CENTER"; labelWrap.counterAxisAlignItems = "CENTER";
      labelWrap.paddingLeft = PAD_X; labelWrap.paddingRight = PAD_X; // 라벨 여백(셀 아닌 라벨에) — 인디케이터는 셀 폭 전체 유지
      labelWrap.appendChild(t);
      comp.appendChild(labelWrap);
      try { (labelWrap as FrameNode).layoutGrow = 1; (labelWrap as FrameNode).layoutAlign = "STRETCH"; } catch (e) { /* */ }
      // 밑줄 인디케이터 — 셀 폭 전체로 stretch
      const ind = figma.createRectangle();
      ind.resize(MIN_W, indH);
      ind.fills = [boundPaint(scv(maps, nav(st.ind)))];
      comp.appendChild(ind);
      try { (ind as RectangleNode).layoutAlign = "STRETCH"; } catch (e) { /* */ }
      try { comp.resize(MIN_W, sc.h); } catch (e) { /* */ }
      comps.push(comp);
      cells.push({ comp, size: sc.size, brk: sc.brk, state: st.name });
    }
  }
  // Line Tab Set에서 인스턴스로 참조하기 위해 BUILT_COMPS 등록
  cells.forEach((c) => { BUILT_COMPS[`LineTab:${c.brk}-${c.size}-${c.state}`] = c.comp; });
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Line Tab";
  set.x = 0; set.y = originY;
  const opts: GroupedSpecOpts = {
    title: "Line Tab",
    platforms: [{ name: "PC", sizes: ["SM", "MD", "XSM"] }, { name: "Mobile", sizes: ["SM"] }],
    rowLabels: [""],
    colHeaders: states.map((s) => s.name),
    cellAt: (platName, size, _ri, ci) =>
      cells.find((x) => x.size === size && x.brk === platName && x.state === states[ci].name)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 110, cellH: 56, rowLabelW: 16,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Line Tab Set — Line Tab 셀 3개를 가로로 묶은 사용 예시(첫 탭 Selected) ──────────
// 정본: 라인탭이 실제로 쓰이는 모습(탭 3개 나란히, 하나 활성). 셀은 buildLineTab 의 Line Tab 셀 인스턴스 재활용.
//   Size 변형 = PC(md)·PC(sm)·PC(xsm)·Mobile. 각 변형에서 첫 탭 Selected, 나머지 Unselected. 라벨은 인스턴스 텍스트 override.
async function buildLineTabSet(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const TAB_LABELS = ["탭 메뉴 1", "탭 메뉴 2", "탭 메뉴 3"];
  // Size 변형 → 사용할 Line Tab 셀 키(brk-size) 매핑. Break(PC/Mobile)별로 그룹형 스펙에 나눠 배치한다.
  const sizeDefs = [
    { name: "MD", brk: "PC",     size: "MD" },
    { name: "SM", brk: "PC",     size: "SM" },
    { name: "XSM", brk: "PC",    size: "XSM" },
    { name: "SM", brk: "Mobile", size: "SM" },
  ];
  // Line Tab 셀(먼저 빌드됨) — 없으면 세트에서 탐색(부분 재설치 폴백).
  const pickCell = async (brk: string, size: string, state: string): Promise<ComponentNode | undefined> => {
    let c: ComponentNode | undefined = BUILT_COMPS[`LineTab:${brk}-${size}-${state}`];
    if (!c) {
      const s = await getBuiltSet("Line Tab");
      if (s) c = ((s.children as ComponentNode[]) || []).find((x) => x.type === "COMPONENT"
        && x.name.includes(`Size=${size}`) && x.name.includes(`Break=${brk}`) && x.name.includes(`State=${state}`));
    }
    return c;
  };

  // 슬롯에 끼울 수 있는 컴포넌트 추천값 — Figma 에서 탭을 추가할 때 Line Tab 세트가 먼저 뜬다.
  const lineTabSet = await getBuiltSet("Line Tab");

  const comps: ComponentNode[] = [];
  const cellByKey = new Map<string, ComponentNode>();
  for (const sd of sizeDefs) {
    const comp = figma.createComponent();
    comp.name = `Size=${sd.size}, Break=${sd.brk}`;
    comp.layoutMode = "HORIZONTAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO";
    comp.counterAxisAlignItems = "MIN"; comp.itemSpacing = 0; comp.fills = [];
    comp.clipsContent = false;
    // 원본 V2.4 6947:4621: 탭들이 간격0으로 딱 붙어 하단 회색선이 연속, 선택 탭만 파란 2px.
    //   모든 탭 동일 폭 = 가장 긴 라벨 기준 → 먼저 hug 로 만들어 자연폭을 측정해 max 를 구한 뒤,
    //   각 인스턴스를 그 폭으로 FIXED. 셀 내부 label/indicator 가 STRETCH 라 라벨은 가운데·밑줄은 셀 폭 전체.
    const tabInsts: InstanceNode[] = [];
    for (let i = 0; i < TAB_LABELS.length; i++) {
      const state = i === 0 ? "Selected" : "Unselected"; // 첫 탭만 활성(State Scenarios 관례 = 첫 항목)
      const cell = await pickCell(sd.brk, sd.size, state);
      if (cell) {
        const inst = cell.createInstance();
        inst.name = `tab-${i + 1}`;
        // 인스턴스 라벨 override (셀 내부 TEXT). 색·스타일은 셀(Variable 바인딩) 그대로 유지.
        const txt = inst.findOne((n) => n.type === "TEXT") as TextNode | null;
        if (txt) { try { txt.characters = TAB_LABELS[i]; } catch (e) { /* */ } }
        tabInsts.push(inst);
      }
    }
    // 탭이 놓이는 **줄 전체**가 Figma 슬롯("Tabs") — 탭 개수를 늘리고 줄일 수 있게 한다. (river 지시 2026-09-03)
    //   탭 한 칸을 슬롯으로 만드는 것이 아니다. 기본 내용은 기존과 같은 탭 3개(첫 칸 Selected)다.
    //   슬롯은 comp 직계 자식이며 auto-layout 설정(itemSpacing 0 · counterAxis MIN)을 comp 에서 그대로 가져와,
    //   하단 회색선이 끊기지 않고 이어지는 원본 V2.4 6947:4621 모양을 유지한다.
    await makeSlot(comp, "Tabs",
      "탭이 놓이는 자리. 기본은 탭 3개이며, Line Tab 인스턴스를 넣고 빼서 탭 수를 늘리고 줄인다. 새로 넣은 탭은 폭을 기존 탭과 같게 맞춘다.",
      tabInsts, lineTabSet ? [{ type: "COMPONENT_SET", key: lineTabSet.key }] : [],
      { counterAxisAlignItems: "MIN", itemSpacing: 0 });
    // 동일 폭 적용 — 각 인스턴스의 hug 자연폭 중 최댓값으로 전부 FIXED (가장 긴 라벨 기준).
    if (tabInsts.length) {
      const maxW = Math.max(...tabInsts.map((n) => { try { return n.width; } catch (e) { return 0; } }));
      for (const inst of tabInsts) {
        try { inst.layoutSizingHorizontal = "FIXED"; } catch (e) { /* */ }
        try { inst.resize(maxW, inst.height); } catch (e) { /* */ }
      }
    }
    setLightMode(comp, maps);
    comps.push(comp);
    cellByKey.set(`${sd.brk}/${sd.size}`, comp);
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Line Tab Set";
  set.x = 0; set.y = originY;
  BUILT_SETS["Line Tab Set"] = set;
  // Break(PC/Mobile)별 그룹형 스펙(buildLineTab 셀 세트와 동일 형식) — 평면 스펙은 PC/Mobile 혼재로 audit 위반.
  const opts: GroupedSpecOpts = {
    title: "Line Tab Set",
    platforms: [{ name: "PC", sizes: ["MD", "SM", "XSM"] }, { name: "Mobile", sizes: ["SM"] }],
    rowLabels: [""],
    colHeaders: [""],
    cellAt: (platName, size, _ri, _ci) => cellByKey.get(`${platName}/${size}`) ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 360, cellH: 56, rowLabelW: 16,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}


// ── Table Cell — color/table/*(bg·border) + color/text/body/*(텍스트) ─────────
async function buildTableCell(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const variants = [
    { type: "Cell",   state: "Default",  bg: "color/table/cell/default",  border: "color/table/border/default",  text: "color/text/body/primary",   head: "Cell · Default" },
    { type: "Cell",   state: "Hover",    bg: "color/table/cell/hover",    border: "color/table/border/default",  text: "color/text/body/primary",   head: "Cell · Hover" },
    { type: "Cell",   state: "Selected", bg: "color/table/cell/selected", border: "color/table/border/default",  text: "color/text/body/primary",   head: "Cell · Selected" },
    { type: "Header", state: "Default",  bg: "color/table/header/bg",      border: "color/table/border/default", text: "color/text/body/secondary", head: "Header" },
  ];
  // 크기 사다리 — river 결정 2026-09-02:
  //   · SM 글자는 13 이 아니라 14 다. 정본 텍스트 스타일에 13 이 없어 textStyleKey 가 계속 14 로 치환해 왔고,
  //     Figma 결과물은 처음부터 body/14 였다. 코드의 13 표기만 오해를 부르던 죽은 값이라 정정.
  //   · XSM(34/12) 신설 — 표는 데이터가 빽빽해 34 행에서 글자를 12 로 줄인다.
  //     다른 컴포넌트의 XSM(34/14)과 다른 표 전용 기준(river 승인 2026-09-02).
  const sizes = [
    { size: "XSM", h: 34, font: 12 },
    { size: "SM", h: 38, font: 14 },
    { size: "MD", h: 44, font: 14 },
  ];
  // 열 정렬 축 — river 결정 2026-09-02(D3/HD-3 B). 웹 배포본의 `data-align="center"` 와 1:1.
  //   기본(Left)은 종전 그대로 글자 좌측 16px. Center 는 좌우 패딩 16 을 유지한 채 글자만 가운데로,
  //   텍스트 박스를 셀폭-32 로 고정+STRETCH 해서 Table 이 컬럼 폭(360/200/110)으로 resize 해도 가운데를 지킨다.
  const aligns = [
    { key: "Left",   label: "왼쪽",   center: false },
    { key: "Center", label: "가운데", center: true  },
  ];
  const PAD = 16;
  const W = 130;
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; row: number; col: number }[] = [];
  for (let row = 0; row < sizes.length * aligns.length; row++) {
    const sc = sizes[Math.floor(row / aligns.length)];
    const al = aligns[row % aligns.length];
    for (let col = 0; col < variants.length; col++) {
      const v = variants[col];
      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, Type=${v.type}, Variant=${v.state}, Align=${al.key}`;
      comp.resize(W, sc.h);
      comp.fills = [boundPaint(scv(maps, v.bg))];
      // 헤더 글자는 Medium — 웹 정본 `.s1-table-th { font-weight:500 }`(components.html) 과 정합.
      //   종전엔 항상 Regular 였는데, Table 이 셀을 재사용하지 않고 자체 fallback(Header=Medium)으로
      //   그리던 시절이라 이 어긋남이 표에 드러나지 않았다(2026-08-02 🤖 검증에서 적발).
      const t = await makeBoundText("1층 정문", sc.font, v.type === "Header" ? "Medium" : "Regular", scv(maps, v.text));
      comp.appendChild(t);
      t.x = PAD; t.y = (sc.h - 1 - t.height) / 2;
      if (al.center) {
        // 정렬 자체는 try 밖에 둔다 — 아래 폭 고정이 실패해도 가운데 정렬이 조용히 왼쪽으로
        //   되돌아가지 않게 한다(🤖 검증 지적 2026-09-02).
        t.textAlignHorizontal = "CENTER";
        t.constraints = { horizontal: "STRETCH", vertical: "MIN" };
        try {
          // 텍스트 상자를 셀폭-32 로 고정해야 STRETCH 가 컬럼 폭 변화를 따라간다.
          t.textAutoResize = "HEIGHT";
          t.resize(W - PAD * 2, t.height);
        } catch (_) { /* mock 환경 no-op */ }
        t.y = (sc.h - 1 - t.height) / 2;
      }
      const border = figma.createRectangle();
      border.resize(W, 1);
      border.fills = [boundPaint(scv(maps, v.border))];
      comp.appendChild(border);
      border.x = 0; border.y = sc.h - 1;
      // 하단 구분선은 셀 폭을 따라 늘어나야 한다 — Table 이 이 셀을 컬럼 폭(360/200/110)으로
      //   resize 해 쓰므로, 기본 constraints(MIN/MIN)면 선이 컴포넌트 원폭 130px 에 머물러
      //   행 구분선이 중간에 끊긴다. Line Tab 인디케이터가 STRETCH 로 푼 것과 같은 문제·같은 해법
      //   (build-components.ts 의 Line Tab 주석 참조). 2026-08-02 🤖 검증에서 적발.
      border.constraints = { horizontal: "STRETCH", vertical: "MAX" };
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, row, col });
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Table Cell";
  set.x = 0; set.y = originY;
  // Table 에서 인스턴스 재사용 — BUILT_COMPS 등록 (Table.makeTableRow 가 이 키로 조회)
  for (const { comp, row, col } of cells) {
    const size  = sizes[Math.floor(row / aligns.length)].size;  // "XSM" | "SM" | "MD"
    const align = aligns[row % aligns.length].key;              // "Left" | "Center"
    const v     = variants[col];                                // { type, state, … }
    BUILT_COMPS[`TableCell:${size}:${v.type}:${v.state}:${align}`] = comp;
  }
  BUILT_SETS["Table Cell"] = set;
  const opts: SpecOpts = {
    title: "Table Cell",
    colHeaders: variants.map((v) => v.head),
    rowLabels: ([] as string[]).concat(...sizes.map((sz) => aligns.map((a) => `${sz.size} · ${a.label}`))),
    cellAt: (r, c) => cells.find((x) => x.row === r && x.col === c)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 152, cellH: 60, rowLabelW: 80,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Table (full composite) — Figma V3.0 TEST 169:76 기준 ─────────────────────────
// 헤더+8바디+푸터(페이지네이션+셀렉박스) 전체 테이블을 MD/SM 2 variants 로 표현.
// 컬럼폭: 48(체크)+360(메인)+200+110+110 = 828px
async function buildTable(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const COL = [48, 360, 200, 110, 110];
  const W = 828;
  const FOOTER_H = 44;

  // sizeKey: "MD" | "SM" — BUILT_COMPS["TableCell:SIZE:TYPE:STATE:ALIGN"] 조회키 (Table 과 동일 어휘).
  //   Table 합성본은 정본 기본값인 왼쪽 정렬(Align=Left)만 쓴다 — 가운데 정렬은 셀 단위 선택 옵션이다.
  async function makeTableRow(h: number, sizeKey: string, isHeader: boolean, state: string, ri: number): Promise<FrameNode> {
    const row = figma.createFrame();
    row.name = isHeader ? "header" : `row-${ri + 1}`;
    row.resize(W, h);
    row.fills = [];  // 배경은 각 셀 인스턴스가 담당

    const colTexts = isHeader
      ? ["항목명", "항목명 (정렬)", "수량", "관리"]
      : state === "Hover"     ? ["Hover 행",    "카테고리 A", "56", "검토중"]
      : state === "Selected"  ? ["Selected 행", "카테고리 B", "33", "완료"]
      : [`항목 ${ri + 1}`, "카테고리 C", `${(ri + 1) * 10}`, "활성"];
    const cellType  = isHeader ? "Header" : "Cell";
    const cellState = isHeader ? "Default" : state;  // Header 는 항상 Default 변형

    // ── COL[0] 체크박스 컬럼 (48px) — Table Cell 미사용(텍스트 없는 전용 컬럼) ──
    const chkBg = isHeader ? "color/table/header/bg"
      : state === "Hover"    ? "color/table/cell/hover"
      : state === "Selected" ? "color/table/cell/selected"
      : "color/table/cell/default";
    const chkFrame = figma.createFrame();
    chkFrame.name = "col-check"; chkFrame.resize(COL[0], h);
    chkFrame.fills = [boundPaint(scv(maps, chkBg))];
    const chkState = isHeader ? "Default" : state === "Selected" ? "Checked" : state === "Hover" ? "Hover" : "Default";
    const chkComp = BUILT_COMPS[`Checkbox:${chkState}`];
    if (chkComp) {
      const ci = chkComp.createInstance();
      chkFrame.appendChild(ci);
      ci.x = (COL[0] - ci.width) / 2; ci.y = (h - ci.height) / 2;
    }
    const chkBdr = figma.createRectangle(); chkBdr.resize(COL[0], 1);
    chkBdr.fills = [boundPaint(scv(maps, "color/table/border/default"))];  // 헤더 언더라인=셀선과 동일 light(레거시 일치, 2026-06-30)
    chkFrame.appendChild(chkBdr); chkBdr.x = 0; chkBdr.y = h - 1;
    row.appendChild(chkFrame); chkFrame.x = 0; chkFrame.y = 0;

    // ── COL[1..4] 텍스트 컬럼 — Table Cell 인스턴스 재사용 ──────────────────
    const font = sizeKey === "XSM" ? 12 : 14;  // fallback 전용 (SM·MD 는 14, XSM 만 12)
    let xOff = COL[0];
    for (let k = 0; k < 4; k++) {
      const colW   = COL[k + 1];
      const cellComp = BUILT_COMPS[`TableCell:${sizeKey}:${cellType}:${cellState}:Left`];
      if (cellComp) {
        const cellInst = cellComp.createInstance();
        cellInst.resize(colW, h);
        // 텍스트 오버라이드 — 기본 "1층 정문" → 컬럼별 실제 레이블
        try {
          const tn = cellInst.findOne((n: SceneNode) => n.type === "TEXT") as TextNode | null;
          if (tn) { await figma.loadFontAsync(tn.fontName as FontName); tn.characters = colTexts[k]; }
        } catch (_) { /* mock 환경 no-op */ }
        row.appendChild(cellInst);
        (cellInst as any).x = xOff; (cellInst as any).y = 0;
      } else {
        // Fallback: Table Cell 미등록 시 plain frame(Table Cell 단독 선택 실행 등)
        const cf = figma.createFrame(); cf.name = `col-${k + 1}`; cf.resize(colW, h);
        const bgKey = isHeader ? "color/table/header/bg"
          : state === "Hover"    ? "color/table/cell/hover"
          : state === "Selected" ? "color/table/cell/selected"
          : "color/table/cell/default";
        cf.fills = [boundPaint(scv(maps, bgKey))];
        const textKey = isHeader ? "color/text/body/secondary" : "color/text/body/primary";
        const t = await makeBoundText(colTexts[k], font, isHeader ? "Medium" : "Regular", scv(maps, textKey));
        cf.appendChild(t); t.x = 16; t.y = Math.max(0, (h - t.height) / 2);
        const bdr = figma.createRectangle(); bdr.resize(colW, 1);
        bdr.fills = [boundPaint(scv(maps, "color/table/border/default"))];  // 헤더 언더라인=셀선과 동일 light(레거시 일치, 2026-06-30)
        cf.appendChild(bdr); bdr.x = 0; bdr.y = h - 1;
        row.appendChild(cf); (cf as any).x = xOff; (cf as any).y = 0;
      }
      xOff += colW;
    }
    return row;
  }

  async function makeTableFooter(): Promise<FrameNode> {
    const footer = figma.createFrame();
    footer.name = "table-footer"; footer.resize(W, FOOTER_H);
    footer.fills = [boundPaint(scv(maps, "color/table/cell/default"))];
    // 상단 구분선은 테이블 레벨 edge-bottom(emphasis 1px)이 이 경계(마지막 행 하단=페이지네이션 위)에 그려지므로 footer 내부엔 두지 않는다.

    // ── 페이지네이션: 완성 Pagination 바(세트) 인스턴스 재사용 ──
    //   직접 셀 조립 대신 buildPaginationBar 산출 "Pagination:Bar/Middle"(중간 상태 = 전체 활성) 인스턴스 1개.
    //   (BUILD_DEPENDENCIES 가 없어도 Pagination 카테고리가 Table 카테고리보다 먼저라 선빌드 보장.)
    let barComp: ComponentNode | undefined = BUILT_COMPS["Pagination:Bar/Middle"];
    if (!barComp) {
      const barSet = await getBuiltSet("Pagination");
      if (barSet) barComp = (barSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes("State=Middle"))
        ?? (barSet.children as ComponentNode[]).find(c => c.type === "COMPONENT");
    }
    if (barComp) {
      const barInst = barComp.createInstance();
      barInst.name = "pagination";
      footer.appendChild(barInst);
      // 푸터 중앙 배치(기존 시각 위치 유지) — 우측 SelectBox 와 겹치지 않게 중앙 정렬.
      (barInst as any).x = Math.round((W - barInst.width) / 2);
      (barInst as any).y = Math.round((FOOTER_H - barInst.height) / 2);
    }

    // ── 우측 SelectBox — SelectBox:XXSM:PC:Default 인스턴스 재사용 ──
    const selComp = BUILT_COMPS["SelectBox:XXSM:PC:Default"];
    if (selComp) {
      const selInst = selComp.createInstance();
      selInst.name = "select-box";
      footer.appendChild(selInst);
      (selInst as any).x = W - selInst.width - 8; (selInst as any).y = (FOOTER_H - selInst.height) / 2;
    }
    return footer;
  }

  const sizes = [
    { size: "MD", sizeKey: "MD", h: 44 },
    { size: "SM", sizeKey: "SM", h: 38 },
    { size: "XSM", sizeKey: "XSM", h: 34 },   // river 승인 2026-09-02 — 표 전용 34/12
  ];
  // 8개 바디 행: Default·Hover·Selected·Default×5
  const ROW_STATES = ["Default", "Hover", "Selected", "Default", "Default", "Default", "Default", "Default"];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string }[] = [];
  for (const sc of sizes) {
    const comp = figma.createComponent();
    comp.name = `Size=${sc.size}`; comp.resize(W, 10); comp.fills = [];
    let y = 0;
    // 헤더 행
    const header = await makeTableRow(sc.h, sc.sizeKey, true, "Header", 0);
    comp.appendChild(header); header.x = 0; header.y = y; y += sc.h;
    // 8개 바디 행
    for (let ri = 0; ri < 8; ri++) {
      const row = await makeTableRow(sc.h, sc.sizeKey, false, ROW_STATES[ri], ri);
      comp.appendChild(row); row.x = 0; row.y = y; y += sc.h;
    }
    // 푸터 (페이지네이션 + 셀렉박스)
    const footer = await makeTableFooter();
    const footerY = y;  // 마지막 데이터 행 하단 = 푸터 상단 경계 (edge-bottom 위치)
    comp.appendChild(footer); footer.x = 0; footer.y = footerY; y += FOOTER_H;
    comp.resize(W, y);
    // ── 테이블 상하단 emphasis 라인 (method 2: 셀과 분리·테이블 레벨) ──────────────
    //   상단 2px = 헤더 위(테이블 최상단). 하단 1px = 마지막 데이터 행 하단(= 페이지네이션 바로 위), 푸터/페이지네이션 아래 아님.
    //   색 = color/table/border/strong(#353535, 외곽선 일원화). 셀선(default)과 별개. z-order 최상단(맨 뒤 append).
    const edgeTop = figma.createRectangle(); edgeTop.name = "edge-top";
    edgeTop.resize(W, 2); edgeTop.fills = [boundPaint(scv(maps, "color/table/border/strong"))];
    comp.appendChild(edgeTop); edgeTop.x = 0; edgeTop.y = 0;
    const edgeBottom = figma.createRectangle(); edgeBottom.name = "edge-bottom";
    edgeBottom.resize(W, 1); edgeBottom.fills = [boundPaint(scv(maps, "color/table/border/strong"))];
    comp.appendChild(edgeBottom); edgeBottom.x = 0; edgeBottom.y = footerY - 1;
    setLightMode(comp, maps);
    comps.push(comp); cells.push({ comp, size: sc.size });
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Table"; set.x = 0; set.y = originY;
  // MD 기준 높이: header(44) + 8×44(352) + footer(44) = 440
  const cellH = sizes[0].h * 9 + FOOTER_H + 40;
  const opts: SpecOpts = {
    title: "Table",
    colHeaders: [""],
    rowLabels: sizes.map((s) => s.size),
    cellAt: (r, _c) => cells[r]?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: W + 40, cellH, rowLabelW: 64,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Filter Chip (드롭다운 칩) — color/chip/{line,solid}/* + 드롭다운 패널 ────────
// 출처: components.html Filter Chip (5 states: Default·Hover·Selected·Complete·Disabled).
//  · 4 그룹 = Variant(Line/Solid) × Title(없음/있음). Selected = 드롭다운 펼침(패널 표출).
//  · Line: bg/border/label = chip/line/*. Solid: chip/solid/*. arrow = 같은 state 의 label 색에 정합.
//  · Complete = 값 선택됨(과거순). Title 있는 Line 은 값 라벨이 selected(파랑).
// 칩을 눌러 열리는 목록의 폭은 「칩 폭과 동일, 단 칩이 100px 미만이면 100px」이다(river 확정 2026-09-07).
//   칩은 아래에서 primaryAxisSizingMode="AUTO"(내용 크기)로 만들므로 캔버스에서는 칩마다 폭이 다르다 —
//   폭 연동은 웹에서만 성립하고 정본에는 규칙만 남긴다. 사양 = registry/components/dropdown.json guide.panelWidthRule.
async function buildFilterChip(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  // 화살표: 기본=아래↓, 선택됨(open)=위↑
  const arrowDown = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#000" stroke-width="2" stroke-linecap="square"/></svg>`;
  const arrowUp   = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 15L12 9L6 15" stroke="#000" stroke-width="2" stroke-linecap="square"/></svg>`;
  const variants = ["Line", "Solid"];
  const titles = [
    { key: "Off", name: "Label only" },
    { key: "On",  name: "With title" },
  ];
  const states = ["Default", "Hover", "Selected", "Complete", "Disabled"];
  // Figma V2.4 node 540:3226 기준: PC SM h=28 · PC MD h=34 · Mobile MD h=30
  const sizes = [
    { size: "SM", brk: "PC",     h: 28, font: 14, padL: 12, padR: 6 },
    { size: "MD", brk: "PC",     h: 34, font: 14, padL: 16, padR: 8 },
    { size: "MD", brk: "Mobile", h: 30, font: 14, padL: 12, padR: 6 },
  ];

  // variant·state → chip 슬롯 suffix (bg/border/label) + open 여부
  // Hover 보더: Line=기본 테두리 유지(border/default) · Solid=스트록 삭제(fill 색 bg/hover) — 2026-07-06 Line 스트록 복구
  function chipSlot(v: string, st: string): { bg: string; bd: string; lb: string; open: boolean; bdGroup?: string } {
    if (v === "line") {
      switch (st) {
        case "Hover":    return { bg: "hover",    bd: "default",  lb: "default",  open: false };  // Line: 테두리 유지 = border/default
        case "Selected": return { bg: "selected", bd: "selected", lb: "default",  open: true };  // 펼침: 보더만 파랑
        case "Disabled": return { bg: "disabled", bd: "disabled", lb: "disabled", open: false };
        default:         return { bg: "default",  bd: "default",  lb: "default",  open: false };  // Default·Complete
      }
    }
    switch (st) {
      case "Hover":    return { bg: "hover",    bd: "hover",    bdGroup: "bg", lb: "default",  open: false };  // 보더=fill
      case "Selected": return { bg: "selected", bd: "selected", lb: "selected", open: true };
      case "Disabled": return { bg: "disabled", bd: "disabled", lb: "disabled", open: false };
      default:         return { bg: "default",  bd: "default",  lb: "default",  open: false };
    }
  }

  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; variant: string; title: string; state: string; size: string; brk: string }[] = [];
  for (const sc of sizes) {
    for (const variant of variants) {
      const v = variant.toLowerCase();
      for (const t of titles) {
        for (const st of states) {
          const ss = chipSlot(v, st);
          const dis = st === "Disabled";
          // chip 트리거 (pill)
          const chip = figma.createFrame();
          chip.name = "chip";
          chip.layoutMode = "HORIZONTAL"; chip.counterAxisAlignItems = "CENTER";
          chip.primaryAxisSizingMode = "AUTO"; chip.counterAxisSizingMode = "FIXED";
          chip.itemSpacing = 4; chip.paddingLeft = sc.padL; chip.paddingRight = sc.padR;
          bindRadius(chip, maps, "radius/full");
          chip.fills = [boundPaint(scv(maps, `color/chip/${v}/bg/${ss.bg}`))];
          chip.strokes = [boundPaint(scv(maps, `color/chip/${v}/${ss.bdGroup ?? "border"}/${ss.bd}`))];
          chip.strokeWeight = 1; chip.strokeAlign = "INSIDE";
          // Title(있음) → "정렬" 라벨(타이틀색) + 값 라벨
          if (t.key === "On") {
            chip.appendChild(await makeBoundText("정렬", sc.font, "Medium", scv(maps, `color/chip/${v}/label/${ss.lb}`)));
          }
          // 값 라벨: Complete = 과거순(선택값), 그 외 = 최신순.
          // Title 있는 Line 의 값 라벨은 selected(파랑) — disabled 제외. 그 외는 ss.lb.
          const valLbSlot = (t.key === "On" && v === "line" && !dis) ? "selected" : ss.lb;
          const valText = st === "Complete" ? "과거순" : "최신순";
          chip.appendChild(await makeBoundText(valText, sc.font, "Medium", scv(maps, `color/chip/${v}/label/${valLbSlot}`)));
          // arrow: 펼침(open)=위↑(90°), 기본=아래↓(270°). 색 = 라벨색 정합.
          const arrowSlot = ss.lb;
          // 20px 정사각 + 직각 회전 → 래퍼 프레임 불필요(Select Box 와 동일 근거). wrap:false.
          chip.appendChild(await makeIconInstance("chevron", scv(maps, `color/chip/${v}/label/${arrowSlot}`), 20, ss.open ? arrowUp : arrowDown, ss.open ? 90 : 270, { wrap: false }));
          chip.resize(chip.width, sc.h);

          // 컴포넌트(세로): chip + (Selected 면 드롭다운 패널)
          const comp = figma.createComponent();
          comp.name = `Size=${sc.size}, Break=${sc.brk}, Variant=${variant}, Title=${t.key}, State=${st}`;
          comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO"; comp.itemSpacing = 8;
      comp.fills = []; // 외곽 컨테이너는 투명 — createComponent 기본 흰색 fill 제거(미사용 FFFFFF, 2026-06-24)
          comp.appendChild(chip);
          if (ss.open) {
            // Dropdown 컴포넌트 인스턴스 재사용 (Select Box 패턴 동일, anatomy gate: "list" raw 프레임 금지)
            // Filter Chip 사이즈 → Dropdown 사이즈 매핑: SM→XXSM(h28), MD→XSM(h34)
            const chipToDd: Record<string, string> = { SM: "XXSM", MD: "XSM" };
            const ddSize = chipToDd[sc.size] ?? "MD";
            const ddKey = `Dropdown:${ddSize}:Default`;
            let ddComp: ComponentNode | undefined = BUILT_COMPS[ddKey] ?? BUILT_COMPS["Dropdown:MD:Default"] ?? BUILT_COMPS["Dropdown:Default"];
            if (!ddComp) {
              const ddSet = await getBuiltSet("Dropdown");
              if (ddSet) {
                // Type 축 신설(2026-08-14) 후 같은 Size 에 Text·Checkbox 두 벌 — Filter Chip 은 단일 선택이라 Type=Text.
                ddComp = (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes(`Size=${ddSize}`) && c.name.includes("Type=Text"))
                  ?? (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes(`Size=${ddSize}`))
                  ?? (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes("Type=Text"))
                  ?? (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT");
              }
            }
            if (ddComp) {
              const ddInst = ddComp.createInstance();
              ddInst.name = "dropdown";
              // Filter Chip 자체 드롭다운은 선택 표시=배경강조 없음(모바일 바텀시트 ds-fc-sheet-option과 동일 원칙).
              // 2026-07-08: 공용 Dropdown List의 Selected 자체가 이제 Default와 동일해져 이 스왑은 사실상 no-op이지만,
              // 스코프 명시 목적으로 유지(Time Picker Cell은 별도 컴포넌트라 영향 없음).
              const selectedRow = ddInst.children[2];
              const defaultRowComp = BUILT_COMPS[`DropdownList:${ddSize}:Default`] as ComponentNode | undefined;
              if (selectedRow && selectedRow.type === "INSTANCE" && defaultRowComp) {
                (selectedRow as InstanceNode).swapComponent(defaultRowComp);
              }
              comp.appendChild(ddInst);
              // 목록 폭 = max(하한 100, 칩 폭) — 규칙 ②③(river 2026-09-08). 칩은 hug 라 라벨 길이에 따라 달라진다.
              try { ddInst.resize(Math.max(DD_MIN_W, chip.width), ddInst.height); } catch (e) { /* mock 환경 no-op */ }
            }
          }
          setLightMode(comp, maps);
          comps.push(comp);
          cells.push({ comp, variant, title: t.key, state: st, size: sc.size, brk: sc.brk });
        }
      }
    }
  }

  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Filter Chip";
  set.x = 0; set.y = originY;
  // 그룹핑: PC·Mobile 를 외부 플랫폼으로 분리, Variant×Title 4종을 rowLabel 로, 사이즈를 내부 column 묶음으로.
  // PC 섹션 → SM / MD 하위, Mobile 섹션 → MD 하위. (사용자 2026-06-19 결정)
  const groups = [
    { name: "Line · Label only",  variant: "Line",  title: "Off" },
    { name: "Line · With title",  variant: "Line",  title: "On" },
    { name: "Solid · Label only", variant: "Solid", title: "Off" },
    { name: "Solid · With title", variant: "Solid", title: "On" },
  ];
  const opts: GroupedSpecOpts = {
    title: "Filter Chip",
    platforms: [
      { name: "PC",     sizes: ["SM", "MD"] },
      { name: "Mobile", sizes: ["MD"] },
    ],
    rowLabels: groups.map((g) => g.name),
    colHeaders: states,
    cellAt: (platName, sizeLabel, ri, ci) => {
      const g = groups[ri];
      if (!g) return null;
      const brk = platName === "Mobile" ? "Mobile" : "PC";
      return cells.find((x) => x.variant === g.variant && x.title === g.title && x.state === states[ci] && x.size === sizeLabel && x.brk === brk)?.comp ?? null;
    },
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 160, cellH: 160, rowLabelW: 120,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Time Picker (Input형 트리거 + 시계 아이콘) — color/form-control/* · Break 있음 → 그룹형 ──
// Figma: timepicker_input (540:3690). 드롭다운 base 패널은 Time Picker Dropdown(별도 컴포넌트).
async function buildTimePicker(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const fc = (k: string) => `color/form-control/${k}`;
  const CLOCK = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="#000" stroke-width="1.2"/><path d="M9 5v4l2.5 2.5" stroke="#000" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  const states = [
    { name: "Default",  bg: "bg/default",  border: "border/default",  txt: "시간 선택", tc: "text/placeholder", icon: "icon/default" },
    { name: "Hover",    bg: "bg/hover",     border: "border/default",  txt: "시간 선택", tc: "text/placeholder", icon: "icon/default" },
    { name: "Focus",    bg: "bg/default",   border: "border/selected", txt: "시간 선택", tc: "text/placeholder", icon: "icon/default" },
    { name: "Filled",   bg: "bg/default",   border: "border/default",  txt: "09:30",     tc: "text/default",     icon: "icon/default" },
    { name: "Disabled", bg: "bg/disabled",  border: "border/disabled", txt: "00:00",     tc: "text/disabled",    icon: "icon/disabled" },
  ];
  const sizes = [
    { size: "XXSM", brk: "PC",     h: 28, font: 12, padL: 10, padR: 6 },
    { size: "XSM",  brk: "PC",     h: 34, font: 14, padL: 12, padR: 8 },
    { size: "MD",   brk: "PC",     h: 44, font: 14, padL: 16, padR: 8 },
    { size: "MD",   brk: "Mobile", h: 48, font: 14, padL: 16, padR: 8 },
  ];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; brk: string; state: string }[] = [];
  for (const sc of sizes) {
    for (const st of states) {
      // 트리거(별도 프레임) — Focus 시 그 아래 드롭다운을 붙이기 위해 컴포넌트를 VERTICAL 로 둔다(Select 방식).
      const trigger = figma.createFrame();
      trigger.name = "trigger";
      trigger.layoutMode = "HORIZONTAL";
      trigger.primaryAxisAlignItems = "SPACE_BETWEEN";
      trigger.counterAxisAlignItems = "CENTER";
      trigger.primaryAxisSizingMode = "FIXED"; trigger.counterAxisSizingMode = "FIXED";
      trigger.paddingLeft = sc.padL; trigger.paddingRight = sc.padR; trigger.paddingTop = 0; trigger.paddingBottom = 0;
      trigger.itemSpacing = 8; trigger.cornerRadius = 4;
      trigger.fills = [boundPaint(scv(maps, fc(st.bg)))];
      trigger.strokes = [boundPaint(scv(maps, fc(st.border)))];
      trigger.strokeWeight = 1; trigger.strokeAlign = "INSIDE";
      trigger.appendChild(await makeBoundText(st.txt, sc.font, "Regular", scv(maps, fc(st.tc))));
      trigger.appendChild(await makeIconInstance("clock", scv(maps, fc(st.icon)), fcIconPx(sc.h, 0), CLOCK));
      trigger.resize(150, sc.h);

      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, State=${st.name}, Break=${sc.brk}`;
      comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO"; comp.itemSpacing = 4;
      comp.appendChild(trigger);
      if (st.name === "Focus") {
        // Time Picker Dropdown 인스턴스 재사용 (anatomy gate: "dropdown" raw 프레임 금지)
        const tpdComp = BUILT_COMPS["TPD:focus-default"];
        if (tpdComp) {
          const tpdInst = tpdComp.createInstance();
          tpdInst.name = "tpd";
          comp.appendChild(tpdInst);
        }
      }
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, size: sc.size, brk: sc.brk, state: st.name });
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Time Picker";
  set.x = 0; set.y = originY;
  const opts: GroupedSpecOpts = {
    title: "Time Picker",
    platforms: [{ name: "PC", sizes: ["XXSM", "XSM", "MD"] }, { name: "Mobile", sizes: ["MD"] }],
    rowLabels: [""],
    colHeaders: states.map((s) => s.name),
    cellAt: (platName, size, _ri, ci) =>
      cells.find((x) => x.size === size && x.brk === platName && x.state === states[ci].name)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 168, cellH: 250, rowLabelW: 16,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Time Picker Cell (옵션 셀) — color/dropdown/option/* ──────────────────────
// Figma 정본: timepicker_input_component(540:3469) — State=Default/Hover/Selected.
//   재사용 단위(셀). Time Picker Dropdown 패널은 이 셀의 **인스턴스**로 조립한다.
//   (이전엔 셀을 인라인 프레임으로 매번 새로 그려 컴포넌트화가 안 돼 있었음 → 2026-06-17 구조 정정)
//   default/hover/selected 전부 공유 color/dropdown/option/* 토큰(Basic Dropdown 재사용 정본).
//   2026-06-30: 셀 stroke(테두리) 제거 — 기본 Dropdown 셀과 동일하게 bg+label 만(사용자 결정). 선택 강조는
//   bg/selected(blue-50)로 충분. 이에 따라 color/dropdown/option/border/{default,hover,selected} 3종 삭제.
// V2.4 원본 timepicker_input_component(540:3470) 실측: 44×32, px12, radius4. 드롭다운에선 컬럼 폭을 채움(STRETCH).
const TPC_W = 44, TPC_H = 32;
async function buildTimePickerCell(maps: BuildMaps): Promise<{ set: ComponentSetNode; variants: Record<string, ComponentNode> }> {
  const opt = (k: string) => `color/dropdown/option/${k}`;
  const states = [
    { name: "Default",  bg: "bg/default",  lb: "label/default" },
    { name: "Hover",    bg: "bg/hover",    lb: "label/hover" },
    { name: "Selected", bg: "bg/selected", lb: "label/selected" },
  ];
  const comps: ComponentNode[] = [];
  const variants: Record<string, ComponentNode> = {};
  for (const st of states) {
    const comp = figma.createComponent();
    comp.name = `State=${st.name}`;
    comp.layoutMode = "HORIZONTAL"; comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
    comp.paddingLeft = 12; comp.paddingRight = 12; comp.cornerRadius = 4;
    comp.resize(TPC_W, TPC_H);
    comp.fills = [boundPaint(scv(maps, opt(st.bg)))];
    comp.appendChild(await makeBoundText("00", 14, "Regular", scv(maps, opt(st.lb))));
    // ⚠️ 셀 마스터에 모드를 핀하지 않는다(setLightMode 금지). 드롭다운 패널에 인스턴스로 중첩될 때,
    //    셀이 라이트로 고착되면 다크 스펙 프레임의 setMode(dark)가 셀까지 전파되지 못한다(2026-06-17 버그).
    //    핀을 비우면 셀은 부모(패널/스펙 프레임) 모드를 상속 → Light/Dark 모두 정상. 셀 SET 자체의 라이트
    //    표시는 combineAsVariants 후 decorateSetFlat 의 setLightMode(set) 가 담당(아래).
    comps.push(comp); variants[st.name] = comp;
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Time Picker Cell";
  return { set, variants };
}

// ── Time Picker Dropdown (패널) — Time Picker Cell 인스턴스로 조립 ─────────────
// Figma 정본: pc_timepicker_input_dropdown(540:3506) — Type=24h(시·분 2컬럼) / Type=12h(오전오후·시·분 3컬럼).
//   셀=Time Picker Cell 인스턴스. 패널 고정폭 24h=121/12h=194, 컬럼=flex 채움, 셀=컬럼폭 채움·h32 (V2.4 실측).
//   확인 푸터(px16 py12) 우측정렬 — 분 선택 전 disabled, 선택 후 accent.
//   메인 세트는 Type=24h/12h 만(변형 폭증 방지). 상태값은 아래 별도 States 스펙 시트로 정리.
// V2.4 원본 pc_timepicker_input_dropdown(540:3506) 실측:
//   패널 폭 24h=121 / 12h=194 (고정). cols: px8·gap8·컬럼 사이 1px 구분선(line/gray/subtle).
//   컬럼=flex-grow(채움), 셀=컬럼 폭 채움(STRETCH)·h32. 패널 그림자 0 4 8 rgba(0,0,0,.15)(MVP4.3-A 허용).
const TPD_COLS_H = 192, TPD_PAD_TOP = 12;
const TPD_PANEL_W = (n: number) => (n >= 3 ? 194 : 121); // 컬럼 수 → 원본 고정 폭
interface TpdColSpec { items: string[]; selIdx: number; hoverIdx: number; }
async function buildTimePickerDropdown(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const cell = await buildTimePickerCell(maps);

  // 한 컬럼: flex-grow(부모 폭 균등 채움). 셀 인스턴스를 직접 쌓고 각 셀은 컬럼 폭 채움(STRETCH).
  async function makeCol(items: string[], selIdx: number, hoverIdx: number): Promise<FrameNode> {
    const col = figma.createFrame();
    col.name = "col";
    col.layoutMode = "VERTICAL"; col.primaryAxisSizingMode = "FIXED"; col.counterAxisSizingMode = "FIXED";
    col.itemSpacing = 0; col.clipsContent = true; col.fills = [];
    col.resize(44, TPD_COLS_H);
    for (let i = 0; i < items.length; i++) {
      const state = i === selIdx ? "Selected" : i === hoverIdx ? "Hover" : "Default";
      const inst = cell.variants[state].createInstance();
      const txt = inst.findOne((n) => n.type === "TEXT") as TextNode | null;
      if (txt) { await figma.loadFontAsync(txt.fontName as FontName); txt.characters = items[i]; }
      col.appendChild(inst);
      inst.layoutAlign = "STRETCH"; // 셀이 컬럼 폭을 채움 (44→48 등 variant 폭 대응)
    }
    return col;
  }

  // 1px 세로 구분선 (컬럼 사이) — 높이 채움.
  function makeColSep(): RectangleNode {
    const sep = figma.createRectangle();
    sep.name = "sep"; sep.resize(1, TPD_COLS_H);
    sep.fills = [boundPaint(scv(maps, "color/line/gray/subtle"))];
    return sep;
  }

  // 패널 노드(컴포넌트 또는 프레임)에 cols + 푸터 구분선 + 확인 푸터를 채운다.
  async function fillPanel(node: FrameNode | ComponentNode, cols: TpdColSpec[], confirmActive: boolean): Promise<void> {
    const panelW = TPD_PANEL_W(cols.length); // 24h=121 / 12h=194 (원본 고정)
    node.layoutMode = "VERTICAL"; node.counterAxisAlignItems = "CENTER";
    node.itemSpacing = 0; node.paddingTop = TPD_PAD_TOP; node.paddingBottom = 0; node.cornerRadius = 4;
    node.clipsContent = true;
    node.fills = [boundPaint(scv(maps, "color/dropdown/list/bg"))];
    node.strokes = [boundPaint(scv(maps, "color/dropdown/list/border"))]; node.strokeWeight = 1; node.strokeAlign = "INSIDE";
    node.effects = shadowEffects("shadow/dropdown");   // 정본 파생(옛 하드코딩과 동일 값)
    node.resize(panelW, 100);              // 폭 고정 (resize 후 sizing 모드 설정)
    node.primaryAxisSizingMode = "AUTO";   // 높이 hug
    node.counterAxisSizingMode = "FIXED";  // 폭 = panelW 고정

    // cols 컨테이너 (가로, px8·gap8, 폭 채움, 높이 COLS_H)
    const colsFrame = figma.createFrame();
    colsFrame.name = "cols";
    colsFrame.layoutMode = "HORIZONTAL"; colsFrame.counterAxisAlignItems = "MIN";
    colsFrame.primaryAxisSizingMode = "FIXED"; colsFrame.counterAxisSizingMode = "FIXED";
    colsFrame.itemSpacing = 8; colsFrame.paddingLeft = 8; colsFrame.paddingRight = 8; colsFrame.fills = [];
    colsFrame.resize(panelW, TPD_COLS_H);
    for (let i = 0; i < cols.length; i++) {
      if (i > 0) { const sep = makeColSep(); colsFrame.appendChild(sep); sep.layoutAlign = "STRETCH"; }
      const col = await makeCol(cols[i].items, cols[i].selIdx, cols[i].hoverIdx);
      colsFrame.appendChild(col); col.layoutGrow = 1; col.layoutAlign = "STRETCH"; // 폭 균등 채움 + 높이 채움
    }
    node.appendChild(colsFrame); colsFrame.layoutAlign = "STRETCH"; // 패널 폭 채움

    // 푸터 구분선 (px8 컨테이너 + 가로 1px 라인)
    const fdivWrap = figma.createFrame();
    fdivWrap.name = "footer-sep"; fdivWrap.layoutMode = "VERTICAL";
    fdivWrap.primaryAxisSizingMode = "AUTO"; fdivWrap.counterAxisSizingMode = "FIXED";
    fdivWrap.paddingLeft = 8; fdivWrap.paddingRight = 8; fdivWrap.fills = [];
    fdivWrap.resize(panelW, 1);
    const fdiv = figma.createRectangle(); fdiv.name = "line"; fdiv.resize(panelW - 16, 1);
    fdiv.fills = [boundPaint(scv(maps, "color/line/gray/subtle"))];
    fdivWrap.appendChild(fdiv); fdiv.layoutAlign = "STRETCH";
    node.appendChild(fdivWrap); fdivWrap.layoutAlign = "STRETCH";

    // 확인 푸터 (px16 py12 우측정렬) — 분 선택 전 disabled, 선택 후 accent
    const footer = figma.createFrame();
    footer.name = "Option";
    footer.layoutMode = "HORIZONTAL"; footer.primaryAxisAlignItems = "MAX"; footer.counterAxisAlignItems = "CENTER";
    footer.primaryAxisSizingMode = "FIXED"; footer.counterAxisSizingMode = "AUTO";
    footer.paddingLeft = 16; footer.paddingRight = 16; footer.paddingTop = 12; footer.paddingBottom = 12; footer.fills = [];
    footer.appendChild(await makeBoundText("확인", 14, "Medium", scv(maps, confirmActive ? "color/text/state/accent" : "color/text/state/disabled")));
    node.appendChild(footer); footer.layoutAlign = "STRETCH";
  }

  const hours = ["1", "2", "3", "4", "5", "6", "7"];
  const mins = ["00", "01", "02", "03", "04", "05", "06"];
  const ampm = ["오전", "오후"];
  const colsOf = (type: string, cfg: { ampm?: number; hSel?: number; hHov?: number; mSel?: number; mHov?: number }): TpdColSpec[] => {
    const h: TpdColSpec = { items: hours, selIdx: cfg.hSel ?? -1, hoverIdx: cfg.hHov ?? -1 };
    const m: TpdColSpec = { items: mins, selIdx: cfg.mSel ?? -1, hoverIdx: cfg.mHov ?? -1 };
    if (type === "12h") return [{ items: ampm, selIdx: cfg.ampm ?? -1, hoverIdx: -1 }, h, m];
    return [h, m];
  };

  // 1) 메인 세트 — Type=24h/12h × State=시Hover/시Selected/분Hover/분Selected = 8 변형
  const tpdStates = [
    { state: "시 Hover",    cfg: { hHov: 1 },              confirm: false },
    { state: "시 Selected", cfg: { hSel: 2 },              confirm: false },
    { state: "분 Hover",    cfg: { hSel: 2, mHov: 3 },    confirm: false },
    { state: "분 Selected", cfg: { hSel: 2, mSel: 3 },    confirm: true },
  ];
  const comps: ComponentNode[] = [];
  const byKey = new Map<string, ComponentNode>();
  for (const type of ["24h", "12h"]) {
    for (const ts of tpdStates) {
      const panel = figma.createComponent();
      panel.name = `Type=${type}, State=${ts.state}`;
      await fillPanel(panel, colsOf(type, { ...ts.cfg, ampm: type === "12h" ? 0 : undefined }), ts.confirm);
      // setLightMode 금지 — 패널 마스터에 고착하면 dark 스펙 프레임 모드가 전파되지 않음(TimePicker Cell 동일 사상)
      comps.push(panel);
      byKey.set(`${type}/${ts.state}`, panel);
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Time Picker Dropdown";
  set.x = 0; set.y = originY;
  BUILT_SETS["Time Picker Dropdown"] = set;
  for (const [k, c] of byKey) BUILT_COMPS[`TPD:${k}`] = c;
  // Time Picker Focus 상태에 사용할 기본 변형 등록 (24h 시 Selected = 드롭다운 열려서 시 선택 완료 상태)
  BUILT_COMPS["TPD:focus-default"] = byKey.get("24h/시 Selected") ?? comps[0];

  const opts: SpecOpts = {
    title: "Time Picker Dropdown",
    colHeaders: tpdStates.map((ts) => ts.state),
    rowLabels: ["24h", "12h"],
    cellAt: (r, c) => byKey.get(`${["24h", "12h"][r]}/${tpdStates[c].state}`) ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 220, cellH: 300, rowLabelW: 40,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }

  // 2) 셀 세트 라벨 스펙 (Time Picker Cell — Default/Hover/Selected)
  const cellTop = bottomY + 80;
  const cellComps = [cell.variants.Default, cell.variants.Hover, cell.variants.Selected];
  const cellOpts: SpecOpts = {
    title: "Time Picker Cell",
    colHeaders: ["Default", "Hover", "Selected"],
    rowLabels: [""],
    cellAt: (_r, c) => cellComps[c],
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY: cellTop, cellW: 120, cellH: 56,
  };
  bottomY = Math.max(bottomY, await decorateSetFlat(cell.set, cellOpts, maps));
  try { bottomY = Math.max(bottomY, await buildSpec(cellOpts, maps)); } catch (e) { console.warn(e); }

  return { set, bottomY };
}

// ── Pagination Cell — 페이지네이션 하위 요소 셀(Arrow·Edge·Number) ─
// 정본: pages/components.html. Arrow 28×28(border·bg), Number 28×28(텍스트만).
// Arrow: Default/Hover/Disabled · Number: Default/Hover/Selected (4 states 매트릭스, 무효칸=null).
// 이 셀들을 조합한 "Pagination"(완성 바) 세트는 buildPaginationBar 가 만든다(Table 푸터·홈페이지 ACTION 동일).
// 색 바인딩(값 정본 일치):
//   arrow bg/border = color/pagination/control/* (신규 토큰 없이 기존 6키 사용)
//   arrow icon       = color/pagination/control/icon/*(전용 — Secondary 버튼 라벨과 동일 foundation: active=gray/800·disabled=gray/300)
//   number text      = color/pagination/number/*(전용 — 기존 적용색 보존: default·hover=gray/400·selected=gray/800)
async function buildPaginationCell(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const pg = (k: string) => `color/pagination/${k}`;
  const CHEV_PREV = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3.5L5 7l4 3.5" stroke="#000" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  // Edge(처음/마지막) — 좌향 chevron + 세로바(|<). last 는 사용처에서 180° 회전(>|). Arrow 가 prev 1종을 회전해 next 로 쓰는 것과 동일 철학.
  const CHEV_EDGE = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 3.5L6.5 7l3.5 3.5M3.5 3.5v7" stroke="#000" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const SZ = 28;
  // 아이콘 색 = 전용 semantic color/pagination/control/icon/*(범용 icon/* 직참 탈피). selected 토큰도 신설(현재 셀은 미사용·향후 대비).
  const arrowStates = [
    { state: "Default",  bg: "control/bg/default",  border: "control/border/default",  icon: "color/pagination/control/icon/default" },
    { state: "Hover",    bg: "control/bg/hover",    border: "control/border/default",  icon: "color/pagination/control/icon/hover" },
    { state: "Disabled", bg: "control/bg/disabled", border: "control/border/disabled", icon: "color/pagination/control/icon/disabled" },
  ];
  // 번호 텍스트 색 = 전용 semantic color/pagination/number/*(범용 text/* 직참 탈피).
  const numStates = [
    { state: "Default",  bg: null as string | null, text: "color/pagination/number/default" },
    { state: "Hover",    bg: "control/bg/hover",     text: "color/pagination/number/hover" },
    { state: "Selected", bg: null as string | null,  text: "color/pagination/number/selected" },
  ];
  const byKey = new Map<string, ComponentNode>();
  const comps: ComponentNode[] = [];
  // Edge 컴포넌트(ic_마지막장)를 먼저 로드한다 — 그 네이티브 크기를 Arrow chevron 에도 그대로 써서
  // 화살표(‹)와 끝버튼(‹ㅣ) 아이콘 크기를 일치시킨다(사용자: ‹ 를 ‹ㅣ 크기에 맞춤).
  const EDGE_SET_KEY = "606d0de897175059f133427bf62bb3635d18a860"; // ic_마지막장 V2.2 1407:51 (쉐브론+바, line variant)
  let edgeLineComp: ComponentNode | undefined;
  try {
    const edgeSet = await (figma as any).importComponentSetByKeyAsync(EDGE_SET_KEY) as ComponentSetNode;
    edgeLineComp = (edgeSet.children as ComponentNode[]).find(
      (c) => c.type === "COMPONENT" && c.name.toLowerCase().includes("line")
    ) as ComponentNode | undefined ?? (edgeSet as any).defaultVariant as ComponentNode | undefined;
  } catch (_) { /* 라이브러리 접근 실패 → SVG 폴백 */ }
  const ICON_PX = edgeLineComp ? Math.round(edgeLineComp.height) : 24; // Edge 네이티브 = 공통 아이콘 크기
  // Arrow variants — 419:69 chevron(line) 인스턴스를 180° 회전(이전장 ‹). 래퍼 프레임 없이(wrap:false)
  // 인스턴스 직접 배치 + 이름은 아이콘 기본명 유지(keepName) → Edge 와 동일 구조·동일 크기.
  for (const st of arrowStates) {
    const comp = figma.createComponent();
    comp.name = `Element=Arrow, State=${st.state}`;
    comp.resize(SZ, SZ);
    comp.cornerRadius = 2; // radius/control/xs = radius/2
    comp.fills = [boundPaint(scv(maps, pg(st.bg)))];
    comp.strokes = [boundPaint(scv(maps, pg(st.border)))];
    comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    const icon = await makeIconInstance("chevron", scv(maps, st.icon), ICON_PX, CHEV_PREV, 180, { wrap: false, keepName: true });
    comp.appendChild(icon);
    centerIconInBox(icon, comp, SZ); // 180° 회전 인스턴스 — 실측 바운딩박스로 정중앙 보정(피벗 의존 없음)
    setLightMode(comp, maps); // Button 패턴 — 명시적 light 부여 시 instance setMode(dark) 가 override 가능
    comps.push(comp); byKey.set(`Arrow/${st.state}`, comp);
  }
  // Edge variants (처음/마지막 — |< 아이콘. V2.2 ic_마지막장 1407:51 라이브러리 컴포넌트 세트 사용)
  for (const st of arrowStates) {
    const comp = figma.createComponent();
    comp.name = `Element=Edge, State=${st.state}`;
    comp.resize(SZ, SZ);
    comp.cornerRadius = 2;
    comp.fills = [boundPaint(scv(maps, pg(st.bg)))];
    comp.strokes = [boundPaint(scv(maps, pg(st.border)))];
    comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    let icon: SceneNode;
    let edgeRotated = false;
    if (edgeLineComp) {
      const inst = edgeLineComp.createInstance();
      if (ICON_PX && ICON_PX !== inst.width) inst.resize(ICON_PX, ICON_PX); // 네이티브 = ICON_PX(노옵) — Arrow 와 크기 동기화 보장
      rebindIconColor(inst, scv(maps, st.icon));
      // ic_마지막장(>ㅣ, 우향)을 180° 회전해 base Edge 셀을 "처음(ㅣ<, 좌향)" 방향으로 정규화한다(폴백 CHEV_EDGE 와 일치).
      //   바 조립에서 pg-first=회전없음(ㅣ<)·pg-last=180°(>ㅣ) 로 쓰므로 base 는 처음 방향이어야 한다.
      try { (inst as any).rotation = 180; edgeRotated = true; } catch (e) { /* */ }
      icon = inst;
    } else {
      icon = makeStrokeIcon(CHEV_EDGE, scv(maps, st.icon)); // icon-vector-allow: ic_마지막장 세트 로드 실패 폴백(ㅣ< 처음 방향)
    }
    comp.appendChild(icon);
    if (edgeRotated) centerIconInBox(icon, comp, SZ); // 회전 인스턴스 — 실측 바운딩박스로 정중앙 보정
    else { icon.x = (SZ - icon.width) / 2; icon.y = (SZ - icon.height) / 2; }
    setLightMode(comp, maps);
    comps.push(comp); byKey.set(`Edge/${st.state}`, comp);
  }
  // Number variants — 오토레이아웃 가운데 정렬(인스턴스 텍스트 override 시 자동 재정렬: 바 조립에서 1~6 표시)
  for (const st of numStates) {
    const comp = figma.createComponent();
    comp.name = `Element=Number, State=${st.state}`;
    comp.layoutMode = "HORIZONTAL"; comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
    comp.resize(SZ, SZ);
    comp.cornerRadius = 2;
    comp.fills = st.bg ? [boundPaint(scv(maps, pg(st.bg)))] : [];
    const t = await makeBoundText("3", 14, "Medium", scv(maps, st.text));
    comp.appendChild(t);
    setLightMode(comp, maps);
    comps.push(comp); byKey.set(`Number/${st.state}`, comp);
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Pagination Cell";
  set.x = 0; set.y = originY;
  // Table 푸터·Pagination 바에서 인스턴스 재사용 — byKey 전체 BUILT_COMPS 등록(키 접두사 "Pagination:" 유지)
  for (const [k, v] of byKey) BUILT_COMPS[`Pagination:${k}`] = v;
  BUILT_SETS["Pagination Cell"] = set;
  // 매트릭스: 행=Arrow/Number, 열=Default/Hover/Selected/Disabled (무효칸 null)
  const cols = ["Default", "Hover", "Selected", "Disabled"];
  const opts: SpecOpts = {
    title: "Pagination Cell",
    colHeaders: cols,
    rowLabels: ["Arrow", "Number", "Edge"],
    cellAt: (r, c) => byKey.get(`${["Arrow", "Number", "Edge"][r]}/${cols[c]}`) ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 72, cellH: 48, rowLabelW: 64,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Pagination — 하위 요소 셀(Pagination Cell)을 조합한 완성 바 (State 변형세트) ──────
// 정본: pages/components.html State Scenarios / registry/components/pagination.json.
//   구성(좌→우): ㅣ<(맨앞) · <(이전) · 1 2 3 4 5 6 · >(다음) · >ㅣ(맨뒤). 그룹 내 gap4, 숫자그룹↔화살표 gap8.
//   방향: 이전=Arrow(base ‹ 좌향, 회전없음) · 다음=Arrow 180°(›) · 맨앞=Edge(base ㅣ< 좌향, 회전없음) · 맨뒤=Edge 180°(>ㅣ).
//   상태(State 변형): 원페이지/맨앞/맨뒤/중간 — 이동버튼 활성·비활성, selected 숫자가 케이스마다 다름.
//   숫자=인스턴스 텍스트 override, 비활성=Disabled 셀·selected=Selected 셀(Variable 바인딩 색은 Cell 이 보유).
async function buildPaginationBar(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const SZ = 28, GAP_GROUP = 4, GAP_SECTION = 8;
  // Pagination Cell 셀(먼저 빌드됨) — 없으면 세트에서 탐색(부분 재설치 폴백)
  const pick = async (key: string, variantName: string): Promise<ComponentNode | undefined> => {
    let c: ComponentNode | undefined = BUILT_COMPS[`Pagination:${key}`];
    if (!c) { const s = await getBuiltSet("Pagination Cell"); if (s) c = ((s.children as ComponentNode[]) || []).find((x) => x.type === "COMPONENT" && x.name.includes(variantName)); }
    return c;
  };
  const arrowDef = await pick("Arrow/Default",   "Element=Arrow, State=Default");
  const arrowDis = await pick("Arrow/Disabled",  "Element=Arrow, State=Disabled");
  const edgeDef  = await pick("Edge/Default",    "Element=Edge, State=Default");
  const edgeDis  = await pick("Edge/Disabled",   "Element=Edge, State=Disabled");
  const numDef   = await pick("Number/Default",  "Element=Number, State=Default");
  const numSel   = await pick("Number/Selected", "Element=Number, State=Selected");

  // 상황별 케이스(정본 State Scenarios). pageNums=표시할 숫자, selected=선택 숫자, nav 4종 활성 여부.
  interface PgCase {
    state: string; pages: number[]; selected: number;
    first: boolean; prev: boolean; next: boolean; last: boolean; // true=활성, false=비활성(Disabled)
  }
  const cases: PgCase[] = [
    // 1) 원페이지(리스트 15개까지) — 이동버튼 전체 비활성, "1"만 selected.
    { state: "Single",   pages: [1],                 selected: 1, first: false, prev: false, next: false, last: false },
    // 2) 맨앞 페이지 — 맨앞·이전 비활성, 1 selected, 다음·맨뒤 활성.
    { state: "First",    pages: [1, 2, 3, 4, 5, 6],  selected: 1, first: false, prev: false, next: true,  last: true  },
    // 3) 맨뒤 페이지 — 맨앞·이전 활성, 마지막(6) selected, 다음·맨뒤 비활성.
    { state: "Last",     pages: [1, 2, 3, 4, 5, 6],  selected: 6, first: true,  prev: true,  next: false, last: false },
    // 4) 중간 페이지 — 전부 활성, 가운데(4) selected.
    { state: "Middle",   pages: [1, 2, 3, 4, 5, 6],  selected: 4, first: true,  prev: true,  next: true,  last: true  },
  ];

  const comps: ComponentNode[] = [];
  let maxW = 0;
  for (const cs of cases) {
    const comp = figma.createComponent();
    comp.name = `State=${cs.state}`;
    comp.fills = [];
    // 절대 배치(회전 인스턴스 + 그룹 gap) — 오토레이아웃은 180° 회전 자식과 충돌 가능해 수동 배치(Table 푸터 패턴).
    let x = 0;
    const add = (cell: ComponentNode | undefined, name: string, rotate: boolean, num?: number): void => {
      if (cell) {
        const inst = cell.createInstance();
        inst.name = name;
        if (num != null) { const txt = inst.findOne((n) => n.type === "TEXT") as TextNode | null; if (txt) { try { txt.characters = String(num); } catch (e) { /* */ } } }
        comp.appendChild(inst);
        if (rotate) {
          // 180° 회전은 노드 원점(top-left) 기준으로 회전 → 보이는 박스가 좌상으로 SZ 만큼 밀려 숫자 행 위로 떠버린다(#4 버그).
          //   회전을 먼저 적용한 뒤, 박스 시각 위치가 슬롯 (x,0) 에 오도록 x+SZ / y+SZ 로 보정한다(셀=SZ×SZ 정사각).
          try { (inst as any).rotation = 180; } catch (e) { /* */ }
          try { (inst as any).x = x + SZ; (inst as any).y = SZ; } catch (e) { (inst as any).x = x; (inst as any).y = 0; }
        } else {
          (inst as any).x = x; (inst as any).y = 0;
        }
      }
      x += SZ;
    };
    add(cs.first ? edgeDef : edgeDis, "pg-first", false); x += GAP_GROUP;   // ㅣ< (맨앞)
    add(cs.prev  ? arrowDef : arrowDis, "pg-prev", false); x += GAP_SECTION; // <  (이전)
    for (const n of cs.pages) add(n === cs.selected ? numSel : numDef, `pg-num-${n}`, false, n); // 1..N (gap0)
    x += GAP_SECTION;
    add(cs.next ? arrowDef : arrowDis, "pg-next", true);  x += GAP_GROUP;   // > (Arrow 180°)
    add(cs.last ? edgeDef : edgeDis,   "pg-last", true);                    // >ㅣ (Edge 180°)
    try { comp.resize(x, SZ); } catch (e) { /* */ }
    if (x > maxW) maxW = x;
    setLightMode(comp, maps);
    comps.push(comp);
  }

  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Pagination"; set.x = 0; set.y = originY;
  BUILT_SETS["Pagination"] = set;
  BUILT_COMPS["Pagination:Bar/Middle"] = comps[3]; // Table 푸터 등에서 완성 바(중간 상태) 재사용
  const opts: SpecOpts = {
    title: "Pagination",
    colHeaders: [""],
    rowLabels: cases.map((c) => c.state),
    cellAt: (r, _c) => comps[r] ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: maxW + 40, cellH: SZ + 24, rowLabelW: 80,
  };
  const lightBottomY = await decorateSetFlat(set, opts, maps);
  // 다크 = 라이트 우측(buildSpec 기본 W+80). Pagination 은 좁은 컴포넌트라 우측 배치(StatusBar 규칙, #5 사용자 지적 2026-06-25).
  let bottomY = lightBottomY;
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── GNB — 메뉴 슬롯(9 variants) + GNB 바(6 variants) ─────────────────────────
// 정본: pages/components.html. PC only. 색은 color/navigation/* + line/gray/subtle + text/title/primary + icon/gray-dark.
// 메뉴 슬롯: 라벨 + 하단 2px 라인. Default=label/default-alt·밑줄 없음 / Hover·Selected=label/selected·밑줄(indicator/selected).
const GNB_MENU_SIZE: Record<string, { h: number; font: number; padX: number; inset: number }> = {
  md:  { h: 56, font: 18, padX: 40, inset: 24 },
  sm:  { h: 48, font: 18, padX: 32, inset: 20 },
  xsm: { h: 36, font: 14, padX: 32, inset: 20 },
};
const GNB_UTIL_SVGS = {
  // 원본 글리프(components.html). currentColor fill → icon/gray-dark 바인딩. viewBox 비율 보존(max side ≈ 24).
  lang: `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18C13.9659 18 18 13.9659 18 9C18 4.03412 13.9659 0 9 0C4.03412 0 0 4.03412 0 9C0 13.9659 4.03412 18 9 18ZM2.97529 3.84353C3.56824 4.09765 4.18235 4.32 4.81765 4.5C4.42588 5.80235 4.20353 7.13647 4.16118 8.47059H1.09059C1.20706 6.71294 1.89529 5.10353 2.97529 3.84353ZM5.99294 1.65176C5.67529 2.25529 5.4 2.86941 5.16706 3.49412C4.69059 3.35647 4.22471 3.20824 3.78 3.02824C4.43647 2.45647 5.17765 1.99059 5.99294 1.65176ZM8.47059 1.09059V4.01294C7.71882 3.98118 6.95647 3.89647 6.20471 3.73765C6.53294 2.88 6.93529 2.03294 7.43294 1.21765C7.77177 1.15412 8.12118 1.11176 8.47059 1.09059ZM10.5671 1.21765C11.0647 2.03294 11.4671 2.88 11.7953 3.73765C11.0435 3.88588 10.2918 3.98118 9.52941 4.01294V1.09059C9.87882 1.11176 10.2282 1.15412 10.5671 1.21765ZM14.22 3.02824C13.7753 3.20824 13.3094 3.36706 12.8329 3.49412C12.6 2.86941 12.3247 2.25529 12.0071 1.65176C12.8224 1.99059 13.5635 2.45647 14.22 3.02824ZM16.9094 8.47059H13.8388C13.7965 7.13647 13.5741 5.80235 13.1824 4.5C13.8282 4.32 14.4424 4.09765 15.0247 3.84353C16.1047 5.10353 16.7929 6.71294 16.9094 8.47059ZM15.0247 14.1565C14.4424 13.9024 13.8176 13.68 13.1824 13.5C13.5741 12.1976 13.7965 10.8635 13.8388 9.52941H16.9094C16.7929 11.2871 16.1047 12.8965 15.0247 14.1565ZM12.0071 16.3482C12.3247 15.7447 12.6 15.1306 12.8329 14.5059C13.3094 14.6435 13.7753 14.7918 14.22 14.9718C13.5635 15.5435 12.8224 16.0094 12.0071 16.3482ZM9.52941 16.9094V13.9871C10.2812 14.0188 11.0435 14.1035 11.7953 14.2624C11.4671 15.12 11.0647 15.9671 10.5671 16.7824C10.2282 16.8459 9.87882 16.8882 9.52941 16.9094ZM7.43294 16.7824C6.93529 15.9671 6.53294 15.12 6.20471 14.2624C6.95647 14.1141 7.70824 14.0188 8.47059 13.9871V16.9094C8.12118 16.8882 7.77177 16.8459 7.43294 16.7824ZM3.78 14.9718C4.22471 14.7918 4.69059 14.6329 5.16706 14.5059C5.4 15.1306 5.67529 15.7447 5.99294 16.3482C5.17765 16.0094 4.43647 15.5435 3.78 14.9718ZM5.84471 4.74353C6.71294 4.92353 7.59177 5.04 8.47059 5.07176V8.47059H5.22C5.26235 7.22118 5.47412 5.97177 5.85529 4.74353H5.84471ZM12.1553 4.74353C12.5259 5.97177 12.7376 7.22118 12.7906 8.47059H9.54V5.07176C10.4188 5.04 11.2871 4.93412 12.1659 4.74353H12.1553ZM12.1553 13.2565C11.2871 13.0765 10.4082 12.96 9.52941 12.9388V9.54H12.78C12.7376 10.7894 12.5259 12.0388 12.1447 13.2671L12.1553 13.2565ZM8.47059 9.52941V12.9282C7.59177 12.96 6.72353 13.0659 5.84471 13.2459C5.47412 12.0176 5.26235 10.7682 5.20941 9.51882H8.46L8.47059 9.52941ZM4.16118 9.52941C4.20353 10.8635 4.42588 12.1976 4.81765 13.5C4.17177 13.68 3.55765 13.9024 2.97529 14.1565C1.89529 12.8965 1.20706 11.2871 1.09059 9.52941H4.16118Z" fill="currentColor"/></svg>`,
  account: `<svg width="24" height="21.58" viewBox="0 0 24 21.5816" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.561 13.7324H7.43901C5.67118 13.7324 4.00236 14.3971 2.84266 15.5568C0.494991 17.9186 0.0141426 21.2704 0 21.3977L1.37183 21.5816C1.37183 21.5816 1.81025 18.5409 3.8185 16.5185C4.72363 15.6134 6.03889 15.1042 7.43901 15.1042H16.561C17.9611 15.1042 19.2764 15.6275 20.1815 16.5185C22.1897 18.5409 22.6282 21.5391 22.6282 21.5816L24 21.3977C23.9859 21.2563 23.505 17.9045 21.1573 15.5568C19.9976 14.3971 18.3288 13.7324 16.561 13.7324Z" fill="currentColor"/><path d="M5.9968 6.01061C5.9968 9.31998 8.69803 12.0212 12.0074 12.0212C15.3168 12.0212 18.018 9.31998 18.018 6.01061C18.018 2.70124 15.3168 0 12.0074 0C8.69803 0 5.9968 2.70124 5.9968 6.01061ZM16.6037 6.01061C16.6037 8.54213 14.5389 10.607 12.0074 10.607C9.47588 10.607 7.41106 8.54213 7.41106 6.01061C7.41106 3.47908 9.47588 1.41426 12.0074 1.41426C14.5389 1.41426 16.6037 3.47908 16.6037 6.01061Z" fill="currentColor"/></svg>`,
  menu: `<svg width="24" height="16.93" viewBox="0 0 24 16.9274" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1.41176H24V0.705882V0H0V1.41176Z" fill="currentColor"/><path d="M0 9.17647H24V8.47059V7.76471H0V9.17647Z" fill="currentColor"/><path d="M0 16.9274H24V16.2215V15.5156H0V16.9274Z" fill="currentColor"/></svg>`,
};

/**
 * Figma 슬롯 노드 생성 — 컴포넌트 안에 "끼워 넣는 자리"를 만들고 기본 내용을 채운다. (river 결정 2026-09-03)
 * 배선은 Bottom Sheet Content 슬롯(buildBottomSheet)과 같은 방식이다:
 *   `createSlot()` 이 owner 에 SLOT 속성을 함께 만들고, 그 속성을 propName 으로 개명한다.
 *   슬롯 노드를 중첩 프레임 안으로 옮겨도 owner 컴포넌트의 속성으로 유지된다.
 * 폴백을 두지 않는다 — 슬롯이 안 만들어졌는데 겉모습만 같은 프레임으로 조용히 빌드되면
 * "슬롯인 줄 알았는데 아니었다"를 아무도 모른다. Bottom Sheet 와 동일하게 크게 실패시킨다.
 */
interface SlotLayout {
  layoutMode?: "HORIZONTAL" | "VERTICAL";
  primaryAxisSizingMode?: "FIXED" | "AUTO";
  counterAxisSizingMode?: "FIXED" | "AUTO";
  primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems?: "MIN" | "CENTER" | "MAX";
  itemSpacing?: number;
  paddingLeft?: number; paddingRight?: number; paddingTop?: number; paddingBottom?: number;
  /** 슬롯 자신을 부모 auto-layout 안에서 가로로 늘린다(세로 목록형 슬롯에 필요). */
  stretch?: boolean;
  /** 슬롯 안의 기본 내용물도 STRETCH 로 늘린다(옵션 줄·본문처럼 폭을 꽉 채우는 내용). */
  stretchContents?: boolean;
  /**
   * 슬롯을 붙일 부모. 기본은 owner 컴포넌트 직계.
   * owner 안쪽 프레임에 넣을 때는 **그 프레임을 여기에 넘긴다** — owner 에 먼저 붙였다 옮기면
   * 파생 사실(component-facts anatomy)에 "루트 직계 부품"으로도 함께 남아 유령 부품이 생긴다
   * (🤖 component-verifier 적발 2026-09-03). Bottom Sheet 도 처음부터 안쪽 프레임에 직접 붙인다.
   * 넘기는 프레임은 owner 서브트리 안에 **미리 붙어 있어야** 한다.
   */
  parent?: FrameNode;
}

async function makeSlot(comp: ComponentNode, propName: string, description: string, contents: SceneNode[],
                        preferredValues: InstanceSwapPreferredValue[] = [],
                        layout: SlotLayout = {}): Promise<FrameNode> {
  const before = new Set(Object.entries(comp.componentPropertyDefinitions || {})
    .filter(([, d]) => d.type === "SLOT").map(([n]) => n));
  const slot = comp.createSlot();
  slot.name = propName;
  slot.fills = [];
  slot.layoutMode = layout.layoutMode ?? "HORIZONTAL";
  slot.primaryAxisSizingMode = layout.primaryAxisSizingMode ?? "AUTO";
  slot.counterAxisSizingMode = layout.counterAxisSizingMode ?? "AUTO";
  slot.primaryAxisAlignItems = layout.primaryAxisAlignItems ?? "CENTER";
  slot.counterAxisAlignItems = layout.counterAxisAlignItems ?? "CENTER";
  slot.itemSpacing = layout.itemSpacing ?? 0; slot.clipsContent = false;
  slot.paddingLeft = layout.paddingLeft ?? 0; slot.paddingRight = layout.paddingRight ?? 0;
  slot.paddingTop = layout.paddingTop ?? 0; slot.paddingBottom = layout.paddingBottom ?? 0;
  for (const c of contents) slot.appendChild(c);
  (layout.parent ?? comp).appendChild(slot);
  if (layout.stretch) { try { slot.layoutAlign = "STRETCH"; } catch (e) { /* */ } }
  if (layout.stretchContents) {
    for (const c of contents) { try { (c as any).layoutAlign = "STRETCH"; } catch (e) { /* */ } }
  }
  // 구형 검증 mock 은 componentPropertyDefinitions 를 기록하지 않는다 — 정의를 주는 환경에서만 누락을 오류로 본다.
  const defs = Object.entries(comp.componentPropertyDefinitions || {});
  const added = defs.find(([n, d]) => d.type === "SLOT" && !before.has(n))?.[0];
  if (defs.length && !added) throw new Error(`[makeSlot] ${propName} 슬롯 속성을 찾지 못했습니다.`);
  if (added) comp.editComponentProperty(added, { name: propName, description, preferredValues });
  return slot as unknown as FrameNode;
}

/** GNB 메뉴 슬롯 콘텐츠를 node(컴포넌트/프레임)에 채우고 폭을 반환. */
async function fillGnbMenu(node: ComponentNode | FrameNode, maps: BuildMaps, sizeKey: string, state: string): Promise<number> {
  const navc = (k: string) => `color/navigation/${k}`;
  const S = GNB_MENU_SIZE[sizeKey];
  const active = state !== "Default";
  node.fills = [];
  const t = await makeBoundText("메뉴타이틀", S.font, "Medium", scv(maps, navc(active ? "label/selected" : "label/default-alt")));
  node.appendChild(t);
  const W = Math.max(116, Math.ceil(t.width) + S.padX * 2);
  node.resize(W, S.h);
  t.x = (W - t.width) / 2; t.y = (S.h - t.height) / 2;
  const ul = figma.createRectangle();
  ul.resize(W - S.inset * 2, 2); ul.x = S.inset; ul.y = S.h - 2;
  ul.fills = active ? [boundPaint(scv(maps, navc("indicator/selected")))] : [];
  node.appendChild(ul);
  return W;
}

// ── GNB Utility Icon — 레거시 slot_utility(P8YvnCdG… 1980:53435) 동일 변형세트 ──────
// 3 토글 프로퍼티(language·menu·user)의 5개 조합. 시각 순서: language → user → menu, gap 8.
//   language=on → Language Icon(지구본+한국어) 컴포넌트 인스턴스(레거시 globe 아이콘 교체).
//   user/menu → V2.2 라이브러리 아이콘(account·menu) 32px 박스·24 glyph.
// GNB 바는 이 세트의 all-on 변형(BUILT_COMPS["GNBUtil:full"]) 인스턴스를 유틸 영역에 넣는다.
async function buildGNBUtilIcon(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  // 계정·메뉴 아이콘 = 32px 박스(가운데 정렬, 24 glyph). 라이브러리 인스턴스.
  const iconBox = async (role: string, svg: string): Promise<FrameNode> => {
    const box = figma.createFrame();
    box.name = role; box.resize(32, 32); box.fills = [];
    box.layoutMode = "HORIZONTAL"; box.primaryAxisSizingMode = "FIXED"; box.counterAxisSizingMode = "FIXED";
    box.primaryAxisAlignItems = "CENTER"; box.counterAxisAlignItems = "CENTER";
    box.appendChild(await makeIconInstance(role, scv(maps, "color/icon/gray-dark"), 24, svg));
    return box;
  };
  // 레거시 1980:53435 의 5개 변형 (language·menu·user on/off). 순서·구성 동일.
  const defs = [
    { language: "on",  menu: "on",  user: "on",  label: "언어·계정·메뉴" },
    { language: "on",  menu: "off", user: "on",  label: "언어·계정" },
    { language: "on",  menu: "off", user: "off", label: "언어" },
    { language: "off", menu: "on",  user: "on",  label: "계정·메뉴" },
    { language: "off", menu: "off", user: "on",  label: "계정" },
  ];
  const comps: ComponentNode[] = [];
  for (const d of defs) {
    const comp = figma.createComponent();
    comp.name = `language=${d.language}, menu=${d.menu}, user=${d.user}`;
    comp.layoutMode = "HORIZONTAL"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO";
    comp.itemSpacing = 8; comp.fills = [];
    // 시각 순서: language → user(계정) → menu (레거시 코드 순서)
    if (d.language === "on") {
      const langComp = BUILT_COMPS["LanguageIcon:Korean"] ?? BUILT_COMPS["LanguageIcon:English"];
      if (langComp) comp.appendChild(langComp.createInstance());
    }
    if (d.user === "on") comp.appendChild(await iconBox("account", GNB_UTIL_SVGS.account));
    if (d.menu === "on") comp.appendChild(await iconBox("menu", GNB_UTIL_SVGS.menu));
    setLightMode(comp, maps);
    comps.push(comp);
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "GNB Utility Icon"; set.x = 0; set.y = originY;
  BUILT_SETS["GNB Utility Icon"] = set;
  BUILT_COMPS["GNBUtil:full"] = comps[0]; // all-on = GNB 바 유틸 영역에 인스턴스로 사용
  const opts: SpecOpts = {
    title: "GNB Utility Icon",
    colHeaders: [""],
    rowLabels: defs.map((d) => d.label),
    cellAt: (r, _c) => comps[r] ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 220, cellH: 40, rowLabelW: 120,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Language Icon — 지구본 + 텍스트 라벨 (English/Korean) ─────────────────────────
// Figma V3.0 TEST 325:4352 기준. globe=ICON_KEYS["globe"](V2.2 라이브러리). BUILT_COMPS에 등록.
async function buildLanguageIcon(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const variants = [
    { lang: "English", text: "English" },
    { lang: "Korean",  text: "한국어" },
  ];
  const comps: ComponentNode[] = [];
  for (const v of variants) {
    const comp = figma.createComponent();
    comp.name = `Language=${v.lang}`;
    comp.layoutMode = "HORIZONTAL"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO";
    comp.itemSpacing = 4; comp.paddingRight = 8; comp.fills = [];
    // 지구본 아이콘 (32×32 컨테이너)
    const globe = figma.createFrame();
    globe.name = "globe"; globe.resize(32, 32); globe.fills = [];
    const gi = await makeIconInstance("globe", scv(maps, "color/icon/gray-dark"), 24, GNB_UTIL_SVGS.lang);
    globe.appendChild(gi); gi.x = (32 - gi.width) / 2; gi.y = (32 - gi.height) / 2;
    comp.appendChild(globe);
    const t = await makeBoundText(v.text, 14, "Medium", scv(maps, "color/text/body/primary"));
    comp.appendChild(t);
    setLightMode(comp, maps);
    comps.push(comp);
    BUILT_COMPS[`LanguageIcon:${v.lang}`] = comp;
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Language Icon"; set.x = 0; set.y = originY;
  BUILT_SETS["Language Icon"] = set;
  const opts: SpecOpts = {
    title: "Language Icon",
    colHeaders: variants.map((v) => v.lang),
    rowLabels: [""],
    cellAt: (_r, c) => comps[c] ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 200, cellH: 56, rowLabelW: 16,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Mobile Bottom Nav (Tab Item 세트) — 홈 아이콘 + 라벨, 60×60 세로 오토레이아웃 ─────────
// Figma V3.0 TEST 540:6025 기준. state=unselected/selected(원본 소문자 네이밍 그대로).
// home=ICON_KEYS["home"](V2.2 라이브러리). 4탭 "바"는 설치기에서 만들지 않음 — Tab Item 세트만.
async function buildMobileBottomNav(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const variants = [
    { state: "unselected", icon: "color/icon/gray",  label: "color/navigation/label/default" },
    { state: "selected",   icon: "color/icon/blue",  label: "color/navigation/label/selected" },
  ];
  const comps: ComponentNode[] = [];
  for (const v of variants) {
    const comp = figma.createComponent();
    comp.name = `state=${v.state}`;
    comp.layoutMode = "VERTICAL";
    comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
    comp.itemSpacing = 4; comp.fills = [];
    comp.resize(60, 60);
    // 홈 아이콘 32×32 (V2.2 라이브러리 인스턴스, 색 재바인딩)
    const icon = await makeIconInstance("home", scv(maps, v.icon), 32, HOME_SVG);
    comp.appendChild(icon);
    // 라벨 12/Medium → body/12M 텍스트스타일 자동 바인딩
    const label = await makeBoundText("라벨", 12, "Medium", scv(maps, v.label));
    comp.appendChild(label);
    setLightMode(comp, maps);
    comps.push(comp);
    BUILT_COMPS[`MobileBottomNav:${v.state}`] = comp;
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Mobile Bottom Nav"; set.x = 0; set.y = originY;
  BUILT_SETS["Mobile Bottom Nav"] = set;
  const opts: SpecOpts = {
    title: "Mobile Bottom Nav",
    colHeaders: ["Unselected", "Selected"],
    rowLabels: [""],
    cellAt: (_r, c) => comps[c] ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 120, cellH: 60, rowLabelW: 16,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Mobile Header — StatusBar(App/Web) + 56px AppBar, 360×99/149 ────────────
// V2.4 mobile_header(540:6112) 원본 5종 기준 + 회원가입용 No Title 계열 2종.
// StatusBar는 정본 인스턴스만 재사용하고, 아이콘은 등록된 원본 component key import만 허용한다.
// 2026-08-25 river: "Home / Title + 2 Icons" 는 실제로 쓰지 않는 기준이라 삭제.
// 2026-08-25 river: 회원가입 약관상세(제목 없음 + 닫기)용으로 "Standard / No Title + Close" 추가.
// 2026-08-25 river: 원본의 "Home titel + alt titel" 은 구조가 아니라 문구만 다른 것이었고
//   'alt' 는 네이밍 체계상 쓰지 않기로 한 말이라, 실체 그대로 "Home / Title" 로 개명한다.
//   (삭제한 "Home / Title + 2 Icons" 가 비운 이름 자리를 그대로 쓴다)
// 2026-08-25 river: 나열 순서는 Home 먼저, 그 다음 Standard.
// 2026-09-08 river 승인: "모바일 상단바는 홈+타이틀+아이콘 1개 한 종류 추가로".
//   없앤 두 유형(①"Home / Title + 2 Icons" 삭제 ②앱바 미채택)의 자리를 이 한 종류가 대신한다.
//   ⚠️ 이 조합은 레거시 A(540:6112)·B 어디에도 없다 — 🤖 figma-inspector 2026-09-07 실측으로 확인했다.
//   원본의 아이콘 1개짜리는 항상 부제와 펼침 화살표를 달고 있어(=아래 Subtitle 유형) 그것과 다른 조합이다.
//   따라서 원본을 옮긴 것이 아니라 "Home / Title" 에 알림 아이콘 자리 하나를 더한 신설이다.
const MOBILE_HEADER_TYPES = [
  "Home / Title",
  "Home / Title + 1 Icon",
  "Home / Title + Subtitle + 1 Icon",
  "Standard / Title",
  "Standard / Title + Close",
  "Standard / No Title",
  "Standard / No Title + Close",
] as const;
type MobileHeaderType = typeof MOBILE_HEADER_TYPES[number];
const MOBILE_HEADER_PLATFORMS = ["App", "Web"] as const;
type MobileHeaderPlatform = typeof MOBILE_HEADER_PLATFORMS[number];

function makeMobileHeaderSlot(name: string): FrameNode {
  const slot = figma.createFrame();
  slot.name = name;
  slot.layoutMode = "HORIZONTAL";
  slot.primaryAxisAlignItems = "CENTER";
  slot.counterAxisAlignItems = "CENTER";
  slot.primaryAxisSizingMode = "FIXED";
  slot.counterAxisSizingMode = "FIXED";
  slot.fills = [];
  slot.clipsContent = false;
  slot.resize(32, 32);
  return slot;
}

async function makeMobileHeaderIconSlot(
  name: string,
  role: string,
  colorVar: Variable,
  accentVar?: Variable,
  iconSize = 24,
): Promise<FrameNode> {
  const slot = makeMobileHeaderSlot(name);
  slot.appendChild(await makeRequiredIconInstance(role, colorVar, iconSize, accentVar));
  return slot;
}

function makeMobileHeaderGrowFrame(name: string, align: "MIN" | "CENTER"): FrameNode {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = "HORIZONTAL";
  frame.primaryAxisAlignItems = align;
  frame.counterAxisAlignItems = "CENTER";
  frame.primaryAxisSizingMode = "FIXED";
  frame.counterAxisSizingMode = "FIXED";
  frame.layoutGrow = 1;
  frame.fills = [];
  frame.clipsContent = false;
  frame.resize(1, 32);
  return frame;
}

async function mobileHeaderStatusBarInstance(platform: MobileHeaderPlatform): Promise<InstanceNode> {
  const status = BUILT_COMPS[`StatusBar:${platform}`]
    ?? await reuseVariant("StatusBar", `StatusBar:${platform}`, [`Platform=${platform}`]);
  if (!status) throw new Error(`Mobile Header는 StatusBar / Platform=${platform} 정본이 먼저 필요합니다.`);
  const inst = status.createInstance();
  inst.name = "StatusBar";
  return inst;
}

async function buildMobileHeaderVariant(
  type: MobileHeaderType,
  platform: MobileHeaderPlatform,
  maps: BuildMaps,
): Promise<ComponentNode> {
  const isHome = type.startsWith("Home /");
  const statusBarHeight = platform === "Web" ? 77 : 27;
  const rootHeight = platform === "Web" ? 149 : 99;
  const comp = figma.createComponent();
  comp.name = `Type=${type}, Platform=${platform}`;
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "FIXED";
  comp.counterAxisSizingMode = "FIXED";
  comp.itemSpacing = 16;
  comp.fills = [boundPaint(scv(maps, isHome ? "color/bg/home" : "color/bg/level-0"))];
  comp.resize(360, rootHeight);
  const statusInst = await mobileHeaderStatusBarInstance(platform);
  comp.appendChild(statusInst);
  statusInst.resize(360, statusBarHeight);
  statusInst.layoutAlign = "STRETCH";
  statusInst.layoutSizingHorizontal = "FILL";
  statusInst.layoutSizingVertical = "FIXED";
  // 상태바도 다크를 따라오게 한다(river 결정 2026-08-25) — 자기 모드 핀을 풀어 부모를 상속.
  clearMode(statusInst, maps);
  // 배경도 비운다 — 원본(V2.4)은 프레임 전체가 한 배경색이고 상태바 행이 따로 배경을 갖지 않았다.
  // 이걸 빼면 상태바 띠만 다른 색으로 갈라진다(2026-08-25 V3-1). StatusBar 정본 세트는 건드리지 않는다.
  statusInst.fills = [];

  const appBar = figma.createFrame();
  appBar.name = "AppBar";
  appBar.layoutMode = "HORIZONTAL";
  appBar.primaryAxisAlignItems = "CENTER";
  appBar.counterAxisAlignItems = "CENTER";
  appBar.primaryAxisSizingMode = "FIXED";
  appBar.counterAxisSizingMode = "FIXED";
  appBar.layoutAlign = "STRETCH";
  appBar.paddingTop = 12; appBar.paddingBottom = 12;
  appBar.paddingLeft = isHome ? 20 : 16;
  appBar.paddingRight = 16;
  appBar.fills = [boundPaint(scv(maps, isHome ? "color/bg/home" : "color/bg/level-0"))];
  appBar.resize(360, 56);
  comp.appendChild(appBar);

  const iconLight = scv(maps, "color/icon/gray-light");
  const iconDark = scv(maps, "color/icon/gray-dark");
  const titleColor = scv(maps, "color/text/title/primary");

  if (!isHome) {
    appBar.itemSpacing = 8;
    appBar.appendChild(await makeMobileHeaderIconSlot("Back", "mobileHeaderBack", iconDark));
    const center = makeMobileHeaderGrowFrame("Title", "CENTER");
    if (!type.startsWith("Standard / No Title")) {
      center.appendChild(await makeBoundText("스탠다드형 타이틀", 18, "Medium", titleColor, "title/18M"));
    }
    appBar.appendChild(center);
    appBar.appendChild(type.endsWith("+ Close")
      ? await makeMobileHeaderIconSlot("Close", "mobileHeaderClose", iconDark)
      : makeMobileHeaderSlot("Right spacer"));
  } else if (type === "Home / Title + Subtitle + 1 Icon") {
    const copy = figma.createFrame();
    copy.name = "Title + Subtitle"; copy.layoutMode = "VERTICAL";
    copy.primaryAxisAlignItems = "CENTER"; copy.counterAxisAlignItems = "MIN";
    // 2줄 스택(제목 23.4 + gap 2 + 서브 18.2 ≈ 44)이라 다른 유형의 32 로 고정하면 잘린다.
    // 높이는 내용에 맞춰 hug 하고, AppBar 상하 여백을 12 → 6 으로 줄여 56 에 맞춘다(44+6+6=56).
    // (2026-08-25 component-verifier ND-3 적발 — 원본 540:6178 도 이 유형만 여백이 좁다)
    copy.primaryAxisSizingMode = "AUTO"; copy.counterAxisSizingMode = "AUTO";
    copy.layoutGrow = 1; copy.itemSpacing = 2; copy.fills = [];
    appBar.paddingTop = 6; appBar.paddingBottom = 6;
    const titleRow = figma.createFrame();
    titleRow.name = "Title"; titleRow.layoutMode = "HORIZONTAL";
    titleRow.primaryAxisAlignItems = "MIN"; titleRow.counterAxisAlignItems = "CENTER";
    titleRow.primaryAxisSizingMode = "AUTO"; titleRow.counterAxisSizingMode = "AUTO";
    titleRow.itemSpacing = 4; titleRow.fills = [];
    titleRow.appendChild(await makeBoundText("홈 타이틀", 18, "Bold", titleColor, "title/18B"));
    // 원본(540:6198) 실측: fill 은 전부 hidden 이고 실제로 보이는 획은 stroke #353535 = color/icon/gray-dark.
    // 크기도 원본은 24 다(2026-08-25 component-verifier 적발 — v1 의 gray-light/16 은 오연결).
    titleRow.appendChild(await makeRequiredIconInstance("mobileHeaderArrowDown", iconDark, 24, undefined, -90));
    copy.appendChild(titleRow);
    copy.appendChild(await makeBoundText("홈 서브타이틀", 14, "Regular", scv(maps, "color/text/body/tertiary"), "body/14R"));
    appBar.appendChild(copy);
    appBar.appendChild(await makeMobileHeaderIconSlot("Notification", "mobileHeaderNotification", iconDark, scv(maps, "color/icon/red")));
  } else {
    // Home / Title · Home / Title + 1 Icon — 부제도 펼침 화살표도 없는 한 줄 제목.
    const title = makeMobileHeaderGrowFrame("Title", "MIN");
    title.appendChild(await makeBoundText("홈 타이틀", 18, "Bold", titleColor, "title/18B"));
    appBar.appendChild(title);
    // 알림 아이콘 1개 — Subtitle 유형과 같은 아이콘·같은 32px 자리·같은 빨간 점(color/icon/red).
    if (type === "Home / Title + 1 Icon") {
      appBar.itemSpacing = 8;
      appBar.appendChild(await makeMobileHeaderIconSlot("Notification", "mobileHeaderNotification", iconDark, scv(maps, "color/icon/red")));
    }
  }

  setLightMode(comp, maps);
  return comp;
}

async function buildMobileHeader(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const comps: ComponentNode[] = [];
  const byKey = new Map<string, ComponentNode>();
  for (const platform of MOBILE_HEADER_PLATFORMS) {
    for (const type of MOBILE_HEADER_TYPES) {
      const comp = await buildMobileHeaderVariant(type, platform, maps);
      comps.push(comp);
      byKey.set(`${platform}:${type}`, comp);
      BUILT_COMPS[`MobileHeader:${platform}:${type}`] = comp;
      // 기존 내부 소비자는 App 정본을 계속 받는다.
      if (platform === "App") BUILT_COMPS[`MobileHeader:${type}`] = comp;
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Mobile Header";
  set.x = 0; set.y = originY;
  BUILT_SETS["Mobile Header"] = set;
  // 계열별 목록 — 종전에는 열 인덱스를 c / c+2 로 계산해 "Home 2종 + Standard 4종"에 묶여 있었다.
  //   유형이 늘면 조용히 어긋나므로(2026-09-08 Home 3종이 됨) 계열로 갈라 인덱스 산식을 없앤다.
  const HOME_TYPES = MOBILE_HEADER_TYPES.filter((t) => t.startsWith("Home /"));
  const STD_TYPES = MOBILE_HEADER_TYPES.filter((t) => !t.startsWith("Home /"));
  const typeAt = (r: number, c: number): MobileHeaderType | undefined =>
    (r % 2 === 0 ? HOME_TYPES : STD_TYPES)[c];
  const opts: SpecOpts = {
    title: "Mobile Header",
    // Platform별로 Home 계열, Standard 계열을 나눠 완전 조합을 한눈에 검수한다.
    // 폭이 긴 스펙이므로 Dark 는 Light 오른쪽이 아니라 바로 아래에 둔다.
    // 열 수는 계열 길이에서 유도한다 — 고정하면 계열이 늘 때 마지막 유형이 조용히 사라진다.
    //   (🤖 component-verifier 2026-09-08 지적: 인덱스 산식은 없앴지만 열 수 고정은 같은 실패 모양으로 남아 있었다.)
    colHeaders: new Array(Math.max(HOME_TYPES.length, STD_TYPES.length)).fill(""),
    rowLabels: ["App / Home", "App / Standard", "Web / Home", "Web / Standard"],
    cellAt: (r, c) => {
      const platform = r < 2 ? "App" : "Web";
      const type = typeAt(r, c);
      return type ? (byKey.get(`${platform}:${type}`) ?? null) : null;
    },
    cellLabelAt: (r, c) => {
      const platform = r < 2 ? "App" : "Web";
      const type = typeAt(r, c);
      const comp = type ? byKey.get(`${platform}:${type}`) : null;
      return comp ? comp.name.replace(/^Type=/, "").replace(/, Platform=(App|Web)$/, "") : null;
    },
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY,
    cellW: 384, cellH: 149, rowLabelW: 232,
    leftAlignCells: true,
    stackDarkBelow: true,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

async function buildGNB(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const navc = (k: string) => `color/navigation/${k}`;
  const sizeKeys = ["md", "sm", "xsm"];
  const menuStates = ["Default", "Hover", "Selected"];

  // 1) 메뉴 슬롯 세트 (9 variants) — Size × State
  const menuComps: ComponentNode[] = [];
  const menuCellByKey = new Map<string, ComponentNode>();
  for (const sk of sizeKeys) {
    for (const ms of menuStates) {
      const comp = figma.createComponent();
      comp.name = `Size=${sk}, State=${ms}`;
      await fillGnbMenu(comp, maps, sk, ms);
      setLightMode(comp, maps);
      menuComps.push(comp); menuCellByKey.set(`${sk}/${ms}`, comp);
    }
  }
  const menuSet = figma.combineAsVariants(menuComps, figma.currentPage);
  menuSet.name = "GNB Menu";
  const menuOpts: GroupedSpecOpts = {
    title: "GNB Menu",
    platforms: [{ name: "PC", sizes: sizeKeys }],
    rowLabels: [""],
    colHeaders: menuStates,
    cellAt: (_p, size, _ri, ci) => menuCellByKey.get(`${size}/${menuStates[ci]}`) ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 200, cellH: 72, rowLabelW: 16,
  };
  // 메뉴 데코레이션(배치)은 바 아래로 미룬다 — 표시 순서: GNB 바(위) → GNB Menu(아래). (사용자 결정 2026-06-24)
  let bottomY = originY;

  // 2) GNB 바 세트 (6 variants) — Align × Size. 정본 = "GNB". 실제 화면폭 1920 으로 표현(사용자 결정).
  const BAR_W = 1920;
  const barH: Record<string, number> = { md: 56, sm: 48, xsm: 36 };
  const aligns = [
    { name: "Center-Between", key: "center-between" },
    { name: "Start", key: "start" },
  ];
  const barComps: ComponentNode[] = [];
  const barCellByKey = new Map<string, ComponentNode>();
  for (const al of aligns) {
    for (const sk of sizeKeys) {
      const h = barH[sk];
      const padL = sk === "xsm" ? 20 : 24;
      const padR = sk === "xsm" ? 24 : 20;
      const comp = figma.createComponent();
      comp.name = `Align=${al.name}, Size=${sk}`;
      comp.layoutMode = "HORIZONTAL";
      comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
      comp.primaryAxisAlignItems = "SPACE_BETWEEN"; // center-between=로고|메뉴|유틸 · start=(로고+메뉴)|유틸
      comp.counterAxisAlignItems = "CENTER";
      comp.paddingLeft = padL; comp.paddingRight = padR; comp.paddingTop = 0; comp.paddingBottom = 0;
      comp.itemSpacing = 0;
      comp.fills = [boundPaint(scv(maps, navc("bg")))];
      comp.clipsContent = true;
      comp.resize(BAR_W, h);

      // 로고
      const logo = await makeBoundText("SAMPLE LOGO", 20, "Bold", scv(maps, "color/text/title/primary"));

      // 메뉴가 놓이는 **자리 전체**가 Figma 슬롯("Menus") — 메뉴 개수를 늘리고 줄일 수 있게 한다. (river 지시 2026-09-03)
      //   메뉴 하나하나의 글자를 슬롯으로 만드는 것이 아니다. 기본 내용은 기존과 같은 메뉴 3개다.
      //   GNB Menu 컴포넌트 인스턴스 사용 — GNB 바 사이즈(sk)와 같은 GNB Menu 사이즈 매칭.
      //   첫 칸=Selected(밑줄), 나머지=Default. (#4 사용자 결정: raw menu 프레임 대신 GNB Menu 인스턴스)
      const menuItems: SceneNode[] = [];
      for (let mi = 0; mi < 3; mi++) {
        const state = mi === 0 ? "Selected" : "Default";
        const menuComp = menuCellByKey.get(`${sk}/${state}`);
        if (menuComp) { menuItems.push(menuComp.createInstance()); }
        else { const f = figma.createFrame(); f.name = "menu"; await fillGnbMenu(f, maps, sk, state); menuItems.push(f); }
      }
      const menus = await makeSlot(comp, "Menus",
        "메뉴가 놓이는 자리. 기본은 메뉴 3개이며, GNB Menu 인스턴스를 넣고 빼서 메뉴 수를 늘리고 줄인다.",
        menuItems, menuSet ? [{ type: "COMPONENT_SET", key: menuSet.key }] : []);

      // 유틸 영역 = GNB Utility Icon 세트 all-on 변형(언어·계정·메뉴) 인스턴스 1개. (#3 사용자 결정)
      //   불필요한 "util" 래퍼 프레임 제거 — GNB Utility Icon 인스턴스를 바 레이아웃에 직접 붙인다(#2 사용자 지적 2026-06-25).
      let utilComp: ComponentNode | undefined = BUILT_COMPS["GNBUtil:full"];
      if (!utilComp) {
        const us = await getBuiltSet("GNB Utility Icon");
        if (us) utilComp = ((us.children as ComponentNode[]) || []).find((c) => c.type === "COMPONENT" && c.name.includes("language=on, menu=on, user=on"))
          ?? ((us.children as ComponentNode[]) || []).find((c) => c.type === "COMPONENT");
      }
      const util = utilComp ? utilComp.createInstance() : null;

      // 조립: center-between = [로고 | 메뉴 | 유틸] · start = [(로고+메뉴 gap64) | 유틸]
      if (al.key === "center-between") {
        comp.appendChild(logo); comp.appendChild(menus); if (util) comp.appendChild(util);
      } else {
        const leading = figma.createFrame(); leading.name = "leading"; leading.fills = [];
        leading.layoutMode = "HORIZONTAL"; leading.itemSpacing = 64;
        leading.counterAxisAlignItems = "CENTER"; leading.primaryAxisSizingMode = "AUTO"; leading.counterAxisSizingMode = "AUTO";
        // ★ leading 을 comp 에 **먼저** 붙인다 — Menus 슬롯이 owner 컴포넌트 밖으로 한 번도 나가지 않게 한다.
        //   (Bottom Sheet 도 같은 이유로 컨테이너를 owner 에 먼저 부착한다.) 슬롯은 owner 서브트리 안이면
        //   직계 자식이 아니어도 owner 의 속성으로 유지된다.
        comp.appendChild(leading);
        leading.appendChild(logo); leading.appendChild(menus);
        if (util) comp.appendChild(util);
      }

      // 하단 1px 보더 (auto-layout 흐름에서 제외 = 절대 배치)
      // ★ z-order: 메뉴 슬롯의 하단 2px 강조선보다 "뒤"에 그려야 2px 가 1px 회색선에 가리지 않는다.
      //   appendChild(맨 위) 대신 insertChild(0, …)(맨 아래)로 보내 메뉴 인스턴스가 위에 오게 한다. (사용자 결정 2026-06-25)
      const border = figma.createRectangle();
      border.name = "border"; border.resize(BAR_W, 1);
      border.fills = [boundPaint(scv(maps, "color/line/gray/subtle"))];
      try { comp.insertChild(0, border); } catch (e) { comp.appendChild(border); }
      try { (border as unknown as { layoutPositioning: string }).layoutPositioning = "ABSOLUTE"; } catch (e) { /* skip */ }
      border.x = 0; border.y = h - 1;

      setLightMode(comp, maps);
      barComps.push(comp); barCellByKey.set(`${al.name}/${sk}`, comp);
    }
  }
  const barSet = figma.combineAsVariants(barComps, figma.currentPage);
  barSet.name = "GNB";
  const barTop = originY; // GNB 바를 최상단에 배치(메뉴보다 먼저) — 표시 순서 GNB → GNB Menu
  // GNB 바는 폭이 커서(1920) 가로 그리드 대신 세로로 1열 나열(사용자 결정). 각 행 = Align·Size 1개.
  const barOrder: { comp: ComponentNode | null; label: string }[] = [];
  for (const a of aligns) for (const sk of sizeKeys) barOrder.push({ comp: barCellByKey.get(`${a.name}/${sk}`) ?? null, label: `${a.name} · ${sk}` });
  const barOpts: SpecOpts = {
    title: "GNB",
    colHeaders: [""],
    rowLabels: barOrder.map((b) => b.label),
    cellAt: (r, _c) => barOrder[r].comp,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY: barTop, cellW: BAR_W + 40, cellH: 96, rowLabelW: 160,
  };
  const barLightBottomY = await decorateSetFlat(barSet, barOpts, maps);
  bottomY = Math.max(bottomY, barLightBottomY);
  // GNB 바도 다크 스펙을 아래 배치 — 1920px 폭이라 우측 배치 불가
  barOpts.darkOffset = { x: 0, y: barLightBottomY + 80 };
  try { bottomY = Math.max(bottomY, await buildSpec(barOpts, maps)); } catch (e) { console.warn(e); }

  // 3) GNB Menu 데코레이션(배치) — 바 아래로(표시 순서 GNB → GNB Menu). 다크 스펙은 우측 밀착.
  menuOpts.originY = bottomY + 80;
  bottomY = Math.max(bottomY, await decorateSetGrouped(menuSet, menuOpts, maps));
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(menuOpts, maps)); } catch (e) { console.warn(e); }

  return { set: barSet, bottomY };
}

// ── GNB Sub Menu / GNB Sub Menu Item — 상단바 아래 펼침 하위메뉴 ────────────────
// ★ 기준 원본 = **A `gnb list`(yE5UCFEbmXJBlYJWB24Lz2 / 540:6398, 변형 regular 540:6423)** — river 결정 2026-09-08 "A로 가".
//   처음엔 B `gnb`(vHg5UOMMYI77RHH6vVVppu / 5:10245)를 기준으로 만들었으나(2단 14px·들여쓰기 8·간격 16),
//   river 가 A 노드를 짚어 대조를 요구했고 두께·크기가 달라 A 로 바꿨다. ⭐ 가 540:6423·540:6458 을 직접 읽음.
//   A 실측: 제목(1단) Bold 16 title/16B #353535 · 항목(2단) Medium 16 title/16M #555 · 들여쓰기 없음 ·
//          컬럼 안 세로 간격 24(spacing/stack/lg) · 컬럼 사이 72 · 패널 1920 흰 배경 · 하단선 1px line/gray/subtle ·
//          그림자 0 4px 4px 15% · regular = 위 32/아래 64 · compact = 상하 24 · 컬럼 묶음 **가운데 정렬**(px 320).
//   river 승인 2026-09-08(결정 ⑨·⑩ + C-2/C-3). 굵기(C-1)는 A 실측이 확정을 대신한다.
//
// ★ 값 정하는 규칙 (river 지시 "정본기준에 맞게 제작"):
//   레거시의 raw 수치를 그대로 베끼지 않고 **측정값마다 가장 가까운 정본 토큰**에 매핑한다.
//   (river 가 D-06 에서 준 "높이 매칭, 없으면 가장 가까운 값" 규칙을 간격에도 그대로 적용)
//   매핑 내역 — 왼쪽이 A 실측, 오른쪽이 이 코드가 쓰는 정본 토큰:
//     컬럼 안 세로 간격    24  → spacing/24     (정확히 일치)
//     2단 들여쓰기          0  → 없음           (A 는 들여쓰기가 없다 — B 의 8 을 버림)
//     패널 위/아래 여백 regular 32/64 → spacing/32 · spacing/64 (정확히 일치) — Depth=2depth 변형
//     패널 상하 여백   compact 24     → spacing/24 (정확히 일치)             — Depth=1depth 변형
//     컬럼 사이 간격        72  → spacing/80     (정본 토큰 64·80 의 정중앙이라 "가장 가까운 값" 규칙으로는
//                                                못 고른다. river 가 64·72·80 세 안을 렌더로 비교해 **80 확정**, 2026-09-08)
//     그림자   0 4px 4px 15%  → shadow/dropdown (정본 그림자 재사용 · 새 그림자 토큰 0건, river C-3)
//     패널 하단선 1px line/gray/subtle → 같은 정본 토큰 (A 는 상단 구분선이 아니라 하단선이다)
//   좌우 여백: A 는 px 320 에 컬럼 묶음을 **가운데 정렬**한다 — 여백 값이 아니라 정렬 규칙이다.
//     그래서 패널을 CENTER 정렬로 만들고 좌우 여백은 GNB 바와 같은 spacing/24 를 최소값으로만 둔다.
//
// ★ 색 (river 결정 ⑩·C-2):
//     1단 글자 = color/navigation/submenu/label/default (라이트 gray/800 = 실측 #353535 와 일치)
//     2단 글자 = color/navigation/label/default        (라이트 gray/600 = #555555 — 실측 #646464 는
//                색표에 없어 river 가 색표에 있는 값으로 결정. 새 색 신설 0건)
//     선택됨   = color/navigation/label/selected (1단·2단 동일 — 2단 선택 표본이 원본에 없어 river 가 1단과 같게 결정)
//     Hover    = 선택됨과 같은 색. 원본에 hover 상태가 없다 → §두 갈래 분류 (b) 사전 등록된 개선
//                (GNB Menu 도 같은 이유로 hover 를 갖고 있어 그 규칙을 그대로 따른다)
//
// ★ 굵기·크기 (A 실측 그대로): 1단(카테고리 제목) **Bold 16 = title/16B** · 2단(항목) **Medium 16 = title/16M**.
//     B 실측(둘 다 Regular, 2단 14)과 달랐고 river 가 "A로 가"로 확정했다. C-1(Medium)은 2단에 그대로 부합한다.
//
// ★ 구조: A 는 제목과 항목을 한 컬럼 안 **형제**로 나열한다(자식 중첩·들여쓰기 없음). 이 코드도 같다.
//     (B 는 2단을 자식 레이어로 넣었는데, A 로 바꾸면서 그 차이 자체가 사라졌다.)
//   Depth 축의 뜻: Item 의 1depth = 카테고리 제목(Bold) · 2depth = 항목(Medium).
//                 패널의 1depth = 항목 목록만 · 2depth = 제목 + 항목 목록(A regular).
const GNB_SUBMENU_DEPTHS = ["1depth", "2depth"] as const;
const GNB_SUBMENU_STATES = ["Default", "Hover", "Selected"];

async function buildGNBSubMenuItem(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const navc = (k: string) => `color/navigation/${k}`;
  const comps: ComponentNode[] = [];
  const byKey = new Map<string, ComponentNode>();
  for (const depth of GNB_SUBMENU_DEPTHS) {
    const first = depth === "1depth";
    for (const state of GNB_SUBMENU_STATES) {
      const comp = figma.createComponent();
      comp.name = `Depth=${depth}, State=${state}`;
      comp.layoutMode = "HORIZONTAL";
      comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO";
      comp.counterAxisAlignItems = "CENTER";
      comp.fills = [];
      // A 는 들여쓰기가 없다(B 의 8px 을 버림). 제목·항목 모두 16 — 제목은 Bold(title/16B), 항목은 Medium(title/16M).
      const colorKey = state === "Default"
        ? (first ? "submenu/label/default" : "label/default")
        : "label/selected";
      comp.appendChild(first
        ? await makeBoundText("카테고리 제목", 16, "Bold", scv(maps, navc(colorKey)), "title/16B")
        : await makeBoundText("하위 메뉴", 16, "Medium", scv(maps, navc(colorKey)), "title/16M"));
      setLightMode(comp, maps);
      comps.push(comp); byKey.set(`${depth}:${state}`, comp);
      BUILT_COMPS[`GNBSubMenuItem:${depth}:${state}`] = comp;
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "GNB Sub Menu Item"; set.x = 0; set.y = originY;
  BUILT_SETS["GNB Sub Menu Item"] = set;
  const opts: SpecOpts = {
    title: "GNB Sub Menu Item",
    colHeaders: GNB_SUBMENU_STATES,
    rowLabels: GNB_SUBMENU_DEPTHS.map((d) => d),
    cellAt: (r, c) => byKey.get(`${GNB_SUBMENU_DEPTHS[r]}:${GNB_SUBMENU_STATES[c]}`) ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 160, cellH: 44, rowLabelW: 96,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

async function buildGNBSubMenu(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const PANEL_W = 1920;             // GNB 바와 같은 폭(정본 BAR_W)
  const COLUMN_COUNT = 4;           // 실측 1depth 4컬럼
  const itemComp = async (depth: string, state: string): Promise<SceneNode> => {
    const c = BUILT_COMPS[`GNBSubMenuItem:${depth}:${state}`]
      ?? await reuseVariant("GNB Sub Menu Item", `GNBSubMenuItem:${depth}:${state}`, [`Depth=${depth}`, `State=${state}`]);
    if (c) return c.createInstance();
    throw new Error("GNB Sub Menu 는 GNB Sub Menu Item 정본이 먼저 필요합니다.");
  };
  const comps: ComponentNode[] = [];
  for (const depth of GNB_SUBMENU_DEPTHS) {
    const twoLevel = depth === "2depth";
    const comp = figma.createComponent();
    comp.name = `Depth=${depth}`;
    comp.layoutMode = "HORIZONTAL";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "AUTO";
    comp.primaryAxisAlignItems = "CENTER";   // A: 컬럼 묶음 가운데 정렬(justify-center) — 좌우 여백은 정렬 규칙이지 값이 아니다
    comp.counterAxisAlignItems = "MIN";
    comp.itemSpacing = 0;
    comp.fills = [boundPaint(scv(maps, "color/navigation/bg"))];
    const num = (t: string): Variable => requireVar(maps.foundationNumber, t, "Foundation Number");
    // A 실측 그대로: regular(제목+항목) 위 32 / 아래 64 · compact(항목만) 상하 24. 전부 정본 토큰과 정확히 일치.
    comp.setBoundVariable("paddingTop", num(twoLevel ? "spacing/32" : "spacing/24"));
    comp.setBoundVariable("paddingBottom", num(twoLevel ? "spacing/64" : "spacing/24"));
    comp.setBoundVariable("paddingLeft", num("spacing/24"));   // 최소 여백 — 실제 위치는 CENTER 정렬이 정한다
    comp.setBoundVariable("paddingRight", num("spacing/24"));
    // A: 패널 하단선 1px line/gray/subtle (GNB 바 하단선과 같은 토큰). 두 변형 공통.
    comp.strokes = [boundPaint(scv(maps, "color/line/gray/subtle"))];
    comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    comp.strokeTopWeight = 0; comp.strokeLeftWeight = 0; comp.strokeRightWeight = 0; comp.strokeBottomWeight = 1;
    comp.resize(PANEL_W, 100);
    // 그림자 = 정본 shadow/dropdown 재사용(river C-3) — 새 그림자 토큰을 만들지 않는다.
    try { (comp as any).effects = boundShadowEffects(maps, "shadow/dropdown"); } catch (e) { /* 환경 미지원 */ }

    // 컬럼 묶음 = Figma 슬롯("Columns") — 메뉴 개수를 넣고 빼서 조절한다(GNB 바 "Menus" 슬롯과 같은 방식).
    const columns: SceneNode[] = [];
    for (let ci = 0; ci < COLUMN_COUNT; ci++) {
      const col = figma.createFrame();
      col.name = "column";
      col.layoutMode = "VERTICAL";
      col.primaryAxisSizingMode = "AUTO"; col.counterAxisSizingMode = "AUTO";
      col.counterAxisAlignItems = "MIN";
      // 24 = A `regular`(540:6423) 실측(spacing/stack/lg). A 의 `compact` 판은 20 이지만 두 깊이를 한 리듬으로
      //   통일한다 — river 결정 2026-09-08(24·20 을 렌더로 비교해 24 확정).
      col.itemSpacing = 24;
      col.setBoundVariable("itemSpacing", requireVar(maps.foundationNumber, "spacing/24", "Foundation Number"));
      col.fills = [];
      if (twoLevel) {
        // A regular 그대로: 카테고리 제목(1depth, Bold) 하나 + 항목(2depth, Medium) 여러 개. 첫 컬럼 첫 항목만 Selected.
        col.appendChild(await itemComp("1depth", "Default"));
        col.appendChild(await itemComp("2depth", ci === 0 ? "Selected" : "Default"));
        col.appendChild(await itemComp("2depth", "Default"));
        col.appendChild(await itemComp("2depth", "Default"));
        col.appendChild(await itemComp("2depth", "Default"));
      } else {
        // 항목 목록만(A compact 계열). 첫 컬럼 첫 항목만 Selected.
        col.appendChild(await itemComp("2depth", ci === 0 ? "Selected" : "Default"));
        col.appendChild(await itemComp("2depth", "Default"));
        col.appendChild(await itemComp("2depth", "Default"));
      }
      columns.push(col);
    }
    const wrap = await makeSlot(comp, "Columns",
      "하위메뉴 컬럼이 놓이는 자리. 기본은 4컬럼이며, GNB Sub Menu Item 인스턴스를 넣고 빼서 메뉴 수와 깊이를 조절한다.",
      columns, BUILT_SETS["GNB Sub Menu Item"] ? [{ type: "COMPONENT_SET", key: BUILT_SETS["GNB Sub Menu Item"].key }] : [],
      { layoutMode: "HORIZONTAL", primaryAxisSizingMode: "AUTO", counterAxisSizingMode: "AUTO",
        primaryAxisAlignItems: "MIN", counterAxisAlignItems: "MIN", itemSpacing: 80 });  // A 실측 72 → spacing/80 (아래 바인딩 참조)
    // makeSlot 은 itemSpacing 을 숫자로 대입만 하고 변수에 묶지 않는다 — 여기서 직접 바인딩한다.
    //   (🤖 component-verifier 2026-09-08 적발: 매핑표는 spacing/80 이라 적었는데 코드는 생짜 80 이었다.)
    try { wrap.setBoundVariable("itemSpacing", requireVar(maps.foundationNumber, "spacing/80", "Foundation Number")); } catch (e) { /* 환경 미지원 */ }
    // ⚠️ layoutGrow 를 걸지 않는다 — 걸면 슬롯이 안쪽 폭을 다 차지해 부모의 CENTER 가 정렬할 여백을 잃고
    //   슬롯 자신의 MIN 이 컬럼을 좌측에 붙인다(🤖 component-verifier 2026-09-08 적발). 슬롯은 hug 로 두고
    //   가운데 정렬은 부모(primaryAxisAlignItems=CENTER)가 한다 — GNB 바의 Menus 슬롯과 같은 방식.

    setLightMode(comp, maps);
    comps.push(comp);
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "GNB Sub Menu"; set.x = 0; set.y = originY;
  BUILT_SETS["GNB Sub Menu"] = set;
  const opts: SpecOpts = {
    title: "GNB Sub Menu",
    colHeaders: [""],
    rowLabels: GNB_SUBMENU_DEPTHS.map((d) => d),
    cellAt: (r, _c) => comps[r] ?? null,
    // 폭 1920 — GNB 바와 같은 이유로 다크 스펙을 우측이 아니라 아래에 쌓는다.
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: PANEL_W + 40, cellH: 320, rowLabelW: 160,
    leftAlignCells: true,
  };
  const lightBottom = await decorateSetFlat(set, opts, maps);
  opts.darkOffset = { x: 0, y: lightBottom + 80 };
  let bottomY = lightBottom;
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Date Picker — 트리거(form-control 재사용) + 캘린더 패널(color/date-picker/*) ─
// 정본: pages/components.html / Figma 540:3794(input)·540:4216(PC calendar).
// 미결 HD(needs-decision): componentSetKey 미확정 · 모바일 인터랙션(bottom sheet vs inline) 미정 → 모바일 패널은 생성하지 않음.
// 트리거는 Select 와 동일 구조(form-control), Open 상태에 PC 캘린더 패널을 부착.

// ── Calendar Cell / Calendar Tile (lazy-build 컴포넌트 세트) ───────────────────
// V2.4 정본: calendar_cell(540:4167) · calendar_tile(540:4209), fileKey yE5UCFEbmXJBlYJWB24Lz2.
// Calendar·Date Picker(Open) 가 이 세트의 variant 를 인스턴스로 사용(숫자/라벨 override).
// lazy-build: 소비자가 먼저 호출해도 1회만 빌드(BUILT_SETS 캐시). CATEGORIES 는 위치만 결정.
const DP = (k: string) => `color/date-picker/${k}`;

// ── 달력 크기 정본 (MD·SM) ──────────────────────────────────────────────────
// Figma 원본 pc_timepicker_calendar(파일 P8YvnCdGkQLDNVQhW74ZZW) 실측 — 2026-09-04.
//   MD: Date 1980:49729 · Year 1980:49792 / SM: Date 3381:15306 · Year 6434:270653
//   Range 밴드 SM 실측: 6434:272680(풀폭 x0 w33) · 272679(시작 x16.5 w16.5) · 272682(끝 x0 w16.5), 둘 다 y5.25 h22.5
// SM 은 river 지시로 신설(2026-09-04): "데이트피커 캘린더 크기가 두가지인데 현재는 md밖에 없어. sm도 구성해줘".
//   같은 지시에서 "입력창이 작으면 달력도 자동으로 작게"가 결정돼, XXSM·XSM 트리거는 SM 달력을 연다
//   (종전 주석 "캘린더 패널은 사이즈 불변(356px 단일)" 2026-06-25 결정을 대체한다).
// ⚠️ 원본 그대로 옮긴 값이다 — 정규화·반올림하지 않았다. SM 의 소수(22.5·16.5·5.25)와
//   Date 뷰/타일 뷰의 서로 다른 헤더 높이(24 vs 32)·하단 여백(16 vs 20)은 원본의 실제 모습이다.
// ⚠️ MD 값은 종전과 완전히 동일하다 — 이번 변경으로 MD 는 1px 도 움직이지 않는다.
// ⚠️ **원본에서 읽지 못한 것**(🤖 component-verifier 2026-09-04 확인): 패널의 cornerRadius(4)와
//   shadow 는 두 크기 원본 어디에도 토큰이 없어 확인 불가라, MD 것을 그대로 재사용했다 — "원본 그대로"가
//   아니라 **미확인·MD 재사용**이다. 테두리 두께 1(border-width/default)만 두 크기 원본에 실재해 확인됐다.
// ⚠️ 헤더 폭(MD 308 · SM 231)은 실측이 아니라 **패널폭 − 좌우 여백에서 유도**한 값이다. 원본 헤더 프레임은
//   패널 전체 폭(MD 356 · SM 267)이고 화살표가 좌우 비대칭으로 놓여 있는데(MD 좌56/우348 · SM 좌48/우267),
//   코드는 두 크기 모두 좌우 대칭으로 정규화한다. 이는 MD 에서 이미 승인돼 나간 기존 처리이며 SM 도 같게 맞췄다.
type CalSize = "MD" | "SM";
interface CalGeo {
  cell: number; inner: number; cellFont: number;      // 날짜칸 outer · 안쪽 원 · 숫자 크기
  bandY: number; bandH: number;                       // Range 밴드 세로(가로는 칸 폭에서 유도)
  tileW: number; tileH: number; tileFont: number; tileGapX: number; tileGapY: number;
  panelW: number; padX: number; padTop: number;
  panelHDate: number; padBottomDate: number; hdrHDate: number; gapDate: number;
  panelHTile: number; padBottomTile: number; hdrHTile: number; gapTile: number;
  hdrFont: number;
}
const CAL_GEO: Record<CalSize, CalGeo> = {
  // MD — 종전 값 그대로. 패널 352 는 원본(Date 356 · Tile 364)을 단일 높이로 정규화한 기존 정본 값이며
  //   이번 작업에서 손대지 않는다(원본과의 차이는 별도 보고 — 이 작업의 범위가 아니다).
  MD: {
    cell: 44, inner: 30, cellFont: 16, bandY: 7, bandH: 30,
    tileW: 88, tileH: 56, tileFont: 16, tileGapX: 12, tileGapY: 12,
    panelW: 356, padX: 24, padTop: 20,
    panelHDate: 352, padBottomDate: 20, hdrHDate: 32, gapDate: 16,
    panelHTile: 352, padBottomTile: 20, hdrHTile: 32, gapTile: 20,
    hdrFont: 24,
  },
  // SM — 원본 실측. 폭 267 = 좌우 18 + 7×33. Date 높이 266 = 16+24+12+33+(5×33)+16.
  //   타일 뷰 높이 276 = 16+32+12+(4×40+3×12)+20. 타일 그리드(218)는 MD 와 같은 중앙 정렬이라
  //   좌우 안쪽 여백이 24.5 가 되는데, 원본(폭 266·여백 24)과 0.5px 차이다.
  SM: {
    cell: 33, inner: 22.5, cellFont: 12, bandY: 5.25, bandH: 22.5,
    tileW: 68, tileH: 40, tileFont: 12, tileGapX: 7, tileGapY: 12,
    panelW: 267, padX: 18, padTop: 16,
    panelHDate: 266, padBottomDate: 16, hdrHDate: 24, gapDate: 12,
    panelHTile: 276, padBottomTile: 20, hdrHTile: 32, gapTile: 12,
    hdrFont: 18,
  },
};
const CAL_SIZES: CalSize[] = ["MD", "SM"];

// Calendar Cell — axes Size={MD,SM} × Type={Standard,Range} × State. Standard=6(Hover·Selected Hover 포함)·Range=4(비대칭).
// 숫자 텍스트 layer 이름 = "num". 구조: outer(center) > [Range: 밴드 Rectangle(absolute)] + inner 원(센터) > 숫자.
async function calCellCompsForSize(maps: BuildMaps, size: CalSize): Promise<Record<string, ComponentNode>> {
  // [innerFill, innerStroke, textKey] (V2.4 실측 — selected stroke = border/today)
  // Hover = Default 와 동일하되 inner 배경만 cell/bg/hover(gray/50) — Calendar Tile Hover(tile/bg/hover) 패턴 미러링.
  //   Standard 에만 추가 — range 는 (B)유형(파란 배경)이라 회색 hover 로 덮지 않는다.
  // "Selected Hover" = 선택된 파란 칸의 hover. 회색이 아니라 한 단계 진한 파랑(cell/bg/selected-hover)이고,
  //   테두리도 같은 변수를 쓴다 — 테두리만 border/today(blue/400)에 남으면 채움(blue/500)보다 밝은 링이 생긴다
  //   (river 지시 2026-09-04). 웹 date-picker.css 의 [data-state="selected"]:hover 규칙과 한 벌이다.
  //   정본 배선 근거: river 승인 2026-09-08(메커니즘 승인 화면 M-7, 선택 A="웹이 맞다").
  //   경위·감사 기록 = reports/canon-approval-audit-2026-09-07.md §9.
  const STD: Record<string, [string, string, string]> = {
    Default:            ["cell/bg/today",           "cell/bg/today",           "text/secondary"],
    Hover:              ["cell/bg/hover",           "cell/bg/hover",           "text/secondary"],
    Today:              ["cell/bg/today",           "cell/border/today",       "text/today"],
    Selected:           ["cell/bg/selected",        "cell/border/today",       "text/selected"],
    "Selected Hover":   ["cell/bg/selected-hover",  "cell/bg/selected-hover",  "text/selected"],
    Disabled:           ["cell/bg/today",           "cell/bg/today",           "text/disabled"],
  };
  // Range: [innerFill, innerStroke, textKey] — 밴드는 absolute, 세로는 CalGeo(bandY·bandH)
  const RNG: Record<string, [string, string, string]> = {
    Default:  ["cell/bg/range",    "cell/bg/range",     "text/secondary"],
    Start:    ["cell/bg/today",    "cell/border/today", "text/today"],
    End:      ["cell/bg/selected", "cell/border/today", "text/selected"],
    Disabled: ["cell/bg/range",    "cell/bg/range",     "text/disabled"],
  };
  // 밴드 가로 기하 = 칸 폭에서 유도. MD(44): 풀폭 44 · 시작 x22 w22 · 끝 x0 w22 (종전 값 그대로).
  //   SM(33): 풀폭 33 · 시작 x16.5 w16.5 · 끝 x0 w16.5 — 원본 실측과 일치.
  function bandGeo(state: string, cw: number): [number, number] {
    if (state === "Start") return [cw / 2, cw / 2];
    if (state === "End") return [0, cw / 2];
    return [0, cw];
  }

  // inner 원 + 숫자("num") 생성
  async function makeInner(g: CalGeo, fillKey: string, strokeKey: string, textKey: string): Promise<FrameNode> {
    const inner = figma.createFrame(); inner.name = "inner"; bindRadius(inner, maps, "radius/full");
    inner.layoutMode = "HORIZONTAL"; inner.primaryAxisAlignItems = "CENTER"; inner.counterAxisAlignItems = "CENTER";
    inner.primaryAxisSizingMode = "FIXED"; inner.counterAxisSizingMode = "FIXED"; inner.resize(g.inner, g.inner);
    inner.fills = [boundPaint(scv(maps, DP(fillKey)))];
    inner.strokes = [boundPaint(scv(maps, DP(strokeKey)))]; inner.strokeWeight = 1; inner.strokeAlign = "INSIDE";
    const t = await makeBoundText("1", g.cellFont, "Medium", scv(maps, DP(textKey)));
    t.name = "num";
    inner.appendChild(t);
    return inner;
  }

  const comps: ComponentNode[] = [];
  const variants: Record<string, ComponentNode> = {};

  // outer 컴포넌트 — auto-layout(center). Range 밴드는 absolute 자식.
  function makeOuter(g: CalGeo, name: string): ComponentNode {
    const comp = figma.createComponent();
    comp.name = name;
    comp.layoutMode = "HORIZONTAL"; comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED"; comp.resize(g.cell, g.cell);
    comp.fills = []; comp.clipsContent = true;
    return comp;
  }

  const g = CAL_GEO[size];
  // Type=Standard (Hover 는 Default 뒤 = 상호작용 순서)
  for (const state of ["Default", "Hover", "Today", "Selected", "Selected Hover", "Disabled"]) {
    const [f, st, txt] = STD[state];
    const comp = makeOuter(g, `Size=${size}, Type=Standard, State=${state}`);
    comp.appendChild(await makeInner(g, f, st, txt));
    comps.push(comp); variants[`${size}:Standard:${state}`] = comp;
  }
  // Type=Range — 밴드(absolute) + inner 원
  for (const state of ["Default", "Start", "End", "Disabled"]) {
    const [f, st, txt] = RNG[state];
    const [bx, bw] = bandGeo(state, g.cell);
    const comp = makeOuter(g, `Size=${size}, Type=Range, State=${state}`);
    const band = figma.createRectangle();
    band.name = "band"; band.resize(bw, g.bandH);
    band.fills = [boundPaint(scv(maps, DP("cell/bg/range")))]; band.strokes = [];
    comp.appendChild(band);
    // 밴드는 absolute(원 아래 z) — mock/구버전 대비 try.
    try { (band as unknown as { layoutPositioning: string }).layoutPositioning = "ABSOLUTE"; } catch (e) { /* skip */ }
    try { band.x = bx; band.y = g.bandY; } catch (e) { /* skip */ }
    comp.appendChild(await makeInner(g, f, st, txt));
    comps.push(comp); variants[`${size}:Range:${state}`] = comp;
  }
  return variants;
}

// ⚠️ 재설치 이관 한계(🤖 component-verifier 2026-09-04): Calendar Cell·Tile 은 isDepSet 이라 재설치 때
//   항상 러너가 돌아 빠진 크기가 채워지지만, **Calendar 패널 세트는 이미 있으면 통째로 skip** 된다
//   (설치기 공통 갱신 모델 — 기존 인스턴스 보호). 그 상태에서는 Calendar 가 Size 축 없는 3 variant 로 남고,
//   buildDatePicker 폴백이 Size=SM 을 못 찾아 State=Date(=MD 356)로 조용히 떨어진다 → XSM·XXSM 이
//   계속 큰 달력을 연다. 오류 없이 종전 동작으로 퇴화하는 것이라 파괴적이지는 않지만,
//   **기존 설치본에서 SM 을 보려면 캔버스의 Calendar 세트를 지우고 다시 설치해야 한다.**
// Calendar Cell 세트 — 두 크기를 한 세트로 묶는다(축 Size × Type × State = 20 variant:
//   Standard 6 + Range 4, × Size 2). Standard 는 2026-09-09 에 "Selected Hover" 가 늘어 6 이 됐다.
// ⚠️ 위 재설치 이관 한계는 **상태 신설에도 그대로 적용된다** — fillMissingCalSizes 는 빠진 "크기"만
//   채우고(그 크기의 키가 하나라도 있으면 통째로 skip), 빠진 "상태"는 채우지 않는다. 즉 이미 설치된
//   파일에 재설치해도 "Selected Hover" variant 는 추가되지 않고, 스펙 표만 6열로 늘어 그 열이 빈다
//   (오류는 아니다 — renderFlat 은 cellAt 이 null 이면 셀을 건너뛴다).
//   **기존 설치본에서 이 상태를 보려면 캔버스의 Calendar Cell 세트를 지우고 다시 설치해야 한다.**
//   상태 단위까지 채우도록 넓히는 것은 기존 인스턴스 보호 규칙과 충돌 검토가 필요해 하지 않았다
//   (🤖 component-verifier 2026-09-09 (c) 지적, ⭐ 가 (A)=명시 유지 선택).
async function buildCalendarCell(maps: BuildMaps): Promise<{ set: ComponentSetNode; variants: Record<string, ComponentNode> }> {
  const variants: Record<string, ComponentNode> = {};
  for (const size of CAL_SIZES) Object.assign(variants, await calCellCompsForSize(maps, size));
  const set = figma.combineAsVariants(Object.values(variants), figma.currentPage);
  set.name = "Calendar Cell";
  // ⚠️ 셀 마스터에 모드를 핀하지 않는다(setLightMode 금지) — 인스턴스가 부모(패널/스펙) 모드 상속.
  return { set, variants };
}

// Calendar Tile — axes Size={MD,SM} × State={Default,Hover,Selected,Disabled}. 라벨 layer 이름 = "label".
// V2.4 실측(540:4209): root frame 의 fill+stroke(둘 다), selected border = color/date-picker/cell/border/today.
// 크기: MD 88×56 · SM 68×40 (Figma 6434:270661 실측), cornerRadius 는 두 크기 공통 4(radius/control/sm).
async function calTileCompsForSize(maps: BuildMaps, size: CalSize): Promise<Record<string, ComponentNode>> {
  // [bgKey, borderKey, textKey, sampleLabel]
  const TILE: Record<string, [string, string, string, string]> = {
    Default:  ["tile/bg/default",  "tile/border/default",  "text/primary",  "2022"],
    // Hover bg = Secondary 버튼 hover foundation 동일(gray/50·gray-dark/200) → tile/bg/hover 신규(사용자 결정 2026-06-25).
    Hover:    ["tile/bg/hover",    "tile/border/default",  "text/primary",  "2023"],
    Selected: ["tile/bg/selected", "cell/border/today",    "text/today",    "2025"],
    Disabled: ["tile/bg/disabled", "tile/border/disabled", "text/disabled", "2021"],
  };
  const variants: Record<string, ComponentNode> = {};
  const g = CAL_GEO[size];
  for (const state of ["Default", "Hover", "Selected", "Disabled"]) {
    const [bg, bd, txt, label] = TILE[state];
    const comp = figma.createComponent();
    comp.name = `Size=${size}, State=${state}`;
    comp.layoutMode = "HORIZONTAL"; comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED"; comp.resize(g.tileW, g.tileH);
    comp.cornerRadius = 4; comp.clipsContent = true;
    comp.fills = [boundPaint(scv(maps, DP(bg)))];
    comp.strokes = [boundPaint(scv(maps, DP(bd)))]; comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    const t = await makeBoundText(label, g.tileFont, "Medium", scv(maps, DP(txt)));
    t.name = "label";
    comp.appendChild(t);
    variants[`${size}:${state}`] = comp;
  }
  return variants;
}

// Calendar Tile 세트 — 두 크기를 한 세트로(축 Size × State = 8 variant).
async function buildCalendarTile(maps: BuildMaps): Promise<{ set: ComponentSetNode; variants: Record<string, ComponentNode> }> {
  const variants: Record<string, ComponentNode> = {};
  for (const size of CAL_SIZES) Object.assign(variants, await calTileCompsForSize(maps, size));
  const set = figma.combineAsVariants(Object.values(variants), figma.currentPage);
  set.name = "Calendar Tile";
  return { set, variants };
}

// lazy-build 캐시 — 소비자(Calendar/Date Picker)·레이아웃 등록기 모두 동일 인스턴스를 공유.
let _calCell: { set: ComponentSetNode; variants: Record<string, ComponentNode> } | null = null;
let _calTile: { set: ComponentSetNode; variants: Record<string, ComponentNode> } | null = null;
// variant 컴포넌트 이름("Type=Standard, State=Default")에서 prop 값을 뽑는다.
function variantProp(comp: ComponentNode, prop: string): string | null {
  const m = comp.name.match(new RegExp(`(?:^|, )${prop}=([^,]+)`));
  return m ? m[1].trim() : null;
}
// 캔버스에 이미 있는 Calendar Cell 세트를 재사용하기 위해 자식에서 variants 맵을 복원.
//   key 형식 = `${Size}:${Type}:${State}` (buildCalendarCell 과 동일).
// ★ Size 축 신설(2026-09-04) 이전에 설치된 세트는 variant 이름에 `Size=` 가 없다.
//   그 경우 **이름만 `Size=MD, …` 로 고쳐** MD 로 편입한다 — 컴포넌트 노드 자체는 그대로라
//   기존 인스턴스가 끊기지 않는다(제거/재빌드하면 skip 된 소비자의 인스턴스가 detach 된다).
function reconstructCalCellVariants(set: ComponentSetNode): Record<string, ComponentNode> {
  const variants: Record<string, ComponentNode> = {};
  for (const ch of set.children) {
    if (ch.type !== "COMPONENT") continue;
    const t = variantProp(ch, "Type"), st = variantProp(ch, "State");
    if (!t || !st) continue;
    let sz = variantProp(ch, "Size");
    if (!sz) { sz = "MD"; ch.name = `Size=MD, ${ch.name}`; }
    variants[`${sz}:${t}:${st}`] = ch;
  }
  return variants;
}
// Calendar Tile 세트 variants 복원. key = `${Size}:${State}`. Size 없는 구버전은 MD 로 개명 편입.
function reconstructCalTileVariants(set: ComponentSetNode): Record<string, ComponentNode> {
  const variants: Record<string, ComponentNode> = {};
  for (const ch of set.children) {
    if (ch.type !== "COMPONENT") continue;
    const st = variantProp(ch, "State");
    if (!st) continue;
    let sz = variantProp(ch, "Size");
    if (!sz) { sz = "MD"; ch.name = `Size=MD, ${ch.name}`; }
    variants[`${sz}:${st}`] = ch;
  }
  return variants;
}
/** 기존 세트에 빠진 크기를 **덧붙여** 채운다(세트 통째 재빌드 금지 — 기존 인스턴스 보존). */
async function fillMissingCalSizes(
  set: ComponentSetNode,
  variants: Record<string, ComponentNode>,
  make: (size: CalSize) => Promise<Record<string, ComponentNode>>,
): Promise<Record<string, ComponentNode>> {
  for (const size of CAL_SIZES) {
    if (Object.keys(variants).some((k) => k.startsWith(`${size}:`))) continue;
    const added = await make(size);
    for (const comp of Object.values(added)) set.appendChild(comp);
    Object.assign(variants, added);
  }
  return variants;
}
async function getOrBuildCalendarCell(maps: BuildMaps): Promise<{ set: ComponentSetNode; variants: Record<string, ComponentNode> }> {
  if (_calCell && !_calCell.set.removed) return _calCell;
  // 재설치 보존: 캔버스에 기존 세트가 있으면 제거/재빌드하지 않고 그대로 재사용한다.
  //   (재빌드+제거하면 skip 된 Calendar/Date Picker 인스턴스가 가리키던 옛 세트가 사라져 detach/깨짐 — Figma 자동 remap 없음.)
  const existing = await getBuiltSet("Calendar Cell");
  if (existing && !existing.removed && existing.children.some((c) => c.type === "COMPONENT")) {
    const variants = await fillMissingCalSizes(existing, reconstructCalCellVariants(existing), (sz) => calCellCompsForSize(maps, sz));
    _calCell = { set: existing, variants };
  } else {
    _calCell = await buildCalendarCell(maps);
  }
  BUILT_SETS["Calendar Cell"] = _calCell.set;
  for (const [k, c] of Object.entries(_calCell.variants)) BUILT_COMPS[`CalendarCell:${k}`] = c;
  return _calCell;
}
async function getOrBuildCalendarTile(maps: BuildMaps): Promise<{ set: ComponentSetNode; variants: Record<string, ComponentNode> }> {
  if (_calTile && !_calTile.set.removed) return _calTile;
  const existing = await getBuiltSet("Calendar Tile");
  if (existing && !existing.removed && existing.children.some((c) => c.type === "COMPONENT")) {
    const variants = await fillMissingCalSizes(existing, reconstructCalTileVariants(existing), (sz) => calTileCompsForSize(maps, sz));
    _calTile = { set: existing, variants };
  } else {
    _calTile = await buildCalendarTile(maps);
  }
  BUILT_SETS["Calendar Tile"] = _calTile.set;
  for (const [k, c] of Object.entries(_calTile.variants)) BUILT_COMPS[`CalendarTile:${k}`] = c;
  return _calTile;
}

// Calendar Cell 인스턴스 — Type/State 선택 후 숫자("num") override.
async function calCellInstance(cell: { variants: Record<string, ComponentNode> }, key: string, day: number): Promise<InstanceNode> {
  const master = cell.variants[key] ?? cell.variants["MD:Standard:Default"];
  const inst = master.createInstance();
  const t = (inst.findOne((n) => n.name === "num" && n.type === "TEXT") ?? inst.findOne((n) => n.type === "TEXT")) as TextNode | null;
  if (t) { await figma.loadFontAsync(t.fontName as FontName); t.characters = String(day); }
  return inst;
}

// Calendar Tile 인스턴스 — State 선택 후 라벨("label") override.
async function calTileInstance(tile: { variants: Record<string, ComponentNode> }, key: string, label: string): Promise<InstanceNode> {
  const master = tile.variants[key] ?? tile.variants["MD:Default"];
  const inst = master.createInstance();
  const t = (inst.findOne((n) => n.name === "label" && n.type === "TEXT") ?? inst.findOne((n) => n.type === "TEXT")) as TextNode | null;
  if (t) { await figma.loadFontAsync(t.fontName as FontName); t.characters = label; }
  return inst;
}

// day kind → Calendar Cell variant key (Standard). other-month = V2.4 미존재 → Standard:Disabled 매핑(보고).
function dayKindToCellKey(kind: "normal" | "other" | "today" | "selected" | "disabled"): string {
  if (kind === "today") return "Standard:Today";
  if (kind === "selected") return "Standard:Selected";
  if (kind === "disabled" || kind === "other") return "Standard:Disabled";
  return "Standard:Default";
}

/** PC 캘린더 패널 프레임 (356px, auto-layout). 모든 color/date-picker/* 변수를 시연. */
// ── Calendar (독립 컴포넌트 세트 — State=Date/Year/Month) ────────────────────
// Figma 540:4216 기준. 크기: 356×352. Date=달력 그리드, Year=연도 타일(4×3), Month=월 타일(4×3).
// Date Picker Open 상태가 이 세트의 State=Date 인스턴스를 부착(anatomy gate: "calendar-panel" raw 프레임 금지).
async function buildCalendar(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const dp  = (k: string) => `color/date-picker/${k}`;
  // Calendar Cell / Tile 선행 빌드(lazy) — day 그리드·연월 타일을 인스턴스로 사용.
  const calCell = await getOrBuildCalendarCell(maps);
  const calTile = await getOrBuildCalendarTile(maps);
  const CHEV_L = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CHEV_R = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // 패널 컴포넌트 초기화 + 내부 content-frame(gap 있음) 반환.
  //   패널 높이·하단 여백·뷰 간격은 크기(CalGeo)와 뷰(Date/타일)마다 다르다 — 원본 그대로.
  function initComp(g: CalGeo, compName: string, panelH: number, padBottom: number, vGap: number): [ComponentNode, FrameNode] {
    const comp = figma.createComponent();
    comp.name = compName;
    comp.layoutMode = "VERTICAL";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
    comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.resize(g.panelW, panelH);
    comp.paddingLeft = g.padX; comp.paddingRight = g.padX;
    comp.paddingTop = g.padTop; comp.paddingBottom = padBottom; comp.itemSpacing = 0;
    comp.cornerRadius = 4;
    comp.fills = [boundPaint(scv(maps, dp("panel/bg")))];
    comp.strokes = [boundPaint(scv(maps, dp("panel/border")))];
    comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    comp.clipsContent = true;
    // 파서·토큰 오류는 try 밖에서 던지게 둔다(그림자가 조용히 사라지는 것 방지).
    const calEffects = shadowEffects("shadow/dropdown");  // 정본 파생(옛 하드코딩과 동일 값)
    try { (comp as any).effects = calEffects; } catch (_) { /* 환경 미지원 */ }
    const inner = figma.createFrame();
    inner.name = "content"; inner.fills = [];
    inner.layoutMode = "VERTICAL"; inner.primaryAxisSizingMode = "AUTO"; inner.counterAxisSizingMode = "AUTO";
    inner.counterAxisAlignItems = "CENTER"; inner.itemSpacing = vGap;
    comp.appendChild(inner); inner.layoutAlign = "STRETCH";
    return [comp, inner];
  }

  // 공용 헤더 (이전·라벨·다음) — 폭 = 패널폭 - 좌우 여백, 높이·글자 크기는 CalGeo.
  async function makeCalHdr(g: CalGeo, hdrH: number, label: string): Promise<FrameNode> {
    const hdr = figma.createFrame(); hdr.name = "header"; hdr.fills = [];
    hdr.layoutMode = "HORIZONTAL"; hdr.primaryAxisSizingMode = "FIXED"; hdr.counterAxisSizingMode = "FIXED";
    hdr.primaryAxisAlignItems = "SPACE_BETWEEN"; hdr.counterAxisAlignItems = "CENTER";
    hdr.resize(g.panelW - g.padX * 2, hdrH);
    // 좌측 화살표: 불필요한 래퍼 프레임 해제(wrap:false) — 우측(rotation 0, 래퍼 없음)과 동일 구조.
    // 헤더 이전/다음 < > = 전용 date-picker/icon/* (default). 라벨 텍스트는 text/primary 유지.
    // 화살표 아이콘은 두 크기 공통 24×24 — 원본에서 SM 도 줄지 않았다(실측 3381:15310).
    hdr.appendChild(await makeIconInstance("chevron", scv(maps, dp("icon/default")), 0, CHEV_L, 180, { wrap: false }));
    hdr.appendChild(await makeBoundText(label, g.hdrFont, "Bold", scv(maps, dp("text/primary"))));
    hdr.appendChild(await makeIconInstance("chevron", scv(maps, dp("icon/default")), 0, CHEV_R, 0));
    return hdr;
  }

  // 연도/월 타일 — Calendar Tile 인스턴스(라벨 override). disabled=Disabled, 그 외=Default.
  async function makeYMTile(size: CalSize, label: string, disabled: boolean): Promise<SceneNode> {
    return calTileInstance(calTile, `${size}:${disabled ? "Disabled" : "Default"}`, label);
  }

  // 타일 행 3개 (가로 gap = CalGeo.tileGapX — MD 12 · SM 7)
  async function makeYMRow(g: CalGeo, size: CalSize, labels: string[], dis: boolean[]): Promise<FrameNode> {
    const row = figma.createFrame(); row.name = "tile-row"; row.fills = [];
    row.layoutMode = "HORIZONTAL"; row.primaryAxisSizingMode = "AUTO"; row.counterAxisSizingMode = "AUTO";
    row.counterAxisAlignItems = "CENTER"; row.itemSpacing = g.tileGapX;
    for (let i = 0; i < labels.length; i++) row.appendChild(await makeYMTile(size, labels[i], dis[i] ?? false));
    return row;
  }

  type CalCell = { day: number; kind: "normal" | "other" | "today" | "selected" | "disabled" };
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: CalSize; state: string }[] = [];

  for (const size of CAL_SIZES) {
    const g = CAL_GEO[size];
    const CW = (g.panelW - g.padX * 2) / 7; // 요일/날짜 칸 폭 — MD 44 · SM 33

    // ── State=Date (달력 그리드 — 2025.01 샘플) ────────────────────────────
    const [dateComp, dateInner] = initComp(g, `Size=${size}, State=Date`, g.panelHDate, g.padBottomDate, g.gapDate);
    dateInner.appendChild(await makeCalHdr(g, g.hdrHDate, "2025.01"));

    const calBody = figma.createFrame(); calBody.name = "cal-body"; calBody.fills = [];
    calBody.layoutMode = "VERTICAL"; calBody.primaryAxisSizingMode = "AUTO"; calBody.counterAxisSizingMode = "AUTO";
    calBody.counterAxisAlignItems = "MIN"; calBody.itemSpacing = 0;
    dateInner.appendChild(calBody);

    // 요일 헤더 (월~일)
    const wkRow = figma.createFrame(); wkRow.name = "weekdays"; wkRow.fills = [];
    wkRow.layoutMode = "HORIZONTAL"; wkRow.itemSpacing = 0;
    wkRow.primaryAxisSizingMode = "AUTO"; wkRow.counterAxisSizingMode = "AUTO";
    calBody.appendChild(wkRow);
    for (const ch of ["월", "화", "수", "목", "금", "토", "일"]) {
      const cell = figma.createFrame(); cell.name = "wk"; cell.fills = [];
      cell.layoutMode = "HORIZONTAL"; cell.primaryAxisAlignItems = "CENTER"; cell.counterAxisAlignItems = "CENTER";
      cell.primaryAxisSizingMode = "FIXED"; cell.counterAxisSizingMode = "FIXED"; cell.resize(CW, g.cell);
      cell.appendChild(await makeBoundText(ch, g.cellFont, "Medium", scv(maps, dp("text/primary"))));
      wkRow.appendChild(cell);
    }

    // 5주×7일 그리드 (2025.01 기준: 1일=수요일, 월요일 시작)
    const calGrid: CalCell[] = [{ day: 30, kind: "other" }, { day: 31, kind: "other" }];
    for (let d = 1; d <= 31; d++) {
      calGrid.push({ day: d, kind: d === 10 ? "today" : d === 17 ? "selected" : d === 25 ? "disabled" : "normal" });
    }
    let nm = 1; while (calGrid.length < 35) calGrid.push({ day: nm++, kind: "other" });

    for (let r = 0; r < 5; r++) {
      const weekRow = figma.createFrame(); weekRow.name = "week"; weekRow.fills = [];
      weekRow.layoutMode = "HORIZONTAL"; weekRow.itemSpacing = 0;
      weekRow.primaryAxisSizingMode = "AUTO"; weekRow.counterAxisSizingMode = "AUTO";
      calBody.appendChild(weekRow);
      for (let c = 0; c < 7; c++) {
        const gcell = calGrid[r * 7 + c];
        // day = Calendar Cell 인스턴스(Standard). other-month = Standard:Disabled 매핑(V2.4 미존재 — 보고).
        const inst = await calCellInstance(calCell, `${size}:${dayKindToCellKey(gcell.kind)}`, gcell.day);
        weekRow.appendChild(inst);
      }
    }
    setLightMode(dateComp, maps);

    // ── State=Year (연도 선택 — 4×3 타일, 2021~2032 샘플) ────────────────
    const [yearComp, yearInner] = initComp(g, `Size=${size}, State=Year`, g.panelHTile, g.padBottomTile, g.gapTile);
    yearInner.appendChild(await makeCalHdr(g, g.hdrHTile, "2025"));
    const yearGrid = figma.createFrame(); yearGrid.name = "year-grid"; yearGrid.fills = [];
    yearGrid.layoutMode = "VERTICAL"; yearGrid.primaryAxisSizingMode = "AUTO"; yearGrid.counterAxisSizingMode = "AUTO";
    yearGrid.counterAxisAlignItems = "CENTER"; yearGrid.itemSpacing = g.tileGapY;
    for (const [ls, ds] of [
      [["2021", "2022", "2023"], [true,  false, false]],
      [["2024", "2025", "2026"], [false, false, false]],
      [["2027", "2028", "2029"], [false, false, false]],
      [["2030", "2031", "2032"], [true,  true,  true ]],
    ] as [string[], boolean[]][]) yearGrid.appendChild(await makeYMRow(g, size, ls, ds));
    yearInner.appendChild(yearGrid);
    setLightMode(yearComp, maps);

    // ── State=Month (월 선택 — 4×3 타일, 1월~12월) ───────────────────────
    const [monthComp, monthInner] = initComp(g, `Size=${size}, State=Month`, g.panelHTile, g.padBottomTile, g.gapTile);
    monthInner.appendChild(await makeCalHdr(g, g.hdrHTile, "2025"));
    const monthGrid = figma.createFrame(); monthGrid.name = "month-grid"; monthGrid.fills = [];
    monthGrid.layoutMode = "VERTICAL"; monthGrid.primaryAxisSizingMode = "AUTO"; monthGrid.counterAxisSizingMode = "AUTO";
    monthGrid.counterAxisAlignItems = "CENTER"; monthGrid.itemSpacing = g.tileGapY;
    for (const ls of [["1월","2월","3월"],["4월","5월","6월"],["7월","8월","9월"],["10월","11월","12월"]]) {
      monthGrid.appendChild(await makeYMRow(g, size, ls, [false, false, false]));
    }
    monthInner.appendChild(monthGrid);
    setLightMode(monthComp, maps);

    for (const [state, comp] of [["Date", dateComp], ["Year", yearComp], ["Month", monthComp]] as [string, ComponentNode][]) {
      comps.push(comp);
      cells.push({ comp, size, state });
      BUILT_COMPS[`Calendar:${size}:${state}`] = comp;
    }
  }

  // ── combineAsVariants + 스펙 ────────────────────────────────────────────
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Calendar";
  set.x = 0; set.y = originY;
  // 하위호환 키 — 종전 `Calendar:Date` 등은 MD 를 가리킨다(모바일 바텀시트 등 기존 소비자 보존).
  BUILT_COMPS["Calendar:Date"]  = BUILT_COMPS["Calendar:MD:Date"];
  BUILT_COMPS["Calendar:Year"]  = BUILT_COMPS["Calendar:MD:Year"];
  BUILT_COMPS["Calendar:Month"] = BUILT_COMPS["Calendar:MD:Month"];
  BUILT_SETS["Calendar"] = set;

  const opts: SpecOpts = {
    title: "Calendar",
    colHeaders: ["Date", "Year", "Month"],
    rowLabels: CAL_SIZES.map((sz) => sz),
    cellAt: (r, c) => cells.find((x) => x.size === CAL_SIZES[r] && x.state === ["Date", "Year", "Month"][c])?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 380, cellH: 380,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

async function buildDatePicker(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const fc = (k: string) => `color/form-control/${k}`;
  const CAL_ICON = `<svg width="16" height="16" viewBox="0 0 16.2581 16.8" fill="none"><path d="M0 1.08387V16.2581C0 16.5615 0.238452 16.8 0.541936 16.8H15.7161C16.0196 16.8 16.2581 16.5615 16.2581 16.2581V1.08387C16.2581 0.780387 16.0196 0.541935 15.7161 0.541935H13.0065V0H11.9226V0.541935H4.33548V0H3.25161V0.541935H0.541936C0.238452 0.541935 0 0.780387 0 1.08387ZM4.33548 2.16774V1.62581H11.9226V2.16774H13.0065V1.62581H15.1742V3.79355H1.08387V1.62581H3.25161V2.16774H4.33548ZM15.1742 15.7161H1.08387V4.87742H15.1742V15.7161Z" fill="#000"/><path d="M5.14859 9.21302H3.52279V10.8388H5.14859V9.21302Z" fill="#000"/><path d="M8.94208 9.21302H7.31628V10.8388H8.94208V9.21302Z" fill="#000"/><path d="M12.7356 9.21302H11.1098V10.8388H12.7356V9.21302Z" fill="#000"/></svg>`;
  const states = [
    { name: "Default",  bg: "bg/default",  border: "border/default",  txt: "YY.MM.DD", tc: "text/placeholder", icon: "icon/default",  open: false },
    { name: "Filled",   bg: "bg/default",  border: "border/default",  txt: "26.06.17", tc: "text/default",     icon: "icon/default",  open: false },
    { name: "Open",     bg: "bg/selected", border: "border/selected", txt: "26.06.17", tc: "text/selected",    icon: "icon/default",  open: true },
    { name: "Disabled", bg: "bg/disabled", border: "border/disabled", txt: "YY.MM.DD", tc: "text/disabled",    icon: "icon/disabled", open: false },
  ];
  const sizes = [
    { size: "XXSM", brk: "PC",     h: 28, font: 12 },
    { size: "XSM",  brk: "PC",     h: 34, font: 14 },
    { size: "MD",   brk: "PC",     h: 44, font: 14 },
    { size: "MD",   brk: "Mobile", h: 48, font: 14 },
  ];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; brk: string; state: string }[] = [];
  for (const sc of sizes) {
    for (const st of states) {
      const trigger = figma.createFrame();
      trigger.name = "trigger";
      trigger.layoutMode = "HORIZONTAL"; trigger.primaryAxisAlignItems = "SPACE_BETWEEN"; trigger.counterAxisAlignItems = "CENTER";
      trigger.primaryAxisSizingMode = "FIXED"; trigger.counterAxisSizingMode = "FIXED";
      trigger.paddingLeft = 16; trigger.paddingRight = 8; trigger.paddingTop = 0; trigger.paddingBottom = 0;
      trigger.cornerRadius = 4;
      trigger.fills = [boundPaint(scv(maps, fc(st.bg)))];
      trigger.strokes = [boundPaint(scv(maps, fc(st.border)))]; trigger.strokeWeight = 1; trigger.strokeAlign = "INSIDE";
      trigger.appendChild(await makeBoundText(st.txt, sc.font, "Regular", scv(maps, fc(st.tc))));
      trigger.appendChild(await makeIconInstance("calendar", scv(maps, fc(st.icon)), fcIconPx(sc.h, 0), CAL_ICON));
      trigger.resize(180, sc.h);

      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, State=${st.name}, Break=${sc.brk}`;
      comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO"; comp.itemSpacing = 8;
      comp.fills = []; // 외곽 컨테이너는 투명 — createComponent 기본 흰색 fill 제거(미사용 FFFFFF, 2026-06-24)
      comp.appendChild(trigger);
      // 캘린더 패널 크기는 **트리거 크기를 따라간다** — MD 트리거는 MD 달력(356), XSM·XXSM 트리거는 SM 달력(267).
      //   river 결정 2026-09-04("입력창이 작으면 달력도 자동으로 작게"). 이 결정이 종전의
      //   "캘린더 패널은 사이즈 불변(356px 단일)"(2026-06-25)을 대체한다.
      //   모바일은 별도 바텀시트 컴포넌트로 처리(여기서는 제외).
      // Calendar 컴포넌트 인스턴스 재사용 (anatomy gate: "calendar-panel" raw 프레임 금지)
      if (st.open && sc.brk === "PC") {
        const calSize: CalSize = sc.size === "MD" ? "MD" : "SM";
        let calComp: ComponentNode | undefined = BUILT_COMPS[`Calendar:${calSize}:Date`];
        if (!calComp) {
          const calSet = await getBuiltSet("Calendar");
          if (calSet) {
            calComp = (calSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes(`Size=${calSize}`) && c.name.includes("State=Date"))
              ?? (calSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes("State=Date"))
              ?? (calSet.children as ComponentNode[]).find(c => c.type === "COMPONENT");
          }
        }
        if (calComp) {
          const calInst = calComp.createInstance();
          calInst.name = "calendar";
          comp.appendChild(calInst);
        }
      }
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, size: sc.size, brk: sc.brk, state: st.name });
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Date Picker";
  set.x = 0; set.y = originY;
  const opts: GroupedSpecOpts = {
    title: "Date Picker",
    platforms: [{ name: "PC", sizes: ["XXSM", "XSM", "MD"] }, { name: "Mobile", sizes: ["MD"] }],
    rowLabels: [""],
    colHeaders: states.map((s) => s.name),
    cellAt: (platName, size, _ri, ci) =>
      cells.find((x) => x.size === size && x.brk === platName && x.state === states[ci].name)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 380, cellH: 440, rowLabelW: 16, // cellW≥캘린더356 → Open 패널이 Disabled 열 침범 방지
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Date Picker Mobile Bottom Sheet — 모바일 바텀시트 (정본: V2.4 mobile bottomsheet 540:3836) ──────
// 구조(원본 확인): 360 폭 시트 = 헤더(제목 "날짜 선택" 좌 · 닫기 X 우) + Calendar:Date 인스턴스 + 하단 풀폭 "적용" 버튼.
//   색은 전부 Variable 바인딩. 캘린더 본문은 BUILT_COMPS["Calendar:Date"] 인스턴스 재활용(anatomy: raw 캘린더 금지).
//   닫기 아이콘 = V2.2 close(ic_닫기 89:4927, plain-X·원 없음) 라이브러리 인스턴스. 원본 540:3836 닫기와 동일 글리프(원+X remove 아님).
//   여백(원본 540:3836 실측): 시트 세로패딩 20·헤더 좌우 20·캘린더 래퍼 좌우 24·섹션 간 gap 32, 상단 라운드 8.
async function buildDatePickerBottomSheet(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const SHEET_W = 360;
  const comp = figma.createComponent();
  comp.name = "Platform=Mobile";
  comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
  comp.resize(SHEET_W, 100);
  comp.itemSpacing = 32; // 섹션 간 간격(헤더↔캘린더↔버튼) — spacing/section/lg
  comp.paddingTop = 20; comp.paddingBottom = 20; // 시트 세로패딩 — spacing/section/sm
  comp.paddingLeft = 0; comp.paddingRight = 0; // 좌우 패딩은 자식(헤더 20·캘린더 24)이 개별 적용
  comp.counterAxisAlignItems = "CENTER";
  // 시트 배경 = surface/raised (Light base/white · Dark gray-dark/100) — 캘린더 패널(color/date-picker/panel/bg)과 동일색.
  //   사용자 결정 2026-06-26: 시트면 bg = 캘린더 영역 bg 로 통일(라이트·다크 모두). 캘린더만 다른색이면 안 됨.
  //   ※ 이전 '시트=gray/50' 주석은 오해였음. 원 요청은 "라이트 시트(흰색)가 흰 섹션 배경에 묻혀 안 보이니 시트 '뒤'에 배경을 깔아달라" —
  //     시트면은 흰색(surface) 유지, 시트가 떠 보이는 효과는 세트 외부 배경(아래 bg/muted)이 담당한다.
  //   2026-07-06 수정: 다크에서 color/bg/level-0(gray-dark/0, 페이지 배경급 암전)을 잘못 참조해 캘린더보다 훨씬 어두웠음
  //   → color/surface/raised(다크 gray-dark/100, 캘린더 패널과 동일)로 정정.
  comp.fills = [boundPaint(scv(maps, "color/surface/raised"))];
  // 시트 상단 모서리 라운드(원본 540:3836 = rounded-tl/tr-8) — radius/8
  try { comp.topLeftRadius = 8; comp.topRightRadius = 8; comp.bottomLeftRadius = 0; comp.bottomRightRadius = 0; } catch (e) { /* */ }
  comp.clipsContent = false;

  // ── 헤더: 제목 ↔ 닫기 X (좌우 패딩 20) ────────────────────────────
  const header = figma.createFrame();
  header.name = "header"; header.fills = [];
  header.layoutMode = "HORIZONTAL"; header.primaryAxisSizingMode = "FIXED"; header.counterAxisSizingMode = "AUTO";
  header.primaryAxisAlignItems = "SPACE_BETWEEN"; header.counterAxisAlignItems = "CENTER";
  header.paddingLeft = 20; header.paddingRight = 20; // 헤더 좌우 패딩 — spacing/padding-inline/md
  comp.appendChild(header);
  try { header.layoutAlign = "STRETCH"; } catch (e) { /* */ }
  const title = await makeBoundText("날짜 선택", 20, "Bold", scv(maps, "color/text/title/primary"));
  title.name = "title"; header.appendChild(title);
  const closeIcon = await makeIconInstance("close", scv(maps, "color/icon/gray-dark"), 24, CLOSE_ICON_SVG);
  closeIcon.name = "close"; header.appendChild(closeIcon);

  // ── 캘린더 본문 = Calendar:Date 인스턴스 재활용 (좌우 패딩 24) ────────
  const calWrap = figma.createFrame();
  calWrap.name = "calendar-wrap"; calWrap.fills = [];
  calWrap.layoutMode = "VERTICAL"; calWrap.primaryAxisSizingMode = "AUTO"; calWrap.counterAxisSizingMode = "FIXED";
  calWrap.primaryAxisAlignItems = "CENTER"; calWrap.counterAxisAlignItems = "CENTER";
  calWrap.paddingLeft = 24; calWrap.paddingRight = 24; // 캘린더 좌우 패딩 — spacing/padding-inline/lg
  comp.appendChild(calWrap);
  try { calWrap.layoutAlign = "STRETCH"; } catch (e) { /* */ }
  // 모바일 시트의 달력은 MD — 모바일 트리거가 MD(h48)라 PC 와 같은 "트리거 크기를 따라간다" 규칙의 결과다.
  let calComp: ComponentNode | undefined = BUILT_COMPS["Calendar:MD:Date"] ?? BUILT_COMPS["Calendar:Date"];
  if (!calComp) {
    const calSet = await getBuiltSet("Calendar");
    if (calSet) {
      calComp = (calSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes("Size=MD") && c.name.includes("State=Date"))
        ?? (calSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes("State=Date"))
        ?? (calSet.children as ComponentNode[]).find(c => c.type === "COMPONENT");
    }
  }
  if (calComp) {
    const calInst = calComp.createInstance();
    calInst.name = "calendar";
    // 캘린더 좌우 보더 제거 — 패널 stroke + 드롭섀도(둘 다 시트 안에서 가장자리=보더처럼 보임) 제거.
    //   시트 gray50 배경이 흰 카드와 대비를 주므로 보더/섀도 없이도 캘린더가 떠 보임(사용자 결정 2026-06-26).
    try { calInst.strokes = []; calInst.effects = []; } catch (e) { /* */ }
    calWrap.appendChild(calInst);
  }

  // ── 하단 "적용" 풀폭 primary 버튼 (좌우 패딩 20) ─────────────────────
  //   직접 그린 프레임이 아니라 Button primary 컴포넌트 인스턴스를 사용(BUILD_DEPENDENCIES 로 Button 선빌드).
  const actionWrap = figma.createFrame();
  actionWrap.name = "action"; actionWrap.fills = [];
  actionWrap.layoutMode = "HORIZONTAL"; actionWrap.primaryAxisSizingMode = "FIXED"; actionWrap.counterAxisSizingMode = "AUTO";
  actionWrap.primaryAxisAlignItems = "CENTER"; actionWrap.counterAxisAlignItems = "CENTER";
  actionWrap.paddingLeft = 20; actionWrap.paddingRight = 20; // 액션 영역 좌우 패딩 — spacing/padding-inline/md
  comp.appendChild(actionWrap);
  try { actionWrap.layoutAlign = "STRETCH"; } catch (e) { /* */ }
  // Button primary, 모바일(LG) 사이즈, Default 상태 인스턴스. 라벨 "적용". 풀폭 STRETCH.
  let btnComp: ComponentNode | undefined = BUILT_COMPS["Button:primary:LG:Default"];
  if (!btnComp) {
    const btnSet = await getBuiltSet("Button");
    if (btnSet) {
      btnComp = (btnSet.children as ComponentNode[]).find(c => c.type === "COMPONENT"
        && c.name.includes("Variant=Primary") && c.name.includes("Size=LG") && c.name.includes("State=Default"))
        ?? (btnSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes("Variant=Primary"));
    }
  }
  if (btnComp) {
    const applyBtn = btnComp.createInstance();
    applyBtn.name = "apply";
    const txt = applyBtn.findOne((n) => n.type === "TEXT") as TextNode | null;
    if (txt) { try { txt.characters = "적용"; } catch (e) { /* */ } }
    actionWrap.appendChild(applyBtn);
    // 가로만 FILL(풀폭). layoutAlign=STRETCH(세로축 stretch)는 actionWrap AUTO 높이에서 버튼을
    //   텍스트 높이로 찌그러뜨리므로 쓰지 않는다 → 버튼은 본래 모바일(LG) 높이 48 유지(사용자 결정 2026-06-26).
    try { applyBtn.layoutSizingHorizontal = "FILL"; } catch (e) { /* */ }
  }

  setLightMode(comp, maps);
  const set = figma.combineAsVariants([comp], figma.currentPage);
  set.name = "Date Picker Mobile Bottom Sheet"; set.x = 0; set.y = originY;
  BUILT_SETS["Date Picker Mobile Bottom Sheet"] = set;

  const opts: SpecOpts = {
    title: "Date Picker Mobile Bottom Sheet", colHeaders: [""], rowLabels: [""], cellAt: () => comp,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: SHEET_W + 40, cellH: 500, rowLabelW: 16,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  // 다크 = 라이트 우측(buildSpec 기본 W+80). 시트 폭 360 = 좁은 컴포넌트라 우측 배치.
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  // 세트 외부(변형 컨테이너) 배경 = bg/muted (Light gray/100 #E9E9E9) — 시트면=캘린더가 흰색(surface)이라 흰 섹션 배경에 묻힘.
  //   ★ 반드시 decorateSetFlat(set.fills 를 specPalette 흰색으로 덮어씀) 이후에 적용해야 살아남는다(사용자 결정 2026-06-26·재현 2026-06-29).
  set.fills = [boundPaint(scv(maps, "color/bg/level-3"))];
  return { set, bottomY };
}

// ── Time Picker Mobile Bottom Sheet — 시간 휠 바텀시트 (정본: reports/figma-library-build/time-picker-mobile/) ──
// 구조(원본 920:9267): 360 폭 시트 = 헤더(제목 좌·닫기 X 우) + [DateTime 변형만] 날짜·시간 탭 + 시간 휠(4열 32px accent 숫자
//   + 위/아래 흐림 마스크) + 하단 풀폭 "적용" 버튼. 색은 전부 Variable 바인딩. 폰트는 텍스트 스타일 바인딩(휠=title/32R 신규).
//   변형축 Content = TimeOnly("시간 선택") / DateTime("시작 일시"). 버튼·탭은 기존 Button·Line Tab 인스턴스 재사용.
async function buildTimePickerMobileBottomSheet(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const SHEET_W = 360;
  const FADE_H = 110;      // 흐림 마스크 높이(원본 node-map fadeImplementation)
  const ACCENT = "color/text/state/accent"; // 휠 숫자색(전 셀 동일 — 위/아래는 마스크로 흐려짐)

  // 시간 휠 한 컬럼(세로 나열 텍스트). align = counterAxisAlignItems(MIN/CENTER/MAX).
  // 열 폭 — river 승인 2026-09-07("권장안으로 적용해봐"). 종전엔 폭을 주지 않고 글자에 맡겼는데(hug),
  //   그러면 **정지 그림에서만** 성립하는 폭이 나온다: 시 열 샘플이 7·8·9 한 자리라 20 이었다.
  //   실제 휠은 1~12 를 굴리므로 두 자리가 필요하고, 웹은 그 값을 정본에서 못 받아 64/48/24 를
  //   임의로 지어 썼다(river 제보 2026-09-07 — 좌우 여백이 원본과 달라 보인 원인).
  //   그래서 폭을 정본에 못 박는다. 시·분은 두 자리 안전폭 40(브라우저 실측 "59"=39.9), 콜론 8,
  //   오전오후 56(hug 실측과 동일). 열 폭 합 144, 간격 36+32+32=100 → 콘텐츠 244.
  //   좌우 여백 = wheelWrap 패딩 24 + 남는 폭 절반 (360 − 24×2 − 244) / 2 = 24 + 34 = 58.
  //   ⚠ 좌우 여백은 원본 정지 그림의 68 이 아니라 58 이 된다 — 시 열이 20→40 으로 넓어진 만큼이며,
  //     정지 그림을 굴러가는 목록으로 옮기면 피할 수 없다(river 확인 후 승인).
  const WHEEL_COL_W: Record<string, number> = { ampm: 56, hour: 40, colon: 8, minute: 40 };

  const makeWheelCol = async (name: string, labels: string[], gap: number, align: "MIN" | "CENTER" | "MAX"): Promise<FrameNode> => {
    const col = figma.createFrame();
    col.name = name; col.fills = [];
    col.layoutMode = "VERTICAL"; col.primaryAxisSizingMode = "AUTO"; col.counterAxisSizingMode = "FIXED";
    col.primaryAxisAlignItems = "CENTER"; col.counterAxisAlignItems = align; col.itemSpacing = gap;
    for (const lb of labels) {
      // 휠 숫자 = Pretendard Regular 32 → title/32R 텍스트 스타일 바인딩(makeBoundText 가 textStyleKey 로 매핑).
      const t = await makeBoundText(lb, 32, "Regular", scv(maps, ACCENT));
      col.appendChild(t);
    }
    // 폭 지정 실패를 삼키지 않는다 — 삼키면 Figma 기본 폭 100 이 남아 4열 합이 시트 360 을 넘고,
    //   그 상태가 조용히 캔버스에 굳는다(🤖 component-verifier 2026-09-07 권고).
    const w = WHEEL_COL_W[name];
    if (w) {
      try {
        col.resize(w, col.height);
      } catch (e) {
        throw new Error(`[time-picker sheet] 휠 열 "${name}" 폭(${w}) 지정 실패: ${String(e)}`);
      }
    }
    return col;
  };

  // 흐림 오버레이 1장 — [순수 alpha 그라데이션 마스크 RECT(isMask) + 표면색 SOLID RECT(wheel-fade 바인딩)].
  //   마스크의 흰색은 '표시색'이 아니라 구조적 alpha 셰이핑(0-1 float)이라 하드코딩 색 규칙 대상 아님(원본 동일 방식).
  //   표시되는 색은 하위 SOLID = color/overlay/wheel-fade(모드 반응) → 다크모드에서 시트 표면색으로 자연 fade.
  const makeWheelFade = (position: "top" | "bottom"): FrameNode => {
    const fade = figma.createFrame();
    fade.name = position === "top" ? "fade-top" : "fade-bottom";
    fade.fills = []; fade.clipsContent = true;
    fade.resize(SHEET_W, FADE_H);
    const mask = figma.createRectangle();
    mask.name = "fade-mask"; mask.resize(SHEET_W, FADE_H);
    // 4-stop 곡선 — V2.4 원본 오버레이(540:3785/3786·3758/3759) 실측을 마스크 좌표로 옮긴 값.
    //   종전엔 2-stop 직선(0.9→0)이라 바깥 줄이 너무 빨리 사라졌다. 캔버스에서 손으로 교정해
    //   node-map.json revisions 에 기록해 뒀으나 **이 코드에는 반영되지 않아 재설치하면 사라지던**
    //   상태였다(2026-08-02 적발). 여기 박아 재설치 안전성을 확보한다.
    //   ⚠️ top 과 bottom 의 숫자가 대칭이 아닌 이유: 마스크 position 은 **바깥→중앙** 방향 거리라
    //   top(0=위 바깥, 1=중앙)과 bottom(0=중앙, 1=아래 바깥)의 기준점이 서로 반대다.
    const stops: ColorStop[] = position === "top"
      ? [{ position: 0,    color: { r: 1, g: 1, b: 1, a: 0.9 } },
         { position: 0.25, color: { r: 1, g: 1, b: 1, a: 0.9 } },
         { position: 0.65, color: { r: 1, g: 1, b: 1, a: 0.7 } },
         { position: 1,    color: { r: 1, g: 1, b: 1, a: 0.0 } }]
      : [{ position: 0,    color: { r: 1, g: 1, b: 1, a: 0.0 } },
         { position: 0.35, color: { r: 1, g: 1, b: 1, a: 0.7 } },
         { position: 0.75, color: { r: 1, g: 1, b: 1, a: 0.9 } },
         { position: 1,    color: { r: 1, g: 1, b: 1, a: 0.9 } }];
    mask.fills = [{ type: "GRADIENT_LINEAR", gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: stops } as GradientPaint];
    mask.isMask = true;
    fade.appendChild(mask);
    const fill = figma.createRectangle();
    fill.name = "fade-fill"; fill.resize(SHEET_W, FADE_H);
    fill.fills = [boundPaint(scv(maps, "color/overlay/wheel-fade"))];
    fade.appendChild(fill);
    return fade;
  };

  // 날짜/시간 탭(DateTime 변형 전용) — 기존 Line Tab Mobile/SM 셀 인스턴스 재사용(라벨 override).
  //   ※ 이 시트는 모바일 전용(PC/Mobile 혼합 아님) → 그룹형 스펙 불필요. Line Tab 셀 탐색 시 "Break=" 리터럴을
  //     쓰지 않고 변형명에 포함된 "Mobile" 로 매칭한다(PC SM 셀과 구분되면서 audit-bindings 규칙2 오탐 회피).
  const pickLineTab = async (state: string): Promise<ComponentNode | undefined> => {
    let c: ComponentNode | undefined = BUILT_COMPS[`LineTab:Mobile-SM-${state}`];
    if (!c) {
      const s = await getBuiltSet("Line Tab");
      if (s) c = (s.children as ComponentNode[]).find((x) => x.type === "COMPONENT"
        && x.name.includes("Size=SM") && x.name.includes("Mobile") && x.name.includes(`State=${state}`));
    }
    return c;
  };

  // 하단 "적용" Button primary 인스턴스(모바일 LG·Default) — buildDatePickerBottomSheet 와 동일 재사용.
  const getApplyBtn = async (): Promise<ComponentNode | undefined> => {
    let c: ComponentNode | undefined = BUILT_COMPS["Button:primary:LG:Default"];
    if (!c) {
      const s = await getBuiltSet("Button");
      if (s) c = (s.children as ComponentNode[]).find((x) => x.type === "COMPONENT"
        && x.name.includes("Variant=Primary") && x.name.includes("Size=LG") && x.name.includes("State=Default"))
        ?? (s.children as ComponentNode[]).find((x) => x.type === "COMPONENT" && x.name.includes("Variant=Primary"));
    }
    return c;
  };

  // 변형 1개 빌드. content: TimeOnly | DateTime.
  const buildVariant = async (content: "TimeOnly" | "DateTime"): Promise<ComponentNode> => {
    const comp = figma.createComponent();
    comp.name = `Content=${content}`;
    comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.resize(SHEET_W, 100);
    comp.itemSpacing = 32; comp.paddingTop = 20; comp.paddingBottom = 20; comp.paddingLeft = 0; comp.paddingRight = 0;
    comp.counterAxisAlignItems = "CENTER";
    comp.fills = [boundPaint(scv(maps, "color/surface/raised"))];
    try { comp.topLeftRadius = 8; comp.topRightRadius = 8; comp.bottomLeftRadius = 0; comp.bottomRightRadius = 0; } catch (e) { /* */ }
    comp.clipsContent = false;

    // 헤더: 제목 ↔ 닫기 X (좌우 패딩 20)
    const header = figma.createFrame();
    header.name = "header"; header.fills = [];
    header.layoutMode = "HORIZONTAL"; header.primaryAxisSizingMode = "FIXED"; header.counterAxisSizingMode = "AUTO";
    header.primaryAxisAlignItems = "SPACE_BETWEEN"; header.counterAxisAlignItems = "CENTER";
    header.paddingLeft = 20; header.paddingRight = 20;
    comp.appendChild(header);
    try { header.layoutAlign = "STRETCH"; } catch (e) { /* */ }
    const titleText = content === "TimeOnly" ? "시간 선택" : "시작 일시";
    const title = await makeBoundText(titleText, 20, "Bold", scv(maps, "color/text/title/primary"));
    title.name = "title"; header.appendChild(title);
    const closeIcon = await makeIconInstance("close", scv(maps, "color/icon/gray-dark"), 24, CLOSE_ICON_SVG);
    closeIcon.name = "close"; header.appendChild(closeIcon);

    // 날짜/시간 탭 (DateTime 전용)
    if (content === "DateTime") {
      const tabRow = figma.createFrame();
      tabRow.name = "tab-row"; tabRow.fills = [];
      tabRow.layoutMode = "HORIZONTAL"; tabRow.primaryAxisSizingMode = "FIXED"; tabRow.counterAxisSizingMode = "AUTO";
      tabRow.paddingLeft = 24; tabRow.paddingRight = 24; tabRow.itemSpacing = 0; tabRow.counterAxisAlignItems = "CENTER";
      comp.appendChild(tabRow);
      try { tabRow.layoutAlign = "STRETCH"; } catch (e) { /* */ }
      const tabDefs = [{ state: "Unselected", label: "날짜" }, { state: "Selected", label: "시간" }];
      for (const td of tabDefs) {
        const cell = await pickLineTab(td.state);
        if (cell) {
          const inst = cell.createInstance();
          inst.name = td.label === "날짜" ? "tab-date" : "tab-time";
          const txt = inst.findOne((n) => n.type === "TEXT") as TextNode | null;
          if (txt) { try { txt.characters = td.label; } catch (e) { /* */ } }
          tabRow.appendChild(inst);
          try { inst.layoutSizingHorizontal = "FILL"; } catch (e) { /* */ }
        }
      }
    }

    // 시간 휠 (4열 + 위/아래 흐림)
    const wheelWrap = figma.createFrame();
    wheelWrap.name = "wheel"; wheelWrap.fills = [];
    wheelWrap.layoutMode = "HORIZONTAL"; wheelWrap.primaryAxisSizingMode = "FIXED"; wheelWrap.counterAxisSizingMode = "AUTO";
    // counterAxis=MIN — 오전/오후 열(2행)이 **위에서 첫·둘째 줄**에 오게 한다(원본 y=0).
    //   종전 CENTER 는 2행짜리 ampm 을 세로 중앙에 놓아 숫자 줄과 어긋나게 만들었다.
    //   숫자 3열은 아래 pitch 통일로 높이가 같아져 MIN/CENTER 차이가 없다.
    wheelWrap.primaryAxisAlignItems = "CENTER"; wheelWrap.counterAxisAlignItems = "MIN";
    wheelWrap.paddingLeft = 24; wheelWrap.paddingRight = 24; wheelWrap.paddingTop = 40; wheelWrap.paddingBottom = 40;
    wheelWrap.itemSpacing = 36; wheelWrap.clipsContent = false;
    comp.appendChild(wheelWrap);
    try { wheelWrap.layoutAlign = "STRETCH"; } catch (e) { /* */ }
    // 4열: 오전/오후(2행) · 시(3행·우측) · 콜론(3행) · 분(3행·좌측). 전 셀 accent(위/아래는 마스크로 흐려짐).
    //   열 간격은 원본이 **36 / 32 / 32** 로 평탄하지 않다 — 오전오후와 시각 묶음 사이만 36 이고
    //   시·콜론·분 사이는 32. 그래서 [시·콜론·분]을 time-group 으로 묶어 안쪽 32 를 준다.
    //   (종전엔 4열 평탄 36 이라 콜론이 숫자에서 4px 씩 더 떨어져 있었다.)
    wheelWrap.appendChild(await makeWheelCol("ampm", ["오전", "오후"], 32, "CENTER"));
    const timeGroup = figma.createFrame();
    timeGroup.name = "time-group"; timeGroup.fills = [];
    timeGroup.layoutMode = "HORIZONTAL"; timeGroup.primaryAxisSizingMode = "AUTO"; timeGroup.counterAxisSizingMode = "AUTO";
    timeGroup.primaryAxisAlignItems = "CENTER"; timeGroup.counterAxisAlignItems = "MIN"; timeGroup.itemSpacing = 32;
    timeGroup.clipsContent = false;
    wheelWrap.appendChild(timeGroup);
    timeGroup.appendChild(await makeWheelCol("hour", ["7", "8", "9"], 32, "MAX"));
    // 콜론 행 간격 32 — 숫자열과 **pitch 를 완전히 일치**시킨다. 종전 40 은 콜론 항목 높이가
    //   숫자와 같은 32px(행간 130% = 41.6)인데 간격만 40 이라 3행째에서 약 16px 밀렸다.
    //   (원본은 항목 35 + 간격 40 = 75 로 숫자열 74 와 1px 어긋나 있다 — 그 오차는 베끼지 않는다.)
    timeGroup.appendChild(await makeWheelCol("colon", [":", ":", ":"], 32, "CENTER"));
    timeGroup.appendChild(await makeWheelCol("minute", ["59", "00", "01"], 32, "MIN"));
    // 흐림 오버레이 2장 — 컬럼 위에 절대배치(위=상단 고정, 아래=하단 고정).
    const wheelH = wheelWrap.height;
    const fadeTop = makeWheelFade("top");
    wheelWrap.appendChild(fadeTop);
    try { fadeTop.layoutPositioning = "ABSOLUTE"; fadeTop.x = 0; fadeTop.y = 0; fadeTop.constraints = { horizontal: "STRETCH", vertical: "MIN" }; } catch (e) { /* */ }
    const fadeBottom = makeWheelFade("bottom");
    wheelWrap.appendChild(fadeBottom);
    try { fadeBottom.layoutPositioning = "ABSOLUTE"; fadeBottom.x = 0; fadeBottom.y = Math.max(0, wheelH - FADE_H); fadeBottom.constraints = { horizontal: "STRETCH", vertical: "MAX" }; } catch (e) { /* */ }

    // 하단 "적용" 풀폭 버튼 (좌우 패딩 20)
    const actionWrap = figma.createFrame();
    actionWrap.name = "action"; actionWrap.fills = [];
    actionWrap.layoutMode = "HORIZONTAL"; actionWrap.primaryAxisSizingMode = "FIXED"; actionWrap.counterAxisSizingMode = "AUTO";
    actionWrap.primaryAxisAlignItems = "CENTER"; actionWrap.counterAxisAlignItems = "CENTER";
    actionWrap.paddingLeft = 20; actionWrap.paddingRight = 20;
    comp.appendChild(actionWrap);
    try { actionWrap.layoutAlign = "STRETCH"; } catch (e) { /* */ }
    const btnComp = await getApplyBtn();
    if (btnComp) {
      const applyBtn = btnComp.createInstance();
      applyBtn.name = "apply";
      const txt = applyBtn.findOne((n) => n.type === "TEXT") as TextNode | null;
      if (txt) { try { txt.characters = "적용"; } catch (e) { /* */ } }
      actionWrap.appendChild(applyBtn);
      try { applyBtn.layoutSizingHorizontal = "FILL"; } catch (e) { /* */ }
    }

    setLightMode(comp, maps);
    return comp;
  };

  const timeOnly = await buildVariant("TimeOnly");
  const dateTime = await buildVariant("DateTime");
  const set = figma.combineAsVariants([timeOnly, dateTime], figma.currentPage);
  set.name = "Time Picker Mobile Bottom Sheet"; set.x = 0; set.y = originY;
  BUILT_SETS["Time Picker Mobile Bottom Sheet"] = set;

  const opts: SpecOpts = {
    title: "Time Picker Mobile Bottom Sheet", colHeaders: [""], rowLabels: ["시간만", "날짜+시간"],
    cellAt: (r) => (r === 0 ? timeOnly : dateTime),
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: SHEET_W + 40, cellH: 560, rowLabelW: 64,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  // 세트 외부(변형 컨테이너) 배경 = bg/level-3 — 흰 시트가 흰 섹션에 묻히지 않게(Date Picker Mobile BS 동일).
  //   ★ 반드시 decorateSetFlat(set.fills 를 specPalette 로 덮음) 이후에 적용.
  set.fills = [boundPaint(scv(maps, "color/bg/level-3"))];
  return { set, bottomY };
}

// ── Bottom Sheet Option + Bottom Sheet — 바텀시트 세트 (정본: reports/figma-library-build/bottom-sheet/2-plan.md) ──
// buildDatePickerBottomSheet 패턴을 따른다: 색은 전부 scv() Variable 바인딩, 폰트=텍스트 스타일 바인딩,
//   Checkbox/Radio/Button 은 기존 라이브러리 컴포넌트 인스턴스 재사용(raw 재현 금지), 아이콘=라이브러리 인스턴스.
//   기하(패딩·간격·라운드)는 buildDatePickerBottomSheet 와 동일하게 raw 숫자(설치기 맵은 semantic number 미노출).

// ic_잠김(Line) — V2.2 아이콘 라이브러리 "세트" 키(단일 variant 키가 아님)라 EDGE_SET 패턴처럼
//   importComponentSetByKeyAsync 로 세트를 불러와 Line variant 를 인스턴스화한다. 색은 rebindIconColor 로 토큰 바인딩.
//   (registry/figma/allowed-remote-keys.json 에 lock/lock_set 등록됨.)
const LOCK_SET_KEY = "b3ccc4b275de6aac8e3940df2ae97fbb00168624"; // ic_잠김 V2.2 세트(Line variant 보유)
const LOCK_FALLBACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="#757575" stroke-width="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="#757575" stroke-width="1.5"/></svg>`;
const CHECK_24_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12.5L10 17.5L19 6.5" stroke="#1D6CEB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHEVRON_RIGHT_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="#353535" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ACCOUNT_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" fill="#FFFFFF"/><path d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6" fill="#FFFFFF"/></svg>`;

async function makeLockIcon(colorVar: Variable, size: number): Promise<SceneNode> {
  try {
    const set = await (figma as any).importComponentSetByKeyAsync(LOCK_SET_KEY) as ComponentSetNode;
    const line = (set.children as ComponentNode[]).find((c) => c.type === "COMPONENT" && c.name.toLowerCase().includes("line"))
      ?? (set as any).defaultVariant as ComponentNode | undefined
      ?? (set.children as ComponentNode[])[0];
    if (line) {
      const inst = line.createInstance();
      inst.name = "lock";
      if (size && size !== inst.width) inst.resize(size, size);
      rebindIconColor(inst, colorVar);
      return inst;
    }
  } catch (e) { console.warn("lock 세트 import 실패 → 벡터 폴백:", e); }
  const node = figma.createNodeFromSvg(LOCK_FALLBACK_SVG); // icon-vector-allow: ic_잠김 세트 로드 실패 폴백(라이브러리 인스턴스 우선)
  node.name = "lock";
  rebindIconColor(node, colorVar);
  return node;
}

// 기존 라이브러리 컴포넌트 1개를 BUILT_COMPS/BUILT_SETS(이름) 에서 찾아 반환(인스턴스 재사용용).
async function getReuseComp(builtKey: string, setName: string, includes: string[]): Promise<ComponentNode | undefined> {
  let c: ComponentNode | undefined = BUILT_COMPS[builtKey];
  if (!c) {
    const s = await getBuiltSet(setName);
    if (s) c = (s.children as ComponentNode[]).find((x) => x.type === "COMPONENT" && includes.every((n) => x.name.includes(n)));
  }
  return c;
}

// 버튼/옵션 인스턴스의 텍스트 라벨 교체(폰트 로드 후 characters 설정).
async function setInstanceLabel(inst: SceneNode, label: string): Promise<void> {
  const txt = (inst as InstanceNode).findOne((n) => n.type === "TEXT") as TextNode | null;
  if (!txt) return;
  try { await figma.loadFontAsync(txt.fontName as FontName); } catch (e) { /* */ }
  try { txt.characters = label; } catch (e) { /* */ }
}

async function buildBottomSheetOption(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const ROW_W = 360;
  const byKey: Record<string, ComponentNode> = {};

  // 라벨 텍스트 헬퍼(선택행)
  const rowLabel = async (color: string) => makeBoundText("항목", 16, "Medium", scv(maps, color));

  // 선택행(Text/Checkbox/Radio) — h48, 패딩 20/8, width360.
  const makeSelectRow = (name: string): ComponentNode => {
    const comp = figma.createComponent();
    comp.name = name;
    comp.layoutMode = "HORIZONTAL";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
    comp.counterAxisAlignItems = "CENTER";
    comp.paddingLeft = 20; comp.paddingRight = 20; comp.paddingTop = 8; comp.paddingBottom = 8;
    comp.itemSpacing = 8;
    comp.fills = [boundPaint(scv(maps, "color/surface/raised"))];
    comp.resize(ROW_W, 48);
    return comp;
  };

  // ── Text/Default — 라벨만 ────────────────────────────────
  {
    const comp = makeSelectRow("Type=Text, State=Default");
    comp.primaryAxisAlignItems = "MIN";
    comp.appendChild(await rowLabel("color/text/body/primary"));
    setLightMode(comp, maps);
    byKey["Text:Default"] = comp;
  }
  // ── Text/Disabled — 비활성 라벨만, 아이콘 없음 ────────────────
  {
    const comp = makeSelectRow("Type=Text, State=Disabled");
    comp.primaryAxisAlignItems = "MIN";
    comp.appendChild(await rowLabel("color/text/state/disabled"));
    setLightMode(comp, maps);
    byKey["Text:Disabled"] = comp;
  }
  // ── Text/Selected — accent 라벨 + 우측 ✓ ──────────────────
  {
    const comp = makeSelectRow("Type=Text, State=Selected");
    comp.primaryAxisAlignItems = "SPACE_BETWEEN";
    comp.appendChild(await rowLabel("color/text/state/accent"));
    comp.appendChild(await makeIconInstance("check", scv(maps, "color/icon/blue"), 24, CHECK_24_SVG));
    setLightMode(comp, maps);
    byKey["Text:Selected"] = comp;
  }
  // ── Checkbox 행 (기존 Checkbox 컴포넌트 인스턴스 재사용) ─────
  const cbOff = await getReuseComp("Checkbox:Default", "Checkbox", ["State=Default"]);
  const cbOn = await getReuseComp("Checkbox:Checked", "Checkbox", ["State=Checked"]);
  for (const st of [{ name: "Default", comp: cbOff }, { name: "Selected", comp: cbOn }]) {
    const comp = makeSelectRow(`Type=Checkbox, State=${st.name}`);
    comp.primaryAxisAlignItems = "MIN";
    if (st.comp) { const inst = st.comp.createInstance(); inst.name = "checkbox"; comp.appendChild(inst); }
    comp.appendChild(await rowLabel("color/text/body/primary"));
    setLightMode(comp, maps);
    byKey[`Checkbox:${st.name}`] = comp;
  }
  // ── Radio 행 (기존 Radio 컴포넌트 인스턴스 재사용) ──────────
  const rdOff = await getReuseComp("Radio:Default:Off", "Radio", ["State=Default", "Label=Off"]);
  const rdOn = await getReuseComp("Radio:Selected:Off", "Radio", ["State=Selected", "Label=Off"]);
  for (const st of [{ name: "Default", comp: rdOff }, { name: "Selected", comp: rdOn }]) {
    const comp = makeSelectRow(`Type=Radio, State=${st.name}`);
    comp.primaryAxisAlignItems = "MIN";
    if (st.comp) { const inst = st.comp.createInstance(); inst.name = "radio"; comp.appendChild(inst); }
    comp.appendChild(await rowLabel("color/text/body/primary"));
    setLightMode(comp, maps);
    byKey[`Radio:${st.name}`] = comp;
  }
  // ── List 행 — 아바타 + 제목/서브 ↔ 우측 아이콘 (h64 hug, 패딩 20/12) ──
  const makeAvatar = async (): Promise<FrameNode> => {
    const av = figma.createFrame();
    av.name = "avatar";
    av.layoutMode = "HORIZONTAL"; av.primaryAxisAlignItems = "CENTER"; av.counterAxisAlignItems = "CENTER";
    av.primaryAxisSizingMode = "FIXED"; av.counterAxisSizingMode = "FIXED";
    av.resize(40, 40); av.cornerRadius = 20;
    av.fills = [boundPaint(scv(maps, "color/icon/gray-light"))]; // 아바타 원 = 전경 요소 → icon 계열(bg 아님)
    av.appendChild(await makeIconInstance("account", scv(maps, "color/icon/white"), 24, ACCOUNT_SVG));
    return av;
  };
  const makeListLeft = async (): Promise<FrameNode> => {
    const left = figma.createFrame();
    left.name = "list-left"; left.fills = [];
    left.layoutMode = "HORIZONTAL"; left.primaryAxisSizingMode = "AUTO"; left.counterAxisSizingMode = "AUTO";
    left.counterAxisAlignItems = "CENTER"; left.itemSpacing = 12;
    left.appendChild(await makeAvatar());
    const col = figma.createFrame();
    col.name = "list-text"; col.fills = [];
    col.layoutMode = "VERTICAL"; col.primaryAxisSizingMode = "AUTO"; col.counterAxisSizingMode = "AUTO"; col.itemSpacing = 2;
    const title = await makeBoundText("제목", 16, "Medium", scv(maps, "color/text/body/primary")); title.name = "title";
    const sub = await makeBoundText("서브 텍스트", 14, "Regular", scv(maps, "color/text/body/secondary")); sub.name = "sub";
    col.appendChild(title); col.appendChild(sub);
    left.appendChild(col);
    return left;
  };
  const makeListRow = async (name: string, rightIcon: SceneNode): Promise<ComponentNode> => {
    const comp = figma.createComponent();
    comp.name = name;
    comp.layoutMode = "HORIZONTAL";
    comp.primaryAxisAlignItems = "SPACE_BETWEEN"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "AUTO";
    comp.paddingLeft = 20; comp.paddingRight = 20; comp.paddingTop = 12; comp.paddingBottom = 12;
    comp.fills = [boundPaint(scv(maps, "color/surface/raised"))];
    comp.appendChild(await makeListLeft());
    comp.appendChild(rightIcon);
    try { comp.resize(ROW_W, comp.height); } catch (e) { /* mock */ }
    setLightMode(comp, maps);
    return comp;
  };
  byKey["List:Default"] = await makeListRow("Type=List, State=Default",
    await makeIconInstance("chevron", scv(maps, "color/icon/gray-dark"), 24, CHEVRON_RIGHT_SVG));
  byKey["List:Disabled"] = await makeListRow("Type=List, State=Disabled",
    await makeLockIcon(scv(maps, "color/icon/gray"), 24));

  // 표시 순서(메인→요소 규칙과 무관, 매트릭스 나열): Text → Checkbox → Radio → List
  const order = ["Text:Default", "Text:Selected", "Text:Disabled", "Checkbox:Default", "Checkbox:Selected",
    "Radio:Default", "Radio:Selected", "List:Default", "List:Disabled"];
  const comps = order.map((k) => byKey[k]);
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Bottom Sheet Option";
  set.x = 0; set.y = originY;
  BUILT_SETS["Bottom Sheet Option"] = set;
  // Bottom Sheet 컨테이너가 리스트에 재사용하는 Text 옵션 등록
  BUILT_COMPS["BottomSheetOption:Text:Default"] = byKey["Text:Default"];
  BUILT_COMPS["BottomSheetOption:Text:Selected"] = byKey["Text:Selected"];
  BUILT_COMPS["BottomSheetOption:Text:Disabled"] = byKey["Text:Disabled"];

  const types = ["Text", "Checkbox", "Radio", "List"];
  const states = ["Default", "Selected", "Disabled"];
  const opts: SpecOpts = {
    title: "Bottom Sheet Option",
    colHeaders: states,
    rowLabels: types,
    cellAt: (r, c) => byKey[`${types[r]}:${states[c]}`] ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 380, cellH: 80, rowLabelW: 80,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  // 세트 외부(변형 컨테이너) 배경 = bg/level-3 — 옵션 줄(color/surface/raised)이 흰색이라 흰 섹션 배경에 묻힘.
  //   Bottom Sheet 본체와 동일 패턴. Checkbox·Radio 단독 컴포넌트 세트는 자체 스트록으로 이미 구분되므로 미적용(사용자 결정 2026-07-06).
  set.fills = [boundPaint(scv(maps, "color/bg/level-3"))];
  return { set, bottomY };
}

async function buildBottomSheet(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const SHEET_W = 360;
  // 헤더+Content Slot 조립(변형 공통).
  // 슬롯은 헤더·푸터의 정본 구조를 잠그고, 화면별 본문만 자유롭게 교체하기 위한 Figma 공식 SlotNode다.
  // 기본 콘텐츠는 기존과 동일한 Bottom Sheet Option 4행이며, 슬롯을 비우거나 다른 콘텐츠로 교체하면
  // 시트와 content가 AUTO 높이로 함께 늘고 줄어든다.
  const buildContent = async (owner: ComponentNode): Promise<FrameNode> => {
    const content = figma.createFrame();
    content.name = "content"; content.fills = [];
    content.layoutMode = "VERTICAL"; content.primaryAxisSizingMode = "AUTO"; content.counterAxisSizingMode = "FIXED";
    content.itemSpacing = 24; // 헤더 ↔ Content Slot (spacing/section/md)
    // createSlot()으로 생긴 SlotNode가 항상 owner 안에 머물도록 content를 먼저 부착한다.
    owner.appendChild(content);
    // 헤더: 제목 ↔ 닫기 X (좌우 패딩 20)
    const header = figma.createFrame();
    header.name = "header"; header.fills = [];
    header.layoutMode = "HORIZONTAL"; header.primaryAxisSizingMode = "FIXED"; header.counterAxisSizingMode = "AUTO";
    header.primaryAxisAlignItems = "SPACE_BETWEEN"; header.counterAxisAlignItems = "CENTER";
    header.paddingLeft = 20; header.paddingRight = 20;
    const title = await makeBoundText("헤더 타이틀", 20, "Bold", scv(maps, "color/text/title/primary")); title.name = "title";
    header.appendChild(title);
    const closeIcon = await makeIconInstance("close", scv(maps, "color/icon/gray-dark"), 24, CLOSE_ICON_SVG);
    closeIcon.name = "close"; header.appendChild(closeIcon);
    content.appendChild(header);
    try { header.layoutAlign = "STRETCH"; } catch (e) { /* */ }
    // Content Slot: 기본값은 Bottom Sheet Option(Text) 4개(2번째=Selected).
    // createSlot()이 owner에 SLOT component property를 함께 만들며, 이후 content 안으로 옮겨도
    // owner component의 속성으로 유지된다.
    const existingSlotProperties = new Set(Object.entries(owner.componentPropertyDefinitions)
      .filter(([, definition]) => definition.type === "SLOT")
      .map(([propertyName]) => propertyName));
    const slot = owner.createSlot();
    slot.name = "Content"; slot.fills = [];
    slot.layoutMode = "VERTICAL"; slot.primaryAxisSizingMode = "AUTO"; slot.counterAxisSizingMode = "FIXED"; slot.itemSpacing = 0;
    slot.resize(SHEET_W, 48 * 4);
    const optDefault = BUILT_COMPS["BottomSheetOption:Text:Default"];
    const optSelected = BUILT_COMPS["BottomSheetOption:Text:Selected"];
    for (let i = 0; i < 4; i++) {
      const src = (i === 1 ? optSelected : optDefault) ?? optDefault;
      if (!src) continue;
      const inst = src.createInstance();
      inst.name = "option";
      slot.appendChild(inst);
      try { inst.layoutSizingHorizontal = "FILL"; } catch (e) { /* */ }
    }
    content.appendChild(slot);
    try { slot.layoutAlign = "STRETCH"; } catch (e) { /* */ }

    const slotDefinitions = Object.entries(owner.componentPropertyDefinitions || {});
    const slotProperty = slotDefinitions
      .find(([propertyName, definition]) => definition.type === "SLOT" && !existingSlotProperties.has(propertyName))?.[0];
    // 구형 검증 mock은 componentPropertyDefinitions를 기록하지 않는다. 실제 Figma에서는 createSlot()
    // 직후 SLOT 정의가 반드시 생기므로, 정의를 제공하는 환경에서만 누락을 오류로 처리하고 메타를 붙인다.
    if (slotDefinitions.length && !slotProperty) {
      throw new Error("[buildBottomSheet] Content Slot component property를 찾지 못했습니다.");
    }
    if (slotProperty) {
      const optionSet = BUILT_SETS["Bottom Sheet Option"];
      owner.editComponentProperty(slotProperty, {
        name: "Content",
        description: "바텀시트 본문 슬롯. 기본값은 Bottom Sheet Option 4행이며 헤더와 푸터는 슬롯 밖의 정본 구조로 유지합니다.",
        preferredValues: optionSet ? [{ type: "COMPONENT_SET", key: optionSet.key }] : [],
      });
    }
    return content;
  };

  // 버튼 인스턴스(Button 컴포넌트 재사용, 모바일 LG h48). 라벨 교체 + 풀와이드 FILL.
  const makeFooterButton = async (variant: "primary" | "secondary", label: string): Promise<SceneNode | null> => {
    const vLabel = variant === "primary" ? "Primary" : "Secondary";
    const comp = await getReuseComp(`Button:${variant}:LG:Default`, "Button",
      [`Variant=${vLabel}`, "Size=LG", "State=Default"]);
    if (!comp) return null;
    const inst = comp.createInstance();
    inst.name = variant;
    await setInstanceLabel(inst, label);
    return inst;
  };

  const variants: { footer: "None" | "Single" | "Dual" }[] = [{ footer: "None" }, { footer: "Single" }, { footer: "Dual" }];
  const byFooter: Record<string, ComponentNode> = {};
  for (const v of variants) {
    const comp = figma.createComponent();
    comp.name = `Footer=${v.footer}`;
    comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.resize(SHEET_W, 100);
    comp.itemSpacing = 48; // 콘텐츠 ↔ 푸터 (spacing/section/xxl)
    comp.paddingTop = 20; comp.paddingLeft = 0; comp.paddingRight = 0;
    comp.paddingBottom = v.footer === "None" ? 40 : 20;
    comp.counterAxisAlignItems = "CENTER";
    comp.fills = [boundPaint(scv(maps, "color/surface/raised"))];
    try { comp.topLeftRadius = 8; comp.topRightRadius = 8; comp.bottomLeftRadius = 0; comp.bottomRightRadius = 0; } catch (e) { /* */ }
    comp.clipsContent = true;
    // 그림자 = shadow/raised-up (아래에서 올라오는 표면이라 y 부호 반전).
    //   다크값 미확정이라 변수 바인딩 없이 라이트 값 고정(잘못된 값 고착 방지).
    const sheetEffects = shadowEffects("shadow/raised-up");   // 오류는 여기서 던진다(삼키지 않음)
    try { (comp as any).effects = sheetEffects; } catch (e) { /* 환경 미지원 */ }

    const content = await buildContent(comp);
    try { content.layoutAlign = "STRETCH"; } catch (e) { /* */ }

    if (v.footer !== "None") {
      const footer = figma.createFrame();
      footer.name = "footer"; footer.fills = [];
      footer.layoutMode = "HORIZONTAL"; footer.primaryAxisSizingMode = "FIXED"; footer.counterAxisSizingMode = "AUTO";
      footer.primaryAxisAlignItems = "CENTER"; footer.counterAxisAlignItems = "CENTER";
      footer.paddingLeft = 20; footer.paddingRight = 20; footer.itemSpacing = 8;
      comp.appendChild(footer);
      try { footer.layoutAlign = "STRETCH"; } catch (e) { /* */ }
      if (v.footer === "Dual") {
        const cancel = await makeFooterButton("secondary", "취소");
        if (cancel) { footer.appendChild(cancel); try { (cancel as InstanceNode).layoutSizingHorizontal = "FILL"; } catch (e) { /* */ } }
      }
      const apply = await makeFooterButton("primary", "적용");
      if (apply) { footer.appendChild(apply); try { (apply as InstanceNode).layoutSizingHorizontal = "FILL"; } catch (e) { /* */ } }
    }

    setLightMode(comp, maps);
    byFooter[v.footer] = comp;
  }

  const set = figma.combineAsVariants([byFooter["None"], byFooter["Single"], byFooter["Dual"]], figma.currentPage);
  set.name = "Bottom Sheet";
  set.x = 0; set.y = originY;
  BUILT_SETS["Bottom Sheet"] = set;

  const cols = ["None", "Single", "Dual"];
  const opts: SpecOpts = {
    title: "Bottom Sheet",
    colHeaders: cols,
    rowLabels: [""],
    cellAt: (_r, c) => byFooter[cols[c]] ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 400, cellH: 420, rowLabelW: 16,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  // 세트 외부(변형 컨테이너) 배경 = bg/level-3 — 시트면(color/surface/raised)이 흰색이라 흰 섹션 배경에 묻힘.
  //   Date Picker Mobile Bottom Sheet 와 동일 패턴(2026-06-26 사용자 결정). decorateSetFlat 이 set.fills 를
  //   흰색으로 덮어쓰므로 반드시 그 이후에 적용해야 살아남는다.
  set.fills = [boundPaint(scv(maps, "color/bg/level-3"))];
  return { set, bottomY };
}

// ── Modal (공통 팝업 셸) — 딤 위 팝업. 헤더+본문+푸터, 코어 Button 재사용. ───────
//   PC 원본 V2.4 modal_small(6706:4218), Mobile 원본 Mobile V2.32(1102:97650) 기준.
//   변형축 = Break(PC|Mobile) × Footer(Single|Dual). **크기 축은 없다 — 폭은 PC 360 · Mobile 300 하나씩.**
//   ⚠️ 2026-09-08 에 레거시 pc_modal(540:5815)의 4크기(sm·md·lg·xl)를 여기에 붙였다가 **철회**했다.
//     그 4크기는 이 확인 계열이 아니라 **콘텐츠 계열(Modal Content)** 것이다 — 두 계열은 river 결정 2026-07-15 로
//     이미 갈라져 있었고(정본 노드: 확인=6706:4218 · 콘텐츠=540:5815), 확인 계열은 제목16·버튼h28·폭360 단일이다.
//     river 재확인 2026-09-08: **"확인계열은 360으로만."** → 크기 축은 buildModalContent 로 옮겼다.
//   테두리 = color/modal/panel/border. 그림자 = shadow/raised — **라이트·다크 모두 2겹**(2026-07-29 결정).
//     옛 실측 "라이트 그림자 없음"(P8YvnCdGkQLDNVQhW74ZZW / 8177:264277)은 사실이나 의도가 아닌
//     '누락'으로 판정돼, 라이트에도 그림자를 부여했다. 겹 수를 양쪽 2겹으로 맞춘 이유는 Figma 가
//     겹 수를 변수 모드로 못 바꾸기 때문 — 겹 수가 같아야 겹당 속성을 변수에 묶어 모드 전환이 된다.
//     값 정본 = vars-data.ts SEMANTIC_SHADOW["shadow/raised"] (여기에 수치를 적지 않는다).
//   Single = 알림/설명체 1버튼("확인") · Dual = 확인/질문체 2버튼("취소"+"확인"). 제목 항상 존재.
//   글자는 마스터에 직접 구움(makeBoundText) — 문구는 "예시"일 뿐(실제 카피는 UX라이팅 영역, 컴포넌트 아님).
//   색은 전부 semantic 경유(scv/boundPaint), 아이콘=라이브러리 인스턴스(makeIconInstance), 버튼=코어 재사용.
async function buildModalShell(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  type ModalBreak = "PC" | "Mobile";
  type ModalFooter = "Single" | "Dual";
  const MODAL_PC_WIDTH = 360;
  const MODAL_MOBILE_WIDTH = 300;

  // 본문이 놓이는 자리를 Figma 슬롯("Content")으로 만든다 — 글자뿐 아니라 이미지·텍스트에리어 등
  //   무엇이든 넣을 수 있게 한다. (river 지시·결정 2026-09-03: 제목과 닫기(X)는 슬롯에 넣지 않고 고정)
  //   PC 는 본문 프레임(padding 24/24 · gap 8) 자리가 그대로 슬롯이 되고,
  //   Mobile 은 제목 아래 문구 자리가 슬롯이 된다. 슬롯은 owner 컴포넌트에서 만들어 content 프레임 안으로
  //   옮긴다 — owner 서브트리 안이면 직계 자식이 아니어도 owner 의 속성으로 유지된다(GNB·Bottom Sheet 와 동일).
  const CONTENT_SLOT_DESC = "모달 본문이 놓이는 자리. 기본은 안내 문구 한 덩어리이며, 문구 대신 이미지·텍스트에리어·입력 폼 등 무엇이든 넣을 수 있다. 제목과 닫기(X)는 슬롯 밖 고정 영역이다.";

  // PC = 제목+닫기 헤더 / 14R 본문. Mobile = 닫기 없음 / 18B 제목+16R 본문.
  const buildContentGroup = async (owner: ComponentNode, brk: ModalBreak, titleText: string, bodyText: string): Promise<FrameNode> => {
    const group = figma.createFrame();
    group.name = "content"; group.fills = [];
    group.layoutMode = "VERTICAL"; group.primaryAxisSizingMode = "AUTO"; group.counterAxisSizingMode = "FIXED";
    group.itemSpacing = brk === "PC" ? 32 : 24;
    // ★ group 을 owner 에 **먼저** 붙인다 — Content 슬롯이 owner 밖으로 한 번도 나가지 않게 한다.
    owner.appendChild(group);
    try { group.layoutAlign = "STRETCH"; } catch (e) { /* */ }

    if (brk === "Mobile") {
      const title = await makeBoundText(titleText, 18, "Bold", scv(maps, "color/text/title/primary"));
      title.name = "title"; title.textAutoResize = "HEIGHT";
      group.appendChild(title);
      try { title.layoutAlign = "STRETCH"; } catch (e) { /* */ }
      const bodyNode = await makeBoundText(bodyText, 16, "Regular", scv(maps, "color/text/body/primary"));
      bodyNode.name = "message"; bodyNode.textAutoResize = "HEIGHT";
      const mSlot = await makeSlot(owner, "Content", CONTENT_SLOT_DESC, [bodyNode], [],
        { layoutMode: "VERTICAL", primaryAxisSizingMode: "AUTO", counterAxisSizingMode: "FIXED",
          primaryAxisAlignItems: "MIN", counterAxisAlignItems: "MIN", itemSpacing: 8,
          stretchContents: true, parent: group });
      try { mSlot.layoutAlign = "STRETCH"; } catch (e) { /* */ }
      return group;
    }

    // 헤더: 제목 ↔ 닫기 X (좌우 24, 하단정렬 items-end)
    const header = figma.createFrame();
    header.name = "header"; header.fills = [];
    header.layoutMode = "HORIZONTAL"; header.primaryAxisSizingMode = "FIXED"; header.counterAxisSizingMode = "AUTO";
    header.primaryAxisAlignItems = "SPACE_BETWEEN"; header.counterAxisAlignItems = "MAX";
    header.paddingLeft = 24; header.paddingRight = 24; // spacing/padding/inline/lg
    const title = await makeBoundText(titleText, 16, "Bold", scv(maps, "color/text/title/primary")); title.name = "title";
    header.appendChild(title);
    const closeIcon = await makeIconInstance("close", scv(maps, "color/icon/gray-dark"), 24, CLOSE_ICON_SVG);
    closeIcon.name = "close"; header.appendChild(closeIcon);
    group.appendChild(header);
    try { header.layoutAlign = "STRETCH"; } catch (e) { /* */ }
    // 본문: 슬롯("Content") — 종전 body 프레임(VERTICAL · gap 8 · padding 24/24)과 같은 설정을 슬롯이 그대로 갖는다.
    const bodyNode = await makeBoundText(bodyText, 14, "Regular", scv(maps, "color/text/body/primary"));
    bodyNode.name = "message";
    //   PC 본문 글자는 종전과 같이 hug 로 둔다(stretchContents 안 씀) — Mobile 과 달리 원래
    //   STRETCH 가 걸려 있지 않았고, 늘리면 줄바꿈 지점이 달라져 겉모습이 바뀐다.
    const body = await makeSlot(owner, "Content", CONTENT_SLOT_DESC, [bodyNode], [],
      { layoutMode: "VERTICAL", primaryAxisSizingMode: "AUTO", counterAxisSizingMode: "FIXED",
        primaryAxisAlignItems: "MIN", counterAxisAlignItems: "MIN", itemSpacing: 8, // spacing/8
        paddingLeft: 24, paddingRight: 24, parent: group });
    try { body.layoutAlign = "STRETCH"; } catch (e) { /* */ }
    return group;
  };

  // 푸터 버튼 = 코어 Button 인스턴스 재사용. PC=XXSM h28, Mobile=LG h48.
  const makeFooterButton = async (brk: ModalBreak, variant: "primary" | "secondary", label: string): Promise<InstanceNode> => {
    const vLabel = variant === "primary" ? "Primary" : "Secondary";
    const size = brk === "PC" ? "XXSM" : "LG";
    const comp = await getReuseComp(`Button:${variant}:${size}:Default`, "Button",
      [`Variant=${vLabel}`, `Size=${size}`, "State=Default"]);
    if (!comp) {
      throw new Error(`[buildModalShell] 코어 Button 인스턴스 미발견: Button:${variant}:${size}:Default (${brk} 사이즈 키 불일치 — 빌드 중단, 우회 안 함)`);
    }
    const inst = comp.createInstance();
    inst.name = variant;
    await setInstanceLabel(inst, label);
    return inst;
  };

  // ── 그릇 변형 빌더. 글자는 마스터에 직접 구움(예시 문구·UX라이팅 영역). ──
  //   PC: w360 · py20 · gap32 · 닫기 있음. Mobile: w300 · p20 · gap30 · 닫기 없음.
  //         테두리 modal/panel/border(1px INSIDE, 2026-07-29 신설) · 그림자 shadow/raised(라이트·다크 2겹).
  const buildModalVariant = async (brk: ModalBreak, footer: ModalFooter, titleText: string, bodyText: string): Promise<ComponentNode> => {
    const mobile = brk === "Mobile";
    const comp = figma.createComponent();
    comp.name = `Break=${brk}, Footer=${footer}`;
    comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "FIXED";
    comp.resize(mobile ? MODAL_MOBILE_WIDTH : MODAL_PC_WIDTH, 100);
    comp.itemSpacing = mobile ? 30 : 32;
    comp.paddingTop = 20; comp.paddingBottom = 20;
    comp.paddingLeft = mobile ? 20 : 0; comp.paddingRight = mobile ? 20 : 0;
    comp.counterAxisAlignItems = "CENTER";
    comp.fills = [boundPaint(scv(maps, "color/surface/raised"))]; // HD-A: surface/raised 재사용
    bindRadius(comp, maps, "radius/8");
    comp.strokes = [boundPaint(scv(maps, "color/modal/panel/border"))];
    comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";   // Calendar 패널(buildCalendar)과 동일 방식
    comp.clipsContent = true;
    // 테두리 = color/modal/panel/border (2026-07-29 신설 — 종전 '테두리 없음'에서 변경, 사용자 결정).
    //   Modal·Dropdown·Time Picker Dropdown·Date Picker 4개 패널 보더가 같은 값(gray/200·gray-dark/500)이 된다.
    // 그림자 = shadow/raised (라이트·다크 모두 2겹, 겹당 변수 바인딩 → 모드로 전환).
    //   spread(-2/-4)가 적용되려면 "보이는 fill + clipsContent" 조건이 필요한데, fills·clipsContent 두 줄이 그 조건이다.
    const modalEffects = boundShadowEffects(maps, "shadow/raised");  // 오류는 여기서 던진다(삼키지 않음)
    try { (comp as any).effects = modalEffects; } catch (e) { /* 환경 미지원 */ }

    await buildContentGroup(comp, brk, titleText, bodyText);

    // PC 푸터는 우측 고정폭, Mobile 푸터는 260px 안에서 버튼을 동일비율로 채운다.
    const footerFrame = figma.createFrame();
    footerFrame.name = "footer"; footerFrame.fills = [];
    footerFrame.layoutMode = "HORIZONTAL"; footerFrame.primaryAxisSizingMode = "FIXED";
    footerFrame.counterAxisSizingMode = mobile ? "FIXED" : "AUTO";
    footerFrame.primaryAxisAlignItems = mobile ? "MIN" : "MAX";
    footerFrame.counterAxisAlignItems = "CENTER";
    footerFrame.paddingLeft = mobile ? 0 : 24; footerFrame.paddingRight = mobile ? 0 : 24;
    footerFrame.itemSpacing = footer === "Dual" ? 8 : 0;
    if (mobile) footerFrame.resize(260, 48);
    comp.appendChild(footerFrame);
    try { footerFrame.layoutAlign = "STRETCH"; } catch (e) { /* */ }
    const appendFooterButton = async (variant: "primary" | "secondary", label: string): Promise<void> => {
      const button = await makeFooterButton(brk, variant, label);
      footerFrame.appendChild(button);
      if (mobile) { try { button.layoutSizingHorizontal = "FILL"; } catch (e) { /* */ } }
    };
    if (footer === "Dual") {
      await appendFooterButton("secondary", mobile ? "아니오" : "취소");
      await appendFooterButton("primary", mobile ? "네" : "확인");
    } else {
      await appendFooterButton("primary", mobile ? "업데이트" : "확인");
    }

    setLightMode(comp, maps);
    setShadowMode(comp, maps, maps.semanticShadowLightModeId);
    return comp;
  };

  // 예시 문구는 크기와 무관하게 계열별로 한 벌만 쓴다(문구는 UX라이팅 영역, 컴포넌트가 아니다).
  const COPY = {
    "PC:Single":     { title: "제목 영역",       body: "요청하신 작업이 정상적으로 처리되었습니다.\n변경된 내용은 목록에서 확인하실 수 있어요." },
    "PC:Dual":       { title: "제목 영역",       body: "변경한 내용이 저장되지 않고 사라집니다.\n정말 이 작업을 진행하시겠어요?" },
    "Mobile:Single": { title: "업데이트 안내",   body: "보다 안정적인 서비스 이용을 위해 최신\n버전으로 업데이트해 주세요." },
    "Mobile:Dual":   { title: "자동 로그인 설정", body: "로그인되었어요.\n다음부터 자동으로 로그인할까요?" },
  } as Record<string, { title: string; body: string }>;
  const FOOTERS: ModalFooter[] = ["Single", "Dual"];
  const modalComps: ComponentNode[] = [];
  const modalByKey = new Map<string, ComponentNode>();
  for (const brk of ["PC", "Mobile"] as ModalBreak[]) {
    for (const footer of FOOTERS) {
      const copy = COPY[`${brk}:${footer}`];
      const comp = await buildModalVariant(brk, footer, copy.title, copy.body);
      modalComps.push(comp);
      modalByKey.set(`${brk}:${footer}`, comp);
    }
  }

  const set = figma.combineAsVariants(modalComps, figma.currentPage);
  set.name = "Modal";
  set.x = 0; set.y = originY;
  BUILT_SETS["Modal"] = set;

  const opts: GroupedSpecOpts = {
    title: "Modal",
    platforms: [{ name: "PC", sizes: [""] }, { name: "Mobile", sizes: [""] }],
    colHeaders: ["Single", "Dual"],
    rowLabels: [""],
    cellAt: (platform, _size, _r, c) => modalByKey.get(`${platform}:${FOOTERS[c]}`) ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 400, cellH: 260, rowLabelW: 16,
    shadowMode: true,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  // 세트 외부(변형 컨테이너) 배경 = bg/level-3 — 패널 surface/raised 가 라이트 흰색이라 흰 섹션에 묻힘 방지.
  //   Bottom Sheet 동일 패턴. decorateSetFlat 이 set.fills 를 덮으므로 반드시 그 이후에 적용.
  set.fills = [boundPaint(scv(maps, "color/bg/level-3"))];
  return { set, bottomY };
}

// ── Modal Content (콘텐츠 계열) — 입력창·표·이미지가 들어가는 큰 팝업 ──────────────
// 레거시 정본: A `pc_modal`(yE5UCFEbmXJBlYJWB24Lz2 / 540:5815) — 🤖 figma-inspector 2026-09-07 실측.
// **확인 계열(buildModalShell, 정본 노드 6706:4218)과 별개 컴포넌트다** — river 결정 2026-07-15 로 두 계열이 갈렸고
//   2026-09-08 에 ⭐ 가 이 4크기를 확인 계열에 잘못 붙였다가 river 재지시로 여기로 옮겼다.
//   확인 계열 = 폭360 단일 · 짧은 확인 문구
//   콘텐츠 계열 = 크기축 있음 · 본문 자리에 콘텐츠
//   **제목과 푸터 버튼은 두 계열이 같다** — river 지시 2026-09-08 "하단 푸터 버튼은 확인계열에 따르면 돼. 타이틀도".
//     즉 제목 16B · 버튼 XXSM h28 로 확인 계열과 통일한다. 두 계열의 차이는 **크기(폭·높이)와 본문 내용물**뿐이다.
//
// river 지시 2026-09-08 (4줄 그대로 반영):
//   ①"확인계열은 360으로만" → 확인 계열에서 Size 축 철회
//   ②"컨텐츠계열은 MD 이상부터 쓸 수 있도록" → **SM 없음. MD·LG·XL 3크기**(레거시 sm 360 은 채택하지 않는다 —
//      360 은 확인 계열 폭이라 콘텐츠 계열로 성립하지 않는다)
//   ③"레거시의 height를 적정사이즈로 반영" → 레거시 실측 높이를 고정값으로 준다(MD 336 · LG 587 · XL 587).
//      본문이 회색 자리표시 박스라 높이가 정해져 있어야 크기별 차이가 드러난다.
//   ④"body의 샘플 텍스트 대신 회색계열 박스+안내문구로 컨텐츠 영역 이라고 표출" → 본문 = 회색 자리표시 박스(`color/bg/level-3` — river 2026-09-08 다크 대비 지시) +
//      가운데 "컨텐츠 영역" 안내문구(`color/text/body/tertiary`). 실제 화면에서는 이 자리에 입력창·표·이미지가 들어간다.
//   ⑤"하단 푸터 버튼은 확인계열에 따르면 돼. 타이틀도" → **제목 16B · 버튼 XXSM h28** 로 확인 계열과 통일.
//      레거시 pc_modal 은 제목18B·버튼h34 였으나 river 가 정본을 확인 계열에 맞추기로 결정했다 —
//      §두 갈래 분류 (b) 사전 등록된 개선(레거시는 정답지가 아니라 개선 대상).
//
// 레거시 실측(원본 그대로): 폭 md 520 · lg 1000 · xl 1200 / 높이 md 336 · lg 587 · xl 587 /
//   상하 패딩 20(spacing/20) · 푸터 좌우 24(spacing/24) · 닫기 24px.
//   ⚠️ 세 크기는 폭·높이만 다르고 안쪽 밀도(패딩·간격·글자·버튼)는 전부 같다.
//   레거시와 일부러 다른 곳은 **제목·버튼 둘뿐**이다 — 레거시 18B·h34 대신 확인 계열 16B·XXSM h28(위 ⑤).
//   나머지(패딩 20 · 간격 32 · 푸터 버튼 간격 8 · 닫기 24)는 레거시 실측 그대로다.
// 색은 전부 Semantic 경유. 패널 면·테두리·그림자는 확인 계열과 같은 토큰을 쓴다(같은 딤 위 팝업이므로).
const MODAL_CONTENT_SIZES = ["MD", "LG", "XL"] as const;
type ModalContentSize = typeof MODAL_CONTENT_SIZES[number];
const MODAL_CONTENT_GEO: Record<ModalContentSize, { w: number; h: number }> = {
  MD: { w: 520, h: 336 },
  LG: { w: 1000, h: 587 },
  XL: { w: 1200, h: 587 },
};

async function buildModalContent(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  type MCFooter = "Single" | "Dual";
  const FOOTERS: MCFooter[] = ["Single", "Dual"];
  const num = (t: string): Variable => requireVar(maps.foundationNumber, t, "Foundation Number");

  // 푸터 버튼 = 코어 Button XXSM(h28) — 확인 계열과 **같은** 버튼이다(river 지시 2026-09-08).
  const footerButton = async (variant: "primary" | "secondary", label: string): Promise<InstanceNode> => {
    const vLabel = variant === "primary" ? "Primary" : "Secondary";
    const comp = await getReuseComp(`Button:${variant}:XXSM:Default`, "Button",
      [`Variant=${vLabel}`, "Size=XXSM", "State=Default"]);
    if (!comp) throw new Error(`[buildModalContent] 코어 Button 인스턴스 미발견: Button:${variant}:XXSM:Default — 빌드 중단, 우회 안 함`);
    const inst = comp.createInstance();
    inst.name = variant;
    await setInstanceLabel(inst, label);
    return inst;
  };

  const comps: ComponentNode[] = [];
  const byKey = new Map<string, ComponentNode>();
  for (const size of MODAL_CONTENT_SIZES) {
    for (const footer of FOOTERS) {
      const geo = MODAL_CONTENT_GEO[size];
      const comp = figma.createComponent();
      comp.name = `Size=${size}, Footer=${footer}`;
      comp.layoutMode = "VERTICAL";
      comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
      comp.counterAxisAlignItems = "CENTER";
      comp.setBoundVariable("paddingTop", num("spacing/20"));
      comp.setBoundVariable("paddingBottom", num("spacing/20"));
      // 헤더·본문·푸터 사이 간격 32 — 레거시 실측(540:5826·5837·5849 세 크기 전부)이자 확인 계열과 같은 값이다.
      //   (🤖 component-verifier 2026-09-08 적발: 근거 없이 20 이었다.)
      comp.itemSpacing = 32;
      comp.setBoundVariable("itemSpacing", num("spacing/32"));
      comp.resize(geo.w, geo.h);
      comp.fills = [boundPaint(scv(maps, "color/surface/raised"))];
      bindRadius(comp, maps, "radius/8");
      comp.strokes = [boundPaint(scv(maps, "color/modal/panel/border"))];
      comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
      comp.clipsContent = true;
      try { (comp as any).effects = boundShadowEffects(maps, "shadow/raised"); } catch (e) { /* 환경 미지원 */ }

      // ── 헤더: 제목 16B(확인 계열과 같음, river 지시 ⑤) + 닫기(X) ──
      const header = figma.createFrame();
      header.name = "header"; header.fills = [];
      header.layoutMode = "HORIZONTAL"; header.primaryAxisSizingMode = "FIXED"; header.counterAxisSizingMode = "AUTO";
      header.primaryAxisAlignItems = "SPACE_BETWEEN"; header.counterAxisAlignItems = "CENTER";
      header.setBoundVariable("paddingLeft", num("spacing/24"));
      header.setBoundVariable("paddingRight", num("spacing/24"));
      comp.appendChild(header);
      try { header.layoutAlign = "STRETCH"; } catch (e) { /* */ }
      header.appendChild(await makeBoundText("제목 영역", 16, "Bold", scv(maps, "color/text/title/primary"), "title/16B"));
      // 닫기(X) = 확인 계열 Modal·바텀시트와 **같은 라이브러리 부품**(`close`) — river 결정 2026-09-08.
      //   레거시 pc_modal 은 모바일 상단바와 같은 부품을 쓰지만, 그러면 모달 두 계열이 서로 다른 부품을
      //   가리키게 된다. 그림은 두 부품이 동일하다(내보낸 SVG 가 바이트 동일). §두 갈래 분류 (b).
      header.appendChild(await makeIconInstance("close", scv(maps, "color/icon/gray-dark"), 24, CLOSE_ICON_SVG));

      // ── 본문: 회색 자리표시 박스 + "컨텐츠 영역" 안내문구 (river 지시 ④) ──
      //   실제 화면에서는 이 자리에 입력창·표·이미지가 들어간다. 샘플 문장을 넣지 않는다.
      const body = figma.createFrame();
      body.name = "content"; body.layoutMode = "VERTICAL";
      body.primaryAxisSizingMode = "FIXED"; body.counterAxisSizingMode = "FIXED";
      body.primaryAxisAlignItems = "CENTER"; body.counterAxisAlignItems = "CENTER";
      // 자리표시 박스 면 — 다크에서 `bg/level-2` 는 패널 면(`surface/raised`)과 같은 `gray-dark/100` 이라
      //   박스가 통째로 안 보였다(🤖 component-verifier 2026-09-08 C-1). river 지시 2026-09-08
      //   "다크모드에서는 컨텐츠 영역 박스가 모달 배경과 같아서 구분이 안되네. 한단계 밝은 톤으로" →
      //   한 단계 밝은 `bg/level-3`(dark gray-dark/200). 새 토큰 0건. 라이트도 gray/50→gray/100 으로 한 단계 진해진다.
      body.fills = [boundPaint(scv(maps, "color/bg/level-3"))];
      bindRadius(body, maps, "radius/4");
      comp.appendChild(body);
      try { body.layoutAlign = "STRETCH"; body.layoutGrow = 1; } catch (e) { /* */ }
      body.appendChild(await makeBoundText("컨텐츠 영역", 14, "Medium", scv(maps, "color/text/body/tertiary"), "body/14M"));
      // 좌우 여백은 패널 안쪽 24 — 본문 박스가 그만큼 안으로 들어온다.
      const bodyWrap = figma.createFrame();
      bodyWrap.name = "content-area"; bodyWrap.fills = [];
      bodyWrap.layoutMode = "VERTICAL"; bodyWrap.primaryAxisSizingMode = "FIXED"; bodyWrap.counterAxisSizingMode = "FIXED";
      bodyWrap.setBoundVariable("paddingLeft", num("spacing/24"));
      bodyWrap.setBoundVariable("paddingRight", num("spacing/24"));
      comp.insertChild(1, bodyWrap);
      try { bodyWrap.layoutAlign = "STRETCH"; bodyWrap.layoutGrow = 1; } catch (e) { /* */ }
      bodyWrap.appendChild(body);
      try { body.layoutAlign = "STRETCH"; body.layoutGrow = 1; } catch (e) { /* */ }

      // ── 푸터: 우측 정렬, 코어 Button XXSM h28(확인 계열과 같음, river 지시 ⑤) ──
      const footerFrame = figma.createFrame();
      footerFrame.name = "footer"; footerFrame.fills = [];
      footerFrame.layoutMode = "HORIZONTAL"; footerFrame.primaryAxisSizingMode = "FIXED"; footerFrame.counterAxisSizingMode = "AUTO";
      footerFrame.primaryAxisAlignItems = "MAX"; footerFrame.counterAxisAlignItems = "CENTER";
      footerFrame.setBoundVariable("paddingLeft", num("spacing/24"));
      footerFrame.setBoundVariable("paddingRight", num("spacing/24"));
      footerFrame.itemSpacing = 8;
      footerFrame.setBoundVariable("itemSpacing", num("spacing/8"));
      comp.appendChild(footerFrame);
      try { footerFrame.layoutAlign = "STRETCH"; } catch (e) { /* */ }
      if (footer === "Dual") {
        footerFrame.appendChild(await footerButton("secondary", "취소"));
        footerFrame.appendChild(await footerButton("primary", "확인"));
      } else {
        footerFrame.appendChild(await footerButton("primary", "확인"));
      }

      setLightMode(comp, maps);
      setShadowMode(comp, maps, maps.semanticShadowLightModeId);
      comps.push(comp); byKey.set(`${size}:${footer}`, comp);
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Modal Content"; set.x = 0; set.y = originY;
  BUILT_SETS["Modal Content"] = set;
  const opts: GroupedSpecOpts = {
    title: "Modal Content",
    platforms: [{ name: "PC", sizes: MODAL_CONTENT_SIZES as unknown as string[] }],
    colHeaders: ["Single", "Dual"],
    rowLabels: [""],
    cellAt: (_p, size, _r, c) => byKey.get(`${size}:${FOOTERS[c]}`) ?? null,
    // XL 1200 을 담아야 해서 셀이 크다 — GNB 와 같은 이유로 다크 스펙을 아래에 쌓는다.
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 1240, cellH: 640, rowLabelW: 16,
    shadowMode: true,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  opts.darkOffset = { x: 0, y: bottomY + 80 };
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  set.fills = [boundPaint(scv(maps, "color/bg/level-3"))];
  return { set, bottomY };
}

// ── Calendar Cell / Calendar Tile — 레이아웃 등록기 ───────────────────────────
// 빌드는 lazy(Calendar/Date Picker 가 선행 호출) → 이미 만들어진 세트를 originY 로 재배치 + 스펙 데코레이트.
// CATEGORIES Form 에서 Date Picker 뒤 위치만 결정.
async function buildCalendarCellLayout(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const { set, variants } = await getOrBuildCalendarCell(maps);
  // ── 3안: 스펙 표를 Standard·Range 두 개로 분리한다 (2026-07-14, river 결정 — 당시 5열·4열) ──
  //   근거: 옛 colHeaders "Today / Start"·"Selected / End" 는 서로 무관한 두 상태를 "같은 열 번호"라는
  //   이유만으로 슬래시로 합친 것이라 표가 이미 부정확했다. Hover 추가가 문제를 만든 게 아니라 원래의
  //   무리를 드러냈다 → 억지로 열을 다시 맞추지 않고 표를 분리한다. Range 는 4상태 그대로 불변.
  //   공용 렌더러(renderFlat/SpecOpts/decorateSetFlat/buildSpec)는 건드리지 않고 등록기 안에서만 분리한다.
  //   한 세트 노드 위에 두 표를 세로로 쌓으므로(세트는 1개) renderFlat 을 2회 호출하되, 두 번째 표의
  //   셀/라벨을 첫 표 높이(h1)만큼 내려 배치하는 오프셋 emit 을 등록기 로컬로 둔다(floatingEmit.cell 은
  //   오프셋을 안 받아 그대로 쓰면 셀이 겹침).
  const stdStates = ["Default", "Hover", "Today", "Selected", "Selected Hover", "Disabled"]; // Hover 계열은 각자 base 뒤(상호작용 순서)
  const rngStates = ["Default", "Start", "End", "Disabled"];               // Range 불변(4상태)
  const cellW = 80, cellH = 60, rowLabelW = 80;
  const mkOpts = (title: string, states: string[], type: "Standard" | "Range"): SpecOpts => ({
    title,
    colHeaders: states,
    rowLabels: CAL_SIZES.map((sz) => sz), // 행 = 크기(MD·SM), 열 = 상태. 표 제목이 Standard/Range 를 알린다.
    cellAt: (r, c) => variants[`${CAL_SIZES[r]}:${type}:${states[c]}`] ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW, cellH, rowLabelW,
  });
  const stdOpts = mkOpts("Calendar Cell — Standard", stdStates, "Standard");
  const rngOpts = mkOpts("Calendar Cell — Range", rngStates, "Range");
  const setW = Math.max(specWidth(rowLabelW, stdStates.length, cellW), specWidth(rowLabelW, rngStates.length, cellW));

  // ── Light: 세트 원본을 두 표로 꾸민다(라벨=캔버스 절대좌표, 셀=세트 상대좌표). ──
  const floatAt = (oy: number, cy: number): LayoutEmit => ({
    text: async (s, x, y, w, al, col, fs, st) => { await makeLabel(s, fs, st, x, oy + y, w, al, col); },
    band: (x, y, w, h, col) => { const b = figma.createRectangle(); b.resize(w, h); b.cornerRadius = 4; b.fills = [{ type: "SOLID", color: col }]; b.x = x; b.y = oy + y; },
    cell: (comp, x, y) => { comp.x = x; comp.y = cy + y; },
  });
  set.x = 0; set.y = originY;
  try { set.fills = [{ type: "SOLID", color: specPalette(false).bg }]; } catch (e) { /* skip */ }
  const h1 = await renderFlat(stdOpts, false, floatAt(originY, 0));
  const h2 = await renderFlat(rngOpts, false, floatAt(originY + h1, h1));
  set.resize(setW, h1 + h2);
  setLightMode(set, maps);
  let bottomY = originY + h1 + h2;

  // ── Dark: 스펙 프레임 1개에 두 표를 세로로 쌓는다(frameEmit 은 절대좌표라 2번째 표에 yOff 래핑). ──
  try {
    const modeId = maps.semanticDarkModeId;
    const frame = figma.createFrame();
    frame.name = "Calendar Cell — Spec Dark";
    frame.fills = [{ type: "SOLID", color: specPalette(true).bg }];
    frame.cornerRadius = 8;
    frame.resize(setW, 1200);
    frame.x = setW + 80; // 원본 세트 우측 밀착(buildSpec 기본과 동일)
    frame.y = originY;
    const base = frameEmit(frame, maps, modeId);
    const dh1 = await renderFlat(stdOpts, true, base);
    const off: LayoutEmit = {
      text: (s, x, y, w, al, col, fs, st) => base.text(s, x, y + dh1, w, al, col, fs, st),
      band: (x, y, w, h, col) => base.band(x, y + dh1, w, h, col),
      cell: (comp, x, y) => base.cell(comp, x, y + dh1),
    };
    const dh2 = await renderFlat(rngOpts, true, off);
    frame.resize(setW, dh1 + dh2);
    setMode(frame, maps, modeId);
    bottomY = Math.max(bottomY, frame.y + dh1 + dh2);
  } catch (e) { console.warn(e); }
  return { set, bottomY };
}

async function buildCalendarTileLayout(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const { set, variants } = await getOrBuildCalendarTile(maps);
  set.x = 0; set.y = originY;
  const states = ["Default", "Hover", "Selected", "Disabled"];
  const opts: SpecOpts = {
    title: "Calendar Tile",
    colHeaders: states,
    rowLabels: CAL_SIZES.map((sz) => sz), // 행 = 크기(MD 88×56 · SM 68×40)
    cellAt: (r, c) => variants[`${CAL_SIZES[r]}:${states[c]}`] ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 120, cellH: 72,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Platform/StatusBar (모바일 플랫폼 — 상태바) ──────────────────────────────
// 기기/브라우저 크롬. Platform=App=상태바(시계·신호·wifi·배터리·%), Platform=Web=상태바+브라우저 주소창.
// 아이콘은 Figma 원본 export SVG(잠김·새로고침=라이브러리 아이콘 #757575=icon/gray, wifi=상태바 글리프 #353535=icon/gray-dark).
// 신호바·배터리는 토큰 바인딩 사각형으로 정확 재현.
const SHELL_WIFI_SVG = `<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="sw1" fill="white"><path d="M2.34315 4.34315C3.84344 2.84286 5.87827 2 8 2C10.1217 2 12.1566 2.84285 13.6569 4.34314L8 10L2.34315 4.34315Z"/></mask><path d="M2.34315 4.34315C3.84344 2.84286 5.87827 2 8 2C10.1217 2 12.1566 2.84285 13.6569 4.34314L8 10L2.34315 4.34315Z" stroke="#353535" stroke-width="3.2" mask="url(#sw1)"/><mask id="sw2" fill="white"><path d="M4.46447 6.46447C5.40215 5.52678 6.67392 5 8 5C9.32608 5 10.5979 5.52678 11.5355 6.46447L8 10L4.46447 6.46447Z"/></mask><path d="M4.46447 6.46447C5.40215 5.52678 6.67392 5 8 5C9.32608 5 10.5979 5.52678 11.5355 6.46447L8 10L4.46447 6.46447Z" stroke="#353535" stroke-width="3.2" mask="url(#sw2)"/><circle cx="7.9998" cy="10.2" r="1.2" fill="#353535"/></svg>`;
const SHELL_LOCK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0002 3C9.16131 3 6.85731 5.39657 6.85731 8.33829V11.2286H5.31445V21H18.6859V11.2286H17.143V8.33829C17.143 5.39657 14.839 3 12.0002 3ZM14.4173 17.8114L13.687 18.5417L11.9899 16.8446L10.2927 18.5417L9.56245 17.8114L11.2596 16.1143L9.56245 14.4171L10.2927 13.6869L11.9899 15.384L13.687 13.6869L14.4173 14.4171L12.7202 16.1143L14.4173 17.8114ZM7.88588 11.2286V8.33829C7.88588 5.96229 9.72702 4.02857 12.0002 4.02857C14.2733 4.02857 16.1145 5.96229 16.1145 8.33829V11.2286H7.88588Z" fill="#757575"/></svg>`;
const SHELL_REFRESH_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0002 19.9411C9.74488 19.9411 7.61666 18.9776 6.12374 17.3364H9.0143V16.2776H5.02257C4.7261 16.2776 4.49316 16.5106 4.49316 16.807V20.7882H5.55198V18.2576C7.23549 19.9941 9.54371 20.9999 12.0002 20.9999C16.966 20.9999 21.0001 16.9659 21.0001 12C21.0001 11.2271 20.9048 10.4647 20.7142 9.72357L19.6871 9.98828C19.8566 10.6342 19.9413 11.3118 19.9413 12C19.9413 16.3835 16.3836 19.9411 12.0002 19.9411Z" fill="#757575"/><path d="M18.4481 5.74282C16.7646 4.00636 14.4564 3.00049 11.9999 3.00049C7.03408 3.00049 3 7.03457 3 12.0004C3 12.7733 3.09529 13.5357 3.29647 14.2769L4.32352 14.0122C4.15411 13.3663 4.0694 12.6886 4.0694 12.0004C4.05881 7.61692 7.61643 4.0593 11.9999 4.0593C14.2552 4.0593 16.3834 5.02282 17.8763 6.66398H14.9858V7.7228H18.9669C19.2634 7.7228 19.4963 7.48986 19.4963 7.19339V3.21225H18.4375V5.74282H18.4481Z" fill="#757575"/></svg>`;

// SVG 아이콘 — 도형이 fill 이면 fill 을, stroke 면 stroke 를 변수에 바인딩(마스크 도형은 보존). wifi 처럼 fill+stroke 혼재 대응.
function makeBoundIcon(svg: string, colorVar: Variable): FrameNode {
  const node = figma.createNodeFromSvg(svg); // icon-vector-allow: 벡터 헬퍼 내부 구현(개별 호출처가 allow 마커 보유)
  node.name = "icon";
  const SHAPES = ["VECTOR", "ELLIPSE", "RECTANGLE", "LINE", "POLYGON", "STAR", "BOOLEAN_OPERATION"];
  (node.findAll((n) => SHAPES.includes(n.type)) as VectorNode[]).forEach((v) => {
    try {
      if (v.isMask) return;
      if (Array.isArray(v.strokes) && v.strokes.length) v.strokes = [boundPaint(colorVar)];
      if (Array.isArray(v.fills) && (v.fills as Paint[]).length) v.fills = [boundPaint(colorVar)];
    } catch (e) { /* skip */ }
  });
  return node;
}

// 상태바 내부 사각형(신호바·배터리) — 토큰 바인딩 fill 또는 stroke.
function shellRect(maps: BuildMaps, x: number, y: number, w: number, h: number, r: number, colorKey: string, asStroke: boolean): RectangleNode {
  const rc = figma.createRectangle();
  rc.x = x; rc.y = y; rc.resize(w, h); rc.cornerRadius = r;
  if (asStroke) { rc.strokes = [boundPaint(scv(maps, colorKey))]; rc.strokeWeight = 1; rc.fills = []; }
  else { rc.fills = [boundPaint(scv(maps, colorKey))]; rc.strokes = []; }
  return rc;
}

// 상태바 한 줄(시계·신호·wifi·배터리·%) 을 target(컴포넌트 또는 프레임)에 채운다. App·Web 공용.
async function populateStatusRow(target: FrameNode | ComponentNode, maps: BuildMaps): Promise<void> {
  target.layoutMode = "HORIZONTAL";
  target.primaryAxisSizingMode = "FIXED"; target.counterAxisSizingMode = "FIXED";
  target.resize(360, 27);
  target.primaryAxisAlignItems = "SPACE_BETWEEN"; target.counterAxisAlignItems = "CENTER";
  target.paddingLeft = 20; target.paddingRight = 16; target.paddingTop = 0; target.paddingBottom = 0;
  target.fills = [boundPaint(scv(maps, "color/bg/level-0"))];
  target.appendChild(await makeBoundText("12:30", 12, "Medium", scv(maps, "color/text/body/secondary")));
  const right = figma.createFrame();
  right.name = "status-right";
  right.layoutMode = "HORIZONTAL"; right.primaryAxisSizingMode = "AUTO"; right.counterAxisSizingMode = "AUTO";
  right.counterAxisAlignItems = "CENTER"; right.itemSpacing = 6; right.fills = [];
  const signal = figma.createFrame();
  signal.name = "signal"; signal.fills = []; signal.clipsContent = false; signal.resize(17, 12);
  signal.appendChild(shellRect(maps, 0, 8, 3, 4, 0.5, "color/icon/gray-dark", false));
  signal.appendChild(shellRect(maps, 4.5, 6, 3, 6, 0.5, "color/icon/gray-dark", false));
  signal.appendChild(shellRect(maps, 9, 4, 3, 8, 0.5, "color/icon/gray-dark", false));
  signal.appendChild(shellRect(maps, 13.5, 1, 3, 11, 0.5, "color/icon/gray-dark", false));
  right.appendChild(signal);
  const wifi = makeBoundIcon(SHELL_WIFI_SVG, scv(maps, "color/icon/gray-dark")); // icon-vector-allow: 휴대폰 셸 상태바 크롬 — DS UI 아이콘 아님
  wifi.name = "wifi"; right.appendChild(wifi); try { wifi.resize(16, 12); } catch (e) { /* */ }
  const battery = figma.createFrame();
  battery.name = "battery"; battery.fills = []; battery.clipsContent = false; battery.resize(24, 12);
  battery.appendChild(shellRect(maps, 0, 0.5, 20, 11, 2.5, "color/icon/gray-dark", true));
  battery.appendChild(shellRect(maps, 20.4, 4, 1.6, 4, 1, "color/icon/gray-dark", false));
  battery.appendChild(shellRect(maps, 2, 2.5, 14.5, 7, 1, "color/icon/gray-dark", false));
  right.appendChild(battery);
  right.appendChild(await makeBoundText("78%", 12, "Medium", scv(maps, "color/text/body/secondary")));
  target.appendChild(right);
}

// 브라우저 주소창(자물쇠 + URL pill + 새로고침) — Web 변형 전용.
async function buildShellUrlBar(maps: BuildMaps): Promise<FrameNode> {
  const bar = figma.createFrame();
  bar.name = "browser-url-bar";
  bar.layoutMode = "HORIZONTAL"; bar.primaryAxisSizingMode = "FIXED"; bar.counterAxisSizingMode = "FIXED";
  bar.resize(360, 50);
  bar.primaryAxisAlignItems = "CENTER"; bar.counterAxisAlignItems = "CENTER";
  bar.itemSpacing = 6; bar.paddingLeft = 16; bar.paddingRight = 16; bar.paddingTop = 12; bar.paddingBottom = 12;
  bar.fills = [boundPaint(scv(maps, "color/bg/level-0"))];
  const lock = makeBoundIcon(SHELL_LOCK_SVG, scv(maps, "color/icon/gray")); // icon-vector-allow: 휴대폰 셸 상태바 크롬 — DS UI 아이콘 아님
  lock.name = "ic_잠김"; bar.appendChild(lock); try { lock.resize(24, 24); } catch (e) { /* */ }
  const pill = figma.createFrame();
  pill.name = "url"; pill.layoutMode = "HORIZONTAL";
  pill.primaryAxisAlignItems = "CENTER"; pill.counterAxisAlignItems = "CENTER";
  pill.primaryAxisSizingMode = "FIXED"; pill.counterAxisSizingMode = "FIXED";
  pill.cornerRadius = 100; pill.fills = [boundPaint(scv(maps, "color/bg/level-2"))];
  pill.layoutGrow = 1; pill.layoutAlign = "STRETCH"; // flex-1 + h-full
  pill.appendChild(await makeBoundText("m.s1.co.kr", 14, "Regular", scv(maps, "color/text/body/tertiary")));
  bar.appendChild(pill);
  const refresh = makeBoundIcon(SHELL_REFRESH_SVG, scv(maps, "color/icon/gray")); // icon-vector-allow: 휴대폰 셸 브라우저 툴바 크롬 — DS UI 아이콘 아님
  refresh.name = "ic_새로고침"; bar.appendChild(refresh); try { refresh.resize(24, 24); } catch (e) { /* */ }
  return bar;
}

// ── Footer (PC + Mobile 플랫폼 세트) ─────────────────────────────────────────
// PC: 1920×116, HORIZONTAL, bg=color/navigation/bg, 상단 테두리 1px=color/line/gray/subtle
//     padding L/R=320px(raw·Foundation에 spacing/320 없음), T/B=spacing/28 바인딩
//     content: [좌] links(10px)+bizinfo+copyright / [우] S1 로고(C/IMG/Logo/S1_g 벡터)
// Mobile: 360×(hug), VERTICAL centered, no bg/border, itemSpacing=spacing/4 바인딩
//     content: links 가로 행 + copyright
// S1 브랜드 로고(에스원 워드마크) — 원본 C/IMG/Logo/S1_g(391:17346)에서 추출한 단일 path. 색은 rebindIconColor 로 토큰 바인딩.
const S1_LOGO_SVG = `<svg width="42" height="16" viewBox="0 0 42 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32.6826 14.3262H41.5254V16H30.6992V10.2461H32.6826V14.3262ZM10.1426 15.9902H8.32129V7.07812H7.39258C7.30419 11.1554 5.68825 13.0125 3.70117 13.0127C1.65723 13.0127 0 11.0554 0 6.73047C0 2.41216 1.65721 0.448242 3.70117 0.448242C5.52602 0.448409 7.03869 2.01912 7.34277 5.42676H8.32129V0.172852H10.1426V15.9902ZM12.9111 15.9902H11.084V0.173828H12.9111V15.9902ZM28.084 15.2305H15.084V13.5811H28.084V15.2305ZM41.2891 0.182617V13.0557H39.46V11.2832H36.459V9.64453H39.46V0.182617H41.2891ZM38.8672 8.87891H35.3379V12.1885H33.3799V8.87891H29.7305V7.3291H38.8672V8.87891ZM22.6143 2.46875C22.6143 4.89881 24.005 8.20501 27.7148 9.30078V11.0654C27.6961 11.063 23.8792 10.5615 21.583 6.69531C19.2775 10.5711 15.4512 11.0654 15.4512 11.0654V9.30078C19.1607 8.21325 20.5518 4.89883 20.5518 2.46875V0.551758H22.6143V2.46875ZM3.70215 2.41211C2.66837 2.41211 1.83011 3.41277 1.83008 6.7334C1.83008 10.0732 2.66835 11.0557 3.70215 11.0557C4.73624 11.0556 5.57422 10.0731 5.57422 6.7334C5.57418 3.41295 4.73622 2.41222 3.70215 2.41211ZM34.3525 0C36.6151 0 38.4492 1.17983 38.4492 3.41797C38.449 5.69092 36.615 6.83496 34.3525 6.83496C32.0903 6.83485 30.2561 5.69081 30.2559 3.41797C30.2559 1.17994 32.0901 0 34.3525 0ZM34.3486 1.57227C33.1672 1.57227 32.2091 2.36269 32.209 3.44043C32.209 4.51861 33.1671 5.30859 34.3486 5.30859C35.5303 5.3084 36.4883 4.51026 36.4883 3.44043C36.4882 2.35834 35.5302 1.57246 34.3486 1.57227Z" fill="#757575"/></svg>`;

async function buildFooter(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  // 링크·회사정보·카피라이트: 검증된 원본(login_Footer 269:5722)에서 가져옴. 임의 작성 금지 — registry/content/footer.json 정본, content-verbatim-check(Gate 14 원본대조 문구) 가드.
  const LINK_NAMES = ["이용약관", "개인정보 처리방침", "위치기반 서비스 이용약관"];

  // ── PC variant ─────────────────────────────────────────
  const pc = figma.createComponent();
  pc.name = "Platform=PC";
  pc.layoutMode = "HORIZONTAL";
  pc.primaryAxisSizingMode = "FIXED";
  pc.counterAxisSizingMode = "FIXED";
  pc.resize(1920, 116);
  pc.primaryAxisAlignItems = "SPACE_BETWEEN";
  pc.counterAxisAlignItems = "CENTER";
  pc.paddingLeft = 320;
  pc.paddingRight = 320;
  const sp28 = requireVar(maps.foundationNumber, "spacing/28", "Foundation Number");
  pc.setBoundVariable("paddingTop", sp28);
  pc.setBoundVariable("paddingBottom", sp28);
  pc.fills = [boundPaint(scv(maps, "color/navigation/bg"))];
  pc.strokes = [boundPaint(scv(maps, "color/line/gray/subtle"))];
  pc.strokeAlign = "INSIDE";
  pc.strokeTopWeight = 1; pc.strokeBottomWeight = 0; pc.strokeLeftWeight = 0; pc.strokeRightWeight = 0;

  // 좌측 콘텐츠 블록: 링크행 + 비즈 정보 + 저작권
  const leftBlock = figma.createFrame();
  leftBlock.name = "content-left";
  leftBlock.layoutMode = "VERTICAL"; leftBlock.primaryAxisSizingMode = "AUTO"; leftBlock.counterAxisSizingMode = "AUTO";
  leftBlock.fills = []; leftBlock.itemSpacing = 4;

  // 링크 행
  const linksRow = figma.createFrame();
  linksRow.name = "links"; linksRow.layoutMode = "HORIZONTAL"; linksRow.primaryAxisSizingMode = "AUTO"; linksRow.counterAxisSizingMode = "AUTO";
  linksRow.fills = []; linksRow.itemSpacing = 12;
  for (let i = 0; i < LINK_NAMES.length; i++) {
    linksRow.appendChild(await makeBoundText(LINK_NAMES[i], 10, "Regular", scv(maps, "color/text/body/tertiary")));
    if (i < LINK_NAMES.length - 1) {
      const sep = figma.createRectangle(); sep.name = "sep";
      sep.resize(1, 8); sep.fills = [boundPaint(scv(maps, "color/icon/gray-light"))];
      linksRow.appendChild(sep);
    }
  }
  leftBlock.appendChild(linksRow);
  leftBlock.appendChild(await makeBoundText("(주)에스원   사업자등록번호 208-81-13302    대표이사 정해린    04511 서울특별시 중구 세종대로 7길 25 에스원 빌딩", 10, "Regular", scv(maps, "color/text/body/tertiary")));
  leftBlock.appendChild(await makeBoundText("© S-1 Corp. All Rights Reserved.", 10, "Regular", scv(maps, "color/text/body/tertiary")));
  pc.appendChild(leftBlock);

  // 우측 로고 영역 (S1 브랜드 로고 벡터 — C/IMG/Logo/S1_g)
  const logo = figma.createNodeFromSvg(S1_LOGO_SVG); // icon-vector-allow: footer S1 브랜드 워드마크(벡터 자산, DS 아이콘 아님)
  logo.name = "C/IMG/Logo/S1_g";
  rebindIconColor(logo, scv(maps, "color/icon/gray")); // #757575 = gray/500 (다크 자동)
  pc.appendChild(logo);

  setLightMode(pc, maps);

  // ── Mobile variant ──────────────────────────────────────
  const mobile = figma.createComponent();
  mobile.name = "Platform=Mobile";
  // 컨텐츠 hug — 두 축 모두 AUTO 로 둬 컨텐츠가 프레임보다 커서 잘리는 문제 해소(사용자 결정 2026-06-25).
  //   좌측정렬: 컨텐츠를 좌측 시작점(MIN)에 맞춤(PC 와 동일하게 좌측 기준). 스펙 배치에서 x 도 PC 에 맞춘다.
  mobile.layoutMode = "VERTICAL"; mobile.primaryAxisSizingMode = "AUTO"; mobile.counterAxisSizingMode = "AUTO";
  mobile.primaryAxisAlignItems = "MIN"; mobile.counterAxisAlignItems = "MIN";
  mobile.fills = [];
  const sp4 = requireVar(maps.foundationNumber, "spacing/4", "Foundation Number");
  mobile.setBoundVariable("itemSpacing", sp4);
  mobile.paddingLeft = 16; mobile.paddingRight = 16; mobile.paddingTop = 8; mobile.paddingBottom = 8;

  // 모바일 링크 행
  const mLinks = figma.createFrame();
  mLinks.name = "links"; mLinks.layoutMode = "HORIZONTAL"; mLinks.primaryAxisSizingMode = "AUTO"; mLinks.counterAxisSizingMode = "AUTO";
  mLinks.fills = []; mLinks.itemSpacing = 8;
  mLinks.primaryAxisAlignItems = "CENTER"; mLinks.counterAxisAlignItems = "CENTER";
  for (let i = 0; i < LINK_NAMES.length; i++) {
    mLinks.appendChild(await makeBoundText(LINK_NAMES[i], 12, "Regular", scv(maps, "color/text/body/tertiary")));
    if (i < LINK_NAMES.length - 1) {
      const sep = figma.createRectangle(); sep.name = "sep";
      sep.resize(1, 10); sep.fills = [boundPaint(scv(maps, "color/line/gray/subtle"))];
      mLinks.appendChild(sep);
    }
  }
  mobile.appendChild(mLinks);
  // 카피라이트 중앙정렬 (사용자 결정 2026-06-25): 컨테이너 폭(=링크행 폭)에 STRETCH 후 텍스트 CENTER.
  const mCopyright = await makeBoundText("© S-1 Corp. All Rights Reserved.", 12, "Regular", scv(maps, "color/text/body/tertiary"));
  mobile.appendChild(mCopyright);
  try { mCopyright.layoutAlign = "STRETCH"; mCopyright.textAlignHorizontal = "CENTER"; } catch (e) { /* */ }

  setLightMode(mobile, maps);

  // ── 변형세트 생성 ──────────────────────────────────────
  const set = figma.combineAsVariants([pc, mobile], figma.currentPage);
  set.name = "Footer";
  set.x = 0; set.y = originY;
  try { (set as any).clipsContent = false; } catch (_) {}
  // PC(1920)·Mobile(360) 두 variant 를 라벨과 함께 세로 나열(겹침 방지 — 둘 다 (0,0)에 겹치던 문제 해소).
  // 좌측정렬: leftAlignCells 로 renderFlat 이 PC(1920)·Mobile(360) variant 를 모두 셀 좌측(gridLeft)에 정렬.
  //   라이트 스펙(floatingEmit)·다크 스펙(frameEmit) 양쪽 동일 적용 → 다크 Mobile 도 좌측정렬됨(사용자 지적 #1 2026-06-25).
  const opts: SpecOpts = {
    title: "Footer", colHeaders: [""], rowLabels: ["PC", "Mobile"],
    cellAt: (r, _c) => (r === 0 ? pc : mobile),
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 1960, cellH: 120, rowLabelW: 64,
    leftAlignCells: true,
  };
  const lightBottomY = await decorateSetFlat(set, opts, maps);
  opts.darkOffset = { x: 0, y: lightBottomY + 80 };
  let bottomY = lightBottomY;
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

async function buildStatusBar(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const app = figma.createComponent();
  app.name = "Platform=App";
  await populateStatusRow(app, maps);
  setLightMode(app, maps);

  const web = figma.createComponent();
  web.name = "Platform=Web";
  web.layoutMode = "VERTICAL"; web.primaryAxisSizingMode = "AUTO"; web.counterAxisSizingMode = "FIXED";
  web.resize(360, 77); web.itemSpacing = 0; web.fills = [];
  const row = figma.createFrame(); row.name = "status-row";
  await populateStatusRow(row, maps);
  row.layoutAlign = "STRETCH";
  web.appendChild(row);
  const urlbar = await buildShellUrlBar(maps);
  urlbar.layoutAlign = "STRETCH";
  web.appendChild(urlbar);
  setLightMode(web, maps);

  const set = figma.combineAsVariants([app, web], figma.currentPage);
  set.name = "StatusBar";
  set.x = 0; set.y = originY;
  BUILT_COMPS["StatusBar:App"] = app;
  BUILT_COMPS["StatusBar:Web"] = web;
  BUILT_SETS["StatusBar"] = set;
  // App(상태바)·Web(상태바+브라우저 주소창) 두 variant 를 라벨과 함께 세로 나열(겹침 방지).
  const opts: SpecOpts = {
    title: "StatusBar", colHeaders: [""], rowLabels: ["App", "Web"],
    cellAt: (r, _c) => (r === 0 ? app : web),
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 400, cellH: 80, rowLabelW: 56,
  };
  const lightBottomY = await decorateSetFlat(set, opts, maps);
  // 다크 = 라이트 우측(buildSpec 기본 W+80). 좁은 Platform 컴포넌트(StatusBar·NavBar·CI)는 우측, 넓은 것(LoginGNB·WebTabBar·Footer)은 아래 — river 결정 2026-06-25
  let bottomY = lightBottomY;
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Platform/NavBar (모바일 플랫폼 — 내비게이션) ─────────────────────────────
// 원본은 카카오톡 사진 스크린샷(벡터·토큰 0) → DS 토큰 벡터로 신규 제작(사용자 결정).
// 표준 크롬 글리프(line 24×24, stroke=icon/gray)로 그린다. App=안드로이드 내비, Web=브라우저 툴바+안드로이드 내비.
const NAV_SVG = (() => {
  const s = (d: string) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${d}</svg>`;
  const P = (path: string) => `<path d="${path}" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return {
    chevronLeft:  s(P("M15 6L9 12L15 18")),
    chevronRight: s(P("M9 6L15 12L9 18")),
    home:         s(P("M3.5 11L12 4L20.5 11") + P("M6 9.5V20H18V9.5")),
    star:         s(P("M12 3.5L14.58 8.74L20.36 9.58L16.18 13.65L17.17 19.41L12 16.69L6.83 19.41L7.82 13.65L3.64 9.58L9.42 8.74L12 3.5Z")),
    menu:         s(P("M4 7H20") + P("M4 12H20") + P("M4 17H20")),
    recents:      s(P("M8 6V18") + P("M12 6V18") + P("M16 6V18")),
    androidHome:  s(`<rect x="6" y="6" width="12" height="12" rx="3" stroke="#757575" stroke-width="2"/>`),
  };
})();

function navIcon(svg: string, maps: BuildMaps): FrameNode {
  const i = makeBoundIcon(svg, scv(maps, "color/icon/gray")); // icon-vector-allow: 휴대폰 셸 네비바 크롬 아이콘 — DS UI 아이콘 아님
  i.name = "icon"; try { i.resize(24, 24); } catch (e) { /* */ }
  return i;
}

// 탭 개수 글리프(둥근 사각 + 숫자 "29") — 고정 24×24 프레임.
async function navTabsIcon(maps: BuildMaps): Promise<FrameNode> {
  const f = figma.createFrame();
  f.name = "tabs"; f.fills = []; f.clipsContent = false; f.resize(24, 24);
  const r = figma.createRectangle();
  r.x = 4; r.y = 5; r.resize(16, 14); r.cornerRadius = 2;
  r.fills = []; r.strokes = [boundPaint(scv(maps, "color/icon/gray"))]; r.strokeWeight = 2;
  f.appendChild(r);
  const t = await makeBoundText("29", 9, "Medium", scv(maps, "color/icon/gray"));
  try { t.textAutoResize = "NONE"; t.resize(24, 14); t.textAlignHorizontal = "CENTER"; t.textAlignVertical = "CENTER"; t.x = 0; t.y = 5; } catch (e) { /* */ }
  f.appendChild(t);
  return f;
}

// 안드로이드 시스템 내비(최근·홈·뒤로) 를 target 에 채운다. App 컴포넌트·Web 하단행 공용.
function populateAndroidNav(target: FrameNode | ComponentNode, maps: BuildMaps): void {
  target.layoutMode = "HORIZONTAL"; target.primaryAxisSizingMode = "FIXED"; target.counterAxisSizingMode = "FIXED";
  target.resize(360, 45);
  target.primaryAxisAlignItems = "SPACE_BETWEEN"; target.counterAxisAlignItems = "CENTER";
  target.paddingLeft = 48; target.paddingRight = 48; target.paddingTop = 0; target.paddingBottom = 0;
  target.fills = [boundPaint(scv(maps, "color/bg/level-0"))];
  target.appendChild(navIcon(NAV_SVG.recents, maps));
  target.appendChild(navIcon(NAV_SVG.androidHome, maps));
  target.appendChild(navIcon(NAV_SVG.chevronLeft, maps));
}

// 브라우저 툴바(뒤로·앞으로·홈·북마크·탭·메뉴) — Web 변형 상단행.
async function buildBrowserToolbarRow(maps: BuildMaps): Promise<FrameNode> {
  const row = figma.createFrame();
  row.name = "browser-toolbar";
  row.layoutMode = "HORIZONTAL"; row.primaryAxisSizingMode = "FIXED"; row.counterAxisSizingMode = "FIXED";
  row.resize(360, 50);
  row.primaryAxisAlignItems = "SPACE_BETWEEN"; row.counterAxisAlignItems = "CENTER";
  row.paddingLeft = 16; row.paddingRight = 16; row.paddingTop = 0; row.paddingBottom = 0;
  row.fills = [boundPaint(scv(maps, "color/bg/level-0"))];
  row.appendChild(navIcon(NAV_SVG.chevronLeft, maps));
  row.appendChild(navIcon(NAV_SVG.chevronRight, maps));
  row.appendChild(navIcon(NAV_SVG.home, maps));
  row.appendChild(navIcon(NAV_SVG.star, maps));
  row.appendChild(await navTabsIcon(maps));
  row.appendChild(navIcon(NAV_SVG.menu, maps));
  return row;
}

async function buildNavBar(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const app = figma.createComponent();
  app.name = "Platform=App";
  populateAndroidNav(app, maps);

  const web = figma.createComponent();
  web.name = "Platform=Web";
  web.layoutMode = "VERTICAL"; web.primaryAxisSizingMode = "AUTO"; web.counterAxisSizingMode = "FIXED";
  web.resize(360, 95); web.itemSpacing = 0; web.fills = [];
  const toolbar = await buildBrowserToolbarRow(maps);
  toolbar.layoutAlign = "STRETCH"; web.appendChild(toolbar);
  const nav = figma.createFrame(); nav.name = "android-nav";
  populateAndroidNav(nav, maps);
  nav.layoutAlign = "STRETCH"; web.appendChild(nav);

  const appKeyboard = figma.createComponent();
  appKeyboard.name = "Platform=App + Keyboard";
  appKeyboard.layoutMode = "VERTICAL"; appKeyboard.primaryAxisSizingMode = "FIXED"; appKeyboard.counterAxisSizingMode = "FIXED";
  appKeyboard.resize(360, 341); appKeyboard.itemSpacing = 0; appKeyboard.fills = [];
  const appKeyboardSurface = await buildKeyboardFrame(maps);
  appKeyboardSurface.layoutAlign = "STRETCH"; appKeyboard.appendChild(appKeyboardSurface);
  const appKeyboardNav = figma.createFrame(); appKeyboardNav.name = "android-nav";
  populateAndroidNav(appKeyboardNav, maps);
  appKeyboardNav.layoutAlign = "STRETCH"; appKeyboard.appendChild(appKeyboardNav);

  const webKeyboard = figma.createComponent();
  webKeyboard.name = "Platform=Web + Keyboard";
  webKeyboard.layoutMode = "VERTICAL"; webKeyboard.primaryAxisSizingMode = "FIXED"; webKeyboard.counterAxisSizingMode = "FIXED";
  webKeyboard.resize(360, 391); webKeyboard.itemSpacing = 0; webKeyboard.fills = [];
  const webKeyboardSurface = await buildKeyboardFrame(maps);
  webKeyboardSurface.layoutAlign = "STRETCH"; webKeyboard.appendChild(webKeyboardSurface);
  const webKeyboardToolbar = await buildBrowserToolbarRow(maps);
  webKeyboardToolbar.layoutAlign = "STRETCH"; webKeyboard.appendChild(webKeyboardToolbar);
  const webKeyboardNav = figma.createFrame(); webKeyboardNav.name = "android-nav";
  populateAndroidNav(webKeyboardNav, maps);
  webKeyboardNav.layoutAlign = "STRETCH"; webKeyboard.appendChild(webKeyboardNav);

  const set = figma.combineAsVariants([app, web, appKeyboard, webKeyboard], figma.currentPage);
  set.name = "NavBar";
  set.x = 0; set.y = originY;
  // 열=App/Web, 행=Default/Keyboard. 기존 App/Web 과 키보드 결합형을 한 세트에서 비교한다.
  const opts: SpecOpts = {
    title: "NavBar", colHeaders: ["App", "Web"], rowLabels: ["Default", "Keyboard"],
    cellAt: (r, c) => r === 0 ? (c === 0 ? app : web) : (c === 0 ? appKeyboard : webKeyboard),
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 400, cellH: 400, rowLabelW: 56,
    leftAlignCells: true,
  };
  const lightBottomY = await decorateSetFlat(set, opts, maps);
  // 다크 = 라이트 우측(buildSpec 기본 W+80). 좁은 Platform 컴포넌트(StatusBar·NavBar·CI)는 우측, 넓은 것은 아래 — river 결정 2026-06-25
  let bottomY = lightBottomY;
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Platform/OS Keyboard (Android · Appearance 대응 영문 QWERTY) ────────────
// 로그인 화면의 실제 시스템 키보드가 원본 캡처에서 누락된 문제를 보완하는 편집 가능한 플랫폼 셸.
// 앱 UI가 아니라 OS 크롬이므로 StatusBar/NavBar 와 동일하게 소스 소유 벡터 글리프를 사용한다.
// 기준 이미지: reports/screen-rebuild/modu-app/login-mobile/assets/android-keyboard-reference.png
const KEYBOARD_TOOL_SVG = (() => {
  const s = (body: string) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const p = (d: string) => `<path d="${d}" stroke="#757575" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
  return {
    emoji: s(`<circle cx="12" cy="12" r="8" stroke="#757575" stroke-width="1.7"/><circle cx="9" cy="10" r="1" fill="#757575"/><circle cx="15" cy="10" r="1" fill="#757575"/>${p("M8.5 14C9.4 15.3 10.6 16 12 16C13.4 16 14.6 15.3 15.5 14")}`),
    mic: s(p("M9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V11C15 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V6Z") + p("M6.5 10.5V11C6.5 14.04 8.96 16.5 12 16.5C15.04 16.5 17.5 14.04 17.5 11V10.5") + p("M12 16.5V20") + p("M9 20H15")),
    settings: s(`<circle cx="12" cy="12" r="3" stroke="#757575" stroke-width="1.7"/>${p("M12 3V5M12 19V21M3 12H5M19 12H21M5.64 5.64L7.05 7.05M16.95 16.95L18.36 18.36M18.36 5.64L16.95 7.05M7.05 16.95L5.64 18.36")}`),
    search: s(`<circle cx="10.5" cy="10.5" r="6.5" stroke="#757575" stroke-width="1.7"/>${p("M15.5 15.5L20 20")}`),
    translate: s(p("M4 5H13M8.5 3V5M6 8C7 10.5 9 12.5 12 14M11.5 8C10 12 7.5 15 4 17") + p("M14 19L17.5 10L21 19M15.2 16H19.8")),
    more: s(`<circle cx="6" cy="12" r="1.3" fill="#757575"/><circle cx="12" cy="12" r="1.3" fill="#757575"/><circle cx="18" cy="12" r="1.3" fill="#757575"/>`),
    shift: s(p("M5 12L12 5L19 12H15.5V19H8.5V12H5Z")),
    backspace: s(p("M9 7H20V17H9L4 12L9 7Z") + p("M12 10L16 14M16 10L12 14")),
    enter: s(p("M19 6V14H8") + p("M11 10L7 14L11 18")),
  };
})();

function keyboardToolIcon(svg: string, maps: BuildMaps, name: string): FrameNode {
  const icon = makeBoundIcon(svg, scv(maps, "color/icon/gray")); // icon-vector-allow: Android 키보드 OS 크롬
  icon.name = name;
  try { icon.resize(24, 24); } catch (e) { /* */ }
  return icon;
}

async function buildKeyboardFrame(maps: BuildMaps): Promise<FrameNode> {
  const keyboard = figma.createFrame();
  keyboard.name = "keyboard";
  keyboard.resize(360, 296); keyboard.layoutMode = "NONE";
  keyboard.fills = [boundPaint(scv(maps, "color/bg/level-1"))];

  const toolbar = figma.createFrame();
  toolbar.name = "toolbar"; toolbar.resize(360, 42); toolbar.x = 0; toolbar.y = 0;
  toolbar.layoutMode = "HORIZONTAL"; toolbar.primaryAxisSizingMode = "FIXED"; toolbar.counterAxisSizingMode = "FIXED";
  toolbar.primaryAxisAlignItems = "SPACE_BETWEEN"; toolbar.counterAxisAlignItems = "CENTER";
  toolbar.paddingLeft = 18; toolbar.paddingRight = 10; toolbar.fills = [];
  toolbar.appendChild(keyboardToolIcon(KEYBOARD_TOOL_SVG.emoji, maps, "emoji"));
  toolbar.appendChild(keyboardToolIcon(KEYBOARD_TOOL_SVG.mic, maps, "microphone"));
  toolbar.appendChild(keyboardToolIcon(KEYBOARD_TOOL_SVG.settings, maps, "settings"));
  toolbar.appendChild(keyboardToolIcon(KEYBOARD_TOOL_SVG.search, maps, "search"));
  toolbar.appendChild(keyboardToolIcon(KEYBOARD_TOOL_SVG.translate, maps, "translate"));
  toolbar.appendChild(keyboardToolIcon(KEYBOARD_TOOL_SVG.more, maps, "more"));
  keyboard.appendChild(toolbar);

  const makeKey = async (label: string, width: number, kind: "letter" | "function" = "letter", iconSvg?: string): Promise<FrameNode> => {
    const key = figma.createFrame();
    key.name = label || "space"; key.layoutMode = "HORIZONTAL";
    key.primaryAxisSizingMode = "FIXED"; key.counterAxisSizingMode = "FIXED";
    key.resize(width, 38); key.primaryAxisAlignItems = "CENTER"; key.counterAxisAlignItems = "CENTER";
    bindRadius(key, maps, "radius/4");
    key.fills = [boundPaint(scv(maps, kind === "letter" ? "color/bg/level-0" : "color/bg/level-2"))];
    if (kind === "letter") {
      key.strokes = [boundPaint(scv(maps, "color/bg/level-2"))]; key.strokeWeight = 1; key.strokeAlign = "INSIDE";
    } else key.strokes = [];
    if (iconSvg) key.appendChild(keyboardToolIcon(iconSvg, maps, label));
    else if (label) key.appendChild(await makeBoundText(label, label.length > 2 ? 14 : 18, "Medium", scv(maps, "color/text/body/primary")));
    return key;
  };
  const makeRow = (name: string, y: number, gap: number): FrameNode => {
    const row = figma.createFrame();
    row.name = name; row.resize(346, 38); row.x = 7; row.y = y;
    row.layoutMode = "HORIZONTAL"; row.primaryAxisSizingMode = "FIXED"; row.counterAxisSizingMode = "FIXED";
    row.primaryAxisAlignItems = "CENTER"; row.counterAxisAlignItems = "CENTER"; row.itemSpacing = gap; row.fills = [];
    keyboard.appendChild(row); return row;
  };
  const appendLabels = async (row: FrameNode, labels: string[], width: number): Promise<void> => {
    for (const label of labels) row.appendChild(await makeKey(label, width));
  };

  const numbers = makeRow("number-row", 47, 6); await appendLabels(numbers, ["1","2","3","4","5","6","7","8","9","0"], 29);
  const qwerty = makeRow("qwerty-row", 95, 6); await appendLabels(qwerty, ["q","w","e","r","t","y","u","i","o","p"], 29);
  const home = makeRow("home-row", 143, 6); await appendLabels(home, ["a","s","d","f","g","h","j","k","l"], 29);
  const shift = makeRow("shift-row", 191, 6);
  shift.appendChild(await makeKey("shift", 44, "function", KEYBOARD_TOOL_SVG.shift));
  await appendLabels(shift, ["z","x","c","v","b","n","m"], 29);
  shift.appendChild(await makeKey("backspace", 44, "function", KEYBOARD_TOOL_SVG.backspace));
  const bottom = makeRow("bottom-row", 239, 5);
  bottom.appendChild(await makeKey("!#1", 44, "function"));
  bottom.appendChild(await makeKey("한/영", 48, "function"));
  bottom.appendChild(await makeKey(",", 30));
  bottom.appendChild(await makeKey("", 119));
  bottom.appendChild(await makeKey(".", 30));
  bottom.appendChild(await makeKey("enter", 50, "function", KEYBOARD_TOOL_SVG.enter));
  return keyboard;
}

// ── Platform/LoginGNB (PC 전용 1920×56, 단일 variant) ──────────────────────────
// 정본: V3.0 Core 페이지 334:1326. 좌=삼성로고+[서비스명], 우=지구본+한국어, 하단 1px 선.
async function buildLoginGNB(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const W = 1920, H = 56;
  const comp = figma.createComponent();
  comp.name = "LoginGNB";
  comp.layoutMode = "HORIZONTAL"; comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
  comp.resize(W, H); comp.primaryAxisAlignItems = "SPACE_BETWEEN"; comp.counterAxisAlignItems = "CENTER";
  comp.paddingLeft = 320; comp.paddingRight = 320; comp.paddingTop = 12; comp.paddingBottom = 12;
  comp.fills = [boundPaint(scv(maps, "color/navigation/bg"))];
  comp.strokes = [boundPaint(scv(maps, "color/line/gray/subtle"))];
  comp.strokeAlign = "INSIDE";
  comp.strokeTopWeight = 0; comp.strokeRightWeight = 0; comp.strokeLeftWeight = 0; comp.strokeBottomWeight = 1;

  // 좌측: [서비스명]만 (삼성 로고 제거 2026-06-24 — LoginGNB 에선 서비스명만 노출, 사용자 결정)
  const left = figma.createFrame();
  left.name = "service-group"; left.layoutMode = "HORIZONTAL";
  left.primaryAxisSizingMode = "AUTO"; left.counterAxisSizingMode = "AUTO";
  left.counterAxisAlignItems = "CENTER"; left.itemSpacing = 11; left.fills = [];
  comp.appendChild(left);
  left.layoutSizingHorizontal = "HUG"; left.layoutSizingVertical = "HUG";
  const svcText = await makeBoundText("[서비스명]", 16, "Bold", scv(maps, "color/text/title/primary"));
  svcText.name = "service-name"; left.appendChild(svcText);

  // 우측: 지구본 + 한국어
  const right = figma.createFrame();
  right.name = "language-group"; right.layoutMode = "HORIZONTAL";
  right.primaryAxisSizingMode = "AUTO"; right.counterAxisSizingMode = "AUTO";
  right.counterAxisAlignItems = "CENTER"; right.itemSpacing = 8; right.fills = [];
  comp.appendChild(right);
  right.layoutSizingHorizontal = "HUG"; right.layoutSizingVertical = "HUG";
  const globeIcon = await makeIconInstance("globe", scv(maps, "color/icon/gray-dark"), 24, GNB_UTIL_SVGS.lang);
  globeIcon.name = "globe-icon"; right.appendChild(globeIcon);
  const langText = await makeBoundText("한국어", 14, "Medium", scv(maps, "color/icon/gray-dark"));
  langText.name = "language-label"; right.appendChild(langText);

  setLightMode(comp, maps);
  const set = figma.combineAsVariants([comp], figma.currentPage);
  set.name = "LoginGNB"; set.x = 0; set.y = originY;

  const opts: SpecOpts = {
    title: "LoginGNB", colHeaders: [""], rowLabels: [""], cellAt: () => comp,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: W + 40, cellH: H + 24, rowLabelW: 0,
  };
  const lightBottomY = await decorateSetFlat(set, opts, maps);
  opts.darkOffset = { x: 0, y: lightBottomY + 80 };
  let bottomY = lightBottomY;
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Platform/WebTabBar (PC 전용 1920×101, 단일 variant) ──────────────────────
// 정본: V3.0 Core 페이지 335:3099. 탭행(38)+주소행(62)+하단 1px 선.
async function buildWebTabBar(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const W = 1920, H = 101;
  const comp = figma.createComponent();
  comp.name = "WebTabBar";
  comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
  comp.resize(W, H); comp.itemSpacing = 0; comp.paddingTop = 0; comp.paddingBottom = 0; comp.paddingLeft = 0; comp.paddingRight = 0;
  comp.fills = [boundPaint(scv(maps, "color/scroll/bg"))];
  comp.strokes = [boundPaint(scv(maps, "color/line/gray/subtle"))];
  comp.strokeAlign = "INSIDE";
  comp.strokeTopWeight = 0; comp.strokeRightWeight = 0; comp.strokeLeftWeight = 0; comp.strokeBottomWeight = 1;

  // ── 탭 행 (38px): 활성탭 + 우측 윈도우 컨트롤
  const tabRow = figma.createFrame();
  tabRow.name = "tab-row"; tabRow.layoutMode = "HORIZONTAL";
  tabRow.primaryAxisSizingMode = "FIXED"; tabRow.counterAxisSizingMode = "FIXED";
  tabRow.resize(W, 38); tabRow.primaryAxisAlignItems = "MIN"; tabRow.counterAxisAlignItems = "MAX";
  tabRow.paddingLeft = 8; tabRow.paddingRight = 8; tabRow.itemSpacing = 2; tabRow.fills = [];
  comp.appendChild(tabRow);
  tabRow.layoutSizingHorizontal = "FILL"; tabRow.layoutSizingVertical = "FIXED";

  // 활성 탭 (상단 둥근 모서리, bg=surface/default)
  const activeTab = figma.createFrame();
  activeTab.name = "tab-active"; activeTab.layoutMode = "HORIZONTAL";
  activeTab.primaryAxisSizingMode = "FIXED"; activeTab.counterAxisSizingMode = "FIXED";
  activeTab.resize(200, 32); activeTab.primaryAxisAlignItems = "MIN"; activeTab.counterAxisAlignItems = "CENTER";
  activeTab.paddingLeft = 10; activeTab.paddingRight = 6; activeTab.itemSpacing = 6;
  activeTab.fills = [boundPaint(scv(maps, "color/bg/level-0"))];
  try { (activeTab as FrameNode & { topLeftRadius: number; topRightRadius: number; bottomLeftRadius: number; bottomRightRadius: number }).topLeftRadius = 6; (activeTab as any).topRightRadius = 6; (activeTab as any).bottomLeftRadius = 0; (activeTab as any).bottomRightRadius = 0; } catch {}
  tabRow.appendChild(activeTab);

  const favicon = figma.createRectangle();
  favicon.name = "favicon"; favicon.resize(16, 16); favicon.cornerRadius = 3;
  favicon.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.6, b: 1.0 } }];
  activeTab.appendChild(favicon);
  const tabTitle = await makeBoundText("[서비스명]", 13, "Regular", scv(maps, "color/text/body/secondary"));
  tabTitle.name = "tab-title"; activeTab.appendChild(tabTitle);
  const tabClose = await makeIconInstance("remove", scv(maps, "color/icon/gray"), 16, REMOVE_ICON_SVG);
  tabClose.name = "tab-close"; activeTab.appendChild(tabClose);

  // 스페이서 + 윈도우 컨트롤
  const spacer = figma.createFrame();
  spacer.name = "spacer"; spacer.fills = []; spacer.resize(1, 32);
  tabRow.appendChild(spacer);
  spacer.layoutSizingHorizontal = "FILL"; spacer.layoutSizingVertical = "FIXED";

  const winCtrl = figma.createFrame();
  winCtrl.name = "window-controls"; winCtrl.layoutMode = "HORIZONTAL";
  winCtrl.primaryAxisSizingMode = "AUTO"; winCtrl.counterAxisSizingMode = "FIXED";
  winCtrl.resize(96, 38); winCtrl.itemSpacing = 20; winCtrl.counterAxisAlignItems = "CENTER";
  winCtrl.paddingLeft = 8; winCtrl.paddingRight = 8; winCtrl.fills = [];
  tabRow.appendChild(winCtrl);
  winCtrl.layoutSizingHorizontal = "HUG"; winCtrl.layoutSizingVertical = "FILL";
  // 윈도우 스타일 창 컨트롤: 최소화(─) · 최대화(□) · 닫기(✕). (iOS 신호등 점 → Windows 글리프, 사용자 결정 2026-06-25)
  const winGlyphs: { name: string; svg: string }[] = [
    { name: "minimize", svg: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6.5H10" stroke="#757575" stroke-width="1.2" stroke-linecap="round"/></svg>` },
    { name: "maximize", svg: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.6" y="2.6" width="6.8" height="6.8" rx="0.6" stroke="#757575" stroke-width="1.2"/></svg>` },
    { name: "close",    svg: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3L9 9M9 3L3 9" stroke="#757575" stroke-width="1.2" stroke-linecap="round"/></svg>` },
  ];
  for (const g of winGlyphs) {
    const ic = makeBoundIcon(g.svg, scv(maps, "color/icon/gray")); // icon-vector-allow: 웹 탭바 윈도우 컨트롤 크롬 — DS UI 아이콘 아님
    ic.name = g.name; try { ic.resize(12, 12); } catch (e) { /* */ }
    winCtrl.appendChild(ic);
  }

  // ── 주소 행 (63px): ←→↺ + 주소 pill
  const addrRow = figma.createFrame();
  addrRow.name = "address-row"; addrRow.layoutMode = "HORIZONTAL";
  addrRow.primaryAxisSizingMode = "FIXED"; addrRow.counterAxisSizingMode = "FIXED";
  addrRow.resize(W, 63); addrRow.primaryAxisAlignItems = "MIN"; addrRow.counterAxisAlignItems = "CENTER";
  addrRow.paddingLeft = 16; addrRow.paddingRight = 16; addrRow.itemSpacing = 8;
  addrRow.fills = [boundPaint(scv(maps, "color/bg/level-0"))];
  comp.appendChild(addrRow);
  addrRow.layoutSizingHorizontal = "FILL"; addrRow.layoutSizingVertical = "FIXED";

  addrRow.appendChild(navIcon(NAV_SVG.chevronLeft, maps));
  addrRow.appendChild(navIcon(NAV_SVG.chevronRight, maps));
  const refreshNode = makeBoundIcon(SHELL_REFRESH_SVG, scv(maps, "color/icon/gray")); // icon-vector-allow: 웹 탭바 새로고침 크롬 — DS UI 아이콘 아님
  refreshNode.name = "nav-refresh"; try { refreshNode.resize(24, 24); } catch {}
  addrRow.appendChild(refreshNode);

  const pill = figma.createFrame();
  pill.name = "address-pill"; pill.layoutMode = "HORIZONTAL";
  pill.primaryAxisSizingMode = "FIXED"; pill.counterAxisSizingMode = "FIXED";
  pill.resize(400, 27); pill.cornerRadius = 20;
  pill.paddingLeft = 16; pill.paddingRight = 16; pill.primaryAxisAlignItems = "MIN"; pill.counterAxisAlignItems = "CENTER";
  pill.fills = [boundPaint(scv(maps, "color/bg/level-3"))];
  addrRow.appendChild(pill);
  pill.layoutSizingHorizontal = "FILL"; pill.layoutSizingVertical = "FIXED";
  const urlText = await makeBoundText("https://", 13, "Regular", scv(maps, "color/text/body/secondary"));
  urlText.name = "url-text"; pill.appendChild(urlText);

  setLightMode(comp, maps);
  const set = figma.combineAsVariants([comp], figma.currentPage);
  set.name = "WebTabBar"; set.x = 0; set.y = originY;

  const opts: SpecOpts = {
    title: "WebTabBar", colHeaders: [""], rowLabels: [""], cellAt: () => comp,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: W + 40, cellH: H + 24, rowLabelW: 0,
  };
  const lightBottomY = await decorateSetFlat(set, opts, maps);
  opts.darkOffset = { x: 0, y: lightBottomY + 80 };
  let bottomY = lightBottomY;
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── C/IMG/Logo/Samsung_30 (134×30 삼성 로고 래퍼) ────────────────────────────
// 정본: V3.0 Core 페이지 333:165. key=9b32bb9ada9e84cdd18550f641389874858fa6ee.
async function buildSamsungLogoComponent(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const W = 134, H = 30;
  const comp = figma.createComponent();
  comp.name = "C/IMG/Logo/Samsung_30";
  comp.resize(W, H); comp.fills = [];
  const logoInst = await getSamsungLogoInstance(H);
  logoInst.x = 0; logoInst.y = 0;
  comp.appendChild(logoInst);

  setLightMode(comp, maps);
  const set = figma.combineAsVariants([comp], figma.currentPage);
  set.name = "C/IMG/Logo/Samsung_30"; set.x = 0; set.y = originY;
  const sh = (typeof set.height === "number" && set.height > 0) ? set.height : H;
  return { set, bottomY: originY + sh };
}

// ── CI (Brand×Color 로고 변형세트) ────────────────────────────────────────────
// 에스원 3종: S1_LOGO_SVG 벡터 + Variable 색 바인딩(White/Blue/Dark)
// 삼성 3종: 이미지 fill(imageHash — V3.0 TEST 파일 내장, 타 파일 미지원)
// 크기: 에스원=78.75×30, 삼성=134×36 (Brand별 각자 크기 — 사용자 결정 2026-06-23)
//   2026-08-21 river 결정: 에스원 42×16 → **78.75×30** 으로 정정. 원본 CI(≈77.86×30)보다 작게 들어가
//   있었다(로그인 패턴 신고). 78.75×30 은 42×16 의 정확히 1.875배라 워드마크 비율(2.625)이 보존된다
//   — 지시값 77.86×30(비율 2.595)을 그대로 쓰면 로고가 세로로 ~1% 눌리므로 높이 30 을 기준으로 맞췄다.
//   viewBox 는 그대로 두고 svg width/height 만 키워 path 를 비례 확대한다(공유 상수 S1_LOGO_SVG 는
//   Footer 로고가 42×16 으로 쓰므로 상수 자체를 고치지 않는다). 삼성 134×36 무변경.
async function buildCI(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  // Blue=CI 브랜드색은 Foundation brand/ci 를 직접 바인딩(Semantic 별칭 color/icon/brand-ci 제거, 2026-06-23).
  const S1_COLORS: { color: string; v: Variable }[] = [
    { color: "White", v: scv(maps, "color/icon/white") },
    { color: "Blue",  v: requireVar(maps.foundationColor, "brand/ci", "Foundation Color") },
    { color: "Dark",  v: scv(maps, "color/icon/gray") },
  ];
  const SAM_HASHES: { color: string; hash: string }[] = [
    { color: "White", hash: "5ef070ce43a101a072964c656c0e666fe81e4f78" },
    { color: "Blue",  hash: "8de26dc1976bd0a64ea5b7207b6bf6d9e0396053" },
    { color: "Dark",  hash: "100a4d3fdd0a5a9304c8251792f2d96089ac458a" },
  ];

  // 변종 그리드 배치 — combineAsVariants 가 위치를 보존하므로, 위치 미지정 시 전 variant 가
  // (0,0)에 겹친다(CI 는 스펙 프레임이 없어 겹침이 그대로 노출됨). 2행(Brand)×3열(Color)로 분리.
  // (2026-06-24 수정: CI 로고 두 개 겹침 신고)
  const CI_COL = 158, CI_ROW = 60;
  // 에스원 CI 크기(2026-08-21 정정) — 42×16 의 1.875배. viewBox(0 0 42 16) 는 유지하고 svg 의
  // width/height 만 바꿔 path 를 비례 확대한다(비율 2.625 보존 = 왜곡 0).
  const S1_CI_W = 78.75, S1_CI_H = 30;
  const S1_CI_SVG = S1_LOGO_SVG.replace('width="42" height="16"', `width="${S1_CI_W}" height="${S1_CI_H}"`);
  // 조용한 결함 차단 — 상수의 속성 표기가 바뀌어 치환이 no-op 되면 로고가 42×16 으로 남고
  // 프레임만 커져 "왼쪽 위에 작게 박힌 로고"가 된다. 실패를 즉시 드러낸다.
  if (S1_CI_SVG === S1_LOGO_SVG) throw new Error('buildCI: S1_LOGO_SVG 의 width/height 치환 실패 — svg 속성 표기 변경 확인 필요');
  const s1Comps: ComponentNode[] = [];
  S1_COLORS.forEach(({ color, v }, i) => {
    const comp = figma.createComponent();
    comp.name = `Brand=에스원, Color=${color}`;
    comp.resize(S1_CI_W, S1_CI_H); comp.fills = [];
    comp.x = i * CI_COL; comp.y = 0;
    const logo = figma.createNodeFromSvg(S1_CI_SVG); // icon-vector-allow: CI 브랜드 워드마크 벡터 자산
    logo.name = "logo";
    rebindIconColor(logo, v);
    comp.appendChild(logo);
    setLightMode(comp, maps);
    s1Comps.push(comp);
  });

  const samComps: ComponentNode[] = [];
  SAM_HASHES.forEach(({ color, hash }, i) => {
    const comp = figma.createComponent();
    comp.name = `Brand=삼성, Color=${color}`;
    comp.resize(134, 36); comp.fills = [];
    comp.x = i * CI_COL; comp.y = CI_ROW;
    const rect = figma.createRectangle();
    rect.name = `Samsung_Orig_Wordmark_${color.toUpperCase()}_RGB`;
    rect.resize(134, 36);
    rect.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: hash }]; // icon-vector-allow: 삼성 워드마크 이미지 에셋
    comp.appendChild(rect);
    setLightMode(comp, maps);
    samComps.push(comp);
  });

  const set = figma.combineAsVariants([...s1Comps, ...samComps], figma.currentPage);
  set.name = "CI";
  set.x = 0; set.y = originY;
  // CI 섹션 배경 = gray/50 — White 로고가 흰 배경에 묻히지 않게(사용자 결정 2026-06-25). Foundation 직바인딩.
  try { set.fills = [boundPaint(requireVar(maps.foundationColor, "gray/50", "Foundation Color"))]; } catch (e) { /* */ }
  setLightMode(set, maps);
  const sh = (typeof set.height === "number" && set.height > 0) ? set.height : 84;
  return { set, bottomY: originY + sh };
}

// ── Multi Toggle Element — 개별 셀 변형세트 ────────────────────────────────────
// 정본: V2.4 pc_multi-toggle. 버튼 토큰(secondary/primary/disabled)을 직접 사용.
// 32 variants = position(4) × state(4) × size(2). variant명: "position=first, state=default, size=md"
// 위치별 코너 + 보더 변: first=좌상·좌하 / middle-left·middle-right=없음 / last=우상·우하
// 보더 변(strokeTopWeight 등): first/middle-left=상·하·좌(우=0), middle-right/last=상·하·우(좌=0)
async function buildMultiToggleElement(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const positions = ["first", "middle-left", "middle-right", "last"] as const;
  type Pos = typeof positions[number];
  const states  = ["default", "hover", "selected", "disabled"] as const;
  type St  = typeof states[number];
  const sizes   = [
    { id: "md", h: 44, padX: 12, font: 14, minW: 64 }, // 최소 width = sizing/64 (사용자 결정 2026-06-26)
    { id: "sm", h: 34, padX:  8, font: 14, minW: 56 }, // 최소 width = sizing/56
  ] as const;

  // 상태별 색 슬롯 — 버튼 토큰 직접 사용
  const colorSlot = (st: St): { bg: string; border: string; text: string } => {
    switch (st) {
      case "default":  return { bg: "color/button/bg/secondary--default", border: "color/button/border/secondary--default", text: "color/button/label/secondary--default" };
      case "hover":    return { bg: "color/button/bg/secondary--hover",   border: "color/button/border/secondary--hover",   text: "color/button/label/secondary--hover"   };
      case "selected": return { bg: "color/button/bg/primary--default",   border: "color/button/border/primary--default",   text: "color/button/label/primary--default"   };
      case "disabled": return { bg: "color/button/bg/disabled",           border: "color/button/border/disabled",           text: "color/button/label/disabled"           };
    }
  };

  // 위치별 코너 반경 (개별 코너, 리터럴 4)
  const cornerConfig = (pos: Pos): { tl: number; tr: number; bl: number; br: number } => {
    switch (pos) {
      case "first":        return { tl: 4, tr: 0, bl: 4, br: 0 };
      case "last":         return { tl: 0, tr: 4, bl: 0, br: 4 };
      case "middle-left":  return { tl: 0, tr: 0, bl: 0, br: 0 };
      case "middle-right": return { tl: 0, tr: 0, bl: 0, br: 0 };
    }
  };

  // 위치별 보더 변 두께 (state 무관, position으로만 결정)
  // first/middle-left: 상·하·좌 (우=0) / middle-right/last: 상·하·우 (좌=0)
  const strokeSides = (pos: Pos): { t: number; r: number; b: number; l: number } => {
    switch (pos) {
      case "first":        return { t: 1, r: 0, b: 1, l: 1 };
      case "middle-left":  return { t: 1, r: 0, b: 1, l: 1 };
      case "middle-right": return { t: 1, r: 1, b: 1, l: 0 };
      case "last":         return { t: 1, r: 1, b: 1, l: 0 };
    }
  };

  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; posIdx: number; stIdx: number; szIdx: number }[] = [];

  for (let szIdx = 0; szIdx < sizes.length; szIdx++) {
    const sz = sizes[szIdx];
    for (let posIdx = 0; posIdx < positions.length; posIdx++) {
      const pos = positions[posIdx];
      const cor = cornerConfig(pos);
      const sides = strokeSides(pos);
      for (let stIdx = 0; stIdx < states.length; stIdx++) {
        const st = states[stIdx];
        const slot = colorSlot(st);

        const comp = figma.createComponent();
        comp.name = `position=${pos}, state=${st}, size=${sz.id}`;

        // 오토레이아웃: 가로, 가운데 정렬, 높이 고정
        comp.layoutMode = "HORIZONTAL";
        comp.primaryAxisAlignItems = "CENTER";
        comp.counterAxisAlignItems = "CENTER";
        comp.primaryAxisSizingMode = "AUTO";
        comp.counterAxisSizingMode = "FIXED";
        comp.paddingLeft  = sz.padX;
        comp.paddingRight = sz.padX;

        // 배경·보더
        comp.fills   = [boundPaint(scv(maps, slot.bg))];
        comp.strokes = [boundPaint(scv(maps, slot.border))];
        comp.strokeAlign = "INSIDE";
        // 개별 변 두께 — strokeWeight=0(플레이스홀더), 개별 변으로 덮음
        comp.strokeWeight = 1; // 타입 맞춤 (실제 렌더는 개별 변)
        try {
          (comp as any).strokeTopWeight    = sides.t;
          (comp as any).strokeRightWeight  = sides.r;
          (comp as any).strokeBottomWeight = sides.b;
          (comp as any).strokeLeftWeight   = sides.l;
        } catch (e) { /* API 미지원 환경(mock) 무시 */ }

        // 개별 코너 반경
        comp.topLeftRadius     = cor.tl;
        comp.topRightRadius    = cor.tr;
        comp.bottomLeftRadius  = cor.bl;
        comp.bottomRightRadius = cor.br;

        // 텍스트
        const txt = await makeBoundText("항목", sz.font, "Medium", scv(maps, slot.text));
        txt.textAlignHorizontal = "CENTER"; // 글자 중앙정렬(min-width 로 넓어진 셀에서 좌측 쏠림 방지)
        comp.appendChild(txt);
        try { (txt as any).layoutGrow = 1; } catch (e) { /* */ } // 셀 너비를 채워 중앙정렬 보장
        comp.resize(comp.width, sz.h);
        try { comp.minWidth = sz.minW; } catch (e) { /* mock 미지원 무시 */ } // 셀 최소 너비(md 64 · sm 56)

        setLightMode(comp, maps);
        comps.push(comp);
        cells.push({ comp, posIdx, stIdx, szIdx });
        // BUILT_COMPS 등록 — 조합형태(buildMultiToggle)가 pick() 패턴으로 가져감
        BUILT_COMPS[`MultiToggle:${pos}/${st}/${sz.id}`] = comp;
      }
    }
  }

  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Multi Toggle Element";
  set.x = 0; set.y = originY;
  BUILT_SETS["Multi Toggle Element"] = set;

  // 스펙 시트: 행 = position×size(8행), 열 = state(4열)
  const ROW_DEFS: { pos: Pos; szId: string; szIdx: number; posIdx: number }[] = [];
  for (let szIdx = 0; szIdx < sizes.length; szIdx++) {
    for (let posIdx = 0; posIdx < positions.length; posIdx++) {
      ROW_DEFS.push({ pos: positions[posIdx], szId: sizes[szIdx].id, szIdx, posIdx });
    }
  }
  const STATE_LABELS = ["Default", "Hover", "Selected", "Disabled"];
  const opts: SpecOpts = {
    title: "Multi Toggle Element",
    colHeaders: STATE_LABELS,
    rowLabels: ROW_DEFS.map((r) => `${r.pos} / ${r.szId}`),
    cellAt: (r, c) => {
      const rd = ROW_DEFS[r];
      return cells.find((x) => x.posIdx === rd.posIdx && x.szIdx === rd.szIdx && x.stIdx === c)?.comp ?? null;
    },
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY,
    cellW: 120, cellH: 52, rowLabelW: 160,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Multi Toggle — 요소 셀(Multi Toggle Element)을 조합한 완성형 ─────────────────
// 6 variants = Size(md·sm) × Selected(Left·Center·Right). variant명: "Size=md, Selected=Left"
// 구성: Multi Toggle Element 셀 인스턴스 3개를 gap 0 가로 오토레이아웃으로 조립.
// Left(선택=0): [first/selected][middle-right/default][last/default]
// Center(선택=1): [first/default][middle-left/selected][last/default]
// Right(선택=2): [first/default][middle-left/default][last/selected]
async function buildMultiToggle(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const sizes      = ["md", "sm"] as const;
  const selections = ["Left", "Center", "Right"] as const;

  // 각 칸(j=0·1·2)의 position·state 결정 규칙
  const cellSpec = (j: number, selectedIdx: number): { pos: string; st: string } => {
    if (j < selectedIdx) {
      // 선택 왼쪽
      return { pos: j === 0 ? "first" : "middle-left", st: "default" };
    } else if (j === selectedIdx) {
      // 선택된 칸
      const pos = j === 0 ? "first" : j === 2 ? "last" : "middle-left";
      return { pos, st: "selected" };
    } else {
      // 선택 오른쪽
      return { pos: j === 2 ? "last" : "middle-right", st: "default" };
    }
  };

  // BUILT_COMPS 에서 셀 가져오기 (buildMultiToggleElement 가 먼저 빌드됨)
  const pickCell = async (pos: string, st: string, sz: string): Promise<ComponentNode | undefined> => {
    const key = `MultiToggle:${pos}/${st}/${sz}`;
    let c: ComponentNode | undefined = BUILT_COMPS[key];
    if (!c) {
      // 부분 재설치 폴백: 세트에서 이름으로 탐색
      const s = await getBuiltSet("Multi Toggle Element");
      if (s) c = ((s.children as ComponentNode[]) || []).find((x) => x.type === "COMPONENT" && x.name === `position=${pos}, state=${st}, size=${sz}`);
    }
    return c;
  };

  const comps: ComponentNode[] = [];
  const specCells: { comp: ComponentNode; selIdx: number; szIdx: number }[] = [];
  // 슬롯에 끼울 수 있는 컴포넌트 추천값 — Figma 에서 칸을 추가할 때 Multi Toggle Element 세트가 먼저 뜬다.
  const mtElementSet = await getBuiltSet("Multi Toggle Element");

  for (let szIdx = 0; szIdx < sizes.length; szIdx++) {
    const sz = sizes[szIdx];
    for (let selIdx = 0; selIdx < selections.length; selIdx++) {
      const selLabel = selections[selIdx];

      const comp = figma.createComponent();
      comp.name = `Size=${sz}, Selected=${selLabel}`;
      comp.layoutMode = "HORIZONTAL";
      comp.primaryAxisAlignItems = "CENTER";
      comp.counterAxisAlignItems = "CENTER";
      comp.primaryAxisSizingMode = "AUTO";
      comp.counterAxisSizingMode = "AUTO";
      comp.itemSpacing = 0;
      comp.fills = [];

      const cellInsts: SceneNode[] = [];
      for (let j = 0; j < 3; j++) {
        const { pos, st } = cellSpec(j, selIdx);
        const cellComp = await pickCell(pos, st, sz);
        if (cellComp) {
          // 인스턴스 이름은 바꾸지 않는다 — 변형 이름(position=…, state=…, size=…)이 그대로 남아야
          //   component-facts 의 칸별 기하 사실(Gate 24)이 Selected 별로 구분된 채 유지된다.
          const inst = cellComp.createInstance();
          cellInsts.push(inst);
        }
      }
      // 칸이 놓이는 **줄 전체**가 Figma 슬롯("Items") — 칸 개수를 늘리고 줄일 수 있게 한다. (river 지시 2026-09-03)
      //   칸 하나를 슬롯으로 만드는 것이 아니다. 기본 내용은 기존과 같은 3칸이다.
      //   칸 모서리 둥글기는 Multi Toggle Element 의 position(first/middle-left/middle-right/last) 변형이
      //   결정하므로, 칸을 늘리거나 줄이면 맨 앞은 first · 맨 뒤는 last 로 맞춰야 모양이 어긋나지 않는다.
      await makeSlot(comp, "Items",
        "토글 칸이 놓이는 자리. 기본은 3칸이며, Multi Toggle Element 인스턴스를 넣고 빼서 칸 수를 늘리고 줄인다. 칸을 바꾼 뒤에는 맨 앞 칸을 position=first, 맨 뒤 칸을 position=last 로 맞춘다.",
        cellInsts, mtElementSet ? [{ type: "COMPONENT_SET", key: mtElementSet.key }] : [],
        { itemSpacing: 0, counterAxisAlignItems: "CENTER" });

      setLightMode(comp, maps);
      comps.push(comp);
      specCells.push({ comp, selIdx, szIdx });
    }
  }

  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Multi Toggle";
  set.x = 0; set.y = originY;
  BUILT_SETS["Multi Toggle"] = set;

  // 스펙 시트: 행 = Selected(3), 열 = Size(2)
  const SIZE_LABELS  = ["md", "sm"];
  const SEL_LABELS   = ["Left", "Center", "Right"];
  const opts: SpecOpts = {
    title: "Multi Toggle",
    colHeaders: SIZE_LABELS,
    rowLabels: SEL_LABELS,
    cellAt: (r, c) => specCells.find((x) => x.selIdx === r && x.szIdx === c)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY,
    cellW: 220, cellH: 56, rowLabelW: 80, // 셀 min-width(md 64×3) 로 넓어진 토글이 옆 컬럼과 겹치지 않게 220
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── 멀티 컴포넌트 오케스트레이터 ──────────────────────────────────────────────
// skip-if-exists: 같은 이름의 COMPONENT_SET 이 현재 페이지에 이미 있으면 보존(건너뜀), 없는 것만 추가.
//   ★ 재생성(없어서 추가)되는 세트는 "원래 레이아웃 슬롯"에 놓는다(맨 아래로 몰지 않음).
//     기존 컴포넌트의 실제 위치(세트+스펙 풋프린트 최하단)를 읽어 y 를 전진시키므로,
//     예) Button 삭제→재설치 시 최상단(y=0)으로, Time Picker Dropdown→Time Picker 직후 슬롯으로 복귀.
//   토큰 "값" 변경은 Variables 재설치로 기존 컴포넌트에 자동 반영되므로 컴포넌트 재생성 불필요.
//   (mock 환경(렌더러·키체크)은 page.findAll/children 이 배열이 아니므로 가드로 fresh 취급.)

// 대메뉴(섹션) 분류 — 모든 섹션을 한 행에 가로로 배치
// Filter Chip은 특별히 처리 (Chip 아래)
export const COMPONENT_CATEGORIES_GRID: { name: string; members: string[] }[][] = [
  [
    { name: "Platform",     members: ["StatusBar", "NavBar", "CI", "LoginGNB", "WebTabBar", "Footer"] },
    { name: "Navigation",   members: ["GNB", "GNB Sub Menu", "GNB Sub Menu Item", "GNB Utility Icon", "Language Icon", "Mobile Bottom Nav", "Mobile Header"] },
    { name: "Line Tab",     members: ["Line Tab Set", "Line Tab"] },
    { name: "Pagination",   members: ["Pagination", "Pagination Cell"] },
    { name: "Actions",      members: ["Button", "Assist Button", "Text Button"] },
    { name: "Selection",    members: ["Checkbox", "Radio", "Toggle", "Multi Toggle", "Multi Toggle Element"] },
    // Dropdown 섹션 = Form Control 에서 분리(사용자 결정 2026-06-26). Selection 아래에 세로 스택 배치(stage 2 STACKED).
    //   Form Control 보다 GRID 앞에 둬서 Select Box(Form Control)의 Dropdown 의존(BUILD_DEPENDENCIES)이 빌드순서로 충족됨.
    { name: "Dropdown",     members: ["Dropdown", "Dropdown List"] },
    { name: "Chip",         members: ["Chip"] },
    // members = 표시(나열) 순서: 메인 컴포넌트 → 그 안을 구성하는 요소 컴포넌트 순. 빌드(생성) 순서는
    //   BUILD_DEPENDENCIES 로 의존성(요소 먼저)이 자동 적용된다 — 표시순서 ≠ 빌드순서 규칙(§ 아래 주석).
    { name: "Form Control", members: ["Input", "Search Input", "Text Area", "Select Box"] },
    { name: "Date Picker",  members: ["Date Picker", "Calendar", "Calendar Cell", "Calendar Tile", "Date Picker Mobile Bottom Sheet"] },
    { name: "Time Picker",  members: ["Time Picker", "Time Picker Dropdown", "Time Picker Cell", "Time Picker Mobile Bottom Sheet"] },
    { name: "Table",        members: ["Table", "Table Cell"] },
    // Bottom Sheet: 메인 컨테이너(Bottom Sheet) → 요소(Bottom Sheet Option) 표시순서.
    //   빌드는 BUILD_DEPENDENCIES 로 요소(Option)·Checkbox·Radio·Button 이 먼저(카테고리를 Selection·Actions 뒤에 둠).
    { name: "Bottom Sheet", members: ["Bottom Sheet", "Bottom Sheet Option"] },
    // Modal(overlay): 공통 팝업 셸. 코어 Button(Actions, 앞 카테고리)을 인스턴스로 부착 → 카테고리 순서로 선빌드 보장.
    { name: "Modal",        members: ["Modal", "Modal Content"] },
  ],
  // Filter Chip은 별도로 (Chip 아래에 배치될 예정)
  [
    { name: "Filter Chip",  members: ["Filter Chip"] },
  ],
];

// render.js용 1차원 배열 (호환성)
// ES2017 lib 호환: Array.flat() 대신 reduce+concat (tsc lib=ES2017 — 사전 tsc 오류 해소 2026-06-26)
export const COMPONENT_CATEGORIES: { name: string; members: string[] }[] =
  COMPONENT_CATEGORIES_GRID.reduce((a, r) => a.concat(r), [] as { name: string; members: string[] }[]);

// ── 표시 순서 ≠ 빌드 순서 규칙 (영구) ─────────────────────────────────────────
//   ▸ 표시(나열) 순서 = COMPONENT_CATEGORIES_GRID 의 members 배열 순서.
//       원칙: "메인이 되는 컴포넌트 → 그 안을 구성하는 요소 컴포넌트" 순.
//       예) Select Box → Dropdown → Dropdown List (셀렉박스가 먼저, 그 부품이 뒤).
//   ▸ 빌드(생성) 순서 = 의존성 순서 = "요소 컴포넌트 먼저".
//       부모는 자식을 인스턴스로 부착하므로(예: Select Box Open 이 Dropdown 인스턴스를
//       BUILT_COMPS 에서 가져다 붙임), 자식이 먼저 빌드돼 BUILT_COMPS 에 있어야 한다.
//   이 둘은 분리한다: members 는 항상 표시 순서로 유지하고, 빌드는 BUILD_DEPENDENCIES 로
//   요소를 먼저 생성한 뒤, 카테고리 내부를 members(표시) 순서대로 세로 재배치한다.
//   (Figma 캔버스 = buildAllComponents 의 layout 패스, 프리뷰 = render.js 의 members 정렬)
//
// BUILD_DEPENDENCIES[부모] = [부모가 인스턴스로 부착하는 자식 요소 컴포넌트…]
//   같은 카테고리 안의 의존만 빌드 순서에 영향(다른 카테고리는 카테고리 순서가 보장).
export const BUILD_DEPENDENCIES: Record<string, string[]> = {
  "Select Box":  ["Dropdown"],        // Open 상태가 Dropdown 패널 인스턴스 부착
  "Dropdown":    ["Dropdown List"],   // Dropdown 패널이 Dropdown List 옵션 인스턴스 4행 부착
  // Dropdown List 의 체크박스 유형(Type=Checkbox·Checkbox+All)이 Checkbox 인스턴스 부착(2026-08-14).
  //   ⚠️ 이 선언은 **순서를 보장하지 않는다** — buildOrderFor 는 같은 카테고리 안(inCat) 의존만 정렬하고
  //   Checkbox(Selection) ↔ Dropdown List(Dropdown) 는 카테고리가 다르다. 신규 전체 설치는 카테고리
  //   순서(Selection 이 앞)로 충족되고, **재설치(세트 skip)** 는 buildDropdownList 의 reuseVariant 가
  //   캔버스의 기존 Checkbox 를 재등록해 해결한다. 이 줄은 의존 관계를 문서/열화보고에 남기는 용도다.
  "Dropdown List": ["Checkbox"],
  "Filter Chip": ["Dropdown"],        // Selected 상태가 Dropdown 패널 인스턴스 부착(타 카테고리=순서 보장)
  "Time Picker": ["Time Picker Dropdown"], // Focus 상태가 Time Picker Dropdown 인스턴스 부착
  "GNB": ["GNB Utility Icon"],        // GNB 바 유틸 영역이 GNB Utility Icon all-on 인스턴스 부착
  "GNB Utility Icon": ["Language Icon"], // language=on 변형이 Language Icon 인스턴스 부착
  "Mobile Header": ["StatusBar"],
  // 하위메뉴 패널이 항목 세트의 변형을 인스턴스로 붙인다 → 항목이 먼저 빌드돼야 한다.
  "GNB Sub Menu": ["GNB Sub Menu Item"],
  "Pagination": ["Pagination Cell"],  // 완성 바가 Pagination Cell(Arrow·Edge·Number) 인스턴스 조합
  "Multi Toggle": ["Multi Toggle Element"], // 조합형태가 Multi Toggle Element 셀 인스턴스 사용 → 요소 먼저 빌드
  "Date Picker": ["Calendar"],        // Open 상태가 Calendar 패널 인스턴스 부착(BUILT_COMPS["Calendar:Date"])
  // 모바일 바텀시트: Calendar:Date 인스턴스(본문) + Button primary(하단 "적용") 부착 → 둘 다 선빌드 필요.
  "Date Picker Mobile Bottom Sheet": ["Calendar", "Button"],
  // 시간 휠 바텀시트: 하단 "적용" Button + (DateTime 변형) 날짜·시간 Line Tab 인스턴스 부착 → 둘 다 선빌드.
  //   Button(Actions)·Line Tab(Line Tab 카테고리) 은 Time Picker 보다 그리드 앞이라 카테고리 순서로도 보장되나 명시.
  "Time Picker Mobile Bottom Sheet": ["Button", "Line Tab"],
  "Line Tab Set": ["Line Tab"],       // 탭 3개 묶음 세트가 Line Tab 셀 인스턴스 조합
  // Table 푸터가 완성 Pagination 바(BUILT_COMPS["Pagination:Bar/Middle"]) 인스턴스 부착.
  //   (타 카테고리 의존 = 카테고리 순서로 보장: Pagination 카테고리가 Table 보다 먼저라 선빌드됨.)
  //   Table 본문 칸은 Table Cell 인스턴스 재사용 — 2026-08-02 이전엔 이 의존이 없어 Table(39번째)이
  //   Table Cell(40번째)보다 먼저 빌드됐고, makeTableRow 의 조회가 매번 빈손이라 **72칸 전부 fallback
  //   plain frame**(인스턴스 0)이었다. 즉 셀 컴포넌트를 고쳐도 표에 반영되지 않았다.
  //   🤖 component-verifier 실측으로 원인·해법 확인 후 편입(인스턴스 36/36 · MD→MD·SM→SM 정확 매칭).
  "Table": ["Pagination", "Table Cell"],
  // Bottom Sheet 컨테이너 = Bottom Sheet Option(Text) 리스트 + Button 인스턴스 부착 → 둘 다 선빌드.
  //   Option 은 같은 카테고리(요소 먼저), Button 은 Actions 카테고리(그리드 순서로 선빌드).
  "Bottom Sheet": ["Bottom Sheet Option", "Button"],
  "Modal": ["Button"],
  "Modal Content": ["Button"],                // 푸터가 코어 Button(XXSM h28) 인스턴스 부착 → Button 선빌드
  // Bottom Sheet Option 의 Checkbox/Radio 행 = Checkbox·Radio 컴포넌트 인스턴스 부착(Selection 카테고리 선빌드).
  "Bottom Sheet Option": ["Checkbox", "Radio"],
};

// 실제 **인스턴스 부착** 관계 (2026-08-01 신설) — BUILD_DEPENDENCIES 와 목적이 다르다.
//   BUILD_DEPENDENCIES = "먼저 빌드해야 하는 것"(빌드 순서표). 카테고리 순서로 이미 보장되는
//     부착은 거기 안 적혀 있다 — 순서표로서는 그게 맞다.
//   ATTACH_DEPENDENCIES = "이 컴포넌트가 인스턴스로 붙여 쓰는 것" 전부. 부품이 실패했을 때
//     **어떤 부모가 껍데기가 되는지** 판정하는 데 쓴다(열화 보고 전용, 빌드 순서에 영향 없음).
//   왜 분리했나: 순서표만으로 열화를 판정하면 과소보고가 난다. 실측(🤖 component-verifier):
//     Checkbox 실패 → Table 의 체크박스 인스턴스 25→0 인데 Table 은 "정상"으로 보고됐다.
//     Table Cell 실패 → 셀 인스턴스 8→0, 역시 미보고.
const ATTACH_DEPENDENCIES: { [parent: string]: string[] } = {
  // buildTable 이 실제로 붙이는 것들(BUILT_COMPS 조회 기준).
  //   "Table Cell" 은 2026-08-02 에 **편입**했다. 그 전까지는 빌드 순서가 Table→Table Cell 이라
  //   실측 부착 0건이었고(fallback plain frame), 선언하면 거짓 경보가 되므로 일부러 빼 뒀었다.
  //   이제 BUILD_DEPENDENCIES 에 Table→Table Cell 이 있어 실제로 36/36 부착되므로, 셀이 실패하면
  //   Table 이 정말 껍데기가 된다 → 열화 보고 대상이 맞다.
  "Table": ["Pagination", "Checkbox", "Select Box", "Table Cell"],
  "Mobile Header": ["StatusBar"],
};

// 부모가 **부수 생성**하는 컴포넌트 — 자기 runner 가 없는 것이 정상이다(2026-08-01 명시화).
//   BUILD_DEPENDENCIES(=부모가 자식 인스턴스를 부착하니 자식을 먼저 빌드) 와 방향이 반대다:
//   여기 있는 것은 "자식 세트 자체를 부모 빌더가 만들어 준다"는 뜻.
//   종전에는 runners 에 없으면 `continue` 로 조용히 넘어가, '빌더를 안 만든 것'과
//   '부모가 만들어 주는 것'을 구분할 수 없었다. 이제 선언한 것만 면제하고
//   나머지는 noRunner 로 보고 → Gate 30 이 차단한다.
export const BUILT_BY_PARENT: { [child: string]: string } = {
  // buildTimePickerDropdown 이 buildTimePickerCell 을 호출해 셀 세트까지 생성(build-components.ts:2124).
  "Time Picker Cell": "Time Picker Dropdown",
};

// 카테고리 members(표시 순서)를 "요소 먼저" 빌드 순서로 위상정렬.
//   카테고리 내부 의존만 반영(intra-category). 안정 정렬(의존 없으면 원순서 유지).
export function buildOrderFor(members: string[]): string[] {
  const inCat = new Set(members);
  const visited = new Set<string>();
  const out: string[] = [];
  const visit = (m: string): void => {
    if (visited.has(m)) return;
    visited.add(m);
    for (const dep of (BUILD_DEPENDENCIES[m] || [])) {
      if (inCat.has(dep)) visit(dep); // 같은 카테고리 의존만 먼저
    }
    out.push(m);
  };
  for (const m of members) visit(m);
  return out;
}

export async function buildAllComponents(
  maps: BuildMaps,
  onProgress?: (step: string, pct: number) => void,
  // [중단하기] 신호. 컴포넌트 1개를 만들던 중에는 끊지 않고 **다음 부품 직전**에서만 멈춘다
  //   — 만들다 만 반쪽 세트를 캔버스에 남기지 않기 위해서다.
  shouldCancel?: () => boolean
): Promise<{ created: number; added: string[]; skipped: string[]; noRunner: string[]; failed: { name: string; reason: string }[]; degraded: { name: string; missing: string[] }[] }> {
  // 플러그인을 닫지 않고 새 가이드 페이지를 설치해도 이전 페이지 노드를 재사용하지 않는다.
  for (const key of Object.keys(BUILT_SETS)) delete BUILT_SETS[key];
  for (const key of Object.keys(BUILT_COMPS)) delete BUILT_COMPS[key];
  TEXT_STYLES = maps.textStyles || {};  // makeBoundText 가 텍스트 스타일 바인딩에 사용
  const page = figma.currentPage;

  let topNodes: SceneNode[] = [];
  try { if (Array.isArray(page.children)) topNodes = page.children as SceneNode[]; } catch (e) { /* mock */ }
  let existing = new Set<string>();
  try {
    const r = page.findAll((n) => n.type === "COMPONENT_SET");
    if (Array.isArray(r)) existing = new Set((r as ComponentSetNode[]).map((n) => n.name));
  } catch (e) { /* mock/no-page → fresh */ }

  // 컴포넌트 전체 풋프린트(세트 + 스펙 프레임) 이름 — 기존 항목 건너뛸 때 y 전진/중복정리용
  const footprint = (p: string): string[] => {
    const base = [p, `${p} — Spec Light`, `${p} — Spec Dark`];
    if (p === "Time Picker Dropdown") base.push(
      "Time Picker Cell", "Time Picker Cell — Spec Light", "Time Picker Cell — Spec Dark");
    // GNB 는 바(정본=세트 이름 "GNB") + 메뉴 슬롯 세트("GNB Menu")를 함께 생성.
    if (p === "GNB") base.push(
      "GNB Menu", "GNB Menu — Spec Light", "GNB Menu — Spec Dark");
    // 리네임 backward-compat: Platform/·Shell/ 옛 이름 (재설치 시 캔버스의 옛 이름 세트 자동 정리)
    if (p === "StatusBar") base.push("Platform/StatusBar", "Shell/StatusBar");
    if (p === "NavBar") base.push("Platform/NavBar", "Shell/NavBar");
    if (p === "LoginGNB") base.push("Platform/LoginGNB");
    if (p === "WebTabBar") base.push("Platform/WebTabBar");
    // CI backward-compat: 구 Samsung_30 세트 자동 정리
    if (p === "CI") base.push("C/IMG/Logo/Samsung_30");
    // Date Picker Mobile Bottom Sheet backward-compat: 구 "Date Picker Mobile" 세트 자동 정리(재설치 시)
    if (p === "Date Picker Mobile Bottom Sheet") base.push(
      "Date Picker Mobile", "Date Picker Mobile — Spec Light", "Date Picker Mobile — Spec Dark");
    return base;
  };
  const regionBottom = (p: string): number | null => {
    const names = new Set(footprint(p));
    const ms = topNodes.filter((n) => names.has(n.name));
    return ms.length ? Math.max(...ms.map((n) => n.y + n.height)) : null;
  };
  const removeByNames = (list: string[]): void => {
    const names = new Set(list);
    for (const n of topNodes.filter((x) => names.has(x.name))) { try { n.remove(); } catch (e) { /* ignore */ } }
  };

  let created = 0;
  const added: string[] = [];
  const skipped: string[] = [];
  // members 에는 있는데 runners 에 빌더가 없어 건너뛴 컴포넌트(2026-08-01 Phase 2).
  //   종전에는 `if (!run) continue;` 로 **조용히** 넘어가 설치 결과에서 통째로 빠져도
  //   아무도 몰랐다(실측: "Time Picker Cell"). 이제 모아서 반환·보고하고 Gate 30 이 차단한다.
  const noRunner: string[] = [];
  // 빌드 중 예외로 실패한 컴포넌트(건별 집계 — 전체 중단 대신 계속 진행).
  const failed: { name: string; reason: string }[] = [];

  // 컴포넌트 빌더 — 이름 → (originY) => {set, bottomY}. Input 은 originX=0(섹션 컬럼 좌측정렬).
  const runners: { [name: string]: (oy: number) => Promise<{ set: ComponentSetNode; bottomY: number }> } = {
    "Button":               (oy) => buildButtonSet(maps, onProgress, 92, 97, oy),
    "Assist Button":        (oy) => buildAssistButtonSet(maps, oy),
    "Text Button":          (oy) => buildTextButtonSet(maps, oy),
    "Checkbox":             (oy) => buildCheckbox(maps, oy),
    "Radio":                (oy) => buildRadio(maps, oy),
    "Toggle":               (oy) => buildToggle(maps, oy),
    "Multi Toggle Element": (oy) => buildMultiToggleElement(maps, oy),
    "Multi Toggle":         (oy) => buildMultiToggle(maps, oy),
    "Chip":                 (oy) => buildChip(maps, oy),
    "Filter Chip":          (oy) => buildFilterChip(maps, oy),
    "Input":                (oy) => buildInput(maps, oy, 0),
    "Search Input":         (oy) => buildSearch(maps, oy),
    "Text Area":            (oy) => buildTextarea(maps, oy),
    "Select Box":           (oy) => buildSelect(maps, oy),
    "Dropdown List":        (oy) => buildDropdownList(maps, oy),
    "Dropdown":             (oy) => buildDropdown(maps, oy),
    "Calendar":             (oy) => buildCalendar(maps, oy),
    "Date Picker":          (oy) => buildDatePicker(maps, oy),
    "Date Picker Mobile Bottom Sheet": (oy) => buildDatePickerBottomSheet(maps, oy),
    "Bottom Sheet":         (oy) => buildBottomSheet(maps, oy),
    "Bottom Sheet Option":  (oy) => buildBottomSheetOption(maps, oy),
    "Modal":                (oy) => buildModalShell(maps, oy),
    "Modal Content":        (oy) => buildModalContent(maps, oy),
    "Calendar Cell":        (oy) => buildCalendarCellLayout(maps, oy),
    "Calendar Tile":        (oy) => buildCalendarTileLayout(maps, oy),
    "Time Picker":          (oy) => buildTimePicker(maps, oy),
    "Time Picker Dropdown": (oy) => buildTimePickerDropdown(maps, oy),
    "Time Picker Mobile Bottom Sheet": (oy) => buildTimePickerMobileBottomSheet(maps, oy),
    "Table Cell":           (oy) => buildTableCell(maps, oy),
    "Table":                (oy) => buildTable(maps, oy),
    "Line Tab":             (oy) => buildLineTab(maps, oy),
    "Line Tab Set":         (oy) => buildLineTabSet(maps, oy),
    "GNB Utility Icon":     (oy) => buildGNBUtilIcon(maps, oy),
    "Language Icon":        (oy) => buildLanguageIcon(maps, oy),
    "Mobile Bottom Nav":    (oy) => buildMobileBottomNav(maps, oy),
    "Mobile Header":        (oy) => buildMobileHeader(maps, oy),
    "GNB":                  (oy) => buildGNB(maps, oy),
    "GNB Sub Menu":         (oy) => buildGNBSubMenu(maps, oy),
    "GNB Sub Menu Item":    (oy) => buildGNBSubMenuItem(maps, oy),
    "Pagination":           (oy) => buildPaginationBar(maps, oy),
    "Pagination Cell":      (oy) => buildPaginationCell(maps, oy),
    "StatusBar":            (oy) => buildStatusBar(maps, oy),
    "NavBar":               (oy) => buildNavBar(maps, oy),
    "LoginGNB":             (oy) => buildLoginGNB(maps, oy),
    "WebTabBar":            (oy) => buildWebTabBar(maps, oy),
    "CI":                   (oy) => buildCI(maps, oy),
    "Footer":               (oy) => buildFooter(maps, oy),
  };

  // 대메뉴(섹션) 분류 — COMPONENT_CATEGORIES(외부 export)를 참조
  const TOTAL = COMPONENT_CATEGORIES.reduce((s, c) => s + c.members.length, 0);
  const SECTION_TITLE_SPACE = 140; // 섹션 제목 + 상단 여백(컴포넌트 시작 전)
  const SECTION_GAP = 220;         // 섹션 사이 세로 간격(컴포넌트 간 140 보다 커서 타이틀 겹침 방지)
  const SECTION_PAD = 64;          // 섹션 내부 좌우/하단 여백

  let y = 0;
  let done = 0;

  // ── 1단계: 모든 카테고리를 "세로 단일 컬럼"으로 빌드(겹치지 않는 Y밴드) → 각 섹션에 래핑 ──
  //   빌더 함수는 originY 만 받고 X 는 내부 고정(x≈0)이라, 가로배치를 빌드 단계에서 할 수 없다.
  //   → 세로로 쌓아 각 카테고리가 disjoint 한 Y밴드를 갖게 한 뒤(wrapCategoryInSection 의 y밴드
  //     수집이 정확히 동작 = 내용이 실제로 섹션에 들어감), 2단계에서 섹션을 통째로 가로 이동한다.
  for (const cat of COMPONENT_CATEGORIES) {
    const catTopY = y + SECTION_TITLE_SPACE; // 섹션 이름 라벨이 차지할 상단 여백 확보
    let catY = catTopY;
    // ── 빌드 패스: 의존성(요소 먼저) 순서로 생성 — 표시순서 ≠ 빌드순서 규칙(BUILD_DEPENDENCIES) ──
    //   빌드 시점 Y(catY)는 임시(겹치지 않게 세로로 쌓음). 최종 세로 위치는 아래 layout 패스가 정한다.
    for (const name of buildOrderFor(cat.members)) {
      // 건별 try/catch 바깥에서 던져야 '중단'이 failed 로 삼켜지지 않고 위로 전파된다.
      if (shouldCancel && shouldCancel()) throw new Error("__INSTALL_CANCELLED__");
      const run = runners[name];
      // 조용한 스킵 금지 — 부모가 부수 생성한다고 **선언된** 것만 면제, 나머지는 집계·보고(Gate 30)
      // hasOwnProperty 로 조회한다 — 객체 리터럴은 Object.prototype 을 상속하므로 컴포넌트 이름이
      //   "constructor"·"toString" 같으면 선언 없이 자동 면제돼 버린다(🤖 verifier 지적 R2).
      if (!run) {
        if (!Object.prototype.hasOwnProperty.call(BUILT_BY_PARENT, name)) noRunner.push(name);
        continue;
      }
      done++;
      const isDepSet = name === "Calendar Cell" || name === "Calendar Tile";
      if (existing.has(name) && !isDepSet) {
        const rb = regionBottom(name);
        if (rb != null) catY = rb + 140;
        skipped.push(name);
        continue;
      }
      if (onProgress) onProgress(`${name} 생성 중…`, 92 + Math.round((done / TOTAL) * 8));
      removeByNames(footprint(name));
      // 건별 try/catch — 컴포넌트 1개가 실패해도 나머지를 계속 만든다(2026-08-01 신설).
      //   종전엔 이 자리에 방어가 없어 **1개 실패 = 전체 설치 중단**이었다. 뒤 컴포넌트는
      //   하나도 안 생기고, 앞서 만든 것만 캔버스에 남은 반쪽 상태가 됐다.
      //   정답 패턴은 이미 저장소에 있었다 — code.ts 의 다건 스왑 루프가 건별 성공/실패를
      //   집계해 UI 에 보고한다(applied/failures). 그것을 여기로 이식한다.
      // 실패 시 "이번 시도로 새로 생긴 것"만 지우기 위한 직전 스냅샷(노드 id 기준).
      //   ⚠️ 이름만으로 지우면 **멀쩡한 것까지 지운다.** footprint() 는 자기 세트뿐 아니라
      //   부모가 만드는 자식 세트("Time Picker Dropdown"→"Time Picker Cell", "GNB"→"GNB Menu")와
      //   옛 이름 별칭(Platform/·Shell/·Samsung_30 …)까지 포함하기 때문이다.
      //   예: "Calendar Cell" 은 자기 runner 도 있고 buildCalendar 도 만든다 — 자기 runner 가
      //   실패했다고 이름으로 싹 지우면 Calendar 가 만들어 둔 세트까지 날아가 Date Picker 가 깨진다.
      //   id 스냅샷 차집합으로 좁히면 이 클래스의 사고가 구조적으로 불가능해진다.
      let beforeIds: Set<string> = new Set();
      try {
        const kids = figma.currentPage.children as SceneNode[];
        if (Array.isArray(kids)) beforeIds = new Set(kids.map((n) => n.id));
      } catch (_) { /* mock/no-page */ }

      try {
        const res = await run(catY);
        created += res.set.children.length;
        added.push(name);
        catY = res.bottomY + 140;
      } catch (e: any) {
        const reason = (e && (e.message || String(e))) || "unknown";
        // 부분 산출물 제거 — 이게 없으면 "정상으로 위장된 반쪽"이 영구 고착된다.
        //   빌더가 세트 이름을 붙인 뒤 죽으면 이름만 맞는 반쪽 세트가 캔버스에 남고,
        //   existing 은 매 실행 시작에 캔버스를 다시 읽으므로 다음 [설치]에서 그 반쪽이
        //   "이미 있음"으로 보존되며(skipped) **경고조차 사라진 초록 화면**이 뜬다
        //   (🤖 component-verifier 가 2회 실행 시뮬레이션으로 재현: 2회차 failed=[] · 화면 ✅).
        //   removeByNames 는 못 쓴다 — 함수 진입 시 캡처한 topNodes 만 훑어 이번 실행 생성분을
        //   못 잡는다. 그래서 페이지를 다시 읽되, **직전 스냅샷에 없던 노드**로만 한정한다.
        try {
          const names = new Set(footprint(name));
          const kids = figma.currentPage.children as SceneNode[];
          if (Array.isArray(kids)) {
            for (const n of kids.filter((x) => !beforeIds.has(x.id) && names.has(x.name))) {
              try { n.remove(); } catch (_) { /* ignore */ }
            }
          }
        } catch (_) { /* mock/no-page 환경 — 정리 실패가 루프를 죽이지 않게 */ }
        failed.push({ name, reason });
        console.error(`[installer] "${name}" 생성 실패 — 이번 시도 산출물만 정리하고 계속합니다: ${reason}`);
        // 위치는 진행시키지 않는다(다음 컴포넌트가 실패분 자리를 그대로 쓰게 둔다).
      }
    }
    // ── layout 패스: 카테고리 내부를 members(표시) 순서대로 세로 재배치 ──
    //   메인 컴포넌트 → 요소 컴포넌트 순으로 보이도록, 각 컴포넌트의 풋프린트를 통째 Y 이동.
    //   ★ 풋프린트 = 세트 + 스펙 프레임 + decorateSet*(floatingEmit)가 만든 "떠있는" 그룹라벨/밴드
    //     (footprint 이름이 아님!). 그래서 이름 매칭만으로는 라벨이 뒤에 남아 깨진다 →
    //     wrapCategoryInSection 과 동일하게 "Y밴드(중심Y)로 모든 노드 수집" 방식으로 옮긴다.
    //   순서: ①멤버별 seed(footprint 이름) Y 측정 → ②현재 Y(빌드 순서)로 정렬해 gap 중점으로
    //     밴드 경계 분할(모든 노드가 정확히 한 멤버에 귀속) → ③이동 전 스냅샷 → ④members 순서로 재배치.
    //   (mock=키체크/render 환경은 page.children 비배열 → no-op, render.js 가 members 정렬로 처리.)
    try {
      const pageKids = figma.currentPage.children;
      if (Array.isArray(pageKids)) {
        const kids = (pageKids as SceneNode[]).filter((n) => n.type !== "SECTION");
        const cy = (n: SceneNode): number | null => {
          const b = n.absoluteBoundingBox;
          return b && typeof b.y === "number" && typeof b.height === "number" ? b.y + b.height / 2 : null;
        };
        // ① 멤버별 seed(footprint 이름) 박스
        const seeds: { name: string; top: number; bot: number }[] = [];
        for (const name of cat.members) {
          const names = new Set(footprint(name));
          const sb = absBBox(kids.filter((n) => names.has(n.name)));
          if (sb) seeds.push({ name, top: sb.minY, bot: sb.maxY });
        }
        if (seeds.length) {
          // ② 현재 Y(=빌드 순서) 정렬 후 gap 중점으로 밴드 경계 분할
          const byY = [...seeds].sort((a, b) => a.top - b.top);
          const bounds = byY.map((s, i) => ({
            name: s.name,
            lo: i === 0 ? -Infinity : (byY[i - 1].bot + s.top) / 2,
            hi: i === byY.length - 1 ? Infinity : (s.bot + byY[i + 1].top) / 2,
          }));
          // ③ 이동 전 멤버별 노드 스냅샷(Y밴드 중심 기준 — 떠있는 라벨 포함)
          const nodesByName: { [k: string]: SceneNode[] } = {};
          for (const bnd of bounds) {
            nodesByName[bnd.name] = kids.filter((n) => {
              const c = cy(n);
              return c !== null && c > bnd.lo && c <= bnd.hi;
            });
          }
          // ④ members(표시) 순서로 세로 재배치 — 각 멤버 풋프린트를 통째 dy 이동
          let layoutY = catTopY;
          for (const name of cat.members) {
            const ns = nodesByName[name];
            if (!ns || !ns.length) continue;
            const bb = absBBox(ns);
            if (!bb) continue;
            const dy = layoutY - bb.minY;
            if (dy !== 0) for (const n of ns) { try { (n as any).y += dy; } catch (e) { /* */ } }
            layoutY += (bb.maxY - bb.minY) + 140;
          }
          catY = layoutY;
        }
      }
    } catch (e) { /* mock/no-page */ }
    // 카테고리를 1개 섹션으로 래핑(세로 밴드 기준 — 내용이 실제로 섹션 자식이 됨)
    await wrapCategoryInSection(cat.name, cat.members, footprint, SECTION_TITLE_SPACE, SECTION_PAD);
    y = catY + SECTION_GAP;
  }

  // ── 2단계: 모든 섹션을 "실제 측정 폭" 기준으로 가로 정렬(섹션끼리 겹치지 않게) ──
  //   relocateSection 이 섹션 프레임 + 자식을 함께 이동하므로 내용도 같이 따라간다.
  //   메인 행(가로) = 사용자 지정 순서. Filter Chip 만 Chip 바로 아래(2행)에 둔다.
  //   mock(키체크) 환경은 createSection/relocate no-op → 가드로 통과.
  try {
    const findSec = (nm: string): SectionNode | null => {
      const a = figma.currentPage.findAll((n) => n.type === "SECTION" && n.name === nm);
      return Array.isArray(a) && a.length ? (a[0] as SectionNode) : null;
    };
    const widthOf = (s: SectionNode): number => {
      try { const b = s.absoluteBoundingBox; if (b && typeof b.width === "number") return b.width; } catch (e) { /* */ }
      return typeof s.width === "number" ? s.width : 0;
    };
    const heightOf = (s: SectionNode): number => {
      try { const b = s.absoluteBoundingBox; if (b && typeof b.height === "number") return b.height; } catch (e) { /* */ }
      return typeof s.height === "number" ? s.height : 0;
    };
    const H_GAP = 120;  // 섹션 사이 가로 간격
    const TOP_Y = 0;    // 모든 섹션 상단 정렬 기준 y
    const ROW = ["Platform", "Navigation", "Line Tab", "Pagination", "Actions", "Selection", "Chip",
      "Form Control", "Date Picker", "Time Picker", "Table", "Modal"];
    // 세로 스택 섹션: ROW 의 가로 컬럼 아래에 쌓는다(같은 X). below 는 ROW 컬럼명만 받는다(체인 불가) —
    //   같은 below 값을 가진 항목은 STACKED 배열 순서대로 차례로 쌓인다(다중 지원, 아래 루프 참고).
    //   Filter Chip→Chip 아래 · Dropdown→Selection 아래 · Bottom Sheet→"Selection" 아래(Dropdown 바로 다음
    //   순서라 실제로는 Dropdown 아래에 쌓임, 사용자 결정 2026-07-06 — 독립 세로줄에서 이동).
    const STACKED = [
      { name: "Filter Chip",  below: "Chip",      placed: false },
      { name: "Dropdown",     below: "Selection", placed: false },
      { name: "Bottom Sheet", below: "Selection", placed: false },
    ];
    let curX = 0;
    for (const nm of ROW) {
      const sec = findSec(nm);
      if (!sec) continue;
      relocateSection(sec, curX, TOP_Y);        // 실제 측정폭으로 다음 X 누적 → 겹침 0
      let colWidth = widthOf(sec);
      let stackY = TOP_Y + heightOf(sec) + H_GAP;
      for (const st of STACKED) {               // 이 컬럼 아래에 쌓을 섹션(다중 지원)
        if (st.below !== nm) continue;
        const ssec = findSec(st.name);
        if (!ssec) continue;
        relocateSection(ssec, curX, stackY);
        colWidth = Math.max(colWidth, widthOf(ssec));
        stackY += heightOf(ssec) + H_GAP;
        st.placed = true;
      }
      curX += colWidth + H_GAP;
    }
    // below 컬럼 미설치라 못 쌓인 스택 섹션 — 행 말단 단독 컬럼 배치(세로 잔류 방지).
    for (const st of STACKED) {
      if (st.placed) continue;
      const ssec = findSec(st.name);
      if (!ssec) continue;
      relocateSection(ssec, curX, TOP_Y);
      curX += widthOf(ssec) + H_GAP;
    }
  } catch (e) { /* mock/no-page */ }

  if (noRunner.length) {
    // ⚠️ 이 경고는 **Figma 개발자 콘솔에만** 뜬다(Plugins → Development → Open console).
    //    배포본을 쓰는 디자이너에게는 안 보인다 — post("done") 페이로드에 noRunner 가 없기 때문
    //    (code.ts 는 created/added/skipped 만 꺼낸다). 사용자 노출이 필요해지면 그쪽을 함께 고쳐야 한다.
    //    제품 노출이 없어도 되는 이유: Gate 30 이 **커밋 단계에서** 차단하므로 미등록 상태가
    //    배포까지 가지 못한다. (🤖 component-verifier 지적 (c)-2 로 주석을 사실에 맞게 교정, 2026-08-01)
    console.warn(`[installer] 빌더 미등록으로 건너뜀 ${noRunner.length}개: ${noRunner.join(", ")}`);
  }
  // ── 의존 열화 집계 ────────────────────────────────────────────────────────
  //   실패한 부품에 의존하는 부모는 **만들어지긴 하되 그 부품이 빠진 채** 완성된다
  //   (빌더들이 `if (comp)` 가드로 자식 인스턴스를 건너뛰기 때문). 종전에는 부품이 죽으면
  //   전체가 중단돼 이 경로에 도달할 수 없었는데, "계속 진행"으로 바꾸면서 처음 열렸다.
  //   그대로 두면 사용자에게 "Table 추가 ✅ · Pagination 실패"로만 보이고 **Table 이 불완전해진
  //   사실은 어디에도 안 나온다**(🤖 component-verifier 실측: Table 푸터의 pagination 인스턴스 2→0).
  //   BUILD_DEPENDENCIES 를 역인덱스해 "실패분에 의존하면서 실제로 만들어진 것"을 보고한다.
  //   ⚠️ **전이(간접) 의존까지 고정점 전파**해야 한다. 실측(🤖 component-verifier) 2단 체인 3개:
  //     Dropdown List 실패 → Dropdown 열화(옵션 21→0) → **Select Box·Filter Chip** 도 껍데기인데 미보고
  //     Checkbox 실패 → Bottom Sheet Option 열화 → **Bottom Sheet** 미보고
  //     Language Icon 실패 → GNB Utility Icon 열화 → **GNB** 미보고
  //   직접 의존만 보면 UI 가 "나머지는 정상"이라고 거짓을 말한다 — 이 변경이 없애려던
  //   "조용한 반쪽"이 한 층 위로 옮겨갈 뿐이다. 그래서 더 이상 늘지 않을 때까지 반복한다.
  const degraded: { name: string; missing: string[] }[] = [];
  // 전파 기준 = 실패 ∪ 열화. **skipped(기존 보존)는 넣지 않는다.**
  //   2026-08-02 에 "부품이 skipped 면 부모가 조용히 fallback 으로 떨어진다"는 이유로 skipped 를
  //   시드에 넣어 봤다가 **되돌렸다.** 의존 23쌍 중 16쌍은 getBuiltSet()/getReuseComp() 가
  //   BUILT_COMPS 가 비면 `figma.currentPage.findOne()` 으로 캔버스의 기존 세트를 찾아 정상
  //   부착하므로, 그 16쌍에는 **거짓 경보**가 된다(🤖 component-verifier 6종 시나리오 실측).
  //   그 경보는 콘솔이 아니라 ui.html 의 주황 경고 블록으로 **디자이너 화면에 뜨고** 완료 제목까지
  //   "일부 누락"으로 바꾼다 — "세트 하나만 지우고 재설치"라는 흔한 작업마다 멀쩡한 설치에 빨간불.
  //   캔버스 fallback 이 없는 7쌍(Table→Table Cell·Checkbox·Select Box, Dropdown→Dropdown List,
  //   Time Picker→Time Picker Dropdown, GNB Utility Icon→Language Icon, Bottom Sheet→Bottom Sheet
  //   Option)에는 실제 공백이 남는다. 옳은 해법은 보고가 아니라 **skip 시 캔버스의 기존 세트를
  //   BUILT_COMPS 에 재등록**해 부모가 진짜로 재사용하게 만드는 것 → BACKLOG(별건).
  if (failed.length) {
    const broken = new Set(failed.map((f) => f.name));
    // hasOwnProperty 로 조회 — 객체 리터럴은 Object.prototype 을 상속하므로 컴포넌트 이름이
    //   "constructor" 같으면 배열이 아닌 값이 나와 스프레드에서 TypeError 가 난다(설치 전체 실패).
    const own = (o: { [k: string]: string[] }, k: string): string[] =>
      (Object.prototype.hasOwnProperty.call(o, k) && Array.isArray(o[k]) ? o[k] : []);
    const depsOf = (p: string): string[] =>
      Array.from(new Set([...own(BUILD_DEPENDENCIES, p), ...own(ATTACH_DEPENDENCIES, p)]));
    // 상한 = added.length + 1. 한 바퀴에 최소 한 단계는 진행하므로 이 횟수면 반드시 수렴한다.
    //   (종전 고정 20회는 깊은 체인에서 **조용히 잘렸다** — 조용한 절단은 이 게이트가 없애려는 것이다.)
    const maxRounds = added.length + 1;
    let rounds = 0;
    for (; rounds < maxRounds; rounds++) {
      let changed = false;
      for (const parent of added) {
        if (broken.has(parent)) continue;
        const missing = depsOf(parent).filter((d) => broken.has(d));
        if (missing.length) {
          degraded.push({ name: parent, missing });
          broken.add(parent);
          changed = true;
        }
      }
      if (!changed) break;
    }
    if (rounds >= maxRounds) {
      console.error(`[installer] 열화 전파가 ${maxRounds}회에 수렴하지 않았습니다 — 의존 그래프에 순환이 있는지 확인 필요(보고가 불완전할 수 있음).`);
    }
  }

  if (failed.length) {
    console.error(`[installer] 생성 실패 ${failed.length}개: ${failed.map((f) => f.name).join(", ")}`);
  }
  if (degraded.length) {
    console.error(`[installer] 부품 누락으로 불완전 ${degraded.length}개: ${degraded.map((d) => `${d.name}(${d.missing.join("·")} 빠짐)`).join(", ")}`);
  }
  if (onProgress) {
    onProgress(
      `완료 — 추가 ${added.length}개 · 기존 보존 ${skipped.length}개` +
      (failed.length ? ` · 실패 ${failed.length}개(${failed.map((f) => f.name).join(", ")})` : "") +
      (degraded.length ? ` · 불완전 ${degraded.length}개(${degraded.map((d) => d.name).join(", ")})` : ""),
      100
    );
  }
  return { created, added, skipped, noRunner, failed, degraded };
}

// ── 섹션 래핑 (대메뉴 묶기) ───────────────────────────────────────────────────
// 한 카테고리의 풋프린트 노드(세트+스펙 프레임)를 1개 Figma Section 으로 묶는다.
// 절대 위치를 보존하므로(섹션 좌표 규약 무관) 레이아웃이 깨지지 않는다. 같은 이름 섹션이 있으면 재사용(멱등).
// mock(키체크) 환경에서는 createSection 미지원 + page.children 비배열 → no-op.
function absBBox(nodes: SceneNode[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, ok = false;
  for (const n of nodes) {
    const b = n.absoluteBoundingBox;
    if (!b || typeof b.x !== "number" || typeof b.width !== "number") continue;
    ok = true;
    minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width); maxY = Math.max(maxY, b.y + b.height);
  }
  return ok ? { minX, minY, maxX, maxY } : null;
}

// 섹션을 자식과 함께 (targetX, targetY) 로 통째 이동. 섹션 자식 좌표 규약과 무관하게
// 각 자식의 목표 절대위치를 먼저 잡고, 섹션 이동 후 절대위치를 보정한다. mock 은 no-op.
function relocateSection(section: SectionNode, targetX: number, targetY: number): void {
  let kids: SceneNode[] = [];
  try { const c = section.children; if (Array.isArray(c)) kids = c as SceneNode[]; } catch (e) { return; }
  const sx = typeof section.x === "number" ? section.x : 0;
  const sy = typeof section.y === "number" ? section.y : 0;
  const dx = targetX - sx, dy = targetY - sy;
  const desired: { k: SceneNode; x: number; y: number }[] = [];
  for (const k of kids) {
    const b = k.absoluteBoundingBox;
    if (b && typeof b.x === "number" && typeof b.y === "number") desired.push({ k, x: b.x + dx, y: b.y + dy });
  }
  try { section.x = targetX; section.y = targetY; } catch (e) { /* */ }
  for (const d of desired) {
    const b = d.k.absoluteBoundingBox;
    if (b && typeof b.x === "number" && typeof d.k.x === "number") { d.k.x += d.x - b.x; d.k.y += d.y - b.y; }
  }
}

async function wrapCategoryInSection(
  title: string,
  members: string[],
  footprintFn: (p: string) => string[],
  titleSpace: number,
  pad: number,
): Promise<void> {
  if (typeof figma.createSection !== "function") return; // mock/구버전 → 건너뜀
  let kids: SceneNode[] = [];
  try {
    const c = figma.currentPage.children;
    if (Array.isArray(c)) kids = (c as SceneNode[]).filter((n) => n.type !== "SECTION");
  } catch (e) { return; }
  if (!kids.length) return;
  // 1) footprint 이름(세트+스펙)으로 이 카테고리의 대표 노드 → y밴드 산출
  const names = new Set<string>();
  for (const m of members) for (const n of footprintFn(m)) names.add(n);
  const seedBox = absBBox(kids.filter((n) => names.has(n.name)));
  if (!seedBox) return;
  const bandTop = seedBox.minY - titleSpace;
  const bandBot = seedBox.maxY + pad;
  // 2) y밴드에 들어오는 모든 페이지 노드 수집 — 세트 데코레이션(decorateSet*→floatingEmit)이
  //    만든 "떠있는" 그룹라벨·밴드(footprint 이름 아님)까지 포함해야 섹션 배경에 가려지지 않음.
  //    카테고리는 disjoint 한 세로 밴드라 이웃 카테고리 노드는 잡히지 않는다.
  const nodes = kids.filter((n) => {
    const b = n.absoluteBoundingBox;
    if (!b || typeof b.y !== "number" || typeof b.height !== "number") return false;
    const cy = b.y + b.height / 2;
    return cy >= bandTop && cy <= bandBot;
  });
  if (!nodes.length) return;
  const box = absBBox(nodes);
  if (!box) return;

  // 같은 이름 섹션 재사용(멱등) 또는 신규 생성
  let section: SectionNode | null = null;
  try {
    const secs = figma.currentPage.findAll((n) => n.type === "SECTION" && n.name === title);
    if (Array.isArray(secs) && secs.length) section = secs[0] as SectionNode;
  } catch (e) { /* mock → 신규 */ }
  if (!section) section = figma.createSection();
  section.name = title;
  // 섹션을 먼저 bbox 기준으로 배치/크기지정(자식 추가 전) → 이후 자식 절대위치 보정
  // 가로 배치는 빌드 후 2단계 relocateSection 가 담당. 여기선 내용에 딱 맞게만 래핑한다.
  try { section.x = box.minX - pad; section.y = box.minY - titleSpace; } catch (e) { /* */ }
  try {
    section.resizeWithoutConstraints(
      Math.max(0.01, (box.maxX - box.minX) + pad * 2),
      Math.max(0.01, (box.maxY - box.minY) + titleSpace + pad),
    );
  } catch (e) { /* */ }
  // 노드를 섹션으로 이동하되 절대 위치 보존(섹션 자식 좌표 규약과 무관하게 보정)
  for (const n of nodes) {
    const before = n.absoluteBoundingBox;
    const bx = before && typeof before.x === "number" ? before.x : null;
    const by = before && typeof before.y === "number" ? before.y : null;
    try { section.appendChild(n); } catch (e) { continue; }
    const after = n.absoluteBoundingBox;
    if (bx != null && by != null && after && typeof after.x === "number" && typeof n.x === "number") {
      n.x += bx - after.x;
      n.y += by - after.y;
    }
  }
}
