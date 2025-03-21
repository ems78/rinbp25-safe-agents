import mongoose from 'mongoose';
import neo4j from 'neo4j-driver';
import { logger } from '../utils/logger.js';

export async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function connectNeo4j() {
  try {
    const driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
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

