import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { json } from 'body-parser';
import { Repository } from 'typeorm';
import usersRoutes from '../users.routes';
import { User } from '../../models/User';

// Skip creating a complex type and just use a simpler approach
type MockFn = ReturnType<typeof vi.fn>;

// Mock the database
vi.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: vi.fn()
  }
}));

// Import after mocking
import { AppDataSource } from '../../config/database';

describe('Users API', () => {
  // Create a simple Express app for testing
  const app = express();
  app.use(json());
  app.use('/api/users', usersRoutes);

  // Type for repository functions
  let mockFind: MockFn;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Re-setup the mock for each test with simpler typing
    mockFind = vi.fn().mockImplementation(() => Promise.resolve([]));
    
    // Use a direct object with any cast - TypeORM's type system is complex
    // and creating perfect type compatibility is difficult for testing
    vi.mocked(AppDataSource.getRepository).mockReturnValue({
      find: mockFind,
      findOne: vi.fn().mockImplementation(() => Promise.resolve({})),
      save: vi.fn().mockImplementation((data) => Promise.resolve(data)),
      create: vi.fn().mockImplementation((data) => data)
    } as unknown as Repository<User>);
  });

  it('should return users list when found', async () => {
    // Mock data
    const mockUsers = [
      { id: 1, name: 'Alice', is_parent: false },
      { id: 2, name: 'Bob', is_parent: true }
    ];

    // Setup the mock response
    mockFind.mockImplementation(() => Promise.resolve(mockUsers));

    // Make the request
    const response = await request(app).get('/api/users');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
    expect(mockFind).toHaveBeenCalled();
  });

  it('should return 500 when database error occurs', async () => {
    // Setup the mock to throw an error
    mockFind.mockImplementation(() => Promise.reject(new Error('Database connection failed')));

    // Make the request
    const response = await request(app).get('/api/users');

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
});