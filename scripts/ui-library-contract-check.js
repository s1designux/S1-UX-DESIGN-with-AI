#!/usr/bin/env node
/**
 * UI 라이브러리 코드 계약의 최소 배선을 검사한다.
 * candidate 단계에서는 문서·정본목록·전환 blocker를, stable 단계에서는 실제 build 배선을 요구한다.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONTRACT = path.join(ROOT, 'registry/governance/ui-library-code-contract.json');
const CANON = path.join(ROOT, 'registry/governance/canon-manifest.json');
const BEHAVIOR = path.join(ROOT, 'registry/components/component-behavior.pc.json');
const PACKAGE = path.join(ROOT, 'package.json');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const errors = [];
const requirePath = (obj, key) => {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) errors.push(`contract 필수 항목 없음: ${key}`);
};
const requireKeys = (obj, keys, label) => {
  if (!obj || typeof obj !== 'object') { errors.push(`${label} 객체 없음`); return; }
  for (const key of keys) if (!Object.prototype.hasOwnProperty.call(obj, key)) errors.push(`${label}.${key} 없음`);
};

let contract;
let canon;
let pkg;
try { contract = readJson(CONTRACT); } catch (e) { console.error(`❌ contract JSON 오류: ${e.message}`); process.exit(1); }
try { canon = readJson(CANON); } catch (e) { console.error(`❌ canon-manifest JSON 오류: ${e.message}`); process.exit(1); }
try { pkg = readJson(PACKAGE); } catch (e) { console.error(`❌ package.json 오류: ${e.message}`); process.exit(1); }

[
  '_meta', 'canonicalBoundaries', 'activation', 'entryGates', 'publicApi',
  'html', 'css', 'javascript', 'accessibility', 'composition',
  'targetSourceLayout', 'distribution', 'verification', 'statusModel',
  'policyStatusModel', 'migration', 'forbidden'
].forEach((key) => requirePath(contract, key));

const status = contract._meta && contract._meta.status;
if (!['candidate', 'stable'].includes(status)) errors.push(`허용되지 않은 정책 상태: ${status || '(없음)'}`);

const humanGuide = contract._meta && contract._meta.humanGuide;
const checklist = contract._meta && contract._meta.checklist;
for (const rel of [humanGuide, checklist]) {
  if (!rel || !fs.existsSync(path.join(ROOT, rel))) errors.push(`연결 문서 없음: ${rel || '(경로 없음)'}`);
}
const contractVersion = contract._meta && contract._meta.version;
for (const rel of [humanGuide, checklist].filter(Boolean)) {
  if (!fs.existsSync(path.join(ROOT, rel))) continue;
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (!text.includes(`Contract version: \`${contractVersion}\``)) errors.push(`설명 문서 contract version 불일치: ${rel}`);
}
if (humanGuide && fs.existsSync(path.join(ROOT, humanGuide))) {
  const guideText = fs.readFileSync(path.join(ROOT, humanGuide), 'utf8');
  for (const marker of ['auto-init.js', 's1-ui.auto.js', 'legacy-approved', 'component-tokens.css', 'component-token-map.json', 's1-icons.svg', '{icon-id}.svg']) {
    if (!guideText.includes(marker)) errors.push(`사람용 가이드 필수 설명 누락: ${marker}`);
  }
}
requireKeys(contract.distribution, ['cssLoadOrder', 'requiredModes', 'packageContract', 'rules'], 'distribution');
requireKeys(contract.componentManifestSchema, ['required', 'javascriptWhenRequired', 'controlMode', 'versioning'], 'componentManifestSchema');
requireKeys(contract.webIconDelivery, ['sourceManifest', 'requiredManifest', 'requiredMapping', 'outputs', 'rule'], 'webIconDelivery');
requireKeys(contract.migration, ['recordPath', 'recordSchema', 'legacyUiLibraryStatus'], 'migration');

const policyFiles = canon.policyCanon && canon.policyCanon.files;
const policyEntry = policyFiles && policyFiles['ui-library-code-contract.json'];
if (!policyEntry) errors.push('canon-manifest policyCanon 등록 없음');
else {
  if (policyEntry.status !== status) errors.push(`contract/canon 상태 불일치: ${status} != ${policyEntry.status}`);
  if (policyEntry.verify !== 'npm run ui:contract') errors.push('canon-manifest verify 명령 불일치');
}

const behavior = readJson(BEHAVIOR);
const legacyRuntimeCanon = /pages\/components\.html|runtime JavaScript/i.test(
  `${behavior._meta && behavior._meta.source || ''} ${behavior._meta && behavior._meta.sourceOfTruth || ''}`
);

if (status === 'candidate') {
  if (!legacyRuntimeCanon) errors.push('candidate에 기록된 기존 runtime-source blocker가 실제 상태와 다름');
  if (!['pending', 'gate:check-partial'].includes(contract._meta.gateIntegration)) errors.push('candidate gateIntegration은 pending 또는 gate:check-partial이어야 함');
}

if (status === 'stable') {
  if (legacyRuntimeCanon) errors.push('stable 금지: 사이트 runtime이 여전히 행동 정본');
  if (contract._meta.gateIntegration !== 'gate:check') errors.push('stable 금지: gate:check 편입 기록 없음');
  for (const rel of [
    'ui-library/package.json', 'ui-library/src', 'ui-library/dist',
    'ui-library/src/assets/icons/manifest.json', 'ui-library/src/component-token-map.json',
    'ui-library/dist/manifest.json', 'ui-library/verification/input.json',
    'ui-library/verification/button.json', 'ui-library/verification/bundle-parity.json',
    'registry/governance/ui-library-migration.json', 'pages/ui-review.html'
  ]) {
    if (!fs.existsSync(path.join(ROOT, rel))) errors.push(`stable 필수 경로 없음: ${rel}`);
  }
  for (const script of ['ui:build', 'ui:test', 'ui:contract']) {
    if (!pkg.scripts || !pkg.scripts[script]) errors.push(`stable 필수 package script 없음: ${script}`);
  }
  const gateText = fs.readFileSync(path.join(ROOT, 'scripts/gate-check.js'), 'utf8');
  if (!/ui-library-contract-check\.js|ui:contract/.test(gateText)) errors.push('stable 금지: ui:contract가 gate-check.js에 실제 편입되지 않음');
  for (const script of ['ui:build', 'ui:test']) {
    if (!pkg.scripts || !pkg.scripts[script]) continue;
    const run = spawnSync('npm', ['run', script, '--', '--check'], { cwd: ROOT, encoding: 'utf8' });
    if (run.status !== 0) errors.push(`${script} --check 실행 실패: ${(run.stderr || run.stdout || '').trim().slice(0, 300)}`);
  }
  const safeJson = (rel) => {
    try { return readJson(path.join(ROOT, rel)); }
    catch (e) { errors.push(`stable JSON 읽기 실패: ${rel} (${e.message})`); return null; }
  };
  const uiPkg = fs.existsSync(path.join(ROOT, 'ui-library/package.json')) ? safeJson('ui-library/package.json') : null;
  if (uiPkg) {
    for (const key of ['.', './auto-init', './components/*', './components/*/css']) if (!uiPkg.exports || !uiPkg.exports[key]) errors.push(`UI package export 없음: ${key}`);
    const side = uiPkg.sideEffects;
    if (!(side === true || (Array.isArray(side) && side.some((v) => String(v).includes('css'))))) errors.push('UI package CSS sideEffects 선언 없음');
  }
  const dist = fs.existsSync(path.join(ROOT, 'ui-library/dist/manifest.json')) ? safeJson('ui-library/dist/manifest.json') : null;
  if (dist) {
    requireKeys(dist, ['version', 'canonicalFingerprint', 'componentTokenMappingFingerprint', 'examplesFingerprint', 'components'], 'dist manifest');
    for (const id of ['input', 'button']) {
      const item = Array.isArray(dist.components) ? dist.components.find((c) => c.id === id) : null;
      if (!item || item.status !== 'approved') errors.push(`dist manifest ${id} approved 증거 없음`);
    }
  }
  const tokenMapPath = path.join(ROOT, 'ui-library/src/component-token-map.json');
  if (dist && fs.existsSync(tokenMapPath) && dist.componentTokenMappingFingerprint !== sha256(tokenMapPath)) errors.push('component token mapping fingerprint 불일치');

  const componentRoot = path.join(ROOT, 'ui-library/src/components');
  const componentManifests = new Map();
  if (fs.existsSync(componentRoot)) {
    for (const id of fs.readdirSync(componentRoot)) {
      const rel = `ui-library/src/components/${id}/manifest.json`;
      if (!fs.existsSync(path.join(ROOT, rel))) continue;
      const manifest = safeJson(rel);
      if (!manifest) continue;
      componentManifests.set(id, manifest);
      for (const key of contract.componentManifestSchema.required) if (!Object.prototype.hasOwnProperty.call(manifest, key)) errors.push(`${id} manifest 필수 항목 없음: ${key}`);
      if (manifest.jsRequired) for (const key of contract.componentManifestSchema.javascriptWhenRequired) if (!Object.prototype.hasOwnProperty.call(manifest, key)) errors.push(`${id} JS manifest 필수 항목 없음: ${key}`);
    }
  }
  for (const id of ['input', 'button']) if (!componentManifests.has(id)) errors.push(`stable 필수 component manifest 없음: ${id}`);

  const iconManifestPath = path.join(ROOT, 'ui-library/src/assets/icons/manifest.json');
  const allowedPath = path.join(ROOT, 'registry/figma/allowed-remote-keys.json');
  if (fs.existsSync(iconManifestPath)) {
    const icons = safeJson('ui-library/src/assets/icons/manifest.json');
    if (icons) {
      for (const key of contract.webIconDelivery.requiredManifest) if (!Object.prototype.hasOwnProperty.call(icons, key)) errors.push(`icon manifest 필수 항목 없음: ${key}`);
      if (icons.sourceRegistry !== 'registry/figma/allowed-remote-keys.json') errors.push('icon sourceRegistry 경로 불일치');
      if (icons.sourceRegistryFingerprint !== sha256(allowedPath)) errors.push('icon source registry fingerprint 불일치');
      const allowed = new Set(Object.values(readJson(allowedPath).allowedRemoteComponentKeys || {}));
      for (const icon of Array.isArray(icons.icons) ? icons.icons : []) {
        for (const key of contract.webIconDelivery.requiredMapping) if (!Object.prototype.hasOwnProperty.call(icon, key)) errors.push(`icon ${icon.id || '?'} 필수 항목 없음: ${key}`);
        if (!allowed.has(icon.sourceKey)) errors.push(`icon ${icon.id || '?'} sourceKey 허용목록 불일치`);
        const asset = icon.individualFile && path.join(ROOT, 'ui-library/src/assets/icons', icon.individualFile);
        if (!asset || !fs.existsSync(asset)) errors.push(`icon ${icon.id || '?'} 웹 SVG 없음`);
        else if (icon.webAssetFingerprint !== sha256(asset)) errors.push(`icon ${icon.id || '?'} 웹 asset fingerprint 불일치`);
      }
    }
  }
  for (const id of ['input', 'button']) {
    const rel = `ui-library/verification/${id}.json`;
    if (!fs.existsSync(path.join(ROOT, rel))) continue;
    const report = safeJson(rel);
    if (report && (report.independentVerification !== 'PASS' || report.riverUxApproval !== 'APPROVED')) errors.push(`${id} 독립 검증·river 승인 미완료`);
  }
  if (fs.existsSync(path.join(ROOT, 'ui-library/verification/bundle-parity.json'))) {
    const parity = safeJson('ui-library/verification/bundle-parity.json');
    if (parity && parity.result !== 'PASS') errors.push('전체 bundle↔개별 import 동일성 미통과');
  }
  if (fs.existsSync(path.join(ROOT, 'registry/governance/ui-library-migration.json'))) {
    const migration = safeJson('registry/governance/ui-library-migration.json');
    const records = migration && migration.records;
    for (const id of ['input', 'button', 'mobile-login']) {
      if (!Array.isArray(records) || !records.some((r) => r.id === id)) errors.push(`migration 기록 없음: ${id}`);
    }
  }
  if (fs.existsSync(path.join(ROOT, 'pages/ui-review.html')) && dist) {
    const review = fs.readFileSync(path.join(ROOT, 'pages/ui-review.html'), 'utf8');
    if (!review.includes('ui-library/dist')) errors.push('UI 검수 화면이 실제 dist를 불러오지 않음');
    if (!review.includes(String(dist.canonicalFingerprint))) errors.push('UI 검수 화면 정본 fingerprint 불일치');
    if (!review.includes(String(dist.examplesFingerprint))) errors.push('UI 검수 화면 코드 예시 fingerprint 불일치');
  }
}

if (errors.length) {
  console.error('[UI Library Contract] FAIL');
  errors.forEach((e) => console.error(`  ❌ ${e}`));
  process.exit(1);
}

console.log(`[UI Library Contract] PASS · policy=${status} · stable-enforcement=${status === 'stable' ? 'on' : 'pending'}`);
console.log(`UI_CONTRACT_SUMMARY status=${status} errors=0 gate=${contract._meta.gateIntegration}`);
