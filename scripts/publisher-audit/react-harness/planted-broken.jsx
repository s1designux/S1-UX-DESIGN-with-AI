/* planted-broken.jsx — 자가시험(--selftest) 전용 "일부러 고장 낸" 부품.
 * 검수기의 탐지기가 실제로 울리는지 증명하려고 심는다. 배포본과 무관하다.
 *   PlantedConsoleError  — 그릴 때마다 console.error
 *   PlantedDoubleBind    — useEffect 에서 document 에 듣기를 달고 치우지 않는다(StrictMode 에서 두 번 붙고, 떼도 남는다)
 *   PlantedStaleProp     — 첫 값만 기억하고 이후 prop 이 바뀌어도 화면이 그대로
 *   PlantedGood          — 대조군(정상)
 */
import { useEffect, useRef, useState } from "react";

function PlantedConsoleError({ parts }) {
  console.error("planted-console-error");
  return <button type="button" data-s1-component="planted-console-error"><span data-s1-part="label">{parts?.label ?? "오류"}</span></button>;
}

function PlantedDoubleBind({ parts }) {
  const ref = useRef(null);
  useEffect(() => {
    document.addEventListener("click", () => { window.__plantedClicks = (window.__plantedClicks || 0) + 1; });
    /* 일부러 정리(return)하지 않는다 */
  }, []);
  return <button type="button" ref={ref} data-s1-component="planted-double-bind"><span data-s1-part="label">{parts?.label ?? "두 번"}</span></button>;
}

function PlantedStaleProp({ parts }) {
  const [frozen] = useState(parts?.label ?? "처음");
  return <button type="button" data-s1-component="planted-stale-prop"><span data-s1-part="label">{frozen}</span></button>;
}

function PlantedGood({ parts, className, style, ...rest }) {
  return <button type="button" data-s1-component="planted-good" className={className} style={style} {...rest}><span data-s1-part="label">{parts?.label ?? "정상"}</span></button>;
}

const entry = (name) => ({ file: "planted-broken.jsx", name, breaks: ["pc"], variants: [], sizes: [], parts: ["label"], planted: true });
export const catalog = ["PlantedConsoleError", "PlantedDoubleBind", "PlantedStaleProp", "PlantedGood"].map(entry);
export default { PlantedConsoleError, PlantedDoubleBind, PlantedStaleProp, PlantedGood };
