// Simple interface for user status
export interface UserStatus {
  userId: number;
  username: string;
  isOnline: boolean;
}

// Simple callback for status changes
export type StatusChangeCallback = (userId: number, isOnline: boolean) => void;

class UserStatusService {
  private onlineUsers = new Set<number>();
  private usernames = new Map<number, string>();
  private callbacks: StatusChangeCallback[] = [];

  // Check if user is online
  isOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  // Get username for user
  getUsername(userId: number): string {
    return this.usernames.get(userId) || `User${userId}`;
  }

  // Set user online
  setOnline(userId: number, username: string) {
    const wasOnline = this.onlineUsers.has(userId);
    this.onlineUsers.add(userId);
    this.usernames.set(userId, username);
    
    console.log(`👤 User ${username} (${userId}) is now ONLINE`);
    
    if (!wasOnline) {
      this.notifyCallbacks(userId, true);
    }
  }

  // Set user offline
  setOffline(userId: number) {
    const wasOnline = this.onlineUsers.has(userId);
    const username = this.getUsername(userId);
    this.onlineUsers.delete(userId);
    
    console.log(`👤 User ${username} (${userId}) is now OFFLINE`);
    
    if (wasOnline) {
      this.notifyCallbacks(userId, false);
    }
  }

  // Update all online users from server
  updateOnlineUsers(users: UserStatus[]) {
    // Clear and rebuild
    this.onlineUsers.clear();
    this.usernames.clear();
    
    users.forEach(user => {
      if (user.isOnline) {
        this.onlineUsers.add(user.userId);
      }
      this.usernames.set(user.userId, user.username);
    });

    // Notify all callbacks for all users
    users.forEach(user => {
      this.notifyCallbacks(user.userId, user.isOnline);
    });
  }

  // Add callback for status changes
  addCallback(callback: StatusChangeCallback) {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
  }

  // Remove callback
  removeCallback(callback: StatusChangeCallback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  // Clear all data
  clear() {
    this.onlineUsers.clear();
    this.usernames.clear();
    this.callbacks = [];
  }

  // Get all online users
  getOnlineUsers(): UserStatus[] {
    return Array.from(this.onlineUsers).map(userId => ({
      userId,
      username: this.getUsername(userId),
      isOnline: true
    }));
  }

  private notifyCallbacks(userId: number, isOnline: boolean) {
    this.callbacks.forEach(callback => {
      try {
        callback(userId, isOnline);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }
}

// Global instance
export const userStatusService = new UserStatusService();
