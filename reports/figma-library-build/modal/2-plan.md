# 2-plan — Modal (공통 팝업) 빌드 계획

> 2단계 계획(🎩 ⭐) · 2026-07-03 · 정본: `reports/modal-component-spec.md` + `registry/components/modal.json`

## A. 빌드 대상

### A-1. 메인 산출물 — `Modal` 변형세트 (combineAsVariants)
variant 축 2개 = **8 variant**:
- `Size` = S · M · L · XL  (폭 360 / 440 / 1000 / 1200)
- `Footer` = Single(버튼1) · Dual(버튼2)

각 variant 공통 구조(세로 오토레이아웃, hug):
```
Frame [radius/8, bg/level-0, padding: block 20 / inline 24, itemSpacing 16]
├ Header  [가로, spaceBetween]
│  ├ 제목 텍스트  (title/16B, color/text/title/primary)
│  └ ic_닫기 인스턴스 (24×24, color/icon/gray-dark)
├ Body   [세로, 대표 콘텐츠 — 텍스트 2줄, color/text/body/primary, body/14R]
└ Footer [가로, 우측정렬, itemSpacing 8]
   ├ (Dual만) Button 인스턴스 Secondary "취소"  Size=xsmall(h34)
   └ Button 인스턴스 Primary "확인"            Size=xsmall(h34)
```
- 폭은 Size별 고정(fixed width), 높이는 hug(내용). 세로 최대 85vh·본문 스크롤은 **런타임 규칙**이라 Figma 정적 세트엔 대표 높이로 표현하고 문서/설명에 명시.
- 세트 이름 `Modal`. variant 속성 표기 `Size=…, Footer=…`.

### A-2. 사용예시 프레임 (검수용 — 콘텐츠 유형 시연)
메인 세트 인스턴스 + 본문만 교체해 유형을 보여주는 예시(별도 프레임 `Modal — Usage (사용예시)`):
1. **S / Single** — 안내: "필수 항목을 입력해주세요." (1줄)
2. **S / Dual** — 확인: "선택하신 항목이 삭제됩니다.\n정말 삭제 하시겠어요?" (2줄)
3. **M / Dual** — 폼: 라디오 2개 + 강조텍스트 "총 000개 항목" (다운로드 예시)
4. **L / Dual** — 복합: 좌 지도 플레이스홀더 + 우 폼행 + 데이터표 헤더(대표) (지정 노선 추가 예시)

> 본문 콘텐츠는 가능하면 코어 컴포넌트 인스턴스 재사용. 캔버스에서 안정적으로 인스턴스화 어려운 것(표·지도)은 **토큰 바인딩된 대표 목업**으로 그리고 "placeholder"로 표시(검수 후 실제 코어 조합으로 대체). 지도=이미지 플레이스홀더(회색 박스 + 라벨).

### A-3. Dark 스펙 프레임
규약대로 `Modal — Spec Dark`(bg=color/bg/level-1, Dark explicit mode) — 메인 세트 인스턴스 배치. Light 세트 우측/아래.

## B. 색상 바인딩 사전 조회표 (전 색상 → 토큰)

| 용도 | 소스 값 | DS 토큰(이름) | 로컬 확인 | 빌드 지시 |
|------|--------|--------------|----------|----------|
| 모달 패널 배경 | #ffffff | `color/bg/level-0` | 🟡 이름조회 | 바인딩(없으면 HD) |
| 딤 overlay(사용예시) | rgba(0,0,0,.5) | `color/overlay` | 🟡 이름조회 | 바인딩(없으면 HD) |
| 제목 | #202020 | `color/text/title/primary` | ✅ | 바인딩 필수 |
| 본문 텍스트 | #202020/#353535 | `color/text/body/primary` | ✅ | 바인딩 필수 |
| 닫기 ✕ 아이콘 | #353535 | `color/icon/gray-dark` | ✅ | 바인딩 필수 |
| 강조/링크 | #1d6ceb | `color/text/state/accent` | 🟡 이름조회 | 바인딩(없으면 HD) |
| 구분선(표 등 목업) | #e9e9e9 | `color/line/gray/subtle` | ✅ | 바인딩 필수 |
| 푸터 버튼 색 | — | **Button 인스턴스 내부 토큰** | ✅(Button 로컬) | Button 인스턴스 재사용(색 재바인딩 불필요) |
| 모서리 | 8 | `radius/8` | 🟡 이름조회 | 바인딩 |
| 패딩/갭 | 24/20/8 | `spacing/24`·`spacing/20`·`spacing/8` | 🟡 이름조회 | 바인딩 |

