import prisma from '../db/client.js';

export async function getMessagesService(senderID, receiverId) {
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: parseInt(senderID), receiverId: parseInt(receiverId) },
                { senderId: parseInt(receiverId), receiverId: parseInt(senderID) }
            ]
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
    return messages;
}

export async function sendMessageService(senderID, receiverId, content) {
    const message = await prisma.message.create({
        data: {
            senderId: parseInt(senderID),
            receiverId: parseInt(receiverId),
            content: content
        }
    });
    return message;
}