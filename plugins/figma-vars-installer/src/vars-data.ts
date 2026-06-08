/**
 * vars-data.ts
 * S1 디자인시스템 Variables 정의 — Hybrid 패턴 (2026-06-08 v3 재설계)
 *
 * 구조 (업계 표준 — Material 3 · Apple HIG · IBM Carbon · Atlassian 동일):
 *
 *   Foundation 컬렉션 (단일 Default 모드)
 *     - COLOR: raw 색상값. 라이트/다크 팔레트는 별도 변수명으로 분리
 *       (gray/N · gray-dark/N · blue/N · blue-dark/N ...)
 *     - NUMBER: spacing·radius·border-width·font·line (모드 무관 단일값)
 *
 *   Semantic 컬렉션 (Light / Dark 2-mode)
 *     - COLOR: Light 모드는 light 팔레트 alias, Dark 모드는 -dark 팔레트 alias
 *       (예: color/bg/default Light → gray/0, Dark → gray-dark/50)
 *     - NUMBER: Foundation NUMBER alias 또는 직접값
 *
 * 이유:
 *   · Foundation 이름이 명확히 light/dark 구분 → 디자이너가 raw 색상 즉시 인지
 *   · Semantic만 모드 전환 → 컴포넌트 디자이너는 모드 토글로 자동 다크 전환
 *   · CSS tokens.css의 --color-X-N / --color-X-dark-N 구조와 1:1 정합
 *   · Foundation에 모드 부여는 raw 색이라 의미 없음 — Semantic의 책임으로 위임
 *
 * 참조 형식:
 *   - "gray/N", "gray-dark/N", "spacing/16" → Foundation alias
 *   - "#HEX" → 직접 색상값 (Foundation 미등록 항목)
 *   - "rgba(r,g,b,a)" → alpha 포함 색상값
 *   - number → FLOAT 직접값
 */

export const FOUNDATION_COLLECTION = "Foundation";
export const SEMANTIC_COLLECTION   = "semantic";
export const LIGHT_MODE = "Light";
export const DARK_MODE  = "Dark";

// ── Color (Foundation: 단일 모드, raw 값) ─────────────────────────────────────

