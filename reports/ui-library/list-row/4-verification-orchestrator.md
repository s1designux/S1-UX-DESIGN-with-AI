# list-row — 4-verification (오케스트레이터 선검증)

> 2026-09-21 · 실제 배포본(dist)만 사용 · 전수 매트릭스 56칸

## 기계검사

| 검사기 | 결과 |
|---|---|
| ui:contract | ✅ PASS |
| ui:version | ✅ PASS |
| ui:build:check | ✅ PASS |
| ui:test:check | ✅ PASS |
| ui:icons | ✅ PASS |
| ui:icons:origin | ✅ PASS |
| ui:guide:render | ✅ PASS |
| ui:state | ✅ PASS |
| canon:check (Gate 34) | ✅ 승인 기록 5건(component 1 + uistate 4) |

## 렌더 (선캡처)

| 파일 | 조건 |
|---|---|
| `screens/matrix-pc-light.png` | PC 1440 · Light · 56칸 전수 |
| `screens/matrix-pc-dark.png` | PC 1440 · Dark · 56칸 전수 |
| `screens/matrix-mobile-light.png` | Mobile 390 · Light |

## 실측 줄 높이 (같은 목록 안에서 같아야 한다 — river 2026-09-21)

| 밀도 | 유형 | 높이 |
|---|---|---|
| default | nav · value · read · pick · agree · switch | **73.0** |
| default | thumb | **80.0** ❌ |
| compact | nav · value · agree | **48.0** |
| compact | read · pick · switch | **44.8** ❌ |
| compact | thumb | **72.0** ❌ |

## 발견 (FAIL 2건)

1. **같은 밀도 안에서 높이가 갈린다.** 오른쪽에 화살표(24)가 있는 줄과 없는 줄이 서로 다르다(compact 48 vs 44.8).
   글 자리에 최소 높이가 없어서 글자 키(20.8)가 그대로 줄 높이가 된 탓이다.
2. **썸네일 줄만 더 크다.** 썸네일 48이 글 자리보다 커서 default 80 · compact 72 가 된다.

### 고칠 방향 (정본·배포본 양쪽)

글 자리의 **최소 높이를 그 밀도에서 가장 큰 부품에 맞춘다** — 새 숫자를 만들지 않고 이미 있는 값에서 끌어온다.

- Default: 글 자리 최소 **48**(썸네일과 같게) → 모든 default 줄 **80**
- Compact: 글 자리 최소 **24**(화살표와 같게) → 모든 compact 줄 **48**

## 눈으로 본 것

- Light·Dark 둘 다 56칸 전부 나온다. 색은 전부 토큰을 탄다.
- 비활성은 글자·아이콘·체크·토글이 함께 흐려진다.
- **썸네일 자리 색이 눌림 상태 배경과 같아** 눌린 줄에서 썸네일이 안 보인다(자리표시용 색이라 실제 그림이 들어가면 드러나지 않음 — 기록만).
