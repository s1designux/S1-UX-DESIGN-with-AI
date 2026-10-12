#!/usr/bin/env node
/**
 * swift-lint.js — 생성된 Swift 파일의 얕은 자체 점검(참조 실재 확인).
 * ─────────────────────────────────────────────────────────────────────────
 * 컴파일러가 못 보는 "배포본 안의 약속"을 본다 (컴파일 자체는 swift:typecheck 가 한다):
 *   ① 괄호·중괄호 짝(문자열 보간 안의 따옴표까지 읽는다)
 *   ② 참조한 팔레트 색·아이콘이 실제로 있는가
 *   ③ 부품 뼈대가 읽는 조합 열쇠·부품 칸이 스타일 표에 실제로 있는가(열쇠가 글자 그대로일 때)
 *   ④ 부품마다 부품 파일·스타일 표 파일이 있고 선언한 View 가 들어 있는가
 *   ⑤ 부품 뼈대에 치수·색 리터럴이 없는가 (값은 전부 S1*Spec 표에서 — 갤러리는 검수 틀이라 제외)
 *   ⑥ Package.swift(iOS 16+)·README·coverage 가 있고 manifest 와 맞는가
 *
 * 사용: node scripts/swift-lint.js
 * 종료코드: 0 통과 · 1 실패
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'ui-library/dist/platform/swift');
const problems = [];

const pascal = (id) => id.split('-').map((piece) => piece[0].toUpperCase() + piece.slice(1)).join('');

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full);
    return entry.name.endsWith('.swift') ? [full] : [];
  });
}

/** 괄호 짝. 문자열 안의 \( … ) 보간은 코드로 읽어 그 안의 따옴표·괄호도 센다. */
function balance(text, file) {
  const stack = [];
  let line = 1;
  const pairs = { '(': ')', '{': '}', '[': ']' };
  const name = path.basename(file);
  let index = 0;

  function readString() {
    index += 1; // 여는 따옴표
    while (index < text.length) {
      const char = text[index];
      if (char === '\\' && text[index + 1] === '(') {
        index += 2;
        let depth = 1;
        while (index < text.length && depth > 0) {
          const inner = text[index];
          if (inner === '"') { readString(); continue; }
          if (inner === '(') depth += 1;
          if (inner === ')') depth -= 1;
          if (inner === '\n') line += 1;
          index += 1;
        }
        continue;
      }
      if (char === '\\') { index += 2; continue; }
      if (char === '"') { index += 1; return; }
      if (char === '\n') { problems.push(`${name}:${line} 닫히지 않은 문자열`); return; }
      index += 1;
    }
  }

  while (index < text.length) {
    const char = text[index];
    if (char === '\n') { line += 1; index += 1; continue; }
    if (char === '/' && text[index + 1] === '/') { const end = text.indexOf('\n', index); index = end === -1 ? text.length : end; continue; }
    if (char === '/' && text[index + 1] === '*') {
      const end = text.indexOf('*/', index);
      const stop = end === -1 ? text.length : end + 2;
      line += (text.slice(index, stop).match(/\n/g) ?? []).length;
      index = stop;
      continue;
    }
    if (char === '"') { readString(); continue; }
    if (pairs[char]) { stack.push({ char, line }); index += 1; continue; }
    if (char === ')' || char === '}' || char === ']') {
      const open = stack.pop();
      if (!open || pairs[open.char] !== char) { problems.push(`${name}:${line} 괄호가 맞지 않습니다 (${char}).`); return; }
    }
    index += 1;
  }
  if (stack.length > 0) problems.push(`${name}:${stack[stack.length - 1].line} 닫히지 않은 ${stack[stack.length - 1].char} 가 있습니다.`);
}

