#!/usr/bin/env node
/**
 * figma-snapshot-diff.js — Figma 구조 스냅샷 전/후 대조
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 무엇을 푸는가: "빌더가 의도한 것만 바꿨나"를 **전수 재스캔 없이** 판정한다.
 *
 *   종전: 검증자가 변경 후 상태를 처음부터 전부 읽어 기준선(기억·옛 보고서)과 대조 →
 *         비싸고(2026-08-24 사례 128K 토큰), 그러고도 "변경 전 스냅샷이 없어 부수 피해
 *         0 은 이미지 비교가 아니라 기하값+육안으로 판정"이라는 사각지대가 남았다.
 *   지금: 빌드 **전** 과 **후** 에 같은 코드로 스냅샷을 뜨고, 이 스크립트가 diff 를 낸다.
 *         검증자는 "diff 가 의도한 변경만 담고 있나"만 보면 된다. O(전체 노드) → O(diff).
 *
 * ★ 이건 검증을 줄이는 게 아니라 늘린다: 기준선이 생기므로 "아무것도 안 건드렸다"를
 *   처음으로 **증명**할 수 있다(종전엔 주장만 가능했다).
 *
 * 사용:
 *   node scripts/figma-snapshot-diff.js <before.json> <after.json> [--expect <expect.json>] [--json]
 *
 * 스냅샷 뜨는 법(use_figma 코드 템플릿)  → .claude/skills/screen-rebuild/references/snapshot-diff.md
 *
 * 기대 선언(expect.json) — 선언한 변경만 허용하고 나머지는 위반으로 본다:
 *   {
 *     "added":   [{ "name": "sep", "type": "RECTANGLE", "count": 22 }],
 *     "removed": [],
 *     "changed": [{ "field": "is", "count": 11, "note": "itemSpacing 16→8" }]
 *   }
 *
 * 종료코드: 0 = diff 가 기대와 정확히 일치(또는 --expect 없이 단순 보고) · 1 = 미선언 변경 있음 · 2 = 입력 오류
 */
const fs = require('fs');
const path = require('path');

// 스냅샷 필드 사람이름 (보고 출력용)
const FIELD_LABEL = {
  n: '이름', t: '타입', p: '부모', i: '자식순서',
  x: 'x', y: 'y', w: '너비', h: '높이',
  lm: 'layoutMode', is: 'itemSpacing', lp: 'layoutPositioning',
  f: '채움(색)', tx: '문구', ts: '텍스트스타일', fn: '폰트', mc: '컴포넌트출처',
};

function die(msg, code = 2) { console.error(`❌ ${msg}`); process.exit(code); }

function loadSnapshot(p, which) {
  if (!fs.existsSync(p)) die(`${which} 스냅샷 없음: ${p}`);
  let j;
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { die(`${which} 스냅샷 JSON 파싱 실패: ${e.message}`); }
  if (!j || typeof j.nodes !== 'object' || j.nodes === null) die(`${which} 스냅샷에 nodes 객체가 없음: ${p}`);
  return j;
}

function diffSnapshots(before, after) {
  const B = before.nodes, A = after.nodes;
  const added = [], removed = [], changed = [];

  for (const id of Object.keys(A)) if (!(id in B)) added.push({ id, node: A[id] });
  for (const id of Object.keys(B)) if (!(id in A)) removed.push({ id, node: B[id] });

  for (const id of Object.keys(A)) {
    if (!(id in B)) continue;
    const b = B[id], a = A[id];
    const fields = new Set([...Object.keys(b), ...Object.keys(a)]);
    for (const f of fields) {
      const bv = b[f], av = a[f];
      if (JSON.stringify(bv) === JSON.stringify(av)) continue;
      changed.push({ id, field: f, from: bv, to: av, name: a.n ?? b.n, type: a.t ?? b.t });
    }
  }
  return { added, removed, changed };
}

// 사람이 읽고 기대와 대조할 수 있게 묶는다
function groupDiff(d) {
  const g = (arr, keyFn) => {
    const m = new Map();
    for (const it of arr) {
      const k = keyFn(it);
      if (!m.has(k)) m.set(k, { key: k, count: 0, items: [] });
      const e = m.get(k); e.count++; if (e.items.length < 5) e.items.push(it);
    }
    return [...m.values()].sort((x, y) => y.count - x.count);
  };
  return {
    added: g(d.added, (it) => `${it.node.t}|${it.node.n}`),
    removed: g(d.removed, (it) => `${it.node.t}|${it.node.n}`),
    changed: g(d.changed, (it) => it.field),
  };
}

