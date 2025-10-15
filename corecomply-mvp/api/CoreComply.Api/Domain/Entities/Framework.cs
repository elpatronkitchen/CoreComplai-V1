namespace CoreComply.Api.Domain.Entities;

public class Framework
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Version { get; set; }
    public string? Description { get; set; }
    public DateTime EffectiveDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string CreatedBy { get; set; }

    public ICollection<Control> Controls { get; set; } = new List<Control>();
}

public class Control
{
    public int Id { get; set; }
    public int FrameworkId { get; set; }
    public required string ControlId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Category { get; set; }
    public required string Status { get; set; }
    public string? Owner { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string CreatedBy { get; set; }

    public Framework Framework { get; set; } = null!;
    public ICollection<Evidence> Evidences { get; set; } = new List<Evidence>();
}

public class Evidence
{
    public int Id { get; set; }
    public int ControlId { get; set; }
    public required string FileName { get; set; }
    public required string BlobUrl { get; set; }
    public required string FileHash { get; set; }
    public long FileSize { get; set; }
    public required string UploadedBy { get; set; }
    public DateTime UploadedAt { get; set; }
    public string? Description { get; set; }

    public Control Control { get; set; } = null!;
}

public class Policy
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Version { get; set; }
    public string? Description { get; set; }
    public required string Status { get; set; }
    public string? Owner { get; set; }
    public DateTime EffectiveDate { get; set; }
    public DateTime? ReviewDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string CreatedBy { get; set; }
}

public class Audit
{
    public int Id { get; set; }
    public required string AuditType { get; set; }
    public required string Title { get; set; }
    public required string Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public required string Auditor { get; set; }
    public string? Scope { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string CreatedBy { get; set; }

    public ICollection<AuditFinding> Findings { get; set; } = new List<AuditFinding>();
}

public class AuditFinding
{
    public int Id { get; set; }
    public int AuditId { get; set; }
    public required string Title { get; set; }
    public required string Severity { get; set; }
    public string? Description { get; set; }
    public required string Status { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Owner { get; set; }
    public DateTime CreatedAt { get; set; }

    public Audit Audit { get; set; } = null!;
}
