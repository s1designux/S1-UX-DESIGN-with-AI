#!/usr/bin/env node
/**
 * component-registration-check.js  (Gate 30 — 컴포넌트 등록 커버리지 · 전집합 대조)
 * ─────────────────────────────────────────────────────────────────────────
 * "설치기에 있는 컴포넌트가 **등록 표면 전부에** 빠짐없이 등록됐나?"를 기계 대조한다.
 *
 * 왜 필요한가 (2026-08-01 진단 실측):
 *   컴포넌트 1개를 추가하려면 손대야 할 표면이 최대 29곳인데, **기계 강제는 Gate 18 체인
 *   하나뿐**이었다(설치기 목록 → coverage 분류 → HTML 섹션). 그 밖의 registry/components·
 *   update-management(Gate 16 정본)·presentation-policy(Gate 23 정본)는 **누락해도 아무도
 *   안 잡았다** — Gate 16·23 이 "등록된 것만" 순회하기 때문(미등록=침묵 통과).
 *   실제로 mobile-bottom-nav·multi-toggle·filter-chip 이 미등록인 채 전 게이트를 통과 중이었다.
 *   Gate 18 의 "정본 전집합 ↔ 표면" 대조 패턴을 나머지 표면으로 복제한 것이 이 게이트다.
 *
 * 정본(baseline) = build-components.ts 의 COMPONENT_CATEGORIES_GRID 전집합
 *   그중 **main 컴포넌트**(component-page-coverage.json 의 sectionFor 에 있는 것 = 페이지 섹션을
 *   갖는 사용자 대면 컴포넌트)만 등록 대상으로 본다. 요소/셸 컴포넌트(noSectionNeeded)는
 *   Gate 18 이 이미 사유와 함께 분류·면제하고 있으므로 여기서 중복 강제하지 않는다.
 *
 * 검사 4종:
 *   (1) registry/components/<id>.json 파일 존재
 *   (2) registry/components/index.json 등재  (+ 디스크↔색인 양방향 드리프트)
 *   (2b) registry/index.json(루트 색인) components 맵 ↔ 디스크 양방향 대조 — 이 맵을
 *        build-registry-bundle.js 가 그대로 순회해 웹 번들을 만드는데, 종전엔 아무 게이트도
 *        안 봐서 디스크 20개 중 9개가 조용히 누락돼 있었다(2026-08-03 실측).
 *   (3) registry/governance/update-management.json components[] 등재 (Gate 16 정본)
 *   (4) registry/governance/component-presentation-policy.json components 등재 (Gate 23 정본, PC 한정)
 *   (5) **runners 완전성** — buildAllComponents 를 mock 으로 실행해 "members 에 있는데 빌더가
 *       없어 건너뛴" 목록(noRunner)을 받는다. 종전에는 `if (!run) continue;` 로 조용히 스킵돼
 *       설치 결과에서 통째로 빠져도 몰랐다(실측: "Time Picker Cell").
 *
 * 판정: 위 5종 위반 = ❌ FAIL(차단). 단 baseline 에 등재된 기존 부채는 면제하고 **신규만 차단**한다
 *   (게이트 강화가 마찰을 늘려 --no-verify 를 부르지 않게 — Gate 20/29 의 baseline 패턴).
 *   baseline: registry/governance/component-registration-baseline.json
 *
 * 출력 끝줄: `COMPREG_SUMMARY mains=<n> missingSpec=<n> missingIndex=<n> missingUpdate=<n> missingPresentation=<n> missingRootIndex=<n> noRunner=<n> falseExempt=<n> baselined=<n>`
 * 사용: node scripts/component-registration-check.js   (npm run components:registration)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const COVERAGE = path.join(ROOT, 'registry/governance/component-page-coverage.json');
const SPEC_DIR = path.join(ROOT, 'registry/components');
const SPEC_INDEX = path.join(SPEC_DIR, 'index.json');
const ROOT_INDEX = path.join(ROOT, 'registry/index.json');
const UPDATE_MGMT = path.join(ROOT, 'registry/governance/update-management.json');
const PRESENTATION = path.join(ROOT, 'registry/governance/component-presentation-policy.json');
const BASELINE = path.join(ROOT, 'registry/governance/component-registration-baseline.json');

// ── 설치기 정본 로드 (Gate 18 · stamp-installer-ui 와 동일 패턴) ──────────────
function loadBuildComponents() {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `bc-compreg-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  global.figma = makeStub();
  let mod;
  try { delete require.cache[tmp]; mod = require(tmp); }
  finally { try { fs.unlinkSync(tmp); } catch (_) { /* skip */ } }
  return mod;
}

