import dotenv from 'dotenv';
dotenv.config();

/**
 * Centralized Backend Game Configuration
 * MANDATORY REQUIREMENT (Section 7 in VELoop Assignment)
 * Do not hardcode GAME_NAME across backend files.
 */
export const GAME_NAME = process.env.GAME_NAME || "BUBBLE BLAST ADVENTURE";
export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bubble_blast";
export const JWT_SECRET = process.env.JWT_SECRET || "bubble_blast_adventure_default_secret_key";
export const NODE_ENV = process.env.NODE_ENV || "development";

export default {
  GAME_NAME,
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  NODE_ENV
};
