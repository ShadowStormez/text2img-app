import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_ENGINE = process.env.STABILITY_ENGINE || "stable-diffusion-xl-1024-v1-0";

app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// serve generated images
const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// list images
app.get("/api/images", async (_req, res) => {
  const images = await prisma.image.findMany({ orderBy: { createdAt: "desc" } });
  res.json(images);
});

// generate image via Stability API
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, steps = 30, cfgScale = 7, seed = null, width = 1024, height = 1024 } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });
    if (!STABILITY_API_KEY) return res.status(500).json({ error: "Missing STABILITY_API_KEY" });

    // Stable Diffusion XL text-to-image endpoint
    const apiUrl = `https://api.stability.ai/v1/generation/${STABILITY_ENGINE}/text-to-image`;

    const payload = {
      text_prompts: [{ text: prompt }],
      cfg_scale: cfgScale,
      height,
      width,
      steps,
      ...(seed !== null && seed !== undefined ? { seed } : {}),
    };

    const response = await axios.post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "image/png",
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
      responseType: "arraybuffer",
      timeout: 120000,
    });

    const filename = `img_${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, response.data);

    const record = await prisma.image.create({
      data: {
        prompt,
        steps: Number(steps),
        cfgScale: Number(cfgScale),
        seed: seed ?? undefined,
        width: Number(width),
        height: Number(height),
        fileName: filename,
        url: `/uploads/${filename}`,
      },
    });

    res.json(record);
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = err.response?.data?.toString?.() || err.message;
    console.error("/api/generate error:", msg);
    res.status(status).json({ error: msg });
  }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));