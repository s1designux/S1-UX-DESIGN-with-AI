# 3-build — footer · ci · login-gnb

작성자: 🧱 ui-library-builder · 2026-10-02 · 근거: river "응 맞아, 진행해"(2026-10-02)

## 무엇을 만들었나

`ui-library/src/components/{footer,ci,login-gnb}/` 각각 css · js(런타임 없음, jsRequired=false) · example.html · manifest.json.

- **footer** — `data-platform=pc|mobile`. PC: 가로·양끝·가운데, 위 1px 선(겹침 레이어), 상하 spacing/28, body/10R, 링크 3개(진짜 `<a>`, 구분선 1×8 icon/gray-light)·회사 정보(`white-space: pre-wrap` 으로 연속 공백 보존)·카피라이트, 오른쪽 S1 로고 42×16(icon/gray). Mobile: 세로·왼쪽 정렬·배경/테두리 없음·패딩 8/16·gap 4·링크 gap 8·body/12R·구분선 1×10 line/default·카피라이트 가운데, 회사 정보·로고 없음. hover 없음.
- **login-gnb** — 높이 sizing/56, 상하 12, 배경 navigation/bg, 하단 1px 선, 왼쪽 `[서비스명]` title/16B, 오른쪽 지구본 24(globe, icon/gray-dark) + "한국어" body/14M icon/gray-dark, gap 8. 언어 조작은 GNB 와 같은 `<button type="button">`. GNB 의 32/색/간격 값을 가져오지 않았다(검사기가 sizing-32 유입을 막는다).
- **ci** — `data-brand=s1|samsung` × `data-color=white|blue|dark`. S1: 인라인 SVG(정본 path 그대로, viewBox 0 0 42 16) 78.75×30, fill currentColor, white=icon/white · blue=Foundation brand/ci(정본이 직접 묶음 — manifest·registry 에 예외 명시) · dark=icon/gray. Samsung: 134×36, CSS 배경이미지 `cover`(scaleMode FILL), 색별 PNG. 접근 이름 = `role="img"` + `aria-label`(에스원/삼성), svg 는 aria-hidden.

## 파이프라인 확장 (이미지 지원)

기존 빌드는 아이콘 manifest 에 등재된 파일만 dist 로 복사했다(T9). 최소 확장:
- `ui-library/src/assets/images/manifest.json`(신규, sha256·원본 imageHash 기록) + PNG 3개 → 빌드가 지문을 대조하고 `dist/assets/images/` 로 복사, `dist/manifest.json` 에 `images` 필드 추가.
- 묶음 CSS 의 url 치환을 `../assets/icons/` → `../assets/` 로 일반화(build.mjs, test.mjs 동일 수정).
- `--check` 비교가 PNG 를 글자로 읽어 항상 stale 로 나오던 점을 바이트 비교로 수정.

## 배선 (배선표 §1)

component-ids.mjs · test.mjs componentIds(+ 3종 전용 검사: hover 금지, 정본 수치, 문구 verbatim=footer.json, S1 path = 정본 일치, 삼성 로고 미유입 등) · package.json exports 9줄 · empty-consumer(.html / -individual.html, DOM 동일) · registry components 3개 + registry/index.json + components/index.json · component-fingerprint-map(CI·LoginGNB·Footer 를 unownedSets → 부품으로 이동) · presentation-policy(managedBy ui-library-guide 3건) · ui-library-migration 레코드 3건(candidate) · update-management 3건 · component-page-coverage(세 부품 noSectionNeeded 제거 → sectionFor, river 2026-10-02 지시 기록).
재생성(손편집 아님): `design:md:write` · `components:guide-model:write` · `ui:zip` · `devpanel:gen` · `ui:bump:minor`(0.18.3 → 0.19.0, 35/35 일치).
Gate 14 문구 검사기: appearsIn 추가 불필요(기존 통과).

## 결정 (정본이 말하지 않는 부분 — 선례를 따른 것, 확인 필요 시 needs-decision)

1. **폭 처리**: 정본은 1920 고정·좌우 패딩 320. 웹은 GNB 선례(full-width 반응형)대로 `padding-inline: clamp(spacing/24, (100% - 1280px)/2, 320px)` — 1920 에서 정본 그대로 320, 좁으면 안쪽 폭 1280 유지 후 최소 24. 최소값 24 는 GNB 좌측 패딩 선례에서 가져온 값이다.
2. **초점 표시**: 정본에 focus 변형이 없고 라이브러리는 브라우저 기본(2026-09-02 river 결정)이라 별도 링 없음.
3. **Footer 로고 aria-hidden**: 옆 글자에 회사 이름이 있어 장식 처리(registry 에 정의). 다르게 원하면 알려 달라.
4. **하단/상단 선**: 정본이 INSIDE 선이라 GNB 처럼 겹침 레이어(::before/::after)로 그려 내용 높이를 깎지 않음.
5. **Footer PC 높이**: 정본 고정 116 → 웹 `min-height: 116px`(줄바꿈 시 늘어남).
6. **삼성 이미지 방식**: `<img>` 가 아니라 CSS 배경(`cover`) — color 축으로 이미지가 자동 선택되고 소비자가 경로를 몰라도 됨. (instruction 의 object-fit 과 같은 효과.)
7. 정본 상수 literal px: 78.75px, 134px, 36px, 42px, 116px, 1280px, 320px — 해당 크기 토큰이 없다(sizing-36 등 없음).

## needs-decision / 열린 항목

