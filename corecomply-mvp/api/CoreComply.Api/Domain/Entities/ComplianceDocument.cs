namespace CoreComply.Api.Domain.Entities;

public class ComplianceDocument
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Award, Agreement, Policy
    public string Category { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ReviewDate { get; set; }
    public string Status { get; set; } = "Current"; // Current, Archived, Under Review
    public string Owner { get; set; } = string.Empty;
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime? LastUpdate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
