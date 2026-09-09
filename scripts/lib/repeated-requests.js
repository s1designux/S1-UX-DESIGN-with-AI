'use strict';
/**
 * repeated-requests.js — 반복 요청 장부(낱장 구조)의 공용 판독·기록기.
 *
 * 구조 (2026-09-09 낱장화 — 여러 세션이 한 파일을 덮어쓰던 것을 끊는다):
 *   reports/repeated-requests/_meta.json            설명·승격 기준
 *   reports/repeated-requests/patterns/<id>.json    패턴 1개 = 파일 1개 (정본, 본 폴더만 쓴다)
 *   reports/repeated-requests/inbox/<sheet>.jsonl   별도 작업 폴더 세션이 적는 낱장(브랜치별 1장)
 *                                                    → 합칠 때(wt:merge) 본 폴더에서 fold 로 접어 넣는다
 *
 * 왜: 62개 패턴·130건 발생을 한 JSON 에 두면 어느 세션이 무엇을 하든 그 파일을 다시 써서
 *     합칠 때마다 부딪히고, 같은 폴더에서는 조용히 덮어썼다. 낱장은 세션마다 다른 파일이라
 *     겹칠 것이 없고, 접기는 본 폴더 한 곳(단일 기록자)에서만 일어난다.
 */
const fs = require('fs');
const path = require('path');
const wt = require('./worktree');

const ROOT = wt.checkoutRoot(path.resolve(__dirname, '..', '..'));
const DIR = path.join(ROOT, 'reports', 'repeated-requests');
const META = path.join(DIR, '_meta.json');
const PATTERNS = path.join(DIR, 'patterns');
const INBOX = path.join(DIR, 'inbox');
const LEGACY = path.join(ROOT, 'reports', 'repeated-requests.json');
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
}

function loadMeta() {
  return fs.existsSync(META) ? readJson(META) : { promotionThreshold: 3 };
}

/** 패턴 파일 전부 — [{ id, ..., _file }] (id 순) */
function loadPatterns() {
  if (!fs.existsSync(PATTERNS)) return [];
  return fs.readdirSync(PATTERNS)
    .filter((n) => n.endsWith('.json'))
    .sort()
    .map((n) => {
      const p = readJson(path.join(PATTERNS, n));
      return Object.assign(p, { _file: path.join('reports/repeated-requests/patterns', n) });
    });
}

/** 낱장 전부 — [{ sheet, file, entries: [...] }] */
function loadInbox() {
  if (!fs.existsSync(INBOX)) return [];
  return fs.readdirSync(INBOX)
    .filter((n) => n.endsWith('.jsonl'))
    .sort()
    .map((n) => {
      const lines = fs.readFileSync(path.join(INBOX, n), 'utf8').split('\n').filter((l) => l.trim());
      const entries = [];
      for (const l of lines) {
        try { entries.push(JSON.parse(l)); } catch (_) { entries.push({ _bad: l }); }
      }
      return { sheet: n.replace(/\.jsonl$/, ''), file: path.join('reports/repeated-requests/inbox', n), entries };
    });
}

/** 낱장 1건을 패턴 객체에 적용(파일은 안 씀). 새 패턴이면 생성해 반환. */
function applyEntry(byId, e) {
  let p = byId.get(e.id);
  if (!p) {
    p = {
      id: e.id,
      category: e.category || 'uncategorized',
      label: e.label || e.id,
      count: 0,
      promotionStatus: 'watching',
      occurrences: [],
    };
    if (e.recommendedRule) p.recommendedRule = e.recommendedRule;
    byId.set(e.id, p);
  }
  p.count = (p.count || 0) + 1;
  if (!Array.isArray(p.occurrences)) p.occurrences = [];
  p.occurrences.push({ date: e.date, summary: e.summary });
  if (e.label && !p.label) p.label = e.label;
  return p;
}

/** 패턴 + 미접힌 낱장을 합쳐 본 현재 집계(읽기 전용 뷰). */
function merged() {
  const byId = new Map(loadPatterns().map((p) => [p.id, Object.assign({}, p, { occurrences: [...(p.occurrences || [])], _pending: 0 })]));
  for (const s of loadInbox()) {
    for (const e of s.entries) {
      if (!e.id) continue;
      const p = applyEntry(byId, e);
      p._pending = (p._pending || 0) + 1;
    }
  }
  return [...byId.values()].sort((a, b) => (b.count || 0) - (a.count || 0) || a.id.localeCompare(b.id));
}

/** 낱장 이름 = 브랜치. 본 폴더 main 은 낱장을 쓰지 않고 바로 접는다(단일 기록자). */
function sheetNameFor(root) {
  return wt.branchSlug(root);
}

/**
 * 기록 1건. 별도 폴더(또는 main 이 아닌 브랜치)면 낱장에 append, 본 폴더 main 이면 바로 패턴 파일에 접는다.
 * 반환: { where: 'inbox'|'patterns', file, count }
 */
