# 2-canon-readiness — 정본 준비 확인

작성 2026-09-02 · 오케스트레이터(⭐)

- 새 컴포넌트·variant·크기·토큰을 만들지 않는다. **이미 정본에 있는 Mobile 조합**(button lg,
  chip sm+mobile, input/select md+mobile, filter-chip md+mobile)을 예제 파일로 옮겨 적을 뿐이다.
- Mobile 예제의 목록(Dropdown) 크기도 기존 규칙 그대로다 — select: 트리거와 같은 크기,
  filter-chip: SM·MD 모두 XSM(river 결정 2026-09-02).
- `needs-decision` 0건. 정본 신설 0건.
- manifest 에 `htmlContract.breakExamples` 선언을 추가한다. 계약
  `componentManifestSchema.required` 는 그대로 만족하며(추가 필드), 계약 검사 PASS 를 확인했다.

## river 결정 기록

- 2026-09-02 HD-1: **(A) 보고 있는 화면의 코드만 보여준다** — Mobile 화면에서는 Mobile 마크업.
