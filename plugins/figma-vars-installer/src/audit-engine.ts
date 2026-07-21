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

async function audit(rootOverride?: SceneNode): Promise<{ issues: Issue[]; stats: { scanned: number; issuesCount: number; highCount: number } }> {
  // rootOverride 를 주면 그 노드(예: 개선안 복제본)를 대상으로, 없으면 현재 선택 영역.
  const sel: readonly SceneNode[] = rootOverride ? [rootOverride] : figma.currentPage.selection;
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
  confidence: "high" | "ambiguous";  // 이름 매칭 신뢰도 (exact/normalized=high, partial=ambiguous)
  demoteReason?: string;        // 자동교체에서 강등된 사유 (사용자에게 "왜 확인이 필요한지" 표시)
};

// swap 실행 결과 — 강등(demoted)과 진짜 실패(failed)를 구분
type SwapOutcome = "swapped" | "demoted" | "failed";
type SwapMode = "strict" | "lenient";

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
  skippedNestedCount: number;  // 인스턴스 내부(하위레이어)라 교체 불가로 제외된 수
  noMatchCount: number;        // 기준 풀에 대응 이름이 없어 대상에서 빠진 수
  candidateCount: number;
  instancesPreview: { name: string; mainName: string; mainTopId: string; matched: boolean; sameAsTarget: boolean }[];
};

// 인스턴스 하위레이어인가? — 조상 체인에 INSTANCE 가 있으면 Figma 가 swapComponent 를 막는다
// ("Cannot modify a node inside an instance"). 후보에서 제외해야 실패 버킷이 오염되지 않는다.
function hasInstanceAncestor(n: BaseNode): boolean {
  let p: BaseNode | null = n.parent;
  while (p && p.type !== "PAGE" && p.type !== "DOCUMENT") {
    if (p.type === "INSTANCE") return true;
    p = p.parent;
  }
  return false;
}

// 이름 정규화 — 공백·하이픈·언더스코어·슬래시 제거 후 소문자
function normalizeName(s: string): string {
  return (s || "").toLowerCase().replace(/[\s_\-\/]+/g, "").trim();
}

type MatchType = "exact" | "normalized" | "partial";
type ReferenceMatch = { match: ReferenceComponent | null; matchType: MatchType | null };

// 후보 풀에서 이름 매칭 — 정확 일치 → 정규화 일치 → 부분 일치 순으로 시도
// matchType 을 함께 반환해 호출부가 신뢰도(confidence)를 판정한다.
function findReferenceMatch(name: string, pool: ReferenceComponent[]): ReferenceMatch {
  const lower = name.toLowerCase();
  // 1. 정확 일치 (소문자만)
  const exact = pool.find((p) => p.name.toLowerCase() === lower);
  if (exact) return { match: exact, matchType: "exact" };
  // 2. 정규화 일치 (공백·하이픈·슬래시 제거)
  const norm = normalizeName(name);
  const normMatch = pool.find((p) => normalizeName(p.name) === norm);
  if (normMatch) return { match: normMatch, matchType: "normalized" };
  // 3. 부분 일치 (양방향 substring, 정규화 후) — 최소 3자 이상일 때만
  if (norm.length >= 3) {
    const part = pool.find((p) => {
      const pn = normalizeName(p.name);
      return pn.length >= 3 && (pn.indexOf(norm) >= 0 || norm.indexOf(pn) >= 0);
    });
    if (part) return { match: part, matchType: "partial" };
  }
  return { match: null, matchType: null };
}

