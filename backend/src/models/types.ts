/**
 * Core types for the problem selection system
 */

// Define problem types as string literals for consistency
export type ProblemType = 'multiplication' | 'missing_factor' | 'division';

// Basic problem interface - represents a problem as presented to the user
export interface Problem {
  factor1: number | null;
  factor2: number | null;
  problemType?: ProblemType;
  missingOperandPosition?: 'first' | 'second';
  originalFactors?: {
    hidden: number;
    visible: number;
  };
}

// Normalized problem interface - used for internal storage and comparison
export interface NormalizedProblem {
  smaller: number;
  larger: number;
  problemType: ProblemType;
  missingOperandPosition?: 'first' | 'second';
}

// Problem history entry interface
export interface ProblemHistory {
  factor1: number | null;
  factor2: number | null;
  correct: boolean;
  timeToAnswer: number;
  timestamp: number;
  problemType?: ProblemType;
  missingOperandPosition?: 'first' | 'second';
}

// Problem state interface - represents the current state of a problem for a user
export interface ProblemState {
  weight: number;
  lastSeen: number;
  problemType?: ProblemType;
}

// Problem state storage interface
export interface ProblemStateStorage {
  getProblemState(userId: number, normalized: NormalizedProblem): Promise<ProblemState>;
  updateProblemState(userId: number, normalized: NormalizedProblem, state: ProblemState): Promise<void>;
}


// Problem selection configuration interface
export interface ProblemSelectionConfig {
  // Factor Range
  minFactor: number;
  maxFactor: number;

  // Problem Type
  problemType: ProblemType;

  // Problem Selection
  recentProblemCount: number;     // How many recent problems to exclude
  targetResponseTime: number;     // Target time to solve problem (ms)

  // Weight Adjustments
  weightIncreaseWrong: number;    // Weight increase for wrong answer
  maxWeightDecrease: number;      // Maximum weight decrease for fastest correct answers
  midWeightDecrease: number;      // Weight decrease at target response time
  maxResponseTimeFactor: number;  // Multiple of target time after which no reduction occurs
}

// Default configuration for multiplication problems
export const DEFAULT_CONFIG: ProblemSelectionConfig = {
  minFactor: 2,
  maxFactor: 12,

  problemType: 'multiplication',

  recentProblemCount: 25,
  targetResponseTime: 6000,       // 7 seconds

  weightIncreaseWrong: 5,         // Reduced from 7
  maxWeightDecrease: 3,           // Maximum weight decrease for fastest responses
  midWeightDecrease: 1.5,         // Weight decrease at target response time
  maxResponseTimeFactor: 3        // Multiple of target time after which no reduction occurs
};

// Configuration for missing factor problems
export const MISSING_FACTOR_CONFIG: ProblemSelectionConfig = {
  ...DEFAULT_CONFIG,
  problemType: 'missing_factor',
  targetResponseTime: 8000,      // Slightly longer target time as these are more challenging
};