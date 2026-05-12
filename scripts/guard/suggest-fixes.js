#!/usr/bin/env node
'use strict';

/**
 * SW Design System — Source Guard Fix Suggestions (MVP3.6)
 *
 * Scans an external service project, detects Design System violations,
 * and generates fix suggestions WITHOUT modifying target files.
 *
 * Usage:
 *   npm run guard:suggest -- --target ../service-project
 *   node scripts/guard/suggest-fixes.js --target ../service-project
 */

const fs   = require('fs');
const path = require('path');

const { loadRegistry }          = require('./load-registry');
const { scanTarget, readLines } = require('./scan-target');
const { checkColors }           = require('./check-colors');
const { checkCssVars }          = require('./check-css-vars');
const { checkButtonVariants }   = require('./check-button-variants');
const { checkInlineStyles }     = require('./check-inline-styles');
const { buildSuggestionEngine } = require('./token-suggestion');
const { generateSuggestion }    = require('./fix-suggestion-rules');
const { writePatchCandidates }  = require('./patch-writer');
const { getRoot, targetBaseName } = require('./utils');

// ── CLI argument parsing ──────────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--target' && argv[i + 1]) { args.target = argv[i + 1]; i++; }
    if (argv[i] === '--strict') args.strict = true;
  }
  return args;
}

function printUsage() {
  console.log(`
Usage:
  npm run guard:suggest -- --target ../service-project

Options:
  --target <path>   External service project folder or file to scan
`);
}

// ── Load foundation + semantic JSON (needed for suggestion engine) ─
function loadJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(getRoot(), rel), 'utf8'));
  } catch (e) {
    console.warn(`[registry] Cannot load ${rel}: ${e.message}`);
    return null;
  }
}

// ── Report generation ─────────────────────────────────────────────
function countByConfidence(annotated) {
  const c = { high: 0, medium: 0, 'needs-review': 0, 'needs-human': 0, unmapped: 0 };
  for (const a of annotated) {
    const key = a.suggestion?.confidence ?? 'needs-review';
    c[key] = (c[key] ?? 0) + 1;
  }
  return c;
}

function esc(s) { return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' '); }

