/// <reference types="@figma/plugin-typings" />

// Import 기능 — 레거시 DS 2.4 시맨틱 이름 체계를 신규 피그마 컬렉션으로 심는다.
// 기존 tokenSync.ts / export 기능은 일절 건드리지 않는다.
//
// Hybrid 패턴 (2026-06-08):
//   - "single" 모드: Foundation 성격 컬렉션 (raw 색·spacing·radius 등). 단일 Default 모드.
//   - "light-dark" 모드: Semantic 성격 컬렉션 (역할 alias). LIGHT/DARK 2-mode.
//   기본값은 "light-dark" — 기존 호출자(semantic_v2 import) 호환.

export type CollectionMode = "single" | "light-dark";

export interface ImportToken {
  name: string;
  resolvedType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  scopes?: string[];
}

export interface ImportDryRunItem {
  name: string;
  action: "create" | "skip";
  reason?: string;
}

export interface ImportDryRunResult {
  collectionName: string;
  toCreateCount: number;
  toSkipCount: number;
  items: ImportDryRunItem[];
  blocked?: {
    reason: "PROTECTED_NAME" | "COLLECTION_EXISTS";
    detail: string;
  };
}

export interface ImportApplyResult {
  collectionName: string;
  created: number;
  skipped: number;
  errors: Array<{ name: string; reason: string }>;
  createdAt: string;
}

// ── 안전장치 ③: 절대 건드리면 안 되는 기존 컬렉션 이름 목록 ──────────────────
// semantic_v2가 이미 존재하는 경우도 여기서 런타임에 차단한다.
const PROTECTED_NAMES = new Set(["semantic", "Foundation", "foundation"]);

// ── dry-run: 실제 생성 없이 충돌 검사 결과만 반환 ─────────────────────────────
export async function dryRunImport(
  tokens: ImportToken[],
  collectionName: string,
): Promise<ImportDryRunResult> {
  // 안전장치 ③-A: 보호된 이름 거부
  if (PROTECTED_NAMES.has(collectionName)) {
    return {
      collectionName,
      toCreateCount: 0,
      toSkipCount: 0,
      items: [],
      blocked: {
        reason: "PROTECTED_NAME",
        detail:
          `"${collectionName}"은 보호된 컬렉션 이름입니다. ` +
          "Foundation / semantic 컬렉션은 절대 건드릴 수 없습니다.",
      },
    };
  }

  const existingCollections =
    await figma.variables.getLocalVariableCollectionsAsync();
  const existingColNames = existingCollections.map((c) => c.name);

  // 안전장치 ③-B: 목표 이름이 이미 존재하면 즉시 차단 (semantic_v2도 포함)
  if (existingColNames.includes(collectionName)) {
    return {
      collectionName,
      toCreateCount: 0,
      toSkipCount: 0,
      items: [],
      blocked: {
        reason: "COLLECTION_EXISTS",
        detail:
          `"${collectionName}" 컬렉션이 이미 존재합니다. ` +
          "기존 컬렉션에 토큰을 추가하거나 덮어쓰지 않습니다. " +
          "Figma에서 해당 컬렉션을 삭제한 뒤 다시 시도하세요.",
      },
    };
  }

  // 안전장치 ①②: 기존 Variable 이름 수집 → 중복 이름은 skip 처리
  const existingVariables =
    await figma.variables.getLocalVariablesAsync();
  const existingVarNames = new Set(existingVariables.map((v) => v.name));

  const items: ImportDryRunItem[] = tokens.map((token) => {
    if (existingVarNames.has(token.name)) {
      return {
        name: token.name,
        action: "skip" as const,
        reason: "같은 이름의 Variable이 이미 다른 컬렉션에 존재합니다.",
      };
    }
    return { name: token.name, action: "create" as const };
  });

  return {
    collectionName,
    toCreateCount: items.filter((i) => i.action === "create").length,
    toSkipCount: items.filter((i) => i.action === "skip").length,
    items,
  };
}

// ── apply: dry-run 확인 후 실제 생성 ──────────────────────────────────────────
export async function applyImport(
  tokens: ImportToken[],
  collectionName: string,
  collectionMode: CollectionMode = "light-dark",
): Promise<ImportApplyResult> {
  const createdAt = new Date().toISOString();

  // apply 시에도 안전장치 재확인 (stale dry-run 결과로 우회하는 것 방지)
  if (PROTECTED_NAMES.has(collectionName)) {
    throw new Error(
      `보호된 컬렉션 이름 "${collectionName}" — 생성 중단됩니다.`,
    );
  }

  const existingCollections =
    await figma.variables.getLocalVariableCollectionsAsync();
  if (existingCollections.some((c) => c.name === collectionName)) {
    throw new Error(
      `"${collectionName}" 컬렉션이 이미 존재합니다 — 생성 중단됩니다.`,
    );
  }

  // 빈 토큰 목록으로 빈 컬렉션이 생성되는 것 방지
  if (tokens.length === 0) {
    throw new Error("토큰 목록이 비어 있습니다 — JSON을 먼저 붙여넣은 뒤 Dry-run을 다시 실행하세요.");
  }

  const existingVariables =
    await figma.variables.getLocalVariablesAsync();
  const existingVarNames = new Set(existingVariables.map((v) => v.name));

  // 컬렉션 생성 + 모드 설정 ─────────────────────────────────────────────────
  const collection =
    figma.variables.createVariableCollection(collectionName);
  const defaultModeId = collection.modes[0].modeId;

  if (collectionMode === "single") {
    // Foundation 성격 — 단일 Default 모드 (raw 색·spacing 등은 모드 부여 무의미)
    collection.renameMode(defaultModeId, "Default");
  } else {
    // Semantic 성격 — Light/Dark 2-mode (값은 비움, 이후 채움)
    collection.renameMode(defaultModeId, "LIGHT");
    collection.addMode("DARK");
  }

  const result: ImportApplyResult = {
    collectionName,
    created: 0,
    skipped: 0,
    errors: [],
    createdAt,
  };

  for (const token of tokens) {
    // 안전장치 ①②: 중복 이름 skip (apply 시에도 재확인)
    if (existingVarNames.has(token.name)) {
      result.skipped++;
      continue;
    }
    try {
      const variable = figma.variables.createVariable(
        token.name,
        collection.id,
        token.resolvedType as VariableResolvedDataType,
      );
      if (token.scopes && token.scopes.length > 0) {
        variable.scopes = token.scopes as VariableScope[];
      }
      // 안전장치 ⑤: 식별 마커 — 이번에 생성한 것만 나중에 식별·일괄 삭제 가능
      variable.description = `[SW DS Import] ${createdAt.slice(0, 10)}`;
      result.created++;
    } catch (e) {
      result.errors.push({ name: token.name, reason: String(e) });
    }
  }

  return result;
}
