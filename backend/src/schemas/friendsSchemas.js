const createFriendRequestSchema = {
    summary: 'Send a friend request to another user',
    tags: ['Friends'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            targetId: { type: 'string', description: 'Target user ID to send friend request to' }
        },
        required: ['targetId']
    }
}

const getFriendsSchema = {
    summary: 'Get list of accepted friends',
    tags: ['Friends'],
    security: [{ bearerAuth: [] }]
}

const getPendingFriendRequestsSchema = {
    summary: 'Get list of pending friend requests received by the user',
    tags: ['Friends'],
    security: [{ bearerAuth: [] }],
}

const respondToFriendRequestSchema = {
    summary: "Accept or reject a friend request",
    tags: ['Friends'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Friend request ID' }
        },
        required: ['id']
    },
    body: {
        type: 'object',
        properties: {
            action: { 
                type: 'string', 
                enum: ['accept', 'reject'],
                description: 'Action to take on the friend request'
            }
        },
        required: ['action']
    }
}

const deleteFriendRequestSchema = {
    summary: 'Delete a friend request',
    tags: ['Friends'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Friend request ID' }
        },
        required: ['id']
    }
}

export { createFriendRequestSchema, getFriendsSchema, getPendingFriendRequestsSchema, respondToFriendRequestSchema, deleteFriendRequestSchema };