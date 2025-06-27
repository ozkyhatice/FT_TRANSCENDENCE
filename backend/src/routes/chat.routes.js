import { sendMessageController, getMessagesController } from '../controllers/chat.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { postChatSchema } from '../schemas/chatSchemas.js';

export default async function chatRoutes(app, options) {
    app.post('/messages', {
        preHandler: verifyJWT,
        schema: postChatSchema,
        handler: sendMessageController
    });
    app.get('/messages/:receiverId', {
        preHandler: verifyJWT,
        handler: getMessagesController
    });
}