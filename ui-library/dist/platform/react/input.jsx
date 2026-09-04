/* 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run tokens:reconcile` 또는 `npm run ui:build` 를 실행하세요. */
/* S1Input — 승인된 배포본을 그대로 마운트하는 React 껍데기.
   마크업을 새로 쓰지 않는다. MARKUPS 는 dist/examples/input*.html 안의 승인된 인스턴스를 그대로 도려낸 것이다.
   host 는 display:contents 라 레이아웃에 끼어들지 않는다. */
import { useEffect, useRef } from "react";
import { init, destroy } from "../../components/input.js";

export const MARKUPS = {
  "pc": "<div data-s1-component=\"input\" data-size=\"md\" data-break=\"pc\">\n  <div data-s1-part=\"field\">\n    <input id=\"profile-name\" data-s1-part=\"control\" aria-label=\"이름\" placeholder=\"내용을 입력하세요\">\n    <button type=\"button\" data-s1-part=\"action\" data-action=\"clear\" aria-label=\"입력 내용 지우기\" hidden>\n      <span data-s1-part=\"action-icon\" aria-hidden=\"true\"></span>\n    </button>\n  </div>\n</div>",
  "mobile": "<div data-s1-component=\"input\" data-size=\"md\" data-break=\"mobile\">\n  <div data-s1-part=\"field\">\n    <input id=\"profile-name\" data-s1-part=\"control\" aria-label=\"이름\" placeholder=\"내용을 입력하세요\">\n    <button type=\"button\" data-s1-part=\"action\" data-action=\"clear\" aria-label=\"입력 내용 지우기\" hidden>\n      <span data-s1-part=\"action-icon\" aria-hidden=\"true\"></span>\n    </button>\n  </div>\n</div>"
};
export const DEFAULT_BREAK = "pc";
export const BREAKS = ["pc","mobile"];
export const VARIANTS = ["base"];
export const SIZES = ["xxsm","xsm","md"];
export const PARTS = ["label","field","control","action","action-icon","message"];
/* variant·size 를 담는 속성 이름은 컴포넌트마다 다르다 — 승인된 마크업에서 읽어 온 것이다.
   null 이면 그 축이 마크업 속성으로 드러나지 않아 prop 으로 바꿀 수 없다는 뜻이다. */
export const VARIANT_ATTRIBUTE = null;
export const SIZE_ATTRIBUTE = "data-size";

function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(`[s1-ui] input: 승인되지 않은 ${label} "${value}". 쓸 수 있는 값: ${allowed.join(", ")}`);
}

export default function S1Input({ variant, size, breakName = DEFAULT_BREAK, parts, className, style, onClear, ...rest }) {
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

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const props = { onClear };
    const bound = [["s1:input:clear","onClear"]]
      .map(([eventName, propName]) => [eventName, props[propName]])
      .filter(([, handler]) => typeof handler === "function");
    for (const [eventName, handler] of bound) root.addEventListener(eventName, handler);
    return () => { for (const [eventName, handler] of bound) root.removeEventListener(eventName, handler); };
  });

  return <div ref={hostRef} style={{ display: "contents" }} />;
}
