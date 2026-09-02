# 3-build — Modal

- 작업: modal · 날짜: 2026-09-02 · 구현: ⭐ 총괄 직접
- river 결정 반영: 접근성 **표준 수준(A)** · 여닫기 **동작 포함(A)** (2026-09-02)

## A. 만든 것

### 배포본 원본 `ui-library/src/components/modal/`

| 파일 | 내용 |
|---|---|
| `modal.css` | 딤·패널·헤더·본문·푸터·닫기. PC(360/gap32/좌우24) · Mobile(300/gap30/패널 여백20) 두 갈래 |
| `modal.js` | `open()`·`close()` · 초점 가둠 · Escape · 초점 복귀 · 배경 스크롤 잠금 · `s1:modal:open`/`close` |
| `modal.example.html` · `modal.mobile.example.html` | 복붙용 마크업(PC=닫기 있음 / Mobile=닫기 없음) |
| `manifest.json` | 공개 계약. `placement`(body 직계) 포함 |

### 아이콘

`close.svg` 신설 — frame 24 / glyph(0,0,24,24) 2겹 구조. 정본 `CLOSE_ICON_SVG`(build-components.ts:1305) 도형 그대로, 허용목록 `close` 키(`allowed-remote-keys.json:19`)에 대응. **임의 SVG 아님.**

### 배선 (배선표 §1-2~1-4)

| 자리 | 처리 |
|---|---|
| `build.mjs` · `test.mjs` `componentIds` | `modal` 추가 |
| `test.mjs` | Modal 전용 계약 검사 추가(폭·gap·토큰·dialog 시맨틱·PC 닫기 있음/Mobile 없음·버튼 크기). **적대 테스트로 실제 잡히는지 확인**(폭 360→361 로 바꾸니 FAIL) |
| `package.json exports` · `index.js` · `auto-init.js` | modal 4줄·1줄·1줄 |
| `empty-consumer.html` · `-individual.html` | 열기 버튼 + 닫힌 모달. `<main>` DOM 동일 |
| `pages/components.html` | **Overlay 분류 신설** + Modal 버튼 + 섹션 + 승인 마커 + `initFromHash` 허용목록 |
| `assets/js/ui-library-guide.js` | `componentConfig.modal` · `modalStateMatrix()` · mount 배선 |
| `assets/css/ui-library-guide.css` | 안내 화면 전용 눕히기 CSS(dist 아님) |
| `pages/ui-review.html` | 검수본 12번 Modal 섹션 + 눕히기 CSS |
| `registry/components/modal.json` | 접근성 5줄 확정 · `a11yStatus` planned→**stable** · code/harness=implemented · v0.4.0 |
| `registry/components/component-behavior.pc.json` | **Modal 항목 신설**(근거는 `ui-library/src/components/modal/modal.js`) |
| `component-presentation-policy.json` | `managedBy: ui-library-guide` |
| `ui-library-migration.json` | 레코드 신설(uiLibraryStatus=verified, river 승인 대기) |

## B. 만들지 않은 것 (정본에 없음)

크기 축 · hover/disabled 상태 축 · Mobile 닫기(X) · 딤 클릭 닫기 · 여닫기 모션 · 중첩 모달 · 콘텐츠 계열(스크롤) 모달.

## C. 구현 중 찾아 고친 것

| # | 무엇 | 처리 |
|---|---|---|
| 1 | 안내 화면 안에 둔 모달 위로 **상단 고정바가 올라옴** | 모달은 화면(body) 바로 아래 있어야 한다는 규칙을 계약(`htmlContract.placement`)과 등록부 권장사항에 명시하고, 안내·검수 화면이 mount 시 body 로 옮기도록 고침 |
| 2 | 초점이 **아무 요소도 아닌 곳(body)** 으로 빠지면 되돌리지 못함 → 그 상태로 Tab 시 페이지 처음으로 샘 | `focusout` 보강 + Tab 처리에서 "패널 밖이면 방향에 맞는 끝으로" 규칙 추가 |

## D. 다른 세션과의 충돌 (내 범위 밖 · 미해결)

같은 작업트리에서 **Table 작업 세션이 `build-components.ts` 를 수정 중**이라 저장소 전체 빌드가 막혀 있다.

| 항목 | 상태 |
|---|---|
| 그쪽 변경 | `buildLineTab` MD 글자 20→18 · `buildTableCell` SM 13→14 · XSM(34/12) 신설 (전부 2026-09-02 river 결정 주석) |
| 영향 | 모든 컴포넌트 `canonicalFingerprint` stale → `npm run ui:build` 가 멈춘다 |
| 내 처리 | 빌더가 안 바뀐 13개 + modal 지문만 갱신. **tab 지문은 일부러 갱신하지 않았다** — `tab.css:44` 가 아직 `--font-size-20` 이라 실제 드리프트가 있고, 그건 그쪽 범위다 |
| 알림 | 다른 세션에 메시지로 상황 전달 완료 |

**따라서 위 C-2(초점 보강)는 아직 dist 에 반영되지 않았다.** tab 이 풀리면 재빌드 후 재검증한다.
