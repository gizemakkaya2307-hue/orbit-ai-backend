const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    ok: true,
    service: "orbit-ai-backend",
    route: "/",
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    service: "orbit-ai-backend",
    route: "/health",
  });
});

app.post("/ai/chat", async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "message is required",
      });
    }

    return res.status(200).json({
      reply: "Orbit AI backend çalışıyor. Gemini bağlantısı sonraki adımda aktif edilecek.",
      provider: "local",
    });
  } catch (error) {
    return res.status(500).json({
      error: "AI chat failed",
    });
  }
});

app.post("/ai/generate-tasks", async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "message is required",
      });
    }

    return res.status(200).json({
      tasks: [
        {
          title: "Yeni görev",
          description: message,
          category: "general",
          priority: "medium",
          estimatedMinutes: 25,
          dueDate: new Date().toISOString().slice(0, 10),
        },
      ],
      provider: "local",
    });
  } catch (error) {
    return res.status(500).json({
      error: "AI task generation failed",
    });
  }
});

app.use((req, res) => {
  return res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Orbit backend listening on 0.0.0.0:${PORT}`);
});