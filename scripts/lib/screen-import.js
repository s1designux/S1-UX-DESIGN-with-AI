/**
 * screen-import.js — 이미 만들어 둔 Figma 화면 한 장을 빌더가 먹을 수 있는 모양으로 가져온다.
 * ─────────────────────────────────────────────────────────────────────────
 * 이 파일은 "일하는 몸통"이다. 두 곳에서 부른다:
 *   - 빌더 화면의 「Figma 화면 가져오기」 버튼 (scripts/builder-serve.js)
 *   - 터미널 (scripts/pattern-screen-import.js)
 *
 * 경계선(H6②):
 *   - 이름 대응은 결정표에 있는 것만 적는다. 없으면 「아직 안 정함」·「모름」이라 적고 지어내지 않는다.
 *   - legacy-as-is 는 어떤 경우에도 부품을 바꿔치기하지 않는다. 적어 둔 대응은 참고 표시일 뿐이다.
 *   - 가져오기 규칙(import.mode)이 없는 묶음은 **멈춘다**. 내가 정하지 않는다.
 */
const fs = require('fs');
const path = require('path');
const { extractOrder, orderSentence } = require('./screen-structure');

const PROFILES = 'reports/pattern-builder/profiles';
const INDEX_DIR = 'reports/pattern-builder/imported';
const MODES = ['legacy-as-is', 'canon-swap'];

let resolveLegacy = null;
try { ({ resolve: resolveLegacy } = require('./legacy-name-map')); } catch { /* 대응표 없으면 표시만 건너뛴다 */ }

/** .env 에서 Figma 열쇠를 읽는다(저장소에 올라가지 않는 파일) */
function figmaToken() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN;
  try {
    for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) process.env[m[1]] = m[2].trim();
    }
  } catch { /* .env 없음 */ }
  return process.env.FIGMA_TOKEN || null;
}

const slug = (s) => s.replace(/[^\w가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

async function api(url, token) {
  const r = await fetch(url, { headers: { 'X-Figma-Token': token } });
  if (!r.ok) {
    const body = (await r.text()).slice(0, 200);
    const why = r.status === 403 ? '읽기 열쇠가 이 파일을 볼 수 없습니다'
      : r.status === 404 ? '그런 파일이나 화면이 없습니다'
        : body;
    throw new Error(`Figma ${r.status} — ${why}`);
  }
  return r.json();
}

/** Figma 링크에서 파일 열쇠와 노드 번호를 뽑는다. 링크가 아니면 노드 번호만 받아도 된다. */
function parseFigmaUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return { fileKey: null, nodeId: null };
  const bare = raw.match(/^(\d+)[:-](\d+)$/);
  if (bare) return { fileKey: null, nodeId: `${bare[1]}:${bare[2]}` };
  let u;
  try { u = new URL(raw); } catch { return { fileKey: null, nodeId: null }; }
  const m = u.pathname.match(/\/(?:file|design|proto)\/([A-Za-z0-9]+)/);
  const node = u.searchParams.get('node-id');
  return {
    fileKey: m ? m[1] : null,
    nodeId: node ? node.replace('-', ':') : null,
  };
}

/** 묶음(프로파일) 전부 읽기 */
function loadProfiles() {
  if (!fs.existsSync(PROFILES)) return [];
  return fs.readdirSync(PROFILES)
    .filter((d) => d !== '_template' && fs.existsSync(path.join(PROFILES, d, 'profile.json')))
    .map((d) => ({ id: d, dir: path.join(PROFILES, d), ...JSON.parse(fs.readFileSync(path.join(PROFILES, d, 'profile.json'), 'utf8')) }));
}

/** 파일 열쇠로 어느 묶음인지 찾는다 */
function profileForFileKey(fileKey) {
  return loadProfiles().find((p) => p.source && p.source.figmaFileKey === fileKey) || null;
}

function canonNote(partNames) {
  if (!resolveLegacy || !partNames.length) return [];
  return partNames.map((n) => {
    let r;
    try { r = resolveLegacy({ set: n }); } catch { r = { status: 'unknown' }; }
    return { legacy: n, status: r.status, canonSets: r.canonSets || [] };
  });
}

/** 빌더가 읽는 「가져온 화면」 목록을 다시 쓴다 */
function rewriteIndex() {
  fs.mkdirSync(INDEX_DIR, { recursive: true });
  const entries = [];
  for (const p of loadProfiles()) {
    const dir = path.join(p.dir, 'imported');
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      entries.push({
        profile: p.id,
        service: p.service || p.id,
        medium: p.medium || null,
        mode: d.mode,
        slug: f.replace(/\.json$/, ''),
        name: d.screen.name,
        width: d.screen.width,
        height: d.screen.height,
        rows: d.rows.length,
        // reports/pattern-builder/ 기준 상대경로 — 빌더가 그 폴더를 밑동으로 삼아 붙인다
        path: `profiles/${p.id}/imported/${f}`,
        imgBase: `profiles/${p.id}/imported/`,
      });
    }
  }
  entries.sort((a, b) => a.profile.localeCompare(b.profile) || a.name.localeCompare(b.name));
  fs.writeFileSync(path.join(INDEX_DIR, 'index.json'), JSON.stringify({
    _meta: { note: '빌더 「가져온 화면」 목록. 가져오기가 다시 쓴다. 손편집하지 않는다.', generatedAt: new Date().toISOString().slice(0, 10) },
    screens: entries,
  }, null, 2) + '\n');
  return entries;
}

