namespace CoreComply.Api.Domain.Entities;

public class PayrollAuditKPIs
{
    public int Id { get; set; }
    public int TotalExceptions { get; set; }
    public decimal VarianceAmount { get; set; }
    public int EmployeesAffected { get; set; }
    public double SuccessRate { get; set; }
    public DateTime LastSyncTime { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AuditSession
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = "internal"; // internal, external
    public string Status { get; set; } = "draft"; // draft, scheduled, in_progress, completed
    public string Auditor { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Scope { get; set; } = "[]"; // JSON array
    public string FindingIds { get; set; } = "[]"; // JSON array
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
}

public class IntegrationHealth
{
    public int Id { get; set; }
    public string PayrollSourceName { get; set; } = string.Empty;
    public string PayrollSourceStatus { get; set; } = "disconnected";
    public DateTime? PayrollLastSync { get; set; }
    public string TaaSourceName { get; set; } = string.Empty;
    public string TaaSourceStatus { get; set; } = "disconnected";
    public DateTime? TaaLastSync { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class PayrunValidation
{
    public int Id { get; set; }
    public string PayrunId { get; set; } = string.Empty;
    public DateTime PayPeriodStart { get; set; }
    public DateTime PayPeriodEnd { get; set; }
    public string Status { get; set; } = "pending"; // pending, validated, failed
    public int TotalEmployees { get; set; }
    public int ExceptionCount { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class EmployeeVariance
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string VarianceType { get; set; } = string.Empty; // award_rate, hours, allowance, deduction
    public decimal ExpectedAmount { get; set; }
    public decimal ActualAmount { get; set; }
    public decimal VarianceAmount { get; set; }
    public string Severity { get; set; } = "low"; // low, medium, high, critical
    public string Status { get; set; } = "open"; // open, investigating, resolved
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
}
