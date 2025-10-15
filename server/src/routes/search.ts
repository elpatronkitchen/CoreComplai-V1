import { Router } from "express";
import { search } from "../providers/rag.provider";
import { randomUUID } from "crypto";

const router = Router();

router.post("/query", async (req, res) => {
  try {
    const { query, k = 5, filters } = req.body;

    if (!query) {
      return res.status(400).json({ error: "query is required" });
    }

    const response = await search(query, k, filters);

    res.json(response);
  } catch (error: any) {
    console.error("Search query error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

export default router;
