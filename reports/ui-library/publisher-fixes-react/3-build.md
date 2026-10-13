# 3-build — React판 개발자 검수 후속 수정 (0.23.0)

작성: ui-library-builder · 상태 판정(PASS·approved)은 이 문서가 하지 않는다 — 별도 검증자 몫.

## 무엇을 어디서 고쳤나 (생성기 — dist 손편집 없음)

| 영역 | 파일 | 내용 |
|---|---|---|
| 생성 엔진 | `ui-library/scripts/react-gen.mjs` | 승인 예제 → React(forwardRef · "use client" · 슬롯 이름 나누기 · 목록 정규화 · 형태별 마크업) |
| 부품별 선언 | `ui-library/scripts/react-spec*.mjs` · `react-api.mjs` | 부품마다 받는 prop · 코드 조각 · 이벤트 상세 타입 (마크업은 예제에서만 옴) |
| 도우미 | `ui-library/scripts/react-kit.mjs` → `platform/react/kit.js` | ref 합치기 · 동작 스크립트 붙이기 · 열림/값 맞추기 · 목록 항목 한 모양 |
| 타입·설명서 | `react-docs.mjs` · `react-readme.mjs` | index.d.ts(인덱스 시그니처 없음) · README(예시는 전부 빌드·서버 렌더 검증) |
| 웹 런타임(추가만) | `src/components/{input,dropdown,filter-chip,select,time-picker}` | 입력 지우기 기본 setter · 드롭다운/필터칩/시간 setValue · data-value/data-name/data-placeholder · 시간 시트 듣기 누수 |
| 묶음·검사기 | `scripts/build-ui-package-zip.js` · `src/tools/s1-ui-lint.mjs` | React 묶음에 s1-ui.base.css · 시작하기 안내 · lint 가 묶음 폴더 자신을 건너뜀 |
| 검수기 | `scripts/publisher-audit/react.mjs` + `react-harness/*` | 시나리오 21 → 40, 타입 시험 5 → 11줄, README 예시 빌드·서버 렌더·눌러 보기, lint 시험 |
| 전달본 시험 | `ui-library/scripts/react-parity-check.mjs` · `test.mjs` | 54벌 마크업 대조(변형별) · 열림·값·선택 배선 대역 시험 |

## 실행 명령

```
npm run ui:bump:minor            # 0.22.0 → 0.23.0 (+ ui:build + 전달본 지문 기록)
npm run ui:build && npm run ui:zip
npm run ui:contract ui:version ui:build:check ui:test:check ui:icons ui:icons:origin ui:guide:render ui:zip:check
npm run rn:parity ui:react ui:runtime ui:behavior gate:check
npm run audit:publisher:web
npm run audit:publisher:react -- --env <환경폴더>        # 진짜 React 19 · Vite 8 · TS 6
```

## 알려 둘 것

- `onChange` 는 종전 그대로(고르는 부품은 CustomEvent) 두고 값만 주는 `onValueChange` 를 새로 더했다 — 하위 호환 때문.
- 목록 항목의 `disabled` 는 정본에 비활성 모양이 있는 부품(멀티 토글 · 시트 줄)에서만 적용한다(정본에 없는 상태를 만들지 않는다).
- GNB 에 menus 를 안 주면 종전처럼 예제의 id(`gnb-sub-menu-a-service` …)를 가리킨다(곁에 `S1GnbSubMenu id=…` 를 두는 옛 조합법 유지).
- Next.js 는 설치하지 않아 실제 빌드는 못 돌렸다 — "use client" 표시만 정적으로 확인.

## 재작업 (0.23.1) — 독립 검증 FAIL 후속

작성: ui-library-builder · 판정(PASS·approved)은 별도 검증자 몫. 이전 빌드(12a8f15c)가 0.22.0 코드를 달라지게 만든 곳을 고쳤다.

