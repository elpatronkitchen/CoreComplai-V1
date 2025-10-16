using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/payroll-audit")]
[Authorize]
public class PayrollAuditController : ControllerBase
{
    private readonly AppDbContext _context;

    public PayrollAuditController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("kpis")]
    public async Task<ActionResult<PayrollAuditKPIs>> GetKPIs()
    {
        var latestKPIs = await _context.PayrollAuditKPIs
            .OrderByDescending(k => k.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestKPIs == null)
        {
            // Return default KPIs if none exist
            return Ok(new PayrollAuditKPIs
            {
                TotalExceptions = 0,
                VarianceAmount = 0,
                EmployeesAffected = 0,
                SuccessRate = 100,
                LastSyncTime = DateTime.UtcNow
            });
        }

        return Ok(latestKPIs);
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<IEnumerable<AuditSession>>> GetSessions()
    {
        var sessions = await _context.AuditSessions
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(sessions);
    }

    [HttpPost("sessions")]
    public async Task<ActionResult<AuditSession>> CreateSession(AuditSession session)
    {
        session.CreatedAt = DateTime.UtcNow;
        _context.AuditSessions.Add(session);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSession), new { id = session.Id }, session);
    }

    [HttpGet("sessions/{id}")]
    public async Task<ActionResult<AuditSession>> GetSession(int id)
    {
        var session = await _context.AuditSessions.FindAsync(id);
        if (session == null)
            return NotFound();

        return Ok(session);
    }

    [HttpGet("integration-health")]
    public async Task<ActionResult<IntegrationHealth>> GetIntegrationHealth()
    {
        var health = await _context.IntegrationHealths
            .OrderByDescending(h => h.UpdatedAt)
            .FirstOrDefaultAsync();

        if (health == null)
        {
            // Return default health status
            return Ok(new IntegrationHealth
            {
                PayrollSourceName = "Payroll System",
                PayrollSourceStatus = "disconnected",
                TaaSourceName = "Fair Work Commission",
                TaaSourceStatus = "disconnected"
            });
        }

        return Ok(health);
    }

    [HttpGet("payrun-validations")]
    public async Task<ActionResult<IEnumerable<PayrunValidation>>> GetPayrunValidations()
    {
        var validations = await _context.PayrunValidations
            .OrderByDescending(v => v.CreatedAt)
            .Take(50)
            .ToListAsync();

        return Ok(validations);
    }

    [HttpGet("employee-variances")]
    public async Task<ActionResult<IEnumerable<EmployeeVariance>>> GetEmployeeVariances(
        [FromQuery] string? severity = null,
        [FromQuery] string? status = null)
    {
        var query = _context.EmployeeVariances.AsQueryable();

        if (!string.IsNullOrEmpty(severity))
            query = query.Where(v => v.Severity == severity);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(v => v.Status == status);

        var variances = await query
            .OrderByDescending(v => v.DetectedAt)
            .ToListAsync();

        return Ok(variances);
    }

    [HttpPost("export")]
    public async Task<ActionResult> ExportAuditData([FromBody] ExportRequest request)
    {
        // In a real implementation, this would generate and return a file
        // For now, return success with a placeholder response
        return Ok(new { message = "Export initiated", format = request.Format, timestamp = DateTime.UtcNow });
    }
}

public class ExportRequest
{
    public string Format { get; set; } = "pdf"; // pdf, excel, csv
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
