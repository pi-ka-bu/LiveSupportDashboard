import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Ticket, CreateTicketDto, UpdateTicketDto, TicketFilters, PaginatedResponse } from '../types';
import { ticketApi } from '../services/api';

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  filters: Partial<TicketFilters>;
}

const initialState: TicketState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 10,
  },
};

// Async thunks
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (filters: Partial<TicketFilters> = {}) => {
    const response = await ticketApi.getTickets(filters);
    return response;
  }
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (id: string) => {
    const response = await ticketApi.getTicketById(id);
    return response;
  }
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (ticketData: CreateTicketDto) => {
    const response = await ticketApi.createTicket(ticketData);
    return response;
  }
);

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ id, ticketData }: { id: string; ticketData: UpdateTicketDto }) => {
    const response = await ticketApi.updateTicket(id, ticketData);
    return response;
  }
);

export const deleteTicket = createAsyncThunk(
  'tickets/deleteTicket',
  async (id: string) => {
    await ticketApi.deleteTicket(id);
    return id;
  }
);

export const assignTicket = createAsyncThunk(
  'tickets/assignTicket',
  async ({ ticketId, agentId }: { ticketId: string; agentId: string }) => {
    const response = await ticketApi.assignTicket(ticketId, agentId);
    return response;
  }
);

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TicketFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    // Real-time updates
    addTicketRealtime: (state, action: PayloadAction<Ticket>) => {
      state.tickets.unshift(action.payload);
      state.pagination.totalCount += 1;
    },
    updateTicketRealtime: (state, action: PayloadAction<Ticket>) => {
      const index = state.tickets.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
      if (state.currentTicket?.id === action.payload.id) {
        state.currentTicket = action.payload;
      }
    },
    removeTicketRealtime: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter(t => t.id !== action.payload);
      state.pagination.totalCount -= 1;
      if (state.currentTicket?.id === action.payload) {
        state.currentTicket = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<PaginatedResponse<Ticket>>) => {
        state.loading = false;
        state.tickets = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tickets';
      })
      
      // Fetch ticket by ID
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.loading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ticket';
      })
      
      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.loading = false;
        // Don't add to list here - will be handled by real-time update
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create ticket';
      })
      
      // Update ticket
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.loading = false;
        // Will be handled by real-time update
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update ticket';
      })
      
      // Delete ticket
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        // Will be handled by real-time update
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete ticket';
      })
      
      // Assign ticket
      .addCase(assignTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.loading = false;
        // Will be handled by real-time update
      })
      .addCase(assignTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to assign ticket';
      });
  },
});

export const {
  setFilters,
  clearError,
  clearCurrentTicket,
  addTicketRealtime,
  updateTicketRealtime,
  removeTicketRealtime,
} = ticketSlice.actions;

export default ticketSlice.reducer;
