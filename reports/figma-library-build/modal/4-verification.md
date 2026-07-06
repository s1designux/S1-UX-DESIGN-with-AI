# 4-verification — Modal (공통 팝업) 라이브러리 빌드 검증 (최종)

> 4단계 검증(🤖 component-verifier, 빌더와 분리) · 최종 재검증 2026-07-03 · 기준: `2-plan.md`·`node-map.json`·`reports/modal-component-spec.md`·`registry/components/modal.json`
> 대상 파일 `cysG5U1udpQqVagYY1hWHW` (V3.0-TEST), **test 페이지 302:19291**. Figma MCP whoami PASS(연결 정상).
> 검증 대상: 세트 763:9085 · Usage 829:30 · Spec Dark 840:69 (R6 이동/재빌드 후 현재 상태).

## 판정 요약: ✅ PASS (❌(a) 0건 · BLOCKED 0건)

메인 변형세트·Usage·Spec Dark 모두 구조·크기·토큰 바인딩·폰트·출처·순환참조·다크 전부 통과.
남은 항목 = 🟡(b) 허용편차 3건 + 상태보고 1건(비차단).

---

## 1. variant 전수·크기 — ✅ PASS (정확 대조)

세트 `763:9085` (2540×1944) — 8 variant(Size 4 × Footer 2) 전부 존재. 폭×minHeight 실측:

| variant | 실측 w×h(=minH) | 스펙 | itemSpacing | pad | primAlign/Sizing |
|---------|----------------|------|-------------|-----|------------------|
| S/Dual·Single | 360×174 | 360×174 ✅ | 32 | 20/24 | SPACE_BETWEEN/AUTO |
| M/Dual·Single | 520×336 | 520×336 ✅ (440 아님) | 32 | 20/24 | SPACE_BETWEEN/AUTO |
| L/Dual·Single | 1000×587 | 1000×587 ✅ | 32 | 20/24 | SPACE_BETWEEN/AUTO |
| XL/Dual·Single | 1200×587 | 1200×587 ✅ | 32 | 20/24 | SPACE_BETWEEN/AUTO |

패킹 정상(4×2 그리드, 겹침 0). 순환참조 0(Modal 인스턴스는 Usage/Spec 프레임에만, 형제 variant 중첩 없음).

## 2. 높이 구조 — ✅ PASS

전 variant: primaryAxisAlignItems=SPACE_BETWEEN + AUTO + per-size minHeight. 푸터 gapToBottom=20(=paddingBottom, 전 8종). Body layoutGrow=0 + layoutSizingVertical=HUG(스냅, bodyH=34 고정) — body-fill 잔재 0. 여백은 space-between 흡수.

## 3. 패널 토큰 — ✅ PASS

전 8 variant fill = `color/modal/bg` (VariableID:809:2). Foundation 직바인딩 잔재 0. cornerRadius=8(값 정확).

## 4. 토큰 바인딩 스캔 (use_figma 사실 추출 + 역매핑) — ✅ PASS

| 노드 | 총 노드 | 미바인딩 raw hex | 고유 hex |
|------|--------|-----------------|---------|
| 세트 763:9085 | 113 | 0 | 없음 |
| Usage 829:30 | 84 | 0 | 없음 |
| Spec Dark 840:69 | 48 | 0 | 없음 |

미바인딩 fill/stroke 0건 → 역매핑(figma-binding-lookup) 대상 없음(EXACT 0). 추출>0 확인(셀렉터 부패 아님).

## 5. 폰트 스캔 (데이터, figma-font-scan) — ✅ PASS

| 노드 | textCount | 비-Pretendard | verdict |
|------|-----------|---------------|---------|
| 세트 763:9085 | 36 | 0 | ✅ PASS |
| Usage 829:30 | 26 | 0 | ✅ PASS |
| Spec Dark 840:69 | 16 | 0 | ✅ PASS |

## 6. 다크 (Spec Dark 840:69) — ✅ PASS

패널 fill 리졸브 #1C1D23(S/M/L 전부) · subtle 보더 #2E2F38(바인딩) · 드롭섀도우 2겹(r8/y8/spread-4, r24/y20/spread-4, 참고 781:32832 복사) · secondary(취소) 버튼 다크 bg=#1C1D23(흰색 아님, 확인). Light 세트 플랫(그림자·보더 없음).

## 7. 출처(provenance) 스캔 — ✅ PASS

| mainComponent | remote | key | 판정 |
|---------------|--------|-----|------|
| ic_닫기 Property 1=Line | true | 2a1abbd3…9934 | ✅ 허용목록 `close` |
| Button Primary/Secondary XSM | false | (로컬 Button b8a5d70…) | ✅ 로컬 h34 |
| Modal 변형 인스턴스 | false | (로컬 Modal 1099890…) | ✅ 로컬 |
| Radio Selected/Default On | false | (로컬 Radio ac525a…) | ✅ 로컬 |

외부 라이브러리 인스턴스 0. 닫기=허용 close 키, 푸터=Button XSM(h34) 인스턴스.

## 8. 렌더 대조 — ✅ PASS

세트(4×2, Dual=취소+확인/Single=확인, 푸터 우하단·닫기 우상단)·Usage(4 예시)·Spec Dark(3 다크 패널) 시각 정상.
Usage Ex1/Ex2(실 Modal 인스턴스) 제목·본문이 미리보기서 흐림 → **데이터로 실 내용 확인**: Ex1 "안내"/"필수 항목을 입력해주세요.", Ex2 "삭제"/2줄, 전부 visible=true·텍스트색 Variable 바인딩. = Pretendard 인스턴스 렌더 갭(지침 #8), ❌ 아님.

---

## 🟡 (b) 허용편차 (계획서 명시·비차단)

- Ex3/Ex4 detach(복합 본문=Figma 인스턴스 자식 삽입 제한) — needsDecision 확인 대상. 두 예시 푸터 버튼은 detach 사본(Button 인스턴스 아님). 메인 세트·Ex1/Ex2 는 실 Button 인스턴스 유지.
- Ex4 지도=이미지 플레이스홀더(회색 박스+라벨, plan §D 명시), 데이터표=대표 목업.
- Spec Dark 그림자 blur(r8/r24)가 스펙 문서 러프 수치(4/12)와 다르나, plan R1 "참고 781:32832 effects 그대로 복사" 지시대로 참고 노드값 충실 재현 → 원본충실(정본=참고 노드).

## ℹ️ 상태 보고 (❌ 아님, 지침 #9)

- 제목 textStyleId = 로컬 `title/16B`(Pretendard Bold 16). 정본 리모트 대문자 `Title/16B` 재바인딩은 런타임 Pretendard 미설치로 BLOCKED(loadFontAsync 실패) → 시각 동일한 로컬 스타일 유지. 데스크톱(Pretendard 설치)에서 1클릭 재적용 또는 스타일 로컬화로 해소 가능. 검문소 비차단.

## 관찰 (비차단, 참고)

- 세트 variant의 cornerRadius(8)는 raw 숫자(radius/8 Variable 미바인딩). paddingLeft·itemSpacing 은 Variable 바인딩됨. 색 규칙(hex 하드룰) 대상 아니고 값 정확(8) → 비차단. plan B표는 radius/8 바인딩 의도였음(원하면 후속 정리).

---

## 판정
- ❌(a) 0건 · ❓(c) 0건 · BLOCKED 0건 → **검문소 4 PASS**
- 🟡(b) 3건(허용편차, 계획 명시) + 상태보고 1건(Title/16B 리모트 재바인딩 이월)은 통과에 영향 없음.
