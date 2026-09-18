#!/usr/bin/env node
/**
 * pattern-order.js — 화면마다 "위에서 아래로 무엇이 놓였나" 를 뽑아 둔다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜: 지금까지의 판독 원자료(raw/)는 "이 화면에 어떤 부품이 몇 개" 만 담는다. 차례가 없다.
 *     차례가 있어야 ①빌더가 화면을 그대로 가져올 수 있고 ②로컬 모델이 "이런 차례가
 *     반복된다" 를 찾을 수 있다.
 *
 * 경계선: raw/ 를 건드리지 않는다. 결과는 order/ 에 따로 쌓는다.
 *         레거시 이름을 정본 이름으로 바꾸지 않는다(이름 대응은 결정표의 몫).
 *
 * 사용:
 *   node scripts/pattern-order.js <service> --pages 1878:23794,268:10736
 *   node scripts/pattern-order.js <service> --from-raw          raw/ 에 적힌 페이지를 그대로
 *   node scripts/pattern-order.js <service> --file <fileKey> --all
 *
 * 출력: reports/pattern-builder/inventory/<service>/order/<n>-<page>.json
 * 끝줄: `PATTERNORDER_SUMMARY pages=<n> screens=<n> rows=<n> sec=<n>`
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

const argv = process.argv.slice(2);
const arg = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
const VALUE_FLAGS = ['--pages', '--file'];
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && VALUE_FLAGS.includes(argv[i - 1])));
const service = positional[0] || 'modu-app';
const base = path.join('reports/pattern-builder/inventory', service);

const api = async (url) => {
  const r = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
  if (!r.ok) throw new Error(`Figma ${r.status} — ${(await r.text()).slice(0, 200)}`);
  return r.json();
};
const slug = (s) => s.replace(/[^\w가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/** 묶음(프로파일)에서 Figma 파일 키를 찾는다 */
function fileKeyFromProfile() {
  const dir = 'reports/pattern-builder/profiles';
  if (!fs.existsSync(dir)) return null;
  for (const d of fs.readdirSync(dir)) {
    const f = path.join(dir, d, 'profile.json');
    if (!fs.existsSync(f)) continue;
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if ((j.inventory || '').includes(`/${service}/`) && j.source && j.source.figmaFileKey) return j.source.figmaFileKey;
  }
  return null;
}

/** raw/ 에 이미 읽어 둔 페이지 목록을 그대로 쓴다 */
function pagesFromRaw() {
  const rawDir = path.join(base, 'raw');
  if (!fs.existsSync(rawDir)) return [];
  const out = [];
  for (const f of fs.readdirSync(rawDir).filter((x) => x.endsWith('.json')).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(rawDir, f), 'utf8'));
    const p = j._meta && j._meta.page;
    if (p && p.nodeId) out.push({ id: p.nodeId, name: p.name });
  }
  return out;
}

(async () => {
  const t0 = Date.now();
  const fileKey = arg('--file') || fileKeyFromProfile() || process.env.FIGMA_FILE_KEY;
  if (!fileKey) { console.error('❌ Figma 파일 키를 못 찾았습니다. --file <key> 로 주세요.'); process.exit(1); }

  let pages;
  if (argv.includes('--from-raw')) {
    pages = pagesFromRaw();
    if (!pages.length) { console.error(`❌ raw/ 가 비어 있습니다: ${base}/raw`); process.exit(1); }
  } else if (arg('--pages')) {
    const ids = arg('--pages').split(',').map((x) => x.trim().replace('-', ':'));
    const meta = await api(`https://api.figma.com/v1/files/${fileKey}?depth=1`);
    pages = meta.document.children.filter((p) => ids.includes(p.id)).map((p) => ({ id: p.id, name: p.name }));
  } else if (argv.includes('--all')) {
    const meta = await api(`https://api.figma.com/v1/files/${fileKey}?depth=1`);
    pages = meta.document.children.map((p) => ({ id: p.id, name: p.name }));
  } else {
    pages = pagesFromRaw();
    if (!pages.length) { console.error('❌ --pages / --from-raw / --all 중 하나를 주세요.'); process.exit(1); }
  }

  const outDir = path.join(base, 'order');
  fs.mkdirSync(outDir, { recursive: true });

  let totalScreens = 0; let totalRows = 0; let idx = 0;
  for (const p of pages) {
    idx += 1;
    const j = await api(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(p.id)}`);
    const node = j.nodes[p.id] && j.nodes[p.id].document;
    if (!node) { console.log(`  ⚠️ ${p.name} — 못 읽음`); continue; }

    const screens = [];
    const take = (parent, section) => {
      for (const c of parent.children || []) {
        if (c.type === 'SECTION') { take(c, c.name); continue; }
        const b = c.absoluteBoundingBox;
        if (!b) continue;
        const rows = extractOrder(c);
        screens.push({
          id: c.id,
          name: c.name,
          section,
          size: `${Math.round(b.width)}x${Math.round(b.height)}`,
          rowCount: rows.filter((r) => r.kind !== 'body').length,
          orderText: orderSentence(rows),
          order: rows,
        });
      }
    };
    take(node, null);

    const payload = {
      _meta: {
        source: 'figma:rest',
        page: { name: p.name, nodeId: p.id },
        fileKey,
        generatedAt: new Date().toISOString().slice(0, 10),
        note: '세로 차례 원자료. order = 위에서 아래로의 칸 목록(y 순). 레거시 이름 그대로이며 정본 이름이 아니다.',
      },
      screenCount: screens.length,
      screens,
    };
    fs.writeFileSync(path.join(outDir, `${String(idx).padStart(2, '0')}-${slug(p.name)}.json`), JSON.stringify(payload, null, 2) + '\n');
    totalScreens += screens.length;
    totalRows += screens.reduce((a, s) => a + s.rowCount, 0);
    console.log(`  ✅ ${p.name} — 화면 ${screens.length} · 칸 ${screens.reduce((a, s) => a + s.rowCount, 0)}`);
  }
  console.log(`\nPATTERNORDER_SUMMARY pages=${pages.length} screens=${totalScreens} rows=${totalRows} sec=${((Date.now() - t0) / 1000).toFixed(1)}`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
