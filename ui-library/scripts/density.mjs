/**
 * density.mjs — 밀도(넓게·보통·좁게) 한 단어를 감싸는 요소에 주면 안쪽 컨트롤이
 * data-size 없이도 맞는 높이로 그려지게 하는 CSS 를 만든다.
 *
 * 만드는 방법: 새 값을 짓지 않는다. 컴포넌트 CSS 안에 이미 있는 `[data-size="xsm"]` 규칙을
 * 그대로 복사하면서 선택자만 바꾼다 —
 *   [data-s1-component="button"][data-size="xsm"]
 *   → [data-s1-density="normal"] [data-s1-component="button"]:not([data-size])
 * 선언(높이·여백·글자)은 손대지 않으므로 밀도 규칙과 크기 규칙이 어긋날 수 없다.
 *
 * 어느 크기가 어느 밀도인지는 registry/components/component-facts.json 의 실측 높이에서
 * 기계가 읽는다(44=넓게 · 34=보통 · 28=좁게 · 모바일 48). 표를 손으로 적지 않는다.
 *
 * 정책 정본: registry/governance/density-policy.json
 */

const SIZE_ATTR = /\[data-size="([a-z]+)"\]/g;
const BREAK_ATTR = /\[data-break="([a-z]+)"\]/g;

/**
 * "밀도 → 크기 단어" 를 컴포넌트 자기 CSS 에서 읽는다.
 *
 * facts 의 geometry 를 쓰지 않는 이유: 컴포넌트마다 실측 대상이 다르다. 드롭다운은 facts 에
 * 목록 패널 높이(120·144·184)가 실려 있고 한 줄 높이(28·34·44)는 CSS 에만 있다. 표는 정본에
 * md(44) 가 있지만 웹 배포본은 sm·xsm 만 구현했다. 실제로 그려지는 높이를 기준으로 삼아야
 * 밀도가 어긋나지 않으므로, 배포될 CSS 자신을 읽는다.
 */
