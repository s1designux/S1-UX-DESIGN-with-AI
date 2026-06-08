#!/usr/bin/env node
/**
 * Installer Coverage Check
 *
 * `assets/css/tokens.css` 의 Foundation·Semantic 토큰이
 * `plugins/figma-vars-installer/src/vars-data.ts` 의 Variables 정의에
 * 빠짐없이 반영됐는지 검증한다.
 *
 * 검사 방향: tokens.css → vars-data.ts (단방향)
 *   - tokens.css 에 정의됐지만 installer 에 없는 항목 = 누락 (warn/error)
 *   - 컴포넌트 토큰(--button-*, --chip-* 등)은 installer 범위 밖이라 제외
 *
 * 사용:
 *   node scripts/installer-coverage-check.js
 *   npm run installer:coverage
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKENS_CSS = path.join(ROOT, 'assets/css/tokens.css');
const VARS_DATA  = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');

// ── tokens.css 파서 ───────────────────────────────────────────────────────────

function loadCssVarNames(cssPath) {
  const css = fs.readFileSync(cssPath, 'utf-8');
  // tokens.css 는 :root 블록을 여러 개 가짐. 모든 :root 블록의 변수를 수집.
  const names = new Set();
  for (const r of css.matchAll(/^:root\s*\{([\s\S]*?)^\}/gm)) {
    const block = r[1];
    for (const vr of block.matchAll(/^\s*(--[a-z][a-z0-9-]*)\s*:/gmi)) {
      names.add(vr[1]);
    }
  }
  if (names.size === 0) throw new Error(':root block not found in tokens.css');
  return names;
}

// ── vars-data.ts 파서 ─────────────────────────────────────────────────────────

function loadFigmaPaths(tsPath) {
  const ts = fs.readFileSync(tsPath, 'utf-8');
  const sections = ['FOUNDATION_COLOR', 'FOUNDATION_NUMBER', 'SEMANTIC_COLOR', 'SEMANTIC_NUMBER'];
  const result = {};
  for (const name of sections) {
    result[name] = new Set();
    const start = ts.indexOf(`const ${name}`);
    if (start < 0) continue;
    // 다음 const/export 까지가 한 섹션
    const rest = ts.slice(start + name.length);
    const nextIdx = rest.search(/\n(export\s+const|export\s+interface)\s+/);
    const chunk = nextIdx > 0 ? rest.slice(0, nextIdx) : rest;
    // 키만 추출: "path/..." :
    for (const r of chunk.matchAll(/"([^"]+)"\s*:/g)) {
      const key = r[1];
      // value 안의 "light"/"dark" property 키는 제외
      if (key === 'light' || key === 'dark') continue;
      result[name].add(key);
    }
  }
  return result;
}

// ── CSS var → installer 카테고리 분류 ─────────────────────────────────────────

const COLOR_PALETTES = [
  'gray', 'gray-dark', 'blue', 'blue-dark', 'red', 'red-dark',
  'orange', 'orange-dark', 'yellow', 'yellow-dark', 'green', 'green-dark',
  'skyblue', 'skyblue-dark', 'purple', 'purple-dark', 'brown', 'brown-dark',
  'visual-gray', 'visual-gray-dark',
];

const COMPONENT_PREFIXES = [
  'button', 'checkbox', 'radio', 'toggle', 'input', 'textarea',
  'dropdown', 'select', 'chip', 'date-picker', 'time-picker',
  'table', 'pagination', 'nav', 'tab',
];

const SEMANTIC_COLOR_ROLES = [
  'bg', 'surface', 'text', 'border', 'icon', 'action', 'status',
  // installer 미반영 후보 — 누락으로 보고
  'control-bg', 'control-border', 'form-control', 'navigation', 'data', 'text-state',
];

// installer 에 이미 반영된 semantic 역할 — 신규 카테고리와 구분
const INSTALLED_SEMANTIC_COLOR_ROLES = ['bg', 'surface', 'text', 'border', 'icon', 'action', 'status'];
// installer 미반영 — 갭으로 별도 보고
const OUT_OF_SCOPE_SEMANTIC_COLOR_ROLES = ['control-bg', 'control-border', 'form-control', 'navigation', 'data', 'text-state'];

const DARK_PALETTES = ['gray-dark', 'blue-dark', 'red-dark', 'orange-dark', 'yellow-dark',
                       'green-dark', 'skyblue-dark', 'purple-dark', 'brown-dark', 'visual-gray-dark'];

function categorize(cssName) {
  // 컴포넌트 토큰 제외
  for (const cp of COMPONENT_PREFIXES) {
    if (cssName.startsWith(`--${cp}-`)) return null;
  }

  // Foundation Number primitives — 숫자/키워드 직값
  if (/^--spacing-\d+$/.test(cssName))                                return 'FOUNDATION_NUMBER';
  if (/^--radius-(\d+|full)$/.test(cssName))                          return 'FOUNDATION_NUMBER';
  if (/^--border-width-(1|2)$/.test(cssName))                         return 'FOUNDATION_NUMBER';
  if (/^--font-size-\d+$/.test(cssName))                              return 'FOUNDATION_NUMBER';
  if (/^--font-weight-(regular|medium|bold)$/.test(cssName))          return 'FOUNDATION_NUMBER';
  if (/^--line-height-\d+$/.test(cssName))                            return 'FOUNDATION_NUMBER';

  // Foundation Color — Hybrid 패턴(2026-06-08): light/dark 팔레트 모두 별도 변수
  // gray/N · gray-dark/N 모두 Figma Foundation 컬렉션에 단일 모드 변수로 등재됨
  for (const pal of COLOR_PALETTES) {
    if (new RegExp(`^--color-${pal}-\\d+$`).test(cssName)) return 'FOUNDATION_COLOR';
  }
  if (/^--color-base-(white|black)$/.test(cssName))     return 'FOUNDATION_COLOR';
  if (/^--color-brand-(blue|red|gray|ci)$/.test(cssName)) return 'FOUNDATION_COLOR';

  // alias 류 제외
  if (/^--color-status-dark-/.test(cssName))             return null;
  if (/^--border-width-(default|strong)$/.test(cssName)) return null;

  // Semantic Color — 가장 긴 prefix 우선 매칭 (text-state 가 text 보다 먼저 매치돼야 함)
  if (cssName === '--color-overlay') return 'SEMANTIC_COLOR';
  const allSemanticRoles = [
    ...OUT_OF_SCOPE_SEMANTIC_COLOR_ROLES.map((r) => ({ role: r, kind: 'SEMANTIC_COLOR_OUT_OF_SCOPE' })),
    ...INSTALLED_SEMANTIC_COLOR_ROLES.map((r) => ({ role: r, kind: 'SEMANTIC_COLOR' })),
  ].sort((a, b) => b.role.length - a.role.length);
  for (const { role, kind } of allSemanticRoles) {
    if (cssName.startsWith(`--color-${role}-`)) return kind;
  }

  // Semantic Number
  if (/^--spacing-(padding-block|padding-inline|section|stack|cluster|label-gap-inline|label-gap-block)-/.test(cssName)) {
    return 'SEMANTIC_NUMBER';
  }
  if (/^--sizing-/.test(cssName))                                 return 'SEMANTIC_NUMBER';
  if (/^--radius-(control|button|card|modal)-/.test(cssName))     return 'SEMANTIC_NUMBER';

  return null;
}

// ── CSS var → 예상 Figma 경로 ─────────────────────────────────────────────────

function expectedFigmaPath(cssName, kind) {
  // 공통 변환: -- 제거 후 - → /
  const stripped = cssName.replace(/^--/, '');

  if (kind === 'FOUNDATION_COLOR') {
    // --color-gray-0 → gray/0
    // --color-base-white → base/white
    // --color-gray-dark-100 → gray-dark/100
    // --color-brand-ci → brand/ci
    const noColor = stripped.replace(/^color-/, '');
    // 마지막 segment 만 / 로 분리
    const lastDash = noColor.lastIndexOf('-');
    return noColor.slice(0, lastDash) + '/' + noColor.slice(lastDash + 1);
  }

  if (kind === 'FOUNDATION_NUMBER') {
    // --spacing-4 → spacing/4
    // --border-width-1 → border-width/1
    // --font-weight-regular → font-weight/regular
    // --line-height-130 → line-height/130
    const lastDash = stripped.lastIndexOf('-');
    return stripped.slice(0, lastDash) + '/' + stripped.slice(lastDash + 1);
  }

  if (kind === 'SEMANTIC_COLOR') {
    // 특수: action 은 4-level (color/action/primary/{state})
    const actionMatch = stripped.match(/^color-action-(primary)-(.+)$/);
    if (actionMatch) return `color/action/${actionMatch[1]}/${actionMatch[2]}`;

    // 일반: 3-level (color/{role}/{name})
    return cssToFigmaSemantic(stripped, {
      'color-bg-':      'color/bg/',
      'color-surface-': 'color/surface/',
      'color-text-':    'color/text/',
      'color-border-':  'color/border/',
      'color-icon-':    'color/icon/',
      'color-status-':  'color/status/',
      'color-overlay':  'color/overlay',
    });
  }

  if (kind === 'SEMANTIC_NUMBER') {
    // --spacing-padding-block-md → spacing/padding-block/md
    // --sizing-form-control-height-md → sizing/form-control-height/md
    // --radius-control-sm → radius/control/sm
    return cssToFigmaSemantic(stripped, {
      'spacing-padding-block-':    'spacing/padding-block/',
      'spacing-padding-inline-':   'spacing/padding-inline/',
      'spacing-section-':          'spacing/section/',
      'spacing-stack-':            'spacing/stack/',
      'spacing-cluster-':          'spacing/cluster/',
      'spacing-label-gap-inline-': 'spacing/label-gap-inline/',
      'spacing-label-gap-block-':  'spacing/label-gap-block/',
      'sizing-form-control-height-':         'sizing/form-control-height/',
      'sizing-form-control-dataview-height-':'sizing/form-control-dataview-height/',
      'sizing-button-height-':     'sizing/button-height/',
      'sizing-button-min-width':   'sizing/button-min-width',
      'sizing-chip-height-':       'sizing/chip-height/',
      'sizing-table-row-height-':  'sizing/table-row-height/',
      'sizing-dropdown-item-height-': 'sizing/dropdown-item-height/',
      'sizing-icon-':              'sizing/icon/',
      'radius-control-':           'radius/control/',
      'radius-button-':            'radius/button/',
      'radius-card-':              'radius/card/',
      'radius-modal-':             'radius/modal/',
    });
  }

  return null;
}

function cssToFigmaSemantic(stripped, map) {
  // 가장 긴 prefix 우선 매칭
  const prefixes = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const p of prefixes) {
    if (stripped === p) return map[p];
    if (stripped.startsWith(p)) {
      return map[p] + stripped.slice(p.length);
    }
  }
  return null;
}

// ── 검사 실행 ────────────────────────────────────────────────────────────────

function audit() {
  const cssNames = loadCssVarNames(TOKENS_CSS);
  const figmaSets = loadFigmaPaths(VARS_DATA);

  const STRICT_KINDS = ['FOUNDATION_COLOR', 'FOUNDATION_NUMBER', 'SEMANTIC_COLOR', 'SEMANTIC_NUMBER'];
  const missing = Object.fromEntries(STRICT_KINDS.map((k) => [k, []]));
  const stats   = Object.fromEntries(STRICT_KINDS.map((k) => [k, { expected: 0, present: 0 }]));
  const outOfScopeSemanticColor = []; // 신규 역할 — installer 미반영 (정책 결정 필요)
  const unresolved = [];               // 매핑 함수가 null 반환

  for (const cssName of cssNames) {
    const kind = categorize(cssName);
    if (!kind) continue;

    if (kind === 'SEMANTIC_COLOR_OUT_OF_SCOPE') {
      outOfScopeSemanticColor.push(cssName);
      continue;
    }

    const figmaPath = expectedFigmaPath(cssName, kind);
    if (!figmaPath) {
      unresolved.push({ cssName, kind });
      continue;
    }

    stats[kind].expected++;
    if (figmaSets[kind].has(figmaPath)) {
      stats[kind].present++;
    } else {
      missing[kind].push({ cssName, figmaPath });
    }
  }

  return { missing, outOfScopeSemanticColor, unresolved, stats, figmaSets };
}

// ── 메인 ──────────────────────────────────────────────────────────────────────

function main() {
  const { missing, outOfScopeSemanticColor, unresolved, stats } = audit();

  let errors = 0;
  let warnings = 0;

  const sectionTitle = (s) => ({
    FOUNDATION_COLOR:  'Foundation Color (Light palette)',
    FOUNDATION_NUMBER: 'Foundation Number (spacing/radius/border-width/font-*/line-height)',
    SEMANTIC_COLOR:    'Semantic Color (bg/surface/text/border/icon/action/status/overlay)',
    SEMANTIC_NUMBER:   'Semantic Number (padding/section/stack/sizing/radius)',
  }[s]);

  console.log('\n── Installer Coverage Check ─────────────────────────');

  // 1) Strict 카테고리 — 갭 발견 시 ERROR
  for (const kind of Object.keys(missing)) {
    const s = stats[kind];
    const m = missing[kind];
    console.log(`\n[${sectionTitle(kind)}]`);
    if (m.length === 0) {
      console.log(`  ✅ ${s.present} / ${s.expected} covered`);
    } else {
      console.log(`  ❌ ${s.present} / ${s.expected} covered — ${m.length} missing:`);
      for (const item of m) {
        console.log(`     · ${item.cssName}  →  expected Figma path: ${item.figmaPath}`);
      }
      errors += m.length;
    }
  }

  // 2) Out-of-scope semantic colors — WARN (정책 결정 필요)
  if (outOfScopeSemanticColor.length > 0) {
    console.log(`\n[Semantic Color (installer 미반영 역할)]`);
    console.log(`  ⚠️  ${outOfScopeSemanticColor.length}개 CSS var — installer SEMANTIC_COLOR 확장 검토 필요`);
    // 역할별 그룹화해서 표시
    const byRole = {};
    for (const n of outOfScopeSemanticColor) {
      const m = n.match(/^--color-([a-z]+(?:-[a-z]+)*?)-/);
      const role = m ? m[1] : 'unknown';
      (byRole[role] = byRole[role] || []).push(n);
    }
    for (const role of Object.keys(byRole).sort()) {
      console.log(`     · ${role}: ${byRole[role].length}개 (예: ${byRole[role][0]})`);
    }
    warnings += outOfScopeSemanticColor.length;
  }

  if (unresolved.length > 0) {
    console.log('\n[Unresolved (스크립트 매핑 누락)]');
    for (const u of unresolved) {
      console.log(`  ⚠️  ${u.cssName}  (kind=${u.kind})`);
    }
    warnings += unresolved.length;
  }

  console.log('\n─────────────────────────────────────────────────────');
  if (errors > 0) {
    console.error(`Coverage FAILED — ${errors} error(s), ${warnings} warning(s)\n`);
    process.exit(1);
  } else if (warnings > 0) {
    console.warn(`Coverage WARN — ${warnings} warning(s) (정책 결정 필요)\n`);
    process.exit(0);
  } else {
    console.log('Coverage PASS — installer 가 tokens.css 를 완전히 커버합니다\n');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { audit, categorize, expectedFigmaPath };
