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

export interface BuildMaps {
  semanticColor: Record<string, Variable>;   // "color/button/bg/primary--default" 등
  foundationColor: Record<string, Variable>;  // "brand/ci","brand/blue" 등 — Foundation 색 직접 바인딩용(CI 로고)
  foundationNumber: Record<string, Variable>; // "spacing/16","spacing/8","radius/4","border-width/1"
  textStyles: Record<string, TextStyle>;      // "body/14M","body/16M" 등
  semanticColorCollectionId: string;          // Semantic Color V2 컬렉션 id (Appearance 모드 연결)
  semanticLightModeId: string;                // Light 모드 id
  semanticDarkModeId: string;                 // Dark 모드 id (다크 스펙 프레임용)
}

// ── 크로스빌더 공유 참조 ──────────────────────────────────────────────────────
// 한 빌더가 만든 세트/컴포넌트를 다른 빌더가 인스턴스로 재사용할 수 있게 등록·조회한다.
//   예: Dropdown(패널)이 Dropdown List(옵션 세트)를, Select Open 이 Dropdown(패널)을,
//       Time Picker(Focus)가 Time Picker Dropdown(세트)을 인스턴스로 부착.
//   CATEGORIES Form 순서가 "패널 → 소비자" 로 정렬돼 있어 소비자 빌드 시점엔 이미 등록돼 있다.
//   재설치(같은 페이지)에서는 등록 캐시가 비어도 currentPage 에서 이름으로 찾아 폴백한다.
const BUILT_SETS: Record<string, ComponentSetNode> = {};
const BUILT_COMPS: Record<string, ComponentNode> = {};

