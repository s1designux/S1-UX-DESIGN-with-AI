/**
 * screen-structure.js — Figma 화면 프레임에서 "위에서 아래로 무엇이 놓였나" 를 뽑는다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜: 지금까지의 판독 원자료는 "이 화면에 어떤 부품이 몇 개 쓰였나" 만 담았다(순서 없음).
 *     화면을 빌더로 가져오거나, 로컬 모델로 "이런 차례가 반복된다" 를 찾으려면
 *     **세로 차례**가 있어야 한다.
 *
 * 경계선: 여기서는 읽기만 한다. 레거시 이름을 정본 이름으로 바꾸지 않는다
 *         (이름 대응은 legacy-name-resolve / 결정표의 몫).
 */

const NOISE = /^(Rectangle|Ellipse|Vector|Union|Line|Arrow|Subtract|Intersect|Exclude|Mask|bg|Bg|BG)\b/;

const box = (n) => n.absoluteBoundingBox || null;
const round = (v) => Math.round(v || 0);

/** 껍데기만 한 겹 있는 프레임을 벗겨 "진짜 내용이 쌓인 칸" 을 찾는다. */
function unwrap(node) {
  let cur = node;
  for (let i = 0; i < 4; i += 1) {
    const kids = (cur.children || []).filter((c) => box(c));
    if (kids.length !== 1) break;
    const k = kids[0];
    const a = box(cur); const b = box(k);
    if (!a || !b) break;
    const sameish = Math.abs(a.width - b.width) < 8 && Math.abs(a.height - b.height) < 24;
    if (!sameish || !(k.children || []).length) break;
    cur = k;
  }
  return cur;
}

/** 한 노드 아래에 쓰인 인스턴스 이름을 모은다. */
function instancesIn(node, out = []) {
  for (const c of node.children || []) {
    if (c.type === 'INSTANCE') out.push(c.name);
    instancesIn(c, out);
  }
  return out;
}

/** 한 노드 아래 첫 글자들을 모은다(내용 감 잡기용). */
function textsIn(node, out = [], limit = 4) {
  for (const c of node.children || []) {
    if (out.length >= limit) return out;
    if (c.type === 'TEXT' && c.characters) out.push(c.characters.replace(/\s+/g, ' ').trim().slice(0, 24));
    textsIn(c, out, limit);
  }
  return out;
}

/** Figma 가 자동으로 붙인 이름(Frame 12 · Group 3 …)인가 — 뜻이 없는 이름 */
const GENERIC_NAME = /^(Frame|Group|Rectangle|Ellipse|Vector|Union|Component|Instance|Slice|Line|Container|Auto layout)\s*\d*$/i;
const meaningfulName = (n) => (n && !GENERIC_NAME.test(n.trim()) ? n.trim().slice(0, 40) : '');

/** 한 칸을 "무엇인지" 한 줄로 이름 붙인다. */
function labelOf(node) {
  if (node.type === 'INSTANCE') return { kind: 'part', label: node.name };
  if (node.type === 'TEXT') {
    const t = (node.characters || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    return { kind: 'text', label: t ? `글자"${t}"` : '글자' };
  }
  const own = meaningfulName(node.name);
  const insts = instancesIn(node);
  if (insts.length) {
    const counts = {};
    for (const n of insts) counts[n] = (counts[n] || 0) + 1;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([n, c]) => (c > 1 ? `${n}×${c}` : n));
    return { kind: 'group', label: own ? `${own}(${top.join(', ')})` : `묶음(${top.join(', ')})`, parts: counts };
  }
  const tx = textsIn(node, [], 2);
  if (own) return { kind: 'group', label: tx.length ? `${own}(글자: ${tx.join(' / ')})` : own, parts: {} };
  if (tx.length) return { kind: 'group', label: `묶음(글자: ${tx.join(' / ')})`, parts: {} };
  return { kind: 'group', label: '묶음', parts: {} };
}

/**
 * 화면 프레임 → 세로 차례.
 * @param {object} frame  Figma 프레임 노드(children 포함)
 * @param {object} opts   { expandBody: true } — 가장 큰 본문 칸은 한 겹 더 펼친다
 * @returns {Array} [{ i, y, h, kind, label, name, type, id, depth, parts }]
 */
function extractOrder(frame, opts = {}) {
  const expandBody = opts.expandBody !== false;
  const root = unwrap(frame);
  const rb = box(root);
  const rows = [];

  const kids = (root.children || [])
    .filter((c) => box(c) && !(c.visible === false))
    .filter((c) => !(NOISE.test(c.name) && !(c.children || []).length))
    .sort((a, b) => box(a).y - box(b).y);

  // 본문 = 화면 높이의 35% 넘게 차지하면서 자식이 2개 이상인 칸 중 가장 큰 것
  let bodyId = null;
  if (expandBody && rb) {
    let best = null;
    for (const c of kids) {
      const b = box(c);
      if (!c.children || c.children.length < 2) continue;
      if (b.height < rb.height * 0.35) continue;
      if (!best || b.height > box(best).height) best = c;
    }
    if (best) bodyId = best.id;
  }

  const push = (node, depth) => {
    const b = box(node);
    const l = labelOf(node);
    rows.push({
      i: rows.length,
      id: node.id,
      name: node.name,
      type: node.type,
      x: round(b.x - (rb ? rb.x : 0)),
      y: round(b.y - (rb ? rb.y : 0)),
      h: round(b.height),
      w: round(b.width),
      depth,
      kind: l.kind,
      label: l.label,
      ...(l.parts && Object.keys(l.parts).length ? { parts: l.parts } : {}),
    });
  };

  for (const c of kids) {
    if (c.id === bodyId) {
      const inner = unwrap(c);
      const sub = (inner.children || [])
        .filter((x) => box(x) && !(x.visible === false))
        .filter((x) => !(NOISE.test(x.name) && !(x.children || []).length))
        .sort((a, b) => box(a).y - box(b).y);
      if (sub.length >= 2) {
        rows.push({
          i: rows.length, id: c.id, name: c.name, type: c.type,
          x: round(box(c).x - (rb ? rb.x : 0)),
          y: round(box(c).y - (rb ? rb.y : 0)), h: round(box(c).height), w: round(box(c).width),
          depth: 0, kind: 'body', label: '본문',
        });
        for (const s of sub) push(s, 1);
        continue;
      }
    }
    push(c, 0);
  }
  return rows;
}

/** 차례를 한 줄 문장으로 — 로컬 모델이 읽을 문장. */
function orderSentence(rows) {
  return rows.filter((r) => r.kind !== 'body').map((r) => r.label).join(' → ');
}

module.exports = { extractOrder, orderSentence, unwrap, instancesIn, textsIn, labelOf };
