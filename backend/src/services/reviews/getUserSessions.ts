import { AppDataSource } from '../../config/database';
import { SessionSummary, MissedProblem, PaginationInfo } from '../../types/sessionReview.types';

interface SessionsResponse {
  sessions: SessionSummary[];
  pagination: PaginationInfo;
}

/**
 * Gets a paginated list of session summaries for a user
 * 
 * @param userId The ID of the user
 * @param page Page number (1-based)
 * @param limit Number of sessions per page
 * @param problemType Optional filter for problem type ('multiplication', 'missing_factor', etc.)
 * @returns Object with session list and pagination info
 */
export async function getUserSessions(
  userId: number,
  page: number = 1,
  limit: number = 10,
  problemType?: string
): Promise<SessionsResponse> {
  try {
    // Validate parameters
    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid userId provided');
    }
    
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50; // Set a reasonable upper bound
    
    // Calculate offset based on page and limit
    const offset = (page - 1) * limit;
    
    // Get total count of sessions for pagination
    const totalSessionsQuery = AppDataSource
      .getRepository('exercise_sessions')
      .createQueryBuilder('session')
      .where('session.user_id = :userId', { userId });
    
    // Add problem type filter if provided
    if (problemType) {
      totalSessionsQuery.andWhere('session.problem_type = :problemType', { problemType });
    }
    
    const totalSessions = await totalSessionsQuery.getCount();
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalSessions / limit) || 1; // Ensure at least 1 page
    
    // Early return if no sessions or requested page is out of range
    if (totalSessions === 0 || page > totalPages) {
      return {
        sessions: [],
        pagination: {
          currentPage: page > totalPages ? totalPages : page,
          totalPages,
          totalSessions
        }
      };
    }
    
    // Get sessions with pagination
    const sessionsQuery = AppDataSource
      .getRepository('exercise_sessions')
      .createQueryBuilder('session')
      .select([
        'session.id',
        'session.start_time',
        'session.end_time',
        'session.total_problems',
        'session.completed_problems',
        'session.is_completed'
      ])
      .where('session.user_id = :userId', { userId });
    
    // Add problem type filter if provided
    if (problemType) {
      sessionsQuery.andWhere('session.problem_type = :problemType', { problemType });
    }
    
    // Add sorting and pagination
    const sessions = await sessionsQuery
      .orderBy('session.end_time', 'DESC') // Newest first
      .addOrderBy('session.start_time', 'DESC') // Fallback sort if end_time is null
      .addOrderBy('session.id', 'DESC') // Ensure consistent ordering
      .offset(offset)
      .limit(limit)
      .getMany();
    
    // Get session IDs for the query
    const sessionIds = sessions.map(session => session.id);
    
    // Early return if no sessions found
    if (!sessionIds.length) {
      return {
        sessions: [],
        pagination: {
          currentPage: page,
          totalPages,
          totalSessions
        }
      };
    }

    // Execute all subsequent queries in parallel for better performance
    const [sessionPerformance, missedProblemsQuery] = await Promise.all([
      // Get session performance data
      AppDataSource
      .createQueryBuilder()
      .select('attempt.session_id', 'sessionId')
      .addSelect('COUNT(*)', 'totalProblems')
      .addSelect('SUM(CASE WHEN attempt.is_correct = 1 THEN 1 ELSE 0 END)', 'correctProblems')
      .addSelect('AVG(attempt.response_time_ms)', 'avgResponseTime')
      .from('problem_attempts', 'attempt')
      .innerJoin('exercise_sessions', 'session', 'attempt.session_id = session.id')
      .where('attempt.session_id IN (:...sessionIds)', { sessionIds })
      .andWhere('attempt.is_correct IS NOT NULL') // Only include answered problems
      .andWhere(problemType ? 'session.problem_type = :problemType' : '1=1', problemType ? { problemType } : {})
      .groupBy('attempt.session_id')
      .getRawMany(),
      
      // Get missed problems for each session
      AppDataSource
      .createQueryBuilder()
      .select([
        'attempt.session_id as sessionId',
        'attempt.factor1 AS factor1',
        'attempt.factor2 AS factor2',
        'attempt.user_answer as userAnswer',
        'attempt.response_time_ms as responseTime'
      ])
      .from('problem_attempts', 'attempt')
      .innerJoin('exercise_sessions', 'session', 'attempt.session_id = session.id')
      .where('attempt.session_id IN (:...sessionIds)', { sessionIds })
      .andWhere('attempt.is_correct = 0') // Only include incorrect attempts
      .andWhere(problemType ? 'session.problem_type = :problemType' : '1=1', problemType ? { problemType } : {})
      .getRawMany()
    ]);
    
    // Map to easily lookup performance data
    const performanceMap = new Map(
      sessionPerformance.map(perf => [parseInt(perf.sessionId), {
        totalProblems: parseInt(perf.totalProblems) || 0,
        correctProblems: parseInt(perf.correctProblems) || 0,
        avgResponseTime: perf.avgResponseTime ? parseFloat(perf.avgResponseTime) : 0
      }])
    );
    
    // Group missed problems by session ID
    const missedProblemsMap = new Map<number, MissedProblem[]>();
    for (const problem of missedProblemsQuery) {
      const sessionId = parseInt(problem.sessionId);
      if (!missedProblemsMap.has(sessionId)) {
        missedProblemsMap.set(sessionId, []);
      }
      
      // Calculate correct answer based on problem type
      const correctAnswer: number = problem.factor1 * problem.factor2;
      
      missedProblemsMap.get(sessionId)!.push({
        factor1: Number(problem.factor1),
        factor2: Number(problem.factor2),
        userAnswer: Number(problem.userAnswer),
        correctAnswer: correctAnswer,
        responseTime: Math.round(problem.responseTime || 0)
      });
    }
    
    // Format the session summaries
    const formattedSessions: SessionSummary[] = sessions.map(session => {
      // Get performance data or use defaults if not found
      const performance = performanceMap.get(session.id) || {
        totalProblems: session.total_problems || 0,
        correctProblems: 0,
        avgResponseTime: 0
      };
      
      // Calculate accuracy percentage
      const accuracy = performance.totalProblems > 0
        ? (performance.correctProblems / performance.totalProblems) * 100
        : 0;
      
      // Use end_time if available, otherwise start_time
      const sessionDate = session.end_time || session.start_time;
      
      return {
        id: session.id,
        date: new Date(sessionDate).toISOString(),
        totalProblems: performance.totalProblems,
        correctProblems: performance.correctProblems,
        accuracy: parseFloat(accuracy.toFixed(1)), // Round to 1 decimal place
        averageResponseTime: Math.round(performance.avgResponseTime), // Round to nearest millisecond
        missedProblems: missedProblemsMap.get(session.id) || []
      };
    });
    
    return {
      sessions: formattedSessions,
      pagination: {
        currentPage: page,
        totalPages,
        totalSessions
      }
    };
  } catch (error) {
    console.error('Error getting user sessions:', error);
    throw error;
  }
}