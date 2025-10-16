using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FrameworksController : ControllerBase
{
    private readonly AppDbContext _context;

    public FrameworksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Framework>>> GetAll()
    {
        return await _context.Frameworks
            .Include(f => f.Controls)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Framework>> Get(int id)
    {
        var framework = await _context.Frameworks
            .Include(f => f.Controls)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (framework == null)
            return NotFound();

        return framework;
    }

    [HttpPost]
    public async Task<ActionResult<Framework>> Create(Framework framework)
    {
        framework.CreatedAt = DateTime.UtcNow;
        _context.Frameworks.Add(framework);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = framework.Id }, framework);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Framework framework)
    {
        if (id != framework.Id)
            return BadRequest();

        _context.Entry(framework).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Frameworks.AnyAsync(f => f.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> Activate(int id)
    {
        var framework = await _context.Frameworks.FindAsync(id);
        if (framework == null)
            return NotFound();

        framework.IsActive = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var framework = await _context.Frameworks.FindAsync(id);
        if (framework == null)
            return NotFound();

        framework.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var framework = await _context.Frameworks.FindAsync(id);
        if (framework == null)
            return NotFound();

        _context.Frameworks.Remove(framework);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
