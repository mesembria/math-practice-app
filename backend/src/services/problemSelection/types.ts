// Export the types needed for problem selection


import { NormalizedProblem, ProblemType } from "../../models/types";


// Simplified ProblemState interface to use in the service layer
export interface ProblemStateData {
  weight: number;
  lastSeen: number;
  problemType: ProblemType | undefined;
}

// Problem state storage interface
export interface ProblemStateStorage {
  getProblemState(userId: number, normalized: NormalizedProblem): Promise<ProblemStateData>;
  updateProblemState(userId: number, normalized: NormalizedProblem, state: ProblemStateData): Promise<void>;
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
  maxFactor: 10,

  problemType: 'multiplication',

  recentProblemCount: 20,
  targetResponseTime: 7000,       // 7 seconds

  weightIncreaseWrong: 5,         // Reduced from 7
  maxWeightDecrease: 3,           // Maximum weight decrease for fastest responses
  midWeightDecrease: 1.5,         // Weight decrease at target response time
  maxResponseTimeFactor: 3        // Multiple of target time after which no reduction occurs
};

// Configuration for missing factor problems
export const MISSING_FACTOR_CONFIG: ProblemSelectionConfig = {
  ...DEFAULT_CONFIG,
  problemType: 'missing_factor',
  maxFactor: 12,                 // Expanded range for missing operand problems (2-12)
  targetResponseTime: 8000,      // Slightly longer target time as these are more challenging
};