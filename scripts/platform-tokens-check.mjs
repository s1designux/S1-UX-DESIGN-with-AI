#!/usr/bin/env node
/**
 * platform-tokens-check.mjs
 * --------------------------------------------------------------------------
 * 개발자가 받아 가는 색·크기 값(platform/tokens.json 과 Kotlin·Swift·C++ 파일)이
 * 현재 tokens.css 와 같은 값인지 본다.
 *
 * [왜 따로 있나]
 *   ui:build 는 토큰 '값'이 바뀌면 일부러 멈춘다(컴포넌트 재확인이 먼저다).
 *   그때 배포본은 옛 값을 든 채 남는데, 그 사실을 아무도 모르면 개발자는 옛 색을 계속 쓴다.
 *   이 검사기는 컴포넌트와 무관하게 '값만' 대조해서 그 상태를 드러낸다.
 *
 * 실행: node scripts/platform-tokens-check.mjs   (npm run platform:tokens:check)
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readTokens } from "../ui-library/scripts/platform.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokensCss = await readFile(path.join(root, "assets/css/tokens.css"), "utf8");
const shipped = JSON.parse(await readFile(path.join(root, "ui-library/dist/platform/tokens.json"), "utf8"));

const current = readTokens(tokensCss);
const currentByName = new Map(current.tokens.map((token) => [token.name, token]));
const shippedByName = new Map(shipped.tokens.map((token) => [token.name, token]));

const problems = [];
for (const [name, token] of currentByName) {
  const delivered = shippedByName.get(name);
  if (!delivered) { problems.push(`빠짐: ${name}`); continue; }
  if (delivered.value !== token.value) problems.push(`값 다름: ${name} — 전달본 ${delivered.value} ↔ 정본 ${token.value}`);
  else if ((delivered.darkValue ?? null) !== (token.darkValue ?? null)) {
    problems.push(`다크 값 다름: ${name} — 전달본 ${delivered.darkValue ?? "없음"} ↔ 정본 ${token.darkValue ?? "없음"}`);
  }
}
for (const name of shippedByName.keys()) {
  if (!currentByName.has(name)) problems.push(`남아 있음(정본에 없음): ${name}`);
}

for (const problem of problems.slice(0, 10)) console.error(`  ❌ ${problem}`);
if (problems.length > 10) console.error(`  ❌ 그 외 ${problems.length - 10}건 더`);
console.log(`PLATFORMTOKENS_SUMMARY tokens=${current.tokens.length} mismatched=${problems.length}`);
if (problems.length) {
  console.error("개발자가 받는 색·크기 값이 정본과 다릅니다 — `npm run ui:build` 로 전달본을 다시 만드세요.");
  console.error("ui:build 가 지문 문제로 멈춘다면, 토큰 값 변경에 걸린 컴포넌트를 먼저 재확인해야 한다는 뜻입니다.");
  process.exit(1);
}
