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
    const { pc, mobile, heights, defaultHeight } = densityMapFor(source, policy, manifest.breaks);

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

    const byDefault = policy.levels.filter((l) => !pc[l.id] && defaultHeight === l.pcHeight);
    if (byDefault.length) {
      notes.push(`${id}: ${byDefault.map((l) => `${l.ko}(${l.pcHeight})`).join(' · ')} 는 크기를 안 줘도 그 높이가 나와 규칙을 깔지 않습니다.`);
    }
    const missing = policy.levels.filter((l) => !pc[l.id] && defaultHeight !== l.pcHeight);
    if (missing.length) {
      notes.push(`${id}: ${missing.map((l) => `${l.ko}(${l.pcHeight})`).join(' · ')} 는 이 컴포넌트에 없어 가장 가까운 크기로 대신합니다.`);
    }
    /* 모바일 크기가 없는 컴포넌트. 셋으로 갈린다:
       ① 대신 쓸 것이 정해져 있다(river 결정) ② 기본 높이가 있어 그 값으로 그려진다 ③ 찌그러진다. */
    if (!mobile) {
      const substitute = (policy.mobileSubstitutes || {})[id];
      if (substitute) {
        notes.push(`${id}: 모바일에서는 ${substitute.use} 를 대신 씁니다 — ${substitute.note}${substitute.libraryStatus === 'missing-component' ? ` (아직 부품이 없습니다: ${substitute.libraryNote})` : ''}`);
      } else if (defaultHeight) {
        notes.push(`${id}: 모바일 크기가 CSS 에 없어 기본 높이(${defaultHeight})로 그려집니다 — 손가락 기준 ${policy.mobileHeight} 이 필요하면 data-size 를 직접 주세요.`);
      } else {
        failures.push(`${id}: 모바일 크기가 없고 기본 높이도 없습니다 — data-s1-break="mobile" 만 주면 찌그러집니다. 대신 쓸 것을 density-policy.json 의 mobileSubstitutes 에 적거나 모바일 크기를 만드세요.`);
      }
    }

    // 정본이 아는 높이와 대조 — 다르면 경고로만 남긴다(컴포넌트마다 실측 대상이 다르다).
    const canonHeights = new Set((facts.components[factsName]?.geometry || [])
      .filter((g) => g.height && (g.when?.Break || g.when?.break) !== 'Mobile').map((g) => g.height));
    const unknown = heights.map(([h]) => h).filter((h) => canonHeights.size && !canonHeights.has(h));
    if (unknown.length) notes.push(`${id}: CSS 높이 ${unknown.join('·')} 는 정본 실측에 없는 값입니다 — 웹 전용 기준인지 확인하세요.`);
  }

  /* 모바일 블록은 [data-s1-break="mobile"] 로 시작해 밀도 속성이 안 들어간다 — 두 축을 다 봐야
     사각지대가 없다(독립 검증 2026-09-15 지적: 규칙 13% 가 그물 밖이었다). */
  /* 생성된 줄은 조상 선언으로 **시작**한다 — 컴포넌트 자기 규칙([data-s1-component= 으로 시작)이
     감싸개 선언을 참조하는 경우와 섞이지 않게 시작 모양으로 가린다. */
  const densityRows = css.split('\n').map((l, index) => [index, l]).filter(([, l]) => {
    const selector = l.split('{')[0].trimStart();
    return l.includes('[data-s1-component=')
      && (selector.startsWith(`[${policy.attribute}="`)
        || selector.startsWith(`[${policy.breakAttribute}="`)
        || selector.startsWith(`:is([${policy.breakAttribute}="`));
  });
  const densityLines = densityRows.map(([, l]) => l);
  /* 가드가 지키는 것은 "크기를 안 줬을 때 높이를 주는 규칙이 크기 지정을 덮지 않는가" 하나다.
     다리(bridge) 규칙은 컴포넌트 자기 규칙을 화면 구분만 느슨하게 해 그대로 옮긴 것이라 대상이 아니다.
     면제는 **어느 블록에서 나온 줄인지**로 가린다 — 줄 생김새로 가리면 크기 치환을 빠뜨린 진짜 위반이
     다리와 똑같이 생겨 함께 빠져나간다(독립 검증 2026-09-15 지적). */
  /* 줄 '내용' 이 아니라 '몇 번째 줄' 로 기억한다 — 내용으로 기억하면 선택자가 똑같은 위반이
     다른 블록에 있어도 면제를 물려받는다(독립 검증 2026-09-15 지적). */
  const bridgeRows = new Set();
  {
    let inBridge = false;
    css.split('\n').forEach((line, index) => {
      if (line.includes('/* bridge:')) inBridge = true;
      else if (line.includes('/* density:') || line.includes('/* ── 밀도(density)')) inBridge = false;
      if (inBridge) bridgeRows.add(index);
    });
  }
  const unguarded = densityRows.filter(([, l]) => !l.includes(':not([data-size])'))
    .filter(([index]) => !bridgeRows.has(index))
    .map(([, l]) => l);
  if (unguarded.length) failures.push(`밀도 규칙 ${unguarded.length}줄에 :not([data-size]) 가 빠졌습니다 — 크기를 직접 준 곳을 덮어씁니다. 예) ${unguarded[0].split('{')[0].trim().slice(0, 90)}`);

  /* 선택자 괄호가 안 맞으면 브라우저가 그 규칙과 뒤따르는 규칙까지 버린다.
     :is([data-size="xsm"], [data-size="xxsm"]) 같은 묶음을 쉼표에서 반토막 내면 이렇게 됐다(2026-09-15). */
  const broken = css.split('\n')
    .map((l) => l.split('{')[0])
    .filter((sel) => sel.includes('[data-s1-component=') &&
      (sel.match(/\(/g) || []).length !== (sel.match(/\)/g) || []).length);
  if (broken.length) failures.push(`선택자 괄호가 맞지 않는 규칙 ${broken.length}줄 — 브라우저가 통째로 버립니다. 예) ${broken[0].trim().slice(0, 80)}`);

  /* 괄호는 맞는데 뜻이 뒤집히거나 새는 모양 3종(2026-09-15 독립 검증 지적).
     지금 소스에는 없지만, 생기면 조용히 통과하던 자리라 여기서 막는다. */
  const traps = [
    [/:not\(\s*:not\(/, '이중 부정 :not(:not(…)) — 뜻이 정반대로 뒤집힙니다'],
    [/:is\([^)]*:not\(\[data-size\]\)[^)]*,[^)]*\)|:is\([^)]*,[^)]*:not\(\[data-size\]\)[^)]*\)/, ':is() 안에 :not([data-size]) 가 다른 선택자와 섞였습니다 — 크기를 직접 준 곳까지 걸립니다'],
    [/:where\([^)]*data-size[^)]*\)/, ':where() 로 묶인 크기 — 밀도 규칙이 조용히 사라지거나 약해집니다']
  ];
  for (const line of densityLines) {
    for (const [pattern, why] of traps) {
      if (pattern.test(line)) { failures.push(`${why}. 예) ${line.split('{')[0].trim().slice(0, 90)}`); break; }
    }
  }

  /* @media 안 규칙도 화면 구분에 걸릴 수 있다(입력의 hover 억제). 밀도 대상 컴포넌트에서
     그런 규칙이 컴포넌트 자기 [data-break] 만 보고 감싸개 선언을 무시하면, 감싸개로만 선언한
     화면에서 조용히 어긋난다 — 0.5.6 이 그렇게 퇴행했다(독립 검증 2026-09-15). */
  for (const id of Object.keys(policy.componentFacts)) {
    const source = fs.readFileSync(path.join(ROOT, 'ui-library/src/components', id, `${id}.css`), 'utf8');
    for (const block of source.match(/@media[^{]*\{[\s\S]*?\n\}/g) || []) {
      for (const line of block.split('\n')) {
        const selector = line.split('{')[0];
        if (!/\[data-break="/.test(selector)) continue;
        if (selector.includes(policy.breakAttribute)) continue;
        failures.push(`${id}: @media 안 규칙이 감싸개의 ${policy.breakAttribute} 선언을 보지 않습니다 — 감싸개로만 화면을 선언한 자리에서 어긋납니다. 예) ${selector.trim().slice(0, 90)}`);
      }
    }
  }

  console.log('🔎 밀도 정책 검사기 (Density Policy)');
  for (const n of notes) console.log(`  ⚠️  ${n}`);
  if (failures.length) {
    for (const f of failures) console.error(`  ❌ ${f}`);
    process.exit(1);
  }
  console.log(`  ✅ 밀도 ${policy.levels.map((l) => l.ko).join('·')} 가 컴포넌트 ${Object.keys(policy.componentFacts).length}종에서 배포본과 일치 (규칙 ${densityLines.length}줄)`);
}

main().catch((error) => { console.error(`🔎 밀도 정책 검사기 실패 — ${error.message}`); process.exit(1); });
