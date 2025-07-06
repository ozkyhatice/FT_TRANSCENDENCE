# Pong Game - ft_transcendence

A modern multiplayer Pong game built with a RESTful API backend and a responsive frontend. This project includes user authentication, friend system, real-time chat, and multiplayer game functionality.

## 🏗️ Project Structure

```
pong-game/
├── backend/              # Node.js API Server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middlewares/  # Custom middleware
│   │   ├── sockets/      # WebSocket handlers
│   │   ├── schemas/      # Validation schemas
│   │   ├── auth/         # Authentication utilities
│   │   ├── db/           # Database client
│   │   └── handlers/     # Error handlers
│   ├── prisma/           # Database schema and migrations
│   │   ├── schema.prisma # Database schema
│   │   ├── migrations/   # Database migrations
│   │   └── dev.db        # SQLite database file
│   └── package.json
└── frontend/             # Vite + TypeScript Frontend
    ├── src/
    │   ├── components/   # UI Components
    │   │   ├── auth/     # Authentication components
    │   │   ├── chat/     # Chat components
    │   │   ├── game/     # Game components
    │   │   └── profile/  # Profile components
    │   └── lib/          # API clients and utilities
    │       ├── api.ts    # Main API exports
    │       ├── auth-api.ts    # Authentication API
    │       ├── friends-api.ts # Friends API
    │       ├── messages-api.ts # Messages API
    │       ├── websocket.service.ts # WebSocket service
    │       └── types.ts  # TypeScript type definitions
    ├── public/           # Static assets
    └── package.json
```

## 🚀 Features

- **User Authentication**: JWT-based authentication system with secure login/register
- **Friend System**: Add/remove friends, send/accept/reject friend requests
- **Real-time Chat**: Private messaging between friends with real-time updates
- **User Profiles**: Profile management with avatar, wins/losses stats
- **Database Management**: SQLite database with Prisma ORM and migrations
- **RESTful API**: Well-structured API with proper error handling
- **Real-time Communication**: WebSocket support for live chat features
- **Component Architecture**: Modular frontend components for auth, chat, game, and profile
- **Type Safety**: Full TypeScript support for better development experience

## 🛠️ Tech Stack

### Backend
- **Framework**: Fastify (Node.js)
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with @fastify/jwt
- **Real-time**: Socket.IO and @fastify/websocket
- **CORS**: @fastify/cors for cross-origin requests
- **Security**: bcrypt for password hashing
- **Development**: nodemon for auto-reload

### Frontend
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Architecture**: Component-based with modular structure
- **API Client**: Organized API modules for different features

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

## ⚙️ Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (Change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Origins (automatically allows all localhost origins)
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
```

### Frontend Environment Variables (Optional)

Create a `.env` file in the `frontend/` directory if needed:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000

# WebSocket URL
VITE_WS_URL=ws://localhost:3000
```

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/cantasar/pong-game
cd pong-game
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env  # Edit the .env file with your settings

# Setup database
npx prisma generate
npx prisma migrate dev

# Optional: Seed the database (if you have seed data)
# npx prisma db seed
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## 🏃‍♂️ Running the Application

### Development Mode

You'll need **two terminal windows/tabs** to run both servers:

#### Terminal 1 - Backend Server

```bash
cd backend

# Start the development server with auto-reload
npm run dev

# Or start the production server
npm start
```

The backend server will start on `http://localhost:3000`

#### Terminal 2 - Frontend Server

```bash
cd frontend

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Build

#### Backend Production

```bash
cd backend
npm start
```

#### Frontend Production

```bash
cd frontend

# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📚 API Documentation

The API includes the following main endpoints:

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Friends Routes (`/api/friends`) 
- `GET /api/friends` - Get user's friends list
- `POST /api/friends/request` - Send friend request
- `GET /api/friends/requests` - Get pending friend requests
- `PUT /api/friends/requests/:id` - Accept/reject friend request
- `GET /api/friends/user/:username` - Find user by username

### Chat Routes (`/api/chat`)
- `GET /api/chat/messages/:userId` - Get messages with specific user
- `POST /api/chat/messages` - Send a message

### User Routes (`/api/users`)
- `GET /api/users/:id` - Get user by ID

For detailed API documentation with request/response examples, refer to the individual route files in `backend/src/routes/`.

## 🎮 Usage

1. **Start both servers** (backend and frontend)
2. **Open your browser** and navigate to `http://localhost:5173`
3. **Register a new account** or login with existing credentials
4. **Add friends** by searching usernames and sending friend requests
5. **Accept friend requests** from other users
6. **Start chatting** with your friends in real-time
7. **View profiles** to see user stats (wins/losses)

### Key Features Available:
- **Real-time messaging** between friends
- **Friend request system** with pending/accepted states
- **User search** functionality
- **Profile management** with avatar and stats
- **Responsive design** that works on different screen sizes

## 🔧 Database Management

### Prisma Commands

```bash
cd backend

# View your data in Prisma Studio
npx prisma studio

# Reset the database (⚠️ This will delete all data)
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate dev

# Generate Prisma client after schema changes
npx prisma generate
```

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Make sure ports 3000 and 5173 are not being used by other applications
   - Change the ports in the respective configuration files if needed

2. **Database connection issues**
   - Ensure the DATABASE_URL in your `.env` file is correct
   - Run `npx prisma migrate dev` to apply migrations
   - Check if the SQLite database file exists in `backend/prisma/dev.db`

3. **CORS errors**
   - The backend is configured to allow all localhost origins automatically
   - If you're still getting CORS errors, check the console for specific error messages

4. **JWT authentication fails**
   - Make sure JWT_SECRET is set in your backend `.env` file
   - Clear browser localStorage and try logging in again

5. **TypeScript compilation errors**
   - Run `npm run build` in the frontend directory to check for TypeScript errors
   - Make sure all dependencies are installed correctly

6. **WebSocket connection issues**
   - Ensure both servers are running
   - Check browser console for WebSocket connection errors

### Reset Everything

If you encounter persistent issues:

```bash
# Reset backend
cd backend
rm -rf node_modules
npm install
npx prisma migrate reset
npx prisma generate

# Reset frontend  
cd frontend
rm -rf node_modules dist
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Happy Gaming! 🎮🏓**
