/**
 * build-patterns.ts — 저장해 둔 패턴 값(pattern-data.ts)을 Figma 에 그대로 재생한다.
 * ─────────────────────────────────────────────────────────────────────────
 * 이 파일은 '무엇을 그릴지' 정하지 않는다. 정하는 것은 pattern-data.ts(캡처본)이고,
 * 여기는 그 값을 Figma API 호출로 옮기는 재생기(player)일 뿐이다.
 *
 * 원칙
 *   · 부품은 **이름으로** 찾는다 — 노드 id 는 파일마다 다르므로 쓰지 않는다.
 *   · 색은 Semantic 변수 이름으로 바인딩한다 — hex 를 직접 칠하지 않는다(CLAUDE.md).
 *   · 부품 안쪽 문구는 '다른 것만' 덮어쓴다 — 같은 것은 부품 기본값을 그대로 둔다.
 *   · 못 찾은 것은 조용히 대충 그리지 않는다 — warnings 에 담아 그대로 보고한다.
 */

import type { PatternDef, PatternScreen, PNode, Override, SizeOverride } from "./pattern-data";

export interface PatternMaps {
  /** "color/bg/level-0" → Variable (Semantic + Foundation 색 통합 맵) */
  colorVars: Record<string, Variable>;
  /** "body/12R" → TextStyle */
  textStyles: Record<string, TextStyle>;
  /** "Button" → ComponentSetNode (설치된 컴포넌트 세트) */
  sets: Record<string, ComponentSetNode>;
}

export interface PatternBuildResult {
  sectionId: string;
  screenCount: number;
  warnings: string[];
}

/** 이미 로드한 폰트 — 같은 폰트를 반복해서 기다리지 않는다. */
const loadedFonts = new Set<string>();
async function loadFont(f: FontName): Promise<boolean> {
  const key = `${f.family}__${f.style}`;
  if (loadedFonts.has(key)) return true;
  try {
    await figma.loadFontAsync(f);
    loadedFonts.add(key);
    return true;
  } catch (e) {
    return false;
  }
}

/** 텍스트 노드를 고치기 전에 그 노드가 **지금 쓰고 있는** 폰트를 모두 로드한다.
 *  빈 텍스트는 구간(segment)이 없으므로 node.fontName 으로 되짚는다 —
 *  글자 스타일을 막 입힌 새 텍스트가 정확히 이 경우다(2026-09-02 실측 오류). */
async function loadFontsOf(node: TextNode): Promise<void> {
  const fonts: FontName[] = [];
  try {
    for (const s of node.getStyledTextSegments(["fontName"])) fonts.push(s.fontName as FontName);
  } catch (e) { /* 구간을 못 읽으면 아래 fontName 으로 되짚는다 */ }
  if (fonts.length === 0 && node.fontName !== figma.mixed) fonts.push(node.fontName as FontName);
  for (const f of fonts) await loadFont(f);
}

function bindFill(node: SceneNode, maps: PatternMaps, varName: string, warnings: string[]): void {
  const v = maps.colorVars[varName];
  if (!v) {
    warnings.push(`색 변수를 찾지 못했습니다: ${varName} (${node.name})`);
    return;
  }
  try {
    const base: SolidPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    const bound = figma.variables.setBoundVariableForPaint(base, "color", v);
    (node as GeometryMixin).fills = [bound];
  } catch (e) {
    warnings.push(`색 연결 실패: ${varName} (${node.name}) — ${(e as Error).message}`);
  }
}

function bindStroke(node: SceneNode, maps: PatternMaps, varName: string, warnings: string[]): void {
  const v = maps.colorVars[varName];
  if (!v) {
    warnings.push(`테두리 색 변수를 찾지 못했습니다: ${varName} (${node.name})`);
    return;
  }
  try {
    const base: SolidPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    const bound = figma.variables.setBoundVariableForPaint(base, "color", v);
    (node as GeometryMixin).strokes = [bound];
  } catch (e) {
    warnings.push(`테두리 색 연결 실패: ${varName} (${node.name}) — ${(e as Error).message}`);
  }
}

