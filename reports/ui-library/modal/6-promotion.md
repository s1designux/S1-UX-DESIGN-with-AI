# 6-promotion — Modal

- 작업: modal · 날짜: 2026-09-02 · 승격 결정: **river 승인 2026-09-02**

## 승격 내용

| 대상 | 이전 | 이후 |
|---|---|---|
| `ui-library/src/components/modal/manifest.json` | verified | **approved** |
| `registry/governance/ui-library-migration.json` | uiLibraryStatus=verified | **approved** · riverApproval 기록 |
| `pages/components.html` | Overlay 분류 신설 · Modal 섹션 | 공개 유지 |

## 공개되는 것

- 안내 페이지: `pages/components.html` → **Overlay → Modal** (PC·Mobile)
- 개발 코드: HTML(플랫폼별) · CSS · JavaScript — 모두 실제 dist
- 복붙 배포본: `examples/modal.html`(PC) · `examples/modal.mobile.html`(Mobile)
- 개별 설치: `@s1/ui/components/modal` · `/css` · `/html` · `/html/mobile`

## 근거

| 항목 | 결과 |
|---|---|
| 기술 검증 | `4-verification.md` — 정본 수치 12항목·다크 5항목 실측 일치, 동작·접근성 전수 PASS |
| 배포 동일성 | 전체 묶음 ↔ 개별 설치 스크린샷 sha256 완전 일치 |
| 아이콘 원본 | close = V2.2 `ic_닫기` 97:77 실물 벡터 · 원본 대조 오차 0.00349 PASS |
| 자동 검사 | `gate:check` PASSED (게이트 46개 · error 0) |
| river 검수 | `5-human-review.md` — 승인 |

## 독립 검증 생략 사유

`component-verifier` 별도 spawn 은 하지 않았다. 계약의 위험 조건(정본 구조 변경·역방향 생성기 수정)에 해당하지 않고, 구현자 실제 렌더 PASS·동작 검증·아이콘 원본 기계 대조·river 검수를 모두 마쳤다. **Figma 원본 대조(update-management.json `verify=none`)는 별도 대기 항목으로 남겨 두었다** — 만드는 자가 자기 원본 대조를 선언하지 않는다(H1).

## 남은 것 (범위 밖 기록)

| 항목 | 내용 |
|---|---|
| Figma 원본 대조 | `update-management.json` modal `verify=none` — component-verifier 독립 검증 대기 |
| 아이콘 기존 부채 2건 | `check`(Checkbox·Table 공용) · `edge_set` — `registry/governance/icon-origin-baseline.json` |
| 콘텐츠 계열 Modal | 별개 컴포넌트 — `reports/modal-content-family-backlog.md` |
| CSS·JS 플랫폼 분리 | river 이번 결정으로 공용 유지. 나누려면 13개 컴포넌트 전체 영향 |
