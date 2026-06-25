#!/usr/bin/env node
/**
 * 업데이트 관리 생성기 (gen-update-management.js)
 * ─────────────────────────────────────────────────────────────────────────
 * 컴포넌트·패턴별 진행 상태와 각 표면(Figma 설치기·tokens.css·HTML 가이드) 반영일을
 * 한눈에 보여주는 관리 페이지를 생성한다.
 *
 *  - 정본(수동 필드: 분류·원본노드·날짜도장·비고·검증방식) = registry/governance/update-management.json
 *  - 자동 필드(진행 단계·다크모드)는 registry/components|patterns/{id}.json 에서 읽어 합친다.
 *
 * 왜 생성기인가: 손으로 쓰면 늘 어긋난다. json 만 고치고 `npm run update:gen` 하면 다시 그려진다.
 * 사용: node scripts/gen-update-management.js   (또는 npm run update:gen)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "registry/governance/update-management.json");
const OUT = path.join(ROOT, "pages/update-management.html");

const data = JSON.parse(fs.readFileSync(DATA, "utf8"));
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

// ── registry 에서 자동 필드(진행 단계·다크모드) 읽기 ────────────────────────
function readRegistry(entry, kind) {
  const candidates = [];
  if (entry.registryPath) candidates.push(path.join(ROOT, entry.registryPath));
  candidates.push(path.join(ROOT, `registry/${kind}/${entry.id}.json`));
  for (const p of candidates) {
    try {
      const m = JSON.parse(fs.readFileSync(p, "utf8"))._meta || {};
      return { code: m.codeStatus, harness: m.harnessStatus, dark: m.darkModeStatus, name: m.name };
    } catch (_) { /* 없으면 다음 후보 */ }
  }
  return {};
}

// 진행 단계: codeStatus(+harness=skeleton) → 한국어 라벨 + 색
function stageCell(reg) {
  const code = reg.code || "–";
  if (reg.harness === "skeleton" || code === "not-started")
    return { label: reg.harness === "skeleton" ? "골격" : "미착수", cls: "st-early" };
  const map = {
    "in-progress": { label: "진행중", cls: "st-mid" },
    "preview": { label: "미리보기", cls: "st-mid" },
    "implemented": { label: "구현", cls: "st-ok" },
    "done": { label: "완료", cls: "st-ok" },
  };
  return map[code] || { label: esc(code), cls: "st-mid" };
}

function originCell(o) {
  return ({
    A: { label: "Ⓐ 정리완료", cls: "or-a" },
    B: { label: "Ⓑ 원본틀 필요", cls: "or-b" },
    tbd: { label: "⏳ 미정", cls: "or-tbd" },
  })[o] || { label: esc(o || "–"), cls: "or-tbd" };
}

function verifyCell(v, d) {
  const date = d ? ` ${esc(d)}` : "";
  return ({
    new: { label: `✅ 새방식${date}`, cls: "vf-new" },
    legacy: { label: `🟡 옛방식${date}`, cls: "vf-legacy" },
    none: { label: "🔴 미검증", cls: "vf-none" },
    na: { label: "– 불필요", cls: "vf-na" },
  })[v] || { label: "–", cls: "vf-na" };
}

function darkCell(dk) {
  return ({
    stable: { label: "stable", cls: "dk-ok" },
    candidate: { label: "candidate", cls: "dk-mid" },
    pending: { label: "pending", cls: "dk-early" },
  })[dk] || { label: dk ? esc(dk) : "–", cls: "dk-early" };
}

const dateCell = (v) => v ? `<span class="dt">${esc(v)}</span>` : `<span class="dt-empty">– 도장 필요</span>`;
const srcCell = (v) => v ? `<span class="src">${esc(v)}</span>` : `<span class="dt-empty">미지정</span>`;

function row(entry, kind) {
  const reg = readRegistry(entry, kind);
  const label = entry.label || reg.name || entry.id;
  const st = stageCell(reg);
  const or = originCell(entry.origin);
  const vf = verifyCell(entry.verify, entry.verifyDate);
  const dk = darkCell(reg.dark);
  const d = entry.dates || {};
  return `
        <tr>
          <td class="c-name">${esc(label)}<span class="c-id">${esc(entry.id)}</span></td>
          <td><span class="pill ${or.cls}">${or.label}</span></td>
          <td><span class="pill ${st.cls}">${st.label}</span></td>
          <td><span class="pill ${vf.cls}">${vf.label}</span></td>
          <td>${srcCell(entry.sourceNode)}</td>
          <td>${dateCell(d.installer)}</td>
          <td>${dateCell(d.tokens)}</td>
          <td>${dateCell(d.html)}</td>
          <td><span class="pill ${dk.cls}">${dk.label}</span></td>
          <td class="c-note">${esc(entry.note)}</td>
        </tr>`;
}

const thead = `
        <thead><tr>
          <th>컴포넌트</th><th>분류</th><th>진행</th><th>원본 대조</th><th>원본 노드</th>
          <th>설치기</th><th>tokens.css</th><th>HTML</th><th>다크</th><th>비고</th>
        </tr></thead>`;

const compRows = data.components.map((e) => row(e, "components")).join("");
const patRows = data.patterns.map((e) => row(e, "patterns")).join("");

