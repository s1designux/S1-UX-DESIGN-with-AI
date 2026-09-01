/*
 * PLAN-ONLY artifact. Do not run until the orchestrator opens the pilot build gate.
 * Paste this whole file into use_figma and change PHASE for each sequential call.
 * Every phase stays at or below 10 logical create/move/resize operations.
 */
const PHASE = "prepare";
const PAGE_ID = "173:2431";
const SECTION_ID = "1744:1782";
const PLACEHOLDER_ID = "1744:1783";
const ALLOWED_REMOTE_KEYS = new Set([
  "e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581",
  "54469d54f16ed38de2d7b420b0e2195e4cf7c118"
]);

const NAMES = {
  terms: "MWEB/SIGNUP/1 · 약관 전체 동의",
  password: "MWEB/SIGNUP/4 · 비밀번호 입력 중 (키보드)",
  memberModal: "MWEB/SIGNUP/2a1 · 가입 회원 안내 (모달)",
  idSheet: "MWEB/SIGNUP/2b1 · 기존 아이디 선택 (바텀시트)"
};

const IDS = {
  header: "1760:7217",
  statusWeb: "1654:37388",
  navWeb: "1654:37492",
  navWebKeyboard: "1654:37651",
  checkbox: "1654:39838",
  buttonPrimary: "1654:39591",
  buttonPrimaryDisabled: "1654:39597",
  buttonSecondary: "1654:39623",
  inputId: "1654:42156",
  inputPassword: "1654:42198",
  inputPasswordConfirm: "1654:42049",
  modalDual: "1611:6731",
  bottomSheetDual: "1654:49266",
  optionDefault: "1654:49097",
  optionSelected: "1654:49099",
  optionDisabled: "1839:1782"
};

const VARS = {
  bg: "VariableID:687:17884",
  panel: "VariableID:687:17884",
  title: "VariableID:8:1127",
  body: "VariableID:8:1117",
  tertiary: "VariableID:8:1118",
  accent: "VariableID:8:1119",
  divider: "VariableID:8:1076",
  overlay: "VariableID:8:1087"
};

const STYLES = {
  title24B: "S:46c53f7871b080cddb7382b109ea6247333b9224,",
  title20B: "S:46f6df226b7078240376de6530ae592e02a48416,",
  title16B: "S:d5523fda0acb31b07bba12068ab01be15881584e,",
  body16R: "S:7bdbf8cf1d5c293eb11efaa3ce6b6ef53e9d21cf,",
  body14M: "S:0b8aad8ca7e2cfac03033ed19607a4d2fb76aa2a,",
  body12R: "S:688caf7c5d281ba8b15ce89feda98adccca04d54,"
};

const page = await figma.getNodeByIdAsync(PAGE_ID);
if (!page || page.type !== "PAGE") throw new Error("target page missing");
await figma.setCurrentPageAsync(page);
const section = await figma.getNodeByIdAsync(SECTION_ID);
if (!section || section.type !== "SECTION") throw new Error("target section missing");

await Promise.all([
  figma.loadFontAsync({ family: "Noto Sans KR", style: "Regular" }),
  figma.loadFontAsync({ family: "Pretendard", style: "Regular" }),
  figma.loadFontAsync({ family: "Pretendard", style: "Medium" }),
  figma.loadFontAsync({ family: "Pretendard", style: "Bold" })
]);

