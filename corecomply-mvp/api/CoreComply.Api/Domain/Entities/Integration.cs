namespace CoreComply.Api.Domain.Entities;

public class Integration
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // payroll, hr, accounting, api
    public string Status { get; set; } = "disconnected"; // connected, disconnected, error, configuring
    public DateTime? LastSync { get; set; }
    public string? Configuration { get; set; } // JSON configuration
    public string? ApiKey { get; set; }
    public string? Endpoint { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
