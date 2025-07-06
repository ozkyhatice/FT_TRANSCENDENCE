// User types
export interface User {
  id: number;
  username: string;
  email?: string;
}

// Friend types
export interface Friend {
  id: number;
  username: string;
  status: 'online' | 'offline' | 'away';
  friendshipId: number;
}

// Friend request types
export interface FriendRequest {
  id: number;
  requester: User;
  status?: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
}
