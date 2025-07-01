// Chat Test Page Script
class ChatTest {
  constructor() {
    this.token = localStorage.getItem('token');
    this.socket = null;
    this.currentUserId = null;
    this.selectedFriendId = null;
    this.messageCount = 0;
    this.debugEvents = [];
    
    this.init();
  }

  init() {
    // Check authentication
    if (!this.token) {
      window.location.href = '/login.html';
      return;
    }

    // Get DOM elements
    this.elements = {
      connectionStatus: document.getElementById('connectionStatus'),
      friendSelect: document.getElementById('friendSelect'),
      friendStatusDot: document.getElementById('friendStatusDot'),
      friendStatusText: document.getElementById('friendStatusText'),
      chatWithName: document.getElementById('chatWithName'),
      chatStatus: document.getElementById('chatStatus'),
      messagesContainer: document.getElementById('messagesContainer'),
      messageInput: document.getElementById('messageInput'),
      sendBtn: document.getElementById('sendBtn'),
      clearChatBtn: document.getElementById('clearChatBtn'),
      messageCounter: document.getElementById('messageCounter'),
      wsStatus: document.getElementById('wsStatus'),
      logoutBtn: document.getElementById('logoutBtn'),
      toggleDebug: document.getElementById('toggleDebug'),
      debugInfo: document.getElementById('debugInfo'),
      debugWs: document.getElementById('debugWs'),
      debugUserId: document.getElementById('debugUserId'),
      debugFriend: document.getElementById('debugFriend'),
      debugSent: document.getElementById('debugSent'),
      debugEvents: document.getElementById('debugEvents')
    };

    this.setupEventListeners();
    this.loadUserInfo();
    this.loadFriends();
    this.connectWebSocket();
  }

