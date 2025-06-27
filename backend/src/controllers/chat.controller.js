import * as chatService from '../services/chat.service.js';


export async function sendMessageController(request, reply) {
    try{
        const senderID = request.user.userId;
        let { receiverId, content } = request.body;
        if (typeof content === 'string') {
            content = content.trim();
        }
        if (!receiverId || !content) {
            return reply.code(400).send({error: 'Receiver ID and content are required'});
        }
        if (content.length > 1000 || content.length < 1) {
            return reply.code(400).send({error: 'Message content must be less than 1000 characters and greater than 1 character'});
        }
        const message = await chatService.sendMessageService(senderID, receiverId, content);
        return reply.code(201).send({message});


    }catch(error){
        console.error('Error sending message:', error);
        return reply.code(500).send({error: 'Failed to send message'});

    }

}

export async function getMessagesController(request, reply) {
    try{
        const senderID = request.user.userId;
        const receiverId = request.params.receiverId;
        console.log('Sender ID:', senderID);
        console.log('Receiver ID:', receiverId);
        const messages = await chatService.getMessagesService(senderID, receiverId);
        return reply.code(200).send({messages});
    }catch(error){
        console.error('Error getting messages:', error);
        return reply.code(500).send({error: 'Failed to get messages'});
    }
}