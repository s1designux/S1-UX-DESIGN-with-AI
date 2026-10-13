/**
 * react-spec-layout.mjs — 메뉴·목록 뼈대 부품의 "밖에서 넣는 길" 선언
 *   lnb · gnb · gnb-sub-menu · gnb-sub-menu-item · list-row · mobile-header
 * 메뉴 글자를 마크업에 박지 않는다 — 항목은 props 로 받고, 기본 항목은 승인 예제에서 읽어 온다.
 */

import { attributeValue, isTextOnly, literal, parseHtml, partOf } from "./react.mjs";
import { defaultController } from "./react-api.mjs";
import { frozen } from "./react-spec-basic.mjs";

export const LAYOUT = {};

const isElement = (node) => node && node.type === "element";
const elementChildren = (node) => node.children.filter(isElement);
const ownText = (node) => node.children.filter((child) => child.type === "text").map((child) => child.value).join(" ").trim();
const findAll = (node, predicate, found = []) => {
  if (!node) return found;
  if (isElement(node) && predicate(node)) found.push(node);
  for (const child of node.children ?? []) findAll(child, predicate, found);
  return found;
};

/* ── LNB ── */

function lnbItemsOf(tree) {
  const list = findAll(tree, (node) => partOf(node) === "items")[0];
  if (!list) return [];
  return elementChildren(list).map((li) => {
    const control = elementChildren(li)[0];
    const sub = elementChildren(li).find((node) => partOf(node) === "subitems");
    const item = { label: ownText(control) };
    if (attributeValue(control, "title") !== undefined && attributeValue(control, "title") !== item.label) item.title = attributeValue(control, "title");
    if (sub) {
      item.children = elementChildren(sub).map((subLi) => {
        const link = elementChildren(subLi)[0];
        const child = { label: ownText(link) };
        if (attributeValue(link, "href") !== undefined && attributeValue(link, "href") !== "#") child.href = attributeValue(link, "href");
        if (attributeValue(link, "aria-current") === "page") child.current = true;
        return child;
      });
      if (attributeValue(control, "aria-expanded") === "true") item.expanded = true;
    } else {
      if (attributeValue(control, "href") !== undefined && attributeValue(control, "href") !== "#") item.href = attributeValue(control, "href");
      if (attributeValue(control, "aria-current") === "page") item.current = true;
      if (attributeValue(control, "aria-disabled") === "true") item.disabled = true;
    }
    return item;
  });
}

LAYOUT["lnb"] = {
  structural: { attribute: "data-variant", prop: "variant" },
  /* 0.22.0 에서 모든 항목이 함께 쓰던 슬롯 이름 — items 를 주지 않아도 · 주어도 그대로 받는다(항목의 icon 이 있으면 그쪽이 이긴다). */
  legacyParts: ["item", "itemIcon", "itemToggle", "subitems", "group"],
  contentOverride: { items: "{lnbList.map(renderLnbItem)}" },
  controller(b, c) {
    for (const form of c.forms) b.moduleConst(`const DEFAULT_LNB_ITEMS_${form.key.toUpperCase().replace(/-/g, "_")} = ${JSON.stringify(lnbItemsOf(form.tree))};`);
    defaultController(b, c);
    b.prop("items", "readonly S1LnbItemInput[]", "메뉴 항목 — { label, href?, current?, disabled?, icon?, children? } 또는 글자. children 이 있으면 펼쳐지는 묶음이 된다. 주지 않으면 예제 내용");
    b.kit("attrsOf");
    b.pre(`const lnbList = items ?? (formKey === "brand" ? DEFAULT_LNB_ITEMS_BRAND : DEFAULT_LNB_ITEMS_MENU);`);
    b.post(`const renderLnbItem = (entry, index) => {
    const item = typeof entry === "string" || typeof entry === "number" ? { label: String(entry) } : entry;
    const key = item.key ?? index;
    const title = item.title ?? (typeof item.label === "string" ? item.label : undefined);
    const iconAttrs = slot(partScope, "itemIcon").attrs ?? {};
    const icon = <span data-s1-part="item-icon" aria-hidden="true" {...iconAttrs}>{item.icon ?? slot(partScope, "itemIcon").content ?? ""}</span>;
    if (item.children) {
      const subId = uid + "-sub-" + index;
      const open = Boolean(item.expanded);
      return (
        <li key={key}>
          <button type="button" data-s1-part="item" aria-expanded={String(open)} aria-controls={subId} title={title} {...(slot(partScope, "item").attrs ?? {})}>
            {icon}
            {item.label}
            <span data-s1-part="item-toggle" aria-hidden="true" {...(slot(partScope, "itemToggle").attrs ?? {})}>{slot(partScope, "itemToggle").content ?? ""}</span>
          </button>
          <ul data-s1-part="subitems" id={subId} hidden={!open} {...(slot(partScope, "subitems").attrs ?? {})}>
            {item.children.map((child, childIndex) => {
              const sub = typeof child === "string" || typeof child === "number" ? { label: String(child) } : child;
              return (
                <li key={sub.key ?? childIndex}>
                  <a data-s1-part="item" href={sub.href ?? "#"} aria-current={sub.current ? "page" : undefined} {...(slot(partScope, "item").attrs ?? {})}>{slot(partScope, "item").content ?? sub.label}</a>
                </li>
              );
            })}
          </ul>
        </li>
      );
    }
    return (
      <li key={key}>
        <a data-s1-part="item" href={item.href ?? "#"} aria-current={item.current ? "page" : undefined} aria-disabled={item.disabled ? "true" : undefined} tabIndex={item.disabled ? -1 : undefined} title={title} {...(slot(partScope, "item").attrs ?? {})}>
          {icon}
          {item.label}
        </a>
      </li>
    );
  };`);
    void attrsOf;
  }
};
const attrsOf = null;

