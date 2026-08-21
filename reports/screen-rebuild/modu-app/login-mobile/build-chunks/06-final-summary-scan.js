const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") return { violations:{ page:[["173:2431","missing"]] } };
await figma.setCurrentPageAsync(page);
const section = await figma.getNodeByIdAsync("1562:2");
if (!section || section.type !== "SECTION") return { violations:{ section:[["1562:2","missing"]] } };

const specs = [
  {id:"1562:3",source:"8403:60128",name:"2.1 로그인_1 최초진입",inputs:["1546:10603","1546:10603"],button:"1545:8176",keyboard:false,phone:"휴대전화번호로 로그인",popup:null,texts:["아이디를 입력해 주세요.","비밀번호를 입력해 주세요."]},
  {id:"1562:4",source:"8403:60155",name:"2.1 로그인_2 입력 A",inputs:["1546:10715","1546:10603"],button:"1545:8170",keyboard:true,phone:null,popup:null,texts:["s1desig","비밀번호를 입력해 주세요."]},
  {id:"1562:5",source:"30812:3889",name:"2.1 로그인_2 입력 B",inputs:["1546:10655","1546:10715"],button:"1545:8170",keyboard:true,phone:null,popup:null,texts:["s1design","••••••••"]},
  {id:"1562:6",source:"8403:60255",name:"2.1 로그인_3 아이디 미입력",inputs:["1546:10803","1546:10655"],button:"1545:8170",keyboard:false,phone:"휴대전화번호로 로그인",popup:null,texts:["아이디를 입력해 주세요.","아이디를 정확히 입력해 주세요.","••••••••"]},
  {id:"1562:7",source:"8403:60287",name:"2.1 로그인_4 비밀번호 미입력",inputs:["1546:10655","1546:10803"],button:"1545:8170",keyboard:false,phone:"휴대전화번호로 로그인",popup:null,texts:["s1design","비밀번호를 입력해 주세요.","비밀번호를 정확히 입력해 주세요."]},
  {id:"1562:8",source:"8403:60315",name:"2.1 로그인_5 잘못된 아이디비번",inputs:["1546:10655","1546:10803"],button:"1545:8170",keyboard:false,phone:"휴대전화번호로 로그인",popup:null,texts:["s1design","••••••••","아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)"]},
  {id:"1562:9",source:"8403:60181",name:"2.1 로그인_7 자동 로그인 선택 A",inputs:["1546:10655","1546:10655"],button:"1545:8170",keyboard:false,phone:"휴대전화번호로 로그인",popup:{main:"1546:17957",title:"로그인 되었습니다.",message:"다음부터 자동으로 로그인할까요?",buttons:["취소","확인"]},texts:["s1design","••••••••"]},
  {id:"1562:10",source:"21446:2889",name:"2.1 로그인_7 자동 로그인 선택 B",inputs:["1546:10655","1546:10655"],button:"1545:8170",keyboard:false,phone:"휴대폰 번호로 로그인",popup:{main:"1546:17945",title:"자동 로그인 설정 되었습니다.",message:"",buttons:["확인"]},texts:["s1design","••••••••"]},
  {id:"1562:11",source:"30812:3215",name:"2.1 로그인_6 새로운 기기로 로그인 A",inputs:["1546:10655","1546:10655"],button:"1545:8170",keyboard:false,phone:"휴대폰 번호로 로그인",popup:{main:"1546:17945",title:"인증되지 않은 기기에요",message:"서비스를 이용하시려면 본인 인증을 해 주세요. 본인 인증 시 기존 기기는 인증이 해제됩니다.",buttons:["확인"]},texts:["s1design","••••••••"]},
  {id:"1562:12",source:"30812:3288",name:"2.1 로그인_6 새로운 기기로 로그인 B",inputs:["1546:10655","1546:10655"],button:"1545:8170",keyboard:false,phone:"휴대폰 번호로 로그인",popup:{main:"1546:17945",title:"인증 완료",message:"사용중인 기기로 인증이 완료되었습니다.\n다시 로그인 해주세요.",buttons:["확인"]},texts:["s1design","••••••••"]},
  {id:"1562:13",source:"30812:3252",name:"2.1 로그인_6 새로운 기기로 로그인 C",inputs:["1546:10655","1546:10655"],button:"1545:8170",keyboard:false,phone:"휴대폰 번호로 로그인",popup:{main:"1546:17957",title:"인증되지 않은 기기에요",message:"에스원은 고객님의 소중한 정보를 보호하기 위해 인증 기기 등록 후 서비스를 제공하고 있습니다.\n현재 인증한 기기로 등록 후 로그인 할까요?",buttons:["취소","확인"]},texts:["s1design","••••••••"]},
  {id:"1562:14",source:"8403:60218",name:"2.1 로그인_6 새로운 기기로 로그인 D",inputs:["1546:10655","1546:10655"],button:"1545:8170",keyboard:false,phone:"휴대전화번호로 로그인",popup:null,texts:["s1design","••••••••"]},
  {id:"1562:15",source:"21446:2852",name:"2.1 로그인_6 새로운 기기로 로그인 E",inputs:["1546:10655","1546:10655"],button:"1545:8170",keyboard:false,phone:"휴대폰 번호로 로그인",popup:null,texts:["s1design","••••••••"]}
];

