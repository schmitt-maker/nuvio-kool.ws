import { config } from "../config";
import { koolClient } from "../kool-client/client";
import { KoolVodSource } from "../types/kool";
import { StremioStream } from "../types/stremio";
import { logger } from "../utils/logger";

function formatLanguageBadge(languages?: string[]): string {
  if (!languages || languages.length === 0) return "🌐 Multi";
  return languages
    .map((lang) => {
      switch (lang.toLowerCase()) {
        case "fr":
          return "🇫🇷 FR";
        case "en":
          return "🇬🇧 EN";
        case "de":
          return "🇩🇪 DE";
        case "es":
          return "🇪🇸 ES";
        case "it":
          return "🇮🇹 IT";
        case "tr":
          return "🇹🇷 TR";
        default:
          return `[${lang.toUpperCase()}]`;
      }
    })
    .join(" ");
}

function getHostName(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export class VodProvider {
  /**
   * Generates Stremio streams for a movie or TV series episode.
   */
  async getStreams(
    mediaType: "movie" | "series",
    id: string
  ): Promise<StremioStream[]> {
    logger.debug(`VodProvider.getStreams - type: ${mediaType}, id: ${id}`);
    const sources = await koolClient.getVodSources(mediaType, id);

    if (sources.length === 0) {
      return [];
    }

    // Sort sources: prioritize French (FR), then English (EN), then others
    const sortedSources = [...sources].sort((a, b) => {
      const aIsFr = (a.languages || []).some((l) => l.toLowerCase() === "fr");
      const bIsFr = (b.languages || []).some((l) => l.toLowerCase() === "fr");
      if (aIsFr && !bIsFr) return -1;
      if (!aIsFr && bIsFr) return 1;

      const aIsEn = (a.languages || []).some((l) => l.toLowerCase() === "en");
      const bIsEn = (b.languages || []).some((l) => l.toLowerCase() === "en");
      if (aIsEn && !bIsEn) return -1;
      if (!aIsEn && bIsEn) return 1;

      return 0;
    });

    return sortedSources.map((source: KoolVodSource) => {
      const host = getHostName(source.url);
      const hostLabel = host ? ` (${host})` : "";
      const langBadge = formatLanguageBadge(source.languages);
      const quality = source.quality ? `[${source.quality}]` : "[HD]";

      // Stream title visible on Nuvio / TV remote
      const title = `${langBadge} ${quality}\n${source.name}${hostLabel}`;

      // URL points to our on-demand resolver endpoint
      const streamUrl = `${config.baseUrl}/play/vod?sourceUrl=${encodeURIComponent(
        source.url
      )}`;

      return {
        name: "Kool.ws",
        title,
        url: streamUrl,
        behaviorHints: {
          notWebReady: true
        }
      };
    });
  }
}

export const vodProvider = new VodProvider();
