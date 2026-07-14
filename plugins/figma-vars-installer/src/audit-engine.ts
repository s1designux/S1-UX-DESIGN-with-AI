/**
 * S1 Component Audit — Figma 컴포넌트 검수 플러그인
 *
 * 기능:
 *  1. 선택된 노드를 순회하며 fills/strokes 점검
 *  2. 위반 분류:
 *     - external-var: V2 외 컬렉션 변수에 바인딩 → V2 토큰 제안
 *     - unbound-hex:  paint가 변수 없이 raw HEX → V2 토큰 제안
 *  3. high-confidence (HEX 완전일치 + V2 후보 1개) 자동 적용 옵션
 *
 * V2 컬렉션 이름 (런타임 동적 탐색):
 *  - Foundation V2 / Semantic Color V2 / Semantic Number V2
 */

const V2_COLLECTION_NAMES = ["Foundation V2", "Semantic Color V2", "Semantic Number V2"];

type AliasInfo = { variableId: string; collectionName: string };
type V2Var = {
  id: string;
  name: string;
  collectionName: string;
  // mode별 resolved hex
  hexByMode: { [modeId: string]: string };
};

type NodeKind = "text" | "icon" | "shape";

type Suggestion = {
  variableId: string;
  variableName: string;
  collectionName: string;
  confidence: "high" | "medium" | "low";
  matchType: "role+component" | "role" | "exact" | "near";
  matchInfo?: string;  // 'Δ12' 같은 부가 정보 (color distance)
  category: string;     // 'button' | 'tab' | 'text' | 'foundation' | ...
};

type Issue = {
  id: string;                       // unique
  nodeId: string;
  nodeName: string;
  nodeKind: NodeKind;
  property: "fills" | "strokes";
  paintIndex: number;
  reasonKind: "external-var" | "unbound-hex";
  hex: string;                      // resolved (light 우선)
  sourceLabel: string;              // 외부 변수 이름 또는 "raw"
  componentContext: string[];       // 가장 가까운 component 이름 segments
  hasComponentMatch: boolean;       // suggestion이 component-내 토큰을 포함하는지
  suggestions: Suggestion[];
  offGuide: boolean;                // 가이드(팔레트)에 없는 색 — 정확일치 0 & 최근접 Foundation 거리 > 임계값
  nearestDistance: number;          // 가장 가까운 Foundation 색과의 거리(ΔRGB)
};

// "가이드에 없는 색" 판정 임계값(ΔRGB 유클리드). 12 미만은 반올림 오차 수준으로 흡수.
const OFF_GUIDE_THRESHOLD = 12;

// 주어진 hex 와 가장 가까운 Foundation V2 색과의 거리(ΔRGB). 팔레트 존재 여부 판정용.
function nearestFoundationDistance(hex: string, v2All: V2Var[]): number {
  let best = 999;
  for (const v of v2All) {
    if (v.collectionName !== "Foundation V2") continue;
    const modes = Object.keys(v.hexByMode);
    if (modes.length === 0) continue;
    const d = hexDistance(hex, v.hexByMode[modes[0]]);
    if (d < best) best = d;
  }
  return best;
}

// 0~1 RGB → #RRGGBB
function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const to = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, "0");
  return `#${to(rgb.r)}${to(rgb.g)}${to(rgb.b)}`.toUpperCase();
}

