namespace CoreComply.Api.Domain.Entities;

public class OnboardingTask
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string TaskName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // documentation, system_access, training, equipment
    public string Status { get; set; } = "pending"; // pending, in_progress, completed, blocked
    public string AssignedTo { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class OnboardingProgress
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public double ProgressPercentage { get; set; }
    public string Status { get; set; } = "in_progress"; // not_started, in_progress, completed, delayed
    public DateTime? CompletionDate { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
