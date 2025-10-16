import { Router } from "express";
import { randomUUID } from "crypto";
import reviewerCosts from "../data/settings/reviewer_costs.json";
import { writeFileSync } from "fs";
import { join } from "path";

const router = Router();

router.get("/metrics", async (req, res) => {
  try {
    const { reviewerId, dateFrom, dateTo } = req.query;

    const mockMetrics = {
      period: {
        from: dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        to: dateTo || new Date().toISOString().split("T")[0],
      },
      itemsReviewed: 24,
      medianTimeToValidate: 12.5,
      firstPassRate: 79.2,
      autoReadyRate: 33.3,
      returnLoopCount: 5,
      hoursAvoided: 0,
      dollarsSaved: 0,
      currency: reviewerCosts.currency,
    };

    let totalBaselineMinutes = 0;
    let totalActualMinutes = 0;

    const classificationItems = 8;
    const auditItems = 16;

    totalBaselineMinutes +=
      classificationItems * reviewerCosts.baseline_mins_per_classification +
      auditItems * reviewerCosts.baseline_mins_per_audit_item;

    totalActualMinutes = classificationItems * 6 + auditItems * 10;

    const hoursAvoided = Math.max(0, (totalBaselineMinutes - totalActualMinutes) / 60);
    const dollarsSaved = hoursAvoided * reviewerCosts.legal_rate_per_hour;

    mockMetrics.hoursAvoided = Math.round(hoursAvoided * 10) / 10;
    mockMetrics.dollarsSaved = Math.round(dollarsSaved);

    const outputPath = join(process.cwd(), "server", "outputs", "review_metrics.json");
    writeFileSync(outputPath, JSON.stringify(mockMetrics, null, 2));

    res.json(mockMetrics);
  } catch (error: any) {
    console.error("Review metrics error:", error);
    res.status(500).json({ error: error.message, requestId: randomUUID() });
  }
});

export default router;
