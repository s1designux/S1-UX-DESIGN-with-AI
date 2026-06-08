# 4단계 자가대조 결과 — Modal (patterns.html)

검증자: component-verifier (검증 전용 · 구현 수정 없음)
대상: `pages/patterns.html` Modal 섹션 + `.s1-modal*` CSS + `setupModalPatterns()` JS · `registry/patterns/modal.json`
프리뷰 실측: http://localhost:4599/pages/patterns.html (serverId e50410b7…)
Figma 원본: modal_small 6706:4218 · modal_large 6714:8020 (fileKey yE5UCFEbmXJBlYJWB24Lz2)

## 대조 요약
- 인스턴스: Small ×2 (modal-small-1 중복안내·modal-small-2 삭제확인) + Medium ×1 (modal-medium-1 항목선택)
- harness:audit: 🔴 0 errors · 🟡 0 warns · ✅ 13 pass
- raw HEX (modal CSS 142–224행): 0건
- 코어 override CSS 규칙 (s1-btn/s1-table/s1-checkbox under .s1-modal): 0건

## 정확 대조 (두갈래 제외 · 항상 엄격) — 전부 PASS

### 1. 라이브 동작 (실측 클릭)
| 동작 | 대상 | 결과 |
|------|------|------|
| 트리거 클릭 → 오버레이+모달 표시 | small1/small2/medium | PASS (hidden:false, overlay display:flex) |
| 닫기 × 버튼 | small1 / medium | PASS (closed) |
| 확인(footer primary) | small1 | PASS |
| 취소(footer secondary) | small2 | PASS |
| 삭제(footer primary) | small2 | PASS |
| 오버레이 배경 클릭 (corner 실클릭, target=overlay) | small1 | PASS |
| ESC 키 | small1 | PASS |
모든 열기/닫기 경로 동작 확인. ❌ 없음.

### 2. 코어 재사용
- Medium 본문 표 = `table.s1-table.s1-table--md` (신규 모방 표 아님) — PASS
- Medium 푸터 버튼 = `s1-btn s1-btn-secondary` / `s1-btn s1-btn-primary` — PASS
- Small 푸터 버튼 = `s1-btn s1-btn-sm s1-btn-secondary/primary` (xxsmall 코어) — PASS
- 체크박스 = `s1-checkbox` 코어 + `ds-chk-icon` — PASS
- `.s1-modal` 하위로 코어 컴포넌트를 재정의하는 CSS 규칙 0건 (stylesheet 전수 스캔) — PASS
- registry/patterns/modal.json `dependencies.coreComponents = ["button","table","input"]` 명시 — PASS

### 3. 닫기 아이콘 원본
- 모달 close SVG: viewBox `0 0 16 16`, path `M0.723106 16L…Z`, fill currentColor
- icons-data.js `ic_닫기`(97:79) 원본 path와 **완전 일치** (solid X 글리프). 손그림/외부 아이콘 아님 — PASS

### 4. 사이즈 제약 (CSS 선언 + 렌더 실측 둘 다)
| 모달 | CSS | 렌더 width | max-height | 판정 |
|------|-----|-----------|-----------|------|
| Small #1 | min260/max360/width:max-content | 308px | — | 범위 내 PASS |
| Small #2 | 동일 | 324px | — | 범위 내 PASS |
| Medium | min400/max1200/width:fit-content | 549px | maxH 504px(=70vh@720) | 범위 내 PASS |

- Medium 본문 스크롤 검증: 본문에 2000px 더미 주입 시 모달 높이 454px로 **70vh(504px) 이내 클램프**, 본문 scrollHeight 2253 > clientHeight 383 → `overflow-y:auto` 스크롤 동작 + 헤더/푸터 고정 유지 — PASS
- (참고) 최초 렌더 직후 일시적으로 small1 width 234px(<260) 측정됐으나, 레이아웃 안정 후 308px로 정착. 트리거 클릭 기반 정상 오픈 시 항상 260–360 범위. 재현되지 않는 mid-render 트랜지언트로 판단 — ❌ 아님.

### 5. 시각 매칭 (Figma get_screenshot vs preview_screenshot)
- Small: 타이틀 16B 좌상단 + × 우상단, 본문 14R, 푸터 우측정렬 버튼, border 없는 카드 + 그림자 — Figma "중복 안내" 카드와 레이아웃·닫기 위치 비례 일치.
- Medium: 헤더(타이틀+×, 하단 구분선) + 본문 s1-table + 푸터(우측 취소/확인, 상단 구분선) + border 1px — Figma "배차 차량" 모달 shell 구조와 일치 (Figma 본문 콘텐츠량은 인스턴스별 가변).
- 닫기 글리프: 박스 24px / 글리프 렌더 ~12.6px (CSS 14px). Figma 헤더 × 대비 비례 근사. 프레임≠내용물 원리 적용해 글리프 크기 별도 확인 — 과대/과소 없음.

### 6. 토큰
- `--modal-bg→surface-default` · `--modal-border→border-default` · `--modal-title-text→text-primary` · `--modal-body-text→text-secondary` · `--modal-close-icon→icon-default` — 색상 전부 Semantic 경유 PASS
- `--modal-overlay→color-overlay` (EX03 rgba 허용) · `--modal-radius→radius-8` — PASS
- 렌더 실측 색: 타이틀 #202020, 본문 #353535, close #757575, overlay rgba(0,0,0,0.5) — 토큰 resolved 값 일치.

## ❌ (a) 코드 실수 — 수정 대상
없음 (0건)

## 🟡 (b) 의도적 개선 (사전 등록됨) — 코드 유지 + Figma 개선 목록
- 🟡 Small 그림자: `box-shadow: 0 4px 16px var(--color-overlay)` — 전용 shadow 토큰 미정의로 overlay 토큰을 그림자에 차용. Figma 레거시에 그림자 토큰 없음. 코드 유지. → "Figma 개선 필요 목록"(shadow 토큰 신설) 적재.

## ❓ (c) 확인 요청 — 사용자 판단 필요
없음 (0건)

## 🔒 BLOCKED
없음 (`MCP 미제공` 항목 없음)

## 판정
- ❌(a) 0건 · ❓(c) 0건 · 🔒 BLOCKED 0건 → **PASS** (검문소 4 통과)
- 🟡(b) 1건(shadow 토큰)은 개선목록 적재로 통과에 영향 없음.
