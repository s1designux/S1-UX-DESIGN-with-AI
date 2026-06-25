#!/usr/bin/env node
/**
 * 업데이트 관리 생성기 (gen-update-management.js)
 * ─────────────────────────────────────────────────────────────────────────
 * 컴포넌트·패턴별 진행 상태와 각 표면(Figma 설치기·tokens.css·HTML 가이드) 반영일을
 * 한눈에 보여주는 관리 페이지를 생성한다.
 *
 * 연동(2026-06-25): 컴포넌트 "목록·순서·부모자식"은 손으로 적지 않고 **설치기 정본**
 *   (build-components.ts 의 COMPONENT_CATEGORIES_GRID + BUILD_DEPENDENCIES)에서 자동으로 읽는다.
 *   → 설치기에 컴포넌트가 추가/재배치되면 이 표가 자동으로 따라가고, 관리표에 없는 부품은
 *      "확인 필요"로 떠서 빠뜨릴 수 없다. 표는 설치기 섹션(Platform·Navigation…)별로 묶이고
 *      내부 요소 컴포넌트(달력 셀·드롭다운 목록 등)는 메인 아래로 들여쓰기된다.
 *
 *  - 정본(수동 필드: 분류·원본노드·날짜도장·비고·검증·모바일) = registry/governance/update-management.json
 *  - 자동 필드(진행 단계·다크) = registry/components|patterns/{id}.json 에서 읽어 합친다.
 *  - 목록·순서·부모자식(자동) = plugins/figma-vars-installer/src/build-components.ts (설치기 정본)
 *
 * 사용: node scripts/gen-update-management.js   (또는 npm run update:gen)
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "registry/governance/update-management.json");
const BC = path.join(ROOT, "plugins/figma-vars-installer/src/build-components.ts");
const OUT = path.join(ROOT, "pages/update-management.html");

const data = JSON.parse(fs.readFileSync(DATA, "utf8"));
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

// ── 설치기 정본에서 목록·순서·부모자식 읽기 (연동) ──────────────────────────
function loadInstaller() {
  const esbuild = require("esbuild");
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: "cjs", platform: "node", write: false });
  const tmp = path.join(os.tmpdir(), `bc-um-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  // 최상위에서 figma 를 건드려도 죽지 않게 만능 stub (export const 만 읽으면 됨)
  const stub = new Proxy(function () { return stub; }, { get: () => stub, apply: () => stub });
  global.figma = stub;
  let mod;
  try { delete require.cache[tmp]; mod = require(tmp); }
  finally { try { fs.unlinkSync(tmp); } catch (_) { /* noop */ } }
  return { grid: mod.COMPONENT_CATEGORIES_GRID || [], deps: mod.BUILD_DEPENDENCIES || {} };
}
const { grid, deps } = loadInstaller();
const categories = grid.flat(); // [{ name, members:[...] }, ...] — 설치기 표시 순서

// member → category 이름
const memberCat = {};
for (const c of categories) for (const m of c.members) memberCat[m] = c.name;

// 부모맵(child→parent): ① BUILD_DEPENDENCIES 중 같은 카테고리 의존 ② 표시용 보완(달력·셀 등).
//   ②는 BUILD_DEPENDENCIES 에 없지만 화면에서 메인 하위로 보여야 하는 요소들(빌드 순서엔 영향 없음).
const DISPLAY_SUPPLEMENT = {
  "Date Picker": ["Calendar"],
  "Calendar": ["Calendar Cell", "Calendar Tile"],
  "Table": ["Table Cell"],
  "Time Picker Dropdown": ["Time Picker Cell"],
};
const childToParent = {};
const addDeps = (map, intraOnly) => {
  for (const parent of Object.keys(map)) {
    for (const k of map[parent]) {
      if (intraOnly && memberCat[parent] !== memberCat[k]) continue; // 카테고리 다르면 표시 부모 아님
      if (!childToParent[k]) childToParent[k] = parent;
    }
  }
};
addDeps(deps, true);
addDeps(DISPLAY_SUPPLEMENT, false);
const depthOf = (m) => {
  let d = 0, x = m; const seen = new Set();
  while (childToParent[x] && !seen.has(x)) { seen.add(x); x = childToParent[x]; d++; }
  return d;
};

