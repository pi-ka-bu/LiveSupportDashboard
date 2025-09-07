import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Dashboard from './components/dashboard/Dashboard';
import TicketsPage from './pages/TicketsPage';
import AgentsPage from './pages/AgentsPage';
import SettingsPage from './pages/SettingsPage';
import { signalRService } from './services/signalr';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { addTicketRealtime, updateTicketRealtime, removeTicketRealtime } from './store/ticketSlice';
import { addNotification, removeNotification } from './store/uiSlice';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.ui);
  const [signalRConnected, setSignalRConnected] = useState(false);

  useEffect(() => {
    // Initialize SignalR connection
    const initializeSignalR = async () => {
      try {
        await signalRService.connect();
        setSignalRConnected(true);
        
        // Set up real-time event handlers
        const unsubscribeCreated = signalRService.onTicketCreated((ticket) => {
          dispatch(addTicketRealtime(ticket));
          dispatch(addNotification({
            type: 'info',
            message: `New ticket created: ${ticket.title}`,
            autoHide: true,
          }));
        });

        const unsubscribeUpdated = signalRService.onTicketUpdated((ticket) => {
          dispatch(updateTicketRealtime(ticket));
          dispatch(addNotification({
            type: 'info',
            message: `Ticket updated: ${ticket.title}`,
            autoHide: true,
          }));
        });

        const unsubscribeDeleted = signalRService.onTicketDeleted((ticketId) => {
          dispatch(removeTicketRealtime(ticketId));
          dispatch(addNotification({
            type: 'warning',
            message: 'A ticket was deleted',
            autoHide: true,
          }));
        });

        const unsubscribeAssigned = signalRService.onTicketAssigned((ticket) => {
          dispatch(updateTicketRealtime(ticket));
          dispatch(addNotification({
            type: 'success',
            message: `Ticket assigned: ${ticket.title}`,
            autoHide: true,
          }));
        });

        // Cleanup function
        return () => {
          unsubscribeCreated();
          unsubscribeUpdated();
          unsubscribeDeleted();
          unsubscribeAssigned();
        };
      } catch (error) {
        console.error('Failed to connect to SignalR:', error);
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to connect to real-time updates',
          autoHide: false,
        }));
      }
    };

    const cleanup = initializeSignalR();

    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
      signalRService.disconnect();
    };
  }, [dispatch]);

  const handleCloseNotification = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
  };

  return (
    <Router>
      <Layout>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </ErrorBoundary>
      </Layout>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHide ? 6000 : null}
          onClose={() => handleCloseNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => handleCloseNotification(notification.id)}
            severity={notification.type}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
