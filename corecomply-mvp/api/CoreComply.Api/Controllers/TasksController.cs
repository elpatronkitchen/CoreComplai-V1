using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ComplianceTask>>> GetAll(
        [FromQuery] string? assignee = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? type = null)
    {
        var query = _context.Tasks.AsQueryable();

        if (!string.IsNullOrEmpty(assignee))
            query = query.Where(t => t.Assignee == assignee);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        if (startDate.HasValue)
            query = query.Where(t => t.DueDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(t => t.DueDate <= endDate.Value);

        if (!string.IsNullOrEmpty(type))
            query = query.Where(t => t.Type == type);

        var tasks = await query
            .OrderBy(t => t.DueDate)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ComplianceTask>> Get(int id)
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null)
            return NotFound();

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<ComplianceTask>> Create(ComplianceTask task)
    {
        task.CreatedAt = DateTime.UtcNow;
        
        // Auto-set status to overdue if due date has passed
        if (task.DueDate < DateTime.UtcNow && task.Status == "pending")
        {
            task.Status = "overdue";
        }

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ComplianceTask task)
    {
        if (id != task.Id)
            return BadRequest();

        _context.Entry(task).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Tasks.AnyAsync(t => t.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/complete")]
    public async Task<IActionResult> Complete(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        task.Status = "completed";
        task.CompletedAt = DateTime.UtcNow;

        // Handle recurring tasks
        if (!string.IsNullOrEmpty(task.RecurringFrequency))
        {
            task.NextDue = task.RecurringFrequency switch
            {
                "weekly" => task.DueDate.AddDays(7),
                "monthly" => task.DueDate.AddMonths(1),
                "quarterly" => task.DueDate.AddMonths(3),
                "annual" => task.DueDate.AddYears(1),
                _ => null
            };
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("calendar")]
    public async Task<ActionResult<IEnumerable<ComplianceTask>>> GetCalendarTasks(
        [FromQuery] DateTime? month = null)
    {
        var targetMonth = month ?? DateTime.UtcNow;
        var startOfMonth = new DateTime(targetMonth.Year, targetMonth.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

        var tasks = await _context.Tasks
            .Where(t => t.DueDate >= startOfMonth && t.DueDate <= endOfMonth)
            .OrderBy(t => t.DueDate)
            .ToListAsync();

        return Ok(tasks);
    }
}
