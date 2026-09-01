# MoDU APP 회원가입 모바일 웹 — 전체 빌드

## 결과

- 상태: **NavBar Web + Keyboard 패턴 반영 독립 PASS / verified**
- 대상: Figma `cysG5U1udpQqVagYY1hWHW` / page `173:2431` / section `1744:1782`
- 회원가입 패턴 10장과 기존 본인인증 placeholder 1장, 총 11장을 정리했다.
- Section 2520×1880과 placeholder `1744:1783` 위치·순서를 보존했다.
- 빌더 자체검사 뒤 독립 component-verifier가 Fix3 포함 11장 전체를 재검증해 FULL PASS를 확정했다.

## 화면 결과

| 순서 | 화면 | Root ID | 위치 |
|---:|---|---|---|
| 1 | 약관 전체 동의 | `1858:1782` | 80, 100 |
| 2 | 외부 본인인증 placeholder | `1744:1783` | 480, 100 |
| 3 | 아이디 입력 중 | `1989:356` | 880, 100 |
| 4 | 비밀번호 입력 중 | `1858:1783` | 1280, 100 |
| 5 | 이메일 입력 중 | `1989:357` | 1680, 100 |
| 6 | 앱 설치 안내 | `1989:358` | 2080, 100 |
| 7 | 회원 약관 상세 | `1989:359` | 80, 1000 |
| 8 | 가입 회원 안내 모달 | `1858:1784` | 480, 1000 |
| 9 | 기존 아이디 선택 바텀시트 | `1858:1785` | 880, 1000 |
| 10 | 비밀번호 조건 안내 다이얼로그 | `1996:2` | 1280, 1000 |
| 11 | 이메일 도메인 선택 바텀시트 | `1996:19300` | 1680, 1000 |

## 정본 사용

- 신규 일반 화면 헤더는 로컬 Mobile Header `1898:12288`, 약관 상세 닫기 헤더는 `1898:12349`를 사용했다. nested StatusBar는 직접 수정하지 않았다.
- 5a1은 로컬 Bottom Sheet None `1654:49225`를 360×302, y=394로 유지했다.
- 도메인 옵션은 첫 번째 `naver.com`만 Selected(`1654:49099`), 나머지는 Default(`1654:49097`)다. 다섯 번째 `직접 입력`은 별도 로컬 정본 인스턴스 `1996:19330`으로 y=654에 연결했다.
- 정본 내부 옵션 행은 y=464/512/560/608이다. 원본 anchor보다 2px 아래인 차이는 승인된 AD-6이며 정본 내부 간격을 훼손하지 않았다.
- 외부 화면 clone, instance detach, instance 내부 insert/reparent는 사용하지 않았다.

## 스냅샷 검증

- 기준선: `snapshot-full-before.json` — 690 nodes
- 사전 선언: `snapshot-full-expect.json`
- 최종: `snapshot-full-after-final-v3.json` — 1742 nodes
- snapdiff: 추가 1052 / 삭제 0 / 기존 속성 변경 3 / 선언 밖 변경 **0**
- 기존 변경 3건은 전체 화면 순서를 완성하면서 파일럿 root 3개의 자식 순서가 이동한 것이다.

## 빌더 자체검사

| 항목 | 결과 |
|---|---:|
| 화면 | 11 |
| visible nodes | 1741 |
| visible TEXT | 363 |
| INSTANCE | 119 |
| 로컬 INSTANCE | 78 |
| 허용 원격 아이콘 INSTANCE | 41 |
| 문구·상태·field 위반 | 0 |
| raw 색 위반 | 0 |
| 폰트·TextStyle 위반 | 0 |
| 출처 위반 | 0 |
| 레이아웃 위반 | 0 |
| 화면 밖 overflow | 0 |

배경 짝 fingerprint는 1↔2a1, 3↔2b1, 4↔4a1, 5↔5a1 모두 동일하다. 5a1 최종 대표 캡처에서 `naver.com` 선택과 `nate.com` 문구를 다시 확인했다.

상세 증거는 `scan-summary.json`, `node-map.json`, `trace-full-*.json`, `screenshot-*.png`에 보존했다.

## Fix3 — 전체 독립 검증 FAIL 3건 교정

