import prisma from '../db/client.js';
import bcrypt from 'bcrypt';
import * as authService from '../services/auth.service.js';

export async function registerController(request, reply) {
  try {
    const { username, password } = request.body;
    const { user, token } = await authService.registerUserService(username, password, request);

    return reply.code(201).send({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    return reply.code(500).send({ error: error.message || 'Internal server error' });
  }
}

export async function loginController(request, reply) {
  try {
    const { username, password } = request.body;
    const { user, token } = await authService.loginUserService(username, password, request);
    
    return reply.code(200).send({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    return reply.code(500).send({ error: error.message });
  }
}

export async function meController(request, reply) {
  try {
    const { userId } = request.user;
    
    const user = await authService.getUserByIdService(userId);
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return reply.code(200).send({ username: user.username });
  } catch (error) {
    console.error('Get user error:', error);
    return reply.code(500).send({ error: 'Internal server error while fetching user data' });
  }
}

export async function updateMeController(request, reply) {
  try {
    const { userId } = request.user;
    const { username, password } = request.body;

    if (!username?.trim() && !password?.trim()) {
      return reply.code(400).send({ 
        error: 'At least one field (username or password) is required for update' 
      });
    }

    if (password && password.length < 6) {
      return reply.code(400).send({ error: 'Password must be at least 6 characters long' });
    }

    if (username) {
      const existingUser = await authService.getUserByUsernameService(username.trim());
      if (existingUser && existingUser.id !== userId) {
        return reply.code(400).send({ 
          error: 'Username is already taken' 
        });
      }
    }

    const updatedUser = await authService.updateUserService(userId, { username, password });

    return reply.code(200).send({
      message: 'User updated successfully',
      user: {
        username: updatedUser.username,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: 'User not found' });
    }
    return reply.code(500).send({ error: 'Failed to update user' });
  }
}