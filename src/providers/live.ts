import { koolClient } from "../kool-client/client";
import { KoolLiveChannel } from "../types/kool";
import { StremioMetaItem, StremioStream } from "../types/stremio";
import { logger } from "../utils/logger";
import { COUNTRY_FLAGS, ALL_CATEGORY_IDS } from "../config/categories";

const DEFAULT_TV_ICON = "https://img.icons8.com/color/452/dog.png";


/**
 * Maps a Kool.ws live channel to a Stremio catalog meta item.
 */
export function formatChannelMeta(channel: KoolLiveChannel): StremioMetaItem {
  let description = `Chaîne en direct : ${channel.name}`;

  if (channel.epg && channel.epg.length > 0) {
    const epgLines: string[] = [];

    channel.epg.slice(0, 4).forEach((epg, idx) => {
      const startTime = new Date(epg.start).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const endTime = new Date(epg.end).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });

      if (idx === 0) {
        epgLines.push(`📺 En direct : ${epg.title} (${startTime} - ${endTime})`);
      } else if (idx === 1) {
        epgLines.push(`⏭️ À suivre : ${epg.title} (${startTime} - ${endTime})`);
      } else {
        epgLines.push(`   • ${epg.title} (${startTime})`);
      }
    });

    if (epgLines.length > 0) {
      description = epgLines.join("\n");
    }
  }

  const tags = channel.tags || [];
  const primaryTag = tags[0] || "TV";
  const channelId = `kool:live:${channel.id}`;
  const poster = (primaryTag && COUNTRY_FLAGS[primaryTag]) || DEFAULT_TV_ICON;

  return {
    id: channelId,
    type: "tv",
    name: channel.name,
    poster,
    posterShape: "landscape",
    genres: tags,
    description,
    releaseInfo: primaryTag,
    behaviorHints: {
      defaultVideoId: channelId
    },
    videos: [
      {
        id: channelId,
        title: channel.name,
        released: new Date().toISOString()
      }
    ]
  };
}

export class LiveProvider {
  /**
   * Returns catalog items for Stremio live TV with optional genre, search and active categories filter.
   */
  async getCatalog(
    genre?: string,
    search?: string,
    userCategories?: string[]
  ): Promise<StremioMetaItem[]> {
    logger.debug(
      `LiveProvider.getCatalog - genre: ${genre || "none"}, search: ${search || "none"}, userCategories: ${
        userCategories?.length ?? "all"
      }`
    );

    // 1. If a specific genre is selected from Nuvio dropdown
    if (genre) {
      const channels = await koolClient.getLiveChannels(search, genre);
      return channels.map(formatChannelMeta);
    }

    // 2. If a search query is active
    if (search) {
      const channels = await koolClient.getLiveChannels(search);
      if (userCategories && userCategories.length > 0) {
        const filtered = channels.filter(
          (c) => !c.tags || c.tags.length === 0 || c.tags.some((t) => userCategories.includes(t))
        );
        return filtered.map(formatChannelMeta);
      }
      return channels.map(formatChannelMeta);
    }

    // 3. Default view (Home screen / Board)
    // If user filtered specific categories, fetch them in parallel and combine
    if (userCategories && userCategories.length > 0 && userCategories.length < ALL_CATEGORY_IDS.length) {
      const results = await Promise.all(
        userCategories.map((cat) => koolClient.getLiveChannels(undefined, cat))
      );
      const seen = new Set<string>();
      const combined: KoolLiveChannel[] = [];

      for (const list of results) {
        for (const ch of list) {
          if (!seen.has(ch.id)) {
            seen.add(ch.id);
            combined.push(ch);
          }
        }
      }
      return combined.map(formatChannelMeta);
    }

    // 4. Default fallback: all channels
    const channels = await koolClient.getLiveChannels(search, genre);
    return channels.map(formatChannelMeta);
  }

  /**
   * Returns metadata for a specific live channel ID.
   */
  async getMeta(channelId: string): Promise<StremioMetaItem | null> {
    const channel = await koolClient.getLiveChannelDetails(channelId);
    if (!channel) {
      return null;
    }
    return formatChannelMeta(channel);
  }

  /**
   * Resolves and returns playback stream for a channel.
   */
  async getStream(channelId: string): Promise<StremioStream[]> {
    const channel = await koolClient.getLiveChannelDetails(channelId);

    if (!channel || !channel.url) {
      logger.warn(`Channel ${channelId} not found or has no URL`);
      return [];
    }

    const resolved = await koolClient.resolveLiveChannel(channel.url);
    if (!resolved || !resolved.url) {
      logger.warn(`Could not resolve stream for channel ${channel.name}`);
      return [];
    }

    const currentTitle =
      channel.epg && channel.epg[0] ? channel.epg[0].title : "En direct";

    return [
      {
        name: "Kool.ws Live",
        title: `${channel.name}\n▶️ ${currentTitle}`,
        url: resolved.url,
        behaviorHints: {
          notWebReady: true
        }
      }
    ];
  }
}

export const liveProvider = new LiveProvider();
