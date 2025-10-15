using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("oid")?.Value 
            ?? "unknown";
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Notification>>> GetAll()
    {
        var userId = GetCurrentUserId();
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.Timestamp)
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpGet("unread/count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.Read);

        return Ok(count);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null)
            return NotFound();

        notification.Read = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.Read)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.Read = true;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("clear-all")]
    public async Task<IActionResult> ClearAll()
    {
        var userId = GetCurrentUserId();
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .ToListAsync();

        _context.Notifications.RemoveRange(notifications);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<Notification>> Create(NotificationCreate request)
    {
        var notification = new Notification
        {
            UserId = GetCurrentUserId(), // Always use authenticated user ID
            Title = request.Title,
            Message = request.Message,
            Type = request.Type,
            Timestamp = DateTime.UtcNow,
            TaskId = request.TaskId,
            AuditId = request.AuditId,
            ControlId = request.ControlId,
            DueDate = request.DueDate,
            ActionUrl = request.ActionUrl
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = notification.Id }, notification);
    }
}

public class NotificationCreate
{
    public string Title { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string Type { get; set; } = "info";
    public string? TaskId { get; set; }
    public string? AuditId { get; set; }
    public string? ControlId { get; set; }
    public DateTime? DueDate { get; set; }
    public string? ActionUrl { get; set; }
}
