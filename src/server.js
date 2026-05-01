import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(
    `Orbit AI backend listening on http://localhost:${env.port} (model: ${env.openAiModel})`
  );
  if (!env.openAiApiKey) {
    console.warn("OPENAI_API_KEY is missing. AI endpoints will return 503 until it is configured.");
  }
});
