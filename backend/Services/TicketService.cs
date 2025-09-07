using Microsoft.EntityFrameworkCore;
using LiveSupportDashboard.Api.Data;
using LiveSupportDashboard.Api.Models;
using LiveSupportDashboard.Api.Models.DTOs;

namespace LiveSupportDashboard.Api.Services;

public class TicketService : ITicketService
{
    private readonly ApplicationDbContext _context;

    public TicketService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TicketResponseDto>> GetAllTicketsAsync(
        TicketStatus? status = null,
        TicketPriority? priority = null,
        Guid? assignedAgentId = null,
        string? searchTerm = null,
        int page = 1,
        int limit = 10)
    {
        var query = _context.Tickets
            .Include(t => t.AssignedAgent)
            .AsQueryable();

        // Apply filters
        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        if (assignedAgentId.HasValue)
            query = query.Where(t => t.AssignedAgentId == assignedAgentId.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t => 
                t.Title.Contains(searchTerm) || 
                t.Description.Contains(searchTerm));
        }

        // Apply pagination and ordering
        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(t => new TicketResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                AssignedAgentId = t.AssignedAgentId,
                AssignedAgentName = t.AssignedAgent != null ? t.AssignedAgent.Name : null,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync();

        return tickets;
    }

    public async Task<TicketResponseDto?> GetTicketByIdAsync(Guid id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.AssignedAgent)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
            return null;

        return new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Priority = ticket.Priority,
            AssignedAgentId = ticket.AssignedAgentId,
            AssignedAgentName = ticket.AssignedAgent?.Name,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt
        };
    }

    public async Task<TicketResponseDto> CreateTicketAsync(CreateTicketDto createTicketDto)
    {
        // Validate assigned agent exists if provided
        if (createTicketDto.AssignedAgentId.HasValue)
        {
            var agentExists = await _context.Agents
                .AnyAsync(a => a.Id == createTicketDto.AssignedAgentId.Value && a.IsActive);
            
            if (!agentExists)
                throw new ArgumentException("Assigned agent not found or inactive");
        }

        var ticket = new Ticket
        {
            Title = createTicketDto.Title,
            Description = createTicketDto.Description,
            Priority = createTicketDto.Priority,
            AssignedAgentId = createTicketDto.AssignedAgentId,
            Status = TicketStatus.Open
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        // Load the agent information for response
        await _context.Entry(ticket)
            .Reference(t => t.AssignedAgent)
            .LoadAsync();

        return new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Priority = ticket.Priority,
            AssignedAgentId = ticket.AssignedAgentId,
            AssignedAgentName = ticket.AssignedAgent?.Name,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt
        };
    }

    public async Task<TicketResponseDto?> UpdateTicketAsync(Guid id, UpdateTicketDto updateTicketDto)
    {
        var ticket = await _context.Tickets
            .Include(t => t.AssignedAgent)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
            return null;

        // Validate assigned agent exists if provided
        if (updateTicketDto.AssignedAgentId.HasValue)
        {
            var agentExists = await _context.Agents
                .AnyAsync(a => a.Id == updateTicketDto.AssignedAgentId.Value && a.IsActive);
            
            if (!agentExists)
                throw new ArgumentException("Assigned agent not found or inactive");
        }

        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(updateTicketDto.Title))
            ticket.Title = updateTicketDto.Title;

        if (!string.IsNullOrWhiteSpace(updateTicketDto.Description))
            ticket.Description = updateTicketDto.Description;

        if (updateTicketDto.Status.HasValue)
            ticket.Status = updateTicketDto.Status.Value;

        if (updateTicketDto.Priority.HasValue)
            ticket.Priority = updateTicketDto.Priority.Value;

        if (updateTicketDto.AssignedAgentId.HasValue)
            ticket.AssignedAgentId = updateTicketDto.AssignedAgentId.Value;

        ticket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Reload agent information
        await _context.Entry(ticket)
            .Reference(t => t.AssignedAgent)
            .LoadAsync();

        return new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Priority = ticket.Priority,
            AssignedAgentId = ticket.AssignedAgentId,
            AssignedAgentName = ticket.AssignedAgent?.Name,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt
        };
    }

    public async Task<bool> DeleteTicketAsync(Guid id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return false;

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<TicketResponseDto?> AssignTicketAsync(Guid ticketId, Guid agentId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.AssignedAgent)
            .FirstOrDefaultAsync(t => t.Id == ticketId);

        if (ticket == null)
            return null;

        var agent = await _context.Agents.FindAsync(agentId);
        if (agent == null || !agent.IsActive)
            throw new ArgumentException("Agent not found or inactive");

        ticket.AssignedAgentId = agentId;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Reload agent information
        await _context.Entry(ticket)
            .Reference(t => t.AssignedAgent)
            .LoadAsync();

        return new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Priority = ticket.Priority,
            AssignedAgentId = ticket.AssignedAgentId,
            AssignedAgentName = ticket.AssignedAgent?.Name,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt
        };
    }

    public async Task<int> GetTotalTicketsCountAsync(
        TicketStatus? status = null,
        TicketPriority? priority = null,
        Guid? assignedAgentId = null,
        string? searchTerm = null)
    {
        var query = _context.Tickets.AsQueryable();

        // Apply same filters as GetAllTicketsAsync
        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        if (assignedAgentId.HasValue)
            query = query.Where(t => t.AssignedAgentId == assignedAgentId.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t => 
                t.Title.Contains(searchTerm) || 
                t.Description.Contains(searchTerm));
        }

        return await query.CountAsync();
    }
}
