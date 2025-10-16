using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/compliance-gaps")]
[Authorize]
public class ComplianceGapsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ComplianceGapsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ComplianceGap>>> GetAll(
        [FromQuery] string? severity = null,
        [FromQuery] string? status = null)
    {
        var query = _context.ComplianceGaps.AsQueryable();

        if (!string.IsNullOrEmpty(severity))
            query = query.Where(g => g.Severity == severity);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(g => g.Status == status);

        var gaps = await query
            .OrderByDescending(g => g.DiscoveredDate)
            .ToListAsync();

        return Ok(gaps);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ComplianceGap>> Get(int id)
    {
        var gap = await _context.ComplianceGaps.FindAsync(id);
        if (gap == null)
            return NotFound();

        return Ok(gap);
    }

    [HttpPost]
    public async Task<ActionResult<ComplianceGap>> Create(CreateComplianceGapRequest request)
    {
        var gap = new ComplianceGap
        {
            Title = request.Title,
            Category = request.Category,
            Severity = request.Severity ?? "Medium",
            Description = request.Description,
            Impact = request.Impact,
            AffectedEmployees = request.AffectedEmployees,
            DiscoveredDate = request.DiscoveredDate,
            TargetResolution = request.TargetResolution,
            Owner = request.Owner,
            Status = request.Status ?? "Open",
            CreatedAt = DateTime.UtcNow
        };
        
        _context.ComplianceGaps.Add(gap);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = gap.Id }, gap);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateComplianceGapRequest request)
    {
        var gap = await _context.ComplianceGaps.FindAsync(id);
        if (gap == null)
            return NotFound();

        gap.Title = request.Title;
        gap.Category = request.Category;
        gap.Severity = request.Severity;
        gap.Description = request.Description;
        gap.Impact = request.Impact;
        gap.AffectedEmployees = request.AffectedEmployees;
        gap.DiscoveredDate = request.DiscoveredDate;
        gap.TargetResolution = request.TargetResolution;
        gap.Owner = request.Owner;
        gap.Status = request.Status;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var gap = await _context.ComplianceGaps.FindAsync(id);
        if (gap == null)
            return NotFound();

        _context.ComplianceGaps.Remove(gap);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateComplianceGapRequest
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Severity { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public int AffectedEmployees { get; set; }
    public DateTime DiscoveredDate { get; set; }
    public DateTime? TargetResolution { get; set; }
    public string Owner { get; set; } = string.Empty;
    public string? Status { get; set; }
}

public class UpdateComplianceGapRequest
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public int AffectedEmployees { get; set; }
    public DateTime DiscoveredDate { get; set; }
    public DateTime? TargetResolution { get; set; }
    public string Owner { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
