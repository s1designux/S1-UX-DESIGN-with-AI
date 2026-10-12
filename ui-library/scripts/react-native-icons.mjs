/**
 * react-native-icons.mjs — 배포본 아이콘 SVG 를 RN(react-native-svg) 경로 목록으로 옮긴다.
 * --------------------------------------------------------------------------
 * kotlin-icons.mjs 의 readIcon 은 <path> 만 읽는다. RN 쪽은 원본 도형을 하나도 버리지 않는다:
 *   · path · circle · ellipse · rect · line · polygon · polyline  → 모두 path 데이터로 바꿔 그린다
 *   · <g transform="translate(x y)"> 는 안쪽 도형 좌표에 그대로 더한다 (그 밖의 transform 은 멈춘다)
 *   · 안쪽 <svg x y width height viewBox> 의 위치 이동도 좌표에 더한다 (확대·축소가 섞이면 멈춘다)
 * 조용히 어림잡지 않는다 — 모르는 요소·속성은 오류로 멈춘다.
 *
 * 원본 도형 개수는 sourceShapes 로 같이 돌려준다. rn:parity 가 "원본 도형 수 == 옮긴 경로 수" 를 다시 센다.
 */

import { translatePath } from "./kotlin-icons.mjs";

const SHAPES = new Set(["path", "circle", "ellipse", "rect", "line", "polygon", "polyline"]);
const KNOWN_ATTRIBUTES = new Set([
  "d", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "x1", "y1", "x2", "y2", "points",
  "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "fill-rule", "clip-rule", "id", "data-name"
]);

function attributes(tag) {
  const out = {};
  for (const match of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g)) out[match[1]] = match[2];
  return out;
}

const num = (value, fallback = 0) => (value === undefined ? fallback : Number(value));
const round = (value) => String(Number(value.toFixed(4)));

/** 도형 하나 → path 데이터(옮김 전 좌표). */
export function shapeToPath(name, shape, tag) {
  switch (tag) {
    case "path":
      return shape.d;
    case "circle": {
      const [cx, cy, r] = [num(shape.cx), num(shape.cy), num(shape.r)];
      return `M ${round(cx - r)} ${round(cy)} A ${round(r)} ${round(r)} 0 1 0 ${round(cx + r)} ${round(cy)} A ${round(r)} ${round(r)} 0 1 0 ${round(cx - r)} ${round(cy)} Z`;
    }
    case "ellipse": {
      const [cx, cy, rx, ry] = [num(shape.cx), num(shape.cy), num(shape.rx), num(shape.ry)];
      return `M ${round(cx - rx)} ${round(cy)} A ${round(rx)} ${round(ry)} 0 1 0 ${round(cx + rx)} ${round(cy)} A ${round(rx)} ${round(ry)} 0 1 0 ${round(cx - rx)} ${round(cy)} Z`;
    }
    case "rect": {
      if (shape.rx !== undefined || shape.ry !== undefined) throw new Error(`${name}: 둥근 rect(rx·ry)는 아직 지원하지 않습니다.`);
      const [x, y, w, h] = [num(shape.x), num(shape.y), num(shape.width), num(shape.height)];
      return `M ${round(x)} ${round(y)} H ${round(x + w)} V ${round(y + h)} H ${round(x)} Z`;
    }
    case "line":
      return `M ${round(num(shape.x1))} ${round(num(shape.y1))} L ${round(num(shape.x2))} ${round(num(shape.y2))}`;
    case "polygon":
    case "polyline": {
      const points = (shape.points ?? "").trim().split(/[\s,]+/).map(Number);
      if (points.length < 4 || points.length % 2 !== 0) throw new Error(`${name}: ${tag} points 가 올바르지 않습니다.`);
      let d = `M ${points[0]} ${points[1]}`;
      for (let i = 2; i < points.length; i += 2) d += ` L ${points[i]} ${points[i + 1]}`;
      return tag === "polygon" ? `${d} Z` : d;
    }
    default:
      throw new Error(`${name}: 지원하지 않는 도형 ${tag}`);
  }
}

