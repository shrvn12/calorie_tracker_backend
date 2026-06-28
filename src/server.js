// src/server.js
import 'dotenv/config';
import app from './app.js';
import { logger } from './utils/logger.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Verify DB connection
    await prisma.$connect();
    logger.info('Database connected');

    app.listen(PORT, () => {
      logger.info({ port: PORT, env: process.env.NODE_ENV }, '🚀 Server started');
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

start();
