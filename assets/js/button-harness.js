/* ============================================================
   SW Design System · button-harness.js
   Button 전용 Harness — registry/components/button.json 기반
   ============================================================ */

async function loadButtonRegistry() {
  const { data: index, error: idxErr } = await loadRegistryIndex();
  if (idxErr) return { data: null, error: idxErr };
  return loadJson(index.components.button);
}

async function loadButtonTokens() {
  const { data: index, error: idxErr } = await loadRegistryIndex();
  if (idxErr) return { data: null, error: idxErr };
  const { data, error } = await loadJson(index.tokens.component);
  if (error) return { data: null, error };
  return { data: data?.tokens?.button || null, error: null };
}

/* ── Token usage render ── */
function renderButtonTokenUsage(container, buttonTokens) {
  if (!buttonTokens) { container.innerHTML = '<p style="color:#9ca3af">토큰 데이터 없음</p>'; return; }

  const sections = [
    { label: 'Background', key: null, items: [] },
  ];

  let html = '';
  const renderVariant = (variantName, tokens) => {
    if (!Array.isArray(tokens)) return '';
    let rows = '';
    for (const tok of tokens) {
      rows += `<div class="btn-token-row">
        <span class="color-chip" style="background:var(${tok.cssVar})"></span>
        <code class="btn-token-var">${tok.cssVar}</code>
        <code class="btn-token-val">${escapeHtml(tok.value)}</code>
        <span class="registry-badge ${tok.status === 'stable' ? 'badge-stable' : tok.status === 'deprecated' ? 'badge-deprecated' : 'badge-candidate'}">${tok.status}</span>
      </div>`;
    }
    return `<div class="btn-token-variant"><h4>${variantName}</h4>${rows}</div>`;
  };

  const OFFICIAL_VARIANTS = ['primary', 'secondary', 'blue-line'];
  for (const [variant, tokens] of Object.entries(buttonTokens)) {
    if (Array.isArray(tokens) && OFFICIAL_VARIANTS.includes(variant)) {
      html += renderVariant(variant, tokens);
    }
  }

  container.innerHTML = `<div class="btn-token-list">${html}</div>`;
}

/* ── Registry status render ── */
function renderButtonRegistryStatus(container, button) {
  if (!button || !button._meta) { container.innerHTML = '<p>Registry 없음</p>'; return; }
  const meta = button._meta;
  const summary = button.summary || {};

  const statusMap = {
    'stable': '✅ Stable',
    'implemented': '✅ Implemented',
    'in-progress': '🔄 In progress',
    'not-started': '⬜ Not started',
    'planned': '📅 Planned',
    'candidate': '🟡 Candidate',
    'pending': '⬜ Pending',
  };

  const row = (label, value) =>
    `<div class="reg-status-row"><span class="reg-status-label">${label}</span><span class="reg-status-val">${value}</span></div>`;

  const pendingList = (button.pendingVariants || []).map(v =>
    `<li><strong>${v.name}</strong> — ${escapeHtml(v.reason)}</li>`
  ).join('');

  container.innerHTML = `
    <div class="reg-status-grid">
      ${row('Version', meta.version || '—')}
      ${row('Token Status', statusMap[meta.tokenStatus] || meta.tokenStatus)}
      ${row('Code Status', statusMap[meta.codeStatus] || meta.codeStatus)}
      ${row('Dark Mode', statusMap[meta.darkModeStatus] || meta.darkModeStatus)}
      ${row('A11y', statusMap[meta.a11yStatus] || meta.a11yStatus)}
      ${row('Harness', meta.harnessStatus || '—')}
      ${summary.variantCount ? row('Variants', summary.variantCount + '개') : ''}
      ${summary.pcSizeCount ? row('PC Sizes', summary.pcSizeCount + '개') : ''}
      ${summary.mobileSizeCount ? row('Mobile Sizes', summary.mobileSizeCount + '개') : ''}
    </div>
    ${pendingList ? `<div class="reg-pending-section"><h4>Pending Variants</h4><ul>${pendingList}</ul></div>` : ''}
    ${meta.notes && meta.notes.length ? `<ul class="reg-notes-list">${meta.notes.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ul>` : ''}`;
}

/* ── Theme toggle ── */
function setupThemeToggle() {
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.themeToggle;
      const preview = document.getElementById('button-preview') || document.documentElement;
      if (theme === 'dark') {
        preview.setAttribute('data-theme', 'dark');
      } else {
        preview.removeAttribute('data-theme');
      }
      document.querySelectorAll('[data-theme-toggle]').forEach(b =>
        b.classList.toggle('active', b.dataset.themeToggle === theme)
      );
    });
  });
}

/* ── Platform toggle ── */
function setupPlatformToggle() {
  document.querySelectorAll('[data-platform-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const platform = btn.dataset.platformToggle;
      const preview = document.getElementById('button-preview');
      if (preview) {
        preview.classList.remove('view-all', 'view-pc', 'view-mobile');
        preview.classList.add(`view-${platform}`);
      }
      document.querySelectorAll('[data-platform-toggle]').forEach(b =>
        b.classList.toggle('active', b.dataset.platformToggle === platform)
      );
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
