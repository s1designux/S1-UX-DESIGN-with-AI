/**
 * swift-spec-dump.js — 생성된 Swift 스타일 표를 "실제로 컴파일해서" 값으로 꺼내 온다.
 * ─────────────────────────────────────────────────────────────────────────
 * 왜 필요한가: S1*Spec.swift 는 추출 표를 글자로 굳힌 것이다. 굳히는 과정(색 이름 → 팔레트 → 정수,
 * 숫자 표기, 0 생략, 필드 순서)이 틀리면 표는 맞아도 Swift 값이 틀린다. 글자를 정규식으로 다시 읽으면
 * 읽는 쪽 실수가 섞이므로, 같은 소스를 macOS 용으로 컴파일해 S1Box 값을 JSON 으로 찍어 비교한다.
 *
 * 사용: const { dumpSwiftSpecs, compareDump } = require('./lib/swift-spec-dump.js');
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SWIFT_DIR = path.join(ROOT, 'ui-library/dist/platform/swift');
const SDK = '/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk';

const pascal = (id) => id.split(/[-_ ]/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join('');
const camelId = (id) => id.split('-').map((piece, index) => (index === 0 ? piece : piece[0].toUpperCase() + piece.slice(1))).join('');

function sdkPath() {
  const found = spawnSync('xcrun', ['--sdk', 'macosx', '--show-sdk-path'], { encoding: 'utf8' });
  if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
  return fs.existsSync(SDK) ? SDK : null;
}

function swiftSources() {
  return fs.readdirSync(SWIFT_DIR).filter((name) => /^S1.*\.swift$/.test(name)).map((name) => path.join(SWIFT_DIR, name));
}

const DUMP_HEAD = `import Foundation
import CoreGraphics

func color(_ value: S1Color?) -> Any { guard let value else { return NSNull() }; return [Int(value.light), Int(value.dark)] }
func number(_ value: CGFloat?) -> Any { guard let value else { return NSNull() }; return Double(value) }
func dump(_ box: S1Box) -> [String: Any] {
    var out: [String: Any] = [:]
    out["background"] = color(box.background)
    out["backgroundInherit"] = box.backgroundInherit
    out["foreground"] = color(box.foreground)
    out["foregroundInherit"] = box.foregroundInherit
    out["borderColor"] = color(box.borderColor)
    out["borderWidth"] = number(box.borderWidth)
    out["radius"] = number(box.radius)
    out["height"] = number(box.height)
    out["minHeight"] = number(box.minHeight)
    out["width"] = number(box.width)
    out["minWidth"] = number(box.minWidth)
    out["paddingStart"] = number(box.paddingStart)
    out["paddingEnd"] = number(box.paddingEnd)
    out["paddingTop"] = number(box.paddingTop)
    out["paddingBottom"] = number(box.paddingBottom)
    out["gap"] = number(box.gap)
    out["marginStart"] = number(box.marginStart)
    out["marginTop"] = number(box.marginTop)
    out["fontSize"] = number(box.fontSize)
    out["fontWeight"] = box.fontWeight.map { $0 as Any } ?? NSNull()
    out["letterSpacing"] = number(box.letterSpacing)
    out["lineHeight"] = number(box.lineHeight)
    out["opacity"] = number(box.opacity)
    out["rotation"] = number(box.rotation)
    out["icon"] = box.icon.map { $0 as Any } ?? NSNull()
    out["underline"] = box.underline
    out["left"] = number(box.left)
    out["right"] = number(box.right)
    out["top"] = number(box.top)
    out["marginEnd"] = number(box.marginEnd)
    out["marginBottom"] = number(box.marginBottom)
    out["maxWidth"] = number(box.maxWidth)
    out["maxHeight"] = number(box.maxHeight)
    out["maxHeightVh"] = number(box.maxHeightVh)
    out["radiusTopStart"] = number(box.radiusTopStart)
    out["radiusTopEnd"] = number(box.radiusTopEnd)
    out["scaleX"] = number(box.scaleX)
    out["flexBasis"] = number(box.flexBasis)
    out["spaceBetween"] = box.spaceBetween
    out["durationMs"] = box.durationMs.map { $0 as Any } ?? NSNull()
    out["gradient"] = box.gradient.map { stops in stops.map { ["offset": Double($0.offset), "color": color($0.color), "alpha": Double($0.alpha)] as [String: Any] } as Any } ?? NSNull()
    out["shadow"] = box.shadow.map { layers in layers.map { ["x": Double($0.x), "y": Double($0.y), "blur": Double($0.blur), "spread": Double($0.spread), "color": Int($0.color)] as [String: Any] } as Any } ?? NSNull()
    return out
}
func table(_ value: [String: [String: S1Box]]) -> [String: Any] {
    var out: [String: Any] = [:]
    for (key, row) in value { out[key] = row.mapValues { dump($0) } }
    return out
}
`;

/** specs: extractSpec 결과 배열 — 어떤 표가 있는지(주 표·보조 표)만 쓴다. 값은 쓰지 않는다. */
function dumpMain(specs) {
  const lines = [DUMP_HEAD, 'var result: [String: Any] = [:]'];
  for (const spec of specs) {
    const name = `S1${pascal(spec.id)}Spec`;
    const extras = Object.keys(spec.extras ?? {}).map((extraId) => `"${extraId}": table(${name}.${camelId(extraId)}Boxes)`).join(', ');
    lines.push(`result["${spec.id}"] = ["main": table(${name}.boxes), "extras": [${extras || ':'}] as [String: Any]] as [String: Any]`);
  }
  lines.push('let data = try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])');
  lines.push('FileHandle.standardOutput.write(data)');
  return lines.join('\n') + '\n';
}

