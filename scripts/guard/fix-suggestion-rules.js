'use strict';

/**
 * Fix Suggestion Rules.
 * Each rule takes a finding (from Source Guard) + context and returns
 * a suggestion object:
 * {
 *   confidence,   // 'high' | 'medium' | 'needs-review' | 'needs-human' | 'unmapped'
 *   before,       // original code snippet
 *   after,        // suggested replacement (null if needs-human)
 *   alternatives, // array of other token candidates
 *   note,         // explanation
 *   patchable,    // true = safe to include in patch candidate
 * }
 */

// ── Helpers ───────────────────────────────────────────────────────
const HEX_VALUE_RE  = /(#[0-9a-fA-F]{3,8})\b/g;
const RGB_VALUE_RE  = /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi;
const VAR_TOKEN_RE  = /var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,[^)]+)?\)/g;

function replaceFirst(str, search, replacement) {
  return str.replace(search, replacement);
}

// ── Rule: raw-hex ─────────────────────────────────────────────────
function suggestRawHex(finding, lineContent, engine) {
  const hex = finding.value;
  const suggestion = engine.suggestForHex(hex);
  if (!suggestion) return null;

  const token = suggestion.primary;
  const after  = token ? replaceFirst(lineContent, hex, `var(${token})`) : null;

  return {
    confidence:   suggestion.confidence,
    before:       lineContent.trim(),
    after:        after?.trim() ?? null,
    alternatives: suggestion.alternatives,
    note:         suggestion.note,
    patchable:    suggestion.confidence === 'high' && !!token,
  };
}

// ── Rule: raw-rgb ─────────────────────────────────────────────────
function suggestRawRgb(finding, lineContent, engine) {
  RGB_VALUE_RE.lastIndex = 0;
  const m = RGB_VALUE_RE.exec(lineContent);
  if (!m) return { confidence: 'needs-review', before: lineContent.trim(), after: null, alternatives: [], note: 'Could not parse rgb() value. Manual review needed.', patchable: false };

  const suggestion = engine.suggestForRgb(m[0]);
  if (!suggestion) return { confidence: 'unmapped', before: lineContent.trim(), after: null, alternatives: [], note: 'No token match for this rgb() value.', patchable: false };

  const token = suggestion.primary;
  const after  = token ? replaceFirst(lineContent, m[0], `var(${token})`) : null;
  return {
    confidence:   suggestion.confidence,
    before:       lineContent.trim(),
    after:        after?.trim() ?? null,
    alternatives: suggestion.alternatives,
    note:         suggestion.note,
    patchable:    suggestion.confidence === 'high' && !!token,
  };
}

// ── Rule: raw-rgba ────────────────────────────────────────────────
function suggestRawRgba(finding, lineContent) {
  return {
    confidence:   'needs-human',
    before:       lineContent.trim(),
    after:        null,
    alternatives: [],
    note:         'rgba() requires human decision. Check token-exceptions EX02 (dark border) or EX03 (overlay). If neither applies, replace with a semantic token.',
    patchable:    false,
  };
}

// ── Rule: foundation-color-direct ────────────────────────────────
function suggestFoundationDirect(finding, lineContent, engine) {
  const token     = finding.value;
  const suggestion = engine.suggestForFoundationVar(token);

  const after = suggestion.primary
    ? lineContent.trim().replace(token, suggestion.primary)
    : null;

  return {
    confidence:   suggestion.confidence,
    before:       lineContent.trim(),
    after:        after ?? null,
    alternatives: suggestion.alternatives,
    note:         suggestion.note,
    patchable:    suggestion.confidence === 'high' && !!suggestion.primary,
  };
}

// ── Rule: undefined-token ─────────────────────────────────────────
function suggestUndefinedToken(finding, lineContent, engine) {
  const token     = finding.value;
  const suggestion = engine.suggestForUndefinedToken(token);

  const after = suggestion.primary
    ? lineContent.trim().replace(`var(${token})`, `var(${suggestion.primary})`)
    : null;

  return {
    confidence:   suggestion.confidence === 'high' ? 'medium' : suggestion.confidence,
    before:       lineContent.trim(),
    after:        after ?? null,
    alternatives: suggestion.alternatives,
    note:         suggestion.note + ' Verify the suggestion matches the intended semantics.',
    patchable:    false, // undefined token replacements always need human review
  };
}

