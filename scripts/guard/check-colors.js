'use strict';

// Matches #RGB, #RGBA, #RRGGBB, #RRGGBBAA — but not CSS custom properties or IDs
const HEX_RE   = /(?<![a-zA-Z0-9_-])#([0-9a-fA-F]{3,8})\b/g;
const RGB_RE   = /\brgb\s*\(/g;
const RGBA_RE  = /\brgba\s*\(/g;

// Allowed rgba patterns per token-exceptions.json (EX02, EX03)
// - color-border-* dark values
// - color-overlay
// These appear as token *values* in the design system itself; in service code they
// are almost always a violation. We flag all rgba as warnings with a note.

/**
 * Checks a single line for raw HEX, rgb(), rgba() usage.
 * Skips lines that are pure comments or data-URI SVG content.
 */
function isCommentLine(line) {
  const t = line.trim();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('#!');
}

function checkColors(filePath, lines) {
  const findings = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Skip pure comment lines (not a perfect AST solution, but practical for MVP)
    if (isCommentLine(line)) return;

    // Raw HEX
    const stripped = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, ''); // remove inline comments
    let m;
    HEX_RE.lastIndex = 0;
    while ((m = HEX_RE.exec(stripped)) !== null) {
      // Ignore if inside a data URI (data:image/svg)
      const before = stripped.slice(0, m.index);
      if (before.includes('data:image')) continue;

      findings.push({
        type: 'raw-hex',
        severity: 'error',
        file: filePath,
        line: lineNum,
        column: m.index + 1,
        value: m[0],
        message: `Raw HEX color found. Use SW Design System token instead.`,
      });
    }

    // rgb()
    RGB_RE.lastIndex = 0;
    while ((m = RGB_RE.exec(stripped)) !== null) {
      findings.push({
        type: 'raw-rgb',
        severity: 'error',
        file: filePath,
        line: lineNum,
        column: m.index + 1,
        value: 'rgb(...)',
        message: `rgb() color found. Use SW Design System semantic token instead.`,
      });
    }

    // rgba()
    RGBA_RE.lastIndex = 0;
    while ((m = RGBA_RE.exec(stripped)) !== null) {
      findings.push({
        type: 'raw-rgba',
        severity: 'warning',
        file: filePath,
        line: lineNum,
        column: m.index + 1,
        value: 'rgba(...)',
        message: `rgba() color found. Allowed only for dark-border and overlay tokens (token-exceptions EX02, EX03). Verify this is an approved use.`,
      });
    }
  });

  return findings;
}

module.exports = { checkColors };
