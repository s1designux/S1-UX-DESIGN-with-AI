'use strict';

/**
 * Token suggestion engine.
 * Builds lookup maps from registry data and provides:
 * - HEX → semantic token candidates
 * - token-name fuzzy match for undefined var() suggestions
 * - foundation var → semantic token candidates
 */

// ── HEX normalization ─────────────────────────────────────────────
function normalizeHex(raw) {
  let h = raw.trim().replace(/^#/, '').toUpperCase();
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if (h.length === 4) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
  return `#${h.slice(0, 6)}`;
}

// ── RGB → HEX ─────────────────────────────────────────────────────
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(n => parseInt(n).toString(16).padStart(2, '0').toUpperCase()).join('');
}

// ── Levenshtein distance (for fuzzy token name matching) ──────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// ── Build HEX → cssVar map from foundation.colors.json ───────────
function buildFoundationHexMap(foundationColors) {
  const map = new Map(); // hex → [{ cssVar, scale }]
  if (!foundationColors?.color) return map;

  function walk(obj) {
    if (obj.value && obj.cssVar) {
      const hex = normalizeHex(obj.value);
      if (!map.has(hex)) map.set(hex, []);
      map.get(hex).push({ cssVar: obj.cssVar });
    } else {
      for (const v of Object.values(obj)) {
        if (typeof v === 'object' && v !== null) walk(v);
      }
    }
  }
  walk(foundationColors.color);
  return map;
}

// ── Resolve semantic token's light value to HEX ───────────────────
// light is "var(--color-gray-900)" → extract cssVar name → look up in foundationHexMap
function resolveSemanticLightHex(lightValue, foundationHexMap) {
  // Direct HEX in semantic (candidate tokens like --color-bg-home: #F5F6FB)
  if (lightValue && lightValue.startsWith('#')) {
    try { return normalizeHex(lightValue); } catch { return null; }
  }
  // var(--color-xxx) pattern
  const m = lightValue?.match(/var\((--[a-zA-Z0-9_-]+)\)/);
  if (!m) return null;
  const foundVar = m[1];
  // Find this cssVar in foundationHexMap
  for (const [hex, entries] of foundationHexMap) {
    if (entries.some(e => e.cssVar === foundVar)) return hex;
  }
  return null;
}

// ── Build HEX → semantic token candidates ────────────────────────
// semanticColors.tokens is { bg: [...], surface: [...], text: [...], ... }
// each token: { cssVar, light, dark, status }
function buildSemanticHexMap(semanticColors, foundationHexMap) {
  const map = new Map(); // hex → [{ cssVar, category, status }]
  if (!semanticColors?.tokens) return map;

  for (const [category, tokens] of Object.entries(semanticColors.tokens)) {
    if (!Array.isArray(tokens)) continue;
    for (const t of tokens) {
      const hex = resolveSemanticLightHex(t.light, foundationHexMap);
      if (!hex) continue;
      if (!map.has(hex)) map.set(hex, []);
      map.get(hex).push({ cssVar: t.cssVar, category, status: t.status });
    }
  }
  return map;
}

// ── Build foundation cssVar → semantic token candidates ──────────
// e.g. "--color-blue-400" → ["--color-action-primary-default", "--color-text-link", ...]
function buildFoundationToSemanticMap(semanticColors) {
  const map = new Map(); // foundationCssVar → [{ cssVar, category }]
  if (!semanticColors?.tokens) return map;

  for (const [category, tokens] of Object.entries(semanticColors.tokens)) {
    if (!Array.isArray(tokens)) continue;
    for (const t of tokens) {
      const m = t.light?.match(/var\((--[a-zA-Z0-9_-]+)\)/);
      if (!m) continue;
      const foundVar = m[1];
      if (!map.has(foundVar)) map.set(foundVar, []);
      map.get(foundVar).push({ cssVar: t.cssVar, category });
    }
  }
  return map;
}

