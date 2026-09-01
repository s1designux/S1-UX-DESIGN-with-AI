# 6-promotion — 승인·이행

작성 2026-09-01

## river 승인

| 항목 | 내용 |
|---|---|
| 대상 | Select Box · Dropdown(패널 + 옵션 행) · Filter Chip |
| 검수본 | 5-human-review 검수본 07 (`5-human-review.md` · `7-river-feedback-2.md` · `8-guide-feedback-2.md`) |
| 결과 | **승인** (river, 2026-09-01) |
| 승인 경위 | 안내 페이지에서 3종 자리에 "승인 배포본을 불러오지 못했습니다" 오류 문구만 뜨는 상태를 확인하고, 공개 승격을 결정 |

## 상태 승격

| | 이전 | 이후 |
|---|---|---|
| `ui-library/src/components/select/manifest.json` `status` | verified | **approved** |
| `ui-library/src/components/dropdown/manifest.json` `status` | verified | **approved** |
| `ui-library/src/components/filter-chip/manifest.json` `status` | verified | **approved** |
| `ui-library/dist/components/*.manifest.json` | verified | **approved** (`npm run ui:build` 재생성 — 손편집 아님) |
| `registry/governance/ui-library-migration.json` | `verified` · `riverApproval: pending` | `approved` · `riverApproval: approved 2026-09-01` |

`pages/components.html` 은 이미 3종 mount 구간이 들어가 있었고, 페이지가 배포본 상태표를 읽어 `approved` 일 때만 렌더한다.
따라서 **페이지 손편집 없이 배포본 상태 승격만으로 공개**됐다.

## 승인 전 화면 (근거)

| 컴포넌트 | 승인 전 | 승인 후 |
|---|---|---|
| Select Box | 빨간 오류 문구 — "select 배포 상태가 approved가 아닙니다." | 정상 렌더 |
| Dropdown | 빨간 오류 문구 | 정상 렌더 |
| Filter Chip | 빨간 오류 문구 | 정상 렌더 |

렌더 확인: `node scripts/render-shot.js "http://localhost:4173/pages/components.html#<id>" <out>.png`
(안내 페이지는 `type="module"` 로 dist 를 불러오므로 `file://` 로는 아무것도 그려지지 않는다 — 반드시 http 로 연다.)

## 이번 승격에서 하지 않은 것

- 컴포넌트 코드·토큰·정본은 손대지 않았다. 상태 표시만 올렸다.
- 다크모드는 이번 승격 범위 밖이다(라이트 기준으로만 확인).
- 계약(`ui-library-code-contract.json`)은 `candidate` 그대로 둔다 — stable 승격 조건 판단은 별건.
