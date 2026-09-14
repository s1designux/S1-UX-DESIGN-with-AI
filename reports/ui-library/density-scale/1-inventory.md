# 1-inventory — 밀도(density)

## 한 줄에 놓이는 PC 컨트롤 높이는 세 가지뿐이다

`component-facts.json` 실측 기준. 같은 칸 = 나란히 놓았을 때 줄이 맞는다.

| 높이 | 그 높이를 쓰는 컴포넌트와 각자 부르는 이름 |
|---|---|
| **44** | Line Tab MD · Button MD · Multi Toggle MD · Dropdown List MD · Input MD · Search Input MD · Select Box MD · Calendar Cell MD · Date Picker MD · Time Picker MD · Table Cell MD (12종, 전부 MD) |
| **34** | Button XSM · Multi Toggle **SM** · Dropdown List XSM · **Chip MD** · Input XSM · Search Input XSM · Select Box XSM · Date Picker XSM · Time Picker XSM · Table Cell XSM · **Filter Chip MD** (12종) |
| **28** | Button XXSM · Dropdown List XXSM · **Chip SM** · Input XXSM · Search Input XXSM · Select Box XXSM · Date Picker XXSM · Time Picker XXSM · **Filter Chip SM** (9종) |
| 모바일 **48** | Button **LG** · Input MD · Search Input MD · Select Box MD · Date Picker MD · Time Picker MD (6종) |
| 모바일 **30** | Chip SM · Filter Chip **MD** |

**같은 높이인데 다른 이름으로 부르는 자리 7군데** — 34를 칩은 MD, 멀티토글은 SM 이라 부르고, 28을
칩은 SM 이라 부른다. 모바일 48도 버튼만 LG 다.

그래서 "전부 md 로 맞춰줘" 가 줄을 어긋나게 만든다 — 버튼 44 · 입력창 44 인데 칩 34 · 필터 칩 34.

## 대상 아닌 것 — 자기 눈금을 쓰는 컴포넌트

| 컴포넌트 | 눈금 |
|---|---|
| Line Tab | 44 · 42 · 40 |
| GNB · GNB Menu | 56 · 48 · 36 |
| Calendar Tile | 56 · 40 |
| Modal | 크기 축 없음(폭 360) |
| Modal Content | 폭 520 · 1000 · 1200 |

이들은 한 줄에 나란히 놓이지 않으므로 밀도로 묶지 않는다.

## 웹 배포본과 정본이 다른 자리

| 컴포넌트 | 정본 | 웹 배포본 | 처리 |
|---|---|---|---|
| Table Cell | MD 44 · SM 38 · XSM 34 | sm 38 · xsm 34 (md 없음) | 넓게는 가장 가까운 sm(38) |
| Dropdown List | 패널 높이 120·144·184 | 줄 높이 28·34·44 | 줄 높이를 쓴다 — facts geometry 를 쓰지 않은 이유 |
