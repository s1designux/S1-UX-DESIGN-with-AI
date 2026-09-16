# 쪽지 — 부품이 "달라졌는지" 재는 방식 고치기 (새 세션용)

> ✅ **2026-09-16 완료.** river 승인("다 묶는 걸로 하고, 글자 변화도 잡고, 빌려쓰는 것도 같이 올려")으로
> 대응표를 `registry/governance/component-fingerprint-map.json` 에 선언하고, 지문 계산을
> `scripts/lib/canonical-fingerprint.js` 한 곳으로 옮겼다(번호·빌드 양쪽이 같은 모듈을 쓴다).
> 적대 시험 = `node scripts/component-fingerprint-selftest.js` (6가지 전부 통과).
> 아래 내용은 착수 당시의 기록이다.

작성 2026-09-15 · 요청: river "검사기 재는 방식은 새 세션에서 고치게 쪽지줄래"
앞 작업: Q9 에서 (A) 번호 유지로 넘겼고, (C) 이 일이 남았다.

## 한 줄

**배포본 번호 검사기가 "이 부품이 달라졌나"를 파일 한 장 통째로 재고 있다. 부품 하나하나로 재게 바꾼다.**

## 왜 필요한가 — 실제로 막혔던 일

2026-09-15 에 설치기에서 **부품 놓는 자리 계산 한 곳**을 고쳤다. 부품의 색·크기·모양은 하나도 안 건드렸고 개발자가 받아 가는 배포본도 글자 하나 안 바뀌었다.

그런데 Gate 50 이 **부품 27종 전부 번호를 올리라**며 커밋을 막았다. 그날은 river 결정으로 `--refresh`(번호 유지·지문만 갱신)로 넘겼다. **원인은 그대로 남아 있다.**

같은 일이 또 온다. `build-components.ts` 는 상시 편집되는 파일이고, 주석 한 줄만 고쳐도 27종이 전부 "달라짐"이 된다.

## 지금 어떻게 재고 있나

`scripts/ui-library-version.js:70-78`

```
function canonicalFingerprint(manifest) {
  for (const relative of manifest.canonicalSources) {
    digest.update(파일 내용 전체);   // ← 슬라이스도 정규화도 없다
  }
}
```

`ui-library/src/components/*/manifest.json` **27개 전부**가 `canonicalSources` 에 `build-components.ts` 를 넣고 있다. 그래서 그 파일이 1바이트라도 바뀌면 27종 지문이 같이 뒤집힌다.

게이트 배선은 `scripts/gate-check.js:1228-1241`.

`ui-library-version.js:42-44` 의 주석이 **이 성질을 이미 알고 있다** — 그래서 `--only`(짚은 것만 올리기)와 `--refresh`(번호 유지) 가 붙어 있다. 사람이 매번 손으로 짚어 주는 구조를 기계로 바꾸는 것이 이 일이다.

## 재료는 이미 있다

`registry/components/component-facts.json` — **정본을 흉내내 실행해 부품별로 뽑아낸 실측**이다. 손편집이 아니고, Gate 9e 가 재생성 대조로 지킨다.

- `components` 아래 **49개 세트**가 이름별로 들어 있다.
- 세트 하나마다 `variantAxes` · `geometry` · `anatomy` · `tokenBindings` · `composition`.

즉 "이 부품이 달라졌나"에 답할 수 있는 데이터가 이미 부품별로 나뉘어 있다.

## ⚠️ 함정 3개 — 이걸 모르고 시작하면 헛수고한다

### ① 이름이 1:1 로 안 맞는다 (가장 큰 것)

배포본 부품 **27개**(`button`·`select`·`tab` …)와 실측 세트 **49개**(`Button`·`Select Box`·`Line Tab`·`Line Tab Set` …)는 **대응표가 선언돼 있지 않다.** manifest 에도 그 칸이 없다(`id`·`canonicalSources` 뿐).

쉬운 것도 있지만(`button` → `Button`) 여러 개가 묶이는 것이 많다:

