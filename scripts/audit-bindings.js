#!/usr/bin/env node
/**
 * audit-bindings.js — 역방향(코드→Figma) 생성 코드 검수
 *
 * 사용자 지적(2026-06-11)으로 신설. 다음 두 규칙을 매 빌드 전에 강제한다:
 *
 *  [규칙 1] Variables 정본만 사용 (레거시 tokens.css 참조 금지)
 *    - build-components.ts 의 색/수치 바인딩 슬롯(color/…, spacing/…, radius/…,
 *      border-width/…, sizing/…, font-…)은 모두 vars-data.ts 에 실재하는
 *      네임스페이스여야 한다.
 *    - tokens.css 의 컴포넌트 토큰(--button-/--input-/--checkbox-/…)이나
 *      역할 토큰(--color-…, color/action·bg·surface·status 등 vars-data 미등록)
 *      참조는 위반.
 *
 *  [규칙 2] 플랫폼(PC/Mobile) 분리 레이아웃 (Button 스펙 기준)
 *    - comp.name 에 "Break=" 를 쓰는 빌더(플랫폼 구분 컴포넌트)는 반드시
 *      그룹형 스펙(buildGroupedSpec/decorateSetGrouped)을 사용해야 한다.
 *      평면(buildSpec/decorateSetFlat)만 쓰면 PC/Mobile 이 한 줄에 섞이므로 위반.
 *
 * 실행: node scripts/audit-bindings.js  (installer:build 가 빌드 전에 호출)
 * 위반 시 exit 1.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BC = path.join(ROOT, "plugins/figma-vars-installer/src/build-components.ts");
const VD = path.join(ROOT, "plugins/figma-vars-installer/src/vars-data.ts");

const bc = fs.readFileSync(BC, "utf8");
const vd = fs.readFileSync(VD, "utf8");

const violations = [];

// ── vars-data 에 존재하는 정본 네임스페이스 수집 ──
const validColorNs = new Set();
for (const m of vd.matchAll(/"color\/([a-z0-9-]+)\//g)) validColorNs.add(m[1]);
const validNumNs = new Set();
for (const m of vd.matchAll(/"(spacing|radius|border-width|sizing|font-size|font-weight|line-height)\//g)) validNumNs.add(m[1]);
// 단일 토큰(접두사 없는) — color/text, color/icon 등은 위 ns 에 포함됨

// 주석 줄 판별 (// , * , /* 로 시작)
const isComment = (line) => /^\s*(\/\/|\*|\/\*)/.test(line);

// ── [규칙 1a] 레거시 토큰/문자열 직접 참조 금지 (주석 제외) ──
const forbidden = [
  { re: /--color-[a-z]/g, label: "tokens.css 역할 토큰(--color-…)" },
  { re: /--(button|input|checkbox|radio|toggle|chip|select|dropdown)-/g, label: "tokens.css 컴포넌트 토큰(--…-)" },
  { re: /tokens\.css/g, label: "tokens.css 직접 참조" },
];
const codeLines = bc.split("\n").filter((l) => !isComment(l)).join("\n");
for (const f of forbidden) {
  const hits = codeLines.match(f.re);
  if (hits) violations.push(`[규칙1] 레거시 참조: ${f.label} (${[...new Set(hits)].join(", ")})`);
}

// ── [규칙 1b] build-components 의 color/<ns> 가 vars-data 정본 네임스페이스인지 ──
const usedColorNs = new Map(); // ns -> 예시 라인
bc.split("\n").forEach((line, i) => {
  // 주석 줄은 건너뜀
  if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
  for (const m of line.matchAll(/color\/([a-z0-9-]+)\//g)) {
    if (!usedColorNs.has(m[1])) usedColorNs.set(m[1], i + 1);
  }
});
for (const [ns, ln] of usedColorNs) {
  if (!validColorNs.has(ns)) {
    violations.push(`[규칙1] vars-data 미등록 color 네임스페이스 "color/${ns}/" (build-components.ts:${ln}) — 레거시/오타 의심`);
  }
}

// ── [규칙 1c] number 슬롯 네임스페이스 검사 ──
bc.split("\n").forEach((line, i) => {
  if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
  for (const m of line.matchAll(/"(spacing|radius|border-width|sizing|font-size|font-weight|line-height)\//g)) {
    if (!validNumNs.has(m[1])) {
      violations.push(`[규칙1] vars-data 미등록 number 네임스페이스 "${m[1]}/" (build-components.ts:${i + 1})`);
    }
  }
});

// ── [규칙 2] Break= 쓰는 빌더는 그룹형 스펙 사용 ──
// 빌더 함수 단위로 분해 (async function buildX … 다음 buildY 전까지)
const fnRe = /async function (build[A-Za-z0-9]+)\s*\(/g;
const fnStarts = [];
for (const m of bc.matchAll(fnRe)) fnStarts.push({ name: m[1], idx: m.index });
for (let i = 0; i < fnStarts.length; i++) {
  const start = fnStarts[i].idx;
  const end = i + 1 < fnStarts.length ? fnStarts[i + 1].idx : bc.length;
  const body = bc.slice(start, end);
  const name = fnStarts[i].name;
  if (name === "buildAllComponents") continue;
  // 세트+스펙을 만드는 빌더만 검사 (combineAsVariants 호출). buildOne 등 단일 variant 헬퍼는 제외.
  if (!/combineAsVariants\(/.test(body)) continue;
  const usesBreak = /Break=\$\{|Break=(PC|Mobile)/.test(body);
  if (!usesBreak) continue;
  const grouped = /buildGroupedSpec\(|decorateSetGrouped\(/.test(body);
  if (!grouped) {
    violations.push(`[규칙2] ${name}() 가 Break(PC/Mobile)를 쓰는데 그룹형 스펙을 안 씀 — PC/Mobile 이 섞임. buildGroupedSpec/decorateSetGrouped 사용 필요`);
  }
}

// ── 결과 ──
if (violations.length) {
  console.error("❌ audit-bindings 실패 — 레거시 참조 또는 플랫폼 레이아웃 위반:\n");
  for (const v of violations) console.error("  • " + v);
  console.error(`\n총 ${violations.length}건. 위반 해소 후 다시 빌드하세요.`);
  process.exit(1);
}
console.log(`✅ audit-bindings 통과 — color 네임스페이스 ${usedColorNs.size}종 모두 vars-data 정본, 레거시 참조 0, 플랫폼 레이아웃 규칙 준수`);
