/**
 * Storage Provider
 * 
 * Azure Mode (STACK_PROVIDER=azure):
 *   Uses Azure Blob Storage with User Delegation SAS tokens
 *   Requires: @azure/storage-blob, @azure/identity
 *   Env: AZURE_BLOB_ACCOUNT, AZURE_BLOB_CONTAINER
 * 
 * Local Mode (STACK_PROVIDER=local):
 *   In-memory blob storage with mock URLs
 */

import { randomUUID } from "crypto";

const stackProvider = process.env.STACK_PROVIDER || "local";
const inMemoryBlobs = new Map<string, { data: Buffer; metadata: any }>();

export interface UploadUrlResponse {
  uploadUrl: string;
  blobId: string;
  expiresAt: string;
}

// Azure SDK clients (lazy-loaded)
let azureBlobServiceClient: any = null;
let azureContainerClient: any = null;

async function initAzureClient() {
  if (azureContainerClient) return azureContainerClient;

  try {
    const { BlobServiceClient } = await import("@azure/storage-blob");
    const { DefaultAzureCredential } = await import("@azure/identity");

    const accountUrl = process.env.AZURE_BLOB_ACCOUNT;
    const containerName = process.env.AZURE_BLOB_CONTAINER || "evidence";

    if (!accountUrl) {
      throw new Error("AZURE_BLOB_ACCOUNT environment variable is required for Azure storage provider");
    }

    const credential = new DefaultAzureCredential();
    azureBlobServiceClient = new BlobServiceClient(accountUrl, credential);
    azureContainerClient = azureBlobServiceClient.getContainerClient(containerName);

    // Ensure container exists
    await azureContainerClient.createIfNotExists();

    return azureContainerClient;
  } catch (error) {
    throw new Error(`Failed to initialize Azure Blob Storage client: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getUploadUrl(
  filename: string,
  mimeType: string
): Promise<UploadUrlResponse> {
  if (stackProvider === "azure") {
    return await getAzureBlobUploadUrl(filename, mimeType);
  } else {
    return getLocalUploadUrl(filename, mimeType);
  }
}

export async function getDownloadUrl(blobId: string): Promise<string> {
  if (stackProvider === "azure") {
    return await getAzureBlobDownloadUrl(blobId);
  } else {
    return `http://localhost:5000/api/evidence/download/${blobId}`;
  }
}

async function getAzureBlobUploadUrl(
  filename: string,
  mimeType: string
): Promise<UploadUrlResponse> {
  try {
    const { BlobSASPermissions, generateBlobSASQueryParameters } = await import("@azure/storage-blob");

    const containerClient = await initAzureClient();
    const blobId = randomUUID();
    const blobName = `${Date.now()}-${filename}`;
    const blobClient = containerClient.getBlobClient(blobName);

    // Generate user delegation SAS token (20-minute TTL)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 20);

    const sasOptions = {
      containerName: containerClient.containerName,
      blobName: blobName,
      permissions: BlobSASPermissions.parse("w"), // write-only
      startsOn: new Date(),
      expiresOn: expiresAt,
    };

    // Get user delegation key for SAS (more secure than account key)
    const accountClient = containerClient.getServiceClient();
    const userDelegationKey = await accountClient.getUserDelegationKey(
      sasOptions.startsOn,
      sasOptions.expiresOn
    );

    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      userDelegationKey,
      accountClient.accountName
    ).toString();

    const uploadUrl = `${blobClient.url}?${sasToken}`;

    return {
      uploadUrl,
      blobId: blobName,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to generate Azure Blob SAS URL for upload: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getAzureBlobDownloadUrl(blobId: string): Promise<string> {
  try {
    const { BlobSASPermissions, generateBlobSASQueryParameters } = await import("@azure/storage-blob");

    const containerClient = await initAzureClient();
    const blobClient = containerClient.getBlobClient(blobId);

    // Generate read SAS token (1-hour TTL)
    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 1);

    const sasOptions = {
      containerName: containerClient.containerName,
      blobName: blobId,
      permissions: BlobSASPermissions.parse("r"), // read-only
      startsOn: new Date(),
      expiresOn: expiresOn,
    };

    const accountClient = containerClient.getServiceClient();
    const userDelegationKey = await accountClient.getUserDelegationKey(
      sasOptions.startsOn,
      sasOptions.expiresOn
    );

    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      userDelegationKey,
      accountClient.accountName
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  } catch (error) {
    throw new Error(`Failed to generate Azure Blob SAS URL for download: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function getLocalUploadUrl(filename: string, mimeType: string): UploadUrlResponse {
  const blobId = randomUUID();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 20);

  inMemoryBlobs.set(blobId, {
    data: Buffer.from(""),
    metadata: { filename, mimeType, uploadedAt: new Date() },
  });

  return {
    uploadUrl: `http://localhost:5000/api/evidence/upload/${blobId}`,
    blobId,
    expiresAt: expiresAt.toISOString(),
  };
}

export function storeLocalBlob(blobId: string, data: Buffer): void {
  const existing = inMemoryBlobs.get(blobId);
  if (existing) {
    inMemoryBlobs.set(blobId, { ...existing, data });
  }
}

export function getLocalBlob(blobId: string): { data: Buffer; metadata: any } | undefined {
  return inMemoryBlobs.get(blobId);
}

/**
 * Store blob data directly (for local endpoint or Azure upload)
 */
export async function storeBlob(blobId: string, data: Buffer, contentType: string): Promise<void> {
  if (stackProvider === "azure") {
    try {
      const containerClient = await initAzureClient();
      const blobClient = containerClient.getBlockBlobClient(blobId);

      await blobClient.upload(data, data.length, {
        blobHTTPHeaders: { blobContentType: contentType },
      });
    } catch (error) {
      throw new Error(`Failed to upload blob to Azure Storage: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // Local mode: store in memory
    storeLocalBlob(blobId, data);
  }
}

/**
 * List blobs with optional prefix
 */
export async function listBlobs(prefix?: string): Promise<string[]> {
  if (stackProvider === "azure") {
    try {
      const containerClient = await initAzureClient();
      const blobNames: string[] = [];

      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        blobNames.push(blob.name);
      }

      return blobNames;
    } catch (error) {
      throw new Error(`Failed to list blobs from Azure Storage: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // Local mode: filter in-memory blobs
    const blobNames = Array.from(inMemoryBlobs.keys());
    if (prefix) {
      return blobNames.filter((name) => name.startsWith(prefix));
    }
    return blobNames;
  }
}
