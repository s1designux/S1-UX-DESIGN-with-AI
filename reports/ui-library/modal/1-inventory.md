# 1-inventory — Modal

- 작업: modal · 날짜: 2026-09-02
- 판독: ⭐ 총괄 직접 판독. 정본 `build-components.ts` 의 `buildModalShell` 전문(:4438-4590)과 `registry/components/modal.json` 전문을 인용했고, 각 항목에 `파일:줄` 근거를 붙였다. **추측 없음. 렌더·레이아웃 주장은 이 문서에 없다** — 시각 판정은 4-verification 에서 실제 렌더로 한다.
- 시각 정본: `plugins/figma-vars-installer/src/build-components.ts`
- Figma V3.0: 조회하지 않음 (코드 정본만으로 축·수치·토큰 확정)
- 사이트 인라인 코드: **Modal 은 사이트에 아예 없다**(아래 D 참조).

## A. 정본 `buildModalShell` (build-components.ts:4438)

| 항목 | 정본 사실 | 근거 |
|---|---|---|
| 축 | Break(PC·Mobile) × Footer(Single·Dual) = **4변형**. 상태(hover 등) 축 없음 | `:4559-4562` |
| 패널 폭 | PC 360 / Mobile 300 | `:4512` |
| 패널 여백 | 공통 상하 20. 좌우 = PC 0(내부 블록이 각자 24) / Mobile 20 | `:4514-4515` |
| 블록 간격 | PC 32 / Mobile 30 | `:4513` |
| 패널 배경 | `color/surface/raised` | `:4517` |
| 패널 라운드 | `radius/8` | `:4518` |
| 패널 테두리 | 1px INSIDE `color/modal/panel/border` | `:4519-4520` |
| 그림자 | `shadow/raised` (라이트·다크 각각 2겹) | `:4527` |
| 딤(overlay) | **정본 빌더에는 없음** — Registry anatomy·tokens 에만 `color/overlay` 로 존재 | `modal.json > anatomy[0]`, `tokens.overlay` |

### PC 구성 (`buildContentGroup` brk="PC", :4464-4483)

| 부분 | 정본 사실 |
|---|---|
| 헤더 | 가로 space-between · 아래정렬 · 좌우 24. 제목(16 Bold, `color/text/title/primary`) + 닫기 아이콘 24px(`close`, `color/icon/gray-dark`) |
| 본문 | 세로 · 좌우 24 · 줄간격 8. 본문 14 Regular, `color/text/body/primary` |
| 푸터 | 가로 · 우측정렬 · 좌우 24 · 버튼 간격 8(Dual). 코어 **Button XXSM** Primary/Secondary |

### Mobile 구성 (`buildContentGroup` brk="Mobile", :4450-4462)

| 부분 | 정본 사실 |
|---|---|
| 헤더 | **없음(닫기 없음)**. 제목 18 Bold 가 본문 블록 첫 줄 |
| 본문 | 16 Regular, `color/text/body/primary` · 제목과 간격 24 |
| 푸터 | 내부폭 260 × 높이 48 · 좌측정렬 · 버튼 간격 8(Dual). 코어 **Button LG**, 각 버튼 `FILL`(Single=풀폭 / Dual=반반) |

### 예시 문구 (정본에 구워진 값 · UX라이팅 영역이라 컴포넌트 API 아님)

| 변형 | 제목 | 버튼 |
|---|---|---|
| PC·Single | 제목 영역 | 확인 |
| PC·Dual | 제목 영역 | 취소 / 확인 |
| Mobile·Single | 업데이트 안내 | 업데이트 |
| Mobile·Dual | 자동 로그인 설정 | 아니오 / 네 |

## B. 토큰 — 전부 기존 정본에 존재 (신규 0건)