- 앱 설치 원본 `2449:31009`를 다시 실측했다. 아이콘은 screen `x=140, y=269, 80×80, radius 20`, 라벨은 `x=150, y=300`, 환영 문구는 `y=373`이다.
- `1989:19034` App Icon을 80×80·radius 20으로 교정하고 `color/bg/level-3`(`VariableID:687:17887`)에 바인딩했다.
- `1989:19035` 라벨은 원본 anchor를 유지하고 `color/text/body/tertiary`(`VariableID:8:1118`)에 바인딩했다.
- `1989:19036` 환영 문구는 문구·TextStyle·geometry를 유지한 채 `color/text/state/accent`(`VariableID:8:1119`)에 바인딩했다.
- 비밀번호 조건 Modal `1996:12`은 `x=30, y=220, 300×293`을 유지했다. close `1996:22`만 `x=282, y=244`로 이동해 카드 기준 inset `252,24`를 맞췄다.

Fix3 영향 노드 snapshot은 5→5 nodes, 추가 0·삭제 0·속성 변경 11·선언 밖 변경 0으로 통과했다. 이후 11장 전체 결정론 검사를 다시 실행해 visible 1741 nodes, TEXT 363, INSTANCE 119(로컬 78+허용 remote 41), 8개 위반 범주 모두 0을 확인했다. 배경 fingerprint 4쌍도 모두 동일하다.

Fix3 증거:

- `snapshot-fix3-before.json`
- `snapshot-fix3-expect.json`
- `snapshot-fix3-after.json`
- `trace-fix3-full.json`
- `screenshot-fix3-app-install.png`
- `screenshot-fix3-password-modal.png`

## 최종 판정

- 독립 component-verifier: **FULL PASS**
- ❌ 코드 실수 0 · ❓ 애매 0
- 패턴 등록 진행 승인 후 `registry/patterns/mobile-web-signup/`으로 승격했다.

## 배경 토큰 교정 — 독립 재검증 대기

- 11개 화면 root의 배경만 `color/bg/level-1`에서 `color/bg/level-0`(`VariableID:687:17884`)로 교정했다.
- 생성·삭제·geometry·order·text·state 변경은 0이다. 변경 node는 화면 root 11개뿐이다.
- 유지 대상인 placeholder action 2개(`1744:1787`, `1744:1789`)와 nested keyboard 내부 6개는 수정하지 않았다.
- `snapshot-bg-level-fix-before.json` 1742 nodes → `snapshot-bg-level-fix-after.json` 1742 nodes, added 0 / removed 0 / changed fill 11 / 선언 밖 변경 0으로 snapdiff를 통과했다.
- live 재스캔에서 화면 root level-0은 11개, 남은 level-1은 보호 대상 8개(저작 액션 2 + 컴포넌트 내부 6)로 정확히 일치했다.
- 11장 전체 문구·상태·field·raw·font·provenance·layout·overflow 위반은 모두 0이며, 배경 fingerprint 1↔2a1, 3↔2b1, 4↔4a1, 5↔5a1도 모두 동일하다.
- 대표 캡처 `screenshot-bg-level-fix-base.png`, `screenshot-bg-level-fix-overlay.png`에서 기본 화면과 dim overlay의 시각 회귀가 없음을 확인했다.

이 교정의 현재 판정은 **builder self-scan provisional**이다. 독립 component-verifier가 재검증하기 전에는 최종 PASS로 간주하지 않는다.

## Section 투명화 · Overlay NavBar stacking 교정 — 독립 재검증 대기

- Pattern Section `1744:1782`의 raw white fill 1개를 제거해 fill 없는 투명 Section으로 맞췄다. Section 이름·위치·크기·11개 화면 순서는 유지했다.
- `2b1`, `4a1`, `5a1`의 직접 자식 순서를 `기본 콘텐츠 → Dim → NavBar → Panel`로 교정했다. Panel 뒤 extension·option·close는 기존 순서를 유지했다.
- 생성 0·삭제 0이며 geometry·화면 fill·text·state·component properties 변경도 0이다.
- `snapshot-section-navbar-fix-before.json` 1742 nodes → `snapshot-section-navbar-fix-after.json` 1742 nodes, Section fill 1건 + 직접 자식 index 11건만 변경되고 선언 밖 변경 0으로 snapdiff를 통과했다.
- 라이브 stacking은 세 화면 모두 `Dim index 3 < NavBar index 4 < Panel index 5`로 일치한다.
- 화면 root level-0 11개와 보호 level-1 8개를 그대로 유지했다. 11장 전체 text·state·field·raw·font·provenance·layout·overflow 위반은 0이다.
- 기본↔overlay 콘텐츠 fingerprint는 3↔2b1, 4↔4a1, 5↔5a1 모두 child index를 제외하면 동일하다.
- `screenshot-section-navbar-fix-overview.png`와 overlay 3장 캡처에서 NavBar가 Dim보다 앞에 있고 Panel보다 뒤에 있음을 확인했다.

