# 4-verification — 기술 검증 (⭐ orchestrator)

작업: `select-dropdown-filter-chip` · 2026-09-01
검증 대상: 실제 `ui-library/dist` 배포본 (손편집 없음)

## 요약
| 항목 | 결과 |
|---|---|
| 자동 검사 4종 | ✅ PASS (`ui:contract`·`ui:icons`·`ui:build`·`ui:test`) |
| 실제 렌더 전수 대조 (Light·Dark) | ✅ PASS — **결함 1건 발견·수정** |
| 동작·접근성 (브라우저 실행) | ✅ PASS 26건 / FAIL 0건 |
| `gate:check` | ❌ 6 error — **전부 Gate 6c 설치기 zip 날짜(선재·이번 작업 무관)** |
| 독립 검증 (component-verifier) | 진행 — river 결정으로 필수 (D3), 계약 위험 조건에도 해당 |

## 발견하고 고친 것

### ① 드롭다운 「전체 선택」 동작이 없었다 → 재작업 반영
`dropdown.js` 가 전체 선택 행을 평범한 체크박스 한 줄로만 취급했다. `component-behavior.pc.json` 의 `Dropdown (Checkbox)` 계약(전체 켜기/끄기, 모두 켜지면 자동 켜짐)이 깨진 상태였다.
→ 🧱 builder 재작업. `data-select-all="true"` 식별자 + `syncSelectAll()` 구현. `aria-checked` 는 true/false 만(mixed 미구현, river 결정 D2).

### ② Esc 로 닫기가 실제로는 안 먹었다 → 재작업 반영
`filter-chip.js` 의 Esc 처리가 **트리거에만** 걸려 있었는데, 여는 순간 포커스가 패널 안으로 이동하므로 항상 무효였다. `select.js` 에는 Esc 자체가 없어 열면 Tab 외에는 빠져나올 방법이 없었다.
→ 두 모듈 모두 리스너를 `root` 로 올리고 닫을 때 트리거로 포커스 복귀.

### ③ chevron 화살표 방향이 뒤집혀 있었다 → ⭐ 직접 수정
정본 SVG(`M4 6L8 10L12 6`)는 **아래(∨)** 인데 CSS 기본값이 `rotate(180deg)`, 열림이 `rotate(0deg)` 라 **닫힘 ∧ · 열림 ∨** 로 정확히 반대였다. 정본은 닫힘 아래·열림 위(`build-components.ts:1481` `st.up ? 90 : 270`).
→ `select.css`·`filter-chip.css` 기본 `rotate(0deg)` · 열림 `rotate(180deg)` 로 교정 후 재빌드·재촬영해 확인.
갈래 판정: 「원본을 베껴야 하는 것」이므로 **(a) 코드 실수**.

### ④ 안내·검수 화면 마크업에 전체선택 표식이 없었다 → ⭐ 직접 수정
배포본은 `data-select-all` 로 전체 선택 행을 식별하는데, 화면 쪽 마크업 생성기 **두 벌**(`assets/js/ui-library-guide.js`, `pages/ui-review.html`)이 그 속성을 내보내지 않아 검수 화면에서 동작이 죽어 있었다. 양쪽 모두 배포본 계약과 일치시켰다.

### ⑤ 행동 장부가 삭제된 옛 코드를 근거로 보고 있었다 → ⭐ 배선 수정
`component-behavior-check.js` 는 근거를 `pages/components.html` 에서만 찾는다. 손관리 마크업을 배포본으로 교체하면서 그 근거가 사라져 Gate 24 가 실패했다.
→ 컴포넌트별 `source.sourceFile` 로 실제 원본(`ui-library/src/components/{id}/{id}.js`)을 가리키게 하고 검사기가 그 파일을 읽도록 배선했다. **검사 강도는 그대로**(근거 문자열은 여전히 실제 코드에 존재해야 함).
> ⚠️ 이때 드러난 별건: 이미 배포본으로 옮긴 **Toggle·Chip·Checkbox 의 장부는 여전히 옛 인라인 JS 를 근거로 삼고 있고, 그 죽은 코드가 `components.html` 에 남아 있어 검사가 통과하고 있다.** 이번 범위 밖이라 손대지 않았고 미결로 올린다.

## 정본에 없어서 만들지 않은 것 (그대로 유지)
- Filter Chip `Complete` 전용 스타일 — 정본 `chipSlot()` 에서 Complete 는 **Default 와 같은 토큰**이고 값 글자만 "과거순"으로 다르다. CSS 규칙이 없는 것이 정본 그대로다.
- Select 의 Focus 별도 축(Open 이 겸함) · Error 축 · 다중선택
- Dropdown 패널 자체의 state 축 · 옵션 행 disabled
- 「전체 선택」 부분선택(mixed) 표시

