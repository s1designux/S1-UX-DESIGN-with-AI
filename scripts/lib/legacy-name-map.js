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


const FPMAP = 'registry/governance/component-fingerprint-map.json';

/** registry 파일 id(button) → 정본 세트 이름(Button). 파일 id 는 정본 이름이 아니다. */
function loadIdToSets() {
  const m = readJson(FPMAP).components || {};
  const out = new Map();
  for (const [id, body] of Object.entries(m)) out.set(id, Array.isArray(body.canonSets) ? body.canonSets : []);
  return out;
}

/**
 * 축 값 하나를 정본 표기로 바꾼다. 대소문자·표기가 달라도 정본에 있으면 정본 글자 그대로 돌려주고,
 * 정본에 없으면 null — **없는 값을 그대로 내보내지 않는다**(하드룰 H6②).
 */
function canonAxisValue(axes, setName, axisName, value) {
  const ax = axes.get(setName);
  if (!ax) return null;
  const tryAxes = axisName && Array.isArray(ax[axisName]) ? [[axisName, ax[axisName]]] : Object.entries(ax);
  for (const [name, vals] of tryAxes) {
    if (!Array.isArray(vals)) continue;
    const found = vals.find((v) => norm(v) === norm(value));
    if (found) return { axis: name, value: found };
  }
  return null;
}

