#!/usr/bin/env node
/**
 * 🔎 레지스트리 active/legacy 일관성 검사기 (Registry Active/Legacy Consistency) — Gate 21
 *
 * 문제(2026-07-02): 은퇴한 파일(component.tokens.json 컴포넌트-별칭 토큰층)이
 *   registry/index.json 엔 "active 포인터"로 남아 있고, 레거시 단일정본(deprecated-tokens.json
 *   legacyFiles)엔 없어서 — 사람·AI 가 "살아있는 정본"으로 오판. Gate 20 도 그 파일을 스캔해 혼란 가중.
 *
 * 규칙(결정론·오탐 0 설계):
 *   ❌ 차단 = index.json 에 **active 로 등록된 파일 경로**가 동시에 **레거시 격리 대상**(legacy-skip.isLegacyFile).
 *            → 레거시는 active 포인터가 아니라 `_`접두 은퇴표식 + legacyFiles 로만 남겨야 함.
 *   ⚠️ 경고 = active 포인터가 실재하지 않는 파일(dangling). (사전존재 가능성 있어 비차단.)
 *
 * "active 포인터" = index.json 의 문자열 값 중 파일 경로(.json/.css/.md).
 *   키가 `_` 로 시작하면(예: `_meta`, `_componentRetired`) 메타/은퇴 표식으로 보고 **제외**.
 *   → 은퇴 처리 = 해당 포인터 키를 `_`접두로 옮기거나 값에서 제거.
 */
const fs = require('fs');
const path = require('path');
const { isLegacyFile } = require('./lib/legacy-skip');
const ROOT = path.resolve(__dirname, '..');

const errors = [];
const warnings = [];

let index;
try {
  index = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/index.json'), 'utf8'));
} catch (e) {
  console.log('🔎 레지스트리 active/legacy 일관성 검사기');
  console.log(`  ❌ registry/index.json 읽기/파싱 실패 — ${e.message}`);
  process.exit(1);
}

// index.json 에서 "active 포인터" 문자열 경로 수집 (키가 _로 시작 = 메타/은퇴 → 제외)
const activePaths = [];
function collect(obj, keyPath) {
  if (typeof obj === 'string') {
    if (/\.(json|css|md)$/.test(obj) && obj.includes('/')) activePaths.push({ rel: obj, at: keyPath || '(root)' });
    return;
  }
  if (Array.isArray(obj)) { obj.forEach((v, i) => collect(v, `${keyPath}[${i}]`)); return; }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('_')) continue; // 메타/은퇴 표식 제외
      collect(v, keyPath ? `${keyPath}.${k}` : k);
    }
  }
}
collect(index, '');

for (const { rel, at } of activePaths) {
  if (isLegacyFile(rel)) {
    errors.push(`${at} → ${rel}: index.json 에 active 등록됐으나 레거시 격리(legacyFiles) 대상. index 에서 은퇴(_접두 표식/제거) 처리 필요.`);
    continue;
  }
  if (!fs.existsSync(path.join(ROOT, rel))) {
    warnings.push(`${at} → ${rel}: index.json 에 등록됐으나 파일 없음(dangling).`);
  }
}

console.log('🔎 레지스트리 active/legacy 일관성 검사기 (Registry Active/Legacy Consistency)');
console.log(`  active 포인터 ${activePaths.length}개 검사 · legacy 격리 ${'(단일정본 deprecated-tokens.json)'}`);
warnings.forEach((w) => console.log('  ⚠️  ' + w));
if (errors.length) {
  errors.forEach((e) => console.log('  ❌ ' + e));
  console.log(`  → ${errors.length}건. 레거시 파일은 active 포인터로 두지 말 것(좀비 등록).`);
  process.exit(1);
}
console.log(`  ✅ active 등록 ∩ 레거시 격리 모순 0 (dangling 경고 ${warnings.length}건)`);
