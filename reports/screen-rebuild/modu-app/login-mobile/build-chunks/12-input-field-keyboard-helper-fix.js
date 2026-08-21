figma.skipInvisibleInstanceChildren = false;

const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") {
  return { createdNodeIds: [], mutatedNodeIds: [], violations: { preflight: [["page", "173:2431", "missing"]] } };
}
await figma.setCurrentPageAsync(page);

const screenIds = [
  "1562:3","1562:4","1562:5","1562:6","1562:7","1562:8","1562:9",
  "1562:10","1562:11","1562:12","1562:13","1562:14","1562:15"
];
const keyboardIds = new Set(["1562:4","1562:5"]);
const errorIds = new Set(["1562:6","1562:7","1562:8"]);
const modalIds = new Set(["1562:9","1562:10","1562:11","1562:12","1562:13"]);
const helperStrings = ["회원가입","아이디 찾기","비밀번호 찾기"];
const helperStyleId = "S:688caf7c5d281ba8b15ce89feda98adccca04d54,";
const helperTokenId = "VariableID:8:1118";

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

function direct(parent, name) {
  return "children" in parent ? parent.children.filter(node => node.name === name) : [];
}

function walk(node, visit, inheritedVisible = true, instanceDepth = 0) {
  const visible = inheritedVisible && (typeof node.visible !== "boolean" || node.visible !== false);
  visit(node, visible, instanceDepth);
  if (!("children" in node)) return;
  const nextDepth = instanceDepth + (node.type === "INSTANCE" ? 1 : 0);
  for (const child of node.children) walk(child, visit, visible, nextDepth);
}

function walkAuthored(node, visit, inheritedVisible = true) {
  const visible = inheritedVisible && (typeof node.visible !== "boolean" || node.visible !== false);
  visit(node, visible);
  if (node.type === "INSTANCE" || !("children" in node)) return;
  for (const child of node.children) walkAuthored(child, visit, visible);
}

function relative(node, ancestor) {
  let x = node.x;
  let y = node.y;
  let parent = node.parent;
  while (parent && parent !== ancestor) {
    if ("x" in parent) x += parent.x;
    if ("y" in parent) y += parent.y;
    parent = parent.parent;
  }
  return { x, y };
}

function geometry(node, screen) {
  if (!node) return null;
  const point = relative(node, screen);
  return { id: node.id, name: node.name, x: point.x, y: point.y, width: node.width, height: node.height };
}

function internalGeometry(node, field) {
  if (!node) return null;
  const point = relative(node, field);
  return {
    id: node.id, name: node.name, x: point.x, width: node.width, height: node.height,
    layoutSizingHorizontal: "layoutSizingHorizontal" in node ? node.layoutSizingHorizontal : null,
    layoutGrow: "layoutGrow" in node ? node.layoutGrow : null
  };
}

function solidTokenId(node) {
  if (!("fills" in node) || !Array.isArray(node.fills)) return null;
  return node.fills.find(paint => paint.type === "SOLID" && paint.visible !== false)?.boundVariables?.color?.id || null;
}

function currentFonts(text) {
  if (text.fontName !== figma.mixed) return [text.fontName];
  try {
    return [...new Map(text.getStyledTextSegments(["fontName"]).map(segment => [
      `${segment.fontName.family}/${segment.fontName.style}`, segment.fontName
    ])).values()];
  } catch (_) {
    return [];
  }
}

function lineMetrics(text) {
  let lineHeight = null;
  if (text.lineHeight !== figma.mixed && text.lineHeight?.unit === "PIXELS") lineHeight = text.lineHeight.value;
  if (!lineHeight) {
    try {
      const segment = text.getStyledTextSegments(["lineHeight"])[0];
      if (segment?.lineHeight?.unit === "PIXELS") lineHeight = segment.lineHeight.value;
    } catch (_) {}
  }
  return {
    explicitLineCount: text.characters.split("\n").length,
    visualLineEstimate: lineHeight ? Math.max(1, Math.round(text.height / lineHeight)) : null,
    lineHeight,
    height: text.height
  };
}

const [screens, colorVariables, textStyles, availableFonts] = await Promise.all([
  Promise.all(screenIds.map(id => figma.getNodeByIdAsync(id))),
  figma.variables.getLocalVariablesAsync("COLOR"),
  figma.getLocalTextStylesAsync(),
  figma.listAvailableFontsAsync()
]);

const helperVariable = colorVariables.find(variable =>
  variable.id === helperTokenId && variable.name === "color/text/body/tertiary"
);
const helperStyle = textStyles.find(style => style.id === helperStyleId);
const noto = availableFonts.map(entry => entry.fontName).find(font =>
  font.family === "Noto Sans KR" && font.style === "Regular"
);

