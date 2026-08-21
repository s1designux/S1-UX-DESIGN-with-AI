const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") throw new Error("Target page 173:2431 not found");
await figma.setCurrentPageAsync(page);

const ids = {
  section: "1562:2",
  screens: ["1562:8", "1562:9", "1562:10", "1562:11", "1562:12"],
  statusBarApp: "1545:6510",
  navBarApp: "1545:6628",
  ciS1Blue: "1545:6711",
  footerMobile: "1545:6818",
  buttonPrimaryDefault: "1545:8170",
  buttonSecondaryDefault: "1545:8202",
  inputFilled: "1546:10655",
  inputError: "1546:10803",
  modalSingle: "1546:17945",
  modalDual: "1546:17957"
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
const overlayToken = findColor("color/overlay");
const tertiaryPaint = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
  "color",
  textTertiary
);
const overlayPaint = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
  "color",
  overlayToken
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
  { component: nodes.inputFilled, expected: { "텍스트": 1 } },
  { component: nodes.inputError, expected: { "텍스트": 1, "안내 메세지": 1 } },
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

function validateModalComponent(component, requiredButtonInstances) {
  const directTexts = component.findAllWithCriteria({ types: ["TEXT"] });
  for (const name of ["title", "message"]) {
    const count = directTexts.filter(text => text.name === name).length;
    if (count !== 1) {
      throw new Error(
        `Modal direct TEXT invalid: ${component.id} / ${name} / expected 1, received ${count}`
      );
    }
  }

  const nestedInstances = component.findAllWithCriteria({ types: ["INSTANCE"] });
  for (const instanceName of requiredButtonInstances) {
    const buttonInstances = nestedInstances.filter(instance => instance.name === instanceName);
    if (buttonInstances.length !== 1) {
      throw new Error(
        `Modal nested button instance invalid: ${component.id} / ${instanceName} / expected 1, received ${buttonInstances.length}`
      );
    }
    const buttonTexts = buttonInstances[0]
      .findAllWithCriteria({ types: ["TEXT"] })
      .filter(text => text.name === "버튼");
    if (buttonTexts.length !== 1) {
      throw new Error(
        `Modal nested button TEXT invalid: ${component.id} / ${instanceName} / expected 1, received ${buttonTexts.length}`
      );
    }
  }
}

validateModalComponent(nodes.modalSingle, ["primary"]);
validateModalComponent(nodes.modalDual, ["secondary", "primary"]);

const passwordDefinitionEntry = Object.entries(
  nodes.inputFilled.parent.componentPropertyDefinitions || {}
).find(([key, definition]) =>
  definition.type === "BOOLEAN" &&
  /(password\s*icon|비밀번호)/i.test(key)
);
const passwordPropertyKey = passwordDefinitionEntry?.[0] || null;

const plans = [
  {
    screen: screens[0],
    idText: "s1design",
    passwordComponent: nodes.inputError,
    passwordText: "••••••••",
    passwordMessage: "아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)",
    phoneText: "휴대전화번호로 로그인",
    modalComponent: null,
    modalTitle: null,
    modalMessage: null,
    modalButtons: []
  },
  {
    screen: screens[1],
    idText: "s1design",
    passwordComponent: nodes.inputFilled,
    passwordText: "••••••••",
    passwordMessage: null,
    phoneText: "휴대전화번호로 로그인",
    modalComponent: nodes.modalDual,
    modalTitle: "로그인 되었습니다.",
    modalMessage: "다음부터 자동으로 로그인할까요?",
    modalButtons: ["취소", "확인"]
  },
  {
    screen: screens[2],
    idText: "s1design",
    passwordComponent: nodes.inputFilled,
    passwordText: "••••••••",
    passwordMessage: null,
    phoneText: "휴대폰 번호로 로그인",
    modalComponent: nodes.modalSingle,
    modalTitle: "자동 로그인 설정 되었습니다.",
    modalMessage: "",
    modalButtons: ["확인"]
  },
  {
    screen: screens[3],
    idText: "s1design",
    passwordComponent: nodes.inputFilled,
    passwordText: "••••••••",
    passwordMessage: null,
    phoneText: "휴대폰 번호로 로그인",
    modalComponent: nodes.modalSingle,
    modalTitle: "인증되지 않은 기기에요",
    modalMessage: "서비스를 이용하시려면 본인 인증을 해 주세요. 본인 인증 시 기존 기기는 인증이 해제됩니다.",
    modalButtons: ["확인"]
  },
  {
    screen: screens[4],
    idText: "s1design",
    passwordComponent: nodes.inputFilled,
    passwordText: "••••••••",
    passwordMessage: null,
    phoneText: "휴대폰 번호로 로그인",
    modalComponent: nodes.modalSingle,
    modalTitle: "인증 완료",
    modalMessage: "사용중인 기기로 인증이 완료되었습니다.\n다시 로그인 해주세요.",
    modalButtons: ["확인"]
  }
];

