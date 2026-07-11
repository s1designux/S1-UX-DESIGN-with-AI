#!/usr/bin/env node
/**
 * 🔧 DESIGN.md 생성기 — 디자인시스템 "소비용" 단일 컨텍스트 파일
 *
 * 목적: AI 에이전트가 "한 번에 읽는" 디자인시스템 스냅샷을 만든다.
 *   정본(assets/css/tokens.css + registry/components/*.json)을 스캔해 매번 재생성한다.
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

// 현재 활성 서비스 분기: 영상=vms 만. (mobility/building 은 매니페스트에 자리만, 아직 파일 생성 안 함)
const ACTIVE_SERVICES = ['vms'];
const SERVICE_OUT = { vms: VMS_REL }; // 서비스→출력경로 (리터럴 유지)

// 소비자(AI)용 프로파일 — design.manifest.json 의 profiles 와 값 일치를 수동으로 유지한다.
const PROFILES = {
  role: [
    { id: 'admin', density: 'compact', desc: '관리자 — 고밀도(정보 우선)' },
    { id: 'user', density: 'comfortable', desc: '일반 사용자 — 여유 밀도(가독성 우선)' },
  ],
  platform: [
    { id: 'web', container: '1200px', columns: 12 },
    { id: 'app', container: '1024px', columns: 8 },
    { id: 'mobile', container: '375px', columns: 4 },
  ],
  theme: ['light', 'dark'],
};

// ── tokens.css 파싱 ─────────────────────────────────────────────────
// `--이름: 값;` 을 뽑는다. (스펙의 `--(\w+)` 은 하이픈 미포함이라 실제 토큰명(--color-brand-blue 등)을
//  못 잡음 → [\w-]+ 로 조정. 값은 `;` 앞까지라 줄 끝 주석은 자동 제외됨.)
function parseTokens() {
  const css = fs.readFileSync(path.join(ROOT, TOKENS_REL), 'utf8');
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
    // colors: 브랜드 + Gray 숫자 스케일(다크 gray-dark-* 는 제외)
    colors: pick((k) => /^color-brand-/.test(k) || /^color-gray-\d/.test(k)),
    spacing: pick((k) => /^spacing-\d/.test(k)),   // Foundation 숫자 스페이싱만(semantic spacing 제외)
    radius: pick((k) => /^radius-/.test(k)),
    fontSize: pick((k) => /^font-size-/.test(k)),
    fontWeight: pick((k) => /^font-weight-/.test(k)),
  };
}

// ── registry 컴포넌트 로드 + scope 그룹핑 ────────────────────────────
function loadComponents() {
  const dir = path.join(ROOT, 'registry/components');
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json') || f === 'index.json') continue; // index.json 은 색인이라 제외
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
  if (Array.isArray(t)) {
    t.forEach(push);
  } else if (t && typeof t === 'object') {
    for (const v of Object.values(t)) {
      if (Array.isArray(v)) { v.forEach(push); continue; }
      if (v && typeof v === 'object') {
        if (Array.isArray(v.reuses)) v.reuses.forEach(push); // date-picker: {reuses:[...], note}
        for (const [k, val] of Object.entries(v)) {           // input: {"--css": "var(--sem)"}
          if (k.startsWith('--') && typeof val === 'string') push({ name: k, value: val });
        }
      }
    }
  }
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

function profilesBlock() {
  const l = [];
  l.push('## Profiles', '');
  l.push('> 소비자(역할·플랫폼·테마)별 적용 프로파일. 해석 순서는 `design.manifest.json` 의 resolutionOrder 참조.', '');
  l.push('### role');
  for (const r of PROFILES.role) l.push(`- **${r.id}** — 밀도: \`${r.density}\` (${r.desc})`);
  l.push('', '### platform');
  for (const p of PROFILES.platform) l.push(`- **${p.id}** — 컨테이너: \`${p.container}\`, 컬럼: \`${p.columns}\``);
  l.push('', '### theme');
  l.push('- ' + PROFILES.theme.map((t) => `\`${t}\``).join(' / '));
  return l.join('\n');
}

const DONOT_EDIT = '> ⚠️ 이 파일은 자동 생성물입니다. 손으로 고치지 마세요. 정본은 `assets/css/tokens.css` + `registry/components/*.json` 이며, `npm run design:md:write` 로 재생성됩니다.';

function buildCore(tokens, coreComps) {
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
  const body = [];
  body.push('', '# S1 Design System — Core', '');
  body.push(DONOT_EDIT, '');
  body.push(profilesBlock());
  body.push('', '## Components', '');
  if (!coreComps.length) body.push('_등록된 컴포넌트가 없습니다._', '');
  for (const c of coreComps) {
    body.push(`### ${c.name}`, '');
    body.push(componentTable(c), '');
  }
  return fm.join('\n') + '\n' + body.join('\n');
}

function buildService(scope, comps) {
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
  body.push('## Components', '');
  if (!comps.length) {
    // 분기 시작점 확보용 빈 스텁 — 아직 이 서비스로 분기된 컴포넌트가 없을 때.
    body.push(`_아직 \`scope="${scope}"\` 로 분기된 컴포넌트가 없습니다. core 정의를 그대로 상속합니다._`, '');
    body.push(`컴포넌트를 이 서비스로 분기하려면 해당 \`registry/components/*.json\` 의 \`_meta.scope\` 를 \`"${scope}"\` 로 설정한 뒤 \`npm run design:md:write\` 를 실행하세요.`, '');
  } else {
    for (const c of comps) {
      body.push(`### ${c.name}`, '');
      body.push(componentTable(c), '');
    }
  }
  return fm.join('\n') + '\n' + body.join('\n');
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
  const byScope = {};
  for (const c of comps) (byScope[c.scope] = byScope[c.scope] || []).push(c);

  const targets = [];
  targets.push({ rel: CORE_REL, content: withStamp(buildCore(tokens, byScope.core || [])) });
  for (const svc of ACTIVE_SERVICES) {
    targets.push({ rel: SERVICE_OUT[svc], content: withStamp(buildService(svc, byScope[svc] || [])) });
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
