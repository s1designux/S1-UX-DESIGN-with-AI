# build-components.ts Token Extraction Report

**Date:** 2026-07-02  
**Source:** `/plugins/figma-vars-installer/src/build-components.ts`  
**Scope:** 18 component builder functions  
**Purpose:** Audit direct `requireVar()` token calls across core platform and system components

---

## Executive Summary

Analyzed all **18 target builder functions** for direct token variable calls. 

**Key Metric:**
| Metric | Value |
|--------|-------|
| **Functions analyzed** | 18 |
| **Functions with direct requireVar() calls** | 2 (11%) |
| **Functions with NO direct requireVar() calls** | 16 (89%) |
| **Total unique color tokens** | 2 |
| **Total unique number tokens** | 2 |

**Functions with token dependencies:**
- `buildCI` — 2 color tokens
- `buildFooter` — 2 number tokens

---

## Detailed Results

### buildStatusBar
- **Line range:** 3435–3468
- **Token calls:** None
- **Pattern:** Uses `setLightMode()` helper for light mode styling

### buildNavBar
- **Line range:** 3537–3568
- **Token calls:** None
- **Pattern:** Uses `populateAndroidNav()` helper, `setLightMode()` for styling

### buildCI ✓
- **Line range:** 3751–3805
- **Token calls:**
  ```
  - color: brand/ci, gray/50
  ```
- **Details:**
  - Line 3755: `requireVar(maps.foundationColor, "brand/ci", "Foundation Color")`
  - Line 3801: `requireVar(maps.foundationColor, "gray/50", "Foundation Color")`
- **Context:** CI logo component uses brand/ci Foundation color for Blue logo variant, and gray/50 as background fill for White logo legibility

### buildLoginGNB
- **Line range:** 3572–3619
- **Token calls:** None
- **Pattern:** Uses `scv()` helper for semantic color resolution

### buildWebTabBar
- **Line range:** 3623–3727
- **Token calls:** None
- **Pattern:** Uses `scv()` helper

### buildFooter ✓
- **Line range:** 3327–3433
- **Token calls:**
  ```
  - number: spacing/28, spacing/4
  ```
- **Details:**
  - Line 3342: `requireVar(maps.foundationNumber, "spacing/28", "Foundation Number")`
  - Line 3389: `requireVar(maps.foundationNumber, "spacing/4", "Foundation Number")`
- **Context:** Footer layout uses Foundation spacing primitives for padding calculations

### buildGNBUtilIcon
- **Line range:** 2420–2469
- **Token calls:** None
- **Pattern:** Uses `scv()` helper for icon colors

### buildLanguageIcon
- **Line range:** 2473–2510
- **Token calls:** None
- **Pattern:** Uses `scv()` helper

### buildLineTabSet
- **Line range:** 1472–1544
- **Token calls:** None
- **Pattern:** Uses helper functions for styling

### buildPaginationCell
- **Line range:** 2181–2288
- **Token calls:** None
- **Pattern:** Uses `scv()` helper for color resolution

### buildMultiToggleElement
- **Line range:** 3812–3941
- **Token calls:** None
- **Pattern:** Uses `scv()` helper via `colorSlot()` internal function for button token colors

### buildCalendar
- **Line range:** 2848–3004
- **Token calls:** None
- **Pattern:** Uses helper functions and `scv()` for styling

### buildCalendarCell
- **Line range:** 2659–2728
- **Token calls:** None
- **Pattern:** Uses `scv()` helper

### buildCalendarTile
- **Line range:** 2732–2760
- **Token calls:** None
- **Pattern:** Uses `scv()` helper

### buildDatePickerBottomSheet
- **Line range:** 3087–3190
- **Token calls:** None
- **Pattern:** Uses helper functions, `scv()` for colors

### buildTimePickerDropdown
- **Line range:** 2033–2171
- **Token calls:** None
- **Pattern:** Uses helper functions for styling

### buildTimePickerCell
- **Line range:** 1993–2020
- **Token calls:** None
- **Pattern:** Uses `scv()` helper

### buildTableCell
- **Line range:** 1548–1602
- **Token calls:** None
- **Pattern:** Uses `scv()` helper for all color references (table cell, header, border colors)

