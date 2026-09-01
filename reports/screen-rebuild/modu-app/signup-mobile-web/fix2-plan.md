# PILOT FAIL 7건 — fix2 계획 (PLAN-ONLY)

## 상태

- Figma write: 0
- 현재 판정: **HD / BLOCKED**
- 빌드 시작 금지
- `workflow-state.json` 수정 없음
- `snapshot-fix2-expect.json` 미작성: 아래 두 명세 충돌이 해소되기 전에는 exact diff를 정직하게 확정할 수 없다.

## 읽기 근거

- 독립 검증: `4-verification.md`
- 현재 최종 구조: `snapshot-layout-fix-after.json` (690 nodes)
- source screenshots(read-only): password `2449:31218`, modal `10580:19015`, bottom sheet `2449:31168`
- 정본 코드: `build-components.ts` Bottom Sheet content gap 24 / sheet-to-footer gap 48 / Footer Dual, Mobile Modal 구조

현재 section의 새 paged snapshot 캡처는 350-node 구간 중 Figma가 비JSON `The automation...` 응답을 반환해 중단됐다. use_figma 오류 규칙에 따라 같은 경로를 재시도하지 않았다. 직전 live snapshot 이후 Figma write는 없으므로 구조 판단에는 기존 최종 snapshot을 사용했지만, 실제 수정 전 operator가 `snapshot-fix2-before.json`을 새로 캡처해야 한다.

## 결함별 수정 설계

### 1. Mobile Header ×4

대상 nested StatusBar:

- `I1858:1786;1760:7218`
- `I1858:17819;1760:7218`
- `I1858:18083;1760:7218`
- `I1858:18221;1760:7218`

각 노드는 현재 360×27, main `1654:37388`이다. width 360을 유지하고 height 77, vertical sizing FIXED로 설정한다. 부모 Header는 VERTICAL gap 16 / 360×149를 유지한다. AppBar는 auto-layout에 의해 y=43→93으로 이동해야 한다. 수정 뒤 StatusBar main id `1654:37388`, `remote=false`를 다시 검사한다.

확정 가능한 snapshot 변화: `h=4`, `y=4`(AppBar 4개). 추가·삭제 없음.

### 2. 비밀번호 편집 화면

현재 직접 노드:

- Content `1858:18029`: y149, h240, clipsContent=true
- Page Title `1858:18030`: y14, h62
- helper link `1858:18031`: y98, h20
- Password Input `1858:18032`: y98, h94
- Password Confirm `1858:18061`: y222, h72
- CTA `1858:18081`: screen y333, h48

source capture는 title, 첫 input(label/field/helper), confirm label, CTA, keyboard 순서다. 현재 명세의 confirm screen y371, CTA y333은 서로 역순·겹침이며, keyboardNav y389까지 240px 안에는 62+94+72+48과 간격을 모두 배치할 수 없다. `clipsContent=false`만으로는 해결하지 않는다.

**HD-PASSWORD:** 다음 중 하나를 오케스트레이터가 확정해야 한다.

1. 권장: source 시각을 우선해 confirm은 label-only 표현으로 바꾸고 CTA를 keyboard 직전으로 둔다. 그러면 `passwordConfirmDefault` instance 요구를 명세에서 제거해야 한다.
2. 정본 instance를 반드시 유지하면 confirm 전체와 CTA 중 하나는 keyboard 아래/뒤로 내려가 source capture와 달라진다. 새 anchors를 명시해야 한다.

현재 `screen-spec.json`의 `password2 y=371/h72`, `ctaY=333`, `keyboardNavY=389`는 동시에 만족 불가하므로 수정 전 exact y/h/p diff를 선언할 수 없다.

### 3. 약관 기본·모달 배경

두 화면을 동일하게 수정한다.

- Row All `1858:17785`, `1858:18174`: h18→20
- Agreements `1858:17784`, `1858:18173`: h230→233 (Age row y171+h62=233)

자식 위치와 문구는 유지한다. 두 배경의 overlay 제외 fingerprint는 동일하게 유지한다.

확정 가능한 snapshot 변화: `h=4`. 추가·삭제 없음.

### 4–5. 가입 회원 모달

- local Mobile Modal `1858:18209` 유지, detach/reparent 금지
- screen-root에 임의 title/body sibling 없음
- 내부 title `I1858:18209;1611:6726`과 message `I1858:18209;1611:6727`만 override
- source처럼 `이미 회원으로 가입되어 있습니다.\n아이디 : abcdefg`가 중앙 정렬의 연속된 2줄 본문으로 보이게 구성
- 허용 close sibling `1858:18218`은 유지하고 x282/y302→x282/y265로 이동

