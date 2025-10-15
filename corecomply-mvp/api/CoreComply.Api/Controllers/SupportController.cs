using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/support")]
[Authorize]
public class SupportController : ControllerBase
{
    private readonly AppDbContext _context;

    public SupportController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("tickets")]
    public async Task<ActionResult<IEnumerable<SupportTicket>>> GetTickets(
        [FromQuery] string? status = null)
    {
        var query = _context.SupportTickets.AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("tickets/{id}")]
    public async Task<ActionResult<SupportTicket>> GetTicket(int id)
    {
        var ticket = await _context.SupportTickets.FindAsync(id);
        if (ticket == null)
            return NotFound();

        return Ok(ticket);
    }

    [HttpPost("tickets")]
    public async Task<ActionResult<SupportTicket>> CreateTicket(CreateTicketRequest request)
    {
        var ticket = new SupportTicket
        {
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Priority = request.Priority,
            Status = "open",
            RequestedBy = User.Identity?.Name ?? "Unknown",
            CreatedAt = DateTime.UtcNow
        };
        
        _context.SupportTickets.Add(ticket);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

    [HttpPut("tickets/{id}")]
    public async Task<IActionResult> UpdateTicket(int id, UpdateTicketRequest request)
    {
        var ticket = await _context.SupportTickets.FindAsync(id);
        if (ticket == null)
            return NotFound();

        ticket.Title = request.Title;
        ticket.Description = request.Description;
        ticket.Category = request.Category;
        ticket.Priority = request.Priority;
        ticket.Status = request.Status;
        ticket.AssignedTo = request.AssignedTo;
        ticket.Resolution = request.Resolution;

        if (request.Status == "resolved" || request.Status == "closed")
        {
            ticket.ResolvedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("tickets/{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        var ticket = await _context.SupportTickets.FindAsync(id);
        if (ticket == null)
            return NotFound();

        _context.SupportTickets.Remove(ticket);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("knowledge-base")]
    public async Task<ActionResult<IEnumerable<KnowledgeBaseArticle>>> GetArticles(
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        var query = _context.KnowledgeBaseArticles.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(a => a.Category == category);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(a => a.Title.Contains(search) || a.Content.Contains(search));

        var articles = await query
            .OrderByDescending(a => a.ViewCount)
            .ToListAsync();

        return Ok(articles);
    }

    [HttpGet("knowledge-base/{id}")]
    public async Task<ActionResult<KnowledgeBaseArticle>> GetArticle(int id)
    {
        var article = await _context.KnowledgeBaseArticles.FindAsync(id);
        if (article == null)
            return NotFound();

        // Increment view count
        article.ViewCount++;
        await _context.SaveChangesAsync();

        return Ok(article);
    }

    [HttpPost("knowledge-base")]
    public async Task<ActionResult<KnowledgeBaseArticle>> CreateArticle(CreateArticleRequest request)
    {
        var article = new KnowledgeBaseArticle
        {
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            Tags = request.Tags,
            ViewCount = 0,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.KnowledgeBaseArticles.Add(article);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
    }

    [HttpPut("knowledge-base/{id}")]
    public async Task<IActionResult> UpdateArticle(int id, UpdateArticleRequest request)
    {
        var article = await _context.KnowledgeBaseArticles.FindAsync(id);
        if (article == null)
            return NotFound();

        article.Title = request.Title;
        article.Content = request.Content;
        article.Category = request.Category;
        article.Tags = request.Tags;
        article.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("knowledge-base/{id}")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        var article = await _context.KnowledgeBaseArticles.FindAsync(id);
        if (article == null)
            return NotFound();

        _context.KnowledgeBaseArticles.Remove(article);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateTicketRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "general";
    public string Priority { get; set; } = "medium";
}

public class UpdateTicketRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string? Resolution { get; set; }
}

public class CreateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string[] Tags { get; set; } = Array.Empty<string>();
}

public class UpdateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string[] Tags { get; set; } = Array.Empty<string>();
}
