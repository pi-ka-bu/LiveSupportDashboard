using System.ComponentModel.DataAnnotations;

namespace LiveSupportDashboard.Api.Models;

public class Agent
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Ticket> AssignedTickets { get; set; } = new List<Ticket>();
}
