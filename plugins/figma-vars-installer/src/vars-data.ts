/**
 * vars-data.ts
 * S1 디자인시스템 Variables 정의 — Foundation + Semantic (모두 Light/Dark 2모드)
 *
 * Foundation:
 *   - COLOR: 한 변수에 Light/Dark 값 모두 보유 (gray/N, blue/N 등)
 *   - NUMBER: 모드 무관 단일값 (spacing, radius, border-width, font-* 등)
 *
 * Semantic:
 *   - COLOR: Foundation alias (Light/Dark mode-aware)
 *   - NUMBER: Foundation alias 또는 직접값 (사이즈·간격 역할 토큰)
 *
 * 참조 형식:
 *   - "gray/N", "spacing/16" → Foundation alias
 *   - "#HEX" → 직접 색상값
 *   - "rgba(r,g,b,a)" → alpha 포함 색상값
 *   - number 그대로 → FLOAT 직접값
 */

export const FOUNDATION_COLLECTION = "Foundation";
export const SEMANTIC_COLLECTION   = "semantic";
export const LIGHT_MODE = "Light";
export const DARK_MODE  = "Dark";

// ── Color ─────────────────────────────────────────────────────────────────────

export interface ColorModeValues {
  light: string;
  dark: string;
}

export const FOUNDATION_COLOR: Record<string, ColorModeValues> = {
  // ── Base ──────────────────────────────────────────
  "base/white": { light: "#FFFFFF", dark: "#FFFFFF" },
  "base/black": { light: "#000000", dark: "#000000" },

  // ── Brand ─────────────────────────────────────────
  "brand/blue": { light: "#0072CE", dark: "#0072CE" },
  "brand/red":  { light: "#FF312C", dark: "#FF312C" },
  "brand/gray": { light: "#DFDEDE", dark: "#DFDEDE" },
  "brand/ci":   { light: "#004097", dark: "#004097" },

  // ── Gray ──────────────────────────────────────────
  "gray/0":   { light: "#FAFAFA", dark: "#0D0E12" },
  "gray/50":  { light: "#F5F5F5", dark: "#131418" },
  "gray/100": { light: "#E9E9E9", dark: "#1C1D23" },
  "gray/200": { light: "#D9D9D9", dark: "#24252C" },
  "gray/300": { light: "#C4C4C4", dark: "#2E2F38" },
  "gray/400": { light: "#9D9D9D", dark: "#35363F" },
  "gray/500": { light: "#757575", dark: "#3E4049" },
  "gray/600": { light: "#555555", dark: "#55575F" },
  "gray/700": { light: "#434343", dark: "#8A8C96" },
  "gray/800": { light: "#353535", dark: "#B8BABF" },
  "gray/900": { light: "#202020", dark: "#ECEDF0" },

  // ── Blue ──────────────────────────────────────────
  "blue/50":  { light: "#E2F1FF", dark: "#0C1D38" },
  "blue/100": { light: "#C8E4FF", dark: "#112B55" },
  "blue/150": { light: "#A4D4FF", dark: "#1A3D72" },
  "blue/200": { light: "#8BC6FF", dark: "#214EA0" },
  "blue/250": { light: "#5BB2FF", dark: "#2A65C8" },
  "blue/300": { light: "#2B9EFF", dark: "#3070D8" },
  "blue/350": { light: "#268CF8", dark: "#4285E8" },
  "blue/400": { light: "#1D6CEB", dark: "#6FA5F8" },
  "blue/450": { light: "#2158C8", dark: "#96BEF9" },
  "blue/500": { light: "#2747B9", dark: "#C0D8FC" },

  // ── Red ───────────────────────────────────────────
  "red/50":  { light: "#FFEBEF", dark: "#2A0F14" },
  "red/100": { light: "#FFCCD6", dark: "#3D1520" },
  "red/150": { light: "#FBB2BA", dark: "#5C1E2E" },
  "red/200": { light: "#F8979E", dark: "#8A2A3E" },
  "red/250": { light: "#FC6E79", dark: "#C03850" },
  "red/300": { light: "#FF4554", dark: "#E04860" },
  "red/350": { light: "#F22544", dark: "#F06070" },
  "red/400": { light: "#E50533", dark: "#F48890" },
  "red/450": { light: "#D60228", dark: "#F8A8B0" },
  "red/500": { light: "#C8001E", dark: "#FCD0D5" },

  // ── Orange ────────────────────────────────────────
  "orange/50":  { light: "#FFEDE0", dark: "#2E1505" },
  "orange/100": { light: "#FDDBBF", dark: "#42200A" },
  "orange/150": { light: "#FEC6A0", dark: "#6B3512" },
  "orange/200": { light: "#FFB482", dark: "#A05020" },
  "orange/250": { light: "#FF954E", dark: "#D06828" },
  "orange/300": { light: "#FF761A", dark: "#E88038" },
  "orange/350": { light: "#EE680D", dark: "#F09548" },
  "orange/400": { light: "#DA4C00", dark: "#F5AA68" },
  "orange/450": { light: "#B63C00", dark: "#F8C090" },
  "orange/500": { light: "#8E2E00", dark: "#FCD8B8" },

  // ── Yellow ────────────────────────────────────────
  "yellow/50":  { light: "#FFF4CE", dark: "#2A2005" },
  "yellow/100": { light: "#FEE89A", dark: "#3D2E08" },
  "yellow/150": { light: "#FEDE6C", dark: "#605010" },
  "yellow/200": { light: "#FFD53D", dark: "#907818" },
  "yellow/250": { light: "#FFCC1E", dark: "#C09828" },
  "yellow/300": { light: "#FFC200", dark: "#D8B038" },
  "yellow/350": { light: "#F5B900", dark: "#E8C048" },
  "yellow/400": { light: "#DBA400", dark: "#F0D068" },
  "yellow/450": { light: "#BA8900", dark: "#F5DE90" },
  "yellow/500": { light: "#8F6A00", dark: "#FAEAB8" },

  // ── Green ─────────────────────────────────────────
  "green/50":  { light: "#E3F2EA", dark: "#0A2018" },
  "green/100": { light: "#CAECDA", dark: "#102E22" },
  "green/150": { light: "#9CD8BD", dark: "#184530" },
  "green/200": { light: "#6FC4A2", dark: "#206840" },
  "green/250": { light: "#47BB8E", dark: "#288A55" },
  "green/300": { light: "#1FB279", dark: "#30A868" },
  "green/350": { light: "#10A86C", dark: "#3FBE7E" },
  "green/400": { light: "#009E5E", dark: "#68D098" },
  "green/450": { light: "#008650", dark: "#98E0B8" },
  "green/500": { light: "#006F42", dark: "#C5F0D8" },

  // ── Skyblue ───────────────────────────────────────
  "skyblue/50":  { light: "#C4EEF7", dark: "#081E28" },
  "skyblue/100": { light: "#A5E5F3", dark: "#102A38" },
  "skyblue/150": { light: "#7BD6EA", dark: "#184050" },
  "skyblue/200": { light: "#51C7E1", dark: "#205A70" },
  "skyblue/250": { light: "#3BC0DD", dark: "#287890" },
  "skyblue/300": { light: "#25B9DA", dark: "#3090A8" },
  "skyblue/350": { light: "#1DAACB", dark: "#40A8C0" },
  "skyblue/400": { light: "#159BBC", dark: "#68C0D8" },
  "skyblue/450": { light: "#1284A0", dark: "#98D8E8" },
  "skyblue/500": { light: "#0F6C84", dark: "#C0E8F0" },

  // ── Purple ────────────────────────────────────────
  "purple/50":  { light: "#E8E9FC", dark: "#14142A" },
  "purple/100": { light: "#CFD1F9", dark: "#1E1E3D" },
  "purple/150": { light: "#C0C0FC", dark: "#2A2A58" },
  "purple/200": { light: "#B0B0FF", dark: "#383878" },
  "purple/250": { light: "#8B8BEE", dark: "#4848A0" },
  "purple/300": { light: "#6666DD", dark: "#5858B8" },
  "purple/350": { light: "#4E4EC3", dark: "#7070D0" },
  "purple/400": { light: "#3535A8", dark: "#9090E0" },
  "purple/450": { light: "#2D2D8F", dark: "#B0B0EA" },
  "purple/500": { light: "#252576", dark: "#D0D0F5" },

  // ── Brown ─────────────────────────────────────────
  "brown/50":  { light: "#F6EEE9", dark: "#1E1610" },
  "brown/100": { light: "#E4D5C8", dark: "#2A2018" },
  "brown/150": { light: "#DBC6B3", dark: "#3D3025" },
  "brown/200": { light: "#D1B69F", dark: "#584535" },
  "brown/250": { light: "#A68C75", dark: "#786050" },
  "brown/300": { light: "#7C614A", dark: "#907868" },
  "brown/350": { light: "#685240", dark: "#A89080" },
  "brown/400": { light: "#554435", dark: "#C0A898" },
  "brown/450": { light: "#483A2D", dark: "#D8C0B0" },
  "brown/500": { light: "#3B3025", dark: "#E8D8C8" },

  // ── Visual Gray (Light 전용 스케일, Dark=Light 동일) ──
  "visual-gray/50":  { light: "#F3F5F7", dark: "#F3F5F7" },
  "visual-gray/100": { light: "#E8EBEF", dark: "#E8EBEF" },
  "visual-gray/150": { light: "#DADEE5", dark: "#DADEE5" },
  "visual-gray/200": { light: "#CDD2DE", dark: "#CDD2DE" },
  "visual-gray/250": { light: "#ABB2BF", dark: "#ABB2BF" },
  "visual-gray/300": { light: "#808796", dark: "#808796" },
  "visual-gray/350": { light: "#646A74", dark: "#646A74" },
  "visual-gray/400": { light: "#3E4347", dark: "#3E4347" },
  "visual-gray/450": { light: "#2B2F32", dark: "#2B2F32" },
  "visual-gray/500": { light: "#1B1D1F", dark: "#1B1D1F" },

  // ── Cool Gray (Dark 전용 스케일, Light=Dark 동일) ─────
  "coolgray/50":  { light: "#12141A", dark: "#12141A" },
  "coolgray/100": { light: "#1A1D25", dark: "#1A1D25" },
  "coolgray/150": { light: "#252830", dark: "#252830" },
  "coolgray/200": { light: "#353840", dark: "#353840" },
  "coolgray/250": { light: "#484C58", dark: "#484C58" },
  "coolgray/300": { light: "#606470", dark: "#606470" },
  "coolgray/350": { light: "#787C88", dark: "#787C88" },
  "coolgray/400": { light: "#989CA8", dark: "#989CA8" },
  "coolgray/450": { light: "#B8BCC5", dark: "#B8BCC5" },
  "coolgray/500": { light: "#D8DBE0", dark: "#D8DBE0" },
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

// ── Semantic Color ───────────────────────────────────────────────────────────

export interface SemanticColorEntry {
  light: string;
  dark: string;
}

export const SEMANTIC_COLOR: Record<string, SemanticColorEntry> = {
  // ── color/bg ──────────────────────────────────────
  "color/bg/default":  { light: "gray/0",      dark: "gray/50" },
  "color/bg/subtle":   { light: "gray/50",     dark: "gray/200" },
  "color/bg/muted":    { light: "gray/100",    dark: "gray/300" },
  "color/bg/elevated": { light: "gray/100",    dark: "gray/400" },
  "color/bg/home":     { light: "#F5F6FB",     dark: "gray/50" },
  "color/bg/selected": { light: "blue/50",     dark: "blue/100" },

  // ── color/surface ─────────────────────────────────
  "color/surface/default": { light: "base/white", dark: "gray/100" },
  "color/surface/raised":  { light: "base/white", dark: "gray/400" },

  // ── color/text ────────────────────────────────────
  "color/text/primary":     { light: "gray/900",   dark: "gray/900" },
  "color/text/secondary":   { light: "gray/800",   dark: "gray/800" },
  "color/text/tertiary":    { light: "gray/600",   dark: "gray/700" },
  "color/text/caption":     { light: "gray/500",   dark: "gray/700" },
  "color/text/placeholder": { light: "gray/500",   dark: "gray/600" },
  "color/text/helper":      { light: "gray/400",   dark: "gray/600" },
  "color/text/link":        { light: "blue/400",   dark: "blue/400" },
  "color/text/correct":     { light: "blue/400",   dark: "blue/400" },
  "color/text/danger":      { light: "red/300",    dark: "red/350" },
  "color/text/disabled":    { light: "gray/300",   dark: "gray/400" },
  "color/text/inverse":     { light: "base/white", dark: "base/white" },

  // ── color/border ──────────────────────────────────
  "color/border/subtle":   { light: "gray/100",    dark: "gray/200" },
  "color/border/default":  { light: "gray/200",    dark: "gray/300" },
  "color/border/disabled": { light: "gray/200",    dark: "gray/200" },
  "color/border/strong":   { light: "gray/300",    dark: "gray/500" },
  "color/border/emphasis": { light: "gray/800",    dark: "gray/700" },
  "color/border/focus":    { light: "blue/400",    dark: "blue/350" },
  "color/border/white":    { light: "base/white",  dark: "base/white" },
  "color/border/danger":   { light: "red/300",     dark: "red/350" },
  "color/border/correct":  { light: "blue/400",    dark: "blue/350" },

  // ── color/icon ────────────────────────────────────
  "color/icon/default":  { light: "gray/500",      dark: "gray/700" },
  "color/icon/muted":    { light: "gray/300",      dark: "gray/400" },
  "color/icon/emphasis": { light: "gray/800",      dark: "gray/800" },
  "color/icon/accent":   { light: "blue/400",      dark: "blue/400" },
  "color/icon/inverse":  { light: "base/white",    dark: "gray/900" },
  "color/icon/danger":   { light: "red/300",       dark: "red/350" },

  // ── color/action ──────────────────────────────────
  "color/action/primary/default": { light: "blue/400",   dark: "blue/300" },
  "color/action/primary/hover":   { light: "blue/450",   dark: "blue/250" },
  "color/action/primary/pressed": { light: "blue/500",   dark: "blue/200" },
  "color/action/primary/text":    { light: "base/white", dark: "base/white" },
  "color/action/primary/subtle":  { light: "blue/50",    dark: "blue/100" },

  // ── color/status ──────────────────────────────────
  "color/status/success": { light: "blue/400",   dark: "green/350" },
  "color/status/error":   { light: "red/400",    dark: "red/350" },
  "color/status/warning": { light: "yellow/400", dark: "yellow/350" },
  "color/status/info":    { light: "gray/500",   dark: "gray/700" },

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

  // ── radius semantic ───────────────────
  "radius/control/xs": "radius/2",
  "radius/control/sm": "radius/4",
  "radius/button/md":  "radius/4",
  "radius/card/md":    "radius/10",
  "radius/modal/md":   "radius/8",
};
