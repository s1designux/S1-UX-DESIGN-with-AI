# dist 연동 배선표 · 검증 함정 목록

> **이 문서는 규칙이 아니라 "어디를 건드려야 실제로 연결되나"와 "검증 도구가 거짓말하는 지점"만 담는다.**
> 규칙 정본은 따로 있다 — 계약 `registry/governance/ui-library-code-contract.json` · 안내 페이지 틀 `component-page-template.md §A` · 품질 항목 `registry/governance/ui-library-component-checklist.md`.
> 여기 규칙을 새로 만들지 않는다. 어긋나면 정본이 우선하고 이 문서를 고친다.
>
> 출처: 2026-08-31 Checkbox·Radio 작업에서 실제로 시간을 쓴 지점들.

---

## 1. 배선표 — 새 코어 컴포넌트 하나를 dist 로 내보내려면

체크박스처럼 **빠뜨리면 조용히 연결이 안 되는** 자리들이다. 위에서 아래 순서로 진행한다.

### 1-1. 원본 (`ui-library/src`)

| 파일 | 비고 |
|---|---|
| `components/{id}/{id}.css` | 공개 selector 는 `[data-s1-component="{id}"]` 범위 안에서만 |
| `components/{id}/{id}.js` | 런타임이 없어도 **파일은 반드시 있어야 한다**(빌드가 무조건 읽는다). 없으면 `jsRequired:false` + `runtime:null` 3줄 |
| `components/{id}/{id}.example.html` | 코드탭·배포 예시의 원본 |
| `components/{id}/manifest.json` | `canonicalFingerprint` 는 아래 명령으로 계산 |
| `assets/icons/{icon}.svg` + `assets/icons/manifest.json` | 아이콘을 쓸 때만. 바깥 frame SVG + 안쪽 `data-s1-part="glyph"` SVG **2겹 구조 필수** |

`canonicalFingerprint` 계산 (manifest 의 `canonicalSources` 를 순서대로 이어붙인 sha256):

```bash
node -e '
const {createHash}=require("crypto"),fs=require("fs");
const id=process.argv[1];
const m=JSON.parse(fs.readFileSync(`ui-library/src/components/${id}/manifest.json`,"utf8"));
const d=createHash("sha256");
for(const r of m.canonicalSources){d.update(r+"\0");d.update(fs.readFileSync(r,"utf8"));d.update("\0");}
console.log(d.digest("hex"));
' <id>
```

### 1-2. 생성 경로 — **여기 3곳을 빠뜨리면 dist 에 안 나온다**

| 파일 | 무엇을 |
|---|---|
| `ui-library/scripts/build.mjs` | `componentIds` 배열에 `{id}` 추가 |
| `ui-library/scripts/test.mjs` | `componentIds` 배열에 추가 + 그 컴포넌트 계약 검사 추가 |
| `ui-library/package.json` | `exports` 에 3줄 (`./components/{id}`, `/css`, `/html`) |

### 1-3. 소비자

| 파일 | 무엇을 |
|---|---|
| `ui-library/src/verification/empty-consumer.html` | 전체 묶음 소비 예시 |
| `ui-library/src/verification/empty-consumer-individual.html` | 개별 설치 예시. **`<main>` 안 DOM 이 위 파일과 완전히 같아야 한다**(검사기가 대조한다). 로딩 방법만 달라야 한다 |
| `pages/ui-review.html` | river 검수 섹션 |
| `assets/js/ui-library-guide.js` | `componentConfig` 항목 + `stateMatrix()` 분기 |
| `pages/components.html` | 빈 mount + `<!-- Approved {Name} guide: … -->` 마커 + `comp-nav` 버튼 `disabled` 해제 |

### 1-4. 등록부

| 파일 | 무엇을 |
|---|---|
| `registry/components/{id}.json` | 의미·행동·접근성. **`a11yStatus` 가 `pending`·`planned`·`not-defined` 면 approved 배포 불가** — 착수 시 먼저 확인 |
| `registry/governance/component-presentation-policy.json` | `"managedBy": "ui-library-guide"` — **안 붙이면 Gate 23 이 "Action 영역 없음" 위반으로 막는다**(정적 파서가 JS 렌더를 못 봐서) |
| `registry/governance/ui-library-migration.json` | 이행 장부 레코드 |
| `reports/ui-library/{work-id}/` | `workflow-state.json` + 1~6 보고서 + `screens/` |