/** 인벤토리(차례 자료 우선)에서 화면 찾기 — 터미널 --find 용 */
function findScreens(profile, needle) {
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
    if (seen.size) break;
  }
  const all = [...seen.values()];
  if (!needle) return all;
  const q = String(needle).toLowerCase();
  return all.filter((s) => s.name.toLowerCase().includes(q));
}

/**
 * 화면 한 장 가져오기.
 * @param {object} o { link?, fileKey?, nodeId, profileId?, scale? }
 * @returns {Promise<{entry, rows, images, profile, warnings}>}
 * 실패하면 Error 를 던지되, 사람이 읽을 수 있는 말로 던진다(err.code 로 갈래를 준다).
 */
async function importScreen(o = {}) {
  const token = figmaToken();
  if (!token) { const e = new Error('Figma 읽기 열쇠가 없습니다(.env 의 FIGMA_TOKEN).'); e.code = 'no-token'; throw e; }

  const fromLink = o.link ? parseFigmaUrl(o.link) : {};
  const nodeId = (o.nodeId || fromLink.nodeId || '').replace('-', ':');
  if (!nodeId) {
    const e = new Error('링크에 화면 번호(node-id)가 없습니다. Figma 에서 화면(프레임)을 고르고 「Copy link to selection」 으로 복사해 주세요.');
    e.code = 'no-node'; throw e;
  }

  let profile = o.profileId
    ? loadProfiles().find((p) => p.id === o.profileId)
    : (fromLink.fileKey || o.fileKey ? profileForFileKey(fromLink.fileKey || o.fileKey) : null);

  if (!profile) {
    const key = fromLink.fileKey || o.fileKey;
    const e = new Error(key
      ? `이 Figma 파일에 해당하는 묶음이 없습니다(파일 ${key}). 어느 서비스의 화면인지와 가져오기 규칙을 먼저 정해야 합니다.`
      : '어느 묶음의 화면인지 알 수 없습니다.');
    e.code = 'no-profile';
    e.fileKey = key || null;
    e.profiles = loadProfiles().map((p) => ({ id: p.id, service: p.service, medium: p.medium, mode: p.import && p.import.mode }));
    throw e;
  }

  const mode = o.mode || (profile.import && profile.import.mode);
  if (!mode) {
    const e = new Error(`「${profile.service || profile.id}」 묶음에 가져오기 규칙이 없습니다. 레거시 모습 그대로 둘지, 정해진 것은 최신 부품으로 바꿀지 먼저 정해야 합니다.`);
    e.code = 'no-mode'; e.profile = profile.id; throw e;
  }
  if (!MODES.includes(mode)) { const e = new Error(`모르는 가져오기 규칙: ${mode}`); e.code = 'bad-mode'; throw e; }
  if (mode === 'canon-swap') {
    const e = new Error('「정해진 것은 최신 부품으로」는 아직 없습니다 — 어떤 칸을 어떤 부품으로 바꿀지가 결정되지 않았습니다.');
    e.code = 'not-ready'; throw e;
  }

  const fileKey = fromLink.fileKey || o.fileKey || (profile.source && profile.source.figmaFileKey);
  if (!fileKey) { const e = new Error('Figma 파일 열쇠를 찾지 못했습니다.'); e.code = 'no-file'; throw e; }
  if (profile.source && profile.source.figmaFileKey && fileKey !== profile.source.figmaFileKey) {
    const e = new Error(`이 링크는 「${profile.service || profile.id}」 묶음의 Figma 파일이 아닙니다.`);
    e.code = 'wrong-file'; throw e;
  }

  const scale = Number(o.scale) || 2;
  const j = await api(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`, token);
  const node = j.nodes[nodeId] && j.nodes[nodeId].document;
  if (!node) { const e = new Error(`그 화면을 못 읽었습니다(${nodeId}).`); e.code = 'no-screen'; throw e; }
  const b = node.absoluteBoundingBox;
  if (!b) { const e = new Error('고른 것이 화면(프레임)이 아닙니다. 화면 전체를 고르고 링크를 복사해 주세요.'); e.code = 'not-frame'; throw e; }

  const order = extractOrder(node, { items: true });
  const rows = order.filter((r) => r.kind !== 'body');
  if (!rows.length) { const e = new Error('이 화면에서 칸을 하나도 찾지 못했습니다.'); e.code = 'empty'; throw e; }

  const name = node.name;
  const sl = slug(name);
  const outDir = path.join(profile.dir, 'imported');
  const imgDir = path.join(outDir, 'img', sl);
  fs.mkdirSync(imgDir, { recursive: true });

  // 칸마다 원본 그림 — "레거시 모습 그대로" 의 알맹이
  const ids = rows.map((r) => r.id);
  const urls = {};
  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const im = await api(`https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(chunk.join(','))}&format=png&scale=${scale}`, token);
    Object.assign(urls, im.images || {});
  }
  let saved = 0;
  const warnings = [];
  for (const [i, r] of rows.entries()) {
    const u = urls[r.id];
    if (!u) { warnings.push(`${i}번 칸(${r.label})의 그림을 받지 못했습니다`); continue; }
    const res = await fetch(u);
    if (!res.ok) { warnings.push(`${i}번 칸(${r.label})의 그림을 받지 못했습니다`); continue; }
    fs.writeFileSync(path.join(imgDir, `${String(i).padStart(2, '0')}.png`), Buffer.from(await res.arrayBuffer()));
    r.image = `img/${sl}/${String(i).padStart(2, '0')}.png`;
    saved += 1;
  }

  const payload = {
    _meta: {
      source: 'figma:rest',
      fileKey,
      link: o.link || null,
      generatedAt: new Date().toISOString().slice(0, 10),
      note: '가져온 레거시 화면. 칸 이름·그림은 레거시 원본 그대로이며 정본 부품이 아니다. 정본 패턴 목록에 넣지 않는다.',
    },
    profile: profile.id,
    service: profile.service || profile.id,
    medium: profile.medium || null,
    mode,
    screen: { id: nodeId, name, width: Math.round(b.width), height: Math.round(b.height), orderText: orderSentence(order) },
    rows: rows.map((r, i) => ({
      i, label: r.label, name: r.name, type: r.type,
      x: r.x, y: r.y, h: r.h, w: r.w, depth: r.depth,
      image: r.image || null,
      parts: r.parts || {},
      canon: canonNote(Object.keys(r.parts || {})),   // 참고 표시 — 바꿔치기하지 않는다
      // 칸 안의 알맹이 — 빌더가 「새로 그린 화면」을 조립할 때 쓴다(레거시 그림은 그대로 둔 채 옆에 그린다)
      items: r.items || [],
    })),
  };
  fs.writeFileSync(path.join(outDir, `${sl}.json`), JSON.stringify(payload, null, 2) + '\n');

  const entries = rewriteIndex();
  const entry = entries.find((e) => e.profile === profile.id && e.slug === sl);
  return { entry, rows: rows.length, images: saved, profile: profile.id, service: profile.service || profile.id, name, warnings };
}

module.exports = { importScreen, parseFigmaUrl, loadProfiles, profileForFileKey, findScreens, rewriteIndex, MODES };