export const FOUNDATION_COLOR: Record<string, string> = {
  // ── Base ──────────────────────────────────────────
  "base/white": "#FFFFFF",
  "base/black": "#000000",

  // ── Brand ─────────────────────────────────────────
  "brand/blue": "#0072CE",
  "brand/red":  "#FF312C",
  "brand/gray": "#DFDEDE",
  "brand/ci":   "#004097",

  // ── Gray (Light scale) ────────────────────────────
  "gray/0":   "#FAFAFA",
  "gray/50":  "#F5F5F5",
  "gray/100": "#E9E9E9",
  "gray/200": "#D9D9D9",
  "gray/300": "#C4C4C4",
  "gray/400": "#9D9D9D",
  "gray/500": "#757575",
  "gray/600": "#555555",
  "gray/700": "#434343",
  "gray/800": "#353535",
  "gray/900": "#202020",

  // ── Gray Dark (Dark scale) ────────────────────────
  "gray-dark/0":   "#0D0E12",
  "gray-dark/50":  "#131418",
  "gray-dark/100": "#1C1D23",
  "gray-dark/200": "#24252C",
  "gray-dark/300": "#2E2F38",
  "gray-dark/400": "#35363F",
  "gray-dark/500": "#3E4049",
  "gray-dark/600": "#55575F",
  "gray-dark/700": "#8A8C96",
  "gray-dark/800": "#B8BABF",
  "gray-dark/900": "#ECEDF0",

  // ── Blue ──────────────────────────────────────────
  "blue/50":  "#E2F1FF",
  "blue/100": "#C8E4FF",
  "blue/150": "#A4D4FF",
  "blue/200": "#8BC6FF",
  "blue/250": "#5BB2FF",
  "blue/300": "#2B9EFF",
  "blue/350": "#268CF8",
  "blue/400": "#1D6CEB",
  "blue/450": "#2158C8",
  "blue/500": "#2747B9",

  "blue-dark/50":  "#0C1D38",
  "blue-dark/100": "#112B55",
  "blue-dark/150": "#1A3D72",
  "blue-dark/200": "#214EA0",
  "blue-dark/250": "#2A65C8",
  "blue-dark/300": "#3070D8",
  "blue-dark/350": "#4285E8",
  "blue-dark/400": "#6FA5F8",
  "blue-dark/450": "#96BEF9",
  "blue-dark/500": "#C0D8FC",

  // ── Red ───────────────────────────────────────────
  "red/50":  "#FFEBEF",
  "red/100": "#FFCCD6",
  "red/150": "#FBB2BA",
  "red/200": "#F8979E",
  "red/250": "#FC6E79",
  "red/300": "#FF4554",
  "red/350": "#F22544",
  "red/400": "#E50533",
  "red/450": "#D60228",
  "red/500": "#C8001E",

  "red-dark/50":  "#2A0F14",
  "red-dark/100": "#3D1520",
  "red-dark/150": "#5C1E2E",
  "red-dark/200": "#8A2A3E",
  "red-dark/250": "#C03850",
  "red-dark/300": "#E04860",
  "red-dark/350": "#F06070",
  "red-dark/400": "#F48890",
  "red-dark/450": "#F8A8B0",
  "red-dark/500": "#FCD0D5",

  // ── Orange ────────────────────────────────────────
  "orange/50":  "#FFEDE0",
  "orange/100": "#FDDBBF",
  "orange/150": "#FEC6A0",
  "orange/200": "#FFB482",
  "orange/250": "#FF954E",
  "orange/300": "#FF761A",
  "orange/350": "#EE680D",
  "orange/400": "#DA4C00",
  "orange/450": "#B63C00",
  "orange/500": "#8E2E00",

  "orange-dark/50":  "#2E1505",
  "orange-dark/100": "#42200A",
  "orange-dark/150": "#6B3512",
  "orange-dark/200": "#A05020",
  "orange-dark/250": "#D06828",
  "orange-dark/300": "#E88038",
  "orange-dark/350": "#F09548",
  "orange-dark/400": "#F5AA68",
  "orange-dark/450": "#F8C090",
  "orange-dark/500": "#FCD8B8",

  // ── Yellow ────────────────────────────────────────
  "yellow/50":  "#FFF4CE",
  "yellow/100": "#FEE89A",
  "yellow/150": "#FEDE6C",
  "yellow/200": "#FFD53D",
  "yellow/250": "#FFCC1E",
  "yellow/300": "#FFC200",
  "yellow/350": "#F5B900",
  "yellow/400": "#DBA400",
  "yellow/450": "#BA8900",
  "yellow/500": "#8F6A00",

  "yellow-dark/50":  "#2A2005",
  "yellow-dark/100": "#3D2E08",
  "yellow-dark/150": "#605010",
  "yellow-dark/200": "#907818",
  "yellow-dark/250": "#C09828",
  "yellow-dark/300": "#D8B038",
  "yellow-dark/350": "#E8C048",
  "yellow-dark/400": "#F0D068",
  "yellow-dark/450": "#F5DE90",
  "yellow-dark/500": "#FAEAB8",

  // ── Green ─────────────────────────────────────────
  "green/50":  "#E3F2EA",
  "green/100": "#CAECDA",
  "green/150": "#9CD8BD",
  "green/200": "#6FC4A2",
  "green/250": "#47BB8E",
  "green/300": "#1FB279",
  "green/350": "#10A86C",
  "green/400": "#009E5E",
  "green/450": "#008650",
  "green/500": "#006F42",

  "green-dark/50":  "#0A2018",
  "green-dark/100": "#102E22",
  "green-dark/150": "#184530",
  "green-dark/200": "#206840",
  "green-dark/250": "#288A55",
  "green-dark/300": "#30A868",
  "green-dark/350": "#3FBE7E",
  "green-dark/400": "#68D098",
  "green-dark/450": "#98E0B8",
  "green-dark/500": "#C5F0D8",

  // ── Skyblue ───────────────────────────────────────
  "skyblue/50":  "#C4EEF7",
  "skyblue/100": "#A5E5F3",
  "skyblue/150": "#7BD6EA",
  "skyblue/200": "#51C7E1",
  "skyblue/250": "#3BC0DD",
  "skyblue/300": "#25B9DA",
  "skyblue/350": "#1DAACB",
  "skyblue/400": "#159BBC",
  "skyblue/450": "#1284A0",
  "skyblue/500": "#0F6C84",

  "skyblue-dark/50":  "#081E28",
  "skyblue-dark/100": "#102A38",
  "skyblue-dark/150": "#184050",
  "skyblue-dark/200": "#205A70",
  "skyblue-dark/250": "#287890",
  "skyblue-dark/300": "#3090A8",
  "skyblue-dark/350": "#40A8C0",
  "skyblue-dark/400": "#68C0D8",
  "skyblue-dark/450": "#98D8E8",
  "skyblue-dark/500": "#C0E8F0",

  // ── Purple ────────────────────────────────────────
  "purple/50":  "#E8E9FC",
  "purple/100": "#CFD1F9",
  "purple/150": "#C0C0FC",
  "purple/200": "#B0B0FF",
  "purple/250": "#8B8BEE",
  "purple/300": "#6666DD",
  "purple/350": "#4E4EC3",
  "purple/400": "#3535A8",
  "purple/450": "#2D2D8F",
  "purple/500": "#252576",

  "purple-dark/50":  "#14142A",
  "purple-dark/100": "#1E1E3D",
  "purple-dark/150": "#2A2A58",
  "purple-dark/200": "#383878",
  "purple-dark/250": "#4848A0",
  "purple-dark/300": "#5858B8",
  "purple-dark/350": "#7070D0",
  "purple-dark/400": "#9090E0",
  "purple-dark/450": "#B0B0EA",
  "purple-dark/500": "#D0D0F5",

  // ── Brown ─────────────────────────────────────────
  "brown/50":  "#F6EEE9",
  "brown/100": "#E4D5C8",
  "brown/150": "#DBC6B3",
  "brown/200": "#D1B69F",
  "brown/250": "#A68C75",
  "brown/300": "#7C614A",
  "brown/350": "#685240",
  "brown/400": "#554435",
  "brown/450": "#483A2D",
  "brown/500": "#3B3025",

  "brown-dark/50":  "#1E1610",
  "brown-dark/100": "#2A2018",
  "brown-dark/150": "#3D3025",
  "brown-dark/200": "#584535",
  "brown-dark/250": "#786050",
  "brown-dark/300": "#907868",
  "brown-dark/350": "#A89080",
  "brown-dark/400": "#C0A898",
  "brown-dark/450": "#D8C0B0",
  "brown-dark/500": "#E8D8C8",

  // ── Visual Gray (Light 전용 스케일) ───────────────
  "visual-gray/50":  "#F3F5F7",
  "visual-gray/100": "#E8EBEF",
  "visual-gray/150": "#DADEE5",
  "visual-gray/200": "#CDD2DE",
  "visual-gray/250": "#ABB2BF",
  "visual-gray/300": "#808796",
  "visual-gray/350": "#646A74",
  "visual-gray/400": "#3E4347",
  "visual-gray/450": "#2B2F32",
  "visual-gray/500": "#1B1D1F",

  // ── Cool Gray Dark (Dark 전용 스케일) ─────────────
  "coolgray-dark/50":  "#12141A",
  "coolgray-dark/100": "#1A1D25",
  "coolgray-dark/150": "#252830",
  "coolgray-dark/200": "#353840",
  "coolgray-dark/250": "#484C58",
  "coolgray-dark/300": "#606470",
  "coolgray-dark/350": "#787C88",
  "coolgray-dark/400": "#989CA8",
  "coolgray-dark/450": "#B8BCC5",
  "coolgray-dark/500": "#D8DBE0",
};