- **Gate 34**: `uistate:ci.default` · `uistate:footer.default` · `uistate:login-gnb.default` 승인 없음 — river 승인 기록(`canon-addition-check.js --approve --by river --quote`)은 자기신고라 내가 하지 않음. 오케스트레이터가 기록해야 한다.
- **Gate 19**: 안내 페이지 섹션에 `data-cov-brand` · `data-cov-color`(ci) · `data-cov-platform`(footer) 미선언 — guide-builder 몫(pages/components.html 은 손대지 않음).
- 안내 페이지·`ui-guide.js componentConfig`·`ui-review.html` 은 미착수(지시대로).
- 삼성 PNG 는 1600×425 원본 그대로 배포(각 ~30KB). 134×36 용으로는 크지만 정본 이미지를 그대로 쓴다는 원칙 유지 — 축소 여부는 river/오케스트레이터 판단.

## 실행 명령과 결과

| 명령 | 종료코드 |
|---|---|
| ui:contract | 0 (PASS candidate) |
| ui:icons | 0 (기존 부채 경고 2건) |
| ui:icons:origin | 0 |
| ui:build | 0 (328 files) |
| ui:build:check / ui:test (check) | 0 / 0 |
| ui:test | 0 |
| ui:version | 0 (0.19.0, 35/35) |
| gate:check | 1 — 남은 error 6건: Gate 34 ×3(승인 기록), Gate 19 ×3(안내 페이지 data-cov). 그 외 전부 통과 |

렌더: http 헤드리스 캡처(1920 라이트, 800 다크)로 login-gnb · footer PC/Mobile · ci 6칸 확인 — 구분선·로고·삼성 이미지 3종·다크 토큰 전환 정상. 임시 페이지는 삭제함. 검증(독립)은 미실시 — 구현자 자가 확인뿐.

## rework 1 (2026-10-02, 독립 검증 F-1·F-2)

- **F-1** footer.css · login-gnb.css 루트에 `font-family: "Pretendard Variable", "Pretendard", sans-serif` 추가(button·input 과 같은 방식). lang 버튼은 `font: inherit` 라 따라간다. 다른 부품은 손대지 않음.
- **F-2** footer Mobile 루트를 `display: grid; grid-template-columns: max-content; justify-content: start` 로 바꿔 내용 폭(링크 줄)을 한 칸으로 잡고, 카피라이트는 `justify-self: stretch` + 가운데 → 링크 줄 아래에서 가운데. 폭 100%·패딩·gap 등 다른 수치는 그대로. padding clamp 는 river 결정 대기라 유지.
- empty-consumer 쌍(`ui-library/src/verification/empty-consumer.html`, `-individual.html`)에 Footer PC + CI 6종 전부 추가(두 파일 DOM 동일).
- 변경 파일: footer.css · login-gnb.css · 위 empty-consumer 2개 · 재생성물(dist, zip, devpanel, DESIGN.core.md, guide-model) · 배포본 0.19.0 → 0.19.1(`ui:bump`).

| 명령 | 종료코드 |
|---|---|
| ui:build | 0 |
| ui:contract | 0 |
| ui:test / ui:test:check | 0 / 0 |
| ui:build:check | 0 |
| ui:version | 0 (bump 후; bump 전 1) |
| ui:guide:render | 0 |
| gate:check | 0 |

## rework 2 (2026-10-12, river D-2 · D-3)

- **D-2 (C-1)** — river "가운데 1280폭을 지키고 그 이후로는 대응 안함." footer(PC)·login-gnb: `padding-inline: clamp(0px, calc((100% - var(--breakpoint-xl)) / 2), 320px)` + `min-width: var(--breakpoint-xl)`(canon breakpoint/xl 1280, tokens.css 에 `--breakpoint-xl` 존재해 변수 사용). 옛 최소 24 clamp 제거. 1280 아래로는 줄지 않고 넘치면 가로로 민다.
- **D-3 (C-2)** — river "브레이크포인트에 따라 모바일 모양으로 바뀜". footer.css 맨 아래 `@media (max-width: 767.98px)`(= --breakpoint-md 768, 조건식엔 변수 불가 → 주석) 에서 PC 풋터가 Mobile 값 그대로: 세로 grid·패딩 8/16·gap 4·링크 gap 8·body/12R·구분선 1×10 line/default·카피라이트 링크 줄 아래 가운데·배경/위 선/회사 정보/로고 없음. 명시 `data-platform="mobile"` 은 그대로. login-gnb 는 D-2 만.
- 변경 파일: footer.css · login-gnb.css · footer/login-gnb manifest.json(폭 설명, river 인용) · footer.example.html(주석) · registry/components/footer.json · login-gnb.json(geometry·provenance 문구) · pages/ui-review.html 28·27번 설명 문구와 표본 라벨(레이아웃 CSS 무변경) · 재생성물(dist, zip, devpanel, DESIGN.core.md, guide-model) · `ui:bump` 0.19.1 → 0.19.2. empty-consumer 쌍은 마크업 불변.
- 측정(http 헤드리스, `screens/rework2-{1920,1600,1280,1000,700}.png` — 임시 측정 페이지는 삭제): 1920 → 좌우 320/320 · 1600 → 160/160 · 1000 → 0/0, 바 폭 1280(scrollWidth 1280, 가로 넘침) · 1280 → 0(1000 과 같은 식) · footer PC 700 → display grid, 패딩 16, 배경 없음, 로고·회사 정보 none, 링크 12px, 카피라이트 링크 줄 아래 가운데. login-gnb 700 → 1280 유지.
- 실행: ui:contract 0 · ui:icons 0 · ui:build:check 0 · ui:test 0 · ui:test:check 0 · ui:version 0 · ui:guide:render 0 · ui:liveness 0 · gate:check 0. 독립 검증은 미실시(구현자 확인).
