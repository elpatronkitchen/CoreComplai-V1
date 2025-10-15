import { Router } from "express";
import { chat, embed } from "../providers/llm.provider";
import { randomUUID } from "crypto";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { messages, temperature, maxTokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const response = await chat(messages, { temperature, maxTokens });

    res.json(response);
  } catch (error: any) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

router.post("/embed", async (req, res) => {
  try {
    const { texts } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({ error: "texts array is required" });
    }

    if (texts.length > 100) {
      return res.status(400).json({ error: "Maximum 100 texts allowed" });
    }

    const response = await embed(texts);

    res.json(response);
  } catch (error: any) {
    console.error("AI embed error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

export default router;
