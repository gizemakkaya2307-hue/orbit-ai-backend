const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "orbit-ai-backend",
    route: "/"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "orbit-ai-backend",
    route: "/health"
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Orbit backend listening on 0.0.0.0:${PORT}`);
});
