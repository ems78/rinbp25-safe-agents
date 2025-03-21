import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
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

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/attack-patterns', attackPatternRoutes);

// Global error handler
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
};

app.use(errorHandler);

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
