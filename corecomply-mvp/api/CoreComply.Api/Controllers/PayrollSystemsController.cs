using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/payroll-systems")]
[Authorize]
public class PayrollSystemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PayrollSystemsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PayrollSystem>>> GetAll(
        [FromQuery] string? type = null,
        [FromQuery] string? criticalityLevel = null)
    {
        var query = _context.PayrollSystems.AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(s => s.Type == type);

        if (!string.IsNullOrEmpty(criticalityLevel))
            query = query.Where(s => s.CriticalityLevel == criticalityLevel);

        var systems = await query
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(systems);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PayrollSystem>> Get(int id)
    {
        var system = await _context.PayrollSystems.FindAsync(id);
        if (system == null)
            return NotFound();

        return Ok(system);
    }

    [HttpPost]
    public async Task<ActionResult<PayrollSystem>> Create(CreatePayrollSystemRequest request)
    {
        var system = new PayrollSystem
        {
            Name = request.Name,
            Type = request.Type,
            Vendor = request.Vendor,
            Version = request.Version,
            Owner = request.Owner,
            CriticalityLevel = request.CriticalityLevel ?? "Medium",
            LastUpdate = request.LastUpdate,
            ComplianceStatus = request.ComplianceStatus ?? "Compliant",
            Integrations = request.Integrations ?? string.Empty,
            DataRetention = request.DataRetention ?? string.Empty,
            BackupFrequency = request.BackupFrequency ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.PayrollSystems.Add(system);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = system.Id }, system);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdatePayrollSystemRequest request)
    {
        var system = await _context.PayrollSystems.FindAsync(id);
        if (system == null)
            return NotFound();

        system.Name = request.Name;
        system.Type = request.Type;
        system.Vendor = request.Vendor;
        system.Version = request.Version;
        system.Owner = request.Owner;
        system.CriticalityLevel = request.CriticalityLevel;
        system.LastUpdate = request.LastUpdate;
        system.ComplianceStatus = request.ComplianceStatus;
        system.Integrations = request.Integrations;
        system.DataRetention = request.DataRetention;
        system.BackupFrequency = request.BackupFrequency;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var system = await _context.PayrollSystems.FindAsync(id);
        if (system == null)
            return NotFound();

        _context.PayrollSystems.Remove(system);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreatePayrollSystemRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string? CriticalityLevel { get; set; }
    public DateTime? LastUpdate { get; set; }
    public string? ComplianceStatus { get; set; }
    public string? Integrations { get; set; }
    public string? DataRetention { get; set; }
    public string? BackupFrequency { get; set; }
}

public class UpdatePayrollSystemRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string CriticalityLevel { get; set; } = string.Empty;
    public DateTime? LastUpdate { get; set; }
    public string ComplianceStatus { get; set; } = string.Empty;
    public string Integrations { get; set; } = string.Empty;
    public string DataRetention { get; set; } = string.Empty;
    public string BackupFrequency { get; set; } = string.Empty;
}
