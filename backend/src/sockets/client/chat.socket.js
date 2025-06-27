import prisma from '../../db/client.js';
import { isFriendService } from '../../services/isFriend.service.js';
import { sendMessageService } from '../../services/chat.service.js';

const clients = new Map(); // userId → socket

export default async function chatSocket(fastify) {
  console.log('\n\nchatSocket registered\n\n');
  fastify.get('/ws', { websocket: true }, async (connection, req) => {
    try {
      const token = req.headers['sec-websocket-protocol'];      
      if (!token) {
        console.error('No token provided in WebSocket URL');
        connection.socket.close();
        return;
      }
      let user;
      try {
        user = fastify.jwt.verify(token);
      } catch (err) {
        console.error('Invalid JWT token:', err.message);
        connection.socket.close();
        return;
      }
      const userId = user.userId;
      console.log(`User ${userId} connected to WebSocket`);
      clients.set(userId, connection.socket);
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
          const friend = await isFriendService(parseInt(userId), parseInt(receiverId));
          if (!friend) {
            console.error('User is not a friend');
            return;
          }
          if (!receiverId || !content) {
            console.error('Invalid message format');
            return;
          }
          const newMessage = await sendMessageService(parseInt(userId), parseInt(receiverId), content);
          const receiverSocket = clients.get(parseInt(receiverId));
          if (receiverSocket && receiverSocket.readyState === 1) {
            receiverSocket.send(JSON.stringify({
              from: userId,
              content,
              createdAt: newMessage.createdAt,
              isRead: true
            }));
            console.log(`Message sent to user ${receiverId}`);
          } else {
            console.log(`User ${receiverId} is not online`);

          }
          connection.send(JSON.stringify({
            to: receiverId,
            content,
            createdAt: newMessage.createdAt,
            status: 'sent'
          }));

        } catch (err) {
          console.error('Error processing message:', err);
          connection.send(JSON.stringify({
            error: 'Failed to send message'
          }));
        }
      });
      connection.on('close', () => {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
      });
      connection.on('error', (err) => {
        console.error(`WebSocket error for user ${userId}:`, err);
        clients.delete(userId);
      });

    } catch (err) {
      console.error('Error in WebSocket connection:', err);
      connection.socket.close();
    }
  });
}