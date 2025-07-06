import { ProfileCard } from './profile/ProfileCard';
import { GameArea } from './game/GameArea';
import { Tournament } from './game/Tournament';
import { GeneralChat } from './chat/GeneralChat';
import { PrivateChat } from './chat/PrivateChat';
import { initWebSocketService } from '../lib/websocket.service';
import { chatStore } from '../lib/chat.service';
import { getMe } from '../lib/api';
import type { MessageHandler } from '../lib/websocket.service';

export function MainLayout(user: { username: string; id?: number }, onLogout?: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden relative';

  // Clear any previous chat data for safety (in case logout didn't work properly)
  chatStore.clear();

  // Initialize WebSocket service for this session
  const webSocketService = initWebSocketService();
  
  console.log('🚀 WebSocket service initialized for MainLayout');

  // Selected friend state
  let selectedFriend: string | null = null;
  let selectedFriendId: number | null = null;
  let privateChatModal: HTMLElement | null = null;
  let messageHandler: MessageHandler | null = null;

  // Initialize WebSocket message handling
  const initializeMessageHandling = async () => {
    try {
      // Get current user info for message filtering
      const currentUserResponse = await getMe();
      const currentUserId = currentUserResponse.id || currentUserResponse.userId;

      messageHandler = {
        onMessage: async (message) => {
          // Don't show notification for my own messages or confirmations
          if (message.from === currentUserId || (message as any).type === 'message_sent') {
            return;
          }
          
          // Get friend name and ensure conversation exists
          const friendName = await getFriendNameById(message.from);
          
          // Ensure conversation exists in chatStore
          chatStore.createOrUpdateConversation(message.from, friendName);
          
          // Add message to store
          chatStore.addMessage(message, currentUserId);
          
          // Show notification if chat is not open for this user
          if (!privateChatModal || selectedFriend !== friendName) {
            await showNotification(message);
          }
        },
        onConnect: () => {
          console.log('💬 Chat connected in MainLayout');
        },
        onDisconnect: () => {
          console.log('💬 Chat disconnected in MainLayout');
        }
      };

      webSocketService.addHandler(messageHandler);
    } catch (error) {
      console.error('Error initializing message handling:', error);
    }
  };

  // Get friend name by ID (you might need to implement this based on your friends list)
  const getFriendNameById = async (friendId: number): Promise<string> => {
    try {
      // First try to get from friends list in ProfileCard
      const { getFriends } = await import('../lib/api');
      const friends = await getFriends();
      const friend = friends.find((f: any) => f.id === friendId);
      if (friend) {
        return friend.username;
      }
      
      // If not in friends list, try getUserById
      const { getUserById } = await import('../lib/api');
      const user = await getUserById(friendId);
      console.log('getUserById response:', user); // Debug log
      return user.username || `Friend ${friendId}`;
    } catch (error) {
      console.error('Error getting friend name:', error);
      return `Friend ${friendId}`;
    }
  };

  // Show notification for new messages
  const showNotification = async (message: any) => {
    const friendName = await getFriendNameById(message.from);
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-in-right';
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(friendName)}" 
             class="w-10 h-10 rounded-full border border-gray-200" />
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 text-sm">${friendName}</p>
          <p class="text-gray-600 text-sm truncate">${message.content}</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600 text-xl leading-none" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Click to open chat
    notification.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).tagName !== 'BUTTON') {
        selectedFriend = friendName;
        selectedFriendId = message.from;
        openPrivateChat();
        notification.remove();
      }
    });

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  };

  // Cleanup function
  const cleanup = () => {
    if (messageHandler) {
      webSocketService.removeHandler(messageHandler);
    }
  };

  // Initialize message handling
  initializeMessageHandling();

  // Left sidebar - Profile and Friends
  const leftSidebar = document.createElement('div');
  leftSidebar.className = 'w-80 flex flex-col gap-4 p-4 bg-white/50 backdrop-blur-sm border-r border-gray-200';

  // Friend selection callback function
  const handleFriendSelect = (friend: any) => {
    selectedFriend = friend.username;
    selectedFriendId = friend.id;
    openPrivateChat();
  };

  // Open private chat modal
  const openPrivateChat = () => {
    // Close existing modal if open
    closePrivateChat();
    
    if (selectedFriend && selectedFriendId) {
      // Create new private chat modal with both username and ID
      privateChatModal = PrivateChat(selectedFriend, selectedFriendId, closePrivateChat);
      document.body.appendChild(privateChatModal);
    }
  };

  // Close private chat modal
  const closePrivateChat = () => {
    if (privateChatModal) {
      privateChatModal.remove();
      privateChatModal = null;
    }
  };

  // Cleanup when component unmounts
  const handleUnload = () => {
    cleanup();
  };

  window.addEventListener('beforeunload', handleUnload);

  // Profile card with friend selection callback
  const profile = ProfileCard(user.username, onLogout, handleFriendSelect);
  leftSidebar.appendChild(profile);

  // Main content area - Full screen game
  const mainContent = document.createElement('div');
  mainContent.className = 'flex-1 flex flex-col p-6';

  const game = GameArea();
  game.className = 'bg-white/80 rounded-2xl shadow-lg flex items-center justify-center flex-1 border border-gray-200 backdrop-blur-sm';
  mainContent.appendChild(game);

  // Right sidebar - Tournament and General Chat
  const rightSidebar = document.createElement('div');
  rightSidebar.className = 'w-80 flex flex-col gap-4 p-4 bg-white/50 backdrop-blur-sm border-l border-gray-200';

  // Tournament
  const tournament = Tournament();
  tournament.className = 'bg-white/70 rounded-xl shadow-sm p-4 min-h-[250px] border border-gray-200 flex flex-col';
  rightSidebar.appendChild(tournament);

  // General chat
  const generalChat = GeneralChat();
  generalChat.className = 'bg-white/70 rounded-xl shadow-sm p-4 min-h-[200px] border border-gray-200 flex flex-col flex-1';
  rightSidebar.appendChild(generalChat);

  // Add layout structure
  container.appendChild(leftSidebar);
  container.appendChild(mainContent);
  container.appendChild(rightSidebar);

  return container;
}