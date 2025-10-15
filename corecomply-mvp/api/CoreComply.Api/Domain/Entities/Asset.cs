namespace CoreComply.Api.Domain.Entities;

public class Asset
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // hardware, software, data, facility
    public string Classification { get; set; } = "internal"; // public, internal, confidential, restricted
    public string Owner { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = "active"; // active, inactive, retired
    public DateTime? PurchaseDate { get; set; }
    public decimal? Value { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
