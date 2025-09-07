import axios from 'axios';
import { Ticket, Agent, CreateTicketDto, UpdateTicketDto, CreateAgentDto, PaginatedResponse, TicketFilters } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Ticket API functions
export const ticketApi = {
  getTickets: async (filters: Partial<TicketFilters> = {}): Promise<PaginatedResponse<Ticket>> => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignedAgentId) params.append('assignedAgentId', filters.assignedAgentId);
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/tickets?${params.toString()}`);
    return response.data;
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  createTicket: async (ticket: CreateTicketDto): Promise<Ticket> => {
    const response = await apiClient.post('/tickets', ticket);
    return response.data;
  },

  updateTicket: async (id: string, ticket: UpdateTicketDto): Promise<Ticket> => {
    const response = await apiClient.put(`/tickets/${id}`, ticket);
    return response.data;
  },

  deleteTicket: async (id: string): Promise<void> => {
    await apiClient.delete(`/tickets/${id}`);
  },

  assignTicket: async (ticketId: string, agentId: string): Promise<Ticket> => {
    const response = await apiClient.put(`/tickets/${ticketId}/assign`, { agentId });
    return response.data;
  },
};

// Agent API functions
export const agentApi = {
  getAgents: async (isActive?: boolean): Promise<Agent[]> => {
    const params = isActive !== undefined ? `?isActive=${isActive}` : '';
    const response = await apiClient.get(`/agents${params}`);
    return response.data;
  },

  getAgentById: async (id: string): Promise<Agent> => {
    const response = await apiClient.get(`/agents/${id}`);
    return response.data;
  },

  createAgent: async (agent: CreateAgentDto): Promise<Agent> => {
    const response = await apiClient.post('/agents', agent);
    return response.data;
  },

  updateAgent: async (id: string, agent: CreateAgentDto): Promise<Agent> => {
    const response = await apiClient.put(`/agents/${id}`, agent);
    return response.data;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await apiClient.delete(`/agents/${id}`);
  },

  toggleAgentStatus: async (id: string): Promise<void> => {
    await apiClient.put(`/agents/${id}/toggle-status`);
  },
};
