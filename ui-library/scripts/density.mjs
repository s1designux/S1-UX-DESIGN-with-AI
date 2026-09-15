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

/** 선택자가 높이를 주는 '자리' — 컴포넌트 뒤에 붙은 부품 선택자만 남긴다(없으면 뿌리 자신). */
function partSuffixes(selector) {
  return splitSelectorList(selector).map((one) => {
    const parts = one.split(/\s+/).filter(Boolean);
    const rest = parts.slice(1).join(' ').replace(/\[data-size="[a-z]+"\]/g, '').replace(/\[data-break="[a-z]+"\]/g, '').trim();
    return rest || ':root-self';
  });
}

/**
 * 크기를 안 줬을 때 실제로 나오는 높이. **컨트롤 자리 하나**에서만 읽는다 —
 * 컨트롤 자리 = 그 컴포넌트에서 가장 큰 크기 높이를 만드는 부품(입력의 field, 표의 cell).
 * 아이콘·화살표 같은 장식 부품을 섞으면 그 높이가 눈금값과 같아지는 순간 한 단계가
 * 소리 없이 사라진다(독립 검증 2026-09-15 지적).
 *
 * 왜 필요한가: 표는 md 가 기본값이라 CSS 에 [data-size="md"] 규칙이 아예 없다. 그걸 "44 가 없다"로
 * 읽어 한 단계 아래(38)를 깔면, 원래 44 로 잘 나오던 표가 밀도를 주는 순간 38 로 내려앉는다.
 */
function defaultHeightFor(css, controlParts) {
  let found = null;
  for (const { selector, body } of topLevelRules(css)) {
    if (/\[data-size=/.test(selector) || /\[data-break=/.test(selector)) continue;
    if (!partSuffixes(selector).some((part) => controlParts.has(part))) continue;
    const heights = [...body.matchAll(/(?:^|[\s;{])(?:min-)?height:\s*(?:calc\()?var\(--sizing-(\d+)\)/g)].map((m) => Number(m[1]));
    if (heights.length) found = Math.max(found ?? 0, ...heights);
  }
  return found;
}

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
  const partsByHeight = new Map(); // 높이 → 그 높이를 주는 자리(부품 선택자) — 컨트롤 자리를 가려내기 위해
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
    if (!partsByHeight.has(tallest)) partsByHeight.set(tallest, new Set());
    for (const part of partSuffixes(selector)) partsByHeight.get(tallest).add(part);
  }
  const heights = [...pcHeights].map(([size, height]) => [height, size]);
  const pc = {};
  for (const [height, size] of heights) {
    const level = byPcHeight.get(height);
    if (level && !pc[level]) pc[level] = size;
  }
  // 컨트롤 자리 = 가장 큰 크기 높이를 만드는 부품. 장식 부품은 여기서 걸러진다.
  const tallestSized = Math.max(0, ...partsByHeight.keys());
  const defaultHeight = defaultHeightFor(css, partsByHeight.get(tallestSized) ?? new Set());
  let mobile = null;
  for (const [size, height] of mobileHeights) {
    if (policy.mobileFallbackHeights.includes(height) && !mobile) mobile = size;
  }
  return { pc, mobile, heights, defaultHeight };
}

/**
 * 쉼표로 이어진 선택자 목록을 나눈다. 괄호·대괄호·따옴표 안의 쉼표는 구분자가 아니다 —
 * `:is([data-size="xsm"], [data-size="xxsm"])` 를 반토막 내면 괄호가 안 닫힌 CSS 가 나온다.
 */
function splitSelectorList(selector) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (quote) { if (ch === quote && selector[i - 1] !== '\\') quote = null; continue; }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) { parts.push(selector.slice(start, i)); start = i + 1; }
  }
  parts.push(selector.slice(start));
  return parts.map((s) => s.trim()).filter(Boolean);
}

/**
 * `:is([data-size="xsm"], [data-size="xxsm"])` 처럼 크기 후보만 묶은 괄호는 통째로 다룬다.
 * 찾는 크기가 그 안에 있으면 괄호 전체를 :not([data-size]) 로 바꾼다 — 안쪽 하나만 바꾸면
 * 나머지 크기가 남아 규칙이 통째로 버려지고(그래서 달력 속틀이 밀도를 못 받았다) 만다.
 */
function collapseSizeGroups(selector, size) {
  return selector.replace(/:is\(([^()]*)\)/g, (whole, inner) => {
    const members = splitSelectorList(inner);
    if (!members.length || !members.every((m) => /^\[data-size="[a-z]+"\]$/.test(m))) return whole;
    return members.includes(`[data-size="${size}"]`) ? ':not([data-size])' : whole;
  });
}

/**
 * 규칙 하나를 밀도 규칙으로 옮긴다. 해당 크기를 쓰지 않는 규칙이면 null.
 * breakValue 가 있으면 [data-break="pc"] 도 조상 선언으로 옮긴다.
 */
