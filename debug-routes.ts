import express from 'express';
import { registerRoutes } from './api/server/routes.js';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);

(async () => {
  await registerRoutes(httpServer, app);
  
  console.log("Registered Routes:");
  app._router.stack.forEach((r: any) => {
    if (r.route && r.route.path) {
      console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    }
  });
  process.exit(0);
})();
