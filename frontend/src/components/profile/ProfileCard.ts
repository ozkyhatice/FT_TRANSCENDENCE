import { getFriends, sendFriendRequest, getFriendRequests, acceptOrRejectFriendRequest, getUserByUsername } from '../../lib/friends-api';
import { clearToken } from '../../lib/auth-api';
import { getAvatarUrl } from '../../lib/avatar';
import { createStatusIndicator, createStatusText } from '../../lib/status-indicator';

export function ProfileCard(
  username: string = 'Username',
  onLogout?: () => void,
  onFriendSelect?: (friend: any) => void
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden';

  // State for the current view
  let currentView = 'friends'; // 'friends', 'requests', 'add'

  function renderHeader() {
    return `
      <div class="p-5 bg-gradient-to-br from-slate-50 to-blue-50">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-700">Profile</h2>
          <button id="logout-btn" class="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/>
            </svg>
          </button>
        </div>
        
        <div class="flex items-center gap-3 mb-4">
          <div class="relative">
            <div class="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm border-2 border-white">
              <img src="${getAvatarUrl(username)}" 
                   alt="${username}" class="w-full h-full object-cover" />
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <div class="font-semibold text-slate-800">${username}</div>
            <div class="text-sm text-slate-500">Online</div>
          </div>
        </div>
        
        <div class="bg-white/70 rounded-xl p-3 border border-slate-200/50">
          <div class="grid grid-cols-2 gap-3 text-center">
            <div>
              <div class="text-lg font-semibold text-emerald-600">12</div>
              <div class="text-xs text-slate-500">Wins</div>
            </div>
            <div>
              <div class="text-lg font-semibold text-rose-500">8</div>
              <div class="text-xs text-slate-500">Losses</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderNavigation() {
    return `
      <div class="px-4 py-3 border-b border-slate-100">
        <div class="flex gap-1 bg-slate-50 rounded-lg p-1">
          <button id="nav-friends" class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'friends' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
            Friends
          </button>
          <button id="nav-requests" class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'requests' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
            Requests
          </button>
          <button id="nav-add" class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'add' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
            Add
          </button>
        </div>
      </div>
    `;
  }

  function renderContent() {
    switch (currentView) {
      case 'friends':
        return `
          <div id="friends-content" class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            <div class="text-center text-slate-400 text-sm py-6">Loading friends...</div>
          </div>
        `;
      case 'requests':
        return `
          <div id="requests-content" class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            <div class="text-center text-slate-400 text-sm py-6">Loading requests...</div>
          </div>
        `;
      case 'add':
        return `
          <div id="add-content" class="flex-1 p-4">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-2">Add Friend</label>
                <div class="space-y-3">
                  <input type="text" id="username-input" placeholder="Enter username" 
                         class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all">
                  <button id="send-request-btn" class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Send Request
                  </button>
                </div>
                <div id="add-friend-message" class="mt-2 text-sm hidden"></div>
              </div>
            </div>
          </div>
        `;
      default:
        return '';
    }
  }

  function render() {
    card.innerHTML = renderHeader() + renderNavigation() + renderContent();
    attachEventListeners();
    loadCurrentViewData();
  }

  async function loadFriends() {
    const friendsContent = card.querySelector('#friends-content');
    if (!friendsContent) return;

    try {
      const friends = await getFriends();

      if (friends.length === 0) {
        friendsContent.innerHTML = '<div class="text-center text-slate-400 text-sm py-6">No friends yet</div>';
        return;
      }

      friendsContent.innerHTML = friends.map((friend: any) => `
        <div class="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group friend-item" data-friend-id="${friend.id}">
          <div class="relative">
            <div class="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
              <img src="${getAvatarUrl(friend.username)}" 
                   alt="${friend.username}" class="w-full h-full object-cover" />
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 status-indicator-${friend.id}"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-slate-700 text-sm truncate">${friend.username}</div>
            <div class="text-xs text-slate-400 status-text-${friend.id}"></div>
          </div>
          <div class="flex items-center gap-2">
            <button class="remove-friend-btn text-rose-300 hover:text-rose-500 transition-colors" title="Remove friend" data-friendship-id="${friend.friendshipId}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <span class="text-slate-300 group-hover:text-slate-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </div>
      `).join('');

      // Add status indicators and text for each friend
      friends.forEach((friend: any) => {
        const statusIndicatorContainer = friendsContent.querySelector(`.status-indicator-${friend.id}`);
        const statusTextContainer = friendsContent.querySelector(`.status-text-${friend.id}`);
        
        if (statusIndicatorContainer) {
          const indicator = createStatusIndicator(friend.id, 'small');
          statusIndicatorContainer.appendChild(indicator);
        }
        
        if (statusTextContainer) {
          const statusText = createStatusText(friend.id);
          statusTextContainer.appendChild(statusText);
        }
      });

      // Add click listeners to open chat
      friendsContent.querySelectorAll('[data-friend-id]').forEach(element => {
        element.addEventListener('click', () => {
          const friendId = element.getAttribute('data-friend-id');
          const friend = friends.find((f: any) => f.id.toString() === friendId);
          if (friend && onFriendSelect) {
            onFriendSelect(friend);
          }
        });
      });

      // Remove friend buttons
      friendsContent.querySelectorAll('.remove-friend-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation(); // Prevent triggering parent click (chat open)
          const friendshipId = (btn as HTMLElement).getAttribute('data-friendship-id');
          if (!friendshipId) return;
          if (!confirm('Are you sure you want to remove this friend?')) return;

          try {
            const { deleteFriendRequest } = await import('../../lib/api');
            await deleteFriendRequest(parseInt(friendshipId));
            // Reload friends list
            loadFriends();
          } catch (error) {
            console.error('Error removing friend:', error);
            alert('Failed to remove friend');
          }
        });
      });

    } catch (error) {
      console.error('Error loading friends:', error);
      friendsContent.innerHTML = '<div class="text-center text-rose-500 text-sm py-4">Error loading friends</div>';
    }
  }

  async function loadRequests() {
    const requestsContent = card.querySelector('#requests-content');
    if (!requestsContent) return;

    try {
      const requests = await getFriendRequests();

      if (requests.length === 0) {
        requestsContent.innerHTML = '<div class="text-center text-slate-400 text-sm py-6">No requests</div>';
        return;
      }

      requestsContent.innerHTML = requests.map((request: any) => `
        <div class="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
                <img src="${getAvatarUrl(request.requester.username)}" 
                     alt="${request.requester.username}" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-slate-700 text-sm truncate">${request.requester.username}</div>
                <div class="text-xs text-slate-400">wants to be friends</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="accept-btn w-7 h-7 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-full flex items-center justify-center transition-colors" data-request-id="${request.id}">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
              <button class="reject-btn w-7 h-7 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-full flex items-center justify-center transition-colors" data-request-id="${request.id}">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Add event listeners
      requestsContent.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const requestId = btn.getAttribute('data-request-id');
          if (requestId) {
            try {
              await acceptOrRejectFriendRequest(parseInt(requestId), 'accept');
              loadRequests();
              if (currentView === 'friends') loadFriends(); // Refresh friends list
            } catch (error) {
              console.error('Error accepting friend request:', error);
            }
          }
        });
      });

      requestsContent.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const requestId = btn.getAttribute('data-request-id');
          if (requestId) {
            try {
              await acceptOrRejectFriendRequest(parseInt(requestId), 'reject');
              loadRequests();
            } catch (error) {
              console.error('Error rejecting friend request:', error);
            }
          }
        });
      });

    } catch (error) {
      console.error('Error loading friend requests:', error);
      requestsContent.innerHTML = '<div class="text-center text-rose-500 text-sm py-4">Error loading</div>';
    }
  }

  async function sendFriendRequestByUsername() {
    const usernameInput = card.querySelector('#username-input') as HTMLInputElement;
    const messageDiv = card.querySelector('#add-friend-message') as HTMLElement;
    if (!usernameInput || !messageDiv) return;

    const username = usernameInput.value.trim();
    if (!username) {
      showMessage('Please enter a username', 'error');
      return;
    }

    // Disable button and show loading
    const sendBtn = card.querySelector('#send-request-btn') as HTMLButtonElement;
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
    }

    try {
      const user = await getUserByUsername(username);
      await sendFriendRequest(user.id);
      showMessage('Friend request sent!', 'success');
      usernameInput.value = '';
    } catch (error: any) {
      showMessage(error.message || 'Error sending request', 'error');
    } finally {
      // Re-enable button
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Request';
      }
    }
  }

  function showMessage(text: string, type: 'success' | 'error') {
    const messageDiv = card.querySelector('#add-friend-message') as HTMLElement;
    if (!messageDiv) return;

    messageDiv.textContent = text;
    messageDiv.className = `mt-2 text-sm ${type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`;
    messageDiv.classList.remove('hidden');

    // Auto hide after 3 seconds
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 3000);
  }

  function loadCurrentViewData() {
    switch (currentView) {
      case 'friends':
        loadFriends();
        break;
      case 'requests':
        loadRequests();
        break;
    }
  }

  function attachEventListeners() {
    // Logout button
    const logoutBtn = card.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearToken();
        if (onLogout) onLogout();
      });
    }

    // Navigation buttons
    const navButtons = {
      friends: card.querySelector('#nav-friends'),
      requests: card.querySelector('#nav-requests'),
      add: card.querySelector('#nav-add')
    };

    Object.entries(navButtons).forEach(([view, btn]) => {
      if (btn) {
        btn.addEventListener('click', () => {
          currentView = view;
          render();
        });
      }
    });

    // Send request button
    const sendBtn = card.querySelector('#send-request-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', sendFriendRequestByUsername);
    }

    // Enter key on username input
    const usernameInput = card.querySelector('#username-input');
    if (usernameInput) {
      usernameInput.addEventListener('keypress', (e: any) => {
        if (e.key === 'Enter') {
          sendFriendRequestByUsername();
        }
      });
    }
  }

  // Cleanup function
  const cleanup = () => {
    // Cleanup will be handled automatically by status indicators
  };

  window.addEventListener('beforeunload', cleanup);
  (card as any).cleanup = cleanup;

  // Initial render
  render();

  return card;
}
