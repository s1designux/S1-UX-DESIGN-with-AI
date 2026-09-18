/* ============================================================
   Pattern Builder · variant-markup.js
   ------------------------------------------------------------
   변형마다 들어가는 부품(part)이 다른 컴포넌트(mobile-header · gnb)의 뼈대를 만든다.
   배포 예제는 한 변형만 담고 있어 attribute 만 바꾸면 틀린 모습이 나온다.

   **어떤 part 가 어느 변형에 들어가는지는 여기서 정하지 않는다** —
   배포본 manifest 의 htmlContract.perVariantParts 가 정하고, 이 파일은
   그 목록을 읽어 조립만 한다(부모-자식 관계는 htmlContract.relations 의 서술을 표로 옮긴 것).
   그래서 배포본이 변형·부품을 바꾸면 빌더가 따라간다(손으로 다시 적지 않는다).
   ============================================================ */

/* 부모 → 자식 (htmlContract.relations 서술을 그대로 옮긴 표. 순서가 곧 화면 순서다) */
const NEST = {
  "mobile-header": {
    back: ["back-icon"],
    close: ["close-icon"],
    notification: ["notification-icon"],
    stack: ["title-row", "subtitle"],
    "title-row": ["title", "arrow-icon"]
  },
  gnb: {
    leading: ["logo", "menus"],
    menus: ["menu"],
    util: ["lang", "account", "menu-toggle"],
    lang: ["lang-icon", "lang-label"],
    account: ["account-icon"],
    "menu-toggle": ["menu-icon"]
  }
};

const icon = { tag: "span", attrs: { "aria-hidden": "true" } };

/* part → 태그·속성·기본 글자. 값(라벨·제목)은 host 가 화면 맥락에 맞게 바꾼다(relations). */
const TPL = {
  "mobile-header": {
    back: { tag: "button", attrs: { type: "button", "aria-label": "이전" } },
    "back-icon": icon,
    close: { tag: "button", attrs: { type: "button", "aria-label": "닫기" } },
    "close-icon": icon,
    spacer: icon,
    notification: { tag: "button", attrs: { type: "button", "aria-label": "알림" } },
    "notification-icon": icon,
    stack: { tag: "div" },
    "title-row": { tag: "div" },
    "arrow-icon": icon,
    subtitle: { tag: "p", text: "홈 서브타이틀" },
    /* 제목 있는 변형은 h1(화면의 주 제목), no-title 변형은 back/close 대칭용 빈 span */
    title: (variant, text) => (variant.includes("no-title")
      ? { tag: "span", attrs: { "aria-hidden": "true" } }
      : { tag: "h1", text: text || (variant.startsWith("home") ? "홈 타이틀" : "스탠다드형 타이틀") })
  },
  gnb: {
    leading: { tag: "div" },
    logo: (variant, text) => ({ tag: "a", attrs: { href: "#" }, text: text || "SAMPLE LOGO" }),
    menus: { tag: "ul" },
    /* 메뉴 자리 전체가 정본 슬롯 'Menus' — 기본 3개(relations) */
    menu: { tag: "a", attrs: { href: "#" }, wrap: "li", repeat: [["메뉴 1", { "aria-current": "page" }], ["메뉴 2", {}], ["메뉴 3", {}]] },
    util: { tag: "div" },
    lang: { tag: "button", attrs: { type: "button" } },
    "lang-icon": icon,
    "lang-label": { tag: "span", text: "한국어" },
    account: { tag: "button", attrs: { type: "button", "aria-label": "계정" } },
    "account-icon": icon,
    "menu-toggle": { tag: "button", attrs: { type: "button", "aria-label": "전체 메뉴" } },
    "menu-icon": icon
  }
};

export const hasVariantMarkup = (id) => Boolean(TPL[id]);

const esc = (v) => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escAttr = (v) => esc(v).replaceAll('"', "&quot;");
const attrsOf = (o = {}) => Object.entries(o).map(([k, v]) => ` ${k}="${escAttr(v)}"`).join("");
const rootTag = (manifest, fallback) => (manifest?.htmlContract?.root || "").match(/^[a-z]+/)?.[0] || fallback;

function partHtml(id, part, variant, text) {
  let tpl = TPL[id]?.[part];
  if (!tpl) return "";
  if (typeof tpl === "function") tpl = tpl(variant, text);
  const kids = (NEST[id]?.[part] || []).map((c) => partHtml(id, c, variant, text)).join("");
  const body = kids || esc(tpl.text || "");
  const open = (extra = {}) => `<${tpl.tag} data-s1-part="${part}"${attrsOf({ ...(tpl.attrs || {}), ...extra })}>`;
  if (tpl.repeat) {
    return tpl.repeat.map(([label, extra]) => {
      const one = `${open(extra)}${esc(label)}</${tpl.tag}>`;
      return tpl.wrap ? `<${tpl.wrap}>${one}</${tpl.wrap}>` : one;
    }).join("");
  }
  return `${open()}${body}</${tpl.tag}>`;
}

/* 이 변형에 들어가는 part 중, 다른 part 의 자식이 아닌 것만 골라 위에서부터 조립한다. */
function topLevelParts(id, manifest, variant) {
  const declared = manifest?.htmlContract?.perVariantParts?.[variant];
  if (!declared) return null;
  const childOf = new Set();
  for (const [parent, kids] of Object.entries(NEST[id] || {})) {
    if (!declared.includes(parent)) continue;
    kids.forEach((k) => childOf.add(k));
  }
  return declared.filter((p) => !childOf.has(p));
}

/* 변형 뼈대 한 벌. manifest 에 이 변형 선언이 없으면 null 을 돌려준다(부르는 쪽이 배포 예제로 되돌린다). */
export function variantMarkup(id, manifest, { variant, size, text } = {}) {
  if (!TPL[id]) return null;
  const v = variant || manifest?.variants?.[0];
  const parts = topLevelParts(id, manifest, v);
  if (!parts) return null;
  const tag = rootTag(manifest, id === "gnb" ? "nav" : "header");
  const rootAttrs = { "data-s1-component": id, "data-variant": v };
  if (id === "gnb") { rootAttrs["data-size"] = size || manifest?.sizes?.[0] || "md"; rootAttrs["aria-label"] = "주 메뉴"; }
  return `<${tag}${attrsOf(rootAttrs)}>${parts.map((p) => partHtml(id, p, v, text)).join("")}</${tag}>`;
}
