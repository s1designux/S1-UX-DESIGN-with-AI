#!/usr/bin/env node
/**
 * gen-semantic-page.js
 *
 * Variables(vars-data.ts SEMANTIC_COLOR)를 **정본**으로 `pages/semantic.html`의
 * Color 섹션 데이터(SEMANTIC_PAGE)를 자동 생성한다. (= "Variables 1:1 미러")
 *
 *   Figma Variables (vars-data SEMANTIC_COLOR)  ──[gen]──▶  semantic.html SEMANTIC_PAGE
 *
 * 배경(2026-06-11): semantic.html은 자동 생성 파이프라인에 연결돼 있지 않아,
 *   2026-06-08 역할기반→컴포넌트폴더 전환 이후 정본과 구조가 통째로 어긋나 있었다.
 *   이 생성기가 그 라인을 잇는다(누락 없이 정본 미러).
 *
 * 동작:
 *   - SEMANTIC_COLOR 항목을 선언 순서대로 읽어 컴포넌트 폴더(2번째 경로 세그먼트)별 그룹화.
 *   - hex 해석은 tokens.css의 var() 체인 resolver를 재사용(=가이드/설치기와 동일 값 보장).
 *     ∴ 실행 전 `npm run tokens:gen`으로 tokens.css가 최신이어야 한다(reconcile가 순서 보장).
 *   - 역할(role)은 경로에서 결정론적으로 파생(추측 금지): "{property} / {variant--state}".
 *   - 그룹 설명(desc)은 카테고리 명칭(값 아님)만 GROUP_DESC로 부여.
 *
 * 사용:
 *   node scripts/gen-semantic-page.js --preview   # 생성 결과 stdout (파일 미변경)
 *   node scripts/gen-semantic-page.js             # semantic.html GEN 마커 사이 교체(적용)
 *
 * semantic.html 마커:
 *   /​* >>> GEN:SEMANTIC-PAGE >>> *​/  …생성 const SEMANTIC_PAGE…  /​* <<< GEN:SEMANTIC-PAGE <<< *​/
 */
const fs = require('fs');
const path = require('path');
const {
  parseTokensCss, makeResolver, parseVarsData, SEMANTIC_HTML,
} = require('./token-value-consistency-check');

const PREVIEW = process.argv.includes('--preview');
const START = '/* >>> GEN:SEMANTIC-PAGE >>>';
const END   = '/* <<< GEN:SEMANTIC-PAGE <<< */';

// 컴포넌트 폴더(그룹) 설명 — 값이 아니라 카테고리 명칭이므로 안전.
const GROUP_DESC = {
  button:        '버튼 — variant × state 별 배경·테두리·라벨',
  chip:          '칩 — line/solid × state',
  control:       '체크박스·라디오·토글 컨트롤',
  data:          '데이터 그리드/테이블 상태',
  'date-picker': '데이트피커 패널·셀',
  dropdown:      '드롭다운 리스트·옵션',
  'form-control':'인풋·셀렉트 공유 폼 컨트롤 (bg·border·text·label·icon)',
  icon:          '아이콘 색상',
  line:          '구분선·라인',
  navigation:    '네비게이션 (라인탭 등)',
  pagination:    '페이지네이션 컨트롤',
  scroll:        '스크롤바',
  'status-card': '상태 카드 텍스트',
  text:          '텍스트 색상',
};

function figmaToCss(key) { return '--' + key.replace(/\//g, '-'); }       // color/x/y -> --color-x-y
function groupOf(key)    { return key.split('/')[1]; }                    // color/<group>/...
function roleOf(key)     { return key.split('/').slice(2).join(' / '); }  // property / variant--state

function build() {
  const css = parseTokensCss();
  const resolve = makeResolver(css);
  const { semantic } = parseVarsData();                                   // 선언 순서 보존(matchAll)

  const groups = [];           // [{ key, label, desc, tokens:[...] }]
  const index = new Map();
  let total = 0, unresolved = [];

  for (const [figmaKey, refs] of Object.entries(semantic)) {
    const g = groupOf(figmaKey);
    if (!index.has(g)) {
      const grp = { key: g, label: 'color-' + g, desc: GROUP_DESC[g] || '', tokens: [] };
      index.set(g, grp); groups.push(grp);
    }
    const cssVar = figmaToCss(figmaKey);
    const light = resolve(cssVar, false);
    const dark  = resolve(cssVar, true);
    if (!light || light === '—') unresolved.push(`${cssVar} [light]`);   // rgba 리터럴(overlay)은 정상
    index.get(g).tokens.push({
      v: cssVar,
      role: roleOf(figmaKey),
      light: light || '—',
      dark: dark || '—',
      lp: refs.light,
      dp: refs.dark,
    });
    total++;
  }
  return { groups, total, unresolved };
}

// JS 리터럴 직렬화(작은따옴표, Check B 정규식과 동일 형태 유지)
function serialize(groups) {
  const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  const lines = [];
  lines.push('const SEMANTIC_PAGE = [');
  for (const g of groups) {
    lines.push(`  { key: ${q(g.key)}, label: ${q(g.label)}, desc: ${q(g.desc)}, tokens: [`);
    for (const t of g.tokens) {
      lines.push(
        `    { v: ${q(t.v)}, role: ${q(t.role)}, light: ${q(t.light)}, dark: ${q(t.dark)}, lp: ${q(t.lp)}, dp: ${q(t.dp)} },`
      );
    }
    lines.push('  ] },');
  }
  lines.push('];');
  return lines.join('\n');
}

function main() {
  const { groups, total, unresolved } = build();
  const body = serialize(groups);

  if (PREVIEW) {
    process.stdout.write(body + '\n');
    process.stderr.write(`\n[gen-semantic-page] 그룹 ${groups.length} · 토큰 ${total}건` +
      (unresolved.length ? ` · ⚠️ 미해석 ${unresolved.length}: ${unresolved.slice(0, 5).join(', ')}` : '') + '\n');
    return;
  }

  let html = fs.readFileSync(SEMANTIC_HTML, 'utf8');
  const s = html.indexOf(START);
  const e = html.indexOf(END);
  if (s < 0 || e < 0) {
    console.error('❌ semantic.html 에 GEN:SEMANTIC-PAGE 마커가 없습니다. 먼저 마커를 주입하세요.');
    process.exit(1);
  }
  const before = html.slice(0, s + START.length);
  const after  = html.slice(e);
  html = before + ' Variables 정본 자동 생성 (npm run page:gen). 수동 편집 금지. */\n' +
         body + '\n' + after;
  fs.writeFileSync(SEMANTIC_HTML, html);
  console.log(`✅ semantic.html SEMANTIC_PAGE 생성 — 그룹 ${groups.length} · 토큰 ${total}건` +
    (unresolved.length ? `\n   ⚠️ 미해석 ${unresolved.length}건: ${unresolved.slice(0, 8).join(', ')}` : ''));
}

main();