const nodes = await Promise.all(specs.map(spec => figma.getNodeByIdAsync(spec.id)));
const screenMap = new Map(nodes.filter(node => node?.type === "FRAME").map(node => [node.id,node]));

function walk(node, fn, visible=true, outer=null, stop=false) {
  const v = visible && (typeof node.visible !== "boolean" || node.visible !== false);
  const o = outer || (node.type === "INSTANCE" ? node : null);
  fn(node,v,o);
  if (!("children" in node) || (stop && node.type === "INSTANCE")) return;
  for (const child of node.children) walk(child,fn,v,o,stop);
}
function desc(node, stop=false) {
  const out=[];
  if ("children" in node) for (const child of node.children) walk(child,n=>out.push(n),true,null,stop);
  return out;
}
function g(node){ return [node.x,node.y,node.width,node.height]; }
async function editText(node,value){
  const fonts=[...new Map(node.getStyledTextSegments(["fontName"]).map(s=>[`${s.fontName.family}/${s.fontName.style}`,s.fontName])).values()];
  await Promise.all(fonts.map(font=>figma.loadFontAsync(font)));
  node.characters=value;
}

const footerStrings=["이용약관","개인정보처리방침","영상정보처리방침"];
const footerIssues=[], footerIds=[], mutatedTextIds=[];
for (const spec of specs.filter(spec=>!spec.keyboard)) {
  const screen=screenMap.get(spec.id);
  if (!screen){ footerIssues.push([spec.id,"screen-missing"]); continue; }
  const footers=desc(screen).filter(node=>node.type==="INSTANCE"&&node.name==="Footer / Mobile");
  if (footers.length!==1){ footerIssues.push([spec.id,"footer-count",footers.length]); continue; }
  const texts=footers[0].findAllWithCriteria({types:["TEXT"]}).slice().sort((a,b)=>(a.y-b.y)||(a.x-b.x));
  if (texts.length<3){ footerIssues.push([spec.id,"text-count",texts.length]); continue; }
  for(let i=0;i<3;i++){ await editText(texts[i],footerStrings[i]); mutatedTextIds.push(texts[i].id); }
  footerIds.push(footers[0].id);
}

const allowed=new Set([
  "24b2df622d341e0af21cd4b23b4a7d23b97a5ea7","5ab251e0d90adb555ee2fa316f84e86041f19916","6b764af642b8883e892754281950da0e971224d7","ca1d043ac09be07f827e939be3d8c3c7af8a8dd9","ea0ffc118c38048f2cdfb5620be31c120426bb7a","5157e9edc76358e2e6bc1a5ebc1539ccf5f2e787","a423e2e05cfff2f93062d6a83d6f3bdf79ca9647","e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581","dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2","6bf422c937034ce15f6814e5c430d8f85953ed4e","c99f913689cd068deb2a5499154fed423ec9579f","2a1abbd3597b536e34fd9523fb61eade3afe9934","d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7","b130623bad9bf035e273501b404bf7a245af1460","606d0de897175059f133427bf62bb3635d18a860","28aa6b1615f3afb29ff22cf2767f0c771c941fdc","b3ccc4b275de6aac8e3940df2ae97fbb00168624","e9a3d9b7e0c60b93fc10e2f6485ab77bd06329f0","617757d927a1bae7df6ccdf0d24cc0e3c5a04255"
]);

