# 1단계 재고조사 — TimePicker Select (timepicker_select)

> figma-to-code 워크플로우 1단계 산출물. **구현 금지, 목록만.**
> 검문소 1 통과: 2026-06-05 사용자 확인 — "TimePicker Select로 진행", "harness 신규 구현/완성".

## 컴포넌트 정체

- **Figma 원본 명칭:** `timepicker_select` (node 540:3636)
- **registry 귀속:** `time-picker` (variants.select) — `registry/components/time-picker.json`
- **DatePicker 아님.** 사용자 초기 표현("데이트피커 셀렉박스")과 달리 Figma 원본은 시/분 타임피커 셀렉트다.
- 파일 키: `yE5UCFEbmXJBlYJWB24Lz2`

## 구조

2개 셀렉트 박스(시 hour / 분 minute)를 나란히 배치(cluster gap 16px).
각 박스 = 값 텍스트("00") + chevron 아이콘, 박스 우측에 외부 라벨(시/분).

```
[ 00  ⌄ ] 시    [ 00  ⌄ ] 분
└select┘ label  └select┘ label
```

## variant 목록 (총 6 = size 2 × state 3)

| # | size | state (Figma) | state (code) | nodeId | 박스 크기 |
|---|------|--------------|--------------|--------|----------|
| 1 | md | default  | default  | 540:3637 | 216×44 |
| 2 | sm | default  | default  | 540:3644 | 180×28 |
| 3 | md | editing  | **focus** | 540:3651 | 216×44 |
| 4 | sm | editing  | **focus** | 540:3658 | 180×28 |
| 5 | md | disabled | disabled | 540:3665 | 216×44 |
| 6 | sm | disabled | disabled | 540:3672 | 180×28 |

> Figma `editing` → code `focus`: 기존 HD-Time-2 alias 확정 (token-aliases.json).
> select형 state는 default / focus / disabled 3개뿐. `filled` 상태 없음(metadata 확인).

## 아이콘 (1종)

| 역할 | Figma 노드명 | nodeId | 에셋 출처 | 비고 |
|------|------------|--------|----------|------|
| 셀렉트 펼침 화살표 | `ic_화살표, 더보기` | 563:3158 | MCP 제공 (imgFill1 + imgStroke2) | 90° 회전(아래 방향). variant당 2회 사용 |

- 설명: "화살표, 더보기, 오른쪽, 콤보박스, More, Arrow, Combobox"
- MCP 에셋 URL 확보됨 (추측 아님). 구현 시 원본 에셋 사용(규칙 2).

## 검문소 1 결과

- 총 variant: **6** — 사용자 확인 완료 → 2단계 진행 승인.
