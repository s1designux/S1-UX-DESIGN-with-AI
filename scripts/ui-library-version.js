#!/usr/bin/env node
/**
 * UI Library Version — 배포본 번호를 사람이 기억하지 않게 한다.
 * --------------------------------------------------------------------------
 * 종전에는 `ui-library/package.json` 과 컴포넌트 manifest 의 version 을 사람이 손으로 찍었다.
 * 그래서 정본을 네 번 고쳐도 번호는 0.1.0 그대로였고, 받아 간 개발자는 자기 것이 낡았는지
 * 알 방법이 없었다(2026-09-14 river 결정 — "버전 매기기부터").
 *
 * 이 검사기가 보는 것:
 *   ① 각 컴포넌트 manifest 의 canonicalFingerprint 가 실제 정본과 같은가
 *   ② 장부(ui-library/release-log.json)가 **지금 지문**에 번호를 매겨 두었는가
 *   ③ 장부 번호 == ui-library/package.json 번호
 *
 * 번호 올리는 규칙 (river 승인 2026-09-14):
 *   - 색·크기 **값만** 바뀌면 끝자리    0.1.0 → 0.1.1   (`--bump`)
 *   - 부품이 늘거나 **쓰는 법**이 바뀌면 가운데  0.1.0 → 0.2.0   (`--bump --minor`)
 *   가운데 자리는 기계가 판단할 수 없다 — 사람이 --minor 로 지시한다. 기본은 끝자리다.
 *
 * 사용:
 *   node scripts/ui-library-version.js            # 검사 (기본)
 *   node scripts/ui-library-version.js --bump     # 끝자리 올리고 지문 갱신
 *   node scripts/ui-library-version.js --bump --minor
 */
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const LIBRARY = path.join(ROOT, 'ui-library');
const SRC_COMPONENTS = path.join(LIBRARY, 'src', 'components');
const PACKAGE = path.join(LIBRARY, 'package.json');
const LEDGER = path.join(LIBRARY, 'release-log.json');

const BUMP = process.argv.includes('--bump');
const MINOR = process.argv.includes('--minor');
const JSON_OUT = process.argv.includes('--json');

const read = (file) => fs.readFileSync(file, 'utf8');
const readJson = (file) => JSON.parse(read(file));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const hash = (value) => createHash('sha256').update(value).digest('hex');

/** 빌드와 같은 목록·같은 순서를 써야 조합 지문이 일치한다. */
function componentIds() {
  const source = read(path.join(LIBRARY, 'scripts', 'component-ids.mjs'));
  const match = /export const componentIds = (\[[\s\S]*?\]);/.exec(source);
  if (!match) throw new Error('component-ids.mjs 에서 컴포넌트 목록을 읽지 못했습니다');
  return JSON.parse(match[1]);
}

/** build.mjs 의 canonicalFingerprint 와 같은 계산 — 정본 파일 내용을 순서대로 이어 해시한다. */
function canonicalFingerprint(manifest) {
  const digest = createHash('sha256');
  for (const relative of manifest.canonicalSources) {
    digest.update(`${relative}\0`);
    digest.update(read(path.join(ROOT, relative)));
    digest.update('\0');
  }
  return digest.digest('hex');
}

function bumpVersion(version, kind) {
  const parts = String(version).split('.').map((n) => Number.parseInt(n, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) throw new Error(`번호 형식이 x.y.z 가 아닙니다: ${version}`);
  const [major, minor, patch] = parts;
  return kind === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const ids = componentIds();
const components = ids.map((id) => {
  const file = path.join(SRC_COMPONENTS, id, 'manifest.json');
  const manifest = readJson(file);
  const actual = canonicalFingerprint(manifest);
  return { id, file, manifest, actual, stale: manifest.canonicalFingerprint !== actual };
});

/** 배포본 한 벌의 지문 — build.mjs 와 같게 부품 지문을 목록 순서로 이어 해시한다. */
const combined = (list) => hash(list.map(({ manifest, actual }) => (BUMP ? actual : manifest.canonicalFingerprint)).join('\0'));

const pkg = readJson(PACKAGE);
const stale = components.filter((component) => component.stale);

// ── 올리기 ────────────────────────────────────────────────────────────
if (BUMP) {
  const kind = MINOR ? 'minor' : 'patch';
  if (!stale.length) {
    console.log('ℹ️  정본과 달라진 부품이 없습니다 — 올릴 번호가 없습니다.');
    process.exit(0);
  }
  const ledger = fs.existsSync(LEDGER) ? readJson(LEDGER) : null;
  if (!ledger) {
    console.error('❌ ui-library/release-log.json 이 없습니다 — 장부 없이 번호를 올릴 수 없습니다.');
    process.exit(1);
  }
  const changed = [];
  for (const component of stale) {
    const from = component.manifest.version;
    const to = bumpVersion(from, kind);
    component.manifest.version = to;
    component.manifest.canonicalFingerprint = component.actual;
    writeJson(component.file, component.manifest);
    changed.push({ id: component.id, from, to });
  }
  const version = bumpVersion(ledger.version, kind);
  const fingerprint = combined(components);
  ledger.version = version;
  ledger.releasedAt = today();
  ledger.canonicalFingerprint = fingerprint;
  ledger.releases.unshift({ version, date: ledger.releasedAt, kind, canonicalFingerprint: fingerprint, components: changed });
  writeJson(LEDGER, ledger);
  pkg.version = version;
  writeJson(PACKAGE, pkg);

  console.log(`\n🔢 배포본 번호 ${version} (${kind === 'minor' ? '가운데 자리 — 쓰는 법이 바뀜' : '끝자리 — 값만 바뀜'}) · ${ledger.releasedAt}`);
  for (const { id, from, to } of changed) console.log(`   · ${id} ${from} → ${to}`);
  console.log('\n   이제 `npm run ui:build` 로 전달본을 다시 만드세요.\n');
  process.exit(0);
}

// ── 검사 ──────────────────────────────────────────────────────────────
const errors = [];
const fingerprint = combined(components);
const ledger = fs.existsSync(LEDGER) ? readJson(LEDGER) : null;

if (stale.length) {
  errors.push(`정본이 바뀐 부품 ${stale.length}종에 번호가 안 올라갔습니다 (${stale.map(({ id }) => id).join(', ')}) — 값만 바뀌었으면 \`npm run ui:bump\`, 쓰는 법이 바뀌었으면 \`npm run ui:bump -- --minor\``);
}
if (!ledger) {
  errors.push('ui-library/release-log.json 이 없습니다 — 번호 장부가 있어야 개발자가 낡았는지 압니다');
} else {
  if (ledger.canonicalFingerprint !== fingerprint && !stale.length) {
    errors.push(`장부의 지문이 지금 배포본과 다릅니다 — 번호를 올리세요 (\`npm run ui:bump\`)`);
  }
  if (ledger.version !== pkg.version) {
    errors.push(`장부 번호(${ledger.version})와 ui-library/package.json 번호(${pkg.version})가 다릅니다`);
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify({ version: ledger?.version ?? null, releasedAt: ledger?.releasedAt ?? null, canonicalFingerprint: fingerprint, stale: stale.map(({ id }) => id), errors }, null, 2));
  process.exit(errors.length ? 1 : 0);
}

if (errors.length) {
  for (const message of errors) console.error(`❌ ${message}`);
  process.exit(1);
}
console.log(`✅ 배포본 번호 ${ledger.version} (${ledger.releasedAt}) · 부품 ${components.length}종 전부 정본과 일치`);
process.exit(0);
