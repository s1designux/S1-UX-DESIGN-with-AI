# 정본 타이포 점검 — "텍스트 스타일을 안 쓴 곳" 전수

- 날짜: 2026-09-02 · 요청: river ("설치기 정본이 13px이라니 잘못됐다. 텍스트 스타일 미적용 컴포넌트도 마저 검토")
- 대상: `plugins/figma-vars-installer/src/build-components.ts` 의 모든 텍스트 생성 지점
- 기준: `plugins/figma-vars-installer/src/textstyles-data.ts` — 정본 텍스트 스타일은 **10 · 12 · 14 · 16 · 18 · 20 · 24 · 32** 8종뿐(13 없음)

## 1. 핵심 — 13px 은 정본에 실체가 없다

`textStyleKey()`(build-components.ts:54-63)가 **13을 자동으로 14로 바꿔** 텍스트 스타일을 물린다.

```
if (size === 13) size = 14;   // :57
```

`makeBoundText` 는 raw `fontSize` 를 먼저 넣고 그 위에 `setTextStyleIdAsync` 로 스타일을 덮으므로(:613-621), **Figma 결과물의 글자는 14px(body/14R·body/14M)** 이다. 코드에 적힌 13은 화면에 나오지 않는 죽은 값이다.

| 13이 적힌 곳 | 실제 결과 |
|---|---|
| `buildTableCell` SM 행 (:1968) | body/14 |
| `buildTable` fallback 글꼴 (:2135) | body/14 |
| `buildWebTabBar` 2곳 (:5175~) | body/14 |

**결론: 표의 작은 행(sm) 글자는 14px 이 정본이다.** 앞서 올린 HD-5 는 (A) 14px 유지가 정답이며, 새 토큰은 필요 없다. 코드의 `13` 표기는 오해를 부르므로 14로 정정하는 것이 맞다(정정해도 Figma 결과물은 변하지 않는다).

## 2. 같은 함정 — 코드 숫자와 실제 결과가 다른 곳 2건 더

| 위치 | 코드에 적힌 값 | 실제 물리는 스타일 | 왜 |
|---|---|---|---|
| `buildLineTab` MD 탭 라벨 (:1813) | **20 Medium** | **body/18M = 18px** | 정본에 20 Medium 스타일이 없다(20은 Bold·Regular만). :59 에서 18M 으로 치환 |
| `navTabsIcon` StatusBar 배지 | 9 | body/10M = 10px | 9px 스타일 없음. :58 에서 치환 |

⚠️ **Line Tab 은 지금 웹으로 만드는 중이다.** 웹 `tab.css:44` 는 MD 라벨을 `--font-size-20`(20px)으로 쓰고 있어 **Figma 실제 결과(18px)와 2px 어긋난다.** 둘 중 하나로 맞춰야 한다.

## 3. 나머지 컴포넌트 — 텍스트 스타일 적용 상태

`makeBoundText` 를 거치는 모든 컴포넌트는 스타일이 물린다. 크기 인자 전수 조사 결과 **정본 8종 밖의 크기는 위 13·9·20M 세 건뿐**이고, 나머지는 전부 10·12·14·16·18·20·24·32 안에 있다.

스타일을 아예 안 쓰는 곳은 **스펙 시트 캡션(`makeLabel`, :381-396)** 하나다. 컴포넌트 부품이 아니라 문서용 라벨이라 이번 범위 밖으로 둔다(색도 raw RGB).

## 4. 표(Table) 크기 사다리 — XSM 누락 확인

정본 표는 **MD(44) · SM(38)** 두 칸뿐이다. 다른 컴포넌트의 사다리와 비교:

| 컴포넌트 | XXSM | XSM | MD |
|---|---|---|---|
| Input · Search · Select · Dropdown · Time Picker · Date Picker | 28 / 12px | **34 / 14px** | 44 / 14px |
| **Table** | 없음 | **없음** | 44 / 14px (그 외 SM 38) |

river 지시("높이 34에 폰트 12")와 기존 정본의 XSM(34 / **14px**)이 다르다 — 아래 질문 참조.

## 5. 정정 제안 (river 확인 후 실행)

| # | 무엇 | 시각 변화 |
|---|---|---|
| C-1 | `buildTableCell`·`buildTable`·`buildWebTabBar` 의 `13` → `14` 표기 정정 | **없음**(이미 14로 렌더됨) |
| C-2 | Line Tab MD 라벨: 20 유지하려면 텍스트 스타일 `title/20M` 신설, 아니면 코드를 18로 정정 + 웹 tab.css 18px 로 수정 | 둘 중 하나는 2px 변함 |
| C-3 | Table 에 XSM 칸 추가(높이 34) | 새 크기 등장 |
| C-4 | 웹 `tab.css:45` 의 `height: 42px` 는 토큰이 아니다(정본 SM PC 42) — sizing 토큰 부재 확인 필요 | 없음 |

