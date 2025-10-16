using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using CoreComply.Api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EvidenceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IBlobStorageService _blobStorage;

    public EvidenceController(AppDbContext context, IBlobStorageService blobStorage)
    {
        _context = context;
        _blobStorage = blobStorage;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Evidence>>> GetAll([FromQuery] int? controlId = null)
    {
        var query = _context.Evidences.AsQueryable();

        if (controlId.HasValue)
            query = query.Where(e => e.ControlId == controlId.Value);

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Evidence>> Get(int id)
    {
        var evidence = await _context.Evidences.FindAsync(id);

        if (evidence == null)
            return NotFound();

        return evidence;
    }

    [HttpPost]
    [RequestSizeLimit(52428800)] // 50MB
    public async Task<ActionResult<Evidence>> Upload([FromForm] IFormFile file, [FromForm] int controlId, [FromForm] string? description)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var control = await _context.Controls.FindAsync(controlId);
        if (control == null)
            return NotFound("Control not found");

        using var stream = file.OpenReadStream();
        var (blobUrl, fileHash) = await _blobStorage.UploadAsync(stream, file.FileName, file.ContentType);

        var evidence = new Evidence
        {
            ControlId = controlId,
            FileName = file.FileName,
            BlobUrl = blobUrl,
            FileHash = fileHash,
            FileSize = file.Length,
            UploadedBy = User.Identity?.Name ?? "Unknown",
            UploadedAt = DateTime.UtcNow,
            Description = description
        };

        _context.Evidences.Add(evidence);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = evidence.Id }, evidence);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var evidence = await _context.Evidences.FindAsync(id);
        if (evidence == null)
            return NotFound();

        await _blobStorage.DeleteAsync(evidence.BlobUrl);
        _context.Evidences.Remove(evidence);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
