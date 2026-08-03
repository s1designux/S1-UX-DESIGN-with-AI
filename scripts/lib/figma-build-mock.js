'use strict';
/**
 * figma-build-mock.js — build-components.ts 를 가짜 Figma 로 실행해 "표출 정보"를 기록한다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜 필요한가: 설치기가 Figma 에 무엇을 그리는지는 소스를 읽어서는 알 수 없다.
 *   COMPONENT_CATEGORIES 는 이름 목록뿐이고(색·보더·그림자 정보 0), 소스 해시는
 *   주석(파일의 14%)에 반응해 노이즈가 크다. 실제로 실행해서 노드에 설정되는 값을 봐야 한다.
 *
 * 기존 mock 이 이미 7벌 복제돼 있다(token-role-check · variant-coverage · component-anatomy 등).
 *   각기 다른 부분집합만 기록해서, 어느 하나도 "시각 사양 전부"를 담지 못한다.
 *   이 모듈은 그 합집합이며, 앞으로 그 7벌이 이리로 수렴할 자리다(이관은 별건).
 *
 * 설계 원칙:
 *   · **화이트리스트 금지** — 모든 property set 을 기록한다. 빌더가 새 시각 속성을 쓰기
 *     시작했는데 지문이 못 보면 "변경 없음"이 조용히 나온다. KNOWN_PROPS 밖이 관측되면 던진다.
 *   · 세트 소속 추적 — variant 이름(`Footer=Single`)만으로는 Modal 인지 Bottom Sheet 인지 모른다.
 *   · 결정론 — 좌표(x·y)는 캔버스 배치라 컴포넌트가 하나 늘면 전부 밀린다. 지문에서 제외한다.
 */

// build-components.ts 가 실제로 설정하는 property 전수(2026-07-30 실측 44종).
//   VISUAL   = 지문에 들어간다(Figma 화면에 보이는 것)
//   LAYOUT   = 지문에 들어간다(배치도 표출 정보다 — 여백이 바뀌면 화면이 바뀐다)
//   IGNORED  = 지문에서 뺀다(캔버스 좌표 = 스펙 프레임 배치 노이즈)
const PROP_CLASS = {
  // ── 시각 ──
  fills: 'VISUAL', strokes: 'VISUAL', effects: 'VISUAL',
  strokeWeight: 'VISUAL', strokeAlign: 'VISUAL',
  strokeTopWeight: 'VISUAL', strokeRightWeight: 'VISUAL',
  strokeBottomWeight: 'VISUAL', strokeLeftWeight: 'VISUAL',
  cornerRadius: 'VISUAL',
  topLeftRadius: 'VISUAL', topRightRadius: 'VISUAL',
  bottomLeftRadius: 'VISUAL', bottomRightRadius: 'VISUAL',
  visible: 'VISUAL', isMask: 'VISUAL', rotation: 'VISUAL',
  characters: 'VISUAL', fontSize: 'VISUAL', fontName: 'VISUAL',
  textAlignHorizontal: 'VISUAL', textAlignVertical: 'VISUAL', textAutoResize: 'VISUAL',
  // ── 배치 ──
  layoutMode: 'LAYOUT', primaryAxisSizingMode: 'LAYOUT', counterAxisSizingMode: 'LAYOUT',
  primaryAxisAlignItems: 'LAYOUT', counterAxisAlignItems: 'LAYOUT',
  itemSpacing: 'LAYOUT', clipsContent: 'LAYOUT',
  paddingTop: 'LAYOUT', paddingRight: 'LAYOUT', paddingBottom: 'LAYOUT', paddingLeft: 'LAYOUT',
  layoutGrow: 'LAYOUT', layoutAlign: 'LAYOUT', layoutPositioning: 'LAYOUT',
  layoutSizingHorizontal: 'LAYOUT', layoutSizingVertical: 'LAYOUT',
  minWidth: 'LAYOUT', constraints: 'LAYOUT',
  // ── 식별(지문의 키) ──
  name: 'IDENTITY',
  // ── 제외 ──
  x: 'IGNORED', y: 'IGNORED',
};

const NUMERIC_GETTERS = ['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'];

