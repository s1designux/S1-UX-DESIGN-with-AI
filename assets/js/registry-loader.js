/* ============================================================
   S1 UX DESIGN GUIDE · registry-loader.js
   Registry JSON 공통 로드 유틸리티
   - window.REGISTRY_BUNDLE (registry-data-bundle.js) 우선 사용
   - 번들 없을 때만 fetch fallback (로컬 서버 환경)
   ============================================================ */

const REGISTRY_BASE = (() => {
  return window.location.pathname.includes('/pages/') ? '../' : './';
})();

/* path → bundle 내부 데이터 조회
   index의 모든 경로를 재귀 순회하여 relPath와 일치하는 번들 데이터를 반환 */
function _fromBundle(relPath) {
  const b = window.REGISTRY_BUNDLE;
  if (!b) return undefined;
  if (relPath === 'registry/index.json') return b.index;

  // index 구조와 bundle 데이터 구조를 동시에 재귀 탐색
  function walk(indexNode, dataNode) {
    if (typeof indexNode === 'string') {
      return indexNode === relPath ? dataNode : undefined;
    }
    if (indexNode && typeof indexNode === 'object') {
      for (const key of Object.keys(indexNode)) {
        const found = walk(indexNode[key], dataNode?.[key]);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  }

  // tokens
  const fromTokens = walk(b.index?.tokens, b.tokens);
  if (fromTokens !== undefined) return fromTokens;

  // componentIndex
  if (relPath === b.index?.componentIndex) return b.componentIndex;

  // components
  const compIdx = b.index?.components || {};
  for (const [key, p] of Object.entries(compIdx)) {
    if (relPath === p) return b.components?.[key];
  }

  // figma
  if (relPath === b.index?.figma) return b.figma;

  // governance
  const fromGov = walk(b.index?.governance, b.governance);
  if (fromGov !== undefined) return fromGov;

  // ai
  const fromAi = walk(b.index?.ai, b.ai);
  if (fromAi !== undefined) return fromAi;

  return undefined;
}

async function loadJson(relPath) {
  // 번들에서 먼저 찾는다
  const bundled = _fromBundle(relPath);
  if (bundled !== undefined) return { data: bundled, error: null };

  // 번들에 없으면 fetch (로컬 서버 환경)
  const url = relPath.startsWith('http') ? relPath : REGISTRY_BASE + relPath;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: await res.json(), error: null };
  } catch (err) {
    return { data: null, error: `Failed to load "${relPath}": ${err.message}` };
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
        페이지를 새로고침 하거나 로컬 서버에서 실행하세요:<br>
        <code>python3 -m http.server</code> 또는 VS Code Live Server
      </div>
    </div>`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
