# 2-canon-readiness — 제작 전 정본 준비

> work-id: `dev-handoff-package` · 2026-09-04 · ⭐ 오케스트레이터

## 1. 이 작업이 정본에 새로 만드는 것 — 없음

| 정본 항목 | 신설 여부 |
|---|---|
| 토큰(색·크기·타이포) | ❌ 신설 0건 — 기존 652개를 다른 형식으로 내보낼 뿐 |
| 컴포넌트 | ❌ 신설 0건 — 승인 18종 그대로 |
| variant · size · state | ❌ 신설 0건 — manifest 허용목록을 그대로 옮긴다 |
| 접근성 계약 | ❌ 신설 0건 |
| **검사기 판정 기준** | ❌ **신설 0건** — 아래 §3 참조 |

→ `needs-decision` **0건**. 하드룰 H6② 에 걸리는 항목 없음.

## 2. 새로 생기는 것은 전부 "파생 표면"이다

| 산출물 | 어느 정본에서 나오나 | 자동 재생성 경로 |
|---|---|---|
| `dist/platform/react/*` | manifest + examples | `npm run ui:build` |
| `dist/platform/vue/*` | manifest + examples | `npm run ui:build` |
| `dist/platform/kotlin/S1Tokens.kt` | `tokens.css`(← vars-data.ts) | `npm run ui:build` |
| `dist/platform/swift/S1Tokens.swift` | 〃 | 〃 |
| `dist/platform/cpp/s1_tokens.h` | 〃 | 〃 |
| `dist/platform/tokens.json` | 〃 | 〃 |
| `dist/platform/behavior.json` | `component-behavior.pc.json` + manifest | 〃 |
| 배포 ZIP | dist 전체 | `npm run ui:zip` |

**손편집 금지 표시를 모든 생성물 머리에 박는다.** `tokens:reconcile` 에 `ui:build` 를 물려 토큰 1건 변경이 6개 툴까지 자동 전파되게 한다.

## 3. 검사기는 판정 기준을 만들지 않는다 (H6② 준수 설계)

| 검사 항목 | 판정 근거 (전부 기존 정본) | 새로 정한 것 |
|---|---|---|
| HEX 직접 사용 | `registry/governance/audit-rules.json` R01~R11 · 예외 EX03(`color-overlay`) | 없음 |
| 등록 안 된 variant·size | 각 `manifest.variants` / `manifest.sizes` | 없음 |
| 필수 속성·part 누락 | 각 `manifest.htmlContract` | 없음 |
| 존재하지 않는 CSS 변수 | `assets/css/tokens.css` 실제 선언 목록 | 없음 |
| 컴포넌트 재구현 의심 | `manifest.rootSelector` 없이 같은 역할을 하는 마크업 | **판정하지 않고 '경고'로만 표시** |

마지막 항목은 기계가 확실히 가를 수 없으므로 **오류로 판정하지 않는다.** 확실하지 않은 것을 오류로 만들면 개발자가 검사기를 꺼 버리고, 그러면 확실한 것마저 못 잡는다.

## 4. ⭐ 자가 판단 1건 — 언어별 상수 이름

정본에 "CSS 변수 → Kotlin/Swift/C++ 이름" 변환 규칙이 **없다.** 새 규칙을 만드는 대신, **판단이 끼지 않는 기계적 변환**으로 정하고 기록한다.

| 원본(정본 이름) | Kotlin · Swift | C++ | JSON |
|---|---|---|---|
| `--color-base-white` | `colorBaseWhite` | `S1_COLOR_BASE_WHITE` | `"--color-base-white"` (원본 그대로) |

- 규칙: `--` 제거 → `-` 로 분해 → (camelCase / 대문자 SNAKE). **역변환이 1:1 로 가능**하다.
- **JSON 산출물은 원본 이름을 그대로 유지**해, 어떤 언어 이름이 어느 정본 토큰인지 항상 되짚을 수 있게 한다.
- 각 생성 파일에 원본 이름을 주석으로 함께 남긴다.

> ⭐ 자가인증 항목이다. river 가 다른 이름 규칙을 원하면 생성기 한 곳만 고치면 전량 재생성된다.

## 5. 보류 1건 (진행을 막지 않음)

- **HD-CPP-1** — C++ 가 화면을 무엇으로 그리는지 미확인. 확인 전까지 **어디서나 읽히는 상수 헤더(.h) + JSON** 까지만 만든다. 프레임워크가 정해지면 그 위에 덧붙인다. (river 가 개발자에게 확인 후 회신 예정)

## 검문소 — 2-canon-readiness

- `needs-decision`: **0건**
- 정본 신설: **0건** (승인 필요 사항 없음)
- ⭐ 자가 판단: **1건** (§4, 기계적·역변환 가능·재정의 쉬움으로 위험 최소화)