/* ── GNB 하위 메뉴 · 항목 ── */

LAYOUT["gnb-sub-menu"] = {
  lists: { column: { prop: "columns", nested: "s1Link", optionalTitle: true, ts: "readonly S1GnbColumn[]", doc: "열 목록 — { title, items: [{ label, href?, current? } 또는 글자] }. 주지 않으면 예제 내용이 그려진다." } },
  attrs: [{ root: true, set: { "data-type": (node) => `type ?? ${literal(attributeValue(node, "data-type") ?? "regular")}` } }],
  controller(b, c) {
    defaultController(b, c);
    b.prop("type", "\"regular\" | \"compact-1\" | \"compact-2\"", "하위 메뉴 종류 (data-type): regular(제목+항목) · compact-1 · compact-2");
    b.kit("s1Link");
  }
};

LAYOUT["gnb-sub-menu-item"] = {
  structural: { attribute: "data-depth", prop: "depth" },
  rootText: "label",
  attrs: [
    {
      root: true,
      form: "2depth",
      set: {
        href: 'href ?? "#"',
        "aria-current": (node) => `current === undefined ? ${literal(attributeValue(node, "aria-current") ?? undefined)} : current ? "page" : undefined`
      }
    }
  ],
  controller(b, c) {
    defaultController(b, c);
    b.prop("label", "ReactNode", "글자 — children 으로도 줄 수 있다");
    b.prop("children", "ReactNode", "글자 (label 과 같다)");
    b.prop("href", "string", "이동할 주소 (2depth 만)");
    b.prop("current", "boolean", "지금 보고 있는 항목 (2depth 만, aria-current)");
    b.slotProp("label", "label");
  }
};

/* ── GNB ── */

function gnbMenusOf(view) {
  const tree = parseHtml(view.exampleByBreak ? Object.values(view.exampleByBreak)[0] : view.example, view.id);
  const nav = findAll(tree, (node) => attributeValue(node, "data-s1-component") === "gnb")[0];
  return findAll(nav, (node) => partOf(node) === "menu").map((anchor) => {
    const menu = { label: ownText(anchor) };
    if (attributeValue(anchor, "aria-current") === "page") menu.current = true;
    /* 예제의 하위 메뉴 판은 같은 문서의 다른 요소(id)다 — 예전처럼 id 로 가리키기만 한다(S1GnbSubMenu 를 id 로 곁에 두는 옛 조합법이 그대로 된다). */
    if (attributeValue(anchor, "aria-controls") !== undefined) menu.controls = attributeValue(anchor, "aria-controls");
    return menu;
  });
}

