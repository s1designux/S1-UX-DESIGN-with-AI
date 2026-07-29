#!/usr/bin/env node
/**
 * release-skill.js
 * ds-apply 스킬의 값 파일(references/)을 원본과 맞추고, 검사를 통과하면 배포한다.
 *
 * 이 스크립트는 S1-UX-DESIGN-with-AI 저장소 루트에서 실행한다.
 *
 * 흐름:
 *   1. npm run design:md:write 로 DESIGN.core.md 재생성 (원본 최신화)
 *   2. 원본 tokens.css + DESIGN.core.md 를 스킬 references/ 와 비교 (드리프트 검사)
 *   3. 다르면 → 멈춤 + 차이 표시. 말없이 덮어쓰지 않는다.
 *   4. --sync 를 주면 → 무결성 검사 후 사본 갱신
 *   5. 무결성 통과 + 사본이 최신이면 → 버전 올리고 git commit + zip 생성
 *      (푸시는 하지 않는다. 확인 후 사람이 직접 `git push origin main`)
 *
 * 사용법:
 *   node release-skill.js           # 검사만 (드리프트 있으면 멈춤)
 *   node release-skill.js --sync    # 검사 통과 시 사본 갱신 (아직 배포 안 함)
 *   node release-skill.js --release # 사본이 최신이면 버전업 + commit + zip (푸시는 수동)
 *
 *   보통: node release-skill.js --sync  →  결과 확인  →  node release-skill.js --release
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

// ── 경로 설정 (원본 저장소 기준) ──────────────────────────────
const ROOT = process.cwd();
const SRC = {
  tokens: path.join(ROOT, "assets/css/tokens.css"),
  design: path.join(ROOT, "design/DESIGN.core.md"),
};
// 플러그인 규격: <플러그인 루트>/.claude-plugin/plugin.json + <플러그인 루트>/skills/<이름>/
// (스킬은 skills/ 폴더에서 자동 발견되므로 plugin.json 에 목록을 적지 않는다)
const PLUGIN_DIR = path.join(ROOT, "plugins/ds-apply");
const SKILL_DIR = path.join(PLUGIN_DIR, "skills/ds-apply");
const REF = {
  tokens: path.join(SKILL_DIR, "references/tokens.css"),
  design: path.join(SKILL_DIR, "references/DESIGN.core.md"),
  version: path.join(SKILL_DIR, "references/VERSION.txt"),
};
const PLUGIN_JSON = path.join(PLUGIN_DIR, ".claude-plugin/plugin.json");
const DIST_DIR = path.join(ROOT, "dist");

const args = process.argv.slice(2);
const MODE = args.includes("--release")
  ? "release"
  : args.includes("--sync")
  ? "sync"
  : "check";

// ── 유틸 ──────────────────────────────────────────────────────
function die(msg) {
  console.error("\n❌ " + msg + "\n");
  process.exit(1);
}
function ok(msg) {
  console.log("✅ " + msg);
}
function warn(msg) {
  console.log("⚠️  " + msg);
}
function hash(file) {
  if (!fs.existsSync(file)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
function exists(f) {
  return fs.existsSync(f);
}

// ── 0. 원본 파일 존재 확인 ────────────────────────────────────
if (!exists(SRC.tokens)) die("원본 tokens.css 를 찾을 수 없음: " + SRC.tokens);
if (!exists(SRC.design)) die("원본 DESIGN.core.md 를 찾을 수 없음: " + SRC.design);

// ── 1. 원본 최신화 (기존 npm 스크립트 재사용) ─────────────────
console.log("\n[1] 원본 DESIGN.core.md 재생성 (npm run design:md:write)...");
try {
  execSync("npm run design:md:write", { cwd: ROOT, stdio: "inherit" });
  ok("원본 재생성 완료");
} catch (e) {
  die("npm run design:md:write 실패. 원본 생성 단계에서 멈춤 (깨진 값 배포 방지).");
}

// ── 2. 드리프트 검사: 원본 vs 사본 ────────────────────────────
console.log("\n[2] 드리프트 검사 (원본 == 스킬 사본?)...");
const drift = [];
for (const key of ["tokens", "design"]) {
  const same = hash(SRC[key]) && hash(SRC[key]) === hash(REF[key]);
  if (!same) drift.push(key);
}

if (drift.length === 0) {
  ok("사본이 원본과 일치함 (드리프트 없음).");
} else {
  warn("사본이 원본과 다릅니다: " + drift.join(", "));
  // 차이 요약 (토큰 개수 비교로 사람이 판단할 재료 제공)
  for (const key of drift) {
    const srcLines = exists(SRC[key])
      ? fs.readFileSync(SRC[key], "utf8").split("\n").length
      : 0;
    const refLines = exists(REF[key])
      ? fs.readFileSync(REF[key], "utf8").split("\n").length
      : 0;
    if (key === "tokens") {
      const srcTok = countTokens(SRC.tokens);
      const refTok = exists(REF.tokens) ? countTokens(REF.tokens) : 0;
      console.log(
        `   - tokens.css: 원본 토큰 ${srcTok}개 / 사본 ${refTok}개 (라인 ${srcLines} vs ${refLines})`
      );
    } else {
      console.log(`   - ${key}: 라인 ${srcLines} vs ${refLines}`);
    }
  }

  if (MODE === "check") {
    console.log(
      "\n👉 차이를 확인했으면, 사본을 갱신하려면:  node release-skill.js --sync"
    );
    console.log("   (원본이 이상해 보이면 --sync 하지 말고 원본을 먼저 점검하세요)");
    process.exit(2);
  }
}

// ── 3. --sync / --release 일 때만 무결성 검사 후 사본 갱신 ─────
function countTokens(file) {
  const txt = fs.readFileSync(file, "utf8");
  const m = txt.match(/^\s*--[a-z0-9-]+\s*:/gim);
  return m ? m.length : 0;
}

function integrityCheck() {
  console.log("\n[3] 무결성 검사...");
  const problems = [];

  // (a) 파일이 비어있지 않은가
  for (const key of ["tokens", "design"]) {
    const size = fs.statSync(SRC[key]).size;
    if (size < 200) problems.push(`${key} 원본이 너무 작음(${size}B) — 생성 실패 의심`);
  }

  // (b) 토큰 개수 급감 방어 (이전 사본 대비)
  const srcTok = countTokens(SRC.tokens);
  const refTok = exists(REF.tokens) ? countTokens(REF.tokens) : 0;
  if (refTok > 0 && srcTok < refTok * 0.8) {
    problems.push(
      `토큰 개수가 크게 줄었음: ${refTok} → ${srcTok} (20%↑ 감소). 원본 손상 의심`
    );
  }

  // (c) 다크 블록 존재 (다크 값이 통째로 빠지는 사고 방어)
  const tokTxt = fs.readFileSync(SRC.tokens, "utf8");
  if (!/\[data-theme=["']?dark["']?\]/.test(tokTxt)) {
    problems.push("tokens.css 에 [data-theme=\"dark\"] 블록이 없음 — 다크 값 누락 의심");
  }

  // (d) DESIGN.core.md frontmatter 정상 여부
  const dTxt = fs.readFileSync(SRC.design, "utf8");
  if (!/^---[\s\S]*?---/.test(dTxt.trim())) {
    problems.push("DESIGN.core.md frontmatter(--- 블록)가 깨짐");
  }

  if (problems.length) {
    console.error("   무결성 검사 실패:");
    problems.forEach((p) => console.error("     ✗ " + p));
    die("원본이 온전하지 않아 사본 갱신을 중단합니다. 깨진 값이 배포되는 것을 막았습니다.");
  }
  ok(`무결성 검사 통과 (토큰 ${srcTok}개, 다크 블록 있음, frontmatter 정상)`);
}

function syncCopy() {
  console.log("\n[4] 사본 갱신 (원본 → references/)...");
  fs.mkdirSync(path.dirname(REF.tokens), { recursive: true });
  fs.copyFileSync(SRC.tokens, REF.tokens);
  fs.copyFileSync(SRC.design, REF.design);
  ok("사본 갱신 완료");
}

if (MODE === "sync" || MODE === "release") {
  if (drift.length > 0) {
    integrityCheck();
    syncCopy();
  } else {
    ok("이미 최신 — 갱신할 것 없음");
  }
}

// ── 4. 배포 (--release 일 때만) ───────────────────────────────
if (MODE === "sync") {
  console.log(
    "\n✅ sync 완료. 배포하려면:  node release-skill.js --release\n"
  );
  process.exit(0);
}

if (MODE === "release") {
  // 최종 확인: 사본이 정말 원본과 같은가 (배포 직전 마지막 게이트)
  const clean =
    hash(SRC.tokens) === hash(REF.tokens) &&
    hash(SRC.design) === hash(REF.design);
  if (!clean) die("배포 직전 검사 실패: 사본이 원본과 다름. --sync 를 먼저 실행하세요.");

  // 버전 올리기 (plugin.json 의 version, semver patch +1)
  let version = "0.1.0";
  if (exists(PLUGIN_JSON)) {
    const pj = JSON.parse(fs.readFileSync(PLUGIN_JSON, "utf8"));
    const parts = (pj.version || "0.1.0").split(".").map(Number);
    parts[2] = (parts[2] || 0) + 1;
    version = parts.join(".");
    pj.version = version;
    fs.writeFileSync(PLUGIN_JSON, JSON.stringify(pj, null, 2) + "\n");
  }
  fs.writeFileSync(
    REF.version,
    `ds-apply values\nversion: ${version}\ngenerated: ${new Date().toISOString()}\n`
  );
  ok("버전 → " + version);

  // (A) 외부망 경로: git commit 까지만. 푸시는 사람이 직접 한다.
  // (자동 push 는 현재 브랜치 전체를 밀어 로컬의 다른 커밋까지 함께 올라가므로 제거)
  console.log("\n[5-A] git commit (외부망 동료용)...");
  try {
    // 스킬 폴더만 담는다. 값 사본·VERSION.txt 는 .gitignore 로 빠진다.
    const addPaths = [SKILL_DIR];
    // plugin.json 은 '이미 추적 중일 때만' 담는다. 미추적 상태에서 add 하면
    // 구조가 아직 확정되지 않은 .claude-plugin/ 이 조용히 저장소에 들어간다.
    const tracked = execSync(`git ls-files "${PLUGIN_JSON}"`, {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    if (tracked) {
      addPaths.push(PLUGIN_JSON);
    } else {
      warn(`plugin.json 이 미추적이라 커밋에서 제외 — 버전 ${version} 은 로컬에만 기록됨`);
    }
    execSync(`git add ${addPaths.map((p) => `"${p}"`).join(" ")}`, { cwd: ROOT, stdio: "inherit" });
    execSync(`git commit -m "release(ds-apply): v${version}"`, { cwd: ROOT, stdio: "inherit" });
    ok("커밋 완료 (푸시하지 않음)");
  } catch (e) {
    warn("git commit 단계에서 문제 발생 (수동 확인 필요). zip 은 계속 생성합니다.");
  }

  // (B) 폐쇄망 경로: zip 생성
  console.log("\n[5-B] zip 생성 (폐쇄망 동료용)...");
  fs.mkdirSync(DIST_DIR, { recursive: true });
  const zipName = `ds-apply-v${version}.zip`;
  const zipPath = path.join(DIST_DIR, zipName);
  try {
    // 스킬 폴더 통째로 압축 (SKILL.md + references/)
    execSync(
      `cd "${path.dirname(SKILL_DIR)}" && zip -r -q "${zipPath}" "ds-apply"`,
      { stdio: "inherit" }
    );
    ok("zip 생성: dist/" + zipName);
  } catch (e) {
    warn("zip 명령 실패 (zip 미설치?). 폴더를 수동 압축하세요: " + SKILL_DIR);
  }

  console.log("\n🎉 배포 준비 완료");
  console.log("\n   커밋까지 완료했습니다. 내용 확인 후 직접 푸시하세요:");
  console.log("       git push origin main\n");
  console.log("   외부망 동료: /plugin update (또는 최초 install)");
  console.log("   폐쇄망 동료: dist/" + zipName + " 반입 → .claude/skills/ 에 압축 해제\n");
}
