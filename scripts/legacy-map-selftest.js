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
console.log(`\n✅ 시험 ${CASES.length}종 전부 잡음 — 레거시 이름 그물에 구멍 없음\n`);
