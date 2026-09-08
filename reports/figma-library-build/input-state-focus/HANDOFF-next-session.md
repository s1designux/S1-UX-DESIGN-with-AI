# 새 세션 인계 프롬프트 — Input 개명 후속 3건

아래 블록을 **새 세션에 그대로 붙여넣으면** 된다.

---

S1-UX-DESIGN-with-AI 저장소. 2026-09-08 에 끝난 **Input 상태 이름 `Editing` → `Focus` 개명**의
후속 3건을 진행한다. 앞 세션 산출물은 `reports/figma-library-build/input-state-focus/` 에 있고,
`6-swap-verification.md`(🤖 검증 결과)와 `HANDOFF-next-session.md`(이 문서)를 **먼저 읽어라.**

## 앞 세션에서 끝난 것 (다시 하지 마라)
- 정본·파생·웹 전 표면의 `Editing` → `Focus` 개명 완료. 잔존 0건.
- Figma Input 세트 = **`2410:13831`** (파일 `cysG5U1udpQqVagYY1hWHW`, Core 페이지 `5:5706`).
  56 variant · 축 `Size × State × Message × Break` · `State=Focus` 8개.
- 로그인·회원가입 시안 Input **30개**를 이 세트로 교체 완료. 화면 동일성 좌표 검증 통과.
  라벨 4곳은 정본 방식대로 외부 TEXT 분리(`pattern-data.ts` `fieldLabel()` 값과 100% 일치).
- Gate 13 기록 완료(🤖 component-verifier, structural).

## 진행할 일

### 1️⃣ [river 답변 대기 중] 레거시 화면의 옛 Input 20개
같은 페이지(`173:2431`)에 **허용목록 밖 remote 부품**을 쓰는 Input 이 20개 더 있다.

| 화면 | 건수 | 컴포넌트 | remote key |
|---|---|---|---|
| `2.1 로그인` | 12 | `m_Input box` | `0839ea7c…` |
| `Section 1` | 4 | `m_Input box` | `8d5836c2…` |
| `1.2 모바일 앱(만 14세 미만 가입 불가)` | 4 | `m_email_input` | `e4f3f8cb…` |

네 키 모두 `registry/figma/allowed-remote-keys.json` 에 없다(이름 아닌 **키로** 확인).
**river 에게 먼저 물어라: 이 레거시 원본 화면들도 정본 세트로 교체할 것인가?**
- 교체한다면 `screen-rebuild` 스킬로, baseline=`existing-nodes`, **변경 전 스냅샷 필수**.
  앞 세션과 동일하게 빌드=🪞 `screen-rebuilder` / 검증=🤖 `component-verifier` **분리 spawn**(하드룰 H1).
- river 가 "레거시는 둔다"고 하면 이 항목은 종료로 기록만 남긴다.

### 2️⃣ 세트 배경판 raw `#FFFFFF` (river 가 별도 건으로 분리 결정)
`plugins/figma-vars-installer/src/build-components.ts:678` `decorateSetFlat` 이
`specPalette(false).bg` 를 raw 흰색으로 넣는다. `figma-binding-lookup.js` 판정 **EXACT**(`color/bg/level-0`).
- **2026-06-11 커밋부터 선존**이며 **모든 컴포넌트 세트 공통** — Input 개명과 무관하다.
- 고치면 전 세트에 파급되므로 단독 작업으로 진행하고, 검증은 🤖 분리.

### 3️⃣ 설치기 재실행이 인스턴스 연결을 끊는 구조 문제 (river 가 먼저 제기)
설치기는 재실행마다 Core 세트를 **지우고 새 id·새 key 로 다시 만든다**.
이번에도 Core 페이지 노드 2141개 중 **2140개가 교체**됐고, 파일에 **고아 마스터 세대가 최소 7개** 쌓여 있다.
이번엔 소비자가 없어 무사했을 뿐이고, 시안 30개가 바로 그 "운이 나빴던" 사례였다.

앞 세션이 river 에게 제시한 선택지(아직 미결):
- **A. 설치기를 멱등하게** — 기존 세트를 key 로 찾아 **제자리 수정**. 근본 해결, 비용 큼(설치기 구조 변경)
- **B. 설치 후 자동 재바인딩** — 옛 세대를 가리키던 인스턴스를 새 세트로 옮기는 뒷정리 단계. 중간 비용
- **C. 설치 전후 대조 검사** — 무엇이 끊겼는지 즉시 보고만. 못 막지만 조용히 새는 것은 방지. 비용 작음

앞 세션 ⭐ 추천 = **C 먼저, 그다음 A**. B 는 A 가 있으면 불필요.
시안 30개 교체를 실제로 해 봤으니 그 경험을 근거로 A/B 비용을 다시 견적하고 river 에게 1회 확인받아라.

## 커밋 주의 (중요)
- 이 저장소는 **여러 세션이 같은 폴더를 공유**한다. 시작 전·커밋 전 `git status` 로
  **내가 만들지 않은 미커밋 변경**을 확인하고, 있으면 **내 파일만 골라 staging** 해라.
- 2026-09-08 시점 미해결: **Gate 47(검수판) 빨간불**. 해소 명령 `npm run board:refresh` 는
  다른 세션이 손으로 쓰고 있던 `reports/legacy-crosswalk-board/` 문서(NEXT.md·crosswalk.json 등)를
  덮어쓸 수 있어 앞 세션이 **일부러 돌리지 않았다.** 그 세션 작업이 정리된 뒤에 돌려라.
- 다른 세션이 `dropdown`·`select`·`filter-chip` 을 작업 중이었다. 그 3개의
  `ui-library/src/components/*/manifest.json` 의 `canonicalFingerprint` 는 앞 세션이 갱신했다가
  그쪽 편집으로 다시 stale 이 됐다 — **그쪽 작업자가 `ui:build` 로 정리할 몫**이지 건드리지 마라.

## 참고 — 되풀이되는 실패로 기록된 것
`reports/repeated-requests.json` 에 이번에 2건 신설:
- `handover-inventory-misses-enforcers` — 인계받은 "고칠 곳 목록"이 그 이름을 강제하는 **검사기**를 빠뜨린다
- `agent-substitutes-own-scan-for-canonical-procedure` — 실행 에이전트가 절차서 코드 대신 자기 방식으로
  스캔해 위반 건수를 축소 보고한다(이번엔 폰트 mixed 세그먼트 3건 누락)
