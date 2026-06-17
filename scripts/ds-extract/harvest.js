#!/usr/bin/env node
/**
 * ds-extract/harvest.js — 1패스 수확 (한 페이지)
 *
 * get_metadata 가 저장한 파일을 받아, 그 페이지의
 *   · 컴포넌트(인스턴스) 빈도 + 대표 nodeId + DS매칭 + 노이즈여부
 *   · 패턴 후보(프레임의 ≥2 인스턴스 구성) 빈도 + 대표 nodeId
 * 를 추출해 reports/ds-extract/harvest/<service>__<page>.json 으로 저장한다.
 * (XML 전체는 내 컨텍스트에 안 올림 — 스크립트가 디스크에서 처리)
 *
 * 사용: node scripts/ds-extract/harvest.js --in <savedMetaFile> --service <id> --page <nodeId>
 */
const fs = require('fs');
const path = require('path');
const { ROOT, readMetaXml, parseTree, makeChromeTest, loadDsIds, dsMatch } = require('./lib');

function arg(k, d) { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; }

const inFile = arg('--in');
const service = arg('--service', 'unknown');
const page = arg('--page', 'page');
if (!inFile) { console.error('필요: --in <savedMetaFile>'); process.exit(1); }

const cfgPath = path.join(ROOT, 'registry/figma/corpus-targets.json');
const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : { chromePatterns: [] };
const isChrome = makeChromeTest(cfg.chromePatterns);
const dsIds = loadDsIds();

const xml = readMetaXml(inFile);
const { instances, frames } = parseTree(xml);
const pageName = (xml.match(/<canvas [^>]*name="([^"]*)"/) || [])[1] || '';

// ── 컴포넌트(인스턴스) 집계 ──
const comp = {};
for (const n of instances) {
  if (!n.name) continue;
  if (!comp[n.name]) comp[n.name] = { name: n.name, count: 0, reprNodeId: n.id };
  comp[n.name].count++;
}
const components = Object.values(comp).map((c) => ({
  ...c, chrome: isChrome(c.name), dsMatch: dsMatch(c.name, dsIds),
})).sort((a, b) => b.count - a.count);

// ── 패턴 후보(프레임 직속 인스턴스 ≥2) 집계 ──
const sig = {};
for (const f of frames) {
  const ch = f.kids.filter((k) => k.tag === 'instance' && k.name).map((k) => k.name).sort();
  if (ch.length < 2) continue;
  const s = ch.join(' + ');
  if (!sig[s]) sig[s] = { signature: s, count: 0, frameName: f.name, reprNodeId: f.id };
  sig[s].count++;
}
const patterns = Object.values(sig).sort((a, b) => b.count - a.count);

const out = {
  service, page, pageName, fileKey: (cfg.services || []).find((s) => s.id === service)?.fileKey || null,
  harvestedAt: null, // 스크립트는 시계 안 씀 — 스킬이 보고 시 스탬프
  totals: { instances: instances.length, frames: frames.length, components: components.length, patterns: patterns.length },
  components, patterns,
};

const outDir = path.join(ROOT, 'reports/ds-extract/harvest');
fs.mkdirSync(outDir, { recursive: true });
const safe = (service + '__' + page).replace(/[^\w.-]/g, '_');
const outPath = path.join(outDir, safe + '.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');

console.log(`✅ harvest: ${service} / ${page} "${pageName}"`);
console.log(`   instances ${instances.length} · frames ${frames.length} · 컴포넌트종류 ${components.length} · 패턴후보 ${patterns.length}`);
console.log(`   → ${path.relative(ROOT, outPath)}`);
