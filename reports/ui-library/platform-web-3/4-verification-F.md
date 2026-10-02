# 4-verification-F — footer · ci · login-gnb (ui-library 0.19.0)

검증자: 🤖 component-verifier (시나리오 F, 독립 · 읽기 전용) · 2026-10-02
범위: 전수 검증(첫 검증, 승계 항목 없음).

## 종합 판정: **FAIL** — ❌(a) 2건 · ❓(c) 2건 · 선행조건 HOLD 1건 · BLOCKED 0건

권장 상태: `workflowStatus=in-progress`, `uiLibraryStatus=candidate`(유지), `nextAction`=「ui-library-builder 가 F-1·F-2 를 고치고, 오케스트레이터가 C-1·C-2 를 river 에게 묻고, workflow-state.json 을 ui:state 통과 형태로 보강한 뒤 델타 재검증」.

## 0. 선행 조건 (기계검사 표)

| 명령 | 재실행 종료코드 | 비고 |
|---|---|---|
| ui:contract | 0 | |
| ui:icons | 0 | |
| ui:icons:origin | 0 | |
| ui:build:check | 0 | source→dist 바이트 일치 (3번 대체) |
| ui:test:check | 0 | |
| **ui:state** (`-- reports/ui-library/platform-web-3/workflow-state.json`) | **1** | verify-F §0 필수 표에 있으나 호출자 표에서 빠짐. 실패 사유: `decisions` 배열 없음 · `handoff.lastActor/updatedAt` 없음 · in-progress 인데 `ownership.currentActor/startedAt` 없음 · `canonicalInputs[3]`(footer.json) sha256 없음 · image-asset role 중복 · checkpoint 0~2 artifacts 누락 |

→ **H-0 HOLD(기계검사 선행 미이행 — ui:state)**. 나머지는 초록이라 검증은 계속 진행했다. 상태 파일은 고치지 않았다.

정본 지문: build-components.ts `ff7fbdb3…`, vars-data.ts `7b171e55…`, textstyles-data.ts `ca379bfa…` — workflow-state canonicalInputs 와 일치.

## 1. 정본 정확 대조 (렌더 실측: http, 1920 폭, 빈 소비자 페이지에 dist examples 주입, Pretendard 강제 적용 후 측정)

### Login GNB (buildLoginGNB)
| 항목 | 정본 | 실측 | 판정 |
|---|---|---|---|
| 크기 | 1920×56 | 1920×56 | PASS |
| 패딩 | 12 / 320 | 12px 320px (1920 폭) | PASS |
| 배경 L/D | navigation/bg #FFF / #1C1D23 | rgb(255,255,255) / rgb(28,29,35) | PASS |
| 하단선 | line/default 1px INSIDE | ::after 1px, #E9E9E9 / #35363F, 높이 깎지 않음 | PASS |
| 서비스명 | title/16B, text/title/primary | 16/700/20.8px/0, #000 / #ECEDF0, x=320 | PASS |
| 지구본 | globe 24 (frame 24 · glyph 18), icon/gray-dark | 24×24 마스크(globe.svg frame 24), #353535 / #B8BABF | PASS |
| 지구본–글자 간격 | 8 | 1556.54→1564.54 = 8 | PASS |
| 한국어 | body/14M, icon/gray-dark | 14/500/18.2px/−0.28px(−2%), #353535 / #B8BABF, 오른끝 1600 | PASS |
| 변형 | 없음(단일) | 없음 | PASS |
| 폰트 정체성 | Pretendard | **빈 소비자 페이지에서 Apple SD Gothic Neo(브라우저 기본)** | **❌ F-1** |

