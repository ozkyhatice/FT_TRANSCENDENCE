const errorHandler = (error, request, reply) => {
    if (error.validation) {
      const validationError = error.validation[0];
      let errorMessage;
  
      // Make field names more readable, e.g., "Password" from "/password" or "password"
      const fieldName = (path) => {
        if (!path) return '';
        const name = path.startsWith('/') ? path.substring(1) : path;
        return name.charAt(0).toUpperCase() + name.slice(1);
      };
  
      switch (validationError.keyword) {
        case 'minLength':
          errorMessage = `${fieldName(validationError.instancePath)} must be at least ${validationError.params.limit} characters.`;
          break;
        case 'maxLength':
          errorMessage = `${fieldName(validationError.instancePath)} must not exceed ${validationError.params.limit} characters.`;
          break;
        case 'required':
          errorMessage = `${fieldName(validationError.params.missingProperty)} is required.`;
          break;
        default:
          errorMessage = validationError.message || 'Invalid input provided.';
          break;
      }
      return reply.code(400).send({ error: errorMessage });
    }
  
    request.log.error(error);
    // For other errors, send a generic response
    return reply.status(500).send({ error: 'Internal Server Error' });
  };
  
  export default errorHandler; 