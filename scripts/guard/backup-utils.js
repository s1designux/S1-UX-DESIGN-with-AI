'use strict';

const fs   = require('fs');
const path = require('path');
const { getRoot } = require('./utils');

/**
 * Creates a backup of files before they are modified by apply mode.
 * Backup location: reports/apply-backups/[target-name]-[timestamp]/
 *
 * Returns the backup directory path.
 */
function createBackup(targetName, filesToModify) {
  const ts        = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const backupDir = path.join(getRoot(), 'reports', 'apply-backups', `${targetName}-${ts}`);

  fs.mkdirSync(backupDir, { recursive: true });

  const manifest = [];

  for (const filePath of filesToModify) {
    try {
      const rel     = path.relative(process.cwd(), filePath);
      const safeName = rel.replace(/[\\/]/g, '__');
      const dest    = path.join(backupDir, safeName);
      fs.copyFileSync(filePath, dest);
      manifest.push({ original: rel, backup: path.relative(getRoot(), dest) });
    } catch (e) {
      console.warn(`[backup] Could not backup ${filePath}: ${e.message}`);
    }
  }

  // Write manifest
  const manifestPath = path.join(backupDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ createdAt: new Date().toISOString(), files: manifest }, null, 2), 'utf8');

  return backupDir;
}

module.exports = { createBackup };
