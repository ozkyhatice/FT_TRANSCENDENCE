import { getToken, getMe } from '../lib/api';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { MainLayout } from './MainLayout';
import { destroyWebSocketService } from '../lib/websocket.service';
import { chatStore } from '../lib/chat.service';

// Simple app state
const state = {
  isAuthenticated: false,
  screen: 'login' as 'login' | 'register' | 'main',
  user: null as any,
  loading: false,
};

function render(root: HTMLElement) {
  root.innerHTML = '';
  
  if (state.loading) {
    root.innerHTML = '<div class="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>';
    return;
  }

  if (!state.isAuthenticated) {
    if (state.screen === 'login') {
      root.appendChild(LoginForm(handleLogin, () => {
        state.screen = 'register';
        render(root);
      }));
    } else {
      root.appendChild(RegisterForm(() => {
        state.screen = 'login';
        render(root);
      }, () => {
        state.screen = 'login';
        render(root);
      }));
    }
  } else {
    if (!state.user) {
      root.innerHTML = '<div class="flex items-center justify-center min-h-screen text-red-400">Failed to load user</div>';
      return;
    }
    root.appendChild(MainLayout(state.user, handleLogout));
  }
}

async function handleLogin() {
  state.loading = true;
  render(document.getElementById('app')!);
  
  try {
    // Clear any previous chat data before login
    chatStore.clear();
    
    state.user = await getMe();
    state.isAuthenticated = true;
    state.screen = 'main';
  } catch {
    state.user = null;
    state.isAuthenticated = false;
  }
  
  state.loading = false;
  render(document.getElementById('app')!);
}

function handleLogout() {
  // Destroy WebSocket service before logout
  destroyWebSocketService();
  
  state.isAuthenticated = false;
  state.user = null;
  state.screen = 'login';
  render(document.getElementById('app')!);
}

export function App(root: HTMLElement) {
  if (getToken()) {
    state.loading = true;
    render(root);
    
    // Clear chat data when app starts with existing token
    chatStore.clear();
    
    getMe().then(user => {
      state.user = user;
      state.isAuthenticated = true;
      state.screen = 'main';
    }).catch(() => {
      state.isAuthenticated = false;
    }).finally(() => {
      state.loading = false;
      render(root);
    });
  } else {
    render(root);
  }
} 