// mock figma — orphan-token-check.js 의 스텁과 동형(빌더가 노드 API 를 자유롭게 만져도 죽지 않게).
//   추가로 이름 대입을 기록하되 **노드 타입을 구분**한다:
//     · allNames — 아무 노드에나 붙은 이름(참고용)
//     · setNames — `figma.combineAsVariants(...)` 가 돌려준 **바로 그 객체**에 붙은 이름
//                  = 실제로 컴포넌트 세트가 태어났다는 증거
//   왜 구분하나: 면제 검증을 "이름이 어딘가 붙었다"로 하면, 어떤 빌더가 다른 컴포넌트 이름을
//   내부 부품에 붙이는 순간 거짓 면제가 성립한다. 실제로 정상 빌드에서도 멤버 이름이 세트가
//   아닌 노드에 붙는 사례가 2건 존재한다(LoginGNB·WebTabBar). 지금은 무해하지만 전제가
//   우연에 기대게 되므로, 세트 생성 지점 하나만 태깅해 구조적으로 닫는다.
//   (🤖 component-verifier 재검증 (b) 지적 반영, 2026-08-01)
function makeStub(all, sets, isSet) {
  const f = function () { return makeStub(all, sets, false); };
  return new Proxy(f, {
    get(_t, p) {
      if (p === 'then') return undefined;
      if (p === Symbol.iterator) return undefined;
      if (p === 'children') return [];
      if (['width', 'height', 'x', 'y', 'length', 'strokeWeight', 'cornerRadius', 'fontSize'].includes(p)) return 0;
      // 세트가 태어나는 유일한 지점 — 이 호출의 **반환값만** 세트로 태깅한다.
      if (p === 'combineAsVariants') return () => makeStub(all, sets, true);
      return makeStub(all, sets, false);   // 자식·속성으로 내려가면 태깅 해제(과대 태깅 방지)
    },
    set(_t, p, v) {
      if (p === 'name' && typeof v === 'string') {
        if (all) all.add(v);
        if (isSet && sets) sets.add(v);
      }
      return true;
    },
    apply() { return makeStub(all, sets, false); },
  });
}

// buildAllComponents 를 mock 실행해 (1) noRunner 목록과 (2) 실제로 생성된 컴포넌트 세트 이름을 받는다.
async function mockBuild(mod) {
  const allNames = new Set();
  const setNames = new Set();
  const rec = () => new Proxy({}, { get() { return makeStub(allNames, setNames, false); } });
  const maps = {
    semanticColor: rec(), foundationColor: rec(), foundationNumber: rec(), textStyles: rec(),
    semanticColorCollectionId: 'c', semanticLightModeId: 'l', semanticDarkModeId: 'd',
  };
  global.figma = makeStub(allNames, setNames, false);
  const r = await mod.buildAllComponents(maps);   // 실패는 던진다 — 아래 참조
  return { noRunner: Array.isArray(r && r.noRunner) ? r.noRunner : [], allNames, setNames };
}

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