const raw=[], fonts=[], missing=[], popup=[], keyboard=[], wrong=[], entries=[], screens=[], visibleStrings=[];
const common=["로그인","회원가입","아이디 찾기","비밀번호 찾기","이용약관","개인정보처리방침","영상정보처리방침"];
function families(text){
  if(text.fontName!==figma.mixed)return [text.fontName];
  return [...new Map(text.getStyledTextSegments(["fontName"]).map(s=>[`${s.fontName.family}/${s.fontName.style}`,s.fontName])).values()];
}
function authoredIds(screen){
  const ids=[screen.id];
  function add(node){
    if(node.type==="INSTANCE")return;
    ids.push(node.id);
    if("children" in node)for(const child of node.children)add(child);
  }
  for(const child of screen.children)add(child);
  return ids;
}

for(const spec of specs){
  const screen=screenMap.get(spec.id);
  if(!screen){ screens.push({id:spec.id,name:spec.name,source:spec.source,status:"missing",contentRootId:null,authoredNodeIds:[],top:[]}); wrong.push([spec.id,"screen-missing"]); continue; }
  const content=screen.children.find(node=>node.type==="FRAME"&&node.name==="PatternContent");
  const all=desc(screen), strings=[];
  walk(screen,(node,v,outer)=>{
    if(node.type==="INSTANCE")entries.push({screen:spec.id,node,root:outer===node});
    if(node.type!=="TEXT"||!v)return;
    strings.push(node.characters); visibleStrings.push(node.characters);
    const must=!outer||/^(Input \/|Button \/|Footer \/|Modal \/)/.test(outer.name||"");
    if(must){
      const fs=families(node), okFont=fs.length&&fs.every(f=>f.family.toLowerCase().includes("pretendard"));
      const okStyle=node.textStyleId!==figma.mixed&&Boolean(node.textStyleId);
      if(!okFont||!okStyle)fonts.push([spec.id,node.id,outer?.name||null,fs.map(f=>`${f.family}/${f.style}`),node.textStyleId===figma.mixed?"mixed":node.textStyleId||null]);
    }
  });
  for(const node of [screen,...desc(screen,true)]){
    if(node.type==="INSTANCE"||node.visible===false)continue;
    for(const prop of ["fills","strokes"]){
      if(!(prop in node)||!Array.isArray(node[prop]))continue;
      for(const paint of node[prop])if(paint.type==="SOLID"&&paint.visible!==false&&!paint.boundVariables?.color)raw.push([spec.id,node.id,prop]);
    }
  }
  const expected=["로그인",...spec.texts];
  if(!spec.keyboard)expected.push(...common.filter(x=>x!=="로그인"),spec.phone);
  if(spec.popup){ expected.push(spec.popup.title,...spec.popup.buttons); if(spec.popup.message)expected.push(spec.popup.message); }
  const set=new Set(strings), absent=[...new Set(expected.filter(x=>!set.has(x)))];
  if(absent.length)missing.push([spec.id,absent]);
  const ks=all.filter(n=>n.type==="FRAME"&&n.name==="OS Keyboard (Placeholder)");
  if((ks.length===1)!==spec.keyboard)keyboard.push([spec.id,spec.keyboard,ks.length]);
  if(ks.length===1){
    const token=Array.isArray(ks[0].fills)?ks[0].fills.find(p=>p.type==="SOLID")?.boundVariables?.color?.id:null;
    if(g(ks[0])[2]!==360||g(ks[0])[3]!==296||token!=="VariableID:687:17885")keyboard.push([spec.id,"state",token,g(ks[0])]);
  }
  const overlays=all.filter(n=>n.type==="FRAME"&&n.name==="ModalOverlay");
  if((overlays.length===1)!==Boolean(spec.popup))popup.push([spec.id,Boolean(spec.popup),overlays.length]);
  screens.push({
    id:spec.id,name:screen.name,source:spec.source,status:content?"built":"incomplete",contentRootId:content?.id||null,
    authoredNodeIds:authoredIds(screen),
    top:content?content.children.map(n=>[n.id,n.name,...g(n)]):[]
  });
}