// ─── 이름 유사도(수동 매핑 자동 제안용) ────────────────────────────────
// 이름이 정본과 "완전히" 일치하지 않는 레거시 컴포넌트는 자동 교체하지 않는다(추측 금지).
// 대신 이 점수로 "가장 비슷한 정본"을 상위에 제안하고, 최종 선택은 사용자가 한다.
function bigrams(s: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
  return out;
}
function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  const A = bigrams(a), B = bigrams(b);
  if (A.length === 0 || B.length === 0) return 0;
  const freq: { [g: string]: number } = {};
  for (const g of A) freq[g] = (freq[g] || 0) + 1;
  let hit = 0;
  for (const g of B) { if (freq[g] > 0) { freq[g]--; hit++; } }
  return (2 * hit) / (A.length + B.length);
}
function tokenizeName(s: string): string[] {
  return (s || "").toLowerCase().split(/[\s_\-\/,.]+/).filter((t) => t.length > 0);
}
// 0..1 — 문자 바이그램 유사 + 토큰 겹침 + 부분문자열 중 최댓값
function scoreNameSimilarity(legacy: string, canon: string): number {
  const ln = normalizeName(legacy), cn = normalizeName(canon);
  if (!ln || !cn) return 0;
  if (ln === cn) return 1;
  let score = diceCoefficient(ln, cn);
  const lt = new Set(tokenizeName(legacy));
  const ct = tokenizeName(canon);
  if (ct.length) {
    let overlap = 0;
    for (const t of ct) if (lt.has(t)) overlap++;
    score = Math.max(score, overlap / ct.length);
  }
  if (ln.indexOf(cn) >= 0 || cn.indexOf(ln) >= 0) score = Math.max(score, 0.6);
  return score;
}
type MappingSuggestion = { id: string; key: string; type: "COMPONENT" | "COMPONENT_SET"; name: string; source?: string; score: number };
// 여러 부품이 뭉친 "모듈"(예: 테이블) 판정 임계 — 후손 인스턴스가 이 수 이상이면 통째/leaf 교체 대신 "재구성 필요"로 플래그.
const MODULE_NESTED_THRESHOLD = 5;
type ModuleFlag = { id: string; instanceId: string; instanceName: string; currentMainName: string; currentMainPath: string; nestedCount: number };
// 미매칭 레거시 인스턴스 1건 + 유사도 내림차순 정본 제안 목록(최상위=가장 유사)
type ManualMapCandidate = {
  id: string;
  instanceId: string;
  instanceName: string;
  currentMainName: string;
  currentMainPath: string;
  suggestions: MappingSuggestion[];
};
function rankSuggestions(legacyName: string, pool: ReferenceComponent[]): MappingSuggestion[] {
  return pool
    .map((p) => ({ id: p.id, key: p.key, type: p.type, name: p.name, source: p.sourceFileName, score: Math.round(scoreNameSimilarity(legacyName, p.name) * 100) / 100 }))
    .sort((a, b) => (b.score - a.score) || a.name.localeCompare(b.name));
}

// ─── variant(변형) 정규화 — 딱 두 가지만: ①대소문자 무시 ②값 동의어 사전 ───
// 추측 매핑 금지. 사전에 없으면 정규화 실패로 두어 strict 가 강등하도록 한다.
// 복합 축(예: platform=pc-md)은 분해하지 않는다.
const VARIANT_VALUE_SYNONYMS: { [k: string]: string } = {
  small: "sm", sm: "sm",
  medium: "md", md: "md",
  large: "lg", lg: "lg",
};

function normAxisName(a: string): string {
  return (a || "").toLowerCase().replace(/[\s_\-]+/g, "");
}

function normVariantValue(v: string): string {
  const base = (v || "").toLowerCase().replace(/[\s_\-]+/g, "");
  return VARIANT_VALUE_SYNONYMS[base] || base;
}

type VariantPick = { target: ComponentNode | null; reason: string | null; axisLoss: number };

