'use strict';

const fs   = require('fs');
const path = require('path');

const ALLOWED_EXTENSIONS = new Set(['.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.vue']);
const EXCLUDED_DIRS      = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt']);

/**
 * Collects all scannable files under a directory (recursive).
 * Skips excluded directories.
 */
function collectFiles(dir) {
  const files = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return files;
  }

  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(full));
    } else if (entry.isFile() && ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Resolves target path and returns { files, error }.
 * - If target is a file → single-file list.
 * - If target is a directory → recursive file list.
 */
function scanTarget(targetPath) {
  const resolved = path.resolve(targetPath);

  let stat;
  try {
    stat = fs.statSync(resolved);
  } catch (e) {
    return { files: [], error: `Target path not found: ${resolved}` };
  }

  if (stat.isFile()) {
    if (!ALLOWED_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
      return { files: [], error: `File extension not supported: ${resolved}` };
    }
    return { files: [resolved], error: null };
  }

  if (stat.isDirectory()) {
    const files = collectFiles(resolved);
    return { files, error: null };
  }

  return { files: [], error: `Target is not a file or directory: ${resolved}` };
}

/**
 * Reads a file and returns its lines. Returns [] on error.
 */
function readLines(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split('\n');
  } catch (e) {
    return [];
  }
}

module.exports = { scanTarget, readLines };
