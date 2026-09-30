# 1-inventory — 승격 후보 4종 재고조사 (2026-09-29)

| 부품 | 정본(설치기) | registry | 승인 시제품 | 웹 배포본 | 설치기 묶음 |
|---|---|---|---|---|---|
| Expandable Card (접힘카드) | 없었음 → **신설** `buildExpandableCard` | 없었음 → **신설** | `restyle-candidates.css §4` | 0.13.17 포함 | List |
| Divider (구분선) | 없었음 → **신설** `buildDivider` | 없었음 → **신설** | `restyle-candidates.css §2` | 0.13.17 포함 | Common (신설) |
| Side Nav (사이드바 메뉴) | 없음 — **보류** | 미작성 | `restyle-candidates.css §3` | 원본 코드만(배포 제외) | Navigation (예정) |
| Data Tag (뱃지) | 없음 — **보류** | 미작성 | `restyle-candidates.css §1` | 원본 코드만(배포 제외) | Chip (예정) |

## 확인한 사실
- 네 부품 모두 정본 `build-components.ts` 에 없었다(grep 확인). 전부 신설 대상이다.
- 접힘카드만 레거시 원본이 있다 — V2.4 `card` 시트의 `expandable-card`(540:6547 닫힘 / 540:6555 펼침). REST 로 실측했다.
- 나머지 셋은 레거시 원본이 없고 river 지시로 설계한 것이다(intent-spec).
- 색은 네 부품 모두 semantic 경유. 예외는 뱃지 채움색뿐이다(아래 미확인).

## 미확인 / 결정 대기
- 뱃지 채움·테두리에 쓸 「강조색」 semantic 이름 — 정본에 없음.
- 사이드바 판 접기 아이콘(`ic_패널접기`) — 웹 아이콘 가이드에는 있고 Figma 아이콘 라이브러리에는 없음.
- 사이드바 펼침 가로 240 / 280 — 정본에 크기 토큰 없음(리터럴로 둠).
- 정본 `navigation/label/default` 다크값이 아이콘보다 어두움.
