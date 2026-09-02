#!/usr/bin/env node
/**
 * UI Library Icon Geometry Check
 *
 * 아이콘의 세 층(컴포넌트 hit area / SVG frame / 실제 glyph)을 섞지 않도록,
 * 웹 아이콘 manifest의 frame·glyph 계약과 실제 SVG 구조를 전수 대조한다.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'ui-library/src/assets/icons');
const DIST_DIR = path.join(ROOT, 'ui-library/dist/assets/icons');

const closeEnough = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 0.0001;
const numberList = (value = '') => value.trim().split(/[\s,]+/).map(Number);

function attributes(source = '') {
  const result = {};
  for (const match of source.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)) result[match[1]] = match[2];
  return result;
}

function validateIconAsset(icon, asset, label = icon?.id || 'unknown') {
  const errors = [];
  const geometry = icon?.geometry;
  const frame = geometry?.frame;
  const glyph = geometry?.glyph;
  const requiredNumbers = [frame?.width, frame?.height, glyph?.x, glyph?.y, glyph?.width, glyph?.height];

  if (!geometry || !frame || !glyph) {
    return [`${label}: manifest geometry.frame과 geometry.glyph가 필요합니다.`];
  }
  if (requiredNumbers.some((value) => !Number.isFinite(value) || value < 0)) {
    errors.push(`${label}: frame·glyph 수치는 0 이상의 숫자여야 합니다.`);
  }
  if (geometry.scaling !== 'proportional') errors.push(`${label}: geometry.scaling은 proportional이어야 합니다.`);
  if (glyph.x + glyph.width > frame.width || glyph.y + glyph.height > frame.height) {
    errors.push(`${label}: glyph가 frame 영역을 벗어납니다.`);
  }

  asset = Buffer.isBuffer(asset) ? asset.toString('utf8') : asset;

  const openings = [...asset.matchAll(/<svg\b([^>]*)>/gi)];
  const closings = [...asset.matchAll(/<\/svg\s*>/gi)];
  if (openings.length !== 2 || closings.length !== 2) {
    errors.push(`${label}: 바깥 frame SVG와 data-s1-part="glyph" SVG를 각각 하나씩 사용해야 합니다.`);
    return errors;
  }

  const root = attributes(openings[0][1]);
  const glyphNode = attributes(openings[1][1]);
  const rootViewBox = numberList(root.viewBox);
  const glyphViewBox = numberList(glyphNode.viewBox);

  if (!closeEnough(parseFloat(root.width), frame.width) || !closeEnough(parseFloat(root.height), frame.height)) {
    errors.push(`${label}: SVG frame width·height가 manifest와 다릅니다.`);
  }
  if (rootViewBox.length !== 4 || !closeEnough(rootViewBox[0], 0) || !closeEnough(rootViewBox[1], 0) ||
      !closeEnough(rootViewBox[2], frame.width) || !closeEnough(rootViewBox[3], frame.height)) {
    errors.push(`${label}: SVG frame viewBox가 manifest와 다릅니다.`);
  }
  if (glyphNode['data-s1-part'] !== 'glyph') errors.push(`${label}: 내부 SVG에 data-s1-part="glyph"가 필요합니다.`);
  for (const key of ['x', 'y', 'width', 'height']) {
    if (!closeEnough(parseFloat(glyphNode[key]), glyph[key])) errors.push(`${label}: glyph ${key}가 manifest와 다릅니다.`);
  }
  if (glyphViewBox.length !== 4 || !closeEnough(glyphViewBox[0], 0) || !closeEnough(glyphViewBox[1], 0) ||
      !closeEnough(glyphViewBox[2], glyph.width) || !closeEnough(glyphViewBox[3], glyph.height)) {
    errors.push(`${label}: glyph viewBox가 manifest glyph 크기와 다릅니다.`);
  }
  if (glyphNode.preserveAspectRatio !== 'xMidYMid meet') {
    errors.push(`${label}: glyph는 중앙 비율 유지(xMidYMid meet)로 축소되어야 합니다.`);
  }

  const nestedStart = openings[1].index;
  const nestedEnd = asset.indexOf('</svg>', nestedStart);
  const outsideGlyph = `${asset.slice(openings[0].index + openings[0][0].length, nestedStart)}${asset.slice(nestedEnd + 6, asset.lastIndexOf('</svg>'))}`;
  if (/<(?:path|circle|ellipse|rect|line|polyline|polygon|use|g)\b/i.test(outsideGlyph)) {
    errors.push(`${label}: 실제 도형은 glyph SVG 안에만 있어야 합니다.`);
  }
  return errors;
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function collectErrors({ includeDist = true } = {}) {
  const errors = [];
  const manifestPath = path.join(SOURCE_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return ['웹 아이콘 source manifest가 없습니다.'];
  const manifest = loadJson(manifestPath);
  const ids = new Set();

  for (const icon of manifest.icons || []) {
    if (ids.has(icon.id)) errors.push(`${icon.id}: icon id가 중복됩니다.`);
    ids.add(icon.id);
    const file = path.join(SOURCE_DIR, icon.file || '');
    if (!fs.existsSync(file)) { errors.push(`${icon.id}: source SVG가 없습니다.`); continue; }
    errors.push(...validateIconAsset(icon, fs.readFileSync(file, 'utf8')));
  }

  const componentsDir = path.join(ROOT, 'ui-library/src/components');
  if (fs.existsSync(componentsDir)) {
    for (const component of fs.readdirSync(componentsDir)) {
      const componentManifest = path.join(componentsDir, component, 'manifest.json');
      if (!fs.existsSync(componentManifest)) continue;
      for (const usage of loadJson(componentManifest).icons || []) {
        if (!ids.has(usage.id)) errors.push(`${component}: 등록되지 않은 아이콘 ${usage.id}를 사용합니다.`);
      }
    }
  }

  const distManifestPath = path.join(DIST_DIR, 'manifest.json');
  if (includeDist && !fs.existsSync(distManifestPath)) {
    errors.push('dist 아이콘 manifest가 없습니다. ui:build를 실행해야 합니다.');
  } else if (includeDist) {
    const distManifest = loadJson(distManifestPath);
    if (JSON.stringify(distManifest) !== JSON.stringify(manifest)) errors.push('dist 아이콘 manifest가 source와 다릅니다.');
    for (const icon of manifest.icons || []) {
      const sourceFile = path.join(SOURCE_DIR, icon.file);
      const distFile = path.join(DIST_DIR, icon.file);
      if (!fs.existsSync(distFile)) errors.push(`${icon.id}: dist SVG가 없습니다.`);
      else if (fs.readFileSync(distFile, 'utf8') !== fs.readFileSync(sourceFile, 'utf8')) errors.push(`${icon.id}: dist SVG가 source와 다릅니다.`);
    }
  }
  return errors;
}

function runSelfTest() {
  const icon = { id: 'fixture', geometry: { frame: { width: 24, height: 24 }, glyph: { x: 4, y: 4, width: 16, height: 16 }, scaling: 'proportional' } };
  const valid = '<svg width="24" height="24" viewBox="0 0 24 24"><svg data-s1-part="glyph" x="4" y="4" width="16" height="16" viewBox="0 0 16 16" preserveAspectRatio="xMidYMid meet"><path d="M0 0"/></svg></svg>';
  const oldBug = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M0 0"/></svg>';
  const wrongGlyph = valid.replace('width="16" height="16"', 'width="24" height="24"');
  return validateIconAsset(icon, valid).length === 0 && validateIconAsset(icon, oldBug).length > 0 && validateIconAsset(icon, wrongGlyph).length > 0;
}

/** ① 원본 선언 의무화 · ② 원본 대조 기록 확인 — 상세 판정은 ui-library-icon-origin-check.js 가 한다.
 *  여기서는 게이트가 느려지지 않게 "선언이 있고 기록이 최신인가"만 본다. */
