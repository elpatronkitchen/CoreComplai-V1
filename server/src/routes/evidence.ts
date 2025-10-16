import { Router } from "express";
import { getUploadUrl, storeLocalBlob } from "../providers/storage.provider";
import { randomUUID } from "crypto";

const router = Router();

router.post("/upload-url", async (req, res) => {
  try {
    const { filename, mimeType } = req.body;

    if (!filename || !mimeType) {
      return res.status(400).json({ error: "filename and mimeType are required" });
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ error: "Unsupported MIME type" });
    }

    const result = await getUploadUrl(filename, mimeType);
    res.json(result);
  } catch (error: any) {
    console.error("Upload URL generation error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

router.post("/upload/:blobId", async (req, res) => {
  try {
    const { blobId } = req.params;

    storeLocalBlob(blobId, Buffer.from("mock-evidence-data"));

    res.json({ success: true, blobId });
  } catch (error: any) {
    console.error("File upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/parse-pdf", async (req, res) => {
  try {
    const { blobId } = req.body;

    if (!blobId) {
      return res.status(400).json({ error: "blobId is required" });
    }

    const extractedText = "Superannuation Guarantee contributions for Q2 FY24-25. Total contributions: $45,230. Payment date: 28 January 2025. Complies with SG(A)A 1992.";

    const matches = [
      {
        obligationRef: "APGF-OBL-SG-001",
        controlRef: "CTRL-SG-001",
        confidence: 0.88,
        matchReasons: [
          "Document mentions Superannuation Guarantee",
          "Payment date aligns with Q2 deadline (28 Jan)",
          "References SG(A)A 1992 legislation",
        ],
      },
      {
        obligationRef: "APGF-OBL-REC-001",
        controlRef: "CTRL-REC-001",
        confidence: 0.72,
        matchReasons: [
          "Document contains payment records",
          "Meets 7-year retention requirement",
        ],
      },
    ];

    res.json({
      blobId,
      filename: "sg-q2-evidence.pdf",
      extractedText,
      matches,
      autoAttached: matches[0].confidence >= 0.75,
    });
  } catch (error: any) {
    console.error("PDF parse error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

export default router;