**구현 권장:** 내부 title을 숨기고 message 한 노드에 두 줄을 넣어 body/16R, center, width260, HEIGHT로 설정한다. Modal outer는 local Dual 300×208을 유지한다. 수정 전에는 hidden instance child가 snapshot에서 빠지는 방식과 auto-layout footer 위치를 operator가 read-only dry measurement로 확인해야 한다.

예상 최소 변화는 close `y=1`, message `tx/h/y`, title visibility에 따른 `TEXT|title removed=1`이지만, 현재 snapshot 템플릿이 invisible instance child를 생략하므로 exact removed/changed 선언은 dry measurement 후 확정한다.

### 6. Bottom Sheet

현재:

- Dual instance `1858:18450`: 360×498
- content gap 118 (정본 24)
- footer hidden
- sibling description `1858:18480`
- 대체 sibling buttons `1858:18481`, `1858:18483`

정본 복구 자체는 명확하다.

- instance 360×378
- content itemSpacing 24
- footer visible=true
- outer itemSpacing 48 유지
- sibling buttons 두 개와 그 descendant만 exact remove
- footer 내부 Secondary/Primary label을 각각 `새 아이디 사용`, `아이디 선택`으로 override

그러나 정본 Dual의 순서는 title→options→footer로 고정돼 있다. source는 title→description→options→footer다. instance 내부 insert/reparent/itemSpacing 변경 없이 description sibling을 title과 options 사이에 넣는 것은 구조적으로 불가능하다.

**HD-BOTTOM-SHEET:** 권장안은 정본 instance의 내부 list만 숨기고, screen-root extension frame에 description + 4개 local Bottom Sheet Option instances를 source 순서로 배치하며 정본 footer는 그대로 보이는 방식이다. 이 경우 extension 범위가 ‘설명문/추가 option’이 아니라 ‘설명문+전체 option list’가 된다.

오케스트레이터가 아래 문구를 빌드 전에 고쳐야 한다.

- `screen-spec.json` AD-6
- `canonical-manifest.json` BottomSheet.extensionPolicy
- 2b1 componentStates/anchors

권장 새 의미: “Bottom Sheet Dual instance는 360×378, content gap24, Footer Dual visible을 유지한다. source에서 정본에 없는 description이 option 앞에 필요한 화면은 내부 list를 visibility override하고, description과 전체 local option list를 별도 extension frame으로 조합한다. 정본 footer는 숨기거나 대체하지 않는다.”

정본 footer reveal만으로 추가될 snapshot 그룹은 기존 census 근거상 `FRAME|footer=1`, `INSTANCE|secondary=1`, `INSTANCE|primary=1`, `TEXT|버튼=2`(총5)다. 기존 sibling 버튼 제거는 `INSTANCE|Bottom Sheet Secondary=1`, `INSTANCE|Bottom Sheet Primary=1`, `TEXT|버튼=2` 제거다. extension list를 확정하지 않았으므로 전체 expect는 아직 만들 수 없다.

### 7. 배경 회귀

Header fix로 Web 주소창을 복원하고, Page Title의 HEIGHT 교정 상태를 유지한다. 별도 노드 생성은 필요 없다. Bottom Sheet 배경 Page Title `1858:18432`은 현재 320×62 HEIGHT 상태이며 회귀 금지 대상으로 fingerprint한다.

## 조건부 호출 계획 (모두 10 logical ops 이하)

1. Header 1·4: StatusBar 2개 resize/vertical FIXED + main 검사
2. Header 2a1·2b1: StatusBar 2개 resize/vertical FIXED + main 검사
3. Agreement 기본: Row All/Agreements resize 2건
4. Agreement 모달 배경: Row All/Agreements resize 2건 + pair fingerprint
5. Password layout A: HD 결정에 따른 Content/first input/helper 정렬
6. Password layout B: confirm/CTA 정렬 + overlap/clip scan
7. Modal content: internal title/message targeted override
8. Modal close: `1858:18218` y265 + modal geometry scan
9. Bottom Sheet canonical restore: size/gaps/footer + local provenance
10. Bottom Sheet exact remove: `1858:18481`, `1858:18483` only
11. Bottom Sheet extension A: HD 승인 구조의 frame/description
12. Bottom Sheet extension B: local option instances/state/text
13. 화면별 deterministic scan + screenshots

각 write 호출은 created/mutated/removed IDs를 모두 반환한다. 실패 시 해당 호출에서 중단하며 전체 화면 삭제·재생성은 하지 않는다.

## Expect 작성 상태

`snapshot-fix2-expect.json`은 의도적으로 만들지 않았다. 확정된 최소 그룹만으로 파일을 만들면 password와 Bottom Sheet의 미결정 결과를 사후에 끼워 맞추게 되므로 Gate 계약을 위반한다. HD 2건과 operator snapshot/dry measurement가 해소되면 added/removed를 type|name 그룹별로 중복 없이, changed를 field별 exact count로 작성한 뒤에만 write를 시작한다.
