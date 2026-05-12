'use strict';

const path = require('path');

const DESIGN_SYSTEM_ROOT = path.resolve(__dirname, '../../');

/**
 * Returns the design system root directory (where registry/ lives).
 */
function getRoot() {
  return DESIGN_SYSTEM_ROOT;
}

/**
 * Extracts the base name from a target path for use in report filenames.
 * e.g. "/path/to/service-project" → "service-project"
 */
function targetBaseName(targetPath) {
  return path.basename(path.resolve(targetPath));
}

/**
 * Joins design system root with a relative path.
 */
function registryPath(rel) {
  return path.join(DESIGN_SYSTEM_ROOT, rel);
}

module.exports = { getRoot, targetBaseName, registryPath };
