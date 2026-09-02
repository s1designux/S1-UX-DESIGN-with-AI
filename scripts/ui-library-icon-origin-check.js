#!/usr/bin/env node
/**
 * UI Library Icon Origin Check — 웹 아이콘이 "라이브러리 원본과 같은 모양인가"를 기계로 대조한다.
 *
 * ★ 왜 필요한가 (2026-09-02, river 지적으로 두 번째 재발):
 *   설치기 build-components.ts 는 아이콘을 Figma 라이브러리에서 key 로 import 하고,
 *   **실패할 때만** 쓰는 폴백 SVG 상수를 함께 갖고 있다. 그 폴백이 정본 파일 안에 있어서
 *   웹으로 옮길 때 "정본에 있으니 원본"으로 착각하기 쉽다 — chevron(2026-09-01)·close(2026-09-02)
 *   두 번 다 사람이 눈으로 잡았다. 기존 아이콘 검사기(ui:icons)는 frame/glyph "구조"만 보고
 *   **모양이 원본과 같은지는 아무도 보지 않았다.**
 *
 *   저장소에는 라이브러리 전체 내보내기(assets/icons/ic_*.png, 819종×3변형)가 이미 있다.
 *   즉 정답지는 있었는데 대조하는 사람이 없었을 뿐이다. 이 스크립트가 그 대조를 한다.
 *
 * 무엇을 하나:
 *   1) 각 웹 아이콘 SVG 를 원본 내보내기와 같은 픽셀 크기로 래스터화한다(headless chrome).
 *   2) 알파맵을 겹쳐 평균 오차를 낸다. 임계값을 넘으면 "원본과 다른 모양"으로 판정한다.
 *   3) 결과를 reports/ui-library/icon-origin-verification.json 에 지문과 함께 기록한다.
 *      ui:icons(게이트) 는 이 기록이 현재 파일 지문과 맞는지만 확인하므로 게이트가 느려지지 않는다.
 *
 * 프레임이 다른 아이콘(예: 24 프레임 원본 ↔ 16 프레임 웹 자산)은 대응 관계를 선언하지 않으면
 * **미확인으로 남기고 통과시키지 않는다.** 미계측을 통과로 보고하지 않는다는 저장소 원칙 그대로다.
 *
 * 사용:
 *   node scripts/ui-library-icon-origin-check.js            # 기록과 현재 파일 대조(빠름, 렌더 없음)
 *   node scripts/ui-library-icon-origin-check.js --record   # 실제 렌더해서 기록 갱신
 *
 * 종료코드: 0 통과 · 1 실패
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createHash } = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'ui-library/src/assets/icons');
const RECORD = path.join(ROOT, 'reports/ui-library/icon-origin-verification.json');
const BASELINE = path.join(ROOT, 'registry/governance/icon-origin-baseline.json');

/** 원본과 "같은 모양"으로 인정하는 평균 알파 오차 상한.
 *  보정 근거(2026-09-02 실측): chevron 0.0010 · remove 0.0061 = 원본 그대로 옮긴 자산.
 *  close 0.0348 = 손으로 그린 폴백. 두 무리 사이가 5배 이상 벌어져 0.015 로 가른다. */
const MAX_MEAN_ALPHA_ERROR = 0.015;

const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

