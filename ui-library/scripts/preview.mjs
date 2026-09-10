/**
 * preview.mjs — "무엇을 골라야 하나" 를 눈으로 보는 한 장짜리 미리보기
 * --------------------------------------------------------------------------
 * 개발자는 이름만 보고 컴포넌트를 고를 수 없다(Chip 과 Filter Chip 의 차이 같은 것).
 * 그래서 배포본 안에 브라우저로 바로 열리는 목록 한 장을 함께 낸다.
 *
 *   - 승인된 예제 마크업을 **그대로** 얹는다(새로 쓰지 않는다) → 실제 모습 그대로다.
 *   - 옆에 React·Vue 이름, 고를 수 있는 크기·변형, "언제 쓰나 / 이럴 땐 다른 걸" 을 붙인다.
 *   - 빌드 도구가 필요 없다 — 파일을 더블클릭하면 열린다.
 */

const GENERATED_NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.";

const pascal = (value) => value.replace(/(^|-)([a-z0-9])/g, (_, __, character) => character.toUpperCase());
const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 예제 파일에는 인스턴스가 여러 벌 있을 수 있다 — 미리보기는 그 전부를 보여준다. */
function instances(html, id) {
  const cleaned = html.replace(/<!--[\s\S]*?-->/g, "");
  const found = [];
  const pattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  let depth = 0;
  let openDepth = null;
  let start = null;
  let match;
  while ((match = pattern.exec(cleaned)) !== null) {
    const [full, closing, tag, attributes, selfClosing] = match;
    const isVoid = selfClosing === "/" || voidElements.has(tag.toLowerCase());
    if (closing) {
      depth -= 1;
      if (openDepth !== null && depth === openDepth) {
        found.push(cleaned.slice(start, match.index + full.length));
        openDepth = null;
      }
      continue;
    }
    if (openDepth === null && new RegExp(`data-s1-component\\s*=\\s*["']${id}["']`).test(attributes)) {
      if (isVoid) { found.push(full); continue; }
      openDepth = depth;
      start = match.index;
    }
    if (!isVoid) depth += 1;
  }
  return found;
}

