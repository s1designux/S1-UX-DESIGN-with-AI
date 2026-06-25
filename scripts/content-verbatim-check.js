#!/usr/bin/env node
'use strict';

/**
 * content-verbatim-check.js — 검증된 '고정 문구'가 정해진 위치에 원본 그대로 들어갔나 (Gate 14)
 * ───────────────────────────────────────────────────────────────────────────
 * 구 footer-content-check.js 를 일반화한 것. 풋터에만 묶지 않고, 법인정보·약관·브랜드
 * 등 "함부로 바꾸면 안 되는 검증된 문구" 전부를 같은 장치로 검사한다.
 *
 * 정본: registry/content/*.json — 각 파일이 하나의 '검증된 콘텐츠 블록'.
 *   {
 *     "source": "...",                 // 출처(검증 근거)
 *     "appearsIn": ["경로", ...],      // 이 문구가 그대로 들어가야 하는 파일들 (없으면 설치기 생성기 기본)
 *     "verbatim": ["문구", ...],       // (일반) 그대로 존재해야 하는 문구들
 *     "links": [...], "companyInfo": "...", "copyright": "...",  // (풋터 호환) 위와 동일 취급
 *     "forbiddenFragments": ["..."]    // 있으면 안 되는(과거 날조) 문구
 *   }
 *
 * 새 검증 문구가 생기면: 검사기를 새로 만들 필요 없이 registry/content/ 에 json 한 개만 추가.
 *
 * 사용: node scripts/content-verbatim-check.js   (gate:check 에 포함)
 * 종료코드: 0 통과 / 1 위반.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'registry/content');
const GATE = '[Gate 14] 원본대조 문구 검사기 (Verified Content)';
const DEFAULT_TARGET = 'plugins/figma-vars-installer/src/build-components.ts';

function fail(msgs) {
  console.log('🔎 ' + GATE);
  for (const m of msgs) console.log('  ❌ ' + m);
  console.log('\n  → 법인정보·약관·브랜드 등 검증된 고정 문구는 임의 작성 금지. 정본(registry/content/*.json) 값만,');
  console.log('    정해진 위치에 한 글자도 다르지 않게. 새 문구는 검사기 추가 없이 registry/content/ 에 json 한 개만 더한다.');
  process.exit(1);
}

if (!fs.existsSync(DIR)) fail(['콘텐츠 정본 폴더 없음: registry/content/']);
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'));
if (!files.length) fail(['검사할 콘텐츠 정본이 없음 (registry/content/*.json 0개) — selector 부패 의심']);

const targetCache = {};
function readTarget(rel) {
  if (!(rel in targetCache)) {
    try { targetCache[rel] = fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
    catch (_) { targetCache[rel] = null; }
  }
  return targetCache[rel];
}

const problems = [];
let blocks = 0, requiredCount = 0;

for (const f of files) {
  const name = f.replace(/\.json$/, '');
  let canon;
  try { canon = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); }
  catch (e) { problems.push(`[${name}] 정본 JSON 파싱 실패: ${e.message}`); continue; }

  // 대상 파일
  let targets = canon.appearsIn || [DEFAULT_TARGET];
  if (typeof targets === 'string') targets = [targets];

  // 필수 문구: verbatim(일반) + links/companyInfo/copyright(풋터 호환)
  const required = [];
  (canon.verbatim || []).forEach((s, i) => required.push(['문구[' + i + ']', s]));
  (canon.links || []).forEach((l, i) => required.push(['링크[' + i + ']', l]));
  if (canon.companyInfo) required.push(['회사정보', canon.companyInfo]);
  if (canon.copyright) required.push(['카피라이트', canon.copyright]);

  if (required.length === 0 && (canon.forbiddenFragments || []).length === 0) {
    problems.push(`[${name}] 검사할 문구도 금지 문구도 없음 — 빈 정본(부패 의심)`);
    continue;
  }
  blocks++;
  requiredCount += required.length;

  for (const t of targets) {
    const text = readTarget(t);
    if (text == null) { problems.push(`[${name}] 대상 파일을 못 읽음: ${t}`); continue; }
    for (const [label, str] of required) {
      if (!text.includes(str)) problems.push(`[${name}] ${label} 문구가 ${t} 에 없음(드리프트): "${str}"`);
    }
    for (const frag of (canon.forbiddenFragments || [])) {
      if (text.includes(frag)) problems.push(`[${name}] 폐기된 날조 문구 재유입: "${frag}" (${t})`);
    }
  }
}

if (problems.length) fail(problems);

console.log('🔎 ' + GATE);
console.log(`  ✅ 검증된 고정 문구 ${blocks}블록 정본 일치 (필수 ${requiredCount}건 verbatim · 날조 denylist 0 유입)`);
process.exit(0);
