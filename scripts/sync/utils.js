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

// 날짜 줄(`**Date:** YYYY-MM-DD`)만 바뀐 보고서는 다시 쓰지 않는다 — 검사를 돌릴 때마다 날짜만 바뀐
//   변경이 남아 합치기(wt:merge)를 막던 것(2026-10-21 river 지시). 내용이 바뀌면 날짜도 함께 새로 쓴다.
const DATE_LINE = /^\*\*Date:\*\* .*$/m;
function writeReport(relPath, content) {
  const abs = path.join(ROOT, relPath);
  if (fs.existsSync(abs)) {
    const prev = fs.readFileSync(abs, 'utf8');
    if (prev === content || prev.replace(DATE_LINE, '') === content.replace(DATE_LINE, '')) return;
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
}

function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { ROOT, readJson, readFile, writeReport, formatDate };
