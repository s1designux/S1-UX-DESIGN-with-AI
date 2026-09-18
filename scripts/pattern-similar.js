#!/usr/bin/env node
/**
 * pattern-similar.js — 로컬 모델로 "닮은 화면" 을 찾고 묶는다 (🖥️ qwen3-embedding:0.6b)
 * ─────────────────────────────────────────────────────────────────────────
 * 왜: 판독한 화면이 수백 장이라 사람이 눈으로 갈래를 나누기 어렵고, 그렇다고 Claude 가
 *     전부 읽으면 토큰이 크다. 화면 이름과 쓰인 부품을 로컬 모델이 벡터로 바꿔
 *     **이 맥 안에서** 닮은 것끼리 묶는다. 토큰 0.
 *
 * 경계선: 결과는 **후보**다. "이 묶음이 곧 패턴이다" 라고 판정하지 않는다.
 *         규칙 저작·판정은 사람과 Claude 의 몫이다(로컬 모델은 판정에 쓰지 않는다).
 *
 * 사용:
 *   node scripts/pattern-similar.js <service> --cluster            갈래 후보 만들기
 *   node scripts/pattern-similar.js <service> --cluster --by order  **차례**로 묶기(위→아래 순서)
 *   node scripts/pattern-similar.js <service> --similar "검색 결과가 없을 때"
 *   node scripts/pattern-similar.js <service> --cluster --threshold 0.82
 *
 * 준비: ollama 가 떠 있어야 한다 (`ollama serve`). 모델 `qwen3-embedding:0.6b`.
 * 출력 끝줄: `PATTERNSIM_SUMMARY screens=<n> clusters=<n> cached=<n> sec=<n>`
 */
const fs = require('fs');
const path = require('path');

const MODEL = 'qwen3-embedding:0.6b';
const HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

const argv = process.argv.slice(2);
const service = argv.find((a) => !a.startsWith('--')) || 'modu-app';
const mode = argv.includes('--similar') ? 'similar' : 'cluster';
const query = mode === 'similar' ? argv[argv.indexOf('--similar') + 1] : null;
const thresholdArg = Number(argv[argv.indexOf('--threshold') + 1]) || 0;
/* --by order = "이 화면에 무엇이 쓰였나" 가 아니라 "위에서 아래로 어떤 차례로 놓였나" 로 묶는다.
   같은 부품을 써도 차례가 다르면 다른 화면이고, 차례가 같으면 같은 틀이다. */
const by = argv.includes('--by') ? argv[argv.indexOf('--by') + 1] : 'parts';
if (!['parts', 'order'].includes(by)) { console.error("❌ --by 는 parts 또는 order 입니다."); process.exit(1); }
/* 차례 문장은 부품 목록보다 서로 닮아 보이므로 기준을 더 높게 잡는다(1004장 실측: 0.86→109묶음이라 너무 뭉친다). */
const threshold = thresholdArg || (by === 'order' ? 0.92 : 0.86);
const topN = Number(argv[argv.indexOf('--top') + 1]) || 10;

const base = path.join('reports/pattern-builder/inventory', service);
const rawDir = path.join(base, by === 'order' ? 'order' : 'raw');
if (!fs.existsSync(rawDir)) {
  console.error(by === 'order'
    ? `❌ 차례 자료가 없습니다: ${rawDir}  → 먼저 \`npm run pattern:order -- ${service} --from-raw\``
    : `❌ 판독 원자료가 없습니다: ${rawDir}`);
  process.exit(1);
}

// ── 화면 모으기 ──────────────────────────────────────────────────────────
const noise = /^(Frame|Group|Rectangle|Line|Arrow|Ellipse|Vector|Union|Component)\b/i;
const screens = [];
for (const f of fs.readdirSync(rawDir).filter((x) => x.endsWith('.json')).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(rawDir, f), 'utf8'));
  for (const s of j.screens) {
    const [w, h] = s.size.split('x').map(Number);
    if (h < 400 || w < 300 || noise.test(s.name)) continue;
    if (by === 'order') {
      const seq = s.orderText || '';
      if (!seq) continue;
      screens.push({
        id: s.id,
        name: s.name,
        page: j._meta.page.name,
        size: s.size,
        rowCount: s.rowCount,
        orderText: seq,
        // 이름을 빼고 **차례만** 넣는다 — 이름이 비슷해서 묶이는 것을 막는다.
        text: `차례: ${seq}`,
      });
      continue;
    }
    screens.push({
      id: s.id,
      name: s.name,
      page: j._meta.page.name,
      size: s.size,
      parts: s.components.map((c) => c.name),
      text: `${s.name} / 부품: ${s.components.map((c) => `${c.name}×${c.count}`).join(', ') || '없음'}`,
    });
  }
}

// ── 임베딩 (캐시) ────────────────────────────────────────────────────────
const cachePath = path.join(base, by === 'order' ? '.embeddings-order.json' : '.embeddings.json');
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : { model: MODEL, vectors: {} };
if (cache.model !== MODEL) { cache.model = MODEL; cache.vectors = {}; }

async function embed(text) {
  const res = await fetch(`${HOST}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt: text }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status} — \`ollama serve\` 가 떠 있는지 확인하세요`);
  const j = await res.json();
  return j.embedding;
}

