# TimePicker Dropdown — 5단계 다크모드

## 결론: 자동 처리 (별도 설계 불필요)

이 컴포넌트는 **역방향 Figma 생성기**(build-components.ts) 산출물이라, 다크모드는 CSS `[data-theme]`가 아니라 **Figma Semantic Color 컬렉션의 Dark 모드 + 변수 바인딩**으로 전환된다. `buildSpec`이 Light/Dark 스펙 프레임 2개를 생성하며, 바인딩된 변수가 모드에 따라 값을 바꾼다.

## 사용 토큰 light/dark 페어 (vars-data 정본)

| 토큰 | Light | Dark |
|------|-------|------|
| `color/dropdown/list/bg` | base/white | gray-dark/100 |
| `color/dropdown/list/border` | gray/200 | gray-dark/500 |
| `color/dropdown/option/border/selected` | blue/400 | blue-dark/300 |
| `color/dropdown/option/label/default` | gray/800 | gray-dark/800 |
| `color/dropdown/option/label/selected` | blue/400 | blue-dark/350 |
| `color/text/state/accent` (확인) | blue/400 | blue-dark/300 |

- Figma 원본(1459:18597)이 **다크 스크린샷**으로 제공됐고(#1c1d23 패널 등), 위 dark 값과 일치 → 드롭다운이 다크에서 다크 표면을 갖는 것이 원본 의도. (워크플로우의 "팝업은 다크에서도 라이트 유지" 예외는 이 원본엔 비적용.)
- 변수명 유지·값만 전환. 신규 토큰·하드코딩 0.

## 검문소 5
별도 1차안/개선안 불필요 — 다크 표면이 원본·토큰 페어로 이미 결정됨. ✅
