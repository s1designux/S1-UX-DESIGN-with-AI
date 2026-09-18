#!/usr/bin/env node
/**
 * Figma get_metadata 덤프(파일로 저장된 XML)를 패턴 판독표 원자료로 바꾼다.
 * 사용: node scripts/pattern-inventory-parse.js <dump.txt> <out.json> "<페이지이름>" <pageNodeId>
 * 출력: 화면(1depth 프레임) 목록 + 화면별 쓰인 부품(instance) · 글자(text) 목록
 */
const fs = require('fs');

const [dumpPath, outPath, pageName, pageId] = process.argv.slice(2);
const raw = fs.readFileSync(dumpPath, 'utf8');
let xml;
try {
  xml = JSON.parse(raw).map((x) => x.text).join('');
} catch {
  xml = raw;
}

const attr = (line, key) => {
  const m = line.match(new RegExp(`${key}="([^"]*)"`));
  return m ? m[1] : null;
};

const lines = xml.split('\n');
const nodes = [];
for (const line of lines) {
  const m = line.match(/^(\s*)<(\w+)\s/);
  if (!m) continue;
  nodes.push({
    depth: m[1].length / 2,
    type: m[2],
    id: attr(line, 'id'),
    name: (attr(line, 'name') || '').trim(),
    x: Number(attr(line, 'x')),
    y: Number(attr(line, 'y')),
    width: Number(attr(line, 'width')),
    height: Number(attr(line, 'height')),
  });
}

// 화면 = canvas 직계 자식. section 이면 그 자식이 화면.
const screens = [];
for (let i = 0; i < nodes.length; i++) {
  const n = nodes[i];
  if (n.depth !== 1) continue;
  if (n.type === 'section') {
    for (let j = i + 1; j < nodes.length && nodes[j].depth > 1; j++) {
      if (nodes[j].depth === 2) screens.push({ ...nodes[j], section: n.name, _i: j });
    }
  } else {
    screens.push({ ...n, section: null, _i: i });
  }
}

const descendants = (startIdx, baseDepth) => {
  const out = [];
  for (let j = startIdx + 1; j < nodes.length && nodes[j].depth > baseDepth; j++) out.push(nodes[j]);
  return out;
};

const result = {
  _meta: {
    source: 'figma:get_metadata',
    page: { name: pageName, nodeId: pageId },
    generatedAt: new Date().toISOString().slice(0, 10),
    note: '기계 판독 원자료. 사람이 해석한 판독표는 같은 폴더의 md 에 쓴다.',
  },
  screenCount: screens.length,
  screens: screens.map((s) => {
    const kids = descendants(s._i, s.depth);
    const instances = kids.filter((k) => k.type === 'instance').map((k) => k.name);
    const texts = kids.filter((k) => k.type === 'text').map((k) => k.name);
    const counts = {};
    for (const nm of instances) counts[nm] = (counts[nm] || 0) + 1;
    return {
      id: s.id,
      name: s.name,
      section: s.section,
      size: `${s.width}x${s.height}`,
      nodeCount: kids.length,
      components: Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      texts,
    };
  }),
};

// 페이지 전체 부품 사용 빈도
const total = {};
for (const s of result.screens) for (const c of s.components) total[c.name] = (total[c.name] || 0) + c.count;
result.componentUsage = Object.entries(total)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({ name, count }));

fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
console.log(`${pageName}: 화면 ${result.screenCount}개 · 부품종류 ${result.componentUsage.length}`);
