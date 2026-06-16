/**
 * 에스원 디자인시스템 설치 — code.ts (선택형 설치, 2026-06-10 v4)
 *
 * Foundation · Semantic · Text Styles · Component Set 을 하나 또는 여러 개 선택해 설치한다.
 * 선택하지 않은 의존 항목(Semantic←Foundation, Component←Foundation·Semantic·TextStyles)은
 * 파일에 이미 설치된 것을 불러와 연결한다(없으면 안내 후 중단).
 *
 *   Foundation collection (단일 Default 모드)
 *     - COLOR: raw 색상값. light/dark 팔레트는 별도 변수명 (gray/N · gray-dark/N · ...)
 *     - FLOAT: spacing·radius·border-width·font·line (모드 무관)
 *
 *   semantic collection (Light / Dark 2모드)
 *     - COLOR: Light 모드는 light 팔레트 alias, Dark 모드는 -dark 팔레트 alias
 *     - FLOAT: Foundation FLOAT alias (모드 양쪽 동일)
 *
 * 표준 디자인 시스템 패턴 (Material 3·Apple HIG·IBM Carbon·Atlassian 동일):
 *   · Foundation은 raw 색이라 모드 부여 무의미 → 이름 분리(gray vs gray-dark)
 *   · Semantic만 모드 전환 → 컴포넌트 디자이너는 프레임 모드 토글로 자동 다크 전환
 *   · CSS tokens.css의 --color-X-N / --color-X-dark-N 와 1:1 정합
 *
 * 이미 같은 이름의 collection이 있으면 업데이트(add/overwrite) 모드로 동작한다.
 *
 * Prune (2026-06-09): 플러그인이 소유한 4개 컬렉션(Foundation·Semantic Color·
 *   Semantic Number) 안에서, 현재 데이터셋에 없는 변수는 제거한다.
 *   - 유지 변수는 이름으로 get-or-create 되어 같은 Variable 객체 재사용 → 바인딩 보존.
 *   - 옛 plugin 잔재(역할기반 color/bg·surface·action·status 등)만 삭제되며,
 *     해당 잔재에 걸린 연결만 끊어진다(의도된 동작).
 *   - prune 범위는 위 컬렉션·해당 resolvedType 으로만 한정 — 다른 컬렉션 영향 없음.
 */

import {
  FOUNDATION_COLOR, FOUNDATION_NUMBER,
  SEMANTIC_COLOR, SEMANTIC_NUMBER,
  FOUNDATION_COLLECTION,
  SEMANTIC_COLOR_COLLECTION, SEMANTIC_NUMBER_COLLECTION,
  LIGHT_MODE, DARK_MODE,
} from "./vars-data";
import { installTextStyles } from "./install-textstyles";
import { buildAllComponents } from "./build-components";

figma.showUI(__html__, { width: 440, height: 600, title: "에스원 디자인시스템 설치" });

interface InstallSelection {
  foundation: boolean;
  semantic: boolean;
  textStyles: boolean;
  components: boolean;
}

figma.ui.onmessage = async (msg: { type: string } & Partial<InstallSelection> & { mappings?: { oldId: string; newSetId: string }[] }) => {
  if (msg.type === "install") {
    await runInstall({
      foundation: msg.foundation === true,
      semantic: msg.semantic === true,
      textStyles: msg.textStyles === true,
      components: msg.components === true,
    });
  } else if (msg.type === "scan-legacy") {
    await scanLegacyComponents();
  } else if (msg.type === "swap-components") {
    await swapLegacyComponents(msg.mappings ?? []);
  } else if (msg.type === "cancel") {
    figma.closePlugin();
  }
};

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): RGBA {
  const n = parseInt(hex.replace("#", ""), 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 0xff) / 255,
    a: 1,
  };
}

