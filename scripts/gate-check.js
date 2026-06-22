#!/usr/bin/env node
/**
 * Gate Check — Registry + Report + Quality + Installer Coverage gates
 * Usage: node scripts/gate-check.js
 *
 * Gate 1: Registry            — component registry path/JSON 유효성
 * Gate 2: Report              — reports-index.json vs 실제 파일 정합성
 * Gate 3: Quality             — tokens.css raw HEX / Foundation 직접 참조 감지
 * Gate 4: Installer Coverage  — tokens.css 의 Foundation·Semantic 토큰이
 *                                figma-vars-installer 의 Variables 정의에 반영됐는지
 * Gate 7: Token Sync Monitor  — 토큰 "값"이 전 표면에서 정본과 일치하는지
 * Gate 8: Component Key Cov.   — build-components.ts 빌더의 동적 scv 키가
 *                                vars-data 정본에 모두 존재하는지(런타임 누락 사전 차단)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

let errors = 0;
let warnings = 0;

const pass = (msg) => console.log(`  ✅ ${msg}`);
const warn = (msg) => { console.warn(`  ⚠️  ${msg}`); warnings++; };
const fail = (msg) => { console.error(`  ❌ ${msg}`); errors++; };

// ── Gate 1: Registry Gate ─────────────────────────────────────────
console.log('\n🔎 [Gate 1] 부품명세 검사기 (Registry)');

try {
  const compIndexPath = path.join(ROOT, 'registry/components/index.json');
  const compIndex = JSON.parse(fs.readFileSync(compIndexPath, 'utf-8'));

  for (const comp of compIndex.components) {
    const compPath = path.join(ROOT, comp.path);
    if (!fs.existsSync(compPath)) {
      fail(`Component registry missing: ${comp.path} (id: ${comp.id})`);
    } else {
      try {
        JSON.parse(fs.readFileSync(compPath, 'utf-8'));
        pass(`${comp.id}: registry JSON valid`);
      } catch {
        fail(`${comp.path}: invalid JSON`);
      }
    }
  }
} catch (e) {
  fail(`registry/components/index.json: ${e.message}`);
}

const tokenRegistryFiles = [
  'registry/tokens/semantic.colors.json',
  'registry/tokens/canonical-token-draft.json',
  'registry/tokens/token-aliases.json',
];
for (const rel of tokenRegistryFiles) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    warn(`Token registry not found: ${rel}`);
  } else {
    try {
      JSON.parse(fs.readFileSync(p, 'utf-8'));
      pass(`${path.basename(rel)}: valid JSON`);
    } catch {
      fail(`${rel}: invalid JSON`);
    }
  }
}

// ── Gate 2: Report Gate ───────────────────────────────────────────
console.log('\n🔎 [Gate 2] 리포트색인 검사기 (Report)');

const reportsDir = path.join(ROOT, 'reports');
const reportsIndexPath = path.join(ROOT, 'data/reports-index.json');

if (!fs.existsSync(reportsIndexPath)) {
  warn('reports-index.json not found — run: npm run reports:sync');
} else {
  try {
    const index = JSON.parse(fs.readFileSync(reportsIndexPath, 'utf-8'));
    const indexed = new Set((index.reports || []).map((r) => r.filename || r.file));
    const mdFiles = fs.readdirSync(reportsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    let unindexed = 0;
    for (const f of mdFiles) {
      if (!indexed.has(f)) {
        warn(`Report not indexed: ${f} — run: npm run reports:sync`);
        unindexed++;
      }
    }
    if (unindexed === 0) {
      pass(`${indexed.size} reports indexed (all ${mdFiles.length} MD files covered)`);
    }
  } catch (e) {
    fail(`reports-index.json: ${e.message}`);
  }
}

// ── Gate 3: Quality Gate ──────────────────────────────────────────
console.log('\n🔎 [Gate 3] 색상규칙 검사기 (Quality)');

const tokensCSSPath = path.join(ROOT, 'assets/css/tokens.css');
if (!fs.existsSync(tokensCSSPath)) {
  fail('assets/css/tokens.css not found');
} else {
  const css = fs.readFileSync(tokensCSSPath, 'utf-8');
  const lines = css.split('\n');

  // Foundation prefixes — allowed to have raw HEX
  const foundationPrefixes = [
    '--color-gray-', '--color-blue-', '--color-red-', '--color-orange-',
    '--color-yellow-', '--color-green-', '--color-skyblue-', '--color-purple-',
    '--color-brown-', '--color-visual-', '--color-coolgray-', '--color-base-',
    '--color-brand-', '--color-status-dark-',
  ];

  // Semantic-level tokens allowed to carry a raw HEX (no Foundation alias)
  // Reason: blue-gray tint (#F5F6FB) is distinct from both gray and visual-gray families;
  // Figma treats this as a semantic surface value, not a Foundation primitive.
  const hexAllowlist = [
    '--color-bg-home',
  ];

  let rawHexCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('/*') || line.startsWith('*') || line.startsWith('//')) continue;
    // Strip inline comments before checking for raw HEX
    const codeOnly = line.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '');
    if (!/#[0-9a-fA-F]{3,8}\b/.test(codeOnly)) continue;

    const isFoundation = foundationPrefixes.some((p) => line.startsWith(p));
    const isAllowlisted = hexAllowlist.some((t) => line.startsWith(t));
    if (!isFoundation && !isAllowlisted) {
      warn(`Raw HEX in non-Foundation rule (line ${i + 1}): ${line.slice(0, 80)}`);
      rawHexCount++;
      if (rawHexCount >= 5) {
        warn('(further raw HEX violations suppressed — fix these first)');
        break;
      }
    }
  }
  if (rawHexCount === 0) {
    pass('No raw HEX values in Semantic/Component tokens');
  }

  // Check install-prompt sync (basic: file must exist)
  const installPromptPath = path.join(ROOT, 'pages/install-prompt.html');
  if (!fs.existsSync(installPromptPath)) {
    warn('pages/install-prompt.html not found — tokens.css sync target missing');
  } else {
    pass('install-prompt.html exists');

    // 인라인 다운로드 CSS 가 tokens.css 와 동기화됐는지 검증
    try {
      const { spawnSync } = require('child_process');
      const r = spawnSync('node', [path.join(ROOT, 'scripts/sync-install-prompt.js'), '--check'], { encoding: 'utf-8' });
      if (r.status === 0) {
        pass(r.stdout.trim().replace(/^✅\s*/, ''));
      } else {
        fail(`install-prompt.html 다운로드 인라인 CSS 가 tokens.css 와 불일치 — 실행: npm run tokens:sync-prompt`);
      }
    } catch (e) {
      warn(`install-prompt 동기화 검사 실행 실패: ${e.message}`);
    }
  }
}

