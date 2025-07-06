import prisma from '../db/client.js';

function parseId(rawId) {
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Invalid friend request ID');
    }
    return id;
}

export async function deleteFriendRequestService(friendshipId, userId) {
    const id = parseId(friendshipId);

    const friendRequest = await prisma.friend.findUnique({
        where: { id }
    });
    if (!friendRequest) {
        throw new Error('Friend request not found');
    }

    const isParticipant =
        friendRequest.requesterId === userId || friendRequest.receiverId === userId;

    if (!isParticipant) {
        throw new Error('You are not authorized to delete this friend request');
    }

    await prisma.friend.delete({
        where: { id }
    });
    return friendRequest;
}