### Footer PC (buildFooter Platform=PC)
| 항목 | 정본 | 실측 | 판정 |
|---|---|---|---|
| 크기 | 1920×116 | 1920×116 | PASS |
| 패딩 | 28 / 320 | 28px 320px | PASS |
| 상단선 | line/default 1px | ::before 1px #E9E9E9 / #35363F | PASS |
| 배경 | navigation/bg | #FFF / #1C1D23 | PASS |
| content 세로 가운데 | counter CENTER | y=33 = (116−50)/2 | PASS |
| content 간격 | 4 | 줄 y 89·107·125 (14+4) | PASS |
| 링크–구분선–링크 | 12 · 1×8 · 12, icon/gray-light | 25px(12+1+12), 1×8 #C4C4C4 / #35363F | PASS |
| 글자 | body/10R, text/body/tertiary | 10/400/14px/+0.2px(+2%), #757575 / #8A8C96 | PASS |
| 문구 | footer.json(=BC 문자열) | 5개 문구 BC 원문과 일치, 회사정보 연속 공백 보존(pre-wrap) | PASS |
| 로고 | S1_g 42×16, icon/gray | 42×16, 오른끝 1600, 세로 가운데, #55575F / #8A8C96 | PASS |
| 로고 path | S1_LOGO_SVG | src·dist 예시 path 문자열이 정본과 완전 일치(4파일 전수) | PASS |
| 폰트 정체성 | Pretendard | **빈 소비자에서 브라우저 기본 글꼴** | **❌ F-1** |

### Footer Mobile (Platform=Mobile)
| 항목 | 정본 | 실측 | 판정 |
|---|---|---|---|
| 패딩 | 8 / 16 | 8px 16px | PASS |
| 배경·선·로고·회사정보 | 없음 | 없음 | PASS |
| 링크 간격 | 8 · 1×10 line/default · 8 | 17px(8+1+8), 1×10 #E9E9E9 / #35363F | PASS |
| 글자 | body/12R | 12/400/15.6px/0 | PASS |
| 링크–카피라이트 간격 | spacing/4 | 4 | PASS |
| **카피라이트 정렬** | 프레임 hug(폭=링크줄) + 카피라이트 STRETCH + CENTER → **링크 줄 폭 안에서 가운데** | 루트가 `width:100%` 라 카피라이트가 **푸터 전체 폭(1888px)** 으로 늘어나 화면 가운데에 놓임. 360 칸에서도 링크줄 중심보다 약 28px 오른쪽(검수 캡처 review-pc-light Mobile 칸에서 육안 확인) | **❌ F-2** |

### CI (buildCI)
| 항목 | 정본 | 실측 | 판정 |
|---|---|---|---|
| 6변형 | Brand 에스원·삼성 × Color White·Blue·Dark | data-brand s1·samsung × data-color 3, 예시 6칸 | PASS |
| 에스원 크기 | 78.75×30, viewBox 0 0 42 16 유지 | 78.75×30, svg 100%, viewBox 유지 | PASS |
| 에스원 색 L | white #FFF · brand/ci #004097 · icon/gray #55575F | 일치 | PASS |
| 에스원 색 D | White·Blue 불변, Dark→#8A8C96 | 일치 | PASS |
| 삼성 크기·채움 | 134×36, IMAGE scaleMode FILL | 134×36, background-size cover(1600×425 → 가로 약 0.8px씩 잘림, Figma FILL 과 동일 계산) | PASS |
| 삼성 이미지 원본 | imageHash 3종 | **dist PNG 의 SHA-1 이 Figma imageHash 와 정확히 같음**(Figma 이미지 해시=원본 바이트 SHA-1) · sha256 은 reports/assets·src·dist 3곳 동일 | PASS |
| Blue 의 Foundation 직결 | 정본이 brand/ci 직결 | manifest·registry 에 예외 명시 | PASS |

