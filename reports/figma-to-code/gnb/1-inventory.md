# 1단계 재고조사 — GNB (pc_gnb + slots_menu)

> figma-to-code 1단계. **구현 금지, 목록만.** 파일키 yE5UCFEbmXJBlYJWB24Lz2.
> 원본: `pc_gnb`(540:5942, GNB 바) · `slots_menu`(540:6069, 메뉴 슬롯) · `slot_utility`(540:6219, 우측 유틸리티).

## 구조 (2층)

```
pc_gnb (바)  =  [로고]  +  [메뉴 슬롯들(slots_menu) ×N]  +  [유틸리티(slot_utility): 아이콘 3종]
```
- 바 배경 navigation/background(white), 하단 border 1px line/gray/subtle(#E9E9E9).
- 로고: "SAMPLE LOGO" Pretendard Bold 20px, base/black.
- 정렬: center-between(로고·메뉴·유틸 3분할) / start(좌측 정렬).

---

## A. 메뉴 슬롯 (slots_menu, 540:6069) — 원자 단위 · 9 variant (size × state)

| # | size | state | nodeId |
|---|------|-------|--------|
| 1 | md (h56) | default  | 540:6086 |
| 2 | md | hover    | 540:6070 |
| 3 | md | selected | 540:6074 |
| 4 | sm (h48) | default  | 540:6092 |
| 5 | sm | hover    | 540:6078 |
| 6 | sm | selected | 540:6082 |
| 7 | xsm (h36) | default  | 582:7888 |
| 8 | xsm | hover    | 582:7889 |
| 9 | xsm | selected | 582:7890 |

- 구성: 라벨 "메뉴타이틀"(Pretendard Medium, md 18px, ls -0.36px) + 하단 2px 라인. min-width 116px, px lg(24).
- **default**: 라벨 black(`--color-navigation-label-default-alt`), 하단 라인 투명.
- **hover / selected**: 라벨 blue #1D6CEB(`--color-navigation-label-hover`), 하단 라인 blue #1D6CEB(`--color-line-blue`). (hover=selected 동일 시각)
- 메뉴 슬롯 자체에는 **아이콘 없음**.

## B. GNB 바 (pc_gnb, 540:5942) — 조립체 · 12 variant (size × viewport × align)

| # | size | viewport | align | nodeId |
|---|------|----------|-------|--------|
| 1 | md (h56) | 1280 | center-between | 540:5943 |
| 2 | md | 1440 | center-between | 540:5963 |
| 3 | md | 1920 | center-between | 540:5983 |
| 4 | md | 1920 | start | 540:6003 |
| 5 | sm (h48) | 1280 | center-between | 540:5953 |
| 6 | sm | 1440 | center-between | 540:5973 |
| 7 | sm | 1920 | center-between | 540:5993 |
| 8 | sm | 1920 | start | 540:6014 |
| 9 | xsm (h36) | 1280 | center-between | 582:7770 |
| 10 | xsm | 1440 | center-between | 582:7771 |
| 11 | xsm | 1920 | center-between | 582:7772 |
| 12 | xsm | 1920 | start | 582:7773 |

> viewport(1280/1440/1920)는 주로 **외곽 px 패딩 차이**(예: 1920=px-240). align(center-between/start)은 **justify 차이**. 즉 12개 중 다수가 반응형 패딩·정렬 변형이다.

## 아이콘 (유틸리티 slot_utility, 3종)

| 역할 | Figma 노드명 | nodeId | 비고 |
|------|------------|--------|------|
| 언어/인터넷(globe) | `ic_인터넷` | 150:5007 | 40px 박스 안 32px 아이콘 |
| 계정/사용자 | `ic_계정/사용자/ID` | 150:5086 | 40px 박스 안 32px |
| 메뉴(햄버거) | `ic_메뉴` | 150:5206 | 40px 박스 안 32px |

- 유틸리티: 아이콘 3개 가로 배열, gap 8px(cluster/xxs). MCP 에셋 URL 제공됨(형식은 2단계에서 확인).

## 총계 / 검문소 1

- 메뉴 슬롯 **9** + GNB 바 **12** = variant 총 **21**, 아이콘 **3종**.
- ⚠️ 바 12개 중 상당수가 viewport/align 변형 → **구현 범위 사용자 확인 필요**(아래 보고).
