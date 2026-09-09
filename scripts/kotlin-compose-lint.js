#!/usr/bin/env node
/**
 * kotlin-compose-lint.js — 생성된 Kotlin 파일의 얕은 자체 점검.
 * ─────────────────────────────────────────────────────────────────────────
 * 이 맥에는 코틀린 컴파일러가 없다(JDK 17 미설치). 컴파일 대신 기계로 확인할 수 있는 것만 본다:
 *   ① 괄호·중괄호 짝이 맞는가            ② 참조한 팔레트 색이 실제로 있는가
 *   ③ 참조한 아이콘이 실제로 있는가       ④ 부품마다 스타일 표 파일이 있는가
 * **이 검사를 통과해도 "컴파일된다"는 뜻은 아니다.** 그 확인은 Android Studio 에서 해야 한다.
 *
 * 사용: node scripts/kotlin-compose-lint.js
 * 종료코드: 0 통과 · 1 실패
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'ui-library/dist/platform/kotlin');

const problems = [];

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full);
    return entry.name.endsWith('.kt') ? [full] : [];
  });
}

/** 문자열·주석 밖의 괄호만 센다. */
function balance(text, file) {
  const pairs = { '(': ')', '{': '}', '[': ']' };
  const stack = [];
  let index = 0;
  let line = 1;
  while (index < text.length) {
    const char = text[index];
    if (char === '\n') { line += 1; index += 1; continue; }
    if (char === '/' && text[index + 1] === '/') { const end = text.indexOf('\n', index); index = end === -1 ? text.length : end; continue; }
    if (char === '/' && text[index + 1] === '*') { const end = text.indexOf('*/', index); index = end === -1 ? text.length : end + 2; continue; }
    if (char === '"') {
      const triple = text.startsWith('"""', index);
      const close = triple ? text.indexOf('"""', index + 3) : findStringEnd(text, index);
      index = close === -1 ? text.length : close + (triple ? 3 : 1);
      continue;
    }
    if (pairs[char]) { stack.push({ char, line }); index += 1; continue; }
    if (char === ')' || char === '}' || char === ']') {
      const open = stack.pop();
      if (!open || pairs[open.char] !== char) {
        problems.push(`${path.basename(file)}:${line} 괄호가 맞지 않습니다 (${char}).`);
        return;
      }
      index += 1;
      continue;
    }
    index += 1;
  }
  if (stack.length > 0) problems.push(`${path.basename(file)}:${stack[stack.length - 1].line} 닫히지 않은 ${stack[stack.length - 1].char} 가 있습니다.`);
}

function findStringEnd(text, start) {
  for (let index = start + 1; index < text.length; index += 1) {
    if (text[index] === '\\') { index += 1; continue; }
    if (text[index] === '"') return index;
    if (text[index] === '\n') return index;
  }
  return -1;
}

function main() {
  if (!fs.existsSync(DIR)) {
    console.error('❌ platform/kotlin 이 없습니다. `npm run ui:build` 를 먼저 실행하세요.');
    process.exit(1);
  }
  const list = files(DIR);
  const texts = new Map(list.map((file) => [file, fs.readFileSync(file, 'utf8')]));
  for (const [file, text] of texts) balance(text, file);

  const paletteText = texts.get(path.join(DIR, 'S1Palette.kt')) ?? '';
  const paletteNames = new Set([...paletteText.matchAll(/val\s+([A-Za-z0-9_]+)\s*:\s*S1Color/g)].map((match) => match[1]));
  const iconText = texts.get(path.join(DIR, 'S1Icons.kt')) ?? '';
  const iconNames = new Set([...iconText.matchAll(/^\s*"([a-z_]+)"\s*->/gm)].map((match) => match[1]));

  for (const [file, text] of texts) {
    if (file.endsWith('S1Palette.kt')) continue;
    for (const match of text.matchAll(/S1Palette\.([A-Za-z0-9_]+)/g)) {
      if (!paletteNames.has(match[1])) problems.push(`${path.basename(file)}: 팔레트에 없는 색 S1Palette.${match[1]}`);
    }
    for (const match of text.matchAll(/icon\s*=\s*"([a-z_]+)"/g)) {
      if (!iconNames.has(match[1])) problems.push(`${path.basename(file)}: 배포본에 없는 아이콘 "${match[1]}"`);
    }
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'ui-library/dist/platform/manifest.json'), 'utf8'));
  for (const id of manifest.platforms.kotlin.components) {
    const pascal = id.split('-').map((piece) => piece[0].toUpperCase() + piece.slice(1)).join('');
    for (const suffix of ['', 'Spec']) {
      const target = path.join(DIR, `S1${pascal}${suffix}.kt`);
      if (!fs.existsSync(target)) problems.push(`${id}: S1${pascal}${suffix}.kt 가 없습니다.`);
    }
  }

  console.log(`🔎 Compose 생성물 얕은 점검 — 파일 ${list.length}개 · 팔레트 ${paletteNames.size}색 · 아이콘 ${iconNames.size}개`);
  if (problems.length === 0) {
    console.log('✅ PASS — 괄호·참조에 어긋난 곳이 없습니다. (컴파일 확인은 Android Studio 에서 별도)');
    process.exit(0);
  }
  console.log(`❌ FAIL — ${problems.length}건`);
  for (const problem of problems.slice(0, 40)) console.log(`   · ${problem}`);
  process.exit(1);
}

main();
