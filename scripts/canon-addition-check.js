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
 *   → CLAUDE.md §⚖️ 하드룰 H7 의 집행 장치.
 *
 * 설계 — 저장소에 이미 있는 두 패턴의 합성(새 발명 없음):
 *   · Gate 29 래칫(dark-divergence-check.js) — baseline 에 없는 새 항목 = 차단
 *   · Gate 13 승인 기록(installer-build-verify-check.js) — 승인을 파일에 남기고 집행
 *
 * 보는 것 / 안 보는 것:
 *   · 본다   : 정본 항목 **이름의 신설**(텍스트 스타일명·토큰 키)
 *   · 안 본다: 값 변경(Gate 7·7b 소관) · 삭제(Gate 10·17 소관) · 파생 표면(나머지 전 게이트)
 *
 * 사용:
 *   node scripts/canon-addition-check.js                    # 검사 (gate:check 가 호출)
 *   node scripts/canon-addition-check.js --approve --by river --reason "표 헤더용 title/14M"
 *   node scripts/canon-addition-check.js --update-baseline   # 삭제분만 반영(축소 전용)
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
const BASELINE = path.join(ROOT, 'registry/governance/canon-additions-baseline.json');

/** esbuild 번들 → require (정규식 스크래핑 금지 — Phase 1 에서 폐지된 방식) */
function bundleRequire(file, tag) {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [file], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `canonadd-${tag}-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try { delete require.cache[tmp]; return require(tmp); } finally { try { fs.unlinkSync(tmp); } catch (_) { /* */ } }
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
  return [...new Set(items)].sort();
}

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
      '       ⭐ 는 정본에 새 항목을 임의로 만들 수 없습니다(하드룰 H7). 사용자 승인이 있으면:\n' +
      `       node scripts/canon-addition-check.js --approve --by river --reason "..." --item ${k}`);
  }
  for (const k of withApproval) {
    const a = approved.get(k);
    pass(`정본 신설 승인됨 — ${k} (by ${a.by}${a.reason ? ' · ' + a.reason : ''})`);
  }
  if (removed.length) warn(`Gate 34: 정본에서 사라진 항목 ${removed.length}건 — 의도한 삭제면 --update-baseline 으로 축소하세요: ${removed.slice(0, 5).join(', ')}${removed.length > 5 ? ' …' : ''}`);
  if (added.length === 0 && removed.length === 0) pass(`정본 신설 0건 — 추적 ${cur.length}항목(텍스트 스타일·토큰) 전부 동결 목록과 일치`);

  console.log(`CANONADD_SUMMARY tracked=${cur.length} added=${added.length} removed=${removed.length} approved=${withApproval.length}`);
}

function approve(argv) {
  const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const by = arg('by', '');
  const reason = arg('reason', '');
  const item = arg('item', '');
  if (!by) { console.error('❌ --by 가 필요합니다(누가 승인했는지). 예: --by river'); process.exit(1); }
  if (by === 'orchestrator' || by === '⭐') {
    console.error('❌ ⭐(총괄 에이전트)는 정본 신설을 스스로 승인할 수 없습니다 — 하드룰 H7. 사용자 승인이 필요합니다.');
    process.exit(1);
  }
  if (!reason) { console.error('❌ --reason 이 필요합니다(왜 추가하는지). 나중에 이 줄이 유일한 근거가 됩니다.'); process.exit(1); }

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
    base.approvals.push({ item: t, by, reason, approvedAt: new Date().toISOString() });
  }
  base.items = cur;   // 승인과 동시에 동결 목록에 편입
  base._updated = new Date().toISOString().slice(0, 10);
  base.count = cur.length;
  fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
  fs.writeFileSync(BASELINE, JSON.stringify(base, null, 2) + '\n');
  console.log(`✅ 정본 신설 승인 기록 — ${targets.length}건 (by ${by})`);
  for (const t of targets) console.log(`   ${t}`);
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
  };
  fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  console.log(`✅ Gate 34 baseline 갱신 — ${cur.length}항목 동결`);
}

module.exports = { check };

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes('--approve')) { approve(argv); process.exit(0); }
  if (argv.includes('--update-baseline')) { updateBaseline(); process.exit(0); }
  let bad = 0;
  const pass = (m) => console.log(`  ✅ ${m}`);
  const warn = (m) => console.log(`  ⚠️  ${m}`);
  const fail = (m) => { bad++; console.log(`  ❌ ${m}`); };
  console.log('🔎 [Gate 34] 정본신설승인 검사기 (Canon Addition Approval)');
  try { check({ pass, warn, fail }); } catch (e) { console.error(`  ❌ 실행 실패: ${e.message}`); process.exit(1); }
  process.exit(bad > 0 ? 1 : 0);
}
