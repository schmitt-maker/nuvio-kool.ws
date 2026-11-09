/**
 * Type definitions for MediaHubMX / mHub v2 protocol used by Kool.ws
 */

export interface KoolManifest {
  id: string;
  name: string;
  specVersion: number;
  version?: string;
  description?: string;
  icon?: string;
  resources: string[];
  types: string[];
  idPrefixes?: string[];
  catalogs?: KoolCatalogDefinition[];
  addons?: KoolRepositoryAddon[];
}

export interface KoolRepositoryAddon {
  url: string;
  name: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
}

export interface KoolCatalogDefinition {
  id: string;
  name: string;
  type: string;
  options?: {
    shape?: string;
    displayName?: boolean;
  };
  features?: {
    search?: boolean;
    sort?: Array<{ id: string; name: string }>;
    filter?: Array<{
      id: string;
      name: string;
      multiselect?: boolean;
      values: Array<{ id: string; name: string }>;
    }>;
  };
}

export interface KoolEpgEntry {
  title: string;
  start: string;
  end: string;
}

export interface KoolLiveChannel {
  id: string;
  name: string;
  type: string;
  url: string;
  tags?: string[];
  ids?: {
    tvg?: string;
    [key: string]: string | undefined;
  };
  epg?: KoolEpgEntry[];
}

export interface KoolLiveCatalogResponse {
  items: KoolLiveChannel[];
  nextCursor?: string | null;
  features?: any;
}

export interface KoolLiveResolveResponse {
  url: string;
  live: boolean;
  format?: string;
  name?: string;
}

export interface KoolVodSource {
  url: string;
  name: string;
  quality?: string;
  languages?: string[];
}

export interface KoolVodSourceResponse {
  sources?: KoolVodSource[];
}

export interface KoolClientFetchRequest {
  clientFetch: {
    id: string;
    url: string;
    method?: string;
    headers?: Record<string, string>;
  };
}

export interface KoolClientFetchResult {
  id: string;
  status: number;
  headers?: Record<string, string>;
  body: string;
}

export interface KoolVodResolvedStream {
  url: string;
  live?: boolean;
  format?: string;
  headers?: Record<string, string>;
}
