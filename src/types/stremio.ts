/**
 * Type definitions for Stremio Addon Protocol v2
 */

export interface StremioCatalogExtra {
  name: string;
  isRequired?: boolean;
  options?: string[];
}

export interface StremioCatalogDefinition {
  type: string;
  id: string;
  name: string;
  extra?: StremioCatalogExtra[];
}

export type StremioResource =
  | "catalog"
  | "meta"
  | "stream"
  | "subtitles"
  | {
      name: "catalog" | "meta" | "stream" | "subtitles";
      types: Array<"movie" | "series" | "tv" | "channel" | "other">;
      idPrefixes?: string[];
    };

export interface StremioManifest {
  id: string;
  version: string;
  name: string;
  description: string;
  logo?: string;
  background?: string;
  resources: StremioResource[];
  types: Array<"movie" | "series" | "tv" | "channel" | "other">;
  catalogs: StremioCatalogDefinition[];
  idPrefixes: string[];
  behaviorHints?: {
    configurable?: boolean;
    configurationRequired?: boolean;
  };
}

export interface StremioMetaVideo {
  id: string;
  title: string;
  released?: string;
  thumbnail?: string;
  episode?: number;
  season?: number;
  overview?: string;
}

export interface StremioMetaItem {
  id: string;
  type: string;
  name: string;
  poster?: string;
  posterShape?: "poster" | "landscape" | "square";
  background?: string;
  logo?: string;
  description?: string;
  releaseInfo?: string;
  genres?: string[];
  behaviorHints?: {
    defaultVideoId?: string;
    isCinema?: number;
  };
  videos?: StremioMetaVideo[];
}

export interface StremioCatalogResponse {
  metas: StremioMetaItem[];
}

export interface StremioMetaResponse {
  meta: StremioMetaItem;
}

export interface StremioStreamBehaviorHints {
  notWebReady?: boolean;
  bingeGroup?: string;
  proxyHeaders?: {
    request?: Record<string, string>;
    response?: Record<string, string>;
  };
}

export interface StremioStream {
  name: string;
  title?: string;
  url?: string;
  behaviorHints?: StremioStreamBehaviorHints;
}

export interface StremioStreamResponse {
  streams: StremioStream[];
}

export interface AddonUserConfig {
  home: boolean;
  categories?: string[];
}

