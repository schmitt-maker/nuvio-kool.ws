import { Router, Request, Response } from "express";
import { StremioManifest } from "../types/stremio";
import { liveProvider } from "../providers/live";
import { vodProvider } from "../providers/vod";
import { koolClient } from "../kool-client/client";
import { logger } from "../utils/logger";
import { config } from "../config";

export const stremioRouter = Router();

const manifest: StremioManifest = {
  id: "org.koolws.nuvio",
  version: "1.0.0",
  name: "Kool.ws (Live TV & VOD)",
  description:
    "300+ Live TV Channels (France, Sport, International) with EPG & Movies / Series sources from Kool.ws",
  logo: "https://img.icons8.com/color/452/dog.png",
  background: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85",
  resources: [
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
  ],
  types: ["tv", "movie", "series"],
  catalogs: [
    {
      type: "tv",
      id: "kool_live_tv",
      name: "Kool Live TV",
      extra: [
        {
          name: "genre",
          isRequired: false,
          options: [
            "France",
            "France Sport",
            "Germany",
            "United Kingdom",
            "Spain",
            "Italy",
            "Turkey",
            "Arabia",
            "Portugal",
            "Netherlands",
            "Poland",
            "Russia"
          ]
        },
        {
          name: "search",
          isRequired: false
        }
      ]
    }
  ],
  idPrefixes: ["kool:live:", "tt", "tmdb:"]
};

// 1. Manifest
stremioRouter.get("/manifest.json", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "max-age=86400, public");
  res.json(manifest);
});

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

// 2. Catalog routes
stremioRouter.get(
  ["/catalog/:type/:id.json", "/catalog/:type/:id/:extra"],
  async (req: Request, res: Response) => {
    const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const extra = Array.isArray(req.params.extra) ? req.params.extra[0] : req.params.extra;

    if (type !== "tv" || id !== "kool_live_tv") {
      res.json({ metas: [] });
      return;
    }

    try {
      const { genre, search } = parseExtraParams(extra);
      const metas = await liveProvider.getCatalog(genre, search);
      res.setHeader("Cache-Control", "max-age=300, public");
      res.json({ metas });
    } catch (err: any) {
      logger.error(`Error in /catalog route: ${err.message}`);
      res.json({ metas: [] });
    }
  }
);

// 3. Meta route (for channel details)
stremioRouter.get("/meta/:type/:id.json", async (req: Request, res: Response) => {
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
stremioRouter.get("/stream/:type/:id.json", async (req: Request, res: Response) => {
  const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const cleanedId = (rawId || "").replace(/\.json$/, "");

  try {
    if (type === "tv" && cleanedId.startsWith("kool:live:")) {
      const streams = await liveProvider.getStream(cleanedId);
      res.setHeader("Cache-Control", "max-age=120, public");
      res.json({ streams });
      return;
    }

    if (type === "movie" || type === "series") {
      const streams = await vodProvider.getStreams(type, cleanedId);
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
stremioRouter.get("/play/vod", async (req: Request, res: Response) => {
  const sourceUrl = req.query.sourceUrl as string;

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
      const proxyUrl = `/proxy/stream?url=${encodeURIComponent(
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

// 6. Streaming proxy endpoint (for streams requiring custom headers or IP-proxying)
stremioRouter.get("/proxy/stream", async (req: Request, res: Response) => {
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