/** 컴파일해서 돌리고 JSON 을 돌려준다. 실행 불가(swiftc 없음)면 null. */
function dumpSwiftSpecs(specs) {
  const sdk = sdkPath();
  if (!sdk) return { skipped: 'macOS SDK 없음' };
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 's1-swift-dump-'));
  try {
    const main = path.join(work, 'main.swift');
    fs.writeFileSync(main, dumpMain(specs));
    const binary = path.join(work, 'dump');
    const build = spawnSync('swiftc', ['-Onone', '-sdk', sdk, '-target', 'arm64-apple-macos13.0', ...swiftSources(), main, '-o', binary], { encoding: 'utf8' });
    if (build.status !== 0) return { error: `컴파일 실패\n${(build.stderr || build.stdout).split('\n').slice(0, 20).join('\n')}` };
    const run = spawnSync(binary, [], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 120000 });
    if (run.status !== 0) return { error: `실행 실패\n${run.stderr}` };
    return { data: JSON.parse(run.stdout) };
  } finally {
    try { fs.rmSync(work, { recursive: true, force: true }); } catch (_) {}
  }
}

const ZERO_DEFAULT = new Set(['borderWidth', 'radius', 'gap', 'marginStart', 'marginTop', 'marginEnd', 'marginBottom', 'letterSpacing', 'paddingStart', 'paddingEnd', 'paddingTop', 'paddingBottom']);
const NUMBER_FIELDS = ['borderWidth', 'radius', 'height', 'minHeight', 'width', 'minWidth', 'paddingStart', 'paddingEnd', 'paddingTop', 'paddingBottom', 'gap', 'marginStart', 'marginTop', 'fontSize', 'letterSpacing', 'lineHeight', 'opacity', 'rotation', 'left', 'right', 'top', 'marginEnd', 'marginBottom', 'maxWidth', 'maxHeight', 'maxHeightVh', 'radiusTopStart', 'radiusTopEnd', 'scaleX', 'flexBasis'];

/**
 * 기대 표(extractSpec) ↔ Swift 가 찍은 값 비교.
 *   colorOf(token) → [라이트, 다크] 정수. 색은 토큰 값에서 직접 만든다(팔레트 파일을 믿지 않는다).
 * 반환: { checked, failures[] }
 */
