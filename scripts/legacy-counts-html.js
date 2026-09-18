const fs=require('fs');
const d=JSON.parse(fs.readFileSync('reports/composition-rules/2026-09-18-legacy-counts.json','utf8'));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const tbl=(head,rows)=>`<table><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${
  rows.map(r=>`<tr>${r.map((c,i)=>`<td${i>0&&typeof c==='number'?' class="n"':''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

const M=fs.existsSync('reports/composition-rules/2026-09-18-skeleton-measure.json')?JSON.parse(fs.readFileSync('reports/composition-rules/2026-09-18-skeleton-measure.json','utf8')).summary:null;
const fmt=v=>v==='없음'?v:(Number.isInteger(+v)?v:(+v).toFixed(2)+' (어긋남)');
const histTbl=(arr,n=6)=>tbl(['값 (px)','화면 수'],arr.slice(0,n).map(([v,c])=>[fmt(v),c]));
const measureSection=!M?'':`
<h2>2-b. 간격 실측 (Figma 다시 읽음)</h2>
<p class="sub">Figma에서 7개 페이지를 다시 읽어 폭 360 화면 ${M.총화면}장의 위치 값을 그대로 쟀습니다. 아래는 <b>바탕 크기(360×780) ${M.바탕780.총화면}장</b> 기준입니다. 반올림하지 않았고, 소수점이 붙은 값은 "어긋남"으로 표시했습니다. 페이지 3장(내 정보·혜택·설정)은 Figma에서 열리지 않아 못 쟀습니다.</p>
<div class="cards">
<div class="card"><div class="v">24</div><div class="k">상태표시줄 높이 (${M.상태표시줄_높이[0][1]}장)</div></div>
<div class="card"><div class="v">72</div><div class="k">제목줄 높이 (${M.제목줄_높이[0][1]}장)</div></div>
<div class="card"><div class="v">48</div><div class="k">아래 기기 내비 높이 (${M.기기내비_높이[0][1]}장)</div></div>
<div class="card"><div class="v">20</div><div class="k">좌우 여백 (왼쪽 ${M.바탕780.왼쪽여백[0][1]}장)</div></div>
</div>
<h3>위 틀이 끝나는 자리</h3>
<p class="sub">상태표시줄만 있으면 24, 상태표시줄+제목줄이면 112(제목줄이 40에서 시작) 또는 96(24에서 시작). 두 가지가 같이 쓰였습니다.</p>
${histTbl(M.바탕780.위틀_아래끝)}
<h3>제목줄이 시작하는 높이</h3>
${histTbl(M.제목줄_y,4)}
<h3>위 틀에서 본문 첫 글자·부품까지 간격</h3>
<p class="sub">한 값으로 모이지 않습니다 — 20·28·16·24가 섞여 있습니다.</p>
${histTbl(M.바탕780.위틀에서_본문까지,7)}
<h3>왼쪽 여백</h3>
${histTbl(M.바탕780.왼쪽여백,5)}
<h3>오른쪽 여백</h3>
<p class="sub">0이나 음수는 화면 밖으로 삐져나간 부품(가로 스크롤 등)이라 여백이 아닙니다.</p>
${histTbl(M.바탕780.오른쪽여백,5)}
`;

const pairSections=Object.entries(d.pairs).map(([g,v])=>{
  const rows=v.rows.map(r=>[r.name,r.screens,r.total,r.pages.length,r.pages.length>=3?'여러 자리':'한두 자리']);
  const co=v.co.map(c=>[`${c.a} + ${c.b}`,c.both,c.onlyA,c.onlyB]);
  return `<h3>${esc(g)}</h3>
  ${tbl(['부품','나온 화면 수','총 등장','나온 페이지 수','퍼짐'],rows)}
  ${co.length?`<p class="sub">한 화면에 같이 나온 경우</p>${tbl(['짝','같이','왼쪽만','오른쪽만'],co)}`:'<p class="sub">같이 나온 화면 없음 — 서로 자리를 바꿔 쓰는 사이로 보임</p>'}`;
}).join('\n');

const html=`<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>레거시 판독표 집계 — 2026-09-18</title>
<style>
:root{--bg:#fff;--fg:#1a1a1a;--dim:#666;--line:#e5e5e5;--head:#f6f7f8;--accent:#0b5fff;--warn:#b45309;--warnbg:#fffbeb}
*{box-sizing:border-box}
body{margin:0;padding:32px 16px 96px;font:15px/1.7 -apple-system,"Pretendard","Apple SD Gothic Neo",sans-serif;color:var(--fg);background:var(--bg)}
.wrap{max-width:900px;margin:0 auto}
h1{font-size:26px;margin:0 0 4px}
h2{font-size:20px;margin:48px 0 8px;padding-top:16px;border-top:2px solid var(--fg)}
h3{font-size:16px;margin:28px 0 6px}
p.lead{color:var(--dim);margin:0 0 24px}
p.sub{color:var(--dim);font-size:13px;margin:12px 0 4px}
table{border-collapse:collapse;width:100%;margin:8px 0 4px;font-size:14px}
th,td{border:1px solid var(--line);padding:6px 10px;text-align:left;vertical-align:top}
th{background:var(--head);font-weight:600;white-space:nowrap}
td.n{text-align:right;font-variant-numeric:tabular-nums}
.note{background:var(--warnbg);border-left:4px solid var(--warn);padding:12px 16px;margin:16px 0;font-size:14px}
.note b{color:var(--warn)}
.cards{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}
.card{flex:1 1 150px;border:1px solid var(--line);border-radius:8px;padding:12px 14px}
.card .v{font-size:28px;font-weight:700;font-variant-numeric:tabular-nums}
.card .k{font-size:13px;color:var(--dim)}
ol.ask{background:#f6f9ff;border:1px solid #cfe0ff;border-radius:8px;padding:16px 16px 16px 36px}
ol.ask li{margin:10px 0}
code{background:#f3f4f6;padding:1px 5px;border-radius:4px;font-size:13px}
</style></head><body><div class="wrap">

<h1>레거시 판독표 집계</h1>
<p class="lead">모두앱 레거시 ${d.counts.raw}개 틀에서 <b>세로 360 화면 ${d.counts.fullScreens}장</b>만 골라 센 결과입니다.
무엇이 있었는지만 세었고, 무엇을 기준으로 삼을지는 정하지 않았습니다. <span style="color:var(--dim)">(${d.generatedAt})</span></p>

<div class="cards">
<div class="card"><div class="v">${d.counts.fullScreens}</div><div class="k">화면 (폭 360)</div></div>
<div class="card"><div class="v">${d.counts.fragments}</div><div class="k">조각 (부분 틀)</div></div>
<div class="card"><div class="v">${d.bodyList.length}</div><div class="k">본문 부품 종류</div></div>
<div class="card"><div class="v">${d.combos.length}</div><div class="k">3장 이상 반복된 부품 조합</div></div>
</div>

${M?`<div class="note"><b>간격은 Figma를 다시 읽어 쟀습니다</b> (2-b 참조). 페이지 3장(내 정보·혜택·설정)은 Figma에서 열리지 않아 그 부분은 못 쟀습니다.</div>`:`<div class="note"><b>못 잰 것 하나.</b> 판독 원자료에는 부품의 <b>위치·여백 값이 들어 있지 않습니다.</b> 여백 실측이 필요하면 Figma를 다시 읽어야 합니다.</div>`}

<h2>1. 화면 뼈대 — 위아래 틀</h2>
<p class="sub">화면 ${d.counts.fullScreens}장의 위·아래 틀 유무</p>
${tbl(['틀 조합','화면 수'],d.frame)}
<p class="sub">틀을 이루는 부품별</p>
${tbl(['자리','부품','나온 화면 수'],[
 ['위','m_StatusBar (상태표시줄)',d.skel.상단_StatusBar],
 ['위','appbar_sub (제목줄)',d.skel.상단_appbar_sub],
 ['위','둘 다 함께',d.skel.상단_둘다],
 ['아래','phone_navi (기기 내비)',d.skel.하단_phone_navi],
 ['아래','m_bar (탭바)',d.skel.하단_m_bar],
 ['아래','둘 다 함께',d.skel.하단_둘다],
 ['위+아래','상태표시줄 + 기기 내비',d.skel.상단하단_모두],
 ['—','틀 부품이 하나도 없음',d.skel.틀부품_없음],
])}

<h2>2. 화면 크기</h2>
<p class="sub">폭 (전체 ${d.counts.raw}개 틀)</p>
${tbl(['폭','개수'],d.widths.slice(0,8))}
<p class="sub">높이 (폭 360 화면만)</p>
${tbl(['높이','화면 수'],d.heights.slice(0,12))}
${measureSection}

<h2>3. 헷갈리는 부품 쌍</h2>
<p class="sub">비슷한 것이 여럿일 때 레거시가 각각 어디에 썼는지. <b>"퍼짐"이 여러 자리면 공통 후보, 한두 자리면 그 화면 전용 후보</b>입니다.</p>
${pairSections}

<h2>4. 반복된 본문 부품 조합</h2>
<p class="sub">틀(상태표시줄·제목줄·내비)을 뺀 본문 부품만 모아, 같은 조합이 3장 이상 나온 것</p>
${tbl(['본문 부품 조합','화면 수','페이지 수','예시 화면'],d.combos.slice(0,30).map(c=>[c.key,c.n,c.pages,c.ex.join(' / ')]))}

<h2>5. 본문 부품 퍼짐</h2>
<p class="sub">세 곳 이상에서 나왔으면 공통 후보, 한두 곳이면 그 화면 전용 후보 (river 지시 2026-09-17)</p>
${tbl(['부품','나온 화면 수','총 등장','페이지 수','퍼짐'],d.bodyList.slice(0,50).map(b=>[b.name,b.screens,b.total,b.pages,b.spread]))}

<h2>6. river님이 정할 것</h2>
<ol class="ask">
<li><b>화면 뼈대를 어디까지 기준으로 삼을까요?</b> 화면 393장이 «위 틀 + 본문 + 아래 틀»이고, 71장은 틀이 아예 없습니다(팝업·시트류로 보임). 뼈대를 «틀 있는 화면» 한 벌로 할지, «틀 있는 화면 / 덮는 화면» 두 벌로 할지.</li>
<li><b>버튼은 몇 종류로 갈까요?</b> 레거시는 큰 버튼·작은 버튼이 따로였고 한 화면에 같이 나온 건 15장뿐입니다. 크기 축 하나로 묶을지, 별개 부품으로 둘지.</li>
<li><b>입력칸과 고르는 칸을 한 식구로 볼까요?</b> 글 입력·이메일 입력·고르는 칸이 각각 따로 부품이었습니다.</li>
<li><b>화살표가 다섯 종류입니다.</b> 줄 오른쪽 화살표·펼침 화살표·일반 화살표가 섞여 있습니다. 몇 개로 줄일지.</li>
<li><b>위 틀에서 본문까지 간격을 몇으로 할까요?</b> 레거시는 20·28·16·24가 섞여 있었습니다. 좌우 여백은 20으로 거의 모입니다.</li>
<li><b>제목줄 자리를 하나로 할까요?</b> 상태표시줄 아래 40에서 시작하는 것과 24에서 시작하는 것, 두 가지가 같이 쓰였습니다.</li>
</ol>

<p class="sub">원자료: <code>reports/pattern-builder/inventory/modu-app/raw/*.json</code> · 집계: <code>reports/composition-rules/2026-09-18-legacy-counts.json</code></p>
</div></body></html>`;
fs.writeFileSync('reports/composition-rules/2026-09-18-legacy-counts.html',html);
console.log('ok',html.length);