LAYOUT["gnb"] = {
  legacyParts: ["menu"],
  contentOverride: { menus: "{menuList.map(renderGnbMenu)}" },
  afterRoot: (body) => `      <>\n${body}\n        {menuList.map(renderGnbPanel)}\n      </>`,
  controller(b, c) {
    b.moduleImport('import S1GnbSubMenu from "./gnb-sub-menu.jsx";');
    b.moduleConst(`const DEFAULT_GNB_MENUS = ${JSON.stringify(gnbMenusOf(c.view))};`);
    b.standard();
    b.eventProps();
    /* 하위 메뉴 판이 있는 메뉴가 바뀌면(menus 를 새로 줄 때) 동작 스크립트를 다시 붙여 새 판을 잡게 한다. */
    b.pre(`const menuSig = (menus ?? []).map((entry) => (entry && typeof entry === "object" && (entry.columns || entry.children || entry.controls) ? "1" : "0")).join("");`);
    b.runtime({
      "s1:gnb:open": "(event) => { onOpen?.(event); onOpenChange?.(true, event.detail); }",
      "s1:gnb:close": "(event) => { onClose?.(event); onOpenChange?.(false, event.detail); }"
    }, ["menuSig"]);
    b.prop("menus", "readonly S1GnbMenuInput[]", "메뉴 — { label, href?, current?, columns? } 또는 글자. columns 가 있으면 누르면(마우스는 올리면) 하위 메뉴가 펼쳐진다. 주지 않으면 예제 내용");
    b.prop("subMenuType", "\"regular\" | \"compact-1\" | \"compact-2\"", "하위 메뉴 종류 (기본 regular)", { def: "\"regular\"" });
    b.prop("logo", "ReactNode", "로고 자리 글자·요소");
    b.prop("langLabel", "ReactNode", "언어 단추 글자");
    b.prop("onOpenChange", "(open: boolean, detail: { trigger: HTMLElement; panel: HTMLElement }) => void", "하위 메뉴가 펼쳐지거나(true) 접힐(false) 때");
    b.slotProp("logo", "logo");
    b.slotProp("langLabel", "langLabel");
    b.pre("const menuList = menus ?? DEFAULT_GNB_MENUS;");
    b.post(`const renderGnbMenu = (entry, index) => {
    const menu = typeof entry === "string" || typeof entry === "number" ? { label: String(entry) } : entry;
    const columns = menu.columns ?? menu.children;
    return (
      <li key={menu.key ?? index}>
        <a data-s1-part="menu" href={menu.href ?? "#"} aria-current={menu.current ? "page" : undefined} aria-expanded={columns || menu.controls ? "false" : undefined} aria-controls={menu.controls ?? (columns ? uid + "-sub-" + index : undefined)} {...(slot(partScope, "menu").attrs ?? {})}>{slot(partScope, "menu").content ?? menu.label}</a>
      </li>
    );
  };
  const renderGnbPanel = (entry, index) => {
    const menu = typeof entry === "string" || typeof entry === "number" ? { label: String(entry) } : entry;
    const columns = menu.columns ?? menu.children;
    if (!columns) return null;
    return <S1GnbSubMenu key={menu.key ?? index} id={uid + "-sub-" + index} type={subMenuType} columns={columns} hidden aria-label={typeof menu.label === "string" ? menu.label + " 하위 메뉴" : "하위 메뉴"} />;
  };`);
  }
};

/* ── 목록 한 줄 ── */

