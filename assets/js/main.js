/* ============================================================
   SW Design System Guide · main.js
   ============================================================ */

/* ── Site Map ── */
const SITE_NAV = [
  { type: 'label', text: '개요' },
  { type: 'item', id: 'index', href: '../index.html', rootHref: 'index.html', icon: '🏠', text: 'Overview' },
  { type: 'item', id: 'install-prompt', href: 'install-prompt.html', rootHref: 'pages/install-prompt.html', icon: '⚡', text: '토큰 설치 프롬프트', status: 'ready' },
  { type: 'label', text: 'Foundation' },
  { type: 'item', id: 'foundation', href: 'foundation.html', rootHref: 'pages/foundation.html', icon: '🎨', text: 'Foundation Tokens', status: 'ready' },
  { type: 'item', id: 'semantic', href: 'semantic.html', rootHref: 'pages/semantic.html', icon: '🌗', text: 'Semantic Tokens', status: 'ready' },
  { type: 'label', text: 'Design System' },
  { type: 'item', id: 'components', href: 'components.html', rootHref: 'pages/components.html', icon: '🧩', text: 'Components', status: 'ready' },
  { type: 'item', id: 'icons', href: 'icons.html', rootHref: 'pages/icons.html', icon: '✦', text: 'Icons · 817', status: 'ready' },
  { type: 'item', id: 'patterns', href: 'patterns.html', rootHref: 'pages/patterns.html', icon: '📐', text: 'Patterns', status: 'soon' },
  { type: 'item', id: 'policy', href: 'policy.html', rootHref: 'pages/policy.html', icon: '📋', text: 'Policy' },
  { type: 'item', id: 'legacy', href: 'legacy.html', rootHref: 'pages/legacy.html', icon: '🗂️', text: 'Legacy Guide', status: 'soon' },
  { type: 'label', text: 'AI 워크플로우' },
  { type: 'item', id: 'ai-snippets', href: 'ai-snippets.html', rootHref: 'pages/ai-snippets.html', icon: '🤖', text: 'AI Snippets', status: 'ready' },
  { type: 'item', id: 'guide-md', href: 'guide-md.html', rootHref: 'pages/guide-md.html', icon: '📋', text: 'Guide MD', status: 'ready' },
  { type: 'item', id: 'md-review', href: 'md-review.html', rootHref: 'pages/md-review.html', icon: '🔍', text: 'MD 리뷰', status: 'ready' },
];

/* ── Sidebar Render ── */
function renderSidebar() {
  const isRoot = !window.location.pathname.includes('/pages/');

  const items = SITE_NAV.map(item => {
    if (item.type === 'label') {
      return `<div class="nav-group-label">${item.text}</div>`;
    }
    const href = isRoot ? item.rootHref : item.href;
    const active = window.location.pathname.endsWith(item.rootHref) ||
                   window.location.pathname.endsWith(item.href)
      ? 'active' : '';
    const badge = item.status === 'soon'
      ? `<span class="nav-badge">Soon</span>`
      : item.status === 'new'
      ? `<span class="nav-badge new">New</span>`
      : '';
    return `<a href="${href}" class="nav-item ${active}" data-id="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.text}</span>
      ${badge}
    </a>`;
  }).join('');

  return `
    <div class="sidebar-logo">
      <div class="logo-mark">
        <div class="logo-dot"></div>
        <span class="logo-title">SW Design System</span>
      </div>
      <div class="logo-version">UX Guide V2.4 · 2026</div>
    </div>
    <div class="sidebar-search">
      <div class="search-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" id="sidebar-search-input" placeholder="토큰, 색상 검색...">
      </div>
    </div>
    <nav class="sidebar-nav">${items}</nav>
    <div class="sidebar-footer">
      v1.0.0 · Figma node 540:7663<br>
      <a href="https://www.figma.com/design/yE5UCFEbmXJBlYJWB24Lz2/" style="color:#0072ce" target="_blank">Figma 열기 ↗</a>
    </div>
  `;
}

/* ── Mobile Toggle ── */
function initMobile() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

/* ── Tabs ── */
function initTabs(root) {
  const el = root || document;
  el.querySelectorAll('.tabs-container').forEach(container => {
    const btns = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');
    if (btns.length === 0) return;
    function activate(idx) {
      btns.forEach((b, i) => b.classList.toggle('active', i === idx));
      panels.forEach((p, i) => p.classList.toggle('active', i === idx));
    }
    btns.forEach((btn, i) => btn.addEventListener('click', () => activate(i)));
    activate(0);
  });
}

/* ── Copy to Clipboard ── */
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 복사됨`;
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1800);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

function initCopyBtns(root) {
  (root || document).querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => copyText(btn.getAttribute('data-copy'), btn));
  });
}

/* ── Color Card (click to copy hex) ── */
function initColorCards(root) {
  (root || document).querySelectorAll('.color-card[data-hex]').forEach(card => {
    card.addEventListener('click', () => {
      const hex = card.getAttribute('data-hex');
      const cssVar = card.getAttribute('data-var') || hex;
      navigator.clipboard.writeText(cssVar).catch(() => {});
      card.classList.add('flashing');
      setTimeout(() => card.classList.remove('flashing'), 900);
    });
  });
}

/* ── Sidebar Search ── */
function initSidebarSearch() {
  const input = document.getElementById('sidebar-search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) {
      document.querySelectorAll('[data-searchable]').forEach(el => el.closest('.color-card, .brand-card, .semantic-card')?.style.removeProperty('display'));
      return;
    }
    document.querySelectorAll('[data-searchable]').forEach(el => {
      const text = el.getAttribute('data-searchable').toLowerCase();
      const card = el.closest('.color-card, .brand-card, .semantic-card');
      if (card) card.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

/* ── Filter Buttons ── */
function initFilterBtns() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('[data-category]');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      cards.forEach(card => {
        card.style.display = (cat === 'all' || card.getAttribute('data-category') === cat) ? '' : 'none';
      });
    });
  });
}

/* ── Semantic Theme Toggle ── */
function initThemeToggle() {
  const btns = document.querySelectorAll('[data-mode]');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');
      document.querySelectorAll('.semantic-swatch[data-light][data-dark]').forEach(swatch => {
        swatch.style.backgroundColor = mode === 'dark'
          ? swatch.getAttribute('data-dark')
          : swatch.getAttribute('data-light');
      });
      document.querySelectorAll('.ref-tag').forEach(tag => {
        tag.style.display = (tag.classList.contains(mode)) ? '' : 'none';
      });
    });
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.innerHTML = renderSidebar();

  initMobile();
  initTabs();
  initCopyBtns();
  initColorCards();
  initSidebarSearch();
  initFilterBtns();
  initThemeToggle();
});
