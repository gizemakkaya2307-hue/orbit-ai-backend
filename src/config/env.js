import dotenv from "dotenv";

dotenv.config();

function asInt(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: asInt(process.env.PORT, 8787),
  nodeEnv: process.env.NODE_ENV || "development",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-5.4-mini",
  rateLimitWindowMs: asInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: asInt(process.env.RATE_LIMIT_MAX, 25),
  cacheTtlMs: asInt(process.env.ORBIT_CACHE_TTL_MS, 45_000)
};

export const isProduction = env.nodeEnv === "production";
