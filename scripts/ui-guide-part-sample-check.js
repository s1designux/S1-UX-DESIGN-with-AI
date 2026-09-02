#!/usr/bin/env node
/**
 * ui-guide-part-sample-check.js — 「부품 표본 격리」 검사 (Gate 44 의 판정부)
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜 만들었나 (river 지적 2026-09-02):
 *   Table 안내 화면의 **셀 단위 표본**이 정본에 없는 선을 보여주고 있었다.
 *     · 정본: 셀이 가진 선은 아래 1px(color/table/border/default) **하나뿐**
 *       (build-components.ts buildTableCell — border.y = 높이-1)
 *     · 정본: 위 2px · 아래 1px 진한 선(border/strong)은 **표 세트**가 그리는 외곽선
 *       (build-components.ts buildTable — edge-top · edge-bottom)
 *   그런데 셀 한 칸짜리 표본을 **컴포넌트 루트**(`[data-s1-component="table"]`)로 감싸는 바람에
 *   루트가 소유한 외곽선 규칙이 낱개 셀마다 그려졌다. 실물 배포본 CSS 는 정확했고
 *   **안내 화면의 표본 조립만 틀렸다** — 그래서 기존 검사기(계약·파리티·수치 대조)가 전부 통과했다.
 *
 * ★ 무엇을 막나 (일반화한 실패 유형):
 *   「부품 표본이 상위(세트)가 소유한 장식을 함께 보여주는 것」.
 *   부품 표본은 그 부품이 소유한 것만 보여야 한다. 사람 눈이 아니면 못 잡던 사각지대다.
 *
 * ★ 규칙 정본(이 파일이 규칙을 새로 만들지 않는다):
 *   registry/governance/component-presentation-policy.json
 *     _meta.uiLibraryGuideLayout.partSampleIsolation  (river 지시 2026-09-02)
 *
 * ★ 판정 방식 — 렌더된 DOM + 실제 dist CSS 대조 (추측 없음)
 *   1. 안내 화면에서 `data-guide-sample="part"` 로 표시된 표본을 찾는다.
 *   2. 그 표본이 컴포넌트 루트(`data-s1-component`)를 껍데기로 쓰고 있으면,
 *      실제 dist CSS 에서 **루트 선택자 단독 규칙**이 칠하는 테두리·그림자를 추출한다.
 *   3. 표본이 그 장식을 끄지 않았으면 실패. 의도적으로 남기려면 표본에
 *      `data-guide-sample-keeps="border-top,…"` 로 선언한다(그러면 경고로 보인다 — 숨겨지지 않는다).
 *
 * 사용: ui-guide-render-check.js 가 렌더한 DOM 을 넘겨 호출한다.
 *       node scripts/ui-guide-part-sample-check.js --selftest   (적대 테스트)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'ui-library/dist/components');
const POLICY = path.join(ROOT, 'registry/governance/component-presentation-policy.json');

/** 테두리·그림자처럼 "가장자리를 칠하는" 선언만 본다. 배경·글자색은 부품도 갖는 값이라 제외. */
const EDGE_PROPS = ['border', 'border-top', 'border-right', 'border-bottom', 'border-left', 'box-shadow', 'outline'];
const isPaint = (value) => {
  const v = value.trim().toLowerCase();
  if (!v || v === 'none' || v === '0' || v === '0px') return false;
  return !/^0(px)?\s+(none|solid|dashed)/.test(v);
};

