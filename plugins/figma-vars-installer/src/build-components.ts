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
  foundationNumber: Record<string, Variable>; // "spacing/16","spacing/8","radius/4","border-width/1"
  textStyles: Record<string, TextStyle>;      // "body/14M","body/16M" 등
  semanticColorCollectionId: string;          // Semantic Color V2 컬렉션 id (Appearance 모드 연결)
  semanticLightModeId: string;                // Light 모드 id
  semanticDarkModeId: string;                 // Dark 모드 id (다크 스펙 프레임용)
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
  { name: "PC", sizes: ["medium", "xsmall", "xxsmall"] },
  { name: "Mobile", sizes: ["large"] },
];

type SizeId = "medium" | "xsmall" | "xxsmall" | "large";
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
  medium:  { break: "PC",     height: 44, padPath: "spacing/16", textStyle: "body/14M", minWidth: 80 },
  xsmall:  { break: "PC",     height: 34, padPath: "spacing/8",  textStyle: "body/14M", minWidth: 64 },
  xxsmall: { break: "PC",     height: 28, padPath: "spacing/8",  textStyle: "body/14M", minWidth: 64 },
  large:   { break: "Mobile", height: 48, padPath: "spacing/16", textStyle: "body/16M", minWidth: 80 },
};

// 매트릭스 배치: 행 = Size(위→아래), 열 = State(좌→우)
const SIZES: SizeId[] = ["medium", "xsmall", "xxsmall", "large"];
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
        await emit.text(opts.colHeaders[col], gridLeft + col * opts.cellW, y, opts.cellW, "CENTER", c.label, 12, "Medium");
      }
      y += HEADER_H;
      for (let ri = 0; ri < opts.rowLabels.length; ri++) {
        await emit.text(opts.rowLabels[ri], PAD, y + opts.cellH / 2 - 8, opts.rowLabelW, "LEFT", c.label, 12, "Medium");
        for (let ci = 0; ci < opts.colHeaders.length; ci++) {
          const comp = opts.cellAt(plat.name, size, ri, ci);
          if (comp) emit.cell(comp, gridLeft + ci * opts.cellW + (opts.cellW - comp.width) / 2, y + (opts.cellH - comp.height) / 2);
        }
        y += opts.cellH;
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
    cell: (comp, x, y) => { const inst = comp.createInstance(); frame.appendChild(inst); inst.x = x; inst.y = y; setMode(inst, maps, modeId); },
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

/** 그룹형 Light + Dark 스펙 프레임 (lightX / darkX). 반환=최하단 Y. */
async function buildGroupedSpec(opts: GroupedSpecOpts, maps: BuildMaps): Promise<number> {
  const W = specWidth(opts.rowLabelW, opts.colHeaders.length, opts.cellW);
  let bottom = opts.originY;
  for (const dark of [false, true]) {
    const modeId = dark ? maps.semanticDarkModeId : maps.semanticLightModeId;
    const frame = figma.createFrame();
    frame.name = `${opts.title} — Spec ${dark ? "Dark" : "Light"}`;
    frame.fills = [{ type: "SOLID", color: specPalette(dark).bg }];
    frame.cornerRadius = 8;
    frame.resize(W, 2400);
    frame.x = dark ? opts.darkX : opts.lightX;
    frame.y = opts.originY;
    const H = await renderGrouped(opts, dark, frameEmit(frame, maps, modeId));
    frame.resize(W, H);
    setMode(frame, maps, modeId);
    bottom = Math.max(bottom, frame.y + H);
  }
  return bottom;
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

export async function buildButtonSet(
  maps: BuildMaps,
  onProgress?: (step: string, pct: number) => void,
  pctFrom = 85,
  pctTo = 100
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
  set.x = 0; set.y = 0;

  const opts: GroupedSpecOpts = {
    title: "Button",
    platforms: PLATFORMS,
    rowLabels: VARIANTS.map((v) => VARIANT_LABEL[v]),
    colHeaders: STATES,
    cellAt: (_p, size, ri, ci) =>
      grid.find((g) => g.variant === VARIANTS[ri] && g.size === size && g.state === STATES[ci])?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY: 0,
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

/** 체크 아이콘(코드 정본 SVG path) — stroke 를 변수에 바인딩. */
function makeCheckIcon(strokeVar: Variable): FrameNode {
  const svg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.9375 8L6.13252 11.375L13.0625 4.625" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const node = figma.createNodeFromSvg(svg);
  node.name = "check";
  const vec = node.findOne((n) => n.type === "VECTOR") as VectorNode | null;
  if (vec) vec.strokes = [boundPaint(strokeVar)];
  return node;
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
    await emit.text(opts.colHeaders[col], gridLeft + col * opts.cellW, y, opts.cellW, "CENTER", c.label, 11, "Medium");
  }
  y += HEADER_H;
  for (let r = 0; r < opts.rowLabels.length; r++) {
    if (opts.rowLabels[r]) await emit.text(opts.rowLabels[r], PAD, y + opts.cellH / 2 - 7, rowLabelW, "LEFT", c.label, 11, "Medium");
    for (let cc = 0; cc < opts.colHeaders.length; cc++) {
      const comp = opts.cellAt(r, cc);
      if (comp) emit.cell(comp, gridLeft + cc * opts.cellW + (opts.cellW - comp.width) / 2, y + (opts.cellH - comp.height) / 2);
    }
    y += opts.cellH;
  }
  return y + PAD;
}

/** 평면 Light + Dark 스펙 프레임 (lightX / darkX). 반환=최하단 Y. */
async function buildSpec(opts: SpecOpts, maps: BuildMaps): Promise<number> {
  const rowLabelW = opts.rowLabelW ?? 96;
  const W = specWidth(rowLabelW, opts.colHeaders.length, opts.cellW);
  let bottom = opts.originY;
  for (const dark of [false, true]) {
    const modeId = dark ? maps.semanticDarkModeId : maps.semanticLightModeId;
    const frame = figma.createFrame();
    frame.name = `${opts.title} — Spec ${dark ? "Dark" : "Light"}`;
    frame.fills = [{ type: "SOLID", color: specPalette(dark).bg }];
    frame.cornerRadius = 8;
    frame.resize(W, 1600);
    frame.x = dark ? opts.darkX : opts.lightX;
    frame.y = opts.originY;
    const H = await renderFlat(opts, dark, frameEmit(frame, maps, modeId));
    frame.resize(W, H);
    setMode(frame, maps, modeId);
    bottom = Math.max(bottom, frame.y + H);
  }
  return bottom;
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
      const icon = makeCheckIcon(scv(maps, s.check));
      comp.appendChild(icon);
      icon.x = 1; icon.y = 1;
    }
    setLightMode(comp, maps);
    comps.push(comp);
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Checkbox";
  set.x = 0; set.y = originY;
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
      knob.fills = [boundPaint(scv(maps, "color/control/indicator/selected"))];
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
async function buildInput(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
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
    { size: "XSMALL", brk: "PC",     h: 28, padL: 12, padR: 8,  font: 12, head: "XSMALL" },
    { size: "SMALL",  brk: "PC",     h: 34, padL: 12, padR: 8,  font: 14, head: "SMALL" },
    { size: "MEDIUM", brk: "PC",     h: 44, padL: 16, padR: 12, font: 14, head: "MEDIUM" },
    { size: "MEDIUM", brk: "Mobile", h: 48, padL: 16, padR: 12, font: 14, head: "MEDIUM·M" },
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
          field.appendChild(await makeBoundText(st.txt, sc.font, "Regular", scv(maps, fc(st.tc))));
          field.resize(200, sc.h); // Input 예외 — 넓은 필드
          const comp = figma.createComponent();
          comp.name = `Size=${sc.size}, State=${st.name}, Label=${lab}, Message=${msg}, Break=${sc.brk}`;
          comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO"; comp.itemSpacing = 6;
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
  // Input 은 규모가 커서(7 상태 × 4 사이즈 × 4 그룹) 세로 스택에서 분리, 버튼 우측편 넓은 시트로 배치.
  const OX = INPUT_SHEET_X;
  set.x = OX; set.y = originY;
  // 그룹핑 규칙: 모디파이어(라벨×메시지) 조합을 상위 그룹(밴드)으로, 그 안에서 사이즈별로 나열.
  // (사이즈별로 라벨/메시지가 번갈아 나오지 않게.) Input 은 예외적으로 필드·컬럼 폭을 넓게.
  const groups = [
    { name: "라벨 없음",              lab: "Off", msg: "Off" },
    { name: "라벨 없음 · 안내메시지", lab: "Off", msg: "On" },
    { name: "라벨 있음",              lab: "On",  msg: "Off" },
    { name: "라벨 있음 · 안내메시지", lab: "On",  msg: "On" },
  ];
  const sizeRows = [
    { label: "XSMALL",          size: "XSMALL", brk: "PC" },
    { label: "SMALL",           size: "SMALL",  brk: "PC" },
    { label: "MEDIUM",          size: "MEDIUM", brk: "PC" },
    { label: "MEDIUM · Mobile", size: "MEDIUM", brk: "Mobile" },
  ];
  const groupMap = new Map<string, { name: string; lab: string; msg: string }>();
  for (const g of groups) groupMap.set(g.name, g);
  const opts: GroupedSpecOpts = {
    title: "Input",
    platforms: groups.map((g) => ({ name: g.name, sizes: [""] })),
    rowLabels: sizeRows.map((r) => r.label),
    colHeaders: states.map((s) => s.name),
    cellAt: (groupName, _dummy, ri, ci) => {
      const g = groupMap.get(groupName);
      if (!g) return null;
      const r = sizeRows[ri];
      return cells.find((x) => x.size === r.size && x.brk === r.brk && x.state === states[ci].name && x.label === g.lab && x.message === g.msg)?.comp ?? null;
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
  const node = figma.createNodeFromSvg(svg);
  node.name = "icon";
  (node.findAll((n) => n.type === "VECTOR") as VectorNode[]).forEach((v) => { v.strokes = [boundPaint(strokeVar)]; v.fills = []; });
  return node;
}

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
    { size: "XSMALL", h: 28, font: 12, padL: 12, padR: 8 },
    { size: "SMALL",  h: 34, font: 14, padL: 12, padR: 8 },
    { size: "MEDIUM", h: 44, font: 14, padL: 16, padR: 12 },
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
      comp.appendChild(await makeBoundText(st.txt, sc.font, "Regular", scv(maps, fc(st.tc))));
      comp.appendChild(makeStrokeIcon(MAG, scv(maps, fc(st.icon))));
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
    comp.appendChild(await makeBoundText(st.txt, 14, "Regular", scv(maps, fc(st.tc))));
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
  const panelOpts = [
    { txt: "Hover",    bg: "color/dropdown/option/bg/hover",    label: "color/dropdown/option/label/hover" },
    { txt: "Selected", bg: "color/dropdown/option/bg/selected", label: "color/dropdown/option/label/selected" },
    { txt: "옵션",     bg: "color/dropdown/option/bg/default",  label: "color/dropdown/option/label/default" },
    { txt: "옵션",     bg: "color/dropdown/option/bg/default",  label: "color/dropdown/option/label/default" },
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
      trigger.appendChild(makeStrokeIcon((st.up ? chevUp : chevDown)("#000"), scv(maps, fc(st.icon))));
      trigger.resize(140, sc.h);

      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, State=${st.name}, Break=${sc.brk}`;
      comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO"; comp.itemSpacing = 8;
      comp.appendChild(trigger);
      if (st.name === "Open") {
        const panel = figma.createFrame();
        panel.name = "list";
        panel.layoutMode = "VERTICAL"; panel.counterAxisSizingMode = "FIXED"; panel.primaryAxisSizingMode = "FIXED";
        panel.paddingTop = 4; panel.paddingBottom = 4; panel.itemSpacing = 0; panel.cornerRadius = 4;
        panel.clipsContent = false;
        // 높이를 옵션 개수에 맞춰 명시 고정 (resize 가 sizing mode 를 FIXED 로 바꾸므로 AUTO 의존 금지)
        panel.resize(140, panelOpts.length * 32 + 8);
        panel.fills = [boundPaint(scv(maps, "color/dropdown/list/bg"))];
        panel.strokes = [boundPaint(scv(maps, "color/dropdown/list/border"))]; panel.strokeWeight = 1; panel.strokeAlign = "INSIDE";
        for (const o of panelOpts) {
          const row = figma.createFrame();
          row.name = "option";
          row.layoutMode = "HORIZONTAL"; row.counterAxisAlignItems = "CENTER";
          row.primaryAxisSizingMode = "FIXED"; row.counterAxisSizingMode = "FIXED";
          row.resize(140, 32); row.paddingLeft = 12; row.paddingRight = 12; row.paddingTop = 0; row.paddingBottom = 0;
          row.fills = [boundPaint(scv(maps, o.bg))];
          row.appendChild(await makeBoundText(o.txt, 14, "Regular", scv(maps, o.label)));
          panel.appendChild(row);
        }
        comp.appendChild(panel);
      }
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, size: sc.size, brk: sc.brk, state: st.name });
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Select Box";
  set.x = 0; set.y = originY;
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
async function buildDropdownList(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const dd = (k: string) => `color/dropdown/${k}`;
  const states = [
    { name: "Default",  bg: "option/bg/default",  label: "option/label/default" },
    { name: "Hover",    bg: "option/bg/hover",    label: "option/label/hover" },
    { name: "Selected", bg: "option/bg/selected", label: "option/label/selected" },
    { name: "Disabled", bg: "option/bg/disabled", label: "option/label/disabled" },
  ];
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; row: number; col: number }[] = [];
  for (let col = 0; col < states.length; col++) {
    const st = states[col];
    const comp = figma.createComponent();
    comp.name = `State=${st.name}`;
    comp.layoutMode = "HORIZONTAL"; comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
    comp.paddingLeft = 12; comp.paddingRight = 12; comp.paddingTop = 0; comp.paddingBottom = 0;
    comp.fills = [boundPaint(scv(maps, dd(st.bg)))];
    comp.appendChild(await makeBoundText("옵션", 14, "Regular", scv(maps, dd(st.label))));
    comp.resize(140, 36);
    setLightMode(comp, maps);
    comps.push(comp);
    cells.push({ comp, row: 0, col });
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Dropdown List";
  set.x = 0; set.y = originY;
  const opts: SpecOpts = {
    title: "Dropdown List",
    colHeaders: states.map((s) => s.name),
    rowLabels: [""],
    cellAt: (r, c) => cells.find((x) => x.row === r && x.col === c)?.comp ?? null,
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 160, cellH: 52,
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
  const sizes = [
    { size: "SM", brk: "PC",     h: 30, font: 14 },
    { size: "MD", brk: "PC",     h: 40, font: 16 },
    { size: "SM", brk: "Mobile", h: 30, font: 14 },
  ];
  const W = 76;
  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; size: string; brk: string; state: string }[] = [];
  for (const sc of sizes) {
    for (const st of states) {
      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, State=${st.name}, Break=${sc.brk}`;
      comp.resize(W, sc.h);
      comp.fills = [];
      const t = await makeBoundText("메뉴", sc.font, "Medium", scv(maps, nav(st.label)));
      comp.appendChild(t);
      t.x = (W - t.width) / 2; t.y = (sc.h - 2 - t.height) / 2;
      const ind = figma.createRectangle();
      ind.resize(W, 2);
      ind.fills = [boundPaint(scv(maps, nav(st.ind)))];
      comp.appendChild(ind);
      ind.x = 0; ind.y = sc.h - 2;
      setLightMode(comp, maps);
      comps.push(comp);
      cells.push({ comp, size: sc.size, brk: sc.brk, state: st.name });
    }
  }
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

// ── Table Cell — color/table/*(bg·border) + color/text/body/*(텍스트) ─────────
async function buildTableCell(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const variants = [
    { type: "Cell",   state: "Default",  bg: "color/table/cell/default",  border: "color/table/border/light",  text: "color/text/body/primary",   head: "Cell · Default" },
    { type: "Cell",   state: "Hover",    bg: "color/table/cell/hover",    border: "color/table/border/light",  text: "color/text/body/primary",   head: "Cell · Hover" },
    { type: "Cell",   state: "Selected", bg: "color/table/cell/selected", border: "color/table/border/light",  text: "color/text/body/primary",   head: "Cell · Selected" },
    { type: "Header", state: "Default",  bg: "color/table/header/bg",      border: "color/table/border/strong", text: "color/text/body/secondary", head: "Header" },
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

// ── Filter Chip (드롭다운 칩) — color/chip/{line,solid}/* + 드롭다운 패널 ────────
// 출처: components.html Filter Chip (5 states: Default·Hover·Selected·Complete·Disabled).
//  · 4 그룹 = Variant(Line/Solid) × Title(없음/있음). Selected = 드롭다운 펼침(패널 표출).
//  · Line: bg/border/label = chip/line/*. Solid: chip/solid/*. arrow = 같은 state 의 label 색에 정합.
//  · Complete = 값 선택됨(과거순). Title 있는 Line 은 값 라벨이 selected(파랑).
async function buildFilterChip(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  // 우향 chevron (components.html 원본 path) — Selected(open) 시 270°(아래) 회전 표현은 정적 스펙이라 아래방향 SVG 사용
  const arrowRight = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="#000" stroke-width="2" stroke-linecap="square"/></svg>`;
  const arrowDown = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#000" stroke-width="2" stroke-linecap="square"/></svg>`;
  const variants = ["Line", "Solid"];
  const titles = [
    { key: "Off", name: "Label only" },
    { key: "On",  name: "With title" },
  ];
  const states = ["Default", "Hover", "Selected", "Complete", "Disabled"];

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
    // solid — Hover 보더는 default 유지(정본 Chip·line variant 와 일치, chip/solid/border/hover 미정의)
    switch (st) {
      case "Hover":    return { bg: "hover",    bd: "default",  lb: "default",  open: false };
      case "Selected": return { bg: "selected", bd: "selected", lb: "selected", open: true };
      case "Disabled": return { bg: "disabled", bd: "disabled", lb: "disabled", open: false };
      default:         return { bg: "default",  bd: "default",  lb: "default",  open: false };
    }
  }

  const comps: ComponentNode[] = [];
  const cells: { comp: ComponentNode; variant: string; title: string; state: string }[] = [];
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
        chip.itemSpacing = 4; chip.paddingLeft = 16; chip.paddingRight = 8; chip.cornerRadius = 999;
        chip.fills = [boundPaint(scv(maps, `color/chip/${v}/bg/${ss.bg}`))];
        chip.strokes = [boundPaint(scv(maps, `color/chip/${v}/border/${ss.bd}`))];
        chip.strokeWeight = 1; chip.strokeAlign = "INSIDE";
        // Title(있음) → "정렬" 라벨(타이틀색) + 값 라벨
        if (t.key === "On") {
          chip.appendChild(await makeBoundText("정렬", 14, "Medium", scv(maps, `color/chip/${v}/label/${ss.lb}`)));
        }
        // 값 라벨: Complete = 과거순(선택값), 그 외 = 최신순.
        // Title 있는 Line 의 값 라벨은 selected(파랑) — disabled 제외. 그 외는 ss.lb.
        const valLbSlot = (t.key === "On" && v === "line" && !dis) ? "selected" : ss.lb;
        const valText = st === "Complete" ? "과거순" : "최신순";
        chip.appendChild(await makeBoundText(valText, 14, "Medium", scv(maps, `color/chip/${v}/label/${valLbSlot}`)));
        // arrow: 펼침이면 아래방향, 아니면 우향. 색 = 라벨색 정합(default/disabled/selected).
        const arrowSlot = ss.lb;
        chip.appendChild(makeStrokeIcon((ss.open ? arrowDown : arrowRight), scv(maps, `color/chip/${v}/label/${arrowSlot}`)));
        chip.resize(chip.width, 36); // chip-height-lg (PC 기본 36)

        // 컴포넌트(세로): chip + (Selected 면 드롭다운 패널)
        const comp = figma.createComponent();
        comp.name = `Variant=${variant}, Title=${t.key}, State=${st}`;
        comp.layoutMode = "VERTICAL"; comp.primaryAxisSizingMode = "AUTO"; comp.counterAxisSizingMode = "AUTO"; comp.itemSpacing = 8;
        comp.appendChild(chip);
        if (ss.open) {
          const panel = figma.createFrame();
          panel.name = "list";
          panel.layoutMode = "VERTICAL"; panel.primaryAxisSizingMode = "FIXED"; panel.counterAxisSizingMode = "FIXED";
          panel.paddingTop = 4; panel.paddingBottom = 4; panel.itemSpacing = 0; panel.cornerRadius = 4;
          panel.resize(130, 3 * 32 + 8);
          panel.fills = [boundPaint(scv(maps, "color/dropdown/list/bg"))];
          panel.strokes = [boundPaint(scv(maps, "color/dropdown/list/border"))]; panel.strokeWeight = 1; panel.strokeAlign = "INSIDE";
          const opts = [
            { txt: "최신순", bg: "selected", lb: "selected" },
            { txt: "과거순", bg: "default",  lb: "default" },
            { txt: "인기순", bg: "default",  lb: "default" },
          ];
          for (const o of opts) {
            const row = figma.createFrame();
            row.name = "option";
            row.layoutMode = "HORIZONTAL"; row.counterAxisAlignItems = "CENTER";
            row.primaryAxisSizingMode = "FIXED"; row.counterAxisSizingMode = "FIXED";
            row.resize(130, 32); row.paddingLeft = 12; row.paddingRight = 12;
            row.fills = [boundPaint(scv(maps, `color/dropdown/option/bg/${o.bg}`))];
            row.appendChild(await makeBoundText(o.txt, 14, "Regular", scv(maps, `color/dropdown/option/label/${o.lb}`)));
            panel.appendChild(row);
          }
          comp.appendChild(panel);
        }
        setLightMode(comp, maps);
        comps.push(comp);
        cells.push({ comp, variant, title: t.key, state: st });
      }
    }
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Filter Chip";
  set.x = 0; set.y = originY;
  // 그룹핑: 모디파이어(Variant×Title) 조합을 밴드로, 그 안에서 사이즈(단일)를 행으로.
  const groups = [
    { name: "Line · Label only",  variant: "Line",  title: "Off" },
    { name: "Line · With title",  variant: "Line",  title: "On" },
    { name: "Solid · Label only", variant: "Solid", title: "Off" },
    { name: "Solid · With title", variant: "Solid", title: "On" },
  ];
  const groupMap = new Map<string, { variant: string; title: string }>();
  for (const g of groups) groupMap.set(g.name, g);
  const opts: GroupedSpecOpts = {
    title: "Filter Chip",
    platforms: groups.map((g) => ({ name: g.name, sizes: [""] })),
    rowLabels: [""],
    colHeaders: states,
    cellAt: (groupName, _size, _ri, ci) => {
      const g = groupMap.get(groupName);
      if (!g) return null;
      return cells.find((x) => x.variant === g.variant && x.title === g.title && x.state === states[ci])?.comp ?? null;
    },
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 150, cellH: 150, rowLabelW: 16,
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
      const comp = figma.createComponent();
      comp.name = `Size=${sc.size}, State=${st.name}, Break=${sc.brk}`;
      comp.layoutMode = "HORIZONTAL";
      comp.primaryAxisAlignItems = "SPACE_BETWEEN";
      comp.counterAxisAlignItems = "CENTER";
      comp.primaryAxisSizingMode = "FIXED"; comp.counterAxisSizingMode = "FIXED";
      comp.paddingLeft = sc.padL; comp.paddingRight = sc.padR; comp.paddingTop = 0; comp.paddingBottom = 0;
      comp.itemSpacing = 8; comp.cornerRadius = 4;
      comp.fills = [boundPaint(scv(maps, fc(st.bg)))];
      comp.strokes = [boundPaint(scv(maps, fc(st.border)))];
      comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
      comp.appendChild(await makeBoundText(st.txt, sc.font, "Regular", scv(maps, fc(st.tc))));
      comp.appendChild(makeStrokeIcon(CLOCK, scv(maps, fc(st.icon))));
      comp.resize(150, sc.h);
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
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 168, cellH: 60, rowLabelW: 16,
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
const TPC_W = 77, TPC_H = 30;
async function buildTimePickerCell(maps: BuildMaps): Promise<{ set: ComponentSetNode; variants: Record<string, ComponentNode> }> {
  const opt = (k: string) => `color/dropdown/option/${k}`;
  const states = [
    { name: "Default",  bg: "bg/default",  bd: "border/default",  lb: "label/default" },
    { name: "Hover",    bg: "bg/hover",    bd: "border/hover",    lb: "label/hover" },
    { name: "Selected", bg: "bg/selected", bd: "border/selected", lb: "label/selected" },
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
    comp.strokes = [boundPaint(scv(maps, opt(st.bd)))]; comp.strokeWeight = 1; comp.strokeAlign = "INSIDE";
    comp.appendChild(await makeBoundText("00", 14, "Regular", scv(maps, opt(st.lb))));
    setLightMode(comp, maps);
    comps.push(comp); variants[st.name] = comp;
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Time Picker Cell";
  return { set, variants };
}

// ── Time Picker Dropdown (패널) — Time Picker Cell 인스턴스로 조립 ─────────────
// Figma 정본: pc_timepicker_input_dropdown(540:3506) — Type=24h(시·분 2컬럼) / Type=12h(오전오후·시·분 3컬럼).
//   셀=Time Picker Cell 인스턴스(컴포넌트→인스턴스 구조). 컬럼 93폭, 행 7개(클립 190), 셀 77×30 가운데.
//   확인 푸터(Option 40px) 우측정렬 — 분 선택 전 disabled, 선택 후 accent.
//   메인 세트는 Type=24h/12h 만(변형 폭증 방지). 상태값은 아래 별도 States 스펙 시트로 정리.
const TPD_COL_W = 93, TPD_ROW_H = 30, TPD_COLS_H = 190, TPD_FOOTER_H = 40, TPD_PAD_TOP = 12;
const TPD_PANEL_H = TPD_PAD_TOP + TPD_COLS_H + TPD_FOOTER_H; // 242
interface TpdColSpec { items: string[]; selIdx: number; hoverIdx: number; }
async function buildTimePickerDropdown(maps: BuildMaps, originY: number): Promise<{ set: ComponentSetNode; bottomY: number }> {
  const cell = await buildTimePickerCell(maps);

  // 한 컬럼: 93폭, list/bg, 행마다 셀 인스턴스(상태별 변형) 가운데. 텍스트만 인스턴스 오버라이드.
  async function makeCol(items: string[], selIdx: number, hoverIdx: number): Promise<FrameNode> {
    const col = figma.createFrame();
    col.name = "col";
    col.layoutMode = "VERTICAL"; col.primaryAxisSizingMode = "FIXED"; col.counterAxisSizingMode = "FIXED";
    col.itemSpacing = 0; col.clipsContent = true;
    col.fills = [boundPaint(scv(maps, "color/dropdown/list/bg"))];
    col.resize(TPD_COL_W, TPD_COLS_H);
    for (let i = 0; i < items.length; i++) {
      const row = figma.createFrame();
      row.name = "row";
      row.layoutMode = "HORIZONTAL"; row.primaryAxisAlignItems = "CENTER"; row.counterAxisAlignItems = "CENTER";
      row.primaryAxisSizingMode = "FIXED"; row.counterAxisSizingMode = "FIXED";
      row.resize(TPD_COL_W, TPD_ROW_H); row.fills = [];
      const state = i === selIdx ? "Selected" : i === hoverIdx ? "Hover" : "Default";
      const inst = cell.variants[state].createInstance(); // ← 셀 컴포넌트 인스턴스
      const txt = inst.findOne((n) => n.type === "TEXT") as TextNode | null;
      if (txt) { await figma.loadFontAsync(txt.fontName as FontName); txt.characters = items[i]; }
      row.appendChild(inst);
      col.appendChild(row);
    }
    return col;
  }

  // 패널 노드(컴포넌트 또는 프레임)에 cols + footer 를 채운다.
  async function fillPanel(node: FrameNode | ComponentNode, cols: TpdColSpec[], confirmActive: boolean): Promise<void> {
    const panelW = cols.length * TPD_COL_W; // 24h=186, 12h=279
    node.layoutMode = "VERTICAL"; node.counterAxisAlignItems = "CENTER";
    node.primaryAxisSizingMode = "FIXED"; node.counterAxisSizingMode = "FIXED";
    node.itemSpacing = 0; node.paddingTop = TPD_PAD_TOP; node.paddingBottom = 0; node.cornerRadius = 4;
    node.clipsContent = true;
    node.fills = [boundPaint(scv(maps, "color/dropdown/list/bg"))];
    node.strokes = [boundPaint(scv(maps, "color/dropdown/list/border"))]; node.strokeWeight = 1; node.strokeAlign = "INSIDE";
    node.resize(panelW, TPD_PANEL_H);
    const colsFrame = figma.createFrame();
    colsFrame.name = "cols";
    colsFrame.layoutMode = "HORIZONTAL"; colsFrame.counterAxisAlignItems = "MIN";
    colsFrame.primaryAxisSizingMode = "FIXED"; colsFrame.counterAxisSizingMode = "FIXED";
    colsFrame.itemSpacing = 0; colsFrame.fills = []; colsFrame.resize(panelW, TPD_COLS_H);
    for (const cs of cols) colsFrame.appendChild(await makeCol(cs.items, cs.selIdx, cs.hoverIdx));
    node.appendChild(colsFrame);
    const footer = figma.createFrame();
    footer.name = "Option";
    footer.layoutMode = "HORIZONTAL"; footer.primaryAxisAlignItems = "MAX"; footer.counterAxisAlignItems = "CENTER";
    footer.primaryAxisSizingMode = "FIXED"; footer.counterAxisSizingMode = "FIXED";
    footer.resize(panelW, TPD_FOOTER_H); footer.paddingLeft = 16; footer.paddingRight = 16; footer.fills = [];
    // 확인: 분 선택 전 disabled, 선택 후 accent (활성)
    footer.appendChild(await makeBoundText("확인", 14, "Medium", scv(maps, confirmActive ? "color/text/state/accent" : "color/text/state/disabled")));
    node.appendChild(footer);
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

  // 1) 메인 세트 — Type=24h/12h (기본 표기: 시 선택 + 확인 활성)
  const comps: ComponentNode[] = [];
  for (const type of ["24h", "12h"]) {
    const panel = figma.createComponent();
    panel.name = `Type=${type}`;
    await fillPanel(panel, colsOf(type, { ampm: type === "12h" ? 0 : undefined, hSel: 0, mSel: 0 }), true);
    setLightMode(panel, maps);
    comps.push(panel);
  }
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name = "Time Picker Dropdown";
  set.x = 0; set.y = originY;
  const opts: SpecOpts = {
    title: "Time Picker Dropdown",
    colHeaders: ["24h", "12h"],
    rowLabels: [""],
    cellAt: (_r, c) => comps[c],
    lightX: SPEC_LIGHT_X, darkX: SPEC_DARK_X, originY, cellW: 300, cellH: 270, rowLabelW: 16,
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

  // 3) 별도 States 스펙 시트 — 12h/24h × (시Hover · 시Selected · 분Hover · 분Selected[확인 활성])
  const statesStates = [
    { label: "시 Hover",              cfg: { hHov: 1 },                       confirm: false },
    { label: "시 Selected",           cfg: { hSel: 2 },                       confirm: false },
    { label: "분 Hover",              cfg: { hSel: 2, mHov: 3 },              confirm: false },
    { label: "분 Selected (확인 활성)", cfg: { hSel: 2, mSel: 3 },              confirm: true },
  ];
  const sheetTop = bottomY + 80;
  const COL_24_W = 2 * TPD_COL_W, COL_12_W = 3 * TPD_COL_W; // 186 / 279
  const LABEL_W = 150, GAP = 40, PAD = 24, TITLE_H = 30, HDR_H = 24, ROW_GAP = 34;
  const SHEET_W = PAD * 2 + LABEL_W + COL_24_W + GAP + COL_12_W;
  for (const dark of [false, true]) {
    const c = specPalette(dark);
    const frame = figma.createFrame();
    frame.name = `Time Picker Dropdown States — Spec ${dark ? "Dark" : "Light"}`;
    frame.fills = [{ type: "SOLID", color: c.bg }];
    frame.cornerRadius = 8;
    frame.x = dark ? SPEC_DARK_X : SPEC_LIGHT_X;
    frame.y = sheetTop;
    let y = PAD;
    frame.appendChild(await makeLabel(`Time Picker Dropdown · States · ${dark ? "Dark" : "Light"}`, 14, "Bold", PAD, y, 420, "LEFT", c.title));
    y += TITLE_H;
    const x24 = PAD + LABEL_W, x12 = x24 + COL_24_W + GAP;
    frame.appendChild(await makeLabel("Type=24h", 12, "Medium", x24, y, COL_24_W, "CENTER", c.label));
    frame.appendChild(await makeLabel("Type=12h", 12, "Medium", x12, y, COL_12_W, "CENTER", c.label));
    y += HDR_H + 8;
    for (const st of statesStates) {
      frame.appendChild(await makeLabel(st.label, 12, "Bold", PAD, y + 12, LABEL_W, "LEFT", c.size));
      const p24 = figma.createFrame(); frame.appendChild(p24);
      await fillPanel(p24, colsOf("24h", st.cfg), st.confirm); p24.x = x24; p24.y = y;
      const p12 = figma.createFrame(); frame.appendChild(p12);
      await fillPanel(p12, colsOf("12h", st.cfg), st.confirm); p12.x = x12; p12.y = y;
      y += TPD_PANEL_H + ROW_GAP;
    }
    frame.resize(SHEET_W, y - ROW_GAP + PAD);
    if (dark) setMode(frame, maps, maps.semanticDarkModeId); else setLightMode(frame, maps);
    bottomY = Math.max(bottomY, frame.y + frame.height);
  }

  return { set, bottomY };
}

// ── 멀티 컴포넌트 오케스트레이터 ──────────────────────────────────────────────
// Button(상단) + 나머지 컴포넌트를 세로로 스택 배치. 반환=총 variant 수.
export async function buildAllComponents(
  maps: BuildMaps,
  onProgress?: (step: string, pct: number) => void
): Promise<number> {
  let count = 0;

  const btn = await buildButtonSet(maps, onProgress, 92, 97);
  count += btn.set.children.length;

  // Input 은 규모가 커서 세로 스택에서 제외, 버튼 우측편(INPUT_SHEET_X) 넓은 시트로 상단 정렬 배치.
  const input = await buildInput(maps, 0);
  count += input.set.children.length;

  // 나머지 컴포넌트를 세로로 스택 (각 빌더가 set+스펙 포함 최하단 Y 반환 → 충돌 방지)
  const builders: ((m: BuildMaps, y: number) => Promise<{ set: ComponentSetNode; bottomY: number }>)[] = [
    buildCheckbox, buildRadio, buildToggle, buildChip, buildFilterChip, buildSearch, buildTextarea, buildSelect, buildDropdownList, buildLineTab, buildTableCell, buildTimePicker, buildTimePickerDropdown,
  ];
  const names = ["Checkbox", "Radio", "Toggle", "Chip", "Filter Chip", "Search Input", "Text Area", "Select Box", "Dropdown List", "Line Tab", "Table Cell", "Time Picker", "Time Picker Dropdown"];
  let y = btn.bottomY + 140;
  for (let i = 0; i < builders.length; i++) {
    if (onProgress) onProgress(`${names[i]} 생성 중…`, 97 + Math.round(((i + 1) / builders.length) * 3));
    const res = await builders[i](maps, y);
    count += res.set.children.length;
    y = res.bottomY + 140;
  }
  return count;
}
