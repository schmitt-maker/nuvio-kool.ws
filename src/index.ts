import express from "express";
import cors from "cors";
import { config } from "./config";
import { stremioRouter } from "./server/routes";
import { logger } from "./utils/logger";
import { koolClient } from "./kool-client/client";

const app = express();

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.url}`);
  next();
});

// Stremio addon routes
app.use(stremioRouter);

// Addon landing page with installation instructions for Nuvio TV
app.get("/", async (req, res) => {
  const host = req.get("host") || `localhost:${config.port}`;
  const protocol = req.protocol;
  const manifestUrl = `${protocol}://${host}/manifest.json`;
  const stremioInstallUrl = `stremio://${host}/manifest.json`;

  let channelCount = 0;
  try {
    const channels = await koolClient.getLiveChannels();
    channelCount = channels.length;
  } catch {
    // fallback
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kool.ws Addon - Nuvio TV & Stremio</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #14171c;
      color: #e4e7eb;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .card {
      background: #1e232b;
      border: 1px solid #2d3440;
      border-radius: 14px;
      max-width: 650px;
      width: 100%;
      padding: 32px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .logo img {
      width: 56px;
      height: 56px;
    }
    h1 {
      margin: 0;
      font-size: 24px;
      color: #ffffff;
    }
    p {
      color: #9aa5b1;
      line-height: 1.6;
    }
    .badge {
      display: inline-block;
      background: rgba(235, 43, 88, 0.15);
      color: #eb2b58;
      font-weight: 600;
      font-size: 13px;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 12px;
    }
    .url-box {
      background: #0f1216;
      border: 1px solid #282f3a;
      border-radius: 8px;
      padding: 12px 16px;
      font-family: monospace;
      font-size: 14px;
      color: #64d2ff;
      word-break: break-all;
      margin: 16px 0;
      user-select: all;
    }
    .btn {
      display: inline-block;
      background: #eb2b58;
      color: white;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 8px;
      margin-top: 8px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #d41e49;
    }
    .steps {
      margin-top: 24px;
      border-top: 1px solid #2d3440;
      padding-top: 20px;
    }
    .steps h3 {
      font-size: 16px;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .steps ol {
      padding-left: 20px;
      color: #cbd2d9;
    }
    .steps li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <img src="https://img.icons8.com/color/452/dog.png" alt="Logo">
      <div>
        <div class="badge">Prêt pour Nuvio TV & Stremio</div>
        <h1>Kool.ws Addon</h1>
      </div>
    </div>
    <p>
      Accédez à <strong>${channelCount || 300} chaînes en direct</strong> (TNT France, Sports, Europe)
      avec guide des programmes (EPG) et aux sources de streaming pour films et séries.
    </p>

    <div class="steps">
      <h3>Installation dans Nuvio TV (Android TV / Fire TV) :</h3>
      <ol>
        <li>Ouvrez <strong>Nuvio TV</strong> sur votre téléviseur.</li>
        <li>Allez dans <strong>Paramètres (Settings) ➔ Addons ➔ Ajouter un Addon</strong>.</li>
        <li>Entrez l'URL du manifeste ci-dessous :</li>
      </ol>
      <div class="url-box">${manifestUrl}</div>
      <p style="font-size: 13px; color: #7b8794;">
        Astuce : Si vous utilisez Stremio sur votre téléphone ou PC relié à votre compte, cliquez simplement sur le bouton ci-dessous :
      </p>
      <a href="${stremioInstallUrl}" class="btn">Installer sur Stremio</a>
    </div>
  </div>
</body>
</html>`);
});

// Start listening
const server = app.listen(config.port, config.host, () => {
  logger.info(`🚀 Kool.ws Addon is running at http://${config.host}:${config.port}`);
  logger.info(`📋 Stremio Manifest URL: ${config.baseUrl}/manifest.json`);
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`❌ Port ${config.port} is already in use (EADDRINUSE).`);
    logger.error(`Sur macOS, les ports 5000 et 7000 sont réservés par AirPlay Receiver.`);
    logger.error(`Vous pouvez spécifier un autre port avec: PORT=7080 npm start`);
  } else {
    logger.error("Server error:", err);
  }
  process.exit(1);
});

// Handle graceful shutdown
const shutdown = () => {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;