// 관리표 entry(id) ↔ 설치기 member 이름 연결 (단일 연결 지점).
//   새 설치기 컴포넌트를 표에 넣으려면: 여기 한 줄 + update-management.json 에 같은 id entry 추가.
const ID_TO_MEMBER = {
  tab: "Line Tab", gnb: "GNB", pagination: "Pagination", button: "Button",
  checkbox: "Checkbox", radio: "Radio", toggle: "Toggle", chip: "Chip",
  input: "Input", textarea: "Text Area", dropdown: "Dropdown", select: "Select Box",
  "date-picker": "Date Picker", "time-picker": "Time Picker", table: "Table",
};
const memberToEntry = {};
for (const e of data.components) { const mem = ID_TO_MEMBER[e.id]; if (mem) memberToEntry[mem] = e; }
const mappedMembers = new Set(Object.values(ID_TO_MEMBER));
// 설치기엔 없지만 관리 중인 컴포넌트(예: nav) = extras
const extras = data.components.filter((e) => !ID_TO_MEMBER[e.id]);

// ── registry 에서 자동 필드(진행 단계·다크) 읽기 ────────────────────────────
function readRegistry(entry, kind) {
  const candidates = [];
  if (entry.registryPath) candidates.push(path.join(ROOT, entry.registryPath));
  if (entry.id) candidates.push(path.join(ROOT, `registry/${kind}/${entry.id}.json`));
  for (const p of candidates) {
    try {
      const m = JSON.parse(fs.readFileSync(p, "utf8"))._meta || {};
      return { code: m.codeStatus, harness: m.harnessStatus, dark: m.darkModeStatus, name: m.name };
    } catch (_) { /* 없으면 다음 후보 */ }
  }
  return {};
}

