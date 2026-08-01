#!/usr/bin/env node
/**
 * load-vars-data.js — 토큰 정본(vars-data.ts) 공용 로더
 * ─────────────────────────────────────────────────────────────────────────
 * 정본은 "긁지 말고 로드한다" (Phase 1, 2026-08-01).
 *
 * 종전에는 생성기·검사기 ~14개가 vars-data.ts 소스 텍스트를 각자 정규식으로
 * 긁었다. 그래서 ①상수 선언 순서 ②주석에 등장하는 문자열까지 "파서 계약"이
 * 됐고, 2026-07-29 에는 주석 한 줄이 정규식에 먼저 걸려 색 토큰 400여 개가
 * 통째로 유실되는 사고가 실재했다. 이 로더는 esbuild 로 번들해 **모듈로
 * 로드**하므로 TS 컴파일러가 보는 것과 동일한 값을 얻는다 — 선언 순서·주석·
 * 포매팅은 더 이상 계약이 아니다.
 *
 * 패턴 원형: scripts/stamp-installer-ui.js componentCount() ·
 *           scripts/component-page-coverage-check.js (Gate 18)
 *
 * 사용:
 *   const { loadVarsData } = require('./lib/load-vars-data');
 *   const V = loadVarsData();
 *   V.FOUNDATION_COLOR   // Record<"gray/100", "#E9E9E9">           (208)
 *   V.FOUNDATION_NUMBER  // Record<"spacing/16", 16>                 (54)
 *   V.SEMANTIC_COLOR     // Record<key, {light, dark}>              (171)
 *   V.SEMANTIC_NUMBER    // Record<key, string|number>               (10)
 *   V.SEMANTIC_SHADOW    // Record<key, {light, dark}>                (3)
 *   V.collections        // { foundation, semanticColor, semanticNumber, semanticShadow } 컬렉션 이름
 *
 * 실패는 던진다(0건 추출 = 안 됨 — Gate 17/19 정직 보고 원리). 조용한 빈
 * 결과로 하류 게이트를 "통과"시키는 것보다 여기서 멈추는 편이 낫다.
 *
 * 캐시: 프로세스 내 1회 + 디스크(.cache, vars-data.ts mtime·size 키) —
 * gate:check 가 검사기를 개별 프로세스로 spawn 해도 번들 비용을 1회만 낸다.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const VARS_DATA = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');
const CACHE_DIR = path.join(os.tmpdir(), 's1-vars-data-cache');

// 로드 결과에 반드시 있어야 하는 정본 상수와 최소 기대 규모.
// (규모는 "깨짐 감지"용 하한 — 토큰이 늘어나는 방향은 자유)
const REQUIRED = {
  FOUNDATION_COLOR: 100,
  FOUNDATION_NUMBER: 30,
  SEMANTIC_COLOR: 100,
  SEMANTIC_NUMBER: 5,
  SEMANTIC_SHADOW: 1,
};

let memo = null;

function bundleAndRequire(srcPath) {
  const esbuild = require('esbuild');
  const stat = fs.statSync(srcPath);
  const keyBase = srcPath === VARS_DATA
    ? 'vars-data'
    : 'vars-data-alt-' + Buffer.from(srcPath).toString('base64url').slice(-16);
  const cacheKey = `${keyBase}-${stat.mtimeMs}-${stat.size}.cjs`;
  const cachePath = path.join(CACHE_DIR, cacheKey);

  let code;
  if (fs.existsSync(cachePath)) {
    code = fs.readFileSync(cachePath, 'utf8');
  } else {
    const out = esbuild.buildSync({
      entryPoints: [srcPath], bundle: true, format: 'cjs', platform: 'node', write: false,
    });
    code = out.outputFiles[0].text;
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      // 낡은 캐시 청소(같은 키의 옛 mtime 본)
      for (const f of fs.readdirSync(CACHE_DIR)) {
        if (f.startsWith(keyBase + '-') && f !== cacheKey) fs.unlinkSync(path.join(CACHE_DIR, f));
      }
      fs.writeFileSync(cachePath, code);
    } catch (_) { /* 캐시는 최적화일 뿐 — 실패해도 로드는 진행 */ }
  }

  const tmp = path.join(os.tmpdir(), `vars-data-load-${process.pid}-${Date.now()}.cjs`);
  fs.writeFileSync(tmp, code);
  // vars-data.ts 는 순수 데이터지만, 원형 패턴과 동일하게 figma 전역 스텁을 심어
  // 향후 import 체인이 생겨도 로드가 죽지 않게 한다.
  if (!global.figma) {
    global.figma = new Proxy(function () {}, { get: () => global.figma, apply: () => global.figma });
  }
  let mod;
  try { delete require.cache[tmp]; mod = require(tmp); }
  finally { try { fs.unlinkSync(tmp); } catch (_) { /* skip */ } }
  return mod;
}

/**
 * @param {string} [customPath] 기본은 정본 vars-data.ts. 적대 테스트 등에서 변형본을
 *   로드할 때만 경로를 넘긴다(이 경우 memo 를 쓰지 않는다 — 검증 규칙은 동일 적용).
 */
function loadVarsData(customPath) {
  const src = customPath ? path.resolve(customPath) : VARS_DATA;
  if (src === VARS_DATA && memo) return memo;
  const mod = bundleAndRequire(src);

  for (const [name, min] of Object.entries(REQUIRED)) {
    const v = mod[name];
    const n = v && typeof v === 'object' ? Object.keys(v).length : 0;
    if (n < min) {
      throw new Error(
        `[load-vars-data] 정본 로드 실패 — ${name} 이 ${n}건(기대 최소 ${min}건). ` +
        `vars-data.ts 의 export 구조 변경 의심. 조용히 진행하지 않고 중단한다.`
      );
    }
  }

  const result = {
    FOUNDATION_COLOR: mod.FOUNDATION_COLOR,
    FOUNDATION_NUMBER: mod.FOUNDATION_NUMBER,
    SEMANTIC_COLOR: mod.SEMANTIC_COLOR,
    SEMANTIC_NUMBER: mod.SEMANTIC_NUMBER,
    SEMANTIC_SHADOW: mod.SEMANTIC_SHADOW,
    collections: {
      foundation: mod.FOUNDATION_COLLECTION,
      semanticColor: mod.SEMANTIC_COLOR_COLLECTION,
      semanticNumber: mod.SEMANTIC_NUMBER_COLLECTION,
      semanticShadow: mod.SEMANTIC_SHADOW_COLLECTION,
    },
    _module: mod, // 위 표준 키 밖의 export 가 필요한 소비자용(남용 금지)
  };
  if (src === VARS_DATA) memo = result;
  return result;
}

module.exports = { loadVarsData, VARS_DATA_PATH: VARS_DATA };

// 단독 실행 시 자가 점검
if (require.main === module) {
  const V = loadVarsData();
  const count = (o) => Object.keys(o || {}).length;
  console.log('✅ vars-data 로드 성공');
  console.log(`   FOUNDATION_COLOR ${count(V.FOUNDATION_COLOR)} · FOUNDATION_NUMBER ${count(V.FOUNDATION_NUMBER)}`);
  console.log(`   SEMANTIC_COLOR ${count(V.SEMANTIC_COLOR)} · SEMANTIC_NUMBER ${count(V.SEMANTIC_NUMBER)} · SEMANTIC_SHADOW ${count(V.SEMANTIC_SHADOW)}`);
  console.log(`   collections: ${JSON.stringify(V.collections)}`);
}
