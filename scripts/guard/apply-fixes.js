#!/usr/bin/env node
'use strict';

/**
 * SW Design System — Source Guard Apply Mode (MVP3.7)
 *
 * Applies high-confidence fix suggestions to an external service project.
 * Files are NEVER modified unless --apply is explicitly provided.
 *
 * Usage:
 *   npm run guard:apply -- --target ../service-project --dry-run
 *   npm run guard:apply -- --target ../service-project --apply
 */

const fs   = require('fs');
const path = require('path');

const { loadRegistry }            = require('./load-registry');
const { scanTarget, readLines }   = require('./scan-target');
const { checkColors }             = require('./check-colors');
const { checkCssVars }            = require('./check-css-vars');
const { checkButtonVariants }     = require('./check-button-variants');
const { checkInlineStyles }       = require('./check-inline-styles');
const { buildSuggestionEngine }   = require('./token-suggestion');
const { generateSuggestion }      = require('./fix-suggestion-rules');
const { partitionApplicable }     = require('./apply-rules');
const { applyChangesToFile, groupByFile } = require('./patch-utils');
const { createBackup }            = require('./backup-utils');
const { getRoot, targetBaseName } = require('./utils');

// ── CLI argument parsing ──────────────────────────────────────────
function parseArgs(argv) {
  const args = { dryRun: false, apply: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--target'  && argv[i+1]) { args.target  = argv[i+1]; i++; }
    if (argv[i] === '--report'  && argv[i+1]) { args.report  = argv[i+1]; i++; }
    if (argv[i] === '--dry-run') args.dryRun = true;
    if (argv[i] === '--apply')   args.apply  = true;
  }
  return args;
}

function printUsage() {
  console.log(`
Usage:
  npm run guard:apply -- --target ../service-project --dry-run
  npm run guard:apply -- --target ../service-project --apply

Options:
  --target <path>   External service project folder or file to update
  --dry-run         Preview changes without writing files
  --apply           Apply high-confidence fixes (REQUIRED to modify files)
  --report <path>   Optional suggestion report or patch candidate path
`);
}

// ── Load foundation + semantic JSON ──────────────────────────────
function loadJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(getRoot(), rel), 'utf8'));
  } catch (e) {
    console.warn(`[registry] Cannot load ${rel}: ${e.message}`);
    return null;
  }
}

