const fs=require('fs');
const dir='reports/pattern-builder/inventory/modu-app/raw/';
let all=[];
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){
  const d=JSON.parse(fs.readFileSync(dir+f,'utf8'));
  (d.screens||[]).forEach(s=>all.push({...s,page:d._meta.page.name,file:f}));
}
const W=s=>parseInt((s.size||'0x0').split('x')[0],10);
const H=s=>parseInt((s.size||'0x0').split('x')[1],10);
const screens=all.filter(s=>W(s)===360);
const frags=all.filter(s=>W(s)!==360);

const comp={};
for(const s of all){
  for(const c of (s.components||[])){
    const e=comp[c.name]||(comp[c.name]={name:c.name,total:0,screens:0,fullScreens:0,pages:new Set()});
    e.total+=c.count; e.screens++; if(W(s)===360) e.fullScreens++; e.pages.add(s.page);
  }
}
const compList=Object.values(comp).map(e=>({name:e.name,total:e.total,screens:e.screens,fullScreens:e.fullScreens,pages:[...e.pages].length,pageNames:[...e.pages].sort()}))
  .sort((a,b)=>b.fullScreens-a.fullScreens);

const has=(s,n)=>(s.components||[]).some(c=>c.name===n);
const skel={총화면:screens.length,
  상단_StatusBar:screens.filter(s=>has(s,'m_StatusBar')).length,
  상단_appbar_sub:screens.filter(s=>has(s,'appbar_sub')).length,
  상단_둘다:screens.filter(s=>has(s,'m_StatusBar')&&has(s,'appbar_sub')).length,
  하단_phone_navi:screens.filter(s=>has(s,'phone_navi')).length,
  하단_m_bar:screens.filter(s=>has(s,'m_bar')).length,
  하단_둘다:screens.filter(s=>has(s,'phone_navi')&&has(s,'m_bar')).length,
  상단하단_모두:screens.filter(s=>has(s,'m_StatusBar')&&has(s,'phone_navi')).length,
  틀부품_없음:screens.filter(s=>!has(s,'m_StatusBar')&&!has(s,'appbar_sub')&&!has(s,'phone_navi')&&!has(s,'m_bar')).length};

const hh={}; screens.forEach(s=>{hh[H(s)]=(hh[H(s)]||0)+1;});
const heights=Object.entries(hh).map(([h,n])=>[+h,n]).sort((a,b)=>b[1]-a[1]);
const ww={}; all.forEach(s=>{ww[W(s)]=(ww[W(s)]||0)+1;});
const widths=Object.entries(ww).map(([w,n])=>[+w,n]).sort((a,b)=>b[1]-a[1]);

const groups={
 '버튼':['m_button','m_subbutton','m_btn_full','m_button variation','m_login_bottom'],
 '입력':['m_Input box','m_email_input','m_combobox','m_calendar_input','m_combobox/off/off/off/Default'],
 '고르기':['m_checkbox','m_radiobutton','m_toggle','m_chips','filter'],
 '상단':['m_StatusBar','appbar_sub','header','header_1','title_'],
 '하단':['phone_navi','m_bar','Footer','m_login_bottom'],
 '줄/탭':['tabel_bar','m_tab_mid','m_list','nav'],
 '화살표':['menu_arrow_right','menu_arrow_down','icon/arrow','icon/combobox_arrow','ic_화살표, 더보기'],
 '닫기/치우기':['close','Remove','hide'],
};
const pairs={};
for(const [g,names] of Object.entries(groups)){
  const rows=names.filter(n=>comp[n]).map(n=>({
    name:n, screens:comp[n].fullScreens, total:comp[n].total, pages:[...comp[n].pages].sort()
  }));
  const co=[];
  for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
    const a=rows[i].name,b=rows[j].name;
    const both=screens.filter(s=>has(s,a)&&has(s,b)).length;
    if(both>0) co.push({a,b,both,onlyA:screens.filter(s=>has(s,a)&&!has(s,b)).length,onlyB:screens.filter(s=>has(s,b)&&!has(s,a)).length});
  }
  pairs[g]={rows,co:co.sort((x,y)=>y.both-x.both)};
}

const stem=n=>String(n).split(/[_(（]/)[0].trim();
const st={};
screens.forEach(s=>{const k=s.page+' › '+stem(s.name); (st[k]=st[k]||[]).push(s.name);});
const stems=Object.entries(st).map(([k,v])=>({key:k,n:v.length})).sort((a,b)=>b.n-a.n);

const byPage={};
all.forEach(s=>{const p=byPage[s.page]=byPage[s.page]||{page:s.page,all:0,full:0};p.all++;if(W(s)===360)p.full++;});

const out={generatedAt:'2026-09-18',
  source:'reports/pattern-builder/inventory/modu-app/raw/*.json (figma:get_metadata 원자료)',
  counts:{raw:all.length,fullScreens:screens.length,fragments:frags.length},
  byPage:Object.values(byPage).sort((a,b)=>b.full-a.full),
  widths,heights,skel,compList,pairs,stems:stems.slice(0,60)};
fs.writeFileSync('reports/composition-rules/2026-09-18-legacy-counts.json',JSON.stringify(out,null,1));
console.log(JSON.stringify({counts:out.counts,skel,topHeights:heights.slice(0,12)},null,1));