function compareDump(specs, dump, colorOf) {
  const failures = [];
  let checked = 0;
  const fail = (where, message) => failures.push(`${where}: ${message}`);
  const sameNumber = (a, b) => Math.abs(a - b) < 1e-9;

  const compareBox = (where, expected, actual) => {
    const colorField = (field, value) => {
      checked += 1;
      const want = value && !value.inherit ? colorOf(value.token) : null;
      const got = actual[field];
      if (want === null ? got !== null : (got === null || got[0] !== want[0] || got[1] !== want[1])) fail(where, `${field} 표 ${JSON.stringify(want)} ≠ Swift ${JSON.stringify(got)}`);
    };
    colorField('background', expected.background);
    colorField('foreground', expected.foreground);
    colorField('borderColor', expected.borderColor);
    checked += 2;
    if (actual.backgroundInherit !== Boolean(expected.background && expected.background.inherit)) fail(where, 'backgroundInherit 다름');
    if (actual.foregroundInherit !== Boolean(expected.foreground && expected.foreground.inherit)) fail(where, 'foregroundInherit 다름');
    for (const field of NUMBER_FIELDS) {
      checked += 1;
      const raw = expected[field];
      const want = raw === undefined || raw === null ? (ZERO_DEFAULT.has(field) ? 0 : null) : raw;
      const got = actual[field];
      if (want === null ? got !== null : (got === null || !sameNumber(got, want))) fail(where, `${field} 표 ${want} ≠ Swift ${got}`);
    }
    checked += 5;
    if ((actual.fontWeight ?? null) !== (expected.fontWeight || null)) fail(where, `fontWeight 표 ${expected.fontWeight} ≠ Swift ${actual.fontWeight}`);
    if ((actual.icon ?? null) !== (expected.icon || null)) fail(where, `icon 표 ${expected.icon} ≠ Swift ${actual.icon}`);
    if (actual.underline !== Boolean(expected.underline)) fail(where, 'underline 다름');
    if (actual.spaceBetween !== Boolean(expected.spaceBetween)) fail(where, 'spaceBetween 다름');
    if ((actual.durationMs ?? null) !== (expected.durationMs || null)) fail(where, `durationMs 표 ${expected.durationMs} ≠ Swift ${actual.durationMs}`);
    checked += 2;
    const wantGradient = expected.gradient ?? null;
    if ((wantGradient === null) !== (actual.gradient === null)) fail(where, 'gradient 있음/없음 다름');
    else if (wantGradient) {
      if (wantGradient.length !== actual.gradient.length) fail(where, 'gradient 정거장 수 다름');
      else wantGradient.forEach((stop, index) => {
        const got = actual.gradient[index];
        const wantColor = stop.token ? colorOf(stop.token) : null;
        if (!sameNumber(got.offset, stop.offset) || !sameNumber(got.alpha, stop.alpha) || (wantColor === null ? got.color !== null : (got.color === null || got.color[0] !== wantColor[0] || got.color[1] !== wantColor[1]))) fail(where, `gradient[${index}] 다름`);
      });
    }
    const wantShadow = expected.shadow ?? null;
    if ((wantShadow === null) !== (actual.shadow === null)) fail(where, 'shadow 있음/없음 다름');
    else if (wantShadow) {
      if (wantShadow.length !== actual.shadow.length) fail(where, 'shadow 층 수 다름');
      else wantShadow.forEach((layer, index) => {
        const got = actual.shadow[index];
        const argb = Number(layer.color);
        if (![['x', 'x'], ['y', 'y'], ['blur', 'blur'], ['spread', 'spread']].every(([a, b]) => sameNumber(got[a], layer[b])) || got.color !== argb) fail(where, `shadow[${index}] 다름`);
      });
    }
  };

  const compareTable = (where, expectedTable, actualTable) => {
    if (!actualTable) { fail(where, 'Swift 에 표가 없음'); return; }
    for (const [key, row] of Object.entries(expectedTable)) {
      const actualRow = actualTable[key];
      if (!actualRow) { fail(`${where}/${key}`, 'Swift 에 조합이 없음'); continue; }
      for (const [part, box] of Object.entries(row.parts)) {
        if (!actualRow[part]) { fail(`${where}/${key}/${part}`, 'Swift 에 부품 칸이 없음'); continue; }
        compareBox(`${where}/${key}/${part}`, box, actualRow[part]);
      }
      for (const part of Object.keys(actualRow)) if (!row.parts[part]) fail(`${where}/${key}/${part}`, 'Swift 에만 있는 부품 칸');
    }
    for (const key of Object.keys(actualTable)) if (!expectedTable[key]) fail(`${where}/${key}`, 'Swift 에만 있는 조합');
  };

  for (const spec of specs) {
    const entry = dump[spec.id];
    if (!entry) { fail(spec.id, 'Swift 표 없음'); continue; }
    compareTable(spec.id, spec.table, entry.main);
    for (const [extraId, extra] of Object.entries(spec.extras ?? {})) compareTable(`${spec.id}/${extraId}`, extra.table, entry.extras[extraId]);
  }
  return { checked, failures };
}

module.exports = { dumpSwiftSpecs, compareDump };
