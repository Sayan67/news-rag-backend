import express from "express";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { answerQuery } from "./services/rag.js";
import { createRedisClient } from "./utils/redis.js";
import cors from "cors";


dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());

const redis = await createRedisClient(
  process.env.REDIS_PASSWORD,
  process.env.REDIS_PORT,
  process.env.REDIS_URL
);

// --- Health Check (optional) ---
app.get("/", (req, res) => {
  res.send("AI Chat Backend is running ✅");
});

// --- Create a new session ---
app.post("/api/session", async (req, res) => {
  const id = uuidv4();

  // Set expiry of 24 hours on session key
  await redis.expire(`session:${id}:messages`, 60 * 60 * 24);

  res.json({ sessionId: id });
});

// --- Chat with streaming response ---
app.post("/api/chat/stream", async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: "sessionId and message are required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // 1. Save user message
  await redis.rPush(
    `session:${sessionId}:messages`,
    JSON.stringify({ role: "user", text: message })
  );

  let fullReply = "";

  // 2. Stream Gemini response via RAG
  await answerQuery(message, (token) => {
    fullReply += token;
    res.write(`data: ${JSON.stringify({ token })}\n\n`);
  });

  // 3. Save assistant reply
  await redis.rPush(
    `session:${sessionId}:messages`,
    JSON.stringify({ role: "assistant", text: fullReply })
  );

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

// --- Get conversation history ---
app.get("/api/history/:id", async (req, res) => {
  const messages = await redis.lRange(`session:${req.params.id}:messages`, 0, -1);
  res.json(messages.map((m) => JSON.parse(m)));
});

// --- Reset session ---
app.delete("/api/session/:id", async (req, res) => {
  await redis.del(`session:${req.params.id}:messages`);
  res.json({ ok: true });
});

app.listen(4000, () => console.log("🚀 Backend running on :4000"));
