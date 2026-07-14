#!/usr/bin/env node
/**
 * pipeline-status.js
 * --------------------------------------------------------------------------
 * 토큰 파이프라인 실측 지도 + 드리프트 대시보드 생성기.
 *
 * [파이프라인 파일을 절대 삭제/수정하지 않음]
 *   - 소스/목적지/생성기 파일은 읽기만 함.
 *   - 파괴적 fs 연산(unlink/rm/rename/truncate/mkdir 등)은 프로세스 내에서 차단.
 *   - 쓰기는 오직 결과 뷰어 1개(pipeline-status.html)만.
 *
 * [사용법]
 *   node pipeline-status.js              # 정적 지도만 (코드 실행 0, 100% 안전)
 *   node pipeline-status.js --check      # + 게이트/생성기 check 실행해 드리프트까지
 *   node pipeline-status.js --root ../   # 스캔 루트 지정 (기본: 현재 폴더)
 *   node pipeline-status.js --out x.html # 출력 파일명 지정 (기본: pages/pipeline-status.html)
 *
 * 산출: pipeline-status.html (자체완결 단일 HTML, 외부 의존성 0)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
// 시스템 맵(수기·죽은파일·orphan·경계) 스캔 전용 모듈 — HTML 은 안 쓴다(쓰기는 이 파일만).
const scanSystemMap = require('./scripts/scan-system-map.js');

// ── 파괴적 연산 차단 (쓰기는 아래 writeOutput 한 곳만 허용) ──────────────
for (const fn of ['unlink', 'unlinkSync', 'rm', 'rmSync', 'rmdir', 'rmdirSync',
  'rename', 'renameSync', 'truncateSync', 'ftruncateSync', 'mkdirSync', 'mkdir',
  'appendFile', 'appendFileSync']) {
  if (typeof fs[fn] === 'function') {
    fs[fn] = () => { throw new Error('BLOCKED fs op: ' + fn); };
  }
}

// ── 인자 파싱 ──────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function argVal(flag) { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; }
const RUN_CHECK = argv.includes('--check');
// --self-check: 자기-드리프트 게이트(map:verify). 기존 --check(목적지 드리프트 측정)와 별개.
// 재생성 결과가 커밋된 pipeline-status.html 과 (휘발성/측정값 제외) 다르면 exit 1. 파일은 쓰지 않는다.
const SELF_CHECK = argv.includes('--self-check');
const ROOT = path.resolve(argVal('--root') || '.');
const OUT = argVal('--out') || 'pages/pipeline-status.html';
const OUT_ABS = path.resolve(ROOT, OUT);
// --skip name1,name2 : 특정 명령을 자동 실행에서 제외 (예: 무겁거나 느린 종합 게이트)
const SKIP_NAMES = (argVal('--skip') || '').split(',').map(s => s.trim()).filter(Boolean);

// ── 유틸 ────────────────────────────────────────────────────────────────
function walk(dir, acc, depth) {
  if (depth > 6) return acc;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return acc; }
  for (const e of entries) {
    // 파이프라인과 무관한 폴더 제외 (.claude = Claude Code 자체 설정/에이전트/스킬)
    if (['node_modules', '.git', '.claude', '.vscode', '.github', '.husky'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    try {
      if (e.isDirectory()) walk(full, acc, depth + 1);
      else if (e.isFile()) acc.push(full);
    } catch (_) {}
  }
  return acc;
}
const rel = p => path.relative(ROOT, p) || path.basename(p);
const base = p => path.basename(p);
function read(p) { try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; } }
function mtime(p) { try { return fs.statSync(p).mtime.toISOString(); } catch (_) { return null; } }
// 문자열 리터럴 추출 — 정규식 대신 글자 단위 선형 스캔 (백트래킹 불가 = 멈춤 없음)
function stringLiterals(src) {
  const out = []; const n = src.length; let i = 0;
  while (i < n) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1, buf = '';
      while (j < n) {
        const c = src[j];
        if (c === '\\') { buf += (src[j + 1] || ''); j += 2; continue; }
        if (c === ch) break;
        if (ch !== '`' && (c === '\n' || c === '\r')) break; // 닫히지 않은 일반 문자열
        buf += c; j++;
      }
      if (j < n && src[j] === ch) { out.push(buf); i = j + 1; } else { i++; }
      if (out.length > 5000) break; // 병적 케이스 방어
    } else i++;
  }
  return out;
}
function isPathLike(s) {
  if (!s) return false;
  if (s.includes('/') || s.includes('\\')) return true;
  return /\.(css|html?|tsx?|jsx?|mjs|cjs|json|md|txt|svg|scss|less)$/i.test(s);
}
function findCallPaths(src, fnNames) {
  const out = []; const re = new RegExp('\\b(' + fnNames.join('|') + ')\\s*\\(', 'g'); let m;
  while ((m = re.exec(src))) {
    // 첫 번째 인자만 정확히 추출 (top-level ',' 또는 ')' 전까지)
    let depth = 0, arg = '';
    for (let i = re.lastIndex; i < src.length && i < re.lastIndex + 300; i++) {
      const ch = src[i];
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') { if (depth === 0) break; depth--; }
      else if (ch === ',' && depth === 0) break;
      arg += ch;
    }
    const line = src.slice(0, m.index).split('\n').length;
    out.push({ fn: m[1], line, paths: stringLiterals(arg).filter(isPathLike) });
  }
  return out;
}
function genMarkerLines(src, limit) {
  const lines = src.split('\n'); const out = [];
  for (let i = 0; i < lines.length && out.length < (limit || 60); i++) {
    if (/GEN/.test(lines[i])) out.push({ line: i + 1, text: lines[i].trim().slice(0, 160) });
  }
  return out;
}
// 한 파일 안에서 확보 목적지 basename들이 언급되는지 (커버리지/엣지 도출용)
function mentions(src, names) {
  return names.filter(n => src.includes(n));
}

// ── 1. 파일 발견 ────────────────────────────────────────────────────────
const files = walk(ROOT, [], 0);
const THIS_FILE = base(process.argv[1] || 'pipeline-status.js');

// 목적지 = 결과물(.html/.css/.md 소비 산출물)만. 스크립트(.js/.ts)는 목적지가 아님.
// design.core.md/design.vms.md = AI 소비용 DESIGN.md (tokens/registry → gen-design-md → md 흐름 표시용).
const DEST_HINT = ['tokens.css', 'foundation.html', 'semantic.html', 'typography.css',
  'dashboard.html', 'update-management.html', 'design.core.md', 'design.vms.md'];
const destinations = files.filter(p => {
  const b = base(p).toLowerCase();
  if (!/\.(html?|css|md)$/i.test(b)) return false;
  return DEST_HINT.includes(b) || b.includes('install-prompt');
});
const destBasenames0 = destinations.map(base);

// 생성기 = 이름(gen-*)이거나, "파일을 write + 목적지/마커 참조"하는 스크립트(휴리스틱 기반).
// 게이트류(write 없이 read/검사만)는 여기 제외함.
const generators = files.filter(p => {
  const b = base(p);
  if (!/\.(m?[jt]s|cjs)$/i.test(b)) return false;
  if (b === THIS_FILE) return false;
  if (/^gen[-.]/i.test(b) || /(?:^|[-.])gen\.(m?[jt]s|cjs)$/i.test(b)) return true;
  // 이름이 gen-* 이 아니면 "휴리스틱"으로 판별. 단, 목적지에 실제로 쓰는 것만 (검사/동기화 스크립트 제외)
  let sz = 0; try { sz = fs.statSync(p).size; } catch (_) { return false; }
  if (sz > 300 * 1024) return false;                          // 번들류 건너뜀
  const src = read(p) || '';
  if (!/\b(writeFileSync|writeFile|createWriteStream)\s*\(/.test(src)) return false;
  // (a) 쓰기 대상이 목적지 화면인가  (b) GEN 마커 문자열을 가졌는가(=마커 사이 교체형 생성기)
  const writeTargets = findCallPaths(src, ['writeFileSync', 'writeFile', 'createWriteStream'])
    .flatMap(w => w.paths).map(base);
  const writesDest = writeTargets.some(t => destBasenames0.includes(t));
  const hasGenMarkerLiteral = stringLiterals(src).some(s => /\bGEN[:\-]/.test(s));
  return writesDest || hasGenMarkerLiteral;
});
// 정본 후보: *-data.ts, governance/*.json 등 (읽히지만 생성되지 않는 것으로 나중에 확정)
const dataFiles = files.filter(p => /-data\.(m?[jt]s|cjs)$/i.test(base(p))
  || /governance|guardian|registry/i.test(rel(p)) && /\.json$/i.test(base(p)));

// ── 2. 생성기 정적 분석 ────────────────────────────────────────────────
const destBasenames = destinations.map(base);
const genInfo = generators.map(gp => {
  const src = read(gp) || '';
  const reads = findCallPaths(src, ['readFileSync', 'readFile', 'createReadStream']);
  const writes = findCallPaths(src, ['writeFileSync', 'writeFile', 'createWriteStream']);
  const lits = stringLiterals(src).filter(isPathLike);
  // @reads: 힌트 — 자동 추적이 못 잡는 입력(require 경유·path.join 조각 등)을 파일이 직접 선언
  const readsHint = [];
  (src.match(/@reads:\s*([^\n*]+)/g) || []).forEach(m => {
    m.replace(/@reads:\s*/, '').split(',').forEach(x => { const t = x.trim(); if (t) readsHint.push(t); });
  });
  readsHint.forEach(h => { if (!lits.includes(h)) lits.push(h); });  // 참조 목록에 합류 → 정본 도출·엣지가 살아남
  const readLits = [...new Set(reads.flatMap(r => r.paths).concat(readsHint))];
  const writeLits = [...new Set(writes.flatMap(w => w.paths))];
  // 참조하는 목적지 (호출 지점 변수 경유를 놓칠 수 있어 파일 전체 리터럴로 보수적으로 매칭)
  const refDest = destinations.filter(d =>
    lits.some(l => rel(d).endsWith(l) || l.endsWith(base(d)))).map(rel);
  // 읽는 목적지(=중간 산출물 소비) vs 쓰는 목적지(=이 생성기의 출력)
  const readDest = refDest.filter(d => readLits.some(l => base(d) === base(l)));
  const writeDest = refDest.filter(d => !readDest.includes(d));
  return {
    file: rel(gp), mtime: mtime(gp),
    read_paths: readLits,
    write_paths: writeLits,
    all_path_literals: [...new Set(lits)],
    ref_destinations: [...new Set(refDest)],
    read_destinations: [...new Set(readDest)],
    write_destinations: [...new Set(writeDest)],
    has_check_flag: /--check/.test(src),
    check_context: (function () {
      const l = src.split('\n'); const o = [];
      for (let i = 0; i < l.length && o.length < 6; i++)
        if (/--check|\bcheck\b/i.test(l[i])) o.push('L' + (i + 1) + ': ' + l[i].trim().slice(0, 120));
      return o;
    })(),
    gen_markers: stringLiterals(src).filter(s => /GEN/.test(s)).slice(0, 12),
  };
});

