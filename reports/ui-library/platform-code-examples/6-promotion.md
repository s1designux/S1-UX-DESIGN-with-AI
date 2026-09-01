# 6-promotion — 승인·이행

작성 2026-09-02 · river 승인 2026-09-02

## river 승인 기록

| 결정 | 내용 |
|---|---|
| HD-1 | Mobile 화면의 「개발 코드」는 **보고 있는 화면의 마크업만** (A안) |
| HD-2 | 독립 검증을 **생략하지 않고 실행** — `component-verifier` 시나리오 F |
| HD-3 | Mobile 화면을 PC 와 같은 레이아웃으로 · '정본에 플랫폼~' 안내문 삭제 · 규칙으로 저장해 재발 방지 |
| HD-4 | Mobile 요약 한 줄에서도 **크기 문구 제거** (A안) |
| HD-5 | 개발 코드 위 안내 문구는 두지 않는다 (다른 세션이 반영 · `component-page-template.md §A-6` 기록) |

## 이행 결과

| 항목 | 상태 |
|---|---|
| 플랫폼별 예제 배포 (input·button·chip·select·filter-chip) | approved — `examples/{id}.html` + `examples/{id}.mobile.html` |
| 안내 화면 표출 규칙 | `component-presentation-policy.json` `_meta.uiLibraryGuideLayout` (platformParity · singleValueAxis) |
| 사람용 문서 | `component-page-template.md` §A-5·A-6 + 자가 점검 4항목 |
| 이행 장부 | `registry/governance/ui-library-migration.json` — 5종 갱신 + `platform-code-examples` 레코드 추가 |

## 최종 검사

| 명령 | 결과 |
|---|---|
| `npm run ui:contract` | PASS |
| `npm run ui:build` | PASS · 55 files |
| `npm run ui:guide:render` (신설) | PASS · 9종 × PC·Mobile 실제 렌더 대조 · 4.2초 |
| `npm run ui:test` (렌더 검사 포함) | PASS |
| `npm run ui:state` | PASS |
| `npm run gate:check` | PASS · 게이트 46개 · 경고 11건(작업 전과 동일) |

## 독립 검증 3라운드

| 라운드 | 판정 | 무엇이 걸렸나 |
|---|---|---|
| 1 | ❌ FAIL | 산출물은 통과. **재발 방지 검사기**에 구멍 2건 — G1(변수 이름에 묶인 크기 라벨 검사, chip 경로 무방비) · G2(플랫폼 분기를 무력화해도 전 검사 통과) |
| 2 | ❌ FAIL | G2 는 닫힘. **G1 잔여**(크기를 행 라벨로 되돌리는 가장 현실적인 회귀가 통과) · **G3 신규**(렌더 검사가 축 없는 4종에서 검사 ③④를 통째로 건너뜀 — HD-3 결함이 원래 있던 자리) · 건너뜀 은폐 · **상태 파일이 검증자가 내지 않은 판정을 검증자 이름으로 기록** |
| 3 | ✅ **PASS** | 4건 모두 적대 재현으로 닫힘 확인. 산출물은 3라운드 연속 ❌0건. 후속 1건(B2b 수치 검사 단위 누락)만 남겨 곧바로 반영·역검사 |

**이 워크플로가 실제로 한 일:** 산출물 자체는 처음부터 문제가 없었고, 세 라운드가 잡아낸 것은 전부 **"다음에 되돌아가지 않게 막는 장치"의 허술함**이었다. 특히 2회차의 상태 파일 지적(오케스트레이터가 검증 결과를 대신 적음)은 하드룰 H1 이 막으려는 self-certify 그 자체였고, 기계 게이트(`ui:state`)가 이를 차단했다.

## 남긴 것 — 다음에 이 실수를 반복하지 않기 위해

독립 검증이 실증했듯 **소스 문자열 검사는 화면이 실제로 무엇을 보여주는지 못 본다.**
그래서 이번 규칙 4가지는 전부 `scripts/ui-guide-render-check.js` 가 **렌더된 DOM** 으로 검사한다:
① 개발 코드가 그 플랫폼 배포 예제와 글자 그대로 같은가 ② Mobile 표에 크기 라벨·수치가 없는가
③ Mobile 요약에 크기 문구가 없는가 ④ Mobile preview 가 Action 으로 시작하는가.
네 검사 모두 위반을 주입해 발화하는 것을 확인했다.
