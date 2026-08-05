---
paths:
  - "plugins/figma-vars-installer/**"
---

# 설치기 규칙 (표시 순서 ≠ 빌드 순서)

> CLAUDE.md 에서 이동(2026-08-05). 문장은 원문 그대로다. Gate 13(빌드자≠검증자 집행)·하드룰은 루트 CLAUDE.md 소관.

## 📐 표시(나열) 순서 ≠ 빌드(생성) 순서 규칙 (2026-06-24 확정 · 영구)

설치기/Figma 생성기(`build-components.ts`)와 프리뷰(`render.js`)에서 컴포넌트를 다룰 때 **두 순서를 분리**한다.

| 구분 | 순서 기준 | 원칙 |
|------|----------|------|
| **표시(나열) 순서** | `COMPONENT_CATEGORIES_GRID` 의 `members` 배열 | **메인 컴포넌트 → 그 안을 구성하는 요소 컴포넌트** 순 (예: Select Box → Dropdown → Dropdown List) |
| **빌드(생성) 순서** | `BUILD_DEPENDENCIES` 위상정렬(`buildOrderFor`) | **요소 컴포넌트 먼저** — 부모가 자식을 인스턴스로 부착하므로(예: Select Box Open 이 Dropdown 을 `BUILT_COMPS` 에서 가져다 붙임) 자식이 먼저 빌드돼야 함 |

- `members` 는 **항상 표시 순서**로만 유지한다. 빌드 의존성 때문에 members 를 재배열하지 않는다(그렇게 하면 나열 순서가 깨진다 — 이번 회귀의 원인).
- 부모↔자식 부착 관계가 새로 생기면 `BUILD_DEPENDENCIES[부모] = [자식…]` 에 한 줄 추가한다. 빌드는 `buildOrderFor` 가 요소를 먼저 생성하고, `buildAllComponents` 의 layout 패스가 카테고리 내부를 members(표시) 순서로 세로 재배치한다. 프리뷰는 `render.js` 가 categorySets 를 members 순서로 정렬한다.
- 이 규칙 변경(루프·BUILD_DEPENDENCIES)은 `build-components.ts` 구조 변경 → ⭐ 단독 자가검증 금지, 🤖 component-verifier 검증(Gate 13) 필수.

---

