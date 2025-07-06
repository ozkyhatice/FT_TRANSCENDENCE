import { getToken } from './api';
import { chatStore } from './chat.service';
import { userStatusService } from './user-status.service';

export interface ChatMessage {
  from: number;
  to?: number;
  content: string;
  createdAt: string;
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'error';
}

export interface MessageHandler {
  onMessage: (message: ChatMessage) => void;
  onError?: (error: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: MessageHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const token = getToken();
    
    if (!token) {
      console.error('No token available for WebSocket connection');
      this.isConnecting = false;
      return;
    }

    try {
      this.ws = new WebSocket('ws://localhost:3000/ws', token);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.handlers.forEach(handler => handler.onConnect?.());
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          
          if (data.type === 'user_status') {
            // Single user status update
            console.log(`📡 Received user status update:`, data);
            if (data.isOnline) {
              userStatusService.setOnline(data.userId, data.username);
            } else {
              userStatusService.setOffline(data.userId);
            }
          } else if (data.type === 'user_list') {
            // Full user list update
            console.log(`📋 Received user list update:`, data);
            userStatusService.updateOnlineUsers(data.users);
          } else {
            // Regular chat message
            const message: ChatMessage = data;
            this.handlers.forEach(handler => {
              handler.onMessage(message);
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected', event.code, event.reason);
        this.isConnecting = false;
        this.handlers.forEach(handler => handler.onDisconnect?.());
        
        // Auto reconnect if not manual disconnect
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.handlers.forEach(handler => handler.onError?.(error));
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  public sendMessage(receiverId: number, content: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket is not connected');
      if (!this.isConnecting) {
        this.connect();
      }
      return false;
    }

    try {
      const message = { receiverId, content };
      this.ws.send(JSON.stringify(message));
      console.log('📤 Message sent:', message);
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }

  public addHandler(handler: MessageHandler) {
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler);
    }
  }

  public removeHandler(handler: MessageHandler) {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.handlers = [];
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  public logout() {
    console.log('🔒 Logging out - clearing all data');
    this.disconnect();
    chatStore.clear();
    userStatusService.clear();
  }
}

// Global instance that will be managed by the app
export let webSocketService: WebSocketService | null = null;

// Helper functions to manage the WebSocket service
export function initWebSocketService(): WebSocketService {
  if (webSocketService) {
    webSocketService.logout();
  }
  webSocketService = new WebSocketService();
  return webSocketService;
}

export function getWebSocketService(): WebSocketService | null {
  return webSocketService;
}

export function destroyWebSocketService(): void {
  if (webSocketService) {
    webSocketService.logout();
    webSocketService = null;
  }
  
  // Also clear chat store and user status as a safety measure
  chatStore.clear();
  userStatusService.clear();
}
