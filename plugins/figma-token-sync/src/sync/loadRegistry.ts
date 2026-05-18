import type { FigmaCssTokenMap, TokenMapping } from "./types";
// esbuild bundles the JSON at build time — no runtime fs access needed
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokenMap: FigmaCssTokenMap = require("../../../../registry/tokens/figma-css-token-map.json");

export function loadTokenMap(): FigmaCssTokenMap {
  return tokenMap;
}

export function getAllMappings(): TokenMapping[] {
  const map = loadTokenMap();
  const all: TokenMapping[] = [];
  for (const group of map.mappings) {
    all.push(...group.items);
  }
  return all;
}
