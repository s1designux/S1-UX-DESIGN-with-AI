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
const GRID_PAD = 20;

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

interface DocOpts { modeId: string; dark: boolean; }

/**
 * 스펙 프레임 — pc_button(이미지1) 형태의 라벨 매트릭스.
 * 구조: 플랫폼(PC/Mobile) → 사이즈 소제목 → 상태(열) 헤더 → variant(행) 인스턴스.
 * opts.modeId 로 Light/Dark 모드를 명시 연결 → 같은 인스턴스가 모드대로 렌더.
 */
async function buildDocFrame(grid: GridCell[], maps: BuildMaps, originX: number, opts: DocOpts): Promise<FrameNode> {
  const PAD = 24, TITLE_H = 34,
        PLATFORM_GAP = 18, PLATFORM_TITLE_H = 24,
        SIZE_GAP = 14, SIZE_TITLE_H = 22, HEADER_H = 24, ROW_LABEL_W = 88;
  const gridLeft = PAD + ROW_LABEL_W;
  const W = PAD * 2 + ROW_LABEL_W + STATES.length * CELL_W;

  // 모드별 색 팔레트
  const bg: RGB = opts.dark ? { r: 0.075, g: 0.078, b: 0.094 } : { r: 1, g: 1, b: 1 };
  const titleColor: RGB = opts.dark ? { r: 0.95, g: 0.95, b: 0.96 } : { r: 0.07, g: 0.07, b: 0.09 };
  const platformColor: RGB = opts.dark ? { r: 0.9, g: 0.9, b: 0.92 } : { r: 0.13, g: 0.13, b: 0.13 };
  const sizeColor: RGB = opts.dark ? { r: 0.78, g: 0.8, b: 0.84 } : { r: 0.25, g: 0.27, b: 0.3 };
  const labelColor: RGB = opts.dark ? { r: 0.6, g: 0.62, b: 0.67 } : { r: 0.42, g: 0.45, b: 0.5 };

  const frame = figma.createFrame();
  frame.name = `Button — Spec ${opts.dark ? "Dark" : "Light"}`;
  frame.fills = [{ type: "SOLID", color: bg }];
  frame.cornerRadius = 8;
  frame.resize(W, 2400); // 임시 — 마지막에 실제 높이로 재조정
  frame.x = originX;
  frame.y = 0;

  let y = PAD;
  frame.appendChild(await makeLabel(`Button · ${opts.dark ? "Dark" : "Light"}`, 14, "Bold", PAD, y, 320, "LEFT", titleColor));
  y += TITLE_H;

  for (const plat of PLATFORMS) {
    y += PLATFORM_GAP;
    frame.appendChild(await makeLabel(plat.name, 13, "Bold", PAD, y, 200, "LEFT", platformColor));
    y += PLATFORM_TITLE_H;

    for (const size of plat.sizes) {
      // 사이즈 소제목
      y += SIZE_GAP;
      frame.appendChild(await makeLabel(size, 12, "Bold", PAD, y, 200, "LEFT", sizeColor));
      y += SIZE_TITLE_H;

      // 상태 컬럼 헤더 (사이즈마다 반복)
      for (let c = 0; c < STATES.length; c++) {
        frame.appendChild(await makeLabel(STATES[c], 12, "Medium", gridLeft + c * CELL_W, y, CELL_W, "CENTER", labelColor));
      }
      y += HEADER_H;

      // variant 행
      for (const variant of VARIANTS) {
        frame.appendChild(await makeLabel(VARIANT_LABEL[variant], 12, "Medium", PAD, y + CELL_H / 2 - 8, ROW_LABEL_W, "LEFT", labelColor));
        for (let c = 0; c < STATES.length; c++) {
          const cell = grid.find((g) => g.variant === variant && g.size === size && g.state === STATES[c]);
          if (!cell) continue;
          const inst = cell.comp.createInstance();
          frame.appendChild(inst);
          inst.x = gridLeft + c * CELL_W + (CELL_W - inst.width) / 2;
          inst.y = y + (CELL_H - inst.height) / 2;
          setMode(inst, maps, opts.modeId);
        }
        y += CELL_H;
      }
    }
  }

  y += PAD;
  frame.resize(W, y);
  setMode(frame, maps, opts.modeId);
  return frame;
}

export async function buildButtonSet(
  maps: BuildMaps,
  onProgress?: (step: string, pct: number) => void,
  pctFrom = 85,
  pctTo = 100
): Promise<ComponentSetNode> {
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

  // ── 컴포넌트 세트로 결합 + 깔끔한 그리드 배치 (12행 × 4열, wrap 제거) ──
  const set = figma.combineAsVariants(grid.map((g) => g.comp), figma.currentPage);
  set.name = "Button";
  for (const g of grid) {
    g.comp.x = GRID_PAD + g.col * CELL_W + (CELL_W - g.comp.width) / 2;
    g.comp.y = GRID_PAD + g.row * CELL_H + (CELL_H - g.comp.height) / 2;
  }
  const rows = VARIANTS.length * SIZES.length;
  set.resize(GRID_PAD * 2 + STATES.length * CELL_W, GRID_PAD * 2 + rows * CELL_H);
  set.x = 0;
  set.y = 0;
  setLightMode(set, maps); // 세트에도 Light 모드 연결 (변형 전체에 cascade)

  // ── 라벨 스펙 프레임 (Light + Dark 나란히) — 실패해도 세트는 보존 ──
  try {
    const light = await buildDocFrame(grid, maps, set.width + 80, { modeId: maps.semanticLightModeId, dark: false });
    const dark = await buildDocFrame(grid, maps, light.x + light.width + 40, { modeId: maps.semanticDarkModeId, dark: true });
    figma.viewport.scrollAndZoomIntoView([set, light, dark]);
  } catch (e) {
    console.warn("[SW Installer] Spec frame 생성 실패 (컴포넌트 세트는 정상):", e);
    figma.viewport.scrollAndZoomIntoView([set]);
  }

  return set;
}
