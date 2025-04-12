// src/routes/__tests__/missingOperand.routes.tests.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { json } from 'body-parser';
import { AppDataSource } from '../../config/database';
import sessionsRoutes from '../sessions.routes';
import { User } from '../../models/User';
import { ExerciseSession } from '../../models/ExerciseSession';
import { ProblemAttempt } from '../../models/ProblemAttempt';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProblemStatistic } from '../../models/ProblemStatistic';

// Mock the database
vi.mock('../../config/database');

// Helper to create a test app
function createTestApp(): express.Application {
  const app = express();
  app.use(json());
  app.use('/api/sessions', sessionsRoutes);
  return app;
}

// Types for our mocks
interface MockUser {
  id: number;
  name: string;
}

interface MockSession {
  id: number;
  user_id: number;
  total_problems: number;
  completed_problems: number;
  is_completed: boolean;
  problem_type: string;
  user: MockUser;
}

interface MockProblem {
  id: number;
  session_id: number;
  factor1: number;
  factor2: number;
  problem_type: string;
  missing_operand_position: string | null;
  is_correct: boolean | null;
  response_time_ms: number | null;
  user_answer: number | null;
  attempt_number: number;
  session: MockSession;
}

// Type for query builder
type MockQueryBuilder = {
  [K in keyof SelectQueryBuilder<Record<string, unknown>>]: ReturnType<typeof vi.fn>;
} & {
  innerJoin: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  andWhere: ReturnType<typeof vi.fn>;
  orderBy: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  getMany: ReturnType<typeof vi.fn>;
  offset: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  addSelect: ReturnType<typeof vi.fn>;
  from: ReturnType<typeof vi.fn>;
  groupBy: ReturnType<typeof vi.fn>;
  addGroupBy: ReturnType<typeof vi.fn>;
  getRawMany: ReturnType<typeof vi.fn>;
  getRawOne: ReturnType<typeof vi.fn>;
};

describe('Missing Operand API Integration Tests', () => {
  let app: express.Application;
  let mockUser: MockUser;
  let mockSession: MockSession;
  let mockProblem: MockProblem;
  
  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();
    
    // Mock user
    mockUser = { id: 1, name: 'Test User' };
    
    // Mock session
    mockSession = {
      id: 1,
      user_id: 1,
      total_problems: 5,
      completed_problems: 0,
      is_completed: false,
      problem_type: 'missing_factor',
      user: mockUser
    };
    
    // Mock problem with missing first operand
    mockProblem = {
      id: 101,
      session_id: 1,
      factor1: 0, // This will be null in the actual response
      factor2: 6,
      problem_type: 'missing_factor',
      missing_operand_position: 'first',
      is_correct: null,
      response_time_ms: null,
      user_answer: null,
      attempt_number: 1,
      session: mockSession
    };
    
    // Mock repositories with proper types
    const mockUserRepo: Partial<Repository<User>> = {
      findOne: vi.fn().mockResolvedValue(mockUser),
    };
    
    const mockSessionRepo: Partial<Repository<ExerciseSession>> = {
      findOne: vi.fn().mockImplementation(({ where }) => {
        if (where?.id === 1) return Promise.resolve(mockSession as unknown as ExerciseSession);
        return Promise.resolve(null);
      }),
      create: vi.fn().mockReturnValue(mockSession as unknown as ExerciseSession),
      save: vi.fn().mockImplementation((session) => Promise.resolve({ ...session, id: 1 } as unknown as ExerciseSession)),
    };
    
    // Create a mock QueryBuilder
    const createMockQueryBuilder = (): MockQueryBuilder => {
      const queryBuilder = {
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
        offset: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        addGroupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([]),
        getRawOne: vi.fn().mockResolvedValue({ totalProblems: 0, correctProblems: 0 }),
      } as MockQueryBuilder;
      return queryBuilder;
    };
    
    const mockProblemRepo: Partial<Repository<ProblemAttempt>> = {
      findOne: vi.fn().mockImplementation(({ where }) => {
        if (where?.id === 101) return Promise.resolve(mockProblem as unknown as ProblemAttempt);
        return Promise.resolve(null);
      }),
      create: vi.fn().mockReturnValue(mockProblem as unknown as ProblemAttempt),
      save: vi.fn().mockImplementation((problem) => Promise.resolve({ ...problem, id: 101 } as unknown as ProblemAttempt)),
      createQueryBuilder: vi.fn().mockReturnValue(createMockQueryBuilder()),
    };
    
    const mockStatisticsRepo: Partial<Repository<ProblemStatistic>> = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((data) => data as ProblemStatistic),
      save: vi.fn().mockImplementation((stat) => Promise.resolve(stat as ProblemStatistic)),
    };
    
    // Mock getRepository to return appropriate repositories with proper type casting
    vi.mocked(AppDataSource.getRepository).mockImplementation((entity) => {
      if (entity === User) return mockUserRepo as Repository<User>;
      if (entity === ExerciseSession) return mockSessionRepo as Repository<ExerciseSession>;
      if (entity === ProblemAttempt) return mockProblemRepo as Repository<ProblemAttempt>;
      return mockStatisticsRepo as Repository<ProblemStatistic>;
    });
    
    // Mock problem selector
    vi.mock('../../services/problemSelection/selection', () => ({
      problemSelector: {
        selectNextProblem: vi.fn().mockResolvedValue({
          factor1: null,
          factor2: 6,
          problemType: 'missing_factor',
          missingOperandPosition: 'first'
        }),
        updateProblemAfterAttempt: vi.fn().mockResolvedValue(undefined),
        getProblemState: vi.fn().mockResolvedValue({ weight: 10, lastSeen: 0 }),
      }
    }));
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('Session Creation with Missing Factor Problem Type', () => {
    it('should create a session with missing_factor problem type', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          userId: 1,
          totalProblems: 5,
          problemType: 'missing_factor'
        });
        
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('problem_type', 'missing_factor');
    });
    
    it('should reject invalid problem types', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          userId: 1,
          totalProblems: 5,
          problemType: 'invalid_type'
        });
        
      expect(response.status).toBe(400);
    });
  });
  
  describe('Problem Selection', () => {
    it('should return a missing operand problem', async () => {
      const response = await request(app)
        .get('/api/sessions/1/problems/next');
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('problemType', 'missing_factor');
      expect(response.body).toHaveProperty('missingOperandPosition', 'first');
      expect(response.body.factor1).toBeNull();
      expect(response.body.factor2).toBe(6);
    });
  });
  
  describe('Problem Submission', () => {
    it('should correctly evaluate a missing first operand problem', async () => {
      // For a problem like "? × 6 = 36", the correct answer is 6
      const response = await request(app)
        .post('/api/sessions/1/attempts')
        .send({
          problemId: 101,
          answer: 6,
          responseTimeMs: 3000
        });
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isCorrect', true);
    });
    
    it('should correctly evaluate an incorrect answer', async () => {
      const response = await request(app)
        .post('/api/sessions/1/attempts')
        .send({
          problemId: 101,
          answer: 5, // Wrong answer
          responseTimeMs: 3000
        });
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isCorrect', false);
      expect(response.body).toHaveProperty('correctAnswer', 6);
    });
  });
});