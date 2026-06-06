# 5단계 다크모드 점검 — TimePicker Select

> figma-to-code 5단계 산출물. 담당: guide-builder(구현) + component-verifier(점검).

## 판단: 신규 다크 디자인 불필요 — 안정(stable) form-control 다크 토큰 상속

- Figma `timepicker_select`(540:3636)는 **라이트 전용 디자인**이다. 다크 variant 노드 없음 → 추출할 Figma 다크 원본이 없다(추측 금지).
- select 박스는 색상을 **전부 `--color-form-control-*` semantic**으로 참조한다. 이 토큰들은 이미 `darkModeStatus: stable`(TimePicker input형에서 검증 완료).
- 따라서 다크모드는 **전역 테마 토글 시 자동 상속**된다. 별도 navy 표면 설계나 토큰 추가가 필요 없다.

## 다크 resolved 값 (상속 체인 검증)

| 역할 | Component 토큰 | Dark 체인 | resolved (Dark) |
|---|---|---|---|
| 박스 bg (default/focus) | `--color-form-control-bg-default` | → bg-subtle → gray-dark-200 | #24252C |
| 박스 bg (disabled) | `--color-form-control-bg-disabled` | → surface-default → gray-dark-100 | #1C1D23 |
| border default | `--color-form-control-border-default` | → border-default → gray-dark-300 | #2E2F38 |
| border focus | `--color-form-control-border-selected` | → border-focus → blue-dark-350 | (accent) |
| border disabled | `--color-form-control-border-disabled` | → border-default → gray-dark-300 | #2E2F38 |
| 값 텍스트 | `--color-form-control-text-default` | → text-secondary → gray-dark-800 | #B8BABF |
| 값 텍스트(disabled) | `--color-form-control-text-disabled` | → text-readonly → gray-dark-500 | #3E4049 |
| 라벨 시/분 | `--color-form-control-label-default` | → text-secondary → gray-dark-800 | #B8BABF |
| 라벨(disabled) | `--color-form-control-label-disabled` | → text-disabled → gray-dark-400 | (gray-dark-400) |
| 화살표 아이콘 | `--color-form-control-icon-default` | → gray-dark-700 | #8A8C96 |

> **HD-TPS-1 영향 범위 주의:** `--color-form-control-border-disabled`의 #D9D9D9 변경은 **:root(Light)** 블록에만 적용했다. `[data-theme="dark"]` 블록의 disabled border는 기존 `var(--color-border-default)`(gray-dark-300) 유지 — Figma가 라이트 전용이므로 다크는 건드리지 않음.

## 대비·위계 점검

- 값/라벨 텍스트 #B8BABF on 박스 bg #24252C — 충분한 대비(밝은 텍스트/어두운 면).
- default border #2E2F38은 bg #24252C 위에서 한 단계 밝아 박스 경계 인지 가능.
- focus border blue-dark-350 = accent로 분리.
- disabled: 텍스트 #3E4049 on bg #1C1D23 — 의도적 저대비(비활성). input형 disabled와 동일 처리로 일관.
- forced-dark 패널 없음(harness-audit RULE-2 PASS). 전역 토글로만 다크 검증.

## 팝업/드롭다운

- 본 컴포넌트(540:3636)는 **트리거 박스만** 포함. 드롭다운 패널은 별도 컴포넌트(기존 `s1-tp-select-dropdown`, 이번 범위 밖)로 변경하지 않음.

## 개선안 (검문소 5)

- **권장: 변경 없음.** 안정 form-control 다크 토큰 상속으로 충분하며, 대비·위계 모두 양호. 신규 다크 토큰/설계 추가는 불필요.
- 사용자 확인 후 5단계 종료.
