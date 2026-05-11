/* ============================================================
   SW Design System · token-renderer.js
   Foundation / Semantic / Component Token 렌더링
   ============================================================ */

/* ── Color chip ── */
function createColorChip(value) {
  const chip = document.createElement('span');
  chip.className = 'color-chip';
  if (value) chip.style.background = value.trim();
  return chip;
}

/* ── Status badge ── */
function statusBadge(status) {
  const cls = { stable: 'badge-stable', candidate: 'badge-candidate', planned: 'badge-planned', deprecated: 'badge-deprecated' }[status] || 'badge-unknown';
  return `<span class="registry-badge ${cls}">${status}</span>`;
}

/* ── Foundation Colors ──
   data.color: { gray: { "0": { value, cssVar, status }, ... }, ... }
*/
function renderFoundationColors(container, data) {
  if (!data || !data.color) { container.innerHTML = '<p>데이터 없음</p>'; return; }

  const groupOrder = ['base','brand','gray','grayDark','blue','blueDark','red','redDark','orange','orangeDark',
    'yellow','yellowDark','green','greenDark','skyblue','skyblueDark','purple','purpleDark',
    'brown','brownDark','visualGray','coolgrayDark','statusDarkAlias'];

  const groups = groupOrder.filter(g => data.color[g]);
  let html = '';

  for (const group of groups) {
    const tokens = data.color[group];
    const label = group.replace(/([A-Z])/g, ' $1').trim();
    html += `<div class="registry-group">
      <h3 class="registry-group-title">${label}</h3>
      <div class="color-palette-grid">`;

    const entries = typeof tokens === 'object' && !Array.isArray(tokens) ? Object.entries(tokens) : [];
    for (const [step, tok] of entries) {
      html += `<div class="color-swatch-item">
        <div class="color-swatch" style="background:${tok.value}" title="${tok.value}"></div>
        <div class="color-swatch-var">${tok.cssVar}</div>
        <div class="color-swatch-val">${tok.value}</div>
        <div class="color-swatch-step">${step}</div>
        ${statusBadge(tok.status)}
      </div>`;
    }
    html += `</div></div>`;
  }
  container.innerHTML = html;
}

/* ── Semantic Colors ──
   data.tokens: { bg: [...], text: [...], ... }
   each item: { cssVar, light, dark, status, note? }
*/
function renderSemanticColors(container, data, theme = 'both') {
  if (!data || !data.tokens) { container.innerHTML = '<p>데이터 없음</p>'; return; }

  const categoryLabels = {
    bg: '배경 (Background)',
    surface: '표면 (Surface)',
    text: '텍스트 (Text)',
    border: '테두리 (Border)',
    icon: '아이콘 (Icon)',
    action: '액션 (Action)',
    status: '상태 (Status)',
    overlay: '오버레이 (Overlay)',
  };

  let html = '';
  for (const [cat, tokens] of Object.entries(data.tokens)) {
    const label = categoryLabels[cat] || cat;
    html += `<div class="registry-group sem-group" id="sem-${cat}">
      <h3 class="registry-group-title">${label} <span class="token-count">${tokens.length}종</span></h3>
      <div class="sem-token-table">
        <div class="sem-table-head">
          <span>CSS 변수</span><span>Light</span><span>Dark</span><span>Status</span>
        </div>`;

    for (const tok of tokens) {
      const noteHtml = tok.note ? `<div class="sem-note">${escapeHtml(tok.note)}</div>` : '';
      const rgbaHint = tok.rgbaException ? `<span class="rgba-badge">rgba</span>` : '';
      html += `<div class="sem-token-row ${tok.status === 'candidate' ? 'is-candidate' : ''}">
        <div class="sem-token-var">
          <span class="copy-token" title="복사" data-copy="${tok.cssVar}">${tok.cssVar}</span>
          ${rgbaHint}
          ${noteHtml}
        </div>
        <div class="sem-token-light">
          ${createColorChipHtml(tok.light)}
          <code>${escapeHtml(tok.light)}</code>
        </div>
        <div class="sem-token-dark">
          ${createColorChipHtml(tok.dark)}
          <code>${escapeHtml(tok.dark)}</code>
        </div>
        <div>${statusBadge(tok.status)}</div>
      </div>`;
    }
    html += `</div></div>`;
  }
  container.innerHTML = html;
  bindCopyTokens(container);
}

/* ── Component Tokens ──
   data.tokens: {
     button: { primary: [...], secondary: [...], ghost: [...] },
     chip: [...],
     ...
   }
*/
function renderComponentTokens(container, data) {
  if (!data || !data.tokens) { container.innerHTML = '<p>데이터 없음</p>'; return; }

  let html = '';
  for (const [comp, variants] of Object.entries(data.tokens)) {
    html += `<div class="registry-group" id="ct-${comp}">
      <h3 class="registry-group-title">${comp.charAt(0).toUpperCase() + comp.slice(1)}</h3>`;

    if (Array.isArray(variants)) {
      html += renderTokenRows(variants);
    } else {
      for (const [variant, rows] of Object.entries(variants)) {
        if (Array.isArray(rows)) {
          html += `<h4 class="registry-variant-title">${variant}</h4>` + renderTokenRows(rows);
        }
      }
    }
    html += `</div>`;
  }
  container.innerHTML = html;
  bindCopyTokens(container);
}

function renderTokenRows(rows) {
  let html = `<div class="ct-token-table">
    <div class="ct-table-head"><span>CSS 변수</span><span>값</span><span>Status</span></div>`;
  for (const tok of rows) {
    html += `<div class="ct-token-row">
      <div class="ct-token-var">
        <span class="copy-token" title="복사" data-copy="${tok.cssVar}">${tok.cssVar}</span>
      </div>
      <div class="ct-token-val">
        ${createColorChipHtml(tok.value)}
        <code>${escapeHtml(tok.value)}</code>
      </div>
      <div>${statusBadge(tok.status)}</div>
    </div>`;
  }
  return html + '</div>';
}

/* ── Helpers ── */
function createColorChipHtml(value) {
  if (!value) return '';
  return `<span class="color-chip" style="background:${value.trim()}"></span>`;
}

function bindCopyTokens(container) {
  container.querySelectorAll('.copy-token').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(el.dataset.copy).then(() => {
        const orig = el.textContent;
        el.textContent = '복사됨!';
        setTimeout(() => { el.textContent = orig; }, 1200);
      });
    });
  });
}