## 2. 접근성·의미
| 항목 | 결과 | 판정 |
|---|---|---|
| Footer `<footer>` contentinfo | 예시에서 div 안 — contentinfo 유지. 링크 ul>li>a | PASS |
| Login GNB `<header>` banner | 예시 최상위 header — banner. (빈 소비자처럼 main 안에 넣으면 banner 아님 — 쓰는 화면 몫) | PASS |
| 언어 button | `button type=button`, 이름 = 보이는 「한국어」, 아이콘 aria-hidden | PASS |
| CI 이름 | span role=img + aria-label 에스원/삼성, 내부 svg aria-hidden·focusable=false | PASS |
| Footer 로고 aria-hidden | 회사정보 글자가 이름을 이미 말함 — 합리적 | PASS |
| hover/focus 미발명 | `:hover/:active` 0, 브라우저 기본 초점 | PASS |
| 콘솔 오류 | 0건 | PASS |

## 3. 설치 방식 동일성
- 빈 소비자(전체 묶음) ↔ 개별 모듈: 세 부품의 outerHTML 길이·모든 하위 요소 박스·색·글꼴·배경이미지 문자열 **완전 동일**. 삼성 이미지 URL 양쪽 모두 `dist/assets/images/…` 로 풀림(200). — PASS
- 참고: 빈 소비자에는 Footer Mobile 과 CI 2칸(s1/blue, samsung/dark)만 들어 있어 Footer PC·CI 4칸은 개별/묶음 대조 표본이 없다(경고, 판정 영향 없음 — CSS 원문 동일성은 ui:test 가 증명).

## 4. 빌드 파이프라인 (이미지 지원)
| 항목 | 결과 | 판정 |
|---|---|---|
| 등재 = 배포 통로 | images/manifest.json 에 적힌 파일만 복사, sha256 다르면 throw | PASS |
| check 모드 | Buffer 는 바이트 비교, 그 외 글자 비교. 예상 밖 dist 파일 전수 탐지 유지 | PASS |
| 결정론 | 파일 바이트 그대로 복사, ui:build:check 0 | PASS |
| url 치환 일반화 | HEAD 의 s1-ui.css url 집합 26개 **변화 없음**, 새로 3개(images)만 추가. 묶음 CSS 의 모든 url 이 dist 실제 파일로 풀림, `../` 잔존 0 | PASS |
| 배포 zip | html-css-js · dev-package · react · vue zip 에 PNG 3개 + s1-ui.css 동봉 | PASS |

## 5. 안내·검수 화면이 dist 만 쓰는가
- ui-review.html: 표본을 `dist/examples/{id}.html` fetch 후 복제 — 문구·로고 사본 없음. 추가 CSS 는 배치 전용(그리드·1920 틀·360 상자·CI 진열 칸), 부품 내부 선택자 0. — PASS
- ui-library-guide.css: 배치 전용 5규칙, 부품 선택자 0. — PASS

## 6. 렌더 행렬
선캡처 사용: `reports/ui-library/platform-web-3/screens/review-{pc,mobile}-{light,dark}.png`. 판정이 갈린 지점(카피라이트 정렬·좁은 폭·글꼴)은 직접 실측했다(http 127.0.0.1, 1920×1000, Light/Dark 는 `data-theme`).

## 7. 결함·확인 목록

### ❌ F-1 (a) Footer·Login GNB 가 글꼴을 지정하지 않음 — 빈 화면에 붙이면 Pretendard 가 아닌 브라우저 기본 글꼴로 나온다
- 근거: 계약대로 Pretendard·tokens·typography·s1-ui.css 만 읽은 빈 소비자에서 `[data-s1-component=login-gnb]`·`footer` 글자의 computed font-family = `"Apple SD Gothic Neo"`. 같은 페이지의 button·input 은 `"Pretendard Variable", Pretendard, sans-serif`(자기 CSS 에서 지정). typography.css 는 body 글꼴을 정하지 않는다.
- 폰트 정체성은 정확 대조 항목이라 두갈래 대상이 아니다. 검수 화면은 페이지가 body 글꼴을 Pretendard 로 깔아 줘서 드러나지 않았다.
- 참고(범위 밖, 기존 부채): 같은 누락이 승인된 gnb · gnb-sub-menu(-item) · mobile-header · mobile-bottom-nav · modal · modal-content · toggle 에도 있다. 별도 작업으로 다루길 권장.