// 정본 세트에서 레거시 인스턴스의 변형 조합에 해당하는 낱개 variant 를 고른다.
// 규칙(§0 실측 반영) — 교집합 축만 일치시킨다:
//   · 양쪽에 다 있는 축   → 정규화 후 값이 같아야 함 (필수)
//   · 정본에만 있는 축     → defaultVariant 값 사용
//   · 레거시에만 있는 축   → 버림 (정본에 개념이 없음) = axisLoss 로 집계
function pickVariantTarget(set: ComponentSetNode, legacyVP: { [k: string]: string } | null): VariantPick {
  const variants = set.children.filter((c) => c.type === "COMPONENT") as ComponentNode[];
  if (variants.length === 0) return { target: null, reason: "no-variant-match", axisLoss: 0 };
  const def = (set.defaultVariant || variants[0]) as ComponentNode;
  if (!legacyVP) return { target: def, reason: null, axisLoss: 0 };

  const defVP = def.variantProperties || {};
  const canonAxes = Object.keys(defVP);
  const canonByNorm: { [norm: string]: string } = {};
  for (const a of canonAxes) canonByNorm[normAxisName(a)] = a;

  // 교집합 축 산출 + 레거시 전용 축(=버려지는 축) 집계
  const shared: { canon: string; want: string }[] = [];
  let axisLoss = 0;
  for (const la of Object.keys(legacyVP)) {
    const ca = canonByNorm[normAxisName(la)];
    if (ca) shared.push({ canon: ca, want: normVariantValue(legacyVP[la]) });
    else axisLoss++;
  }
  // 겹치는 축이 하나도 없으면 보존할 게 없다.
  // 정본 세트에 낱개가 하나뿐이면 고를 여지가 없으므로 그대로 교체(리셋 위험 없음).
  // 여러 개면 임의로 기본값을 고르는 셈이라 = 조용한 상태 리셋 → 강등(안전 우선).
  if (shared.length === 0) {
    if (variants.length === 1) return { target: def, reason: null, axisLoss };
    return { target: null, reason: "no-variant-match", axisLoss };
  }

  const matches = variants.filter((v) => {
    const vp = v.variantProperties || {};
    return shared.every((s) => normVariantValue(vp[s.canon]) === s.want);
  });
  if (matches.length === 0) return { target: null, reason: "no-variant-match", axisLoss };
  if (matches.length === 1) return { target: matches[0], reason: null, axisLoss };

  // 여럿이면 정본에만 있는 축을 defaultVariant 값으로 좁힌다
  const otherAxes = canonAxes.filter((a) => !shared.some((s) => s.canon === a));
  const narrowed = matches.filter((v) => {
    const vp = v.variantProperties || {};
    return otherAxes.every((a) => vp[a] === defVP[a]);
  });
  if (narrowed.length === 1) return { target: narrowed[0], reason: null, axisLoss };
  // 유일하게 안 좁혀지면 강등(안전 우선)
  return { target: null, reason: "no-variant-match", axisLoss };
}

// 기준 풀과 현재 instance를 비교해 swap 후보 산정 + 진단 정보 반환
async function scanSwapCandidates(
  pool: ReferenceComponent[],
  roots?: readonly BaseNode[]
): Promise<{ candidates: SwapCandidate[]; diagnostics: SwapDiagnostics; manualCandidates: ManualMapCandidate[]; modules: ModuleFlag[] }> {
  // roots 를 주면 그 노드들을 대상으로(개선안 복제본 스캔용), 없으면 기존대로 현재 선택 영역
  const sel: readonly BaseNode[] = roots && roots.length ? roots : figma.currentPage.selection;
  const diag: SwapDiagnostics = {
    selectionCount: sel.length,
    instanceCount: 0,
    referencePoolSize: pool.length,
    matchedNameCount: 0,
    sameIdSkippedCount: 0,
    skippedNestedCount: 0,
    noMatchCount: 0,
    candidateCount: 0,
    instancesPreview: [],
  };
  if (sel.length === 0) return { candidates: [], diagnostics: diag, manualCandidates: [], modules: [] };
  const candidates: SwapCandidate[] = [];
  const manualCandidates: ManualMapCandidate[] = [];
  const modules: ModuleFlag[] = [];
  const manualSeen = new Set<string>();
  const seen = new Set<string>();
  let counter = 0;
  for (const root of sel) {
    const insts = collectInstances(root);
    diag.instanceCount += insts.length;
    for (const inst of insts) {
      // 인스턴스 하위레이어는 Figma 가 교체를 막으므로 후보에서 제외
      if (hasInstanceAncestor(inst)) { diag.skippedNestedCount++; continue; }
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
      let found = findReferenceMatch(compareName, pool);
      // 인스턴스 노드 이름으로 보조 매칭 (예: instance.name이 "Button"이면 그것도 시도)
      if (!found.match && inst.name && inst.name !== compareName) {
        found = findReferenceMatch(inst.name, pool);
      }
      const target = found.match;
      // 신뢰도: 정확/정규화 일치 = high, 부분 일치 = ambiguous(사용자 확인 필요)
      const confidence: "high" | "ambiguous" = found.matchType === "partial" ? "ambiguous" : "high";
      const matched = !!target;
      const sameAsTarget = !!target && target.id === currentTopId;
      if (matched) diag.matchedNameCount++;
      if (sameAsTarget) diag.sameIdSkippedCount++;
      if (diag.instancesPreview.length < 8) {
        diag.instancesPreview.push({ name: inst.name, mainName: compareName, mainTopId: currentTopId, matched, sameAsTarget });
      }
      if (!matched) {
        diag.noMatchCount++;
        // 이름이 정본과 안 맞는 top-level 인스턴스(중첩은 이미 위에서 제외). 같은 컴포넌트는 대표 1건만.
        if (pool.length > 0 && !manualSeen.has(currentTopId)) {
          manualSeen.add(currentTopId);
          // 내부에 부품이 많이 뭉친 "모듈"(예: 테이블)은 통째/leaf 교체가 부적절 → 재구성 필요로만 플래그.
          // (내부 중첩 인스턴스는 Figma 가 개별 교체를 막고, 이름도 정본과 달라 leaf 자동매칭도 불가.)
          const nestedCount = collectInstances(inst).length - 1; // 자신 제외 후손 인스턴스 수
          if (nestedCount >= MODULE_NESTED_THRESHOLD) {
            modules.push({
              id: "g" + (++counter),
              instanceId: inst.id,
              instanceName: inst.name,
              currentMainName: compareName,
              currentMainPath: await describeComponentLocation(main),
              nestedCount,
            });
          } else {
            // 단순(부품 적은) 미매칭 → "가장 비슷한 정본"을 상위 제안하는 수동 매핑 후보(최종 선택은 사용자).
            manualCandidates.push({
              id: "m" + (++counter),
              instanceId: inst.id,
              instanceName: inst.name,
              currentMainName: compareName,
              currentMainPath: await describeComponentLocation(main),
              suggestions: rankSuggestions(inst.name && inst.name !== compareName ? `${compareName} ${inst.name}` : compareName, pool),
            });
          }
        }
        continue;
      }
      if (sameAsTarget) continue;
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
        confidence,
      });
    }
  }
  diag.candidateCount = candidates.length;
  return { candidates, diagnostics: diag, manualCandidates, modules };
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

