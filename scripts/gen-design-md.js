#!/usr/bin/env node
/**
 * 🔧 DESIGN.md 생성기 — 디자인시스템 "소비용" 단일 컨텍스트 파일
 *
 * 목적: AI 에이전트가 "한 번에 읽는" 디자인시스템 스냅샷을 만든다.
 *   입력 = `assets/css/tokens.css`(정본 vars-data.ts 의 1차 파생)
 *   + `registry/components/component-facts.json`(build-components.ts 실제 실행 파생)
 *   + `registry/components/component-behavior.pc.json`(PC UI 라이브러리 JavaScript 행동 계약)
 *   + `registry/components/*.json` 의 메타(설명·anatomy·doDont·a11y·Figma mapping).
 *   정본 목록은 `registry/governance/canon-manifest.json`(Gate 36) — registry 는 값의 정본이 아니다.
 *   ⚠️ DESIGN.md 는 소비용 "산출물"이지 정본이 아니다 — 손으로 고치지 말 것(드리프트 게이트가 막음).
 *
 * 서비스 분기: registry 컴포넌트의 `_meta.scope` 태그가 유일한 스위치.
 *   태그 없으면 core. scope="vms" → 영상 서비스 파일로 분기(현재 분기 시작점, 컴포넌트 0개면 빈 스텁).
 *   mobility/building 은 아직 만들지 않음(design.manifest.json 에 자리만 남겨둠).
 *
 * 사용:
 *   node scripts/gen-design-md.js            # dry-run — 파일 안 씀, 바뀔 게 있으면 "변경감지" 출력
 *   node scripts/gen-design-md.js --write    # 실제 생성
 *
 * 폐쇄망(air-gapped): Node 내장 모듈(fs/path/crypto)만 사용. 외부 의존성 없음.
 *
 * @reads: assets/css/tokens.css
 *   ↑ pipeline-status 힌트 — tokens.css 를 path.join 으로 읽어 자동추적이 못 잡으므로,
 *     이 생성기의 "입력 소스"임을 명시(안 하면 목적지=쓰기로 오분류됨).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const WRITE = process.argv.includes('--write');

// 출력 대상 — pipeline-status 가 "목적지"로 인식하도록 리터럴 경로 상수로 유지한다.
const CORE_REL = 'design/DESIGN.core.md';
const VMS_REL = 'design/services/DESIGN.vms.md';
const TOKENS_REL = 'assets/css/tokens.css';
const COMPONENT_TOKENS_REL = 'assets/css/component-tokens.css';

// 현재 활성 서비스 분기: 영상=vms 만. (mobility/building 은 매니페스트에 자리만, 아직 파일 생성 안 함)
const ACTIVE_SERVICES = ['vms'];
const SERVICE_OUT = { vms: VMS_REL }; // 서비스→출력경로 (리터럴 유지)

// 소비자(AI)용 프로파일 — design.manifest.json 의 profiles 를 단일 정본으로 읽어 파생한다.
// (과거엔 상수로 중복 보관했으나 수동 동기화 드리프트를 없애려 manifest 참조로 단일화. 2026-07-21)
const MANIFEST_REL = 'design/design.manifest.json';
const NARRATIVE_REL = 'registry/governance/design-narrative.json';
const COMPONENT_FACTS_REL = 'registry/components/component-facts.json';
const COMPONENT_BEHAVIOR_PC_REL = 'registry/components/component-behavior.pc.json';
const NON_SPEC_FILES = new Set(['index.json', 'component-facts.json', 'component-behavior.pc.json', 'component-guide-model.json']);
const FIGMA_MAP_REL = 'registry/figma/figma-map.json';

function loadProfiles() {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(ROOT, MANIFEST_REL), 'utf8'));
    if (m && m.profiles && typeof m.profiles === 'object') return m.profiles;
  } catch (_) { /* manifest 없거나 깨짐 → 빈 프로파일 */ }
  return { role: [], platform: [], theme: [] };
}

// 전역 서술 정본(§1·2·3·5·6·7·8·9). 없으면 {} — 섹션 빌더가 알아서 건너뜀.
function loadNarrative() {
  try {
    const n = JSON.parse(fs.readFileSync(path.join(ROOT, NARRATIVE_REL), 'utf8'));
    if (n && typeof n === 'object') return n;
  } catch (_) { /* 없으면 서술 없는 문서로 생성(하위호환) */ }
  return {};
}

function readJsonOr(rel, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
  catch (_) { return fallback; }
}

function loadComponentFacts() { return readJsonOr(COMPONENT_FACTS_REL, { components: {}, iconLibrary: {} }); }
function loadComponentBehaviorPc() { return readJsonOr(COMPONENT_BEHAVIOR_PC_REL, { components: {} }); }
function loadFigmaMap() { return readJsonOr(FIGMA_MAP_REL, { components: {} }); }

