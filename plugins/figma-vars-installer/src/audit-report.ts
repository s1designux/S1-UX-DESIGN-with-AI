/**
 * audit-report.ts — GUI 검수 결과 리포트 (캔버스 프레임 산출물)
 *
 * 검수 결과(색상 이슈 · 가이드 외 색 · 레거시 컴포넌트 교체 후보)를 디자이너 파일 안에
 * "검수 결과서" 프레임으로 생성한다. 팀 공유·이력 보관용.
 *
 * 주의: 이 프레임은 디자이너 파일에 생성되는 "결과 문서" 산출물이지 라이브러리 컴포넌트가 아니다.
 *   따라서 크롬 색은 리포트 표기용 하드코딩(위반=빨강 등)을 사용한다. (use_figma MCP 빌드가 아님)
 */

import type { Issue, SwapCandidate } from "./audit-engine";

type ReportInput = {
  issues: Issue[];
  swapCandidates: SwapCandidate[];
  stats: { scanned: number; issuesCount: number; highCount: number };
  fileName?: string;
  when?: string; // 검수 일시 (UI에서 전달)
};

type ReportCounts = { hex: number; extVar: number; offGuide: number; legacy: number };

// 리포트 표기용 색 (문서 크롬 — 컴포넌트 토큰 아님)
const C = {
  ink: "#111827",
  muted: "#6B7280",
  faint: "#9CA3AF",
  line: "#E5E7EB",
  panel: "#F9FAFB",
  white: "#FFFFFF",
  danger: "#C0362C",
  dangerBg: "#FFF1F0",
  warn: "#B45309",
  warnBg: "#FFF7ED",
  ok: "#166534",
  okBg: "#F0FDF4",
};

function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  const h = (hex || "#000000").replace("#", "");
  const s = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(s.slice(0, 2), 16) / 255;
  const g = parseInt(s.slice(2, 4), 16) / 255;
  const b = parseInt(s.slice(4, 6), 16) / 255;
  return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b };
}

function solid(hex: string): SolidPaint {
  return { type: "SOLID", color: hexToRgb01(hex) };
}

// 폰트 로드 — 정본 Pretendard 우선, 없으면 Inter/Roboto 폴백
async function loadFonts(): Promise<{ reg: FontName; bold: FontName }> {
  const tryLoad = async (cands: FontName[]): Promise<FontName> => {
    for (const f of cands) {
      try { await figma.loadFontAsync(f); return f; } catch { /* 다음 후보 */ }
    }
    const fb: FontName = { family: "Inter", style: "Regular" };
    await figma.loadFontAsync(fb);
    return fb;
  };
  const reg = await tryLoad([
    { family: "Pretendard", style: "Regular" },
    { family: "Inter", style: "Regular" },
    { family: "Roboto", style: "Regular" },
  ]);
  const bold = await tryLoad([
    { family: "Pretendard", style: "Bold" },
    { family: "Pretendard", style: "SemiBold" },
    { family: "Inter", style: "Bold" },
    { family: "Roboto", style: "Bold" },
  ]);
  return { reg, bold };
}

let F: { reg: FontName; bold: FontName };

function text(chars: string, size: number, color: string, bold = false): TextNode {
  const t = figma.createText();
  t.fontName = bold ? F.bold : F.reg;
  t.characters = chars;
  t.fontSize = size;
  t.fills = [solid(color)];
  return t;
}

// 세로 auto-layout 컨테이너
function vbox(spacing: number, pad = 0): FrameNode {
  const f = figma.createFrame();
  f.layoutMode = "VERTICAL";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.itemSpacing = spacing;
  f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = pad;
  f.fills = [];
  return f;
}

// 가로 auto-layout 컨테이너
function hbox(spacing: number): FrameNode {
  const f = figma.createFrame();
  f.layoutMode = "HORIZONTAL";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.counterAxisAlignItems = "CENTER";
  f.itemSpacing = spacing;
  f.fills = [];
  return f;
}

// 작은 색 스와치 (원본 hex 그대로 — 검수 대상 색을 그대로 보여줌)
function swatch(hex: string): FrameNode {
  const s = figma.createFrame();
  s.resize(16, 16);
  s.cornerRadius = 4;
  s.fills = [solid(hex)];
  s.strokes = [solid(C.line)];
  s.strokeWeight = 1;
  s.layoutMode = "NONE";
  return s;
}

// 뱃지 (라벨 pill)
function badge(label: string, fg: string, bg: string): FrameNode {
  const b = hbox(0);
  b.paddingLeft = b.paddingRight = 7;
  b.paddingTop = b.paddingBottom = 2;
  b.cornerRadius = 10;
  b.fills = [solid(bg)];
  b.appendChild(text(label, 10, fg, true));
  return b;
}

// 섹션(제목 + 행들) 카드
function section(title: string, count: number, accentFg: string, accentBg: string, rows: FrameNode[]): FrameNode {
  const card = vbox(8, 14);
  card.counterAxisSizingMode = "FIXED";
  card.resize(532, 10);
  card.cornerRadius = 10;
  card.fills = [solid(C.white)];
  card.strokes = [solid(C.line)];
  card.strokeWeight = 1;
  card.primaryAxisSizingMode = "AUTO";

  const head = hbox(8);
  head.appendChild(text(title, 13, C.ink, true));
  head.appendChild(badge(`${count}건`, accentFg, accentBg));
  card.appendChild(head);

  if (rows.length === 0) {
    card.appendChild(text("발견된 항목 없음 ✓", 11.5, C.ok));
  } else {
    for (const r of rows) card.appendChild(r);
  }
  return card;
}