const unique=[...new Map(entries.map(e=>[e.node.id,e])).values()];
const checked=await Promise.all(unique.map(async e=>{
  const main=await e.node.getMainComponentAsync();
  return {screen:e.screen,root:e.root,id:e.node.id,name:e.node.name,mainId:main?.id||null,key:main?.key||null,remote:main?.remote??null,variant:e.node.variantProperties,allowed:Boolean(main)&&(main.remote===false||allowed.has(main.key))};
}));
const disallowed=checked.filter(x=>!x.allowed).map(x=>[x.screen,x.id,x.name,x.mainId,x.key,x.remote]);
const pmap=new Map(checked.map(x=>[x.id,x]));

for(const spec of specs){
  const screen=screenMap.get(spec.id); if(!screen)continue;
  const instances=desc(screen).filter(n=>n.type==="INSTANCE"), by=name=>instances.find(n=>n.name===name), mid=n=>n?pmap.get(n.id)?.mainId||null:null;
  const checks=[["StatusBar / App","1545:6510"],["CI / 에스원 / Blue","1545:6711"],["Button / 로그인",spec.button],["NavBar / App","1545:6628"]];
  if(!spec.keyboard)checks.push(["Footer / Mobile","1545:6818"],[`Button / ${spec.phone}`,"1545:8202"]);
  for(const [name,expected] of checks){const actual=mid(by(name));if(actual!==expected)wrong.push([spec.id,name,expected,actual]);}
  const actualInputs=[mid(by("Input / ID")),mid(by("Input / Password"))];
  if(actualInputs[0]!==spec.inputs[0])wrong.push([spec.id,"id-input",spec.inputs[0],actualInputs[0]]);
  if(actualInputs[1]!==spec.inputs[1])wrong.push([spec.id,"password-input",spec.inputs[1],actualInputs[1]]);
  const modal=instances.find(n=>n.name.startsWith("Modal /")), actualModal=mid(modal), expectedModal=spec.popup?.main||null;
  if(actualModal!==expectedModal)wrong.push([spec.id,"modal",expectedModal,actualModal]);
  if(screen.name!==spec.name||screen.width!==360||screen.height!==780)wrong.push([spec.id,"screen",[spec.name,360,780],[screen.name,screen.width,screen.height]]);
}

const logoutAbsent=!visibleStrings.some(text=>text.includes("로그아웃"));
const total=footerIssues.length+raw.length+disallowed.length+missing.length+popup.length+keyboard.length+wrong.length+fonts.length;
return {
  section:{id:section.id,name:section.name,geometry:g(section)},
  screens,
  footerFixes:{count:footerIds.length,footerIds,mutatedTextIds},
  provenance:{checkedCount:checked.length,rootCount:checked.filter(x=>x.root).length,remoteCount:checked.filter(x=>x.remote===true).length,disallowed},
  violations:{footer:footerIssues,raw,disallowed,missingText:missing,popup,keyboard,wrongState:wrong,font:fonts},
  counts:{screenCount:screens.length,builtCount:screens.filter(x=>x.status==="built").length,footerFixCount:footerIds.length,raw:raw.length,disallowed:disallowed.length,missingText:missing.reduce((sum,x)=>sum+x[1].length,0),wrongState:wrong.length+popup.length+keyboard.length,font:fonts.length,excludedLogoutAbsent:logoutAbsent,total},
  screenshotTargets:[["section","1562:2"],["initial","1562:3"],["keyboardA","1562:4"],["error","1562:8"],["autoA","1562:9"],["newDeviceC","1562:13"]]
};
