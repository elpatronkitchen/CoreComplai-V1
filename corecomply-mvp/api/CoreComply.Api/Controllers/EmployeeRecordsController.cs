using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/employee-records")]
[Authorize]
public class EmployeeRecordsController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeeRecordsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeRecord>>> GetAll(
        [FromQuery] string? status = null,
        [FromQuery] string? department = null)
    {
        var query = _context.EmployeeRecords.AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(e => e.Status == status);

        if (!string.IsNullOrEmpty(department))
            query = query.Where(e => e.Department == department);

        var records = await query
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeRecord>> Get(int id)
    {
        var record = await _context.EmployeeRecords.FindAsync(id);
        if (record == null)
            return NotFound();

        return Ok(record);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeRecord>> Create(CreateEmployeeRecordRequest request)
    {
        var record = new EmployeeRecord
        {
            Name = request.Name,
            EmployeeId = request.EmployeeId,
            Department = request.Department,
            Status = request.Status ?? "Active",
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            RetentionDate = request.RetentionDate,
            RecordTypes = request.RecordTypes ?? string.Empty,
            ComplianceScore = request.ComplianceScore,
            LastAudit = request.LastAudit,
            Location = request.Location,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.EmployeeRecords.Add(record);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = record.Id }, record);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateEmployeeRecordRequest request)
    {
        var record = await _context.EmployeeRecords.FindAsync(id);
        if (record == null)
            return NotFound();

        record.Name = request.Name;
        record.EmployeeId = request.EmployeeId;
        record.Department = request.Department;
        record.Status = request.Status;
        record.StartDate = request.StartDate;
        record.EndDate = request.EndDate;
        record.RetentionDate = request.RetentionDate;
        record.RecordTypes = request.RecordTypes;
        record.ComplianceScore = request.ComplianceScore;
        record.LastAudit = request.LastAudit;
        record.Location = request.Location;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var record = await _context.EmployeeRecords.FindAsync(id);
        if (record == null)
            return NotFound();

        _context.EmployeeRecords.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateEmployeeRecordRequest
{
    public string Name { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string? Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime RetentionDate { get; set; }
    public string? RecordTypes { get; set; }
    public int ComplianceScore { get; set; }
    public DateTime? LastAudit { get; set; }
    public string Location { get; set; } = string.Empty;
}

public class UpdateEmployeeRecordRequest
{
    public string Name { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime RetentionDate { get; set; }
    public string RecordTypes { get; set; } = string.Empty;
    public int ComplianceScore { get; set; }
    public DateTime? LastAudit { get; set; }
    public string Location { get; set; } = string.Empty;
}
