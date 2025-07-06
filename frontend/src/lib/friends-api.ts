import { apiFetch } from './auth-api';

export async function getFriends() {
  const response = await apiFetch('/friends');
  return response.friendsList || [];
}

export async function sendFriendRequest(targetId: number) {
  try {
    const response = await apiFetch(`/friends/${targetId}`, {
      method: 'POST'
    });
    return response;
  } catch (error: any) {
    if (error.status === 400) {
      throw new Error(error.message || 'Bad request');
    }
    if (error.status === 404) {
      throw new Error('User not found');
    }
    if (error.status === 409) {
      throw new Error('Friend request already sent or you are already friends');
    }
    throw error;
  }
}

export async function getFriendRequests() {
  try {
    const response = await apiFetch('/friends/requests');
    return response.incomingRequests || [];
  } catch (error: any) {
    console.error('Error fetching friend requests:', error);
    return [];
  }
}

export async function acceptOrRejectFriendRequest(id: number, action: string) {
  return apiFetch(`/friends/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action })
  });
}

export async function getUserByUsername(username: string) {
  try {
    const response = await apiFetch(`/users/${encodeURIComponent(username)}`);
    if (!response || !response.success || !response.data || !response.data.id) {
      throw new Error('User not found');
    }
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error('User not found');
    }
    throw error;
  }
}

export async function getUserById(userId: number) {
  try {
    const response = await apiFetch(`/users/id/${userId}`);
    console.log('getUserById raw response:', response); // Debug log
    if (!response || !response.success || !response.data || !response.data.id) {
      throw new Error('User not found');
    }
    console.log('getUserById returning:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('getUserById error:', error); // Debug log
    if (error.status === 404) {
      throw new Error('User not found');
    }
    throw error;
  }
}
