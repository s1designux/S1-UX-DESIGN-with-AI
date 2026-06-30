#!/usr/bin/env node
/**
 * component-page-coverage-check.js  (Gate 18 — 컴포넌트 페이지 커버리지)
 * ─────────────────────────────────────────────────────────────────────────
 * "설치기에 있는 컴포넌트가 HTML components 페이지에도 다 있나?"를 기계 대조한다.
 * 정본(baseline) = 설치기 build-components.ts 의 COMPONENT_CATEGORIES_GRID.
 * (이전엔 이 대조 장치가 0개라 Multi Toggle·Dropdown 누락이 손으로 발견됨 → 2026-06-30 게이트화.)
 *
 * 분류 정본 = registry/governance/component-page-coverage.json
 *   - sectionFor[컴포넌트] = HTML 섹션 id  → 그 섹션이 components-new.html 에 실재해야 함
 *   - noSectionNeeded[]    = 섹션 불요(Platform shell·요소 컴포넌트 등, 사유 포함)
 *
 * 판정:
 *   ❌ FAIL  미분류(설치기엔 있는데 sectionFor/noSectionNeeded 둘 다 없음) — 새 컴포넌트 반영 강제
 *   ❌ FAIL  sectionFor 가 가리키는 HTML 섹션 id 가 페이지에 없음(섹션 누락/리네임 드리프트)
 *   ⚠️ WARN  HTML 섹션인데 어떤 설치기 컴포넌트도 안 가리킴(고아 섹션)
 *   ⚠️ WARN  config 에 있는데 설치기 목록에 없는 항목(stale config)
 *
 * 출력 끝줄: `PAGECOV_SUMMARY installer=<n> mains=<n> excluded=<n> unclassified=<n> missingSection=<n> orphanSection=<n> stale=<n>`
 * 사용: node scripts/component-page-coverage-check.js  (npm run components:pagecheck)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const HTML = path.join(ROOT, 'pages/components-new.html');
const CFG = path.join(ROOT, 'registry/governance/component-page-coverage.json');

// ── 1. 설치기 컴포넌트 목록 (COMPONENT_CATEGORIES export 를 esbuild+require 로 정확 추출) ──
function installerComponents() {
  const esbuild = require('esbuild');
  const out = esbuild.buildSync({ entryPoints: [BC], bundle: true, format: 'cjs', platform: 'node', write: false });
  const tmp = path.join(os.tmpdir(), `bc-pagecov-${process.pid}.cjs`);
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  global.figma = new Proxy(function () {}, { get: () => global.figma, apply: () => global.figma });
  let mod;
  try { delete require.cache[tmp]; mod = require(tmp); } finally { try { fs.unlinkSync(tmp); } catch (_) {} }
  const grid = mod.COMPONENT_CATEGORIES || [];
  const members = [];
  for (const cat of grid) for (const m of (cat.members || [])) members.push(m);
  return members;
}

// ── 2. HTML 섹션 id (components-new.html) ──────────────────────────────────
function htmlSections() {
  const t = fs.readFileSync(HTML, 'utf8');
  const ids = new Set();
  for (const m of t.matchAll(/<section[^>]*\bid="([a-z0-9-]+)"/g)) ids.add(m[1]);
  // comp-nav 의 showSection('id') 도 수집(섹션과 교차 확인용)
  const navIds = new Set([...t.matchAll(/showSection\('([a-z0-9-]+)'/g)].map((m) => m[1]));
  return { ids, navIds };
}

function main() {
  const cfg = JSON.parse(fs.readFileSync(CFG, 'utf8'));
  const sectionFor = cfg.sectionFor || {};
  const excluded = new Set((cfg.noSectionNeeded || []).map((x) => x.name));
  const installer = installerComponents();
  const { ids: sections, navIds } = htmlSections();

  const unclassified = [];
  const missingSection = [];
  for (const comp of installer) {
    if (excluded.has(comp)) continue;
    if (sectionFor[comp]) {
      const sid = sectionFor[comp];
      if (!sections.has(sid)) missingSection.push(`${comp} → 섹션 id="${sid}" 없음`);
      else if (!navIds.has(sid)) missingSection.push(`${comp} → 섹션 id="${sid}" 있으나 comp-nav 버튼 없음`);
      continue;
    }
    unclassified.push(comp);
  }
  // stale config: sectionFor/excluded 에 있는데 설치기 목록에 없는 항목
  const instSet = new Set(installer);
  const stale = [...Object.keys(sectionFor), ...excluded].filter((n) => !instSet.has(n));
  // orphan section: HTML 섹션인데 어떤 sectionFor 값도 아님
  const usedSids = new Set(Object.values(sectionFor));
  const orphanSection = [...sections].filter((s) => !usedSids.has(s));

  const mains = Object.keys(sectionFor).filter((c) => instSet.has(c)).length;
  console.log('[Gate 18] 컴포넌트 페이지 커버리지 — 설치기 정본 ↔ components-new.html');
  console.log(`  설치기 컴포넌트 ${installer.length} · 섹션연결(main) ${mains} · 제외(요소·shell) ${[...excluded].filter((n) => instSet.has(n)).length} · HTML 섹션 ${sections.size}`);
  const fails = [];
  if (unclassified.length) { console.log(`  ❌ 미분류 ${unclassified.length} (설치기에 있는데 sectionFor/noSectionNeeded 둘 다 없음 — HTML 반영 또는 제외분류 필요):`); unclassified.forEach((c) => console.log('     -', c)); fails.push(...unclassified); }
  if (missingSection.length) { console.log(`  ❌ 섹션 누락 ${missingSection.length} (sectionFor 가 가리키는 HTML 섹션/nav 없음):`); missingSection.forEach((c) => console.log('     -', c)); fails.push(...missingSection); }
  if (orphanSection.length) { console.log(`  ⚠️ 고아 섹션 ${orphanSection.length} (HTML 섹션인데 설치기 컴포넌트 매핑 없음):`); orphanSection.forEach((c) => console.log('     -', c)); }
  if (stale.length) { console.log(`  ⚠️ stale config ${stale.length} (config 에 있으나 설치기 목록에 없음):`); stale.forEach((c) => console.log('     -', c)); }
  if (!fails.length) console.log('  ✅ 설치기 컴포넌트 전부 HTML 섹션 연결 또는 제외분류됨 — 미분류·섹션누락 0');

  console.log(`PAGECOV_SUMMARY installer=${installer.length} mains=${mains} excluded=${[...excluded].filter((n) => instSet.has(n)).length} unclassified=${unclassified.length} missingSection=${missingSection.length} orphanSection=${orphanSection.length} stale=${stale.length}`);
  process.exit(fails.length ? 1 : 0);
}

main();
