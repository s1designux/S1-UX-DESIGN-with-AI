#!/usr/bin/env node
/**
 * Icon Instance Policy Check (Gate 12)
 * ─────────────────────────────────────────────────────────────────────────
 * 설치기 컴포넌트의 아이콘은 **V2.2 아이콘 라이브러리 컴포넌트 인스턴스**(makeIconInstance)로만
 * 넣어야 한다. raw 벡터 직삽입(createNodeFromSvg / makeStrokeIcon / makeFillIcon / makeBoundIcon)은
 * 금지하며, 예외는 줄 끝에 `// icon-vector-allow: <사유>` 마커가 있을 때만 허용한다.
 *
 * 왜 필요한가 (도입 사유 2026-06-19):
 *   사용자가 설치 결과에서 "아이콘이 컴포넌트가 아니라 벡터로 들어가 있다"고 반복 지적.
 *   기존 게이트는 토큰/구조만 보고 "아이콘이 라이브러리 인스턴스인지"는 아무도 강제하지 않았다.
 *   → 새 아이콘이 벡터로 새어 들어가는 것을 **커밋 단계에서 기계 차단**한다.
 *
 * 규칙:
 *   - 벡터 생성 패턴이 있는 줄은 위반. 단, (a) 주석 줄(`//`로 시작), (b) 함수 '정의' 줄
 *     (`function`/`async function`로 시작), (c) `icon-vector-allow:` 마커 보유 줄은 예외.
 *   - 새 아이콘은 ICON_KEYS 에 키 추가 + makeIconInstance 사용(이 패턴은 매칭 안 됨) → 위반 0.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BC = path.join(ROOT, "plugins/figma-vars-installer/src/build-components.ts");

const VECTOR_RE = /\b(createNodeFromSvg|makeStrokeIcon|makeFillIcon|makeBoundIcon)\s*\(/;
const ALLOW = "icon-vector-allow:";

function check() {
  const src = fs.readFileSync(BC, "utf8").split("\n");
  const violations = [];
  const allowed = [];
  src.forEach((line, i) => {
    const t = line.trim();
    if (!VECTOR_RE.test(line)) return;
    if (t.startsWith("//")) return;                         // 주석 설명
    if (/^(export\s+)?(async\s+)?function\s/.test(t)) return; // 헬퍼 '정의' 줄
    if (line.includes(ALLOW)) {
      allowed.push({ line: i + 1, reason: line.split(ALLOW)[1].trim() });
    } else {
      violations.push({ line: i + 1, text: t.slice(0, 90) });
    }
  });
  return { violations, allowed };
}

module.exports = { check };

// ── CLI ─────────────────────────────────────────────────────────────────
if (require.main === module) {
  console.log("\n[Icon Instance Policy] 아이콘 = V2.2 라이브러리 인스턴스 강제 (벡터 직삽입 금지)");
  let r;
  try { r = check(); } catch (e) { console.error(`  ❌ 검사 실행 실패: ${e.message}`); process.exit(1); }
  if (r.violations.length === 0) {
    console.log(`  ✅ 위반 0 — 모든 아이콘이 makeIconInstance(라이브러리 인스턴스) 경로` +
                ` (벡터 예외 ${r.allowed.length}건은 allow 마커로 명시)`);
    process.exit(0);
  }
  for (const v of r.violations) console.error(`  ❌ L${v.line}: 벡터 직삽입 — ${v.text}  (makeIconInstance 사용 또는 // icon-vector-allow: 사유 추가)`);
  console.error(`\n  ${r.violations.length}건 — 아이콘은 라이브러리 인스턴스로 넣거나 사유를 명시하라\n`);
  process.exit(1);
}
