#!/usr/bin/env node
/**
 * component-inventory-scan.js — 컴포넌트 제공 수준 재고조사 (결정론)
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 무엇을 푸는가: "이 디자인시스템이 소비자(퍼블리셔·개발)에게 실제로 무엇을 주고 있나"를
 *   컴포넌트별로 기계가 세어 표로 만든다. 눈으로 훑으면(10,430줄) 반드시 빠뜨린다.
 *
 * ★ 제공 수준은 3층이고, 층마다 쓸모가 다르다:
 *     ① 미리보기  — 사이트에서 눈으로 봄        (디자이너용)
 *     ② 코드탭    — 복사해서 가져감            (퍼블리셔용)
 *     ③ CSS 파일  — 붙여넣은 것이 실제로 보임   (배포용)
 *   ①만 있으면 "보여주기"고, ③까지 있어야 "가져다 쓰기"다.
 *
 * ★ 함께 재는 것: 클래스 네이밍 체계의 일관성. UI 라이브러리는 부품 개수가 아니라
 *   **규칙의 일관성**으로 신뢰를 얻는다. 같은 것을 다른 방식으로 쓰면(크기를 어떤 건
 *   `s1-btn-lg`, 어떤 건 `input-size-mobile`) 소비자가 매번 문서를 다시 봐야 한다.
 *
 * 판정하지 않는다 — **사실만 센다.** 무엇이 문제인지의 판단은 사람(⭐)이 이 표 위에서 한다.
 *
 * 출력: 사람용 표 + `reports/component-inventory.json`
 * 사용: node scripts/component-inventory-scan.js [--json]  (npm run components:inventory)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'pages/components.html');
const CSS_DIR = path.join(ROOT, 'assets/css');
const OUT = path.join(ROOT, 'reports/component-inventory.json');

// ── 1. 섹션 분할 ────────────────────────────────────────────────
function sliceSections(html) {
  const re = /<section\b[^>]*\bclass="[^"]*\bcomp-section\b[^"]*"[^>]*\bid="([a-z0-9-]+)"[^>]*>/g;
  const starts = [];
  let m;
  while ((m = re.exec(html))) starts.push({ id: m[1], at: m.index });
  return starts.map((s, i) => ({
    id: s.id,
    body: html.slice(s.at, i + 1 < starts.length ? starts[i + 1].at : html.length),
  }));
}

// ── 2. 코드탭 (복사용) ──────────────────────────────────────────
// <button class="code-tab ..." onclick="switchTab(this,'chk-html')">HTML</button>
function codeTabs(body) {
  const re = /switchTab\(this,\s*'([^']+)'\)"[^>]*>([^<]+)</g;
  const tabs = [];
  let m;
  while ((m = re.exec(body))) tabs.push({ pane: m[1], label: m[2].trim() });
  return tabs;
}

// ── 3. 미리보기 DOM 과 코드 블록 분리 ───────────────────────────
// <pre> 안은 '복사용 텍스트', 밖은 '실제 렌더되는 미리보기 DOM'
function splitPreviewAndCode(body) {
  const code = [];
  const preview = body.replace(/<pre\b[\s\S]*?<\/pre>/g, (blk) => { code.push(blk); return ''; });
  return { preview, code: code.join('\n') };
}

// ── 4. 컴포넌트 클래스 수집 ─────────────────────────────────────
// 규칙: class 속성 안에 s1-* 가 하나라도 있으면 그 속성의 **모든 토큰**을 컴포넌트 관련으로 본다.
//       (site chrome 인 comp-section·variant-label·matrix-* 를 자연스럽게 배제하면서
//        s1-btn 옆에 붙는 is-error·input-size-mobile 같은 modifier 는 놓치지 않는다.)
function componentClasses(fragment) {
  const out = new Set();
  const re = /class="([^"]+)"/g;
  let m;
  while ((m = re.exec(fragment))) {
    const tokens = m[1].split(/\s+/).filter(Boolean);
    if (!tokens.some((t) => t.startsWith('s1-'))) continue;
    tokens.forEach((t) => out.add(t));
  }
  return out;
}

// ── 5. 접근성 속성 ──────────────────────────────────────────────
function a11y(fragment) {
  const count = (re) => (fragment.match(re) || []).length;
  return {
    ariaLabel: count(/\baria-label=/g),
    ariaOther: count(/\baria-(?!label=)[a-z-]+=/g),
    role: count(/\brole=/g),
    labelFor: count(/<label[^>]*\bfor=/g),
  };
}

// ── 6. 네이밍 체계 분류 ─────────────────────────────────────────
// 어떤 방식이 몇 개 쓰이는지만 센다. 어느 것이 옳은지는 판정하지 않는다.
function classifyNaming(all) {
  const buckets = {
    's1- 접두사': [],
    'is- 상태': [],
    'has- 상태': [],
    'BEM -- 수식어': [],
    '접두사 없음': [],
  };
  for (const c of all) {
    if (c.includes('--')) buckets['BEM -- 수식어'].push(c);
    else if (c.startsWith('is-')) buckets['is- 상태'].push(c);
    else if (c.startsWith('has-')) buckets['has- 상태'].push(c);
    else if (c.startsWith('s1-')) buckets['s1- 접두사'].push(c);
    else buckets['접두사 없음'].push(c);
  }
  for (const k of Object.keys(buckets)) buckets[k].sort();
  return buckets;
}

// 크기 표기 방식이 컴포넌트마다 다른지 — 같은 개념(크기)에 몇 가지 어법이 쓰이나
function sizeIdioms(all) {
  const idioms = {};
  const add = (k, c) => { (idioms[k] = idioms[k] || []).push(c); };
  for (const c of all) {
    if (/^s1-[a-z-]+-(xxsm|xsm|sm|md|lg|xl)$/.test(c)) add('s1-<컴포넌트>-<크기>', c);
    else if (/-size-(mobile|pc|[a-z]+)$/.test(c)) add('<컴포넌트>-size-<값>', c);
    else if (/--(mobile|pc|desktop)$/.test(c)) add('<컴포넌트>--<플랫폼>', c);
    else if (/^s1-[a-z-]*(mobile|mo)$/.test(c)) add('s1-…mobile', c);
  }
  for (const k of Object.keys(idioms)) idioms[k] = [...new Set(idioms[k])].sort();
  return idioms;
}

// ── 7. CSS 파일 배선 ────────────────────────────────────────────
function cssWiring(html) {
  const linked = [...html.matchAll(/<link[^>]+href="([^"]*\.css)"/g)].map((m) => m[1]);
  const inlineRules = (html.match(/^\s*\.s1-[a-zA-Z0-9_-]+/gm) || []).length;

  const files = [];
  const walk = (dir, rel = '') => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p, path.join(rel, f));
      else if (f.endsWith('.css')) {
        const txt = fs.readFileSync(p, 'utf8');
        files.push({
          file: path.join('assets/css', rel, f),
          kb: +(fs.statSync(p).size / 1024).toFixed(1),
          s1Rules: (txt.match(/^\s*\.s1-[a-zA-Z0-9_-]+/gm) || []).length,
        });
      }
    }
  };
  walk(CSS_DIR);

  // 로드 여부: 페이지의 <link> 또는 style.css 의 @import 사슬에 들어 있나
  const styleCss = path.join(CSS_DIR, 'style.css');
  const imports = fs.existsSync(styleCss)
    ? [...fs.readFileSync(styleCss, 'utf8').matchAll(/@import\s+url\(['"]?([^'")]+)/g)].map((m) => m[1])
    : [];
  for (const f of files) {
    const base = path.basename(f.file);
    f.loaded = linked.some((l) => l.includes(base)) || imports.some((i) => i.includes(base));
  }
  return { linked, inlineRules, files };
}

// ── main ────────────────────────────────────────────────────────
function main() {
  const html = fs.readFileSync(HTML, 'utf8');
  const sections = sliceSections(html);
  const allClasses = new Set();

  const rows = sections.map((s) => {
    const { preview, code } = splitPreviewAndCode(s.body);
    const tabs = codeTabs(s.body);
    const labels = tabs.map((t) => t.label);
    const cls = componentClasses(preview);
    cls.forEach((c) => allClasses.add(c));
    return {
      id: s.id,
      previewNodes: (preview.match(/class="[^"]*\bs1-/g) || []).length,
      tabs: labels,
      hasHtmlTab: labels.some((l) => /HTML/i.test(l)),
      hasCssTab: labels.some((l) => /CSS/i.test(l)),
      hasTokenTab: labels.some((l) => /Token/i.test(l)),
      hasJsTab: labels.some((l) => /Java|JS/i.test(l)),
      pc: /platform-section-pc/.test(s.body),
      mobile: /platform-section-mobile/.test(s.body),
      classes: [...cls].sort(),
      a11y: a11y(preview),
      codeChars: code.length,
    };
  });

  const naming = classifyNaming(allClasses);
  const idioms = sizeIdioms(allClasses);
  const css = cssWiring(html);

  const result = { scannedAt: new Date().toISOString(), sourceFile: 'pages/components.html',
                   sectionCount: rows.length, rows, naming, sizeIdioms: idioms, css };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n', 'utf8');

  if (process.argv.includes('--json')) { console.log(JSON.stringify(result, null, 2)); return; }

  // ── 사람용 출력 ──
  console.log('🔎 컴포넌트 제공 수준 재고조사 (Component Inventory)');
  console.log(`  대상 pages/components.html · 섹션 ${rows.length}개\n`);

  const mark = (b) => (b ? '✅' : '· ');
  console.log('  컴포넌트                미리보기  HTML탭  CSS탭  토큰  JS   PC  모바일');
  console.log('  ' + '─'.repeat(70));
  for (const r of rows.sort((a, b) => a.id.localeCompare(b.id))) {
    console.log(`  ${r.id.padEnd(22)} ${String(r.previewNodes).padStart(5)}   ${mark(r.hasHtmlTab)}    ${mark(r.hasCssTab)}   ${mark(r.hasTokenTab)}  ${mark(r.hasJsTab)}  ${mark(r.pc)} ${mark(r.mobile)}`);
  }

  const n = (f) => rows.filter(f).length;
  console.log('\n  ── 합계 ' + '─'.repeat(50));
  console.log(`  미리보기 있음 ${n((r) => r.previewNodes > 0)}/${rows.length} · HTML탭 ${n((r) => r.hasHtmlTab)}/${rows.length} · CSS탭 ${n((r) => r.hasCssTab)}/${rows.length} · 토큰 ${n((r) => r.hasTokenTab)}/${rows.length} · JS ${n((r) => r.hasJsTab)}/${rows.length}`);
  console.log(`  ❗ 미리보기는 있는데 복사용 HTML 탭이 없는 것: ${n((r) => r.previewNodes > 0 && !r.hasHtmlTab)}개`);
  console.log(`  ❗ 미리보기도 없는 것(토큰 표만): ${n((r) => r.previewNodes === 0)}개`);

  console.log('\n  ── 클래스 네이밍 체계 ' + '─'.repeat(36));
  for (const [k, v] of Object.entries(naming)) {
    if (!v.length) continue;
    console.log(`  ${k.padEnd(16)} ${String(v.length).padStart(3)}개  예: ${v.slice(0, 4).join(', ')}${v.length > 4 ? ' …' : ''}`);
  }

  console.log('\n  ── 「크기·플랫폼」을 적는 어법 (같은 개념에 몇 가지 방식이 쓰이나) ' + '─'.repeat(2));
  const idiomKeys = Object.keys(idioms);
  if (!idiomKeys.length) console.log('    (해당 없음)');
  for (const k of idiomKeys) console.log(`  ${k.padEnd(26)} ${String(idioms[k].length).padStart(3)}개  예: ${idioms[k].slice(0, 3).join(', ')}`);
  if (idiomKeys.length > 1) console.log(`  → 같은 개념에 어법 ${idiomKeys.length}가지가 섞여 있다.`);

  console.log('\n  ── CSS 배선 ' + '─'.repeat(45));
  console.log(`  페이지가 <link> 하는 CSS: ${css.linked.join(', ') || '(없음)'}`);
  console.log(`  components.html 인라인 <style> 의 .s1-* 규칙: ${css.inlineRules}줄`);
  for (const f of css.css ? [] : css.files) {
    if (f.s1Rules === 0) continue;
    console.log(`  ${f.loaded ? '✅ 로드됨' : '❌ 로드안됨'}  ${f.file.padEnd(34)} ${String(f.kb).padStart(5)}KB · .s1-* 규칙 ${f.s1Rules}개`);
  }

  console.log(`\n  전체 결과: ${path.relative(ROOT, OUT)}`);
  console.log(`INVENTORY_SUMMARY sections=${rows.length} preview=${n((r) => r.previewNodes > 0)} htmlTab=${n((r) => r.hasHtmlTab)} cssTab=${n((r) => r.hasCssTab)} inlineS1Rules=${css.inlineRules}`);
}

main();
