using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/integrations")]
[Authorize]
public class IntegrationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public IntegrationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Integration>>> GetAll()
    {
        var integrations = await _context.Integrations
            .OrderBy(i => i.Name)
            .ToListAsync();

        return Ok(integrations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Integration>> Get(int id)
    {
        var integration = await _context.Integrations.FindAsync(id);
        if (integration == null)
            return NotFound();

        return Ok(integration);
    }

    [HttpPost]
    public async Task<ActionResult<Integration>> Create(CreateIntegrationRequest request)
    {
        var integration = new Integration
        {
            Name = request.Name,
            Type = request.Type,
            Status = "disconnected",
            Configuration = request.Configuration,
            ApiKey = request.ApiKey,
            Endpoint = request.Endpoint,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Integrations.Add(integration);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = integration.Id }, integration);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateIntegrationRequest request)
    {
        var integration = await _context.Integrations.FindAsync(id);
        if (integration == null)
            return NotFound();

        integration.Name = request.Name;
        integration.Type = request.Type;
        integration.Status = request.Status;
        integration.Configuration = request.Configuration;
        integration.ApiKey = request.ApiKey;
        integration.Endpoint = request.Endpoint;
        integration.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var integration = await _context.Integrations.FindAsync(id);
        if (integration == null)
            return NotFound();

        _context.Integrations.Remove(integration);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/sync")]
    public async Task<IActionResult> Sync(int id)
    {
        var integration = await _context.Integrations.FindAsync(id);
        if (integration == null)
            return NotFound();

        // In a real implementation, this would trigger the sync process
        integration.LastSync = DateTime.UtcNow;
        integration.Status = "connected";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sync initiated", lastSync = integration.LastSync });
    }
}

public class CreateIntegrationRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Configuration { get; set; }
    public string? ApiKey { get; set; }
    public string? Endpoint { get; set; }
}

public class UpdateIntegrationRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Configuration { get; set; }
    public string? ApiKey { get; set; }
    public string? Endpoint { get; set; }
}