// 진행 단계: codeStatus(+harness=skeleton) → 한국어 라벨 + 색
function stageCell(reg, placeholder) {
  if (placeholder && !reg.code && !reg.harness) return { label: "미등록", cls: "st-early" };
  const code = reg.code || "–";
  if (reg.harness === "skeleton" || code === "not-started")
    return { label: reg.harness === "skeleton" ? "골격" : "미착수", cls: "st-early" };
  const map = {
    "in-progress": { label: "진행중", cls: "st-mid" },
    "preview": { label: "미리보기", cls: "st-mid" },
    "implemented": { label: "구현", cls: "st-ok" },
    "done": { label: "완료", cls: "st-ok" },
  };
  return map[code] || { label: code === "–" ? "–" : esc(code), cls: code === "–" ? "st-na" : "st-mid" };
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
function mobileCell(v) {
  if (!v || v === "na" || v === "-") return `<span class="dt-empty">–</span>`;
  const s = String(v);
  const cls = /완료/.test(s) ? "st-ok" : /진행|필요|예정/.test(s) ? "st-mid" : "st-early";
  return `<span class="pill ${cls}">${esc(s)}</span>`;
}
const dateCell = (v) => v ? `<span class="dt">${esc(v)}</span>` : `<span class="dt-empty">– 도장 필요</span>`;
const srcCell = (v) => v ? `<span class="src">${esc(v)}</span>` : `<span class="dt-empty">미지정</span>`;

// 컴포넌트 행. opts = { displayName, depth, placeholder }
function compRow(entry, opts) {
  const o = opts || {};
  const reg = readRegistry(entry, "components");
  const name = o.displayName || reg.name || entry.id;
  const st = stageCell(reg, o.placeholder);
  const or = originCell(entry.origin);
  const vf = verifyCell(entry.verify, entry.verifyDate);
  const dk = o.placeholder ? { label: "–", cls: "dk-early" } : darkCell(reg.dark);
  const d = entry.dates || {};
  const depth = o.depth || 0;
  const indent = 12 + depth * 20;
  const arrow = depth > 0 ? `<span class="c-sub-arrow">↳</span>` : "";
  const idTag = entry.id ? `<span class="c-id">${esc(entry.id)}</span>` : "";
  const rowCls = (o.placeholder ? " is-placeholder" : "") + (depth > 0 ? " is-sub" : "");
  return `
        <tr class="comp-row${rowCls}">
          <td class="c-name" style="padding-left:${indent}px">${arrow}${esc(name)}${idTag}</td>
          <td><span class="pill ${or.cls}">${or.label}</span></td>
          <td><span class="pill ${st.cls}">${st.label}</span></td>
          <td>${mobileCell(entry.mobile)}</td>
          <td><span class="pill ${vf.cls}">${vf.label}</span></td>
          <td>${srcCell(entry.sourceNode)}</td>
          <td>${dateCell(d.installer)}</td>
          <td>${dateCell(d.tokens)}</td>
          <td>${dateCell(d.html)}</td>
          <td><span class="pill ${dk.cls}">${dk.label}</span></td>
          <td class="c-note">${esc(entry.note)}</td>
        </tr>`;
}
const COMP_COLS = 11;
function catHeaderRow(name, n) {
  return `
        <tr class="cat-row"><td colspan="${COMP_COLS}"><span class="cat-name">${esc(name)}</span><span class="cat-count">${n}</span></td></tr>`;
}

// ── 설치기 순서대로 통합 표 본문 만들기 ─────────────────────────────────────
let unregistered = 0;
const bodyRows = categories.map((cat) => {
  const rows = cat.members.map((member) => {
    const entry = memberToEntry[member];
    if (entry) return compRow(entry, { displayName: member, depth: depthOf(member) });
    unregistered++;
    const ph = { id: "", origin: "tbd", verify: "none", dates: {}, mobile: "na",
      note: "설치기에 있으나 관리표 미등록 — 확인 필요" };
    return compRow(ph, { displayName: member, depth: depthOf(member), placeholder: true });
  }).join("");
  return catHeaderRow(cat.name, cat.members.length) + rows;
}).join("");

// extras (설치기 미빌드, 관리만 하는 컴포넌트)
const extraRows = extras.length
  ? catHeaderRow("설치기 외 (추가 관리 컴포넌트)", extras.length) +
    extras.map((e) => compRow(e, { displayName: e.id })).join("")
  : "";

// 패턴 표 (기존 유지)
function patRow(entry) {
  const reg = readRegistry(entry, "patterns");
  const name = entry.label || reg.name || entry.id;
  const st = stageCell(reg);
  const or = originCell(entry.origin);
  const vf = verifyCell(entry.verify, entry.verifyDate);
  const dk = darkCell(reg.dark);
  const d = entry.dates || {};
  return `
        <tr>
          <td class="c-name">${esc(name)}<span class="c-id">${esc(entry.id)}</span></td>
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
const patRows = data.patterns.map(patRow).join("");

const theadComp = `
        <thead><tr>
          <th>컴포넌트</th><th>분류</th><th>진행</th><th>모바일</th><th>원본 대조</th><th>원본 노드</th>
          <th>설치기</th><th>tokens.css</th><th>HTML</th><th>다크</th><th>비고</th>
        </tr></thead>`;
const theadPat = `
        <thead><tr>
          <th>패턴</th><th>분류</th><th>진행</th><th>원본 대조</th><th>원본 노드</th>
          <th>설치기</th><th>tokens.css</th><th>HTML</th><th>다크</th><th>비고</th>
        </tr></thead>`;

const counts = (arr) => {
  const c = { A: 0, B: 0, tbd: 0 };
  arr.forEach((e) => { c[e.origin] = (c[e.origin] || 0) + 1; });
  return c;
};
const cc = counts(data.components);
const totalInstaller = categories.reduce((s, c) => s + c.members.length, 0);

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <script>!function(){var z=localStorage.getItem("sw-ds-zoom");if(z)document.documentElement.style.zoom=z+"%"}();</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>업데이트 관리 — S1 UX DESIGN GUIDE</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <!-- 이 페이지는 scripts/gen-update-management.js 가 설치기(build-components.ts) + update-management.json 으로 자동 생성. 손편집 금지. -->
  <style>
    /* 이 페이지는 표가 넓어 콘텐츠 폭 제한(공통 1100px)을 풀어 옆 영역까지 사용 */
    .page-content { max-width: none; }
    .page-header-inner { max-width: none; }
    .um-legend { display:flex; flex-wrap:wrap; gap:10px 18px; padding:14px 18px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:24px; font-size:12px; color:#4b5563; }
    .um-legend b { color:#111827; }
    .um-section { margin-bottom:40px; }
    .um-section-head h2 { font-size:18px; font-weight:700; color:#111827; margin:0 0 4px; }
    .um-section-head p { font-size:13px; color:#6b7280; margin:0 0 14px; }
    .um-table-wrap { overflow-x:auto; border:1px solid #e5e7eb; border-radius:12px; }
    table.um { border-collapse:collapse; width:100%; font-size:13px; min-width:980px; background:#fff; }
    table.um th { text-align:left; font-size:12px; font-weight:700; color:#6b7280; background:#f9fafb; padding:11px 12px; border-bottom:1px solid #e5e7eb; white-space:nowrap; position:sticky; top:0; z-index:1; }
    table.um td { padding:10px 12px; border-bottom:1px solid #f3f4f6; vertical-align:top; }
    /* 섹션 대메뉴 행 */
    tr.cat-row td { background:#eef2f7; padding:8px 14px; border-bottom:1px solid #dbe2ea; }
    tr.cat-row .cat-name { font-size:12px; font-weight:800; color:#1e3a5f; letter-spacing:.04em; text-transform:uppercase; }
    tr.cat-row .cat-count { font-size:11px; font-weight:600; color:#7b8aa0; margin-left:8px; }
    .c-name { font-weight:700; color:#111827; white-space:nowrap; }
    .c-id { display:block; font-weight:400; font-size:11px; color:#9ca3af; margin-top:2px; }
    .c-sub-arrow { color:#9aa7bd; margin-right:6px; font-weight:400; }
    tr.is-sub .c-name { font-weight:500; color:#374151; }
    tr.is-placeholder { background:#fffdf5; }
    tr.is-placeholder .c-name { color:#926a00; }
    .c-note { color:#4b5563; line-height:1.5; min-width:200px; }
    .pill { display:inline-block; font-size:11px; font-weight:600; padding:2px 9px; border-radius:20px; white-space:nowrap; }
    .or-a { background:#dbeafe; color:#1e40af; }
    .or-b { background:#fef3c7; color:#92400e; }
    .or-tbd { background:#f3f4f6; color:#6b7280; }
    .st-early { background:#fee2e2; color:#991b1b; }
    .st-mid { background:#fef9c3; color:#854d0e; }
    .st-ok { background:#d1fae5; color:#065f46; }
    .st-na { background:#f3f4f6; color:#9ca3af; }
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
      <p class="page-desc">컴포넌트·패턴이 어디까지 됐고, 어느 표면에 언제 반영됐는지 한눈에 봅니다. 목록·순서는 <b>설치기와 자동 연동</b>됩니다(손으로 안 적음).</p>
    </div>

    <div class="page-content">
      <div class="um-legend">
        <span><b>Ⓐ 정리완료</b> 원본 대조 불필요 (${cc.A})</span>
        <span><b>Ⓑ 원본틀 필요</b> 원본에서 틀 가져와 최신으로 갈이 (${cc.B})</span>
        <span><b>⏳ 미정</b> 분류 결정 필요 (${cc.tbd})</span>
        <span>· 들여쓴 <b>↳ 행</b> = 메인 컴포넌트의 내부 요소</span>
        <span>· 노란 <b>미등록</b> 행 = 설치기엔 있는데 관리표에 아직 안 들어온 것</span>
      </div>

      <div class="um-section">
        <div class="um-section-head">
          <h2>🧩 컴포넌트 — 설치기 순서 (${totalInstaller})</h2>
          <p>설치기가 까는 순서·묶음 그대로. 섹션(대메뉴)별로 묶여 있고, 내부 요소는 메인 아래로 들여썼습니다. 설치기가 바뀌면 자동으로 따라갑니다.</p>
        </div>
        <div class="um-table-wrap">
          <table class="um">${theadComp}
            <tbody>${bodyRows}${extraRows}
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
          <table class="um">${theadPat}
            <tbody>${patRows}
            </tbody>
          </table>
        </div>
      </div>

      <div class="um-foot">
        이 화면은 손으로 쓴 게 아니라 <b>자동으로 만들어집니다.</b> 컴포넌트 목록·순서·부모자식은 <b>설치기(build-components.ts)</b>에서 자동으로 읽고, 분류·날짜·비고는 <code>registry/governance/update-management.json</code> 을 고친 뒤 <code>npm run update:gen</code> 하면 갱신됩니다.<br>
        설치기 부품 ${totalInstaller}개 · 미등록(확인 필요) ${unregistered}개 · 패턴 ${data.patterns.length}개 · 마지막 생성: ${esc(stamp)}
      </div>
    </div>
  </main>
</div>
<script src="../assets/js/main.js"></script>
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log(`✅ update-management.html 생성 — 설치기 부품 ${totalInstaller}개(미등록 ${unregistered}) · extras ${extras.length} · 패턴 ${data.patterns.length}개 (${stamp})`);
