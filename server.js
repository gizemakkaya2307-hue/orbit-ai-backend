import { app, PROVIDER_TIMEOUT_MS } from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});

server.requestTimeout = Math.max(PROVIDER_TIMEOUT_MS + 5_000, 30_000);
server.headersTimeout = Math.max(PROVIDER_TIMEOUT_MS + 10_000, 35_000);
