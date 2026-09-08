# 시안 Input 교체 30건 — 독립 검증 (🤖 component-verifier, 2026-09-08)

> 대상: 파일 `cysG5U1udpQqVagYY1hWHW` · 페이지 `173:2431` · `Pattern / App Login` 20 + `Pattern / Mobile Web Signup` 10
> 기준: `snapshot-swap-before.json` · `snapshot-swap-after.json` · `node-map-swap.json` · `5-swap-survey.md` · 라벨 정본 `pattern-data.ts fieldLabel()`
> **종합 판정: HOLD** — 캔버스 결과물은 FAIL 사유 0(재작업 불필요). ❓(c) 1건 + ❌(a) 1건(보고서 수치) 정리 후 PASS.

## 🔴 화면 동일성 — **동일함 (PASS)**

빌더 주장("라벨 24px만큼 내려갔지만 입력 필드 위치는 완전히 동일")은 **좌표로 검증된 사실이다.**

| 노드 | y (전→후) | h (전→후) | 전 필드 상단 | 후 필드 상단 | 판정 |
|---|---|---|---|---|---|
| `1858:18032` Password | 98 → 122 | 94 → 70 | 98+24 = **122** | **122** | 동일 ✅ |
| `1858:18061` Confirm | 222 → 246 | 72 → 48 | **246** | **246** | 동일 ✅ |
| `1996:7` Password | 98 → 122 | 94 → 70 | **122** | **122** | 동일 ✅ |
| `1996:8` Confirm | 222 → 246 | 72 → 48 | **246** | **246** | 동일 ✅ |
| 나머지 26개 | 무변화 | 무변화 | — | — | 동일 ✅ |

- 부모 `Content`(`1858:18029`·`1996:4`)는 `layoutMode: NONE`(절대좌표) → 위 y 는 실제 위치다(오토레이아웃 재계산 아님).
- 신설 라벨은 `y=98` / `y=222` — **교체 전 인스턴스 내부 라벨이 있던 바로 그 자리**.
- 시각 대조 4쌍 일치(전=사전조사 캡처 / 후=검증자 실측): `1564:109` · `1989:550` · `1858:18029` 상·하단.

## ✅ 통과 항목 (전부 검증자 직접 실측)

| 항목 | 결과 | 근거 |
|---|---|---|
| 30개 전부 `2410:13831` 참조 | ✅ | 스냅샷 30/30 `setId` 일치 + 캔버스 재확인 `2410:13831\|local = 30`, 끊긴 인스턴스 0 |
| variant 대응 | ✅ | 30건 기계 diff — 변한 것은 `State: Editing→Focus` 6건 + `Label` 축 제거뿐. `Password Icon`·`Size`·`Message`·`Break`·textOverrides 전부 보존 |
| 잔존 `Editing` 0건 | ✅ | 555 INSTANCE `componentProperties` 스캔 0건 + 전 노드 이름 `/Editing/i` 0건 |
| 라벨 4개 문구 verbatim | ✅ | `비밀번호` ×2, `비밀번호 확인` ×2 |
| **라벨이 정본과 일치** | ✅ | `pattern-data.ts:447-452 fieldLabel()` · `:519` · `:524` 직접 대조 → x20/y98/w48/h18, x20/y222/w75/h18, `body/14M`(`S:0b8aad8c…`), Pretendard Medium 14, 간격 6(98+18+6=122) **전부 일치**. 지어낸 값 0건 |
| 라벨 폰트 | ✅ | 4개 모두 Pretendard/Medium — **데이터 스캔**, 렌더 판정 아님 |
| 라벨 색 Variable 바인딩 (H2) | ✅ | 4개 모두 `VariableID:8:1061` = `color/form-control/label/default`. 하드코딩 hex 0건 |
| 빌더가 `미확인`으로 남긴 `Domain Select` 2건 | ✅ 해소 | `1989:18954`·`1996:19307` → local `Select Box` `1654:44485`. Input 아님 — 30건에서 제외한 것은 정당 |

## ❌ (a) 1건 — 캔버스 아님, 보고서 수치

