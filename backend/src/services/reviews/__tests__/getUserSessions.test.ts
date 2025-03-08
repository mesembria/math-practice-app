// src/services/reviews/__tests__/getUserSessions.test.ts

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { getUserSessions } from '../getUserSessions';
import { AppDataSource } from '../../../config/database';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';


type MockQueryBuilderReturn = {
  getMany: Mock;
  getRawMany: Mock;
  offset: Mock;
  limit: Mock;
  getCount: Mock;
  where: Mock;
  andWhere: Mock;
  orderBy: Mock;
  addOrderBy: Mock;
  groupBy: Mock;
  select: Mock;
  addSelect: Mock;
  from: Mock;
};

// Mock the database
vi.mock('../../../config/database', () => ({
  AppDataSource: {
    getRepository: vi.fn(),
    createQueryBuilder: vi.fn()
  }
}));

describe('getUserSessions', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return empty sessions array when no sessions exist', async () => {
    // Mock repository count query
    const mockCount = vi.fn().mockResolvedValue(0);
    const mockWhere = vi.fn().mockReturnValue({ getCount: mockCount });
    const mockCreateQueryBuilder = vi.fn().mockReturnValue({ where: mockWhere });
    
    vi.mocked(AppDataSource.getRepository).mockReturnValue({
      createQueryBuilder: mockCreateQueryBuilder
    } as unknown as Repository<ObjectLiteral>);

    const result = await getUserSessions(1, 1, 10);

    expect(result).toEqual({
      sessions: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalSessions: 0
      }
    });
    expect(mockWhere).toHaveBeenCalledWith('session.user_id = :userId', { userId: 1 });
  });

  it('should correctly format session data and handle pagination', async () => {
    // Mock data
    const mockSessions = [
      { 
        id: 1, 
        start_time: new Date('2023-05-01T10:00:00Z'), 
        end_time: new Date('2023-05-01T10:15:00Z'),
        total_problems: 10,
        completed_problems: 10,
        is_completed: true
      },
      { 
        id: 2, 
        start_time: new Date('2023-05-02T10:00:00Z'), 
        end_time: new Date('2023-05-02T10:20:00Z'),
        total_problems: 15,
        completed_problems: 15,
        is_completed: true
      }
    ];

    const mockPerformance = [
      { sessionId: '1', totalProblems: '10', correctProblems: '8', avgResponseTime: '3500' },
      { sessionId: '2', totalProblems: '15', correctProblems: '12', avgResponseTime: '4200' }
    ];

    const mockMissedProblems = [
      { sessionId: '1', factor1: 6, factor2: 7, userAnswer: 41, responseTime: 5000 },
      { sessionId: '1', factor1: 8, factor2: 9, userAnswer: 71, responseTime: 6000 }
    ];

    // Mock repository queries
    const mockGetMany = vi.fn()
      .mockResolvedValueOnce(mockSessions) // For sessions query
      .mockResolvedValueOnce(mockPerformance) // For performance query
      .mockResolvedValueOnce(mockMissedProblems); // For missed problems query

    // Repository mocks
    const mockCount = vi.fn().mockResolvedValue(5); // 5 total sessions
    const repositoryMocks: MockQueryBuilderReturn = {
      getMany: mockGetMany,
      getRawMany: mockGetMany,
      offset: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      getCount: mockCount,
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis()
    };

    vi.mocked(AppDataSource.getRepository).mockReturnValue({
      createQueryBuilder: vi.fn().mockReturnValue(repositoryMocks)
    } as unknown as Repository<ObjectLiteral>);

    vi.mocked(AppDataSource.createQueryBuilder).mockReturnValue(
      repositoryMocks as unknown as SelectQueryBuilder<ObjectLiteral>
    );

    // Execute function
    const result = await getUserSessions(1, 1, 10);

    // Assertions
    expect(result.sessions).toHaveLength(2);
    expect(result.pagination).toEqual({
      currentPage: 1,
      totalPages: 1,
      totalSessions: 5
    });

    // Check first session
    const session1 = result.sessions[0];
    expect(session1.id).toBe(1);
    expect(session1.accuracy).toBe(80); // 8/10 * 100
    expect(session1.totalProblems).toBe(10);
    expect(session1.correctProblems).toBe(8);
    expect(session1.averageResponseTime).toBe(3500);
    expect(session1.missedProblems).toHaveLength(2);
    
    // Check a missed problem
    const missedProblem = session1.missedProblems[0];
    expect(missedProblem.factor1).toBe(6);
    expect(missedProblem.factor2).toBe(7);
    expect(missedProblem.correctAnswer).toBe(42); // 6 * 7
    expect(missedProblem.userAnswer).toBe(41);
  });

  it('should handle invalid parameters gracefully', async () => {
    // Test with invalid userId
    await expect(getUserSessions(NaN, 1, 10)).rejects.toThrow('Invalid userId provided');

    // Negative page should be converted to 1
    const mockCount = vi.fn().mockResolvedValue(0);
    const mockWhere = vi.fn().mockReturnValue({ getCount: mockCount });
    
    vi.mocked(AppDataSource.getRepository).mockReturnValue({
      createQueryBuilder: vi.fn().mockReturnValue({ where: mockWhere })
    } as unknown as Repository<ObjectLiteral>);

    const result = await getUserSessions(1, -5, 10);
    expect(result.pagination.currentPage).toBe(1);
  });
});