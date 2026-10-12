#!/usr/bin/env node
/**
 * swift-typecheck.js — 생성된 Swift 소스를 컴파일러로 형 검사한다.
 * ─────────────────────────────────────────────────────────────────────────
 * 이 맥에는 iOS SDK(Xcode)가 없고 Command Line Tools 의 macOS SDK 만 있다. 그래서 두 번 본다:
 *   ① macOS 13   — SwiftUI 가 같은 API 로 있는 곳. 렌더 스크립트가 쓰는 대상이기도 하다.
 *   ② Mac Catalyst(iOS 16 API 면) — macOS SDK 안의 iOSSupport 로 UIKit 기반 SwiftUI 를 검사한다.
 *      iOS 전용 API(UIKit·textInputAutocapitalization 등)를 잘못 쓰면 ①은 통과하고 ②에서 걸린다.
 *   (--build 를 주면 ③ 패키지 전체를 swift build 로도 만든다 — 임시 폴더에서, 약 1분)
 * **iOS 시뮬레이터·실기기에서 돌려 본 것은 아니다.** 그 확인은 Xcode 에서 별도.
 *
 * 사용: node scripts/swift-typecheck.js [--build]
 * 종료코드: 0 통과 · 1 형 오류 · 2 실행 불가(swiftc 없음)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'ui-library/dist/platform/swift');
const SDK_FALLBACK = '/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk';

function sdkPath() {
  const found = spawnSync('xcrun', ['--sdk', 'macosx', '--show-sdk-path'], { encoding: 'utf8' });
  if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
  return fs.existsSync(SDK_FALLBACK) ? SDK_FALLBACK : null;
}

function sources() {
  const files = fs.readdirSync(DIR).filter((name) => /^S1.*\.swift$/.test(name)).map((name) => path.join(DIR, name));
  const preview = path.join(DIR, 'preview');
  if (fs.existsSync(preview)) for (const name of fs.readdirSync(preview)) if (name.endsWith('.swift')) files.push(path.join(preview, name));
  return files;
}

function run(label, sdk, args) {
  const result = spawnSync('swiftc', ['-typecheck', '-sdk', sdk, ...args, ...sources()], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error && result.error.code === 'ENOENT') return { code: 2, label, lines: ['swiftc 를 찾지 못했습니다.'] };
  const text = `${result.stdout}\n${result.stderr}`;
  const errors = text.split('\n').filter((line) => /: error:/.test(line));
  const warnings = text.split('\n').filter((line) => /: warning:/.test(line));
  return { code: result.status === 0 ? 0 : 1, label, errors, warnings, lines: errors.length ? errors : (result.status === 0 ? [] : text.split('\n').slice(0, 20)) };
}

function main() {
  if (!fs.existsSync(DIR)) { console.error('❌ platform/swift 가 없습니다. `npm run ui:build` 를 먼저 실행하세요.'); return 1; }
  const sdk = sdkPath();
  if (!sdk) { console.error('❌ macOS SDK 를 찾지 못했습니다(Command Line Tools 필요).'); return 2; }
  const files = sources().length;
  console.log(`🔎 Swift 형 검사 — 파일 ${files}개 (SDK ${path.basename(sdk)})`);

  const passes = [
    run('macOS 13', sdk, ['-target', 'arm64-apple-macos13.0']),
    run('iOS 16 면(Mac Catalyst)', sdk, ['-target', 'arm64-apple-ios16.0-macabi', '-Fsystem', path.join(sdk, 'System/iOSSupport/System/Library/Frameworks')])
  ];
  let code = 0;
  for (const pass of passes) {
    if (pass.code === 0) console.log(`   ✅ ${pass.label} — 오류 0 · 경고 ${pass.warnings.length}`);
    else { console.log(`   ❌ ${pass.label} — 오류 ${pass.errors ? pass.errors.length : '?'}건`); for (const line of pass.lines.slice(0, 30)) console.log(`      ${line}`); }
    code = Math.max(code, pass.code);
  }

  if (code === 0 && process.argv.includes('--build')) {
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 's1-swift-pkg-'));
    try {
      fs.cpSync(DIR, path.join(work, 'pkg'), { recursive: true });
      console.log('🔨 swift build (패키지 전체, 임시 폴더)…');
      const build = spawnSync('swift', ['build', '--package-path', path.join(work, 'pkg')], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const text = `${build.stdout}\n${build.stderr}`;
      const warnings = text.split('\n').filter((line) => /: warning:/.test(line)).length;
      if (build.status === 0) console.log(`   ✅ swift build — 완료 · 경고 ${warnings}`);
      else { console.log('   ❌ swift build 실패'); console.log(text.split('\n').filter((l) => /error/.test(l)).slice(0, 20).join('\n')); code = 1; }
    } finally {
      try { fs.rmSync(work, { recursive: true, force: true }); } catch (_) {}
    }
  }

  if (code === 0) console.log('✅ PASS — 형 오류가 없습니다. (iOS 시뮬레이터·실기기 실행은 Xcode 에서 별도)');
  else if (code === 1) console.log('❌ FAIL');
  return code;
}

process.exit(main());
