#!/usr/bin/env node
/**
 * pattern-fetch.js — Figma 파일에서 화면 구조를 직접 내려받아 판독 원자료로 만든다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜: 데스크톱 연결은 "그 파일이 열려 있어야" 읽히고, MCP 조회는 좌석 등급별 한도가 있다.
 *     REST 로 내려받으면 둘 다 없다. 페이지를 열어둘 필요도, 섹션을 골라둘 필요도 없다.
 *
 * 준비: `.env` 에 FIGMA_TOKEN (권한: file_content:read). 커밋되지 않는다.
 *
 * 사용:
 *   node scripts/pattern-fetch.js <fileKey> --list                  페이지 목록
 *   node scripts/pattern-fetch.js <fileKey> <service> --pages 1878:23794,268:10736
 *   node scripts/pattern-fetch.js <fileKey> <service> --all         모든 페이지
 *
 * 출력: reports/pattern-builder/inventory/<service>/raw/<n>-<page>.json
 * 끝줄: `PATTERNFETCH_SUMMARY pages=<n> screens=<n> sec=<n>`
 */
const fs = require('fs');
const path = require('path');

for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
const TOKEN = process.env.FIGMA_TOKEN;
if (!TOKEN) { console.error('❌ .env 에 FIGMA_TOKEN 이 없습니다.'); process.exit(1); }

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const fileKey = positional[0] || process.env.FIGMA_FILE_KEY;
const service = positional[1];
const listOnly = argv.includes('--list');
const wantAll = argv.includes('--all');
const pagesArg = argv.includes('--pages') ? argv[argv.indexOf('--pages') + 1] : null;

const api = async (url) => {
  const r = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
  if (!r.ok) throw new Error(`Figma ${r.status} — ${(await r.text()).slice(0, 200)}`);
  return r.json();
};

const slug = (s) => s.replace(/[^\w가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

// 한 노드 아래에서 화면(=페이지 직계 프레임, SECTION 안이면 그 자식)과 쓰인 인스턴스를 뽑는다
function collect(page) {
  const screens = [];
  const walkInstances = (node, out) => {
    for (const c of node.children || []) {
      if (c.type === 'INSTANCE') out.push(c.name);
      walkInstances(c, out);
    }
    return out;
  };
  const take = (node, section) => {
    for (const c of node.children || []) {
      if (c.type === 'SECTION') { take(c, c.name); continue; }
      if (!c.absoluteBoundingBox) continue;
      const insts = walkInstances(c, []);
      const counts = {};
      for (const n of insts) counts[n] = (counts[n] || 0) + 1;
      screens.push({
        id: c.id,
        name: c.name,
        section,
        size: `${Math.round(c.absoluteBoundingBox.width)}x${Math.round(c.absoluteBoundingBox.height)}`,
        nodeCount: insts.length,
        components: Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
      });
    }
  };
  take(page, null);
  return screens;
}

(async () => {
  const t0 = Date.now();
  const meta = await api(`https://api.figma.com/v1/files/${fileKey}?depth=1`);
  const pages = meta.document.children.map((p) => ({ id: p.id, name: p.name }));

  if (listOnly || !service) {
    console.log(`📄 ${meta.name} — 페이지 ${pages.length}개\n`);
    for (const p of pages) console.log(`  ${p.id}  ${p.name}`);
    console.log(`\nPATTERNFETCH_SUMMARY pages=${pages.length} screens=0 sec=${((Date.now() - t0) / 1000).toFixed(1)}`);
    return;
  }

  const wanted = wantAll ? pages : pages.filter((p) => (pagesArg || '').split(',').map((x) => x.trim().replace('-', ':')).includes(p.id));
  if (!wanted.length) { console.error('❌ 읽을 페이지를 못 찾았습니다. --list 로 확인하세요.'); process.exit(1); }

  const outDir = path.join('reports/pattern-builder/inventory', service, 'raw');
  fs.mkdirSync(outDir, { recursive: true });

  let total = 0; let idx = 0;
  for (const p of wanted) {
    idx += 1;
    const j = await api(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(p.id)}`);
    const node = j.nodes[p.id] && j.nodes[p.id].document;
    if (!node) { console.log(`  ⚠️ ${p.name} — 못 읽음`); continue; }
    const screens = collect(node);
    const totals = {};
    for (const s of screens) for (const c of s.components) totals[c.name] = (totals[c.name] || 0) + c.count;
    const payload = {
      _meta: {
        source: 'figma:rest',
        page: { name: p.name, nodeId: p.id },
        generatedAt: new Date().toISOString().slice(0, 10),
        note: '기계 판독 원자료. 사람이 해석한 판독표는 같은 폴더의 md 에 쓴다.',
      },
      screenCount: screens.length,
      screens,
      componentUsage: Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    };
    const file = path.join(outDir, `${String(idx).padStart(2, '0')}-${slug(p.name)}.json`);
    fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n');
    total += screens.length;
    console.log(`  ✅ ${p.name} — 화면 ${screens.length}`);
  }
  console.log(`\nPATTERNFETCH_SUMMARY pages=${wanted.length} screens=${total} sec=${((Date.now() - t0) / 1000).toFixed(1)}`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
