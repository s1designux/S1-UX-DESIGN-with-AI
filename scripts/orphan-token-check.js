#!/usr/bin/env node
/**
 * orphan-token-check.js  (Gate 17 — 미사용 Semantic Color 토큰 검사기)
 * ─────────────────────────────────────────────────────────────────────────
 * "이 semantic color 토큰이 실제로 어디서든 쓰이나?"를 **전 표면 결정론 검사**로 답한다.
 * (손 grep 단정 → 사각지대로 오판하던 문제의 구조적 차단. 2026-06-30 사용자 요청으로 게이트 승격.)
 *
 * 소비 표면 3종 — 한 곳에서라도 쓰이면 '사용':
 *   1. 설치기 빌더    : build-components.ts 를 esbuild 번들 후 mock figma 로 buildAllComponents 실행,
 *                       scv(maps,"color/…") 로 요청된 키 수집 (동적 키 opt(k)/`${v}` 까지 실측).
 *   2. 웹사이트 CSS   : 컴포넌트/사이트 CSS·페이지의 var(--color-…) 소비.
 *   3. registry spec  : registry/components|patterns/*.json 의 토큰 경로 언급(figmaVariable·note 포함, 보수적).
 *
 * orphan = vars-data SEMANTIC_COLOR 공급 − (빌더 ∪ 웹 ∪ registry).
 * 그중 의도적 보존분(향후 컴포넌트·연결 예정)은 registry/governance/intentional-unused-tokens.json 으로 면제.
 * 남는 것 = **예상치 못한 orphan** → 경고(WARN, 비차단). 새 미사용 토큰이 조용히 쌓이는 걸 가시화.
 *
 * 출력 끝줄: `ORPHAN_SUMMARY total=<n> allow=<n> unexpected=<n>` (gate-check 파싱용). 항상 exit 0.
 * 사용: node scripts/orphan-token-check.js   (또는 npm run tokens:orphans)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const VD = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');
const ALLOW = path.join(ROOT, 'registry/governance/intentional-unused-tokens.json');

// ── 1. 공급: vars-data SEMANTIC_COLOR 키 ("color/…": 형태) ──────────────────
const vd = fs.readFileSync(VD, 'utf8');
const supply = new Set([...vd.matchAll(/"(color\/[^"]+)"\s*:/g)].map((m) => m[1]));

// ── 2. 웹 소비: var(--color-…) ────────────────────────────────────────────
const WEB = [
  // component-tokens.css 제외 — 은퇴 별칭층(legacyFiles), 렌더 안 되는 죽은 파일이라 소비 집계 왜곡 (2026-07-10)
  'assets/css/site-base.css', 'assets/css/style.css',
  'pages/components-new.html', 'pages/foundation.html', 'pages/dashboard.html',
  'pages/icons.html', 'pages/layer-policy.html', 'pages/update-management.html',
].map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f));
const consumed = new Set();
for (const f of WEB) for (const m of fs.readFileSync(f, 'utf8').matchAll(/var\(\s*(--color-[a-z0-9-]+)\s*\)/g)) consumed.add(m[1]);
const toCss = (tok) => '--' + tok.replace(/\//g, '-');

// ── 3. registry spec 언급 (보수적: 문자열 등장 = 참조) ─────────────────────
const regDirs = ['registry/components', 'registry/patterns'].map((d) => path.join(ROOT, d));
let regText = '';
for (const d of regDirs) {
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json'))) regText += fs.readFileSync(path.join(d, f), 'utf8') + '\n';
}
const inRegistry = (tok) => regText.includes(tok);

// ── 4. 빌더 요청 키 (esbuild + mock) ──────────────────────────────────────
function makeStub() {
  const f = function () { return makeStub(); };
  return new Proxy(f, {
    get(_t, p) { if (p === 'then') return undefined; if (p === Symbol.iterator) return undefined; if (p === 'children') return []; if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0; return makeStub(); },
    set() { return true; }, apply() { return makeStub(); },
  });
}
async function builderKeys() {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `bc-orphan-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  const req = new Set();
  const rec = (sink) => new Proxy({}, { get(_t, p) { if (typeof p === 'string') sink.add(p); return makeStub(); } });
  global.figma = makeStub();
  const maps = { semanticColor: rec(req), foundationColor: rec(new Set()), foundationNumber: rec(new Set()), textStyles: rec(new Set()), semanticColorCollectionId: 'c', semanticLightModeId: 'l', semanticDarkModeId: 'd' };
  try { await require(tmp).buildAllComponents(maps); } catch (e) { /* 키는 throw 전까지 수집됨 */ }
  try { fs.unlinkSync(tmp); } catch (_) { /* noop */ }
  return req;
}

(async () => {
  const req = await builderKeys();
  const allow = fs.existsSync(ALLOW) ? new Set((JSON.parse(fs.readFileSync(ALLOW, 'utf8')).tokens || []).map((t) => t.token)) : new Set();

  const orphans = [...supply].filter((k) => !req.has(k) && !consumed.has(toCss(k)) && !inRegistry(k)).sort();
  const unexpected = orphans.filter((k) => !allow.has(k));
  const staleAllow = [...allow].filter((k) => !orphans.includes(k)); // allowlist 에 있는데 더 이상 orphan 아님(연결됨/삭제됨)

  console.log(`[Gate 17] 미사용 Semantic Color 검사 — 공급 ${supply.size} · 빌더사용 ${[...req].filter((k) => k.startsWith('color/')).length} · 웹소비 ${consumed.size} · registry참조 다수`);
  console.log(`  orphan(전 표면 미사용) ${orphans.length} · 의도보존(allow) ${orphans.length - unexpected.length} · 예상밖 ${unexpected.length}`);
  if (unexpected.length) {
    console.log('  ⚠️ 예상치 못한 미사용 토큰(연결 또는 allowlist 등록 필요):');
    for (const k of unexpected) console.log('     -', k);
  }
  if (staleAllow.length) {
    console.log('  ℹ️ allowlist 에 있으나 더 이상 orphan 아님(정리 가능):');
    for (const k of staleAllow) console.log('     -', k);
  }
  console.log(`ORPHAN_SUMMARY total=${orphans.length} allow=${orphans.length - unexpected.length} unexpected=${unexpected.length} stale=${staleAllow.length}`);
  process.exit(0);
})();
