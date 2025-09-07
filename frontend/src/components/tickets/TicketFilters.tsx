import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setFilters } from '../../store/ticketSlice';
import { TicketStatus, TicketPriority } from '../../types';

const TicketFilters: React.FC = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state: RootState) => state.tickets);
  const { agents } = useSelector((state: RootState) => state.agents);

  const handleFilterChange = (field: string, value: any) => {
    dispatch(setFilters({ 
      ...filters, 
      [field]: value === '' ? undefined : value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const clearFilters = () => {
    dispatch(setFilters({
      page: 1,
      limit: filters.limit || 10,
    }));
  };

  const hasActiveFilters = !!(
    filters.status || 
    filters.priority || 
    filters.assignedAgentId || 
    filters.searchTerm
  );

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
        <TextField
          label="Search"
          placeholder="Search tickets..."
          value={filters.searchTerm || ''}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ''}
            label="Status"
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(TicketStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status === 'InProgress' ? 'In Progress' : status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={filters.priority || ''}
            label="Priority"
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(TicketPriority).map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priority}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Assigned Agent</InputLabel>
          <Select
            value={filters.assignedAgentId || ''}
            label="Assigned Agent"
            onChange={(e) => handleFilterChange('assignedAgentId', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="unassigned">Unassigned</MenuItem>
            {agents.filter(agent => agent.isActive).map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                {agent.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {hasActiveFilters && (
        <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
            Active filters:
          </Typography>
          {filters.searchTerm && (
            <Chip
              label={`Search: "${filters.searchTerm}"`}
              size="small"
              onDelete={() => handleFilterChange('searchTerm', '')}
            />
          )}
          {filters.status && (
            <Chip
              label={`Status: ${filters.status === 'InProgress' ? 'In Progress' : filters.status}`}
              size="small"
              onDelete={() => handleFilterChange('status', '')}
            />
          )}
          {filters.priority && (
            <Chip
              label={`Priority: ${filters.priority}`}
              size="small"
              onDelete={() => handleFilterChange('priority', '')}
            />
          )}
          {filters.assignedAgentId && (
            <Chip
              label={`Agent: ${
                filters.assignedAgentId === 'unassigned' 
                  ? 'Unassigned' 
                  : agents.find(a => a.id === filters.assignedAgentId)?.name || 'Unknown'
              }`}
              size="small"
              onDelete={() => handleFilterChange('assignedAgentId', '')}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default TicketFilters;
