const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") throw new Error("Target page 173:2431 not found");
await figma.setCurrentPageAsync(page);

const ids = {
  section: "1562:2",
  screens: ["1562:3", "1562:4", "1562:5", "1562:6", "1562:7"],
  statusBarApp: "1545:6510",
  navBarApp: "1545:6628",
  ciS1Blue: "1545:6711",
  footerMobile: "1545:6818",
  buttonPrimaryDefault: "1545:8170",
  buttonPrimaryDisabled: "1545:8176",
  buttonSecondaryDefault: "1545:8202",
  inputDefault: "1546:10603",
  inputFilled: "1546:10655",
  inputEditing: "1546:10715",
  inputError: "1546:10803"
};

const resolved = await Promise.all(
  Object.entries(ids)
    .filter(([, value]) => typeof value === "string")
    .map(async ([key, id]) => [key, await figma.getNodeByIdAsync(id)])
);
const nodes = Object.fromEntries(resolved);
const screens = await Promise.all(ids.screens.map(id => figma.getNodeByIdAsync(id)));

if (!nodes.section || nodes.section.type !== "SECTION") {
  throw new Error("Pattern Section missing: 1562:2");
}
for (const screen of screens) {
  if (!screen || screen.type !== "FRAME" || screen.width !== 360 || screen.height !== 780) {
    throw new Error(`Invalid screen frame: ${screen?.id || "missing"}`);
  }
}

const componentKeys = Object.keys(nodes).filter(key => key !== "section");
for (const key of componentKeys) {
  const component = nodes[key];
  if (!component || component.type !== "COMPONENT") {
    throw new Error(`Canonical component invalid: ${key}`);
  }
  if (component.remote !== false) {
    throw new Error(`Canonical component must be local: ${key} / ${component.id}`);
  }
  if (!component.parent || component.parent.type !== "COMPONENT_SET" || component.parent.remote !== false) {
    throw new Error(`Canonical parent set must be local: ${key} / ${component.id}`);
  }
}

const [colorVariables, textStyles, availableFonts] = await Promise.all([
  figma.variables.getLocalVariablesAsync("COLOR"),
  figma.getLocalTextStylesAsync(),
  figma.listAvailableFontsAsync()
]);

function findColor(name, fallbackNames = []) {
  const candidates = [name, ...fallbackNames];
  const variable = colorVariables.find(v =>
    candidates.some(candidate =>
      v.name === candidate || v.name.endsWith(`/${candidate}`)
    )
  );
  if (!variable) throw new Error(`Semantic color variable missing: ${name}`);
  return variable;
}

const textTertiary = findColor("color/text/body/tertiary");
const keyboardSurface = findColor(
  "color/bg/level-1",
  ["color/bg/level-0", "color/bg/level-2"]
);

const tertiaryPaint = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
  "color",
  textTertiary
);
const keyboardPaint = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
  "color",
  keyboardSurface
);

const noto = availableFonts
  .map(entry => entry.fontName)
  .find(font => font.family === "Noto Sans KR" && font.style === "Regular");
if (!noto) throw new Error("Noto Sans KR Regular is unavailable");
await figma.loadFontAsync(noto);

const pretendardBodyStyles = textStyles.filter(style => {
  const family = style.fontName && style.fontName !== figma.mixed
    ? style.fontName.family
    : "";
  const name = style.name.toLowerCase();
  return family.toLowerCase().includes("pretendard") &&
    name.includes("body") &&
    style.fontName.style === "Regular";
});
if (pretendardBodyStyles.length === 0) {
  throw new Error("Pretendard body Regular text style missing");
}
const helperTextStyle = pretendardBodyStyles
  .slice()
  .sort((a, b) =>
    Math.abs(Number(a.fontSize) - 12) - Math.abs(Number(b.fontSize) - 12)
  )[0];