### 1-5. 검사 순서

```bash
npm run ui:contract        # 계약
npm run ui:icons           # 아이콘 frame/glyph
npm run ui:build           # 생성 (실패하면 대개 지문 문제 → §3)
npm run ui:test            # 계약·파리티·가이드 배선
npm run gate:check         # 저장소 전체 게이트
npm run ui:state -- reports/ui-library/{work-id}/workflow-state.json
```

`registry/components/*.json` 을 고쳤으면 파생 검사도 함께:
`components:facts:check` · `components:guide-model:check` · `design:md:check` · `components:behavior:check`

---

## 2. 검증 함정 — 도구가 거짓 결과를 주는 지점

**"안 보인다 / 안 바뀐다"가 구현 문제인지 도구 문제인지 먼저 가른다.**

### T1. `file://` 에서는 마스크 아이콘이 안 그려진다 ⚠️ 가장 위험

`npm run shot` 의 기본은 `file://` 이다. CSS `mask` 로 그리는 아이콘(체크 표시·remove 등)은 **통째로 안 보인다**. 구현 오류로 오인하기 쉽다.

- 확인법: 이미 승인된 다른 마스크 아이콘도 같이 안 보이면 도구 문제다.
- 해결: **http 로 렌더한다.**

### T2. `file://` 에서는 ES module 이 아예 안 돈다

`pages/ui-review.html`·`pages/components.html` 처럼 `import` 를 쓰는 화면은 `file://` 에서 **내용이 텅 빈 채로** 찍힌다. 반드시 http.

```bash
# 서버 (다른 세션이 이미 켰을 수 있다 — 먼저 curl 로 확인)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4173/pages/components.html
```

### T3. 브라우저가 옛 CSS·JS 를 붙잡는다 ⚠️ 가장 자주 걸린다

python `http.server` 는 캐시 헤더를 안 줘서 브라우저가 예전 파일을 계속 쓴다. **고쳤는데 안 고쳐진 것처럼 보인다.**

- 가장 확실: `npm run shot`(매번 새 프로필로 뜨는 headless) 결과를 믿는다.
- 브라우저에서 확인해야 하면 **호스트를 바꿔 캐시 칸을 갈아탄다**: `localhost` ↔ `127.0.0.1` ↔ `[::1]`
- 특정 CSS 만 즉시 갱신: `link.href = link.href.split("?")[0] + "?bust=" + Date.now()`

### T4. `#앵커` 스크린샷이 빈 화면으로 나온다

JS 가 내용을 그리기 **전에** 앵커로 스크롤해서, 나중에 내용이 늘어나면 화면 끝 빈 곳에 멈춰 있다. `--screenshot-full-page` 도 뷰포트까지만 찍힌다.

- 해결 ①: 창 높이를 크게 (`--window-size=1400,1500`)
- 해결 ②: 상태 전수 대조는 **실제 dist CSS 만 물린 정적 매트릭스 페이지**를 임시로 만들어 찍는다(런타임 없는 컴포넌트에 특히 좋다)
- 해결 ③: 다크 화면은 localStorage 를 심고 넘기는 임시 페이지로 (테마가 localStorage 에 저장된다)

### T5. 같은 마크업을 두 곳에 붙이면 상태가 조용히 풀린다

PC·Mobile 두 섹션에 같은 문자열을 넣으면 `id` 와 라디오 `name` 이 페이지 안에서 중복된다. **같은 name 의 라디오는 하나만 선택될 수 있어 먼저 그려진 쪽 선택이 사라진다.** 자동 검사는 전부 통과한다.

- 자리마다 새로 생성한다.
- 렌더 후 확인: 페이지 전체 중복 `id` 0개.

### T6. 검사기가 "미계측"이라고 하면 그건 PASS 가 아니다

Gate 23 은 JS 로 그린 화면을 못 본다. `managedBy: ui-library-guide` 를 붙이면 위반이 아니라 **미계측**으로 빠진다 — 그 대신 **Action 영역 존재를 실제 렌더로 직접 확인**해야 한다. 미계측을 통과로 보고하지 않는다.

