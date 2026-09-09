# 3-build — GNB

작성 2026-09-09 · 🧱 ui-library-builder

## 1. 만든 파일

### 원본 (`ui-library/src`)
| 파일 | 내용 |
|---|---|
| `components/gnb/gnb.css` | 바(Align×Size 6) + 메뉴(Size×State 9) + 유틸리티. 색은 전부 기존 semantic 토큰(`--color-navigation-*`·`--color-line-gray-subtle`·`--color-icon-gray-dark`·`--color-text-title-primary`·`--color-text-body-primary`) |
| `components/gnb/gnb.js` | `jsRequired=false`, `runtime=null` (mobile-header·mobile-bottom-nav 와 같은 정적 크롬) |
| `components/gnb/gnb.example.html` | center-between·md 대표 예시 |
| `components/gnb/manifest.json` | `status: candidate`. `canonicalFingerprint` = build-components.ts·vars-data.ts·textstyles-data.ts·registry/components/gnb.json 해시 |
| `assets/icons/globe.svg` · `account.svg` · `menu.svg` | 2겹 frame/glyph 구조, `fill="black"` 정규화 |
| `assets/icons/manifest.json` | 위 3개 아이콘 항목 추가(geometry·sourceExport·note) |

## 2. 배선 체크리스트 (wiring-and-traps §1)

| 자리 | 상태 |
|---|---|
| `ui-library/scripts/build.mjs` `componentIds` | ✅ `"gnb"` 추가 |
| `ui-library/scripts/test.mjs` `componentIds` | ✅ 추가(전용 계약 검사는 공용 검사로 충분해 별도 분기 없음) |
| `ui-library/package.json` `exports` | ✅ `./components/gnb`·`/css`·`/html` 3줄 |
| `ui-library/src/verification/empty-consumer.html` | ✅ GNB 인스턴스 추가 + import·jsRequired 검사에 `gnb` 포함 |
| `ui-library/src/verification/empty-consumer-individual.html` | ✅ 같은 `<main>` DOM(문자열 동일) + 개별 CSS/JS import |
| `assets/js/ui-library-guide.js` `componentConfig`·`stateMatrix()` | ✅ `gnb` 항목 + `gnbStateMatrix()`(바 6·메뉴 9·유틸 5조합) + `guideComponents` 배열 |
| `pages/ui-review.html` | ⚠️ 미착수 — 아래 "확인 못한 범위" 참고 |
| `pages/components.html` `#gnb` | ✅ 기존 손관리 인라인 harness(2113~2459줄, `setupGnb` 클릭 토글 포함)를 전량 삭제하고 `component-page-template.md §A` 대로 빈 mount + `<!-- Approved GNB guide: … -->` 마커로 교체. `comp-nav` 버튼 `disabled` 해제 |
| `registry/governance/component-presentation-policy.json` | ✅ 기존 `gnb` 항목에 `"managedBy": "ui-library-guide"` 추가 + `changeFromCurrent`/`note` 갱신 |
| `registry/governance/ui-library-migration.json` | ✅ `gnb` 레코드 추가(`uiLibraryStatus: draft`, `riverApproval: null` — assist-text-modal-content 선례와 같은 정직 기록) |
| `registry/components/component-behavior.pc.json` | ✅ `GNB` 항목을 옛 `setupGnb` 클릭 토글 근거에서 `gnb.js`(jsRequired=false) 근거로 교체(mobile-bottom-nav 와 같은 패턴) — 이 파일을 `canonicalSources` 로 쓰는 `pagination`·`tab` 매니페스트 지문도 함께 갱신(§3 참고) |

## 3. 정본 지문 갱신 — 영향 범위 확인 (wiring-and-traps §3)

`component-behavior.pc.json`(공유 파일)을 고치면서 `pagination`·`tab`·`dropdown`·`filter-chip`·`select`·`table` 6개 매니페스트의 `canonicalFingerprint` 입력이 함께 바뀐다. `git diff`로 이 파일의 변경분이 **GNB 항목 하나뿐**임을 먼저 확인한 뒤, 6개 전부 재계산했다 — 그중 `pagination`·`tab` 2개만 실제로 달랐다(나머지 4개는 이미 그 전부터 어긋나 있던 기존 부채라 이번에 손대지 않았다). 두 파일은 지문 값 1줄만 바뀌었고 다른 내용은 그대로다(`git diff --stat` 확인).

## 4. 아이콘 3종 확보 · 증명

