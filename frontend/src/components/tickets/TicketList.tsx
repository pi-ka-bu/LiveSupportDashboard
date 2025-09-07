import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchTickets, deleteTicket, setFilters } from '../../store/ticketSlice';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import { formatRelativeTime, truncateText } from '../../utils/formatters';
import { TICKET_STATUS_COLORS, TICKET_PRIORITY_COLORS } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';

interface TicketListProps {
  onEditTicket: (ticket: Ticket) => void;
  onAssignTicket: (ticket: Ticket) => void;
}

const TicketList: React.FC<TicketListProps> = ({ onEditTicket, onAssignTicket }) => {
  const dispatch = useDispatch();
  const { tickets, loading, pagination, filters } = useSelector((state: RootState) => state.tickets);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    dispatch(fetchTickets(filters) as any);
  }, [dispatch, filters]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, ticket: Ticket) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTicket(null);
  };

  const handleEdit = () => {
    if (selectedTicket) {
      onEditTicket(selectedTicket);
    }
    handleMenuClose();
  };

  const handleAssign = () => {
    if (selectedTicket) {
      onAssignTicket(selectedTicket);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedTicket) {
      await dispatch(deleteTicket(selectedTicket.id) as any);
      // Refresh the list after deletion
      dispatch(fetchTickets(filters) as any);
    }
    handleMenuClose();
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(setFilters({ ...filters, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ 
      ...filters, 
      page: 1, 
      limit: parseInt(event.target.value, 10) 
    }));
  };

  const getStatusChip = (status: TicketStatus) => (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: TICKET_STATUS_COLORS[status],
        color: 'white',
        fontWeight: 'bold',
      }}
    />
  );

  const getPriorityChip = (priority: TicketPriority) => (
    <Chip
      label={priority}
      size="small"
      variant="outlined"
      sx={{
        borderColor: TICKET_PRIORITY_COLORS[priority],
        color: TICKET_PRIORITY_COLORS[priority],
        fontWeight: 'bold',
      }}
    />
  );

  if (loading) {
    return <LoadingSpinner message="Loading tickets..." />;
  }

  return (
    <Paper elevation={2}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assigned Agent</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {truncateText(ticket.title, 50)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {truncateText(ticket.description, 80)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{getStatusChip(ticket.status)}</TableCell>
                <TableCell>{getPriorityChip(ticket.priority)}</TableCell>
                <TableCell>
                  {ticket.assignedAgentName ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {ticket.assignedAgentName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {ticket.assignedAgentName}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title={new Date(ticket.createdAt).toLocaleString()}>
                    <Typography variant="body2">
                      {formatRelativeTime(ticket.createdAt)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={new Date(ticket.updatedAt).toLocaleString()}>
                    <Typography variant="body2">
                      {formatRelativeTime(ticket.updatedAt)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, ticket)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={pagination.totalCount}
        rowsPerPage={pagination.limit}
        page={pagination.page - 1}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleAssign}>
          <AssignIcon sx={{ mr: 1 }} />
          Assign
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default TicketList;