// ── Number (Foundation primitives — spacing·radius·border-width·font·line) ─

export const FOUNDATION_NUMBER: Record<string, number> = {
  // ── Spacing ─────────────────────────────
  "spacing/2":   2,
  "spacing/4":   4,
  "spacing/6":   6,
  "spacing/8":   8,
  "spacing/10":  10,
  "spacing/12":  12,
  "spacing/14":  14,
  "spacing/16":  16,
  "spacing/20":  20,
  "spacing/24":  24,
  "spacing/28":  28,
  "spacing/32":  32,
  "spacing/36":  36,
  "spacing/40":  40,
  "spacing/44":  44,
  "spacing/48":  48,
  "spacing/56":  56,
  "spacing/64":  64,
  "spacing/80":  80,
  "spacing/96":  96,
  "spacing/128": 128,

  // ── Radius ──────────────────────────────
  "radius/0":    0,
  "radius/2":    2,
  "radius/4":    4,
  "radius/6":    6,
  "radius/8":    8,
  "radius/10":   10,
  "radius/12":   12,
  "radius/16":   16,
  "radius/20":   20,
  "radius/full": 9999,

  // ── Border Width ───────────────────────
  "border-width/1": 1,
  "border-width/2": 2,

  // ── Font Size ──────────────────────────
  "font-size/10": 10,
  "font-size/12": 12,
  "font-size/14": 14,
  "font-size/16": 16,
  "font-size/18": 18,
  "font-size/20": 20,
  "font-size/24": 24,
  "font-size/32": 32,

  // ── Font Weight ────────────────────────
  "font-weight/regular": 400,
  "font-weight/medium":  500,
  "font-weight/bold":    700,

  // ── Line Height (배수) ─────────────────
  "line-height/130": 1.3,
};

