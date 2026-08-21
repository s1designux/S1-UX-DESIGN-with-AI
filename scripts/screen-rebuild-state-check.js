#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const allowedStatus = new Set(['ready', 'in-progress', 'awaiting-user', 'blocked', 'superseded', 'complete']);
const allowedPhase = new Set(['1-inventory', '2-mapping', '3-build', '4-verification', '5-registration', 'complete']);
const allowedScreenStatus = new Set(['pending', 'inventoried', 'mapped', 'built', 'verified', 'excluded']);

function fail(messages) {
  for (const message of messages) console.error(`❌ ${message}`);
  process.exit(1);
}

const input = process.argv[2];
if (!input) fail(['workflow-state.json 경로가 필요합니다.']);

const statePath = path.resolve(process.cwd(), input);
if (!fs.existsSync(statePath)) fail([`파일을 찾을 수 없습니다: ${statePath}`]);

let state;
try {
  state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
} catch (error) {
  fail([`JSON을 읽을 수 없습니다: ${error.message}`]);
}

const errors = [];
if (state.schemaVersion !== 1) errors.push('schemaVersion은 1이어야 합니다.');
if (state.workflow !== 'screen-rebuild') errors.push('workflow는 screen-rebuild여야 합니다.');
if (!allowedStatus.has(state.status)) errors.push(`허용되지 않은 status: ${state.status}`);
if (!allowedPhase.has(state.currentPhase)) errors.push(`허용되지 않은 currentPhase: ${state.currentPhase}`);
if (!Number.isInteger(state.lastCompletedCheckpoint) || state.lastCompletedCheckpoint < 0 || state.lastCompletedCheckpoint > 5) errors.push('lastCompletedCheckpoint는 0~5 정수여야 합니다.');
if (!state.source?.fileKey || !state.source?.nodeId || !state.source?.url) errors.push('source.url, fileKey, nodeId가 모두 필요합니다.');
if (!state.target?.service || !state.target?.flow) errors.push('target.service와 target.flow가 필요합니다.');
if (!Array.isArray(state.screens) || state.screens.length === 0) errors.push('screens는 한 개 이상이어야 합니다.');

const ids = new Set();
for (const [index, screen] of (state.screens || []).entries()) {
  if (!screen.sourceNodeId || !screen.name) errors.push(`screens[${index}]에 sourceNodeId와 name이 필요합니다.`);
  if (!allowedScreenStatus.has(screen.status)) errors.push(`screens[${index}]의 status가 유효하지 않습니다: ${screen.status}`);
  if (ids.has(screen.sourceNodeId)) errors.push(`중복 sourceNodeId: ${screen.sourceNodeId}`);
  ids.add(screen.sourceNodeId);
}

if (state.status === 'complete') {
  const unfinished = (state.screens || []).filter(screen => !['verified', 'excluded'].includes(screen.status));
  if (unfinished.length) errors.push(`complete 상태인데 미완료 화면이 ${unfinished.length}개 있습니다.`);
  for (const file of ['1-inventory.md', '2-mapping.md', '3-build.md', 'node-map.json', '4-verification.md', '5-registration.md']) {
    if (!fs.existsSync(path.join(path.dirname(statePath), file))) errors.push(`complete 상태에 필요한 파일이 없습니다: ${file}`);
  }
}

const fastSafe = state.artifacts?.screenSpec || state.artifacts?.canonicalManifest || state.artifacts?.scanSummary;
if (fastSafe) {
  const required = ['screenSpec', 'canonicalManifest', 'scanSummary'];
  const loaded = {};
  for (const key of required) {
    const relativePath = state.artifacts?.[key];
    if (!relativePath) {
      errors.push(`Fast-safe 상태에 artifacts.${key}가 필요합니다.`);
      continue;
    }
    const absolutePath = path.resolve(process.cwd(), relativePath);
    if (!fs.existsSync(absolutePath)) {
      errors.push(`Fast-safe 파일이 없습니다: ${relativePath}`);
      continue;
    }
    try {
      loaded[key] = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    } catch (error) {
      errors.push(`Fast-safe JSON을 읽을 수 없습니다: ${relativePath} — ${error.message}`);
    }
  }

  const verifiedScreenCount = (state.screens || []).filter(screen => screen.status === 'verified').length;
  if (loaded.screenSpec) {
    if (!Array.isArray(loaded.screenSpec.screens) || loaded.screenSpec.screens.length !== verifiedScreenCount) {
      errors.push(`screen-spec 화면 수가 verified 화면 수와 다릅니다: ${loaded.screenSpec.screens?.length || 0}/${verifiedScreenCount}`);
    }
    if (!Array.isArray(loaded.screenSpec.pilotTargetNodeIds) || loaded.screenSpec.pilotTargetNodeIds.length === 0) {
      errors.push('screen-spec에 pilotTargetNodeIds가 필요합니다.');
    }
  }
  if (loaded.canonicalManifest && loaded.canonicalManifest.targetFileKey !== state.targetFigma?.fileKey) {
    errors.push('canonical-manifest의 targetFileKey가 workflow-state와 다릅니다.');
  }
  if (loaded.scanSummary) {
    if (loaded.scanSummary.verdict !== 'PASS') errors.push(`scan-summary verdict가 PASS가 아닙니다: ${loaded.scanSummary.verdict}`);
    if (loaded.scanSummary.counts?.screens !== verifiedScreenCount) {
      errors.push(`scan-summary 화면 수가 verified 화면 수와 다릅니다: ${loaded.scanSummary.counts?.screens}/${verifiedScreenCount}`);
    }
    const violationCount = Object.values(loaded.scanSummary.violations || {}).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 1), 0);
    if (violationCount !== 0) errors.push(`scan-summary에 위반 ${violationCount}건이 남아 있습니다.`);

    let traceCount = 0;
    for (const trace of loaded.scanSummary.trace?.files || []) {
      const tracePath = path.resolve(process.cwd(), trace.path || '');
      if (!trace.path || !fs.existsSync(tracePath)) {
        errors.push(`trace 파일이 없습니다: ${trace.path || '(경로 없음)'}`);
        continue;
      }
      const actualHash = crypto.createHash('sha256').update(fs.readFileSync(tracePath)).digest('hex');
      if (actualHash !== trace.sha256) errors.push(`trace hash가 다릅니다: ${trace.path}`);
      traceCount += Number(trace.count || 0);
    }
    if (traceCount !== loaded.scanSummary.trace?.totalCount) {
      errors.push(`trace count 합계가 다릅니다: ${traceCount}/${loaded.scanSummary.trace?.totalCount}`);
    }
  }
}

if (errors.length) fail(errors);
console.log(`✅ screen-rebuild state PASS — ${state.target.service}/${state.target.flow}, 화면 ${state.screens.length}개, 단계 ${state.currentPhase}`);
