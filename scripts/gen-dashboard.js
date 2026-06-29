#!/usr/bin/env node
/**
 * Dashboard 생성기 (gen-dashboard.js)
 * ─────────────────────────────────────────────────────────────────────────
 * "누가·무엇이 우리 컴포넌트를 지키는지"를 한눈에 보여주는 대시보드 페이지를
 * registry/governance/guardians.json(정본) + gate:check 실행결과(생애 상태)로 생성한다.
 *
 * 왜 생성기인가: 손으로 쓰면 검사기·도우미가 늘 때마다 또 어긋난다(지금 우리가 없애려는 바로 그 문제).
 *   guardians.json 만 고치고 `npm run dashboard:gen` 하면 페이지가 다시 그려진다.
 *
 * 사용: node scripts/gen-dashboard.js   (또는 npm run dashboard:gen)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "registry/governance/guardians.json");
const OUT = path.join(ROOT, "pages/dashboard.html");

const data = JSON.parse(fs.readFileSync(DATA, "utf8"));

// ── 생애 상태: gate:check 를 실제로 돌려 통과/실패를 읽는다 ───────────────
let gatePass = null; // true / false / null(못 돌림)
let gateSummary = "";
try {
  // 2>&1 로 stderr(통과 요약·경고가 여기로 나감)까지 합쳐 읽는다. exit 0 = 통과(경고 있어도 PASSED).
  const out = execSync("node scripts/gate-check.js 2>&1", { cwd: ROOT, encoding: "utf8" });
  gatePass = true;
  const m = out.match(/(전부 통과[^\n]*|PASSED[^\n]*)/);
  gateSummary = m ? m[1].trim() : "";
} catch (e) {
  // gate-check 가 exit 1(실패)이면 execSync 가 throw → 출력은 e.stdout 에 있음
  const out = (e.stdout || "") + (e.stderr || "");
  gatePass = false;
  const m = out.match(/(FAILED[^\n]*|error\(s\)[^\n]*)/);
  gateSummary = m ? m[1].trim() : "일부 검사 실패";
}

// 생성 날짜(일반 node 스크립트라 Date 사용 가능). YYYY-MM-DD HH:MM
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const autoGates = data.gates.filter((g) => g.auto).length;

// ── 상태 배너 ────────────────────────────────────────────────────────────
const banner = gatePass === true
  ? `<div class="dash-banner ok"><span class="dash-banner-icon">✅</span><div><div class="dash-banner-title">지금 모두 정상입니다</div><div class="dash-banner-sub">자동 검사 ${autoGates}개가 마지막 점검에서 전부 통과했어요. · ${esc(stamp)} 기준</div></div></div>`
  : gatePass === false
  ? `<div class="dash-banner bad"><span class="dash-banner-icon">⚠️</span><div><div class="dash-banner-title">확인이 필요한 게 있어요</div><div class="dash-banner-sub">${esc(gateSummary || "일부 검사가 걸렸습니다")} · ${esc(stamp)} 기준</div></div></div>`
  : `<div class="dash-banner"><span class="dash-banner-icon">ℹ️</span><div><div class="dash-banner-title">상태 확인 못 함</div><div class="dash-banner-sub">검사를 실행하지 못했습니다.</div></div></div>`;

// ── 검사기 카드 (묶음별) ──────────────────────────────────────────────────
const gateCardHtml = (g) => `
          <div class="dash-card gate">
            <div class="dash-card-top">
              <span class="dash-gate-num">Gate ${esc(g.num)}</span>
              <span class="dash-badge ${g.auto ? "auto" : "manual"}">${g.auto ? "자동 감시" : "필요 시 점검"}</span>
            </div>
            <div class="dash-card-name">🔎 ${esc(g.name)}</div>
            <div class="dash-card-desc">${esc(g.guards)}</div>
          </div>`;

const groups = data.gateGroups && data.gateGroups.length
  ? data.gateGroups
  : [{ key: null, title: "검사기", desc: "" }];

// 탭 묶음: 위 줄 = 탭 버튼, 아래 = 묶음별 패널(한 화면에서 탭으로 전환 — 스크롤 대신)
const activeGroups = groups.filter((grp) => data.gates.some((g) => (grp.key == null) || g.group === grp.key));

const gateTabsBtns = activeGroups.map((grp, i) => {
  const cnt = data.gates.filter((g) => (grp.key == null) || g.group === grp.key).length;
  return `<button class="dash-tab${i === 0 ? " is-active" : ""}" data-tab="${esc(grp.key || "all")}">${esc(grp.title)} <span class="cnt">${cnt}</span></button>`;
}).join("");

const gateTabsPanels = activeGroups.map((grp, i) => {
  const inGroup = data.gates.filter((g) => (grp.key == null) || g.group === grp.key);
  return `
        <div class="dash-tabpanel${i === 0 ? " is-active" : ""}" data-panel="${esc(grp.key || "all")}">
          ${grp.desc ? `<p class="dash-tabpanel-desc">${esc(grp.desc)}</p>` : ""}
          <div class="dash-grid">${inGroup.map(gateCardHtml).join("")}
          </div>
        </div>`;
}).join("");

const gateGroupsHtml = `
      <div class="dash-tabs">${gateTabsBtns}</div>
      <div class="dash-tabpanels">${gateTabsPanels}
      </div>`;
// 묶음에 안 들어간 검사기가 있으면(데이터 누락) 표시
const ungrouped = data.gates.filter((g) => g.group && !groups.some((gr) => gr.key === g.group));

// ── 도우미 카드 — 총괄(위) → 단계 흐름(1→2→3→4) → 상시 레인 ────────────────
const orch = data.orchestrator;
const agentCard = (a) => `
            <div class="dash-card agent">
              <div class="dash-card-name">${a.emoji} ${esc(a.name)}</div>
              <div class="dash-card-desc">${esc(a.role)}</div>
              ${a.when ? `<div class="dash-card-when">${esc(a.when)}</div>` : ""}
            </div>`;

const orchCard = `
        <div class="dash-card agent star">
          <div class="dash-card-name">${orch.emoji} ${esc(orch.name)} <span class="dash-tag">총괄</span></div>
          <div class="dash-card-desc">${esc(orch.role)}</div>
          <div class="dash-card-when">아래 단계를 지휘합니다 — 계획 세우기 → 단계별 도우미 호출 → 검사기로 검증·책임</div>
        </div>`;

const stages = data.agentStages || [];
const lanes = data.agentLanes || [];
const stagesWithAgents = stages.filter((s) => data.agents.some((a) => a.stage === s.key));

// 단계 흐름: 1 읽기 → 2 설계 → 3 만들기 → 4 검증 (각 단계 컬럼 + 사이 화살표)
const stageFlowHtml = stagesWithAgents.map((s, i) => {
  const cards = data.agents.filter((a) => a.stage === s.key).map(agentCard).join("");
  const arrow = i < stagesWithAgents.length - 1 ? `\n        <div class="dash-stage-arrow">→</div>` : "";
  return `
        <div class="dash-stage">
          <div class="dash-stage-head"><span class="dash-stage-num">${esc(s.num)}</span><span class="dash-stage-title">${esc(s.title)}</span></div>
          <div class="dash-stage-desc">${esc(s.desc)}</div>
          <div class="dash-stage-cards">${cards}
          </div>
        </div>${arrow}`;
}).join("");

// 상시 레인: 단계와 무관한 전파(토큰값 전파 등)
const lanesHtml = lanes.filter((l) => data.agents.some((a) => a.stage === l.key)).map((l) => {
  const cards = data.agents.filter((a) => a.stage === l.key).map(agentCard).join("");
  return `
        <div class="dash-lane">
          <div class="dash-lane-head"><span class="dash-lane-tag">${esc(l.title)}</span><span class="dash-lane-desc">${esc(l.desc)}</span></div>
          <div class="dash-grid">${cards}
          </div>
        </div>`;
}).join("");

// 단계·레인 어디에도 안 든 에이전트(데이터 누락 폴백) — 그냥 그리드로
const stagedKeys = new Set([...stages.map((s) => s.key), ...lanes.map((l) => l.key)]);
const orphanAgents = data.agents.filter((a) => !stagedKeys.has(a.stage));
const orphanHtml = orphanAgents.length
  ? `<div class="dash-lane"><div class="dash-lane-head"><span class="dash-lane-tag">기타</span></div><div class="dash-grid">${orphanAgents.map(agentCard).join("")}</div></div>`
  : "";

const agentsHtml = `
        <div class="dash-orch-wrap">${orchCard}</div>
        <div class="dash-stageflow">${stageFlowHtml}
        </div>${lanesHtml}${orphanHtml}`;

// ── 워크플로우 — 큰 작업의 단계별 검문소 흐름 ─────────────────────────────
const workflows = data.workflows || [];
const wfStep = (s, last) => `
            <div class="wf-step${/검증|대조/.test(s.title + s.who) ? " verify" : ""}">
              <div class="wf-step-num">${esc(s.num)}</div>
              <div class="wf-step-body">
                <div class="wf-step-title">${esc(s.title)}</div>
                <div class="wf-step-who">${esc(s.who)}</div>
                ${s.gate ? `<div class="wf-step-gate">🚦 ${esc(s.gate)}</div>` : ""}
              </div>
            </div>${last ? "" : `<div class="wf-arrow">→</div>`}`;
const workflowsHtml = workflows.map((w) => `
        <div class="wf-card">
          <div class="wf-head"><span class="wf-name">${esc(w.name)}</span><span class="wf-when">${esc(w.when)}</span></div>
          <div class="wf-steps">${w.steps.map((s, i) => wfStep(s, i === w.steps.length - 1)).join("")}
          </div>
        </div>`).join("");
const workflowsSection = workflows.length ? `
      <div class="dash-section">
        <div class="dash-section-head">
          <h2>🪜 워크플로우 — 큰 작업의 단계별 진행</h2>
          <p>"피그마를 코드로 옮기기" 같은 큰 작업은 정해진 단계(검문소)를 따라 갑니다. 각 단계는 🚦 통과 조건을 만족해야 다음으로 넘어가고, <b>만드는 단계와 검증(초록) 단계는 일부러 다른 팀원</b>이 맡습니다.</p>
        </div>
        ${workflowsHtml}
      </div>` : "";

// ── 자동 장치(훅) 카드 ───────────────────────────────────────────────────
const hookCards = data.hooks.map((h) => `
        <div class="dash-card hook">
          <div class="dash-card-name">${h.emoji} ${esc(h.name)} <span class="dash-badge auto">늘 켜짐</span></div>
          <div class="dash-card-desc">${esc(h.role)}</div>
        </div>`).join("");

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script>!function(){var z=localStorage.getItem("sw-ds-zoom");if(z)document.documentElement.style.zoom=z+"%"}();</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard — S1 UX DESIGN GUIDE</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <!-- 이 페이지는 scripts/gen-dashboard.js 가 registry/governance/guardians.json 으로 자동 생성. 손편집 금지. -->
  <style>
    .dash-banner { display:flex; align-items:center; gap:14px; padding:18px 22px; border-radius:14px; margin-bottom:32px; background:#f3f4f6; border:1px solid #e5e7eb; }
    .dash-banner.ok { background:#ecfdf5; border-color:#a7f3d0; }
    .dash-banner.bad { background:#fffbeb; border-color:#fcd34d; }
    .dash-banner-icon { font-size:28px; line-height:1; }
    .dash-banner-title { font-size:16px; font-weight:700; color:#111827; }
    .dash-banner-sub { font-size:13px; color:#6b7280; margin-top:3px; }

    .dash-section { margin-bottom:40px; }
    .dash-section-head { margin-bottom:6px; }
    .dash-section-head h2 { font-size:18px; font-weight:700; color:#111827; margin:0; }
    .dash-section-head p { font-size:13px; color:#6b7280; margin:4px 0 18px; }

    .dash-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:12px; }
    .dash-tabs { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }
    .dash-tab { font-size:13px; font-weight:600; color:#6b7280; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:20px; padding:7px 16px; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:background .12s; }
    .dash-tab:hover { background:#eef0f2; }
    .dash-tab.is-active { background:#1d6ceb; border-color:#1d6ceb; color:#fff; }
    .dash-tab .cnt { font-size:11px; font-weight:700; background:rgba(0,0,0,0.08); padding:1px 7px; border-radius:20px; }
    .dash-tab.is-active .cnt { background:rgba(255,255,255,0.25); }
    .dash-tabpanel { display:none; }
    .dash-tabpanel.is-active { display:block; }
    .dash-tabpanel-desc { font-size:13px; color:#6b7280; margin:0 0 14px; }
    .dash-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px 18px; }
    .dash-card.gate { border-left:4px solid #1d6ceb; }
    .dash-card.agent { border-left:4px solid #7c3aed; }
    .dash-card.agent.star { border-left-color:#f59e0b; background:#fffdf7; grid-column:1 / -1; }
    .dash-card.hook { border-left:4px solid #059669; }
    .dash-card-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
    .dash-gate-num { font-size:10px; font-weight:600; color:#b6bcc6; letter-spacing:0.02em; }
    .dash-card-name { font-size:14px; font-weight:700; color:#111827; margin-bottom:5px; }
    .dash-card-desc { font-size:13px; color:#4b5563; line-height:1.5; }
    .dash-card-when { font-size:11px; color:#9ca3af; margin-top:8px; }
    /* 에이전트 단계 흐름 */
    .dash-orch-wrap { margin-bottom:18px; }
    .dash-orch-wrap .dash-card.star { border-left-color:#f59e0b; background:#fffdf7; }
    .dash-stageflow { display:flex; align-items:flex-start; gap:8px; overflow-x:auto; padding-bottom:6px; }
    .dash-stage { flex:1 1 0; min-width:208px; display:flex; flex-direction:column; }
    .dash-stage-head { display:flex; align-items:center; gap:8px; height:24px; }
    .dash-stage-num { width:24px; height:24px; flex:0 0 24px; border-radius:50%; background:#7c3aed; color:#fff; font-size:13px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; }
    .dash-stage-title { font-size:14px; font-weight:700; color:#111827; }
    .dash-stage-desc { font-size:11.5px; color:#9ca3af; line-height:1.45; margin:6px 0 12px 32px; }
    .dash-stage-cards { display:flex; flex-direction:column; gap:10px; }
    .dash-stage-arrow { flex:0 0 auto; height:24px; display:flex; align-items:center; color:#c4b5fd; font-size:22px; font-weight:700; }
    .dash-lane { margin-top:22px; border-top:1px dashed #e5e7eb; padding-top:18px; }
    .dash-lane-head { display:flex; align-items:baseline; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
    .dash-lane-tag { font-size:12px; font-weight:700; color:#6d28d9; background:#f5f3ff; border:1px solid #ddd6fe; padding:3px 12px; border-radius:20px; white-space:nowrap; }
    .dash-lane-desc { font-size:12.5px; color:#6b7280; }
    /* 워크플로우 단계 흐름 */
    .wf-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px 18px; margin-bottom:14px; }
    .wf-head { display:flex; align-items:baseline; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
    .wf-name { font-size:15px; font-weight:700; color:#111827; }
    .wf-when { font-size:12.5px; color:#9ca3af; }
    .wf-steps { display:flex; align-items:stretch; gap:6px; overflow-x:auto; padding-bottom:4px; }
    .wf-step { flex:1 1 0; min-width:152px; display:flex; gap:9px; background:#faf9ff; border:1px solid #ece9fb; border-radius:10px; padding:10px 12px; }
    .wf-step.verify { background:#f0fdf6; border-color:#bbf7d0; }
    .wf-step-num { width:20px; height:20px; flex:0 0 20px; border-radius:50%; background:#7c3aed; color:#fff; font-size:11px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; }
    .wf-step.verify .wf-step-num { background:#059669; }
    .wf-step-body { min-width:0; }
    .wf-step-title { font-size:13px; font-weight:700; color:#111827; }
    .wf-step-who { font-size:11px; color:#6d28d9; margin-top:3px; line-height:1.4; }
    .wf-step.verify .wf-step-who { color:#047857; }
    .wf-step-gate { font-size:10.5px; color:#9ca3af; margin-top:5px; line-height:1.4; }
    .wf-arrow { flex:0 0 auto; align-self:center; color:#c4b5fd; font-size:18px; font-weight:700; }
    .dash-badge { font-size:11px; font-weight:600; padding:2px 9px; border-radius:20px; white-space:nowrap; }
    .dash-badge.auto { background:#d1fae5; color:#065f46; }
    .dash-badge.manual { background:#f3f4f6; color:#6b7280; }
    .dash-tag { font-size:11px; font-weight:600; color:#b45309; background:#fef3c7; padding:1px 8px; border-radius:20px; margin-left:6px; }
    .dash-foot { font-size:12px; color:#9ca3af; margin-top:8px; padding-top:20px; border-top:1px solid #f3f4f6; line-height:1.6; }
  </style>
</head>
<body>
<div class="layout">
  <aside class="sidebar"><div id="sidebar-inner"></div></aside>
  <div class="sidebar-overlay" id="sidebar-overlay"></div>
  <main class="main-content">
    <div class="mobile-header">
      <button class="hamburger" id="sidebar-toggle" aria-label="메뉴">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <span class="mobile-logo">S1 UX DESIGN GUIDE</span>
    </div>

    <div class="page-header">
      <h1 class="page-title">🛡 디자인 시스템 지킴이</h1>
      <p class="page-desc">누가·무엇이 우리 컴포넌트를 지키고 있는지 한눈에 봅니다.</p>
    </div>

    <div class="page-content">
      ${banner}

      <div class="dash-section">
        <div class="dash-section-head">
          <h2>👥 에이전트 팀 구성</h2>
          <p>검사기(🔎)가 <b>'정해둔 규칙대로인가'를 기계적으로 자동 점검</b>한다면, 여기 팀원들은 <b>읽고·만들고·판단하는</b> 일을 합니다 — 규칙으로 딱 떨어지지 않아 사람 같은 판단이 필요한 일이라 검사기가 아니라 에이전트입니다. <b>총괄(⭐)이 위에서 지휘</b>하고, 아래 도우미들은 <b>① 읽기 → ② 설계 → ③ 만들기 → ④ 검증</b> 순서로 일합니다. 특히 <b>만드는 일(③)과 검증하는 일(④)은 일부러 다른 팀원</b>이 맡습니다(자기 일을 자기가 검사하면 관대해지니까).</p>
        </div>
        ${agentsHtml}
      </div>
${workflowsSection}
      <div class="dash-section">
        <div class="dash-section-head">
          <h2>🔎 검사기 — 실수를 자동으로 막아주는 장치</h2>
          <p>비슷한 일을 하는 검사기끼리 ${activeGroups.length}개 묶음으로 정리했습니다. 탭을 눌러 묶음별로 보세요. ("안 걸린다 = 잘 막고 있다"는 뜻이에요.)</p>
        </div>
        ${gateGroupsHtml}
      </div>

      <div class="dash-section">
        <div class="dash-section-head">
          <h2>⚙️ 자동 장치 — 늘 켜져 있는 안전장치</h2>
          <p>따로 부르지 않아도 항상 작동하면서 실수를 막습니다.</p>
        </div>
        <div class="dash-grid">${hookCards}
        </div>
      </div>

      <div class="dash-foot">
        이 화면은 손으로 쓴 게 아니라 <b>자동으로 만들어집니다.</b> 검사기·도우미가 늘거나 바뀌면 목록 파일만 고치고 다시 생성하면 갱신돼요 — 그래서 이 화면 자체는 실제와 어긋나지 않습니다.<br>
        마지막 생성: ${esc(stamp)}
      </div>
    </div>
  </main>
</div>
<script src="../assets/js/main.js"></script>
<script>
(function(){
  var tabs = document.querySelectorAll(".dash-tab");
  var panels = document.querySelectorAll(".dash-tabpanel");
  tabs.forEach(function(t){
    t.addEventListener("click", function(){
      var k = t.getAttribute("data-tab");
      tabs.forEach(function(x){ x.classList.toggle("is-active", x === t); });
      panels.forEach(function(p){ p.classList.toggle("is-active", p.getAttribute("data-panel") === k); });
    });
  });
})();
</script>
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log(`✅ dashboard.html 생성 — 검사기 ${data.gates.length}개 · 도우미 ${data.agents.length + 1}개 · 자동장치 ${data.hooks.length}개 · 상태 ${gatePass ? "통과" : gatePass === false ? "확인필요" : "미확인"} (${stamp})`);
