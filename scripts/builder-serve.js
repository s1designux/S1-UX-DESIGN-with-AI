#!/usr/bin/env node
/**
 * builder-serve.js — 빌더를 띄운다. 「Figma 화면 가져오기」 버튼이 여기로 말을 건다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜 서버가 필요한가:
 *   ① 빌더는 배포본·registry 를 파일로 읽어서 file:// 로는 안 열린다(원래부터).
 *   ② Figma 읽기 열쇠를 **브라우저에 두지 않기 위해서**다. 링크만 받아서 여기(이 맥 안)에서 읽고,
 *      결과 파일만 돌려준다. 열쇠는 .env 밖으로 나가지 않는다.
 *
 * 사용:  npm run builder            →  http://localhost:8787/builder/
 *        npm run builder -- 9000    →  포트 바꾸기
 *
 * 바깥으로 열지 않는다 — 127.0.0.1 에만 매인다.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { importScreen } = require('./lib/screen-import');

const PORT = Number(process.argv[2]) || 8787;
const ROOT = process.cwd();

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.map': 'application/json',
};

const send = (res, code, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
};

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);

  // ── 여기가 "가져오기를 할 수 있는 주소"인지 알려 준다 ──────────────────
  //    GitHub Pages 같은 그냥 웹주소에는 이 서버가 없다. 빌더가 그걸 알고 버튼을 잠근다.
  if (u.pathname === '/api/ping') return send(res, 200, JSON.stringify({ ok: true, canImport: true }));

  // ── 화면 가져오기 ────────────────────────────────────────────────────────
  if (req.method === 'POST' && u.pathname === '/api/import') {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on('end', async () => {
      let body = {};
      try { body = JSON.parse(raw || '{}'); } catch { /* 빈 몸통 */ }
      try {
        const r = await importScreen({ link: body.link, profileId: body.profile });
        console.log(`  ✅ ${r.name} — 칸 ${r.rows} · 그림 ${r.images}`);
        send(res, 200, JSON.stringify({ ok: true, ...r }));
      } catch (e) {
        console.log(`  ❌ ${e.message}`);
        send(res, 200, JSON.stringify({ ok: false, code: e.code || 'error', message: e.message, profiles: e.profiles || null, fileKey: e.fileKey || null }));
      }
    });
    return;
  }

  // ── 파일 내주기 ──────────────────────────────────────────────────────────
  let rel = decodeURIComponent(u.pathname);
  if (rel === '/') rel = '/builder/index.html';
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) return send(res, 403, 'nope', 'text/plain');   // 밖으로 못 나가게
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, '없는 파일입니다', 'text/plain; charset=utf-8');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});

/* 그 자리가 이미 쓰이고 있으면(앞서 띄운 게 남아 있거나 다른 프로그램이 쓰는 중) 옆자리로 비켜 앉는다.
   "EADDRINUSE" 같은 말을 사람이 읽을 일이 없게 한다. */
server.on('listening', () => {
  const port = server.address().port;
  console.log(`\n🧩 빌더가 떴습니다 →  http://localhost:${port}/builder/\n`);
  console.log('   「가져온 화면」 탭의 「Figma 화면 가져오기」 버튼에 링크를 붙여 넣으면 바로 올라옵니다.');
  console.log('   멈추려면 Ctrl+C.\n');
});

function listen(port, tries = 0) {
  server.once('error', (e) => {
    if (e.code !== 'EADDRINUSE' || tries >= 10) {
      console.error(`\n❌ 빌더를 띄우지 못했습니다 — ${e.message}\n`);
      process.exit(1);
    }
    console.log(`   (${port} 자리는 이미 쓰는 중이라 ${port + 1} 로 옮깁니다)`);
    listen(port + 1, tries + 1);
  });
  server.listen(port, '127.0.0.1');
}
listen(PORT);