async function loadV2Vars(): Promise<{
  v2: V2Var[];
  v2CollectionIds: Set<string>;
  byHex: { [hex: string]: V2Var[] };
}> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const v2Cols = collections.filter((c) => V2_COLLECTION_NAMES.indexOf(c.name) >= 0);
  const v2CollectionIds = new Set<string>(v2Cols.map((c) => c.id));
  const v2: V2Var[] = [];

  for (const col of v2Cols) {
    for (const variableId of col.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(variableId);
      if (!v || v.resolvedType !== "COLOR") continue;
      const hexByMode: { [modeId: string]: string } = {};
      for (const m of col.modes) {
        try {
          // resolveForConsumer 사용을 피하고 valuesByMode를 직접 해석
          const val = v.valuesByMode[m.modeId];
          let hex = "";
          if (val && typeof val === "object" && "type" in val && (val as VariableAlias).type === "VARIABLE_ALIAS") {
            // alias 체인을 따라가며 최종 RGB 값을 얻음
            let cur: VariableAlias | RGB | RGBA = val as VariableAlias;
            for (let i = 0; i < 10; i++) {
              if (typeof cur === "object" && "type" in cur && (cur as VariableAlias).type === "VARIABLE_ALIAS") {
                const next = await figma.variables.getVariableByIdAsync((cur as VariableAlias).id);
                if (!next) break;
                cur = next.valuesByMode[m.modeId] as any;
                continue;
              }
              break;
            }
            if (cur && typeof cur === "object" && "r" in cur) {
              hex = rgbToHex(cur as RGB);
            }
          } else if (val && typeof val === "object" && "r" in val) {
            hex = rgbToHex(val as RGB);
          }
          if (hex) hexByMode[m.modeId] = hex;
        } catch {
          // skip
        }
      }
      v2.push({ id: v.id, name: v.name, collectionName: col.name, hexByMode });
    }
  }

  const byHex: { [hex: string]: V2Var[] } = {};
  for (const v of v2) {
    for (const modeId in v.hexByMode) {
      const h = v.hexByMode[modeId];
      if (!byHex[h]) byHex[h] = [];
      if (byHex[h].indexOf(v) === -1) byHex[h].push(v);
    }
  }

  return { v2, v2CollectionIds, byHex };
}

function isFrameLike(n: BaseNode): n is FrameNode | ComponentNode | ComponentSetNode | InstanceNode | GroupNode {
  return "children" in n;
}

function walk(node: BaseNode, acc: SceneNode[] = []): SceneNode[] {
  if ("id" in node && node.id !== figma.currentPage.id) acc.push(node as SceneNode);
  if (isFrameLike(node)) {
    for (const c of (node as any).children) walk(c, acc);
  }
  return acc;
}

function scopeFromProperty(property: "fills" | "strokes"): "fill" | "stroke" {
  return property === "fills" ? "fill" : "stroke";
}

