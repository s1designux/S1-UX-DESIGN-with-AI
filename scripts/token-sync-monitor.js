#!/usr/bin/env node
/**
 * Token Sync Monitor  (Gate 7 — 강력 모니터링)
 *
 * 토큰 "값"이 **모든 표면**에서 정본과 일치하는지 한 번에 판정한다.
 * 컴포넌트 정리를 계속하면 tokens.css·Variables·화면 토큰표가 어긋날 수 있는데,
 * 이 모니터가 그 드리프트를 표면별로 잡아 보고한다.
 *
 * ── 정본(Canonical) ──────────────────────────────
 *   plugins/figma-vars-installer/src/vars-data.ts
 *     · FOUNDATION_COLOR  (팔레트 HEX)
 *     · SEMANTIC_COLOR    (역할 → 팔레트 ref, Light/Dark)
 *   → tokens:gen 이 tokens.css Semantic 을 여기서 생성. 즉 Variables 가 source of truth.
 *
 * ── 비교 방식 ────────────────────────────────────
 *   모든 표면 값을 **resolved HEX(Light/Dark)** 로 정규화해 정본과 대조.
 *   각 표면은 자기가 렌더하는 토큰 ∩ 정본 만 비교(이름 차이로 인한 false positive 0).
 *
 * ── 심각도 ───────────────────────────────────────
 *   Tier 1 (ERROR): 기능/주요 화면 — tokens.css · install-prompt · semantic.html
 *                   · registry semantic.colors.json · registry foundation.colors.json
 *   Tier 2 (WARN):  문서 — tokens/semantic.md · tokens/foundation.md
 *   (foundation.html·component-tokens-extracted.md 는 확장 슬롯으로 남김 — 아래 SURFACES 주석)
 *
 * 사용:
 *   node scripts/token-sync-monitor.js            # 전체 표면 리포트
 *   node scripts/token-sync-monitor.js --json     # 기계 판독용 JSON
 *   require('./token-sync-monitor').monitor()      # gate-check.js 에서 호출
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const P = {
  varsData:       path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts'),
  tokensCss:      path.join(ROOT, 'assets/css/tokens.css'),
  swV24:          path.join(ROOT, 'registry/tokens/sw-v2.4.tokens.css'),
  installPrompt:  path.join(ROOT, 'pages/install-prompt.html'),
  semanticHtml:   path.join(ROOT, 'pages/semantic.html'),
  semanticJson:   path.join(ROOT, 'registry/tokens/semantic.colors.json'),
  foundationJson: path.join(ROOT, 'registry/tokens/foundation.colors.json'),
  semanticMd:     path.join(ROOT, 'tokens/semantic.md'),
  foundationMd:   path.join(ROOT, 'tokens/foundation.md'),
};

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const up = (s) => (s && HEX_RE.test(s) ? s.toUpperCase() : s);

// ── 공통: 정규화 ────────────────────────────────
const figmaPathToCssVar = (p) => '--' + (p.startsWith('color/') ? p : 'color/' + p).replace(/\//g, '-');
const foundationPathToCssVar = (p) => '--color-' + p.replace(/\//g, '-'); // "gray/100" → --color-gray-100

// ── 1. 정본 빌드 (vars-data) ─────────────────────
function buildCanonical() {
  const text = fs.readFileSync(P.varsData, 'utf8');

  // FOUNDATION_COLOR: "gray/100": "#E9E9E9"
  const foundationByPath = {};
  const fStart = text.indexOf('FOUNDATION_COLOR');
  const fBlock = text.slice(fStart, text.indexOf('};', fStart));
  for (const m of fBlock.matchAll(/"([^"]+)"\s*:\s*"(#[0-9a-fA-F]{3,8})"/g)) {
    foundationByPath[m[1]] = m[2].toUpperCase();
  }

  // SEMANTIC_COLOR: "color/x/y": { light: "gray/100", dark: "a/b" }
  const sStart = text.indexOf('SEMANTIC_COLOR:');
  const sBlock = sStart >= 0 ? text.slice(sStart) : '';

  // canonical: cssVar → {light, dark, src} (resolved hex)
  const canonical = {};
  // semanticColorSet: SEMANTIC_COLOR(=Variables Semantic Color 컬렉션)의 cssVar 전체 집합.
  //   semantic.html 은 이 집합을 "빠짐없이" 미러해야 한다(완전성 검사 기준 — rgba 포함).
  const semanticColorSet = new Set();
  // [layer 1a] foundation tokens (theme-independent: light==dark) — vars-data 정본
  for (const [p, hex] of Object.entries(foundationByPath)) {
    canonical[foundationPathToCssVar(p)] = { light: hex, dark: hex, src: 'vars-data' };
  }
  // [layer 1b] legacy component semantic (color/button·control·text·icon …) — vars-data 정본
  for (const m of sBlock.matchAll(/"([^"]+)"\s*:\s*\{\s*light:\s*"([^"]+)"\s*,\s*dark:\s*"([^"]+)"\s*\}/g)) {
    semanticColorSet.add(figmaPathToCssVar(m[1]));        // 값 해석 여부와 무관하게 집합엔 등록(rgba overlay 포함)
    const lh = foundationByPath[m[2]];
    const dh = foundationByPath[m[3]];
    if (lh && dh) canonical[figmaPathToCssVar(m[1])] = { light: lh, dark: dh, src: 'vars-data' };
  }

  // [site-base 제외 — 2026-06-16 사용자 결정]
  //   site-base.css 의 역할 토큰(--color-bg/surface/text/border/action/status …)은
  //   "사이트 전용" 표면이며 Variables 정본이 아니다. Variables 검수에서 site-base 내용이
  //   검출돼 컴포넌트 검수와 섞이는 혼란을 막기 위해 정본 source 에서 제외한다.
  //   → 이제 Variables 정본 = vars-data 단일(Foundation + SEMANTIC_COLOR).
  //   (site-base 는 style.css @import 로 사이트에 그대로 적용됨. 문서 참조 유효성은 Gate 10 이 별도 처리.)
  return { canonical, foundationByPath, semanticColorSet };
}

// semantic.html 이 실제로 "표기"하는 토큰 이름 집합(값 형식 무관).
//   완전성 검사 기준: SEMANTIC_PAGE 의 v: '--color-…' 전부.
function semanticHtmlTokenNames() {
  const text = fs.readFileSync(P.semanticHtml, 'utf8');
  const names = new Set();
  for (const m of text.matchAll(/\bv:\s*'(--color-[\w-]+)'/g)) names.add(m[1]);
  return names;
}

// ── 2. tokens.css 파서 + resolver ────────────────
function parseCssText(text) {
  const light = {}, dark = {};
  let mode = null;
  for (let line of text.split('\n')) {
    const s = line.replace(/\/\*.*?\*\//g, '').trim();
    if (/\[data-theme="dark"\]\s*\{/.test(s)) { mode = 'dark'; continue; }
    if (/:root\s*\{/.test(s))                 { mode = 'light'; continue; }
    if (s === '}')                            { mode = null; continue; }
    if (!mode) continue;
    const m = s.match(/^(--[\w-]+)\s*:\s*([^;]+);/);
    if (m) (mode === 'dark' ? dark : light)[m[1]] = m[2].trim();
  }
  return { light, dark };
}
function makeCssResolver({ light, dark }) {
  return function resolve(name, isDark, seen = new Set()) {
    if (seen.has(name)) return null;
    seen.add(name);
    let v = (isDark && dark[name] !== undefined) ? dark[name] : light[name];
    if (v === undefined) v = light[name];
    if (v === undefined) return null;
    v = v.trim();
    const ref = v.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    if (ref) return resolve(ref[1], isDark, seen);
    return up(v);
  };
}

// ── 3. 표면 추출기 (각자 cssVar → {light, dark} resolved hex) ──
function fromCssFile(file) {
  const { light, dark } = parseCssText(fs.readFileSync(file, 'utf8'));
  const resolve = makeCssResolver({ light, dark });
  const out = {};
  for (const name of Object.keys(light)) out[name] = { light: resolve(name, false), dark: resolve(name, true) };
  return out;
}
function fromInstallPrompt() {
  const html = fs.readFileSync(P.installPrompt, 'utf8');
  const m = html.match(/<pre[^>]*id="code-full"[^>]*>([\s\S]*?)<\/pre>/);
  if (!m) return {};
  const css = m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const { light, dark } = parseCssText(css);
  const resolve = makeCssResolver({ light, dark });
  const out = {};
  for (const name of Object.keys(light)) out[name] = { light: resolve(name, false), dark: resolve(name, true) };
  return out;
}
function fromSemanticHtml() {
  const text = fs.readFileSync(P.semanticHtml, 'utf8');
  const out = {};
  const re = /\{\s*v:\s*'(--color-[\w-]+)'[^}]*?light:\s*'(#[0-9a-fA-F]{3,8})'[^}]*?dark:\s*'(#[0-9a-fA-F]{3,8})'/g;
  for (const m of text.matchAll(re)) out[m[1]] = { light: up(m[2]), dark: up(m[3]) };
  return out;
}
function refResolver(canonical) {
  return (val, mode) => {
    if (!val) return null;
    if (HEX_RE.test(val)) return up(val);
    const m = val.match(/var\(\s*(--[\w-]+)\s*\)/);
    if (m && canonical[m[1]]) return canonical[m[1]][mode];
    return null; // 해석 불가(외부 후보값 등) → 비교 제외
  };
}
function fromSemanticJson(canonical) {
  const j = JSON.parse(fs.readFileSync(P.semanticJson, 'utf8'));
  const rr = refResolver(canonical);
  const out = {};
  for (const cat of Object.values(j.tokens || {})) {
    if (!Array.isArray(cat)) continue;
    for (const t of cat) {
      if (!t.cssVar) continue;
      out[t.cssVar] = { light: rr(t.light, 'light'), dark: rr(t.dark, 'dark') };
    }
  }
  return out;
}
function fromFoundationJson() {
  const j = JSON.parse(fs.readFileSync(P.foundationJson, 'utf8'));
  const out = {};
  const walk = (node) => {
    if (node && typeof node === 'object') {
      if (typeof node.value === 'string' && node.cssVar && HEX_RE.test(node.value)) {
        out[node.cssVar] = { light: up(node.value), dark: up(node.value) };
      }
      for (const v of Object.values(node)) walk(v);
    }
  };
  walk(j);
  return out;
}
function fromMdPalette(file) {
  // "| gray-dark/0 | #0D0E12 | ... |"  (foundation 팔레트 표)
  const text = fs.readFileSync(file, 'utf8');
  const out = {};
  for (const m of text.matchAll(/\|\s*([a-z][\w-]*\/[\w-]+)\s*\|\s*(#[0-9a-fA-F]{3,8})\s*\|/g)) {
    out[foundationPathToCssVar(m[1])] = { light: up(m[2]), dark: up(m[2]) };
  }
  return out;
}

// ── 4. 표면 레지스트리 (확장 지점) ────────────────
//   새 표면을 추가하려면 여기 한 줄. extractor 는 cssVar→{light,dark} resolved hex 반환.
//   확장 후보(미구현): foundation.html(스와치 hex↔라벨 페어링 필요),
//                      component-tokens-extracted.md(컴포넌트 alias 표).
const SURFACES = [
  { id: 'tokens.css',              tier: 1, extract: () => fromCssFile(P.tokensCss) },
  { id: 'install-prompt.html',     tier: 1, extract: fromInstallPrompt },
  { id: 'semantic.html',           tier: 1, extract: fromSemanticHtml, complete: 'semantic' },
  { id: 'registry/semantic.colors',tier: 1, extract: (c) => fromSemanticJson(c) },
  { id: 'registry/foundation.colors', tier: 1, extract: fromFoundationJson },
  { id: 'tokens/semantic.md',      tier: 2, extract: () => fromMdPalette(P.semanticMd) },
  // 확장 슬롯(미구현): foundation.md(스텝-only 표 `| 0 | #HEX |` — 팔레트 헤더 컨텍스트 파싱 필요),
  //                   foundation.html(스와치 hex↔라벨 페어링), component-tokens-extracted.md(alias 표).
];

// ── 5. 모니터 실행 ───────────────────────────────
function monitor() {
  const { canonical, semanticColorSet } = buildCanonical();
  const results = [];
  for (const surf of SURFACES) {
    let map;
    try { map = surf.extract(canonical); }
    catch (e) { results.push({ id: surf.id, tier: surf.tier, complete: surf.complete, error: e.message, compared: 0, mismatches: [], missing: [], extra: [] }); continue; }
    const mismatches = [];
    let compared = 0;
    for (const [cssVar, can] of Object.entries(canonical)) {
      const got = map[cssVar];
      if (!got) continue;            // 이 표면이 렌더 안 함 → 비교 제외
      compared++;
      for (const mode of ['light', 'dark']) {
        if (got[mode] && can[mode] && got[mode] !== can[mode]) {
          mismatches.push({ token: cssVar, mode, canonical: can[mode], surface: got[mode] });
        }
      }
    }
    // ── 완전성 검사 (B) — 값이 아니라 "집합"이 정본과 같은지 ──────────────
    //   값 비교(위)는 교집합만 보므로 토큰 누락을 못 잡는다. 이 블록이 그 사각지대를 닫는다.
    let missing = [], extra = [];
    if (surf.complete === 'semantic') {
      const names = semanticHtmlTokenNames();
      missing = [...semanticColorSet].filter(v => !names.has(v));   // 정본엔 있는데 페이지 누락
      extra   = [...names].filter(v => !semanticColorSet.has(v));   // 페이지엔 있는데 정본에 없음(stale)
    }
    const unmonitored = !surf.error && compared === 0;   // 추출 0건 = 검증 안 됨(✅ 아님)
    results.push({ id: surf.id, tier: surf.tier, complete: surf.complete, compared, mismatches, missing, extra, unmonitored });
  }
  // ERROR = Tier1 실제 불일치 + 추출 예외 + 완전성 위반(missing/extra). unmonitored(0건)는 WARN.
  const errorCount = results.filter(r => r.tier === 1)
    .reduce((n, r) => n + r.mismatches.length + (r.error ? 1 : 0) + r.missing.length + r.extra.length, 0);
  const warnCount  = results.reduce((n, r) => n + (r.tier === 2 ? r.mismatches.length : 0) + (r.unmonitored ? 1 : 0), 0);
  return { canonicalCount: Object.keys(canonical).length, semanticColorCount: semanticColorSet.size, results, errorCount, warnCount };
}

module.exports = { monitor, buildCanonical };

// ── CLI ──────────────────────────────────────────
if (require.main === module) {
  const r = monitor();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.errorCount > 0 ? 1 : 0);
  }
  console.log(`\n🛰️  Token Sync Monitor  — 정본 ${r.canonicalCount} 토큰 (vars-data)\n`);
  for (const s of r.results) {
    const tag = s.tier === 1 ? 'ERROR' : 'WARN ';
    if (s.error) { console.error(`  ❌ [${tag}] ${s.id.padEnd(28)} 추출 실패: ${s.error}`); continue; }
    const incomplete = (s.missing && s.missing.length) || (s.extra && s.extra.length);
    if (s.unmonitored) {
      console.warn(`  ⚠️  [${tag}] ${s.id.padEnd(28)} 추출 0건 — 모니터 안 됨(셀렉터/네이밍 점검)`);
    } else if (s.mismatches.length === 0 && !incomplete) {
      console.log(`  ✅ [${tag}] ${s.id.padEnd(28)} ${s.compared}건 일치${s.complete ? ' · 집합 완전' : ''}`);
    } else {
      const parts = [];
      if (s.mismatches.length) parts.push(`${s.mismatches.length} 값불일치`);
      if (s.missing && s.missing.length) parts.push(`${s.missing.length} 누락`);
      if (s.extra && s.extra.length) parts.push(`${s.extra.length} 잉여`);
      console.error(`  ❌ [${tag}] ${s.id.padEnd(28)} ${parts.join(' · ')} / 비교 ${s.compared}건`);
      for (const m of s.mismatches.slice(0, 8)) {
        console.error(`         ${m.token} [${m.mode}]  정본=${m.canonical} ≠ 표면=${m.surface}`);
      }
      if (s.mismatches.length > 8) console.error(`         … +${s.mismatches.length - 8} more`);
      if (s.missing && s.missing.length) {
        console.error(`         누락(정본엔 있으나 페이지 없음): ${s.missing.slice(0, 8).join(', ')}${s.missing.length > 8 ? ` … +${s.missing.length - 8}` : ''}`);
        console.error(`         → npm run page:gen 으로 재생성`);
      }
      if (s.extra && s.extra.length) {
        console.error(`         잉여(페이지엔 있으나 정본 없음·stale): ${s.extra.slice(0, 8).join(', ')}${s.extra.length > 8 ? ` … +${s.extra.length - 8}` : ''}`);
      }
    }
  }
  console.log('\n─────────────────────────────────────────────────────');
  console.log(`  정본=vars-data.ts · 드리프트 해소: npm run tokens:reconcile`);
  if (r.errorCount > 0) {
    console.error(`\n🔴 Monitor FAILED — Tier1 ${r.errorCount} error, Tier2 ${r.warnCount} warn\n`);
    process.exit(1);
  }
  console.log(`\n✅ Monitor PASSED — Tier1 전부 일치${r.warnCount ? ` (Tier2 ${r.warnCount} warn)` : ''}\n`);
  process.exit(0);
}
