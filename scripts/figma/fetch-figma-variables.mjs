/**
 * fetch-figma-variables.mjs
 *
 * Figma REST API에서 Variables metadata를 수집한다.
 * 실제 write는 수행하지 않는다. Read-only.
 *
 * 사용:
 *   node --env-file=.env scripts/figma/fetch-figma-variables.mjs
 *   FIGMA_FILE_KEY=... FIGMA_TOKEN=... node scripts/figma/fetch-figma-variables.mjs
 *
 * 출력:
 *   registry/figma/figma-variable-metadata.local.json  (gitignore 대상)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

// ── 환경변수 검증 ────────────────────────────────────────────────────────────

const FILE_KEY = process.env.FIGMA_FILE_KEY?.trim();
const TOKEN = process.env.FIGMA_TOKEN?.trim();

if (!FILE_KEY || !TOKEN) {
  console.error("[ERROR] 환경변수 누락:");
  if (!FILE_KEY) console.error("  FIGMA_FILE_KEY is required");
  if (!TOKEN)    console.error("  FIGMA_TOKEN is required");
  console.error("\n실행 방법:");
  console.error("  node --env-file=.env scripts/figma/fetch-figma-variables.mjs");
  console.error("  FIGMA_FILE_KEY=... FIGMA_TOKEN=... node scripts/figma/fetch-figma-variables.mjs");
  process.exit(1);
}

// ── Figma REST API 호출 ──────────────────────────────────────────────────────

const ENDPOINT = `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`;
console.log(`[INFO] Fetching Figma Variables...`);
console.log(`[INFO] endpoint: GET /v1/files/${FILE_KEY}/variables/local`);

let rawResponse;
try {
  const res = await fetch(ENDPOINT, {
    headers: { "X-Figma-Token": TOKEN },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[ERROR] Figma API 응답 오류: HTTP ${res.status}`);
    console.error("[ERROR] 응답:", text.slice(0, 500));
    process.exit(1);
  }

  rawResponse = await res.json();
} catch (err) {
  console.error("[ERROR] 네트워크 오류:", err.message);
  process.exit(1);
}

if (rawResponse.error) {
  console.error("[ERROR] Figma API error:", rawResponse.status);
  process.exit(1);
}

const { variableCollections = {}, variables = {} } = rawResponse.meta ?? {};

// ── 정규화 ───────────────────────────────────────────────────────────────────

// collection id → name 역매핑
const collectionNameMap = {};
const normalizedCollections = Object.values(variableCollections).map((col) => {
  collectionNameMap[col.id] = col.name;
  return {
    id: col.id,
    key: col.key ?? "",
    name: col.name,
    modes: (col.modes ?? []).map((m) => ({ modeId: m.modeId, name: m.name })),
    variableIds: col.variableIds ?? [],
  };
});

const normalizedVariables = Object.values(variables).map((v) => ({
  id: v.id,
  key: v.key ?? "",
  name: v.name,
  collectionId: v.variableCollectionId ?? "",
  collectionName: collectionNameMap[v.variableCollectionId] ?? "",
  resolvedType: v.resolvedType ?? "",
  valuesByMode: v.valuesByMode ?? {},
  remote: v.remote ?? false,
  scopes: v.scopes ?? [],
}));

const output = {
  meta: {
    source: "figma-rest-api",
    fileKey: FILE_KEY,
    fetchedAt: new Date().toISOString(),
    endpoint: "/v1/files/{fileKey}/variables/local",
    note: "PAT not stored. Raw response not stored. Read-only collection.",
  },
  collections: normalizedCollections,
  variables: normalizedVariables,
};

// ── 저장 ─────────────────────────────────────────────────────────────────────

const outDir = join(ROOT, "registry", "figma");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "figma-variable-metadata.local.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));

// ── 요약 출력 ─────────────────────────────────────────────────────────────────

const colorCount = normalizedVariables.filter((v) => v.resolvedType === "COLOR").length;
console.log(`\n[OK] Figma Variables 수집 완료`);
console.log(`  collections : ${normalizedCollections.length}`);
console.log(`  variables   : ${normalizedVariables.length}`);
console.log(`  COLOR vars  : ${colorCount}`);
console.log(`  saved to    : registry/figma/figma-variable-metadata.local.json`);
console.log(`\n다음 단계:`);
console.log(`  node scripts/figma/match-figma-variable-metadata.mjs`);