// 노드 종류를 분류 (text / icon / shape)
function classifyNode(node: SceneNode): NodeKind {
  if (node.type === "TEXT") return "text";
  if (node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION") return "icon";
  const iconNamePattern = /(^|[_/\s-])ic([_-]|on\b)|icon/i;
  if (iconNamePattern.test(node.name || "")) return "icon";
  // 조상 5단계까지 icon 이름 탐색
  let cur: BaseNode | null = node.parent;
  let depth = 0;
  while (cur && cur.id !== figma.currentPage.id && depth < 5) {
    if (iconNamePattern.test(cur.name || "")) return "icon";
    cur = cur.parent;
    depth++;
  }
  return "shape";
}

// 노드 자체가 component/instance면 자기 이름, 아니면 가장 가까운 component/instance 조상의 이름을
// segment로 분해하여 반환. V2 정의 여부와 무관.
//   예: 'Tab / Dark+1' → ['tab','dark','1']  /  'Button/Primary' → ['button','primary']
// 컴포넌트에 속하지 않으면 [] 반환 (일반 토큰 탭으로 분류됨).
function getComponentContext(node: SceneNode): string[] {
  const isComponentLike = (n: BaseNode) =>
    n.type === "COMPONENT" || n.type === "COMPONENT_SET" || n.type === "INSTANCE";

  const splitName = (name: string) =>
    (name || "")
      .split(/[/_\s,+]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

  if (isComponentLike(node)) {
    return splitName(node.name);
  }
  let cur: BaseNode | null = node.parent;
  while (cur && cur.id !== figma.currentPage.id) {
    if (isComponentLike(cur)) {
      return splitName(cur.name);
    }
    cur = cur.parent;
  }
  return [];
}

// 노드 종류와 paint 속성, 외부 변수 이름으로부터 "역할(role)" segment 결정
// 예: TEXT + 외부 변수 'color/text/primary' → ['text', 'label']
//     ICON + 외부 변수 'color/icon/default' → ['icon']
//     SHAPE fills → ['bg', 'surface']
//     SHAPE strokes → ['border', 'line']
const KNOWN_ROLES = ["text", "label", "icon", "bg", "surface", "border", "line", "stroke", "fill"];

function decideRoles(nodeKind: NodeKind, paintProp: "fills" | "strokes", externalVarName?: string): string[] {
  const roles: string[] = [];
  // 외부 변수 이름에서 role segment만 추출 (component 이름은 role 아님)
  // 'color/button/label/primary' → role = 'label'  (button은 component, role 아님)
  // 'color/text/primary'         → role = 'text'
  if (externalVarName) {
    const segs = externalVarName.toLowerCase().split("/").filter(Boolean);
    for (const seg of segs) {
      if (KNOWN_ROLES.indexOf(seg) >= 0 && roles.indexOf(seg) === -1) {
        roles.push(seg);
      }
    }
  }
  // 노드 종류 fallback — 외부 변수의 role과 별개로 항상 추가
  // (text 노드면 'text','label' 항상, icon이면 'icon' 항상)
  if (nodeKind === "text") {
    if (roles.indexOf("text") === -1) roles.push("text");
    if (roles.indexOf("label") === -1) roles.push("label");
  } else if (nodeKind === "icon") {
    if (roles.indexOf("icon") === -1) roles.push("icon");
  } else {
    if (paintProp === "fills") {
      if (roles.indexOf("bg") === -1) roles.push("bg");
      if (roles.indexOf("surface") === -1) roles.push("surface");
    } else {
      if (roles.indexOf("border") === -1) roles.push("border");
      if (roles.indexOf("line") === -1) roles.push("line");
    }
  }
  return roles;
}

function hexDistance(a: string, b: string): number {
  if (!a || !b || a.length < 7 || b.length < 7) return 999;
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2);
}

// V2 토큰 이름에서 카테고리 추출 ('color/button/...' → 'button', 'color/text/...' → 'text')
function categoryOf(varName: string): string {
  const segs = varName.toLowerCase().split("/").filter(Boolean);
  if (segs.length < 2) return "etc";
  if (segs[0] !== "color") return segs[0];
  return segs[1];
}

function pickSuggestions(
  hex: string,
  byHex: { [hex: string]: V2Var[] },
  v2All: V2Var[],
  paintProp: "fills" | "strokes",
  nodeKind: NodeKind,
  contextSegments: string[],
  externalVarName?: string
): Suggestion[] {
  const roles = decideRoles(nodeKind, paintProp, externalVarName);
  const exactList = byHex[hex] || [];
  const exactIds = new Set(exactList.map((v) => v.id));

  const result: Suggestion[] = [];
  const added = new Set<string>();

  // 1) Semantic Color V2 전 토큰 순회 — role 매칭 토큰만 채택 (카테고리 무관, 갯수 제한 없음)
  for (const v of v2All) {
    if (v.collectionName !== "Semantic Color V2") continue;
    const lower = v.name.toLowerCase();
    // role 매칭 여부
    let hasRoleMatch = false;
    for (const role of roles) {
      if (lower.indexOf(`/${role}/`) >= 0 || lower.indexOf(`/${role}--`) >= 0) {
        hasRoleMatch = true;
        break;
      }
    }
    if (!hasRoleMatch) continue;

    const cat = categoryOf(v.name);
    const isComponentMatch = contextSegments.indexOf(cat) >= 0;
    const isExact = exactIds.has(v.id);

    let matchType: Suggestion["matchType"];
    let confidence: "high" | "medium" | "low";
    if (isComponentMatch) {
      matchType = "role+component";
      confidence = "high";
    } else {
      matchType = "role";
      confidence = "medium";
    }
    if (isExact) confidence = "high";

    result.push({
      variableId: v.id,
      variableName: v.name,
      collectionName: v.collectionName,
      confidence,
      matchType,
      category: cat,
    });
    added.add(v.id);
  }

  // 2) 정확히 일치하는 hex의 Foundation/Semantic 토큰 (role 매칭 없는 것도 포함) — 'foundation' 카테고리
  for (const v of exactList) {
    if (added.has(v.id)) continue;
    result.push({
      variableId: v.id,
      variableName: v.name,
      collectionName: v.collectionName,
      confidence: "medium",
      matchType: "exact",
      category: v.collectionName === "Foundation V2" ? "foundation" : categoryOf(v.name),
    });
    added.add(v.id);
  }

  // 3) Foundation 유사색 top 10 (색 거리)
  type Near = { v: V2Var; dist: number };
  const nears: Near[] = [];
  for (const v of v2All) {
    if (v.collectionName !== "Foundation V2") continue;
    if (added.has(v.id)) continue;
    const modes = Object.keys(v.hexByMode);
    if (modes.length === 0) continue;
    const vHex = v.hexByMode[modes[0]];
    const d = hexDistance(hex, vHex);
    nears.push({ v, dist: d });
  }
  nears.sort((a, b) => a.dist - b.dist);
  for (const n of nears.slice(0, 10)) {
    result.push({
      variableId: n.v.id,
      variableName: n.v.name,
      collectionName: n.v.collectionName,
      confidence: "low",
      matchType: "near",
      matchInfo: `Δ${Math.round(n.dist)}`,
      category: "foundation",
    });
    added.add(n.v.id);
  }

  // 정렬: 컨텍스트 매칭 카테고리 → 점수순 (matchType 우선, exact 우선)
  const orderMap: Record<string, number> = { "role+component": 0, "role": 1, "exact": 2, "near": 3 };
  result.sort((a, b) => {
    const aCtx = contextSegments.indexOf(a.category) >= 0 ? 0 : 1;
    const bCtx = contextSegments.indexOf(b.category) >= 0 ? 0 : 1;
    if (aCtx !== bCtx) return aCtx - bCtx;
    const ao = orderMap[a.matchType] ?? 9;
    const bo = orderMap[b.matchType] ?? 9;
    if (ao !== bo) return ao - bo;
    // category 알파벳순
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.variableName.localeCompare(b.variableName);
  });

  return result;
}

async function audit(): Promise<{ issues: Issue[]; stats: { scanned: number; issuesCount: number; highCount: number } }> {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    return { issues: [], stats: { scanned: 0, issuesCount: 0, highCount: 0 } };
  }

  const { v2, v2CollectionIds, byHex } = await loadV2Vars();

  // 모든 자손 수집
  const allNodes: SceneNode[] = [];
  for (const root of sel) {
    allNodes.push(root);
    walk(root, allNodes);
  }

  const issues: Issue[] = [];
  let issueCounter = 0;

  for (const n of allNodes) {
    const ctx = getComponentContext(n);
    const kind = classifyNode(n);
    for (const prop of ["fills", "strokes"] as const) {
      if (!(prop in n)) continue;
      const arr = (n as any)[prop];
      if (!Array.isArray(arr)) continue;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        if (!p || p.type !== "SOLID") continue;
        const rgb = (p as SolidPaint).color;
        const hex = rgbToHex(rgb);
        const bound = (p as SolidPaint).boundVariables && (p as SolidPaint).boundVariables!.color;
        let externalVarName: string | undefined;
        if (bound) {
          const vTemp = await figma.variables.getVariableByIdAsync(bound.id);
          if (vTemp && !v2CollectionIds.has(vTemp.variableCollectionId)) {
            externalVarName = vTemp.name;
          }
        }
        const suggestions = pickSuggestions(hex, byHex, v2, prop, kind, ctx, externalVarName);
        // 노드가 어떤 컴포넌트/인스턴스에 속하면 컴포넌트 매칭 탭으로 분류
        // (V2에 해당 컴포넌트 토큰이 정의되어 있는지 여부는 suggestion 점수에만 영향)
        const hasComponentMatch = ctx.length > 0;
        // 가이드 외 색상 판정: 정확일치(exact) 후보가 없고, 최근접 Foundation 색과도 임계값 이상 멀면 팔레트에 없는 색.
        const hasExact = suggestions.some((s) => s.matchType === "exact");
        const nearestDistance = nearestFoundationDistance(hex, v2);
        const offGuide = !hasExact && nearestDistance > OFF_GUIDE_THRESHOLD;
        if (bound) {
          const v = await figma.variables.getVariableByIdAsync(bound.id);
          if (!v) continue;
          if (v2CollectionIds.has(v.variableCollectionId)) continue;
          issues.push({
            id: "i" + (++issueCounter),
            nodeId: n.id,
            nodeName: n.name,
            nodeKind: kind,
            property: prop,
            paintIndex: i,
            reasonKind: "external-var",
            hex,
            sourceLabel: v.name,
            componentContext: ctx,
            hasComponentMatch,
            suggestions,
            offGuide,
            nearestDistance,
          });
        } else {
          issues.push({
            id: "i" + (++issueCounter),
            nodeId: n.id,
            nodeName: n.name,
            nodeKind: kind,
            property: prop,
            paintIndex: i,
            reasonKind: "unbound-hex",
            hex,
            sourceLabel: hex,
            componentContext: ctx,
            hasComponentMatch,
            suggestions,
            offGuide,
            nearestDistance,
          });
        }
      }
    }
  }

  const highCount = issues.filter((x) => x.suggestions.length === 1 && x.suggestions[0].confidence === "high").length;
  return { issues, stats: { scanned: allNodes.length, issuesCount: issues.length, highCount } };
}

