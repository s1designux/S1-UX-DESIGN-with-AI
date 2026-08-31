# 3-build — 원본·배포·검수 소비자 구현

작성: ⭐ 오케스트레이터 · 2026-08-31 · 배선표 = `.claude/skills/ui-library-code/references/wiring-and-traps.md §1`

## 원본 (`ui-library/src`)

| 파일 | 내용 |
|---|---|
| `components/toggle/toggle.css` | 트랙 40×20 · 노브 16 · Off/On/Disabled/focus. Hover·transition 없음 |
| `components/toggle/toggle.js` | aria-checked 전환 런타임 · `s1:toggle:change` · init/destroy |
| `components/toggle/toggle.example.html` | 코드탭·배포 예시 원본 |
| `components/toggle/manifest.json` | 지문 `9e7b5b86…` |
| `components/chip/chip.css` | 크기 3조합 · Line/Solid × 4상태 · focus |
| `components/chip/chip.js` | aria-pressed 전환 런타임 · `s1:chip:change` · init/destroy |
| `components/chip/chip.example.html` | 코드탭·배포 예시 원본 |
| `components/chip/manifest.json` | 지문 `19c06d63…` |

아이콘 추가 없음 → `assets/icons` 무변경.

## 생성 경로 (3곳)

- `scripts/build.mjs`: `componentIds` 에 toggle·chip 추가. **auto-init 생성기를 일반화** — 기존에는 input 만 하드코딩돼 있어 런타임이 있는 컴포넌트가 늘면 자동 초기화에서 조용히 빠졌다. 이제 `jsRequired: true` 인 컴포넌트 전부를 결정론적으로 넣는다.
- `scripts/test.mjs`: `componentIds` 추가 + Toggle·Chip 계약 검사 신설(아래).
- `package.json`: `exports` 6줄 추가.

### 신설한 결정론 검사

- Toggle: 트랙 40×20·radius full·Off 트랙 토큰 / 노브 16·좌측 2px / On 트랙 selected 토큰·노브 우측 2px / disabled 토큰 2종 / focus-visible / **transition·animation 금지** / **hover 규칙 금지** / example 에 role=switch / 런타임 lifecycle.
- Chip: 크기 3조합의 높이·글자·좌우 여백 정확 일치 / **Mobile MD 금지** / radius·border-width / hover 는 hover 가능 기기 + 미선택 한정(variant 별) / variant 별 selected·disabled 토큰 결선 / **정본이 안 쓰는 `--color-chip-solid-bg-selected-hover` 사용 금지** / focus-visible / example 의 aria-pressed / 런타임 lifecycle.

## 소비자

- `src/verification/empty-consumer.html` — 토글 2개·칩 3개 추가. 스크립트를 `autoInit()` 으로 바꿔 자동 초기화 경로 자체를 소비 검증한다.
- `src/verification/empty-consumer-individual.html` — 같은 `<main>` DOM, 개별 CSS·JS 로딩만 다름.
- `pages/ui-review.html` — 5. Toggle · 6. Chip 섹션 추가(검수본 06).
- `assets/js/ui-library-guide.js` — `componentConfig` 2건 + `toggleStateMatrix()` · `chipStateMatrix()` + 런타임 init 배선 + mount 목록.
- `assets/css/ui-library-guide.css` — 배치 전용 클래스와 Hover 강제 표시(정본 Hover 슬롯과 같은 토큰만).
- `pages/components.html` — 손관리 마크업 제거(토글 6,127자 · 칩 18,779자) → 빈 mount + 마커, 내비 `disabled` 해제.

## 등록부

- `registry/components/toggle.json` a11yStatus stable / `chip.json` a11yStatus 신설(stable).
- `registry/governance/component-presentation-policy.json` 두 컴포넌트에 `managedBy: ui-library-guide`.
- `registry/governance/ui-library-migration.json` 레코드 2건 추가.
