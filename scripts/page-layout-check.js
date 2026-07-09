#!/usr/bin/env node
/**
 * 🔎 페이지 레이아웃 검수기 (Page Layout Policy) — Gate 22
 *
 * 문제(2026-07-03): 게이트가 토큰·구조만 보고 "페이지가 공통 레이아웃 틀을 지키는지"는
 *   아무도 검사하지 않아 — ①페이지 헤더가 사이드바(LNB)/컨텐츠에 안 붙거나(폭 어긋남)
 *   ②전폭/읽기폭 정책이 페이지마다 제각각으로 드리프트 — 를 ⭐ 가 매번 눈으로 찾다 놓쳤다.
 *   self-certify 사각지대. 눈 대신 기계가 정본(page-layout-policy.json)과 대조하게 한다.
 *
 * 정본: registry/governance/page-layout-policy.json (페이지별 width: wide|readable, shell: custom, retired)
 *
 * 검사(결정론):
 *   ❌ 차단 = (a)미분류 페이지(정본에 없는 새 pages/*.html) (b)공통 틀 이탈(헤더가 main 밖/앞 = LNB 미부착)
 *            (c)wide 인데 폭 제한 상속(전폭 미적용) (d)wide 인데 헤더만 안 넓힘(헤더↔컨텐츠 폭 불일치)
 *            (e)readable 인데 임의 전폭 (f)retired 페이지가 nav/검색에 활성 등록(부활)
 *   ⚠️ 경고 = 정본에 있으나 파일 없음(stale config)
 *
 * 자동 수정: node scripts/page-layout-check.js --fix
 *   폭 위반(c/d/e)을 정본에 맞춰 관리 블록 삽입/제거로 교정. 틀 이탈(b)·미분류(a)·부활(f)은 수동(구조/의도 판단 필요).
 */
const fs = require('fs');
const path = require('path');
const { isLegacyFile } = require('./lib/legacy-skip');

const ROOT = path.resolve(__dirname, '..');
const FIX = process.argv.includes('--fix');

const errors = [];
const warnings = [];
const fixed = [];
const infos = [];

const POLICY = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'registry/governance/page-layout-policy.json'), 'utf8')
);
const pagesDir = path.join(ROOT, 'pages');
const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.html')).sort();

// nav/검색 정본(main.js) — retired 부활 검사용
let mainJs = '';
try { mainJs = fs.readFileSync(path.join(ROOT, 'assets/js/main.js'), 'utf8'); } catch { /* noop */ }

// ── helpers ───────────────────────────────────────────────────────
// @media {...} 블록을 중괄호 매칭으로 제거(반응형 재정의를 기본 의도로 오인하지 않게)
function stripAtMedia(css) {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf('@media', i);
    if (at < 0) { out += css.slice(i); break; }
    out += css.slice(i, at);
    const b = css.indexOf('{', at);
    if (b < 0) break;
    let depth = 1;
    let j = b + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    i = j;
  }
  return out;
}

// 인라인 <style> 전체 추출
function inlineStyles(html) {
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html))) blocks.push(m[1]);
  return blocks.join('\n');
}

// 기본(비-@media) 레벨에서 특정 셀렉터의 max-width 값 (마지막 선언이 우선). 없으면 null
function selMaxWidth(css, sel) {
  const re = new RegExp('\\.' + sel + '\\s*\\{([^}]*)\\}', 'g');
  let m;
  let val = null;
  while ((m = re.exec(css))) {
    const mw = m[1].match(/max-width\s*:\s*([^;]+)/i);
    if (mw) val = mw[1].trim().toLowerCase();
  }
  return val;
}

function idxOf(html, re) {
  const m = html.match(re);
  return m ? m.index : -1;
}

// retired 페이지가 nav/검색에 활성 등록됐는지 (main.js SITE_NAV/SEARCH_INDEX)
function referencedAsActive(name) {
  if (!mainJs) return false;
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp("(page|href|rootHref)\\s*:\\s*['\"](?:[^'\"]*/)?" + esc + "['\"]");
  return re.test(mainJs);
}