- `mcp__bd9a77d7…__get_metadata`/`get_design_context`(OAuth 연결, 아이콘 라이브러리 V2.2 `fileKey=YcBbW9e0MTR9T3W5Sz0Ukx`)로 **Property 1=Line** 실물 벡터를 확보했다 — globe 노드 35:3314(부모 35:3317) · account 86:56(부모 86:58) · menu 97:226(부모 97:227). 이 세션에는 Figma 데스크톱 로컬 MCP(`mcp__Figma__*`)가 비활성 상태(`Enable Dev Mode MCP Server` 필요)라 `search`·`eye_hide` 선례가 쓴 `figma-local` 대신 OAuth 경로로 같은 라이브러리 파일의 같은 노드를 확보했다.
- 받은 벡터가 `build-components.ts`의 `GNB_UTIL_SVGS`(설치기 폴백)와 **같은 도형의 스케일 사본**(4/3배, viewBox 18→24)인지 좌표 비교로 확인했다 — 그래도 폴백을 그대로 웹 자산화하지 않고, 이번에 받은 원본에서 새로 2겹(frame/glyph) SVG를 만들었다.
- 저장소 내보내기 PNG(`assets/icons/ic_인터넷_line.png`·`ic_계정사용자ID_line.png`·`ic_메뉴_line.png`, 48px=24프레임×2)와 `node scripts/ui-library-icon-origin-check.js --record`로 픽셀 대조: **globe 0.00679 · account 0.00354 · menu 0.00392**(임계 0.015) 전부 PASS.
- `npm run ui:icons`(구조·frame/glyph 계약) · `npm run ui:icons:origin`(원본 대조) 둘 다 오류 0건.

## 5. 정본과 다르게 간 곳 (이유 포함)

| 항목 | 처리 | 이유 |
|---|---|---|
| 유틸 아이콘 크기(xsm 24px/18glyph) | **따르지 않음** — 사이즈 불문 32×32/24glyph 고정 | `registry/components/gnb.json`의 sizing 서술은 xsm 축소를 말하지만, 시각 정본 `buildGNBUtilIcon`(:3155)은 GNB 사이즈(`sk`)를 받지 않고 `GNBUtil:full` 인스턴스 하나만 만들어 md·sm·xsm 전부가 그대로 재사용한다(`buildGNB` :3607-3612 실제 코드 확인). 계약상 시각 수치는 코드가 정본이라 코드를 따랐다. `manifest.json.notInCanon.utilSizeAxis`에 근거를 남겼다 — needs-decision 은 아니고, 두 정본(코드=owns visual, registry=owns meaning) 사이 boundaryConflictRule 을 그대로 적용한 것이다. registry 서술 쪽이 갱신 필요하면 별건으로 처리.
| GNB Utility Icon 5변형 중 4개 | **바 기본 예시엔 안 씀, 컴포넌트 API로는 지원** | 정본 `buildGNB`는 all-on 1개만 바에 꽂는다. 웹은 언어·계정·메뉴 각각을 독립 `data-s1-part` 버튼으로 만들어 host 가 넣고 빼는 것만으로 5변형을 전부 낼 수 있게 했다(작업 지시 "5변형을 전부 낼 수 있게 하되 기본은 all-on"). 안내 화면에 5조합 예시 섹션을 추가해 실제로 보여준다.
| 메뉴 방향키 이동 | 안 만듦 | 2-canon-readiness 에서 이미 확정 — 정본에 없다. |

## 6. 검사기 명령별 종료코드

| 명령 | 종료코드 | 비고 |
|---|---|---|
| `npm run ui:contract` | 0 | `status=candidate errors=0` |
| `npm run ui:icons` | 0 | 신규 3종 포함 구조·frame/glyph 계약 통과. `check`·`edge_set` 경고 2건은 기존 부채(무관) |
| `npm run ui:icons:origin` | 0 | globe 0.00679·account 0.00354·menu 0.00392 PASS |
| `npm run ui:build` | 0 | 191 files. **한 번 `tab canonicalFingerprint is stale`로 막혔다** — `component-behavior.pc.json` 공유 파일 편집의 파급으로, §3 절차대로 영향 범위(pagination·tab)만 지문 갱신 후 재실행해 통과 |
| `npm run ui:test` | 0 | 정상 모드 완료 |
| (추가 확인) `npm run gate:check` | 6(최종) | 아래 "확인 못한 범위" 참고 — 작업 지시의 필수 5종엔 없지만 자체 점검으로 돌렸다 |

## 7. 렌더 확인 (http, `file://` 아님)