type ResolveResult = {
  target: ComponentNode | null;
  reason: string | null;       // null=성공 · "no-variant-match" · "resolve-failed"
  variantReset: boolean;       // lenient 에서 조합을 못 찾아 기본값으로 교체한 경우
  axisLoss: number;            // 레거시에만 있어 버려진 축 수
};

// 정본 세트/컴포넌트 노드 확보 — 현재 파일이면 직접, 아니면 라이브러리에서 import
async function loadSuggestedNode(candidate: SwapCandidate): Promise<BaseNode | null> {
  try {
    const n = await figma.getNodeByIdAsync(candidate.suggestedId);
    if (n && (n.type === "COMPONENT" || n.type === "COMPONENT_SET")) return n;
  } catch {}
  if (candidate.suggestedKey) {
    try {
      if (candidate.suggestedType === "COMPONENT_SET") {
        return await figma.importComponentSetByKeyAsync(candidate.suggestedKey);
      }
      return await figma.importComponentByKeyAsync(candidate.suggestedKey);
    } catch { return null; }
  }
  return null;
}

// swap 대상 ComponentNode 결정 — 원본 인스턴스의 변형(State/Size 등)을 보존한다.
//  · strict  (자동교체용): 조합을 못 찾으면 target=null + reason="no-variant-match" → 강등
//  · lenient (수동교체용): 조합을 못 찾으면 defaultVariant + variantReset=true → "상태 리셋됨"
async function resolveSwapTarget(
  candidate: SwapCandidate,
  mode: SwapMode,
  legacyVP: { [k: string]: string } | null
): Promise<ResolveResult> {
  const node = await loadSuggestedNode(candidate);
  if (!node) return { target: null, reason: "resolve-failed", variantReset: false, axisLoss: 0 };

  // 변형 없는 단일 컴포넌트 — 리셋 위험 없음, 두 모드 동일
  if (node.type === "COMPONENT") {
    return { target: node as ComponentNode, reason: null, variantReset: false, axisLoss: 0 };
  }

  const set = node as ComponentSetNode;
  const pick = pickVariantTarget(set, legacyVP);
  if (pick.target) {
    return { target: pick.target, reason: null, variantReset: false, axisLoss: pick.axisLoss };
  }
  if (mode === "lenient") {
    // 사용자가 명시적으로 고른 교체이므로 기본값 리셋을 허용하되 뱃지로 알린다
    const fallback = (set.defaultVariant || (set.children.filter((c) => c.type === "COMPONENT")[0] as ComponentNode)) || null;
    if (fallback) return { target: fallback as ComponentNode, reason: null, variantReset: true, axisLoss: pick.axisLoss };
    return { target: null, reason: "resolve-failed", variantReset: false, axisLoss: pick.axisLoss };
  }
  return { target: null, reason: pick.reason || "no-variant-match", variantReset: false, axisLoss: pick.axisLoss };
}

