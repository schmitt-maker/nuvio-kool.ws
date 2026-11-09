import { config } from "../config";
import { logger } from "../utils/logger";
import { KoolClientFetchRequest, KoolClientFetchResult, KoolVodResolvedStream } from "../types/kool";

/**
 * Executes the mHub v2 clientFetch resolution loop.
 * Resolves upstream hosters (e.g. Voe, Vidsonic, etc.) by delegating HTTP fetches
 * and posting results back to Kool.ws /vod/client-fetch until a direct stream is obtained.
 */
export async function executeClientFetchChain(
  initialResponse: KoolClientFetchRequest | KoolVodResolvedStream | any
): Promise<KoolVodResolvedStream | null> {
  let curr = initialResponse;
  let hops = 0;

  while (curr && curr.clientFetch && hops < config.maxClientFetchHops) {
    hops++;
    const cf = curr.clientFetch;
    logger.debug(`clientFetch hop #${hops} -> ${cf.url}`);

    const reqHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      ...(cf.headers || {})
    };

    let fetchStatus = 200;
    let respHeaders: Record<string, string> = {};
    let body = "";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.httpTimeoutMs);

      const resp = await fetch(cf.url, {
        method: cf.method || "GET",
        headers: reqHeaders,
        signal: controller.signal,
        redirect: "follow"
      });
      clearTimeout(timeoutId);

      fetchStatus = resp.status;
      resp.headers.forEach((val, key) => {
        respHeaders[key.toLowerCase()] = val;
      });
      body = await resp.text();
    } catch (err: any) {
      logger.warn(`clientFetch failed on hop #${hops} (${cf.url}): ${err.message}`);
      return null;
    }

    const payload: KoolClientFetchResult = {
      id: cf.id,
      status: fetchStatus,
      headers: respHeaders,
      body
    };

    try {
      const postController = new AbortController();
      const postTimeout = setTimeout(() => postController.abort(), config.httpTimeoutMs);

      const postResp = await fetch(`${config.koolBaseUrl}/vod/client-fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: postController.signal
      });
      clearTimeout(postTimeout);

      if (!postResp.ok) {
        logger.warn(`Kool client-fetch POST returned HTTP ${postResp.status}`);
        return null;
      }

      curr = await postResp.json();
    } catch (err: any) {
      logger.warn(`Error posting to /vod/client-fetch on hop #${hops}: ${err.message}`);
      return null;
    }
  }

  if (curr && typeof curr.url === "string") {
    return curr as KoolVodResolvedStream;
  }

  logger.warn(`clientFetch chain terminated without direct stream URL after ${hops} hops`);
  return null;
}