const varCache = {};
async function variable(id) {
  if (!varCache[id]) varCache[id] = await figma.variables.getVariableByIdAsync(id);
  if (!varCache[id]) throw new Error("variable missing: " + id);
  return varCache[id];
}
async function paint(id) {
  return figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    "color",
    await variable(id)
  );
}
function screen(name) {
  const n = section.findOne(x => x.type === "FRAME" && x.name === name);
  if (!n) throw new Error("screen missing: " + name);
  return n;
}
function createdFrame(parent, name, x, y, w, h) {
  const n = figma.createFrame();
  n.name = name; n.resize(w, h); parent.appendChild(n); n.x = x; n.y = y;
  return n;
}
async function authoredText(parent, name, characters, styleId, colorVarId, x, y, width) {
  const n = figma.createText();
  n.name = name;
  n.fontName = { family: "Noto Sans KR", style: "Regular" };
  n.textAutoResize = "HEIGHT";
  n.resize(width, 20);
  n.characters = characters;
  n.fills = [await paint(colorVarId)];
  await n.setTextStyleIdAsync(styleId);
  parent.appendChild(n); n.x = x; n.y = y;
  return n;
}
async function editText(n, value, mutated) {
  if (!n || n.type !== "TEXT") throw new Error("text override target missing");
  const fonts = n.getStyledTextSegments(["fontName"]).map(s => s.fontName);
  await Promise.all(fonts.map(f => figma.loadFontAsync(f)));
  n.characters = value;
  mutated.push(n.id);
}
async function localInstance(componentId, parent, name, x, y, w, h, created) {
  const comp = await figma.getNodeByIdAsync(componentId);
  if (!comp || comp.type !== "COMPONENT") throw new Error("component missing: " + componentId);
  const n = comp.createInstance();
  n.name = name; parent.appendChild(n); n.resize(w, h); n.x = x; n.y = y;
  const mc = await n.getMainComponentAsync();
  if (!mc || mc.remote !== false) throw new Error("local provenance failed: " + name);
  created.push(n.id);
  return n;
}
async function remoteIcon(key, parent, name, x, y, size, created) {
  if (!ALLOWED_REMOTE_KEYS.has(key)) throw new Error("icon key not allowed: " + key);
  const comp = await figma.importComponentByKeyAsync(key);
  const n = comp.createInstance();
  n.name = name; parent.appendChild(n); n.resize(size, size); n.x = x; n.y = y;
  const mc = await n.getMainComponentAsync();
  if (!mc || mc.key !== key) throw new Error("remote icon provenance failed: " + name);
  created.push(n.id);
  return n;
}
async function webHeader(parent, created, mutated) {
  const h = await localInstance(IDS.header, parent, "Mobile Header", 0, 0, 360, 149, created);
  const status = h.findAllWithCriteria({ types: ["INSTANCE"] }).find(n => n.name === "StatusBar");
  const web = await figma.getNodeByIdAsync(IDS.statusWeb);
  if (!status || !web || web.type !== "COMPONENT") throw new Error("header web status dependency missing");
  status.swapComponent(web);
  status.resize(360, 77);
  status.layoutSizingHorizontal = "FILL";
  const mc = await status.getMainComponentAsync();
  if (!mc || mc.remote !== false || mc.id !== IDS.statusWeb) throw new Error("nested StatusBar lost local provenance");
  mutated.push(status.id, h.id);
  return h;
}
async function button(componentId, parent, name, label, x, y, w, created, mutated) {
  const b = await localInstance(componentId, parent, name, x, y, w, 48, created);
  const tx = b.findAllWithCriteria({ types: ["TEXT"] }).find(n => n.name === "버튼");
  await editText(tx, label, mutated);
  return b;
}
async function input(componentId, parent, name, x, y, w, h, value, label, message, password, created, mutated) {
  const n = await localInstance(componentId, parent, name, x, y, w, h, created);
  if (password) n.setProperties({ "Password Icon#1654:226": true });
  const field = n.findOne(x => x.type === "FRAME" && x.name === "field");
  if (!field) throw new Error("Input field missing");
  field.resize(w, 48); field.layoutSizingHorizontal = "FILL"; mutated.push(field.id);
  const text = n.findAllWithCriteria({ types: ["TEXT"] }).find(t => ["입력", "텍스트"].includes(t.name) && t.parent !== n);
  if (value !== null) await editText(text, value, mutated);
  const labelNode = n.findAllWithCriteria({ types: ["TEXT"] }).find(t => t.name === "라벨");
  if (label !== null) await editText(labelNode, label, mutated);
  const messageNode = n.findAllWithCriteria({ types: ["TEXT"] }).find(t => t.name === "안내 메세지");
  if (message !== null) await editText(messageNode, message, mutated);
  mutated.push(n.id);
  return n;
}

const created = [];
const mutated = [];

if (PHASE === "prepare") {
  section.resizeWithoutConstraints(2520, 1880);
  const placeholder = await figma.getNodeByIdAsync(PLACEHOLDER_ID);
  if (!placeholder) throw new Error("placeholder missing");
  placeholder.x = 480; placeholder.y = 100;
  const specs = [
    [NAMES.terms, 80, 100], [NAMES.password, 1280, 100],
    [NAMES.memberModal, 480, 1000], [NAMES.idSheet, 880, 1000]
  ];
  for (const [name, x, y] of specs) {
    const root = createdFrame(section, name, x, y, 360, 780);
    root.fills = [await paint(VARS.bg)]; root.clipsContent = true; created.push(root.id);
  }
  const terms = screen(NAMES.terms);
  section.insertChild(0, terms); section.insertChild(1, placeholder);
  mutated.push(section.id, placeholder.id);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackRootIds: created, rollbackRestore: { section: { id: SECTION_ID, w: 520, h: 980 }, placeholder: { id: PLACEHOLDER_ID, x: 80, y: 100, index: 0 } } };
}