| # | 고친 것 | 방법 (생성기 — dist 손편집 없음) |
|---|---|---|
| 1 | 옛 슬롯 이름 별칭 | `kit.mergeParts(parts, direct, aliases)` — 옛 이름 값은 새 이름 칸에도 들어가고 새 이름(prop·parts)이 있으면 새 이름이 이김. 모달·모달 콘텐츠 `parts.label`→취소·확인 둘 다 · 바텀시트 `parts.label`→applyLabel(견본 줄 글자도 예전처럼) · 접힘 카드 `title·subtitle·body·note·caption`→펼침 판 안쪽 · LNB `item·itemIcon(글자 포함)·itemToggle·subitems` 복원(items 와 무관하게 공유) · GNB `parts.menu` · 모달 overlay/close·시트 backdrop/close 빈 칸 내용 |
| 2 | 리스트 행 스위치 | `parts.chevron` 에 준 토글을 그대로 그림(`wrapNode`) · 기본 꺼짐(`checked`/`defaultChecked` 를 따름) · `name` → 켜져 있을 때 `on` 이 폼에 실림 · 값 표시형에 견본 "라이트" 안 끼움 |
| 3 | 드롭다운 무 prop | 마운트 뒤 `setValue("")` 로 첫 줄 선택이 지워지던 것 — 값을 한 번도 안 줬으면 건드리지 않음(드롭다운·필터 칩·셀렉트 공통) |
| 4 | 견본 글자 정책 | 생성기가 `bare`(내용 prop 하나도 없음) 를 만들어 `slot().content ?? "견본"` 을 `bare ? 견본 : 비움` 으로. `parts` 만 쓰는 0.22.0 코드는 예전 그대로(리스트 행은 nav 만 예전 그대로, 새 종류는 parts 도 내용으로 침) |
| 5 | onChange / onValueChange | 동작은 그대로(이벤트 / 값). README 표 + `index.d.ts` 설명 + 검수기 타입 시험(값을 받는 onChange · 이벤트를 받는 onValueChange 는 타입 오류) |
| 6 | 타입 | 엄격함 유지. `aria-*` 는 React 표준 + 문자열도 받게 넓힘(`S1Aria`) · 릴리스 노트에 "타입이 엄격해졌다 + 흔한 고침" |
| 7 | 검수기 | `react-legacy.mjs` — 옛 슬롯 이름 21사례를 **0.22.0 zip 으로 돌려 얻은 실측값**(`legacy-0.22.0.golden.json`)과 견줌 · 셀렉트 `parts.value` 시험 복원(+값 표시 칸 보정) · 스위치 줄·견본 정책 시나리오 |

번호: 0.23.0 → 0.23.1 (`npm run ui:bump`). 새 파일: `scripts/publisher-audit/react-legacy.mjs` · `react-harness/legacy-0.22.0.golden.json`.

### 음성 시험 (12a8f15c 가 옛 코드 시험에 걸리는가)
`npm run audit:publisher:react -- --env <환경> --zip <12a8f15c 의 s1-ui-react.zip> --legacy --only __none` → 옛 코드 21사례 중 **11건 실패**(모달 parts.label 3 · 바텀시트 parts.label · 접힘 카드 2 · LNB 아이콘 · 리스트 행 값 표시/스위치 2 · 드롭다운 2). 같은 시험이 이번 묶음에서는 21/21 통과.

### 실행 결과
ui:contract · ui:version · ui:build:check · ui:test:check · ui:icons · ui:icons:origin · ui:guide:render · ui:zip:check · rn:parity · ui:react · ui:runtime · ui:behavior · gate:check · audit:publisher:web · audit:publisher:react 전부 exit 0 (React 검수기: broken 0 · friction 0).

### 알려 둘 것
- 옛 시험 앱(react-trial)을 새 묶음으로 다시 빌드·시험: 모바일·PC·폼·다크 흐름이 0.22.0 과 같음. 다른 것은 의도한 고침뿐 — 검색창 X 가 앱 상태까지 비움(R7) · 꼬리표 `parts.label` 이 먹음 · 폼에 name 값이 실림 · 리스트 행 스위치가 제대로 보임(0.22.0 은 칸 테두리만 보이고 토글이 안 보였음). 옛 시험 앱의 표 `control.attrs.onClick` 에 DOM `MouseEvent` 를 적은 줄은 TS 오류로 남음(React 의 `MouseEvent` 로 고치면 됨 — README 에 안내).
- 달력·시간 열·시간 구분 글자 칸에 `parts.calendar/column/divider` 로 준 내용은 0.22.0 에서도 동작 스크립트가 덮어쓰던 칸이라 복원하지 않음.
- 바텀시트 선택 표시 칸(`parts.check`)의 내용·속성은 복원하지 않음.
