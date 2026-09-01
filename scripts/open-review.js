#!/usr/bin/env node
/**
 * npm run review
 * 검수 화면(pages/ui-review.html)을 로컬 서버(http)로 띄우고 브라우저로 연다.
 *
 * 이 화면은 실제 배포본(ui-library/dist/s1-ui.js)을 <script type="module"> 로 불러오는데,
 * 파일을 더블클릭해서 여는 file:// 에서는 브라우저가 상대 경로 모듈 import 를 막아
 * 스크립트가 아예 실행되지 않는다(= 컴포넌트가 하나도 안 그려진다).
 * 그래서 반드시 http 로 열어야 한다.
 *
 * 포트는 .claude/launch.json 과 같은 4173 을 쓰고, 이미 떠 있으면 그 서버를 그대로 재사용한다.
 */
const http = require('http');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const PORT = 4173;
const ROOT = path.resolve(__dirname, '..');
const PAGE = '/pages/ui-review.html';
const URL = `http://localhost:${PORT}${PAGE}`;

function ping() {
  return new Promise((resolve) => {
    const req = http.request(
      { host: '127.0.0.1', port: PORT, path: '/', method: 'HEAD', timeout: 700 },
      (res) => { res.resume(); resolve(true); }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start'
      : 'xdg-open';
  const res = spawnSync(cmd, [url], { stdio: 'ignore', shell: process.platform === 'win32' });
  return res.status === 0;
}

(async () => {
  let alive = await ping();

  if (alive) {
    console.log(`[review] 포트 ${PORT} 서버가 이미 떠 있어 그대로 사용합니다.`);
  } else {
    console.log(`[review] 로컬 서버를 켭니다 — python3 -m http.server ${PORT} --bind 127.0.0.1`);
    const child = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
      cwd: ROOT,
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    for (let i = 0; i < 40 && !alive; i += 1) {
      await sleep(250);
      alive = await ping();
    }
    if (!alive) {
      console.error(`[review] 서버가 뜨지 않았습니다. 직접 실행해 보세요: python3 -m http.server ${PORT} --bind 127.0.0.1`);
      process.exit(1);
    }
    console.log(`[review] 서버 준비 완료 (백그라운드에서 계속 돕니다).`);
  }

  console.log(`[review] 검수 화면: ${URL}`);
  if (!openBrowser(URL)) {
    console.log('[review] 브라우저를 자동으로 열지 못했습니다. 위 주소를 복사해 붙여 넣어 주세요.');
  }
})();
