import { apiFetch } from './auth-api';

export async function sendMessage(receiverId: number, content: string) {
  return apiFetch('/chat/send', {
    method: 'POST',
    body: JSON.stringify({ receiverId, content })
  });
}

export async function getMessages(receiverId: number) {
  return apiFetch(`/chat/messages/${receiverId}`);
}
