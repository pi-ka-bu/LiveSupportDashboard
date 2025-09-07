import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchTickets } from '../../store/ticketSlice';
import { fetchAgents } from '../../store/agentSlice';
import { TicketStatus, TicketPriority } from '../../types';
import { TICKET_STATUS_COLORS, TICKET_PRIORITY_COLORS } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { tickets, loading: ticketsLoading } = useSelector((state: RootState) => state.tickets);
  const { agents, loading: agentsLoading } = useSelector((state: RootState) => state.agents);

  useEffect(() => {
    dispatch(fetchTickets({ limit: 100 }) as any); // Get more tickets for stats
    dispatch(fetchAgents() as any);
  }, [dispatch]);

  const loading = ticketsLoading || agentsLoading;

  // Calculate statistics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === TicketStatus.Open).length;
  const inProgressTickets = tickets.filter(t => t.status === TicketStatus.InProgress).length;
  const resolvedTickets = tickets.filter(t => t.status === TicketStatus.Resolved).length;
  
  const criticalTickets = tickets.filter(t => t.priority === TicketPriority.Critical).length;
  const highPriorityTickets = tickets.filter(t => t.priority === TicketPriority.High).length;
  
  const activeAgents = agents.filter(a => a.isActive).length;
  const totalAgents = agents.length;

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
  }> = ({ title, value, icon, color = 'primary.main', subtitle }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            icon={<TicketIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Tickets"
            value={openTickets}
            icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
            color={TICKET_STATUS_COLORS[TicketStatus.Open]}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={inProgressTickets}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color={TICKET_STATUS_COLORS[TicketStatus.InProgress]}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Agents"
            value={activeAgents}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="success.main"
            subtitle={`${totalAgents} total`}
          />
        </Grid>

        {/* Priority Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Priority Breakdown
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {Object.values(TicketPriority).map((priority) => {
                const count = tickets.filter(t => t.priority === priority).length;
                const percentage = totalTickets > 0 ? (count / totalTickets) * 100 : 0;
                
                return (
                  <Box key={priority} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={priority}
                        size="small"
                        sx={{
                          backgroundColor: TICKET_PRIORITY_COLORS[priority],
                          color: 'white',
                          minWidth: 80,
                        }}
                      />
                      <Typography variant="body2">
                        {count} tickets
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Status Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Breakdown
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {Object.values(TicketStatus).map((status) => {
                const count = tickets.filter(t => t.status === status).length;
                const percentage = totalTickets > 0 ? (count / totalTickets) * 100 : 0;
                
                return (
                  <Box key={status} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={status === 'InProgress' ? 'In Progress' : status}
                        size="small"
                        sx={{
                          backgroundColor: TICKET_STATUS_COLORS[status],
                          color: 'white',
                          minWidth: 100,
                        }}
                      />
                      <Typography variant="body2">
                        {count} tickets
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tickets
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {tickets
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((ticket) => (
                  <Box
                    key={ticket.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={1}
                    sx={{ 
                      borderRadius: 1, 
                      backgroundColor: 'grey.50',
                      '&:hover': { backgroundColor: 'grey.100' }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        {ticket.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.assignedAgentName || 'Unassigned'}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={ticket.status === 'InProgress' ? 'In Progress' : ticket.status}
                        size="small"
                        sx={{
                          backgroundColor: TICKET_STATUS_COLORS[ticket.status],
                          color: 'white',
                        }}
                      />
                      <Chip
                        label={ticket.priority}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: TICKET_PRIORITY_COLORS[ticket.priority],
                          color: TICKET_PRIORITY_COLORS[ticket.priority],
                        }}
                      />
                    </Box>
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
