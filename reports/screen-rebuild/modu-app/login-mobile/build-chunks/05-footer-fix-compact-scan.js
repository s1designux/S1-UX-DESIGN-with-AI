const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") {
  return { violations: [{ type: "target-page", message: "Page 173:2431 missing" }] };
}
await figma.setCurrentPageAsync(page);

const section = await figma.getNodeByIdAsync("1562:2");
if (!section || section.type !== "SECTION") {
  return { violations: [{ type: "section", message: "Section 1562:2 missing" }] };
}

const specs = [
  { id:"1562:3", source:"8403:60128", name:"2.1 로그인_1 최초진입", inputs:["1546:10603","1546:10603"], button:"1545:8176", keyboard:false, phone:"휴대전화번호로 로그인", popup:null, texts:["아이디를 입력해 주세요.","비밀번호를 입력해 주세요."] },
  { id:"1562:4", source:"8403:60155", name:"2.1 로그인_2 입력 A", inputs:["1546:10715","1546:10603"], button:"1545:8170", keyboard:true, phone:null, popup:null, texts:["s1desig","비밀번호를 입력해 주세요."] },
  { id:"1562:5", source:"30812:3889", name:"2.1 로그인_2 입력 B", inputs:["1546:10655","1546:10715"], button:"1545:8170", keyboard:true, phone:null, popup:null, texts:["s1design","••••••••"] },
  { id:"1562:6", source:"8403:60255", name:"2.1 로그인_3 아이디 미입력", inputs:["1546:10803","1546:10655"], button:"1545:8170", keyboard:false, phone:"휴대전화번호로 로그인", popup:null, texts:["아이디를 입력해 주세요.","아이디를 정확히 입력해 주세요.","••••••••"] },
  { id:"1562:7", source:"8403:60287", name:"2.1 로그인_4 비밀번호 미입력", inputs:["1546:10655","1546:10803"], button:"1545:8170", keyboard:false, phone:"휴대전화번호로 로그인", popup:null, texts:["s1design","비밀번호를 입력해 주세요.","비밀번호를 정확히 입력해 주세요."] },
  { id:"1562:8", source:"8403:60315", name:"2.1 로그인_5 잘못된 아이디비번", inputs:["1546:10655","1546:10803"], button:"1545:8170", keyboard:false, phone:"휴대전화번호로 로그인", popup:null, texts:["s1design","••••••••","아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)"] },
  { id:"1562:9", source:"8403:60181", name:"2.1 로그인_7 자동 로그인 선택 A", inputs:["1546:10655","1546:10655"], button:"1545:8170", keyboard:false, phone:"휴대전화번호로 로그인", popup:{ main:"1546:17957", title:"로그인 되었습니다.", message:"다음부터 자동으로 로그인할까요?", buttons:["취소","확인"] }, texts:["s1design","••••••••"] },
  { id:"1562:10", source:"21446:2889", name:"2.1 로그인_7 자동 로그인 선택 B", inputs:["1546:10655","1546:10655"], button:"1545:8170", keyboard:false, phone:"휴대폰 번호로 로그인", popup:{ main:"1546:17945", title:"자동 로그인 설정 되었습니다.", message:"", buttons:["확인"] }, texts:["s1design","••••••••"] },
  { id:"1562:11", source:"30812:3215", name:"2.1 로그인_6 새로운 기기로 로그인 A", inputs:["1546:10655","1546:10655"], button:"1545:8170", keyboard:false, phone:"휴대폰 번호로 로그인", popup:{ main:"1546:17945", title:"인증되지 않은 기기에요", message:"서비스를 이용하시려면 본인 인증을 해 주세요. 본인 인증 시 기존 기기는 인증이 해제됩니다.", buttons:["확인"] }, texts:["s1design","••••••••"] },
  { id:"1562:12", source:"30812:3288", name:"2.1 로그인_6 새로운 기기로 로그인 B", inputs:["1546:10655","1546:10655"], button:"1545:8170", keyboard:false, phone:"휴대폰 번호로 로그인", popup:{ main:"1546:17945", title:"인증 완료", message:"사용중인 기기로 인증이 완료되었습니다.\n다시 로그인 해주세요.", buttons:["확인"] }, texts:["s1design","••••••••"] },
  { id:"1562:13", source:"30812:3252", name:"2.1 로그인_6 새로운 기기로 로그인 C", inputs:["1546:10655","1546:10655"], button:"1545:8170", keyboard:false, phone:"휴대폰 번호로 로그인", popup:{ main:"1546:17957", title:"인증되지 않은 기기에요", message:"에스원은 고객님의 소중한 정보를 보호하기 위해 인증 기기 등록 후 서비스를 제공하고 있습니다.\n현재 인증한 기기로 등록 후 로그인 할까요?", buttons:["취소","확인"] }, texts:["s1design","••••••••"] },
  { id:"1562:14", source:"8403:60218", name:"2.1 로그인_6 새로운 기기로 로그인 D", inputs:["1546:10655","1546:10655"], button:"1545:8170", keyboard:false, phone:"휴대전화번호로 로그인", popup:null, texts:["s1design","••••••••"] },
  { id:"1562:15", source:"21446:2852", name:"2.1 로그인_6 새로운 기기로 로그인 E", inputs:["1546:10655","1546:10655"], button:"1545:8170", keyboard:false, phone:"휴대폰 번호로 로그인", popup:null, texts:["s1design","••••••••"] }
];

