/// <reference types="@figma/plugin-typings" />

import type { PluginMessage, PluginResponse, FigmaVariableExport } from "./sync/types";
import { buildSyncPreviewFromRegistry, syncStableTokens } from "./sync/tokenSync";

figma.showUI(__html__, {
  width: 520,
  height: 640,
  title: "SW DS Token Sync — Dry Run Preview",
});

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

  if (msg.type === "sync") {
    syncStableTokens().catch((e: unknown) => {
      const response: PluginResponse = { type: "sync-error", error: String(e) };
      figma.ui.postMessage(response);
    });
    return;
  }

  if (msg.type === "cancel") {
    figma.closePlugin();
  }
};
