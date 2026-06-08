/// <reference types="@figma/plugin-typings" />

import type {
  PluginMessage,
  PluginResponse,
  FigmaVariableExport,
  FigmaVariableBinding,
  FigmaNodeVariableUsage,
  FigmaVariableUsageExport,
  SelectionNodeInfo,
} from "./sync/types";
import { buildSyncPreviewFromRegistry, syncStableTokens } from "./sync/tokenSync";
import { dryRunImport, applyImport } from "./sync/importTokens";

// bundled at build time via esbuild require resolution
// eslint-disable-next-line @typescript-eslint/no-var-requires
const usageTargets = require("../../../registry/figma/figma-usage-targets.json") as {
  meta: { expectedFileKey: string };
  targets: Array<{ id: string; nodeId: string; name: string; component: string }>;
};

// ── MVP-F1 helpers ────────────────────────────────────────────────────────────

async function collectNodeUsage(
  node: BaseNode,
  depth: number,
): Promise<FigmaNodeVariableUsage> {
  const bindings: FigmaVariableBinding[] = [];

  const raw = (node as SceneNode & { boundVariables?: Record<string, unknown> }).boundVariables ?? {};

  for (const [property, aliasOrArray] of Object.entries(raw)) {
    const aliases = Array.isArray(aliasOrArray) ? aliasOrArray : [aliasOrArray];
    for (const alias of aliases) {
      if (!alias || typeof alias !== "object") continue;
      const { type, id } = alias as { type: string; id: string };
      if (type !== "VARIABLE_ALIAS" || !id) continue;

      try {
        const variable = await figma.variables.getVariableByIdAsync(id);
        bindings.push({
          property,
          variableId: id,
          variableName: variable?.name ?? "",
          collectionName: variable
            ? ((await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId))?.name ?? "")
            : "",
          resolvedType: variable?.resolvedType ?? "",
        });
      } catch {
        bindings.push({ property, variableId: id, variableName: "", collectionName: "", resolvedType: "" });
      }
    }
  }

  // Recurse into children up to depth 3
  let childCount = 0;
  if (depth < 3 && "children" in node) {
    const children = (node as ChildrenMixin).children;
    childCount = children.length;
    for (const child of children) {
      const childUsage = await collectNodeUsage(child, depth + 1);
      bindings.push(...childUsage.bindings);
    }
  }

  return {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    parentId: node.parent?.id,
    bindings,
    childCount,
  };
}

figma.showUI(__html__, {
  width: 520,
  height: 640,
  title: "SW DS Token Sync — Dry Run Preview",
});

// Push selection info to UI whenever selection changes
function pushSelectionInfo(): void {
  const sel = figma.currentPage.selection;
  const selectionInfo: SelectionNodeInfo[] = sel.map((n) => ({
    id: n.id,
    name: n.name,
    type: n.type,
  }));
  const response: PluginResponse = { type: "selection-info", selectionInfo };
  figma.ui.postMessage(response);
}

figma.on("selectionchange", pushSelectionInfo);

