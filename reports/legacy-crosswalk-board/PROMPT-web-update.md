# 새 세션 프롬프트 — 웹 업데이트 (정본 보강 5종의 웹 반영)

아래 블록을 **새 세션에 그대로 붙여넣으면** 된다.

---

웹 업데이트 해줘 — 2026-09-08 정본에 새로 들어간 컴포넌트를 웹 배포본에 반영하는 작업이야.

## 배경 (읽고 시작해)

커밋 `28be850` 에서 정본(`build-components.ts`)에 컴포넌트 5개가 새로 생겼는데 **웹 배포본(`ui-library/`)과 안내 화면(`pages/components.html`)에는 아직 없다.** 전부 "정본만 신설, 웹은 별도 작업"으로 분류해 뒀다(`registry/governance/component-page-coverage.json` 의 `noSectionNeeded`).

시공 경위와 river 결정은 `reports/legacy-crosswalk-board/WIP-canon-additions.md` 에 있다. **먼저 읽어라.**

## 이번 범위

| 컴포넌트 | 정본 축 | 웹에서 어떻게 할지 |
|---|---|---|
| **Assist Button** | State 4 · 크기 축 없음(60×32) | 별도 컴포넌트로 만들지, `button` 의 옵션으로 붙일지 **river 결정 필요** |
| **Text Button** | Variant(Primary·Secondary) × State 4 | 〃 |
| **Modal Content** | Size(MD 520×336 · LG 1000×587 · XL 1200×587) × Footer(Single·Dual) | 확인 계열 `modal` 과 **별개 컴포넌트**다. 아래 높이 규칙 주의 |

**범위 밖 2개** — `GNB Sub Menu` · `GNB Sub Menu Item` 은 만들지 마라. 부모인 `GNB` 자체가 웹 배포본에 없다(안내 화면의 gnb 섹션은 손으로 쓴 HTML). GNB 를 웹으로 옮기는 것은 훨씬 큰 별건이다.

## 꼭 지킬 것

**① 콘텐츠 모달의 높이는 Figma 와 웹이 다르다.**
`reports/modal-content-family-backlog.md` 의 「높이 규칙」이 정본이다 — **587 은 최소 높이**이고, 콘텐츠에 따라 커지다가 **딤 화면의 85% 에서 멈추고 본문 내부 스크롤**로 바뀐다. Figma 마스터는 높이를 하나만 가질 수 있어 레거시 실측값을 고정으로 넣었을 뿐이다. **이 동작 규칙을 구현하는 것이 웹의 몫이다.**

**② 확인 계열 모달(`modal`)은 건드리지 마라.** 크기 축이 없다(PC 360 · Mobile 300). 2026-09-08 에 크기 축을 붙였다가 river 지시로 철회한 이력이 있다.

**③ 안내 화면에는 손박이 목록이 있다.**
`assets/js/ui-library-guide.js` 에 컴포넌트별 variant 목록과 `approvedScope` 문구가 **손으로 박혀 있다.** 여기를 안 고치면 **Gate 19 는 통과하는데 화면에는 안 나온다**(속성 선언만 보고 DOM 은 안 본다). 실제로 그 상태가 한 번 났다. 사후 검문은 `node scripts/ui-guide-render-check.js`.

**④ 정본 지문.** 정본이 바뀌면 웹 19개 manifest 의 `canonicalFingerprint` 가 전부 stale 이 된다(정본 파일 전체를 해시한다). 이번엔 정본을 안 바꿀 예정이라 해당 없을 것이다.

**⑤ 커버리지 분류를 바꿔야 한다.** 안내 화면에 올리는 컴포넌트는 `component-page-coverage.json` 에서 `noSectionNeeded` → `sectionFor` 로 옮겨야 Gate 18·19 가 맞는다.

**⑥ 새 색·새 토큰 0건이어야 한다.** 세 컴포넌트가 쓰는 색은 이미 전부 정본에 있다. 새로 만들어야 할 것 같으면 그건 신호다 — 멈추고 river 에게 물어라.

## river 가 준 작업 방식

- **신규를 만들 때는 끝까지 혼자 가지 말고 중간에 보여주고 확인받는다.** 사이트에 올리거나 설치기로 테스트할 수 있게.
- 보고는 결과 중심으로 짧게. 결정할 것과 결과만.
- **개수는 문서에서 베끼지 말고 기계로 다시 뽑아라.** 지난 작업에서 3라운드 연속 틀렸다.
- 검증은 🤖 `component-verifier` 시나리오 F 로 분리한다(만든 자 ≠ 검증하는 자).

## 첫 질문

시작하기 전에 river 에게 이것부터 물어라 — **보조 버튼과 텍스트 버튼을 웹에서 `button` 의 옵션으로 붙일지, 별도 컴포넌트로 만들지.** Figma 정본에서는 별도 세트지만(크기 축이 달라서), 웹은 크기 축을 CSS 로 다루므로 옵션이 될 수도 있다. 정답이 정해져 있지 않다.
