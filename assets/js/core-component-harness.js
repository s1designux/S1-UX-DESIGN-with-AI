/* ============================================================
   SW Design System · core-component-harness.js
   registry/components/index.json 기반 Harness 컨트롤러
   ============================================================ */

let _harnessIndex = null;

async function loadComponentIndex() {
  if (_harnessIndex) return { data: _harnessIndex, error: null };
  const { data: registryIndex, error: idxErr } = await loadRegistryIndex();
  if (idxErr) return { data: null, error: idxErr };
  const result = await loadJson(registryIndex.componentIndex || 'registry/components/index.json');
  if (result.data) _harnessIndex = result.data;
  return result;
}

async function loadComponentDetail(componentPath) {
  return loadJson(componentPath);
}

/* ── Theme toggle ── */
function setPreviewTheme(theme) {
  const preview = document.querySelector('.harness-preview, #harness-preview, [data-harness-preview]');
  const target = preview || document.documentElement;
  if (theme === 'dark') {
    target.setAttribute('data-theme', 'dark');
  } else {
    target.removeAttribute('data-theme');
  }
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeBtn === theme);
  });
}

/* ── Platform toggle ── */
function setPreviewPlatform(platform) {
  document.documentElement.setAttribute('data-platform', platform);
  const preview = document.querySelector('.harness-preview, #harness-preview, [data-harness-preview]');
  if (preview) {
    preview.classList.remove('view-all', 'view-pc', 'view-mobile');
    preview.classList.add(`view-${platform}`);
  }
  document.querySelectorAll('[data-platform-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.platformBtn === platform);
  });
}

/* ── Theme toggle UI render ── */
function renderThemeToggle(container, harnessConfig) {
  const themes = harnessConfig.supportedThemes || ['light', 'dark'];
  const defaultTheme = harnessConfig.defaultTheme || 'light';
  container.innerHTML = themes.map(t =>
    `<button class="theme-btn ${t === defaultTheme ? 'active' : ''}" data-theme-btn="${t}"
      onclick="setPreviewTheme('${t}')">${t.charAt(0).toUpperCase() + t.slice(1)}</button>`
  ).join('');
}

/* ── Platform toggle UI render ── */
function renderPlatformToggle(container, harnessConfig) {
  const platforms = harnessConfig.supportedPlatforms || ['all', 'pc', 'mobile'];
  const defaultPlatform = harnessConfig.defaultPlatform || 'pc';
  container.innerHTML = platforms.map(p =>
    `<button class="theme-btn ${p === defaultPlatform ? 'active' : ''}" data-platform-btn="${p}"
      onclick="setPreviewPlatform('${p}')">${p.charAt(0).toUpperCase() + p.slice(1)}</button>`
  ).join('');
}

/* ── Component tabs render ── */
function renderComponentTabs(container, components) {
  container.innerHTML = components.map(comp =>
    `<button class="comp-nav-btn${comp.id === 'button' ? ' is-active' : ''}"
      data-comp-id="${comp.id}"
      onclick="selectHarnessComponent('${comp.id}', this)">${comp.label || comp.name}</button>`
  ).join('');
}

/* ── Select component from harness ── */
function selectHarnessComponent(compId, btnEl) {
  document.querySelectorAll('[data-comp-id]').forEach(btn => btn.classList.remove('is-active'));
  if (btnEl) btnEl.classList.add('is-active');
  document.querySelectorAll('.comp-section').forEach(el => {
    el.style.display = el.id === compId ? '' : 'none';
  });
}

/* ── Component summary render ── */
function renderComponentSummary(container, component) {
  if (!component || !component._meta) { container.innerHTML = ''; return; }
  const meta = component._meta;
  const summary = component.summary || {};
  container.innerHTML = `
    <span class="comp-badge comp-badge-blue">${meta.category || 'Core'}</span>
    ${summary.variantCount ? `<span class="comp-badge">${summary.variantCount} variants</span>` : ''}
    ${summary.pcSizeCount ? `<span class="comp-badge">PC ${summary.pcSizeCount} sizes</span>` : ''}
    ${summary.mobileSizeCount ? `<span class="comp-badge">Mobile ${summary.mobileSizeCount} size</span>` : ''}
    <span class="comp-badge" style="background:#f3f4f6;color:#${meta.codeStatus === 'in-progress' ? '0369a1' : '6b7280'}">${meta.codeStatus}</span>`;
}

/* ── Skeleton state for non-implemented components ── */
function renderSkeletonState(container, component) {
  const name = component ? (component._meta?.name || component.name || component.label) : 'Component';
  container.innerHTML = `
    <div style="padding:48px 24px;text-align:center;color:#9ca3af;background:#f9fafb;border-radius:12px;border:1px dashed #e5e7eb;">
      <div style="font-size:24px;margin-bottom:12px">📋</div>
      <div style="font-size:15px;font-weight:600;color:#374151;margin-bottom:6px">${name}</div>
      <div style="font-size:13px">이 컴포넌트는 아직 Harness 구현 전입니다.</div>
      <div style="font-size:11px;margin-top:8px;color:#d1d5db">registry status: planned</div>
    </div>`;
}

/* ── Init harness from registry ── */
async function initCoreComponentHarness(options = {}) {
  const { themeContainer, platformContainer, tabsContainer, summaryContainer } = options;

  const { data: index, error } = await loadComponentIndex();
  if (error) {
    console.warn('core-component-harness: registry load failed —', error);
    return;
  }

  const harnessCfg = index.harness || {};
  const components = index.components || [];

  if (themeContainer) renderThemeToggle(themeContainer, harnessCfg);
  if (platformContainer) renderPlatformToggle(platformContainer, harnessCfg);
  if (tabsContainer) renderComponentTabs(tabsContainer, components);

  if (summaryContainer) {
    const defaultComp = components.find(c => c.id === harnessCfg.defaultComponent);
    if (defaultComp) {
      const { data: compDetail } = await loadComponentDetail(defaultComp.path);
      if (compDetail) renderComponentSummary(summaryContainer, compDetail);
    }
  }
}
