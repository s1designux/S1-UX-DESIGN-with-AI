# 6-promotion — mobile-nav-header 승격

- **승격일:** 2026-09-02
- **승인:** river (5-human-review)
- **대상:** `mobile-bottom-nav` v0.1.0 · `mobile-header` v0.1.0 — 둘 다 `candidate` → **`approved`**

## 갱신한 곳

| 파일 | 무엇 |
|---|---|
| `ui-library/src/components/mobile-bottom-nav/manifest.json` | `status: approved` |
| `ui-library/src/components/mobile-header/manifest.json` | `status: approved` |
| `registry/governance/ui-library-migration.json` | 두 레코드 `uiLibraryStatus: approved` · `riverApproval` · `promotionDecision` · evidence 3건 |
| `ui-library/dist/**` | 위 정본에서 재생성(손편집 없음) |

## 승격 시점 재실행 검사 (실제 approved 상태)

| 검사 | 결과 |
|---|---|
| Gate 19 변형/상태 커버리지 | ✅ 섹션×축 49 · 검증 49 · **신규 공백 0** |
| Gate 44 안내 화면 실제 렌더 | ✅ 컴포넌트 **17종 × PC·Mobile** 실제 렌더 대조 통과 |
| `npm run gate:check` | ✅ 게이트 47개 · 통과 77건 · **오류 0** · 경고 13(전부 기존 부채) |
| `npm run ui:contract` | ✅ PASS |
| `npm run ui:build` | ✅ 104 files |
| `npm run ui:test` | ✅ PASS (dist CSS url() 해석 검사 포함) |
| `npm run ui:icons` | ✅ icons 12 · errors 0 |

## 승격 직후 발견해 고친 것 (F-5)

승격 상태를 만든 **직후**, 닫기 전에 돌린 🤖 component-verifier 4회차가 안내 화면 결함 1건을 잡았다.

- **증상:** 목업 상태바의 wifi 가 호 2겹이 아니라 속 찬 부채꼴로 그려졌다.
- **원인:** wifi SVG 의 마스크 `id` 가 고정값이라 한 페이지에 4번 그려지며 중복됐고, `url(#...)` 이 숨겨진 블록의 것을 가리켜 마스크가 적용되지 않았다.
- **승격을 되돌리지 않은 이유:** 결함은 안내 화면 코드에만 있었고 **배포 부품(dist)은 무결**이다 — 검증자가 `git diff` 로 dist 변경 0파일을 확인했다. 위 게이트 수치도 그대로 재현됐다.
- **고침·재검증:** 마스크 id 를 인스턴스마다 생성 + 하단 탭 목업을 블록마다 새로 생성. 🤖 5회차 부분 재검증 **PASS**(6배 확대 육안 · 페이지 전체 중복 id 0/385 · 재마운트 3회 스트레스 · Gate 44 17종 · gate:check 오류 0 · dist 차이 0).
- **남긴 교훈:** 수치·DOM 검사를 전부 통과하면서 **그림만 틀릴 수 있다.** 화면 수정도 ⭐ 자가인증만으로 닫으면 안 된다 — 이 건은 승격 직전 독립 검증이 아니었으면 그대로 나갔다. 배선표 함정 T5 를 "문서 안 모든 id"(SVG 내부 id 포함)로 확장했다.

## 공개되는 것

- 안내 화면: Mobile Components → **Bottom Nav** · **Mobile Header** (실제 dist 소비, 개발 코드 HTML/CSS/JS 탭 포함)
- 배포본: `ui-library/dist/components/mobile-bottom-nav.*` · `mobile-header.*` · 전체 묶음 `s1-ui.css` / `s1-ui.js`
- 아이콘 자산 6종 — home · back · close · notification · notification-accent(파생 색 레이어) · arrow-down

## 정책 승격은 제안하지 않는다

`registry/governance/ui-library-code-contract.json` 은 `candidate` 그대로 둔다. 계약 자체의 stable 승격은 이 작업 범위 밖이며 별도 판단이 필요하다.

## 승격 후에도 열려 있는 것

- **HD-3** — 아이콘 원본 대조가 24프레임 전체 평균이라 **작은 글리프의 큰 손상이 희석된다**(이번 F-1 이 그렇게 통과했었다). 검증자가 옛 잘린 자산을 재현해 재측정한 결과 지금 기준으로도 여전히 통과한다. (A) 그대로 두기 / (B) 글리프 영역 기준 추가 — river 결정 대기. 이번 두 컴포넌트의 자산은 문제없다.
- **B11** — 다른 세션이 같은 작업트리에서 설치기·패턴 작업 중이라 커밋 범위를 계속 분리해야 한다. 이 작업 커밋에는 그 파일들이 하나도 들어가지 않았다.
- `reports/repeated-requests.json` 기록은 그 세션과 충돌을 피해 미뤘다.
