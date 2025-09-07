import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Agent, CreateAgentDto } from '../types';
import { agentApi } from '../services/api';

interface AgentState {
  agents: Agent[];
  currentAgent: Agent | null;
  loading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  agents: [],
  currentAgent: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async (isActive?: boolean) => {
    const response = await agentApi.getAgents(isActive);
    return response;
  }
);

export const fetchAgentById = createAsyncThunk(
  'agents/fetchAgentById',
  async (id: string) => {
    const response = await agentApi.getAgentById(id);
    return response;
  }
);

export const createAgent = createAsyncThunk(
  'agents/createAgent',
  async (agentData: CreateAgentDto) => {
    const response = await agentApi.createAgent(agentData);
    return response;
  }
);

export const updateAgent = createAsyncThunk(
  'agents/updateAgent',
  async ({ id, agentData }: { id: string; agentData: CreateAgentDto }) => {
    const response = await agentApi.updateAgent(id, agentData);
    return response;
  }
);

export const deleteAgent = createAsyncThunk(
  'agents/deleteAgent',
  async (id: string) => {
    await agentApi.deleteAgent(id);
    return id;
  }
);

export const toggleAgentStatus = createAsyncThunk(
  'agents/toggleAgentStatus',
  async (id: string) => {
    await agentApi.toggleAgentStatus(id);
    return id;
  }
);

const agentSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAgent: (state) => {
      state.currentAgent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch agents
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action: PayloadAction<Agent[]>) => {
        state.loading = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch agents';
      })
      
      // Fetch agent by ID
      .addCase(fetchAgentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentById.fulfilled, (state, action: PayloadAction<Agent>) => {
        state.loading = false;
        state.currentAgent = action.payload;
      })
      .addCase(fetchAgentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch agent';
      })
      
      // Create agent
      .addCase(createAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAgent.fulfilled, (state, action: PayloadAction<Agent>) => {
        state.loading = false;
        state.agents.push(action.payload);
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create agent';
      })
      
      // Update agent
      .addCase(updateAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgent.fulfilled, (state, action: PayloadAction<Agent>) => {
        state.loading = false;
        const index = state.agents.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.agents[index] = action.payload;
        }
        if (state.currentAgent?.id === action.payload.id) {
          state.currentAgent = action.payload;
        }
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update agent';
      })
      
      // Delete agent
      .addCase(deleteAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAgent.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.agents = state.agents.filter(a => a.id !== action.payload);
        if (state.currentAgent?.id === action.payload) {
          state.currentAgent = null;
        }
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete agent';
      })
      
      // Toggle agent status
      .addCase(toggleAgentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleAgentStatus.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        const agent = state.agents.find(a => a.id === action.payload);
        if (agent) {
          agent.isActive = !agent.isActive;
        }
      })
      .addCase(toggleAgentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle agent status';
      });
  },
});

export const { clearError, clearCurrentAgent } = agentSlice.actions;

export default agentSlice.reducer;
