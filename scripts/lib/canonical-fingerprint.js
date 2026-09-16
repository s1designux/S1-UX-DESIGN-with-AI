#!/usr/bin/env node
/**
 * canonical-fingerprint.js — 「이 부품이 달라졌나」를 부품별로 잰다.
 * ---------------------------------------------------------------------------
 * 종전에는 부품 27종이 모두 `build-components.ts` 전체를 통째로 해시했다. 그래서
 * 부품 놓는 자리 계산 한 곳만 고쳐도(2026-09-15) Gate 50 이 27종 전부 번호를 올리라며
 * 커밋을 막았고, 그날은 `--refresh` 로 넘겼다. 사람이 `--only` 로 매번 짚어 주는 구조를
 * 기계로 바꾼 것이 이 모듈이다.
 *
 * 무엇을 세는가 (river 승인 2026-09-16 — "다 묶는 걸로 하고, 글자 변화도 잡고, 빌려쓰는 것도 같이 올려"):
 *   ① 그 부품 몫의 정본 세트 이름 (registry/governance/component-fingerprint-map.json)
 *   ② 그 세트들의 실측 (registry/components/component-facts.json — Gate 9e 가 손편집에서 지킨다)
 *   ③ 그 세트를 **만드는 코드 구간**과 그 코드가 부르는 것들 전부 (주석·빈 줄은 뺀 상태)
 *      → 라벨·안내문구 같은 **글자 변화**와 실측이 못 담는 속살 변화가 여기서 잡힌다.
 *        주석만 고치면 아무 부품도 반응하지 않는다.
 *   ④ 그 세트가 쓰는 토큰의 **값** (facts 의 tokenBindings + 코드 구간에 나온 토큰 이름)
 *   ⑤ 텍스트 스타일 정본 전체 (textstyles-data.ts — 작고 드물게 바뀌어 통째로 세도 오탐이 없다)
 *   ⑥ 그 부품 자신의 registry json (canonicalSources 중 공용 정본이 아닌 것)
 *   ⑦ **빌려쓰는 부품의 지문** (manifest dependencies.coreComponents — 모달이 쓰는 버튼이 바뀌면 모달도 오른다)
 *
 * 왜 여기 한 곳인가: 같은 계산을 `scripts/ui-library-version.js`(검사·번호)와
 * `ui-library/scripts/build.mjs`(빌드 차단)가 함께 쓴다. 두 벌로 두면 갈라진다.
 *
 * 멈추는 조건(조용히 약해지지 않게):
 *   · 대응표에 없는 부품 · 대응표의 세트가 실측에 없음 · 세트를 만드는 함수를 못 찾음
 *   · 대응표(부품 몫 + 배포 안 함)와 실측 세트 목록이 어긋남 · 세트가 두 부품에 중복 배정
 */
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const CANON_SOURCE = 'plugins/figma-vars-installer/src/build-components.ts';
const FACTS = 'registry/components/component-facts.json';
const MAP = 'registry/governance/component-fingerprint-map.json';
const TEXT_STYLES = 'plugins/figma-vars-installer/src/textstyles-data.ts';
/** 모든 부품이 공유하는 정본 — 통째로 세면 한 부품만 고쳐도 전부 반응한다. 조각내서 센다. */
const SHARED_CANON = new Set([CANON_SOURCE, 'plugins/figma-vars-installer/src/vars-data.ts', TEXT_STYLES, FACTS]);

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');

/* ── 주석·빈 줄 지우기 ────────────────────────────────────────────────
   문자열 안의 "//"(예: https://…)를 주석으로 오인하면 코드가 잘려 나가므로
   따옴표·템플릿·정규식 리터럴을 지나가며 훑는다. */
function stripComments(source) {
  let out = '';
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (c === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }
    if (c === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      out += c;
      i += 1;
      while (i < source.length) {
        if (source[i] === '\\') { out += source.slice(i, i + 2); i += 2; continue; }
        out += source[i];
        if (source[i] === quote) { i += 1; break; }
        i += 1;
      }
      continue;
    }
    out += c;
    i += 1;
  }
  return out
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line) => line.trim() !== '')
    .join('\n');
}

