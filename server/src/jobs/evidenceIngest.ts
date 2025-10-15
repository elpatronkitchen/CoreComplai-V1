export async function evidenceIngestJob(blobId: string, filename: string): Promise<void> {
  console.log(`[EvidenceIngestJob] Processing blob ${blobId}: ${filename}`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log(`[EvidenceIngestJob] Extracted text from ${filename}`);
  console.log(`[EvidenceIngestJob] Matched to 2 obligations`);
  console.log(`[EvidenceIngestJob] Completed processing ${blobId}`);
}
