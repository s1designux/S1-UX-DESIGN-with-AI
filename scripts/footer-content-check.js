#!/usr/bin/env node
'use strict';

/**
 * footer-content-check.js — 풋터 법인정보/링크/카피라이트 콘텐츠 드리프트 차단 (Gate 14)
 *
 * 배경: 2026-06-22 사용자 적발 — build-components.ts buildFooter 에 검증 안 된 임의 법인정보
 *   (대표이사 "김일환", "삼일대로 343"), 링크("고객지원"), 카피라이트가 들어가 있었음.
 *   기존 게이트는 토큰·구조만 봐서 "텍스트 내용 날조"를 못 잡았다.
 *
 * 역할: 생성기(build-components.ts)의 풋터 문구가 '검증된 정본'(registry/content/footer.json)과
 *   일치하는지 + 폐기된 날조 문구가 재유입되지 않았는지 기계 판정한다.
 *   - 정본 links/companyInfo/copyright 가 build-components.ts 에 verbatim 존재해야 함.
 *   - forbiddenFragments(과거 날조값)가 하나라도 있으면 차단.
 *
 * 정본: registry/content/footer.json (출처 = Figma login_Footer). 변경 시 원본 재확인 후 정본+생성기 동시 갱신.
 *
 * 사용: node scripts/footer-content-check.js   (gate:check 에 포함)
 * 종료코드: 0 통과 / 1 위반.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CANON_PATH = path.join(ROOT, 'registry/content/footer.json');
const GEN_PATH = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');

function fail(msgs) {
  console.log('🔎 [Gate 14] 풋터콘텐츠 검사기 (Footer Content)');
  for (const m of msgs) console.log('  ❌ ' + m);
  console.log('\n  → 풋터 법인정보·링크·카피라이트는 임의 작성 금지. 검증된 원본(login_Footer) 값만 사용.');
  console.log('    정본: registry/content/footer.json · 생성기: build-components.ts(buildFooter). 둘을 원본과 함께 맞추세요.');
  process.exit(1);
}

if (!fs.existsSync(CANON_PATH)) fail(['정본 파일 없음: registry/content/footer.json']);
if (!fs.existsSync(GEN_PATH)) fail(['생성기 파일 없음: ' + GEN_PATH]);

const canon = JSON.parse(fs.readFileSync(CANON_PATH, 'utf8'));
const gen = fs.readFileSync(GEN_PATH, 'utf8');

const problems = [];

// 1) 정본 문구가 생성기에 verbatim 존재하는가
const required = [];
(canon.links || []).forEach((l, i) => required.push(['링크[' + i + ']', l]));
if (canon.companyInfo) required.push(['회사정보', canon.companyInfo]);
if (canon.copyright) required.push(['카피라이트', canon.copyright]);

for (const [label, str] of required) {
  if (!gen.includes(str)) {
    problems.push(`정본 ${label} 문구가 생성기에 없음(드리프트): "${str}"`);
  }
}

// 2) 폐기된 날조 문구 재유입 차단
for (const frag of (canon.forbiddenFragments || [])) {
  if (gen.includes(frag)) {
    problems.push(`폐기된 날조 문구 재유입: "${frag}" (registry/content/footer.json forbiddenFragments)`);
  }
}

if (problems.length) fail(problems);

console.log('🔎 [Gate 14] 풋터콘텐츠 검사기 (Footer Content)');
console.log(`  ✅ 풋터 법인정보·링크·카피라이트 정본 일치 (정본 ${required.length}건 verbatim · 날조 denylist ${(canon.forbiddenFragments||[]).length}건 0 유입)`);
process.exit(0);
