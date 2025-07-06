import prisma from '../db/client.js';
import { isFriendService } from '../services/isFriend.service.js';
import { sendMessageService } from '../services/chat.service.js';
import { addClient, removeClient, broadcastMessage, isUserOnline, broadcastUserList } from '../services/websocket.service.js';

export default async function chatSocket(fastify) {
  fastify.get('/ws', { websocket: true }, async (connection, req) => {

    try {
      const token = req.headers['sec-websocket-protocol'];      
      if (!token) {
        console.error('No token provided in WebSocket URL');
        connection.close();
        return;
      }
      let user;
      try {
        user = fastify.jwt.verify(token);
      } catch (err) {
        console.error('Invalid JWT token:', err.message);
        connection.close();
        return;
      }
      const userId = user.userId;
      console.log(`🔌 User ${userId} connected to WebSocket`);
      addClient(userId, connection);

      // Send current user list to the newly connected user
      setTimeout(() => {
        broadcastUserList();
      }, 100); // Small delay to ensure connection is established
      try {
        const unreadMessages = await prisma.message.findMany({
          where: {
            receiverId: parseInt(userId),
            isRead: false
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (unreadMessages.length > 0) {
          unreadMessages.forEach(msg => {
            connection.send(JSON.stringify({
              from: msg.senderId,
              content: msg.content,
              createdAt: msg.createdAt,
              isRead: false
            }));
          });
          const ids = unreadMessages.map(m => m.id);
          await prisma.message.updateMany({
            where: { id: { in: ids } },
            data: { isRead: true }
          });
        }
      } catch (err) {
        console.error('Error fetching/updating unread messages:', err);
      }
      connection.on('message', async messageRaw => {
        try {
          const { receiverId, content } = JSON.parse(messageRaw.toString());
          console.log(`📨 Message received from user ${userId} to user ${receiverId}: "${content}"`);
          
          const friend = await isFriendService(parseInt(userId), parseInt(receiverId));
          console.log(`🤝 Friend check result:`, friend);
          
          if (!friend) {
            console.error('❌ User is not a friend');
            connection.send(JSON.stringify({
              error: 'User is not a friend'
            }));
            return;
          }
          
          if (!receiverId || !content) {
            console.error('❌ Invalid message format');
            connection.send(JSON.stringify({
              error: 'Invalid message format'
            }));
            return;
          }
          
          const newMessage = await sendMessageService(parseInt(userId), parseInt(receiverId), content);
          console.log(`💾 Message saved to database:`, newMessage);
          
          // Check if receiver is online before broadcasting
          const isReceiverOnline = isUserOnline(parseInt(receiverId));
          console.log(`🌐 Receiver ${receiverId} online status: ${isReceiverOnline}`);
          
          broadcastMessage(parseInt(userId), parseInt(receiverId), content, newMessage.createdAt);
          console.log(`📡 Message broadcasted to users`);

        } catch (err) {
          console.error('❌ Error processing message:', err);
          connection.send(JSON.stringify({
            error: 'Failed to send message'
          }));
        }
      });
      connection.on('close', () => {
        removeClient(userId);
        console.log(`User ${userId} disconnected`);
      });
      connection.on('error', (err) => {
        console.error(`WebSocket error for user ${userId}:`, err);
        removeClient(userId);
      });

    } catch (err) {
      console.error('Error in WebSocket connection:', err);
      connection.close();
    }
  });
}