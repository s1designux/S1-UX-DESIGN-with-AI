# Source Guard Fix Suggestions

## Target

- **Path:** `/Users/designgroup_02/S1_AI_DESIGN_GUIDE/scripts/guard/__fixtures__/bad-service`
- **Date:** 2026-05-12
- **Total findings:** 16

---

## Summary

| Type | Count |
|---|---:|
| High confidence suggestions | 5 |
| Needs review | 7 |
| Human decisions needed | 4 |
| Unmapped | 0 |

---

## Suggested Fixes

| Confidence | Rule | File | Line | Current | Suggested | Notes |
|---|---|---|---:|---|---|---|
| medium | raw-hex | `scripts/guard/__fixtures__/bad-service/index.html` | 17 | `#0072CE` | `<div style="color: var(--color-brand-blue)">Inline HEX color` | Foundation token match only. Prefer semantic token for product UI. |
| needs-human | raw-rgba | `scripts/guard/__fixtures__/bad-service/index.html` | 20 | `rgba(...)` | — | rgba() requires human decision. Check token-exceptions EX02 (dark border) or EX03 (overlay). If neither applies, replace with a semantic token. |
| needs-review | raw-hex | `scripts/guard/__fixtures__/bad-service/index.html` | 23 | `#FFFFFF` | `<span style="backgroundColor: var(--color-text-inverse)">Whi` | Multiple semantic tokens share this color. Choose based on UI context. |
| needs-human | deprecated-button-variant | `scripts/guard/__fixtures__/bad-service/index.html` | 11 | `sw-button--ghost` | — | ghost is not an official Button variant (deprecated 2026-04-29). Choose secondary or blue-line based on visual context. |
| needs-human | deprecated-button-variant | `scripts/guard/__fixtures__/bad-service/index.html` | 14 | `s1-btn-danger` | — | "s1-btn-danger" is not an allowed Button variant. Allowed: primary, secondary, blue-line. |
| medium | ambiguous-button-variant | `scripts/guard/__fixtures__/bad-service/index.html` | 30 | `btn-outline` | `<button class="btn-blue-line">Outline Button</button>` | "outline" / "line" may be the intended "blue-line" variant. Verify before applying. |
| medium | inline-style-color | `scripts/guard/__fixtures__/bad-service/index.html` | 17 | `style="color: #0072CE"` | `<div style="color: var(--color-brand-blue)">Inline HEX color` | Foundation token match only. Prefer semantic token for product UI. Consider moving to a CSS class instead of inline style. |
| needs-review | inline-style-color | `scripts/guard/__fixtures__/bad-service/index.html` | 20 | `style="background: rgba(0, 114, 206, 0.5)"` | — | Inline style color detected. Move to CSS class with semantic token. |
| needs-review | inline-style-color | `scripts/guard/__fixtures__/bad-service/index.html` | 23 | `style="backgroundColor: #FFFFFF"` | `<span style="backgroundColor: var(--color-text-inverse)">Whi` | Multiple semantic tokens share this color. Choose based on UI context. Consider moving to a CSS class instead of inline style. |
| needs-review | raw-hex | `scripts/guard/__fixtures__/bad-service/style.css` | 5 | `#ffffff` | `background: var(--color-text-inverse);` | Multiple semantic tokens share this color. Choose based on UI context. |
| high | raw-rgb | `scripts/guard/__fixtures__/bad-service/style.css` | 8 | `rgb(...)` | `color: var(--color-text-primary);` | Exact semantic token match (light mode). |
| needs-human | raw-rgba | `scripts/guard/__fixtures__/bad-service/style.css` | 11 | `rgba(...)` | — | rgba() requires human decision. Check token-exceptions EX02 (dark border) or EX03 (overlay). If neither applies, replace with a semantic token. |
| medium | raw-hex | `scripts/guard/__fixtures__/bad-service/style.css` | 29 | `#0072CE` | `background: var(--color-brand-blue);` | Foundation token match only. Prefer semantic token for product UI. |
| needs-review | raw-hex | `scripts/guard/__fixtures__/bad-service/style.css` | 30 | `#fff` | `color: var(--color-text-inverse);` | Multiple semantic tokens share this color. Choose based on UI context. |
| needs-review | foundation-color-direct | `scripts/guard/__fixtures__/bad-service/style.css` | 14 | `--color-blue-400` | `border-color: var(--color-text-link);` | Multiple semantic tokens share this foundation primitive. Choose based on UI context. |
| needs-review | undefined-token | `scripts/guard/__fixtures__/bad-service/style.css` | 17 | `--unknown-token` | `color: var(--color-bg-home);` | Similar to "--unknown-token" (edit distance: 11). Verify the suggestion matches the intended semantics. |

