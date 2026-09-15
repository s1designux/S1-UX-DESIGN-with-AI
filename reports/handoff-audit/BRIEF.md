# 쪽지 — 안 끝난 인수인계 문서 6건 정리 (새 세션용)

작성 2026-09-15 · 요청: river "아직 안끝난 인수인계파일에 대한 현황을 자세히 확인하고 처리하고싶은데"

## 한 줄

**인수인계 문서 6건이 "미결"인 채로 남아 있다. 각 항목이 아직도 미결인지 확인하고, 셋 중 하나로 처리한다 — 닫기 / river 에게 묻기 / backlog 로 옮기기.**

고치는 일이 아니다. **정리하는 일**이다. 이 세션에서 실제 코드를 고치지 않는다.

## 왜 필요한가

이 문서들은 앞 세션이 "다음 세션에서 이어서 해라"라고 남긴 것이다. 그런데 남긴 뒤로 시간이 지나 **이미 처리된 항목이 섞여 있다.** 예를 들어 정본 단일화 문서는 "Phase 4 착수 전"이라고 적혀 있는데 `scripts/gen-component-facts.js` 와 `registry/components/component-facts.json` 이 **이미 있다.**

그래서 문서에 적힌 "남은 일"을 그대로 할 일 목록으로 옮기면 **이미 한 일을 또 하게 된다.**

## 가장 중요한 원칙

> **이 문서들은 정본이 아니다.** 적혀 있는 상태를 믿지 말고, 매 항목을 **지금 저장소에서 직접 확인**한다. 문서와 저장소가 다르면 저장소가 맞다(하드룰 H6).
>
> 확인은 📖 `source-reader` 에 맡긴다. 파일을 훑어 "있는 것 같다"로 판단하지 않는다(하드룰 H5).

## 대상 6건과 지금까지 확인된 것

### 1. `reports/handoff-canon-consolidation.md` (2026-08-03)

registry JSON 의 값 이중 기재를 없애는 3단계 계획.

| 문서가 말하는 것 | 내가 본 신호 |
|---|---|
| Phase 4 `component-facts.json` 생성기 + Gate 9e — **착수 전** | `scripts/gen-component-facts.js` · `registry/components/component-facts.json` · `npm run components:facts` **전부 있다.** Gate 9e 라는 이름은 `gate-check.js` 에서 못 찾았다 — 다른 번호로 들어갔는지 확인할 것 |
| Phase 5 값 소비자 이관 · `sync:button` 은퇴 | `sync:button` 은 `package.json` 21줄에 **아직 살아 있다** |
| Phase 6 파괴 단계 (river 확인 후) | registry JSON 20개에서 값 필드가 지워졌는지 확인 필요 |
| (b) 표 xsm 복원 | `table.css` 에 `xsm` **있다** — 된 것으로 보인다 |
| (a) `textStyleKey()` 조용한 치환 삭제 · (c) 텍스트 스타일 이름 직접 지정 52곳 | 확인 안 함 |

**→ 이 문서는 상당 부분 낡았을 가능성이 높다. 항목별로 갈라야 한다.**

### 2. `reports/handoff-pipeline-rebuild.md` (2026-08-02)

| 문서가 말하는 것 | 내가 본 신호 |
|---|---|
| Phase 5 영상 도메인 파일럿 — 위젯 5세트가 Figma 만 완료, 코드 0건 | `registry/components` 에 video·widget 이름 **없다** — 여전히 0건으로 보인다 |
| Phase 6 뷰어 4페이지 은퇴 (river 이미 결정) | `pages/` 에 4개 **그대로 있다**(registry-explorer·token-mapping·migration-board·registry-health) |
| 죽은 렌더러 2개 정리 | `assets/js/component-renderer.js` · `button-harness.js` **그대로 있다** |
| 유령 규칙 R06 삭제 | `audit-rules.json` 9줄에 R06 **그대로 있다** |
| 네비 3면 대조 검사기 신설 | 확인 안 함 |

**→ 이건 대체로 진짜 미결로 보인다.** 다만 "river 가 이미 은퇴 결정했다"는 오래된 말이라, **다시 확인받는 게 안전하다.**

### 3. `reports/figma-library-build/input-state-focus/HANDOFF-next-session.md` (2026-09-08)

세 가지 전부 **river 답변 대기**다. 저장소를 봐도 답이 안 나온다 — river 에게 물어야 닫힌다.

1. 레거시 화면의 옛 Input 20개를 정본 세트로 교체할지 (교체 / 레거시는 둔다)
2. 세트 배경판 raw `#FFFFFF` — 전 세트 공통이라 단독 작업으로 뺄지
3. 설치기 재실행이 인스턴스 연결을 끊는 구조 문제 — **A 멱등하게 / B 자동 재바인딩 / C 대조 검사만** 중 택1

