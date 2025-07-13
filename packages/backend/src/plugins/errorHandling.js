const Boom = require('@hapi/boom');

/**
 * Hapi.js plugin for centralized error handling.
 * It catches errors thrown by route handlers and returns appropriate Boom errors.
 */
const errorHandlingPlugin = {
  name: 'error-handling',
  version: '1.0.0',
  register: async (server) => {
    server.ext('onPreResponse', (request, h) => {
      const { response } = request;

      if (response.isBoom) {
        // If it's already a Boom error, return it as is
        return h.continue;
      }

      if (response instanceof Error) {
        // Log the original error for debugging purposes
        console.error('Unhandled error:', response.message, response.stack);

        // Return a generic 500 error for unhandled exceptions
        return Boom.internal('An unexpected error occurred');
      }

      return h.continue;
    });
  },
};

module.exports = errorHandlingPlugin;
