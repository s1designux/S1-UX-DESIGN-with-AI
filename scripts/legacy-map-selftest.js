#!/usr/bin/env node
/**
 * Gate 52 적대 시험 — 옛 결함 3종을 임시 사본에 되살려 **검사기가 실제로 잡는지** 확인한다.
 * 잡지 못하면 그물에 구멍이 난 것이므로 실패로 보고한다(Gate 51 과 같은 방침).
 *
 *   npm run legacy:selftest
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CW = 'reports/legacy-crosswalk-board/crosswalk.json';
const MP = 'registry/governance/legacy-component-map.json';

const CASES = [
  {
    name: '정본에 없는 이름을 결정에 적었다',
    mutate: (cw) => { const it = cw.items.find((i) => i.machine && i.machine.canonSet); it.machine.canonSet = '있지도 않은 세트'; },
    expect: /정본에 없는 세트 이름/,
  },
  {
    name: '닫힌 결정에서 기계가 읽는 칸이 사라졌다',
    mutate: (cw) => { const it = cw.items.find((i) => i.machine); delete it.machine; },
    expect: /기계가 읽는 칸\(machine\)이 없습니다/,
  },
  {
    name: '자동추출 줄이 정본에 없는 축 값을 답으로 낸다(새로 생긴 것)',
    mutate: (_cw, mp) => {
      const list = (mp.components && mp.components.button) || [];
      const e = list[0];
      e.confidence = 'high';
      e.stateMap = { ...(e.stateMap || {}), 'selftest-새값': '있지도않은상태' };
    },
    expect: /정본 축 값에 없습니다/,
  },
  {
    name: '같은 이름 줄이 하나 더 있을 때, 이미 동결된 칸으로 들어오는 새 어긋남',
    mutate: (_cw, mp) => {
      const list = (mp.components && mp.components.radio) || [];
      const src = list.find((e) => e.set === 'radio') || list[0];
      const twin = JSON.parse(JSON.stringify(src));
      twin.setId = '000:000';
      twin.confidence = 'high';
      twin.stateMap = { ...(twin.stateMap || {}), 'disabled-checked': '아무도모르는없는값ZZZ' };
      list.push(twin);
    },
    expect: /정본 축 값에 없습니다/,
  },
  {
    name: '표를 손으로 고쳤다(결정과 어긋남)',
    mutate: (_cw, mp) => { const e = (mp.unmatched || [])[0]; e.confidence = 'decide'; e.stateMap = { 손편집: '아무거나' }; },
    expect: /반영되지 않았습니다/,
  },
];

let failed = 0;
for (const c of CASES) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's1-legacy-selftest-'));
  const cw = JSON.parse(fs.readFileSync(path.join(ROOT, CW), 'utf8'));
  const mp = JSON.parse(fs.readFileSync(path.join(ROOT, MP), 'utf8'));
  c.mutate(cw, mp);
  const cwPath = path.join(dir, 'crosswalk.json');
  const mpPath = path.join(dir, 'map.json');
  fs.writeFileSync(cwPath, JSON.stringify(cw, null, 2) + '\n');
  fs.writeFileSync(mpPath, JSON.stringify(mp, null, 2) + '\n');

  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/legacy-map-apply.js'), '--check'], {
    encoding: 'utf8',
    env: { ...process.env, S1_LEGACY_CROSSWALK: cwPath, S1_LEGACY_MAP: mpPath },
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const caught = r.status !== 0 && c.expect.test(out);
  console.log(`${caught ? '  ✅' : '  ❌'} ${c.name} — ${caught ? '잡음' : '못 잡음(그물에 구멍)'}`);
  if (!caught) { failed += 1; console.log(out.split('\n').map((l) => '     ' + l).join('\n')); }
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failed) { console.log(`\n❌ 적대 시험 실패 — ${failed}/${CASES.length} 건을 못 잡습니다\n`); process.exit(1); }
console.log(`\n✅ 시험 ${CASES.length}종 전부 잡음 — 레거시 이름 그물에 구멍 없음`);

// ── 조회기 회귀 시험 — 고친 답이 도로 틀어지지 않는지 본다(실제 데이터, 수정 없음) ──
const { resolve } = require('./lib/legacy-name-map');
const ANSWERS = [
  { q: { set: 'pc_button', source: 'A', state: 'hover', size: 'medium' }, want: { status: 'matched', sets: ['Button'], axes: { State: 'Hover', Size: 'MD' } }, why: 'F1 — 파일 id 가 아니라 정본 세트 이름' },
  { q: { set: 'chip', source: 'A', state: 'default' }, want: { status: 'matched', sets: ['Chip'], axes: { State: 'Default' } }, why: 'C-2 — 표에 답이 있으면 «결정 전» 이라 하지 않는다' },
  { q: { set: 'toggle', source: 'A', state: 'on' }, want: { status: 'matched', sets: ['Toggle'], axes: { Pressed: 'On' } }, why: 'F2 — 정본에 있는 축으로 간다' },
  { q: { set: 'radio', source: 'A', state: 'disabled-checked' }, want: { status: 'partial', sets: ['Radio'] }, why: 'F2 — 정본에 없는 값은 답으로 내지 않는다' },
  { q: { set: 'timepicker_input', source: 'A', state: 'selected' }, want: { status: 'matched', sets: ['Time Picker'], axes: { State: 'Focus' } }, why: 'D-09 river 결정' },
  { q: { set: 'menutree', source: 'B' }, want: { status: 'undecided' }, why: 'river 결정 2026-09-17 — 사람이 정한 적 없는 것을 «대응 없음» 으로 단정하지 않는다' },
];

let answerFailed = 0;
console.log('\n조회기 회귀 시험');
for (const a of ANSWERS) {
  const r = resolve(a.q);
  const okStatus = r.status === a.want.status;
  const okSets = !a.want.sets || JSON.stringify(r.canonSets) === JSON.stringify(a.want.sets);
  const okAxes = !a.want.axes || Object.entries(a.want.axes).every(([k, v]) => r.axes[k] === v);
  const ok = okStatus && okSets && okAxes;
  const label = `${a.q.source}:${a.q.set}${a.q.state ? ' --state ' + a.q.state : ''}${a.q.size ? ' --size ' + a.q.size : ''}`;
  console.log(`${ok ? '  ✅' : '  ❌'} ${label} — ${a.why}`);
  if (!ok) { answerFailed += 1; console.log(`     받은 답: ${r.status} ${JSON.stringify(r.canonSets)} ${JSON.stringify(r.axes)}`); }
}
if (answerFailed) { console.log(`\n❌ 조회기 회귀 실패 — ${answerFailed}/${ANSWERS.length}\n`); process.exit(1); }
console.log(`✅ 조회기 회귀 ${ANSWERS.length}종 그대로\n`);