// ── tokens.css 파싱 ─────────────────────────────────────────────────
// `--이름: 값;` 을 뽑는다. (스펙의 `--(\w+)` 은 하이픈 미포함이라 실제 토큰명(--color-brand-blue 등)을
//  못 잡음 → [\w-]+ 로 조정. 값은 `;` 앞까지라 줄 끝 주석은 자동 제외됨.)
function parseTokens() {
  const css = [TOKENS_REL, COMPONENT_TOKENS_REL]
    .map((rel) => fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), 'utf8') : '')
    .join('\n');
  const all = {};
  for (const m of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const name = m[1];
    const value = m[2].trim();
    if (!(name in all)) all[name] = value; // 첫 정의(Light) 우선 — Dark 재정의는 무시
  }
  const pick = (test) => {
    const o = {};
    for (const k of Object.keys(all)) if (test(k)) o[k] = all[k];
    return o;
  };
  return {
    all,
    // colors: 브랜드 + Gray 숫자 스케일(다크 gray-dark-* 는 제외)
    colors: pick((k) => /^color-brand-/.test(k) || /^color-gray-\d/.test(k)),
    spacing: pick((k) => /^spacing-\d/.test(k)),   // Foundation 숫자 스페이싱만(semantic spacing 제외)
    radius: pick((k) => /^radius-/.test(k)),
    fontSize: pick((k) => /^font-size-/.test(k)),
    fontWeight: pick((k) => /^font-weight-/.test(k)),
    breakpoint: pick((k) => /^breakpoint-/.test(k)), // §8 반응형용
  };
}

// ── registry 컴포넌트 로드 + scope 그룹핑 ────────────────────────────
function loadComponents() {
  const dir = path.join(ROOT, 'registry/components');
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json') || NON_SPEC_FILES.has(f)) continue; // 색인·공용 facts·guide 집계 제외
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { continue; } // 깨진 JSON 은 건너뜀(Gate 1 이 별도로 잡음)
    const meta = j._meta || {};
    out.push({
      id: meta.id || f.replace(/\.json$/, ''),
      name: meta.name || meta.id || f,
      scope: meta.scope || 'core', // scope 태그 없으면 core (분기 스위치)
      json: j,
    });
  }
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

// ── 컴포넌트 → variants × state 표 ───────────────────────────────────
const DEFAULT_STATES = ['default', 'hover', 'pressed', 'disabled'];

// variant 이름 목록: variants.list 우선, 없으면 variants 하위 객체 키(메타 키 제외), 그래도 없으면 default
function variantNames(v) {
  if (v && Array.isArray(v.list)) return v.list;
  if (v && typeof v === 'object') {
    const skip = new Set(['list', 'state', 'pcSize', 'mobileSize']);
    const keys = Object.keys(v).filter((k) => !skip.has(k) && v[k] && typeof v[k] === 'object');
    if (keys.length) return keys;
  }
  return ['default'];
}
// state 목록: variants.state 우선, 없으면 컴포넌트 레벨 states(문자열 배열), 그래도 없으면 기본 4상태
function stateNames(comp) {
  const v = comp.json.variants;
  if (v && Array.isArray(v.state)) return v.state;
  const s = comp.json.states;
  if (Array.isArray(s) && s.every((x) => typeof x === 'string')) return s;
  return DEFAULT_STATES;
}
// ── 토큰 엔트리 정규화 (registry 의 이질적 shape 를 {name, state, semantic} 으로 통일) ──
// registry/components/*.json 은 컴포넌트마다 토큰 형태가 다르다:
//   문자열 배열(button) / 객체 배열 {cssVar|name, state, property, semanticRef|value}(checkbox·chip·gnb…)
//   / 그룹 객체(date-picker·modal) / semanticTokens 객체(input) / tokenRef 참조(select→dropdown)
// 아래 함수들이 이 전부를 판독한다(정본=tokens.css+registry, registry 는 무수정).
const ALL_STATE_ALIASES = new Set(['all', 'base', 'common', 'shared', 'any']);

function semanticFromValue(v) {
  if (typeof v !== 'string') return null;
  const m = v.match(/var\(\s*(--[\w-]+)\s*\)/); // "var(--color-x)" → color-x
  return m ? m[1].replace(/^--/, '') : null;
}

function normalizeEntry(e) {
  if (typeof e === 'string') return { name: e, state: null, semantic: null };
  if (e && typeof e === 'object') {
    const name = (typeof e.cssVar === 'string' && e.cssVar) || (typeof e.name === 'string' && e.name) || null;
    if (!name) return null;
    const state = typeof e.state === 'string' ? e.state : null;
    const semantic = (typeof e.semanticRef === 'string' && e.semanticRef) || semanticFromValue(e.value) || null;
    return { name, state, semantic };
  }
  return null;
}

