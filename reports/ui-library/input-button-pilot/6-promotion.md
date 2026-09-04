# 6. Promotion — Base Input · Button

- 승격일: 2026-08-26
- 승인자: river
- 배포 버전: `@s1/ui 0.1.0`
- 결과: **APPROVED**

## 승인 범위

- Base Input: PC XXSM·XSM·MD, Mobile MD, 상태 7종, 선택형 안내 메시지, Editing remove 동작
- Button: Primary·Secondary·Blue Line, PC XXSM·XSM·MD, Mobile LG와 native 상태
- 전체 bundle과 개별 설치 HTML·CSS·JavaScript

Password Field·Search Input과 패턴은 포함하지 않는다.

## 승격 근거

- 코드 정본·Registry·UI source·dist 정합 PASS
- PC/Mobile × Light/Dark와 390px 실제 렌더 PASS
- Input remove 크기·Hover·삭제·초점 복귀 PASS
- Button 최소 너비·라벨 중앙·상태 PASS
- 전체 bundle과 개별 설치 동일성 PASS
- 자동 build·test·contract·icon 검사 PASS
- river UI·UX 승인 완료

별도 AI의 중복 실제 렌더 검증은 이번 단순 코어 변경에서 위험도 기반으로 생략했다. 정본 충돌, 복합 flow·접근성 동작, 검사 실패·차단이 있는 후속 변경에는 별도 검증을 다시 요구한다.

## 디자인가이드 게시

- 게시 화면: `pages/components.html#input`, `pages/components.html#button`
- 화면은 `ui-library/dist/s1-ui.css`와 `s1-ui.js`를 직접 사용한다.
- HTML·CSS·JavaScript 탭은 승인된 dist example과 component 파일을 그대로 읽는다.
- 기존 Input·Button 설명 마크업은 제거해 사이트 안에 두 번째 구현이 남지 않게 했다.
- PC·Mobile, Light·Dark, Input remove와 Button 크기·중앙 정렬을 실제 브라우저로 재확인했다.

---

## 2026-09-04 재승격 — @s1/ui Base Input · Button

2026-09-02 focus-visible 전량 철회로 draft 로 되돌렸던 두 코어를 다시 approved 로 승격한다.

### 승격 근거

| 단계 | 결과 |
|---|---|
| 3-build | focus 제거본 + river 결정 3건 반영, 기계검사 9종 종료코드 0 |
| 4-verification | 🤖 `component-verifier` 시나리오 F **4회차 PASS** (1·2차 FAIL 에서 내 실수 4건 교정) |
| 5-human-review | river 승인 2026-09-04 — PC 검수 화면 + 안드로이드 실기기 |
| Gate | `npm run gate:check` **PASSED** · 게이트 50개 · 오류 0 |

### 갱신한 것

- `registry/governance/ui-library-migration.json` — input·button `draft` → `approved`, `approvalHistory` 에 2026-08-26 승인의 superseded 경위 보존
- `pages/ui-review.html` — migration 스냅샷 fallback 을 approved 로 (검수 화면에서 「승인 완료(참고)」로 이동)
- `assets/downloads/s1-ui-dev-package.zip` · 다운로드 화면 — 재생성(HD-B 의 "재승인 대기 중" 표시는 승인으로 불필요해짐)
- 설치기 zip — 정본 변경(padR) 반영해 재빌드

### 이번 사이클에서 배운 것

**철회는 승인 범위 안에서만 해야 한다.** 2026-09-02 의 focus-visible 철회가 같은 블록에 있던 "정본 Selected 토큰을 쓰는 초점 표시"까지 지웠고, 기계검사 9종이 전부 초록인 채로 오류·정상확인·읽기전용에서 키보드 초점이 사라져 있었다. 잡은 것은 🤖 독립 검증뿐이었다. `reports/repeated-requests.json` 의 `revocation-sweeps-adjacent-legitimate-code` 로 기록했다.
