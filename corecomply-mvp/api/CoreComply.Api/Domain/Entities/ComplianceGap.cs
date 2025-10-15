namespace CoreComply.Api.Domain.Entities;

public class ComplianceGap
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Severity { get; set; } = "Medium"; // High, Medium, Low
    public string Description { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public int AffectedEmployees { get; set; }
    public DateTime DiscoveredDate { get; set; }
    public DateTime? TargetResolution { get; set; }
    public string Owner { get; set; } = string.Empty;
    public string Status { get; set; } = "Open"; // Open, In Progress, Resolved, Closed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
