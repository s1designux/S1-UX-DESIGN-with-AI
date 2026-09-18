#!/usr/bin/env node
/**
 * screen-import.js — S-1 GUI Builder 플러그인이 내려준 파일을 저장소 안으로 푼다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜: 플러그인은 열쇠 없이 누구나 쓸 수 있지만, 내려받은 파일은 다운로드 폴더에 있다.
 *     이 명령이 그 파일을 판독 원자료(JSON)와 화면 그림(PNG)으로 갈라 저장소에 넣는다.
 *
 * 사용:
 *   npm run screen:import                     다운로드 폴더에서 가장 최근 것
 *   npm run screen:import -- <파일경로>
 *   npm run screen:import -- <파일경로> --as 모두앱     받는 폴더 이름을 직접 지정
 *
 * 출력: reports/screen-import/<이름>/raw/<페이지>.json  (그림 뺀 구조)
 *       reports/screen-import/<이름>/shots/<화면>.png
 *       reports/screen-import/<이름>/<페이지>.md        (한눈표)
 * 끝줄: `SCREENIMPORT_SUMMARY screens=<n> shots=<n> sec=<n>`
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const t0 = Date.now();
const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const asIdx = argv.indexOf('--as');
const asName = asIdx >= 0 ? argv[asIdx + 1] : null;

const slug = (s) => String(s || '').replace(/[^\w가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'screen';

function 최근내려받은것() {
  const dirs = [path.join(os.homedir(), 'Downloads'), path.join(os.homedir(), '다운로드')];
  const hits = [];
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      if (!/^s1-screens_.*\.json$/.test(f)) continue;
      const p = path.join(d, f);
      hits.push({ p, t: fs.statSync(p).mtimeMs });
    }
  }
  hits.sort((a, b) => b.t - a.t);
  return hits.length ? hits[0].p : null;
}

const src = positional[0] || 최근내려받은것();
if (!src) {
  console.error('❌ 풀 파일을 못 찾았습니다. 다운로드 폴더에 s1-screens_*.json 이 있는지 보거나, 파일 경로를 직접 주세요.');
  process.exit(1);
}
if (!fs.existsSync(src)) { console.error(`❌ 그런 파일이 없습니다: ${src}`); process.exit(1); }

let pack;
try { pack = JSON.parse(fs.readFileSync(src, 'utf8')); }
catch (e) { console.error(`❌ 파일을 읽지 못했습니다(형식이 다릅니다): ${e.message}`); process.exit(1); }

if (!pack || !pack._meta || pack._meta.source !== 'figma:plugin:s1-gui-builder' || !Array.isArray(pack.screens)) {
  console.error('❌ S-1 GUI Builder 가 내려준 파일이 아닙니다.');
  process.exit(1);
}

const 이름 = slug(asName || pack._meta.file.name);
const 페이지 = slug(pack._meta.page.name);
const base = path.join('reports/screen-import', 이름);
const rawDir = path.join(base, 'raw');
const shotDir = path.join(base, 'shots');
fs.mkdirSync(rawDir, { recursive: true });

let shots = 0;
const screens = pack.screens.map((s, i) => {
  const { 그림, ...나머지 } = s;
  const 파일 = `${String(i + 1).padStart(2, '0')}-${slug(s.name)}.png`;
  if (그림 && 그림.base64) {
    fs.mkdirSync(shotDir, { recursive: true });
    fs.writeFileSync(path.join(shotDir, 파일), Buffer.from(그림.base64, 'base64'));
    shots += 1;
    나머지.그림파일 = path.posix.join('shots', 파일);
    나머지.그림배율 = 그림.배율;
  }
  return 나머지;
});

const payload = { ...pack, screens };
fs.writeFileSync(path.join(rawDir, `${페이지}.json`), JSON.stringify(payload, null, 2) + '\n');

// 한눈표 — 사람이 먼저 훑어볼 것
const 줄 = screens.map((s, i) => {
  const 부품 = (s.components || []).slice(0, 4).map((c) => `${c.name}×${c.count}`).join(', ') || '—';
  const 그림칸 = s.그림파일 ? `[그림](${s.그림파일})` : '—';
  return `| ${i + 1} | ${s.name} | ${s.size} | ${s.nodeCount} | ${부품} | ${그림칸} |`;
});
const md = [
  `# ${pack._meta.file.name} — ${pack._meta.page.name}`,
  '',
  `가져온 날: ${new Date(pack._meta.generatedAt).toISOString().slice(0, 10)} · 화면 ${screens.length}개 · 그림 ${shots}장`,
  `원자료: \`raw/${페이지}.json\``,
  '',
  '| # | 화면 | 크기 | 요소 | 많이 쓰인 부품 | 그림 |',
  '|---|------|------|------|----------------|------|',
  ...줄,
  '',
  '## 많이 쓰인 부품 (페이지 전체)',
  '',
  '| 부품 | 횟수 |',
  '|------|------|',
  ...(pack.componentUsage || []).slice(0, 30).map((c) => `| ${c.name} | ${c.count} |`),
  '',
].join('\n');
fs.writeFileSync(path.join(base, `${페이지}.md`), md);

console.log(`✅ ${pack._meta.file.name} — ${pack._meta.page.name}`);
console.log(`   ${base}/${페이지}.md  (화면 ${screens.length} · 그림 ${shots})`);
console.log(`\nSCREENIMPORT_SUMMARY screens=${screens.length} shots=${shots} sec=${((Date.now() - t0) / 1000).toFixed(1)}`);
