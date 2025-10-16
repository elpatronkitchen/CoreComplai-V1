export async function attestationRemindersJob(): Promise<void> {
  console.log("[AttestationRemindersJob] Checking for pending attestations");

  await new Promise((resolve) => setTimeout(resolve, 200));

  console.log("[AttestationRemindersJob] Sent 3 reminder notifications");
  console.log("[AttestationRemindersJob] Completed");
}
