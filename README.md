# ft_transcendence - Pong Game Backend

A backend API for the transcendence pong game project, built with Node.js and Fastify.

## What's included

- User registration and authentication system
- JWT-based auth with protected routes
- User profiles and friend management
- Real-time chat functionality
- Channel/room system for group conversations
- SQLite database with Prisma ORM

## Tech stack

- **Node.js** with Fastify framework
- **SQLite** database via Prisma ORM
- **JWT** for authentication
- **WebSockets** for real-time features
- **bcrypt** for password hashing

## Getting started

### Prerequisites

Make sure you have Node.js installed (v14+ recommended).

### Installation

1. Clone the repo and navigate to backend:
```bash
git clone <repository-url>
cd trans/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables by creating a `.env` file:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL="file:./prisma/dev.db"
```

4. Initialize the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, you can view the interactive API docs at:
`http://localhost:3000/docs`

### Authentication

Most endpoints require authentication. After logging in, include the JWT token in your requests:

```
Authorization: Bearer <your-token>
```

## Main features

### User Management
- Register new users
- Login with username/password
- Update user profiles
- Manage user settings

### Friends System
- Send friend requests
- Accept/reject incoming requests
- View friend lists
- Remove friends

### Chat & Channels
- Create and join channels
- Send messages in real-time
- Private messaging between users
- Channel membership management

### Real-time Features
- WebSocket connections for live chat
- Real-time friend status updates
- Live notifications

## Project structure

```
src/
├── auth/           # Authentication utilities
├── controllers/    # Route handlers
├── middlewares/    # Custom middleware
├── routes/         # API route definitions
├── services/       # Business logic
├── schemas/        # Validation schemas
└── sockets/        # WebSocket handlers
```

## Database

The project uses SQLite with Prisma ORM. Database schema includes:

- Users with authentication
- Friend relationships
- Channels and memberships
- Messages and chat history

## Development

To work on this project:

1. Make sure the database is set up and migrations are current
2. Use `npm run dev` for development with auto-reload
3. Check the Swagger docs for API testing
4. WebSocket testing can be done via the frontend or tools like wscat

## Notes

This is part of the larger ft_transcendence project. The frontend is located in the `/frontend` directory and includes HTML/JS files for testing the API endpoints.

For production deployment, make sure to:
- Set proper JWT secrets
- Configure appropriate CORS settings
- Set up proper logging
- Consider using a more robust database like PostgreSQL
