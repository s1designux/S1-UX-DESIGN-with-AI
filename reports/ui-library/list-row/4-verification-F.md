# 4-verification (시나리오 F) — list-row

검증자: 🤖 component-verifier · 2026-10-02 · 작업 폴더 `.claude/worktrees/list-row-web`
범위: 전수(직전 9-21 선검증은 Density 폐기·Hover 제거·슬롯 교체 이전이라 승계하지 않음)

## 판정 (델타 재검증 2026-10-02 반영): HOLD 1 — C-1(동의 줄 화살표) river 결정 대기. FAIL 0.
> 최초 판정은 FAIL 2 · HOLD 3 이었다. F-1·F-2·C-2·C-3 해소 근거는 맨 아래 「델타 재검증 (2026-10-02)」.

## 최초 판정: FAIL 2 · HOLD 3

| # | 항목 | 결과 | 분류 |
|---|---|---|---|
| 0 | 기계검사 재실행(종료코드만) | ui:contract·ui:version·ui:build:check·ui:test:check·ui:icons·ui:icons:origin·components:anatomy 전부 exit 0 | ✅ |
| 1 | 정본 수치·토큰·구조 ↔ dist CSS·manifest geometry | 일치 (아래 표) | ✅ |
| 2 | 유형별 부품 구성 ↔ 정본 | 구성 일치. **단 Switch 의 토글 상태가 정본(On)과 다름** | ❌ F-1 |
| 3 | 21칸 + 슬롯 4줄 렌더 (PC·Mobile × Light·Dark) | 정렬·잘림·색 반전 이상 없음. 50줄 전부 높이 68, 중복 id 0 | ✅ (F-1 제외) |
| 4 | 키보드·포커스·ARIA | 이름 연결·비활성 전파 정상. Agree 화살표 의미·Pick/Agree 눌림 반응은 결정 필요 | ❓ C-1 · C-2 |
| 5 | 개별 모듈 vs 전체 묶음 | list-row·checkbox·toggle 영역은 픽셀·계산값 동일. **manifest 의존성대로 개별 설치하면 배포 예시의 라디오·텍스트버튼 줄이 깨짐** | ❌ F-2 |
| 6 | 검수 화면의 dist 소비 | dist(`tokens.css`·`typography.css`·`s1-ui.css`·`s1-ui.js`)만 사용, list-row 덮어쓰기 없음(페이지 CSS 는 표본 상자 폭 360 만) | ✅ |
| 7 | 검수 화면 그림 SVG currentColor | 검수 화면 쪽은 문제 없음. 오히려 배포 예시 쪽 HEX 가 걸림 | ❓ C-3 |
| 8 | anatomy "오른쪽 칸 슬롯 속성을 찾지 못했습니다" 경고 | 지금은 나지 않음. 모의 설치에서 List Row 세트가 슬롯 3개(그림·왼쪽 칸·오른쪽 칸)로 정상 생성 | ✅ (실제 Figma 설치는 미검증) |

## 1. 정본 대조 (build-components.ts:1261-1427 ↔ list-row.css / manifest.json)

| 항목 | 정본 | dist | 실측(렌더) |
|---|---|---|---|
| 좌우 여백 | spacing/20 | `--spacing-20` (css:25) | 20px |
| 위아래 여백 | spacing/12 | `--spacing-12` | 12px |
| 요소 간격 | itemSpacing spacing/12 | `gap: --spacing-12` | 12px |
| 글 자리 최소·세로 가운데 | minHeight sizing/44, primaryAxisAlign CENTER | `min-height --sizing-44`, `justify-content:center` (css:121-129) | 44px |
| 제목↔설명 | spacing/2 | `--spacing-2` | 2px |
| 제목 | title/16M (16·Medium·130%·-2%), text/title/primary | 16/500/1.3/-0.02em | 16px/500/20.8px/-0.32px |
| 설명 | body/14R, text/body/tertiary | 14/400 | 14px/400 |
| 값 | body/14R, text/body/primary | css:182-189 | 14px |
| 오른쪽 칸 내부 | spacing/8 | `--spacing-8` | 8px |
| 화살표 | 24, icon/gray → 비활성 icon/gray-light | css:197-208 | 24×24 |
| 그림 자리 | 40·radius/4·bg/level-2 | css:77-87 | 40×40 r4, 채우면 투명 |
| 눌림 배경 | bg/level-1 | css:52-58 | rgb(250,250,250) |
| 비활성 | 배경 level-0 유지, 글자 text/state/disabled | css:60,153-159,191 | 배경 흰색 유지, 글자 rgb(196,196,196) |
| 줄 높이 | 12+44+12 | — | 68 (50/50줄) |

부품 구성: Nav=글+화살표 · Value=글+값+화살표 · Read=글만 · Pick=체크+글 · Agree=체크+글+화살표 · Switch=글+토글 · Thumb=그림+글 — 정본 1301-1408 과 manifest typeStructure·검수 화면 마크업 모두 일치. 체크 기본은 정본 `Checkbox State=Default/Disabled`(미체크)와 일치.

