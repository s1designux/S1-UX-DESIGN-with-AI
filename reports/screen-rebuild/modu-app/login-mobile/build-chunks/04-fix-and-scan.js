const targetPage = await figma.getNodeByIdAsync("173:2431");
if (!targetPage || targetPage.type !== "PAGE") {
  return {
    violations: [{ type: "target-page", message: "Target page 173:2431 not found" }],
    counts: { screens: 0, built: 0 }
  };
}
await figma.setCurrentPageAsync(targetPage);

const section = await figma.getNodeByIdAsync("1562:2");
if (!section || section.type !== "SECTION") {
  return {
    violations: [{ type: "section", message: "Section 1562:2 not found" }],
    counts: { screens: 0, built: 0 }
  };
}

const screenSpecs = [
  {
    id: "1562:3",
    sourceNodeId: "8403:60128",
    name: "2.1 로그인_1 최초진입",
    inputIds: ["1546:10603", "1546:10603"],
    primaryButtonId: "1545:8176",
    keyboard: false,
    popup: null,
    phoneText: "휴대전화번호로 로그인",
    specificTexts: ["아이디를 입력해 주세요.", "비밀번호를 입력해 주세요."]
  },
  {
    id: "1562:4",
    sourceNodeId: "8403:60155",
    name: "2.1 로그인_2 입력 A",
    inputIds: ["1546:10715", "1546:10603"],
    primaryButtonId: "1545:8170",
    keyboard: true,
    popup: null,
    phoneText: null,
    specificTexts: ["s1desig", "비밀번호를 입력해 주세요."]
  },
  {
    id: "1562:5",
    sourceNodeId: "30812:3889",
    name: "2.1 로그인_2 입력 B",
    inputIds: ["1546:10655", "1546:10715"],
    primaryButtonId: "1545:8170",
    keyboard: true,
    popup: null,
    phoneText: null,
    specificTexts: ["s1design", "••••••••"]
  },
  {
    id: "1562:6",
    sourceNodeId: "8403:60255",
    name: "2.1 로그인_3 아이디 미입력",
    inputIds: ["1546:10803", "1546:10655"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: null,
    phoneText: "휴대전화번호로 로그인",
    specificTexts: [
      "아이디를 입력해 주세요.",
      "아이디를 정확히 입력해 주세요.",
      "••••••••"
    ]
  },
  {
    id: "1562:7",
    sourceNodeId: "8403:60287",
    name: "2.1 로그인_4 비밀번호 미입력",
    inputIds: ["1546:10655", "1546:10803"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: null,
    phoneText: "휴대전화번호로 로그인",
    specificTexts: [
      "s1design",
      "비밀번호를 입력해 주세요.",
      "비밀번호를 정확히 입력해 주세요."
    ]
  },
  {
    id: "1562:8",
    sourceNodeId: "8403:60315",
    name: "2.1 로그인_5 잘못된 아이디비번",
    inputIds: ["1546:10655", "1546:10803"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: null,
    phoneText: "휴대전화번호로 로그인",
    specificTexts: [
      "s1design",
      "••••••••",
      "아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)"
    ]
  },
  {
    id: "1562:9",
    sourceNodeId: "8403:60181",
    name: "2.1 로그인_7 자동 로그인 선택 A",
    inputIds: ["1546:10655", "1546:10655"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: { componentId: "1546:17957", title: "로그인 되었습니다.", message: "다음부터 자동으로 로그인할까요?", buttons: ["취소", "확인"] },
    phoneText: "휴대전화번호로 로그인",
    specificTexts: ["s1design", "••••••••"]
  },
  {
    id: "1562:10",
    sourceNodeId: "21446:2889",
    name: "2.1 로그인_7 자동 로그인 선택 B",
    inputIds: ["1546:10655", "1546:10655"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: { componentId: "1546:17945", title: "자동 로그인 설정 되었습니다.", message: "", buttons: ["확인"] },
    phoneText: "휴대폰 번호로 로그인",
    specificTexts: ["s1design", "••••••••"]
  },
  {
    id: "1562:11",
    sourceNodeId: "30812:3215",
    name: "2.1 로그인_6 새로운 기기로 로그인 A",
    inputIds: ["1546:10655", "1546:10655"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: {
      componentId: "1546:17945",
      title: "인증되지 않은 기기에요",
      message: "서비스를 이용하시려면 본인 인증을 해 주세요. 본인 인증 시 기존 기기는 인증이 해제됩니다.",
      buttons: ["확인"]
    },
    phoneText: "휴대폰 번호로 로그인",
    specificTexts: ["s1design", "••••••••"]
  },
  {
    id: "1562:12",
    sourceNodeId: "30812:3288",
    name: "2.1 로그인_6 새로운 기기로 로그인 B",
    inputIds: ["1546:10655", "1546:10655"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: {
      componentId: "1546:17945",
      title: "인증 완료",
      message: "사용중인 기기로 인증이 완료되었습니다.\n다시 로그인 해주세요.",
      buttons: ["확인"]
    },
    phoneText: "휴대폰 번호로 로그인",
    specificTexts: ["s1design", "••••••••"]
  },
  {
    id: "1562:13",
    sourceNodeId: "30812:3252",
    name: "2.1 로그인_6 새로운 기기로 로그인 C",
    inputIds: ["1546:10655", "1546:10655"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: {
      componentId: "1546:17957",
      title: "인증되지 않은 기기에요",
      message: "에스원은 고객님의 소중한 정보를 보호하기 위해 인증 기기 등록 후 서비스를 제공하고 있습니다.\n현재 인증한 기기로 등록 후 로그인 할까요?",
      buttons: ["취소", "확인"]
    },
    phoneText: "휴대폰 번호로 로그인",
    specificTexts: ["s1design", "••••••••"]
  },
  {
    id: "1562:14",
    sourceNodeId: "8403:60218",
    name: "2.1 로그인_6 새로운 기기로 로그인 D",
    inputIds: ["1546:10655", "1546:10655"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: null,
    phoneText: "휴대전화번호로 로그인",
    specificTexts: ["s1design", "••••••••"]
  },
  {
    id: "1562:15",
    sourceNodeId: "21446:2852",
    name: "2.1 로그인_6 새로운 기기로 로그인 E",
    inputIds: ["1546:10655", "1546:10655"],
    primaryButtonId: "1545:8170",
    keyboard: false,
    popup: null,
    phoneText: "휴대폰 번호로 로그인",
    specificTexts: ["s1design", "••••••••"]
  }
];

const screenNodes = await Promise.all(screenSpecs.map(spec => figma.getNodeByIdAsync(spec.id)));
const screenById = new Map(
  screenNodes.filter(node => node && node.type === "FRAME").map(node => [node.id, node])
);

const keyboardToken = await figma.variables.getVariableByIdAsync("VariableID:687:17885");
if (
  !keyboardToken ||
  keyboardToken.resolvedType !== "COLOR" ||
  !(
    keyboardToken.name === "color/bg/level-1" ||
    keyboardToken.name.endsWith("/color/bg/level-1")
  )
) {
  throw new Error("Exact semantic token missing: VariableID:687:17885 / color/bg/level-1");
}

function walkNode(node, visitor, ancestorsVisible = true, includeInstanceChildren = true) {
  const effectiveVisible = ancestorsVisible && (typeof node.visible !== "boolean" || node.visible !== false);
  visitor(node, effectiveVisible);
  if (!("children" in node)) return;
  if (!includeInstanceChildren && node.type === "INSTANCE") return;
  for (const child of node.children) {
    walkNode(child, visitor, effectiveVisible, includeInstanceChildren);
  }
}

function descendants(node, includeInstanceChildren = true) {
  const result = [];
  if (!("children" in node)) return result;
  for (const child of node.children) {
    walkNode(child, current => result.push(current), true, includeInstanceChildren);
  }
  return result;
}

const fixResults = [];
const fixViolations = [];
const mutatedNodeIds = [];
for (const screenId of ["1562:4", "1562:5"]) {
  const screen = screenById.get(screenId);
  if (!screen) {
    fixViolations.push({ type: "keyboard-fix", screenId, message: "Screen missing" });
    continue;
  }
  const placeholders = descendants(screen, true).filter(
    node => node.type === "FRAME" && node.name === "OS Keyboard (Placeholder)"
  );
  if (placeholders.length !== 1) {
    fixViolations.push({
      type: "keyboard-fix",
      screenId,
      message: `Expected one keyboard placeholder, received ${placeholders.length}`
    });
    continue;
  }
  const keyboard = placeholders[0];
  const boundPaint = figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    "color",
    keyboardToken
  );
  keyboard.fills = [boundPaint];
  mutatedNodeIds.push(keyboard.id);
  fixResults.push({
    screenId,
    keyboardNodeId: keyboard.id,
    tokenId: keyboardToken.id,
    tokenName: keyboardToken.name
  });
}

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

function geometry(node) {
  return {
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    layoutPositioning: "layoutPositioning" in node ? node.layoutPositioning : null
  };
}

function fontSummary(text) {
  if (text.fontName !== figma.mixed) {
    return [{ family: text.fontName.family, style: text.fontName.style }];
  }
  const segments = text.getStyledTextSegments(["fontName"]);
  return [...new Map(
    segments.map(segment => [
      `${segment.fontName.family}::${segment.fontName.style}`,
      { family: segment.fontName.family, style: segment.fontName.style }
    ])
  ).values()];
}

const allTexts = [];
const allInstances = [];
const authoredPaintViolations = [];
const screenReports = [];
const missingTextViolations = [];
const popupViolations = [];
const keyboardViolations = [];
const wrongStateViolations = [];

const commonNormalTexts = [
  "로그인",
  "회원가입",
  "아이디 찾기",
  "비밀번호 찾기",
  "이용약관",
  "개인정보처리방침",
  "영상정보처리방침"
];

for (const spec of screenSpecs) {
  const screen = screenById.get(spec.id);
  if (!screen) {
    wrongStateViolations.push({ type: "screen-missing", screenId: spec.id });
    screenReports.push({
      id: spec.id,
      name: spec.name,
      sourceNodeId: spec.sourceNodeId,
      status: "missing"
    });
    continue;
  }

  const allDescendants = descendants(screen, true);
  const directChildren = [...screen.children];
  const patternContents = directChildren.filter(
    node => node.type === "FRAME" && node.name === "PatternContent"
  );
  const patternContent = patternContents.length === 1 ? patternContents[0] : null;

  if (!patternContent) {
    wrongStateViolations.push({
      type: "pattern-content",
      screenId: spec.id,
      message: `Expected one PatternContent, received ${patternContents.length}`
    });
  } else if (
    patternContent.width !== 360 ||
    patternContent.height !== 780 ||
    patternContent.x !== 0 ||
    patternContent.y !== 0
  ) {
    wrongStateViolations.push({
      type: "pattern-content-geometry",
      screenId: spec.id,
      geometry: geometry(patternContent)
    });
  }

  const textRecords = [];
  const instanceNodes = [];
  walkNode(screen, (node, effectiveVisible) => {
    if (node.type === "TEXT" && effectiveVisible) {
      const record = {
        screenId: spec.id,
        id: node.id,
        name: node.name,
        characters: node.characters,
        textStyleId: node.textStyleId === figma.mixed ? "mixed" : node.textStyleId,
        fonts: fontSummary(node),
        geometry: geometry(node)
      };
      textRecords.push(record);
      allTexts.push(record);
    }
    if (node.type === "INSTANCE") instanceNodes.push(node);
  }, true, true);

  allInstances.push(...instanceNodes.map(instance => ({ screenId: spec.id, instance })));

  const actualTextSet = new Set(textRecords.map(record => record.characters));
  const expectedTexts = ["로그인", ...spec.specificTexts];
  if (!spec.keyboard) {
    expectedTexts.push(...commonNormalTexts.filter(text => text !== "로그인"));
    if (spec.phoneText) expectedTexts.push(spec.phoneText);
  }
  if (spec.popup) {
    expectedTexts.push(spec.popup.title);
    if (spec.popup.message !== "") expectedTexts.push(spec.popup.message);
    expectedTexts.push(...spec.popup.buttons);
  }

  const expectedTextPresence = expectedTexts.map(text => ({
    text,
    present: actualTextSet.has(text)
  }));
  for (const item of expectedTextPresence) {
    if (!item.present) {
      missingTextViolations.push({
        type: "missing-text",
        screenId: spec.id,
        text: item.text
      });
    }
  }

  const keyboardNodes = allDescendants.filter(
    node => node.type === "FRAME" && node.name === "OS Keyboard (Placeholder)"
  );
  const keyboardPresent = keyboardNodes.length === 1;
  if (keyboardPresent !== spec.keyboard) {
    keyboardViolations.push({
      type: "keyboard-presence",
      screenId: spec.id,
      expected: spec.keyboard,
      actual: keyboardPresent,
      count: keyboardNodes.length
    });
  }
  if (keyboardPresent) {
    const keyboard = keyboardNodes[0];
    const boundId = Array.isArray(keyboard.fills)
      ? keyboard.fills.find(paint => paint.type === "SOLID")?.boundVariables?.color?.id
      : null;
    if (keyboard.width !== 360 || keyboard.height !== 296 || boundId !== keyboardToken.id) {
      keyboardViolations.push({
        type: "keyboard-state",
        screenId: spec.id,
        geometry: geometry(keyboard),
        expectedTokenId: keyboardToken.id,
        actualTokenId: boundId || null
      });
    }
  }

  const overlays = allDescendants.filter(
    node => node.type === "FRAME" && node.name === "ModalOverlay"
  );
  const overlayPresent = overlays.length === 1;
  const popupExpected = Boolean(spec.popup);
  if (overlayPresent !== popupExpected) {
    popupViolations.push({
      type: "popup-presence",
      screenId: spec.id,
      expected: popupExpected,
      actual: overlayPresent,
      count: overlays.length
    });
  }

  if (spec.popup) {
    const modalInstances = instanceNodes.filter(instance => instance.name.startsWith("Modal /"));
    if (modalInstances.length !== 1) {
      popupViolations.push({
        type: "modal-instance-count",
        screenId: spec.id,
        expected: 1,
        actual: modalInstances.length
      });
    }
    const messageTexts = textRecords.filter(record => record.name === "message");
    if (!messageTexts.some(record => record.characters === spec.popup.message)) {
      popupViolations.push({
        type: "modal-message",
        screenId: spec.id,
        expected: spec.popup.message,
        actual: messageTexts.map(record => record.characters)
      });
    }
  }

  const authoredNodes = [];
  walkNode(screen, (node, effectiveVisible) => {
    if (!effectiveVisible || node.type === "INSTANCE") return;
    authoredNodes.push(node);
  }, true, false);

  for (const node of authoredNodes) {
    for (const property of ["fills", "strokes"]) {
      if (!(property in node) || !Array.isArray(node[property])) continue;
      for (const paint of node[property]) {
        if (
          paint.type === "SOLID" &&
          paint.visible !== false &&
          !paint.boundVariables?.color
        ) {
          authoredPaintViolations.push({
            type: "raw-authored-paint",
            screenId: spec.id,
            nodeId: node.id,
            nodeName: node.name,
            nodeType: node.type,
            property
          });
        }
      }
    }
  }

  screenReports.push({
    id: spec.id,
    name: screen.name,
    expectedName: spec.name,
    sourceNodeId: spec.sourceNodeId,
    status: patternContent ? "built" : "incomplete",
    geometry: geometry(screen),
    directNodeIds: directChildren.map(node => node.id),
    allDescendantNodeIds: allDescendants.map(node => node.id),
    patternContent: patternContent ? {
      id: patternContent.id,
      geometry: geometry(patternContent),
      topLevelChildren: patternContent.children.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        geometry: geometry(node)
      }))
    } : null,
    expectedTextPresence,
    popup: { expected: popupExpected, present: overlayPresent },
    keyboard: { expected: spec.keyboard, present: keyboardPresent }
  });
}

const uniqueInstanceEntries = [...new Map(
  allInstances.map(entry => [entry.instance.id, entry])
).values()];
const provenance = await Promise.all(
  uniqueInstanceEntries.map(async entry => {
    const main = await entry.instance.getMainComponentAsync();
    const allowed = Boolean(main) && (
      main.remote === false || allowedRemoteKeys.has(main.key)
    );
    return {
      screenId: entry.screenId,
      instanceId: entry.instance.id,
      instanceName: entry.instance.name,
      mainComponentId: main?.id || null,
      mainComponentName: main?.name || null,
      mainComponentKey: main?.key || null,
      remote: main?.remote ?? null,
      variantProperties: entry.instance.variantProperties,
      allowed
    };
  })
);

const disallowedProvenance = provenance.filter(record => !record.allowed).map(record => ({
  type: "disallowed-provenance",
  ...record
}));

const provenanceByInstanceId = new Map(provenance.map(record => [record.instanceId, record]));
for (const spec of screenSpecs) {
  const screen = screenById.get(spec.id);
  if (!screen) continue;
  const instances = descendants(screen, true).filter(node => node.type === "INSTANCE");
  const byName = name => instances.find(instance => instance.name === name);

  const expectedComponents = [
    ["StatusBar / App", "1545:6510"],
    ["CI / 에스원 / Blue", "1545:6711"],
    ["Button / 로그인", spec.primaryButtonId],
    ["NavBar / App", "1545:6628"]
  ];
  if (!spec.keyboard) {
    expectedComponents.push(["Footer / Mobile", "1545:6818"]);
    expectedComponents.push([`Button / ${spec.phoneText}`, "1545:8202"]);
  }
  for (const [instanceName, mainId] of expectedComponents) {
    const instance = byName(instanceName);
    const actualMainId = instance ? provenanceByInstanceId.get(instance.id)?.mainComponentId : null;
    if (!instance || actualMainId !== mainId) {
      wrongStateViolations.push({
        type: "component-state",
        screenId: spec.id,
        instanceName,
        expectedMainComponentId: mainId,
        actualMainComponentId: actualMainId
      });
    }
  }

  const idInput = byName("Input / ID");
  const passwordInput = byName("Input / Password");
  const actualInputIds = [idInput, passwordInput].map(instance =>
    instance ? provenanceByInstanceId.get(instance.id)?.mainComponentId || null : null
  );
  for (let index = 0; index < 2; index++) {
    if (actualInputIds[index] !== spec.inputIds[index]) {
      wrongStateViolations.push({
        type: "input-state",
        screenId: spec.id,
        position: index === 0 ? "id" : "password",
        expectedMainComponentId: spec.inputIds[index],
        actualMainComponentId: actualInputIds[index]
      });
    }
  }

  if (passwordInput) {
    const passwordProperty = Object.entries(passwordInput.componentProperties || {})
      .find(([key, property]) =>
        property.type === "BOOLEAN" && /(password\s*icon|비밀번호)/i.test(key)
      );
    if (!passwordProperty || passwordProperty[1].value !== true) {
      wrongStateViolations.push({
        type: "password-icon-state",
        screenId: spec.id,
        expected: true,
        actual: passwordProperty?.[1]?.value ?? null
      });
    }
  }

  const modal = instances.find(instance => instance.name.startsWith("Modal /"));
  if (spec.popup) {
    const actualModalId = modal ? provenanceByInstanceId.get(modal.id)?.mainComponentId : null;
    if (actualModalId !== spec.popup.componentId) {
      wrongStateViolations.push({
        type: "modal-state",
        screenId: spec.id,
        expectedMainComponentId: spec.popup.componentId,
        actualMainComponentId: actualModalId
      });
    }
  } else if (modal) {
    wrongStateViolations.push({
      type: "unexpected-modal",
      screenId: spec.id,
      instanceId: modal.id
    });
  }
}

const nameViolations = screenReports
  .filter(report => report.status !== "missing" && report.name !== report.expectedName)
  .map(report => ({
    type: "screen-name",
    screenId: report.id,
    expected: report.expectedName,
    actual: report.name
  }));

const geometryViolations = screenReports
  .filter(report => report.geometry && (report.geometry.width !== 360 || report.geometry.height !== 780))
  .map(report => ({
    type: "screen-geometry",
    screenId: report.id,
    expected: { width: 360, height: 780 },
    actual: report.geometry
  }));

const logoutTexts = allTexts.filter(record => record.characters.includes("로그아웃"));
const excludedLogoutAbsent = logoutTexts.length === 0 && screenReports.length === 13;
const violations = [
  ...fixViolations,
  ...authoredPaintViolations,
  ...disallowedProvenance,
  ...missingTextViolations,
  ...popupViolations,
  ...keyboardViolations,
  ...wrongStateViolations,
  ...nameViolations,
  ...geometryViolations
];

return {
  mutatedNodeIds,
  keyboardFixes: fixResults,
  section: {
    id: section.id,
    name: section.name,
    geometry: geometry(section),
    directChildIds: section.children.map(node => node.id)
  },
  screens: screenReports,
  visibleTexts: allTexts,
  provenance,
  violations: {
    all: violations,
    rawAuthoredPaint: authoredPaintViolations,
    disallowedProvenance,
    missingTexts: missingTextViolations,
    popup: popupViolations,
    keyboard: keyboardViolations,
    wrongState: wrongStateViolations,
    names: nameViolations,
    geometry: geometryViolations,
    fix: fixViolations
  },
  tokenIds: {
    keyboardSurface: {
      id: keyboardToken.id,
      key: keyboardToken.key,
      name: keyboardToken.name
    }
  },
  counts: {
    screens: screenReports.length,
    built: screenReports.filter(report => report.status === "built").length,
    excludedLogoutAbsent,
    logoutTextCount: logoutTexts.length,
    rawViolation: authoredPaintViolations.length,
    disallowedProvenance: disallowedProvenance.length,
    missingTexts: missingTextViolations.length,
    wrongState: wrongStateViolations.length + popupViolations.length + keyboardViolations.length,
    totalViolations: violations.length
  }
};
