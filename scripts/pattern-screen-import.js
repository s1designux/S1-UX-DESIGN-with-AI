#!/usr/bin/env node
/**
 * pattern-screen-import.js — 이미 만들어 둔 Figma 화면을 빌더로 가져온다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜: 운영 중인 서비스(모두앱 등)는 새 화면을 처음부터 그리기보다 **기존 화면에 기능을 더하는**
 *     일이 많다. 그래서 원본 화면을 빌더 캔버스에 그대로 올려놓고, 그 사이에 칸을 끼우게 한다.
 *
 * 가져오는 방식은 묶음(profile)마다 다르다 — `profile.json` 의 `import.mode` 가 정한다.
 *   legacy-as-is : 레거시 모습 그대로. 칸마다 원본 그림을 그대로 올린다. 부품을 바꿔치기하지 않는다.
 *                  (모두앱 — river 결정 2026-09-18 "모두앱에서는 레거시 모습 그대로 가져와야 한다")
 *   canon-swap   : 대응이 정해진 칸은 정본 부품으로 갈아 끼운다. (아직 쓰는 묶음 없음)
 *
 * 경계선(H6②):
 *   - 이름 대응은 **결정표에 있는 것만** 적는다. 없으면 `결정 전`·`모름` 이라고 적고 지어내지 않는다.
 *   - legacy-as-is 는 어떤 경우에도 부품을 바꿔치기하지 않는다. 적어 둔 대응은 **참고 표시**일 뿐이다.
 *   - 가져온 화면은 레거시 묶음 안에만 쌓인다. 정본 패턴 목록(catalog.json)에 넣지 않는다.
 *
 * 사용:
 *   node scripts/pattern-screen-import.js <profile> --screen 23065:17941
 *   node scripts/pattern-screen-import.js <profile> --find "홈_1 경비"
 *   node scripts/pattern-screen-import.js <profile> --find "로그인" --list
 *
 * 출력: reports/pattern-builder/profiles/<profile>/imported/<slug>.json (+ img/)
 *       reports/pattern-builder/imported/index.json  ← 빌더가 읽는 목록
 * 끝줄: `SCREENIMPORT_SUMMARY screen=<id> rows=<n> images=<n> sec=<n>`
 */
const fs = require('fs');
const path = require('path');
const { extractOrder, orderSentence } = require('./lib/screen-structure');

for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
const TOKEN = process.env.FIGMA_TOKEN;
if (!TOKEN) { console.error('❌ .env 에 FIGMA_TOKEN 이 없습니다.'); process.exit(1); }

let resolveLegacy = null;
try { ({ resolve: resolveLegacy } = require('./lib/legacy-name-map')); } catch { /* 대응표 없으면 표시만 건너뛴다 */ }

const argv = process.argv.slice(2);
const VALUE_FLAGS = ['--screen', '--find', '--mode', '--scale'];
const arg = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && VALUE_FLAGS.includes(argv[i - 1])));
const profileId = positional[0];
const listOnly = argv.includes('--list');
const SCALE = Number(arg('--scale')) || 2;

if (!profileId) { console.error('❌ 묶음 이름을 주세요. 예: node scripts/pattern-screen-import.js app-modu --find "홈"'); process.exit(1); }

const PROFILES = 'reports/pattern-builder/profiles';
const profileDir = path.join(PROFILES, profileId);
const profilePath = path.join(profileDir, 'profile.json');
if (!fs.existsSync(profilePath)) { console.error(`❌ 묶음을 못 찾았습니다: ${profilePath}`); process.exit(1); }
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));

const MODES = ['legacy-as-is', 'canon-swap'];
const mode = arg('--mode') || (profile.import && profile.import.mode);
if (!mode) {
  console.error(`❌ 이 묶음에 가져오기 규칙이 없습니다. profile.json 에 "import": { "mode": "legacy-as-is" } 를 적거나 --mode 로 주세요.`);
  console.error(`   고를 수 있는 것: ${MODES.join(' · ')}`);
  process.exit(1);
}
if (!MODES.includes(mode)) { console.error(`❌ 모르는 가져오기 규칙: ${mode} (${MODES.join(' · ')})`); process.exit(1); }
if (mode === 'canon-swap') {
  console.error('❌ canon-swap 은 아직 없습니다 — 어떤 칸을 어떤 정본 부품으로 바꿀지가 결정되지 않았습니다(needs-decision).');
  process.exit(1);
}

