'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Safely applies a list of line-based replacements to a file.
 *
 * Each change: { finding: { file, line }, suggestion: { before, after } }
 *
 * Safety guarantees:
 * 1. The line at finding.line-1 must trim() to suggestion.before exactly.
 * 2. If the before value appears 0 or >1 times in the file, skip (ambiguous).
 * 3. Changes are applied bottom-up (highest line first) to avoid index shifts.
 * 4. Indentation is preserved: only the trimmed content is replaced.
 *
 * Returns { applied: [], skipped: [] } arrays of changes with results.
 */
function applyChangesToFile(filePath, changes, dryRun) {
  let lines;
  try {
    lines = fs.readFileSync(filePath, 'utf8').split('\n');
  } catch (e) {
    return {
      applied:  [],
      skipped:  changes.map(c => ({ ...c, skipReason: `Cannot read file: ${e.message}` })),
    };
  }

  // Sort bottom-up so earlier line modifications don't shift indices
  const sorted = [...changes].sort((a, b) => b.finding.line - a.finding.line);

  const applied = [];
  const skipped = [];

  for (const change of sorted) {
    const { finding, suggestion } = change;
    const lineIdx = finding.line - 1;

    if (lineIdx < 0 || lineIdx >= lines.length) {
      skipped.push({ ...change, skipReason: `Line ${finding.line} out of range.` });
      continue;
    }

    const originalLine = lines[lineIdx];
    const trimmed      = originalLine.trim();

    // Verify the line content matches what we expect
    if (trimmed !== suggestion.before) {
      skipped.push({
        ...change,
        skipReason: `Line content mismatch. Expected:\n  "${suggestion.before}"\n  Got:\n  "${trimmed}"`,
      });
      continue;
    }

    // Verify the before content is unique in the file (not ambiguous)
    const occurrences = lines.filter(l => l.trim() === suggestion.before).length;
    if (occurrences > 1) {
      skipped.push({
        ...change,
        skipReason: `"${suggestion.before}" appears ${occurrences} times in file. Cannot determine unique target line.`,
      });
      continue;
    }

    // Preserve indentation
    const indentMatch = originalLine.match(/^(\s*)/);
    const indent      = indentMatch ? indentMatch[1] : '';

    // Determine line ending
    const hasCarriageReturn = originalLine.endsWith('\r');
    const newLine = indent + suggestion.after + (hasCarriageReturn ? '\r' : '');

    if (!dryRun) {
      lines[lineIdx] = newLine;
    }

    applied.push({ ...change, newLineContent: newLine });
  }

  // Write updated file
  if (!dryRun && applied.length > 0) {
    try {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    } catch (e) {
      // Move all applied to skipped on write failure
      const writeError = `Write failed: ${e.message}`;
      return {
        applied: [],
        skipped: [
          ...skipped,
          ...applied.map(a => ({ ...a, skipReason: writeError })),
        ],
      };
    }
  }

  return { applied, skipped };
}

/**
 * Groups changes by file path.
 */
function groupByFile(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.finding.file;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

module.exports = { applyChangesToFile, groupByFile };
