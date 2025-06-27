import prisma from '../db/client.js';

export async function isFriendService(userId, friendId) {
    const friend = await prisma.friend.findFirst({
        where: {            
            OR: [
                { userId, friendId },
                { userId: friendId, friendId: userId }
            ]
        }
    });

    return friend;
}