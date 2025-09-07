import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { assignTicket } from '../../store/ticketSlice';
import { fetchAgents } from '../../store/agentSlice';
import { Ticket } from '../../types';

interface AssignTicketDialogProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const AssignTicketDialog: React.FC<AssignTicketDialogProps> = ({ open, onClose, ticket }) => {
  const dispatch = useDispatch();
  const { agents } = useSelector((state: RootState) => state.agents);
  const { loading } = useSelector((state: RootState) => state.tickets);

  const [selectedAgentId, setSelectedAgentId] = useState('');

  useEffect(() => {
    dispatch(fetchAgents(true) as any); // Fetch only active agents
  }, [dispatch]);

  useEffect(() => {
    if (ticket && open) {
      setSelectedAgentId(ticket.assignedAgentId || '');
    }
  }, [ticket, open]);

  const handleAssign = async () => {
    if (ticket && selectedAgentId) {
      try {
        await dispatch(assignTicket({ 
          ticketId: ticket.id, 
          agentId: selectedAgentId 
        }) as any);
        onClose();
      } catch (error) {
        console.error('Error assigning ticket:', error);
      }
    }
  };

  const activeAgents = agents.filter(agent => agent.isActive);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Ticket</DialogTitle>
      
      <DialogContent>
        {ticket && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              {ticket.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current assignment: {ticket.assignedAgentName || 'Unassigned'}
            </Typography>
          </Box>
        )}

        <FormControl fullWidth>
          <InputLabel>Select Agent</InputLabel>
          <Select
            value={selectedAgentId}
            label="Select Agent"
            onChange={(e) => setSelectedAgentId(e.target.value)}
          >
            <MenuItem value="">
              <em>Unassigned</em>
            </MenuItem>
            {activeAgents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                    {agent.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{agent.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agent.assignedTicketsCount} active tickets
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleAssign} 
          variant="contained" 
          disabled={loading || !selectedAgentId}
        >
          {loading ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTicketDialog;