## FAIL

### F-1 (a) Switch 줄의 토글이 정본과 반대 상태(꺼짐)로 나온다
- 정본: `build-components.ts:1360` `reuseVariant("Toggle", \`Toggle:On:${tgState}\`, ["Pressed=On", …])` — Switch 3칸 모두 **켜진 토글**.
- 검수 화면: `pages/ui-review.html:2526` `aria-checked="false"` 고정 → 21칸 중 Switch 3칸이 전부 꺼진 토글(회색 트랙, 비활성 칸은 꺼짐+비활성). 실측 aria-checked=false ×3, 트랙 rgb(196,196,196)/rgb(233,233,233). 선캡처 `screens/review-pc-light.png`·`review-pc-dark.png` Switch 행에서도 확인.
- 21칸 전수는 정본 셀을 그대로 비춰야 하는 자리라 정확 대조 대상이다. 배포 예시(`list-row.example.html:108`)도 꺼짐으로 되어 있다 — 예시는 사용 예라 꺼짐 자체가 오류는 아니지만, 검수 화면과 맞추려면 함께 보는 것이 좋다.
- 수정 방향(구현자 소관): 검수 화면 Switch 칸을 `aria-checked="true"`(비활성 칸은 켜짐+비활성)로.

### F-2 (a) manifest 의존성대로 개별 설치하면 배포 예시의 갈아끼운 줄 2개가 깨진다
- `dist/examples/list-row.html` 은 라디오(`:73-75`)·텍스트버튼(`:96-98`) 코어를 쓰지만 `manifest.json:140-149` dependencies 에는 checkbox·toggle 만 있다.
- 실측(같은 예시를 390 폭 빈 문서에 두 방식으로 로드, 전 요소 84개 계산값 비교): 차이 12건이 전부 이 두 줄. 개별 설치 쪽은 라디오가 브라우저 기본 13px 원(`appearance:auto`), 텍스트버튼이 회색 기본 버튼(rgb(239,239,239)·13.3px)으로 나온다. 전체 묶음 쪽은 정상(18px 원, 14px 텍스트버튼).
- list-row·checkbox·toggle 영역은 두 방식이 완전히 같다(나머지 72개 요소 동일, 12줄 전부 높이 68).
- 수정 방향: 예시 전용 의존성(radio·text-button)을 manifest 에 구분해 적거나, 예시 안에 "이 줄은 radio·text-button 배포본 필요" 를 명시.

## HOLD — river 확인 필요

### C-1 (c) 동의 줄의 화살표를 따로 누를 수 있어야 하나
- registry `list-row.json:122` slotMapNote: "동의 줄은 약관을 따로 볼 수 있어야 해서 화살표가 붙는다".
- 웹: 화살표가 `label` 안의 장식(`aria-hidden`)이라 화살표를 누르면 **약관 보기가 아니라 동의 체크가 켜진다**(manifest:98 "두 번째 클릭 영역이 필요하면 쓰는 화면이 별도로 구성"). 정본 의미와 웹 동작이 갈린다 — 화살표를 별도 누름 영역으로 둘지, 지금처럼 화면에 맡길지 결정 필요.

### C-2 (c) 선택·동의 줄은 손가락으로 누를 때 눌림 배경이 안 나온다
- 정본은 Pick·Agree 에도 Pressed 를 둔다. CSS 주석(`list-row.css:47-49`)은 "Nav·Value·Pick·Agree 는 각자 클릭 가능한 루트" 라고 쓰는데 실제 선택자(`:52`)는 nav·value 의 `:active` 만 잡는다. 검수 화면은 `data-state="pressed"` 강제 표본이라 차이가 안 보인다.
- 선택·동의 줄(label)에도 실제 눌림 반응을 줄지, 지금처럼 버튼 줄만 줄지 결정 필요(주석과 코드 중 한쪽은 고쳐야 한다).

### C-3 (c) 배포 예시의 그림에 HEX 색이 들어 있다
- `list-row.example.html:128-130` `#8FA8FF`·`#FFFFFF` 가 dist 예시로 배포된다. 검수 화면은 같은 그림을 currentColor+투명도로 바꿔 넣었다(`ui-review.html:2549-2553`) — 검수 화면 쪽은 슬롯 내용(소비자 그림)일 뿐이고 부품 계약을 바꾸지 않아 **문제 없음**.
- 다만 예시는 그대로 복사되는 자료라, 그림 표본에 HEX 를 허용할지(사진 대용이라 예외) 검수 화면처럼 바꿀지 결정 필요. 두 곳의 그림 모양이 다른 것도 같은 결정으로 정리된다.

