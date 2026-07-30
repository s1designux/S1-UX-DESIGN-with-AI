#!/usr/bin/env node
'use strict';
/**
 * installer-update-notes.js — 설치기 UI 의 "이번 업데이트" 툴팁과 카드 4개 날짜를 자동 생성한다.
 * ─────────────────────────────────────────────────────────────────────────
 * 사람이 손으로 쓰지 않는다. 두 시점의 "Figma 표출 정보 지문"을 빼서 문장을 만든다.
 *
 *   앵커(직전 릴리스) 지문  ──diff──▶  현재 지문  ──문장규칙──▶  툴팁 줄
 *
 * 문면 규칙: 컴포넌트는 세트 이름 그대로(디자이너가 Figma 에서 보는 이름),
 *   토큰은 raw 키 그대로(종전 손글씨 툴팁도 그랬다), 속성어만 고정 사전 6개.
 *   → 한국어 사전이 저장소에 없고, 만들면 새 값 사본 + 토큰마다 손 개입이 되살아난다.
 *
 * 사용:
 *   node scripts/installer-update-notes.js            # 사람이 읽는 출력
 *   node scripts/installer-update-notes.js --json     # 기계 판독용
 *   node scripts/installer-update-notes.js --check    # 2회 실행 결과 동일한지(결정론) 검사
 *   const { build } = require('./installer-update-notes')
 */
const path = require('path');
const { fingerprint, ROW_SEP } = require('./lib/installer-fingerprint');
const H = require('./lib/installer-history');

const SRC_DIR = path.join(H.ROOT, 'plugins/figma-vars-installer/src');

/** 속성 → 사람 말. 고정 6개 + 부속. 토큰이 늘어도 이 사전은 자라지 않는다. */
const PROP_WORD = {
  effects: '그림자',
  strokes: '보더', strokeWeight: '보더 두께', strokeAlign: '보더',
  strokeTopWeight: '보더 두께', strokeRightWeight: '보더 두께',
  strokeBottomWeight: '보더 두께', strokeLeftWeight: '보더 두께',
  fills: '색',
  cornerRadius: '모서리', topLeftRadius: '모서리', topRightRadius: '모서리',
  bottomLeftRadius: '모서리', bottomRightRadius: '모서리',
  characters: '문구', fontSize: '글자 크기', fontName: '폰트',
  itemSpacing: '간격', paddingTop: '여백', paddingRight: '여백',
  paddingBottom: '여백', paddingLeft: '여백', minWidth: '최소 폭',
  visible: '표시', rotation: '회전',
};

const MAX_LINES = 5;

/** 행 문자열("세트|이름|타입|k=v;k=v") → {owner, ident, type, props:Map} */
function parseRow(row) {
  const [owner, ident, type, kv] = row.split(ROW_SEP);
  const props = new Map();
  for (const pair of (kv || '').split(';')) {
    if (!pair) continue;
    const i = pair.indexOf('=');
    if (i < 0) continue;
    props.set(pair.slice(0, i), pair.slice(i + 1));
  }
  return { owner, ident, type, props };
}

/** 토큰 diff → {added[], removed[], changed[{key, from, to}]} */
function diffTokens(oldT, newT) {
  const added = Object.keys(newT).filter((k) => !(k in oldT)).sort();
  const removed = Object.keys(oldT).filter((k) => !(k in newT)).sort();
  const changed = Object.keys(newT)
    .filter((k) => k in oldT && oldT[k] !== newT[k])
    .sort()
    .map((k) => ({ key: k, from: oldT[k], to: newT[k] }));
  return { added, removed, changed };
}

/**
 * 컴포넌트 시각 사양 diff → 세트별 변경 속성.
 * 행 단위로 빼면 "같은 노드의 속성 하나가 바뀐 것"과 "노드가 새로 생긴 것"이 섞이므로,
 * (세트, 이름, 타입) 을 키로 묶어 속성 차이를 본다.
 */
