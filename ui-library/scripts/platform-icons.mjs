/**
 * platform-icons.mjs — 배포본 아이콘 SVG 를 플랫폼 중립 경로 데이터로 읽는다.
 * --------------------------------------------------------------------------
 * Kotlin(ImageVector)·Swift(SwiftUI Path)가 같은 원본·같은 읽기 규칙을 쓴다.
 * 안쪽 <svg x y width height viewBox> 의 위치 이동은 좌표에 그대로 반영한다.
 * 확대·축소가 섞여 있으면(=1 이 아니면) 멈춘다 — 조용히 어림잡지 않는다.
 * (원래 kotlin-icons.mjs 안에 있던 것을 2026-10-02 에 꺼냈다. 동작은 그대로다.)
 */

const NUMBER = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

function attributes(tag) {
  const out = {};
  for (const match of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g)) out[match[1]] = match[2];
  return out;
}

/** SVG path 를 절대 좌표로 바꾸고 (tx, ty) 만큼 옮긴다. */
export function translatePath(data, tx, ty) {
  const tokens = data.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  const out = [];
  let index = 0;
  let command = null;
  let current = [0, 0];
  let start = [0, 0];

  const take = (count) => {
    const values = [];
    for (let i = 0; i < count; i += 1) values.push(Number(tokens[index++]));
    return values;
  };
  const emit = (letter, values) => out.push(letter + (values.length ? " " + values.map(round).join(" ") : ""));

  while (index < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[index])) command = tokens[index++];
    const relative = command === command.toLowerCase();
    const upper = command.toUpperCase();
    const point = (x, y) => (relative ? [current[0] + x, current[1] + y] : [x, y]);

    if (upper === "M" || upper === "L" || upper === "T") {
      const [x, y] = take(2);
      current = point(x, y);
      if (upper === "M") start = [...current];
      emit(upper, [current[0] + tx, current[1] + ty]);
      if (upper === "M") command = relative ? "l" : "L";
      continue;
    }
    if (upper === "H") {
      const [x] = take(1);
      current = [relative ? current[0] + x : x, current[1]];
      emit("H", [current[0] + tx]);
      continue;
    }
    if (upper === "V") {
      const [y] = take(1);
      current = [current[0], relative ? current[1] + y : y];
      emit("V", [current[1] + ty]);
      continue;
    }
    if (upper === "C") {
      const [x1, y1, x2, y2, x, y] = take(6);
      const a = point(x1, y1);
      const b = point(x2, y2);
      current = point(x, y);
      emit("C", [a[0] + tx, a[1] + ty, b[0] + tx, b[1] + ty, current[0] + tx, current[1] + ty]);
      continue;
    }
    if (upper === "S" || upper === "Q") {
      const [x1, y1, x, y] = take(4);
      const a = point(x1, y1);
      current = point(x, y);
      emit(upper, [a[0] + tx, a[1] + ty, current[0] + tx, current[1] + ty]);
      continue;
    }
    if (upper === "A") {
      const [rx, ry, rotation, largeArc, sweep, x, y] = take(7);
      current = point(x, y);
      emit("A", [rx, ry, rotation, largeArc, sweep, current[0] + tx, current[1] + ty]);
      continue;
    }
    if (upper === "Z") {
      current = [...start];
      out.push("Z");
      continue;
    }
    throw new Error(`지원하지 않는 path 명령: ${command}`);
  }
  return out.join(" ");
}

const round = (value) => {
  const fixed = Number(value.toFixed(4));
  return Number.isInteger(fixed) ? String(fixed) : String(fixed);
};

/** 아이콘 하나를 읽어 {name, width, height, paths[]} 로 바꾼다. */
export function readIcon(name, svg) {
  const openTags = [...svg.matchAll(/<svg\b([^>]*)>/g)];
  if (openTags.length !== 2) throw new Error(`${name}: 바깥 svg 1개 + 안쪽 svg 1개 구조가 아닙니다(발견 ${openTags.length}개).`);
  const outer = attributes(openTags[0][1]);
  const inner = attributes(openTags[1][1]);
  const viewBox = (inner.viewBox ?? "").trim().split(/[\s,]+/).map(Number);
  if (viewBox.length !== 4) throw new Error(`${name}: 안쪽 svg 에 viewBox 가 없습니다.`);
  const scaleX = Number(inner.width) / viewBox[2];
  const scaleY = Number(inner.height) / viewBox[3];
  if (Math.abs(scaleX - 1) > 1e-6 || Math.abs(scaleY - 1) > 1e-6) {
    throw new Error(`${name}: 안쪽 svg 가 확대·축소돼 있습니다(${scaleX}×${scaleY}). 좌표 이동만 지원합니다.`);
  }
  const tx = Number(inner.x ?? 0) - viewBox[0];
  const ty = Number(inner.y ?? 0) - viewBox[1];

  const paths = [];
  for (const match of svg.matchAll(/<path\b([^>]*)\/?>/g)) {
    const attribute = attributes(match[1]);
    if (!attribute.d) continue;
    paths.push({
      data: translatePath(attribute.d, tx, ty),
      filled: attribute.fill !== undefined && attribute.fill !== "none",
      stroked: attribute.stroke !== undefined && attribute.stroke !== "none",
      strokeWidth: attribute["stroke-width"] ? Number(attribute["stroke-width"]) : 1,
      strokeCap: attribute["stroke-linecap"] ?? "butt",
      strokeJoin: attribute["stroke-linejoin"] ?? "miter",
      fillRule: attribute["fill-rule"] ?? "nonzero"
    });
  }
  if (paths.length === 0) throw new Error(`${name}: path 가 없습니다.`);
  /* <circle> 도 읽는다 — 시계·돋보기 아이콘이 원을 쓴다. Kotlin 출력부는 paths 만 쓰므로 이 필드를 보지 않는다(Kotlin 산출물은 그대로).
     Swift 출력부가 원을 호(arc) 경로로 바꿔 함께 그린다. */
  const circles = [];
  for (const match of svg.matchAll(/<circle\b([^>]*)\/?>/g)) {
    const attribute = attributes(match[1]);
    const cx = Number(attribute.cx) + tx;
    const cy = Number(attribute.cy) + ty;
    const r = Number(attribute.r);
    circles.push({
      data: `M ${round(cx - r)} ${round(cy)} A ${round(r)} ${round(r)} 0 1 0 ${round(cx + r)} ${round(cy)} A ${round(r)} ${round(r)} 0 1 0 ${round(cx - r)} ${round(cy)} Z`,
      filled: attribute.fill !== undefined && attribute.fill !== "none",
      stroked: attribute.stroke !== undefined && attribute.stroke !== "none",
      strokeWidth: attribute["stroke-width"] ? Number(attribute["stroke-width"]) : 1,
      strokeCap: attribute["stroke-linecap"] ?? "butt",
      strokeJoin: attribute["stroke-linejoin"] ?? "miter",
      fillRule: "nonzero"
    });
  }
  return { name, width: Number(outer.width), height: Number(outer.height), paths, circles };
}

