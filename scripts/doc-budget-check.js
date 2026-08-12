#!/usr/bin/env node
/**
 * doc-budget-check.js  (Gate 37 — Doc Budget / 문서 예산)
 * ─────────────────────────────────────────────────────────────────────────
 * **CLAUDE.md 재비대화를 기계로 막는 게이트.**
 *
 * 왜 필요했나 (2026-08-05):
 *   루트 CLAUDE.md 가 84,905 byte(1,144줄)까지 자라 있었다. 이 비용은
 *   ①매 세션 시작 ②**커스텀 에이전트 spawn 마다** 전액 다시 지불된다
 *   (Explore/Plan 만 예외). 이 하네스는 "만드는 자≠검증하는 자" 원칙 때문에
 *   spawn 이 잦아 비용이 배수로 나갔다. 게다가 길수록 규칙 준수율 자체가 떨어진다.
 *   그런데 **CLAUDE.md 를 검사하는 게이트가 0개**였고, 비대화 방지가
 *   §🧹 "자가 점검" 산문뿐이었다 — 이 저장소가 가장 경계하는 "성실성 의존" 상태.
 *   → 산문 권고를 커밋 차단으로 승격한다.
 *
 * 설계 — 저장소에 이미 있는 패턴의 합성(새 발명 없음):
 *   · Gate 29·34 래칫 — baseline 을 넘으면 차단, 상향은 승인 기록으로만
 *   · Gate 10 참조 드리프트 — 문서가 가리키는 경로가 실제로 있나
 *
 * 검사 3종:
 *   (1) 크기 래칫 — CLAUDE.md byte 가 baseline 상한 초과면 error.
 *                   상향은 `--approve` + 사유 기록으로만(⭐ 단독 상향 불가).
 *   (2) 참조 경로 실존 — CLAUDE.md + .claude/rules/*.md 본문의 백틱 경로가 실재하나.
 *                   "존재한 적 없는 문서를 가리키는 표"(2026-08-05 발견 4건) 재발 차단.
 *   (3) 변경 이력 행수 — CLAUDE.md 변경 이력 표가 3행 초과면 error(아카이브로 옮기라).
 *
 * 보지 않는 것: 내용의 좋음/나쁨 · rules 파일 크기(조건부 로드라 상시 비용 아님) ·
 *              참조 문서(.claude/docs/**) 크기(필요할 때만 읽음).
 *
 * 사용:
 *   node scripts/doc-budget-check.js                        # 검사 (gate:check 가 호출)
 *   node scripts/doc-budget-check.js --approve --by river --reason "H8 하드룰 추가"
 *   node scripts/doc-budget-check.js --approve --by river --reason "..." --limit 42000
 *
 * 출력 끝줄: `DOCBUDGET_SUMMARY bytes=<n> limit=<n> badrefs=<n> histrows=<n>`
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET = 'CLAUDE.md';
const BASELINE = path.join(ROOT, 'registry/governance/doc-budget-baseline.json');
const RULES_DIR = path.join(ROOT, '.claude/rules');
const MAX_HISTORY_ROWS = 3;

// 백틱 경로 중 "실존을 요구하지 않는 것" — 예시·글롭·외부 도구·아카이브(취소선) 등.
const REF_EXEMPT = [
  /\*/,                       // 글롭 (registry/**, pages/*.html …)
  /^path\/to\//,              // 보고 양식의 예시 경로
  /^\{/,                      // {project_root} 같은 자리표시자
  /\{/,                       // 중괄호 자리표시자 포함
  /^https?:/,
  /^npm |^node |^git |^bash /, // 명령줄
  /^--/,                      // CSS 변수
  /^\.claude\/agents\/$/,      // 디렉터리 표기
];

function isExempt(p) { return REF_EXEMPT.some((re) => re.test(p)); }

function loadBaseline() {
  if (!fs.existsSync(BASELINE)) return null;
  return JSON.parse(fs.readFileSync(BASELINE, 'utf-8'));
}

function saveBaseline(b) {
  fs.writeFileSync(BASELINE, JSON.stringify(b, null, 2) + '\n');
}

/** CLAUDE.md 의 "변경 이력" 표 데이터 행 수를 센다. */
function countHistoryRows(text) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^#+\s*🗂️?\s*변경 이력/.test(l) || /^#+\s*변경 이력/.test(l));
  if (start < 0) return 0;
  let rows = 0;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^#+\s/.test(l)) break;                 // 다음 섹션
    if (/^\|[-| :]+\|$/.test(l.trim())) continue; // 구분줄
    if (/^\|/.test(l.trim())) {
      if (/^\|\s*날짜\s*\|/.test(l)) continue;   // 헤더
      rows++;
    }
  }
  return rows;
}