// ── Gate 4: Installer Coverage Gate ──────────────────────────────
console.log('\n🔎 [Gate 4] 설치기누락 검사기 (Installer Coverage)');

try {
  const { audit } = require('./installer-coverage-check');
  const cov = audit();
  let covMissing = 0;
  for (const kind of Object.keys(cov.missing)) {
    covMissing += cov.missing[kind].length;
  }
  if (covMissing === 0) {
    pass(`installer ↔ tokens.css 완전 커버 (Foundation ${cov.stats.FOUNDATION_COLOR.expected + cov.stats.FOUNDATION_NUMBER.expected}, Semantic ${cov.stats.SEMANTIC_COLOR.expected + cov.stats.SEMANTIC_NUMBER.expected})`);
  } else {
    for (const kind of Object.keys(cov.missing)) {
      for (const item of cov.missing[kind]) {
        fail(`[${kind}] ${item.cssName} → expected Figma path: ${item.figmaPath}`);
      }
    }
  }
  if (cov.outOfScopeSemanticColor.length > 0) {
    warn(`installer SEMANTIC_COLOR 미반영 역할: ${cov.outOfScopeSemanticColor.length}개 (run: npm run installer:coverage)`);
  }
} catch (e) {
  fail(`installer-coverage-check 실패: ${e.message}`);
}

// ── Gate 6b: Installer Build Freshness ───────────────────────────
// 커밋된 설치기 zip 이 vars-data 정본 최신 빌드인지(빌드 누락 시 stale 탐지).
// Gate 6(coverage)는 소스만 봐 빌드 산출물 stale 을 못 잡던 사각지대 보완.
try {
  const { check: freshnessCheck } = require('./installer-freshness-check');
  freshnessCheck({ pass, warn, fail });
} catch (e) {
  fail(`installer-freshness-check 실행 실패: ${e.message}`);
}

// ── Gate 7: Token Sync Monitor ───────────────────────────────────
// 토큰 "값"이 모든 표면에서 정본(vars-data)과 일치하는지 기계 판정. (site-base 는 사이트 전용·검수 제외)
console.log('\n🔎 [Gate 7] 토큰값일치 검사기 (Token Sync)');

