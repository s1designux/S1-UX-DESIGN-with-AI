/* react-harness/ssr-entry.jsx — 서버(Node)에서 부품을 그려 보는 시험.
 * README 4장 "컴포넌트는 서버에서도 같은 마크업을 냅니다" 를 확인한다.
 * vite build --ssr 로 묶은 뒤 node 로 돌린다(브라우저 전역 window/document 가 없는 곳).
 * CSS import 는 서버 묶음에서 빠진다(Vite 기본 동작).
 */
import { renderToString } from "react-dom/server";
import { createElement as h } from "react";
import * as S1 from "./s1-ui/platform/react";

const modules = import.meta.glob("./s1-ui/platform/react/*.jsx", { eager: true });
const isComponent = (v) => typeof v === "function" || (v && typeof v === "object" && v.$$typeof);   // forwardRef 로 감싼 부품은 객체다
const nameOf = new Map(Object.entries(S1).filter(([, v]) => isComponent(v)).map(([k, v]) => [v, k]));
const out = [];
for (const [file, mod] of Object.entries(modules)) {
  const name = nameOf.get(mod.default);
  const forms = mod.FORMS || mod.BREAKS || ["pc"];
  for (const breakName of forms) {
    const props = forms.length > 1 ? { breakName } : {};
    try {
      const html = renderToString(h(S1[name], props));
      out.push({ name, breakName, ok: true, bytes: html.length, hasRoot: /data-s1-component=/.test(html) });
    } catch (error) {
      out.push({ name, breakName, ok: false, error: String(error && error.message || error).slice(0, 300) });
    }
  }
}
/* README 예시 — 서버에서도 그려져야 한다 */
const readmeModules = import.meta.glob("./readme-example-*.jsx", { eager: true });
for (const [file, mod] of Object.entries(readmeModules)) {
  try {
    const html = renderToString(h(mod.default));
    out.push({ name: file.replace("./", ""), breakName: "readme", ok: true, bytes: html.length, hasRoot: /data-s1-component=/.test(html) });
  } catch (error) {
    out.push({ name: file.replace("./", ""), breakName: "readme", ok: false, error: String(error && error.message || error).slice(0, 300) });
  }
}
console.log(`__SSR_RESULT__${JSON.stringify({ windowDefined: typeof window !== "undefined", out })}`);