// ── Rule: deprecated-button-variant ──────────────────────────────
function suggestDeprecatedButtonVariant(finding, lineContent, allowedVariants) {
  const matched = finding.value; // e.g. "sw-button--ghost"
  const variant = matched.split(/--|_/).pop()?.toLowerCase();

  const candidates = allowedVariants;
  let note;
  if (variant === 'ghost') {
    note = `ghost is not an official Button variant (deprecated 2026-04-29). Choose secondary or blue-line based on visual context.`;
  } else if (variant === 'danger') {
    note = `danger variant is deleted (confirmed 2026-04-29). No official token exists. Do not replace automatically.`;
  } else {
    note = `"${variant}" is not an allowed Button variant. Allowed: ${candidates.join(', ')}.`;
  }

  return {
    confidence:   'needs-human',
    before:       lineContent.trim(),
    after:        null,
    alternatives: candidates,
    note,
    patchable:    false,
  };
}

// ── Rule: ambiguous-button-variant ───────────────────────────────
function suggestAmbiguousButtonVariant(finding, lineContent, allowedVariants) {
  const matched = finding.value;
  const suggestion = matched.replace(/outline|line\b/i, 'blue-line');
  const after = suggestion !== matched ? lineContent.trim().replace(matched, suggestion) : null;

  return {
    confidence:   'medium',
    before:       lineContent.trim(),
    after:        after ?? null,
    alternatives: ['blue-line'],
    note:         `"outline" / "line" may be the intended "blue-line" variant. Verify before applying.`,
    patchable:    false, // still requires human confirmation
  };
}

// ── Rule: inline-style-color ─────────────────────────────────────
function suggestInlineStyleColor(finding, lineContent, engine) {
  // Extract the color value from the inline style
  HEX_VALUE_RE.lastIndex = 0;
  const hexMatch = HEX_VALUE_RE.exec(lineContent);

  if (hexMatch) {
    const hex  = hexMatch[0];
    const suggestion = engine.suggestForHex(hex);
    const token = suggestion?.primary;
    // Replace HEX in the inline style with token
    const after = token
      ? lineContent.trim().replace(hex, `var(${token})`)
      : null;

    return {
      confidence:   suggestion?.confidence ?? 'unmapped',
      before:       lineContent.trim(),
      after:        after ?? null,
      alternatives: suggestion?.alternatives ?? [],
      note:         (suggestion?.note ?? '') + ' Consider moving to a CSS class instead of inline style.',
      patchable:    false, // inline style changes affect HTML structure
    };
  }

  return {
    confidence:   'needs-review',
    before:       lineContent.trim(),
    after:        null,
    alternatives: [],
    note:         'Inline style color detected. Move to CSS class with semantic token.',
    patchable:    false,
  };
}

// ── Dispatch ──────────────────────────────────────────────────────
function generateSuggestion(finding, lineContent, engine, registry) {
  switch (finding.type) {
    case 'raw-hex':
      return suggestRawHex(finding, lineContent, engine);
    case 'raw-rgb':
      return suggestRawRgb(finding, lineContent, engine);
    case 'raw-rgba':
      return suggestRawRgba(finding, lineContent);
    case 'foundation-color-direct':
      return suggestFoundationDirect(finding, lineContent, engine);
    case 'undefined-token':
      return suggestUndefinedToken(finding, lineContent, engine);
    case 'deprecated-button-variant':
    case 'unknown-button-variant':
      return suggestDeprecatedButtonVariant(finding, lineContent, registry.allowedButtonVariants);
    case 'ambiguous-button-variant':
      return suggestAmbiguousButtonVariant(finding, lineContent, registry.allowedButtonVariants);
    case 'inline-style-color':
      return suggestInlineStyleColor(finding, lineContent, engine);
    default:
      return {
        confidence: 'needs-review',
        before: lineContent.trim(),
        after: null,
        alternatives: [],
        note: `No suggestion rule for type "${finding.type}".`,
        patchable: false,
      };
  }
}

module.exports = { generateSuggestion };
