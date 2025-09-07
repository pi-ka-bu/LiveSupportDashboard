import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchAgents, createAgent, updateAgent, deleteAgent, toggleAgentStatus } from '../store/agentSlice';
import { Agent, CreateAgentDto } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AgentsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { agents, loading } = useSelector((state: RootState) => state.agents);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    dispatch(fetchAgents() as any);
  }, [dispatch]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, agent: Agent) => {
    setAnchorEl(event.currentTarget);
    setSelectedAgent(agent);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAgent(null);
  };

  const handleCreateAgent = () => {
    setFormData({ name: '', email: '' });
    setFormMode('create');
    setFormOpen(true);
    setErrors({});
  };

  const handleEditAgent = () => {
    if (selectedAgent) {
      setFormData({ name: selectedAgent.name, email: selectedAgent.email });
      setFormMode('edit');
      setFormOpen(true);
      setErrors({});
    }
    handleMenuClose();
  };

  const handleDeleteAgent = async () => {
    if (selectedAgent) {
      await dispatch(deleteAgent(selectedAgent.id) as any);
    }
    handleMenuClose();
  };

  const handleToggleStatus = async () => {
    if (selectedAgent) {
      await dispatch(toggleAgentStatus(selectedAgent.id) as any);
    }
    handleMenuClose();
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email must be less than 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const agentData: CreateAgentDto = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      if (formMode === 'create') {
        await dispatch(createAgent(agentData) as any);
      } else if (selectedAgent) {
        await dispatch(updateAgent({ id: selectedAgent.id, agentData }) as any);
      }
      
      setFormOpen(false);
      setFormData({ name: '', email: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setFormData({ name: '', email: '' });
    setErrors({});
  };

  if (loading) {
    return <LoadingSpinner message="Loading agents..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Agents
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateAgent}
        >
          Add Agent
        </Button>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned Tickets</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {agent.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={agent.isActive ? 'Active' : 'Inactive'}
                      color={agent.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={agent.assignedTicketsCount}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, agent)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditAgent}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedAgent?.isActive ? (
            <ToggleOffIcon sx={{ mr: 1 }} />
          ) : (
            <ToggleOnIcon sx={{ mr: 1 }} />
          )}
          {selectedAgent?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={handleDeleteAgent} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitForm}>
          <DialogTitle>
            {formMode === 'create' ? 'Add New Agent' : 'Edit Agent'}
          </DialogTitle>
          
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} pt={1}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                required
              />

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                required
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseForm} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (formMode === 'create' ? 'Add' : 'Update')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AgentsPage;