/** 인스턴스 안쪽 자식을 인덱스 경로로 찾는다. 경로가 끊기면 null. */
function childAt(root: SceneNode, path: string): SceneNode | null {
  let cur: SceneNode = root;
  for (const part of path.split(".")) {
    const i = Number(part);
    const kids = (cur as ChildrenMixin).children;
    if (!kids || !kids[i]) return null;
    cur = kids[i] as SceneNode;
  }
  return cur;
}

async function applyOverrides(inst: InstanceNode, ov: Override[], warnings: string[]): Promise<void> {
  for (const [path, value] of ov) {
    const target = childAt(inst, path);
    if (!target) {
      warnings.push(`덮어쓸 자리를 찾지 못했습니다: ${inst.name} / ${path}`);
      continue;
    }
    if (value === null) {
      target.visible = false;
      continue;
    }
    if (target.type !== "TEXT") {
      warnings.push(`글자 자리가 아닙니다: ${inst.name} / ${path} (${target.type})`);
      continue;
    }
    await loadFontsOf(target);
    try {
      target.characters = value;
    } catch (e) {
      warnings.push(`글자를 넣지 못했습니다: ${inst.name} / ${path} — ${(e as Error).message}`);
    }
  }
}

/** 인스턴스 안쪽 자식의 '늘림/줄임'을 바꾼다.
 *  부품 기본값이 좁아 글자가 접히는 자리를 정본과 같게 펴 주는 용도다. */
function applySizeOverrides(inst: InstanceNode, szOv: SizeOverride[], warnings: string[]): void {
  for (const entry of szOv) {
    const path = entry[0];
    const h = entry[1];
    const v = entry[2];
    const w = entry[3];
    const ht = entry[4];
    const target = childAt(inst, path);
    if (!target) {
      warnings.push(`크기를 바꿀 자리를 찾지 못했습니다: ${inst.name} / ${path}`);
      continue;
    }
    if (!("layoutSizingHorizontal" in target)) {
      warnings.push(`크기를 바꿀 수 없는 자리입니다: ${inst.name} / ${path} (${target.type})`);
      continue;
    }
    try {
      // 값을 먼저 맞추고 방식을 건다 — resize 가 늘림/줄임 방식을 FIXED 로 되돌리기 때문.
      if (w !== undefined || ht !== undefined) {
        target.resize(w === undefined ? target.width : w, ht === undefined ? target.height : ht);
      }
      target.layoutSizingHorizontal = h as any;
      target.layoutSizingVertical = v as any;
    } catch (e) {
      warnings.push(`크기 방식을 바꾸지 못했습니다: ${inst.name} / ${path} — ${(e as Error).message}`);
    }
  }
}

/** 세트 안에서 variant 조합이 맞는 변형을 고르고, 나머지 속성(BOOLEAN 등)은 인스턴스에 건다.
 *  외부 라이브러리 부품(아이콘 등)은 설치기가 만들지 않으므로 키로 불러온다. */
