# 1-inventory — Toggle · Chip 전수 재고조사

작성: ⭐ 오케스트레이터 · 2026-08-31 · 기준 = 저장소 정본(대화 기억 아님)

## 착수 5분 점검

| 항목 | 결과 |
|---|---|
| 진행 중 작업 | 없음 (input-button-pilot·checkbox-radio 모두 complete) |
| `npm run ui:test` 착수 시점 | PASS — 다른 세션이 남긴 실패 없음 |
| `registry/components/toggle.json` a11yStatus | ⚠️ `pending` → river 승인으로 `stable` 확정 (D2) |
| `registry/components/chip.json` a11yStatus | ⚠️ 필드 자체가 없음 → river 승인으로 `stable` 신설 (D2) |
| registry 가 정본에 없는 상태를 전제하는가 | ⚠️ Chip `complete`·아이콘·닫기(X) — 정본 buildChip 에 없음 (D3·HD-1) |

## 시각 정본 (build-components.ts)

### buildToggle (834~878행)
- 축: `Pressed=Off|On` × `State=Default|Disabled` = 4가지. **크기 축 없음.**
- 트랙 40×20, cornerRadius 10(= radius/full 과 같은 결과), 노브 16×16, y=2, x= Off 2 / On 22.
- 토큰: Off 트랙 `color/control/indicator/unselected` · On 트랙 `color/control/bg/selected` · Disabled 트랙 `color/control/bg/disabled`(Off·On 공통) · 노브 `color/control/indicator/selected`, Disabled 노브 `color/control/indicator/disabled`.
- **Hover 없음 · 모션 선언 없음 · 라벨 부품 없음.**

### buildChip (881~940행)
- 축: `Variant=Line|Solid` × `State=Default|Hover|Selected|Disabled` × 크기 3조합.
- 크기 3조합(그 밖의 조합은 정본에 없음): PC SM h28/글자12/좌우16 · Mobile SM h30/글자14/좌우12 · PC MD h34/글자14/좌우16.
- radius full, 안쪽 테두리 1px, 라벨 Medium.
- 슬롯: Line Hover 는 배경만 바뀌고 테두리는 기본 유지 / Solid Hover 는 테두리가 채움색과 같아져 사라져 보임 — 2026-07-06 회귀 수정 주석과 일치.
- **Complete 상태 없음 · 아이콘 없음 · 닫기(X) 없음 · Selected+Hover 셀 없음.**

## 토큰

`assets/css/tokens.css` 에 필요한 값이 Light·Dark 모두 이미 있다. **새 토큰 신설 0건.**
- control 13종(453~489행 / 다크 697~709행), chip line·solid 20종(453~474행 / 다크 673~690행).
- `--color-chip-solid-bg-selected-hover` 는 존재하지만 정본 빌더가 쓰지 않아 웹에서도 쓰지 않았다.

## 웹 라이브러리 현황 (착수 시점)

| 자리 | Toggle | Chip |
|---|---|---|
| `ui-library/src/components/` | 없음 | 없음 |
| `build.mjs`·`test.mjs`·`package.json exports` | 미등록 | 미등록 |
| `pages/components.html` | 손관리 마크업 + 내비 disabled | 손관리 마크업 + 내비 disabled |
| `pages/ui-review.html` | 없음 | 없음 |

## 미확인으로 남긴 것

- Figma V3.0 노드: 조회하지 않았다. 코드 정본만으로 상태·수치·토큰이 모두 확정돼 시각 참고가 필요 없었다(계약상 inventory 필수 아님).