| 쓰임 | 토큰 | Light·Dark |
|---|---|---|
| 패널 배경 | `color/surface/raised` | 양쪽 존재 |
| 패널 테두리 | `color/modal/panel/border` (`vars-data.ts:670`) | gray/200 · gray-dark/500 |
| 그림자 | `shadow/raised` (`vars-data.ts:447`) | 2겹씩 양쪽 정의 |
| 딤 | `color/overlay` (`vars-data.ts:623`) | rgba(0,0,0,0.5) · 0.75 (EX03 rgba 허용) |
| 제목/본문/아이콘 | `color/text/title/primary` · `color/text/body/primary` · `color/icon/gray-dark` | 양쪽 존재 |

`assets/css/tokens.css` 에 4개 모두 라이트·다크 배선 완료(`:554,585,630` / `:774,805,850`). **새 토큰 필요 없음.**

## C. 아이콘

| 항목 | 사실 |
|---|---|
| 필요한 아이콘 | `close` 1개 (PC 헤더 전용) |
| 허용목록 | `registry/figma/allowed-remote-keys.json:19` 에 `close` 등록됨 — 허용목록 안 |
| 정본 도형 | `CLOSE_ICON_SVG` (`build-components.ts:1305`) — 24 frame, 6→18 대각선 2개, 두께 1.5, 둥근 끝 |
| 웹 배포본 | `ui-library/src/assets/icons/` 에 **미존재** — 이번에 frame 24 / glyph(6,6,12,12) 2겹 구조로 신설해야 함 |

## D. 현재 배선 현황 — **전부 미착수**

| 자리 | 현황 |
|---|---|
| `ui-library/src/components/modal/` | 없음 |
| `ui-library/scripts/build.mjs` `componentIds` | modal 없음 (`:13`) |
| `ui-library/scripts/test.mjs` · `package.json exports` | modal 없음 |
| `pages/components.html` | **Modal 언급 0건** — 섹션도, 컴포넌트 버튼도 없다 |
| `pages/ui-review.html` · `assets/js/ui-library-guide.js` | 없음 |
| `registry/governance/component-presentation-policy.json` | components 17개 중 modal 없음 |
| `registry/components/component-behavior.pc.json` | 21개 항목 중 **Modal 없음** |
| `registry/governance/ui-library-migration.json` | 레코드 없음 |

> 지금까지 배포한 13종은 사이트에 이미 손관리 화면이 있었고 그것을 dist 소비로 갈아끼우는 일이었다. **Modal 은 사이트에 화면 자체가 없어 안내 페이지를 새로 만든다.**

## E. Registry ↔ 정본 차이 (판정 없이 목록만)

| # | 항목 | 정본(build-components.ts) | Registry |
|---|---|---|---|
| 1 | 딤(overlay) | 없음(패널만 그림) | anatomy 첫 부품 + `tokens.overlay` |
| 2 | 접근성 | 대상 아님 | `a11y` 문장 2줄은 있으나 `a11yStatus`=**planned** |
| 3 | 행동(열기·닫기·포커스) | 대상 아님 | 행동 장부에 Modal 항목 **없음** |
| 4 | 사이트 카테고리 | 대상 아님 | `category`="overlay" — 사이트에 없는 분류 |
| 5 | 가드레일(패널 비율 초과 시 콘텐츠 계열로 전환) | 없음 | `guardrail.threshold`="TBD" |

1·4 는 Registry 가 의미의 정본이라 그대로 따른다. 2·3·5 는 2-canon-readiness 의 결정거리로 올린다.

## F. 재사용 의존

| 대상 | 상태 |
|---|---|
| 코어 Button (PC XXSM / Mobile LG · Primary·Secondary) | **approved** — 배포본 그대로 조립. 시각 override 금지(`modal.json > reuses`) |

## G. 미확인

- Figma V3.0 실물(`1546:17971`) 대조 — 미조회(코드 정본으로 충분).
- `guardrail.threshold` = "TBD" — 언제 콘텐츠 계열로 넘겨야 하는지 수치 미정. 이번 배포 범위 판단 필요.
- 콘텐츠 계열 Modal(`pc_modal 540:5815`, 4크기)은 **별개 컴포넌트**이며 이번 범위 밖(`reports/modal-content-family-backlog.md`).
