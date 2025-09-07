import * as signalR from '@microsoft/signalr';
import { Ticket } from '../types';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: { [event: string]: ((data: any) => void)[] } = {};

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const hubUrl = process.env.REACT_APP_HUB_URL || 'https://localhost:7001/ticketHub';
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    // Set up event handlers
    this.connection.on('TicketCreated', (ticket: Ticket) => {
      this.notifyListeners('TicketCreated', ticket);
    });

    this.connection.on('TicketUpdated', (ticket: Ticket) => {
      this.notifyListeners('TicketUpdated', ticket);
    });

    this.connection.on('TicketDeleted', (ticketId: string) => {
      this.notifyListeners('TicketDeleted', ticketId);
    });

    this.connection.on('TicketAssigned', (ticket: Ticket) => {
      this.notifyListeners('TicketAssigned', ticket);
    });

    try {
      await this.connection.start();
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('Error connecting to SignalR:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('SignalR disconnected');
    }
  }

  onTicketCreated(callback: (ticket: Ticket) => void): () => void {
    return this.addEventListener('TicketCreated', callback);
  }

  onTicketUpdated(callback: (ticket: Ticket) => void): () => void {
    return this.addEventListener('TicketUpdated', callback);
  }

  onTicketDeleted(callback: (ticketId: string) => void): () => void {
    return this.addEventListener('TicketDeleted', callback);
  }

  onTicketAssigned(callback: (ticket: Ticket) => void): () => void {
    return this.addEventListener('TicketAssigned', callback);
  }

  private addEventListener(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners[event]?.indexOf(callback);
      if (index !== undefined && index > -1) {
        this.listeners[event].splice(index, 1);
      }
    };
  }

  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }
}

export const signalRService = new SignalRService();