async function applyOne(issue: Issue, suggestionIndex: number): Promise<boolean> {
  const sug = issue.suggestions[suggestionIndex];
  if (!sug) return false;
  const node = await figma.getNodeByIdAsync(issue.nodeId);
  if (!node) return false;
  const v2 = await figma.variables.getVariableByIdAsync(sug.variableId);
  if (!v2) return false;
  const arr = (node as any)[issue.property];
  if (!Array.isArray(arr)) return false;
  const copy = JSON.parse(JSON.stringify(arr));
  const paint = copy[issue.paintIndex];
  if (!paint || paint.type !== "SOLID") return false;
  copy[issue.paintIndex] = figma.variables.setBoundVariableForPaint(paint, "color", v2);
  (node as any)[issue.property] = copy;
  return true;
}

async function applyHighConfidence(issues: Issue[]): Promise<number> {
  let n = 0;
  for (const i of issues) {
    if (i.suggestions.length === 1 && i.suggestions[0].confidence === "high") {
      if (await applyOne(i, 0)) n++;
    }
  }
  return n;
}

// 멀티 적용 — UI에서 라디오로 선택한 항목들 일괄 처리
async function applyMulti(picks: { issue: Issue; suggestionIndex: number }[]): Promise<{ ok: number; fail: number; applied: { issueId: string; suggestionIndex: number }[] }> {
  let ok = 0;
  let fail = 0;
  const applied: { issueId: string; suggestionIndex: number }[] = [];
  for (const p of picks) {
    if (await applyOne(p.issue, p.suggestionIndex)) {
      ok++;
      applied.push({ issueId: p.issue.id, suggestionIndex: p.suggestionIndex });
    } else {
      fail++;
    }
  }
  return { ok, fail, applied };
}