async function makeInstance(
  spec: PNode, maps: PatternMaps, warnings: string[],
): Promise<InstanceNode | null> {
  if (spec.remote && spec.key) {
    // 키는 그 '변형' 자체를 가리키므로 variant 를 따로 고를 필요가 없다.
    try {
      const comp = await figma.importComponentByKeyAsync(spec.key);
      return comp.createInstance();
    } catch (e) {
      warnings.push(`외부 부품을 불러오지 못했습니다: ${spec.n} — ${(e as Error).message}`);
      return null;
    }
  }
  const set = maps.sets[spec.set as string];
  if (!set) {
    warnings.push(`컴포넌트를 찾지 못했습니다: ${spec.set} (${spec.n})`);
    return null;
  }

  // 세트가 선언한 속성 정의에서 '이름 → 실제 키(#id 포함)' 와 타입을 얻는다.
  let defs: ComponentPropertyDefinitions = {} as ComponentPropertyDefinitions;
  try { defs = set.componentPropertyDefinitions; } catch (e) { /* 정의를 못 읽어도 variant 매칭은 가능 */ }
  const keyByName: Record<string, string> = {};
  const typeByName: Record<string, string> = {};
  for (const key of Object.keys(defs)) {
    const name = key.split("#")[0];
    keyByName[name] = key;
    typeByName[name] = (defs as any)[key].type;
  }

  const knownDefs = Object.keys(defs).length > 0;
  const pr = spec.pr || {};
  const variantWanted: Record<string, string> = {};
  const otherWanted: Record<string, string | boolean> = {};
  for (const name of Object.keys(pr)) {
    // 부품이 자라면서 없어진 축(예: Input 의 옛 Label)은 조용히 건너뛴다.
    // 저장본을 그때마다 손보지 않아도 나머지가 그대로 살아나게 하려는 것이며,
    // 무엇을 건너뛰었는지는 경고로 남겨 사람이 볼 수 있게 한다.
    if (knownDefs && !typeByName[name]) {
      warnings.push(`지금 부품에 없는 속성이라 건너뛰었습니다: ${spec.set} · ${name} (${spec.n})`);
      continue;
    }
    // 정의를 못 읽은 경우엔 문자열 = variant 로 본다(정본 세트는 모두 variant 가 문자열이다).
    const t = typeByName[name] || (typeof pr[name] === "string" ? "VARIANT" : "BOOLEAN");
    if (t === "VARIANT") variantWanted[name] = String(pr[name]);
    else otherWanted[keyByName[name] || name] = pr[name];
  }

  const comp = (set.children as ComponentNode[]).find((c) => {
    if (c.type !== "COMPONENT") return false;
    const vp = c.variantProperties || {};
    return Object.keys(variantWanted).every((k) => vp[k] === variantWanted[k]);
  });
  if (!comp) {
    const want = Object.keys(variantWanted).map((k) => `${k}=${variantWanted[k]}`).join(", ");
    warnings.push(`변형을 찾지 못했습니다: ${spec.set} (${want})`);
    return null;
  }

  const inst = comp.createInstance();
  if (Object.keys(otherWanted).length) {
    try { inst.setProperties(otherWanted); } catch (e) {
      warnings.push(`속성을 걸지 못했습니다: ${spec.n} — ${(e as Error).message}`);
    }
  }
  return inst;
}

async function makeText(spec: PNode, maps: PatternMaps, warnings: string[]): Promise<TextNode> {
  const t = figma.createText();
  const style = spec.ts ? maps.textStyles[spec.ts] : undefined;
  if (spec.ts && !style) warnings.push(`글자 스타일을 찾지 못했습니다: ${spec.ts} (${spec.n})`);

  // 순서가 중요하다: ①스타일 폰트 로드 → ②스타일 적용 → ③적용된 폰트 재로드 → ④글자·속성.
  // 스타일을 입히면 노드의 폰트가 그 스타일 것으로 바뀌므로, 그 폰트를 다시 로드하지 않으면
  // characters·textAutoResize 를 쓸 때 "unloaded font" 로 막힌다.
  const font: FontName = style ? (style.fontName as FontName) : { family: "Pretendard", style: "Regular" };
  const ok = await loadFont(font);
  if (!ok) warnings.push(`폰트를 불러오지 못했습니다: ${font.family} ${font.style} (${spec.n})`);
  if (style) {
    try { await t.setTextStyleIdAsync(style.id); } catch (e) {
      warnings.push(`글자 스타일을 적용하지 못했습니다: ${spec.ts} (${spec.n})`);
    }
  } else if (ok) {
    t.fontName = font;
  }
  await loadFontsOf(t);

  // 정렬·자동크기를 먼저 건다. 글자 넣기가 실패해도 이것들은 남아야 한다
  // (한 try 에 묶었다가 폰트 실패 때 정렬까지 통째로 빠지는 것을 2026-09-02 전수 대조에서 발견).
  try {
    if (spec.tar) t.textAutoResize = spec.tar;
    if (spec.ta) { t.textAlignHorizontal = spec.ta[0] as any; t.textAlignVertical = spec.ta[1] as any; }
  } catch (e) {
    warnings.push(`글자 정렬을 걸지 못했습니다: ${spec.n} — ${(e as Error).message}`);
  }
  try {
    if (spec.chars !== undefined) t.characters = spec.chars;
  } catch (e) {
    warnings.push(`글자를 넣지 못했습니다: ${spec.n} — ${(e as Error).message}`);
  }
  return t;
}

