'use strict';

const fs = require('fs');
const { registryPath } = require('./utils');

function loadJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(registryPath(rel), 'utf8'));
  } catch (e) {
    console.warn(`[registry] Cannot load ${rel}: ${e.message}`);
    return null;
  }
}

/**
 * Loads all registry data needed by Source Guard.
 * Returns a normalized registry object.
 */
function loadRegistry() {
  const buttonJson        = loadJson('registry/components/button.json');
  const componentTokens   = loadJson('registry/tokens/component.tokens.json');
  const semanticColors    = loadJson('registry/tokens/semantic.colors.json');
  const foundationColors  = loadJson('registry/tokens/foundation.colors.json');
  const auditRules        = loadJson('registry/governance/audit-rules.json');
  const tokenExceptions   = loadJson('registry/governance/token-exceptions.json');

  // ── Button allowed variants ───────────────────────────────────────
  const allowedButtonVariants =
    buttonJson?.variants?.list ?? ['primary', 'secondary', 'blue-line'];

  const deprecatedButtonVariants =
    (buttonJson?.pendingVariants ?? [])
      .map(v => v.name);

  // ── All known CSS variable names ──────────────────────────────────
  const knownTokens = new Set();

  // semantic color tokens
  if (semanticColors?.tokens) {
    for (const group of Object.values(semanticColors.tokens)) {
      if (Array.isArray(group)) {
        for (const t of group) {
          if (t.cssVar) knownTokens.add(t.cssVar);
        }
      }
    }
  }

  // component tokens
  if (componentTokens?.tokens) {
    for (const component of Object.values(componentTokens.tokens)) {
      for (const variantTokens of Object.values(component)) {
        if (Array.isArray(variantTokens)) {
          for (const t of variantTokens) {
            if (t.cssVar) knownTokens.add(t.cssVar);
          }
        }
      }
    }
  }

  // ── Foundation color primitive prefixes ──────────────────────────
  // These are the variable name patterns that are foundation-level.
  // Component/Semantic code should NOT reference these directly for color.
  const foundationColorPrefixes = [
    '--color-gray-',
    '--color-blue-',
    '--color-red-',
    '--color-orange-',
    '--color-yellow-',
    '--color-green-',
    '--color-skyblue-',
    '--color-purple-',
    '--color-brown-',
    '--color-visual-gray-',
    '--color-visual-gray-dark-',
    '--color-gray-dark-',
    '--color-blue-dark-',
    '--color-red-dark-',
    '--color-orange-dark-',
    '--color-yellow-dark-',
    '--color-green-dark-',
    '--color-skyblue-dark-',
    '--color-purple-dark-',
    '--color-brown-dark-',
    '--color-status-dark-',
    '--color-base-',
    '--color-brand-',
  ];

  // Add foundation token names to known tokens (foundation.colors.json)
  if (foundationColors?.colors) {
    for (const scale of Object.values(foundationColors.colors)) {
      if (Array.isArray(scale)) {
        for (const t of scale) {
          if (t.cssVar) knownTokens.add(t.cssVar);
        }
      }
    }
  }

  return {
    allowedButtonVariants,
    deprecatedButtonVariants,
    knownTokens,
    foundationColorPrefixes,
    auditRules:      auditRules?.rules        ?? [],
    tokenExceptions: tokenExceptions?.exceptions ?? [],
  };
}

module.exports = { loadRegistry };
