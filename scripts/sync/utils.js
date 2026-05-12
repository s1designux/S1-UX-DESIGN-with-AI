/**
 * SW Design System — Sync Utilities
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');

function readJson(relPath) {
  const abs = path.join(ROOT, relPath);
  try {
    return { data: JSON.parse(fs.readFileSync(abs, 'utf8')), error: null };
  } catch (e) {
    return { data: null, error: `Cannot read ${relPath}: ${e.message}` };
  }
}

function readFile(relPath) {
  const abs = path.join(ROOT, relPath);
  try {
    return { content: fs.readFileSync(abs, 'utf8'), error: null };
  } catch (e) {
    return { content: null, error: `Cannot read ${relPath}: ${e.message}` };
  }
}

function writeReport(relPath, content) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
}

function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { ROOT, readJson, readFile, writeReport, formatDate };
