import 'reflect-metadata'; // Add this import at the top
import dotenv from 'dotenv';
import { beforeAll, afterAll } from 'vitest';
import { AppDataSource } from './config/database';

// Load environment variables from .env file
dotenv.config();

// Set the NODE_ENV environment variable to 'test' if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Create a global setup and teardown for tests that require database access
beforeAll(async () => {
  // Initialize the database connection if not already initialized
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  // Close the database connection if it's initialized
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

// Add global mocks if needed
// vi.mock('./some-module', () => ({
//   someFunction: vi.fn()
// }));