function generateFixReport(targetPath, annotated, patchInfo) {
  const name    = targetBaseName(targetPath);
  const date    = new Date().toISOString().slice(0, 10);
  const counts  = countByConfidence(annotated);
  const total   = annotated.length;
  const highCount = counts.high + counts.medium;
  const reviewCount = counts['needs-review'];
  const humanCount  = counts['needs-human'];
  const unmappedCount = counts.unmapped;

  const lines = [
    `# Source Guard Fix Suggestions`,
    ``,
    `## Target`,
    ``,
    `- **Path:** \`${path.resolve(targetPath)}\``,
    `- **Date:** ${date}`,
    `- **Total findings:** ${total}`,
    ``,
    `---`,
    ``,
    `## Summary`,
    ``,
    `| Type | Count |`,
    `|---|---:|`,
    `| High confidence suggestions | ${highCount} |`,
    `| Needs review | ${reviewCount} |`,
    `| Human decisions needed | ${humanCount} |`,
    `| Unmapped | ${unmappedCount} |`,
    ``,
    `---`,
    ``,
    `## Suggested Fixes`,
    ``,
    `| Confidence | Rule | File | Line | Current | Suggested | Notes |`,
    `|---|---|---|---:|---|---|---|`,
  ];

  for (const a of annotated) {
    const { finding, suggestion: s } = a;
    const relFile = path.relative(process.cwd(), finding.file);
    const suggested = s.after ? `\`${esc(s.after.slice(0, 60))}\`` : `—`;
    lines.push(`| ${s.confidence} | ${finding.type} | \`${esc(relFile)}\` | ${finding.line} | \`${esc(finding.value)}\` | ${suggested} | ${esc(s.note)} |`);
  }
  lines.push(``);

  // ── High Confidence Fix Candidates ─────────────────────────────
  const highItems = annotated.filter(a =>
    a.suggestion?.confidence === 'high' || a.suggestion?.confidence === 'medium'
  );
  if (highItems.length > 0) {
    lines.push(`---`, ``, `## High Confidence Fix Candidates`, ``);
    highItems.forEach((a, i) => {
      const { finding, suggestion: s } = a;
      const relFile = path.relative(process.cwd(), finding.file);
      lines.push(
        `### ${i + 1}. ${finding.type} (${s.confidence})`,
        ``,
        `**File:** \`${relFile}\` · **Line:** ${finding.line}`,
        ``,
        `**Before:**`,
        `\`\`\``,
        s.before,
        `\`\`\``,
        ``,
      );
      if (s.after) {
        lines.push(
          `**After:**`,
          `\`\`\``,
          s.after,
          `\`\`\``,
          ``,
        );
      }
      if (s.alternatives.length > 0) {
        lines.push(`**Alternatives:**`);
        s.alternatives.forEach(alt => lines.push(`- \`${alt}\``));
        lines.push(``);
      }
      lines.push(`**Reason:** ${s.note}`, ``);
    });
  }

  // ── Needs Review ────────────────────────────────────────────────
  const reviewItems = annotated.filter(a => a.suggestion?.confidence === 'needs-review');
  if (reviewItems.length > 0) {
    lines.push(`---`, ``, `## Needs Review`, ``);
    reviewItems.forEach((a, i) => {
      const { finding, suggestion: s } = a;
      const relFile = path.relative(process.cwd(), finding.file);
      lines.push(
        `### ${i + 1}. ${finding.type}`,
        ``,
        `**File:** \`${relFile}\` · **Line:** ${finding.line}  `,
        `**Current:** \`${finding.value}\``,
        ``,
      );
      if (s.after) {
        lines.push(`**Possible fix:**`, `\`\`\``, s.after, `\`\`\``, ``);
      }
      if (s.alternatives.length > 0) {
        lines.push(`**Possible tokens:**`);
        s.alternatives.forEach(alt => lines.push(`- \`${alt}\``));
        lines.push(``);
      }
      lines.push(`**Decision needed:** ${s.note}`, ``);
    });
  }

  // ── Human Decisions Needed ──────────────────────────────────────
  const humanItems = annotated.filter(a => a.suggestion?.confidence === 'needs-human');
  if (humanItems.length > 0) {
    lines.push(`---`, ``, `## Human Decisions Needed`, ``);
    humanItems.forEach((a, i) => {
      const { finding, suggestion: s } = a;
      const relFile = path.relative(process.cwd(), finding.file);
      lines.push(
        `### ${i + 1}. ${finding.type}`,
        ``,
        `**File:** \`${relFile}\` · **Line:** ${finding.line}  `,
        `**Current:** \`${finding.value}\``,
        ``,
      );
      if (s.alternatives.length > 0) {
        lines.push(`**Possible alternatives:**`);
        s.alternatives.forEach(alt => lines.push(`- \`${alt}\``));
        lines.push(``);
      }
      lines.push(`**Decision needed:** ${s.note}`, ``);
    });
  }

  // ── Unmapped ────────────────────────────────────────────────────
  const unmapped = annotated.filter(a => a.suggestion?.confidence === 'unmapped');
  if (unmapped.length > 0) {
    lines.push(`---`, ``, `## Unmapped Values`, ``,
      `| File | Line | Value | Notes |`,
      `|---|---:|---|---|`,
    );
    for (const a of unmapped) {
      const relFile = path.relative(process.cwd(), a.finding.file);
      lines.push(`| \`${esc(relFile)}\` | ${a.finding.line} | \`${esc(a.finding.value)}\` | ${esc(a.suggestion?.note ?? '')} |`);
    }
    lines.push(``);
  }

  // ── Patch Candidate ─────────────────────────────────────────────
  lines.push(`---`, ``, `## Patch Candidate`, ``);
  if (patchInfo.count > 0) {
    lines.push(
      `- **Generated:** yes`,
      `- **Path:** \`${path.relative(process.cwd(), patchInfo.patchPath)}\``,
      `- **Patchable items:** ${patchInfo.count}`,
      ``,
      `> Apply with: \`patch -p0 < ${path.basename(patchInfo.patchPath)}\`  `,
      `> **Review the diff before applying.**`,
    );
  } else {
    lines.push(`- **Generated:** no — no high-confidence suggestions found.`);
  }
  lines.push(``);

  // ── Notes ───────────────────────────────────────────────────────
  lines.push(
    `---`,
    ``,
    `## Notes`,
    ``,
    `- This report is generated from SW Design System Source Guard Fix Suggestions (MVP3.6).`,
    `- The design system repository is the source of truth.`,
    `- **External service files are NOT modified.** Apply suggestions manually after review.`,
    `- Scanning is regex-based (MVP). No AST parser used.`,
    `- rgba values always require human review.`,
    `- Button variant changes (ghost → secondary/blue-line) always require human decision.`,
    ``,
    `---`,
    ``,
    `*Generated by \`npm run guard:suggest\`*`,
  );

  // Write report
  const reportDir  = path.join(getRoot(), 'reports');
  const reportPath = path.join(reportDir, `source-guard-fix-suggestions-${name}.md`);
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
  return reportPath;
}

