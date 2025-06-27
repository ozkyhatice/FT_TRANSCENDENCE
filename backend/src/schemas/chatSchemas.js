export const postChatSchema = {
    tags: ['Chat'],
    summary: 'Send a message to a user',
    body:{
        type: 'object',
        required: ['receiverId', 'content'],
        properties: {
            receiverId: { type: 'integer' },
            content: { type: 'string' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                message: { 
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        senderId: { type: 'integer' },
                        receiverId: { type: 'integer' },
                        content: { type: 'string' },
                        createdAt: { type: 'string' }
                    }
                }
            }
        }
    }
}