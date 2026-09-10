/**
 * kotlin-icons.mjs — 배포본 아이콘 SVG 를 Compose ImageVector 로 옮긴다.
 * --------------------------------------------------------------------------
 * 웹은 SVG 를 mask 로 씌워 색을 입힌다. Compose 에는 그 방식이 없어 벡터로 옮기고
 * 그릴 때 tint 를 준다 — 모양(path)은 원본 그대로다.
 *
 * 안쪽 <svg x y width height viewBox> 의 위치 이동은 좌표에 그대로 반영한다.
 * 확대·축소가 섞여 있으면(=1 이 아니면) 멈춘다 — 조용히 어림잡지 않는다.
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
  return { name, width: Number(outer.width), height: Number(outer.height), paths };
}

const CAP = { butt: "StrokeCap.Butt", round: "StrokeCap.Round", square: "StrokeCap.Square" };
const JOIN = { miter: "StrokeJoin.Miter", round: "StrokeJoin.Round", bevel: "StrokeJoin.Bevel" };

export function iconsKt(pkg, icons, note) {
  const lines = [
    `// ${note}`,
    "// 원본: ui-library/src/assets/icons/*.svg — 모양은 그대로, 색은 그릴 때 tint 로 준다.",
    "",
    `package ${pkg}`,
    "",
    "import androidx.compose.ui.graphics.Color",
    "import androidx.compose.ui.graphics.SolidColor",
    "import androidx.compose.ui.graphics.StrokeCap",
    "import androidx.compose.ui.graphics.StrokeJoin",
    "import androidx.compose.ui.graphics.vector.ImageVector",
    "import androidx.compose.ui.graphics.vector.PathParser",
    "import androidx.compose.ui.unit.dp",
    "",
    "object S1Icons {"
  ];
  const names = [];
  for (const icon of icons) {
    const property = icon.name.split(/[-_]/).map((piece, index) => (index === 0 ? piece : piece[0].toUpperCase() + piece.slice(1))).join("");
    names.push([icon.name, property]);
    lines.push(`    /** ${icon.name}.svg (${icon.width}×${icon.height}) */`);
    lines.push(`    val ${property}: ImageVector by lazy {`);
    lines.push(`        ImageVector.Builder(`);
    lines.push(`            name = "${icon.name}",`);
    lines.push(`            defaultWidth = ${icon.width}f.dp,`);
    lines.push(`            defaultHeight = ${icon.height}f.dp,`);
    lines.push(`            viewportWidth = ${icon.width}f,`);
    lines.push(`            viewportHeight = ${icon.height}f`);
    lines.push(`        )`);
    for (const path of icon.paths) {
      const options = [`pathData = PathParser().parsePathString("${path.data}").toNodes()`];
      if (path.filled) options.push("fill = SolidColor(Color.Black)");
      if (path.stroked) {
        options.push("stroke = SolidColor(Color.Black)");
        options.push(`strokeLineWidth = ${path.strokeWidth}f`);
        options.push(`strokeLineCap = ${CAP[path.strokeCap] ?? CAP.butt}`);
        options.push(`strokeLineJoin = ${JOIN[path.strokeJoin] ?? JOIN.miter}`);
      }
      lines.push(`            .addPath(`);
      lines.push(options.map((option) => `                ${option}`).join(",\n"));
      lines.push(`            )`);
    }
    lines.push(`            .build()`);
    lines.push(`    }`);
    lines.push("");
  }
  lines.push("    /** 배포본이 이름으로 가리키는 아이콘을 찾는다(스타일 표의 icon 값). */");
  lines.push("    fun byName(name: String): ImageVector = when (name) {");
  for (const [file, property] of names) lines.push(`        "${file}" -> ${property}`);
  lines.push(`        else -> error("[s1] 배포본에 없는 아이콘: $name")`);
  lines.push("    }");
  lines.push("}");
  return lines.join("\n") + "\n";
}
