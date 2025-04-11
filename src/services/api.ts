// src/services/api.ts

// User types
export interface User {
  id: number;
  name: string;
  is_parent: boolean;
}

// Problem type enum
export enum ProblemType {
  MULTIPLICATION = 'multiplication',
  MISSING_FACTOR = 'missing_factor',
  DIVISION = 'division'
}

// Session types
export interface ExerciseSession {
  id: number;
  user_id: number;
  total_problems: number;
  completed_problems: number;
  is_completed: boolean;
  start_time: string;
  end_time?: string;
  problem_type: ProblemType;
}

// Problem types
export interface Problem {
  problemId: number;
  factor1: number | null;  // Changed to allow null
  factor2: number | null;  // Changed to allow null
  missingOperandPosition?: 'first' | 'second';  // Changed to match backend types
  product?: number;  // Add this field for missing operand problems
}

export interface ProblemAttempt {
  factor1: number;
  factor2: number;
  isCorrect: boolean;
  responseTime: number;
  averageTime: number | null;
  userAnswer: number;
  problemType: ProblemType;
  missingOperandPosition?: 'first' | 'second' | null; // Add this property
}

export interface ProblemWeight {
  factor1: number;
  factor2: number;
  weight: number;
  problemType: ProblemType;
}

export interface SessionStats {
  totalProblems: number;
  correctAnswers: number;
  accuracy: number;
  averageResponseTime: number;
  completedAt: string;
  problemType: ProblemType;
}

export interface SessionSummary {
  attempts: ProblemAttempt[];
  problemWeights: ProblemWeight[];
  sessionStats: SessionStats;
}