/** 여러 세트 후보 중, 물어본 축 값을 실제로 가진 세트를 고른다. */
function pickSet(axes, candidates, asked) {
  const wanted = Object.values(asked).filter(Boolean);
  if (!wanted.length) return candidates[0] || null;
  for (const c of candidates) {
    if (wanted.every((v) => canonAxisValue(axes, c, null, v))) return c;
  }
  for (const c of candidates) {
    if (wanted.some((v) => canonAxisValue(axes, c, null, v))) return c;
  }
  return candidates[0] || null;
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
 *
 * status:
 *   matched     — 세트(그리고 물어본 축)까지 정본 이름으로 붙었다
 *   partial     — 세트는 붙었으나 **물어본 축 값은 결정된 바 없다**(= 자동으로 정하지 않는다)
 *   ambiguous   — 같은 레거시 이름이 A·B 양쪽에 있고 붙는 곳이 다르다 → source 를 밝혀야 한다
 *   pattern · legacy-only · no-canon · undecided · unknown
 *
 * 규칙: 정본 실측표(component-facts.json)에 **없는 이름·축 값은 절대 내보내지 않는다.**
 */
function resolve(query) {
  const { set, source = null, state = null, size = null, variant = null } = query;
  const axes = loadFacts();
  const idToSets = loadIdToSets();
  const decisions = loadDecisions();
  const { entries } = loadMap();
  const wanted = norm(set);
  const asked = { State: state, Size: size, Variant: variant };
  const askedAny = Object.values(asked).some(Boolean);

  const hits = entries.filter((e) => norm(e.set) === wanted && (!source || e.source === source));
  const hit = hits[0] || null;

  const decision = decisions.find((d) => {
    const m = d.machine;
    if (!m) return false;
    const refs = (m.legacySets || []).map(parseRef);
    if (refs.some((r) => norm(r.set) === wanted && (!source || !r.source || r.source === source))) return true;
    return (m.legacyOnly || []).some((l) => norm(parseRef(l.set).set) === wanted);
  }) || (hit && hit.decision ? decisions.find((d) => d.id === hit.decision) : null);

  const base = { legacySource: hit ? hit.source : (source || null), candidates: [], unmapped: [], decisionNote: '' };

  if (decision && decision.open) {
    return { status: 'undecided', canon: null, canonSets: [], axes: {}, basis: [decision.id], why: `아직 결정되지 않았습니다 — ${decision.what}`, ...base };
  }

  // 같은 이름이 A·B 양쪽에 있는데 붙는 곳이 다르면 조용히 첫 것을 고르지 않는다.
  if (!source && hits.length > 1) {
    const targets = new Set(hits.map((h) => h.canonComponent || '(대응 없음)'));
    if (targets.size > 1) {
      return {
        status: 'ambiguous', canon: null, canonSets: [], axes: {}, basis: [],
        why: `같은 이름이 ${hits.map((h) => h.source).join('·')} 양쪽에 있고 붙는 곳이 다릅니다 — "A:${set}" 처럼 어느 파일인지 밝혀 주세요`,
        ...base, candidates: hits.map((h) => `${h.source}:${h.set} → ${h.canonComponent || '대응 없음'}`),
      };
    }
  }

  const out = { ...base, basis: [], unmapped: [] };
  const mapAsked = (setName, pairs, bucketAxis) => {
    // pairs: {레거시 값: 정본 값} · bucketAxis: 기본 축 이름(없으면 전 축에서 찾는다)
    for (const [axisName, value] of Object.entries(asked)) {
      if (!value || out.axes[axisName]) continue;
      const found = Object.entries(pairs).find(([legacyValue]) => norm(legacyValue) === norm(value));
      if (!found) continue;
      const canonised = canonAxisValue(axes, setName, null, found[1]);
      if (canonised) out.axes[canonised.axis] = canonised.value;
      else out.unmapped.push({ asked: `${axisName}=${value}`, why: `표에 적힌 "${found[1]}" 가 정본 "${setName}" 의 축 값에 없습니다` });
    }
  };

  out.axes = {};

  if (decision && decision.machine) {
    const m = decision.machine;
    out.basis.push(decision.id);
    const legacyOnly = (m.legacyOnly || []).find((l) => norm(parseRef(l.set).set) === wanted);
    if (legacyOnly) return { ...out, status: 'legacy-only', canon: null, canonSets: [], axes: {}, why: legacyOnly.why };
    if (m.kind === 'pattern') return { ...out, status: 'pattern', canon: null, canonSets: m.patternOf || [], axes: {}, why: m.note || '부품이 아니라 배치 규칙입니다.' };

    const sets = m.canonSet ? [m.canonSet] : (m.canonSets || []);
    const chosen = pickSet(axes, sets, asked);
    out.decisionNote = m.note || '';
    const consumed = new Set();
    for (const [axisName, pairs] of Object.entries(m.axisMap || {})) {
      for (const [askedAxis, value] of Object.entries(asked)) {
        if (!value || consumed.has(askedAxis)) continue;
        const found = Object.entries(pairs).find(([legacyValue]) => norm(legacyValue) === norm(value));
        if (!found) continue;
        consumed.add(askedAxis);
        const canonised = canonAxisValue(axes, chosen, axisName, found[1]) || canonAxisValue(axes, chosen, null, found[1]);
        if (canonised) out.axes[canonised.axis] = canonised.value;
        else out.unmapped.push({ asked: `${askedAxis}=${value}`, why: `결정이 가리키는 "${found[1]}" 가 정본 "${chosen}" 에 없습니다` });
      }
    }
    // 한 레거시 값이 여러 축을 동시에 정하는 경우(platform=mobile → Size·Break)도 마저 채운다.
    for (const [axisName, pairs] of Object.entries(m.axisMap || {})) {
      for (const value of Object.values(asked)) {
        if (!value) continue;
        const found = Object.entries(pairs).find(([legacyValue]) => norm(legacyValue) === norm(value));
        if (!found) continue;
        const canonised = canonAxisValue(axes, chosen, axisName, found[1]) || canonAxisValue(axes, chosen, null, found[1]);
        if (canonised && !out.axes[canonised.axis]) out.axes[canonised.axis] = canonised.value;
      }
    }
    for (const [askedAxis, value] of Object.entries(asked)) {
      if (!value || consumed.has(askedAxis)) continue;
      out.unmapped.push({ asked: `${askedAxis}=${value}`, why: '이 값이 무엇에 해당하는지 결정된 바 없습니다' });
    }
    if (sets.length) {
      return { ...out, status: out.unmapped.length ? 'partial' : 'matched', canon: chosen, canonSets: sets, why: m.note || '' };
    }
  }

  if (hit) {
    if (hit.confidence === 'high') {
      const candidates = idToSets.get(hit.canonComponent) || [];
      if (!candidates.length) {
        return { ...out, status: 'unknown', canon: null, canonSets: [], why: `"${hit.canonComponent}" 가 정본 세트 이름으로 이어지지 않습니다 — 정본 대응표를 확인하세요` };
      }
      const chosen = pickSet(axes, candidates, asked);
      out.basis.push(`${MAP}#${hit.source}:${hit.set}`);
      out.decisionNote = (hit.notes || []).join(' · ');
      const table = { ...(hit.stateMap || {}), ...(hit.sizeMap || {}), ...(hit.variantMap || {}) };
      for (const [askedAxis, value] of Object.entries(asked)) {
        if (!value) continue;
        const found = Object.entries(table).find(([legacyValue]) => norm(legacyValue) === norm(value));
        if (!found) { out.unmapped.push({ asked: `${askedAxis}=${value}`, why: '이 값이 무엇에 해당하는지 결정된 바 없습니다' }); continue; }
        const canonised = canonAxisValue(axes, chosen, null, found[1]);
        if (canonised) out.axes[canonised.axis] = canonised.value;
        else out.unmapped.push({ asked: `${askedAxis}=${value}`, why: `표에 적힌 "${found[1]}" 가 정본 "${chosen}" 의 축 값에 없습니다` });
      }
      const status = out.unmapped.length ? 'partial' : 'matched';
      return { ...out, status, canon: chosen, canonSets: [chosen], candidates };
    }
    if (hit.confidence === 'decide') return { ...out, status: 'undecided', canon: null, canonSets: [], why: '결정 전이라 자동 대조에 쓰지 않습니다.' };
    if (hit.confidence === 'none') {
      out.basis.push(`${MAP}#${hit.source}:${hit.set}`);
      return { ...out, status: 'no-canon', canon: null, canonSets: [], why: (hit.notes || []).join(' · ') || '자동 대조에서 대응을 찾지 못했습니다 — 사람이 정한 바는 없습니다.' };
    }
    if (hit.confidence === 'legacy-only') return { ...out, status: 'legacy-only', canon: null, canonSets: [], why: hit.resolvedNote || '정본에 대응이 없다고 결정된 세트입니다.' };
    if (hit.confidence === 'pattern') return { ...out, status: 'pattern', canon: null, canonSets: hit.patternOf || [], why: hit.resolvedNote || '부품이 아니라 배치 규칙입니다.' };
  }

  return { ...out, status: 'unknown', canon: null, canonSets: [], why: askedAny ? '' : '' };
}

module.exports = { ROOT, CROSSWALK, MAP, FACTS, FPMAP, loadIdToSets, canonAxisValue, readJson, parseRef, norm, loadFacts, loadDecisions, loadMap, validateMachine, resolve };
