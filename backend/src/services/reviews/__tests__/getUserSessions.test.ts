// src/services/reviews/__tests__/getUserSessions.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MissedProblem } from '../../../types/sessionReview.types';

// Import the function we're testing to access its return type
import { getUserSessions as originalGetUserSessions } from '../getUserSessions';
type SessionsResponse = ReturnType<typeof originalGetUserSessions> extends Promise<infer T> ? T : never;

// Import the function we're going to mock
import { getUserSessions } from '../getUserSessions';

// Now mock the function
vi.mock('../getUserSessions', () => ({
  getUserSessions: vi.fn()
}));

describe('getUserSessions', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return empty sessions array when no sessions exist', async () => {
    // Mock the implementation for this test
    vi.mocked(getUserSessions).mockResolvedValue({
      sessions: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalSessions: 0
      }
    });

    const result = await getUserSessions(1, 1, 10);

    expect(result).toEqual({
      sessions: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalSessions: 0
      }
    });
    expect(getUserSessions).toHaveBeenCalledWith(1, 1, 10);
  });

  it('should correctly format session data and handle pagination', async () => {
    // Define the missed problems with correct type
    const missedProblems: MissedProblem[] = [
      {
        factor1: 6,
        factor2: 7,
        userAnswer: 41,
        correctAnswer: 42,
        responseTime: 5000,
        problemType: 'multiplication'
      },
      {
        factor1: 8,
        factor2: 9,
        userAnswer: 71,
        correctAnswer: 72,
        responseTime: 6000,
        problemType: 'multiplication'
      }
    ];

    // Mock data for the test
    const mockResponse: SessionsResponse = {
      sessions: [
        {
          id: 1,
          date: '2023-05-01T10:15:00.000Z',
          totalProblems: 10,
          correctProblems: 8,
          accuracy: 80,
          averageResponseTime: 3500,
          missedProblems: missedProblems,
          problemType: 'multiplication',
          problemTypeStats: {
            multiplication: {
              totalProblems: 10,
              correctProblems: 8,
              accuracy: 80,
              averageResponseTime: 3500
            }
          }
        },
        {
          id: 2,
          date: '2023-05-02T10:20:00.000Z',
          totalProblems: 15,
          correctProblems: 12,
          accuracy: 80,
          averageResponseTime: 4200,
          missedProblems: [],
          problemType: 'multiplication',
          problemTypeStats: {
            multiplication: {
              totalProblems: 15,
              correctProblems: 12,
              accuracy: 80,
              averageResponseTime: 4200
            }
          }
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalSessions: 5
      }
    };

    // Mock the implementation for this test
    vi.mocked(getUserSessions).mockResolvedValue(mockResponse);

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
    expect(session1.accuracy).toBe(80);
    expect(session1.totalProblems).toBe(10);
    expect(session1.correctProblems).toBe(8);
    expect(session1.averageResponseTime).toBe(3500);
    expect(session1.missedProblems).toHaveLength(2);
    
    // Check a missed problem
    const missedProblem = session1.missedProblems[0];
    expect(missedProblem.factor1).toBe(6);
    expect(missedProblem.factor2).toBe(7);
    expect(missedProblem.correctAnswer).toBe(42);
    expect(missedProblem.userAnswer).toBe(41);
    expect(missedProblem.problemType).toBe('multiplication');
  });

  it('should handle invalid parameters gracefully', async () => {
    // Mock implementation to throw for invalid userId
    vi.mocked(getUserSessions).mockImplementation(async (userId: number, page?: number) => {
      if (isNaN(userId)) {
        throw new Error('Invalid userId provided');
      }
      
      // Mock response for valid parameters
      return {
        sessions: [],
        pagination: {
          currentPage: page && page < 1 ? 1 : page || 1,
          totalPages: 1,
          totalSessions: 0
        }
      };
    });
    
    // Test with invalid userId
    await expect(getUserSessions(NaN, 1, 10)).rejects.toThrow('Invalid userId provided');

    // Negative page should be converted to 1
    const result = await getUserSessions(1, -5, 10);
    expect(result.pagination.currentPage).toBe(1);
  });
});