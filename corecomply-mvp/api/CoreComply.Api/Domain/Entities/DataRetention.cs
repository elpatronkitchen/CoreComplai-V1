namespace CoreComply.Api.Domain.Entities;

public class DataRetention
{
    public int Id { get; set; }
    public string RecordType { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int RetentionPeriodYears { get; set; }
    public string StorageLocation { get; set; } = string.Empty;
    public string ArchiveFrequency { get; set; } = string.Empty;
    public string AccessRestrictions { get; set; } = string.Empty;
    public string DisposalMethod { get; set; } = string.Empty;
    public DateTime? LastReview { get; set; }
    public DateTime? NextReview { get; set; }
    public string Owner { get; set; } = string.Empty;
    public string Status { get; set; } = "Active"; // Active, Under Review, Archived
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
