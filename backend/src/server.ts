/**
 * server.ts — Entry point. Connects to DB, initializes Firebase, starts the HTTP server.
 */
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { initFirebase } from './config/firebase';
import app from './app';

async function start() {
  // Initialize Firebase Admin SDK before handling any requests
  initFirebase();

  // Connect to MongoDB Atlas
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    console.log(`[server] GRIDSHIELD AI Backend running on port ${ENV.PORT} (${ENV.NODE_ENV})`);
    console.log(`[server] Health check: http://localhost:${ENV.PORT}/api/v1/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[server] ${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const { disconnectDB } = await import('./config/db');
      await disconnectDB();
      console.log('[server] Shutdown complete.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