const preflight = [];
if (!helperVariable) preflight.push(["helper-token", helperTokenId, "missing-or-name-mismatch"]);
if (!helperStyle) {
  preflight.push(["helper-style", helperStyleId, "missing"]);
} else {
  const styleFont = helperStyle.fontName === figma.mixed ? null : helperStyle.fontName;
  if (!styleFont || styleFont.family !== "Pretendard" || styleFont.style !== "Regular" || helperStyle.name !== "body/12R") {
    preflight.push(["helper-style", helperStyleId, helperStyle.name, styleFont]);
  }
}
if (!noto) preflight.push(["font", "Noto Sans KR/Regular", "missing"]);

const plans = [];
for (let index = 0; index < screenIds.length; index++) {
  const screenId = screenIds[index];
  const screen = screens[index];
  if (!screen || screen.type !== "FRAME" || screen.width !== 360 || screen.height !== 780) {
    preflight.push([screenId, "screen", screen?.type || "missing"]);
    continue;
  }
  const contents = direct(screen, "PatternContent").filter(node => node.type === "FRAME");
  if (contents.length !== 1) {
    preflight.push([screenId, "PatternContent", contents.length]);
    continue;
  }
  const content = contents[0];
  const bodies = direct(content, "LoginBody").filter(node => node.type === "FRAME");
  if (bodies.length !== 1) {
    preflight.push([screenId, "LoginBody", bodies.length]);
    continue;
  }
  const body = bodies[0];
  const idInputs = direct(body, "Input / ID").filter(node => node.type === "INSTANCE");
  const passwordInputs = direct(body, "Input / Password").filter(node => node.type === "INSTANCE");
  const logins = direct(body, "Button / 로그인").filter(node => node.type === "INSTANCE");
  if (idInputs.length !== 1 || passwordInputs.length !== 1 || logins.length !== 1) {
    preflight.push([screenId, "root-input-login-count", idInputs.length, passwordInputs.length, logins.length]);
    continue;
  }

  const inputPlans = [];
  for (const [role, input] of [["id", idInputs[0]], ["password", passwordInputs[0]]]) {
    const fields = direct(input, "field").filter(node => node.type === "FRAME");
    if (fields.length !== 1) {
      preflight.push([screenId, role, "field-count", fields.length]);
      continue;
    }
    const field = fields[0];
    const texts = field.findAllWithCriteria({ types: ["TEXT"] }).filter(node => node.visible !== false);
    const leads = direct(field, "lead").filter(node => node.type === "FRAME");
    const trails = direct(field, "trail").filter(node => node.type === "FRAME");
    if (input.width !== 320 || input.layoutMode !== "VERTICAL" ||
        field.layoutMode !== "HORIZONTAL" || field.primaryAxisSizingMode !== "FIXED" ||
        field.counterAxisSizingMode !== "FIXED" || ![200,320].some(width => Math.abs(field.width - width) <= 1) ||
        texts.length !== 1 || leads.length > 1 || trails.length !== 1) {
      preflight.push([
        screenId, role, "input-structure", input.width, input.layoutMode,
        field.width, field.layoutMode, field.primaryAxisSizingMode, field.counterAxisSizingMode,
        texts.length, leads.length, trails.length
      ]);
      continue;
    }
    inputPlans.push({
      role, input, field, text: texts[0], lead: leads[0] || null, trail: trails[0],
      snapshot: geometry(input, screen)
    });
  }
  if (inputPlans.length !== 2) continue;

  let helper = null;
  let helperSpacer = null;
  let keyboard = null;
  if (keyboardIds.has(screenId)) {
    const helpers = direct(body, "HelperLinks").filter(node => node.type === "FRAME");
    const spacers = direct(body, "Spacer / Login-Helpers").filter(node => node.type === "FRAME");
    const keyboards = direct(content, "OS Keyboard (Placeholder)").filter(node => node.type === "FRAME");
    const phones = body.children.filter(node => node.type === "INSTANCE" && node.name.startsWith("Button / 휴대"));
    if (helpers.length > 1 || spacers.length > 1 || keyboards.length !== 1 || phones.length !== 0) {
      preflight.push([screenId, "keyboard-shell", helpers.length, spacers.length, keyboards.length, phones.length]);
      continue;
    }
    helper = helpers[0] || null;
    helperSpacer = spacers[0] || null;
    keyboard = keyboards[0];
    if (helper) {
      const texts = helper.findAllWithCriteria({ types: ["TEXT"] });
      if (texts.length !== 3 || !helperStrings.every(value => texts.some(text => text.characters === value))) {
        preflight.push([screenId, "existing-helper-texts", texts.map(text => text.characters)]);
        continue;
      }
    }
  }
  plans.push({ screenId, screen, content, body, login: logins[0], inputPlans, helper, helperSpacer, keyboard });
}

