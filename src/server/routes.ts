import { Router, Request, Response } from "express";
import { StremioManifest, AddonUserConfig } from "../types/stremio";
import { liveProvider } from "../providers/live";
import { vodProvider } from "../providers/vod";
import { koolClient } from "../kool-client/client";
import { logger } from "../utils/logger";
import { config } from "../config";
import { ALL_CATEGORY_IDS } from "../config/categories";
import { renderLandingPage } from "./landing-page";

export const stremioRouter = Router();

/**
 * Resolves the public base URL dynamically from the incoming HTTP request
 * or from the BASE_URL environment variable if set.
 */
export function getBaseUrl(req: Request): string {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, "");
  }
  const host = req.get("host") || `localhost:${config.port}`;
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  return `${proto}://${host}`;
}

/**
 * Parses user configuration from path slug (e.g. base64url or "no-home")
 * or query parameters.
 */
export function parseUserConfig(configRaw?: string, query?: any): AddonUserConfig {
  const isNoHomeSlug = configRaw === "no-home" || query?.home === "false" || query?.home === "0";

  let home = !isNoHomeSlug;
  let categories: string[] | undefined = undefined;

  // Try decoding base64url or JSON
  if (configRaw && configRaw !== "no-home" && configRaw !== "home") {
    try {
      const decoded = Buffer.from(configRaw, "base64url").toString("utf-8");
      if (decoded.startsWith("{") && decoded.endsWith("}")) {
        const parsed = JSON.parse(decoded);
        if (typeof parsed.home === "boolean") {
          home = parsed.home;
        }
        if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          categories = parsed.categories;
        }
      }
    } catch {
      // Fallback: URLSearchParams
      try {
        const params = new URLSearchParams(configRaw);
        if (params.has("home")) {
          home = params.get("home") !== "0" && params.get("home") !== "false";
        }
        const catsRaw = params.get("cats") || params.get("categories");
        if (catsRaw) {
          categories = catsRaw.split(",").map((c) => c.trim()).filter(Boolean);
        }
      } catch {
        // ignore
      }
    }
  }

  // Check query params overrides
  if (query) {
    if (query.home === "false" || query.home === "0") {
      home = false;
    } else if (query.home === "true" || query.home === "1") {
      home = true;
    }
    const catsQuery = query.cats || query.categories;
    if (typeof catsQuery === "string") {
      categories = catsQuery.split(",").map((c: string) => c.trim()).filter(Boolean);
    }
  }

  return { home, categories };
}

/**
 * Builds the Stremio manifest dynamically based on user configuration.
 */
export function getManifest(baseUrl: string, userConfig: AddonUserConfig): StremioManifest {
  const isHomeEnabled = userConfig.home !== false;
  const categories = userConfig.categories && userConfig.categories.length > 0
    ? userConfig.categories
    : ALL_CATEGORY_IDS;

  return {
    id: isHomeEnabled ? "org.koolws.nuvio" : "org.koolws.nuvio.nohome",
    version: "1.0.0",
    name: isHomeEnabled ? "Kool.ws (Live TV & VOD)" : "Kool.ws (VOD)",
    description: isHomeEnabled
      ? `300+ Chaînes Live TV (${categories.length} catégories) avec EPG & Sources VOD Kool.ws`
      : "Sources VOD Kool.ws pour Films & Séries (Mode discret sans catalogue d'accueil)",
    logo: "https://img.icons8.com/color/452/dog.png",
    background: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85",
    behaviorHints: {
      configurable: true,
      configurationRequired: false
    },
    resources: isHomeEnabled
      ? [
          {
            name: "catalog",
            types: ["tv"],
            idPrefixes: ["kool:live:"]
          },
          {
            name: "meta",
            types: ["tv"],
            idPrefixes: ["kool:live:"]
          },
          {
            name: "stream",
            types: ["tv", "movie", "series"],
            idPrefixes: ["kool:live:", "tt", "tmdb:"]
          }
        ]
      : [
          {
            name: "meta",
            types: ["tv"],
            idPrefixes: ["kool:live:"]
          },
          {
            name: "stream",
            types: ["tv", "movie", "series"],
            idPrefixes: ["kool:live:", "tt", "tmdb:"]
          }
        ],
    types: ["tv", "movie", "series"],
    catalogs: isHomeEnabled
      ? [
          {
            type: "tv",
            id: "kool_live_tv",
            name: "Kool Live TV",
            extra: [
              {
                name: "genre",
                isRequired: false,
                options: categories
              },
              {
                name: "search",
                isRequired: false
              }
            ]
          }
        ]
      : [],
    idPrefixes: ["kool:live:", "tt", "tmdb:"]
  };
}

