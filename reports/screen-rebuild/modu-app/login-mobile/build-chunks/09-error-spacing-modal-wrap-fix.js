const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") {
  return { mutatedNodeIds: [], violations: [{ type: "page", message: "Page 173:2431 missing" }] };
}
await figma.setCurrentPageAsync(page);

const specs = {
  idError: {
    screenId: "1562:6",
    spacerName: "Spacer / ID-Password",
    spacerHeight: 28,
    expected: { id: 188, password: 286, login: 368, helper: 436, phone: 479 }
  },
  passwordError: {
    screenId: "1562:7",
    spacerName: "Spacer / Password-Login",
    spacerHeight: 50,
    expected: { id: 188, password: 248, login: 368, helper: 436, phone: 479 }
  }
};

const modalTextSpecs = [
  {
    screenId: "1562:11",
    textId: "I1566:638;1546:17953",
    expected: "서비스를 이용하시려면 본인 인증을 해 주세요. 본인 인증 시 기존 기기는 인증이 해제됩니다."
  },
  {
    screenId: "1562:13",
    textId: "I1567:723;1546:17965",
    expected: "에스원은 고객님의 소중한 정보를 보호하기 위해 인증 기기 등록 후 서비스를 제공하고 있습니다.\n현재 인증한 기기로 등록 후 로그인 할까요?"
  }
];

function direct(parent, name) {
  return parent.children.filter(child => child.name === name);
}

function findAncestor(node, predicate) {
  let current = node.parent;
  while (current) {
    if (predicate(current)) return current;
    current = current.parent;
  }
  return null;
}

function relativeY(node, screen) {
  let y = node.y;
  let parent = node.parent;
  while (parent && parent !== screen) {
    if ("y" in parent) y += parent.y;
    parent = parent.parent;
  }
  return y;
}

function geometry(node, screen = null) {
  return {
    id: node?.id || null,
    name: node?.name || null,
    x: node?.x ?? null,
    y: node ? (screen ? relativeY(node, screen) : node.y) : null,
    width: node?.width ?? null,
    height: node?.height ?? null
  };
}

function walk(node, visitor, visible = true, stopAtInstance = false) {
  const nowVisible = visible && (typeof node.visible !== "boolean" || node.visible !== false);
  visitor(node, nowVisible);
  if (!("children" in node) || (stopAtInstance && node.type === "INSTANCE")) return;
  for (const child of node.children) walk(child, visitor, nowVisible, stopAtInstance);
}

const preflightViolations = [];
const spacingTargets = [];

for (const entry of Object.values(specs)) {
  const screen = await figma.getNodeByIdAsync(entry.screenId);
  if (!screen || screen.type !== "FRAME") {
    preflightViolations.push({ type: "screen", screenId: entry.screenId });
    continue;
  }
  const contents = direct(screen, "PatternContent");
  if (contents.length !== 1 || contents[0].type !== "FRAME") {
    preflightViolations.push({ type: "content", screenId: entry.screenId, actual: contents.length });
    continue;
  }
  const bodies = direct(contents[0], "LoginBody");
  if (bodies.length !== 1 || bodies[0].type !== "FRAME") {
    preflightViolations.push({ type: "body", screenId: entry.screenId, actual: bodies.length });
    continue;
  }
  const body = bodies[0];
  const spacers = direct(body, entry.spacerName);
  const idInputs = direct(body, "Input / ID");
  const passwordInputs = direct(body, "Input / Password");
  const logins = direct(body, "Button / 로그인");
  const helpers = direct(body, "HelperLinks");
  const phones = body.children.filter(
    child => child.type === "INSTANCE" && child.name.startsWith("Button / 휴대")
  );
  const checks = [
    ["spacer", spacers],
    ["id", idInputs],
    ["password", passwordInputs],
    ["login", logins],
    ["helper", helpers],
    ["phone", phones]
  ];
  let valid = true;
  for (const [name, nodes] of checks) {
    if (nodes.length !== 1) {
      preflightViolations.push({ type: "child", screenId: entry.screenId, name, actual: nodes.length });
      valid = false;
    }
  }
  if (!valid) continue;

  spacingTargets.push({
    ...entry,
    screen,
    body,
    spacer: spacers[0],
    idInput: idInputs[0],
    passwordInput: passwordInputs[0],
    login: logins[0],
    helper: helpers[0],
    phone: phones[0]
  });
}

const modalTargets = [];
for (const entry of modalTextSpecs) {
  const [screen, text] = await Promise.all([
    figma.getNodeByIdAsync(entry.screenId),
    figma.getNodeByIdAsync(entry.textId)
  ]);
  if (!screen || screen.type !== "FRAME") {
    preflightViolations.push({ type: "modal-screen", screenId: entry.screenId });
    continue;
  }
  if (!text || text.type !== "TEXT") {
    preflightViolations.push({ type: "modal-text", screenId: entry.screenId, textId: entry.textId });
    continue;
  }
  if (text.name !== "message") {
    preflightViolations.push({ type: "modal-text-name", screenId: entry.screenId, expected: "message", actual: text.name });
    continue;
  }
  if (text.characters !== entry.expected) {
    preflightViolations.push({ type: "modal-text-content", screenId: entry.screenId, expected: entry.expected, actual: text.characters });
    continue;
  }
  const owningScreen = findAncestor(text, node => node.id === entry.screenId);
  const modal = findAncestor(
    text,
    node => node.type === "INSTANCE" && node.name.startsWith("Modal /")
  );
  if (!owningScreen || !modal) {
    preflightViolations.push({ type: "modal-ancestry", screenId: entry.screenId, textId: entry.textId });
    continue;
  }
  modalTargets.push({ ...entry, screen, text, modal });
}

