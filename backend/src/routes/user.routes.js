import * as controller from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getUserByUsernameSchema, getUserByIdSchema } from '../schemas/userSchemas.js';

export default async function userRoutes(app, options) {
  
  app.get('/users/:username', {
    preHandler: verifyJWT,
    schema: getUserByUsernameSchema,
    handler: controller.getUserByUsernameController
  });

  app.get('/users/id/:id', {
    preHandler: verifyJWT,
    schema: getUserByIdSchema,
    handler: controller.getUserByIdController
  });

}