// ─── 텍스트 콘텐츠 보존 (swap 시 시안 입력 텍스트가 정본 기본값으로 리셋되는 것 방지) ───
// 원칙(§추측 배치 금지): 레이어 이름-경로 + 형제 인덱스가 정확히 대응되는 TEXT 에만 원래
// characters 를 재적용한다. 대응 안 되는 캡처 텍스트는 강제 배치하지 않고 unpreserved 로 보고.
// 스타일(폰트·색)은 정본 것을 유지하고 "내용"만 이식한다(적용 시 대상 노드의 현재 폰트 로드).
type CapturedText = { key: string; chars: string };

// 인스턴스 하위(중첩 인스턴스 내부 포함)의 모든 TEXT 를 경로 키와 함께 수집.
// 경로 키 = 루트→leaf 각 단계 `이름#동일이름형제인덱스` 를 '/' 로 이은 것(반복 행·셀도 인덱스로 구분).
function collectTextsWithPath(root: BaseNode): { key: string; node: TextNode }[] {
  const out: { key: string; node: TextNode }[] = [];
  const walk = (node: BaseNode, path: string[]): void => {
    if (node.type === "TEXT") out.push({ key: path.join("/"), node: node as TextNode });
    if ("children" in node) {
      const kids = (node as any).children as BaseNode[];
      const nameSeen: { [k: string]: number } = {};
      for (const k of kids) {
        const base = k.name || k.type;
        const idx = (nameSeen[base] = (nameSeen[base] === undefined ? 0 : nameSeen[base] + 1));
        walk(k, path.concat(`${base}#${idx}`));
      }
    }
  };
  walk(root, []);
  return out;
}

function captureTextOverrides(inst: InstanceNode): Map<string, string> {
  const map = new Map<string, string>();
  for (const t of collectTextsWithPath(inst)) {
    if (!map.has(t.key)) map.set(t.key, t.node.characters);
  }
  return map;
}

// 대상 TEXT 노드의 현재 폰트를 로드(단일/혼합 모두) — characters 설정 전 필수.
async function loadFontsForText(node: TextNode): Promise<void> {
  const fn = node.fontName;
  if (fn === figma.mixed) {
    const len = node.characters.length;
    const seen = new Set<string>();
    for (let i = 0; i < len; i++) {
      const f = node.getRangeFontName(i, i + 1);
      if (f !== figma.mixed) seen.add(JSON.stringify(f));
    }
    for (const s of seen) await figma.loadFontAsync(JSON.parse(s) as FontName);
  } else {
    await figma.loadFontAsync(fn as FontName);
  }
}

// swap 후 새 인스턴스에 캡처 텍스트 복원. 경로 대응되는 것만 적용, 나머지는 unpreserved 반환.
async function restoreTextOverrides(inst: InstanceNode, captured: Map<string, string>): Promise<{ restored: number; unpreserved: string[] }> {
  if (captured.size === 0) return { restored: 0, unpreserved: [] };
  const used = new Set<string>();
  let restored = 0;
  for (const { key, node } of collectTextsWithPath(inst)) {
    if (!captured.has(key) || used.has(key)) continue;
    const chars = captured.get(key)!;
    used.add(key);
    if (node.characters === chars) { restored++; continue; } // 이미 동일(Figma 가 보존함) — 손댈 필요 없음
    try {
      await loadFontsForText(node);
      node.characters = chars;
      restored++;
    } catch (e) { used.delete(key); /* 프로퍼티 바인딩 텍스트 등 — 실패 시 unpreserved 로 떨어짐 */ }
  }
  const unpreserved: string[] = [];
  for (const [key, chars] of captured) {
    if (!used.has(key) && chars.trim() !== "") unpreserved.push(chars);
  }
  return { restored, unpreserved };
}

