namespace CoreComply.Api.Domain.Entities;

public class SupportTicket
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "general"; // general, technical, billing, feature_request
    public string Priority { get; set; } = "medium"; // low, medium, high, urgent
    public string Status { get; set; } = "open"; // open, in_progress, resolved, closed
    public string RequestedBy { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public string? Resolution { get; set; }
}

public class KnowledgeBaseArticle
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string[] Tags { get; set; } = Array.Empty<string>();
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
