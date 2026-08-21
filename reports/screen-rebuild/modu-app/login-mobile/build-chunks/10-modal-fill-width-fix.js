const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") {
  return { mutatedNodeIds: [], violations: [{ type: "page", message: "Page 173:2431 missing" }] };
}
await figma.setCurrentPageAsync(page);

const specs = [
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

function findAncestor(node, predicate) {
  let current = node.parent;
  while (current) {
    if (predicate(current)) return current;
    current = current.parent;
  }
  return null;
}

function relativePosition(node, screen) {
  let x = node.x;
  let y = node.y;
  let parent = node.parent;
  while (parent && parent !== screen) {
    if ("x" in parent) x += parent.x;
    if ("y" in parent) y += parent.y;
    parent = parent.parent;
  }
  return { x, y };
}

function geometry(node, screen) {
  const position = relativePosition(node, screen);
  return {
    id: node.id,
    name: node.name,
    x: position.x,
    y: position.y,
    width: node.width,
    height: node.height
  };
}

function walk(node, visitor, visible = true, stopAtInstance = false) {
  const nowVisible = visible && (typeof node.visible !== "boolean" || node.visible !== false);
  visitor(node, nowVisible);
  if (!("children" in node) || (stopAtInstance && node.type === "INSTANCE")) return;
  for (const child of node.children) walk(child, visitor, nowVisible, stopAtInstance);
}

const targets = [];
const preflightViolations = [];
for (const spec of specs) {
  const [screen, text] = await Promise.all([
    figma.getNodeByIdAsync(spec.screenId),
    figma.getNodeByIdAsync(spec.textId)
  ]);
  if (!screen || screen.type !== "FRAME") {
    preflightViolations.push({ type: "screen", screenId: spec.screenId });
    continue;
  }
  if (!text || text.type !== "TEXT" || text.name !== "message") {
    preflightViolations.push({ type: "text", screenId: spec.screenId, textId: spec.textId });
    continue;
  }
  if (text.characters !== spec.expected) {
    preflightViolations.push({
      type: "characters",
      screenId: spec.screenId,
      expected: spec.expected,
      actual: text.characters
    });
    continue;
  }
  const parent = text.parent;
  if (
    !parent ||
    parent.type !== "FRAME" ||
    parent.layoutMode !== "VERTICAL" ||
    Math.abs(parent.width - 358) > 1 ||
    parent.paddingLeft !== 24 ||
    parent.paddingRight !== 24
  ) {
    preflightViolations.push({
      type: "parent-layout",
      screenId: spec.screenId,
      actual: parent && "layoutMode" in parent ? {
        id: parent.id,
        type: parent.type,
        layoutMode: parent.layoutMode,
        width: parent.width,
        paddingLeft: parent.paddingLeft,
        paddingRight: parent.paddingRight
      } : null
    });
    continue;
  }
  const modal = findAncestor(
    text,
    node => node.type === "INSTANCE" && node.name.startsWith("Modal /")
  );
  const owningScreen = findAncestor(text, node => node.id === spec.screenId);
  if (!modal || !owningScreen) {
    preflightViolations.push({ type: "ancestry", screenId: spec.screenId });
    continue;
  }
  targets.push({ ...spec, screen, text, parent, modal });
}

if (preflightViolations.length || targets.length !== 2) {
  return {
    mutatedNodeIds: [],
    violations: preflightViolations,
    preflightCount: targets.length
  };
}

const mutatedNodeIds = [];
for (const target of targets) {
  const segments = target.text.getStyledTextSegments(["fontName"]);
  const fonts = [...new Map(
    segments.map(segment => [
      `${segment.fontName.family}::${segment.fontName.style}`,
      segment.fontName
    ])
  ).values()];
  await Promise.all(fonts.map(font => figma.loadFontAsync(font)));
  target.text.textAutoResize = "HEIGHT";
  target.text.layoutSizingHorizontal = "FILL";
  target.text.characters = target.expected;
  mutatedNodeIds.push(target.text.id, target.modal.id);
}

const textResults = [];
const textViolations = [];
for (const target of targets) {
  const result = {
    screenId: target.screenId,
    textId: target.text.id,
    width: target.text.width,
    expectedWidth: 310,
    height: target.text.height,
    textAutoResize: target.text.textAutoResize,
    layoutSizingHorizontal: target.text.layoutSizingHorizontal,
    characters: target.text.characters,
    parent: geometry(target.parent, target.screen),
    modal: geometry(target.modal, target.screen)
  };
  textResults.push(result);
  if (
    Math.abs(target.text.width - 310) > 1 ||
    target.text.textAutoResize !== "HEIGHT" ||
    target.text.layoutSizingHorizontal !== "FILL" ||
    target.text.characters !== target.expected
  ) {
    textViolations.push({ type: "text-state", ...result });
  }
}

const rawViolations = [];
const overflow = [];
for (const target of targets) {
  walk(target.screen, (node, visible) => {
    if (!visible || node.type === "INSTANCE") return;
    for (const property of ["fills", "strokes"]) {
      if (!(property in node) || !Array.isArray(node[property])) continue;
      for (const paint of node[property]) {
        if (paint.type === "SOLID" && paint.visible !== false && !paint.boundVariables?.color) {
          rawViolations.push({
            screenId: target.screenId,
            nodeId: node.id,
            nodeName: node.name,
            property
          });
        }
      }
    }
  }, true, true);

  const screenBox = target.screen.absoluteBoundingBox;
  if (!screenBox) continue;
  walk(target.screen, (node, visible) => {
    if (!visible || node === target.screen || !("absoluteBoundingBox" in node)) return;
    const box = node.absoluteBoundingBox;
    if (!box) return;
    const outside =
      box.x < screenBox.x - 0.5 ||
      box.y < screenBox.y - 0.5 ||
      box.x + box.width > screenBox.x + screenBox.width + 0.5 ||
      box.y + box.height > screenBox.y + screenBox.height + 0.5;
    if (outside) overflow.push({
      screenId: target.screenId,
      nodeId: node.id,
      nodeName: node.name,
      box: { x: box.x, y: box.y, width: box.width, height: box.height }
    });
  });
}

const violations = [...textViolations, ...rawViolations, ...overflow];
return {
  mutatedNodeIds: [...new Set(mutatedNodeIds)],
  textResults,
  rawViolations,
  overflow,
  violations,
  counts: {
    targets: targets.length,
    text: textViolations.length,
    raw: rawViolations.length,
    overflow: overflow.length,
    total: violations.length
  }
};
