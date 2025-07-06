import { API_CONFIG, STORAGE_KEYS } from './constants';
import { destroyWebSocketService } from './websocket.service';

const API_URL = API_CONFIG.BASE_URL;

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
}

export function setToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
  destroyWebSocketService();
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { 
        message: `HTTP ${res.status}: ${res.statusText}`,
        status: res.status,
        statusText: res.statusText 
      };
    }
    throw error;
  }
  
  return res.json();
}

export async function loginApi(username: string, password: string) {
  return apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function registerApi(username: string, password: string) {
  return apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function getMe() {
  return apiFetch('/me');
}

export { apiFetch };
