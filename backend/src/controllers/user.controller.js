import * as userService from '../services/user.service.js';

export async function getUserByUsernameController(request, reply) {
  try {
    const { username } = request.params;
    
    if (!username || username.trim() === '') {
      return reply.code(400).send({ 
        success: false,
        error: 'Username parameter is required' 
      });
    }

    const user = await userService.getUserByUsernameService(username.trim());
    
    if (!user) {
      return reply.code(404).send({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    return reply.code(200).send({ 
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by username error:', error);
    return reply.code(500).send({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
}

export async function getUserByIdController(request, reply) {
  try {
    const { id } = request.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return reply.code(400).send({ 
        success: false,
        error: 'Invalid user ID' 
      });
    }

    const user = await userService.getUserByIdService(userId);
    
    if (!user) {
      return reply.code(404).send({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    return reply.code(200).send({ 
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return reply.code(500).send({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
}
