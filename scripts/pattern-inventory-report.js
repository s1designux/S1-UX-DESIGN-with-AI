#!/usr/bin/env node
/**
 * raw/*.json(기계 판독 원자료) → 사람이 보는 판독표(md) + 한눈 개요(html)
 * 사용: node scripts/pattern-inventory-report.js <service>
 */
const fs = require('fs');
const path = require('path');

const service = process.argv[2] || 'modu-app';
const base = path.join('reports/pattern-builder/inventory', service);
const rawDir = path.join(base, 'raw');
const files = fs.readdirSync(rawDir).filter((f) => f.endsWith('.json')).sort();

const noise = /^(Frame|Group|Rectangle|Line|Arrow|Ellipse|Vector|Union|Component)\b/i;
const pages = [];

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(rawDir, f), 'utf8'));
  const slug = f.replace(/\.json$/, '');
  const real = d.screens.filter((s) => {
    const [w, h] = d._meta && s.size.split('x').map(Number);
    return h >= 400 && w >= 300 && !noise.test(s.name);
  });
  pages.push({ slug, page: d._meta.page, all: d.screens, real, usage: d.componentUsage });

  const md = [
    `# ${d._meta.page.name} — 레거시 판독표 (${service})`,
    '',
    `> 원본: Figma 페이지 \`${d._meta.page.nodeId}\` · 읽은 날 ${d._meta.generatedAt}`,
    `> 기계 판독 원자료: \`raw/${f}\`. 이 표는 그 자료를 사람이 보게 편 것이고, **해석·규칙은 여기에 쓰지 않는다.**`,
    '',
    `## 요약`,
    '',
    `| 항목 | 값 |`,
    `|---|---|`,
    `| 캔버스 위 노드 | ${d.screens.length}개 |`,
    `| 화면으로 볼 것(360폭·400높이 이상) | ${real.length}개 |`,
    `| 쓰인 부품 종류 | ${d.componentUsage.length}종 |`,
    '',
    `## 화면 목록`,
    '',
    `| # | 화면 이름 | 크기 | 쓰인 부품 | 노드 |`,
    `|---|---|---|---|---|`,
    ...real.map((s, i) => `| ${i + 1} | ${s.name.replace(/\|/g, '/')} | ${s.size} | ${s.components.map((c) => c.name + (c.count > 1 ? `×${c.count}` : '')).join(', ') || '—'} | \`${s.id}\` |`),
    '',
    `## 이 페이지에서 많이 쓰인 부품`,
    '',
    `| 부품 | 횟수 |`,
    `|---|---|`,
    ...d.componentUsage.slice(0, 30).map((c) => `| ${c.name} | ${c.count} |`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(base, `${slug}.md`), md);
}

// 서비스 전체 부품 빈도
const total = {};
for (const p of pages) for (const c of p.usage) total[c.name] = (total[c.name] || 0) + c.count;
const usageAll = Object.entries(total).sort((a, b) => b[1] - a[1]);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<title>${esc(service)} 레거시 판독 한눈표</title>
<style>
 body{font-family:Pretendard,-apple-system,sans-serif;margin:0;padding:32px;background:#fafafa;color:#1a1a1a}
 h1{font-size:22px;margin:0 0 4px} p.sub{color:#666;font-size:13px;margin:0 0 28px}
 h2{font-size:16px;margin:32px 0 10px}
 table{border-collapse:collapse;width:100%;background:#fff;font-size:13px}
 th,td{border:1px solid #e5e5e5;padding:7px 10px;text-align:left;vertical-align:top}
 th{background:#f2f2f2;font-weight:600}
 td.num{text-align:right;font-variant-numeric:tabular-nums}
 .bar{display:inline-block;height:9px;background:#3b6fd4;border-radius:2px;vertical-align:middle}
 .miss{color:#b00}
 details{background:#fff;border:1px solid #e5e5e5;margin-bottom:8px;padding:10px 14px}
 summary{cursor:pointer;font-weight:600;font-size:14px}
 ul.sc{margin:10px 0 0;padding-left:18px;font-size:13px;color:#333;columns:2}
</style></head><body>
<h1>${esc(service)} — 레거시 화면 판독 한눈표</h1>
<p class="sub">Figma 원본을 기계로 읽어 모은 것. 화면 이름·크기·쓰인 부품만 있고 해석은 없다. 생성 ${new Date().toISOString().slice(0, 10)}</p>

<h2>페이지별 수집 현황</h2>
<table><tr><th>페이지</th><th class="num">화면</th><th class="num">부품 종류</th></tr>
${pages.map((p) => `<tr><td>${esc(p.page.name)}</td><td class="num">${p.real.length}</td><td class="num">${p.usage.length}</td></tr>`).join('\n')}
<tr><th>합계</th><th class="num">${pages.reduce((a, p) => a + p.real.length, 0)}</th><th class="num">${usageAll.length}</th></tr>
</table>

<h2>가장 많이 쓰인 부품 (서비스 전체)</h2>
<table><tr><th>부품</th><th class="num">횟수</th><th>비중</th></tr>
${usageAll.slice(0, 40).map(([n, c]) => `<tr><td>${esc(n)}</td><td class="num">${c}</td><td><span class="bar" style="width:${Math.round((c / usageAll[0][1]) * 260)}px"></span></td></tr>`).join('\n')}
</table>

<h2>페이지별 화면 목록</h2>
${pages.map((p) => `<details><summary>${esc(p.page.name)} — ${p.real.length}개</summary>
<ul class="sc">${p.real.map((s) => `<li>${esc(s.name)} <span style="color:#999">${esc(s.size)}</span></li>`).join('')}</ul></details>`).join('\n')}
</body></html>
`;
fs.writeFileSync(path.join(base, 'index.html'), html);
console.log(`판독표 ${pages.length}장 + 한눈표 1장 · 화면 ${pages.reduce((a, p) => a + p.real.length, 0)}개 · 부품 ${usageAll.length}종`);
