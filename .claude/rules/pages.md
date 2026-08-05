---
paths:
  - "pages/**"
  - "assets/js/**"
  - "assets/css/site-base.css"
  - "index.html"
  - "data/site-map.json"
---

# 가이드 페이지 규칙 (IA · Button 표준 · 검증 기준 · CSS 네이밍)

> CLAUDE.md 에서 이동(2026-08-05). 문장은 원문 그대로다(Button Integration 규칙 2번만 하드룰 H6 정합으로 정정 — 해당 줄에 표시).

## 네비게이션 관리

| 파일 | 역할 |
|---|---|
| `assets/js/main.js` | 사이드바 네비게이션 렌더링 (SITE_NAV 배열) |
| `data/site-map.json` | 페이지 메타데이터 |

> 새 페이지 추가 시 `main.js`의 `SITE_NAV` 배열과 `site-map.json` 모두 업데이트 필요.

## MVP3.3 Portal IA 규칙 (2026-05-11 확정)

### SITE_NAV 그룹 구조

SITE_NAV는 사용자 대면 그룹과 System 운영 그룹으로 분리한다.

**사용자 대면 그룹** (디자이너·개발자 탐색용):
- `개요`: Overview, 토큰 설치 프롬프트
- `Foundation`: Foundation Tokens, Semantic Tokens
- `Design System`: Components, Button, Icons, Patterns, Policy, Legacy Guide
- `AI 워크플로우`: AI Snippets, Guide MD, MD 리뷰

**System 그룹** (운영·검증용, 사이드바 하단):
- System Status (구: Registry Health)
- Foundation Registry, Semantic Registry, Component Tokens, Component Registry

### 규칙

1. **System 그룹 격리** — 레지스트리 뷰어·거버넌스·상태 대시보드는 System 그룹에만 배치한다. 사용자 대면 그룹에 혼재 금지.
2. **Button 위치** — Button 컴포넌트 페이지는 Design System 그룹에 위치한다. Registry/System에 두지 않는다.
3. **리네임 규칙** — "Registry Health"는 항상 "System Status"로 표시한다. 코드(id, 파일명)는 유지, 텍스트만 변경.
4. **컴포넌트 상세 페이지 탭 구조** — 컴포넌트 harness 페이지는 Preview / Usage / Code / Figma / Review / Token Details 탭을 기본 구조로 사용한다.

## Current Button Standard (MVP3.4.2 — 2026-05-12 확정)

Button을 편집하거나 검토할 때 아래 기준을 단일 참조점으로 사용한다.

1. **공식 variants** — primary / secondary / blue-line. ghost는 공식 variant가 아니다. danger는 삭제됨.
2. **Figma states** — default / hover / pressed / disabled
3. **Harness columns** — action / default / hover / pressed / disabled
4. **action ≠ Figma state** — action은 Figma 디자인 상태가 아니다. HTML harness의 실제 인터랙션 테스트 컬럼이다.
5. **default = static preview** — default 컬럼 버튼에는 `.is-preview`를 적용한다.
6. **Size** — PC: md(h44) / xsm(h34) / xxsm(h28), Mobile: lg(h48). **크기 어휘는 정본(설치기) 표기를 따른다** — 웹은 소문자, 설치기(Figma)는 대문자(MD·XSM·XXSM·LG)로 같은 단어를 쓴다.
7. **CSS class** — `s1-btn-md`=md(44), 무수식어=xsm(34), `s1-btn-xxsm`=xxsm(28), `s1-btn-lg`=lg(48). **s1-btn이 공식 CSS 시스템. sw-button(button.css)은 deprecated.** (2026-08-02 개명: 종전 `s1-btn-lg`가 44를, `s1-btn-sm`이 28을 가리켜 정본과 어긋나고 `lg`가 44·48 두 값을 가리키던 충돌을 해소.)
8. **Token policy** — 색상은 반드시 Semantic 경유. raw HEX 금지. Foundation 직접 참조 금지.
9. **focus-ring 없음** — 디자인시스템 기준 미정의. --button-*-focus-ring 토큰 없음. is-focus outline CSS 없음.
10. **Sync** — Button 기준 변경 시 registry / HTML / md / reports를 함께 수정. `npm run sync:button`으로 정합성 검사.
11. **불일치 발견 시** — 임의 결정 금지. `reports/button-sync-check.md`에 기록 후 사용자 확인.

## MVP3.3 Button Components Integration 규칙 (2026-05-11 확정)

Button 페이지 편집 시:

