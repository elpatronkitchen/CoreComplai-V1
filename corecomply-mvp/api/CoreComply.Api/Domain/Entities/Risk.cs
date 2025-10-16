namespace CoreComply.Api.Domain.Entities;

public class Risk
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // operational, financial, compliance, strategic
    public string Likelihood { get; set; } = "medium"; // low, medium, high
    public string Impact { get; set; } = "medium"; // low, medium, high, critical
    public string Status { get; set; } = "open"; // open, mitigating, closed
    public string Owner { get; set; } = string.Empty;
    public DateTime IdentifiedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewDate { get; set; }
    public string? Mitigation { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
