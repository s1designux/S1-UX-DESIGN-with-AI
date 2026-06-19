#!/usr/bin/env node
/**
 * Installer UI 빌드 스탬프
 * ─────────────────────────────────────────────────────────────────────────
 * 설치 플러그인 ui.html 의 {{BUILD_TIME}} 플레이스홀더를 빌드 시점(KST) 으로 치환해
 * dist 로 출력한다. installer:build 에서 `cp ui.html` 대신 호출한다.
 *   → 사용자가 플러그인 헤더에서 "이 설치 패키지가 언제 빌드됐는지" 일자+시간을 본다.
 *
 * 사용: node scripts/stamp-installer-ui.js [out-ui-path]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "plugins/figma-vars-installer/src/ui.html");
const OUT = process.argv[2] || path.join(ROOT, "plugins/figma-vars-installer/dist/s1-design-system-installer/ui.html");

// KST "YYYY-MM-DD HH:MM" (sv-SE 로케일 = ISO 유사 포맷)
const stamp = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
}).format(new Date());
const label = `${stamp} KST`;
const dateStamp = stamp.split(" ")[0]; // "YYYY-MM-DD" — 날짜만(빌드일)

let html = fs.readFileSync(SRC, "utf8");
if (!html.includes("{{BUILD_TIME}}")) {
  console.warn("[installer] ⚠️  ui.html 에 {{BUILD_TIME}} 플레이스홀더가 없습니다 — 스탬프 생략");
}
html = html.replace(/\{\{BUILD_TIME\}\}/g, label);
html = html.replace(/\{\{BUILD_DATE\}\}/g, dateStamp); // 빌드일(자동) — "계속 추가 중" 행이 스테일되지 않게

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`[installer] ui.html 빌드 스탬프 = ${label} → ${path.relative(ROOT, OUT)}`);