async function audit() {
  const mod = loadBuildComponents();
  const grid = mod.COMPONENT_CATEGORIES || [];
  const members = [];
  for (const cat of grid) for (const m of (cat.members || [])) members.push(m);
  if (members.length === 0) {
    throw new Error('COMPONENT_CATEGORIES 에서 컴포넌트를 얻지 못했습니다(0건). 정본 export 구조 변경 의심 — 검사 중단.');
  }

  const cfg = readJson(COVERAGE);
  const sectionFor = cfg.sectionFor || {};
  // main = 페이지 섹션을 갖는 사용자 대면 컴포넌트. 등록 id = 그 섹션 id(케밥 슬러그).
  const mains = [];
  for (const name of members) {
    const id = sectionFor[name];
    if (id && !mains.some((x) => x.id === id)) mains.push({ name, id });
  }

  const diskIds = new Set(fs.readdirSync(SPEC_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => f.replace(/\.json$/, '')));
  const indexIds = new Set((readJson(SPEC_INDEX).components || []).map((c) => c.id));
  const updateIds = new Set((readJson(UPDATE_MGMT).components || []).map((c) => c.id));
  const presentIds = new Set(Object.keys(readJson(PRESENTATION).components || {}));

  const baseline = fs.existsSync(BASELINE) ? readJson(BASELINE) : {};
  const exempt = (kind, id) => ((baseline[kind] || []).includes(id));

  const missingSpec = mains.filter((m) => !diskIds.has(m.id) && !exempt('spec', m.id));
  const missingIndex = mains.filter((m) => !indexIds.has(m.id) && !exempt('index', m.id));
  const missingUpdate = mains.filter((m) => !updateIds.has(m.id) && !exempt('updateManagement', m.id));
  // presentation-policy 는 PC 표출 규칙이라 PC 에 노출되는 것만 대상(mobile 전용은 제외).
  const mobileOnly = new Set(cfg.mobileOnly || []);
  const missingPresentation = mains.filter((m) =>
    !presentIds.has(m.id) && !mobileOnly.has(m.id) && !exempt('presentation', m.id));

  // 디스크↔색인 양방향 드리프트(등록 파일이 색인에서 빠지면 뷰어·번들에서 사라진다)
  const diskNotIndexed = [...diskIds].filter((id) => !indexIds.has(id) && !exempt('index', id));
  const indexedNotOnDisk = [...indexIds].filter((id) => !diskIds.has(id));

  // (2b) 루트 색인(registry/index.json) components 맵 ↔ 디스크 — 번들 생성기의 실제 순회 대상
  const rootMap = readJson(ROOT_INDEX).components || {};
  const rootIds = new Set(Object.keys(rootMap));
  const diskNotInRoot = [...diskIds].filter((id) => !rootIds.has(id) && !exempt('rootIndex', id));
  const rootNotOnDisk = [...rootIds].filter((id) => !diskIds.has(id));

  // ── runners 완전성 + **면제 선언 검증** ────────────────────────────────────
  //   mock 실행이 예외로 죽으면 판정을 '이상 없음'으로 만들지 않고 **던진다**(호출부가 FAIL 처리).
  //   종전엔 null 을 돌려 경고(비차단)로 빠졌는데, 그러면 mock 이 언젠가 깨지는 순간
  //   runner 완전성 검사가 조용히 꺼진다 — 이 게이트가 막으려는 실패가 정확히 그것이다.
  //   (🤖 component-verifier 지적 R1, 2026-08-01)
  let noRunner, setNames;
  try {
    ({ noRunner, setNames } = await mockBuild(mod));
  } catch (e) {
    throw new Error(
      `buildAllComponents mock 실행 실패 — runner 완전성을 판정할 수 없습니다: ${e.message}\n` +
      '  (판정 불가를 통과로 처리하지 않습니다. 빌더가 mock 환경에서 죽는 원인을 먼저 고치세요.)'
    );
  }

  // BUILT_BY_PARENT 는 "부모가 자식 세트를 만들어 준다"는 **면제** 선언이다.
  //   선언만 믿으면, 이름 한 줄로 진짜 누락을 덮어 게이트를 침묵시킬 수 있다
  //   (🤖 component-verifier 가 실제로 재현: 허위 선언 → 컴포넌트 통째 소실인데 게이트 초록).
  //   그래서 **선언된 자식이 실제로 컴포넌트 세트로 만들어졌는지** 기계로 확인한다.
  //   판정 근거는 setNames(=combineAsVariants 반환 객체에 붙은 이름)뿐이다 — 아무 노드에나
  //   같은 이름을 붙이는 것으로는 면제가 성립하지 않는다.
  const builtByParent = mod.BUILT_BY_PARENT || {};
  const falseExemptions = [];
  for (const child of Object.keys(builtByParent)) {
    if (!setNames.has(child)) {
      falseExemptions.push(`${child} (선언상 부모=${builtByParent[child]} 가 만든다고 했으나 빌드 결과에 그 이름의 컴포넌트 세트가 없음)`);
    }
  }

  // 면제 건수는 **검사 종류 키만** 센다(_policy 같은 설명용 배열이 섞이면 수치가 거짓이 된다).
  const KINDS = ['spec', 'index', 'updateManagement', 'presentation'];
  const baselinedCount = KINDS.reduce((s, k) => s + ((baseline[k] || []).length), 0);

  return {
    members, mains, missingSpec, missingIndex, missingUpdate, missingPresentation,
    diskNotIndexed, indexedNotOnDisk, diskNotInRoot, rootNotOnDisk,
    noRunner, falseExemptions, baselinedCount,
  };
}

