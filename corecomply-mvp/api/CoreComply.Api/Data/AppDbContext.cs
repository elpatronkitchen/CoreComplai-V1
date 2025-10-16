using CoreComply.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CoreComply.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Framework> Frameworks { get; set; }
    public DbSet<Control> Controls { get; set; }
    public DbSet<Evidence> Evidences { get; set; }
    public DbSet<Policy> Policies { get; set; }
    public DbSet<Audit> Audits { get; set; }
    public DbSet<AuditFinding> AuditFindings { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<ComplianceTask> Tasks { get; set; }
    public DbSet<Person> People { get; set; }
    public DbSet<AdminUser> AdminUsers { get; set; }
    public DbSet<AccessLog> AccessLogs { get; set; }
    public DbSet<SystemSetting> SystemSettings { get; set; }
    public DbSet<PayrollAuditKPIs> PayrollAuditKPIs { get; set; }
    public DbSet<AuditSession> AuditSessions { get; set; }
    public DbSet<IntegrationHealth> IntegrationHealths { get; set; }
    public DbSet<PayrunValidation> PayrunValidations { get; set; }
    public DbSet<EmployeeVariance> EmployeeVariances { get; set; }
    public DbSet<OnboardingTask> OnboardingTasks { get; set; }
    public DbSet<OnboardingProgress> OnboardingProgress { get; set; }
    public DbSet<Report> Reports { get; set; }
    public DbSet<ReportTemplate> ReportTemplates { get; set; }
    public DbSet<Risk> Risks { get; set; }
    public DbSet<Asset> Assets { get; set; }
    public DbSet<EmployeeRecord> EmployeeRecords { get; set; }
    public DbSet<PayrollSystem> PayrollSystems { get; set; }
    public DbSet<ComplianceDocument> ComplianceDocuments { get; set; }
    public DbSet<ComplianceGap> ComplianceGaps { get; set; }
    public DbSet<DataRetention> DataRetentions { get; set; }
    public DbSet<Integration> Integrations { get; set; }
    public DbSet<SupportTicket> SupportTickets { get; set; }
    public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles { get; set; }
    public DbSet<CompanyProfile> CompanyProfiles { get; set; }
    public DbSet<CompanySettings> CompanySettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Framework>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Version).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => new { e.Name, e.Version }).IsUnique();
        });

        modelBuilder.Entity<Control>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ControlId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            
            entity.HasOne(e => e.Framework)
                .WithMany(f => f.Controls)
                .HasForeignKey(e => e.FrameworkId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Evidence>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(500);
            entity.Property(e => e.BlobUrl).IsRequired();
            entity.Property(e => e.FileHash).IsRequired().HasMaxLength(64);
            
            entity.HasOne(e => e.Control)
                .WithMany(c => c.Evidences)
                .HasForeignKey(e => e.ControlId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Policy>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Version).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<Audit>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AuditType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<AuditFinding>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Severity).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            
            entity.HasOne(e => e.Audit)
                .WithMany(a => a.Findings)
                .HasForeignKey(e => e.AuditId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(200);
            entity.HasIndex(e => new { e.UserId, e.Read });
        });

        modelBuilder.Entity<ComplianceTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Priority).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => new { e.Status, e.DueDate });
        });

        modelBuilder.Entity<Person>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Department).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<AccessLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(200);
            entity.Property(e => e.UserName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IPAddress).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => new { e.UserId, e.Timestamp });
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Key).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Value).IsRequired();
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => new { e.Category, e.Key }).IsUnique();
        });
    }
}
