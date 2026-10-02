# GNB 묶음 승격 — 2026-10-02

**대상:** gnb · gnb-sub-menu · gnb-sub-menu-item → `approved`

## 승인 근거

| 항목 | 내용 |
|---|---|
| river 승인 | 2026-10-02 "b로하고 승인" — 검수 화면 `review/gnb-review.html`(판 3종 × 라이트·다크, C-1 A/B 3배 비교)을 보고 결정 |
| C-1 결정 | B — 하위메뉴 판의 굵은 제목(1depth)은 한글 세로 보정 대상에 넣지 않는다. 항목(2depth)만 1px 보정한 현재 그대로 (D15) |
| 독립 검증 | 🤖 component-verifier 3회차 canon PASS(2026-09-09, `5-canon-verification.md`) + 4회차 델타 FAIL 0·HOLD 1→C-1 로 해소(2026-10-02, `6-delta-verification.md`) |
| 기계검사 | ui:contract · ui:version · ui:build:check · ui:test:check · ui:icons · ui:icons:origin · ui:guide:render · ui:runtime · ui:keyboard · ui:liveness · ui:react · ui:zip:check · devpanel:check · platform:tokens:check 전부 0 |

## 바뀐 것

- `ui-library/src/components/{gnb,gnb-sub-menu,gnb-sub-menu-item}/manifest.json` — status verified → approved
- `registry/governance/ui-library-migration.json` — 3종 uiLibraryStatus approved · lastVerified · riverApproval · evidence
- 상태 파일 `gnb-sub-menu` complete, `gnb-nav` superseded(이 작업으로 이관된 뒤 함께 승인)
- 파생 재생성: ui-library dist · 개발자 패키지·플랫폼별 전달본 · 다운로드 패널 · 안내 데이터
