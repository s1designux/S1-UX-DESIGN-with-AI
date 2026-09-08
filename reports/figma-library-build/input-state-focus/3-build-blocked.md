# 3단계 — 빌드 중단 (🏗️ figma-library-builder, 2026-09-08)

**상태: `blocked-no-writes` — Figma 에 쓰기 0건.** 검문소 3 미통과(needs-decision 1건 + ⭐ 추가 발견 1건).

## 🏗️ 빌더가 멈춘 이유 — 계획서의 componentKey 가 다른 세트를 가리킨다

| | key `14386ca6…` 로 나온 것 | ⭐ 추정 `2386:52176` |
|---|---|---|
| node id | `2407:82` | `2386:52176` |
| 어느 파일 | **다른 파일**(remote·읽기전용) | 이 파일 Core → `Form Control` |
| variant 수 | 112 | **56** |
| State=Editing | 16 | **8** |
| 축 | Size × State × icon × **Lable**(오타) × Message × Break | Size × State × Message × Break |
| Size 값 | XSMALL / SMALL / MEDIUM | **XXSM / XSM / MD** |

읽기전용이라 개명 자체가 불가능. 빌더는 임의 선택하지 않고 needs-decision 으로 반환했다.

## ⭐ 정본 대조 — 어느 쪽이 현재 정본인가 (결론: `2386:52176`)

`plugins/figma-vars-installer/src/build-components.ts:904` (buildInput) 주석·선언과
재생성된 `registry/components/component-facts.json` 의 `Input.variantAxes`:

```
Size:    XXSM · XSM · MD
State:   Default · Filled · Focus · Error · Correct · Read-Only · Disabled
Message: Off · On
Break:   PC · Mobile          → 4(size×break) × 7 × 2 = 56 variant
```
소스 주석 원문: `// 핵심 매트릭스: Size × State × Message × Break. Label은 Input Slots 패턴에서 조합한다.`

→ **`2386:52176` 이 현재 정본과 정확히 일치**한다. `2407:82`(key `14386ca6…`) 는 축 이름 오타(`Lable`)·구 Size 명칭이 남은 **레거시**다.
즉 인계서의 componentKey 는 옛 세트를 가리키는 오기로 보인다.

## 🔴 ⭐ 추가 발견 — 이 작업의 전제가 어긋나 있다

인계서: "변형 값 이름을 바꾸면 이미 그려진 시안 인스턴스 17곳이 따라온다."
**그런데 그 시안들은 `2386:52176` 을 쓰지 않는다.**

| 시안 | 인스턴스가 가리키는 마스터 | 축 |
|---|---|---|
| `login-mobile` | 세트 `1546:10988` (variant `1546:10603/10655/10715/10803`) | — |
| `signup-mobile-web` | `local:1654:42156` · `1654:42198` · `1654:42136` | `Size × State × **Label** × Message × Break` |
| **현재 정본 세트 `2386:52176`** | — | `Size × State × Message × Break` (**Label 축 없음**) |

근거: `reports/screen-rebuild/modu-app/signup-mobile-web/snapshot-navbarfix-before.json`
→ `"mc": "local:1654:42156:Size=MD, State=Editing, Label=Off, Message=On, Break=Mobile"`
및 `reports/screen-rebuild/modu-app/login-mobile/canonical-manifest.json` → `"Input": {"setId": "1546:10988", …}`

시안들은 **Label 축이 아직 있던 구버전 빌드**를 인스턴스하고 있다.
→ `2386:52176` 을 개명해도 **시안 17곳은 아무 영향을 받지 않는다**(깨지지도, 따라오지도 않는다).
→ "개명하면 시안이 따라온다"는 검증 목표는 **이 세트로는 성립하지 않는다.**

⚠️ **미확인:** 위 판단의 근거는 저장소에 남은 **과거 기록**이다. `1546:10988` 은 get_metadata 로 직접 열리지 않았다
(`invalid node selection`). 살아있는 Figma 에서 시안이 지금 무엇을 가리키는지는 **아직 확인하지 못했다.**

## 검문소 3 — ❌ 미통과. river 결정 대기 (HD-2 / HD-3)
