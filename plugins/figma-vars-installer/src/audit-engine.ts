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
 *  - 정본 vars-data.ts 의 컬렉션 상수에서 **파생**한다(하드코딩 사본 금지).
 */

import { COMPONENT_CATEGORIES } from "./build-components";
import {
  FOUNDATION_COLLECTION,
  SEMANTIC_COLOR_COLLECTION,
  SEMANTIC_NUMBER_COLLECTION,
  SEMANTIC_SHADOW_COLLECTION,
  SEMANTIC_SHADOW,
  FOUNDATION_NUMBER,
  LIGHT_MODE,
  DARK_MODE,
} from "./vars-data";
import { TEXT_STYLES, TEXT_STYLE_FONT_FAMILY } from "./textstyles-data";
import { parseCssShadow } from "./shadow-parse";
import { LEGACY_MAP, LegacyMapEntry } from "./legacy-map-data";
import ALLOWED_REMOTE_KEYS from "../../../registry/figma/allowed-remote-keys.json";
import DUMMY_CHROME from "../../../registry/governance/dummy-chrome-parts.json";

// 검수 대상 컬렉션 = 설치기가 만드는 V2 컬렉션 전부.
//   2026-08-01: 종전에는 이 목록이 문자열 하드코딩 사본이었고, 2026-07-29 신설된
//   "Semantic Shadow V2" 가 빠져 있었다(정본 4개 vs 사본 3개 = 드리프트).
//   ⚠️ 다만 "그림자 paint 가 external-var 로 오탐된다"는 종전 서술은 **실측과 다르다**:
//   검수기는 fills/strokes paint 만 스캔하는데 그림자 색 변수는 scopes=["EFFECT_COLOR"] 라
//   paint 에 바인딩되지 않는다(🤖 component-verifier 2026-08-01 실측 — 재현 불가).
//   실제 의미는 "정본이 늘어도 사본이 안 따라오는 구조"를 없앤 것이다.
//   알려진 부작용(별건): Shadow 컬렉션의 COLOR 변수는 rgba(0,0,0,*) 이라 rgbToHex 가 alpha 를
//   버려 #000000 후보풀에 들어간다 → 검정 fill 에 shadow 토큰이 exact 제안으로 뜰 수 있다.
//   자동적용(high) 조건에는 안 걸리나, 제안 품질 문제로 BACKLOG 에 남긴다.
const V2_COLLECTION_NAMES = [
  FOUNDATION_COLLECTION,
  SEMANTIC_COLOR_COLLECTION,
  SEMANTIC_NUMBER_COLLECTION,
  SEMANTIC_SHADOW_COLLECTION,
];

// 설치기가 만드는 정본 컴포넌트 이름 집합(정규화). 문서 전체에서 기준 풀을 모을 때
// 이름을 맞대 볼 때 쓰는 열쇠 — **담는 쪽과 찾는 쪽이 이 함수 하나만 쓴다.**
// 손으로 옮겨 적으면 한쪽만 바뀌어 조용히 어긋난다(🤖 독립 검증 2026-09-18).
function refNameKey(name?: string | null): string {
  return (name || "").toLowerCase().replace(/[\s_\-\/]+/g, "");
}

// 이 목록에 있는 이름만 "정본"으로 인정해, 파일 내 다른 레거시 세트가 정본으로 둔갑하는 것을 막는다.
const CANONICAL_NAME_SET: { [norm: string]: true } = (() => {
  const m: { [norm: string]: true } = {};
  for (const cat of COMPONENT_CATEGORIES) {
    for (const name of cat.members) {
      m[refNameKey(name)] = true;
    }
  }
  return m;
})();

// 설치기가 화면에 직접 심는 **외부 라이브러리 부품**(V2.2 아이콘 등)의 컴포넌트 키 집합.
// 이 부품들은 이 파일 안에 정본 컴포넌트로 존재하지 않으므로 이름 매칭이 절대 성립하지 않는다.
// 그대로 두면 설치기가 만든 화면인데도 아이콘마다 "이름 다름 → 교체 후보" 카드가 떠서
// 엉뚱한 컴포넌트(예: globe 아이콘 → Language Icon)로 바꾸라고 권한다(2026-09-10 river 보고).
// 정본은 registry/figma/allowed-remote-keys.json 하나 — 이름(ic_ 접두사 등)이 아니라 **키**로만 판정한다.
const INSTALLER_REMOTE_KEY_SET: { [key: string]: true } = (() => {
  const m: { [key: string]: true } = {};
  const src = (ALLOWED_REMOTE_KEYS as { allowedRemoteComponentKeys?: { [name: string]: string } }).allowedRemoteComponentKeys || {};
  for (const name of Object.keys(src)) {
    const k = src[name];
    if (k) m[k] = true;
  }
  return m;
})();

// 이 인스턴스의 원본이 "설치기가 쓰는 외부 라이브러리 부품"인가? 세트 키로 불러온 아이콘
// (edge_set·lock_set 등)은 variant 개별 키가 아니라 부모 세트 키가 허용목록에 있으므로 둘 다 본다.
function isInstallerRemotePart(main: ComponentNode): boolean {
  if (main.key && INSTALLER_REMOTE_KEY_SET[main.key]) return true;
  const parent = main.parent;
  if (parent && parent.type === "COMPONENT_SET") {
    const setKey = (parent as ComponentSetNode).key;
    if (setKey && INSTALLER_REMOTE_KEY_SET[setKey]) return true;
  }
  return false;
}

// 설치기가 화면 예시용으로 얹는 **더미 크롬**(휴대폰 상태바 · 안드로이드 내비바/키보드 · 웹 브라우저 탭바).
// OS/브라우저 껍데기를 흉내 낸 배경 소품이라 우리 디자인시스템 부품이 아니다 — 그 안의 아이콘은
// OS 규격 글리프(최근앱·자판 Shift·창 최소화 등)여서 우리 아이콘으로 바꿀 대상이 아니다.
// river 결정 2026-09-10: "더미로 얹어지는 키보드, 상태바, 내비바 등에 그려진 아이콘은 검수에서 제외".
// 정본 = registry/governance/dummy-chrome-parts.json (이름 목록 · 결정 근거).
const DUMMY_CHROME_ROOTS: { [name: string]: true } = (() => {
  const m: { [name: string]: true } = {};
  const d = DUMMY_CHROME as { excludedRootNames?: string[]; innerPartNames?: string[] };
  for (const n of (d.excludedRootNames || [])) m[n.toLowerCase()] = true;
  for (const n of (d.innerPartNames || [])) m[n.toLowerCase()] = true;
  return m;
})();

/** 이 노드가 더미 크롬(또는 그 안쪽)인가? 자기 이름과 조상 이름을 함께 본다.
 *  화면에서는 같은 이름의 인스턴스로 얹히므로 이름 판정으로 충분하다(변형 접미사 `StatusBar/Platform=App` 포함). */
function isDummyChromePart(node: BaseNode | null): boolean {
  let cur: BaseNode | null = node;
  let depth = 0;
  while (cur && cur.type !== "PAGE" && cur.type !== "DOCUMENT" && depth < 24) {
    const raw = (cur.name || "").toLowerCase();
    const base = raw.split("/")[0].trim();      // "StatusBar/Platform=App" → "statusbar"
    if (DUMMY_CHROME_ROOTS[raw] || DUMMY_CHROME_ROOTS[base]) return true;
    cur = cur.parent;
    depth++;
  }
  return false;
}

type AliasInfo = { variableId: string; collectionName: string };
type V2Var = {
  id: string;
  name: string;
  collectionName: string;
  // mode별 resolved hex
  hexByMode: { [modeId: string]: string };
  // 모드 '이름'별 값 — 화면이 라이트인지 다크인지 알고 나서 그 모드 값으로만 대조하기 위한 것.
  // 단일 모드 컬렉션(Foundation·Number)은 그 하나의 값을 모든 이름에 넣지 않고 fallbackHex 로 둔다.
  hexByModeName: { [modeName: string]: string };
  fallbackHex: string;
  modeCount: number;
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
  // 화면에는 아이콘·버튼 같은 의미 단위로 한 건만 보여주되, 적용할 때는
  // 그 안에서 같은 위반을 가진 실제 paint를 모두 고친다.
  targets?: { nodeId: string; property: "fills" | "strokes"; paintIndex: number }[];
};

type ChecklistItemResult = {
  id: number;
  count: number;
  status: "pass" | "fail" | "warning" | "choice" | "unjudged";
  coverage: "full" | "partial";
};

type ChecklistDetailIssue = {
  id: string;
  checklistId: number;
  category: "color" | "text" | "shadow" | "mode" | "platform";
  nodeId: string;
  nodeName: string;
  detail: string;
};

type ChecklistFacts = {
  items: ChecklistItemResult[];
  colorDetails: ChecklistDetailIssue[];
  textIssues: ChecklistDetailIssue[];
  shadowIssues: ChecklistDetailIssue[];
  modeIssues: ChecklistDetailIssue[];
  platformIssues: ChecklistDetailIssue[];
};

// "가이드에 없는 색" 판정 임계값(ΔRGB 유클리드). 12 미만은 반올림 오차 수준으로 흡수.
const OFF_GUIDE_THRESHOLD = 12;

// 주어진 hex 와 가장 가까운 Foundation V2 색과의 거리(ΔRGB). 팔레트 존재 여부 판정용.
function nearestFoundationDistance(hex: string, v2All: V2Var[]): number {
  let best = 999;
  for (const v of v2All) {
    if (v.collectionName !== FOUNDATION_COLLECTION) continue;
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
      const hexByModeName: { [modeName: string]: string } = {};
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
          if (hex) {
            hexByMode[m.modeId] = hex;
            hexByModeName[m.name] = hex;
          }
        } catch {
          // skip
        }
      }
      const modeIds = Object.keys(hexByMode);
      v2.push({
        id: v.id, name: v.name, collectionName: col.name, hexByMode, hexByModeName,
        fallbackHex: modeIds.length ? hexByMode[modeIds[0]] : "",
        modeCount: col.modes.length,
      });
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

// 한 번의 검수 동안 변수 목록을 다시 읽지 않는다 — 화면 판정과 색 대조가 같은 목록을 쓴다.
let v2Cache: { v2: V2Var[]; v2CollectionIds: Set<string>; byHex: { [hex: string]: V2Var[] } } | null = null;

async function loadV2VarsCached() {
  if (!v2Cache) v2Cache = await loadV2Vars();
  return v2Cache;
}

let collectionsCache: VariableCollection[] | null = null;

async function loadCollectionsCached(): Promise<VariableCollection[]> {
  if (!collectionsCache) collectionsCache = await figma.variables.getLocalVariableCollectionsAsync();
  return collectionsCache;
}

function clearV2Cache(): void {
  v2Cache = null;
  collectionsCache = null;
}

// 화면이 라이트인지 다크인지 알고 난 뒤, **그 모드 값**으로만 hex 색인을 만든다.
// 종전에는 모든 모드 값을 한 바구니에 담아, 다크 화면인데 라이트 값이 같다는 이유로
// 엉뚱한 토큰을 "정확히 일치"로 권하는 일이 있었다.
function buildByHexForMode(v2: V2Var[], modeName: string): { [hex: string]: V2Var[] } {
  const byHex: { [hex: string]: V2Var[] } = {};
  for (const v of v2) {
    // 모드가 둘 이상인 컬렉션은 그 모드 값이 없으면 넘어간다 —
    // 여기서 반대쪽 모드 값을 끌어오면 고치려던 오제안이 그대로 되살아난다(🤖 검증 지적).
    const hex = v.modeCount > 1 ? v.hexByModeName[modeName] : (v.hexByModeName[modeName] || v.fallbackHex);
    if (!hex) continue;
    if (!byHex[hex]) byHex[hex] = [];
    if (byHex[hex].indexOf(v) === -1) byHex[hex].push(v);
  }
  return byHex;
}

// ── 화면 판정 (river 지시 2026-09-17) ──────────────────────────────────────
// 검사 결과를 내놓기 전에 "무엇을 보고 있는지"부터 정한다:
//   ① 화면 종류 — 선택한 틀의 가로 크기를 정본 breakpoint 토큰과 대조 (PC / 모바일)
//   ② 모드 — 그 틀에 실제로 걸리는 Semantic Color 모드 (Light / Dark)
//   ③ 톤 — 틀의 배경색이 정본 배경 토큰의 라이트 값인지 다크 값인지
// 셋 중 확인이 안 되는 것은 추측하지 않고 '미확인'으로 남긴다.
type ScreenContext = {
  rootId: string;
  rootName: string;
  width: number;
  platform: "PC" | "Mobile" | "unknown";
  platformReason: string;
  mode: string;                       // "Light" | "Dark" | "" (미확인)
  modeReason: string;
  tone: "light" | "dark" | "unknown";
  toneHex: string;
  toneMismatch: boolean;
  label: string;
};

const MOBILE_BREAKPOINT = FOUNDATION_NUMBER["breakpoint/md"];   // 정본 값(768) — 여기서 새로 정하지 않는다.

// 이 노드에 실제로 걸리는 모드 — 자기 고정 → 조상 고정 → 페이지 고정 → 컬렉션 기본값.
function pinnedModeId(node: BaseNode, collectionId: string, includeSelf: boolean): string | null {
  let cur: BaseNode | null = includeSelf ? node : node.parent;
  while (cur) {
    const pins = (cur as any).explicitVariableModes as { [collectionId: string]: string } | undefined;
    if (pins && pins[collectionId]) return pins[collectionId];
    if (cur.type === "PAGE" || cur.type === "DOCUMENT") break;
    cur = cur.parent;
  }
  return null;
}

// 틀의 배경색 — 맨 위에 보이는 단색 칠. 토큰에 연결된 칠인지도 함께 돌려준다.
//   토큰에 연결된 배경은 모드에 따라 값이 달라지므로, 그 값으로 톤을 판정하지 않는다.
//   (연결돼 있으면 모드는 이미 정확히 알고 있어 톤 판정이 더할 것이 없다.)
function backgroundPaintOf(node: SceneNode): { hex: string; bound: boolean } {
  if (!("fills" in node)) return { hex: "", bound: false };
  const fills = (node as any).fills;
  if (!Array.isArray(fills)) return { hex: "", bound: false };
  for (let i = fills.length - 1; i >= 0; i--) {
    const paint = fills[i];
    if (paint && paint.type === "SOLID" && paint.visible !== false) {
      const bound = !!(paint.boundVariables && paint.boundVariables.color);
      return { hex: rgbToHex(paint.color), bound };
    }
  }
  return { hex: "", bound: false };
}

