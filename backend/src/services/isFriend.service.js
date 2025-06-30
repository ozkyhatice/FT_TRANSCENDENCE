import prisma from '../db/client.js';

export async function isFriendService(requesterId, receiverId) {
    const friend = await prisma.friend.findFirst({
        where: {            
            OR: [
                { requesterId: requesterId,  receiverId: receiverId },
                { requesterId: receiverId, receiverId: requesterId }
            ]
        }
    });
    return friend;
}