#!/usr/bin/env node
/**
 * doc-find-eval.js  (문서 검색 정확도 전수 평가)
 * ─────────────────────────────────────────────────────────────────────────
 * **doc-find 의 적중률을, 사람이 지어낸 질문이 아니라 저장소에서 뽑은 질문으로 잰다.**
 *
 * 왜 필요했나 (2026-09-04, river 지시 "더 많은 사례로 테스트해봐"):
 *   최초 검증은 ⭐ 가 만든 질문 8개였다 — 만든 자가 시험지도 낸 셈이라 믿을 수 없다.
 *   질문을 **문서 자체에서 기계적으로 뽑으면** 고르는 단계에서의 편향이 사라진다.
 *
 * 시험 3종 (난이도 순):
 *   E1 제목으로 찾기 — 질문 = 그 섹션의 제목. 청크 전수.
 *      쉬운 시험이다(제목은 임베딩 입력에 포함돼 있다). **여기서 못 맞히면 고장난 것**이라는
 *      바닥선 검사이지, 실사용 적중률이 아니다.
 *   E2 본문으로 찾기 — 질문 = 그 섹션 본문 가운데 한 줄(제목 제외). 청크 전수.
 *      "제목은 기억 안 나고 내용만 기억날 때" 에 가깝다. 이웃 청크와의 경쟁을 본다.
 *   E3 실제 문장으로 찾기 — 질문 = `reports/repeated-requests.json` 의 라벨.
 *      몇 달에 걸쳐 실제로 쓰인 문장이라 ⭐ 가 지금 지어낸 말이 아니다.
 *      정답 라벨이 없으므로 적중률 대신 **점수 분포**를 본다(0.55 눈금이 맞는지).
 *
 * 함께 재는 것 — 키워드 가중치 절제 실험(ablation):
 *   `--weights 0,0.15,0.3` 처럼 여러 값으로 같은 시험을 돌려, 하이브리드가 정말
 *   도움이 되는지 비교한다. 2026-09-04 의 0.15 는 사례 1건(Gate 34)만 보고 정한 값이라
 *   전수로 다시 확인할 필요가 있었다.
 *
 * 한계 (정직하게):
 *   · E1·E2 의 질문은 원문에서 그대로 떼어낸 말이라 **낱말이 겹친다**. 실제 질문처럼
 *     다른 말로 바꿔 묻는 경우(패러프레이즈)는 이 시험이 재지 못한다 — 그건 사람이
 *     실제로 써 보며 모은 사례로만 잴 수 있다.
 *   · 제목이 같은 청크가 여럿이면 E1 에서 억울한 오답이 난다. 그 수를 함께 보고한다.
 *
 * 사용:
 *   node scripts/doc-find-eval.js                    # 전체(E1·E2·E3)
 *   node scripts/doc-find-eval.js --only E2
 *   node scripts/doc-find-eval.js --weights 0,0.15,0.3
 *   node scripts/doc-find-eval.js --sample 150       # 표본만(빠르게)
 *
 * 출력 끝줄: `DOCEVAL_SUMMARY e1@1=<pct> e2@1=<pct> e3low=<n>/<n> best_w=<n> sec=<n>`
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_FILE = path.join(ROOT, '.claude/cache/doc-index.json');
const OLLAMA = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const BATCH = 16;
const LOW_SCORE = 0.55; // doc-find 의 "낮다" 눈금

const argv = process.argv.slice(2);
const val = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const ONLY = val('--only', '');
const SAMPLE = parseInt(val('--sample', '0'), 10);
const WEIGHTS = val('--weights', '0,0.15,0.3').split(',').map(Number);

if (!fs.existsSync(INDEX_FILE)) { console.error('❌ 색인이 없다. 먼저: npm run docs:index'); process.exit(1); }
const idx = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
const MODEL = idx._meta.model;

async function embed(inputs) {
  const out = [];
  for (let i = 0; i < inputs.length; i += BATCH) {
    const res = await fetch(`${OLLAMA}/api/embed`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, input: inputs.slice(i, i + BATCH) }),
    });
    if (!res.ok) throw new Error(`ollama ${res.status}`);
    const j = await res.json();
    for (const v of j.embeddings) {
      let s = 0; for (const x of v) s += x * x;
      const n = Math.sqrt(s) || 1;
      out.push(v.map((x) => x / n));
    }
    process.stderr.write(`\r    임베딩 ${Math.min(i + BATCH, inputs.length)}/${inputs.length}`);
  }
  process.stderr.write('\n');
  return out;
}

/** doc-find 와 동일한 채점식이어야 의미가 있다 — 여기서 그대로 복제한다. */
function score(qvec, query, weight) {
  const terms = [...new Set(query.toLowerCase().split(/[^0-9a-z가-힣_-]+/).filter((t) => t.length >= 2))];
  const stems = terms.map((t) => (/[가-힣]/.test(t) && t.length >= 3 ? t.slice(0, Math.max(2, t.length - 2)) : t));
  return idx.chunks.map((c, ci) => {
    let dot = 0;
    for (let i = 0; i < qvec.length; i++) dot += qvec[i] * c.vec[i];
    let hit = 0;
    if (c.lc && terms.length) {
      for (let i = 0; i < terms.length; i++) if (c.lc.includes(terms[i]) || c.lc.includes(stems[i])) hit++;
      hit /= terms.length;
    }
    return { ci, s: dot + weight * hit };
  }).sort((a, b) => b.s - a.s);
}