// 배열/그룹객체/semanticTokens 형태의 tokens 필드를 엔트리 목록으로 평탄화
function entriesFromField(t) {
  const out = [];
  const push = (e) => { const n = normalizeEntry(e); if (n) out.push(n); };
  const walk = (v) => {
    if (Array.isArray(v)) { v.forEach((x) => { push(x); if (x && typeof x === 'object') walk(x); }); return; }
    if (!v || typeof v !== 'object') return;
    push(v);
    for (const [k, val] of Object.entries(v)) {
      if (k.startsWith('--') && typeof val === 'string') push({ name: k, value: val });
      else if (val && typeof val === 'object') walk(val);
    }
  };
  walk(t);
  return out;
}

// 컴포넌트의 토큰을 { byVariant: {v:[entries]} | null, all: [entries] | null } 로 수집
function collectEntries(comp, depth = 0) {
  const j = comp.json || {};
  // 7. tokenRef → 참조 컴포넌트로 위임(1단계)
  if (typeof j.tokenRef === 'string' && depth < 2) {
    try {
      const refJson = JSON.parse(fs.readFileSync(path.join(ROOT, j.tokenRef), 'utf8'));
      return collectEntries({ json: refJson }, depth + 1);
    } catch (_) { /* 참조 실패 시 자체 필드로 폴백 */ }
  }
  const v = j.variants;
  // 1·2. variants.<v>.tokens (per-variant)
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const byVariant = {};
    let has = false;
    for (const [vk, vv] of Object.entries(v)) {
      if (vv && typeof vv === 'object' && Array.isArray(vv.tokens)) {
        const es = vv.tokens.map(normalizeEntry).filter(Boolean);
        if (es.length) { byVariant[vk] = es; has = true; }
      }
    }
    if (has) return { byVariant, all: null };
  }
  // 3·4·5. 컴포넌트 레벨 tokens
  if (j.tokens) {
    const all = entriesFromField(j.tokens);
    if (all.length) return { byVariant: null, all };
  }
  // 6. variants.default.semanticTokens
  if (v && v.default && v.default.semanticTokens) {
    const all = entriesFromField(v.default.semanticTokens);
    if (all.length) return { byVariant: null, all };
  }
  return { byVariant: null, all: [] };
}

// 엔트리가 특정 state 열에 속하는가 (명시 state 우선, 없으면 이름 세그먼트 추론)
function entryInState(e, st) {
  if (e.state) {
    const es = e.state.toLowerCase();
    if (ALL_STATE_ALIASES.has(es)) return true; // all/base/common → 전 상태 공통
    return es === st.toLowerCase();
  }
  const n = e.name.toLowerCase();
  const s = st.toLowerCase();
  return n.includes(`-${s}-`) || n.endsWith(`-${s}`);
}

// 셀 표기: 이름 + 의미(semantic) 병기. 의미 없으면 이름만.
function renderEntry(e) {
  return e.semantic ? `${e.name} → ${e.semantic}` : e.name;
}

function componentTable(comp) {
  const variants = variantNames(comp.json.variants);
  const states = stateNames(comp);
  const collected = collectEntries(comp);
  // 이름에 변형 세그먼트가 하나라도 나타나는지(다변형 귀속 판단용)
  const segOf = (vn) => `-${vn.toLowerCase()}`;
  const nameHasSeg = (name, vn) => {
    const n = name.toLowerCase(); const s = segOf(vn);
    return n.includes(`${s}-`) || n.endsWith(s);
  };
  const componentHasVariantSeg = collected.all
    ? collected.all.some((e) => variants.some((vn) => nameHasSeg(e.name, vn)))
    : false;

  const header = ['variant', ...states];
  const sep = header.map(() => '---');
  const rows = variants.map((variant) => {
    let entries;
    if (collected.byVariant) {
      entries = collected.byVariant[variant] || [];
    } else {
      entries = collected.all || [];
      // 다변형 + 이름에 변형 세그먼트가 있으면 변형행에 귀속(해당 변형 + 공용 토큰)
      if (variants.length > 1 && componentHasVariantSeg) {
        const matched = entries.filter((e) => nameHasSeg(e.name, variant));
        const shared = entries.filter((e) => !variants.some((vn) => nameHasSeg(e.name, vn)));
        entries = [...matched, ...shared];
      }
    }
    const cells = states.map((st) => {
      const hit = [...new Set(entries.filter((e) => entryInState(e, st)).map(renderEntry))];
      return hit.length ? hit.join('<br>') : '—';
    });
    return [variant, ...cells];
  });
  const line = (arr) => `| ${arr.join(' | ')} |`;
  return [line(header), line(sep), ...rows.map(line)].join('\n');
}

// ── 마크다운 조립 ────────────────────────────────────────────────────
function yamlMap(obj, indent) {
  const pad = ' '.repeat(indent);
  const keys = Object.keys(obj);
  if (!keys.length) return `${pad}{}`;
  return keys.map((k) => `${pad}${k}: "${obj[k]}"`).join('\n');
}

