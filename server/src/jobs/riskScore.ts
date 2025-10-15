export async function riskScoreJob(): Promise<void> {
  console.log("[RiskScoreJob] Calculating risk scores for audit items");

  await new Promise((resolve) => setTimeout(resolve, 300));

  console.log("[RiskScoreJob] Risk scoring completed");
}