if (preflight.length || plans.length !== 13) {
  return {
    createdNodeIds: [], mutatedNodeIds: [], inputResults: [], helperResults: [],
    violations: { preflight }, counts: { planCount: plans.length, preflight: preflight.length, total: preflight.length }
  };
}

await figma.loadFontAsync(noto);
if (helperStyle.fontName !== figma.mixed) {
  await figma.loadFontAsync(helperStyle.fontName);
}
const helperPaint = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", helperVariable
);
const createdNodeIds = [];
const mutatedNodeIds = [];

for (const plan of plans) {
  for (const inputPlan of plan.inputPlans) {
    const field = inputPlan.field;
    if (Math.abs(field.width - 320) > 0.5) field.resize(320, field.height);
    field.layoutSizingHorizontal = "FILL";
    mutatedNodeIds.push(inputPlan.input.id, field.id);
  }

  if (!keyboardIds.has(plan.screenId)) continue;
  let spacer = plan.helperSpacer;
  if (!spacer) {
    spacer = figma.createFrame();
    spacer.name = "Spacer / Login-Helpers";
    createdNodeIds.push(spacer.id);
  }
  spacer.resize(320, 20);
  spacer.fills = [];
  spacer.strokes = [];

  let helper = plan.helper;
  if (!helper) {
    helper = figma.createAutoLayout("HORIZONTAL");
    helper.name = "HelperLinks";
    createdNodeIds.push(helper.id);
    for (const value of helperStrings) {
      const text = figma.createText();
      text.name = `Helper / ${value}`;
      text.fontName = noto;
      text.characters = value;
      await text.setTextStyleIdAsync(helperStyle.id);
      text.fills = [helperPaint];
      text.textAutoResize = "WIDTH_AND_HEIGHT";
      helper.appendChild(text);
      createdNodeIds.push(text.id);
    }
  }
  helper.resize(320, 20);
  helper.layoutMode = "HORIZONTAL";
  helper.primaryAxisSizingMode = "FIXED";
  helper.counterAxisSizingMode = "FIXED";
  helper.primaryAxisAlignItems = "CENTER";
  helper.counterAxisAlignItems = "CENTER";
  helper.itemSpacing = 16;
  helper.fills = [];
  helper.strokes = [];
  const helperTexts = helper.findAllWithCriteria({ types: ["TEXT"] });
  for (const text of helperTexts) {
    await text.setTextStyleIdAsync(helperStyle.id);
    text.fills = [helperPaint];
    mutatedNodeIds.push(text.id);
  }
  plan.body.appendChild(spacer);
  plan.body.appendChild(helper);
  plan.helperSpacer = spacer;
  plan.helper = helper;
  mutatedNodeIds.push(plan.body.id, spacer.id, helper.id);
}