export function densityMapFor(css, policy, breaks = null) {
  const byPcHeight = new Map(policy.levels.map((l) => [l.pcHeight, l.id]));
  const pcHeights = new Map();     // size → 그 크기가 만드는 가장 큰 높이
  const mobileHeights = new Map();
  for (const { selector, body } of topLevelRules(css)) {
    // 한 규칙이 쉼표로 여러 선택자를 묶어도 크기는 하나여야 한다(중복 제거 후 판정).
    const sizes = [...new Set([...selector.matchAll(/\[data-size="([a-z]+)"\]/g)].map((m) => m[1]))];
    if (sizes.length !== 1) continue;
    const heights = [...body.matchAll(/(?:^|[\s;{])(?:min-)?height:\s*(?:calc\()?var\(--sizing-(\d+)\)/g)].map((m) => Number(m[1]));
    if (!heights.length) continue;
    const tallest = Math.max(...heights);
    /* 어느 크기가 모바일 것인지는 manifest 의 breaks 가 정본이다 — 버튼 lg 처럼
       선택자에 [data-break] 를 안 붙이고 크기 단어만으로 구분하는 컴포넌트가 있다. */
    const mobileOnly = breaks ? (breaks.mobile || []).includes(sizes[0]) && !(breaks.pc || []).includes(sizes[0]) : false;
    const target = (mobileOnly || selector.includes('[data-break="mobile"]')) ? mobileHeights : pcHeights;
    target.set(sizes[0], Math.max(tallest, target.get(sizes[0]) ?? 0));
  }
  const heights = [...pcHeights].map(([size, height]) => [height, size]);
  const pc = {};
  for (const [height, size] of heights) {
    const level = byPcHeight.get(height);
    if (level && !pc[level]) pc[level] = size;
  }
  let mobile = null;
  for (const [size, height] of mobileHeights) {
    if (policy.mobileFallbackHeights.includes(height) && !mobile) mobile = size;
  }
  return { pc, mobile, heights };
}

/**
 * 규칙 하나를 밀도 규칙으로 옮긴다. 해당 크기를 쓰지 않는 규칙이면 null.
 * breakValue 가 있으면 [data-break="pc"] 도 조상 선언으로 옮긴다.
 */
function retarget(selector, size, breakValue) {
  if (!selector.includes(`[data-size="${size}"]`)) return null;
  let next = selector.replace(new RegExp(`\\[data-size="${size}"\\]`, 'g'), ':not([data-size])');
  SIZE_ATTR.lastIndex = 0;
  if (SIZE_ATTR.test(next)) return null;           // 다른 크기가 섞인 규칙은 옮기지 않는다
  if (breakValue) {
    if (!next.includes(`[data-break="${breakValue}"]`)) return null;
    next = next.replace(new RegExp(`\\[data-break="${breakValue}"\\]`, 'g'), ':not([data-break])');
  } else {
    BREAK_ATTR.lastIndex = 0;
    if (BREAK_ATTR.test(next)) return null;        // 화면 구분이 걸린 규칙은 break 옮기기에서 다룬다
  }
  return next;
}

/** 최상위 규칙만 훑는다(@media 안은 hover 전용이라 밀도와 무관하다). */
function* topLevelRules(css) {
  let depth = 0;
  let start = 0;
  let selector = null;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      // 규칙 앞 주석은 선택자가 아니다 — 떼지 않으면 밀도 규칙 선택자 안에 주석이 끼어 들어간다.
      if (depth === 0) { selector = css.slice(start, i).replace(/\/\*[\s\S]*?\*\//g, ' ').trim(); start = i + 1; }
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        if (selector && !selector.startsWith('@')) yield { selector, body: css.slice(start, i) };
        selector = null;
        start = i + 1;
      }
    }
  }
}

/**
 * 한 컴포넌트의 밀도 CSS 를 만든다. 대상이 아니거나 옮길 규칙이 없으면 빈 문자열.
 */
export function densityCssFor(id, css, policy, breaks = null) {
  if (!policy.componentFacts[id]) return '';
  const { pc, mobile, heights } = densityMapFor(css, policy, breaks);
  /* 그 밀도에 딱 맞는 크기가 없는 컴포넌트가 있다(칩은 34·28 만 있어 '넓게' 가 없다).
     그럴 때 크기를 안 주면 높이가 아예 안 나오므로, 가장 가까운 아래 크기를 쓴다.
     — 위로 올려 잡으면 그 줄만 혼자 커져 줄이 어긋난다. */
  for (const level of policy.levels) {
    if (pc[level.id]) continue;
    const below = heights.filter(([h]) => h < level.pcHeight).sort((a, b) => b[0] - a[0])[0];
    const above = heights.filter(([h]) => h > level.pcHeight).sort((a, b) => a[0] - b[0])[0];
    const pick = below || above;
    if (pick) pc[level.id] = pick[1];
  }
  const rules = [...topLevelRules(css)];
  const blocks = [];

  const emit = (ancestor, size, breakValue) => {
    const moved = [];
    for (const { selector, body } of rules) {
      const parts = selector.split(',').map((s) => s.trim()).filter(Boolean)
        .map((s) => retarget(s, size, breakValue))
        .filter(Boolean)
        .map((s) => `${ancestor} ${s}`);
      if (parts.length) moved.push(`${parts.join(',\n')} {${body}}`);
    }
    return moved;
  };

  for (const level of policy.levels) {
    const size = pc[level.id];
    if (!size) continue;
    const label = `${level.ko}(${level.pcHeight}px) — data-size 를 직접 주면 그쪽이 이긴다`;
    const moved = [
      // 화면 구분이 안 걸린 규칙
      ...emit(`[${policy.attribute}="${level.id}"]`, size, null),
      // PC 규칙 — 화면 구분을 안 적으면 PC 로 본다(design.manifest.json defaults.platform=web)
      ...emit(`[${policy.attribute}="${level.id}"]`, size, 'pc'),
      ...emit(`[${policy.breakAttribute}="pc"][${policy.attribute}="${level.id}"]`, size, 'pc')
    ];
    if (moved.length) blocks.push(`/* density:${level.id} ${label} */\n${moved.join('\n\n')}`);
  }
  if (mobile) {
    const plain = emit(`[${policy.breakAttribute}="mobile"]`, mobile, null);
    const withBreak = emit(`[${policy.breakAttribute}="mobile"]`, mobile, 'mobile');
    if (plain.length || withBreak.length) {
      blocks.push(`/* density:mobile 모바일은 밀도 축이 없다 — 손가락 기준 높이 하나 */\n${[...plain, ...withBreak].join('\n\n')}`);
    }
  }
  return blocks.length ? `\n\n/* ── 밀도(density) — registry/governance/density-policy.json 에서 생성. 손편집 금지 ── */\n${blocks.join('\n\n')}\n` : '';
}