async function getBuiltSet(name: string): Promise<ComponentSetNode | null> {
  if (BUILT_SETS[name]) return BUILT_SETS[name];
  try { const f = figma.currentPage.findOne((n) => n.type === "COMPONENT_SET" && n.name === name); return (f as ComponentSetNode) || null; } catch (e) { return null; }
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
  XXSM: { break: "PC",     height: 28, padPath: "spacing/8",  textStyle: "body/12M", minWidth: 64 },
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
  comp.minWidth = cfg.minWidth; // 사이즈별 디폴트 최소 너비 (medium/large=80, xsmall/xxsmall=64)

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

  const radiusVar = requireVar(maps.foundationNumber, "radius/4", "Foundation Number");
  comp.setBoundVariable("topLeftRadius", radiusVar);
  comp.setBoundVariable("topRightRadius", radiusVar);
  comp.setBoundVariable("bottomLeftRadius", radiusVar);
  comp.setBoundVariable("bottomRightRadius", radiusVar);

  // 높이 고정 (참고 파일도 height 는 raw — 미바인딩)
  comp.resize(comp.width, cfg.height);

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
function frameEmit(frame: FrameNode, maps: BuildMaps, modeId: string): LayoutEmit {
  return {
    text: async (s, x, y, w, al, col, fs, st) => { frame.appendChild(await makeLabel(s, fs, st, x, y, w, al, col)); },
    band: (x, y, w, h, col) => { const b = figma.createRectangle(); b.x = x; b.y = y; b.resize(w, h); b.cornerRadius = 4; b.fills = [{ type: "SOLID", color: col }]; frame.appendChild(b); },
    cell: (comp, x, y) => {
      const inst = comp.createInstance(); frame.appendChild(inst); inst.x = x; inst.y = y; setMode(inst, maps, modeId);
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
  const H = await renderGrouped(opts, true, frameEmit(frame, maps, modeId));
  frame.resize(W, H);
  setMode(frame, maps, modeId);
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

// ════════════════════════════════════════════════════════════════════════════
//  선택 컨트롤 (Checkbox · Radio · Toggle) — color/control/* 슬롯 바인딩
//  바인딩 정본 = Variables(vars-data). tokens.css 레거시 미사용.
// ════════════════════════════════════════════════════════════════════════════

/** Semantic Color 슬롯 변수 가져오기 (없으면 명확한 오류). */
function scv(maps: BuildMaps, key: string): Variable {
  return requireVar(maps.semanticColor, key, "Semantic Color");
}

/** 변수에 바인딩된 채움색을 가진 텍스트 노드. */
async function makeBoundText(chars: string, fontSize: number, style: string, colorVar: Variable): Promise<TextNode> {
  await figma.loadFontAsync({ family: "Pretendard", style });
  const t = figma.createText();
  t.fontName = { family: "Pretendard", style };
  t.fontSize = fontSize;
  t.characters = chars;
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
  /** 다크 스펙을 원본 아래에 배치할 때 사용 (GNB 전용). x/y 를 각각 지정. 미지정=기존 동작(원본 우측 W+80). */
  darkOffset?: { x?: number; y?: number };
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
  for (let col = 0; col < opts.colHeaders.length; col++) {
    if (opts.colHeaders[col]) await emit.text(opts.colHeaders[col], gridLeft + col * opts.cellW, y, opts.cellW, "CENTER", c.label, 11, "Medium"); // 빈 헤더는 빈 텍스트 노드 안 만든다
  }
  y += HEADER_H;
  for (let r = 0; r < opts.rowLabels.length; r++) {
    // 행 높이 = 행 내 최대 컴포넌트 높이(+패딩). 고정 cellH 대신 → 라벨-컴포넌트 밀착·빈공간 제거.
    let rowH = 0;
    for (let cc = 0; cc < opts.colHeaders.length; cc++) { const cp = opts.cellAt(r, cc); if (cp && cp.height > rowH) rowH = cp.height; }
    rowH = (rowH || opts.cellH) + 16;
    const top = y + 4;
    if (opts.rowLabels[r]) await emit.text(opts.rowLabels[r], PAD, top, rowLabelW, "LEFT", c.label, 11, "Medium");
    for (let cc = 0; cc < opts.colHeaders.length; cc++) {
      const comp = opts.cellAt(r, cc);
      if (comp) {
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
  frame.x = opts.darkOffset?.x ?? (W + 80); // 기본=원본 우측 밀착; darkOffset 지정 시 GNB처럼 아래 배치
  frame.y = opts.darkOffset?.y ?? opts.originY;
  const H = await renderFlat(opts, true, frameEmit(frame, maps, modeId));
  frame.resize(W, H);
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
    { size: "SM", brk: "PC", h: 28, font: 12 },
    { size: "SM", brk: "Mobile", h: 30, font: 12 },
    { size: "MD", brk: "PC", h: 34, font: 14 },
  ];
  const states = ["Default", "Hover", "Selected", "Disabled"];
  const variants = ["Line", "Solid"];
  const slot = (st: string) =>
    st === "Default" ? { bg: "default", bd: "default", lb: "default" }
    : st === "Hover" ? { bg: "hover", bd: "default", lb: "default" }
    : st === "Selected" ? { bg: "selected", bd: "selected", lb: "selected" }
    : { bg: "disabled", bd: "disabled", lb: "disabled" };
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; row: number; col: number; variant: string; size: string; brk: string; state: string }[] = [];
  let row = 0;
  for (const variant of variants) {
    const v = variant.toLowerCase();
    for (const sc of sizes) {
      for (let col = 0; col < states.length; col++) {
        const ss = slot(states[col]);
        const comp = figma.createComponent();
        comp.name = `Size=${sc.size}, State=${states[col]}, Variant=${variant}, Break=${sc.brk}`;
        comp.layoutMode = "HORIZONTAL";
        comp.primaryAxisAlignItems = "CENTER";
        comp.counterAxisAlignItems = "CENTER";
        comp.primaryAxisSizingMode = "AUTO";
        comp.counterAxisSizingMode = "FIXED";
        comp.paddingLeft = 16; comp.paddingRight = 16;
        comp.cornerRadius = 999;
        comp.fills = [boundPaint(scv(maps, `color/chip/${v}/bg/${ss.bg}`))];
        comp.strokes = [boundPaint(scv(maps, `color/chip/${v}/border/${ss.bd}`))];
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
// 핵심 매트릭스: Size × State × Break (label/message/icon off). 상태 7개 → 행=State, 열=Size 평면.
async function buildInput(maps: BuildMaps, originY: number, originX: number = INPUT_SHEET_X): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const fc = (k: string) => `color/form-control/${k}`;
  const states = [
    { name: "Default",   bg: "bg/default",  border: "border/default",  txt: "입력",   tc: "text/placeholder" },
    { name: "Filled",    bg: "bg/default",  border: "border/default",  txt: "텍스트", tc: "text/default" },
    { name: "Editing",   bg: "bg/selected", border: "border/selected", txt: "텍스트", tc: "text/selected" },
    { name: "Error",     bg: "bg/default",  border: "border/error",    txt: "텍스트", tc: "text/default" },
    { name: "Correct",   bg: "bg/default",  border: "border/correct",  txt: "텍스트", tc: "text/default" },
    { name: "Read-Only", bg: "bg/disabled", border: "border/default",  txt: "텍스트", tc: "text/read-only" },
    { name: "Disabled",  bg: "bg/disabled", border: "border/disabled", txt: "입력",   tc: "text/disabled" },
  ];
  const sizes = [
    { size: "XXSM", brk: "PC",     h: 28, padL: 12, padR: 8,  font: 12, head: "XXSM" },
    { size: "XSM",  brk: "PC",     h: 34, padL: 12, padR: 8,  font: 14, head: "XSM" },
    { size: "MD",   brk: "PC",     h: 44, padL: 16, padR: 12, font: 14, head: "MD" },
    { size: "MD",   brk: "Mobile", h: 48, padL: 16, padR: 12, font: 14, head: "MD·M" },
  ];
  const labels = ["Off", "On"];
  const messages = ["Off", "On"];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; brk: string; state: string; label: string; message: string }[] = [];
  for (const sc of sizes) {
    for (const st of states) {
      for (const lab of labels) {
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
          if (st.name === "Editing") {
            // Editing(=selected): [텍스트 + 커서] 좌측(grow), 트레일링 = [눈][삭제]. Figma 정본 564:3757 icon=on.
            const lead = figma.createFrame();
            lead.name = "lead"; lead.fills = [];
            lead.layoutMode = "HORIZONTAL"; lead.counterAxisAlignItems = "CENTER";
            lead.primaryAxisSizingMode = "AUTO"; lead.counterAxisSizingMode = "AUTO";
            lead.itemSpacing = 4; // spacing/4 — 텍스트와 커서 간격
            lead.appendChild(textNode);
            lead.appendChild(makeCaret(scv(maps, fc("border/selected"))));
            field.appendChild(lead);
            lead.layoutGrow = 1; lead.layoutSizingHorizontal = "FILL"; // 좌측 채움 → 트레일링 우측 고정
            clearIcon = await makeClearIcon(scv(maps, fc("icon/default")), fcIconPx(sc.h, 0)); // 눈 뒤에 append
          } else {
            // 비-Editing 상태: 텍스트가 좌측을 채우고(layoutGrow=1) 눈 아이콘이 우측 HUG.
            textNode.layoutGrow = 1;
            field.appendChild(textNode);
          }
          // 비밀번호 눈(미표시) — 모든 variant field 우측. 기본 visible=false(꺼짐, 공간 미점유).
          // Password Icon BOOLEAN 속성에 바인딩(아래 set 생성 후). 표시 눈은 인스턴스 스왑으로 교체.
          const eye = await makeIconInstance("eye", scv(maps, fc("icon/default")), sc.size === "XXSM" ? 20 : 24, EYE_OFF_SVG);
          eye.name = "eye";
          eye.visible = false;
          // 트레일링 클러스터 [눈][×] — 눈↔삭제(×) 간격 = spacing/2(2px). lead↔클러스터는 0(밀착, field 기본 itemSpacing).
          const trail = figma.createFrame();
          trail.name = "trail"; trail.fills = [];
          trail.layoutMode = "HORIZONTAL"; trail.counterAxisAlignItems = "CENTER";
          trail.primaryAxisSizingMode = "AUTO"; trail.counterAxisSizingMode = "AUTO";
          trail.itemSpacing = 2; // spacing/2 — 비밀번호 눈 아이콘과 삭제(×) 아이콘 간격
          trail.appendChild(eye);
          if (clearIcon) trail.appendChild(clearIcon); // Editing: × 를 눈 우측에 인접(2px)
          field.appendChild(trail);
          field.resize(200, sc.h); // Input 예외 — 넓은 필드
          const comp = figma.createComponent();
          comp.name = `Size=${sc.size}, State=${st.name}, Label=${lab}, Message=${msg}, Break=${sc.brk}`;
          comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO"; comp.itemSpacing = 6;
          comp.fills = []; // 외곽 컨테이너는 투명 — createComponent 기본 흰색 fill 제거(미사용 FFFFFF, 2026-06-24)
          if (lab === "On") comp.appendChild(await makeBoundText("라벨", 14, "Medium", scv(maps, fc(dis ? "label/disabled" : "label/default"))));
          comp.appendChild(field);
          if (msg === "On") {
            // 안내메시지 색: Error=빨강·Correct=파랑·Disabled=회색·기본 라벨색
            const msgColor = dis ? "label/disabled" : st.name === "Error" ? "border/error" : st.name === "Correct" ? "border/correct" : "label/default";
            comp.appendChild(await makeBoundText("안내 메세지", 12, "Regular", scv(maps, fc(msgColor))));
          }
          setLightMode(comp, maps);
          comps.push(comp);
          cells.push({ comp, size: sc.size, brk: sc.brk, state: st.name, label: lab, message: msg });
        }
      }
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Input";
  // Password Icon BOOLEAN — 비밀번호 인풋일 때만 눈 아이콘 표시. 기본 false(꺼짐).
  // 모든 variant 의 field>trail>eye 레이어 visible 을 이 속성에 바인딩(레이어명 eye 통일 필수).
  // eye 가 trail 클러스터 하위로 들어가 직계 자식이 아니므로 findOne(재귀)로 탐색.
  const pwIconPropId = set.addComponentProperty("Password Icon", "BOOLEAN", false);
  for (const c of comps) {
    const f = c.findChild((n: SceneNode) => n.name === "field") as FrameNode | null;
    const eyeLayer = f ? f.findOne((n: SceneNode) => n.name === "eye") : null;
    if (eyeLayer) eyeLayer.componentPropertyReferences = { visible: pwIconPropId };
  }
  // Input 은 규모가 커서(7 상태 × 4 사이즈 × 4 그룹) 넓은 시트로 배치. originX 로 좌측정렬(섹션 컬럼 내) 가능.
  const OX = originX;
  set.x = OX; set.y = originY;
  // 그룹핑 규칙: 모디파이어(라벨×메시지) 조합을 상위 그룹(밴드)으로, 그 안에서 사이즈별로 나열.
  // (사이즈별로 라벨/메시지가 번갈아 나오지 않게.) Input 은 예외적으로 필드·컬럼 폭을 넓게.
  const groups = [
    { name: "라벨 없음",              lab: "Off", msg: "Off" },
    { name: "라벨 없음 · 안내메시지", lab: "Off", msg: "On" },
    { name: "라벨 있음",              lab: "On",  msg: "Off" },
    { name: "라벨 있음 · 안내메시지", lab: "On",  msg: "On" },
  ];
  const opts: GroupedSpecOpts = {
    title: "Input",
    // 플랫폼(PC/Mobile) → 사이즈 → 라벨/메시지 그룹(rowLabels)으로 구분 (Button·SelectBox 패턴과 동일)
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
      return cells.find((x) => x.size === sizeName && x.brk === platName && x.state === states[ci].name && x.label === g.lab && x.message === g.msg)?.comp ?? null;
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

// 입력 커서(캐럿) — Editing/Focus 상태에서 텍스트 뒤 깜빡이는 세로선. Figma 564:3757(blue/400=border/selected).
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
const ICON_KEYS: Record<string, string> = {
  remove:   "24b2df622d341e0af21cd4b23b4a7d23b97a5ea7", // 삭제(원+X) 439:84
  close:    "2a1abbd3597b536e34fd9523fb61eade3afe9934", // 닫기(plain-X, 원 없음) ic_닫기 89:4927 — 바텀시트/모달 닫기. remove(원+X)와 구분
  check:    "5ab251e0d90adb555ee2fa316f84e86041f19916", // 확인(체크마크 ✓) 97:167 — 체크박스 내부용(ic_체크는 박스형이라 ic_확인 사용)
  search:   "6b764af642b8883e892754281950da0e971224d7", // 찾기/조회(돋보기) 97:127
  clock:    "ca1d043ac09be07f827e939be3d8c3c7af8a8dd9", // 시간,시계 97:271
  calendar: "ea0ffc118c38048f2cdfb5620be31c120426bb7a", // 날짜,달력 70:664
  menu:     "5157e9edc76358e2e6bc1a5ebc1539ccf5f2e787", // 메뉴(햄버거) 97:227
  account:  "a423e2e05cfff2f93062d6a83d6f3bdf79ca9647", // 계정/사용자 86:58
  chevron:  "e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581", // 화살표,더보기(쉐브론 › 우향 기준) 419:69 — 방향은 rotation 으로(우0·하90·좌180·상270)
  globe:    "dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2", // 인터넷(지구본) 35:3317 — GNB 언어(사용자 지정)
  eye:      "d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7", // 비밀번호 미표시(눈+슬래시 ic_비밀번호미표시 Line) — Input Password Icon boolean 기본값. 표시 눈은 인스턴스 스왑으로 교체
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
const REMOVE_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M16 8C16 3.58588 12.4141 0 8 0C3.58588 0 0 3.58588 0 8C0 12.4141 3.58588 16 8 16C12.4141 16 16 12.4141 16 8ZM8 15.0588C4.10353 15.0588 0.941176 11.8965 0.941176 8C0.941176 4.10353 4.10353 0.941176 8 0.941176C11.8965 0.941176 15.0588 4.10353 15.0588 8C15.0588 11.8965 11.8965 15.0588 8 15.0588Z" fill="#353535"/><path d="M5.5 5.5L10.8333 10.8333" stroke="#353535" stroke-width="1.5" stroke-linejoin="round"/><path d="M10.8333 5.5L5.5 10.8333" stroke="#353535" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
// plain-X 닫기 폴백 SVG(원 없음, ✕ 2선) — 라이브러리 close(ic_닫기 89:4927) import 실패 시만. 색은 rebindIconColor 가 변수 바인딩.
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
  const states = [
    { name: "Default",  bg: "bg/default",  border: "border/default",  txt: "검색",   tc: "text/placeholder", icon: "icon/default" },
    { name: "Focus",    bg: "bg/selected", border: "border/selected", txt: "검색어", tc: "text/selected",    icon: "icon/default" },
    { name: "Filled",   bg: "bg/default",  border: "border/default",  txt: "검색어", tc: "text/default",     icon: "icon/default" },
    { name: "Disabled", bg: "bg/disabled", border: "border/disabled", txt: "검색",   tc: "text/disabled",    icon: "icon/disabled" },
  ];
  const sizes = [
    { size: "XXSM", h: 28, font: 12, padL: 12, padR: 8 },
    { size: "XSM",  h: 34, font: 14, padL: 12, padR: 8 },
    { size: "MD",   h: 44, font: 14, padL: 16, padR: 12 },
  ];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; row: number; col: number }[] = [];
  for (let row = 0; row < sizes.length; row++) {
    for (let col = 0; col < states.length; col++) {
      const sc = sizes[row], st = states[col];
      const comp = figma.createComponent();
      comp.name = `State=${st.name}, Size=${sc.size}`;
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
      if (st.name === "Focus") {
        // Focus(=selected): [검색어 + 커서] 좌측 / [삭제(close) + 돋보기] 우측. 삭제는 돋보기 왼쪽(MVP4.2 순서).
        const lead = figma.createFrame();
        lead.name = "lead"; lead.fills = [];
        lead.layoutMode = "HORIZONTAL"; lead.counterAxisAlignItems = "CENTER";
        lead.primaryAxisSizingMode = "AUTO"; lead.counterAxisSizingMode = "AUTO";
        lead.itemSpacing = 4;
        lead.appendChild(textNode);
        lead.appendChild(makeCaret(scv(maps, fc("border/selected"))));
        comp.appendChild(lead);
        const trail = figma.createFrame();
        trail.name = "trail"; trail.fills = [];
        trail.layoutMode = "HORIZONTAL"; trail.counterAxisAlignItems = "CENTER";
        trail.primaryAxisSizingMode = "AUTO"; trail.counterAxisSizingMode = "AUTO";
        trail.itemSpacing = 4;
        trail.appendChild(await makeClearIcon(scv(maps, fc("icon/default")), fcIconPx(sc.h, 0)));
        trail.appendChild(await makeIconInstance("search", scv(maps, fc(st.icon)), fcIconPx(sc.h, 0), MAG));
        comp.appendChild(trail);
      } else {
        comp.appendChild(textNode);
        comp.appendChild(await makeIconInstance("search", scv(maps, fc(st.icon)), fcIconPx(sc.h, 0), MAG));
      }
      comp.resize(160, sc.h);
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, row, col });
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Search Input";
  set.x = 0; set.y = originY;
  const opts: SpecOpts = {
    title: "Search Input",
    colHeaders: states.map((s) => s.name),
    rowLabels: sizes.map((s) => s.size),
    cellAt: (r, c) => cells.find((x) => x.row === r && x.col === c)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 176, cellH: 60,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
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
      lead.appendChild(makeCaret(scv(maps, fc("border/selected"))));
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
      trigger.appendChild(await makeIconInstance("chevron", scv(maps, fc(st.icon)), fcIconPx(sc.h, 0), (st.up ? chevUp : chevDown)("#000"), st.up ? 90 : 270));
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
            ddComp = (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes(`Size=${sc.size}`))
              ?? (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT");
          }
        }
        if (ddComp) {
          const ddInst = ddComp.createInstance();
          ddInst.name = "dropdown";
          comp.appendChild(ddInst);
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
async function buildDropdownList(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const dd = (k: string) => `color/dropdown/${k}`;
  const states = [
    { name: "Default",  bg: "option/bg/default",  label: "option/label/default" },
    { name: "Hover",    bg: "option/bg/hover",    label: "option/label/hover" },
    { name: "Selected", bg: "option/bg/selected", label: "option/label/selected" },
    { name: "Disabled", bg: "option/bg/disabled", label: "option/label/disabled" },
  ];
  const sizes = [
    { size: "XXSM", h: 28, font: 12 },
    { size: "XSM",  h: 34, font: 14 },
    { size: "MD",   h: 44, font: 14 },
  ];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; colIdx: number }[] = [];
  for (const sz of sizes) {
    for (let col = 0; col < states.length; col++) {
      const st = states[col];
      const comp = figma.createComponent();
      comp.name = `Size=${sz.size}, State=${st.name}`;
      comp.layoutMode = "HORIZONTAL"; comp.counterAxisAlignItems = "CENTER";
      comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
      comp.paddingLeft = 12; comp.paddingRight = 12; comp.paddingTop = 0; comp.paddingBottom = 0;
      comp.fills = [boundPaint(scv(maps, dd(st.bg)))];
      comp.appendChild(await makeBoundText("옵션", sz.font, "Regular", scv(maps, dd(st.label))));
      comp.resize(140, sz.h);
      comps.push(comp);
      cells.push({ comp, size: sz.size, colIdx: col });
      BUILT_COMPS[`DropdownList:${sz.size}:${st.name}`] = comp;
      if (sz.size === "MD") BUILT_COMPS[`DropdownList:${st.name}`] = comp; // 레거시 키 (MD=기본)
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
    rowLabels: [""],
    colHeaders: states.map((s) => s.name),
    cellAt: (_p, size, _ri, ci) => cells.find((x) => x.size === size && x.colIdx === ci)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 160, cellH: 60, rowLabelW: 16,
  };
  let bottomY = await decorateSetGrouped(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildGroupedSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

// ── Dropdown (드롭다운 패널 컴포넌트 세트 — Dropdown List 인스턴스 4행 조합) ─────────
// Select Box Open 상태와 Time Picker Focus 상태에서 인스턴스로 참조한다.
// #11: 3사이즈(XXSM/XSM/MD). 각 사이즈별로 DropdownList 인스턴스 4행 조합(2026-06-19).
async function buildDropdown(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const dd = (k: string) => `color/dropdown/${k}`;
  const sizes = [
    { size: "XXSM", h: 28 },
    { size: "XSM",  h: 34 },
    { size: "MD",   h: 44 },
  ];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string }[] = [];

  for (const sz of sizes) {
    const comp = figma.createComponent();
    comp.name = `Size=${sz.size}, State=Default`;
    comp.layoutMode = "VERTICAL";
    comp.primaryAxisSizingMode = "AUTO";
    comp.counterAxisSizingMode = "FIXED";
    comp.paddingTop = 4; comp.paddingBottom = 4; comp.itemSpacing = 0; comp.cornerRadius = 4;
    comp.clipsContent = false;
    comp.fills = [boundPaint(scv(maps, "color/dropdown/list/bg"))];
    comp.strokes = [boundPaint(scv(maps, "color/dropdown/list/border"))];
    comp.strokeWeight = 1; comp.strokeAlign = "OUTSIDE";
    comp.resize(140, 4 * sz.h + 8);

    // 4행: Default·Hover·Selected·Default
    for (const stateName of ["Default", "Hover", "Selected", "Default"] as const) {
      const ddComp = BUILT_COMPS[`DropdownList:${sz.size}:${stateName}`] ?? BUILT_COMPS[`DropdownList:${stateName}`];
      if (ddComp) {
        const inst = ddComp.createInstance();
        inst.name = "ddl-row";
        comp.appendChild(inst);
        (inst as any).layoutAlign = "STRETCH";
      } else {
        // Fallback (재설치 중 Dropdown List가 skip된 경우)
        const sn = stateName.toLowerCase();
        const row = figma.createFrame();
        row.name = "ddl-row";
        row.layoutMode = "HORIZONTAL"; row.counterAxisAlignItems = "CENTER";
        row.primaryAxisSizingMode = "FIXED"; row.counterAxisSizingMode = "FIXED";
        row.resize(140, sz.h); row.paddingLeft = 12; row.paddingRight = 12;
        row.paddingTop = 0; row.paddingBottom = 0;
        row.fills = [boundPaint(scv(maps, dd(`option/bg/${sn}`)))];
        row.appendChild(await makeBoundText("옵션", sz.h <= 28 ? 12 : 14, "Regular", scv(maps, dd(`option/label/${sn}`))));
        comp.appendChild(row);
      }
    }
    comps.push(comp);
    cells.push({ comp, size: sz.size });
    BUILT_COMPS[`Dropdown:${sz.size}:Default`] = comp;
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
    colHeaders: ["Default"],
    rowLabels: cells.map((c) => c.size),
    cellAt: (r, _c) => cells[r]?.comp ?? null,
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
  // V2.4 원본 실측(540:6032): pc-md 44h/font20 · pc-sm 42h/font16 · mobile 32h/font16. (높이=인디케이터 포함 총 심볼 높이)
  const sizes = [
    { size: "SM", brk: "PC",     h: 42, font: 16 },
    { size: "MD", brk: "PC",     h: 44, font: 20 },
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
    platforms: [{ name: "PC", sizes: ["SM", "MD"] }, { name: "Mobile", sizes: ["SM"] }],
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
//   Size 변형 = PC(md)·PC(sm)·Mobile. 각 변형에서 첫 탭 Selected, 나머지 Unselected. 라벨은 인스턴스 텍스트 override.
async function buildLineTabSet(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const TAB_LABELS = ["탭 메뉴 1", "탭 메뉴 2", "탭 메뉴 3"];
  // Size 변형 → 사용할 Line Tab 셀 키(brk-size) 매핑. Break(PC/Mobile)별로 그룹형 스펙에 나눠 배치한다.
  const sizeDefs = [
    { name: "MD", brk: "PC",     size: "MD" },
    { name: "SM", brk: "PC",     size: "SM" },
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
        comp.appendChild(inst);
        tabInsts.push(inst);
      }
    }
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
    platforms: [{ name: "PC", sizes: ["MD", "SM"] }, { name: "Mobile", sizes: ["SM"] }],
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
  const sizes = [
    { size: "SMALL",  h: 38, font: 13 },
    { size: "MEDIUM", h: 44, font: 14 },
  ];
  const W = 130;
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; row: number; col: number }[] = [];
  for (let row = 0; row < sizes.length; row++) {
    for (let col = 0; col < variants.length; col++) {
      const sc = sizes[row], v = variants[col];
      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, Type=${v.type}, Variant=${v.state}`;
      comp.resize(W, sc.h);
      comp.fills = [boundPaint(scv(maps, v.bg))];
      const t = await makeBoundText("1층 정문", sc.font, "Regular", scv(maps, v.text));
      comp.appendChild(t);
      t.x = 16; t.y = (sc.h - 1 - t.height) / 2;
      const border = figma.createRectangle();
      border.resize(W, 1);
      border.fills = [boundPaint(scv(maps, v.border))];
      comp.appendChild(border);
      border.x = 0; border.y = sc.h - 1;
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
    const size = sizes[row].size;        // "SMALL" | "MEDIUM"
    const v    = variants[col];           // { type, state, … }
    BUILT_COMPS[`TableCell:${size}:${v.type}:${v.state}`] = comp;
  }
  BUILT_SETS["Table Cell"] = set;
  const opts: SpecOpts = {
    title: "Table Cell",
    colHeaders: variants.map((v) => v.head),
    rowLabels: sizes.map((s) => s.size),
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

  // sizeKey: "MEDIUM"(MD) | "SMALL"(SM) — BUILT_COMPS["TableCell:SIZE:TYPE:STATE"] 조회키
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
    const font = sizeKey === "MEDIUM" ? 14 : 13;  // fallback 전용
    let xOff = COL[0];
    for (let k = 0; k < 4; k++) {
      const colW   = COL[k + 1];
      const cellComp = BUILT_COMPS[`TableCell:${sizeKey}:${cellType}:${cellState}`];
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
    { size: "MD", sizeKey: "MEDIUM", h: 44 },
    { size: "SM", sizeKey: "SMALL",  h: 38 },
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
  function chipSlot(v: string, st: string): { bg: string; bd: string; lb: string; open: boolean } {
    if (v === "line") {
      switch (st) {
        case "Hover":    return { bg: "hover",    bd: "default",  lb: "default",  open: false };
        case "Selected": return { bg: "selected", bd: "selected", lb: "default",  open: true };  // 펼침: 보더만 파랑
        case "Disabled": return { bg: "disabled", bd: "disabled", lb: "disabled", open: false };
        default:         return { bg: "default",  bd: "default",  lb: "default",  open: false };  // Default·Complete
      }
    }
    // solid — Hover 보더는 default 유지(chip/solid/border/hover 미정의)
    switch (st) {
      case "Hover":    return { bg: "hover",    bd: "default",  lb: "default",  open: false };
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
          chip.itemSpacing = 4; chip.paddingLeft = sc.padL; chip.paddingRight = sc.padR; chip.cornerRadius = 999;
          chip.fills = [boundPaint(scv(maps, `color/chip/${v}/bg/${ss.bg}`))];
          chip.strokes = [boundPaint(scv(maps, `color/chip/${v}/border/${ss.bd}`))];
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
          chip.appendChild(await makeIconInstance("chevron", scv(maps, `color/chip/${v}/label/${arrowSlot}`), 20, ss.open ? arrowUp : arrowDown, ss.open ? 90 : 270));
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
                ddComp = (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes(`Size=${ddSize}`))
                  ?? (ddSet.children as ComponentNode[]).find(c => c.type === "COMPONENT");
              }
            }
            if (ddComp) {
              const ddInst = ddComp.createInstance();
              ddInst.name = "dropdown";
              comp.appendChild(ddInst);
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
    node.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.15 }, offset: { x: 0, y: 4 }, radius: 8, spread: 0, visible: true, blendMode: "NORMAL" }];
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
// 정본: pages/components-new.html. Arrow 28×28(border·bg), Number 28×28(텍스트만).
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
// 정본: pages/components-new.html State Scenarios / registry/components/pagination.json.
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
// 정본: pages/components-new.html. PC only. 색은 color/navigation/* + line/gray/subtle + text/title/primary + icon/gray-dark.
// 메뉴 슬롯: 라벨 + 하단 2px 라인. Default=label/default-alt·밑줄 없음 / Hover·Selected=label/selected·밑줄(indicator/selected).
const GNB_MENU_SIZE: Record<string, { h: number; font: number; padX: number; inset: number }> = {
  md:  { h: 56, font: 18, padX: 40, inset: 24 },
  sm:  { h: 48, font: 18, padX: 32, inset: 20 },
  xsm: { h: 36, font: 14, padX: 32, inset: 20 },
};
const GNB_UTIL_SVGS = {
  // 원본 글리프(components-new.html). currentColor fill → icon/gray-dark 바인딩. viewBox 비율 보존(max side ≈ 24).
  lang: `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18C13.9659 18 18 13.9659 18 9C18 4.03412 13.9659 0 9 0C4.03412 0 0 4.03412 0 9C0 13.9659 4.03412 18 9 18ZM2.97529 3.84353C3.56824 4.09765 4.18235 4.32 4.81765 4.5C4.42588 5.80235 4.20353 7.13647 4.16118 8.47059H1.09059C1.20706 6.71294 1.89529 5.10353 2.97529 3.84353ZM5.99294 1.65176C5.67529 2.25529 5.4 2.86941 5.16706 3.49412C4.69059 3.35647 4.22471 3.20824 3.78 3.02824C4.43647 2.45647 5.17765 1.99059 5.99294 1.65176ZM8.47059 1.09059V4.01294C7.71882 3.98118 6.95647 3.89647 6.20471 3.73765C6.53294 2.88 6.93529 2.03294 7.43294 1.21765C7.77177 1.15412 8.12118 1.11176 8.47059 1.09059ZM10.5671 1.21765C11.0647 2.03294 11.4671 2.88 11.7953 3.73765C11.0435 3.88588 10.2918 3.98118 9.52941 4.01294V1.09059C9.87882 1.11176 10.2282 1.15412 10.5671 1.21765ZM14.22 3.02824C13.7753 3.20824 13.3094 3.36706 12.8329 3.49412C12.6 2.86941 12.3247 2.25529 12.0071 1.65176C12.8224 1.99059 13.5635 2.45647 14.22 3.02824ZM16.9094 8.47059H13.8388C13.7965 7.13647 13.5741 5.80235 13.1824 4.5C13.8282 4.32 14.4424 4.09765 15.0247 3.84353C16.1047 5.10353 16.7929 6.71294 16.9094 8.47059ZM15.0247 14.1565C14.4424 13.9024 13.8176 13.68 13.1824 13.5C13.5741 12.1976 13.7965 10.8635 13.8388 9.52941H16.9094C16.7929 11.2871 16.1047 12.8965 15.0247 14.1565ZM12.0071 16.3482C12.3247 15.7447 12.6 15.1306 12.8329 14.5059C13.3094 14.6435 13.7753 14.7918 14.22 14.9718C13.5635 15.5435 12.8224 16.0094 12.0071 16.3482ZM9.52941 16.9094V13.9871C10.2812 14.0188 11.0435 14.1035 11.7953 14.2624C11.4671 15.12 11.0647 15.9671 10.5671 16.7824C10.2282 16.8459 9.87882 16.8882 9.52941 16.9094ZM7.43294 16.7824C6.93529 15.9671 6.53294 15.12 6.20471 14.2624C6.95647 14.1141 7.70824 14.0188 8.47059 13.9871V16.9094C8.12118 16.8882 7.77177 16.8459 7.43294 16.7824ZM3.78 14.9718C4.22471 14.7918 4.69059 14.6329 5.16706 14.5059C5.4 15.1306 5.67529 15.7447 5.99294 16.3482C5.17765 16.0094 4.43647 15.5435 3.78 14.9718ZM5.84471 4.74353C6.71294 4.92353 7.59177 5.04 8.47059 5.07176V8.47059H5.22C5.26235 7.22118 5.47412 5.97177 5.85529 4.74353H5.84471ZM12.1553 4.74353C12.5259 5.97177 12.7376 7.22118 12.7906 8.47059H9.54V5.07176C10.4188 5.04 11.2871 4.93412 12.1659 4.74353H12.1553ZM12.1553 13.2565C11.2871 13.0765 10.4082 12.96 9.52941 12.9388V9.54H12.78C12.7376 10.7894 12.5259 12.0388 12.1447 13.2671L12.1553 13.2565ZM8.47059 9.52941V12.9282C7.59177 12.96 6.72353 13.0659 5.84471 13.2459C5.47412 12.0176 5.26235 10.7682 5.20941 9.51882H8.46L8.47059 9.52941ZM4.16118 9.52941C4.20353 10.8635 4.42588 12.1976 4.81765 13.5C4.17177 13.68 3.55765 13.9024 2.97529 14.1565C1.89529 12.8965 1.20706 11.2871 1.09059 9.52941H4.16118Z" fill="currentColor"/></svg>`,
  account: `<svg width="24" height="21.58" viewBox="0 0 24 21.5816" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.561 13.7324H7.43901C5.67118 13.7324 4.00236 14.3971 2.84266 15.5568C0.494991 17.9186 0.0141426 21.2704 0 21.3977L1.37183 21.5816C1.37183 21.5816 1.81025 18.5409 3.8185 16.5185C4.72363 15.6134 6.03889 15.1042 7.43901 15.1042H16.561C17.9611 15.1042 19.2764 15.6275 20.1815 16.5185C22.1897 18.5409 22.6282 21.5391 22.6282 21.5816L24 21.3977C23.9859 21.2563 23.505 17.9045 21.1573 15.5568C19.9976 14.3971 18.3288 13.7324 16.561 13.7324Z" fill="currentColor"/><path d="M5.9968 6.01061C5.9968 9.31998 8.69803 12.0212 12.0074 12.0212C15.3168 12.0212 18.018 9.31998 18.018 6.01061C18.018 2.70124 15.3168 0 12.0074 0C8.69803 0 5.9968 2.70124 5.9968 6.01061ZM16.6037 6.01061C16.6037 8.54213 14.5389 10.607 12.0074 10.607C9.47588 10.607 7.41106 8.54213 7.41106 6.01061C7.41106 3.47908 9.47588 1.41426 12.0074 1.41426C14.5389 1.41426 16.6037 3.47908 16.6037 6.01061Z" fill="currentColor"/></svg>`,
  menu: `<svg width="24" height="16.93" viewBox="0 0 24 16.9274" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1.41176H24V0.705882V0H0V1.41176Z" fill="currentColor"/><path d="M0 9.17647H24V8.47059V7.76471H0V9.17647Z" fill="currentColor"/><path d="M0 16.9274H24V16.2215V15.5156H0V16.9274Z" fill="currentColor"/></svg>`,
};

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
// 3 토글 프로퍼티(language·full menu·user)의 5개 조합. 시각 순서: language → user → full menu, gap 8.
//   language=on → Language Icon(지구본+한국어) 컴포넌트 인스턴스(레거시 globe 아이콘 교체).
//   user/full menu → V2.2 라이브러리 아이콘(account·menu) 32px 박스·24 glyph.
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
  // 레거시 1980:53435 의 5개 변형 (language·full menu·user on/off). 순서·구성 동일.
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
    comp.name = `language=${d.language}, full menu=${d.menu}, user=${d.user}`;
    comp.layoutMode = "HORIZONTAL"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO";
    comp.itemSpacing = 8; comp.fills = [];
    // 시각 순서: language → user(계정) → full menu (레거시 코드 순서)
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

      // 메뉴 묶음 (3 슬롯, 인접 gap0)
      const menus = figma.createFrame(); menus.name = "menus"; menus.fills = [];
      menus.layoutMode = "HORIZONTAL"; menus.itemSpacing = 0;
      menus.counterAxisAlignItems = "CENTER"; menus.primaryAxisSizingMode = "AUTO"; menus.counterAxisSizingMode = "AUTO";
      // GNB Menu 컴포넌트 인스턴스 사용 — GNB 바 사이즈(sk)와 같은 GNB Menu 사이즈 매칭.
      //   첫 슬롯=Selected(밑줄), 나머지=Default. (#4 사용자 결정: raw menu 프레임 대신 GNB Menu 인스턴스)
      for (let mi = 0; mi < 3; mi++) {
        const state = mi === 0 ? "Selected" : "Default";
        const menuComp = menuCellByKey.get(`${sk}/${state}`);
        if (menuComp) { menus.appendChild(menuComp.createInstance()); }
        else { const slot = figma.createFrame(); slot.name = "menu"; menus.appendChild(slot); await fillGnbMenu(slot, maps, sk, state); }
      }

      // 유틸 영역 = GNB Utility Icon 세트 all-on 변형(언어·계정·메뉴) 인스턴스 1개. (#3 사용자 결정)
      //   불필요한 "util" 래퍼 프레임 제거 — GNB Utility Icon 인스턴스를 바 레이아웃에 직접 붙인다(#2 사용자 지적 2026-06-25).
      let utilComp: ComponentNode | undefined = BUILT_COMPS["GNBUtil:full"];
      if (!utilComp) {
        const us = await getBuiltSet("GNB Utility Icon");
        if (us) utilComp = ((us.children as ComponentNode[]) || []).find((c) => c.type === "COMPONENT" && c.name.includes("language=on, full menu=on, user=on"))
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
        leading.appendChild(logo); leading.appendChild(menus);
        comp.appendChild(leading); if (util) comp.appendChild(util);
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

// ── Date Picker — 트리거(form-control 재사용) + 캘린더 패널(color/date-picker/*) ─
// 정본: pages/components-new.html / Figma 540:3794(input)·540:4216(PC calendar).
// 미결 HD(needs-decision): componentSetKey 미확정 · 모바일 인터랙션(bottom sheet vs inline) 미정 → 모바일 패널은 생성하지 않음.
// 트리거는 Select 와 동일 구조(form-control), Open 상태에 PC 캘린더 패널을 부착.

// ── Calendar Cell / Calendar Tile (lazy-build 컴포넌트 세트) ───────────────────
// V2.4 정본: calendar_cell(540:4167) · calendar_tile(540:4209), fileKey yE5UCFEbmXJBlYJWB24Lz2.
// Calendar·Date Picker(Open) 가 이 세트의 variant 를 인스턴스로 사용(숫자/라벨 override).
// lazy-build: 소비자가 먼저 호출해도 1회만 빌드(BUILT_SETS 캐시). CATEGORIES 는 위치만 결정.
const DP = (k: string) => `color/date-picker/${k}`;

// Calendar Cell — 44×44 outer, axes Type={Standard,Range} × State(4). 숫자 텍스트 layer 이름 = "num".
// V2.4 구조: 44×44(center, p5) > [Range: 밴드 Rectangle(absolute)] + inner 30×30 원(센터) > 숫자.
async function buildCalendarCell(maps: BuildMaps): Promise<{ set: ComponentSetNode; variants: Record<string, ComponentNode> }> {
  // [innerFill, innerStroke, textKey] (V2.4 실측 — selected stroke = border/today)
  const STD: Record<string, [string, string, string]> = {
    Default:  ["cell/bg/today",    "cell/bg/today",     "text/secondary"],
    Today:    ["cell/bg/today",    "cell/border/today", "text/today"],
    Selected: ["cell/bg/selected", "cell/border/today", "text/selected"],
    Disabled: ["cell/bg/today",    "cell/bg/today",     "text/disabled"],
  };
  // Range: [bandX, bandW, innerFill, innerStroke, textKey] (밴드는 absolute, h30 top7)
  const RNG: Record<string, [number, number, string, string, string]> = {
    Default:  [0,  44, "cell/bg/range",    "cell/bg/range",     "text/secondary"],
    Start:    [22, 22, "cell/bg/today",    "cell/border/today", "text/today"],
    End:      [0,  22, "cell/bg/selected", "cell/border/today", "text/selected"],
    Disabled: [0,  44, "cell/bg/range",    "cell/bg/range",     "text/disabled"],
  };

  // inner 30×30 원 + 숫자("num") 생성
  async function makeInner(fillKey: string, strokeKey: string, textKey: string, bold: boolean): Promise<FrameNode> {
    const inner = figma.createFrame(); inner.name = "inner"; inner.cornerRadius = 999;
    inner.layoutMode = "HORIZONTAL"; inner.primaryAxisAlignItems = "CENTER"; inner.counterAxisAlignItems = "CENTER";
    inner.primaryAxisSizingMode = "FIXED"; inner.counterAxisSizingMode = "FIXED"; inner.resize(30, 30);
    inner.fills = [boundPaint(scv(maps, DP(fillKey)))];
    inner.strokes = [boundPaint(scv(maps, DP(strokeKey)))]; inner.strokeWeight = 1; inner.strokeAlign = "INSIDE";
    const t = await makeBoundText("1", 16, bold ? "Medium" : "Medium", scv(maps, DP(textKey)));
    t.name = "num";
    inner.appendChild(t);
    return inner;
  }

  const comps: ComponentNode[] = [];
  const variants: Record<string, ComponentNode> = {};

  // outer 컴포넌트 — auto-layout(center) 44×44. Range 밴드는 absolute 자식.
  function makeOuter(name: string): ComponentNode {
    const comp = figma.createComponent();
    comp.name = name;
    comp.layoutMode = "HORIZONTAL"; comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED"; comp.resize(44, 44);
    comp.fills = []; comp.clipsContent = true;
    return comp;
  }

  // Type=Standard
  for (const state of ["Default", "Today", "Selected", "Disabled"]) {
    const [f, s, txt] = STD[state];
    const comp = makeOuter(`Type=Standard, State=${state}`);
    comp.appendChild(await makeInner(f, s, txt, state === "Selected"));
    comps.push(comp); variants[`Standard:${state}`] = comp;
  }
  // Type=Range — 밴드(absolute) + inner 원
  for (const state of ["Default", "Start", "End", "Disabled"]) {
    const [bx, bw, f, s, txt] = RNG[state];
    const comp = makeOuter(`Type=Range, State=${state}`);
    // 밴드 Rectangle — absolute(z-below inner). h30, top7(=(44-30)/2), 좌표 V2.4 실측.
    const band = figma.createRectangle();
    band.name = "band"; band.resize(bw, 30);
    band.fills = [boundPaint(scv(maps, DP("cell/bg/range")))]; band.strokes = [];
    comp.appendChild(band);
    // 밴드는 absolute(원 아래 z) — 좌표 V2.4 실측(top7=(44-30)/2). mock/구버전 대비 try.
    try { (band as unknown as { layoutPositioning: string }).layoutPositioning = "ABSOLUTE"; } catch (e) { /* skip */ }
    try { band.x = bx; band.y = 7; } catch (e) { /* skip */ }
    comp.appendChild(await makeInner(f, s, txt, state === "End"));
    comps.push(comp); variants[`Range:${state}`] = comp;
  }

  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Calendar Cell";
  // ⚠️ 셀 마스터에 모드를 핀하지 않는다(setLightMode 금지) — 인스턴스가 부모(패널/스펙) 모드 상속.
  return { set, variants };
}

// Calendar Tile — 88×56 cornerRadius4, axis State={Default,Selected,Disabled}. 라벨 layer 이름 = "label".
// V2.4 실측(540:4209): root frame 의 fill+stroke(둘 다), selected border = color/date-picker/cell/border/today.
async function buildCalendarTile(maps: BuildMaps): Promise<{ set: ComponentSetNode; variants: Record<string, ComponentNode> }> {
  // [bgKey, borderKey, textKey, sampleLabel]
  const TILE: Record<string, [string, string, string, string]> = {
    Default:  ["tile/bg/default",  "tile/border/default",  "text/primary",  "2022"],
    // Hover bg = Secondary 버튼 hover foundation 동일(gray/50·gray-dark/200) → tile/bg/hover 신규(사용자 결정 2026-06-25).
    Hover:    ["tile/bg/hover",    "tile/border/default",  "text/primary",  "2023"],
    Selected: ["tile/bg/selected", "cell/border/today",    "text/today",    "2025"],
    Disabled: ["tile/bg/disabled", "tile/border/disabled", "text/disabled", "2021"],
  };
  const comps: ComponentNode[] = [];
  const variants: Record<string, ComponentNode> = {};
  for (const state of ["Default", "Hover", "Selected", "Disabled"]) {
    const [bg, bd, txt, label] = TILE[state];
    const comp = figma.createComponent();
    comp.name = `State=${state}`;
    comp.layoutMode = "HORIZONTAL"; comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED"; comp.resize(88, 56);
    comp.cornerRadius = 4; comp.clipsContent = true;
    comp.fills = [boundPaint(scv(maps, DP(bg)))];
    comp.strokes = [boundPaint(scv(maps, DP(bd)))]; comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    const t = await makeBoundText(label, 16, "Medium", scv(maps, DP(txt)));
    t.name = "label";
    comp.appendChild(t);
    comps.push(comp); variants[state] = comp;
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
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
//   key 형식 = `${Type}:${State}` (buildCalendarCell 과 동일).
function reconstructCalCellVariants(set: ComponentSetNode): Record<string, ComponentNode> {
  const variants: Record<string, ComponentNode> = {};
  for (const ch of set.children) {
    if (ch.type !== "COMPONENT") continue;
    const t = variantProp(ch, "Type"), s = variantProp(ch, "State");
    if (t && s) variants[`${t}:${s}`] = ch;
  }
  return variants;
}
// Calendar Tile 세트(축 State 만) variants 복원. key = State 값.
function reconstructCalTileVariants(set: ComponentSetNode): Record<string, ComponentNode> {
  const variants: Record<string, ComponentNode> = {};
  for (const ch of set.children) {
    if (ch.type !== "COMPONENT") continue;
    const s = variantProp(ch, "State");
    if (s) variants[s] = ch;
  }
  return variants;
}
async function getOrBuildCalendarCell(maps: BuildMaps): Promise<{ set: ComponentSetNode; variants: Record<string, ComponentNode> }> {
  if (_calCell && !_calCell.set.removed) return _calCell;
  // 재설치 보존: 캔버스에 기존 세트가 있으면 제거/재빌드하지 않고 그대로 재사용한다.
  //   (재빌드+제거하면 skip 된 Calendar/Date Picker 인스턴스가 가리키던 옛 세트가 사라져 detach/깨짐 — Figma 자동 remap 없음.)
  const existing = await getBuiltSet("Calendar Cell");
  if (existing && !existing.removed && existing.children.some((c) => c.type === "COMPONENT")) {
    _calCell = { set: existing, variants: reconstructCalCellVariants(existing) };
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
    _calTile = { set: existing, variants: reconstructCalTileVariants(existing) };
  } else {
    _calTile = await buildCalendarTile(maps);
  }
  BUILT_SETS["Calendar Tile"] = _calTile.set;
  for (const [k, c] of Object.entries(_calTile.variants)) BUILT_COMPS[`CalendarTile:${k}`] = c;
  return _calTile;
}

// Calendar Cell 인스턴스 — Type/State 선택 후 숫자("num") override.
async function calCellInstance(cell: { variants: Record<string, ComponentNode> }, key: string, day: number): Promise<InstanceNode> {
  const master = cell.variants[key] ?? cell.variants["Standard:Default"];
  const inst = master.createInstance();
  const t = (inst.findOne((n) => n.name === "num" && n.type === "TEXT") ?? inst.findOne((n) => n.type === "TEXT")) as TextNode | null;
  if (t) { await figma.loadFontAsync(t.fontName as FontName); t.characters = String(day); }
  return inst;
}

// Calendar Tile 인스턴스 — State 선택 후 라벨("label") override.
async function calTileInstance(tile: { variants: Record<string, ComponentNode> }, state: string, label: string): Promise<InstanceNode> {
  const master = tile.variants[state] ?? tile.variants["Default"];
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
  const PANEL_W = 356, PANEL_H = 352;
  const CW = 308 / 7; // 콘텐츠폭(356-24*2)÷7 = 44

  // 패널 컴포넌트 초기화 + 내부 content-frame(gap 있음) 반환
  function initComp(compName: string, vGap: number): [ComponentNode, FrameNode] {
    const comp = figma.createComponent();
    comp.name = compName;
    comp.layoutMode = "VERTICAL";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
    comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.resize(PANEL_W, PANEL_H);
    comp.paddingLeft = 24; comp.paddingRight = 24;
    comp.paddingTop = 20; comp.paddingBottom = 20; comp.itemSpacing = 0;
    comp.cornerRadius = 4;
    comp.fills = [boundPaint(scv(maps, dp("panel/bg")))];
    comp.strokes = [boundPaint(scv(maps, dp("panel/border")))];
    comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    comp.clipsContent = true;
    try {
      (comp as any).effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.15 }, offset: { x: 0, y: 4 }, radius: 8, spread: 0, visible: true, blendMode: "NORMAL" }];
    } catch (_) { /* 환경 미지원 */ }
    const inner = figma.createFrame();
    inner.name = "content"; inner.fills = [];
    inner.layoutMode = "VERTICAL"; inner.primaryAxisSizingMode = "AUTO"; inner.counterAxisSizingMode = "AUTO";
    inner.counterAxisAlignItems = "CENTER"; inner.itemSpacing = vGap;
    comp.appendChild(inner); inner.layoutAlign = "STRETCH";
    return [comp, inner];
  }

  // 공용 헤더 (이전·라벨·다음)
  async function makeCalHdr(label: string): Promise<FrameNode> {
    const hdr = figma.createFrame(); hdr.name = "header"; hdr.fills = [];
    hdr.layoutMode = "HORIZONTAL"; hdr.primaryAxisSizingMode = "FIXED"; hdr.counterAxisSizingMode = "FIXED";
    hdr.primaryAxisAlignItems = "SPACE_BETWEEN"; hdr.counterAxisAlignItems = "CENTER";
    hdr.resize(308, 32); // 308 = PANEL_W - paddingLeft(24) - paddingRight(24)
    // 좌측 화살표: 불필요한 래퍼 프레임 해제(wrap:false) — 우측(rotation 0, 래퍼 없음)과 동일 구조.
    //   정사각 chevron + 180° 회전은 x/y 중앙정렬이 정상이라 래퍼 불필요(makeIconInstance L986 동일 근거).
    // 헤더 이전/다음 < > = 전용 date-picker/icon/* (default). 라벨 텍스트는 text/primary 유지.
    hdr.appendChild(await makeIconInstance("chevron", scv(maps, dp("icon/default")), 0, CHEV_L, 180, { wrap: false }));
    hdr.appendChild(await makeBoundText(label, 24, "Bold", scv(maps, dp("text/primary"))));
    hdr.appendChild(await makeIconInstance("chevron", scv(maps, dp("icon/default")), 0, CHEV_R, 0));
    return hdr;
  }

  // 연도/월 타일 — Calendar Tile 인스턴스(라벨 override). disabled=Disabled, 그 외=Default.
  async function makeYMTile(label: string, disabled: boolean): Promise<SceneNode> {
    return calTileInstance(calTile, disabled ? "Disabled" : "Default", label);
  }

  // 타일 행 3개 (가로 gap=12)
  async function makeYMRow(labels: string[], dis: boolean[]): Promise<FrameNode> {
    const row = figma.createFrame(); row.name = "tile-row"; row.fills = [];
    row.layoutMode = "HORIZONTAL"; row.primaryAxisSizingMode = "AUTO"; row.counterAxisSizingMode = "AUTO";
    row.counterAxisAlignItems = "CENTER"; row.itemSpacing = 12;
    for (let i = 0; i < labels.length; i++) row.appendChild(await makeYMTile(labels[i], dis[i] ?? false));
    return row;
  }

  // ── State=Date (달력 그리드 — 2025.01 샘플) ────────────────────────────────
  const [dateComp, dateInner] = initComp("State=Date", 16);
  dateInner.appendChild(await makeCalHdr("2025.01"));

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
    cell.primaryAxisSizingMode = "FIXED"; cell.counterAxisSizingMode = "FIXED"; cell.resize(CW, 44);
    cell.appendChild(await makeBoundText(ch, 16, "Medium", scv(maps, dp("text/primary"))));
    wkRow.appendChild(cell);
  }

  // 5주×7일 그리드 (2025.01 기준: 1일=수요일, 월요일 시작)
  type CalCell = { day: number; kind: "normal" | "other" | "today" | "selected" | "disabled" };
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
      const g = calGrid[r * 7 + c];
      // day = Calendar Cell 인스턴스(Standard). other-month = Standard:Disabled 매핑(V2.4 미존재 — 보고).
      const inst = await calCellInstance(calCell, dayKindToCellKey(g.kind), g.day);
      weekRow.appendChild(inst);
    }
  }
  setLightMode(dateComp, maps);

  // ── State=Year (연도 선택 — 4×3 타일, 2021~2032 샘플) ─────────────────────
  const [yearComp, yearInner] = initComp("State=Year", 20);
  yearInner.appendChild(await makeCalHdr("2025"));
  const yearGrid = figma.createFrame(); yearGrid.name = "year-grid"; yearGrid.fills = [];
  yearGrid.layoutMode = "VERTICAL"; yearGrid.primaryAxisSizingMode = "AUTO"; yearGrid.counterAxisSizingMode = "AUTO";
  yearGrid.counterAxisAlignItems = "CENTER"; yearGrid.itemSpacing = 12;
  for (const [ls, ds] of [
    [["2021", "2022", "2023"], [true,  false, false]],
    [["2024", "2025", "2026"], [false, false, false]],
    [["2027", "2028", "2029"], [false, false, false]],
    [["2030", "2031", "2032"], [true,  true,  true ]],
  ] as [string[], boolean[]][]) yearGrid.appendChild(await makeYMRow(ls, ds));
  yearInner.appendChild(yearGrid);
  setLightMode(yearComp, maps);

  // ── State=Month (월 선택 — 4×3 타일, 1월~12월) ────────────────────────────
  const [monthComp, monthInner] = initComp("State=Month", 20);
  monthInner.appendChild(await makeCalHdr("2025"));
  const monthGrid = figma.createFrame(); monthGrid.name = "month-grid"; monthGrid.fills = [];
  monthGrid.layoutMode = "VERTICAL"; monthGrid.primaryAxisSizingMode = "AUTO"; monthGrid.counterAxisSizingMode = "AUTO";
  monthGrid.counterAxisAlignItems = "CENTER"; monthGrid.itemSpacing = 12;
  for (const ls of [["1월","2월","3월"],["4월","5월","6월"],["7월","8월","9월"],["10월","11월","12월"]]) {
    monthGrid.appendChild(await makeYMRow(ls, [false, false, false]));
  }
  monthInner.appendChild(monthGrid);
  setLightMode(monthComp, maps);

  // ── combineAsVariants + 스펙 ──────────────────────────────────────────────
  const set = figma.combineAsVariants([dateComp, yearComp, monthComp], figma.currentPage);
  set.name = "Calendar";
  set.x = 0; set.y = originY;
  // Date Picker Open 상태가 인스턴스로 참조 — anatomy gate: "calendar-panel" raw 프레임 금지
  BUILT_COMPS["Calendar:Date"]  = dateComp;
  BUILT_COMPS["Calendar:Year"]  = yearComp;
  BUILT_COMPS["Calendar:Month"] = monthComp;
  BUILT_SETS["Calendar"] = set;

  const opts: SpecOpts = {
    title: "Calendar",
    colHeaders: ["Date", "Year", "Month"],
    rowLabels: [""],
    cellAt: (_r, c) => [dateComp, yearComp, monthComp][c] ?? null,
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
      // 캘린더 패널은 사이즈 불변(356px 단일) — PC 의 모든 사이즈(XXSM·XSM·MD) Open variant 에 부착(#6 사용자 지적 2026-06-25).
      //   모바일은 #7 별도 바텀시트 컴포넌트로 처리(여기서는 제외).
      // Calendar 컴포넌트 인스턴스 재사용 (anatomy gate: "calendar-panel" raw 프레임 금지)
      if (st.open && sc.brk === "PC") {
        let calComp: ComponentNode | undefined = BUILT_COMPS["Calendar:Date"];
        if (!calComp) {
          const calSet = await getBuiltSet("Calendar");
          if (calSet) {
            calComp = (calSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes("State=Date"))
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
  // 시트 배경 = surface/default (Light base/white · Dark gray-dark/100) — 캘린더 패널(color/date-picker/panel/bg)과 동일색.
  //   사용자 결정 2026-06-26: 시트면 bg = 캘린더 영역 bg 로 통일(라이트·다크 모두). 캘린더만 다른색이면 안 됨.
  //   ※ 이전 '시트=gray/50' 주석은 오해였음. 원 요청은 "라이트 시트(흰색)가 흰 섹션 배경에 묻혀 안 보이니 시트 '뒤'에 배경을 깔아달라" —
  //     시트면은 흰색(surface) 유지, 시트가 떠 보이는 효과는 세트 외부 배경(아래 bg/muted)이 담당한다.
  comp.fills = [boundPaint(scv(maps, "color/surface/default"))];
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
  let calComp: ComponentNode | undefined = BUILT_COMPS["Calendar:Date"];
  if (!calComp) {
    const calSet = await getBuiltSet("Calendar");
    if (calSet) {
      calComp = (calSet.children as ComponentNode[]).find(c => c.type === "COMPONENT" && c.name.includes("State=Date"))
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
  set.fills = [boundPaint(scv(maps, "color/bg/muted"))];
  return { set, bottomY };
}

// ── Calendar Cell / Calendar Tile — 레이아웃 등록기 ───────────────────────────
// 빌드는 lazy(Calendar/Date Picker 가 선행 호출) → 이미 만들어진 세트를 originY 로 재배치 + 스펙 데코레이트.
// CATEGORIES Form 에서 Date Picker 뒤 위치만 결정.
async function buildCalendarCellLayout(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const { set, variants } = await getOrBuildCalendarCell(maps);
  set.x = 0; set.y = originY;
  // 2행(Standard·Range) × 4열(상태). Standard 상태 표기와 Range 상태 표기가 다르므로 행별 cellAt 분기.
  const stdStates = ["Default", "Today", "Selected", "Disabled"];
  const rngStates = ["Default", "Start", "End", "Disabled"];
  const opts: SpecOpts = {
    title: "Calendar Cell",
    // 열 헤더 = 상태 설명. Standard/Range 행이 col별로 다른 상태라 둘 다 표기(rowLabels로 행 구분).
    colHeaders: ["Default", "Today / Start", "Selected / End", "Disabled"],
    rowLabels: ["Standard", "Range"],
    cellAt: (r, c) => r === 0 ? (variants[`Standard:${stdStates[c]}`] ?? null) : (variants[`Range:${rngStates[c]}`] ?? null),
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 80, cellH: 60, rowLabelW: 80,
  };
  let bottomY = await decorateSetFlat(set, opts, maps);
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
}

async function buildCalendarTileLayout(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const { set, variants } = await getOrBuildCalendarTile(maps);
  set.x = 0; set.y = originY;
  const states = ["Default", "Hover", "Selected", "Disabled"];
  const opts: SpecOpts = {
    title: "Calendar Tile",
    colHeaders: states,
    rowLabels: [""],
    cellAt: (_r, c) => variants[states[c]] ?? null,
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
  target.fills = [boundPaint(scv(maps, "color/surface/default"))];
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
  bar.fills = [boundPaint(scv(maps, "color/surface/default"))];
  const lock = makeBoundIcon(SHELL_LOCK_SVG, scv(maps, "color/icon/gray")); // icon-vector-allow: 휴대폰 셸 상태바 크롬 — DS UI 아이콘 아님
  lock.name = "ic_잠김"; bar.appendChild(lock); try { lock.resize(24, 24); } catch (e) { /* */ }
  const pill = figma.createFrame();
  pill.name = "url"; pill.layoutMode = "HORIZONTAL";
  pill.primaryAxisAlignItems = "CENTER"; pill.counterAxisAlignItems = "CENTER";
  pill.primaryAxisSizingMode = "FIXED"; pill.counterAxisSizingMode = "FIXED";
  pill.cornerRadius = 100; pill.fills = [boundPaint(scv(maps, "color/bg/subtle"))];
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
  target.fills = [boundPaint(scv(maps, "color/surface/default"))];
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
  row.fills = [boundPaint(scv(maps, "color/surface/default"))];
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
  setLightMode(app, maps);

  const web = figma.createComponent();
  web.name = "Platform=Web";
  web.layoutMode = "VERTICAL"; web.primaryAxisSizingMode = "AUTO"; web.counterAxisSizingMode = "FIXED";
  web.resize(360, 95); web.itemSpacing = 0; web.fills = [];
  const toolbar = await buildBrowserToolbarRow(maps);
  toolbar.layoutAlign = "STRETCH"; web.appendChild(toolbar);
  const nav = figma.createFrame(); nav.name = "android-nav";
  populateAndroidNav(nav, maps);
  nav.layoutAlign = "STRETCH"; web.appendChild(nav);
  setLightMode(web, maps);

  const set = figma.combineAsVariants([app, web], figma.currentPage);
  set.name = "NavBar";
  set.x = 0; set.y = originY;
  // App(안드로이드 내비)·Web(브라우저 툴바+내비) 두 variant 를 라벨과 함께 세로 나열(겹침 방지).
  const opts: SpecOpts = {
    title: "NavBar", colHeaders: [""], rowLabels: ["App", "Web"],
    cellAt: (r, _c) => (r === 0 ? app : web),
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 400, cellH: 100, rowLabelW: 56,
  };
  const lightBottomY = await decorateSetFlat(set, opts, maps);
  // 다크 = 라이트 우측(buildSpec 기본 W+80). 좁은 Platform 컴포넌트(StatusBar·NavBar·CI)는 우측, 넓은 것은 아래 — river 결정 2026-06-25
  let bottomY = lightBottomY;
  try { bottomY = Math.max(bottomY, await buildSpec(opts, maps)); } catch (e) { console.warn(e); }
  return { set, bottomY };
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
  activeTab.fills = [boundPaint(scv(maps, "color/surface/default"))];
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
  addrRow.fills = [boundPaint(scv(maps, "color/surface/default"))];
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
  pill.fills = [boundPaint(scv(maps, "color/bg/muted"))];
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
// 크기: 에스원=42×16, 삼성=134×36 (Brand별 각자 크기 — 사용자 결정 2026-06-23)
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
  const s1Comps: ComponentNode[] = [];
  S1_COLORS.forEach(({ color, v }, i) => {
    const comp = figma.createComponent();
    comp.name = `Brand=에스원, Color=${color}`;
    comp.resize(42, 16); comp.fills = [];
    comp.x = i * CI_COL; comp.y = 0;
    const logo = figma.createNodeFromSvg(S1_LOGO_SVG); // icon-vector-allow: CI 브랜드 워드마크 벡터 자산
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

      for (let j = 0; j < 3; j++) {
        const { pos, st } = cellSpec(j, selIdx);
        const cellComp = await pickCell(pos, st, sz);
        if (cellComp) {
          const inst = cellComp.createInstance();
          comp.appendChild(inst);
        }
      }

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
    { name: "Navigation",   members: ["GNB", "GNB Utility Icon", "Language Icon"] },
    { name: "Line Tab",     members: ["Line Tab Set", "Line Tab"] },
    { name: "Pagination",   members: ["Pagination", "Pagination Cell"] },
    { name: "Actions",      members: ["Button"] },
    { name: "Selection",    members: ["Checkbox", "Radio", "Toggle", "Multi Toggle", "Multi Toggle Element"] },
    // Dropdown 섹션 = Form Control 에서 분리(사용자 결정 2026-06-26). Selection 아래에 세로 스택 배치(stage 2 STACKED).
    //   Form Control 보다 GRID 앞에 둬서 Select Box(Form Control)의 Dropdown 의존(BUILD_DEPENDENCIES)이 빌드순서로 충족됨.
    { name: "Dropdown",     members: ["Dropdown", "Dropdown List"] },
    { name: "Chip",         members: ["Chip"] },
    // members = 표시(나열) 순서: 메인 컴포넌트 → 그 안을 구성하는 요소 컴포넌트 순. 빌드(생성) 순서는
    //   BUILD_DEPENDENCIES 로 의존성(요소 먼저)이 자동 적용된다 — 표시순서 ≠ 빌드순서 규칙(§ 아래 주석).
    { name: "Form Control", members: ["Input", "Search Input", "Text Area", "Select Box"] },
    { name: "Date Picker",  members: ["Date Picker", "Calendar", "Calendar Cell", "Calendar Tile", "Date Picker Mobile Bottom Sheet"] },
    { name: "Time Picker",  members: ["Time Picker", "Time Picker Dropdown", "Time Picker Cell"] },
    { name: "Table",        members: ["Table", "Table Cell"] },
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
  "Filter Chip": ["Dropdown"],        // Selected 상태가 Dropdown 패널 인스턴스 부착(타 카테고리=순서 보장)
  "Time Picker": ["Time Picker Dropdown"], // Focus 상태가 Time Picker Dropdown 인스턴스 부착
  "GNB": ["GNB Utility Icon"],        // GNB 바 유틸 영역이 GNB Utility Icon all-on 인스턴스 부착
  "GNB Utility Icon": ["Language Icon"], // language=on 변형이 Language Icon 인스턴스 부착
  "Pagination": ["Pagination Cell"],  // 완성 바가 Pagination Cell(Arrow·Edge·Number) 인스턴스 조합
  "Multi Toggle": ["Multi Toggle Element"], // 조합형태가 Multi Toggle Element 셀 인스턴스 사용 → 요소 먼저 빌드
  "Date Picker": ["Calendar"],        // Open 상태가 Calendar 패널 인스턴스 부착(BUILT_COMPS["Calendar:Date"])
  // 모바일 바텀시트: Calendar:Date 인스턴스(본문) + Button primary(하단 "적용") 부착 → 둘 다 선빌드 필요.
  "Date Picker Mobile Bottom Sheet": ["Calendar", "Button"],
  "Line Tab Set": ["Line Tab"],       // 탭 3개 묶음 세트가 Line Tab 셀 인스턴스 조합
  // Table 푸터가 완성 Pagination 바(BUILT_COMPS["Pagination:Bar/Middle"]) 인스턴스 부착.
  //   (타 카테고리 의존 = 카테고리 순서로 보장: Pagination 카테고리가 Table 보다 먼저라 선빌드됨.)
  "Table": ["Pagination"],
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
  onProgress?: (step: string, pct: number) => void
): Promise<{ created: number; added: string[]; skipped: string[] }> {
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

  // 컴포넌트 빌더 — 이름 → (originY) => {set, bottomY}. Input 은 originX=0(섹션 컬럼 좌측정렬).
  const runners: { [name: string]: (oy: number) => Promise<{ set: ComponentSetNode; bottomY: number }> } = {
    "Button":               (oy) => buildButtonSet(maps, onProgress, 92, 97, oy),
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
    "Calendar Cell":        (oy) => buildCalendarCellLayout(maps, oy),
    "Calendar Tile":        (oy) => buildCalendarTileLayout(maps, oy),
    "Time Picker":          (oy) => buildTimePicker(maps, oy),
    "Time Picker Dropdown": (oy) => buildTimePickerDropdown(maps, oy),
    "Table Cell":           (oy) => buildTableCell(maps, oy),
    "Table":                (oy) => buildTable(maps, oy),
    "Line Tab":             (oy) => buildLineTab(maps, oy),
    "Line Tab Set":         (oy) => buildLineTabSet(maps, oy),
    "GNB Utility Icon":     (oy) => buildGNBUtilIcon(maps, oy),
    "Language Icon":        (oy) => buildLanguageIcon(maps, oy),
    "GNB":                  (oy) => buildGNB(maps, oy),
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
      const run = runners[name];
      if (!run) continue;
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
      const res = await run(catY);
      created += res.set.children.length;
      added.push(name);
      catY = res.bottomY + 140;
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
      "Form Control", "Date Picker", "Time Picker", "Table"];
    // 세로 스택 섹션: ROW 의 가로 컬럼 아래에 쌓는다(같은 X). Filter Chip→Chip 아래 · Dropdown→Selection 아래.
    const STACKED = [
      { name: "Filter Chip", below: "Chip",      placed: false },
      { name: "Dropdown",    below: "Selection", placed: false },
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

  if (onProgress) onProgress(`완료 — 추가 ${added.length}개 · 기존 보존 ${skipped.length}개`, 100);
  return { created, added, skipped };
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
