using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/assets")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssetsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Asset>>> GetAll(
        [FromQuery] string? type = null,
        [FromQuery] string? classification = null)
    {
        var query = _context.Assets.AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(a => a.Type == type);

        if (!string.IsNullOrEmpty(classification))
            query = query.Where(a => a.Classification == classification);

        var assets = await query
            .OrderBy(a => a.Name)
            .ToListAsync();

        return Ok(assets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Asset>> Get(int id)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null)
            return NotFound();

        return Ok(asset);
    }

    [HttpPost]
    public async Task<ActionResult<Asset>> Create(CreateAssetRequest request)
    {
        var asset = new Asset
        {
            Name = request.Name,
            Type = request.Type,
            Classification = request.Classification,
            Owner = request.Owner,
            Location = request.Location,
            Status = request.Status,
            PurchaseDate = request.PurchaseDate,
            Value = request.Value,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = asset.Id }, asset);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateAssetRequest request)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null)
            return NotFound();

        asset.Name = request.Name;
        asset.Type = request.Type;
        asset.Classification = request.Classification;
        asset.Owner = request.Owner;
        asset.Location = request.Location;
        asset.Status = request.Status;
        asset.PurchaseDate = request.PurchaseDate;
        asset.Value = request.Value;
        asset.Description = request.Description;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null)
            return NotFound();

        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateAssetRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Classification { get; set; } = "internal";
    public string Owner { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
    public DateTime? PurchaseDate { get; set; }
    public decimal? Value { get; set; }
    public string? Description { get; set; }
}

public class UpdateAssetRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Classification { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? PurchaseDate { get; set; }
    public decimal? Value { get; set; }
    public string? Description { get; set; }
}
