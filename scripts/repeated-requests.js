#!/usr/bin/env node
'use strict';
/**
 * repeated-requests.js — 반복 요청 장부 CLI (정본 = reports/repeated-requests/ 폴더, 낱장 구조)
 *
 *   npm run rr -- add --id <id> --summary "무슨 일" [--label "사람이 읽는 이름" --category <분류> --rule "추천 규칙"] [--date YYYY-MM-DD]
 *       별도 작업 폴더 → inbox/<브랜치>.jsonl 낱장에 append (다른 세션과 겹칠 파일이 없다)
 *       본 폴더 main   → patterns/<id>.json 에 바로 접어 넣음 (단일 기록자)
 *   npm run rr -- list [--min 3]      집계표 (미접힌 낱장 포함). Orchestrator Summary 의 승격 후보는 --min 3
 *   npm run rr -- fold                낱장 전부를 patterns/ 에 접고 낱장 삭제 (wt:merge 가 본 폴더에서 자동 호출)
 *   npm run rr -- check               구조 검사 (옛 단일 파일 잔존·id≠파일명·label 누락)
 *   npm run rr -- show <id>           패턴 1개 전체 보기
 */
const rr = require('./lib/repeated-requests');

const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};

function pad(s, n) { s = String(s); return s.length >= n ? s : s + ' '.repeat(n - s.length); }

try {
  if (cmd === 'add') {
    const r = rr.add({
      id: opt('id'), summary: opt('summary'), label: opt('label'), category: opt('category'),
      recommendedRule: opt('rule'), date: opt('date'),
    });
    const where = r.where === 'inbox' ? '낱장에 적음(합칠 때 접힘)' : '패턴 파일에 바로 접음';
    console.log(`✅ ${where} — ${r.file} · 누적 ${r.count}회${r.count >= rr.loadMeta().promotionThreshold ? ' ⭐ 승격 후보(3회 이상)' : ''}`);
  } else if (cmd === 'list') {
    const min = Number(opt('min', '1'));
    const rows = rr.merged().filter((p) => (p.count || 0) >= min);
    console.log(`반복 요청 ${rows.length}건 (count ≥ ${min}) — 정본 reports/repeated-requests/`);
    console.log(`${pad('count', 5)} ${pad('status', 22)} ${pad('id', 48)} label`);
    for (const p of rows) {
      const pend = p._pending ? ` (+${p._pending} 낱장)` : '';
      console.log(`${pad(p.count, 5)} ${pad(p.promotionStatus || p.status || '-', 22)} ${pad(p.id, 48)} ${p.label || ''}${pend}`);
    }
  } else if (cmd === 'fold') {
    const r = rr.fold();
    if (!r.entries) console.log('접을 낱장 없음');
    else console.log(`✅ 낱장 ${r.sheets}장 · ${r.entries}건 접음 → 패턴 ${r.touched.length}개 갱신: ${r.touched.join(', ')}`);
  } else if (cmd === 'check') {
    const problems = rr.check();
    if (problems.length) { for (const p of problems) console.error(`❌ ${p}`); process.exit(1); }
    console.log(`✅ 반복 요청 장부 정상 — 패턴 ${rr.loadPatterns().length}개 · 미접힌 낱장 ${rr.loadInbox().length}장`);
  } else if (cmd === 'show') {
    const id = argv[1];
    const p = rr.merged().find((x) => x.id === id);
    if (!p) { console.error(`❌ 패턴 없음: ${id}`); process.exit(1); }
    console.log(JSON.stringify(p, null, 2));
  } else {
    console.log('사용법: rr add|list|fold|check|show — 파일 머리말 참조');
    process.exit(cmd ? 1 : 0);
  }
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
