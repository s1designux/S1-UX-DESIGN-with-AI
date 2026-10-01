## Orchestrator Summary — 설치기 화면 전체를 S-1 가이드 색으로

### 변경 내용
| 주체 | 파일 | 변경 내용 |
|------|------|---------|
| ⭐ | plugins/figma-vars-installer/src/ui.html | 하드코딩 색 약 200곳 → 시맨틱 토큰 var(--color-*) · 다크 전용 블록 6개 제거(토큰이 다크 처리) · 검수 안내 축약·보조 카드화 · 검사 항목 가운데 배치 · 첫 화면 글자 S-1 텍스트 스타일 |
| ⭐ | scripts/stamp-installer-ui.js | 빌드 때 assets/css/tokens.css 를 ui.html `/*{{S1_TOKENS}}*/` 자리에 심음(다크 블록은 prefers-color-scheme 로 감쌈) |
| 🤖 | (검증) component-verifier | HOLD → (a) 2건(로고 칸 바탕·첫 화면 아이콘 다크 대비) 수정, 배지 대비·구분 (c) 일부 수정 |

### 검사기 결과
| 검사기 | 결과 |
|---|---|
| 🔎 gate:check | ✅ PASS (경고만) |
| 🔎 installer:build 스크립트 문법 | ✅ |

### river 결정 반영
- 초록 완료 → 파랑(text-state-correct), 노랑·주황 주의 → 빨강(text-state-caution)
- 틴트 바탕 상자 → 중립 바탕(bg-level-1~3), 툴팁 → surface-raised + shadow-raised

### 미결 / 알려진 한계
- 하단 탭: 가이드 규칙상 hover 와 선택이 같은 파랑 — 구분 안 됨
- 미정 카드 띠가 빨강(오류 테두리 토큰 차용)
- 연한 회색 위 빨강 작은 글자 대비 2.8~3.2 (가이드 값 자체)
- 셰브론 아이콘 data URI 1건 색 고정
- Figma 실제 환경 렌더 미확인(미리보기만)

## 추가 — 하단 탭을 LNB 접힘 항목 사양으로
| 주체 | 내용 |
|---|---|
| 📖 | source-reader 가 build-components.ts:7463-7600 (buildSideNavItem) 판독 |
| ⭐ | .tab-btn 64×64 · 안쪽 2 · 아이콘 24 · 간격 2 · radius 6 · body/12R(선택 title/12B) · 선택=primary 파란 바탕+흰 아이콘·글자 · hover=navigation/bg--hover. 바 높이 60→72 |
| ⭐ 자가확인 | 렌더 실측 64×64·12px·아이콘 24 확인. 다크 미확인 |