/** 문서 본문의 백틱 경로를 뽑는다. 취소선(~~...~~) 안은 아카이브 안내라 제외. */
function extractRefs(text) {
  const noStrike = text.replace(/~~[\s\S]*?~~/g, '');
  const noComment = noStrike.replace(/<!--[\s\S]*?-->/g, '');
  const out = new Set();
  const re = /`([^`\n]+)`/g;
  let m;
  while ((m = re.exec(noComment))) {
    let p = m[1].trim();
    // "file.ts:12~20" 같은 줄번호 꼬리 제거
    p = p.replace(/:[0-9]+([~-][0-9]+)?$/, '');
    if (!/\.(md|json|ts|js|css|html|zip)$/.test(p)) continue;
    if (isExempt(p)) continue;
    out.add(p);
  }
  return [...out];
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache']);

/** 저장소 전체의 파일이름 집합(1회 스캔). 축약 표기 허용 판정에 쓴다. */
function indexBasenames() {
  const set = new Set();
  const walk = (dir) => {
    let ents;
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        walk(path.join(dir, e.name));
      } else {
        set.add(e.name);
      }
    }
  };
  walk(ROOT);
  return set;
}

function check({ pass, warn, fail }) {
  const targetPath = path.join(ROOT, TARGET);
  const text = fs.readFileSync(targetPath, 'utf-8');
  const bytes = Buffer.byteLength(text, 'utf-8');

  const baseline = loadBaseline();
  if (!baseline) {
    fail(`Gate 37: baseline 이 없습니다 — \`node scripts/doc-budget-check.js --approve --by <이름> --reason "초기 동결"\``);
    console.log(`DOCBUDGET_SUMMARY bytes=${bytes} limit=0 badrefs=0 histrows=0`);
    return;
  }
  const limit = baseline.maxBytes;

  // (1) 크기 래칫
  if (bytes > limit) {
    fail(
      `Gate 37: ${TARGET} 가 상한을 넘었습니다 — ${bytes} byte > ${limit} byte (초과 ${bytes - limit}). ` +
      `규칙은 \`.claude/rules/*.md\`(paths 조건부 로드)나 \`.claude/docs/\` 참조 문서로 옮기세요. ` +
      `정말 루트에 있어야 하면: \`node scripts/doc-budget-check.js --approve --by river --reason "…"\``
    );
  } else {
    pass(`${TARGET} ${bytes} byte / 상한 ${limit} byte (여유 ${limit - bytes})`);
  }

  // (2) 참조 경로 실존 — CLAUDE.md + rules/*.md
  const docs = [targetPath];
  if (fs.existsSync(RULES_DIR)) {
    for (const f of fs.readdirSync(RULES_DIR).filter((f) => f.endsWith('.md'))) {
      docs.push(path.join(RULES_DIR, f));
    }
  }
  // 판정 기준: 경로가 그대로 실재하거나, **그 파일이름이 저장소 어디에든 있으면** 통과.
  // 축약 표기(`build-components.ts`)와 이동·아카이브된 파일의 역사적 언급을 허용하면서,
  // "저장소에 아예 없는 것을 가리키는" 진짜 사고만 잡는다. 2026-08-05 실측으로
  // 과거 stale 7건(규칙 문서 4 · token-map.json · md-review.html 등)이 전부 이 기준에 걸림을 확인.
  const basenames = indexBasenames();
  const bad = [];
  for (const d of docs) {
    const refs = extractRefs(fs.readFileSync(d, 'utf-8'));
    for (const r of refs) {
      if (fs.existsSync(path.join(ROOT, r))) continue;
      if (basenames.has(path.basename(r))) continue;
      bad.push(`${path.relative(ROOT, d).replace(/\\/g, '/')} → \`${r}\``);
    }
  }
  if (bad.length) {
    fail(
      `Gate 37: 문서가 **없는 파일**을 가리킵니다 ${bad.length}건 — ${bad.join(' · ')}. ` +
      `(존재하지 않는 규칙 문서를 "반드시 Read 하라"고 가리켜 규칙 유실을 가린 사고가 2026-08-05 에 있었습니다)`
    );
  } else {
    pass(`참조 경로 실존 — ${docs.length}개 문서의 백틱 경로 전부 실재`);
  }

  // (3) 변경 이력 행수
  const rows = countHistoryRows(text);
  if (rows > MAX_HISTORY_ROWS) {
    fail(
      `Gate 37: ${TARGET} 변경 이력이 ${rows}행입니다 (상한 ${MAX_HISTORY_ROWS}). ` +
      `오래된 행을 \`reports/changelog-archive.md\` 로 옮기세요 — 이력으로 상시 컨텍스트가 무거워집니다.`
    );
  } else {
    pass(`변경 이력 ${rows}행 / 상한 ${MAX_HISTORY_ROWS}`);
  }

  // 기계 파싱용 요약줄 — 단독 실행 시에만 (gate-check 경유 시 침묵, 자동화는 단독 실행으로 파싱)
  if (require.main === module) console.log(`DOCBUDGET_SUMMARY bytes=${bytes} limit=${limit} badrefs=${bad.length} histrows=${rows}`);
}

