namespace CoreComply.Api.Domain.Entities;

public class Report
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // compliance, gap_analysis, audit, risk, executive
    public string Description { get; set; } = string.Empty;
    public DateTime? LastGenerated { get; set; }
    public string Status { get; set; } = "ready"; // ready, generating, scheduled, failed
    public string? Schedule { get; set; } // cron expression
    public string? Framework { get; set; }
    public string Format { get; set; } = "pdf"; // pdf, excel, csv
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Parameters { get; set; } // JSON parameters
}

public class ReportTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // compliance, audit, risk, executive
    public string? DefaultParameters { get; set; } // JSON
}
