# Component Review

> 생성: 2026-05-11 / Phase: MVP0

## 등록된 Core Component

| 컴포넌트 | 상태 | Variants | 다크모드 |
|---------|------|----------|---------|
| Button | stable | primary / secondary / ghost / blue-line | candidate |
| Input | — (registry 미등록) | — | — |
| Checkbox | — (registry 미등록) | — | — |
| Chip | — (registry 미등록) | — | — |

## Button 사양 검증
- ✅ Danger variant 삭제 확정 반영
- ✅ 4개 variant 토큰 완비 (primary / secondary / ghost / blue-line)
- ⬜ blue-line: Figma componentSetKey 미확인
- ⬜ ghost: --button-ghost-focus-ring 미정의 (추가 필요)
- ⬜ dark mode 버튼 disabled 배경색 확정 필요

## 다음 등록 대상
1. Input (토큰 정의 완료 → registry/components/input.json 생성)
2. Checkbox (토큰 정의 완료 → registry/components/checkbox.json 생성)
3. Chip (구조 확정 후 → registry/components/chip.json 생성)