// Helper to parse extra path parameters (e.g. "genre=France&search=TF1.json")
function parseExtraParams(extraRaw?: string): { genre?: string; search?: string } {
  if (!extraRaw) return {};
  const cleaned = extraRaw.replace(/\.json$/, "");
  const params: { genre?: string; search?: string } = {};

  const pairs = cleaned.split("&");
  for (const pair of pairs) {
    const [key, val] = pair.split("=");
    if (key && val) {
      const decoded = decodeURIComponent(val);
      if (key === "genre") params.genre = decoded;
      if (key === "search") params.search = decoded;
    }
  }
  return params;
}

// 1. Manifest routes
const manifestPaths = ["/manifest.json", "/:config/manifest.json"];
stremioRouter.get(manifestPaths, (req: Request, res: Response) => {
  const configParam = Array.isArray(req.params.config) ? req.params.config[0] : req.params.config;
  const userConfig = parseUserConfig(configParam, req.query);
  const manifest = getManifest(getBaseUrl(req), userConfig);

  res.setHeader("Cache-Control", "max-age=3600, public");
  res.json(manifest);
});

// 2. Catalog routes
const catalogPaths = [
  "/catalog/:type/:id.json",
  "/:config/catalog/:type/:id.json",
  "/catalog/:type/:id/:extra",
  "/:config/catalog/:type/:id/:extra"
];
stremioRouter.get(catalogPaths, async (req: Request, res: Response) => {
  const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const extra = Array.isArray(req.params.extra) ? req.params.extra[0] : req.params.extra;
  const configParam = Array.isArray(req.params.config) ? req.params.config[0] : req.params.config;
  const userConfig = parseUserConfig(configParam, req.query);

  if (type !== "tv" || id !== "kool_live_tv" || userConfig.home === false) {
    res.json({ metas: [] });
    return;
  }

  try {
    const { genre, search } = parseExtraParams(extra);
    const metas = await liveProvider.getCatalog(genre, search, userConfig.categories);
    res.setHeader("Cache-Control", "max-age=300, public");
    res.json({ metas });
  } catch (err: any) {
    logger.error(`Error in /catalog route: ${err.message}`);
    res.json({ metas: [] });
  }
});

// 3. Meta routes (for channel details)
const metaPaths = ["/meta/:type/:id.json", "/:config/meta/:type/:id.json"];
stremioRouter.get(metaPaths, async (req: Request, res: Response) => {
  const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const cleanedId = (rawId || "").replace(/\.json$/, "");

  if (type !== "tv" || !cleanedId.startsWith("kool:live:")) {
    res.json({ meta: null });
    return;
  }

  try {
    const meta = await liveProvider.getMeta(cleanedId);
    if (!meta) {
      res.json({ meta: null });
      return;
    }
    res.setHeader("Cache-Control", "max-age=300, public");
    res.json({ meta });
  } catch (err: any) {
    logger.error(`Error in /meta route: ${err.message}`);
    res.json({ meta: null });
  }
});

// 4. Stream routes
const streamPaths = ["/stream/:type/:id.json", "/:config/stream/:type/:id.json"];
stremioRouter.get(streamPaths, async (req: Request, res: Response) => {
  const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const cleanedId = (rawId || "").replace(/\.json$/, "");
  const baseUrl = getBaseUrl(req);

  try {
    if (type === "tv" && cleanedId.startsWith("kool:live:")) {
      const streams = await liveProvider.getStream(cleanedId);
      res.setHeader("Cache-Control", "max-age=120, public");
      res.json({ streams });
      return;
    }

    if (type === "movie" || type === "series") {
      const streams = await vodProvider.getStreams(type, cleanedId, baseUrl);
      res.setHeader("Cache-Control", "max-age=300, public");
      res.json({ streams });
      return;
    }

    res.json({ streams: [] });
  } catch (err: any) {
    logger.error(`Error in /stream route for ${type}/${rawId}: ${err.message}`);
    res.json({ streams: [] });
  }
});