### ❌ F-2 (a) Footer Mobile 카피라이트가 링크 줄이 아니라 화면 전체 폭 기준으로 가운데 정렬됨
- 정본: Mobile 프레임은 두 축 hug, 카피라이트는 `layoutAlign=STRETCH` + CENTER → 폭이 링크 줄과 같아 링크 줄 아래 가운데. 소스 주석도 「링크 줄 폭에 맞춰 가운데」라고 적었지만 CSS 는 루트 `width:100%` + `align-self:stretch` 라 루트 전체 폭으로 늘어난다.
- 실측: 1920 폭에서 카피라이트 박스 1888px(화면 가운데), 360 칸에서도 링크 줄 중심보다 오른쪽으로 치우침.

### ❓ C-1 (c) 바 좌우 여백 규칙 `clamp(24, (100% − 1280)/2, 320)` — 정본에도 선례에도 없는 새 규칙
- 1920 에서 320 이 되는 것은 정본과 같다. 그러나 「안쪽 1280 폭을 가운데 유지」·「최소 24」는 정본에 없고, GNB 선례는 「full-width 반응형 + 고정 여백 24/20」일 뿐 가운데 1280 열 개념이 없다. 빈자리를 구현자가 규칙으로 메운 형태(H6②) → river 결정 필요.
- 선택지: (A) 이 규칙 승인 (B) GNB 처럼 고정 여백(예: 정본 320 그대로 또는 GNB 24)만 쓰고 안쪽 열 없음. 안 정하면 현재 clamp 로 나간다.
- `min-height:116` 은 정본 폭에서 116 그대로(내용 106 < 116)라 정본과 같다 — 줄바꿈 시 늘어나는 부분은 C-1 결정에 딸린 동작이므로 별도 결함 아님(PASS, C-1 에 종속).

### ❓ C-2 (c) Footer PC 를 좁은 칸(≤375)에 넣으면 로고가 글자에 붙고 320 에서는 8px 넘침
- 실측: 375 폭 → content 오른끝 = 로고 왼끝(간격 0), 320 폭 → scrollWidth 328(8px 넘침), 높이 120 으로 늘어남. 정본은 1920 고정이라 좁은 폭 동작을 말하지 않고, Mobile 변형이 따로 있다.
- 비계약 사용이지만 「PC 변형의 최소 사용 폭(또는 Mobile 로 바꿔 쓰는 기준)」이 계약 어디에도 없다 → 결정 필요: (A) 최소 사용 폭을 계약에 적고 그 이하는 Mobile 사용 (B) 내용–로고 최소 간격을 둔다(정본에 없는 값이라 승인 필요). 안 정하면 좁은 칸에서 겹침이 그대로 남는다.

### 정보 (결함 아님) — 삼성 Dark·에스원/삼성 White 가시성
- 삼성 Dark 는 Dark 모드 바탕에서 거의 안 보이고, White 는 밝은 바탕에서 흐리다. 정본에 다크 전용 변형이 없고 이미지는 모드를 따르지 않으므로 **정본과 일치**. 어느 바탕에 어느 색을 쓸지는 쓰는 화면의 선택. 에스원 Dark 만 다크에서 밝아지는 비대칭도 정본(토큰 vs 이미지) 그대로다. river 에게 제품 관찰로 보여줄 만하지만 판정 대상 아님.

## 8. 검증하지 못한 범위
- Figma 캔버스와의 픽셀 겹침 대조는 하지 않았다(시각 정본=코드, Figma MCP 미인증). 수치는 정본 코드 값과 렌더 실측으로 대조.
- 키보드 실조작(Tab 이동)은 하지 않았다 — 네이티브 a/button 이라 구조로 판정.
- 모바일 실기기·Safari 미확인.