function pngSize(file) {
  const buf = fs.readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** PNG 알파 채널을 읽는다. 외부 의존 없이 zlib 만 쓴다. */
function pngAlpha(file) {
  const zlib = require('zlib');
  const buf = fs.readFileSync(file);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`${path.basename(file)}: 8bit RGB/RGBA PNG 만 지원합니다 (colorType=${colorType}, bitDepth=${bitDepth})`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const chunks = [];
  let offset = 8;
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(buf.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = zlib.inflateSync(Buffer.concat(chunks));
  const stride = width * channels;
  const out = new Float32Array(width * height);
  const line = Buffer.alloc(stride);
  const prev = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[pos]; pos += 1;
    raw.copy(line, 0, pos, pos + stride); pos += stride;
    for (let i = 0; i < stride; i += 1) {
      const a = i >= channels ? line[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let value = line[i];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += Math.floor((a + b) / 2);
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
        value += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      line[i] = value & 0xff;
    }
    for (let x = 0; x < width; x += 1) {
      const i = x * channels;
      // 내보내기는 투명 배경 + 검정 잉크다. RGB 만 있는 경우는 흰 배경 위 검정으로 본다.
      out[y * width + x] = channels === 4
        ? line[i + 3] / 255
        : 1 - (line[i] + line[i + 1] + line[i + 2]) / 765;
    }
    line.copy(prev);
  }
  return { width, height, alpha: out };
}

function rasterizeSvg(svgFile, size) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'icon-origin-'));
  const html = path.join(tmpDir, 'icon.html');
  const out = path.join(tmpDir, 'icon.png');
  fs.writeFileSync(html, `<meta charset="utf-8"><style>html,body{margin:0;background:transparent}`
    + `img{display:block;width:${size}px;height:${size}px}</style>`
    + `<img src="file://${svgFile}">`);
  execFileSync(process.execPath, [
    path.join(ROOT, 'scripts/render-shot.js'), html, out,
    `--window-size=${size},${size}`, '--wait-ms=300', '--quiet',
  ], { stdio: 'pipe' });
  const raster = pngAlpha(out);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  // headless chrome 은 화면 배율(Retina 2배)로 찍는다. 원본 내보내기 크기에 맞춰 박스 평균으로 줄인다.
  if (raster.width === size) return raster;
  if (raster.width % size !== 0) throw new Error(`래스터 크기 ${raster.width} 가 목표 ${size} 의 정수배가 아닙니다.`);
  const factor = raster.width / size;
  const alpha = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let sum = 0;
      for (let dy = 0; dy < factor; dy += 1) {
        for (let dx = 0; dx < factor; dx += 1) sum += raster.alpha[(y * factor + dy) * raster.width + (x * factor + dx)];
      }
      alpha[y * size + x] = sum / (factor * factor);
    }
  }
  return { width: size, height: size, alpha };
}

function compare(icon) {
  const exportFile = path.join(ROOT, icon.sourceExport);
  const svgFile = path.join(SOURCE_DIR, icon.file);
  const { width } = pngSize(exportFile);
  const origin = pngAlpha(exportFile);
  const web = rasterizeSvg(svgFile, width);
  let sum = 0;
  for (let i = 0; i < origin.alpha.length; i += 1) sum += Math.abs(origin.alpha[i] - web.alpha[i]);
  return { meanAlphaError: Number((sum / origin.alpha.length).toFixed(5)), size: width };
}

/** ③ 설치기 폴백 도형이 웹 자산으로 새어 들어오는 것을 막는다.
 *  build-components.ts 에서 `// icon-fallback-not-canon` 표식이 붙은 상수의 path d 값을 모은다. */
