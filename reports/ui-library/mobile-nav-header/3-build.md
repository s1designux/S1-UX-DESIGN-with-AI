# 3-build — Mobile Bottom Nav · Mobile Header

- 작업: mobile-nav-header · 담당: ui-library-builder(🧱) · 날짜: 2026-09-02
- 정본: `plugins/figma-vars-installer/src/build-components.ts` `buildMobileBottomNav`(:2959)·`buildMobileHeaderVariant`(:3069)·`buildMobileHeader`(:3160)
- 결정 근거: `reports/ui-library/mobile-nav-header/workflow-state.json` D1~D7, HD-1(A)·HD-2(A)

## A. 만든 파일

### 원본 (`ui-library/src`)
| 파일 | 비고 |
|---|---|
| `components/mobile-bottom-nav/mobile-bottom-nav.css` | 60×60 아이템, unselected·selected 2상태, `aria-selected` 로 상태 반영 |
| `components/mobile-bottom-nav/mobile-bottom-nav.js` | `jsRequired:false`(`runtime:null`) — 선택 상태는 호스트가 정적으로 설정 |
| `components/mobile-bottom-nav/mobile-bottom-nav.example.html` | 아이템 1칸 |
| `components/mobile-bottom-nav/manifest.json` | canonicalFingerprint 산출·기록 완료 |
| `components/mobile-header/mobile-header.css` | Type 6종, AppBar 56px 고정(StatusBar·Platform 제외, D5) |
| `components/mobile-header/mobile-header.js` | `jsRequired:false` |
| `components/mobile-header/mobile-header.example.html` | Standard/Title 예시 |
| `components/mobile-header/manifest.json` | canonicalFingerprint 산출·기록 완료 |
| `assets/icons/mobile-nav-home.svg`(id=`home`)·`mobile-header-back.svg`·`mobile-header-close.svg`·`mobile-header-notification.svg`·`mobile-header-notification-accent.svg`(비등록 보조)·`mobile-header-arrow-down.svg` | 아이콘 6개 파일(등록 5 + 보조 1) |
| `assets/icons/manifest.json` | 5개 아이콘 항목 추가(`home`·`mobileHeaderBack`·`mobileHeaderClose`·`mobileHeaderNotification`·`mobileHeaderArrowDown`) |

### 생성 경로
| 파일 | 변경 |
|---|---|
| `ui-library/scripts/build.mjs` | `componentIds` 에 `mobile-bottom-nav`·`mobile-header` 추가 |
| `ui-library/scripts/test.mjs` | 동일 |
| `ui-library/package.json` | `exports` 6줄 추가 |

### 소비자
| 파일 | 변경 |
|---|---|
| `ui-library/src/verification/empty-consumer.html` · `-individual.html` | `<main>` 에 동일 마크업 추가(2칸 바 예시 + 헤더 1종). 개별 소비본에는 `<link>`·`<script>` import 추가 |
| `ui-library/src/index.js` | `mobileBottomNav`·`mobileHeader` export 추가 |
| `pages/ui-review.html` | 14·15번 검수 섹션 + `renderMobileBottomNavPanel`·`renderMobileHeaderPanel` 추가 |
| `assets/js/ui-library-guide.js` | `componentConfig` 2건 + `mobileBottomNavStateMatrix()`·`mobileHeaderStateMatrix()` + `stateMatrix()` 분기 + `guideComponents` 배열 추가 |
| `assets/css/ui-library-guide.css` | 안내 화면 전용 360×780 모바일 목업 CSS(`.uilg-phone*`) 추가 |
| `pages/components.html` | 손관리 인라인 섹션(옛 `.s1-bottom-nav`/`.bn-mock` CSS + 마크업, 2876~3082행) 완전 삭제 → 빈 mount 2개 + `<!-- Approved … guide: -->` 마커로 교체. `comp-nav` 의 Bottom Nav `disabled` 해제 + Mobile Header 버튼 신설. `initFromHash` `valid[]` 에 `mobile-header` 추가 |

### 등록부
| 파일 | 변경 |
|---|---|
| `registry/components/mobile-bottom-nav.json` | `a11yStatus: pending → implemented` |
| `registry/components/mobile-header.json` | `a11yStatus: pending → implemented`, `harnessStatus: not-started → implemented`, `guide.boundaryNote` 갱신 |
| `registry/governance/component-presentation-policy.json` | `components.mobile-bottom-nav`·`components.mobile-header` 항목 신설(`managedBy: ui-library-guide`) |
| `registry/governance/ui-library-migration.json` | 레코드 2건 추가(`uiLibraryStatus: candidate`, `lastVerified: null` — 독립 검증 전) |
| `registry/components/component-behavior.pc.json` | `Mobile Bottom Nav`·`Mobile Header` 행동 계약 추가(`status: verified` = 코드와 문서가 일치한다는 뜻이며 river UX 승인과는 별개) |

## B. 배선표 항목별 완료 여부 (wiring-and-traps.md §1)

| 항목 | 상태 |
|---|---|
| 1-1 원본 4파일 + 아이콘 | ✅ |
| 1-2 build.mjs·test.mjs·package.json exports | ✅ |
| 1-3 empty-consumer(.html/-individual.html) `<main>` 동일성 · ui-review.html · ui-library-guide.js · components.html | ✅ |
| 1-4 registry·presentation-policy·migration | ✅ |
| canonicalFingerprint 계산·기록 | ✅ (mobile-bottom-nav `9c152fe7…` · mobile-header `47bb563d…`) |

