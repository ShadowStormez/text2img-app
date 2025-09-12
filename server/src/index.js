import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser"; // 👈 for handling JWT cookies



dotenv.config();
const app = express();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5001;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_ENGINE = process.env.STABILITY_ENGINE || "stable-diffusion-xl-1024-v1-0";

// Configure CORS
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true, // 👈 MUST BE TRUE
}));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser()); // 👈 add this
app.use(morgan("dev"));

// Serve generated images
const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
const corsStatic = cors({
  origin: "http://localhost:5173",
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});
app.use("/uploads", corsStatic, express.static(uploadsDir));

app.use("/api/auth", authRoutes);

// Test endpoint
app.get("/api/test", (_req, res) => {
  res.json({ message: "CORS test endpoint" });
});

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// List images
app.get("/api/images", async (_req, res) => {
  const images = await prisma.image.findMany({ orderBy: { createdAt: "desc" } });
  res.set("X-Debug", "Images route");
  console.log("Response headers for /api/images:", res.getHeaders());
  res.json(images);
});

// Generate image via Stability API
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, steps = 30, cfgScale = 7, seed = null, width = 1024, height = 1024 } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });
    if (!STABILITY_API_KEY) return res.status(500).json({ error: "Missing STABILITY_API_KEY" });

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

    res.set("X-Debug", "Generate route");
    console.log("Response headers for /api/generate:", res.getHeaders());
    res.json(record);
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = err.response?.data?.toString?.() || err.message;
    console.error("/api/generate error:", msg);
    res.set("X-Debug", "Generate error");
    console.log("Response headers for /api/generate error:", res.getHeaders());
    res.status(status).json({ error: msg });
  }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));