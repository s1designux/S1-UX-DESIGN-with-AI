#!/usr/bin/env node
/**
 * component-fingerprint-selftest.js — 부품 지문이 "좁게, 그러나 빠짐없이" 잡는지 시험한다.
 * ---------------------------------------------------------------------------
 * 지문 계산을 바꾸는 일은 검사기를 약화시킬 수 있다(CLAUDE.md §금지 행동). 그래서 고치기 전에
 * 이 적대 시험을 먼저 짰다. 정본을 일부러 한 곳씩 건드려 보고, **잡혀야 할 것이 잡히고
 * 잡히면 안 되는 것이 안 잡히는지**를 본다. 건드린 파일은 끝나면 원래대로 되돌린다.
 *
 * 시험 6가지 (river 결정 2026-09-16):
 *   가. 부품 하나의 코드만 고치면 → 그 부품(과 그것을 빌려 쓰는 부품)만 달라진다
 *   나. 주석만 고치면            → 아무 부품도 달라지지 않는다
 *   다. 부품에 박힌 글자를 고치면 → 그 부품이 달라진다
 *   라. 토큰 값을 고치면          → 그 토큰을 쓰는 부품만 달라진다
 *   마. 빌려주는 부품을 고치면    → 빌려 쓰는 부품도 함께 달라진다
 *   바. 배포 안 하는 세트를 고치면 → 아무 부품도 달라지지 않는다(알고 두는 구멍)
 *
 * 실행: node scripts/component-fingerprint-selftest.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CANON = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const VARS = path.join(ROOT, 'plugins/figma-vars-installer/src/vars-data.ts');
const MAP = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/governance/component-fingerprint-map.json'), 'utf8'));
const IDS = Object.keys(MAP.components);

function fingerprints() {
  // 캐시가 남지 않게 매번 새 프로세스에서 잰다.
  const { spawnSync } = require('child_process');
  const r = spawnSync(process.execPath, [path.join(__dirname, 'lib/canonical-fingerprint.js')], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`지문 계산 실패:\n${r.stdout}${r.stderr}`);
  const out = {};
  for (const line of r.stdout.trim().split('\n')) {
    const [id, value] = line.trim().split(/\s+/);
    out[id] = value;
  }
  return out;
}

const base = fingerprints();

function withEdit(file, apply, label) {
  const original = fs.readFileSync(file, 'utf8');
  const edited = apply(original);
  if (edited === original) throw new Error(`[${label}] 고칠 자리를 찾지 못했습니다 — 시험이 무의미해집니다`);
  fs.writeFileSync(file, edited);
  try {
    const after = fingerprints();
    return IDS.filter((id) => after[id] !== base[id]).sort();
  } finally {
    fs.writeFileSync(file, original);
  }
}

const results = [];
const check = (name, expected, actual) => {
  const ok = expected.length === actual.length && expected.every((v, i) => v === actual[i]);
  results.push({ name, ok, expected, actual });
};

// 가. 부품 하나의 코드만 고친다 — 토글의 손잡이 크기.
check('가. 한 부품 코드만 고치면 그 부품만',
  ['toggle'],
  withEdit(CANON, (s) => s.replace(/(async function buildToggle\([^)]*\)[^{]*\{)/, '$1\n  const selftestMarker = 1;'), '가'));

// 나. 주석만 고친다 — 파일 맨 위 설명 한 줄.
check('나. 주석만 고치면 아무 부품도',
  [],
  withEdit(CANON, (s) => s.replace(/^\/\//m, '// selftest 주석 한 줄 변경'), '나'));

// 다. 부품에 박힌 글자를 고친다 — Modal Content 의 본문 리터럴.
check('다. 박힌 글자를 고치면 그 부품이',
  ['modal-content'],
  withEdit(CANON, (s) => {
    const at = s.indexOf('async function buildModalContent(');
    if (at === -1) return s;
    const tail = s.slice(at);
    const m = /"([가-힣][^"]{2,})"/.exec(tail);
    if (!m) return s;
    return s.slice(0, at) + tail.replace(m[0], `"${m[1]} 셀프테스트"`);
  }, '다'));

// 라. 토큰 값을 고친다 — 토글 전용 색 하나.
check('라. 토큰 값을 고치면 그 토큰 쓰는 부품만',
  ['toggle'],
  withEdit(VARS, (s) => s.replace(/("color\/control\/indicator\/unselected"\s*:\s*\{\s*light:\s*")([^"]+)(")/, (_, a, v, b) => `${a}gray/900${b}`), '라'));

// 마. 빌려주는 부품을 고친다 — Button 을 고치면 모달·바텀시트도 따라 오른다.
const borrowers = IDS.filter((id) => {
  const seen = new Set();
  const walk = (one) => {
    if (seen.has(one)) return false;
    seen.add(one);
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, `ui-library/src/components/${one}/manifest.json`), 'utf8'));
    const deps = manifest.dependencies?.coreComponents || [];
    return deps.includes('button') || deps.some(walk);
  };
  return walk(id);
});
check('마. 빌려주는 부품을 고치면 빌려 쓰는 쪽도',
  ['button', ...borrowers].sort(),
  withEdit(CANON, (s) => s.replace(/(async function buildButtonSet\([^)]*\)[^{]*\{)/, '$1\n  const selftestMarker = 1;'), '마'));

// 바. 배포하지 않는 세트를 고친다 — 아무 부품도 반응하지 않아야 한다(알고 두는 구멍).
check('바. 배포 안 하는 세트를 고치면 아무 부품도',
  [],
  withEdit(CANON, (s) => s.replace(/(async function buildWebTabBar\([^)]*\)[^{]*\{)/, '$1\n  const selftestMarker = 1;'), '바'));

let failed = 0;
for (const { name, ok, expected, actual } of results) {
  if (ok) console.log(`✅ ${name} — ${actual.length ? actual.join(', ') : '변화 없음'}`);
  else {
    failed += 1;
    console.error(`❌ ${name}\n   기대: ${expected.join(', ') || '(없음)'}\n   실제: ${actual.join(', ') || '(없음)'}`);
  }
}
process.exit(failed ? 1 : 0);
