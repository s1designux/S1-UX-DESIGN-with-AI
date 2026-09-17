/**
 * 레거시 이름 ↔ 정본 이름 자동 대조의 공통 판(共通盤).
 *
 * 읽는 곳 (정본):
 *   ① reports/legacy-crosswalk-board/crosswalk.json  — river 결정 23건. 기계가 읽는 칸은 items[].machine 뿐이다.
 *   ② registry/governance/legacy-component-map.json  — 레거시 세트별 속성표(자동 추출 + 결정 반영분)
 *   ③ registry/components/component-facts.json       — 정본 실측 변형 축. **정본 이름의 유일한 사전**이다.
 *
 * 규칙:
 *   - 여기서 새 이름을 만들지 않는다. ③ 에 없는 정본 이름은 오류다(하드룰 H6②).
 *   - ② 의 confidence=decide 는 자동 대조에 쓰지 않는다(legacy-component-map.json _meta.rules).
 *   - 결정이 '패턴'·'레거시에만 있음'이면 정본 이름을 지어내지 않고 그대로 그 사실을 답한다.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
// 적대 시험(--selftest)은 임시 폴더의 사본을 가리킨다 — 실제 파일은 건드리지 않는다.
const CROSSWALK = process.env.S1_LEGACY_CROSSWALK || 'reports/legacy-crosswalk-board/crosswalk.json';
const MAP = process.env.S1_LEGACY_MAP || 'registry/governance/legacy-component-map.json';
const FACTS = 'registry/components/component-facts.json';

const readJson = (rel) => JSON.parse(fs.readFileSync(path.isAbsolute(rel) ? rel : path.join(ROOT, rel), 'utf8'));

/** "A:timepicker_input(540:3690)" → { source:'A', set:'timepicker_input', id:'540:3690' } */
function parseRef(ref) {
  const m = /^(?:([AB])\s*:\s*)?([^()]+?)\s*(?:\(([^()]*)\))?$/.exec(String(ref).trim());
  if (!m) return { source: null, set: String(ref).trim(), id: null };
  return { source: m[1] || null, set: m[2].trim(), id: m[3] || null };
}

const norm = (s) => String(s == null ? '' : s).trim().toLowerCase();

function loadFacts() {
  const facts = readJson(FACTS).components || {};
  const axes = new Map(); // canonSet → { axisName → [values] }
  for (const [name, body] of Object.entries(facts)) {
    const ax = body && typeof body === 'object' ? body.variantAxes : null;
    axes.set(name, ax && typeof ax === 'object' ? ax : {});
  }
  return axes;
}

/** 정본 이름 사전 대조 — 없는 이름을 쓰면 오류 문장을 돌려준다. */
function validateMachine(id, machine, axes) {
  const errors = [];
  const sets = []
    .concat(machine.canonSet ? [machine.canonSet] : [])
    .concat(Array.isArray(machine.canonSets) ? machine.canonSets : [])
    .concat(Array.isArray(machine.patternOf) ? machine.patternOf : []);
  for (const s of sets) {
    if (!axes.has(s)) errors.push(`${id}: 정본에 없는 세트 이름 "${s}" — 정본 실측표에 있는 이름만 쓸 수 있습니다`);
  }
  const target = machine.canonSet || (Array.isArray(machine.canonSets) ? machine.canonSets[0] : null);
  if (machine.axisMap && target && axes.has(target)) {
    const ax = axes.get(target);
    for (const [axisName, pairs] of Object.entries(machine.axisMap)) {
      const values = ax[axisName];
      if (!Array.isArray(values)) {
        // 여러 세트로 갈라지는 결정은 축이 어느 세트 것인지 정해지지 않을 수 있다 — 다른 세트에 있으면 통과.
        const elsewhere = (Array.isArray(machine.canonSets) ? machine.canonSets : []).some(
          (s) => Array.isArray((axes.get(s) || {})[axisName]),
        );
        if (!elsewhere) errors.push(`${id}: "${target}" 에 없는 변형 축 "${axisName}"`);
        continue;
      }
      const allowed = new Set(values.map(norm));
      for (const [legacyValue, canonValue] of Object.entries(pairs)) {
        if (!allowed.has(norm(canonValue))) {
          errors.push(`${id}: "${target}" 의 ${axisName} 에 없는 값 "${canonValue}" (레거시 ${legacyValue})`);
        }
      }
    }
  }
  for (const c of machine.canonOnly || []) {
    if (!target || !axes.has(target)) continue;
    const ax = axes.get(target);
    const found = Object.values(ax).some((vals) => Array.isArray(vals) && vals.map(norm).includes(norm(c)));
    if (!found) errors.push(`${id}: "${target}" 어느 축에도 없는 값 "${c}" (정본에만 있는 것으로 적혀 있음)`);
  }
  return errors;
}

/** 결정 → 기계 표. 열린 결정(open)은 자동 대조에 쓰지 않는다. */
function loadDecisions() {
  const cw = readJson(CROSSWALK);
  const out = [];
  for (const it of cw.items || []) {
    out.push({
      id: it.id,
      kind: it.kind,
      open: it.kind === 'open',
      what: it['무엇'] || '',
      machine: it.machine || null,
      quote: it.quote || '',
      date: it.date2 || it.date || null,
    });
  }
  return out;
}

