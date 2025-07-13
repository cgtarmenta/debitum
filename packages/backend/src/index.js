'use strict';

require('dotenv').config();
const Hapi = require('@hapi/hapi');
const { initializeDatabase } = require('./db');

/**
 * Initializes and starts the Hapi server.
 */
const createServer = async () => {
  await initializeDatabase();

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['http://localhost:5173'], // Allow requests from the frontend
        headers: ['Accept', 'Content-Type', 'Authorization'], // Allowed request headers
        exposedHeaders: ['Content-Disposition'], // Headers exposed to the client
        credentials: true
      }
    }
  });

  await server.register(require('./plugins/errorHandling'));

  const registerDebtRoutes = require('./routes/debtRoutes');
  registerDebtRoutes(server);

  return server;
};

const startServer = async () => {
  const server = await createServer();
  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = { createServer };