// Semantic Color V2 컬렉션을 찾아 mode override를 일괄 설정.
// 초기화(clear)는 모든 컬렉션 + 모든 자손 노드까지 재귀적으로 처리해 레거시 모드까지 깨끗이 제거.
async function setVariablesMode(mode: "light" | "dark" | "clear"): Promise<{ count: number; skipped: number; cleared?: number; message?: string }> {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    return { count: 0, skipped: 0, message: "선택된 노드 없음" };
  }

  if (mode === "clear") {
    // 선택 노드와 모든 자손 노드에 있는 모든 컬렉션의 explicit mode 제거
    let cleared = 0;
    let skipped = 0;
    const visit = (n: SceneNode) => {
      const modes = (n as any).explicitVariableModes as { [collectionId: string]: string } | undefined;
      if (modes) {
        const collectionIds = Object.keys(modes);
        for (const cid of collectionIds) {
          try {
            (n as any).clearExplicitVariableModeForCollection(cid);
            cleared++;
          } catch (e) {
            skipped++;
          }
        }
      }
      if ("children" in n) {
        for (const c of (n as any).children) visit(c as SceneNode);
      }
    };
    for (const root of sel) visit(root);
    if (cleared === 0 && skipped === 0) {
      return { count: 0, skipped: 0, cleared: 0, message: "초기화할 모드 override 없음" };
    }
    return { count: sel.length, skipped, cleared };
  }

  // Light/Dark 설정
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const semantic = collections.find((c) => c.name === "Semantic Color V2");
  if (!semantic) {
    return { count: 0, skipped: 0, message: "Semantic Color V2 컬렉션 없음" };
  }
  const targetName = mode === "light" ? "Light" : "Dark";
  const found = semantic.modes.find((m) => m.name === targetName);
  if (!found) {
    return { count: 0, skipped: 0, message: `${targetName} 모드를 찾지 못함` };
  }

  let count = 0;
  let skipped = 0;
  for (const node of sel) {
    try {
      (node as any).setExplicitVariableModeForCollection(semantic.id, found.modeId);
      count++;
    } catch (e) {
      skipped++;
    }
  }
  return { count, skipped };
}

