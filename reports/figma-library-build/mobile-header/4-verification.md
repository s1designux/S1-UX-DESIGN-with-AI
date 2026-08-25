# Mobile Header — 4. Independent Verification

> 🤖 component-verifier · 2026-08-25 · 구현/수정 없음

## 현재 판정

| 시나리오 | 판정 | 상태 |
|---|---|---|
| C · Figma 라이브러리 | PASS | ❌(a) 0 · ❓(c) 0 · BLOCKED 0 |
| D · `build-components.ts` | PASS | Gate 13 독립 검증 기록 완료 |
| E · component-guide-sync | PASS | Mobile Header 관련 Gate 16·31 재검증 완료 |

**최종 판정: PASS — Mobile Header 범위의 ❌(a) 0 · ❓(c) 0 · BLOCKED 0.**

## 기준

- 원본: SW UX GUIDE V2.4 `mobile_header` (`540:6112`)와 5개 원본 variant.
- 승인 추가: `Standard / No Title` 1종.
- 계획: `1-inventory.md`, `2-plan.md`.
- 결과 지도: `node-map.json`.
- Figma 타깃: `cysG5U1udpQqVagYY1hWHW` · set `1760:7247` · preview `1760:7248` · section `1654:38976`.

## C · Figma 라이브러리 실측

### 구조·패킹

| 항목 | 실측 | 판정 |
|---|---|---|
| Type variant | 계획 6 / 실측 6, 이름·속성값 전부 일치 | PASS |
| variant 크기 | 6/6 모두 360×99 | PASS |
| root 구조 | Vertical · StatusBar 27 + gap 16 + AppBar 56 | PASS |
| 세트 패킹 | 820×417, padding 40, 2열×3행, gap 20, overlap 0 | PASS |
| 순환참조 | 0 | PASS |
| No Title | AppBar 내부 TEXT 0 | PASS |
| section 수용 | set·preview 모두 `1654:38976` 직계 자식, section 2296×3934 | PASS |
| preview | 740×337, 3행×2열, instance 6/6, 각 360×99, 잘림·범위 이탈 0 | PASS |

variant node: `1757:7099`, `1757:7129`, `1758:7158`, `1759:7167`, `1759:7204`, `1760:7217`.

### 토큰 바인딩 스캔

- 스캔 노드: `1760:7247`.
- 총 노드 191 · 보이는 SOLID fill/stroke 112 · 바인딩 112 · 미바인딩 0 · 고유 raw hex 0종.
- raw hex가 0종이므로 `figma-binding-lookup.js` 역매핑 입력은 없음(N/A). 빈 입력은 도구가 사용법 오류(exit 1)로 거부하지만, 미바인딩 사실은 use_figma 스캔으로 0건 확인했다.

| raw hex | 노드·속성 | 역매핑 | 허용편차 | 판정 |
|---|---|---|---|---|
| 없음 | — | N/A | — | PASS |

### 폰트 스캔

| textCount | offenderCount | textStyle 미바인딩 | 판정 |
|---:|---:|---:|---|
| 18 | 0 | 0 | PASS |

- 전 TEXT의 `getStyledTextSegments(['fontName'])` family가 Pretendard.
- 제목은 `title/18M` 또는 `title/18B`, 부제는 `body/14R`, StatusBar 문자는 `body/12M`에 바인딩.
- Noto 잔존 0.

### INSTANCE provenance

set과 preview에서 INSTANCE 34개를 `getMainComponentAsync()`로 전수 검사했다.

| key / main | remote | 수량 | 허용 근거 | 판정 |
|---|---:|---:|---|---|
| `a9450c5f...` · StatusBar `Platform=App` | false | 12 | 로컬 | PASS |
| `7190e284...` · Back Solid | true | 6 | allowed `mobileHeaderBack` | PASS |
| `54469d54...` · Close Solid | true | 4 | allowed `mobileHeaderClose` | PASS |
| `13cf1b58...` · Notification Line | true | 4 | allowed `mobileHeaderNotification` | PASS |
| `6babc3f4...` · Arrow Solid | true | 2 | allowed `mobileHeaderArrowDown` | PASS |
| Mobile Header 6 variant key | false | 각 1 | preview의 로컬 set instance | PASS |

