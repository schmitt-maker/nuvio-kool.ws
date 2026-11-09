import { koolClient } from "../src/kool-client/client";
import { liveProvider } from "../src/providers/live";
import { vodProvider } from "../src/providers/vod";

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