function listItems(items) {
  if (!items || items.length === 0) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function componentSection({ id, manifest, exampleByBreak, usage }) {
  const name = `S1${pascal(id)}`;
  const breaks = manifest.breaks ?? {};
  const sizeGroups = Object.entries(breaks).filter(([, sizes]) => sizes.length > 0);
  const sizeLine = (manifest.sizes ?? []).length
    ? sizeGroups.length
      ? sizeGroups.map(([breakName, sizes]) => `${breakName === "mobile" ? "모바일" : "PC"} <code>${sizes.join("</code> <code>")}</code>`).join(" · ")
      : `<code>${manifest.sizes.join("</code> <code>")}</code>`
    : "크기 축 없음";
  const variantLine = (manifest.variants ?? []).length > 1
    ? `<code>${manifest.variants.join("</code> <code>")}</code>`
    : "변형 없음";

  const samples = Object.entries(exampleByBreak).map(([breakName, html]) => {
    const found = instances(html, id);
    if (found.length === 0) return "";
    return `<div class="sample">
            <div class="sample-label">${escapeHtml(breakName)}</div>
            <div class="sample-stage" data-break="${escapeHtml(breakName)}">${found.join("\n")}</div>
          </div>`;
  }).join("\n          ");

  return `      <section class="component" id="${escapeHtml(id)}">
        <header class="component-head">
          <div>
            <h2>${escapeHtml(name)}</h2>
            <p class="component-id">React·Vue 이름 · 마크업은 <code>data-s1-component="${escapeHtml(id)}"</code></p>
          </div>
          <dl class="component-axes">
            <dt>크기</dt><dd>${sizeLine}</dd>
            <dt>변형</dt><dd>${variantLine}</dd>
          </dl>
        </header>
        <div class="component-body">
          <div class="samples">
          ${samples}
          </div>
          <div class="component-usage">
            <div class="usage-block">
              <div class="usage-title">언제 쓰나</div>
              ${listItems(usage?.whenToUse)}
            </div>
            <div class="usage-block usage-block-avoid">
              <div class="usage-title">이럴 땐 다른 걸</div>
              ${listItems(usage?.whenNotToUse)}
            </div>
          </div>
        </div>
      </section>`;
}

export function buildPreviewPage({ componentOutputs, usageById, version, canonicalFingerprint }) {
  const approved = componentOutputs.filter(({ manifest }) => manifest.status === "approved");
  const index = approved
    .map(({ id }) => `<a href="#${id}">S1${pascal(id)}</a>`)
    .join("\n        ");
  const sections = approved
    .map(({ id, manifest, exampleByBreak }) => componentSection({ id, manifest, exampleByBreak, usage: usageById[id] }))
    .join("\n");

  return `<!DOCTYPE html>
<!-- ${GENERATED_NOTE} -->
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>S1 UI 컴포넌트 미리보기 — ${approved.length}종</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/typography.css">
  <link rel="stylesheet" href="s1-ui.css">
  <style>
    body { margin:0; background:#f6f7f9; color:#111827;
           font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    .page { max-width:1080px; margin:0 auto; padding:40px 24px 80px; }
    .page-head h1 { font-size:24px; margin:0 0 6px; }
    .page-head p { margin:0; color:#6b7280; font-size:13px; line-height:1.7; }
    .fingerprint { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px; color:#9ca3af; word-break:break-all; }
    .index { display:flex; flex-wrap:wrap; gap:7px; margin:22px 0 32px; }
    .index a { padding:5px 11px; border-radius:999px; background:#fff; border:1px solid #e5e7eb;
               color:#374151; font-size:12px; font-weight:600; text-decoration:none; }
    .index a:hover { border-color:#1d6ceb; color:#1d6ceb; }
    .component { background:#fff; border:1px solid #e5e7eb; border-radius:14px; margin-bottom:18px; overflow:hidden; scroll-margin-top:16px; }
    .component-head { display:flex; gap:16px; justify-content:space-between; flex-wrap:wrap;
                      padding:16px 20px; background:#fafafa; border-bottom:1px solid #e5e7eb; }
    .component-head h2 { margin:0; font-size:16px; }
    .component-id { margin:3px 0 0; font-size:11.5px; color:#9ca3af; }
    .component-axes { display:grid; grid-template-columns:auto 1fr; gap:2px 10px; margin:0; font-size:11.5px; color:#4b5563; }
    .component-axes dt { font-weight:700; color:#9ca3af; }
    .component-axes dd { margin:0; }
    .component-body { display:grid; grid-template-columns:minmax(0,1fr) 300px; gap:0; }
    @media (max-width:860px) { .component-body { grid-template-columns:minmax(0,1fr); } }
    .samples { padding:20px; display:flex; flex-direction:column; gap:18px; min-width:0; }
    .sample-label { font-size:10.5px; font-weight:700; color:#9ca3af; text-transform:uppercase; margin-bottom:8px; }
    .sample-stage { display:flex; flex-wrap:wrap; align-items:flex-start; gap:14px; }
    .sample-stage[data-break="mobile"], .sample-stage[data-break="password-mobile"], .sample-stage[data-break="search-mobile"] { max-width:380px; }
    .component-usage { padding:20px; background:#fcfcfd; border-left:1px solid #f0f1f3; font-size:12px; color:#4b5563; }
    @media (max-width:860px) { .component-usage { border-left:none; border-top:1px solid #f0f1f3; } }
    .usage-block + .usage-block { margin-top:14px; }
    .usage-title { font-size:11px; font-weight:700; color:#111827; margin-bottom:5px; }
    .usage-block-avoid .usage-title { color:#c2410c; }
    .component-usage ul { margin:0; padding-left:16px; line-height:1.7; }
    code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px;
           background:#f3f4f6; padding:1px 5px; border-radius:4px; color:#1d6ceb; }
  </style>
</head>
<body>
  <div class="page">
    <div class="page-head">
      <h1>S1 UI 컴포넌트 미리보기 — ${approved.length}종</h1>
      <p>이 페이지는 배포본에 들어 있는 마크업을 그대로 얹어 그린 것입니다. 여기 보이는 모습이 실제 모습입니다.<br>
         React·Vue 는 제목의 이름을 그대로 부르면 됩니다. 크기·변형은 각 이름 옆에 적힌 값만 쓸 수 있습니다.</p>
      <p class="fingerprint">버전 ${escapeHtml(version)} · 정본 지문 ${escapeHtml(canonicalFingerprint)}</p>
    </div>
    <nav class="index">
        ${index}
    </nav>
${sections}
  </div>
  <script type="module">
    import { autoInit } from "./s1-ui.auto.js";
    autoInit();
  </script>
</body>
</html>
`;
}