module.exports = { audit };

if (require.main === module) {
  (async () => {
    console.log('\n[Gate 30] 컴포넌트 등록 커버리지 — 설치기 전집합 ↔ 등록 표면 4종');
    let r;
    try { r = await audit(); }
    catch (e) { console.error(`  ❌ 검사 실행 실패: ${e.message}`); process.exit(1); }

    const list = (arr) => arr.map((x) => (x.id ? `${x.id}(${x.name})` : x)).join(', ');
    let bad = 0;

    if (r.missingSpec.length) { bad++; console.log(`  ❌ registry/components/<id>.json 없음 ${r.missingSpec.length}: ${list(r.missingSpec)}`); }
    if (r.missingIndex.length) { bad++; console.log(`  ❌ components/index.json 미등재 ${r.missingIndex.length}: ${list(r.missingIndex)}`); }
    if (r.missingUpdate.length) { bad++; console.log(`  ❌ update-management.json 미등재 ${r.missingUpdate.length}: ${list(r.missingUpdate)} (Gate 16 이 못 보는 사각)`); }
    if (r.missingPresentation.length) { bad++; console.log(`  ❌ component-presentation-policy.json 미등재 ${r.missingPresentation.length}: ${list(r.missingPresentation)} (Gate 23 이 못 보는 사각)`); }
    if (r.diskNotIndexed.length) { bad++; console.log(`  ❌ 디스크에 있으나 index.json 미등재 ${r.diskNotIndexed.length}: ${r.diskNotIndexed.join(', ')} (번들·뷰어에서 누락됨)`); }
    if (r.indexedNotOnDisk.length) { bad++; console.log(`  ❌ index.json 이 가리키는 파일 없음 ${r.indexedNotOnDisk.length}: ${r.indexedNotOnDisk.join(', ')}`); }
    if (r.diskNotInRoot.length) { bad++; console.log(`  ❌ 루트 registry/index.json components 맵 미등재 ${r.diskNotInRoot.length}: ${r.diskNotInRoot.join(', ')} (build:bundle 이 이 맵을 순회 — 웹 번들에서 누락됨)`); }
    if (r.rootNotOnDisk.length) { bad++; console.log(`  ❌ 루트 registry/index.json 이 가리키는 파일 없음 ${r.rootNotOnDisk.length}: ${r.rootNotOnDisk.join(', ')}`); }

    if (r.noRunner.length) {
      bad++;
      console.log(`  ❌ 빌더(runners) 미등록 ${r.noRunner.length}: ${r.noRunner.join(', ')} — 설치 시 조용히 빠짐`);
    }
    if (r.falseExemptions.length) {
      bad++;
      console.log(`  ❌ 거짓 면제 선언 ${r.falseExemptions.length}: ${r.falseExemptions.join(' · ')}`);
      console.log('     → BUILT_BY_PARENT 는 "부모가 만들어 준다"는 선언인데 실제 빌드 결과에 그 컴포넌트가 없습니다.');
    }

    if (!bad) {
      console.log(`  ✅ 등록 누락 0 — main ${r.mains.length}개가 4개 표면 전부 등재 · 빌더 미등록 0 · 면제 선언 ${Object.keys(r.falseExemptions).length === 0 ? '실빌드 확인' : ''} (설치기 전집합 ${r.members.length})`);
    }
    if (r.baselinedCount) console.log(`  ℹ️ baseline 면제 ${r.baselinedCount}건(기존 부채 — 신규만 차단)`);

    console.log(`COMPREG_SUMMARY mains=${r.mains.length} missingSpec=${r.missingSpec.length} missingIndex=${r.missingIndex.length} missingUpdate=${r.missingUpdate.length} missingPresentation=${r.missingPresentation.length} missingRootIndex=${r.diskNotInRoot.length + r.rootNotOnDisk.length} noRunner=${r.noRunner.length} falseExempt=${r.falseExemptions.length} baselined=${r.baselinedCount}`);
    process.exit(bad ? 1 : 0);
  })();
}
