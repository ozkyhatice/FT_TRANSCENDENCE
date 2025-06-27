// Shared script for /login.html and /register.html

const form = document.getElementById('authForm');
if (form) {
  const type = form.dataset.type; // 'login' or 'register'
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = form.username.value.trim();
    const password = form.password.value.trim();

    try {
      const res = await fetch(`/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || data.message || 'Something went wrong');
        return;
      }
      localStorage.setItem('token', data.token);
      window.location.href = '/friends.html';
      const token = localStorage.getItem("token");

      const socket = new WebSocket("ws://localhost:3000/ws", [token]);
      socket.onopen = () => {
        console.log("Connected to WebSocket");
      }
      socket.onmessage = (event) => {
        console.log("Received message:", event.data);
      }
    } catch (err) {
      alert('Network error');
      console.error(err);
    }
  });
} 