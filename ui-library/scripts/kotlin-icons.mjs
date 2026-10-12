/**
 * kotlin-icons.mjs — 배포본 아이콘 SVG 를 Compose ImageVector 로 옮긴다.
 * --------------------------------------------------------------------------
 * 웹은 SVG 를 mask 로 씌워 색을 입힌다. Compose 에는 그 방식이 없어 벡터로 옮기고
 * 그릴 때 tint 를 준다 — 모양(path)은 원본 그대로다.
 *
 * 안쪽 <svg x y width height viewBox> 의 위치 이동은 좌표에 그대로 반영한다.
 * 확대·축소가 섞여 있으면(=1 이 아니면) 멈춘다 — 조용히 어림잡지 않는다.
 */

import { readIcon, translatePath } from "./platform-icons.mjs";
export { readIcon, translatePath };

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