function rgbaStringToRgb(rgba: string): RGBA {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseInt(m[1]) / 255,
    g: parseInt(m[2]) / 255,
    b: parseInt(m[3]) / 255,
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

function post(type: string, payload?: object) {
  figma.ui.postMessage({ type, ...payload });
}

// ── 컬렉션 / 변수 get-or-create ───────────────────────────────────────────────

async function getOrCreateCollection(name: string): Promise<VariableCollection> {
  const all = await figma.variables.getLocalVariableCollectionsAsync();
  const existing = all.find((c) => c.name === name);
  if (existing) return existing;
  return figma.variables.createVariableCollection(name);
}

async function getOrCreateVariable(
  name: string,
  collection: VariableCollection,
  resolvedType: VariableResolvedDataType
): Promise<Variable> {
  const all = await figma.variables.getLocalVariablesAsync(resolvedType);
  const existing = all.find(
    (v) => v.name === name && v.variableCollectionId === collection.id
  );
  if (existing) return existing;
  return figma.variables.createVariable(name, collection, resolvedType);
}

/**
 * 컬렉션에서 현재 데이터셋(validNames)에 없는 변수를 제거한다.
 * - 유지 변수는 getOrCreateVariable 로 이미 같은 Variable 객체를 재사용 → 바인딩 보존.
 * - 삭제 변수(옛 역할기반 bg/surface/action/status 등)에 걸린 연결만 끊어진다 (의도된 동작).
 * 같은 컬렉션·같은 resolvedType 범위로만 한정해 다른 컬렉션에 영향 없음.
 */
async function pruneCollection(
  collection: VariableCollection,
  validNames: Set<string>,
  resolvedType: VariableResolvedDataType
): Promise<string[]> {
  const all = await figma.variables.getLocalVariablesAsync(resolvedType);
  const removed: string[] = [];
  for (const v of all) {
    if (v.variableCollectionId !== collection.id) continue;
    if (validNames.has(v.name)) continue;
    removed.push(v.name);
    try { v.remove(); } catch (e) { /* skip */ }
  }
  return removed;
}

function ensureMode(collection: VariableCollection, modeName: string): string {
  const found = collection.modes.find((m) => m.name === modeName);
  if (found) return found.modeId;
  return collection.addMode(modeName);
}

/**
 * 컬렉션의 기본 모드를 Light로 리네임한 뒤 Light·Dark 모드 ID를 확보한다.
 * 순서: rename → ensureMode 로 호출해야 "Mode 1" + 새 Light + 새 Dark = 3모드 중복 버그를 피한다.
 */
function setupLightDarkModes(collection: VariableCollection): {
  lightId: string; darkId: string;
} {
  const first = collection.modes[0];
  if (first.name !== LIGHT_MODE && first.name !== DARK_MODE) {
    collection.renameMode(first.modeId, LIGHT_MODE);
  }
  const lightId = ensureMode(collection, LIGHT_MODE);
  const darkId  = ensureMode(collection, DARK_MODE);
  // Light/Dark 외 모드 제거 — 옛 plugin 의 "LIGHT"/"DARK" 대문자 모드나 "Mode 1" 잔존 정리
  const allowed = new Set([lightId, darkId]);
  const extras = collection.modes.filter((m) => !allowed.has(m.modeId));
  for (const m of extras) {
    try { collection.removeMode(m.modeId); } catch (e) { /* skip */ }
  }
  return { lightId, darkId };
}

// ── Scope 분배 ────────────────────────────────────────────────────────────────

function colorScopes(path: string): VariableScope[] {
  // 레거시 DS 2.4 컴포넌트별 토큰 — 슬롯 패턴 (button/bg/, button/border/, button/label/ 등)
  if (/^color\/[a-z-]+\/bg\//.test(path))     return ["FRAME_FILL", "SHAPE_FILL"];
  if (/^color\/[a-z-]+\/border\//.test(path)) return ["STROKE_COLOR"];
  if (/^color\/[a-z-]+\/label\//.test(path))  return ["TEXT_FILL"];
  if (/^color\/[a-z-]+\/icon\//.test(path))   return ["SHAPE_FILL", "STROKE_COLOR"];

  // 역할 기반 (Material 3 스타일 — 기존)
  if (path.startsWith("color/bg/") || path.startsWith("color/surface/")) {
    return ["FRAME_FILL", "SHAPE_FILL"];
  }
  if (path.startsWith("color/text/"))   return ["TEXT_FILL"];
  if (path.startsWith("color/border/")) return ["STROKE_COLOR"];
  if (path.startsWith("color/icon/"))   return ["SHAPE_FILL", "STROKE_COLOR"];
  if (path.startsWith("color/action/")) return ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL"];
  if (path.startsWith("color/status/")) return ["FRAME_FILL", "TEXT_FILL", "STROKE_COLOR"];
  if (path === "color/overlay")         return ["FRAME_FILL"];
  // Foundation primitives — 광범위 허용
  return ["ALL_SCOPES"];
}

function numberScopes(path: string): VariableScope[] {
  if (path.startsWith("spacing/"))      return ["GAP"];
  if (path.startsWith("sizing/"))       return ["WIDTH_HEIGHT"]; // Foundation sizing/N (컴포넌트별 사이징 폐지 2026-06-12)
  if (path.startsWith("radius/"))       return ["CORNER_RADIUS"];
  if (path.startsWith("border-width/")) return ["STROKE_FLOAT"];
  if (path.startsWith("font-size/"))    return ["FONT_SIZE"];
  if (path.startsWith("font-weight/"))  return ["FONT_WEIGHT"];
  if (path.startsWith("line-height/"))  return ["LINE_HEIGHT"];
  return ["ALL_SCOPES"];
}

// ── Ref 해석 ──────────────────────────────────────────────────────────────────

function resolveColorRef(
  ref: string,
  foundationColorMap: Record<string, Variable>
): VariableValue {
  if (ref.startsWith("rgba")) return rgbaStringToRgb(ref);
  if (ref.startsWith("#"))    return hexToRgb(ref);
  const target = foundationColorMap[ref];
  if (!target) {
    console.warn(`[SW Installer] Foundation color alias not found: ${ref}`);
    return { r: 1, g: 0, b: 1, a: 1 };
  }
  return figma.variables.createVariableAlias(target);
}

function resolveNumberRef(
  ref: string | number,
  foundationNumberMap: Record<string, Variable>
): VariableValue {
  if (typeof ref === "number") return ref;
  const target = foundationNumberMap[ref];
  if (!target) {
    console.warn(`[SW Installer] Foundation number alias not found: ${ref}`);
    return 0;
  }
  return figma.variables.createVariableAlias(target);
}

// ── 메인 설치 로직 ───────────────────────────────────────────────────────────

/**
 * Foundation 컬렉션의 기본 모드를 "Default"로 정리한다.
 * Foundation은 raw 색이라 모드 부여가 무의미 → 단일 모드 유지 (Hybrid 패턴).
 * 기존 컬렉션에 LIGHT/DARK 등 추가 모드가 있으면 제거 (옛 plugin 호환 정리).
 */
function setupSingleMode(collection: VariableCollection, modeName: string): string {
  const first = collection.modes[0];
  if (first.name !== modeName) {
    collection.renameMode(first.modeId, modeName);
  }
  // 추가 모드 제거 — Foundation 은 단일 Default 만 유지
  // (Figma 는 마지막 모드 제거 불가하므로 first 외 모두 제거)
  const extras = collection.modes.filter((m) => m.modeId !== first.modeId);
  for (const m of extras) {
    try { collection.removeMode(m.modeId); } catch (e) { /* skip */ }
  }
  return first.modeId;
}

/** 이미 설치된 컬렉션의 변수 맵을 이름 기준으로 불러온다 (선택 안 한 의존 항목 연결용). */
async function loadExistingVarMap(
  collectionName: string,
  resolvedType: VariableResolvedDataType
): Promise<Record<string, Variable>> {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const col = cols.find((c) => c.name === collectionName);
  const map: Record<string, Variable> = {};
  if (!col) return map;
  const vars = await figma.variables.getLocalVariablesAsync(resolvedType);
  for (const v of vars) {
    if (v.variableCollectionId === col.id) map[v.name] = v;
  }
  return map;
}

interface FoundationResult {
  colorMap: Record<string, Variable>;
  numberMap: Record<string, Variable>;
  removed: string[];
  count: number;
}

/** Foundation 컬렉션(Color + Number) 설치 + prune. */
async function installFoundation(): Promise<FoundationResult> {
  post("progress", { step: "Foundation collection 준비 중…", pct: 3 });
  const fc = await getOrCreateCollection(FOUNDATION_COLLECTION);
  const fDefaultId = setupSingleMode(fc, "Default");

  const colorMap: Record<string, Variable> = {};
  const fcColorKeys = Object.keys(FOUNDATION_COLOR);
  for (let i = 0; i < fcColorKeys.length; i++) {
    const path = fcColorKeys[i];
    const v = await getOrCreateVariable(path, fc, "COLOR");
    v.setValueForMode(fDefaultId, hexToRgb(FOUNDATION_COLOR[path]));
    v.scopes = colorScopes(path);
    colorMap[path] = v;
    if (i % 20 === 0) {
      post("progress", { step: `Foundation Color: ${path}`, pct: 3 + Math.round((i / fcColorKeys.length) * 22) });
    }
  }
  const removedColor = await pruneCollection(fc, new Set(fcColorKeys), "COLOR");

  post("progress", { step: "Foundation Number 준비 중…", pct: 28 });
  const numberMap: Record<string, Variable> = {};
  const fcNumberKeys = Object.keys(FOUNDATION_NUMBER);
  for (let i = 0; i < fcNumberKeys.length; i++) {
    const path = fcNumberKeys[i];
    const v = await getOrCreateVariable(path, fc, "FLOAT");
    v.setValueForMode(fDefaultId, FOUNDATION_NUMBER[path]);
    v.scopes = numberScopes(path);
    numberMap[path] = v;
    if (i % 10 === 0) {
      post("progress", { step: `Foundation Number: ${path}`, pct: 28 + Math.round((i / fcNumberKeys.length) * 15) });
    }
  }
  const removedNumber = await pruneCollection(fc, new Set(fcNumberKeys), "FLOAT");

  return {
    colorMap, numberMap,
    removed: [...removedColor, ...removedNumber],
    count: fcColorKeys.length + fcNumberKeys.length,
  };
}

interface SemanticResult {
  semanticColorMap: Record<string, Variable>;
  scc: VariableCollection;
  lightModeId: string;
  darkModeId: string;
  removed: string[];
  count: number;
}

/** Semantic Color(2-mode) + Semantic Number 설치 + prune. Foundation 맵 필요(alias 해석). */
async function installSemantic(
  foundationColorMap: Record<string, Variable>,
  foundationNumberMap: Record<string, Variable>
): Promise<SemanticResult> {
  post("progress", { step: "Semantic Color collection 준비 중…", pct: 50 });
  const scc = await getOrCreateCollection(SEMANTIC_COLOR_COLLECTION);
  const { lightId: sLightId, darkId: sDarkId } = setupLightDarkModes(scc);

  const scColorKeys = Object.keys(SEMANTIC_COLOR);
  const semanticColorMap: Record<string, Variable> = {};
  for (let i = 0; i < scColorKeys.length; i++) {
    const path = scColorKeys[i];
    const entry = SEMANTIC_COLOR[path];
    const v = await getOrCreateVariable(path, scc, "COLOR");
    v.setValueForMode(sLightId, resolveColorRef(entry.light, foundationColorMap));
    v.setValueForMode(sDarkId, resolveColorRef(entry.dark, foundationColorMap));
    v.scopes = colorScopes(path);
    semanticColorMap[path] = v;
    if (i % 10 === 0) {
      post("progress", { step: `Semantic Color: ${path}`, pct: 50 + Math.round((i / scColorKeys.length) * 22) });
    }
  }
  const removedSemanticColor = await pruneCollection(scc, new Set(scColorKeys), "COLOR");

  post("progress", { step: "Semantic Number collection 준비 중…", pct: 73 });
  const scn = await getOrCreateCollection(SEMANTIC_NUMBER_COLLECTION);
  const scnDefaultId = setupSingleMode(scn, "Default");
  const scNumberKeys = Object.keys(SEMANTIC_NUMBER);
  for (let i = 0; i < scNumberKeys.length; i++) {
    const path = scNumberKeys[i];
    const v = await getOrCreateVariable(path, scn, "FLOAT");
    v.setValueForMode(scnDefaultId, resolveNumberRef(SEMANTIC_NUMBER[path], foundationNumberMap));
    v.scopes = numberScopes(path);
    if (i % 10 === 0) {
      post("progress", { step: `Semantic Number: ${path}`, pct: 73 + Math.round((i / scNumberKeys.length) * 13) });
    }
  }
  const removedSemanticNumber = await pruneCollection(scn, new Set(scNumberKeys), "FLOAT");

  return {
    semanticColorMap, scc, lightModeId: sLightId, darkModeId: sDarkId,
    removed: [...removedSemanticColor, ...removedSemanticNumber],
    count: scColorKeys.length + scNumberKeys.length,
  };
}

/** 이미 설치된 Semantic Color 컬렉션 + 변수 맵 + Light 모드를 불러온다 (컴포넌트만 설치 시). */
async function loadExistingSemantic(): Promise<{
  semanticColorMap: Record<string, Variable>;
  scc: VariableCollection;
  lightModeId: string;
  darkModeId: string;
} | null> {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const scc = cols.find((c) => c.name === SEMANTIC_COLOR_COLLECTION);
  if (!scc) return null;
  const light = scc.modes.find((m) => m.name === LIGHT_MODE);
  const dark = scc.modes.find((m) => m.name === DARK_MODE);
  const lightModeId = light ? light.modeId : scc.modes[0].modeId;
  const darkModeId = dark ? dark.modeId : lightModeId; // Dark 모드 없으면 Light 로 대체
  const semanticColorMap = await loadExistingVarMap(SEMANTIC_COLOR_COLLECTION, "COLOR");
  return { semanticColorMap, scc, lightModeId, darkModeId };
}

async function runInstall(sel: InstallSelection) {
  try {
    if (!sel.foundation && !sel.semantic && !sel.textStyles && !sel.components) {
      throw new Error("설치할 항목을 하나 이상 선택하세요.");
    }
    post("progress", { step: "준비 중…", pct: 2 });

    const removedAll: string[] = [];
    let foundationCount = 0;
    let semanticCount = 0;
    let textStyleCount = 0;
    let componentCount = 0;

    // ── Foundation (또는 의존 항목 위해 기존 로드) ──
    let foundationColorMap: Record<string, Variable> = {};
    let foundationNumberMap: Record<string, Variable> = {};
    if (sel.foundation) {
      const r = await installFoundation();
      foundationColorMap = r.colorMap;
      foundationNumberMap = r.numberMap;
      foundationCount = r.count;
      removedAll.push(...r.removed);
    } else if (sel.semantic || sel.components) {
      foundationColorMap = await loadExistingVarMap(FOUNDATION_COLLECTION, "COLOR");
      foundationNumberMap = await loadExistingVarMap(FOUNDATION_COLLECTION, "FLOAT");
    }

    // ── Semantic (또는 컴포넌트 위해 기존 로드) ──
    let semanticColorMap: Record<string, Variable> = {};
    let scc: VariableCollection | null = null;
    let lightModeId = "";
    let darkModeId = "";
    if (sel.semantic) {
      if (Object.keys(foundationColorMap).length === 0) {
        throw new Error("Semantic 설치에는 Foundation 이 필요합니다. Foundation 도 함께 선택하거나 먼저 설치하세요.");
      }
      const r = await installSemantic(foundationColorMap, foundationNumberMap);
      semanticColorMap = r.semanticColorMap;
      scc = r.scc;
      lightModeId = r.lightModeId;
      darkModeId = r.darkModeId;
      semanticCount = r.count;
      removedAll.push(...r.removed);
    } else if (sel.components) {
      const loaded = await loadExistingSemantic();
      if (loaded) {
        semanticColorMap = loaded.semanticColorMap;
        scc = loaded.scc;
        lightModeId = loaded.lightModeId;
        darkModeId = loaded.darkModeId;
      }
    }

    // ── Text Styles (또는 컴포넌트 위해 동반 설치) ──
    let textStyleMap: Record<string, TextStyle> = {};
    if (sel.textStyles || sel.components) {
      post("progress", { step: "Text Styles 설치 중…", pct: 88 });
      textStyleMap = await installTextStyles((step, pct) => post("progress", { step, pct }), 88, 94);
      textStyleCount = Object.keys(textStyleMap).length;
    }

    // ── Component Set (Button primary 16-variant) ──
    if (sel.components) {
      if (!scc || !lightModeId) {
        throw new Error("컴포넌트 세트 생성에는 Semantic Color V2 가 필요합니다. Semantic 도 함께 선택하거나 먼저 설치하세요.");
      }
      if (Object.keys(foundationNumberMap).length === 0) {
        throw new Error("컴포넌트 세트 생성에는 Foundation 이 필요합니다. Foundation 도 함께 선택하거나 먼저 설치하세요.");
      }
      post("progress", { step: "컴포넌트 생성 중…", pct: 92 });
      componentCount = await buildAllComponents(
        {
          semanticColor: semanticColorMap,
          foundationNumber: foundationNumberMap,
          textStyles: textStyleMap,
          semanticColorCollectionId: scc.id,
          semanticLightModeId: lightModeId,
          semanticDarkModeId: darkModeId,
        },
        (step, pct) => post("progress", { step, pct })
      );
    }

    post("progress", { step: "완료", pct: 100 });
    post("done", {
      foundationCount,
      semanticCount,
      textStyleCount,
      componentCount,
      removedCount: removedAll.length,
      removedNames: removedAll,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    post("error", { message: msg });
  }
}