if (preflightViolations.length || spacingTargets.length !== 2 || modalTargets.length !== 2) {
  return {
    mutatedNodeIds: [],
    violations: preflightViolations,
    preflight: { spacing: spacingTargets.length, modal: modalTargets.length }
  };
}

const mutatedNodeIds = [];

for (const target of spacingTargets) {
  target.spacer.resize(320, target.spacerHeight);
  target.spacer.fills = [];
  target.spacer.strokes = [];
  mutatedNodeIds.push(target.spacer.id, target.body.id);
}

for (const target of modalTargets) {
  const segments = target.text.getStyledTextSegments(["fontName"]);
  const fonts = [...new Map(
    segments.map(segment => [
      `${segment.fontName.family}::${segment.fontName.style}`,
      segment.fontName
    ])
  ).values()];
  await Promise.all(fonts.map(font => figma.loadFontAsync(font)));
  target.text.textAutoResize = "HEIGHT";
  target.text.resize(312, target.text.height);
  target.text.layoutSizingHorizontal = "FIXED";
  target.text.characters = target.expected;
  mutatedNodeIds.push(target.text.id, target.modal.id);
}

const yPositions = [];
const positionViolations = [];
for (const target of spacingTargets) {
  const actual = {
    id: relativeY(target.idInput, target.screen),
    password: relativeY(target.passwordInput, target.screen),
    login: relativeY(target.login, target.screen),
    helper: relativeY(target.helper, target.screen),
    phone: relativeY(target.phone, target.screen)
  };
  for (const [name, expected] of Object.entries(target.expected)) {
    if (Math.abs(actual[name] - expected) > 1) {
      positionViolations.push({ screenId: target.screenId, name, expected, actual: actual[name] });
    }
  }
  yPositions.push({
    screenId: target.screenId,
    spacerId: target.spacer.id,
    spacerHeight: target.spacer.height,
    inputHeights: { id: target.idInput.height, password: target.passwordInput.height },
    actual,
    expected: target.expected
  });
}

const modalResults = [];
const textViolations = [];
for (const target of modalTargets) {
  const chain = [];
  let current = target.text.parent;
  while (current && current !== target.screen) {
    if ("x" in current && "width" in current) chain.push(geometry(current, target.screen));
    current = current.parent;
  }
  if (
    target.text.characters !== target.expected ||
    target.text.width !== 312 ||
    target.text.textAutoResize !== "HEIGHT"
  ) {
    textViolations.push({
      screenId: target.screenId,
      expectedCharacters: target.expected,
      actualCharacters: target.text.characters,
      expectedWidth: 312,
      actualWidth: target.text.width,
      expectedAutoResize: "HEIGHT",
      actualAutoResize: target.text.textAutoResize
    });
  }
  modalResults.push({
    screenId: target.screenId,
    text: {
      ...geometry(target.text, target.screen),
      textAutoResize: target.text.textAutoResize,
      characters: target.text.characters
    },
    modal: geometry(target.modal, target.screen),
    parentChain: chain
  });
}

const rawViolations = [];
for (const screenId of ["1562:6","1562:7","1562:11","1562:13"]) {
  const screen = await figma.getNodeByIdAsync(screenId);
  if (!screen || screen.type !== "FRAME") continue;
  walk(screen, (node, visible) => {
    if (!visible || node.type === "INSTANCE") return;
    for (const property of ["fills","strokes"]) {
      if (!(property in node) || !Array.isArray(node[property])) continue;
      for (const paint of node[property]) {
        if (paint.type === "SOLID" && paint.visible !== false && !paint.boundVariables?.color) {
          rawViolations.push({ screenId, nodeId: node.id, nodeName: node.name, property });
        }
      }
    }
  }, true, true);
}

const overflow = [];
for (const screenId of ["1562:11","1562:13"]) {
  const screen = await figma.getNodeByIdAsync(screenId);
  if (!screen || screen.type !== "FRAME" || !screen.absoluteBoundingBox) continue;
  const screenBox = screen.absoluteBoundingBox;
  walk(screen, (node, visible) => {
    if (!visible || node === screen || !("absoluteBoundingBox" in node)) return;
    const box = node.absoluteBoundingBox;
    if (!box) return;
    const outside =
      box.x < screenBox.x - 0.5 ||
      box.y < screenBox.y - 0.5 ||
      box.x + box.width > screenBox.x + screenBox.width + 0.5 ||
      box.y + box.height > screenBox.y + screenBox.height + 0.5;
    if (outside) overflow.push({
      screenId,
      nodeId: node.id,
      nodeName: node.name,
      box: { x: box.x, y: box.y, width: box.width, height: box.height }
    });
  });
}

const violations = [
  ...positionViolations,
  ...textViolations,
  ...rawViolations,
  ...overflow
];

return {
  mutatedNodeIds: [...new Set(mutatedNodeIds)],
  yPositions,
  modalResults,
  rawViolations,
  overflow,
  violations,
  counts: {
    spacingTargets: spacingTargets.length,
    modalTexts: modalTargets.length,
    position: positionViolations.length,
    text: textViolations.length,
    raw: rawViolations.length,
    overflow: overflow.length,
    total: violations.length
  }
};
