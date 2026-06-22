#!/usr/bin/env node
/**
 * export-icons-png.js
 * icons-data.js의 모든 variant figmaNodeId를 Figma REST API로 배치 익스포트해
 * assets/icons/{iconId}_{type}.png 로 저장한다.
 *
 * 사전 조건:
 *   .env 파일에 FIGMA_TOKEN=figd_... 값 입력
 *
 * 실행:
 *   node scripts/export-icons-png.js
 *   node scripts/export-icons-png.js --scale 2   (레티나 @2x, 기본값)
 *   node scripts/export-icons-png.js --scale 1   (1x)
 *   node scripts/export-icons-png.js --section security  (특정 섹션만)
 *   node scripts/export-icons-png.js --dry-run   (URL만 출력, 실제 저장 안 함)
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ─── 환경변수 로드 ─────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...rest] = line.split('=');
    if (k && rest.length && !process.env[k.trim()]) {
      process.env[k.trim()] = rest.join('=').trim();
    }
  });
}

const TOKEN    = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_ICONS_FILE_KEY || 'YcBbW9e0MTR9T3W5Sz0Ukx';

if (!TOKEN) {
  console.error('❌ FIGMA_TOKEN 이 .env 에 없습니다. Figma → 계정 설정 → Personal Access Token 생성 후 입력하세요.');
  process.exit(1);
}

// ─── CLI 인자 파싱 ─────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const scaleIdx  = args.indexOf('--scale');
const scale     = scaleIdx !== -1 ? parseFloat(args[scaleIdx + 1]) : 2;
const sectionIdx = args.indexOf('--section');
const sectionFilter = sectionIdx !== -1 ? args[sectionIdx + 1] : null;
const dryRun    = args.includes('--dry-run');

// ─── 출력 폴더 ────────────────────────────────────────────────────────────────
const OUT_DIR = path.join(__dirname, '..', 'assets', 'icons');
if (!dryRun) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── icons-data.js 파싱 ───────────────────────────────────────────────────────
const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'icons-data.js'), 'utf8');
eval(src.replace('window.ICONS_DATA', 'global.ICONS_DATA'));
const icons = global.ICONS_DATA.icons;

// 익스포트 대상 수집: { nodeId, filename, iconId, type }
const targets = [];
icons.forEach(icon => {
  if (sectionFilter && icon.section !== sectionFilter) return;
  Object.entries(icon.variants).forEach(([type, variant]) => {
    if (!variant.figmaNodeId) return;
    targets.push({
      nodeId:   variant.figmaNodeId,
      filename: icon.id + '_' + type + '.png',
      iconId:   icon.id,
      type,
    });
  });
});

console.log(`📦 익스포트 대상: ${targets.length}개 (scale ${scale}x, file: ${FILE_KEY})`);
if (sectionFilter) console.log(`   섹션 필터: ${sectionFilter}`);
if (dryRun) console.log('   --dry-run 모드: URL만 출력');

// ─── Figma API 헬퍼 ───────────────────────────────────────────────────────────
function figmaGet(urlPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      path: urlPath,
      method: 'GET',
      headers: { 'X-Figma-Token': TOKEN },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON 파싱 실패: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : require('http');
    const file = fs.createWriteStream(destPath);
    proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', err => { fs.unlinkSync(destPath); reject(err); });
    }).on('error', err => { fs.unlinkSync(destPath); reject(err); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── 배치 익스포트 ────────────────────────────────────────────────────────────
const BATCH_SIZE = 500;

async function run() {
  let done = 0, skipped = 0, failed = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    const nodeIds = batch.map(t => t.nodeId).join(',');
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(targets.length / BATCH_SIZE);

    console.log(`\n[배치 ${batchNum}/${totalBatches}] ${batch.length}개 URL 요청 중...`);

    let result;
    try {
      result = await figmaGet(
        `/v1/images/${FILE_KEY}?ids=${encodeURIComponent(nodeIds)}&format=png&scale=${scale}`
      );
    } catch (e) {
      console.error('  ❌ API 요청 실패:', e.message);
      failed += batch.length;
      continue;
    }

    if (result.err) {
      console.error('  ❌ Figma API 에러:', result.err);
      failed += batch.length;
      continue;
    }

    const images = result.images || {};
    console.log(`  ✅ URL ${Object.keys(images).length}개 수신`);

    if (dryRun) {
      batch.forEach(t => {
        const url = images[t.nodeId];
        console.log(`  ${t.filename}: ${url || '(null)'}`);
      });
      done += batch.length;
      continue;
    }

    // 병렬 다운로드 (20개씩)
    const DL_CONCURRENCY = 20;
    for (let j = 0; j < batch.length; j += DL_CONCURRENCY) {
      const chunk = batch.slice(j, j + DL_CONCURRENCY);
      await Promise.all(chunk.map(async t => {
        const url = images[t.nodeId];
        if (!url) {
          console.warn(`  ⚠ URL 없음: ${t.filename} (nodeId: ${t.nodeId})`);
          skipped++;
          return;
        }
        const destPath = path.join(OUT_DIR, t.filename);
        try {
          await downloadFile(url, destPath);
          done++;
          process.stdout.write('.');
        } catch (e) {
          console.error(`\n  ❌ 다운로드 실패: ${t.filename} — ${e.message}`);
          failed++;
        }
      }));
    }

    // API rate limit 방지
    if (i + BATCH_SIZE < targets.length) await sleep(500);
  }

  console.log(`\n\n✅ 완료: ${done}개 저장 / ⚠ ${skipped}개 스킵 / ❌ ${failed}개 실패`);
  console.log(`📁 저장 위치: ${OUT_DIR}`);

  if (!dryRun && done > 0) {
    console.log('\n다음 단계: node scripts/update-icons-data-to-png.js 를 실행하면');
    console.log('icons-data.js의 svg 필드가 png 경로로 자동 교체됩니다.');
  }
}

run().catch(e => { console.error('오류:', e); process.exit(1); });