## 그 밖의 관찰 (판정 영향 없음)
- 접근성: 선택·동의 체크와 토글의 이름은 aria-labelledby 로 제목을 정확히 가리킴(빠른 배송·이용약관 동의·알림). 비활성 줄은 안의 체크·토글도 `disabled`(초점 순서에서 빠짐, registry a11y 충족). 50줄 중복 id 0.
- `button`/`label` 안에 `div`(text·checkbox 래퍼)를 두는 마크업은 HTML 내용 규칙상 엄밀히는 허용되지 않지만 브라우저 동작·접근성 트리에 영향 없음. 선례 bottom-sheet-option 은 div 루트라 직접 선례는 아님 — 참고만.
- 비활성 읽기·그림·토글 줄의 `aria-disabled`(div 루트)는 보조기기에 의미가 약하다. 실제 비활성은 안의 토글 `disabled` 가 맡으므로 문제는 아님.
- 상태 파일(`workflow-state.json`)은 9-21 지문·`3-build`·`draft` 그대로다. ui:state 의 "지문 바뀜" 3건은 다른 작업의 정본 변경이며 list-row 의 정본 지문은 ui:version 이 일치로 판정 — list-row 에 영향 없음.

## 검증하지 못한 범위
- 실제 Figma 에 설치해 List Row 세트를 만드는 것(슬롯 3개 생성)은 모의 설치로만 확인. 실 Figma 캔버스 미검증.
- Mobile 390 폭은 선캡처 이미지와 호출자 실측(가로 넘침 0)을 따랐고, 직접 폭 재측정은 하지 않음(브라우저 창이 숨겨져 폭 계산이 무의미했음). 높이·색·간격 실측은 직접 함.
- 실기기 터치 :active 반응은 미확인(C-2 결정 후 필요).

## 권장 상태
- workflowStatus: `rework` · uiLibraryStatus: `candidate` 유지 · nextAction: F-1·F-2 수정(ui-library-builder / 검수 화면 담당) + C-1~C-3 river 결정 → 변경분만 델타 재검증.

---

## 델타 재검증 (2026-10-02)

입력: 오케스트레이터 변경 목록(list-row.css·example·manifest, pages/ui-review.html listRowMarkup, dist 재생성, 0.16.2→0.16.3) + 재캡처 `screens/review-{pc,mobile}-{light,dark}.png`.
기계검사 재실행(종료코드만): ui:contract·ui:version·ui:build:check·ui:test:check·ui:icons·ui:zip:check 전부 exit 0.
소스 변경 확인: `git diff -- ui-library/src/components/list-row/` — css 1줄(:active 선택자), example(라디오·약관보기 줄 삭제, 토글 true, SVG currentColor), manifest 2줄(states.pressed·coreComponentsNote). 정본(build-components.ts)·다른 CSS 규칙 무변경.

| 항목 | 결과 | 근거(실측) |
|---|---|---|
| F-1 토글 켜짐 | ✅ 해소 | 검수 화면 Switch 6칸 aria-checked=true(Light 트랙 rgb(29,108,235)·비활성 rgb(233,233,233) / Dark rgb(48,112,216)·비활성 rgb(46,47,56)), 비활성 칸은 disabled. 예시도 true. 재캡처 PC Dark 에서 켜진 토글 확인 |
| F-2 개별 vs 전체 | ✅ 해소 | 새 dist example 을 390 폭 빈 문서에 개별(checkbox·toggle·list-row css)·전체(s1-ui.css) 두 방식 로드 → 요소 67개 계산값·위치 차이 **0건**. 예시에 쓰인 부품 = list-row·checkbox·toggle 뿐(manifest 의존성과 일치). 10줄 전부 68 |
| C-2 선택·동의 눌림 | ✅ 해소 | 헤드리스 Chrome 실제 마우스 누름(CDP mousePressed) 중 배경: nav·value·pick·agree Default = rgb(250,250,250)(level-1) / nav·pick·agree Disabled = rgb(255,255,255) 그대로 / read·switch·thumb = 변화 없음. 떼면 원래대로. 누른 pick·agree 기본 줄은 체크 켜짐, 비활성 줄은 체크 안 켜짐 |
| C-3 예시 HEX | ✅ 해소 | 예시 본문(주석 제외)에 HEX 0건, SVG 채움 currentColor |
| C-1 동의 화살표 | ❓ 유지 | 미변경(river 결정 대기). 화살표를 눌러도 동의 체크가 켜지는 동작 그대로 |
| 부수 피해 | ✅ 없음 | 검수 화면 50줄 높이 전부 68, 중복 id 0. 검수 화면 갈아끼운 보기 4줄은 전체 묶음 소비라 정상(재캡처 확인) |

이번에 재확인하지 않음(직전 확인 승계, 근거: 정본·해당 CSS 규칙 무변경): §1 정본 수치·토큰 대조 표, 접근성 이름 연결, 6번 anatomy 경고 항목.
남은 미검증: 실 Figma 설치, 실기기 터치(헤드리스 마우스 누름으로 갈음), Mobile 폭 재측정(재캡처 이미지에 의존).

권장 상태: workflowStatus `awaiting-decision`(C-1) · uiLibraryStatus `candidate` · nextAction: river 가 C-1 결정 → 바뀌면 그 부분만 델타 재검증, 그대로 두기로 하면 river UX 승인 단계로.