function originResult() {
  try {
    const { errors, warnings } = require('./ui-library-icon-origin-check.js').run({ record: false });
    return { errors, warnings };
  } catch (e) {
    return { errors: [`아이콘 원본 대조 실행 실패: ${e.message}`], warnings: [] };
  }
}

function check({ pass = () => {}, fail = () => {} } = {}) {
  if (runSelfTest()) pass('아이콘 검사기 적대 테스트 통과(틀/도형 혼동 탐지)');
  else fail('아이콘 검사기 자체 적대 테스트 실패');
  const origin = originResult();
  for (const warning of origin.warnings) console.warn(`⚠️  ${warning}`);
  const errors = [...collectErrors(), ...origin.errors];
  for (const error of errors) fail(error);
  if (!errors.length) pass('모든 웹 아이콘의 frame·glyph 계약·source/dist 일치·라이브러리 원본 모양 대조 통과');
  return { icons: fs.existsSync(path.join(SOURCE_DIR, 'manifest.json')) ? (loadJson(path.join(SOURCE_DIR, 'manifest.json')).icons || []).length : 0, errors };
}

if (require.main === module) {
  const result = check({ pass: (message) => console.log(`✅ ${message}`), fail: (message) => console.error(`❌ ${message}`) });
  console.log(`UIICON_SUMMARY icons=${result.icons} errors=${result.errors.length}`);
  if (result.errors.length || !runSelfTest()) process.exit(1);
}

module.exports = { validateIconAsset, collectErrors, runSelfTest, check };
