#!/usr/bin/env node
/**
 * 레거시 이름 결정표를 **플러그인 안에서 쓸 수 있는 형태로 굽는다**.
 *
 *   node scripts/build-legacy-map-data.js           # 굽는다 (몇 번을 돌려도 결과가 같다)
 *   node scripts/build-legacy-map-data.js --check   # 굽지 않고, 구운 것이 밀렸는지만 본다 (Gate 52)
 *
 * 왜 굽나:
 *   플러그인은 Figma 안에서 돌아 저장소 파일을 읽지 못한다. vars-data.ts 와 같은 방식으로
 *   **생성물 한 장**을 만들어 번들에 실어 보낸다.
 *
 * 무엇을 굽나 (정본은 여전히 reports/legacy-crosswalk-board/crosswalk.json):
 *   조회기와 **같은 판독부**(scripts/lib/legacy-name-map.js) 를 그대로 불러 레거시 126세트를 전수로 돌린다.
 *   세트 하나당: 레거시 이름·노드 id·출처 → 정본 세트 이름 · 변형 축 값 대응 · 판정 종류 · 근거 결정 번호.
 *
 * 하지 않는 일:
 *   새 이름을 만드는 것. 정본 이름 사전은 registry/components/component-facts.json 의 variantAxes 하나뿐이고,
 *   거기에 없는 이름은 판독부가 애초에 내보내지 않는다(하드룰 H6②).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, resolve, loadMap, loadDecisions } = require('./lib/legacy-name-map');

const OUT = 'plugins/figma-vars-installer/src/legacy-map-data.ts';
const CHECK = process.argv.includes('--check');

/** 판정 종류 — 검수 화면이 세 갈래로 갈라 보이는 기준. */
const KIND = {
  matched: 'decided',
  partial: 'decided',
  undecided: 'undecided',
  unknown: 'undecided',
  ambiguous: 'undecided',
  pattern: 'not-a-part',
  'legacy-only': 'not-a-part',
};

/** 레거시 변형 값 하나가 정본의 어느 축·값이 되는지 묻는다(판독부에 그대로 위임). */
function axisAnswer(entry, value) {
  const r = resolve({
    set: entry.set,
    source: entry.source,
    setId: entry.setId || null,
    variant: value,
  });
  const axes = r.axes || {};
  if (!Object.keys(axes).length) return null;
  // 어느 정본 세트를 기준으로 고른 값인지 함께 돌려준다 —
  // 한 레거시 세트가 값에 따라 여러 정본으로 갈리는 결정(예: 상단바 메뉴 ↔ 하위메뉴)이 있다.
  return { set: r.canon || null, then: axes };
}

/**
 * 속성표의 열쇠말을 «언제 걸리는 규칙인가» 로 읽는다. 읽을 수 있는 모양은 셋뿐이다:
 *   "pressed=on"                  → 그 축이 그 값일 때          (B 파일의 켬/끔 축)
 *   "checked=on,disabled=off"     → 두 축이 동시에 그 값일 때
 *   "hover"                        → 그 값을 가진 축이 있을 때   (A 파일의 상태 이름)
 *   "pressed"  (축 이름 자체)       → 그 축이 켜졌을 때(on)
 * **어느 쪽으로도 읽히지 않으면 규칙으로 싣지 않는다**(null). 조건을 모르는 것을
 * «언제나 걸린다» 로 읽으면 안 눌린 라디오가 «선택됨» 이 되는 식으로, 짐작이 사람 결정의
 * 옷을 입는다(🤖 독립 검증 2026-09-17 지적 45건). 근거 없는 자리는 비워 둔다(하드룰 H6②).
 */
function parseWhen(key, legacyProps) {
  const raw = String(key).trim();
  const eq = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  if (raw.indexOf('=') >= 0) {
    return raw.split(',').map((part) => {
      const [axis, value] = part.split('=');
      return { axis: (axis || '').trim() || null, value: (value || '').trim() };
    });
  }
  const props = legacyProps || {};
  const byValue = Object.entries(props)
    .filter(([, values]) => (Array.isArray(values) ? values : []).some((v) => eq(v, raw)))
    .map(([axis]) => axis);
  if (byValue.length === 1) return [{ axis: byValue[0], value: raw }];
  if (byValue.length > 1) return [{ axis: null, value: raw }];

  const axisHit = Object.keys(props).find((a) => eq(a, raw));
  if (axisHit) {
    const on = (Array.isArray(props[axisHit]) ? props[axisHit] : []).find((v) => eq(v, 'on'));
    if (on) return [{ axis: axisHit, value: on }];
  }
  return null;   // 조건을 모른다 — 규칙이 아니라 «메모» 로만 남긴다
}

