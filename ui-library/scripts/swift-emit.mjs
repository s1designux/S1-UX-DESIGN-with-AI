/**
 * swift-emit.mjs — 뽑아낸 스타일 표를 Swift 파일로 굳힌다.
 * --------------------------------------------------------------------------
 * 표(값) 생성은 완전히 기계적이다. 화면을 그리는 뼈대(SwiftUI 트리)만 부품마다
 * 정해 두고, 그 안의 치수·색은 한 자리도 여기서 적지 않는다.
 * Kotlin 출력부(kotlin-emit.mjs)와 같은 표를 읽는다 — 다른 것은 문법뿐이다.
 */

const pascal = (id) => id.split(/[-_ ]/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join("");
const camelToken = (name) => name.replace(/^--/, "").split("-").filter(Boolean)
  .map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1))).join("");
const camelId = (id) => id.split("-").map((piece, index) => (index === 0 ? piece : piece[0].toUpperCase() + piece.slice(1))).join("");

/* ── 팔레트 ──────────────────────────────────────────────────────────── */

export function toArgb(value) {
  const hex = /^#([0-9a-f]+)$/i.exec(String(value).trim());
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) digits = [...digits].map((c) => c + c).join("");
    if (digits.length === 6) return `0xFF${digits.toUpperCase()}`;
    if (digits.length === 8) return `0x${digits.slice(6, 8).toUpperCase()}${digits.slice(0, 6).toUpperCase()}`;
    return null;
  }
  const rgba = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(String(value).trim());
  if (!rgba) return null;
  const channel = (input) => Math.round(Number(input)).toString(16).padStart(2, "0").toUpperCase();
  const alphaInput = rgba[4];
  const alpha = alphaInput === undefined ? 255
    : Math.round((alphaInput.endsWith("%") ? Number(alphaInput.slice(0, -1)) / 100 : Number(alphaInput)) * 255);
  return `0x${channel(alpha)}${channel(rgba[1])}${channel(rgba[2])}${channel(rgba[3])}`;
}

