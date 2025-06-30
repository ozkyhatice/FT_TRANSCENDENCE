import fastify from 'fastify';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import friendsRoutes from './routes/friends.routes.js';
import chatRoutes from './routes/chat.routes.js';
import errorHandler from './handlers/errorHandler.js';
import websocket from '@fastify/websocket';
import chatSocket from './sockets/chat.socket.js';

dotenv.config();

const app = fastify({ logger: true });

app.register(websocket);
app.register(jwt, { secret: process.env.JWT_SECRET || 'supersecret' });

await app.register(import('@fastify/swagger'), {
  openapi: {
    info: {
      title: 'Pong Game API',
      description: 'API documentation for ft_transcendence project',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  }
});
await app.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  exposeRoute: true
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.register(fastifyStatic, {
  root: path.join(__dirname, '../../frontend'),
  prefix: '/', // Serves UI at http://localhost:3000
});

app.setErrorHandler(errorHandler);

// Register chat socket handler

app.register(authRoutes);
app.register(friendsRoutes);

app.register(chatSocket);
app.register(chatRoutes);

app.listen({ port: process.env.PORT || 3000 }, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	app.log.info(`Server listening at ${address}`);
});