/** 최상위 선언(함수·상수)을 이름 → 소스 조각으로 가른다. 들여쓰기 0 줄이 경계다. */
function topLevelDeclarations(source) {
  const lines = source.split('\n');
  const starts = [];
  const pattern = /^(?:export\s+)?(?:declare\s+)?(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/;
  lines.forEach((line, index) => {
    const match = pattern.exec(line);
    if (match) starts.push({ name: match[1], line: index });
  });
  const declarations = new Map();
  starts.forEach(({ name, line }, index) => {
    const end = index + 1 < starts.length ? starts[index + 1].line : lines.length;
    const body = lines.slice(line, end).join('\n');
    // 같은 이름이 두 번 선언되는 일은 없지만, 있으면 이어 붙여 둘 다 센다.
    declarations.set(name, declarations.has(name) ? `${declarations.get(name)}\n${body}` : body);
  });
  return declarations;
}

/** 어떤 선언이 어떤 정본 세트를 만드는가 — `xxxSet.name = "Y"` 와 `BUILT_SETS["Y"]` 로 읽는다. */
function setOwners(declarations) {
  const owners = new Map();
  for (const [name, body] of declarations) {
    const found = new Set();
    for (const m of body.matchAll(/\b[\w$]*[Ss]et\.name\s*=\s*"([^"]+)"/g)) found.add(m[1]);
    for (const m of body.matchAll(/BUILT_SETS\["([^"]+)"\]\s*=/g)) found.add(m[1]);
    for (const setName of found) {
      if (!owners.has(setName)) owners.set(setName, new Set());
      owners.get(setName).add(name);
    }
  }
  return owners;
}

/** 그 함수가 부르는 최상위 선언까지 따라 올라간다 — 도우미 함수가 바뀌어도 잡히게. */
function closure(declarations, seeds) {
  const seen = new Set();
  const queue = [...seeds];
  while (queue.length) {
    const name = queue.shift();
    if (seen.has(name) || !declarations.has(name)) continue;
    seen.add(name);
    for (const m of declarations.get(name).matchAll(/\b([A-Za-z_$][\w$]*)\b/g)) {
      if (!seen.has(m[1]) && declarations.has(m[1])) queue.push(m[1]);
    }
  }
  return [...seen].sort();
}

const stable = (value) => JSON.stringify(value, (key, v) => {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]]));
  }
  return v;
});

let cache = null;
function context() {
  if (cache) return cache;
  const rawSource = read(CANON_SOURCE);
  const source = stripComments(rawSource);
  const declarations = topLevelDeclarations(source);
  const owners = setOwners(declarations);
  const facts = JSON.parse(read(FACTS));
  const map = JSON.parse(read(MAP));
  const textStyles = stripComments(read(TEXT_STYLES));

  // ── 대응표와 실측이 어긋나면 멈춘다 ──────────────────────────────
  const declared = new Map();
  for (const [id, entry] of Object.entries(map.components)) {
    for (const setName of entry.canonSets) {
      if (declared.has(setName)) throw new Error(`대응표 오류: 정본 세트 "${setName}" 이 ${declared.get(setName)} 와 ${id} 두 부품에 배정돼 있습니다`);
      declared.set(setName, id);
    }
  }
  for (const setName of map.unownedSets.sets) {
    if (declared.has(setName)) throw new Error(`대응표 오류: "${setName}" 이 배포 안 함 목록과 ${declared.get(setName)} 양쪽에 있습니다`);
    declared.set(setName, null);
  }
  const actual = new Set(Object.keys(facts.components));
  const missing = [...actual].filter((name) => !declared.has(name));
  const extra = [...declared.keys()].filter((name) => !actual.has(name));
  if (missing.length) throw new Error(`대응표에 없는 정본 세트 ${missing.length}개: ${missing.join(', ')} — registry/governance/component-fingerprint-map.json 에 어느 부품 몫인지 선언하세요`);
  if (extra.length) throw new Error(`실측에 없는 정본 세트가 대응표에 있습니다: ${extra.join(', ')}`);

  // ── 토큰 값 조회표 ────────────────────────────────────────────────
  const { loadVarsData } = require('./load-vars-data');
  const V = loadVarsData();
  const tokenValues = new Map();
  for (const [key, value] of Object.entries(V.FOUNDATION_COLOR || {})) tokenValues.set(key, value);
  for (const [key, value] of Object.entries(V.FOUNDATION_NUMBER || {})) tokenValues.set(key, value);
  for (const [key, value] of Object.entries(V.SEMANTIC_COLOR || {})) tokenValues.set(key, value);
  for (const [key, value] of Object.entries(V.SEMANTIC_NUMBER || {})) tokenValues.set(key, value);
  for (const [key, value] of Object.entries(V.SEMANTIC_SHADOW || {})) tokenValues.set(key, value);

  cache = { declarations, owners, facts, map, textStyles, tokenValues };
  return cache;
}

