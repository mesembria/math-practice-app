// src/services/reviews/getSessionMissedProblems.ts

import { AppDataSource } from '../../config/database';
import { MissedProblem } from '../../types/sessionReview.types';

/**
 * Retrieves all problems that were missed in a specific session
 * 
 * @param sessionId The ID of the session to query
 * @returns Array of missed problem objects containing factors, answers, and response time
 */
export async function getSessionMissedProblems(sessionId: number): Promise<MissedProblem[]> {
  try {
    // Validate sessionId
    if (isNaN(sessionId) || sessionId <= 0) {
      throw new Error('Invalid sessionId provided');
    }

    // Query to find all incorrect attempts in the specified session
    const missedProblems = await AppDataSource
      .createQueryBuilder()
      .select([
        'attempt.factor1',
        'attempt.factor2',
        'attempt.user_answer as userAnswer',
        'attempt.response_time_ms as responseTime'
      ])
      .from('problem_attempts', 'attempt')
      .where('attempt.session_id = :sessionId', { sessionId })
      .andWhere('attempt.is_correct = 0') // Only include incorrect attempts
      .orderBy('attempt.created_at', 'ASC') // Order by creation timestamp
      .getRawMany();
    
    // Format the results, adding the correct answer
    return missedProblems.map(problem => ({
      factor1: problem.factor1,
      factor2: problem.factor2,
      userAnswer: problem.userAnswer,
      correctAnswer: problem.factor1 * problem.factor2, // Calculate correct answer
      responseTime: Math.round(problem.responseTime || 0)
    }));
  } catch (error) {
    console.error('Error getting missed problems in session:', error);
    throw error;
  }
}