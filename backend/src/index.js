import fastify from 'fastify';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes.js';
import friendsRoutes from './routes/friends.routes.js';
import chatRoutes from './routes/chat.routes.js';
import userRoutes from './routes/user.routes.js';
import errorHandler from './handlers/errorHandler.js';
import websocket from '@fastify/websocket';
import chatSocket from './sockets/chat.socket.js';

dotenv.config();

const app = fastify({ logger: true });
const io = new Server(app.server);
io.on('connection', (socket) => {
  console.log('a user connected');
});


app.register(websocket);

// CORS configuration - allow all common development origins
app.register(cors, {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all localhost and 127.0.0.1 origins with any port
    const allowedOriginPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^https:\/\/localhost:\d+$/,
      /^https:\/\/127\.0\.0\.1:\d+$/
    ];
    
    const isAllowed = allowedOriginPatterns.some(pattern => pattern.test(origin));
    if (isAllowed) {
      return callback(null, true);
    }
    
    // For production, you can add specific domains here
    callback(null, true); // For development, allow all origins
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 204
});

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

app.setErrorHandler(errorHandler);

// Add a hook to handle CORS preflight requests
app.addHook('onRequest', async (request, reply) => {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    reply.header('Access-Control-Allow-Origin', request.headers.origin || '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.code(204).send();
    return;
  }
});

// Register chat socket handler

app.register(authRoutes);
app.register(friendsRoutes);
app.register(userRoutes);

app.register(chatSocket);
app.register(chatRoutes);

app.listen({ 
  port: process.env.PORT || 3000, 
  host: '0.0.0.0' // Listen on all interfaces
}, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	app.log.info(`Server listening at ${address}`);
});

export { io };