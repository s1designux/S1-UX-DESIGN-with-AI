/**
 * read-zip-entry.js — zip 안의 파일 1개를 순수 Node 로 읽는다.
 *
 * 왜 필요한가 (2026-08-03):
 *   Gate 6b·6c 가 설치기 zip 을 `unzip -p` 로 열었는데, `unzip` 은 macOS/Linux 기본 명령이고
 *   Windows 에는 없다(Git Bash 안에만 있고 Node 의 execSync 는 cmd 를 쓴다). 그래서 저장소를
 *   Windows 로 옮기자 두 게이트가 "zip 추출 실패"로 죽어 커밋이 막혔다.
 *   게이트 판정이 OS 설치 상태에 좌우되지 않도록 외부 명령 의존을 없앤다.
 *
 * 지원: store(0) · deflate(8). zip64 미지원(설치기 zip 은 수백 KB 규모).
 */
const fs = require('fs');
const zlib = require('zlib');

const SIG_EOCD = 0x06054b50;
const SIG_CENTRAL = 0x02014b50;

/**
 * @param {string} zipPath  zip 파일 경로
 * @param {string} entryName  zip 내부 경로(예: "s1-ux-design-guide-installer/code.js")
 * @returns {string} 엔트리 내용(utf-8)
 */
function readZipEntry(zipPath, entryName) {
  const buf = fs.readFileSync(zipPath);

  // End of Central Directory 를 뒤에서 찾는다(주석 최대 64KB 고려).
  let eocd = -1;
  const floor = Math.max(0, buf.length - 66000);
  for (let i = buf.length - 22; i >= floor; i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error(`zip 구조 손상 — EOCD 없음: ${zipPath}`);

  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const names = [];

  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(off) !== SIG_CENTRAL) {
      throw new Error(`zip 중앙 디렉터리 손상(엔트리 ${n}): ${zipPath}`);
    }
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + nameLen);
    names.push(name);

    if (name === entryName) {
      const lNameLen = buf.readUInt16LE(localOff + 26);
      const lExtraLen = buf.readUInt16LE(localOff + 28);
      const start = localOff + 30 + lNameLen + lExtraLen;
      const raw = buf.subarray(start, start + compSize);
      if (method === 0) return raw.toString('utf8');
      if (method === 8) return zlib.inflateRawSync(raw).toString('utf8');
      throw new Error(`지원하지 않는 압축 방식(${method}): ${entryName}`);
    }
    off += 46 + nameLen + extraLen + commentLen;
  }

  throw new Error(`zip 안에 엔트리가 없음: ${entryName}\n  (실제 목록: ${names.slice(0, 10).join(', ')})`);
}

module.exports = { readZipEntry };
