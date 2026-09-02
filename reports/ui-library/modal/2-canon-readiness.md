# 2-canon-readiness — Modal

- 작업: modal · 날짜: 2026-09-02 · 계약 `ui-library-code-contract.json` v0.1.2 (candidate)
- 결론: **검문소 미통과 — needs-decision 2건.** river 결정 전 3-build 착수하지 않는다.

## A. 준비된 것 (막힘 없음)

| 항목 | 상태 |
|---|---|
| 시각 정본 | `buildModalShell`(:4438) — 4변형 축·수치·토큰 전부 확정 |
| 토큰 | 패널 배경·테두리·그림자·딤·글자·아이콘 전부 `vars-data.ts` 에 존재하고 `tokens.css` 라이트·다크 배선 완료. **신규 토큰 0건** |
| 아이콘 | `close` 는 허용목록 안(`allowed-remote-keys.json:19`) · 정본 도형 `CLOSE_ICON_SVG` 존재 → 임의 SVG 아님 |
| 의존 코어 | Button = approved 배포본 그대로 조립 |
| HTML 시맨틱 | `<dialog>` 또는 `role="dialog"` 로 정본 anatomy 재현 가능 — 임의 wrapper 불필요 |

## B. 막는 것 — needs-decision

### HD-1. 모달의 접근성 규칙을 이번에 확정할까요?
- **무엇:** 화면낭독기·키보드 사용자를 위한 규칙입니다. "이건 팝업이다"라고 알리고, 열려 있는 동안 키보드 초점이 팝업 밖으로 새지 않게 가두고, Esc 로 닫히게 하고, 닫으면 원래 있던 자리로 초점을 돌려주는 것.
- **왜 결정이 필요한가:** 등록부에 문장 2줄("dialog 로 표시·초점 가둠·Esc")만 있고 **등급이 "계획만(planned)"** 입니다. 계약이 *"접근성이 미정인 컴포넌트는 승인 배포 불가"* 로 못박고 있어, 이대로는 만들어도 공개가 막힙니다. 규칙 자체를 제가 임의로 만들 수 없습니다(H6②).
- **선택지:**
  - **(A) 표준 수준으로 이번에 확정** — 다른 승인 컴포넌트와 같은 눈높이: 팝업 표시(`role="dialog"` + `aria-modal`) · 제목을 팝업 이름으로 연결 · 열면 초점을 팝업 안으로 · **초점 가둠** · **Esc 로 닫기** · 닫으면 원래 자리로 복귀 · 뒤 배경 스크롤 잠금.
  - **(B) 더 넓게** — 위에 더해 딤 클릭으로 닫기, 애니메이션, 중첩 모달(모달 위 모달) 규칙까지 포함. 범위가 커집니다.
- **안 정하면:** 만들어도 **승인 배포가 막힙니다**(공개 불가).

### HD-2. 여닫는 동작까지 배포본에 넣을까요, 껍데기만 낼까요?
- **무엇:** "이 버튼을 누르면 열리고, 확인을 누르면 닫힌다"를 우리 배포본의 JavaScript 가 해줄지, 아니면 각 서비스가 직접 짤지.
- **왜 결정이 필요한가:** 행동 장부(`component-behavior.pc.json`)에 **Modal 항목이 아예 없습니다.** 여닫기·초점 가둠은 대충 하면 접근성이 무너지는 자리라, 누가 책임질지 정해야 합니다.
- **선택지:**
  - **(A) 동작 포함(권장)** — `open()` / `close()` 와 초점 가둠·Esc·스크롤 잠금을 우리가 제공. 서비스는 "열어라"만 부르면 됩니다. HD-1 (A)와 짝이 맞습니다.
  - **(B) 껍데기만** — 모양(CSS)과 마크업만 배포하고 여닫기는 서비스가 직접. 서비스마다 접근성 품질이 갈립니다.
- **안 정하면:** (A)로 갑니다.

## C. river 결정 없이 확정되는 것 (내가 정함 — 정본·등록부에서 그대로 내려옴)

| 항목 | 이번 배포에서 |
|---|---|
| 변형 | Break(PC·Mobile) × Footer(Single·Dual) 4가지만. 정본에 없는 크기·상태 축을 만들지 않는다 |
| 패널 | PC 360 / Mobile 300 · 상하 여백 20 · 라운드 8 · 테두리 1px · `shadow/raised` |
| PC 닫기(X) | **PC 만** 있다(정본 그대로). Mobile 에는 만들지 않는다 |
| 딤 | 등록부 anatomy 첫 부품이고 `color/overlay` 토큰이 있으므로 배포본에 포함한다 |
| 푸터 버튼 | 승인된 코어 Button 조립(PC XXSM · Mobile LG). 모바일 Dual 은 반반, Single 은 풀폭 |
| 문구 | 정본의 4가지 문구는 **예시**로만 싣는다. 컴포넌트 API 로 고정하지 않는다(UX라이팅 영역) |
| 안내 페이지 분류 | 등록부 `category`="overlay" 를 따라 사이트 상단에 **Overlay** 분류를 새로 만들고 그 안에 Modal 을 둔다 |

## D. 이번 범위 밖 (기록만)

| 항목 | 이유 |
|---|---|
| 콘텐츠 계열 Modal(4크기·스크롤) | 별개 컴포넌트 — `reports/modal-content-family-backlog.md` |
| `guardrail.threshold`="TBD" | 언제 콘텐츠 계열로 넘길지 수치 미정. 콘텐츠 계열을 만들 때 함께 정한다 |
| Bottom Sheet 계열 | 별도 정본(`buildDatePickerBottomSheet` 등) |

## E. 착수 순서 (결정 후)

1. `registry/components/modal.json` 접근성·행동 계약 확정(HD-1) → `a11yStatus` 갱신 · 행동 장부 Modal 항목 신설(HD-2).
2. `ui-library/src/components/modal/` 4파일 + `close` 아이콘(frame 24 / glyph 6,6,12,12) + 배선표 §1-2~1-4.
3. 사이트 안내 페이지 신설 — Overlay 분류 + Modal 섹션(`component-page-template.md §A` 틀).
4. 검증: 실제 dist 로 PC·Mobile × Single·Dual × Light·Dark 8칸 전수 + 초점 가둠·Esc·스크롤 잠금·다중 인스턴스.
