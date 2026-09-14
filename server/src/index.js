import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  await connectDB();
  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] eCampus ELO Portal API listening on http://localhost:${env.port}/api (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n[api] ${signal} received — shutting down gracefully`);
    server.close(() => process.exit(0));
  };
  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] Failed to start:', err.message);
  process.exit(1);
});
