# 3-build — Textarea · Multi Toggle

- 작업: textarea-multi-toggle
- 담당: 🧱 ui-library-builder
- 날짜: 2026-09-02
- 정본: `plugins/figma-vars-installer/src/build-components.ts`(buildTextarea:1388, buildMultiToggleElement:5376, buildMultiToggle:5513) · `vars-data.ts` · `registry/components/textarea.json` · `registry/components/multi-toggle.json`
- 입력: `1-inventory.md` · `2-canon-readiness.md`(공개 계약 확정본, 그대로 구현) · `wiring-and-traps.md` §1 배선표

## 1. 만든 파일

### Textarea — `ui-library/src/components/textarea/`
| 파일 | 내용 |
|---|---|
| `textarea.css` | root 100% 폭, `control`(네이티브 textarea) 1개 부품. state: default/focus(`:focus-within`)/filled(강제 시각 없음)/disabled/readonly |
| `textarea.js` | `jsRequired:false`, `runtime:null` — 파일만 존재(배선 규칙) |
| `textarea.example.html` | PC 예시 (`data-break="pc"`) |
| `textarea.mobile.example.html` | Mobile 예시 (`data-break="mobile"`, 값·크기 동일 — 정본에 size/break 축이 없어 예시 구분용) |
| `manifest.json` | `canonicalFingerprint` = `599c1ef0…` (아래 §4 명령으로 계산) |

### Multi Toggle — `ui-library/src/components/multi-toggle/`
| 파일 | 내용 |
|---|---|
| `multi-toggle.css` | root `role=radiogroup`, `cell` 부품(`role=radio`). size md/sm. 위치 규칙(모서리·인접 보더)은 `:first-child`/`:last-child` + `[aria-checked=true]` 인접 선택자로 구현 |
| `multi-toggle.js` | `jsRequired:true` — roving tabindex, 좌우/상하 화살표 이동, Home/End, Space/Enter 선택, disabled 칸 제외, `s1:multi-toggle:change` 이벤트 |
| `multi-toggle.example.html` | 3칸 PC 예시(정본과 동일 구성) — mobile 예시 없음(PC 전용 컴포넌트, 정본 md/sm만) |
| `manifest.json` | `canonicalFingerprint` = `dc5a9787…` |

## 2. 상태 ↔ 토큰 매핑

### Textarea (`color/form-control/*`, Input 과 공유)
| 상태 | 배경 | 테두리 | 글자 |
|---|---|---|---|
| default | `--color-form-control-bg-default` | `--color-form-control-border-default` | `--color-form-control-text-default` / placeholder |
| focus(`:focus-within`) | `--color-form-control-bg-selected` | `--color-form-control-border-selected` | `--color-form-control-text-selected` |
| filled | (강제 시각 없음 — default 와 동일, 값 존재는 네이티브로만 판단) | | |
| disabled | `--color-form-control-bg-disabled` | `--color-form-control-border-disabled` | `--color-form-control-text-disabled` |
| readonly | `--color-form-control-bg-disabled` | `--color-form-control-border-default` | `--color-form-control-text-read-only` |

geometry: `min-height:var(--sizing-80)` · padding `var(--spacing-12) var(--spacing-12) var(--spacing-10) var(--spacing-10)` · `border-radius:var(--radius-control-sm)`(=radius-4) · `border:var(--border-width-1)` · `font-size:var(--font-size-14)` · `resize:vertical`(D2).

### Multi Toggle (`color/button/*`, 셀 자체 토큰 없음)
| 상태 | 배경 | 테두리 | 글자 |
|---|---|---|---|
| default | `--color-button-bg-secondary--default` | `--color-button-border-secondary--default` | `--color-button-label-secondary--default` |
| hover | `--color-button-bg-secondary--hover` | `--color-button-border-secondary--hover` | `--color-button-label-secondary--hover` |
| selected(`aria-checked=true`) | `--color-button-bg-primary--default` | `--color-button-border-primary--default` | `--color-button-label-primary--default` |
| disabled(`aria-disabled=true`) | `--color-button-bg-disabled` | `--color-button-border-disabled` | `--color-button-label-disabled` |

