#!/usr/bin/env node
/**
 * apply-figma-usage.mjs
 * Reads figma-variable-usage.mvp-f1.json and applies findings to:
 *   1. registry/tokens/legacy-token-usage-map.json
 *   2. registry/tokens/canonical-token-promotion-plan.json
 * Then generates: reports/mvp-f1-apply-result.md
 *
 * MUST be run after check-figma-usage.mjs passes.
 * Usage: node scripts/figma/apply-figma-usage.mjs [--dry-run]
 * Exit 0 = success, Exit 1 = fatal error
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

const isDryRun = process.argv.includes("--dry-run");

// ── Paths ─────────────────────────────────────────────────────────────────────

const USAGE_FILE    = join(ROOT, "registry", "figma", "snapshots", "figma-variable-usage.mvp-f1.json");
const TARGETS_FILE  = join(ROOT, "registry", "figma", "figma-usage-targets.json");
const LEGACY_MAP    = join(ROOT, "registry", "tokens", "legacy-token-usage-map.json");
const PROMO_PLAN    = join(ROOT, "registry", "tokens", "canonical-token-promotion-plan.json");
const REPORT_FILE   = join(ROOT, "reports", "mvp-f1-apply-result.md");

// ── Load input files ──────────────────────────────────────────────────────────

function loadJson(filePath) {
  if (!existsSync(filePath)) {
    console.error(`[ERROR] File not found: ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

const usageExport  = loadJson(USAGE_FILE);
const targetsConfig = loadJson(TARGETS_FILE);
const legacyMap    = loadJson(LEGACY_MAP);
const promoPlan    = loadJson(PROMO_PLAN);

const exportMeta  = usageExport.exportMeta;
const nodeUsages  = usageExport.nodeUsages ?? [];
const exportErrors = usageExport.errors ?? [];
const targets     = targetsConfig.targets ?? [];

// ── Build usage index: variableName → [{nodeId, property}] ───────────────────

const usageIndex = new Map();

for (const nodeUsage of nodeUsages) {
  for (const binding of (nodeUsage.bindings ?? [])) {
    if (!binding.variableName) continue;
    const key = binding.variableName;
    if (!usageIndex.has(key)) usageIndex.set(key, []);
    usageIndex.get(key).push({ nodeId: nodeUsage.nodeId, property: binding.property });
  }
}

// Unique variable names found in this export
const allVariableNames = Array.from(usageIndex.keys()).sort();

// Map nodeId → target info for reporting
const targetByNodeId = new Map(targets.map((t) => [t.nodeId, t]));

// ── Step 1: Update legacy-token-usage-map.json ────────────────────────────────

const legacyChanges = [];

for (const entry of (legacyMap.tokens ?? [])) {
  const varName = entry.legacyVariableName;
  if (!varName) continue;

  const matches = usageIndex.get(varName);
  if (!matches) continue;

  // Idempotent: skip if already applied with same count
  const newCount = matches.length;
  const newNodes = [...new Set(matches.map((m) => m.nodeId))];
  const newProps  = [...new Set(matches.map((m) => m.property))];

  if (
    entry.mvp_f1_usageCount === newCount &&
    JSON.stringify(entry.mvp_f1_usedInNodes?.slice().sort()) === JSON.stringify(newNodes.slice().sort())
  ) {
    continue; // already applied — idempotent
  }

  legacyChanges.push({
    legacyVariableName: varName,
    before: {
      mvp_f1_usageCount: entry.mvp_f1_usageCount,
      accessStatus: entry.accessStatus,
    },
    after: {
      mvp_f1_usageCount: newCount,
      accessStatus: "resolved",
    },
  });

  entry.mvp_f1_usageCount   = newCount;
  entry.mvp_f1_usedInNodes  = newNodes;
  entry.mvp_f1_properties   = newProps;
  if (entry.accessStatus === "access-failed") {
    entry.accessStatus = "resolved";
  }
}

// ── Step 2: Update canonical-token-promotion-plan.json ───────────────────────

const promoChanges = [];
const stillHold    = [];

// Component → set of nodeIds that now have usage evidence
const componentEvidence = new Map();
for (const nodeUsage of nodeUsages) {
  const t = targetByNodeId.get(nodeUsage.nodeId);
  if (!t) continue;
  if (!componentEvidence.has(t.component)) componentEvidence.set(t.component, []);
  if (nodeUsage.bindings.length > 0) {
    componentEvidence.get(t.component).push(nodeUsage.nodeId);
  }
}

// Mapping from hold id → relevant component name
const holdComponentMap = {
  "hold.component.textarea":         "Input",
  "hold.component.date-picker.tokens": "DatePicker",
  "hold.component.time-picker":      "TimePicker",
};

for (const hold of (promoPlan.holds ?? [])) {
  if (hold.promotionStatus !== "hold-access-limited") {
    stillHold.push({ id: hold.id, reason: hold.reason ?? "non-access hold" });
    continue;
  }

  const component = holdComponentMap[hold.id];
  const evidenceNodes = component ? componentEvidence.get(component) : null;

  if (evidenceNodes && evidenceNodes.length > 0) {
    const before = hold.promotionStatus;

    // Idempotent: only update if not already changed
    if (hold.promotionStatus !== "promote-candidate") {
      hold.promotionStatus = "promote-candidate";
      hold.usageEvidence   = `MVP-F1 Plugin Export confirmed variable bindings in nodes: ${evidenceNodes.join(", ")}.`;
      hold.promotedAt      = new Date().toISOString().slice(0, 10);
      promoChanges.push({ id: hold.id, before, after: "promote-candidate", reason: `Usage confirmed in ${evidenceNodes.join(", ")}` });
    }
  } else {
    // Still no evidence — add note about F1 scan
    const scanNote = `MVP-F1 scan ran ${new Date().toISOString().slice(0, 10)}: no variable bindings found for ${component ?? "unknown component"} in plugin export.`;
    if (!hold.mvpF1ScanNotes) hold.mvpF1ScanNotes = [];
    // Idempotent: don't duplicate the same date note
    const alreadyHasNote = hold.mvpF1ScanNotes.some((n) => n.startsWith("MVP-F1 scan ran " + new Date().toISOString().slice(0, 10)));
    if (!alreadyHasNote) hold.mvpF1ScanNotes.push(scanNote);
    stillHold.push({ id: hold.id, reason: hold.reason ?? "" });
  }
}

// ── Step 3: Write files (unless dry-run) ─────────────────────────────────────

if (!isDryRun) {
  writeFileSync(LEGACY_MAP, JSON.stringify(legacyMap, null, 2), "utf-8");
  writeFileSync(PROMO_PLAN, JSON.stringify(promoPlan, null, 2), "utf-8");
}

// ── Step 4: Build report ──────────────────────────────────────────────────────

const dateStr = new Date().toISOString().slice(0, 10);

// Per-target summary
function nodeStatus(target) {
  const usage = nodeUsages.find((n) => n.nodeId === target.nodeId);
  const error = exportErrors.find((e) => e.nodeId === target.nodeId);
  if (usage) {
    return { count: usage.bindings.length, status: usage.bindings.length > 0 ? "✅ 해소" : "⚠️ 접근 성공 (binding 없음)" };
  }
  if (error) return { count: 0, status: "❌ 접근 실패: " + error.reason };
  return { count: 0, status: "⚠️ 스캔 누락" };
}

// New variables (ones not yet in legacy-token-usage-map.json)
const existingVarNames = new Set((legacyMap.tokens ?? []).map((t) => t.legacyVariableName));
const newVariables = allVariableNames.filter((v) => !existingVarNames.has(v));

// Per-node usage detail sections
function renderNodeDetail(target) {
  const usage = nodeUsages.find((n) => n.nodeId === target.nodeId);
  if (!usage || usage.bindings.length === 0) {
    return `### ${target.name} (${target.nodeId})\n\n접근 불가 또는 binding 없음.\n`;
  }
  const rows = usage.bindings
    .filter((b) => b.variableName)
    .map((b) => `| ${b.variableName} | ${b.property} | ${b.collectionName} |`)
    .join("\n");
  return `### ${target.name} (${target.nodeId})\n\n| variable | property | collection |\n|---|---|---|\n${rows}\n`;
}

// L6 진행 가능 여부 assessment
function assessL6() {
  const hasAnyResolved = nodeUsages.some((n) => n.bindings.length > 0);
  const allResolved    = targets.every((t) => nodeUsages.some((n) => n.nodeId === t.nodeId && n.bindings.length > 0));
  if (allResolved) return { status: "가능", reason: "3개 ACCESS-01 노드 모두 variable binding 확인됨." };
  if (hasAnyResolved) return { status: "부분 가능", reason: "일부 노드만 binding 확인됨. 나머지 노드 재시도 필요." };
  return { status: "보류", reason: "어떤 노드에서도 variable binding이 확인되지 않음. Figma에서 해당 노드 존재 여부를 직접 확인하세요." };
}

const l6 = assessL6();

const targetSummaryRows = targets.map((t) => {
  const s = nodeStatus(t);
  return `| ${t.nodeId} | ${t.component} | ${s.count} | ${s.status} |`;
}).join("\n");

const promoChangeRows = promoChanges.length > 0
  ? promoChanges.map((c) => `| ${c.id} | ${c.before} | ${c.after} | ${c.reason} |`).join("\n")
  : "_변경 없음_";

const stillHoldRows = stillHold.length > 0
  ? stillHold.map((h) => `| ${h.id} | ${h.reason.slice(0, 100)} |`).join("\n")
  : "_없음_";

const newVarRows = newVariables.length > 0
  ? newVariables.map((v) => {
      const usages = usageIndex.get(v) ?? [];
      const components = [...new Set(usages.map((u) => targetByNodeId.get(u.nodeId)?.component ?? u.nodeId))].join(", ");
      const properties = [...new Set(usages.map((u) => u.property))].join(", ");
      return `| ${v} | ${components} | ${properties} | — |`;
    }).join("\n")
  : "_없음_";

const dryRunNote = isDryRun ? "\n> **dry-run 모드**: 파일 수정 없음. 이 보고서는 적용 예정 내용을 보여줍니다.\n" : "";

const report = `# MVP-F1 — Figma Variable Usage Apply Result
${dryRunNote}
**실행일:** ${dateStr}
**입력 파일:** registry/figma/snapshots/figma-variable-usage.mvp-f1.json
**모드:** ${isDryRun ? "dry-run" : "apply"}

---

## 1. ACCESS-01 해소 여부

| 노드 | 컴포넌트 | usage count | 상태 |
|---|---|---:|---|
${targetSummaryRows}

---

## 2. 노드별 Usage 상세

${targets.map(renderNodeDetail).join("\n")}

---

## 3. 새로 확인된 Variable 목록

총 ${allVariableNames.length}개 unique variable 확인. legacy-token-usage-map.json 미등록 항목: **${newVariables.length}개**.

| variable name | component | property | canonical candidate |
|---|---|---|---|
${newVarRows}

---

## 4. Promotion Plan 상태 변경

| id | 이전 상태 | 변경 후 상태 | 이유 |
|---|---|---|---|
${promoChangeRows}

---

## 5. 아직 Hold로 남은 항목

| id | hold 이유 |
|---|---|
${stillHoldRows}

---

## 6. L6 진행 가능 여부

- **${l6.status}**
- 이유: ${l6.reason}

---

## 7. 다음 단계

1. ${promoChanges.length > 0 ? "promotion plan에서 promote-candidate로 변경된 항목 검토 후 HD 결정 진행." : "ACCESS-01 노드를 Figma에서 직접 확인. 노드 이동 또는 재구성 여부 점검."}
2. 새로 확인된 variable ${newVariables.length}개를 legacy-token-usage-map.json에 등록.
3. DatePicker HD-1~5 (MVP4.3-A unresolved) 결정 진행.
4. TimePicker 컴포넌트 정의 시작 (CLAUDE.md 미결 #11).
5. Textarea registry/components/textarea.json 생성 (CLAUDE.md 미결 #10).
`;

if (!isDryRun) {
  writeFileSync(REPORT_FILE, report, "utf-8");
}

// ── Console output ─────────────────────────────────────────────────────────────

console.log(`\nMVP-F1 apply${isDryRun ? " (dry-run)" : ""} 완료`);
console.log(`  legacy-map 변경: ${legacyChanges.length}건`);
console.log(`  promo-plan 변경: ${promoChanges.length}건`);
console.log(`  새 variable: ${newVariables.length}개`);
console.log(`  ACCESS-01 해소: ${l6.status}`);
if (!isDryRun) {
  console.log(`  리포트: reports/mvp-f1-apply-result.md`);
} else {
  console.log(`  dry-run: 파일 수정 없음`);
  console.log("\n--- dry-run report preview ---");
  console.log(report);
}
