/**
 * textstyles-data.ts
 * S1 디자인시스템 Text Styles 정의 — 출처: SW UX GUIDE V2.4 (fileKey yE5UCFEbmXJBlYJWB24Lz2)
 *
 * V2.4 Figma "Text styles" 패널을 사용자가 제공한 스크린샷으로 데이터화 (2026-06-10).
 * 패널 표기 형식: "{name} · {size}/{lineHeight}". 이름 접미사 B=Bold(700)·M=Medium(500)·R=Regular(400).
 * caption·helper는 접미사 없음 → Regular (사용자 확인 2026-06-10).
 *
 * line-height: 130% (size 10만 140%) — 패널 표기 그대로.
 * letter-spacing: 패널에 미표기 → 사용자 지정값 (2026-06-10):
 *   · -2%: title/18M·16M, body/18M·16M·16R·14M·14R
 *   · +2%: body/10M·10R
 *   ·  0%: 나머지 전부
 *
 * 폰트: Pretendard (참고 컴포넌트 design_context "Pretendard:Medium" 일치).
 * Figma 그룹은 "/" 로 표현 (예: "body/14M" = 그룹 body > 스타일 14M).
 */

export const TEXT_STYLE_FONT_FAMILY = "Pretendard";

export interface TextStyleDef {
  name: string;                 // Figma 스타일명. "/" = 그룹
  fontStyle: string;            // Pretendard weight: "Regular" | "Medium" | "Bold"
  fontSize: number;
  lineHeightPercent: number;    // 130 | 140
  letterSpacingPercent: number; // -2 | 0 | 2
}

export const TEXT_STYLES: TextStyleDef[] = [
  // caption·helper 폐기(2026-06-12): body/12R와 값 동일 → body/12R 사용. (D4)

  // ── title ───────────────────────────────────────────
  { name: "title/32B", fontStyle: "Bold",    fontSize: 32, lineHeightPercent: 130, letterSpacingPercent: 0 },
  { name: "title/24B", fontStyle: "Bold",    fontSize: 24, lineHeightPercent: 130, letterSpacingPercent: 0 },
  { name: "title/20B", fontStyle: "Bold",    fontSize: 20, lineHeightPercent: 130, letterSpacingPercent: 0 },
  { name: "title/20R", fontStyle: "Regular", fontSize: 20, lineHeightPercent: 130, letterSpacingPercent: 0 },
  { name: "title/18M", fontStyle: "Medium",  fontSize: 18, lineHeightPercent: 130, letterSpacingPercent: -2 },
  { name: "title/16B", fontStyle: "Bold",    fontSize: 16, lineHeightPercent: 130, letterSpacingPercent: 0 },
  { name: "title/16M", fontStyle: "Medium",  fontSize: 16, lineHeightPercent: 130, letterSpacingPercent: -2 },
  { name: "title/14B", fontStyle: "Bold",    fontSize: 14, lineHeightPercent: 130, letterSpacingPercent: 0 },

  // ── body ────────────────────────────────────────────
  { name: "body/18M", fontStyle: "Medium",  fontSize: 18, lineHeightPercent: 130, letterSpacingPercent: -2 },
  { name: "body/16M", fontStyle: "Medium",  fontSize: 16, lineHeightPercent: 130, letterSpacingPercent: -2 },
  { name: "body/16R", fontStyle: "Regular", fontSize: 16, lineHeightPercent: 130, letterSpacingPercent: -2 },
  { name: "body/14M", fontStyle: "Medium",  fontSize: 14, lineHeightPercent: 130, letterSpacingPercent: -2 },
  { name: "body/14R", fontStyle: "Regular", fontSize: 14, lineHeightPercent: 130, letterSpacingPercent: -2 },
  { name: "body/12M", fontStyle: "Medium",  fontSize: 12, lineHeightPercent: 130, letterSpacingPercent: 0 },
  { name: "body/12R", fontStyle: "Regular", fontSize: 12, lineHeightPercent: 130, letterSpacingPercent: 0 },
  { name: "body/10M", fontStyle: "Medium",  fontSize: 10, lineHeightPercent: 140, letterSpacingPercent: 2 },
  { name: "body/10R", fontStyle: "Regular", fontSize: 10, lineHeightPercent: 140, letterSpacingPercent: 2 },
];
