#!/usr/bin/env node
/**
 * river 결정(crosswalk.json items[].machine)을 레거시 속성표(legacy-component-map.json)에 반영한다.
 *
 *   npm run legacy:apply          # 반영해서 파일에 쓴다 (몇 번을 돌려도 결과가 같다)
 *   npm run legacy:apply -- --check  # 쓰지 않고, 반영이 밀렸는지·정본에 없는 이름을 쓰는지 검사만 (Gate 52)
 *
 * 하는 일:
 *   ① 결정이 닫힌 세트의 confidence 를 decide → high 로 올린다(자동 대조에 쓸 수 있게).
 *   ② 결정의 axisMap 을 stateMap/sizeMap/variantMap 에 채운다.
 *   ③ 정본에 대응이 없다고 결정된 세트는 confidence=legacy-only 로 못박는다(=자동 대조 제외).
 *   ④ 배치 규칙(패턴)으로 결정된 세트는 confidence=pattern 으로 못박는다.
 * 하지 않는 일: 새 정본 이름을 만드는 것. 정본 실측표에 없는 이름이 나오면 오류로 멈춘다.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, MAP, readJson, parseRef, norm, loadFacts, loadDecisions, validateMachine, loadIdToSets, loadMap, canonAxisValue } = require('./lib/legacy-name-map');
const BASELINE = 'registry/governance/legacy-name-baseline.json';

const CHECK = process.argv.includes('--check');
const REBASE = process.argv.includes('--rebase-baseline');

/**
 * 자동추출 경로(결정 없이 confidence=high 로 쓰이는 줄)도 정본 이름에 닿는지 본다.
 * 2026-09-17 독립 검증에서 여기가 통째로 검사 밖이었다(파일 id 를 정본 이름으로 답하던 것 27건).
 * 기존 부채는 baseline 에 동결하고 **새로 생기는 것만** 막는다(래칫).
 */
function autoExtractProblems() {
  const axes = loadFacts();
  const idToSets = loadIdToSets();
  const { entries } = loadMap();
  const out = [];
  for (const e of entries) {
    if (e.confidence !== 'high') continue;
    const cands = idToSets.get(e.canonComponent) || [];
    if (!cands.length && e.canonComponent) {
      out.push({ key: `${e.source}:${e.set}::세트`, msg: `${e.source}:${e.set} — "${e.canonComponent}" 가 정본 세트 이름으로 이어지지 않습니다` });
      continue;
    }
    for (const [bucket, table] of [['stateMap', e.stateMap], ['sizeMap', e.sizeMap], ['variantMap', e.variantMap]]) {
      for (const [legacyValue, canonValue] of Object.entries(table || {})) {
        if (cands.some((c) => canonAxisValue(axes, c, null, canonValue))) continue;
        out.push({ key: `${e.source}:${e.set}::${bucket}::${legacyValue}`, msg: `${e.source}:${e.set} ${bucket} "${legacyValue}" → "${canonValue}" 가 정본 축 값에 없습니다` });
      }
    }
  }
  return out;
}
const AXIS_BUCKET = { State: 'stateMap', Size: 'sizeMap' };

