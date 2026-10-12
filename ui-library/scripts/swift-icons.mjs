/**
 * swift-icons.mjs — 배포본 아이콘 SVG 경로 데이터를 Swift 로 굳힌다.
 * --------------------------------------------------------------------------
 * 원본은 Kotlin 과 같은 SVG 다(platform-icons.mjs 가 읽는다). 모양(path)은 원본 그대로이고
 * 그릴 때 S1Icon(swift-runtime.mjs)이 SVG 경로를 SwiftUI Path 로 해석해 tint 를 입힌다.
 */

const CAP = { butt: ".butt", round: ".round", square: ".square" };
const JOIN = { miter: ".miter", round: ".round", bevel: ".bevel" };

const property = (name) => name.split(/[-_]/).map((piece, index) => (index === 0 ? piece : piece[0].toUpperCase() + piece.slice(1))).join("");

export function iconsSwift(icons, note) {
  const lines = [
    `// ${note}`,
    "// 원본: ui-library/src/assets/icons/*.svg — 모양은 그대로, 색은 그릴 때 tint 로 준다.",
    "",
    "import CoreGraphics",
    "",
    "public enum S1Icons {"
  ];
  const names = [];
  for (const icon of icons) {
    const id = property(icon.name);
    names.push([icon.name, id]);
    lines.push(`    /// ${icon.name}.svg (${icon.width}×${icon.height})`);
    lines.push(`    public static let ${id} = S1IconData(name: "${icon.name}", width: ${icon.width}, height: ${icon.height}, paths: [`);
    lines.push([...icon.paths, ...(icon.circles ?? [])].map((path) =>
      `        S1IconPath(data: "${path.data}", filled: ${path.filled}, stroked: ${path.stroked}, strokeWidth: ${path.strokeWidth}, lineCap: ${CAP[path.strokeCap] ?? CAP.butt}, lineJoin: ${JOIN[path.strokeJoin] ?? JOIN.miter}, evenOdd: ${path.fillRule === "evenodd"})`
    ).join(",\n"));
    lines.push("    ])");
    lines.push("");
  }
  lines.push("    /// 배포본이 이름으로 가리키는 아이콘을 찾는다(스타일 표의 icon 값).");
  lines.push("    public static func byName(_ name: String) -> S1IconData {");
  lines.push("        switch name {");
  for (const [file, id] of names) lines.push(`        case "${file}": return ${id}`);
  lines.push(`        default: fatalError("[s1] 배포본에 없는 아이콘: \\(name)")`);
  lines.push("        }");
  lines.push("    }");
  lines.push("}");
  return lines.join("\n") + "\n";
}

export function typeSwift(styles, note) {
  const lines = [
    `// ${note}`,
    "// 정본: plugins/figma-vars-installer/src/textstyles-data.ts → assets/css/typography.css",
    "// 낱개 값은 S1Tokens 에 있다. 여기 있는 것은 이름으로 부르는 묶음이다.",
    "//",
    "// 쓰는 법:  S1Text(\"본문\", type: S1Type.body14r, color: S1Palette.colorTextBodyPrimary)",
    "",
    "import CoreGraphics",
    "",
    "public enum S1Type {"
  ];
  for (const style of styles) {
    lines.push(`    /// typo-${style.name} — ${style.fontSize.value}pt · 굵기 ${style.fontWeight.value} · 줄간격 ${style.lineHeight.value} · 자간 ${style.letterSpacing.value}em`);
    lines.push(`    public static let ${style.property} = S1TypeSpec(fontSize: ${style.fontSize.value}, fontWeight: ${style.fontWeight.value}, lineHeight: ${style.lineHeight.value}, letterSpacing: ${style.letterSpacing.value})`);
  }
  lines.push("");
  lines.push("    /// 승인 목록의 이름과 값 — 순서는 정본 순서다.");
  lines.push("    public static let all: [(name: String, spec: S1TypeSpec)] = [");
  lines.push(styles.map((style) => `        (name: "${style.name}", spec: ${style.property})`).join(",\n"));
  lines.push("    ]");
  lines.push("");
  lines.push("    /// 이름으로 찾는다. 승인 목록에 없는 이름이면 그 자리에서 멈춘다.");
  lines.push("    public static func byName(_ name: String) -> S1TypeSpec {");
  lines.push("        guard let found = all.first(where: { $0.name == name }) else {");
  lines.push("            fatalError(\"[s1] 승인 목록에 없는 텍스트 스타일: \\(name). 쓸 수 있는 이름: \\(all.map { $0.name }.joined(separator: \", \"))\")");
  lines.push("        }");
  lines.push("        return found.spec");
  lines.push("    }");
  lines.push("}");
  return lines.join("\n") + "\n";
}