// 기대 선언과 대조 — 선언되지 않았거나 개수가 다른 그룹은 전부 위반
function checkExpect(grouped, expect) {
  const violations = [];
  const consume = (kind, groups, decls) => {
    const left = (decls || []).map((d) => ({ ...d, used: false }));
    for (const grp of groups) {
      const [type, name] = grp.key.includes('|') ? grp.key.split('|') : [null, null];
      const match = left.find((d) => !d.used && (
        kind === 'changed'
          ? d.field === grp.key
          : (d.name === undefined || d.name === name) && (d.type === undefined || d.type === type)
      ));
      if (!match) { violations.push({ kind, key: grp.key, count: grp.count, why: '기대 선언에 없음' }); continue; }
      match.used = true;
      if (match.count !== undefined && match.count !== grp.count) {
        violations.push({ kind, key: grp.key, count: grp.count, why: `개수 불일치 — 선언 ${match.count} / 실제 ${grp.count}` });
      }
    }
    for (const d of left) {
      if (!d.used) violations.push({ kind, key: d.field || `${d.type || '*'}|${d.name || '*'}`, count: 0, why: `선언했으나 실제 변경 없음(선언 ${d.count ?? '?'})` });
    }
  };
  consume('added', grouped.added, expect.added);
  consume('removed', grouped.removed, expect.removed);
  consume('changed', grouped.changed, expect.changed);
  return violations;
}

function fmtVal(v) {
  if (v === undefined) return '(없음)';
  if (typeof v === 'string' && v.length > 40) return JSON.stringify(v.slice(0, 40) + '…');
  return JSON.stringify(v);
}

function main() {
  const argv = process.argv.slice(2);
  const pos = argv.filter((a) => !a.startsWith('--'));
  if (pos.length < 2) die('사용: node scripts/figma-snapshot-diff.js <before.json> <after.json> [--expect <expect.json>] [--json]');

  const before = loadSnapshot(pos[0], '변경 전');
  const after = loadSnapshot(pos[1], '변경 후');

  if (before.meta && after.meta && before.meta.rootId && after.meta.rootId
      && before.meta.rootId !== after.meta.rootId) {
    die(`두 스냅샷의 루트가 다름 — before=${before.meta.rootId} / after=${after.meta.rootId}`);
  }

  const d = diffSnapshots(before, after);
  const grouped = groupDiff(d);

  const ei = argv.indexOf('--expect');
  const expectPath = ei >= 0 ? (argv[ei + 1] || pos[2]) : null;
  let expect = null;
  if (expectPath) {
    if (!fs.existsSync(expectPath)) die(`기대 선언 파일 없음: ${expectPath}`);
    try { expect = JSON.parse(fs.readFileSync(expectPath, 'utf8')); } catch (e) { die(`기대 선언 JSON 파싱 실패: ${e.message}`); }
  }
  const violations = expect ? checkExpect(grouped, expect) : null;

  if (argv.includes('--json')) {
    console.log(JSON.stringify({ summary: { added: d.added.length, removed: d.removed.length, changed: d.changed.length }, grouped, violations }, null, 2));
    process.exit(violations && violations.length ? 1 : 0);
  }

  const rootId = (after.meta && after.meta.rootId) || '(미상)';
  console.log('🔎 Figma 구조 스냅샷 대조 (Snapshot Diff)');
  console.log(`  루트 ${rootId} · 노드 ${Object.keys(before.nodes).length} → ${Object.keys(after.nodes).length}`);
  console.log(`  추가 ${d.added.length} · 삭제 ${d.removed.length} · 변경 ${d.changed.length}`);

  const show = (title, groups, isChanged) => {
    if (!groups.length) return;
    console.log(`\n  ${title}`);
    for (const g of groups) {
      if (isChanged) {
        console.log(`     - ${FIELD_LABEL[g.key] || g.key} : ${g.count}건`);
        for (const it of g.items) console.log(`         ${it.id} (${it.name}) ${fmtVal(it.from)} → ${fmtVal(it.to)}`);
        if (g.count > g.items.length) console.log(`         … 외 ${g.count - g.items.length}건`);
      } else {
        const [t, n] = g.key.split('|');
        console.log(`     - ${n} (${t}) : ${g.count}개`);
        console.log(`         ${g.items.map((i) => i.id).join(', ')}${g.count > g.items.length ? ` … 외 ${g.count - g.items.length}` : ''}`);
      }
    }
  };
  show('➕ 추가된 노드', grouped.added, false);
  show('➖ 삭제된 노드', grouped.removed, false);
  show('✏️ 변경된 속성', grouped.changed, true);

  if (!expect) {
    console.log('\n  ℹ️ 기대 선언(--expect) 없이 실행 — 보고만 하고 판정하지 않는다.');
    console.log(`SNAPDIFF_SUMMARY added=${d.added.length} removed=${d.removed.length} changed=${d.changed.length} violations=- `);
    return process.exit(0);
  }

  if (violations.length) {
    console.log('\n  ❌ 의도하지 않은 변경 (기대 선언과 불일치):');
    for (const v of violations) console.log(`     - [${v.kind}] ${FIELD_LABEL[v.key] || v.key} — ${v.why}`);
  } else {
    console.log('\n  ✅ diff 가 기대 선언과 정확히 일치 — 선언 밖 변경 0건 (부수 피해 없음이 증명됨)');
  }
  console.log(`SNAPDIFF_SUMMARY added=${d.added.length} removed=${d.removed.length} changed=${d.changed.length} violations=${violations.length}`);
  process.exit(violations.length ? 1 : 0);
}

main();