---

## delta 1 — 재검증 (2026-10-02, ui-library 0.19.1)

**판정: HOLD** — ❌(a) 0건 · ❓(c) 2건(C-1·C-2, river 결정 대기 — 변경 없음) · H-0 해소 · BLOCKED 0건.

승계 조건 확인: 정본 지문 동일(build-components.ts `ff7fbdb3…`) · 직전 이후 검사 규칙 추가 없음 · 변경 목록 제공됨(3-build.md「rework 1」) → 델타 범위만 대조.

### 재실행 종료코드
| 명령 | 결과 |
|---|---|
| `ui:state -- reports/ui-library/platform-web-3/workflow-state.json` | 0 (PASS) — **H-0 해소** |
| ui:contract · ui:build:check · ui:test:check | 0 · 0 · 0 |
| 배포본 버전 | 0.19.1 |

### 재대조 (http, 1920 폭, 빈 소비자 페이지 그대로 — 글꼴 강제 없음, Light·Dark)
| 항목 | 결과 | 판정 |
|---|---|---|
| **F-1** 글꼴 | Login GNB 4개 부품 · Footer PC/Mobile 전 글자 computed font-family = `"Pretendard Variable"` (빈 소비자, body 글꼴 미지정 상태). dist footer.css·login-gnb.css 에 선언 존재 | **PASS** |
| **F-2** Mobile 카피라이트 | 링크 줄 중심 = 카피라이트 글자 중심 = 164.79 — **1920 전체 폭 · 360 · 320** 세 폭 모두 오차 0. 카피라이트 박스 폭 = 링크 줄 폭 281.58(정본 hug + STRETCH 와 동일) | **PASS** |
| 묶음 ↔ 개별 동일성 | 빈 소비자 쌍에 Footer PC 1 · Mobile 1 · CI 6 · Login GNB 1 = 9개. outerHTML·모든 하위 박스·색·글꼴·글자크기·배경이미지 **Light·Dark 모두 완전 동일** | **PASS** |
| 회귀 — Login GNB | 높이 56, 서비스명 x=320(패딩 312+8), 지구본 24, 지구본–글자 8, 글자 16/700/20.8 · 14/500/18.2/−0.28, 하단선 1px #E9E9E9; Dark bg #1C1D23 · 선 #35363F | 변화 없음 PASS |
| 회귀 — Footer PC | 높이 116, 패딩 28, content 세로 가운데(+33), 줄 간격 4, 링크 간격 25(12+1+12), 구분선 8 #C4C4C4, 10/14/+0.2 #757575, 로고 42×16 #55575F 세로 가운데, 상단선 1px; Dark bg #1C1D23 · 글자 #8A8C96 · 구분선 #35363F | 변화 없음 PASS |
| 회귀 — Footer Mobile | 패딩 8/16, 링크 간격 17(8+1+8), 구분선 10 #E9E9E9(Dark #35363F), 링크–카피라이트 4, 배경 없음 | 변화 없음 PASS |

### 남은 HOLD
- **C-1** 바 좌우 여백 규칙(clamp 24~320, 안쪽 1280) — river 결정 대기, 그대로.
- **C-2** Footer PC 좁은 칸(≤375) 겹침·넘침 — river 결정 대기, 그대로.

### 이번에 재확인하지 않음 (직전 PASS 승계 — 근거: 해당 파일 미변경·정본 지문 동일)
CI 전체(크기·색·삼성 이미지 원본·cover) · 이미지 빌드 파이프라인·url 치환·zip · 접근성(contentinfo·banner·button·role=img·aria-hidden) · 안내/검수 화면의 dist 전용 사용 · S1 로고 path.

권장 상태: `workflowStatus=in-progress`(C-1·C-2 결정 대기), `uiLibraryStatus=candidate`, `nextAction`=「river 가 C-1·C-2 를 정하면 그 반영분만 델타 재검증 후 6-promotion」.
