# Input·Button river UX 승인

- 승인자: river
- 승인일: 2026-08-26
- 검수 화면: `pages/ui-review.html` · 검수본 `2026-08-26 · 04`
- 결과: **APPROVED**

## 승인 범위

- Base Input: PC XXSM·XSM·MD, Mobile MD, 상태 7종, 선택형 안내 메시지, remove action의 크기·Hover·Focus·값 삭제와 초점 복귀
- Button: Primary·Secondary·Blue Line, PC XXSM·XSM·MD, Mobile LG, Default·Hover·Pressed·Focus Visible·Disabled
- 공개 HTML 구조와 컴포넌트 범위 CSS

Password Field·Search Input과 패턴 화면은 이번 승인 범위가 아니다.

## 기술 승격 상태

river UI·UX 승인과 실제 렌더 재검증이 완료됐다. 단순 코어 변경에 대한 중복 독립 렌더 검증은 위험도 기반으로 생략한다는 river 결정에 따라 Input·Button을 `approved`로 승격한다.

---

## 2026-09-04 river 검수 — 승인

> river: "승인.커밋"

### 검수 방식

- **PC**: 검수 화면 `pages/ui-review.html` 의 「이번에 볼 것」 탭 (PC·Mobile × Light·Dark 4벌)
- **실기기**: 로컬 서버를 LAN 에 열어(`192.168.68.105:4174`) **안드로이드 · 삼성 인터넷 · 폰 라이트모드**에서 직접 조작

### river 가 확인한 것

| 항목 | river 발화 | 결과 |
|---|---|---|
| 글자 중간 탭 시 커서 위치 | "커서가 누른 자리에 잘 서네" | ✅ 4차 검증이 남긴 실기기 미확인 항목 해소 |
| 모바일 지우기 아이콘 위치 | "인풋 내 삭제 아이콘이 좀 왼쪽으로 가있어" → 조치 후 재확인 | ✅ 정본 padR 12→0 으로 해소(D29) |
| 지우기 버튼 노출 | "눌렀는데도 안 보였다" → 진단 후 "이제는 잘되고있어" | ✅ 결함 아님 — 커서 있을 때만 노출(HD-UILIB-06) 규칙대로 |

### 승인 범위

Base Input 과 Button 의 UI·UX 및 공개 HTML/CSS/JavaScript 구조. Password Field·Search Input·패턴은 제외(후속 범위).

### 이 승인이 대체하는 것

2026-08-26 승인은 focus-visible 철회(2026-09-02)로 superseded 되었다. **이 2026-09-04 승인이 현재 유효한 유일한 승인**이며, 대상은 철회본 + river 결정 3건(D26 초점 테두리·커서 끝·disabled 스킵, D29 모바일 아이콘 위치)이 모두 반영된 배포본이다.

### river 에게 보고한 채로 승인된 항목 (미결 아님)

- 지우기 버튼이 없는 모바일 입력칸은 글자가 오른쪽 테두리까지 닿는다(D29 부작용). 승인 시점에 보고했고 river 가 승인했다.
- 모바일 아이콘 위치 수정은 🤖 독립 검증 이후의 ⭐ 자가인증 변경이다(H1② 기계적 수정 · Gate 13 기록). 승인 시점에 보고했다.
