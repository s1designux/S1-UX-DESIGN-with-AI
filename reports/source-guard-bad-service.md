# Source Guard Report

## Target

- **Path:** `/Users/designgroup_02/S1_AI_DESIGN_GUIDE/scripts/guard/__fixtures__/bad-service`
- **Date:** 2026-05-18
- **Status:** ❌ FAIL
- **Files scanned:** 2

---

## Summary

| Severity | Count |
|---|---:|
| Error | 12 |
| Warning | 4 |
| Info | 0 |

---

## Checks

- Raw HEX usage
- RGB/RGBA color usage
- Undefined CSS variables
- Foundation color direct usage
- Button variant violations
- Inline style colors

---

## Issues

| Severity | Rule | File | Line | Value | Message |
| --- | --- | --- | ---: | --- | --- |
| ERROR | raw-hex | `scripts/guard/__fixtures__/bad-service/index.html` | 17 | `#0072CE` | Raw HEX color found. Use SW Design System token instead. |
| ERROR | raw-hex | `scripts/guard/__fixtures__/bad-service/index.html` | 23 | `#FFFFFF` | Raw HEX color found. Use SW Design System token instead. |
| ERROR | deprecated-button-variant | `scripts/guard/__fixtures__/bad-service/index.html` | 11 | `sw-button--ghost` | Deprecated Button variant "ghost" found. Allowed variants: primary, secondary, blue-line. |
| ERROR | deprecated-button-variant | `scripts/guard/__fixtures__/bad-service/index.html` | 14 | `s1-btn-danger` | Deprecated Button variant "danger" found. Allowed variants: primary, secondary, blue-line. |
| ERROR | inline-style-color | `scripts/guard/__fixtures__/bad-service/index.html` | 17 | `style="color: #0072CE"` | Inline style with hardcoded color found. Use CSS class with design token instead. |
| ERROR | inline-style-color | `scripts/guard/__fixtures__/bad-service/index.html` | 20 | `style="background: rgba(0, 114, 206, 0.5)"` | Inline style with hardcoded color found. Use CSS class with design token instead. |
| ERROR | inline-style-color | `scripts/guard/__fixtures__/bad-service/index.html` | 23 | `style="backgroundColor: #FFFFFF"` | Inline style with hardcoded color found. Use CSS class with design token instead. |
| ERROR | raw-hex | `scripts/guard/__fixtures__/bad-service/style.css` | 5 | `#ffffff` | Raw HEX color found. Use SW Design System token instead. |
| ERROR | raw-rgb | `scripts/guard/__fixtures__/bad-service/style.css` | 8 | `rgb(...)` | rgb() color found. Use SW Design System semantic token instead. |
| ERROR | raw-hex | `scripts/guard/__fixtures__/bad-service/style.css` | 29 | `#0072CE` | Raw HEX color found. Use SW Design System token instead. |
| ERROR | raw-hex | `scripts/guard/__fixtures__/bad-service/style.css` | 30 | `#fff` | Raw HEX color found. Use SW Design System token instead. |
| ERROR | undefined-token | `scripts/guard/__fixtures__/bad-service/style.css` | 17 | `--unknown-token` | CSS variable not found in SW Design System registry. |
| WARNING | raw-rgba | `scripts/guard/__fixtures__/bad-service/index.html` | 20 | `rgba(...)` | rgba() color found. Allowed only for dark-border and overlay tokens (token-exceptions EX02, EX03). Verify this is an approved use. |
| WARNING | ambiguous-button-variant | `scripts/guard/__fixtures__/bad-service/index.html` | 30 | `btn-outline` | Ambiguous Button variant "outline" — may conflict with official "blue-line". Verify: only primary, secondary, blue-line are allowed. |
| WARNING | raw-rgba | `scripts/guard/__fixtures__/bad-service/style.css` | 11 | `rgba(...)` | rgba() color found. Allowed only for dark-border and overlay tokens (token-exceptions EX02, EX03). Verify this is an approved use. |
| WARNING | foundation-color-direct | `scripts/guard/__fixtures__/bad-service/style.css` | 14 | `--color-blue-400` | Foundation color primitive used directly. Reference Semantic token instead (e.g. --color-text-*, --color-bg-*, --color-action-*). |

---

## Recommended Fixes

- Replace raw HEX / rgb() colors with SW Design System semantic tokens.
- Replace undefined CSS variables with registered token names.
- Replace deprecated Button variants (ghost, danger) with primary, secondary, or blue-line.
- Remove inline `style` color attributes and use design token classes.

---

## Human Decisions Needed

- **rgba() usage (2 occurrences):** Verify each rgba() is an approved exception (dark-border or overlay token per token-exceptions EX02/EX03). All other rgba() must be replaced with semantic tokens.
- **Foundation color direct usage (1 occurrence):** Each reference to a foundation primitive (--color-blue-*, --color-gray-*, etc.) should be replaced with the appropriate semantic token. Review intent before replacing.
- **Ambiguous button variant (1 occurrence):** "outline" / "line" may be confused with official "blue-line". Confirm whether these should be migrated to "blue-line".

---

## Notes

- This report is generated from SW Design System Source Guard.
- The design guide repository (`S1_AI_DESIGN_GUIDE`) is the source of truth.
- The target project is scanned as an external service implementation.
- Scanning is regex-based (MVP). No AST parser or Figma file scan yet.
- Run: `npm run guard -- --target /Users/designgroup_02/S1_AI_DESIGN_GUIDE/scripts/guard/__fixtures__/bad-service`

---

*Generated by `npm run guard`*