/** 노드 하나를 만들고 부모에 붙인다. 자식은 재귀로 이어 붙인다. */
async function renderNode(
  spec: PNode, parent: BaseNode & ChildrenMixin, parentAuto: boolean,
  maps: PatternMaps, warnings: string[],
): Promise<SceneNode | null> {
  let node: SceneNode | null = null;

  if (spec.t === "INST") node = await makeInstance(spec, maps, warnings);
  else if (spec.t === "TEXT") node = await makeText(spec, maps, warnings);
  else if (spec.t === "RECT") node = figma.createRectangle();
  else node = figma.createFrame();

  if (!node) return null;
  node.name = spec.n;
  parent.appendChild(node);

  if (spec.abs && "layoutPositioning" in node) node.layoutPositioning = "ABSOLUTE";

  // 오토레이아웃 설정은 크기보다 먼저 — resize 가 sizing mode 를 FIXED 로 되돌리기 때문.
  if (spec.al && node.type === "FRAME") {
    const [mode, gap, pt, pr, pb, pl, pri, ctr, pa, ca] = spec.al;
    node.layoutMode = mode;
    node.itemSpacing = gap;
    node.paddingTop = pt; node.paddingRight = pr; node.paddingBottom = pb; node.paddingLeft = pl;
    node.primaryAxisSizingMode = pri;
    node.counterAxisSizingMode = ctr;
    node.primaryAxisAlignItems = pa as any;
    node.counterAxisAlignItems = ca as any;
  }

  // 크기: HUG 축은 내용이 정하므로 건드리지 않는다.
  if (spec.w !== undefined && spec.h !== undefined && "resize" in node) {
    const hHug = spec.sz && spec.sz[0] === "HUG";
    const vHug = spec.sz && spec.sz[1] === "HUG";
    const w = hHug ? node.width : spec.w;
    const h = vHug ? node.height : spec.h;
    try { (node as LayoutMixin).resize(w, h); } catch (e) {
      warnings.push(`크기를 맞추지 못했습니다: ${spec.n} — ${(e as Error).message}`);
    }
  }

  if ((!parentAuto || spec.abs) && spec.x !== undefined && spec.y !== undefined) {
    node.x = spec.x; node.y = spec.y;
  }

  if (spec.sz && "layoutSizingHorizontal" in node && (parentAuto || spec.abs)) {
    try {
      if (!spec.abs) {
        node.layoutSizingHorizontal = spec.sz[0] as any;
        node.layoutSizingVertical = spec.sz[1] as any;
      }
    } catch (e) {
      warnings.push(`늘림/줄임 설정 실패: ${spec.n} — ${(e as Error).message}`);
    }
  }

  // 새로 만든 프레임은 Figma 기본이 clipsContent=true 다. 캡처본에 clip 이 없으면 '꺼짐'이 정답이므로
  // 값이 없을 때도 반드시 false 로 눌러 준다(인스턴스는 부품 소관이라 건드리지 않는다).
  // 2026-09-02 전수 대조에서 발견 — 비밀번호 화면 Content 가 잘림 켜진 채로 만들어졌다.
  if (node.type !== "INSTANCE" && "clipsContent" in node) node.clipsContent = spec.clip === true;
  if (spec.r !== undefined && "cornerRadius" in node) (node as RectangleNode).cornerRadius = spec.r;
  if (spec.fillVar) bindFill(node, maps, spec.fillVar, warnings);
  else if (spec.t === "FRAME") (node as FrameNode).fills = [];
  if (spec.strokeVar) {
    bindStroke(node, maps, spec.strokeVar, warnings);
    if (spec.strokeW !== undefined) (node as GeometryMixin).strokeWeight = spec.strokeW;
    if (spec.strokeAlign) (node as GeometryMixin).strokeAlign = spec.strokeAlign;
  }

  // 크기 방식 → 글자 순서. 폭이 정해진 뒤에 글자를 넣어야 줄바꿈이 정본과 같아진다.
  if (spec.t === "INST" && spec.szOv && spec.szOv.length) {
    applySizeOverrides(node as InstanceNode, spec.szOv, warnings);
  }
  if (spec.t === "INST" && spec.ov && spec.ov.length) {
    await applyOverrides(node as InstanceNode, spec.ov, warnings);
  }

  if (spec.c && "appendChild" in node) {
    const auto = spec.al !== undefined;
    for (const child of spec.c) {
      await renderNode(child, node as FrameNode, auto, maps, warnings);
    }
  }

  return node;
}

