## Orchestrator Summary — GNB 유틸 아이콘 24 교정 (0.22.1)

기준: Figma V3.0 TEST 2759:41799 (GNB xsm) · 정본 build-components.ts buildGNBUtilIcon(iconBox 32 안 24) · buildLanguageIcon(globe 프레임 32 안 24, 간격 4, 오른쪽 8)

### 변경 내용
| 주체 | 파일 | 변경 내용 |
|------|------|---------|
| ⭐ | ui-library/src/components/gnb/gnb.css | lang-icon·account-icon·menu-icon 32 → `--sizing-24`. lang-icon 에 `margin: var(--spacing-4)` 로 32 칸 안 24 가운데. 버튼 칸(account·menu-toggle) 32 유지 |
| ⭐ | ui-library/package.json · release-log.json | 0.22.1 (끝자리 — 값만 바뀜) |
| ⭐ | ui-library/dist/** · assets/downloads/** · pages/install-prompt.html | 빌드·zip·다운로드 화면 재생성 |
| ⭐ | reports/legacy-crosswalk-board/** | 검수판 새로고침·재게시 |

### 실측 (headless, 1920 폭)
| 크기 | 바 높이 | 유틸 폭 | 지구본 | 계정 칸/아이콘 | 메뉴 칸/아이콘 |
|---|---|---|---|---|---|
| md | 56 | 159.5 | 24 (칸 32 안 +4) | 32 / 24 | 32 / 24 |
| sm | 48 | 159.5 | 24 | 32 / 24 | 32 / 24 |
| xsm | 36 | 159.5 (Figma 160) | 24 | 32 / 24 | 32 / 24 |

지구본 잉크 세로 범위(32 칸 기준): Figma 9–26 · 고치기 전 6–29 · 고친 뒤 md/sm/xsm 9–26.
비교 그림: screens/util-icon-24-compare.png

### 검사기 결과
| 검사기 | 결과 |
|------|------|
| 🔎 ui:contract · ui:version · ui:build:check · ui:test · ui:test:check | ✅ |
| 🔎 ui:icons · ui:icons:origin · ui:guide:render · ui:react · ui:keyboard | ✅ |
| 🔎 gate:check | ✅ PASS (경고 23 — 기존 항목) |

### 자가인증 범위
- ⭐ 자가인증: 값 2개(아이콘 크기·지구본 여백) 기계적 수정이라 🤖 별도 검증은 돌리지 않음. Light 렌더만 대조, Dark 는 색 변경이 없어 생략.
