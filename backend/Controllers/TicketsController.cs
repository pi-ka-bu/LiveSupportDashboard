using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using LiveSupportDashboard.Api.Models;
using LiveSupportDashboard.Api.Models.DTOs;
using LiveSupportDashboard.Api.Services;
using LiveSupportDashboard.Api.Hubs;

namespace LiveSupportDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly IHubContext<TicketHub> _hubContext;

    public TicketsController(ITicketService ticketService, IHubContext<TicketHub> hubContext)
    {
        _ticketService = ticketService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetTickets(
        [FromQuery] TicketStatus? status = null,
        [FromQuery] TicketPriority? priority = null,
        [FromQuery] Guid? assignedAgentId = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        try
        {
            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 10;

            var tickets = await _ticketService.GetAllTicketsAsync(
                status, priority, assignedAgentId, searchTerm, page, limit);
            
            var totalCount = await _ticketService.GetTotalTicketsCountAsync(
                status, priority, assignedAgentId, searchTerm);

            var response = new
            {
                Data = tickets,
                Pagination = new
                {
                    Page = page,
                    Limit = limit,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling((double)totalCount / limit)
                }
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving tickets", Error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketResponseDto>> GetTicket(Guid id)
    {
        try
        {
            var ticket = await _ticketService.GetTicketByIdAsync(id);
            if (ticket == null)
                return NotFound(new { Message = "Ticket not found" });

            return Ok(ticket);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving the ticket", Error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TicketResponseDto>> CreateTicket(CreateTicketDto createTicketDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ticket = await _ticketService.CreateTicketAsync(createTicketDto);

            // Notify clients about new ticket
            await _hubContext.Clients.Group("TicketUpdates").SendAsync("TicketCreated", ticket);

            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while creating the ticket", Error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketResponseDto>> UpdateTicket(Guid id, UpdateTicketDto updateTicketDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ticket = await _ticketService.UpdateTicketAsync(id, updateTicketDto);
            if (ticket == null)
                return NotFound(new { Message = "Ticket not found" });

            // Notify clients about ticket update
            await _hubContext.Clients.Group("TicketUpdates").SendAsync("TicketUpdated", ticket);

            return Ok(ticket);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while updating the ticket", Error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTicket(Guid id)
    {
        try
        {
            var success = await _ticketService.DeleteTicketAsync(id);
            if (!success)
                return NotFound(new { Message = "Ticket not found" });

            // Notify clients about ticket deletion
            await _hubContext.Clients.Group("TicketUpdates").SendAsync("TicketDeleted", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while deleting the ticket", Error = ex.Message });
        }
    }

    [HttpPut("{id}/assign")]
    public async Task<ActionResult<TicketResponseDto>> AssignTicket(Guid id, [FromBody] AssignTicketDto assignDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ticket = await _ticketService.AssignTicketAsync(id, assignDto.AgentId);
            if (ticket == null)
                return NotFound(new { Message = "Ticket not found" });

            // Notify clients about ticket assignment
            await _hubContext.Clients.Group("TicketUpdates").SendAsync("TicketAssigned", ticket);

            return Ok(ticket);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while assigning the ticket", Error = ex.Message });
        }
    }
}

public class AssignTicketDto
{
    public Guid AgentId { get; set; }
}
