namespace CoreComply.Api.Domain.Entities;

public class PayrollSystem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Payroll Engine, HRIS Platform, Time Tracking
    public string Vendor { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string CriticalityLevel { get; set; } = "Medium"; // High, Medium, Low
    public DateTime? LastUpdate { get; set; }
    public string ComplianceStatus { get; set; } = "Compliant"; // Compliant, Non-Compliant, Under Review
    public string Integrations { get; set; } = string.Empty; // JSON array stored as string
    public string DataRetention { get; set; } = string.Empty;
    public string BackupFrequency { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
