namespace CoreComply.Api.Domain.Entities;

public class Notification
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string Type { get; set; } = "info"; // success, error, warning, info
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool Read { get; set; } = false;
    public string UserId { get; set; } = string.Empty;
    public string? TaskId { get; set; }
    public string? AuditId { get; set; }
    public string? ControlId { get; set; }
    public DateTime? DueDate { get; set; }
    public string? ActionUrl { get; set; }
}
