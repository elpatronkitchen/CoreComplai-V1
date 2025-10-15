using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PoliciesController : ControllerBase
{
    private readonly AppDbContext _context;

    public PoliciesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Policy>>> GetAll()
    {
        return await _context.Policies.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Policy>> Get(int id)
    {
        var policy = await _context.Policies.FindAsync(id);

        if (policy == null)
            return NotFound();

        return policy;
    }

    [HttpPost]
    public async Task<ActionResult<Policy>> Create(Policy policy)
    {
        policy.CreatedAt = DateTime.UtcNow;
        _context.Policies.Add(policy);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = policy.Id }, policy);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Policy policy)
    {
        if (id != policy.Id)
            return BadRequest();

        _context.Entry(policy).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Policies.AnyAsync(p => p.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var policy = await _context.Policies.FindAsync(id);
        if (policy == null)
            return NotFound();

        _context.Policies.Remove(policy);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
