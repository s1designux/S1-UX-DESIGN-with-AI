# Token Review — 대기 중

> 이 파일은 Claude가 토큰 유지보수 중 발견한 문제 또는 개선 제안을 정리하는 리뷰 큐입니다.
> 각 항목을 검토 후 승인하면 최종 토큰 파일에 반영됩니다.

---

## 리뷰 항목 1 — 신규 토큰 제안 3종 (Figma 원본 없음)

- **유형**: 신규 토큰 제안
- **대상 파일**: tokens/semantic.md → color-bg 테이블
- **발견 내용**: 아래 3개 토큰이 `— (신규)` 표기로 정의되어 있으나 Figma semantic 컬렉션에 대응하는 원본 변수가 없음. 다크모드 설계안 기반으로 추가된 제안값임.
- **현재 값**:
  ```
  --color-bg-active   Light: #E9E9E9 (color/gray/100)   Dark: #3E4049 (gray-dark/500)
  --color-bg-deepest  Light: #E9E9E9 (color/gray/100)   Dark: #0D0E12 (gray-dark/0)
  --color-bg-selected Light: #E2F1FF (color/blue/50)    Dark: #0C1D38 (blue-dark/50)
  ```
- **제안 값**: Figma SW UX GUIDE V2.4 `semantic` 컬렉션에서 해당 토큰 존재 여부 확인 후, 존재하면 원본 경로와 함께 등록 / 없으면 신규 Foundation 및 Semantic 추가를 Figma에서 먼저 정의
- **수정 이유**: 원본 없는 토큰이 확정 토큰 파일에 혼재되면 구현 시 임의 값 사용 위험 있음
- **영향 범위**: semantic.md color-bg 테이블, CSS 구현 참조 블록
- **승인 여부**: ⬜ 대기 중

---

## 리뷰 항목 2 — `--color-bg-home` Foundation 미등록

- **유형**: 구조 개선
- **대상 파일**: tokens/semantic.md → color-bg 테이블
- **발견 내용**: `surface/base-background/home`의 Light 값 `#F5F6FB`이 기존 `color/gray` Foundation 팔레트에 없는 값으로, 현재 하드코딩 상태임.
- **현재 값**:
  ```
  --color-bg-home | surface/base-background/home | #F5F6FB | ⚠️ 하드코딩 | #131418 | gray-dark/50
  ```
- **제안 값**: `color/gray` 팔레트에 신규 Foundation 추가 (`color/gray/25: #F5F6FB`) 후 `var(--color-gray-25)` 참조로 전환
- **수정 이유**: Foundation을 거치지 않는 직접 HEX 사용은 다크모드 전환 및 토큰 관리 일관성을 해침
- **영향 범위**: Foundation Token 팔레트, semantic.md `--color-bg-home`
- **승인 여부**: ⬜ 대기 중

---

## 리뷰 항목 3 — `--color-border-strong` Figma 원본 불명확

- **유형**: 참조 오류
- **대상 파일**: tokens/semantic.md → color-border 테이블
- **발견 내용**: Figma 원본 경로가 `— (Dark 설계안 기준)`으로 표기되어 있어, Figma `semantic` 컬렉션에 해당 변수가 없는 설계안 기반 토큰임. 단, `component-tokens-extracted.md`에서 `--button-secondary-hover-border`가 이 토큰을 참조하고 있어 현재 제거 불가 상태.
- **현재 값**:
  ```
  --color-border-strong | — (Dark 설계안 기준) | #C4C4C4 | color/gray/300 | rgba(255,255,255,0.12) | — (rgba)
  ```
- **제안 값**: Figma SW UX GUIDE V2.4 `semantic` 컬렉션에서 `color/line/gray/strong` 또는 동등 변수 확인. 존재하면 원본 경로 등록, 없으면 Figma에 신규 변수로 추가 요청
- **수정 이유**: Component Token이 참조 중이나 Figma 원본이 없으면 토큰 구조의 신뢰성이 깨짐
- **영향 범위**: component-tokens-extracted.md (`--button-secondary-hover-border`)
- **승인 여부**: ⬜ 대기 중

---

## 리뷰 항목 4 — `color-domain-status-*` Domain 레이어 이동

- **유형**: 구조 개선
- **대상 파일**: tokens/semantic.md → Section 7-2
- **발견 내용**: `color-domain-status-*` 토큰 8종이 semantic.md의 Section 7-2에 위치하고 있으나, 파일 내 주석에 "추후 Domain Token 레이어로 이동 예정"이라 명시되어 있음. 또한 다크 값이 전혀 정의되지 않은 상태.
- **현재 값**:
  ```
  --color-domain-status-primary        #1D6CEB  color/blue/400
  --color-domain-status-primary-sub    #2158C8  color/blue/450
  --color-domain-status-secondary      #1FB279  color/green/300
  --color-domain-status-secondary-sub  #009E5E  color/green/400
  --color-domain-status-tertiary       #25B9DA  color/skyblue/300
  --color-domain-status-tertiary-sub   #159BBC  color/skyblue/400
  --color-domain-status-disabled       #C4C4C4  color/gray/300
  --color-domain-status-error-bg       #FFCCD6  color/red/100
  ```
- **제안 값**: `tokens/domain/status.md` 신규 파일 생성 후 이동. 다크 값은 Domain 서비스 설계 시 별도 정의
- **수정 이유**: Semantic Token과 Domain Token의 레이어 혼재는 컴포넌트 토큰 참조 구조를 불명확하게 만듦
- **영향 범위**: semantic.md Section 7-2 전체, 해당 토큰을 참조하는 관제 도메인 컴포넌트
- **승인 여부**: ⬜ 대기 중
