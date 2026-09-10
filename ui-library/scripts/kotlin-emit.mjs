/**
 * kotlin-emit.mjs — 뽑아낸 스타일 표를 Kotlin 파일로 굳힌다.
 * --------------------------------------------------------------------------
 * 표(값) 생성은 완전히 기계적이다. 화면을 그리는 뼈대(Compose 트리)만 부품마다
 * 정해 두고, 그 안의 치수·색은 한 자리도 여기서 적지 않는다.
 */

const pascal = (id) => id.split(/[-_ ]/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join("");
const camelToken = (name) => name.replace(/^--/, "").split("-").filter(Boolean)
  .map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1))).join("");

const float = (value) => (Number.isInteger(value) ? `${value}f` : `${value}f`);

/* ── 팔레트 ──────────────────────────────────────────────────────────── */

export function paletteKt(pkg, tokens, note) {
  const colors = tokens.filter((token) => token.type === "color");
  const lines = [
    `// ${note}`,
    "// 색 하나마다 라이트·다크 값을 한 쌍으로 들고 있다. 어느 쪽을 쓸지는 S1Theme 이 정한다.",
    "",
    `package ${pkg}`,
    "",
    "object S1Palette {"
  ];
  for (const token of colors) {
    const light = toArgb(token.value);
    if (light === null) continue;
    const dark = token.darkValue ? toArgb(token.darkValue) : light;
    lines.push(`    /** ${token.name} — 라이트 ${token.value}${token.darkValue ? ` · 다크 ${token.darkValue}` : ""} */`);
    lines.push(`    val ${camelToken(token.name)}: S1Color = S1Color(${light}, ${dark ?? light})`);
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}

function toArgb(value) {
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

/* ── 스타일 표 ───────────────────────────────────────────────────────── */

function boxLiteral(box) {
  const fields = [];
  const color = (value) => (value.inherit ? null : `S1Palette.${camelToken(value.token)}`);
  if (box.background !== undefined && box.background !== null) {
    if (box.background.inherit) fields.push("backgroundInherit = true");
    else fields.push(`background = ${color(box.background)}`);
  }
  if (box.foreground !== undefined && box.foreground !== null) {
    if (box.foreground.inherit) fields.push("foregroundInherit = true");
    else fields.push(`foreground = ${color(box.foreground)}`);
  }
  if (box.borderColor) fields.push(`borderColor = ${color(box.borderColor)}`);
  for (const [field, key] of [
    ["borderWidth", "borderWidth"], ["radius", "radius"], ["height", "height"], ["minHeight", "minHeight"],
    ["width", "width"], ["minWidth", "minWidth"], ["paddingStart", "paddingStart"], ["paddingEnd", "paddingEnd"],
    ["paddingTop", "paddingTop"], ["paddingBottom", "paddingBottom"], ["gap", "gap"], ["marginStart", "marginStart"], ["marginTop", "marginTop"],
    ["fontSize", "fontSize"], ["letterSpacing", "letterSpacing"], ["lineHeight", "lineHeight"],
    ["opacity", "opacity"], ["rotation", "rotation"], ["left", "left"], ["right", "right"]
  ]) {
    const value = box[key];
    if (value === undefined || value === null) continue;
    if ((key === "borderWidth" || key === "radius" || key === "gap" || key === "marginStart" || key === "marginTop" ||
         key === "letterSpacing" || key.startsWith("padding")) && value === 0) continue;
    fields.push(`${field} = ${float(value)}`);
  }
  if (box.fontWeight) fields.push(`fontWeight = ${box.fontWeight}`);
  if (box.icon) fields.push(`icon = "${box.icon}"`);
  if (box.shadow) {
    const layers = box.shadow.map((layer) => `S1Shadow(${float(layer.x)}, ${float(layer.y)}, ${float(layer.blur)}, ${float(layer.spread)}, ${layer.color})`);
    fields.push(`shadow = listOf(${layers.join(", ")})`);
  }
  return `S1Box(${fields.join(", ")})`;
}

function tableLiteral(table, indent) {
  const pad = " ".repeat(indent);
  const rows = [];
  for (const [key, row] of Object.entries(table)) {
    const parts = Object.entries(row.parts)
      .map(([name, box]) => `${pad}        "${name}" to ${boxLiteral(box)}`)
      .join(",\n");
    rows.push(`${pad}    "${key}" to mapOf(\n${parts}\n${pad}    )`);
  }
  return `mapOf(\n${rows.join(",\n")}\n${pad})`;
}

export function specKt(pkg, spec, note) {
  const name = `S1${pascal(spec.id)}Spec`;
  const lines = [
    `// ${note}`,
    `// ${spec.id} 의 승인된 조합별 최종 값. 배포본 CSS 를 캐스케이드까지 계산해 굳힌 것이다.`,
    "",
    `package ${pkg}`,
    "",
    `object ${name} {`
  ];
  for (const [axis, value] of Object.entries(spec.axes)) {
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      lines.push(`    val ${axis}: List<String> = listOf(${value.map((item) => `"${item}"`).join(", ")})`);
    } else if (Array.isArray(value)) {
      lines.push(`    /** ${axis} — 승인된 (size, break) 조합만 담는다. */`);
      lines.push(`    val ${axis}: List<Pair<String, String>> = listOf(${value.map((item) => `"${item.size}" to "${item.breakName}"`).join(", ")})`);
    } else if (value && typeof value === "object") {
      lines.push(`    val ${axis}: Map<String, List<String>> = mapOf(${Object.entries(value).map(([k, v]) => `"${k}" to listOf(${v.map((item) => `"${item}"`).join(", ")})`).join(", ")})`);
    }
  }
  lines.push("");
  lines.push(`    val boxes: Map<String, Map<String, S1Box>> = ${tableLiteral(spec.table, 4)}`);
  lines.push("");
  lines.push(`    fun box(key: String, part: String): S1Box = boxes.box(key, part, "${spec.id}")`);
  for (const [extraId, extra] of Object.entries(spec.extras ?? {})) {
    const property = extraId.split("-").map((piece, index) => (index === 0 ? piece : piece[0].toUpperCase() + piece.slice(1))).join("");
    lines.push("");
    lines.push(`    val ${property}Boxes: Map<String, Map<String, S1Box>> = ${tableLiteral(extra.table, 4)}`);
    lines.push("");
    lines.push(`    fun ${property}Box(key: String, part: String): S1Box = ${property}Boxes.box(key, part, "${extraId}")`);
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}