const textPreflight = [
  { component: nodes.inputDefault, expected: { "입력": 1 } },
  { component: nodes.inputFilled, expected: { "텍스트": 1 } },
  { component: nodes.inputEditing, expected: { "텍스트": 1 } },
  { component: nodes.inputError, expected: { "텍스트": 1, "안내 메세지": 1 } },
  { component: nodes.buttonPrimaryDisabled, expected: { "버튼": 1 } },
  { component: nodes.buttonPrimaryDefault, expected: { "버튼": 1 } },
  { component: nodes.buttonSecondaryDefault, expected: { "버튼": 1 } }
];

for (const check of textPreflight) {
  const texts = check.component.findAllWithCriteria({ types: ["TEXT"] });
  const expectedTotal = Object.values(check.expected).reduce((sum, count) => sum + count, 0);
  if (texts.length !== expectedTotal) {
    throw new Error(
      `Unexpected TEXT count: ${check.component.id} / expected ${expectedTotal}, received ${texts.length}`
    );
  }
  for (const [name, expectedCount] of Object.entries(check.expected)) {
    const actualCount = texts.filter(text => text.name === name).length;
    if (actualCount !== expectedCount) {
      throw new Error(
        `Expected TEXT descendant missing: ${check.component.id} / ${name} / expected ${expectedCount}, received ${actualCount}`
      );
    }
  }
}

const passwordDefinitionEntry = Object.entries(
  nodes.inputDefault.parent.componentPropertyDefinitions || {}
).find(([key, definition]) =>
  definition.type === "BOOLEAN" &&
  /(password\s*icon|비밀번호)/i.test(key)
);
const passwordPropertyKey = passwordDefinitionEntry?.[0] || null;

const plans = [
  {
    screen: screens[0],
    keyboard: false,
    idComponent: nodes.inputDefault,
    idTextName: "입력",
    idText: "아이디를 입력해 주세요.",
    passwordComponent: nodes.inputDefault,
    passwordTextName: "입력",
    passwordText: "비밀번호를 입력해 주세요.",
    passwordMessage: null,
    passwordIcon: true,
    primaryComponent: nodes.buttonPrimaryDisabled,
    phoneText: "휴대전화번호로 로그인"
  },
  {
    screen: screens[1],
    keyboard: true,
    idComponent: nodes.inputEditing,
    idTextName: "텍스트",
    idText: "s1desig",
    passwordComponent: nodes.inputDefault,
    passwordTextName: "입력",
    passwordText: "비밀번호를 입력해 주세요.",
    passwordMessage: null,
    passwordIcon: true,
    primaryComponent: nodes.buttonPrimaryDefault,
    phoneText: null
  },
  {
    screen: screens[2],
    keyboard: true,
    idComponent: nodes.inputFilled,
    idTextName: "텍스트",
    idText: "s1design",
    passwordComponent: nodes.inputEditing,
    passwordTextName: "텍스트",
    passwordText: "••••••••",
    passwordMessage: null,
    passwordIcon: true,
    primaryComponent: nodes.buttonPrimaryDefault,
    phoneText: null
  },
  {
    screen: screens[3],
    keyboard: false,
    idComponent: nodes.inputError,
    idTextName: "텍스트",
    idText: "아이디를 입력해 주세요.",
    idMessage: "아이디를 정확히 입력해 주세요.",
    passwordComponent: nodes.inputFilled,
    passwordTextName: "텍스트",
    passwordText: "••••••••",
    passwordMessage: null,
    passwordIcon: true,
    primaryComponent: nodes.buttonPrimaryDefault,
    phoneText: "휴대전화번호로 로그인"
  },
  {
    screen: screens[4],
    keyboard: false,
    idComponent: nodes.inputFilled,
    idTextName: "텍스트",
    idText: "s1design",
    idMessage: null,
    passwordComponent: nodes.inputError,
    passwordTextName: "텍스트",
    passwordText: "비밀번호를 입력해 주세요.",
    passwordMessage: "비밀번호를 정확히 입력해 주세요.",
    passwordIcon: true,
    primaryComponent: nodes.buttonPrimaryDefault,
    phoneText: "휴대전화번호로 로그인"
  }
];

const createdNodeIds = [];
const mutatedNodeIds = [];
const skippedScreenIds = [];
const builtScreenIds = [];
const authoredTextIds = [];
const instanceNodes = [];

