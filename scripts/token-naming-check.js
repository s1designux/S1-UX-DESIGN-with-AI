#!/usr/bin/env node
/**
 * token-naming-check.js  (Gate 15 — Token Naming Convention)
 *
 * vars-data.ts 의 SEMANTIC_COLOR·SEMANTIC_NUMBER·SEMANTIC_SHADOW 키(=Figma 변수 경로)가
 * registry/governance/naming-rules.json 의 네이밍 규칙을 지키는지 기계 판정한다.
 *
 * 도입 사유: 기존 14개 게이트는 토큰의 "값·구조·존재"만 검사하고 "이름"은 안 봤다.
 *   그 사각지대로 레거시 원본 이름(navigation/background)·빌더 우회 별칭(icon/brand-ci)이
 *   정본에 유입됨. 이 게이트가 새 토큰/리네임의 이름을 커밋 단계에서 강제한다.
 *
 * 검사 대상: vars-data.ts 의 "color/…"(Semantic Color) 키 + 숫자 Semantic 키.
 *   Foundation 팔레트 키(brand/ci, gray/100 등 hex 값 정의)는 팔레트라 경로규칙 제외, kebab 만 적용.
 *
 * 실행: node scripts/token-naming-check.js  (또는 npm run tokens:namingcheck)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VD = path.join(ROOT, "plugins/figma-vars-installer/src/vars-data.ts");
const RULES = path.join(ROOT, "registry/governance/naming-rules.json");

// 2026-08-01 Phase 1: 파일 전체 정규식 → 공용 로더(모듈 값) 이관.
//   종전에는 주석·다른 상수에 등장하는 문자열까지 키로 오집계될 수 있었다.
const { loadVarsData } = require("./lib/load-vars-data");

function loadKeys() {
  const V = loadVarsData();
  // Semantic 경로 키: "color/…" (브랜드 별칭 등 Semantic 레이어). 숫자 Semantic 키도 포함.
  const NUM_NS = "spacing|radius|border-width|sizing|font-size|font-weight|line-height|opacity|letter-spacing";
  // 그림자 네임스페이스는 NUM_NS 에 넣지 않고 분리한다(2026-07-29):
  //   NUM_NS 는 이름 그대로 "숫자 Semantic" 목록이고 값이 숫자/숫자-alias 다.
  //   shadow 값은 완성된 box-shadow 문자열이라 숫자가 아니므로, NUM_NS 에 끼워 넣으면
  //   상수 이름이 내용과 어긋나 다음 사람이 오독한다. 적용되는 네이밍 규칙(kebab·금지세그먼트)은
  //   동일하므로 키 집합에는 함께 합친다 — 분리는 "이름의 정직성"을 위한 것이지 규칙 완화가 아니다.
  const SHADOW_NS = "shadow";
  const NUM_RE = new RegExp(`^(?:${NUM_NS})\\/`);
  const SHADOW_RE = new RegExp(`^(?:${SHADOW_NS})\\/`);
  // 정본 5개 객체의 키 + Semantic 값에 등장하는 Foundation 참조 경로(종전 파일 스캔이 잡던 범위)
  const all = [
    ...Object.keys(V.FOUNDATION_COLOR), ...Object.keys(V.FOUNDATION_NUMBER),
    ...Object.keys(V.SEMANTIC_COLOR), ...Object.keys(V.SEMANTIC_NUMBER), ...Object.keys(V.SEMANTIC_SHADOW),
  ];
  for (const e of Object.values(V.SEMANTIC_COLOR)) {
    for (const ref of [e && e.light, e && e.dark]) if (typeof ref === "string") all.push(ref);
  }
  for (const v of Object.values(V.SEMANTIC_NUMBER)) if (typeof v === "string") all.push(v);
  const keys = all.filter((k) => typeof k === "string" &&
    (k.startsWith("color/") || NUM_RE.test(k) || SHADOW_RE.test(k)));
  return [...new Set(keys)];
}

// 세그먼트 분해: 상태 구분자 '--' 는 한 세그먼트 안에서 허용(예: primary--default)
function segments(key) {
  return key.split("/");
}

function checkKebab(seg) {
  // 상태 구분자 '--' 를 단일 '-' 로 정규화 후 검사
  const norm = seg.replace(/--/g, "-");
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(norm);
}

function audit() {
  const rules = JSON.parse(fs.readFileSync(RULES, "utf8")).rules;
  const keys = loadKeys();
  const violations = [];

  for (const key of keys) {
    const segs = segments(key);
    for (const rule of rules) {
      if (rule.type === "forbidden-segment") {
        if (segs.includes(rule.segment)) {
          violations.push({ rule: rule.id, key, detail: `세그먼트 '${rule.segment}' 금지 → '${rule.use}' 사용` });
        }
      } else if (rule.type === "forbidden-key-regex") {
        if (new RegExp(rule.pattern).test(key)) {
          violations.push({ rule: rule.id, key, detail: rule.hint || rule.desc });
        }
      } else if (rule.type === "segment-kebab") {
        const bad = segs.filter((s) => !checkKebab(s));
        if (bad.length) {
          violations.push({ rule: rule.id, key, detail: `비-kebab 세그먼트: ${bad.join(", ")}` });
        }
      }
    }
  }
  return { violations, checked: keys.length, rules: rules.length };
}

module.exports = { audit };

if (require.main === module) {
  console.log("\n[Token Naming] vars-data 키 ↔ naming-rules.json");
  let r;
  try { r = audit(); }
  catch (e) { console.error(`  ❌ 검사 실행 실패: ${e.message}`); process.exit(1); }

  if (r.violations.length === 0) {
    console.log(`  ✅ 네이밍 위반 0 (키 ${r.checked}개 · 규칙 ${r.rules}개)`);
    process.exit(0);
  }
  console.log(`  ❌ 네이밍 위반 ${r.violations.length}건:`);
  for (const v of r.violations) {
    console.log(`     [${v.rule}] ${v.key} — ${v.detail}`);
  }
  process.exit(1);
}