## 동작·접근성 검증 (브라우저 실제 실행 · `pages/ui-review.html`)
| # | 검사 | 결과 |
|---|---|---|
| 1 | 컴포넌트 마운트 (select 44 · dropdown 190 · filter-chip 124) | ✅ |
| 2 | 중복 id 0개 | ✅ |
| 3 | Select 열림 `aria-expanded=true` · 패널 표시 | ✅ |
| 4 | Select 열면 포커스가 목록으로 | ✅ |
| 5 | Select 목록 ↓ 이동 | ✅ |
| 6 | Select Enter 선택 → 값 반영 · `data-filled=true` · 닫힘 | ✅ |
| 7 | Select 닫으면 트리거로 포커스 복귀 | ✅ |
| 8 | Select Esc 닫기(포커스가 목록 안일 때) | ✅ |
| 9 | Select 바깥 클릭 닫기 | ✅ |
| 10 | Select Disabled 무반응 | ✅ |
| 11 | FilterChip 열림 = Selected(`aria-expanded`) | ✅ |
| 12 | FilterChip 열면 포커스가 목록으로 | ✅ |
| 13 | FilterChip Esc 닫기(포커스가 목록 안일 때) | ✅ |
| 14 | FilterChip 값 선택 → `data-complete=true` · 닫힘 | ✅ |
| 15 | FilterChip 접근 이름 제목+값 결합 ("정렬, 서울") | ✅ |
| 16 | FilterChip Disabled 무반응 | ✅ |
| 17 | 전체선택 → 전부 켜짐 (3/3) | ✅ |
| 18 | 전체선택 다시 → 전부 꺼짐 (0/3) | ✅ |
| 19 | 개별로 다 켜면 전체선택 자동 켜짐 | ✅ |
| 20 | 하나 끄면 전체선택 꺼짐 | ✅ |
| 21 | 코어 체크박스 `input.checked` 와 `aria-checked` 동기화 | ✅ |
| 22 | `aria-checked="mixed"` 0개 | ✅ |
| 23 | 다른 인스턴스에 간섭 없음 | ✅ |
| 24 | End 키 → 마지막 옵션 | ✅ |
| 25 | Home 키 → 첫 옵션 | ✅ |
| 26 | 콘솔 오류 0건 (승인 전 안내 3건은 계약대로) | ✅ |

## 실제 렌더 (전수 · 실제 dist 소비)
검증 화면: `matrix-fixture.html` (`?only=` · `?theme=` 로 구간 분할, 실제 `dist/s1-ui.css` 소비)

| 스크린샷 | 확인 내용 |
|---|---|
| `screens/state-matrix-light-dark.png` | Select 20칸 + Dropdown + Filter Chip 전수 (Light·Dark) |
| `screens/state-matrix-top.png` | Select 20칸 상세 — 화살표 방향 교정 확인 |
| `screens/dropdown-light.png` · `dropdown-dark.png` | 패널 6조합 + 옵션 행 상태 3종 × 크기 3 |
| `screens/filter-chip-light.png` · `filter-chip-dark.png` | variant 2 × 제목 2 × 상태 5 × 크기 3 |
| `screens/select-dark.png` | Select 다크 |

육안 대조 결과: 크기(28/34/44/48 · 28/34/30)·radius·테두리·Line/Solid 색 배분·Selected 파란 테두리·Complete=Default 색+"과거순"·전체선택 구분선·다크 토큰 전환 모두 정본과 일치.

## 검증 함정 (§2) 대응 기록
- `file://` 로 캡처하면 **마스크 아이콘이 안 보이고** 모듈이 로드되지 않는다 → http 서버 주소로 촬영해 해결. "아이콘이 없다"를 구현 오류로 단정하지 않았다.
- 브라우저 패널이 숨겨져 있거나 문서가 매우 길면 스크린샷이 빈 화면으로 나온다 → 별도 검증 화면으로 분할 촬영.
- `pages/components.html` 이 3종에 대해 "approved 가 아닙니다" 안내를 띄우는 것은 **계약대로**다(공개 가이드는 approved 만 표시). river 검수는 `pages/ui-review.html` 검수본 07 에서 한다.

## 미확인 · ⭐ 자가인증 표시
- **독립 검증 미완**: 이 문서는 ⭐ 자가 검증분이다. `component-verifier` 시나리오 F 결과가 나와야 4단계 통과다.
- Figma V3.0 원본과의 시각 대조는 하지 않았다(시각 정본은 `build-components.ts` — 계약상 선택 사항).
- 모바일 실기기 검증은 하지 않았다(브레이크포인트 속성 기준 렌더만 확인).
