#!/usr/bin/env node
/**
 * Token Sync Locate
 *
 * 토큰 1개의 "값"이 들어있는 모든 표면(surface)을 찾아 보고한다.
 * token-sync 서브에이전트가 토큰 값을 수정할 때, 어떤 파일을 함께 고쳐야
 * 누락이 없는지 결정론적으로 알려주는 도구다.
 *
 * 사용:
 *   node scripts/token-sync-locate.js --color-control-bg-disabled
 *   node scripts/token-sync-locate.js color/control/bg/disabled
 *
 * 입력은 CSS 변수명(--color-...) 또는 Figma 팔레트 경로(color/.../...) 둘 다 허용.
 * 두 형식을 상호 변환해 양쪽 표면을 모두 찾는다.
 *
 * 표면 분류:
 *   [SOURCE]  직접 값을 정의 — 반드시 수동 수정
 *   [AUTO]    빌드/싱크 스크립트가 재생성 — 명령만 실행
 *   [DOC]     사람용 문서/표 (resolved hex 포함 가능) — 수동 수정
 *   [REF]     var() 참조만 (값 아님) — 수정 불필요, 참고용
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// ── 입력 정규화 ────────────────────────────────
const raw = process.argv[2];
if (!raw) {
  console.error('사용법: node scripts/token-sync-locate.js <--color-... | color/.../...>');
  process.exit(1);
}

// CSS var (--color-control-bg-disabled) ↔ Figma path (color/control/bg/disabled)
function toCssVar(s) {
  if (s.startsWith('--')) return s;
  return '--' + s.replace(/\//g, '-');
}
function toFigmaPath(s) {
  if (s.includes('/')) return s;
  return s.replace(/^--/, '').replace(/-/g, '/');
}
const cssVar    = toCssVar(raw);
const figmaPath = toFigmaPath(raw);

// ── 표면 정의 ────────────────────────────────
// pattern 은 grep -F 가 아니라 정규식. value 정의 라인을 우선 잡도록 구성.
const SURFACES = [
  { file: 'assets/css/tokens.css',                              kind: 'SOURCE', note: 'CSS 정본 (Light/Dark 블록). 값 변경의 출발점.' },
  { file: 'plugins/figma-vars-installer/src/vars-data.ts',      kind: 'SOURCE', note: 'Figma 설치기 팔레트 매핑. light/dark 팔레트 경로 사용(gray/100 형식).' },
  { file: 'pages/semantic.html',                                kind: 'DOC',    note: 'Semantic 표 — resolved hex(light/dark) 하드코딩. 문서화된 토큰만.' },
  { file: 'tokens/semantic.md',                                 kind: 'DOC',    note: 'Semantic 사람용 문서. 문서화된 토큰만.' },
  { file: 'tokens/component-tokens-extracted.md',               kind: 'DOC',    note: 'Component 토큰 사람용 문서. 해당 시에만.' },
  { file: 'registry/tokens/semantic.colors.json',              kind: 'DOC',    note: 'Semantic 레지스트리. 문서화된 토큰만.' },
  { file: 'pages/install-prompt.html',                          kind: 'AUTO',   note: 'npm run tokens:sync-prompt 로 tokens.css에서 재생성.' },
  { file: 'assets/downloads/s1-design-system-installer.zip',      kind: 'AUTO',   note: 'npm run installer:build 로 vars-data.ts에서 재빌드.' },
  { file: 'pages/components-new.html',                          kind: 'REF',    note: 'tokens.css link 상속 — JS resolved. 값 하드코딩 아님. (구 components.html 은 레거시·검수 제외)' },
];

function grepFile(file, ...needles) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) return [];
  // 바이너리(zip)는 스킵
  if (file.endsWith('.zip')) return [];
  const lines = fs.readFileSync(abs, 'utf8').split('\n');
  const hits = [];
  lines.forEach((line, i) => {
    if (needles.some(n => line.includes(n))) {
      hits.push({ n: i + 1, text: line.trim().slice(0, 120) });
    }
  });
  return hits;
}

console.log(`\n🔎 토큰 표면 위치 — ${cssVar}  (Figma: ${figmaPath})\n`);
console.log('  [SOURCE]=수동수정  [DOC]=수동수정(문서)  [AUTO]=명령실행  [REF]=참고(수정불요)\n');

const order = { SOURCE: 0, DOC: 1, AUTO: 2, REF: 3 };
const surfaces = [...SURFACES].sort((a, b) => order[a.kind] - order[b.kind]);

let anyHit = false;
for (const s of surfaces) {
  const hits = grepFile(s.file, cssVar, figmaPath);
  if (s.file.endsWith('.zip')) {
    console.log(`  [${s.kind}] ${s.file}`);
    console.log(`         ↳ ${s.note}\n`);
    continue;
  }
  if (hits.length === 0) continue;
  anyHit = true;
  console.log(`  [${s.kind}] ${s.file}  (${hits.length} hit)`);
  console.log(`         ↳ ${s.note}`);
  for (const h of hits.slice(0, 6)) {
    console.log(`         ${String(h.n).padStart(5)} | ${h.text}`);
  }
  if (hits.length > 6) console.log(`         … +${hits.length - 6} more`);
  console.log('');
}

if (!anyHit) {
  console.log('  ⚠️  어떤 표면에서도 발견되지 않음. 토큰명을 확인하세요.\n');
}

// ── 권장 후속 명령 ────────────────────────────────
console.log('  ──────────────────────────────────────────');
console.log('  값 수정 후 실행할 명령 (순서대로):');
console.log('    1. npm run tokens:sync-prompt      # install-prompt.html 재생성');
console.log('    2. npm run installer:build         # 설치기 zip 재빌드 (vars-data.ts 변경 시)');
console.log('    3. npm run installer:coverage      # Gate 6 커버리지');
console.log('    4. npm run gate:check              # Gate 1/3/4/6 일괄');
console.log('');
