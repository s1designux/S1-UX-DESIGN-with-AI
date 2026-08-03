'use strict';
/**
 * extract-tar.js — tar 아카이브(Buffer)를 순수 Node 로 디스크에 푼다.
 *
 * 왜 외부 tar 를 안 쓰나 (2026-08-03 실측):
 *   `git archive | tar -x` 는 파이프 때문에 셸이 필요해 Windows(/bin/sh 없음)에서 죽었고,
 *   파이프를 없애고 `tar -xf <파일>` 로 바꾸자 이번엔 **어느 tar 가 잡히느냐**에 따라 갈렸다 —
 *   PowerShell 에서는 Windows 기본 bsdtar 가 성공했지만, 커밋 훅이 도는 Git Bash 에서는
 *   MSYS tar 가 `C:\...` 경로를 원격 호스트로 오해해 "Cannot connect to C:" 로 실패했다.
 *   게이트 판정이 셸·PATH 에 좌우되면 안 되므로 외부 명령 의존을 완전히 없앤다.
 *   (같은 이유로 zip 은 read-zip-entry.js 가 담당한다.)
 *
 * 지원: ustar/GNU 일반 파일·디렉터리 + pax 확장 헤더의 path override.
 *   git archive 산출물이 쓰는 범위. 심볼릭 링크·하드링크는 건너뛴다(설치기 소스에 없음).
 */
const fs = require('fs');
const path = require('path');

const BLOCK = 512;

function octal(buf) {
  const s = buf.toString('ascii').replace(/\0.*$/, '').trim();
  return s ? parseInt(s, 8) : 0;
}

/**
 * @param {Buffer} buf  tar 아카이브 전체
 * @param {string} destDir  풀어낼 디렉터리(존재해야 함)
 * @returns {string[]} 생성한 파일의 아카이브 내부 경로 목록
 */
function extractTar(buf, destDir) {
  const written = [];
  let off = 0;
  let pendingPath = null;   // pax/GNU longname 이 지정한 다음 엔트리 이름

  while (off + BLOCK <= buf.length) {
    const header = buf.subarray(off, off + BLOCK);
    // 빈 블록 = 아카이브 끝
    if (header.every((b) => b === 0)) break;

    const rawName = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const size = octal(header.subarray(124, 136));
    const type = String.fromCharCode(header[156] || 0x30);
    const prefix = header.subarray(345, 500).toString('utf8').replace(/\0.*$/, '');

    const dataStart = off + BLOCK;
    const dataEnd = dataStart + size;
    const next = dataStart + Math.ceil(size / BLOCK) * BLOCK;

    if (type === 'x' || type === 'X' || type === 'L') {
      // pax 확장 헤더(x/X) 또는 GNU longname(L) — 다음 엔트리의 실제 경로를 담는다.
      const meta = buf.subarray(dataStart, dataEnd).toString('utf8');
      if (type === 'L') {
        pendingPath = meta.replace(/\0.*$/, '');
      } else {
        const m = meta.match(/\d+ path=([^\n]+)\n/);
        if (m) pendingPath = m[1];
      }
      off = next;
      continue;
    }

    const name = pendingPath || (prefix ? `${prefix}/${rawName}` : rawName);
    pendingPath = null;

    if (name && (type === '0' || type === '\0' || header[156] === 0)) {
      const dest = path.join(destDir, name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf.subarray(dataStart, dataEnd));
      written.push(name);
    } else if (name && type === '5') {
      fs.mkdirSync(path.join(destDir, name), { recursive: true });
    }
    // 그 밖의 타입(링크 등)은 건너뛴다.

    off = next;
  }

  return written;
}

module.exports = { extractTar };
