export enum TicketStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  Resolved = 'Resolved'
}

export enum TicketPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  assignedTicketsCount: number;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  priority: TicketPriority;
  assignedAgentId?: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAgentId?: string;
}

export interface CreateAgentDto {
  name: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAgentId?: string;
  searchTerm?: string;
  page: number;
  limit: number;
}