/** 청크 본문 가운데의 '내용 있는' 한 줄을 고른다(제목·표구분선·빈줄 제외). */
function bodyLine(c) {
  const lines = fs.readFileSync(path.join(ROOT, c.file), 'utf8').split('\n').slice(c.startLine - 1, c.endLine);
  const cand = lines.filter((l) => {
    const t = l.trim();
    return t.length >= 25 && !/^#{1,6}\s/.test(t) && !/^[|\-–—=:`>*\s]+$/.test(t) && !/^```/.test(t);
  });
  if (!cand.length) return null;
  return cand[Math.floor(cand.length / 2)].trim().replace(/[*_`>|]/g, ' ').replace(/\s+/g, ' ').slice(0, 120);
}

(async () => {
  const t0 = Date.now();
  let pool = idx.chunks.map((c, i) => ({ ...c, ci: i }));
  if (SAMPLE > 0 && SAMPLE < pool.length) {
    const step = pool.length / SAMPLE;
    pool = Array.from({ length: SAMPLE }, (_, k) => pool[Math.floor(k * step)]);
  }

  const crumbCount = {};
  for (const c of idx.chunks) crumbCount[c.crumb] = (crumbCount[c.crumb] || 0) + 1;
  const dupTitles = pool.filter((c) => crumbCount[c.crumb] > 1).length;

  const results = {};

  // ── E1 / E2 ───────────────────────────────────────────────────────────────
  for (const [name, mk] of [
    ['E1', (c) => c.crumb.split('›').pop().trim().replace(/\s*\(\d+부\)$/, '')],
    ['E2', (c) => bodyLine(c)],
  ]) {
    if (ONLY && ONLY !== name) continue;
    const cases = pool.map((c) => ({ c, q: mk(c) })).filter((x) => x.q && x.q.length >= 4);
    console.log(`\n▶ ${name} — 질문 ${cases.length}개 (${name === 'E1' ? '섹션 제목' : '본문 한 줄'})`);
    const vecs = await embed(cases.map((x) => x.q));
    results[name] = {};
    for (const w of WEIGHTS) {
      let r1 = 0, r3 = 0, r5 = 0, mrr = 0;
      cases.forEach((x, i) => {
        const rank = score(vecs[i], x.q, w).findIndex((r) => r.ci === x.c.ci) + 1;
        if (rank === 1) r1++;
        if (rank >= 1 && rank <= 3) r3++;
        if (rank >= 1 && rank <= 5) r5++;
        if (rank >= 1) mrr += 1 / rank;
      });
      const n = cases.length;
      results[name][w] = { r1: r1 / n, r3: r3 / n, r5: r5 / n, mrr: mrr / n, n };
      console.log(`   가중치 ${String(w).padEnd(5)} → 1위 적중 ${(r1 / n * 100).toFixed(1)}% · 3위내 ${(r3 / n * 100).toFixed(1)}% · 5위내 ${(r5 / n * 100).toFixed(1)}% · MRR ${(mrr / n).toFixed(3)}`);
    }
  }

  // ── E4 패러프레이즈 ───────────────────────────────────────────────────────
  // 유일하게 **낱말 겹침이 낮은** 시험이라, 키워드 가중치를 정하는 근거는 여기에만 있다.
  // (E1·E2 는 질문이 원문에서 떼어낸 말이라 가중치를 올릴수록 무조건 좋아진다 — 오염됨.)
  const PARA = path.join(ROOT, '.claude/cache/eval-paraphrase.json');
  if ((!ONLY || ONLY === 'E4') && fs.existsSync(PARA)) {
    const pj = JSON.parse(fs.readFileSync(PARA, 'utf8'));
    // 원문 낱말이 많이 남은 문항은 버린다 — 그런 건 E2 와 다를 바 없다.
    // 거르는 기준은 **겹침 50% 이하** 하나뿐이다 — 원문 낱말을 그대로 옮긴 문항은
    // E2 와 다를 바 없기 때문.
    //
    // 시도했다가 버린 것 (2026-09-04, 기록으로 남긴다):
    //   시험지에는 "이 검증 프로그램은 어떻게 작동하는가?" 처럼 **어느 섹션을 묻는지
    //   알 수 없는 질문**이 섞여 있다. 어떤 검색기도 못 맞히므로 도구가 아니라 시험지의
    //   결함인데, 이를 기계로 걸러 보려고 "희귀 낱말(전체 청크 5% 이하 출현)이 하나도
    //   없으면 버린다" 는 규칙을 넣었다 — **실패했다.** 한국어는 "작동하는가" 같은
    //   활용형이 문자열로는 희귀해서, 막연한 질문이 그대로 통과하고 엉뚱한 것만 걸러졌다.
    //   숫자가 좋아 보일 때까지 필터를 고치는 것은 자기기만이라, 필터를 없애고
    //   **낮은 점수를 그대로 보고**한다. 따라서 E4 수치는 **하한선**이다 —
    //   못 맞힌 것 중 일부는 애초에 맞힐 수 없는 문항이다.
    const strict = pj.rows.filter((r) => r.overlap <= 0.5);
    console.log(`\n▶ E4 — 질문 ${strict.length}개 (로컬 모델이 바꿔 쓴 질문 · 겹침 50% 이하만)`);
    console.log(`   시험지 출제: ${pj._meta.by} · 전체 ${pj.rows.length}문항 중 겹침 낮은 것만 채택`);
    const vecs = await embed(strict.map((r) => r.q));
    results.E4 = {};
    for (const w of WEIGHTS) {
      let r1 = 0, r3 = 0, r5 = 0, mrr = 0;
      strict.forEach((r, i) => {
        const rank = score(vecs[i], r.q, w).findIndex((x) => x.ci === r.ci) + 1;
        if (rank === 1) r1++;
        if (rank >= 1 && rank <= 3) r3++;
        if (rank >= 1 && rank <= 5) r5++;
        if (rank >= 1) mrr += 1 / rank;
      });
      const n = strict.length;
      results.E4[w] = { r1: r1 / n, r3: r3 / n, r5: r5 / n, mrr: mrr / n, n };
      console.log(`   가중치 ${String(w).padEnd(5)} → 1위 적중 ${(r1 / n * 100).toFixed(1)}% · 3위내 ${(r3 / n * 100).toFixed(1)}% · 5위내 ${(r5 / n * 100).toFixed(1)}% · MRR ${(mrr / n).toFixed(3)}`);
    }
  }

  // ── E3 ────────────────────────────────────────────────────────────────────
  let e3low = 0, e3n = 0;
  if (!ONLY || ONLY === 'E3') {
    const rr = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/repeated-requests.json'), 'utf8'));
    const labels = rr.patterns.map((p) => p.label).filter(Boolean);
    console.log(`\n▶ E3 — 질문 ${labels.length}개 (실제 반복요청 라벨 · 정답표 없음, 점수 분포만)`);
    const vecs = await embed(labels);
    const rows = labels.map((q, i) => {
      const top = score(vecs[i], q, 0.15)[0];
      return { q, s: top.s, hit: idx.chunks[top.ci] };
    }).sort((a, b) => b.s - a.s);
    e3n = rows.length;
    e3low = rows.filter((r) => r.s < LOW_SCORE).length;
    console.log(`   점수 ${LOW_SCORE} 미만(도구가 "낮다"고 경고하는 구간): ${e3low}/${e3n}`);
    console.log(`   최고 ${rows[0].s.toFixed(3)} · 중앙 ${rows[Math.floor(rows.length / 2)].s.toFixed(3)} · 최저 ${rows[rows.length - 1].s.toFixed(3)}`);
    console.log('   ── 상위 3 ──');
    rows.slice(0, 3).forEach((r) => console.log(`   ${r.s.toFixed(3)}  "${r.q.slice(0, 34)}…"\n          → ${r.hit.file}:${r.hit.startLine}`));
    console.log('   ── 하위 3 (경고 구간) ──');
    rows.slice(-3).forEach((r) => console.log(`   ${r.s.toFixed(3)}  "${r.q.slice(0, 34)}…"\n          → ${r.hit.file}:${r.hit.startLine}`));
  }

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  // 가중치는 **E4(패러프레이즈)로만** 정한다. E1·E2 는 낱말이 겹쳐 오염된 시험이라
  // 가중치를 올릴수록 성적이 오르는 게 당연하고, 그 값을 채택하면 실제 질문에서 손해를 본다.
  let best = WEIGHTS[0];
  const basis = results.E4 ? 'E4' : null;
  if (basis) for (const w of WEIGHTS) if (results[basis][w].mrr > results[basis][best].mrr) best = w;

  // 표본이 작으면 1위가 우연히 정해진다. 차이가 잡음 수준이면 그렇게 말한다 —
  // "최고점" 이라는 이유로 현행 설정을 흔들지 않기 위해서다.
  if (basis) {
    const ws = WEIGHTS.filter((w) => w > 0);
    const mrrs = ws.map((w) => results[basis][w].mrr);
    const spread = Math.max(...mrrs) - Math.min(...mrrs);
    const n = results[basis][best].n;
    if (spread < 0.03) {
      console.log(`\n※ 가중치 ${ws.join('/')} 사이의 차이는 MRR ${spread.toFixed(3)} (표본 ${n}) — 잡음 수준이다.`);
      console.log(`   "최고점" 을 근거로 설정을 바꾸지 말 것. 0 과의 차이(하이브리드 도입)만 유의미하다.`);
    }
  }

  console.log(`\n제목이 겹치는 청크 ${dupTitles}개 — E1 에서 억울한 오답이 날 수 있는 몫이다.`);
  const p = (x) => (x ? (x.r1 * 100).toFixed(1) : '-');
  console.log(`DOCEVAL_SUMMARY e1@1=${p(results.E1 && results.E1[0.15])} e2@1=${p(results.E2 && results.E2[0.15])} e4@1=${p(results.E4 && results.E4[0.15])} e3low=${e3low}/${e3n} best_w=${best}(${basis || '근거없음'}) sec=${sec}`);
})().catch((e) => { console.error(`❌ 평가 실패: ${e.message}`); process.exit(1); });