function profilesBlock(profiles) {
  const p0 = profiles || { role: [], platform: [], theme: [] };
  const l = [];
  l.push('## 소비 프로파일 (Profiles)', '');
  l.push('> 소비자(역할·플랫폼·테마)별 적용 프로파일. 해석 순서는 `design.manifest.json` 의 resolutionOrder 참조.', '');
  l.push('### role');
  for (const r of (p0.role || [])) l.push(`- **${r.id}** — 밀도: \`${r.density}\` (${r.desc})`);
  l.push('', '### platform');
  for (const p of (p0.platform || [])) l.push(`- **${p.id}** — 컨테이너: \`${p.container}\`, 컬럼: \`${p.columns}\``);
  l.push('', '### theme');
  l.push('- ' + (p0.theme || []).map((t) => `\`${t}\``).join(' / '));
  return l.join('\n');
}

// ── 서술(prose) 렌더 헬퍼 ────────────────────────────────────────────
// 모두 결정적(입력 배열 순서 그대로). 빈 값이면 '' 반환 → 상위에서 섹션 생략 판단.
function asArr(x) { return Array.isArray(x) ? x.filter(Boolean) : (x ? [x] : []); }
function paras(x) { return asArr(x).join('\n\n'); }
function bullets(x) { return asArr(x).map((s) => `- ${s}`).join('\n'); }
function hasAny(...xs) { return xs.some((x) => asArr(x).length); }

// 섹션 조립: 헤딩 + 블록들(빈 블록 제외). 내용이 하나도 없으면 '' 반환(섹션 자체 생략).
function section(heading, blocks) {
  const body = blocks.filter((b) => b && b.trim()).join('\n\n');
  if (!body.trim()) return '';
  return `## ${heading}\n\n${body}`;
}

// §1 Visual Theme & Atmosphere
function buildVisualTheme(vt) {
  if (!vt) return '';
  return section('1. Visual Theme & Atmosphere', [paras(vt.intro), bullets(vt.principles)]);
}

// §2 Color Palette & Roles (역할 서술 — 값은 frontmatter/tokens.css 단일 출처)
function buildColorRoles(cr) {
  if (!cr) return '';
  let table = '';
  if (asArr(cr.roles).length) {
    const rows = cr.roles.map((r) => `| \`${r.category}\` | ${r.role} |`).join('\n');
    table = `| 카테고리 | 역할 |\n| --- | --- |\n${rows}`;
  }
  return section('2. Color Palette & Roles', [paras(cr.intro), table, bullets(cr.notes)]);
}

// §3 Typography (값은 frontmatter typography 사전)
function buildTypography(ty) {
  if (!ty) return '';
  const hier = asArr(ty.hierarchy).length ? `**위계 (Hierarchy)**\n${bullets(ty.hierarchy)}` : '';
  const rules = asArr(ty.rules).length ? `**규칙**\n${bullets(ty.rules)}` : '';
  return section('3. Typography', [paras(ty.intro), hier, rules]);
}

// §5 Layout Principles
function buildLayout(lo) {
  if (!lo) return '';
  const grid = asArr(lo.grid).length ? `**그리드 (Grid)**\n${bullets(lo.grid)}` : '';
  const sp = asArr(lo.spacing).length ? `**간격 (Spacing)**\n${bullets(lo.spacing)}` : '';
  return section('5. Layout Principles', [paras(lo.intro), grid, sp]);
}

// §6 Depth & Elevation
function buildElevation(el) {
  if (!el) return '';
  const model = asArr(el.model).length ? bullets(el.model) : '';
  const note = asArr(el.note).length ? `> ${asArr(el.note).join(' ')}` : '';
  return section('6. Depth & Elevation', [paras(el.intro), model, note]);
}

// §7 Do's & Don'ts (전역 — 컴포넌트별 Do/Don't 는 §4 각 항목에)
function buildDoDont(dd) {
  const g = dd && dd.global;
  if (!g) return '';
  const doB = asArr(g.do).length ? `**Do**\n${bullets(g.do)}` : '';
  const dontB = asArr(g.dont).length ? `**Don't**\n${bullets(g.dont)}` : '';
  return section("7. Do's & Don'ts", [doB, dontB]);
}

// §8 Responsive Behavior (breakpoint 값은 tokens.css 파생)
function buildResponsive(rs, tokens) {
  const bp = (tokens && tokens.breakpoint) || {};
  const bpKeys = Object.keys(bp);
  let table = '';
  if (bpKeys.length) {
    const rows = bpKeys.map((k) => `| \`--${k}\` | ${bp[k]} |`).join('\n');
    table = `**Breakpoints**\n\n| 토큰 | 값 |\n| --- | --- |\n${rows}`;
  }
  if (!rs && !table) return '';
  const intro = rs ? paras(rs.intro) : '';
  const adapt = rs && asArr(rs.adaptation).length ? bullets(rs.adaptation) : '';
  return section('8. Responsive Behavior', [intro, table, adapt]);
}

