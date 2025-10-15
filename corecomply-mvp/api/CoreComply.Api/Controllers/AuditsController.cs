using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuditsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Audit>>> GetAll()
    {
        return await _context.Audits
            .Include(a => a.Findings)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Audit>> Get(int id)
    {
        var audit = await _context.Audits
            .Include(a => a.Findings)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (audit == null)
            return NotFound();

        return audit;
    }

    [HttpPost]
    public async Task<ActionResult<Audit>> Create(Audit audit)
    {
        audit.CreatedAt = DateTime.UtcNow;
        _context.Audits.Add(audit);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = audit.Id }, audit);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Audit audit)
    {
        if (id != audit.Id)
            return BadRequest();

        _context.Entry(audit).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Audits.AnyAsync(a => a.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var audit = await _context.Audits.FindAsync(id);
        if (audit == null)
            return NotFound();

        _context.Audits.Remove(audit);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{auditId}/findings")]
    public async Task<ActionResult<AuditFinding>> CreateFinding(int auditId, AuditFinding finding)
    {
        var audit = await _context.Audits.FindAsync(auditId);
        if (audit == null)
            return NotFound();

        finding.AuditId = auditId;
        finding.CreatedAt = DateTime.UtcNow;
        _context.AuditFindings.Add(finding);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = audit.Id }, finding);
    }
}
