/**
 * Represents a single multiplication problem in the exercise
 */
export interface Problem {
    problemId: number;
    factor1: number;
    factor2: number;
  }
  
  /**
   * Progress statistics for the current exercise session
   */
  export interface ProgressStats {
    totalProblems: number;
    completed: number;
    correct: number;
    incorrect: number;
    currentProblemIndex: number;
  }