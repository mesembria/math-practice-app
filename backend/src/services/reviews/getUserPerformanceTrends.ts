import { AppDataSource } from '../../config/database';
import { PerformanceTrends } from '../../types/sessionReview.types';

/**
 * Gets performance trend data for a user's practice history
 * Returns data for the most recent sessions (limited by maxSessions)
 * Filtered by the specified problem type
 * 
 * @param userId The ID of the user to get trends for
 * @param problemType The type of problem to filter statistics for ('multiplication', 'missing_factor', etc.)
 * @param maxSessions Maximum number of sessions to include in trends (default: 20)
 * @returns Object with sessions (dates), accuracy, and responseTime arrays
 */
export async function getUserPerformanceTrends(
  userId: number, 
  problemType: string,
  maxSessions: number = 20
): Promise<PerformanceTrends> {
  try {
    // Validate userId
    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid userId provided');
    }
    
    // Validate problemType
    if (!problemType) {
      throw new Error('Problem type is required');
    }
    
    // Get list of completed sessions for this user, ordered by most recent first
    const sessions = await AppDataSource
      .getRepository('exercise_sessions')
      .createQueryBuilder('session')
      .select(['session.id', 'session.start_time', 'session.end_time', 'session.problem_type'])
      .where('session.user_id = :userId', { userId })
      .andWhere('session.is_completed = 1') // Only include completed sessions
      .andWhere('session.problem_type = :problemType', { problemType }) // Filter by problem type
      .orderBy('session.end_time', 'DESC') // Order by end_time descending (newest first)
      .limit(maxSessions)
      .getMany();

    // Early return if no sessions found
    if (!sessions.length) {
      return {
        sessions: [],
        accuracy: [],
        responseTime: []
      };
    }

    // Get session IDs for the query
    const sessionIds = sessions.map(session => session.id);

    // Query to get overall performance metrics for each session
    const sessionPerformance = await AppDataSource
      .createQueryBuilder()
      .select('attempt.session_id', 'sessionId')
      .addSelect('COUNT(*)', 'totalProblems')
      .addSelect('SUM(CASE WHEN attempt.is_correct = 1 THEN 1 ELSE 0 END)', 'correctProblems')
      .addSelect('AVG(attempt.response_time_ms)', 'avgResponseTime')
      .from('problem_attempts', 'attempt')
      .innerJoin('exercise_sessions', 'session', 'attempt.session_id = session.id')
      .where('attempt.session_id IN (:...sessionIds)', { sessionIds })
      .andWhere('attempt.is_correct IS NOT NULL') // Only include answered problems
      .andWhere('attempt.problem_type = :problemType', { problemType }) // Filter by problem type
      .groupBy('attempt.session_id')
      .getRawMany();

    // Create a map for easy lookup of session performance
    const performanceMap = new Map(
      sessionPerformance.map(perf => [
        parseInt(perf.sessionId), 
        {
          accuracy: perf.totalProblems > 0 
            ? (parseInt(perf.correctProblems) / parseInt(perf.totalProblems)) * 100 
            : 0,
          responseTime: perf.avgResponseTime ? parseFloat(perf.avgResponseTime) : 0
        }
      ])
    );

    // Build trend data arrays (maintaining the DESC order from the sessions query)
    const trendData = {
      sessions: [] as string[],
      accuracy: [] as number[],
      responseTime: [] as number[],
    };

    // For each session, add its data to the trend arrays
    for (const session of sessions) {
      const performance = performanceMap.get(session.id) || { accuracy: 0, responseTime: 0 };
      
      // Push ISO format date (end_time if available, otherwise start_time)
      trendData.sessions.push(session.end_time 
        ? new Date(session.end_time).toISOString() 
        : new Date(session.start_time).toISOString()
      );
      
      trendData.accuracy.push(parseFloat(performance.accuracy.toFixed(1)));
      trendData.responseTime.push(Math.round(performance.responseTime));
    }
    
    // Reverse arrays to get chronological order (oldest to newest)
    trendData.sessions.reverse();
    trendData.accuracy.reverse();
    trendData.responseTime.reverse();

    return trendData;
  } catch (error) {
    console.error('Error getting user performance trends:', error);
    throw error;
  }
}