// §9 Agent Prompt Guide
function buildAgentGuide(ag) {
  if (!ag) return '';
  const tips = asArr(ag.promptTips).length ? `**프롬프트 팁**\n${bullets(ag.promptTips)}` : '';
  const res = asArr(ag.resolution).length ? `**해석 순서 (Resolution)**\n${bullets(ag.resolution)}` : '';
  const priority = asArr(ag.implementationPriority).length
    ? `**UI 구현 우선순위**\n${ag.implementationPriority.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : '';
  const invent = asArr(ag.doNotInvent).length
    ? `**DO NOT invent**\n${bullets(ag.doNotInvent.map((s) => `\`${s}\``))}` : '';
  const gap = ag.gapFormat ? `**정의가 없을 때의 응답 형식**\n\n\`\`\`text\n${ag.gapFormat}\n\`\`\`` : '';
  return section('9. Agent Prompt Guide', [paras(ag.intro), priority, invent, gap, tips, res]);
}

// ── Agent-readable component contract ───────────────────────────────────
const FACT_NAME = {
  select: 'Select Box', 'date-picker': 'Date Picker', 'time-picker': 'Time Picker',
  textarea: 'Text Area', tab: 'Line Tab', 'mobile-bottom-nav': 'Mobile Bottom Nav',
};

function yamlScalar(v) {
  if (v === null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(String(v));
}

function yamlValue(value, indent = 0) {
  const pad = ' '.repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value.map((v) => {
      if (v && typeof v === 'object') return `${pad}-\n${yamlValue(v, indent + 2)}`;
      return `${pad}- ${yamlScalar(v)}`;
    }).join('\n');
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (!entries.length) return `${pad}{}`;
    return entries.map(([k, v]) => {
      const key = /^[A-Za-z_][\w-]*$/.test(k) ? k : JSON.stringify(k);
      if (v && typeof v === 'object') return `${pad}${key}:\n${yamlValue(v, indent + 2)}`;
      return `${pad}${key}: ${yamlScalar(v)}`;
    }).join('\n');
  }
  return `${pad}${yamlScalar(value)}`;
}

function stateMetadata(j) {
  if (Array.isArray(j.states)) return j.states;
  if (j.states && typeof j.states === 'object') return j.states;
  if (j.variants && Array.isArray(j.variants.state)) return j.variants.state;
  return 'unknown';
}

function behaviorContract(comp, behaviorDoc) {
  const factName = FACT_NAME[comp.id] || comp.name;
  const found = behaviorDoc && behaviorDoc.components && behaviorDoc.components[factName];
  if (!found) return { platform: 'PC', status: 'not-defined' };
  const out = { platform: 'PC' };
  for (const [key, value] of Object.entries(found)) {
    if (key === 'source') {
      out.source = value && value.sectionId
        ? `${COMPONENT_BEHAVIOR_PC_REL} ← pages/components.html#${value.sectionId}`
        : COMPONENT_BEHAVIOR_PC_REL;
      continue;
    }
    out[key] = value;
  }
  return out;
}

function registryReuse(j) {
  const out = [];
  const add = (v) => {
    if (typeof v === 'string') out.push(v);
    else if (v && typeof v === 'object') out.push(v.id || v.name);
  };
  const sources = [j.dependencies && j.dependencies.coreComponents, j.reuses && j.reuses.coreComponents];
  for (const source of sources) if (Array.isArray(source)) source.forEach(add);
  if (typeof j.baseComponent === 'string') out.push(j.baseComponent);
  return [...new Set(out.filter(Boolean))];
}

function registryMustNotCreate(j) {
  const out = [];
  const deps = j.dependencies && j.dependencies.coreComponents;
  for (const dep of (Array.isArray(deps) ? deps : [])) {
    if (dep && typeof dep === 'object' && Array.isArray(dep.notAllowed)) out.push(...dep.notAllowed);
  }
  return [...new Set(out)];
}

function figmaContract(comp, figmaMap) {
  const local = comp.json.figma && typeof comp.json.figma === 'object' ? comp.json.figma : {};
  const mapKey = comp.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const shared = (figmaMap.components && (figmaMap.components[comp.id] || figmaMap.components[mapKey])) || {};
  const identifiers = {};
  const copy = (src, key) => { if (typeof src[key] === 'string' && src[key].trim()) identifiers[key] = src[key]; };
  for (const key of ['componentName', 'figmaComponentName', 'componentSetKey', 'componentKey', 'fileKey', 'figmaFileKey', 'figmaNodeId', 'sectionNodeId', 'figmaSectionNodeId', 'pageNodeId']) {
    copy(local, key); if (!(key in identifiers)) copy(shared, key);
  }
  const explicitStatus = local.status || shared.status;
  const hasNode = Object.keys(identifiers).some((k) => /(?:NodeId|Key)$/.test(k) && identifiers[k] && !/[미발행미확인]/.test(identifiers[k]));
  return {
    status: explicitStatus || (hasNode ? 'available' : 'figma-unconfirmed'),
    identifiers: Object.keys(identifiers).length ? identifiers : 'figma-unconfirmed',
    variants: local.propertyMap && Object.keys(local.propertyMap).length ? local.propertyMap
      : (shared.propertyMap && Object.keys(shared.propertyMap).length ? shared.propertyMap : 'figma-unconfirmed'),
  };
}

