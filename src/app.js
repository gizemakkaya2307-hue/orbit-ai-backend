import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { aiRoutes } from "./routes/aiRoutes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );
  app.use(express.json({ limit: "256kb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      providerConfigured: Boolean(env.openAiApiKey),
      model: env.openAiModel
    });
  });

  app.use("/api/v1/ai", aiRoutes);
  app.use(errorHandler);

  return app;
}