const inputResults = [];
const helperResults = [];
const fieldViolations = [];
const helperViolations = [];
for (const plan of plans) {
  for (const item of plan.inputPlans) {
    const lead = internalGeometry(item.lead, item.field);
    const text = internalGeometry(item.text, item.field);
    const trail = internalGeometry(item.trail, item.field);
    const lines = lineMetrics(item.text);
    const outer = geometry(item.input, plan.screen);
    const field = internalGeometry(item.field, item.input);
    const result = { screenId: plan.screenId, role: item.role, outer, field, lead, text, trail, lines };
    inputResults.push(result);
    if (Math.abs(item.input.width - 320) > 0.5 || Math.abs(item.field.width - 320) > 0.5 ||
        item.field.layoutSizingHorizontal !== "FILL" || item.input.height !== item.snapshot.height ||
        Math.abs(outer.y - item.snapshot.y) > 0.5) {
      fieldViolations.push([plan.screenId, item.role, "outer-or-field", item.snapshot, outer, field]);
    }
    const trailRight = item.trail.x + item.trail.width;
    const expectedTrailRight = item.field.width - item.field.paddingRight;
    if (Math.abs(trailRight - expectedTrailRight) > 1) {
      fieldViolations.push([plan.screenId, item.role, "trail-right", expectedTrailRight, trailRight]);
    }
    if ((item.lead && item.lead.layoutSizingHorizontal !== "FILL") ||
        (!item.lead && item.text.layoutGrow !== 1) || lines.explicitLineCount !== 1 ||
        (lines.visualLineEstimate !== null && lines.visualLineEstimate !== 1) || item.text.height > 24) {
      fieldViolations.push([plan.screenId, item.role, "text-fill-or-line", lead, text, lines]);
    }
  }

  if (keyboardIds.has(plan.screenId)) {
    const texts = plan.helper.findAllWithCriteria({ types: ["TEXT"] }).slice().sort((a,b) => a.x - b.x);
    const result = {
      screenId: plan.screenId,
      spacer: geometry(plan.helperSpacer, plan.screen),
      helper: geometry(plan.helper, plan.screen),
      texts: texts.map(text => ({
        id: text.id, characters: text.characters,
        textStyleId: text.textStyleId === figma.mixed ? "mixed" : text.textStyleId,
        font: currentFonts(text).map(font => `${font.family}/${font.style}`),
        tokenId: solidTokenId(text)
      })),
      loginY: relative(plan.login, plan.screen).y,
      keyboardY: relative(plan.keyboard, plan.screen).y
    };
    helperResults.push(result);
    if (result.helper.y !== 398 || result.helper.width !== 320 || result.helper.height !== 20 ||
        result.spacer.height !== 20 || result.loginY !== 330 || result.keyboardY !== 439 ||
        result.texts.map(text => text.characters).join("|") !== helperStrings.join("|") ||
        result.texts.some(text => text.textStyleId !== helperStyleId || text.tokenId !== helperTokenId ||
          text.font.some(font => font !== "Pretendard/Regular"))) {
      helperViolations.push([plan.screenId, result]);
    }
  }
}

const requiredByScreen = {
  "1562:3":["아이디를 입력해 주세요.","비밀번호를 입력해 주세요.","로그인","휴대전화번호로 로그인"],
  "1562:4":["s1desig","비밀번호를 입력해 주세요.","로그인"],
  "1562:5":["s1design","••••••••","로그인"],
  "1562:6":["아이디를 입력해 주세요.","아이디를 정확히 입력해 주세요.","••••••••","로그인","휴대전화번호로 로그인"],
  "1562:7":["s1design","비밀번호를 입력해 주세요.","비밀번호를 정확히 입력해 주세요.","로그인","휴대전화번호로 로그인"],
  "1562:8":["s1design","••••••••","아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)","로그인","휴대전화번호로 로그인"],
  "1562:9":["s1design","••••••••","로그인","휴대전화번호로 로그인","로그인 되었습니다.","다음부터 자동으로 로그인할까요?","취소","확인"],
  "1562:10":["s1design","••••••••","로그인","휴대폰 번호로 로그인","자동 로그인 설정 되었습니다.","확인"],
  "1562:11":["s1design","••••••••","로그인","휴대폰 번호로 로그인","인증되지 않은 기기에요","서비스를 이용하시려면 본인 인증을 해 주세요. 본인 인증 시 기존 기기는 인증이 해제됩니다.","확인"],
  "1562:12":["s1design","••••••••","로그인","휴대폰 번호로 로그인","인증 완료","사용중인 기기로 인증이 완료되었습니다.\n다시 로그인 해주세요.","확인"],
  "1562:13":["s1design","••••••••","로그인","휴대폰 번호로 로그인","인증되지 않은 기기에요","에스원은 고객님의 소중한 정보를 보호하기 위해 인증 기기 등록 후 서비스를 제공하고 있습니다.\n현재 인증한 기기로 등록 후 로그인 할까요?","취소","확인"],
  "1562:14":["s1design","••••••••","로그인","휴대전화번호로 로그인"],
  "1562:15":["s1design","••••••••","로그인","휴대폰 번호로 로그인"]
};

const raw = [];
const overflow = [];
const missingText = [];
const provenance = [];
const positionViolations = [];
const positions = [];
let checkedCount = 0;
let remoteCount = 0;
let localCount = 0;

