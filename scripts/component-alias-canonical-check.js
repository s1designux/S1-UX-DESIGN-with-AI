#!/usr/bin/env node
/**
 * Component Alias Canonical Check  (Gate 25)
 *
 * 활성 표면(pages/*.html — legacyFiles 제외)에 "정의"된 컴포넌트-별칭 토큰
 *     --{comp}-…: … var(--X) …
 * 의 타깃 --X 가 정본 토큰으로 실제 "해석"되는지 기계 판정한다.
 *
 *   (1) 타깃이 tokens.css / site-base.css / style.css / 페이지-로컬 :root 어디에도
 *       정의돼 있지 않으면 = 유령/깨진 참조 → ❌ (정본에 없는 이름·오타·삭제된 토큰 재유입)
 *   (2) 같은 별칭 이름이 2개 이상 활성 표면에서 서로 다른 최종 HEX 로 해석되면
 *       = 표면 드리프트(같은 이름 다른 값) → ❌
 *
 * 은퇴 별칭층(assets/css/component-tokens.css)은 deprecated-tokens.json legacyFiles 라 제외.
 *
 * 배경(2026-07-10): --dropdown-trigger-* 같은 은퇴 별칭이 정본(vars-data/tokens.css) 밖에
 *   살아 어느 토큰 게이트 시야에도 안 들어오던 사각지대를 커밋 시점에 막는다. 모든 토큰
 *   게이트는 vars-data/tokens.css 만 기준으로 봐서, 그 바깥의 --{comp}-* 별칭층은 이름·값이
 *   틀려도 통과해버렸다(웹 드롭다운에서 사용자가 직접 발견). 정본=build-components / tokens.css.
 *
 * 사용:
 *   node scripts/component-alias-canonical-check.js       # 단독 실행(리포트)
 *   require('./component-alias-canonical-check').check()  # gate-check.js 에서 호출
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

// 컴포넌트-별칭 토큰 prefix (component-tokens.css 13개 계열 기준)
const ALIAS_RE = /^--(?:button|chip|input|dropdown|select|table|nav|gnb|pagination|checkbox|radio|toggle|tab)[a-z0-9-]*$/;

function read(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return ''; }
}

// CSS 텍스트를 light/dark 맵으로 파싱( :root = light, [data-theme="dark"] = dark ).
function parseCssBlocks(text, light, dark) {
  let mode = null;
  for (let line of text.split('\n')) {
    const s = line.replace(/\/\*.*?\*\//g, '').trim();
    if (/\[data-theme="dark"\]\s*\{/.test(s)) { mode = 'dark'; continue; }
    if (/:root\s*\{/.test(s))                 { mode = 'light'; continue; }
    if (s === '}')                            { mode = null; continue; }
    if (!mode) continue;
    const m = s.match(/^(--[\w-]+)\s*:\s*([^;]+);/);
    if (!m) continue;
    (mode === 'dark' ? dark : light)[m[1]] = m[2].trim();
  }
}

// 정본 정의 맵(전 페이지 공통): tokens.css + site-base.css + style.css
function buildCanonical() {
  const light = {}, dark = {};
  for (const f of ['assets/css/tokens.css', 'assets/css/site-base.css', 'assets/css/style.css']) {
    parseCssBlocks(read(f), light, dark);
  }
  return { light, dark };
}

// var() 체인을 따라 최종 HEX/리터럴까지 해석. 못 풀면(정의 없음) null.
function makeResolver(light, dark) {
  return function resolve(varName, isDark, seen = new Set()) {
    if (seen.has(varName)) return null;
    seen.add(varName);
    let val = (isDark && dark[varName] !== undefined) ? dark[varName] : light[varName];
    if (val === undefined) val = light[varName];   // dark override 없으면 light
    if (val === undefined) return null;            // 어디에도 정의 없음 = 유령
    val = val.trim();
    const ref = val.match(/^var\(\s*(--[\w-]+)\s*\)/);
    if (ref) return resolve(ref[1], isDark, seen);
    if (HEX_RE.test(val)) return val.toUpperCase();
    return val;                                    // rgba/transparent 등 리터럴
  };
}

function legacyPageBasenames() {
  try {
    const dep = JSON.parse(read('registry/tokens/deprecated-tokens.json'));
    return new Set((dep.legacyFiles || [])
      .map((e) => e.path)
      .filter((p) => p.startsWith('pages/'))
      .map((p) => path.basename(p)));
  } catch { return new Set(); }
}

function check() {
  const canon = buildCanonical();
  const legacyPages = legacyPageBasenames();
  const PAGES_DIR = path.join(ROOT, 'pages');

  const ghosts = [];                 // (1) 유령/깨진 참조
  const drifts = [];                 // (2) 표면 드리프트
  const seenAlias = new Map();       // aliasName → { page, light, dark }
  let scanned = 0, aliasDefs = 0;

  const pages = fs.existsSync(PAGES_DIR)
    ? fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.html') && !legacyPages.has(f))
    : [];

  for (const page of pages) {
    scanned++;
    const txt = read(path.join('pages', page));
    // 페이지-로컬 정의를 정본과 합쳐 해석(인라인 :root 별칭 + [data-theme="dark"] override 포함).
    // 병합된 light/dark 맵이 이미 다크 override 를 반영하므로, 별칭은 "이름당 1회"만 해석한다
    // (같은 이름의 light 정의 + dark override 를 서로 다른 표면으로 오인하지 않도록).
    const light = { ...canon.light }, dark = { ...canon.dark };
    parseCssBlocks(txt, light, dark);
    const resolve = makeResolver(light, dark);

    // 이 페이지에서 정의된 별칭 이름 수집(중복 제거).
    // /* */ 블록 주석은 제거 후 수집 — 주석 처리된 옛 정의를 실제 정의로 오인(유령 오탐)하지 않도록.
    const names = new Set();
    const noComments = txt.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of noComments.matchAll(/(--[\w-]+)\s*:\s*[^;]+;/g)) {
      if (ALIAS_RE.test(m[1])) names.add(m[1]);
    }

    for (const name of names) {
      aliasDefs++;
      // 별칭 이름 자체를 해석 → var() 체인이 정본까지 도달하는지 확인.
      // 체인이 정의 없는 토큰에 닿으면 rl/rd = null = 유령/깨진 참조.
      const rl = resolve(name, false);
      const rd = resolve(name, true);
      if (rl === null && rd === null) {
        ghosts.push({ page, name });
        continue;
      }
      // 표면 드리프트: 같은 별칭 이름이 페이지 간 다른 최종값으로 해석되면 ❌
      const sig = `${rl}|${rd}`;
      const prev = seenAlias.get(name);
      if (prev && prev.sig !== sig) {
        drifts.push({ name, a: `${prev.page}=${prev.sig}`, b: `${page}=${sig}` });
      } else if (!prev) {
        seenAlias.set(name, { page, sig });
      }
    }
  }

  return { ghosts, drifts, scanned, aliasDefs, aliasNames: seenAlias.size };
}

module.exports = { check };

// ── 단독 실행(CLI) ────────────────────────────────
if (require.main === module) {
  const r = check();
  console.log('\n🔎 Component Alias Canonical Check (Gate 25)\n');
  console.log(`  활성 페이지 ${r.scanned}개 · 별칭 정의 ${r.aliasDefs}건 · 별칭 이름 ${r.aliasNames}종`);
  if (r.ghosts.length === 0 && r.drifts.length === 0) {
    console.log('  ✅ 모든 컴포넌트-별칭이 정본 토큰으로 해석됨 · 표면 드리프트 0');
    process.exit(0);
  }
  for (const g of r.ghosts) {
    console.error(`  ❌ 유령참조 ${g.page}: ${g.name} — var() 체인이 정본에 없는 토큰에 닿음`);
  }
  for (const d of r.drifts) {
    console.error(`  ❌ 표면드리프트 ${d.name}: ${d.a}  ≠  ${d.b}`);
  }
  console.log(`\nALIAS_CANONICAL_SUMMARY ghosts=${r.ghosts.length} drifts=${r.drifts.length}`);
  process.exit(1);
}