const createdNodeIds = [];
const mutatedNodeIds = [];
const skippedScreenIds = [];
const builtScreenIds = [];
const authoredTextIds = [];
const builtContentRoots = [];
const modalTexts = [];

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
  return instance;
}

async function overrideInstanceText(instance, textName, characters, occurrence = 0) {
  let matches = instance
    .findAllWithCriteria({ types: ["TEXT"] })
    .filter(text => text.name === textName)
    .sort((a, b) => (a.y - b.y) || (a.x - b.x));

  if (matches.length <= occurrence && textName === "버튼") {
    const rank = { secondary: 0, primary: 1 };
    const nestedButtons = instance
      .findAllWithCriteria({ types: ["INSTANCE"] })
      .filter(nested => nested.name === "secondary" || nested.name === "primary")
      .sort((a, b) => {
        const rankDifference = rank[a.name] - rank[b.name];
        return rankDifference || (a.x - b.x) || (a.y - b.y);
      });

    matches = [];
    for (const nested of nestedButtons) {
      const nestedTexts = nested
        .findAllWithCriteria({ types: ["TEXT"] })
        .filter(text => text.name === "버튼")
        .sort((a, b) => (a.y - b.y) || (a.x - b.x));
      matches.push(...nestedTexts);
    }
  }

  if (matches.length <= occurrence) {
    throw new Error(
      `Instance TEXT missing: ${instance.id} / ${textName}[${occurrence}] / received ${matches.length}`
    );
  }

  const text = matches[occurrence];
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
  builtContentRoots.push(content);

  const status = createInstance(nodes.statusBarApp, "StatusBar / App", 360);
  content.appendChild(status);

  const body = fixedAutoLayout("VERTICAL", "LoginBody", 360, 656);
  body.counterAxisAlignItems = "CENTER";
  body.primaryAxisAlignItems = "MIN";
  body.itemSpacing = 10;
  body.paddingLeft = 20;
  body.paddingRight = 20;
  body.paddingTop = 54;
  content.appendChild(body);

  const logoSlot = fixedAutoLayout("HORIZONTAL", "LogoSlot", 320, 90);
  logoSlot.primaryAxisAlignItems = "CENTER";
  logoSlot.counterAxisAlignItems = "CENTER";
  body.appendChild(logoSlot);

  const ci = createInstance(nodes.ciS1Blue, "CI / 에스원 / Blue");
  logoSlot.appendChild(ci);

  const idInput = createInstance(nodes.inputFilled, "Input / ID", 320);
  body.appendChild(idInput);
  await overrideInstanceText(idInput, "텍스트", plan.idText);

  const passwordInput = createInstance(plan.passwordComponent, "Input / Password", 320);
  if (passwordPropertyKey) {
    passwordInput.setProperties({ [passwordPropertyKey]: true });
  }
  body.appendChild(passwordInput);
  await overrideInstanceText(passwordInput, "텍스트", plan.passwordText);
  if (plan.passwordMessage) {
    await overrideInstanceText(passwordInput, "안내 메세지", plan.passwordMessage);
  }

  const loginButton = createInstance(nodes.buttonPrimaryDefault, "Button / 로그인", 320);
  body.appendChild(loginButton);
  await overrideInstanceText(loginButton, "버튼", "로그인");

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
    `Button / ${plan.phoneText}`,
    320
  );
  body.appendChild(phoneButton);
  await overrideInstanceText(phoneButton, "버튼", plan.phoneText);

  const footer = createInstance(nodes.footerMobile, "Footer / Mobile");
  content.appendChild(footer);

  const nav = createInstance(nodes.navBarApp, "NavBar / App", 360);
  content.appendChild(nav);

  if (plan.modalComponent) {
    const overlay = fixedAutoLayout("VERTICAL", "ModalOverlay", 360, 735);
    overlay.primaryAxisAlignItems = "CENTER";
    overlay.counterAxisAlignItems = "CENTER";
    overlay.fills = [overlayPaint];
    content.appendChild(overlay);
    overlay.layoutPositioning = "ABSOLUTE";
    overlay.x = 0;
    overlay.y = 0;

    const modal = createInstance(plan.modalComponent, "Modal / Login Notice");
    overlay.appendChild(modal);
    await overrideInstanceText(modal, "title", plan.modalTitle);
    await overrideInstanceText(modal, "message", plan.modalMessage);
    for (let index = 0; index < plan.modalButtons.length; index++) {
      await overrideInstanceText(modal, "버튼", plan.modalButtons[index], index);
    }
    modalTexts.push({
      screenId: plan.screen.id,
      modalInstanceId: modal.id,
      title: plan.modalTitle,
      message: plan.modalMessage,
      buttons: plan.modalButtons
    });
  }

  builtScreenIds.push(plan.screen.id);
}

