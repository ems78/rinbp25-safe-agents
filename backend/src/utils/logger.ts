import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment variables with defaults
const config = {
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  maxFileSize: parseInt(process.env.LOG_MAX_SIZE || '5242880', 10), // 5MB default
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
  logDir: process.env.LOG_DIR || path.join(__dirname, '../../logs')
};

// Ensure log directory exists
try {
  if (!fs.existsSync(config.logDir)) {
    fs.mkdirSync(config.logDir, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create log directory:', error);
  process.exit(1);
}

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const { timestamp, level, message, metadata } = info;
    const meta = Object.keys(metadata || {}).length ? ` ${JSON.stringify(metadata)}` : '';
    return `${timestamp} ${level}: ${message}${meta}`;
  })
);

class Logger {
  private static instance: winston.Logger;
  private static initialized = false;

  public static getInstance(): winston.Logger {
    if (!Logger.instance) {
      const transports: winston.transport[] = [
        // Error log file
        new winston.transports.File({
          filename: path.join(config.logDir, 'error.log'),
          level: 'error',
          maxsize: config.maxFileSize,
          maxFiles: config.maxFiles,
          format: structuredFormat
        }),
        // Combined log file
        new winston.transports.File({
          filename: path.join(config.logDir, 'combined.log'),
          maxsize: config.maxFileSize,
          maxFiles: config.maxFiles,
          format: structuredFormat
        }),
        // Console transport
        new winston.transports.Console({
          level: config.environment === 'production' ? 'info' : 'debug',
          format: consoleFormat
        })
      ];

      Logger.instance = winston.createLogger({
        level: config.logLevel,
        transports,
        // Don't exit on error
        exitOnError: false
      });

      // Log startup message only once
      if (!Logger.initialized) {
        Logger.instance.info('Logger initialized', {
          environment: config.environment,
          logLevel: config.logLevel,
          logDir: config.logDir
        });
        Logger.initialized = true;
      }
    }
    return Logger.instance;
  }

  // Helper method to create a child logger with request context
  public static createRequestLogger(requestId: string): winston.Logger {
    return Logger.getInstance().child({ requestId });
  }
}

export const logger = Logger.getInstance(); 