// ── CLI ──────────────────────────────────────────────────────────
if (require.main === module) {
  const argv = process.argv.slice(2);
  const flag = (n) => {
    const i = argv.indexOf(`--${n}`);
    return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : null;
  };

  if (flag('approve')) {
    const by = flag('by');
    const reason = flag('reason');
    if (!by || by === true || !reason || reason === true) {
      console.error('사용: --approve --by <이름> --reason "<사유>" [--limit <byte>]');
      process.exit(1);
    }
    const bytes = Buffer.byteLength(fs.readFileSync(path.join(ROOT, TARGET), 'utf-8'), 'utf-8');
    const explicit = flag('limit');
    const newLimit = explicit && explicit !== true ? parseInt(explicit, 10) : Math.round(bytes * 1.1);
    const prev = loadBaseline();
    const b = {
      _note:
        'Gate 37(Doc Budget) 상한. CLAUDE.md 상시 로드 비용을 동결한다 — 매 세션 + 매 에이전트 spawn 마다 전액 지불되므로. ' +
        '상향은 사용자 승인(--approve)으로만. 규칙은 .claude/rules/*.md(조건부 로드)로 옮기는 것이 기본.',
      target: TARGET,
      maxBytes: newLimit,
      maxHistoryRows: MAX_HISTORY_ROWS,
      approvals: [
        ...(prev?.approvals ?? []),
        { date: new Date().toISOString().slice(0, 10), by, reason, bytesAtApproval: bytes, maxBytes: newLimit },
      ],
    };
    saveBaseline(b);
    console.log(`✅ 승인 기록 — 상한 ${prev ? prev.maxBytes : '(없음)'} → ${newLimit} byte (현재 ${bytes}) by ${by}: ${reason}`);
    process.exit(0);
  }

  let errors = 0;
  check({
    pass: (m) => console.log(`  ✅ ${m}`),
    warn: (m) => console.warn(`  ⚠️  ${m}`),
    fail: (m) => { errors++; console.error(`  ❌ ${m}`); },
  });
  process.exit(errors > 0 ? 1 : 0);
}

module.exports = { check };
