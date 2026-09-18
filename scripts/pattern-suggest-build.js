#!/usr/bin/env node
/**
 * pattern-suggest-build.js — 레거시 화면의 「무엇 다음에 무엇」을 세어 빌더 제안표를 만든다.
 * ─────────────────────────────────────────────────────────────────────────
 * 읽는 것 : reports/pattern-builder/inventory/<profile>/order/*.json  (세로 차례 원자료)
 *           reports/pattern-builder/profiles/<profile>/part-map.json  (레거시 이름 → 배포본 부품)
 * 쓰는 것 : reports/pattern-builder/profiles/<profile>/suggest-model.json
 *
 * ⛔ 이 산출물은 레거시 관찰이다. 정본(가이드) 규칙이 아니다 — river 결정 2026-09-18.
 *
 * 사용: npm run pattern:suggest            (기본 묶음 app-modu)
 *       npm run pattern:suggest -- app-modu
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROFILE = process.argv[2] || 'app-modu';
const INVENTORY = { 'app-modu': 'modu-app' };
const TOP = 6;                       // 후보를 몇 개까지 보여줄까
const MIN_COUNT = 3;                 // 이만큼은 나와야 후보로 올린다

const orderDir = path.join(ROOT, 'reports/pattern-builder/inventory', INVENTORY[PROFILE] || PROFILE, 'order');
const profileDir = path.join(ROOT, 'reports/pattern-builder/profiles', PROFILE);
const mapPath = path.join(profileDir, 'part-map.json');
const outPath = path.join(profileDir, 'suggest-model.json');

if (!fs.existsSync(orderDir)) { console.error(`✖ 차례 원자료가 없습니다: ${path.relative(ROOT, orderDir)}`); process.exit(1); }
if (!fs.existsSync(mapPath)) { console.error(`✖ 대응표가 없습니다: ${path.relative(ROOT, mapPath)}`); process.exit(1); }

const partMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const MAP = partMap.map || {};
const lookup = (name) => MAP[String(name).trim()] || null;

/* ── 1) 화면을 모은다 (같은 화면이 여러 파일에 있으면 한 번만) ───────────── */
const screens = new Map();
for (const f of fs.readdirSync(orderDir).filter((n) => n.endsWith('.json')).sort()) {
  const doc = JSON.parse(fs.readFileSync(path.join(orderDir, f), 'utf8'));
  for (const s of doc.screens || []) screens.set(s.id, s);
}

/* ── 2) 화면마다 「줄 묶음」의 차례로 바꾼다 ──────────────────────────────
   한 줄 = 그 줄에 들어 있는 배포본 부품들의 모음. 대응이 없는 칸은 빠진다.
   부품이 하나도 없고 글자만 있는 줄은 「글자」 한 칸으로 본다. */
const seqs = [];
const coverage = { rows: 0, mappedRows: 0, chromeRows: 0, textRows: 0, unmapped: new Map() };

for (const s of screens.values()) {
  const units = [];
  for (const row of s.order || []) {
    if (row.kind === 'body') continue;                       // 본문 상자는 칸이 아니다
    coverage.rows++;
    const parts = row.parts || {};
    const names = Object.keys(parts);
    const items = [];
    let sawChrome = false;
    for (const n of names) {
      const hit = lookup(n);
      if (!hit) { coverage.unmapped.set(n.trim(), (coverage.unmapped.get(n.trim()) || 0) + 1); continue; }
      if (hit.kind === 'chrome') { sawChrome = true; continue; }
      if (hit.kind === 'unmapped') continue;
      const key = `${hit.kind}:${hit.id}`;
      if (!items.includes(key)) items.push(key);
    }
    if (!items.length) {
      const isText = row.kind === 'text' || /^묶음\(글자|^글자/.test(row.label || '');
      if (isText && !sawChrome) { units.push('helper:text'); coverage.textRows++; }
      else if (sawChrome) coverage.chromeRows++;
      continue;
    }
    items.sort();
    units.push(items.join('+'));
    coverage.mappedRows++;
  }
  if (units.length) seqs.push(units);
}

/* ── 3) 세기 — 묶음 차례(앞 → 뒤)와 부품 차례 ─────────────────────────── */
const bump = (m, k, v) => m.set(k, (m.get(k) || 0) + (v || 1));
const groupCount = new Map();
const groupNext = new Map();     // key → Map(nextKey → n)
const START = '__start__';

for (const units of seqs) {
  let prev = START;
  for (const u of units) {
    bump(groupCount, u);
    if (!groupNext.has(prev)) groupNext.set(prev, new Map());
    bump(groupNext.get(prev), u);
    prev = u;
  }
}

const partCount = new Map();
const partNext = new Map();
for (const units of seqs) {
  const flat = [];
  for (const u of units) for (const p of u.split('+')) flat.push(p);
  let prev = START;
  for (const p of flat) {
    bump(partCount, p);
    if (!partNext.has(prev)) partNext.set(prev, new Map());
    bump(partNext.get(prev), p);
    prev = p;
  }
}

const topList = (m, total) => [...m.entries()]
  .filter(([, n]) => n >= MIN_COUNT)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, TOP)
  .map(([key, n]) => ({ key, count: n, share: total ? Math.round((n / total) * 100) : 0 }));

const asObject = (nextMap) => {
  const out = {};
  for (const [from, m] of nextMap) {
    const total = [...m.values()].reduce((a, b) => a + b, 0);
    const list = topList(m, total);
    if (list.length) out[from] = list;
  }
  return out;
};

/* ── 4) 내보내기 ─────────────────────────────────────────────────────── */
const unmapped = [...coverage.unmapped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)
  .map(([name, count]) => ({ name, count }));

const model = {
  _meta: {
    title: '모두앱 레거시에서 센 「다음에 올 만한 것」',
    profile: PROFILE,
    status: 'candidate',
    generatedBy: 'scripts/pattern-suggest-build.js',
    generatedAt: new Date().toISOString().slice(0, 10),
    source: `reports/pattern-builder/inventory/${INVENTORY[PROFILE] || PROFILE}/order/*.json`,
    partMap: `reports/pattern-builder/profiles/${PROFILE}/part-map.json`,
    warning: '⛔ 레거시 관찰이다. 정본(가이드) 규칙이 아니며 정본에 합치지 않는다 — river 결정 2026-09-18.',
    screens: screens.size,
    usableScreens: seqs.length,
    rows: coverage.rows,
    mappedRows: coverage.mappedRows,
    textRows: coverage.textRows,
    chromeRows: coverage.chromeRows,
    minCount: MIN_COUNT,
    top: TOP
  },
  groups: Object.fromEntries([...groupCount.entries()].sort((a, b) => b[1] - a[1])
    .map(([key, count]) => [key, { items: key.split('+'), count }])),
  nextGroups: asObject(groupNext),
  nextParts: asObject(partNext),
  unmappedTop: unmapped
};

fs.writeFileSync(outPath, `${JSON.stringify(model, null, 2)}\n`);

const pct = (n) => `${Math.round((n / coverage.rows) * 100)}%`;
console.log(`✅ ${path.relative(ROOT, outPath)}`);
console.log(`   화면 ${screens.size}장 중 ${seqs.length}장 사용 · 칸 ${coverage.rows}개 중 부품으로 읽힌 칸 ${coverage.mappedRows}(${pct(coverage.mappedRows)}) · 글자 칸 ${coverage.textRows}(${pct(coverage.textRows)})`);
console.log(`   묶음 후보 ${Object.keys(model.nextGroups).length}자리 · 부품 후보 ${Object.keys(model.nextParts).length}자리`);
