import * as friendsController from '../controllers/friends.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createFriendRequestSchema, getFriendsSchema, getPendingFriendRequestsSchema, respondToFriendRequestSchema } from '../schemas/friendsSchemas.js';

export default async function friendsRoutes(app) {

	app.post('/friends/:targetId', {
		preHandler: [verifyJWT],
		schema: createFriendRequestSchema,
		handler: friendsController.createFriendRequestController
	});

	app.get('/friends', {
		preHandler: [verifyJWT],
		schema: getFriendsSchema,
		handler: friendsController.getFriendsController
	});

	app.get('/friends/requests', {
		preHandler: [verifyJWT],
		schema: getPendingFriendRequestsSchema,
		handler: friendsController.getPendingFriendRequestsController
	});

	app.patch('/friends/:id', {
		preHandler: [verifyJWT],
		schema: respondToFriendRequestSchema,
		handler: friendsController.respondToFriendRequestController
	});

}