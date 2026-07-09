#!/usr/bin/env node
/**
 * typography-gen.js
 * 정본 plugins/figma-vars-installer/src/textstyles-data.ts(TEXT_STYLES) →
 * assets/css/typography.css(.typo-* 유틸리티 클래스) 생성.
 *
 * 타이포는 합성(font-size+weight+line-height+letter-spacing)이라 Variables(단일값) 불가 →
 * Figma Text Style + CSS 클래스로 떨어뜨린다. 이 스크립트가 CSS 쪽을 정본에서 자동 생성.
 * (색상의 tokens:gen 과 동일 사상 — 손편집 금지, 정본은 textstyles-data.ts)
 *
 * 네이밍(D1/D2): "group/sizeWeight" → ".typo-{group}-{sizeweight}"  (예: body/14R → .typo-body-14r)
 * weight: Regular→regular / Medium→medium / Bold→bold
 * line-height: 130→--line-height-130 / 140→--line-height-140
 * letter-spacing: -2→tight / 0→normal / 2→wide
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'plugins/figma-vars-installer/src/textstyles-data.ts');
const OUT = path.join(ROOT, 'assets/css/typography.css');
const CHECK = process.argv.includes('--check');

const WEIGHT = { Regular: 'regular', Medium: 'medium', Bold: 'bold' };
const LS = { '-2': 'tight', '0': 'normal', '2': 'wide' };

function parse() {
  const txt = fs.readFileSync(SRC, 'utf8');
  const re = /\{\s*name:\s*"([^"]+)",\s*fontStyle:\s*"([^"]+)",\s*fontSize:\s*(\d+),\s*lineHeightPercent:\s*(\d+),\s*letterSpacingPercent:\s*(-?\d+)\s*\}/g;
  const out = [];
  let m;
  while ((m = re.exec(txt)) !== null) {
    out.push({ name: m[1], fontStyle: m[2], fontSize: +m[3], lh: m[4], ls: m[5] });
  }
  return out;
}

function classFor(name) {
  // "body/14R" → "typo-body-14r" · 그룹 없는 이름은 typo-{name}
  return 'typo-' + name.replace('/', '-').toLowerCase();
}

function rule(s) {
  const cls = classFor(s.name);
  const weight = WEIGHT[s.fontStyle];
  const ls = LS[s.ls];
  if (!weight) throw new Error(`unknown fontStyle: ${s.fontStyle} (${s.name})`);
  if (!ls) throw new Error(`unknown letterSpacing: ${s.ls} (${s.name})`);
  return `.${cls} {
  font-size: var(--font-size-${s.fontSize});
  font-weight: var(--font-weight-${weight});
  line-height: var(--line-height-${s.lh});
  letter-spacing: var(--letter-spacing-${ls});
}`;
}

function main() {
  const styles = parse();
  if (!styles.length) { console.error('TEXT_STYLES 파싱 0건'); process.exit(1); }
  const groups = {};
  styles.forEach(s => { const g = s.name.includes('/') ? s.name.split('/')[0] : '기타'; (groups[g] ||= []).push(s); });

  let css = `/* ══════════════════════════════════════════════════
   typography.css — 자동 생성 (npm run typo:gen). 수동 편집 금지.
   정본: plugins/figma-vars-installer/src/textstyles-data.ts (TEXT_STYLES)
   합성 타이포 토큰 → CSS 유틸리티 클래스. font 4속성을 foundation 변수로 참조.
   사용: <span class="typo-body-14r">텍스트</span> (일반 콘텐츠용 / 컴포넌트는 내부 선언 유지)
   ══════════════════════════════════════════════════ */
`;
  for (const g of Object.keys(groups)) {
    css += `\n/* ── ${g} ── */\n`;
    css += groups[g].map(rule).join('\n') + '\n';
  }
  if (CHECK) {
    const existing = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
    if (existing === css) { console.error('[typo:check] typography.css 정본 일치'); return; }
    console.error('❌ typography.css가 정본(textstyles-data.ts)과 불일치. `npm run typo:gen` 실행 필요.');
    process.exit(1);
  }
  fs.writeFileSync(OUT, css);
  console.log(`✅ typography.css 생성 — ${styles.length}개 클래스 (${Object.keys(groups).join(', ')})`);
}

main();
