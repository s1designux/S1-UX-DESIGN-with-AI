'use strict';

// Patterns that strongly suggest a button variant class
// e.g. sw-button--ghost, s1-btn-ghost, btn-ghost, button--danger
const BUTTON_CLASS_RE = /(?:sw-button--|s1-btn-|btn-|button--|btn__|button__)([a-zA-Z][-a-zA-Z0-9]*)/g;

// Broader scan: any class attribute or className prop containing button-ish words
const GENERIC_VARIANT_RE = /(?:class(?:Name)?)\s*=\s*["'`]([^"'`]*)["'`]/g;

const DEPRECATED_VARIANTS = ['ghost', 'danger', 'outlined', 'tertiary'];
const WARNING_VARIANTS    = ['outline', 'line']; // Could be confused with blue-line

/**
 * Checks for disallowed Button variants in class attributes / class names.
 */
function checkButtonVariants(filePath, lines, registry) {
  const { allowedButtonVariants } = registry;
  const findings = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const stripped = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');

    // ── Pattern 1: explicit prefixed class (sw-button--, s1-btn-, btn-, etc.)
    BUTTON_CLASS_RE.lastIndex = 0;
    let m;
    while ((m = BUTTON_CLASS_RE.exec(stripped)) !== null) {
      const variant = m[1].toLowerCase();

      if (DEPRECATED_VARIANTS.includes(variant)) {
        findings.push({
          type: 'deprecated-button-variant',
          severity: 'error',
          file: filePath,
          line: lineNum,
          column: m.index + 1,
          value: m[0],
          message: `Deprecated Button variant "${variant}" found. Allowed variants: ${allowedButtonVariants.join(', ')}.`,
        });
        continue;
      }

      if (WARNING_VARIANTS.includes(variant)) {
        findings.push({
          type: 'ambiguous-button-variant',
          severity: 'warning',
          file: filePath,
          line: lineNum,
          column: m.index + 1,
          value: m[0],
          message: `Ambiguous Button variant "${variant}" — may conflict with official "blue-line". Verify: only primary, secondary, blue-line are allowed.`,
        });
        continue;
      }

      // Check against allowed list (only flag if clearly a variant token)
      if (!allowedButtonVariants.includes(variant) && variant.length > 1) {
        findings.push({
          type: 'unknown-button-variant',
          severity: 'warning',
          file: filePath,
          line: lineNum,
          column: m.index + 1,
          value: m[0],
          message: `Unknown Button variant "${variant}". Allowed: ${allowedButtonVariants.join(', ')}.`,
        });
      }
    }

    // ── Pattern 2: class="..." or className="..." containing deprecated words
    GENERIC_VARIANT_RE.lastIndex = 0;
    while ((m = GENERIC_VARIANT_RE.exec(stripped)) !== null) {
      const classList = m[1];
      for (const dep of DEPRECATED_VARIANTS) {
        // Require word boundary so "danger-icon" doesn't trip on "danger" button
        const re = new RegExp(`\\b((?:sw-button|s1-btn|btn|button)[-_]{1,2}${dep})\\b`, 'i');
        const hit = classList.match(re);
        if (hit) {
          findings.push({
            type: 'deprecated-button-variant',
            severity: 'error',
            file: filePath,
            line: lineNum,
            column: stripped.indexOf(classList) + classList.indexOf(hit[0]) + 1,
            value: hit[0],
            message: `Deprecated Button variant "${dep}" found in class list. Allowed: ${allowedButtonVariants.join(', ')}.`,
          });
        }
      }
    }
  });

  return findings;
}

module.exports = { checkButtonVariants };
