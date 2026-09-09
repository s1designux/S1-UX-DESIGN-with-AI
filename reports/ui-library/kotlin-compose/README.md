# Kotlin(Compose) 부품 — 무엇을 어떻게 만들었나

## 범위 (river 지시 2026-09-09)

A안 10종: button · input · checkbox · radio · toggle · chip · dropdown · select · tab · modal
값은 `S1Tokens`, 동작은 `dist/platform/behavior.json` 을 따른다.

## 방식 — 손으로 옮겨 적지 않는다

승인된 웹 배포본 CSS 를 **실제 캐스케이드까지 계산해서** 상태별 최종 값을 뽑고, 그 표를 Kotlin 으로 굳힌다.
Compose 코드에는 치수·색 리터럴이 한 자리도 없다 — 전부 `S1*Spec.box(...)` 에서 꺼낸다.

| 자리 | 파일 |
|---|---|
| CSS 캐스케이드 계산기 | `ui-library/scripts/css-model.mjs` |
| 상태 질의·표 추출 | `ui-library/scripts/kotlin-compose.mjs` |
| Kotlin 표 출력 | `ui-library/scripts/kotlin-emit.mjs` |
| 그리는 뼈대(Compose 트리) | `ui-library/scripts/kotlin-components.mjs` |
| 아이콘 SVG → ImageVector | `ui-library/scripts/kotlin-icons.mjs` |
| 예제 앱 | `ui-library/scripts/kotlin-sample.mjs` |

산출물은 `ui-library/dist/platform/kotlin/` 과 `ui-library/dist/platform/kotlin-sample/` 이며
`npm run ui:build` 한 번으로 전부 다시 만들어진다. **dist 손편집 금지**(빌드마다 통째로 지워진다).

## 검증

| 검사 | 방법 | 결과 |
|---|---|---|
| 값이 배포본과 같은가 | 헤드리스 크롬에 같은 요소·같은 상태를 그려 `getComputedStyle` 과 대조 (`npm run kotlin:parity`) | ✅ 772건 질의 · 3879개 값 일치 |
| 빠뜨린 CSS 선언이 있는가 | 어느 질의에도 읽히지 않은 선언을 기록 (`dist/platform/kotlin/coverage.json`) | 9건 — 전부 `display`·`flex`·`pointer-events`·`width:100%` 같은 표시·배치 규칙(값 아님) |
| 참조가 실재하는가 | 팔레트 색·아이콘 이름·괄호 짝 (`npm run kotlin:lint`) | ✅ |
| 사람이 보는 검수 | `reports/ui-library/kotlin-compose/preview.html` (`npm run kotlin:preview`) | 라이트·다크 전환, 조합별 웹 표출 ↔ Compose 값 |

### 아직 확인 못 한 것 (정직하게)

- **컴파일**: 이 맥에는 JDK 17 과 Gradle 이 없어 Kotlin 을 컴파일해 보지 못했다.
  괄호·참조 점검은 통과했지만 그것이 "컴파일된다"는 뜻은 아니다 — Android Studio 에서 `platform/kotlin-sample` 을 열어 확인해야 한다.
- **실제 렌더**: 같은 이유로 안드로이드 화면을 띄워 보지 못했다. 검수 화면은 "같은 값이 웹에서 어떻게 보이는가"를 보여 준다.
- **`::placeholder` 색**: 크롬이 가상요소 계산값을 내주지 않아 브라우저 대조에서 28건을 건너뛰었다.
  값 자체는 정본 토큰(`--color-form-control-text-placeholder`)을 그대로 참조한다.

## 상태 흉내에 대해

`:hover` 같은 가상 클래스는 스크립트로 켤 수 없다. 대조 검사와 검수 화면에서만
**같은 명시도의 속성 선택자**(`[data-force-hover]`)로 바꾼 사본을 쓴다 — 값·순서·우선순위는 그대로다.

## 서체

정본 서체는 Pretendard 다. 안드로이드 폰트 리소스는 앱이 넣고 `S1Theme(fontFamily = ...)` 로 넘긴다.
넘기지 않으면 기기 기본 서체로 그려진다(치수는 정본 그대로).
