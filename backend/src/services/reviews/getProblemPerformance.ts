import { AppDataSource } from '../../config/database';

interface ProblemPerformance {
  factor1: number;
  factor2: number;
  accuracy: number;
  averageResponseTime: number;
  attempts: number;
}

/**
 * Gets the most challenging problems for a user
 * Challenging problems are those with the lowest accuracy rates
 * 
 * @param userId The ID of the user
 * @param limit Number of problems to return (default: 3)
 * @param minAttempts Minimum number of attempts required (default: 5)
 * @returns Array of problem performance objects
 */
export async function getMostChallengingProblems(
  userId: number, 
  limit: number = 3,
  minAttempts: number = 5
): Promise<ProblemPerformance[]> {
  try {
    // Query to find problems with the lowest accuracy rates
    const results = await AppDataSource
      .createQueryBuilder()
      .select([
        'stat.factor1 as factor1', 
        'stat.factor2 as factor2', 
        'stat.total_attempts as attempts',
        'stat.correct_attempts as correctAttempts',
        'stat.avg_response_time_ms as avgResponseTime'
      ])
      .from('problem_statistics', 'stat')
      .where('stat.user_id = :userId', { userId })
      .andWhere('stat.total_attempts >= :minAttempts', { minAttempts })
      .orderBy('(stat.correct_attempts * 100.0 / stat.total_attempts)', 'ASC') // Order by accuracy ascending
      .limit(limit)
      .getRawMany();

    // Format the results
    return results.map(row => ({
      factor1: parseInt(row.factor1),
      factor2: parseInt(row.factor2),
      accuracy: row.attempts > 0 
        ? parseFloat(((row.correctAttempts / row.attempts) * 100).toFixed(1)) 
        : 0,
      averageResponseTime: Math.round(row.avgResponseTime),
      attempts: parseInt(row.attempts)
    }));
  } catch (error) {
    console.error('Error getting challenging problems:', error);
    throw error;
  }
}

/**
 * Gets the slowest problems for a user
 * Slowest problems are those with the longest average response times
 * 
 * @param userId The ID of the user
 * @param limit Number of problems to return (default: 3)
 * @param minAttempts Minimum number of attempts required (default: 5)
 * @returns Array of problem performance objects
 */
export async function getSlowestProblems(
  userId: number, 
  limit: number = 3,
  minAttempts: number = 5
): Promise<ProblemPerformance[]> {
  try {
    // Query to find problems with the longest average response times
    const results = await AppDataSource
      .createQueryBuilder()
      .select([
        'stat.factor1 as factor1', 
        'stat.factor2 as factor2', 
        'stat.total_attempts as attempts',
        'stat.correct_attempts as correctAttempts',
        'stat.avg_response_time_ms as avgResponseTime'
      ])
      .from('problem_statistics', 'stat')
      .where('stat.user_id = :userId', { userId })
      .andWhere('stat.total_attempts >= :minAttempts', { minAttempts })
      .orderBy('stat.avg_response_time_ms', 'DESC') // Order by response time descending
      .limit(limit)
      .getRawMany();

    // Format the results
    return results.map(row => ({
      factor1: parseInt(row.factor1),
      factor2: parseInt(row.factor2),
      accuracy: row.attempts > 0 
        ? parseFloat(((row.correctAttempts / row.attempts) * 100).toFixed(1)) 
        : 0,
      averageResponseTime: Math.round(row.avgResponseTime),
      attempts: parseInt(row.attempts)
    }));
  } catch (error) {
    console.error('Error getting slowest problems:', error);
    throw error;
  }
}