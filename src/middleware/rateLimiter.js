import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export function createAiRateLimiter() {
  return rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many AI requests. Please try again in a moment."
    }
  });
}