function retarget(selector, size, breakValue) {
  if (!selector.includes(`[data-size="${size}"]`)) return null;
  let next = collapseSizeGroups(selector, size)
    .replace(new RegExp(`\\[data-size="${size}"\\]`, 'g'), ':not([data-size])');
  SIZE_ATTR.lastIndex = 0;
  if (SIZE_ATTR.test(next)) return null;           // 다른 크기가 섞인 규칙은 옮기지 않는다
  if (breakValue) {
    if (!next.includes(`[data-break="${breakValue}"]`)) return null;
    /* 컴포넌트가 자기 data-break 를 달고 있어도 감싸기 선언이 닿아야 한다. :not([data-break]) 로 바꾸면
       예시 마크업처럼 data-break="pc" 가 붙은 컴포넌트가 규칙 밖으로 빠져 높이가 아예 안 잡혔다(2026-09-15).
       반대쪽 화면을 직접 적어 둔 컴포넌트에는 밀도가 손을 대지 않는다 — 그 자리는 감싸기가 없을 때와
       똑같이 data-size 를 직접 줘야 한다(이긴다기보다 '밀도가 비켜 준다'). */
    const other = breakValue === 'pc' ? 'mobile' : 'pc';
    next = next.replace(new RegExp(`\\[data-break="${breakValue}"\\]`, 'g'), `:not([data-break="${other}"])`);
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
 * 화면 구분을 감싸기에 적었을 때, 컴포넌트 자신의 `[data-break]` 규칙이 그대로 살아나게 하는 다리.
 *
 * 왜 필요한가(독립 검증 2026-09-15 지적 2건):
 *  · 감싸기 안에서 한 자리만 `data-size` 를 직접 줬을 때 — 칩·필터칩·입력은 크기 규칙이
 *    `[data-break]` 를 함께 요구해서, 화면 구분을 안 적으면 크기를 줘도 높이가 안 잡혔다.
 *    문서가 권하는 예외 처리가 그 셋에서만 조용히 무너지던 자리다.
 *  · 크기 없이 화면 구분만 걸린 규칙 — 입력의 모바일 아이콘 버튼(48×48 터치 영역)이 그것인데,
 *    밀도 규칙은 크기 규칙만 옮기므로 줄 높이는 48 인데 아이콘만 PC 크기(28)로 남았다.
 *
 * 값은 건드리지 않는다. 컴포넌트 자기 규칙을 그대로 두고, 화면 구분 조건만
 * `[data-break="pc"]` → `:not([data-break="mobile"])` 로 느슨하게 한 사본을 감싸기 안에 깐다.
 * 반대쪽을 직접 적어 둔 컴포넌트는 여전히 비켜 간다.
 */
function breakBridgeFor(id, css, policy) {
  const ancestors = {
    // 화면 구분을 안 적으면 PC 로 본다 — 밀도만 선언한 자리도 PC 다.
    pc: `:is([${policy.breakAttribute}="pc"], ${policy.levels.map((l) => `[${policy.attribute}="${l.id}"]`).join(', ')})`,
    mobile: `[${policy.breakAttribute}="mobile"]`
  };
  const blocks = [];
  for (const breakValue of ['pc', 'mobile']) {
    const other = breakValue === 'pc' ? 'mobile' : 'pc';
    const moved = [];
    for (const { selector, body } of topLevelRules(css)) {
      const parts = splitSelectorList(selector)
        .filter((one) => one.includes(`[data-break="${breakValue}"]`) && !one.includes(`[data-break="${other}"]`))
        .map((one) => `${ancestors[breakValue]} ${one.replace(new RegExp(`\\[data-break="${breakValue}"\\]`, 'g'), `:not([data-break="${other}"])`)}`);
      if (parts.length) moved.push(`${parts.join(',\n')} {${body}}`);
    }
    if (moved.length) {
      blocks.push(`/* bridge:${breakValue} 감싸기에 화면 구분을 적었으면 컴포넌트가 안 적어도 같은 규칙이 선다 */\n${moved.join('\n\n')}`);
    }
  }
  return blocks;
}

/**
 * 한 컴포넌트의 밀도 CSS 를 만든다. 대상이 아니거나 옮길 규칙이 없으면 빈 문자열.
 */
export function densityCssFor(id, css, policy, breaks = null) {
  if (!policy.componentFacts[id]) return '';
  const { pc, mobile, heights, defaultHeight } = densityMapFor(css, policy, breaks);
  /* 그 밀도에 딱 맞는 크기가 없는 컴포넌트가 있다(칩은 34·28 만 있어 '넓게' 가 없다).
     그럴 때 크기를 안 주면 높이가 아예 안 나오므로, 가장 가까운 아래 크기를 쓴다.
     — 위로 올려 잡으면 그 줄만 혼자 커져 줄이 어긋난다. */
  for (const level of policy.levels) {
    if (pc[level.id]) continue;
    // 크기를 안 줘도 이미 그 높이가 나오는 단계면 아무것도 깔지 않는다 — 깔면 오히려 낮아진다.
    if (defaultHeight === level.pcHeight) continue;
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
      const parts = splitSelectorList(selector)
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
  blocks.push(...breakBridgeFor(id, css, policy));
  if (mobile) {
    const plain = emit(`[${policy.breakAttribute}="mobile"]`, mobile, null);
    const withBreak = emit(`[${policy.breakAttribute}="mobile"]`, mobile, 'mobile');
    if (plain.length || withBreak.length) {
      blocks.push(`/* density:mobile 모바일은 밀도 축이 없다 — 손가락 기준 높이 하나 */\n${[...plain, ...withBreak].join('\n\n')}`);
    }
  }
  return blocks.length ? `\n\n/* ── 밀도(density) — registry/governance/density-policy.json 에서 생성. 손편집 금지 ── */\n${blocks.join('\n\n')}\n` : '';
}
