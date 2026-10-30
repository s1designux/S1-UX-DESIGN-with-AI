/**
 * page-helpers.mjs — 검사 페이지 안에서 도는 계산들(window.__A)
 * --------------------------------------------------------------------------
 * 이 함수는 문자열로 페이지에 주입된다. 바깥 변수를 쓰지 않는다.
 */
export function installHelper() {
  if (window.__A) return true;
  const A = {};

  A.sel = (el) => {
    if (!el || el.nodeType !== 1) return null;
    if (el === document.body) return "body";
    if (el === document.documentElement) return "html";
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body && node !== document.documentElement) {
      if (node.id) { parts.unshift(`#${CSS.escape(node.id)}`); break; }
      let part = node.tagName.toLowerCase();
      const component = node.getAttribute("data-s1-component");
      const piece = node.getAttribute("data-s1-part");
      if (component) part += `[data-s1-component="${component}"]`;
      else if (piece) part += `[data-s1-part="${piece}"]`;
      const parent = node.parentElement;
      if (parent) {
        const same = [...parent.children].filter((child) => child.tagName === node.tagName);
        if (same.length > 1) part += `:nth-of-type(${same.indexOf(node) + 1})`;
      }
      parts.unshift(part);
      node = parent;
    }
    return parts.join(" > ");
  };

  A.vis = (el) => {
    if (!el || el.nodeType !== 1) return false;
    if (el.closest("[hidden]")) return false;
    if (!el.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true })) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  /** 보이는 것 중 i 번째에 표식을 달고 그 선택자를 돌려준다. */
  A.mark = (selector, index, name, onlyVisible) => {
    const list = [...document.querySelectorAll(selector)].filter((el) => onlyVisible === false || A.vis(el));
    const el = list[index];
    if (!el) return null;
    for (const old of document.querySelectorAll(`[data-audit-m="${name}"]`)) old.removeAttribute("data-audit-m");
    el.setAttribute("data-audit-m", name);
    return `[data-audit-m="${name}"]`;
  };

  A.rect = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    el.scrollIntoView({ block: "center", inline: "center" });
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    const covered = hit && hit !== el && !el.contains(hit) ? A.sel(hit) : null;
    return { x, y, w: r.width, h: r.height, covered };
  };

  /** 컴포넌트 루트 크기 — 숨김 의도(hidden·닫힌 패널 안)는 빼고, 보여야 하는데 0 인 것만. */
  A.componentSizes = () => {
    const out = { checked: 0, zero: [] };
    for (const el of document.querySelectorAll("[data-s1-component]")) {
      if (el.hasAttribute("hidden") || (el.parentElement && el.parentElement.closest("[hidden]"))) continue;
      if (el.parentElement && !el.parentElement.checkVisibility({ visibilityProperty: true })) continue;
      if (el.getAttribute("aria-hidden") === "true" && el.closest("[role=option],[role=checkbox]")) { /* 장식용 체크박스도 크기는 재본다 */ }
      out.checked += 1;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (cs.display === "none" || r.width === 0 || r.height === 0) {
        out.zero.push({ sel: A.sel(el), component: el.getAttribute("data-s1-component"), display: cs.display, w: r.width, h: r.height });
      }
    }
    return out;
  };

  /** 아이콘 후보: mask-image / background-image 에 url(...) 을 쓰는 요소·가상요소 중 보이는 것. */
  A.icons = () => {
    const list = [];
    let k = 0;
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest("[data-audit-skip]")) continue;
      for (const pseudo of [null, "::before", "::after"]) {
        const cs = getComputedStyle(el, pseudo);
        if (pseudo && (cs.content === "none" || cs.content === "normal")) continue;
        const source = [cs.maskImage, cs.webkitMaskImage, cs.backgroundImage].find((value) => value && value.includes("url("));
        if (!source) continue;
        if (!A.vis(el)) continue;
        const url = /url\(["']?([^"')]+)["']?\)/.exec(source)[1];
        if (url.startsWith("data:") && !url.startsWith("data:image/svg")) continue;
        const r = el.getBoundingClientRect();
        const width = pseudo ? parseFloat(cs.width) || 0 : r.width;
        const height = pseudo ? parseFloat(cs.height) || 0 : r.height;
        const key = `i${k++}`;
        el.setAttribute(`data-audit-icon-${pseudo ? pseudo.slice(2) : "self"}`, key);
        list.push({
          key, sel: A.sel(el), pseudo, url, kind: source === cs.backgroundImage ? "background" : "mask",
          box: { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height },
          w: width, h: height, paint: cs.backgroundColor
        });
      }
    }
    return list;
  };

  A.overflow = () => {
    const doc = document.documentElement;
    const limit = doc.clientWidth;
    const out = { scrollWidth: doc.scrollWidth, clientWidth: limit, offenders: [] };
    if (doc.scrollWidth <= limit + 1) return out;
    for (const el of document.querySelectorAll("body *")) {
      if (!A.vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > limit + 1) {
        const parent = el.parentElement;
        const pr = parent ? parent.getBoundingClientRect() : null;
        if (!pr || pr.right <= limit + 1 || parent === document.body) out.offenders.push({ sel: A.sel(el), right: Math.round(r.right) });
      }
      if (out.offenders.length >= 5) break;
    }
    return out;
  };

  /** 글꼴: ①Pretendard 를 지정한 부품 글자 하나(실제 렌더 글꼴을 CDP 로 읽을 대상) ②글꼴을 지정하지 않고 페이지 글꼴을 물려받는 부품 글자 목록 */
  A.fontProbe = () => {
    const out = { sel: null, family: null, undeclared: [], faces: [...document.fonts].map((face) => `${face.family}:${face.status}`).slice(0, 10) };
    const bodyFamily = getComputedStyle(document.body).fontFamily;
    const seen = new Set();
    for (const root of [...document.querySelectorAll("[data-s1-component]")].filter(A.vis)) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const el = node.parentElement;
        if (!node.textContent.trim() || !A.vis(el)) continue;
        const owner = el.closest("[data-s1-component]");
        if (owner !== root || el.closest('[role="tabpanel"]')) continue; /* 탭 내용 칸은 퍼블리셔 콘텐츠 자리 */
        const family = getComputedStyle(el).fontFamily;
        if (/pretendard/i.test(family)) {
          if (!out.sel) { el.setAttribute("data-audit-font", "1"); out.sel = A.sel(el); out.family = family; }
        } else if (family === bodyFamily) {
          const key = `${root.getAttribute("data-s1-component")}|${el.getAttribute("data-s1-part") || el.tagName.toLowerCase()}`;
          if (!seen.has(key)) { seen.add(key); out.undeclared.push({ component: root.getAttribute("data-s1-component"), part: el.getAttribute("data-s1-part") || el.tagName.toLowerCase(), text: node.textContent.trim().slice(0, 12), family }); }
        }
      }
    }
    return out;
  };

  const parseColor = (value) => {
    if (!value) return null;
    let m = /rgba?\(([^)]+)\)/.exec(value);
    if (m) {
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    m = /color\(srgb ([^)]+)\)/.exec(value);
    if (m) {
      const p = m[1].split(/[\s/]+/).filter(Boolean).map(parseFloat);
      return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 };
    }
    return null;
  };
  const blend = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
  const luminance = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => { const l1 = luminance(a); const l2 = luminance(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const hex = (c) => `#${[c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

  A.contrast = () => {
    const out = { checked: 0, skippedDisabled: 0, unknown: 0, failing: [] };
    for (const el of document.querySelectorAll("body *")) {
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText || !A.vis(el)) continue;
      if (["SCRIPT", "STYLE", "OPTION"].includes(el.tagName)) continue;
      if (el.closest(":disabled, [aria-disabled='true'], [data-state='disabled'], [data-disabled]")) { out.skippedDisabled += 1; continue; }
      const cs = getComputedStyle(el);
      let fg = parseColor(cs.color);
      if (!fg) { out.unknown += 1; continue; }
      let opacity = 1;
      const stack = [];
      let unknown = null;
      for (let node = el; node; node = node.parentElement) {
        const ns = getComputedStyle(node);
        opacity *= parseFloat(ns.opacity);
        if (ns.backgroundImage && ns.backgroundImage !== "none") { unknown = "background-image"; break; }
        const bg = parseColor(ns.backgroundColor);
        if (bg && bg.a > 0) { stack.push(bg); if (bg.a >= 1) break; }
      }
      if (unknown) { out.unknown += 1; continue; }
      let base = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = stack.length - 1; i >= 0; i -= 1) base = blend(stack[i], base);
      const text = blend({ ...fg, a: fg.a * opacity }, base);
      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      const value = ratio(text, base);
      out.checked += 1;
      if (value + 1e-6 < need) {
        out.failing.push({ sel: A.sel(el), text: el.textContent.trim().slice(0, 20), ratio: Math.round(value * 100) / 100, need, fg: hex(text), bg: hex(base), size });
      }
    }
    out.failing.sort((a, b) => a.ratio - b.ratio);
    return out;
  };

  A.focusables = () => {
    const seenRadioGroups = new Set();
    const list = [];
    for (const el of document.querySelectorAll("a[href], button, input, select, textarea, summary, [tabindex], [contenteditable='true']")) {
      if (el.disabled || el.tabIndex < 0 || !A.vis(el) || el.closest("[inert]")) continue;
      if (el.type === "radio" && el.name) {
        /* 같은 이름 묶음은 Tab 한 번만 선다 — 체크된 것이 있으면 그것, 없으면 첫 번째 */
        if (seenRadioGroups.has(el.name)) continue;
        const group = [...document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`)].filter((r) => !r.disabled && A.vis(r));
        const stop = group.find((r) => r.checked) || group[0];
        if (stop !== el) continue;
        seenRadioGroups.add(el.name);
      }
      list.push(A.sel(el));
    }
    return list;
  };

  const SNAP_PROPS = ["outlineStyle", "outlineWidth", "outlineColor", "outlineOffset", "boxShadow", "borderTopColor", "borderBottomColor", "borderTopWidth", "backgroundColor", "color", "textDecorationLine"];
  A.styleSnap = (el) => {
    const parts = [];
    let node = el;
    for (let depth = 0; node && depth < 4; depth += 1) {
      for (const pseudo of [null, "::before", "::after"]) {
        const cs = getComputedStyle(node, pseudo);
        if (pseudo && (cs.content === "none" || cs.content === "normal")) continue;
        parts.push(SNAP_PROPS.map((p) => cs[p]).join("|") + (pseudo ? `|${cs.opacity}` : ""));
      }
      if (node.hasAttribute("data-s1-component")) break;
      node = node.parentElement;
    }
    return parts.join("\n");
  };

  A.focusInfo = () => {
    const el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement) return null;
    return { sel: A.sel(el), snap: A.styleSnap(el), tag: el.tagName.toLowerCase(), name: el.getAttribute("aria-label") || el.textContent.trim().slice(0, 20) };
  };

  A.activeSel = () => A.sel(document.activeElement);

  window.__A = A;
  return true;
}