// ── Semantic Color (Light → light 팔레트, Dark → -dark 팔레트) ───────────────

export interface SemanticColorEntry {
  light: string;
  dark: string;
}

export const SEMANTIC_COLOR: Record<string, SemanticColorEntry> = {
  // ── color/bg ──────────────────────────────────────
  "color/bg/default":  { light: "gray/0",      dark: "gray-dark/50" },
  "color/bg/subtle":   { light: "gray/50",     dark: "gray-dark/200" },
  "color/bg/muted":    { light: "gray/100",    dark: "gray-dark/300" },
  "color/bg/elevated": { light: "gray/100",    dark: "gray-dark/400" },
  "color/bg/home":     { light: "#F5F6FB",     dark: "gray-dark/50" },
  "color/bg/selected": { light: "blue/50",     dark: "blue-dark/100" },

  // ── color/surface ─────────────────────────────────
  "color/surface/default": { light: "base/white", dark: "gray-dark/100" },
  "color/surface/raised":  { light: "base/white", dark: "gray-dark/400" },

  // ── color/text ────────────────────────────────────
  "color/text/primary":     { light: "gray/900",   dark: "gray-dark/900" },
  "color/text/secondary":   { light: "gray/800",   dark: "gray-dark/800" },
  "color/text/tertiary":    { light: "gray/600",   dark: "gray-dark/700" },
  "color/text/caption":     { light: "gray/500",   dark: "gray-dark/700" },
  "color/text/placeholder": { light: "gray/500",   dark: "gray-dark/600" },
  "color/text/helper":      { light: "gray/400",   dark: "gray-dark/600" },
  "color/text/link":        { light: "blue/400",   dark: "blue-dark/400" },
  "color/text/correct":     { light: "blue/400",   dark: "blue-dark/400" },
  "color/text/danger":      { light: "red/300",    dark: "red-dark/350" },
  "color/text/disabled":    { light: "gray/300",   dark: "gray-dark/400" },
  "color/text/readonly":    { light: "gray/500",   dark: "gray-dark/500" },
  "color/text/inverse":     { light: "base/white", dark: "base/white" },

  // ── color/border ──────────────────────────────────
  "color/border/subtle":   { light: "gray/100",    dark: "gray-dark/200" },
  "color/border/default":  { light: "gray/200",    dark: "gray-dark/300" },
  "color/border/disabled": { light: "gray/200",    dark: "gray-dark/200" },
  "color/border/strong":   { light: "gray/300",    dark: "gray-dark/500" },
  "color/border/emphasis": { light: "gray/800",    dark: "gray-dark/700" },
  "color/border/focus":    { light: "blue/400",    dark: "blue-dark/350" },
  "color/border/white":    { light: "base/white",  dark: "base/white" },
  "color/border/danger":   { light: "red/300",     dark: "red-dark/350" },
  "color/border/correct":  { light: "blue/400",    dark: "blue-dark/350" },

  // ── color/icon ────────────────────────────────────
  "color/icon/default":  { light: "gray/500",      dark: "gray-dark/700" },
  "color/icon/muted":    { light: "gray/300",      dark: "gray-dark/400" },
  "color/icon/emphasis": { light: "gray/800",      dark: "gray-dark/800" },
  "color/icon/accent":   { light: "blue/400",      dark: "blue-dark/400" },
  "color/icon/inverse":  { light: "base/white",    dark: "gray-dark/900" },
  "color/icon/danger":   { light: "red/300",       dark: "red-dark/350" },

  // ── color/action ──────────────────────────────────
  "color/action/primary/default": { light: "blue/400",   dark: "blue-dark/300" },
  "color/action/primary/hover":   { light: "blue/450",   dark: "blue-dark/250" },
  "color/action/primary/pressed": { light: "blue/500",   dark: "blue-dark/200" },
  "color/action/primary/text":    { light: "base/white", dark: "base/white" },
  "color/action/primary/subtle":  { light: "blue/50",    dark: "blue-dark/100" },

  // ── color/status ──────────────────────────────────
  "color/status/success": { light: "blue/400",   dark: "green-dark/350" },
  "color/status/error":   { light: "red/400",    dark: "red-dark/350" },
  "color/status/warning": { light: "yellow/400", dark: "yellow-dark/350" },
  "color/status/info":    { light: "gray/500",   dark: "gray-dark/700" },

  // ── color/overlay (alpha 포함 — alias 불가, 직접값) ──
  "color/overlay": { light: "rgba(0,0,0,0.5)", dark: "rgba(0,0,0,0.75)" },
};

