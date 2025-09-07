using LiveSupportDashboard.Api.Models;
using LiveSupportDashboard.Api.Models.DTOs;

namespace LiveSupportDashboard.Api.Services;

public interface ITicketService
{
    Task<IEnumerable<TicketResponseDto>> GetAllTicketsAsync(
        TicketStatus? status = null,
        TicketPriority? priority = null,
        Guid? assignedAgentId = null,
        string? searchTerm = null,
        int page = 1,
        int limit = 10);

    Task<TicketResponseDto?> GetTicketByIdAsync(Guid id);

    Task<TicketResponseDto> CreateTicketAsync(CreateTicketDto createTicketDto);

    Task<TicketResponseDto?> UpdateTicketAsync(Guid id, UpdateTicketDto updateTicketDto);

    Task<bool> DeleteTicketAsync(Guid id);

    Task<TicketResponseDto?> AssignTicketAsync(Guid ticketId, Guid agentId);

    Task<int> GetTotalTicketsCountAsync(
        TicketStatus? status = null,
        TicketPriority? priority = null,
        Guid? assignedAgentId = null,
        string? searchTerm = null);
}
