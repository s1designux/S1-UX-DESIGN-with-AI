#!/usr/bin/env node

const crypto = require('crypto');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const workflowStatuses = new Set(['ready', 'in-progress', 'awaiting-user', 'blocked', 'superseded', 'complete']);
const libraryStatuses = new Set(['draft', 'needs-decision', 'candidate', 'verified', 'approved', 'deprecated']);
const phases = [
  '0-governance',
  '1-inventory',
  '2-canon-readiness',
  '3-build',
  '4-verification',
  '5-human-review',
  '6-promotion',
  'complete'
];
const forbiddenPortableKeys = new Set(['sessionId', 'toolCallId', 'chatId', 'threadId']);

function fail(messages) {
  for (const message of messages) console.error(`❌ ${message}`);
  process.exit(1);
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function findForbiddenKeys(value, trail = '$', found = []) {
  if (!value || typeof value !== 'object') return found;
  for (const [key, child] of Object.entries(value)) {
    const childTrail = `${trail}.${key}`;
    if (forbiddenPortableKeys.has(key)) found.push(childTrail);
    findForbiddenKeys(child, childTrail, found);
  }
  return found;
}

const args = process.argv.slice(2);
const remoteMode = args.includes('--remote');
const handoffMode = args.includes('--handoff') || remoteMode;
const input = args.find(arg => !arg.startsWith('--'));
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
if (state.workflow !== 'ui-library-code') errors.push('workflow는 ui-library-code여야 합니다.');
if (!state.workId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(state.workId)) errors.push('workId는 소문자 kebab-case여야 합니다.');
if (!state.objective) errors.push('objective가 필요합니다.');
if (!workflowStatuses.has(state.workflowStatus)) errors.push(`허용되지 않은 workflowStatus: ${state.workflowStatus}`);
if (!libraryStatuses.has(state.uiLibraryStatus)) errors.push(`허용되지 않은 uiLibraryStatus: ${state.uiLibraryStatus}`);
if (!phases.includes(state.currentPhase)) errors.push(`허용되지 않은 currentPhase: ${state.currentPhase}`);
if (!Number.isInteger(state.lastCompletedCheckpoint) || state.lastCompletedCheckpoint < 0 || state.lastCompletedCheckpoint > 6) {
  errors.push('lastCompletedCheckpoint는 0~6 정수여야 합니다.');
}
if (!state.nextAction) errors.push('nextAction이 필요합니다.');
if (!Array.isArray(state.intent?.principles) || state.intent.principles.length === 0) errors.push('intent.principles가 한 개 이상 필요합니다.');
if (!state.intent?.approvedBy || !state.intent?.approvedAt) errors.push('intent.approvedBy와 approvedAt이 필요합니다.');
if (!Array.isArray(state.target?.components) || state.target.components.length === 0) errors.push('target.components가 한 개 이상 필요합니다.');
if (!state.figmaSources?.fileKey || !state.figmaSources?.role || !state.figmaSources?.components) {
  errors.push('figmaSources에 role, fileKey, components가 필요합니다.');
} else {
  for (const componentId of state.target.components || []) {
    const source = state.figmaSources.components[componentId];
    if (!source?.source || !source?.status) {
      errors.push(`figmaSources.components.${componentId}에 source와 status가 필요합니다.`);
    } else if (state.figmaSources.requiredForInventory && (!source.nodeId || !/^\d+:\d+$/.test(source.nodeId))) {
      errors.push(`inventory 필수 Figma source에는 ${componentId} nodeId(숫자:숫자)가 필요합니다.`);
    } else if (source.nodeId && !/^\d+:\d+$/.test(source.nodeId)) {
      errors.push(`figmaSources.components.${componentId}.nodeId 형식이 유효하지 않습니다.`);
    } else if (source.sourceType === 'repository' && !fs.existsSync(path.resolve(process.cwd(), source.source))) {
      errors.push(`Figma 식별자 출처 파일이 없습니다: ${source.source}`);
    }
  }
}
if (!Array.isArray(state.decisions)) errors.push('decisions는 배열이어야 합니다.');
if (!Array.isArray(state.blockers)) errors.push('blockers는 배열이어야 합니다.');
if (!state.handoff?.lastActor || !state.handoff?.updatedAt || !state.handoff?.summary) errors.push('handoff의 lastActor, updatedAt, summary가 필요합니다.');
if (!state.evidence?.sourceAudit?.observedAt || !state.evidence?.sourceAudit?.basis) errors.push('sourceAudit에 observedAt과 basis가 필요합니다.');

const forbidden = findForbiddenKeys(state);
if (forbidden.length) errors.push(`다른 환경에서 재사용할 수 없는 키가 있습니다: ${forbidden.join(', ')}`);

if (state.workflowStatus === 'in-progress') {
  if (!state.ownership?.currentActor || !state.ownership?.startedAt) errors.push('in-progress에는 ownership.currentActor와 startedAt이 필요합니다.');
} else if (state.ownership?.currentActor || state.ownership?.startedAt) {
  errors.push('in-progress가 아닐 때 ownership은 비워야 합니다.');
}
if (state.workflowStatus === 'blocked' && state.blockers.length === 0) errors.push('blocked에는 blockers가 한 개 이상 필요합니다.');
if (state.workflowStatus === 'ready' && state.blockers.length > 0) errors.push('ready에는 blockers가 남아 있으면 안 됩니다.');

const phaseIndex = phases.indexOf(state.currentPhase);
if (phaseIndex >= 0 && state.currentPhase !== 'complete' && state.lastCompletedCheckpoint >= phaseIndex + 1) {
  errors.push('currentPhase보다 뒤의 checkpoint가 완료된 것으로 기록돼 있습니다.');
}

if (!Array.isArray(state.canonicalInputs) || state.canonicalInputs.length === 0) {
  errors.push('canonicalInputs가 한 개 이상 필요합니다.');
} else {
  const roles = new Set();
  for (const [index, inputItem] of state.canonicalInputs.entries()) {
    if (!inputItem.role || !inputItem.path || !/^[a-f0-9]{64}$/.test(inputItem.sha256 || '')) {
      errors.push(`canonicalInputs[${index}]에 role, path, sha256이 필요합니다.`);
      continue;
    }
    if (roles.has(inputItem.role)) errors.push(`중복 canonical input role: ${inputItem.role}`);
    roles.add(inputItem.role);
    const absolutePath = path.resolve(process.cwd(), inputItem.path);
    if (!fs.existsSync(absolutePath)) {
      errors.push(`정본 입력 파일이 없습니다: ${inputItem.path}`);
    } else {
      const actual = sha256(absolutePath);
      if (actual !== inputItem.sha256) errors.push(`정본 지문이 바뀌었습니다: ${inputItem.path}`);
    }
  }
}

const artifactRequirements = [
  ['policyContract', 'humanGuide', 'componentChecklist', 'repositoryInventory'],
  ['inventory'],
  ['canonReadiness'],
  ['build', 'sourceRoot', 'distManifest', 'reviewPage'],
  ['verification'],
  ['humanReview'],
  ['promotion', 'migrationRecord']
];

for (let checkpoint = 0; checkpoint <= state.lastCompletedCheckpoint; checkpoint += 1) {
  for (const key of artifactRequirements[checkpoint]) {
    const relativePath = state.artifacts?.[key];
    if (!relativePath) {
      errors.push(`checkpoint ${checkpoint} 완료에 artifacts.${key}가 필요합니다.`);
      continue;
    }
    if (!fs.existsSync(path.resolve(process.cwd(), relativePath))) errors.push(`산출물이 없습니다: ${relativePath}`);
  }
}

const contractPath = path.resolve(process.cwd(), state.contract?.path || '');
if (!state.contract?.path || !fs.existsSync(contractPath)) {
  errors.push('contract.path가 유효한 파일을 가리켜야 합니다.');
} else {
  try {
    const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    if (contract._meta?.version !== state.contract.version) errors.push('상태 파일의 contract.version이 실제 계약과 다릅니다.');
    if (contract._meta?.status !== state.contract.status) errors.push('상태 파일의 contract.status가 실제 계약과 다릅니다.');
  } catch (error) {
    errors.push(`계약 JSON을 읽을 수 없습니다: ${error.message}`);
  }
}

if (state.uiLibraryStatus === 'verified' && state.evidence?.independentVerification?.verdict !== 'PASS') {
  errors.push('verified에는 independentVerification PASS가 필요합니다.');
}
if (state.uiLibraryStatus === 'approved' && state.evidence?.riverApproval?.status !== 'approved') {
  errors.push('approved에는 riverApproval 승인 기록이 필요합니다.');
}
if (state.workflowStatus === 'complete') {
  if (state.currentPhase !== 'complete' || state.lastCompletedCheckpoint !== 6) errors.push('complete는 currentPhase=complete, checkpoint=6이어야 합니다.');
  if (state.uiLibraryStatus !== 'approved') errors.push('complete는 uiLibraryStatus=approved여야 합니다.');
  if (state.evidence?.independentVerification?.verdict !== 'PASS') errors.push('complete에는 독립 검증 PASS가 필요합니다.');
}

if (handoffMode) {
  const stateRelativePath = path.relative(process.cwd(), statePath);
  const requiredTrackedFiles = [
    'AGENTS.md',
    'CLAUDE.md',
    'package.json',
    '.claude/agents/ui-library-builder.md',
    '.claude/agents/guide-builder.md',
    '.claude/agents/component-verifier.md',
    '.claude/skills/ui-library-code/SKILL.md',
    '.claude/skills/ui-library-code/references/cross-agent-handoff.md',
    '.claude/skills/ui-library-code/references/verify-F.md',
    'registry/governance/ui-library-code-contract.json',
    'registry/governance/ui-library-authoring-guide.md',
    'registry/governance/ui-library-component-checklist.md',
    'registry/governance/canon-manifest.json',
    'reports/component-inventory-audit.md',
    'scripts/ui-library-contract-check.js',
    'scripts/ui-library-state-check.js',
    stateRelativePath
  ];
  for (const relativePath of requiredTrackedFiles) {
    try {
      childProcess.execFileSync('git', ['ls-files', '--error-unmatch', relativePath], {
        cwd: process.cwd(),
        stdio: 'ignore'
      });
    } catch {
      errors.push(`다른 PC 전달 전에 Git 추적이 필요합니다: ${relativePath}`);
      continue;
    }
    try {
      childProcess.execFileSync('git', ['diff', '--quiet', 'HEAD', '--', relativePath], {
        cwd: process.cwd(),
        stdio: 'ignore'
      });
    } catch {
      errors.push(`다른 PC 전달 전에 커밋이 필요합니다: ${relativePath}`);
    }
  }

  if (remoteMode && errors.length === 0) {
    try {
      const upstream = childProcess.execFileSync(
        'git',
        ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'],
        { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();
      childProcess.execFileSync('git', ['merge-base', '--is-ancestor', 'HEAD', upstream], {
        cwd: process.cwd(),
        stdio: 'ignore'
      });
    } catch {
      errors.push('원격 추적 브랜치에 현재 커밋이 없습니다. git fetch 후 push·동기화 상태를 다시 확인하세요.');
    }
  }
}

if (errors.length) fail(errors);
const modeLabel = remoteMode ? 'remote-handoff' : handoffMode ? 'handoff' : 'state';
console.log(`✅ ui-library ${modeLabel} PASS — ${state.workId}, 단계 ${state.currentPhase}, 다음: ${state.nextAction}`);
