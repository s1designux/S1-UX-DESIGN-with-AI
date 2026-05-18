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
  type: "preview" | "sync" | "cancel" | "export-variables";
}

export interface PluginResponse {
  type: "preview-result" | "sync-error" | "loading" | "export-result" | "export-error";
  result?: TokenSyncSummary;
  exportData?: FigmaVariableExport;
  error?: string;
}
