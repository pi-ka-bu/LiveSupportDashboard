import React from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTheme } from '../store/uiSlice';
import { signalRService } from '../services/signalr';

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.ui);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTheme(event.target.checked ? 'dark' : 'light'));
  };

  const signalRState = signalRService.getConnectionState();
  const isConnected = signalRState === 'Connected';

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={theme === 'dark'}
              onChange={handleThemeChange}
            />
          }
          label="Dark Mode"
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Real-time Connection
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="SignalR Status"
              secondary="Real-time updates for ticket changes"
            />
            <ListItemSecondaryAction>
              <Chip
                label={isConnected ? 'Connected' : 'Disconnected'}
                color={isConnected ? 'success' : 'error'}
                size="small"
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Application Information
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Version"
              secondary="1.0.0"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Backend API"
              secondary={process.env.REACT_APP_API_URL || 'https://localhost:7001/api'}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="SignalR Hub"
              secondary={process.env.REACT_APP_HUB_URL || 'https://localhost:7001/ticketHub'}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
