# UI 라이브러리 컴포넌트 제작 체크리스트

컴포넌트마다 이 체크리스트의 사본을 작업 기록에 둔다. 체크하지 못한 항목은 빈칸으로 남기고, 통과하지 않은 컴포넌트를 `approved`로 표시하지 않는다.

규칙 정본: [`ui-library-code-contract.json`](ui-library-code-contract.json)  
설명: [`ui-library-authoring-guide.md`](ui-library-authoring-guide.md)

Contract version: `0.1.2`

## 기본 정보

| 항목 | 기록 |
|---|---|
| 컴포넌트 ID |  |
| 작업 버전 |  |
| 정본 위치 |  |
| Registry 위치 |  |
| 담당 구현자 |  |
| 별도 검증자 | 위험 조건일 때 기록 |
| 상태 | draft / needs-decision / candidate / verified / approved |

## 1. 제작 전

- [ ] 정본 빌더 또는 승인된 원본이 있다.
- [ ] Registry에 사용 맥락·웹 의미·접근성·행동 계약이 있다.
- [ ] variant·size·state 목록이 정본과 일치한다.
- [ ] 아이콘과 토큰이 모두 정본에 있다.
- [ ] 공통 문구·패턴 문구·아이콘의 정본 위치가 기록돼 있다.
- [ ] 아이콘의 누르는 영역·틀·실제 도형 크기가 각각 기록돼 있다.
- [ ] 기존 코어·모듈과 중복되지 않는다.
- [ ] 이미지로 알 수 없는 동작을 사전 질문으로 해소했다.
- [ ] `needs-decision`이 0건이다.
- [ ] 정본 신설·변경이 있다면 river 승인을 기록했다.

## 2. HTML

- [ ] 안정된 공개 root와 `data-s1-component`가 있다.
- [ ] 가능한 부분은 native HTML 요소를 사용한다.
- [ ] 공개 part·slot만 문서화했다.
- [ ] 동일 컴포넌트를 여러 개 배치해도 ID가 충돌하지 않는다.
- [ ] 인라인 style·onclick·onchange가 없다.
- [ ] variant·size 이름이 정본 어휘와 일치한다.
- [ ] native·ARIA·data state의 역할이 구분돼 있다.
- [ ] 내부 DOM을 외부 API로 노출하지 않는다.

## 3. CSS

- [ ] 자기 컴포넌트 root 밖에 영향을 주지 않는다.
- [ ] 전역 태그 selector·ID selector·`!important`가 없다.
- [ ] raw HEX와 정본 수치 손사본이 없다.
- [ ] component alias token은 deprecated.json과 실제 배선을 확인했고, 승인 없이 신규 사용·부활시키지 않았다.
- [ ] Light·Dark를 Semantic token mode로 처리한다.
- [ ] 다른 코어 컴포넌트 내부를 override하지 않는다.
- [ ] 패턴 CSS와 컴포넌트 CSS의 책임이 분리돼 있다.
- [ ] 검수 전용 스타일이 dist에 포함되지 않는다.
- [ ] 아이콘 frame과 glyph가 manifest 수치대로 비례 축소되며 hit area와 섞이지 않는다.

## 4. JavaScript

- [ ] `init(root, options)`와 `destroy(root)`가 있다.
- [ ] 같은 root를 두 번 초기화해도 이벤트가 중복되지 않는다.
- [ ] 여러 인스턴스가 서로 영향을 주지 않는다.
- [ ] 특정 페이지 ID와 전역 함수에 의존하지 않는다.
- [ ] document listener가 인스턴스마다 누적되지 않는다.
- [ ] 제거 시 이벤트·observer·timer가 해제된다.
- [ ] Registry에 정의된 상태와 ARIA만 갱신한다.
- [ ] 키보드·포커스·Esc·외부 클릭 동작이 계약과 일치한다.
- [ ] 서비스 API·라우팅·업무 규칙이 들어 있지 않다.
- [ ] 외부 변화 알림 이벤트와 detail이 문서화돼 있다.
- [ ] JavaScript가 없어도 기본 내용과 native control을 사용할 수 있다.

## 5. 접근성

