#!/usr/bin/env node
/**
 * render-shot.js — 헤드리스 크롬 스크린샷 (대기 없이)
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜 이 스크립트가 필요한가(2026-08-24 실측):
 *   `chrome --headless=new --screenshot=out.png <url>` 은 PNG 를 다 쓰고 나서도
 *   **프로세스가 스스로 종료하지 않는다.** 호출자가 타임아웃으로 죽일 때까지 매달린다
 *   (실측: 파일 102KB 완성 후 90초 넘게 미종료). `--dump-dom` 도 같은 증상이었고,
 *   Gate 23 이 이 때문에 60.2초를 죽은 대기로 쓰고 있었다 → 2.3초로 교정.
 *
 *   CLAUDE.md §⚖️ 는 "UI/HTML/CSS 를 건드렸으면 크기 불문 렌더 1회 확인"을 의무로 둔다.
 *   그 확인을 raw chrome 명령으로 하면 매번 같은 대기를 문다. 이 스크립트를 쓰면
 *   **결과 파일이 완성되는 즉시 종료**한다.
 *
 * 사용:
 *   node scripts/render-shot.js <파일경로|URL> <출력.png> [옵션]
 *     --window-size=1280,900   뷰포트 (기본 1280,900)
 *     --wait-ms=1200           페이지 JS 재배치 대기 (기본 1200)
 *     --full-page              전체 높이 캡처
 *     --quiet                  경로만 출력
 *
 *   예) node scripts/render-shot.js "pages/components.html#input" /tmp/input.png
 *
 * 종료코드: 0 성공 · 1 실패(파일 미생성) · 2 크롬 못 찾음
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HARD_TIMEOUT_MS = 60000;   // 안전망 — 파일이 끝내 안 생기는 경우
const STABLE_POLLS = 2;          // 크기가 이만큼 연속 동일하면 완성으로 본다
const POLL_MS = 100;

function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium',
  ].filter(Boolean);
  for (const c of cands) { try { if (fs.existsSync(c)) return c; } catch (_) {} }
  return null;
}

// 파일 경로를 file:// URL 로. '#앵커' 는 보존한다(섹션 지정 캡처에 쓰임).
function toUrl(target) {
  if (/^[a-z]+:\/\//i.test(target)) return target;
  const hash = target.includes('#') ? target.slice(target.indexOf('#')) : '';
  const filePart = hash ? target.slice(0, target.indexOf('#')) : target;
  const abs = path.isAbsolute(filePart) ? filePart : path.join(ROOT, filePart);
  if (!fs.existsSync(abs)) { console.error(`❌ 파일 없음: ${abs}`); process.exit(1); }
  return 'file:///' + abs.replace(/\\/g, '/').replace(/^\//, '') + hash;
}

function shoot(chrome, url, out, opts) {
  return new Promise((resolve) => {
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'render-shot-'));
    try { fs.rmSync(out, { force: true }); } catch (_) {}

    const args = ['--headless=new', `--screenshot=${out}`,
      `--window-size=${opts.windowSize}`, `--virtual-time-budget=${opts.waitMs}`,
      '--hide-scrollbars', '--force-device-scale-factor=2',
      '--no-sandbox', '--disable-gpu', `--user-data-dir=${profileDir}`];
    if (opts.fullPage) args.push('--screenshot-full-page');
    args.push(url);

    const child = spawn(chrome, args, { stdio: ['ignore', 'ignore', 'ignore'] });

    let settled = false; let lastSize = -1; let stable = 0;
    const settle = (ok) => {
      if (settled) return; settled = true;
      clearInterval(poll); clearTimeout(timer);
      try { child.kill(); } catch (_) {}
      try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
      resolve(ok);
    };

    // 결과 파일 크기가 안정되면 = 다 썼다 → 즉시 종료
    const poll = setInterval(() => {
      let sz = -1;
      try { sz = fs.statSync(out).size; } catch (_) { return; }
      if (sz > 0 && sz === lastSize) { if (++stable >= STABLE_POLLS) settle(true); }
      else { stable = 0; lastSize = sz; }
    }, POLL_MS);

    const timer = setTimeout(() => settle(false), HARD_TIMEOUT_MS);
    child.on('error', () => settle(false));
    child.on('close', () => {
      // 크롬이 스스로 끝난 경우(구버전 등) — 파일이 있으면 성공
      try { settle(fs.statSync(out).size > 0); } catch (_) { settle(false); }
    });
  });
}

async function main() {
  const argv = process.argv.slice(2);
  const flags = argv.filter((a) => a.startsWith('--'));
  const pos = argv.filter((a) => !a.startsWith('--'));
  if (pos.length < 2) {
    console.error('사용: node scripts/render-shot.js <파일경로|URL> <출력.png> [--window-size=W,H] [--wait-ms=N] [--full-page] [--quiet]');
    process.exit(1);
  }
  const get = (name, dflt) => {
    const f = flags.find((x) => x.startsWith(`--${name}=`));
    return f ? f.slice(name.length + 3) : dflt;
  };
  const opts = {
    windowSize: get('window-size', '1280,900'),
    waitMs: get('wait-ms', '1200'),
    fullPage: flags.includes('--full-page'),
  };
  const quiet = flags.includes('--quiet');

  const chrome = findChrome();
  if (!chrome) { console.error('❌ 크롬/엣지 실행파일을 못 찾음 (CHROME_PATH 로 지정 가능)'); process.exit(2); }

  const url = toUrl(pos[0]);
  const out = path.isAbsolute(pos[1]) ? pos[1] : path.join(process.cwd(), pos[1]);
  fs.mkdirSync(path.dirname(out), { recursive: true });

  const t0 = Date.now();
  const ok = await shoot(chrome, url, out, opts);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  if (!ok) { console.error(`❌ 렌더 실패 (${secs}초) — ${url}`); process.exit(1); }
  if (quiet) console.log(out);
  else console.log(`✅ ${out} · ${(fs.statSync(out).size / 1024).toFixed(0)}KB · ${secs}초`);
}

main();
