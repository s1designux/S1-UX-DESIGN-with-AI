/* ============================================================
   icons.js — Icon Guide 그룹 선택·검색·필터·렌더링·복사 로직
   window.ICONS_DATA (icons-data.js) 에서 데이터를 읽는다.

   [그룹 탭] 섹션별 분리 보기 (보안·근태·식당 / 영상모니터링)
   [검색]    searchQuery가 있으면 그룹 무관 전체 통합 검색
   [필터]    Line / Solid / Color variant 필터
============================================================ */

(function () {
  'use strict';

  const FIGMA_FILE_KEY = 'YcBbW9e0MTR9T3W5Sz0Ukx';
  const FIGMA_FILE_NAME = '%EC%95%84%EC%9D%B4%EC%BD%98-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-V2.2';
  const ICONS_CDN_BASE = 'https://s1designux.github.io/S1-UX-DESIGN-with-AI/assets/icons';

  const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" stroke-dasharray="4 2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/></svg>`;

  /* ── State ── */
  let allIcons = [];
  let sections = [];
  let activeSection = 'all';
  let activeFilter = 'all';
  let searchQuery = '';
  let cardVariants = {};
  let svgVisible = {};

  /* ── DOM refs ── */
  const grid        = document.getElementById('iconGrid');
  const searchInput = document.getElementById('iconSearch');
  const filterBtns  = document.querySelectorAll('.icon-filter-btn[data-filter]');
  const countEl     = document.getElementById('iconVisibleCount');
  const totalCountEl = document.getElementById('iconTotalCount');
  const groupNav    = document.getElementById('iconGroupNav');
  const searchHint  = document.getElementById('iconSearchHint');

  /* ── Init ── */
  function init() {
    if (!window.ICONS_DATA || !window.ICONS_DATA.icons) {
      grid.innerHTML = '<div class="icon-empty"><div class="icon-empty-title">데이터를 불러올 수 없습니다</div><div style="font-size:12px;color:#9ca3af;margin-top:4px;">icons-data.js 파일을 확인하세요</div></div>';
      return;
    }

    allIcons = window.ICONS_DATA.icons;
    sections = window.ICONS_DATA.sections || [{ id: 'all', name: '전체' }];

    allIcons.forEach(ic => {
      cardVariants[ic.id] = 'line';
      svgVisible[ic.id] = false;
    });

    buildGroupNav();
    render();
  }

  /* ── Group Nav ── */
  function buildGroupNav() {
    if (!groupNav) return;

    groupNav.innerHTML = sections.map(sec => {
      const count = sec.id === 'all'
        ? allIcons.length
        : allIcons.filter(ic => ic.section === sec.id).length;
      return '<button class="icon-group-btn' + (sec.id === activeSection ? ' is-active' : '') + '" data-section="' + escHtml(sec.id) + '">' +
        escHtml(sec.name) + '<span class="icon-group-count">' + count + '</span>' +
        '</button>';
    }).join('');

    groupNav.querySelectorAll('.icon-group-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSection = btn.dataset.section;
        groupNav.querySelectorAll('.icon-group-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        updateSearchHint();
        render();
      });
    });
  }

  /* ── Search ── */
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    updateSearchHint();
    render();
  });

  function updateSearchHint() {
    if (!searchHint) return;
    if (searchQuery && activeSection !== 'all') {
      searchHint.classList.add('is-visible');
    } else {
      searchHint.classList.remove('is-visible');
    }
  }

  /* ── Filter (variant) ── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      render();
    });
  });

  /* ── Match logic ── */
  function matchesSearch(icon) {
    if (!searchQuery) return true;
    const q = searchQuery;
    if (icon.name.toLowerCase().includes(q)) return true;
    if (icon.id.toLowerCase().includes(q)) return true;
    if (icon.description.toLowerCase().includes(q)) return true;
    if (icon.keywords.some(k => k.toLowerCase().includes(q))) return true;
    if (icon.properties.type.some(t => t.toLowerCase().includes(q))) return true;
    return false;
  }

  function matchesFilter(icon) {
    if (activeFilter === 'all') return true;
    return icon.properties.type.includes(activeFilter);
  }

  /* 검색 시에는 그룹 무관 전체 통합 — searchQuery가 있으면 section 필터 무시 */
  function matchesSection(icon) {
    if (searchQuery) return true;
    if (activeSection === 'all') return true;
    return icon.section === activeSection;
  }

  /* ── Render ── */
  function render() {
    const sectionIcons = allIcons.filter(ic => matchesSection(ic));
    const visible = sectionIcons.filter(ic => matchesSearch(ic) && matchesFilter(ic));

    const totalInContext = searchQuery ? allIcons.length : sectionIcons.length;
    countEl.textContent = visible.length;

    if (totalCountEl) totalCountEl.textContent = totalInContext;

    if (visible.length === 0) {
      grid.innerHTML = '<div class="icon-empty"><div class="icon-empty-title">검색 결과가 없습니다</div><div style="font-size:12px;color:#9ca3af;margin-top:4px;">"' + escHtml(searchQuery || activeFilter) + '" 로 매칭되는 아이콘이 없습니다</div></div>';
      return;
    }

    grid.innerHTML = visible.map(ic => renderCard(ic)).join('');
    attachCardEvents();
  }

  /* ── Card HTML ── */
  function renderCard(icon) {
    const variant = cardVariants[icon.id] || 'line';
    const variantData = icon.variants[variant] || {};
    const png    = variantData.png  || '';
    const svg    = variantData.svg  || '';
    const hasPng = png.trim().length > 0;
    const hasSvg = svg.trim().length > 0;
    const svgShow = svgVisible[icon.id];
    const figmaNodeId = variantData.figmaNodeId || icon.figmaNodeId;
    const figmaUrl = 'https://www.figma.com/design/' + FIGMA_FILE_KEY + '/' + FIGMA_FILE_NAME + '?node-id=' + figmaNodeId.replace(':', '-');

    const variantTabs = ['line', 'solid', 'color']
      .filter(v => icon.properties.type.includes(v))
      .map(v => '<button class="icon-variant-tab' + (v === variant ? ' is-active' : '') + '" data-variant="' + v + '" data-id="' + escHtml(icon.id) + '">' + v + '</button>')
      .join('');

    // 미리보기: PNG 우선, 없으면 SVG 인라인, 없으면 플레이스홀더
    let previewHtml;
    if (hasPng) {
      previewHtml = '<div class="icon-preview has-png">' +
        '<img src="' + escHtml(png) + '" width="28" height="28" alt="' + escHtml(icon.name + ' ' + variant) + '" loading="lazy">' +
        '</div>';
    } else if (hasSvg) {
      previewHtml = '<div class="icon-preview has-svg">' + svg + '</div>';
    } else {
      previewHtml = '<div class="icon-preview"><div class="icon-preview-placeholder">' + PLACEHOLDER_SVG + '<span>PNG 필요</span></div></div>';
    }

    // 하단 토글 영역: PNG 공개 URL 또는 SVG 코드
    const pngFilename = hasPng ? png.split('/').pop() : '';
    const publicUrl   = hasPng ? (ICONS_CDN_BASE + '/' + pngFilename) : '';
    const toggleLabel = hasPng ? '▼ URL' : (hasSvg ? '▼ SVG' : '▼');
    let detailAreaHtml;
    if (hasPng) {
      detailAreaHtml = '<div class="icon-png-path">' + escHtml(publicUrl) + '</div>';
    } else if (hasSvg) {
      detailAreaHtml = '<div class="icon-svg-code">' + escHtml(svg) + '</div>';
    } else {
      detailAreaHtml = '<div class="icon-svg-empty">export-icons-png.js 를 실행해<br>PNG를 생성하세요<br><br><code>' + escHtml(figmaNodeId) + '</code></div>';
    }

    const keywordText = icon.keywords.slice(0, 8).join(', ');

    return '\n<div class="icon-card" data-icon-id="' + escHtml(icon.id) + '">\n' +
      '  ' + previewHtml + '\n' +
      '  <div class="icon-variant-tabs">' + variantTabs + '</div>\n' +
      '  <div class="icon-name" title="' + escHtml(icon.name) + '">' + escHtml(icon.name) + '</div>\n' +
      '  <div class="icon-keywords">' + (escHtml(keywordText) || '—') + '</div>\n' +
      '  <div class="icon-meta-row">\n' +
      '    <button class="icon-svg-toggle-btn" data-id="' + escHtml(icon.id) + '">' + (svgShow ? '▲ 숨기기' : toggleLabel) + '</button>\n' +
      '    <a class="icon-figma-link" href="' + figmaUrl + '" target="_blank" title="Figma에서 열기">\n' +
      '      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.332 8.668a3.333 3.333 0 0 0 0-6.663H8.668a3.333 3.333 0 0 0 0 6.663 3.333 3.333 0 0 0 0 6.665 3.333 3.333 0 1 0 3.332 3.332V8.668h3.332z"/><circle cx="15.332" cy="5.336" r="3.332"/></svg>\n' +
      '      Figma\n' +
      '    </a>\n' +
      '  </div>\n' +
      '  <div class="icon-svg-area' + (svgShow ? ' is-visible' : '') + '" id="svg-area-' + escHtml(icon.id) + '">\n' +
      '    ' + detailAreaHtml + '\n' +
      '  </div>\n' +
      '  <div class="icon-actions">\n' +
      (hasPng
        ? '    <button class="icon-action-btn" data-action="copy-png-path" data-id="' + escHtml(icon.id) + '">URL 복사</button>\n'
        : '    <button class="icon-action-btn" data-action="copy-svg" data-id="' + escHtml(icon.id) + '" ' + (hasSvg ? '' : 'disabled') + '>SVG 복사</button>\n'
      ) +
      '    <button class="icon-action-btn" data-action="copy-name" data-id="' + escHtml(icon.id) + '">이름 복사</button>\n' +
      '  </div>\n' +
      '</div>';
  }

  /* ── Events ── */
  function attachCardEvents() {
    grid.querySelectorAll('.icon-variant-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const id = tab.dataset.id;
        cardVariants[id] = tab.dataset.variant;
        rerenderCard(id);
      });
    });

    grid.querySelectorAll('.icon-svg-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        svgVisible[id] = !svgVisible[id];
        rerenderCard(id);
      });
    });

    grid.querySelectorAll('.icon-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const icon = allIcons.find(ic => ic.id === id);
        if (!icon) return;

        if (action === 'copy-png-path') {
          const variant = cardVariants[id] || 'line';
          const localPng = icon.variants[variant] && icon.variants[variant].png || '';
          if (!localPng) return;
          const filename = localPng.split('/').pop();
          const publicUrl = ICONS_CDN_BASE + '/' + filename;
          copyToClipboard(publicUrl, btn);
        } else if (action === 'copy-svg') {
          const variant = cardVariants[id] || 'line';
          const svg = icon.variants[variant] && icon.variants[variant].svg || '';
          if (!svg) return;
          copyToClipboard(svg, btn);
        } else if (action === 'copy-name') {
          copyToClipboard(icon.name, btn);
        }
      });
    });
  }

  /* ── Rerender single card ── */
  function rerenderCard(id) {
    const icon = allIcons.find(ic => ic.id === id);
    if (!icon) return;
    const card = grid.querySelector('.icon-card[data-icon-id="' + CSS.escape(id) + '"]');
    if (!card) return;
    const temp = document.createElement('div');
    temp.innerHTML = renderCard(icon);
    const newCard = temp.firstElementChild;
    card.replaceWith(newCard);
    attachCardEvents();
  }

  /* ── Clipboard ── */
  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = '복사됨 ✓';
      btn.classList.add('is-copied');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('is-copied');
      }, 1500);
    });
  }

  /* ── Escape HTML ── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Start ── */
  init();
})();
