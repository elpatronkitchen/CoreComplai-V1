import { Router } from "express";
import { search } from "../providers/rag.provider";
import { randomUUID } from "crypto";
import positions from "../data/seed/positions.dev.json";
import features from "../data/seed/features.dev.json";

const router = Router();

interface ClassificationCandidate {
  rank: number;
  classificationCode: string;
  classificationName: string;
  confidence: number;
  snippets: Array<{
    source: string;
    text: string;
    score: number;
  }>;
  vetoes: Array<{
    rule: string;
    reason: string;
  }>;
  priorDecisions: Array<{
    positionTitle: string;
    classificationCode: string;
    date: string;
  }>;
}

router.post("/propose", async (req, res) => {
  try {
    const { positionId, limit = 3 } = req.body;

    if (!positionId) {
      return res.status(400).json({ error: "positionId is required" });
    }

    const position = positions.find((p: any) => p.id === positionId);
    if (!position) {
      return res.status(404).json({ error: "Position not found" });
    }

    const query = `${position.title} ${position.description} ${position.employmentType}`;
    const searchResults = await search(query, 10, { docType: "policy" });

    const candidates: ClassificationCandidate[] = [
      {
        rank: 1,
        classificationCode: "C-ANNUAL-FT",
        classificationName: "Clerks Award Level 3 - Permanent Full-Time (Annualised)",
        confidence: 0.89,
        snippets: searchResults.results.slice(0, 3).map((r) => ({
          source: r.title,
          text: r.snippet,
          score: r.score,
        })),
        vetoes: [],
        priorDecisions: [
          {
            positionTitle: "Payroll Coordinator",
            classificationCode: "C-ANNUAL-FT",
            date: "2024-06-15",
          },
        ],
      },
      {
        rank: 2,
        classificationCode: "C-HOURLY-FT",
        classificationName: "Clerks Award Level 3 - Permanent Full-Time (Hourly)",
        confidence: 0.76,
        snippets: searchResults.results.slice(1, 3).map((r) => ({
          source: r.title,
          text: r.snippet,
          score: r.score,
        })),
        vetoes: [],
        priorDecisions: [],
      },
      {
        rank: 3,
        classificationCode: "C-ADMIN-L4",
        classificationName: "Clerks Award Level 4 - Administrative Specialist",
        confidence: 0.68,
        snippets: searchResults.results.slice(2, 4).map((r) => ({
          source: r.title,
          text: r.snippet,
          score: r.score,
        })),
        vetoes: [],
        priorDecisions: [],
      },
    ];

    if (position.employmentType === "casual") {
      candidates[0].vetoes.push({
        rule: "casual_no_annualised",
        reason: "Casual employees cannot be classified with annualised salary arrangements",
      });
      candidates[0].confidence = 0.0;
      candidates.sort((a, b) => b.confidence - a.confidence);
    }

    res.json({
      positionId,
      candidates: candidates.slice(0, limit),
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Classification proposal error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

router.post("/accept", async (req, res) => {
  try {
    const { positionId, classificationCode, confidence, notes, precedentRefs } = req.body;

    if (!positionId || !classificationCode || confidence === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const classificationId = randomUUID();
    const precedentCaptured = confidence >= 0.75;

    res.json({
      success: true,
      classificationId,
      precedentCaptured,
    });
  } catch (error: any) {
    console.error("Classification accept error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

export default router;