try {
  const { monitor } = require('./token-sync-monitor');
  const r = monitor();
  for (const s of r.results) {
    if (s.error) { fail(`${s.id} 추출 실패: ${s.error}`); continue; }
    if (s.unmonitored) { warn(`${s.id} 추출 0건 — 모니터 안 됨(셀렉터/네이밍 점검)`); continue; }
    // 완전성(B): 정본 집합과 페이지 토큰 집합 불일치 → 누락/잉여 (Tier1 fail)
    if (s.missing && s.missing.length) {
      fail(`${s.id} 토큰 ${s.missing.length}개 누락(정본엔 있으나 페이지 없음): ${s.missing.slice(0, 5).join(', ')}${s.missing.length > 5 ? ' …' : ''} → npm run page:gen`);
    }
    if (s.extra && s.extra.length) {
      fail(`${s.id} stale 토큰 ${s.extra.length}개(페이지엔 있으나 정본 없음): ${s.extra.slice(0, 5).join(', ')}${s.extra.length > 5 ? ' …' : ''}`);
    }
    if (s.mismatches.length === 0 && !(s.missing && s.missing.length) && !(s.extra && s.extra.length)) {
      pass(`${s.id}: ${s.compared}건 정본 일치${s.complete ? ' · 집합 완전' : ''}`);
    } else if (s.tier === 1) {
      for (const m of s.mismatches.slice(0, 6)) {
        fail(`${s.id} ${m.token} [${m.mode}] 정본=${m.canonical} ≠ ${m.surface}`);
      }
      if (s.mismatches.length > 6) fail(`${s.id} … +${s.mismatches.length - 6} more drift`);
    } else {
      warn(`${s.id}: ${s.mismatches.length} 불일치(문서, npm run tokens:reconcile)`);
    }
  }
} catch (e) {
  fail(`token-sync-monitor 실패: ${e.message}`);
}

// ── Gate 8: Component Key Coverage ───────────────────────────────
// build-components.ts 빌더가 동적 조합하는 scv 키가 vars-data 정본에 다 있는지.
// audit-bindings(네임스페이스만 검사)의 사각지대 — leaf 키 누락 시 Figma 실행 중 크래시.
// esbuild 번들 + mock 실행이 필요해 별도 프로세스로 호출(spawnSync).
console.log('\n🔎 [Gate 8] 부품–변수연결 검사기 (Component Key)');
try {
  const { spawnSync } = require('child_process');
  const r = spawnSync('node', [path.join(ROOT, 'scripts/component-key-coverage-check.js')], { encoding: 'utf-8' });
  if (r.status === 0) {
    const m = (r.stdout || '').match(/requested (\d+) \/ supply (\d+)/);
    pass(`build-components 키 누락 0${m ? ` (color ${m[1]}/${m[2]})` : ''}`);
  } else {
    const lines = (r.stdout + r.stderr).split('\n').filter((l) => l.includes('❌'));
    for (const l of lines) fail(l.replace(/^\s*❌\s*/, ''));
    if (lines.length === 0) fail(`component-key-coverage-check 실패 (exit ${r.status})`);
  }
} catch (e) {
  fail(`component-key-coverage-check 실행 실패: ${e.message}`);
}

// ── Gate 9: Number/Sizing Page Consistency ────────────────────────
// 컴포넌트별 사이징 Semantic 폐지 → Foundation --sizing-N 직접 참조 전환을 영구 강제.
// (A) foundation.html Sizing 블록 = vars-data 정본 / (B) 폐지 토큰 재유입 0건.
console.log('\n🔎 [Gate 9] 사이즈·숫자페이지 검사기 (Number Page)');
try {
  const { check: numberPageCheck } = require('./number-page-check');
  numberPageCheck({ pass, warn, fail });
} catch (e) {
  fail(`number-page-check 실행 실패: ${e.message}`);
}

// ── Gate 10: Doc Token Reference Drift ────────────────────────────
// 가이드/레퍼런스 HTML 이 rename·삭제된 토큰명을 쥐고 있는지 강제.
// Check B(rename denylist)=차단 · Check A(미정의 --color-* 참조)=경고(기존 드리프트).
console.log('\n🔎 [Gate 10] 문서토큰이름 검사기 (Doc Token Ref)');
try {
  const { spawnSync } = require('child_process');
  const r = spawnSync('node', [path.join(ROOT, 'scripts/doc-token-ref-check.js')], { encoding: 'utf-8' });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status === 0) {
    pass('문서 rename denylist 잔재 0 (활성 페이지 토큰 경로 정본 일치)');
    const wm = out.match(/미정의 --color-\* 참조 (\d+)건/);
    if (wm) warn(`미정의 --color-* 참조 ${wm[1]}건 — 기존 드리프트(별도 정리). 상세: npm run docs:tokencheck`);
  } else {
    const lines = out.split('\n').filter((l) => l.includes('❌'));
    for (const l of lines) fail(l.replace(/^\s*❌\s*/, ''));
    if (lines.length === 0) fail(`doc-token-ref-check 실패 (exit ${r.status})`);
  }
} catch (e) {
  fail(`doc-token-ref-check 실행 실패: ${e.message}`);
}