---

## High Confidence Fix Candidates

### 1. raw-hex (medium)

**File:** `scripts/guard/__fixtures__/bad-service/index.html` · **Line:** 17

**Before:**
```
<div style="color: #0072CE">Inline HEX color</div>
```

**After:**
```
<div style="color: var(--color-brand-blue)">Inline HEX color</div>
```

**Reason:** Foundation token match only. Prefer semantic token for product UI.

### 2. ambiguous-button-variant (medium)

**File:** `scripts/guard/__fixtures__/bad-service/index.html` · **Line:** 30

**Before:**
```
<button class="btn-outline">Outline Button</button>
```

**After:**
```
<button class="btn-blue-line">Outline Button</button>
```

**Alternatives:**
- `blue-line`

**Reason:** "outline" / "line" may be the intended "blue-line" variant. Verify before applying.

### 3. inline-style-color (medium)

**File:** `scripts/guard/__fixtures__/bad-service/index.html` · **Line:** 17

**Before:**
```
<div style="color: #0072CE">Inline HEX color</div>
```

**After:**
```
<div style="color: var(--color-brand-blue)">Inline HEX color</div>
```

**Reason:** Foundation token match only. Prefer semantic token for product UI. Consider moving to a CSS class instead of inline style.

### 4. raw-rgb (high)

**File:** `scripts/guard/__fixtures__/bad-service/style.css` · **Line:** 8

**Before:**
```
color: rgb(32, 32, 32);
```

**After:**
```
color: var(--color-text-primary);
```

**Reason:** Exact semantic token match (light mode).

### 5. raw-hex (medium)

**File:** `scripts/guard/__fixtures__/bad-service/style.css` · **Line:** 29

**Before:**
```
background: #0072CE;
```

**After:**
```
background: var(--color-brand-blue);
```

**Reason:** Foundation token match only. Prefer semantic token for product UI.

---

## Needs Review

### 1. raw-hex

**File:** `scripts/guard/__fixtures__/bad-service/index.html` · **Line:** 23  
**Current:** `#FFFFFF`

**Possible fix:**
```
<span style="backgroundColor: var(--color-text-inverse)">White background span</span>
```

**Possible tokens:**
- `--color-border-white`
- `--color-icon-inverse`
- `--color-action-primary-text`
- `--color-surface-default`
- `--color-surface-raised`

**Decision needed:** Multiple semantic tokens share this color. Choose based on UI context.

### 2. inline-style-color

**File:** `scripts/guard/__fixtures__/bad-service/index.html` · **Line:** 20  
**Current:** `style="background: rgba(0, 114, 206, 0.5)"`

**Decision needed:** Inline style color detected. Move to CSS class with semantic token.

### 3. inline-style-color

**File:** `scripts/guard/__fixtures__/bad-service/index.html` · **Line:** 23  
**Current:** `style="backgroundColor: #FFFFFF"`

**Possible fix:**
```
<span style="backgroundColor: var(--color-text-inverse)">White background span</span>
```

**Possible tokens:**
- `--color-border-white`
- `--color-icon-inverse`
- `--color-action-primary-text`
- `--color-surface-default`
- `--color-surface-raised`

**Decision needed:** Multiple semantic tokens share this color. Choose based on UI context. Consider moving to a CSS class instead of inline style.

