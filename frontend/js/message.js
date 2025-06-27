// Message page script

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login.html';
}

const authHeaders = { 'Authorization': `Bearer ${token}` };
const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };

// WebSocket connection
let socket = null;

function connectWebSocket() {
  const wsUrl = `ws://localhost:3000/ws`;
  socket = new WebSocket(wsUrl, [token]);
  
  socket.onopen = () => {
    console.log('WebSocket connected');
  };
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log(message);
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

  const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});
profileBtn.addEventListener('click', () => {
  window.location.href = '/profile.html';
});


// Connect WebSocket on page load
connectWebSocket();
