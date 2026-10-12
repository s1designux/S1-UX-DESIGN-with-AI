#!/usr/bin/env node
/**
 * swift-gallery-render.js — SwiftUI 갤러리를 PNG 로 뜬다.
 * ─────────────────────────────────────────────────────────────────────────
 * dist/platform/swift 의 소스(S1*.swift · preview/S1Gallery.swift)를 **그대로** scripts/swift-render/main.swift 와
 * 함께 macOS 용 실행 파일로 컴파일하고, 돌려서 구역(부품)마다 라이트·다크 PNG 를 저장한다.
 * 같은 소스를 쓰므로 여기서 보이는 것이 곧 배포본이 그리는 것이다(iOS 시뮬레이터 대신 macOS 렌더러).
 *
 * 서체: Pretendard 가 이 맥에 설치돼 있으면 그 서체로 그린다(없으면 기기 기본 서체 — 보고에 드러난다).
 *
 * 사용: node scripts/swift-gallery-render.js [--out <폴더>] [--family <서체|->] [--width <pt>]
 * 출력: reports/ui-library/swift-swiftui/shots/<구역>-<light|dark>.png
 * 종료코드: 0 성공 · 1 컴파일·렌더 실패 · 2 실행 불가(swiftc 없음)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SWIFT_DIR = path.join(ROOT, 'ui-library/dist/platform/swift');
const MAIN = path.join(__dirname, 'swift-render/main.swift');
const SDK = '/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk';

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};
const OUT = path.resolve(ROOT, arg('--out', 'reports/ui-library/swift-swiftui/shots'));
const FAMILY = arg('--family', 'Pretendard');
const WIDTH = arg('--width', '390');

function sdkPath() {
  const found = spawnSync('xcrun', ['--sdk', 'macosx', '--show-sdk-path'], { encoding: 'utf8' });
  if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
  return fs.existsSync(SDK) ? SDK : null;
}

/** Pretendard 가 설치돼 있는지 — 렌더가 어느 서체로 그려졌는지 정직하게 알리려고 확인한다. */
function pretendardInstalled() {
  const dirs = [path.join(os.homedir(), 'Library/Fonts'), '/Library/Fonts', '/System/Library/Fonts'];
  return dirs.some((dir) => fs.existsSync(dir) && fs.readdirSync(dir).some((file) => /^Pretendard/i.test(file)));
}

function swiftSources() {
  const files = fs.readdirSync(SWIFT_DIR).filter((name) => /^S1.*\.swift$/.test(name)).map((name) => path.join(SWIFT_DIR, name));
  const preview = path.join(SWIFT_DIR, 'preview');
  if (fs.existsSync(preview)) for (const name of fs.readdirSync(preview)) if (name.endsWith('.swift')) files.push(path.join(preview, name));
  return files;
}

function main() {
  if (!fs.existsSync(SWIFT_DIR)) { console.error('❌ platform/swift 가 없습니다. `npm run ui:build` 를 먼저 실행하세요.'); return 1; }
  const sdk = sdkPath();
  if (!sdk) { console.error('❌ macOS SDK 를 찾지 못했습니다(swiftc 필요).'); return 2; }
  fs.mkdirSync(OUT, { recursive: true });
  for (const name of fs.readdirSync(OUT)) if (name.endsWith('.png')) fs.unlinkSync(path.join(OUT, name));

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 's1-swift-render-'));
  const binary = path.join(work, 'swift-render');
  console.log('🔨 SwiftUI 소스를 macOS 실행 파일로 컴파일합니다(같은 소스 그대로)…');
  const build = spawnSync('swiftc', ['-Onone', '-sdk', sdk, '-target', 'arm64-apple-macos13.0', ...swiftSources(), MAIN, '-o', binary], { encoding: 'utf8' });
  if (build.status !== 0) {
    console.error(`❌ 컴파일 실패\n${(build.stderr || build.stdout).split('\n').slice(0, 30).join('\n')}`);
    return build.error && build.error.code === 'ENOENT' ? 2 : 1;
  }

  const hasFont = pretendardInstalled();
  const family = FAMILY === 'Pretendard' && !hasFont ? '-' : FAMILY;
  console.log(`🖼  렌더합니다 — 서체 ${family === '-' ? '기기 기본(Pretendard 미설치)' : family} · 가로 ${WIDTH}pt`);
  const run = spawnSync(binary, [OUT, family, WIDTH], { encoding: 'utf8', timeout: 180000 });
  try { fs.rmSync(work, { recursive: true, force: true }); } catch (_) {}
  if (run.status !== 0) {
    console.error(`❌ 렌더 실패\n${run.stdout}${run.stderr}`);
    return 1;
  }
  const shots = fs.readdirSync(OUT).filter((name) => name.endsWith('.png'));
  fs.writeFileSync(path.join(OUT, '.render.json'), `${JSON.stringify({ family, fontInstalled: hasFont, width: Number(WIDTH), scale: 2, shots: shots.length }, null, 2)}\n`);
  console.log(`✅ PNG ${shots.length}장 → ${path.relative(ROOT, OUT)}`);
  return 0;
}

process.exit(main());
