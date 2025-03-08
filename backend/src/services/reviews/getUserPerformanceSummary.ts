
import { getUserOverallStatistics } from './getUserOverallStatistics';
import { getUserPerformanceTrends } from './getUserPerformanceTrends';
import { getMostChallengingProblems, getSlowestProblems } from './getProblemPerformance';
import { PerformanceSummary } from '../../types/sessionReview.types';

/**
 * Gets a complete performance summary for a user
 * Includes overall statistics, trends, and problem-specific performance
 * 
 * @param userId The ID of the user to get statistics for
 * @returns Complete performance summary object
 */
export async function getUserPerformanceSummary(userId: number): Promise<PerformanceSummary> {
  try {
    // Run all queries in parallel for better performance
    const [
      overallStats,
      trends,
      challengingProblems,
      slowestProblems
    ] = await Promise.all([
      getUserOverallStatistics(userId),
      getUserPerformanceTrends(userId, 20), // Get up to 20 sessions for trends
      getMostChallengingProblems(userId, 3, 3), // Get top 3 challenging problems with min 5 attempts
      getSlowestProblems(userId, 3, 3) // Get top 3 slowest problems with min 5 attempts
    ]);

    // Combine all results into the specified API response format
    return {
      totalSessions: overallStats.totalSessions,
      totalProblems: overallStats.totalProblems,
      overallAccuracy: overallStats.overallAccuracy,
      averageResponseTime: overallStats.averageResponseTime,
      
      trends: {
        sessions: trends.sessions,
        accuracy: trends.accuracy,
        responseTime: trends.responseTime
      },
      
      challengingProblems,
      slowestProblems
    };
  } catch (error) {
    console.error('Error getting user performance summary:', error);
    throw error;
  }
}