// ── Gate 11: Component Anatomy ────────────────────────────────────
// 상태별 필수 하위 요소(Editing 의 caret·selected 의 clear 아이콘 등)를 빌더가 실제로
// 생성하는지 강제. 토큰만 보던 게이트들의 "구조 사각지대" — caret·close 누락 2회 유출 차단.
// esbuild 번들 + recording mock 실행이 필요해 별도 프로세스로 호출(spawnSync).
console.log('\n🔎 [Gate 11] 부품해부 검사기 (Component Anatomy)');
try {
  const { spawnSync } = require('child_process');
  const r = spawnSync('node', [path.join(ROOT, 'scripts/component-anatomy-check.js')], { encoding: 'utf-8' });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status === 0) {
    const m = out.match(/(\d+)개 규칙 전부 충족/);
    pass(`상태별 필수 하위 요소 누락 0${m ? ` (${m[1]}개 규칙)` : ''}`);
  } else {
    const lines = out.split('\n').filter((l) => l.includes('❌'));
    for (const l of lines) fail(l.replace(/^\s*❌\s*/, ''));
    if (lines.length === 0) fail(`component-anatomy-check 실패 (exit ${r.status})`);
  }
} catch (e) {
  fail(`component-anatomy-check 실행 실패: ${e.message}`);
}

// ── Gate 12: Icon Instance Policy ─────────────────────────────────
// 아이콘은 V2.2 라이브러리 컴포넌트 인스턴스(makeIconInstance)로만. 벡터 직삽입은 allow 마커 필수.
console.log('\n🔎 [Gate 12] 아이콘인스턴스 검사기 (Icon Instance Policy)');
try {
  const { check: iconCheck } = require('./icon-instance-policy-check');
  const r = iconCheck();
  if (r.violations.length === 0) {
    pass(`아이콘 벡터 직삽입 0 (라이브러리 인스턴스 강제 · 벡터 예외 ${r.allowed.length}건 마커 명시)`);
  } else {
    for (const v of r.violations) fail(`아이콘 벡터 직삽입 L${v.line}: ${v.text} — makeIconInstance 사용 또는 allow 마커 필요`);
  }
} catch (e) {
  fail(`icon-instance-policy-check 실행 실패: ${e.message}`);
}

// ── Gate 13: Installer Build Verification ─────────────────────────
// build-components.ts(설치기 생성기 코드) 내용이 독립 검증(component-verifier)을 거쳤는지
// 해시로 묶어 강제. 빌드자 ≠ 검증자 — ⭐ 단독 빌드+자가검증(self-certify)을 커밋 단계 차단.
console.log('\n🔎 [Gate 13] 설치기빌드검증 검사기 (Installer Build Verify)');
try {
  const { check: buildVerifyCheck } = require('./installer-build-verify-check');
  buildVerifyCheck({ pass, warn, fail });
} catch (e) {
  fail(`installer-build-verify-check 실행 실패: ${e.message}`);
}

// ── Gate 14: Footer Content ───────────────────────────────────────
// 풋터 법인정보·링크·카피라이트가 검증된 정본(registry/content/footer.json)과 일치하는지.
// 임의 작성/날조 텍스트(대표이사·주소 등) 재유입을 커밋 단계 차단. (2026-06-22 신설)
console.log('\n🔎 [Gate 14] 풋터콘텐츠 검사기 (Footer Content)');
try {
  const { spawnSync } = require('child_process');
  const r = spawnSync('node', [path.join(ROOT, 'scripts/footer-content-check.js')], { encoding: 'utf-8' });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status === 0) {
    const m = out.match(/정본 (\d+)건 verbatim/);
    pass(`풋터 법인정보·링크·카피라이트 정본 일치${m ? ` (${m[1]}건)` : ''}`);
  } else {
    const lines = out.split('\n').filter((l) => l.includes('❌'));
    for (const l of lines) fail(l.replace(/^\s*❌\s*/, ''));
    if (lines.length === 0) fail(`footer-content-check 실패 (exit ${r.status})`);
  }
} catch (e) {
  fail(`footer-content-check 실행 실패: ${e.message}`);
}

// ── Summary ───────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────────────');
if (errors > 0) {
  console.error(`\nGate Check FAILED — ${errors} error(s), ${warnings} warning(s)\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`\nGate Check PASSED with ${warnings} warning(s)\n`);
  process.exit(0);
} else {
  console.log(`\n🔎 검사기 전부 통과 — all gates clear\n`);
  process.exit(0);
}
