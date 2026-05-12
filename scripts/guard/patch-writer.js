'use strict';

const fs   = require('fs');
const path = require('path');
const { getRoot, targetBaseName } = require('./utils');

/**
 * Generates a unified diff-style patch candidate file.
 * Only includes items where suggestion.patchable === true (high confidence).
 *
 * NOTE: This does NOT modify any target files.
 * The .diff file is for human review and optional manual application only.
 */
function writePatchCandidates(targetPath, annotated) {
  const name       = targetBaseName(targetPath);
  const reportDir  = path.join(getRoot(), 'reports');
  const patchPath  = path.join(reportDir, `patch-candidates-${name}.diff`);

  const patchable = annotated.filter(a => a.suggestion?.patchable);

  if (patchable.length === 0) {
    const msg = `# No high-confidence patch candidates found for ${name}\n# All suggestions require human review.\n`;
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(patchPath, msg, 'utf8');
    return { patchPath, count: 0 };
  }

  const lines = [
    `# Source Guard Patch Candidates — ${name}`,
    `# Generated: ${new Date().toISOString().slice(0, 10)}`,
    `# WARNING: Review each hunk before applying. Do not apply blindly.`,
    `# Apply command (review first!): patch -p0 < ${path.basename(patchPath)}`,
    ``,
  ];

  // Group by file
  const byFile = new Map();
  for (const item of patchable) {
    if (!byFile.has(item.finding.file)) byFile.set(item.finding.file, []);
    byFile.get(item.finding.file).push(item);
  }

  for (const [file, items] of byFile) {
    const relFile = path.relative(process.cwd(), file);
    lines.push(`--- a/${relFile}`);
    lines.push(`+++ b/${relFile}`);

    for (const item of items) {
      const { finding, suggestion } = item;
      lines.push(`@@ line ${finding.line} @@`);
      lines.push(`-${suggestion.before}`);
      lines.push(`+${suggestion.after}`);
      lines.push(`# Confidence: ${suggestion.confidence} | Rule: ${finding.type}`);
      lines.push(``);
    }
  }

  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(patchPath, lines.join('\n'), 'utf8');
  return { patchPath, count: patchable.length };
}

module.exports = { writePatchCandidates };
