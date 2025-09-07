using Microsoft.EntityFrameworkCore;
using LiveSupportDashboard.Api.Models;

namespace LiveSupportDashboard.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Agent> Agents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Ticket entity
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Description).IsRequired().HasMaxLength(2000);
            entity.Property(t => t.Status).HasConversion<string>();
            entity.Property(t => t.Priority).HasConversion<string>();
            entity.Property(t => t.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(t => t.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            // Configure relationship with Agent
            entity.HasOne(t => t.AssignedAgent)
                  .WithMany(a => a.AssignedTickets)
                  .HasForeignKey(t => t.AssignedAgentId)
                  .OnDelete(DeleteBehavior.SetNull);

            // Create indexes for better query performance
            entity.HasIndex(t => t.Status);
            entity.HasIndex(t => t.Priority);
            entity.HasIndex(t => t.AssignedAgentId);
            entity.HasIndex(t => t.CreatedAt);
        });

        // Configure Agent entity
        modelBuilder.Entity<Agent>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Name).IsRequired().HasMaxLength(100);
            entity.Property(a => a.Email).IsRequired().HasMaxLength(255);
            entity.Property(a => a.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            // Create unique index on email
            entity.HasIndex(a => a.Email).IsUnique();
        });

        // Seed initial data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        var agents = new[]
        {
            new Agent
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "John Smith",
                Email = "john.smith@company.com",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Agent
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Name = "Sarah Johnson",
                Email = "sarah.johnson@company.com",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Agent
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Name = "Mike Davis",
                Email = "mike.davis@company.com",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        modelBuilder.Entity<Agent>().HasData(agents);

        var tickets = new[]
        {
            new Ticket
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Title = "Login Issues with Mobile App",
                Description = "Users are reporting they cannot log into the mobile application. The error message shows 'Invalid credentials' even with correct login information.",
                Status = TicketStatus.Open,
                Priority = TicketPriority.High,
                AssignedAgentId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                UpdatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new Ticket
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                Title = "Payment Processing Delay",
                Description = "Customer payments are taking longer than usual to process. Some transactions are stuck in pending status for over 24 hours.",
                Status = TicketStatus.InProgress,
                Priority = TicketPriority.Critical,
                AssignedAgentId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                CreatedAt = DateTime.UtcNow.AddHours(-5),
                UpdatedAt = DateTime.UtcNow.AddHours(-1)
            },
            new Ticket
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                Title = "Feature Request: Dark Mode",
                Description = "Multiple users have requested a dark mode option for the web application to reduce eye strain during extended use.",
                Status = TicketStatus.Open,
                Priority = TicketPriority.Low,
                AssignedAgentId = null,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        modelBuilder.Entity<Ticket>().HasData(tickets);
    }
}