// ── Main ─────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.target) {
    printUsage();
    process.exit(0);
  }

  // Load registry
  console.log('Loading SW Design System registry...');
  const registry       = loadRegistry();
  const foundationColors = loadJson('registry/tokens/foundation.colors.json');
  const semanticColors   = loadJson('registry/tokens/semantic.colors.json');

  // Build suggestion engine
  const engine = buildSuggestionEngine(registry, foundationColors, semanticColors);

  // Scan target
  console.log(`Scanning target: ${args.target}`);
  const { files, error } = scanTarget(args.target);

  if (error) {
    console.error(`\nError: ${error}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('No scannable files found.');
    process.exit(0);
  }

  console.log(`Found ${files.length} file(s) to scan...`);

  // Run checks + build line index
  const allFindings = [];
  const lineIndex   = new Map(); // file → string[]

  for (const file of files) {
    const lines = readLines(file);
    lineIndex.set(file, lines);

    const found = [
      ...checkColors(file, lines),
      ...checkCssVars(file, lines, registry),
      ...checkButtonVariants(file, lines, registry),
      ...checkInlineStyles(file, lines),
    ];
    allFindings.push(...found);
  }

  // Deduplicate
  const seen = new Set();
  const deduped = allFindings.filter(f => {
    const key = `${f.type}|${f.file}|${f.line}|${f.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Generate suggestions
  const annotated = deduped.map(finding => {
    const lines       = lineIndex.get(finding.file) ?? [];
    const lineContent = lines[finding.line - 1] ?? '';
    const suggestion  = generateSuggestion(finding, lineContent, engine, registry);
    return { finding, suggestion };
  });

  // Write patch candidates
  const patchInfo = writePatchCandidates(args.target, annotated);

  // Write fix suggestion report
  const reportPath = generateFixReport(args.target, annotated, patchInfo);

  // Console summary
  const counts = countByConfidence(annotated);
  const name   = targetBaseName(args.target);
  console.log(`\nSource Guard Fix Suggestions — ${name}`);
  console.log('═'.repeat(50));
  console.log(`High confidence : ${counts.high + counts.medium}`);
  console.log(`Needs review    : ${counts['needs-review']}`);
  console.log(`Human decisions : ${counts['needs-human']}`);
  console.log(`Unmapped        : ${counts.unmapped}`);
  console.log(`Report          : ${path.relative(process.cwd(), reportPath)}`);
  if (patchInfo.count > 0) {
    console.log(`Patch candidate : ${path.relative(process.cwd(), patchInfo.patchPath)} (${patchInfo.count} item${patchInfo.count > 1 ? 's' : ''})`);
  } else {
    console.log(`Patch candidate : none (no high-confidence items)`);
  }

  process.exit(0);
}

main();
