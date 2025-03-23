import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { connectMongoDB, connectNeo4j } from './config/database.js';
import { logger } from './utils/logger.js';
import attackPatternRoutes from './routes/attackPatternRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/attack-patterns', attackPatternRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test error route
app.get('/test-error', (_req: Request, _res: Response) => {
  throw new Error('Test error for logging');
});

// 404 handler - must be before error handler
app.use((req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body
  });
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler - must be last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.body
    }
  });
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Initialize database connections and start server
async function startServer(): Promise<void> {
  try {
    await connectMongoDB();
    await connectNeo4j();

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 
