# 텍스트 스타일 일괄 적용 — 빌드 계획 (figma-library-build)

**대상:** SW UX GUIDE V3.0-TEST / fileKey `cysG5U1udpQqVagYY1hWHW` / Core 페이지 `5:5706`
**의도:** 텍스트 노드에 기존 Pretendard 텍스트 스타일이 거의 미적용(144/3442) + 일부 Noto 폴백. 전 텍스트를 정본 텍스트 스타일에 바인딩(폰트도 Pretendard로 정정).

## 1단계 진단 결과 (인벤토리)
- **텍스트 스타일 19개 존재** (Pretendard 타입램프): caption·helper·title/{32B,24B,20B,20R,18M,16B,16M,14B}·body/{18M,16M,16R,14M,14R,12M,12R,10M,10R}.
- 텍스트 노드 3442개 중 **스타일 적용 144 / 미적용 3298**, mixed 0.
- **Pretendard는 플러그인 런타임에서 loadFontAsync 불가**(클라우드 폰트셋). 단 **`setTextStyleIdAsync`로 기존 스타일 적용은 폰트 로드 없이 동작 확인**(프로브: Noto→body/14R→"font now Pretendard Regular").
- 오프-램프(램프에 없는 크기): Medium11(170)·Bold12(83)·Bold13(63)=대부분 `— Spec` 시트 **주석/변형 라벨**. Regular13(17)=실제 컴포넌트(Table Cell SMALL "1층 정문" + url바 "m.s1.co.kr").

## 사용자 결정 (검문소 2)
1. **적용 범위 = 전체** (스펙시트 주석 라벨 포함).
2. **Table Cell SMALL 13px + url 13px → 14px(body/14R) 정정.**

## 매핑 규칙 (weight, 현재 size → 스타일)  ※`*`=스냅
| Regular | Medium | Bold |
|---|---|---|
| 10→body/10R · 12→body/12R · 13→body/14R* · 14→body/14R · 16→body/16R · 20→title/20R | 10→body/10M · 11→body/12M* · 12→body/12M · 14→body/14M · 16→body/16M · 18→body/18M | 12→title/14B* · 13→title/14B* · 14→title/14B · 16→title/16B · 20→title/20B · 24→title/24B · 32→title/32B |

- title/body 시각 동일 쌍(Medium16/18, Regular12)은 **body 기본**(픽셀 영향 0, 추후 재태깅 가능).
- Noto Sans KR 노드도 같은 (weight,size) 규칙으로 매핑 → 폰트 Pretendard로 정정.

## 빌드 지시 (figma-library-builder)
1. **`setTextStyleIdAsync(styleId)` 로 적용** — `loadFontAsync(Pretendard)` 호출 금지(불가). 스타일 id는 `getLocalTextStylesAsync()`로 이름→id 매핑.
2. **인스턴스 내부 텍스트는 건너뛴다** — COMPONENT/COMPONENT_SET 정의 + 독립(스펙시트) 텍스트에만 적용해 인스턴스가 상속하게 함(override 남발 방지).
3. **먼저 검증:** 현재 폰트가 Pretendard(unloadable)인 미적용 노드 2~3개에 setTextStyleIdAsync가 폰트에러 없이 되는지 확인 후 일괄.
4. **배치 처리**(노드 수천 개 → 여러 use_figma 호출로 분할). 각 호출 후 진행 카운트 return.
5. 적용 불가/예외(에러나는 노드, 매핑 안 되는 잔여)는 `needs-decision`으로 반환. 임의 폰트 폴백 금지.
6. 대표 컴포넌트(Button·Input·Table Cell·StatusBar Web·스펙시트 1장) 스크린샷 첨부. **합격 판정은 안 함 → component-verifier로.**
7. node-map.json: 스타일별 적용 건수·실패·스킵(인스턴스) 기록.

## 허용편차 선언
- 13→14, 11→12, Bold12/13→14 **스냅으로 일부 텍스트 크기 변경**(사용자 승인). 스펙시트 주석 라벨이 약간 커짐.
- 플러그인이 Pretendard를 못 불러와 **신규 텍스트 편집은 불가**(이번 작업은 편집이 아니라 스타일 적용이라 무관).
