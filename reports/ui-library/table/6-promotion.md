# 6-promotion — Table 승인·이행

- 날짜: 2026-09-02 · river 승인 기준으로 승격

| 항목 | 값 |
|---|---|
| `ui-library/src/components/table/manifest.json` | `status: approved` |
| `ui-library/dist/components/table.manifest.json` | `approved` (생성물) |
| `registry/governance/ui-library-migration.json` | `uiLibraryStatus: approved` · riverApproval 2026-09-02 |
| `registry/components/table.json` | `a11yStatus: stable` (river D4 A안) |
| 승인 배포 | **16종** (input · button · checkbox · radio · toggle · chip · dropdown · select · filter-chip · tab · pagination · textarea · multi-toggle · modal · table) |

## 근거

- 기술 검증: `reports/ui-library/table/4-verification.md` — gate:check PASSED · ui:build/ui:test/렌더 검사 PASS · 선택 동작 실제 실행 확인
- 정본 변경분 독립 검증: 🤖 component-verifier PASS · `reports/installer-build/build-verification.json`(Gate 13)
- 사각지대 보완: **Gate 44** 신설 — 부품 표본 격리(적대 테스트 + 실제 회귀 재현으로 검증)

## 범위 고지

Table 은 **표만** 소유한다. 표 아래 페이지 이동과 '몇 개씩 보기'는 승인된 pagination·select 배포본을 화면에서 조립한다. 정렬(소트) 기능·모바일 표출은 정본에 없어 범위 밖이다.
