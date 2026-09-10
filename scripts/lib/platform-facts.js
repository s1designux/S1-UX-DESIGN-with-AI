/**
 * platform-facts.js — "그 툴 묶음에 무엇이 들어있나" 를 배포본에서 읽어 낸다.
 * --------------------------------------------------------------------------
 * 왜 필요한가: 개발자 안내 화면(pages/install-prompt.html)과 툴별 묶음 README 가
 * 각자 사람이 적은 문장을 들고 있었다. 배포본에 부품·텍스트 스타일이 새로 들어와도
 * 안내는 "값만 들어있습니다" 로 남는다(river 지적 2026-09-10 — Kotlin).
 *
 * 그래서 "무엇이 들어있나 / 어디까지 되나" 는 여기 한 곳에서만 만든다.
 *   입력: ui-library/dist/platform/manifest.json (배포본이 스스로 선언한 사실) + 실제 파일 존재
 *   출력: 카드·README 가 그대로 붙여 쓰는 문장 조각과 대표 파일 목록
 *
 * 사람이 적는 문장(설치 순서·예시 코드)은 남아 있으므로, assertProse() 가
 * ①없는 파일·없는 이름을 가리키는지 ②부품이 있는데 "부품 없음" 이라 말하는지 를 막는다.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DIST = path.join(ROOT, 'ui-library', 'dist');

const exists = (relative) => fs.existsSync(path.join(DIST, relative));

/** 있으면 말하고 없으면 말하지 않는다 — 파일이 사라지면 문장도 같이 사라진다. */
const ifExists = (relative, label) => (exists(relative) ? { file: relative, label } : null);

/* 툴별로 "있으면 언급할 것" 후보. 값이 아니라 존재 여부만 사람이 정한다. */
const EXTRA_CANDIDATES = {
  'html-css-js': (platform, key) => [
    ifExists('examples', '복사해서 쓰는 마크업(<code>examples/</code>)'),
    ifExists('s1-ui.css', '겉모습 한 벌(<code>s1-ui.css</code>)'),
    ifExists('s1-ui.auto.js', '동작 스크립트(<code>s1-ui.auto.js</code>)'),
    ifExists('assets/icons', '아이콘')
  ],
  react: () => [
    ifExists('platform/react/README.md', '사용 설명서(<code>README.md</code>)'),
    ifExists('platform/react/index.d.ts', '타입 정의(<code>index.d.ts</code>)')
  ],
  vue: () => [],
  kotlin: (platform) => [
    ifExists(platform.sample ?? '', '바로 돌려 보는 예제 앱(<code>platform/kotlin-sample</code>)'),
    ifExists(platform.preview ?? '', '부품을 한 화면에 늘어놓은 미리보기(<code>preview/S1Gallery.kt</code>)'),
    ifExists('platform/behavior.json', '컴포넌트 동작 명세(<code>behavior.json</code>)')
  ],
  swift: () => [ifExists('platform/behavior.json', '컴포넌트 동작 명세(<code>behavior.json</code>)')],
  cpp: () => [ifExists('platform/tokens.json', '같은 값의 JSON 사본(<code>tokens.json</code>)')]
};

/** 카드 아래·README 에 적는 대표 파일. 실제로 있는 것만 남는다. */
function representativeFiles(key, spec) {
  const candidates = spec.componentSupport === 'components'
    ? [`platform/${key}/`, spec.readme, 'platform/behavior.json']
    : spec.componentSupport === 'full'
      ? [spec.entry, `platform/${key}/`, spec.readme]
      : [spec.entry, 'platform/behavior.json', 'platform/tokens.json'];
  const out = [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const relative = candidate.replace(/\/$/, '');
    if (!exists(relative) || out.includes(candidate)) continue;
    out.push(candidate);
  }
  return out;
}

const stripTags = (text) => String(text).replace(/<[^>]+>/g, '');

/**
 * 한 툴의 사실.
 *   support      full(컴포넌트 전부) · components(부품 일부) · tokens-only(값만)
 *   badgeLabel   화면 배지 문구
 *   contains     "들어있는 것" 문장(HTML) / containsMd 는 같은 문장의 마크다운판
 */
