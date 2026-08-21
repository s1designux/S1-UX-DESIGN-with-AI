# Fast-safe 다화면 실행 규칙

## 목적

4개 이상 화면에서 품질 검문소를 유지하면서 공통 오류의 대량 복제, Figma 호출 대기, 긴 trace의 반복 전달을 줄인다. **시각 표본은 줄여도 최종 결정론 검사는 모든 화면에 실행한다.**

## 0. 재개와 실행 창구 고정

1. `workflow-state.json`을 먼저 읽고 완료된 단계를 반복하지 않는다.
2. Figma를 직접 실행할 주체를 첫 가벼운 읽기 1회로 정한다.
3. 에이전트 경로가 정상 완료되지 않으면 재시도하지 않고 오케스트레이터 operator로 고정한다.
4. operator는 빌더가 작성한 코드 실행과 결과 반환만 담당한다. 설계 판단은 빌더, PASS 판정은 검증자가 유지한다.

## 1. 일괄 조사와 정본 manifest

원본은 상위 세트의 metadata/text/instance 정보를 먼저 일괄 수집한다. 화면별 상세 호출은 서로 다른 구조·상태에만 사용한다.

`canonical-manifest.json`에는 다음을 저장한다.

- 정본 component set과 variant ID
- variant별 기본 크기
- 인스턴스 내부에서 실제로 늘어나야 하는 프레임 이름·ID 경로와 FILL/HUG 규칙
- 텍스트 override 대상 이름·경로
- 사용 Variable·TextStyle ID
- 허용 remote key 목록의 기준 파일과 해시
- 정본 코드/모델의 Git SHA 또는 파일 해시

같은 target fileKey와 정본 SHA 조합에서는 manifest를 재사용한다. 둘 중 하나가 달라지면 다시 읽는다.

## 2. 화면 명세

`screen-spec.json`은 화면별 차이만 저장한다.

```json
{
  "screens": [
    {
      "sourceNodeId": "...",
      "targetNodeId": null,
      "archetype": "base|editing|error|overlay|other",
      "texts": {},
      "componentStates": {},
      "anchors": {},
      "requiredTexts": [],
      "allowedDeviationIds": []
    }
  ]
}
```

`anchors`에는 공통 오차가 퍼지기 쉬운 기준점만 기록한다: 첫 입력, 다음 입력, 주 CTA, helper, keyboard/overlay 시작점. 단일 auto-layout gap 하나로 서로 다른 구간을 대신하지 않는다.

## 3. 대표 유형 pilot

실제로 존재하는 유형에서 각각 1개를 선택한다.

1. `base`: 기본/비활성/하단 영역
2. `editing`: 입력 편집/키보드/보조 링크
3. `error`: 오류 input/가변높이 helper
4. `overlay`: modal·dialog·drawer/긴 문구/버튼 수

유형이 없으면 억지로 추가하지 않는다. HD·특수 아이콘·가변높이처럼 위험도가 높은 화면은 대표 유형에 추가한다.

빌더가 pilot만 생성한 뒤 독립 검증자는 다음을 확인한다.

- 원본 문구와 기준점 위치
- outer instance와 내부 content frame의 실제 폭·FILL/HUG
- variant와 텍스트 override 경로
- raw 색, 폰트, provenance, overflow
- 대표 이미지 대조

대표 이미지에서 큰 면적을 차지하는 키보드·지도·차트·영상 썸네일·제품 이미지 같은 가시 요소는 노드 존재나 바탕색만으로 PASS하지 않는다. 원본에 실제 내용이 보이면 픽셀 내용까지 대조한다. 빈 플레이스홀더 대체는 사용자가 명시적으로 승인한 경우에만 `allowedDeviationIds`에 넣을 수 있다. 디자인 시스템 대상이 아닌 OS 표면은 원본 참조 이미지를 사용할 수 있지만 출처·크기·해시를 산출물에 기록한다.

FAIL이면 공통 생성 규칙을 고치고 pilot만 다시 만든다. PASS 뒤에만 나머지를 일괄 생성한다.

## 4. 전체 생성과 최종 검사

나머지 화면은 같은 manifest·screen-spec·공통 생성 함수를 사용한다. 최종 Layer 1은 모든 화면을 검사한다.

- 화면 수·크기·순서
- 필수 문구 exact match
- component/variant/state
- outer와 내부 content frame 크기
- raw authored 색 0
- Pretendard/text style
- provenance 위반 0
- 고정 100px/HUG/spacer 잔재 0
- overflow 0

이미지 대조는 대표 유형 + HD/가변높이/특수 overlay만 순차 캡처한다. 결정론 검사 실패 화면은 자동으로 이미지 대조 대상에 추가한다.

## 5. compact 결과 계약

`scan-summary.json`은 아래만 에이전트에 전달한다.

```json
{
  "verdict": "PASS|FAIL|BLOCKED",
  "counts": {
    "screens": 0,
    "texts": 0,
    "instances": 0,
    "localInstances": 0,
    "allowedRemoteInstances": 0
  },
  "violations": {
    "text": [],
    "state": [],
    "field": [],
    "raw": [],
    "font": [],
    "provenance": [],
    "layout": [],
    "overflow": []
  },
  "trace": {
    "path": "trace.json",
    "count": 0,
    "sha256": "..."
  }
}
```

전체 인스턴스·텍스트·노드 상세는 `trace.json`에 보존한다. PASS 때는 검증자가 trace 전체를 읽지 않고 count/hash와 node-map 차이만 확인한다. FAIL·count 불일치·hash 변경 때만 해당 상세 그룹을 읽는다.

`node-map.json`에는 화면 루트, 직접 생성/변경 ID, trace 경로·count·hash를 기록한다. 동일한 descendant 목록과 전문 텍스트를 node-map과 trace 양쪽에 중복 저장하지 않는다.

## 6. 사용자 검문소

- Inventory: 미확인·원본 충돌·범위 선택이 모두 0이면 자동 통과
- Mapping: HD가 0이면 자동 통과
- Pilot/최종 검증: FAIL은 자동 수정 루프로 반환
- 사용자에게 묻는 항목: 범위 선택, 모호 매핑, 정본 부재, 아이콘 부재, 의도 판단이 필요한 편차

자동 통과 사실과 근거는 `workflow-state.json`의 `handoff.summary` 또는 `decisions`에 남긴다.

## 7. 실패 처리

- Figma 실행 경로 실패: 같은 경로 반복 금지, operator 고정
- pilot FAIL: 전체 생성 금지, 공통 규칙만 수정
- 전체 scan FAIL: 실패 화면만 부분 재실행
- 캡처가 데이터 스캔과 모순: 해당 화면만 단독 재캡처 후 판단
- trace count 불일치: compact PASS 금지, 상세 trace를 열어 원인 확인

## 테스트 시나리오

### 정상 흐름

8개 모바일 화면이 base/editing/error/overlay를 포함하고 HD가 없다. Inventory·Mapping을 자동 통과하고 대표 4개 pilot을 검증한 뒤 나머지 4개를 생성한다. 최종 결정론 검사는 8개 전부, 이미지 대조는 대표 4개만 실행한다.

### 오류 흐름

pilot의 outer Input은 320px이지만 내부 field가 200px이다. pilot 검증이 FAIL하고 나머지 생성은 시작하지 않는다. manifest의 내부 field FILL 규칙을 고친 뒤 pilot을 다시 검증한다.

### 도구 실패 흐름

빌더 에이전트의 첫 Figma 읽기가 정상 완료되지 않는다. 같은 호출을 반복하지 않고 오케스트레이터 operator로 고정한다. 빌더와 검증자의 판단 역할은 유지한다.
