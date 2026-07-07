#!/usr/bin/env node
/**
 * 설치 플러그인 빌드 (Windows cmd.exe 에서도 항상 동작) — installer:build 정본.
 * ─────────────────────────────────────────────────────────────────────────
 * 기존 installer:build 는 rm -rf·mkdir -p·esbuild(CLI)·zip(CLI) 를 && 로 이어붙인 셸 스크립트였다.
 * npm 은 Windows 에서 기본 cmd.exe 로 스크립트를 실행하는데, cmd 는 이 unix 문법을 이해하지 못해
 * 중간에 조용히 끊기고(예: mkdir -p → "명령 구문이 올바르지 않습니다") dist 산출물이 stale/누락된 채
 * 남는 문제가 있었다(river 가 "플러그인이 갑자기 안 된다"고 보고한 원인).
 * 이 스크립트는 fs·esbuild JS API·순수 Node zip writer 만 사용해 셸 종류와 무관하게 동일하게 동작한다.
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { execFileSync } = require("child_process");
const esbuild = require("esbuild");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "plugins/figma-vars-installer/src");
const DIST_ROOT = path.join(ROOT, "plugins/figma-vars-installer/dist");
const PKG_NAME = "s1-ux-design-guide-installer";
// dist 아래 PKG_NAME 서브폴더를 한 겹 없애 Figma import 경로를 얕게 유지.
// (dist 자체가 결과물 폴더 = plugins/figma-vars-installer/dist/manifest.json 로 import)
// zip 은 writeZip 이 topFolderName=PKG_NAME 으로 별도 부여하므로 zip 내부 구조·freshness 검사는 불변.
const OUT_DIR = DIST_ROOT;
const ZIP_PATH = path.join(ROOT, "assets/downloads", `${PKG_NAME}.zip`);

function run() {
  console.log("[installer] audit-bindings 검사…");
  execFileSync(process.execPath, [path.join(ROOT, "scripts/audit-bindings.js")], { stdio: "inherit" });

  console.log("[installer] dist 초기화…");
  fs.rmSync(DIST_ROOT, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log("[installer] esbuild 번들…");
  esbuild.buildSync({
    entryPoints: [path.join(SRC_DIR, "code.ts")],
    bundle: true,
    outfile: path.join(OUT_DIR, "code.js"),
    target: "es2017",
    platform: "browser",
  });

  fs.copyFileSync(path.join(SRC_DIR, "manifest.json"), path.join(OUT_DIR, "manifest.json"));

  console.log("[installer] ui.html 스탬프…");
  execFileSync(process.execPath, [path.join(ROOT, "scripts/stamp-installer-ui.js"), path.join(OUT_DIR, "ui.html")], { stdio: "inherit" });

  console.log("[installer] zip 압축…");
  fs.mkdirSync(path.dirname(ZIP_PATH), { recursive: true });
  fs.rmSync(ZIP_PATH, { force: true });
  writeZip(ZIP_PATH, OUT_DIR, PKG_NAME);

  console.log(`[installer] 완료 — dist: ${path.relative(ROOT, OUT_DIR)}`);
  console.log(`[installer] 완료 — zip: ${path.relative(ROOT, ZIP_PATH)}`);
}

// ── 순수 Node ZIP writer (외부 zip CLI/npm 패키지 불필요, 셸 무관) ──────────────
let crcTable = null;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const time = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((date.getSeconds() >> 1) & 0x1f);
  const dosDate = (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0xf) << 5) | (date.getDate() & 0x1f);
  return { time, dosDate };
}

function listFilesRecursive(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full));
    else out.push(full);
  }
  return out;
}

function writeZip(zipPath, srcDir, topFolderName) {
  const files = listFilesRecursive(srcDir);
  const chunks = [];
  const centralRecords = [];
  let offset = 0;
  const { time, dosDate } = dosDateTime(new Date());

  for (const file of files) {
    const relative = path.relative(srcDir, file).split(path.sep).join("/");
    const nameBuf = Buffer.from(`${topFolderName}/${relative}`, "utf8");
    const data = fs.readFileSync(file);
    const crc = crc32(data);
    const compressed = zlib.deflateRawSync(data);
    const useCompressed = compressed.length < data.length;
    const method = useCompressed ? 8 : 0;
    const payload = useCompressed ? compressed : data;

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(payload.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra field length
    chunks.push(localHeader, nameBuf, payload);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0, 8); // flags
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(payload.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra field length
    centralHeader.writeUInt16LE(0, 32); // comment length
    centralHeader.writeUInt16LE(0, 34); // disk number start
    centralHeader.writeUInt16LE(0, 36); // internal attrs
    centralHeader.writeUInt32LE(0, 38); // external attrs
    centralHeader.writeUInt32LE(offset, 42); // local header offset
    centralRecords.push(Buffer.concat([centralHeader, nameBuf]));

    offset += localHeader.length + nameBuf.length + payload.length;
  }

  const centralDir = Buffer.concat(centralRecords);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // central dir start disk
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16); // central dir offset
  eocd.writeUInt16LE(0, 20); // comment length

  fs.writeFileSync(zipPath, Buffer.concat([...chunks, centralDir, eocd]));
}

run();
