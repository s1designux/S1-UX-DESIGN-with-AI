'use strict';

// HTML: style="color: ...", style="background-color: ...", style="background: ..."
const HTML_STYLE_COLOR_RE = /style\s*=\s*["']([^"']*)["']/g;
// JSX/TSX: style={{ color: "..." }}, style={{ backgroundColor: "#..." }}
const JSX_STYLE_COLOR_RE  = /style\s*=\s*\{\{([^}]*)\}\}/g;

const COLOR_PROPS = ['color', 'background', 'background-color', 'backgroundColor', 'border-color', 'borderColor', 'fill', 'stroke', 'outline-color', 'outlineColor'];
const COLOR_VALUE_RE = /#[0-9a-fA-F]{3,8}|rgb\s*\(|rgba\s*\(/;

function hasColorProp(styleContent) {
  return COLOR_PROPS.some(prop => {
    const re = new RegExp(`\\b${prop}\\s*[:=]`);
    return re.test(styleContent);
  });
}

/**
 * Checks for inline style color usage.
 * Flags: style="color: #..." or style={{ color: "#..." }}
 */
function checkInlineStyles(filePath, lines) {
  const findings = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const stripped = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');

    // HTML inline style
    HTML_STYLE_COLOR_RE.lastIndex = 0;
    let m;
    while ((m = HTML_STYLE_COLOR_RE.exec(stripped)) !== null) {
      const styleValue = m[1];
      if (hasColorProp(styleValue) && COLOR_VALUE_RE.test(styleValue)) {
        findings.push({
          type: 'inline-style-color',
          severity: 'error',
          file: filePath,
          line: lineNum,
          column: m.index + 1,
          value: m[0].slice(0, 80),
          message: `Inline style with hardcoded color found. Use CSS class with design token instead.`,
        });
      }
    }

    // JSX/TSX inline style object
    JSX_STYLE_COLOR_RE.lastIndex = 0;
    while ((m = JSX_STYLE_COLOR_RE.exec(stripped)) !== null) {
      const styleValue = m[1];
      if (hasColorProp(styleValue) && COLOR_VALUE_RE.test(styleValue)) {
        findings.push({
          type: 'inline-style-color',
          severity: 'error',
          file: filePath,
          line: lineNum,
          column: m.index + 1,
          value: m[0].slice(0, 80),
          message: `JSX inline style with hardcoded color found. Use CSS class with design token instead.`,
        });
      }
    }
  });

  return findings;
}

module.exports = { checkInlineStyles };
