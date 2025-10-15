namespace CoreComply.Api.Domain.Entities;

public class ComplianceTask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public string Type { get; set; } = "general"; // payroll, compliance, evidence, audit, general
    public string Priority { get; set; } = "medium"; // low, medium, high, critical
    public string Status { get; set; } = "pending"; // pending, in_progress, completed, overdue
    public string? Assignee { get; set; }
    public string? AssignedBy { get; set; }
    public string Category { get; set; } = "ongoing"; // pre_payroll, post_payroll, monthly, quarterly, annual, ongoing
    public string? RecurringFrequency { get; set; } // weekly, monthly, quarterly, annual
    public DateTime? NextDue { get; set; }
    public string? Source { get; set; } // fair_work, ato, internal, compliance
    public string? PayrollCycle { get; set; }
    public string? AwardType { get; set; }
    public string? SubmissionType { get; set; }
    public decimal? Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
