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
  const out = execSync("node scripts/gate-check.js", { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  gatePass = /all gates clear|전부 통과/.test(out);
  const m = out.match(/(전부 통과[^\n]*|FAILED[^\n]*)/);
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

// ── 검사기 카드 ──────────────────────────────────────────────────────────
const gateCards = data.gates.map((g) => `
        <div class="dash-card gate">
          <div class="dash-card-top">
            <span class="dash-gate-num">${g.num}</span>
            <span class="dash-badge ${g.auto ? "auto" : "manual"}">${g.auto ? "자동 감시" : "필요 시 점검"}</span>
          </div>
          <div class="dash-card-name">🔎 ${esc(g.name)}</div>
          <div class="dash-card-desc">${esc(g.guards)}</div>
        </div>`).join("");

// ── 도우미 카드 ──────────────────────────────────────────────────────────
const orch = data.orchestrator;
const agentCards = [
  `<div class="dash-card agent star">
     <div class="dash-card-name">${orch.emoji} ${esc(orch.name)} <span class="dash-tag">총괄</span></div>
     <div class="dash-card-desc">${esc(orch.role)}</div>
   </div>`,
  ...data.agents.map((a) => `
        <div class="dash-card agent">
          <div class="dash-card-name">${a.emoji} ${esc(a.name)}</div>
          <div class="dash-card-desc">${esc(a.role)}</div>
          <div class="dash-card-when">${esc(a.when)}</div>
        </div>`),
].join("");

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
    .dash-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px 18px; }
    .dash-card.gate { border-left:4px solid #1d6ceb; }
    .dash-card.agent { border-left:4px solid #7c3aed; }
    .dash-card.agent.star { border-left-color:#f59e0b; background:#fffdf7; grid-column:1 / -1; }
    .dash-card.hook { border-left:4px solid #059669; }
    .dash-card-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
    .dash-gate-num { width:24px; height:24px; border-radius:7px; background:#eff6ff; color:#1d6ceb; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; }
    .dash-card-name { font-size:14px; font-weight:700; color:#111827; margin-bottom:5px; }
    .dash-card-desc { font-size:13px; color:#4b5563; line-height:1.5; }
    .dash-card-when { font-size:11px; color:#9ca3af; margin-top:8px; }
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
          <h2>🔎 검사기 — 실수를 자동으로 막아주는 장치</h2>
          <p>각각이 무엇을 지키는지, 그리고 저장할 때 자동으로 막아주는지(자동 감시) 보여줍니다.</p>
        </div>
        <div class="dash-grid">${gateCards}
        </div>
      </div>

      <div class="dash-section">
        <div class="dash-section-head">
          <h2>🤝 작업 도우미 — 필요할 때 불려나오는 일꾼</h2>
          <p>총괄이 일을 나눠서 맡기는 도우미들입니다. 만드는 일과 검증하는 일이 서로 나뉘어 있어요.</p>
        </div>
        <div class="dash-grid">${agentCards}
        </div>
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
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log(`✅ dashboard.html 생성 — 검사기 ${data.gates.length}개 · 도우미 ${data.agents.length + 1}개 · 자동장치 ${data.hooks.length}개 · 상태 ${gatePass ? "통과" : gatePass === false ? "확인필요" : "미확인"} (${stamp})`);