const MANAGED_MARK = '[layout-gate]';
const MANAGED_BLOCK =
  '    /* ' + MANAGED_MARK + ' 전폭 — 화면 폭에 맞춰 컨텐츠 확장 (자동관리: npm run layout:check -- --fix) */\n' +
  '    .page-content { max-width: none; }\n' +
  '    .page-header-inner { max-width: none; }\n';

// wide 로 만들기: 첫 <style> 뒤에 관리 블록 삽입(이미 있으면 skip)
function applyWide(html) {
  if (html.includes(MANAGED_MARK)) return html;
  return html.replace(/(<style[^>]*>\s*\n?)/i, (full) => full + MANAGED_BLOCK);
}
// readable 로 만들기: 전폭 처리 라인/관리 블록 제거
function applyReadable(html) {
  return html
    .replace(new RegExp('^\\s*/\\*\\s*' + '\\[layout-gate\\]' + '[^\\n]*\\*/\\s*\\n', 'gm'), '')
    .replace(/^[ \t]*\.page-content\s*\{\s*max-width\s*:\s*none\s*;\s*\}\s*\n/gm, '')
    .replace(/^[ \t]*\.page-header-inner\s*\{\s*max-width\s*:\s*none\s*;\s*\}\s*\n/gm, '')
    // 사람이 넣은 주석(어제 편집) 정리
    .replace(/^[ \t]*\/\*\s*전폭 사용[^\n]*\*\/\s*\n/gm, '');
}

// ── per-page ──────────────────────────────────────────────────────
const policyPages = POLICY.pages || {};
const seen = new Set();

