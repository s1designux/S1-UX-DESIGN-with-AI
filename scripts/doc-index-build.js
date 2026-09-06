#!/usr/bin/env node
/**
 * doc-index-build.js  (로컬 문서 색인 — 긴 정본 문서 "좁혀 읽기" 1/2)
 * ─────────────────────────────────────────────────────────────────────────
 * **긴 문서를 통째로 읽는 대신, 필요한 섹션 위치만 찾게 하는 로컬 색인.**
 *
 * 왜 필요했나 (2026-09-04, river 지시):
 *   내부망에서는 Claude 토큰이 빠듯한데, 이 저장소의 참조 문서는 크다 —
 *   design/DESIGN.core.md 150,199자(57섹션) · gates-reference.md 64,901자(53섹션) ·
 *   screen-rebuild/SKILL.md 35,647자(26섹션). 3문단이 필요한 작업에서도
 *   "어느 섹션인지" 를 모르면 파일을 통째로 읽거나 여러 번 되읽는다.
 *   → 문서를 섹션 단위로 잘라 **로컬 임베딩**으로 색인해 두고, 질문에 대해
 *     관련 섹션의 `파일:줄범위` 만 돌려준다. 읽기는 그 구간만 한다.
 *
 * 이 도구가 하지 않는 것 (경계선):
 *   · **판정하지 않는다.** 무엇이 맞는지는 색인이 정하지 않는다.
 *   · **요약하지 않는다.** 원문 위치만 돌려준다 — 내용은 원문을 읽어 판단한다.
 *   · grep 으로 찾을 수 있는 것(정확한 토큰명·파일명)은 grep 이 더 싸고 정확하다.
 *     이 색인은 **찾을 단어를 모를 때**(의미 검색)만 값어치가 있다.
 *   틀려도 안전한 이유: 관련 섹션이 하나 빠지거나 하나 더 붙을 뿐이고,
 *   사실 확인과 판단은 그대로 사람/Claude 가 한다.
 *
 * 설계:
 *   · 청킹 = 마크다운 heading 경계. 섹션이 MAX_CHUNK 보다 길면 창으로 분할.
 *   · 각 청크는 heading 계층(빵부스러기)을 본문 앞에 붙여 임베딩한다 —
 *     "## 🚦 Gate > ### Gate 34" 같은 맥락이 검색 품질을 좌우하기 때문.
 *   · 임베딩 = 로컬 ollama (기본 qwen3-embedding:0.6b). 네트워크·API 비용 0.
 *   · 색인은 캐시다. 지우고 다시 만들면 된다(git 추적 안 함).
 *
 * 사용:
 *   node scripts/doc-index-build.js              # 전체 색인 생성
 *   node scripts/doc-index-build.js --model X    # 임베딩 모델 지정
 *   node scripts/doc-index-build.js --list       # 대상 문서만 보기(임베딩 안 함)
 *
 * 출력 끝줄: `DOCINDEX_SUMMARY files=<n> chunks=<n> chars=<n> model=<name> sec=<n>`
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, '.claude/cache');
const INDEX_FILE = path.join(CACHE_DIR, 'doc-index.json');
const OLLAMA = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

const DEFAULT_MODEL = 'qwen3-embedding:0.6b';
const MAX_CHUNK = 2400;   // 자. 이보다 긴 섹션은 창으로 나눈다
const OVERLAP = 200;      // 자. 창 사이 겹침(경계에서 문맥이 잘리는 것 완화)
const BATCH = 16;

/**
 * 색인 대상.
 * CLAUDE.md 는 제외한다 — 매 세션 이미 전문이 로드되므로 색인해도 절감이 없다.
 */
const TARGETS = [
  'design/DESIGN.core.md',
  '.claude/docs/*.md',
  '.claude/rules/*.md',
  '.claude/skills/*/SKILL.md',
  '.claude/skills/*/references/*.md',
  '.claude/agents/*.md',
  // 루트에도 참조 문서가 있다 (2026-09-04 실측에서 component-page-template.md 가
  // 대상 밖이라 검색에 안 잡혔다). CLAUDE.md 만 제외한다.
  'component-page-template.md',
  'BACKLOG.md',
  'README.md',
  'AGENTS.md',
];

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const MODEL = val('--model', DEFAULT_MODEL);

