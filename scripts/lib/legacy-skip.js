/**
 * legacy-skip.js — 레거시/폐기 격리 공용 필터 (검사 게이트 공유)
 *
 * 단일 정본: registry/tokens/deprecated-tokens.json
 *   · deprecatedTokens[].cssVariable / deprecatedStates[].affectedTokens → 폐기 토큰명
 *     ("--button-ghost-*" 처럼 끝에 "*" 가 있으면 prefix 와일드카드로 처리)
 *   · legacyFiles[].path → 검사 제외 파일/디렉터리
 *
 * 게이트는 이 헬퍼로 폐기 토큰·레거시 파일을 일괄 제외한다.
 * → 신규 폐기 시 deprecated-tokens.json 에 등록만 하면 전 게이트에서 자동으로 빠진다.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function load() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/tokens/deprecated-tokens.json'), 'utf8'));
  } catch {
    return {};
  }
}

const data = load();

// ── 폐기 토큰명 집합 (exact + prefix 와일드카드) ──
const exact = new Set();
const prefixes = []; // "*" 제거한 prefix 들

function addToken(name) {
  if (!name || typeof name !== 'string') return;
  if (name.endsWith('*')) prefixes.push(name.slice(0, -1)); // "--button-ghost-*" → "--button-ghost-"
  else exact.add(name);
}
for (const t of data.deprecatedTokens || []) addToken(t.cssVariable);
for (const s of data.deprecatedStates || []) for (const a of s.affectedTokens || []) addToken(a);

/** 토큰명이 폐기 목록(정확/접두사)에 해당하면 true */
function isDeprecatedToken(name) {
  if (exact.has(name)) return true;
  return prefixes.some((p) => name.startsWith(p));
}

// ── 레거시 파일(검사 제외) 집합 ──
const legacyFiles = new Set((data.legacyFiles || []).map((f) => f.path));

/** 파일 경로(repo 상대)가 레거시 격리 대상이면 true */
function isLegacyFile(relPath) {
  const norm = relPath.replace(/^\.\//, '');
  for (const lf of legacyFiles) {
    if (norm === lf || norm.startsWith(lf.replace(/\/?$/, '/'))) return true;
  }
  return false;
}

module.exports = { isDeprecatedToken, isLegacyFile, legacyFiles, deprecatedExact: exact, deprecatedPrefixes: prefixes };