function applyAll() {
  const axes = loadFacts();
  const all = loadDecisions();
  const decisions = all.filter((d) => d.machine && !d.open);
  const lm = readJson(MAP);
  const errors = [];

  // 닫힌 결정에 기계 칸이 없으면 그 결정은 자동 대조에서 **조용히 빠진다**(2026-09-17 실제로 한 번 났다 —
  // 결정 파일이 되돌려져 기계 칸 23개가 통째로 사라졌는데 검사기는 통과했다).
  for (const d of all) {
    if (!d.open && !d.machine) {
      errors.push(`${d.id}(${d.what}) — 결정은 닫혔는데 기계가 읽는 칸(machine)이 없습니다. 자동 대조에서 빠집니다`);
    }
  }

  for (const d of decisions) errors.push(...validateMachine(d.id, d.machine, axes));

  const allEntries = [];
  for (const [canonId, list] of Object.entries(lm.components || {})) for (const e of list) allEntries.push({ e, canonId });
  for (const e of lm.unmatched || []) allEntries.push({ e, canonId: null });

  let touched = 0;
  for (const d of decisions) {
    const m = d.machine;
    const refs = (m.legacySets || []).map(parseRef);
    const onlyRefs = (m.legacyOnly || []).map((l) => ({ ...parseRef(l.set), why: l.why }));

    for (const { e } of allEntries) {
      const isOnly = onlyRefs.find((r) => norm(r.set) === norm(e.set) && (!r.source || r.source === e.source));
      const isRef = refs.find((r) => norm(r.set) === norm(e.set) && (!r.source || r.source === e.source));
      if (!isOnly && !isRef && e.decision !== d.id) continue;

      const before = JSON.stringify(e);
      e.decision = e.decision || d.id;
      e.resolvedBy = d.id;

      if (isOnly) {
        e.confidence = 'legacy-only';
        e.canonSet = null;
        e.resolvedNote = isOnly.why;
      } else if (m.kind === 'pattern') {
        e.confidence = 'pattern';
        e.canonSet = null;
        e.patternOf = m.patternOf || [];
        e.resolvedNote = m.note || '부품이 아니라 배치 규칙';
      } else {
        const sets = m.canonSet ? [m.canonSet] : (m.canonSets || []);
        if (sets.length) e.canonSet = sets.length === 1 ? sets[0] : sets;
        if (m.kind === 'composite') e.composedOf = m.canonSets || [];
        e.confidence = 'high';
        if (m.note) e.resolvedNote = m.note;
        for (const [axisName, pairs] of Object.entries(m.axisMap || {})) {
          const bucket = AXIS_BUCKET[axisName] || 'variantMap';
          e[bucket] = e[bucket] && typeof e[bucket] === 'object' ? e[bucket] : {};
          for (const [legacyValue, canonValue] of Object.entries(pairs)) e[bucket][legacyValue] = canonValue;
        }
      }
      if (JSON.stringify(e) !== before) touched += 1;
    }
  }

  // 닫힌 결정이 걸린 세트에 confidence=decide 가 남아 있으면 자동 대조에서 빠지므로 오류로 본다.
  const closed = new Set(decisions.map((d) => d.id));
  for (const { e } of allEntries) {
    if (e.decision && closed.has(e.decision) && e.confidence === 'decide') {
      errors.push(`${e.source}:${e.set} — 결정(${e.decision})이 닫혔는데 아직 '결정 전'으로 남아 있습니다`);
    }
  }

  lm._meta = lm._meta || {};
  lm._meta.updatedAt = lm._meta.updatedAt || null;
  lm._meta.autoMatch = {
    '무엇': '이 표의 stateMap·sizeMap·variantMap·canonSet 은 river 결정에서 기계로 옮겨 온 것이다.',
    '되돌리는 법': 'npm run legacy:apply (결정 원본 = reports/legacy-crosswalk-board/crosswalk.json items[].machine)',
    '손편집': '하지 않는다 — 결정 쪽을 고치고 다시 돌린다.',
  };
  return { lm, errors, touched };
}

(function main() {
  const { lm, errors } = applyAll();
  const problems = autoExtractProblems();

  if (REBASE) {
    const doc = readJson(BASELINE);
    doc._meta.count = problems.length;
    doc._meta.updatedAt = new Date().toISOString().slice(0, 10);
    doc.items = problems.map((p) => ({ key: p.key, why: p.msg }));
    fs.writeFileSync(path.join(ROOT, BASELINE), JSON.stringify(doc, null, 2) + '\n');
    console.log(`✅ 동결 목록 갱신 — ${problems.length}건`);
    return;
  }

  const frozen = new Set((readJson(BASELINE).items || []).map((i) => i.key));
  const fresh = problems.filter((p) => !frozen.has(p.key));
  for (const p of fresh) errors.push(`${p.msg} (새로 생긴 것 — 동결 목록에 없음)`);
  const target = path.isAbsolute(MAP) ? MAP : path.join(ROOT, MAP);
  const next = JSON.stringify(lm, null, 2) + '\n';
  const current = fs.readFileSync(target, 'utf8');

  if (CHECK) {
    const stale = next !== current;
    if (stale) errors.push('결정이 표에 아직 반영되지 않았습니다 — `npm run legacy:apply` 를 돌리세요');
    if (errors.length) {
      console.log('❌ 레거시 이름 자동 붙이기 검사 실패');
      for (const e of errors) console.log(`  ❌ ${e}`);
      process.exit(1);
    }
    console.log(`✅ 레거시 이름 자동 붙이기 — 결정과 표가 같고, 새로 생긴 이름 어긋남 0건 (옛 부채 ${frozen.size}건은 동결돼 있고 조회기가 답으로 쓰지 않습니다)`);
    return;
  }

  if (errors.length) {
    console.log('❌ 반영을 멈췄습니다 — 정본에 없는 이름이 있습니다');
    for (const e of errors) console.log(`  ❌ ${e}`);
    process.exit(1);
  }
  fs.writeFileSync(target, next);
  console.log(`✅ 결정을 표에 반영했습니다 — ${MAP}`);
})();