function track(node) {
  createdNodeIds.push(node.id);
  return node;
}

function fixedAutoLayout(direction, name, width, height) {
  const frame = track(figma.createAutoLayout(direction));
  frame.name = name;
  frame.resize(width, height);
  frame.primaryAxisSizingMode = "FIXED";
  frame.counterAxisSizingMode = "FIXED";
  frame.fills = [];
  return frame;
}

function createInstance(component, name, width = null) {
  const instance = track(component.createInstance());
  instance.name = name;
  if (width !== null) instance.resize(width, instance.height);
  instanceNodes.push(instance);
  return instance;
}

async function overrideInstanceText(instance, textName, characters) {
  const matches = instance
    .findAllWithCriteria({ types: ["TEXT"] })
    .filter(text => text.name === textName);
  if (matches.length !== 1) {
    throw new Error(
      `Expected one instance TEXT: ${instance.id} / ${textName} / received ${matches.length}`
    );
  }

  const text = matches[0];
  const segments = text.getStyledTextSegments(["fontName"]);
  const fonts = [...new Map(
    segments.map(segment => [
      `${segment.fontName.family}::${segment.fontName.style}`,
      segment.fontName
    ])
  ).values()];
  await Promise.all(fonts.map(font => figma.loadFontAsync(font)));
  text.characters = characters;
  mutatedNodeIds.push(text.id);
  return text;
}

async function createHelperText(text) {
  const node = track(figma.createText());
  node.name = `Helper / ${text}`;
  node.fontName = noto;
  node.characters = text;
  await node.setTextStyleIdAsync(helperTextStyle.id);
  node.fills = [tertiaryPaint];
  node.textAutoResize = "WIDTH_AND_HEIGHT";
  authoredTextIds.push(node.id);
  return node;
}

for (const plan of plans) {
  const alreadyBuilt = plan.screen.children.some(
    child => child.type === "FRAME" && child.name === "PatternContent"
  );
  if (alreadyBuilt) {
    skippedScreenIds.push(plan.screen.id);
    continue;
  }

  const content = fixedAutoLayout("VERTICAL", "PatternContent", 360, 780);
  content.itemSpacing = 0;
  content.counterAxisAlignItems = "CENTER";
  plan.screen.appendChild(content);
  content.x = 0;
  content.y = 0;
  mutatedNodeIds.push(plan.screen.id);

  const status = createInstance(nodes.statusBarApp, "StatusBar / App", 360);
  content.appendChild(status);

  const bodyHeight = plan.keyboard ? 412 : 656;
  const body = fixedAutoLayout("VERTICAL", "LoginBody", 360, bodyHeight);
  body.counterAxisAlignItems = "CENTER";
  body.primaryAxisAlignItems = "MIN";
  body.itemSpacing = 10;
  body.paddingLeft = 20;
  body.paddingRight = 20;
  body.paddingTop = plan.keyboard ? 36 : 54;
  content.appendChild(body);

  const logoSlot = fixedAutoLayout(
    "HORIZONTAL",
    "LogoSlot",
    320,
    plan.keyboard ? 72 : 90
  );
  logoSlot.primaryAxisAlignItems = "CENTER";
  logoSlot.counterAxisAlignItems = "CENTER";
  body.appendChild(logoSlot);

  const ci = createInstance(nodes.ciS1Blue, "CI / 에스원 / Blue");
  logoSlot.appendChild(ci);

  const idInput = createInstance(plan.idComponent, "Input / ID", 320);
  body.appendChild(idInput);
  await overrideInstanceText(idInput, plan.idTextName, plan.idText);
  if (plan.idMessage) {
    await overrideInstanceText(idInput, "안내 메세지", plan.idMessage);
  }

  const passwordInput = createInstance(plan.passwordComponent, "Input / Password", 320);
  if (plan.passwordIcon && passwordPropertyKey) {
    passwordInput.setProperties({ [passwordPropertyKey]: true });
  }
  body.appendChild(passwordInput);
  await overrideInstanceText(
    passwordInput,
    plan.passwordTextName,
    plan.passwordText
  );
  if (plan.passwordMessage) {
    await overrideInstanceText(
      passwordInput,
      "안내 메세지",
      plan.passwordMessage
    );
  }

  const loginButton = createInstance(plan.primaryComponent, "Button / 로그인", 320);
  body.appendChild(loginButton);
  await overrideInstanceText(loginButton, "버튼", "로그인");

  if (!plan.keyboard) {
    const helperRow = fixedAutoLayout("HORIZONTAL", "HelperLinks", 320, 20);
    helperRow.primaryAxisAlignItems = "CENTER";
    helperRow.counterAxisAlignItems = "CENTER";
    helperRow.itemSpacing = 16;
    body.appendChild(helperRow);

    const helperTexts = await Promise.all([
      createHelperText("회원가입"),
      createHelperText("아이디 찾기"),
      createHelperText("비밀번호 찾기")
    ]);
    for (const helperText of helperTexts) helperRow.appendChild(helperText);

    const phoneButton = createInstance(
      nodes.buttonSecondaryDefault,
      "Button / 휴대전화번호 로그인",
      320
    );
    body.appendChild(phoneButton);
    await overrideInstanceText(phoneButton, "버튼", plan.phoneText);

    const footer = createInstance(nodes.footerMobile, "Footer / Mobile");
    content.appendChild(footer);
  } else {
    const keyboard = track(figma.createFrame());
    keyboard.name = "OS Keyboard (Placeholder)";
    keyboard.resize(360, 296);
    keyboard.fills = [keyboardPaint];
    keyboard.strokes = [];
    content.appendChild(keyboard);
  }

  const nav = createInstance(nodes.navBarApp, "NavBar / App", 360);
  content.appendChild(nav);

  builtScreenIds.push(plan.screen.id);
}

