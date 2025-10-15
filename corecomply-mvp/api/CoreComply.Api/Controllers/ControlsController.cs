using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ControlsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ControlsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Control>>> GetAll([FromQuery] int? frameworkId = null)
    {
        var query = _context.Controls
            .Include(c => c.Evidences)
            .AsQueryable();

        if (frameworkId.HasValue)
            query = query.Where(c => c.FrameworkId == frameworkId.Value);

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Control>> Get(int id)
    {
        var control = await _context.Controls
            .Include(c => c.Evidences)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (control == null)
            return NotFound();

        return control;
    }

    [HttpPost]
    public async Task<ActionResult<Control>> Create(Control control)
    {
        control.CreatedAt = DateTime.UtcNow;
        _context.Controls.Add(control);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = control.Id }, control);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Control control)
    {
        if (id != control.Id)
            return BadRequest();

        _context.Entry(control).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Controls.AnyAsync(c => c.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var control = await _context.Controls.FindAsync(id);
        if (control == null)
            return NotFound();

        _context.Controls.Remove(control);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
