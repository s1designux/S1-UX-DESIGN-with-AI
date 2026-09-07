# UI Library 6단계 승격 — Password Field · Search Input

- 승격일: 2026-09-07
- river 승인: "확인했어, 승인. 커밋해줘"
- 앞 단계: `5-human-review`(river 직접 검수) · `4-verification.md`(🤖 component-verifier 2회)

## 승격 내용

| 대상 | 전 | 후 |
|---|---|---|
| `ui-library-migration.json` password-field | draft | **approved** (lastVerified 2026-09-07) |
| `ui-library-migration.json` search-input | draft | **approved** |
| `input/manifest.json` status | verified | **approved** |

## HD-1 이 자연히 해소됐다

승인 전에는 `status !== approved` 라 배포 경로가 input 을 걸러내고 있었다(D10 = HD-1 B 로 그대로 두기로 했던 것). 승인과 동시에 풀렸다.

| 표면 | 승인 전 | 승인 후 |
|---|---|---|
| `dist/platform/react/input.jsx` | 삭제됨 | **있음** |
| `dist/platform/vue/Input.vue` | 삭제됨 | **있음** |
| `dist/platform/manifest.json` | 18종 | **19종 · input 포함** |
| 개발자 ZIP | 175 files | **177 files** |

## 재생성한 것

`ui build` · `installer:build` · `ui:zip` · `devpanel:gen` · `board:refresh` — 전부 종료코드 0. 파생 손편집 0건.

## 검사기

| 검사 | 결과 |
|---|---|
| `ui:build:check` · `ui:test:check` · `ui:contract` · `ui:guide:render` · `ui:state` | ✅ |
| `components:facts:check` · `components:guide-model:check` · `components:behavior:check` | ✅ |
| 🚦 `gate:check` | ✅ **PASSED** · 0 error · 14 warning(기존 부채) |
| Gate 13 | ✅ 🤖 component-verifier 기록(2026-09-07 · structural · pass) |

## river 결정 16건 (전부 반영)

| ID | 결정 |
|---|---|
| D1 | Search 는 Base Input 을 베이스로, 아이콘 사양만 다르게 |
| D2 | 검색 실행 = Enter + 돋보기 클릭 둘 다 |
| D3 | Search 모바일도 만든다 |
| D4 | Search 상태 3개(Default·Filled·Disabled) |
| D5 | 아이콘은 Figma 원본에서 조달(폴백 금지) |
| D6 | 3-build 후 정본 지문 갱신 (orchestrator) |
| D7 | Mobile 에서 suffix 액션 hover 제거 |
| D8 | Mobile 아이콘 간격 28px → 12px (누르는 영역 48×48 유지·겹침 0) |
| D9 | 안내메시지는 선택 슬롯 — '계정인풋' 신설하지 않음 |
| D10 | HD-1 B — 배포 기준 유지(승인으로 자연 해소) |
| D11 | HD-2 — Figma 정본 Search 액션에 hover 면 추가(PC 만) |
| D12 | HD-5 A — 안내 페이지 여백 규칙 파급 인정 |
| D13 | 구분선 여백을 앞 요소로 판별하지 않는다 |
| D14 | 블록 여백도 앞 요소 열거를 버린다 |
| D15 | HD-7 A — 모바일 섹션 제목 위 가로선 복원 + 검사기 조준 |
| D16 | HD-8 A — 가로선은 기계 강제 없이 river 직접 확인 |

## ⭐ 자가인증으로 남은 부분 (정직 표기)

- **재조준한 `scripts/ui-guide-render-check.js` 와 `component-page-template.md`** 는 ⭐ 자가 적대적 시험(위반 3형태 주입·전부 차단 확인)만 거쳤고 🤖 독립 검증을 받지 않았다. river 가 "내가 직접 볼게"로 진행을 택했다.
  - 경위: 4회차 검증에서 🤖 가 **⭐ 의 「약화 아님」 주장을 반증**했다(개수 비교만으로는 「유형별 블록 + 사이 선」이 통과). 재조준은 새 기준을 만들지 않고 기존 `component-presentation-policy.json` 의 `variants` 선언을 썼다.
- **모바일 가로선 5개(Input 2 · Time Picker 3)는 기계가 지키지 않는다**(D16). 지워도 검사가 통과한다 — 사람 검수에 맡긴 상태.
- **Figma 캔버스 실제 육안 배치** 미확인 — 코드 레벨만(웹 렌더는 실측 완료).

## 남은 것

없음. 다음 작업은 `.claude/docs/project-status.md` 참조.
