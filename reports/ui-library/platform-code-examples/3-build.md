# 3-build — 구현

작성 2026-09-02 · 오케스트레이터(⭐)

## 원본 (`ui-library/src`)

| 파일 | 내용 |
|---|---|
| `components/{id}/{id}.mobile.example.html` (5종) | input·button·chip·select·filter-chip 의 Mobile 마크업 |
| `components/{id}/manifest.json` (5종) | `htmlContract.breakExamples` 에 pc·mobile 예제 경로 선언 |

## 생성 경로

| 파일 | 변경 |
|---|---|
| `ui-library/scripts/build.mjs` | 선언된 `breakExamples` 만 읽어 `examples/{id}.mobile.html` 생성 · `sourceFingerprint` 에 포함 · dist manifest 각 컴포넌트에 `examples` 맵 기록. 경로 규약(`{id}.{break}.example.html` → `examples/{id}.{break}.html`)에 어긋나면 빌드가 멈춘다 |
| `ui-library/scripts/test.mjs` | Mobile break 를 선언한 컴포넌트는 ① mobile 예제 선언·배포 존재 ② 예제의 `data-size` 가 정본 Mobile 크기 ③ `data-break="mobile"` 표기 ④ PC 예제와 다름 ⑤ PC 예제 크기도 정본 PC 크기 — 를 검사 |
| `ui-library/package.json` | `./components/{id}/html/mobile` export 5줄 추가 |

## 소비자

| 파일 | 변경 |
|---|---|
| `assets/js/ui-library-guide.js` | 현재 화면의 플랫폼(`view-mobile` 클래스 / `?platform=`)을 읽어 그 플랫폼의 예제를 불러온다. 플랫폼 축이 있는 컴포넌트에는 「어느 화면의 마크업인지」 안내 한 줄을 코드 위에 붙인다 |

dist 는 손편집하지 않았다 — 전부 `npm run ui:build` 생성 결과다.
