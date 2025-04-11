/**
 * Represents a single multiplication problem in the exercise
 */
export interface Problem {
  problemId: number;
  factor1: number | null;  // Allow null for missing factors
  factor2: number | null;  // Allow null for missing factors
  missingOperandPosition?: 'first' | 'second';  // Match backend types
  product?: number;  // Add product field for missing operand problems
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