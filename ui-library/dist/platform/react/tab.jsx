/* 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run tokens:reconcile` 또는 `npm run ui:build` 를 실행하세요. */
/* S1Tab — 승인된 배포본을 그대로 마운트하는 React 껍데기.
   마크업을 새로 쓰지 않는다. MARKUPS 는 dist/examples/tab*.html 안의 승인된 인스턴스를 그대로 도려낸 것이다.
   host 는 display:contents 라 레이아웃에 끼어들지 않는다. */
import { useEffect, useRef } from "react";
import { init, destroy } from "../../components/tab.js";

export const MARKUPS = {
  "pc": "<div data-s1-component=\"tab\" data-size=\"md\" data-break=\"pc\" role=\"tablist\" aria-label=\"콘텐츠 보기 선택\">\n  <button type=\"button\" data-s1-part=\"tab\" role=\"tab\" aria-selected=\"true\" aria-controls=\"tab-panel-one\" data-value=\"one\">탭 메뉴 1</button>\n  <button type=\"button\" data-s1-part=\"tab\" role=\"tab\" aria-selected=\"false\" aria-controls=\"tab-panel-two\" data-value=\"two\">탭 메뉴 2</button>\n  <button type=\"button\" data-s1-part=\"tab\" role=\"tab\" aria-selected=\"false\" aria-controls=\"tab-panel-three\" data-value=\"three\">탭 메뉴 3</button>\n  <div id=\"tab-panel-one\" role=\"tabpanel\">첫 번째 내용</div>\n  <div id=\"tab-panel-two\" role=\"tabpanel\" hidden>두 번째 내용</div>\n  <div id=\"tab-panel-three\" role=\"tabpanel\" hidden>세 번째 내용</div>\n</div>",
  "mobile": "<div data-s1-component=\"tab\" data-size=\"sm\" data-break=\"mobile\" role=\"tablist\" aria-label=\"콘텐츠 보기 선택\">\n  <button type=\"button\" data-s1-part=\"tab\" role=\"tab\" aria-selected=\"true\" data-value=\"one\">탭 메뉴 1</button>\n  <button type=\"button\" data-s1-part=\"tab\" role=\"tab\" aria-selected=\"false\" data-value=\"two\">탭 메뉴 2</button>\n  <button type=\"button\" data-s1-part=\"tab\" role=\"tab\" aria-selected=\"false\" data-value=\"three\">탭 메뉴 3</button>\n</div>"
};
export const DEFAULT_BREAK = "pc";
export const BREAKS = ["pc","mobile"];
export const VARIANTS = ["line"];
export const SIZES = ["md","sm","xsm"];
export const PARTS = ["tab","tabpanel (optional)"];
/* variant·size 를 담는 속성 이름은 컴포넌트마다 다르다 — 승인된 마크업에서 읽어 온 것이다.
   null 이면 그 축이 마크업 속성으로 드러나지 않아 prop 으로 바꿀 수 없다는 뜻이다. */
export const VARIANT_ATTRIBUTE = null;
export const SIZE_ATTRIBUTE = "data-size";

function assertAllowed(label, value, allowed) {
  if (value === undefined || allowed.length === 0 || allowed.includes(value)) return;
  throw new Error(`[s1-ui] tab: 승인되지 않은 ${label} "${value}". 쓸 수 있는 값: ${allowed.join(", ")}`);
}

export default function S1Tab({ variant, size, breakName = DEFAULT_BREAK, parts, className, style, ...rest }) {
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
