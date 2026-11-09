import express from "express";
import cors from "cors";
import { config } from "./config";
import { stremioRouter } from "./server/routes";
import { logger } from "./utils/logger";

const app = express();

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.url}`);
  next();
});

// Stremio addon & landing page routes
app.use(stremioRouter);

// Start listening if not running in a serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
  const server = app.listen(config.port, config.host, () => {
    logger.info(`🚀 Kool.ws Addon is running at http://${config.host}:${config.port}`);
    logger.info(`📋 Stremio Manifest (Avec Accueil): http://localhost:${config.port}/manifest.json`);
    logger.info(`⚡ Stremio Manifest (Sans Accueil): http://localhost:${config.port}/no-home/manifest.json`);
    logger.info(`⚙️  Configurateur Web: http://localhost:${config.port}`);
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
}

export default app;
