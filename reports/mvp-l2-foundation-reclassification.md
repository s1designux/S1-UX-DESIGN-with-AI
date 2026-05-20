# MVP-L2 — Foundation Layer 재분류 결과

**Date:** 2026-05-20
**Phase:** MVP-L2 (Foundation Reclassification)
**Source:** reports/mvp-l1-legacy-token-audit.md + registry/figma/snapshots/figma-variable-metadata.ux-guide-2.4.json

---

## 1. 결론

| 항목 | 내용 |
|---|---|
| 기존 Foundation 0 판단 | classifier가 `collectionName === "Primitive"`로 판별했으나 실제 컬렉션 이름은 "Foundation" |
| 원인 | 스크립트 하드코딩 오류 — "Primitive" 문자열 vs 실제 "Foundation" 컬렉션 이름 |
| Foundation 후보 count | **133개** (collection 기준 108개 + name pattern 기준 25개) |

---

## 2. layer 재분류 요약

| layer | before | after |
|---|---:|---:|
| Foundation Token | 0 | **133** |
| Semantic Token | 271 | **138** |
| Component Token | — | 0 (별도 registry 관리) |
| Needs Review | — | **115** |

> **token layer 기준 (이 프로젝트 공식):**
> Foundation Token → Semantic Token → Component Token

---

## 3. Foundation 후보 예시

| variable name | reason | confidence |
|---|---|---|
| `surface/base-background/default` | name pattern: "base" | medium |
| `surface/base-background/home` | name pattern: "base" | medium |
| `surface/neutral/bg/base` | name pattern: "base" | medium |
| `surface/neutral/bg/base-alt` | name pattern: "base" | medium |
| `surface/neutral/bg/subtle` | name pattern: "neutral" | medium |
| `surface/neutral/bg/strong` | name pattern: "neutral" | medium |

---

## 4. Foundation namespace 분석

| namespace | count | 예시 |
|---|---:|---|
| `color/gray/*` | 11 | `color/gray/0` |
| `color/blue/*` | 10 | `color/blue/50` |
| `color/red/*` | 10 | `color/red/50` |
| `color/orange/*` | 10 | `color/orange/50` |
| `color/yellow/*` | 10 | `color/yellow/50` |
| `color/green/*` | 10 | `color/green/50` |
| `color/skyblue/*` | 10 | `color/skyblue/50` |
| `color/purple/*` | 10 | `color/purple/50` |
| `color/brown/*` | 10 | `color/brown/50` |
| `color/visual-gray/*` | 10 | `color/visual-gray/50` |
| `surface/neutral/*` | 6 | `surface/neutral/bg/base` |
| `color/button/*` | 6 | `color/button/bg/blue-line--default` |
| `color/icon/*` | 6 | `color/icon/blue` |
| `color/line/*` | 5 | `color/line/gray/default` |
| `color/brand/*` | 4 | `color/brand/red` |
| `color/base/*` | 3 | `color/base/white` |
| `surface/base-background/*` | 2 | `surface/base-background/default` |

---

## 5. name pattern으로 추가 발견된 Foundation 후보

컬렉션 이름이 "Foundation"이 아니지만 variable 이름 패턴이 Foundation에 해당하는 항목입니다.
confidence "medium" — 사람 검수 필요.

| variable name | collection | reason | confidence |
|---|---|---|---|
| `surface/base-background/default` | semantic | name pattern: "base" | medium |
| `surface/base-background/home` | semantic | name pattern: "base" | medium |
| `surface/neutral/bg/base` | semantic | name pattern: "base" | medium |
| `surface/neutral/bg/base-alt` | semantic | name pattern: "base" | medium |
| `surface/neutral/bg/subtle` | semantic | name pattern: "neutral" | medium |
| `surface/neutral/bg/strong` | semantic | name pattern: "neutral" | medium |
| `surface/neutral/border/border` | semantic | name pattern: "neutral" | medium |
| `color/button/bg/blue-line--default` | semantic | name pattern: "blue" | medium |

---

## 6. canonical layer 제안

이 프로젝트의 token architecture 공식 3계층:

```
Foundation Token   (기본 팔레트 — gray/blue/red scale 등)
       ↓
Semantic Token     (역할 기반 — bg/text/border/action 등)
       ↓
Component Token    (컴포넌트 별칭 — --input-* / --button-* 등)
```

| 기존/일반 용어 | 이 프로젝트 공식 용어 |
|---|---|
| Primitive | Foundation |
| Base Palette | Foundation |
| Raw Color | Foundation |
| Semantic | Semantic |
| Component Alias | Component |

---

## 7. 수정/생성 파일

| 파일 | 변경 내용 |
|---|---|
| `registry/tokens/legacy-token-map.json` | v0.2.0 — suggestedLayer / suggestedGroup / classificationReason 필드 추가 |
| `reports/mvp-l1-legacy-token-audit.md` | Foundation COLOR 0 오류 정정, Foundation Token 용어 적용 |
| `reports/mvp-l2-foundation-reclassification.md` | Foundation 재분류 결과 생성 (이 파일) |

---

## 8. 금지 사항

- Figma Variable rename 금지
- Figma write 금지
- canonical registry 자동 확정 금지
- foundation-candidate를 바로 final canonical으로 확정 금지
- legacy token 삭제 금지
