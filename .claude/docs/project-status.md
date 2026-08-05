# 프로젝트 상태 스냅샷 (참조 문서)

> CLAUDE.md 본문에서 분리한 **상태 스냅샷** — 완료된 단계·미결 사항(다음 우선순위)·산출물 현황.
> 매 턴 판단에 쓰는 규칙이 아니라 **다음 작업을 계획할 때 참조**하는 현황이다. 상태가 바뀌면 여기서 갱신한다.

---

# 🎯 현재 프로젝트 단계

## 완료된 단계

* ✅ Foundation Token — Primitive 색상 팔레트 (Light + Dark) 정의 완료
* ✅ Dark Primitive — `gray-dark` (0–900), `blue-dark` (50–500) 추가 완료
* ✅ Semantic Token — 8개 카테고리 Light/Dark 값 전체 정의 완료 (정본 `plugins/figma-vars-installer/src/vars-data.ts`)
* ✅ Component Token — 9개 그룹 추출 및 Semantic 참조 구조 정의 완료 (정본 `plugins/figma-vars-installer/src/build-components.ts` · 별칭 CSS 변수층은 2026-07-02 은퇴)
* ✅ Button variants — primary / secondary / blue-line 토큰 완료 (Danger 삭제, ghost deprecated 확정)
* ✅ Button blue-line variant — tokens.css + component.tokens.json 추가 완료 (2026-05-11)
* ✅ 가이드 HTML — foundation / semantic / components 페이지 완료
* ✅ MVP3.3 Portal IA 재편 — System 그룹 분리, Button 페이지 6탭 구조 전환 완료 (2026-05-11)
* ✅ MVP3.4 Button Figma MCP 비교 — 토큰 불일치 7건 + 이중 CSS 구조 문서화 완료 (2026-05-12)
* ✅ MVP3.4.1 Button Sync 자동화 — 37개 정합성 검사 스크립트 + GitHub Actions 일일 자동화 완료 (2026-05-12)
* ✅ MVP3.5 Source Guard MVP — 외부 서비스 프로젝트 6종 위반 탐지 + 리포트 생성 완료 (2026-05-12)
* ✅ MVP3.6 Source Guard Fix Suggestions — HEX→semantic token 역매핑 엔진 + before/after 수정 후보 + patch diff 생성 완료 (2026-05-12)
* ✅ MVP3.7 Source Guard Apply Mode — high-confidence 자동 적용 + dry-run/apply 분기 + backup + apply log 완료 (2026-05-12)
* ✅ MVP3.8 Source Guard CI Dry-run — GitHub Actions 자동 검수 파이프라인 구축 완료 (2026-05-12)
* ✅ Pre-MVP4 Input 분류 — Figma MCP 8 nodes 분석, Base Input/Slots/Pattern/Picker 분류, 토큰 Gap 17개, HD 8개 도출 (2026-05-12)
* ✅ MVP4.3-A DatePicker Component Candidate — 별도 컴포넌트 후보 등록, Figma node 6443:4655 시도, Interactive preview 구현 완료 (2026-05-12)
* ✅ MVP-C1 Chip 컴포넌트 구현 — chip.json line/solid split 재작성. hover·icon·close-icon variant CSS + 매트릭스. Token Details 탭 34개 토큰 전체 문서화. harnessStatus: implemented (2026-05-19)

## 미결 사항 (다음 우선순위)

> **정리(2026-06-19):** 완료 항목(구 1·4·7·8·10·15)은 「변경 이력」 표·git 히스토리·각 reports에 보존돼 본 목록에서 제거했다. 아래는 **활성 미결만** 남긴 것이다.

```
1. Figma Button componentSetKey 등록 (figmaNodeId 는 완료)
   - figmaNodeId = "6440:4032" 등록됨 (registry/figma/figma-map.json)
   - componentSetKey 는 빈 문자열 — figma-map.json _meta.note 에 따라
     Figma Plugin 연동 전까지 의도적 보류

2. Dark Mode 버튼·컨트롤 색상 확정
   - --color-text-disabled dark 값: 현재 #35363F → #55575F 조정 검토 중
   - blue-line variant dark mode 시각 검증 미완료 (darkModeStatus: pending)
   - toggle tokens 불일치: MD는 var(--color-text-placeholder), CSS는 var(--color-border-default)

3. Semantic Token Figma 반영 (Figma 파일 직접 수정 필요)
   - 오타 수정: color/status-card/text/*--defualt → --default (3건)
   - surface/status/* → Domain Token 이동 여부 확정

4. Dark border 4 토큰 확정 — 해소 (2026-07-30 확인)
   - --color-border-subtle / -default / -strong / -emphasis 4건 모두 status="stable"
   - dark 값은 foundation dark scale 참조로 확정
     (registry/tokens/semantic.colors.json:41~44)

5. DatePicker component candidate Human Decisions (MVP4.3-A)
   - HD-1: Figma node 6443:4655 componentSetKey 확인 (MCP invalid — Figma 직접 확인 필요)
   - HD-2: 공식 컴포넌트명 확정 (DatePicker vs DayPicker)
   - HD-3: calendar icon Figma 노드명 확정 (현재 candidate SVG)
   - HD-4: Mobile 인터랙션 확정 (bottom sheet vs inline vs popover)
   - HD-5: DatePicker 전용 token candidate → stable 전환 여부 결정
   상세: reports/mvp4-3-a-date-picker.md
6. TimePicker component candidate 정리 (figmaNodeId: 6443:4606)
7. Pattern 페이지 설계 (search-table, tree-detail)
8. Legacy 가이드 작성
9. MVP-L1 UX Guide 2.4 Variables export → npm run figma:audit — 산출물 존재 · 내용 미검증
   - Figma에서 실제 S1 UX 디자인가이드 2.4 파일 열기
   - SW Token Sync 플러그인 → Export Variables → Download JSON
   - registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json으로 저장
   - npm run figma:audit 실행 → reports/mvp-l1-legacy-token-audit.md 생성
   - 산출물 확인(2026-07-30): figma-variable-metadata.ux-guide-2.4.json 존재 (227,404 B)
   - 산출물 확인(2026-07-30): reports/mvp-l1-legacy-token-audit.md 존재 (27,002 B)
   - 두 파일의 내용은 미검증 — 완료 판정 보류
```


# 📦 산출물 현황

```
plugins/figma-vars-installer/src/   ← 정본 3벌
  vars-data.ts         ✅ 토큰 값(Foundation·Semantic·number·shadow)
  textstyles-data.ts   ✅ 텍스트 스타일
  build-components.ts  ✅ 컴포넌트가 쓰는 토큰·크기 (Danger 제거됨)

tokens/legacy/                      ← 2026-08-01 아카이브 (정본 아님)
  semantic.md · component-tokens-extracted.md · foundation.md
  (Dark 스텝 방향 규칙은 vars-data.ts 주석 + design-narrative.json 으로 이관)
  token-map.json       ⬜ 미작성 — BACKLOG 로 이관하거나 폐기 결정 대기

pages/
  foundation.html    ✅ Dark Palette 포함
  semantic.html      ✅ Light/Dark 테마 전환
  components.html ✅ PC/Mobile 플랫폼 전환 포함
  policy.html        🚧 작성 중
  patterns.html      파일 존재 · 완성도 미확인
  legacy.html        파일 존재 · 완성도 미확인
```

