#!/usr/bin/env node
/**
 * shadow-parse-check.js — 그림자 파서 단위 검증
 *
 * 검증 대상: plugins/figma-vars-installer/src/shadow-parse.ts
 *   CSS box-shadow 문자열 → Figma DropShadowEffect[] 변환이 정확한지 기계 판정한다.
 *
 * 왜 필요한가: 설치기는 그림자 수치를 코드에 적지 않고 vars-data 의 SEMANTIC_SHADOW 문자열을
 *   파싱해서 쓴다. 파서가 조용히 틀리면 Figma 라이브러리 전체의 그림자가 틀린 채로 깔린다.
 *   토큰 게이트(3·6·7)는 "문자열 값"만 보므로 이 변환은 사각지대다 → 전용 검사기로 덮는다.
 *
 * 저장소 관례: 테스트 프레임워크가 없어(jest/vitest 미설치) scripts/*-check.js + npm run 형태를
 *   따른다. build-components.ts 를 esbuild 로 묶어 require 하는 방식은
 *   scripts/component-page-coverage-check.js 와 동일하다.
 *
 * 실행: node scripts/shadow-parse-check.js   (npm run shadow:parsecheck)
 * 출력 끝줄: SHADOWPARSE_SUMMARY cases=<n> failed=<n>
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'plugins/figma-vars-installer/src/shadow-parse.ts');
const VARS = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');

function loadModule(entry) {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({
    entryPoints: [entry], bundle: true, format: 'cjs', platform: 'node', write: false,
  });
  const tmp = path.join(os.tmpdir(), `shadowparse-${process.pid}-${path.basename(entry)}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try { delete require.cache[tmp]; return require(tmp); }
  finally { try { fs.unlinkSync(tmp); } catch (_) {} }
}

let cases = 0;
let failed = 0;
let failures = [];
let VERBOSE = true;   // gate-check 에서 require 로 쓸 땐 조용히(요약만) 돈다
const fail = (name, detail) => {
  failed++;
  failures.push(`${name} — ${String(detail).split('\n')[0]}`);
  if (VERBOSE) console.log(`  ❌ ${name}\n     ${detail}`);
};
const ok = (name) => { if (VERBOSE) console.log(`  ✅ ${name}`); };

function eq(name, actual, expected) {
  cases++;
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) ok(name); else fail(name, `기대 ${e}\n     실제 ${a}`);
}

function throws(name, fn) {
  cases++;
  try { fn(); fail(name, '던져야 하는데 통과했습니다(값이 조용히 사라지는 경로)'); }
  catch (e) { ok(`${name} — 던짐: ${String(e.message).slice(0, 70)}`); }
}

function audit(opts) {
  VERBOSE = !(opts && opts.quiet);
  cases = 0; failed = 0; failures = [];
  const M = loadModule(SRC);
  const V = loadModule(VARS);

  if (VERBOSE) console.log('\n[Shadow Parse] CSS box-shadow → Figma DropShadowEffect[]');

  // ── 1) 겹 분리: 괄호 밖 콤마로만 자른다 ──────────────────────────────
  eq('겹 분리 — rgba 안 콤마는 안 자름(1겹)',
    M.splitShadowLayers('0 4px 8px 0 rgba(0,0,0,0.15)'),
    ['0 4px 8px 0 rgba(0,0,0,0.15)']);

  eq('겹 분리 — 겹 사이 콤마만 자름(2겹)',
    M.splitShadowLayers('0 8px 8px -4px rgba(0,0,0,1), 0 20px 24px -4px rgba(0,0,0,1)'),
    ['0 8px 8px -4px rgba(0,0,0,1)', '0 20px 24px -4px rgba(0,0,0,1)']);

  // ── 2) 길이값 3개형 / 4개형 ──────────────────────────────────────────
  eq('3개형(spread 생략) → spread 0',
    M.parseShadowLayer('0 4px 16px rgba(0,0,0,0.15)'),
    { offsetX: 0, offsetY: 4, blur: 16, spread: 0, color: { r: 0, g: 0, b: 0, a: 0.15 } });

  eq('4개형(spread 명시)',
    M.parseShadowLayer('0 4px 8px 0 rgba(0,0,0,0.15)'),
    { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: { r: 0, g: 0, b: 0, a: 0.15 } });

  eq('음수 offset·음수 spread',
    M.parseShadowLayer('0 -4px 16px -2px rgba(0,0,0,0.06)'),
    { offsetX: 0, offsetY: -4, blur: 16, spread: -2, color: { r: 0, g: 0, b: 0, a: 0.06 } });

  // ── 3) rgb 0–255 → 0–1 정규화 ────────────────────────────────────────
  eq('rgba 정규화(255 → 1)',
    M.parseShadowLayer('0 1px 2px rgba(255,128,0,0.5)').color,
    { r: 1, g: 128 / 255, b: 0, a: 0.5 });

  eq('alpha 생략 시 1',
    M.parseShadowLayer('0 1px 2px rgb(0,0,0)').color,
    { r: 0, g: 0, b: 0, a: 1 });

  // ── 4) Effect 변환 ───────────────────────────────────────────────────
  eq('toDropShadowEffects — 2겹이 배열 2개로',
    M.toDropShadowEffects('0 8px 8px -4px rgba(0,0,0,1), 0 20px 24px -4px rgba(0,0,0,1)'),
    [
      { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 1 }, offset: { x: 0, y: 8 },  radius: 8,  spread: -4, visible: true, blendMode: 'NORMAL' },
      { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 1 }, offset: { x: 0, y: 20 }, radius: 24, spread: -4, visible: true, blendMode: 'NORMAL' },
    ]);

  // ── 5) 실패는 던진다 (조용한 빈 배열 금지) ───────────────────────────
  throws('빈 문자열',            () => M.parseCssShadow(''));
  throws("'none'",              () => M.parseCssShadow('none'));
  throws('색 없음',              () => M.parseCssShadow('0 4px 8px'));
  throws('길이값 2개',           () => M.parseCssShadow('0 4px rgba(0,0,0,0.15)'));
  throws('길이값 5개',           () => M.parseCssShadow('0 1px 2px 3px 4px rgba(0,0,0,0.15)'));
  throws('inset(InnerShadow)',   () => M.parseCssShadow('inset 0 4px 8px rgba(0,0,0,0.15)'));
  throws('단위 오류(rem)',        () => M.parseCssShadow('0 4rem 8px rgba(0,0,0,0.15)'));
  throws('음수 blur',            () => M.parseCssShadow('0 4px -8px rgba(0,0,0,0.15)'));
  throws('괄호 불일치',           () => M.parseCssShadow('0 4px 8px rgba(0,0,0,0.15'));

  // ── 6) 정본(SEMANTIC_SHADOW) 실값이 전부 파싱되는지 — "추출 0건 = 안 됨" ──
  const S = V.SEMANTIC_SHADOW;
  if (!S || Object.keys(S).length === 0) {
    fail('SEMANTIC_SHADOW 로드', 'vars-data.ts 에서 SEMANTIC_SHADOW 를 읽지 못했습니다(서식 변경 의심)');
  } else {
    for (const [key, entry] of Object.entries(S)) {
      for (const mode of ['light', 'dark']) {
        cases++;
        try {
          const layers = M.parseCssShadow(entry[mode]);
          if (layers.length === 0) fail(`정본 ${key}.${mode}`, '겹 0개');
          else ok(`정본 ${key}.${mode} — ${layers.length}겹`);
        } catch (e) {
          fail(`정본 ${key}.${mode}`, e.message);
        }
      }
    }
    // shadow/raised 는 라이트·다크 겹 수가 같아야 변수 바인딩으로 모드 전환이 가능하다(Figma 제약).
    cases++;
    const rl = M.parseCssShadow(S['shadow/raised'].light).length;
    const rd = M.parseCssShadow(S['shadow/raised'].dark).length;
    if (rl === rd) ok(`shadow/raised 라이트·다크 겹 수 일치 (${rl}겹)`);
    else fail('shadow/raised 겹 수 일치', `light ${rl}겹 ≠ dark ${rd}겹 — 변수 바인딩으로 모드 전환 불가`);
  }

  if (VERBOSE) console.log(`\nSHADOWPARSE_SUMMARY cases=${cases} failed=${failed}`);
  return { cases, failed, failures };
}

module.exports = { audit };

if (require.main === module) {
  const r = audit();
  if (r.failed > 0) {
    console.error(`\n❌ 그림자 파서 검증 실패 — ${r.failed}건\n`);
    process.exit(1);
  }
  console.log(`✅ 그림자 파서 검증 통과 — ${r.cases}건\n`);
}