const screenNodes = await Promise.all(specs.map(spec => figma.getNodeByIdAsync(spec.id)));
const screenMap = new Map(
  screenNodes.filter(node => node && node.type === "FRAME").map(node => [node.id, node])
);

function walk(node, visitor, visible = true, outerInstance = null, stopAtInstance = false) {
  const nowVisible = visible && (typeof node.visible !== "boolean" || node.visible !== false);
  const nextOuter = outerInstance || (node.type === "INSTANCE" ? node : null);
  visitor(node, nowVisible, nextOuter);
  if (!("children" in node)) return;
  if (stopAtInstance && node.type === "INSTANCE") return;
  for (const child of node.children) walk(child, visitor, nowVisible, nextOuter, stopAtInstance);
}

function descendants(node, stopAtInstance = false) {
  const result = [];
  if (!("children" in node)) return result;
  for (const child of node.children) {
    walk(child, current => result.push(current), true, null, stopAtInstance);
  }
  return result;
}

function geom(node) {
  return [node.x, node.y, node.width, node.height];
}

async function setText(textNode, value) {
  const segments = textNode.getStyledTextSegments(["fontName"]);
  const fonts = [...new Map(
    segments.map(segment => [
      `${segment.fontName.family}::${segment.fontName.style}`,
      segment.fontName
    ])
  ).values()];
  await Promise.all(fonts.map(font => figma.loadFontAsync(font)));
  textNode.characters = value;
}

const footerFixStrings = ["이용약관", "개인정보처리방침", "영상정보처리방침"];
const mutatedTextIds = [];
const footerFixes = [];
const footerFixViolations = [];

for (const spec of specs.filter(spec => !spec.keyboard)) {
  const screen = screenMap.get(spec.id);
  if (!screen) {
    footerFixViolations.push({ screen: spec.id, issue: "screen-missing" });
    continue;
  }
  const footers = descendants(screen).filter(
    node => node.type === "INSTANCE" && node.name === "Footer / Mobile"
  );
  if (footers.length !== 1) {
    footerFixViolations.push({ screen: spec.id, issue: "footer-count", actual: footers.length });
    continue;
  }
  const footer = footers[0];
  const directTexts = footer
    .findAllWithCriteria({ types: ["TEXT"] })
    .slice()
    .sort((a, b) => (a.y - b.y) || (a.x - b.x));
  if (directTexts.length < 3) {
    footerFixViolations.push({ screen: spec.id, issue: "footer-text-count", actual: directTexts.length });
    continue;
  }
  for (let index = 0; index < 3; index++) {
    await setText(directTexts[index], footerFixStrings[index]);
    mutatedTextIds.push(directTexts[index].id);
  }
  footerFixes.push({ screen: spec.id, footer: footer.id, texts: directTexts.slice(0, 3).map(text => text.id) });
}

