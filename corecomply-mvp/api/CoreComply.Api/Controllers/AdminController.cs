using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "System Admin,Compliance Owner")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<AdminUser>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? role = null,
        [FromQuery] string? status = null)
    {
        var query = _context.AdminUsers.AsQueryable();

        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.Role == role);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(u => u.Status == status);

        var users = await query
            .OrderBy(u => u.LastName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("users")]
    public async Task<ActionResult<AdminUser>> CreateUser(AdminUser user)
    {
        user.CreatedAt = DateTime.UtcNow;
        _context.AdminUsers.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, AdminUser user)
    {
        if (id != user.Id)
            return BadRequest();

        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.AdminUsers.AnyAsync(u => u.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.AdminUsers.FindAsync(id);
        if (user == null)
            return NotFound();

        _context.AdminUsers.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] string role)
    {
        var user = await _context.AdminUsers.FindAsync(id);
        if (user == null)
            return NotFound();

        user.Role = role;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("access-logs")]
    public async Task<ActionResult<IEnumerable<AccessLog>>> GetAccessLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = _context.AccessLogs.AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(l => l.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(l => l.Timestamp >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(l => l.Timestamp <= endDate.Value);

        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("settings")]
    public async Task<ActionResult<IEnumerable<SystemSetting>>> GetSettings([FromQuery] string? category = null)
    {
        var query = _context.SystemSettings.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(s => s.Category == category);

        var settings = await query
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Key)
            .ToListAsync();

        return Ok(settings);
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] IEnumerable<SystemSetting> settings)
    {
        foreach (var setting in settings)
        {
            var existing = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == setting.Key);

            if (existing != null)
            {
                existing.Value = setting.Value;
                _context.Entry(existing).State = EntityState.Modified;
            }
            else
            {
                _context.SystemSettings.Add(setting);
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
