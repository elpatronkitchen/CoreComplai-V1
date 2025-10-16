using CoreComply.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStats>> GetStats()
    {
        var now = DateTime.UtcNow;
        
        var stats = new DashboardStats
        {
            TotalFrameworks = await _context.Frameworks.CountAsync(),
            TotalControls = await _context.Controls.CountAsync(),
            TotalPolicies = await _context.Policies.CountAsync(),
            TotalAudits = await _context.Audits.CountAsync(),
            ActiveTasks = await _context.Tasks.CountAsync(t => t.Status == "in_progress" || t.Status == "pending"),
            OverdueTasks = await _context.Tasks.CountAsync(t => t.Status == "overdue" || (t.DueDate < now && t.Status != "completed")),
            OpenFindings = await _context.AuditFindings.CountAsync(f => f.Status == "open"),
            ComplianceScore = await CalculateComplianceScore()
        };

        return Ok(stats);
    }

    [HttpGet("recent-activity")]
    public async Task<ActionResult<IEnumerable<DashboardActivity>>> GetRecentActivity()
    {
        // Aggregate recent activities from various sources
        var activities = new List<DashboardActivity>();

        // Recent controls
        var recentControls = await _context.Controls
            .OrderByDescending(c => c.CreatedAt)
            .Take(5)
            .ToListAsync();

        activities.AddRange(recentControls.Select(c => new DashboardActivity
        {
            Id = Guid.NewGuid().ToString(),
            Type = "control",
            Title = "Control Updated",
            Description = c.Title,
            Timestamp = c.CreatedAt,
            UserId = c.Owner ?? "System",
            UserName = c.Owner ?? "System"
        }));

        // Recent audits
        var recentAudits = await _context.Audits
            .OrderByDescending(a => a.CreatedAt)
            .Take(5)
            .ToListAsync();

        activities.AddRange(recentAudits.Select(a => new DashboardActivity
        {
            Id = Guid.NewGuid().ToString(),
            Type = "audit",
            Title = "Audit Activity",
            Description = a.Title,
            Timestamp = a.CreatedAt,
            UserId = a.Auditor ?? "System",
            UserName = a.Auditor ?? "System"
        }));

        return Ok(activities.OrderByDescending(a => a.Timestamp).Take(10));
    }

    [HttpGet("compliance-score")]
    public async Task<ActionResult<decimal>> GetComplianceScore()
    {
        var score = await CalculateComplianceScore();
        return Ok(score);
    }

    [HttpGet("upcoming-tasks")]
    public async Task<ActionResult<object>> GetUpcomingTasks()
    {
        var upcomingTasks = await _context.Tasks
            .Where(t => t.Status == "pending" || t.Status == "in_progress")
            .OrderBy(t => t.DueDate)
            .Take(10)
            .ToListAsync();

        return Ok(new { count = upcomingTasks.Count, tasks = upcomingTasks });
    }

    [HttpGet("alerts")]
    public async Task<ActionResult<IEnumerable<object>>> GetAlerts()
    {
        var alerts = new List<object>();

        // Check for overdue controls
        var overdueControls = await _context.Controls
            .Where(c => c.Status == "Not Started" || c.Status == "Evidence Pending")
            .Take(5)
            .ToListAsync();

        alerts.AddRange(overdueControls.Select(c => new
        {
            type = "warning",
            title = "Control Attention Required",
            message = $"{c.Title} requires attention",
            timestamp = DateTime.UtcNow
        }));

        // Check for critical findings
        var criticalFindings = await _context.AuditFindings
            .Where(f => f.Severity == "Critical" && f.Status == "open")
            .Take(5)
            .ToListAsync();

        alerts.AddRange(criticalFindings.Select(f => new
        {
            type = "error",
            title = "Critical Finding",
            message = f.Title,
            timestamp = f.CreatedAt
        }));

        return Ok(alerts);
    }

    private async Task<decimal> CalculateComplianceScore()
    {
        var totalControls = await _context.Controls.CountAsync();
        if (totalControls == 0) return 0;

        var compliantControls = await _context.Controls
            .CountAsync(c => c.Status == "Compliant" || c.Status == "Audit Ready");

        return Math.Round((decimal)compliantControls / totalControls * 100, 1);
    }
}

public class DashboardStats
{
    public int TotalFrameworks { get; set; }
    public int TotalControls { get; set; }
    public int TotalPolicies { get; set; }
    public int TotalAudits { get; set; }
    public int ActiveTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int OpenFindings { get; set; }
    public decimal ComplianceScore { get; set; }
}

public class DashboardActivity
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}
