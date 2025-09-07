using Microsoft.AspNetCore.Mvc;
using LiveSupportDashboard.Api.Models.DTOs;
using LiveSupportDashboard.Api.Services;

namespace LiveSupportDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentsController : ControllerBase
{
    private readonly IAgentService _agentService;

    public AgentsController(IAgentService agentService)
    {
        _agentService = agentService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgentResponseDto>>> GetAgents([FromQuery] bool? isActive = null)
    {
        try
        {
            var agents = await _agentService.GetAllAgentsAsync(isActive);
            return Ok(agents);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving agents", Error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AgentResponseDto>> GetAgent(Guid id)
    {
        try
        {
            var agent = await _agentService.GetAgentByIdAsync(id);
            if (agent == null)
                return NotFound(new { Message = "Agent not found" });

            return Ok(agent);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving the agent", Error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<AgentResponseDto>> CreateAgent(CreateAgentDto createAgentDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var agent = await _agentService.CreateAgentAsync(createAgentDto);
            return CreatedAtAction(nameof(GetAgent), new { id = agent.Id }, agent);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while creating the agent", Error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AgentResponseDto>> UpdateAgent(Guid id, CreateAgentDto updateAgentDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var agent = await _agentService.UpdateAgentAsync(id, updateAgentDto);
            if (agent == null)
                return NotFound(new { Message = "Agent not found" });

            return Ok(agent);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while updating the agent", Error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAgent(Guid id)
    {
        try
        {
            var success = await _agentService.DeleteAgentAsync(id);
            if (!success)
                return NotFound(new { Message = "Agent not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while deleting the agent", Error = ex.Message });
        }
    }

    [HttpPut("{id}/toggle-status")]
    public async Task<ActionResult> ToggleAgentStatus(Guid id)
    {
        try
        {
            var success = await _agentService.ToggleAgentStatusAsync(id);
            if (!success)
                return NotFound(new { Message = "Agent not found" });

            return Ok(new { Message = "Agent status updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while updating agent status", Error = ex.Message });
        }
    }
}
