


# Pong Game API — ft_transcendence Backend

## 🎯 Project Overview

This is the backend system for the **ft_transcendence** Pong Game platform.  
It includes core features such as:

- ✅ User Authentication (JWT-based)
- ✅ User Profile Management
- ✅ Friend System (add, view, respond)
- ✅ Protected Routes with JWT
- ✅ Swagger Documentation for API Testing

---

## 🚀 Technologies Used

| Tech          | Purpose                           |
|---------------|-----------------------------------|
| Node.js       | Server runtime                    |
| Fastify       | Lightweight web framework         |
| SQLite        | Lightweight relational database   |
| Prisma ORM    | Type-safe database operations     |
| JWT           | Authentication                    |
| Bcrypt        | Password hashing                  |
| Swagger       | API Documentation & Testing       |

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/cantasar/pong-game-api.git
cd pong-game-api/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
PORT=3000
JWT_SECRET=your_super_secret
DATABASE_URL="file:./prisma/dev.db"
```

### 4. Setup Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the Server

```bash
npm run dev
```

➡️ Server runs at: `http://localhost:3000`

---

## 📚 Swagger API Documentation

Visit the live documentation at:  
➡️ `http://localhost:3000/docs`

### 🔑 Authorize with JWT:

1. Register or login to get a token.
2. Click **Authorize** (top-right in Swagger UI)
3. Enter:
   ```
   Bearer <your_token>
   ```

---

## 🔐 Features Overview

### ✅ Authentication

- `POST /register` – Create new user  
- `POST /login` – Authenticate and receive JWT

### ✅ Authenticated User

- `GET /me` – Get current user info  
- `POST /me` – Update user info (username, password)

### 🧑‍🤝‍🧑 Friend System

- `POST /friends/:targetId` – Send friend request  
- `GET /friends` – Get all accepted friends  
- `GET /friends/requests` – View incoming pending requests  
- `PATCH /friends/:id` – Accept or reject a friend request  
  - Body: `{ "action": "accept" }` or `{ "action": "reject" }`

---

## 📬 Example Usage (with curl)

### 🔐 Register

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "can", "password": "123456"}'
```

### 🔐 Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "can", "password": "123456"}'
```

### 🧾 Get Profile

```bash
curl -X GET http://localhost:3000/me \
  -H "Authorization: Bearer <your_token>"
```

### 🧑‍🤝‍🧑 Send Friend Request

```bash
curl -X POST http://localhost:3000/friends/2 \
  -H "Authorization: Bearer <your_token>"
```

---

## ✅ Next Steps (Planned)

- 🎮 Game Session & Match History
- 💬 Real-time Chat (Socket.io)
- 🌐 Google OAuth Login
- 🔐 2FA with TOTP