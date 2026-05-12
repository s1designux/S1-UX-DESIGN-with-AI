#!/usr/bin/env node
'use strict';

/**
 * SW Design System — Source Guard
 *
 * Scans an external service project for Design System compliance violations.
 * Does NOT modify any files — inspection and report generation only.
 *
 * Usage:
 *   npm run guard -- --target ../service-project
 *   node scripts/guard/index.js --target ../service-project
 */

const { loadRegistry }        = require('./load-registry');
const { scanTarget, readLines } = require('./scan-target');
const { checkColors }          = require('./check-colors');
const { checkCssVars }         = require('./check-css-vars');
const { checkButtonVariants }  = require('./check-button-variants');
const { checkInlineStyles }    = require('./check-inline-styles');
const { generateReport }       = require('./report');

// ── CLI argument parsing ──────────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--target' && argv[i + 1]) {
      args.target = argv[i + 1];
      i++;
    }
    if (argv[i] === '--strict') {
      args.strict = true;
    }
  }
  return args;
}

function printUsage() {
  console.log(`
Usage:
  npm run guard -- --target ../service-project

Options:
  --target <path>   External service project folder or file to scan
  --strict          Exit code 1 on warnings too (TODO: future option)
`);
}

// ── Main ─────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.target) {
    printUsage();
    process.exit(0);
  }

  // Load design system registry
  console.log('Loading SW Design System registry...');
  const registry = loadRegistry();

  // Scan target
  console.log(`Scanning target: ${args.target}`);
  const { files, error } = scanTarget(args.target);

  if (error) {
    console.error(`\nError: ${error}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('No scannable files found in target.');
    generateReport(args.target, [], 0);
    process.exit(0);
  }

  console.log(`Found ${files.length} file(s) to scan...`);

  // Run checks on each file
  const allFindings = [];

  for (const file of files) {
    const lines = readLines(file);

    allFindings.push(
      ...checkColors(file, lines),
      ...checkCssVars(file, lines, registry),
      ...checkButtonVariants(file, lines, registry),
      ...checkInlineStyles(file, lines),
    );
  }

  // Deduplicate findings by (type, file, line, value)
  const seen = new Set();
  const deduped = allFindings.filter(f => {
    const key = `${f.type}|${f.file}|${f.line}|${f.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Generate report
  const counts = generateReport(args.target, deduped, files.length);

  // Exit code
  if (counts.error > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();
