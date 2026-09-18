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

// ── 구운 결정표 검사 — 플러그인에 실려 나가는 표가 정본 사전을 벗어나지 않는지 본다 ──
// 검수기는 이 표만 보고 «정해짐» 이라고 말하므로, 정본에 없는 이름이 한 건이라도 실리면
// 사람에게 없는 이름을 권하게 된다(하드룰 H6②).
const { loadFacts } = require('./lib/legacy-name-map');
const BAKED = 'plugins/figma-vars-installer/src/legacy-map-data.ts';

console.log('구운 결정표 검사');
let bakedFailed = 0;
const bakedSay = (ok, msg, detail) => {
  console.log(`${ok ? '  ✅' : '  ❌'} ${msg}`);
  if (!ok) { bakedFailed += 1; if (detail) console.log(detail.split('\n').map((l) => '     ' + l).join('\n')); }
};

const fresh = spawnSync(process.execPath, [path.join(ROOT, 'scripts/build-legacy-map-data.js'), '--check'], { encoding: 'utf8' });
bakedSay(fresh.status === 0, '구운 표가 결정표와 같다', `${fresh.stdout || ''}${fresh.stderr || ''}`);

const bakedSrc = fs.readFileSync(path.join(ROOT, BAKED), 'utf8');
const bakedRows = JSON.parse(/export const LEGACY_MAP: LegacyMapEntry\[\] = ([\s\S]*);\n$/.exec(bakedSrc)[1]);
const facts = loadFacts();
const problems = [];
for (const row of bakedRows) {
  for (const s of row.canonSets) if (!facts.has(s)) problems.push(`${row.source}:${row.set} — 정본에 없는 세트 "${s}"`);
  for (const rule of row.rules || []) {
    const target = rule.set || row.canonSets[0];
    const ax = target ? facts.get(target) || {} : {};
    for (const [axis, value] of Object.entries(rule.then || {})) {
      const values = ax[axis];
      const ok = Array.isArray(values) && values.some((v) => String(v).toLowerCase() === String(value).toLowerCase());
      if (!ok) problems.push(`${row.source}:${row.set} — "${target}" 의 ${axis} 에 없는 값 "${value}"`);
    }
  }
  if (row.kind === 'decided' && !row.canonSets.length) problems.push(`${row.source}:${row.set} — «정해짐» 인데 정본 이름이 없다`);
  if (row.kind !== 'decided' && (row.rules || []).length) problems.push(`${row.source}:${row.set} — 정해지지 않았는데 변형 규칙이 실려 있다`);
  // 조건 없는 규칙은 «언제나 걸린다» 가 되어, 조건을 모르는 짐작이 사람 결정의 옷을 입는다
  // (🤖 독립 검증 2026-09-17 — 안 눌린 라디오가 «선택됨», 모든 모달이 XL 이 되던 것 45건).
  for (const rule of row.rules || []) {
    if (!rule.when || !rule.when.length) problems.push(`${row.source}:${row.set} — 조건 없는 규칙 "${rule.from}" (조건을 모르면 메모로만 남겨야 한다)`);
    for (const cond of rule.when || []) {
      if (!cond.value) problems.push(`${row.source}:${row.set} — 값이 빈 조건 "${rule.from}"`);
    }
  }
}
bakedSay(problems.length === 0, `구운 표 ${bakedRows.length}건이 정본 사전 안에 있다`, problems.slice(0, 10).join('\n'));

if (bakedFailed) { console.log(`\n❌ 구운 결정표 검사 실패 — ${bakedFailed}건\n`); process.exit(1); }
console.log('');