/** 이미 같은 이름의 섹션이 있으면 뒤에 번호를 붙인다 — 기존 작업을 덮지 않는다. */
function uniqueSectionName(page: PageNode, base: string): string {
  const used = new Set(page.children.map((c) => c.name));
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base} ${i}`)) i++;
  return `${base} ${i}`;
}

export async function buildPattern(
  def: PatternDef,
  page: PageNode,
  maps: PatternMaps,
  onProgress?: (done: number, total: number, label: string) => void,
): Promise<PatternBuildResult> {
  const warnings: string[] = [];

  const missing = def.requires.filter((name) => !maps.sets[name]);
  if (missing.length) {
    throw new Error(
      `이 패턴에 필요한 컴포넌트가 파일에 없습니다: ${missing.join(", ")}\n` +
      "먼저 '가이드설치' 탭에서 컴포넌트를 설치한 뒤 다시 시도해 주세요.",
    );
  }

  const section = figma.createSection();
  section.name = uniqueSectionName(page, def.section);
  page.appendChild(section);
  // 바탕색 — 화면 프레임(흰색)의 테두리가 보이게. 섹션도 색은 Semantic 변수로 연결한다.
  bindFill(section, maps, def.sectionFillVar || "color/bg/level-3", warnings);

  // 섹션 크기 = 화면 배치 범위 + 정본과 같은 여백(좌우/상하 80·100).
  let maxX = 0, maxY = 0;
  for (const s of def.screens) {
    if (s.x + 360 > maxX) maxX = s.x + 360;
    if (s.y + 780 > maxY) maxY = s.y + 780;
  }
  section.resizeWithoutConstraints(maxX + 80, maxY + 100);

  // 놓을 자리 — 페이지에 이미 있는 것들 **아래**로 내려놓는다.
  // (항상 200,200 에 놓는 바람에 두 번째 패턴이 첫 번째 위에 겹쳐 그려졌다 — river 지적 2026-09-02)
  // 세로 간격 220 은 정본 페이지의 로그인↔회원가입 섹션 간격과 같다.
  const GAP = 220;
  let top = 200;
  for (const other of page.children) {
    if (other.id === section.id) continue;
    const bottom = other.y + other.height + GAP;
    if (bottom > top) top = bottom;
  }
  section.x = 200;
  section.y = top;

  let done = 0;
  for (const screen of def.screens) {
    if (onProgress) onProgress(done, def.screens.length, screen.name);
    await renderScreen(screen, section, maps, warnings);
    done++;
  }
  if (onProgress) onProgress(done, def.screens.length, "");

  return { sectionId: section.id, screenCount: def.screens.length, warnings };
}

async function renderScreen(
  screen: PatternScreen, section: SectionNode, maps: PatternMaps, warnings: string[],
): Promise<void> {
  const frame = await renderNode(screen.root, section, false, maps, warnings);
  if (frame) { frame.x = screen.x; frame.y = screen.y; }
}