// ── Semantic Number ──────────────────────────────────────────────────────────
// 값: string = Foundation alias path / number = 직접값

export const SEMANTIC_NUMBER: Record<string, string | number> = {
  // ── spacing/padding-block ─────────────
  "spacing/padding-block/xxs": "spacing/8",
  "spacing/padding-block/xs":  "spacing/12",
  "spacing/padding-block/sm":  "spacing/16",
  "spacing/padding-block/md":  "spacing/20",
  "spacing/padding-block/lg":  "spacing/24",

  // ── spacing/padding-inline ────────────
  "spacing/padding-inline/xxs": "spacing/8",
  "spacing/padding-inline/xs":  "spacing/12",
  "spacing/padding-inline/sm":  "spacing/16",
  "spacing/padding-inline/md":  "spacing/20",
  "spacing/padding-inline/lg":  "spacing/24",

  // ── spacing/section ───────────────────
  "spacing/section/xs":  "spacing/16",
  "spacing/section/sm":  "spacing/20",
  "spacing/section/md":  "spacing/24",
  "spacing/section/lg":  "spacing/32",
  "spacing/section/xl":  "spacing/40",
  "spacing/section/xxl": "spacing/48",

  // ── spacing/stack ─────────────────────
  "spacing/stack/xs": "spacing/12",
  "spacing/stack/sm": "spacing/16",
  "spacing/stack/md": "spacing/20",
  "spacing/stack/lg": "spacing/24",

  // ── spacing/cluster ───────────────────
  "spacing/cluster/xxs": "spacing/8",
  "spacing/cluster/xs":  "spacing/12",
  "spacing/cluster/sm":  "spacing/16",
  "spacing/cluster/md":  "spacing/20",

  // ── spacing/label-gap ─────────────────
  "spacing/label-gap-inline/sm": "spacing/8",
  "spacing/label-gap-inline/md": "spacing/12",
  "spacing/label-gap-inline/lg": "spacing/16",
  "spacing/label-gap-block/sm":  "spacing/4",
  "spacing/label-gap-block/md":  "spacing/8",

  // ── sizing/form-control-height ────────
  "sizing/form-control-height/xxs": "spacing/28",
  "sizing/form-control-height/xs":  34, // Foundation step 없음
  "sizing/form-control-height/md":  "spacing/44",
  "sizing/form-control-height/lg":  "spacing/48",
  "sizing/form-control-dataview-height/sm": "spacing/28",
  "sizing/form-control-dataview-height/md": 32, // Foundation step 없음

  // ── sizing/button-height ──────────────
  "sizing/button-height/xxs": "spacing/28",
  "sizing/button-height/xs":  34, // Foundation step 없음
  "sizing/button-height/sm":  "spacing/40",
  "sizing/button-height/md":  "spacing/44",
  "sizing/button-height/lg":  "spacing/48",
  "sizing/button-min-width":  80, // Foundation step 없음

  // ── sizing/chip-height ────────────────
  "sizing/chip-height/sm": "spacing/28",
  "sizing/chip-height/md": 30, // Foundation step 없음
  "sizing/chip-height/lg": 34, // Foundation step 없음

  // ── sizing/table-row-height ───────────
  "sizing/table-row-height/xs": 34, // Foundation step 없음
  "sizing/table-row-height/sm": 38, // Foundation step 없음
  "sizing/table-row-height/md": "spacing/44",

  // ── sizing/dropdown-item-height ───────
  "sizing/dropdown-item-height/md": "spacing/44", // 44 — Select 옵션
  "sizing/dropdown-item-height/xs": 34,           // 34 — 컴팩트 (TimePicker)

  // ── sizing/icon ───────────────────────
  "sizing/icon/10": 10, // Foundation step 없음
  "sizing/icon/16": "spacing/16",
  "sizing/icon/18": 18, // Foundation step 없음
  "sizing/icon/20": "spacing/20",
  "sizing/icon/24": "spacing/24",
  "sizing/icon/28": "spacing/28",
  "sizing/icon/32": "spacing/32",

  // ── radius semantic ───────────────────
  "radius/control/xs": "radius/2",
  "radius/control/sm": "radius/4",
  "radius/button/md":  "radius/4",
  "radius/card/md":    "radius/10",
  "radius/modal/md":   "radius/8",
};
