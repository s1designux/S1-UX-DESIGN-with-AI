#!/usr/bin/env node
/**
 * pattern-measure.js — 화면 몇 장을 통째로 내려받아 뼈대 수치를 실측한다.
 * 사용:
 *   node scripts/pattern-measure.js <fileKey> <service> --width 360 --sample 40
 *   node scripts/pattern-measure.js <fileKey> <service> --width 1920 --page Admin --sample 30
 * 출력: inventory/<service>/measure-<width>.json + 요약 출력
 */
const fs = require('fs'); const path = require('path');
for (const l of fs.readFileSync('.env', 'utf8').split('\n')) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].trim(); }
const TOKEN = process.env.FIGMA_TOKEN;
const argv = process.argv.slice(2); const pos = argv.filter((a) => !a.startsWith('--'));
const [fileKey, service] = pos;
const width = Number(argv[argv.indexOf('--width') + 1] || 360);
const sample = Number(argv[argv.indexOf('--sample') + 1] || 40);
const pageMatch = argv.includes('--page') ? argv[argv.indexOf('--page') + 1] : null;
const pageExclude = argv.includes('--not-page') ? argv[argv.indexOf('--not-page') + 1] : null;

const base = path.join('reports/pattern-builder/inventory', service);
const noise = /^(Frame|Group|Rectangle|Line|Arrow|Ellipse|Vector|Union|Component)\b/i;
const all = [];
for (const f of fs.readdirSync(path.join(base, 'raw'))) {
  const j = JSON.parse(fs.readFileSync(path.join(base, 'raw', f), 'utf8'));
  if (pageMatch && !j._meta.page.name.includes(pageMatch)) continue;
  if (pageExclude && j._meta.page.name.includes(pageExclude)) continue;
  for (const s of j.screens) {
    const [w, h] = s.size.split('x').map(Number);
    if (w !== width || h < 400 || noise.test(s.name)) continue;
    all.push({ ...s, w, h, page: j._meta.page.name });
  }
}
const step = Math.max(1, Math.floor(all.length / sample));
const picked = all.filter((_, i) => i % step === 0).slice(0, sample);

const api = async (url) => { const r = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } }); if (!r.ok) throw new Error(`Figma ${r.status}`); return r.json(); };
const flat = (node, ox, oy, out, depth = 0) => {
  const b = node.absoluteBoundingBox;
  if (b) out.push({ name: node.name, type: node.type, x: Math.round(b.x - ox), y: Math.round(b.y - oy), w: Math.round(b.width), h: Math.round(b.height), depth,
    fontSize: node.style && node.style.fontSize, weight: node.style && node.style.fontWeight, lh: node.style && node.style.lineHeightPx,
    fill: node.fills && node.fills[0] && node.fills[0].color ? [node.fills[0].color.r, node.fills[0].color.g, node.fills[0].color.b].map((v) => Math.round(v * 255)).join(',') : null });
  for (const c of node.children || []) flat(c, ox, oy, out, depth + 1);
  return out;
};

const tally = (arr) => { const t = {}; for (const v of arr) t[v] = (t[v] || 0) + 1; return Object.entries(t).sort((a, b) => b[1] - a[1]); };

(async () => {
  const nodes = [];
  for (let i = 0; i < picked.length; i += 8) {
    const batch = picked.slice(i, i + 8);
    const j = await api(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${batch.map((s) => encodeURIComponent(s.id)).join(',')}`);
    for (const s of batch) {
      const doc = j.nodes[s.id] && j.nodes[s.id].document;
      if (!doc || !doc.absoluteBoundingBox) continue;
      nodes.push({ screen: s, items: flat(doc, doc.absoluteBoundingBox.x, doc.absoluteBoundingBox.y, []) });
    }
    process.stdout.write(`  ${Math.min(i + 8, picked.length)}/${picked.length}\n`);
  }
  const depth1 = nodes.flatMap((n) => n.items.filter((it) => it.depth === 1));
  const texts = nodes.flatMap((n) => n.items.filter((it) => it.type === 'TEXT' && it.fontSize));
  const instances = nodes.flatMap((n) => n.items.filter((it) => it.type === 'INSTANCE'));
  const contentX = tally(nodes.flatMap((n) => n.items.filter((it) => it.depth <= 3 && it.w > width * 0.6 && it.w < width).map((it) => it.x))).slice(0, 5);
  const res = {
    _meta: { service, width, sampled: nodes.length, of: all.length, generatedAt: new Date().toISOString().slice(0, 10) },
    screenHeights: tally(nodes.map((n) => n.screen.h)).slice(0, 6),
    topBand: tally(depth1.filter((it) => it.y <= 2).map((it) => `${it.name} h=${it.h}`)).slice(0, 8),
    bottomBand: tally(nodes.flatMap((n) => n.items.filter((it) => it.depth === 1 && it.y + it.h >= n.screen.h - 2).map((it) => `${it.name} h=${it.h}`))).slice(0, 8),
    contentLeftX: contentX,
    fontSizes: tally(texts.map((t) => `${t.fontSize}/${t.weight}`)).slice(0, 10),
    lineHeights: tally(texts.filter((t) => t.lh).map((t) => `${t.fontSize}→${Math.round(t.lh)}`)).slice(0, 8),
    textColors: tally(texts.filter((t) => t.fill).map((t) => t.fill)).slice(0, 8),
    buttonSizes: tally(instances.filter((it) => /BTN|button/i.test(it.name)).map((it) => `${it.w}x${it.h}`)).slice(0, 8),
    listRow: tally(instances.filter((it) => /list|List/.test(it.name)).map((it) => `${it.w}x${it.h}`)).slice(0, 8),
  };
  fs.writeFileSync(path.join(base, `measure-${width}${pageMatch ? '-' + pageMatch : ''}.json`), JSON.stringify(res, null, 2) + '\n');
  for (const [k, v] of Object.entries(res)) {
    if (k === '_meta') { console.log(`\n■ ${service} 폭 ${width} — ${res._meta.sampled}/${res._meta.of} 장 실측`); continue; }
    console.log(`${k}: ${v.map((x) => Array.isArray(x) ? `${x[0]}(${x[1]})` : x).join(' · ')}`);
  }
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