// ─── 컴포넌트 swap 기능 ──────────────────────────────────────

type ReferenceComponent = {
  id: string;       // 등록 시점의 파일 내 ID (같은 파일에서만 유효)
  key: string;      // component key (publish된 경우 다른 파일에서도 유효)
  name: string;
  type: "COMPONENT" | "COMPONENT_SET";
  sourceFileName?: string;  // 출처 파일 이름 (UX 가이드 파일명 표시용)
};

type SwapCandidate = {
  id: string;
  instanceId: string;
  instanceName: string;
  currentMainId: string;
  currentMainName: string;
  currentMainPath: string;     // 현재 mainComponent의 위치 (페이지/parent set)
  suggestedId: string;          // 기준 파일에서의 ID (다른 파일에선 무효)
  suggestedKey: string;         // 라이브러리 component key (publish된 경우 import 가능)
  suggestedType: "COMPONENT" | "COMPONENT_SET";
  suggestedName: string;
  suggestedSource?: string;     // 출처 파일명
};

// 노드 자손에서 모든 COMPONENT/COMPONENT_SET 수집 (key 포함)
function collectComponents(root: BaseNode, sourceFileName?: string): ReferenceComponent[] {
  const acc: ReferenceComponent[] = [];
  const visit = (n: BaseNode) => {
    if (n.type === "COMPONENT_SET") {
      acc.push({ id: n.id, key: (n as ComponentSetNode).key, name: n.name, type: "COMPONENT_SET", sourceFileName });
      return;
    }
    if (n.type === "COMPONENT") {
      if (n.parent && n.parent.type === "COMPONENT_SET") return;
      acc.push({ id: n.id, key: (n as ComponentNode).key, name: n.name, type: "COMPONENT", sourceFileName });
      return;
    }
    if ("children" in n) {
      for (const c of (n as any).children) visit(c);
    }
  };
  visit(root);
  return acc;
}

// 노드 자손에서 모든 INSTANCE 수집
function collectInstances(root: BaseNode): InstanceNode[] {
  const acc: InstanceNode[] = [];
  const visit = (n: BaseNode) => {
    if (n.type === "INSTANCE") {
      acc.push(n as InstanceNode);
      // 인스턴스 내부도 다른 인스턴스가 있을 수 있음
    }
    if ("children" in n) {
      for (const c of (n as any).children) visit(c);
    }
  };
  visit(root);
  return acc;
}

type SwapDiagnostics = {
  selectionCount: number;
  instanceCount: number;
  referencePoolSize: number;
  matchedNameCount: number;    // mainComponent 이름이 기준 풀에 있는 인스턴스 수
  sameIdSkippedCount: number;  // 같은 컴포넌트라서 스킵된 수
  candidateCount: number;
  instancesPreview: { name: string; mainName: string; mainTopId: string; matched: boolean; sameAsTarget: boolean }[];
};

// 이름 정규화 — 공백·하이픈·언더스코어·슬래시 제거 후 소문자
function normalizeName(s: string): string {
  return (s || "").toLowerCase().replace(/[\s_\-\/]+/g, "").trim();
}