// 단건 swap 실행 — 결과를 swapped/demoted/failed 로 명확히 구분해 반환
async function applySwap(
  candidate: SwapCandidate,
  mode: SwapMode = "lenient"
): Promise<{ ok: boolean; result: SwapOutcome; reason?: string; variantReset?: boolean; axisLoss?: number; unpreserved?: string[] }> {
  const inst = await figma.getNodeByIdAsync(candidate.instanceId);
  if (!inst || inst.type !== "INSTANCE") {
    return { ok: false, result: "failed", reason: "인스턴스를 찾을 수 없음" };
  }
  // 인스턴스 하위레이어는 Figma 가 교체를 막는다
  if (hasInstanceAncestor(inst)) {
    return { ok: false, result: "failed", reason: "다른 컴포넌트 안에 포함된 부품이라 개별 교체할 수 없습니다." };
  }
  const legacyVP = (inst as InstanceNode).variantProperties || null;
  const res = await resolveSwapTarget(candidate, mode, legacyVP);
  if (!res.target) {
    if (res.reason === "no-variant-match") {
      return { ok: false, result: "demoted", reason: "정본에 같은 상태(변형) 조합이 없어 자동 교체하지 않았습니다.", axisLoss: res.axisLoss };
    }
    return { ok: false, result: "failed", reason: "기준 컴포넌트를 import할 수 없습니다. 기준 파일에서 컴포넌트가 publish되었는지 확인해주세요." };
  }
  // 교체 직전 시안 입력 텍스트 캡처 → 교체 → 대응 위치에 복원(내용만, 스타일은 정본 유지)
  const captured = captureTextOverrides(inst as InstanceNode);
  try {
    (inst as InstanceNode).swapComponent(res.target);
  } catch (e: any) {
    return { ok: false, result: "failed", reason: String(e && e.message || e) };
  }
  let unpreserved: string[] = [];
  try {
    const pres = await restoreTextOverrides(inst as InstanceNode, captured);
    unpreserved = pres.unpreserved;
  } catch (e) { /* 복원 실패해도 교체 자체는 성공 — 보존만 부분적 */ }
  return { ok: true, result: "swapped", variantReset: res.variantReset, axisLoss: res.axisLoss, unpreserved };
}

// ─── 설치기 기준 자동수집 + 개선안(복제본) 생성 ───────────────

// 이 파일에 설치된 정본 컴포넌트를 그대로 기준 풀로 사용한다(수동 등록 불필요).
// 설치기 [설치] 탭은 정본을 현재 페이지에 COMPONENT_SET 으로 생성하지만, 실무에선
// 정본이 별도 페이지(예: "Core")에 있고 화면은 다른 페이지에 있으므로 문서 전체를 훑는다.
// 현재 페이지를 먼저 담아 같은 이름이 여러 곳에 있으면 현재 페이지 것이 이긴다.
function collectPageReference(): ReferenceComponent[] {
  const fileName = figma.root.name;
  const seen: { [k: string]: boolean } = {};
  const out: ReferenceComponent[] = [];
  const push = (list: ReferenceComponent[]) => {
    for (const c of list) {
      const k = c.name.toLowerCase();
      if (!seen[k]) { seen[k] = true; out.push(c); }
    }
  };
  try { push(collectComponents(figma.currentPage, fileName)); } catch {}
  for (const page of figma.root.children) {
    if (page.id === figma.currentPage.id) continue;
    try { push(collectComponents(page, fileName)); } catch {}
  }
  return out;
}

type ImprovedSummary = {
  cloned: boolean;
  cloneId: string;
  cloneName: string;
  sourceName: string;
  autoSwapped: number;
  ambiguous: number;
  failed: number;
  axisLoss: number;        // 레거시 전용 축을 버리고 교체한 건수(정보 손실 — 실패 아님)
  skippedNested: number;   // 인스턴스 내부라 대상에서 제외된 수
  alreadyCanonical: number;// 이미 정본이라 바꿀 필요가 없던 수
  noMatch: number;         // 기준에 대응 컴포넌트가 없어 그대로 둔 수
  manualNeeded: number;    // 이름이 안 맞아 수동 매핑이 필요한(제안과 함께 제시되는) 컴포넌트 수
  moduleNeeded: number;    // 여러 부품이 뭉쳐 재구성이 필요한(교체 부적절) 모듈 수
  textUnpreserved: number; // 자동교체 시 정본에 대응 위치가 없어 보존 못 한 입력 텍스트 수
  totalInstances: number;
  referencePoolSize: number;
};