function iconContract(j, iconLibrary) {
  const allowed = [];
  if (Array.isArray(j.icons)) for (const i of j.icons) if (i && i.name) allowed.push(i.name);
  if (j.reuses && Array.isArray(j.reuses.libraryIcons)) allowed.push(...j.reuses.libraryIcons);
  return {
    allowed: allowed.length ? [...new Set(allowed)] : 'figma-unconfirmed',
    slots: j.iconSlots || 'unknown',
  };
}

function aliasChains(comp, allTokens) {
  const entries = collectEntries(comp);
  const source = [...(entries.all || []), ...Object.values(entries.byVariant || {}).flat()];
  const chains = [];
  const seenChain = new Set();
  for (const entry of source) {
    let current = String(entry.name || '').replace(/^--/, '');
    if (!current || !(current in allTokens)) continue;
    const chain = [`--${current}`];
    let status = 'resolved';
    const seen = new Set([current]);
    for (let hop = 0; hop < 8; hop++) {
      const value = allTokens[current];
      const next = semanticFromValue(value);
      if (!next) { if (value && value !== chain[chain.length - 1]) chain.push(value); break; }
      if (seen.has(next)) break;
      chain.push(`--${next}`); seen.add(next); current = next;
      if (!(current in allTokens)) { status = 'unresolved'; break; }
    }
    if (chain.length < 2) continue;
    const rendered = chain.join(' → ');
    const sig = `${status}:${rendered}`;
    if (!seenChain.has(sig)) { seenChain.add(sig); chains.push({ chain: rendered, status }); }
  }
  return chains;
}

function compactGeometry(profiles) {
  if (!Array.isArray(profiles) || !profiles.length) return 'not-defined';
  const ignored = new Set(['when']);
  const keys = [...new Set(profiles.flatMap((p) => Object.keys(p).filter((k) => !ignored.has(k))))];
  const common = {};
  for (const key of keys) {
    const values = profiles.map((p) => JSON.stringify(p[key]));
    if (values.every((v) => v === values[0]) && profiles[0][key] !== undefined) common[key] = profiles[0][key];
  }
  const variants = profiles.map((profile) => {
    const out = { when: profile.when };
    for (const [key, value] of Object.entries(profile)) {
      if (key !== 'when' && !(key in common)) out[key] = value;
    }
    return out;
  });
  return { common: Object.keys(common).length ? common : 'not-defined', variants };
}

function agentContract(comp, factsDoc, behaviorDoc, figmaMap, allTokens) {
  const factName = FACT_NAME[comp.id] || comp.name;
  const facts = (factsDoc.components || {})[factName] || null;
  const builderReuse = facts && facts.composition && Array.isArray(facts.composition.buildDependencies)
    ? facts.composition.buildDependencies : [];
  const reuse = [...new Set([...builderReuse, ...registryReuse(comp.json)])];
  const aliases = aliasChains(comp, allTokens);
  return {
    agent: {
      component: comp.name,
      variantAxes: facts ? facts.variantAxes : 'not-defined',
      states: {
        builder: facts && facts.variantAxes && facts.variantAxes.State ? facts.variantAxes.State : 'not-defined',
        metadata: stateMetadata(comp.json),
      },
      behavior: behaviorContract(comp, behaviorDoc),
      geometry: compactGeometry(facts && facts.geometry),
      composition: {
        mustReuse: reuse.length ? reuse : 'not-defined',
        mustNotCreate: registryMustNotCreate(comp.json).length ? registryMustNotCreate(comp.json) : 'not-defined',
        declaredParts: facts && facts.anatomy && facts.anatomy.length ? facts.anatomy : 'not-defined',
      },
      constraints: comp.json.constraints || 'unknown',
      tokens: {
        figmaSemanticBindings: facts && facts.tokenBindings && facts.tokenBindings.length ? facts.tokenBindings : 'not-defined',
        aliasChains: aliases.length ? aliases : 'not-defined',
      },
      figma: figmaContract(comp, figmaMap),
      icons: iconContract(comp.json, factsDoc.iconLibrary || {}),
    },
  };
}

