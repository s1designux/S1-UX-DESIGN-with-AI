'use strict';
/**
 * installer-fingerprint.js — 설치기가 Figma 에 표출하는 정보의 지문을 만든다.
 * ─────────────────────────────────────────────────────────────────────────
 * 지문 = 토큰(변수) + 컴포넌트 시각 사양. 두 시점의 지문을 빼면 "무엇이 바뀌었나"가 나온다.
 *
 * 정본: plugins/figma-vars-installer/src/{vars-data,build-components,textstyles-data,shadow-parse}.ts
 *   이 4개 외의 변경(주석·리팩터·검수기 코드)은 지문에 영향을 주지 않는다 —
 *   "Figma 에 표출되는 정보가 바뀔 때만 변경으로 본다"는 사람 결정의 기계적 구현.
 *
 * 번들→require 패턴은 scripts/component-page-coverage-check.js:33-45 와 동일.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { runBuild, PROP_CLASS } = require('./figma-build-mock');

// 지문 행의 필드 구분자. 토큰 값에 섞일 수 없는 제어문자를 쓴다(파이프는 값에 나올 수 있음).
const ROW_SEP = String.fromCharCode(1);

/** 정본 소스 4개 — 이 목록이 "Figma 표출 정보의 원천" 정의다. */
const SOURCE_FILES = [
  'plugins/figma-vars-installer/src/vars-data.ts',
  'plugins/figma-vars-installer/src/build-components.ts',
  'plugins/figma-vars-installer/src/textstyles-data.ts',
  'plugins/figma-vars-installer/src/shadow-parse.ts',
];

// 지문 건전성 하한 — 이보다 적으면 빌드가 중간에 죽었거나 mock 이 부패한 것이다.
// (2026-07-30 실측: 노드 3,510 · SET 45)  Gate 17/19 의 "추출 0건 = 안 됨" 원칙 확장.
const MIN_NODES = 3000;
const MIN_SETS = 40;

let seq = 0;

