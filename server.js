import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const wrapperEnvPath = path.resolve(currentDir, ".env");
const backendDir = path.resolve(currentDir, "../orbit-ai-backend");
const canonicalEnvPath = path.resolve(backendDir, ".env");

if (fs.existsSync(wrapperEnvPath)) {
  process.env.DOTENV_CONFIG_PATH = wrapperEnvPath;
} else if (fs.existsSync(canonicalEnvPath)) {
  process.env.DOTENV_CONFIG_PATH = canonicalEnvPath;
}

process.chdir(backendDir);

await import("../orbit-ai-backend/server.js");
