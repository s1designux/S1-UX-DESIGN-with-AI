/**
 * install-textstyles.ts
 * V2.4 출처 Text Styles 를 현재 파일에 생성한다 (get-or-create, 이름 기준 재사용).
 *
 * - 같은 이름의 텍스트 스타일이 있으면 재사용해 값만 갱신 → 적용된 노드 연결 보존.
 * - 폰트(Pretendard Regular/Medium/Bold)를 먼저 loadFontAsync 한 뒤 생성.
 *   폰트가 파일/환경에 없으면 명확한 오류로 보고 (임의 대체 금지).
 * - 반환: 스타일명 → TextStyle 맵 (컴포넌트 빌드가 텍스트 스타일을 참조하는 데 사용).
 */

import { TEXT_STYLES, TEXT_STYLE_FONT_FAMILY, TextStyleDef } from "./textstyles-data";

async function getOrCreateTextStyle(name: string): Promise<TextStyle> {
  const all = await figma.getLocalTextStylesAsync();
  const existing = all.find((s) => s.name === name);
  if (existing) return existing;
  return figma.createTextStyle();
}

/** TEXT_STYLES 가 쓰는 모든 Pretendard weight 를 미리 로드한다. */
async function loadRequiredFonts(): Promise<void> {
  const styles = Array.from(new Set(TEXT_STYLES.map((s) => s.fontStyle)));
  for (const style of styles) {
    try {
      await figma.loadFontAsync({ family: TEXT_STYLE_FONT_FAMILY, style });
    } catch (e) {
      throw new Error(
        `폰트 로드 실패: ${TEXT_STYLE_FONT_FAMILY} ${style}. ` +
          `이 Figma 파일/환경에 Pretendard ${style} 가 설치되어 있는지 확인하세요.`
      );
    }
  }
}

export async function installTextStyles(
  onProgress?: (step: string, pct: number) => void,
  pctFrom = 70,
  pctTo = 85
): Promise<Record<string, TextStyle>> {
  await loadRequiredFonts();

  const map: Record<string, TextStyle> = {};
  for (let i = 0; i < TEXT_STYLES.length; i++) {
    const def: TextStyleDef = TEXT_STYLES[i];
    const ts = await getOrCreateTextStyle(def.name);
    ts.name = def.name;
    ts.fontName = { family: TEXT_STYLE_FONT_FAMILY, style: def.fontStyle };
    ts.fontSize = def.fontSize;
    ts.lineHeight = { unit: "PERCENT", value: def.lineHeightPercent };
    ts.letterSpacing = { unit: "PERCENT", value: def.letterSpacingPercent };
    map[def.name] = ts;

    if (onProgress) {
      const pct = pctFrom + Math.round((i / TEXT_STYLES.length) * (pctTo - pctFrom));
      onProgress(`Text Style: ${def.name}`, pct);
    }
  }
  return map;
}
