using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PeopleController : ControllerBase
{
    private readonly AppDbContext _context;

    public PeopleController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Person>>> GetAll()
    {
        var people = await _context.People
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .ToListAsync();

        return Ok(people);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Person>> Get(int id)
    {
        var person = await _context.People.FindAsync(id);

        if (person == null)
            return NotFound();

        return Ok(person);
    }

    [HttpPost]
    public async Task<ActionResult<Person>> Create(Person person)
    {
        person.CreatedAt = DateTime.UtcNow;
        _context.People.Add(person);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            if (await _context.People.AnyAsync(p => p.Email == person.Email))
            {
                return Conflict(new { message = "A person with this email already exists" });
            }
            throw;
        }

        return CreatedAtAction(nameof(Get), new { id = person.Id }, person);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Person person)
    {
        if (id != person.Id)
            return BadRequest();

        _context.Entry(person).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.People.AnyAsync(p => p.Id == id))
                return NotFound();
            throw;
        }
        catch (DbUpdateException)
        {
            if (await _context.People.AnyAsync(p => p.Email == person.Email && p.Id != id))
            {
                return Conflict(new { message = "A person with this email already exists" });
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var person = await _context.People.FindAsync(id);
        if (person == null)
            return NotFound();

        _context.People.Remove(person);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("departments")]
    public async Task<ActionResult<IEnumerable<string>>> GetDepartments()
    {
        var departments = await _context.People
            .Select(p => p.Department)
            .Distinct()
            .OrderBy(d => d)
            .ToListAsync();

        return Ok(departments);
    }
}
