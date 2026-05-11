/* ============================================================
   SW Design System · registry-loader.js
   Registry JSON 공통 fetch 유틸리티
   ============================================================ */

const REGISTRY_BASE = (() => {
  return window.location.pathname.includes('/pages/') ? '../' : './';
})();

async function loadJson(path) {
  const url = path.startsWith('http') ? path : REGISTRY_BASE + path;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: await res.json(), error: null };
  } catch (err) {
    return { data: null, error: `Failed to load "${path}": ${err.message}` };
  }
}

async function loadRegistryIndex() {
  return loadJson('registry/index.json');
}

/* dotKey: "tokens.foundation.colors" → index.tokens.foundation.colors */
async function loadRegistryResource(dotKey) {
  const { data: index, error } = await loadRegistryIndex();
  if (error) return { data: null, error };
  const parts = dotKey.split('.');
  let node = index;
  for (const p of parts) {
    if (node == null || typeof node !== 'object') { node = undefined; break; }
    node = node[p];
  }
  if (typeof node !== 'string') return { data: null, error: `Key not found in registry index: ${dotKey}` };
  return loadJson(node);
}

async function loadAllCoreRegistry() {
  const { data: index, error: indexErr } = await loadRegistryIndex();
  if (indexErr) return { data: null, error: indexErr };
  const [fc, sc, ct] = await Promise.all([
    loadJson(index.tokens.foundation.colors),
    loadJson(index.tokens.semantic.colors),
    loadJson(index.tokens.component),
  ]);
  return {
    data: { index, foundationColors: fc.data, semanticColors: sc.data, componentTokens: ct.data },
    error: fc.error || sc.error || ct.error || null,
  };
}

async function loadAllComponents(index) {
  const entries = Object.entries(index.components);
  const results = await Promise.all(entries.map(([key, path]) => loadJson(path)));
  const map = {};
  entries.forEach(([key], i) => { map[key] = results[i].data; });
  return map;
}

function renderError(container, message) {
  container.innerHTML = `
    <div class="registry-error-box">
      <div class="registry-error-title">⚠ Registry 로드 실패</div>
      <div class="registry-error-msg">${escapeHtml(message)}</div>
      <div class="registry-error-hint">
        로컬 서버에서 실행하세요:<br>
        <code>python3 -m http.server</code> 또는 VS Code Live Server
      </div>
    </div>`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
