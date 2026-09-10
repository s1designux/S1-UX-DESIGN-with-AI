/**
 * font-metrics.js — 설치된 Pretendard OTF 에서 글자 폭을 읽는다(오프라인·결정론).
 * ─────────────────────────────────────────────────────────────────────────
 * 왜 필요한가: 스펙 시트 라벨은 상자 폭이 고정이라 글자가 조금만 넓어지면 줄바꿈되고,
 *   그 줄이 바로 아래 컴포넌트를 덮는다. 캔버스는 파일이 아니라 렌더로 못 잡으므로
 *   **폰트 파일의 advance width 를 직접 읽어** 넘침을 기계로 판정한다.
 *
 * 읽는 표: head(unitsPerEm) · hhea(numberOfHMetrics) · hmtx(advanceWidth) · cmap(4/12).
 *   커닝(GPOS)은 무시한다 → 크롬 실측보다 폭이 **넓게** 나온다(라벨 292개 대조 결과 최대 +2.39px,
 *   방향은 항상 파서 ≥ 크롬). 넘침 판정에는 과대평가가 안전한 쪽이다.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const FONT_DIRS = [
  path.join(os.homedir(), 'Library/Fonts'),
  '/Library/Fonts',
  '/System/Library/Fonts',
  'C:\\Windows\\Fonts',
];
const FILE_BY_STYLE = {
  Regular: 'Pretendard-Regular.otf',
  Medium: 'Pretendard-Medium.otf',
  SemiBold: 'Pretendard-SemiBold.otf',
  Bold: 'Pretendard-Bold.otf',
};

function findFont(style) {
  const file = FILE_BY_STYLE[style];
  if (!file) return null;
  for (const dir of FONT_DIRS) {
    const p = path.join(dir, file);
    try { if (fs.statSync(p).isFile()) return p; } catch (e) { /* 다음 후보 */ }
  }
  return null;
}

function parse(buf) {
  const tables = {};
  const numTables = buf.readUInt16BE(4);
  for (let i = 0; i < numTables; i++) {
    const off = 12 + i * 16;
    tables[buf.toString('ascii', off, off + 4)] = { off: buf.readUInt32BE(off + 8), len: buf.readUInt32BE(off + 12) };
  }
  if (!tables.head || !tables.hhea || !tables.hmtx || !tables.cmap) throw new Error('필수 표 누락');
  const unitsPerEm = buf.readUInt16BE(tables.head.off + 18);
  const numHMetrics = buf.readUInt16BE(tables.hhea.off + 34);

  // hmtx — 앞 numHMetrics 개만 개별 advance, 이후는 마지막 값 반복
  const advances = new Uint16Array(numHMetrics);
  for (let i = 0; i < numHMetrics; i++) advances[i] = buf.readUInt16BE(tables.hmtx.off + i * 4);

  // cmap — 유니코드 서브테이블(3/10 format 12 우선, 없으면 3/1 format 4)
  const cmapOff = tables.cmap.off;
  const nSub = buf.readUInt16BE(cmapOff + 2);
  let best = null;
  for (let i = 0; i < nSub; i++) {
    const rec = cmapOff + 4 + i * 8;
    const plat = buf.readUInt16BE(rec);
    const enc = buf.readUInt16BE(rec + 2);
    const sub = cmapOff + buf.readUInt32BE(rec + 4);
    const fmt = buf.readUInt16BE(sub);
    const score = fmt === 12 && plat === 3 && enc === 10 ? 3 : fmt === 4 && plat === 3 && enc === 1 ? 2 : fmt === 4 ? 1 : 0;
    if (score && (!best || score > best.score)) best = { sub, fmt, score };
  }
  if (!best) throw new Error('유니코드 cmap 없음');

  const lookup = best.fmt === 12 ? format12(buf, best.sub) : format4(buf, best.sub);
  return { unitsPerEm, advances, lookup };
}

function format4(buf, sub) {
  const segX2 = buf.readUInt16BE(sub + 6);
  const seg = segX2 / 2;
  const endO = sub + 14, startO = endO + segX2 + 2, deltaO = startO + segX2, rangeO = deltaO + segX2;
  return (cp) => {
    if (cp > 0xffff) return 0;
    for (let i = 0; i < seg; i++) {
      if (buf.readUInt16BE(endO + i * 2) < cp) continue;
      const start = buf.readUInt16BE(startO + i * 2);
      if (start > cp) return 0;
      const delta = buf.readInt16BE(deltaO + i * 2);
      const rangeOff = buf.readUInt16BE(rangeO + i * 2);
      if (rangeOff === 0) return (cp + delta) & 0xffff;
      const gi = buf.readUInt16BE(rangeO + i * 2 + rangeOff + (cp - start) * 2);
      return gi === 0 ? 0 : (gi + delta) & 0xffff;
    }
    return 0;
  };
}

function format12(buf, sub) {
  const nGroups = buf.readUInt32BE(sub + 12);
  const base = sub + 16;
  return (cp) => {
    let lo = 0, hi = nGroups - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1, g = base + mid * 12;
      const s = buf.readUInt32BE(g), e = buf.readUInt32BE(g + 4);
      if (cp < s) hi = mid - 1;
      else if (cp > e) lo = mid + 1;
      else return buf.readUInt32BE(g + 8) + (cp - s);
    }
    return 0;
  };
}

const cache = new Map();
function load(style) {
  if (cache.has(style)) return cache.get(style);
  const file = findFont(style);
  let font = null;
  if (file) { try { font = parse(fs.readFileSync(file)); } catch (e) { font = null; } }
  cache.set(style, font);
  return font;
}

/** 글자열의 렌더 폭(px). 폰트를 못 찾으면 null — 호출자가 SKIP 판정한다. */
function measure(text, fontSizePx, style) {
  const f = load(style);
  if (!f) return null;
  let units = 0;
  for (const ch of text) {
    const gi = f.lookup(ch.codePointAt(0));
    units += f.advances[Math.min(gi, f.advances.length - 1)];
  }
  return (units * fontSizePx) / f.unitsPerEm;
}

module.exports = { measure, available: (style) => !!load(style), fontPath: findFont };