const allInstanceNodes = [];
for (const root of builtContentRoots) {
  allInstanceNodes.push(...root.findAllWithCriteria({ types: ["INSTANCE"] }));
}
const uniqueInstances = [...new Map(allInstanceNodes.map(instance => [instance.id, instance])).values()];
const allowedRemoteKeys = new Set([
  "24b2df622d341e0af21cd4b23b4a7d23b97a5ea7",
  "5ab251e0d90adb555ee2fa316f84e86041f19916",
  "6b764af642b8883e892754281950da0e971224d7",
  "ca1d043ac09be07f827e939be3d8c3c7af8a8dd9",
  "ea0ffc118c38048f2cdfb5620be31c120426bb7a",
  "5157e9edc76358e2e6bc1a5ebc1539ccf5f2e787",
  "a423e2e05cfff2f93062d6a83d6f3bdf79ca9647",
  "e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581",
  "dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2",
  "6bf422c937034ce15f6814e5c430d8f85953ed4e",
  "c99f913689cd068deb2a5499154fed423ec9579f",
  "2a1abbd3597b536e34fd9523fb61eade3afe9934",
  "d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7",
  "b130623bad9bf035e273501b404bf7a245af1460",
  "606d0de897175059f133427bf62bb3635d18a860",
  "28aa6b1615f3afb29ff22cf2767f0c771c941fdc",
  "b3ccc4b275de6aac8e3940df2ae97fbb00168624",
  "e9a3d9b7e0c60b93fc10e2f6485ab77bd06329f0",
  "617757d927a1bae7df6ccdf0d24cc0e3c5a04255"
]);

const provenance = await Promise.all(
  uniqueInstances.map(async instance => {
    const main = await instance.getMainComponentAsync();
    if (!main) throw new Error(`Instance main component missing: ${instance.id}`);
    const allowed = main.remote === false || allowedRemoteKeys.has(main.key);
    if (!allowed) {
      throw new Error(
        `External component detected: ${instance.id} → ${main.id} / key=${main.key}`
      );
    }
    return {
      instanceId: instance.id,
      instanceName: instance.name,
      mainComponentId: main.id,
      mainComponentName: main.name,
      mainComponentKey: main.key,
      remote: main.remote,
      allowed,
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

const completeCreatedNodeIds = new Set(createdNodeIds);
for (const root of builtContentRoots) {
  completeCreatedNodeIds.add(root.id);
  for (const node of root.findAll(() => true)) completeCreatedNodeIds.add(node.id);
}

return {
  createdNodeIds: [...completeCreatedNodeIds],
  mutatedNodeIds: [...new Set(mutatedNodeIds)],
  builtScreenIds,
  skippedScreenIds,
  authoredTextIds,
  modalTexts,
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
    overlay: {
      id: overlayToken.id,
      key: overlayToken.key,
      name: overlayToken.name
    }
  },
  provenance
};
