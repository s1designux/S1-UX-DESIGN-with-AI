figma.skipInvisibleInstanceChildren = false;

const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") {
  return { violations: { structure: [["page", "173:2431", "missing"]] } };
}
await figma.setCurrentPageAsync(page);

const specs = [
  ["1562:3", "8403:60128", "2.1 로그인_1 최초진입"],
  ["1562:4", "8403:60155", "2.1 로그인_2 입력 A"],
  ["1562:5", "30812:3889", "2.1 로그인_2 입력 B"],
  ["1562:6", "8403:60255", "2.1 로그인_3 아이디 미입력"],
  ["1562:7", "8403:60287", "2.1 로그인_4 비밀번호 미입력"],
  ["1562:8", "8403:60315", "2.1 로그인_5 잘못된 아이디비번"],
  ["1562:9", "8403:60181", "2.1 로그인_7 자동 로그인 선택 A"]
];

const allowedKeys = new Set([
  "24b2df622d341e0af21cd4b23b4a7d23b97a5ea7", "5ab251e0d90adb555ee2fa316f84e86041f19916",
  "6b764af642b8883e892754281950da0e971224d7", "ca1d043ac09be07f827e939be3d8c3c7af8a8dd9",
  "ea0ffc118c38048f2cdfb5620be31c120426bb7a", "5157e9edc76358e2e6bc1a5ebc1539ccf5f2e787",
  "a423e2e05cfff2f93062d6a83d6f3bdf79ca9647", "e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581",
  "dee16df7e4ccddbd5dd7aa1d2fbf93f841f5dee2", "6bf422c937034ce15f6814e5c430d8f85953ed4e",
  "c99f913689cd068deb2a5499154fed423ec9579f", "2a1abbd3597b536e34fd9523fb61eade3afe9934",
  "d4e9eb5b7e193ee291aa2a7e04396c8de2d2dae7", "b130623bad9bf035e273501b404bf7a245af1460",
  "606d0de897175059f133427bf62bb3635d18a860", "28aa6b1615f3afb29ff22cf2767f0c771c941fdc",
  "b3ccc4b275de6aac8e3940df2ae97fbb00168624", "e9a3d9b7e0c60b93fc10e2f6485ab77bd06329f0",
  "617757d927a1bae7df6ccdf0d24cc0e3c5a04255"
]);

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

function relY(node, screen) {
  let y = node.y;
  let parent = node.parent;
  while (parent && parent !== screen) {
    if ("y" in parent) y += parent.y;
    parent = parent.parent;
  }
  return y;
}