const allowedKeys = new Set([
  "24b2df622d341e0af21cd4b23b4a7d23b97a5ea7","5ab251e0d90adb555ee2fa316f84e86041f19916",
  "6b764af642b8883e892754281950da0e971224d7","ca1d043ac09be07f827e939be3d8c3c7af8a8dd9",
  "ea0ffc118c38048f2cdfb5620be31c120426bb7a","5157e9edc76358e2e6bc1a5ebc1539ccf5f2e787",
  "a423e2e05cfff2f93062d6a83d6f3bdf79ca9647","e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581",
  "dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2","6bf422c937034ce15f6814e5c430d8f85953ed4e",
  "c99f913689cd068deb2a5499154fed423ec9579f","2a1abbd3597b536e34fd9523fb61eade3afe9934",
  "d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7","b130623bad9bf035e273501b404bf7a245af1460",
  "606d0de897175059f133427bf62bb3635d18a860","28aa6b1615f3afb29ff22cf2767f0c771c941fdc",
  "b3ccc4b275de6aac8e3940df2ae97fbb00168624","e9a3d9b7e0c60b93fc10e2f6485ab77bd06329f0",
  "617757d927a1bae7df6ccdf0d24cc0e3c5a04255"
]);

const rawViolations = [];
const fontViolations = [];
const missingText = [];
const popupMismatch = [];
const keyboardMismatch = [];
const wrongState = [];
const allInstanceEntries = [];
const compactScreens = [];
const allVisibleStrings = [];

const commonNormal = [
  "로그인","회원가입","아이디 찾기","비밀번호 찾기",
  "이용약관","개인정보처리방침","영상정보처리방침"
];

function textFonts(text) {
  if (text.fontName !== figma.mixed) return [text.fontName];
  return [...new Map(
    text.getStyledTextSegments(["fontName"]).map(segment => [
      `${segment.fontName.family}::${segment.fontName.style}`,
      segment.fontName
    ])
  ).values()];
}