// ── Main suggestion engine factory ───────────────────────────────
function buildSuggestionEngine(registry, foundationColors, semanticColors) {
  const foundationHexMap      = buildFoundationHexMap(foundationColors);
  const semanticHexMap        = buildSemanticHexMap(semanticColors, foundationHexMap);
  const foundationToSemantic  = buildFoundationToSemanticMap(semanticColors);
  const knownTokenList        = [...registry.knownTokens];

  /**
   * Suggest semantic token(s) for a raw HEX value.
   * Returns { confidence, primary, alternatives }
   */
  function suggestForHex(rawHex) {
    let hex;
    try { hex = normalizeHex(rawHex); } catch { return null; }

    const semanticCandidates = semanticHexMap.get(hex) ?? [];
    const foundationCandidates = foundationHexMap.get(hex) ?? [];

    if (semanticCandidates.length === 1) {
      return {
        confidence: 'high',
        primary: semanticCandidates[0].cssVar,
        alternatives: [],
        note: `Exact semantic token match (light mode).`,
      };
    }
    if (semanticCandidates.length > 1) {
      // Pick the "most general" one: prefer bg > text > border > action > surface order
      const priority = ['bg', 'text', 'border', 'icon', 'action', 'status', 'surface', 'overlay'];
      const sorted = [...semanticCandidates].sort((a, b) => {
        return (priority.indexOf(a.category) + 1 || 99) - (priority.indexOf(b.category) + 1 || 99);
      });
      return {
        confidence: 'needs-review',
        primary: sorted[0].cssVar,
        alternatives: sorted.slice(1).map(c => c.cssVar),
        note: `Multiple semantic tokens share this color. Choose based on UI context.`,
      };
    }
    if (foundationCandidates.length > 0) {
      return {
        confidence: 'medium',
        primary: foundationCandidates[0].cssVar,
        alternatives: [],
        note: `Foundation token match only. Prefer semantic token for product UI.`,
      };
    }
    return {
      confidence: 'unmapped',
      primary: null,
      alternatives: [],
      note: `No matching token found in registry for ${hex}.`,
    };
  }

  /**
   * Suggest semantic tokens for a foundation cssVar directly referenced.
   * e.g. "--color-blue-400" → action tokens
   */
  function suggestForFoundationVar(foundVar) {
    const candidates = foundationToSemantic.get(foundVar) ?? [];
    if (candidates.length === 0) {
      return { confidence: 'unmapped', primary: null, alternatives: [], note: 'No semantic token maps to this foundation primitive.' };
    }
    if (candidates.length === 1) {
      return { confidence: 'high', primary: candidates[0].cssVar, alternatives: [], note: 'Exact semantic token maps to this foundation primitive.' };
    }
    return {
      confidence: 'needs-review',
      primary: candidates[0].cssVar,
      alternatives: candidates.slice(1).map(c => c.cssVar),
      note: 'Multiple semantic tokens share this foundation primitive. Choose based on UI context.',
    };
  }

  /**
   * Suggest similar token names for an undefined var(--token).
   * Uses Levenshtein distance; returns top-3 candidates.
   */
  function suggestForUndefinedToken(tokenName) {
    const scored = knownTokenList
      .map(known => ({ cssVar: known, dist: levenshtein(tokenName, known) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    const best = scored[0];
    if (!best || best.dist > 20) {
      return { confidence: 'unmapped', primary: null, alternatives: [], note: 'No similar token found in registry.' };
    }
    const confidence = best.dist <= 3 ? 'high' : best.dist <= 8 ? 'medium' : 'needs-review';
    return {
      confidence,
      primary: best.cssVar,
      alternatives: scored.slice(1).map(c => c.cssVar),
      note: `Similar to "${tokenName}" (edit distance: ${best.dist}).`,
    };
  }

  /**
   * Try to parse rgb(r,g,b) and suggest a token.
   */
  function suggestForRgb(rgbStr) {
    const m = rgbStr.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (!m) return null;
    const hex = rgbToHex(m[1], m[2], m[3]);
    return suggestForHex(hex);
  }

  return { suggestForHex, suggestForFoundationVar, suggestForUndefinedToken, suggestForRgb, normalizeHex };
}

module.exports = { buildSuggestionEngine, normalizeHex };
