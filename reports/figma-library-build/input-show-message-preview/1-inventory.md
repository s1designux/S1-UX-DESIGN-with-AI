# 1단계 재고조사 — Input `Show message` 미리보기

- 파일: SW-UX-GUIDE-V3.0-TEST (`cysG5U1udpQqVagYY1hWHW`)
- 조사 주체: ⭐ (read-only `use_figma` 실측, 2026-08-21)

## 대상 세트 확정 (동명 충돌 전수 확인)

파일의 11개 페이지 중 children>0 인 8개 페이지 전수 스캔 → **`Input` 이름의 COMPONENT_SET 은 1개뿐**.

| 페이지 | Input 세트 | 비고 |
|---|---|---|
| Core (`5:5706`) | **`1654:42409` `Input` · 112 variants · x64 y140 · 1726×1674** | ← 유일 대상. `Form Control` 섹션(`1654:44721`, x13968 y0) 내부 |
| Core | `1654:44176` `Search Input` (12) | 별개 컴포넌트 |
| Mobility | `1337:44945` `Search Input` (12) | 별개 컴포넌트 |
| ---공통--- / modu app / sample / Patterns PC / Patterns Mobile / Video | 없음 | |

> 저장소 기록의 옛 id(`330:24272`, `1546:10988`)는 **폐기된 세대**. 현행 = `1654:42409`.

## 변형 축 + 컴포넌트 속성 (실측)

| 속성 | 종류 | 값 |
|---|---|---|
| `Size` | VARIANT | XXSM · XSM · MD (default XXSM) |
| `State` | VARIANT | Default · Filled · Editing · Error · Correct · Read-Only · Disabled |
| `Label` | VARIANT | Off · On |
| `Message` | VARIANT | Off · On ← 이번에 Boolean 으로 대체 대상 |
| `Break` | VARIANT | PC · Mobile |
| `Password Icon#1654:226` | **BOOLEAN** | default false — `field>trail>eye.visible` 에 바인딩 (**Boolean 선례**) |

4 sizes(=3 size × Break 조합) × 7 state × 2 label × 2 message = **112 variants**.

## 레이어 구조 (MD/Mobile 실측)

```
COMPONENT  VERTICAL · itemSpacing 6 · HUG/HUG · fills []
├── "라벨"        (Label=On 만)  TEXT 14 Medium · style S:0b8aad8c… · fill VariableID:8:1061
├── "field"       FRAME HORIZONTAL · 200×48 · pad 0/12/0/16 · radius 4 · stroke 1 INSIDE
│   │              fill VariableID:8:1052 · stroke Default 8:1057 / Error 8:1059
│   ├── "입력"|"텍스트"  TEXT 14 Regular · style S:35d6b9f3… · layoutGrow 1 · FILL
│   │              fill placeholder 8:1065 (Default) / default 8:1063 (Error)
│   └── "trail"   FRAME HORIZONTAL · AUTO · itemSpacing 2 · fills []
│       └── "eye" INSTANCE(main `338:4`) 24×24 · visible=false · propRef visible→Password Icon
└── "안내 메세지"  (Message=On 만)  TEXT 12 Regular · style S:688caf7c…
                   fill caption 8:1121 (Default) / caution 8:1122 (Error)
```

높이: Label/Message 없음 48 → Message 추가 시 +6+16 = 70 → Label+Message 94.

## 기존 라이브러리 컨벤션

- 세트 배치는 Core 페이지의 15개 SECTION 안. 페이지 최하단 = y 5245 (Bottom Sheet 섹션).
- Boolean 속성 + `componentPropertyReferences.visible` 배선 = 이미 `Password Icon` 으로 확립된 패턴.
- 색은 전부 Variable 바인딩(raw hex 0건), 폰트는 Pretendard + 텍스트 스타일 바인딩.

## 검문소 1 결과

- 대상 세트 **1개 확정** · 동명 충돌 **0건** · 신규 토큰 필요 **0건** · 결정 필요(HD) **0건**.
