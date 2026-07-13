#!/usr/bin/env node
/**
 * icons-figma-check.js
 * [Figma 스냅샷 ↔ icons-data.js] nodeId 대조 (온라인/수동 전용).
 *
 * ⚠ gate:check 에는 배선하지 않는다 — 평소 작업환경은 사내망이라 Figma 접근이 막혀,
 *   네트워크성 게이트를 커밋훅에 넣으면 모든 커밋을 막는다. 대신 스냅샷
 *   data/figma-icons-snapshot.json(오프라인 폴백)과 정본을 nodeId 로 대조한다.
 *   스냅샷 자체 갱신은 npm run icons:figma:snapshot (Figma MCP 덤프 필요).
 *
 * 판정: 정본 variant.figmaNodeId ↔ 스냅샷 variants[].nodeId
 *   - 유령(정본에 있으나 스냅샷에 없음) 0
 *   - 누락(스냅샷에 있으나 정본에 없음) 0
 *   이름 대조는 하지 않는다(변형명 파손·정본 이름 재가공 때문). 대조 키는 nodeId.
 */

const fs   = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'assets', 'js', 'icons-data.js');
const SNAP_PATH = path.join(__dirname, '..', 'data', 'figma-icons-snapshot.json');

function loadCanonIds() {
  const src = fs.readFileSync(DATA_PATH, 'utf8');
  const sandbox = {};
  eval(src.replace('window.ICONS_DATA', 'sandbox.ICONS_DATA'));
  const d = sandbox.ICONS_DATA || {};
  const ids = new Set();
  (d.icons || []).forEach(i => Object.values(i.variants || {}).forEach(v => { if (v.figmaNodeId) ids.add(v.figmaNodeId); }));
  return ids;
}

function check() {
  if (!fs.existsSync(SNAP_PATH)) {
    return { ok: false, error: `스냅샷 없음: ${SNAP_PATH} — npm run icons:figma:snapshot` };
  }
  const snap = JSON.parse(fs.readFileSync(SNAP_PATH, 'utf8'));
  const snapIds = new Set();
  (snap.icons || []).forEach(i => (i.variants || []).forEach(v => snapIds.add(v.nodeId)));
  const canon = loadCanonIds();
  const ghosts  = [...canon].filter(id => !snapIds.has(id));   // 정본→스냅샷 없음
  const missing = [...snapIds].filter(id => !canon.has(id));   // 스냅샷→정본 없음
  return { ok: ghosts.length === 0 && missing.length === 0, canon: canon.size, snap: snapIds.size, ghosts, missing };
}

function main() {
  const r = check();
  if (r.error) { console.error('❌ ' + r.error); process.exit(1); }
  console.log(`Figma 스냅샷 대조: 정본 ${r.canon} vs 스냅샷 ${r.snap}`);
  console.log(`  유령(정본→스냅샷없음): ${r.ghosts.length}${r.ghosts.length ? ' · ' + r.ghosts.slice(0, 10).join(', ') : ''}`);
  console.log(`  누락(스냅샷→정본없음): ${r.missing.length}${r.missing.length ? ' · ' + r.missing.slice(0, 10).join(', ') : ''}`);
  if (!r.ok) { console.error('❌ nodeId 불일치 — 정본과 Figma 스냅샷이 어긋남'); process.exit(1); }
  console.log('✅ 정본 = Figma 스냅샷 (nodeId 완전 일치)');
}

if (require.main === module) main();

module.exports = { check };