| 배포본 부품 | 붙을 세트 후보 |
|---|---|
| `table` | `Table` · `Table Cell` |
| `pagination` | `Pagination` · `Pagination Cell` |
| `dropdown` | `Dropdown` · `Dropdown List` |
| `multi-toggle` | `Multi Toggle` · `Multi Toggle Element` |
| `time-picker` | `Time Picker` · `Time Picker Cell` · `Time Picker Dropdown` · `Time Picker Mobile Bottom Sheet` |
| `date-picker` | `Date Picker` · `Calendar` · `Calendar Cell` · `Calendar Tile` · `Date Picker Mobile Bottom Sheet` |
| `gnb` | `GNB` · `GNB Menu` · `GNB Utility Icon` |
| `select` | `Select Box` |
| `textarea` | `Text Area` |
| `tab` | `Line Tab` · `Line Tab Set` |
| `input` | `Input` · `Search Input` ? |

**이 대응표를 ⭐ 가 짐작으로 만들면 안 된다(하드룰 H6②).** 이름 비슷한 것끼리 묶는 순간, 잘못 묶인 부품은 정본이 바뀌어도 번호가 안 올라가고 아무도 모른다 — **지금보다 나쁜 상태**다.

→ 후보표를 만들어 **river 승인을 받고**, 승인된 표를 `manifest.json` 이나 별도 정본에 **선언**한다. 그 뒤에 기계가 그 선언만 읽게 한다.

### ② 실측에 안 담기는 변화가 있다

`component-facts.json` 은 **글자 내용을 담지 않는다.** 실측했다:

- `Button` 항목에 `characters`·`text` 같은 칸이 **없다**. 부품 안에 박힌 한글 리터럴("라벨"·"안내 메세지")이 바뀌어도 facts 는 그대로다.
- `anatomy` 가 **빈 배열인 부품이 있다**(`Button` 이 그렇다). 칸은 있는데 안 채워진 곳이 있다.

지문을 facts 로만 만들면 **이 변화들이 통째로 안 보이게 된다.** 지금은 파일 통째 해시라 (과하게나마) 잡히던 것들이다.

→ 무엇으로 덮을지 같이 정해야 한다. 안 정하면 **검사기를 약화시키는 변경**이 되고, 그건 금지 행동이다(`CLAUDE.md` §금지 행동).

### ③ 게이트를 고치는 일이다

`gate-check.js` 와 판정 기준을 건드린다. **river 승인 없이 체크 항목을 약화하는 것은 금지**다. 계획을 한 번 보여주고 OK 를 받은 뒤 실행한다.

## 하는 방법 (제안 — 순서만)

1. **대응표 후보를 만든다.** 27 ↔ 49 를 붙이고, 애매한 것은 애매하다고 표시한다. 근거는 `build-components.ts` 의 `BUILD_DEPENDENCIES` 와 각 부품 manifest 의 `dependencies` 에서 찾는다 — **짐작 금지.**
2. **river 에게 한 번에 올린다.** 표 + 애매한 것 목록 + ②의 "글자 변화는 무엇으로 덮을까" 질문.
3. 승인된 표를 **선언으로 남긴다**(manifest 또는 `registry/governance/` 아래 새 정본 — 어디에 둘지도 승인 사항).
4. `canonicalFingerprint()` 가 파일 전체 대신 **그 부품 몫의 facts + 그 부품 자신의 registry json** 을 해시하게 바꾼다.
5. **적대 시험을 먼저 짠다.** (가) 부품 하나만 고치면 그 하나만 번호가 오르나 (나) 주석만 고치면 아무것도 안 오르나 (다) ②의 글자 리터럴을 바꾸면 **무엇이 잡나**. (다)가 아무것도 못 잡으면 4번으로 가면 안 된다.
6. `npm run gate:check` 통과 + Gate 50 이 실제로 좁게 잡는지 확인.

## 산출물

- 대응표 정본 1개(승인 뒤)
- `scripts/ui-library-version.js` 수정
- 적대 시험 기록
- river 에게 올릴 질문: 대응표 애매한 것 + 글자 변화 대책

## 관련

- 반복 패턴 `reports/repeated-requests/patterns/canon-file-hash-flags-untouched-components.json` — 이 문제의 장부
- `reports/handoff-audit/1-status.md` §11-b Q9 — 2026-09-15 에 (A) 로 넘긴 경위
- Gate 9e (`scripts/gate-check.js` · `scripts/gen-component-facts.js`) — facts 를 손편집에서 지키는 자물쇠. 이 일이 facts 에 기대므로 **9e 가 먼저 있어야 한다**(이미 있다)
- `CLAUDE.md` 하드룰 H6② · §금지 행동