---

## 6. 실행 결과 (river 결정 2026-09-02)

| # | 결정 | 실행 |
|---|---|---|
| C-1 | 표 sm 글자는 14 | `buildTableCell` `13 → 14`, `buildTable` fallback 정정 · ✅ |
| C-2 | 라인탭 MD 라벨은 **18px** (레거시 20이 너무 컸음) | `buildLineTab` MD `font: 20 → 18` · ✅ (Figma 결과물은 이미 18이라 시각 변화 없음) |
| C-3 | 표에 XSM 신설 — **높이 34 · 글자 12** (표 전용 기준) | `buildTableCell`·`buildTable` 사다리에 XSM 추가 · registry `table.json` sizing/variants 갱신 · 웹 `table.css` xsm 추가 · ✅ |
| — | 셸 GNB 13px·배지 9px | 2026-06-30 river 결정으로 이미 14·10 매핑 처리된 건이라 그대로 둔다 |

### 남은 것 (공유 파일 · 별도 검증)

| 항목 | 왜 남았나 |
|---|---|
| 🤖 `component-verifier` 재검증 (Gate 13) | 설치기 정본에 variant(XSM)가 늘어난 **구조 변경**이라 ⭐ 자가인증 금지(하드룰 H1②) |
| 웹 가이드에 표 xsm 표출 (Gate 19·39) | `pages/components.html` 은 손관리 화면이고 지금 다른 세션이 편집 중 |
| 웹 라인탭 글자 18px 로 수정 | `ui-library/src/components/tab/tab.css:44` — 지금 다른 세션이 만드는 중인 파일 |
| 설치기 zip 재빌드 | `npm run installer:build` — 다른 세션 변경분까지 함께 들어가므로 그쪽 작업이 끝난 뒤 |

---

## 7. 공유 화면 반영 (river 결정 7-B — ⭐ 직접 수정, 2026-09-02)

| 대상 | 수정 |
|---|---|
| `ui-library/src/components/tab/tab.css:44` | MD PC 라벨 `--font-size-20` → `--font-size-18` · manifest 지문 갱신 · `ui:build`/`ui:test` 통과, dist 재생성 |
| `pages/components.html` | 라인탭 손관리 섹션(CSS·행 라벨·코드탭·미리보기 3칸) 20 → 18 · 표 `data-cov-sizes` 에 xsm 추가 · `.s1-table--xsm`(h34/글자12) CSS 신설 · Table Cell 매트릭스에 xsm 2행 추가 · 라벨 문구 정정 |
| `registry/governance/component-geometry-baseline.json` | Gate 39 — 표 전체 프레임 높이 350 은 기존 440·386 과 같은 층위 차이라 사유와 함께 동결 |
| 설치기 zip | `npm run installer:build` 재생성 |

### 독립 검증 (🤖 component-verifier · 시나리오 D)

**PASS — 실패 0건.** Gate 13 기록 완료.

- "시각 불변" 주장 검증됨: `makeBoundText` 가 raw fontSize 를 설정한 뒤 `setTextStyleIdAsync` 로 덮으므로 13/20 은 화면에 도달한 적이 없다. 세로 정렬 좌표·탭 폭도 스타일 적용 후 값이라 불변.
- XSM 구조 정합 확인: 조회키·variant 이름·스펙시트 3행·`cellH` 계산 모두 정상. (XSM 을 배열 **끝**에 넣은 덕에 `sizes[0]`=MD 가 유지돼 스펙 셀 높이가 안 줄었다.)
- 하드룰 H2·H3·H6② 위반 0건.
- 미검증(정직 명시): Figma 캔버스 실제 렌더는 코드 레벨 대조만 했고 육안 확인은 범위 밖.

### 검증자가 남긴 후속 메모

- `textStyleKey`(:59)의 `20M → 18M` 치환은 이제 요청처가 없어 **죽은 규칙**이 됐다(제거 여부는 판단 사항).
- `:2016`·`:2040` 주석의 `"SM" | "MD"` 어휘가 XSM 추가로 낡았다.
- 다른 세션의 미커밋 변경(`buildAllComponents` 진입 시 캐시 전량 초기화)은 방향이 옳으나, Table Cell 만 캔버스에 있고 Table 이 없는 재설치에서 표가 조용히 fallback 되는 **기존 부채**를 더 이상 가려주지 않는다.