// ── 3. 목적지 마커 스캔 ────────────────────────────────────────────────
const destInfo = destinations.map(dp => {
  const src = read(dp) || '';
  const marks = genMarkerLines(src, 60);
  const generatedBy = genInfo.filter(g => g.write_destinations.includes(rel(dp))
    || g.write_paths.some(w => rel(dp).endsWith(w) || w.endsWith(base(dp)))).map(g => g.file);
  return {
    file: rel(dp), mtime: mtime(dp), total_lines: src.split('\n').length,
    has_markers: marks.length > 0, marker_count: marks.length, marker_lines: marks,
    generated_by: [...new Set(generatedBy)],
  };
});

// ── 4. 정본(root) 도출: 결과 파일로 흐르는 생성기가 읽는 "소스/데이터 파일"만 ──────────
const stripExt = s => base(s).replace(/\.\w+$/, '');
const allWritten = new Set();
genInfo.forEach(g => { g.write_destinations.forEach(d => allWritten.add(base(d))); });
destInfo.forEach(d => allWritten.add(base(d.file)));
// 결과 파일(목적지)을 실제로 만드는 생성기만 = "흐르는 생성기"
const flowingGens = genInfo.filter(g => g.write_destinations.length > 0);
const rootFiles = files.filter(p => {
  const b = base(p);
  // 정본은 코드/데이터 소스만: .ts/.js/.mjs/.cjs/.json (문서·설정 제외)
  if (!/\.(m?[jt]s|cjs|json)$/i.test(b)) return false;
  if (/^(settings|tsconfig|package|package-lock|\.eslintrc)/i.test(b)) return false;
  if (/-check\.(m?js)$/i.test(b) || /^check-/i.test(b)) return false;  // 검사기 스크립트는 정본 아님
  if (allWritten.has(b)) return false;                    // 생성물은 root 아님
  if (generators.some(g => base(g) === b)) return false;  // 생성기 자신 제외
  // 결과 파일로 흐르는 생성기가 이 파일을 읽거나 import 하는가 (규칙만 읽는 파일은 제외됨)
  return flowingGens.some(g => g.all_path_literals.some(l =>
    b === base(l) || stripExt(p) === stripExt(l)));
}).map(p => ({ file: rel(p), mtime: mtime(p), role: extractRole(p) }));

// 정본 파일에서 역할 한 줄 추출: .ts/.js 는 @role:, .json 은 "_role"
function extractRole(p) {
  const src = read(p) || '';
  let m = src.match(/@role:\s*(.+)/);
  if (m) return m[1].replace(/\*+\/?\s*$/, '').trim().slice(0, 60);
  m = src.match(/"_role"\s*:\s*"([^"]+)"/);
  if (m) return m[1].trim().slice(0, 60);
  return '';
}

// ── 5. 엣지 도출 ──────────────────────────────────────────────────────
const edges = [];
genInfo.forEach(g => {
  // root → generator (정확한 basename / 확장자 무시 import 매칭)
  rootFiles.forEach(r => {
    if (g.all_path_literals.some(l => base(r.file) === base(l) || stripExt(r.file) === stripExt(l)))
      edges.push({ from: r.file, to: g.file, kind: 'src' });
  });
  // generator → destination (쓰는 목적지)
  g.write_destinations.forEach(d => edges.push({ from: g.file, to: d, kind: 'gen' }));
  // 2단계: 생성기가 목적지(=중간 산출물)를 읽는 경우
  g.read_destinations.forEach(d => edges.push({ from: d, to: g.file, kind: 'stage2' }));
});

// ── 6. 게이트/체크 명령 발견 (package.json + 생성기 --check) ──────────
function backingFile(cmd) {
  const m = cmd && cmd.match(/([\w./-]+\.(?:m?[jt]s|cjs))/);
  if (!m) return null;
  const cand = files.find(p => rel(p).endsWith(m[1]) || base(p) === base(m[1]));
  return cand ? rel(cand) : m[1];
}

