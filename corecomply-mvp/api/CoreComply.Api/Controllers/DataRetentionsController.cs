using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/data-retentions")]
[Authorize]
public class DataRetentionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DataRetentionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DataRetention>>> GetAll(
        [FromQuery] string? category = null,
        [FromQuery] string? status = null)
    {
        var query = _context.DataRetentions.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(d => d.Category == category);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(d => d.Status == status);

        var retentions = await query
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return Ok(retentions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DataRetention>> Get(int id)
    {
        var retention = await _context.DataRetentions.FindAsync(id);
        if (retention == null)
            return NotFound();

        return Ok(retention);
    }

    [HttpPost]
    public async Task<ActionResult<DataRetention>> Create(CreateDataRetentionRequest request)
    {
        var retention = new DataRetention
        {
            RecordType = request.RecordType,
            Category = request.Category,
            RetentionPeriodYears = request.RetentionPeriodYears,
            StorageLocation = request.StorageLocation,
            ArchiveFrequency = request.ArchiveFrequency,
            AccessRestrictions = request.AccessRestrictions,
            DisposalMethod = request.DisposalMethod,
            LastReview = request.LastReview,
            NextReview = request.NextReview,
            Owner = request.Owner,
            Status = request.Status ?? "Active",
            CreatedAt = DateTime.UtcNow
        };
        
        _context.DataRetentions.Add(retention);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = retention.Id }, retention);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateDataRetentionRequest request)
    {
        var retention = await _context.DataRetentions.FindAsync(id);
        if (retention == null)
            return NotFound();

        retention.RecordType = request.RecordType;
        retention.Category = request.Category;
        retention.RetentionPeriodYears = request.RetentionPeriodYears;
        retention.StorageLocation = request.StorageLocation;
        retention.ArchiveFrequency = request.ArchiveFrequency;
        retention.AccessRestrictions = request.AccessRestrictions;
        retention.DisposalMethod = request.DisposalMethod;
        retention.LastReview = request.LastReview;
        retention.NextReview = request.NextReview;
        retention.Owner = request.Owner;
        retention.Status = request.Status;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var retention = await _context.DataRetentions.FindAsync(id);
        if (retention == null)
            return NotFound();

        _context.DataRetentions.Remove(retention);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateDataRetentionRequest
{
    public string RecordType { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int RetentionPeriodYears { get; set; }
    public string StorageLocation { get; set; } = string.Empty;
    public string ArchiveFrequency { get; set; } = string.Empty;
    public string AccessRestrictions { get; set; } = string.Empty;
    public string DisposalMethod { get; set; } = string.Empty;
    public DateTime? LastReview { get; set; }
    public DateTime? NextReview { get; set; }
    public string Owner { get; set; } = string.Empty;
    public string? Status { get; set; }
}

public class UpdateDataRetentionRequest
{
    public string RecordType { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int RetentionPeriodYears { get; set; }
    public string StorageLocation { get; set; } = string.Empty;
    public string ArchiveFrequency { get; set; } = string.Empty;
    public string AccessRestrictions { get; set; } = string.Empty;
    public string DisposalMethod { get; set; } = string.Empty;
    public DateTime? LastReview { get; set; }
    public DateTime? NextReview { get; set; }
    public string Owner { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
