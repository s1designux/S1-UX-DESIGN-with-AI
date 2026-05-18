import type {
  TokenMapping,
  TokenSyncCandidate,
  TokenSyncSummary,
} from "./types";
import { getAllMappings } from "./loadRegistry";

// component-alias category: any status → excluded (deduplication)
// The figmaVariable is already covered by the parent semantic item.
function isComponentAlias(mapping: TokenMapping): boolean {
  return mapping.category === "component-alias";
}

export function classifyTokenMapping(mapping: TokenMapping): TokenSyncCandidate {
  // component-alias와 deprecated는 status 무관하게 제외
  if (isComponentAlias(mapping) || mapping.status === "deprecated") {
    return {
      id: mapping.id,
      meaning: mapping.meaning,
      cssVariable: mapping.cssVariable,
      registryToken: mapping.registryToken,
      figmaVariable: mapping.figmaVariable,
      mappingStatus: mapping.status,
      syncStatus: "excluded",
      reason: isComponentAlias(mapping)
        ? "Component alias — deduplication: parent semantic item handles the Figma write."
        : "Deprecated mappings are excluded from automatic sync.",
    };
  }

  if (mapping.status === "needs-review") {
    return {
      id: mapping.id,
      meaning: mapping.meaning,
      cssVariable: mapping.cssVariable,
      registryToken: mapping.registryToken,
      figmaVariable: mapping.figmaVariable,
      mappingStatus: mapping.status,
      syncStatus: "needs-review",
      reason: "Mapping requires manual review before sync.",
    };
  }

  if (mapping.status === "pending") {
    return {
      id: mapping.id,
      meaning: mapping.meaning,
      cssVariable: mapping.cssVariable,
      registryToken: mapping.registryToken,
      figmaVariable: mapping.figmaVariable,
      mappingStatus: mapping.status,
      syncStatus: "preview-only",
      reason: "Figma Variable candidate is not confirmed yet.",
    };
  }

  if (
    mapping.status === "stable" &&
    mapping.cssVariable &&
    mapping.registryToken &&
    mapping.figmaVariable
  ) {
    return {
      id: mapping.id,
      meaning: mapping.meaning,
      cssVariable: mapping.cssVariable,
      registryToken: mapping.registryToken,
      figmaVariable: mapping.figmaVariable,
      mappingStatus: mapping.status,
      syncStatus: "sync-ready",
      reason: "Mapping is stable and has required token references.",
    };
  }

  // stable이지만 필수 참조 누락 → fallback
  return {
    id: mapping.id,
    meaning: mapping.meaning,
    cssVariable: mapping.cssVariable,
    registryToken: mapping.registryToken,
    figmaVariable: mapping.figmaVariable,
    mappingStatus: mapping.status,
    syncStatus: "needs-review",
    reason: "Mapping does not meet sync-ready requirements (missing cssVariable, registryToken, or figmaVariable).",
  };
}

export function createTokenSyncSummary(
  mappings: TokenMapping[]
): TokenSyncSummary {
  const candidates = mappings.map(classifyTokenMapping);

  return {
    total: candidates.length,
    syncReady: candidates.filter((c) => c.syncStatus === "sync-ready").length,
    previewOnly: candidates.filter((c) => c.syncStatus === "preview-only").length,
    needsReview: candidates.filter((c) => c.syncStatus === "needs-review").length,
    excluded: candidates.filter((c) => c.syncStatus === "excluded").length,
    candidates,
  };
}

// Figma Variables API 쓰기는 기본 비활성화.
// 활성화 조건:
//   1. Figma Semantic Variables collection ID 확정
//   2. manifest.json permissions 에 "variables:write" 추가
//   3. Dry-run 미리보기 결과를 사람이 검토·승인
export async function syncStableTokens(): Promise<void> {
  throw new Error(
    "MVP-T2 does not enable direct Figma writes by default.\n" +
      "Run dry check and confirm stable mappings first.\n" +
      "Action: Confirm Figma Semantic collection ID → set in tokenSync.ts → add variables:write to manifest.json."
  );
}

// 편의 함수: registry 전체 로드 후 summary 반환
export function buildSyncPreviewFromRegistry(): TokenSyncSummary {
  const all = getAllMappings();
  return createTokenSyncSummary(all);
}
