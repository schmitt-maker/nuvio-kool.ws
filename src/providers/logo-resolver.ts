import { KoolLiveChannel } from "../types/kool";
import { logger } from "../utils/logger";

interface BrandRule {
  pattern: RegExp;
  url: string;
}

/**
 * High-definition brand & channel logos for major European & French channels.
 * Evaluated instantly with zero network delay.
 */
const BRAND_RULES: BrandRule[] = [
  // France Sport & Events
  { pattern: /\bdazn\b/i, url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/DAZN_4_2024.svg/960px-DAZN_4_2024.svg.png" },
  { pattern: /\bligue\s*[120-9]/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/f/f7/Logo_Ligue_1_McDonald%27s_2024.svg/800px-Logo_Ligue_1_McDonald%27s_2024.svg.png" },
  { pattern: /\bbein\s*sport\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/BeIN_Sports_logo_2017.svg/1280px-BeIN_Sports_logo_2017.svg.png" },
  { pattern: /\beurosport\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Eurosport_2015_logo.svg/1280px-Eurosport_2015_logo.svg.png" },
  { pattern: /\brmc\s*sport\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/RMC_Sport_logo_2018.svg/1280px-RMC_Sport_logo_2018.svg.png" },
  { pattern: /\bl'?equipe\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/L%27%C3%89quipe_logo.svg/1280px-L%27%C3%89quipe_logo.svg.png" },
  { pattern: /\bautomoto\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/7/75/Automoto_La_cha%C3%AEne_logo_2018.svg/960px-Automoto_La_cha%C3%AEne_logo_2018.svg.png" },
  { pattern: /\bequidia\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/0/07/Equidia_logo_2021.svg/960px-Equidia_logo_2021.svg.png" },
  { pattern: /\bprime\s*(?:video)?\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/1280px-Amazon_Prime_Video_logo.svg.png" },

  // Groupe Canal+
  { pattern: /\bcanal\s*\+\s*sport\s*360\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/6/64/Canal%2BSport_360.png" },
  { pattern: /\bcanal\s*\+\s*sport\b/i, url: "https://i.imgur.com/EOXnU15.png" },
  { pattern: /\bcanal\s*\+\s*foot\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/6/64/Canal%2BSport_360.png" },
  { pattern: /\bcanal\s*\+\s*s[eé]ries\b/i, url: "https://i.imgur.com/JxXXTGk.png" },
  { pattern: /\bcanal\s*\+\s*cin[eé]ma\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/3/30/Canal%2B_Cin%C3%A9ma%28s%29_logo_2023.svg/960px-Canal%2B_Cin%C3%A9ma%28s%29_logo_2023.svg.png" },
  { pattern: /\bcanal\s*\+\b/i, url: "https://i.imgur.com/5HcyMnW.png" },

  // France TNT & Généralistes
  { pattern: /\btf1\s*s[eé]ries\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/TF1_S%C3%A9ries_Films_logo_2018.svg/960px-TF1_S%C3%A9ries_Films_logo_2018.svg.png" },
  { pattern: /\btf1\b/i, url: "https://i.imgur.com/QxHt9NC.png" },
  { pattern: /\bfrance\s*2\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/France_2_2018.svg/960px-France_2_2018.svg.png" },
  { pattern: /\bfrance\s*3\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/2/2b/France_3_Alsace_-_Logo_2018.svg" },
  { pattern: /\bfrance\s*4\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/France_4_2018.svg/960px-France_4_2018.svg.png" },
  { pattern: /\bfrance\s*5\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/France_5_2018.svg/960px-France_5_2018.svg.png" },
  { pattern: /\bfrance\s*info\b/i, url: "https://i.imgur.com/eITXz6A.png" },
  { pattern: /\bm6\b/i, url: "https://i.imgur.com/7GVp3fW.png" },
  { pattern: /\barte\b/i, url: "https://i.imgur.com/ecXMjNl.png" },
  { pattern: /\bc8\b/i, url: "https://i.imgur.com/40mdgqQ.png" },
  { pattern: /\bw9\b/i, url: "https://i.imgur.com/reYeMuE.png" },
  { pattern: /\btmc\b/i, url: "https://upload.wikimedia.org/wikipedia/en/thumb/5/54/TMC_logo.svg/960px-TMC_logo.svg.png" },
  { pattern: /\btfx\b/i, url: "https://i.imgur.com/d91GcVf.png" },
  { pattern: /\bnrj\s*12\b/i, url: "https://i.imgur.com/Lv66Gcv.png" },
  { pattern: /\blcp\b/i, url: "https://i.imgur.com/k7UImOJ.png" },
  { pattern: /\bbfm\b/i, url: "https://i.imgur.com/YJCcczD.png" },
  { pattern: /\bcnews\b/i, url: "https://i.imgur.com/sSNhk2g.png" },
  { pattern: /\bcstar\b/i, url: "https://i.imgur.com/w4kAX1V.png" },
  { pattern: /\bgulli\b/i, url: "https://i.imgur.com/kqYssbW.png" },
  { pattern: /\b6ter\b/i, url: "https://i.imgur.com/2nd5Cox.png" },
  { pattern: /\brmc\s*story\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/4/43/Logo_RMC_Story_2025.png/960px-Logo_RMC_Story_2025.png" },
  { pattern: /\brmc\s*d[eé]couverte\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/b/b3/RMC_D%C3%A9couverte_logo_2017.svg/960px-RMC_D%C3%A9couverte_logo_2017.svg.png" },
  { pattern: /\bch[eé]rie\s*25\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/3/30/Ch%C3%A9rie_25_logo_2017.svg/960px-Ch%C3%A9rie_25_logo_2017.svg.png" },
  { pattern: /\blci\b/i, url: "https://i.imgur.com/DED8EXs.png" },
  { pattern: /\b13[eè]me\s*rue\b/i, url: "https://i.imgur.com/k0DCMTL.png" },
  { pattern: /\bparis\s*premi[eè]re\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/a/ab/Paris_Premi%C3%A8re_logo_2017.svg/960px-Paris_Premi%C3%A8re_logo_2017.svg.png" },
  { pattern: /\bt[eé]va\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e4/T%C3%A9va_logo_2018.svg/960px-T%C3%A9va_logo_2018.svg.png" },
  { pattern: /\brtl\s*9\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/6/6f/RTL9_logo_2023.svg/960px-RTL9_logo_2023.svg.png" },
  { pattern: /\bab\s*1\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/6/62/AB1_logo_2018.svg/960px-AB1_logo_2018.svg.png" },
  { pattern: /\baction\b/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/b/b0/Action_logo_2023.svg/960px-Action_logo_2023.svg.png" },
  { pattern: /\bsyfy\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Syfy_2017_logo.svg/960px-Syfy_2017_logo.svg.png" },
  { pattern: /\bwarner\s*tv\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Warner_TV_logo_2021.svg/960px-Warner_TV_logo_2021.svg.png" },
  { pattern: /\bdiscovery\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Discovery_Channel_2019.svg/960px-Discovery_Channel_2019.svg.png" },
  { pattern: /\bplan[eè]te\s*\+/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/6/63/Plan%C3%A8te%2B_logo_2016.svg/960px-Plan%C3%A8te%2B_logo_2016.svg.png" },
  { pattern: /\bparamount\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Paramount_Channel_2020.svg/960px-Paramount_Channel_2020.svg.png" },
  { pattern: /\bcom[eé]die\s*\+/i, url: "https://upload.wikimedia.org/wikipedia/fr/thumb/2/25/Com%C3%A9die%2B_logo_2016.svg/960px-Com%C3%A9die%2B_logo_2016.svg.png" },
  { pattern: /\btv5\s*monde\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/TV5MONDE_logo_2021.svg/960px-TV5MONDE_logo_2021.svg.png" },

  // International Brands
  { pattern: /\bbbc\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BBC_Logo_2021.svg/960px-BBC_Logo_2021.svg.png" },
  { pattern: /\bsky\s*sport\b/i, url: "https://upload.wikimedia.org/wikipedia/en/thumb/7/76/Sky_Sports_logo_2020.svg/960px-Sky_Sports_logo_2020.svg.png" },
  { pattern: /\btnt\s*sports?\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/TNT_Sports_%28United_Kingdom%29_logo.svg/960px-TNT_Sports_%28United_Kingdom%29_logo.svg.png" },
  { pattern: /\bmovistar\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Movistar_logo_2016.svg/960px-Movistar_logo_2016.svg.png" },
  { pattern: /\blaliga\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/LaLiga_logo_2023.svg/960px-LaLiga_logo_2023.svg.png" },
  { pattern: /\brai\s*[123]\b/i, url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Rai_-_2016.svg/960px-Rai_-_2016.svg.png" }
];

export class LogoResolver {
  private tvgLogoMap: Map<string, string> = new Map();
  private isLoaded = false;
  private isLoading = false;

  constructor() {
    // Start background fetch of 35,000+ iptv-org logos
    this.init().catch((err) => {
      logger.warn(`Could not preload iptv-org logos: ${err.message}`);
    });
  }

  /**
   * Initializes or refreshes the iptv-org logos dictionary in the background.
   */
  async init(): Promise<void> {
    if (this.isLoaded || this.isLoading) return;
    this.isLoading = true;

    try {
      logger.debug("Fetching iptv-org logos database...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch("https://iptv-org.github.io/api/logos.json", {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const logos: Array<{ channel?: string; url?: string; in_use?: boolean }> = await resp.json();
        for (const item of logos) {
          if (item.channel && item.url) {
            const key = item.channel.toLowerCase();
            if (!this.tvgLogoMap.has(key) || item.in_use) {
              this.tvgLogoMap.set(key, item.url);
            }
          }
        }
        this.isLoaded = true;
        logger.info(`✅ Loaded ${this.tvgLogoMap.size} channel logos from iptv-org database`);
      }
    } catch (err: any) {
      logger.warn(`Failed to load iptv-org logos.json: ${err.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Resolves the real logo image URL for a given Kool.ws live channel.
   * Returns null if no official logo was found.
   */
  getLogo(channel: KoolLiveChannel): string | null {
    // 1. Direct match on ids.tvg (e.g. "TF1.fr", "13emeRue.fr")
    const tvg = channel.ids?.tvg;
    if (tvg) {
      const lowerTvg = tvg.toLowerCase();
      const match = this.tvgLogoMap.get(lowerTvg);
      if (match) return match;

      // Try without country extension (e.g. "tf1" from "tf1.fr")
      const baseTvg = lowerTvg.split(".")[0];
      if (baseTvg && this.tvgLogoMap.has(baseTvg)) {
        return this.tvgLogoMap.get(baseTvg) || null;
      }
    }

    // 2. High-definition static brand rules (DAZN, Ligue 1, Canal+, beIN, TNT, etc.)
    const channelName = channel.name || "";
    for (const rule of BRAND_RULES) {
      if (rule.pattern.test(channelName)) {
        return rule.url;
      }
    }

    // 3. Name normalization attempt against the iptv-org database
    const normalizedName = channelName
      .replace(/\s*\(\d+\)/g, "")
      .replace(/\s*(?:FHD|UHD|HD|SD|4K|HEVC|BACKUP|EVENT)\b/gi, "")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase();

    if (normalizedName) {
      // Check e.g. "tf1.fr", "m6.fr", "arte.fr"
      const frCandidate = `${normalizedName}.fr`;
      if (this.tvgLogoMap.has(frCandidate)) {
        return this.tvgLogoMap.get(frCandidate) || null;
      }
      if (this.tvgLogoMap.has(normalizedName)) {
        return this.tvgLogoMap.get(normalizedName) || null;
      }
    }

    return null;
  }
}

export const logoResolver = new LogoResolver();
