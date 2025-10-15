import { detectSGMismatches } from "../detectors/sg_mismatch";
import { detectSTPDelays } from "../detectors/stp_recon";
import { detectPayslipSLABreaches } from "../detectors/payslip_sla";

export async function anomalyScanJob(): Promise<void> {
  console.log("[AnomalyScanJob] Starting anomaly detection scan");

  const sgMismatches = await detectSGMismatches();
  console.log(`[AnomalyScanJob] SG Mismatches detected: ${sgMismatches.length}`);

  const stpDelays = await detectSTPDelays();
  console.log(`[AnomalyScanJob] STP Delays detected: ${stpDelays.length}`);

  const payslipBreaches = await detectPayslipSLABreaches();
  console.log(`[AnomalyScanJob] Payslip SLA breaches detected: ${payslipBreaches.length}`);

  console.log("[AnomalyScanJob] Anomaly scan completed");
}
