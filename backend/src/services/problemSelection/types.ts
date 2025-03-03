/**
 * Core types for the problem selection system
 */

export interface Problem {
  factor1: number;
  factor2: number;
}

export interface NormalizedProblem {
  smaller: number;
  larger: number;
}

export interface ProblemHistory {
  factor1: number;
  factor2: number;
  correct: boolean;
  timeToAnswer: number;
  timestamp: number;
}

export interface ProblemState {
  weight: number;
  lastSeen: number;
}

export interface ProblemStateStorage {
  getProblemState(userId: number, normalized: NormalizedProblem): Promise<ProblemState>;
  updateProblemState(userId: number, normalized: NormalizedProblem, state: ProblemState): Promise<void>;
}

export interface ProblemSelectionConfig {
  // Factor Range
  minFactor: number;
  maxFactor: number;

  // Problem Selection
  recentProblemCount: number;     // How many recent problems to exclude
  targetResponseTime: number;     // Target time to solve problem (ms)

  // Weight Adjustments
  weightIncreaseWrong: number;    // Weight increase for wrong answer
  maxWeightDecrease: number;      // Maximum weight decrease for fastest correct answers
  midWeightDecrease: number;      // Weight decrease at target response time
  maxResponseTimeFactor: number;  // Multiple of target time after which no reduction occurs
}

// Update default config
export const DEFAULT_CONFIG: ProblemSelectionConfig = {
  minFactor: 2,
  maxFactor: 10,

  recentProblemCount: 20,
  targetResponseTime: 7000,       // 5 seconds

  weightIncreaseWrong: 5,         // Reduced from 7
  maxWeightDecrease: 3,           // Maximum weight decrease for fastest responses
  midWeightDecrease: 1.5,         // Weight decrease at target response time
  maxResponseTimeFactor: 3        // Multiple of target time after which no reduction occurs
};
