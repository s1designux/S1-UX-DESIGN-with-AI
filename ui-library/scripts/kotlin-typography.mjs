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

import { readTextStyles } from "./platform-typography.mjs";
export { readTextStyles };

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
