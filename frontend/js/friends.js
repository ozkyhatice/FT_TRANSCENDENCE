// Friends page script

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login.html';
}

const authHeaders = {
  'Authorization': `Bearer ${token}`
};
const jsonHeaders = {
  ...authHeaders,
  'Content-Type': 'application/json'
};

const friendsListEl = document.getElementById('friendsList');
const pendingListEl = document.getElementById('pendingList');
const addFriendForm = document.getElementById('addFriendForm');
const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');

async function loadFriends() {
  try {
    const res = await fetch('/friends', { headers: authHeaders });
    const { friendsList = [] } = await res.json();
    friendsListEl.innerHTML = '';
    friendsList.forEach(f => {
      const li = document.createElement('li');
      li.className = 'bg-white p-3 rounded shadow flex justify-between items-center';
      li.innerHTML = `
        <span class="font-semibold">${f.username}</span>
        <div class="space-x-3 text-sm">
          <a href="/profile.html?user=${encodeURIComponent(f.username)}" class="text-indigo-600 hover:underline">Profile</a>
          <a href="/message.html?receiver=${encodeURIComponent(f.id)}" class="text-green-600 hover:underline">Chat</a>
        </div>`;
      friendsListEl.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadPending() {
  try {
    const res = await fetch('/friends/requests', { headers: authHeaders });
    const { incomingRequests = [] } = await res.json();
    pendingListEl.innerHTML = '';
    incomingRequests.forEach(req => {
      const li = document.createElement('li');
      li.className = 'bg-white p-3 rounded shadow flex justify-between items-center';
      li.innerHTML = `<span>Request from ${req.requester.username} (ID #${req.requester.id})</span>`;
      const actions = document.createElement('div');
      ['accept', 'reject'].forEach(action => {
        const btn = document.createElement('button');
        btn.textContent = action.charAt(0).toUpperCase() + action.slice(1);
        btn.className = `px-2 py-1 text-sm rounded mr-2 ${action==='accept' ? 'bg-green-600' : 'bg-red-600'} text-white hover:opacity-90`;
        btn.onclick = () => respondRequest(req.id, action);
        actions.appendChild(btn);
      });
      li.appendChild(actions);
      pendingListEl.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

async function respondRequest(id, action) {
  try {
    const res = await fetch(`/friends/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ action })
    });
    if (res.ok) {
      await loadFriends();
      await loadPending();
    }
  } catch (err) {
    console.error(err);
  }
}

addFriendForm.addEventListener('submit', async e => {
  e.preventDefault();
  const target = document.getElementById('targetId').value.trim();
  if (!target) return;
  try {
    const res = await fetch(`/friends/${encodeURIComponent(target)}`, { method: 'POST', headers: authHeaders });
    if (res.ok) {
      document.getElementById('targetId').value = '';
      await loadPending();
      alert('Request sent');
    } else {
      const err = await res.json();
      alert(err.message || 'Error');
    }
  } catch (err) {
    console.error(err);
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});

profileBtn.addEventListener('click', () => {
  window.location.href = '/profile.html';
});

// Initial load
loadFriends();
loadPending(); 