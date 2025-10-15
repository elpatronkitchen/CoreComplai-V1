namespace CoreComply.Api.Domain.Entities;

public class CompanyProfile
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string? Abn { get; set; }
    public string? Acn { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public int EmployeeCount { get; set; }
    public DateTime? EstablishedDate { get; set; }
    public string? LogoUrl { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class CompanySettings
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Category { get; set; } = "general";
    public string? Description { get; set; }
}
