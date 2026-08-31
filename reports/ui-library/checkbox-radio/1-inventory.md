# 1-inventory — Checkbox · Radio 전수 재고조사

작성 2026-08-31 · ⭐ 오케스트레이터 직접 판독(파일:줄 인용)

## 코드 시각 정본

| 항목 | Checkbox | Radio |
|---|---|---|
| 정본 함수 | `plugins/figma-vars-installer/src/build-components.ts:728` `buildCheckbox` | `build-components.ts:772` `buildRadio` |
| 세트 이름 | `Checkbox` | `Radio` |
| 크기 | 18×18 · cornerRadius 2 · stroke 1 INSIDE | 원 18×18 · cornerRadius 9(=원) · stroke 1 INSIDE |
| 인디케이터 | 체크 아이콘 16×16, 상자 안 (1,1) — `makeCheckIcon` (`build-components.ts:627`) | 원형 점 10×10, (4,4) 중앙 |
| 축 | State 5종 | State 5종 × Label 2종(Off·On) |
| 라벨 | 없음 | `makeBoundText("라디오", 14, "Medium")` · itemSpacing 8 |

### 상태 × 토큰 (정본 그대로)

Checkbox
| State | bg | border | indicator |
|---|---|---|---|
| Default | `color/control/bg/default` | `color/control/border/default` | — |
| Hover | `color/control/bg/hover` | `color/control/border/default` | — |
| Checked | `color/control/bg/selected` | `color/control/border/selected` | `color/control/indicator/selected` |
| Disabled | `color/control/bg/disabled` | `color/control/border/disabled` | — |
| Dis+Checked | `color/control/bg/disabled` | `color/control/border/disabled` | `color/control/indicator/disabled` |

Radio
| State | bg | border | dot |
|---|---|---|---|
| Default | `color/control/bg/default` | `color/control/border/default` | — |
| Hover | `color/control/bg/hover` | `color/control/border/default` | — |
| Selected | `color/control/bg/default` (바뀌지 않음) | `color/control/border/selected` | `color/control/indicator/selected-alt` |
| Disabled | `color/control/bg/disabled` | `color/control/border/disabled` | — |
| Dis+Selected | `color/control/bg/disabled` | `color/control/border/disabled` | `color/control/indicator/disabled` |

라벨 색: `color/control/label/default` · 비활성 `color/control/label/disabled` (`build-components.ts:817`)

## 토큰 존재 확인

`vars-data.ts:547-559` 에 `color/control/*` 13개 전부 존재하고 다크 대응값이 모두 있다.
파생 `assets/css/tokens.css:477-489`(Light) · `:697-709`(Dark) 에 그대로 내려와 있다.
새 토큰 신설이 필요한 항목은 **0건**이다.

## 아이콘

- 정본 역할 이름 `check`, 허용목록 `registry/figma/allowed-remote-keys.json:9` = `5ab251e0d90adb555ee2fa316f84e86041f19916` (V2.2 `ic_확인` line).
- 정본은 이 아이콘을 **16px 로 리사이즈**해 사용한다(`build-components.ts:629`).
- 웹 자산 기하는 추측하지 않고 실측했다: 내보낸 원본 `assets/icons/ic_확인_line.png`(48px = 24 기준 2배)의 잉크 경계는 24 기준 18×12, 정본 인라인 SVG(16 기준)의 잉크 경계는 11.6×8.25 로 **같은 비율** — 즉 glyph 가 frame 을 그대로 채운다. frame 16 · glyph (0,0,16,16) 로 확정.

## Registry (의미·행동·접근성)

| 항목 | Checkbox | Radio |
|---|---|---|
| 파일 | `registry/components/checkbox.json` | `registry/components/radio.json` |
| a11yStatus (착수 시점) | `pending` ❌ 계약상 approved 배포 불가 | `pending` ❌ |
| `guide.webTag` (착수 시점) | `button` ❌ 계약의 native HTML 우선과 충돌 | `button` ❌ |
| 정본과의 충돌 | 설명·doDont·a11y가 **부분선택(indeterminate)** 을 전제하나 정본에 그 변형이 없음 | 없음 |

## 배포 가능 여부

- 착수 시점 `ui-library/src/components` 에는 `input`·`button` 만 존재. Checkbox·Radio 는 **미착수**.
- `ui-library/scripts/build.mjs` · `test.mjs` · `package.json exports` 모두 두 컴포넌트를 모르는 상태.

## 미확인 항목

없음. 상태·수치·토큰·아이콘 기하가 모두 저장소 안에서 확정됐고, Figma V3.0 시각 참고는 필요하지 않았다.