LAYOUT["list-row"] = {
  structural: { attribute: "data-type", prop: "variant" },
  /* 종류마다 견본 글자가 다르다 — 0.22.0 은 한 모양(nav)이라, parts 를 쓴 코드의 비워 둔 칸에 새 종류의 견본이 끼어들면 안 된다(nav 는 예전 그대로 견본이 남는다). */
  bareParts: '(formKey === "nav" || parts === undefined)',
  attrs: [
    { match: (node) => node.tag === "input" && attributeValue(node, "type") === "checkbox", pieces: ["{...checkProps}"] },
    { match: (node) => attributeValue(node, "data-s1-component") === "toggle", set: { "aria-checked": "String(initialChecked)" } }
  ],
  /* 스위치 줄 — 0.22.0 처럼 parts.chevron 에 토글을 주면 그것을 쓰고, 안 주면 줄이 가진 토글을 그린다. */
  wrapNode: [{
    /* 설명 · 값 칸은 견본이 아니면 내용을 줬을 때만 그린다 — 빈 칸이 줄 사이·칸 사이 간격을 만들지 않게. */
    match: (node, em) => ["description", "value"].includes(partOf(node)) && !em.ancestors.some((ancestor) => partOf(ancestor) === partOf(node)),
    wrap: (jsx, indent, node) => `${indent}{bare || slot(partScope, ${JSON.stringify(partOf(node))}).content !== undefined ? (\n${jsx}\n${indent}) : null}`
  }, {
    form: "switch",
    match: (node) => attributeValue(node, "data-s1-component") === "toggle",
    wrap: (jsx, indent) => `${indent}{slot(partScope, "chevron").content !== undefined ? slot(partScope, "chevron").content : (\n${jsx}\n${indent})}`
  }],
  rootEnd: (indent) => `${indent}{formKey === "switch" && name ? <input type="hidden" name={name} value="on" disabled={!isOn} /> : null}`,
  controller(b, c) {
    b.moduleImport('import { init as initToggle, destroy as destroyToggle } from "../../components/toggle.js";');
    b.moduleConst(`/* 스위치 줄 안의 토글에 동작 스크립트를 붙인다 — 줄 자신은 동작 스크립트가 없다. */
const toggleInRow = {
  init: (root) => { const el = root.querySelector('[data-s1-component="toggle"]'); return el ? initToggle(el) : null; },
  destroy: (root) => { const el = root.querySelector('[data-s1-component="toggle"]'); if (el) destroyToggle(el); }
};`);
    b.standard();
    b.prop("title", "ReactNode", "제목 글자");
    b.prop("description", "ReactNode", "설명 글자");
    b.prop("value", "ReactNode", "오른쪽에 보이는 값 글자 (variant=\"value\")");
    b.prop("checked", "boolean", "켜져 있나(제어형) — pick · agree 는 체크 표시, switch 는 스위치");
    b.prop("defaultChecked", "boolean", "처음 켜져 있나(비제어형) — 주지 않으면 꺼진 채 시작한다");
    b.prop("onCheckedChange", "(checked: boolean) => void", "켜지거나(true) 꺼질(false) 때");
    b.prop("onChange", "ChangeEventHandler<HTMLInputElement>", "체크 표시가 바뀔 때 (pick · agree)");
    b.prop("name", "string", "폼 이름 — pick · agree 는 체크 표시가, switch 는 켜져 있을 때 \"on\" 이 폼 전송에 실린다");
    b.hook("useRef", "useState");
    b.kit("useApply", "useRerender");
    b.slotProp("title", "title");
    b.slotProp("description", "description");
    b.slotProp("value", "value");
    /* 스위치는 꺼진 채 시작한다(0.22.0 과 같다) — checked · defaultChecked 를 주면 그 값을 따른다. */
    b.pre(frozen("initialChecked", "checked ?? defaultChecked ?? false"));
    b.pre("const [on, setOn] = useState(initialChecked);");
    b.pre("const isOn = checked !== undefined ? checked : on;");
    b.pre("const syncing = useRef(false);");
    b.pre("const rerender = useRerender();");
    b.pre(`const checkProps = {};
  if (checked !== undefined) checkProps.checked = checked;
  else if (defaultChecked !== undefined) checkProps.defaultChecked = defaultChecked;
  if (name !== undefined) checkProps.name = name;
  checkProps.onChange = (event) => { onChange?.(event); onCheckedChange?.(event.target.checked); };`);
    b.post("const ownToggle = slot(partScope, \"chevron\").content !== undefined && formKey === \"switch\";");
    b.runtime({
      "s1:toggle:change": "(event) => { setOn(Boolean(event.detail?.checked)); if (!syncing.current) onCheckedChange?.(Boolean(event.detail?.checked)); rerender(); }"
    }, ["ownToggle"], "ownToggle ? null : toggleInRow");
    b.post(`useApply(apiRef, (api) => {
    if (checked === undefined || !api || api.checked === checked) return;
    syncing.current = true;
    try { api.set(checked); } finally { syncing.current = false; }
  });`);
  }
};

LAYOUT["mobile-header"] = {
  controller(b, c) {
    defaultController(b, c);
    b.prop("title", "ReactNode", "제목 글자");
    b.slotProp("title", "title");
  }
};

void isTextOnly;
