# 토큰 바인딩 스캔 (Token Binding Scan) — 미바인딩 raw hex 기계 검출·역매핑

> **목적:** Figma 컴포넌트/화면 노드 안의 모든 fill·stroke 중 **Variable 에 바인딩 안 된 raw hex**를 `use_figma`로 **사실 추출**하고, 각 hex 가 DS 토큰(vars-data 정본)에 등가물이 있는지 `figma-binding-lookup.js`로 **기계 판정**한다. LLM 이 "등가물 없음"을 주관적으로 선언해 raw hex 가 (b) 허용편차로 새던 구멍을 막는다.
>
> **왜 필요한가 (2026-06-19 — WebTabBar 335:3099 실패):** 검증기가 "브라우저 크롬이니 DS 색 아님"이라는 **카테고리 판단** 한 줄로 `#ffffff`(=color/surface/default)·`#353535`(=color/icon/gray-dark) 까지 (b) 통과시킴. DS 토큰 조회를 **실제로 하지 않은** 게 근본 원인. 이 스캔은 조회를 코드로 강제한다.
>
> **핵심 원리:** 스캔은 **사실 수집**만 한다(바인딩됐으면 variableId 있음·아니면 null — 판단 없음). 판정(❌(a)/❓(c))은 역매핑 스크립트의 결정론 결과로 한다.

## 언제 돌리나 (필수)

- **figma-library-build** 4단계 검증(component-verifier): 빌드한 모든 컴포넌트/세트 노드에 1회. EXACT 1건이라도 있으면 검문소 4 통과 불가.
- **screen-rebuild** 3층 검증: 토큰 바인딩 프레임에 1회.
- 단독: "이 컴포넌트 미바인딩 색 검사해줘" 시 임의 노드에 바로.
- **결과 표(아래 형식)가 4-verification.md 에 없으면 검증 HOLD** — 건너뛰면 표가 비어 들통남(절차 잠금).

---

## 1단계 — use_figma 바인딩 스캔 (read-only, 사실 추출)

`TARGET_NODE_ID` 만 바꿔 실행. SOLID fill·stroke 중 `boundVariables` 없는 것을 hex 로 뽑는다.

```js
const TARGET_NODE_ID = "335:3099"; // 검사할 컴포넌트/세트/프레임 (페이지 id 가능)

function rgbToHex(c) {
  const h = (n) => Math.round(n * 255).toString(16).padStart(2, '0').toUpperCase();
  return '#' + h(c.r) + h(c.g) + h(c.b);
}

// 노드가 있는 페이지로 전환
let target = null;
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  const found = await figma.getNodeByIdAsync(TARGET_NODE_ID);
  if (found) { target = found; break; }
}
if (!target) return { error: "노드 없음: " + TARGET_NODE_ID };

figma.skipInvisibleInstanceChildren = true;
const nodes = (('findAll' in target) ? target.findAll(() => true) : []).concat([target]);
const unbound = [];   // 미바인딩 raw hex
const hexCount = {};  // hex → 빈도
for (const node of nodes) {
  for (const prop of ['fills', 'strokes']) {
    const paints = node[prop];
    if (!Array.isArray(paints)) continue;
    paints.forEach((paint, i) => {
      if (!paint || paint.type !== 'SOLID' || paint.visible === false) return;
      const bv = node.boundVariables && node.boundVariables[prop];
      const bound = bv && bv[i];           // Variable 바인딩 여부 = 사실
      if (bound) return;                   // 바인딩됨 → OK (판단 없음)
      const hex = rgbToHex(paint.color);
      unbound.push({ node: node.name, id: node.id, prop, index: i, hex });
      hexCount[hex] = (hexCount[hex] || 0) + 1;
    });
  }
}
return {
  total: nodes.length,
  unboundCount: unbound.length,
  uniqueHex: Object.keys(hexCount).sort((a,b)=>hexCount[b]-hexCount[a]),
  unbound: unbound.slice(0, 80),  // 상세(노드명·prop)
};
```

> **추출 0건 = ⚠️ "스캔 안 됨"으로 보고(✅ 아님).** 노드 id 오류·페이지 미전환 가능 — 셀렉터 부패 방지(Gate 7 사상).
> `unboundCount === 0` 이면(전부 바인딩) → 바인딩 검사 통과(단 허용 예외 항목도 0이어야 함).

### ⛔ MCP 끊김 처리 — SKIP(통과) 금지, 재시도 → BLOCKED → 사용자 재요청

