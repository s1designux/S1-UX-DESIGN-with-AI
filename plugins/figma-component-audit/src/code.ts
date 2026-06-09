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
};

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

// 가장 가까운 Component/ComponentSet/Instance 조상의 이름에서 컨텍스트 segment 추출
// 예: "Button / Primary / MD" → ["button","primary","md"]
function getComponentContext(node: SceneNode): string[] {
  let cur: BaseNode | null = node;
  const isComponentLike = (n: BaseNode) =>
    n.type === "COMPONENT" || n.type === "COMPONENT_SET" || n.type === "INSTANCE";
  while (cur && cur.id !== figma.currentPage.id) {
    if (isComponentLike(cur)) {
      const segments = (cur.name || "")
        .split(/[/_\s,]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (segments.length) return segments;
    }
    cur = cur.parent;
  }
  return (node.name || "")
    .split(/[/_\s,]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
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

  type Scored = { v: V2Var; score: number; matchType: Suggestion["matchType"]; matchInfo?: string };
  const componentRole: Scored[] = []; // component 컨텍스트 + role 둘 다 매칭
  const generalRole: Scored[] = [];   // role만 매칭 (component 매칭 없음)
  const exactOnly: Scored[] = [];     // hex 정확 매칭만 (role 매칭 없음)

  // V2 전 토큰 순회
  for (const v of v2All) {
    const lower = v.name.toLowerCase();
    let collectionBonus = 0;
    if (v.collectionName === "Semantic Color V2") collectionBonus = 10;
    else if (v.collectionName === "Foundation V2") collectionBonus = 1;

    // role 매칭 여부
    let isRoleMatch = false;
    for (const role of roles) {
      if (lower.indexOf(`/${role}/`) >= 0 || lower.indexOf(`/${role}--`) >= 0) {
        isRoleMatch = true;
        break;
      }
    }

    // component 매칭 여부
    let isComponentMatch = false;
    for (const seg of contextSegments) {
      if (seg.length < 2) continue;
      if (lower.indexOf(`/${seg}/`) >= 0) {
        isComponentMatch = true;
        break;
      }
    }

    const isExact = exactList.indexOf(v) >= 0;

    if (isRoleMatch && isComponentMatch) {
      let score = 50 + collectionBonus + (isExact ? 15 : 0);
      componentRole.push({ v, score, matchType: "role+component" });
    } else if (isRoleMatch) {
      let score = 30 + collectionBonus + (isExact ? 15 : 0);
      generalRole.push({ v, score, matchType: "role" });
    } else if (isExact) {
      let score = 15 + collectionBonus;
      exactOnly.push({ v, score, matchType: "exact" });
    }
  }

  componentRole.sort((a, b) => b.score - a.score);
  generalRole.sort((a, b) => b.score - a.score);
  exactOnly.sort((a, b) => b.score - a.score);

  // 카테고리 다양성 보장: component-role 최대 3 + general-role 최대 3
  // 한쪽 부족하면 다른 쪽에서 보충, 총 6개
  const limit = 6;
  const result: Scored[] = [];
  const used = new Set<string>();
  const compMax = 3;
  const generalMax = 3;

  for (const s of componentRole.slice(0, compMax)) {
    result.push(s);
    used.add(s.v.id);
  }
  for (const s of generalRole.slice(0, generalMax)) {
    if (used.has(s.v.id)) continue;
    result.push(s);
    used.add(s.v.id);
  }
  // 한쪽이 부족하면 다른 쪽 추가분으로 채움
  if (result.length < limit) {
    const remaining = [
      ...componentRole.slice(compMax),
      ...generalRole.slice(generalMax),
    ].sort((a, b) => b.score - a.score);
    for (const s of remaining) {
      if (used.has(s.v.id)) continue;
      result.push(s);
      used.add(s.v.id);
      if (result.length >= limit) break;
    }
  }
  // exact-only로 보충
  if (result.length < limit) {
    for (const s of exactOnly) {
      if (used.has(s.v.id)) continue;
      result.push(s);
      used.add(s.v.id);
      if (result.length >= limit) break;
    }
  }

  // 결과 정렬: component-role 먼저(점수순), 그다음 general-role(점수순), exact
  result.sort((a, b) => {
    const orderMap = { "role+component": 0, "role": 1, "exact": 2, "near": 3 };
    const ao = orderMap[a.matchType];
    const bo = orderMap[b.matchType];
    if (ao !== bo) return ao - bo;
    return b.score - a.score;
  });

  // role 매칭이 전혀 없으면 색 거리 근접 fallback
  if (result.length === 0) {
    const pool = v2All.filter((v) => v.collectionName === "Semantic Color V2");
    type Near = { v: V2Var; dist: number };
    const nears: Near[] = [];
    for (const v of pool) {
      const modes = Object.keys(v.hexByMode);
      if (modes.length === 0) continue;
      const vHex = v.hexByMode[modes[0]];
      const d = hexDistance(hex, vHex);
      nears.push({ v, dist: d });
    }
    nears.sort((a, b) => a.dist - b.dist);
    for (const n of nears.slice(0, 2)) {
      result.push({
        v: n.v,
        score: 5,
        matchType: "near",
        matchInfo: `Δ${Math.round(n.dist)}`,
      });
    }
  }

  return result.map((s): Suggestion => {
    let confidence: "high" | "medium" | "low";
    if (s.matchType === "role+component") confidence = "high";
    else if (s.matchType === "role") confidence = "medium";
    else if (s.matchType === "exact") confidence = "medium";
    else confidence = "low";
    return {
      variableId: s.v.id,
      variableName: s.v.name,
      collectionName: s.v.collectionName,
      confidence,
      matchType: s.matchType,
      matchInfo: s.matchInfo,
    };
  });
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
        const hasComponentMatch = ctx.length > 0 && suggestions.some((s) => {
          const lower = s.variableName.toLowerCase();
          for (const seg of ctx) {
            if (seg.length < 2) continue;
            if (lower.indexOf(`/${seg}/`) >= 0) return true;
          }
          return false;
        });
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
async function applyMulti(picks: { issue: Issue; suggestionIndex: number }[]): Promise<{ ok: number; fail: number; appliedIds: string[] }> {
  let ok = 0;
  let fail = 0;
  const appliedIds: string[] = [];
  for (const p of picks) {
    if (await applyOne(p.issue, p.suggestionIndex)) {
      ok++;
      appliedIds.push(p.issue.id);
    } else {
      fail++;
    }
  }
  return { ok, fail, appliedIds };
}

// Semantic Color V2 컬렉션을 찾아 mode override를 일괄 설정
async function setVariablesMode(mode: "light" | "dark" | "clear"): Promise<{ count: number; skipped: number; message?: string }> {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    return { count: 0, skipped: 0, message: "선택된 노드 없음" };
  }
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const semantic = collections.find((c) => c.name === "Semantic Color V2");
  if (!semantic) {
    return { count: 0, skipped: 0, message: "Semantic Color V2 컬렉션 없음" };
  }

  let targetModeId: string | null = null;
  if (mode !== "clear") {
    const targetName = mode === "light" ? "Light" : "Dark";
    const found = semantic.modes.find((m) => m.name === targetName);
    if (!found) {
      return { count: 0, skipped: 0, message: `${targetName} 모드를 찾지 못함` };
    }
    targetModeId = found.modeId;
  }

  let count = 0;
  let skipped = 0;
  for (const node of sel) {
    try {
      if (mode === "clear") {
        (node as any).clearExplicitVariableModeForCollection(semantic.id);
      } else {
        (node as any).setExplicitVariableModeForCollection(semantic.id, targetModeId);
      }
      count++;
    } catch (e) {
      skipped++;
    }
  }
  return { count, skipped };
}

figma.showUI(__html__, { width: 640, height: 720, themeColors: true });

figma.ui.onmessage = async (msg: { type: string; payload?: any }) => {
  try {
    if (msg.type === "scan") {
      const res = await audit();
      figma.ui.postMessage({ type: "scan-result", payload: res });
    } else if (msg.type === "select-node") {
      const n = await figma.getNodeByIdAsync(msg.payload.nodeId);
      if (n && "type" in n) {
        figma.currentPage.selection = [n as SceneNode];
        figma.viewport.scrollAndZoomIntoView([n as SceneNode]);
      }
    } else if (msg.type === "apply-one") {
      const ok = await applyOne(msg.payload.issue, msg.payload.suggestionIndex);
      figma.ui.postMessage({ type: "apply-result", payload: { issueId: msg.payload.issue.id, ok } });
    } else if (msg.type === "apply-high") {
      const count = await applyHighConfidence(msg.payload.issues);
      figma.notify(`${count}건 자동 적용 완료`);
      figma.ui.postMessage({ type: "apply-high-result", payload: { count } });
    } else if (msg.type === "apply-multi") {
      const res = await applyMulti(msg.payload.picks);
      figma.notify(`${res.ok}건 적용${res.fail ? ` · ${res.fail}건 실패` : ""}`);
      figma.ui.postMessage({ type: "apply-multi-result", payload: res });
    } else if (msg.type === "set-mode") {
      const res = await setVariablesMode(msg.payload.mode);
      const verb = msg.payload.mode === "clear" ? "override 제거" : `${msg.payload.mode} 모드 적용`;
      figma.notify(res.message || `${res.count}개 노드 ${verb}${res.skipped ? ` · ${res.skipped}개 skip` : ""}`);
      figma.ui.postMessage({ type: "set-mode-result", payload: res });
    } else if (msg.type === "resize") {
      const w = Math.max(420, Math.min(1400, Math.round(msg.payload.w)));
      const h = Math.max(480, Math.min(1200, Math.round(msg.payload.h)));
      figma.ui.resize(w, h);
    } else if (msg.type === "close") {
      figma.closePlugin();
    }
  } catch (e: any) {
    figma.ui.postMessage({ type: "error", payload: { message: String(e && e.message || e) } });
  }
};
