# Multi Toggle v2 — 효율 구조 (틀 + 상태×크기 칸, 선택이 덮기)

## 배경
기존 v1(32변형: position first/middle-left/middle-right/last × state × size)은 "가운데를 좌/오로 나눠" 선택 셀 이웃의 보더를 변형으로 관리 → 손이 많이 가고 퍼블리싱에도 비효율.
v2 = **틀(컨테이너)이 바깥 테두리·둥근모서리·자르기 담당 + 칸은 상태×크기만 + 선택 칸이 양옆 구분선을 덮음**(퍼블리싱: `margin:0 -1px; z-index:1` 정석 패턴). position 축 제거 → **8변형**.

## 타깃 (기존 옆에 비교용)
- 파일 `cysG5U1udpQqVagYY1hWHW`(V3.0 TEST), 페이지 `302:19291`(test).
- 기존 v1 세트 `587:8029` 는 x=190, y=134, w=596. **v2 는 그 오른쪽**(x≈900~) 빈 공간에 배치. 이름 충돌 피해 `Multi Toggle v2`.

## 컴포넌트 정의
### 셀 변형세트 `Multi Toggle v2` — state × size = 8 variant
- 변형축: `state` = default·hover·selected·disabled / `size` = md·sm. **position 없음.**
- 칸 = 오토레이아웃, 가운데 정렬, 라벨 "항목"(Pretendard Medium 14).
- 크기: md 높이 44(`sizing/44`)·패딩 12(`spacing/padding-inline/xs`·`padding-block/xs`) / sm 높이 34(`sizing/34`)·패딩 8(`xxs`). **모서리 라운드 없음**(틀이 잘라줌). 폭 hug 또는 64/56.
- 보더(분절선): **미선택(default·hover·disabled) = 왼쪽 보더 1px만**(`border-width/1`, 칸 사이 구분선). 상/하/우 보더 없음(틀이 바깥 담당).
- **선택(selected) = 4변 보더 전부 1px(파랑) + 파란 배경**(덮을 때 위에 얹혀 양옆 회색선 가림).

### 색 토큰 (전부 변수 바인딩 — 하드코딩 hex 금지)
| state | bg | border | text |
|-------|----|----|------|
| default | `color/button/bg/secondary--default` | `color/button/border/secondary--default`(왼쪽만) | `color/button/label/secondary--default` |
| hover | `color/button/bg/secondary--hover` | `color/button/border/secondary--hover`(왼쪽만) | `color/button/label/secondary--hover` |
| selected | `color/button/bg/primary--default` | `color/button/border/primary--default`(4변) | `color/button/label/primary--default` |
| disabled | `color/button/bg/disabled` | `color/button/border/disabled`(왼쪽만) | `color/button/label/disabled` |
- 폰트 Pretendard, 텍스트 스타일 `setTextStyleIdAsync` 바인딩.

## 조립 예시 (틀 + 덮기 시연 — 검증용)
틀(컨테이너) 프레임: 바깥 보더 1px `color/button/border/secondary--default` + 모서리 `radius/control/sm`(4) + **clipsContent=true**. 안에 칸 인스턴스 3개.
- **선택 칸은 자기 자리에서 좌우 1px 삐져나오게(절대위치 -1px) + 맨 앞으로** → 양옆 회색 구분선을 덮음(= CSS margin:0 -1px; z-index:1 의 Figma 시연).
- 미선택 칸 사이엔 1px 구분선 보이고, 선택 칸 인접면엔 회색선 없음. 첫칸 왼쪽 구분선은 틀 보더와 겹쳐 1px.
- md·sm 각각 3종(선택=왼쪽/가운데/오른쪽). 라벨 "항목".
- 배치: v2 세트 아래에 md 3개 한 줄·sm 3개 한 줄, 겹침 없이.

## 결정 필요(HD)
- 없음. (색·치수 v1 과 동일 토큰, position 만 제거.)

## 검증 포인트(검증자용)
1. 변형 8개(state×size)·이름 정확, position 축 없음.
2. 색 전부 토큰 바인딩(raw hex 0), 폰트 Pretendard.
3. 미선택 = 왼쪽 보더만, 선택 = 4변 파란 보더.
4. 조립 예시: 틀이 바깥 테두리·둥근모서리·자르기, **선택 칸이 양옆 구분선을 덮어 회색선 없음**, 나머지 경계 1px.
5. 기존 v1 세트(587:8029)는 건드리지 않음(비교용 보존).