이 교정의 현재 판정은 **builder self-scan provisional**이다. 독립 component-verifier 재검증 전 최종 PASS를 선언하지 않는다.

## NavBar Web + Keyboard 패턴 반영 — 독립 검증 결과

- 독립 component-verifier가 신규 local 정본 set `2238:17407`, variant `2238:17258`을 live로 다시 측정했다.
- 기본 키보드 3장과 overlay 3장의 NavBar 6개는 모두 `x=0, y=439, 360×341`, local main `2238:17258`이다.
- 각 인스턴스의 내부는 `keyboard y=0 h=296` → `android-nav y=296 h=45` 두 자식뿐이다. 두 자식은 visible이며 `browser-toolbar`와 old nested y override는 0이다.
- overlay Dim `1858:18449`, `1996:11`, `1996:19310`은 모두 `x=0, y=0, 360×735`; `Dim index 3 < NavBar index 4 < Panel index 5`를 유지한다.
- 승인된 패널은 변경되지 않았다: 2b1 `y=402, 360×378` + extension, 4a1 `x=30, y=220, 300×293` + close, 5a1 `y=394, 360×302` + fifth option.
- base compact snapdiff는 16→16, changed 9(`main 3 + y 3 + h 3`), violations 0이다.
- overlay compact snapdiff는 41→41, changed 12(`main 3 + y 3 + h 6`), violations 0이다.
- live 전체 집계는 visible node 1639, TEXT 357, INSTANCE 119(local 78 + 허용 remote 41)다. 이전보다 줄어든 node 102와 TEXT 6은 6개 browser toolbar subtree 제거의 기대 결과다.
- required/forbidden text, raw paint, Pretendard/TextStyle, provenance, layout, overflow 위반은 0이다. base↔overlay 콘텐츠 fingerprint도 3쌍 모두 diff 0이다.
- 레거시 `2225:15556`, `2225:15638`, `2225:15711`과 최신 캡처를 재대조했다. legacy keyboard/phone-nav `y=440/732`, target canonical keyboard/android-nav `y=439/735` 차이는 정본 수렴이며 패널 문구·상태·순서는 기존 AD-6/AD-8 승인 범위로 유지됐다.

최종 판정은 **PASS**다. promoted registration은 계속 유효하다.

## NavBar Web + Keyboard 정본 교체 · 레거시 3화면 재대조 — 빌더 기록

- NavBar 정본 `Platform=Web + Keyboard`에서 인터넷 도구 모음을 제거하고 `keyboard 296 + android-nav 45 = 360×341` 구조로 확정했다. 키보드가 없는 기본 Web형의 도구 모음은 유지했다.
- 기본 키보드 화면 3장과 대응 오버레이 3장의 NavBar를 신규 local 정본 `2238:17258`로 교체하고 화면 하단 `x=0, y=439, 360×341`에 붙였다.
- `2b1`, `4a1`, `5a1`의 Dim 하단은 android-nav 시작선 `y=735`에 맞췄다. 기존 stacking `Dim < NavBar < Panel`은 유지했다.
- 레거시와 다시 비교했지만 승인된 패널 수렴값은 그대로 유지했다: `2b1` Bottom Sheet `y=402, 360×378`, `4a1` Modal `x=30, y=220, 300×293`, `5a1` Bottom Sheet `y=394, 360×302`와 다섯 번째 option sibling.
- 생성·삭제 0, 문구·패널·extension·option·modal·close·화면 순서 변경 0이다.
- base compact snapshot은 16→16, `mc 3 + y 3 + h 3`; overlay compact snapshot은 41→41, `mc 3 + y 3 + h 6`만 변경됐다. 두 snapdiff 모두 선언 밖 변경 0으로 통과했다.

이 빌더 기록은 위 독립 component-verifier 재검증에서 **PASS**로 확정됐다.
