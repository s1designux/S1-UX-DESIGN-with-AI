#!/usr/bin/env node
/**
 * gen-registry-tokens.js — registry (A) 토큰층 재생성기 · **DRY-RUN 전용**
 * ─────────────────────────────────────────────────────────────────────────
 * (e-narrow) W0 파일럿. **쓰기 경로 없음** — registry 를 절대 수정하지 않는다.
 * input.json 하나에 대해 "생성했다면 어떻게 바뀌는가" 를 diff 로만 보여준다.
 *
 * 정본:
 *   A1 (semantic→foundation) = assets/css/tokens.css   ← KEY 가 tokens.css 에 있으면 그 값으로
 *   A2 (컴포넌트 슬롯→토큰)   = build-components.ts(mock 실행)  ← --input-* 슬롯 바인딩
 *
 * 절대 안 건드리는 것(C/B): _meta·notes·description·stateNotes·sizing·typography·
 *   governance·figma·tokenStatus·darkModeStatus. → 라인 단위 치환이라 구조적으로 불변.
 *
 * 안전장치:
 *   - 파일 쓰기 함수 없음. stdout 에 diff 만.
 *   - 토큰 줄("--x": "var(..)/#hex") 만 후보. 그 외 라인은 byte 불변.
 *   - C 필드가 1줄이라도 바뀌면 CRITICAL 로 표시하고 종료코드 2.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'registry/components/input.json'); // W0 = input 만

// ── A1 정본: tokens.css 파싱 (첫 :root = Light 기준, KEY→값문자열) ──────────
function loadTokensCss() {
  const css = fs.readFileSync(path.join(ROOT, 'assets/css/tokens.css'), 'utf8');
  const map = {};
  for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    if (!(m[1] in map)) map[m[1]] = m[2].trim(); // 첫 정의(Light) 우선
  }
  return map;
}

// ── A2 정본: build-components.ts mock 실행 → 슬롯별 바인딩 캡처 ──────────────
// token-role-check 와 동일 전략. 여기선 (chars → fillToken) 만 필요.
function makeStub() {
  const f = function () { return makeStub(); };
  return new Proxy(f, {
    get(_t, p) {
      if (p === 'then') return undefined;
      if (p === Symbol.toPrimitive) return () => 0;
      if (p === Symbol.iterator) return undefined;
      if (p === 'children') return [];
      if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0;
      return makeStub();
    },
    set() { return true; }, apply() { return makeStub(); },
  });
}
const REC = [];
function recNode(type) {
  const st = { type, chars: undefined, fillToken: undefined };
  REC.push(st);
  const tokenOf = (v) => Array.isArray(v) ? (v.find((p) => p && p.__token) || {}).__token : undefined;
  return new Proxy(function () {}, {
    get(_t, p) {
      if (p === '__state') return st;
      if (p === 'characters') return st.chars;
      if (p === 'appendChild') return (c) => c;
      if (p === 'insertChild') return (_i, c) => c;
      if (p === 'then') return undefined;
      if (p === Symbol.toPrimitive) return () => 0;
      if (p === Symbol.iterator) return undefined;
      if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0;
      return makeStub();
    },
    set(_t, p, v) {
      if (p === 'characters') st.chars = v;
      else if (p === 'fills') { const t = tokenOf(v); if (t) st.fillToken = t; }
      return true;
    },
  });
}
function taggedVarMap() { return new Proxy({}, { get: (_t, k) => (typeof k === 'string' ? { __tokenKey: k } : undefined) }); }

async function loadBuilderBindings() {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts')], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `genreg-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  const variables = new Proxy({ setBoundVariableForPaint: (paint, _f, v) => ({ ...paint, __token: v && v.__tokenKey }) }, { get: (t, p) => (p in t ? t[p] : makeStub()) });
  global.figma = new Proxy({
    createFrame: () => recNode('FRAME'), createComponent: () => recNode('COMPONENT'), createRectangle: () => recNode('RECTANGLE'),
    createText: () => recNode('TEXT'), createEllipse: () => recNode('ELLIPSE'), createLine: () => recNode('LINE'), createVector: () => recNode('VECTOR'),
    createNodeFromSvg: () => recNode('FRAME'), combineAsVariants: (cs) => { const s = recNode('COMPONENT_SET'); return s; },
    loadFontAsync: async () => {}, importComponentByKeyAsync: async () => ({ createInstance: () => recNode('INSTANCE') }),
    variables, currentPage: recNode('PAGE'),
  }, { get: (t, p) => (p in t ? t[p] : makeStub()) });
  const maps = { semanticColor: taggedVarMap(), foundationColor: taggedVarMap(), foundationNumber: taggedVarMap(), textStyles: new Proxy({}, { get: () => makeStub() }), semanticColorCollectionId: 'c', semanticLightModeId: 'l', semanticDarkModeId: 'd' };
  try { delete require.cache[tmp]; await require(tmp).buildAllComponents(maps); } finally { try { fs.unlinkSync(tmp); } catch (_) {} }
  // 슬롯 바인딩(현재 파일럿이 아는 것만): Input 안내메시지 = "안내 메세지" TEXT 노드의 fillToken
  const helper = REC.find((n) => n.type === 'TEXT' && n.chars === '안내 메세지' && n.fillToken);
  const bind = {};
  if (helper) bind['--input-helper-text'] = 'var(--' + helper.fillToken.replace(/^color\//, 'color-').replace(/\//g, '-') + ')';
  return bind;
}

// slash 토큰키(color/x/y) → css 변수(--color-x-y)
function slashToCss(k) { return '--' + k.replace(/^color\//, 'color-').replace(/\//g, '-'); }

(async () => {
  const A1 = loadTokensCss();
  const A2 = await loadBuilderBindings();

  const raw = fs.readFileSync(TARGET, 'utf8').split('\n');
  const changes = [];      // {ln, key, before, after, src}  ← 실제 적용될 것
  const flattened = [];    // {ln, key, cur, mirror}  ← 미러하면 파운데이션 직결(=평탄화). 결정1: 적용 금지·보고만
  const slotmap = [];      // {ln, key, cur}  ← A2 --input-* 슬롯맵 필요
  const ghost = [];        // {ln, key, cur}  ← tokens.css/빌더 어디에도 없음. 사람 결정 대기(결정3)

  const TOKEN_LINE = /^(\s*)"(--[a-z0-9-]+)"(\s*:\s*)"(var\([^)]+\)|#[0-9A-Fa-f]{3,8})"(,?)\s*$/;
  // 파운데이션 계열이면 = 평탄화
  const isFoundation = (v) => /^var\(\s*--color-(gray|blue|red|green|orange|yellow|skyblue|purple|brown|base|visual)/.test(v);

  raw.forEach((line, i) => {
    const m = line.match(TOKEN_LINE);
    if (!m) return; // 토큰 줄 아님 → C/구조. 절대 안 건드림.
    const [, , key, , curVal] = m;
    const ln = i + 1;
    if (key in A1) {
      const mir = A1[key];                       // 결정1: tokens.css 정의를 '그대로 미러'(resolve 금지)
      if (isFoundation(mir)) { flattened.push({ ln, key, cur: curVal, mirror: mir }); return; } // 평탄화 → 적용 안 함, 보고
      if (mir !== curVal) changes.push({ ln, key, before: curVal, after: mir, src: 'A1(mirror)' });
      return;
    }
    if (key in A2) { const nv = A2[key]; if (nv !== curVal) changes.push({ ln, key, before: curVal, after: nv, src: 'A2(builder)' }); return; }
    if (key.startsWith('--input-')) { slotmap.push({ ln, key, cur: curVal }); return; }
    ghost.push({ ln, key, cur: curVal });
  });

  // ── 리포트 ──────────────────────────────────────────────────────────────
  console.log('\n========== gen-registry-tokens.js — DRY-RUN (input.json) ==========');
  console.log('※ 쓰기 없음. 아래는 "생성했다면" 의 diff.\n');

  console.log('── ① 실제 적용될 변경 (clean mirror / A2) ──');
  for (const c of changes) console.log(`  L${c.ln} ${c.key}\n      - ${c.before}\n      + ${c.after}      [${c.src}]`);
  if (!changes.length) console.log('  (없음)');

  console.log('\n── ② 평탄화됨 = tokens.css가 파운데이션 직결 (결정1: 적용 안 함, 당신에게 물음) ──');
  for (const f of flattened) console.log(`  L${f.ln} ${f.key} : 현재 ${f.cur}  → tokens.css 미러=${f.mirror} (파운데이션 직결)`);
  if (!flattened.length) console.log('  (없음)');

  console.log('\n── ③ A2 슬롯맵 필요 (--input-* 빌더 노드↔슬롯 미매핑) ──');
  for (const s of slotmap) console.log(`  L${s.ln} ${s.key} = ${s.cur}`);
  if (!slotmap.length) console.log('  (없음)');

  console.log('\n── ④ 유령/대응없음 (결정3: 생성기 추측 금지, 사람 결정 대기) ──');
  for (const g of ghost) console.log(`  L${g.ln} ${g.key} = ${g.cur}`);
  if (!ghost.length) console.log('  (없음)');

  // ── 사용자 지정 검증 3항목 ────────────────────────────────────────────────
  console.log('\n── 검증 항목 (사용자 지정) ──');
  const c107 = changes.find((c) => c.key === '--input-helper-text');
  console.log(`  (1) :107 --input-helper-text  → ${c107 ? c107.after + '  ' + (/caption/.test(c107.after) ? '✅ caption' : '⚠️ caption 아님') : '변화없음/미매핑'}`);
  const f86 = flattened.find((f) => f.key === '--color-text-state-helper');
  const c86 = changes.find((c) => c.key === '--color-text-state-helper');
  console.log(`  (2) :86 --color-text-state-helper(stale text-secondary) → ${c86 ? c86.after + ' [적용]' : f86 ? `②평탄화로 분류(미러=${f86.mirror}, 결정1대로 적용 보류·당신에게 물음)` : '변화없음'}`);

  // (3) C 필드 0줄 변경 — 토큰줄만 후보였으므로 구조적으로 0. 역검사: 모든 대상 KEY 가 토큰(--color/--input)인가.
  const all = [...changes, ...flattened, ...slotmap, ...ghost];
  const suspicious = all.filter((x) => !/^--(color|input)/.test(x.key));
  cChanged = suspicious.length;
  console.log(`  (3) C 필드(_meta·notes·sizing·typography·stateNotes·governance·figma·tokenStatus) 변경: ${cChanged}줄 ${cChanged === 0 ? '✅' : '❌ 즉시 중단'}`);
  if (cChanged) { for (const s of suspicious) console.log(`      의심: L${s.ln} ${s.key}`); }

  console.log('\n========== END DRY-RUN ==========\n');
  process.exit(cChanged === 0 ? 0 : 2);
})();
