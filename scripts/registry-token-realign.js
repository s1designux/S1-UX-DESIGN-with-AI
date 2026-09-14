#!/usr/bin/env node
/**
 * registry/components/*.json 의 컴포넌트 토큰 이름을 배포본(ui-library/dist) 기준으로 맞춘다.
 *
 * 배경: 2026-06-09(763a70a) 에 토큰 정본이 Figma Variables 로 바뀌면서 구 컴포넌트 alias
 * (--button-primary-default-bg 등)는 component-tokens.css 로 "분리 보존" 됐고, 그 커밋의
 * 미결에 적힌 "컴포넌트 재매칭(Phase 2)" 이 registry 쪽에서 실행되지 않았다. 배포본은
 * 2026-08-25 에 semantic-direct 로 가면서 alias 를 쓰지 않는다(component-token-map.json
 * componentAliasTokens: []). 그래서 문서(DESIGN.core.md)만 옛 이름에 남아, AI 가 문서대로
 * 만들면 값이 안 나오거나 배포본과 다른 색이 나온다.
 *
 * 이 스크립트가 그 재매칭을 기계로 수행한다 — 손편집이 아니라 연동으로 둔다(하드룰 H6).
 *
 * 짝을 찾는 순서(위가 셀수록 근거가 세다):
 *   1. 이름이 이미 배포본 토큰       → 그대로 둔다
 *   2. figmaVariable(정본 경로)      → color/navigation/bg → --color-navigation-bg
 *   3. value / semanticRef 가 가리키는 배포본 토큰
 *   4. 배포본 CSS 장부(컴포넌트·변형·상태·속성 → 토큰)
 *   5. 이름 모양 되짚기(--x-y → --color-x-y, 조각 재배열)
 * 어느 것도 못 찾으면:
 *   - 배포본에 있는 컴포넌트면  → 배포본에 그 자리가 없다는 뜻이라 항목을 뺀다
 *   - 배포본에 없는 컴포넌트면  → 아직 안 만든 것이라 손대지 않고 보고만 한다
 *
 * 사용: node scripts/registry-token-realign.js [--write]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_DIR = path.join(ROOT, 'registry/components');
const DIST_CSS = path.join(ROOT, 'ui-library/dist/s1-ui.css');
const DIST_TOKENS = path.join(ROOT, 'ui-library/dist/assets/css/tokens.css');
const SKIP_FILES = new Set(['component-guide-model.json', 'component-facts.json', 'component-behavior.pc.json', 'index.json']);
const WRITE = process.argv.includes('--write');
/** 지난 결정을 남긴 기록 — 고치면 왜 그랬는지가 사라진다. */
const HISTORY_KEYS = new Set(['removedTokens', 'newSemanticTokens', 'pendingVariants', 'notes', 'doDont']);

// ── 배포본이 정의한 토큰 이름 ────────────────────────────────────────
function distTokenNames() {
  const css = fs.readFileSync(DIST_TOKENS, 'utf8');
  return new Set([...css.matchAll(/^\s*--([\w-]+)\s*:/gm)].map((m) => `--${m[1]}`));
}

// ── 배포본 CSS → "컴포넌트·변형·상태·속성 → 토큰" 장부 ───────────────
const CSS_PROP = {
  'background': 'bg', 'background-color': 'bg',
  'border-color': 'border', 'border-bottom-color': 'border', 'border-top-color': 'border',
  'border': 'border', 'border-bottom': 'border', 'border-top': 'border', 'outline-color': 'border',
  'color': 'text', 'fill': 'icon', 'stroke': 'icon', 'box-shadow': 'shadow'
};

function stateOfSelector(sel) {
  // :not(...) 안은 "그 상태가 아닐 때"라는 뜻이라 상태 판정에서 빼야 한다.
  // 예) [data-variant="line"]:hover:not(:disabled):not([aria-pressed="true"]) 는 hover 다.
  let s = sel.toLowerCase();
  let prev;
  do { prev = s; s = s.replace(/:not\([^()]*\)/g, ''); } while (s !== prev);
  if (/:disabled|\[disabled\]|aria-disabled="true"/.test(s)) return 'disabled';
  if (/aria-pressed="true"|aria-selected="true"|aria-current|aria-checked="true"|:checked/.test(s)) return 'selected';
  if (/:active/.test(s)) return 'pressed';
  if (/:hover/.test(s)) return 'hover';
  if (/:focus/.test(s)) return 'focus';
  if (/\[readonly\]|aria-readonly="true"/.test(s)) return 'readonly';
  if (/aria-invalid="true"|\[data-error\]/.test(s)) return 'error';
  return 'default';
}