// 실제 "명령줄"로 판정 (npm 이름은 신뢰 제한).
const WRITER = /(--fix\b|--apply\b|apply-[a-z]|esbuild|build-[a-z]+\.|\bmkdir\b|\bcp\s|>\s|install-git-hooks|reports-sync|reconcile|guard\/(apply|suggest)|export-|-zip\.js|&&)/i;
const NETWORK = /(scripts\/figma\/|--env-file|fetch-figma)/i;  // 실제 Figma API 호출만 (폴더명 아님)
const CHECKISH_NAME = /(check|audit|verify|monitor|consisten|dry|preview|gate|orphan|policy|coverage|anatomy)/i;
function readonlyReason(cmd) {
  const bf = backingFile(cmd);
  const b = base(bf || '');
  if (WRITER.test(cmd)) return { ok: false, why: '쓰기/빌드 가능성' };
  // --check/--dry-run/--noEmit 계열은 설계상 무쓰기 → 그대로 신뢰 (백킹이 생성기여도 check모드는 안전)
  if (/(--check\b|--dry-run\b|--noEmit\b)/.test(cmd)) return { ok: true };
  // 이름이 check/monitor/consistency 여도, 파일이 실제로 쓰기를 하는지 확인
  const named = /(^|[-/])check-/i.test(b) || /-check\.(m?js)$/i.test(b) || /(monitor|consistency)\.(m?js)$/i.test(b);
  if (!named) return { ok: false, why: '읽기전용 확신 못 함' };
  const src = bf ? (read(path.resolve(ROOT, bf)) || '') : '';
  if (/\b(writeFileSync|writeFile|createWriteStream)\s*\(/.test(src)) {
    const wt = findCallPaths(src, ['writeFileSync', 'writeFile', 'createWriteStream']).flatMap(w => w.paths).map(base);
    if (wt.some(t => destBasenames.includes(t))) return { ok: false, why: '토큰 화면에 씀(위험)' };
    return { ok: true, writes_report: true };   // 화면 아닌 리포트만 씀 → 실행하되 표기
  }
  return { ok: true };                            // 진짜 무쓰기
}

const gates = [];    // 자동 실행 대상 (확실한 읽기전용 + 비네트워크)
const skipped = [];  // 실행 제외 (사전 회피)
const pkgPath = files.find(p => base(p) === 'package.json' && !rel(p).includes('/'));
let pkgScripts = {};
if (pkgPath) { try { pkgScripts = (JSON.parse(read(pkgPath)) || {}).scripts || {}; } catch (_) {} }

for (const [name, cmd] of Object.entries(pkgScripts)) {
  const checkish = CHECKISH_NAME.test(name);
  if (SKIP_NAMES.includes(name)) {  // 사용자가 --skip 으로 지정한 명령
    skipped.push({ name, command: 'npm run ' + name, reason: '사용자 지정 제외 (--skip)' });
    continue;
  }
  if (/^tsc\b/.test(cmd.trim())) {  // 타입검사: 읽기전용이지만 토큰 드리프트와 무관 → 실행 제외
    if (checkish) skipped.push({ name, command: 'npm run ' + name, reason: '타입검사(드리프트 무관)' });
    continue;
  }
  const net = NETWORK.test(name + ' ' + cmd);
  const r = readonlyReason(cmd);
  if (net) { if (checkish) skipped.push({ name, command: 'npm run ' + name, reason: '망분리: Figma/네트워크 필요' }); continue; }
  if (!r.ok) { if (checkish) skipped.push({ name, command: 'npm run ' + name, reason: r.why }); continue; }
  const bf = backingFile(cmd);
  const covers = bf && !/^tsc/.test(cmd) ? mentions(read(path.resolve(ROOT, bf)) || '', destBasenames) : [];
  gates.push({ name, command: 'npm run ' + name, backing_file: bf, writes_report: !!r.writes_report,
    covers: [...new Set(covers)], status: 'not_run', exit_code: null, output_tail: '' });
}
// 생성기 자체 --check (스크립트로 직접 도는 것만)
genInfo.filter(g => g.has_check_flag).forEach(g => {
  if (gates.some(x => x.backing_file === g.file)) return;
  const covers = mentions(read(path.resolve(ROOT, g.file)) || '', destBasenames);
  gates.push({ name: base(g.file) + ' --check', command: 'node ' + g.file + ' --check',
    backing_file: g.file, covers: [...new Set(covers)], status: 'not_run', exit_code: null, output_tail: '' });
});

// ── 7. (--check 모드) 게이트 실행 ─────────────────────────────────────
if (RUN_CHECK && gates.length) {
  const anyReport = gates.some(g => g.writes_report);
  console.log('\n[--check] 아래 명령을 실행합니다 (토큰 화면/소스에 쓰는 것은 제외' + (anyReport ? '; ⚠=자기 리포트 갱신' : '') + '):');
  gates.forEach(g => console.log('   • ' + g.command + (g.writes_report ? '  ⚠리포트씀' : '') + (g.backing_file ? '   → ' + g.backing_file : '')));
  if (skipped.length) {
    console.log('\n   실행 제외 (' + skipped.length + '건):');
    skipped.forEach(s => console.log('   ⏭ ' + s.name + '  (' + s.reason + ')'));
  }
  console.log('');
  for (const g of gates) {
    try {
      const out = cp.execSync(g.command, { cwd: ROOT, timeout: 45000, stdio: ['ignore', 'pipe', 'pipe'] });
      g.status = 'pass'; g.exit_code = 0; g.output_tail = String(out).trim().split('\n').slice(-8).join('\n').slice(0, 800);
      console.log('   ✓ pass  ' + g.command);
    } catch (e) {
      const combined = ((e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '')).trim();
      const timedOut = e.killed || e.signal === 'SIGTERM' || e.code === 'ETIMEDOUT';
      const notFound = /command not found|not recognized|Cannot find module|ENOENT|Missing script/i.test(combined) || e.code === 'ENOENT';
      g.exit_code = typeof e.status === 'number' ? e.status : null;
      if (timedOut) { g.status = 'error'; g.output_tail = '(45초 초과 → 중단. 네트워크 대기 등 가능)'; }
      else if (notFound) { g.status = 'error'; g.output_tail = combined.split('\n').slice(-8).join('\n').slice(0, 800); }
      else {
        // 실패한 검사가 토큰 화면을 커버하면 '드리프트', 아니면 '화면 무관 검사 실패'
        g.status = 'fail'; g.fail_kind = g.covers.length ? 'drift' : 'check';
        g.output_tail = combined.split('\n').slice(-8).join('\n').slice(0, 800);
      }
      const label = g.status === 'fail'
        ? (g.fail_kind === 'drift' ? '✗ 드리프트(화면 값 어긋남)' : '⚠ 검사 실패(토큰 화면 무관)')
        : (timedOut ? '⚠ timeout(측정 유보)' : '⚠ error(실행 확인)');
      console.log('   ' + label + '  ' + g.command);
    }
  }
} else if (RUN_CHECK) {
  console.log('[--check] 실행할 게이트를 하나도 못 찾음. package.json 스크립트/생성기 --check 확인 필요.');
} else if (gates.length && !SELF_CHECK) {
  console.log('\n[정적 모드] --check 시 실행될 명령 (' + gates.length + '건, 지금은 실행 안 함):');
  gates.forEach(g => console.log('   • ' + g.command + (g.writes_report ? '  ⚠리포트씀' : '')));
  if (skipped.length) {
    console.log('\n   실행 제외 (' + skipped.length + '건, 사전):');
    skipped.forEach(s => console.log('   ⏭ ' + s.name + '  (' + s.reason + ')'));
  }
}

// ── 8. 목적지별 커버리지·사각지대 판정 ────────────────────────────────
destInfo.forEach(d => {
  const genCheck = d.generated_by.some(gf => (genInfo.find(g => g.file === gf) || {}).has_check_flag);
  const coveredBy = gates.filter(g => g.covers.some(c => base(d.file) === c)).map(g => g.name);
  d.has_generator_check = genCheck;
  d.covered_by = [...new Set(coveredBy)];
  d.blind_spot = !genCheck && coveredBy.length === 0;  // 아무도 값검사 안 되는 화면
  // 드리프트 상태(측정 안 했으면 not_run)
  if (!RUN_CHECK) d.drift = 'not_run';
  else if (d.covered_by.length === 0 && !genCheck) d.drift = 'unmeasured';
  else {
    const relevant = gates.filter(g => d.covered_by.includes(g.name));
    if (relevant.some(g => g.status === 'fail')) d.drift = 'fail';
    else if (relevant.some(g => g.status === 'error')) d.drift = 'error';
    else if (relevant.length && relevant.every(g => g.status === 'pass')) d.drift = 'pass';
    else d.drift = 'unmeasured';
  }
});

const blindSpots = destInfo.filter(d => d.blind_spot).map(d => d.file);

// ── 9. 데이터 객체 ──────────────────────────────────────────────────────
const DATA = {
  meta: {
    generated_at: new Date().toISOString(), node: process.version, root: ROOT,
    mode: RUN_CHECK ? 'check' : 'static', scanned_files: files.length,
    pkg_json: pkgPath ? rel(pkgPath) : null, skipped_gates: skipped,
  },
  roots: rootFiles, generators: genInfo, destinations: destInfo,
  edges, gates, blind_spots: blindSpots,
  // 시스템 맵 = 토큰 건강도(수기·죽은파일·orphan·경계). 파랑(자동)은 요약 배지 한 줄로만.
  // 색 판정은 scan-system-map 이 "생성기 write 유무"로 동적 계산(하드코딩 아님).
  system_map: scanSystemMap(ROOT, {
    generators: genInfo, destinations: destInfo, gates, blindSpots, runCheck: RUN_CHECK,
  }),
};

// ── 10. 뷰어 HTML 생성 ────────────────────────────────────────────────
function writeOutput(absPath, html) {
  if (base(absPath) !== base(OUT)) throw new Error('출력 경로 안전 검증 실패: ' + absPath);
  fs.writeFileSync(absPath, html, 'utf8');  // 유일하게 허용된 쓰기
}

// ── 자기-드리프트 게이트 (--self-check / map:verify) ────────────────────────
// 정규화 원칙: 휘발성/측정값 필드는 "삭제하지 않고" 양쪽 모두 sentinel 로 덮는다.
//   → 값 변동=무시 / 키 삭제·추가·타입변경=FAIL 로 잡힘(삭제 방식은 영구 사각지대라 금지).
const SENTINEL = '<VOLATILE>';
const VOLATILE_FIELDS = [           // 매 실행 달라지는 휘발성 (사용자 지정 3 + 파생)
  'meta.generated_at',             // 실행 시각
  'system_map.scanned_at',         // 스캔 시각(생성 시각 파생)
  'system_map.git',                // 커밋 해시·날짜(커밋 순간 기준선과 불일치)
  'system_map.orphan',             // Gate 17 스냅샷(allowlist 타 세션 편집 → 실행마다 다름)
];
const RUNTIME_MEASUREMENT_FIELDS = [ // --check 실행 결과(내용 아님)
  'meta.mode', 'meta.scanned_files',
  'gates[].status', 'gates[].exit_code', 'gates[].output_tail', 'gates[].fail_kind',
  'destinations[].drift',
  'system_map.pipeline_summary.drift', 'system_map.pipeline_summary.measured',
];
const MASK_SPECS = VOLATILE_FIELDS.concat(RUNTIME_MEASUREMENT_FIELDS);

// spec: 'a.b.c'(스칼라, 없으면 생성) 또는 'arr[].leaf'(배열 원소별 leaf 를 sentinel 로)
function maskSpec(obj, spec) {
  const ai = spec.indexOf('[].');
  if (ai < 0) {
    const keys = spec.split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) { if (o == null || typeof o !== 'object') return; o = o[keys[i]]; }
    if (o && typeof o === 'object') o[keys[keys.length - 1]] = SENTINEL;  // 생성/덮어쓰기
    return;
  }
  const arrPath = spec.slice(0, ai).split('.');
  const leaf = spec.slice(ai + 3);
  let o = obj;
  for (const k of arrPath) { if (o == null) return; o = o[k]; }
  if (Array.isArray(o)) o.forEach(el => { if (el && typeof el === 'object') el[leaf] = SENTINEL; });
}
function maskAll(D) {
  const clone = JSON.parse(JSON.stringify(D));
  MASK_SPECS.forEach(s => maskSpec(clone, s));
  return clone;
}
// HTML 을 (임베드 D) + (나머지 셸)로 분리. 셸은 손편집 탐지용, D 는 마스킹 비교용.
function splitDoc(html) {
  const lines = html.split('\n');
  const idx = lines.findIndex(l => l.startsWith('const D = JSON.parse('));
  if (idx < 0) return null;
  const line = lines[idx];
  const jsonStr = line.slice('const D = JSON.parse('.length, line.lastIndexOf(');'));
  let D;
  try { D = JSON.parse(JSON.parse(jsonStr)); } catch (_) { return null; }
  lines[idx] = 'const D = <<MASKED>>;';
  return { shell: lines.join('\n'), D };
}
function selfCheck(freshHtml, absPath) {
  const committed = read(absPath);
  const excluded = MASK_SPECS;
  const excludedLine = '  비교 제외 필드 ' + excluded.length + '개 (sentinel 치환·값차이 무시): ' + excluded.join(', ');
  if (committed == null) {
    console.error('❌ [map:verify] 비교 대상 파일 없음: ' + rel(absPath) + ' — 먼저 생성 필요.');
    console.error(excludedLine);
    return 1;
  }
  const A = splitDoc(committed), B = splitDoc(freshHtml);
  if (!A || !B) {
    console.error('❌ [map:verify] 임베드 D 추출 실패(구조 파손 의심).');
    console.error(excludedLine);
    return 1;
  }
  const shellSame = A.shell === B.shell;
  const dataSame = JSON.stringify(maskAll(A.D)) === JSON.stringify(maskAll(B.D));
  if (shellSame && dataSame) {
    console.log('✅ [map:verify] pipeline-status.html 이 정본과 일치(휘발성 제외).');
    console.log(excludedLine);
    return 0;
  }
  console.error('❌ [map:verify] pipeline-status.html 이 정본과 불일치 — 재생성 필요.');
  console.error('   (재생성: node pipeline-status.js --check --skip gate:check,components:presentation --out pages/pipeline-status.html)');
  if (!shellSame) console.error('  · 템플릿/CSS/렌더 영역 불일치(손편집 의심).');
  if (!dataSame) console.error('  · 임베드 데이터(내용 필드) 불일치.');
  console.error(excludedLine);
  return 1;
}