function add(entry) {
  if (!entry.id || !ID_RE.test(entry.id)) throw new Error(`id 형식 오류: "${entry.id}" (소문자·숫자·하이픈)`);
  if (!entry.summary) throw new Error('--summary 가 필요합니다 (무슨 일이 있었는지 한 줄)');
  const exists = fs.existsSync(path.join(PATTERNS, `${entry.id}.json`))
    || loadInbox().some((s) => s.entries.some((e) => e.id === entry.id));
  if (!exists && !entry.label) throw new Error(`새 패턴 "${entry.id}" 에는 --label 이 필요합니다 (사람이 읽는 이름)`);
  const e = {
    id: entry.id,
    date: entry.date || new Date().toISOString().slice(0, 10),
    summary: entry.summary,
  };
  if (entry.label) e.label = entry.label;
  if (entry.category) e.category = entry.category;
  if (entry.recommendedRule) e.recommendedRule = entry.recommendedRule;

  const direct = !wt.isLinkedWorktree(ROOT) && wt.currentBranch(ROOT) === 'main';
  if (direct) {
    const byId = new Map(loadPatterns().map((p) => [p.id, p]));
    const p = applyEntry(byId, e);
    const file = path.join(PATTERNS, `${p.id}.json`);
    const clean = Object.assign({}, p); delete clean._file; delete clean._pending;
    writeJson(file, clean);
    touchMeta();
    return { where: 'patterns', file: path.relative(ROOT, file), count: p.count };
  }
  const sheet = sheetNameFor(ROOT);
  const file = path.join(INBOX, `${sheet}.jsonl`);
  fs.mkdirSync(INBOX, { recursive: true });
  fs.appendFileSync(file, JSON.stringify(e) + '\n');
  const now = merged().find((p) => p.id === e.id);
  return { where: 'inbox', file: path.relative(ROOT, file), count: now ? now.count : 1 };
}

/** 낱장 전부를 패턴 파일에 접어 넣고 낱장을 지운다. 반환: { sheets, entries, touched: [ids] } */
function fold() {
  const sheets = loadInbox();
  const byId = new Map(loadPatterns().map((p) => [p.id, p]));
  const touched = new Set();
  let entries = 0;
  for (const s of sheets) {
    for (const e of s.entries) {
      if (!e.id) throw new Error(`${s.file}: 깨진 줄 — ${e._bad || JSON.stringify(e)}`);
      applyEntry(byId, e);
      touched.add(e.id);
      entries++;
    }
  }
  for (const id of touched) {
    const p = Object.assign({}, byId.get(id)); delete p._file; delete p._pending;
    writeJson(path.join(PATTERNS, `${id}.json`), p);
  }
  for (const s of sheets) fs.unlinkSync(path.join(ROOT, s.file));
  if (entries) touchMeta();
  return { sheets: sheets.length, entries, touched: [...touched] };
}

function touchMeta() {
  const m = loadMeta();
  m.updatedAt = new Date().toISOString().slice(0, 10);
  writeJson(META, m);
}

/** 구조 검사 — 문제 목록 반환(빈 배열이면 정상). */
function check() {
  const problems = [];
  if (fs.existsSync(LEGACY)) problems.push('옛 단일 장부 reports/repeated-requests.json 이 남아 있음 — 정본은 폴더(낱장). 내용을 옮겼으면 지우세요.');
  if (!fs.existsSync(META)) problems.push('_meta.json 없음');
  if (!fs.existsSync(PATTERNS)) problems.push('patterns/ 폴더 없음');
  const ids = new Set();
  for (const n of fs.existsSync(PATTERNS) ? fs.readdirSync(PATTERNS) : []) {
    if (!n.endsWith('.json')) { problems.push(`patterns/${n}: .json 아님`); continue; }
    let p;
    try { p = readJson(path.join(PATTERNS, n)); } catch (e) { problems.push(`patterns/${n}: JSON 깨짐 (${e.message})`); continue; }
    const id = n.replace(/\.json$/, '');
    if (p.id !== id) problems.push(`patterns/${n}: 파일명(${id}) ≠ id(${p.id})`);
    if (!ID_RE.test(id)) problems.push(`patterns/${n}: id 형식 오류`);
    if (!p.label) problems.push(`patterns/${n}: label 없음`);
    if (typeof p.count !== 'number') problems.push(`patterns/${n}: count 숫자 아님`);
    ids.add(id);
  }
  for (const s of loadInbox()) {
    for (const e of s.entries) {
      if (e._bad) problems.push(`${s.file}: 깨진 줄`);
      else if (!e.id || !ID_RE.test(e.id)) problems.push(`${s.file}: id 형식 오류 (${e.id})`);
      else if (!ids.has(e.id) && !e.label) problems.push(`${s.file}: 새 패턴 ${e.id} 에 label 없음`);
      if (!e.summary) problems.push(`${s.file}: summary 없음 (${e.id})`);
    }
  }
  return problems;
}

module.exports = { DIR, META, PATTERNS, INBOX, LEGACY, loadMeta, loadPatterns, loadInbox, merged, add, fold, check, sheetNameFor };
