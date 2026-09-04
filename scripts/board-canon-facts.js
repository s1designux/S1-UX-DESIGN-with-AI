#!/usr/bin/env node
/**
 * board-canon-facts.js — 검수판에 박을 「정본 사실표」를 기계로 뽑는다.
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜 필요한가 (river 지적 2026-09-04):
 *   검수판을 만들 때 사람이 정본을 「크기 이름 목록」이라는 평면으로 요약했다.
 *   정본은 실제로 크기(Size) × 화면(Break=PC/Mobile) 두 축인데 그 축을 통째로
 *   빠뜨려, 23장 중 10장이 틀린 전제 위에 서 있었다. 예: 칩의 모바일 크기를
 *   「md 냐 sm 이냐」고 물었지만 정본에는 Mobile=SM 이 이미 선언돼 있고,
 *   「mobile = md」는 정본이 없다고 명시한 조합이었다.
 *
 *   → 사람이 요약하지 않는다. 정본에서 생성된 배포본 매니페스트를 기계가 읽어
 *     카드에 박는다. 요약 단계를 없애는 것이 이 파일의 존재 이유다.
 *
 * 출처: ui-library/dist/components/*.manifest.json
 *   정본(build-components.ts)에서 생성되며 canonicalFingerprint 로 정본과 묶여 있고,
 *   Gate 39(수치 대조)·Gate 46(전달본)이 정본과의 일치를 이미 지킨다.
 *   손편집 사본이 아니다 — registry/components/*.json 의 값 필드와 다르다.
 *
 * 사용: npm run board:facts          (board:refresh 가 자동으로 부른다)
 * 산출: reports/legacy-crosswalk-board/canon-facts.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'ui-library/dist/components');
const OUT = path.join(ROOT, 'reports/legacy-crosswalk-board/canon-facts.json');

// 토큰 이름(--sizing-28)에서 사람이 읽을 수치만 꺼낸다. 못 읽으면 원문 유지.

// 크기 값(높이·글자)은 매니페스트 geometry 가 없는 컴포넌트도 있어, 정본 코드의
// 크기 표(const sizes = [{ size, brk, h, font }...])를 직접 읽어 보완한다.
// 정본이 유일한 출처이므로 값이 갈리면 정본이 이긴다(하드룰 H6).
const CANON_TS = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const BUILDER = { 'chip': 'buildChip', 'input': 'buildInput', 'button': 'buildButton',
  'select': 'buildSelect', 'time-picker': 'buildTimePicker', 'date-picker': 'buildDatePicker',
  'filter-chip': 'buildFilterChip', 'tab': 'buildLineTab', 'table': 'buildTable' };
let canonSrc = '';
try { canonSrc = fs.readFileSync(CANON_TS, 'utf8'); } catch (_) {}

// Button 은 크기 표가 SIZE_CONFIG 라는 별도 상수다 — 형태가 달라 따로 읽는다.
function canonButtonTable() {
  const m = canonSrc.match(/const SIZE_CONFIG:[\s\S]*?\{([\s\S]*?)\n\};/);
  if (!m) return null;
  const rows = [];
  for (const line of m[1].split('\n')) {
    const r = line.match(/(\w+):\s*\{\s*break:\s*"(\w+)",\s*height:\s*(\d+)/);
    if (!r) continue;
    const ts = line.match(/textStyle:\s*"body\/(\d+)/);
    rows.push({ size: r[1].toLowerCase(), break: r[2].toLowerCase(),
                height: Number(r[3]), fontSize: ts ? Number(ts[1]) : null });
  }
  return rows.length ? rows : null;
}

function canonSizeTable(id) {
  if (id === 'button') return canonButtonTable();
  const fn = BUILDER[id];
  if (!fn || !canonSrc) return null;
  const at = canonSrc.indexOf(`async function ${fn}(`);
  if (at < 0) return null;
  const body = canonSrc.slice(at, at + 4000);
  const arr = body.match(/const sizes = \[([\s\S]*?)\];/);
  if (!arr) return null;
  const rows = [];
  for (const line of arr[1].split('\n')) {
    const size = line.match(/size:\s*"([^"]+)"/);
    if (!size) continue;
    const brk = line.match(/brk:\s*"([^"]+)"/);
    const h = line.match(/\bh:\s*(\d+)/);
    const font = line.match(/font:\s*(\d+)/);
    rows.push({ size: size[1].toLowerCase(), break: (brk ? brk[1] : 'PC').toLowerCase(),
                height: h ? Number(h[1]) : null, fontSize: font ? Number(font[1]) : null });
  }
  return rows.length ? rows : null;
}

function px(v) {
  if (typeof v !== 'string') return null;
  const m = v.match(/--sizing-(\d+)|--font-size-(\d+)/);
  return m ? Number(m[1] ?? m[2]) : v.replace(/\s*\(.*$/, '');
}

function factsFor(id) {
  const f = path.join(SRC, `${id}.manifest.json`);
  if (!fs.existsSync(f)) return null;
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));

  // 크기 × 화면 격자 — 정본이 실제로 만든 조합만 담는다
  const grid = [];
  const breaks = m.breaks || {};
  for (const [brk, sizes] of Object.entries(breaks)) {
    for (const size of sizes) {
      const g = (m.geometry || {})[`${size}-${brk}`] || (m.geometry || {})[size] || {};
      const c = (canonSizeTable(id) || []).find((r) => r.size === size && r.break === brk);
      grid.push({ size, break: brk,
                  height: c?.height ?? px(g.height), fontSize: c?.fontSize ?? px(g.fontSize),
                  valueSource: c ? '정본 build-components.ts' : (g.height ? '배포본 매니페스트' : '미확인') });
    }
  }
  // 정본이 「없다」고 못박은 조합 — 선택지에 그런 조합이 나오면 안 된다
  const absent = Object.entries(m.notInCanon || {})
    .filter(([k]) => /-(pc|mobile)$|^mobile$|^platform$|Axis$/.test(k))
    .map(([k, v]) => ({ key: k, reason: v }));

  return {
    id, status: m.status, version: m.version,
    sizes: m.sizes || [], breaks, sizeBreakGrid: grid,
    variants: m.variants || [], types: m.types || null,
    states: Object.keys(m.states || {}),
    canonicalStateMap: m.canonicalStateMap || null,
    absentCombinations: absent,
    sourceFingerprint: m.sourceFingerprint || null,
  };
}

const ids = fs.readdirSync(SRC).filter((f) => f.endsWith('.manifest.json')).map((f) => f.replace('.manifest.json', ''));
const facts = {};
for (const id of ids) { const f = factsFor(id); if (f) facts[id] = f; }

const out = {
  _meta: {
    목적: '검수판 카드에 박는 정본 사실 — 사람이 요약하지 않고 기계가 뽑는다',
    출처: 'ui-library/dist/components/*.manifest.json (정본 build-components.ts 에서 생성)',
    재생성: 'npm run board:facts',
    생성일: new Date().toISOString().slice(0, 10),
  },
  components: facts,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
const withMobile = Object.values(facts).filter((f) => (f.breaks.mobile || []).length);
console.log(`✅ 정본 사실 ${Object.keys(facts).length}종 → ${path.relative(ROOT, OUT)}`);
console.log(`   화면 구분(PC/Mobile)을 가진 컴포넌트 ${withMobile.length}종: ${withMobile.map((f) => f.id).join(' · ')}`);
