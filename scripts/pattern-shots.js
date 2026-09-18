#!/usr/bin/env node
/**
 * pattern-shots.js — 판독한 화면의 그림을 내려받아 한 장에 펼친다(대조판).
 * 사용:
 *   node scripts/pattern-shots.js <fileKey> <service> --ids <id,id,...> --title "빈 상태"
 *   node scripts/pattern-shots.js <fileKey> <service> --match "없음" --title "빈 상태"
 * 그림은 inventory/<service>/shots/ 에 받고, 대조판은 같은 폴더의 html 로 만든다.
 */
const fs = require('fs'); const path = require('path');
for (const l of fs.readFileSync('.env', 'utf8').split('\n')) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].trim(); }
const TOKEN = process.env.FIGMA_TOKEN;
const argv = process.argv.slice(2);
const pos = argv.filter((a) => !a.startsWith('--'));
const [fileKey, service] = pos;
const idsArg = argv.includes('--ids') ? argv[argv.indexOf('--ids') + 1] : null;
const match = argv.includes('--match') ? argv[argv.indexOf('--match') + 1] : null;
const title = argv.includes('--title') ? argv[argv.indexOf('--title') + 1] : '화면 모음';
const slugTitle = title.replace(/[^\w가-힣]+/g, '-');

const base = path.join('reports/pattern-builder/inventory', service);
const shots = path.join(base, 'shots'); fs.mkdirSync(shots, { recursive: true });

const noise = /^(Frame|Group|Rectangle|Line|Arrow|Ellipse|Vector|Union|Component)\b/i;
const all = [];
for (const f of fs.readdirSync(path.join(base, 'raw'))) {
  const j = JSON.parse(fs.readFileSync(path.join(base, 'raw', f), 'utf8'));
  for (const s of j.screens) {
    const [w, h] = s.size.split('x').map(Number);
    if (h < 400 || w < 280 || noise.test(s.name)) continue;
    all.push({ ...s, w, h, page: j._meta.page.name.replace('GUI_', '').replace(/_2\d.*/, '') });
  }
}
const picked = idsArg ? idsArg.split(',').map((id) => all.find((s) => s.id === id.trim())).filter(Boolean)
  : all.filter((s) => new RegExp(match, 'i').test(s.name));

(async () => {
  if (!picked.length) { console.error('❌ 고른 화면이 없습니다.'); process.exit(1); }
  const out = [];
  const retry = async (fn, n = 3) => {
    for (let k = 0; k < n; k++) {
      try { return await fn(); } catch (e) { if (k === n - 1) throw e; await new Promise((r) => setTimeout(r, 1500 * (k + 1))); }
    }
  };
  for (let i = 0; i < picked.length; i += 8) {
    const batch = picked.slice(i, i + 8);
    const j = await retry(async () => {
      const r = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${batch.map((s) => encodeURIComponent(s.id)).join(',')}&format=png&scale=0.5`, { headers: { 'X-Figma-Token': TOKEN } });
      if (!r.ok) throw new Error(`images ${r.status}`);
      return r.json();
    });
    for (const s of batch) {
      const url = j.images[s.id];
      if (!url) { out.push({ ...s, file: null }); continue; }
      try {
        const buf = await retry(async () => Buffer.from(await (await fetch(url)).arrayBuffer()));
        const file = `${s.id.replace(':', '-')}.png`;
        fs.writeFileSync(path.join(shots, file), buf);
        out.push({ ...s, file });
      } catch { out.push({ ...s, file: null }); }
    }
    process.stdout.write(`  ${Math.min(i + 8, picked.length)}/${picked.length}\n`);
  }
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)} — ${esc(service)}</title>
<style>body{font-family:Pretendard,-apple-system,sans-serif;margin:0;padding:28px;background:#fafafa;color:#1a1a1a}
h1{font-size:20px;margin:0 0 4px}p.sub{color:#666;font-size:13px;margin:0 0 24px}
.grid{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}
figure{margin:0;background:#fff;border:1px solid #e5e5e5;padding:10px;width:320px}
figure.wide{width:520px}
img{width:100%;display:block;border:1px solid #eee}
figcaption{font-size:12px;margin-top:8px;line-height:1.5}
figcaption b{display:block;font-size:13px}figcaption span{color:#888}</style></head><body>
<h1>${esc(title)} — ${esc(service)}</h1><p class="sub">${out.length}장 · Figma 원본 그림</p>
<div class="grid">
${out.map((s) => `<figure class="${s.w >= 1000 ? 'wide' : ''}">${s.file ? `<img src="shots/${s.file}" alt="">` : '<div style="padding:40px;text-align:center;color:#b00">그림 없음</div>'}
<figcaption><b>${esc(s.name)}</b><span>${esc(s.page)} · ${esc(s.size)}</span></figcaption></figure>`).join('\n')}
</div></body></html>`;
  const file = path.join(base, `shots-${slugTitle}.html`);
  fs.writeFileSync(file, html);
  console.log(`\n✅ ${out.length}장 → ${file}`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
