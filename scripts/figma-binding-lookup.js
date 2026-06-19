#!/usr/bin/env node
'use strict';

/**
 * figma-binding-lookup.js — Figma 미바인딩 hex → DS 토큰 역매핑 (결정론·판단 없음)
 *
 * figma-library-build / screen-rebuild 검증에서, use_figma 바인딩 스캔이 뽑은
 * "미바인딩 raw hex" 목록을 받아, vars-data.ts(정본)에서 등가 토큰이 있는지
 * 기계적으로 판정한다. LLM 판단이 "등가물 없음"을 주관적으로 선언하던 구멍을 막는다.
 *
 * 정본: plugins/figma-vars-installer/src/vars-data.ts
 *   - FOUNDATION_COLOR: { "gray/200": "#D9D9D9", ... }
 *   - SEMANTIC_COLOR:   { "color/surface/default": { light: "base/white", dark: "..." }, ... }
 *
 * 사용:
 *   node scripts/figma-binding-lookup.js '#FFFFFF' '#353535' '#DCDCDC'
 *   echo '["#ffffff","#dcdcdc"]' | node scripts/figma-binding-lookup.js --stdin
 *   node scripts/figma-binding-lookup.js --stdin < scan-result.json   # {hex:[...]} 또는 [{hex},...] 도 허용
 *
 * 출력(기본 표 + 종료코드):
 *   - 정확 일치(Foundation 또는 Semantic light) 있는 hex 가 1건이라도 있으면 exit 2
 *     → 검증기는 그 항목들을 ❌(a) "토큰 바인딩 필수" 로 처리해야 한다.
 *   - 근사만 있고 정확 일치 없는 hex 는 exit 0(표에 APPROX 표기) → ❓(c) 사용자 판단.
 *   --json 플래그로 기계 판독용 JSON 출력.
 */

const fs = require('fs');
const path = require('path');

const VARS_DATA = path.resolve(__dirname, '../plugins/figma-vars-installer/src/vars-data.ts');

// ── hex 정규화 ────────────────────────────────────────────────
function normHex(raw) {
  if (!raw) return null;
  let h = String(raw).trim().replace(/^#/, '').toUpperCase();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6); // alpha 무시
  if (!/^[0-9A-F]{6}$/.test(h)) return null;
  return '#' + h;
}

function hexToRgb(h) {
  const n = normHex(h); if (!n) return null;
  return [parseInt(n.slice(1, 3), 16), parseInt(n.slice(3, 5), 16), parseInt(n.slice(5, 7), 16)];
}
function rgbDist(a, b) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}

// ── vars-data.ts 파싱 (정규식 — TS 컴파일 불필요) ─────────────
function parseVarsData() {
  const src = fs.readFileSync(VARS_DATA, 'utf8');

  // FOUNDATION_COLOR: Record<string,string>
  const foundation = {}; // name → hex
  const fBlock = src.match(/export const FOUNDATION_COLOR(?!_)[^{]*{([\s\S]*?)\n};/);
  if (fBlock) {
    const re = /"([^"]+)"\s*:\s*"(#[0-9a-fA-F]{3,8})"/g; let m;
    while ((m = re.exec(fBlock[1]))) foundation[m[1]] = normHex(m[2]);
  }

  // SEMANTIC_COLOR: name → { light: "<foundationKey or hex>", dark: ... }
  const semantic = {}; // name → { light, dark }
  const sBlock = src.match(/export const SEMANTIC_COLOR(?![_A-Z])[^{]*{([\s\S]*?)\n};/);
  if (sBlock) {
    const re = /"([^"]+)"\s*:\s*{\s*light:\s*"([^"]+)"\s*,\s*dark:\s*"([^"]+)"/g; let m;
    while ((m = re.exec(sBlock[1]))) semantic[m[1]] = { light: m[2], dark: m[3] };
  }
  return { foundation, semantic };
}

// SEMANTIC light alias → resolved hex (foundation 경유, 또는 직접 hex)
function resolveLight(aliasOrHex, foundation) {
  const direct = normHex(aliasOrHex);
  if (direct) return direct;
  return foundation[aliasOrHex] || null;
}