function toolFacts(key, manifest, platform) {
  const spec = platform.platforms[key];
  if (!spec) throw new Error(`platform/manifest.json 에 ${key} 선언이 없습니다.`);
  const support = spec.componentSupport;
  const approved = manifest.components.filter((component) => component.status === 'approved').length;
  const pieces = [];

  if (support === 'full') pieces.push(`컴포넌트 ${approved}종 전부`);
  else if (support === 'components') {
    pieces.push(`${spec.ui ?? ''} 부품 ${spec.components.length}종(${spec.components.join(' · ')})`.trim());
  }
  if (spec.textStyles) pieces.push(`이름 붙은 텍스트 스타일 ${spec.textStyles}종(<code>S1Type</code>)`);
  if (spec.icons) pieces.push(`아이콘 ${spec.icons}개(<code>S1Icons</code>)`);
  if (support !== 'full') pieces.push(`색 ${platform.tokenCount}개(라이트·다크) · 크기·간격·반경 값`);
  for (const extra of (EXTRA_CANDIDATES[key] ?? (() => []))(spec, key)) {
    if (extra) pieces.push(extra.label);
  }

  const tail = support === 'tokens-only'
    ? ' <strong>화면 부품은 들어있지 않습니다 — 직접 그려야 합니다.</strong>'
    : '';
  const contains = `${pieces.join(' · ')}.${tail}`;

  return {
    key,
    support,
    lint: spec.lint === true,
    componentCount: support === 'components' ? spec.components.length : approved,
    components: support === 'components' ? spec.components : null,
    textStyles: spec.textStyles ?? 0,
    icons: spec.icons ?? 0,
    entry: spec.entry,
    badgeLabel: support === 'full'
      ? '컴포넌트 그대로 사용'
      : support === 'components'
        ? `부품 ${spec.components.length}종 + 값`
        : '색·크기 값만',
    badgeClass: support === 'full' ? 'devtool-badge-full' : support === 'components' ? 'devtool-badge-parts' : 'devtool-badge-tokens',
    scope: support === 'full'
      ? '컴포넌트까지 그대로 사용'
      : support === 'components'
        ? `${spec.ui ?? '네이티브'} 부품 ${spec.components.length}종 + 토큰(색·크기) 값`
        : '토큰(색·크기) 값만 제공',
    contains,
    containsMd: stripTags(contains),
    files: representativeFiles(key, spec)
  };
}

/** 모든 툴의 사실. 선언 순서를 그대로 지킨다. */
function allToolFacts(manifest, platform) {
  const out = new Map();
  for (const key of Object.keys(platform.platforms)) out.set(key, toolFacts(key, manifest, platform));
  return out;
}

/* ── 사람이 적은 문장 검사 ──────────────────────────────────────────────
   설치 순서·예시 코드는 자동 생성할 수 없다. 대신 거기 적힌 파일·이름이
   배포본에 실재하는지, 사실과 반대로 말하지 않는지 기계로 본다. */

const FILE_PATTERN = /(?:platform\/[A-Za-z0-9_./-]+|s1-ui\.[a-z.]+|examples\/|components\/|assets\/[A-Za-z0-9_./-]+|tools\/[A-Za-z0-9_./-]+)/g;
const SYMBOL_PATTERN = /\bS1[A-Za-z0-9]+\b/g;
const DENY = ['화면 부품은 들어있지 않습니다', '컴포넌트를 그대로 드릴 수 없습니다', '색·크기 값만'];

function fileClaims(text) {
  return [...new Set((stripTags(text).match(FILE_PATTERN) ?? []).map((claim) => claim.replace(/[.,)]$/, '')))];
}

/**
 * 한 툴에 대한 사람 문장(설치 순서·예시 코드·주의 문구)을 검사한다.
 * 문제가 있으면 사람이 읽을 수 있는 메시지 배열을 돌려준다(빈 배열이면 통과).
 */
function assertProse(facts, texts) {
  const problems = [];
  const joined = texts.filter(Boolean).join('\n');
  const platformDir = path.join(DIST, 'platform', facts.key);
  const searchable = fs.existsSync(platformDir) ? readAll(platformDir) : '';

  for (const claim of fileClaims(joined)) {
    const relative = claim.replace(/\/$/, '');
    if (relative.includes('*')) continue;
    if (!exists(relative)) problems.push(`배포본에 없는 파일을 안내합니다: ${claim}`);
  }
  if (facts.support !== 'full' && searchable) {
    for (const symbol of new Set(stripTags(joined).match(SYMBOL_PATTERN) ?? [])) {
      if (!searchable.includes(symbol)) problems.push(`배포본에 없는 이름을 안내합니다: ${symbol}`);
    }
  }
  if (facts.support !== 'tokens-only') {
    for (const phrase of DENY) {
      if (joined.includes(phrase)) problems.push(`부품이 들어있는 툴인데 "${phrase}" 라고 적혀 있습니다.`);
    }
  }
  return problems;
}

function readAll(dir, into = []) {
  for (const entry of fs.readdirSync(dir)) {
    const absolute = path.join(dir, entry);
    if (fs.statSync(absolute).isDirectory()) readAll(absolute, into);
    else into.push(fs.readFileSync(absolute, 'utf8'));
  }
  return into.join('\n');
}

module.exports = { allToolFacts, assertProse, toolFacts, stripTags };