### 4. raw-hex

**File:** `scripts/guard/__fixtures__/bad-service/style.css` · **Line:** 5  
**Current:** `#ffffff`

**Possible fix:**
```
background: var(--color-text-inverse);
```

**Possible tokens:**
- `--color-border-white`
- `--color-icon-inverse`
- `--color-action-primary-text`
- `--color-surface-default`
- `--color-surface-raised`

**Decision needed:** Multiple semantic tokens share this color. Choose based on UI context.

### 5. raw-hex

**File:** `scripts/guard/__fixtures__/bad-service/style.css` · **Line:** 30  
**Current:** `#fff`

**Possible fix:**
```
color: var(--color-text-inverse);
```

**Possible tokens:**
- `--color-border-white`
- `--color-icon-inverse`
- `--color-action-primary-text`
- `--color-surface-default`
- `--color-surface-raised`

**Decision needed:** Multiple semantic tokens share this color. Choose based on UI context.

### 6. foundation-color-direct

**File:** `scripts/guard/__fixtures__/bad-service/style.css` · **Line:** 14  
**Current:** `--color-blue-400`

**Possible fix:**
```
border-color: var(--color-text-link);
```

**Possible tokens:**
- `--color-text-correct`
- `--color-border-focus`
- `--color-border-correct`
- `--color-icon-accent`
- `--color-action-primary-default`
- `--color-status-success`

**Decision needed:** Multiple semantic tokens share this foundation primitive. Choose based on UI context.

### 7. undefined-token

**File:** `scripts/guard/__fixtures__/bad-service/style.css` · **Line:** 17  
**Current:** `--unknown-token`

**Possible fix:**
```
color: var(--color-bg-home);
```

**Possible tokens:**
- `--color-bg-muted`
- `--color-overlay`

**Decision needed:** Similar to "--unknown-token" (edit distance: 11). Verify the suggestion matches the intended semantics.

---

## Human Decisions Needed

### 1. raw-rgba

**File:** `scripts/guard/__fixtures__/bad-service/index.html` · **Line:** 20  
**Current:** `rgba(...)`

**Decision needed:** rgba() requires human decision. Check token-exceptions EX02 (dark border) or EX03 (overlay). If neither applies, replace with a semantic token.

### 2. deprecated-button-variant

**File:** `scripts/guard/__fixtures__/bad-service/index.html` · **Line:** 11  
**Current:** `sw-button--ghost`

**Possible alternatives:**
- `primary`
- `secondary`
- `blue-line`

**Decision needed:** ghost is not an official Button variant (deprecated 2026-04-29). Choose secondary or blue-line based on visual context.

### 3. deprecated-button-variant

**File:** `scripts/guard/__fixtures__/bad-service/index.html` · **Line:** 14  
**Current:** `s1-btn-danger`

**Possible alternatives:**
- `primary`
- `secondary`
- `blue-line`

**Decision needed:** "s1-btn-danger" is not an allowed Button variant. Allowed: primary, secondary, blue-line.

### 4. raw-rgba

**File:** `scripts/guard/__fixtures__/bad-service/style.css` · **Line:** 11  
**Current:** `rgba(...)`

**Decision needed:** rgba() requires human decision. Check token-exceptions EX02 (dark border) or EX03 (overlay). If neither applies, replace with a semantic token.

---

## Patch Candidate

- **Generated:** yes
- **Path:** `reports/patch-candidates-bad-service.diff`
- **Patchable items:** 1

> Apply with: `patch -p0 < patch-candidates-bad-service.diff`  
> **Review the diff before applying.**

---

## Notes

- This report is generated from SW Design System Source Guard Fix Suggestions (MVP3.6).
- The design system repository is the source of truth.
- **External service files are NOT modified.** Apply suggestions manually after review.
- Scanning is regex-based (MVP). No AST parser used.
- rgba values always require human review.
- Button variant changes (ghost → secondary/blue-line) always require human decision.

---

*Generated by `npm run guard:suggest`*