**→ 3번은 큰 건이다.** 설치기를 다시 돌릴 때마다 Figma 시안이 끊길 수 있다는 뜻이라, river 가 무게를 알고 고르게 쉬운 말로 풀어 올려야 한다.

### 4. `reports/figma-installer-layout/HANDOFF-next-session.md` (2026-09-09)

제목은 "해결 완료"인데 끝에 미결이 달려 있다.

- **river 결정 대기**: 사용자가 달력 부품 세트를 제 구역 밖으로 끌어낸 캔버스는 소유가 안 잡혀 엉뚱한 구역에 담길 수 있다. 막을지 둘지.
- **NOT_VERIFIED**: 원래 증상(한 구역이 남의 부품을 삼킴)을 첫 설치에서 재현 못 했다. 원인 미확정.
- **실물 미확인**: 전부 mock·코드 레벨. Figma 실제 캔버스 확인은 사람만 가능하다 — **원본 말고 사본 파일**에서.
- 개선 적재 1건(비차단).

### 5. `reports/mechanism-approvals/HANDOFF-next-session.md` (2026-09-08)

메커니즘 승인 9건. 결정 화면이 **웹에 게시돼 있다**: `https://claude.ai/code/artifact/a585db0e-d683-461d-87ab-8a384bbf921a`

- 화면에 river 가 이미 답한 것이 있는지 **먼저 읽어라**(화면이 답을 저장한다 — `capabilities: {db:{}}`).
- 답이 있으면 그대로 반영하고 닫는다. 없으면 river 에게 화면 링크를 다시 드린다.
- 화면을 고쳐 다시 올릴 때는 **같은 URL 로** 올린다(문서 부록에 방법이 적혀 있다).

### 6. `reports/handoff/README-peer-wip-adoptInto.md` + `.patch` (2026-09-08)

다른 세션이 만들다 멈춘 163줄짜리 변경을 패치로 떼어 보관한 것. 설치기를 **제자리 갱신**(`adoptInto`)하게 만드는 시도다.

- `build-components.ts` 에 `adoptInto`·`REFRESH_TARGETS` **0건** — 아직 안 들어갔다.
- **3번 항목의 선택지 A 와 같은 문제를 다루는 변경이다.** 따로 판단하지 말고 3번과 묶어서 river 에게 한 번에 올려라.
- 문서 자체가 "원저자 확인 필요 · river 승인 근거는 확인하지 않았다"고 적어 두었다. 그 승인이 실재하는지부터 확인한다.

## 하는 방법

1. **6건을 항목 단위로 쪼갠다.** 문서 하나가 통째로 미결인 경우는 거의 없다.
2. **항목마다 지금 저장소에서 확인한다.** 파일이 있나, 명령이 있나, 게이트가 잡나. 📖 `source-reader` 에 맡기고, `파일:줄`로 근거를 남긴다.
3. **셋 중 하나로 보낸다.**
   - **닫기** — 이미 됐다. 무엇이 그 증거인지 적고 문서에서 지운다.
   - **river 에게 묻기** — 사람만 정할 수 있다. 쉬운 말 + 선택지 + 안 정하면 어떻게 되는지.
   - **backlog 로 옮기기** — 할 일은 맞는데 지금은 아니다. `BACKLOG.md` 에 넣고 문서에서 지운다.
4. **다 비워진 문서는 지운다.** 내용은 git 이력에 남는다.
5. **코드는 고치지 않는다.** 이 세션의 산출물은 현황표와 river 에게 올릴 질문까지다.

## 산출물

`reports/handoff-audit/1-status.md` 한 장.

- 표 하나: **문서 · 항목 · 지금 상태(됨/미결/모름) · 근거(파일:줄) · 보낼 곳(닫기·질문·backlog)**
- river 에게 올릴 질문을 **모아서** 마지막에. 각 질문은 한 줄 + 선택지 + 안 정하면 어떻게 되는지
- 확인 못 한 항목은 `모름`으로 정직하게 남긴다 — 추측으로 "된 것 같다" 하지 말 것

river 는 비개발자다. 보고는 결론 한 줄 → 표 → 결정할 것 순서로 10줄 안팎. 자세한 건 산출물에 두고 링크만 준다.

## 이미 정리된 것 (참고)

인수인계 문서 3건은 2026-09-15 에 지웠다 — 모바일 내비·헤더, 비밀번호/검색 입력창, 레거시 대조판 정본 보강. 셋 다 승인까지 끝났다(커밋 `98a36eb`).

## 관련

- `reports/missing-inventory-audit/BRIEF.md` — 빠진 컴포넌트·토큰 확인(river 가 먼저라고 한 일)
- `reports/ui-library/bottom-sheet/BRIEF.md` — 바텀시트 웹 부품화
- `BACKLOG.md` — 옮길 곳
