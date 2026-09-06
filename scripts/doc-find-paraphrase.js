#!/usr/bin/env node
/**
 * doc-find-paraphrase.js  (패러프레이즈 시험지 생성 — doc-find 정확도 평가 E4용)
 * ─────────────────────────────────────────────────────────────────────────
 * **"다른 말로 바꿔 물었을 때도 찾나" 를 재기 위한 시험지를, 사람이 아닌 기계가 만든다.**
 *
 * 왜 필요했나 (2026-09-04):
 *   E1(제목)·E2(본문 한 줄) 는 질문이 원문에서 그대로 떼어낸 말이라 **낱말이 100% 겹친다.**
 *   그래서 "키워드 가중치를 올릴수록 성적이 좋다" 는 결과가 나오는데, 이건 시험지가
 *   오염된 것이지 도구가 좋아진 게 아니다. 실제 질문은 다른 말로 온다.
 *   → 원문 섹션을 로컬 모델에게 주고 **원문 낱말을 피해** 질문을 짓게 한다.
 *     ⭐ 가 질문을 지어내면 자기 도구에 유리하게 쓸 수 있으므로, 저자를 분리한다.
 *
 * 정직한 한계:
 *   · 로컬 모델(7B)이 지은 질문이라 사람의 실제 질문과 다르다. 편향이 사라진 게 아니라
 *     **⭐ 의 편향에서 모델의 편향으로 바뀐 것**이다. 다만 도구를 만든 쪽과 시험지를
 *     만든 쪽이 갈라졌다는 점에서 자가인증보다는 낫다.
 *   · 모델이 원문 낱말을 못 피하는 경우가 있어, 생성 후 **겹침률을 계산해 함께 저장**한다.
 *     평가 때 겹침이 큰 문항을 걸러내면 더 엄격한 시험이 된다.
 *
 * 사용:
 *   node scripts/doc-find-paraphrase.js --n 60         # 60문항 생성
 *   node scripts/doc-find-paraphrase.js --n 60 --model qwen2.5vl:7b
 *
 * 산출: .claude/cache/eval-paraphrase.json  (캐시 — 지우고 다시 만들면 된다)
 * 출력 끝줄: `PARAPHRASE_SUMMARY made=<n> asked=<n> avgOverlap=<pct> sec=<n>`
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_FILE = path.join(ROOT, '.claude/cache/doc-index.json');
const OUT_FILE = path.join(ROOT, '.claude/cache/eval-paraphrase.json');
const OLLAMA = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

const argv = process.argv.slice(2);
const val = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const N = parseInt(val('--n', '60'), 10);
const MODEL = val('--model', 'qwen2.5vl:7b');

const idx = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));

/** 질문거리가 되는 청크만 고른다 — 너무 짧거나 표·코드뿐인 것은 제외. */
const usable = idx.chunks
  .map((c, ci) => ({ ...c, ci }))
  .filter((c) => c.chars >= 250 && c.chars <= 2400 && !/^\s*$/.test(c.crumb));

function terms(s) {
  return new Set(s.toLowerCase().split(/[^0-9a-z가-힣_-]+/).filter((t) => t.length >= 2));
}

(async () => {
  const t0 = Date.now();
  // 고르게 뽑는다(앞쪽 문서에 쏠리지 않도록)
  const step = usable.length / N;
  const picks = Array.from({ length: Math.min(N, usable.length) }, (_, k) => usable[Math.floor(k * step)]);

  const rows = [];
  for (let i = 0; i < picks.length; i++) {
    const c = picks[i];
    const lines = fs.readFileSync(path.join(ROOT, c.file), 'utf8').split('\n').slice(c.startLine - 1, c.endLine);
    const body = lines.join('\n').slice(0, 1400);

    const prompt = `아래는 어떤 기술 문서의 한 섹션이다.
이 섹션을 찾으려는 사람이 던질 법한 **질문 한 문장**을 한국어로 지어라.

규칙:
- 원문에 나온 낱말을 되도록 피하고 **쉬운 일상어로 바꿔** 쓴다.
- 고유명사(Gate 번호·파일명·영문 도구명)는 쓰지 않는다.
- 15~40자. 질문 한 문장만 출력하고 설명·따옴표·번호를 붙이지 않는다.

--- 섹션 ---
${body}
--- 끝 ---

질문:`;

    let q = '';
    try {
      const res = await fetch(`${OLLAMA}/api/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, prompt, stream: false, options: { temperature: 0.7, num_predict: 60 } }),
      });
      q = ((await res.json()).response || '').trim().split('\n')[0].replace(/^["'`\s\-–—*0-9.]+|["'`\s]+$/g, '');
    } catch { q = ''; }

    if (q.length >= 8) {
      const qt = terms(q);
      const ct = terms(c.crumb + ' ' + body);
      let shared = 0;
      for (const t of qt) if (ct.has(t)) shared++;
      rows.push({ ci: c.ci, file: c.file, crumb: c.crumb, q, overlap: qt.size ? shared / qt.size : 0 });
    }
    process.stderr.write(`\r  ${i + 1}/${picks.length} 생성`);
  }
  process.stderr.write('\n');

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  const avg = rows.reduce((a, r) => a + r.overlap, 0) / (rows.length || 1);
  fs.writeFileSync(OUT_FILE, JSON.stringify({
    _meta: { generated: true, by: MODEL, builtAt: new Date().toISOString(), asked: picks.length, made: rows.length, avgOverlap: avg },
    rows,
  }, null, 1));

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✅ 시험지 ${rows.length}문항 (요청 ${picks.length}) · 원문 낱말 겹침 평균 ${(avg * 100).toFixed(0)}% · ${sec}초`);
  console.log(`PARAPHRASE_SUMMARY made=${rows.length} asked=${picks.length} avgOverlap=${(avg * 100).toFixed(0)} sec=${sec}`);
})().catch((e) => { console.error(`❌ 생성 실패: ${e.message}`); process.exit(1); });
