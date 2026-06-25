#!/usr/bin/env node
/**
 * Gate 16 — Component Origin Verification (컴포넌트 분류·검증 게이트)
 * ─────────────────────────────────────────────────────────────────────────
 * registry/governance/update-management.json 의 origin(분류)을 기준으로,
 * "Ⓑ(원본틀 필요)인데 다 됐다며 원본 대조 없이 출고"되는 것을 커밋 단계에서 막는다.
 * (탭 사태 재발 방지 — origin 분류가 곧 게이트의 입력.)
 *
 * 설계: 마비 방지 계단식.
 *   ❌ FAIL (차단):
 *     - 누락: registry/components|patterns 에 있는데 update-management 에 분류 entry 없음(미분류 escape).
 *     - 잘못된 origin/verify 값.
 *     - origin=B & verify=none & codeStatus∈{implemented,done} → "완료 표시인데 원본 대조 0" = 탭 클래스.
 *   ⚠️ WARN (보이되 차단 안 함 — 백로그가 커밋을 마비시키지 않게):
 *     - origin=B & verify=legacy → 옛 방식 검증만, 새 방식 재검증 권장.
 *     - origin=B & verify=none & harnessStatus=implemented (codeStatus 미완) → 구현됐는데 미검증, 확인.
 *     - origin=tbd → 분류 미정.
 *
 * 한계(v1): verify=new 가 이후 빌드 변경으로 stale 되는 것은 아직 해시로 잡지 않는다(Gate 13 식 잠금은 후속).
 *           Ⓑ 컴포넌트를 다시 손대면 verify 를 수동으로 갱신해야 한다.
 *
 * 사용: node scripts/component-origin-gate-check.js  (또는 npm run origin:check)
 *       gate-check.js 가 Gate 16 으로 require('./component-origin-gate-check').audit() 호출.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "registry/governance/update-management.json");

const VALID_ORIGIN = ["A", "B", "tbd"];
const VALID_VERIFY = ["new", "legacy", "none", "na"];
const SHIPPED_CODE = ["implemented", "done"];

function registryMeta(entry, kind) {
  const candidates = [];
  if (entry.registryPath) candidates.push(path.join(ROOT, entry.registryPath));
  candidates.push(path.join(ROOT, `registry/${kind}/${entry.id}.json`));
  for (const p of candidates) {
    try {
      return JSON.parse(fs.readFileSync(p, "utf8"))._meta || {};
    } catch (_) { /* 다음 후보 */ }
  }
  return null; // registry 없음(예: login)
}

function listRegistryIds(dir) {
  const d = path.join(ROOT, "registry", dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d)
    .filter((f) => f.endsWith(".json") && f !== "index.json")
    .map((f) => f.replace(/\.json$/, ""));
}

function audit() {
  const fails = [];
  const warns = [];

  let data;
  try {
    data = JSON.parse(fs.readFileSync(DATA, "utf8"));
  } catch (e) {
    return { fails: [`update-management.json 읽기 실패: ${e.message}`], warns: [], oks: [] };
  }

  const comps = data.components || [];
  const pats = data.patterns || [];
  const compIds = new Set(comps.map((e) => e.id));
  const patIds = new Set(pats.map((e) => e.id));

  // ── 1) 커버리지: registry 에 있는데 분류표에 없으면 미분류 escape ──────────
  for (const id of listRegistryIds("components")) {
    if (!compIds.has(id)) fails.push(`미분류 컴포넌트 — registry/components/${id}.json 이 update-management.json 에 없음 (origin 분류 추가 필요)`);
  }
  for (const id of listRegistryIds("patterns")) {
    if (!patIds.has(id)) fails.push(`미분류 패턴 — registry/patterns/${id}.json 이 update-management.json 에 없음 (origin 분류 추가 필요)`);
  }

  // ── 2) 항목별 분류·검증 규칙 ──────────────────────────────────────────────
  const checkEntry = (e, kind) => {
    const who = `${kind === "components" ? "컴포넌트" : "패턴"} ${e.id}`;
    if (!VALID_ORIGIN.includes(e.origin)) {
      fails.push(`${who} — 잘못된 origin '${e.origin}' (A|B|tbd 중 하나)`);
      return;
    }
    if (e.verify != null && !VALID_VERIFY.includes(e.verify)) {
      fails.push(`${who} — 잘못된 verify '${e.verify}' (new|legacy|none|na 중 하나)`);
    }
    if (e.origin === "tbd") {
      warns.push(`${who} — 분류 미정(tbd). Ⓐ/Ⓑ 결정 필요`);
      return;
    }
    if (e.origin !== "B") return; // A 는 원본 대조 불필요

    const meta = registryMeta(e, kind);
    const code = meta ? meta.codeStatus : null;
    const harness = meta ? meta.harnessStatus : null;

    if (e.verify === "new") return; // ✅ 새 방식 검증됨

    if (e.verify === "none" && SHIPPED_CODE.includes(code)) {
      fails.push(`${who} — Ⓑ(원본틀 필요)인데 codeStatus=${code}(완료 표시)이면서 원본 대조 안 됨(verify=none). 탭처럼 원본 대조(새 방식) 후 verify=new 기록 필요`);
    } else if (e.verify === "legacy") {
      warns.push(`${who} — Ⓑ인데 옛 방식 검증만(verify=legacy). 새 방식(원본 재측정) 재검증 권장`);
    } else if (e.verify === "none" && harness === "implemented") {
      warns.push(`${who} — Ⓑ인데 구현됨(harness=implemented)이나 미검증(verify=none). 원본 대조 필요(완료 전 차단됨)`);
    }
    // origin=B & verify=none & 미완성(skeleton/not-started/in-progress/preview) → 정상 백로그(무경고)
  };

  comps.forEach((e) => checkEntry(e, "components"));
  pats.forEach((e) => checkEntry(e, "patterns"));

  const b = comps.concat(pats).filter((e) => e.origin === "B");
  const verified = b.filter((e) => e.verify === "new").length;
  const oks = [`분류 ${comps.length + pats.length}개(컴포넌트 ${comps.length}·패턴 ${pats.length}) · Ⓑ ${b.length}개 중 새방식 검증 ${verified}개 · 미분류 escape 0`];

  return { fails, warns, oks };
}

module.exports = { audit };

// 단독 실행
if (require.main === module) {
  const { fails, warns, oks } = audit();
  console.log("🔎 [Gate 16] 컴포넌트 분류·검증 게이트 (Component Origin Verification)");
  oks.forEach((m) => console.log(`  ✅ ${m}`));
  warns.forEach((m) => console.warn(`  ⚠️  ${m}`));
  fails.forEach((m) => console.error(`  ❌ ${m}`));
  if (fails.length) {
    console.error(`\n❌ Gate 16 FAILED — ${fails.length} error(s), ${warns.length} warning(s)`);
    process.exit(1);
  }
  console.log(`\n✅ Gate 16 통과${warns.length ? ` (경고 ${warns.length})` : ""}`);
}
