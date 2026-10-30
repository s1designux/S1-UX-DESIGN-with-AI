# React Native(Expo) 배포본 — 구현·검증 기록

- 산출물: `ui-library/dist/platform/react-native/` (`@s1/ui-react-native`), 예제 앱 `platform/react-native-sample/`, 내려받기 `assets/downloads/s1-ui-react-native.zip`
- 생성: `npm run ui:build` (생성기 `ui-library/scripts/react-native-*.mjs`). 값은 css-model 계산 결과를 표로 옮긴 것이며 컴포넌트 코드에 치수·색 리터럴은 없다(`ui:test` 가 키 접미 변형까지 검사).
- 범위: React DOM 배포본과 같은 32종. PC·Mobile 갈림이 있는 부품은 둘 다.

## 검증 명령
| 명령 | 내용 |
|---|---|
| `npm run rn:parity` | 표 ↔ css-model 계산 무작위 대조 + 원본 SVG ↔ RN 아이콘 도형 대조(`rn:icons`) |
| `npm run rn:icons` | 원본 SVG 도형(path·circle·rect…) 개수·칠함/선·시작점+이동량이 icons.js 와 같은지 |
| `npm run rn:behavior` | 동작 23사례·66건 (behavior.json 계약) |
| `npm run rn:compare -- --shots` | react-native-web 렌더 ↔ 웹 dist 실측 대조. **차이가 1건이라도 있으면 종료코드 1** |

## 렌더 대조가 재는 것
상자 x·y·w·h · 배경 · **네 변 테두리(두께·색)** · **네 모서리 반경** · **그림자** · 투명도 · 가상요소(::before/::after) 크기·색 ·
글자 색·크기·굵기·자간·**행간** · **글자 자리(Range 실측 x·y·w·h)** · **text-align**(flex 밖에서 남는 폭이 있을 때) · **글자 잘림(말줄임)** ·
**아이콘 모양(래스터 — 웹 mask 영역 ↔ RN svg, 겹침 비율 IoU ≥ 0.85)**.
상태 조합은 정본 manifest.states 의 모든 키를 덮는다(`react-native-states.mjs` + 빌드가 완전성 검사). 승인된 동작이 만드는 상태(선택·펼침·페이지 이동)는 양쪽에서 같은 순서로 눌러 만든다.

## 결과
284조합 · 요소 4026개 · 차이 0 (종료코드 0). 개요 스크린샷: `shots/` (PC 6장·Mobile 2장 × 라이트·다크, 열린 조합은 웹도 열린 모습).
고친 항목 전·후: `before/`(고치기 전 생성기로 같은 도구를 돌린 결과 — 차이 204건) ↔ `after/`(차이 0).

## 한계 (원리상 다름 / 미확인)
- 모바일 날짜·시간 선택기의 열린 시트 위치·크기는 대조 제외(RN Modal ↔ 웹 뷰포트 고정). 동작만 테스트로 확인 — 기하는 **미확인**.
- 시간 선택기 모바일 휠의 기기 스크롤·스냅은 브라우저/기기 실행 **미확인**. 모바일 date-time 탭의 날짜 면은 자리표시.
- 입력칸(input·textarea) 안의 값 글자 자리는 Range 로 잴 수 없어 재지 않는다(상자·테두리·색은 잼). 여러 줄 글의 폭은 줄 수·높이로 갈음(RNW 는 줄 끝 공백을 남김).
- 아이콘 IoU 허용오차 0.85: 헤드리스 크롬이 중첩 svg 원본을 약 13% 얇게 그려 같은 모양도 0.886 까지 내려간다. 도형이 빠지면 0.01~0.32 로 떨어져 구분된다.
- 바깥 탭 닫기·키보드 조작은 이식하지 않음. hover 는 웹 전용(대조는 forceState 로 같은 모양을 만들어 견줌). 표는 균등 칸 고정 레이아웃(자동 너비 없음).
- `boxShadow` 는 RN 0.76 이상 필요. 아이콘은 react-native-svg 경로로 그림.
- 5b: 화면(break)별 size 허용목록을 강제하지 않는 점은 기존 React DOM 배포본에서 물려받은 문제 — 이번 범위 밖.
- iOS/Android 실기기·네이티브 컴파일은 하지 않음(미확인). `expo export --platform ios/android` 번들은 통과.