function build() {
  const { entries } = loadMap();
  const decisions = loadDecisions();
  const decisionById = new Map(decisions.map((d) => [d.id, d]));

  const rows = entries.map((e) => {
    const r = resolve({ set: e.set, source: e.source, setId: e.setId || null });
    const kind = KIND[r.status] || 'undecided';

    // 변형 대응 규칙 — «어느 축이 어떤 값일 때, 정본의 어느 축을 무엇으로 고를지»
    // 조건을 읽을 수 없는 열쇠말은 규칙이 아니라 메모로만 남긴다(자동으로 걸리지 않는다).
    const rules = [];
    const notes = [];
    if (kind === 'decided') {
      const table = { ...(e.stateMap || {}), ...(e.sizeMap || {}), ...(e.variantMap || {}) };
      const seen = new Set();
      for (const key of Object.keys(table)) {
        const answer = axisAnswer(e, key);
        if (!answer) continue;
        const when = parseWhen(key, e.legacyProps);
        if (!when || !when.length) { notes.push({ from: key, then: answer.then, set: answer.set }); continue; }
        const sig = JSON.stringify([when, answer]);
        if (seen.has(sig)) continue;
        seen.add(sig);
        rules.push({ when, set: answer.set, then: answer.then, from: key });
      }
    }

    // 근거 — river 결정이면 사람 말 한 줄이 함께 간다(번호만 던지지 않는다).
    const basis = [];
    for (const b of r.basis || []) {
      const d = decisionById.get(b);
      if (d) basis.push({ id: d.id, what: d.what || '', quote: d.quote || '' });
      else basis.push({ id: '표', what: '레거시 속성표에 적힌 짝', quote: '' });
    }

    return {
      source: e.source,
      set: e.set,
      setId: e.setId || null,
      role: e.role || '',
      kind,
      status: r.status,
      canonSets: (r.candidates && r.candidates.length ? r.candidates : r.canonSets) || [],
      rules,
      notes,
      basis,
      why: r.why || '',
      note: r.decisionNote || '',
    };
  });

  const tally = rows.reduce((acc, r) => ((acc[r.kind] = (acc[r.kind] || 0) + 1), acc), {});
  return { rows, tally };
}

function render({ rows, tally }) {
  const head = `/**
 * 레거시 이름 결정표 — **생성물이다. 손으로 고치지 않는다.**
 *
 * 만드는 법: node scripts/build-legacy-map-data.js
 * 정본:      reports/legacy-crosswalk-board/crosswalk.json (river 결정) +
 *            registry/governance/legacy-component-map.json (레거시 속성표)
 * 검사:      Gate 52 — 결정이 바뀌었는데 다시 굽지 않으면 커밋이 막힌다.
 *
 * 여기 담긴 것: 레거시 세트 ${rows.length}건 전수 —
 *   정해짐 ${tally.decided || 0} · 아직 안 정함 ${tally.undecided || 0} · 교체 대상 아님 ${tally['not-a-part'] || 0}
 */

/** 검수 화면이 갈라 보이는 세 갈래. */
export type LegacyMatchKind = "decided" | "undecided" | "not-a-part";

/** 근거 한 줄 — 번호만 던지지 않고 무슨 결정인지 사람 말로 함께 간다. */
export type LegacyBasis = { id: string; what: string; quote: string };

/**
 * 변형 대응 규칙 하나.
 *   when  — 걸리는 조건(비어 있는 규칙은 싣지 않는다 — 조건을 모르면 notes 로 간다).
 *           axis 가 null 이면 «어느 축이든 그 값이면» 이라는 뜻이다.
 *   then  — 그때 고를 정본 축·값.
 *   from  — 속성표에 적혀 있던 원래 열쇠말(사람이 되짚을 때만 쓴다).
 */
export type LegacyRule = {
  when: { axis: string | null; value: string }[];
  set: string | null;      // 이 규칙이 가리키는 정본 세트(값에 따라 갈리는 결정이 있다)
  then: { [canonAxis: string]: string };
  from: string;
};

export type LegacyMapEntry = {
  source: string;          // A = SW UX GUIDE V2.4 · B = S-1 Component Set
  set: string;             // 레거시 세트 이름
  setId: string | null;    // 레거시 파일 안의 노드 id (이름이 겹칠 때 가르는 열쇠)
  role: string;            // 사람이 읽는 설명
  kind: LegacyMatchKind;
  status: string;          // 판독부 원래 판정 (matched·partial·undecided·pattern·legacy-only …)
  canonSets: string[];     // 정본 세트 이름 — 여럿이면 값에 따라 갈린다(사람이 그 안에서 고른다)
  rules: LegacyRule[];     // 변형 고르기 규칙 — 조건이 많이 맞는 규칙이 이긴다(조건 없는 규칙은 없다)
  notes: { from: string; then: { [canonAxis: string]: string }; set: string | null }[];  // 조건을 읽을 수 없어 «자동으로 걸리지 않는» 결정 메모
  basis: LegacyBasis[];
  why: string;
  note: string;
};

export const LEGACY_MAP_SOURCE = "reports/legacy-crosswalk-board/crosswalk.json";
export const LEGACY_MAP_TALLY = ${JSON.stringify(tally)};

export const LEGACY_MAP: LegacyMapEntry[] = `;

  const body = JSON.stringify(rows, null, 2);
  return `${head}${body};\n`;
}

(function main() {
  const built = build();
  const next = render(built);
  const target = path.join(ROOT, OUT);
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';

  if (CHECK) {
    if (next !== current) {
      console.log('❌ 구운 결정표가 밀렸습니다 — `node scripts/build-legacy-map-data.js` 를 돌리세요');
      process.exit(1);
    }
    const t = built.tally;
    console.log(`✅ 구운 결정표가 최신입니다 — 레거시 ${built.rows.length}세트 (정해짐 ${t.decided || 0} · 아직 안 정함 ${t.undecided || 0} · 교체 대상 아님 ${t['not-a-part'] || 0})`);
    return;
  }

  fs.writeFileSync(target, next);
  const t = built.tally;
  console.log(`✅ 결정표를 구웠습니다 — ${OUT} · 레거시 ${built.rows.length}세트 (정해짐 ${t.decided || 0} · 아직 안 정함 ${t.undecided || 0} · 교체 대상 아님 ${t['not-a-part'] || 0})`);
})();