/** dist CSS 에서 "루트 선택자 단독" 규칙이 칠하는 가장자리 속성을 뽑는다. */
function rootOwnedEdges(componentId) {
  const file = path.join(DIST, `${componentId}.css`);
  if (!fs.existsSync(file)) return [];
  /* 주석을 먼저 걷어낸다 — 주석 안 텍스트가 선택자에 섞이면 루트 규칙을 못 찾는다. */
  const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const root = `[data-s1-component="${componentId}"]`;
  const owned = new Map();
  const ruleRe = /([^{}]+)\{([^}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const selectors = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    /* 루트 하나만 가리키는 규칙만 본다. 부품(자손) 규칙은 부품 소유라 대상이 아니다. */
    if (!selectors.some((s) => s === root)) continue;
    for (const decl of m[2].split(';')) {
      const [rawProp, ...rest] = decl.split(':');
      if (!rest.length) continue;
      const prop = rawProp.trim().toLowerCase();
      if (!EDGE_PROPS.includes(prop)) continue;
      const value = rest.join(':').trim();
      if (isPaint(value)) owned.set(prop, value);
    }
  }
  return [...owned.entries()].map(([prop, value]) => ({ prop, value }));
}

/** 인라인 style 이 그 속성을 껐는지 — `border-top:0` · `border-top:none` · 축약 `border:0` 모두 인정. */
function suppressed(inlineStyle, prop) {
  const style = (inlineStyle || '').toLowerCase();
  const off = (p) => new RegExp(`(^|;)\\s*${p}\\s*:\\s*(0(px)?|none)\\s*(;|$)`).test(style);
  if (off(prop)) return true;
  if (prop.startsWith('border-') && off('border')) return true;
  return false;
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : null;
};

/** 렌더된 DOM 문자열을 검사한다. { failures: string[], warnings: string[] } */
function checkDom(dom, { label = 'pc' } = {}) {
  const failures = [];
  const warnings = [];
  const tagRe = /<[a-z]+[^>]*data-guide-sample="part"[^>]*>/gi;
  let m;
  let seen = 0;
  while ((m = tagRe.exec(dom))) {
    seen += 1;
    const tag = m[0];
    const id = attr(tag, 'data-s1-component');
    if (!id) continue;                       /* 루트를 껍데기로 안 쓰면 이 검사 대상이 아니다 */
    const style = attr(tag, 'style') || '';
    const keeps = (attr(tag, 'data-guide-sample-keeps') || '').split(',').map((s) => s.trim()).filter(Boolean);
    for (const { prop, value } of rootOwnedEdges(id)) {
      if (suppressed(style, prop)) continue;
      if (keeps.includes(prop)) {
        warnings.push(`${label}: ${id} 부품 표본이 세트 소유 장식 ${prop}(${value})을 의도적으로 남겼습니다(data-guide-sample-keeps 선언).`);
        continue;
      }
      failures.push(`${label}: ${id} 부품 표본이 세트가 소유한 ${prop}(${value})을 함께 보여줍니다 — 부품 표본은 부품이 소유한 것만 보여야 합니다. 표본에서 그 장식을 끄거나 data-guide-sample-keeps 로 선언하세요.`);
    }
  }
  return { failures, warnings, samples: seen };
}

/** 규칙 정본이 선언돼 있는지 — 검사기가 규칙을 스스로 만들지 않는다는 확인. */
function policyDeclared() {
  try {
    const policy = JSON.parse(fs.readFileSync(POLICY, 'utf8'));
    return Boolean(policy?._meta?.uiLibraryGuideLayout?.partSampleIsolation);
  } catch (_) { return false; }
}

/** 적대 테스트 — 검사기가 실제로 잡는지 스스로 확인한다(가짜 합격 방지). */
function selfTest() {
  const bad = '<div data-guide-sample="part" data-s1-component="table" data-size="md" style="width:auto;"></div>';
  const good = '<div data-guide-sample="part" data-s1-component="table" data-size="md" style="width:auto;border-top:0;border-bottom:0;"></div>';
  const kept = '<div data-guide-sample="part" data-s1-component="table" data-guide-sample-keeps="border-top,border-bottom" style="width:auto;"></div>';
  const results = [
    ['위반 표본을 잡는다', checkDom(bad).failures.length > 0],
    ['정상 표본은 통과한다', checkDom(good).failures.length === 0],
    ['선언한 예외는 경고로 보인다', checkDom(kept).failures.length === 0 && checkDom(kept).warnings.length > 0],
    ['규칙 정본이 선언돼 있다', policyDeclared()]
  ];
  let ok = true;
  for (const [name, passed] of results) {
    console.log(`  ${passed ? '✅' : '❌'} ${name}`);
    if (!passed) ok = false;
  }
  return ok;
}

if (require.main === module) {
  if (process.argv.includes('--selftest')) {
    console.log('🔎 부품 표본 격리 검사기 — 적대 테스트');
    process.exit(selfTest() ? 0 : 1);
  }
  console.log('이 검사기는 ui-guide-render-check.js 가 렌더한 DOM 을 받아 실행됩니다. 단독 실행은 --selftest 만 지원합니다.');
}

module.exports = { checkDom, rootOwnedEdges, policyDeclared, selfTest };
