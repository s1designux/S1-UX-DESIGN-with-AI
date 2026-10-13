/**
 * react-native-literals.mjs — RN 부품 코드에 직접 적은 치수·색 리터럴을 찾는다.
 * --------------------------------------------------------------------------
 * 부품 코드(components/*.js)에는 치수·색이 없어야 한다 — 값은 표(specs)와 토큰(tokens.js)에만 있다.
 *
 * 숫자 값은 "키 이름으로 잡는" 방식이 아니라 거꾸로 센다: 주석을 뺀 코드에서 `키: 숫자` 꼴은 전부 리터럴이고,
 * 동작 설정 키(ALLOWED_NUMERIC_KEYS)만 허용한다. 그래서 borderTopWidth·translateX·snapToInterval·x·y 처럼
 * 이름이 길거나 처음 보는 키도, 소수(.5)·음수도 빠지지 않는다.
 * 문자열 값도 같다: `키: "12px"` · `키: "100%"` 꼴(숫자+단위)은 리터럴이다.
 * 색: #hex · rgb()/rgba().
 */

/** 동작 설정에 쓰는 숫자 키 — 치수가 아니다(처음 고른 순번·전체 쪽수·분 간격 …). */
export const ALLOWED_NUMERIC_KEYS = new Set(["index", "initial", "total", "minuteStep", "block"]);

/** 문자열 값은 내용(글자·data-* 값·tabIndex 같은 속성 문자열)이 숫자처럼 보일 수 있어, 치수를 뜻하는 키일 때만 리터럴로 본다. */
const DIMENSION_KEY = /^(?:[A-Za-z]*(?:Width|Height|Padding|Margin|Radius|Gap|Size|Spacing|Offset|Basis|Inset|Interval|Translate[XYZ]?)|width|height|top|left|right|bottom|x|y|gap|flex|lineHeight|letterSpacing|fontSize|fontWeight|opacity|zIndex|elevation|translate[XYZ])$/;

const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

/** @returns {string[]} 찾은 리터럴(비어 있으면 깨끗하다) */
export function scanLiterals(source) {
  const code = stripComments(source);
  const found = [];
  if (/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(code)) found.push("직접 적은 색(#hex·rgb)");
  for (const match of code.matchAll(/["']?([A-Za-z_$][\w$-]*)["']?\s*:\s*(-?\.?\d[\d.]*(?:e-?\d+)?)(?![\w.])/g)) {
    if (!ALLOWED_NUMERIC_KEYS.has(match[1])) found.push(`${match[1]}: ${match[2]}`);
  }
  for (const match of code.matchAll(/["']?([A-Za-z_$][\w$-]*)["']?\s*:\s*["'](-?\.?\d[\d.]*(?:px|%|em|rem|vw|vh|pt)?)["']/g)) {
    if (DIMENSION_KEY.test(match[1])) found.push(`${match[1]}: "${match[2]}"`);
  }
  return found;
}

/** 적대 표본 — 하나라도 못 잡으면 검사가 구멍난 것이다. 일부러 리터럴을 심은 사본에서 반드시 실패해야 한다. */
export const ADVERSARIAL_SAMPLES = [
  "const a = { borderTopWidth: 1 };",
  "const a = { borderTopLeftRadius: 4 };",
  "const a = { paddingLeft: 12 };",
  "const a = { minHeight: 40 };",
  "const a = { top: -3 };",
  "const a = { lineHeight: 1.3 };",
  "const a = { opacity: .5 };",
  "const a = { transform: [{ translateX: 3 }] };",
  "const a = { transform: [{ translateY: -2 }] };",
  "const a = { x: 2, y: 2 };",
  "const a = { snapToInterval: 74 };",
  'const a = { "pitch": 74 };',
  'const a = { width: "100%" };',
  'const a = { height: "12px" };',
  'const a = { color: "#1d6ceb" };',
  'const a = { color: "rgba(0,0,0,.5)" };'
];
