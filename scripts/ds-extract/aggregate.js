#!/usr/bin/env node
/**
 * ds-extract/aggregate.js — 코퍼스 수렴 (여러 페이지/서비스 합산)
 *
 * reports/ds-extract/harvest/*.json 을 모두 합쳐:
 *   · 컴포넌트: 빈도 × "걸친 서비스 수(breadth)" → 코어/서비스 분류 + DS매칭
 *   · 패턴:     빈도 × breadth → 공통/서비스 패턴
 *   · breadth 분포 히스토그램(승격 임계값 캘리브레이션용)
 * 결과: reports/ds-extract/corpus-analysis.{json,md}
 *
 * 승격 임계값: breadth ≥ CORE_MIN_SERVICES(기본 2) AND total ≥ CORE_MIN_FREQ(기본 3) → 코어.
 *   (단일 서비스 = 서비스 컴포넌트/패턴). 분포 보고 조정.
 *
 * 사용: node scripts/ds-extract/aggregate.js [--coreServices N] [--coreFreq N]
 */
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./lib');

function arg(k, d) { const i = process.argv.indexOf(k); return i >= 0 ? +process.argv[i + 1] : d; }
const CORE_MIN_SERVICES = arg('--coreServices', 2);
const CORE_MIN_FREQ = arg('--coreFreq', 3);

const dir = path.join(ROOT, 'reports/ds-extract/harvest');
if (!fs.existsSync(dir)) { console.error('harvest 없음 — 먼저 ds:harvest 실행'); process.exit(1); }
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
if (!files.length) { console.error('harvest 결과 0건'); process.exit(1); }

const comp = {};   // name → {count, services:Set, chrome, dsMatch, reprNodeId, reprService}
const pat = {};    // signature → {count, services:Set, reprNodeId, frameName, reprService}

for (const f of files) {
  const h = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const c of h.components) {
    const e = comp[c.name] || (comp[c.name] = { name: c.name, count: 0, services: new Set(), chrome: c.chrome, dsMatch: c.dsMatch, reprNodeId: c.reprNodeId, reprService: h.service });
    e.count += c.count; e.services.add(h.service);
    if (c.dsMatch) e.dsMatch = c.dsMatch;
  }
  for (const p of h.patterns) {
    const e = pat[p.signature] || (pat[p.signature] = { signature: p.signature, count: 0, services: new Set(), reprNodeId: p.reprNodeId, frameName: p.frameName, reprService: h.service });
    e.count += p.count; e.services.add(h.service);
  }
}

function classify(breadth) { return breadth >= CORE_MIN_SERVICES ? 'core' : 'service'; }

const components = Object.values(comp).map((c) => {
  const breadth = c.services.size;
  const tier = c.chrome ? 'chrome' : (classify(breadth) === 'core' && c.count >= CORE_MIN_FREQ ? 'core' : 'service');
  return { name: c.name, total: c.count, breadth, services: [...c.services], chrome: c.chrome, dsMatch: c.dsMatch, tier, reprNodeId: c.reprNodeId, reprService: c.reprService };
}).sort((a, b) => b.total - a.total);

const patterns = Object.values(pat).map((p) => {
  const breadth = p.services.size;
  const tier = breadth >= CORE_MIN_SERVICES ? 'common-pattern' : 'service-pattern';
  return { signature: p.signature, total: p.count, breadth, services: [...p.services], tier, reprNodeId: p.reprNodeId, frameName: p.frameName, reprService: p.reprService };
}).sort((a, b) => b.total - a.total);

// breadth 히스토그램 (chrome 제외)
const hist = {};
for (const c of components) { if (c.chrome) continue; hist[c.breadth] = (hist[c.breadth] || 0) + 1; }

const analysis = {
  generatedFrom: files.length + ' page-harvests',
  thresholds: { coreMinServices: CORE_MIN_SERVICES, coreMinFreq: CORE_MIN_FREQ },
  breadthHistogram: hist,
  components, patterns,
};
const outJson = path.join(ROOT, 'reports/ds-extract/corpus-analysis.json');
fs.writeFileSync(outJson, JSON.stringify(analysis, null, 2) + '\n');

// ── 읽기용 MD ──
const row = (c) => `| ${c.total} | ${c.breadth} | ${c.name} | ${c.dsMatch ? 'MATCH:' + c.dsMatch : 'NEW?'} | ${c.reprNodeId} |`;
let md = `# DS-Extract 코퍼스 분석\n\n`;
md += `> ${files.length}개 페이지 합산 · 임계값 core = (서비스 ≥ ${CORE_MIN_SERVICES} AND 빈도 ≥ ${CORE_MIN_FREQ})\n`;
md += `> ⚠️ 서비스 1개만 분석 시 breadth 가 전부 1이라 코어 분류 불가 — 파일 더 넣으면 활성화.\n\n`;
md += `## breadth(걸친 서비스 수) 분포\n\n| 서비스 수 | 컴포넌트 종류 |\n|---|---|\n`;
for (const k of Object.keys(hist).sort((a, b) => b - a)) md += `| ${k} | ${hist[k]} |\n`;
const sec = (title, list) => {
  md += `\n## ${title}\n\n| 빈도 | 서비스수 | 이름 | 기존DS | 대표nodeId |\n|---|---|---|---|---|\n`;
  list.forEach((c) => { md += row(c) + '\n'; });
};
sec('코어 컴포넌트 후보', components.filter((c) => c.tier === 'core'));
sec('서비스 컴포넌트 후보', components.filter((c) => c.tier === 'service'));
sec('노이즈(시스템 크롬 — 제외)', components.filter((c) => c.tier === 'chrome'));
md += `\n## 패턴 후보\n\n| 빈도 | 서비스수 | 분류 | 구성 | 대표nodeId |\n|---|---|---|---|---|\n`;
patterns.forEach((p) => { md += `| ${p.total} | ${p.breadth} | ${p.tier} | ${p.signature} | ${p.reprNodeId} |\n`; });
const outMd = path.join(ROOT, 'reports/ds-extract/corpus-analysis.md');
fs.writeFileSync(outMd, md);

console.log(`✅ aggregate: ${files.length} page-harvests`);
console.log(`   컴포넌트 ${components.length}종 (core후보 ${components.filter((c) => c.tier === 'core').length} · 서비스 ${components.filter((c) => c.tier === 'service').length} · 크롬 ${components.filter((c) => c.tier === 'chrome').length})`);
console.log(`   패턴 ${patterns.length}종 · breadth 분포 ${JSON.stringify(hist)}`);
console.log(`   → reports/ds-extract/corpus-analysis.{json,md}`);
