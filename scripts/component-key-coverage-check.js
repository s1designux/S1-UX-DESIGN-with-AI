#!/usr/bin/env node
/**
 * Component Key Coverage Check (Gate 8)
 * ─────────────────────────────────────────────────────────────────────────
 * build-components.ts 의 빌더들이 런타임에 **동적으로 조합**하는 변수 키
 * (예: `color/chip/${v}/border/${state}`, `color/form-control/${k}`)가
 * vars-data 정본(SEMANTIC_COLOR·FOUNDATION_COLOR·*_NUMBER)에 모두 존재하는지 검증한다.
 *
 * 왜 필요한가:
 *   audit-bindings.js 는 네임스페이스 수준(`color/chip/`)만 검사한다. 개별 leaf 키가
 *   누락되면 audit 는 통과하지만, Figma 플러그인 실행 중 requireVar 가
 *   "변수 누락" 오류로 **전체 빌드를 중단**시킨다(2026-06-12 chip/solid/border/hover 사례).
 *
 * 방법(정적 추측 불가 → 실제 실행):
 *   1. esbuild 로 build-components.ts 를 CJS 번들.
 *   2. mock figma + 키를 기록하는 maps 프록시로 buildAllComponents 를 실행.
 *   3. 요청된 모든 키 − vars-data 공급분 = 누락 목록.
 *
 * 범위: vars-data 가 공급하는 color/number 키만 검증(텍스트 스타일은 code.ts 소관, 별도).
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BC = path.join(ROOT, "plugins/figma-vars-installer/src/build-components.ts");
const VD = path.join(ROOT, "plugins/figma-vars-installer/src/vars-data.ts");

const NUM_NS = "spacing|radius|border-width|sizing|font-size|font-weight|line-height|opacity|letter-spacing";

// ── vars-data 공급 키 집합 ──────────────────────────────────────────────
function loadSupply() {
  const vd = fs.readFileSync(VD, "utf8");
  const color = new Set([...vd.matchAll(/"(color\/[^"]+)"/g)].map((m) => m[1]));
  const number = new Set([...vd.matchAll(new RegExp(`"((?:${NUM_NS})\\/[^"]+)"`, "g"))].map((m) => m[1]));
  return { color, number };
}

// ── 만능 auto-stub (콜러블 + 모든 prop) ─────────────────────────────────
function makeStub() {
  const f = function () { return makeStub(); };
  return new Proxy(f, {
    get(_t, prop) {
      if (prop === "then") return undefined;            // not a thenable (await 안전)
      if (prop === Symbol.toPrimitive) return () => 0;
      if (prop === Symbol.iterator) return undefined;
      if (prop === "children") return [];
      if (["width", "height", "x", "y", "length", "strokeWeight", "cornerRadius", "fontSize"].includes(prop)) return 0;
      return makeStub();
    },
    set() { return true; },
    apply() { return makeStub(); },
  });
}

// ── build-components.ts 를 CJS 로 번들해서 require ───────────────────────
function loadBuildComponents() {
  const esbuild = require("esbuild");
  const out = esbuild.buildSync({
    entryPoints: [BC], bundle: true, format: "cjs", platform: "node", write: false,
  });
  const tmp = path.join(os.tmpdir(), `bc-keycheck-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try {
    delete require.cache[tmp];
    return require(tmp);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) { /* noop */ }
  }
}

/**
 * buildAllComponents 는 async 이고 내부에 await 지점이 있어 키 수집이 마이크로태스크에
 * 걸쳐 일어난다 → 반드시 끝까지 await 해야 모든 scv 키가 모인다.
 * @returns {Promise<{ missing: {color:string[], number:string[]}, stats: object, threw: string|null }>}
 */
async function audit() {
  const supply = loadSupply();
  const colorReq = new Set(), numReq = new Set();
  const rec = (sink) => new Proxy({}, { get(_t, prop) { if (typeof prop === "string") sink.add(prop); return makeStub(); } });

  global.figma = makeStub();
  const maps = {
    semanticColor: rec(colorReq),
    foundationNumber: rec(numReq),
    textStyles: rec(new Set()),
    semanticColorCollectionId: "cid",
    semanticLightModeId: "light",
    semanticDarkModeId: "dark",
  };

  let threw = null;
  const bc = loadBuildComponents();
  try {
    await bc.buildAllComponents(maps);
  } catch (e) {
    threw = e && e.message ? e.message : String(e);
  }

  const missingColor = [...colorReq].filter((k) => k.startsWith("color/") && !supply.color.has(k)).sort();
  const missingNumber = [...numReq].filter((k) => new RegExp(`^(${NUM_NS})\\/`).test(k) && !supply.number.has(k)).sort();

  return {
    missing: { color: missingColor, number: missingNumber },
    stats: {
      requestedColor: [...colorReq].filter((k) => k.startsWith("color/")).length,
      supplyColor: supply.color.size,
      requestedNumber: [...numReq].filter((k) => new RegExp(`^(${NUM_NS})\\/`).test(k)).length,
      supplyNumber: supply.number.size,
    },
    threw,
  };
}

module.exports = { audit };

// ── CLI ─────────────────────────────────────────────────────────────────
if (require.main === module) {
  (async () => {
    console.log("\n[Component Key Coverage] build-components.ts scv 키 ↔ vars-data 정본");
    let r;
    try {
      r = await audit();
    } catch (e) {
      console.error(`  ❌ 검사 실행 실패: ${e.message}`);
      process.exit(1);
    }
    console.log(`  color: requested ${r.stats.requestedColor} / supply ${r.stats.supplyColor}` +
                ` · number: requested ${r.stats.requestedNumber} / supply ${r.stats.supplyNumber}`);
    if (r.threw) console.warn(`  ⚠️  buildAllComponents 예외(로직): ${r.threw}`);

    const miss = r.missing.color.length + r.missing.number.length;
    if (miss === 0) {
      console.log("  ✅ 누락 0 — 모든 빌더 키가 vars-data 정본에 존재\n");
      process.exit(0);
    }
    for (const k of r.missing.color) console.error(`  ❌ [color]  ${k} — 빌더가 요청하나 vars-data 미정의`);
    for (const k of r.missing.number) console.error(`  ❌ [number] ${k} — 빌더가 요청하나 vars-data 미정의`);
    console.error(`\n  누락 ${miss}건 — vars-data 에 키 추가 또는 빌더 슬롯 정정 필요\n`);
    process.exit(1);
  })();
}
