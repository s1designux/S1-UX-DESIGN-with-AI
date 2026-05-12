'use strict';

const fs   = require('fs');
const path = require('path');
const { getRoot, targetBaseName } = require('./utils');

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 };

function severitySort(a, b) {
  return (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
}

function countBySeverity(findings) {
  const counts = { error: 0, warning: 0, info: 0 };
  for (const f of findings) counts[f.severity] = (counts[f.severity] ?? 0) + 1;
  return counts;
}

/**
 * Renders a table row. Cells are separated by `|`.
 */
function row(...cells) {
  return `| ${cells.join(' | ')} |`;
}

/**
 * Generates the markdown report and writes it to reports/source-guard-[target].md.
 * Also prints a console summary.
 */
function generateReport(targetPath, allFindings, fileCount) {
  const name    = targetBaseName(targetPath);
  const date    = new Date().toISOString().slice(0, 10);
  const counts  = countBySeverity(allFindings);
  const sorted  = [...allFindings].sort(severitySort);
  const status  = counts.error > 0 ? '❌ FAIL' : counts.warning > 0 ? '⚠️ PASS (warnings)' : '✅ PASS';

  const relTarget = path.resolve(targetPath);

  const lines = [
    `# Source Guard Report`,
    ``,
    `## Target`,
    ``,
    `- **Path:** \`${relTarget}\``,
    `- **Date:** ${date}`,
    `- **Status:** ${status}`,
    `- **Files scanned:** ${fileCount}`,
    ``,
    `---`,
    ``,
    `## Summary`,
    ``,
    `| Severity | Count |`,
    `|---|---:|`,
    `| Error | ${counts.error} |`,
    `| Warning | ${counts.warning} |`,
    `| Info | ${counts.info ?? 0} |`,
    ``,
    `---`,
    ``,
    `## Checks`,
    ``,
    `- Raw HEX usage`,
    `- RGB/RGBA color usage`,
    `- Undefined CSS variables`,
    `- Foundation color direct usage`,
    `- Button variant violations`,
    `- Inline style colors`,
    ``,
    `---`,
    ``,
  ];

  if (sorted.length === 0) {
    lines.push(`## Issues`, ``, `No issues found.`, ``);
  } else {
    lines.push(
      `## Issues`,
      ``,
      row('Severity', 'Rule', 'File', 'Line', 'Value', 'Message'),
      row('---', '---', '---', '---:', '---', '---'),
    );
    for (const f of sorted) {
      const relFile = path.relative(process.cwd(), f.file);
      const escapedVal = String(f.value).replace(/\|/g, '\\|');
      const escapedMsg = String(f.message).replace(/\|/g, '\\|');
      lines.push(row(
        f.severity.toUpperCase(),
        f.type,
        `\`${relFile}\``,
        String(f.line),
        `\`${escapedVal}\``,
        escapedMsg,
      ));
    }
    lines.push(``);
  }

  // ── Recommended Fixes ───────────────────────────────────────────
  lines.push(`---`, ``, `## Recommended Fixes`, ``);
  if (counts.error > 0) {
    lines.push(
      `- Replace raw HEX / rgb() colors with SW Design System semantic tokens.`,
      `- Replace undefined CSS variables with registered token names.`,
      `- Replace deprecated Button variants (ghost, danger) with primary, secondary, or blue-line.`,
      `- Remove inline \`style\` color attributes and use design token classes.`,
    );
  } else {
    lines.push(`No errors detected. Review warnings above.`);
  }
  lines.push(``);

  // ── Human Decisions Needed ──────────────────────────────────────
  lines.push(`---`, ``, `## Human Decisions Needed`, ``);
  const rgbaWarnings = sorted.filter(f => f.type === 'raw-rgba');
  if (rgbaWarnings.length > 0) {
    lines.push(
      `- **rgba() usage (${rgbaWarnings.length} occurrence${rgbaWarnings.length > 1 ? 's' : ''}):** ` +
      `Verify each rgba() is an approved exception (dark-border or overlay token per token-exceptions EX02/EX03). ` +
      `All other rgba() must be replaced with semantic tokens.`,
    );
  }
  const foundationWarnings = sorted.filter(f => f.type === 'foundation-color-direct');
  if (foundationWarnings.length > 0) {
    lines.push(
      `- **Foundation color direct usage (${foundationWarnings.length} occurrence${foundationWarnings.length > 1 ? 's' : ''}):** ` +
      `Each reference to a foundation primitive (--color-blue-*, --color-gray-*, etc.) should be ` +
      `replaced with the appropriate semantic token. Review intent before replacing.`,
    );
  }
  const ambiguous = sorted.filter(f => f.type === 'ambiguous-button-variant');
  if (ambiguous.length > 0) {
    lines.push(
      `- **Ambiguous button variant (${ambiguous.length} occurrence${ambiguous.length > 1 ? 's' : ''}):** ` +
      `"outline" / "line" may be confused with official "blue-line". ` +
      `Confirm whether these should be migrated to "blue-line".`,
    );
  }
  if (rgbaWarnings.length === 0 && foundationWarnings.length === 0 && ambiguous.length === 0) {
    lines.push(`No human decisions needed at this time.`);
  }
  lines.push(``);

  // ── Notes ────────────────────────────────────────────────────────
  lines.push(
    `---`,
    ``,
    `## Notes`,
    ``,
    `- This report is generated from SW Design System Source Guard.`,
    `- The design guide repository (\`S1_AI_DESIGN_GUIDE\`) is the source of truth.`,
    `- The target project is scanned as an external service implementation.`,
    `- Scanning is regex-based (MVP). No AST parser or Figma file scan yet.`,
    `- Run: \`npm run guard -- --target ${relTarget}\``,
    ``,
    `---`,
    ``,
    `*Generated by \`npm run guard\`*`,
  );

  // Write report
  const reportDir  = path.join(getRoot(), 'reports');
  const reportPath = path.join(reportDir, `source-guard-${name}.md`);
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

  // Console summary
  console.log(`\nSource Guard — ${name}`);
  console.log('═'.repeat(50));
  console.log(`Files scanned : ${fileCount}`);
  console.log(`Errors        : ${counts.error}`);
  console.log(`Warnings      : ${counts.warning}`);
  console.log(`Status        : ${status}`);
  console.log(`Report        : reports/source-guard-${name}.md`);

  return counts;
}

module.exports = { generateReport };
