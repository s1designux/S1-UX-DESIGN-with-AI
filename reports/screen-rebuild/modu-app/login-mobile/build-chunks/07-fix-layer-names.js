const page = await figma.getNodeByIdAsync("173:2431");
if (!page || page.type !== "PAGE") {
  return {
    changedNodeIds: [],
    violations: [{ type: "target-page", message: "Page 173:2431 missing" }]
  };
}
await figma.setCurrentPageAsync(page);

const targets = ["1562:3", "1562:6", "1562:7"];
const desiredName = "Button / 휴대전화번호로 로그인";
const secondaryMainComponentId = "1545:8202";
const changedNodeIds = [];
const violations = [];

function collectRootInstances(node, outerInstance = null, output = []) {
  const nextOuter = outerInstance || (node.type === "INSTANCE" ? node : null);
  if (node.type === "INSTANCE" && outerInstance === null) output.push(node);
  if (!("children" in node)) return output;
  for (const child of node.children) {
    collectRootInstances(child, nextOuter, output);
  }
  return output;
}

for (const screenId of targets) {
  const screen = await figma.getNodeByIdAsync(screenId);
  if (!screen || screen.type !== "FRAME") {
    violations.push({ type: "screen", screenId, message: "Screen missing" });
    continue;
  }

  const rootInstances = collectRootInstances(screen);
  const mains = await Promise.all(
    rootInstances.map(instance => instance.getMainComponentAsync())
  );
  const matches = rootInstances.filter(
    (_, index) => mains[index]?.id === secondaryMainComponentId
  );

  if (matches.length !== 1) {
    violations.push({
      type: "secondary-button-count",
      screenId,
      expected: 1,
      actual: matches.length,
      candidateIds: matches.map(instance => instance.id)
    });
    continue;
  }

  matches[0].name = desiredName;
  changedNodeIds.push(matches[0].id);
}

return {
  changedNodeIds,
  mutatedNodeIds: changedNodeIds,
  desiredName,
  violations
};
