# 외부 라이브러리 출처 스캔·교체 루틴 (Provenance Scan & Swap)

> **목적:** Figma 화면/노드 안의 모든 인스턴스가 **로컬 정본(remote=false)** 또는 **허용된 V2.2 아이콘 키**에서만 왔는지 키 기준으로 판정하고, 위반(외부 라이브러리)을 **로컬 교체 또는 컴포넌트화**로 처리한다.
>
> **왜 필요한가 (2026-06-19):** 규칙은 글로 있었으나 ① 실제로 돌리는 결정론 스캔이 없었고 ② 판단이 "이름" 기반이라 외부 라이브러리도 `input`·`button`·`ic_*` 같은 정본스러운 이름을 써서 매번 샜다. **이름으로 판단 금지 — 컴포넌트 `key`를 허용목록과 대조하는 것만 신뢰한다.**
>
> **허용목록 단일 출처:** `registry/figma/allowed-remote-keys.json` (= build-components.ts `ICON_KEYS`). 새 정식 아이콘은 거기 키를 추가.

## 언제 돌리나 (필수 단계)

- **screen-rebuild** 빌드 종료 전(빌더 자가 프리플라이트) + component-verifier 검증 시(독립 재실행).
- **figma-library-build** 컴포넌트 빌드 종료 전 + 검증 시.
- 화면을 손댄 모든 작업의 **마지막**에 1회. 위반 0 이 아니면 완료 보고 금지.
- 단독 호출: 사용자가 "이 화면 외부 라이브러리 검사/정리해줘" 하면 임의 노드에 바로 실행.

## 스캔 스크립트 (use_figma, read-only)

`TARGET_NODE_ID` 와 `ALLOWED_KEYS` 만 바꿔 실행. ALLOWED_KEYS 는 `allowed-remote-keys.json` 의 값.

```js
const TARGET_NODE_ID = "268:368"; // 검사할 화면/프레임 (페이지 id 가능)
const ALLOWED_KEYS = new Set([
  "24b2df622d341e0af21cd4b23b4a7d23b97a5ea7","5ab251e0d90adb555ee2fa316f84e86041f19916",
  "6b764af642b8883e892754281950da0e971224d7","ca1d043ac09be07f827e939be3d8c3c7af8a8dd9",
  "ea0ffc118c38048f2cdfb5620be31c120426bb7a","5157e9edc76358e2e6bc1a5ebc1539ccf5f2e787",
  "a423e2e05cfff2f93062d6a83d6f3bdf79ca9647","e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581",
  "dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2",
  "d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7","b130623bad9bf035e273501b404bf7a245af1460", // password eye hide/show
]);

// 노드가 있는 페이지로 전환
let target = null;
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  const found = await figma.getNodeByIdAsync(TARGET_NODE_ID);
  if (found) { target = found; break; }
}
if (!target) return { error: "노드 없음: " + TARGET_NODE_ID };

figma.skipInvisibleInstanceChildren = true;
const instances = target.findAllWithCriteria({ types: ['INSTANCE'] });
const groups = {};
for (const inst of instances) {
  const mc = await inst.getMainComponentAsync();
  const remote = mc ? mc.remote : 'NO_MAIN';
  const key = mc ? mc.key : '';
  // 판정: 로컬(remote=false)=OK · remote인데 허용키=ICON_OK · 그 외 remote=위반
  let cls = remote === false ? 'LOCAL_OK' : (ALLOWED_KEYS.has(key) ? 'ICON_OK' : 'EXTERNAL_VIOLATION');
  const g = cls + '|' + inst.name + '|' + key;
  if (!groups[g]) groups[g] = { class: cls, instName: inst.name, mcName: mc?mc.name:'', key, count: 0, sampleIds: [] };
  groups[g].count++;
  if (groups[g].sampleIds.length < 3) groups[g].sampleIds.push(inst.id);
}
const arr = Object.values(groups);
const violations = arr.filter(g => g.class === 'EXTERNAL_VIOLATION');
return {
  total: instances.length,
  violationCount: violations.reduce((s,g)=>s+g.count,0),
  violations,                       // ❌ 처리 대상
  ok: arr.filter(g=>g.class!=='EXTERNAL_VIOLATION').length + ' groups (local+icon)'
};
```

> **추출 0건 = ⚠️ "모니터 안 됨"으로 보고(✅ 아님).** 셀렉터 부패 방지(Gate 7 사상).

## 위반 처리 결정 트리 (사용자 정책 2026-06-19)

각 `EXTERNAL_VIOLATION` 에 대해:

1. **로컬에 같은 컴포넌트가 있나?** → `figma.root.findAll(n => n.type==='COMPONENT_SET' && !n.remote)` 에서 의미상 동일 세트 탐색.
   - **있으면 → 로컬로 교체** (아래 swap). variant 축이 다르면 가장 가까운 로컬 variant 로 매핑하되, 매핑 불가한 옵션(예: 외부 input 의 `option=icon_1` 비밀번호 토글이 로컬 Input 에 없음)은 **needs-core-update** 로 올린다(임의 누락 금지).
   - **없으면 → 로컬 컴포넌트화** (figma-library-build: 🏗️ 빌더 + 🤖 검증 분리. ⭐ 단독 금지). 컴포넌트화 후 그 로컬을 인스턴스로 사용.
2. **아이콘인데 허용목록에 없으면** → (c)애매. 사용자 확인 → 정식 V2.2 아이콘이면 ICON_KEYS + allowed-remote-keys.json 에 키 추가.

### 로컬 교체 (swap)

```js
// 로컬 정본 variant COMPONENT(또는 COMPONENT_SET.defaultVariant) 를 키/이름으로 찾아서
const localComp = await figma.getNodeByIdAsync(LOCAL_VARIANT_ID); // COMPONENT
inst.swapComponent(localComp); // 위치·오버라이드 최대 보존
// 직후 재확인: (await inst.getMainComponentAsync()).remote === false 이어야 함
```

> 교체/컴포넌트화 후 **반드시 스캔을 재실행**해 `violationCount === 0` 확인 + `get_screenshot` 으로 시각 대조. 빌더≠검증자 분리 유지.
