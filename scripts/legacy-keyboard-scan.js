#!/usr/bin/env node
/**
 * 레거시 덤프에서 '키보드가 올라온 화면'을 찾아, 그때 하단 버튼이 어떻게 놓이는지 실측한다.
 * 반올림 없음.
 * 출력: reports/composition-rules/2026-09-18-keyboard.json
 */
const fs = require('fs');
const path = require('path');

const DUMP_DIR = 'reports/pattern-builder/inventory/modu-app/dumps';
const OUT = 'reports/composition-rules/2026-09-18-keyboard.json';
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
    const kb = rel.filter((k) => k.type === 'instance' && k.name.startsWith('keyboard'));
    if (!kb.length) continue;
    const k0 = kb.sort((a, b) => a.ry - b.ry)[0];
    const navs = rel.filter((k) => k.type === 'instance' && k.name.startsWith('phone_navi'));
    const btns = rel.filter((k) => k.type === 'instance' && BTN.some((b) => k.name === b || k.name.startsWith(b + ' ')));
    // 키보드 바로 위 버튼 = 버튼 아래끝이 키보드 위끝에서 40 이내
    const above = btns.filter((b) => k0.ry - (b.ry + b.h) >= -1 && k0.ry - (b.ry + b.h) <= 40)
      .sort((a, b) => b.ry - a.ry)[0] || null;
    out.push({
      page: pageName, screenId: s.id, screen: s.name, screenH: s.h,
      kbTop: k0.ry, kbH: k0.h, kbW: k0.w,
      hasNav: navs.length > 0,
      button: above ? { name: above.name, x: above.rx, y: above.ry, w: above.w, h: above.h, gapToKb: k0.ry - (above.ry + above.h) } : null,
      buttonsOnScreen: btns.map((b) => b.name),
    });
  }
}

const hist = (arr) => { const h = {}; arr.forEach((v) => { const k = v === null || v === undefined ? '없음' : String(v); h[k] = (h[k] || 0) + 1; }); return Object.entries(h).sort((a, b) => b[1] - a[1]); };
const withBtn = out.filter((o) => o.button);
const summary = {
  키보드화면: out.length,
  키보드위끝: hist(out.map((o) => o.kbTop)),
  키보드높이: hist(out.map((o) => o.kbH)),
  키보드폭: hist(out.map((o) => o.kbW)),
  내비함께: hist(out.map((o) => (o.hasNav ? '있음' : '없음'))),
  키보드위버튼: hist(out.map((o) => (o.button ? o.button.name : '없음'))),
  버튼폭: hist(withBtn.map((o) => o.button.w)),
  버튼높이: hist(withBtn.map((o) => o.button.h)),
  버튼왼쪽: hist(withBtn.map((o) => o.button.x)),
  버튼아래에서키보드까지: hist(withBtn.map((o) => o.button.gapToKb)),
  화면높이: hist(out.map((o) => o.screenH)),
};
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: '2026-09-18', source: DUMP_DIR, summary, items: out }, null, 1));
console.log(JSON.stringify(summary, null, 1));
