'use strict';
/**
 * hook-input.js — PreToolUse 훅의 stdin 입력에서 `use_figma` 의 code 를 꺼낸다.
 *
 * 왜 필요한가 (2026-08-03 실측):
 *   종전 훅 설정은 `jq -r '.tool_input.code' | node scripts/figma-code-hex-check.js` 형태로
 *   **jq + 파이프(=셸)** 에 의존했다. 이 컴퓨터(Windows)에는 jq 가 없어서, 훅을 등록해도
 *   hex·폰트 차단(하드룰 H2·H3)이 **조용히 안 걸린다**. 차단장치가 꺼진 것을 아무도 모르는
 *   상태가 가장 위험하므로, 스크립트가 훅 JSON 을 직접 파싱해 외부 의존을 없앤다.
 *   (같은 이유로 zip=read-zip-entry.js · tar=extract-tar.js 를 Node 로 옮겼다.)
 *
 * 입력 형태 3가지를 모두 받는다:
 *   1) 훅 JSON 전체 (`{"tool_name":"...","tool_input":{"code":"..."}}`) — 현행 권장
 *   2) code 문자열 원문 — 옛 `jq | node` 파이프 방식 하위호환
 *   3) 파일 경로 인자 — 테스트용(호출부에서 처리)
 */

/**
 * @param {string} raw stdin 원문
 * @returns {{code: string, toolName: string|null, fromJson: boolean}}
 */
function extractCode(raw) {
  const text = String(raw || '');
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    try {
      const j = JSON.parse(trimmed);
      const ti = j.tool_input || j.toolInput || {};
      // use_figma 는 code, 그 밖의 도구는 다른 키를 쓸 수 있어 후보를 순서대로 본다.
      const code = ti.code || ti.script || ti.source || '';
      return { code: String(code), toolName: j.tool_name || j.toolName || null, fromJson: true };
    } catch (_) {
      // JSON 처럼 시작하지만 파싱 실패 → 원문을 코드로 취급(차단을 놓치지 않는 쪽으로)
    }
  }
  return { code: text, toolName: null, fromJson: false };
}

module.exports = { extractCode };
