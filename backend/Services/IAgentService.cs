using LiveSupportDashboard.Api.Models.DTOs;

namespace LiveSupportDashboard.Api.Services;

public interface IAgentService
{
    Task<IEnumerable<AgentResponseDto>> GetAllAgentsAsync(bool? isActive = null);
    Task<AgentResponseDto?> GetAgentByIdAsync(Guid id);
    Task<AgentResponseDto> CreateAgentAsync(CreateAgentDto createAgentDto);
    Task<AgentResponseDto?> UpdateAgentAsync(Guid id, CreateAgentDto updateAgentDto);
    Task<bool> DeleteAgentAsync(Guid id);
    Task<bool> ToggleAgentStatusAsync(Guid id);
}