function diffSpec(oldSpec, newSpec) {
  const index = (rows) => {
    const m = new Map();
    for (const r of rows) {
      const p = parseRow(r);
      m.set([p.owner, p.ident, p.type].join(ROW_SEP), p);
    }
    return m;
  };
  const A = index(oldSpec);
  const B = index(newSpec);
  const bySet = new Map(); // 세트 이름 → Set<속성어>

  const note = (owner, word) => {
    const key = owner || '(세트 밖)';
    if (!bySet.has(key)) bySet.set(key, new Set());
    bySet.get(key).add(word);
  };

  for (const [k, bp] of B) {
    const ap = A.get(k);
    if (!ap) {
      // 새 노드 — 시각 속성 중 의미 있는 것만 집계(전부 나열하면 노이즈)
      for (const p of bp.props.keys()) if (PROP_WORD[p]) note(bp.owner, PROP_WORD[p]);
      continue;
    }
    for (const [p, v] of bp.props) {
      if (!PROP_WORD[p]) continue;
      if (ap.props.get(p) !== v) note(bp.owner, PROP_WORD[p]);
    }
    for (const [p] of ap.props) {
      if (!PROP_WORD[p]) continue;
      if (!bp.props.has(p)) note(bp.owner, PROP_WORD[p]);
    }
  }
  return bySet;
}

/** 토큰 키의 그룹(최상위 세그먼트 또는 color/<2단계>) */
function tokenGroup(key) {
  const seg = key.split('/');
  if (seg[0] === 'color' && seg.length > 1) return `color/${seg[1]}`;
  if (seg[0] === 'textstyle') return 'textstyle';
  return seg[0];
}

/**
 * 속성어 흡수 — 더 구체적인 말이 더 일반적인 말에 먹힌다.
 * "보더 · 보더 두께" 처럼 같은 것을 두 번 말하지 않게. (strokes 와 strokeWeight 가 함께 바뀌는 게 정상)
 */
const SUBSUME = { '보더': ['보더 두께'], '색': [], '그림자': [] };
function subsume(words) {
  const set = new Set(words);
  for (const [keep, drop] of Object.entries(SUBSUME)) {
    if (!set.has(keep)) continue;
    for (const d of drop) set.delete(d);
  }
  return [...set].sort();
}

/** diff → 툴팁 줄 배열 */
function composeLines(tokenDiff, specBySet) {
  const lines = [];

  // 신설 토큰: 같은 그룹 3건 이상이면 묶는다.
  const addedByGroup = new Map();
  for (const k of tokenDiff.added) {
    const g = tokenGroup(k);
    if (!addedByGroup.has(g)) addedByGroup.set(g, []);
    addedByGroup.get(g).push(k);
  }
  // 묶인 줄(3건 이상)을 먼저, 낱개를 뒤에 — 읽는 사람이 큰 덩어리부터 본다.
  const grouped = [...addedByGroup].filter(([, k]) => k.length >= 3).sort();
  const singles = [...addedByGroup].filter(([, k]) => k.length < 3).sort();
  for (const [g, keys] of grouped) {
    const tails = keys.map((k) => k.slice(g.length + 1)).sort().join(' · ');
    lines.push({ kind: 'add', text: `+ ${g}/* 토큰 ${keys.length}종 (${tails})` });
  }
  for (const [, keys] of singles) {
    for (const k of keys) lines.push({ kind: 'add', text: `+ ${k}` });
  }

  // 컴포넌트 시각 사양 — 세트 이름 + 바뀐 속성어.
  //   같은 속성 조합으로 바뀐 세트는 한 줄로 묶는다("Bottom Sheet · Dropdown 그림자").
  //   줄 수를 아끼려는 게 아니라, 그게 사람이 쓰던 방식이다.
  const byWords = new Map();
  for (const [setName, words] of specBySet) {
    if (setName === '(세트 밖)') continue;   // 스펙 프레임 등 부속 노드는 표시하지 않는다
    const w = subsume(words);
    if (w.length === 0) continue;
    const key = w.join(' · ');
    if (!byWords.has(key)) byWords.set(key, []);
    byWords.get(key).push(setName);
  }
  for (const [w, sets] of [...byWords].sort()) {
    lines.push({ kind: 'add', text: `+ ${sets.sort().join(' · ')} ${w}` });
  }

  // 값 변경
  for (const c of tokenDiff.changed) {
    let what = '값 변경';
    try {
      const a = JSON.parse(c.from); const b = JSON.parse(c.to);
      if (a && b && typeof a === 'object') {
        const lightDiff = a.light !== b.light;
        const darkDiff = a.dark !== b.dark;
        if (lightDiff && !darkDiff) what = '라이트 값 변경';
        else if (darkDiff && !lightDiff) what = '다크 값 변경';
      }
    } catch (_) { /* 문자열 값 — 기본 문구 */ }
    lines.push({ kind: 'chg', text: `~ ${c.key} ${what}` });
  }

  // 폐기
  for (const k of tokenDiff.removed) lines.push({ kind: 'del', text: `- ${k} (폐기)` });

  // 정렬: 신설 → 변경 → 폐기 (각 구간은 위에서 이미 결정론적으로 쌓임)
  const order = { add: 0, chg: 1, del: 2 };
  lines.sort((a, b) => order[a.kind] - order[b.kind]);

  if (lines.length > MAX_LINES) {
    const head = lines.slice(0, MAX_LINES).map((l) => l.text);
    head.push(`외 ${lines.length - MAX_LINES}건`);
    return head;
  }
  return lines.map((l) => l.text);
}

