#!/usr/bin/env node
'use strict';
/**
 * installer-tooltip-check.js  (Gate 6c — Installer Tooltip Freshness)
 * ─────────────────────────────────────────────────────────────────────────
 * 커밋된 설치기 zip 안 ui.html 의 "이번 업데이트" 툴팁·카드 4개 날짜가
 * **현재 소스로 재계산한 값과 같은지** 검사한다.
 *
 * 왜 필요한가:
 *   Gate 6b(installer-freshness)는 zip 안 code.js 에 토큰 **키**가 다 있는지만 본다.
 *   툴팁과 카드 날짜는 ui.html 에 있고, 키가 아니라 **문장**이라 6b 가 못 본다.
 *   → 소스를 고치고 installer:build 를 잊은 채 커밋하면, 사용자는 낡은 툴팁을 본다.
 *   실제로 이 유형이 반복됐다(BACKLOG.md '경로 지정 커밋에서 생성물 누락이 반복됨' 3건).
 *
 * dirty 처리 — **엄격하다(관대하지 않다)**:
 *   pre-commit 훅은 커밋 직전, 즉 워킹트리가 dirty 한 순간에 돈다. 여기서 dirty 를 봐주면
 *   정작 잡아야 할 순간에 게이트가 침묵한다. Gate 6b 도 dirty 를 봐주지 않는다.
 *   소스를 고쳤으면 커밋 전에 `npm run installer:build` 를 돌려야 한다 — 그게 이 게이트의 요구다.
 *
 * 사용: node scripts/installer-tooltip-check.js   (npm run installer:tooltipcheck)
 *       const { check } = require('./installer-tooltip-check')  // gate-check.js 편입
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ZIP = path.join(ROOT, 'assets/downloads/s1-ux-design-guide-installer.zip');
const ZIP_ENTRY = 's1-ux-design-guide-installer/ui.html';

/** zip 안 ui.html 을 꺼낸다. 실패는 조용히 넘기지 않는다. */
function readZipUi() {
  if (!fs.existsSync(ZIP)) {
    throw new Error('설치기 zip 없음 — npm run installer:build 필요');
  }
  let html;
  try {
    html = execSync(`unzip -p "${ZIP}" "${ZIP_ENTRY}"`, { encoding: 'utf-8', maxBuffer: 32 * 1024 * 1024 });
  } catch (e) {
    throw new Error(`설치기 zip 에서 ui.html 추출 실패: ${e.message}`);
  }
  if (!html || html.trim().length === 0) {
    throw new Error('zip 안 ui.html 이 비어 있습니다');
  }
  return html;
}

/**
 * 빌드된 ui.html 에서 툴팁 날짜·줄·카드 4날짜를 뽑는다.
 * 추출 실패는 전부 throw — "못 찾았으니 통과" 는 이 게이트가 존재하는 이유를 없앤다.
 */
function extract(html) {
  // 1) 툴팁 블록 — .update-tip 안쪽
  const tipM = html.match(/<span class="[^"]*update-tip"[\s\S]*?>([\s\S]*?)<span class="update-legend"/);
  if (!tipM) throw new Error('zip 안 ui.html 에서 툴팁 블록(.update-tip)을 찾지 못했습니다 — 마크업이 바뀌었거나 스탬프가 안 돌았습니다');
  const tipInner = tipM[1];

  // 2) 날짜 — 툴팁 첫 <b>…</b>
  const dateM = tipInner.match(/<b>\s*(\d{4}-\d{2}-\d{2})\s*<\/b>/);
  if (!dateM) throw new Error('툴팁에서 릴리스 날짜(<b>YYYY-MM-DD</b>)를 찾지 못했습니다');
  const date = dateM[1];

  // 3) 줄 — 날짜 뒤부터, <br> 로 나눔
  const after = tipInner.slice(tipInner.indexOf(dateM[0]) + dateM[0].length);
  const lines = after
    .split(/<br\s*\/?>/)
    .map((s) => s.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);
  if (lines.length === 0) throw new Error('툴팁에 변경 항목 줄이 하나도 없습니다(빈 툴팁) — 배포 불가');

  // 4) 카드 4개 날짜 — .select-date 의 <strong>
  const cards = [...html.matchAll(/<div class="select-date">[^<]*<strong>\s*([^<]+?)\s*<\/strong>/g)].map((m) => m[1]);
  if (cards.length !== 4) {
    throw new Error(`카드 날짜를 4개 찾아야 하는데 ${cards.length}개입니다 — ui.html 카드 구조가 바뀌었습니다`);
  }

  // 5) 미치환 플레이스홀더가 zip 에 들어갔는가(스탬프 누락)
  const leftover = html.match(/\{\{[A-Z_]+\}\}/g);
  if (leftover) {
    throw new Error(`zip 안 ui.html 에 치환되지 않은 플레이스홀더가 있습니다: ${[...new Set(leftover)].join(', ')}`);
  }

  return { date, lines, cards };
}

async function audit() {
  const zipHtml = readZipUi();
  const got = extract(zipHtml);

  // 현재 소스로 재계산 — 실패는 던진다(installer-update-notes 가 이미 그렇게 설계돼 있다).
  const { build } = require('./installer-update-notes');
  const want = await build();
  const wantCards = [want.dates.foundation, want.dates.semantic, want.dates.textStyles, want.dates.componentSet];

  const diffs = [];
  if (got.date !== want.date) {
    diffs.push(`릴리스 날짜: zip="${got.date}" ≠ 재계산="${want.date}"`);
  }
  if (got.lines.length !== want.lines.length) {
    diffs.push(`툴팁 줄 수: zip=${got.lines.length} ≠ 재계산=${want.lines.length}`);
  }
  const n = Math.max(got.lines.length, want.lines.length);
  for (let i = 0; i < n; i++) {
    const a = got.lines[i]; const b = want.lines[i];
    if (a !== b) diffs.push(`툴팁 ${i + 1}번째 줄:\n       zip   = ${a === undefined ? '(없음)' : a}\n       재계산 = ${b === undefined ? '(없음)' : b}`);
  }
  const CARD_NAMES = ['Foundation', 'Semantic', 'Text Styles', 'Component Set'];
  for (let i = 0; i < 4; i++) {
    if (got.cards[i] !== wantCards[i]) {
      diffs.push(`${CARD_NAMES[i]} 카드 날짜: zip="${got.cards[i]}" ≠ 재계산="${wantCards[i]}"`);
    }
  }

  return { diffs, got, want: { date: want.date, lines: want.lines, cards: wantCards } };
}

/** gate-check.js 편입용. 동기 인터페이스가 필요하므로 호출부가 await 한다. */
async function check({ pass, fail }) {
  let r;
  try {
    r = await audit();
  } catch (e) {
    fail(`${e.message}`);
    return;
  }
  if (r.diffs.length === 0) {
    pass(`설치기 zip 툴팁·카드날짜 = 소스 재계산값 일치 (${r.want.date} · ${r.want.lines.length}줄 · 카드 4)`);
    return;
  }
  fail(
    `설치기 zip 의 툴팁/카드날짜가 소스와 어긋납니다 — \`npm run installer:build\` 필요\n` +
    r.diffs.map((d) => `       · ${d}`).join('\n')
  );
}

module.exports = { check, audit };

if (require.main === module) {
  (async () => {
    let errors = 0;
    await check({
      pass: (m) => console.log(`  ✅ ${m}`),
      fail: (m) => { console.error(`  ❌ ${m}`); errors++; },
    });
    process.exit(errors > 0 ? 1 : 0);
  })();
}
