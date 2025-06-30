import prisma from '../db/client.js';
import { isFriendService } from './isFriend.service.js';

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
    if (senderID === receiverId) {
        throw new Error('You cannot send a message to yourself');
    }
    try{
        const friend = await isFriendService(parseInt(senderID), parseInt(receiverId));

        if (!friend) {
            throw new Error('You are not friends');
    }
    } catch (error) {
        throw new Error('You are not friends');
    }
    const message = await prisma.message.create({
        data: {
            senderId: parseInt(senderID),
            receiverId: parseInt(receiverId),
            content: content
        }
    });
    return message;
}