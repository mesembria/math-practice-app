// src/services/api.ts

// User types
export interface User {
  id: number;
  name: string;
  is_parent: boolean;
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
}

// Problem types
export interface Problem {
  problemId: number;
  factor1: number;
  factor2: number;
}

export interface ProblemAttempt {
  factor1: number;
  factor2: number;
  isCorrect: boolean;
  responseTime: number;
  averageTime: number | null;
  userAnswer: number;
}

export interface ProblemWeight {
  factor1: number;
  factor2: number;
  weight: number;
}

export interface SessionStats {
  totalProblems: number;
  correctAnswers: number;
  accuracy: number;
  averageResponseTime: number;
  completedAt: string;
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
}

export interface MissedProblem {
  factor1: number;
  factor2: number;
  userAnswer: number;
  correctAnswer: number;
  responseTime: number;
}

export interface SessionSummaryItem {
  id: number;
  date: string;
  totalProblems: number;
  correctProblems: number;
  accuracy: number;
  averageResponseTime: number;
  missedProblems: MissedProblem[];
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
  async createSession(userId: number, totalProblems: number): Promise<ExerciseSession> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, totalProblems }),
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
    return response.json();
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
  async getUserSessions(userId: number, page: number = 1, limit: number = 10): Promise<SessionReviewResponse> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions?page=${page}&limit=${limit}`);
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
  }
};