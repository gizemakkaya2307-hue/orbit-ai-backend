import { env } from "../config/env.js";
import { buildPromptTemplate, ORBIT_RESPONSE_SCHEMA } from "./promptTemplates.js";

const responseCache = new Map();

function buildCacheKey(feature, payload) {
  return JSON.stringify({
    feature,
    prompt: payload.prompt,
    language: payload.language,
    persona: payload.persona,
    mood: payload.mood,
    orbitScore: payload.stats.orbitScore,
    completedTasksToday: payload.stats.completedTasksToday,
    focusMinutesToday: payload.stats.focusMinutesToday
  });
}

function readCache(key) {
  const record = responseCache.get(key);
  if (!record) return null;
  if (record.expiresAt < Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return record.value;
}

function writeCache(key, value) {
  responseCache.set(key, {
    value,
    expiresAt: Date.now() + env.cacheTtlMs
  });
}

function extractTextOutput(output) {
  if (!Array.isArray(output)) return "";
  const textPart = output
    .flatMap((item) => item?.content ?? [])
    .find((content) => content?.type === "output_text" && typeof content.text === "string");
  return textPart?.text ?? "";
}

export async function generateAiResponse(feature, payload) {
  if (!env.openAiApiKey) {
    const error = new Error("OPENAI_API_KEY is missing on the backend.");
    error.status = 503;
    throw error;
  }

  const cacheKey = buildCacheKey(feature, payload);
  const cached = readCache(cacheKey);
  if (cached) {
    return {
      ...cached,
      cached: true
    };
  }

  const requestBody = {
    model: env.openAiModel,
    instructions: buildPromptTemplate(feature, payload),
    input: payload.prompt,
    reasoning: {
      effort: payload.concise ? "low" : "medium"
    },
    text: {
      verbosity: payload.concise ? "low" : "medium",
      format: {
        type: "json_schema",
        name: "orbit_ai_response",
        strict: true,
        schema: ORBIT_RESPONSE_SCHEMA
      }
    }
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openAiApiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json?.error?.message || "OpenAI request failed.");
    error.status = response.status;
    throw error;
  }

  const rawText = json.output_text || extractTextOutput(json.output);
  const parsed = JSON.parse(rawText);
  const normalized = {
    feature,
    reply: parsed.reply || "",
    actions: parsed.actions || [],
    breakdown: parsed.breakdown || [],
    suggestedFocusMinutes: parsed.suggestedFocusMinutes ?? null,
    suggestedFocusMode: parsed.suggestedFocusMode ?? null,
    planBlocks: parsed.planBlocks || [],
    insightSummary: parsed.insightSummary || "",
    encouragement: parsed.encouragement || "",
    fallbackUsed: false,
    cached: false
  };

  writeCache(cacheKey, normalized);
  return normalized;
}