for (const plan of plans) {
  walkAuthored(plan.screen, (node, visible) => {
    if (!visible || node.type === "INSTANCE") return;
    for (const property of ["fills","strokes"]) {
      if (!(property in node) || !Array.isArray(node[property])) continue;
      for (const paint of node[property]) {
        if (paint.type === "SOLID" && paint.visible !== false && !paint.boundVariables?.color) {
          raw.push([plan.screenId,node.id,node.name,property]);
        }
      }
    }
  });

  const strings = [];
  const instances = [];
  walk(plan.screen, (node, visible) => {
    if (node.type === "INSTANCE") instances.push(node);
    if (node.type === "TEXT" && visible) strings.push(node.characters);
    if (!visible || node === plan.screen || !("absoluteBoundingBox" in node) || !plan.screen.absoluteBoundingBox) return;
    const box = node.absoluteBoundingBox;
    const bounds = plan.screen.absoluteBoundingBox;
    if (box && (box.x < bounds.x - 0.5 || box.y < bounds.y - 0.5 ||
        box.x + box.width > bounds.x + bounds.width + 0.5 ||
        box.y + box.height > bounds.y + bounds.height + 0.5)) {
      overflow.push([plan.screenId,node.id,node.name,box.x,box.y,box.width,box.height]);
    }
  });
  const required = [...requiredByScreen[plan.screenId], ...helperStrings];
  if (!keyboardIds.has(plan.screenId)) required.push("이용약관","개인정보처리방침","영상정보처리방침");
  const missing = [...new Set(required.filter(value => !strings.includes(value)))];
  if (missing.length) missingText.push([plan.screenId,missing]);

  const mains = await Promise.all(instances.map(instance => instance.getMainComponentAsync()));
  for (let index = 0; index < instances.length; index++) {
    checkedCount += 1;
    const main = mains[index];
    if (main?.remote === true) remoteCount += 1;
    else if (main) localCount += 1;
    if (!main || (main.remote === true && !allowedKeys.has(main.key || ""))) {
      provenance.push([plan.screenId,instances[index].id,instances[index].name,main?.id || null,main?.key || null,main?.remote ?? null]);
    }
  }

  const authored = [];
  walkAuthored(plan.screen, node => authored.push(node));
  const exact = name => authored.find(node => node.name === name) || null;
  const prefix = name => authored.find(node => node.name.startsWith(name)) || null;
  const position = {
    screenId: plan.screenId,
    id: geometry(exact("Input / ID"), plan.screen),
    password: geometry(exact("Input / Password"), plan.screen),
    login: geometry(exact("Button / 로그인"), plan.screen),
    helper: geometry(exact("HelperLinks"), plan.screen),
    phone: geometry(prefix("Button / 휴대"), plan.screen),
    keyboard: geometry(exact("OS Keyboard (Placeholder)"), plan.screen),
    footer: geometry(exact("Footer / Mobile"), plan.screen),
    modal: geometry(prefix("Modal /"), plan.screen)
  };
  positions.push(position);
  const expectedPasswordY = plan.screenId === "1562:6" ? 286 : 248;
  const expectedLoginY = errorIds.has(plan.screenId) ? 368 : 330;
  const expectedHelperY = errorIds.has(plan.screenId) ? 436 : 398;
  const expectedPhoneY = errorIds.has(plan.screenId) ? 479 : 441;
  const checks = [
    ["id",position.id?.y,188],["password",position.password?.y,expectedPasswordY],
    ["login",position.login?.y,expectedLoginY],["helper",position.helper?.y,expectedHelperY]
  ];
  if (keyboardIds.has(plan.screenId)) checks.push(["keyboard",position.keyboard?.y,439],["phone",position.phone,null],["footer",position.footer,null]);
  else checks.push(["phone",position.phone?.y,expectedPhoneY],["footer",position.footer?.y,683],["keyboard",position.keyboard,null]);
  if (modalIds.has(plan.screenId)) {
    const center = position.modal ? position.modal.y + position.modal.height / 2 : null;
    checks.push(["modal-center",center,367.5]);
  } else checks.push(["modal",position.modal,null]);
  for (const [role, actual, expected] of checks) {
    const matches = expected === null ? actual === null : actual !== null && Math.abs(actual - expected) <= 1;
    if (!matches) positionViolations.push([plan.screenId,role,expected,actual]);
  }
}

const violations = {
  preflight: [], field: fieldViolations, helper: helperViolations,
  position: positionViolations, raw, overflow, missingText, provenance
};
const total = Object.values(violations).reduce((sum, list) => sum + list.length, 0);
return {
  createdNodeIds: [...new Set(createdNodeIds)],
  mutatedNodeIds: [...new Set(mutatedNodeIds)],
  inputResults, helperResults, positions,
  provenance: { checkedCount, remoteCount, localCount, disallowedCount: provenance.length },
  violations,
  counts: {
    screenCount: plans.length, inputCount: inputResults.length, keyboardHelperCount: helperResults.length,
    raw: raw.length, overflow: overflow.length, missingText: missingText.length,
    provenance: provenance.length, field: fieldViolations.length,
    helper: helperViolations.length, position: positionViolations.length, total
  }
};
