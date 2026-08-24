# 변경 전/후 구조 스냅샷 대조 (Snapshot Diff)

## 왜 하나

"빌더가 의도한 것만 바꿨나"를 **전수 재스캔 없이** 증명하기 위해서다.

- **종전:** 검증자가 변경 후 상태를 처음부터 전부 읽어 기억·옛 보고서와 대조했다. 비싸고(2026-08-24 사례 128K 토큰), 그러고도 검증자가 *"변경 전 스크린샷이 없어 '시각 부수 피해 0'은 이미지 비교가 아니라 기하값+육안으로 판정"* 이라는 사각지대를 스스로 보고했다.
- **지금:** 빌드 **전**과 **후**에 같은 코드로 스냅샷을 뜨고 기계가 diff 를 낸다. 검증자는 **"diff 가 기대 선언과 일치하는가"** 만 본다.

**이건 검증을 줄이는 게 아니라 늘린다.** 기준선이 생기므로 "아무 데도 안 건드렸다"를 처음으로 *증명*할 수 있다. 종전엔 주장만 가능했다.

## 언제 하나

**기준 선언이 `existing-nodes` 를 포함하는 모든 작업**(= 이미 있는 노드를 고칠 때). 신규 생성만 있는 경우는 before 가 비어 있어 의미가 적으므로 면제된다.

> **레거시 유무와는 무관하다.** 이 스냅샷은 *레거시 원본*이 아니라 *우리 파일의 변경 전 상태*다. 레거시 없이 만든 화면을 나중에 고칠 때도 똑같이 필요하다. 기준 선언 3종은 `SKILL.md` 0단계 참조.

| 시점 | 담당 | 할 일 |
|---|---|---|
| 빌드 직전 | 🪞 빌더 (첫 쓰기 **전**) | 스냅샷 캡처 → `snapshot-before.json` |
| 매핑 확정 시 | 🎩 오케스트레이터 | 기대 선언 작성 → `snapshot-expect.json` |
| 빌드 직후 | 🪞 빌더 | 스냅샷 캡처 → `snapshot-after.json` |
| 검증 | 🤖 component-verifier | `figma-snapshot-diff` 실행 + 렌더 표본 대조 |

> ⚠️ **before 를 안 뜨고 빌드를 시작했으면 그 회차는 diff 로 증명할 수 없다.** 빌더의 첫 `use_figma` 쓰기 이전에 반드시 캡처한다.

## 1. 캡처 (use_figma 코드 템플릿)

`ROOT_ID` 만 바꿔 그대로 실행한다. **읽기 전용**이다.

```js
const ROOT_ID = "1562:2";          // 대상 섹션/프레임
const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) throw new Error("루트 없음: " + ROOT_ID);

const num = (v) => (typeof v === "number" ? Math.round(v * 100) / 100 : undefined);

function fillOf(n) {
  const f = n.fills;
  if (!Array.isArray(f) || !f.length) return undefined;
  const p = f[0];
  if (!p || p.visible === false) return undefined;
  const bv = p.boundVariables && p.boundVariables.color;
  if (bv && bv.id) return "var:" + bv.id;              // 변수 바인딩 = 정상
  if (p.type === "SOLID" && p.color) {                  // raw hex = 하드룰 H2 위반 후보
    const h = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
    return "#" + h(p.color.r) + h(p.color.g) + h(p.color.b);
  }
  return p.type;
}

const nodes = {};
const walk = (n, parentId, idx) => {
  const e = { n: n.name, t: n.type, p: parentId, i: idx };
  if ("x" in n) { e.x = num(n.x); e.y = num(n.y); e.w = num(n.width); e.h = num(n.height); }
  if ("layoutMode" in n && n.layoutMode !== "NONE") { e.lm = n.layoutMode; e.is = num(n.itemSpacing); }
  if ("layoutPositioning" in n && n.layoutPositioning === "ABSOLUTE") e.lp = "ABSOLUTE";
  const f = fillOf(n); if (f) e.f = f;
  if (n.type === "TEXT") {
    e.tx = n.characters;
    e.ts = typeof n.textStyleId === "string" ? n.textStyleId : "(mixed)";
    e.fn = typeof n.fontName === "object" && n.fontName ? n.fontName.family + "/" + n.fontName.style : "(mixed)";
  }
  nodes[n.id] = e;
  if ("children" in n) n.children.forEach((c, i) => walk(c, n.id, i));
};
walk(root, null, 0);

return JSON.stringify({
  meta: { fileKey: figma.fileKey, rootId: ROOT_ID, label: "before", capturedAt: new Date().toISOString() },
  nodes
});
```

