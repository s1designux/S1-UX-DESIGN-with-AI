# 0-handoff — 신규 세션 인계 (Mobile Bottom Nav · Mobile Header)

> **새 세션에서 이 작업을 이어받는 방법.** 2026-09-02 river 요청으로 여기까지만 세팅하고 멈췄다.

## 이어받는 명령

```
웹 업데이트 해줘 — mobile-nav-header 재개
```

`ui-library-code` 스킬이 뜨면 **가장 먼저** 이 순서로 읽는다:

1. `reports/ui-library/mobile-nav-header/workflow-state.json` ← 진행 상태·결정·막힌 것
2. `registry/governance/ui-library-code-contract.json` ← 계약
3. `.claude/skills/ui-library-code/references/wiring-and-traps.md` ← 배선표·검증 함정
4. `1-inventory.md` · `2-canon-readiness.md` (이 폴더)

`npm run ui:state -- reports/ui-library/mobile-nav-header/workflow-state.json` 로 지문이 아직 맞는지 확인한다.

## 지금 상태 한 줄

**1·2단계 완료. 3-build 착수 전이며, river 결정 2건과 Figma 아이콘 원본 5종이 남았다.**

## 시작하자마자 river 에게 물을 것 (모아서 한 번)

| # | 질문 | 기본값 |
|---|---|---|
| HD-1 | 두 컴포넌트 접근성을 **모달과 같은 표준 수준**으로 확정할까요? (지금 등급이 '미정'이라 공개가 막힙니다) | — 정해야 진행 |
| HD-2 | 헤더 위 **상태바**(시간·배터리·주소창)를 웹 배포본에 넣을까요? | (A) 빼고 헤더 막대 56px 만 |
| P-1 | **Figma 「아이콘 라이브러리 V2.2」를 데스크톱 앱에 열어 주세요** (아이콘 원본 5종을 받아야 합니다) | — 필수 |

HD-2 는 2026-09-02 에 river 가 "무의견"으로 답해 기본값 (A) 로 가도 된다. 다시 물을 필요 없이 확인만 받으면 된다.

## 아이콘 5종 받는 법 (실측으로 확인한 절차)

`download_assets` 는 **파일이 활성 탭이 아니어도 동작한다.** 노드 번호만 확보하면 된다.

1. river 가 파일을 열면 `mcp__Figma__get_metadata` 로 프레임을 열어 variant 자식 노드 번호를 찾는다.
   - 예: `get_metadata(97:79)` → `Property 1=Line 97:77` · `Property 1=Solid 97:76` 처럼 나온다.
2. `download_assets(fileKey="YcBbW9e0MTR9T3W5Sz0Ukx", nodeId="<variant 노드>", defaultFormat="svg")`
3. 응답의 **`svgAssets`** 쪽 URL 을 받는다(`export` 는 배경 사각형·주변 장식이 섞여 있다). URL 은 금방 만료되니 바로 `curl` 로 내려받는다.

| id | 원본 | 노드 번호 |
|---|---|---|
| `home` | ic_홈 **Solid** | 프레임 97:292 → variant 미확인 |
| `mobileHeaderBack` | ic_이전 **Solid** | 미기록 |
| `mobileHeaderClose` | ic_닫기 **Solid** | **97:76 확인됨** |
| `mobileHeaderNotification` | ic_알림(신규) **Line** | 미기록 |
| `mobileHeaderArrowDown` | ic_화살표더보기 **Solid** | 프레임 419:68 → variant 미확인 |

> `mobileHeaderClose`(Solid)는 **모달의 `close`(Line)와 다른 자산**이다. 같은 이름으로 덮어쓰지 말 것.

## 아이콘을 넣을 때 반드시 통과해야 하는 것 (2026-09-02 신설)

아이콘 원본 대조 게이트가 생겼다. 새 아이콘은 이 3가지를 모두 만족해야 배포된다.

1. `ui-library/src/assets/icons/manifest.json` 에 **`sourceExport`**(대응하는 `assets/icons/ic_*.png` 경로) 선언 — 없으면 실패
2. `npm run ui:icons:origin:record` 로 픽셀 대조 기록 → **평균 알파 오차 0.015 이하**
3. 프레임이 원본과 달라 대조가 불가능하면 `originComparable: false` + 사유. 기존 부채가 아니면 **실패로 막힌다**(면제는 `registry/governance/icon-origin-baseline.json`, 신규는 면제 대상 아님)

`assets/icons/` 에 라이브러리 전체 내보내기(2,458개)가 있으니 대응 PNG 는 거기서 찾는다. 이름 예: `ic_홈_solid.png` · `ic_이전_solid.png` · `ic_닫기_solid.png` · `ic_알림_line.png` · `ic_화살표더보기_solid.png` (**실제 파일명은 반드시 `ls` 로 확인할 것 — 추측 금지**).

## 배선표 (§1-2~1-4) 요약 — 빠뜨리면 조용히 연결 안 됨

`ui-library/scripts/build.mjs`·`test.mjs` 의 `componentIds` · `ui-library/package.json` exports · `src/index.js` · `src/auto-init.js` · 빈 소비자 2종 · `pages/ui-review.html` · `assets/js/ui-library-guide.js`(config + stateMatrix + mount) · `pages/components.html`(섹션 + nav 활성화 + `initFromHash` 허용목록) · `component-presentation-policy.json`(`managedBy: ui-library-guide`) · `ui-library-migration.json` · `component-behavior.pc.json`.

## 이 작업에만 있는 함정

| # | 함정 |
|---|---|
| 1 | **하단 탭 '바'를 만들지 말 것.** 정본 주석(:2956)·registry anatomy 둘 다 "컴포넌트 아님". 아이템 1칸만 배포하고 조립 예시로 보여준다 |
| 2 | 헤더 `Home / Title + Subtitle + 1 Icon` 만 AppBar 상하 여백이 **6**(다른 유형 12). 2줄 스택 44+6+6=56 이라 그렇다 — 정본 주석에 경위 있음 |
| 3 | 헤더 좌측 여백은 Home **20** / Standard **16** 로 다르다 |
| 4 | 하단 탭 섹션이 사이트에 **이미 손관리로 있다**(`pages/components.html:2940`, 폰 목업 포함). dist 소비로 갈아끼울 때 옛 인라인 CSS·JS 정리 필요 |
| 5 | **Gate 44(UI Guide Render)** 와 **부품 표본 격리** 규칙이 2026-09-02 신설됐다. 부품 낱개 표본을 보여줄 때 `data-guide-sample="part"` 를 붙이고, 상위 세트의 테두리·그림자가 낱개에 딸려 나오면 실패한다 |
| 6 | 검증 함정: `file://` 은 마스크 아이콘·ES module 이 안 돈다. **http 로 렌더**할 것 |
| 7 | 같은 작업트리를 다른 세션과 공유 중일 수 있다. `build-components.ts` 가 바뀌면 전 컴포넌트 지문이 stale 이 된다 — 내 컴포넌트와 무관하면 지문만 갱신하고 근거를 `decisions` 에 남긴다 |

## 참고 — 바로 앞 작업(Modal)에서 배운 것

- **아이콘은 "허용목록에 키가 있다"로 원본이라 판정하면 안 된다.** 설치기 폴백(`*_ICON_SVG`)은 근사치일 수 있다. 이번 5종 중 헤더 4종은 아예 폴백이 없어 원본 외에 방법이 없다.
- 모달 작업 산출물이 좋은 본보기다: `reports/ui-library/modal/` 1~6단계 + `ui-library/src/components/modal/`.
