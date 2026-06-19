#!/usr/bin/env node
/**
 * Gate 13: Installer Build Verification — 빌드자 ≠ 검증자 커밋 단계 집행
 *
 * 문제: build-components.ts(설치기 생성기 코드)의 "구조 변경"(새 buildX 함수·
 *       combineAsVariants·variant 스펙)은 곧 Figma 라이브러리 컴포넌트 빌드다.
 *       그런데 ⭐ 총괄이 혼자 만들고 혼자 검사(self-certify)해도 토큰 게이트(3·6·7·8)는
 *       전부 ✅ 라, 구조·시각 미스가 사용자에게 샜다(9줄 전부 ⭐ 표 = 증거).
 *
 * 해법: build-components.ts 의 현재 내용을 sha256 으로 묶어, 그 내용을 검증한
 *       기록(reports/installer-build/build-verification.json)이 없으면 커밋 차단.
 *       - 일치 + verifiedBy=component-verifier  → ✅ 독립 검증 완료
 *       - 일치 + verifiedBy=orchestrator(자가인증) → ✅ 통과하되 ⚠️ 가시화(구조 변경이면 안 됨)
 *       - 불일치 / 없음 → ❌ 차단: 파일이 바뀌었는데 검증 기록이 그 내용과 다름(stale) 또는 없음
 *
 *   파일이 안 바뀌면 해시가 그대로라 기록이 계속 유효 → 매 커밋 재검증 불필요(자가 치유).
 *   파일을 한 글자라도 바꾸면 해시가 달라져 기록이 stale → 재검증(또는 자가인증) 강제.
 *
 * 기록(검증 후 호출):
 *   node scripts/installer-build-verify-check.js --record \
 *     --by component-verifier --verdict pass --change structural --notes "9개 이슈 구조 대조"
 *   (순수 기계적 수정은 --by orchestrator --change mechanical — git 에 남아 가시·감사됨)
 *
 * 단독 검사:  node scripts/installer-build-verify-check.js
 * 우회(비권장): git commit --no-verify
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const REC = path.join(ROOT, 'reports/installer-build/build-verification.json');

function sourceHash() {
  if (!fs.existsSync(SRC)) return null;
  const buf = fs.readFileSync(SRC);
  return 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex');
}

function readRecord() {
  if (!fs.existsSync(REC)) return null;
  try {
    return JSON.parse(fs.readFileSync(REC, 'utf-8'));
  } catch {
    return { __invalid: true };
  }
}

/** --record 모드: 현재 build-components.ts 해시로 검증 기록을 쓴다(해시 위조 불가). */
function record(argv) {
  const arg = (name, def) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
  };
  const hash = sourceHash();
  if (!hash) {
    console.error('❌ build-components.ts 없음 — 기록 불가');
    process.exit(1);
  }
  const by = arg('by', 'orchestrator');
  const verdict = arg('verdict', 'pass');
  const change = arg('change', by === 'component-verifier' ? 'structural' : 'mechanical');
  const notes = arg('notes', '');
  if (verdict !== 'pass') {
    console.error(`❌ verdict=${verdict} — pass 가 아니면 기록하지 않는다(빌드 보류).`);
    process.exit(1);
  }
  const rec = {
    sourceFile: 'plugins/figma-vars-installer/src/build-components.ts',
    sourceHash: hash,
    verifiedBy: by,           // component-verifier(독립 검증) | orchestrator(자가인증)
    verdict,
    changeType: change,       // structural | mechanical
    verifiedAt: new Date().toISOString(),
    notes,
  };
  fs.mkdirSync(path.dirname(REC), { recursive: true });
  fs.writeFileSync(REC, JSON.stringify(rec, null, 2) + '\n');
  const badge = by === 'component-verifier' ? '🤖 독립 검증' : '⭐ 자가인증';
  console.log(`✅ 검증 기록 갱신 — ${badge} (${change}) · ${hash.slice(0, 19)}…`);
}

/** 게이트 검사 — gate-check.js 에서 require 해서 호출 */
function check({ pass, warn, fail }) {
  const hash = sourceHash();
  if (!hash) {
    warn('build-components.ts 없음 — 설치기 빌드 검증 건너뜀');
    return;
  }
  const rec = readRecord();
  if (!rec || rec.__invalid) {
    fail('build-components.ts 검증 기록 없음/손상 — component-verifier 검증 후 기록 필요: '
      + 'node scripts/installer-build-verify-check.js --record --by component-verifier --verdict pass --notes "..."');
    return;
  }
  if (rec.sourceHash !== hash) {
    fail('build-components.ts 가 마지막 검증 이후 변경됨(검증 기록 stale) — 재검증 필요. '
      + '구조 변경은 ⭐ 단독 금지 → 🤖 component-verifier 로 검증 후 --record. '
      + '순수 기계적 수정이면 --by orchestrator --change mechanical 로 자가인증(git 가시).');
    return;
  }
  // 해시 일치 — 누가 검증했나로 분기
  if (rec.verifiedBy === 'component-verifier') {
    pass(`build-components.ts 독립 검증 완료 (🤖 component-verifier · ${rec.changeType} · ${rec.verifiedAt.slice(0, 10)})`);
  } else {
    warn(`build-components.ts = ⭐ 자가인증(${rec.changeType}) — 구조 변경이면 🤖 component-verifier 필요. 기록: ${rec.verifiedAt.slice(0, 10)} · "${rec.notes || ''}"`);
  }
}

module.exports = { check, sourceHash, REC };

// 단독 실행
if (require.main === module) {
  if (process.argv.includes('--record')) {
    record(process.argv.slice(2));
  } else {
    let errors = 0;
    const pass = (m) => console.log(`  ✅ ${m}`);
    const warn = (m) => console.warn(`  ⚠️  ${m}`);
    const fail = (m) => { console.error(`  ❌ ${m}`); errors++; };
    console.log('🔎 [Gate 13] 설치기빌드검증 검사기 (Installer Build Verify)');
    check({ pass, warn, fail });
    process.exit(errors > 0 ? 1 : 0);
  }
}
