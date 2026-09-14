#!/usr/bin/env node
'use strict';
/**
 * density-policy-check.js — 밀도(넓게·보통·좁게)가 배포본에서 실제로 살아 있는지 본다.
 *
 * 밀도는 크기 단어를 바꾸지 않고 가리기만 한다. "밀도 → 크기 단어" 표를 손으로 적지 않고
 * 컴포넌트 CSS 의 실제 높이에서 기계가 읽는다(density.mjs). 이 검사기는 그 읽기가 계속
 * 성립하는지, 그리고 읽은 대로 배포본에 실렸는지 확인한다.
 *
 * 보는 것:
 *   1. 정책이 지목한 컴포넌트가 전부 있고, 높이를 읽을 수 있는가
 *   2. 읽은 밀도 단계가 배포본 CSS 에 실제로 실려 있는가
 *   3. 밀도 규칙이 크기 지정을 덮지 않는가(:not([data-size]) 가 빠지지 않았는가)
 *   4. 정본(component-facts.json)이 아는 높이와 어긋나지 않는가 — 어긋나면 경고
 *
 * 단독 실행: npm run ui:density
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

async function main() {
  const { densityMapFor } = await import(path.join(ROOT, 'ui-library/scripts/density.mjs'));
  const policy = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/governance/density-policy.json'), 'utf8'));
  const facts = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/components/component-facts.json'), 'utf8'));
  const distPath = path.join(ROOT, 'ui-library/dist/s1-ui.css');

  const failures = [];
  const notes = [];

  if (!fs.existsSync(distPath)) {
    console.error('🔎 밀도 정책 검사기 (Density Policy)\n  ❌ ui-library/dist/s1-ui.css 가 없습니다 — npm run ui:build 먼저 실행하세요.');
    process.exit(1);
  }
  const css = fs.readFileSync(distPath, 'utf8');

  for (const [id, factsName] of Object.entries(policy.componentFacts)) {
    const base = path.join(ROOT, 'ui-library/src/components', id);
    if (!fs.existsSync(base)) { failures.push(`${id}: 배포 컴포넌트가 없습니다 — 정책에서 빼거나 이름을 고치세요.`); continue; }
    if (!facts.components[factsName]) failures.push(`${id}: component-facts.json 에 "${factsName}" 이 없습니다 — 이름이 바뀌었는지 확인하세요.`);

    const source = fs.readFileSync(path.join(base, `${id}.css`), 'utf8');
    const manifest = JSON.parse(fs.readFileSync(path.join(base, 'manifest.json'), 'utf8'));
    const { pc, mobile, heights } = densityMapFor(source, policy, manifest.breaks);

    if (!heights.length) { failures.push(`${id}: CSS 에서 크기별 높이를 하나도 읽지 못했습니다 — 밀도를 만들 수 없습니다.`); continue; }

    // 읽어낸 단계는 배포본에 실려 있어야 한다.
    for (const level of policy.levels) {
      if (!pc[level.id]) continue;
      const marker = `[${policy.attribute}="${level.id}"] [data-s1-component="${id}"]`;
      if (!css.includes(marker)) failures.push(`${id}: ${level.ko}(${level.id}) 를 읽었는데 배포본에 규칙이 없습니다.`);
    }
    if (mobile && !css.includes(`[${policy.breakAttribute}="mobile"] [data-s1-component="${id}"]`)) {
      failures.push(`${id}: 모바일 크기(${mobile})를 읽었는데 배포본에 규칙이 없습니다.`);
    }

    const missing = policy.levels.filter((l) => !pc[l.id]);
    if (missing.length) {
      notes.push(`${id}: ${missing.map((l) => `${l.ko}(${l.pcHeight})`).join(' · ')} 는 이 컴포넌트에 없어 가장 가까운 크기로 대신합니다.`);
    }

    // 정본이 아는 높이와 대조 — 다르면 경고로만 남긴다(컴포넌트마다 실측 대상이 다르다).
    const canonHeights = new Set((facts.components[factsName]?.geometry || [])
      .filter((g) => g.height && (g.when?.Break || g.when?.break) !== 'Mobile').map((g) => g.height));
    const unknown = heights.map(([h]) => h).filter((h) => canonHeights.size && !canonHeights.has(h));
    if (unknown.length) notes.push(`${id}: CSS 높이 ${unknown.join('·')} 는 정본 실측에 없는 값입니다 — 웹 전용 기준인지 확인하세요.`);
  }

  const densityLines = css.split('\n').filter((l) => l.includes(`[${policy.attribute}="`) && l.includes('[data-s1-component='));
  const unguarded = densityLines.filter((l) => !l.includes(':not([data-size])'));
  if (unguarded.length) failures.push(`밀도 규칙 ${unguarded.length}줄에 :not([data-size]) 가 빠졌습니다 — 크기를 직접 준 곳을 덮어씁니다.`);

  console.log('🔎 밀도 정책 검사기 (Density Policy)');
  for (const n of notes) console.log(`  ⚠️  ${n}`);
  if (failures.length) {
    for (const f of failures) console.error(`  ❌ ${f}`);
    process.exit(1);
  }
  console.log(`  ✅ 밀도 ${policy.levels.map((l) => l.ko).join('·')} 가 컴포넌트 ${Object.keys(policy.componentFacts).length}종에서 배포본과 일치 (규칙 ${densityLines.length}줄)`);
}

main().catch((error) => { console.error(`🔎 밀도 정책 검사기 실패 — ${error.message}`); process.exit(1); });