for (const name of files) {
  const rel = 'pages/' + name;
  const fpath = path.join(pagesDir, name);
  let html = fs.readFileSync(fpath, 'utf8');
  const cfg = policyPages[name];
  seen.add(name);

  const retired = (cfg && cfg.retired) || isLegacyFile(rel);

  if (retired) {
    // 부활 방지: nav/검색에 활성 등록되면 차단
    if (referencedAsActive(name)) {
      errors.push(`${rel}: retired(폐기) 페이지인데 nav/검색(main.js)에 활성 등록됨 — 제거 필요(부활 방지).`);
    } else {
      infos.push(`${name}: retired — 격리 확인(nav/검색 미등록)`);
    }
    continue;
  }

  if (!cfg) {
    errors.push(`${rel}: 미분류 — page-layout-policy.json 에 width(wide|readable) 또는 shell:custom/retired 로 등록 필요.`);
    continue;
  }

  // standalone: 자체완결 단독 페이지 — 틀·폭 검사 제외. 단, 우회 방지 가드로 실제 .sidebar 가 있으면 오분류 차단.
  if (cfg.shell === 'standalone') {
    if (idxOf(html, /class="sidebar[ "]/) >= 0) {
      errors.push(`${rel}: standalone 로 등록됐으나 .sidebar 존재 — 공통 틀 페이지면 wide/readable 로 재분류(우회 방지).`);
    } else {
      infos.push(`${name}: shell=standalone — 자체완결 페이지, 틀·폭 검사 제외 ✅`);
    }
    continue;
  }

  const custom = cfg.shell === 'custom';

  // (b) 공통 틀 — 헤더가 LNB 에 붙는가
  const iWrap = idxOf(html, /class="(?:app|layout)[ "]/);
  const iSide = idxOf(html, /class="sidebar[ "]/);
  const iMain = idxOf(html, /class="main-content[ "]/);
  const iHeader = idxOf(html, /class="page-header[ "]/);
  const iContent = idxOf(html, /class="page-content[ "]/);

  const shellProblems = [];
  if (iWrap < 0) shellProblems.push('(app|layout) 래퍼 없음');
  if (iSide < 0) shellProblems.push('.sidebar 없음');
  if (iMain < 0) shellProblems.push('.main-content 없음');
  if (iSide >= 0 && iMain >= 0 && iSide > iMain) shellProblems.push('.sidebar 가 .main-content 뒤 — 순서 이상');
  if (iHeader < 0) shellProblems.push('.page-header 없음');
  if (iMain >= 0 && iHeader >= 0 && iHeader < iMain) shellProblems.push('.page-header 가 .main-content 밖/앞 — LNB 에 안 붙음');
  if (!custom) {
    if (iContent < 0) shellProblems.push('.page-content 없음');
    else if (iHeader >= 0 && iContent < iHeader) shellProblems.push('.page-content 가 .page-header 앞 — 순서 이상');
  }
  if (shellProblems.length) {
    errors.push(`${rel}: 공통 틀 이탈 — ${shellProblems.join(', ')}.`);
    // 틀 문제는 자동수정 안 함(구조 판단 필요) — 폭 검사도 신뢰 어려워 skip
    continue;
  }

  if (custom) { infos.push(`${name}: shell=custom — 틀만 검사(폭 제외) ✅`); continue; }

  // (c)(d)(e) 폭 정책
  const css = stripAtMedia(inlineStyles(html));
  const pcMax = selMaxWidth(css, 'page-content');
  const phMax = selMaxWidth(css, 'page-header-inner');
  const contentWide = pcMax === 'none';
  const headerWide = phMax === 'none';
  const width = cfg.width;

  const wviol = [];
  if (width === 'wide') {
    if (!contentWide) wviol.push('wide 인데 .page-content 폭 제한 상속(전폭 미적용)');
    else if (!headerWide) wviol.push('wide 인데 .page-header-inner 를 안 넓힘(헤더↔컨텐츠 폭 불일치 · 헤더가 LNB 에 덜 붙음)');
  } else if (width === 'readable') {
    if (contentWide) wviol.push('readable 인데 .page-content 를 전폭(max-width:none) 처리 — 가독성 정책 위반');
  } else {
    warnings.push(`${rel}: width 값이 wide/readable 아님("${width}") — 정본 확인.`);
    continue;
  }

  if (!wviol.length) { infos.push(`${name}: ${width} ✅`); continue; }

  if (FIX) {
    const before = html;
    html = width === 'wide' ? applyWide(html) : applyReadable(html);
    if (html !== before) {
      fs.writeFileSync(fpath, html);
      fixed.push(`${rel}: ${wviol.join(' / ')} → 자동 교정(${width})`);
    } else {
      errors.push(`${rel}: ${wviol.join(' / ')} (자동 교정 불가 — 수동 확인)`);
    }
  } else {
    for (const v of wviol) errors.push(`${rel}: ${v}`);
  }
}

// 정본에 있으나 파일 없는 항목(stale config)
for (const name of Object.keys(policyPages)) {
  if (!seen.has(name)) warnings.push(`policy 에 ${name} 등록됐으나 pages/${name} 파일 없음(stale config).`);
}

// ── report ────────────────────────────────────────────────────────
console.log('🔎 페이지 레이아웃 검수기 (Page Layout Policy) — Gate 22');
console.log(`  대상 ${files.length}개 페이지 · 정본 registry/governance/page-layout-policy.json`);
if (process.env.LAYOUT_VERBOSE) infos.forEach((i) => console.log('  · ' + i));
fixed.forEach((f) => console.log('  🔧 ' + f));
warnings.forEach((w) => console.log('  ⚠️  ' + w));
errors.forEach((e) => console.log('  ❌ ' + e));

if (errors.length) {
  console.log(`\n  → ${errors.length}건 위반. 폭 위반은 \`npm run layout:check -- --fix\` 로 자동 교정, 틀/미분류/부활은 수동.`);
  process.exit(1);
}
console.log(`  ✅ 레이아웃 정책 위반 0${fixed.length ? ` (자동 교정 ${fixed.length}건)` : ''}${warnings.length ? ` · 경고 ${warnings.length}건` : ''}`);
process.exit(0);