/** 아주 단순한 glob(`*` 한 단계)만 지원한다 — 의존성 추가를 피하려는 의도. */
function expand(pattern) {
  if (!pattern.includes('*')) {
    const p = path.join(ROOT, pattern);
    return fs.existsSync(p) ? [pattern] : [];
  }
  const parts = pattern.split('/');
  let dirs = [''];
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    const last = i === parts.length - 1;
    const next = [];
    for (const d of dirs) {
      const abs = path.join(ROOT, d);
      if (!fs.existsSync(abs)) continue;
      let names;
      try { names = fs.readdirSync(abs); } catch { continue; }
      for (const name of names) {
        if (seg !== '*' && name !== seg) continue;
        if (seg === '*' && name.startsWith('.')) continue;
        const rel = d ? `${d}/${name}` : name;
        const st = fs.statSync(path.join(ROOT, rel));
        if (last) { if (st.isFile()) out.push(rel); }
        else if (st.isDirectory()) next.push(rel);
      }
      // `*.md` 처럼 확장자가 붙은 마지막 조각 처리
      if (last && seg.includes('*') && seg !== '*') {
        const re = new RegExp('^' + seg.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
        for (const name of names) {
          if (!re.test(name)) continue;
          const rel = d ? `${d}/${name}` : name;
          if (fs.statSync(path.join(ROOT, rel)).isFile()) out.push(rel);
        }
      }
    }
    dirs = next;
  }
  return [...new Set(out)];
}

