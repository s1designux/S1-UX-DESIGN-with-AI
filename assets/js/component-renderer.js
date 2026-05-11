/* ============================================================
   SW Design System · component-renderer.js
   registry/components/*.json 기반 컴포넌트 상태 렌더링
   ============================================================ */

const CODE_STATUS_LABEL = {
  'stable':       '✅ Stable',
  'in-progress':  '🔄 In progress',
  'not-started':  '⬜ Not started',
  'planned':      '📅 Planned',
  'deprecated':   '🚫 Deprecated',
};

const DARK_STATUS_LABEL = {
  'stable':    '✅ Stable',
  'candidate': '🟡 Candidate',
  'pending':   '⬜ Pending',
  'na':        '— N/A',
};

const TOKEN_STATUS_LABEL = {
  'stable':      '✅ Stable',
  'candidate':   '🟡 Candidate',
  'not-started': '⬜ Not started',
  'planned':     '📅 Planned',
};

function renderComponentStatusBadge(status, map) {
  const label = (map || CODE_STATUS_LABEL)[status] || status;
  const cls = {
    'stable': 'badge-stable',
    'in-progress': 'badge-wip',
    'not-started': 'badge-notstarted',
    'planned': 'badge-planned',
    'deprecated': 'badge-deprecated',
    'candidate': 'badge-candidate',
    'pending': 'badge-notstarted',
  }[status] || 'badge-unknown';
  return `<span class="registry-badge ${cls}">${label}</span>`;
}

function renderComponentList(container, componentsMap) {
  let html = `<div class="component-registry-grid">`;

  for (const [key, comp] of Object.entries(componentsMap)) {
    if (!comp || !comp._meta) continue;
    const meta = comp._meta;
    const variantCount = comp.variants ? Object.keys(comp.variants).length : 0;

    html += `<div class="component-registry-card" data-id="${key}">
      <div class="comp-card-header">
        <span class="comp-card-name">${meta.name}</span>
        <span class="comp-card-category">${meta.category || 'Core'}</span>
      </div>
      <p class="comp-card-desc">${meta.description || ''}</p>
      <div class="comp-card-status-grid">
        <div class="comp-status-item">
          <span class="comp-status-label">Token</span>
          ${renderComponentStatusBadge(meta.tokenStatus, TOKEN_STATUS_LABEL)}
        </div>
        <div class="comp-status-item">
          <span class="comp-status-label">Code</span>
          ${renderComponentStatusBadge(meta.codeStatus, CODE_STATUS_LABEL)}
        </div>
        <div class="comp-status-item">
          <span class="comp-status-label">Dark</span>
          ${renderComponentStatusBadge(meta.darkModeStatus, DARK_STATUS_LABEL)}
        </div>
      </div>
      ${variantCount > 0 ? `<div class="comp-card-variants">${variantCount}개 Variant</div>` : ''}
      ${meta.notes && meta.notes.length > 0 ? `<details class="comp-card-notes"><summary>Notes (${meta.notes.length})</summary><ul>${meta.notes.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ul></details>` : ''}
    </div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
}

function renderComponentDetail(container, comp) {
  if (!comp || !comp._meta) return;
  const meta = comp._meta;
  const variantEntries = Object.entries(comp.variants || {});

  let html = `<div class="comp-detail">
    <h2>${meta.name} <small>${meta.category}</small></h2>
    <p>${meta.description || ''}</p>
    <div class="comp-detail-meta">
      <div>Token: ${renderComponentStatusBadge(meta.tokenStatus, TOKEN_STATUS_LABEL)}</div>
      <div>Code: ${renderComponentStatusBadge(meta.codeStatus, CODE_STATUS_LABEL)}</div>
      <div>Dark: ${renderComponentStatusBadge(meta.darkModeStatus, DARK_STATUS_LABEL)}</div>
      <div>Updated: ${meta.updatedAt}</div>
    </div>`;

  for (const [variant, vData] of variantEntries) {
    if (!vData) continue;
    const tokens = vData.tokens || [];
    html += `<div class="comp-variant-block">
      <h4>${variant}
        ${renderComponentStatusBadge(vData.tokenStatus, TOKEN_STATUS_LABEL)}
        ${renderComponentStatusBadge(vData.codeStatus, CODE_STATUS_LABEL)}
        ${renderComponentStatusBadge(vData.darkModeStatus, DARK_STATUS_LABEL)}
      </h4>`;
    if (tokens.length > 0) {
      html += `<ul class="comp-token-list">${tokens.map(t => `<li><code>${t}</code></li>`).join('')}</ul>`;
    }
    if (vData.openIssues) {
      html += `<ul class="comp-issues">${vData.openIssues.map(i => `<li>⚠ ${escapeHtml(i)}</li>`).join('')}</ul>`;
    }
    html += `</div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
