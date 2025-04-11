// backend/src/types/sessionReview.types.ts

// Types for session review API response

export interface MissedProblem {
  factor1: number;
  factor2: number;
  userAnswer: number;
  correctAnswer: number;
  responseTime: number;
}

export interface SessionSummary {
  id: number;
  date: string; // ISO date format
  totalProblems: number;
  correctProblems: number;
  accuracy: number; // percentage
  averageResponseTime: number; // milliseconds
  missedProblems: MissedProblem[];
}

export interface ProblemPerformance {
  factor1: number;
  factor2: number;
  accuracy: number; // percentage
  averageResponseTime: number; // milliseconds
  attempts: number;
}

export interface PerformanceTrends {
  sessions: string[]; // Array of session dates/IDs for x-axis
  accuracy: number[]; // Array of accuracy percentages
  responseTime: number[]; // Array of average response times
}

export interface PerformanceSummary {
  totalSessions: number;
  totalProblems: number;
  overallAccuracy: number; // percentage
  averageResponseTime: number; // milliseconds
  
  trends: PerformanceTrends;
  challengingProblems: ProblemPerformance[];
  slowestProblems: ProblemPerformance[];
  
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalSessions: number;
}

export interface SessionReviewResponse {
  problemType: string; // Added this field to make it explicit that response is for a specific problem type
  summary: PerformanceSummary;
  sessions: SessionSummary[];
  pagination: PaginationInfo;
}