1. **단일 진입점** — Components > Button (`pages/components.html`)이 Button의 유일한 사용자-facing 진입점이다.
2. **정본 우선** — 값(색·크기·두께·타이포)이 `components.html`·registry 사이에서 어긋나면 **정본**(`build-components.ts`·`vars-data.ts`) 기준으로 **둘 다 고친다**(하드룰 H6). registry 의 **메타 정보**(설명·상태·Figma 노드 매핑·접근성)는 registry 가 기준이다. <!-- 2026-08-05 정정: 종전 문구 "기존 문서 우선 — registry와 충돌하면 기존 문서 기준으로 registry를 수정한다"는 하드룰 H6(정본 우선·파생끼리 저울질 금지)과 정면 모순이었다. 원문 보존: `2. **기존 문서 우선** — 기존 components.html + 기존 컴포넌트 가이드 내용이 우선 기준이다. registry와 충돌하면 기존 문서 기준으로 registry를 수정한다.` -->
3. **Registry/System 메뉴** — Component Registry, Component Tokens는 별도 사용자-facing 메뉴로 노출하지 않는다.
4. **ACTION 컬럼** — Button matrix에서 DEFAULT 앞에 ACTION 컬럼을 배치한다.
5. **ACTION = 인터랙션 전용** — ACTION 셀만 실제 클릭/disabled 테스트가 가능하다.
6. **DEFAULT = 정적 프리뷰** — DEFAULT 셀 버튼에는 `.is-preview`를 적용한다 (pointer-events: none).
7. **공식 variants** — primary / secondary / blue-line만 공식 노출. ghost는 노출 금지.
8. **Size 명칭** — PC: md(h44) / xsm(h34) / xxsm(h28), Mobile: lg(h48).
9. **Class naming** — `s1-btn` 기반 (`s1-btn-md`=md, 무수식어=xsm, `s1-btn-xxsm`=xxsm, `s1-btn-lg`=lg).
10. **변경 기록** — `reports/mvp3-3-button-components-integration.md`에 기록한다.

---


## 연동 관계 맵 — 페이지·네비게이션 부분

### `assets/js/main.js` (SITE_NAV) 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `index.html` | 개요 섹션 카드 목록 동기화 |
| `data/site-map.json` | 페이지 메타데이터 동기화 |

### 새 페이지 (`pages/*.html`) 추가 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `assets/js/main.js` | SITE_NAV 배열에 항목 추가 |
| `data/site-map.json` | 페이지 메타데이터 추가 |
| `index.html` | 해당 섹션 카드 추가 |

### `assets/js/icons-data.js` 변경 시
| 연동 대상 | 동기화 내용 |
|---|---|
| `pages/icons.html` | 아이콘 렌더링 동기화 |


# 🧪 검증 기준

1. 토큰 구조 일관성 유지
2. Semantic 역할 명확성
3. Component Token → Semantic 참조 여부 (Foundation 직접 참조 금지)
4. 상태값 누락 여부
5. Dark Mode 확장 가능성
6. Core / Domain / Legacy 구분
7. 신규에서 Legacy 사용 유도 금지
8. kebab-case 네이밍 준수
9. CSS 클래스 약어 금지 (전체 단어 사용 원칙)

---

# 🏷️ CSS 클래스 네이밍 원칙

가이드 HTML 내 CSS 클래스는 약어 없이 의미 중심으로 작성한다.

## 허용 접두사

| 접두사 | 의미 | 사용 범위 |
|---|---|---|
| `typo-` | Typography | foundation.html 타이포 섹션 |
| `token-` | Token | semantic.html 토큰 테이블 |
| `border-width-` | Border Width | foundation.html 테두리 두께 섹션 |
| `color-` | Color | 색상 팔레트 |
| `spacing-` | Spacing | 간격 섹션 |
| `radius-` | Radius | 모서리 반경 섹션 |
| `palette-` / `pal-` | Palette | 색상 팔레트 그룹 |
| `platform-` | Platform | components.html PC/Mobile 구분 |

## 금지 약어

| 금지 | 대체 | 이유 |
|---|---|---|
| `tok-` | `token-` | `token-`과 혼재 금지 |
| `type-` | `typo-` | HTML `type` 속성과 혼동 |
| `bw-` | `border-width-` | 의미 불명확 |
| `fw-` | `weight-` | font-weight 약자 불명확 |
| `cat-` | `category-` | 의미 불명확 |
| `cnt-` | `count-` | 의미 불명확 |

---

