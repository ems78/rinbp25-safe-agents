import mongoose from 'mongoose';
import neo4j, { Driver } from 'neo4j-driver';
import { logger } from '../utils/logger.js';

declare global {
  var neo4jDriver: Driver | undefined;
}

export async function connectMongoDB(): Promise<void> {
  try {
    const options = {
      auth: {
        username: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD
      },
      authSource: 'admin',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1
    };
    
    await mongoose.connect(process.env.MONGODB_URI as string, options);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function connectNeo4j(): Promise<void> {
  try {
    const driver = neo4j.driver(
      process.env.NEO4J_URI as string,
      neo4j.auth.basic(
        process.env.NEO4J_USER as string,
        process.env.NEO4J_PASSWORD as string
      )
    );
    
    // Verify connection
    await driver.verifyConnectivity();
    logger.info('Neo4j connected successfully');
    
    // Make driver available globally
    global.neo4jDriver = driver;
  } catch (error) {
    logger.error('Neo4j connection error:', error);
    throw error;
  }
} 
