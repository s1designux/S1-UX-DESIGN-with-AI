'use strict';

// Matches var(--some-token) — capturing the token name
const VAR_RE = /var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,[^)]+)?\)/g;

/**
 * Checks CSS variable usage in a file.
 * - error: var(--token) not in the known token set
 * - warning: var(--color-{foundation-prefix}) used directly (should go through Semantic)
 */
function checkCssVars(filePath, lines, registry) {
  const { knownTokens, foundationColorPrefixes } = registry;
  const findings = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const stripped = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');

    VAR_RE.lastIndex = 0;
    let m;
    while ((m = VAR_RE.exec(stripped)) !== null) {
      const token = m[1];

      // Check foundation color direct reference
      const isFoundationColor = foundationColorPrefixes.some(prefix => token.startsWith(prefix));
      if (isFoundationColor) {
        findings.push({
          type: 'foundation-color-direct',
          severity: 'warning',
          file: filePath,
          line: lineNum,
          column: m.index + 1,
          value: token,
          message: `Foundation color primitive used directly. Reference Semantic token instead (e.g. --color-text-*, --color-bg-*, --color-action-*).`,
        });
        continue; // Foundation tokens ARE in knownTokens, so skip the undefined check
      }

      // Check if token is known at all
      if (!knownTokens.has(token)) {
        findings.push({
          type: 'undefined-token',
          severity: 'error',
          file: filePath,
          line: lineNum,
          column: m.index + 1,
          value: token,
          message: `CSS variable not found in SW Design System registry.`,
        });
      }
    }
  });

  return findings;
}

module.exports = { checkCssVars };