// 후보 풀에서 이름 매칭 — 정확 일치 → 정규화 일치 → 부분 일치 순으로 시도
function findReferenceMatch(name: string, pool: ReferenceComponent[]): ReferenceComponent | null {
  const lower = name.toLowerCase();
  // 1. 정확 일치 (소문자만)
  const exact = pool.find((p) => p.name.toLowerCase() === lower);
  if (exact) return exact;
  // 2. 정규화 일치 (공백·하이픈·슬래시 제거)
  const norm = normalizeName(name);
  const normMatch = pool.find((p) => normalizeName(p.name) === norm);
  if (normMatch) return normMatch;
  // 3. 부분 일치 (양방향 substring, 정규화 후) — 최소 3자 이상일 때만
  if (norm.length >= 3) {
    const part = pool.find((p) => {
      const pn = normalizeName(p.name);
      return pn.length >= 3 && (pn.indexOf(norm) >= 0 || norm.indexOf(pn) >= 0);
    });
    if (part) return part;
  }
  return null;
}

// 기준 풀과 현재 instance를 비교해 swap 후보 산정 + 진단 정보 반환
async function scanSwapCandidates(pool: ReferenceComponent[]): Promise<{ candidates: SwapCandidate[]; diagnostics: SwapDiagnostics }> {
  const sel = figma.currentPage.selection;
  const diag: SwapDiagnostics = {
    selectionCount: sel.length,
    instanceCount: 0,
    referencePoolSize: pool.length,
    matchedNameCount: 0,
    sameIdSkippedCount: 0,
    candidateCount: 0,
    instancesPreview: [],
  };
  if (sel.length === 0) return { candidates: [], diagnostics: diag };
  const candidates: SwapCandidate[] = [];
  const seen = new Set<string>();
  let counter = 0;
  for (const root of sel) {
    const insts = collectInstances(root);
    diag.instanceCount += insts.length;
    for (const inst of insts) {
      const main = await inst.getMainComponentAsync();
      if (!main) {
        if (diag.instancesPreview.length < 8) diag.instancesPreview.push({ name: inst.name, mainName: "(mainComponent null)", mainTopId: "", matched: false, sameAsTarget: false });
        continue;
      }
      const compareName = main.parent && main.parent.type === "COMPONENT_SET"
        ? main.parent.name
        : main.name;
      const currentTopId = main.parent && main.parent.type === "COMPONENT_SET" ? main.parent.id : main.id;
      // 유연 매칭: 정확 → 정규화 → 부분 일치
      let target = findReferenceMatch(compareName, pool);
      // 인스턴스 노드 이름으로 보조 매칭 (예: instance.name이 "Button"이면 그것도 시도)
      if (!target && inst.name && inst.name !== compareName) {
        target = findReferenceMatch(inst.name, pool);
      }
      const matched = !!target;
      const sameAsTarget = !!target && target.id === currentTopId;
      if (matched) diag.matchedNameCount++;
      if (sameAsTarget) diag.sameIdSkippedCount++;
      if (diag.instancesPreview.length < 8) {
        diag.instancesPreview.push({ name: inst.name, mainName: compareName, mainTopId: currentTopId, matched, sameAsTarget });
      }
      if (!matched || sameAsTarget) continue;
      const key = inst.id + ":" + target!.id;
      if (seen.has(key)) continue;
      seen.add(key);
      const path = await describeComponentLocation(main);
      candidates.push({
        id: "s" + (++counter),
        instanceId: inst.id,
        instanceName: inst.name,
        currentMainId: currentTopId,
        currentMainName: compareName,
        currentMainPath: path,
        suggestedId: target!.id,
        suggestedKey: target!.key,
        suggestedType: target!.type,
        suggestedName: target!.name,
        suggestedSource: target!.sourceFileName,
      });
    }
  }
  diag.candidateCount = candidates.length;
  return { candidates, diagnostics: diag };
}