const provenance = await Promise.all(
  instanceNodes.map(async instance => {
    const main = await instance.getMainComponentAsync();
    if (!main) throw new Error(`Instance main component missing: ${instance.id}`);
    if (main.remote !== false) {
      throw new Error(`External component detected: ${instance.id} → ${main.id}`);
    }
    return {
      instanceId: instance.id,
      instanceName: instance.name,
      mainComponentId: main.id,
      mainComponentName: main.name,
      remote: main.remote,
      variantProperties: instance.variantProperties
    };
  })
);

function collectAuthored(node, output) {
  output.push(node);
  if (!("children" in node)) return;
  for (const child of node.children) {
    if (child.type === "INSTANCE") continue;
    collectAuthored(child, output);
  }
}

const authoredNodes = [];
for (const plan of plans) {
  collectAuthored(plan.screen, authoredNodes);
}
const rawSolidViolations = [];
for (const node of authoredNodes) {
  if (!("fills" in node) || !Array.isArray(node.fills)) continue;
  for (const paint of node.fills) {
    if (
      paint.type === "SOLID" &&
      paint.visible !== false &&
      !paint.boundVariables?.color
    ) {
      rawSolidViolations.push({
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type
      });
    }
  }
}
if (rawSolidViolations.length > 0) {
  throw new Error(
    `Raw authored SOLID fills detected: ${JSON.stringify(rawSolidViolations)}`
  );
}

return {
  createdNodeIds,
  mutatedNodeIds: [...new Set(mutatedNodeIds)],
  builtScreenIds,
  skippedScreenIds,
  authoredTextIds,
  rawSolidViolationCount: rawSolidViolations.length,
  passwordPropertyKey,
  textStyleIds: {
    helper: {
      id: helperTextStyle.id,
      name: helperTextStyle.name,
      fontName: helperTextStyle.fontName,
      fontSize: helperTextStyle.fontSize
    }
  },
  tokenIds: {
    helperText: {
      id: textTertiary.id,
      key: textTertiary.key,
      name: textTertiary.name
    },
    keyboardSurface: {
      id: keyboardSurface.id,
      key: keyboardSurface.key,
      name: keyboardSurface.name
    }
  },
  provenance
};
