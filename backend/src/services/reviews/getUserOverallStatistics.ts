import { AppDataSource } from "../../config/database";


/**
 * Gets overall statistics for a user's multiplication practice history
 * 
 * @param userId The ID of the user to get statistics for
 * @returns Object with totalSessions, totalProblems, overallAccuracy, and averageResponseTime
 */
export async function getUserOverallStatistics(userId: number) {
  try {
    // Validate userId is a number
    if (isNaN(userId)) {
      throw new Error('Invalid userId provided');
    }

    // Create query to get session count
    const sessionsQuery = await AppDataSource
      .getRepository('exercise_sessions')
      .createQueryBuilder('session')
      .where('session.user_id = :userId', { userId })
      .getCount();

    // Create query to calculate problem statistics in a single query for efficiency
    const problemStatsQuery = await AppDataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'totalProblems')
      .addSelect('SUM(CASE WHEN attempt.is_correct = 1 THEN 1 ELSE 0 END)', 'correctProblems')
      .addSelect('AVG(attempt.response_time_ms)', 'avgResponseTime')
      .from('problem_attempts', 'attempt')
      .innerJoin('exercise_sessions', 'session', 'attempt.session_id = session.id')
      .where('session.user_id = :userId', { userId })
      .andWhere('attempt.is_correct IS NOT NULL') // Only count answered problems
      .getRawOne();

    // Calculate statistics from query results
    const totalSessions = sessionsQuery;
    const totalProblems = parseInt(problemStatsQuery.totalProblems) || 0;
    const correctProblems = parseInt(problemStatsQuery.correctProblems) || 0;
    
    // Calculate accuracy percentage (avoid division by zero)
    const overallAccuracy = totalProblems > 0 
      ? (correctProblems / totalProblems) * 100 
      : 0;

    // Get average response time in milliseconds
    const averageResponseTime = problemStatsQuery.avgResponseTime 
      ? parseFloat(problemStatsQuery.avgResponseTime) 
      : 0;

    return {
      totalSessions,
      totalProblems,
      overallAccuracy: parseFloat(overallAccuracy.toFixed(1)), // Round to 1 decimal place
      averageResponseTime: Math.round(averageResponseTime) // Round to nearest millisecond
    };
  } catch (error) {
    console.error('Error getting user overall statistics:', error);
    throw error;
  }
}