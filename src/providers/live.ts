import { koolClient } from "../kool-client/client";
import { KoolLiveChannel } from "../types/kool";
import { StremioMetaItem, StremioStream } from "../types/stremio";
import { logger } from "../utils/logger";

const DEFAULT_TV_ICON = "https://img.icons8.com/color/452/dog.png";

/**
 * Maps a Kool.ws live channel to a Stremio catalog meta item.
 */
export function formatChannelMeta(channel: KoolLiveChannel): StremioMetaItem {
  let description = `Chaîne en direct : ${channel.name}`;

  if (channel.epg && channel.epg.length > 0) {
    const epgLines: string[] = [];
    const now = new Date();

    const currentEpg = channel.epg[0];
    if (currentEpg) {
      const startTime = new Date(currentEpg.start).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const endTime = new Date(currentEpg.end).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
      epgLines.push(`📺 En direct : ${currentEpg.title} (${startTime} - ${endTime})`);
    }

    const nextEpg = channel.epg[1];
    if (nextEpg) {
      const startTime = new Date(nextEpg.start).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
      epgLines.push(`⏭️ À suivre : ${nextEpg.title} (${startTime})`);
    }

    if (epgLines.length > 0) {
      description = epgLines.join("\n");
    }
  }

  // Generate poster or placeholder based on country/tag
  const tags = channel.tags || [];
  const primaryTag = tags[0] || "TV";

  return {
    id: `kool:live:${channel.id}`,
    type: "tv",
    name: channel.name,
    poster: DEFAULT_TV_ICON,
    posterShape: "landscape",
    genres: tags,
    description,
    releaseInfo: primaryTag
  };
}

export class LiveProvider {
  /**
   * Returns catalog items for Stremio live TV.
   */
  async getCatalog(genre?: string, search?: string): Promise<StremioMetaItem[]> {
    logger.debug(`LiveProvider.getCatalog - genre: ${genre}, search: ${search}`);
    const channels = await koolClient.getLiveChannels(search, genre);
    return channels.map(formatChannelMeta);
  }

  /**
   * Returns metadata for a specific live channel ID.
   */
  async getMeta(channelId: string): Promise<StremioMetaItem | null> {
    const numericId = channelId.replace("kool:live:", "");
    const channels = await koolClient.getLiveChannels();
    const found = channels.find((c) => c.id === numericId);
    if (!found) {
      return null;
    }
    return formatChannelMeta(found);
  }

  /**
   * Resolves and returns playback stream for a channel.
   */
  async getStream(channelId: string): Promise<StremioStream[]> {
    const numericId = channelId.replace("kool:live:", "");
    const channels = await koolClient.getLiveChannels();
    const found = channels.find((c) => c.id === numericId);

    if (!found) {
      logger.warn(`Channel ${channelId} not found in live channels`);
      return [];
    }

    const resolved = await koolClient.resolveLiveChannel(found.url);
    if (!resolved || !resolved.url) {
      logger.warn(`Could not resolve stream for channel ${found.name}`);
      return [];
    }

    const currentTitle = found.epg && found.epg[0] ? found.epg[0].title : "En direct";

    return [
      {
        name: "Kool.ws Live",
        title: `${found.name}\n▶️ ${currentTitle}`,
        url: resolved.url,
        behaviorHints: {
          notWebReady: true
        }
      }
    ];
  }
}

export const liveProvider = new LiveProvider();
