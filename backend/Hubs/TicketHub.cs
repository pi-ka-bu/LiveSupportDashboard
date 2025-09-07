using Microsoft.AspNetCore.SignalR;

namespace LiveSupportDashboard.Api.Hubs;

public class TicketHub : Hub
{
    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }

    public override async Task OnConnectedAsync()
    {
        // Add user to general tickets group
        await Groups.AddToGroupAsync(Context.ConnectionId, "TicketUpdates");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "TicketUpdates");
        await base.OnDisconnectedAsync(exception);
    }
}
