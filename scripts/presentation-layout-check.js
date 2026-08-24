#!/usr/bin/env node
/**
 * presentation-layout-check.js  (Gate 23 — 컴포넌트 표출 레이아웃 검수기)
 * ─────────────────────────────────────────────────────────────────────────
 * "components.html 각 PC 컴포넌트 섹션이 '어떻게 표출되어야 하나'(정본
 *  component-presentation-policy.json)를 실제로 지키나"를 **실제 렌더 DOM** 기준으로 대조한다.
 *
 * ★ 왜 렌더 DOM인가: 이 페이지는 로드 시 JS(components.html IIFE)가 매트릭스를 재배치한다
 *   (Action 을 comp-action-top 스트립으로 승격 등). 소스만 보면 배치를 오독한다(§⚖️ 정본 오독).
 *   그래서 헤드리스 크롬 --dump-dom 으로 **재배치가 끝난 DOM**을 받아 검사한다.
 *
 * ★ 예방 원리(거짓 완전성 차단): 컴포넌트마다 "무엇을 검증했고 무엇을 미계측"인지 스스로 선언한다.
 *   v1 은 '구조'(Action 유무·별도 사이즈/라벨 블록 금지)를 검증한다. 상태 '값' 완전성은 Gate 19,
 *   상태 세로배치·hover 유지·정보 보완 등은 v1 미계측으로 정직 보고(추후 계측).
 *
 * 판정: ❌FAIL = 정본이 요구/금지하는 구조 위반. ℹ️미계측 = v1 미검증 축(차단 아님, 갯수 명시).
 *       ⚠️SKIP = 크롬 없음/렌더 실패(FAIL 아님, Figma Gate SKIP 관례).
 *
 * 출력 끝줄: `PRESO_SUMMARY components=<n> checks=<n> pass=<n> fail=<n> uninstrumented=<n>`
 * 사용: node scripts/presentation-layout-check.js  (npm run components:presentation)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'pages/components.html');
const POLICY = path.join(ROOT, 'registry/governance/component-presentation-policy.json');

function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium',
  ].filter(Boolean);
  for (const c of cands) { try { if (fs.existsSync(c)) return c; } catch (_) {} }
  return null;
}

// 재배치 완료된 DOM 을 헤드리스로 덤프 (일시적 Chrome 크래시에 재시도)
//
// ★ 왜 spawnSync 가 아닌가(2026-08-24): --dump-dom 은 DOM 을 stdout 으로 다 뱉은 뒤에도
//   Chrome 프로세스가 스스로 종료하지 않는다(실측: DOM 완성 2.3초 → 종료 안 함 → 60초
//   timeout 에 강제 종료). 즉 기존 60초 중 약 58초는 일하는 시간이 아니라 죽은 대기였다.
//   그래서 stdout 을 스트리밍으로 받아 **문서 끝(</html>)이 도착하는 즉시 프로세스를 종료**한다.
//   받는 DOM 자체는 종전과 동일하다 — 대기만 없앤 것이므로 판정 로직·결과에 영향이 없다.
//   (virtual-time-budget 5000 은 페이지 JS 재배치에 주는 시간이라 그대로 둔다. 줄이면
//    덤프 내용이 달라져 판정이 바뀔 수 있다.)
const DOM_HARD_TIMEOUT_MS = 60000;   // </html> 가 끝내 안 오는 경우의 안전망(종전 timeout 과 동일)
const DOM_MAX_BYTES = 64 * 1024 * 1024; // 종전 maxBuffer 와 동일

function dumpOnce(chrome, fileUrl) {
  // 전용 임시 프로필 — 사용자/다른 Chrome 세션의 기본 프로필 잠금과 충돌해 크래시하는 것을 방지
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preso-chrome-'));
  const child = spawn(chrome, ['--headless=new', '--dump-dom', '--virtual-time-budget=5000',
    '--no-sandbox', '--disable-gpu', `--user-data-dir=${profileDir}`, fileUrl],
    { stdio: ['ignore', 'pipe', 'ignore'] });

  return new Promise((resolve) => {
    const chunks = []; let size = 0; let settled = false; let spawnErr = null;

    const cleanup = () => {
      try { child.kill(); } catch (_) {}
      try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
    };
    const settle = () => {
      if (settled) return; settled = true;
      clearTimeout(timer); cleanup();
      const dom = Buffer.concat(chunks).toString('utf-8');
      // 재배치가 실제로 돌았는지 확인(comp-action-top 은 재배치 후에만 생김)
      if (dom && /comp-action-top/.test(dom)) resolve({ dom });
      else resolve({ err: !dom ? `렌더 실패 (${spawnErr ? spawnErr.message : '출력 없음'})` : '재배치 후 DOM 마커(comp-action-top) 부재' });
    };

    const timer = setTimeout(settle, DOM_HARD_TIMEOUT_MS);
    child.stdout.on('data', (b) => {
      chunks.push(b); size += b.length;
      // 문서 끝 태그가 보이면 덤프 완료 — 더 기다릴 이유가 없다
      if (size > DOM_MAX_BYTES || b.includes('</html>')) settle();
    });
    child.on('error', (e) => { spawnErr = e; settle(); });
    // 'exit' 가 아니라 'close' — stdio 가 닫힌 뒤라 마지막 청크 유실 위험이 없다
    // (크롬이 스스로 죽는 크래시 경로에서만 도달한다. 정상 경로는 위 </html> 에서 끝난다.)
    child.on('close', settle);
  });
}
async function renderDom() {
  const chrome = findChrome();
  if (!chrome) return { skip: '크롬/엣지 실행파일을 못 찾음 (CHROME_PATH 로 지정 가능)' };
  const fileUrl = 'file:///' + HTML.replace(/\\/g, '/');
  let last = '';
  for (let i = 0; i < 3; i++) { // 일시적 크래시(x86 Chrome) 대비 최대 3회 재시도
    const r = await dumpOnce(chrome, fileUrl);
    if (r.dom) return { dom: r.dom };
    last = r.err;
  }
  return { skip: `${last} (3회 재시도 실패)` };
}

// 재배치된 DOM 에서 섹션별 슬라이스 추출 (섹션은 중첩 없음)
function sliceSections(dom) {
  const re = /<section\b[^>]*\bclass="[^"]*\bcomp-section\b[^"]*"[^>]*\bid="([a-z0-9-]+)"[^>]*>/g;
  const starts = [];
  let m;
  while ((m = re.exec(dom))) starts.push({ id: m[1], at: m.index });
  const map = {};
  for (let i = 0; i < starts.length; i++) {
    const end = i + 1 < starts.length ? starts[i + 1].at : dom.length;
    map[starts[i].id] = dom.slice(starts[i].at, end);
  }
  return map;
}

// 섹션 슬라이스에서 관측 사실 추출
function observe(slice) {
  const labels = [];
  const lre = /class="variant-label"[^>]*>([^<]{1,80})/g;
  let m; while ((m = lre.exec(slice))) labels.push(m[1].trim());
  const actionPresent = /\bcomp-action-top\b|\bmatrix-col-header-action\b|\bdata-action-test\b|\bcomp-action-cell\b|\baction-cell\b/.test(slice);
  const sizeBlocks = labels.filter((t) => /^(sizes?|size variants)\b/i.test(t));
  const labelBlocks = labels.filter((t) => /^label\b/i.test(t)); // radio "Label=Off" 등
  return { labels, actionPresent, sizeBlocks, labelBlocks };
}

async function main() {
  const policy = JSON.parse(fs.readFileSync(POLICY, 'utf8'));
  const comps = policy.components || {};

  const { dom, skip } = await renderDom();
  console.log('🔎 컴포넌트 표출 레이아웃 검수기 (Component Presentation Policy) — Gate 23');
  console.log(`  정본 registry/governance/component-presentation-policy.json · 대상 ${Object.keys(comps).length}개 (PC)`);
  if (skip) {
    console.log(`  ⚠️ SKIP — ${skip} (FAIL 아님)`);
    console.log('PRESO_SUMMARY components=0 checks=0 pass=0 fail=0 uninstrumented=0 skip=1');
    return process.exit(0);
  }

  const sections = sliceSections(dom);
  const fails = []; const missingSection = []; const uninstr = [];
  let pass = 0, checks = 0;

  for (const [id, spec] of Object.entries(comps)) {
    const slice = sections[id];
    if (!slice) { missingSection.push(id); continue; }
    const o = observe(slice);
    const sp = spec.sizePlacement;

    // ── 검사 1: Action(인터랙티브) 필수 ──
    // current-plus-action·set-based 는 "세트/조합에 Action" 이 요구인데, v1 은 세트 단위 여부를
    // 구분 못 한다(하위 부품 마커로 오판) → 거짓 통과 막게 미계측으로 정직 보고.
    if (spec.actionRequired) {
      if (spec.archetype === 'current-plus-action' || spec.archetype === 'set-based') {
        uninstr.push(`${id}.세트/조합에 Action 있나(세트 단위 판별은 v1 미계측)`);
      } else {
        checks++;
        if (!o.actionPresent) fails.push(`${id}: Action(인터랙티브) 영역 없음 — 정본 actionRequired=true`);
        else pass++;
      }
    }
    // ── 검사 2: 별도 사이즈 블록 금지 (action-only / in-action-state-area / merged-section) ──
    if (['action-only', 'in-action-state-area', 'merged-section'].includes(sp)) {
      checks++;
      if (o.sizeBlocks.length) fails.push(`${id}: 별도 사이즈 블록 발견 [${o.sizeBlocks.join(' | ')}] — sizePlacement=${sp} 는 사이즈를 별도 블록으로 빼면 안 됨`);
      else pass++;
    }
    // ── 검사 3: 별도 라벨 블록 금지 (radio-like: 라벨은 Action·각 상태에 인라인) ──
    if (spec.labelPlacement === 'in-action-and-state') {
      checks++;
      if (o.labelBlocks.length) fails.push(`${id}: 별도 라벨 블록 발견 [${o.labelBlocks.join(' | ')}] — 라벨 유무는 Action·각 상태에 함께 표출해야 함`);
      else pass++;
    }

    // ── v1 미계측(정직 보고) ──
    if (sp === 'action-only' || sp === 'action-strip+matrix-rows' || sp === 'per-set') uninstr.push(`${id}.사이즈가 실제로 Action에 다 나오나(양성 확인)`);
    if (spec.statesLayout === 'vertical') uninstr.push(`${id}.상태 세로배치`);
    if (spec.keepInState) uninstr.push(`${id}.상태 유지요소(${Object.values(spec.keepInState).join(',')})`);
    if (spec.contentAdditions) spec.contentAdditions.forEach((c) => uninstr.push(`${id}.정보보완(${c})`));
  }

  console.log(`  검사 ${checks} · ✅통과 ${pass} · ❌위반 ${fails.length} · 섹션없음 ${missingSection.length} · ℹ️미계측 ${uninstr.length}`);
  console.log('  (v1 = 구조 검증: Action 유무·별도 사이즈/라벨 블록 금지. 상태 값 완전성=Gate 19, 세로배치·hover유지·정보보완=미계측)');
  if (missingSection.length) { console.log('  ❌ 정본에 있으나 렌더에 섹션 없음:'); missingSection.forEach((s) => console.log('     -', s)); }
  if (fails.length) { console.log('  ❌ 위반:'); fails.forEach((f) => console.log('     -', f)); }
  if (uninstr.length) { console.log('  ℹ️ 미계측(v1 미검증 — 정직 보고, 추후 계측):'); uninstr.forEach((u) => console.log('     -', u)); }

  const failN = fails.length + missingSection.length;
  console.log(`PRESO_SUMMARY components=${Object.keys(comps).length} checks=${checks} pass=${pass} fail=${failN} uninstrumented=${uninstr.length} skip=0`);
  process.exit(failN ? 1 : 0);
}

main();
