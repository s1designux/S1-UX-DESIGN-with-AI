'use strict';

/**
 * build-components.ts를 Node에서 실행하기 위한 공용 로더.
 * 컴포넌트 facts, guide model, 브라우저 preview가 같은 번들 경로를 사용한다.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

function bundleRequire(entry, tag = 'component-builder') {
  const esbuild = require('esbuild');
  const result = esbuild.buildSync({
    entryPoints: [entry],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
  });
  const tempFile = path.join(os.tmpdir(), `${tag}-${process.pid}.cjs`);
  fs.writeFileSync(tempFile, result.outputFiles[0].text);
  try {
    delete require.cache[tempFile];
    return require(tempFile);
  } finally {
    try { fs.unlinkSync(tempFile); } catch (_) { /* noop */ }
  }
}

module.exports = { bundleRequire };
