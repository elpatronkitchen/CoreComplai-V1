using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/onboarding")]
[Authorize]
public class OnboardingController : ControllerBase
{
    private readonly AppDbContext _context;

    public OnboardingController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("tasks")]
    public async Task<ActionResult<IEnumerable<OnboardingTask>>> GetTasks(
        [FromQuery] string? employeeId = null,
        [FromQuery] string? status = null)
    {
        var query = _context.OnboardingTasks.AsQueryable();

        if (!string.IsNullOrEmpty(employeeId))
            query = query.Where(t => t.EmployeeId == employeeId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        var tasks = await query
            .OrderBy(t => t.DueDate)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost("tasks")]
    public async Task<ActionResult<OnboardingTask>> CreateTask(CreateOnboardingTaskRequest request)
    {
        var task = new OnboardingTask
        {
            EmployeeId = request.EmployeeId,
            EmployeeName = request.EmployeeName,
            TaskName = request.TaskName,
            Description = request.Description,
            Category = request.Category,
            Status = "pending",
            AssignedTo = request.AssignedTo,
            DueDate = request.DueDate,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.OnboardingTasks.Add(task);
        await _context.SaveChangesAsync();

        // Update progress to reflect new task
        await UpdateEmployeeProgress(task.EmployeeId);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTasks), new { id = task.Id }, task);
    }

    [HttpPut("tasks/{id}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateOnboardingTaskRequest request)
    {
        var task = await _context.OnboardingTasks.FindAsync(id);
        if (task == null)
            return NotFound();

        task.TaskName = request.TaskName;
        task.Description = request.Description;
        task.Category = request.Category;
        task.Status = request.Status;
        task.AssignedTo = request.AssignedTo;
        task.DueDate = request.DueDate;
        task.Notes = request.Notes;

        if (request.Status == "completed" && !task.CompletedAt.HasValue)
        {
            task.CompletedAt = DateTime.UtcNow;
        }
        else if (request.Status != "completed" && task.CompletedAt.HasValue)
        {
            // Task was reopened, clear completion date
            task.CompletedAt = null;
        }

        // Update progress whenever task status changes
        await UpdateEmployeeProgress(task.EmployeeId);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("tasks/{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.OnboardingTasks.FindAsync(id);
        if (task == null)
            return NotFound();

        var employeeId = task.EmployeeId;
        _context.OnboardingTasks.Remove(task);
        await _context.SaveChangesAsync();
        
        // Update progress after task deletion (after SaveChanges)
        await UpdateEmployeeProgress(employeeId);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("progress")]
    public async Task<ActionResult<IEnumerable<OnboardingProgress>>> GetProgress(
        [FromQuery] string? employeeId = null)
    {
        var query = _context.OnboardingProgress.AsQueryable();

        if (!string.IsNullOrEmpty(employeeId))
            query = query.Where(p => p.EmployeeId == employeeId);

        var progress = await query
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();

        return Ok(progress);
    }

    [HttpPut("tasks/{id}/complete")]
    public async Task<IActionResult> CompleteTask(int id)
    {
        var task = await _context.OnboardingTasks.FindAsync(id);
        if (task == null)
            return NotFound();

        task.Status = "completed";
        task.CompletedAt = DateTime.UtcNow;

        // Update progress for this employee
        await UpdateEmployeeProgress(task.EmployeeId);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task UpdateEmployeeProgress(string employeeId)
    {
        var tasks = await _context.OnboardingTasks
            .Where(t => t.EmployeeId == employeeId)
            .ToListAsync();

        var totalTasks = tasks.Count;
        var completedTasks = tasks.Count(t => t.Status == "completed");
        var progressPercentage = totalTasks > 0 ? (double)completedTasks / totalTasks * 100 : 0;

        var progress = await _context.OnboardingProgress
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId);

        if (progress == null)
        {
            progress = new OnboardingProgress
            {
                EmployeeId = employeeId,
                EmployeeName = tasks.FirstOrDefault()?.EmployeeName ?? "",
                StartDate = DateTime.UtcNow,
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                ProgressPercentage = progressPercentage,
                Status = progressPercentage == 100 ? "completed" : "in_progress"
            };
            _context.OnboardingProgress.Add(progress);
        }
        else
        {
            progress.TotalTasks = totalTasks;
            progress.CompletedTasks = completedTasks;
            progress.ProgressPercentage = progressPercentage;
            progress.Status = progressPercentage == 100 ? "completed" : "in_progress";
            progress.UpdatedAt = DateTime.UtcNow;

            if (progressPercentage == 100 && !progress.CompletionDate.HasValue)
            {
                progress.CompletionDate = DateTime.UtcNow;
            }
            else if (progressPercentage < 100 && progress.CompletionDate.HasValue)
            {
                // Task was reopened, clear completion date
                progress.CompletionDate = null;
            }
        }
    }
}

public class CreateOnboardingTaskRequest
{
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string TaskName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string AssignedTo { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
}

public class UpdateOnboardingTaskRequest
{
    public string TaskName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string AssignedTo { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public string? Notes { get; set; }
}