figma.ui.onmessage = (msg: PluginMessage) => {
  if (msg.type === "preview") {
    try {
      const result = buildSyncPreviewFromRegistry();
      const response: PluginResponse = { type: "preview-result", result };
      figma.ui.postMessage(response);
    } catch (e) {
      const response: PluginResponse = { type: "sync-error", error: String(e) };
      figma.ui.postMessage(response);
    }
    return;
  }

  if (msg.type === "export-variables") {
    (async () => {
      try {
        const [rawCollections, rawVariables] = await Promise.all([
          figma.variables.getLocalVariableCollectionsAsync(),
          figma.variables.getLocalVariablesAsync(),
        ]);

        const collectionNameMap: Record<string, string> = {};
        const collections = rawCollections.map((col) => {
          collectionNameMap[col.id] = col.name;
          return {
            id: col.id,
            key: col.key,
            name: col.name,
            modes: col.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
            variableIds: col.variableIds,
          };
        });

        const variables = rawVariables.map((v) => ({
          id: v.id,
          key: v.key,
          name: v.name,
          collectionId: v.variableCollectionId,
          collectionName: collectionNameMap[v.variableCollectionId] ?? "",
          resolvedType: v.resolvedType,
          valuesByMode: v.valuesByMode as Record<string, unknown>,
          remote: v.remote,
          scopes: v.scopes as string[],
        }));

        const exportData: FigmaVariableExport = {
          meta: {
            source: "figma-plugin-api",
            fetchedAt: new Date().toISOString(),
            fileName: figma.root.name,
            writeEnabled: false,
          },
          collections,
          variables,
        };

        const response: PluginResponse = { type: "export-result", exportData };
        figma.ui.postMessage(response);
      } catch (e) {
        const response: PluginResponse = { type: "export-error", error: String(e) };
        figma.ui.postMessage(response);
      }
    })();
    return;
  }

  if (msg.type === "export-variable-usage") {
    (async () => {
      const nodeIds = usageTargets.targets.map((t) => t.nodeId);
      const nodeUsages: FigmaNodeVariableUsage[] = [];
      const errors: Array<{ nodeId: string; reason: string }> = [];

      for (const nodeId of nodeIds) {
        const node = figma.getNodeById(nodeId);
        if (!node) {
          errors.push({ nodeId, reason: "Node not found — may have been moved or deleted in Figma." });
          continue;
        }
        try {
          const usage = await collectNodeUsage(node, 0);
          nodeUsages.push(usage);
        } catch (e) {
          errors.push({ nodeId, reason: String(e) });
        }
      }

      const totalUsageCount = nodeUsages.reduce((sum, n) => sum + n.bindings.length, 0);

      const usageData: FigmaVariableUsageExport = {
        exportMeta: {
          type: "figma-variable-usage",
          schemaVersion: "1.0.0",
          figmaFileKey: usageTargets.meta.expectedFileKey,
          figmaFileName: figma.root.name,
          pluginName: "SW DS Token Sync",
          exportedAt: new Date().toISOString(),
          targetNodeIds: nodeIds,
          totalUsageCount,
          errorCount: errors.length,
          source: "figma-plugin-api",
          writeEnabled: false,
        },
        nodeUsages,
        errors,
      };

      const response: PluginResponse = { type: "usage-result", usageData };
      figma.ui.postMessage(response);
    })();
    return;
  }

  if (msg.type === "get-selection") {
    pushSelectionInfo();
    return;
  }

  if (msg.type === "scan-selection") {
    (async () => {
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        const response: PluginResponse = { type: "usage-error", error: "선택된 노드가 없습니다. Figma 캔버스에서 스캔할 컴포넌트를 선택한 뒤 다시 시도하세요." };
        figma.ui.postMessage(response);
        return;
      }

      const nodeUsages: FigmaNodeVariableUsage[] = [];
      const errors: Array<{ nodeId: string; reason: string }> = [];

      for (const node of selection) {
        try {
          const usage = await collectNodeUsage(node, 0);
          nodeUsages.push(usage);
        } catch (e) {
          errors.push({ nodeId: node.id, reason: String(e) });
        }
      }

      const totalUsageCount = nodeUsages.reduce((sum, n) => sum + n.bindings.length, 0);
      const nodeIds = selection.map((n) => n.id);

      const usageData: FigmaVariableUsageExport = {
        exportMeta: {
          type: "figma-variable-usage",
          schemaVersion: "1.0.0",
          figmaFileKey: figma.fileKey ?? usageTargets.meta.expectedFileKey,
          figmaFileName: figma.root.name,
          pluginName: "SW DS Token Sync",
          exportedAt: new Date().toISOString(),
          targetNodeIds: nodeIds,
          totalUsageCount,
          errorCount: errors.length,
          source: "figma-plugin-api",
          writeEnabled: false,
        },
        nodeUsages,
        errors,
      };

      const response: PluginResponse = { type: "usage-result", usageData };
      figma.ui.postMessage(response);
    })();
    return;
  }

  if (msg.type === "sync") {
    syncStableTokens().catch((e: unknown) => {
      const response: PluginResponse = { type: "sync-error", error: String(e) };
      figma.ui.postMessage(response);
    });
    return;
  }

  // ── Import 기능 (MVP-Import) ──────────────────────────────────────────────
  // 기존 export / tokenSync 기능과 완전히 분리된 별도 핸들러

  if (msg.type === "import-dry-run") {
    (async () => {
      try {
        const tokens = msg.importTokens ?? [];
        const collectionName = msg.importCollectionName ?? "semantic_v2";
        const importDryRunResult = await dryRunImport(tokens, collectionName);
        const response: PluginResponse = {
          type: "import-dry-run-result",
          importDryRunResult,
        };
        figma.ui.postMessage(response);
      } catch (e) {
        const response: PluginResponse = {
          type: "import-dry-run-error",
          error: String(e),
        };
        figma.ui.postMessage(response);
      }
    })();
    return;
  }

  if (msg.type === "import-apply") {
    (async () => {
      try {
        const tokens = msg.importTokens ?? [];
        const collectionName = msg.importCollectionName ?? "semantic_v2";
        const collectionMode = msg.importCollectionMode ?? "light-dark";
        const importApplyResult = await applyImport(tokens, collectionName, collectionMode);
        const response: PluginResponse = {
          type: "import-apply-result",
          importApplyResult,
        };
        figma.ui.postMessage(response);
      } catch (e) {
        const response: PluginResponse = {
          type: "import-apply-error",
          error: String(e),
        };
        figma.ui.postMessage(response);
      }
    })();
    return;
  }

  if (msg.type === "cancel") {
    figma.closePlugin();
  }
};