for (const spec of specs) {
  const screen = screenMap.get(spec.id);
  if (!screen) {
    compactScreens.push({ id:spec.id, name:spec.name, source:spec.source, status:"missing" });
    wrongState.push({ screen:spec.id, issue:"screen-missing" });
    continue;
  }

  const content = screen.children.find(
    node => node.type === "FRAME" && node.name === "PatternContent"
  );
  const all = descendants(screen);
  const authored = descendants(screen, true);
  const visibleTexts = [];
  const roots = [];
  let instanceCount = 0;
  let remoteInstanceCount = 0;

  walk(screen, (node, visible, outerInstance) => {
    if (node.type === "INSTANCE") {
      instanceCount++;
      if (outerInstance === node) roots.push(node);
      allInstanceEntries.push({ screen:spec.id, instance:node, root:outerInstance === node });
    }
    if (node.type !== "TEXT" || !visible) return;
    visibleTexts.push([node.id, node.characters]);
    allVisibleStrings.push(node.characters);

    const componentRootName = outerInstance?.name || null;
    const mustUsePretendard = !outerInstance ||
      /^(Input \/|Button \/|Footer \/|Modal \/)/.test(componentRootName || "");
    if (mustUsePretendard) {
      const fonts = textFonts(node);
      const allPretendard = fonts.length > 0 && fonts.every(font =>
        font.family.toLowerCase().includes("pretendard")
      );
      const hasStyle = node.textStyleId !== figma.mixed && Boolean(node.textStyleId);
      if (!allPretendard || !hasStyle) {
        fontViolations.push({
          screen:spec.id,
          id:node.id,
          root:componentRootName,
          fonts:fonts.map(font => `${font.family}/${font.style}`),
          style:node.textStyleId === figma.mixed ? "mixed" : node.textStyleId || null
        });
      }
    }
  });

  for (const node of [screen, ...authored]) {
    if (node.type === "INSTANCE" || node.visible === false) continue;
    for (const property of ["fills", "strokes"]) {
      if (!(property in node) || !Array.isArray(node[property])) continue;
      for (const paint of node[property]) {
        if (paint.type === "SOLID" && paint.visible !== false && !paint.boundVariables?.color) {
          rawViolations.push({ screen:spec.id, id:node.id, name:node.name, property });
        }
      }
    }
  }

  const actualStrings = new Set(visibleTexts.map(([, value]) => value));
  const expected = ["로그인", ...spec.texts];
  if (!spec.keyboard) expected.push(...commonNormal.filter(text => text !== "로그인"), spec.phone);
  if (spec.popup) {
    expected.push(spec.popup.title, ...spec.popup.buttons);
    if (spec.popup.message) expected.push(spec.popup.message);
  }
  const missing = [...new Set(expected.filter(text => !actualStrings.has(text)))];
  if (missing.length) missingText.push({ screen:spec.id, missing });

  const keyboards = all.filter(node => node.type === "FRAME" && node.name === "OS Keyboard (Placeholder)");
  if ((keyboards.length === 1) !== spec.keyboard) {
    keyboardMismatch.push({ screen:spec.id, expected:spec.keyboard, actual:keyboards.length });
  }
  if (keyboards.length === 1) {
    const tokenId = Array.isArray(keyboards[0].fills)
      ? keyboards[0].fills.find(paint => paint.type === "SOLID")?.boundVariables?.color?.id
      : null;
    if (keyboards[0].width !== 360 || keyboards[0].height !== 296 || tokenId !== "VariableID:687:17885") {
      keyboardMismatch.push({ screen:spec.id, issue:"state", token:tokenId, g:geom(keyboards[0]) });
    }
  }

  const overlays = all.filter(node => node.type === "FRAME" && node.name === "ModalOverlay");
  if ((overlays.length === 1) !== Boolean(spec.popup)) {
    popupMismatch.push({ screen:spec.id, expected:Boolean(spec.popup), actual:overlays.length });
  }

  compactScreens.push({
    id:spec.id,
    name:screen.name,
    source:spec.source,
    status:content ? "built" : "incomplete",
    contentRootId:content?.id || null,
    authoredNodeIds:[screen.id, ...authored.map(node => node.id)],
    top:content ? content.children.map(node => [node.id,node.name,...geom(node)]) : [],
    visibleTexts,
    rootInstances:roots.map(instance => [instance.id,instance.name]),
    instanceCounts:{ all:instanceCount, root:roots.length, remote:remoteInstanceCount }
  });
}

const uniqueEntries = [...new Map(
  allInstanceEntries.map(entry => [entry.instance.id, entry])
).values()];
const provenance = await Promise.all(uniqueEntries.map(async entry => {
  const main = await entry.instance.getMainComponentAsync();
  const allowed = Boolean(main) && (main.remote === false || allowedKeys.has(main.key));
  return {
    screen:entry.screen,
    root:entry.root,
    id:entry.instance.id,
    name:entry.instance.name,
    mainId:main?.id || null,
    key:main?.key || null,
    remote:main?.remote ?? null,
    variant:entry.instance.variantProperties,
    allowed
  };
}));

const disallowed = provenance.filter(item => !item.allowed);
const provenanceMap = new Map(provenance.map(item => [item.id, item]));

