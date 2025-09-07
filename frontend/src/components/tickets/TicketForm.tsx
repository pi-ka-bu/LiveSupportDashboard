import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { createTicket, updateTicket } from '../../store/ticketSlice';
import { fetchAgents } from '../../store/agentSlice';
import { Ticket, TicketPriority, TicketStatus, CreateTicketDto, UpdateTicketDto } from '../../types';

interface TicketFormProps {
  open: boolean;
  onClose: () => void;
  ticket?: Ticket | null;
  mode: 'create' | 'edit';
}

const TicketForm: React.FC<TicketFormProps> = ({ open, onClose, ticket, mode }) => {
  const dispatch = useDispatch();
  const { agents } = useSelector((state: RootState) => state.agents);
  const { loading } = useSelector((state: RootState) => state.tickets);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedAgentId: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    dispatch(fetchAgents(true) as any); // Fetch only active agents
  }, [dispatch]);

  useEffect(() => {
    if (ticket && mode === 'edit') {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        assignedAgentId: ticket.assignedAgentId || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: TicketPriority.Medium,
        status: TicketStatus.Open,
        assignedAgentId: '',
      });
    }
    setErrors({});
  }, [ticket, mode, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        const createData: CreateTicketDto = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          assignedAgentId: formData.assignedAgentId || undefined,
        };
        await dispatch(createTicket(createData) as any);
      } else if (ticket) {
        const updateData: UpdateTicketDto = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          status: formData.status,
          assignedAgentId: formData.assignedAgentId || undefined,
        };
        await dispatch(updateTicket({ id: ticket.id, ticketData: updateData }) as any);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Create New Ticket' : 'Edit Ticket'}
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              required
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={4}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                {Object.values(TicketPriority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {mode === 'edit' && (
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {Object.values(TicketStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === 'InProgress' ? 'In Progress' : status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Assigned Agent</InputLabel>
              <Select
                value={formData.assignedAgentId}
                label="Assigned Agent"
                onChange={(e) => handleInputChange('assignedAgentId', e.target.value)}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {agents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    {agent.name} ({agent.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TicketForm;