/** {name, width, height, paths[], sourceShapes} */
export function readRnIcon(name, svg) {
  const svgTags = [...svg.matchAll(/<svg\b([^>]*)>/g)];
  if (svgTags.length !== 2) throw new Error(`${name}: 바깥 svg 1개 + 안쪽 svg 1개 구조가 아닙니다(발견 ${svgTags.length}개).`);
  const outer = attributes(svgTags[0][1]);
  const inner = attributes(svgTags[1][1]);
  const viewBox = (inner.viewBox ?? "").trim().split(/[\s,]+/).map(Number);
  if (viewBox.length !== 4) throw new Error(`${name}: 안쪽 svg 에 viewBox 가 없습니다.`);
  const scaleX = Number(inner.width) / viewBox[2];
  const scaleY = Number(inner.height) / viewBox[3];
  if (Math.abs(scaleX - 1) > 1e-6 || Math.abs(scaleY - 1) > 1e-6) throw new Error(`${name}: 안쪽 svg 가 확대·축소돼 있습니다(${scaleX}×${scaleY}).`);
  const baseX = Number(inner.x ?? 0) - viewBox[0];
  const baseY = Number(inner.y ?? 0) - viewBox[1];

  const paths = [];
  let sourceShapes = 0;
  const stack = [[baseX, baseY]];
  const innerStart = svgTags[1].index + svgTags[1][0].length;
  const body = svg.slice(innerStart);

  for (const match of body.matchAll(/<\/g\s*>|<(g|path|circle|ellipse|rect|line|polygon|polyline)\b([^>]*?)(\/?)>/g)) {
    if (match[0].startsWith("</g")) { stack.pop(); continue; }
    const tag = match[1];
    const attr = attributes(match[2]);
    if (tag === "g") {
      for (const key of Object.keys(attr)) {
        if (key !== "id" && key !== "transform" && key !== "data-name") throw new Error(`${name}: <g ${key}> 는 지원하지 않습니다.`);
      }
      let [tx, ty] = stack[stack.length - 1];
      if (attr.transform !== undefined) {
        const t = /^\s*translate\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)\s*$/.exec(attr.transform);
        if (!t) throw new Error(`${name}: g transform 은 translate(x y) 만 지원합니다 (${attr.transform}).`);
        tx += Number(t[1]); ty += Number(t[2]);
      }
      if (match[3] !== "/") stack.push([tx, ty]);
      continue;
    }
    for (const key of Object.keys(attr)) {
      if (!KNOWN_ATTRIBUTES.has(key)) throw new Error(`${name}: <${tag} ${key}> 는 지원하지 않습니다.`);
    }
    sourceShapes += 1;
    const [tx, ty] = stack[stack.length - 1];
    const d = shapeToPath(name, attr, tag);
    if (!d) continue;
    paths.push({
      tag,
      data: translatePath(d, tx, ty),
      filled: attr.fill !== undefined && attr.fill !== "none",
      stroked: attr.stroke !== undefined && attr.stroke !== "none",
      strokeWidth: attr["stroke-width"] ? Number(attr["stroke-width"]) : 1,
      strokeCap: attr["stroke-linecap"] ?? "butt",
      strokeJoin: attr["stroke-linejoin"] ?? "miter",
      fillRule: attr["fill-rule"] ?? "nonzero"
    });
  }
  if (paths.length === 0) throw new Error(`${name}: 도형이 없습니다.`);
  return { name, width: Number(outer.width), height: Number(outer.height), paths, sourceShapes };
}

/** 원본 SVG 의 도형 수를 따로 센다(변환기와 다른 방법 — 단순 태그 계수). rn:parity 가 쓴다. */
export function countSourceShapes(svg) {
  let count = 0;
  for (const tag of SHAPES) count += (svg.match(new RegExp(`<${tag}\\b`, "g")) ?? []).length;
  return count;
}