// ── Apply log report ─────────────────────────────────────────────
function writeApplyLog({ targetPath, mode, applied, skipped, humanItems, errors, backupDir }) {
  const name    = targetBaseName(targetPath);
  const date    = new Date().toISOString().slice(0, 10);
  const reportDir = path.join(getRoot(), 'reports');
  const logPath   = path.join(reportDir, `source-guard-apply-log-${name}.md`);

  function esc(s) { return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ↵ '); }

  const lines = [
    `# Source Guard Apply Log`,
    ``,
    `## Target`,
    ``,
    `- **Path:** \`${path.resolve(targetPath)}\``,
    `- **Date:** ${date}`,
    `- **Mode:** ${mode}`,
    ``,
    `---`,
    ``,
    `## Summary`,
    ``,
    `| Type | Count |`,
    `|---|---:|`,
    `| Applied | ${applied.length} |`,
    `| Skipped | ${skipped.length} |`,
    `| Human decisions needed | ${humanItems.length} |`,
    `| Errors | ${errors.length} |`,
    ``,
    `---`,
    ``,
  ];

  if (applied.length > 0) {
    lines.push(
      `## Applied Changes`,
      ``,
      `| File | Line | Before | After | Reason |`,
      `|---|---:|---|---|---|`,
    );
    for (const a of applied) {
      const relFile = path.relative(process.cwd(), a.finding.file);
      lines.push(`| \`${esc(relFile)}\` | ${a.finding.line} | \`${esc(a.suggestion.before)}\` | \`${esc(a.suggestion.after)}\` | ${esc(a.suggestion.note)} |`);
    }
    lines.push(``);
  }

  if (skipped.length > 0) {
    lines.push(
      `## Skipped`,
      ``,
      `| File | Line | Value | Reason |`,
      `|---|---:|---|---|`,
    );
    for (const s of skipped) {
      const relFile = path.relative(process.cwd(), s.finding.file);
      lines.push(`| \`${esc(relFile)}\` | ${s.finding.line} | \`${esc(s.finding.value)}\` | ${esc(s.skipReason || s.applicability?.reason || '')} |`);
    }
    lines.push(``);
  }

  if (humanItems.length > 0) {
    lines.push(`## Human Decisions Needed`, ``);
    for (const h of humanItems) {
      const relFile = path.relative(process.cwd(), h.finding.file);
      lines.push(`- \`${relFile}\` line ${h.finding.line}: **${h.finding.type}** — \`${esc(h.finding.value)}\` — ${esc(h.applicability.reason)}`);
    }
    lines.push(``);
  }

  if (errors.length > 0) {
    lines.push(`## Errors`, ``);
    errors.forEach(e => lines.push(`- ${e}`));
    lines.push(``);
  }

  lines.push(
    `---`,
    ``,
    `## Backup`,
    ``,
    backupDir
      ? `- **Location:** \`${path.relative(getRoot(), backupDir)}\``
      : `- No backup created (dry-run mode or no files modified).`,
    ``,
    `---`,
    ``,
    `## Notes`,
    ``,
    `- Only high-confidence fixes were applied.`,
    `- ghost/danger variants were NOT auto-fixed. Human decision required.`,
    `- rgba() values were NOT auto-fixed. token-exceptions review required.`,
    `- Ambiguous colors (#FFFFFF etc.) were NOT auto-fixed.`,
    mode === 'dry-run' ? `- **DRY-RUN MODE: No files were modified.**` : `- Files were modified in-place. See backup for originals.`,
    ``,
    `---`,
    ``,
    `*Generated by \`npm run guard:apply\`*`,
  );

  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(logPath, lines.join('\n'), 'utf8');
  return logPath;
}

// ── Main ─────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.target) {
    printUsage();
    process.exit(0);
  }

  if (!args.dryRun && !args.apply) {
    console.log('No mode specified. Use --dry-run to preview or --apply to apply changes.');
    printUsage();
    process.exit(0);
  }

  const mode = args.apply ? 'apply' : 'dry-run';
  const name = targetBaseName(args.target);

  console.log(`\nSource Guard Apply Mode`);
  console.log(`Target: ${args.target}`);
  console.log(`Mode:   ${mode}`);
  console.log('');

  // Load registry
  const registry        = loadRegistry();
  const foundationColors = loadJson('registry/tokens/foundation.colors.json');
  const semanticColors   = loadJson('registry/tokens/semantic.colors.json');
  const engine           = buildSuggestionEngine(registry, foundationColors, semanticColors);

  // Scan target
  const { files, error } = scanTarget(args.target);
  if (error) { console.error(`Error: ${error}`); process.exit(1); }
  if (files.length === 0) { console.log('No scannable files found.'); process.exit(0); }

  // Run checks + generate suggestions
  const allFindings = [];
  const lineIndex   = new Map();

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

  // Partition into applicable / skipped by apply rules
  const { applicable, skipped: notApplicable } = partitionApplicable(annotated);

  // Human decisions = not applicable items (for report)
  const humanItems = notApplicable;

  // ── Dry-run output ──────────────────────────────────────────────
  if (mode === 'dry-run') {
    console.log(`Will apply:`);
    if (applicable.length === 0) {
      console.log(`  (none)`);
    } else {
      // Group by type
      const byType = {};
      for (const a of applicable) {
        byType[a.finding.type] = (byType[a.finding.type] ?? 0) + 1;
      }
      for (const [t, cnt] of Object.entries(byType)) {
        console.log(`  - ${cnt} ${t} replacement${cnt > 1 ? 's' : ''}`);
      }
    }

    console.log(`\nWill skip:`);
    if (humanItems.length === 0) {
      console.log(`  (none)`);
    } else {
      const byReason = {};
      for (const h of humanItems) {
        const k = h.finding.type;
        byReason[k] = (byReason[k] ?? 0) + 1;
      }
      for (const [t, cnt] of Object.entries(byReason)) {
        console.log(`  - ${cnt} ${t}`);
      }
    }

    console.log(`\nNo files were modified.`);

    const logPath = writeApplyLog({
      targetPath: args.target, mode,
      applied: applicable, skipped: [], humanItems,
      errors: [], backupDir: null,
    });
    console.log(`\nDry-run log: ${path.relative(process.cwd(), logPath)}`);
    process.exit(0);
  }

  // ── Apply mode ──────────────────────────────────────────────────
  if (applicable.length === 0) {
    console.log('No high-confidence changes to apply.');
    const logPath = writeApplyLog({
      targetPath: args.target, mode,
      applied: [], skipped: [], humanItems,
      errors: [], backupDir: null,
    });
    console.log(`Apply log: ${path.relative(process.cwd(), logPath)}`);
    process.exit(0);
  }

  // Create backup before modifying files
  const filesToModify = [...new Set(applicable.map(a => a.finding.file))];
  let backupDir = null;
  try {
    backupDir = createBackup(name, filesToModify);
    console.log(`Backup created: ${path.relative(process.cwd(), backupDir)}`);
  } catch (e) {
    console.warn(`Could not create backup: ${e.message}. Aborting for safety.`);
    process.exit(1);
  }

  // Group applicable changes by file and apply
  const byFile = groupByFile(applicable);
  const totalApplied = [];
  const totalSkipped = [];
  const errors       = [];

  for (const [file, changes] of byFile) {
    const { applied, skipped } = applyChangesToFile(file, changes, false);
    totalApplied.push(...applied);
    totalSkipped.push(...skipped);
  }

  // Console output
  console.log(`\nApplied:`);
  if (totalApplied.length === 0) {
    console.log(`  (none)`);
  } else {
    for (const a of totalApplied) {
      const relFile = path.relative(process.cwd(), a.finding.file);
      console.log(`  ✓ ${relFile}:${a.finding.line} — ${a.finding.type}`);
    }
  }

  if (totalSkipped.length > 0) {
    console.log(`\nSkipped during apply (verification failed):`);
    for (const s of totalSkipped) {
      const relFile = path.relative(process.cwd(), s.finding.file);
      console.log(`  ✗ ${relFile}:${s.finding.line} — ${s.skipReason}`);
    }
  }

  // Write apply log
  const logPath = writeApplyLog({
    targetPath: args.target, mode,
    applied: totalApplied,
    skipped: [...totalSkipped, ...notApplicable],
    humanItems,
    errors,
    backupDir,
  });

  console.log(`\nApplied : ${totalApplied.length} change${totalApplied.length !== 1 ? 's' : ''}`);
  console.log(`Skipped : ${notApplicable.length + totalSkipped.length}`);
  console.log(`Apply log: ${path.relative(process.cwd(), logPath)}`);

  process.exit(0);
}

main();
