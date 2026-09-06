#!/usr/bin/env node
/**
 * doc-find.js  (로컬 문서 검색 — 긴 정본 문서 "좁혀 읽기" 2/2)
 * ─────────────────────────────────────────────────────────────────────────
 * **질문을 주면 관련 섹션의 `파일:줄범위` 만 돌려준다. 문서를 통째로 읽지 않는다.**
 *
 * 왜 필요했나: `doc-index-build.js` 머리말 참조 (2026-09-04, river 지시).
 *
 * 두 가지 방식으로 쓴다:
 *   (1) 위치만 (`--locate`, 기본) — 어디를 읽어야 하는지 목록만. 가장 싸다.
 *   (2) 본문까지 (`--print`)      — 상위 N개 섹션 원문을 바로 출력. 도구 1회로 끝난다.
 *
 * 경계선 (이 도구를 언제 쓰지 말아야 하나):
 *   · **찾을 단어를 정확히 알면 `grep` 을 써라.** 토큰 0, 100% 정확, 더 빠르다.
 *     이 도구는 "그게 어느 섹션에 적혀 있더라" 처럼 **단어를 모를 때**만 값어치가 있다.
 *   · **판정 근거로 쓰지 않는다.** 점수는 "관련 있어 보임" 이지 "맞다" 가 아니다.
 *     돌려준 구간을 실제로 읽고 판단하는 것은 그대로 사람/Claude 의 몫이다.
 *   · 결과에 원하는 게 없으면 색인이 놓친 것이다 — `--top` 을 늘리거나 grep 으로 간다.
 *
 * 사용:
 *   node scripts/doc-find.js "다크모드 스텝 방향 규칙"
 *   node scripts/doc-find.js "Gate 34 승인 인용문" --print
 *   node scripts/doc-find.js "화면 재현 기준 선언" --top 8 --file .claude/skills
 *
 * 출력 끝줄: `DOCFIND_SUMMARY hits=<n> chars=<n> ofTotal=<n> saved=<pct>% sec=<n> stale=<n>`
 *   chars   = 이 결과를 읽을 때의 분량
 *   ofTotal = 색인된 문서 전체 분량
 *   saved   = 통째로 읽는 대신 아낀 비율
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const INDEX_FILE = path.join(ROOT, '.claude/cache/doc-index.json');
const OLLAMA = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const TOP = parseInt(val('--top', '5'), 10);
const FILTER = val('--file', '');
const PRINT = flag('--print');
const query = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--top', '--file'].includes(argv[i - 1]))).join(' ').trim();

if (!query) {
  console.error('사용: node scripts/doc-find.js "<찾을 내용>" [--print] [--top N] [--file <경로조각>]');
  process.exit(1);
}
if (!fs.existsSync(INDEX_FILE)) {
  console.error('❌ 색인이 없다. 먼저: npm run docs:index');
  process.exit(1);
}

(async () => {
  const t0 = Date.now();
  const idx = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  const model = idx._meta.model;

  const res = await fetch(`${OLLAMA}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: [query] }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const qv = (await res.json()).embeddings[0];
  let s = 0; for (const x of qv) s += x * x;
  const qn = Math.sqrt(s) || 1;
  const q = qv.map((x) => x / qn);

  // 색인 벡터는 이미 정규화돼 있으므로 내적 = 코사인 유사도.
  // 여기에 키워드 적중률을 섞는다(하이브리드) — 주제가 여러 개 섞인 긴 단락에서
  // 벡터 하나로는 신호가 뭉개지기 때문. 2026-09-04 실측: Gate 34 의 `--quote` 조항이
  // 벡터 단독으로는 13위였는데, 질문에 쓴 낱말이 원문에 그대로 있었다.
  // 한국어는 조사가 붙으므로 어간 앞부분으로도 대조한다("인용해야" → "인용").
  const terms = [...new Set(query.toLowerCase().split(/[^0-9a-z가-힣_-]+/).filter((t) => t.length >= 2))];
  const stems = terms.map((t) => (/[가-힣]/.test(t) && t.length >= 3 ? t.slice(0, Math.max(2, t.length - 2)) : t));
  const KEYWORD_WEIGHT = 0.15;

  const pool = FILTER ? idx.chunks.filter((c) => c.file.includes(FILTER)) : idx.chunks;
  const scored = pool.map((c) => {
    let dot = 0;
    for (let i = 0; i < q.length; i++) dot += q[i] * c.vec[i];
    let hit = 0;
    if (c.lc && terms.length) {
      for (let i = 0; i < terms.length; i++) {
        if (c.lc.includes(terms[i]) || c.lc.includes(stems[i])) hit++;
      }
      hit /= terms.length;
    }
    return { ...c, vecScore: dot, kwScore: hit, score: dot + KEYWORD_WEIGHT * hit };
  }).sort((a, b) => b.score - a.score).slice(0, TOP);

  // 결과 0건 — `--file` 이 아무것도 안 걸렀거나 `--top 0` 인 경우.
  // (2026-09-04 적대 테스트: 여기서 크래시하며 "ollama 확인" 이라는 **엉뚱한 진단**을
  //  띄웠다. 잘못된 곳을 디버깅하게 만드는 유형이라 원인을 그대로 말하게 고쳤다.)
  if (!scored.length) {
    console.log(`🔍 "${query}" → 결과 없음`);
    if (FILTER) console.log(`   --file "${FILTER}" 에 걸리는 문서가 색인에 없다. 대상 확인: npm run docs:index -- --list`);
    if (TOP < 1) console.log(`   --top 이 ${TOP} 이다. 1 이상을 넣어라.`);
    console.log(`DOCFIND_SUMMARY hits=0 chars=0 ofTotal=${idx._meta.chars} saved=0% sec=0 stale=0`);
    return;
  }

  // ── 신선도 검사 (2026-09-04 적대 테스트로 발견해 추가) ────────────────────
  // 색인 후 문서가 바뀌면 줄번호가 밀려, 도구가 **조용히 엉뚱한 구간을 자신 있게**
  // 가리킨다(문서 앞에 5줄만 넣어도 재현됨). 이 저장소가 가장 경계하는 실패 유형이라
  // 경고가 아니라 차단으로 둔다 — 틀린 위치를 받는 것보다 답이 없는 편이 낫다.
  // 검사 방식: 반환할 구간을 지금 파일에서 실제로 잘라, 색인 당시 본문과 대조한다
  // (해시가 아니라 원문 대조라 "바뀌었지만 이 구간은 그대로"인 경우를 통과시킨다).
  const stale = [];
  for (const c of scored) {
    if (!c.lc) continue; // 옛 형식 색인 — 대조할 원문이 없다
    let ok = false;
    try {
      const lines = fs.readFileSync(path.join(ROOT, c.file), 'utf8').split('\n');
      ok = (c.crumb + '\n' + lines.slice(c.startLine - 1, c.endLine).join('\n')).toLowerCase() === c.lc;
    } catch { ok = false; }
    if (!ok) stale.push(c);
  }
  if (stale.length && !flag('--stale-ok')) {
    console.error('❌ 색인이 낡았다 — 아래 구간은 지금 문서와 내용이 다르다(줄번호가 밀렸다).');
    for (const c of stale) console.error(`   ${c.file}:${c.startLine}-${c.endLine}  ${c.crumb}`);
    console.error('\n   고치려면: npm run docs:index');
    console.error('   (그래도 보려면 --stale-ok — 위치가 틀릴 수 있으니 판단 근거로 쓰지 말 것)');
    console.error(`DOCFIND_SUMMARY hits=0 chars=0 ofTotal=${idx._meta.chars} saved=0% sec=0 stale=${stale.length}`);
    process.exit(2);
  }

  // 전역 신선도 — 반환 구간별 대조(위)는 "내가 지금 주는 답"만 지킨다. 색인 전체가
  // 낡았는데 바뀐 대목이 상위에 안 걸리면 모르고 넘어가므로, 파일 해시로 따로 알린다.
  // 이쪽은 차단하지 않는다(반환한 구간 자체는 위에서 이미 검증됐다).
  const changed = [];
  for (const [f, h] of Object.entries(idx._meta.fileHashes || {})) {
    try {
      const now = crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 12);
      if (now !== h) changed.push(f);
    } catch { changed.push(`${f} (없어짐)`); }
  }

  const sec = ((Date.now() - t0) / 1000).toFixed(2);
  const hitChars = scored.reduce((a, c) => a + c.chars, 0);
  const totalChars = idx._meta.chars;
  const saved = totalChars ? (100 - (hitChars / totalChars) * 100).toFixed(1) : '0.0';

  console.log(`🔍 "${query}" → 상위 ${scored.length}개 (색인 ${idx._meta.files}개 문서 / ${totalChars.toLocaleString()}자)\n`);
  scored.forEach((c, i) => {
    console.log(`${String(i + 1).padStart(2)}. ${c.file}:${c.startLine}-${c.endLine}  (${c.chars}자, 관련도 ${c.score.toFixed(3)} = 의미 ${c.vecScore.toFixed(3)} + 낱말 ${(c.kwScore * 100).toFixed(0)}%)`);
    console.log(`    ${c.crumb}`);
    if (PRINT) {
      const lines = fs.readFileSync(path.join(ROOT, c.file), 'utf8').split('\n');
      console.log('    ┌───');
      console.log(lines.slice(c.startLine - 1, c.endLine).map((l) => '    │ ' + l).join('\n'));
      console.log('    └───');
    }
    console.log('');
  });

  // 신뢰도 눈금 (2026-09-04 실측 보정). 정답을 제대로 집은 질의의 1위 점수는 0.60~0.81,
  // 빗나간 질의는 0.43~0.49 에 몰렸다. 낮은 점수를 조용히 그럴듯하게 내놓지 않는다.
  if (scored[0].score < 0.55) {
    console.log(`⚠️  1위 점수 ${scored[0].score.toFixed(3)} — 낮다. 색인이 못 찾았을 가능성이 크다.`);
    console.log(`   찾을 낱말을 알면 grep 이 확실하다. 아니면 --top 을 늘려 보라.\n`);
  }

  if (!PRINT) {
    console.log(`읽으려면: sed -n '${scored[0].startLine},${scored[0].endLine}p' ${scored[0].file}`);
    console.log(`본문까지 한 번에: 같은 명령에 --print 를 붙인다\n`);
  }
  if (changed.length) {
    console.log(`⚠️  색인 이후 바뀐 문서 ${changed.length}개 — ${changed.slice(0, 3).join(', ')}${changed.length > 3 ? ' 외' : ''}`);
    console.log(`   위 결과 구간은 원문과 대조해 검증했지만, 바뀐 대목은 검색에서 빠질 수 있다. 다시 만들려면: npm run docs:index\n`);
  }
  console.log(`DOCFIND_SUMMARY hits=${scored.length} chars=${hitChars} ofTotal=${totalChars} saved=${saved}% sec=${sec} stale=0 changed=${changed.length}`);
})().catch((e) => {
  console.error(`❌ 검색 실패: ${e.message}`);
  console.error(`   ollama 가 떠 있는지 확인: curl -s ${OLLAMA}/api/tags`);
  process.exit(1);
});
