#!/usr/bin/env node
/**
 * Figma get_metadata 덤프에서 화면 뼈대(위 틀·본문·아래 틀)와 좌우 여백을 실측한다.
 * 반올림·보정 없음. 값이 없으면 null.
 * 사용: node scripts/legacy-skeleton-measure.js  → reports/composition-rules/2026-09-18-skeleton-measure.json
 */
const fs = require('fs');
const path = require('path');

const DUMP_DIR = 'reports/pattern-builder/inventory/modu-app/dumps';
const OUT = 'reports/composition-rules/2026-09-18-skeleton-measure.json';

const TOP = ['m_StatusBar', 'appbar_sub', 'header', 'header_1', 'title_'];
const BOTTOM = ['phone_navi', 'Footer']; // m_bar 는 높이 1 의 구분선이라 아래 틀이 아니다
const attr = (line, k) => { const m = line.match(new RegExp(`${k}="([^"]*)"`)); return m ? m[1] : null; };

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let xml; try { xml = JSON.parse(raw).map((x) => x.text).join(''); } catch { xml = raw; }
  const nodes = [];
  for (const line of xml.split('\n')) {
    const m = line.match(/^(\s*)<([\w-]+)\s/);
    if (!m) continue;
    nodes.push({ depth: m[1].length / 2, type: m[2], id: attr(line, 'id'), name: (attr(line, 'name') || '').trim(),
      x: Number(attr(line, 'x')), y: Number(attr(line, 'y')), w: Number(attr(line, 'width')), h: Number(attr(line, 'height')),
      selfClose: /\/>\s*$/.test(line) });
  }
  const pageName = nodes[0] ? nodes[0].name : path.basename(file);
  return { pageName, nodes };
}

// 절대좌표 계산: 부모 스택
function absolutize(nodes) {
  const stack = [];
  for (const n of nodes) {
    while (stack.length && stack[stack.length - 1].depth >= n.depth) stack.pop();
    const p = stack[stack.length - 1];
    n.ax = (p ? p.ax : 0) + n.x; n.ay = (p ? p.ay : 0) + n.y;
    stack.push(n);
  }
}

function screensOf(nodes) {
  const out = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const isScreen = (n.depth === 1 && n.type !== 'section') || (n.depth === 2 && nodes.slice(0, i).reverse().find((p) => p.depth === 1)?.type === 'section');
    if (!isScreen) continue;
    if (n.w !== 360) continue;
    const kids = [];
    for (let j = i + 1; j < nodes.length && nodes[j].depth > n.depth; j++) kids.push(nodes[j]);
    out.push({ n, kids });
  }
  return out;
}

function measure(screen) {
  const { n: s, kids } = screen;
  // 화면 기준 상대좌표
  const rel = kids.map((k) => ({ ...k, rx: k.ax - s.ax, ry: k.ay - s.ay }));
  const inst = (names) => rel.filter((k) => k.type === 'instance' && names.some((nm) => k.name === nm || k.name.startsWith(nm + ' ')));
  const tops = inst(TOP), bots = inst(BOTTOM);
  const topEnd = tops.length ? Math.max(...tops.map((k) => k.ry + k.h)) : null;      // 위 틀 아래 끝
  const botStart = bots.length ? Math.min(...bots.map((k) => k.ry)) : null;          // 아래 틀 위 끝
  const botH = bots.length ? s.h - botStart : null;
  // 본문 = 위 틀 아래 ~ 아래 틀 위, 글자/부품(잎 노드)만
  const leaves = rel.filter((k) => k.type !== 'frame' && k.type !== 'group' && k.type !== 'section' && !tops.includes(k) && !bots.includes(k)
    && !(k.type === 'instance' && [...TOP, ...BOTTOM].some((nm) => k.name.startsWith(nm))));
  const body = leaves.filter((k) => (topEnd === null || k.ry >= topEnd) && (botStart === null || k.ry + k.h <= botStart) && k.w > 0 && k.w < 360);
  const firstBody = body.length ? Math.min(...body.map((k) => k.ry)) : null;
  const leftGap = body.length ? Math.min(...body.map((k) => k.rx)) : null;
  const rightGap = body.length ? Math.min(...body.map((k) => s.w - (k.rx + k.w))) : null;
  // 폭 360 인 본문 줄(가로 꽉 찬 줄) 안의 첫 글자/부품 x
  return {
    id: s.id, name: s.name, w: s.w, h: s.h,
    top: tops.map((k) => ({ name: k.name, y: k.ry, h: k.h })),
    bottom: bots.map((k) => ({ name: k.name, y: k.ry, h: k.h })),
    topEnd, bodyStart: firstBody, gapTopToBody: topEnd !== null && firstBody !== null ? firstBody - topEnd : null,
    botStart, botH, leftGap, rightGap,
  };
}

const files = fs.readdirSync(DUMP_DIR).filter((f) => f.endsWith('.txt')).sort();
const all = [];
for (const f of files) {
  const { pageName, nodes } = parse(path.join(DUMP_DIR, f));
  absolutize(nodes);
  for (const sc of screensOf(nodes)) all.push({ page: pageName, file: f, ...measure(sc) });
}

const hist = (arr) => { const h = {}; arr.forEach((v) => { const k = v === null ? '없음' : String(v); h[k] = (h[k] || 0) + 1; }); return Object.entries(h).sort((a, b) => b[1] - a[1]); };
const withTopBot = all.filter((s) => s.topEnd !== null && s.botStart !== null);
const base = all.filter((s) => s.h === 780); // 바탕 크기 화면만
const summaryOf = (set) => ({
  총화면: set.length,
  위틀_아래끝: hist(set.map((s) => s.topEnd)),
  위틀에서_본문까지: hist(set.map((s) => s.gapTopToBody)),
  아래틀_높이: hist(set.map((s) => s.botH)),
  왼쪽여백: hist(set.map((s) => s.leftGap)),
  오른쪽여백: hist(set.map((s) => s.rightGap)),
});
const summary = {
  총화면: all.length, 위아래틀둘다: withTopBot.length, 바탕780: summaryOf(base),
  위틀_아래끝: hist(all.map((s) => s.topEnd)),
  상태표시줄_높이: hist(all.flatMap((s) => s.top.filter((t) => t.name.startsWith('m_StatusBar')).map((t) => t.h))),
  제목줄_y: hist(all.flatMap((s) => s.top.filter((t) => t.name === 'appbar_sub').map((t) => t.y))),
  제목줄_높이: hist(all.flatMap((s) => s.top.filter((t) => t.name === 'appbar_sub').map((t) => t.h))),
  위틀에서_본문까지: hist(all.map((s) => s.gapTopToBody)),
  아래틀_높이: hist(all.map((s) => s.botH)),
  기기내비_높이: hist(all.flatMap((s) => s.bottom.filter((t) => t.name === 'phone_navi').map((t) => t.h))),
  탭바_높이: hist(all.flatMap((s) => s.bottom.filter((t) => t.name === 'm_bar').map((t) => t.h))),
  왼쪽여백: hist(all.map((s) => s.leftGap)),
  오른쪽여백: hist(all.map((s) => s.rightGap)),
  화면높이: hist(all.map((s) => s.h)),
};
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: '2026-09-18', source: DUMP_DIR + ' (figma-local get_metadata, 7 페이지)', summary, screens: all }, null, 1));
console.log(JSON.stringify(summary, null, 1));
