/* 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run tokens:reconcile` 또는 `npm run ui:build` 를 실행하세요. */
/* S1TimePicker — 승인된 배포본을 그대로 마운트하는 React 껍데기.
   마크업을 새로 쓰지 않는다. MARKUPS 는 dist/examples/time-picker*.html 안의 승인된 인스턴스를 그대로 도려낸 것이다.
   host 는 display:contents 라 레이아웃에 끼어들지 않는다. */
import { useEffect, useRef } from "react";
import { init, destroy } from "../../components/time-picker.js";

export const MARKUPS = {
  "pc": "<div data-s1-component=\"time-picker\" data-size=\"md\" data-break=\"pc\" data-type=\"24h\" data-minute-step=\"1\">\n  <button type=\"button\" data-s1-part=\"trigger\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-label=\"시간\">\n    <span data-s1-part=\"value\">시간 선택</span>\n    <span data-s1-part=\"icon\" aria-hidden=\"true\"></span>\n  </button>\n  <div data-s1-part=\"panel\" hidden>\n    <div data-s1-part=\"columns\">\n      <div data-s1-part=\"column\" data-column=\"hour\" role=\"listbox\" aria-label=\"시\"></div>\n      <div data-s1-part=\"divider\"></div>\n      <div data-s1-part=\"column\" data-column=\"minute\" role=\"listbox\" aria-label=\"분\"></div>\n    </div>\n    <div data-s1-part=\"footer\">\n      <button type=\"button\" data-s1-part=\"confirm\" disabled>확인</button>\n    </div>\n  </div>\n</div>",
  "mobile": "<div data-s1-component=\"time-picker\" data-size=\"md\" data-break=\"mobile\" data-type=\"12h\" data-minute-step=\"1\" data-mobile-ui=\"wheel\" data-mobile-content=\"time-only\">\n  <button type=\"button\" data-s1-part=\"trigger\" aria-haspopup=\"dialog\" aria-expanded=\"false\" aria-label=\"시간\">\n    <span data-s1-part=\"value\">시간 선택</span>\n    <span data-s1-part=\"icon\" aria-hidden=\"true\"></span>\n  </button>\n  <div data-s1-part=\"sheet\" hidden>\n    <div data-s1-part=\"sheet-backdrop\"></div>\n    <div data-s1-part=\"sheet-panel\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"time-picker-wheel-title-time-only\" tabindex=\"-1\">\n      <div data-s1-part=\"sheet-header\">\n        <span data-s1-part=\"sheet-title\" id=\"time-picker-wheel-title-time-only\">시간 선택</span>\n        <button type=\"button\" data-s1-part=\"sheet-close\" aria-label=\"닫기\"></button>\n      </div>\n      <div data-s1-part=\"wheel\">\n        <div data-s1-part=\"wheel-col\" data-column=\"ampm\" role=\"listbox\" aria-label=\"오전오후\"></div>\n        <div data-s1-part=\"wheel-col\" data-column=\"hour\" role=\"listbox\" aria-label=\"시\"></div>\n        <div data-s1-part=\"wheel-col\" data-column=\"colon\" aria-hidden=\"true\"></div>\n        <div data-s1-part=\"wheel-col\" data-column=\"minute\" role=\"listbox\" aria-label=\"분\"></div>\n        <div data-s1-part=\"fade-top\" aria-hidden=\"true\"></div>\n        <div data-s1-part=\"fade-bottom\" aria-hidden=\"true\"></div>\n      </div>\n      <div data-s1-part=\"sheet-footer\">\n        <button type=\"button\" data-s1-part=\"apply\" data-s1-component=\"button\" data-variant=\"primary\" data-size=\"lg\">\n          <span data-s1-part=\"label\">적용</span>\n        </button>\n      </div>\n    </div>\n  </div>\n</div>"
};
export const DEFAULT_BREAK = "pc";
export const BREAKS = ["pc","mobile"];
export const VARIANTS = ["base"];
export const SIZES = ["xxsm","xsm","md"];
export const PARTS = ["trigger","value","icon","panel","column","cell","divider","footer","confirm","sheet","sheet-backdrop","sheet-panel","sheet-header","sheet-title","sheet-close","tabs","date-panel","wheel","wheel-col","wheel-cell","fade-top","fade-bottom","sheet-footer","apply"];
/* variant·size 를 담는 속성 이름은 컴포넌트마다 다르다 — 승인된 마크업에서 읽어 온 것이다.
   null 이면 그 축이 마크업 속성으로 드러나지 않아 prop 으로 바꿀 수 없다는 뜻이다. */
export const VARIANT_ATTRIBUTE = null;
export const SIZE_ATTRIBUTE = "data-size";

function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(`[s1-ui] time-picker: 승인되지 않은 ${label} "${value}". 쓸 수 있는 값: ${allowed.join(", ")}`);
}

export default function S1TimePicker({ variant, size, breakName = DEFAULT_BREAK, parts, className, style, onOpen, onClose, onChange, ...rest }) {
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
    const props = { onOpen, onClose, onChange };
    const bound = [["s1:time-picker:open","onOpen"],["s1:time-picker:close","onClose"],["s1:time-picker:change","onChange"]]
      .map(([eventName, propName]) => [eventName, props[propName]])
      .filter(([, handler]) => typeof handler === "function");
    for (const [eventName, handler] of bound) root.addEventListener(eventName, handler);
    return () => { for (const [eventName, handler] of bound) root.removeEventListener(eventName, handler); };
  });

  return <div ref={hostRef} style={{ display: "contents" }} />;
}
