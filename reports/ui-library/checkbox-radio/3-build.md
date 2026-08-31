# 3-build — 원본·배포·검수 소비자 구현

작성 2026-08-31 · 구현 ⭐ 오케스트레이터

## 새로 만든 원본

| 파일 | 내용 |
|---|---|
| `ui-library/src/components/checkbox/checkbox.css` | 18px 상자 · radius `--radius-control-xs` · 정본 5상태 · 라벨(선택) |
| `ui-library/src/components/checkbox/checkbox.example.html` | native `input[type=checkbox]` + `label[for]` |
| `ui-library/src/components/checkbox/checkbox.js` | 런타임 없음(`jsRequired=false`) |
| `ui-library/src/components/checkbox/manifest.json` | 공개 API · 정본 상태 매핑 · `notInCanon` · 접근성 계약 |
| `ui-library/src/components/radio/*` | 위와 동일 구성. 원 18px · 점 10px · 그룹 규칙 |
| `ui-library/src/assets/icons/check.svg` | 정본 `makeCheckIcon` SVG 를 frame 16 / glyph (0,0,16,16) 구조로 포장 |

## 구현 방식에서 정한 것

- **native 요소가 곧 상자다.** `appearance: none` 을 준 `input` 자체에 정본 상자/원의 크기·테두리·반경을 입히고, 체크 표시와 점은 그 `::before` 로 그린다. 가짜 상자 `span` 을 만들지 않아 역할·상태·키보드가 전부 브라우저 것이다.
- **체크 표시 색은 `currentColor`.** 상태별 `color` 를 정본 indicator 토큰으로 바꾸면 아이콘 색이 따라간다(Input 의 remove 아이콘과 같은 mask 방식).
- **Hover 는 선택 안 된 상태에만.** 정본에 Checked+Hover 변형이 없으므로 `:hover:not(:disabled):not(:checked)` 로 제한해 선택 색을 덮지 않게 했다.
- **라디오 Selected 는 배경을 바꾸지 않는다.** 정본 `buildRadio` 의 Selected 가 `color/control/bg/default` 를 유지하기 때문이다(체크박스와 다른 점).
- 라벨 타이포는 정본 `makeBoundText(14, "Medium")` = 텍스트 스타일 `body/14M`(14px · 행간 130% · 자간 -2%) → `--font-size-14` · `--font-weight-medium` · `--line-height-130` · `--letter-spacing-tight`.

## 생성 경로 배선

- `ui-library/scripts/build.mjs` · `test.mjs` 의 `componentIds` 에 `checkbox`·`radio` 추가 → 전체 묶음(`s1-ui.css`/`s1-ui.js`)과 개별 모듈이 **같은 source 에서** 생성된다.
- `ui-library/package.json` exports 에 개별 설치 경로 6개 추가.
- 아이콘 manifest 에 `check` 등록(허용목록 키 대조 + 자산 지문 + frame/glyph 기하 + 실측 근거).
- `ui-library/src/verification/empty-consumer*.html` 에 라벨 있음/없음 체크박스와 라디오 그룹을 추가 — 빈 HTML 소비와 전체/개별 설치 동일성이 새 컴포넌트까지 검사된다.

## 검수 소비자

`pages/ui-review.html` 에 `3. Checkbox` · `4. Radio` 섹션 추가. 실제 `ui-library/dist` 만 사용하며, 검수 페이지 CSS 는 배치용 `.review-control-group` 하나만 추가하고 코어 시각을 재정의하지 않는다.

## 함께 해소한 기존 실패 (river 승인)

`assets/js/ui-library-guide.js` 가 검사기(`test.mjs`)의 요구와 어긋나 `ui:test` 가 실패해 있었다(검사기만 강화되고 화면은 안 고쳐진 상태). 검사기가 말하는 대로 **실제 동작·상태 영역을 설명 문서보다 앞에** 두고 `preview-area` 표준 미리보기 면을 적용했다.

## 금지사항 준수

사이트 인라인 코드 복사 없음 · `dist` 손편집 없음 · 패턴 안 임시 코어 없음 · 구현자 자가 PASS 없음(아래 4단계에서 별도 판정).
