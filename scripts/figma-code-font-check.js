#!/usr/bin/env node
/**
 * Figma Code Font Guard (PreToolUse 집행 — L1 예방)
 * ─────────────────────────────────────────────────────────────────────────
 * use_figma 로 Figma 캔버스 텍스트에 쓰는 폰트는 정본(Pretendard)이어야 한다.
 * 비-Pretendard family(Noto Sans KR 등)를 fontName/loadFontAsync 에 쓰는 줄은
 * 줄 끝 `// figma-font-temp: <재바인딩 계획>` 마커가 있을 때만 통과(인지 강제).
 * 마커 없으면 도구 실행 직전(PreToolUse 훅)에 차단한다.
 *
 * 왜 필요한가 (도입 사유 2026-06-24):
 *   폰트는 '파일'이 아니라 'Figma 노드'에 있어 어떤 파일 게이트(1~15)·pre-commit 도
 *   닿지 못하는 사각지대다(hex 와 동일 계열 — figma-code-hex-check.js 전례).
 *   mobile_datepicker_bottomsheet 재구성 시 인스턴스 라벨을 덮어쓰며 Pretendard 가
 *   MCP 에서 로드 불가라 Noto 로 입력했는데 텍스트 스타일 재바인딩을 빠뜨려 3개
 *   라벨이 Noto 로 박혔다(토큰 게이트 전부 통과, 사용자가 Desktop 에서 발견).
 *
 * 한계 (정직하게):
 *   이 훅은 '예방'(authoring 시점 인지 강제)일 뿐, 런타임에 재바인딩이 실제로
 *   일어났는지는 정적 코드로 확인 불가(제어흐름·동적값). 진짜 보증은 L2 런타임
 *   스캔(figma-font-scan.md)을 component-verifier 가 실행하는 것이다. 마커는 면죄부 아님.
 *
 * 정본: registry/governance/figma-font-policy.json (canonicalFamily·tempAllowedFamilies·marker)
 * 입력: stdin 으로 use_figma 의 code 문자열. 또는 인자로 파일 경로(테스트용).
 * 종료코드: 위반 있으면 2(PreToolUse 차단), 없으면 0.
 */

const fs = require("fs");
const path = require("path");

// ── 정본 로드 (실패 시 안전 기본값) ──────────────────────────────────────
function loadPolicy() {
  try {
    const p = path.join(__dirname, "..", "registry", "governance", "figma-font-policy.json");
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return {
      canonical: j.canonicalFamily || "Pretendard",
      marker: j.marker || "figma-font-temp:",
    };
  } catch (e) {
    return { canonical: "Pretendard", marker: "figma-font-temp:" };
  }
}

// family: 'X' / family: "X" / family:`X` 추출 (fontName·loadFontAsync 컨텍스트)
const FAMILY_RE = /family\s*:\s*[`'"]([^`'"]+)[`'"]/g;
const FONT_CONTEXT = /\b(fontName|loadFontAsync)\b/;

function scan(code, policy) {
  const { canonical, marker } = policy;
  const violations = [];
  const allowed = [];
  code.split("\n").forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("//") || t.startsWith("*")) return; // 주석/문서 줄
    const codePart = line.replace(/\/\/.*$/, ""); // 줄 끝 라인주석 제거
    if (!FONT_CONTEXT.test(codePart)) return; // 폰트 세팅 컨텍스트 아님
    // 이 줄에서 비-canonical family 추출
    const fams = [];
    let m;
    FAMILY_RE.lastIndex = 0;
    while ((m = FAMILY_RE.exec(codePart)) !== null) {
      if (m[1] !== canonical) fams.push(m[1]);
    }
    if (fams.length === 0) return; // canonical 만 쓰거나 family 리터럴 없음
    const hasMarker = line.includes(marker);
    if (hasMarker) {
      allowed.push({ line: i + 1, fams, reason: (line.split(marker)[1] || "").trim() });
    } else {
      violations.push({ line: i + 1, fams, text: t.slice(0, 110) });
    }
  });
  return { violations, allowed };
}

module.exports = { scan, loadPolicy, FAMILY_RE, FONT_CONTEXT };

// ── CLI ─────────────────────────────────────────────────────────────────
if (require.main === module) {
  const policy = loadPolicy();
  function run(code) {
    if (!code || !code.trim()) process.exit(0); // 빈 입력(읽기 전용 호출) → 통과
    const { violations, allowed } = scan(code, policy);
    if (violations.length === 0) {
      if (allowed.length) {
        process.stderr.write(
          `🚧 Figma Font Guard ✅ — 비-${policy.canonical} 폰트 ${allowed.length}건은 figma-font-temp 마커로 명시(일시 로드 → 텍스트 스타일 재바인딩 필수). 최종 폰트는 L2 스캔으로 검증하세요.\n`
        );
      }
      process.exit(0);
    }
    const lines = [
      `🚧 Figma Font Guard 🔴 use_figma 차단 — 캔버스 텍스트 폰트는 ${policy.canonical} 정본이어야 합니다.`,
      `   비-${policy.canonical} 폰트를 fontName/loadFontAsync 에 사용했습니다:`,
    ];
    for (const v of violations) lines.push(`   ❌ L${v.line}: [${v.fams.join(", ")}]  ${v.text}`);
    lines.push("");
    lines.push(`   Pretendard 가 MCP 에서 로드 불가라 일시로 Noto 등을 써야 한다면:`);
    lines.push(`     1) 글자 입력 후 반드시 setTextStyleIdAsync 로 정본 텍스트 스타일 재바인딩(최종 ${policy.canonical} 복원)`);
    lines.push(`     2) 해당 줄 끝에 \`// ${policy.marker} <재바인딩할 스타일/계획>\` 마커 추가`);
    lines.push(`   주의: 마커는 인지용일 뿐, 최종 폰트는 L2 런타임 스캔(figma-font-scan.md)이 검증합니다.`);
    process.stderr.write(lines.join("\n") + "\n");
    process.exit(2);
  }

  const fileArg = process.argv[2];
  if (fileArg && fs.existsSync(fileArg)) {
    run(fs.readFileSync(fileArg, "utf8"));
  } else {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (buf += c));
    process.stdin.on("end", () => run(buf));
  }
}
