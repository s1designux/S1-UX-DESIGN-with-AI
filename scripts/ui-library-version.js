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
const DIST = path.join(LIBRARY, 'dist');

const BUMP = process.argv.includes('--bump');
const MINOR = process.argv.includes('--minor');
const JSON_OUT = process.argv.includes('--json');
const RECORD = process.argv.includes('--record');
/* --refresh: 번호는 그대로 두고 지문만 다시 적는다. 같은 판(release)을 아직 커밋하기 전에
   정본을 한 번 더 다듬었을 때 쓴다 — 이미 올린 번호를 또 올리면 개발자에게 없던 판이 생긴다. */
const REFRESH = process.argv.includes('--refresh');
/* 정본 파일 하나(build-components.ts)가 25개 부품 지문에 모두 걸려 있다.
   그래서 한 부품만 고쳐도 전부 "달라짐"으로 잡힌다 — 실제로 달라진 부품만 번호를 올리려면
   `--only <id,id>` 로 짚어 준다. 지문은 어차피 전부 갱신된다(그러지 않으면 빌드가 멈춘다). */
const ONLY = (() => {
  const at = process.argv.indexOf('--only');
  if (at === -1) return null;
  const value = process.argv[at + 1];
  if (!value || value.startsWith('--')) {
    console.error('❌ --only 뒤에 부품 id 를 쉼표로 적어 주세요 (예: --only mobile-bottom-nav)');
    process.exit(1);
  }
  return value.split(',').map((one) => one.trim()).filter(Boolean);
})();

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

/* 정본 지문 = **부품 몫만** 센다 — 계산은 scripts/lib/canonical-fingerprint.js 한 곳에 있고
   빌드(ui-library/scripts/build.mjs)도 같은 모듈을 쓴다(두 벌로 두면 갈라진다).
   종전에는 정본 파일을 통째로 세서 주석 한 줄만 고쳐도 27종 전부가 "달라짐"이 됐다. */
const { canonicalFingerprint } = require('./lib/canonical-fingerprint');

/**
 * 전달본 지문 — **개발자가 받아 가는 내용**이 바뀌었는지 본다.
 * 정본이 그대로여도 옮기는 코드가 늘면(예: Compose 부품 추가) 받는 것은 달라진다.
 * 번호 자체는 파일 안에 박혀 있으므로 세기 전에 자리표시자로 바꾼다 — 그러지 않으면
 * 번호를 올릴 때마다 지문이 따라 바뀌어 영원히 제자리를 맴돈다.
 */
