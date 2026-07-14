#!/usr/bin/env node
'use strict';
/**
 * scan-system-map.js — 토큰 "시스템 맵" 건강도 스캐너 (읽기 전용)
 * @role: 토큰 시스템 맵 데이터 스캐너 (수기·죽은파일·orphan·경계위반)
 *
 * [역할] pipeline-status.js 가 require 해서 D.system_map 에 담는 순수 데이터 모듈.
 *        이 모듈은 파일을 읽기만 한다. HTML 을 쓰지 않는다(쓰기 권한은 pipeline-status.js 만 보유).
 *        module.exports = function scanSystemMap(root, ctx) → 순수 데이터 객체 반환.
 *
 * [시스템 맵의 본체] 파이프라인 지도가 이미 보여주는 "파랑(자동 경로)"은 여기서 다시 그리지 않는다.
 *   파랑은 요약 배지 한 줄로만 압축(pipeline_summary). 본체는 아래 4개 카테고리:
 *     ① 값검사 공백  ② 수기 관리(빨강)  ③ 죽은 파일(회색)  ④ 경계 위반
 *
 * [색 판정 대원칙 — 하드코딩 금지]
 *   "수기 / 자동"을 이름으로 억지 매칭하지 않는다(네이밍 체계가 다르면 가짜 숫자가 된다).
 *   판정은 오직 GENERATOR_WRITE_RULE 하나로만 한다:
 *     "그 파일을 write 하는 생성기가 존재하는가?" → 있으면 파랑(자동), 없으면 빨강(수기).
 *   따라서 나중에 semantic.colors.json 에 생성기가 붙으면 자동으로 빨강→파랑으로 바뀐다.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

// ── 판정 규칙 상수 (리포트에도 함께 출력) ─────────────────────────────────
const RULES = {
  GENERATOR_WRITE_RULE:
    '색 판정 = "이 파일을 write 하는 생성기가 있는가". 있으면 자동(파랑), 없으면 수기(빨강). 토큰 이름 매칭 금지.',
  DEAD_FILE_RULE:
    '죽은 파일 = 저장소 어디서도 <link href>/@import 로 로드되지 않는 CSS.',
  DEAD_TOKEN_RULE:
    '죽은 토큰 = registry 컴포넌트가 "선언"(O) + 정본 tokens.css 정의(X) + 죽은 CSS(component-tokens.css·input.css)에만 정의(O). ' +
    '"선언"은 살아있는 맥락만 인정 — removedTokens·note·history 등 비선언 서브트리의 언급은 제외(선언 아님).',
  SEMANTIC_JSON_COUNT_RULE:
    'semantic.colors.json 집계 = tokens 객체의 그룹 중 "배열형 그룹"만 엔트리 합산. 비배열(구조 상이) 그룹은 합산하지 않고 분리 표기.',
};

// ── 대상 경로 (root 기준 상대) ────────────────────────────────────────────
const P = {
  VARS_DATA: 'plugins/figma-vars-installer/src/vars-data.ts',
  SITE_BASE: 'assets/css/site-base.css',
  SEMANTIC_JSON: 'registry/tokens/semantic.colors.json',
  TOKENS_CSS: 'assets/css/tokens.css',
  DEAD_CSS: ['assets/css/component-tokens.css', 'assets/css/components/input.css'],
  REGISTRY_COMPONENTS: 'registry/components',
  BOUNDARY_PAGE: 'pages/components-new.html',
  ORPHAN_CHECK: 'scripts/orphan-token-check.js',
};

// ── 유틸 ──────────────────────────────────────────────────────────────────
const baseName = p => String(p).split(/[\\/]/).pop();
function read(root, relPath) {
  try { return fs.readFileSync(path.join(root, relPath), 'utf8'); } catch (_) { return null; }
}
function exists(root, relPath) {
  try { fs.accessSync(path.join(root, relPath)); return true; } catch (_) { return false; }
}
// CSS 안에서 "정의(선언 LHS)"된 커스텀 프로퍼티 이름만 추출: `--x-y :` 형태
function cssDefinedVars(src) {
  if (!src) return new Set();
  return new Set((src.match(/--[a-z][a-z0-9-]+(?=\s*:)/g) || []));
}
// TS 소스에서 `export const NAME` 블록의 최상위 `"키":` 개수 (다음 export 전까지)
function countExportBlockKeys(src, name) {
  if (!src) return null;
  const m = src.match(new RegExp('export const ' + name + '\\b'));
  if (!m) return null;
  const rest = src.slice(m.index + m[0].length);
  const end = rest.search(/\nexport const /);
  const block = end < 0 ? rest : rest.slice(0, end);
  return (block.match(/^\s*"[^"]+"\s*:/gm) || []).length;
}

// ── GENERATOR_WRITE_RULE: 이 파일을 write 하는 생성기가 있는가 ─────────────
// ctx.generators (pipeline-status.js 가 이미 계산한 genInfo) 를 우선 사용.
// 없으면 scripts/ 를 직접 훑어 writeFileSync 대상 basename 집합을 보수적으로 만든다(standalone).
function buildGeneratorWriteTargets(root, ctx) {
  const targets = new Set();
  if (ctx && Array.isArray(ctx.generators)) {
    ctx.generators.forEach(g => {
      (g.write_paths || []).forEach(w => targets.add(baseName(w)));
      (g.write_destinations || []).forEach(w => targets.add(baseName(w)));
    });
    return targets;
  }
  // fallback: scripts/ 직접 스캔 (깊이 제한, 읽기 전용)
  const stack = [path.join(root, 'scripts')];
  let guard = 0;
  while (stack.length && guard < 4000) {
    guard++;
    const dir = stack.pop();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { continue; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { stack.push(full); continue; }
      if (!/\.(m?[jt]s|cjs)$/i.test(e.name)) continue;
      let src; try { src = fs.readFileSync(full, 'utf8'); } catch (_) { continue; }
      if (!/writeFileSync|writeFile|createWriteStream/.test(src)) continue;
      // writeFileSync( '..path..' 형태의 첫 문자열 인자만 보수적으로 추출
      const re = /(?:writeFileSync|writeFile|createWriteStream)\s*\(\s*[^'"`)]*['"`]([^'"`]+)['"`]/g;
      let m;
      while ((m = re.exec(src))) targets.add(baseName(m[1]));
    }
  }
  return targets;
}

// ── git / 시각 스냅샷 ─────────────────────────────────────────────────────
function gitInfo(root) {
  const run = args => {
    try {
      return cp.execSync('git ' + args, { cwd: root, timeout: 4000, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString().trim();
    } catch (_) { return null; }
  };
  return {
    hash: run('rev-parse --short HEAD'),
    date: run('log -1 --format=%cI'),
    branch: run('rev-parse --abbrev-ref HEAD'),
  };
}

// ── orphan (Gate 17) — 실행 시점 스냅샷. allowlist 는 절대 수정하지 않음 ────
function scanOrphan(root, runCheck, scannedAt) {
  if (!runCheck) return { available: false, reason: '--check 로 측정 (정적 모드에서는 미측정)' };
  if (!exists(root, P.ORPHAN_CHECK)) return { available: false, reason: 'orphan-token-check.js 없음' };
  try {
    const out = cp.execSync('node ' + P.ORPHAN_CHECK, {
      cwd: root, timeout: 45000, stdio: ['ignore', 'pipe', 'pipe'],
    }).toString();
    const m = out.match(/ORPHAN_SUMMARY total=(\d+) allow=(\d+) unexpected=(\d+) stale=(\d+)/);
    if (!m) return { available: false, reason: 'ORPHAN_SUMMARY 파싱 실패' };
    return {
      available: true,
      total: +m[1], allow: +m[2], unexpected: +m[3], stale: +m[4],
      snapshot_at: scannedAt,
      note: '실행 시점 스냅샷. allowlist(intentional-unused-tokens.json)는 타 세션 편집 가능 → 값이 변동될 수 있음(이 모듈은 그 파일을 읽기만 함).',
    };
  } catch (e) {
    return { available: false, reason: 'orphan-token-check 실행 실패: ' + String(e.message || '').slice(0, 100) };
  }
}

// ══════════════════════════════════════════════════════════════════════════
module.exports = function scanSystemMap(root, ctx) {
  root = root || process.cwd();
  ctx = ctx || {};
  const scannedAt = new Date().toISOString();
  const genTargets = buildGeneratorWriteTargets(root, ctx);
  const hasGenerator = relPath => genTargets.has(baseName(relPath)); // GENERATOR_WRITE_RULE

  // ── 파랑 요약 배지 (자동 경로는 여기 한 줄로만) ──────────────────────────
  const varsSrc = read(root, P.VARS_DATA);
  const foundationColor = countExportBlockKeys(varsSrc, 'FOUNDATION_COLOR');
  const semanticColor = countExportBlockKeys(varsSrc, 'SEMANTIC_COLOR');
  const gens = Array.isArray(ctx.generators) ? ctx.generators.length : null;
  const dests = Array.isArray(ctx.destinations) ? ctx.destinations.length : null;
  const driftCount = Array.isArray(ctx.destinations) && ctx.runCheck
    ? ctx.destinations.filter(d => d.drift === 'fail').length
    : null;
  const pipeline_summary = {
    source_file: exists(root, P.VARS_DATA) ? P.VARS_DATA : null,
    foundation_color: foundationColor,     // 확인불가면 null
    semantic_color: semanticColor,
    generators: gens,                       // ctx 없으면 null → "확인 불가"
    destinations: dests,
    drift: driftCount,                      // 정적 모드면 null → "미측정"
    measured: !!ctx.runCheck,
  };

  // ── ② 수기 관리 (빨강) — GENERATOR_WRITE_RULE 로만 판정 ──────────────────
  const manual = [];

  // site-base.css : 토큰 단위 원천 매칭 시도 금지. 파일 전체를 생성기 유무로만 판정.
  if (exists(root, P.SITE_BASE)) {
    const src = read(root, P.SITE_BASE);
    const colorDefs = [...cssDefinedVars(src)].filter(v => v.startsWith('--color-'));
    const rawHex = (src.match(/--color-[a-z0-9-]+\s*:\s*#[0-9a-fA-F]{3,8}/g) || []).length;
    manual.push({
      file: P.SITE_BASE,
      kind: 'css-role-tokens',
      count: colorDefs.length,
      unit: '종',
      raw_hex: rawHex,
      has_generator: hasGenerator(P.SITE_BASE),
      note: '포털 화면용 역할 토큰(bg·text·border·icon·action). 생성기 없음이면 전 종이 수기 관리.',
    });
  }

  // semantic.colors.json : 배열형만 합산, 비배열은 분리 표기 (SEMANTIC_JSON_COUNT_RULE)
  if (exists(root, P.SEMANTIC_JSON)) {
    let arrayGroups = 0, arraySum = 0, nonArray = [];
    try {
      const j = JSON.parse(read(root, P.SEMANTIC_JSON));
      const t = (j && j.tokens) || {};
      for (const k of Object.keys(t)) {
        if (Array.isArray(t[k])) { arrayGroups++; arraySum += t[k].length; }
        else nonArray.push(k);
      }
    } catch (_) { arraySum = null; }
    manual.push({
      file: P.SEMANTIC_JSON,
      kind: 'semantic-json',
      count: arraySum,                       // 배열형 그룹 합만 (null=파싱 실패)
      unit: '종',
      array_groups: arrayGroups,
      non_array_groups: nonArray,            // 구조 상이 — 합산하지 않음
      has_generator: hasGenerator(P.SEMANTIC_JSON),
      note: '토큰 문서 데이터. 배열형 ' + arrayGroups + '그룹만 합산(' + (arraySum == null ? '파싱실패' : arraySum + '종') +
            '), 비배열 ' + nonArray.length + '그룹은 구조 상이라 별도.',
    });
  }

  // ── ③ 죽은 파일 (회색) — DEAD_FILE_RULE ─────────────────────────────────
  // 저장소 전역에서 각 죽은-후보 CSS 가 href/@import 로 로드되는지 확인.
  function referencedAnywhere(root, targetBase) {
    // pages/ 와 assets/ 의 html/css 만 훑어도 로드 참조는 다 잡힘(외부 진입점이 거기임)
    const roots = ['pages', 'assets'].map(d => path.join(root, d));
    const stack = roots.slice();
    let guard = 0;
    while (stack.length && guard < 8000) {
      guard++;
      const cur = stack.pop();
      let st; try { st = fs.statSync(cur); } catch (_) { continue; }
      if (st.isDirectory()) {
        let entries; try { entries = fs.readdirSync(cur); } catch (_) { continue; }
        entries.forEach(e => stack.push(path.join(cur, e)));
        continue;
      }
      if (!/\.(html?|css)$/i.test(cur)) continue;
      let src; try { src = fs.readFileSync(cur, 'utf8'); } catch (_) { continue; }
      // 실제 "로드"만 매칭: <link href="…targetBase"> 또는 @import "…targetBase" / @import url(…targetBase)
      // 같은 따옴표값·같은 줄 안에서만(따옴표·줄바꿈 넘지 않음) — 주석 속 "@import 대상 아님" 같은 언급 오탐 방지.
      const esc = targetBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(
        '(?:href\\s*=\\s*["\'][^"\'\\n]*' + esc + ')' +
        '|(?:@import\\s+(?:url\\(\\s*)?["\']?[^"\'\\n)]*' + esc + ')',
        'i');
      if (re.test(src)) return true;
    }
    return false;
  }
  const canonicalDefs = cssDefinedVars(read(root, P.TOKENS_CSS)); // tokens.css 정의 집합
  const dead_files = [];
  const deadTokenSet = new Set();
  P.DEAD_CSS.forEach(rel => {
    if (!exists(root, rel)) return;
    const src = read(root, rel);
    const defs = [...cssDefinedVars(src)];
    // DEAD_TOKEN_RULE 부분: tokens.css 에 없는(=정본 정의 X) 죽은-CSS 정의만 죽은토큰 후보
    defs.filter(t => !canonicalDefs.has(t)).forEach(t => deadTokenSet.add(t));
    const loaded = referencedAnywhere(root, baseName(rel));
    dead_files.push({
      file: rel,
      defines: defs.length,
      loaded,                                 // false = 죽음
      reason: loaded ? '로드됨(죽지 않음)' : 'href/@import 참조 0건 → 로드 안 됨',
    });
  });

  // 죽은 토큰을 "선언"한 registry 컴포넌트 수 (DEAD_TOKEN_RULE 완성: registry O + tokens.css X + 죽은CSS O)
  // "선언"은 살아있는 맥락만: removedTokens·note·history 등 비선언 서브트리는 제외(그 안의 토큰은 '제거 기록'이지 선언이 아님).
  const NON_DECLARATION_KEYS = new Set(
    ['removedTokens', 'removed', 'deprecated', 'deprecatedTokens', 'note', 'notes', 'history', 'migration']);
  function declaredDeadTokens(json) {
    const found = new Set();
    (function walk(node, excluded) {
      if (node == null) return;
      if (typeof node === 'string') { if (!excluded && deadTokenSet.has(node)) found.add(node); return; }
      if (Array.isArray(node)) { node.forEach(x => walk(x, excluded)); return; }
      if (typeof node === 'object') {
        for (const k of Object.keys(node)) {
          const kx = excluded || NON_DECLARATION_KEYS.has(k);
          if (!kx && deadTokenSet.has(k)) found.add(k);  // 별칭→정본 매핑의 '키'도 선언으로 인정
          walk(node[k], kx);
        }
      }
    })(json, false);
    return found;
  }
  let deadTokenComponents = { count: 0, of: 0, list: [] };
  const compDir = path.join(root, P.REGISTRY_COMPONENTS);
  try {
    const files = fs.readdirSync(compDir).filter(f => f.endsWith('.json') && f !== 'index.json');
    deadTokenComponents.of = files.length;
    files.forEach(f => {
      let json; try { json = JSON.parse(fs.readFileSync(path.join(compDir, f), 'utf8')); } catch (_) { return; }
      const hits = declaredDeadTokens(json);
      if (hits.size) deadTokenComponents.list.push({ file: 'registry/components/' + f, dead_refs: hits.size });
    });
    deadTokenComponents.count = deadTokenComponents.list.length;
  } catch (_) { deadTokenComponents = { available: false, reason: 'registry/components 읽기 실패' }; }

  // ── ④ 경계 위반 — 데모 CSS 가 포털 역할토큰을 참조 ───────────────────────
  let boundary = { available: false, reason: 'components-new.html 없음' };
  if (exists(root, P.BOUNDARY_PAGE)) {
    const src = read(root, P.BOUNDARY_PAGE);
    // 페이지 내부 <style> 블록만 대상
    const styles = (src.match(/<style[\s\S]*?<\/style>/gi) || []).join('\n');
    const roleVars = new Set(
      (styles.match(/var\(\s*--color-(?:bg|text|border|icon|action|surface)-[a-z0-9-]+\s*\)/g) || [])
        .map(s => s.replace(/\s+/g, ''))
    );
    boundary = {
      file: P.BOUNDARY_PAGE,
      role_token_refs: roleVars.size,
      note: '컴포넌트 데모 CSS 가 포털 전용 역할토큰(site-base)을 참조 = 경계 위반. 데모는 정본 컴포넌트 토큰만 써야 함.',
    };
  }

  // ── ① 값검사 공백 — pipeline-status.js 가 계산한 blind_spots 재사용 ───────
  const blind_spots = Array.isArray(ctx.blindSpots) ? ctx.blindSpots.slice() : null;

  // ── 확인 불가 (스캔 대상 아님) ──────────────────────────────────────────
  const unavailable = [
    { item: 'Figma ↔ CSS 토큰 지도(figma-css-token-map)', reason: 'Figma/네트워크 필요·완성도는 주관 판단 → 확인 불가' },
  ];

  return {
    scanned_at: scannedAt,
    git: gitInfo(root),
    rules: RULES,
    pipeline_summary,     // 파랑 요약 한 줄
    manual,               // 빨강
    dead_files,           // 회색
    dead_token_components: deadTokenComponents,
    boundary,             // 경계 위반
    orphan: scanOrphan(root, ctx.runCheck, scannedAt),
    blind_spots,          // 값검사 공백 (렌더 위치만 이동, 스캔 원천은 pipeline-status.js)
    unavailable,
  };
};

// 직접 실행 시: 스캔 결과 JSON 을 stdout 으로 (HTML 안 씀 — 확인/디버그용)
if (require.main === module) {
  const root = process.argv.includes('--root')
    ? path.resolve(process.argv[process.argv.indexOf('--root') + 1]) : process.cwd();
  const runCheck = process.argv.includes('--check');
  console.log(JSON.stringify(module.exports(root, { runCheck }), null, 2));
}