/** 무엇이든 받아 삼키는 만능 스텁 — 빌더가 부르는 미구현 API 를 조용히 통과시킨다. */
function makeStub() {
  const f = function () { return makeStub(); };
  return new Proxy(f, {
    get(_t, prop) {
      if (prop === 'then') return undefined;
      if (prop === Symbol.toPrimitive) return () => 0;
      if (prop === Symbol.iterator) return undefined;
      if (prop === 'children') return [];
      if (NUMERIC_GETTERS.includes(prop)) return 0;
      return makeStub();
    },
    set() { return true; },
    apply() { return makeStub(); },
  });
}

/** paint 배열에서 바인딩된 Variable 키를 꺼낸다(setBoundVariableForPaint 가 심어 둔 태그). */
function tokenOfPaints(val) {
  if (!Array.isArray(val)) return undefined;
  for (const p of val) if (p && p.__tokenKey) return p.__tokenKey;
  return undefined;
}

/** 값 직렬화 — 지문에 넣을 수 있는 안정된 문자열로. */
function serialize(prop, val) {
  if (prop === 'fills' || prop === 'strokes') {
    const t = tokenOfPaints(val);
    if (t) return t;
    if (Array.isArray(val) && val.length === 0) return '(없음)';
    return '(비바인딩)';
  }
  if (prop === 'effects') {
    if (!Array.isArray(val)) return '?';
    if (val.length === 0) return '(없음)';
    return val.map((e) => {
      const o = e && e.offset ? `${e.offset.x},${e.offset.y}` : '?';
      const c = e && e.color ? `${e.color.r},${e.color.g},${e.color.b},${e.color.a}` : '?';
      const bound = e && e.boundVariables ? Object.keys(e.boundVariables).sort().join('+') : '';
      return `${e && e.type}:${o}:r${e && e.radius}:s${e && e.spread || 0}:${c}${bound ? ':bv(' + bound + ')' : ''}`;
    }).join(' | ');
  }
  if (val && typeof val === 'object') {
    try { return JSON.stringify(val); } catch (_) { return '?'; }
  }
  return String(val);
}

/**
 * mock 을 만들어 buildAllComponents 를 실행하고 노드 기록을 돌려준다.
 * @param {object} mod  esbuild 로 번들해 require 한 build-components 모듈
 * @returns {Promise<{nodes: Array, unknownProps: string[]}>}
 */
