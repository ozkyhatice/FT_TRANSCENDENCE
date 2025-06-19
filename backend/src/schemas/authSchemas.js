const loginSchema = {
    summary: 'Login a user',
    tags: ['Auth'],
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string' },
        password: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          token: { type: 'string' }
        }
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }

  const getMeSchema = {
    summary: 'Get current user info',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          username: { type: 'string' }
        }
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }

const postMeSchema = {
  summary: 'Update current user info',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }
}
const registerSchema = {
    summary: 'Register a new user',
    tags: ['Auth'],
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { 
            type: 'string',
            minLength: 3,
            maxLength: 20,
            description: 'Username must be between 3-20 characters'
        },
        password: { 
            type: 'string',
            minLength: 6,
            description: 'Password must be at least 6 characters'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }

const putMeSchema = {
  summary: 'Update current user info',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    }
  }
}
export { loginSchema, getMeSchema, postMeSchema, registerSchema, putMeSchema };