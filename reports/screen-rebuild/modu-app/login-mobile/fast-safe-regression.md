# Fast-safe 축소 회귀시험

## 판정

**FAIL(철회) — 키보드 시각 누락 발견**

기존 시험은 노드 존재와 위치는 확인했지만, 키보드 프레임 내부가 빈 면이라는 사실을 허용편차로 잘못 처리했다. 사용자가 제공한 실제 화면 캡처로 이 오류가 확인되어 기존 PASS를 철회한다.

## 시험 범위

| 유형 | 대상 | 결과 |
|---|---|---|
| 기본 | 최초 진입 | PASS |
| 입력·키보드 | 입력 A | **FAIL — 실제 키 배열 누락** |
| 오류·가변높이 | 잘못된 아이디·비밀번호 | PASS |
| overlay·긴 문구 | 신규기기 확인 C | PASS |

첫 키보드 캡처에서 로고·Password 누락만 재확인하고, 키보드 프레임 자체의 실제 내용을 검사하지 않은 것이 원인이다. `keyboard frame 존재`를 `키보드 시각 정상`으로 잘못 간주했다.

## 전체 경량검사

- 현재 live metadata: Section 1개, 직계 화면 13개, 모두 360×780
- 화면 순서·대표 기준점·키보드 2개·overlay 5개 구조 일치
- 기존 deep trace: 인스턴스 145개(로컬 112, 허용 remote 33), 위반 0
- Input 내부 field: 26/26, 320px + FILL
- raw 색·폰트·문구·출처·overflow 위반: 0
- trace 2개 SHA-256과 `scan-summary.json` 기록 일치
- `screen-rebuild:statecheck`가 screen-spec 화면 수, manifest 대상 파일, scan 위반 0, trace count/hash까지 자동 확인하고 PASS

## 새 산출물

- `canonical-manifest.json`: 정본 variant와 내부 크기 계약
- `screen-spec.json`: 화면별 상태와 대표 유형
- `scan-summary.json`: 집계·위반·trace count/hash만 담은 교대용 결과

## 검증 제한

이번 세션은 Figma metadata와 screenshot 읽기는 가능했지만 JavaScript live-scan 실행 도구는 노출되지 않았다. 따라서 raw·폰트·provenance의 깊은 검사는 이미 독립 PASS한 trace를 재사용했고, 현재 live metadata와 새 대표 캡처가 당시 결과와 같은 구조임을 확인했다. 다음 실제 screen-rebuild에서는 새 규칙대로 최종 live-scan을 모든 화면에 실행해야 한다.

## 재시험 범위

- 수정 대상: 입력 A/B 2개 화면만
- 필수 확인: 두 키보드 프레임에 같은 360×296 원본 참조 이미지가 보이는지
- 보호 확인: 나머지 11개 화면의 루트 ID·크기·순서가 바뀌지 않았는지
- 완료 전까지 이 문서의 최종 판정은 FAIL을 유지한다.

## 결론

대표 화면 수를 줄이는 방식 자체는 유지한다. 단, 대표 이미지에서 화면을 크게 차지하는 가시 요소는 `존재 여부`뿐 아니라 실제 픽셀 내용까지 원본과 대조해야 한다.
