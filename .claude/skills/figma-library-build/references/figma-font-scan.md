# Figma 폰트 일관성 스캔 (L2 — 진짜 보증)

> use_figma 로 author/override 한 캔버스 텍스트의 **최종 폰트가 정본(Pretendard)인지** 노드 데이터로 검증한다.
> 정본 정책: `registry/governance/figma-font-policy.json`. 이 스캔은 component-verifier(§(C) figma-library-build·§(B) screen-rebuild)의 **필수 항목**이다.

## 왜 렌더가 아니라 데이터인가 (핵심)

MCP 렌더 환경엔 Pretendard 가 설치돼 있지 않다. 그래서 `get_screenshot`/`node.screenshot()` 는
**Pretendard 든 Noto 든 둘 다 대체폰트로** 그린다 → 스크린샷으로는 폰트 정체성을 **구분 불가**.
진실은 오직 노드의 `getStyledTextSegments(['fontName'])` 와 `textStyleId` **데이터**에 있다.

> 실패 모드별 도구: **레이아웃·시각 깨짐 = 렌더**, **폰트 정체성 = 데이터 스캔.** 폰트를 렌더로 판정하지 말 것.

## 스캔 코드 (use_figma)

대상 세트 id 를 넣고 실행한다. 세트 내 **전 TEXT 노드**의 폰트 family 를 수집해 비-canonical 을 적발한다.

```js
const SET_ID = '<세트 노드 id>';          // 예: '523:7771'
const CANONICAL = 'Pretendard';            // figma-font-policy.json canonicalFamily

const set = await figma.getNodeByIdAsync(SET_ID);
if (!set || !('children' in set)) return { error: 'set not found', SET_ID };

const offenders = [];   // 비-canonical 폰트
let textCount = 0;
for (const variant of set.children) {
  const texts = variant.findAll(n => n.type === 'TEXT');
  for (const t of texts) {
    textCount++;
    const segs = t.getStyledTextSegments(['fontName']);
    for (const s of segs) {
      if (s.fontName.family !== CANONICAL) {
        let styleName = '(none)';
        if (t.textStyleId && typeof t.textStyleId === 'string') {
          try { const st = await figma.getStyleByIdAsync(t.textStyleId); styleName = st ? st.name : '(id, not found)'; } catch (e) {}
        }
        offenders.push({
          variant: variant.name,
          chars: t.characters.slice(0, 20),
          font: s.fontName.family + ' ' + s.fontName.style,
          boundStyle: styleName
        });
      }
    }
  }
}

return {
  setName: set.name,
  textCount,
  offenderCount: offenders.length,
  offenders,
  verdict: textCount === 0 ? '⚠️ NOT_VERIFIED(추출 0건 — selector 부패 의심)'
         : offenders.length === 0 ? '✅ PASS(전 텍스트 Pretendard)'
         : '❌ FAIL(비-Pretendard 잔존)'
};
```

## 판정 규칙

| 결과 | 판정 | 처리 |
|------|------|------|
| `textCount === 0` | ⚠️ **NOT_VERIFIED** (✅ 아님) | 세트 id/selector 부패 — Gate 7 사상. 재확인 후 다시 스캔 |
| `offenderCount === 0` | ✅ PASS | 통과 |
| `offenderCount > 0` | ❌ **(a) FAIL** | 검문소 통과 불가. 빌더에 재바인딩 반환 |

- **비-canonical 폰트 1건이라도 = ❌(a).** 허용편차(b)로 빼지 말 것. (Pretendard 미설치 렌더 폴백과 혼동 금지 — 이 스캔은 노드 데이터라 렌더 폴백 영향 없음.)
- **author/override 라벨은 `boundStyle` 이 `(none)` 이 아니어야** 견고하다(텍스트 스타일 바인딩). raw 폰트는 다음 편집에서 다시 깨질 위험 → 가능하면 스타일 바인딩 권장(원본 컴포넌트가 raw 면 weightStyleMap 으로 동일 metric 스타일 바인딩).

## 재바인딩 방법 (FAIL 시)

`registry/governance/figma-font-policy.json` 의 `rebindStrategy` + `weightStyleMap` 참조:
- 원본 컴포넌트 라벨의 size/weight 를 읽어 동일 텍스트 스타일을 `setTextStyleIdAsync` 로 바인딩
  (Pretendard 로드 불필요 — MCP 에서도 동작. 검증됨)
- 예: 탭 라벨 Pretendard Medium 14 → `body/14M`(S:0b8aad8…) · 버튼 라벨 → `body/16M`(S:886ca7…) · 타이틀 → `title/20B`(S:46f6df…)
- 매칭 스타일이 없으면 임의 raw 폰트 잔존 금지 → **needs-decision** 으로 보고.