- 허용목록 밖 remote key 0.
- 승인 화살표: key `6babc3f493e48be1e7191a7b8a68945833039fe8`, 원본 `>` Solid, target rotation `-90°`, 아래 방향 렌더 확인.

### 렌더 대조

- 원본 5종 `540:6113`, `540:6137`, `540:6157`, `540:6178`, `540:6201` screenshot 전수 대조.
- 결과 6종 variant와 preview `1760:7248` screenshot 전수 확인.
- 글리프 누락·요소 겹침·세트 붕괴·preview 잘림 없음.
- Home 배경은 계획된 허용편차 #1/#2에 따라 `color/bg/level-2`를 사용했다.

## D · 설치기 코드 구조

변경 심볼 `MOBILE_HEADER_TYPES`, `makeRequiredIconInstance`, `buildMobileHeaderVariant`, `buildMobileHeader`, `ICON_KEYS`, category/dependency/runner 등록을 좁혀 대조했다.

- Type 6종과 Figma set 축 일치.
- StatusBar `Platform=App` 의존과 인스턴스 부착 경로 존재.
- 4개 아이콘은 import 실패 시 raw SVG로 대체하지 않고 즉시 실패하는 전용 경로 사용.
- 화살표 key와 `-90` 회전 일치.
- fill은 Semantic Variable, 텍스트는 필수 Pretendard text style이 없으면 실패하도록 구성.
- `Mobile Header`의 category, `BUILT_SETS`, `BUILT_COMPS`, dependency, runner 등록 확인.

| 명령 | 결과 |
|---|---|
| `npm run installer:check` | PASS |
| `npm run components:keycheck` | PASS |
| `npm run components:anatomy` | PASS |
| `npm run components:iconpolicy` | PASS |

Gate 13: `component-verifier` · `pass` · `structural`로 기록 후 재검사 PASS.

## E · 동기화 경계

| 항목 | 결과 |
|---|---|
| `npm run components:guide-model:check` | PASS · 43개 정본 byte 일치 |
| `npm run components:variantcov` | PASS · 신규 공백 0 |
| `npm run components:sizenaming` | PASS · 위반 0 (기존 GNB Menu 미계측 경고 1) |
| `npm run harness:audit` | PASS · errors 0 · warns 0 |
| component facts | Mobile Header Type 6종, 360×99, anatomy, StatusBar dependency 생성 확인 |
| Registry Figma 연결 | file/set key/node, variant node 6종, preview node 기록 확인 |
| `pages/components.html` | diff 0 · 손관리 사이트 무변경 |
| `npm run gate:check` | Mobile Header 관련 Gate 16·31 PASS · 전체 명령은 task 외 병행 변경 2건 때문에 exit 1 |

### 수정 후 재검증 완료

1. Gate 16: `registry/governance/update-management.json`의 `mobile-header`가 `verify=new`, `verifyDate=2026-08-25`, mobile 완료로 반영됐고 재검사 PASS.
2. Gate 31: `registry/figma/allowed-remote-keys.json`의 source 설명이 현재 `ICON_KEYS` 16개와 일치하도록 반영됐고 재검사 PASS.
3. `registry/components/mobile-header.json`의 `figmaStatus=confirmed`와 Figma 실측 연결을 확인.
4. Gate 13 기록 뒤 `build-components.ts` hash가 유지되어 독립 검증 기록 재검사 PASS.

### 이번 작업 밖의 병행 변경

- Gate 22: `pages/ui-review.html` 미분류.
- Gate 29: Button focus border dark 값 신규 갈림.

위 두 건은 Mobile Header 변경 위치가 아니므로 이 작업의 결함과 분리한다. 다만 전체 `gate:check`는 현재 exit 1이다.

따라서 전체 작업트리의 `gate:check`는 빨간 상태지만, Mobile Header C/D/E 범위는 독립 검증 PASS다.
