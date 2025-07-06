export const getUserByUsernameSchema = {
  description: 'Get user by username',
  tags: ['users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 1,
        description: 'Username to get user for'
      }
    },
    required: ['username']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    },
    404: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    }
  }
};

export const getUserByIdSchema = {
  description: 'Get user by ID',
  tags: ['users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'User ID'
      }
    },
    required: ['id']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    },
    404: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    }
  }
};
