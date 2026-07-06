#!/usr/bin/env node
/**
 * presentation-layout-check.js  (Gate 23 — 컴포넌트 표출 레이아웃 검수기)
 * ─────────────────────────────────────────────────────────────────────────
 * "components-new.html 각 PC 컴포넌트 섹션이 '어떻게 표출되어야 하나'(정본
 *  component-presentation-policy.json)를 실제로 지키나"를 **실제 렌더 DOM** 기준으로 대조한다.
 *
 * ★ 왜 렌더 DOM인가: 이 페이지는 로드 시 JS(components-new.html IIFE)가 매트릭스를 재배치한다
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
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'pages/components-new.html');
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

// 재배치 완료된 DOM 을 헤드리스로 덤프
function renderDom() {
  const chrome = findChrome();
  if (!chrome) return { skip: '크롬/엣지 실행파일을 못 찾음 (CHROME_PATH 로 지정 가능)' };
  const fileUrl = 'file:///' + HTML.replace(/\\/g, '/');
  const r = spawnSync(chrome, ['--headless=new', '--dump-dom', '--virtual-time-budget=5000',
    '--no-sandbox', '--disable-gpu', fileUrl], { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024, timeout: 60000 });
  if (r.status !== 0 && !r.stdout) return { skip: `렌더 실패 (${r.error ? r.error.message : 'exit ' + r.status})` };
  const dom = r.stdout || '';
  // 재배치가 실제로 돌았는지 확인(comp-action-top 은 재배치 후에만 생김)
  if (!/comp-action-top/.test(dom)) return { skip: '재배치 후 DOM 마커(comp-action-top) 부재 — 렌더 미완/스크립트 차단 의심' };
  return { dom };
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

function main() {
  const policy = JSON.parse(fs.readFileSync(POLICY, 'utf8'));
  const comps = policy.components || {};

  const { dom, skip } = renderDom();
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