async function detectScreenContext(rootsOverride?: readonly SceneNode[]): Promise<ScreenContext[]> {
  const roots = rootsOverride ? normalizeSelectionRoots(rootsOverride) : selectedRoots();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const semantic = collections.filter((col) => col.name === SEMANTIC_COLOR_COLLECTION)[0] || null;
  const { v2 } = await loadV2VarsCached();

  // 배경 역할 토큰의 모드별 값 — 톤 판정표. 정본에 있는 값만 쓴다(밝기 어림짐작 금지).
  const lightBg: { [hex: string]: true } = {};
  const darkBg: { [hex: string]: true } = {};
  for (const v of v2) {
    if (v.collectionName !== SEMANTIC_COLOR_COLLECTION) continue;
    if (v.name.toLowerCase().indexOf("color/bg/") !== 0) continue;
    const light = v.hexByModeName[LIGHT_MODE];
    const dark = v.hexByModeName[DARK_MODE];
    if (light) lightBg[light] = true;
    if (dark) darkBg[dark] = true;
  }

  const out: ScreenContext[] = [];
  for (const root of roots) {
    const width = "width" in root ? Math.round((root as any).width) : 0;
    // 화면 한 장을 통째로 골랐을 때만 종류를 말한다 — 버튼 하나를 골라 놓고
    // "모바일 화면"이라고 단정하지 않는다(🤖 검증 지적 2026-09-17).
    const parentType = root.parent ? root.parent.type : "";
    const isWholeScreen = (parentType === "PAGE" || parentType === "SECTION")
      && (root.type === "FRAME" || root.type === "COMPONENT" || root.type === "INSTANCE");
    let platform: ScreenContext["platform"] = "unknown";
    let platformReason = "가로 크기를 읽을 수 없어 화면 종류를 정하지 못했습니다";
    if (!isWholeScreen) {
      platformReason = "화면 한 장이 아니라 그 안의 일부를 골라, 화면 종류는 판정하지 않았습니다";
    } else if (width > 0) {
      platform = width >= MOBILE_BREAKPOINT ? "PC" : "Mobile";
      platformReason = `가로 ${width} — 정본 기준선 ${MOBILE_BREAKPOINT}(breakpoint/md) ${width >= MOBILE_BREAKPOINT ? "이상" : "미만"}`;
    }

    let mode = "";
    let modeReason = "Semantic Color 컬렉션이 이 파일에 없어 모드를 정하지 못했습니다";
    if (semantic) {
      const pinned = pinnedModeId(root, semantic.id, true);
      const effective = pinned || semantic.defaultModeId;
      const found = semantic.modes.filter((m) => m.modeId === effective)[0];
      mode = found ? found.name : "";
      modeReason = pinned
        ? `이 틀에 '${mode}' 모드가 지정돼 있습니다`
        : `따로 지정한 모드가 없어 기본값 '${mode}'로 봅니다`;
    }

    const bg = backgroundPaintOf(root);
    const toneHex = bg.bound ? "" : bg.hex;   // 토큰에 연결된 배경은 톤으로 판정하지 않는다.
    let tone: ScreenContext["tone"] = "unknown";
    if (toneHex) {
      const isLight = !!lightBg[toneHex];
      const isDark = !!darkBg[toneHex];
      if (isDark && !isLight) tone = "dark";
      else if (isLight && !isDark) tone = "light";
    }
    const toneMismatch = tone !== "unknown" && !!mode && tone !== mode.toLowerCase();

    const platformLabel = platform === "PC" ? "PC" : platform === "Mobile" ? "모바일"
      : isWholeScreen ? "화면 종류 미확인" : "화면 일부";
    const modeLabel = mode === DARK_MODE ? "다크" : mode === LIGHT_MODE ? "라이트" : "모드 미확인";
    out.push({
      rootId: root.id, rootName: root.name, width, platform, platformReason,
      mode, modeReason, tone, toneHex, toneMismatch,
      label: platform === "unknown" && !isWholeScreen
        ? `화면 일부 · ${modeLabel} 모드`
        : `${platformLabel} · ${modeLabel} 화면`,
    });
  }
  return out;
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

// 선택한 부모와 그 안의 자식이 함께 선택돼도 한 번만 검사한다.
// Cmd/Ctrl+A처럼 여러 최상위 노드를 선택한 경우에는 각 root를 그대로 포함한다.
function normalizeSelectionRoots(selection: readonly SceneNode[]): SceneNode[] {
  const selected = Array.from(selection);
  const ids = new Set(selected.map((n) => n.id));
  return selected.filter((node) => {
    let parent: BaseNode | null = node.parent;
    while (parent && parent.id !== figma.currentPage.id) {
      if (ids.has(parent.id)) return false;
      parent = parent.parent;
    }
    return true;
  });
}

function selectedRoots(): SceneNode[] {
  return normalizeSelectionRoots(figma.currentPage.selection);
}

function collectUniqueSelectedNodes(rootsOverride?: readonly SceneNode[]): SceneNode[] {
  const roots = rootsOverride ? Array.from(rootsOverride) : selectedRoots();
  const byId = new Map<string, SceneNode>();
  for (const root of roots) {
    const branch: SceneNode[] = [];
    walk(root, branch);
    for (const node of branch) byId.set(node.id, node);
  }
  return Array.from(byId.values());
}

const AUDIT_UNIT_NAME = /(^|[\s_\-/])(icon|ic|button|btn|아이콘|버튼)(?=$|[\s_\-/])/i;

function isVectorOnlyBranch(node: BaseNode): boolean {
  if (node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION") return true;
  if (!("children" in node)) return false;
  const children = Array.from((node as ChildrenMixin).children);
  return children.length > 0 && children.every((child) => isVectorOnlyBranch(child));
}

// 최하위 path가 아니라 사용자가 알아볼 수 있는 조작 단위로 결과를 묶는다.
// 우선순위: 가장 가까운 INSTANCE → 이름이 있는 icon/button 묶음 → vector-only 묶음 → 원래 노드.
function resolveAuditUnit(node: SceneNode): SceneNode {
  let cur: BaseNode | null = node;
  let vectorContainer: SceneNode | null = null;
  while (cur && cur.type !== "PAGE" && cur.type !== "DOCUMENT") {
    if (cur.type === "INSTANCE") return vectorContainer || cur as InstanceNode;
    if ("id" in cur && AUDIT_UNIT_NAME.test(cur.name || "")) return cur as SceneNode;
    if (
      "id" in cur &&
      (cur.type === "GROUP" || cur.type === "FRAME" || cur.type === "BOOLEAN_OPERATION") &&
      isVectorOnlyBranch(cur)
    ) vectorContainer = cur as SceneNode;
    cur = cur.parent;
  }
  return vectorContainer || node;
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
    if (v.collectionName !== SEMANTIC_COLOR_COLLECTION) continue;
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
      category: v.collectionName === FOUNDATION_COLLECTION ? "foundation" : categoryOf(v.name),
    });
    added.add(v.id);
  }

  // 3) Foundation 유사색 top 10 (색 거리)
  type Near = { v: V2Var; dist: number };
  const nears: Near[] = [];
  for (const v of v2All) {
    if (v.collectionName !== FOUNDATION_COLLECTION) continue;
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

async function audit(rootOverride?: SceneNode | readonly SceneNode[], modeName?: string): Promise<{ issues: Issue[]; stats: { scanned: number; issuesCount: number; highCount: number } }> {
  // rootOverride 를 주면 해당 노드들(예: 검사 시작 시점 선택 스냅샷)을 대상으로, 없으면 현재 선택 영역.
  const sel: readonly SceneNode[] = rootOverride
    ? (Array.isArray(rootOverride) ? rootOverride : [rootOverride as SceneNode])
    : selectedRoots();
  if (sel.length === 0) {
    return { issues: [], stats: { scanned: 0, issuesCount: 0, highCount: 0 } };
  }

  const { v2, v2CollectionIds, byHex: byHexAllModes } = await loadV2VarsCached();
  // 화면 모드를 알아냈으면 그 모드 값으로 만든 색인을 쓴다(모르면 종전대로 전 모드).
  const byHex = modeName ? buildByHexForMode(v2, modeName) : byHexAllModes;

  // 모든 자손 수집
  const allNodes = collectUniqueSelectedNodes(sel);

  const issues: Issue[] = [];
  const groupedIssues = new Map<string, Issue>();
  let issueCounter = 0;

  const pushGroupedIssue = (leaf: SceneNode, issue: Omit<Issue, "id" | "nodeId" | "nodeName" | "targets">) => {
    const unit = resolveAuditUnit(leaf);
    const key = [unit.id, issue.property, issue.reasonKind, issue.hex, issue.sourceLabel].join("|");
    const target = { nodeId: leaf.id, property: issue.property, paintIndex: issue.paintIndex };
    const existing = groupedIssues.get(key);
    if (existing) {
      if (!existing.targets) existing.targets = [];
      if (!existing.targets.some((item) => item.nodeId === target.nodeId && item.property === target.property && item.paintIndex === target.paintIndex)) {
        existing.targets.push(target);
      }
      return;
    }
    const created: Issue = {
      ...issue,
      id: "i" + (++issueCounter),
      nodeId: unit.id,
      nodeName: unit.name,
      targets: [target],
    };
    groupedIssues.set(key, created);
    issues.push(created);
  };

  for (const n of allNodes) {
    if (isDummyChromePart(n)) continue;   // 더미 크롬(상태바·내비바/키보드·웹 탭바)은 검수 대상이 아니다
    const ctx = getComponentContext(n);
    const kind = classifyNode(n);
    for (const prop of ["fills", "strokes"] as const) {
      if (!(prop in n)) continue;
      const arr = (n as any)[prop];
      if (!Array.isArray(arr)) continue;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        if (!p || p.type !== "SOLID") continue;
        // 그리지 않는 색은 가이드 위반이 될 수 없다 — 검수 대상에서 뺀다(river 지적 2026-09-21).
        //   ① 꺼 둔 칠·불투명도 0: 화면에 아무것도 안 그린다.
        //   ② 마스크 도형의 칠·선: 색이 아니라 '가릴 모양'이다. 토큰으로 바꿀 것이 아니다.
        if (p.visible === false || p.opacity === 0) continue;
        let isMaskShape = false;
        try { isMaskShape = (n as any).isMask === true; } catch (e) { /* isMask 가 없는 노드 */ }
        if (isMaskShape) continue;   // 칠·선 모두 — 마스크는 선도 '가릴 모양'에 기여한다
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
          pushGroupedIssue(n, {
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
          pushGroupedIssue(n, {
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

// 1차 체크리스트의 토큰·텍스트·그림자 사실을 읽기 전용으로 수집한다.
// 컴포넌트 항목은 별도 교체 후보 스캐너가 담당하므로 여기서는 1~9번만 반환한다.
async function auditChecklistFacts(colorIssues: Issue[], rootsOverride?: readonly SceneNode[], context?: ScreenContext | null): Promise<ChecklistFacts> {
  const nodes = collectUniqueSelectedNodes(rootsOverride);
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionById = new Map(collections.map((c) => [c.id, c.name]));
  const variableCache = new Map<string, Variable | null>();
  const styleCache = new Map<string, BaseStyle | null>();
  const getVariable = async (id: string) => {
    if (!variableCache.has(id)) variableCache.set(id, await figma.variables.getVariableByIdAsync(id));
    return variableCache.get(id) || null;
  };
  /** 토큰 **자신이** 반투명한 색인가 — 그렇다면 그 불투명도는 사람이 덧씌운 값이 아니다.
   *  정본 `color/overlay` 가 rgba(0,0,0,0.5) 라서, Figma 가 그 알파를 paint.opacity 로 풀어 준다.
   *  그것을 "불투명도를 임의로 만졌다"고 잡으면 정본 토큰을 제대로 쓴 화면이 오류로 뜬다
   *  (river 지적 2026-09-21 — 모달 오버레이). 별칭(alias)은 끝까지 따라간다. */
  //  ⚠️ **모드마다 값이 다르다** — `color/overlay` 는 라이트 50% · 다크 75% 다. 한쪽만 보고 끊으면
  //     반대쪽 화면의 정상 딤이 그대로 오류로 뜬다(🤖 component-verifier 적발 2026-09-21).
  //     그래서 모든 모드의 알파를 모아 **하나라도 맞으면** 정본 값으로 본다.
  const alphaCache = new Map<string, number[]>();
  const variableAlphas = async (v: Variable | null, depth = 0): Promise<number[]> => {
    if (!v || depth > 4) return [];
    const hit = alphaCache.get(v.id);
    if (hit !== undefined) return hit;
    const out: number[] = [];
    try {
      const byMode: any = (v as any).valuesByMode || {};
      for (const modeId of Object.keys(byMode)) {
        const val: any = byMode[modeId];
        if (val && val.type === "VARIABLE_ALIAS") {
          for (const a of await variableAlphas(await getVariable(val.id), depth + 1)) out.push(a);
          continue;
        }
        if (val && typeof val.a === "number" && val.a < 0.999) out.push(val.a);
      }
    } catch (e) { /* 값을 못 읽으면 알파 없음으로 본다 */ }
    alphaCache.set(v.id, out);
    return out;
  };
  const getStyle = async (id: string) => {
    if (!styleCache.has(id)) styleCache.set(id, await figma.getStyleByIdAsync(id));
    return styleCache.get(id) || null;
  };
  const colorDetails: ChecklistDetailIssue[] = [];
  const textIssues: ChecklistDetailIssue[] = [];
  const shadowIssues: ChecklistDetailIssue[] = [];
  const canonicalTextStyleNames = new Set(TEXT_STYLES.map((style) => style.name));
  const canonicalShadowGroups: Array<ReturnType<typeof parseCssShadow>> = [];
  for (const entry of Object.values(SEMANTIC_SHADOW)) {
    canonicalShadowGroups.push(parseCssShadow(entry.light), parseCssShadow(entry.dark));
  }
  const near = (a: number, b: number) => Math.abs(a - b) < 0.001;
  const shadowGroupMatchesCanon = (effects: any[]) => canonicalShadowGroups.some((group) => {
    if (group.length !== effects.length) return false;
    return group.every((layer, index) => {
      const effect = effects[index];
      if (!effect || effect.type !== "DROP_SHADOW") return false;
      return near(effect.offset.x, layer.offsetX) && near(effect.offset.y, layer.offsetY) &&
        near(effect.radius, layer.blur) && near(effect.spread || 0, layer.spread) &&
        near(effect.color.r, layer.color.r) && near(effect.color.g, layer.color.g) &&
        near(effect.color.b, layer.color.b) && near(effect.color.a, layer.color.a);
    });
  });
  let detailSeq = 0;
  const detailSeen = new Set<string>();
  const add = (
    target: ChecklistDetailIssue[], checklistId: number, category: ChecklistDetailIssue["category"],
    node: SceneNode, detail: string,
  ) => {
    const unit = resolveAuditUnit(node);
    const key = `${checklistId}|${unit.id}`;
    if (detailSeen.has(key)) return;
    detailSeen.add(key);
    target.push({ id: `c${checklistId}-${++detailSeq}`, checklistId, category, nodeId: unit.id, nodeName: unit.name, detail });
  };

  // 1. 색 변수 바인딩 — 기존 색 엔진의 미바인딩 결과만 사용한다.
  for (const issue of colorIssues) {
    if (issue.reasonKind !== "unbound-hex") continue;
    const node = await figma.getNodeByIdAsync(issue.nodeId);
    if (node && "type" in node) add(colorDetails, 1, "color", node as SceneNode, `${issue.property} ${issue.hex}가 변수에 연결되지 않음`);
  }

  // 2~4. 색 계층, 로컬 스타일, opacity 변형.
  for (const node of nodes) {
    if (isDummyChromePart(node)) continue;   // 더미 크롬(상태바·내비바/키보드·웹 탭바)은 체크리스트 검수에서도 제외
    for (const prop of ["fills", "strokes"] as const) {
      if (!(prop in node)) continue;
      const paints = (node as any)[prop];
      if (!Array.isArray(paints)) continue;
      for (const paint of paints) {
        if (!paint || paint.type !== "SOLID") continue;
        const bound = paint.boundVariables && paint.boundVariables.color;
        if (bound) {
          const variable = await getVariable(bound.id);
          const colName = variable ? collectionById.get(variable.variableCollectionId) : undefined;
          // 브랜드 색(brand/*)은 Semantic 대응이 없다 — 로고·CI 는 Foundation 을 그대로 쓸 수밖에 없다.
          //   (river 2026-09-21: "컴포넌트와 달리 로고같은 것은 파운데이션 값을 그대로 사용할 수 밖에 없어")
          const isBrandVar = !!variable && variable.name.slice(0, 6) === "brand/";
          // 컴포넌트 세트 **자신의 바탕**은 부품 색이 아니라 라이브러리 진열면이다.
          //   CI 세트는 흰 로고가 묻히지 않게 정본이 일부러 Foundation gray/50 을 직접 건다
          //   (build-components.ts — 사용자 결정 2026-06-25). 그 자리를 오류로 잡지 않는다.
          const isSetSurface = String(node.type) === "COMPONENT_SET";
          if (colName === FOUNDATION_COLLECTION && !isBrandVar && !isSetSurface) {
            add(colorDetails, 2, "color", node, `Foundation 변수 ${variable!.name} 직접 사용`);
          }
          if (typeof paint.opacity === "number" && paint.opacity < 0.999) {
            // 토큰 자신이 반투명하면(overlay 등) 그 불투명도는 정본 값이지 임의 변형이 아니다.
            const tokenAlphas = await variableAlphas(variable);
            const fromToken = tokenAlphas.some((a) => Math.abs(a - paint.opacity) < 0.02);
            if (!fromToken) {
              add(colorDetails, 4, "color", node, `변수 색에 불투명도 ${Math.round(paint.opacity * 100)}% 적용`);
            }
          }
        }
      }
    }

    for (const prop of ["fillStyleId", "strokeStyleId", "textStyleId"] as const) {
      if (!(prop in node)) continue;
      const styleId = (node as any)[prop];
      if (typeof styleId !== "string" || !styleId) continue;
      const style = await getStyle(styleId);
      const isCanonicalLocalTextStyle = prop === "textStyleId" && style && style.type === "TEXT" && canonicalTextStyleNames.has(style.name);
      if (style && !style.remote && !isCanonicalLocalTextStyle) {
        const category = prop === "textStyleId" ? "text" : "color";
        add(category === "text" ? textIssues : colorDetails, category === "text" ? 5 : 3, category, node, `라이브러리가 아닌 로컬 스타일 ${style.name} 사용`);
      }
    }

    if (node.type === "TEXT") {
      const textNode = node as TextNode;
      const textStyleId = textNode.textStyleId;
      if (typeof textStyleId !== "string" || !textStyleId) {
        add(textIssues, 5, "text", node, "text style 미적용 또는 혼합 적용");
      }

      const fontSize = textNode.fontSize;
      const allowedSizes = new Set(TEXT_STYLES.map((s) => s.fontSize));
      if (typeof fontSize === "number" && !allowedSizes.has(fontSize)) {
        add(textIssues, 6, "text", node, `정의 밖 폰트 크기 ${fontSize}px`);
      }

      if (typeof textStyleId === "string" && textStyleId) {
        const style = await getStyle(textStyleId);
        if (style && style.type === "TEXT") {
          const textStyle = style as TextStyle;
          const overridden =
            (typeof textNode.fontSize === "number" && textNode.fontSize !== textStyle.fontSize) ||
            (textNode.fontName !== figma.mixed && JSON.stringify(textNode.fontName) !== JSON.stringify(textStyle.fontName)) ||
            (textNode.lineHeight !== figma.mixed && JSON.stringify(textNode.lineHeight) !== JSON.stringify(textStyle.lineHeight)) ||
            (textNode.letterSpacing !== figma.mixed && JSON.stringify(textNode.letterSpacing) !== JSON.stringify(textStyle.letterSpacing));
          if (overridden) add(textIssues, 7, "text", node, `text style ${textStyle.name} 값 덮어쓰기`);
        }
      }

      const fontName = textNode.fontName;
      if (fontName === figma.mixed) {
        const families = textNode.getRangeAllFontNames(0, textNode.characters.length).map((font) => font.family);
        const nonPretendard = families.find((family) => family !== TEXT_STYLE_FONT_FAMILY);
        if (nonPretendard) add(textIssues, 8, "text", node, `${nonPretendard} 등 Pretendard가 아닌 글꼴이 섞여 있음`);
      } else if (fontName.family !== TEXT_STYLE_FONT_FAMILY) {
        add(textIssues, 8, "text", node, `${fontName.family} 사용`);
      }
    }

    if ("effects" in node && Array.isArray((node as any).effects)) {
      const shadows = (node as any).effects.filter((effect: any) =>
        effect && effect.visible !== false && (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW")
      );
      if (shadows.length > 0 && !shadowGroupMatchesCanon(shadows)) {
        add(shadowIssues, 9, "shadow", node, "가이드에 등록되지 않은 그림자 사용");
      }
    }
  }

  // 10. 모드 고정 — 선택 영역 **안쪽** 노드에 라이트/다크 모드가 박혀 있으면,
  //     화면을 통째로 뒤집어도 그 부분만 따라오지 않는다(river 결정 2026-09-17 — 고정 먼저 잡기).
  //     선택한 최상위 노드 자신의 고정은 "이 화면을 다크로 본다"는 정상 사용이라 제외한다.
  //     **바깥과 실제로 어긋난 고정만 보고한다(river 결정 2026-09-21).** 바깥과 같은 모드로 박힌
  //     것은 지금 어긋나 있지 않으므로 알리지 않는다 — 부품 세트가 라이트 기준이라 그런 고정이
  //     대량으로 붙고, 그걸 전부 띄우면 진짜 어긋난 한 건이 목록에 묻힌다.
  const modeIssues: ChecklistDetailIssue[] = [];
  {
    const rootIds = new Set((rootsOverride ? normalizeSelectionRoots(rootsOverride) : selectedRoots()).map((node) => node.id));
    // 모드가 2개 이상인 V2 컬렉션만 본다 — 단일 Default 모드(Foundation)는 고정해도 바뀔 것이 없다.
    const themedCols = collections.filter((col) => V2_COLLECTION_NAMES.indexOf(col.name) >= 0 && col.modes.length > 1);
    const modeNameOf = (col: VariableCollection, modeId: string | null) => {
      if (!modeId) return "";
      const found = col.modes.filter((m) => m.modeId === modeId)[0];
      return found ? found.name : "";
    };
    // 이 노드가 고정을 걷어냈을 때 따라갔을 모드 — 가장 가까운 조상의 고정, 없으면 컬렉션 기본값.
    const inheritedModeId = (node: SceneNode, collectionId: string): string | null => pinnedModeId(node, collectionId, false);
    // 화면 모드를 알면 문구를 그 기준으로 쓴다 — "이 화면은 다크인데 이 부분만 라이트".
    const screenModeLabel = context && context.mode === DARK_MODE ? "다크" : context && context.mode === LIGHT_MODE ? "라이트" : "";
    let modeSeq = 0;
    for (const node of nodes) {
      if (rootIds.has(node.id)) continue;
      if (isDummyChromePart(node)) continue;
      const pins = (node as any).explicitVariableModes as { [collectionId: string]: string } | undefined;
      if (!pins) continue;
      // 한 노드가 컬렉션 두 곳에 고정돼 있을 수 있다. 보고는 한 번만 하고,
      // 바깥과 어긋난 고정이 하나라도 있으면 그것을 고른다(🤖 검증 지적 2026-09-17).
      let pickedDetail = "";
      for (const col of themedCols) {
        const pinned = pins[col.id];
        if (!pinned) continue;
        const inherited = inheritedModeId(node, col.id) || col.defaultModeId;
        if (pinned === inherited) continue; // 바깥과 같다 = 지금 어긋나 있지 않다
        const pinnedName = modeNameOf(col, pinned) || "고정";
        const inheritedName = modeNameOf(col, inherited) || "바깥";
        const pinnedLabel = pinnedName === DARK_MODE ? "다크" : pinnedName === LIGHT_MODE ? "라이트" : pinnedName;
        pickedDetail = screenModeLabel
          ? `이 화면은 ${screenModeLabel}인데 이 부분만 ${pinnedLabel}로 박혀 있어 안 바뀝니다`
          : `'${pinnedName}' 모드로 고정 — 바깥은 '${inheritedName}'이라 이 부분만 안 바뀝니다`;
        break;
      }
      if (!pickedDetail) continue;
      modeIssues.push({
        id: `c10-${++modeSeq}`, checklistId: 10, category: "mode",
        nodeId: node.id, nodeName: node.name, detail: pickedDetail,
      });
    }
  }

  // 11. 화면 종류에 맞는 변형 — 모바일 화면인데 PC용 변형을 쓰고 있는(또는 그 반대) 부품.
  //     화면 종류를 못 정했으면 판정하지 않는다(추측 금지).
  const platformIssues: ChecklistDetailIssue[] = [];
  if (context && (context.platform === "PC" || context.platform === "Mobile")) {
    const screenLabel = context.platform === "PC" ? "PC" : "모바일";
    // 세트에 그 화면 종류의 변형이 실제로 있는지 — 없으면 "바꿔라"가 아니라 "전용 부품"이다.
    const setHasPlatform = new Map<string, boolean>();
    for (const node of nodes) {
      if (node.type !== "INSTANCE") continue;
      if (isDummyChromePart(node)) continue;
      const vp = (node as InstanceNode).variantProperties || {};
      const used = vp["Platform"];
      if (used !== "PC" && used !== "Mobile") continue;   // App·Web(기기 크롬) 축은 화면 종류와 다른 축이다.
      if (used === context.platform) continue;
      const main = await (node as InstanceNode).getMainComponentAsync();
      const set = main && main.parent && main.parent.type === "COMPONENT_SET" ? (main.parent as ComponentSetNode) : null;
      let hasTarget = false;
      if (set) {
        const cacheKey = `${set.id}|${context.platform}`;
        if (setHasPlatform.has(cacheKey)) {
          hasTarget = !!setHasPlatform.get(cacheKey);
        } else {
          hasTarget = set.children.some((child) =>
            child.type === "COMPONENT" && ((child as ComponentNode).variantProperties || {})["Platform"] === context.platform);
          setHasPlatform.set(cacheKey, hasTarget);
        }
      }
      const usedLabel = used === "PC" ? "PC" : "모바일";
      platformIssues.push({
        id: `c11-${platformIssues.length + 1}`, checklistId: 11, category: "platform",
        nodeId: node.id, nodeName: node.name,
        detail: hasTarget
          ? `${screenLabel} 화면인데 ${usedLabel}용 변형을 쓰고 있습니다 — ${screenLabel}용 변형이 있습니다`
          : `${usedLabel} 전용 부품입니다 — ${screenLabel} 화면에 쓰는 것이 맞는지 확인하세요`,
      });
    }
  }

  const allDetails = [...colorDetails, ...textIssues, ...shadowIssues, ...modeIssues, ...platformIssues];
  const count = (id: number) => allDetails.filter((issue) => issue.checklistId === id).length;
  const items: ChecklistItemResult[] = [
    { id: 1, count: count(1), status: count(1) ? "fail" : "pass", coverage: "full" },
    { id: 2, count: count(2), status: count(2) ? "warning" : "pass", coverage: "full" },
    { id: 3, count: count(3), status: count(3) ? "fail" : "pass", coverage: "full" },
    { id: 4, count: count(4), status: count(4) ? "warning" : "pass", coverage: "partial" },
    { id: 5, count: count(5), status: count(5) ? "fail" : "pass", coverage: "full" },
    { id: 6, count: count(6), status: count(6) ? "choice" : "pass", coverage: "partial" },
    { id: 7, count: count(7), status: count(7) ? "fail" : "pass", coverage: "partial" },
    { id: 8, count: count(8), status: count(8) ? "fail" : "pass", coverage: "full" },
    { id: 9, count: count(9), status: count(9) ? "fail" : "pass", coverage: "partial" },
    { id: 10, count: count(10), status: count(10) ? "warning" : "pass", coverage: "full" },
    {
      id: 11,
      count: count(11),
      status: context && (context.platform === "PC" || context.platform === "Mobile")
        ? (count(11) ? "warning" : "pass")
        : "unjudged",
      coverage: "full",
    },
  ];
  return { items, colorDetails, textIssues, shadowIssues, modeIssues, platformIssues };
}

async function applyOne(issue: Issue, suggestionIndex: number): Promise<boolean> {
  const sug = issue.suggestions[suggestionIndex];
  if (!sug) return false;
  const v2 = await figma.variables.getVariableByIdAsync(sug.variableId);
  if (!v2) return false;
  const targets = issue.targets && issue.targets.length
    ? issue.targets
    : [{ nodeId: issue.nodeId, property: issue.property, paintIndex: issue.paintIndex }];
  const grouped = new Map<string, { node: BaseNode; property: "fills" | "strokes"; original: any[]; next: any[] }>();
  for (const target of targets) {
    const node = await figma.getNodeByIdAsync(target.nodeId);
    if (!node) return false;
    const key = `${target.nodeId}|${target.property}`;
    let group = grouped.get(key);
    if (!group) {
      const arr = (node as any)[target.property];
      if (!Array.isArray(arr)) return false;
      group = {
        node,
        property: target.property,
        original: JSON.parse(JSON.stringify(arr)),
        next: JSON.parse(JSON.stringify(arr)),
      };
      grouped.set(key, group);
    }
    const paint = group.next[target.paintIndex];
    if (!paint || paint.type !== "SOLID") return false;
    group.next[target.paintIndex] = figma.variables.setBoundVariableForPaint(paint, "color", v2);
  }

  const applied: Array<{ node: BaseNode; property: "fills" | "strokes"; original: any[] }> = [];
  for (const group of grouped.values()) {
    try {
      (group.node as any)[group.property] = group.next;
      applied.push({ node: group.node, property: group.property, original: group.original });
    } catch {
      // 한 단위 안에서 일부만 바뀐 상태를 남기지 않는다.
      for (const prior of applied.reverse()) {
        try { (prior.node as any)[prior.property] = prior.original; } catch {}
      }
      return false;
    }
  }
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
  const semantic = collections.find((c) => c.name === SEMANTIC_COLOR_COLLECTION);
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

// 이 파일 안에 정본과 **이름이 같은 세트가 둘 이상** 있던 것들(검수가 헷갈릴 수 있는 자리).
let REFERENCE_NAME_CLASHES: string[] = [];
function isClashingName(name?: string | null): boolean {
  return REFERENCE_NAME_CLASHES.indexOf(refNameKey(name)) >= 0;
}

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
  medium?: ScreenMedium;      // 이 검수 자료가 모바일 화면인가 PC 화면인가
  mediumWhy?: string;         // 그렇게 본 까닭(사람 말)
  selectionCount: number;
  instanceCount: number;
  referencePoolSize: number;
  matchedNameCount: number;    // mainComponent 이름이 기준 풀에 있는 인스턴스 수
  sameIdSkippedCount: number;  // 같은 컴포넌트라서 스킵된 수
  skippedNestedCount: number;  // 인스턴스 내부(하위레이어)라 교체 불가로 제외된 수
  noMatchCount: number;        // 기준 풀에 대응 이름이 없어 대상에서 빠진 수
  skippedInstallerRemoteCount: number; // 설치기가 심는 외부 라이브러리 부품(아이콘 등)이라 제외된 수
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
type MappingSuggestion = { id: string; key: string; type: "COMPONENT" | "COMPONENT_SET"; name: string; source?: string; score: number; decided?: boolean };
// 여러 부품이 뭉친 큰 모듈의 보조 판정 임계. 핵심 판정은 아래의
// "같은 최신 부품이 2개 이상 들어 있는가"이며, 이름(m_button 등)은 예외로 쓰지 않는다.
const MODULE_NESTED_THRESHOLD = 5;
// 모듈 안에 들어 있는 부품 1개. 묶음은 통째로 교체하지 않지만, **부품 단위로는 검수·교체한다.**
//   · canonical = 이미 정본 부품 (할 일 없음)
//   · auto      = 대응 정본을 찾음 → 교체 가능
//   · manual    = 이름이 달라 자동 선정 불가 → 사용자가 정본을 골라 교체
//   · raw       = 인스턴스가 아닌 그림/프레임 → 교체 불가, 정본 부품을 옆에 가져와 재구성
type ModulePartKind = "canonical" | "auto" | "manual" | "raw";
type ModulePart = {
  id: string;
  nodeId: string;
  nodeName: string;
  currentMainName: string;
  kind: ModulePartKind;
  path: number[];                    // 모듈 루트 기준 자식 순번 — 묶음을 푼 뒤 같은 부품을 다시 찾는 길
  suggestions: MappingSuggestion[];  // auto 면 [0] 이 자동 선정된 정본
  note?: string;
  decision?: LegacyVerdict;          // 결정표가 무어라 답했나
  decidedMissing?: boolean;          // 결정된 정본이 아직 이 파일에 없다
  needsCheck?: string;               // 한 번에 돌리면 안 되는 사유(이름 겹침 등) — 있으면 «모두 교체»에서 뺀다
};
type ModuleFlag = { id: string; instanceId: string; instanceName: string; currentMainName: string; currentMainPath: string; nestedCount: number; repeatedPartName?: string; repeatedPartCount?: number; multiPartNote?: string; parts: ModulePart[]; detached?: boolean };

// ─── 다중 부품 구조 감지 (이름 매칭과 무관) ───────────────────────────
// 레거시 세트(예: m_button)에는 버튼 1개짜리·2개짜리 변형이 섞여 있다.
// 2개짜리를 정본 부품 "하나"로 교체하면 버튼 하나가 통째로 사라진다.
// 내부 조각이 인스턴스가 아니거나(원시 프레임) 이름이 정본과 달라
// 위의 "같은 최신 부품 2개" 판정을 통과 못 하는 경우가 있으므로,
// 구조로도 판정한다: "채움/테두리 + 텍스트"를 가진 부품 모양 가지가
// 비슷한 높이로 2개 이상 나란히 있으면 통째 교체 후보에서 제외한다.
function hasVisiblePaint(n: SceneNode): boolean {
  const visiblePaint = (ps: unknown) =>
    Array.isArray(ps) && ps.some((p) => p && (p as Paint).visible !== false && ((p as SolidPaint).opacity === undefined || ((p as SolidPaint).opacity as number) > 0));
  const g = n as Partial<GeometryMixin>;
  return visiblePaint(g.fills) || visiblePaint(g.strokes);
}
function containsVisibleText(n: SceneNode): boolean {
  if (n.visible === false) return false;
  if (n.type === "TEXT") return true;
  if ("children" in n) {
    for (const c of (n as SceneNode & ChildrenMixin).children) if (containsVisibleText(c)) return true;
  }
  return false;
}
// 최상위 "부품 모양" 가지를 모은다. 단, 채움 있는 컨테이너 안에 다시
// 부품 모양이 2개 이상 들어 있으면 컨테이너 대신 그 안쪽 가지들을 센다.
function collectPartLikeBranches(n: SceneNode, acc: SceneNode[]): void {
  if (n.visible === false) return;
  const frameLike = n.type === "FRAME" || n.type === "COMPONENT" || n.type === "INSTANCE" || n.type === "GROUP";
  if (frameLike && hasVisiblePaint(n) && containsVisibleText(n)) {
    const inner: SceneNode[] = [];
    if ("children" in n) for (const c of (n as SceneNode & ChildrenMixin).children) collectPartLikeBranches(c, inner);
    if (inner.length >= 2) { for (const b of inner) acc.push(b); } else acc.push(n);
    return;
  }
  if ("children" in n) for (const c of (n as SceneNode & ChildrenMixin).children) collectPartLikeBranches(c, acc);
}
// 비슷한 높이(오차 max(4px, 15%))로 묶었을 때 가장 큰 묶음의 크기.
// 2 이상이면 "같은 부품이 여러 개"(버튼 두 개짜리 등)로 본다.
// 높이가 다른 조각들(카드의 제목줄+본문 등)은 반복 부품으로 치지 않는다.
function countSimilarSizedParts(inst: InstanceNode): number {
  const acc: SceneNode[] = [];
  for (const c of inst.children) collectPartLikeBranches(c, acc);
  if (acc.length < 2) return acc.length;
  const hs = acc
    .map((b) => (b as SceneNode & LayoutMixin).height)
    .filter((h) => typeof h === "number" && h > 0)
    .sort((a, b) => a - b);
  let best = hs.length > 0 ? 1 : 0, run = 1;
  for (let i = 1; i < hs.length; i++) {
    if (hs[i] - hs[i - 1] <= Math.max(4, hs[i] * 0.15)) { run++; if (run > best) best = run; }
    else run = 1;
  }
  return best;
}
// ─── 검수 자료의 매체(모바일/PC) 판정 ──────────────────────────────────
// 모바일 화면을 검수하는데 PC 전용 크기까지 목록에 늘어놓으면 고르기만 어려워진다(river 2026-09-17).
// 판정 근거는 두 가지뿐이다:
//   ① 화면 안 부품들에 걸린 **river 결정**이 Break(PC/Mobile) 를 정해 두었나 — 가장 확실한 근거
//   ② 그것이 없으면 **고른 프레임의 폭** — 정본 모바일 프레임이 360 이므로 그 언저리는 모바일로 본다
// 어느 쪽으로도 알 수 없으면 **감추지 않는다**(잘못 감추는 것이 더 나쁘다).
type ScreenMedium = "mobile" | "pc" | null;
type MediumGuess = { medium: ScreenMedium; why: string };
const MOBILE_MAX_WIDTH = 600;   // 이보다 좁으면 모바일 화면으로 본다(정본 모바일 폭 360 기준)

function mediumFromAxes(axes: { [k: string]: string }): ScreenMedium {
  for (const [axis, value] of Object.entries(axes || {})) {
    if (normAxisName(axis) !== "break") continue;
    const v = (value || "").toLowerCase();
    if (v === "mobile") return "mobile";
    if (v === "pc") return "pc";
  }
  return null;
}

function detectMedium(roots: readonly BaseNode[], votes: ScreenMedium[]): MediumGuess {
  let mobile = 0, pc = 0;
  for (const v of votes) { if (v === "mobile") mobile++; else if (v === "pc") pc++; }
  // 한 표로 뒤집히지 않게 — 이긴 쪽이 2표 이상이고 진 쪽의 두 배는 되어야 «표» 로 친다.
  let byVote: ScreenMedium = null;
  if (mobile >= 2 && mobile >= pc * 2) byVote = "mobile";
  else if (pc >= 2 && pc >= mobile * 2) byVote = "pc";

  let width = 0;
  for (const r of roots) {
    const w = (r as SceneNode & LayoutMixin).width;
    if (typeof w === "number" && w > width) width = w;
  }
  const byWidth: ScreenMedium = width ? (width <= MOBILE_MAX_WIDTH ? "mobile" : "pc") : null;

  // 둘이 어긋나면 **감추지 않는다**. 잘못 감추는 것이 조금 어수선한 것보다 나쁘다.
  if (byVote && byWidth && byVote !== byWidth) return { medium: null, why: "" };
  const medium = byVote || byWidth;
  if (!medium) return { medium: null, why: "" };
  const label = medium === "mobile" ? "모바일" : "PC";
  if (byVote) return { medium, why: `화면 안 부품 ${medium === "mobile" ? mobile : pc}개에 걸린 결정이 ${label} 을 가리킵니다` };
  return { medium, why: `고른 화면 폭이 ${Math.round(width)} 이라 ${label} 로 봤습니다` };
}

// ─── 레거시 이름 결정표 판독 ───────────────────────────────────────────
// river 결정 23건(+ 레거시 속성표)을 구워 실은 표를 **글자 유사도보다 먼저** 본다.
// 유사도는 "비슷해 보인다"는 짐작이고, 이 표는 "사람이 정했다"는 사실이다.
// 표에 답이 없으면 지어내지 않는다 — 그대로 «아직 안 정함» 으로 사람에게 올린다(하드룰 H6②).
type LegacyVerdictKind = "decided" | "undecided" | "not-a-part" | "ambiguous";
type LegacyVerdict = {
  kind: LegacyVerdictKind;
  legacy: string;                              // 사람이 읽는 레거시 표기 (예: "A:pc_button")
  role: string;
  canonSets: string[];                         // 정해진 정본 세트(여럿이면 그 안에서 사람이 고른다)
  axes: { [canonAxis: string]: string };       // 이 인스턴스의 변형에서 정해진 정본 축 값
  basis: { id: string; what: string; quote: string }[];
  notes: { from: string; then: { [canonAxis: string]: string } }[];   // 조건을 몰라 자동으로 걸지 않는 결정 메모
  why: string;
  choices?: { source: string; set: string; setId: string | null; canonSets: string[] }[];  // 이름이 겹칠 때
};

const LEGACY_INDEX: { [norm: string]: LegacyMapEntry[] } = (() => {
  const m: { [norm: string]: LegacyMapEntry[] } = {};
  for (const e of LEGACY_MAP) {
    const k = normalizeName(e.set);
    if (!k) continue;
    (m[k] = m[k] || []).push(e);
  }
  return m;
})();

function sameLegacyValue(a: string, b: string): boolean {
  return (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
}

// 규칙 하나가 이 인스턴스에 걸리는가. 조건이 비어 있으면 그 세트에는 언제나 걸린다.
function legacyRuleHits(rule: LegacyMapEntry["rules"][number], vp: { [k: string]: string } | null): boolean {
  // 조건이 없는 규칙은 «언제나 걸린다» 가 아니라 «걸리지 않는다» 로 읽는다.
  // 조건을 모르는 것을 모두에 걸면 안 눌린 라디오가 «선택됨» 이 된다(🤖 독립 검증 2026-09-17).
  if (!rule.when.length) return false;
  if (!vp) return false;
  return rule.when.every((cond) => {
    if (cond.axis) {
      const key = Object.keys(vp).find((a) => normAxisName(a) === normAxisName(cond.axis as string));
      return !!key && sameLegacyValue(vp[key], cond.value);
    }
    return Object.keys(vp).some((a) => sameLegacyValue(vp[a], cond.value));
  });
}

// 걸리는 규칙을 모아 정본 축 값을 정한다. 조건이 많이 맞는 규칙이 이긴다(구체적인 것이 우선).
function applyLegacyRules(entry: LegacyMapEntry, vp: { [k: string]: string } | null): { axes: { [k: string]: string }; set: string | null } {
  const hits = (entry.rules || []).filter((r) => legacyRuleHits(r, vp)).sort((a, b) => a.when.length - b.when.length);
  const axes: { [k: string]: string } = {};
  let set: string | null = null;
  for (const r of hits) {
    for (const [axis, value] of Object.entries(r.then)) axes[axis] = value;
    if (r.set) set = r.set;
  }
  if (!set && entry.canonSets.length === 1) set = entry.canonSets[0];
  return { axes, set };
}

/**
 * 레거시 이름 하나를 결정표에 물어본다. 이름이 표에 없으면 null(= 표가 다루지 않는 것).
 * 같은 이름이 여러 줄인데 붙는 곳이 다르면 조용히 첫 것을 고르지 않는다 — 노드 id 로 되묻는다.
 */
function lookupLegacyDecision(names: string[], vp: { [k: string]: string } | null): LegacyVerdict | null {
  for (const name of names) {
    const rows = LEGACY_INDEX[normalizeName(name || "")];
    if (!rows || !rows.length) continue;

    const signature = (e: LegacyMapEntry) => `${e.kind}|${e.canonSets.join("+")}`;
    const distinct = rows.filter((e, i) => rows.findIndex((o) => signature(o) === signature(e)) === i);
    if (distinct.length > 1) {
      return {
        kind: "ambiguous",
        legacy: rows.map((e) => `${e.source}:${e.set}`)[0],
        role: rows[0].role || "",
        canonSets: [],
        axes: {},
        basis: [],
        notes: [],
        why: "같은 이름의 레거시 부품이 여러 개이고 붙는 곳이 다릅니다 — 어느 것인지 밝혀야 합니다.",
        choices: rows.map((e) => ({ source: e.source, set: e.set, setId: e.setId, canonSets: e.canonSets })),
      };
    }

    const entry = rows[0];
    const applied = entry.kind === "decided" ? applyLegacyRules(entry, vp) : { axes: {}, set: null };
    const canonSets = applied.set ? [applied.set] : entry.canonSets;
    return {
      kind: entry.kind,
      legacy: `${entry.source}:${entry.set}`,
      role: entry.role || "",
      canonSets,
      axes: applied.axes,
      basis: entry.basis || [],
      notes: (entry.notes || []).map((n) => ({ from: n.from, then: n.then })),
      why: entry.why || entry.note || "",
    };
  }
  return null;
}

// 인스턴스가 지금 어떤 변형 값을 쓰고 있나(레거시 축 이름 그대로).
function legacyVariantProps(inst: InstanceNode): { [k: string]: string } | null {
  const vp = (inst as InstanceNode).variantProperties;
  return vp && Object.keys(vp).length ? (vp as { [k: string]: string }) : null;
}

/**
 * 결정이 가리키는 정본을 제안 목록 맨 앞에 못박는다.
 * 결정이 있어도 목록 자체는 남긴다 — river 결정(2026-09-17): 접어 두되 펼치면 바꿀 수 있게.
 */
function pinDecidedSuggestion(verdict: LegacyVerdict | null, ranked: MappingSuggestion[], pool: ReferenceComponent[]): MappingSuggestion[] {
  if (!verdict || verdict.kind !== "decided" || !verdict.canonSets.length) return ranked;
  const wanted = verdict.canonSets.map((n) => normalizeName(n));
  const decided = pool.filter((p) => wanted.indexOf(normalizeName(p.name)) >= 0);
  if (!decided.length) return ranked;
  const head: MappingSuggestion[] = decided.map((p) => ({ id: p.id, key: p.key, type: p.type, name: p.name, source: p.sourceFileName, score: 1, decided: true }));
  const headIds: { [id: string]: true } = {};
  for (const h of head) headIds[h.id] = true;
  return head.concat(ranked.filter((r) => !headIds[r.id]));
}

// 미매칭 레거시 인스턴스 1건 + 유사도 내림차순 정본 제안 목록(최상위=가장 유사)
type ManualMapCandidate = {
  id: string;
  instanceId: string;
  instanceName: string;
  currentMainName: string;
  currentMainPath: string;
  suggestions: MappingSuggestion[];
  decision?: LegacyVerdict;        // 결정표가 무어라 답했나 (없으면 표가 다루지 않는 이름)
  decidedMissing?: boolean;        // 결정된 정본이 아직 이 파일에 없다 → 설치 먼저
};
function rankSuggestions(legacyName: string, pool: ReferenceComponent[]): MappingSuggestion[] {
  return pool
    .map((p) => ({ id: p.id, key: p.key, type: p.type, name: p.name, source: p.sourceFileName, score: Math.round(scoreNameSimilarity(legacyName, p.name) * 100) / 100 }))
    .sort((a, b) => (b.score - a.score) || a.name.localeCompare(b.name));
}

// ─── 모듈 하위 부품 검수 ────────────────────────────────────────────────
// 묶음(모듈)은 통째로 하나의 정본 부품으로 줄이지 않는다. 그렇다고 안내만 하고 끝내지도 않는다 —
// 안쪽을 한 겹 열어 "부품 하나하나가 무엇이고, 무엇으로 바꿀 수 있는지"까지 검수한다(river 지시 2026-09-03).
function containsInstanceNode(n: SceneNode): boolean {
  if (n.type === "INSTANCE") return true;
  if ("children" in n) {
    for (const c of (n as SceneNode & ChildrenMixin).children) if (containsInstanceNode(c)) return true;
  }
  return false;
}

// 부품 목록을 만든다. 인스턴스를 만나면 그 부품 자체를 1건으로 기록하고 **안쪽으로는 들어가지 않는다**
// (그 안은 그 컴포넌트의 내부 구조이지 이 모듈의 부품이 아니다).
// 인스턴스가 아닌데 채움·텍스트를 가진 가지는 "교체 불가 조각(raw)"으로 1건 기록한다.
async function collectModuleParts(root: SceneNode, pool: ReferenceComponent[], mediumVote?: (m: ScreenMedium) => void): Promise<ModulePart[]> {
  const parts: ModulePart[] = [];
  const vote = mediumVote || function () {};
  const partId = (nodeId: string) => `p-${nodeId.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const walk = async (node: SceneNode, path: number[]): Promise<void> => {
    if (node.visible === false) return;
    if (node.type === "INSTANCE") {
      const inst = node as InstanceNode;
      const main = await inst.getMainComponentAsync();
      const compareName = main
        ? (main.parent && main.parent.type === "COMPONENT_SET" ? main.parent.name : main.name)
        : inst.name;
      const currentTopId = main
        ? (main.parent && main.parent.type === "COMPONENT_SET" ? main.parent.id : main.id)
        : "";
      // 설치기가 심는 외부 라이브러리 부품(아이콘 등)은 바꿀 것이 없다 — "이미 최신"으로 둔다.
      if (main && (isInstallerRemotePart(main) || isDummyChromePart(inst))) {
        parts.push({ id: partId(inst.id), nodeId: inst.id, nodeName: inst.name, currentMainName: compareName, kind: "canonical", path, suggestions: [] });
        return;
      }
      let found = findReferenceMatch(compareName, pool);
      if (!found.match && inst.name && inst.name !== compareName) found = findReferenceMatch(inst.name, pool);
      let ranked = rankSuggestions(inst.name && inst.name !== compareName ? `${compareName} ${inst.name}` : compareName, pool);
      // 글자 유사도보다 먼저 — 사람이 정해 둔 답이 있나.
      // 단, 이미 정본인 부품(신원이 후보 풀에 있는 것)에는 묻지 않는다 — 이름이 같은 레거시가 있다.
      const isCanonAlready = pool.some((pc) => pc.id === currentTopId);
      const verdict = isCanonAlready ? null : lookupLegacyDecision([compareName, inst.name], legacyVariantProps(inst));
      if (verdict && verdict.kind === "decided") vote(mediumFromAxes(verdict.axes));
      if (verdict && verdict.kind === "not-a-part") {
        parts.push({
          id: partId(inst.id), nodeId: inst.id, nodeName: inst.name, currentMainName: compareName,
          kind: "manual", path, suggestions: [], decision: verdict,
          note: verdict.why || "정본으로 바꿀 대상이 아닙니다.",
        });
        return;
      }
      if (verdict && verdict.kind === "decided") {
        ranked = pinDecidedSuggestion(verdict, ranked, pool);
        const wanted = verdict.canonSets.map((n) => normalizeName(n));
        const decidedMissing = !pool.some((pc) => wanted.indexOf(normalizeName(pc.name)) >= 0);
        // 이미 정본인 부품은 위에서 신원으로 걸러졌으므로 여기 오는 것은 모두 «사람이 볼 것» 이다.
        parts.push({
          id: partId(inst.id), nodeId: inst.id, nodeName: inst.name, currentMainName: compareName,
          kind: "manual", path, suggestions: ranked,
          decision: verdict, decidedMissing,
        });
        return;
      }
      if (found.match && found.match.id === currentTopId) {
        parts.push({ id: partId(inst.id), nodeId: inst.id, nodeName: inst.name, currentMainName: compareName, kind: "canonical", path, suggestions: [] });
      } else if (found.match) {
        // 자동 선정된 정본을 목록 맨 앞으로 올린다(사용자가 다른 것으로 바꿀 수도 있게 목록은 그대로 둔다)
        const picked = found.match;
        const rest = ranked.filter((r) => r.id !== picked.id);
        const head: MappingSuggestion = { id: picked.id, key: picked.key, type: picked.type, name: picked.name, source: picked.sourceFileName, score: 1 };
        parts.push({
          id: partId(inst.id), nodeId: inst.id, nodeName: inst.name, currentMainName: compareName, kind: "auto", path,
          suggestions: [head].concat(rest),
          // 위 자동 교체와 같은 잣대 — 이름이 겹치면 한 번에 돌리지 않고 사람이 보고 누르게 남긴다.
          needsCheck: isClashingName(picked.name)
            ? "이 파일에 같은 이름의 부품이 둘 이상이라 어느 것이 기준인지 가릴 수 없습니다 — 바뀔 모습을 보고 바꿔주세요."
            : undefined,
        });
      } else {
        parts.push({ id: partId(inst.id), nodeId: inst.id, nodeName: inst.name, currentMainName: compareName, kind: "manual", path, suggestions: ranked, decision: verdict || undefined });
      }
      return;
    }
    const frameLike = node.type === "FRAME" || node.type === "COMPONENT" || node.type === "GROUP";
    if (frameLike && !containsInstanceNode(node) && hasVisiblePaint(node) && containsVisibleText(node)) {
      parts.push({
        id: partId(node.id), nodeId: node.id, nodeName: node.name, currentMainName: "(컴포넌트 아님)",
        kind: "raw", path, suggestions: rankSuggestions(node.name, pool),
        note: "컴포넌트가 아니라 직접 그린 조각이라 교체할 수 없습니다. 정본 부품을 옆에 가져와 바꿔 그리세요.",
      });
      return;
    }
    if ("children" in node) {
      const kids = (node as SceneNode & ChildrenMixin).children;
      for (let i = 0; i < kids.length; i++) await walk(kids[i], path.concat(i));
    }
  };
  if ("children" in root) {
    const kids = (root as SceneNode & ChildrenMixin).children;
    for (let i = 0; i < kids.length; i++) await walk(kids[i], [i]);
  }
  return parts;
}

// 묶음을 푼 뒤 같은 자리의 노드를 다시 찾는다(노드 id 가 유지되지 않는 경우 대비).
function resolveByPath(root: SceneNode, path: number[]): SceneNode | null {
  let cur: SceneNode = root;
  for (const idx of path) {
    if (!("children" in cur)) return null;
    const kids = (cur as SceneNode & ChildrenMixin).children;
    if (idx < 0 || idx >= kids.length) return null;
    cur = kids[idx];
  }
  return cur;
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
  const sel: readonly BaseNode[] = roots && roots.length
    ? normalizeSelectionRoots(roots.filter((root): root is SceneNode => "id" in root && root.type !== "PAGE" && root.type !== "DOCUMENT") as SceneNode[])
    : selectedRoots();
  const mediumVotes: ScreenMedium[] = [];
  const diag: SwapDiagnostics = {
    selectionCount: sel.length,
    instanceCount: 0,
    referencePoolSize: pool.length,
    matchedNameCount: 0,
    sameIdSkippedCount: 0,
    skippedNestedCount: 0,
    noMatchCount: 0,
    skippedInstallerRemoteCount: 0,
    candidateCount: 0,
    instancesPreview: [],
  };
  if (sel.length === 0) return { candidates: [], diagnostics: diag, manualCandidates: [], modules: [] };
  const candidates: SwapCandidate[] = [];
  const manualCandidates: ManualMapCandidate[] = [];
  const modules: ModuleFlag[] = [];
  const manualSeen = new Set<string>();
  const seen = new Set<string>();
  const candidateId = (prefix: string, instanceId: string) => `${prefix}-${instanceId.replace(/[^a-zA-Z0-9]/g, "_")}`;
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
      // 설치기 자신이 심는 외부 라이브러리 부품(아이콘 등)은 검수 대상이 아니다 — 정상 산출물이다.
      // 더미 크롬(상태바·내비바/키보드·웹 탭바)도 같은 이유로 교체 대상이 아니다 — OS 껍데기 소품이다.
      if (isInstallerRemotePart(main) || isDummyChromePart(inst)) { diag.skippedInstallerRemoteCount++; continue; }
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
      // 이 파일에 같은 이름의 세트가 둘 이상이면 어느 것이 기준인지 가릴 수 없다 —
      // 먼저 만난 것으로 조용히 바꾸지 않고 «확인필요»로 내려 사람이 보게 한다.
      // (예전에는 화면 위 배너로 알렸는데, 배너를 걷어낸 자리를 결과 자체로 막는다. river 지시 2026-09-18)
      const clashed = !!target && isClashingName(target.name);
      // 신뢰도: 정확/정규화 일치 = high, 부분 일치·이름 겹침 = ambiguous(사용자 확인 필요)
      const confidence: "high" | "ambiguous" = (found.matchType === "partial" || clashed) ? "ambiguous" : "high";
      const matched = !!target;
      const sameAsTarget = !!target && target.id === currentTopId;

      // 바깥 묶음을 최신 부품 하나로 축소하기 전에 내부 구조부터 본다.
      // 같은 정본 부품으로 해석되는 자식이 2개 이상이면 "여러 부품의 묶음"이다.
      // 예: m_button 안의 버튼 2개. 이름에 관계없이 구조로 판정한다.
      const nestedInstances = collectInstances(inst).slice(1);
      const nestedTargetCount = new Map<string, { target: ReferenceComponent; count: number }>();
      for (const nested of nestedInstances) {
        const nestedMain = await nested.getMainComponentAsync();
        if (!nestedMain) continue;
        const nestedName = nestedMain.parent && nestedMain.parent.type === "COMPONENT_SET"
          ? nestedMain.parent.name
          : nestedMain.name;
        let nestedFound = findReferenceMatch(nestedName, pool);
        if (!nestedFound.match && nested.name && nested.name !== nestedName) nestedFound = findReferenceMatch(nested.name, pool);
        if (!nestedFound.match) continue;
        const prev = nestedTargetCount.get(nestedFound.match.id);
        nestedTargetCount.set(nestedFound.match.id, { target: nestedFound.match, count: (prev ? prev.count : 0) + 1 });
      }
      const repeatedPart = Array.from(nestedTargetCount.values()).sort((a, b) => b.count - a.count)[0];
      const isRepeatedPartModule = !!repeatedPart && repeatedPart.count >= 2 && !sameAsTarget && (
        !target || repeatedPart.target.id === target.id
      );
      // 이름으로 못 걸러도 구조로 거른다 — 레거시 두개짜리 버튼 변형 등.
      // (내부 조각이 인스턴스가 아니거나 이름이 정본과 다르면 위 판정을 통과하므로)
      const similarParts = (!isRepeatedPartModule && !sameAsTarget) ? countSimilarSizedParts(inst) : 0;
      const isStructuralModule = similarParts >= 2;
      if (isRepeatedPartModule || isStructuralModule) {
        if (!manualSeen.has(inst.id)) {
          manualSeen.add(inst.id);
          modules.push({
            id: candidateId("g", inst.id),
            instanceId: inst.id,
            instanceName: inst.name,
            currentMainName: compareName,
            currentMainPath: await describeComponentLocation(main),
            nestedCount: Math.max(nestedInstances.length, similarParts),
            repeatedPartName: isRepeatedPartModule ? repeatedPart!.target.name : undefined,
            repeatedPartCount: isRepeatedPartModule ? repeatedPart!.count : undefined,
            multiPartNote: isStructuralModule
              ? `채움·텍스트를 가진 부품 모양 ${similarParts}개가 나란히 들어 있어 하나의 컴포넌트로 교체하지 않습니다. 내부 부품 단위로 재구성하세요.`
              : undefined,
            parts: await collectModuleParts(inst, pool, (m) => mediumVotes.push(m)),
          });
        }
        continue;
      }
      // 사람이 정해 둔 답이 있으면 **이름이 딱 맞더라도** 그것이 먼저다.
      // 종전에는 이름 매칭이 성공하면 결정표를 아예 보지 않아, 결정과 다른 정본으로
      // 조용히 자동 교체되거나 «만들지 않기로 한 것» 이 후보로 되살아났다(🤖 독립 검증 2026-09-17).
      // **이미 정본인 부품에는 결정표를 묻지 않는다.** 레거시 파일에도 정본과 **이름이 같은** 세트가 있어
      // (체크박스·칩·라디오·토글·표 등 11건), 이름으로 가르면 정본이 레거시로 오인되거나
      // 레거시가 «이미 정본» 으로 묻힌다(🤖 독립 검증 2026-09-17 2차). 신원(노드 id)으로만 가른다.
      const isCanonAlready = pool.some((pc) => pc.id === currentTopId);
      const verdict = isCanonAlready ? null : lookupLegacyDecision([compareName, inst.name], legacyVariantProps(inst));
      if (verdict && (verdict.kind === "decided" || verdict.kind === "not-a-part")) {
        if (verdict.kind === "decided") mediumVotes.push(mediumFromAxes(verdict.axes));
        const wanted = verdict.canonSets.map((n) => normalizeName(n));
        if (!manualSeen.has(inst.id)) {
          manualSeen.add(inst.id);
          let ranked: MappingSuggestion[] = [];
          let decidedMissing = false;
          if (verdict.kind === "decided") {
            ranked = pinDecidedSuggestion(verdict, rankSuggestions(inst.name && inst.name !== compareName ? `${compareName} ${inst.name}` : compareName, pool), pool);
            decidedMissing = !pool.some((pc) => wanted.indexOf(normalizeName(pc.name)) >= 0);
          }
          manualCandidates.push({
            id: candidateId("m", inst.id),
            instanceId: inst.id,
            instanceName: inst.name,
            currentMainName: compareName,
            currentMainPath: await describeComponentLocation(main),
            suggestions: ranked,
            decision: verdict,
            decidedMissing,
          });
        }
        continue;
      }

      if (matched) diag.matchedNameCount++;
      if (sameAsTarget) diag.sameIdSkippedCount++;
      if (diag.instancesPreview.length < 8) {
        diag.instancesPreview.push({ name: inst.name, mainName: compareName, mainTopId: currentTopId, matched, sameAsTarget });
      }
      if (!matched) {
        diag.noMatchCount++;
        // 이름이 정본과 안 맞는 top-level 인스턴스(중첩은 이미 위에서 제외)를 배치된 항목별로 보여준다.
        // 같은 레거시 원본을 여러 번 썼더라도 각 항목을 따로 선택·교체할 수 있어야 한다.
        if (pool.length > 0 && !manualSeen.has(inst.id)) {
          manualSeen.add(inst.id);
          // 내부에 부품이 많이 뭉친 "모듈"(예: 테이블)은 통째/leaf 교체가 부적절 → 재구성 필요로만 플래그.
          // (내부 중첩 인스턴스는 Figma 가 개별 교체를 막고, 이름도 정본과 달라 leaf 자동매칭도 불가.)
          const nestedCount = nestedInstances.length; // 자신 제외 후손 인스턴스 수
          if (nestedCount >= MODULE_NESTED_THRESHOLD) {
            modules.push({
              id: candidateId("g", inst.id),
              instanceId: inst.id,
              instanceName: inst.name,
              currentMainName: compareName,
              currentMainPath: await describeComponentLocation(main),
              nestedCount,
              parts: await collectModuleParts(inst, pool, (m) => mediumVotes.push(m)),
            });
          } else {
            // 여기까지 온 것은 «아직 안 정함» 이거나 이름이 겹쳐 되물어야 하는 것뿐이다
            // (정해진 것·교체 대상 아닌 것은 위에서 이미 갈라 나갔다).
            manualCandidates.push({
              id: candidateId("m", inst.id),
              instanceId: inst.id,
              instanceName: inst.name,
              currentMainName: compareName,
              currentMainPath: await describeComponentLocation(main),
              suggestions: rankSuggestions(inst.name && inst.name !== compareName ? `${compareName} ${inst.name}` : compareName, pool),
              decision: verdict || undefined,
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
        id: candidateId("s", inst.id),
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
        demoteReason: clashed
          ? "이 파일에 같은 이름의 부품이 둘 이상이라 어느 것이 기준인지 가릴 수 없습니다 — 바뀔 모습을 보고 바꿔주세요."
          : undefined,
      });
    }
  }
  diag.candidateCount = candidates.length;
  const guess = detectMedium(sel, mediumVotes);
  diag.medium = guess.medium;
  diag.mediumWhy = guess.why;
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
async function loadReferenceNode(ref: { id: string; key?: string; type: "COMPONENT" | "COMPONENT_SET" }): Promise<BaseNode | null> {
  try {
    const n = await figma.getNodeByIdAsync(ref.id);
    if (n && (n.type === "COMPONENT" || n.type === "COMPONENT_SET")) return n;
  } catch {}
  if (ref.key) {
    try {
      if (ref.type === "COMPONENT_SET") return await figma.importComponentSetByKeyAsync(ref.key);
      return await figma.importComponentByKeyAsync(ref.key);
    } catch { return null; }
  }
  return null;
}

async function loadSuggestedNode(candidate: SwapCandidate): Promise<BaseNode | null> {
  return loadReferenceNode({ id: candidate.suggestedId, key: candidate.suggestedKey, type: candidate.suggestedType });
}

// ─── 변형(variant) 고르기 — 이름만 맞추고 끝내지 않는다 ───────────────────────
// 이름이 같은 정본을 찾아도 **어느 변형으로 바꿀지**를 정하지 않으면
// secondary 버튼이 primary 로, 글자 헤더가 체크박스 헤더로 바뀐다(river 보고 2026-09-03).
// 좁히는 근거는 세 가지다: ①river 가 정해 둔 축(결정표) ②레거시가 가진 변형값 ③레거시 이름에 적힌 값.
// 남은 축은 정본 기본값으로 채워 **화면에는 언제나 하나가 골라진 채로** 내보낸다(river 지시 2026-09-18).
// 다만 무엇을 무엇으로 정했는지(axisSource)를 함께 돌려줘 화면이 «정한 것/짐작한 것»을 구분해 보여준다.
// 자동 교체(strict)는 이 완화를 쓰지 않는다 — pickVariantTarget 은 그대로 엄격하다.
type VariantOption = { id: string; key: string; label: string; values: { [axis: string]: string } };
type VariantInfo = {
  hiddenByMedium?: number;   // 다른 매체 전용이라 감춘 변형 수
  ok: boolean;
  reason?: string;
  setId: string;
  setName: string;
  hasVariants: boolean;
  options: VariantOption[];
  pickedId: string | null;      // null = 세트를 못 읽은 때만. 변형이 있으면 언제나 하나를 고른다.
  matchedAxes: string[];
  unmatchedAxes: string[];
  axisSource?: { [axis: string]: "decision" | "legacy" | "name" | "default" | "only" };
  guessedAxes?: string[];       // 근거 없이 기본값으로 채운 축
  confident?: boolean;          // 모든 축에 근거가 있었나 — 일괄 교체는 이것만 자동으로 돈다
};

function variantLabel(vp: { [k: string]: string } | null): string {
  if (!vp) return "";
  return Object.keys(vp).map((k) => `${k}=${vp[k]}`).join(" · ");
}

async function getVariantOptions(
  ref: { id: string; key?: string; type: "COMPONENT" | "COMPONENT_SET" },
  legacyInstanceId: string,
  medium?: ScreenMedium,
  decidedAxes?: { [axis: string]: string } | null
): Promise<VariantInfo> {
  const node = await loadReferenceNode(ref);
  if (!node) {
    return { ok: false, reason: "정본 컴포넌트를 불러오지 못했습니다.", setId: ref.id, setName: "", hasVariants: false, options: [], pickedId: null, matchedAxes: [], unmatchedAxes: [] };
  }
  if (node.type === "COMPONENT") {
    const c = node as ComponentNode;
    return { ok: true, setId: c.id, setName: c.name, hasVariants: false, options: [{ id: c.id, key: c.key, label: c.name, values: {} }], pickedId: c.id, matchedAxes: [], unmatchedAxes: [] };
  }
  const set = node as ComponentSetNode;
  let variants = set.children.filter((c) => c.type === "COMPONENT") as ComponentNode[];
  // 모바일 화면이면 PC 전용 변형을, PC 화면이면 모바일 전용 변형을 감춘다.
  // 근거는 정본 세트 자신이 가진 Break 축뿐이다 — 없으면 감추지 않는다. 전부 사라지면 되돌린다.
  let hiddenByMedium = 0;
  if (medium) {
    const kept = variants.filter((v) => {
      const m = mediumFromAxes((v.variantProperties || {}) as { [k: string]: string });
      return !m || m === medium;
    });
    if (kept.length) { hiddenByMedium = variants.length - kept.length; variants = kept; }
  }
  const options: VariantOption[] = variants.map((v) => ({ id: v.id, key: v.key, label: variantLabel(v.variantProperties) || v.name, values: v.variantProperties || {} }));
  if (variants.length === 0) {
    return { ok: false, reason: "정본 세트에 변형이 없습니다.", setId: set.id, setName: set.name, hasVariants: false, options: [], pickedId: null, matchedAxes: [], unmatchedAxes: [] };
  }

  const inst = await figma.getNodeByIdAsync(legacyInstanceId);
  const legacyVP = inst && inst.type === "INSTANCE" ? (inst as InstanceNode).variantProperties || {} : {};
  let legacyNames = inst && "name" in inst ? String((inst as SceneNode).name) : "";
  if (inst && inst.type === "INSTANCE") {
    const main = await (inst as InstanceNode).getMainComponentAsync();
    if (main) legacyNames += " " + main.name + " " + (main.parent && main.parent.type === "COMPONENT_SET" ? main.parent.name : "");
  }
  const nameTokens = tokenizeName(legacyNames.replace(/=/g, " ")).map(normVariantValue);

  // 축 이름은 세트 기본값에서 읽되, **기본값이 매체 필터에 걸려 사라졌으면 근거로 쓰지 않는다**
  // (PC 기본값을 모바일 화면에 들이밀지 않기 위해서다).
  const setDefault = (set.defaultVariant || variants[0]) as ComponentNode;
  const axes = Object.keys(setDefault.variantProperties || {});
  const defaultSurvived = variants.some((v) => v.id === setDefault.id);
  const legacyByNorm: { [norm: string]: string } = {};
  for (const k of Object.keys(legacyVP)) legacyByNorm[normAxisName(k)] = legacyVP[k];

  // river 결정이 적어 둔 축을 같은 방식으로 정규화해 둔다 — 이것이 1순위다.
  const decidedByNorm: { [norm: string]: string } = {};
  for (const k of Object.keys(decidedAxes || {})) decidedByNorm[normAxisName(k)] = (decidedAxes as { [k: string]: string })[k];

  const want: { [axis: string]: string } = {};
  const matchedAxes: string[] = [];
  const unmatchedAxes: string[] = [];
  const axisSource: { [axis: string]: "decision" | "legacy" | "name" | "default" | "only" } = {};
  for (const axis of axes) {
    const values = Array.from(new Set(variants.map((v) => (v.variantProperties || {})[axis]).filter(Boolean)));
    // ① river 가 정해 둔 값 (결정표)
    const fromDecision = decidedByNorm[normAxisName(axis)];
    if (fromDecision) {
      const hit = values.find((v) => normVariantValue(v) === normVariantValue(fromDecision));
      if (hit) { want[axis] = hit; matchedAxes.push(axis); axisSource[axis] = "decision"; continue; }
    }
    // ② 레거시가 같은 축을 가지고 있으면 그 값
    const fromVP = legacyByNorm[normAxisName(axis)];
    if (fromVP) {
      const hit = values.find((v) => normVariantValue(v) === normVariantValue(fromVP));
      if (hit) { want[axis] = hit; matchedAxes.push(axis); axisSource[axis] = "legacy"; continue; }
    }
    // ③ 레거시 이름에 그 축의 값이 적혀 있으면 그 값 (예: "btn_secondary_xsm")
    const byName = values.filter((v) => nameTokens.indexOf(normVariantValue(v)) >= 0);
    if (byName.length === 1) { want[axis] = byName[0]; matchedAxes.push(axis); axisSource[axis] = "name"; continue; }
    unmatchedAxes.push(axis);
  }

  // 근거가 센 순서로 하나씩 좁힌다: 결정 → 원본 → 이름.
  // **좁히다가 남는 게 없어지면 그 축의 근거를 버리고 «짐작»으로 내린다** — 버린 근거를
  // 그대로 «정한 대로 골랐다»고 말하지 않기 위해서다.
  const defVP = (defaultSurvived ? setDefault.variantProperties || {} : {}) as { [k: string]: string };
  const rank = { decision: 0, legacy: 1, name: 2, default: 3 } as { [k: string]: number };
  const ordered = matchedAxes.slice().sort((a, b) => rank[axisSource[a]] - rank[axisSource[b]]);
  const guessedAxes: string[] = [];
  const keptAxes: string[] = [];
  let pool = variants.slice();
  for (const axis of ordered) {
    const next = pool.filter((v) => (v.variantProperties || {})[axis] === want[axis]);
    if (next.length > 0) { pool = next; keptAxes.push(axis); continue; }
    // 이 근거는 이 세트에서 성립하지 않는다 — 근거에서 빼고 짐작으로 기록한다.
    delete want[axis];
    axisSource[axis] = "default";
    guessedAxes.push(axis);
  }
  // 남은 축은 **살아남은 정본 기본값**으로만 채운다. 기본값이 없으면 좁히지 않는다.
  // 남은 후보에서 그 축의 값이 하나뿐이면 «고를 것이 없다»는 뜻이므로 짐작으로 세지 않는다.
  for (const axis of axes) {
    if (keptAxes.indexOf(axis) >= 0) continue;
    const distinct = Array.from(new Set(pool.map((v) => (v.variantProperties || {})[axis]).filter(Boolean)));
    if (distinct.length <= 1) { axisSource[axis] = "only"; continue; }
    const byDefault = defVP[axis] ? pool.filter((v) => (v.variantProperties || {})[axis] === defVP[axis]) : [];
    if (byDefault.length > 0) { pool = byDefault; want[axis] = defVP[axis]; }
    axisSource[axis] = "default";
    if (guessedAxes.indexOf(axis) < 0) guessedAxes.push(axis);
  }
  // 그래도 여럿이면 **정본 세트가 적어 둔 차례대로** 첫 번째를 보여 준다(우리가 만든 순서가 아니다).
  const picked: ComponentNode | null = pool.length > 0 ? pool[0] : null;
  const confident = guessedAxes.length === 0 && pool.length === 1;
  return {
    ok: true,
    setId: set.id,
    setName: set.name,
    hasVariants: true,
    options,
    pickedId: picked ? picked.id : null,
    matchedAxes: keptAxes,
    unmatchedAxes,
    axisSource,
    guessedAxes,
    confident,
    hiddenByMedium,
  };
}

// ─── 미리보기 이미지 ───────────────────────────────────────────────────────
// 작업자가 최신 컴포넌트 "이름"을 모를 수 있으므로, 지금 모습과 바뀔 모습을 그림으로 보여준다.
async function exportPreviewBytes(node: SceneNode | ComponentNode): Promise<Uint8Array | null> {
  try {
    const w = "width" in node ? (node as SceneNode & LayoutMixin).width : 0;
    const h = "height" in node ? (node as SceneNode & LayoutMixin).height : 0;
    const longest = Math.max(w, h, 1);
    const scale = Math.max(0.25, Math.min(2, 320 / longest));
    return await (node as SceneNode).exportAsync({ format: "PNG", constraint: { type: "SCALE", value: scale } });
  } catch {
    return null;
  }
}

async function exportNodePreview(nodeId: string): Promise<Uint8Array | null> {
  const n = await figma.getNodeByIdAsync(nodeId);
  if (!n || !("exportAsync" in n)) return null;
  return exportPreviewBytes(n as SceneNode);
}

async function exportReferencePreview(ref: { id: string; key?: string; type: "COMPONENT" | "COMPONENT_SET" }): Promise<Uint8Array | null> {
  const node = await loadReferenceNode(ref);
  if (!node) return null;
  if (node.type === "COMPONENT_SET") {
    const first = (node as ComponentSetNode).children.filter((c) => c.type === "COMPONENT")[0] as ComponentNode | undefined;
    return first ? exportPreviewBytes(first) : null;
  }
  return exportPreviewBytes(node as ComponentNode);
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

type SwapRollback = {
  instanceId: string;
  backupNodeId: string;
  originalParentId: string;
  originalIndex: number;
  originalX: number;
  originalY: number;
  originalVisible: boolean;
};

const ROLLBACK_FRAME_MARK = "s1-inspector-swap-backup";
let rollbackFrameId = "";
let rollbackFrameNode: FrameNode | null = null;

async function getRollbackFrame(): Promise<FrameNode> {
  if (rollbackFrameId) {
    const existing = await figma.getNodeByIdAsync(rollbackFrameId);
    if (existing && existing.type === "FRAME") {
      rollbackFrameNode = existing as FrameNode;
      return rollbackFrameNode;
    }
  }
  for (const node of figma.currentPage.children) {
    if (node.type === "FRAME" && node.getPluginData(ROLLBACK_FRAME_MARK) === "1") {
      rollbackFrameId = node.id;
      rollbackFrameNode = node as FrameNode;
      return rollbackFrameNode;
    }
  }
  const frame = figma.createFrame();
  frame.name = "검수기 되돌리기 백업";
  frame.visible = false;
  frame.setPluginData(ROLLBACK_FRAME_MARK, "1");
  rollbackFrameId = frame.id;
  rollbackFrameNode = frame;
  return frame;
}

async function discardSwapRollback(rollback: SwapRollback): Promise<void> {
  const backup = await figma.getNodeByIdAsync(rollback.backupNodeId);
  if (backup) backup.remove();
  if (rollbackFrameId) {
    const frame = await figma.getNodeByIdAsync(rollbackFrameId);
    if (frame && frame.type === "FRAME" && frame.children.length === 0) {
      frame.remove();
      rollbackFrameId = "";
      rollbackFrameNode = null;
    }
  }
}

async function cleanupSwapBackups(): Promise<void> {
  if (rollbackFrameNode && !rollbackFrameNode.removed) {
    rollbackFrameNode.remove();
  } else if (rollbackFrameId) {
    const frame = await figma.getNodeByIdAsync(rollbackFrameId);
    if (frame) frame.remove();
  }
  rollbackFrameNode = null;
  rollbackFrameId = "";
  // 이전 실행이 비정상 종료돼 메모리 ID가 사라졌더라도 marker로 숨은 백업을 회수한다.
  for (const page of figma.root.children) {
    try {
      for (const node of Array.from(page.children)) {
        if (node.type === "FRAME" && node.getPluginData(ROLLBACK_FRAME_MARK) === "1") node.remove();
      }
    } catch {}
  }
}

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
): Promise<{ ok: boolean; result: SwapOutcome; reason?: string; variantReset?: boolean; axisLoss?: number; unpreserved?: string[]; rollback?: SwapRollback; modeFitted?: string }> {
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
  const parent = inst.parent;
  if (!parent || !("children" in parent)) return { ok: false, result: "failed", reason: "교체 전 위치를 저장할 수 없습니다." };
  const backup = (inst as InstanceNode).clone();
  const rollback: SwapRollback = {
    instanceId: inst.id,
    backupNodeId: backup.id,
    originalParentId: parent.id,
    originalIndex: Array.from(parent.children).findIndex((child) => child.id === inst.id),
    originalX: inst.x,
    originalY: inst.y,
    originalVisible: inst.visible,
  };
  const captured = captureTextOverrides(inst as InstanceNode);
  try {
    const backupFrame = await getRollbackFrame();
    backup.visible = false;
    backupFrame.appendChild(backup);
  } catch (e: any) {
    try { backup.remove(); } catch {}
    return { ok: false, result: "failed", reason: `교체 전 상태를 저장하지 못했습니다: ${String(e && e.message || e)}` };
  }
  // 교체 직전 시안 입력 텍스트 캡처 → 교체 → 대응 위치에 복원(내용만, 스타일은 정본 유지)
  try {
    (inst as InstanceNode).swapComponent(res.target);
  } catch (e: any) {
    await discardSwapRollback(rollback);
    return { ok: false, result: "failed", reason: String(e && e.message || e) };
  }
  let unpreserved: string[] = [];
  try {
    const pres = await restoreTextOverrides(inst as InstanceNode, captured);
    unpreserved = pres.unpreserved;
  } catch (e) { /* 복원 실패해도 교체 자체는 성공 — 보존만 부분적 */ }
  const fitted = await fitInstanceToMode(inst as InstanceNode);
  return { ok: true, result: "swapped", variantReset: res.variantReset, axisLoss: res.axisLoss, unpreserved, rollback, modeFitted: fitted.changed ? fitted.mode : undefined };
}

// ─── 교체한 부품을 화면 모드에 맞추기 (river 결정 2026-09-17 — "교체할 때 화면 모드에 맞춰줘") ───
// 정본 부품에는 라이트가 박혀 있다(build-components 의 setLightMode). 그대로 갈아 끼우면
// 다크 화면에서 그 자리만 라이트로 남는다. 그래서 교체 직후:
//   ① 박힌 고정을 풀어 놓인 자리를 따라가게 하고
//   ② 그래도 원하는 모드가 아니면 그 모드를 직접 지정한다(안쪽 부품까지).
// 고정을 먼저 푸는 이유: 풀어서 맞으면 고정이 하나도 남지 않아, 나중에 화면을 통째로
// 뒤집을 때도 따라온다(검사 10번이 잡는 상태를 우리가 새로 만들지 않는다).
async function fitInstanceToMode(
  target: InstanceNode,
  contextNode?: SceneNode
): Promise<{ changed: number; mode: string }> {
  const collections = await loadCollectionsCached();
  const semantic = collections.filter((col) => col.name === SEMANTIC_COLOR_COLLECTION)[0];
  if (!semantic) return { changed: 0, mode: "" };
  const wantModeId = contextNode
    ? (pinnedModeId(contextNode, semantic.id, true) || semantic.defaultModeId)
    : (pinnedModeId(target, semantic.id, false) || semantic.defaultModeId);
  const found = semantic.modes.filter((m) => m.modeId === wantModeId)[0];
  const wantName = found ? found.name : "";

  const nodes: SceneNode[] = [target];
  try { (target.findAll((n) => n.type === "INSTANCE") as SceneNode[]).forEach((n) => nodes.push(n)); } catch (e) { /* */ }

  let changed = 0;
  for (const node of nodes) {
    const pins = (node as any).explicitVariableModes as { [collectionId: string]: string } | undefined;
    const pinned = pins ? pins[semantic.id] : undefined;
    if (pinned === wantModeId) continue;
    if (pinned) {
      try {
        (node as any).clearExplicitVariableModeForCollection(semantic.id);
        changed++;
      } catch (e) { /* */ }
    }
    // 푼 뒤에도(또는 애초에 고정이 없었어도) 실제로 따라가는 모드가 다르면 직접 지정한다.
    let resolved: string | undefined;
    try {
      const table = (node as any).resolvedVariableModes as { [collectionId: string]: string } | undefined;
      resolved = table ? table[semantic.id] : undefined;
    } catch (e) { /* 구버전 API — 아래 fallback */ }
    if (resolved === undefined) {
      resolved = pinnedModeId(node, semantic.id, true) || semantic.defaultModeId;
    }
    if (resolved !== wantModeId) {
      try {
        (node as any).setExplicitVariableModeForCollection(semantic.id, wantModeId);
        changed++;
      } catch (e) { /* */ }
    }
  }
  return { changed, mode: wantName };
}

// ─── 모듈 하위 부품 교체 ────────────────────────────────────────────────
// 백업 없이 "그 자리에서" 교체만 한다(백업·되돌리기는 호출부 담당).
// 변형(State/Size)과 입력 텍스트 보존은 통째 교체와 같은 규칙을 쓴다.
async function swapInstanceTo(
  inst: InstanceNode,
  candidate: SwapCandidate,
  mode: SwapMode
): Promise<{ ok: boolean; result: SwapOutcome; reason?: string; variantReset?: boolean; axisLoss?: number; unpreserved?: string[]; modeFitted?: string }> {
  const res = await resolveSwapTarget(candidate, mode, inst.variantProperties || null);
  if (!res.target) {
    if (res.reason === "no-variant-match") {
      return { ok: false, result: "demoted", reason: "정본에 같은 상태(변형) 조합이 없어 자동 교체하지 않았습니다.", axisLoss: res.axisLoss };
    }
    return { ok: false, result: "failed", reason: "기준 컴포넌트를 import할 수 없습니다. 기준 파일에서 컴포넌트가 publish되었는지 확인해주세요." };
  }
  const captured = captureTextOverrides(inst);
  try {
    inst.swapComponent(res.target);
  } catch (e: any) {
    return { ok: false, result: "failed", reason: String((e && e.message) || e) };
  }
  let unpreserved: string[] = [];
  try { unpreserved = (await restoreTextOverrides(inst, captured)).unpreserved; } catch {}
  const fitted = await fitInstanceToMode(inst);
  return { ok: true, result: "swapped", variantReset: res.variantReset, axisLoss: res.axisLoss, unpreserved, modeFitted: fitted.changed ? fitted.mode : undefined };
}

/**
 * 묶음 풀기만 한다(교체는 하지 않는다).
 *   묶음 안 부품은 Figma 가 교체를 막을 수 있다. 그때 사용자가 [묶음 풀기]를 누르면 여기로 온다 —
 *   묶음 전체를 백업해 두고([되돌리기] 가능) 바깥 묶음을 풀어, 안쪽 부품이 각자 교체 가능한 상태가 되게 한다.
 */
async function detachModule(
  moduleInstanceId: string,
  pool: ReferenceComponent[]
): Promise<{ ok: boolean; reason?: string; frame?: FrameNode; moduleNodeId?: string; parts?: ModulePart[]; rollback?: SwapRollback }> {
  const moduleNode = await figma.getNodeByIdAsync(moduleInstanceId);
  if (!moduleNode || moduleNode.type !== "INSTANCE") {
    return { ok: false, reason: "묶음을 찾을 수 없습니다. 다시 검사해주세요." };
  }
  const moduleInst = moduleNode as InstanceNode;
  const parent = moduleInst.parent;
  if (!parent || !("children" in parent)) return { ok: false, reason: "묶음의 위치를 저장할 수 없습니다." };

  // 풀기 전에 통째로 백업 — [되돌리기] 한 번으로 풀기 이전 상태로 돌아간다.
  const backup = moduleInst.clone();
  const rollback: SwapRollback = {
    instanceId: moduleInst.id,
    backupNodeId: backup.id,
    originalParentId: parent.id,
    originalIndex: Array.from(parent.children).findIndex((child) => child.id === moduleInst.id),
    originalX: moduleInst.x,
    originalY: moduleInst.y,
    originalVisible: moduleInst.visible,
  };
  try {
    const backupFrame = await getRollbackFrame();
    backup.visible = false;
    backupFrame.appendChild(backup);
  } catch (e: any) {
    try { backup.remove(); } catch {}
    return { ok: false, reason: `묶음을 풀기 전 상태를 저장하지 못했습니다: ${String((e && e.message) || e)}` };
  }
  let frame: FrameNode;
  try {
    frame = moduleInst.detachInstance();
  } catch (e: any) {
    await discardSwapRollback(rollback);
    return { ok: false, reason: `묶음을 풀지 못했습니다: ${String((e && e.message) || e)}` };
  }
  return { ok: true, frame, moduleNodeId: frame.id, parts: await collectModuleParts(frame, pool), rollback: { ...rollback, instanceId: frame.id } };
}

type ModulePartSwapResult = {
  ok: boolean;
  result: SwapOutcome | "blocked";
  reason?: string;
  variantReset?: boolean;
  axisLoss?: number;
  unpreserved?: string[];
  rollback?: SwapRollback;
  detached?: boolean;
  moduleNodeId?: string;
  parts?: ModulePart[];
  modeFitted?: string;
};

/**
 * 묶음 안의 부품 1건 교체.
 *  1) 묶음 밖(=이미 풀린 상태)이면 통째 교체와 같은 경로(백업 포함).
 *  2) 묶음 안이면 **먼저 그대로 교체를 시도한다.** Figma 가 허용하면 묶음을 풀 필요가 없다.
 *  3) 막히면 result="blocked" 로 돌려주고, 사용자가 [묶음 풀고 교체]를 누르면 allowDetach=true 로 다시 온다.
 *     그때는 묶음 전체를 백업해 두고(→ 되돌리기 가능) 바깥 묶음을 푼 뒤 그 자리에서 교체한다.
 */
async function applyModulePartSwap(args: {
  candidate: SwapCandidate;
  moduleInstanceId: string;
  partPath: number[];
  allowDetach: boolean;
  pool: ReferenceComponent[];
}): Promise<ModulePartSwapResult> {
  const part = await figma.getNodeByIdAsync(args.candidate.instanceId);
  if (!part || part.type !== "INSTANCE") {
    return { ok: false, result: "failed", reason: "컴포넌트가 아니라 교체할 수 없는 조각입니다." };
  }
  if (!hasInstanceAncestor(part)) {
    const r = await applySwap(args.candidate, "lenient");
    return { ok: r.ok, result: r.result, reason: r.reason, variantReset: r.variantReset, axisLoss: r.axisLoss, unpreserved: r.unpreserved, rollback: r.rollback, modeFitted: r.modeFitted };
  }

  if (!args.allowDetach) {
    const attempt = await swapInstanceTo(part as InstanceNode, args.candidate, "lenient");
    if (attempt.ok) return { ok: true, result: "swapped", variantReset: attempt.variantReset, axisLoss: attempt.axisLoss, unpreserved: attempt.unpreserved, modeFitted: attempt.modeFitted };
    if (attempt.result === "demoted") return { ok: false, result: "demoted", reason: attempt.reason };
    return { ok: false, result: "blocked", reason: attempt.reason || "묶음 안에 있는 부품이라 그대로는 교체되지 않습니다." };
  }

  const detached = await detachModule(args.moduleInstanceId, args.pool);
  if (!detached.ok || !detached.frame) {
    return { ok: false, result: "failed", reason: detached.reason };
  }
  const frame = detached.frame;
  const rollback = detached.rollback!;

  // 푼 뒤에는 노드 id 가 바뀔 수 있으므로 같은 자리(자식 순번)로 부품을 다시 찾는다.
  let target = resolveByPath(frame, args.partPath);
  if (!target || target.type !== "INSTANCE") {
    const byId = await figma.getNodeByIdAsync(args.candidate.instanceId);
    target = byId && "type" in byId && byId.type === "INSTANCE" ? (byId as SceneNode) : null;
  }
  const rollbackAfterDetach: SwapRollback = rollback;
  if (!target) {
    return { ok: false, result: "failed", reason: "묶음은 풀었지만 교체할 부품을 다시 찾지 못했습니다.", detached: true, moduleNodeId: frame.id, rollback: rollbackAfterDetach, parts: await collectModuleParts(frame, args.pool) };
  }
  const swapped = await swapInstanceTo(target as InstanceNode, args.candidate, "lenient");
  return {
    ok: swapped.ok,
    result: swapped.ok ? "swapped" : swapped.result,
    reason: swapped.reason,
    variantReset: swapped.variantReset,
    axisLoss: swapped.axisLoss,
    unpreserved: swapped.unpreserved,
    modeFitted: swapped.modeFitted,
    detached: true,
    moduleNodeId: frame.id,
    rollback: rollbackAfterDetach,
    parts: await collectModuleParts(frame, args.pool),
  };
}

/**
 * 컴포넌트 가져오기 — 원본은 손대지 않고, **정본 컴포넌트의 새 인스턴스를 캔버스 위쪽에 놓는다.**
 *   왜 필요한가: 이미 입력된 정보(텍스트·수치)가 들어 있어 단순 교체하면 안 되는 시안이 있다.
 *   그럴 때 작업자가 옆에 놓인 최신 부품을 보고 직접 다시 만들 수 있게 한다(river 지시 2026-09-03).
 *   변형(State/Size 등)은 원본 인스턴스와 같은 조합을 우선 고르고, 없으면 기본 변형을 쓴다.
 */
async function importComponentCopy(
  candidate: SwapCandidate
): Promise<{ ok: boolean; reason?: string; nodeId?: string; name?: string; variantReset?: boolean }> {
  const inst = await figma.getNodeByIdAsync(candidate.instanceId);
  const legacyVP = inst && inst.type === "INSTANCE" ? (inst as InstanceNode).variantProperties || null : null;
  const res = await resolveSwapTarget(candidate, "lenient", legacyVP);
  if (!res.target) {
    return { ok: false, reason: "기준 컴포넌트를 찾지 못했습니다. 기준 파일에서 publish 되었는지 확인해주세요." };
  }
  let copy: InstanceNode;
  try {
    copy = res.target.createInstance();
  } catch (e: any) {
    return { ok: false, reason: String((e && e.message) || e) };
  }
  const page = figma.currentPage;
  page.appendChild(copy);   // 다른 프레임 안이 아니라 캔버스에 직접 — 원본 레이아웃을 건드리지 않는다
  const box = inst && "absoluteBoundingBox" in inst ? (inst as SceneNode).absoluteBoundingBox : null;
  const GAP = 40;
  if (box) {
    copy.x = box.x;
    copy.y = box.y - copy.height - GAP;   // 원본 바로 위
  } else {
    copy.x = figma.viewport.center.x;
    copy.y = figma.viewport.center.y;
  }
  const setName = res.target.parent && res.target.parent.type === "COMPONENT_SET"
    ? res.target.parent.name
    : res.target.name;
  copy.name = `${setName} (가져옴)`;
  // 원본이 놓인 화면의 모드로 보여준다 — 다크 화면 옆에 라이트 부품이 놓이지 않게.
  if (inst && "type" in inst) {
    try { await fitInstanceToMode(copy, inst as SceneNode); } catch (e) { /* */ }
  }
  page.selection = [copy];
  figma.viewport.scrollAndZoomIntoView([copy]);
  return { ok: true, nodeId: copy.id, name: copy.name, variantReset: res.variantReset };
}

async function rollbackSwap(rollback: SwapRollback): Promise<{ ok: boolean; reason?: string; instanceId?: string }> {
  const node = await figma.getNodeByIdAsync(rollback.instanceId);
  // 묶음을 풀고 교체한 경우 그 자리는 INSTANCE 가 아니라 FRAME 이다 — 둘 다 되돌릴 수 있어야 한다.
  if (!node || !("parent" in node) || node.type === "PAGE" || node.type === "DOCUMENT") {
    return { ok: false, reason: "되돌릴 항목을 찾을 수 없습니다." };
  }
  const backup = await figma.getNodeByIdAsync(rollback.backupNodeId);
  if (!backup || backup.type !== "INSTANCE") return { ok: false, reason: "교체 전 백업을 찾을 수 없습니다." };
  const originalParent = await figma.getNodeByIdAsync(rollback.originalParentId);
  const parent = originalParent && "children" in originalParent ? originalParent : node.parent;
  if (!parent || !("children" in parent)) return { ok: false, reason: "원래 위치를 찾을 수 없습니다." };
  try {
    const index = Math.max(0, Math.min(rollback.originalIndex, parent.children.length));
    backup.visible = rollback.originalVisible;
    (parent as BaseNode & ChildrenMixin).insertChild(index, backup as InstanceNode);
    try { backup.x = rollback.originalX; backup.y = rollback.originalY; } catch {}
    node.remove();
    if (rollbackFrameId) {
      const frame = await figma.getNodeByIdAsync(rollbackFrameId);
      if (frame && frame.type === "FRAME" && frame.children.length === 0) {
        frame.remove();
        rollbackFrameId = "";
        rollbackFrameNode = null;
      }
    }
    return { ok: true, instanceId: backup.id };
  } catch (e: any) {
    return { ok: false, reason: String(e && e.message || e) };
  }
}

// ─── 설치기 기준 자동수집 + 개선안(복제본) 생성 ───────────────

// 이 파일에 설치된 정본 컴포넌트를 그대로 기준 풀로 사용한다(수동 등록 불필요).
// 설치기 [설치] 탭은 정본을 현재 페이지에 COMPONENT_SET 으로 생성하지만, 실무에선
// 정본이 별도 페이지(예: "Core")에 있고 화면은 다른 페이지에 있으므로 문서 전체를 훑는다.
// 단, 문서 전체를 훑으면 파일 내 레거시 세트가 섞일 수 있어 — 설치기 정본 이름 목록
// (CANONICAL_NAME_SET)에 있는 것만 남긴다. 이것이 "설치기 기준"의 실체다.
// 현재 페이지를 먼저 담아 같은 이름이 여러 곳에 있으면 현재 페이지 것이 이긴다.
function collectPageReference(preferredPage?: PageNode): ReferenceComponent[] {
  const fileName = figma.root.name;
  const seen: { [k: string]: boolean } = {};
  const out: ReferenceComponent[] = [];
  REFERENCE_NAME_CLASHES = [];
  const push = (list: ReferenceComponent[]) => {
    for (const c of list) {
      const norm = refNameKey(c.name);
      if (!CANONICAL_NAME_SET[norm]) continue;  // 정본 목록에 없는 이름은 기준에서 제외
      if (!seen[norm]) { seen[norm] = true; out.push(c); }
      // 같은 이름이 이 파일에 둘 이상 있으면 여기 적어 둔다. 레거시 파일에도 정본과 이름이 같은
      // 세트가 있어(체크박스·칩·표 등) 그것이 기준 자리를 차지하면 검수가 거꾸로 돈다.
      // 적어 둔 이름은 자동 교체에서 «확인필요»로 내려 조용히 바뀌지 않게 한다(scanSwapCandidates).
      // **열쇠는 담을 때도 찾을 때도 정규화 이름이다** — 원문으로 담으면 'Check Box' 와 'checkbox' 가
      // 서로를 못 찾아 강등이 조용히 불발된다(🤖 독립 검증 2026-09-18).
      else if (REFERENCE_NAME_CLASHES.indexOf(norm) < 0) REFERENCE_NAME_CLASHES.push(norm);
    }
  };
  const firstPage = preferredPage || figma.currentPage;
  try { push(collectComponents(firstPage, fileName)); } catch {}
  for (const page of figma.root.children) {
    if (page.id === firstPage.id) continue;
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
  manualNeeded: number;    // 이름이 안 맞아 사람이 봐야 하는 컴포넌트 수(아래 세 갈래의 합)
  decidedCount: number;    // 결정으로 정해진 수 (사람이 이미 정해 둔 것)
  undecidedCount: number;  // 아직 안 정한 수 (이번 한 번의 선택)
  notAPartCount: number;   // 교체 대상이 아닌 수 (배치 규칙·레거시에만 있는 것)
  moduleNeeded: number;    // 여러 부품이 뭉쳐 재구성이 필요한(교체 부적절) 모듈 수
  textUnpreserved: number; // 자동교체 시 정본에 대응 위치가 없어 보존 못 한 입력 텍스트 수
  totalInstances: number;
  referencePoolSize: number;
  medium?: ScreenMedium;
  mediumWhy?: string;
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
        ambiguousList.push({ ...c, demoteReason: c.demoteReason || "이름이 부분적으로만 일치해 확인이 필요합니다." });
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
        decidedCount: manualCandidates.filter((c) => c.decision && c.decision.kind === "decided").length,
        undecidedCount: manualCandidates.filter((c) => !c.decision || c.decision.kind === "undecided" || c.decision.kind === "ambiguous").length,
        notAPartCount: manualCandidates.filter((c) => c.decision && c.decision.kind === "not-a-part").length,
        moduleNeeded: modules.length,
        skippedNested: diagnostics.skippedNestedCount,
        alreadyCanonical: diagnostics.sameIdSkippedCount,
        noMatch: diagnostics.noMatchCount,
        totalInstances: diagnostics.instanceCount,
        referencePoolSize: pool.length,
        medium: diagnostics.medium,
        mediumWhy: diagnostics.mediumWhy,
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
  applyModulePartSwap,
  detachModule,
  collectModuleParts,
  getVariantOptions,
  exportNodePreview,
  exportReferencePreview,
  importComponentCopy,
  rollbackSwap,
  discardSwapRollback,
  cleanupSwapBackups,
  collectPageReference,
  buildImprovedCopy,
  auditChecklistFacts,
  detectScreenContext,
  clearV2Cache,
};
export type {
  Issue, Suggestion, ReferenceComponent, SwapCandidate, SwapDiagnostics, SavedReference, NodeKind,
  SwapMode, SwapOutcome, SwapRollback, ModulePart, ModuleFlag, ModulePartSwapResult, VariantOption, VariantInfo, ImprovedSummary, BuildImprovedResult, ChecklistItemResult, ChecklistDetailIssue, ChecklistFacts, ScreenContext };