function loadMap() {
  const lm = readJson(MAP);
  const entries = [];
  for (const [canonId, list] of Object.entries(lm.components || {})) {
    for (const e of list) entries.push({ ...e, canonComponent: canonId, bucket: 'components' });
  }
  for (const e of lm.unmatched || []) entries.push({ ...e, canonComponent: null, bucket: 'unmatched' });
  return { raw: lm, entries };
}

/**
 * 레거시 이름 한 건을 정본 이름으로 붙인다.
 * @returns {{status:string, canon:?string, canonSets:string[], axes:Object, basis:string[], why:string}}
 *   status: 'matched' | 'pattern' | 'legacy-only' | 'undecided' | 'unknown'
 */
function resolve(query) {
  const { set, source = null, state = null, size = null, variant = null } = query;
  const axes = loadFacts();
  const decisions = loadDecisions();
  const { entries } = loadMap();
  const wanted = norm(set);

  const hit = entries.find((e) => norm(e.set) === wanted && (!source || e.source === source));
  const decision = decisions.find((d) => {
    const m = d.machine;
    if (!m) return false;
    const refs = (m.legacySets || []).map(parseRef);
    if (refs.some((r) => norm(r.set) === wanted && (!source || !r.source || r.source === source))) return true;
    return (m.legacyOnly || []).some((l) => norm(parseRef(l.set).set) === wanted);
  }) || (hit && hit.decision ? decisions.find((d) => d.id === hit.decision) : null);

  const basis = [];
  const outAxes = {};
  let status = 'unknown';
  let canon = hit ? hit.canonComponent : null;
  let canonSets = [];
  let why = '';

  if (decision && decision.open) {
    return { status: 'undecided', canon: null, canonSets: [], axes: {}, basis: [decision.id], why: `아직 결정되지 않았습니다 — ${decision.what}` };
  }

  if (decision && decision.machine) {
    const m = decision.machine;
    basis.push(decision.id);
    const legacyOnly = (m.legacyOnly || []).find((l) => norm(parseRef(l.set).set) === wanted);
    if (legacyOnly) {
      return { status: 'legacy-only', canon: null, canonSets: [], axes: {}, basis, why: legacyOnly.why };
    }
    if (m.kind === 'pattern') {
      return { status: 'pattern', canon: null, canonSets: m.patternOf || [], axes: {}, basis, why: m.note || '부품이 아니라 배치 규칙입니다.' };
    }
    canonSets = m.canonSet ? [m.canonSet] : (m.canonSets || []);
    canon = canonSets[0] || canon;
    why = m.note || '';
    const ask = { State: state, Size: size, Variant: variant };
    for (const [axisName, pairs] of Object.entries(m.axisMap || {})) {
      const asked = ask[axisName] !== undefined ? ask[axisName] : null;
      const lookup = asked != null ? asked : null;
      if (lookup == null) continue;
      const found = Object.entries(pairs).find(([legacyValue]) => norm(legacyValue) === norm(lookup));
      if (found) outAxes[axisName] = found[1];
    }
    // 축 이름이 다른 레거시 값(예: platform=mobile 이 Size 와 Break 를 동시에 정함)도 훑는다.
    for (const askedValue of [state, size, variant].filter(Boolean)) {
      for (const [axisName, pairs] of Object.entries(m.axisMap || {})) {
        if (outAxes[axisName]) continue;
        const found = Object.entries(pairs).find(([legacyValue]) => norm(legacyValue) === norm(askedValue));
        if (found) outAxes[axisName] = found[1];
      }
    }
    status = canonSets.length ? 'matched' : 'unknown';
  }

  if (status !== 'matched' && hit) {
    // 결정이 없어도 자동 추출표가 confidence=high 면 쓴다(규약).
    if (hit.confidence === 'high' && hit.canonComponent) {
      basis.push(`${MAP}#${hit.source}:${hit.set}`);
      canon = hit.canonComponent;
      canonSets = [hit.canonComponent];
      if (state && hit.stateMap && hit.stateMap[state]) outAxes.State = hit.stateMap[state];
      if (size && hit.sizeMap && hit.sizeMap[size]) outAxes.Size = hit.sizeMap[size];
      if (variant && hit.variantMap && hit.variantMap[variant]) outAxes.Variant = hit.variantMap[variant];
      status = 'matched';
      why = (hit.notes || []).join(' · ');
    } else if (hit.confidence === 'decide') {
      status = 'undecided';
      why = '결정 전이라 자동 대조에 쓰지 않습니다.';
    } else if (hit.confidence === 'none') {
      status = 'no-canon';
      basis.push(`${MAP}#${hit.source}:${hit.set}`);
      why = (hit.notes || []).join(' · ') || '정본에 대응 컴포넌트가 없습니다.';
    } else if (hit.confidence === 'legacy-only') {
      status = 'legacy-only';
      why = hit.resolvedNote || '정본에 대응이 없다고 결정된 세트입니다.';
    } else if (hit.confidence === 'pattern') {
      status = 'pattern';
      canonSets = hit.patternOf || [];
      why = hit.resolvedNote || '부품이 아니라 배치 규칙입니다.';
    }
  }

  return { status, canon, canonSets, axes: outAxes, basis, why };
}

module.exports = { ROOT, CROSSWALK, MAP, FACTS, readJson, parseRef, norm, loadFacts, loadDecisions, loadMap, validateMachine, resolve };
