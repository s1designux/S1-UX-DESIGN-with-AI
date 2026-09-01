# 1-inventory — 플랫폼별 코드 예제 재고조사

작성 2026-09-02 · 오케스트레이터(⭐)

## 문제

디자인가이드 **Mobile Components** 화면의 「개발 코드」가 **PC 마크업**을 그대로 보여줬다.
배포본에 예제가 **PC 1벌**뿐이었고(`ui-library/dist/examples/{id}.html`), 가이드 화면이
플랫폼과 무관하게 그 한 벌을 불러 썼기 때문이다. 퍼블리셔가 Mobile 화면에서 복사하면
PC 크기·break 가 붙은 마크업을 붙여 넣게 된다.

## 대상 전수 (배포된 코어 9종)

| 컴포넌트 | manifest `breaks` | Mobile 예제 필요 |
|---|---|---|
| input | pc: xxsm·xsm·md / mobile: md | ✅ (`data-break="mobile"` 로 높이 48) |
| button | pc: md·xsm·xxsm / mobile: lg | ✅ (`data-size="lg"`) |
| chip | pc: sm·md / mobile: sm | ✅ (`data-size="sm" data-break="mobile"`) |
| select | pc: xxsm·xsm·md / mobile: md | ✅ (`data-break="mobile"` 로 높이 48) |
| filter-chip | pc: sm·md / mobile: md | ✅ (`data-size="md" data-break="mobile"`) |
| checkbox | 선언 없음 | ❌ 플랫폼 축 없음 |
| radio | 선언 없음 | ❌ 플랫폼 축 없음 |
| toggle | 선언 없음 | ❌ 플랫폼 축 없음 |
| dropdown | 선언 없음 | ❌ 플랫폼 축 없음 |

Mobile 예제가 필요한 것은 **5종**. 나머지 4종은 정본에 플랫폼 축이 없어 PC 예제 1벌이 맞다.

## 미확인

없음. 크기·break 축은 각 `manifest.json` 의 `breaks` 선언(정본 파생)에서 읽었다.
