// Refactored code for backend/src/controllers/sessions.controller.ts

import { RequestHandler } from 'express';
import { AppDataSource } from '../config/database';
import { ExerciseSession } from '../models/ExerciseSession';
import { ProblemAttempt } from '../models/ProblemAttempt';
import { ProblemStatistic } from '../models/ProblemStatistic';
import { User } from '../models/User';
import { problemSelector } from '../services/problemSelection/selection';
import { ProblemHistory, DEFAULT_CONFIG } from '../services/problemSelection/types';

// Helper function to gather session summary data
async function generateSessionSummary(sessionId: number) {
  const sessionRepository = AppDataSource.getRepository(ExerciseSession);
  const problemRepository = AppDataSource.getRepository(ProblemAttempt);

  // Get session with user data
  const session = await sessionRepository.findOne({ 
    where: { id: parseInt(sessionId.toString()) },
    relations: ['user']
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // Get all completed attempts for this session
  const sessionAttempts = await problemRepository
    .createQueryBuilder('attempt')
    .where('attempt.session_id = :sessionId', { sessionId: session.id })
    .andWhere('attempt.user_answer IS NOT NULL')
    .orderBy('attempt.created_at', 'ASC')
    .getMany();

  // Get average response times for each problem combination
  const avgResponseTimes = await problemRepository
    .createQueryBuilder('attempt')
    .innerJoin('attempt.session', 'session')
    .select('attempt.factor1', 'factor1')
    .addSelect('attempt.factor2', 'factor2')
    .addSelect('AVG(attempt.response_time_ms)', 'avgTime')
    .where('session.user_id = :userId', { userId: session.user_id })
    .andWhere('attempt.response_time_ms IS NOT NULL')
    .andWhere('attempt.is_correct = 1')
    .groupBy('attempt.factor1')
    .addGroupBy('attempt.factor2')
    .getRawMany();

  // Normalize factors after retrieving data
  const avgTimeMap = new Map(
    avgResponseTimes.map(avg => {
      const smaller = Math.min(avg.factor1, avg.factor2);
      const larger = Math.max(avg.factor1, avg.factor2);
      return [
        `${smaller}x${larger}`,
        parseFloat(avg.avgTime)
      ];
    })
  );

  // Get all problem weights for this user
  const allWeights = [];
  const config = DEFAULT_CONFIG;
  
  for (let i = config.minFactor; i <= config.maxFactor; i++) {
    for (let j = i; j <= config.maxFactor; j++) {
      const state = await problemSelector.getProblemState(session.user_id, { factor1: i, factor2: j });
      
      // Add weights for both factor orderings for easier display in frontend
      allWeights.push({
        factor1: i,
        factor2: j,
        weight: state.weight
      });
      
      // Skip adding duplicate for equal factors
      if (i !== j) {
        allWeights.push({
          factor1: j,
          factor2: i,
          weight: state.weight
        });
      }
    }
  }

  // Calculate session statistics
  const totalCorrect = sessionAttempts.filter(a => a.is_correct).length;
  const accuracy = (totalCorrect / sessionAttempts.length) * 100;
  const avgTime = sessionAttempts.reduce((sum, a) => sum + (a.response_time_ms || 0), 0) / sessionAttempts.length;

  return {
    attempts: sessionAttempts.map(attempt => {
      // Get average time for this problem combination (using normalized key)
      const normalizedFactors = [attempt.factor1, attempt.factor2].sort((a, b) => a - b);
      const avgTimeKey = `${normalizedFactors[0]}x${normalizedFactors[1]}`;
      
      return {
        factor1: attempt.factor1,
        factor2: attempt.factor2,
        isCorrect: attempt.is_correct,
        responseTime: attempt.response_time_ms,
        averageTime: avgTimeMap.get(avgTimeKey) || null,
        userAnswer: attempt.user_answer
      };
    }),
    problemWeights: allWeights,
    sessionStats: {
      totalProblems: session.total_problems,
      correctAnswers: totalCorrect,
      accuracy: accuracy,
      averageResponseTime: avgTime,
      completedAt: session.end_time
    }
  };
}

export class SessionsController {
  static create: RequestHandler = async (req, res) => {
    try {
      const { userId, totalProblems } = req.body;

      if (!userId || !totalProblems) {
        res.status(400).json({ error: 'userId and totalProblems are required' });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const sessionRepository = AppDataSource.getRepository(ExerciseSession);
      const session = sessionRepository.create({
        user_id: userId,
        total_problems: totalProblems,
        completed_problems: 0,
        is_completed: false
      });

      await sessionRepository.save(session);
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static getNextProblem: RequestHandler = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const sessionRepository = AppDataSource.getRepository(ExerciseSession);
      const session = await sessionRepository.findOne({ 
        where: { id: parseInt(sessionId) },
        relations: ['attempts', 'user']
      });

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      if (session.is_completed || session.completed_problems >= session.total_problems) {
        res.status(400).json({ error: 'Session is completed' });
        return;
      }

      console.log(`\n[getNextProblem] Selecting problem for user ${session.user_id}, session ${sessionId}`);
      console.log(`[getNextProblem] Progress: ${session.completed_problems}/${session.total_problems} problems`);

      // Get user's problem history - include more history for better pattern detection
      const problemRepository = AppDataSource.getRepository(ProblemAttempt);
      const userAttempts = await problemRepository
        .createQueryBuilder('attempt')
        .innerJoin('attempt.session', 'session')
        .where('session.user_id = :userId', { userId: session.user_id })
        .orderBy('attempt.created_at', 'DESC')
        .limit(50) // Get more history for better analysis
        .getMany();

      // Convert attempts to ProblemHistory format
      const history: ProblemHistory[] = userAttempts.map(attempt => ({
        factor1: attempt.factor1,
        factor2: attempt.factor2,
        correct: attempt.is_correct || false,
        timeToAnswer: attempt.response_time_ms || 0,
        timestamp: attempt.created_at.getTime()
      }));

      console.log(`[getNextProblem] Analyzed ${history.length} recent attempts`);

      // Use default configuration for problem selection
      const config = { ...DEFAULT_CONFIG };
      console.log(`[getNextProblem] Using default factor range: ${config.minFactor}-${config.maxFactor}`);
      
      // Select next problem using enhanced weight-based selection
      const nextProblem = await problemSelector.selectNextProblem(session.user_id, history, config);
      
      console.log(`[getNextProblem] Selected problem: ${nextProblem.factor1} × ${nextProblem.factor2}`);

      // Create and save the problem
      const problem = problemRepository.create({
        session_id: session.id,
        factor1: nextProblem.factor1,
        factor2: nextProblem.factor2,
        attempt_number: 1
      });

      await problemRepository.save(problem);

      res.json({
        problemId: problem.id,
        factor1: problem.factor1,
        factor2: problem.factor2
      });
    } catch (error) {
      console.error('Error getting next problem:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static getSession: RequestHandler = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const sessionRepository = AppDataSource.getRepository(ExerciseSession);
      const session = await sessionRepository.findOne({ 
        where: { id: parseInt(sessionId) }
      });

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json(session);
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static submitAttempt: RequestHandler = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { problemId, answer, responseTimeMs } = req.body;

      if (!problemId || answer === undefined || !responseTimeMs) {
        res.status(400).json({ error: 'problemId, answer, and responseTimeMs are required' });
        return;
      }

      const sessionRepository = AppDataSource.getRepository(ExerciseSession);
      const problemRepository = AppDataSource.getRepository(ProblemAttempt);
      const statisticsRepository = AppDataSource.getRepository(ProblemStatistic);

      const [session, problem] = await Promise.all([
        sessionRepository.findOne({ 
          where: { id: parseInt(sessionId) },
          relations: ['user']
        }),
        problemRepository.findOne({ where: { id: problemId } })
      ]);

      if (!session || !problem) {
        res.status(404).json({ error: 'Session or problem not found' });
        return;
      }

      if (session.is_completed) {
        res.status(400).json({ error: 'Session is already completed' });
        return;
      }

      console.log(`\n[submitAttempt] Processing attempt for problem ${problem.factor1} × ${problem.factor2}`);
      console.log(`[submitAttempt] User answer: ${answer}, Response time: ${responseTimeMs}ms`);

      // Update problem attempt
      const correctAnswer = problem.factor1 * problem.factor2;
      const isCorrect = correctAnswer === answer;
      problem.user_answer = answer;
      problem.is_correct = isCorrect;
      problem.response_time_ms = responseTimeMs;
      await problemRepository.save(problem);

      console.log(`[submitAttempt] Answer is ${isCorrect ? 'correct' : 'incorrect'}`);

      // Update or create problem statistics for this combination
      let statistic = await statisticsRepository.findOne({
        where: {
          user_id: session.user_id,
          factor1: Math.min(problem.factor1, problem.factor2),
          factor2: Math.max(problem.factor1, problem.factor2)
        }
      });

      if (!statistic) {
        statistic = statisticsRepository.create({
          user_id: session.user_id,
          factor1: Math.min(problem.factor1, problem.factor2),
          factor2: Math.max(problem.factor1, problem.factor2),
          total_attempts: 0,
          correct_attempts: 0,
          avg_response_time_ms: 0
        });
      }

      // Update statistics (normalized with smaller factor first for consistency)
      statistic.total_attempts += 1;
      if (isCorrect) {
        statistic.correct_attempts += 1;
      }
      
      // Update average response time using weighted average
      statistic.avg_response_time_ms = 
        (statistic.avg_response_time_ms * (statistic.total_attempts - 1) + responseTimeMs) / 
        statistic.total_attempts;
      
      await statisticsRepository.save(statistic);

      // Update problem weights based on performance
      await problemSelector.updateProblemAfterAttempt(
        session.user_id,
        { factor1: problem.factor1, factor2: problem.factor2 },
        isCorrect,
        responseTimeMs
      );

      // Update session progress
      session.completed_problems += 1;
      if (session.completed_problems >= session.total_problems) {
        session.is_completed = true;
        session.end_time = new Date();
      }
      await sessionRepository.save(session);


      // Get previous attempts for this specific problem combination
      const previousAttempts = await problemRepository
        .createQueryBuilder('attempt')
        .innerJoin('attempt.session', 'session')
        .where('session.user_id = :userId', { userId: session.user_id })
        .andWhere('attempt.factor1 = :factor1', { factor1: problem.factor1 })
        .andWhere('attempt.factor2 = :factor2', { factor2: problem.factor2 })
        .andWhere('attempt.id != :currentAttemptId', { currentAttemptId: problem.id }) // Exclude current attempt
        .orderBy('attempt.created_at', 'DESC')
        .getMany();

      // Get recent attempts in the current session to determine consecutive correct answers
      const recentSessionAttempts = await problemRepository
        .createQueryBuilder('attempt')
        .where('attempt.session_id = :sessionId', { sessionId: session.id })
        .andWhere('attempt.is_correct IS NOT NULL') // Only include answered problems
        .orderBy('attempt.created_at', 'DESC')
        .getMany();

      // Count consecutive correct answers until we hit an incorrect one
      let correctStreak = 0;
      for (const attempt of recentSessionAttempts) {
        if (attempt.is_correct) {
          correctStreak++;
        } else {
          break;
        }
      }

      // Determine if this problem was previously answered incorrectly
      const wasIncorrectBefore = previousAttempts.some(attempt => 
        attempt.is_correct === false
      );

      // Determine if this is the first time the user answered this problem correctly
      const isFirstTimeCorrect = isCorrect && (
        previousAttempts.length === 0 || 
        !previousAttempts.some(attempt => attempt.is_correct === true)
      );

      // Get previous response time (most recent attempt at this problem)
      const previousAttempt = previousAttempts.length > 0 ? previousAttempts[0] : null;
      const previousResponseTime = previousAttempt?.response_time_ms || null;

      // Calculate time improvement percentage if applicable
      let timeImprovement = null;
      if (isCorrect && previousResponseTime && responseTimeMs) {
        timeImprovement = ((previousResponseTime - responseTimeMs) / previousResponseTime) * 100;
      }

      // Create encouragement data object
      const encouragementData = isCorrect ? {
        wasIncorrectBefore,
        isFirstTimeCorrect,
        previousResponseTime,
        averageResponseTime: statistic.avg_response_time_ms,
        timeImprovement,
        correctStreak: isCorrect ? correctStreak : 0,
        sessionProgress: {
          completed: session.completed_problems,
          total: session.total_problems,
          percentage: (session.completed_problems / session.total_problems) * 100
        }
      } : null;


      // If session is complete, gather all session data with enhanced details
      if (session.is_completed) {
        console.log(`[submitAttempt] Session ${sessionId} is now complete!`);
        
        // Get the session summary using our helper function
        const sessionSummary = await generateSessionSummary(parseInt(sessionId));

        res.json({
          isCorrect,
          correctAnswer,
          isSessionComplete: true,
          sessionSummary,
          encouragementData
        });
      } else {
        res.json({
          isCorrect,
          correctAnswer,
          isSessionComplete: false,
          encouragementData
        });
      }
    } catch (error) {
      console.error('Error submitting attempt:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static getSessionAttempts: RequestHandler = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const problemRepository = AppDataSource.getRepository(ProblemAttempt);
      
      const attempts = await problemRepository
        .createQueryBuilder('attempt')
        .where('attempt.session_id = :sessionId', { sessionId: parseInt(sessionId) })
        .orderBy('attempt.created_at', 'ASC')
        .getMany();
      
      // Format attempts to match the frontend expected format
      const formattedAttempts = attempts.map(attempt => ({
        factor1: attempt.factor1,
        factor2: attempt.factor2,
        isCorrect: attempt.is_correct || false,
        responseTime: attempt.response_time_ms || 0,
        averageTime: null, // Will be filled in getSessionSummary
        userAnswer: attempt.user_answer || 0
      }));
      
      res.json({ attempts: formattedAttempts });
    } catch (error) {
      console.error('Error getting session attempts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static getSessionSummary: RequestHandler = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const summary = await generateSessionSummary(parseInt(sessionId));
      res.json(summary);
    } catch (error) {
      console.error('Error getting session summary:', error);
      
      if (error instanceof Error && error.message === 'Session not found') {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}