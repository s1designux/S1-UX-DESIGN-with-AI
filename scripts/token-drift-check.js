#!/usr/bin/env node
/**
 * 🔎 토큰 drift 검사기 (Token Drift)
 *
 * 목적: registry 의 "컴포넌트-토큰 설명 데이터"가 정본(tokens.css = vars-data 생성물)과
 *       어긋나는(stale/divergent) 것을 커밋 단계에서 기계 차단한다.
 *       → 레거시/낡은 병렬 데이터가 사실을 오도하지 못하게 한다.
 *
 * 배경: registry/components/table.json 이 figmaVariable 엔 정본(color/table/cell/*) 을 적고
 *       value 엔 옛 color/bg|surface/* 를 가리켜, grep 하는 사람·AI 를 오도함(2026-06-30).
 *
 * 정본(SSOT): 토큰 값 = assets/css/tokens.css (vars-data 생성). 이 검사기는 그걸 기준으로 본다.
 *
 * 검사:
 *  (a) 유령 참조 — registry value 의 var(--color-*) 가 tokens.css 에 실재하는가
 *      (삭제/개명된 토큰을 가리키면 ❌). 예: bg/selected 제거 시 --table-row-selected-bg 즉시 적발.
 *  (b) figmaVariable ↔ value 일치 — figmaVariable(color/table/cell/hover) 와
 *      value(var(--color-table-cell-hover)) 가 같은 토큰을 가리키는가 (어긋나면 stale ❌).
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// 정본 토큰 집합 = tokens.css 에 정의된 --color-* (Foundation + Semantic)
const css = fs.readFileSync(path.join(ROOT, 'assets/css/tokens.css'), 'utf8');
const defined = new Set();
for (const m of css.matchAll(/(--color-[a-z0-9-]+)\s*:/g)) defined.add(m[1]);

// 검사 대상 = registry 컴포넌트-토큰 데이터 (손유지 → drift 위험)
const files = ['registry/tokens/component.tokens.json'];
const compDir = path.join(ROOT, 'registry/components');
if (fs.existsSync(compDir)) {
  for (const f of fs.readdirSync(compDir)) if (f.endsWith('.json')) files.push('registry/components/' + f);
}

const errors = [];

function entriesOf(obj, out) {
  if (Array.isArray(obj)) { obj.forEach((o) => entriesOf(o, out)); return; }
  if (obj && typeof obj === 'object') {
    const name = obj.cssVar || obj.name;
    const value = obj.value !== undefined ? obj.value : obj.ref;
    if (name && typeof value === 'string') out.push({ name, value, fig: obj.figmaVariable });
    Object.values(obj).forEach((v) => entriesOf(v, out));
  }
}

for (const rel of files) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  let data;
  try { data = JSON.parse(fs.readFileSync(full, 'utf8')); }
  catch (e) { errors.push(`${rel}: JSON parse 실패 — ${e.message}`); continue; }

  const entries = [];
  entriesOf(data, entries);

  for (const e of entries) {
    const refs = [...e.value.matchAll(/var\((--color-[a-z0-9-]+)\)/g)].map((m) => m[1]);
    // (a) 유령 참조
    for (const r of refs) {
      if (!defined.has(r)) errors.push(`${rel} · ${e.name}: 유령 참조 ${r} (tokens.css 정본에 없음)`);
    }
    // (b) figmaVariable ↔ value 일치 (color/* 이고 단일 --color-* 참조일 때만)
    if (e.fig && /^color\//.test(e.fig) && refs.length === 1) {
      const expect = '--' + e.fig.replace(/\//g, '-');
      if (refs[0] !== expect) {
        errors.push(`${rel} · ${e.name}: figmaVariable(${e.fig} → ${expect}) ↔ value(${refs[0]}) 불일치 (stale 가능)`);
      }
    }
  }
}

console.log('🔎 토큰 drift 검사기 (Token Drift)');
if (errors.length) {
  errors.forEach((e) => console.log('  ❌ ' + e));
  console.log(`  → ${errors.length}건 drift. 정본(tokens.css/vars-data) 기준으로 정정 필요.`);
  process.exit(1);
}
console.log('  ✅ registry 토큰 참조 정본 일치 (유령참조·figmaVariable 불일치 0)');
