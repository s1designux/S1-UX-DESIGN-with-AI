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

  // 고아 섹션 판정(2026-07-31 교정) — 헤더 §판정의 선언은 "HTML 섹션인데 **어떤 설치기
  //   컴포넌트도** 안 가리킴"인데, 구현은 sectionFor 의 값만 봤다. noSectionNeeded 23개도
  //   똑같이 설치기 컴포넌트이고 그중 다수가 자기 섹션을 갖고 있어(요소·shell 표출),
  //   의도적 제외 대상 18개가 전부 고아로 잡히던 상태였다. 선언대로 양쪽을 다 본다.
  //   이름↔섹션id 대응은 slug 정규화(소문자·영숫자만)로 맞추고, 축약/단어누락처럼
  //   정규화로 못 맞추는 것은 억지 규칙을 만들지 않고 config 의 sectionId 로 명시 선언한다.
  //   어느 쪽으로도 못 맞춘 항목은 조용히 넘기지 않고 "섹션 미대응"으로 세어 출력한다.
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const sectionBySlug = new Map([...sections].map((s) => [slug(s), s]));
  const excludedSectionIds = new Set();
  const excludedNoSection = [];   // 섹션을 못 찾은 제외 컴포넌트(정상일 수도 있음 — 미계측으로 보고)
  for (const e of (cfg.noSectionNeeded || [])) {
    if (!instSet.has(e.name)) continue;                      // 설치기에 없는 항목은 stale 소관
    let sid = null;
    if (e.sectionId) {                                       // ① 명시 선언 우선
      if (!sections.has(e.sectionId)) {
        missingSection.push(`${e.name} → 선언한 섹션 id="${e.sectionId}" 없음 (noSectionNeeded.sectionId)`);
        continue;
      }
      sid = e.sectionId;
    } else {                                                 // ② slug 정규화 자동 대응
      sid = sectionBySlug.get(slug(e.name)) || null;
    }
    if (sid) excludedSectionIds.add(sid);
    else excludedNoSection.push(e.name);
  }

  // orphan section: HTML 섹션인데 어떤 설치기 컴포넌트(sectionFor ∪ noSectionNeeded)도 안 가리킴
  const usedSids = new Set([...Object.values(sectionFor), ...excludedSectionIds]);
  const orphanSection = [...sections].filter((s) => !usedSids.has(s));

  const mains = Object.keys(sectionFor).filter((c) => instSet.has(c)).length;
  console.log('[Gate 18] 컴포넌트 페이지 커버리지 — 설치기 정본 ↔ components-new.html');
  console.log(`  설치기 컴포넌트 ${installer.length} · 섹션연결(main) ${mains} · 제외(요소·shell) ${[...excluded].filter((n) => instSet.has(n)).length} · HTML 섹션 ${sections.size}`);
  const fails = [];
  if (unclassified.length) { console.log(`  ❌ 미분류 ${unclassified.length} (설치기에 있는데 sectionFor/noSectionNeeded 둘 다 없음 — HTML 반영 또는 제외분류 필요):`); unclassified.forEach((c) => console.log('     -', c)); fails.push(...unclassified); }
  if (missingSection.length) { console.log(`  ❌ 섹션 누락 ${missingSection.length} (sectionFor 가 가리키는 HTML 섹션/nav 없음):`); missingSection.forEach((c) => console.log('     -', c)); fails.push(...missingSection); }
  if (orphanSection.length) { console.log(`  ⚠️ 고아 섹션 ${orphanSection.length} (HTML 섹션인데 설치기 컴포넌트 매핑 없음):`); orphanSection.forEach((c) => console.log('     -', c)); }
  // 미계측 정직 보고(Gate 19 "추출 0건=안 됨" 원칙) — 섹션을 못 찾은 제외 컴포넌트.
  //   섹션이 원래 없어서일 수도, 이름이 달라 못 맞춘 것일 수도 있어 기계가 구분 못 한다.
  //   고아 섹션이 함께 남아 있으면 이 목록과 짝을 맞춰 보라는 신호다.
  if (excludedNoSection.length) { console.log(`  ⚠️ 섹션 미대응 ${excludedNoSection.length} (제외 분류인데 대응 섹션 못 찾음 — 섹션이 없거나 이름이 달라 미계측. 이름이 다르면 config 의 noSectionNeeded[].sectionId 로 명시):`); excludedNoSection.forEach((c) => console.log('     -', c)); }
  if (stale.length) { console.log(`  ⚠️ stale config ${stale.length} (config 에 있으나 설치기 목록에 없음):`); stale.forEach((c) => console.log('     -', c)); }
  if (!fails.length) console.log('  ✅ 설치기 컴포넌트 전부 HTML 섹션 연결 또는 제외분류됨 — 미분류·섹션누락 0');

  // ⚠️ 필드 순서 주의: gate-check.js:487 의 정규식이 `… orphanSection=N stale=N` 을 그 순서로
  //   찾는다(앵커 없음). 새 필드는 반드시 stale= **뒤에** 붙여야 기존 파싱이 안 깨진다.
  console.log(`PAGECOV_SUMMARY installer=${installer.length} mains=${mains} excluded=${[...excluded].filter((n) => instSet.has(n)).length} unclassified=${unclassified.length} missingSection=${missingSection.length} orphanSection=${orphanSection.length} stale=${stale.length} excludedNoSection=${excludedNoSection.length}`);
  process.exit(fails.length ? 1 : 0);
}

main();