const fileKey = (profile.source && profile.source.figmaFileKey) || process.env.FIGMA_FILE_KEY;
if (!fileKey) { console.error('❌ 이 묶음에 Figma 파일 키가 없습니다(profile.json source.figmaFileKey).'); process.exit(1); }

const api = async (url) => {
  const r = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
  if (!r.ok) throw new Error(`Figma ${r.status} — ${(await r.text()).slice(0, 200)}`);
  return r.json();
};
const slug = (s) => s.replace(/[^\w가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

/** 인벤토리(차례 자료 우선)에서 화면을 찾는다 — 어느 페이지에 있는지 몰라도 되게 */
function findScreens(needle) {
  const invRel = (profile.inventory || '').replace(/\/$/, '');
  const dirs = [path.join(invRel, 'order'), path.join(invRel, 'raw')].filter((d) => fs.existsSync(d));
  const seen = new Map();
  for (const d of dirs) {
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json'))) {
      const j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
      for (const s of j.screens || []) {
        if (seen.has(s.id)) continue;
        seen.set(s.id, { id: s.id, name: s.name, size: s.size, page: j._meta.page.name });
      }
    }
    if (seen.size) break; // order 가 있으면 그걸로 충분
  }
  const all = [...seen.values()];
  if (!needle) return all;
  const q = needle.toLowerCase();
  return all.filter((s) => s.name.toLowerCase().includes(q));
}

/** 레거시 이름에 정본 대응이 있는지 — 참고 표시일 뿐, 바꿔치기하지 않는다 */
function canonNote(partNames) {
  if (!resolveLegacy || !partNames.length) return [];
  return partNames.map((n) => {
    let r;
    try { r = resolveLegacy({ set: n }); } catch { r = { status: 'unknown' }; }
    return { legacy: n, status: r.status, canonSets: r.canonSets || [] };
  });
}

(async () => {
  const t0 = Date.now();

  // ── 화면 고르기 ─────────────────────────────────────────────────────────
  let screenId = arg('--screen');
  if (!screenId || listOnly) {
    const hits = findScreens(arg('--find'));
    if (!hits.length) { console.error('❌ 그런 이름의 화면을 못 찾았습니다.'); process.exit(1); }
    if (listOnly || hits.length > 1) {
      console.log(`🔎 ${hits.length}장 찾음${hits.length > 30 ? ' (앞 30장)' : ''}\n`);
      for (const s of hits.slice(0, 30)) console.log(`  ${s.id.padEnd(16)} ${s.size.padEnd(12)} ${s.name}  [${s.page}]`);
      if (!listOnly) console.log(`\n→ --screen <id> 로 하나를 골라 주세요.`);
      return;
    }
    screenId = hits[0].id;
  }
  screenId = screenId.replace('-', ':');

  // ── 원본 읽기 ───────────────────────────────────────────────────────────
  const j = await api(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(screenId)}`);
  const node = j.nodes[screenId] && j.nodes[screenId].document;
  if (!node) { console.error(`❌ 화면을 못 읽었습니다: ${screenId}`); process.exit(1); }
  const b = node.absoluteBoundingBox;
  if (!b) { console.error('❌ 이 노드는 화면(프레임)이 아닙니다.'); process.exit(1); }

  const order = extractOrder(node);
  const rows = order.filter((r) => r.kind !== 'body');
  if (!rows.length) { console.error('❌ 이 화면에서 칸을 하나도 못 찾았습니다.'); process.exit(1); }

  const name = node.name;
  const sl = slug(name);
  const outDir = path.join(profileDir, 'imported');
  const imgDir = path.join(outDir, 'img', sl);
  fs.mkdirSync(imgDir, { recursive: true });

  // ── 칸마다 원본 그림 — "레거시 모습 그대로" 의 알맹이 ────────────────────
  const ids = rows.map((r) => r.id);
  const urls = {};
  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const im = await api(`https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(chunk.join(','))}&format=png&scale=${SCALE}`);
    Object.assign(urls, im.images || {});
  }
  let saved = 0;
  for (const [i, r] of rows.entries()) {
    const u = urls[r.id];
    if (!u) continue;
    const res = await fetch(u);
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(imgDir, `${String(i).padStart(2, '0')}.png`), buf);
    r.image = `img/${sl}/${String(i).padStart(2, '0')}.png`;
    saved += 1;
  }

  // ── 저장 ────────────────────────────────────────────────────────────────
  const payload = {
    _meta: {
      source: 'figma:rest',
      fileKey,
      generatedAt: new Date().toISOString().slice(0, 10),
      note: '가져온 레거시 화면. 칸 이름·그림은 레거시 원본 그대로이며 정본 부품이 아니다. 정본 패턴 목록에 넣지 않는다.',
    },
    profile: profileId,
    service: profile.service || profileId,
    medium: profile.medium || null,
    mode,
    screen: {
      id: screenId,
      name,
      width: Math.round(b.width),
      height: Math.round(b.height),
      orderText: orderSentence(order),
    },
    rows: rows.map((r, i) => ({
      i,
      label: r.label,
      name: r.name,
      type: r.type,
      x: r.x,
      y: r.y,
      h: r.h,
      w: r.w,
      depth: r.depth,
      image: r.image || null,
      parts: r.parts || {},
      // 참고 표시 — 결정표에 있는 것만. 여기 적혀 있어도 바꿔치기하지 않는다.
      canon: canonNote(Object.keys(r.parts || {})),
    })),
  };
  fs.writeFileSync(path.join(outDir, `${sl}.json`), JSON.stringify(payload, null, 2) + '\n');

  // ── 빌더가 읽는 목록 다시 쓰기 ──────────────────────────────────────────
  const idxDir = 'reports/pattern-builder/imported';
  fs.mkdirSync(idxDir, { recursive: true });
  const entries = [];
  for (const p of fs.readdirSync(PROFILES).filter((d) => fs.existsSync(path.join(PROFILES, d, 'imported')))) {
    const pj = JSON.parse(fs.readFileSync(path.join(PROFILES, p, 'profile.json'), 'utf8'));
    for (const f of fs.readdirSync(path.join(PROFILES, p, 'imported')).filter((x) => x.endsWith('.json'))) {
      const d = JSON.parse(fs.readFileSync(path.join(PROFILES, p, 'imported', f), 'utf8'));
      entries.push({
        profile: p,
        service: pj.service || p,
        medium: pj.medium || null,
        mode: d.mode,
        slug: f.replace(/\.json$/, ''),
        name: d.screen.name,
        width: d.screen.width,
        height: d.screen.height,
        rows: d.rows.length,
        // reports/pattern-builder/ 기준 상대경로 — 빌더가 그 폴더를 밑동으로 삼아 붙인다
        path: `profiles/${p}/imported/${f}`,
        imgBase: `profiles/${p}/imported/`,
      });
    }
  }
  entries.sort((a, b2) => a.profile.localeCompare(b2.profile) || a.name.localeCompare(b2.name));
  fs.writeFileSync(path.join(idxDir, 'index.json'), JSON.stringify({
    _meta: { note: '빌더 「가져온 화면」 목록. pattern-screen-import 가 다시 쓴다. 손편집하지 않는다.', generatedAt: new Date().toISOString().slice(0, 10) },
    screens: entries,
  }, null, 2) + '\n');

  console.log(`✅ ${name} — 칸 ${rows.length} · 그림 ${saved} → ${path.join(outDir, sl + '.json')}`);
  console.log(`SCREENIMPORT_SUMMARY screen=${screenId} rows=${rows.length} images=${saved} sec=${((Date.now() - t0) / 1000).toFixed(1)}`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
