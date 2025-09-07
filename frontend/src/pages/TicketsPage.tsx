import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Fab,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { fetchAgents } from '../store/agentSlice';
import TicketList from '../components/tickets/TicketList';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketForm from '../components/tickets/TicketForm';
import AssignTicketDialog from '../components/tickets/AssignTicketDialog';
import { Ticket } from '../types';

const TicketsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    dispatch(fetchAgents() as any);
  }, [dispatch]);

  const handleCreateTicket = () => {
    setSelectedTicket(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleAssignTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAssignDialogOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedTicket(null);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedTicket(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Tickets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTicket}
        >
          Create Ticket
        </Button>
      </Box>

      <TicketFilters />
      
      <TicketList
        onEditTicket={handleEditTicket}
        onAssignTicket={handleAssignTicket}
      />

      <TicketForm
        open={formOpen}
        onClose={handleCloseForm}
        ticket={selectedTicket}
        mode={formMode}
      />

      <AssignTicketDialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        ticket={selectedTicket}
      />

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleCreateTicket}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TicketsPage;
