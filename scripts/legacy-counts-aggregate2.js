const fs=require('fs');
const dir='reports/pattern-builder/inventory/modu-app/raw/';
let all=[];
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){
  const d=JSON.parse(fs.readFileSync(dir+f,'utf8'));
  (d.screens||[]).forEach(s=>all.push({...s,page:d._meta.page.name}));
}
const W=s=>parseInt((s.size||'0x0').split('x')[0],10);
const screens=all.filter(s=>W(s)===360);
const has=(s,n)=>(s.components||[]).some(c=>c.name===n);
const CHROME=['m_StatusBar','appbar_sub','header','header_1','title_','phone_navi','m_bar','Footer','More'];

// 1) 틀 조합 (상단 × 하단)
const frame={};
for(const s of screens){
  const top=has(s,'m_StatusBar')||has(s,'appbar_sub')||has(s,'header')||has(s,'header_1');
  const bot=has(s,'phone_navi')||has(s,'m_bar')||has(s,'Footer');
  const k=(top?'상단 있음':'상단 없음')+' / '+(bot?'하단 있음':'하단 없음');
  frame[k]=(frame[k]||0)+1;
}

// 2) 본문 부품 조합 (틀 제외) 상위
const combo={};
for(const s of screens){
  const body=(s.components||[]).map(c=>c.name).filter(n=>!CHROME.includes(n)).sort();
  const k=body.length?body.join(' + '):'(본문 부품 없음)';
  const e=combo[k]||(combo[k]={key:k,n:0,pages:new Set(),ex:[]});
  e.n++; e.pages.add(s.page); if(e.ex.length<3) e.ex.push(s.name);
}
const combos=Object.values(combo).map(e=>({key:e.key,n:e.n,pages:[...e.pages].length,ex:e.ex}))
  .sort((a,b)=>b.n-a.n).filter(e=>e.n>=3);

// 3) 본문 부품별 — 몇 화면 / 몇 페이지 (틀 제외)
const body={};
for(const s of screens){
  for(const c of (s.components||[])){
    if(CHROME.includes(c.name)) continue;
    const e=body[c.name]||(body[c.name]={name:c.name,screens:0,total:0,pages:new Set()});
    e.screens++; e.total+=c.count; e.pages.add(s.page);
  }
}
const bodyList=Object.values(body).map(e=>({name:e.name,screens:e.screens,total:e.total,pages:[...e.pages].length,
  spread:[...e.pages].length>=3?'여러 자리':'한두 자리'})).sort((a,b)=>b.screens-a.screens);

const out=JSON.parse(fs.readFileSync('reports/composition-rules/2026-09-18-legacy-counts.json','utf8'));
out.frame=Object.entries(frame).sort((a,b)=>b[1]-a[1]);
out.combos=combos;
out.bodyList=bodyList;
fs.writeFileSync('reports/composition-rules/2026-09-18-legacy-counts.json',JSON.stringify(out,null,1));
console.log(JSON.stringify({frame:out.frame,topCombos:combos.slice(0,12)},null,1));