function deliveryFingerprint(version, releasedAt) {
  const files = [];
  const walk = (directory, prefix = '') => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(directory, entry.name), relative);
      else files.push(relative);
    }
  };
  walk(DIST);
  const digest = createHash('sha256');
  for (const relative of files) {
    digest.update(`${relative}\0`);
    let content = fs.readFileSync(path.join(DIST, relative));
    const text = content.toString('utf8');
    if (!text.includes('\uFFFD')) {
      content = Buffer.from(text.split(version).join('<VERSION>').split(releasedAt).join('<DATE>'), 'utf8');
    }
    digest.update(content);
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

// ── 지문만 갱신(번호 유지) ────────────────────────────────────────────
if (REFRESH) {
  const touched = [];
  for (const component of components.filter((one) => one.stale)) {
    component.manifest.canonicalFingerprint = component.actual;
    writeJson(component.file, component.manifest);
    touched.push(component.id);
  }
  const ledger = readJson(LEDGER);
  ledger.canonicalFingerprint = hash(components.map(({ actual }) => actual).join('\0'));
  writeJson(LEDGER, ledger);
  console.log(touched.length
    ? `✅ 지문만 갱신 ${touched.length}종 (번호 ${ledger.version} 그대로): ${touched.join(', ')}`
    : 'ℹ️  갱신할 지문이 없습니다.');
  process.exit(0);
}

// ── 전달본 지문 기록 (빌드 뒤) ─────────────────────────────────────────
if (RECORD) {
  const ledger = readJson(LEDGER);
  const delivery = deliveryFingerprint(ledger.version, ledger.releasedAt);
  if (ledger.deliveryFingerprint === delivery) {
    console.log('ℹ️  전달본 내용이 그대로입니다 — 기록할 것이 없습니다.');
    process.exit(0);
  }
  ledger.deliveryFingerprint = delivery;
  if (ledger.releases[0]) ledger.releases[0].deliveryFingerprint = delivery;
  writeJson(LEDGER, ledger);
  console.log(`✅ 전달본 지문 기록 — ${ledger.version} (${delivery.slice(0, 12)}…)`);
  process.exit(0);
}

// ── 올리기 ────────────────────────────────────────────────────────────
if (BUMP) {
  const kind = MINOR ? 'minor' : 'patch';
  const ledger = fs.existsSync(LEDGER) ? readJson(LEDGER) : null;
  if (!ledger) {
    console.error('❌ ui-library/release-log.json 이 없습니다 — 장부 없이 번호를 올릴 수 없습니다.');
    process.exit(1);
  }
  /* 장부에 전달본 지문이 아직 없으면 "그대로임"을 증명할 수 없다 — 올리는 것을 막지 않는다. */
  const deliveryChanged = ledger.deliveryFingerprint === undefined
    || ledger.deliveryFingerprint !== deliveryFingerprint(ledger.version, ledger.releasedAt);
  if (!stale.length && !deliveryChanged) {
    console.log('ℹ️  정본도 전달본도 달라진 것이 없습니다 — 올릴 번호가 없습니다.');
    process.exit(0);
  }
  if (ONLY) {
    const unknown = ONLY.filter((id) => !components.some((component) => component.id === id));
    if (unknown.length) {
      console.error(`❌ 모르는 부품 id: ${unknown.join(', ')}`);
      process.exit(1);
    }
  }
  const changed = [];
  const refreshed = [];
  for (const component of stale) {
    const bumps = !ONLY || ONLY.includes(component.id);
    const from = component.manifest.version;
    if (bumps) component.manifest.version = bumpVersion(from, kind);
    component.manifest.canonicalFingerprint = component.actual;
    writeJson(component.file, component.manifest);
    if (bumps) changed.push({ id: component.id, from, to: component.manifest.version });
    else refreshed.push(component.id);
  }
  const version = bumpVersion(ledger.version, kind);
  const fingerprint = combined(components);
  ledger.version = version;
  ledger.releasedAt = today();
  ledger.canonicalFingerprint = fingerprint;
  ledger.releases.unshift({ version, date: ledger.releasedAt, kind, canonicalFingerprint: fingerprint, components: changed, note: changed.length === 0 ? '정본은 그대로고 옮기는 코드가 달라졌다(전달본 내용 변경).' : undefined });
  writeJson(LEDGER, ledger);
  pkg.version = version;
  writeJson(PACKAGE, pkg);

  console.log(`\n🔢 배포본 번호 ${version} (${kind === 'minor' ? '가운데 자리 — 쓰는 법이 바뀜' : '끝자리 — 값만 바뀜'}) · ${ledger.releasedAt}`);
  for (const { id, from, to } of changed) console.log(`   · ${id} ${from} → ${to}`);
  if (refreshed.length) console.log(`   · 지문만 갱신(내용 그대로) ${refreshed.length}종: ${refreshed.join(', ')}`);
  console.log('\n   이제 `npm run ui:build` 로 전달본을 다시 만든 뒤 `npm run ui:version -- --record` 로 마무리하세요.\n');
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
  if (ledger.deliveryFingerprint !== undefined && !stale.length) {
    const delivery = deliveryFingerprint(ledger.version, ledger.releasedAt);
    if (ledger.deliveryFingerprint !== delivery) {
      errors.push('개발자가 받아 가는 내용이 바뀌었는데 번호가 그대로입니다 — 부품이 늘거나 쓰는 법이 바뀌었으면 `npm run ui:bump -- --minor`, 값만 달라졌으면 `npm run ui:bump`');
    }
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
