import { PrismaClientUnknownRequestError } from '@prisma/client/runtime/library';
import prisma from '../db/client.js';

export async function createFriendRequestController(request, reply) {
  try{
  const requesterId = request.user.userId;
  const targetParam = request.params.targetId;
  let targetId = parseInt(targetParam, 10);
  if (Number.isNaN(targetId)) {
    // treat as username lookup
    const user = await prisma.user.findUnique({ where: { username: targetParam } });
    if (!user) {
      return reply.code(404).send({ error: 'Target user not found' });
    }
    targetId = user.id;
  }

  if (requesterId === targetId) {
    return reply.code(400).send({ error: "You cannot send a friend request to yourself" });
  }

  const existing = await prisma.friend.findFirst({
    where: {
      OR: [
        { requesterId, receiverId: targetId },
        { requesterId: targetId, receiverId: requesterId }
      ]
    }
  });

  if (existing) {
    return reply.code(409).send({ error: "Friend request already exists or users are already friends" });
  }

  const friendRequest = await prisma.friend.create({
    data: {
      requesterId,
      receiverId: targetId,
      status: 'pending'
    }
  });

  return reply.code(201).send({ message: "Friend request sent", friendRequest });
  } catch (error) {
    return reply.code(400).send({ error: error.message });
  }
}


export async function getFriendsController(request, reply){

  const userId = request.user.userId;
  
  const friends = await prisma.friend.findMany({
    where: {
      OR: [
        {requesterId: userId, status:"accepted"},
        {receiverId: userId, status:"accepted"}
      ]
    },
    include: {
      requester: { select: {id: true, username: true, createdAt: true} },
      receiver: { select: {id: true, username: true, createdAt: true} },
    }
  });

  const friendsList = friends.map(friend => {
      return friend.requesterId === userId ? friend.receiver : friend.requester;
  })

  return reply.code(200).send({ friendsList });

}

export async function getPendingFriendRequestsController(request, reply){
  const userId = request.user.userId;

  const requests = await prisma.friend.findMany({
    where: { receiverId: userId, status: "pending" },
    include: {
      requester: { select: {id: true, username: true, createdAt: true} },
      receiver: { select: {id: true, username: true, createdAt: true} }
    }
  })

  const incomingRequests = requests.map(req => ({
    id: req.id,
    requester: req.requesterId === userId ? req.receiver : req.requester
  }));

  return reply.code(200).send({ incomingRequests });
}


export async function respondToFriendRequestController(request, reply) {
  const userId = request.user.userId;
  const friendRequestId = parseInt(request.params.id, 10);
  const { action } = request.body;

  if (!['accept', 'reject'].includes(action)) {
    return reply.code(400).send({ error: 'Invalid action. Must be accept or reject.' });
  }

  const friendRequest = await prisma.friend.findUnique({
    where: { id: friendRequestId }
  });

  if (!friendRequest || friendRequest.receiverId !== userId) {
    return reply.code(404).send({ error: 'Friend request not found or not authorized' });
  }

  const updated = await prisma.friend.update({
    where: { id: friendRequestId },
    data: { status: action === 'accept' ? 'accepted' : 'rejected' }
  });

  return reply.send({ message: `Friend request ${action}ed`, friendRequest: updated });
}