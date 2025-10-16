using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/compliance-documents")]
[Authorize]
public class ComplianceDocumentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ComplianceDocumentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ComplianceDocument>>> GetAll(
        [FromQuery] string? type = null,
        [FromQuery] string? status = null)
    {
        var query = _context.ComplianceDocuments.AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(d => d.Type == type);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(d => d.Status == status);

        var documents = await query
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return Ok(documents);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ComplianceDocument>> Get(int id)
    {
        var document = await _context.ComplianceDocuments.FindAsync(id);
        if (document == null)
            return NotFound();

        return Ok(document);
    }

    [HttpPost]
    public async Task<ActionResult<ComplianceDocument>> Create(CreateComplianceDocumentRequest request)
    {
        var document = new ComplianceDocument
        {
            Title = request.Title,
            Type = request.Type,
            Category = request.Category,
            Version = request.Version,
            EffectiveDate = request.EffectiveDate,
            ReviewDate = request.ReviewDate,
            Status = request.Status ?? "Current",
            Owner = request.Owner,
            AccessLevel = request.AccessLevel,
            LastUpdate = request.LastUpdate,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.ComplianceDocuments.Add(document);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = document.Id }, document);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateComplianceDocumentRequest request)
    {
        var document = await _context.ComplianceDocuments.FindAsync(id);
        if (document == null)
            return NotFound();

        document.Title = request.Title;
        document.Type = request.Type;
        document.Category = request.Category;
        document.Version = request.Version;
        document.EffectiveDate = request.EffectiveDate;
        document.ReviewDate = request.ReviewDate;
        document.Status = request.Status;
        document.Owner = request.Owner;
        document.AccessLevel = request.AccessLevel;
        document.LastUpdate = request.LastUpdate;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var document = await _context.ComplianceDocuments.FindAsync(id);
        if (document == null)
            return NotFound();

        _context.ComplianceDocuments.Remove(document);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateComplianceDocumentRequest
{
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ReviewDate { get; set; }
    public string? Status { get; set; }
    public string Owner { get; set; } = string.Empty;
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime? LastUpdate { get; set; }
}

public class UpdateComplianceDocumentRequest
{
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ReviewDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime? LastUpdate { get; set; }
}
