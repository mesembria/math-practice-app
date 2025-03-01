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
  targetResponseTime: number;      // Target time to solve problem (ms)
  
  // Weight Adjustments
  weightIncreaseWrong: number;    // W: Weight increase for wrong answer
  weightDecreaseFast: number;     // X: Weight decrease for fast correct answer
  weightDecreaseSlow: number;     // Z: Weight decrease for slow correct answer
}

// Optimize weight adjustments for better differentiation
export const DEFAULT_CONFIG: ProblemSelectionConfig = {
  minFactor: 2,
  maxFactor: 10,
  
  recentProblemCount: 20,
  targetResponseTime: 5000,       // 5 seconds
  
  weightIncreaseWrong: 7,         // Increase weight significantly for wrong answers
  weightDecreaseFast: 3,          // Moderate decrease for fast correct answers 
  weightDecreaseSlow: 1           // Small decrease for slow correct answers
};
