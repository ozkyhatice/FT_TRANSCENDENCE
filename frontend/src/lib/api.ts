// Re-export all API functions from organized modules
export * from './auth-api';
export * from './friends-api';
export * from './messages-api';

// Re-export specific functions for backward compatibility
export { getToken, setToken, clearToken, loginApi, registerApi, getMe, apiFetch } from './auth-api';
export { getFriends, sendFriendRequest, getFriendRequests, acceptOrRejectFriendRequest, deleteFriendRequest, getUserByUsername, getUserById } from './friends-api';
export { sendMessage, getMessages } from './messages-api';