function agentContractDefaults(factsDoc) {
  return {
    agentContractDefaults: {
      sourcePriority: [
        `${COMPONENT_FACTS_REL} (build-components.ts mock execution)`,
        `${COMPONENT_BEHAVIOR_PC_REL} (pages/components.html PC runtime behavior)`,
        'registry/components/*.json (description/composition/Figma metadata)',
        `${TOKENS_REL} + ${COMPONENT_TOKENS_REL} (actual CSS alias chain)`,
      ],
      rules: [
        'Reuse the existing component and listed variant before creating UI.',
        'Only listed states are allowed; a missing state is not permission to invent it.',
        'For PC interaction, implement only behavior.status=verified rules. not-defined is not permission to invent keyboard, focus, or accessibility behavior.',
        'Use the highest available semantic/component token; never copy a raw terminal value into UI code.',
        'Component-specific icon lists override the global icon library. figma-unconfirmed means ask/report, not invent.',
      ],
      iconLibrary: factsDoc.iconLibrary || { source: 'unknown', allowed: 'unknown' },
      unknownMarkers: ['unknown', 'not-defined', 'figma-unconfirmed'],
      missingDefinitionResponse: 'DESIGN_SYSTEM_GAP: <missing definition>',
    },
  };
}

// ── §4 컴포넌트: 표(기존) + 서술(신규 registry 필드) ──────────────────
function componentProse(comp) {
  const j = comp.json || {};
  const out = [];
  const meta = j._meta || {};
  if (meta.description) out.push(meta.description);
  if (j.usage) {
    if (asArr(j.usage.whenToUse).length) out.push(`**언제 쓰나**\n${bullets(j.usage.whenToUse)}`);
    if (asArr(j.usage.whenNotToUse).length) out.push(`**쓰지 말아야 할 때**\n${bullets(j.usage.whenNotToUse)}`);
  }
  if (Array.isArray(j.anatomy) && j.anatomy.length) {
    const rows = j.anatomy.map((a) => `| ${a.part} | ${a.role} |`).join('\n');
    out.push(`**구성 (Anatomy)**\n\n| 요소 | 역할 |\n| --- | --- |\n${rows}`);
  }
  return out.join('\n\n');
}

function componentDoDontA11y(comp) {
  const j = comp.json || {};
  const out = [];
  if (j.doDont && (asArr(j.doDont.do).length || asArr(j.doDont.dont).length)) {
    const doB = asArr(j.doDont.do).length ? `_Do_\n${bullets(j.doDont.do)}` : '';
    const dontB = asArr(j.doDont.dont).length ? `_Don't_\n${bullets(j.doDont.dont)}` : '';
    out.push([doB, dontB].filter(Boolean).join('\n\n'));
  }
  if (Array.isArray(j.a11y) && j.a11y.length) out.push(`**접근성 (a11y)**\n${bullets(j.a11y)}`);
  return out.join('\n\n');
}

function buildComponents(comps, factsDoc, behaviorDoc, figmaMap, allTokens) {
  const body = [];
  body.push(`### Agent contract defaults\n\n\`\`\`yaml\n${yamlValue(agentContractDefaults(factsDoc))}\n\`\`\``);
  if (!comps.length) { body.push('_등록된 컴포넌트가 없습니다._'); }
  for (const c of comps) {
    const parts = [`### ${c.name}`];
    const pr = componentProse(c);
    if (pr) parts.push(pr);
    parts.push(componentTable(c));
    parts.push(`#### Agent-readable contract\n\n\`\`\`yaml\n${yamlValue(agentContract(c, factsDoc, behaviorDoc, figmaMap, allTokens))}\n\`\`\``);
    const dd = componentDoDontA11y(c);
    if (dd) parts.push(dd);
    body.push(parts.join('\n\n'));
  }
  return section('4. Components', [body.join('\n\n')]);
}

const DONOT_EDIT = '> ⚠️ 이 파일은 자동 생성물입니다. 손으로 고치지 마세요. 정본 목록은 `registry/governance/canon-manifest.json` 이고, 이 문서는 `component-facts.json`(Figma 빌더 실행 파생) + `component-behavior.pc.json`(PC 동작 계약) + `tokens.css`/`component-tokens.css`(토큰 파생) + `registry/components/*.json`(메타)에서 `npm run design:md:write` 로 재생성됩니다.';

function buildCore(tokens, coreComps, narrative, profiles, factsDoc, behaviorDoc, figmaMap) {
  const n = narrative || {};
  const fm = [];
  fm.push('---');
  fm.push('version: 1.0.0');
  fm.push('name: S1 Design System');
  fm.push('scope: core');
  fm.push('description: 디자인시스템 소비용 단일 컨텍스트(자동 생성 · 정본=tokens.css+registry)');
  fm.push('colors:');
  fm.push(yamlMap(tokens.colors, 2));
  fm.push('spacing:');
  fm.push(yamlMap(tokens.spacing, 2));
  fm.push('radius:');
  fm.push(yamlMap(tokens.radius, 2));
  fm.push('typography:');
  fm.push('  fontSize:');
  fm.push(yamlMap(tokens.fontSize, 4));
  fm.push('  fontWeight:');
  fm.push(yamlMap(tokens.fontWeight, 4));
  fm.push('---');

  // 본문 = 인트로 + 소비 프로파일 + 9섹션(awesome-design-md / Stitch 구조).
  // 각 섹션 빌더는 정본 데이터가 없으면 '' 을 반환 → 빈 섹션은 자동 생략.
  const sections = [
    profilesBlock(profiles),
    buildVisualTheme(n.visualTheme),            // §1
    buildColorRoles(n.colorRoles),              // §2
    buildTypography(n.typography),              // §3
    buildComponents(coreComps, factsDoc, behaviorDoc, figmaMap, tokens.all), // §4
    buildLayout(n.layout),                      // §5
    buildElevation(n.elevation),                // §6
    buildDoDont(n.doDont),                      // §7
    buildResponsive(n.responsive, tokens),      // §8
    buildAgentGuide(n.agentGuide),              // §9
  ].filter((s) => s && s.trim());

  const body = [];
  body.push('', '# S1 Design System — Core', '');
  body.push(DONOT_EDIT, '');
  body.push(sections.join('\n\n'));
  return fm.join('\n') + '\n' + body.join('\n') + '\n';
}

