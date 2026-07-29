// ──────────────────────────────────────────────────────────────────────────
// shadow-parse.ts — CSS box-shadow 문자열 → Figma DropShadowEffect[] 변환 (2026-07-29 신설)
//
// 왜 파서인가: 그림자의 **값 정본은 vars-data.ts 의 SEMANTIC_SHADOW 하나**다.
//   설치기(Figma)와 웹(tokens.css)이 같은 문자열에서 파생돼야 두 표면이 갈리지 않는다.
//   따라서 설치기 코드에 그림자 수치를 다시 적지 않고, 이 파서로 문자열을 풀어 쓴다.
//
// 순수 함수만 둔다(figma 전역 미사용) — scripts/shadow-parse-check.js 가 그대로 require 해서
//   단위 검증할 수 있게 하기 위함이다.
//
// 실패 시 조용히 빈 배열을 반환하지 않고 **던진다.** 그림자가 소리 없이 사라지는 것보다
//   빌드가 멈추는 편이 낫다(값 유실 > 빌드 중단).
// ──────────────────────────────────────────────────────────────────────────

/**
 * 겹당 Figma 변수 이름 규약 — **단일 정본**.
 * code.ts(변수 생성)와 build-components.ts(바인딩)가 같은 이름을 만들어야 한다.
 * 각자 문자열을 조립하면 한쪽만 바뀌었을 때 바인딩이 조용히 건너뛰어(변수 못 찾음)
 * Modal 다크 그림자가 라이트로 남는다 → 여기 한 곳에서만 만든다.
 */
export const SHADOW_LAYER_FIELDS = ["color", "offset-y", "blur", "spread"] as const;
export type ShadowLayerField = typeof SHADOW_LAYER_FIELDS[number];

export function shadowVarName(token: string, layerIndex: number, field: ShadowLayerField): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  if (layerIndex < 0 || layerIndex >= letters.length) {
    throw new Error(`[shadow-parse] 겹 인덱스가 범위를 벗어났습니다: ${layerIndex}`);
  }
  return `${token}/layer-${letters[layerIndex]}/${field}`;
}

export interface ParsedShadowLayer {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: { r: number; g: number; b: number; a: number };
}

/**
 * 괄호 **밖** 콤마로만 겹을 자른다. `rgba(0,0,0,1)` 안의 콤마는 건드리지 않는다.
 * 정규식 대신 괄호 깊이를 세는 이유: 중첩·공백 변형에 안전하다.
 */
export function splitShadowLayers(css: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  if (depth !== 0) throw new Error(`[shadow-parse] 괄호가 맞지 않습니다: ${JSON.stringify(css)}`);
  return out;
}

/** `rgba(r,g,b,a)` / `rgb(r,g,b)` → 0–1 정규화. r·g·b 는 0–255, a 는 이미 0–1. */
function parseRgba(token: string, ctx: string): ParsedShadowLayer["color"] {
  const m = token.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (!m) throw new Error(`[shadow-parse] 색을 해석하지 못했습니다: ${JSON.stringify(token)} (겹: ${ctx})`);
  const r = Number(m[1]), g = Number(m[2]), b = Number(m[3]);
  const a = m[4] === undefined ? 1 : Number(m[4]);
  for (const [name, v, max] of [["r", r, 255], ["g", g, 255], ["b", b, 255], ["a", a, 1]] as const) {
    if (!isFinite(v) || v < 0 || v > max) {
      throw new Error(`[shadow-parse] 색 성분 ${name}=${v} 이 범위를 벗어났습니다 (겹: ${ctx})`);
    }
  }
  return { r: r / 255, g: g / 255, b: b / 255, a };
}