const counts = (arr) => {
  const c = { A: 0, B: 0, tbd: 0 };
  arr.forEach((e) => { c[e.origin] = (c[e.origin] || 0) + 1; });
  return c;
};
const cc = counts(data.components);

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script>!function(){var z=localStorage.getItem("sw-ds-zoom");if(z)document.documentElement.style.zoom=z+"%"}();</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>업데이트 관리 — S1 UX DESIGN GUIDE</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <!-- 이 페이지는 scripts/gen-update-management.js 가 registry/governance/update-management.json 으로 자동 생성. 손편집 금지. -->
  <style>
    .um-legend { display:flex; flex-wrap:wrap; gap:10px 18px; padding:14px 18px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:24px; font-size:12px; color:#4b5563; }
    .um-legend b { color:#111827; }
    .um-section { margin-bottom:40px; }
    .um-section-head h2 { font-size:18px; font-weight:700; color:#111827; margin:0 0 4px; }
    .um-section-head p { font-size:13px; color:#6b7280; margin:0 0 14px; }
    .um-table-wrap { overflow-x:auto; border:1px solid #e5e7eb; border-radius:12px; }
    table.um { border-collapse:collapse; width:100%; font-size:13px; min-width:980px; background:#fff; }
    table.um th { text-align:left; font-size:12px; font-weight:700; color:#6b7280; background:#f9fafb; padding:11px 12px; border-bottom:1px solid #e5e7eb; white-space:nowrap; }
    table.um td { padding:11px 12px; border-bottom:1px solid #f3f4f6; vertical-align:top; }
    table.um tr:last-child td { border-bottom:none; }
    .c-name { font-weight:700; color:#111827; white-space:nowrap; }
    .c-id { display:block; font-weight:400; font-size:11px; color:#9ca3af; margin-top:2px; }
    .c-note { color:#4b5563; line-height:1.5; min-width:200px; }
    .pill { display:inline-block; font-size:11px; font-weight:600; padding:2px 9px; border-radius:20px; white-space:nowrap; }
    .or-a { background:#dbeafe; color:#1e40af; }
    .or-b { background:#fef3c7; color:#92400e; }
    .or-tbd { background:#f3f4f6; color:#6b7280; }
    .st-early { background:#fee2e2; color:#991b1b; }
    .st-mid { background:#fef9c3; color:#854d0e; }
    .st-ok { background:#d1fae5; color:#065f46; }
    .vf-new { background:#d1fae5; color:#065f46; }
    .vf-legacy { background:#fef9c3; color:#854d0e; }
    .vf-none { background:#fee2e2; color:#991b1b; }
    .vf-na { background:#f3f4f6; color:#9ca3af; }
    .dk-ok { background:#d1fae5; color:#065f46; }
    .dk-mid { background:#fef9c3; color:#854d0e; }
    .dk-early { background:#f3f4f6; color:#6b7280; }
    .dt { font-variant-numeric:tabular-nums; color:#374151; }
    .dt-empty { font-size:11px; color:#cbd5e1; }
    .src { font-size:12px; color:#374151; }
    .um-foot { font-size:12px; color:#9ca3af; margin-top:8px; padding-top:20px; border-top:1px solid #f3f4f6; line-height:1.6; }
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
      <h1 class="page-title">🗂 업데이트 관리</h1>
      <p class="page-desc">컴포넌트·패턴이 어디까지 됐고, 어느 표면에 언제 반영됐는지 한눈에 봅니다. 분류(Ⓐ/Ⓑ)가 재발방지 게이트의 기준이 됩니다.</p>
    </div>

    <div class="page-content">
      <div class="um-legend">
        <span><b>Ⓐ 정리완료</b> 원본 대조 불필요 (${cc.A})</span>
        <span><b>Ⓑ 원본틀 필요</b> 원본에서 틀 가져와 최신으로 갈이 (${cc.B})</span>
        <span><b>⏳ 미정</b> 분류 결정 필요 (${cc.tbd})</span>
        <span>· 원본 대조: <b>✅ 새방식</b>(원본 재측정) / <b>🟡 옛방식</b>(메모 대조·재확인 권장) / <b>🔴 미검증</b></span>
        <span>· 날짜 = 그 표면을 실제로 갱신한 <b>수동 도장</b>(빈 칸 = 도장 필요)</span>
      </div>

      <div class="um-section">
        <div class="um-section-head">
          <h2>🧩 컴포넌트 (${data.components.length})</h2>
          <p>코어 컴포넌트. Ⓑ·미정 중 '미검증'이 탭처럼 원본과 어긋나 있을 수 있는 항목입니다.</p>
        </div>
        <div class="um-table-wrap">
          <table class="um">${thead}
            <tbody>${compRows}
            </tbody>
          </table>
        </div>
      </div>

      <div class="um-section">
        <div class="um-section-head">
          <h2>📐 패턴 (${data.patterns.length})</h2>
          <p>코어 컴포넌트를 조합한 반복 레이아웃. components 와 분리 관리합니다.</p>
        </div>
        <div class="um-table-wrap">
          <table class="um">${thead}
            <tbody>${patRows}
            </tbody>
          </table>
        </div>
      </div>

      <div class="um-foot">
        이 화면은 손으로 쓴 게 아니라 <b>자동으로 만들어집니다.</b> 분류·날짜·비고는 <code>registry/governance/update-management.json</code> 만 고치고 <code>npm run update:gen</code> 하면 갱신됩니다. 진행 단계·다크는 각 컴포넌트 registry 에서 자동으로 읽어옵니다.<br>
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
console.log(`✅ update-management.html 생성 — 컴포넌트 ${data.components.length}개(Ⓐ${cc.A}·Ⓑ${cc.B}·미정${cc.tbd}) · 패턴 ${data.patterns.length}개 (${stamp})`);
