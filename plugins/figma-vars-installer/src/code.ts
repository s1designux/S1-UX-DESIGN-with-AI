/**
 * SW Variables Installer — code.ts
 *
 * 새 Figma 파일에 S1 디자인시스템 Variables를 생성한다.
 *   - Foundation collection (Default 모드, ~200개 색상 원본값)
 *   - semantic collection (Light / Dark 2모드, ~50개 Semantic alias)
 *
 * 이미 같은 이름의 collection이 있으면 업데이트(add/overwrite) 모드로 동작한다.
 * 삭제는 하지 않는다.
 */

import {
  FOUNDATION, SEMANTIC,
  FOUNDATION_COLLECTION, SEMANTIC_COLLECTION,
  SEMANTIC_LIGHT_MODE, SEMANTIC_DARK_MODE,
} from "./vars-data";

figma.showUI(__html__, { width: 400, height: 480, title: "SW Variables Installer" });

figma.ui.onmessage = async (msg: { type: string }) => {
  if (msg.type === "install") {
    await runInstall();
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

// ── 컬렉션 get-or-create ──────────────────────────────────────────────────────

async function getOrCreateCollection(name: string): Promise<VariableCollection> {
  const all = await figma.variables.getLocalVariableCollectionsAsync();
  const existing = all.find((c) => c.name === name);
  if (existing) return existing;
  return figma.variables.createVariableCollection(name);
}

// ── 변수 get-or-create ────────────────────────────────────────────────────────

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

// ── 모드 확보 ─────────────────────────────────────────────────────────────────

function ensureMode(collection: VariableCollection, modeName: string): string {
  const found = collection.modes.find((m) => m.name === modeName);
  if (found) return found.modeId;
  return collection.addMode(modeName);
}

// ── 메인 설치 로직 ───────────────────────────────────────────────────────────

async function runInstall() {
  try {
    post("progress", { step: "Foundation collection 준비 중…", pct: 5 });

    // ── 1. Foundation collection ──────────────────────────────────────────
    const fc = await getOrCreateCollection(FOUNDATION_COLLECTION);
    const defaultModeId = fc.modes[0].modeId;
    fc.renameMode(defaultModeId, "Default");

    const foundationVarMap: Record<string, Variable> = {};
    const foundationKeys = Object.keys(FOUNDATION);

    for (let i = 0; i < foundationKeys.length; i++) {
      const path = foundationKeys[i];
      const hex  = FOUNDATION[path];
      const v = await getOrCreateVariable(path, fc, "COLOR");
      v.setValueForMode(defaultModeId, hexToRgb(hex));
      foundationVarMap[path] = v;

      if (i % 20 === 0) {
        const pct = 5 + Math.round((i / foundationKeys.length) * 40);
        post("progress", { step: `Foundation: ${path}`, pct });
      }
    }

    post("progress", { step: "semantic collection 준비 중…", pct: 50 });

    // ── 2. semantic collection ────────────────────────────────────────────
    const sc = await getOrCreateCollection(SEMANTIC_COLLECTION);
    const lightModeId = ensureMode(sc, SEMANTIC_LIGHT_MODE);
    const darkModeId  = ensureMode(sc, SEMANTIC_DARK_MODE);

    // 기본 모드명이 "Mode 1"인 경우 Light로 이름 변경
    if (sc.modes[0].name !== SEMANTIC_LIGHT_MODE && sc.modes[0].name !== SEMANTIC_DARK_MODE) {
      sc.renameMode(sc.modes[0].modeId, SEMANTIC_LIGHT_MODE);
    }

    const semanticKeys = Object.keys(SEMANTIC);

    for (let i = 0; i < semanticKeys.length; i++) {
      const path  = semanticKeys[i];
      const entry = SEMANTIC[path];
      const v = await getOrCreateVariable(path, sc, "COLOR");

      // Light 값 설정
      v.setValueForMode(lightModeId, resolveRef(entry.light, foundationVarMap));
      // Dark 값 설정
      v.setValueForMode(darkModeId,  resolveRef(entry.dark,  foundationVarMap));

      if (i % 10 === 0) {
        const pct = 50 + Math.round((i / semanticKeys.length) * 45);
        post("progress", { step: `semantic: ${path}`, pct });
      }
    }

    post("progress", { step: "완료", pct: 100 });
    post("done", {
      foundationCount: foundationKeys.length,
      semanticCount: semanticKeys.length,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    post("error", { message: msg });
  }
}

// ref 문자열 → Figma Variable 값 (alias 또는 RGBA)
function resolveRef(
  ref: string,
  foundationVarMap: Record<string, Variable>
): VariableValue {
  if (ref.startsWith("rgba")) {
    return rgbaStringToRgb(ref);
  }
  if (ref.startsWith("#")) {
    return hexToRgb(ref);
  }
  // Foundation alias
  const target = foundationVarMap[ref];
  if (!target) {
    console.warn(`[SW Installer] Foundation alias not found: ${ref}`);
    return { r: 1, g: 0, b: 1, a: 1 }; // 핑크 — 누락 표시용
  }
  return figma.variables.createVariableAlias(target);
}
