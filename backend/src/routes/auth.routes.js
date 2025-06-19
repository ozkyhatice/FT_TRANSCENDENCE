import * as controller from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { loginSchema, registerSchema, getMeSchema, postMeSchema, putMeSchema } from '../schemas/authSchemas.js';

const preValidationHook = (request, reply, done) => {
  const { username, password } = request.body;
  if (username) {
    request.body.username = username.trim();
  }
  if (password) {
    request.body.password = password.trim();
  }
  done();
};

export default async function authRoutes(app, options) {

  app.post('/register', {
    schema: registerSchema,
    preValidation: preValidationHook,
    handler: controller.registerController
  });

  app.post('/login', {
    schema: loginSchema,
    preValidation: preValidationHook,
    handler: controller.loginController
  });

  app.get('/me', {
    preHandler: verifyJWT,
    schema: getMeSchema,
    handler: controller.meController
  });

  app.post('/me', {
    preHandler: verifyJWT,
    schema: postMeSchema,
    preValidation: preValidationHook,
    handler: controller.updateMeController
  });
  app.put('/me', {
    preHandler: verifyJWT,
    schema: putMeSchema,
    preValidation: preValidationHook,
    handler: controller.updateMeController
  })

}
