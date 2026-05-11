# MVP3.3 Button Components Integration

**Status:** Complete  
**Date:** 2026-05-11

---

## Scope

Components > Button integration, existing document alignment, duplicate registry menu cleanup, and ACTION test column addition.

---

## Decisions

- Components > Button (`pages/components.html`) is the single user-facing entry point for Button.
- Existing `components.html` content is the primary source for user-facing guidance.
- Existing component documents are prioritized over registry when conflicts are found.
- Registry is corrected to reflect existing component standards.
- Button Harness (`pages/button-harness.html`) is no longer exposed as a separate main menu item.
- Component Registry and Component Tokens are not exposed as separate user-facing menus (System group only).
- ACTION column is an interactive test area.
- DEFAULT column is a static visual state only.
- Registry remains the internal source of truth after alignment.

---

## Existing Component Data vs Registry Inspection

### Existing Button Standard (components.html source)

- **Page:** `pages/components.html` — Button tab in Component Guide
- **Variants:** Primary, Secondary, Blue-line (ghost = not present, not shown)
- **PC Sizes:** medium (h44), xsmall (h34), xxsmall (h28)
- **Mobile Size:** mobile (h48)
- **Code class naming:**
  - Base: `s1-btn`
  - Variants: `s1-btn-primary`, `s1-btn-secondary`, `s1-btn-blue-line`
  - Sizes: `s1-btn-lg` (medium h44), no modifier (xsmall h34 = default), `s1-btn-sm` (xxsmall h28), `s1-btn-mobile` (mobile h48)
- **PC Matrix columns:** Default, Hover, Disabled
- **Mobile Matrix columns:** Default, Pressed, Disabled
- **State classes:** `is-hover`, `is-pressed`, `is-disabled`

### Registry button.json Standard (BEFORE alignment)

- **Variants:** `["primary", "secondary", "blue-line"]` ✅
- **pcSize:** `["sm", "md", "lg"]` ❌
- **mobileSize:** `["lg"]` ❌
- **State:** `["default", "hover", "pressed", "disabled"]` ✅
- **Sizing token mapping:** sm→xs(34px), md→md(44px), lg→lg(48px) — partially mismatched with label names
- **Figma valueMap sizes:** sm→"XSmall", md→"Medium", lg→"Large" ❌

---

## Existing Data Alignment

| Area | Existing Source | Registry Before | Registry After | Notes |
|---|---|---|---|---|
| Variants | primary, secondary, blue-line | same ✅ | unchanged | No change needed |
| PC Sizes | medium/xsmall/xxsmall | sm/md/lg ❌ | medium/xsmall/xxsmall ✅ | Aligned to components.html |
| Mobile Size | mobile (h48) | lg ❌ | mobile ✅ | Aligned to components.html |
| Size CSS class | s1-btn-lg/none/s1-btn-sm/s1-btn-mobile | not mapped ❌ | added cssClass per size ✅ | New sizing.pc/mobile array |
| Figma size valueMap | medium→Large, xsmall→Medium, xxsmall→XSmall | sm→XSmall, md→Medium, lg→Large ❌ | corrected ✅ | Figma names ≠ components.html labels |
| Harness columns | ACTION/Default/Hover/Disabled | not in registry ❌ | added harness.columns ✅ | New harness config block |
| Ghost variant | Not shown in components.html | listed as "legacy" | unchanged (pendingVariants) | Not surfaced in user-facing UI |

---

## Navigation Changes

| Item | Before | After |
|---|---|---|
| Button | Design System group → button-harness.html | Removed from nav. Access via Components > Button |
| Component Registry | System group (already) | Unchanged |
| Component Tokens | System group (already) | Unchanged |

---

## Button Page Changes (components.html)

- Added `ACTION` column (green header) before `Default` in all 6 Button matrices
- `Default`, `Hover` cells now have `.is-preview` (pointer-events: none)
- `Pressed` cells in Mobile matrices now have `.is-preview`
- Added CSS: `.is-preview`, `.action-cell`, `.action-tools`, `.action-tool-btn`, `.action-click-count`, `.matrix-col-header-action`
- Grid updated: `grid-template-columns: 68px 1fr 1fr 1fr 1fr` (4 data columns)

---

## Matrix Changes

- **Added:** ACTION before DEFAULT in all 3 PC matrices (Primary, Secondary, Blue-line)
- **Added:** ACTION before DEFAULT in all 3 Mobile matrices
- **DEFAULT column:** changed to static preview (`is-preview` class)
- **HOVER column:** changed to static preview (`is-preview` class)

---

## Interaction Test

- **Disabled toggle (`off` button):** Toggles `disabled` attribute on ACTION button. Label switches `off`/`on`.
- **Loading toggle (`load` button):** Toggles `is-loading` class + `aria-busy` attribute. Label switches `load`/`stop`.
- **Click counter:** Increments on each non-disabled, non-loading click.

---

## Registry Updates

| File | Change |
|---|---|
| `registry/components/button.json` | v0.2.0 → v0.3.0, pcSize corrected, mobileSize corrected, sizing array restructured, harness.columns added, Figma valueMap corrected |

---

## Remaining Issues

| Issue | Status | Action Required |
|---|---|---|
| `is-loading` class CSS not defined in components.html | Open | Add `s1-btn.is-loading` CSS (spinner / opacity) |
| Ghost variant CSS tokens exist in tokens.css | Legacy | Not surfaced. Preserved in pendingVariants. |
| Mobile matrix shows Pressed (not Hover) — design intent | Confirmed | PC=Hover, Mobile=Pressed. Correct per design. |
| button-harness.html tab structure | Separate | Still available at pages/button-harness.html for internal use |

---

## Human Decisions Needed

| # | Question | Context |
|---|---|---|
| 1 | Confirm Figma size name mapping | components.html "medium(h44)" = Figma "Large". Is this correct? |
| 2 | xxsmall h28 sizing token | registry uses `--sizing-button-height-xxs` — verify this token exists in tokens.css |
| 3 | `is-loading` visual design | Should loading state show spinner? Opacity reduction? Text change? |
| 4 | ACTION column: should it show focus-ring test too? | Currently only disabled + loading toggles. Keyboard focus test is implicit via Tab key. |

---

## Next Review

1. Validate Button page (components.html) with designer/publisher/developer use cases.
2. Compare Button visuals against Figma SW UX GUIDE V2.4.
3. Confirm final size naming and Figma/CSS class mapping.
4. Implement `is-loading` CSS in components.html.
5. Start Checkbox or Input implementation after Button page is approved.
