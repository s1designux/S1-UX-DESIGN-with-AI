#!/usr/bin/env node
/**
 * check-figma-usage.mjs
 * Validates registry/figma/snapshots/figma-variable-usage.mvp-f1.json
 * before apply-figma-usage.mjs runs.
 *
 * Usage: node scripts/figma/check-figma-usage.mjs
 * Exit 0 = pass, Exit 1 = fail
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

const USAGE_FILE = join(ROOT, "registry", "figma", "snapshots", "figma-variable-usage.mvp-f1.json");
const TARGETS_FILE = join(ROOT, "registry", "figma", "figma-usage-targets.json");
const EXPECTED_FILE_KEY = "yE5UCFEbmXJBlYJWB24Lz2";

let failures = 0;
let warnings = 0;

function pass(id, msg)  { console.log(`✅ ${id} — ${msg}`); }
function warn(id, msg)  { console.log(`⚠️  ${id} — ${msg}`); warnings++; }
function fail(id, msg)  { console.log(`❌ ${id} — ${msg}`); failures++; }

// CHECK 1: FILE_EXISTS
if (!existsSync(USAGE_FILE)) {
  fail("FILE_EXISTS", `registry/figma/snapshots/figma-variable-usage.mvp-f1.json not found`);
  console.log("\n결과: 1/7 checks (0 warnings, 1 failures)");
  console.log("\n다음 단계: Figma에서 SW DS Token Sync 플러그인 → Export Variable Usage 버튼 실행 후 파일 저장");
  process.exit(1);
}
pass("FILE_EXISTS", "registry/figma/snapshots/figma-variable-usage.mvp-f1.json found");

let data;
try {
  data = JSON.parse(readFileSync(USAGE_FILE, "utf-8"));
} catch (e) {
  fail("SCHEMA_VERSION", `JSON parse failed: ${e.message}`);
  console.log("\n결과: 1/7 checks (0 warnings, 1 failures)");
  process.exit(1);
}

const meta = data.exportMeta ?? {};
const nodeUsages = data.nodeUsages ?? [];
const errors = data.errors ?? [];

// CHECK 2: SCHEMA_VERSION
if (meta.schemaVersion === "1.0.0" && meta.type === "figma-variable-usage") {
  pass("SCHEMA_VERSION", `${meta.schemaVersion} / ${meta.type}`);
} else {
  fail("SCHEMA_VERSION", `expected schemaVersion=1.0.0 and type=figma-variable-usage, got schemaVersion=${meta.schemaVersion}, type=${meta.type}`);
}

// CHECK 3: FILE_KEY
if (meta.figmaFileKey === EXPECTED_FILE_KEY) {
  pass("FILE_KEY", EXPECTED_FILE_KEY);
} else {
  fail("FILE_KEY", `expected ${EXPECTED_FILE_KEY}, got ${meta.figmaFileKey}`);
}

// Load targets config for CHECK 4
let targets = [];
if (existsSync(TARGETS_FILE)) {
  const targetsData = JSON.parse(readFileSync(TARGETS_FILE, "utf-8"));
  targets = (targetsData.targets ?? []).map((t) => t.nodeId);
}

// CHECK 4: TARGET_NODES
const usageNodeIds = new Set(nodeUsages.map((n) => n.nodeId));
const errorNodeIds = new Set(errors.map((e) => e.nodeId));
const missingNodes = targets.filter((id) => !usageNodeIds.has(id) && !errorNodeIds.has(id));
const errorNodes   = targets.filter((id) => !usageNodeIds.has(id) && errorNodeIds.has(id));

if (missingNodes.length > 0) {
  warn("TARGET_NODES", `${missingNodes.join(", ")} not found in nodeUsages or errors`);
} else if (errorNodes.length > 0) {
  warn("TARGET_NODES", `${errorNodes.map(id => id).join(", ")} not in nodeUsages (found in errors)`);
} else {
  pass("TARGET_NODES", `all ${targets.length} target nodes accounted for`);
}

// CHECK 5: USAGE_NOT_ZERO
const nodesWithBindings = nodeUsages.filter((n) => n.bindings && n.bindings.length > 0);
if (nodesWithBindings.length > 0) {
  pass("USAGE_NOT_ZERO", `${nodesWithBindings.length} nodes with bindings`);
} else {
  // Differentiate: all targets errored (stale IDs) vs scan ran but found nothing
  const allTargetsErrored = targets.length > 0 && targets.every((id) => errorNodeIds.has(id));
  if (allTargetsErrored) {
    warn("USAGE_NOT_ZERO", "모든 target 노드가 'not found' — 노드 ID가 stale입니다. Figma에서 현재 노드 ID를 확인 후 registry/figma/figma-usage-targets.json을 업데이트하세요.");
  } else {
    fail("USAGE_NOT_ZERO", "no nodes have any bindings — scan may have failed or nodes have no variable usage");
  }
}

// CHECK 6: NO_EMPTY_VAR_NAME
const emptyNameBindings = nodeUsages.flatMap((n) =>
  (n.bindings ?? []).filter((b) => b.variableId && b.variableId.length > 0 && b.variableName === "")
);
if (emptyNameBindings.length === 0) {
  pass("NO_EMPTY_VAR_NAME", "all variable names resolved");
} else {
  fail("NO_EMPTY_VAR_NAME", `${emptyNameBindings.length} binding(s) have a variableId but empty variableName — variable resolution failed`);
}

// CHECK 7: ERROR_REVIEW
const erroredTargets = targets.filter((id) => errorNodeIds.has(id));
if (erroredTargets.length > 0) {
  warn("ERROR_REVIEW", `${erroredTargets.length} node(s) in errors: ${erroredTargets.join(", ")}`);
} else {
  pass("ERROR_REVIEW", "no target nodes in errors");
}

// Summary
const total = 7;
const passed = total - failures - warnings;
console.log(`\n결과: ${total - failures}/${total} checks (${warnings} warnings, ${failures} failures)`);

const allTargetsErrored = targets.length > 0 && targets.every((id) => errorNodeIds.has(id));

if (failures > 0) {
  console.log("\n❌ 검증 실패 — apply-figma-usage.mjs 실행 전 오류를 해결하세요.");
  process.exit(1);
} else if (allTargetsErrored) {
  console.log("\n⚠️  노드 ID stale — ACCESS-01 target 노드를 Figma에서 찾을 수 없습니다.");
  console.log("   조치: Figma에서 대상 컴포넌트를 선택 → 우클릭 → Copy link");
  console.log("         URL의 node-id=XXXX-XXXX 값을 XXXX:XXXX 형식으로 변환");
  console.log("         registry/figma/figma-usage-targets.json의 nodeId 업데이트 후 플러그인 재실행");
  process.exit(1);
} else {
  if (warnings > 0) {
    console.log("\n⚠️  경고가 있지만 검증 통과 — apply-figma-usage.mjs 실행 가능합니다.");
  } else {
    console.log("\n✅ 모든 검증 통과 — apply-figma-usage.mjs 실행 가능합니다.");
  }
  process.exit(0);
}