---

## Analysis: Token Resolution Patterns

### Direct requireVar() Usage (2 functions, 4 calls)
Both direct calls use **Foundation-level tokens**:
- **Foundation Colors:** `brand/ci`, `gray/50` (buildCI)
- **Foundation Numbers:** `spacing/28`, `spacing/4` (buildFooter)

### Indirect Token Usage (16 functions)
Majority use abstraction layers:
- **`scv(maps, "color/...")` helper** — Semantic color variable resolution (wrapped)
  - Used in: buildLoginGNB, buildWebTabBar, buildGNBUtilIcon, buildLanguageIcon, buildPaginationCell, buildMultiToggleElement, buildCalendar, buildCalendarCell, buildCalendarTile, buildDatePickerBottomSheet, buildTimePickerCell, buildTableCell
  - Pattern: Color tokens stored as **string literals** in config objects, resolved by `scv()` at call site
  
- **`setLightMode()` helper** — Light mode styling wrapper
  - Used in: buildStatusBar, buildNavBar, buildCI, buildFooter, and others
  - Pattern: Sets Light/Dark color fills via helper function abstraction

- **Literal token strings in configs**
  - Example: `{ bg: "color/button/bg/primary--default", border: "color/button/border/primary--default" }`
  - Resolved later by `scv(maps, tokenKey)` at render time

---

## Architectural Insight

The build layer uses **two-tier token resolution:**

1. **Config layer** — Semantic token keys as **literal strings**
   ```typescript
   const colorSlot = (st: St) => ({
     bg: "color/button/bg/secondary--default",
     border: "color/button/border/secondary--default",
     text: "color/button/label/secondary--default"
   });
   ```

2. **Render layer** — Resolved by helper functions
   ```typescript
   comp.fills = [boundPaint(scv(maps, slot.bg))];
   ```

**Why?**
- **Separation of concerns:** Config (what tokens) vs. Implementation (how to bind)
- **Reduced coupling:** Builders don't import token maps directly; helpers manage dependency injection
- **Flexibility:** Token key names can change without rebuilding all 18 functions

---

## Coverage Analysis

### Token Coverage by Map Type

| Map Type | Direct Calls | Functions |
|----------|-------------|-----------|
| semanticColor | 0 | — |
| foundationColor | 2 | buildCI |
| foundationNumber | 2 | buildFooter |
| semanticNumber | 0 | — |

**Observation:** Only **Foundation-level tokens** appear in direct requireVar() calls. All Semantic tokens are resolved indirectly through `scv()` abstraction.

---

## Implications for Token Changes

### If a Foundation Token Changes
- **Direct impact:** buildCI, buildFooter
- **Scope:** Minimal (2 functions, 4 tokens)
- **Risk:** Low — changes propagate directly

### If a Semantic Token Changes
- **Direct impact:** None (all 18 functions use indirection)
- **Scope:** Token resolution layer (`scv()` function, maps definitions)
- **Risk:** Medium — abstraction hides impact; verify at Figma render stage

### If semantic.colors.json or vars-data.ts Changes
- **Direct impact:** All 16 functions (indirectly, via `scv()`)
- **Scope:** Entire installer ZIP rebuild required
- **Risk:** High — affects all UI styling; Gate 7 (Token Sync Monitor) required

---

## Validation Checklist

- [x] All 18 functions line-range verified
- [x] requireVar() calls extracted by map type
- [x] No calls to deprecated token patterns found
- [x] All calls match audit-rules.json token naming convention
- [x] Foundation colors in buildCI match registry/foundation.colors.json
- [x] Foundation numbers in buildFooter match registry/foundation.colors.json spacing definitions

---

## Recommendations

1. **Gate 8 (Component Key Coverage)** covers dynamic token assembly; ensure `colorSlot()` and similar config objects are audited alongside direct calls
2. **If adding new direct requireVar() calls:** Update this report and ensure foundational tokens are tracked in audit-rules.json R01/R02
3. **For Semantic token changes:** Verify impact by regenerating installer and testing `npm run installer:build` output

---

**Generated by:** build-components token extraction audit  
**Last updated:** 2026-07-02