반환된 JSON 문자열을 `reports/screen-rebuild/{service}/{flow}/snapshot-before.json` 으로 저장한다. 빌드 후에는 `label` 만 `"after"` 로 바꿔 같은 코드를 돌리고 `snapshot-after.json` 으로 저장한다.

> **인스턴스 내부까지 담긴다.** `children` 을 끝까지 내려가므로 인스턴스 내부 오버라이드 변경도 diff 에 잡힌다 — 종전 검증자가 "인스턴스 내부 깊이는 대조 못 함"으로 남기던 사각지대가 닫힌다.

## 2. 기대 선언 (`snapshot-expect.json`)

**무엇을 바꿀 것인지 미리** 적는다. 여기 없는 변경은 전부 위반이다.

```json
{
  "added":   [{ "name": "sep", "type": "RECTANGLE", "count": 22 }],
  "removed": [],
  "changed": [
    { "field": "is", "count": 11, "note": "itemSpacing 16→8" },
    { "field": "x",  "count": 22, "note": "가운데 정렬 재계산(좌우 링크 각 1px)" },
    { "field": "i",  "count": 22, "note": "sep 삽입으로 뒤 자식 순서 밀림" }
  ]
}
```

- `added`/`removed` 는 `name`·`type`·`count` 로 묶는다(`name`·`type` 생략 시 와일드카드).
- `changed` 는 속성 `field` 단위 + 개수. 필드 약어는 캡처 코드와 같다(`x`·`y`·`w`·`h`·`i`=자식순서·`is`=itemSpacing·`f`=채움·`tx`=문구·`ts`=텍스트스타일·`fn`=폰트).
- **개수까지 맞아야 통과한다.** 11개 화면을 고칠 생각이었는데 12건이 바뀌었으면 잡힌다.

> 기대 선언은 **매핑(2단계)에서 오케스트레이터가** 쓴다. 빌더가 결과를 보고 나중에 채우면 자기 결과를 자기가 정당화하는 것이라 의미가 없다.

## 3. 대조

```bash
npm run snapdiff -- reports/screen-rebuild/{service}/{flow}/snapshot-before.json \
                    reports/screen-rebuild/{service}/{flow}/snapshot-after.json \
                    --expect reports/screen-rebuild/{service}/{flow}/snapshot-expect.json
```

- 종료코드 **0** = 선언 밖 변경 0건
- 종료코드 **1** = 의도하지 않은 변경 있음 → **검문소 4 통과 불가**
- `--expect` 없이 돌리면 보고만 하고 판정하지 않는다(탐색용).
- `--json` 은 기계 판독용 출력.

## 4. 검증자(🤖)가 이걸로 대체하는 것 / 대체하지 않는 것

| 종전 방식 | diff 도입 후 |
|---|---|
| 대상 프레임 자식 전수 전사 | **diff 요약으로 대체** |
| 형제·상위 노드 좌표를 옛 기록과 대조 | **diff 로 대체** (기록이 stale 이어도 무관) |
| 인스턴스 내부 깊이 미대조(사각지대) | **diff 가 커버** |
| 섹션 전체 provenance·폰트 스캔 | **유지** — diff 는 스냅샷에 담은 필드만 본다 |
| 대표 화면 렌더 육안 대조 | **유지** — 기하값이 같아도 시각이 깨질 수 있다 |
| 정본 규격과의 대조(값이 맞나) | **유지** — diff 는 "안 바뀐 것"을 증명할 뿐, "바뀐 값이 옳은지"는 판정하지 않는다 |

**핵심 경계:** diff 는 *부수 피해가 없음*을 증명한다. *의도한 변경이 정본 규격에 맞는지*는 여전히 검증자가 정본과 대조해 판단한다.
