/**
 * match-figma-variable-metadata.mjs
 *
 * 두 가지 모드를 지원한다.
 *
 * 1. token-sync (기본)
 *    T1/T2 sync-ready 18개 항목과 Figma Variables metadata를 매칭한다.
 *    figma-css-token-map.json을 직접 수정하지 않는다.
 *
 * 2. ux-guide-2.4
 *    UX Guide 2.4 legacy Variables 전체를 inventory화하고
 *    canonical registry token 후보를 분석한다.
 *    registry를 자동 수정하지 않는다.
 *
 * 사용:
 *   node scripts/figma/match-figma-variable-metadata.mjs
 *   node scripts/figma/match-figma-variable-metadata.mjs --profile ux-guide-2.4 --source registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json
 *   node scripts/figma/match-figma-variable-metadata.mjs --profile darkmode-test --source registry/figma/snapshots/figma-variable-metadata.darkmode-test.json
 *
 * CLI 옵션:
 *   --source <path>   : 사용할 metadata 파일 경로 (ROOT 기준 상대경로)
 *   --profile <name>  : token-sync | ux-guide-2.4 | darkmode-test
 *
 * Source 결정 순서:
 *   1. --source CLI 옵션
 *   2. FIGMA_METADATA_SOURCE 환경변수
 *   3. registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json  (profile=ux-guide-2.4일 때)
 *   4. registry/figma/figma-variable-metadata.local.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

// ── CLI 인자 파싱 ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
};

const cliSource  = getArg("--source");
const profile    = getArg("--profile") ?? "token-sync";

const VALID_PROFILES = ["token-sync", "ux-guide-2.4", "darkmode-test"];
if (!VALID_PROFILES.includes(profile)) {
  console.error(`[ERROR] 알 수 없는 profile: "${profile}"`);
  console.error(`  사용 가능한 profile: ${VALID_PROFILES.join(", ")}`);
  process.exit(1);
}

// ── Source 경로 결정 ──────────────────────────────────────────────────────────

function resolveMetadataPath() {
  if (cliSource) {
    const p = join(ROOT, cliSource);
    if (!existsSync(p)) {
      console.error(`[ERROR] --source로 지정한 파일이 없습니다: ${cliSource}`);
      process.exit(1);
    }
    return p;
  }

  const envSource = process.env.FIGMA_METADATA_SOURCE;
  if (envSource) {
    const p = join(ROOT, envSource);
    if (existsSync(p)) return p;
    console.warn(`[WARN] FIGMA_METADATA_SOURCE 경로 없음: ${envSource} — fallback 사용`);
  }

  if (profile === "ux-guide-2.4") {
    const uxPath = join(ROOT, "registry", "figma", "snapshots", "figma-variable-metadata.ux-guide-2.4.json");
    if (existsSync(uxPath)) return uxPath;
    console.error("[ERROR] UX Guide 2.4 snapshot이 없습니다.");
    console.error("");
    console.error("  아래 순서로 export 후 저장하세요:");
    console.error("  1. Figma에서 실제 S1 UX 디자인가이드 2.4 파일 열기");
    console.error("  2. Plugins > SW Token Sync 실행");
    console.error("  3. [Export Variables] 버튼 클릭");
    console.error("  4. [Download JSON] 클릭");
    console.error("  5. 저장 위치:");
    console.error("     registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json");
    console.error("");
    console.error("  또는 명시적 경로를 지정하세요:");
    console.error("  node scripts/figma/match-figma-variable-metadata.mjs --profile ux-guide-2.4 --source <path>");
    process.exit(1);
  }

  const localPath = join(ROOT, "registry", "figma", "figma-variable-metadata.local.json");
  if (existsSync(localPath)) return localPath;

  console.error("[ERROR] metadata 파일을 찾을 수 없습니다.");
  console.error("");
  console.error("  metadata를 생성하는 방법:");
  console.error("  A. Figma Plugin: Plugins > SW Token Sync > [Export Variables] > Download JSON");
  console.error("     → registry/figma/figma-variable-metadata.local.json 에 저장");
  console.error("  B. REST API: node --env-file=.env scripts/figma/fetch-figma-variables.mjs");
  process.exit(1);
}

const METADATA_PATH    = resolveMetadataPath();
const TOKEN_MAP_PATH   = join(ROOT, "registry", "tokens", "figma-css-token-map.json");
const REPORTS_DIR      = join(ROOT, "reports");
const SNAPSHOTS_DIR    = join(ROOT, "registry", "figma", "snapshots");
const FIGMA_DIR        = join(ROOT, "registry", "figma");
const TOKENS_DIR       = join(ROOT, "registry", "tokens");

mkdirSync(REPORTS_DIR,   { recursive: true });
mkdirSync(SNAPSHOTS_DIR, { recursive: true });

const tokenMap = JSON.parse(readFileSync(TOKEN_MAP_PATH, "utf8"));
const metadata = JSON.parse(readFileSync(METADATA_PATH, "utf8"));

const metaSource    = metadata.meta.source   ?? "unknown";
const metaFileRef   = metadata.meta.fileKey  ?? metadata.meta.fileName ?? "";
const metaFetchedAt = metadata.meta.fetchedAt ?? "";
const now           = new Date().toISOString().slice(0, 10);

console.log(`[INFO] profile   : ${profile}`);
console.log(`[INFO] source    : ${METADATA_PATH.replace(ROOT, ".")}`);
console.log(`[INFO] fileName  : ${metaFileRef}`);
console.log(`[INFO] variables : ${metadata.variables.length}`);

// ── 공통 유틸 ─────────────────────────────────────────────────────────────────

function isComponentAlias(item) { return item.category === "component-alias"; }

// ── Profile 분기 ──────────────────────────────────────────────────────────────

if (profile === "ux-guide-2.4") {
  runLegacyAudit();
} else {
  runTokenSyncMatch();
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE 1: Token Sync Match (token-sync / darkmode-test)
// ═════════════════════════════════════════════════════════════════════════════

function runTokenSyncMatch() {
  const isDarkmode = profile === "darkmode-test";

  if (isDarkmode) {
    console.log("[WARN] profile=darkmode-test: 이 결과는 experimental reference입니다.");
    console.log("[WARN] 운영 registry 반영 금지. 참고용으로만 사용하세요.");
  }

  const syncReadyItems = tokenMap.mappings
    .flatMap((g) => g.items)
    .filter(
      (item) =>
        !isComponentAlias(item) &&
        item.status === "stable" &&
        item.cssVariable &&
        item.registryToken &&
        item.figmaVariable
    );

  const figmaByName = {};
  for (const v of metadata.variables) {
    if (!figmaByName[v.name]) figmaByName[v.name] = [];
    figmaByName[v.name].push(v);
  }

  const variableIdToRegistryIds = new Map();

  const matchResults = syncReadyItems.map((item) => {
    const candidates = figmaByName[item.figmaVariable] ?? [];
    let matchStatus, matched = null, note = "";

    if (candidates.length === 0) {
      matchStatus = "not-found";
      note = "Figma Variables에 해당 이름 없음.";
    } else if (candidates.length > 1) {
      matchStatus = "duplicate-name";
      note = `같은 이름의 Variable ${candidates.length}개 발견.`;
      matched = candidates[0];
    } else {
      matched = candidates[0];
      if (matched.resolvedType !== "COLOR") {
        matchStatus = "type-mismatch";
        note = `resolvedType이 COLOR가 아님: ${matched.resolvedType}`;
      } else {
        const col = metadata.collections.find((c) => c.id === matched.collectionId);
        if (!col?.modes?.length) {
          matchStatus = "mode-missing";
          note = "컬렉션 mode 정보 없음.";
        } else {
          matchStatus = "matched";
          note = `collectionName: ${matched.collectionName}, modes: ${col.modes.map((m) => m.name).join(" / ")}`;
        }
      }
    }

    if (matched) {
      const existing = variableIdToRegistryIds.get(matched.id) ?? [];
      existing.push(item.id);
      variableIdToRegistryIds.set(matched.id, existing);
    }
    return { item, matched, matchStatus, note };
  });

  for (const result of matchResults) {
    if (result.matched) {
      const ids = variableIdToRegistryIds.get(result.matched.id) ?? [];
      if (ids.length > 1 && result.matchStatus === "matched") {
        result.matchStatus = "dedup-required";
        result.note = `${ids.length}개 registry 항목이 동일 variableId 공유: [${ids.join(", ")}]`;
      }
    }
  }

  const stats = { total: matchResults.length, matched: 0, "dedup-required": 0, "not-found": 0, "duplicate-name": 0, "type-mismatch": 0, "mode-missing": 0 };
  for (const r of matchResults) stats[r.matchStatus] = (stats[r.matchStatus] ?? 0) + 1;

  const patch = {
    meta: {
      generatedAt: new Date().toISOString(),
      profile,
      source: "match-figma-variable-metadata",
      metadataSource: metaSource,
      figmaFileRef: metaFileRef,
      fetchedAt: metaFetchedAt,
      note: isDarkmode
        ? "⚠️ darkmode-test experimental reference — 운영 registry 반영 금지."
        : "이 파일은 사람이 검토 후 registry에 반영한다. 자동 적용 금지.",
    },
    items: matchResults.map(({ item, matched, matchStatus, note }) => {
      const col = matched ? metadata.collections.find((c) => c.id === matched.collectionId) : null;
      return {
        id: item.id, cssVariable: item.cssVariable, figmaVariable: item.figmaVariable, matchStatus, note,
        patch: matched && !["not-found","type-mismatch"].includes(matchStatus)
          ? { collectionName: matched.collectionName, collectionId: matched.collectionId, variableId: matched.id, variableKey: matched.key, resolvedType: matched.resolvedType, modes: col?.modes ?? [], valuesByMode: matched.valuesByMode }
          : null,
      };
    }),
  };

  const tableRows = matchResults.map(({ item, matched, matchStatus, note }) => {
    const colName = matched ? matched.collectionName : "—";
    const status = { matched: "✅ matched", "dedup-required": "⚠️ dedup-required", "not-found": "❌ not-found", "duplicate-name": "⚠️ duplicate-name", "type-mismatch": "❌ type-mismatch", "mode-missing": "⚠️ mode-missing" }[matchStatus] ?? matchStatus;
    return `| \`${item.id}\` | \`${item.figmaVariable}\` | ${colName} | ${status} | ${note} |`;
  }).join("\n");

  const collectionSummary = metadata.collections.map((c) =>
    `| \`${c.name}\` | \`${c.id}\` | ${c.modes.map((m) => m.name).join(" / ")} | ${c.variableIds.length} |`
  ).join("\n");

  const warningBanner = isDarkmode
    ? `\n> ⚠️ **주의: profile=darkmode-test** — 이 결과는 experimental reference입니다. 운영 registry에 반영하지 않습니다.\n`
    : "";

  const report = `# MVP-T2 Figma Variable Metadata Report

**Date:** ${now}
**Profile:** ${profile}
**Figma File:** ${metaFileRef}
**Source:** ${metaSource}
${warningBanner}
---

## 1. 수집 결과 요약

| 항목 | 개수 |
|---|---:|
| variable collections | ${metadata.collections.length} |
| variables (전체) | ${metadata.variables.length} |
| COLOR variables | ${metadata.variables.filter((v) => v.resolvedType === "COLOR").length} |

### Collections

| collectionName | collectionId | modes | variable 수 |
|---|---|---|---:|
${collectionSummary}

---

## 2. sync-ready 항목 매칭 결과 (${syncReadyItems.length}개)

| id | figmaVariable | collectionName | matchStatus | 비고 |
|---|---|---|---|---|
${tableRows}

### 통계

| matchStatus | 수 |
|---|---:|
| ✅ matched | ${stats.matched} |
| ⚠️ dedup-required | ${stats["dedup-required"]} |
| ⚠️ duplicate-name | ${stats["duplicate-name"]} |
| ⚠️ mode-missing | ${stats["mode-missing"]} |
| ❌ not-found | ${stats["not-found"]} |
| ❌ type-mismatch | ${stats["type-mismatch"]} |

---

## 3. write 보류 사유

- write API 미사용 (variables:write 권한 없음)
- syncStableTokens() throw 상태 유지
- 매칭 결과 사람 검수 필요${isDarkmode ? "\n- darkmode-test 파일 기준 — 운영 반영 금지" : ""}
`;

  const patchPath  = isDarkmode
    ? join(SNAPSHOTS_DIR, "figma-variable-metadata.darkmode-test.patch.json")
    : join(FIGMA_DIR,     "figma-variable-metadata.patch.json");
  const reportPath = isDarkmode
    ? join(REPORTS_DIR, "mvp-t2-figma-variable-metadata.darkmode-test.md")
    : join(REPORTS_DIR, "mvp-t2-figma-variable-metadata.md");

  writeFileSync(patchPath,  JSON.stringify(patch, null, 2));
  writeFileSync(reportPath, report);

  console.log(`\n[OK] Token Sync Match 완료`);
  console.log(`  sync-ready : ${syncReadyItems.length}`);
  Object.entries(stats).forEach(([k, v]) => { if (k !== "total") console.log(`  ${k.padEnd(16)}: ${v}`); });
  console.log(`\n출력:`);
  console.log(`  ${reportPath.replace(ROOT + "/", "")}`);
  console.log(`  ${patchPath.replace(ROOT + "/", "")}`);
  if (isDarkmode) console.log(`\n[중요] darkmode-test 결과 — 운영 registry 반영 금지.`);
  else            console.log(`\n[중요] patch.json 검수 후 registry 반영. 자동 적용하지 않습니다.`);
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE 2: Legacy Audit (ux-guide-2.4)
// ═════════════════════════════════════════════════════════════════════════════

function runLegacyAudit() {
  console.log("[INFO] mode: UX Guide 2.4 Legacy Token Audit");

  const allVars     = metadata.variables;
  const collections = metadata.collections;
  const colorVars   = allVars.filter((v) => v.resolvedType === "COLOR");

  // ── Foundation 계층 분류기 ─────────────────────────────────────────────────
  // Primary  : 컬렉션 이름이 Foundation / Primitive / Base 계열
  // Secondary: variable 이름에 Foundation 패턴 포함
  // Tertiary : 이름 말미가 numeric scale (50~950)

  const FOUNDATION_COLLECTION_NAMES = new Set([
    "Foundation", "Primitives", "Primitive", "Base", "Global",
  ]);

  const FOUNDATION_NAME_PATTERNS = [
    "foundation", "primitive", "base", "global", "palette",
    "ref", "reference", "scale",
    "gray", "grey", "neutral", "black", "white",
    "blue", "red", "green", "yellow", "orange", "purple",
    "cyan", "teal", "indigo", "pink",
    "alpha", "opacity", "transparent",
  ];

  const FOUNDATION_SCALE_RE = /\/(50|100|150|200|250|300|350|400|450|500|550|600|700|800|900|950)$/;

  function classifyLayer(v) {
    if (FOUNDATION_COLLECTION_NAMES.has(v.collectionName)) {
      return { layer: "Foundation", reason: `collection: ${v.collectionName}`, confidence: "high" };
    }
    const lower = v.name.toLowerCase();
    for (const p of FOUNDATION_NAME_PATTERNS) {
      if (lower.includes(p)) {
        return { layer: "Foundation", reason: `name pattern: "${p}"`, confidence: "medium" };
      }
    }
    if (FOUNDATION_SCALE_RE.test(v.name)) {
      return { layer: "Foundation", reason: "numeric scale suffix (50–950)", confidence: "medium" };
    }
    return { layer: "Semantic", reason: "no foundation pattern detected", confidence: "medium" };
  }

  // ── Semantic 그룹 분류 ────────────────────────────────────────────────────

  const GROUP_PATTERNS = [
    { group: "form-control / input",  patterns: ["form", "control", "input"] },
    { group: "button",                patterns: ["button", "btn", "action"] },
    { group: "text",                  patterns: ["text", "label", "placeholder", "helper"] },
    { group: "border",                patterns: ["border", "outline", "stroke"] },
    { group: "background / surface",  patterns: ["bg", "background", "surface", "fill"] },
    { group: "icon",                  patterns: ["icon"] },
    { group: "status / state",        patterns: ["state", "status", "error", "danger", "success", "correct", "warning", "disabled", "focus", "hover"] },
    { group: "overlay / shadow",      patterns: ["overlay", "shadow", "dim"] },
    { group: "foundation / base",     patterns: ["gray", "blue", "red", "green", "orange", "yellow", "purple", "brown", "skyblue", "base", "brand", "visual"] },
  ];

  function classifyGroup(varName) {
    const lower = varName.toLowerCase();
    for (const { group, patterns } of GROUP_PATTERNS) {
      if (patterns.some((p) => lower.includes(p))) return group;
    }
    return "other";
  }

  // ── canonical token 후보 자동 제안 ──────────────────────────────────────

  const canonicalItems = tokenMap.mappings.flatMap((g) => g.items);

  function suggestCanonical(legacyName) {
    const lower = legacyName.toLowerCase().replace(/[-_/\s]+/g, "-");
    const direct = canonicalItems.find((item) =>
      item.figmaVariable && item.figmaVariable.toLowerCase().replace(/[-_/\s]+/g, "-") === lower
    );
    if (direct) return { token: direct.id, css: direct.cssVariable, confidence: "high" };
    const lastSeg = lower.split("-").pop();
    const partial = canonicalItems.filter((item) =>
      item.cssVariable && item.cssVariable.includes(lastSeg)
    );
    if (partial.length === 1) return { token: partial[0].id, css: partial[0].cssVariable, confidence: "medium" };
    if (partial.length > 1)   return { token: partial.map((i) => i.id).join(" / "), css: "", confidence: "low" };
    return { token: "", css: "", confidence: "no-candidate" };
  }

  // ── 각 variable 분류 (layer + group + canonical 제안) ───────────────────

  const classified = colorVars.map((v) => {
    const layerInfo  = classifyLayer(v);
    const suggestion = layerInfo.layer === "Semantic"
      ? suggestCanonical(v.name)
      : { token: "", css: "", confidence: "no-candidate" };
    const group = classifyGroup(v.name);
    const col   = collections.find((c) => c.id === v.collectionId);

    let migrationStatus;
    if (layerInfo.layer === "Foundation")        migrationStatus = "foundation-candidate";
    else if (suggestion.confidence === "high")   migrationStatus = "mapped";
    else                                         migrationStatus = "needs-review";

    return {
      id:                              `legacy.${v.name.replace(/\//g, ".").replace(/\s+/g, "-")}`,
      legacyFigmaVariable:             v.name,
      legacyVariableId:                v.id,
      legacyCollectionId:              v.collectionId,
      legacyCollectionName:            v.collectionName,
      legacyModeIds:                   col ? col.modes.map((m) => m.modeId) : [],
      legacyResolvedType:              v.resolvedType,
      meaning:                         "",
      suggestedLayer:                  layerInfo.layer,
      suggestedGroup:                  group,
      classificationReason:            layerInfo.reason,
      layerConfidence:                 layerInfo.confidence,
      canonicalRegistryToken:          suggestion.token,
      canonicalCssVariable:            suggestion.css,
      canonicalFigmaVariableCandidate: "",
      migrationStatus,
      canonicalConfidence:             suggestion.confidence,
      notes:                           [],
    };
  });

  // ── Foundation / Semantic 분리 ──────────────────────────────────────────

  const foundationClassified   = classified.filter((m) => m.suggestedLayer === "Foundation");
  const semanticClassified     = classified.filter((m) => m.suggestedLayer === "Semantic");
  const foundationByCollection = colorVars.filter((v) => FOUNDATION_COLLECTION_NAMES.has(v.collectionName));
  const foundationByPattern    = foundationClassified.filter((m) => !FOUNDATION_COLLECTION_NAMES.has(m.legacyCollectionName));

  // ── Semantic 그룹 집계 ───────────────────────────────────────────────────

  const groupedVars = {};
  for (const m of semanticClassified) {
    if (!groupedVars[m.suggestedGroup]) groupedVars[m.suggestedGroup] = [];
    groupedVars[m.suggestedGroup].push(m);
  }

  // ── Foundation namespace 분석 ────────────────────────────────────────────

  const foundationNS = {};
  for (const m of foundationClassified) {
    const parts = m.legacyFigmaVariable.split("/");
    const ns    = parts.slice(0, Math.min(2, parts.length)).join("/");
    if (!foundationNS[ns]) foundationNS[ns] = [];
    foundationNS[ns].push(m);
  }

  // ── migrationStatus 통계 ─────────────────────────────────────────────────

  const mStats = {};
  for (const m of classified) mStats[m.migrationStatus] = (mStats[m.migrationStatus] ?? 0) + 1;

  // ── legacy-token-map.json (v0.2.0) ──────────────────────────────────────

  const legacyTokenMap = {
    meta: {
      name:          "S1 UX Guide Legacy Token Map",
      version:       "0.2.0",
      status:        "draft",
      source:        "ux-guide-2.4",
      generatedAt:   new Date().toISOString(),
      figmaFileRef:  metaFileRef,
      description:   "Maps legacy Figma Variables from S1 UX Guide 2.4 to canonical registry tokens. v0.2.0: suggestedLayer / suggestedGroup / classificationReason 추가.",
      sourceOfTruth: "code-registry",
      tokenLayers:   ["Foundation Token", "Semantic Token", "Component Token"],
    },
    sources: [
      { id: "ux-guide-2.4",  type: "figma-variable-snapshot", path: "registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json", role: "legacy-source-snapshot" },
      { id: "darkmode-test", type: "figma-variable-snapshot", path: "registry/figma/snapshots/figma-variable-metadata.darkmode-test.json", role: "experimental-reference" },
    ],
    foundationCandidates: classified.filter((m) => m.migrationStatus === "foundation-candidate"),
    mappings:             classified.filter((m) => m.migrationStatus === "mapped"),
    needsReview:          classified.filter((m) => m.migrationStatus === "needs-review"),
    deprecatedAliases:    [],
  };

  writeFileSync(join(TOKENS_DIR, "legacy-token-map.json"), JSON.stringify(legacyTokenMap, null, 2));

  // ── 테이블 행 생성 ─────────────────────────────────────────────────────

  const collectionRows = collections.map((c) =>
    `| \`${c.name}\` | ${c.modes.map((m) => m.name).join(" / ")} | ${c.variableIds.length} |`
  ).join("\n");

  const groupSummaryRows = Object.entries(groupedVars)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([g, items]) => `| ${g} | ${items.length} |`)
    .join("\n");

  const semanticDetailRows = semanticClassified.map((m) => {
    const col   = collections.find((c) => c.id === m.legacyCollectionId);
    const modes = col ? col.modes.map((mo) => mo.name).join(" / ") : "—";
    return `| \`${m.legacyFigmaVariable}\` | ${m.legacyCollectionName} | ${modes} | ${m.canonicalRegistryToken || "—"} | ${m.canonicalConfidence} |`;
  }).join("\n");

  // ── mvp-l1-legacy-token-audit.md ─────────────────────────────────────

  const auditReport = `# MVP-L1 — UX Guide 2.4 Legacy Token Audit

**Date:** ${now}
**Source:** ${metaFileRef}
**Metadata:** figma-plugin-api
**Phase:** MVP-L1

---

## 1. 목적

S1 UX 디자인가이드 2.4의 현재 Figma Variables를 legacy source snapshot으로 수집하고,
향후 code registry 기반 canonical token 체계로 이전하기 위한 분석을 수행한다.

> **token layer 기준 (이 프로젝트 공식):**
> Foundation Token → Semantic Token → Component Token

---

## 2. 기준 파일

| source | role | path |
|---|---|---|
| UX Guide 2.4 | legacy source snapshot | registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json |
| Darkmode Test | experimental reference only | registry/figma/snapshots/figma-variable-metadata.darkmode-test.json |

**중요:** UX Guide 2.4는 canonical source가 아니라 legacy source snapshot이다.
Code Registry가 최종 source of truth다.

---

## 3. Variables 요약

| 항목 | 개수 |
|---|---:|
| collections | ${collections.length} |
| variables (전체) | ${allVars.length} |
| COLOR variables | ${colorVars.length} |
| Foundation Token COLOR | ${foundationClassified.length} |
| Semantic Token COLOR | ${semanticClassified.length} |
| FLOAT / STRING / BOOLEAN | ${allVars.filter((v) => v.resolvedType !== "COLOR").length} |

> ⚠️ **정정 (MVP-L2):** 초기 MVP-L1 audit에서 Foundation COLOR를 0으로 보고한 것은 오류였습니다.
> classifier가 \`collectionName === "Primitive"\`로 판별했으나 실제 컬렉션 이름은 "Foundation"이었습니다.
> MVP-L2 재분류 결과: Foundation ${foundationClassified.length}개 / Semantic ${semanticClassified.length}개.
> 상세: \`reports/mvp-l2-foundation-reclassification.md\`

### Collections

| collectionName | modes | variable 수 |
|---|---|---:|
${collectionRows}

---

## 4. 그룹 분류 (Semantic Token COLOR)

| group | variable 수 |
|---|---:|
${groupSummaryRows}

> Foundation Token COLOR ${foundationClassified.length}개는 기본 팔레트이며 Semantic 그룹 집계에서 제외됩니다.
> Foundation 재분류 상세: \`reports/mvp-l2-foundation-reclassification.md\`

---

## 5. Semantic Variables 상세 + canonical 후보

| legacy Figma Variable | collection | modes | canonical 후보 | confidence |
|---|---|---|---|---|
${semanticDetailRows}

---

## 6. Migration Status 요약

| migrationStatus | 수 |
|---|---:|
${Object.entries(mStats).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

---

## 7. 다음 단계

1. **MVP-L2**: \`reports/mvp-l2-foundation-reclassification.md\` 검토 후 Foundation 재분류 확정
2. 사람이 \`needs-review\` 항목 검수
3. canonical registry에 없는 token 후보 도출 (dropdown, chip, navigation, pagination)
4. Figma Variable rename/restructure는 별도 단계에서 계획
5. write는 하지 않음
`;

  writeFileSync(join(REPORTS_DIR, "mvp-l1-legacy-token-audit.md"), auditReport);

  // ── mvp-l2-foundation-reclassification.md ────────────────────────────

  const foundationExamples = foundationClassified.slice(0, 6).map((m) =>
    `| \`${m.legacyFigmaVariable}\` | ${m.classificationReason} | ${m.layerConfidence} |`
  ).join("\n");

  const foundationNSRows = Object.entries(foundationNS)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([ns, items]) => `| \`${ns}/*\` | ${items.length} | \`${items[0].legacyFigmaVariable}\` |`)
    .join("\n");

  const patternExampleRows = foundationByPattern.slice(0, 8).map((m) =>
    `| \`${m.legacyFigmaVariable}\` | ${m.legacyCollectionName} | ${m.classificationReason} | ${m.layerConfidence} |`
  ).join("\n") || "| (없음) | — | — | — |";

  const reclassReport = `# MVP-L2 — Foundation Layer 재분류 결과

**Date:** ${now}
**Phase:** MVP-L2 (Foundation Reclassification)
**Source:** reports/mvp-l1-legacy-token-audit.md + registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json

---

## 1. 결론

| 항목 | 내용 |
|---|---|
| 기존 Foundation 0 판단 | classifier가 \`collectionName === "Primitive"\`로 판별했으나 실제 컬렉션 이름은 "Foundation" |
| 원인 | 스크립트 하드코딩 오류 — "Primitive" 문자열 vs 실제 "Foundation" 컬렉션 이름 |
| Foundation 후보 count | **${foundationClassified.length}개** (collection 기준 ${foundationByCollection.length}개 + name pattern 기준 ${foundationByPattern.length}개) |

---

## 2. layer 재분류 요약

| layer | before | after |
|---|---:|---:|
| Foundation Token | 0 | **${foundationClassified.length}** |
| Semantic Token | 271 | **${semanticClassified.length}** |
| Component Token | — | 0 (별도 registry 관리) |
| Needs Review | — | **${mStats["needs-review"] ?? 0}** |

> **token layer 기준 (이 프로젝트 공식):**
> Foundation Token → Semantic Token → Component Token

---

## 3. Foundation 후보 예시

| variable name | reason | confidence |
|---|---|---|
${foundationExamples}

---

## 4. Foundation namespace 분석

| namespace | count | 예시 |
|---|---:|---|
${foundationNSRows}

---

## 5. name pattern으로 추가 발견된 Foundation 후보

컬렉션 이름이 "Foundation"이 아니지만 variable 이름 패턴이 Foundation에 해당하는 항목입니다.
confidence "medium" — 사람 검수 필요.

| variable name | collection | reason | confidence |
|---|---|---|---|
${patternExampleRows}

---

## 6. canonical layer 제안

이 프로젝트의 token architecture 공식 3계층:

\`\`\`
Foundation Token   (기본 팔레트 — gray/blue/red scale 등)
       ↓
Semantic Token     (역할 기반 — bg/text/border/action 등)
       ↓
Component Token    (컴포넌트 별칭 — --input-* / --button-* 등)
\`\`\`

| 기존/일반 용어 | 이 프로젝트 공식 용어 |
|---|---|
| Primitive | Foundation |
| Base Palette | Foundation |
| Raw Color | Foundation |
| Semantic | Semantic |
| Component Alias | Component |

---

## 7. 수정/생성 파일

| 파일 | 변경 내용 |
|---|---|
| \`registry/tokens/legacy-token-map.json\` | v0.2.0 — suggestedLayer / suggestedGroup / classificationReason 필드 추가 |
| \`reports/mvp-l1-legacy-token-audit.md\` | Foundation COLOR 0 오류 정정, Foundation Token 용어 적용 |
| \`reports/mvp-l2-foundation-reclassification.md\` | Foundation 재분류 결과 생성 (이 파일) |

---

## 8. 금지 사항

- Figma Variable rename 금지
- Figma write 금지
- canonical registry 자동 확정 금지
- foundation-candidate를 바로 final canonical으로 확정 금지
- legacy token 삭제 금지
`;

  writeFileSync(join(REPORTS_DIR, "mvp-l2-foundation-reclassification.md"), reclassReport);

  console.log(`\n[OK] Legacy Token Audit + Foundation 재분류 완료`);
  console.log(`  총 variables      : ${allVars.length}`);
  console.log(`  COLOR variables   : ${colorVars.length}`);
  console.log(`  Foundation Token  : ${foundationClassified.length}  (collection ${foundationByCollection.length} + pattern ${foundationByPattern.length})`);
  console.log(`  Semantic Token    : ${semanticClassified.length}`);
  console.log(`\n  migrationStatus:`);
  Object.entries(mStats).forEach(([k, v]) => console.log(`    ${k.padEnd(22)}: ${v}`));
  console.log(`\n출력:`);
  console.log(`  reports/mvp-l1-legacy-token-audit.md`);
  console.log(`  reports/mvp-l2-foundation-reclassification.md`);
  console.log(`  registry/tokens/legacy-token-map.json`);
  console.log(`\n[중요] foundation-candidate는 최종 확정이 아닙니다. 사람이 검수 후 반영하세요.`);
}
