using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FindingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public FindingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuditFinding>>> GetAll(
        [FromQuery] int? auditId = null,
        [FromQuery] string? severity = null,
        [FromQuery] string? status = null)
    {
        var query = _context.AuditFindings
            .Include(f => f.Audit)
            .AsQueryable();

        if (auditId.HasValue)
            query = query.Where(f => f.AuditId == auditId.Value);

        if (!string.IsNullOrEmpty(severity))
            query = query.Where(f => f.Severity == severity);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(f => f.Status == status);

        var findings = await query
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return Ok(findings);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AuditFinding>> Get(int id)
    {
        var finding = await _context.AuditFindings
            .Include(f => f.Audit)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (finding == null)
            return NotFound();

        return Ok(finding);
    }

    [HttpPost]
    public async Task<ActionResult<AuditFinding>> Create(AuditFinding finding)
    {
        finding.CreatedAt = DateTime.UtcNow;
        _context.AuditFindings.Add(finding);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = finding.Id }, finding);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, AuditFinding finding)
    {
        if (id != finding.Id)
            return BadRequest();

        _context.Entry(finding).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.AuditFindings.AnyAsync(f => f.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var finding = await _context.AuditFindings.FindAsync(id);
        if (finding == null)
            return NotFound();

        _context.AuditFindings.Remove(finding);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var finding = await _context.AuditFindings.FindAsync(id);
        if (finding == null)
            return NotFound();

        finding.Status = status;

        if (status == "resolved")
        {
            finding.ResolvedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/evidence")]
    public async Task<IActionResult> AddEvidence(int id, [FromBody] EvidenceRequest request)
    {
        var finding = await _context.AuditFindings.FindAsync(id);
        if (finding == null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.EvidenceUrl))
            return BadRequest(new { message = "Evidence URL is required" });

        // Create evidence record linked to the finding's control
        var evidence = new Evidence
        {
            ControlId = finding.ControlId,
            FileName = request.FileName ?? "Finding Evidence",
            BlobUrl = request.EvidenceUrl,
            FileHash = request.FileHash ?? "N/A",
            UploadedAt = DateTime.UtcNow,
            UploadedBy = User.Identity?.Name ?? "System"
        };

        _context.Evidences.Add(evidence);
        await _context.SaveChangesAsync();

        return Ok(new { evidenceId = evidence.Id });
    }
}

public class EvidenceRequest
{
    public string EvidenceUrl { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public string? FileHash { get; set; }
}