const norm = (v) => { const n = Math.hypot(...v); return v.map((x) => x / (n || 1)); };
const cos = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);

(async () => {
  const t0 = Date.now();
  let hits = 0;
  for (const s of screens) {
    if (cache.vectors[s.text]) { hits++; s.vec = cache.vectors[s.text]; continue; }
    s.vec = norm(await embed(s.text));
    cache.vectors[s.text] = s.vec;
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache));

  if (mode === 'similar') {
    const qv = norm(await embed(query));
    const ranked = screens.map((s) => ({ s, score: cos(qv, s.vec) })).sort((a, b) => b.score - a.score).slice(0, topN);
    console.log(`🖥️ ${MODEL} — "${query}" 와 닮은 화면 ${ranked.length}장\n`);
    for (const { s, score } of ranked) {
      console.log(`  ${score.toFixed(3)}  ${s.name}  [${s.page}]  ${s.size}  ${s.id}`);
      if (by === 'order') console.log(`          ${String(s.orderText).slice(0, 140)}`);
    }
    console.log(`\nPATTERNSIM_SUMMARY screens=${screens.length} clusters=0 cached=${hits} sec=${((Date.now() - t0) / 1000).toFixed(1)}`);
    return;
  }

  // ── 묶기 — 가장 닮은 것에 붙이는 단순 방식(임계값 넘을 때만) ──────────
  const clusters = [];
  for (const s of screens) {
    let best = null; let bestScore = -1;
    for (const c of clusters) {
      const score = cos(s.vec, c.centroid);
      if (score > bestScore) { bestScore = score; best = c; }
    }
    if (best && bestScore >= threshold) {
      best.members.push(s);
      const n = best.members.length;
      best.centroid = norm(best.centroid.map((x, i) => x + (s.vec[i] - x) / n));
    } else {
      clusters.push({ centroid: s.vec.slice(), members: [s] });
    }
  }
  clusters.sort((a, b) => b.members.length - a.members.length);

  const esc = (t) => String(t || '').replace(/\|/g, '/');
  const many = clusters.filter((c) => c.members.length > 1);
  const alone = clusters.filter((c) => c.members.length === 1);

  const lines = by === 'order'
    ? [
      `# ${service} — 되풀이되는 **차례** 묶음 (기계 제안)`,
      '',
      `> 🖥️ \`${MODEL}\` 이 **위에서 아래로 놓인 차례**만 보고 닮은 것끼리 묶은 **후보**다.`,
      `> 화면 이름은 넣지 않았다 — 이름이 비슷해서 묶이는 것을 막으려고.`,
      `> 이 묶음이 곧 패턴이라는 뜻이 아니다. 사람이 보고 갈래를 정한다.`,
      `> 칸 이름은 **레거시 그대로**이며 정본 이름이 아니다.`,
      `> 화면 ${screens.length}장 · 묶음 ${clusters.length}개 · 닮음 기준 ${threshold}`,
      '',
      '| # | 몇 장 | 대표 차례 | 대표 화면 | 같이 묶인 화면 |',
      '|---|---|---|---|---|',
      ...many.map((c, i) =>
        `| ${i + 1} | ${c.members.length} | ${esc(c.members[0].orderText).slice(0, 120)} | ${esc(c.members[0].name)} | ${c.members.slice(1, 5).map((m) => esc(m.name)).join(' · ')}${c.members.length > 5 ? ` … 외 ${c.members.length - 5}` : ''} |`),
      '',
      `## 혼자인 화면 ${alone.length}장`,
      '',
      alone.map((c) => esc(c.members[0].name)).join(' · '),
      '',
    ]
    : [
      `# ${service} — 닮은 화면 묶음 (기계 제안)`,
      '',
      `> 🖥️ \`${MODEL}\` 이 화면 이름과 쓰인 부품만 보고 닮은 것끼리 묶은 **후보**다.`,
      `> 이 묶음이 곧 패턴이라는 뜻이 아니다. 사람이 보고 갈래를 정한다.`,
      `> 화면 ${screens.length}장 · 묶음 ${clusters.length}개 · 닮음 기준 ${threshold}`,
      '',
      '| # | 크기 | 대표 이름 | 같이 묶인 화면 |',
      '|---|---|---|---|',
      ...many.map((c, i) =>
        `| ${i + 1} | ${c.members.length} | ${esc(c.members[0].name)} | ${c.members.slice(1, 6).map((m) => esc(m.name)).join(' · ')}${c.members.length > 6 ? ` … 외 ${c.members.length - 6}` : ''} |`),
      '',
      `## 혼자인 화면 ${alone.length}장`,
      '',
      alone.map((c) => esc(c.members[0].name)).join(' · '),
      '',
    ];
  const out = path.join(base, by === 'order' ? 'order-clusters.md' : 'similar-clusters.md');
  fs.writeFileSync(out, lines.join('\n'));
  console.log(`🖥️ ${MODEL} — 화면 ${screens.length}장을 묶음 ${clusters.length}개로. → ${out}`);
  console.log(`PATTERNSIM_SUMMARY screens=${screens.length} clusters=${clusters.length} cached=${hits} sec=${((Date.now() - t0) / 1000).toFixed(1)}`);
})();
