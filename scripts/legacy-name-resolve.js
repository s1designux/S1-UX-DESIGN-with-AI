#!/usr/bin/env node
/**
 * 레거시 이름 → 정본 이름 자동 붙이기 (조회기).
 *
 *   npm run legacy:resolve -- timepicker_input --state selected
 *   npm run legacy:resolve -- "A:pc_button" --state hover --size medium
 *   npm run legacy:resolve -- --all            # 레거시 세트 전부를 한 번에 붙여 본다
 *   npm run legacy:resolve -- --all --json     # 기계가 먹는 형태
 *
 * 판정 근거는 river 결정(crosswalk.json items[].machine)과 자동 추출표(legacy-component-map.json)뿐이다.
 * 결정이 없거나 정본에 대응이 없으면 그 사실을 그대로 말한다 — 이름을 지어내지 않는다.
 */
'use strict';
const { resolve, loadMap, parseRef } = require('./lib/legacy-name-map');

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const has = (name) => argv.includes(`--${name}`);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && flag(argv[i - 1].slice(2)) === a));

const LABEL = {
  matched: '붙음',
  partial: '세트는 붙음 · 이 축은 결정 전',
  ambiguous: '이름이 겹침 — A/B 를 밝혀 주세요',
  pattern: '배치 규칙(부품 아님)',
  'legacy-only': '레거시에만 있음',
  undecided: '결정 전',
  'no-canon': '정본에 대응 없음',
  unknown: '모름',
};

function one(ref, opts) {
  const { source, set } = parseRef(ref);
  const r = resolve({ set, source, setId: opts.setId, state: opts.state, size: opts.size, variant: opts.variant });
  return { legacy: ref, ...r };
}

function printOne(r) {
  const axes = Object.entries(r.axes || {}).map(([k, v]) => `${k}=${v}`).join(' · ');
  console.log(`\n  ${r.legacy}`);
  if (r.status === 'matched') console.log(`  → ${r.canonSets.join(' + ')}${axes ? `  (${axes})` : ''}`);
  else if (r.status === 'partial') console.log(`  → ${r.canonSets.join(' + ')}${axes ? `  (${axes})` : ''}  ⚠ ${LABEL.partial}`);
  else console.log(`  → ${LABEL[r.status] || r.status}`);
  for (const u of r.unmapped || []) console.log(`     ⚠ ${u.asked} — ${u.why}`);
  if (r.status === 'ambiguous') for (const c of r.candidates || []) console.log(`     · ${c}`);
  if (r.status !== 'matched' && r.status !== 'partial' && r.why) console.log(`     ${r.why}`);
  if (r.decisionNote) console.log(`     메모(${(r.basis && r.basis[0]) || '출처'}): ${r.decisionNote}`);
  if (r.basis && r.basis.length) console.log(`     근거: ${r.basis.join(' · ')}`);
}

(function main() {
  const opts = { state: flag('state'), size: flag('size'), variant: flag('variant'), setId: flag('id') };

  if (has('all')) {
    const { entries } = loadMap();
    const rows = entries.map((e) => one(`${e.source}:${e.set}`, opts));
    if (has('json')) { console.log(JSON.stringify(rows, null, 2)); return; }
    const tally = rows.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {});
    console.log('레거시 세트 전체 자동 대조');
    for (const r of rows) printOne(r);
    console.log('\n─────────────');
    console.log(Object.entries(tally).map(([k, v]) => `${LABEL[k]} ${v}`).join(' · ') + ` (합계 ${rows.length})`);
    return;
  }

  if (!positional.length) {
    console.log('쓰는 법: npm run legacy:resolve -- "<A|B>:<레거시 세트 이름>" [--state x] [--size y] [--variant z] [--id 540:3690]');
    console.log('        npm run legacy:resolve -- --all [--json]');
    process.exit(1);
  }
  const rows = positional.map((p) => one(p, opts));
  if (has('json')) { console.log(JSON.stringify(rows.length === 1 ? rows[0] : rows, null, 2)); return; }
  rows.forEach(printOne);
  console.log('');
})();
