#!/usr/bin/env node
/**
 * screen-naming-check.js  (Gate 42 — 화면 프레임 네이밍)
 * ─────────────────────────────────────────────────────────────────────────
 * 화면 패턴 프레임 이름이 정본 규칙을 지키는지 기계로 검사한다.
 *
 * 왜 필요했나 (2026-08-25):
 *   모바일 로그인 11개 프레임이 없어진 기획서 목차 번호(`2.1 로그인_1 최초진입`)를
 *   그대로 달고 있었다. 삭제된 상태 때문에 번호에 구멍이 났고, 이름과 내용이 어긋난 것도
 *   있었다('자동 로그인 선택 B' = 실제로는 설정 완료 안내). screen-rebuild 워크플로우가
 *   문구·색·구조는 전수 대조하면서 '이름'은 대조 항목에 없던 것이 원인.
 *
 * 무엇을 보나 / 못 보나 (정직 표기):
 *   · 본다   : registry/patterns/{id}/states.md 의 '프레임 이름' 열 — 서식·흐름코드 문법·
 *              분기가 실재하는 기본 흐름 단계에서 갈라지는지·중복·선언된 화면 수
 *   · 못 본다: Figma 파일 안의 실제 프레임 이름. 커밋 훅은 저장소만 읽으므로 MCP 연결이 필요한
 *              실물 스캔은 여기서 못 한다. 문서↔실물 일치는 화면 작업 시 component-verifier 소관.
 *              → 이 게이트가 지키는 것은 "기준표가 항상 올바른 이름을 담는다"이고,
 *                screen-rebuilder 는 그 표의 이름을 그대로 쓰도록 배선돼 있다.
 *
 * 대상: 정책의 adopted[] 에 등재된 패턴만(래칫 — 미채택 패턴은 건드리지 않는다).
 * 출력 끝줄: `SCRNAMING_SUMMARY patterns=<n> names=<n> bad=<n>`
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const POLICY = path.join(ROOT, 'registry/governance/screen-naming-policy.json');

if (!fs.existsSync(POLICY)) {
  console.log('SCRNAMING_SUMMARY patterns=0 names=0 bad=0');
  console.log('  정책 파일 없음 — 검사 대상 없음');
  process.exit(0);
}

const policy = JSON.parse(fs.readFileSync(POLICY, 'utf8'));
const nameRe = new RegExp(policy.nameRegex);
const mainRe = new RegExp(policy.segments.flowCode.main.pattern);
const branchRe = new RegExp(policy.segments.flowCode.branch.pattern);
const sn = policy.sectionNaming || {};
const sectionCommonRe = sn.commonRegex ? new RegExp(sn.commonRegex) : null;
const sectionServiceRe = sn.serviceRegex ? new RegExp(sn.serviceRegex) : null;

/** states.md 에서 '프레임 이름' 열만 뽑는다(산문 오탐 방지 — 표 헤더로 열 위치를 찾는다). */
function extractFrameNames(md) {
  const lines = md.split('\n');
  const names = [];
  let col = -1;
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith('|')) { col = -1; continue; }
    const cells = t.split('|').slice(1, -1).map((c) => c.trim());
    if (col === -1) {
      const idx = cells.findIndex((c) => c.replace(/\s/g, '') === '프레임이름');
      if (idx >= 0) col = idx;
      continue;
    }
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue; // 구분선
    const cell = cells[col];
    if (!cell) continue;
    const m = cell.match(/^`(.+)`$/);
    names.push({ raw: cell, name: m ? m[1] : null });
  }
  return names;
}

const problems = [];
let totalNames = 0;
const perPattern = [];

for (const adopted of policy.adopted || []) {
  const statesPath = path.join(ROOT, 'registry/patterns', adopted.patternId, 'states.md');
  if (!fs.existsSync(statesPath)) {
    problems.push(`${adopted.patternId}: states.md 없음 (${path.relative(ROOT, statesPath)})`);
    continue;
  }
  const rows = extractFrameNames(fs.readFileSync(statesPath, 'utf8'));
  if (!rows.length) {
    problems.push(`${adopted.patternId}: states.md 에 '프레임 이름' 열이 없음 — 정책 adopted 에 있는데 기준표가 이름을 안 담고 있다`);
    continue;
  }

  const seen = new Map();
  const mainCodes = new Set();
  const codes = [];

  for (const r of rows) {
    totalNames++;
    if (!r.name) {
      problems.push(`${adopted.patternId}: 프레임 이름이 백틱 코드로 적혀 있지 않음 — ${r.raw}`);
      continue;
    }
    if (!nameRe.test(r.name)) {
      problems.push(`${adopted.patternId}: 서식 위반 — \`${r.name}\` (기대: ${policy.format})`);
      continue;
    }
    if (seen.has(r.name)) problems.push(`${adopted.patternId}: 이름 중복 — \`${r.name}\``);
    seen.set(r.name, true);

    const code = r.name.split('/')[2].split(' ')[0];
    // 흐름 코드는 패턴 안에서 유일해야 한다. 전체 이름만 비교하면 상태명이 달라 통과해 버린다
    // (자가 시험에서 실제로 새던 구멍 — 같은 `4c1` 두 개가 안 잡혔다).
    const codeKey = r.name.split(' ')[0];
    if (seen.has('code:' + codeKey)) {
      problems.push(`${adopted.patternId}: 흐름 코드 중복 — \`${codeKey}\` 가 두 화면에 붙어 있음 (\`${r.name}\`)`);
    }
    seen.set('code:' + codeKey, true);
    codes.push({ code, name: r.name });
    if (mainRe.test(code)) mainCodes.add(code);
  }

  // 분기는 실재하는 기본 흐름 단계에서 갈라져야 한다 (4a1 은 4 가 있어야 성립)
  for (const c of codes) {
    if (!branchRe.test(c.code)) continue;
    const parent = c.code.match(/^([1-9][0-9]*)/)[1];
    if (!mainCodes.has(parent)) {
      problems.push(`${adopted.patternId}: 분기 \`${c.code}\` 가 갈라져 나올 기본 흐름 \`${parent}\` 이 없음 — \`${c.name}\``);
    }
  }

  if (typeof adopted.screens === 'number' && rows.length !== adopted.screens) {
    problems.push(`${adopted.patternId}: 화면 수가 정책 선언과 다름 — states.md ${rows.length}개 / 정책 adopted.screens ${adopted.screens}개`);
  }

  // 섹션 이름 검사 — adopted 에 sectionName 이 선언된 경우만
  if (adopted.sectionName) {
    const valid = (sectionCommonRe && sectionCommonRe.test(adopted.sectionName)) ||
                  (sectionServiceRe && sectionServiceRe.test(adopted.sectionName));
    if (!valid) {
      problems.push(`${adopted.patternId}: 섹션 이름 서식 위반 — "${adopted.sectionName}" (기대: ${sn.commonFormat || '?'} 또는 ${sn.serviceFormat || '?'})`);
    }
  }

  perPattern.push({ id: adopted.patternId, names: rows.length, main: mainCodes.size, branch: codes.length - mainCodes.size });
}

for (const p of perPattern) {
  console.log(`  ${p.id} — 프레임 ${p.names}개 (기본 흐름 ${p.main} · 분기 ${p.branch})`);
}
for (const p of problems) console.log(`  ❌ ${p}`);

console.log(`SCRNAMING_SUMMARY patterns=${perPattern.length} names=${totalNames} bad=${problems.length}`);
process.exit(0);
