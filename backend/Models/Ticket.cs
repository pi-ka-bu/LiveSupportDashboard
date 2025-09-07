using System.ComponentModel.DataAnnotations;

namespace LiveSupportDashboard.Api.Models;

public class Ticket
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public TicketStatus Status { get; set; } = TicketStatus.Open;

    [Required]
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;

    public Guid? AssignedAgentId { get; set; }

    public Agent? AssignedAgent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum TicketStatus
{
    Open,
    InProgress,
    Resolved
}

public enum TicketPriority
{
    Low,
    Medium,
    High,
    Critical
}
