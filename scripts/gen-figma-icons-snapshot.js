#!/usr/bin/env node
/**
 * gen-figma-icons-snapshot.js
 * Figma 아이콘 라이브러리 V2.2(파일키 YcBbW9e0MTR9T3W5Sz0Ukx · 페이지 0:1)의
 * 아이콘/변형 구조를 읽어 대조용 스냅샷 data/figma-icons-snapshot.json 을 생성한다.
 *
 * ⚠ 자동 생성 · 직접수정 금지 · 재생성: npm run icons:figma:snapshot
 *
 * 원천(raw): Figma MCP `get_metadata(fileKey, "0:1")` 의 XML 덤프.
 *   - Figma REST 는 .env FIGMA_TOKEN 이 비어 있어 못 쓰고, node 는 MCP 를 직접 못 부르므로,
 *     읽기(=MCP)는 사람/어시스턴트가 수행해 덤프를 캐시에 저장하고, 이 스크립트가 결정론적으로 파싱한다.
 *   - 캐시 경로(기본): data/.figma-raw-metadata.json  (MCP tool-result 형식 [{type,text}] 또는 순수 XML)
 *   - 다른 덤프로 재생성:  node scripts/gen-figma-icons-snapshot.js --dump <경로>
 *   - 이렇게 스냅샷은 "손으로 만든 정본"이 아니라 Figma 원천의 결정론적 변환물이다.
 *
 * 추출 규칙(검증됨): 아이콘 = <symbol> 자식을 가진 <frame>(섹션 직속). 변형 = 그 symbol 들.
 *   대조 키는 반드시 nodeId (변형명은 22개 아이콘에서 깨져 있어 이름 대조 금지).
 */

const fs   = require('fs');
const path = require('path');

const FILE_KEY = 'YcBbW9e0MTR9T3W5Sz0Ukx';
const PAGE     = '0:1';
const EXPECT   = { sections: 15, icons: 819, variants: 2457 };

const OUT_PATH  = path.join(__dirname, '..', 'data', 'figma-icons-snapshot.json');
const DUMP_FLAG = process.argv.indexOf('--dump');
const DUMP_PATH = DUMP_FLAG !== -1
  ? process.argv[DUMP_FLAG + 1]
  : path.join(__dirname, '..', 'data', '.figma-raw-metadata.json');

// ── 원천 덤프 로드 → XML 문자열 ───────────────────────────────────────────────
function loadXml() {
  if (!fs.existsSync(DUMP_PATH)) {
    console.error(`❌ 원천 덤프 없음: ${DUMP_PATH}`);
    console.error('   Figma MCP get_metadata(fileKey, "0:1") 결과를 이 경로에 저장 후 다시 실행하세요.');
    console.error('   (또는 --dump <경로> 로 지정)');
    process.exit(1);
  }
  const raw = fs.readFileSync(DUMP_PATH, 'utf8');
  // MCP tool-result 는 [{type:"text", text:"<xml>"}] 형식. 순수 XML 이면 그대로 사용.
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.map(x => (x && x.text) || '').join('\n');
  } catch (_) { /* 순수 XML */ }
  return raw;
}

// ── XML 스택 파서 → 아이콘 목록 ───────────────────────────────────────────────
function parseIcons(xml) {
  const tokRe = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[\w-]+="[^"]*")*)\s*(\/?)>/g;
  const attrs = s => {
    const o = {};
    (s.match(/[\w-]+="[^"]*"/g) || []).forEach(a => {
      const i = a.indexOf('=');
      o[a.slice(0, i)] = a.slice(i + 2, -1);
    });
    return o;
  };
  const stack = [];
  const frames = {};        // id -> { id, name, section, symbols:[] }
  let m;
  while ((m = tokRe.exec(xml))) {
    const close = m[1] === '/', tag = m[2], selfClose = m[4] === '/';
    if (!close && !selfClose) {
      const a = attrs(m[3]);
      const parent = stack[stack.length - 1] || null;
      if (tag === 'frame') {
        let section = null;
        for (let k = stack.length - 1; k >= 0; k--) if (stack[k].tag === 'section') { section = stack[k].name; break; }
        frames[a.id] = { id: a.id, name: a.name, section, parentTag: parent ? parent.tag : null, symbols: [] };
      }
      stack.push({ tag, id: a.id, name: a.name });
    } else if (selfClose) {
      const a = attrs(m[3]);
      const parent = stack[stack.length - 1] || null;
      if (tag === 'symbol' && parent && parent.tag === 'frame' && frames[parent.id]) {
        frames[parent.id].symbols.push({ nodeId: a.id, rawName: a.name });
      }
    } else {
      stack.pop();
    }
  }
  // 아이콘 = symbol 을 가진 frame(섹션 직속)
  return Object.values(frames)
    .filter(f => f.symbols.length > 0 && f.parentTag === 'section')
    .map(f => ({
      section: f.section,
      frameNodeId: f.id,
      figmaName: f.name,
      variants: f.symbols.map(s => {
        const eq = s.rawName.indexOf('=');
        return {
          nodeId: s.nodeId,
          rawName: s.rawName,
          property: eq === -1 ? '' : s.rawName.slice(0, eq),
          value: eq === -1 ? s.rawName : s.rawName.slice(eq + 1),
        };
      }),
    }));
}

function main() {
  const xml = loadXml();
  const icons = parseIcons(xml);
  const sections = new Set(icons.map(i => i.section));
  const variants = icons.reduce((n, i) => n + i.variants.length, 0);

  const snapshot = {
    source: 'Figma 아이콘 라이브러리 V2.2',
    fileKey: FILE_KEY,
    page: PAGE,
    generatedVia: 'Figma MCP get_metadata → gen-figma-icons-snapshot.js (자동 생성 · 직접수정 금지)',
    counts: { sections: sections.size, icons: icons.length, variants },
    icons,
  };

  // ★ 자기검증 — 실측(2026-07-13)과 다르면 파싱 규칙 오류 → 중단
  const bad = [];
  if (sections.size !== EXPECT.sections) bad.push(`sections ${sections.size}≠${EXPECT.sections}`);
  if (icons.length   !== EXPECT.icons)    bad.push(`icons ${icons.length}≠${EXPECT.icons}`);
  if (variants       !== EXPECT.variants) bad.push(`variants ${variants}≠${EXPECT.variants}`);
  if (bad.length) {
    console.error('❌ 스냅샷 개수 불일치(파싱 규칙 오류 가능): ' + bad.join(', '));
    console.error(`   실측 기대: 섹션 ${EXPECT.sections} · 아이콘 ${EXPECT.icons} · 변형 ${EXPECT.variants}`);
    process.exit(1);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  console.log(`✅ 스냅샷 생성 — 섹션 ${sections.size} · 아이콘 ${icons.length} · 변형 ${variants}`);
  console.log(`   ${path.relative(path.join(__dirname, '..'), OUT_PATH)}`);
  return snapshot;
}

if (require.main === module) main();

module.exports = { parseIcons, main };