if (PHASE === "terms-shell") {
  const root = screen(NAMES.terms);
  await webHeader(root, created, mutated);
  await localInstance(IDS.navWeb, root, "NavBar", 0, 685, 360, 95, created);
  const content = createdFrame(root, "Content", 0, 149, 360, 536); content.fills = []; created.push(content.id);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "terms-content-a") {
  const root = screen(NAMES.terms); const content = root.findOne(n => n.type === "FRAME" && n.name === "Content");
  const title = await authoredText(content, "Page Title", "서비스 약관에 \n동의해 주세요", STYLES.title24B, VARS.title, 20, 14, 320); created.push(title.id);
  const agreements = createdFrame(content, "Agreements", 20, 98, 320, 230); agreements.fills = []; created.push(agreements.id);
  const allRow = createdFrame(agreements, "Agreement Row / All", 0, 8, 320, 18); allRow.fills = []; created.push(allRow.id);
  await localInstance(IDS.checkbox, allRow, "Checkbox", 0, 0, 18, 18, created);
  const allLabel = await authoredText(allRow, "Agreement Label", "전체 동의하기", STYLES.title16B, VARS.title, 28, 0, 292); created.push(allLabel.id);
  const divider = figma.createRectangle(); divider.name = "Divider"; divider.resize(320, 1); divider.fills = [await paint(VARS.divider)]; agreements.appendChild(divider); divider.x = 0; divider.y = 50; created.push(divider.id);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "terms-content-b") {
  const root = screen(NAMES.terms); const agreements = root.findOne(n => n.type === "FRAME" && n.name === "Agreements");
  for (const spec of [
    ["Agreement Row / Terms", 78, "회원 약관 동의(필수)"],
    ["Agreement Row / Privacy", 126, "개인정보 수집 및 이용 동의(필수)"]
  ]) {
    const row = createdFrame(agreements, spec[0], 0, spec[1], 320, 24); row.fills = []; created.push(row.id);
    await localInstance(IDS.checkbox, row, "Checkbox", 0, 0, 18, 18, created);
    const label = await authoredText(row, "Agreement Label", spec[2], STYLES.title16B, VARS.title, 28, 0, 258); created.push(label.id);
    await remoteIcon("e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581", row, "More", 296, 0, 24, created);
  }
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "terms-content-c") {
  const root = screen(NAMES.terms); const content = root.findOne(n => n.type === "FRAME" && n.name === "Content"); const agreements = root.findOne(n => n.type === "FRAME" && n.name === "Agreements");
  const row = createdFrame(agreements, "Agreement Row / Age", 0, 171, 320, 62); row.fills = []; created.push(row.id);
  await localInstance(IDS.checkbox, row, "Checkbox", 0, 0, 18, 18, created);
  const label = await authoredText(row, "Agreement Label", "만 14세 이상이에요(필수)", STYLES.title16B, VARS.title, 28, 0, 258); created.push(label.id);
  const desc = await authoredText(row, "Agreement Description", "만 14세 이상부터 회원가입이 가능합니다. 해당 정보는\n저장되지 않으며, 만 14세 이상 확인 용도로만 사용합니다.", STYLES.body12R, VARS.tertiary, 28, 26, 272); created.push(desc.id);
  await button(IDS.buttonPrimary, root, "CTA", "본인 인증", 20, 614, 320, created, mutated);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "password-shell") {
  const root = screen(NAMES.password);
  await webHeader(root, created, mutated);
  await localInstance(IDS.navWebKeyboard, root, "NavBar", 0, 389, 360, 391, created);
  const content = createdFrame(root, "Content", 0, 149, 360, 240); content.fills = []; created.push(content.id);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "password-content") {
  const root = screen(NAMES.password);
  const content = root.findOne(n => n.type === "FRAME" && n.name === "Content");
  if (!content) throw new Error("password content missing");
  const title = await authoredText(content, "Page Title", "비밀번호를\n입력해 주세요", STYLES.title24B, VARS.title, 20, 14, 320); created.push(title.id);
  const link = await authoredText(content, "Password Condition Link", "비밀번호 조건", STYLES.body14M, VARS.tertiary, 263, 98, 77); link.textDecoration = "UNDERLINE"; created.push(link.id);
  await input(IDS.inputPassword, content, "Password Input", 20, 98, 320, 94, "", "비밀번호", "영문, 숫자, 특수문자를 조합하여 8~15자로 입력해 주세요.", true, created, mutated);
  await input(IDS.inputPasswordConfirm, content, "Password Confirm Input", 20, 222, 320, 72, "입력해 주세요", "비밀번호 확인", null, true, created, mutated);
  await button(IDS.buttonPrimaryDisabled, root, "CTA", "확인", 20, 333, 320, created, mutated);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "member-bg-a") {
  const root = screen(NAMES.memberModal);
  await webHeader(root, created, mutated);
  await localInstance(IDS.navWeb, root, "NavBar", 0, 685, 360, 95, created);
  const content = createdFrame(root, "Content", 0, 149, 360, 536); content.fills = []; created.push(content.id);
  const title = await authoredText(content, "Page Title", "서비스 약관에 \n동의해 주세요", STYLES.title24B, VARS.title, 20, 14, 320); created.push(title.id);
  const agreements = createdFrame(content, "Agreements", 20, 98, 320, 230); agreements.fills = []; created.push(agreements.id);
  const allRow = createdFrame(agreements, "Agreement Row / All", 0, 8, 320, 18); allRow.fills = []; created.push(allRow.id);
  await localInstance(IDS.checkbox, allRow, "Checkbox", 0, 0, 18, 18, created);
  const allLabel = await authoredText(allRow, "Agreement Label", "전체 동의하기", STYLES.title16B, VARS.title, 28, 0, 292); created.push(allLabel.id);
  const divider = figma.createRectangle(); divider.name = "Divider"; divider.resize(320, 1); divider.fills = [await paint(VARS.divider)]; agreements.appendChild(divider); divider.x = 0; divider.y = 50; created.push(divider.id);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "member-bg-b") {
  const root = screen(NAMES.memberModal); const agreements = root.findOne(n => n.type === "FRAME" && n.name === "Agreements");
  for (const spec of [
    ["Agreement Row / Terms", 78, "회원 약관 동의(필수)"],
    ["Agreement Row / Privacy", 126, "개인정보 수집 및 이용 동의(필수)"]
  ]) {
    const row = createdFrame(agreements, spec[0], 0, spec[1], 320, 24); row.fills = []; created.push(row.id);
    await localInstance(IDS.checkbox, row, "Checkbox", 0, 0, 18, 18, created);
    const label = await authoredText(row, "Agreement Label", spec[2], STYLES.title16B, VARS.title, 28, 0, 258); created.push(label.id);
    await remoteIcon("e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581", row, "More", 296, 0, 24, created);
  }
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "member-bg-overlay") {
  const root = screen(NAMES.memberModal); const agreements = root.findOne(n => n.type === "FRAME" && n.name === "Agreements");
  const row = createdFrame(agreements, "Agreement Row / Age", 0, 171, 320, 62); row.fills = []; created.push(row.id);
  await localInstance(IDS.checkbox, row, "Checkbox", 0, 0, 18, 18, created);
  const label = await authoredText(row, "Agreement Label", "만 14세 이상이에요(필수)", STYLES.title16B, VARS.title, 28, 0, 258); created.push(label.id);
  const desc = await authoredText(row, "Agreement Description", "만 14세 이상부터 회원가입이 가능합니다. 해당 정보는\n저장되지 않으며, 만 14세 이상 확인 용도로만 사용합니다.", STYLES.body12R, VARS.tertiary, 28, 26, 272); created.push(desc.id);
  await button(IDS.buttonPrimary, root, "CTA", "본인 인증", 20, 614, 320, created, mutated);
  const dim = figma.createRectangle(); dim.name = "Overlay Dim"; dim.resize(360, 685); dim.fills = [await paint(VARS.overlay)]; root.appendChild(dim); dim.x = 0; dim.y = 0; created.push(dim.id);
  const modal = await localInstance(IDS.modalDual, root, "Mobile Modal", 30, 286, 300, 208, created);
  await editText(modal.findAllWithCriteria({ types: ["TEXT"] }).find(n => n.name === "title"), "이미 회원으로 가입되어 있습니다.", mutated);
  await editText(modal.findAllWithCriteria({ types: ["TEXT"] }).find(n => n.name === "message"), "아이디 : abcdefg", mutated);
  const buttons = modal.findAllWithCriteria({ types: ["INSTANCE"] }).filter(n => ["secondary", "primary"].includes(n.name));
  await editText(buttons[0].findAllWithCriteria({ types: ["TEXT"] }).find(n => n.name === "버튼"), "취소", mutated);
  await editText(buttons[1].findAllWithCriteria({ types: ["TEXT"] }).find(n => n.name === "버튼"), "확인", mutated);
  await remoteIcon("54469d54f16ed38de2d7b420b0e2195e4cf7c118", root, "Modal Close", 282, 302, 24, created);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "id-sheet-base") {
  const root = screen(NAMES.idSheet);
  await webHeader(root, created, mutated);
  await localInstance(IDS.navWebKeyboard, root, "NavBar", 0, 389, 360, 391, created);
  const content = createdFrame(root, "Content", 0, 149, 360, 240); content.fills = []; created.push(content.id);
  const title = await authoredText(content, "Page Title", "아이디를\n입력해 주세요", STYLES.title24B, VARS.title, 20, 14, 320); created.push(title.id);
  await input(IDS.inputId, content, "ID Input", 20, 106, 320, 70, "s1design", null, "영어 소문자, 숫자를 조합하여 4~12자 입력해 주세요.", false, created, mutated);
  await button(IDS.buttonPrimary, root, "CTA", "확인", 20, 333, 320, created, mutated);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "id-sheet-overlay-a") {
  const root = screen(NAMES.idSheet);
  const dim = figma.createRectangle(); dim.name = "Overlay Dim"; dim.resize(360, 685); dim.fills = [await paint(VARS.overlay)]; root.appendChild(dim); dim.x = 0; dim.y = 0; created.push(dim.id);
  const sheet = await localInstance(IDS.bottomSheetDual, root, "Bottom Sheet", 0, 282, 360, 498, created);
  const sheetTitle = sheet.findAllWithCriteria({ types: ["TEXT"] }).find(n => n.name === "title");
  await editText(sheetTitle, "기존 아이디를 사용하시겠어요?", mutated);
  const innerContent = sheet.findOne(n => n.type === "FRAME" && n.name === "content");
  innerContent.itemSpacing = 118; mutated.push(innerContent.id);
  const options = sheet.findAllWithCriteria({ types: ["INSTANCE"] }).filter(n => n.name === "option");
  const comps = await Promise.all([IDS.optionSelected, IDS.optionDefault, IDS.optionDefault, IDS.optionDisabled].map(id => figma.getNodeByIdAsync(id)));
  const labels = ["s1secom1", "s1secom2", "s1secom3", "s1secom4(이미 사용중인 아이디)"];
  for (let i = 0; i < 2; i++) {
    options[i].swapComponent(comps[i]);
    const mc = await options[i].getMainComponentAsync();
    if (!mc || mc.remote !== false) throw new Error("Bottom Sheet option lost local provenance");
    await editText(options[i].findAllWithCriteria({ types: ["TEXT"] }).find(n => n.name === "항목"), labels[i], mutated);
    mutated.push(options[i].id);
  }
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

if (PHASE === "id-sheet-overlay-b") {
  const root = screen(NAMES.idSheet);
  const sheet = root.findOne(n => n.type === "INSTANCE" && n.name === "Bottom Sheet");
  if (!sheet) throw new Error("Bottom Sheet missing");
  const options = sheet.findAllWithCriteria({ types: ["INSTANCE"] }).filter(n => n.name === "option");
  const comps = await Promise.all([IDS.optionSelected, IDS.optionDefault, IDS.optionDefault, IDS.optionDisabled].map(id => figma.getNodeByIdAsync(id)));
  const labels = ["s1secom1", "s1secom2", "s1secom3", "s1secom4(이미 사용중인 아이디)"];
  for (let i = 2; i < options.length; i++) {
    options[i].swapComponent(comps[i]);
    const mc = await options[i].getMainComponentAsync();
    if (!mc || mc.remote !== false) throw new Error("Bottom Sheet option lost local provenance");
    await editText(options[i].findAllWithCriteria({ types: ["TEXT"] }).find(n => n.name === "항목"), labels[i], mutated);
    mutated.push(options[i].id);
  }
  const footer = sheet.findOne(n => n.type === "FRAME" && n.name === "footer"); footer.visible = false; mutated.push(footer.id, sheet.id);
  const description = await authoredText(root, "Bottom Sheet Description", "홈페이지 또는 웹뷰어에 입력하신 정보로 가입된 아이디가 있어요. 기존 아이디를 사용하고 싶으시면 아래에서 선택해 주세요.", STYLES.body16R, VARS.tertiary, 20, 348, 320); created.push(description.id);
  await button(IDS.buttonSecondary, root, "Bottom Sheet Secondary", "새 아이디 사용", 20, 662, 156, created, mutated);
  await button(IDS.buttonPrimary, root, "Bottom Sheet Primary", "아이디 선택", 184, 662, 156, created, mutated);
  return { phase: PHASE, createdNodeIds: created, mutatedNodeIds: mutated, rollbackTargetIds: [root.id] };
}

throw new Error("unknown PHASE: " + PHASE);
