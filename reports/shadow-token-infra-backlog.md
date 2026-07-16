# shadow 토큰 인프라 신설 — 별건 백로그 (루트 A 시험에서 발견)

> **상태: 미착수.** 그림자 인프라가 갖춰지면 다크 모달에 얹는다.
> 발견 경위: 루트 A 신규 편입 시험(첫 대상 = V2.4 modal_small "삭제") §6 1단계에서, 다크 모달 그림자 토큰을 vars-data에 넣으려다 발견.

---

## 배경

다크 모달 그림자를 정본에 넣으려다, **그림자는 기존 토큰 2종과 근본적으로 다른 종류**임이 드러났다.

| 기존 토큰 종류 | 값 형태 | 정본 객체 |
|---|---|---|
| Semantic Color | Foundation **색 alias**(예 `"gray/900"`) 또는 rgba | `SEMANTIC_COLOR: Record<string, SemanticColorEntry>` |
| Semantic Number | **문자열 alias/숫자**(예 `"radius/8"`, `8`) | `SEMANTIC_NUMBER: Record<string, string \| number>` |
| **Shadow (신규)** | **raw box-shadow 문자열**(모드별·2겹·rgba·spread 포함) | **없음 — 신설 필요** |

그림자는 색 alias도 숫자도 아니라, `gen-semantic-tokens.js`가 값을 `var(--color-…)`로 감싸는 기존 처리로는 다룰 수 없다. 즉 **토큰 1개 추가가 아니라 인프라(6표면) 신설** 작업이다.

---

## 확정된 값 (Figma 실측 완료)

- **토큰명:** `shadow/raised`  ( `--shadow-raised` )
  - 예약 네임스페이스 `shadow/*`(tokens/foundation.md 계통도) + `color/surface/raised`와 짝(둘 다 "딤 위에 떠있는 패널" 레이어).
- **light:** `none`  (라이트 모달은 그림자 없음 — Figma 실측 확정: P8YvnCdGkQLDNVQhW74ZZW / 8177:264277, 딤만 있고 패널 그림자 0)
- **dark:** `0px 8px 8px -4px rgba(0,0,0,1), 0px 20px 24px -4px rgba(0,0,0,1)`
  - **Figma 실측 원본:** 파일 `Tnihi6lixRR47N4RSAwUbF`, node `2550:5197`(Popup_widget), `node.effects[]` 직접 판독.
  - 2겹 DROP_SHADOW (both visible·NORMAL·effectStyleId=null):
    | 겹 | offset(x,y) | blur(radius) | spread | color·alpha |
    |---|---|---|---|---|
    | A | 0, 8 | 8 | −4 | rgba(0,0,0, **1.0**) |
    | B | 0, 20 | 24 | −4 | rgba(0,0,0, **1.0**) |
  - ⚠️ **주의:** get_design_context는 이 값을 `drop-shadow-[0px_20px_12px_black,0px_8px_4px_black]`(blur 12/4·spread 0)로 **손실 근사**했다. CSS `drop-shadow` 필터엔 spread가 없어 익스포터가 뭉갠 것. **위 실측값(blur 8/24·spread −4)이 정본.** box-shadow(웹)는 spread 지원하므로 실측값을 써야 정확.
- **소속:** **Core** — 모달 셸(Core)이 쓰고 Popup·바텀시트·드롭다운 등 여러 오버레이가 공유하는 elevation primitive. foundation.md가 `shadow/*`를 Foundation 층에 예약. (영상 서비스 다크 사용이 많은 건 "사용 패턴"이지 "소유"가 아님 → Core 보관·서비스 참조.)

---

## 손볼 6표면 (§6 1단계에서 진단한 표 그대로)

| # | 손볼 곳 | 무엇을 | 진단 증상(🔴) |
|---|---|---|---|
| 1 | `plugins/figma-vars-installer/src/vars-data.ts` 구조 | shadow 전용 객체 신설 — 예 `SEMANTIC_SHADOW: Record<string, {light: string; dark: string}>` | SEMANTIC_NUMBER(string\|number)에 {light,dark} 넣으면 **tsc TS2322** |
| 2 | `scripts/gen-semantic-tokens.js` | shadow 분기 추가 — 값을 **aliasToCss 없이 raw 그대로** `--shadow-*: <값>;` 로 Light/Dark 출력 | gen은 `SEMANTIC_COLOR`만 읽고 모든 값을 `var(--color-{값})`로 감쌈 → `none`·그림자 문자열 뭉개짐. SEMANTIC_NUMBER는 아예 안 읽음 |
| 3 | `registry/governance/audit-rules.json` R07 + `token-exceptions.json` | shadow를 **rgba 예외**에 등록(overlay=EX03와 동일 패턴) | R07: "rgba는 EX03(overlay)에만 허용" → 그림자 rgba가 Gate 3 error |
| 4 | `scripts/installer-coverage-check.js` | `shadow-` 접두사 매핑 추가 | 접두사 맵에 spacing-/radius-는 있으나 **shadow- 없음** → 커버리지에서 튐 |
| 5 | `scripts/token-naming-check.js` | `NUM_NS`(또는 별도)에 `shadow` 네임스페이스 추가 | `NUM_NS`에 shadow 없음 → `--shadow-*` 미인식 네임스페이스로 걸림 |
| 6 | tsc 타입 정합 | 위 1로 해소 | — |

> 추가 확인 포인트: 2겹 콤마 문자열 자체는 gen 정규식 `[^"]+` 캡처엔 안 깨지나(따옴표 안), 한 줄 `{light,dark}` 전제·트레일링 콤마·aliasToCss 뭉갬 때문에 결국 raw 통과 분기(#2) 없이는 처리 불가.

---

## 다음 (인프라 착수 시)

1. 위 6표면을 **한 세트로** 배선(빌드=vars-data/gen, 검증=게이트 예외·커버리지).
2. `--shadow-raised` Light(none)/Dark(2겹) tokens.css 생성 확인 → install-prompt 동기화.
3. 다크 모달 셸에 `box-shadow: var(--shadow-raised)` 얹기(라이트 none이라 라이트 무영향).
4. 값 정합: 위 실측값과 tokens.css 해석 표면 일치 확인.
