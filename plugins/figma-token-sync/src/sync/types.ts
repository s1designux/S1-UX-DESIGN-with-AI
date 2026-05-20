export type MappingStatus =
  | "stable"
  | "pending"
  | "needs-review"
  | "deprecated"
  | "alias";

export type SyncStatus =
  | "sync-ready"
  | "preview-only"
  | "needs-review"
  | "excluded";

export interface TokenMapping {
  id: string;
  meaning: string;
  category?: string;
  scope?: string;
  figmaVariable?: string;
  cssVariable?: string;
  registryToken?: string;
  componentAliases?: string[];
  value?: string;
  modes?: {
    light?: string;
    dark?: string;
  };
  status: MappingStatus;
  notes?: string[];
}

export interface MappingGroup {
  _group: string;
  items: TokenMapping[];
}

export interface TokenMapMeta {
  name: string;
  version: string;
  status: string;
  figmaFileKey: string;
  figmaFileName?: string;
}

export interface FigmaCssTokenMap {
  meta: TokenMapMeta;
  mappings: MappingGroup[];
  stateAliases: Record<string, {
    canonical: string;
    status: string;
    description: string;
  }>;
  deprecated: Array<{ id: string; reason: string }>;
  unmapped: Array<{ id: string; reason: string }>;
  needsReview: Array<{ id: string; severity: string; issue: string }>;
}

export interface TokenSyncCandidate {
  id: string;
  meaning: string;
  cssVariable?: string;
  registryToken?: string;
  figmaVariable?: string;
  mappingStatus: MappingStatus;
  syncStatus: SyncStatus;
  reason: string;
}

export interface TokenSyncSummary {
  total: number;
  syncReady: number;
  previewOnly: number;
  needsReview: number;
  excluded: number;
  candidates: TokenSyncCandidate[];
}

export interface FigmaCollectionExport {
  id: string;
  key: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableIds: string[];
}

export interface FigmaVariableExportItem {
  id: string;
  key: string;
  name: string;
  collectionId: string;
  collectionName: string;
  resolvedType: string;
  valuesByMode: Record<string, unknown>;
  remote: boolean;
  scopes: string[];
}

export interface FigmaVariableExport {
  meta: {
    source: "figma-plugin-api";
    fetchedAt: string;
    fileName: string;
    writeEnabled: false;
  };
  collections: FigmaCollectionExport[];
  variables: FigmaVariableExportItem[];
}

export interface PluginMessage {
  type: "preview" | "sync" | "cancel" | "export-variables" | "export-variable-usage" | "scan-selection" | "get-selection";
}

export interface SelectionNodeInfo {
  id: string;
  name: string;
  type: string;
}

export interface PluginResponse {
  type: "preview-result" | "sync-error" | "loading" | "export-result" | "export-error" | "usage-result" | "usage-error" | "selection-info";
  result?: TokenSyncSummary;
  exportData?: FigmaVariableExport;
  usageData?: FigmaVariableUsageExport;
  selectionInfo?: SelectionNodeInfo[];
  error?: string;
}

// ── MVP-F1: Variable Usage Export types ──────────────────────────────────────

export interface FigmaVariableBinding {
  property: string;
  variableId: string;
  variableName: string;
  collectionName: string;
  resolvedType: string;
}

export interface FigmaNodeVariableUsage {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  parentId?: string;
  bindings: FigmaVariableBinding[];
  childCount: number;
  error?: string;
}

export interface FigmaUsageExportMeta {
  type: "figma-variable-usage";
  schemaVersion: "1.0.0";
  figmaFileKey: string;
  figmaFileName: string;
  pluginName: "SW DS Token Sync";
  exportedAt: string;
  targetNodeIds: string[];
  totalUsageCount: number;
  errorCount: number;
  source: "figma-plugin-api";
  writeEnabled: false;
}

export interface FigmaVariableUsageExport {
  exportMeta: FigmaUsageExportMeta;
  nodeUsages: FigmaNodeVariableUsage[];
  errors: Array<{ nodeId: string; reason: string }>;
}