export interface EncouragementData {
  wasIncorrectBefore: boolean;
  isFirstTimeCorrect: boolean;
  previousResponseTime: number | null;
  averageResponseTime: number;
  timeImprovement: number | null;
  correctStreak: number;
  sessionProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface AttemptResult {
  isCorrect: boolean;
  correctAnswer: number;
  isSessionComplete: boolean;
  sessionSummary?: SessionSummary;
  encouragementData?: EncouragementData | null;
}

// Session Review types
export interface PerformanceTrend {
  sessions: string[];
  accuracy: number[];
  responseTime: number[];
}

export interface ProblemPerformance {
  factor1: number;
  factor2: number;
  accuracy: number;
  averageResponseTime: number;
  attempts: number;
  problemType: ProblemType;
}

export interface MissedProblem {
  factor1: number;
  factor2: number;
  userAnswer: number;
  correctAnswer: number;
  responseTime: number;
  problemType: ProblemType;
}

export interface SessionSummaryItem {
  id: number;
  date: string;
  totalProblems: number;
  correctProblems: number;
  accuracy: number;
  averageResponseTime: number;
  missedProblems: MissedProblem[];
  problemType: ProblemType;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalSessions: number;
}

export interface PerformanceSummary {
  totalSessions: number;
  totalProblems: number;
  overallAccuracy: number;
  averageResponseTime: number;
  trends: PerformanceTrend;
  challengingProblems: ProblemPerformance[];
  slowestProblems: ProblemPerformance[];
}

export interface SessionReviewResponse {
  summary: PerformanceSummary;
  sessions: SessionSummaryItem[];
  pagination: PaginationInfo;
}

const API_BASE_URL = '/api';

export const api = {
  // Users
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  // Sessions
  /**
   * Creates a new practice session
   * @param userId - The ID of the user for whom to create the session
   * @param totalProblems - The number of problems in the session
   * @param problemType - The type of problems in the session (multiplication, missing_factor, etc.)
   * @returns The created session object
   */
  async createSession(
    userId: number, 
    totalProblems: number, 
    problemType: ProblemType = ProblemType.MULTIPLICATION
  ): Promise<ExerciseSession> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, totalProblems, problemType }),
    });
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    return response.json();
  },

  async getNextProblem(sessionId: number): Promise<Problem> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/problems/next`);
    if (!response.ok) {
      const errorData = await response.json();
      // Check if session is already completed
      if (errorData.error === 'Session is completed') {
        throw new Error('Session is already completed');
      }
      throw new Error('Failed to fetch next problem');
    }
    
    // Get the data from the response
    const data = await response.json();
    
    // For missing factor problems, we need to calculate the product
    if (data.missingOperandPosition) {
      // If backend is already providing product, use it
      if (data.product) {
        return {
          problemId: data.problemId,
          factor1: data.factor1,
          factor2: data.factor2, 
          missingOperandPosition: data.missingOperandPosition,
          product: data.product
        };
      }
      
      // Otherwise, calculate it from the available factors
      let calculatedProduct: number | undefined;
      
      // If one of the factors is null (missing), we need to use the other factor to calculate
      if (data.factor1 !== null && data.factor2 !== null) {
        calculatedProduct = data.factor1 * data.factor2;
      } else if (data.factor1 !== null) {
        // For typical missing factor problems, the backend will provide the reference product
        calculatedProduct = data.referenceProduct || (data.factor1 * 
          (data.missingOperandPosition === 'second' ? data.correctAnswer || 0 : 0));
      } else if (data.factor2 !== null) {
        calculatedProduct = data.referenceProduct || ((data.missingOperandPosition === 'first' ? 
          data.correctAnswer || 0 : 0) * data.factor2);
      }
      
      return {
        problemId: data.problemId,
        factor1: data.factor1,
        factor2: data.factor2,
        missingOperandPosition: data.missingOperandPosition,
        product: calculatedProduct
      };
    }
    
    // For regular multiplication problems, just return as is
    return {
      problemId: data.problemId,
      factor1: data.factor1,
      factor2: data.factor2,
      missingOperandPosition: data.missingOperandPosition
    };
  },

  async getSession(sessionId: number): Promise<ExerciseSession> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }
    return response.json();
  },

  async submitAttempt(
    sessionId: number,
    problemId: number,
    answer: number,
    responseTimeMs: number
  ): Promise<AttemptResult> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problemId, answer, responseTimeMs }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error === 'Session is already completed') {
        throw new Error('Session is already completed');
      }
      throw new Error('Failed to submit attempt');
    }
    
    return response.json();
  },
  
  // Get all attempts for a specific session
  async getSessionAttempts(sessionId: number): Promise<ProblemAttempt[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/attempts`);
      if (!response.ok) {
        throw new Error('Failed to fetch session attempts');
      }
      const data = await response.json();
      return data.attempts || [];
    } catch (error) {
      console.error('Error fetching session attempts:', error);
      return []; // Return empty array as fallback
    }
  },

  // Get the full session summary for a completed session
  async getSessionSummary(sessionId: number): Promise<SessionSummary> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/summary`);
    if (!response.ok) {
      throw new Error('Failed to fetch session summary');
    }
    return response.json();
  },

  // Session Review
  async getUserSessions(
    userId: number, 
    page: number = 1, 
    limit: number = 10, 
    problemType: ProblemType = ProblemType.MULTIPLICATION
  ): Promise<SessionReviewResponse> {
    const url = `${API_BASE_URL}/users/${userId}/sessions?page=${page}&limit=${limit}&problemType=${problemType}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch user sessions');
    }
    return response.json();
  },

  // Helper method to get difficulty label based on weight
  getDifficultyLabel(weight: number): string {
    if (weight <= 5) return 'Mastered';
    if (weight <= 8) return 'Confident';
    if (weight <= 12) return 'Learning';
    if (weight <= 16) return 'Challenging';
    return 'Difficult';
  },

  // Helper method to get problem type label
  getProblemTypeLabel(problemType: ProblemType): string {
    switch (problemType) {
      case ProblemType.MULTIPLICATION:
        return 'Find the Product';
      case ProblemType.MISSING_FACTOR:
        return 'Find the Missing Factor';
      case ProblemType.DIVISION:
        return 'Division';
      default:
        return 'Unknown';
    }
  },

  // Helper method to determine the correct answer for a problem based on its type
  getCorrectAnswer(problem: Problem, problemType: ProblemType): number {
    // Handle multiplication problems - both factors must be non-null
    if (problemType === ProblemType.MULTIPLICATION) {
      if (problem.factor1 !== null && problem.factor2 !== null) {
        return problem.factor1 * problem.factor2;
      }
      return 0; // Default if any factor is null
    } 
    
    // Handle missing factor problems
    else if (problemType === ProblemType.MISSING_FACTOR) {
      // For missing factor problems, the correct answer is the missing operand
      if (problem.missingOperandPosition === 'first') {
        // First operand is missing, need to find what factor1 should be
        if (problem.factor2 !== null && problem.factor2 !== 0) {
          // Calculate the expected product assuming factor1 is non-null
          const product = (problem.factor1 || 0) * problem.factor2;
          return Math.round(product / problem.factor2);
        }
      } else if (problem.missingOperandPosition === 'second') {
        // Second operand is missing, need to find what factor2 should be
        if (problem.factor1 !== null && problem.factor1 !== 0) {
          // Calculate the expected product assuming factor2 is non-null
          const product = problem.factor1 * (problem.factor2 || 0);
          return Math.round(product / problem.factor1);
        }
      }
    }
    
    return 0; // Default fallback
  }
};