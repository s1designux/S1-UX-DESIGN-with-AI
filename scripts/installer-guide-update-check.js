#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const code = read('plugins/figma-vars-installer/src/code.ts');
const audit = read('plugins/figma-vars-installer/src/audit-engine.ts');
const ui = read('plugins/figma-vars-installer/src/ui.html');
const build = read('scripts/build-installer.js');

const errors = [];
const requireText = (source, text, label) => {
  if (!source.includes(text)) errors.push(label);
};

const labels = [
  '최신 컴포넌트 매칭', '색상 토큰 연결', '시맨틱 색상 용도 준수',
  '가이드 색상 스타일 준수', '투명도 가이드 준수', '텍스트 스타일 매칭',
  '글자 크기 가이드 준수', '텍스트 스타일 값 준수', '가이드 글꼴 준수', '가이드 그림자 매칭',
];
let previous = -1;
for (const label of labels) {
  const index = ui.indexOf(`<span class="check-name">${label}</span>`);
  if (index < 0) errors.push(`체크리스트 문구 누락: ${label}`);
  if (index >= 0 && index <= previous) errors.push(`체크리스트 순서 오류: ${label}`);
  previous = index;
}

requireText(ui, 'id="btn-go-install">최신 가이드로 업데이트</button>', '업데이트 버튼 문구 누락');
requireText(ui, '가이드 현황을 확인하고 있습니다…', '검수 탭 중립 확인 화면 누락');
requireText(ui, '가이드 현황을 확인하지 못했습니다', '가이드 현황 확인 실패 화면 누락');
requireText(ui, 'id="btn-guide-retry">다시 확인</button>', '가이드 현황 재확인 버튼 누락');
requireText(ui, 'beginAuditGuideCheck();', '검수 탭 진입 검사 트리거 누락');
requireText(ui, "send('selection-state', { requestId: auditGuideRequestId })", '가이드 검사 요청 식별자 누락');
requireText(ui, 'if (p.requestId !== auditGuideRequestId) return;', '오래된 가이드 검사 응답 무시 누락');
requireText(code, 'const GUIDE_VERSION_KEY = "s1-guide-fingerprint"', '가이드 버전 표식 누락');
requireText(code, 'type: "audit:selection-summary"', '선택 변경 전용 요약 메시지 누락');
requireText(code, 'type: "audit:selection-state-error"', '가이드 현황 확인 실패 메시지 누락');
requireText(code, 'postAuditSelectionSummary();', '선택 변경 시 요약 전송 누락');
if (/figma\.on\("selectionchange", \(\) => \{\s*void postAuditSelectionState\(\);\s*\}\);/.test(code)) errors.push('선택 변경 시 전체 가이드 검사 금지 위반');
if (/^void postAuditSelectionState\(\);/m.test(code)) errors.push('플러그인 시작 시 전체 가이드 검사 금지 위반');
if (/guide-update-done[\s\S]{0,180}postAuditSelectionState\(\)/.test(code)) errors.push('가이드 업데이트 뒤 중복 전체 검사 금지 위반');
requireText(code, 'figma.root.setPluginData(GUIDE_PAGE_KEY, figma.currentPage.id)', '가이드 페이지 포인터 누락');
requireText(code, 'figma.createPage()', '신규 가이드 페이지 생성 누락');
requireText(code, 'figma.currentPage = previousPage', '실패 시 이전 페이지 복귀 누락');
requireText(code, 'page.remove()', '실패한 신규 가이드 페이지 정리 누락');
requireText(code, 'if (options.updateFlow && componentProblems > 0)', '불완전한 업데이트 실패 처리 누락');
requireText(build, '__CURRENT_GUIDE_FINGERPRINT__', '빌드 지문 주입 누락');
requireText(audit, 'category === "text" ? 5 : 3', '로컬 textStyleId 검사 5번 이동 누락');

if (errors.length) {
  console.error('❌ 설치/검수기 최신 가이드 흐름 검사 실패');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('✅ 설치/검수기 최신 가이드 흐름 검사 통과 (10개 문구·지문·신규 페이지·표식)');
