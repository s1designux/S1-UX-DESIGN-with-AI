# 1-inventory — GNB Sub Menu · GNB Sub Menu Item

작성 2026-09-09 · ⭐ 오케스트레이터 · 근거 = 정본 `plugins/figma-vars-installer/src/build-components.ts` 직접 판독(3655~3838)

> 2026-09-08 정본 보강으로 신설됐고(기준 원본 = 레거시 A `gnb list` 540:6398 regular, river 결정 "A로 가"),
> Figma·설치기에는 들어갔으나 **웹 배포본과 안내 화면에는 없다.**
> 부모 GNB 가 2026-09-09 에 웹으로 배포돼(`verified`) 이제 이 둘을 만들 수 있다.

---

## A. 세트 2개

| 세트 | 축 | 변형 수 |
|---|---|---|
| `GNB Sub Menu Item` | Depth(1depth · 2depth) × State(Default · Hover · Selected) | **6** |
| `GNB Sub Menu` (패널) | Depth(1depth · 2depth) | **2** |

`Depth` 축의 뜻이 둘에서 다르다 — 정본 주석(3696) 그대로다.

| | 1depth | 2depth |
|---|---|---|
| **Item** | 카테고리 제목(Bold) | 항목(Medium) |
| **패널** | 항목 목록만 (A `compact`) | 제목 + 항목 목록 (A `regular`) |

## B. Item — 수치·색

| | 1depth (카테고리 제목) | 2depth (항목) |
|---|---|---|
| 예시 문구 | "카테고리 제목" | "하위 메뉴" |
| 글자 | **16 Bold** · `title/16B` | **16 Medium** · `title/16M` |
| Default 색 | `color/navigation/submenu/label/default` | `color/navigation/label/default` |
| Hover 색 | `color/navigation/label/selected` | 같음 |
| Selected 색 | `color/navigation/label/selected` | 같음 |

- **들여쓰기 없음.** A 기준이라 B 의 8px 을 버렸다(정본 주석 3673·3689).
- 배경 없음(`comp.fills = []`), 크기는 hug, 세로 가운데 정렬.
- **Hover 와 Selected 는 색이 같다** — GNB 메뉴와 같은 구조다.

## C. 패널 — 수치·색

| 항목 | 값 | 토큰 |
|---|---|---|
| 폭 | 1920 (= GNB 바 폭) | — |
| 배경 | | `color/navigation/bg` |
| 위 여백 | 2depth **32** · 1depth **24** | `spacing/32` · `spacing/24` |
| 아래 여백 | 2depth **64** · 1depth **24** | `spacing/64` · `spacing/24` |
| 좌우 여백(최소) | 24 | `spacing/24` |
| 하단선 | 1px INSIDE | `color/line/gray/subtle` |
| 그림자 | | `shadow/dropdown` (기존 재사용 · 신규 0건) |
| 컬럼 수 | 4 | — |
| 컬럼 사이 간격 | **80** | `spacing/80` |
| 컬럼 안 세로 간격 | **24** | `spacing/24` |

- **좌우 여백은 값이 아니라 정렬 규칙이다.** A 는 컬럼 묶음을 가운데 정렬한다 — 패널이 `CENTER` 이고 좌우 24 는 최소값일 뿐이다(정본 주석 3679).
- ⚠️ 컬럼 묶음(슬롯)은 **hug 로 두고 늘리지 않는다.** 늘리면 가운데 정렬할 여백이 사라진다(정본 주석 3814 — 🤖 component-verifier 2026-09-08 적발 사례).

### 컬럼 기본 내용

| 패널 Depth | 컬럼 하나의 구성 |
|---|---|
| 2depth (A regular) | 제목(1depth Default) 1개 + 항목(2depth) 4개 |
| 1depth (A compact) | 항목(2depth) 3개 |

첫 컬럼의 **첫 항목만** Selected. 나머지 Default.

## D. 색 토큰 — 신규 0건

`color/navigation/submenu/label/default` 는 2026-09-08 정본 보강 때 신설돼 이미 정본에 있다(Gate 34 승인 기록됨). 이 작업에서 새로 만들 색은 **0건**이다.

## E. 아이콘

**없다.** 두 컴포넌트 모두 글자만 쓴다.

## F. 웹 배선 — 현재 상태

| 자리 | 현재 |
|---|---|
| `ui-library/src/components/gnb-sub-menu*/` | 없음 |
| `build.mjs` · `test.mjs` · `package.json exports` | 없음 |
| `pages/ui-review.html` · `pages/components.html` | 없음 |
| `assets/js/ui-library-guide.js` | 없음 |
| `registry/components/gnb-sub-menu*.json` | **없음 — 이 작업에서 신설한다**(registry 는 메타의 정본) |
| `registry/governance/component-presentation-policy.json` | 없음 |
| `registry/governance/ui-library-migration.json` | 없음 |

## G. 미확인

- Figma 캔버스 실물 설치 — 설치기 zip 에는 들어 있으나 캔버스에 실제로 설치해 본 적이 없다(인계서 `NEXT.md` 기록). 이 작업의 시각 정본은 코드이므로 막지 않는다.
- 패널이 GNB 바 아래에 어떻게 붙어 열리고 닫히는지(트리거 연결) — **정본에 없다.** §2-canon-readiness 에서 다룬다.
