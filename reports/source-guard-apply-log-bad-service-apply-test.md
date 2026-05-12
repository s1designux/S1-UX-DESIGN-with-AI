# Source Guard Apply Log

## Target

- **Path:** `/tmp/bad-service-apply-test`
- **Date:** 2026-05-12
- **Mode:** apply

---

## Summary

| Type | Count |
|---|---:|
| Applied | 1 |
| Skipped | 15 |
| Human decisions needed | 15 |
| Errors | 0 |

---

## Applied Changes

| File | Line | Before | After | Reason |
|---|---:|---|---|---|
| `../../../tmp/bad-service-apply-test/style.css` | 8 | `color: rgb(32, 32, 32);` | `color: var(--color-text-primary);` | Exact semantic token match (light mode). |

## Skipped

| File | Line | Value | Reason |
|---|---:|---|---|
| `../../../tmp/bad-service-apply-test/index.html` | 17 | `#0072CE` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/index.html` | 20 | `rgba(...)` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/index.html` | 23 | `#FFFFFF` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/index.html` | 11 | `sw-button--ghost` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/index.html` | 14 | `s1-btn-danger` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/index.html` | 30 | `btn-outline` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/index.html` | 17 | `style="color: #0072CE"` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/index.html` | 20 | `style="background: rgba(0, 114, 206, 0.5)"` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/index.html` | 23 | `style="backgroundColor: #FFFFFF"` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/style.css` | 5 | `#ffffff` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/style.css` | 11 | `rgba(...)` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/style.css` | 29 | `#0072CE` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/style.css` | 30 | `#fff` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/style.css` | 14 | `--color-blue-400` | Not marked patchable by suggestion engine. |
| `../../../tmp/bad-service-apply-test/style.css` | 17 | `--unknown-token` | Not marked patchable by suggestion engine. |

## Human Decisions Needed

- `../../../tmp/bad-service-apply-test/index.html` line 17: **raw-hex** — `#0072CE` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/index.html` line 20: **raw-rgba** — `rgba(...)` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/index.html` line 23: **raw-hex** — `#FFFFFF` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/index.html` line 11: **deprecated-button-variant** — `sw-button--ghost` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/index.html` line 14: **deprecated-button-variant** — `s1-btn-danger` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/index.html` line 30: **ambiguous-button-variant** — `btn-outline` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/index.html` line 17: **inline-style-color** — `style="color: #0072CE"` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/index.html` line 20: **inline-style-color** — `style="background: rgba(0, 114, 206, 0.5)"` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/index.html` line 23: **inline-style-color** — `style="backgroundColor: #FFFFFF"` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/style.css` line 5: **raw-hex** — `#ffffff` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/style.css` line 11: **raw-rgba** — `rgba(...)` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/style.css` line 29: **raw-hex** — `#0072CE` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/style.css` line 30: **raw-hex** — `#fff` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/style.css` line 14: **foundation-color-direct** — `--color-blue-400` — Not marked patchable by suggestion engine.
- `../../../tmp/bad-service-apply-test/style.css` line 17: **undefined-token** — `--unknown-token` — Not marked patchable by suggestion engine.

---

## Backup

- **Location:** `reports/apply-backups/bad-service-apply-test-2026-05-12T03-37`

---

## Notes

- Only high-confidence fixes were applied.
- ghost/danger variants were NOT auto-fixed. Human decision required.
- rgba() values were NOT auto-fixed. token-exceptions review required.
- Ambiguous colors (#FFFFFF etc.) were NOT auto-fixed.
- Files were modified in-place. See backup for originals.

---

*Generated by `npm run guard:apply`*