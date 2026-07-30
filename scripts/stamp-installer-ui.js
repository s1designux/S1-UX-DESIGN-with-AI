#!/usr/bin/env node
/**
 * Installer UI 빌드 스탬프
 * ─────────────────────────────────────────────────────────────────────────
 * 설치 플러그인 ui.html 의 플레이스홀더를 빌드 시점 값으로 치환해 dist 로 출력한다.
 * installer:build 에서 `cp ui.html` 대신 호출한다.
 *
 * 치환 대상:
 *   {{BUILD_TIME}}      빌드 시각(KST, 분까지) — 헤더 "업데이트"
 *   {{BUILD_DATE}}      빌드 일자(YYYY-MM-DD)  — Component Set 카드 "최신 업데이트"
 *   {{COMPONENT_COUNT}} 코어 컴포넌트 개수     — Component Set 카드 본문
 *
 * 사용: node scripts/stamp-installer-ui.js [out-ui-path]
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "plugins/figma-vars-installer/src/ui.html");
const BUILD_COMPONENTS = path.join(ROOT, "plugins/figma-vars-installer/src/build-components.ts");
const OUT = process.argv[2] || path.join(ROOT, "plugins/figma-vars-installer/dist/s1-design-system-installer/ui.html");

/**
 * 코어 컴포넌트 개수를 **정본에서 파생**한다 — build-components.ts 의 COMPONENT_CATEGORIES_GRID.
 *
 * 왜 파생인가: 종전 ui.html 은 컴포넌트 이름을 손으로 나열했는데, 컴포넌트가 늘어도 안 따라와
 *   32개(나열) vs 42개(정본)로 조용히 벌어져 있었다. 숫자를 하드코딩하면 같은 드리프트가 반복된다.
 *
 * 방식: esbuild 로 번들 → 임시 .cjs 로 require. scripts/component-page-coverage-check.js 와 동일 패턴
 *   (build-components.ts 가 모듈 로드 중 figma 전역을 건드릴 수 있어 Proxy 스텁을 심는다).
 *
 * 실패(0건·예외)는 **조용히 넘어가지 않고 던진다** — 빌드가 멈추는 편이 틀린 숫자가 배포되는 것보다 낫다.
 */
function componentCount() {
  const esbuild = require("esbuild");
  const out = esbuild.buildSync({
    entryPoints: [BUILD_COMPONENTS], bundle: true, format: "cjs", platform: "node", write: false,
  });
  const tmp = path.join(os.tmpdir(), `bc-uicount-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  global.figma = new Proxy(function () {}, { get: () => global.figma, apply: () => global.figma });
  let mod;
  try { delete require.cache[tmp]; mod = require(tmp); }
  finally { try { fs.unlinkSync(tmp); } catch (_) { /* skip */ } }

  const grid = mod.COMPONENT_CATEGORIES || [];
  let n = 0;
  for (const cat of grid) n += (cat.members || []).length;
  if (n === 0) {
    throw new Error(
      "[installer] COMPONENT_CATEGORIES 에서 컴포넌트 개수를 얻지 못했습니다(0건). " +
      "build-components.ts 의 export 구조 변경 의심 — ui.html 스탬프 중단."
    );
  }
  return n;
}

// KST "YYYY-MM-DD HH:MM" (sv-SE 로케일 = ISO 유사 포맷)
const stamp = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
}).format(new Date());
const label = `${stamp} KST`;
const dateStamp = stamp.split(" ")[0]; // "YYYY-MM-DD" — 날짜만(빌드일)

const count = componentCount();   // 실패 시 여기서 던짐(빌드 중단)

// "이번 업데이트" 툴팁 + 카드 4개 날짜는 정본 지문 diff 에서 파생한다(아래 run()).
//   실패는 던진다 — 툴팁이 조용히 비거나 낡은 채 배포되는 것보다 빌드가 멈추는 편이 낫다.

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 치환 대상 — 하나라도 없으면 던진다(조용한 누락 금지). */
function replaceAll(html, map) {
  const missing = [];
  for (const key of Object.keys(map)) {
    if (!html.includes(`{{${key}}}`)) missing.push(key);
  }
  if (missing.length) {
    throw new Error(
      `[installer] ui.html 에 플레이스홀더가 없습니다: ${missing.map((k) => `{{${k}}}`).join(", ")}\n` +
      "  → 손으로 지웠거나 다른 세션이 덮어썼을 수 있습니다. ui.html 을 확인하세요."
    );
  }
  let out = html;
  for (const [key, val] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
  }
  return out;
}

async function run() {
  const { build } = require("./installer-update-notes");
  const notes = await build();   // 실패 시 던짐

  let html = fs.readFileSync(SRC, "utf8");
  html = replaceAll(html, {
    BUILD_TIME: label,
    COMPONENT_COUNT: String(count),
    UPDATE_DATE: htmlEscape(notes.date),
    UPDATE_NOTES: notes.lines.map(htmlEscape).join("<br>\n      "),
    FOUNDATION_DATE: htmlEscape(notes.dates.foundation),
    SEMANTIC_DATE: htmlEscape(notes.dates.semantic),
    TEXTSTYLES_DATE: htmlEscape(notes.dates.textStyles),
    COMPONENTSET_DATE: htmlEscape(notes.dates.componentSet),
  });

  // 치환 후에도 {{…}} 가 남아 있으면 = 우리가 모르는 플레이스홀더. 배포 전에 잡는다.
  const leftover = html.match(/\{\{[A-Z_]+\}\}/g);
  if (leftover) {
    throw new Error(`[installer] 치환되지 않은 플레이스홀더가 남았습니다: ${[...new Set(leftover)].join(", ")}`);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log(`[installer] ui.html 빌드 스탬프 = ${label} · 컴포넌트 ${count}종 → ${path.relative(ROOT, OUT)}`);
  console.log(`[installer] 이번 업데이트 = ${notes.date} · ${notes.lines.length}줄 (앵커 ${(notes.anchor.sha || "").slice(0, 7)})`);
  console.log(`[installer] 카드 날짜 = F ${notes.dates.foundation} · S ${notes.dates.semantic} · T ${notes.dates.textStyles} · C ${notes.dates.componentSet}`);
}

run().catch((e) => { console.error(e.message); process.exit(1); });