> use_figma 스캔이 **Figma MCP 연결 끊김/타임아웃/노드 접근 실패**로 못 돌면, **절대 SKIP-통과로 처리하지 않는다.** (SKIP을 통과로 쓰면 이번에 막은 "카테고리 판단" 과 똑같은 탈출구가 된다.) 아래 절차를 따른다:
>
> 1. **연결 확인(probe):** Figma `whoami`(또는 가벼운 `get_metadata`)를 1회 호출해 MCP 가 살아있는지 본다.
> 2. **재시도 ≤2회:** 일시적 blip 일 수 있으니 스캔을 최대 2회 재시도한다.
> 3. **그래도 실패 → 🔒 BLOCKED:** 검증 결과를 `BLOCKED` 로 기록한다. **PASS 조건은 `BLOCKED 0건` 이므로 검증이 통과되지 않는다**(component-verifier 판정 기준). 완료 보고 금지.
> 4. **사용자에게 재요청(명시 메시지):** 다음 형식으로 사용자에게 올린다 —
>    > 🔒 **토큰 바인딩 스캔 BLOCKED — Figma MCP 연결 필요.**
>    > {대상 노드 id} 의 미바인딩 색 검사를 못 했습니다(MCP {끊김/타임아웃}). Figma Desktop·MCP 재연결 후 **"바인딩 재검증해줘"** 라고 해주시면 스캔만 다시 돌립니다. (그 전까지 이 컴포넌트는 검증 미완료로 둡니다.)
> 5. **재연결 후:** 사용자가 재요청하면 1~2단계 스캔만 다시 실행해 BLOCKED 를 해소한다(전체 재빌드 불필요).
>
> > 즉 **"MCP 끊김 = 못 본 것"** 이지 **"문제 없음"** 이 아니다. 못 본 것은 통과시키지 않고 되묻는다.

---

## 2단계 — 역매핑 기계 판정 (figma-binding-lookup.js, 결정론)

1단계의 `uniqueHex` 를 스크립트에 넘긴다. vars-data(FOUNDATION_COLOR·SEMANTIC_COLOR light)에서 등가물을 찾는다.

```bash
# 직접 인자
node scripts/figma-binding-lookup.js '#FFFFFF' '#353535' '#DCDCDC'

# 스캔 JSON 파이프 (uniqueHex 또는 {hex:[...]} / [{hex},...] 허용)
echo '{"hex":["#ffffff","#353535","#dcdcdc","#ebebeb"]}' | node scripts/figma-binding-lookup.js --stdin
```

판정 규칙(스크립트 종료코드):
- **EXACT** (vars-data 에 정확히 같은 hex 존재) → **❌(a) 토큰 바인딩 필수.** (b)/(c) 금지. → **exit 2**
- **APPROX** (정확 일치 없음·근사만) → **❓(c) 사용자 판단**(근사 토큰 적용 vs 원색 유지). → exit 0
- EXACT 가 1건이라도 있으면 exit 2 → **검증 통과 불가**.

> EXACT 가 여러 semantic 후보를 내면, **역할에 맞는 토큰**을 빌더/사용자가 고른다(예: nav 아이콘 stroke `#353535` → `color/icon/gray-dark`). 스크립트는 "등가물 존재"를 증명할 뿐 역할까지 고르지 않는다.

---

## 3단계 — 결과 표 (4-verification.md 에 필수 기록)

스캔 + 역매핑을 합쳐 값별로 한 줄. **이 표 없으면 검문소 4 HOLD.**

```
### 토큰 바인딩 스캔 (use_figma 사실 추출 + figma-binding-lookup 역매핑)
- 스캔 노드: {TARGET_NODE_ID} · 총 노드 {n} · 미바인딩 {unboundCount}건 · 고유 hex {k}종

| hex | 노드·속성 | 역매핑 | 허용편차 명시? | 판정 |
|-----|-----------|--------|---------------|------|
| #FFFFFF | address_row fill | EXACT color/surface/default | 미명시 | ❌(a) 바인딩 |
| #353535 | nav icons stroke | EXACT color/icon/gray-dark | 미명시 | ❌(a) 바인딩 |
| #DCDCDC | tab_row fill | APPROX brand/gray(Δ4.1) | 미명시 | ❓(c) 사용자 |
| #0072CE | favicon | EXACT brand/blue | 허용편차 #N(favicon 브랜드색) | 🟡(b) 유지 |
```

**판정 우선순위:**
1. **EXACT 인데 허용편차 미명시** → ❌(a). 무조건 토큰 바인딩(빌더에게 반환).
2. **EXACT 인데 허용편차에 [노드명+속성유형] 명시됨** → 🟡(b) 유지(예: favicon 브랜드색을 raw 로 둔다고 plan 에 명시한 경우). 카테고리("크롬이니까")만으로는 (b) 불가.
3. **APPROX** → ❓(c). 근사 토큰 적용할지 원색 유지할지 사용자 결정. 임의 (b) 금지.

> **허용편차로 (b) 처리하려면** `2-plan.md` 허용편차 선언서에 **[노드명 + 속성유형(fill/stroke/text)]** 이 명시돼야 한다(component-verifier §raw hex (b) 우회 2단계 잠금).
