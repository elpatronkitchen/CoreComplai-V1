using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/risks")]
[Authorize]
public class RisksController : ControllerBase
{
    private readonly AppDbContext _context;

    public RisksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Risk>>> GetAll(
        [FromQuery] string? category = null,
        [FromQuery] string? status = null)
    {
        var query = _context.Risks.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(r => r.Category == category);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(r => r.Status == status);

        var risks = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(risks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Risk>> Get(int id)
    {
        var risk = await _context.Risks.FindAsync(id);
        if (risk == null)
            return NotFound();

        return Ok(risk);
    }

    [HttpPost]
    public async Task<ActionResult<Risk>> Create(CreateRiskRequest request)
    {
        var risk = new Risk
        {
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Likelihood = request.Likelihood,
            Impact = request.Impact,
            Status = "open",
            Owner = request.Owner,
            IdentifiedDate = DateTime.UtcNow,
            ReviewDate = request.ReviewDate,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Risks.Add(risk);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = risk.Id }, risk);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateRiskRequest request)
    {
        var risk = await _context.Risks.FindAsync(id);
        if (risk == null)
            return NotFound();

        risk.Title = request.Title;
        risk.Description = request.Description;
        risk.Category = request.Category;
        risk.Likelihood = request.Likelihood;
        risk.Impact = request.Impact;
        risk.Status = request.Status;
        risk.Owner = request.Owner;
        risk.ReviewDate = request.ReviewDate;
        risk.Mitigation = request.Mitigation;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var risk = await _context.Risks.FindAsync(id);
        if (risk == null)
            return NotFound();

        _context.Risks.Remove(risk);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateRiskRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Likelihood { get; set; } = "medium";
    public string Impact { get; set; } = "medium";
    public string Owner { get; set; } = string.Empty;
    public DateTime? ReviewDate { get; set; }
}

public class UpdateRiskRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Likelihood { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public DateTime? ReviewDate { get; set; }
    public string? Mitigation { get; set; }
}
