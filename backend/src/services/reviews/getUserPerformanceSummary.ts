import { getUserOverallStatistics } from './getUserOverallStatistics';
import { getUserPerformanceTrends } from './getUserPerformanceTrends';
import { getMostChallengingProblems, getSlowestProblems } from './getProblemPerformance';
import { PerformanceSummary } from '../../types/sessionReview.types';

/**
 * Gets a complete performance summary for a user
 * Includes overall statistics, trends, and problem-specific performance
 * 
 * @param userId The ID of the user to get statistics for
 * @param problemType The type of problem to filter statistics for ('multiplication', 'missing_factor', etc.)
 * @returns Complete performance summary object
 */
export async function getUserPerformanceSummary(
  userId: number, 
  problemType: string
): Promise<PerformanceSummary> {
  try {
    // Run all queries in parallel for better performance
    const [
      overallStats,
      trends,
      challengingProblems,
      slowestProblems
    ] = await Promise.all([
      getUserOverallStatistics(userId, problemType),
      getUserPerformanceTrends(userId, problemType, 20), // Get up to 20 sessions for trends
      getMostChallengingProblems(userId, problemType, 3, 3), // Get top 3 challenging problems with min 3 attempts
      getSlowestProblems(userId, problemType, 3, 3) // Get top 3 slowest problems with min 3 attempts
    ]);

    // Clean up the results to remove redundant properties
    const cleanChallenging = challengingProblems.map(problem => ({
      factor1: problem.factor1,
      factor2: problem.factor2,
      accuracy: problem.accuracy,
      averageResponseTime: problem.averageResponseTime,
      attempts: problem.attempts,
    }));

    const cleanSlowest = slowestProblems.map(problem => ({
      factor1: problem.factor1,
      factor2: problem.factor2, 
      accuracy: problem.accuracy,
      averageResponseTime: problem.averageResponseTime,
      attempts: problem.attempts,
    }));

    // Clean the trends to remove redundant properties
    const cleanTrends = {
      sessions: trends.sessions,
      accuracy: trends.accuracy,
      responseTime: trends.responseTime
    };

    // Combine all results into the specified API response format
    return {
      totalSessions: overallStats.totalSessions,
      totalProblems: overallStats.totalProblems,
      overallAccuracy: overallStats.overallAccuracy,
      averageResponseTime: overallStats.averageResponseTime,
      
      trends: cleanTrends,
      
      challengingProblems: cleanChallenging,
      slowestProblems: cleanSlowest
    };
  } catch (error) {
    console.error('Error getting user performance summary:', error);
    throw error;
  }
}
