/**
 * ds-extract/lib.js — 시안 코퍼스 분석 공용 함수
 *
 * 입력은 읽기전용. 이 모듈은 get_metadata 가 저장한 파일(JSON 배열 [{type,text}])의
 * XML 메타데이터를 파싱해 컴포넌트(원자)·패턴(조합) 신호를 뽑는다.
 * MCP 호출은 하지 않는다(오케스트레이터=스킬 담당). 집계만.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// ── 저장된 get_metadata 결과 파일 → XML 문자열 ──
function readMetaXml(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  // 형식: [{type:"text", text:"<canvas ...>"}]
  return Array.isArray(raw) ? raw.map((e) => e.text || '').join('\n') : String(raw);
}

// ── XML 트리 파싱(스택) → {instances:[{name,id}], frames:[{name,id,childInstances:[name]}]} ──
function parseTree(xml) {
  const tokRe = /<(\/?)(canvas|frame|group|instance|symbol|text|vector|slice|component)\b([^>]*?)(\/?)>/g;
  const attr = (s, k) => (s.match(new RegExp(k + '="([^"]*)"')) || [])[1] || '';
  const stack = [];
  const frames = [];
  const instances = [];
  let m;
  while ((m = tokRe.exec(xml))) {
    const close = m[1] === '/', tag = m[2], attrs = m[3], self = m[4] === '/';
    if (close) { const n = stack.pop(); if (n && (n.tag === 'frame' || n.tag === 'group')) frames.push(n); continue; }
    const node = { tag, name: attr(attrs, 'name'), id: attr(attrs, 'id'), kids: [] };
    if (tag === 'instance') instances.push(node);
    if (stack.length) stack[stack.length - 1].kids.push(node);
    if (!self) stack.push(node);
    else if (tag === 'frame' || tag === 'group') frames.push(node);
  }
  return { instances, frames };
}

// ── 노이즈(시스템 크롬) 판정 ──
function makeChromeTest(patterns) {
  const ps = (patterns || []).map((p) => p.toLowerCase());
  return (name) => { const n = (name || '').toLowerCase(); return ps.some((p) => n.includes(p)); };
}

// ── 기존 DS 컴포넌트 대조 ──
function loadDsIds() {
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/components/index.json'), 'utf8'));
    return idx.components.map((c) => c.id);
  } catch { return []; }
}
const DS_ALIAS = {
  btnfull: 'button', btn: 'button', inputbox: 'input', emailinput: 'input', textfield: 'input',
  pwinput: 'input', dropdownlist: 'dropdown', selectbox: 'select', tabbar: 'tab', linetab: 'tab',
};
function dsMatch(name, dsIds) {
  const n = (name || '').toLowerCase().replace(/^m[_ ]/, '').replace(/[_ ]+/g, '');
  if (DS_ALIAS[n] && dsIds.includes(DS_ALIAS[n])) return DS_ALIAS[n];
  const hit = dsIds.find((d) => n === d || n.includes(d));
  return hit || null;
}

module.exports = { ROOT, readMetaXml, parseTree, makeChromeTest, loadDsIds, dsMatch };
