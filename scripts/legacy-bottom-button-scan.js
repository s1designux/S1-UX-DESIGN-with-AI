#!/usr/bin/env node
/**
 * 레거시 덤프에서 '화면 맨 아래 붙는 버튼' 자리를 찾아 실측한다.
 * 정의: 폭 360 화면에서, 아래 틀(phone_navi) 바로 위에 있거나 화면 맨 아래에 있는 m_button.
 * 반올림 없음.
 * 출력: reports/composition-rules/2026-09-18-bottom-button.json
 */
const fs = require('fs');
const path = require('path');

const DUMP_DIR = 'reports/pattern-builder/inventory/modu-app/dumps';
const OUT = 'reports/composition-rules/2026-09-18-bottom-button.json';
const BTN = ['m_button', 'm_btn_full', 'm_subbutton', 'm_login_bottom'];
const attr = (line, k) => { const m = line.match(new RegExp(`${k}="([^"]*)"`)); return m ? m[1] : null; };

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let xml; try { xml = JSON.parse(raw).map((x) => x.text).join(''); } catch { xml = raw; }
  const nodes = [];
  for (const line of xml.split('\n')) {
    const m = line.match(/^(\s*)<([\w-]+)\s/);
    if (!m) continue;
    nodes.push({ depth: m[1].length / 2, type: m[2], id: attr(line, 'id'), name: (attr(line, 'name') || '').trim(),
      x: Number(attr(line, 'x')), y: Number(attr(line, 'y')), w: Number(attr(line, 'width')), h: Number(attr(line, 'height')) });
  }
  return { pageName: nodes[0] ? nodes[0].name : path.basename(file), nodes };
}

function absolutize(nodes) {
  const stack = [];
  for (const n of nodes) {
    while (stack.length && stack[stack.length - 1].depth >= n.depth) stack.pop();
    const p = stack[stack.length - 1];
    n.ax = (p ? p.ax : 0) + n.x; n.ay = (p ? p.ay : 0) + n.y;
    stack.push(n);
  }
}

const out = [];
for (const f of fs.readdirSync(DUMP_DIR).filter((x) => x.endsWith('.txt')).sort()) {
  const { pageName, nodes } = parse(path.join(DUMP_DIR, f));
  absolutize(nodes);
  for (let i = 0; i < nodes.length; i++) {
    const s = nodes[i];
    if (s.depth !== 1 || s.type === 'section' || s.w !== 360) continue;
    const kids = [];
    for (let j = i + 1; j < nodes.length && nodes[j].depth > 1; j++) kids.push(nodes[j]);
    const rel = kids.map((k) => ({ ...k, rx: k.ax - s.ax, ry: k.ay - s.ay }));
    const navs = rel.filter((k) => k.type === 'instance' && k.name.startsWith('phone_navi'));
    const navTop = navs.length ? Math.min(...navs.map((k) => k.ry)) : null;
    const anchor = navTop !== null ? navTop : s.h; // 버튼이 놓일 수 있는 바닥선
    const btns = rel.filter((k) => k.type === 'instance' && BTN.some((b) => k.name === b || k.name.startsWith(b + ' ')));
    // 바닥선에 붙은 버튼 = 버튼 아래끝이 바닥선에서 40 이내
    const bottom = btns.filter((k) => anchor - (k.ry + k.h) >= 0 && anchor - (k.ry + k.h) <= 40);
    if (!bottom.length) continue;
    for (const b of bottom) {
      // 버튼을 감싼 프레임(폭 360, 버튼을 포함) = 하단 버튼 영역
      const band = rel.filter((k) => k.type === 'frame' && k.w === 360 && k.ry <= b.ry && k.ry + k.h >= b.ry + b.h && k.h < 200)
        .sort((p, q) => p.h - q.h)[0] || null;
      out.push({
        page: pageName, screenId: s.id, screen: s.name, screenH: s.h,
        button: b.name, btnX: b.rx, btnY: b.ry, btnW: b.w, btnH: b.h,
        gapBelow: anchor - (b.ry + b.h),
        navTop, hasNav: navTop !== null,
        band: band ? { name: band.name, y: band.ry, h: band.h, padTop: b.ry - band.ry, padBottom: (band.ry + band.h) - (b.ry + b.h) } : null,
      });
    }
  }
}

const hist = (arr) => { const h = {}; arr.forEach((v) => { const k = v === null || v === undefined ? '없음' : String(v); h[k] = (h[k] || 0) + 1; }); return Object.entries(h).sort((a, b) => b[1] - a[1]); };
const withBand = out.filter((o) => o.band);
const summary = {
  발견: out.length,
  화면수: new Set(out.map((o) => o.screenId)).size,
  버튼종류: hist(out.map((o) => o.button)),
  버튼폭: hist(out.map((o) => o.btnW)),
  버튼높이: hist(out.map((o) => o.btnH)),
  버튼왼쪽: hist(out.map((o) => o.btnX)),
  아래틀까지: hist(out.map((o) => o.gapBelow)),
  띠높이: hist(withBand.map((o) => o.band.h)),
  띠위여백: hist(withBand.map((o) => o.band.padTop)),
  띠아래여백: hist(withBand.map((o) => o.band.padBottom)),
  내비있음: out.filter((o) => o.hasNav).length,
};
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: '2026-09-18', source: DUMP_DIR, summary, items: out }, null, 1));
console.log(JSON.stringify(summary, null, 1));