function fallbackPathData() {
  const file = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
  if (!fs.existsSync(file)) return [];
  const source = fs.readFileSync(file, 'utf8');
  const found = [];
  const marker = /\/\/\s*icon-fallback-not-canon:[^\n]*\n\s*const\s+(\w+)\s*=\s*`([^`]*)`/g;
  for (const match of source.matchAll(marker)) {
    for (const d of match[2].matchAll(/\sd="([^"]+)"/g)) found.push({ constant: match[1], d: d[1] });
  }
  return found;
}

function fingerprints(icon) {
  return {
    svgSha256: sha(fs.readFileSync(path.join(SOURCE_DIR, icon.file))),
    exportSha256: sha(fs.readFileSync(path.join(ROOT, icon.sourceExport))),
  };
}

function run({ record = false } = {}) {
  const manifest = readJson(path.join(SOURCE_DIR, 'manifest.json'));
  const previous = fs.existsSync(RECORD) ? readJson(RECORD) : { icons: {} };
  const errors = [];
  const notes = [];
  const results = {};
  const fallbacks = fallbackPathData();
  const reusedFallback = {};
  const warnings = [];
  const exempt = new Set(
    (fs.existsSync(BASELINE) ? readJson(BASELINE).exempt || [] : []).map(({ id }) => id),
  );

  for (const icon of manifest.icons || []) {
    const label = icon.id;

    if (!icon.sourceExport) {
      errors.push(`${label}: sourceExport(라이브러리 원본 내보내기 경로)가 선언돼 있지 않습니다. 원본 없이 아이콘을 등록할 수 없습니다.`);
      continue;
    }
    if (!fs.existsSync(path.join(ROOT, icon.sourceExport))) {
      errors.push(`${label}: 선언한 원본 ${icon.sourceExport} 가 저장소에 없습니다.`);
      continue;
    }

    // 프레임이 원본과 다르면 대응 관계 없이 픽셀 대조를 할 수 없다 — 통과시키지 않고 미확인으로 둔다.
    if (icon.originComparable === false) {
      const reason = icon.originComparableNote || '사유 미기재';
      const message = `${label}: 원본 픽셀 대조 미확인 — ${reason} 대응 관계를 선언하거나 원본과 같은 프레임으로 자산을 다시 만들어야 합니다.`;
      // 기존 부채는 기록만 하고 차단하지 않는다. 신규·변경 아이콘은 면제되지 않는다(Gate 30 과 같은 방식).
      if (exempt.has(label)) warnings.push(`${message} (기존 부채 — registry/governance/icon-origin-baseline.json)`);
      else errors.push(message);
      continue;
    }

    const fp = fingerprints(icon);
    const before = previous.icons?.[label];
    reusedFallback[label] = fallbacks.filter(({ d }) => fs.readFileSync(path.join(SOURCE_DIR, icon.file), 'utf8').includes(d));
    const fresh = before && before.svgSha256 === fp.svgSha256 && before.exportSha256 === fp.exportSha256;

    if (!record) {
      if (!fresh) {
        errors.push(`${label}: 원본 대조 기록이 없거나 낡았습니다. node scripts/ui-library-icon-origin-check.js --record 로 갱신하세요.`);
        continue;
      }
      results[label] = before;
      if (before.verdict !== 'PASS') errors.push(`${label}: 원본과 모양이 다릅니다 (평균 알파 오차 ${before.meanAlphaError} > ${MAX_MEAN_ALPHA_ERROR}) — ${icon.sourceExport} 와 대조.`);
      continue;
    }

    const { meanAlphaError, size } = compare(icon);
    const verdict = meanAlphaError <= MAX_MEAN_ALPHA_ERROR ? 'PASS' : 'FAIL';
    results[label] = { ...fp, sourceExport: icon.sourceExport, size, meanAlphaError, verdict, observedAt: new Date().toISOString().slice(0, 10) };
    const fromFallback = [...new Set((reusedFallback[label] || []).map(({ constant }) => constant))].join(', ');
    if (verdict === 'PASS') {
      notes.push(`${label}: 원본과 일치 (오차 ${meanAlphaError})${fromFallback ? ` · 설치기 폴백 ${fromFallback} 과 같은 도형이지만 원본과도 일치해 허용` : ''}`);
    } else {
      errors.push(`${label}: 원본과 모양이 다릅니다 (평균 알파 오차 ${meanAlphaError} > ${MAX_MEAN_ALPHA_ERROR}) — ${icon.sourceExport} 와 대조.`
        + (fromFallback ? ` 이 자산은 설치기 폴백 도형 ${fromFallback} 에서 왔습니다 — 폴백은 정본이 아닙니다.` : ''));
    }
  }

  if (record) {
    fs.mkdirSync(path.dirname(RECORD), { recursive: true });
    fs.writeFileSync(RECORD, `${JSON.stringify({
      _role: '웹 아이콘 ↔ 라이브러리 원본 내보내기 픽셀 대조 기록. ui:icons 가 이 기록의 지문이 현재 파일과 맞는지 확인한다.',
      _threshold: MAX_MEAN_ALPHA_ERROR,
      _regen: 'node scripts/ui-library-icon-origin-check.js --record',
      icons: results,
    }, null, 2)}\n`);
  }

  return { errors, notes, warnings, count: Object.keys(results).length };
}

if (require.main === module) {
  const record = process.argv.includes('--record');
  let result;
  try {
    result = run({ record });
  } catch (e) {
    console.error(`❌ 아이콘 원본 대조 실패: ${e.message}`);
    process.exit(1);
  }
  for (const note of result.notes) console.log(`✅ ${note}`);
  for (const warning of result.warnings) console.warn(`⚠️  ${warning}`);
  for (const error of result.errors) console.error(`❌ ${error}`);
  if (!result.errors.length) console.log('✅ 모든 웹 아이콘이 라이브러리 원본 내보내기와 같은 모양');
  console.log(`UIICONORIGIN_SUMMARY icons=${result.count} errors=${result.errors.length} warnings=${result.warnings.length} threshold=${MAX_MEAN_ALPHA_ERROR}`);
  process.exit(result.errors.length ? 1 : 0);
}

module.exports = { run, MAX_MEAN_ALPHA_ERROR };