  setupEventListeners() {
    // Send message
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
    this.elements.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Friend selection
    this.elements.friendSelect.addEventListener('change', (e) => {
      this.selectFriend(e.target.value);
    });

    // Clear chat
    this.elements.clearChatBtn.addEventListener('click', () => this.clearChat());

    // Logout
    this.elements.logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    });

    // Debug toggle
    this.elements.toggleDebug.addEventListener('click', () => {
      const isHidden = this.elements.debugInfo.style.display === 'none';
      this.elements.debugInfo.style.display = isHidden ? 'block' : 'none';
      this.elements.toggleDebug.textContent = isHidden ? 'Hide' : 'Show';
    });
  }

  async loadUserInfo() {
    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      this.currentUserId = payload.userId;
      this.elements.debugUserId.textContent = this.currentUserId;
      this.addDebugEvent(`User loaded: ${this.currentUserId}`);
    } catch (error) {
      console.error('Error loading user info:', error);
      this.addDebugEvent(`Error loading user: ${error.message}`);
    }
  }

  async loadFriends() {
    try {
      const response = await fetch('/friends', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load friends');
      
      const data = await response.json();
      const friends = data.friendsList || [];
      this.populateFriendsDropdown(friends);
      this.addDebugEvent(`Loaded ${friends.length} friends`);
    } catch (error) {
      console.error('Error loading friends:', error);
      this.addDebugEvent(`Error loading friends: ${error.message}`);
    }
  }

  populateFriendsDropdown(friends) {
    this.elements.friendSelect.innerHTML = '<option value="">Select a friend...</option>';
    
    friends.forEach(friend => {
      const option = document.createElement('option');
      option.value = friend.id;
      option.textContent = friend.username;
      this.elements.friendSelect.appendChild(option);
    });
  }

  selectFriend(friendId) {
    if (!friendId) {
      this.selectedFriendId = null;
      this.elements.chatWithName.textContent = 'Select a friend to start chatting';
      this.elements.chatStatus.textContent = 'No active chat';
      this.elements.messageInput.disabled = true;
      this.elements.sendBtn.disabled = true;
      this.elements.debugFriend.textContent = 'None';
      return;
    }

    this.selectedFriendId = parseInt(friendId);
    const friendName = this.elements.friendSelect.options[this.elements.friendSelect.selectedIndex].text;
    
    this.elements.chatWithName.textContent = `Chat with ${friendName}`;
    this.elements.chatStatus.textContent = 'Ready to send messages';
    this.elements.messageInput.disabled = false;
    this.elements.sendBtn.disabled = false;
    this.elements.debugFriend.textContent = `${friendName} (${friendId})`;
    
    this.loadChatHistory();
    this.addDebugEvent(`Selected friend: ${friendName} (${friendId})`);
  }

  async loadChatHistory() {
    if (!this.selectedFriendId) return;

    try {
      const response = await fetch(`/history/${this.selectedFriendId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load chat history');
      
      const data = await response.json();
      const messages = data.chatHistory || [];
      this.displayChatHistory(messages);
      this.addDebugEvent(`Loaded ${messages.length} chat history messages`);
    } catch (error) {
      console.error('Error loading chat history:', error);
      this.addDebugEvent(`Error loading chat history: ${error.message}`);
    }
  }

  displayChatHistory(messages) {
    this.elements.messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
      this.elements.messagesContainer.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <div class="text-4xl mb-2">💬</div>
          <p>No messages yet. Start the conversation!</p>
        </div>
      `;
      return;
    }

    messages.forEach(message => {
      this.displayMessage(message, false);
    });
    
    this.scrollToBottom();
  }

  connectWebSocket() {
    try {
      const wsUrl = `ws://localhost:3000/ws`;
      this.socket = new WebSocket(wsUrl, [this.token]);
      
      this.socket.onopen = () => {
        console.log('🟢 WebSocket connected successfully');
        this.elements.connectionStatus.textContent = 'Connected';
        this.elements.connectionStatus.className = 'text-sm text-green-200';
        this.elements.wsStatus.textContent = 'Connected';
        this.elements.wsStatus.className = 'text-green-500';
        this.elements.debugWs.textContent = 'Connected';
        this.addDebugEvent('WebSocket connected');
      };
      
      this.socket.onmessage = (event) => {
        console.log('🔥 RAW WebSocket message received:', event.data);
        try {
          const message = JSON.parse(event.data);
          console.log('🔥 PARSED WebSocket message:', message);
          this.handleIncomingMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.elements.connectionStatus.textContent = 'Error';
        this.elements.connectionStatus.className = 'text-sm text-red-200';
        this.elements.wsStatus.textContent = 'Error';
        this.elements.wsStatus.className = 'text-red-500';
        this.elements.debugWs.textContent = 'Error';
        this.addDebugEvent(`WebSocket error: ${error.message || 'Unknown error'}`);
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.elements.connectionStatus.textContent = 'Disconnected';
        this.elements.connectionStatus.className = 'text-sm text-red-200';
        this.elements.wsStatus.textContent = 'Disconnected';
        this.elements.wsStatus.className = 'text-red-500';
        this.elements.debugWs.textContent = 'Disconnected';
        this.addDebugEvent('WebSocket disconnected');
        
        // Try to reconnect after 3 seconds
        setTimeout(() => this.connectWebSocket(), 3000);
      };
      
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.addDebugEvent(`WebSocket creation error: ${error.message}`);
    }
  }

  handleIncomingMessage(message) {
    console.log('🔔 Received WebSocket message:', message);
    this.addDebugEvent(`Received: ${JSON.stringify(message)}`);
    
    if (message.error) {
      console.error('❌ WebSocket error:', message.error);
      this.showError(message.error);
      return;
    }

    // Handle different message types
    if (message.from) {
      console.log('📨 Incoming message from user:', message.from);
      // Incoming message from another user
      const messageData = {
        senderId: parseInt(message.from),
        receiverId: this.currentUserId,
        content: message.content,
        createdAt: message.createdAt
      };
      
      // Only display if it's from the currently selected friend
      console.log('🔍 Checking friend match:');
      console.log('  - message.from:', message.from, typeof message.from);
      console.log('  - this.selectedFriendId:', this.selectedFriendId, typeof this.selectedFriendId);
      console.log('  - parseInt(message.from):', parseInt(message.from));
      console.log('  - Match result:', parseInt(message.from) === parseInt(this.selectedFriendId));
      
      if (this.selectedFriendId && parseInt(message.from) === parseInt(this.selectedFriendId)) {
        console.log('✅ Displaying incoming message');
        this.displayMessage(messageData, true);
      } else {
        console.log('⏭️ Message not from selected friend, ignoring');
      }
    } else if (message.to) {
      console.log('📤 Message sent confirmation to user:', message.to);
      // Confirmation of sent message
      const messageData = {
        senderId: this.currentUserId,
        receiverId: parseInt(message.to),
        content: message.content,
        createdAt: message.createdAt
      };
      console.log('✅ Displaying sent message');
      this.displayMessage(messageData, true);
    } else if (message.status) {
      console.log('ℹ️ Status message:', message);
    } else {
      console.log('❓ Unknown message type:', message);
    }
  }

  sendMessage() {
    const content = this.elements.messageInput.value.trim();
    if (!content || !this.selectedFriendId || !this.socket) return;

    try {
      const message = {
        receiverId: this.selectedFriendId,
        content: content
      };
      
      console.log('Sending WebSocket message:', message);
      console.log('Socket state:', this.socket.readyState);
      console.log('Current user ID:', this.currentUserId);
      console.log('Selected friend ID:', this.selectedFriendId);
      
      this.socket.send(JSON.stringify(message));
      this.elements.messageInput.value = '';
      this.messageCount++;
      this.elements.messageCounter.textContent = this.messageCount;
      this.elements.debugSent.textContent = this.messageCount;
      this.addDebugEvent(`Sent message to ${this.selectedFriendId}: "${content}"`);
      
    } catch (error) {
      console.error('Error sending message:', error);
      this.showError('Failed to send message');
      this.addDebugEvent(`Send error: ${error.message}`);
    }
  }

  displayMessage(message, isRealtime = false) {
    console.log('🎨 Displaying message:', {
      senderId: message.senderId,
      content: message.content,
      isRealtime: isRealtime,
      currentUserId: this.currentUserId
    });
    
    const isOwnMessage = parseInt(message.senderId) === parseInt(this.currentUserId);
    const messageTime = new Date(message.createdAt).toLocaleTimeString();
    
    const messageElement = document.createElement('div');
    messageElement.className = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`;
    
    messageElement.innerHTML = `
      <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-indigo-600 text-white' 
          : 'bg-white text-gray-800 border border-gray-200'
      }">
        <div class="text-sm">${message.content}</div>
        <div class="text-xs ${isOwnMessage ? 'text-indigo-200' : 'text-gray-500'} mt-1">
          ${messageTime} ${isRealtime ? '• Live' : ''}
        </div>
      </div>
    `;
    
    // Remove welcome message if exists
    const welcomeMsg = this.elements.messagesContainer.querySelector('.text-center');
    if (welcomeMsg) {
      console.log('🗑️ Removing welcome message');
      welcomeMsg.remove();
    }
    
    this.elements.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
    
    console.log('✅ Message added to DOM');
    
    // Add animation for realtime messages
    if (isRealtime) {
      messageElement.style.opacity = '0';
      messageElement.style.transform = 'translateY(20px)';
      setTimeout(() => {
        messageElement.style.transition = 'all 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
      }, 100);
    }
  }

  clearChat() {
    this.elements.messagesContainer.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <div class="text-4xl mb-2">🧹</div>
        <p>Chat cleared! This only clears the display, not the actual message history.</p>
      </div>
    `;
    this.addDebugEvent('Chat display cleared');
  }

  scrollToBottom() {
    this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
    errorElement.textContent = message;
    
    this.elements.messagesContainer.appendChild(errorElement);
    this.scrollToBottom();
    
    // Remove error after 5 seconds
    setTimeout(() => errorElement.remove(), 5000);
  }

  addDebugEvent(event) {
    const timestamp = new Date().toLocaleTimeString();
    this.debugEvents.unshift(`${timestamp}: ${event}`);
    
    // Keep only last 10 events
    if (this.debugEvents.length > 10) {
      this.debugEvents = this.debugEvents.slice(0, 10);
    }
    
    this.elements.debugEvents.innerHTML = this.debugEvents
      .map(event => `<div>${event}</div>`)
      .join('');
  }
}

// Initialize chat test when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.chatTest = new ChatTest();
}); 