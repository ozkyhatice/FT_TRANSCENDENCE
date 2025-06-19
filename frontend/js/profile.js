// Profile page script
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login.html';
}

const authHeaders = { 'Authorization': `Bearer ${token}` };
const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };

const logoutBtn = document.getElementById('logoutBtn');
const form = document.getElementById('profileForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const displayUsernameEl = document.getElementById('displayUsername');
const winsEl = document.getElementById('wins');
const lossesEl = document.getElementById('losses');
const avatarEl = document.getElementById('avatar');
const friendsGrid = document.getElementById('friendsGrid');
const otherActions = document.getElementById('otherActions');
const addFriendBtn = document.getElementById('addFriendBtn');

const urlParams = new URLSearchParams(window.location.search);
const targetParam = urlParams.get('user'); // username or id
const isOwn = !targetParam;

async function loadProfile() {
  try {
    const endpoint = isOwn ? '/me' : `/users/${encodeURIComponent(targetParam)}`;
    const res = await fetch(endpoint, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to load profile');
      return;
    }

    // Populate basic info
    displayUsernameEl.textContent = data.username;
    usernameInput.value = data.username;
    winsEl.textContent = data.wins ?? 0;
    lossesEl.textContent = data.losses ?? 0;
    if (data.avatarUrl) {
      avatarEl.src = data.avatarUrl;
    } else {
      avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}`;
    }

    // Friends list
    friendsGrid.innerHTML = '';
    (data.friends || []).forEach(f => {
      const card = document.createElement('div');
      card.className = 'bg-gray-100 p-3 rounded shadow flex items-center space-x-3';
      card.innerHTML = `
        <img src="${f.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(f.username)}" class="w-10 h-10 rounded-full object-cover" />
        <a href="/profile.html?user=${encodeURIComponent(f.username)}" class="font-semibold hover:underline">${f.username}</a>
      `;
      friendsGrid.appendChild(card);
    });

    if (isOwn) {
      form.classList.remove('hidden');
    } else {
      otherActions.classList.remove('hidden');
      // attach add friend
      addFriendBtn.onclick = async () => {
        try {
          const r = await fetch(`/friends/${encodeURIComponent(targetParam)}`, { method: 'POST', headers: authHeaders });
          const d = await r.json();
          if (r.ok) {
            alert('Friend request sent');
          } else {
            alert(d.error || d.message || 'Error');
          }
        } catch (err) {
          console.error(err);
          alert('Network error');
        }
      };
    }
  } catch (err) {
    console.error(err);
    alert('Network error');
  }
}

if (isOwn) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username && !password) return;

    try {
      const res = await fetch('/me', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ ...(username && { username }), ...(password && { password }) })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Profile updated');
        passwordInput.value = '';
      } else {
        alert(data.error || data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  });
} else {
  // Disable form for other profiles
  form.classList.add('hidden');
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});

loadProfile(); 