#!/usr/bin/env node
/**
 * gen-foundation-tokens.js
 *
 * Variables(vars-data.ts FOUNDATION_COLOR + FOUNDATION_NUMBER)를 **정본**으로
 * tokens.css 의 Foundation 섹션을 자동 생성한다. gen-semantic-tokens.js와 동일한
 * 마커 교체 패턴(GEN:FOUNDATION)을 따른다.
 *
 *   Figma Variables (vars-data.ts)  ──[gen]──▶  tokens.css Foundation 섹션
 *
 * 마커 밖 보존 (생성기 관할 아님 — vars-data에 없는 값, 절대 덮어쓰기 금지):
 *   - --color-status-dark-red/-green/-yellow (350 step alias — registry statusDarkAlias 참조,
 *     2026-07-08 이력 조사로 "의도적 alias" 확정)
 *   - --letter-spacing-tight/-normal/-wide (타이포 파이프라인 소속 —
 *     textstyles-data.ts + scripts/typography-gen.js 가 이름만 참조, 값은 여기서만 정의)
 *   - semantic number 서브블록 (--spacing-label-gap-*, --radius-control-* 등 —
 *     Semantic Number 정본, Foundation 아님. 763a70a 자동생성기 누락분 복원분)
 *
 * 마커 안에서 삭제 (생성기 관할 — vars-data에 없고 저장소 참조 0건, 2026-07-08 고아 확정):
 *   - --shadow-200
 *
 * 최초 실행(마커 없음): 위 3개 보존 블록을 현재 tokens.css에서 그대로 추출해
 * 마커 뒤로 재배치하고, shadow-200은 버린다(한 번만 일어나는 구조 이전).
 * 이후 실행(마커 있음): GEN:FOUNDATION 마커 사이만 교체 — 마커 밖은 정규식이
 * 아예 손대지 않으므로 보존 블록은 그 뒤로는 자동으로 안전하다.
 *
 * 사용:
 *   node scripts/gen-foundation-tokens.js --preview   # 생성 결과 + 비교 리포트 stdout (파일 미변경)
 *   node scripts/gen-foundation-tokens.js             # tokens.css 실제 수정
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const VARS = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');
const TOKENS_CSS = path.join(ROOT, 'assets/css/tokens.css');

const PREVIEW = process.argv.includes('--preview');

// ── vars-data.ts 파싱 ──────────────────────────────────────────────────────
function block(src, name) {
  const m = src.match(new RegExp('export const ' + name + ':[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\n\\};', 'm'));
  if (!m) throw new Error('vars-data.ts에서 블록을 못 찾음: ' + name);
  return m[1];
}

function parseFlat(blockText) {
  const entries = [];
  const re = /"([a-zA-Z0-9_\-]+\/[a-zA-Z0-9_\-]+)"\s*:\s*("([^"]*)"|-?[0-9.]+)/g;
  let m;
  while ((m = re.exec(blockText))) {
    entries.push({ key: m[1], val: m[3] !== undefined ? m[3] : m[2] });
  }
  return entries;
}

function splitKey(key) {
  const idx = key.lastIndexOf('/');
  return [key.slice(0, idx), key.slice(idx + 1)];
}

// ── Color 생성 ─────────────────────────────────────────────────────────────
const BASE_BRAND_GROUPS = new Set(['base', 'brand']);
const PALETTE_LABEL = {
  gray: 'Gray', blue: 'Blue', red: 'Red', orange: 'Orange', yellow: 'Yellow',
  green: 'Green', skyblue: 'Skyblue', purple: 'Purple', brown: 'Brown',
  'visual-gray': 'Visual Gray',
};
// vars-data에 없는 트레일링 주석(생성기가 못 만듦) — 알려진 예외만 하드코딩 재부착
const INLINE_COMMENT_EXCEPTIONS = {
  'brand/ci': 'CI·로고 전용. UI 직접 사용 금지',
};

function colorCssName(key) {
  const [palette, step] = splitKey(key);
  return `color-${palette}-${step}`;
}

function buildColorBlock(entries) {
  const baseBrand = entries.filter((e) => BASE_BRAND_GROUPS.has(splitKey(e.key)[0]));
  const paletteOrder = [];
  const paletteMap = new Map();
  for (const e of entries) {
    const [group] = splitKey(e.key);
    if (BASE_BRAND_GROUPS.has(group)) continue;
    const isDark = group.endsWith('-dark');
    const paletteBase = isDark ? group.slice(0, -5) : group;
    if (!paletteMap.has(paletteBase)) {
      paletteMap.set(paletteBase, { light: [], dark: [] });
      paletteOrder.push(paletteBase);
    }
    paletteMap.get(paletteBase)[isDark ? 'dark' : 'light'].push(e);
  }

  const lines0 = [];
  const w0 = Math.max(...baseBrand.map((e) => ('--' + colorCssName(e.key)).length));
  for (const e of baseBrand) {
    const name = ('--' + colorCssName(e.key)).padEnd(w0);
    const comment = INLINE_COMMENT_EXCEPTIONS[e.key] ? ` /* ${INLINE_COMMENT_EXCEPTIONS[e.key]} */` : '';
    lines0.push(`  ${name}: ${e.val};${comment}`);
  }

  const lines1 = [];
  for (const paletteBase of paletteOrder) {
    const label = PALETTE_LABEL[paletteBase] || paletteBase;
    const { light, dark } = paletteMap.get(paletteBase);
    if (light.length) {
      lines1.push(`  /* ── ${label} · Light ── */`);
      const w = Math.max(...light.map((e) => ('--' + colorCssName(e.key)).length));
      for (const e of light) lines1.push(`  ${('--' + colorCssName(e.key)).padEnd(w)}: ${e.val};`);
      lines1.push('');
    }
    if (dark.length) {
      lines1.push(`  /* ── ${label} · Dark ── */`);
      const w = Math.max(...dark.map((e) => ('--' + colorCssName(e.key)).length));
      for (const e of dark) lines1.push(`  ${('--' + colorCssName(e.key)).padEnd(w)}: ${e.val};`);
      lines1.push('');
    }
  }
  while (lines1.length && lines1[lines1.length - 1] === '') lines1.pop();

  return { lines0, lines1 };
}

// ── Number 생성 ────────────────────────────────────────────────────────────
const NUMBER_GROUP_LABEL = {
  spacing: 'Spacing', sizing: 'Sizing', radius: 'Radius', 'border-width': 'Border Width',
  'font-size': 'Font Size', 'font-weight': 'Font Weight', 'line-height': 'Line Height',
  opacity: 'Opacity', breakpoint: 'Breakpoint',
};
const NUMBER_GROUP_ORDER = [
  'spacing', 'sizing', 'radius', 'border-width', 'font-size', 'font-weight',
  'line-height', 'opacity', 'breakpoint',
];
const NUMBER_GROUP_UNIT = {
  spacing: 'px', sizing: 'px', radius: 'px', 'border-width': 'px', 'font-size': 'px', breakpoint: 'px',
  'font-weight': '', 'line-height': '', opacity: '',
};

function numberCssName(key) {
  const [group, step] = splitKey(key);
  return `${group}-${step}`;
}

function buildNumberBlock(entries) {
  const byGroup = new Map();
  for (const e of entries) {
    const [group] = splitKey(e.key);
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group).push(e);
  }
  const lines = [];
  for (const group of NUMBER_GROUP_ORDER) {
    const list = byGroup.get(group);
    if (!list || !list.length) continue;
    const label = NUMBER_GROUP_LABEL[group] || group;
    lines.push(`  /* ── ${label} ── */`);
    const unit = NUMBER_GROUP_UNIT[group] ?? '';
    const w = Math.max(...list.map((e) => ('--' + numberCssName(e.key)).length));
    for (const e of list) lines.push(`  ${('--' + numberCssName(e.key)).padEnd(w)}: ${e.val}${unit};`);
    lines.push('');
  }
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

const STAMP = 'Auto-generated from vars-data.ts (npm run tokens:gen:foundation) — Variables 정본. 수동 편집 금지.';

function buildFoundationInner(colorEntries, numberEntries) {
  const { lines0, lines1 } = buildColorBlock(colorEntries);
  const numberLines = buildNumberBlock(numberEntries);
  return `/* ══════════════════════════════════════════════════
   0. FOUNDATION — Base & Brand
   ══════════════════════════════════════════════════ */
