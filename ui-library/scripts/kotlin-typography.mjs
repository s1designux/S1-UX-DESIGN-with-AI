/**
 * kotlin-typography.mjs — 이름 붙은 글자 묶음(텍스트 스타일)을 Kotlin 으로 옮긴다.
 * --------------------------------------------------------------------------
 * 정본: plugins/figma-vars-installer/src/textstyles-data.ts → assets/css/typography.css
 * 낱개 값(글꼴 크기·굵기·줄간격·자간)은 이미 S1Tokens 에 있다. 여기서 만드는 것은
 * "본문 14 보통" 처럼 **이름으로 부르는 묶음**이다 — 쓰는 쪽이 네 값을 매번 조립하지 않게.
 *
 * [이 파일이 하지 않는 것]
 *   - 없는 스타일을 만들지 않는다. typography.css 에 있는 것만 옮긴다.
 *   - 값을 반올림하거나 고치지 않는다.
 */

const camel = (name) => name.split("-").map((piece, index) => (index === 0 ? piece : piece[0].toUpperCase() + piece.slice(1))).join("");

const NUMBER_OF = (raw, where) => {
  const em = /^(-?\d*\.?\d+)em$/.exec(raw);
  if (em) return Number(em[1]);
  const px = /^(-?\d*\.?\d+)px$/.exec(raw);
  if (px) return Number(px[1]);
  const plain = /^(-?\d*\.?\d+)$/.exec(raw);
  if (plain) return Number(plain[1]);
  throw new Error(`${where}: 숫자로 읽을 수 없는 값 "${raw}"`);
};

/** typography.css 의 .typo-* 규칙을 읽는다. 네 속성이 다 있어야 한 묶음으로 인정한다. */
export function readTextStyles(typographyCss, tokenValues) {
  const source = typographyCss.replace(/\/\*[\s\S]*?\*\//g, "");
  const styles = [];
  for (const match of source.matchAll(/\.typo-([a-z0-9-]+)\s*\{([^}]*)\}/g)) {
    const name = match[1];
    const declarations = {};
    for (const declaration of match[2].split(";")) {
      const colon = declaration.indexOf(":");
      if (colon === -1) continue;
      declarations[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim();
    }
    const resolve = (property) => {
      const raw = declarations[property];
      if (raw === undefined) throw new Error(`typo-${name}: ${property} 가 없습니다.`);
      const token = /^var\(\s*(--[a-z0-9-]+)\s*\)$/.exec(raw);
      if (!token) return { value: NUMBER_OF(raw, `typo-${name}/${property}`), token: null };
      const resolved = tokenValues.get(token[1]);
      if (resolved === undefined) throw new Error(`typo-${name}: 토큰 ${token[1]} 을 찾지 못했습니다.`);
      return { value: NUMBER_OF(resolved, `typo-${name}/${property}`), token: token[1] };
    };
    styles.push({
      name,
      property: camel(name),
      fontSize: resolve("font-size"),
      fontWeight: resolve("font-weight"),
      lineHeight: resolve("line-height"),
      letterSpacing: resolve("letter-spacing")
    });
  }
  if (styles.length === 0) throw new Error("typography.css 에서 .typo-* 규칙을 찾지 못했습니다.");
  return styles;
}

export function typeKt(pkg, styles, note) {
  const lines = [
    `// ${note}`,
    "// 정본: plugins/figma-vars-installer/src/textstyles-data.ts → assets/css/typography.css",
    "// 낱개 값은 S1Tokens 에 있다. 여기 있는 것은 이름으로 부르는 묶음이다.",
    "//",
    "// 쓰는 법:  BasicText(text = \"본문\", style = S1Type.body14r.textStyle())",
    "//          색을 함께 주려면  S1Type.body14r.textStyle(S1Palette.colorTextBodyPrimary)",
    "",
    `package ${pkg}`,
    "",
    "object S1Type {"
  ];
  for (const style of styles) {
    lines.push(`    /** typo-${style.name} — ${style.fontSize.value}sp · 굵기 ${style.fontWeight.value} · 줄간격 ${style.lineHeight.value} · 자간 ${style.letterSpacing.value}em */`);
    lines.push(`    val ${style.property}: S1TypeSpec = S1TypeSpec(${style.fontSize.value}f, ${style.fontWeight.value}, ${style.lineHeight.value}f, ${style.letterSpacing.value}f)`);
  }
  lines.push("");
  lines.push("    /** 이름으로 찾는다. 승인 목록에 없는 이름이면 그 자리에서 멈춘다. */");
  lines.push("    val all: Map<String, S1TypeSpec> = mapOf(");
  lines.push(styles.map((style) => `        "${style.name}" to ${style.property}`).join(",\n"));
  lines.push("    )");
  lines.push("");
  lines.push("    fun byName(name: String): S1TypeSpec =");
  lines.push("        all[name] ?: error(\"[s1] 승인 목록에 없는 텍스트 스타일: $name. 쓸 수 있는 이름: ${all.keys.joinToString(\", \")}\")");
  lines.push("}");
  return lines.join("\n") + "\n";
}