function bundleAndRequire(entryAbs) {
  const esbuild = require('esbuild');
  let out;
  try {
    out = esbuild.buildSync({ entryPoints: [entryAbs], bundle: true, format: 'cjs', platform: 'node', write: false });
  } catch (e) {
    throw new Error(`[fingerprint] esbuild 번들 실패: ${entryAbs}\n${e.message}`);
  }
  const tmp = path.join(os.tmpdir(), `ifp-${process.pid}-${++seq}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try {
    delete require.cache[tmp];
    return require(tmp);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) { /* noop */ }
  }
}

// 토큰 객체 목록. 과거 ref 에는 없을 수 있다(SEMANTIC_SHADOW 는 2026-07-29 신설).
//   REQUIRED = 어느 시점에도 반드시 있어야 하는 것. 없으면 번들/파싱이 깨진 것이다.
//   OPTIONAL = 나중에 생긴 것. 과거본에 없으면 "그때는 없었다"가 정답이고, 그게 곧 '신설'이다.
const TOKEN_OBJS_REQUIRED = ['FOUNDATION_COLOR', 'FOUNDATION_NUMBER', 'SEMANTIC_COLOR', 'SEMANTIC_NUMBER'];
const TOKEN_OBJS_OPTIONAL = ['SEMANTIC_SHADOW'];

/** vars-data 의 토큰 객체를 하나의 평탄 맵으로. 키 → 값(문자열). */
function flattenTokens(varsMod, textMod) {
  const out = {};
  for (const objName of TOKEN_OBJS_REQUIRED) {
    const obj = varsMod[objName];
    if (!obj || typeof obj !== 'object') {
      throw new Error(`[fingerprint] vars-data 에 ${objName} 이 없습니다 — export 구조 변경 의심.`);
    }
    for (const [k, v] of Object.entries(obj)) {
      out[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
    }
  }
  for (const objName of TOKEN_OBJS_OPTIONAL) {
    const obj = varsMod[objName];
    if (!obj || typeof obj !== 'object') continue;   // 그 시점엔 없던 객체 — 정상
    for (const [k, v] of Object.entries(obj)) {
      out[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
    }
  }
  if (Object.keys(out).length === 0) throw new Error('[fingerprint] 토큰 추출 0건 — 중단.');

  // Text Styles 는 배열이라 name 을 키로 평탄화.
  const styles = textMod && textMod.TEXT_STYLES;
  if (!Array.isArray(styles) || styles.length === 0) {
    throw new Error('[fingerprint] TEXT_STYLES 추출 0건 — textstyles-data export 구조 변경 의심.');
  }
  for (const s of styles) out[`textstyle/${s.name}`] = JSON.stringify(s);

  return out;
}

/** 노드 기록 → 컴포넌트 시각 사양 행 집합. 행 = "세트|variant|타입|속성=값…" */
// 캔버스 표지(영역 제목) — 부품이 아니라 판을 구분하려고 페이지에 놓는 글자다.
//   지문은 "Figma 에 표출되는 **부품·토큰** 정보"를 재는 자라, 표지는 넣지 않는다.
//   (넣으면 표지 문구 하나 고칠 때마다 업데이트 툴팁이 설명할 말이 없는 변경을 보고 멈춘다.)
const CANVAS_LABEL_SUFFIX = '\u2014 Area Title';
const CANVAS_RULE_SUFFIX = '\u2014 Area Rule';

function specRows(nodes) {
  const rows = new Set();
  for (const n of nodes) {
    const nm = String((n.props && n.props.name) || '');
    if (nm.slice(-CANVAS_LABEL_SUFFIX.length) === CANVAS_LABEL_SUFFIX) continue;
    if (nm.slice(-CANVAS_RULE_SUFFIX.length) === CANVAS_RULE_SUFFIX) continue;
    const entries = Object.entries(n.props)
      .filter(([p]) => PROP_CLASS[p] === 'VISUAL' || PROP_CLASS[p] === 'LAYOUT')
      .sort(([a], [b]) => (a < b ? -1 : 1));
    if (entries.length === 0) continue;
    const owner = n.parentSet || '';
    const ident = n.props.name || '';
    rows.add([owner, ident, n.type, entries.map(([p, v]) => `${p}=${v}`).join(';')].join(ROW_SEP));
  }
  return rows;
}

/**
 * 한 소스 디렉터리(현재 트리 또는 git archive 로 꺼낸 과거본)의 지문을 만든다.
 * @param {string} srcDir  .../plugins/figma-vars-installer/src 절대경로
 */
async function fingerprint(srcDir) {
  const bc = path.join(srcDir, 'build-components.ts');
  const vd = path.join(srcDir, 'vars-data.ts');
  const ts = path.join(srcDir, 'textstyles-data.ts');
  for (const f of [bc, vd, ts]) {
    if (!fs.existsSync(f)) throw new Error(`[fingerprint] 정본 소스 없음: ${f}`);
  }

  const varsMod = bundleAndRequire(vd);
  const textMod = bundleAndRequire(ts);
  const tokens = flattenTokens(varsMod, textMod);

  const bcMod = bundleAndRequire(bc);
  if (typeof bcMod.buildAllComponents !== 'function') {
    throw new Error('[fingerprint] buildAllComponents 를 찾지 못했습니다 — 번들 실패 의심.');
  }

  const { nodes, unknownProps } = await runBuild(bcMod);

  if (unknownProps.length) {
    throw new Error(
      `[fingerprint] 빌더가 처음 보는 시각 속성을 설정합니다: ${unknownProps.join(', ')}\n` +
      '  → scripts/lib/figma-build-mock.js 의 PROP_CLASS 에 VISUAL/LAYOUT/IGNORED 중 하나로 등록하세요.\n' +
      '  (등록하지 않으면 그 속성의 변경이 툴팁에서 조용히 빠집니다.)'
    );
  }
  if (nodes.length < MIN_NODES) {
    throw new Error(`[fingerprint] 노드 ${nodes.length}개 — 하한 ${MIN_NODES} 미만. 빌드가 중간에 죽었을 수 있습니다.`);
  }
  const sets = nodes.filter((n) => n.type === 'COMPONENT_SET');
  if (sets.length < MIN_SETS) {
    throw new Error(`[fingerprint] 컴포넌트 세트 ${sets.length}개 — 하한 ${MIN_SETS} 미만. 중단.`);
  }

  const spec = specRows(nodes);
  const sortedSpec = [...spec].sort();
  const hash = crypto.createHash('sha256')
    .update(JSON.stringify(Object.keys(tokens).sort().map((k) => [k, tokens[k]])))
    .update('\0')
    .update(sortedSpec.join('\n'))
    .digest('hex');

  return {
    tokens,                       // 키 → 값
    spec,                         // Set<행>
    setNames: sets.map((s) => s.props.name).filter(Boolean).sort(),
    hash,
    stats: { nodes: nodes.length, sets: sets.length, tokens: Object.keys(tokens).length, specRows: spec.size },
  };
}

module.exports = { fingerprint, SOURCE_FILES, MIN_NODES, MIN_SETS, ROW_SEP };
