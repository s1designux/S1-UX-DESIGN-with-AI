# Modal Content (콘텐츠 계열) — 별건 백로그

> **상태: 미착수.** 확인 계열(`registry/components/modal.json`, compact 텍스트-확인)과 **구분되는 별개 컴포넌트**.
> 발견 경위: 루트 A 모달 편입 중 크기 체계(pc_modal 540:5815) 판독에서, 확인 계열(제목16·버튼h28·텍스트)과 스펙이 다른 콘텐츠 계열(제목18·버튼h34·4크기)임이 드러남 → 두 계열 분리 확정(river 결정 2026-07-15).

---

## 정체성

| 항목 | 확인 계열 (Modal) | **콘텐츠 계열 (Modal Content) ← 이 문서** |
|---|---|---|
| 정본 노드 | 6706:4218 (modal_small) | **540:5815 (pc_modal)** + modal_large 6714:8020 |
| 제목 | 16px | **18px** |
| 버튼 | h28 (코어 Button XXSM) | **h34 (코어 Button XSM)** |
| 본문 | 텍스트(짧은 확인) | **입력창 / 테이블 / 이미지 등 콘텐츠** |
| 크기축 | 없음(폭 360 단일) | **Size = sm / md / lg / xl** |
| 변형축 | Footer Single\|Dual | (미정 — 콘텐츠 유형/푸터, 착수 시 결정) |

## 크기 체계 (원본 540:5815 실측)

| 크기 | 폭 | 높이 규칙 | 본문 |
|---|---|---|---|
| **sm** | 360 | hug(내용에 맞춤, 최소 184) | 콘텐츠 1블록 |
| **md** | 520 | hug(최소 184) | 콘텐츠 2블록(gap16) |
| **lg** | 1000 | ★아래 "높이 규칙" | 콘텐츠 fill |
| **xl** | 1200 | ★아래 "높이 규칙" | 콘텐츠 fill |

## ★ 높이 규칙 (콘텐츠 계열 전용 — river 확정)

- **lg/xl은 고정 높이가 아니다.** 587은 **최소 높이**이며, **콘텐츠에 따라 커진다.**
- 단, **딤(overlay) 화면의 85%까지만** 커지고, **초과 시 본문 내부 스크롤**로 전환한다.
- 이 **85% 상한 + 내부 스크롤** 규칙은 **콘텐츠 계열 전용**이다(확인 계열엔 없음).
- (주의: Figma get_design_context 렌더는 lg/xl을 `h587 고정`으로 보였으나, 이는 as-built 근사일 뿐 — 정본 규칙은 위 "min 587 → grow → 85% → scroll"이다.)

## 본문 유형

- 입력창(Input) · 테이블(Table) · 이미지 — 코어 컴포넌트/콘텐츠를 배치. 껍데기(헤더·푸터)는 고정.

## 토큰

- **확인 계열과 동일 · 크기 불변.** panel-bg=`color/surface/raised`, radius=`radius/8`, py=`padding/block/md`, px=`padding/inline/lg`, gap=`section/lg`, 딤=`color/overlay`, 버튼=코어 Button. **신규 토큰 0**(크기가 바뀌어도 색·radius·폰트·딤 안 바뀜 — 크기축은 순수 폭+높이방식 변주).
- 다크 그림자: 확인 계열과 공유될 `shadow/raised`(별건 백로그 `reports/shadow-token-infra-backlog.md`) 적용 대상.

## 가드레일 (확인↔콘텐츠 전환)

- 확인 계열(Modal)은 **height/width 비율이 임계 초과 시 사용 금지 → 콘텐츠 계열로 전환**(임계값 TBD). 그 수신처가 이 콘텐츠 계열이다.

## 착수 시 To-Do (미착수)

1. 원본 정밀 재고조사: 540:5815 4크기 + modal_large 6714:8020 본문 유형별 구조.
2. Size 축 설계(sm/md/lg/xl) — sm·md hug / lg·xl min587+grow+85%scroll.
3. 변형축(콘텐츠 유형·푸터) 결정.
4. 빌더(build-components.ts) `buildModalContent` 또는 확장 — 확인 계열과 별 컴포넌트로.
5. 가드레일 임계값(height/width 비율) 확정 → 두 계열 registry에 명시.
6. component-verifier 독립 검증(원본 대조) → Gate 13 기록.
