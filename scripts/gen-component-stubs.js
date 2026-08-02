#!/usr/bin/env node
/**
 * gen-component-stubs.js — pages/components.html 의 부품(요소) 섹션 자동 생성
 * ─────────────────────────────────────────────────────────────────────────
 * 정본: data/component-element-stubs.json → HTML 마커 구간(GEN:COMPONENT-STUBS)
 *
 * 왜 생성물로 바꾸나 (2026-08-02):
 *   부품 섹션 18개는 구조가 완전 균질한데(줄수 = 21 + 토큰행수, 18/18 성립) 473줄을 손으로
 *   유지하고 있었다. 토큰 표만 있는 껍데기라 값이 바뀌어도 아무도 안 고치고, 실제로
 *   `gnb-util-icon` 은 배지가 "2 tokens"인데 행은 1개인 채 방치돼 있었다.
 *   데이터 1곳으로 옮기면 손편집이 사라지고 Gate 9d 가 드리프트를 막는다.
 *
 * ⚠️ 생성 결과가 반드시 지켜야 하는 계약 (실측 근거 — 깨면 게이트가 죽거나 조용히 무력화된다):
 *   1) `gnb-util-icon`·`date-picker-bottom-sheet` **id 보존** — 바뀌면 Gate 18 FAIL(차단).
 *      나머지 16개 id 도 바뀌면 orphanSection 경고가 난다.
 *   2) thead 4열 + `<td class="token-resolved" data-token="--…">` — 페이지 로드 시 IIFE 가
 *      이 구조를 읽어 Light/Dark 열을 증설한다(런타임 JS 계약).
 *   3) `</td><td class="token-value">` 사이에 **개행 금지** — Gate 10 Check C2 의 정규식이
 *      한 줄 형태를 전제한다. 개행을 넣으면 FAIL 이 아니라 **검사가 조용히 사라진다**(더 나쁨).
 *   4) 속성 순서 `class="comp-section" … id="…"` 유지 — Gate 23 의 섹션 슬라이스 정규식 전제.
 *   5) 마커 문구에 토큰명(`--x`)·콜론 금지 — Gate 25 는 HTML 주석을 제거하지 않아 별칭 정의로 오인한다.
 *
 * 관례는 scripts/gen-semantic-page.js 를 따른다(indexOf 슬라이스 · 마커 부재 시 exit 1 ·
 * "수동 편집 금지" 문구). `--check` 는 gen-foundation-color.js 방식(불일치 시 exit 1).
 *
 * 사용: node scripts/gen-component-stubs.js [--check|--preview]   (npm run stubs:gen)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data/component-element-stubs.json');
const HTML = path.join(ROOT, 'pages/components.html');
const CHECK = process.argv.includes('--check');
const PREVIEW = process.argv.includes('--preview');

const START = '      <!-- >>> GEN:COMPONENT-STUBS >>> 자동 생성 (npm run stubs:gen). 수동 편집 금지. -->';
const END = '      <!-- <<< GEN:COMPONENT-STUBS <<< -->';

function buildSection(s) {
  const rows = (s.rows || []).map((r) =>
    `                <tr><td class="token-name">${r.token}</td><td class="token-value">${r.value}</td><td class="token-resolved" data-token="${r.token}"></td><td>${r.role}</td></tr>`
  ).join('\n');
  // 배지 개수는 행 수에서 파생한다. badgeCount 필드는 "정본이 행 수와 다르다"고 명시한 예외만.
  const count = typeof s.badgeCount === 'number' ? s.badgeCount : (s.rows || []).length;
  const unit = count === 1 ? 'token' : 'tokens';
  const upper = s.titleUpper || s.title.toUpperCase();
  return `      <!-- ═══ ${upper} ═══ -->
      <section class="comp-section" id="${s.id}">
        <div class="comp-section-header">
          <h2 class="comp-section-title">${s.title}</h2>
          <span class="comp-badge">Element</span>
          <span class="comp-badge">${count} ${unit}</span>
        </div>
        <div class="code-block">
          <div class="code-tabs">
            <button class="code-tab active" onclick="switchTab(this,'${s.paneId}')">Token Details</button>
          </div>
          <div class="code-pane active" id="${s.paneId}">
            <table class="token-detail-table">
              <thead>
                <tr><th>Token</th><th>Value (Semantic)</th><th>Resolved</th><th>Role</th></tr>
              </thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
        </div>
      </section>`;
}

function buildBlock(stubs) {
  return stubs.map(buildSection).join('\n\n');
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const stubs = data.stubs || [];
  if (stubs.length === 0) {
    console.error('❌ data/component-element-stubs.json 에 stubs 가 0건입니다 — 생성 중단(추출 0건=안 됨).');
    process.exit(1);
  }
  const body = buildBlock(stubs);

  if (PREVIEW) {
    process.stdout.write(body + '\n');
    process.stderr.write(`\n[stubs:gen] 부품 섹션 ${stubs.length}개 · 토큰 행 ${stubs.reduce((a, s) => a + (s.rows || []).length, 0)}개\n`);
    return;
  }

  const html = fs.readFileSync(HTML, 'utf8');
  const s = html.indexOf(START);
  const e = html.indexOf(END);
  if (s < 0 || e < 0) {
    console.error('❌ pages/components.html 에 GEN:COMPONENT-STUBS 마커가 없습니다. 최초 1회는 마커를 주입해야 합니다.');
    process.exit(1);
  }
  const oldRegion = html.slice(s, e + END.length);
  const newRegion = `${START}\n${body}\n${END}`;

  if (CHECK) {
    if (oldRegion === newRegion) {
      console.log(`  ✅ 부품 섹션 정본 일치 (${stubs.length}개 · 토큰 ${stubs.reduce((a, x) => a + (x.rows || []).length, 0)}행)`);
      return;
    }
    console.error('  ❌ pages/components.html 의 부품 섹션이 정본과 어긋남 — `npm run stubs:gen` 으로 재생성');
    process.exit(1);
  }

  if (oldRegion === newRegion) {
    console.log(`✅ 부품 섹션 생성 — 변경 없음 (${stubs.length}개)`);
    return;
  }
  fs.writeFileSync(HTML, html.slice(0, s) + newRegion + html.slice(e + END.length));
  console.log(`✅ 부품 섹션 생성 완료 — ${stubs.length}개 · 토큰 ${stubs.reduce((a, x) => a + (x.rows || []).length, 0)}행`);
}

if (require.main === module) main();
module.exports = { buildBlock, START, END };
