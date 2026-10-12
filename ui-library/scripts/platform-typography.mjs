/**
 * platform-typography.mjs — 이름 붙은 글자 묶음(텍스트 스타일)을 플랫폼 중립 값으로 읽는다.
 * --------------------------------------------------------------------------
 * 정본: plugins/figma-vars-installer/src/textstyles-data.ts → assets/css/typography.css
 * Kotlin·Swift·C++ 생성기가 함께 쓴다. 없는 스타일을 만들지 않고 값을 고치지 않는다.
 * (원래 kotlin-typography.mjs 안에 있던 것을 2026-10-02 에 꺼냈다. 동작은 그대로다.)
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