### T8. Figma 의 회전 각도를 CSS 에 그대로 옮기면 방향이 반대가 된다 ⚠️ 조용한 실패

Figma `rotation` 은 **반시계 방향이 양수**, CSS `transform: rotate()` 는 **시계 방향이 양수**다. 부호 규약이 반대라
**같은 숫자를 그대로 옮기면 정확히 반대 방향**이 된다. 정본·주석·문서가 전부 "아래"라고 말하는데 화면만 위를 향한다.

- 실제 사고: 모바일 헤더 아래화살표. 정본 `rotation=-90`(= 아래)을 CSS `rotate(-90deg)`(= 위)로 옮겨 배포됐다(2026-09-02 F-2).
- 규칙: **각도는 숫자를 옮기지 말고 "어느 쪽을 향해야 하는가"를 옮긴다.** CSS 각도 = Figma 각도 × -1.
- 검사기가 못 잡는다(값·토큰·구조는 전부 정상). **렌더를 눈으로 보는 수밖에 없다.**

### T9. 부품 CSS 가 부르는 자산이 dist 에 없어도 조용히 회색으로 나간다

CSS `mask: url(...)` 이 404 면 브라우저는 오류를 띄우지 않고 **전부 마스크아웃** 한다. 그 아래 깔린 색만 보여서
"색만 잘못 나온" 것처럼 보인다(2026-09-02 F-3: 알림 빨간 점이 회색으로 배포).

- 원인 자리: `ui-library/scripts/build.mjs` 는 **icon manifest 에 등재된 자산만** dist 로 복사한다. 등재 = 배포 통로다.
- 지금은 `ui:test` 가 **dist CSS 의 모든 `url()` 이 실제 파일로 풀리는지** 확인한다(2026-09-02 신설, 적대 테스트로 재현 확인).
- 아이콘 1개에 2색이 필요하면(정본이 본체색+별색을 주는 경우) 조각을 새로 그리지 말고 **등록된 원본에서 떼어낸 파생 레이어**로 선언한다
  (`derivedFrom` + `derivationRule`) — 검사기가 부모에서 규칙대로 재현해 바이트 일치를 매번 증명한다.

### T7. 눈으로 확인해야만 잡히는 것들

자동 검사가 전부 PASS 여도 아래는 못 잡는다. 승격 전 실제 렌더로 본다.

- 선택 상태가 실제로 선택돼 보이는가 (T5)
- 필수/선택 부품 분류가 맞는가 (registry `part` 의 `(선택)` 표시 기준)
- Light·Dark 양쪽에서 글자가 읽히는가
- 콘솔 오류 0건

---

## 3. 정본 지문이 바뀌어 빌드가 막혔을 때

`ui:build` 가 `canonicalFingerprint is stale` 로 멈추면, **지문부터 갱신하지 말고 영향 범위를 먼저 본다.**

```bash
git diff -U0 plugins/figma-vars-installer/src/build-components.ts | grep '^@@'
```

| 변경 범위 | 처리 |
|---|---|
| 내 컴포넌트 빌더와 **무관** | 지문만 갱신. 이전 검증은 유지하되 **판단 근거(hunk 범위)를 상태 파일 `decisions` 에 남긴다** |
| 내 컴포넌트 빌더가 **바뀜** | 이전 검증을 `superseded` 로 돌리고 3-build 로 되돌아간다 |

`reports/ui-library/{work-id}/workflow-state.json` 의 `canonicalInputs` 도 같이 갱신한다(안 하면 `ui:state` 가 막는다).

---

## 4. 착수할 때 5분 점검

- [ ] `npm run ui:state -- <workflow-state.json>` — 지문·소유자 확인
- [ ] `npm run ui:test` — **이미 실패해 있지 않은지**. 다른 작업이 검사기만 강화하고 화면을 안 고친 채 끊겨 있을 수 있다(멀티 세션 환경)
- [ ] `registry/components/{id}.json` 의 `a11yStatus` 가 `pending` 이 아닌지
- [ ] registry 설명이 정본에 없는 상태를 전제하지 않는지 (체크박스 부분선택 같은 사례) — 있으면 `needs-decision`
