#!/usr/bin/env node
/**
 * pattern-screen-import.js — 화면 가져오기, 터미널 판.
 * ─────────────────────────────────────────────────────────────────────────
 * 보통은 **빌더 화면의 「Figma 화면 가져오기」 버튼**을 쓴다(npm run builder).
 * 이 명령은 여러 장을 한꺼번에 처리하거나 확인할 때 쓰는 뒷문이다. 몸통은 lib/screen-import.js.
 *
 * 사용:
 *   node scripts/pattern-screen-import.js --link "https://figma.com/design/…?node-id=23065-17941"
 *   node scripts/pattern-screen-import.js app-modu --screen 23065:17941
 *   node scripts/pattern-screen-import.js app-modu --find "홈" --list
 *
 * 끝줄: `SCREENIMPORT_SUMMARY screen=<id> rows=<n> images=<n> sec=<n>`
 */
const { importScreen, loadProfiles, findScreens } = require('./lib/screen-import');

const argv = process.argv.slice(2);
const VALUE_FLAGS = ['--screen', '--find', '--mode', '--scale', '--link'];
const arg = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && VALUE_FLAGS.includes(argv[i - 1])));
const profileId = positional[0];
const listOnly = argv.includes('--list');

(async () => {
  const t0 = Date.now();
  const link = arg('--link');
  let screenId = arg('--screen');

  if (!link && !screenId) {
    const profile = loadProfiles().find((p) => p.id === profileId);
    if (!profile) {
      console.error('❌ 묶음을 주세요. 있는 묶음: ' + loadProfiles().map((p) => p.id).join(' · '));
      process.exit(1);
    }
    const hits = findScreens(profile, arg('--find'));
    if (!hits.length) { console.error('❌ 그런 이름의 화면을 못 찾았습니다.'); process.exit(1); }
    if (listOnly || hits.length > 1) {
      console.log(`🔎 ${hits.length}장 찾음${hits.length > 30 ? ' (앞 30장)' : ''}\n`);
      for (const s of hits.slice(0, 30)) console.log(`  ${s.id.padEnd(16)} ${s.size.padEnd(12)} ${s.name}  [${s.page}]`);
      if (!listOnly) console.log('\n→ --screen <id> 로 하나를 골라 주세요.');
      return;
    }
    screenId = hits[0].id;
  }

  try {
    const r = await importScreen({ link, nodeId: screenId, profileId, mode: arg('--mode'), scale: arg('--scale') });
    for (const w of r.warnings) console.log(`  ⚠️ ${w}`);
    console.log(`✅ ${r.name} — 칸 ${r.rows} · 그림 ${r.images} · 묶음 ${r.service}`);
    console.log(`SCREENIMPORT_SUMMARY screen=${r.entry?.slug || screenId} rows=${r.rows} images=${r.images} sec=${((Date.now() - t0) / 1000).toFixed(1)}`);
  } catch (e) {
    console.error('❌', e.message);
    if (e.code === 'no-profile' && e.profiles) {
      console.error('   있는 묶음: ' + e.profiles.map((p) => `${p.id}(${p.mode || '규칙 없음'})`).join(' · '));
    }
    process.exit(1);
  }
})();
