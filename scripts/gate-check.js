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
console.log('\n[Gate 1] Registry Gate');

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
console.log('\n[Gate 2] Report Gate');

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
console.log('\n[Gate 3] Quality Gate');

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
console.log('\n[Gate 4] Installer Coverage Gate');

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

// ── Gate 7: Token Sync Monitor ───────────────────────────────────
// 토큰 "값"이 모든 표면에서 정본(vars-data·site-base)과 일치하는지 기계 판정.
console.log('\n[Gate 7] Token Sync Monitor');

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

// ── Summary ───────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────────────');
if (errors > 0) {
  console.error(`\nGate Check FAILED — ${errors} error(s), ${warnings} warning(s)\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`\nGate Check PASSED with ${warnings} warning(s)\n`);
  process.exit(0);
} else {
  console.log(`\nGate Check PASSED — all gates clear\n`);
  process.exit(0);
}
