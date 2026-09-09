#!/usr/bin/env node
/**
 * canon-addition-check.js  (Gate 34 — 정본 신설 승인)
 * ─────────────────────────────────────────────────────────────────────────
 * **정본에 새 항목이 생기는 것을 "사건"으로 취급하는 유일한 게이트.**
 *
 * ★ 막는 대상은 ⭐(에이전트)이지 사용자가 아니다.
 *   - ⭐ 가 스스로 판단해 텍스트 스타일·토큰을 정본에 넣으면 → **차단**
 *   - 사용자가 필요하다고 판단해 넣으면 → **승인 기록과 함께 통과**
 *
 * 왜 필요했나 (2026-08-03):
 *   사용자가 "정본에 13·9px 스타일 추가" 안을 명시적으로 거부했는데, ⭐ 가 곧이어
 *   "스케일 안이면 신설"이라는 **자기 규칙을 만들어** body/20M 을 신설했다.
 *   그런데 32개 게이트 전부가 "정본 → 파생 일치"만 봐서 **정본에 줄이 늘어나는 것을
 *   보는 게이트가 0개**였고, tokens:reconcile 만 돌리면 전 게이트가 ✅ 로 통과했다.
 *   → CLAUDE.md §⚖️ 하드룰 H6②(구 H7) 의 집행 장치.
 *
 * 설계 — 저장소에 이미 있는 두 패턴의 합성(새 발명 없음):
 *   · Gate 29 래칫(dark-divergence-check.js) — baseline 에 없는 새 항목 = 차단
 *   · Gate 13 승인 기록(installer-build-verify-check.js) — 승인을 파일에 남기고 집행
 *
 * 보는 것 / 안 보는 것:
 *   · 본다   : 정본 항목 **이름의 신설** — 텍스트 스타일명 · 토큰 키 · **컴포넌트 세트 이름**
 *              · **컴포넌트 속성 이름**(addComponentProperty) · **웹 UI 라이브러리 상태 이름**
 *                (2026-09-02 확장 — focus-visible 사태: 승인 없이 만든 "Focus Visible" 속성과
 *                 ui-library 15개 컴포넌트의 focus 상태를 이 게이트가 전부 통과시켰다.)
 *              (컴포넌트는 2026-08-03 추적 확장. H7 이 "컴포넌트·variant"를 명시하는데
 *               이 게이트가 토큰·스타일만 봐서 생긴 선언↔집행 괴리를 메움. Gate 30 은
 *               커버리지지 승인이 아니라 신설+성실등록이면 전 게이트를 통과했다.)
 *   · 안 본다: variant 축(세트 내부 리팩터마다 마찰 → --no-verify 유인) ·
 *              값 변경(Gate 7·7b) · 삭제(Gate 10·17) · 파생 표면(나머지 전 게이트)
 *
 * 사용:
 *   node scripts/canon-addition-check.js                    # 검사 (gate:check 가 호출)
 *   node scripts/canon-addition-check.js --approve --by river --reason "표 헤더용 title/14M" \\
 *        --quote "<river 가 실제로 한 말 그대로>"   # 세션 기록의 사람 발화와 대조해 검증한다
 *   node scripts/canon-addition-check.js --update-baseline   # 삭제분만 반영(축소 전용)
 *   node scripts/canon-addition-check.js --extend-tracking component --reason "..."
 *                                                           # 새 종류 감시 시작(1회만·정본 불변)
 *
 * 출력 끝줄: `CANONADD_SUMMARY tracked=<n> added=<n> removed=<n> approved=<n>`
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'plugins/figma-vars-installer/src');
const TSD = path.join(SRC, 'textstyles-data.ts');
const VD = path.join(SRC, 'vars-data.ts');
const BC = path.join(SRC, 'build-components.ts');
const BASELINE = path.join(ROOT, 'registry/governance/canon-additions-baseline.json');

/** esbuild 번들 → require (정규식 스크래핑 금지 — Phase 1 에서 폐지된 방식) */
function bundleRequire(file, tag) {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [file], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `canonadd-${tag}-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try { delete require.cache[tmp]; return require(tmp); } finally { try { fs.unlinkSync(tmp); } catch (_) { /* */ } }
}

/** figma API 스텁 — 빌더가 노드 API 를 자유롭게 만져도 로드가 죽지 않게(읽기 목적). */
function makeFigmaStub() {
  const f = function () { return makeFigmaStub(); };
  return new Proxy(f, {
    get(_t, p) {
      if (p === 'then' || p === Symbol.iterator) return undefined;
      if (p === 'children') return [];
      if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0;
      return makeFigmaStub();
    },
    set() { return true; },
    apply() { return makeFigmaStub(); },
  });
}

/** 현재 정본의 항목 이름 전집합 — `종류:이름` 형태 */
function currentItems() {
  const items = [];
  const ts = bundleRequire(TSD, 'ts');
  for (const s of (ts.TEXT_STYLES || [])) items.push(`textstyle:${s.name}`);
  const vd = bundleRequire(VD, 'vd');
  for (const [group, key] of [['FOUNDATION_COLOR', 'color'], ['SEMANTIC_COLOR', 'color'],
    ['FOUNDATION_NUMBER', 'number'], ['SEMANTIC_NUMBER', 'number'], ['SEMANTIC_SHADOW', 'shadow']]) {
    const g = vd[group];
    if (!g || typeof g !== 'object') continue;
    for (const name of Object.keys(g)) items.push(`${key}:${name}`);
  }
  // 컴포넌트 세트 이름 (2026-08-03 추적 확장)
  //   H7 은 금지 대상에 "컴포넌트·variant"를 명시하는데 이 게이트는 토큰·스타일만 봤다 —
  //   선언과 집행의 괴리. Gate 30 은 "설치기에 있는 게 등록됐나"(커버리지)지
  //   "새로 생겨도 되나"(승인)가 아니어서, ⭐ 가 컴포넌트를 신설하고 4개 표면에 성실히
  //   등록까지 하면 전 게이트가 통과했다.
  //   **variant 축까지는 넣지 않는다** — 세트 내부 리팩터마다 승인 마찰이 생겨
  //   `--no-verify` 를 부르고, 그러면 게이트 39개가 통째로 무력화된다(Gate 20/29 의 마찰 원칙).
  //   build-components 는 로드 시점에 figma API 를 만질 수 있어 스텁을 먼저 깔아둔다
  //   (Gate 30 의 loadBuildComponents 와 같은 이유·같은 방식).
  if (!global.figma) global.figma = makeFigmaStub();
  const bc = bundleRequire(BC, 'bc');
  const compNames = [];
  for (const cat of (bc.COMPONENT_CATEGORIES || [])) {
    for (const m of (cat.members || [])) compNames.push(m);
  }
  if (compNames.length === 0) {
    throw new Error('build-components.ts 에서 컴포넌트 이름을 0건 추출 — 정본 export 구조 변경 의심(추출 0건=안 됨).');
  }
  for (const m of compNames) items.push(`component:${m}`);

  // 컴포넌트 **속성**(component property) 이름 (2026-09-02 추적 확장)
  //   왜: focus-visible 사태 — ⭐ 가 승인 없이 Button 세트에 "Focus Visible" BOOLEAN
  //   property 를 만들었는데, 이 게이트는 토큰·스타일·세트 이름만 봐서 통과시켰다.
  //   property 는 세트 이름과 달리 "상태를 하나 늘리는" 행위라 승인 대상이다.
  //   variant 축은 여전히 제외한다(세트 내부 리팩터마다 마찰 → --no-verify 유인).
  //   property 는 addComponentProperty 호출로만 생기고 런타임 API 라 export 로 못 읽는다 —
  //   여기서만 소스 텍스트를 읽는다(값이 아니라 **이름**만 세므로 스크래핑 금지 취지에 반하지 않는다).
  const bcSrc = fs.readFileSync(BC, 'utf8');
  const propRe = /addComponentProperty\(\s*["'`]([^"'`]+)["'`]/g;
  for (let m; (m = propRe.exec(bcSrc)) !== null;) items.push(`componentprop:${m[1]}`);
  //   슬롯 속성(2026-09-03 추적 확장) — Figma 슬롯은 createSlot() 이 속성을 만들고
  //   editComponentProperty 로 개명하므로 위 정규식에 안 걸린다. 실제 속성 이름은
  //   makeSlot(comp, "<이름>", …) 의 두 번째 인자다. 이것도 "상태/자리를 하나 늘리는" 신설이라 승인 대상.
  const slotRe = /makeSlot\(\s*[A-Za-z0-9_.]+\s*,\s*["'`]([^"'`]+)["'`]/g;
  for (let m; (m = slotRe.exec(bcSrc)) !== null;) items.push(`componentprop:${m[1]}`);

  // 웹 UI 라이브러리의 **상태 이름** (2026-09-02 추적 확장)
  //   왜: focus-visible 17건 중 15건은 Figma 정본이 아니라 ui-library CSS 에만 있었다.
  //   Gate 34 가 정본만 봐서 "웹에서만 상태를 하나 더 만드는 것"을 보는 게이트가 0개였다.
  for (const mf of listUiManifests()) {
    let d; try { d = JSON.parse(fs.readFileSync(mf, 'utf8')); } catch (_) { continue; }
    const id = path.basename(path.dirname(mf));
    for (const st of Object.keys((d && d.states) || {})) items.push(`uistate:${id}.${st}`);
  }
  return [...new Set(items)].sort();
}

/** ui-library 컴포넌트 manifest 목록 (없으면 빈 배열 — 저장소 구조 변화에 죽지 않게) */
function listUiManifests() {
  const dir = path.join(ROOT, 'ui-library/src/components');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((d) => path.join(dir, d, 'manifest.json'))
    .filter((p) => fs.existsSync(p))
    .sort();
}

/** 항목의 종류(prefix) — 추적 확장 시 종류 단위로만 편입하기 위해. */
function kindOf(item) { return String(item).split(':')[0]; }

function loadBaseline() {
  if (!fs.existsSync(BASELINE)) return null;
  try { return JSON.parse(fs.readFileSync(BASELINE, 'utf8')); } catch (e) { return null; }
}

function check({ pass, warn, fail }) {
  const cur = currentItems();
  if (cur.length === 0) {
    fail('Gate 34: 정본에서 항목을 0건 추출 — 검사 불능("추출 0건=안 됨"). 번들 실패 의심.');
    console.log('CANONADD_SUMMARY tracked=0 added=0 removed=0 approved=0');
    return;
  }
  const base = loadBaseline();
  if (!base) {
    warn(`Gate 34: baseline 없음 — 최초 1회 \`node scripts/canon-addition-check.js --update-baseline\` 로 현재 ${cur.length}건을 동결하세요.`);
    console.log(`CANONADD_SUMMARY tracked=${cur.length} added=0 removed=0 approved=0`);
    return;
  }
  const known = new Set(base.items || []);
  const approved = new Map((base.approvals || []).map((a) => [a.item, a]));
  const added = cur.filter((k) => !known.has(k));
  const removed = (base.items || []).filter((k) => !cur.includes(k));

  const unapproved = added.filter((k) => !approved.has(k));
  const withApproval = added.filter((k) => approved.has(k));

  for (const k of unapproved) {
    fail(`Gate 34: 정본에 승인 없는 신설 — ${k}\n` +
      '       ⭐ 는 정본에 새 항목을 임의로 만들 수 없습니다(하드룰 H6②). 사용자 승인이 있으면:\n' +
      `       node scripts/canon-addition-check.js --approve --by river --reason "..." --item ${k}`);
  }
  for (const k of withApproval) {
    const a = approved.get(k);
    // 근거(사용자 실제 발화 인용)가 붙어 있는 승인만 "검증됨"이다. 2026-09-03 이전 승인은
    // 그 장치가 없던 시절 것이라 차단하지 않되 **매번 보이게** 한다 — 조용히 신뢰받지 않도록.
    if (a.evidence && a.quote) {
      pass(`정본 신설 승인됨(근거 검증) — ${k} (by ${a.by} · 세션기록 ${a.evidence.transcript})`);
    } else {
      warn(`Gate 34: 승인 근거 미검증 — ${k} (by ${a.by}, 2026-09-03 근거검증 도입 이전 기록)\n` +
        '       이 줄은 `--by` 자기신고만으로 남았습니다. 사용자 실제 발화 인용이 없어 "승인이 있었다"를 증명하지 못합니다.\n' +
        `       재확인하려면: node scripts/canon-addition-check.js --reapprove --item ${k} --by <사용자> --quote "<실제 발화>"`);
    }
  }
  // 신설이 0건이어도 **승인 원장 자체를 매번 감사한다** — 근거 없는 승인 줄은 조용히
  // 신뢰받으면 안 된다(2026-08-25 사태의 그 줄들이 정확히 그렇게 재인용됐다).
  const noEvidence = (base.approvals || []).filter((x) => !(x.quote && x.evidence));
  if (noEvidence.length) {
    warn(`Gate 34: 승인 원장에 근거 미검증 ${noEvidence.length}건 — \`--by\` 자기신고만 남은 줄입니다(2026-09-03 근거검증 도입 이전).\n` +
      noEvidence.map((x) => `       · ${x.item} (by ${x.by})`).join('\n') + '\n' +
      '       "기록이 있다 = 승인이 있었다" 가 아닙니다. 재확인: --reapprove --item <항목> --by <사용자> --quote "<실제 발화>"');
  }
  if (removed.length) warn(`Gate 34: 정본에서 사라진 항목 ${removed.length}건 — 의도한 삭제면 --update-baseline 으로 축소하세요: ${removed.slice(0, 5).join(', ')}${removed.length > 5 ? ' …' : ''}`);
  if (added.length === 0 && removed.length === 0) {
    const byKind = cur.reduce((m, k) => { const t = kindOf(k); m[t] = (m[t] || 0) + 1; return m; }, {});
    const detail = Object.entries(byKind).map(([k, n]) => `${k} ${n}`).join(' · ');
    pass(`정본 신설 0건 — 추적 ${cur.length}항목 전부 동결 목록과 일치 (${detail})`);
  }

  console.log(`CANONADD_SUMMARY tracked=${cur.length} added=${added.length} removed=${removed.length} approved=${withApproval.length}`);
}

/**
 * 승인 근거 검증 — "river 가 실제로 그렇게 말했는가"를 기계로 확인한다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜 (2026-09-03, river 지시 HD-3):
 *   2026-08-25 focus-visible 사태에서 ⭐ 가 `--by river` 라고 타이핑해 **자기가 자기를
 *   승인**했고, 그 줄이 이후 모든 근거로 재인용됐다(보고서·registry·rules 문서).
 *   `--by` 는 자기신고라 검증되지 않는다 — **기록이 있다고 승인이 있었던 것이 아니다.**
 *
 * 무엇을 근거로 삼나:
 *   Claude Code 세션 기록(~/.claude/projects/<repo>/ *.jsonl)에서 `origin.kind === "human"`
 *   인 항목만이 **사람이 실제로 입력한 말**이다. 이 표식은 하네스가 붙이며 ⭐ 의 출력·
 *   도구 결과·시스템 알림에는 붙지 않는다(같은 파일에서 origin=null / task-notification 로 구분).
 *   따라서 승인하려면 river 의 **실제 발화 일부를 그대로 인용**해야 하고, 그 인용문이
 *   사람 발화에 실재해야 통과한다.
 *
 * 한계(정직하게):
 *   완벽한 위조 방지가 아니다 — 기록 파일 자체를 고치면 뚫린다. 목적은 그것이 아니라
 *   **"근거 없이 승인 줄을 만드는 일"을 한 단계의 명시적 위조로 바꾸는 것**이다.
 *   기록을 찾을 수 없으면 통과시키지 않고 막는다(모르면 승인 아님).
 */
function findHumanQuote(quote) {
  const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
  const needle = norm(quote);
  if (needle.length < 8) return { ok: false, why: '인용문이 너무 짧습니다(8자 이상) — 누구 말인지 특정되지 않습니다.' };

  // 세션 기록 폴더 — 본 폴더 것 + 별도 작업 폴더(.claude/worktrees/*) 세션 것 전부.
  // 하네스 규칙: 경로의 / . _ 를 '-' 로 (본 폴더 → -Users-…-S1-UX-DESIGN-with-AI,
  // 별도 폴더 → 같은 이름 + --claude-worktrees-<이름>). 실측 2026-09-09. scripts/lib/worktree.js 참조.
  const dirs = require('./lib/worktree').transcriptDirs(ROOT);
  if (dirs.length === 0) {
    const guess = path.join(os.homedir(), '.claude', 'projects', ROOT.replace(/[/\\._]/g, '-'));
    return { ok: false, why: `세션 기록 폴더를 찾을 수 없습니다: ${guess}\n       근거를 확인할 수 없으므로 승인하지 않습니다(모르면 승인 아님).` };
  }
  const files = [];
  for (const dir of dirs) {
    for (const n of fs.readdirSync(dir)) if (n.endsWith('.jsonl')) files.push({ dir, name: n });
  }
  for (const { dir, name } of files) {
    let lines;
    try { lines = fs.readFileSync(path.join(dir, name), 'utf8').split('\n'); } catch (_) { continue; }
    for (const line of lines) {
      if (!line || line.indexOf('"human"') === -1) continue;   // 빠른 사전 거르기
      let rec; try { rec = JSON.parse(line); } catch (_) { continue; }
      if (rec.type !== 'user') continue;
      if (!rec.origin || rec.origin.kind !== 'human') continue; // ★ 사람이 직접 입력한 것만
      const c = rec.message && rec.message.content;
      let text = '';
      if (typeof c === 'string') text = c;
      else if (Array.isArray(c)) text = c.filter((p) => p && p.type === 'text').map((p) => p.text).join(' ');
      if (!text) continue;
      if (norm(text).includes(needle)) {
        // transcript 파일 이름이 곧 sessionId 라 따로 담지 않는다(중복·환경 종속 키).
        return { ok: true, evidence: { transcript: name, at: rec.timestamp || null } };
      }
    }
  }
  return { ok: false, why: '이 저장소의 세션 기록에서 그 말을 한 사람 발화를 찾지 못했습니다.\n' +
    '       ⭐ 가 요약·의역한 문장이 아니라 **river 가 실제로 친 말 그대로**를 인용해야 합니다.' };
}

function approve(argv) {
  const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const by = arg('by', '');
  const reason = arg('reason', '');
  const item = arg('item', '');
  if (!by) { console.error('❌ --by 가 필요합니다(누가 승인했는지). 예: --by river'); process.exit(1); }
  if (by === 'orchestrator' || by === '⭐') {
    console.error('❌ ⭐(총괄 에이전트)는 정본 신설을 스스로 승인할 수 없습니다 — 하드룰 H6②(구 H7). 사용자 승인이 필요합니다.');
    process.exit(1);
  }
  if (!reason) { console.error('❌ --reason 이 필요합니다(왜 추가하는지). 나중에 이 줄이 유일한 근거가 됩니다.'); process.exit(1); }

  // ★ 근거 검증 — `--by` 자기신고를 믿지 않는다(2026-09-03 river 지시 HD-3).
  const quote = arg('quote', '');
  if (!quote) {
    console.error('❌ --quote 가 필요합니다 — 승인의 근거가 될 **사용자의 실제 발화**를 그대로 인용하세요.');
    console.error('   예: --quote "focus-visible 승인한 적 없어. 15개 전부 제거하고"');
    console.error('   ⭐ 가 `--by river` 라고 적는 것만으로는 승인이 되지 않습니다(2026-08-25 사태).');
    process.exit(1);
  }
  const ev = findHumanQuote(quote);
  if (!ev.ok) {
    console.error(`❌ 승인 근거를 확인하지 못했습니다 — ${ev.why}`);
    process.exit(1);
  }

  const cur = currentItems();
  const base = loadBaseline() || { items: [], approvals: [] };
  const known = new Set(base.items || []);
  const added = cur.filter((k) => !known.has(k));
  const targets = item ? [item] : added;
  if (targets.length === 0) { console.error('❌ 승인할 신설 항목이 없습니다(정본과 baseline 이 이미 일치).'); process.exit(1); }
  const unknown = targets.filter((t) => !cur.includes(t));
  if (unknown.length) { console.error(`❌ 정본에 없는 항목은 승인할 수 없습니다: ${unknown.join(', ')}`); process.exit(1); }

  base.approvals = base.approvals || [];
  for (const t of targets) {
    base.approvals = base.approvals.filter((a) => a.item !== t);
    base.approvals.push({
      item: t, by, reason, approvedAt: new Date().toISOString(),
      // 근거 — 사용자가 실제로 한 말과 그 말이 남아 있는 세션 기록.
      quote, evidence: ev.evidence,
      // 누가 이 줄을 타이핑했나. `by`(누가 결정했나)와 다르며 기계가 정한다 — 손으로 못 바꾼다.
      recordedBy: 'orchestrator',
    });
  }
  // ★ 승인한 항목만 편입한다(2026-09-03 수정). 예전에는 `base.items = cur` 로 **현재 신설 전부**를
  //   동결해서, `--item A` 하나를 승인하면 승인받지 않은 B·C 까지 조용히 목록에 들어갔다.
  //   (다른 세션이 만든 미승인 신설까지 river 승인처럼 편입되던 구멍 — 실제로 재현됨.)
  base.items = [...new Set([...(base.items || []), ...targets])].sort();
  base._updated = new Date().toISOString().slice(0, 10);
  base.count = base.items.length;
  fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
  fs.writeFileSync(BASELINE, JSON.stringify(base, null, 2) + '\n');
  console.log(`✅ 정본 신설 승인 기록 — ${targets.length}건 (by ${by})`);
  for (const t of targets) console.log(`   ${t}`);
}

/**
 * 추적 종류 확장 — 이 게이트가 **새로 감시하기 시작한 종류**의 현존 항목을 1회 동결한다.
 *
 * 왜 별도 경로인가: H7 이 막는 것은 "정본에 항목을 늘리는 것"이고, 추적 확장은 정본을
 * 건드리지 않고 **감시 범위를 넓히는** 반대 방향의 행위다. 그래서 사용자 승인 없이 가능하다.
 * 대신 **지정한 종류만** 편입하고 다른 종류의 미승인 신설이 섞여 있으면 거부한다 —
 * "확장인 척하며 미승인 신설을 끼워넣기"를 구조적으로 막는다.
 *
 * 사용: node scripts/canon-addition-check.js --extend-tracking component --reason "..."
 */
/**
 * 이미 baseline 에 편입된 승인에 **근거를 뒤늦게 붙인다**(2026-09-03).
 * approve() 는 "새로 생긴 항목"만 다루므로 과거 승인은 그 경로로 못 고친다.
 * 근거 검증은 approve() 와 똑같이 사람 발화 대조를 통과해야 한다 — 뒷문이 아니다.
 */
function reapprove(argv) {
  const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const item = arg('item', '');
  const by = arg('by', '');
  const quote = arg('quote', '');
  const reason = arg('reason', '');
  if (!item || !by || !quote) { console.error('❌ --item · --by · --quote 가 모두 필요합니다.'); process.exit(1); }
  if (by === 'orchestrator' || by === '⭐') { console.error('❌ ⭐ 는 정본 신설을 스스로 승인할 수 없습니다 — 하드룰 H6②.'); process.exit(1); }
  const ev = findHumanQuote(quote);
  if (!ev.ok) { console.error(`❌ 승인 근거를 확인하지 못했습니다 — ${ev.why}`); process.exit(1); }
  const base = loadBaseline();
  if (!base) { console.error('❌ baseline 이 없습니다.'); process.exit(1); }
  const a = (base.approvals || []).find((x) => x.item === item);
  if (!a) { console.error(`❌ 승인 기록에 없는 항목입니다: ${item}`); process.exit(1); }
  a.by = by; a.quote = quote; a.evidence = ev.evidence; a.recordedBy = 'orchestrator';
  if (reason) a.reason = reason;
  a.reapprovedAt = new Date().toISOString();
  base._updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(BASELINE, JSON.stringify(base, null, 2) + '\n');
  console.log(`✅ 승인 근거 부착 — ${item} (by ${by} · 세션기록 ${ev.evidence.transcript})`);
}

function extendTracking(argv) {
  const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  // 여러 종류를 동시에 감시 시작할 수 있다(쉼표 구분) — 한 사건이 두 종류를 동시에
  // 드러내는 경우(2026-09-02 focus-visible: componentprop + uistate)가 있고,
  // 하나씩 돌리면 나머지가 "종류 밖 미승인 신설"로 서로를 막는다. 기록은 종류별로 남는다.
  const kinds = arg('extend-tracking', '').split(',').map((k) => k.trim()).filter(Boolean);
  const reason = arg('reason', '');
  if (kinds.length === 0) { console.error('❌ 확장할 종류가 필요합니다. 예: --extend-tracking component'); process.exit(1); }
  if (!reason) { console.error('❌ --reason 이 필요합니다(왜 이 종류를 감시하기 시작하는지).'); process.exit(1); }

  const cur = currentItems();
  const base = loadBaseline();
  if (!base) { console.error('❌ baseline 이 없습니다 — 먼저 --update-baseline 으로 최초 동결하세요.'); process.exit(1); }
  const known = new Set(base.items || []);
  const approved = new Set((base.approvals || []).map((a) => a.item));
  const added = cur.filter((k) => !known.has(k));

  // **1회성** — 이미 확장된 종류는 다시 확장할 수 없다.
  //   (적대 테스트에서 발견한 우회로: 컴포넌트를 신설한 뒤 --extend-tracking 을 다시 돌리면
  //    승인 없이 편입됐다. 확장은 "감시 시작" 1회의 행위이고, 그 뒤의 신설은 승인 대상이다.)
  const already = (base.extendedTracking || []).map((e) => e.kind);
  const dup = kinds.filter((k) => already.includes(k));
  if (dup.length) {
    console.error(`❌ 종류 "${dup.join(', ')}" 는 이미 추적 중입니다 — 확장은 종류마다 1회만 가능합니다.`);
    console.error('   이후의 신설은 사용자 승인이 필요합니다: --approve --by <사용자> --reason "..." --item <항목>');
    process.exit(1);
  }

  const kindSet = new Set(kinds);
  const inKind = added.filter((k) => kindSet.has(kindOf(k)));
  const outOfKind = added.filter((k) => !kindSet.has(kindOf(k)) && !approved.has(k));
  if (inKind.length === 0) {
    console.error(`❌ 종류 "${kinds.join(', ')}" 에 새로 편입할 항목이 없습니다(이미 추적 중이거나 종류 이름이 틀렸습니다).`);
    process.exit(1);
  }
  if (outOfKind.length) {
    console.error(`❌ 지정한 종류(${kinds.join(', ')}) 밖의 미승인 신설이 ${outOfKind.length}건 섞여 있어 거부합니다 — 확장으로 끼워넣을 수 없습니다:`);
    outOfKind.forEach((k) => console.error(`   ❌ ${k}`));
    console.error('   그 항목들은 사용자 승인(--approve)을 받아야 합니다.');
    process.exit(1);
  }

  base.items = cur;
  base.count = cur.length;
  base._updated = new Date().toISOString().slice(0, 10);
  base.extendedTracking = base.extendedTracking || [];
  for (const kind of kinds) {
    base.extendedTracking.push({
      kind, reason, frozen: inKind.filter((k) => kindOf(k) === kind).length, at: new Date().toISOString(),
      _note: '추적 종류 확장(정본 신설이 아님) — 이 종류의 현존 항목을 현상 동결하고, 이후 신설만 차단한다.',
    });
  }
  fs.writeFileSync(BASELINE, JSON.stringify(base, null, 2) + '\n');
  console.log(`✅ 추적 종류 확장 — "${kinds.join(', ')}" ${inKind.length}건 현상 동결 (총 ${cur.length}항목)`);
  inKind.slice(0, 8).forEach((k) => console.log(`   ${k}`));
  if (inKind.length > 8) console.log(`   … 외 ${inKind.length - 8}건`);
}

function updateBaseline() {
  const cur = currentItems();
  const base = loadBaseline();
  if (base) {
    const known = new Set(base.items || []);
    const approved = new Set((base.approvals || []).map((a) => a.item));
    const unapproved = cur.filter((k) => !known.has(k) && !approved.has(k));
    if (unapproved.length) {
      console.error(`❌ 승인 없는 신설 ${unapproved.length}건 — baseline 에 넣지 않고 기록을 거부합니다(축소 전용).`);
      console.error('   먼저 사용자 승인을 받아 --approve 로 기록하세요. 몰래 목록에 넣는 것이 이 게이트가 막으려는 행위입니다.');
      unapproved.forEach((k) => console.error(`   ❌ ${k}`));
      process.exit(1);
    }
  }
  const next = {
    _note: '정본(textstyles-data.ts · vars-data.ts)의 항목 이름 전집합. Gate 34 가 여기 없는 신설을 차단한다. ⭐ 는 스스로 이 목록에 추가할 수 없고, 사용자 승인(--approve)만이 편입한다.',
    _why: 'CLAUDE.md §⚖️ 하드룰 H7. 2026-08-03: ⭐ 가 사용자가 거부한 스타일 신설을 자기 규칙을 만들어 강행했는데, 32개 게이트 전부가 "정본→파생 일치"만 봐서 아무도 못 잡았다.',
    _updated: new Date().toISOString().slice(0, 10),
    count: cur.length,
    items: cur,
    approvals: (base && base.approvals) || [],
    // 확장 이력은 반드시 보존한다 — 지워지면 "1회만" 이 무력화돼 재확장으로 승인을 우회할 수 있다.
    extendedTracking: (base && base.extendedTracking) || [],
  };
  fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  console.log(`✅ Gate 34 baseline 갱신 — ${cur.length}항목 동결`);
}

module.exports = { check };

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes('--approve')) { approve(argv); process.exit(0); }
  if (argv.includes('--reapprove')) { reapprove(argv); process.exit(0); }
  if (argv.includes('--extend-tracking')) { extendTracking(argv); process.exit(0); }
  if (argv.includes('--update-baseline')) { updateBaseline(); process.exit(0); }
  let bad = 0;
  const pass = (m) => console.log(`  ✅ ${m}`);
  const warn = (m) => console.log(`  ⚠️  ${m}`);
  const fail = (m) => { bad++; console.log(`  ❌ ${m}`); };
  console.log('🔎 [Gate 34] 정본신설승인 검사기 (Canon Addition Approval)');
  try { check({ pass, warn, fail }); } catch (e) { console.error(`  ❌ 실행 실패: ${e.message}`); process.exit(1); }
  process.exit(bad > 0 ? 1 : 0);
}