function variantString(properties) {
  if (!properties) return "";
  return Object.entries(properties).sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`).join("|");
}

function textStyleValue(text) {
  return text.textStyleId === figma.mixed ? "mixed" : (text.textStyleId || "");
}

function fontValue(text) {
  let fonts = [];
  if (text.fontName !== figma.mixed) {
    fonts = [text.fontName];
  } else {
    try { fonts = text.getStyledTextSegments(["fontName"]).map(segment => segment.fontName); } catch (_) {}
  }
  return [...new Set(fonts.map(font => `${font.family}/${font.style}`))].sort().join("|");
}

function positionRecord(role, node, screen) {
  return node ? [role, node.id, relY(node, screen), node.width, node.height] : [role, null, null, null, null];
}

const mainDictionary = [];
const mainIndex = new Map();
function mainRef(main) {
  const id = main?.id || "";
  const key = main?.key || "";
  const remote = main?.remote === true;
  const allowed = Boolean(main) && (!remote || allowedKeys.has(key));
  const signature = `${id}::${key}::${remote}::${allowed}`;
  if (!mainIndex.has(signature)) {
    mainIndex.set(signature, mainDictionary.length);
    mainDictionary.push([id, key, remote, allowed]);
  }
  return mainIndex.get(signature);
}

const styleDictionary = [];
const styleIndex = new Map();
function styleRef(text) {
  const style = textStyleValue(text);
  const font = fontValue(text);
  const signature = `${style}::${font}`;
  if (!styleIndex.has(signature)) {
    styleIndex.set(signature, styleDictionary.length);
    styleDictionary.push([style, font]);
  }
  return styleIndex.get(signature);
}

const raw = [];
const overflow = [];
const provenance = [];
const structure = [];
const screens = [];
let checkedCount = 0;
let rootCount = 0;
let remoteCount = 0;
let localCount = 0;
let allowedRemoteCount = 0;

for (const [screenId, sourceId, expectedName] of specs) {
  const screen = await figma.getNodeByIdAsync(screenId);
  if (!screen || screen.type !== "FRAME") {
    structure.push([screenId, "screen-missing"]);
    screens.push([screenId, expectedName, sourceId, null, [], [], [], [], [], []]);
    continue;
  }

  const contentMatches = screen.children.filter(node => node.type === "FRAME" && node.name === "PatternContent");
  const content = contentMatches.length === 1 ? contentMatches[0] : null;
  if (!content) structure.push([screenId, "PatternContent-count", contentMatches.length]);

  const authoredNodes = [];
  walkAuthored(screen, (node, visible) => {
    authoredNodes.push(node);
    if (!visible || node.type === "INSTANCE") return;
    for (const property of ["fills", "strokes"]) {
      if (!(property in node) || !Array.isArray(node[property])) continue;
      for (const paint of node[property]) {
        if (paint.type === "SOLID" && paint.visible !== false && !paint.boundVariables?.color) {
          raw.push([screenId, node.id, node.name, property]);
        }
      }
    }
  });

  const allInstances = [];
  const visibleTexts = [];
  walk(screen, (node, visible, instanceDepth) => {
    if (node.type === "INSTANCE") allInstances.push({ node, root: instanceDepth === 0 });
    if (node.type === "TEXT" && visible) visibleTexts.push({ node, underInstance: instanceDepth > 0 });
    if (!visible || node === screen || !("absoluteBoundingBox" in node) || !screen.absoluteBoundingBox) return;
    const box = node.absoluteBoundingBox;
    const bounds = screen.absoluteBoundingBox;
    if (!box) return;
    if (box.x < bounds.x - 0.5 || box.y < bounds.y - 0.5 ||
        box.x + box.width > bounds.x + bounds.width + 0.5 ||
        box.y + box.height > bounds.y + bounds.height + 0.5) {
      overflow.push([screenId, node.id, node.name, box.x, box.y, box.width, box.height]);
    }
  });

  const mains = await Promise.all(allInstances.map(item => item.node.getMainComponentAsync()));
  const instanceRecords = [];
  const rootIndexes = [];
  for (let index = 0; index < allInstances.length; index++) {
    const item = allInstances[index];
    const main = mains[index];
    const ref = mainRef(main);
    const record = [item.node.id, item.node.name, ref, variantString(item.node.variantProperties)];
    instanceRecords.push(record);
    checkedCount += 1;
    if (item.root) { rootIndexes.push(index); rootCount += 1; }
    if (main?.remote === true) {
      remoteCount += 1;
      if (allowedKeys.has(main.key || "")) allowedRemoteCount += 1;
    } else if (main) {
      localCount += 1;
    }
    if (!main || (main.remote === true && !allowedKeys.has(main.key || ""))) {
      provenance.push([screenId, item.node.id, item.node.name, main?.id || null, main?.key || null, main?.remote ?? null]);
    }
  }

  const textRecords = visibleTexts.map(({ node, underInstance }) => [
    node.id, node.characters, styleRef(node), underInstance
  ]);

  const roots = authoredNodes.filter(node => node.type === "INSTANCE");
  const findExact = name => roots.find(node => node.name === name) || null;
  const findPrefix = prefix => roots.find(node => node.name.startsWith(prefix)) || null;
  const spacers = authoredNodes.filter(node => node.type === "FRAME" && node.name.startsWith("Spacer /"))
    .map(node => [node.id, node.name, node.height]);
  const positions = [
    positionRecord("id", findExact("Input / ID"), screen),
    positionRecord("password", findExact("Input / Password"), screen),
    positionRecord("login", findExact("Button / 로그인"), screen),
    positionRecord("helper", authoredNodes.find(node => node.name === "HelperLinks") || null, screen),
    positionRecord("phone", findPrefix("Button / 휴대"), screen),
    positionRecord("keyboard", authoredNodes.find(node => node.name === "OS Keyboard (Placeholder)") || null, screen),
    positionRecord("footer", findExact("Footer / Mobile"), screen),
    positionRecord("modal", findPrefix("Modal /"), screen)
  ];

  screens.push([
    screen.id, screen.name, sourceId, content?.id || null,
    authoredNodes.map(node => node.id), rootIndexes, instanceRecords, textRecords, spacers, positions
  ]);
}

const result = {
  schema: {
    screen: "[id,name,source,contentRootId,authoredNodeIds,rootInstanceIndexes,instances,texts,spacers,positions]",
    main: "[mainId,key,remote,allowed]",
    instance: "[id,name,mainDictionaryIndex,variantPropertiesSerialized]",
    rootInstanceIndexes: "indexes into the same screen's instances array",
    textStyle: "[textStyleId,fontFamilyAndStyle]",
    text: "[id,characters,textStyleDictionaryIndex,underInstance]",
    spacer: "[id,name,height]",
    position: "[role,id,screenRelativeY,width,height]",
    raw: "[screenId,nodeId,name,fillsOrStrokes]",
    overflow: "[screenId,nodeId,name,absoluteX,absoluteY,width,height]",
    provenanceViolation: "[screenId,instanceId,name,mainId,key,remote]"
  },
  range: "screens-1-7",
  mains: mainDictionary,
  textStyles: styleDictionary,
  screens,
  violations: { structure, raw, overflow, provenance },
  aggregate: { checkedCount, rootCount, remoteCount, localCount, allowedRemoteCount }
};

if (JSON.stringify(result).length > 17500) {
  for (const screen of screens) {
    const rootIndexes = new Set(screen[5]);
    for (let index = 0; index < screen[6].length; index++) {
      if (!rootIndexes.has(index)) screen[6][index][3] = null;
    }
  }
  result.compaction = "Nested instance variantProperties omitted only to remain below the MCP result limit.";
}
result.estimatedJsonChars = JSON.stringify(result).length;
return result;
