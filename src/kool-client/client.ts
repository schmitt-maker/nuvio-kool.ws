import { config } from "../config";
import { logger } from "../utils/logger";
import { memoryCache } from "../utils/cache";
import {
  KoolLiveChannel,
  KoolLiveCatalogResponse,
  KoolLiveResolveResponse,
  KoolVodSource,
  KoolVodSourceResponse,
  KoolVodResolvedStream
} from "../types/kool";
import { executeClientFetchChain } from "./client-fetch";

export class KoolClient {
  private baseUrl: string;

  constructor(baseUrl: string = config.koolBaseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Retrieves live TV channels with optional filtering and search.
   */
  async getLiveChannels(search?: string, group?: string): Promise<KoolLiveChannel[]> {
    const cacheKey = `live_channels_${search || ""}_${group || ""}`;
    const cached = memoryCache.get<KoolLiveChannel[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = new URL(`${this.baseUrl}/live/catalog/live/channels.json`);
      if (search) {
        url.searchParams.set("search", search);
      }
      if (group) {
        url.searchParams.set("filter[group]", group);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.httpTimeoutMs);

      const resp = await fetch(url.toString(), {
        headers: { "Accept": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        logger.error(`getLiveChannels returned HTTP ${resp.status}`);
        return [];
      }

      const data: KoolLiveCatalogResponse = await resp.json();
      const channels = data.items || [];

      // Cache result
      memoryCache.set(cacheKey, channels, config.cache.liveCatalogTtlMs);
      return channels;
    } catch (err: any) {
      logger.error(`Error in getLiveChannels: ${err.message}`);
      return [];
    }
  }

  /**
   * Resolves a live TV channel to its playable HLS master playlist URL.
   */
  async resolveLiveChannel(channelPlayUrl: string): Promise<KoolLiveResolveResponse | null> {
    const cacheKey = `live_resolve_${channelPlayUrl}`;
    const cached = memoryCache.get<KoolLiveResolveResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const resolveEndpoint = `${this.baseUrl}/live/resolve?url=${encodeURIComponent(channelPlayUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.httpTimeoutMs);

      const resp = await fetch(resolveEndpoint, {
        headers: { "Accept": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        logger.warn(`resolveLiveChannel failed with HTTP ${resp.status}`);
        return null;
      }

      const data: KoolLiveResolveResponse = await resp.json();
      if (data && data.url) {
        memoryCache.set(cacheKey, data, config.cache.resolvedStreamTtlMs);
        return data;
      }
      return null;
    } catch (err: any) {
      logger.error(`Error resolving live channel ${channelPlayUrl}: ${err.message}`);
      return null;
    }
  }

  /**
   * Retrieves VOD streaming sources for a movie or series episode.
   * Format for id:
   *  - Movie: "tt1375666" or "tmdb:27205"
   *  - Series episode: "tt0903747:1:1" or "tmdb:1396:1:1"
   */
  async getVodSources(mediaType: "movie" | "series", id: string): Promise<KoolVodSource[]> {
    const koolType = mediaType === "series" ? "series" : "video";
    
    // Normalize id format: if it starts with "tt", prefix with "imdb:"
    let normalizedId = id;
    if (id.startsWith("tt")) {
      normalizedId = `imdb:${id}`;
    }

    const cacheKey = `vod_sources_${koolType}_${normalizedId}`;
    const cached = memoryCache.get<KoolVodSource[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const endpoint = `${this.baseUrl}/vod/source/${koolType}/${normalizedId}.json`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.httpTimeoutMs);

      const resp = await fetch(endpoint, {
        headers: { "Accept": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        if (resp.status === 404) {
          logger.debug(`No sources found for ${koolType}/${normalizedId}`);
        } else {
          logger.warn(`getVodSources returned HTTP ${resp.status} for ${normalizedId}`);
        }
        return [];
      }

      const data: KoolVodSourceResponse = await resp.json();
      const sources = data.sources || [];
      memoryCache.set(cacheKey, sources, config.cache.vodSourcesTtlMs);
      return sources;
    } catch (err: any) {
      logger.error(`Error fetching VOD sources for ${normalizedId}: ${err.message}`);
      return [];
    }
  }

  /**
   * Resolves a VOD hoster source URL to a playable stream.
   * Handles direct answers as well as multi-hop clientFetch chains.
   */
  async resolveVodSource(sourceUrl: string): Promise<KoolVodResolvedStream | null> {
    const cacheKey = `vod_resolve_${sourceUrl}`;
    const cached = memoryCache.get<KoolVodResolvedStream>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const endpoint = `${this.baseUrl}/vod/resolve?url=${encodeURIComponent(sourceUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.httpTimeoutMs);

      const resp = await fetch(endpoint, {
        headers: { "Accept": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        logger.warn(`resolveVodSource HTTP ${resp.status} for ${sourceUrl}`);
        return null;
      }

      const data = await resp.json();

      let resolved: KoolVodResolvedStream | null = null;
      if (data && data.clientFetch) {
        resolved = await executeClientFetchChain(data);
      } else if (data && typeof data.url === "string") {
        resolved = data as KoolVodResolvedStream;
      }

      if (resolved && resolved.url) {
        memoryCache.set(cacheKey, resolved, config.cache.resolvedStreamTtlMs);
        return resolved;
      }
      return null;
    } catch (err: any) {
      logger.error(`Error resolving VOD source ${sourceUrl}: ${err.message}`);
      return null;
    }
  }
}

export const koolClient = new KoolClient();
