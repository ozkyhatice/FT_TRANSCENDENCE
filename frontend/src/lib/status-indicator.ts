import { userStatusService } from './user-status.service';

// Simple status indicator that shows online/offline
export function createStatusIndicator(userId: number, size: 'small' | 'medium' = 'small'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'status-indicator';
  
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4'
  };
  
  function updateStatus() {
    const isOnline = userStatusService.isOnline(userId);
    const colorClass = isOnline ? 'bg-green-500' : 'bg-gray-400';
    
    console.log(`🔄 Status indicator updated for user ${userId}: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    
    container.innerHTML = `<div class="${sizeClasses[size]} ${colorClass} rounded-full border-2 border-white shadow-sm"></div>`;
  }
  
  // Update immediately
  updateStatus();
  
  // Listen for status changes
  const callback = (callbackUserId: number) => {
    if (callbackUserId === userId) {
      updateStatus();
    }
  };
  
  userStatusService.addCallback(callback);
  
  // Cleanup function
  (container as any).cleanup = () => {
    userStatusService.removeCallback(callback);
  };
  
  return container;
}

// Simple status text that shows "Online" or "Offline"
export function createStatusText(userId: number): HTMLElement {
  const span = document.createElement('span');
  span.className = 'status-text text-sm';
  
  function updateStatus() {
    const isOnline = userStatusService.isOnline(userId);
    span.textContent = isOnline ? 'Online' : 'Offline';
    span.className = `status-text text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`;
  }
  
  // Update immediately
  updateStatus();
  
  // Listen for status changes
  const callback = (callbackUserId: number) => {
    if (callbackUserId === userId) {
      updateStatus();
    }
  };
  
  userStatusService.addCallback(callback);
  
  // Cleanup function
  (span as any).cleanup = () => {
    userStatusService.removeCallback(callback);
  };
  
  return span;
}

// Combined status indicator with dot and text
export function createStatusBadge(userId: number): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex items-center gap-1';
  
  function updateStatus() {
    const isOnline = userStatusService.isOnline(userId);
    const dotColor = isOnline ? 'bg-green-500' : 'bg-gray-400';
    const textColor = isOnline ? 'text-green-600' : 'text-gray-500';
    const statusText = isOnline ? 'Online' : 'Offline';
    
    container.innerHTML = `
      <div class="w-2 h-2 ${dotColor} rounded-full"></div>
      <span class="text-sm ${textColor}">${statusText}</span>
    `;
  }
  
  // Update immediately
  updateStatus();
  
  // Listen for status changes
  const callback = (callbackUserId: number) => {
    if (callbackUserId === userId) {
      updateStatus();
    }
  };
  
  userStatusService.addCallback(callback);
  
  // Cleanup function
  (container as any).cleanup = () => {
    userStatusService.removeCallback(callback);
  };
  
  return container;
}