**A-1. 폰트 스캔 수치 오보 (2건 → 실제 5건).**
빌더는 비-Pretendard 2건(Inter `1587:2477`·`2241:30223`)으로 보고했으나, 전 TEXT 946개 재스캔 결과
**Noto Sans KR 3건이 추가**(`1587:2217`·`1587:2245`·`1587:2276`, 전부 `암호가 일치하지 않습니다.`).
`fontName === figma.mixed` 라 세그먼트를 펴야 보이는데 빌더 스캔이 mixed 를 처리하지 않았다.

> ⭐ 후속 확인: 정본 절차서 `.claude/skills/figma-library-build/references/figma-font-scan.md:31` 은
> `getStyledTextSegments(['fontName'])` 를 **이미 명시**하고 있다 → **절차서 결함이 아니라 빌더의 절차 미준수.**
> 절차서는 수정하지 않았다. `reports/repeated-requests.json` 에 `agent-substitutes-own-scan-for-canonical-procedure` 신설.
> **조치:** `node-map-swap.json` 의 수치를 5건으로 정정 완료.

※ 5건 **모두 이번 작업 범위 밖의 기존 레거시 노드**다. 신설 라벨 4개 + 교체 인스턴스 30개 범위 내 비-Pretendard 는 **0건**.

## 🟡 (b) 1건 — 유지 + 보고

**B-1. SIGNUP/4·4a1 의 CTA 가 Password Confirm 필드를 덮는 것은 pre-existing 이 맞다.**

| | CTA | Confirm 필드 |
|---|---|---|
| SIGNUP/4 | `1858:18081` y 2792~2840 | `1858:18061` y **2795~2843** |
| SIGNUP/4a1 | `1996:10` y 3692~3740 | `1996:8` y **3695~3743** |

교체 전에도 필드는 abs 2795 였고 CTA(`rel y 392`)는 이번에 건드리지 않았다 → **겹침 범위 전후 완전 동일.**
이번 작업이 만든 문제가 아니다. 빌더가 손대지 않은 판단은 타당. **river 보고 대상.**

## ❓ (c) 1건 — river 확인 필요

**C-1. 같은 페이지에 허용목록 밖 remote Input 부품 20건이 남아 있다.** 30건 범위 밖이라 위반 단정하지 않는다.

| 소속 화면 | 건수 | 컴포넌트 | remote key |
|---|---|---|---|
| `2.1 로그인` | 12 | `m_Input box` | `0839ea7c…` |
| `Section 1` | 4 | `m_Input box` | `8d5836c2…` |
| `1.2 모바일 앱(만 14세 미만 가입 불가)` | 4 | `m_email_input` | `e4f3f8cb…` |

네 키 모두 `registry/figma/allowed-remote-keys.json` 에 없다(이름이 아니라 **키로** 확인).
A-1 의 Noto 3건(`1587:*`)도 같은 레거시 무리다.
→ **확인 사항: "로그인·회원가입 시안"이 `Pattern / App Login`·`Pattern / Mobile Web Signup` 두 프레임만 뜻하는지,
아니면 `2.1 로그인` 같은 레거시 원본 화면까지 포함하는지.** 전자면 이번 작업 범위 완결, 후자면 20건 추가 교체가 남는다.

## 미확인 / 프로세스 지적

- **기계검사 표가 spawn 시 제공되지 않았다**(⭐ 책임). 이 시나리오의 결정론 검사기가 `snapdiff` 하나뿐이라 반려 왕복 대신 진행했다. 다음 spawn 부터 첨부할 것.
- **`npm run snapdiff` 를 이 스냅샷에 돌릴 수 없다** — 스크립트는 `nodes` 키 객체를 요구하는데 스냅샷은 `instances` 배열이다(`scripts/figma-snapshot-diff.js` `loadSnapshot` 이 `nodes` 없으면 exit 2). 대신 30건 필드별 diff 를 직접 실행했다.
- 그래서 **"계획 밖 변경 0"의 증명 범위는 「30개 인스턴스 + 그 부모 프레임」에 한정된다.**
  부모 `childCount` 는 라벨이 들어간 `1858:18029`·`1996:4`(4→6)만 변했고 나머지 부모는 전부 동일 → 해당 컨테이너 내 형제 추가·삭제·재배치 0건.
  **페이지 전역 부수 변경은 전(前) 스냅샷이 없어 미확인.** 다음 작업부터 `snapdiff` 호환 형식(`nodes`)으로 뜨면 이 사각지대가 사라진다.
