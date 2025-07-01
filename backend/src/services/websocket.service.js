const clients = new Map();

export function addClient(userId, socket) {
  clients.set(parseInt(userId), socket);
}

export function removeClient(userId) {
  clients.delete(parseInt(userId));
}

export function getClient(userId) {
  return clients.get(parseInt(userId));
}

export function broadcastToUser(userId, message) {
    try{
        const receiverSocket = clients.get(parseInt(userId));
        if (receiverSocket && receiverSocket.readyState === 1) {
            receiverSocket.send(JSON.stringify(message));
            return true;
        } else {
            return false;
        }
    }catch(error){
        console.error('Error broadcasting to user:', error);
        return false;
    }
}

export function broadcastMessage(senderId, receiverId, content, createdAt) {
    broadcastToUser(receiverId, {
    from: senderId,
    content,
    createdAt,
    isRead: true
  });
  
  broadcastToUser(senderId, {
    to: receiverId,
    content,
    createdAt,
    status: 'sent'
  });
}

export function getOnlineUsers() {
  return Array.from(clients.keys());
}

export function getClientCount() {
  return clients.size;
} 