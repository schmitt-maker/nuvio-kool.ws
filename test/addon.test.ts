import { koolClient } from "../src/kool-client/client";
import { liveProvider } from "../src/providers/live";
import { vodProvider } from "../src/providers/vod";
import { parseUserConfig, getManifest } from "../src/server/routes";
import { renderLandingPage } from "../src/server/landing-page";
import app from "../src/index";
import http from "http";

async function runTests() {
  console.log("==========================================");
  console.log("🧪 Début des tests d'intégration Kool.ws");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  async function assertTest(name: string, fn: () => Promise<void>) {
    try {
      process.stdout.write(`⏳ ${name}... `);
      await fn();
      console.log("✅ OK");
      passed++;
    } catch (err: any) {
      console.log(`❌ ÉCHEC : ${err.message}`);
      failed++;
    }
  }

  // Test 1: Fetch Live TV channels
  await assertTest("Récupération des chaînes Live TV", async () => {
    const channels = await koolClient.getLiveChannels();
    if (!channels || channels.length < 50) {
      throw new Error(`Nombre de chaînes insuffisant : ${channels?.length}`);
    }
  });

  // Test 2: Search Live TV
  await assertTest("Recherche de chaîne (ex: TF1)", async () => {
    const channels = await koolClient.getLiveChannels("TF1");
    if (!channels || channels.length === 0) {
      throw new Error("Aucune chaîne trouvée pour 'TF1'");
    }
    const hasTf1 = channels.some((c) => c.name.toUpperCase().includes("TF1"));
    if (!hasTf1) {
      throw new Error("La chaîne retournée ne correspond pas à TF1");
    }
  });

  // Test 3: Filter Live TV by group
  await assertTest("Filtrage par groupe (France Sport)", async () => {
    const channels = await koolClient.getLiveChannels(undefined, "France Sport");
    if (!channels || channels.length === 0) {
      throw new Error("Aucune chaîne trouvée pour le groupe 'France Sport'");
    }
  });

  // Test 4: Resolve a Live TV channel
  await assertTest("Résolution d'un flux Live TV HLS", async () => {
    const channels = await koolClient.getLiveChannels("TF1");
    const first = channels[0];
    if (!first) throw new Error("Aucune chaîne pour le test de résolution");

    const resolved = await koolClient.resolveLiveChannel(first.url);
    if (!resolved || !resolved.url) {
      throw new Error("URL de flux introuvable");
    }
    if (!resolved.url.includes(".m3u8")) {
      throw new Error(`L'URL résolue n'est pas un flux HLS valide : ${resolved.url}`);
    }
  });

  // Test 5: Fetch VOD sources for Movie (Inception)
  await assertTest("Récupération des sources VOD Film (Inception tt1375666)", async () => {
    const sources = await koolClient.getVodSources("movie", "tt1375666");
    if (!sources || sources.length === 0) {
      throw new Error("Aucune source retournée pour Inception");
    }
    const hasFrench = sources.some((s) => (s.languages || []).includes("fr"));
    if (!hasFrench) {
      console.warn(" (Note: pas de VF directe détectée)");
    }
  });

  // Test 6: Fetch VOD sources for Series Episode (Breaking Bad S01E01)
  await assertTest("Récupération des sources VOD Série (Breaking Bad S01E01)", async () => {
    const sources = await koolClient.getVodSources("series", "tt0903747:1:1");
    if (!sources || sources.length === 0) {
      throw new Error("Aucune source retournée pour Breaking Bad S01E01");
    }
  });

  // Test 7: Stremio Live Provider Catalog
  await assertTest("Provider Stremio Live TV : formatage catalogue", async () => {
    const metas = await liveProvider.getCatalog("France");
    if (!metas || metas.length === 0) {
      throw new Error("Catalogue Stremio vide pour France");
    }
    if (!metas[0].id.startsWith("kool:live:")) {
      throw new Error(`ID Stremio invalide : ${metas[0].id}`);
    }
  });

  // Test 8: Stremio VOD Provider Streams
  await assertTest("Provider Stremio VOD : génération des streams", async () => {
    const streams = await vodProvider.getStreams("movie", "tt1375666");
    if (!streams || streams.length === 0) {
      throw new Error("Aucun stream Stremio généré pour Inception");
    }
    if (!streams[0].url || !streams[0].url.includes("/play/vod")) {
      throw new Error(`URL de stream Stremio invalide : ${streams[0].url}`);
    }
  });

  // Test 9: Configuration parser (Slug, Base64Url, Query)
  await assertTest("Parseur de configuration utilisateur", async () => {
    // Default
    const cDefault = parseUserConfig();
    if (cDefault.home !== true) throw new Error("Default home should be true");

    // Slug no-home
    const cNoHome = parseUserConfig("no-home");
    if (cNoHome.home !== false) throw new Error("no-home slug should have home=false");

    // Base64Url with custom categories
    const payload = { home: false, categories: ["France", "France Sport"] };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const cCustom = parseUserConfig(encoded);
    if (cCustom.home !== false) throw new Error("Custom home should be false");
    if (!cCustom.categories || cCustom.categories.length !== 2) {
      throw new Error("Custom categories count mismatch");
    }
    if (!cCustom.categories.includes("France Sport")) {
      throw new Error("France Sport missing from parsed categories");
    }

    // Query parameters
    const cQuery = parseUserConfig(undefined, { home: "false", cats: "France,Spain" });
    if (cQuery.home !== false) throw new Error("Query home=false failed");
    if (!cQuery.categories || cQuery.categories.length !== 2) throw new Error("Query cats failed");
  });

  // Test 10: Manifest generation based on home setting
  await assertTest("Génération du Manifest (Avec vs Sans page d'accueil)", async () => {
    const manifestHome = getManifest("https://example.com", { home: true });
    if (!manifestHome.catalogs || manifestHome.catalogs.length === 0) {
      throw new Error("Manifest Avec Accueil doit contenir le catalogue 'kool_live_tv'");
    }

    const manifestNoHome = getManifest("https://example.com", { home: false });
    if (manifestNoHome.catalogs && manifestNoHome.catalogs.length > 0) {
      throw new Error("Manifest Sans Accueil NE DOIT PAS contenir de catalogues");
    }
    // Verify stream resource still exists for VOD
    const hasStream = manifestNoHome.resources.some(
      (r: any) => (typeof r === "string" ? r === "stream" : r.name === "stream")
    );
    if (!hasStream) {
      throw new Error("Manifest Sans Accueil doit conserver la ressource 'stream' pour les films/séries");
    }
  });

  // Test 11: Manifest generation with filtered categories
  await assertTest("Génération du Manifest (Catégories filtrées)", async () => {
    const manifest = getManifest("https://example.com", {
      home: true,
      categories: ["France", "France Sport"]
    });
    const catalog = manifest.catalogs[0];
    const genreFilter = catalog.extra?.find((e) => e.name === "genre");
    if (!genreFilter || !genreFilter.options) {
      throw new Error("Filtre de genre manquant dans le catalogue");
    }
    if (genreFilter.options.length !== 2) {
      throw new Error(`Options de genre attendues: 2, reçu: ${genreFilter.options.length}`);
    }
    if (!genreFilter.options.includes("France") || !genreFilter.options.includes("France Sport")) {
      throw new Error("Catégories attendues non présentes dans les options de genre");
    }
  });

  // Test 12: Catalog provider with category filter
  await assertTest("Provider Live TV avec filtre de catégories utilisateur", async () => {
    const metas = await liveProvider.getCatalog(undefined, undefined, ["France Sport"]);
    if (!metas || metas.length === 0) {
      throw new Error("Aucune chaîne retournée pour le filtre France Sport");
    }
    // Check that returned channels have France Sport in genres
    const allAreSport = metas.every((m) => (m.genres || []).includes("France Sport"));
    if (!allAreSport) {
      throw new Error("Certaines chaînes retournées n'appartiennent pas au filtre France Sport");
    }
  });

  // Test 13: Local HTTP Server routes
  await assertTest("Serveur HTTP : routes /manifest.json, /no-home/manifest.json et landing page", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(7099, "127.0.0.1", () => resolve()));

    try {
      // Manifest Avec Accueil
      const rHome = await fetch("http://127.0.0.1:7099/manifest.json").then((r) => r.json());
      if (!rHome.catalogs || rHome.catalogs.length === 0) {
        throw new Error("Route /manifest.json doit retourner des catalogues");
      }

      // Manifest Sans Accueil
      const rNoHome = await fetch("http://127.0.0.1:7099/no-home/manifest.json").then((r) => r.json());
      if (rNoHome.catalogs && rNoHome.catalogs.length > 0) {
        throw new Error("Route /no-home/manifest.json ne doit pas avoir de catalogues");
      }

      // Landing page HTML
      const rHtml = await fetch("http://127.0.0.1:7099/").then((r) => r.text());
      if (!rHtml.includes("Kool.ws Addon") || !rHtml.includes("Vos 2 URLs d'Installation")) {
        throw new Error("La landing page HTML ne contient pas les éléments attendus");
      }

      // Status JSON endpoint
      const rStatus = await fetch("http://127.0.0.1:7099/status").then((r) => r.json());
      if (rStatus.status !== "online") {
        throw new Error("Le endpoint /status doit renvoyer status: 'online'");
      }
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  console.log("==========================================");
  console.log(`Résultats : ${passed} passés, ${failed} échoués`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
