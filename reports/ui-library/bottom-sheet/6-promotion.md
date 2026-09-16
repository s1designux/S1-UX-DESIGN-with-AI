# 6-promotion — 승격·이행

작업 `bottom-sheet` · 2026-09-15 · 배포본 **0.6.10** · river 승인 2026-09-15

---

## 무엇이 생겼나

| id | 무엇 | 상태 |
|---|---|---|
| `bottom-sheet` | 모바일 시트 그릇 — 딤 + 패널 + 제목/닫기 + 본문 자리 + 푸터. Footer `none`·`single`·`dual` | **approved** |
| `bottom-sheet-option` | 시트 안 한 줄 — Type 4종 × State 3종 중 **정본 실재 9칸** | **approved** |

**새 토큰 0건.** 새 아이콘 2건(`lock` · `check24`) — 둘 다 라이브러리 원본 픽셀 대조 통과(0.00203 · 0.00181).

## 브리프의 완료 조건 대조

| 조건 | 결과 |
|---|---|
| 독립 시트 부품이 dist 에 있고 전체 묶음·개별 설치가 같게 동작 | ✅ 독립 검증 확인 |
| 날짜·시간 선택이 그 부품을 재사용하고 이관 전후 렌더가 같다 | ✅ 살아 있는 페이지 재측정 **치수 차이 0**(490→490 · 448→448) |
| 모바일에서 드롭다운 대신 쓸 목록 시트 예시 | ✅ 검수·안내 화면과 `examples/bottom-sheet.html` |
| `density-policy.json` 의 `libraryStatus` → `available`, 안내에서 "아직 부품이 없습니다" 사라짐 | ✅ 확인 |
| 🤖 `component-verifier` 시나리오 F 통과 + river UX 승인 | ✅ 5회차 PASS · river 승인 |

## 이행

- `registry/governance/ui-library-migration.json` — 레코드 2건 추가(소비자·재검증 조건 포함)
- `registry/components/{bottom-sheet,bottom-sheet-option}.json` — `webDistribution.status = approved`
- `registry/governance/density-policy.json` — 드롭다운 대체의 `libraryStatus`: `missing-component` → **`available`**
- `registry/governance/design-narrative.json` → `design/DESIGN.core.md` 재생성 — "아직 독립 부품이 없어" 문장 교체
- 배포 ZIP · 다운로드 화면 · 검수판 재생성

## 검증 이력 (정직하게)

| 회차 | 판정 | 무엇이 잡혔나 |
|---|---|---|
| 1 | **FAIL** | 스크롤 잠금이 모달과 어긋남(페이지 영구 잠김) · check 아이콘이 정본보다 굵음 |
| 2 | PASS | — |
| — | — | *river 검수 지적 2건 반영* |
| 3 | **FAIL** | 안드로이드 누름 표시 상실 · 모바일 안내 화면의 남은 Hover 칸 |
| 4 | **FAIL** | manifest 문구가 실제 선택자와 불일치 |
| 5 | **PASS** | — |

**⭐ 가 놓쳐서 검증자가 잡은 것이 5건이다.** 특히 안드로이드 누름 상실은 `ui:build:check` 가 재생성 일치만 보므로 **틀린 값이 굳어도 초록**이었다.

## 승인 범위 밖 — 후속

1. **`text-button` 변경은 독립 검증을 받지 않았다.** 5회차 PASS 이후 river 지시로 들어갔다. `css-model.mjs` 해석기 수정·검사기 강화도 같다.
2. `modal`·`modal-content` 의 **배포본 계약**에도 「테마 새겨 옮기기」 규칙을 적어야 한다 — 지금은 검수 화면 배선만 고쳤다.
3. `check24` 를 `allowed-remote-keys.json` 의 `nameAliases` 로 옮기는 정리 — `build.mjs` 가 id 로 직접 찾아서 지금 옮기면 빌드가 막힌다.
4. `check`(16 프레임)의 원본 픽셀 대조 면제는 **기존 부채로 남는다.** 이 작업은 더 이상 그 자산에 기대지 않는다.
5. `bottom-sheet`·`bottom-sheet-option` 의 origin Ⓐ/Ⓑ 분류가 `tbd` — river 결정 사항(차단 아님).
6. 실기기·스크린리더·이식본 화면은 이번에도 확인하지 못했다.

## 게이트

**`npm run gate:check` — PASSED**(오류 0 · 경고 18). Gate 34 는 river 승인 발화를 인용해 `uistate` 5건을 기록하며 닫았다.