function buildReverseMaps({ foundation, semantic }) {
  const byHex = new Map(); // hex → { foundation:[names], semantic:[names] }
  const ensure = (hex) => { if (!byHex.has(hex)) byHex.set(hex, { foundation: [], semantic: [] }); return byHex.get(hex); };
  for (const [name, hex] of Object.entries(foundation)) {
    if (hex) ensure(hex).foundation.push(name);
  }
  const semResolved = []; // { name, hex }
  for (const [name, entry] of Object.entries(semantic)) {
    const hex = resolveLight(entry.light, foundation);
    if (hex) { ensure(hex).semantic.push(name); semResolved.push({ name, hex }); }
  }
  return { byHex, semResolved, foundation };
}

function nearest(hex, maps) {
  const target = hexToRgb(hex); if (!target) return null;
  let best = null;
  // 근사는 Semantic 우선, 없으면 Foundation
  const pool = [
    ...maps.semResolved.map(s => ({ kind: 'semantic', name: s.name, hex: s.hex })),
    ...Object.entries(maps.foundation).map(([name, h]) => ({ kind: 'foundation', name, hex: h })),
  ];
  for (const c of pool) {
    const rgb = hexToRgb(c.hex); if (!rgb) continue;
    const d = rgbDist(target, rgb);
    if (!best || d < best.dist) best = { ...c, dist: Math.round(d * 10) / 10 };
  }
  return best;
}

// ── 입력 수집 ─────────────────────────────────────────────────
function collectInput(argv) {
  const flags = new Set(argv.filter(a => a.startsWith('--')));
  const positional = argv.filter(a => !a.startsWith('--'));
  let hexes = [...positional];
  if (flags.has('--stdin')) {
    const raw = fs.readFileSync(0, 'utf8').trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const arr = Array.isArray(parsed) ? parsed : (parsed.hex || parsed.hexes || parsed.unbound || []);
        for (const item of arr) hexes.push(typeof item === 'string' ? item : (item.hex || item.value));
      } catch {
        for (const tok of raw.split(/[\s,]+/)) hexes.push(tok);
      }
    }
  }
  return { hexes: hexes.map(normHex).filter(Boolean), json: flags.has('--json') };
}

function main() {
  const { hexes, json } = collectInput(process.argv.slice(2));
  if (!hexes.length) {
    console.error('사용법: node scripts/figma-binding-lookup.js \'#FFFFFF\' [...]  또는  --stdin');
    process.exit(1);
  }
  const maps = buildReverseMaps(parseVarsData());

  const rows = [];
  for (const hex of [...new Set(hexes)]) {
    const exact = maps.byHex.get(hex);
    if (exact && (exact.semantic.length || exact.foundation.length)) {
      rows.push({
        hex, verdict: 'EXACT',
        semantic: exact.semantic, foundation: exact.foundation,
        recommend: exact.semantic[0] || exact.foundation[0],
        action: '❌(a) 토큰 바인딩 필수',
      });
    } else {
      const near = nearest(hex, maps);
      rows.push({
        hex, verdict: 'APPROX',
        nearest: near ? { name: near.name, kind: near.kind, hex: near.hex, dist: near.dist } : null,
        action: '❓(c) 사용자 판단 (근사 적용 vs 원색 유지)',
      });
    }
  }

  const exactCount = rows.filter(r => r.verdict === 'EXACT').length;

  if (json) {
    console.log(JSON.stringify({ exactCount, approxCount: rows.length - exactCount, rows }, null, 2));
  } else {
    console.log('\n  hex 값     | 판정   | DS 토큰 등가물 / 근사                         | 처리');
    console.log('  -----------|--------|---------------------------------------------|------------------------');
    for (const r of rows) {
      if (r.verdict === 'EXACT') {
        const names = (r.semantic.length ? r.semantic : r.foundation).slice(0, 2).join(', ');
        console.log(`  ${r.hex.padEnd(10)} | EXACT  | ${names.padEnd(43)} | ❌(a) 바인딩 필수`);
      } else {
        const n = r.nearest;
        const txt = n ? `근사 ${n.name} (${n.hex}, Δ${n.dist})` : '없음';
        console.log(`  ${r.hex.padEnd(10)} | APPROX | ${txt.padEnd(43)} | ❓(c) 사용자 판단`);
      }
    }
    console.log(`\n  → EXACT ${exactCount}건(반드시 토큰 바인딩 = ❌(a)) · APPROX ${rows.length - exactCount}건(HD/❓(c))`);
    if (exactCount > 0) console.log('  ⚠️ EXACT 가 1건이라도 있으면 검증 통과 불가 — 빌더가 토큰 바인딩 후 재검증.');
  }

  process.exit(exactCount > 0 ? 2 : 0);
}

main();
