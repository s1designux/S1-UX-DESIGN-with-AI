/* ============================================================
   SW Design System · registry-health.js
   Registry 전체 상태 요약 렌더링
   ============================================================ */

async function renderRegistryHealth(container) {
  const { data: index, error: indexErr } = await loadRegistryIndex();
  if (indexErr) { renderError(container, indexErr); return; }

  const [
    fc, sc, ct,
    fSpacing, fRadius, fTypo, fBorder,
    sSpacing, sSizing, sRadius, sBorder,
    versions, auditRules, exceptions, deprecated
  ] = await Promise.all([
    loadJson(index.tokens.foundation.colors),
    loadJson(index.tokens.semantic.colors),
    loadJson(index.tokens.component),
    loadJson(index.tokens.foundation.spacing),
    loadJson(index.tokens.foundation.radius),
    loadJson(index.tokens.foundation.typography),
    loadJson(index.tokens.foundation.border),
    loadJson(index.tokens.semantic.spacing),
    loadJson(index.tokens.semantic.sizing),
    loadJson(index.tokens.semantic.radius),
    loadJson(index.tokens.semantic.border),
    loadJson(index.governance.versions),
    loadJson(index.governance.auditRules),
    loadJson(index.governance.tokenExceptions),
    loadJson(index.governance.deprecated),
  ]);

  // Count Foundation colors
  let foundColorCount = 0;
  if (fc.data && fc.data.color) {
    for (const group of Object.values(fc.data.color)) {
      foundColorCount += Object.keys(group).length;
    }
  }

  // Count Semantic tokens
  let semTokenCount = 0;
  if (sc.data && sc.data.tokens) {
    for (const arr of Object.values(sc.data.tokens)) {
      semTokenCount += Array.isArray(arr) ? arr.length : 0;
    }
  }

  // Count Component tokens
  let compTokenCount = 0;
  if (ct.data && ct.data.tokens) {
    for (const v of Object.values(ct.data.tokens)) {
      if (Array.isArray(v)) compTokenCount += v.length;
      else if (typeof v === 'object') {
        for (const rows of Object.values(v)) {
          if (Array.isArray(rows)) compTokenCount += rows.length;
        }
      }
    }
  }

  // Component status summary
  const componentEntries = Object.entries(index.components);
  const compResults = await Promise.all(componentEntries.map(([, path]) => loadJson(path)));
  const compMetas = compResults.map(r => r.data ? r.data._meta : null).filter(Boolean);

  const figmaPending = compMetas.filter(m => !m.figmaComponentSetKey || m.figmaComponentSetKey === '').length;
  const codePlanned = compMetas.filter(m => m.codeStatus === 'not-started' || m.codeStatus === 'planned').length;
  const darkPending = compMetas.filter(m => m.darkModeStatus === 'pending' || m.darkModeStatus === 'candidate').length;

  // candidate tokens
  let candidateCount = 0;
  if (sc.data && sc.data.tokens) {
    for (const arr of Object.values(sc.data.tokens)) {
      if (Array.isArray(arr)) candidateCount += arr.filter(t => t.status === 'candidate').length;
    }
  }

  const exceptionCount = exceptions.data ? (exceptions.data.exceptions || []).length : 0;
  const auditRuleCount = auditRules.data ? (auditRules.data.rules || []).length : 0;
  const deprecatedCount = deprecated.data ? (deprecated.data.deprecated || deprecated.data.items || []).length : 0;
  const currentVersion = index._meta.version;
  const currentPhase = index._meta.phase;

  // Pending work items
  const pendingWork = [];
  if (figmaPending > 0) pendingWork.push(`Figma componentSetKey가 비어있는 컴포넌트: ${figmaPending}개`);
  if (codePlanned > 0) pendingWork.push(`코드 미구현 컴포넌트 (not-started/planned): ${codePlanned}개`);
  if (darkPending > 0) pendingWork.push(`다크모드 미확정 컴포넌트 (pending/candidate): ${darkPending}개`);
  if (candidateCount > 0) pendingWork.push(`candidate 상태 Semantic 토큰 (승인 대기): ${candidateCount}개`);
  pendingWork.push('Portal 내 legacy 하드코딩 콘텐츠 (foundation.html, semantic.html, components.html)가 아직 남아있음');
  pendingWork.push('Button blue-line variant — Figma 설계 확정, CSS 토큰 미추출');

  let html = `
    <div class="health-header">
      <div class="health-meta">
        <span class="health-phase-badge">${currentPhase.toUpperCase()}</span>
        <span class="health-version">Registry v${currentVersion}</span>
        <span class="health-source">Source: ${index._meta.tokenSourceCss || 'registry/tokens/sw-v2.4.tokens.css'}</span>
      </div>
    </div>

    <div class="health-stats-grid">
      <div class="health-stat-card">
        <div class="health-stat-number">${foundColorCount}</div>
        <div class="health-stat-label">Foundation Colors</div>
      </div>
      <div class="health-stat-card">
        <div class="health-stat-number">${semTokenCount}</div>
        <div class="health-stat-label">Semantic Tokens</div>
      </div>
      <div class="health-stat-card">
        <div class="health-stat-number">${compTokenCount}</div>
        <div class="health-stat-label">Component Tokens</div>
      </div>
      <div class="health-stat-card">
        <div class="health-stat-number">${componentEntries.length}</div>
        <div class="health-stat-label">Components</div>
      </div>
      <div class="health-stat-card ${figmaPending > 0 ? 'is-warning' : ''}">
        <div class="health-stat-number">${figmaPending}</div>
        <div class="health-stat-label">Figma mapping 미완료</div>
      </div>
      <div class="health-stat-card ${codePlanned > 0 ? 'is-warning' : ''}">
        <div class="health-stat-number">${codePlanned}</div>
        <div class="health-stat-label">코드 미구현 컴포넌트</div>
      </div>
      <div class="health-stat-card ${darkPending > 0 ? 'is-warning' : ''}">
        <div class="health-stat-number">${darkPending}</div>
        <div class="health-stat-label">다크모드 미확정</div>
      </div>
      <div class="health-stat-card ${candidateCount > 0 ? 'is-candidate' : ''}">
        <div class="health-stat-number">${candidateCount}</div>
        <div class="health-stat-label">Candidate 토큰</div>
      </div>
      <div class="health-stat-card">
        <div class="health-stat-number">${exceptionCount}</div>
        <div class="health-stat-label">Token Exceptions</div>
      </div>
      <div class="health-stat-card">
        <div class="health-stat-number">${auditRuleCount}</div>
        <div class="health-stat-label">Audit Rules</div>
      </div>
    </div>

    <div class="health-section">
      <h3>Governance</h3>
      <div class="health-gov-grid">
        <div class="health-gov-item">
          <span class="gov-label">versions.json</span>
          <span class="badge-stable registry-badge">${versions.error ? '⚠ 오류' : '✅ 로드됨'}</span>
        </div>
        <div class="health-gov-item">
          <span class="gov-label">audit-rules.json</span>
          <span class="badge-stable registry-badge">${auditRules.error ? '⚠ 오류' : `✅ ${auditRuleCount}개 규칙`}</span>
        </div>
        <div class="health-gov-item">
          <span class="gov-label">token-exceptions.json</span>
          <span class="badge-stable registry-badge">${exceptions.error ? '⚠ 오류' : `✅ ${exceptionCount}개 예외`}</span>
        </div>
        <div class="health-gov-item">
          <span class="gov-label">deprecated.json</span>
          <span class="badge-stable registry-badge">${deprecated.error ? '⚠ 오류' : `✅ ${deprecatedCount}개 항목`}</span>
        </div>
      </div>
    </div>

    <div class="health-section">
      <h3>Pending Work</h3>
      <ul class="health-pending-list">
        ${pendingWork.map(w => `<li>${escapeHtml(w)}</li>`).join('')}
      </ul>
    </div>

    <div class="health-section">
      <h3>Component Status</h3>
      <div class="health-comp-table">
        <div class="health-comp-head"><span>Component</span><span>Token</span><span>Code</span><span>Dark</span></div>
        ${compMetas.map(m => `
          <div class="health-comp-row">
            <span class="comp-name">${m.name || m.id}</span>
            <span>${healthStatusDot(m.tokenStatus)}</span>
            <span>${healthStatusDot(m.codeStatus)}</span>
            <span>${healthStatusDot(m.darkModeStatus)}</span>
          </div>`).join('')}
      </div>
    </div>`;

  container.innerHTML = html;
}

function healthStatusDot(status) {
  const map = {
    'stable': '✅',
    'implemented': '✅',
    'in-progress': '🔄',
    'not-started': '⬜',
    'planned': '📅',
    'candidate': '🟡',
    'pending': '⬜',
    'deprecated': '🚫',
  };
  return `<span title="${status}">${map[status] || '—'} <small>${status}</small></span>`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
