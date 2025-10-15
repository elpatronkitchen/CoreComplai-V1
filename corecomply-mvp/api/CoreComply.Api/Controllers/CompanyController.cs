using CoreComply.Api.Data;
using CoreComply.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Controllers;

[ApiController]
[Route("api/company")]
[Authorize]
public class CompanyController : ControllerBase
{
    private readonly AppDbContext _context;

    public CompanyController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<CompanyProfile>> GetProfile()
    {
        var profile = await _context.CompanyProfiles.FirstOrDefaultAsync();
        
        if (profile == null)
        {
            // Return a default profile if none exists
            return Ok(new CompanyProfile
            {
                Name = "Company Name",
                Industry = "Not Set",
                Address = "Not Set",
                EmployeeCount = 0
            });
        }

        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(CompanyProfile profile)
    {
        var existing = await _context.CompanyProfiles.FirstOrDefaultAsync();

        if (existing == null)
        {
            profile.UpdatedAt = DateTime.UtcNow;
            _context.CompanyProfiles.Add(profile);
        }
        else
        {
            existing.Name = profile.Name;
            existing.Industry = profile.Industry;
            existing.Abn = profile.Abn;
            existing.Acn = profile.Acn;
            existing.Address = profile.Address;
            existing.Phone = profile.Phone;
            existing.Email = profile.Email;
            existing.Website = profile.Website;
            existing.EmployeeCount = profile.EmployeeCount;
            existing.EstablishedDate = profile.EstablishedDate;
            existing.LogoUrl = profile.LogoUrl;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("settings")]
    public async Task<ActionResult<IEnumerable<CompanySettings>>> GetSettings(
        [FromQuery] string? category = null)
    {
        var query = _context.CompanySettings.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(s => s.Category == category);

        var settings = await query
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Key)
            .ToListAsync();

        return Ok(settings);
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings(IEnumerable<CompanySettings> settings)
    {
        foreach (var setting in settings)
        {
            var existing = await _context.CompanySettings
                .FirstOrDefaultAsync(s => s.Key == setting.Key);

            if (existing != null)
            {
                existing.Value = setting.Value;
            }
            else
            {
                _context.CompanySettings.Add(setting);
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