/** 마크다운을 heading 경계로 자르고, 긴 섹션은 창으로 분할한다. */
function chunkMarkdown(rel) {
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const lines = text.split('\n');

  // 1) heading 위치 수집 (코드펜스 안의 `#` 는 heading 이 아니다)
  const heads = [];
  let fenced = false;
  lines.forEach((ln, i) => {
    if (/^\s*```/.test(ln)) fenced = !fenced;
    if (fenced) return;
    const m = /^(#{1,6})\s+(.*\S)\s*$/.exec(ln);
    if (m) heads.push({ line: i, level: m[1].length, title: m[2].trim() });
  });

  // 2) 섹션 = heading 부터 다음 heading 직전까지
  const sections = [];
  if (heads.length === 0) {
    sections.push({ start: 0, end: lines.length - 1, crumb: path.basename(rel) });
  } else {
    if (heads[0].line > 0) {
      sections.push({ start: 0, end: heads[0].line - 1, crumb: `${path.basename(rel)} (머리말)` });
    }
    const stack = [];
    heads.forEach((h, idx) => {
      while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop();
      stack.push(h);
      const end = idx + 1 < heads.length ? heads[idx + 1].line - 1 : lines.length - 1;
      sections.push({ start: h.line, end, crumb: stack.map((s) => s.title).join(' › ') });
    });
  }

  // 3) 긴 섹션은 창으로 분할 (줄 경계는 유지 — 줄번호를 정확히 돌려주기 위해)
  const chunks = [];
  for (const s of sections) {
    const body = lines.slice(s.start, s.end + 1);
    const chars = body.join('\n').length;
    if (chars <= MAX_CHUNK) {
      if (body.join('').trim()) {
        chunks.push({ file: rel, crumb: s.crumb, startLine: s.start + 1, endLine: s.end + 1, chars, text: body.join('\n') });
      }
      continue;
    }
    let i = 0;
    let part = 1;
    while (i < body.length) {
      let acc = 0;
      let j = i;
      while (j < body.length && acc < MAX_CHUNK) { acc += body[j].length + 1; j++; }
      const slice = body.slice(i, j);
      if (slice.join('').trim()) {
        chunks.push({
          file: rel,
          crumb: `${s.crumb} (${part}부)`,
          startLine: s.start + i + 1,
          endLine: s.start + j,
          chars: slice.join('\n').length,
          text: slice.join('\n'),
        });
      }
      part++;
      if (j >= body.length) break;
      // 겹침만큼 되돌아간다
      let back = 0, k = j;
      while (k > i && back < OVERLAP) { k--; back += body[k].length + 1; }
      i = Math.max(k, i + 1);
    }
  }
  return chunks;
}

async function embed(inputs, model) {
  const res = await fetch(`${OLLAMA}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: inputs }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  if (!j.embeddings) throw new Error('응답에 embeddings 가 없다: ' + JSON.stringify(j).slice(0, 200));
  return j.embeddings;
}

(async () => {
  const t0 = Date.now();
  const files = TARGETS.flatMap(expand).filter((f) => f.endsWith('.md'));
  const uniq = [...new Set(files)].sort();

  if (flag('--list')) {
    let total = 0;
    for (const f of uniq) {
      const n = fs.statSync(path.join(ROOT, f)).size;
      total += n;
      console.log(String(n).padStart(8), f);
    }
    console.log(`\n대상 ${uniq.length}개 · 합계 ${total.toLocaleString()}자`);
    console.log(`DOCINDEX_SUMMARY files=${uniq.length} chunks=0 chars=${total} model=- sec=0`);
    return;
  }

  const chunks = [];
  for (const f of uniq) chunks.push(...chunkMarkdown(f));
  if (!chunks.length) { console.error('색인할 내용이 없다.'); process.exit(1); }

  // 임베딩 입력에는 빵부스러기를 앞에 붙인다 (섹션 맥락이 검색 품질을 좌우한다)
  const inputs = chunks.map((c) => `${c.file}\n${c.crumb}\n\n${c.text}`);

  process.stderr.write(`색인 중: 문서 ${uniq.length}개 → 청크 ${chunks.length}개 (${MODEL})\n`);
  const vectors = [];
  for (let i = 0; i < inputs.length; i += BATCH) {
    const part = await embed(inputs.slice(i, i + BATCH), MODEL);
    vectors.push(...part);
    process.stderr.write(`\r  ${Math.min(i + BATCH, inputs.length)}/${inputs.length}`);
  }
  process.stderr.write('\n');

  // 정규화해서 저장한다 → 검색 때 내적만으로 코사인 유사도가 나온다
  const dim = vectors[0].length;
  const norm = vectors.map((v) => {
    let s = 0; for (const x of v) s += x * x;
    const n = Math.sqrt(s) || 1;
    return v.map((x) => Math.round((x / n) * 1e5) / 1e5);
  });

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const totalChars = chunks.reduce((a, c) => a + c.chars, 0);
  fs.writeFileSync(INDEX_FILE, JSON.stringify({
    _meta: {
      generated: true,
      note: '로컬 임베딩 캐시. 지우고 doc-index-build.js 로 다시 만들면 된다. git 추적 안 함.',
      model: MODEL, dim, builtAt: new Date().toISOString(),
      files: uniq.length, chunks: chunks.length, chars: totalChars,
      // 파일별 내용 해시. doc-find 가 "색인 이후 문서가 바뀌었나" 를 전역으로 알린다.
      // (반환 구간별 대조만으로는, 바뀐 대목이 상위에 안 걸리면 낡은 걸 모른 채 넘어간다.)
      fileHashes: Object.fromEntries(uniq.map((f) => [
        f, crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 12),
      ])),
    },
    chunks: chunks.map((c, i) => ({
      file: c.file, crumb: c.crumb, startLine: c.startLine, endLine: c.endLine, chars: c.chars,
      // 키워드 혼합 점수용 소문자 본문. 벡터만 쓰면 주제가 여러 개 섞인 긴 단락에서
      // 신호가 뭉개진다(2026-09-04 실측: Gate 34 조항이 13위로 밀림).
      lc: (c.crumb + '\n' + c.text).toLowerCase(),
      vec: norm[i],
    })),
  }));

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✅ 색인 생성: ${INDEX_FILE.replace(ROOT + '/', '')}`);
  console.log(`   문서 ${uniq.length}개 · 청크 ${chunks.length}개 · 본문 ${totalChars.toLocaleString()}자 · ${sec}초`);
  console.log(`DOCINDEX_SUMMARY files=${uniq.length} chunks=${chunks.length} chars=${totalChars} model=${MODEL} sec=${sec}`);
})().catch((e) => {
  console.error(`❌ 색인 실패: ${e.message}`);
  console.error(`   ollama 가 떠 있는지 확인: curl -s ${OLLAMA}/api/tags`);
  console.error(`   모델이 없으면: ollama pull ${MODEL}`);
  process.exit(1);
});
