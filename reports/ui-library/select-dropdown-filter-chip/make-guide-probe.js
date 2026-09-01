#!/usr/bin/env node
/* guide-action-probe.html 용 임시 모듈 생성기.
   assets/js/ui-library-guide.js 를 "그대로" 읽어 상대경로만 맞추고, 자동 마운트 블록만 떼어
   stateMatrix 를 export 한다. 손사본이 아니라 실행 시점 파생물이므로 검증 후 삭제한다.
   사용: node reports/ui-library/select-dropdown-filter-chip/make-guide-probe.js
        → 같은 폴더에 guide-matrix.probe.mjs 생성 (검증 끝나면 지운다)
   주의: 이 파일은 승인(approved) 게이트를 건드리지 않는다. mountGuide 를 호출하지 않을 뿐이다. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../../..');
const src = fs.readFileSync(path.join(root, 'assets/js/ui-library-guide.js'), 'utf8');
let out = src
  .replace('from "../../ui-library/dist/s1-ui.js"', 'from "../../../ui-library/dist/s1-ui.js"')
  .replace(/new URL\(`\.\.\/\.\.\//g, 'new URL(`../../../')
  .replace(/\nawait Promise\.all\(guideComponents\.map\(mountGuide\)\);[\s\S]*$/, '\n');
out += '\nexport { stateMatrix };\n';
fs.writeFileSync(path.join(__dirname, 'guide-matrix.probe.mjs'), out);
console.log('guide-matrix.probe.mjs 생성 완료');
