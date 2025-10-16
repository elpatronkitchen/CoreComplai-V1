namespace CoreComply.Api.Domain.Entities;

public class EmployeeRecord
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Status { get; set; } = "Active"; // Active, Terminated
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime RetentionDate { get; set; }
    public string RecordTypes { get; set; } = string.Empty; // JSON array stored as string
    public int ComplianceScore { get; set; }
    public DateTime? LastAudit { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
