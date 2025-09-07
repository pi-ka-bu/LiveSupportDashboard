import { TicketStatus, TicketPriority } from '../types';

export const TICKET_STATUS_COLORS = {
  [TicketStatus.Open]: '#f57c00',
  [TicketStatus.InProgress]: '#1976d2',
  [TicketStatus.Resolved]: '#388e3c',
};

export const TICKET_PRIORITY_COLORS = {
  [TicketPriority.Low]: '#4caf50',
  [TicketPriority.Medium]: '#ff9800',
  [TicketPriority.High]: '#f44336',
  [TicketPriority.Critical]: '#9c27b0',
};

export const TICKET_STATUS_LABELS = {
  [TicketStatus.Open]: 'Open',
  [TicketStatus.InProgress]: 'In Progress',
  [TicketStatus.Resolved]: 'Resolved',
};

export const TICKET_PRIORITY_LABELS = {
  [TicketPriority.Low]: 'Low',
  [TicketPriority.Medium]: 'Medium',
  [TicketPriority.High]: 'High',
  [TicketPriority.Critical]: 'Critical',
};

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export const API_ENDPOINTS = {
  TICKETS: '/tickets',
  AGENTS: '/agents',
} as const;