geometry: md `height:var(--sizing-44)` `padding-inline:var(--spacing-12)` `min-width:var(--sizing-64)` / sm `height:var(--sizing-34)` `padding-inline:var(--spacing-8)` `min-width:var(--sizing-56)` · 글자 `var(--font-size-14)` · 모서리 `var(--radius-control-sm)`(양끝 칸만) · `--color-control-*` 미사용 확인(검사기로 강제).

포커스 표시(두 컴포넌트 공통 원칙 — 정본에 없는 키보드 전용 표시, 새 토큰 미신설): Textarea는 자기 도메인의 `--color-form-control-border-selected`, Multi Toggle은 자기 도메인의 `--color-button-border-primary--default`를 그대로 재사용(Chip 선례와 동일 패턴).

## 3. `notInCanon` (정본에 없어 만들지 않음)

| 컴포넌트 | 항목 | 사유 |
|---|---|---|
| Textarea | 라벨 부품 | `buildTextarea` 가 그리지 않음 — 접근 이름은 외부 label/aria-label |
| Textarea | 안내문구(helper) | D1 — 이번 범위 밖, needs-core-update로 별도 적재됨(registry notes) |
| Textarea | 글자수 카운터 | 정본에 없음 |
| Textarea | 크기 축(sm/md/lg) | 정본은 State 축만 |
| Textarea | hover | registry stateNotes "삭제(HD-2)·Figma 미정의" |
| Textarea | 최소폭 240 | 정본 프레임 폭 240 에 대응하는 `--sizing-240` 류 토큰이 없어 **넣지 않음**(임의 px 금지 원칙) — `needs-decision`으로 아래 §5 기록 |
| Multi Toggle | focus 변형 | 정본 state 목록에 없음 — 기존 selected 테두리 토큰만 재사용 |
| Multi Toggle | 모바일 전용 크기 | 정본은 md/sm 뿐 — PC 전용 유지 |
| Multi Toggle | 자체 색 토큰 | 정본이 button 토큰만 씀 — `--color-control-*` 미사용(검사기 강제) |
| Multi Toggle | 3칸 외 칸 수 공식 지원 | D3 — CSS 구조상 2~4칸 동작하나 예시·문서는 3칸만 |

## 4. `canonicalFingerprint` 계산

```
node -e '...' textarea      → 599c1ef0a0c5edc90c51f9080e1b6b6f6db75ea01751db5ef524b503fa2efe86
node -e '...' multi-toggle  → dc5a9787fa25148fd341b7374eac561bc639a3ad0b92f68de9cad53cb7aa9577
```
(wiring-and-traps.md §1-1 명령, `canonicalSources` 4개 파일 순서대로 해시. registry json 필드 확정 후 재계산해 최종값 반영.)

## 5. 배선표 5곳 체크리스트

| # | 파일 | 상태 |
|---|---|---|
| 1 | `ui-library/scripts/build.mjs` `componentIds` | ✅ `textarea`,`multi-toggle` 추가(끝에) — 기존 배열에 병행 작업 중이던 `tab`,`pagination` 항목은 그대로 유지 |
| 2 | `ui-library/scripts/test.mjs` `componentIds` + 계약 검사 | ✅ 배열 추가 + `id==="textarea"`/`id==="multi-toggle"` 전용 검사 블록 추가(geometry·토큰·runtime lifecycle) |
| 3 | `ui-library/package.json` `exports` | ✅ `./components/textarea`, `/css`, `/html`, `/html/mobile` · `./components/multi-toggle`, `/css`, `/html` 추가 |
| 4 | `ui-library/src/verification/empty-consumer.html` · `empty-consumer-individual.html` | ✅ 두 컴포넌트 마크업 추가, `<main>` 내부 DOM 완전 동일 확인(diff 0) — full 파일은 autoInit, individual 파일은 명시적 init 호출만 다름 |
| 5 | `registry/components/textarea.json` · `multi-toggle.json` `_meta.a11yStatus` | ✅ pending → stable (registry 기존 `a11y` 선언을 그대로 확정, 새 규칙 신설 아님). textarea `notes`에 resize 정책 확정 문구 1줄 추가. 다른 필드 미변경 |
| + | `registry/governance/component-presentation-policy.json` | ✅ textarea·multi-toggle 항목에 `"managedBy": "ui-library-guide"` 추가(기존 승인 컴포넌트 형식 그대로) |
| + | `ui-library/src/index.js`/`index.css`/`auto-init.js` | ✅ (build.mjs 파이프라인에는 미사용이지만 다른 컴포넌트들과 형식을 맞춰 함께 갱신 — 다른 세션이 tab/pagination 추가 시 이 파일들도 갱신했던 패턴을 따름) |