export function paletteSwift(tokens, note) {
  const colors = tokens.filter((token) => token.type === "color");
  const lines = [
    `// ${note}`,
    "// 색 하나마다 라이트·다크 값을 한 쌍으로 들고 있다. 어느 쪽을 쓸지는 화면의 colorScheme 이 정한다.",
    "",
    "public enum S1Palette {"
  ];
  for (const token of colors) {
    const light = toArgb(token.value);
    if (light === null) continue;
    const dark = token.darkValue ? toArgb(token.darkValue) : light;
    lines.push(`    /// ${token.name} — 라이트 ${token.value}${token.darkValue ? ` · 다크 ${token.darkValue}` : ""}`);
    lines.push(`    public static let ${camelToken(token.name)} = S1Color(${light}, ${dark ?? light})`);
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}

/* ── 스타일 표 ───────────────────────────────────────────────────────── */

/** S1Box 의 선언 순서 — Swift 는 이름 붙은 인자를 선언 순서대로 적어야 한다. swift-runtime.mjs 의 S1Box 와 같아야 한다. */
export const BOX_FIELD_ORDER = [
  "background", "backgroundInherit", "foreground", "foregroundInherit", "borderColor", "borderWidth", "radius",
  "height", "minHeight", "width", "minWidth", "paddingStart", "paddingEnd", "paddingTop", "paddingBottom",
  "gap", "marginStart", "marginTop", "fontSize", "fontWeight", "letterSpacing", "lineHeight", "opacity", "rotation",
  "icon", "underline", "left", "right", "top", "marginEnd", "marginBottom", "maxWidth", "maxHeight", "maxHeightVh",
  "radiusTopStart", "radiusTopEnd", "scaleX", "flexBasis", "spaceBetween", "durationMs", "gradient", "shadow"
];

/** 0 이면 적지 않는 필드 — 기본값이 0 이라 같은 뜻이다(Kotlin 표와 같은 규칙). */
const SKIP_WHEN_ZERO = new Set(["borderWidth", "radius", "gap", "marginStart", "marginTop", "marginEnd", "marginBottom", "letterSpacing", "paddingStart", "paddingEnd", "paddingTop", "paddingBottom"]);

const NUMERIC = new Set(["borderWidth", "radius", "height", "minHeight", "width", "minWidth", "paddingStart", "paddingEnd", "paddingTop", "paddingBottom", "gap", "marginStart", "marginTop", "fontSize", "letterSpacing", "lineHeight", "opacity", "rotation", "left", "right", "top", "marginEnd", "marginBottom", "maxWidth", "maxHeight", "maxHeightVh", "radiusTopStart", "radiusTopEnd", "scaleX", "flexBasis"]);

const num = (value) => String(value);

export function boxLiteral(box) {
  const color = (value) => `S1Palette.${camelToken(value.token)}`;
  const fields = [];
  for (const field of BOX_FIELD_ORDER) {
    if (field === "background") {
      if (box.background && !box.background.inherit) fields.push(`background: ${color(box.background)}`);
    } else if (field === "backgroundInherit") {
      if (box.background && box.background.inherit) fields.push("backgroundInherit: true");
    } else if (field === "foreground") {
      if (box.foreground && !box.foreground.inherit) fields.push(`foreground: ${color(box.foreground)}`);
    } else if (field === "foregroundInherit") {
      if (box.foreground && box.foreground.inherit) fields.push("foregroundInherit: true");
    } else if (field === "borderColor") {
      if (box.borderColor) fields.push(`borderColor: ${color(box.borderColor)}`);
    } else if (NUMERIC.has(field)) {
      const value = box[field];
      if (value === undefined || value === null) continue;
      if (SKIP_WHEN_ZERO.has(field) && value === 0) continue;
      fields.push(`${field}: ${num(value)}`);
    } else if (field === "fontWeight") {
      if (box.fontWeight) fields.push(`fontWeight: ${box.fontWeight}`);
    } else if (field === "icon") {
      if (box.icon) fields.push(`icon: "${box.icon}"`);
    } else if (field === "underline") {
      if (box.underline) fields.push("underline: true");
    } else if (field === "spaceBetween") {
      if (box.spaceBetween) fields.push("spaceBetween: true");
    } else if (field === "durationMs") {
      if (box.durationMs) fields.push(`durationMs: ${box.durationMs}`);
    } else if (field === "gradient") {
      if (box.gradient) {
        const stops = box.gradient.map((stop) => `S1GradientStop(offset: ${num(stop.offset)}, color: ${stop.token ? `S1Palette.${camelToken(stop.token)}` : "nil"}, alpha: ${num(stop.alpha)})`);
        fields.push(`gradient: [${stops.join(", ")}]`);
      }
    } else if (field === "shadow") {
      if (box.shadow) {
        const layers = box.shadow.map((layer) => `S1Shadow(x: ${num(layer.x)}, y: ${num(layer.y)}, blur: ${num(layer.blur)}, spread: ${num(layer.spread)}, color: ${layer.color})`);
        fields.push(`shadow: [${layers.join(", ")}]`);
      }
    }
  }
  return `S1Box(${fields.join(", ")})`;
}

function tableSwift(name, table, component, indent = "    ") {
  const lines = [`${indent}public static let ${name}: [String: [String: S1Box]] = {`, `${indent}    var table: [String: [String: S1Box]] = [:]`];
  for (const [key, row] of Object.entries(table)) {
    lines.push(`${indent}    table["${key}"] = [`);
    const parts = Object.entries(row.parts).map(([part, box]) => `${indent}        "${part}": ${boxLiteral(box)}`);
    lines.push(parts.join(",\n"));
    lines.push(`${indent}    ]`);
  }
  lines.push(`${indent}    return table`, `${indent}}()`);
  return lines;
}

export function specSwift(spec, note) {
  const name = `S1${pascal(spec.id)}Spec`;
  const lines = [
    `// ${note}`,
    `// ${spec.id} 의 승인된 조합별 최종 값. 배포본 CSS 를 캐스케이드까지 계산해 굳힌 것이다.`,
    "",
    "import CoreGraphics",
    "",
    `public enum ${name} {`
  ];
  for (const [axis, value] of Object.entries(spec.axes)) {
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      lines.push(`    public static let ${axis}: [String] = [${value.map((item) => `"${item}"`).join(", ")}]`);
    } else if (Array.isArray(value)) {
      lines.push(`    /// ${axis} — 승인된 (size, break) 조합만 담는다.`);
      lines.push(`    public static let ${axis}: [S1SizeBreak] = [${value.map((item) => `S1SizeBreak(size: "${item.size}", breakName: "${item.breakName}")`).join(", ")}]`);
    } else if (value && typeof value === "object") {
      lines.push(`    public static let ${axis}: [String: [String]] = [${Object.entries(value).map(([k, v]) => `"${k}": [${v.map((item) => `"${item}"`).join(", ")}]`).join(", ")}]`);
    }
  }
  lines.push("");
  lines.push(...tableSwift("boxes", spec.table, spec.id));
  lines.push("");
  lines.push(`    public static func box(_ key: String, _ part: String) -> S1Box { s1Lookup(boxes, key, part, "${spec.id}") }`);
  for (const [extraId, extra] of Object.entries(spec.extras ?? {})) {
    const property = camelId(extraId);
    lines.push("");
    lines.push(...tableSwift(`${property}Boxes`, extra.table, extraId));
    lines.push("");
    lines.push(`    public static func ${property}Box(_ key: String, _ part: String) -> S1Box { s1Lookup(${property}Boxes, key, part, "${extraId}") }`);
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}