for (const report of compactScreens) {
  if (report.status === "missing") continue;
  report.rootInstances = report.rootInstances.map(([id, name]) => {
    const item = provenanceMap.get(id);
    return [id,name,item?.mainId || null,item?.variant || null];
  });
  const screenItems = provenance.filter(item => item.screen === report.id);
  report.instanceCounts.remote = screenItems.filter(item => item.remote === true).length;
}

for (const spec of specs) {
  const screen = screenMap.get(spec.id);
  if (!screen) continue;
  const instances = descendants(screen).filter(node => node.type === "INSTANCE");
  const byName = name => instances.find(instance => instance.name === name);
  const mainId = instance => instance ? provenanceMap.get(instance.id)?.mainId || null : null;
  const checks = [
    ["StatusBar / App","1545:6510"],
    ["CI / 에스원 / Blue","1545:6711"],
    ["Button / 로그인",spec.button],
    ["NavBar / App","1545:6628"]
  ];
  if (!spec.keyboard) {
    checks.push(["Footer / Mobile","1545:6818"]);
    checks.push([`Button / ${spec.phone}`,"1545:8202"]);
  }
  for (const [name, expected] of checks) {
    const actual = mainId(byName(name));
    if (actual !== expected) wrongState.push({ screen:spec.id, item:name, expected, actual });
  }
  const actualInputs = [mainId(byName("Input / ID")), mainId(byName("Input / Password"))];
  if (actualInputs[0] !== spec.inputs[0]) wrongState.push({ screen:spec.id, item:"id-input", expected:spec.inputs[0], actual:actualInputs[0] });
  if (actualInputs[1] !== spec.inputs[1]) wrongState.push({ screen:spec.id, item:"password-input", expected:spec.inputs[1], actual:actualInputs[1] });
  const modal = instances.find(instance => instance.name.startsWith("Modal /"));
  const actualModal = mainId(modal);
  if ((spec.popup?.main || null) !== actualModal) {
    wrongState.push({ screen:spec.id, item:"modal", expected:spec.popup?.main || null, actual:actualModal });
  }
  if (screen.name !== spec.name || screen.width !== 360 || screen.height !== 780) {
    wrongState.push({ screen:spec.id, item:"screen", expected:[spec.name,360,780], actual:[screen.name,screen.width,screen.height] });
  }
}

const logoutAbsent = !allVisibleStrings.some(text => text.includes("로그아웃"));
const allViolations = [
  ...footerFixViolations,
  ...rawViolations,
  ...disallowed,
  ...missingText,
  ...popupMismatch,
  ...keyboardMismatch,
  ...wrongState,
  ...fontViolations
];

return {
  section:{ id:section.id, name:section.name, geometry:geom(section) },
  screens:compactScreens,
  footerFixes,
  mutatedTextIds,
  provenance:{
    root:provenance.filter(item => item.root).map(item => [item.screen,item.id,item.name,item.mainId,item.variant]),
    perScreen:compactScreens.map(screen => [screen.id,screen.instanceCounts])
  },
  violations:{
    all:allViolations,
    footer:footerFixViolations,
    raw:rawViolations,
    disallowed,
    missingText,
    popup:popupMismatch,
    keyboard:keyboardMismatch,
    wrongState,
    font:fontViolations
  },
  counts:{
    screenCount:compactScreens.length,
    builtCount:compactScreens.filter(screen => screen.status === "built").length,
    footerFixCount:footerFixes.length,
    raw:rawViolations.length,
    disallowed:disallowed.length,
    missingText:missingText.reduce((sum,item) => sum + item.missing.length, 0),
    wrongState:wrongState.length + popupMismatch.length + keyboardMismatch.length,
    font:fontViolations.length,
    excludedLogoutAbsent:logoutAbsent,
    total:allViolations.length
  },
  screenshotTargets:[
    ["section","1562:2"],
    ["initial","1562:3"],
    ["keyboardA","1562:4"],
    ["error","1562:8"],
    ["autoA","1562:9"],
    ["newDeviceC","1562:13"]
  ]
};
