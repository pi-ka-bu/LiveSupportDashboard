using System.ComponentModel.DataAnnotations;

namespace LiveSupportDashboard.Api.Models.DTOs;

public class CreateTicketDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public TicketPriority Priority { get; set; }

    public Guid? AssignedAgentId { get; set; }
}

public class UpdateTicketDto
{
    [StringLength(200)]
    public string? Title { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }

    public TicketStatus? Status { get; set; }

    public TicketPriority? Priority { get; set; }

    public Guid? AssignedAgentId { get; set; }
}

public class TicketResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public TicketPriority Priority { get; set; }
    public Guid? AssignedAgentId { get; set; }
    public string? AssignedAgentName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