/** `12px` / `-4px` / `0` → number. 단위는 px 만 허용(Figma Effect 는 px 단위 수치다). */
function parseLength(token: string, ctx: string): number {
  const m = token.match(/^(-?[\d.]+)(px)?$/i);
  if (!m) throw new Error(`[shadow-parse] 길이값을 해석하지 못했습니다: ${JSON.stringify(token)} (겹: ${ctx})`);
  const n = Number(m[1]);
  if (!isFinite(n)) throw new Error(`[shadow-parse] 길이값이 숫자가 아닙니다: ${JSON.stringify(token)} (겹: ${ctx})`);
  return n;
}

/**
 * 한 겹 파싱. `offset-x offset-y blur [spread] <color>` 형태.
 * 길이값 3개형(`0 4px 16px`)과 4개형(`0 4px 8px 0`) 둘 다 받는다. 4번째가 spread, 없으면 0.
 * 색은 토큰 위치와 무관하게 찾아낸다(CSS 는 색을 앞/뒤 어디든 허용).
 */
export function parseShadowLayer(layer: string): ParsedShadowLayer {
  const src = layer.trim();
  if (!src) throw new Error("[shadow-parse] 빈 겹 문자열입니다.");
  if (/\binset\b/i.test(src)) {
    throw new Error(`[shadow-parse] inset 은 DropShadow 가 아니라 InnerShadow 입니다(미지원): ${JSON.stringify(src)}`);
  }

  // 괄호 안 공백을 건드리지 않도록, 색 함수를 먼저 떼어낸다.
  const colorMatch = src.match(/rgba?\([^)]*\)/i);
  if (!colorMatch) {
    throw new Error(`[shadow-parse] 색(rgb/rgba)이 없습니다: ${JSON.stringify(src)} — 그림자 색은 rgba 로 적는다(EX07).`);
  }
  const color = parseRgba(colorMatch[0], src);
  const rest = (src.slice(0, colorMatch.index) + " " + src.slice((colorMatch.index || 0) + colorMatch[0].length)).trim();

  const lengths = rest.split(/\s+/).filter(Boolean);
  if (lengths.length < 3 || lengths.length > 4) {
    throw new Error(
      `[shadow-parse] 길이값이 ${lengths.length}개입니다(3 또는 4여야 함: x y blur [spread]): ${JSON.stringify(src)}`
    );
  }
  const offsetX = parseLength(lengths[0], src);
  const offsetY = parseLength(lengths[1], src);
  const blur = parseLength(lengths[2], src);
  const spread = lengths.length === 4 ? parseLength(lengths[3], src) : 0;
  if (blur < 0) throw new Error(`[shadow-parse] blur 는 0 이상이어야 합니다(Figma 제약): ${JSON.stringify(src)}`);

  return { offsetX, offsetY, blur, spread, color };
}

/** 문자열 전체 → 겹 배열. 겹이 0개면 던진다("추출 0건 = 안 됨"). */
export function parseCssShadow(css: string): ParsedShadowLayer[] {
  if (typeof css !== "string" || !css.trim()) {
    throw new Error(`[shadow-parse] 빈 값입니다: ${JSON.stringify(css)}`);
  }
  if (css.trim() === "none") {
    throw new Error("[shadow-parse] 'none' 은 Effect 로 변환할 수 없습니다. 호출부에서 걸러야 합니다.");
  }
  const layers = splitShadowLayers(css).map(parseShadowLayer);
  if (layers.length === 0) throw new Error(`[shadow-parse] 겹을 하나도 추출하지 못했습니다: ${JSON.stringify(css)}`);
  return layers;
}

/**
 * SEMANTIC_SHADOW 의 light/dark 문자열 → Figma DropShadowEffect[].
 * CSS 는 "앞에 적은 겹이 위" 이고 Figma effects 배열도 같은 순서로 겹친다 — 순서를 그대로 둔다.
 */
export function toDropShadowEffects(css: string): DropShadowEffect[] {
  return parseCssShadow(css).map((l) => ({
    type: "DROP_SHADOW" as const,
    color: l.color,
    offset: { x: l.offsetX, y: l.offsetY },
    radius: l.blur,
    spread: l.spread,
    visible: true,
    blendMode: "NORMAL" as const,
  }));
}
