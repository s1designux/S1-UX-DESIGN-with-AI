const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") {
  return { changedBodyIds: [], violations: [{ type: "page", message: "Page 173:2431 missing" }] };
}
await figma.setCurrentPageAsync(page);

const screenIds = [
  "1562:3","1562:4","1562:5","1562:6","1562:7","1562:8","1562:9",
  "1562:10","1562:11","1562:12","1562:13","1562:14","1562:15"
];
const keyboardScreenIds = new Set(["1562:4","1562:5"]);
const errorScreenIds = new Set(["1562:6","1562:7","1562:8"]);
const spacerSpecs = [
  ["Spacer / Logo-ID", 10],
  ["Spacer / ID-Password", 12],
  ["Spacer / Password-Login", 34],
  ["Spacer / Login-Helpers", 20],
  ["Spacer / Helpers-Phone", 23]
];

function directByName(parent, name) {
  return parent.children.filter(child => child.name === name);
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

function geometry(node, screen) {
  return {
    id: node?.id || null,
    y: node ? relativeY(node, screen) : null,
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

const screens = await Promise.all(screenIds.map(id => figma.getNodeByIdAsync(id)));
const preflight = [];
const preflightViolations = [];

for (let index = 0; index < screenIds.length; index++) {
  const screenId = screenIds[index];
  const screen = screens[index];
  if (!screen || screen.type !== "FRAME") {
    preflightViolations.push({ type: "screen", screenId, message: "Screen missing" });
    continue;
  }

  const contentMatches = directByName(screen, "PatternContent");
  if (contentMatches.length !== 1 || contentMatches[0].type !== "FRAME") {
    preflightViolations.push({ type: "content", screenId, actual: contentMatches.length });
    continue;
  }
  const content = contentMatches[0];
  const bodyMatches = directByName(content, "LoginBody");
  if (bodyMatches.length !== 1 || bodyMatches[0].type !== "FRAME") {
    preflightViolations.push({ type: "body", screenId, actual: bodyMatches.length });
    continue;
  }
  const body = bodyMatches[0];

  const requiredNames = ["LogoSlot","Input / ID","Input / Password","Button / 로그인"];
  if (!keyboardScreenIds.has(screenId)) requiredNames.push("HelperLinks");
  const found = {};
  let invalid = false;
  for (const name of requiredNames) {
    const matches = directByName(body, name);
    if (matches.length !== 1) {
      preflightViolations.push({ type: "child", screenId, name, actual: matches.length });
      invalid = true;
    } else {
      found[name] = matches[0];
    }
  }

  const phoneMatches = body.children.filter(
    child => child.type === "INSTANCE" && child.name.startsWith("Button / 휴대")
  );
  if (!keyboardScreenIds.has(screenId) && phoneMatches.length !== 1) {
    preflightViolations.push({ type: "phone", screenId, actual: phoneMatches.length });
    invalid = true;
  }
  if (keyboardScreenIds.has(screenId) && phoneMatches.length !== 0) {
    preflightViolations.push({ type: "phone-keyboard", screenId, actual: phoneMatches.length });
    invalid = true;
  }

  for (const [spacerName] of spacerSpecs) {
    const matches = directByName(body, spacerName);
    if (matches.length > 1) {
      preflightViolations.push({ type: "duplicate-spacer", screenId, name: spacerName, actual: matches.length });
      invalid = true;
    }
  }

  const knownNames = new Set([
    ...requiredNames,
    ...spacerSpecs.map(([name]) => name)
  ]);
  const unexpected = body.children.filter(child =>
    !knownNames.has(child.name) && !phoneMatches.includes(child)
  );
  if (unexpected.length) {
    preflightViolations.push({
      type: "unexpected-body-child",
      screenId,
      nodes: unexpected.map(node => ({ id: node.id, name: node.name, type: node.type }))
    });
    invalid = true;
  }

  if (invalid) continue;

  const footer = content.children.find(child => child.name === "Footer / Mobile") || null;
  const nav = content.children.find(child => child.name === "NavBar / App") || null;
  const keyboard = content.children.find(child => child.name === "OS Keyboard (Placeholder)") || null;
  const overlay = content.children.find(child => child.name === "ModalOverlay") || null;
  const modal = overlay && "children" in overlay
    ? overlay.children.find(child => child.type === "INSTANCE" && child.name.startsWith("Modal /")) || null
    : null;

  preflight.push({
    screenId,
    screen,
    content,
    body,
    logo: found["LogoSlot"],
    idInput: found["Input / ID"],
    passwordInput: found["Input / Password"],
    login: found["Button / 로그인"],
    helper: found.HelperLinks || null,
    phone: phoneMatches[0] || null,
    footer,
    nav,
    keyboard,
    overlay,
    modal,
    fixedSnapshot: {
      footerY: footer ? relativeY(footer, screen) : null,
      navY: nav ? relativeY(nav, screen) : null,
      keyboardY: keyboard ? relativeY(keyboard, screen) : null,
      overlayY: overlay ? relativeY(overlay, screen) : null,
      modalY: modal ? relativeY(modal, screen) : null
    }
  });
}

if (preflightViolations.length > 0 || preflight.length !== 13) {
  return {
    changedBodyIds: [],
    createdSpacerIdsByScreen: {},
    violations: preflightViolations,
    preflightCount: preflight.length
  };
}

const changedBodyIds = [];
const createdSpacerIdsByScreen = {};
const reusedSpacerIdsByScreen = {};
const mutatedNodeIds = [];

function ensureSpacer(body, name, height, created, reused) {
  let spacer = body.children.find(child => child.name === name) || null;
  if (!spacer) {
    spacer = figma.createFrame();
    spacer.name = name;
    body.appendChild(spacer);
    created.push(spacer.id);
  } else {
    reused.push(spacer.id);
  }
  spacer.resize(320, height);
  spacer.fills = [];
  spacer.strokes = [];
  return spacer;
}

for (const item of preflight) {
  const created = [];
  const reused = [];
  const body = item.body;
  const screenId = item.screenId;

  body.itemSpacing = 0;
  body.paddingTop = 61;
  body.paddingBottom = 0;
  body.paddingLeft = 20;
  body.paddingRight = 20;
  body.primaryAxisAlignItems = "MIN";
  body.counterAxisAlignItems = "CENTER";

  item.logo.resize(320, 90);
  item.logo.primaryAxisSizingMode = "FIXED";
  item.logo.counterAxisSizingMode = "FIXED";
  item.logo.primaryAxisAlignItems = "CENTER";
  item.logo.counterAxisAlignItems = "CENTER";

  const logoId = ensureSpacer(body, "Spacer / Logo-ID", 10, created, reused);
  const idPassword = ensureSpacer(body, "Spacer / ID-Password", 12, created, reused);
  const passwordLogin = ensureSpacer(body, "Spacer / Password-Login", 34, created, reused);

  body.appendChild(item.logo);
  body.appendChild(logoId);
  body.appendChild(item.idInput);
  body.appendChild(idPassword);
  body.appendChild(item.passwordInput);
  body.appendChild(passwordLogin);
  body.appendChild(item.login);

  if (!keyboardScreenIds.has(screenId)) {
    const loginHelpers = ensureSpacer(body, "Spacer / Login-Helpers", 20, created, reused);
    const helpersPhone = ensureSpacer(body, "Spacer / Helpers-Phone", 23, created, reused);
    body.appendChild(loginHelpers);
    body.appendChild(item.helper);
    body.appendChild(helpersPhone);
    body.appendChild(item.phone);
  }

  changedBodyIds.push(body.id);
  createdSpacerIdsByScreen[screenId] = created;
  reusedSpacerIdsByScreen[screenId] = reused;
  mutatedNodeIds.push(
    body.id,item.logo.id,item.idInput.id,item.passwordInput.id,item.login.id,
    ...created,...reused
  );
  if (item.helper) mutatedNodeIds.push(item.helper.id);
  if (item.phone) mutatedNodeIds.push(item.phone.id);
}

const rawViolations = [];
const overflow = [];
const positionViolations = [];
const fixedPositionViolations = [];
const positions = [];

for (const item of preflight) {
  const screen = item.screen;
  const screenId = item.screenId;
  const idY = relativeY(item.idInput, screen);
  const passwordY = relativeY(item.passwordInput, screen);
  const loginY = relativeY(item.login, screen);
  const helperY = item.helper ? relativeY(item.helper, screen) : null;
  const phoneY = item.phone ? relativeY(item.phone, screen) : null;
  const keyboardY = item.keyboard ? relativeY(item.keyboard, screen) : null;
  const footerY = item.footer ? relativeY(item.footer, screen) : null;
  const modalY = item.modal ? relativeY(item.modal, screen) : null;

  const idErrorNaturalFlow = item.idInput.height > 60;
  const expectedPasswordY = idErrorNaturalFlow ? 286 : 248;
  const expectedLoginY = errorScreenIds.has(screenId) ? 368 : 330;
  const expectedHelperY = item.helper ? expectedLoginY + item.login.height + 20 : null;
  const expectedPhoneY = item.phone ? expectedHelperY + item.helper.height + 23 : null;

  const check = (name, actual, expected, tolerance = 0) => {
    if (actual !== null && Math.abs(actual - expected) > tolerance) {
      positionViolations.push({ screenId, name, expected, actual });
    }
  };
  check("id", idY, 188);
  check("password", passwordY, expectedPasswordY);
  check("login", loginY, expectedLoginY);
  if (item.helper) check("helper", helperY, expectedHelperY, 1);
  if (item.phone) check("phone", phoneY, expectedPhoneY, 1);
  if (item.keyboard) check("keyboard", keyboardY, 439);
  if (item.footer) check("footer", footerY, 683);

  const fixedNow = {
    footerY,
    navY: item.nav ? relativeY(item.nav, screen) : null,
    keyboardY,
    overlayY: item.overlay ? relativeY(item.overlay, screen) : null,
    modalY
  };
  for (const [key, before] of Object.entries(item.fixedSnapshot)) {
    const after = fixedNow[key];
    if (before !== after) {
      fixedPositionViolations.push({ screenId, node: key, before, after });
    }
  }

  positions.push({
    screenId,
    id: geometry(item.idInput, screen),
    password: geometry(item.passwordInput, screen),
    login: geometry(item.login, screen),
    helper: item.helper ? geometry(item.helper, screen) : null,
    phone: item.phone ? geometry(item.phone, screen) : null,
    keyboard: item.keyboard ? geometry(item.keyboard, screen) : null,
    footer: item.footer ? geometry(item.footer, screen) : null,
    modal: item.modal ? geometry(item.modal, screen) : null,
    naturalIdErrorFlow: idErrorNaturalFlow
  });

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

  const screenBox = screen.absoluteBoundingBox;
  if (screenBox) {
    walk(screen, (node, visible) => {
      if (!visible || node === screen || !("absoluteBoundingBox" in node)) return;
      const box = node.absoluteBoundingBox;
      if (!box) return;
      const outside =
        box.x < screenBox.x - 0.5 ||
        box.y < screenBox.y - 0.5 ||
        box.x + box.width > screenBox.x + screenBox.width + 0.5 ||
        box.y + box.height > screenBox.y + screenBox.height + 0.5;
      if (outside) overflow.push({ screenId, nodeId: node.id, nodeName: node.name });
    });
  }
}

const violations = [
  ...positionViolations,
  ...fixedPositionViolations,
  ...rawViolations,
  ...overflow
];

return {
  changedBodyIds,
  createdSpacerIdsByScreen,
  reusedSpacerIdsByScreen,
  mutatedNodeIds: [...new Set(mutatedNodeIds)],
  positions,
  rawViolations,
  overflow,
  violations,
  counts: {
    screens: preflight.length,
    changedBodies: changedBodyIds.length,
    createdSpacers: Object.values(createdSpacerIdsByScreen).flat().length,
    reusedSpacers: Object.values(reusedSpacerIdsByScreen).flat().length,
    raw: rawViolations.length,
    overflow: overflow.length,
    position: positionViolations.length,
    fixedPosition: fixedPositionViolations.length,
    total: violations.length
  },
  note: "Screen 1562:6 keeps natural auto-layout flow for its 86px ID Error instance; password starts at y=286 while login remains at y=368, preventing the error message from overlapping the password field."
};
