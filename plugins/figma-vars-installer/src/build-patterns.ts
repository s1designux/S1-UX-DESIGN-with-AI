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

import type { PatternDef, PatternScreen, PatternComponent, PNode, Override, SizeOverride, NestedProps } from "./pattern-data";
import { sweepRawPaints } from "./build-components";

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

/** 한 번의 패턴 재생 동안 함께 들고 다니는 것.
 *  locals = 이 재생에서 먼저 만든 패턴 전용 부품(이름 → COMPONENT).
 *  owner  = 지금 그리고 있는 패턴 부품(SLOT 은 이 부품의 속성으로 만들어진다). */
interface RenderCtx {
  locals: Record<string, ComponentNode>;
  owner?: ComponentNode;
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

/** 이름('#id' 를 뗀 것) → 실제 속성 키로 바꿔 인스턴스에 건다. 없는 이름은 경고만 남기고 건너뛴다. */
function setPropsByName(
  inst: InstanceNode, props: Record<string, string | boolean>, where: string, warnings: string[],
): void {
  let keys: string[] = [];
  try { keys = Object.keys(inst.componentProperties); } catch (e) { /* 못 읽으면 아래에서 전부 경고 */ }
  const out: Record<string, string | boolean> = {};
  for (const name of Object.keys(props)) {
    const key = keys.find((k) => k.split("#")[0] === name);
    if (!key) {
      warnings.push(`지금 부품에 없는 속성이라 건너뛰었습니다: ${where} · ${name}`);
      continue;
    }
    out[key] = props[name];
  }
  if (Object.keys(out).length === 0) return;
  try { inst.setProperties(out); } catch (e) {
    warnings.push(`속성을 걸지 못했습니다: ${where} — ${(e as Error).message}`);
  }
}

/** 인스턴스 안쪽 '중첩 인스턴스'의 속성(variant·BOOLEAN)을 바꾼다.
 *  예) 패턴 부품 안 Input 을 화면마다 Error·Message=On 으로. */
function applyNestedProps(inst: InstanceNode, list: NestedProps[], warnings: string[]): void {
  for (const [path, props] of list) {
    const target = childAt(inst, path);
    if (!target) {
      warnings.push(`속성을 바꿀 자리를 찾지 못했습니다: ${inst.name} / ${path}`);
      continue;
    }
    if (target.type !== "INSTANCE") {
      warnings.push(`부품 자리가 아닙니다: ${inst.name} / ${path} (${target.type})`);
      continue;
    }
    setPropsByName(target, props, `${inst.name} / ${path}`, warnings);
  }
}

/** 패턴 부품 안에 진짜 슬롯을 만든다(설치기 build-components.ts 의 makeSlot 과 같은 배선).
 *  createSlot() 이 부품에 SLOT 속성을 함께 만들고, finishSlot 이 그 속성의 이름·설명을 붙인다.
 *  폴백 없음 — 슬롯이 안 생기면 겉모습만 같은 프레임으로 대신하지 않고 경고를 남긴 뒤 멈춘다. */
function startSlot(spec: PNode, ctx: RenderCtx, warnings: string[]): { node: SceneNode; before: Set<string> } {
  const owner = ctx.owner;
  if (!owner) {
    warnings.push(`슬롯은 패턴 부품 안에서만 만들 수 있습니다: ${spec.n}`);
    throw new Error(`[패턴 슬롯] ${spec.n} — 패턴 부품 밖의 슬롯이라 만들지 않고 멈춥니다.`);
  }
  if (typeof (owner as any).createSlot !== "function") {
    warnings.push(`이 Figma 에서는 슬롯을 만들 수 없습니다: ${owner.name} / ${spec.n}`);
    throw new Error(`[패턴 슬롯] ${owner.name} / ${spec.n} — 슬롯을 만들 수 없어 멈춥니다(겉모습만 같은 프레임으로 대신하지 않음).`);
  }
  const before = new Set(Object.entries(owner.componentPropertyDefinitions || {})
    .filter(([, d]) => d.type === "SLOT").map(([n]) => n));
  const slot = owner.createSlot() as unknown as SceneNode;
  return { node: slot, before };
}

function finishSlot(spec: PNode, ctx: RenderCtx, before: Set<string>, warnings: string[]): void {
  const owner = ctx.owner as ComponentNode;
  const defs = Object.entries(owner.componentPropertyDefinitions || {});
  const added = defs.find(([n, d]) => d.type === "SLOT" && !before.has(n));
  if (!added) {
    warnings.push(`슬롯 속성이 만들어지지 않았습니다: ${owner.name} / ${spec.n}`);
    throw new Error(`[패턴 슬롯] ${owner.name} / ${spec.n} — 슬롯 속성을 찾지 못해 멈춥니다.`);
  }
  owner.editComponentProperty(added[0], { name: spec.n, description: spec.desc || "", preferredValues: [] });
}

/** 세트 안에서 variant 조합이 맞는 변형을 고르고, 나머지 속성(BOOLEAN 등)은 인스턴스에 건다.
 *  외부 라이브러리 부품(아이콘 등)은 설치기가 만들지 않으므로 키로 불러온다. */
async function makeInstance(
  spec: PNode, maps: PatternMaps, warnings: string[], ctx: RenderCtx,
): Promise<InstanceNode | null> {
  if (spec.local) {
    // 패턴 전용 부품 — 같은 재생에서 화면보다 먼저 만들어 둔 것을 쓴다.
    const comp = ctx.locals[spec.local];
    if (!comp) {
      warnings.push(`패턴 부품을 찾지 못했습니다: ${spec.local} (${spec.n})`);
      return null;
    }
    const inst = comp.createInstance();
    if (spec.pr && Object.keys(spec.pr).length) setPropsByName(inst, spec.pr, spec.n, warnings);
    return inst;
  }
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
  maps: PatternMaps, warnings: string[], ctx: RenderCtx = { locals: {} },
): Promise<SceneNode | null> {
  let node: SceneNode | null = null;
  let slotBefore: Set<string> | null = null;

  if (spec.t === "INST") node = await makeInstance(spec, maps, warnings, ctx);
  else if (spec.t === "TEXT") node = await makeText(spec, maps, warnings);
  else if (spec.t === "RECT") node = figma.createRectangle();
  else if (spec.t === "COMP") {
    const comp = figma.createComponent();
    ctx = { locals: ctx.locals, owner: comp };
    node = comp;
  } else if (spec.t === "SLOT") {
    const made = startSlot(spec, ctx, warnings);
    node = made.node;
    slotBefore = made.before;
  } else node = figma.createFrame();

  if (!node) return null;
  node.name = spec.n;
  parent.appendChild(node);
  if (spec.t === "COMP" && spec.desc) (node as ComponentNode).description = spec.desc;

  if (spec.abs && "layoutPositioning" in node) node.layoutPositioning = "ABSOLUTE";

  // 오토레이아웃 설정은 크기보다 먼저 — resize 가 sizing mode 를 FIXED 로 되돌리기 때문.
  if (spec.al && (node.type === "FRAME" || node.type === "COMPONENT" || (node.type as string) === "SLOT")) {
    const n = node as FrameNode;
    const [mode, gap, pt, pr, pb, pl, pri, ctr, pa, ca] = spec.al;
    n.layoutMode = mode;
    n.itemSpacing = gap;
    n.paddingTop = pt; n.paddingRight = pr; n.paddingBottom = pb; n.paddingLeft = pl;
    n.primaryAxisSizingMode = pri;
    n.counterAxisSizingMode = ctr;
    n.primaryAxisAlignItems = pa as any;
    n.counterAxisAlignItems = ca as any;
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
    // resize 는 오토레이아웃의 '내용에 맞춤(AUTO)'을 FIXED 로 되돌린다. 부모가 오토레이아웃이면 아래
    // 늘림/줄임(sz) 설정이 되살리지만, 섹션에 바로 놓인 것(패턴 부품 루트 등)은 되살릴 길이 없어 여기서 다시 건다.
    // (2026-10-02 재생 대조에서 발견 — PC Login Box 높이가 HUG 가 아니라 272 고정으로 남았다)
    const resetBySz = parentAuto && !spec.abs && spec.sz !== undefined;
    if (spec.al && !resetBySz && (spec.al[6] === "AUTO" || spec.al[7] === "AUTO") && "primaryAxisSizingMode" in node) {
      (node as FrameNode).primaryAxisSizingMode = spec.al[6];
      (node as FrameNode).counterAxisSizingMode = spec.al[7];
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
  // 색을 정해 주지 않은 자리는 **Figma 기본색(프레임 흰색·사각형 회색)을 남기지 않는다.**
  //   남기면 부품이 아닌 요소가 검수기에 "hex 직접 사용"으로 걸린다(river 지적 2026-09-21).
  else if (spec.t === "FRAME" || spec.t === "RECT" || spec.t === "COMP" || spec.t === "SLOT") (node as GeometryMixin).fills = [];
  else if (spec.t === "TEXT") warnings.push(`글자색이 토큰에 연결되지 않았습니다: ${spec.n}`);
  if (spec.strokeVar) {
    bindStroke(node, maps, spec.strokeVar, warnings);
    if (spec.strokeW !== undefined) (node as GeometryMixin).strokeWeight = spec.strokeW;
    if (spec.strokeAlign) (node as GeometryMixin).strokeAlign = spec.strokeAlign;
  }

  // 중첩 속성 → 크기 방식 → 글자 순서.
  //   중첩 인스턴스의 변형이 바뀌면 그 안쪽 자식이 바뀌므로 속성을 가장 먼저 건다.
  //   폭이 정해진 뒤에 글자를 넣어야 줄바꿈이 정본과 같아진다.
  if (spec.t === "INST" && spec.nestedPr && spec.nestedPr.length) {
    applyNestedProps(node as InstanceNode, spec.nestedPr, warnings);
  }
  if (spec.t === "INST" && spec.szOv && spec.szOv.length) {
    applySizeOverrides(node as InstanceNode, spec.szOv, warnings);
  }
  if (spec.t === "INST" && spec.ov && spec.ov.length) {
    await applyOverrides(node as InstanceNode, spec.ov, warnings);
  }

  if (spec.c && "appendChild" in node) {
    const auto = spec.al !== undefined;
    for (const child of spec.c) {
      await renderNode(child, node as FrameNode, auto, maps, warnings, ctx);
    }
  }
  if (spec.t === "SLOT" && slotBefore) finishSlot(spec, ctx, slotBefore, warnings);

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
  const sectionVar = def.sectionFillVar || "color/bg/level-3";
  bindFill(section, maps, sectionVar, warnings);
  // **연결이 실제로 걸렸는지 확인한다.** 걸리지 않았다면 raw 색을 남기지 않고 비운다 —
  //   토큰 밖의 색을 섹션에 칠해 두면 그 상자 자체가 검수기에 걸린다(river 지적 2026-09-21).
  try {
    const f = (section as unknown as GeometryMixin).fills as Paint[];
    const bound = Array.isArray(f) && f.length > 0 && f.every((p) =>
      p.type === "SOLID" && !!(p as SolidPaint).boundVariables && !!(p as SolidPaint).boundVariables!.color);
    if (!bound) {
      (section as unknown as GeometryMixin).fills = [];
      warnings.push(`섹션 바탕색을 토큰(${sectionVar})에 연결하지 못해 색 없이 두었습니다: ${section.name}`);
    }
  } catch (e) { /* fills 를 못 읽는 환경 → 그대로 둔다 */ }
  // 섹션 테두리 — Figma 가 새 섹션에 기본으로 깔아 주는 선은 토큰 밖 색이라 검수기에 걸린다
  //   (river 실측 2026-09-21: "Pattern / App Login (선)"). 바탕과 같은 규칙으로, 선도 정본 토큰에 걸고
  //   걸리지 않으면 색 없이 둔다. 선이 원래 없으면 아무것도 하지 않는다.
  try {
    const st = (section as unknown as GeometryMixin).strokes as Paint[];
    if (Array.isArray(st) && st.length > 0) {
      bindStroke(section as unknown as SceneNode, maps, "color/line/default", warnings);
      const after = (section as unknown as GeometryMixin).strokes as Paint[];
      const bound = Array.isArray(after) && after.length > 0 && after.every((p) =>
        p.type === "SOLID" && !!(p as SolidPaint).boundVariables && !!(p as SolidPaint).boundVariables!.color);
      if (!bound) {
        (section as unknown as GeometryMixin).strokes = [];
        warnings.push(`섹션 테두리색을 토큰에 연결하지 못해 선 없이 두었습니다: ${section.name}`);
      }
    }
  } catch (e) { /* strokes 를 못 읽는 환경 → 그대로 둔다 */ }

  // 섹션 크기 = 화면(과 패턴 부품) 배치 범위 + 정본과 같은 여백(좌우/상하 80·100).
  //   화면 크기는 각 화면 틀의 w·h 를 쓴다(모바일 360×780, PC 1920×1080). 안 적혀 있으면 모바일 값.
  let maxX = 0, maxY = 0;
  for (const s of def.screens) {
    const sw = s.root.w !== undefined ? s.root.w : 360;
    const sh = s.root.h !== undefined ? s.root.h : 780;
    if (s.x + sw > maxX) maxX = s.x + sw;
    if (s.y + sh > maxY) maxY = s.y + sh;
  }
  for (const c of def.components || []) {
    const cw = c.root.w !== undefined ? c.root.w : 0;
    const ch = c.root.h !== undefined ? c.root.h : 0;
    if (c.x + cw > maxX) maxX = c.x + cw;
    if (c.y + ch > maxY) maxY = c.y + ch;
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

  // 패턴 전용 부품을 화면보다 먼저 만든다 — 화면의 local 인스턴스가 이것을 쓴다.
  const ctx: RenderCtx = { locals: {} };
  for (const pc of def.components || []) {
    if (onProgress) onProgress(0, def.screens.length, pc.name);
    await renderComponent(pc, section, maps, warnings, ctx);
  }

  let done = 0;
  for (const screen of def.screens) {
    if (onProgress) onProgress(done, def.screens.length, screen.name);
    await renderScreen(screen, section, maps, warnings, ctx);
    done++;
  }
  if (onProgress) onProgress(done, def.screens.length, "");

  // 마무리 훑기 — 부품이 아닌 요소(섹션 상자·화면 틀·사각형)까지 토큰에 안 걸린 색을 찾는다.
  //   보이지 않는 색은 그 자리에서 지우고, 남는 것은 이름 그대로 결과창에 올린다.
  for (const spot of sweepRawPaints(section as unknown as SceneNode)) {
    warnings.push(`토큰에 연결되지 않은 색이 남았습니다: ${spot}`);
  }

  return { sectionId: section.id, screenCount: def.screens.length, warnings };
}

async function renderScreen(
  screen: PatternScreen, section: SectionNode, maps: PatternMaps, warnings: string[], ctx: RenderCtx,
): Promise<void> {
  const frame = await renderNode(screen.root, section, false, maps, warnings, ctx);
  if (frame) { frame.x = screen.x; frame.y = screen.y; }
}

/** 패턴 전용 부품 1개를 섹션 안에 만들고, 화면이 쓸 수 있게 ctx.locals 에 이름으로 올린다. */
async function renderComponent(
  pc: PatternComponent, section: SectionNode, maps: PatternMaps, warnings: string[], ctx: RenderCtx,
): Promise<void> {
  if (pc.root.t !== "COMP") {
    throw new Error(`[패턴 부품] ${pc.name} — 맨 위가 부품(COMP)이 아니라 만들지 않고 멈춥니다.`);
  }
  const comp = await renderNode({ ...pc.root, n: pc.name }, section, false, maps, warnings, ctx);
  if (!comp || comp.type !== "COMPONENT") {
    throw new Error(`[패턴 부품] ${pc.name} 을(를) 만들지 못했습니다.`);
  }
  comp.x = pc.x; comp.y = pc.y;
  ctx.locals[pc.name] = comp;
}
