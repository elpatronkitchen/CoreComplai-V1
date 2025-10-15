namespace CoreComply.Api.Domain.Entities;

public class Person
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? JobTitle { get; set; }
    public string Role { get; set; } = "Reviewer";
    public string Department { get; set; } = string.Empty;
    public string Status { get; set; } = "Active"; // Active, Inactive, OnLeave
    public DateTime? StartDate { get; set; }
    public DateTime? LastLogin { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