/** 스펙 파일에서 표 이름별 (열쇠 집합, 부품 칸 집합)을 읽는다. */
function readSpec(text) {
  const tables = {};
  for (const block of text.matchAll(/public static let (\w*[bB]oxes): \[String: \[String: S1Box\]\] = \{([\s\S]*?)\n    \}\(\)/g)) {
    const keys = new Set([...block[2].matchAll(/table\["([^"]+)"\] = \[/g)].map((match) => match[1]));
    const parts = new Set([...block[2].matchAll(/^\s{12}"(\w+)": S1Box\(/gm)].map((match) => match[1]));
    tables[block[1]] = { keys, parts };
  }
  return tables;
}

const isFramework = (name) => /^(S1Style|S1IconView|S1Palette|S1Type|S1Tokens|S1Version|S1Icons|S1Gallery|S1.*Spec)\.swift$/.test(name);

function main() {
  if (!fs.existsSync(DIR)) { console.error('❌ platform/swift 가 없습니다. `npm run ui:build` 를 먼저 실행하세요.'); process.exit(1); }
  const list = files(DIR);
  const texts = new Map(list.map((file) => [file, fs.readFileSync(file, 'utf8')]));
  for (const [file, text] of texts) balance(text, file);

  const paletteText = texts.get(path.join(DIR, 'S1Palette.swift')) ?? '';
  const paletteNames = new Set([...paletteText.matchAll(/public static let (\w+) = S1Color\(/g)].map((match) => match[1]));
  const iconText = texts.get(path.join(DIR, 'S1Icons.swift')) ?? '';
  const iconNames = new Set([...iconText.matchAll(/^\s*case "([a-z0-9_-]+)":/gm)].map((match) => match[1]));

  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'ui-library/dist/platform/manifest.json'), 'utf8'));
  const swiftSpec = manifest.platforms.swift;
  const specTables = new Map();
  for (const id of swiftSpec.components) {
    const spec = texts.get(path.join(DIR, `S1${pascal(id)}Spec.swift`));
    if (spec) specTables.set(`S1${pascal(id)}Spec`, readSpec(spec));
  }

  for (const [file, text] of texts) {
    const name = path.basename(file);
    if (name === 'S1Palette.swift') continue;
    for (const match of text.matchAll(/S1Palette\.(\w+)/g)) {
      if (!paletteNames.has(match[1])) problems.push(`${name}: 팔레트에 없는 색 S1Palette.${match[1]}`);
    }
    for (const match of text.matchAll(/\bicon: "([a-z0-9_-]+)"/g)) {
      if (name !== 'S1Icons.swift' && !iconNames.has(match[1])) problems.push(`${name}: 배포본에 없는 아이콘 "${match[1]}"`);
    }
    if (/Spec\.swift$/.test(name) || isFramework(name)) continue;
    /* ③ 부품 뼈대의 표 조회 — 열쇠가 글자 그대로(보간·변수 없음)일 때만 확인한다. */
    for (const match of text.matchAll(/(S1\w+Spec)\.(\w*[bB]ox)\("([^"\\]*)", "(\w+)"\)/g)) {
      const [, spec, accessor, key, part] = match;
      const tables = specTables.get(spec);
      const table = tables && tables[accessor === 'box' ? 'boxes' : `${accessor}es`];
      if (!table) { problems.push(`${name}: ${spec}.${accessor} 표를 찾지 못했습니다.`); continue; }
      if (!table.keys.has(key)) problems.push(`${name}: ${spec}.${accessor}("${key}") — 표에 없는 조합`);
      if (!table.parts.has(part)) problems.push(`${name}: ${spec}.${accessor}(…, "${part}") — 표에 없는 부품 칸`);
    }
    /* ⑤ 치수·색 리터럴. 0 과 .infinity 는 값이 아니라 뼈대 문법이라 허용한다. */
    const stripped = text.replace(/\/\/.*$/gm, '').replace(/"(?:[^"\\]|\\.)*"/g, '""');
    const dimension = /\b(?:width|height|spacing|radius|lineWidth|cornerRadius|minWidth|minHeight|maxWidth|maxHeight|size)\s*:\s*-?(?:[1-9]\d*|0\.\d*[1-9]\d*)\b/g;
    for (const match of stripped.matchAll(dimension)) problems.push(`${name}: 치수 리터럴 "${match[0]}" — 값은 S1*Spec 표에서 와야 합니다.`);
    for (const match of stripped.matchAll(/\.padding\([^)]*\b[1-9]\d*\b[^)]*\)/g)) problems.push(`${name}: 여백 리터럴 "${match[0]}"`);
    for (const match of stripped.matchAll(/0x[0-9A-Fa-f]{6,8}\b|\bColor\((?!argb)[^)]*\)|\bColor\.(?:red|blue|green|black|white|gray|orange|yellow|pink|purple)\b/g)) problems.push(`${name}: 색 리터럴 "${match[0]}" — 색은 S1Palette 에서 와야 합니다.`);
  }

  /* ④ 부품 파일·표 파일·선언한 View */
  for (const id of swiftSpec.components) {
    const pascalId = pascal(id);
    for (const suffix of ['', 'Spec']) {
      const target = path.join(DIR, `S1${pascalId}${suffix}.swift`);
      if (!fs.existsSync(target)) problems.push(`${id}: S1${pascalId}${suffix}.swift 가 없습니다.`);
    }
    const body = texts.get(path.join(DIR, `S1${pascalId}.swift`)) ?? '';
    if (body && !/public struct S1\w+(?:<[^>]*>)?: View/.test(body)) problems.push(`${id}: S1${pascalId}.swift 에 public View 선언이 없습니다.`);
  }

  /* ⑥ 묶음 구성 */
  if (!fs.existsSync(path.join(DIR, 'Package.swift'))) problems.push('Package.swift 가 없습니다.');
  else if (!/\.iOS\(\.v16\)/.test(texts.get(path.join(DIR, 'Package.swift')))) problems.push('Package.swift 가 iOS 16+ 를 선언하지 않습니다.');
  const readme = fs.existsSync(path.join(DIR, 'README.md')) ? fs.readFileSync(path.join(DIR, 'README.md'), 'utf8') : '';
  if (!readme) problems.push('README.md 가 없습니다.');
  for (const id of swiftSpec.components) if (readme && !readme.includes(id)) problems.push(`README.md 에 ${id} 가 적혀 있지 않습니다.`);
  const coveragePath = path.join(DIR, 'coverage.json');
  if (!fs.existsSync(coveragePath)) problems.push('coverage.json 이 없습니다.');
  else {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const covered = coverage.components.map((one) => one.component).join(',');
    if (covered !== swiftSpec.components.join(',')) problems.push('coverage.json 의 부품 목록이 manifest 와 다릅니다.');
    /* 값이 아니라 브라우저 동작·상속·웹 전용이라 표에 안 옮기는 속성(Kotlin 과 같은 목록). 이 밖의 속성이 남으면 빠뜨린 값이다.
       caret-color 는 커서 색이다 — 입력칸 커서는 글자색(foreground)으로 칠한다(Kotlin 과 같다). */
    const KNOWN = new Set(['user-select', 'caret-color', 'outline', 'font', '-webkit-mask-image', 'resize', 'margin-left']);
    for (const one of coverage.components) {
      for (const ignored of one.ignoredProperties) {
        if (!KNOWN.has(ignored.property)) problems.push(`coverage: ${one.component} 가 계산했지만 표에 옮기지 못한 속성 ${ignored.property} (${ignored.samples[0]})`);
      }
    }
  }

  console.log(`🔎 SwiftUI 생성물 얕은 점검 — 파일 ${list.length}개 · 팔레트 ${paletteNames.size}색 · 아이콘 ${iconNames.size}개 · 부품 ${swiftSpec.components.length}종`);
  if (problems.length === 0) {
    console.log('✅ PASS — 괄호·참조·리터럴에 어긋난 곳이 없습니다. (컴파일은 swift:typecheck)');
    process.exit(0);
  }
  console.log(`❌ FAIL — ${problems.length}건`);
  for (const problem of problems.slice(0, 60)) console.log(`   · ${problem}`);
  process.exit(1);
}

main();
