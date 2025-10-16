import { Router } from "express";
import { randomUUID } from "crypto";

const router = Router();

interface AutoMatchResult {
  auditItemId: string;
  obligationRef: string;
  evidenceCount: number;
  highestConfidence: number;
  status: "auto_ready" | "needs_review" | "no_match";
}

router.post("/items/auto-match", async (req, res) => {
  try {
    const { auditId, threshold = 0.75 } = req.body;

    if (!auditId) {
      return res.status(400).json({ error: "auditId is required" });
    }

    const mockResults: AutoMatchResult[] = [
      {
        auditItemId: randomUUID(),
        obligationRef: "APGF-OBL-SG-001",
        evidenceCount: 2,
        highestConfidence: 0.88,
        status: "auto_ready",
      },
      {
        auditItemId: randomUUID(),
        obligationRef: "APGF-OBL-STP-001",
        evidenceCount: 1,
        highestConfidence: 0.68,
        status: "needs_review",
      },
      {
        auditItemId: randomUUID(),
        obligationRef: "APGF-OBL-PAY-001",
        evidenceCount: 0,
        highestConfidence: 0,
        status: "no_match",
      },
    ];

    const autoMatchedCount = mockResults.filter((r) => r.status === "auto_ready").length;

    res.json({
      totalItems: mockResults.length,
      autoMatchedItems: autoMatchedCount,
      coveragePercent: (autoMatchedCount / mockResults.length) * 100,
      matchDetails: mockResults,
    });
  } catch (error: any) {
    console.error("Auto-match error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

router.get("/anomalies", async (req, res) => {
  try {
    const { detectorType, severity } = req.query;

    const mockAnomalies = [
      {
        id: randomUUID(),
        detectorType: "sg_mismatch",
        severity: "high",
        title: "Superannuation Guarantee Shortfall Detected",
        description: "Employee ID 1234: SG contribution $1,150 vs expected $1,200 (4.2% variance)",
        reasonCodes: ["SG_UNDERPAYMENT", "CALC_ERROR"],
        linkedArtefacts: [
          { type: "employee", id: "emp-1234", reference: "John Smith" },
          { type: "transaction", id: "txn-5678", reference: "Q2-2025-SG" },
        ],
        detectedAt: new Date().toISOString(),
        resolved: false,
      },
      {
        id: randomUUID(),
        detectorType: "stp_recon",
        severity: "medium",
        title: "STP Reporting Delay",
        description: "Pay run 15-Jan-2025 reported to ATO on 18-Jan-2025 (3 days late)",
        reasonCodes: ["STP_LATE_REPORTING"],
        linkedArtefacts: [
          { type: "report", id: "stp-0115", reference: "STP-Jan-2025" },
        ],
        detectedAt: new Date().toISOString(),
        resolved: false,
      },
      {
        id: randomUUID(),
        detectorType: "payslip_sla",
        severity: "low",
        title: "Payslip Delivery SLA Breach",
        description: "Payslips for 22-Jan-2025 pay run delivered 72 hours after payday (exceeds 48hr SLA)",
        reasonCodes: ["PAYSLIP_DELAY"],
        linkedArtefacts: [
          { type: "batch", id: "payslip-batch-0122", reference: "22-Jan-2025" },
        ],
        detectedAt: new Date().toISOString(),
        resolved: false,
      },
    ];

    let filtered = mockAnomalies;

    if (detectorType) {
      filtered = filtered.filter((a) => a.detectorType === detectorType);
    }

    if (severity) {
      filtered = filtered.filter((a) => a.severity === severity);
    }

    res.json({
      anomalies: filtered,
      totalCount: filtered.length,
    });
  } catch (error: any) {
    console.error("Anomalies fetch error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const { title, description, controlRef, priority, anomalyId } = req.body;

    if (!title || !controlRef || !priority) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const rasciLookup: Record<string, { R: string; A: string; S: string[]; C: string[]; I: string[] }> = {
      "CTRL-SG-001": {
        R: "payroll-manager",
        A: "cfo",
        S: ["compliance-owner"],
        C: ["hr-manager"],
        I: ["auditor"],
      },
      "CTRL-STP-001": {
        R: "payroll-officer",
        A: "payroll-manager",
        S: ["compliance-owner"],
        C: ["it-security"],
        I: [],
      },
    };

    const rasci = rasciLookup[controlRef] || {
      R: "compliance-owner",
      A: "cfo",
      S: [],
      C: [],
      I: [],
    };

    const sodWarning = rasci.R === rasci.A;
    const approver = sodWarning ? "cfo-delegate" : rasci.A;

    const dueDate = new Date();
    if (controlRef.includes("SG")) {
      dueDate.setDate(dueDate.getDate() + 28);
    } else if (controlRef.includes("STP")) {
      dueDate.setDate(dueDate.getDate() + 21);
    } else {
      dueDate.setDate(dueDate.getDate() + 10);
    }

    const task = {
      id: randomUUID(),
      title,
      description,
      controlRef,
      priority,
      assignee: rasci.R,
      approver,
      watchers: [...rasci.S, ...rasci.C, ...rasci.I],
      sodWarning,
      dueDate: dueDate.toISOString().split("T")[0],
      status: "open" as const,
      anomalyId,
      createdAt: new Date().toISOString(),
    };

    if (sodWarning) {
      return res.status(409).json({
        error: "Segregation of Duties conflict detected",
        sodWarning: true,
        suggestedApprover: approver,
      });
    }

    res.status(201).json(task);
  } catch (error: any) {
    console.error("Task creation error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

export default router;