type BuildImprovedResult =
  | { ok: false; reason: string; code?: "need-install" | "need-single-frame" }
  | { ok: true; summary: ImprovedSummary; ambiguousCandidates: SwapCandidate[]; failedCandidates: SwapCandidate[]; manualCandidates: ManualMapCandidate[]; modules: ModuleFlag[] };

// 선택한 화면의 "개선안" 복제본을 만들고, 확실한 것만 정본으로 자동 교체한다.
// 원본은 손대지 않는다(비파괴).
async function buildImprovedCopy(): Promise<BuildImprovedResult> {
  const sel = figma.currentPage.selection;
  if (sel.length !== 1 || sel[0].type !== "FRAME") {
    return { ok: false, code: "need-single-frame", reason: "개선안을 만들 화면 프레임을 하나만 선택해주세요." };
  }
  const src = sel[0] as FrameNode;

  const pool = collectPageReference();
  if (pool.length === 0) {
    return { ok: false, code: "need-install", reason: "이 페이지에 정본 컴포넌트가 없습니다. [설치] 탭을 먼저 실행해주세요." };
  }

  // 원본 옆에 복제 — 페이지에 직접 붙이고 절대좌표로 배치(중첩 부모 회피)
  const clone = src.clone();
  try {
    clone.name = src.name + " — 개선안";
    figma.currentPage.appendChild(clone);
    const box = src.absoluteBoundingBox;
    if (box) { clone.x = box.x + box.width + 200; clone.y = box.y; }
    else { clone.x = src.x + src.width + 200; clone.y = src.y; }

    const { candidates, diagnostics, manualCandidates, modules } = await scanSwapCandidates(pool, [clone]);

    let autoSwapped = 0, ambiguous = 0, failed = 0, axisLoss = 0, textUnpreserved = 0;
    const ambiguousList: SwapCandidate[] = [];
    const failedList: SwapCandidate[] = [];
    for (const c of candidates) {
      // 자동 교체 조건: 이름 신뢰도 high AND strict 변형 매칭 성공
      if (c.confidence !== "high") {
        ambiguous++;
        ambiguousList.push({ ...c, demoteReason: "이름이 부분적으로만 일치해 확인이 필요합니다." });
        continue;
      }
      const r = await applySwap(c, "strict");
      if (r.result === "swapped") {
        autoSwapped++;
        if (r.axisLoss && r.axisLoss > 0) axisLoss++;
        if (r.unpreserved && r.unpreserved.length) textUnpreserved += r.unpreserved.length;
      } else if (r.result === "demoted") {
        // 변형 조합이 없어 강등 — "확인필요"로 재태깅하고 사유를 함께 넘긴다
        ambiguous++;
        ambiguousList.push({ ...c, confidence: "ambiguous", demoteReason: r.reason || "정본에 같은 상태(변형) 조합이 없습니다." });
      } else {
        // 진짜 실패 — 재시도해도 같은 결과라 교체 목록과 분리한다
        failed++;
        failedList.push({ ...c, demoteReason: r.reason || "교체할 수 없습니다." });
      }
    }

    return {
      ok: true,
      summary: {
        cloned: true,
        cloneId: clone.id,
        cloneName: clone.name,
        sourceName: src.name,
        autoSwapped, ambiguous, failed, axisLoss, textUnpreserved,
        manualNeeded: manualCandidates.length,
        moduleNeeded: modules.length,
        skippedNested: diagnostics.skippedNestedCount,
        alreadyCanonical: diagnostics.sameIdSkippedCount,
        noMatch: diagnostics.noMatchCount,
        totalInstances: diagnostics.instanceCount,
        referencePoolSize: pool.length,
      },
      ambiguousCandidates: ambiguousList,
      failedCandidates: failedList,
      manualCandidates,
      modules,
    };
  } catch (e: any) {
    // 도중 실패하면 반쯤 만들어진 복제본을 남기지 않는다(캔버스 오염 방지)
    try { clone.remove(); } catch {}
    throw e;
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
  collectPageReference,
  buildImprovedCopy,
};
export type {
  Issue, Suggestion, ReferenceComponent, SwapCandidate, SwapDiagnostics, SavedReference, NodeKind,
  SwapMode, SwapOutcome, ImprovedSummary, BuildImprovedResult,
};
