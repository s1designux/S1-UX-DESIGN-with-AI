#!/usr/bin/env node
/**
 * gen-foundation-registry.js — registry/tokens/foundation.colors.json 자동 생성
 * ─────────────────────────────────────────────────────────────────────────
 * 정본(vars-data.ts FOUNDATION_COLOR) → registry Foundation 색 목록.
 *
 * 왜 생성물로 바꿨나 (2026-08-01, river 결정):
 *   이 파일은 손편집이었지만 **죽은 사본이 아니었다** — 정본 211개 중 208개가 일치하고,
 *   Gate 7(token-sync-monitor)이 매번 그 208개 값을 실제로 대조하는 살아있는 검사 표면이다.
 *   그래서 아카이브하면 검사 커버리지가 208건 줄어든다(정확도가 떨어지는 방향).
 *   생성물로 바꾸면 **손유지가 사라지면서 Gate 7 커버리지는 그대로 유지**된다.
 *
 * 보존 정책 — 생성기가 덮어쓰지 않는 것:
 *   1) `meta` 의 사람이 쓴 서술(description 등)은 유지하되 source/updatedAt 은 갱신한다.
 *   2) 각 토큰의 `description`(예: brand.ci "CI/logo only…")은 **기존 파일에서 이어받는다** —
 *      정본 vars-data 에는 그 서술이 없기 때문. 새 토큰은 description 없이 생성된다.
 *   3) **정본에 없는 토큰**(status-dark-* 3종 = tokens.css 에만 있는 350 step alias)은
 *      `_nonCanonical` 로 분리해 보존한다. 조용히 지우면 Gate 7 이 대조하던 항목이 사라진다.
 *
 * 사용: node scripts/gen-foundation-registry.js [--check]
 *   --check : 재생성 결과가 현재 파일과 다르면 exit 1 (드리프트 검사)
 */
const fs = require('fs');
const path = require('path');
const { loadVarsData } = require('./lib/load-vars-data');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'registry/tokens/foundation.colors.json');
const CHECK = process.argv.includes('--check');

const cssVarOf = (key) => '--color-' + key.replace(/\//g, '-');
// 이 파일의 그룹 키 규칙은 camelCase 다(gray-dark → grayDark · visual-gray → visualGray).
//   정본 키는 kebab 이라 그대로 쓰면 grayDark/gray-dark 두 그룹이 생겨 사본이 중복된다.
const groupKeyOf = (kebab) => kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

function build(prev) {
  const V = loadVarsData();
  const prevColor = (prev && prev.color) || {};

  // 기존 파일의 토큰별 description 을 (group, step) 으로 색인 — 사람이 쓴 서술 보존용.
  const descOf = (group, step) => {
    const g = prevColor[group];
    const t = g && g[step];
    return t && typeof t.description === 'string' ? t.description : undefined;
  };

  const color = {};
  for (const [key, hex] of Object.entries(V.FOUNDATION_COLOR)) {
    const m = key.match(/^([a-z0-9-]+)\/([a-z0-9-]+)$/);
    if (!m) continue;
    const [, rawGroup, step] = m;
    const group = groupKeyOf(rawGroup);
    if (!color[group]) color[group] = {};
    const entry = { value: hex, cssVar: cssVarOf(key), status: 'stable' };
    const d = descOf(group, step);
    if (d) entry.description = d;
    color[group][step] = entry;
  }

  // 정본에 없는데 기존 파일에 있던 토큰 → 보존(조용한 커버리지 축소 방지).
  //   판정 기준은 **그룹 이름이 아니라 cssVar** 다. 같은 토큰이 옛 그룹명으로 들어 있는 경우가
  //   있기 때문(실측: coolgrayDark 10개 = visualGrayDark 와 cssVar·값 완전 동일 — 옛 이름).
  //   그룹명으로 판정하면 그 10개가 "정본에 없는 토큰"으로 둔갑해 사본이 되살아난다.
  //   ⚠️ 입력은 prev.color **와 prev._nonCanonical 둘 다**여야 한다. 앞선 실행에서 보존분이
  //   _nonCanonical 로 옮겨졌으므로, prev.color 만 보면 두 번째 실행에서 그 항목이 조용히
  //   사라진다(멱등성 깨짐 — 실제로 발생해 statusDarkAlias 3건이 유실됐고 --check 가 잡았다).
  const canonVars = new Set();
  for (const g of Object.values(color)) for (const t of Object.values(g)) canonVars.add(t.cssVar);
  const nonCanonical = {};
  const preserveSources = [prevColor, (prev && prev._nonCanonical) || {}];
  for (const src of preserveSources) {
    for (const [group, steps] of Object.entries(src)) {
      for (const [step, t] of Object.entries(steps || {})) {
        if (t && canonVars.has(t.cssVar)) continue;   // 이름만 다른 같은 토큰 → 버린다
        if (!nonCanonical[group]) nonCanonical[group] = {};
        nonCanonical[group][step] = t;
      }
    }
  }

  const meta = Object.assign({}, (prev && prev.meta) || {}, {
    name: 'SW Foundation Colors',
    status: 'stable',
    generated: true,
    source: 'plugins/figma-vars-installer/src/vars-data.ts (FOUNDATION_COLOR)',
    generator: 'scripts/gen-foundation-registry.js',
    updatedAt: new Date().toISOString().slice(0, 10),
    description: (prev && prev.meta && prev.meta.description)
      || 'Foundation 색 팔레트. Raw HEX 는 이 층에서만 허용된다(Semantic 이상은 var() 참조).',
    _note: '자동 생성물 — 손편집 금지. 값을 바꾸려면 vars-data.ts 를 고치고 npm run tokens:reconcile 을 돌린다.',
  });

  const out = { meta, color };
  if (Object.keys(nonCanonical).length) {
    out._nonCanonical = nonCanonical;
    out._nonCanonicalNote =
      '정본(vars-data FOUNDATION_COLOR)에 없지만 tokens.css 등 다른 표면에 실재하는 토큰. '
      + '생성기가 지우지 않고 보존한다(Gate 7 이 대조하던 항목이 조용히 사라지지 않게). '
      + '정본으로 편입하거나 폐기하려면 별도 결정이 필요하다.';
  }
  return out;
}

function main() {
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
  const next = build(prev);
  const nextText = JSON.stringify(next, null, 2) + '\n';

  const count = Object.values(next.color).reduce((s, g) => s + Object.keys(g).length, 0);
  const nonCanon = next._nonCanonical
    ? Object.values(next._nonCanonical).reduce((s, g) => s + Object.keys(g).length, 0) : 0;

  if (CHECK) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    // updatedAt 은 실행일이라 비교에서 제외(내용 드리프트만 본다).
    const strip = (t) => t.replace(/"updatedAt":\s*"[^"]*"/g, '"updatedAt":"-"');
    if (strip(cur) !== strip(nextText)) {
      console.error('  ❌ registry/tokens/foundation.colors.json 이 정본과 어긋남 — `node scripts/gen-foundation-registry.js` 로 재생성');
      process.exit(1);
    }
    console.log(`  ✅ registry Foundation 색 정본 일치 (${count}개${nonCanon ? ` + 비정본 보존 ${nonCanon}개` : ''})`);
    return;
  }

  fs.writeFileSync(OUT, nextText);
  console.log(`✅ foundation.colors.json 생성 완료 — ${count}개${nonCanon ? ` (+ 비정본 보존 ${nonCanon}개)` : ''}`);
}

if (require.main === module) main();
module.exports = { build };
