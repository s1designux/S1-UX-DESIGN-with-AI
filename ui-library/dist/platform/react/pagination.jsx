/* 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run tokens:reconcile` 또는 `npm run ui:build` 를 실행하세요. */
/* S1Pagination — 승인된 배포본을 그대로 마운트하는 React 껍데기.
   마크업을 새로 쓰지 않는다. MARKUPS 는 dist/examples/pagination*.html 안의 승인된 인스턴스를 그대로 도려낸 것이다.
   host 는 display:contents 라 레이아웃에 끼어들지 않는다. */
import { useEffect, useRef } from "react";
import { init, destroy } from "../../components/pagination.js";

export const MARKUPS = {
  "pc": "<nav data-s1-component=\"pagination\" data-total-pages=\"6\" data-page=\"1\" aria-label=\"페이지 탐색\">\n  <span data-s1-part=\"arrow-group\"><button type=\"button\" data-s1-action=\"first\" aria-label=\"첫 페이지\"><span data-s1-part=\"icon\" data-icon=\"edge\" aria-hidden=\"true\"></span></button><button type=\"button\" data-s1-action=\"previous\" aria-label=\"이전 페이지\"><span data-s1-part=\"icon\" data-icon=\"chevron\" aria-hidden=\"true\"></span></button></span>\n  <span data-s1-part=\"pages\"><button type=\"button\" data-s1-part=\"page\" data-page=\"1\" aria-current=\"page\">1</button><button type=\"button\" data-s1-part=\"page\" data-page=\"2\">2</button><button type=\"button\" data-s1-part=\"page\" data-page=\"3\">3</button><button type=\"button\" data-s1-part=\"page\" data-page=\"4\">4</button><button type=\"button\" data-s1-part=\"page\" data-page=\"5\">5</button><button type=\"button\" data-s1-part=\"page\" data-page=\"6\">6</button></span>\n  <span data-s1-part=\"arrow-group\"><button type=\"button\" data-s1-action=\"next\" aria-label=\"다음 페이지\"><span data-s1-part=\"icon\" data-icon=\"chevron\" aria-hidden=\"true\"></span></button><button type=\"button\" data-s1-action=\"last\" aria-label=\"마지막 페이지\"><span data-s1-part=\"icon\" data-icon=\"edge\" aria-hidden=\"true\"></span></button></span>\n</nav>"
};
export const DEFAULT_BREAK = "pc";
export const BREAKS = ["pc"];
export const VARIANTS = ["bar"];
export const SIZES = ["28"];
export const PARTS = ["arrow-group","pages","page","icon"];
/* variant·size 를 담는 속성 이름은 컴포넌트마다 다르다 — 승인된 마크업에서 읽어 온 것이다.
   null 이면 그 축이 마크업 속성으로 드러나지 않아 prop 으로 바꿀 수 없다는 뜻이다. */
export const VARIANT_ATTRIBUTE = null;
export const SIZE_ATTRIBUTE = null;

function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(`[s1-ui] pagination: 승인되지 않은 ${label} "${value}". 쓸 수 있는 값: ${allowed.join(", ")}`);
}

export default function S1Pagination({ variant, size, breakName = DEFAULT_BREAK, parts, className, style, ...rest }) {
  const hostRef = useRef(null);
  const rootRef = useRef(null);
  assertAllowed("variant", variant, VARIANTS);
  assertAllowed("size", size, SIZES);
  assertAllowed("breakName", breakName, BREAKS);

  useEffect(() => {
    const host = hostRef.current;
    host.innerHTML = MARKUPS[breakName] ?? MARKUPS[DEFAULT_BREAK];
    const root = host.firstElementChild;
    rootRef.current = root;
    init(root);
    return () => {
      destroy(root);
      host.innerHTML = "";
      rootRef.current = null;
    };
  }, [breakName]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (variant !== undefined && VARIANT_ATTRIBUTE) root.setAttribute(VARIANT_ATTRIBUTE, variant);
    if (size !== undefined && SIZE_ATTRIBUTE) root.setAttribute(SIZE_ATTRIBUTE, size);
    if (className) root.className = className;
    if (style) Object.assign(root.style, style);
    for (const [key, value] of Object.entries(rest)) {
      if (value === undefined || value === null || value === false) root.removeAttribute(key);
      else root.setAttribute(key, value === true ? "" : String(value));
    }
    for (const [name, text] of Object.entries(parts ?? {})) {
      const target = root.querySelector(`[data-s1-part="${name}"]`);
      if (target) target.textContent = text;
    }
  });

  return <div ref={hostRef} style={{ display: "contents" }} />;
}