if (SELF_CHECK) {
  process.exit(selfCheck(buildHTML(DATA), OUT_ABS));
}
writeOutput(OUT_ABS, buildHTML(DATA));

console.log('\n생성 완료 →', rel(OUT_ABS));
console.log('모드:', DATA.meta.mode, '| 생성기', genInfo.length, '| 목적지', destInfo.length,
  '| 게이트', gates.length, '| 사각지대', blindSpots.length);
if (blindSpots.length) console.log('사각지대(값검사 없음):', blindSpots.join(', '));
if (RUN_CHECK) {
  const drift = gates.filter(g => g.status === 'fail' && g.fail_kind === 'drift').map(g => g.name);
  const checkFail = gates.filter(g => g.status === 'fail' && g.fail_kind === 'check').map(g => g.name);
  console.log('드리프트(화면 값 어긋남):', drift.length ? drift.join(', ') : '없음 ✅');
  if (checkFail.length) console.log('화면 무관 검사 실패:', checkFail.join(', '));
}
console.log('브라우저로 열면 지도+상태를 볼 수 있어. 새로고침하려면 이 스크립트를 다시 실행.');

// ==========================================================================
//  뷰어 템플릿
// ==========================================================================
function buildHTML(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>토큰 파이프라인 상태</title>
<link rel="stylesheet" href="../assets/css/style.css">
<style>
:root{--bg:#f6f7f9;--card:#fff;--ink:#1a1d21;--sub:#6b7280;--line:#e3e6ea;
--pass:#1a9e5f;--fail:#d64545;--warn:#c9820a;--gray:#9aa1a9;--acc:#2b6cb0;
--src:#7c5cff;--gen:#2b6cb0;--dst:#0e8a6e;}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink)}
.wrap{max-width:1180px;margin:0 auto;padding:20px}
.snap{background:#fff8e6;border:1px solid #f0d98a;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px}
.snap b{color:#8a6400}
h1{font-size:19px;margin:0 0 2px} .muted{color:var(--sub);font-size:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px}
.card h2{font-size:14px;margin:0 0 12px;letter-spacing:.02em}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--sub);margin-bottom:10px}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;vertical-align:middle}
/* 설명 배너 */
.about{background:#eef4fb;border:1px solid #cfe0f3;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px}
.about b{color:#1a4d80}
.about .key{margin-top:6px;display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#33506e}
.about .key span{display:inline-flex;align-items:center;gap:5px}
.sw{width:11px;height:11px;border-radius:3px;display:inline-block}
/* 지도 (3열 + 연결선) */
#map{position:relative;overflow-x:auto}
svg.wires{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}
.cols{display:grid;grid-template-columns:1fr 1.1fr 1.2fr;gap:60px;position:relative;z-index:2;min-width:760px}
.col h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--sub);margin:0 0 10px}
.group-h{font-size:11px;font-weight:700;color:var(--acc);margin:14px 0 7px;padding-left:2px;border-left:3px solid var(--src);padding-left:8px}
.group-h:first-of-type{margin-top:0}
.group-h .cnt{color:var(--sub);font-weight:400}
.node{background:#fff;border:1px solid var(--line);border-left:3px solid var(--gray);
border-radius:8px;padding:8px 10px;margin-bottom:10px;font-size:12.5px;position:relative}
.node.src{border-left-color:var(--src)} .node.gen{border-left-color:var(--gen)} .node.dst{border-left-color:var(--dst)}
.node .nm{font-weight:600;word-break:break-all}
.node .meta{color:var(--sub);font-size:11px;margin-top:2px}
.badges{margin-top:6px;display:flex;gap:5px;flex-wrap:wrap}
.b{font-size:10.5px;padding:1px 7px;border-radius:999px;border:1px solid var(--line);color:var(--sub);background:#fafbfc}
.b.auto{color:#0e8a6e;border-color:#bfe6d8;background:#effaf5}
.b.manual{color:#8a6400;border-color:#f0d98a;background:#fff8e6}
.b.pass{color:#fff;background:var(--pass);border-color:var(--pass)}
.b.fail{color:#fff;background:var(--fail);border-color:var(--fail)}
.b.warn{color:#fff;background:var(--warn);border-color:var(--warn)}
.b.blind{color:#fff;background:#111;border-color:#111}
/* 표 */
table{width:100%;border-collapse:collapse;font-size:12.5px}
th,td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--sub);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
td.f{font-weight:600;word-break:break-all}
.tail{font:11px/1.4 ui-monospace,Menlo,Consolas,monospace;color:var(--sub);white-space:pre-wrap;margin-top:3px}
.blindbox{background:#111;color:#fff;border-radius:12px;padding:14px 16px;margin-top:16px}
.blindbox h2{color:#fff;margin:0 0 8px;font-size:14px}
.blindbox .item{font-size:12.5px;padding:3px 0;border-bottom:1px solid #333}
.empty{color:var(--sub);font-size:12.5px;padding:6px 0}
/* 시스템 맵 — 관계 도식 */
.sysmap-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
.sysmap-stamp{font-size:11px;color:var(--sub)}
.sm-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:var(--sub);margin:10px 0 8px}
.sm-legend span{display:inline-flex;align-items:center;gap:6px}
.sm-legend i{width:11px;height:11px;border-radius:3px;display:inline-block}
/* 도식 컨테이너 + SVG 오버레이(연결선) */
.sm-diagram{position:relative;overflow-x:auto;padding:4px 0}
svg.sm-wires{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}
.sm-bands{position:relative;z-index:2;display:flex;flex-direction:column;gap:30px;min-width:720px;padding:6px 0}
.sm-band{border-radius:10px;position:relative}
.sm-band-label{position:absolute;top:-9px;left:10px;background:var(--card);border:1px solid var(--line);border-radius:4px;padding:0 6px;font-size:9.5px;font-weight:700;letter-spacing:.05em;color:var(--sub);text-transform:uppercase}
/* 파랑(자동) 밴드 — 일부러 얇게·작게 */
.sm-band.blue{background:#f4f8fd;border:1px solid #e2edf9;display:flex;gap:44px;align-items:center;padding:12px 14px 10px}
/* 혼합(수기·죽은·경계) 밴드 — 이 도식의 주인공 */
.sm-band.mixed{display:flex;flex-wrap:wrap;gap:18px 44px;padding:16px 14px 12px}
.sm-node{background:#fff;border:1px solid var(--line);border-left:3px solid var(--gray);border-radius:8px;padding:8px 11px;font-size:12px;min-width:148px}
.sm-node .nm{font-weight:600;word-break:break-all}
.sm-node .mt{color:var(--sub);font-size:11px;margin-top:2px}
.sm-node.blue{border-left-color:var(--gen);min-width:112px;padding:6px 10px;font-size:11px;background:#fbfdff}
.sm-node.manual{border-left-color:var(--fail);background:#fdf4f4}
.sm-node.dead{border-left-color:var(--gray);background:#f3f4f5;opacity:.9}
.sm-node.ref{border-left-color:var(--fail)}
.sm-node.boundary{border-left-color:var(--warn);background:#fdf9ef}
.sm-node.na{border-left-color:var(--gray);border-style:dashed;color:var(--sub)}
.sm-na{color:var(--sub);font-style:italic}
.sm-foot{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;color:var(--sub)}
.sm-chip{background:#fff;border:1px solid var(--line);border-radius:999px;padding:3px 10px}
.sm-chip b{color:var(--ink)}
</style></head><body>
<div class="mobile-header">
  <button class="hamburger" id="sidebar-toggle" aria-label="메뉴">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  </button>
  <span class="mobile-logo">파이프라인 상태</span>
</div>
<div class="sidebar-overlay" id="sidebar-overlay"></div>
<div class="app">
  <aside class="sidebar" id="sidebar"></aside>
  <main class="main-content">
    <div class="page-header">
      <div class="page-header-inner">
        <div class="page-header-text">
          <h1>🔗 토큰 파이프라인 상태</h1>
          <p id="sub"></p>
        </div>
        <div class="page-header-actions">
          <span class="badge badge-green">자동 생성</span>
        </div>
      </div>
    </div>
<div class="wrap">
<div class="snap" id="snap"></div>
<div class="about">
  <b>이 화면은?</b> 디자인 토큰의 정본(vars-data 등)에 넣은 값이 실제 결과 파일(tokens.css·typography.css 등)까지 제대로 전달되는지 자동으로 대조한 결과임. 왼쪽 정본 → 가운데 생성기 → 오른쪽 결과 파일 순으로 흐릅니다.
  <div class="key">
    <span><i class="sw" style="background:var(--pass)"></i>정본과 일치</span>
    <span><i class="sw" style="background:var(--fail)"></i>값 어긋남(드리프트)</span>
    <span><i class="sw" style="background:#111"></i>검사 없음(사각지대)</span>
    <span><i class="sw" style="background:var(--warn)"></i>검사 실패·측정 유보</span>
  </div>
</div>
<div class="card"><h2>파이프라인 지도 (스캔으로 자동 도출)</h2>
  <div class="legend">
    <span><i class="dot" style="background:var(--src)"></i>정본/소스 (유형별 묶음)</span>
    <span><i class="dot" style="background:var(--gen)"></i>생성기</span>
    <span><i class="dot" style="background:var(--dst)"></i>목적지</span>
    <span>실선=생성 · 점선=2단계(산출물을 다시 읽음)</span>
  </div>
  <div id="map"><svg class="wires" id="wires"></svg><div class="cols" id="cols"></div></div>
</div>
<div class="card" id="sysmap"><h2>🗺 토큰 시스템 맵 (스캔 자동 도출 · 토큰 건강도)</h2></div>
<div class="grid">
  <div class="card"><h2>목적지 상태</h2><div id="desttbl"></div></div>
  <div class="card"><h2>게이트 / 값 일치 검사</h2><div id="gatetbl"></div></div>
</div>
<div class="card" style="margin-top:16px"><h2>생성기 (read → write)</h2><div id="gentbl"></div></div>
</div>
  </main>
</div>
<script src="../assets/js/main.js"></script>
<script>
const D = JSON.parse(${JSON.stringify(json)});
const esc = s => String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const bn = p => String(p).split('/').pop();

// 헤더
document.getElementById('sub').textContent =
  'root: '+D.meta.root+'  ·  스캔 파일 '+D.meta.scanned_files+'개  ·  '+D.meta.node;
const modeTxt = D.meta.mode==='check'
  ? '드리프트까지 실측함(--check 실행됨).'
  : '정적 지도만. 값 일치는 미측정 → <b>node pipeline-status.js --check</b> 로 실행.';
document.getElementById('snap').innerHTML =
  '<b>스냅샷</b> '+esc(D.meta.generated_at)+' 시점. 이 화면은 실시간이 아니라 그때의 스냅샷임. 새로고침하려면 러너를 다시 실행. → '+modeTxt;

// 노드 element (연결선용 dataset.id 포함)
function nodeEl(id,cls,name,meta,badges){
  const d=document.createElement('div'); d.className='node '+cls; d.dataset.id=id;
  d.innerHTML='<div class="nm">'+esc(bn(name))+'</div>'+(meta?'<div class="meta">'+meta+'</div>':'')
    +(badges?'<div class="badges">'+badges+'</div>':''); return d;
}
function destBadges(dd){
  let b = dd.has_markers?'<span class="b auto">자동(마커 '+dd.marker_count+')</span>':'<span class="b manual">손유지(마커X)</span>';
  if(dd.drift==='pass')b+='<span class="b pass">일치</span>';
  else if(dd.drift==='fail')b+='<span class="b fail">드리프트</span>';
  else if(dd.drift==='error')b+='<span class="b warn">실행오류</span>';
  else if(dd.drift==='unmeasured'||dd.blind_spot)b+='<span class="b blind">값검사 없음</span>';
  return b;
}

// 정본 유형 라벨 (파일명 기준 자동 추정, 못 맞추면 파일명 그대로)
function typeLabel(f){
  const b=bn(f).toLowerCase();
  if(/textstyle|typo/.test(b)) return '타이포그래피';
  if(/vars|color|token/.test(b)) return '색·토큰';
  if(/component|build-comp/.test(b)) return '컴포넌트';
  if(/guardian|governance|update-management|dashboard/.test(b)) return '거버넌스·현황';
  return bn(f);
}

const cols=document.getElementById('cols');
const c1=document.createElement('div');c1.className='col';c1.innerHTML='<h3>정본 · 소스</h3>';
const c2=document.createElement('div');c2.className='col';c2.innerHTML='<h3>생성기</h3>';
const c3=document.createElement('div');c3.className='col';c3.innerHTML='<h3>목적지</h3>';

// 왼쪽: 정본을 유형별로 묶어서
const groups={};
D.roots.forEach(r=>{const k=typeLabel(r.file);(groups[k]=groups[k]||[]).push(r);});
Object.keys(groups).sort().forEach(label=>{
  const h=document.createElement('div');h.className='group-h';
  h.innerHTML=esc(label)+' <span class="cnt">('+groups[label].length+')</span>';
  c1.appendChild(h);
  groups[label].forEach(r=>c1.appendChild(nodeEl(r.file,'src',r.file, r.role?esc(r.role):'')));
});
if(!D.roots.length) c1.appendChild((()=>{const d=document.createElement('div');d.className='meta';d.textContent='정본 미검출';return d;})());

// 가운데: 생성기
D.generators.forEach(g=>c2.appendChild(nodeEl(g.file,'gen',g.file, g.has_check_flag?'--check 있음':'--check 없음')));
// 오른쪽: 목적지
D.destinations.forEach(dd=>{
  const n=nodeEl(dd.file,'dst',dd.file, dd.generated_by.length?('by '+dd.generated_by.map(bn).join(', ')):'', destBadges(dd));
  c3.appendChild(n);
});
cols.appendChild(c1);cols.appendChild(c2);cols.appendChild(c3);

// 연결선 (SVG) — DOM 위치 기반
function drawWires(){
  const svg=document.getElementById('wires'), map=document.getElementById('map');
  if(!svg||!map) return;
  const R=map.getBoundingClientRect();
  svg.setAttribute('width',map.scrollWidth); svg.setAttribute('height',map.scrollHeight); svg.innerHTML='';
  const pos={};
  map.querySelectorAll('.node').forEach(n=>{const b=n.getBoundingClientRect();
    pos[n.dataset.id]={l:b.left-R.left+map.scrollLeft,r:b.right-R.left+map.scrollLeft,y:b.top-R.top+map.scrollTop+b.height/2};});
  D.edges.forEach(e=>{const a=pos[e.from],b=pos[e.to]; if(!a||!b)return;
    const x1=a.r,y1=a.y,x2=b.l,y2=b.y, mx=(x1+x2)/2;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d','M'+x1+','+y1+' C'+mx+','+y1+' '+mx+','+y2+' '+x2+','+y2);
    p.setAttribute('fill','none');
    p.setAttribute('stroke', e.kind==='stage2'?'#c9820a':'#c3cbd3');
    p.setAttribute('stroke-width','1.4');
    if(e.kind==='stage2')p.setAttribute('stroke-dasharray','4 3');
    svg.appendChild(p);});
}

// 🗺 시스템 맵 (수기·죽은파일·orphan·경계). 파랑(자동)은 요약 배지 한 줄. blind_spots 는 [값검사 공백] 카테고리로 이동.
(function renderSystemMap(){
  const SM=D.system_map||{};
  const host=document.getElementById('sysmap');
  if(!host) return;
  const na=v=>(v===null||v===undefined)?'<span class="sm-na">확인 불가</span>':esc(String(v));

  // 갱신 스탬프
  const g=SM.git||{};
  const stamp=[g.hash?('커밋 '+g.hash):null,g.branch||null,SM.scanned_at?('스캔 '+SM.scanned_at):null].filter(Boolean).map(esc).join('  ·  ');

  // 스캔 필드
  const ps=SM.pipeline_summary||{};
  const manual=(SM.manual||[]);
  const mSite=manual.filter(m=>m.file.indexOf('site-base')>=0)[0]||null;
  const mSem =manual.filter(m=>m.file.indexOf('semantic.colors')>=0)[0]||null;
  const dead=(SM.dead_files||[]).filter(d=>d.loaded===false);   // 죽은 파일만
  const dtc=SM.dead_token_components||{};
  const b=SM.boundary||{};
  const blind=(D.blind_spots||[]);   // 값검사 공백 — 스캔 원천 보존, 하단 칩으로 표현

  // 노드 HTML (data-sm = 연결선 앵커 id)
  const node=(id,cls,title,meta)=>'<div class="sm-node '+cls+'" data-sm="'+id+'"><div class="nm">'+esc(title)+'</div>'+(meta?'<div class="mt">'+meta+'</div>':'')+'</div>';
  // 색 동적: has_generator=true → 자동(파랑), false → 수기(빨강)
  const mcls=m=>(m&&m.has_generator===true)?'blue':'manual';

  // 파랑(자동) 밴드 — 일부러 얇게. 상세 흐름은 위 파이프라인 지도가 그림.
  const blueBand='<div class="sm-band blue"><span class="sm-band-label">자동 (vars-data → 생성물)</span>'
    +node('vars-data','blue','vars-data','F '+na(ps.foundation_color)+' · S '+na(ps.semantic_color))
    +node('gens','blue','생성기 '+na(ps.generators)+'개','')
    +node('dests','blue','생성물 '+na(ps.destinations)+'개', ps.measured?('드리프트 '+na(ps.drift)):'<span class="sm-na">드리프트 미측정</span>')
    +'</div>';

  // 혼합 밴드 (수기·죽은·경계·확인불가) — 이 도식의 주인공
  const ctIdx=dead.map((d,i)=>d.file.indexOf('component-tokens')>=0?i:-1).filter(i=>i>=0)[0];
  let mixed='<div class="sm-band mixed"><span class="sm-band-label">수기 · 죽은 · 경계</span>';
  if(mSite) mixed+=node('site-base',mcls(mSite),'site-base.css', na(mSite.count)+(mSite.unit||'')+(mSite.raw_hex?(' · hex '+mSite.raw_hex):'')+(mSite.has_generator===true?' · 생성기 있음':' · 생성기 없음'));
  if(mSem)  mixed+=node('semantic-json',mcls(mSem),'semantic.colors.json', na(mSem.count)+(mSem.unit||'')+(mSem.non_array_groups&&mSem.non_array_groups.length?(' · 비배열 '+mSem.non_array_groups.length+'그룹'):'')+(mSem.has_generator===true?' · 생성기 있음':' · 생성기 없음'));
  if(dtc.count!==undefined) mixed+=node('registry','ref','registry/components','죽은토큰 선언 '+na(dtc.count)+' / '+na(dtc.of));
  dead.forEach((d,i)=>{ mixed+=node('dead'+i,'dead',bn(d.file),'죽음 · 정의 '+d.defines+'종'); });
  if(b.role_token_refs!==undefined) mixed+=node('demo','boundary','components-new.html','경계 위반 '+b.role_token_refs+'종');
  mixed+=node('figma-web','na','Figma ↔ 웹 컴포넌트','<span class="sm-na">확인 불가 (스캔 밖)</span>');
  mixed+='</div>';

  // 연결선 정의 (노드 id 쌍 + 종류). ✕ 는 has_generator=false 인 E3·E4 만.
  const edges=[
    {from:'vars-data',to:'gens',kind:(ps.generators?'auto':'x')},
    {from:'gens',to:'dests',kind:(ps.destinations?'auto':'x')}
  ];
  if(mSite) edges.push({from:'vars-data',to:'site-base',kind:(mSite.has_generator===true)?'auto':'x'});
  if(mSem)  edges.push({from:'vars-data',to:'semantic-json',kind:(mSem.has_generator===true)?'auto':'x'});
  if(dtc.count>0 && ctIdx!==undefined) edges.push({from:'registry',to:'dead'+ctIdx,kind:'deadref'});
  if(b.role_token_refs>0) edges.push({from:'demo',to:'site-base',kind:'boundary'});

  // 범례
  const legend='<div class="sm-legend">'
    +'<span><i style="background:#2b6cb0"></i>자동(생성기 있음)</span>'
    +'<span><i style="background:#d64545"></i>수기(생성기 없음)</span>'
    +'<span><i style="background:#9aa1a9"></i>죽은 파일</span>'
    +'<span><i style="background:#c9820a"></i>경계 위반</span>'
    +'<span>✕ = 있어야 하는데 없는 연결(자동연동 없음)</span></div>';

  // 하단 칩: 값검사 공백(blind_spots) + orphan(실행시점 스냅샷) + 확인불가
  const blindChip='<span class="sm-chip">값검사 공백 <b>'+blind.length+'</b>'+(blind.length?(': '+blind.map(f=>esc(bn(f))).join(', ')):' <span class="sm-na">없음</span>')+'</span>';
  const o=SM.orphan||{};
  const orphanChip=o.available
    ? '<span class="sm-chip">Gate 17 orphan <b>'+o.total+'</b> (allow '+o.allow+'·예상밖 '+o.unexpected+'·stale '+o.stale+') <span class="sm-na">스냅샷 '+esc(o.snapshot_at||'')+'</span></span>'
    : '<span class="sm-chip">Gate 17 orphan <span class="sm-na">'+na(o.reason)+'</span></span>';
  const unav=(SM.unavailable||[]).map(u=>'<span class="sm-chip">'+esc(u.item)+' <span class="sm-na">확인 불가</span></span>').join('');
  const foot='<div class="sm-foot">'+blindChip+orphanChip+unav+'</div>';

  host.innerHTML='<h2>🗺 토큰 시스템 맵 (스캔 자동 도출 · 관계 도식)</h2>'
    +'<div class="sysmap-head"><div class="muted">파랑(자동 흐름)은 위 파이프라인 지도가 상세히 그림 — 여기선 얇게. 주인공은 ✕(끊긴 연결)·죽은 파일·경계.</div><div class="sysmap-stamp">'+stamp+'</div></div>'
    +legend
    +'<div class="sm-diagram"><svg class="sm-wires"></svg><div class="sm-bands">'+blueBand+mixed+'</div></div>'
    +foot;

  // ── 연결선: 시스템 맵 전용(파이프라인 지도 drawWires 와 완전 분리) ──
  // 조회 범위를 host 하위로 한정 → 지도 노드를 잘못 잡지 않는다.
  const diagram=host.querySelector('.sm-diagram');
  const NS='http://www.w3.org/2000/svg';
  function drawSysmapWires(){
    const svg=host.querySelector('svg.sm-wires'); if(!svg||!diagram) return;
    svg.setAttribute('width',diagram.scrollWidth); svg.setAttribute('height',diagram.scrollHeight);
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const defs=document.createElementNS(NS,'defs');
    [['smb','#2b6cb0'],['smr','#d64545'],['smo','#c9820a']].forEach(pair=>{
      const mk=document.createElementNS(NS,'marker');
      mk.setAttribute('id',pair[0]);mk.setAttribute('markerWidth','8');mk.setAttribute('markerHeight','8');
      mk.setAttribute('refX','6');mk.setAttribute('refY','4');mk.setAttribute('orient','auto');
      const p=document.createElementNS(NS,'path');p.setAttribute('d','M0,0 L8,4 L0,8 Z');p.setAttribute('fill',pair[1]);
      mk.appendChild(p);defs.appendChild(mk);
    });
    svg.appendChild(defs);
    const R=diagram.getBoundingClientRect(), pos={};
    host.querySelectorAll('.sm-node[data-sm]').forEach(n=>{
      const r=n.getBoundingClientRect();
      pos[n.getAttribute('data-sm')]={l:r.left-R.left+diagram.scrollLeft,r:r.right-R.left+diagram.scrollLeft,
        t:r.top-R.top+diagram.scrollTop,b:r.bottom-R.top+diagram.scrollTop,
        cx:(r.left+r.right)/2-R.left+diagram.scrollLeft,cy:(r.top+r.bottom)/2-R.top+diagram.scrollTop};
    });
    const wire=(x1,y1,x2,y2,color,dashed,marker)=>{
      const mx=(x1+x2)/2, p=document.createElementNS(NS,'path');
      p.setAttribute('d','M'+x1+','+y1+' C'+mx+','+y1+' '+mx+','+y2+' '+x2+','+y2);
      p.setAttribute('fill','none');p.setAttribute('stroke',color);p.setAttribute('stroke-width','1.6');
      if(dashed)p.setAttribute('stroke-dasharray','5 4');
      if(marker)p.setAttribute('marker-end','url(#'+marker+')');
      svg.appendChild(p);
    };
    const xmark=(x,y)=>{
      const c=document.createElementNS(NS,'circle');
      c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','9');
      c.setAttribute('fill','#fff');c.setAttribute('stroke','#d64545');c.setAttribute('stroke-width','2');svg.appendChild(c);
      const p=document.createElementNS(NS,'path');
      p.setAttribute('d','M'+(x-4)+','+(y-4)+' L'+(x+4)+','+(y+4)+' M'+(x+4)+','+(y-4)+' L'+(x-4)+','+(y+4));
      p.setAttribute('stroke','#d64545');p.setAttribute('stroke-width','2');p.setAttribute('stroke-linecap','round');svg.appendChild(p);
    };
    edges.forEach(e=>{
      const a=pos[e.from], z=pos[e.to]; if(!a||!z) return;
      let x1,y1,x2,y2;
      if(Math.abs(a.cy-z.cy)>40){ x1=a.cx;y1=a.b;x2=z.cx;y2=z.t; }   // 밴드 간(세로)
      else { x1=a.r;y1=a.cy;x2=z.l;y2=z.cy; }                        // 같은 밴드(가로)
      if(e.kind==='auto') wire(x1,y1,x2,y2,'#2b6cb0',false,'smb');
      else if(e.kind==='x'){ wire(x1,y1,x2,y2,'#d64545',true,null); xmark((x1+x2)/2,(y1+y2)/2); }
      else if(e.kind==='deadref') wire(x1,y1,x2,y2,'#d64545',true,'smr');
      else if(e.kind==='boundary') wire(x1,y1,x2,y2,'#c9820a',true,'smo');
    });
  }
  drawSysmapWires();
  setTimeout(drawSysmapWires,80);
  window.addEventListener('load',drawSysmapWires);
  window.addEventListener('resize',drawSysmapWires);
  if(window.ResizeObserver){ try{ new ResizeObserver(drawSysmapWires).observe(host.querySelector('.sm-bands')); }catch(_){ } }
})();

// 목적지 표
document.getElementById('desttbl').innerHTML =
 '<table><tr><th>파일</th><th>자동/손유지</th><th>값검사</th></tr>'+
 D.destinations.map(d=>'<tr><td class="f">'+esc(d.file)+'</td>'+
   '<td>'+(d.has_markers?'자동 (마커 '+d.marker_count+')':'손유지')+'</td>'+
   '<td>'+(d.covered_by.length?esc(d.covered_by.join(', ')):(d.has_generator_check?'생성기 --check':'<b style="color:var(--fail)">없음</b>'))+'</td></tr>').join('')
 +'</table>';

// 게이트 표
const gt=document.getElementById('gatetbl');
if(D.gates.length){
  gt.innerHTML='<table><tr><th>명령</th><th>커버</th><th>상태</th></tr>'+
  D.gates.map(g=>{
    const s = g.status==='pass'?'<span class="b pass">pass</span>'
      :g.status==='fail'?(g.fail_kind==='drift'?'<span class="b fail">드리프트</span>':'<span class="b warn">검사 실패</span>')
      :g.status==='error'?'<span class="b warn">측정 유보</span>':'<span class="b">미실행</span>';
    return '<tr><td class="f">'+esc(g.command)+(g.writes_report?' <span class="b warn" style="font-size:9.5px">리포트씀</span>':'')+(g.output_tail?'<div class="tail">'+esc(g.output_tail)+'</div>':'')+'</td>'+
      '<td>'+(g.covers.length?esc(g.covers.join(', ')):'<span class="muted">미검출</span>')+'</td>'+
      '<td>'+s+'</td></tr>';
  }).join('')+'</table>';
}else gt.innerHTML='<div class="empty">check성 명령을 못 찾음. package.json 스크립트나 생성기 --check 확인 필요.</div>';
// 실행 제외된 명령(사전)
if(D.meta.skipped_gates && D.meta.skipped_gates.length){
  gt.innerHTML += '<div style="margin-top:10px;font-size:11.5px;color:var(--sub)"><b>실행 제외 '+D.meta.skipped_gates.length+'건</b> (자동 실행 제외): '
    + D.meta.skipped_gates.map(s=>esc(s.name)+' → '+esc(s.reason)).join(' · ')+'</div>';
}

// 생성기 표
document.getElementById('gentbl').innerHTML=
 '<table><tr><th>생성기</th><th>read</th><th>write / 목적지</th><th>--check</th></tr>'+
 D.generators.map(g=>'<tr><td class="f">'+esc(g.file)+'</td>'+
   '<td>'+esc((g.read_paths.concat(g.all_path_literals.filter(l=>/-data\\.|\\.json$/.test(l)))).slice(0,4).join(', ')||'—')+'</td>'+
   '<td>'+esc((g.write_destinations.length?g.write_destinations:g.write_paths).join(', ')||'<span style="color:var(--fail)">미검출</span>')+'</td>'+
   '<td>'+(g.has_check_flag?'있음':'—')+'</td></tr>').join('')
 +'</table>';

window.addEventListener('load',drawWires);
window.addEventListener('resize',drawWires);
setTimeout(drawWires,60);
</script></body></html>`;
}