async function describeComponentLocation(comp: ComponentNode): Promise<string> {
  let cur: BaseNode | null = comp;
  let pageName = "";
  while (cur) {
    if (cur.type === "PAGE") { pageName = cur.name; break; }
    cur = cur.parent;
  }
  return pageName || "(외부)";
}

// swap 대상 ComponentNode 가져오기 — 현재 파일이면 직접, 아니면 라이브러리에서 import
async function resolveSwapTarget(candidate: SwapCandidate): Promise<ComponentNode | null> {
  // 1) 현재 파일 내 ID로 시도
  try {
    const n = await figma.getNodeByIdAsync(candidate.suggestedId);
    if (n) {
      if (n.type === "COMPONENT") return n as ComponentNode;
      if (n.type === "COMPONENT_SET") return (n as ComponentSetNode).defaultVariant;
    }
  } catch {}
  // 2) key가 있으면 라이브러리에서 import
  if (candidate.suggestedKey) {
    try {
      if (candidate.suggestedType === "COMPONENT_SET") {
        const set = await figma.importComponentSetByKeyAsync(candidate.suggestedKey);
        return set.defaultVariant;
      } else {
        const comp = await figma.importComponentByKeyAsync(candidate.suggestedKey);
        return comp;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
}

// 단건 swap 실행
async function applySwap(candidate: SwapCandidate): Promise<{ ok: boolean; reason?: string }> {
  const inst = await figma.getNodeByIdAsync(candidate.instanceId);
  if (!inst || inst.type !== "INSTANCE") return { ok: false, reason: "인스턴스를 찾을 수 없음" };
  const swapTarget = await resolveSwapTarget(candidate);
  if (!swapTarget) {
    return { ok: false, reason: "기준 컴포넌트를 import할 수 없습니다. 기준 파일에서 컴포넌트가 publish되었는지 확인해주세요." };
  }
  try {
    (inst as InstanceNode).swapComponent(swapTarget);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: String(e && e.message || e) };
  }
}

// 기준 풀 영속화 — 글로벌 (모든 파일에서 같은 기준 공유)
const REFERENCE_STORAGE_KEY = "s1-component-audit:reference-pool";

type SavedReference = { pool: ReferenceComponent[]; rootNames: string[]; sourceFileName?: string };

async function loadReference(): Promise<SavedReference | null> {
  try {
    const saved = await figma.clientStorage.getAsync(REFERENCE_STORAGE_KEY) as SavedReference | undefined;
    if (!saved || !saved.pool || saved.pool.length === 0) return null;
    // key가 있는 컴포넌트는 유효 (다른 파일에서도 import 가능)
    // key가 없으면 같은 파일에서만 유효 — getNodeByIdAsync로 검증
    const valid: ReferenceComponent[] = [];
    for (const c of saved.pool) {
      if (c.key) {
        valid.push(c); // key 있으면 unconditional 유효
        continue;
      }
      const n = await figma.getNodeByIdAsync(c.id);
      if (n && (n.type === "COMPONENT" || n.type === "COMPONENT_SET")) {
        valid.push(c);
      }
    }
    if (valid.length === 0) return null;
    return { pool: valid, rootNames: saved.rootNames || [], sourceFileName: saved.sourceFileName };
  } catch {
    return null;
  }
}

async function saveReference(pool: ReferenceComponent[], rootNames: string[], sourceFileName?: string): Promise<void> {
  try {
    await figma.clientStorage.setAsync(REFERENCE_STORAGE_KEY, { pool, rootNames, sourceFileName });
  } catch {}
}

async function clearReference(): Promise<void> {
  try {
    await figma.clientStorage.deleteAsync(REFERENCE_STORAGE_KEY);
  } catch {}
}

// ─── 설치기 라우터로 노출 (figma-component-audit 엔진 이식 · UI 통신은 code.ts 라우터가 담당) ───
export {
  audit,
  applyOne,
  applyHighConfidence,
  applyMulti,
  setVariablesMode,
  collectComponents,
  saveReference,
  loadReference,
  clearReference,
  scanSwapCandidates,
  applySwap,
};
export type { Issue, Suggestion, ReferenceComponent, SwapCandidate, SwapDiagnostics, SavedReference, NodeKind };