/**
 * 부품 하나의 정본 지문.
 * @param {object} manifest ui-library/src/components/<id>/manifest.json
 * @param {Set<string>} [seen] 빌려쓰기가 돌고 도는 경우를 막는 방문표(내부용)
 */
function canonicalFingerprint(manifest, seen = new Set()) {
  const { declarations, owners, facts, map, textStyles, tokenValues } = context();
  const id = manifest.id;
  const entry = map.components[id];
  if (!entry) throw new Error(`대응표에 "${id}" 부품이 없습니다 — registry/governance/component-fingerprint-map.json 에 어느 정본 세트 몫인지 선언하세요`);

  const digest = createHash('sha256');
  digest.update('component-fingerprint/v2\0');
  digest.update(`${id}\0`);

  // ① 부품 몫의 정본 세트 이름 + ② 그 세트의 실측
  const sets = [...entry.canonSets].sort();
  const seeds = [];
  const tokens = new Set();
  for (const setName of sets) {
    const fact = facts.components[setName];
    if (!fact) throw new Error(`실측에 정본 세트 "${setName}" 이 없습니다 (${id}) — npm run gen:component-facts 를 먼저 돌리세요`);
    digest.update(`set:${setName}\0`);
    digest.update(`${stable(fact)}\0`);
    for (const token of fact.tokenBindings || []) tokens.add(token);
    const owner = owners.get(setName);
    if (!owner || !owner.size) throw new Error(`"${setName}" 세트를 만드는 정본 코드를 찾지 못했습니다 (${id}) — 세트 이름을 바꿨다면 대응표를 함께 고치세요`);
    seeds.push(...owner);
  }

  // ③ 그 세트를 만드는 코드 구간 + 그 코드가 부르는 것 전부 (주석·빈 줄 없음)
  const used = closure(declarations, seeds);
  for (const name of used) {
    digest.update(`code:${name}\0`);
    digest.update(`${declarations.get(name)}\0`);
    // ④-보강: 코드 구간에 직접 적힌 토큰 이름도 값 대상으로 넣는다(실측 누락 대비).
    for (const m of declarations.get(name).matchAll(/"([a-z][\w-]*(?:\/[\w.+-]+)+)"/g)) {
      if (tokenValues.has(m[1])) tokens.add(m[1]);
    }
  }

  // ④ 그 세트가 쓰는 토큰의 값
  for (const token of [...tokens].sort()) {
    digest.update(`token:${token}=${stable(tokenValues.get(token) ?? null)}\0`);
  }

  // ⑤ 텍스트 스타일 정본
  digest.update(`textstyles:${textStyles}\0`);

  // ⑥ 그 부품 자신의 registry json 등 (공용 정본 제외)
  for (const relative of manifest.canonicalSources) {
    if (SHARED_CANON.has(relative)) continue;
    digest.update(`${relative}\0`);
    digest.update(read(relative));
    digest.update('\0');
  }

  // ⑦ 빌려쓰는 부품의 지문 — 버튼이 바뀌면 그 버튼을 쓰는 모달도 오른다
  const borrowed = [...new Set(manifest.dependencies?.coreComponents || [])].sort();
  const next = new Set(seen).add(id);
  for (const other of borrowed) {
    if (next.has(other)) continue; // 서로 물고 도는 경우 — 한 바퀴만
    const otherManifest = JSON.parse(read(`ui-library/src/components/${other}/manifest.json`));
    digest.update(`borrow:${other}=${canonicalFingerprint(otherManifest, next)}\0`);
  }

  return digest.digest('hex');
}

module.exports = { canonicalFingerprint };

// 단독 실행 — 부품별 지문을 찍어 본다.
if (require.main === module) {
  const { map } = context();
  for (const id of Object.keys(map.components)) {
    const manifest = JSON.parse(read(`ui-library/src/components/${id}/manifest.json`));
    console.log(`${id.padEnd(22)} ${canonicalFingerprint(manifest).slice(0, 16)}`);
  }
}