> 🟡=읽기 MCP로 ID 취득 불가라 **빌더가 플러그인 API 이름 조회로 로컬 존재+ID 확정** 후 바인딩. 로컬에 진짜 없으면 raw hex 금지 → needs-decision 반환.

## C. 아이콘 / 재사용
- 닫기 ✕ = `ic_닫기` importComponentByKeyAsync(key `fecb5506e06428f1801dbe092321a65520e856a9`). 세트면 적정 variant(Line 우선) 선택, 색 icon/gray-dark 재바인딩. 세트 축 미확인 → 빌더가 세트 열어 확인.
- 푸터 버튼 = 이 파일 로컬 Button 인스턴스, `Size=xsmall`(h34), Variant=Primary/Secondary, State=Default.
- 폰트 = Pretendard 정본 텍스트 스타일(title/16B, body/14R). override 시 재바인딩 규칙 준수.

## D. 허용편차 선언
- 없음(모든 색=토큰). 예외: 지도 자리 **이미지 플레이스홀더**(회색 박스, bg/level-2 등 토큰 + 라벨) — 실제 지도는 서비스 이미지라 컴포넌트 색 아님. (`이미지 플레이스홀더` 로 표기)

## E. 배치 좌표 — HD-A ✅ 확정 (2026-07-03)
**사용자 결정: Platform 섹션 아래에 배치하되, Form Control 섹션 height를 넘어선 y축(기존 섹션들 아래쪽 빈 영역).**
- 빌더가 플러그인 API로 대상 페이지(Navigation 687:18905 이 속한 페이지)의 **"Platform" 섹션 x** 와 **모든 카테고리 섹션(특히 "Form"/"Form Control")의 최대 bottom y** 를 계산.
- 배치: x = Platform 섹션 x(좌측 컬럼 정렬), y = 기존 전 섹션 최대 bottom + 여백(예 +200) → 겹침 0 보장. 그 아래 세로로 [Modal Light 세트 → Usage 사용예시 → Spec Dark].
- 섹션 이름을 못 찾으면 needs-decision 반환.

## F. 결정 필요 (HD)
- **HD-A · 배치 위치**: 위 제안(오른쪽 새 컬럼 자동 배치 + 검수 시 이동) vs 사용자 지정.
- (HD-B 잠재) 🟡 토큰이 로컬에 실제로 없으면 빌더가 needs-decision 으로 올림 → 그때 판단.

## G. 검수 범위 (사용자 OK 대상)
① Modal 8-variant 세트(구조·크기·푸터) ② 콘텐츠 유형 사용예시 4종 ③ Dark 스펙.
→ OK 시에만 설치기(build-components.ts)·components-new.html 연동.

---

## ▶ 개정 R1 (2026-07-03, 사용자 검수 피드백 4건 → 원본 재정독)

기준 원본: 레거시 `6443:141123`(get_design_context) + 다크 참고 `781:32832`.

1. **타이틀 스타일**: 로컬 소문자 `title/16B`(빌드됨) → **정본 대문자 `Title/16B`**(라이브러리 style id `S:023fa21970a45e112b93260bcea80e2f30923e61,1415:4` — 참고 팝업 781:32834 와 동일)로 재바인딩. 본문도 참고 정본 `Body/14R` 로 통일(로컬 소문자면 교정).
2. **내부 세로 간격**: gap 16(빌드됨) → **32(spacing/section/lg)** — 헤더↔본문↔푸터. 레거시 확정.
3. **최소높이**: 140(스펙 초판) → **min-h 184**(레거시 6443:141123). py 20 유지, 각 섹션 px 24 유지.
4. **다크(참고 781:32832)**: 패널 bg = bg/level-1(빌드됨 #131418) → **gray-dark/100 #1c1d23**(참고 정본). **참고 노드 effects(드롭섀도우 2겹) 복사**해 다크 패널에 적용. subtle border(color/line/gray) 추가.
5. **취소 버튼 다크**: 다크 스펙에서 secondary 버튼이 흰색 → **다크 스펙 프레임이 버튼 토큰 컬렉션까지 Dark 모드 적용**하도록 수정(우리 토큰상 button/bg/secondary--default 다크=gray-dark/100 정상 존재). 
   - Light 모달은 그림자·보더 없음(레거시 플랫 유지).

> 위 변경은 메인 세트 763:9085(전 variant)·Spec Dark 768:6186 에 반영. Usage 는 세트 인스턴스라 자동 반영(detach된 Ex3/Ex4 는 gap/스타일 수동 확인).