// 5. On-demand VOD resolver & playback endpoint
const playPaths = ["/play/vod", "/:config/play/vod"];
stremioRouter.get(playPaths, async (req: Request, res: Response) => {
  const sourceUrl = req.query.sourceUrl as string;
  const baseUrl = getBaseUrl(req);

  if (!sourceUrl) {
    res.status(400).send("Missing sourceUrl parameter");
    return;
  }

  try {
    logger.info(`Resolving VOD playback for: ${sourceUrl}`);
    const resolved = await koolClient.resolveVodSource(sourceUrl);

    if (!resolved || !resolved.url) {
      logger.warn(`Could not resolve stream for ${sourceUrl}`);
      res.status(502).send("Unable to resolve playable video stream from provider");
      return;
    }

    logger.info(`Stream resolved successfully -> ${resolved.url}`);

    // If stream requires proxy headers (e.g. Referer), redirect to proxy endpoint
    if (resolved.headers && Object.keys(resolved.headers).length > 0) {
      const proxyUrl = `${baseUrl}/proxy/stream?url=${encodeURIComponent(
        resolved.url
      )}&headers=${encodeURIComponent(JSON.stringify(resolved.headers))}`;
      res.redirect(302, proxyUrl);
      return;
    }

    // Direct HLS redirect
    res.redirect(302, resolved.url);
  } catch (err: any) {
    logger.error(`Error in /play/vod: ${err.message}`);
    res.status(500).send("Internal server error resolving stream");
  }
});

// 6. Streaming proxy endpoint
const proxyPaths = ["/proxy/stream", "/:config/proxy/stream"];
stremioRouter.get(proxyPaths, async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  const rawHeaders = req.query.headers as string;

  if (!targetUrl) {
    res.status(400).send("Missing url parameter");
    return;
  }

  try {
    let customHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    };

    if (rawHeaders) {
      try {
        const parsed = JSON.parse(rawHeaders);
        customHeaders = { ...customHeaders, ...parsed };
      } catch {
        // ignore parse error
      }
    }

    const resp = await fetch(targetUrl, {
      headers: customHeaders,
      redirect: "follow"
    });

    if (!resp.ok) {
      res.status(resp.status).send(`Upstream error: ${resp.statusText}`);
      return;
    }

    // Forward content-type and headers
    const contentType = resp.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Pipe response stream to client
    if (resp.body) {
      const reader = resp.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (err: any) {
    logger.error(`Proxy stream error for ${targetUrl}: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).send("Proxy error");
    }
  }
});

// 7. Status / Diagnostic endpoint
stremioRouter.get(["/status", "/health"], (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);
  res.json({
    addon: "kool.ws-addon",
    status: "online",
    version: "1.0.0",
    manifestHome: `${baseUrl}/manifest.json`,
    manifestNoHome: `${baseUrl}/no-home/manifest.json`,
    categoriesAvailable: ALL_CATEGORY_IDS.length
  });
});

// 8. Interactive Configuration & Landing page
const landingPaths = ["/", "/configure", "/:config/configure", "/:config"];
stremioRouter.get(landingPaths, (req: Request, res: Response, next: any) => {
  const configParam = Array.isArray(req.params.config) ? req.params.config[0] : req.params.config;

  // Let static / well-known files pass through if needed
  if (configParam && (configParam.endsWith(".json") || configParam.endsWith(".ico") || configParam.endsWith(".png"))) {
    return next();
  }

  const baseUrl = getBaseUrl(req);

  // If programmatic JSON requested from root
  if (
    req.path === "/" &&
    req.headers.accept &&
    req.headers.accept.includes("application/json") &&
    !req.headers.accept.includes("text/html")
  ) {
    res.json({
      addon: "kool.ws-addon",
      version: "1.0.0",
      description: "Kool.ws Live TV and VOD streams for Stremio and Nuvio TV",
      manifestHome: `${baseUrl}/manifest.json`,
      manifestNoHome: `${baseUrl}/no-home/manifest.json`
    });
    return;
  }

  const userConfig = parseUserConfig(configParam, req.query);
  const html = renderLandingPage(baseUrl, userConfig);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});