## 6. 동시 세션 주의 사항 (정직하게 기록)

작업 중 `ui-library/scripts/build.mjs` · `test.mjs` · `package.json` · `empty-consumer*.html`이 **다른 세션이 tab·pagination 을 추가하며 디스크에서 변경**돼 있었다(멀티세션 공유 워크트리). 최신 디스크 상태를 다시 읽어 그 위에 textarea·multi-toggle 만 추가하는 방식으로 병합했다 — tab·pagination 관련 로직·배열 항목은 건드리지 않았다.

`registry/components/pagination.json`은 현재(이 보고서 작성 시점) **JSON 파싱 오류 상태**다(다른 세션의 미완성 편집으로 보임, Gate 1·Gate 20 error). 이 파일은 이번 작업 범위 밖이며 내가 만들거나 수정하지 않았다 — `git diff registry/components/pagination.json` 확인 결과 내 커밋 대상이 아니다. **needs-decision 아님, 단순 정보 공유**: 다음 커밋 전 다른 세션이 마무리해야 한다.

## 7. 검사 명령별 실제 출력

```
$ npm run ui:contract
[UI Library Contract] PASS · policy=candidate · stable-enforcement=pending

$ npm run ui:icons
✅ 아이콘 검사기 적대 테스트 통과 / ✅ frame·glyph 계약 일치 (icons=3 errors=0)

$ npm run ui:build
UI library build generated: 73 files.

$ npm run ui:test
UI library technical checks completed (normal mode). Actual render and UX judgment remain separate.

$ npm run components:facts:check
최신: registry/components/component-facts.json

$ npm run components:guide-model:check
✅ registry/components/component-guide-model.json 정본 일치 (43개)

$ npm run design:md:check   (최초 실행 시 DESIGN.md 드리프트 감지 → design:md:write 실행 → 재실행 PASS)
✅ PC 20개 계약이 UI 라이브러리 JavaScript/마크업 근거와 연결됨
✅ DESIGN.md 최신 — 정본과 일치
❌ Pagination geometry 누락 / ❌ Pagination 블록 이동·경계 행동 계약 누락
   → textarea·multi-toggle 과 무관. 다른 세션의 tab/pagination 작업 미완성분(§6).

$ npm run components:behavior:check
✅ PC 20개 계약이 UI 라이브러리 JavaScript/마크업 근거와 연결됨

$ npm run gate:check
Gate Check FAILED — 2 error(s), 10 warning(s)
  ❌ [Gate 1] registry/components/pagination.json: invalid JSON  ← §6, 내 작업 아님
  ❌ [Gate 20] 동일 원인
  ⚠️ [Gate 16] multi-toggle 분류 미정(tbd) ← registry origin.classification 이 이전부터 "tbd" (내가 만든 상태 아님, 이번 작업에서 손대지 않음)
  그 외 경고 8건은 기존 기록성 항목(가이드 요구사항 문서에 이미 "기존 경고 11건 무관"으로 명시된 것과 동일 계열)
```

## 8. 막힌 것 / needs-decision

- **needs-decision (경미)**: Textarea 최소폭 240px 에 대응하는 `--sizing-*` 토큰이 정본에 없다. `width:100%`만 적용했고 `min-width`는 넣지 않았다. river 또는 token-validator 판단 필요 — (A) 토큰 없이 CSS 관례상 임의 240px 을 넣을지 (B) `--sizing-240` 을 정본에 신규 추가할지 (C) 지금처럼 min-width 없이 100%만 유지할지. 결정 없으면 지금처럼 min-width 없음 상태 유지.
- **needs-core-update (기존 유지)**: Textarea 안내문구(helper) — river D1 결정대로 이번 범위 밖, 정본에 먼저 추가 필요.
- 위 §6 의 `registry/components/pagination.json` 파싱 오류는 내 작업 범위 밖이라 손대지 않았다. 다음 단계(4-verification) 진입 전 오케스트레이터가 해당 세션과 조율 필요.

## 9. 자가인증 여부

이 보고서는 ⭐/🧱 구현자 자가 기록이다. PASS·verified·approved 판정은 하지 않았다 — 검증은 오케스트레이터·component-verifier 소관.
