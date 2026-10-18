import mongoose from 'mongoose';
import { MONGODB_URI, GAME_NAME } from './config.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[${GAME_NAME}] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[${GAME_NAME}] MongoDB Connection Error: ${error.message}`);
    console.warn(`[${GAME_NAME}] Warning: Running with local DB connection warning. Ensure MongoDB is active.`);
    // Return null rather than exiting so test suites or fallbacks can proceed gracefully
    return null;
  }
};

export default connectDB;