async function build() {
  const cur = await fingerprint(SRC_DIR);
  const anchor = await H.resolveAnchor(cur);

  let lines;
  if (!anchor.anchorFp) {
    // 히스토리에 다른 지문이 없다 = 최초 도입. 조용히 빈 툴팁을 내보내지 않는다.
    throw new Error('[update-notes] 비교할 이전 지문을 찾지 못했습니다(히스토리 전체가 현재와 동일). 중단.');
  } else {
    const td = diffTokens(anchor.anchorFp.tokens, cur.tokens);
    const sd = diffSpec(anchor.anchorFp.spec, cur.spec);
    lines = composeLines(td, sd);
  }

  if (lines.length === 0) {
    throw new Error(
      `[update-notes] 변경 0건인데 앵커(${(anchor.anchorSha || '').slice(0, 7)})의 지문은 현재와 다릅니다 — ` +
      '문장 규칙이 diff 를 놓치고 있습니다. 중단.'
    );
  }

  const dates = {
    foundation: await H.lastChangeDate(cur, (k) => /^(gray|gray-dark|blue|blue-dark|red|red-dark|orange|orange-dark|yellow|yellow-dark|green|green-dark|skyblue|skyblue-dark|purple|purple-dark|brown|brown-dark|visual-gray|visual-gray-dark|base|brand)\//.test(k) || /^(spacing|radius|sizing|border-width|font-size|font-weight|line-height|opacity|letter-spacing|breakpoint)\/[0-9a-z]/.test(k)),
    semantic: await H.lastChangeDate(cur, (k) => k.startsWith('color/') || k.startsWith('shadow/') || /^(spacing|radius)\/[a-z-]+\//.test(k)),
    textStyles: await H.lastChangeDate(cur, (k) => k.startsWith('textstyle/')),
    componentSet: await H.lastSpecChangeDate(cur),
  };

  return {
    date: anchor.releaseDate,
    lines,
    dates,
    anchor: { sha: anchor.anchorSha, landed: anchor.landedSha, walked: anchor.walked, dirty: anchor.dirty },
    stats: cur.stats,
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const r = await build();

  if (argv.includes('--check')) {
    const again = await build();
    const same = JSON.stringify(r.lines) === JSON.stringify(again.lines) &&
                 r.date === again.date && JSON.stringify(r.dates) === JSON.stringify(again.dates);
    console.log(same ? '✅ 결정론 OK — 2회 실행 결과 동일' : '❌ 결정론 실패 — 실행마다 결과가 다릅니다');
    process.exit(same ? 0 : 1);
  }
  if (argv.includes('--json')) {
    console.log(JSON.stringify(r, null, 2));
    return;
  }

  console.log('\n[이번 업데이트] 자동 생성 결과');
  console.log(`  앵커 : ${(r.anchor.sha || '').slice(0, 7)} (커밋 ${r.anchor.walked}개 탐색${r.anchor.dirty ? ' · 워킹트리 더티' : ''})`);
  console.log(`  날짜 : ${r.date}\n`);
  for (const l of r.lines) console.log('  ' + l);
  console.log('\n[카드 날짜]');
  console.log(`  Foundation    ${r.dates.foundation}`);
  console.log(`  Semantic      ${r.dates.semantic}`);
  console.log(`  Text Styles   ${r.dates.textStyles}`);
  console.log(`  Component Set ${r.dates.componentSet}`);
  console.log(`\n  (지문: 노드 ${r.stats.nodes} · 세트 ${r.stats.sets} · 토큰 ${r.stats.tokens})\n`);
}

module.exports = { build, diffTokens, diffSpec, composeLines };

if (require.main === module) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
