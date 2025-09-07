using Microsoft.EntityFrameworkCore;
using LiveSupportDashboard.Api.Data;
using LiveSupportDashboard.Api.Models;
using LiveSupportDashboard.Api.Models.DTOs;

namespace LiveSupportDashboard.Api.Services;

public class AgentService : IAgentService
{
    private readonly ApplicationDbContext _context;

    public AgentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AgentResponseDto>> GetAllAgentsAsync(bool? isActive = null)
    {
        var query = _context.Agents.AsQueryable();

        if (isActive.HasValue)
            query = query.Where(a => a.IsActive == isActive.Value);

        var agents = await query
            .Select(a => new AgentResponseDto
            {
                Id = a.Id,
                Name = a.Name,
                Email = a.Email,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                AssignedTicketsCount = a.AssignedTickets.Count(t => t.Status != TicketStatus.Resolved)
            })
            .OrderBy(a => a.Name)
            .ToListAsync();

        return agents;
    }

    public async Task<AgentResponseDto?> GetAgentByIdAsync(Guid id)
    {
        var agent = await _context.Agents
            .Include(a => a.AssignedTickets)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (agent == null)
            return null;

        return new AgentResponseDto
        {
            Id = agent.Id,
            Name = agent.Name,
            Email = agent.Email,
            IsActive = agent.IsActive,
            CreatedAt = agent.CreatedAt,
            AssignedTicketsCount = agent.AssignedTickets.Count(t => t.Status != TicketStatus.Resolved)
        };
    }

    public async Task<AgentResponseDto> CreateAgentAsync(CreateAgentDto createAgentDto)
    {
        // Check if email already exists
        var existingAgent = await _context.Agents
            .FirstOrDefaultAsync(a => a.Email == createAgentDto.Email);

        if (existingAgent != null)
            throw new ArgumentException("An agent with this email already exists");

        var agent = new Agent
        {
            Name = createAgentDto.Name,
            Email = createAgentDto.Email,
            IsActive = true
        };

        _context.Agents.Add(agent);
        await _context.SaveChangesAsync();

        return new AgentResponseDto
        {
            Id = agent.Id,
            Name = agent.Name,
            Email = agent.Email,
            IsActive = agent.IsActive,
            CreatedAt = agent.CreatedAt,
            AssignedTicketsCount = 0
        };
    }

    public async Task<AgentResponseDto?> UpdateAgentAsync(Guid id, CreateAgentDto updateAgentDto)
    {
        var agent = await _context.Agents
            .Include(a => a.AssignedTickets)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (agent == null)
            return null;

        // Check if email already exists for another agent
        var existingAgent = await _context.Agents
            .FirstOrDefaultAsync(a => a.Email == updateAgentDto.Email && a.Id != id);

        if (existingAgent != null)
            throw new ArgumentException("An agent with this email already exists");

        agent.Name = updateAgentDto.Name;
        agent.Email = updateAgentDto.Email;

        await _context.SaveChangesAsync();

        return new AgentResponseDto
        {
            Id = agent.Id,
            Name = agent.Name,
            Email = agent.Email,
            IsActive = agent.IsActive,
            CreatedAt = agent.CreatedAt,
            AssignedTicketsCount = agent.AssignedTickets.Count(t => t.Status != TicketStatus.Resolved)
        };
    }

    public async Task<bool> DeleteAgentAsync(Guid id)
    {
        var agent = await _context.Agents
            .Include(a => a.AssignedTickets)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (agent == null)
            return false;

        // Unassign all tickets before deleting agent
        foreach (var ticket in agent.AssignedTickets)
        {
            ticket.AssignedAgentId = null;
            ticket.UpdatedAt = DateTime.UtcNow;
        }

        _context.Agents.Remove(agent);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleAgentStatusAsync(Guid id)
    {
        var agent = await _context.Agents.FindAsync(id);
        if (agent == null)
            return false;

        agent.IsActive = !agent.IsActive;

        // If deactivating agent, unassign all their tickets
        if (!agent.IsActive)
        {
            var assignedTickets = await _context.Tickets
                .Where(t => t.AssignedAgentId == id)
                .ToListAsync();

            foreach (var ticket in assignedTickets)
            {
                ticket.AssignedAgentId = null;
                ticket.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