- [ ] native 의미와 accessible name이 있다.
- [ ] 키보드 조작표가 Registry에 있다.
- [ ] 포커스 진입·복귀·가두기 규칙이 있다.
- [ ] ARIA와 화면 상태가 함께 갱신된다.
- [ ] 오류 문구가 해당 control과 연결된다.
- [ ] 움직임 감소 설정을 따른다.
- [ ] 각 접근성 항목을 required / not-applicable로 표시하고 해당 없음의 근거를 남겼다.
- [ ] required 접근성 상태가 pending·planned·not-defined가 아니다.

## 6. 조합

- [ ] 사용한 코어를 `dependencies.coreComponents`에 기록했다.
- [ ] 부모는 자식 사이의 배치·gap만 담당한다.
- [ ] 자식 컴포넌트의 내부 DOM·CSS를 복제하지 않는다.
- [ ] 필요한 코어 상태가 없으면 `needs-core-update`로 기록했다.
- [ ] 전체 묶음과 선택 설치에서 같은 결과가 나온다.
- [ ] React·Vue 래퍼도 같은 DOM·상태·이벤트 계약을 사용한다.

## 7. 기술 검증

- [ ] 오케스트레이터가 실제 배포본을 판정했다.
- [ ] 정본의 variant·state·size를 전수 대조했다.
- [ ] PC·Mobile 실제 렌더를 코드 정본 geometry·token·state와 대조했다.
- [ ] Light·Dark 실제 렌더를 코드 정본과 대조했다.
- [ ] 키보드·포커스·스크린리더 정보를 검사했다.
- [ ] 여러 인스턴스·재초기화·destroy를 검사했다.
- [ ] 빈 HTML 페이지에서 복붙 실행을 검사했다.
- [ ] 전체 묶음과 선택 설치 결과를 대조했다.
- [ ] 디자인가이드 검수 화면이 실제 dist를 사용한다.
- [ ] 코드탭이 source/example에서 생성되고 손사본이 아니다.
- [ ] `npm run ui:icons`가 통과하고 PC·Mobile에서 hit area·frame·glyph를 각각 실측했다.
- [ ] 검증하지 못한 항목을 PASS로 표시하지 않았다.
- [ ] 정본 충돌·복합 flow·접근성 동작·검사 실패 등 위험 조건 여부를 기록했다.
- [ ] 위험 조건이면 구현자와 다른 검증자가 판정했다.
- [ ] 위험 조건이 없어 별도 검증을 생략했다면 river 결정·실제 렌더 PASS·사유를 기록했다.

## 8. river UX 승인

- [ ] 실제 디자인가이드 검수 화면을 제공했다.
- [ ] 코어 상태 검수와 실제 조합 검수를 분리해 제공했다.
- [ ] 의도한 UI와 UX인지 확인했다.
- [ ] 오류·로딩·비활성·회복 흐름을 확인했다.
- [ ] 수정 필요 의견을 상태·화면 조건과 함께 기록했다.
- [ ] river의 승인 날짜와 대상 버전을 기록했다.

## 9. 배포·승격

- [ ] dist manifest에 버전·정본 fingerprint·포함 컴포넌트가 있다.
- [ ] package exports·CSS sideEffects·dependency 포함 규칙이 있다.
- [ ] `candidate → verified → approved` 상태 변경 근거가 있다.
- [ ] 공개 가이드가 승인된 dist만 사용한다.
- [ ] 신규 패턴 dependency는 approved 컴포넌트만 가리킨다.
- [ ] 기존 패턴이면 legacy-approved 이행 상태와 재검수 시점을 기록했다.
- [ ] 정본 변경 시 설치기·CSS·JavaScript·사이트·코드탭 검사가 다시 실행된다.
- [ ] deprecated 시 신규 사용 금지와 마이그레이션 방법을 제공한다.

## 미검증·결정 필요 기록

| 구분 | 내용 | 영향 | 다음 결정자 |
|---|---|---|---|
|  |  |  |  |

## 최종 판정

| 판정 | 값 |
|---|---|
| 기술 검증 | PASS / FAIL / BLOCKED |
| 별도 검증 | PASS / FAIL / BLOCKED / WAIVED |
| river UX 승인 | APPROVED / CHANGES NEEDED / HOLD |
| 배포 가능 | YES / NO |