:root {
${lines0.join('\n')}
}


/* ══════════════════════════════════════════════════
   1. FOUNDATION — Color Foundation
   ══════════════════════════════════════════════════ */
:root {

${lines1.join('\n')}
}


/* ══════════════════════════════════════════════════
   2. FOUNDATION — Spacing, Radius, Border Width, Typography
   ══════════════════════════════════════════════════ */
:root {

${numberLines.join('\n')}
}`;
}

// ── 마커 밖 보존 블록 추출 (최초 실행 = 마커 아직 없을 때만 사용) ──────────
function extractOnce(cssSrc, label, startRe, endLineRe) {
  const startMatch = cssSrc.match(startRe);
  if (!startMatch) throw new Error(`보존 블록을 못 찾음(${label}): ${startRe}`);
  const from = startMatch.index;
  const rest = cssSrc.slice(from);
  const endMatch = rest.match(endLineRe);
  if (!endMatch) throw new Error(`보존 블록 끝을 못 찾음(${label}): ${endLineRe}`);
  const to = from + endMatch.index + endMatch[0].length;
  return cssSrc.slice(from, to);
}

function buildBootstrapManualSections(cssSrc) {
  const statusDark = extractOnce(
    cssSrc,
    'status-dark',
    /\/\* ── Status · Dark[^\n]*\*\/\n/,
    /--color-status-dark-yellow:[^\n]*\n/
  );
  const letterSpacing = extractOnce(
    cssSrc,
    'letter-spacing',
    /\/\* ── Letter Spacing[^\n]*\*\/\n/,
    /--letter-spacing-wide:[^\n]*\n/
  );
  const semanticNumber = extractOnce(
    cssSrc,
    'semantic-number',
    /\/\* ══ semantic number[^\n]*\*\/\n/,
    /\n\}/
  );

  const statusDarkBlock = `/* ══════════════════════════════════════════════════
   0b. Status Dark Alias (수동 — vars-data 밖 관리, 350 step alias. registry statusDarkAlias 참조)
   ══════════════════════════════════════════════════ */
