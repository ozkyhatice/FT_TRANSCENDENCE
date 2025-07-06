import type { ChatMessage } from './websocket.service';

export interface ChatConversation {
  friendId: number;
  friendName: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export class ChatStore {
  private conversations: Map<number, ChatConversation> = new Map();
  private listeners: Array<() => void> = [];

  public getConversation(friendId: number): ChatConversation | null {
    return this.conversations.get(friendId) || null;
  }

  public getAllConversations(): ChatConversation[] {
    return Array.from(this.conversations.values()).sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || '0';
      const bTime = b.lastMessage?.createdAt || '0';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }

  public createOrUpdateConversation(friendId: number, friendName: string): ChatConversation {
    let conversation = this.conversations.get(friendId);
    
    if (!conversation) {
      conversation = {
        friendId,
        friendName,
        messages: [],
        unreadCount: 0
      };
      this.conversations.set(friendId, conversation);
      console.log(`Created new conversation with ${friendName} (ID: ${friendId})`);
    } else {
      // Update name if provided and different
      if (friendName && conversation.friendName !== friendName) {
        conversation.friendName = friendName;
        console.log(`Updated conversation name to ${friendName} (ID: ${friendId})`);
      }
    }
    
    return conversation;
  }

  public addMessage(message: ChatMessage, currentUserId: number) {
    let friendId: number;
    let isIncoming: boolean;

    if (message.from === currentUserId) {
      // Sent message
      friendId = message.to!;
      isIncoming = false;
    } else {
      // Received message
      friendId = message.from;
      isIncoming = true;
    }

    let conversation = this.conversations.get(friendId);
    if (!conversation) {
      // Create conversation with basic info (name will be updated later)
      conversation = this.createOrUpdateConversation(friendId, `User ${friendId}`);
    }

    // Check for duplicate messages (same content, from same user, within 1 second)
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage && 
        lastMessage.from === message.from && 
        lastMessage.content === message.content &&
        Math.abs(new Date(lastMessage.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000) {
      console.log('Duplicate message detected, skipping');
      return;
    }

    // Add message to conversation
    conversation.messages.push(message);
    conversation.lastMessage = message;
    
    // Update unread count for incoming messages
    if (isIncoming && !message.isRead) {
      conversation.unreadCount++;
    }

    this.notifyListeners();
  }

  public markConversationAsRead(friendId: number) {
    const conversation = this.conversations.get(friendId);
    if (conversation) {
      conversation.unreadCount = 0;
      // Mark all messages as read
      conversation.messages.forEach(msg => {
        if (msg.from === friendId) {
          msg.isRead = true;
        }
      });
      this.notifyListeners();
    }
  }

  public getUnreadCount(): number {
    return Array.from(this.conversations.values())
      .reduce((total, conv) => total + conv.unreadCount, 0);
  }

  public addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: () => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  public clear() {
    this.conversations.clear();
    this.notifyListeners();
  }
}

export const chatStore = new ChatStore();