// 색상 이슈 행 (HEX 직접 · 가이드 외 공용)
function colorRow(issue: Issue, offGuide: boolean): FrameNode {
  const row = vbox(3, 10);
  row.counterAxisSizingMode = "FIXED";
  row.resize(504, 10);
  row.cornerRadius = 8;
  row.fills = [solid(offGuide ? C.dangerBg : C.panel)];
  row.primaryAxisSizingMode = "AUTO";

  const top = hbox(8);
  top.appendChild(swatch(issue.hex));
  top.appendChild(text(issue.nodeName || "(이름 없음)", 12, C.ink, true));
  top.appendChild(text(issue.hex, 11, C.muted));
  row.appendChild(top);

  if (offGuide) {
    row.appendChild(text(`가이드에 없는 색 · 최근접 팔레트와 Δ${Math.round(issue.nearestDistance)} — 디자인 결정 필요`, 11, C.danger));
  } else {
    if (issue.reasonKind === "external-var") row.appendChild(text(`외부 변수 연결: ${issue.sourceLabel}`, 11, C.warn));
    const best = issue.suggestions && issue.suggestions[0];
    if (best) row.appendChild(text(`제안: ${best.variableName}`, 11, C.muted));
    else row.appendChild(text("제안 토큰 없음", 11, C.faint));
  }
  return row;
}

// 레거시 컴포넌트 교체 후보 행
function swapRow(c: SwapCandidate): FrameNode {
  const row = vbox(3, 10);
  row.counterAxisSizingMode = "FIXED";
  row.resize(504, 10);
  row.cornerRadius = 8;
  row.fills = [solid(C.panel)];
  row.primaryAxisSizingMode = "AUTO";
  row.appendChild(text(c.instanceName || c.currentMainName, 12, C.ink, true));
  row.appendChild(text(`${c.currentMainName}  →  ${c.suggestedName}`, 11, C.warn));
  return row;
}

/** 검수 결과 리포트 프레임을 현재 페이지에 생성하고 frameId 반환. */
export async function buildAuditReport(input: ReportInput): Promise<{ frameId: string; counts: ReportCounts }> {
  F = await loadFonts();

  const hexIssues = input.issues.filter((i) => !i.offGuide && i.reasonKind === "unbound-hex");
  const extVarIssues = input.issues.filter((i) => !i.offGuide && i.reasonKind === "external-var");
  const offGuideIssues = input.issues.filter((i) => i.offGuide);
  const swaps = input.swapCandidates || [];
  const counts: ReportCounts = { hex: hexIssues.length, extVar: extVarIssues.length, offGuide: offGuideIssues.length, legacy: swaps.length };

  const root = vbox(14, 24);
  root.name = "GUI 검수 리포트";
  root.counterAxisSizingMode = "FIXED";
  root.resize(580, 100);
  root.cornerRadius = 16;
  root.fills = [solid(C.white)];
  root.strokes = [solid(C.line)];
  root.strokeWeight = 1;
  root.primaryAxisSizingMode = "AUTO";

  // 헤더
  const header = vbox(4);
  header.appendChild(text("GUI 검수 결과서", 18, C.ink, true));
  const sub = `${input.fileName || figma.root.name || "(파일)"}${input.when ? " · " + input.when : ""}`;
  header.appendChild(text(sub, 11, C.faint));
  root.appendChild(header);

  // 요약
  const summary = hbox(16);
  summary.counterAxisSizingMode = "FIXED";
  summary.resize(532, 10);
  summary.primaryAxisSizingMode = "AUTO";
  summary.paddingTop = summary.paddingBottom = 12;
  summary.paddingLeft = summary.paddingRight = 14;
  summary.cornerRadius = 10;
  summary.fills = [solid(C.panel)];
  const totalViol = counts.hex + counts.extVar + counts.offGuide + counts.legacy;
  summary.appendChild(text(`검사 노드 ${input.stats.scanned}`, 11.5, C.muted));
  summary.appendChild(text(`위반 ${totalViol}건`, 11.5, totalViol > 0 ? C.danger : C.ok, true));
  summary.appendChild(text(`HEX ${counts.hex} · 외부변수 ${counts.extVar} · 가이드외 ${counts.offGuide} · 레거시 ${counts.legacy}`, 11.5, C.muted));
  root.appendChild(summary);

  // 4 섹션
  root.appendChild(section("HEX 직접 사용", counts.hex, C.danger, C.dangerBg, hexIssues.slice(0, 200).map((i) => colorRow(i, false))));
  root.appendChild(section("외부(레거시) 변수 연결", counts.extVar, C.warn, C.warnBg, extVarIssues.slice(0, 200).map((i) => colorRow(i, false))));
  root.appendChild(section("가이드 외 색상", counts.offGuide, C.danger, C.dangerBg, offGuideIssues.slice(0, 200).map((i) => colorRow(i, true))));
  root.appendChild(section("레거시 컴포넌트", counts.legacy, C.warn, C.warnBg, swaps.slice(0, 200).map((c) => swapRow(c))));

  // 배치: 뷰포트 중앙
  const vp = figma.viewport.center;
  root.x = Math.round(vp.x - root.width / 2);
  root.y = Math.round(vp.y - 100);

  figma.currentPage.appendChild(root);
  return { frameId: root.id, counts };
}
