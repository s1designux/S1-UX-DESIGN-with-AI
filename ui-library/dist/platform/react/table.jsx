/* 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run tokens:reconcile` 또는 `npm run ui:build` 를 실행하세요. */
/* S1Table — 승인된 배포본을 그대로 마운트하는 React 껍데기.
   마크업을 새로 쓰지 않는다. MARKUPS 는 dist/examples/table*.html 안의 승인된 인스턴스를 그대로 도려낸 것이다.
   host 는 display:contents 라 레이아웃에 끼어들지 않는다. */
import { useEffect, useRef } from "react";
import { init, destroy } from "../../components/table.js";

export const MARKUPS = {
  "pc": "<div data-s1-component=\"table\" data-size=\"md\">\n  <table data-s1-part=\"table\">\n    <thead>\n      <tr>\n        <th data-s1-part=\"header-cell\" data-selection scope=\"col\">\n          <div data-s1-component=\"checkbox\">\n            <input type=\"checkbox\" data-s1-part=\"control\" aria-label=\"전체 선택\">\n          </div>\n        </th>\n        <th data-s1-part=\"header-cell\" scope=\"col\">항목명</th>\n        <th data-s1-part=\"header-cell\" scope=\"col\">카테고리</th>\n        <th data-s1-part=\"header-cell\" data-align=\"center\" scope=\"col\">수량</th>\n        <th data-s1-part=\"header-cell\" data-align=\"center\" scope=\"col\">상태</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr data-s1-part=\"row\">\n        <td data-s1-part=\"cell\" data-selection>\n          <div data-s1-component=\"checkbox\">\n            <input type=\"checkbox\" data-s1-part=\"control\" aria-label=\"항목 1 선택\">\n          </div>\n        </td>\n        <td data-s1-part=\"cell\">항목 1</td>\n        <td data-s1-part=\"cell\">카테고리 A</td>\n        <td data-s1-part=\"cell\" data-align=\"center\">10</td>\n        <td data-s1-part=\"cell\" data-align=\"center\">활성</td>\n      </tr>\n      <tr data-s1-part=\"row\">\n        <td data-s1-part=\"cell\" data-selection>\n          <div data-s1-component=\"checkbox\">\n            <input type=\"checkbox\" data-s1-part=\"control\" aria-label=\"항목 2 선택\">\n          </div>\n        </td>\n        <td data-s1-part=\"cell\">항목 2</td>\n        <td data-s1-part=\"cell\">카테고리 B</td>\n        <td data-s1-part=\"cell\" data-align=\"center\">20</td>\n        <td data-s1-part=\"cell\" data-align=\"center\">검토중</td>\n      </tr>\n      <tr data-s1-part=\"row\">\n        <td data-s1-part=\"cell\" data-selection>\n          <div data-s1-component=\"checkbox\">\n            <input type=\"checkbox\" data-s1-part=\"control\" aria-label=\"항목 3 선택\">\n          </div>\n        </td>\n        <td data-s1-part=\"cell\">항목 3</td>\n        <td data-s1-part=\"cell\">카테고리 C</td>\n        <td data-s1-part=\"cell\" data-align=\"center\">30</td>\n        <td data-s1-part=\"cell\" data-align=\"center\">완료</td>\n      </tr>\n    </tbody>\n  </table>\n</div>"
};
export const DEFAULT_BREAK = "pc";
export const BREAKS = ["pc"];
export const VARIANTS = ["base"];
export const SIZES = ["md","sm","xsm"];
export const PARTS = ["table","header-cell","row","cell"];
/* variant·size 를 담는 속성 이름은 컴포넌트마다 다르다 — 승인된 마크업에서 읽어 온 것이다.
   null 이면 그 축이 마크업 속성으로 드러나지 않아 prop 으로 바꿀 수 없다는 뜻이다. */
export const VARIANT_ATTRIBUTE = null;
export const SIZE_ATTRIBUTE = "data-size";

function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(`[s1-ui] table: 승인되지 않은 ${label} "${value}". 쓸 수 있는 값: ${allowed.join(", ")}`);
}

export default function S1Table({ variant, size, breakName = DEFAULT_BREAK, parts, className, style, onSelectionchange, ...rest }) {
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
    const props = { onSelectionchange };
    const bound = [["s1:table:selectionchange","onSelectionchange"]]
      .map(([eventName, propName]) => [eventName, props[propName]])
      .filter(([, handler]) => typeof handler === "function");
    for (const [eventName, handler] of bound) root.addEventListener(eventName, handler);
    return () => { for (const [eventName, handler] of bound) root.removeEventListener(eventName, handler); };
  });

  return <div ref={hostRef} style={{ display: "contents" }} />;
}
