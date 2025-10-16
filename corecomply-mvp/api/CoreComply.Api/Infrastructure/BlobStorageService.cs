using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System.Security.Cryptography;

namespace CoreComply.Api.Infrastructure;

public interface IBlobStorageService
{
    Task<(string blobUrl, string fileHash)> UploadAsync(Stream fileStream, string fileName, string contentType);
    Task DeleteAsync(string blobUrl);
}

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _containerClient;

    public BlobStorageService(IConfiguration configuration)
    {
        var accountName = configuration["Storage:AccountName"];
        var containerName = configuration["Storage:Container"];
        
        var blobServiceClient = new BlobServiceClient(
            new Uri($"https://{accountName}.blob.core.windows.net"),
            new Azure.Identity.DefaultAzureCredential()
        );
        
        _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        _containerClient.CreateIfNotExistsAsync().GetAwaiter().GetResult();
    }

    public async Task<(string blobUrl, string fileHash)> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var fileHash = await ComputeFileHashAsync(fileStream);
        fileStream.Position = 0;

        var blobName = $"{Guid.NewGuid()}/{fileName}";
        var blobClient = _containerClient.GetBlobClient(blobName);

        var headers = new BlobHttpHeaders { ContentType = contentType };
        await blobClient.UploadAsync(fileStream, new BlobUploadOptions { HttpHeaders = headers });

        return (blobClient.Uri.ToString(), fileHash);
    }

    public async Task DeleteAsync(string blobUrl)
    {
        var uri = new Uri(blobUrl);
        // Extract the blob name from the URL path, skipping the container name
        var pathSegments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var blobName = string.Join("/", pathSegments.Skip(1)); // Skip storage account, keep container and path
        var blobClient = _containerClient.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync();
    }

    private static async Task<string> ComputeFileHashAsync(Stream stream)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = await sha256.ComputeHashAsync(stream);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}