:root {
${statusDark.replace(/\n$/, '').split('\n').map((l) => '  ' + l.trim()).join('\n')}
}`;

  const letterSpacingBlock = `/* ══════════════════════════════════════════════════
   2b. Letter Spacing (수동 — 타이포 파이프라인 소속. textstyles-data.ts/typography-gen.js 참조)
   ══════════════════════════════════════════════════ */
:root {
${letterSpacing.replace(/\n$/, '').split('\n').map((l) => '  ' + l.trim()).join('\n')}
}`;

  // semanticNumber already ends with "\n}" (closing brace of its original :root) — wrap with :root{ open only.
  const semanticNumberBlock = `:root {\n${semanticNumber.replace(/^/, '  ').trimEnd()}`;

  return { statusDarkBlock, letterSpacingBlock, semanticNumberBlock };
}

function main() {
  const varsSrc = fs.readFileSync(VARS, 'utf-8');
  const colorEntries = parseFlat(block(varsSrc, 'FOUNDATION_COLOR'));
  const numberEntries = parseFlat(block(varsSrc, 'FOUNDATION_NUMBER'));

  const innerBlock = buildFoundationInner(colorEntries, numberEntries);
  const genBlock = `/* >>> GEN:FOUNDATION >>> ${STAMP} */\n${innerBlock}\n/* <<< GEN:FOUNDATION <<< */`;

  const css = fs.readFileSync(TOKENS_CSS, 'utf-8');
  const MARKER_RE = /\/\* >>> GEN:FOUNDATION >>>[\s\S]*?<<< GEN:FOUNDATION <<< \*\//;
  const hasMarkers = MARKER_RE.test(css);

  if (PREVIEW) {
    process.stderr.write(`[gen:foundation] FOUNDATION_COLOR ${colorEntries.length}개, FOUNDATION_NUMBER ${numberEntries.length}개 파싱\n`);
    process.stderr.write(`[gen:foundation] 마커 존재 여부: ${hasMarkers ? '있음(steady-state 교체)' : '없음(최초 실행 — 보존 블록 재배치 필요)'}\n\n`);

    console.log('========== 생성될 GEN:FOUNDATION 블록 (마커 안) ==========');
    console.log(genBlock);

    if (!hasMarkers) {
      const { statusDarkBlock, letterSpacingBlock, semanticNumberBlock } = buildBootstrapManualSections(css);
      console.log('\n========== 마커 밖 보존 블록 1: Status Dark (재배치, 값 변경 없음) ==========');
      console.log(statusDarkBlock);
      console.log('\n========== 마커 밖 보존 블록 2: Letter Spacing (재배치, 값 변경 없음) ==========');
      console.log(letterSpacingBlock);
      console.log('\n========== 마커 밖 보존 블록 3: Semantic Number (재배치, 값 변경 없음) ==========');
      console.log(semanticNumberBlock);
      console.log('\n========== shadow-200 ==========');
      console.log('현재: --shadow-200: 0 4px 8px 0 rgba(0, 0, 0, 0.15); (Shadow 섹션 헤더 포함)');
      console.log('생성 후: 완전히 삭제됨 (어느 보존 블록에도 포함 안 함, 위 GEN 블록에도 없음)');
    }

    // ── 비교 리포트: 현재 tokens.css 순수 Foundation(마커 없는 상태 기준) vs 생성될 값 ──
    const fEnd = css.split('\n').slice(0, 404).join('\n');
    const cutIdx = fEnd.split('\n').findIndex((l) => l.includes('semantic number (sizing'));
    const pureFoundationText = cutIdx !== -1 ? fEnd.split('\n').slice(0, cutIdx).join('\n') : fEnd;
    const cssVarRe = /--([a-zA-Z0-9\-]+)\s*:\s*([^;]+);/g;
    const currentVars = {};
    let cm;
    while ((cm = cssVarRe.exec(pureFoundationText))) currentVars[cm[1]] = cm[2].trim();

    let matchCount = 0, diffCount = 0;
    const diffs = [];
    for (const e of colorEntries) {
      const cssKey = colorCssName(e.key);
      if (cssKey in currentVars) {
        const norm = (s) => s.split('/*')[0].trim().toUpperCase();
        if (norm(currentVars[cssKey]) === e.val.toUpperCase()) matchCount++;
        else { diffCount++; diffs.push({ cssKey, current: currentVars[cssKey], generated: e.val }); }
      }
    }
    for (const e of numberEntries) {
      const cssKey = numberCssName(e.key);
      if (cssKey in currentVars) {
        const curNum = parseFloat((currentVars[cssKey].match(/-?[0-9.]+/) || [null])[0]);
        if (curNum === parseFloat(e.val)) matchCount++;
        else { diffCount++; diffs.push({ cssKey, current: currentVars[cssKey], generated: e.val }); }
      }
    }

    console.log('\n========== 현재 tokens.css와 비교 ==========');
    console.log(`일치: ${matchCount}개 (283개여야 정상)`);
    console.log(`값 다름: ${diffCount}개`);
    if (diffs.length) console.log(JSON.stringify(diffs, null, 2));
    console.log('\n[preview 전용 — tokens.css 파일은 전혀 수정하지 않았습니다]');
    return;
  }

  // ── 실제 적용 ──
  let newCss;
  if (hasMarkers) {
    newCss = css.replace(MARKER_RE, genBlock);
  } else {
    const { statusDarkBlock, letterSpacingBlock, semanticNumberBlock } = buildBootstrapManualSections(css);
    const genIdx = css.indexOf('/* >>> GEN:SEMANTIC >>>');
    if (genIdx === -1) throw new Error('GEN:SEMANTIC 마커를 못 찾음 — tokens.css 구조가 예상과 다름');
    const rest = css.slice(genIdx);
    newCss = `${genBlock}\n\n\n${statusDarkBlock}\n\n\n${letterSpacingBlock}\n\n\n${semanticNumberBlock}\n\n\n${rest}`;
  }
  fs.writeFileSync(TOKENS_CSS, newCss, 'utf-8');
  console.log(`✅ tokens.css Foundation 섹션 생성 완료 (Color ${colorEntries.length}개 + Number ${numberEntries.length}개)`);
}

main();