function buildService(scope, comps, factsDoc, behaviorDoc, figmaMap, allTokens) {
  const up = scope.toUpperCase();
  const fm = [];
  fm.push('---');
  fm.push('version: 1.0.0');
  fm.push(`name: S1 Design System — ${up}`);
  fm.push(`scope: ${scope}`);
  fm.push('extends: ../DESIGN.core.md');
  fm.push(`description: ${up} 서비스 분기(core 를 상속, 차이분만 기재 · 자동 생성)`);
  fm.push('---');
  const body = [];
  body.push('', `# S1 Design System — ${up}`, '');
  body.push('> ⚠️ 자동 생성물. 손편집 금지. 이 파일은 `../DESIGN.core.md` 를 상속하며, 아래는 이 서비스로 분기된 컴포넌트만 나열합니다.', '');
  if (!comps.length) {
    // 분기 시작점 확보용 빈 스텁 — 아직 이 서비스로 분기된 컴포넌트가 없을 때.
    body.push('## Components', '');
    body.push(`_아직 \`scope="${scope}"\` 로 분기된 컴포넌트가 없습니다. core 정의를 그대로 상속합니다._`, '');
    body.push(`컴포넌트를 이 서비스로 분기하려면 해당 \`registry/components/*.json\` 의 \`_meta.scope\` 를 \`"${scope}"\` 로 설정한 뒤 \`npm run design:md:write\` 를 실행하세요.`, '');
  } else {
    // core 와 동일한 렌더러(표 + 서술) 사용.
    body.push(buildComponents(comps, factsDoc, behaviorDoc, figmaMap, allTokens));
  }
  return fm.join('\n') + '\n' + body.join('\n') + '\n';
}

// 내용 sha256 앞 12자리를 스탬프로 붙인다(드리프트 감지용). 스탬프는 그 앞 내용만으로 계산.
function withStamp(content) {
  const base = content.replace(/\n+$/, '\n');
  const hash = crypto.createHash('sha256').update(base).digest('hex').slice(0, 12);
  return base + `\n<!-- generated-stamp: ${hash} · 손편집 금지 -->\n`;
}

function main() {
  const tokens = parseTokens();
  const comps = loadComponents();
  const narrative = loadNarrative();
  const profiles = loadProfiles();
  const factsDoc = loadComponentFacts();
  const behaviorDoc = loadComponentBehaviorPc();
  const figmaMap = loadFigmaMap();
  const byScope = {};
  for (const c of comps) (byScope[c.scope] = byScope[c.scope] || []).push(c);

  const targets = [];
  targets.push({ rel: CORE_REL, content: withStamp(buildCore(tokens, byScope.core || [], narrative, profiles, factsDoc, behaviorDoc, figmaMap)) });
  for (const svc of ACTIVE_SERVICES) {
    targets.push({ rel: SERVICE_OUT[svc], content: withStamp(buildService(svc, byScope[svc] || [], factsDoc, behaviorDoc, figmaMap, tokens.all)) });
  }

  let changed = 0;
  for (const t of targets) {
    const full = path.join(ROOT, t.rel);
    const prev = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
    const isDiff = prev !== t.content;
    if (WRITE) {
      if (isDiff) {
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, t.content);
        console.log(`  ✍️  작성함: ${t.rel}`);
        changed++;
      } else {
        console.log(`  = 최신: ${t.rel}`);
      }
    } else {
      if (isDiff) { console.log(`  변경감지: ${t.rel}`); changed++; }
      else console.log(`  최신: ${t.rel}`);
    }
  }
  if (WRITE) {
    console.log(`\n🔧 DESIGN.md 생성 완료 — ${changed}개 갱신 / 대상 ${targets.length}개`);
  } else {
    console.log(`\n🔧 DESIGN.md dry-run — ${changed > 0 ? changed + '개 변경감지 (npm run design:md:write 필요)' : '전부 최신'}`);
  }
}

main();
