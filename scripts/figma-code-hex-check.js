#!/usr/bin/env node
/**
 * Figma Code Hex Guard (PreToolUse 집행)
 * ─────────────────────────────────────────────────────────────────────────
 * use_figma 로 Figma 에 그리는 모든 노드의 색은 **Variable 바인딩**이어야 한다.
 * hardcoded hex(`#RRGGBB`/`#RGB`)를 fill/stroke/색 계산에 쓰는 것을 **도구 실행 직전**
 * (PreToolUse 훅)에 차단한다.
 *
 * 왜 필요한가 (도입 사유 2026-06-22):
 *   기존 방어막(Gate 3·12·pre-commit)은 전부 "파일"을 검사한다. 그런데 use_figma 는
 *   파일을 거치지 않고 Figma 에 직접 쓰므로 어떤 파일 게이트·커밋 훅도 닿지 못하는
 *   사각지대다. "검토 프레임이니 라이브러리 빌드 아님"이라고 스스로 분류해 스킬/에이전트
 *   경로마저 건너뛰면 hex 가 그대로 샌다(Calendar Cell/Tile 검토 프레임에서 2회 유출).
 *   → use_figma 호출 코드 자체를 실행 전에 스캔해 hex 를 기계 차단한다.
 *   근거 정책: "검토용 프레임도 결국 라이브러리화되므로 처음부터 Variable 바인딩"(사용자 결정).
 *
 * 규칙:
 *   - 코드 안의 `#[0-9a-fA-F]{3 또는 6}` 색 리터럴이 있으면 위반.
 *   - 예외 (Gate 12 와 동일 철학):
 *       (a) 주석/문서 줄(`//` 또는 `*` 로 시작) — 설명용
 *       (b) hex 가 줄 끝 `//` 주석 안에만 있는 경우(코드부엔 없음)
 *       (c) 줄에 `// figma-hex-allow: <사유>` 마커가 있는 경우 — 검토 프레임의
 *           회색 배경·라벨 같은 순수 장식 크롬(컴포넌트 부품이 아님)에만 허용
 *   - 컴포넌트 부품(셀·타일·아이콘·텍스트 등)의 색은 마커로 우회하지 말고 Variable 바인딩.
 *
 * 입력: stdin 으로 use_figma 의 code 문자열(훅이 `jq -r '.tool_input.code'` 로 추출해 파이프).
 *       또는 인자로 파일 경로(테스트용).
 * 종료코드: 위반 있으면 2(PreToolUse 차단), 없으면 0.
 */

const fs = require("fs");

const HEX = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/;
const ALLOW = "figma-hex-allow:";

function scan(code) {
  const violations = [];
  const allowed = [];
  code.split("\n").forEach((line, i) => {
    const hasMarker = line.includes(ALLOW);
    const codePart = line.replace(/\/\/.*$/, ""); // 줄 끝 라인주석 제거(주석 안 hex 무시)
    const t = line.trim();
    if (hasMarker) {
      if (HEX.test(line)) {
        allowed.push({ line: i + 1, reason: (line.split(ALLOW)[1] || "").trim() });
      }
      return;
    }
    if (t.startsWith("//") || t.startsWith("*")) return; // 주석/문서 줄
    if (!HEX.test(codePart)) return; // hex 가 코드부엔 없음(주석 안에만) → 통과
    violations.push({ line: i + 1, text: t.slice(0, 110) });
  });
  return { violations, allowed };
}

module.exports = { scan, HEX, ALLOW };

// ── CLI ─────────────────────────────────────────────────────────────────
if (require.main === module) {
  function run(code) {
    if (!code || !code.trim()) process.exit(0); // 빈 입력(읽기 전용 호출 등) → 통과
    const { violations, allowed } = scan(code);
    if (violations.length === 0) {
      if (allowed.length) {
        process.stderr.write(
          `🚧 Figma Hex Guard ✅ — hex 위반 0 (장식 크롬 ${allowed.length}건은 figma-hex-allow 마커로 명시)\n`
        );
      }
      process.exit(0);
    }
    const lines = [
      "🚧 Figma Hex Guard 🔴 use_figma 차단 — Figma 노드 색은 Variable 바인딩이어야 합니다.",
      "   하드코딩된 hex 색을 발견했습니다 (검토/스펙 프레임도 예외 없음 — 결국 라이브러리화됨):",
    ];
    for (const v of violations) lines.push(`   ❌ L${v.line}: ${v.text}`);
    lines.push("");
    lines.push("   해결: figma.variables.getVariableById(ID) + setBoundVariableForPaint 로 바인딩하세요.");
    lines.push("   순수 장식 크롬(검토 프레임 배경·라벨)만 줄 끝에 `// figma-hex-allow: <사유>` 추가.");
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