async function runBuild(mod, opts) {
  const NODES = [];
  const seenProps = new Set();
  const trackOrigin = !!(opts && opts.trackOrigin);

  // 이 TEXT 노드를 만든 함수 이름(makeBoundText / buildOne / makeLabel).
  //   Gate 33 이 "컴포넌트 글자"와 "스펙 프레임 설명 라벨"을 구분하는 데 쓴다.
  //   esbuild 를 minify 없이 번들하므로 스택에 함수명이 그대로 남는다.
  //   opts.trackOrigin 일 때만 스택을 뜬다 → 지문 경로는 비용 0.
  const ORIGIN_FNS = ['makeBoundText', 'makeLabel', 'buildOne'];
  function originFromStack() {
    const st = new Error().stack || '';
    for (const line of st.split('\n')) {
      const hit = ORIGIN_FNS.find((f) => line.includes(f));
      if (hit) return hit;
    }
    return null;
  }

  function recNode(type) {
    const state = { type, props: {}, children: [], parentSet: null };
    // origin 은 **state 최상위**에 둔다(props 가 아님) — props 만 지문에 들어가므로
    //   여기 두면 installer-fingerprint 해시에 영향이 0 이다.
    if (trackOrigin && type === 'TEXT') state.origin = originFromStack();
    NODES.push(state);

    const attach = (child) => {
      const cs = child && child.__state;
      if (cs) state.children.push(cs);
      return child;
    };

    return new Proxy(function () {}, {
      get(_t, prop) {
        if (prop === '__state') return state;
        if (prop === 'type') return state.type;
        if (prop === 'name') return state.props.name;
        if (prop === 'characters') return state.props.characters;
        if (prop === 'children') return state.children;
        if (prop === 'appendChild') return attach;
        if (prop === 'insertChild') return (_i, c) => attach(c);
        // 텍스트 스타일 바인딩 결과를 기록한다. 종전엔 makeStub() 이 삼켜서
        //   "빌더가 요청한 크기·굵기"(fontSize·fontName 은 setter 라 이미 기록됨)와
        //   "실제로 적용된 스타일"을 짝지을 수 없었다 → 조용한 치환이 안 보였다.
        //   ⚠️ PROP_CLASS 에 textStyleId 를 등록하지 **않는다**: 등록하면 전 컴포넌트
        //   지문 해시가 한 번 통째로 바뀌어 Gate 6c 가 zip 재빌드를 요구한다.
        //   미등록의 정보 손실은 0 — textStyleKey() 가 (fontSize, style) 의 순수함수라
        //   결과가 바뀌려면 이미 지문에 있는 그 둘이 바뀌어야 한다.
        if (prop === 'setTextStyleIdAsync') return async (id) => { state.props.textStyleId = String(id); };
        if (prop === 'then') return undefined;
        if (prop === Symbol.toPrimitive) return () => 0;
        if (prop === Symbol.iterator) return undefined;
        if (NUMERIC_GETTERS.includes(prop)) return 0;
        return makeStub();
      },
      set(_t, prop, val) {
        if (typeof prop === 'string') {
          seenProps.add(prop);
          state.props[prop] = serialize(prop, val);
        }
        return true;
      },
    });
  }

  const variables = new Proxy({
    // 색 바인딩: 토큰 키를 paint 에 태그로 심는다 → fills/strokes 세터가 그 키를 기록.
    setBoundVariableForPaint: (paint, _field, v) => Object.assign({}, paint, { __tokenKey: v && v.__tokenKey }),
    // 그림자 겹당 바인딩: 어떤 필드가 어느 변수에 묶였는지 기록.
    setBoundVariableForEffect: (effect, field, v) => {
      const bv = Object.assign({}, effect.boundVariables || {});
      if (v && v.__tokenKey) bv[field] = v.__tokenKey;
      return Object.assign({}, effect, { boundVariables: bv });
    },
  }, { get: (t, p) => (p in t ? t[p] : makeStub()) });

  const taggedMap = () => new Proxy({}, {
    get: (_t, k) => (typeof k === 'string' ? { __tokenKey: k } : undefined),
  });

  const figmaObj = {
    createFrame: () => recNode('FRAME'),
    createComponent: () => recNode('COMPONENT'),
    createRectangle: () => recNode('RECTANGLE'),
    createText: () => recNode('TEXT'),
    createEllipse: () => recNode('ELLIPSE'),
    createLine: () => recNode('LINE'),
    createVector: () => recNode('VECTOR'),
    createNodeFromSvg: () => recNode('FRAME'),
    combineAsVariants: (comps) => {
      const set = recNode('COMPONENT_SET');
      for (const c of comps || []) set.appendChild(c);
      return set;
    },
    loadFontAsync: async () => {},
    importComponentByKeyAsync: async () => ({ createInstance: () => recNode('INSTANCE') }),
    variables,
    currentPage: recNode('PAGE'),
  };
  global.figma = new Proxy(figmaObj, { get: (t, p) => (p in t ? t[p] : makeStub()) });

  const maps = {
    semanticColor: taggedMap(),
    foundationColor: taggedMap(),
    foundationNumber: taggedMap(),
    // 요청된 스타일 키를 그대로 id 로 돌려주는 태그맵 — 빌더는 `.id` 만 읽는다
    //   (build-components.ts 의 requireStyle·makeBoundText 확인). 종전 makeStub() 도
    //   truthy 라 분기 결과는 동일하고, 이제 어떤 키를 요청했는지가 관측된다.
    textStyles: new Proxy({}, { get: (_t, k) => (typeof k === 'string' ? { id: k } : undefined) }),
    semanticColorCollectionId: 'cid',
    semanticLightModeId: 'light',
    semanticDarkModeId: 'dark',
    shadowVars: taggedMap(),
    semanticShadowCollectionId: 'scid',
    semanticShadowLightModeId: 'slight',
    semanticShadowDarkModeId: 'sdark',
  };

  // 예외를 삼키지 않는다 — 과거 ref 빌드가 중간에 죽으면 지문이 짧아져
  // "없던 신설"이 대량 생성된다. 조용한 오답보다 중단이 낫다.
  await mod.buildAllComponents(maps);

  // 세트 소속 역참조: COMPONENT_SET 의 자식(=variant)에 세트 이름을 달아 준다.
  for (const n of NODES) {
    if (n.type !== 'COMPONENT_SET') continue;
    for (const c of n.children) c.parentSet = n.props.name || '(무명 세트)';
  }

  const unknownProps = [...seenProps].filter((p) => !(p in PROP_CLASS)).sort();
  return { nodes: NODES, unknownProps };
}

module.exports = { runBuild, PROP_CLASS, makeStub };
