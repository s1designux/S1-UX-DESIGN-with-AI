/* ── Token page toolbar — 검색 + Light/Dark 전환 ──
 * foundation.html · semantic.html 공용. 마크업은 각 페이지 섹션 nav 안의 .token-toolbar.
 *   data-items    검색 대상 한 칸(카드·행) 선택자
 *   data-groups   안의 칸이 다 숨으면 같이 숨길 묶음 선택자 (안쪽 → 바깥 순, | 로 구분)
 *   data-labels   바로 다음 형제(그리드)의 칸이 다 숨으면 같이 숨길 소제목 선택자
 *   data-sections 페이지 섹션 선택자 — 검색 중에는 맞는 칸이 없는 섹션을 숨긴다
 * 검색어·대상 문자열은 대소문자·구분자(/ - _ # . 공백 ·)를 지우고 비교한다
 *   → "gray/100", "gray-100", "--color-gray-100", "#E9E9E9", "e9e9e9" 모두 같은 칸을 찾는다.
 * 테마는 main.js setGlobalTheme(사이트 전체 공유) — 페이지가 window.onTokenTheme 을 두면 같이 부른다. */
(function () {
  const toolbar = document.querySelector('.token-toolbar');
  if (!toolbar) return;

  const field   = toolbar.querySelector('.token-search');
  const input   = field.querySelector('input');
  const countEl = field.querySelector('.token-search-count');
  const clearEl = field.querySelector('.token-search-clear');
  const itemSel    = toolbar.dataset.items;
  const groupSels  = (toolbar.dataset.groups || '').split('|').map(s => s.trim()).filter(Boolean);
  const labelSel   = toolbar.dataset.labels;
  const sectionSel = toolbar.dataset.sections;
  const content = document.querySelector('.page-content');
  const MISS = 'token-search-miss';

  const empty = document.createElement('div');
  empty.className = 'token-search-empty';
  content.prepend(empty);

  const norm = s => String(s || '').toLowerCase().replace(/[\s\/\-_#.·()]+/g, '');
  const haystack = el => norm([el.textContent, el.title, el.dataset.var, el.dataset.hex].join(' '));
  const hasItems = el => !!el && !!el.querySelector(itemSel);
  const hasHit = el => [...el.querySelectorAll(itemSel)].some(i => !i.classList.contains(MISS));

  function apply() {
    const q = norm(input.value);
    field.classList.toggle('has-query', !!q);
    content.querySelectorAll('.' + MISS).forEach(el => el.classList.remove(MISS));
    empty.classList.remove('is-shown');
    if (!q) return;

    let hits = 0;
    content.querySelectorAll(itemSel).forEach(el => {
      if (haystack(el).includes(q)) hits++;
      else el.classList.add(MISS);
    });
    groupSels.forEach(sel => content.querySelectorAll(sel).forEach(g => {
      if (hasItems(g) && !hasHit(g)) g.classList.add(MISS);
    }));
    if (labelSel) content.querySelectorAll(labelSel).forEach(label => {
      const grid = label.nextElementSibling;
      if (hasItems(grid) && !hasHit(grid)) { label.classList.add(MISS); grid.classList.add(MISS); }
    });
    content.querySelectorAll(sectionSel).forEach(s => { if (!hasHit(s)) s.classList.add(MISS); });

    countEl.textContent = hits + '개';
    if (!hits) {
      empty.textContent = `‘${input.value.trim()}’에 맞는 토큰이 없어요`;
      empty.classList.add('is-shown');
    }
  }

  input.addEventListener('input', () => {
    apply();
    const nav = toolbar.closest('.foundation-section-nav');
    const top = content.getBoundingClientRect().top + window.pageYOffset - (nav ? nav.offsetHeight : 0);
    if (window.pageYOffset > top) window.scrollTo({ top });
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { input.value = ''; apply(); input.blur(); }
  });
  clearEl.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); input.focus();
    }
  });

  /* 표를 다시 그리는 페이지(semantic 테마 전환)도 검색 상태를 유지 */
  new MutationObserver(ms => {
    if (input.value && ms.some(m => m.target !== empty)) apply();
  }).observe(content, { childList: true, subtree: true });

  /* ── Light / Dark ── */
  const buttons = toolbar.querySelectorAll('.token-theme-toggle button');
  function setTheme(t) {
    if (typeof setGlobalTheme === 'function') setGlobalTheme(t);
    else document.documentElement.setAttribute('data-theme', t);
    buttons.forEach(b => b.classList.toggle('active', b.dataset.theme === t));
    if (typeof window.onTokenTheme === 'function') window.onTokenTheme(t);
  }
  buttons.forEach(b => b.addEventListener('click', () => setTheme(b.dataset.theme)));
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  buttons.forEach(b => b.classList.toggle('active', b.dataset.theme === current));
})();
