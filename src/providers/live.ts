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

  return {
    id: channelId,
    type: "tv",
    name: channel.name,
    poster: DEFAULT_TV_ICON,
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
