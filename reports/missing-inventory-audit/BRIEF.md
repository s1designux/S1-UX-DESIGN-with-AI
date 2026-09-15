# 쪽지 — 빠진 컴포넌트·토큰 확인 (새 세션용)

작성 2026-09-15 · 요청: river "바텀시트 외에도 누락된 컴포넌트나 토큰에 대한 확인이 먼저 필요해"

## 무엇을 알아내는 일인가

디자인 시스템이 **가지고 있다고 말하는 것**과 **실제로 쓸 수 있게 나와 있는 것** 사이의 구멍을 전부 찾아 목록으로 만든다. 고치는 일이 아니라 **세는 일**이다.

구멍은 세 군데서 생긴다:

1. **정본에는 있는데 웹 배포본에 없다** — Figma 설치기(`build-components.ts`)가 만드는 세트 중 `ui-library/dist` 로 안 나온 것.
2. **문서·가이드는 쓰라고 하는데 부품이 없다** — 바텀시트가 그 예다(모바일에서 드롭다운 대신 쓰라고 §8 이 말하는데 독립 부품이 없다).
3. **토큰이 비어 있다** — 역할은 있는데 다크 값이 없거나, 이름만 있고 아무도 안 쓰거나, 특정 컴포넌트만 값을 못 받는 자리.

## 이미 뽑아 놓은 출발점 (다시 세지 말 것)

### 정본 세트 47 ↔ 웹 배포본 25

정본에만 있고 웹에 대응이 없는 이름 19개:

```
Multi Toggle Element · Search Input · Dropdown · Calendar ·
Date Picker Mobile Bottom Sheet · Bottom Sheet · Bottom Sheet Option ·
Calendar Cell · Calendar Tile · Time Picker Dropdown ·
Time Picker Mobile Bottom Sheet · GNB Utility Icon · Language Icon ·
StatusBar · NavBar · LoginGNB · WebTabBar · CI · Footer
```

**이 19개를 그대로 "빠진 것"이라고 보고하면 틀린다.** 셋으로 갈린다 —

- **이미 다른 부품 안에 들어가 있는 것**: Multi Toggle Element · Calendar Cell · Calendar Tile · Time Picker Dropdown · Bottom Sheet Option 같은 **속부품**. 웹에서는 부모 컴포넌트 안의 `data-s1-part` 로 존재할 수 있다 — 실제로 있는지 확인해서 갈라야 한다.
- **화면 흉내용 장식**: StatusBar · NavBar · LoginGNB · WebTabBar · CI · Footer 는 레거시 화면을 Figma 에 재현할 때 쓰는 크롬으로 보인다. 진짜 컴포넌트인지 판별이 필요하다.
- **진짜 빠진 것**: Bottom Sheet 가 확실한 한 건이다(아래 참조). Search Input · Calendar · Dropdown 도 후보.

### 바텀시트 — 정본에 이미 있다 (확인됨)

`build-components.ts` 에 `buildBottomSheet`(5152줄) · `buildBottomSheetOption`(5009줄) 이 있고 세트 이름은 `"Bottom Sheet"` · `"Bottom Sheet Option"` 이다. `component-facts.json` 에도 실측이 있다.

즉 **`BACKLOG.md` §🔴 0-b 의 2단계("정본에 대응물이 있는지 확인, 없으면 needs-decision")는 이미 답이 나왔다** — 있다. 새로 만드는 일이 아니라 **웹으로 옮기는 일**이다.

### registry ↔ 웹

`registry/components/*.json` 28개 중 웹에 없는 것은 `nav`(codeStatus: `not-started`) 하나뿐. `component-behavior.pc` · `index` 는 컴포넌트가 아니라 다른 용도 파일이다.

### 토큰 쪽 현재 숫자

| 검사기 | 지금 값 | 읽는 법 |
|---|---|---|
| `npm run tokens:orphans` | total 12 · unexpected 0 · **stale 4** | 아무도 안 쓰는 토큰. stale 4 가 무엇인지 확인 대상 |
| `npm run tokens:rolecheck` | 위반 0 (TEXT 1808개) | 글자색 역할 오연결 없음 |
| `npm run tokens:darkdiv` | outliers 16 · **crossGroups 13 · crossRole 6** | 라이트↔다크가 역할을 가로질러 갈린 자리. 전부 baseline 처리돼 있어 **차단되지 않는다** — 이게 부채인지 정상인지 판정이 없다 |
| `npm run gate:check` | 경고 17건 | 그중 토큰 관련이 몇 건인지 갈라야 한다 |

## 하는 방법

1. **세 목록을 각각 기계로 뽑는다** — 정본↔웹, registry↔웹, 문서가 지목하는 부품↔실제 부품. 손으로 세지 말고 스크립트로 뽑아 재현 가능하게 한다.
2. **판정은 사람이 한다.** 위 19개처럼 "속부품인가 · 장식인가 · 진짜 빠졌나"는 기계가 못 가른다. 📖 `source-reader` 로 실제를 확인하고(하드룰 H5 — 소스를 훑어 짐작하지 말 것), 애매하면 river 에게 (c)로 올린다.
3. **토큰은 '이름 개수'로 판정하지 않는다.** 이름이 있어도 값 배선이 끊겼으면 없는 것이고, 이름이 없어도 다른 토큰으로 풀리면 있는 것이다. 값까지 따라가서 본다.
4. **고치지 않는다.** 이 작업의 산출물은 목록과 우선순위까지다. 고치는 건 river 가 무엇부터 할지 정한 다음.

## 산출물

`reports/missing-inventory-audit/1-inventory.md` 한 장. 담을 것:

- 표 세 개: 빠진 컴포넌트 · 빠진/비어 있는 토큰 · 문서가 약속했는데 없는 것
- 각 줄마다: **무엇이 없나 · 어디서 없다고 판단했나(파일:줄) · 없으면 무엇이 막히나 · 크기(작업량 감)**
- 판정 못 한 것은 `needs-decision` 으로 따로 모아 river 에게 올릴 질문 형태로
- 마지막에 **river 가 고를 수 있게 우선순위 제안** — 전부 다 하자고 하지 말 것

river 는 비개발자다. 보고는 결론 한 줄 → 표 → 결정할 것 순서로, 10줄 안팎으로 줄인다. 자세한 건 이 파일에 두고 링크만 준다.

## 이 일과 겹치는 기록

- `BACKLOG.md` §🔴 0-b — 바텀시트 부품화(이 확인의 결과에 따라 순서가 바뀔 수 있다)
- `reports/ui-library/density-scale/workflow-state.json` `evidence.followUps` — 밀도 작업에서 남긴 후속
- `registry/governance/ui-library-migration.json` — 어떤 컴포넌트가 어느 단계까지 왔는지의 장부
- `reports/component-inventory-audit.md` — 종전 재고 조사(오래됐을 수 있다. 날짜부터 확인할 것)