function buildDistMap() {
  const css = fs.readFileSync(DIST_CSS, 'utf8');
  const map = {};
  const put = (c, v, st, p, tok) => {
    map[c] = map[c] || {}; map[c][v] = map[c][v] || {}; map[c][v][st] = map[c][v][st] || {};
    if (!map[c][v][st][p]) map[c][v][st][p] = tok;
  };
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    // border 단축 표기는 굵기·색 두 개를 쓴다(border: var(--border-width-1) solid var(--color-…)).
    // 색만 골라야 하므로 선언 안의 var() 중 --color-/--shadow- 로 시작하는 것을 집는다.
    const decls = [];
    for (const d of rule[2].matchAll(/([a-z-]+)\s*:([^;]*)/g)) {
      const vars = [...d[2].matchAll(/var\(\s*(--[\w-]+)/g)].map((v) => v[1]);
      const picked = vars.find((v) => v.startsWith('--color-') || v.startsWith('--shadow-'));
      if (picked) decls.push([d[0], d[1], picked]);
    }
    if (!decls.length) continue;
    for (const sel of rule[1].split(',').map((s) => s.trim()).filter(Boolean)) {
      const comp = sel.match(/\[data-s1-component="([^"]+)"\]/);
      if (!comp) continue;
      const variant = (sel.match(/\[data-variant="([^"]+)"\]/) || [])[1] || '';
      const part = (sel.match(/\[data-s1-part="([^"]+)"\]/) || [])[1] || '';
      const state = stateOfSelector(sel);
      for (const [, cssProp, token] of decls) {
        const p = CSS_PROP[cssProp];
        if (!p) continue;
        if (part) put(comp[1], variant, state, `${part}-${p}`, token);
        put(comp[1], variant, state, p, token);
      }
    }
  }
  return map;
}

// ── registry 쪽 어휘를 배포본 어휘로 옮긴다 ──────────────────────────
const PROP_ALIAS = {
  background: 'bg', 'background-color': 'bg', bg: 'bg',
  border: 'border', 'border-color': 'border',
  color: 'text', text: 'text', label: 'text',
  icon: 'icon', fill: 'icon', indicator: 'icon', dot: 'icon', check: 'icon',
  knob: 'bg', shadow: 'shadow'
};
const STATE_ALIAS = {
  checked: 'selected', on: 'selected', active: 'selected', current: 'selected', open: 'selected',
  filled: 'selected', unchecked: 'default', off: 'default', empty: 'default', all: 'default',
  base: 'default', common: 'default', focused: 'focus', 'read-only': 'readonly'
};

// button 처럼 문자열만 늘어놓은 항목은 상태·속성이 이름 안에만 있다. 이름에서 되읽는다.
const NAME_PROPS = ['close-icon', 'check-icon', 'placeholder', 'indicator', 'divider', 'shadow',
  'border', 'label', 'icon', 'text', 'knob', 'dot', 'bg'];
const NAME_STATES = ['unchecked', 'disabled', 'selected', 'readonly', 'pressed', 'current', 'checked',
  'focused', 'default', 'active', 'filled', 'hover', 'focus', 'error', 'empty', 'open', 'on', 'off'];

function parseNameParts(name, comp) {
  let rest = name.replace(/^--/, '');
  rest = rest === comp ? '' : rest.startsWith(`${comp}-`) ? rest.slice(comp.length + 1) : rest;
  const prop = NAME_PROPS.find((p) => rest === p || rest.endsWith(`-${p}`));
  if (!prop) return null;
  rest = rest.slice(0, rest.length - prop.length).replace(/-$/, '');
  const state = NAME_STATES.find((s) => rest === s || rest.endsWith(`-${s}`));
  if (!state) return { variant: rest, state: null, property: prop };
  return { variant: rest.slice(0, rest.length - state.length).replace(/-$/, ''), state, property: prop };
}

/**
 * 기계가 고르기 애매해서 배포본 CSS 를 직접 읽고 정한 몇 건.
 * 근거를 주석으로 남긴다 — 여기 있는 것은 전부 사람이 확인한 것이다.
 */
const OVERRIDES = {
  // 비활성 입력 글자색: [data-s1-part="control"]:disabled 의 color (아이콘색이 아니다)
  'input:--input-disabled-text': '--color-form-control-text-disabled',
  // 선택된 날짜 글자색: 오늘(today) 색이 아니라 선택 전용 색이 따로 있다
  'date-picker:--date-picker-cell-selected-text': '--color-date-picker-text-selected',
  'date-picker:--date-picker-cell-disabled-text': '--color-date-picker-text-disabled',
  // 달 이동 버튼 hover 면색 = 달력 칸 hover 면색 (s1-ui.css 주석, river 지시 2026-09-04)
  'date-picker:--date-picker-nav-hover-bg': '--color-date-picker-cell-bg-hover',
  // 트리거 안내문 색은 입력창과 같은 토큰을 쓴다
  'date-picker:--input-placeholder-text': '--color-form-control-text-placeholder',
  // 달력 안쪽 글자·아이콘 — 배포본이 date-picker 전용 토큰으로 다 갖고 있다
  'date-picker:--date-picker-cell-text': '--color-date-picker-text-secondary',
  'date-picker:--date-picker-cell-other-month-text': '--color-date-picker-text-other-month',
  'date-picker:--date-picker-cell-today-text': '--color-date-picker-text-today',
  'date-picker:--date-picker-header-text': '--color-date-picker-text-primary',
  'date-picker:--date-picker-weekday-text': '--color-date-picker-text-primary',
  'date-picker:--date-picker-icon-color': '--color-date-picker-icon-default',
  // 오류 안내문 색: 배포본은 error 가 아니라 caution 이라는 이름을 쓴다
  'input:--color-text-state-error': '--color-text-state-caution'
};

const fromFigmaVariable = (v) => (typeof v === 'string' && v.includes('/') ? `--${v.replace(/\//g, '-')}` : null);
const fromValue = (v) => {
  if (typeof v !== 'string') return null;
  const m = v.match(/var\(\s*(--[\w-]+)\s*\)/);
  return m ? m[1] : null;
};


/**
 * 원문(JSON 텍스트) 위에서 토큰 이름만 갈아끼우고, 짝 없는 항목만 덜어낸다.
 * 문자열 통째로("--x")가 아니면 건드리지 않으므로 설명문 속 "--x-*" 같은 표기는 그대로 남는다.
 */
function applyToText(text, plan) {
  let out = text;
  if (plan.renames.size) {
    const names = [...plan.renames.keys()].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`"(${names.map((n) => n.replace(/[-]/g, '\\-')).join('|')})"`, 'g');
    out = out.replace(pattern, (m, name) => `"${plan.renames.get(name) || name}"`);
  }
  // 같은 이름으로 모인 항목이 여럿일 수 있다 — 이름을 바꾼 개수만큼만 지운다.
  // (같은 이름이 지난 기록 쪽에도 있으면 그건 건드리면 안 된다.)
  const dropsByName = new Map();
  for (const d of plan.drops) {
    const cur = dropsByName.get(d.name) || { fields: new Set(), count: 0 };
    d.fields.forEach((f) => cur.fields.add(f));
    cur.count += 1;
    dropsByName.set(d.name, cur);
  }
  for (const [name, d] of dropsByName) out = dropFields(out, name, [...d.fields], d.count);
  for (const name of plan.removals) {
    // 같은 이름이 여러 목록에 들어 있을 수 있다 — 더 안 줄어들 때까지 지운다.
    let prev;
    do { prev = out; out = removeEntry(out, name); } while (out !== prev);
  }
  return out;
}

/** 어떤 이름이 들어 있는 객체 블록 안에서 특정 필드 줄만 지운다. */
function dropFields(text, name, fields, maxDrops) {
  let out = text;
  let searchFrom = 0;
  let done = 0;
  for (;;) {
    const at = out.indexOf(`"${name}"`, searchFrom);
    if (at === -1) return out;
    // 이 이름을 감싸는 객체의 범위를 찾는다
    let i = at;
    let depth = 0;
    while (i > 0) {
      const ch = out[i - 1];
      if (ch === '}' || ch === ']') depth++;
      else if (ch === '{' || ch === '[') { if (depth === 0) break; depth--; }
      i--;
    }
    const open = i - 1;
    if (out[open] !== '{') { searchFrom = at + 1; continue; }
    let d = 0;
    let close = open;
    for (; close < out.length; close++) {
      if (out[close] === '{') d++;
      else if (out[close] === '}') { d--; if (d === 0) break; }
    }
    let block = out.slice(open, close + 1);
    const VALUE = '("(?:\\\\.|[^"\\\\])*"|[^,}]*)';
    for (const field of fields) {
      // 파일마다 한 줄에 한 필드이기도 하고(줄바꿈형), 객체가 통째로 한 줄이기도 하다(인라인형).
      const perLine = new RegExp(`\\n[ \\t]*"${field}"\\s*:\\s*${VALUE},?`);
      const inline = new RegExp(`"${field}"\\s*:\\s*${VALUE}\\s*,?\\s*`);
      const next = block.replace(perLine, '');
      block = next !== block ? next : block.replace(inline, '');
    }
    // 필드를 지우면서 남은 쉼표를 정리한다
    block = block.replace(/,(\s*})/g, '$1').replace(/\{\s*,/g, '{');
    const changed = block !== out.slice(open, close + 1);
    out = out.slice(0, open) + block + out.slice(close + 1);
    searchFrom = open + block.length;
    if (changed && ++done >= maxDrops) return out;
  }
}

/**
 * "--이름" 이 값으로 들어 있는 배열 원소 하나를 통째로 지운다.
 * 원소는 문자열("--x") 일 수도 있고 그 이름을 담은 객체({ "cssVar": "--x", … }) 일 수도 있다.
 */
function removeEntry(text, name) {
  const from = text.indexOf(`"${name}"`);
  if (from === -1) return text;

  // 이 위치를 감싸는 가장 가까운 여는 괄호를 찾는다.
  let i = from;
  let depth = 0;
  while (i > 0) {
    const ch = text[i - 1];
    if (ch === '}' || ch === ']') depth++;
    else if (ch === '{' || ch === '[') { if (depth === 0) break; depth--; }
    i--;
  }
  const openIdx = i - 1;
  if (openIdx < 0) return text;

  let elemStart;
  let elemEnd;
  if (text[openIdx] === '{') {
    // 객체 원소 — 그 객체의 여는 괄호부터 짝이 맞는 닫는 괄호까지
    elemStart = openIdx;
    let d = 0;
    let j = openIdx;
    for (; j < text.length; j++) {
      if (text[j] === '{') d++;
      else if (text[j] === '}') { d--; if (d === 0) { j++; break; } }
    }
    elemEnd = j;
    // 그 객체가 배열 원소가 맞는지 확인한다
    let k = elemStart;
    while (k > 0 && /\s/.test(text[k - 1])) k--;
    if (text[k - 1] !== '[' && text[k - 1] !== ',') return text;
  } else if (text[openIdx] === '[') {
    elemStart = from;
    elemEnd = from + name.length + 2;
  } else {
    return text;
  }

  // 뒤따르는 쉼표(+그 줄의 여백)를 같이 지우고, 마지막 원소면 앞 쉼표를 지운다.
  let after = elemEnd;
  while (after < text.length && /[ \t]/.test(text[after])) after++;
  if (text[after] === ',') {
    let tail = after + 1;
    while (tail < text.length && /[ \t]/.test(text[tail])) tail++;
    if (text[tail] === '\n') tail++;
    let head = elemStart;
    while (head > 0 && /[ \t]/.test(text[head - 1])) head--;
    return text.slice(0, head) + text.slice(tail);
  }
  let head = elemStart;
  while (head > 0 && /\s/.test(text[head - 1])) head--;
  if (text[head - 1] === ',') head--;
  return text.slice(0, head) + text.slice(elemEnd);
}

function realign() {
  const dist = distTokenNames();
  const distMap = buildDistMap();

  // 이름 모양 되짚기용 색인: color-<접두> 로 시작하는 토큰을 조각 집합으로 들고 있는다.
  const nameIndex = [...dist]
    .filter((n) => n.startsWith('--color-') || n.startsWith('--shadow-'))
    .map((n) => ({ name: n, segs: new Set(n.replace(/^--(color|shadow)-/, '').split(/-+/).filter(Boolean)) }));
  const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

  const report = { renamed: [], kept: 0, removed: [], untouched: [], unresolvedKeys: [], collisions: [], failed: [] };
  const pending = [];

  for (const file of fs.readdirSync(REGISTRY_DIR).sort()) {
    if (!file.endsWith('.json') || SKIP_FILES.has(file)) continue;
    const fileComp = file.replace(/\.json$/, '');
    const comp = fileComp;
    const full = path.join(REGISTRY_DIR, file);
    const before = fs.readFileSync(full, 'utf8');
    const json = JSON.parse(before);
    const componentIsBuilt = Boolean(distMap[comp]);
    const plan = { renames: new Map(), removals: new Set(), drops: [] };

    /**
     * 한 토큰 항목의 배포본 짝을 찾는다. 못 찾으면 null.
     * 배포본 CSS(실제로 칠하는 것)를 registry 의 value·semanticRef 보다 먼저 믿는다 —
     * 그 값 필드는 손편집 사본이라 신뢰 대상이 아니다(CLAUDE.md 정본·파생 원칙).
     */
    const resolveTarget = (name, entry, variant, asComp) => {
      const comp = asComp || fileComp;
      if (dist.has(name)) return name;
      const override = OVERRIDES[`${comp}:${name}`];
      if (override) return override;

      // 다른 컴포넌트의 토큰을 빌려 쓴 이름(예: date-picker 안의 --input-*)은 그쪽 기준으로 푼다.
      if (!asComp) {
        const owner = Object.keys(distMap).find((c) => c !== comp && name.startsWith(`--${c}-`));
        if (owner) {
          const hit = resolveTarget(name, entry, '', owner);
          if (hit) return hit;
        }
      }

      // ① 배포본이 이 자리에 실제로 쓰는 토큰 — 변형 칸을 정확히 지목해서만 본다.
      const parsed = parseNameParts(name, comp);
      const rawState = (entry && entry.state) || (parsed && parsed.state);
      const rawProp = (entry && entry.property) || (parsed && parsed.property);
      const state = rawState ? (STATE_ALIAS[rawState] || rawState) : null;
      const prop = rawProp ? (PROP_ALIAS[rawProp] || rawProp) : null;
      const part = (entry && entry.part) || (parsed && parsed.variant) || null;
      const table = distMap[comp] || {};
      const lookup = (lane, key) => {
        const slot = table[lane] && table[lane][state];
        return slot ? slot[key] : null;
      };
      // 상태·속성을 모르면 배포본 장부를 넘겨짚지 않는다 — 엉뚱한 자리를 집는다.
      if (state && prop) {
        // 부품·변형을 정확히 지목한 자리가 먼저다.
        for (const lane of [variant, part, '']) {
          if (lane === undefined || lane === null) continue;
          const hit = (part && lookup(lane, `${part}-${prop}`)) || (lane ? lookup(lane, prop) : null);
          if (hit) return hit;
        }
      }

      // ②' 이름 모양이 배포본 토큰과 그대로 맞아떨어지면 그게 가장 확실하다.
      const plain = `--color-${name.slice(2)}`;
      if (dist.has(plain)) return plain;
      const bare = name.slice(2);
      const segs = new Set((bare.startsWith(`${comp}-`) ? bare : `${comp}-${bare}`).split(/-+/).filter(Boolean));
      const loose = nameIndex.find((n) => sameSet(n.segs, segs));
      if (loose) return loose.name;

      // ②'' 부품을 못 짚었으면 컴포넌트 공통 자리에서 찾는다.
      if (state && prop) {
        const hit = lookup('', prop);
        if (hit) return hit;
      }

      // ② Figma 변수 경로(정본)
      const viaFigma = fromFigmaVariable(entry && entry.figmaVariable);
      if (viaFigma && dist.has(viaFigma)) return viaFigma;

      // ④ 마지막으로 registry 자신이 적어둔 값 필드
      const viaValue = fromValue(entry && entry.value);
      if (viaValue && dist.has(viaValue)) return viaValue;
      const viaRef = entry && typeof entry.semanticRef === 'string' ? `--${entry.semanticRef}` : null;
      if (viaRef && dist.has(viaRef)) return viaRef;
      return null;
    };

    /** 객체/문자열 어느 모양이든 이름을 바꾸거나 빼도록 배열·객체를 손본다. */
    const handleList = (list, variant, owner, key) => {
      const next = [];
      for (const item of list) {
        const isString = typeof item === 'string';
        const name = isString ? item : (item && (item.cssVar || item.name));
        // 토큰 이름만 손댄다 — notes·doDont 에는 "--select-* 를 만들지 않는다" 같은 문장도 들어 있다.
        if (typeof name !== 'string' || !/^--[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) { next.push(item); continue; }
        const target = resolveTarget(name, isString ? null : item, variant);
        if (!target) {
          if (componentIsBuilt) { report.removed.push({ comp, name }); plan.removals.add(name); continue; }
          report.untouched.push({ comp, name });
          next.push(item);
          continue;
        }
        if (target === name) { report.kept++; next.push(item); continue; }
        report.renamed.push({ comp, from: name, to: target });
        const seen = plan.renames.get(name);
        if (seen && seen !== target) {
          throw new Error(`${file}: ${name} 이 ${seen} 와 ${target} 두 곳을 가리킨다 — 자동으로 정할 수 없다`);
        }
        plan.renames.set(name, target);
        if (isString) { next.push(target); continue; }
        const copy = { ...item };
        if (copy.cssVar) copy.cssVar = target; else copy.name = target;
        // 이름 자체가 그 토큰이 되었으니, 낡은 역할 토큰을 가리키던 사본 필드는 지운다.
        const dropped = [];
        for (const field of ['value', 'semanticRef']) {
          if (copy[field] === undefined) continue;
          delete copy[field];
          dropped.push(field);
        }
        if (dropped.length) plan.drops.push({ name: target, fields: dropped });
        next.push(copy);
      }
      owner[key] = next;
    };

    /** semanticTokens·componentTokens 처럼 "키가 토큰 이름" 인 맵도 같은 규칙으로 고친다. */
    const handleMap = (map, variant) => {
      const out = {};
      for (const key of Object.keys(map)) {
        if (!/^--[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) { out[key] = map[key]; continue; }
        const target = resolveTarget(key, { value: map[key] }, variant);
        if (!target) { report.unresolvedKeys.push({ comp, name: key }); out[key] = map[key]; continue; }
        if (target === key) { report.kept++; out[key] = map[key]; continue; }
        report.renamed.push({ comp, from: key, to: target });
        const seen = plan.renames.get(key);
        if (seen && seen !== target) throw new Error(`${file}: ${key} 이 두 곳을 가리킨다`);
        plan.renames.set(key, target);
        out[target] = map[key];
      }
      return out;
    };

    const walk = (node, variant) => {
      if (Array.isArray(node)) return;
      if (!node || typeof node !== 'object') return;
      for (const key of Object.keys(node)) {
        // 지난 기록(무엇을 지웠나·무엇을 새로 내자고 했나)은 손대지 않는다.
        if (HISTORY_KEYS.has(key)) continue;
        const child = node[key];
        if (Array.isArray(child)) {
          if (child.some((i) => typeof i === 'string' ? i.startsWith('--') : i && typeof i === 'object' && (i.cssVar || i.name))) {
            handleList(child, variant, node, key);
          }
          child.forEach((i) => walk(i, variant));
          continue;
        }
        const nextVariant = node === json.variants && child && typeof child === 'object' ? key : variant;
        if (child && typeof child === 'object' && !Array.isArray(child)
            && Object.keys(child).some((k) => /^--[a-z0-9]+(-[a-z0-9]+)*$/.test(k))) {
          node[key] = handleMap(child, variant);
          continue;
        }
        walk(child, nextVariant);
      }
    };
    walk(json, null);

    // 파일을 다시 직렬화하면 손으로 잡아둔 줄바꿈이 전부 풀려 차이가 읽히지 않는다.
    // 그래서 원문 위에서 이름만 바꾸고 항목만 덜어낸 뒤, 결과가 의도한 JSON 과 같은지 확인한다.
    // 서로 다른 옛 이름 둘이 같은 배포본 토큰을 가리키면, 원문에서 어느 쪽 필드를 지울지
    // 기계가 정할 수 없다(중복 항목을 사람이 합쳐야 한다). 그 파일은 손대지 않는다.
    const byTarget = new Map();
    for (const [from, to] of plan.renames) {
      if (!byTarget.has(to)) byTarget.set(to, []);
      byTarget.get(to).push(from);
    }
    const collisions = [...byTarget.entries()].filter(([, froms]) => froms.length > 1);
    // 여러 옛 이름이 같은 배포본 토큰으로 모이는 것 자체는 정상이다(비활성 색은 변형 공용).
    // 다만 편집이 어긋날 수 있어 기록만 남기고, 실제 안전 여부는 아래 대조가 판정한다.
    if (collisions.length) report.collisions.push({ file, pairs: collisions.map(([to, froms]) => `${froms.join(' · ')} → ${to}`) });
    if (plan.renames.size || plan.removals.size || plan.drops.length) {
      const edited = applyToText(before, plan);
      let parsed = null;
      try { parsed = JSON.parse(edited); } catch (e) { parsed = e; }
      if (parsed instanceof Error) report.failed.push({ file, why: `올바른 JSON 이 아니다 — ${parsed.message}` });
      else if (JSON.stringify(parsed) !== JSON.stringify(json)) report.failed.push({ file, why: '편집 결과가 의도한 내용과 다르다' });
      else pending.push({ full, edited });
    }
  }

  // 파일 단위로 안전한 것만 쓴다 — 한 파일이 어긋나도 나머지는 정리된다.
  if (WRITE) for (const f of pending) fs.writeFileSync(f.full, f.edited);
  return report;
}

const r = realign();
const line = (label, n) => console.log(`  ${String(n).padStart(4)}  ${label}`);
console.log(`🔎 registry 토큰 이름 재매칭 ${WRITE ? '(적용)' : '(검사만 — 적용하려면 --write)'}`);
line('배포본 이름으로 바꿈', r.renamed.length);
line('이미 배포본 이름이라 그대로', r.kept);
line('배포본에 자리가 없어 뺌', r.removed.length);
line('배포본 미구현 컴포넌트라 손대지 않음', r.untouched.length);
line('짝을 못 찾아 그대로 둔 이름', r.unresolvedKeys.length);
line('이름이 겹쳐 손대지 않은 파일', r.collisions.length);

if (r.removed.length) {
  console.log('\n뺀 항목:');
  for (const x of r.removed) console.log(`  ${x.comp.padEnd(20)} ${x.name}`);
}
if (r.untouched.length) {
  const comps = [...new Set(r.untouched.map((x) => x.comp))];
  console.log(`\n손대지 않음 (배포본 미구현 컴포넌트): ${comps.join(', ')}`);
}
if (r.collisions.length) {
  console.log('\n옛 이름 둘이 같은 토큰을 가리켜 손대지 않은 파일 (중복을 사람이 합쳐야 함):');
  for (const c of r.collisions) for (const pair of c.pairs) console.log(`  ${c.file.padEnd(18)} ${pair}`);
}
if (r.unresolvedKeys.length) {
  console.log('\n짝을 못 찾아 그대로 둔 이름 (사람이 정할 것):');
  for (const x of r.unresolvedKeys) console.log(`  ${x.comp.padEnd(18)} ${x.name}`);
}
if (r.failed.length) {
  console.error('\n⚠️ 아래 파일은 원문 편집이 안전하지 않아 손대지 않았다 (사람이 볼 것):');
  for (const f of r.failed) console.error(`  ${f.file} — ${f.why}`);
}
if (!WRITE) {
  const verbose = process.argv.includes('--verbose');
  const list = verbose ? r.renamed : r.renamed.slice(0, 30);
  console.log(`\n바꿀 이름${verbose ? '' : ' 미리보기(--verbose 로 전체)'}:`);
  for (const x of list) console.log(`  ${x.comp.padEnd(18)} ${x.from}  →  ${x.to}`);
}
