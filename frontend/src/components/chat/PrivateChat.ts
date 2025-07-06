import { getWebSocketService } from '../../lib/websocket.service';
import { chatStore } from '../../lib/chat.service';
import { getMe } from '../../lib/api';
import { createStatusBadge } from '../../lib/status-indicator';
import type { ChatMessage, MessageHandler } from '../../lib/websocket.service';

interface CurrentUser {
  id: number;
  username: string;
}

export function PrivateChat(selectedFriend?: string, selectedFriendId?: number, onClose?: () => void): HTMLElement {
  let currentUser: CurrentUser | null = null;
  let friendId: number | null = selectedFriendId || null;
  let messageHandler: MessageHandler | null = null;
  
  // Get WebSocket service instance
  const webSocketService = getWebSocketService();
  
  if (!webSocketService) {
    console.error('WebSocket service not available');
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = '<div class="text-red-500 p-4">WebSocket service not available</div>';
    return errorDiv;
  }

  // Function to update friend status in the header
  function updateFriendStatus() {
    const statusElement = modal.querySelector('#friend-status') as HTMLElement;
    if (statusElement && friendId) {
      // Clear existing content and add new status badge
      statusElement.innerHTML = '';
      const statusBadge = createStatusBadge(friendId);
      statusElement.appendChild(statusBadge);
    }
  }

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden border border-gray-200';
  
  // Initialize current user and WebSocket
  initializeChat();

  async function initializeChat() {
    try {
      // Get current user info
      const userResponse = await getMe();
      currentUser = {
        id: userResponse.id || userResponse.userId,
        username: userResponse.username
      };

      // If a friend is selected, get their ID
      if (selectedFriend) {
        if (selectedFriendId) {
          // Friend ID already provided
          friendId = selectedFriendId;
          chatStore.createOrUpdateConversation(friendId, selectedFriend);
        } else {
          try {
            // Try to find friend in friends list or get by username
            const friends = await import('../../lib/api').then(api => api.getFriends());
            const friend = friends.find((f: any) => f.username === selectedFriend);
            
            if (friend) {
              friendId = friend.id;
              // Create or update conversation
              if (friendId) {
                chatStore.createOrUpdateConversation(friendId, selectedFriend);
              }
            }
          } catch (error) {
            console.error('Error getting friend info:', error);
          }
        }
      }

      // Set up WebSocket message handler
      messageHandler = {
        onMessage: (message: ChatMessage) => {
          if (currentUser) {
            // Handle different message types
            if ((message as any).type === 'message_sent') {
              // This is a confirmation for our sent message - don't add to chat
              console.log('Message sent confirmation:', message);
              return;
            }
            
            // This is a regular incoming message
            // Ensure conversation exists for incoming messages
            if (message.from !== currentUser.id && friendId) {
              chatStore.createOrUpdateConversation(message.from, selectedFriend || `User ${message.from}`);
            }
            
            chatStore.addMessage(message, currentUser.id);
            updateChatDisplay();
          }
        },
        onConnect: () => {
          console.log('Chat WebSocket connected');
          updateConnectionStatus(true);
        },
        onDisconnect: () => {
          console.log('Chat WebSocket disconnected');
          updateConnectionStatus(false);
        },
        onError: (error) => {
          console.error('Chat WebSocket error:', error);
          updateConnectionStatus(false);
        }
      };

      webSocketService?.addHandler(messageHandler);
      
      // Initial render
      renderChat();
      updateChatDisplay();

    } catch (error) {
      console.error('Error initializing chat:', error);
      renderErrorState();
    }
  }

  function renderChat() {
    if (!selectedFriend || !friendId) {
      renderEmptyState();
      return;
    }

    modal.innerHTML = `
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(selectedFriend)}" 
               class="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="${selectedFriend}" />
          <div>
            <h3 class="font-semibold text-gray-800">${selectedFriend}</h3>
            <p class="text-sm flex items-center gap-1" id="friend-status">
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors" title="Close Chat" id="close-chat-btn">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-3" id="messages-container">
        <div class="text-center text-xs text-gray-400 py-2">
          Start of conversation with ${selectedFriend}
        </div>
      </div>
      
      <div class="p-4 border-t border-gray-200 bg-gray-50/50">
        <div class="flex gap-2">
          <input type="text" 
                 placeholder="Type a message to ${selectedFriend}..." 
                 class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                 id="message-input" />
          <button class="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  id="send-button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    setupEventListeners();
  }

  function renderEmptyState() {
    modal.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center p-6">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.681L3 21l2.681-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Private Messages</h3>
        <p class="text-sm text-gray-500 mb-4">Select a friend to start chatting</p>
        <button class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors" id="close-empty-btn">
          Close
        </button>
      </div>
    `;

    const closeBtn = modal.querySelector('#close-empty-btn');
    if (closeBtn && onClose) {
      closeBtn.addEventListener('click', onClose);
    }
  }

  function renderErrorState() {
    modal.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center p-6">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Connection Error</h3>
        <p class="text-sm text-gray-500 mb-4">Unable to connect to chat service</p>
        <button class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors" id="close-error-btn">
          Close
        </button>
      </div>
    `;

    const closeBtn = modal.querySelector('#close-error-btn');
    if (closeBtn && onClose) {
      closeBtn.addEventListener('click', onClose);
    }
  }

  function setupEventListeners() {
    // Close button
    const closeBtn = modal.querySelector('#close-chat-btn');
    if (closeBtn && onClose) {
      closeBtn.addEventListener('click', onClose);
    }

    // Initial status update
    updateFriendStatus();

    // Message input and send button
    const messageInput = modal.querySelector('#message-input') as HTMLInputElement;
    const sendButton = modal.querySelector('#send-button') as HTMLButtonElement;
    
    if (messageInput && sendButton) {
      // Send message function
      const sendMessage = () => {
        const content = messageInput.value.trim();
        if (!content || !friendId || !webSocketService?.isConnected()) {
          return;
        }

        // Show loading state
        sendButton.disabled = true;
        sendButton.innerHTML = `
          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        `;

        if (webSocketService?.sendMessage(friendId, content)) {
          messageInput.value = '';
          
          // Add temporary message for instant feedback
          if (currentUser) {
            const tempMessage: ChatMessage = {
              from: currentUser.id,
              to: friendId,
              content,
              createdAt: new Date().toISOString(),
              status: 'sent'
            };
            
            chatStore.addMessage(tempMessage, currentUser.id);
            updateChatDisplay();
          }
          
          // Reset button after short delay
          setTimeout(() => {
            sendButton.disabled = false;
            sendButton.innerHTML = `
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            `;
          }, 500);
        } else {
          // Show connection error and try to reconnect
          console.log('❌ Failed to send message - WebSocket not connected');
          
          // Reset button immediately on error
          sendButton.disabled = false;
          sendButton.innerHTML = `
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          `;
          
          // Show error message to user
          const errorDiv = document.createElement('div');
          errorDiv.className = 'bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm mt-2';
          errorDiv.textContent = 'Connection lost. Reconnecting...';
          
          const chatContainer = modal.querySelector('#chat-messages');
          if (chatContainer) {
            chatContainer.appendChild(errorDiv);
            // Remove error message after 3 seconds
            setTimeout(() => {
              if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
              }
            }, 3000);
          }
          
          // Try to force reconnect
          // WebSocket will handle reconnection automatically
          updateConnectionStatus(false);
        }
      };

      // Send button click
      sendButton.addEventListener('click', sendMessage);

      // Enter key support
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });

      // Update send button state based on connection
      updateSendButtonState();
    }
  }

  function updateChatDisplay() {
    if (!friendId || !currentUser) return;

    const conversation = chatStore.getConversation(friendId);
    const messagesContainer = modal.querySelector('#messages-container');
    
    if (!messagesContainer || !conversation) return;

    // Mark conversation as read when viewing
    chatStore.markConversationAsRead(friendId);

    // Render messages
    const messagesHtml = conversation.messages.map(message => {
      const isFromMe = message.from === currentUser!.id;
      const time = new Date(message.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return `
        <div class="flex ${isFromMe ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[70%] ${isFromMe 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-800'
          } rounded-2xl px-4 py-2 shadow-sm">
            <p class="text-sm">${escapeHtml(message.content)}</p>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-xs ${isFromMe ? 'text-blue-100' : 'text-gray-500'}">${time}</span>
              ${isFromMe && message.status ? `
                <span class="text-xs ${isFromMe ? 'text-blue-100' : 'text-gray-500'}">
                  ${message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : ''}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    messagesContainer.innerHTML = `
      <div class="text-center text-xs text-gray-400 py-2">
        Start of conversation with ${selectedFriend}
      </div>
      ${messagesHtml}
    `;

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function updateConnectionStatus(_isConnected: boolean) {
    // Update friend status instead of connection status
    updateFriendStatus();
    updateSendButtonState();
  }

  function updateSendButtonState() {
    const sendButton = modal.querySelector('#send-button') as HTMLButtonElement;
    if (sendButton) {
      sendButton.disabled = !webSocketService?.isConnected();
    }
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Cleanup function
  function cleanup() {
    if (messageHandler) {
      webSocketService?.removeHandler(messageHandler);
      messageHandler = null;
    }
  }

  // Close modal when clicking overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && onClose) {
      cleanup();
      onClose();
    }
  });
  
  // Close modal with ESC key
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      cleanup();
      onClose();
    }
  };
  
  document.addEventListener('keydown', handleKeyPress);
  
  // Clean up event listener when modal is removed
  overlay.addEventListener('remove', () => {
    cleanup();
    document.removeEventListener('keydown', handleKeyPress);
  });
  
  // Prevent modal from closing when clicking inside
  modal.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Update connection status initially
  updateConnectionStatus(webSocketService?.isConnected() ?? false);

  overlay.appendChild(modal);
  return overlay;
}