- `ui-library/verification/empty-consumer.html`(build.mjs 가 `../verification/` 로 내보내는 실제 소비 사본, `ui-library/` 를 문서 루트로 서빙)을 헤드리스로 캡처 — 로고 Bold, 홈(Selected) 밑줄+파란 글자, 서비스·통계 기본색, 언어(지구본+한국어)·계정·전체메뉴 아이콘 전부 정상 렌더.
- `pages/components.html#gnb`는 정본 승인 게이트(`status` 가 `verified`/`approved` 아니면 로드 거부)가 정상 작동해 현재 "GNB 승인 배포본을 불러오지 못했습니다" 오류 문구를 낸다 — **의도된 동작**이다(candidate 는 "내부 검수만 허용"). 실제 마크업·상태 매트릭스·코드탭이 문제없이 그려지는지는 `status` 를 임시로 `verified` 로 바꿔 렌더만 확인하고 **커밋 전 candidate 로 되돌렸다** — 바 6종·메뉴 9칸·유틸 5조합·코드탭·구현규칙 섹션 전부 정상 출력, 콘솔 오류 0건, 중복 `id` 0개 확인.
- `file://` 로는 마스크 아이콘·ES module 이 안 돈다는 함정(T1·T2)을 피해 두 검증 모두 `python3 -m http.server`로 진행했다.

## 8. 확인 못한 범위 · 남은 결정

- **Gate 34(정본 신설 승인)** — `uistate:gnb.default/hover/selected` 3건이 river 승인 없이는 통과하지 못한다. 이 상태들은 새로 지어낸 값이 아니라 `fillGnbMenu`(정본 :3133)의 기존 Default/Hover/Selected 를 그대로 옮긴 것이지만, 게이트는 river 의 실제 발화 인용을 요구해(자기신고 불신) ⭐/🧱 가 대신 승인할 수 없다. `node scripts/canon-addition-check.js --approve --by river --reason "..." --quote "<river 발화>" --item uistate:gnb.default` (hover·selected 도 각각) 형태로 오케스트레이터가 처리해야 한다.
- **Gate 47(검수판 신선도)** — `component-behavior.pc.json` 편집으로 함께 지문이 바뀐 `pagination`·`tab`(§3)이 검수판 스냅샷보다 최신이 됐다고 표시된다. `npm run board:refresh` 후 같은 링크로 재게시가 필요한데, 게시된 검수판 URL 을 이 세션이 갖고 있지 않아 오케스트레이터 영역으로 남긴다. GNB 자체 카드는 "자동 감지 밖"(배포본 컴포넌트가 아니라 가이드 화면)으로 별도 표시된다.
- **`pages/ui-review.html`** — river 검수 섹션을 아직 추가하지 않았다. `component-page-template.md §A`·wiring 문서가 요구하는 자리이나, 이번 회차에서 시간 배분상 `pages/components.html`·배선·아이콘·검사기 통과를 우선했다. 다음 회차에 추가 필요.
- **Figma 실물 렌더(6440:4032) 자체는 참고만** — 시각 정본은 코드이므로 대조하지 않았다(1-inventory 방침 그대로).
- component-verifier 원본대조·river UX 승인 전 상태다. `status`(ui-library manifest) = `candidate`, `uiLibraryStatus`(migration) = `draft`로 정직하게 남겨뒀다 — 스스로 verified/approved 로 올리지 않았다.

## 9. workflow-state.json

수정하지 않았다(오케스트레이터 전용).

---

# 2회차 — 🤖 component-verifier 1회차 FAIL 5건 수정

대상 파일: `ui-library/src/components/gnb/gnb.css` (5건 전부 이 파일 하나에서 해결됨. HTML·JS·registry 변경 없음)

## F-1 · F-3 (같이 처리 — 메뉴 높이 미충전 + 강조선이 하단선을 덮지 않음)

- `[data-s1-part="menu"]` 에 `box-sizing: border-box` + `height: 100%` 추가. `<a>` 는 이미 `display:flex`였으므로 `<li>`(align-items:stretch 로 이미 ul 높이만큼 늘어나 있던 flex item)의 정의된 높이를 그대로 물려받아 슬롯 전체를 채운다.
- `::after`(강조선) 의 `bottom: 0` 을 `bottom: calc(-1 * var(--border-width-default))` 로 바꿨다. `<a>` 의 콘텐츠 높이는 (바 높이 - 하단선 1px) 이므로 그대로 두면 강조선이 하단선 바로 위 1px 지점에서 멈춰 나란히 쌓인다 — 1px 만큼 아래로 밀어 하단선을 완전히 덮게 했다.

## F-2 (메뉴 슬롯 폭 초과)

- `box-sizing: border-box` 추가만으로 해결됐다(F-1 과 같은 선언 한 줄). 이전엔 `box-sizing` 선언이 없어 브라우저 기본값 `content-box` 로 `min-width:116px` 이 내용 폭이 되고 좌우 padding(40/32) 이 더해졌다. border-box 로 바뀌며 `min-width:116px` 이 padding 포함 전체 폭이 되어 정본 공식(`max(116, textW+padX*2)`)과 같은 결과가 난다.