## C. 검사기 실제 결과

| 명령 | 결과 |
|---|---|
| `npm run ui:contract` | ✅ PASS (`UI_CONTRACT_SUMMARY status=candidate errors=0`) |
| `npm run ui:icons` (구조 검사) | ✅ 내 아이콘 5종 구조 이상 없음(적대 테스트 통과). ❌ 8건은 dist 미생성(빌드 전 정상) — 아래 D 참조 |
| `node scripts/ui-library-icon-origin-check.js --record` | ✅ **내 아이콘 5종 전부 PASS**: home 0.00169 · mobileHeaderBack 0.00114 · mobileHeaderClose 0.00349 · mobileHeaderNotification 0.00308(결합형 전체 대조) · mobileHeaderArrowDown 0.00372 (임계값 0.015) |
| `npm run ui:build` | ❌ **내 작업과 무관한 이유로 실패** — 아래 D |
| `npm run ui:test` | 미실행(빌드 선행 실패로 진행 불가) |

## D. 막힌 것 — 동시 세션 충돌 (내 작업 아님, needs-decision 아님·사실 보고)

작업 중 저장소가 **다른 세션이 동시에 진행 중인 `time-picker` 작업**과 파일을 공유하고 있는 것을 발견했다(`multi-session-shared-worktree-hazard` 메모리와 동일 패턴). `git status` 로 확인:

```
 M plugins/figma-vars-installer/src/build-components.ts   (내가 건드리지 않음)
 M registry/components/time-picker.json
 M ui-library/src/components/tab/manifest.json            (내가 건드리지 않음)
 M ui-library/src/components/table/manifest.json          (내가 건드리지 않음)
?? ui-library/src/assets/icons/clock.svg
?? ui-library/src/components/time-picker/
?? reports/ui-library/time-picker/
```

- `npm run ui:build` 가 **`tab canonicalFingerprint is stale`** 로 중단됨 — build-components.ts 를 그 세션이 수정 중이라 tab 의 정본 지문이 어긋난 상태. **내 컴포넌트와 무관**(tab 은 내가 건드리지 않았다).
- `clock` 아이콘 원본 대조가 **FAIL**(오차 0.04941 > 0.015) — 그 세션의 미완성 작업물. **내 5개 아이콘과 무관**하며 전부 별도로 PASS 확인했다(위 C).
- `ui-library/package.json`·`ui-library/src/index.js`·`ui-library/src/auto-init.js`·`empty-consumer(.html/-individual.html)` 은 작업 중 그 세션이 `time-picker` 항목을 함께 추가해 왔다 — 내가 넣은 `mobile-bottom-nav`·`mobile-header` 줄은 매번 그대로 남아 있는 것을 직접 확인했다(덮어쓰지 않았다).
- **조치:** 남의 작업물(`tab`·`table` 지문, `clock` 아이콘)을 임의로 고치지 않았다. 내 컴포넌트가 자체적으로 결함이 없다는 것은 `ui:contract`·아이콘 원본 대조로 개별 확인했다. `npm run ui:build`·`ui:test` 의 전체 그린 실행은 **그 세션이 `tab` 지문·`clock` 원본을 정리한 뒤 재시도해야** 가능하다.

## E. 자가인증 명시 (⭐)

- 이 보고는 ⭐(ui-library-builder) 자가 기술 점검이다. **정본 대조·PC/Mobile·Light/Dark 실제 렌더·키보드 행동 대조는 하지 않았다** — 4-verification 에서 별도로 한다(만드는 자 ≠ 검증하는 자).
- manifest `status`·`uiLibraryStatus` 는 모두 `candidate` 로 두었다 — PASS·verified·approved 를 스스로 판정하지 않는다.
- `workflow-state.json` 은 수정하지 않았다(오케스트레이터 소관).

## F. 신규 토큰 0건 확인

정본에 이미 있는 토큰만 사용했다 — `--color-icon-gray`·`--color-icon-blue`·`--color-icon-gray-dark`·`--color-icon-red`·`--color-navigation-label-default`·`--color-navigation-label-selected`·`--color-navigation-bg`·`--color-bg-home`·`--color-bg-level-0`·`--color-text-title-primary`·`--color-text-body-tertiary`·spacing/sizing/font 토큰 전부 기존 정본 확인.

## G. needs-decision 없음 / 특기사항

- `mobileHeaderNotification` 2색 아이콘: 원본 대조는 **결합형(본체+점) 1건**으로 수행했다(픽셀 대조 PASS). 점(신규 표시) 레이어(`mobile-header-notification-accent.svg`)는 같은 원본의 부분 형상이라 별도 등록·독립 대조 대상으로 삼지 않았다 — 극소 영역만 차지해 독립 대조 시 오차율이 왜곡되기 때문이다(부품 매니페스트 icons[].note 에 근거 명시). 4-verification 에서 이 경계가 타당한지 확인이 필요하다.
- `mobileHeaderClose`(Solid, 97:76) 는 모달의 `close.svg`(Line, 97:79) 와 **바이트까지 동일한 도형**으로 확인됐다 — 우연이며(X자형은 Line/Solid 구분이 없는 도형), 별도 파일로 보관해 덮어쓰지 않았다.