## F-4 (안내 화면 Hover 칸 무반응)

- `:hover`, `[aria-current="page"]` 선택자 옆에 `[data-force-state="hover"]` 를 나란히 추가(색상 규칙 + 강조선 규칙 모두 2곳). 선례(`tab.css:51,55,58`)와 같은 패턴.

## F-5 (언어 라벨 자간 누락)

- `[data-s1-part="lang"]` 에 `letter-spacing: var(--letter-spacing-tight)` 추가(기존 font-size/weight/line-height 는 있었는데 이것만 빠져 있었다). 메뉴에 이미 쓰던 것과 같은 토큰이라 신규 토큰 0건.

## 고친 뒤 실측값 (헤드리스 렌더 픽셀 스캔, `2nd-full2.png`, 뷰포트 1440×9000, DPR 2)

| 항목 | 정본 기대값 | 실측(스캔) | 판정 |
|---|---|---|---|
| MD 강조선 두께 | 2px | 4 device px = 2css px (y 9789~9792) | 일치 |
| MD 강조선 하단 vs 하단선(1px, y 9791~9792) | 강조선이 하단선을 덮음 | 강조선(9789~9792)이 하단선(9791~9792)을 전부 포함 — 강조선 아래로 별도 회색 라인 안 보임(바로 흰 배경) | 일치 |
| "홈"(md) 밑줄 폭 | W-inset*2 = 116-48 = 68px | 135 device px ÷2 = 67.5px | 일치(반올림 오차 범위) |
| 메뉴 글자 세로 위치(md, "홈") | 슬롯 중앙(상하 여백 대칭) | 계산상 top gap ≈18.75px · bottom gap ≈19px(56px 바 기준) | 대칭 — F-1 이전(gapTop 0) 대비 해소 |
| Hover 강제 칸(`data-force-state="hover"`) | Selected 와 동일 시각(파란 글자+밑줄) | 별도 테스트 페이지(`dist/components/gnb.css` 직접 로드)에서 강제 Hover 칸이 Selected 와 동일하게 파란 글자+밑줄로 렌더, Default 는 회색 그대로 | 일치 |

## 새 캡처

- `reports/ui-library/gnb-nav/screens/2nd-round-review-gnb.png` — ui-review.html 1440×1400 (앵커 스크롤이 동적 렌더보다 먼저 걸려 빈 화면 캡처됨 — 실사용 근거 아님, 아래 2건이 실사용 근거)
- `reports/ui-library/gnb-nav/screens/2nd-full2.png` — ui-review.html 전체 페이지(1440×9000 뷰포트), §21 GNB Light·Dark 6바+메뉴9칸 전부 포함. Light MD 줄에서 "홈"밑줄이 바 바닥에 붙고 "홈"·"서비스"·"통계" 슬롯 폭이 글자 길이에 따라 달라진 것을 육안 확인.
- Hover 강제상태 확인은 `dist/components/gnb.css` 를 직접 로드하는 임시 검증 페이지(커밋 대상 아님, 확인 후 삭제)로 별도 캡처 — Default(회색)·강제 Hover(파랑+밑줄)·Selected(파랑+밑줄) 3칸이 나란히 기대대로 나뉘어 보임.

## 검사기 재실행 종료코드

| 명령 | 종료코드 |
|---|---|
| `npm run ui:contract` | 0 |
| `npm run ui:icons` | 0 |
| `npm run ui:icons:origin` | 0 |
| `npm run ui:build` | 0 (191 files) |
| `npm run ui:test` | 0 |

## 확인 못한 범위 (2회차)

- `pages/ui-review.html` 자체 앵커(`#gnb-review-title`) 로의 헤드리스 캡처는 동적 렌더 완료 전에 스크롤이 걸려 빈 화면이 나왔다 — 전체 페이지 캡처(`2nd-full2.png`)로 대체 확인했고 별도 문제는 아니다(페이지 자체 결함 아님, 캡처 방식의 한계).
- `pages/components.html#gnb` 실제 게이트 통과 렌더는 이번 회차에서 다시 확인하지 않았다(1회차 보고서에 이미 임시 `verified` 전환 후 되돌리는 방식으로 확인한 기록이 있고, 이번 5건은 CSS 전용 변경이라 같은 마크업·게이트 로직에 영향 없음).
- F-5(자간)는 컴퓨티드 스타일 수치를 직접 읽지 못했다(도구 제약) — 코드 검토와 동일 패턴(메뉴에 이미 검증된 `--letter-spacing-tight`)이라는 근거로만 확인했다.
- 재검증 판정(PASS/FAIL)은 이 보고서에서 내리지 않는다 — component-verifier 소관.
