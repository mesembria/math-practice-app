import { DEFAULT_CONFIG, MISSING_FACTOR_CONFIG, NormalizedProblem, Problem, ProblemHistory, ProblemSelectionConfig } from '../../models/types';
import { SQLiteProblemStateStorage } from './sqliteStorage';
import { ProblemStateStorage, ProblemStateData } from './types';

export class ProblemSelector {
  protected storage: ProblemStateStorage;

  constructor(storage?: ProblemStateStorage) {
    this.storage = storage || new SQLiteProblemStateStorage();
  }

  /**
 * Normalizes a problem by ensuring smaller factor comes first.
 * This ensures that commutative pairs (e.g., 3×4 and 4×3) are treated as the same problem.
 * For missing operand problems, preserves which operand is missing while maintaining
 * unique factor combinations.
 * 
 * @param problem Problem to normalize
 * @returns Normalized problem with smaller factor first
 */
private normalizeProblem(problem: Problem): NormalizedProblem {
  // For missing operand problems, we need a different normalization approach
  if (problem.problemType === 'missing_factor') {
    // Extract the visible factor and expected answer
    let visibleFactor: number;
    let expectedAnswer: number;
    
    if (problem.missingOperandPosition === 'first' && problem.factor2 !== null) {
      // For "? × 6 = 36", the visible factor is 6 (factor2)
      visibleFactor = problem.factor2;
      expectedAnswer = problem.factor1 !== null ? problem.factor1 : visibleFactor; // In most cases, factor1 should equal factor2
    } else if (problem.missingOperandPosition === 'second' && problem.factor1 !== null) {
      // For "6 × ? = 36", the visible factor is 6 (factor1)
      visibleFactor = problem.factor1;
      expectedAnswer = problem.factor2 !== null ? problem.factor2 : visibleFactor; // In most cases, factor2 should equal factor1
    } else {
      // Fall back to some reasonable defaults if the data is incomplete
      visibleFactor = problem.factor1 !== null ? problem.factor1 : (problem.factor2 !== null ? problem.factor2 : 2);
      expectedAnswer = visibleFactor; // Assume equal factors as a fallback
    }
    
    // Store the factors in a normalized way:
    // - For missing operand problems, store the visible factor and expected answer
    // - This ensures different factor combinations are treated uniquely
    return {
      smaller: Math.min(visibleFactor, expectedAnswer),
      larger: Math.max(visibleFactor, expectedAnswer),
      problemType: problem.problemType,
      missingOperandPosition: problem.missingOperandPosition || 'first'
    };
  }
  
  // Standard normalization for regular multiplication problems
  const factor1 = problem.factor1 !== null ? problem.factor1 : 0;
  const factor2 = problem.factor2 !== null ? problem.factor2 : 0;
  
  return {
    smaller: Math.min(factor1, factor2),
    larger: Math.max(factor1, factor2),
    problemType: problem.problemType || 'multiplication'
  };
}
/**
 * Converts a normalized problem back to regular problem with randomized factor order.
 * This ensures that users see both orders of factors even though we treat them as the same problem.
 * For missing operand problems, preserves which operand is missing.
 * 
 * @param normalized Normalized problem
 * @returns Problem with randomized factor order
 */
private denormalizeProblem(normalized: NormalizedProblem): Problem {
  // For missing operand problems, use the specified missing operand position
  if (normalized.problemType === 'missing_factor') {
    if (normalized.missingOperandPosition === 'first') {
      // For "? × factor = product", set factor1 to null and factor2 to the value
      // Choose either smaller or larger as the visible factor (randomize)
      const visibleFactor = Math.random() < 0.5 ? normalized.smaller : normalized.larger;
      
      // Calculate the other factor (which will be the answer)
      const otherFactor = (visibleFactor === normalized.smaller) ? normalized.larger : normalized.smaller;
      
      return {
        factor1: null,
        factor2: visibleFactor,
        problemType: normalized.problemType,
        missingOperandPosition: 'first',
        // Add originalFactors as metadata to let controller know both factors
        originalFactors: {
          hidden: otherFactor,
          visible: visibleFactor
        }
      };
    } else {
      // For "factor × ? = product", set factor1 to the value and factor2 to null
      const visibleFactor = Math.random() < 0.5 ? normalized.smaller : normalized.larger;
      
      // Calculate the other factor (which will be the answer)
      const otherFactor = (visibleFactor === normalized.smaller) ? normalized.larger : normalized.smaller;
      
      return {
        factor1: visibleFactor,
        factor2: null,
        problemType: normalized.problemType,
        missingOperandPosition: 'second',
        // Add originalFactors as metadata to let controller know both factors
        originalFactors: {
          visible: visibleFactor,
          hidden: otherFactor
        }
      };
    }
  }
  
  // For regular multiplication, randomly decide factor order
  return Math.random() < 0.5
    ? { factor1: normalized.smaller, factor2: normalized.larger, problemType: normalized.problemType }
    : { factor1: normalized.larger, factor2: normalized.smaller, problemType: normalized.problemType };
}

  /**
   * Generates all possible unique problems within the configured range.
   * Uses normalization to avoid duplicate commutative pairs.
   * For missing operand problems, includes both first and second operand missing variants.
   * 
   * @param config Configuration parameters
   * @returns Array of all possible normalized problems
   */
  private generateAllProblems(config: ProblemSelectionConfig = DEFAULT_CONFIG): NormalizedProblem[] {
    const problems: NormalizedProblem[] = [];
    
    for (let i = config.minFactor; i <= config.maxFactor; i++) {
      for (let j = i; j <= config.maxFactor; j++) {  // Start from i to avoid duplicates
        // For regular multiplication problems
        if (config.problemType === 'multiplication') {
          problems.push({
            smaller: i,
            larger: j,
            problemType: 'multiplication'
          });
        } 
        // For missing operand problems, generate both variants (first or second missing)
        else if (config.problemType === 'missing_factor') {
          // First operand missing
          problems.push({
            smaller: i,
            larger: j,
            problemType: 'missing_factor',
            missingOperandPosition: 'first'
          });
          
          // Second operand missing
          problems.push({
            smaller: i,
            larger: j,
            problemType: 'missing_factor',
            missingOperandPosition: 'second'
          });
        }
      }
    }
    return problems;
  }

  /**
   * Selects the next problem to present to the user based on weights and history
   * 
   * @param userId User's ID
   * @param history User's problem history
   * @param config Configuration parameters
   * @returns Selected problem with randomized factor order
   */
  async selectNextProblem(
    userId: number,
    history: ProblemHistory[],
    config: ProblemSelectionConfig = DEFAULT_CONFIG
  ): Promise<Problem> {
    // Use appropriate config based on problem type
    const effectiveConfig = config.problemType === 'missing_factor' 
      ? {...MISSING_FACTOR_CONFIG, ...config} 
      : config;

    console.log(`\nSelecting next problem for user ${userId}:`);
    console.log(`Problem type: ${effectiveConfig.problemType}`);
    console.log(`Config: recentProblemCount=${effectiveConfig.recentProblemCount}, minFactor=${effectiveConfig.minFactor}, maxFactor=${effectiveConfig.maxFactor}`);
    
    // Generate all possible problems
    const allProblems = this.generateAllProblems(effectiveConfig);
    console.log(`Total possible problems: ${allProblems.length}`);
    
    // Filter history to only include problems of the same type
    const typeFilteredHistory = history.filter(h => h.problemType === effectiveConfig.problemType);
    
    // Get recent problems, sorted by timestamp (newest first)
    const recentHistory = [...typeFilteredHistory].sort((a, b) => b.timestamp - a.timestamp);
    
    // Convert history to normalized form for comparison
    const recentNormalized = recentHistory
      .slice(0, effectiveConfig.recentProblemCount)
      .map(h => this.normalizeProblem({
        factor1: h.factor1,
        factor2: h.factor2,
        problemType: h.problemType,
        missingOperandPosition: h.missingOperandPosition
      }));
    
    console.log(`Recent history count: ${recentHistory.length}`);
    console.log(`Problems to exclude: ${Math.min(recentNormalized.length, effectiveConfig.recentProblemCount)}`);
    
    // Filter out recently seen problems
    const availableProblems = allProblems.filter(p => {
      if (p.problemType === 'missing_factor') {
        // For missing operand problems, we need to match on both factors and which position is missing
        return !recentNormalized.some(r => 
          r.smaller === p.smaller && 
          r.larger === p.larger && 
          r.problemType === p.problemType &&
          r.missingOperandPosition === p.missingOperandPosition
        );
      } else {
        // For regular multiplication, just check the factors
        return !recentNormalized.some(r => 
          r.smaller === p.smaller && 
          r.larger === p.larger && 
          r.problemType === p.problemType
        );
      }
    });
    
    console.log(`Available problems after filtering: ${availableProblems.length}`);
    
    // Use a graduated fallback approach if we have few available problems
    const MIN_AVAILABLE_THRESHOLD = 3;
    let problemPool = availableProblems;
    
    if (availableProblems.length < MIN_AVAILABLE_THRESHOLD) {
      // If we have too few available problems, we'll use a more relaxed selection strategy
      if (availableProblems.length === 0) {
        console.log('No available problems after filtering recent history. Using full problem set.');
        problemPool = allProblems;
      } else {
        console.log(`Only ${availableProblems.length} problems available, but proceeding with limited selection.`);
      }
    }
    
    // Get problem weights for the pool
    const problemWeights: { problem: NormalizedProblem; weight: number }[] = [];
    for (const problem of problemPool) {
      const state = await this.storage.getProblemState(userId, problem);
      problemWeights.push({
        problem,
        weight: state.weight
      });
    }
    
    // Sort problems by weight (highest first)
    problemWeights.sort((a, b) => b.weight - a.weight);
    
    // Find all problems that have the highest weight
    const highestWeight = problemWeights[0].weight;
    const highestWeightProblems = problemWeights.filter(pw => pw.weight === highestWeight);
    
    console.log(`Found ${highestWeightProblems.length} problems with the highest weight (${highestWeight.toFixed(2)})`);
    
    // Randomly select one from the highest weight problems for more variety
    const randomIndex = Math.floor(Math.random() * highestWeightProblems.length);
    const selected = highestWeightProblems[randomIndex].problem;
    
    // Format problem description for logging
    let problemDesc = '';
    if (selected.problemType === 'missing_factor') {
      problemDesc = `${selected.missingOperandPosition === 'first' ? '?' : selected.smaller}×${selected.missingOperandPosition === 'second' ? '?' : selected.larger}`;
    } else {
      problemDesc = `${selected.smaller}×${selected.larger}`;
    }
    
    console.log(`Randomly selected problem: ${problemDesc} (weight: ${highestWeight.toFixed(2)}) from ${highestWeightProblems.length} equally weighted problems`);
    
    // Return the selected problem in randomized factor order
    return this.denormalizeProblem(selected);
  }

  /**
   * Updates a problem's weight based on user performance
   * 
   * @param userId User's ID
   * @param problem The problem that was attempted
   * @param correct Whether the answer was correct
   * @param timeToAnswer Time taken to answer in milliseconds
   * @param config Configuration parameters
   */
  async updateProblemAfterAttempt(
    userId: number,
    problem: Problem,
    correct: boolean,
    timeToAnswer: number,
    config: ProblemSelectionConfig = DEFAULT_CONFIG
  ): Promise<void> {
    // Use appropriate config based on problem type
    const effectiveConfig = problem.problemType === 'missing_factor' 
      ? {...MISSING_FACTOR_CONFIG, ...config} 
      : {...DEFAULT_CONFIG, ...config};

    // Normalize problem to ensure consistent storage regardless of factor order
    const normalized = this.normalizeProblem(problem);
    const state = await this.storage.getProblemState(userId, normalized);

    // Update weight based on performance
    let newWeight = state.weight;
    let adjustmentReason = '';

    if (!correct) {
      // Incorrect answer: increase weight
      newWeight += effectiveConfig.weightIncreaseWrong;
      adjustmentReason = `incorrect answer (+${effectiveConfig.weightIncreaseWrong})`;
    } else {
      // Correct answer: calculate weight reduction based on response time
      let weightReduction = 0;
      const targetTime = effectiveConfig.targetResponseTime;
      const maxTime = targetTime * effectiveConfig.maxResponseTimeFactor;

      if (timeToAnswer <= targetTime) {
        // Fast response: linear reduction from maxWeightDecrease to midWeightDecrease
        weightReduction = effectiveConfig.maxWeightDecrease -
          ((effectiveConfig.maxWeightDecrease - effectiveConfig.midWeightDecrease) * timeToAnswer / targetTime);
        adjustmentReason = `fast correct answer (${timeToAnswer}ms, -${weightReduction.toFixed(2)})`;
      } else if (timeToAnswer < maxTime) {
        // Slow response: linear reduction from midWeightDecrease to 0
        weightReduction = effectiveConfig.midWeightDecrease *
          (1 - (timeToAnswer - targetTime) / (maxTime - targetTime));
        adjustmentReason = `slow correct answer (${timeToAnswer}ms, -${weightReduction.toFixed(2)})`;
      } else {
        // Very slow response: no reduction
        weightReduction = 0;
        adjustmentReason = `very slow correct answer (${timeToAnswer}ms, -${weightReduction})`;
      }

      newWeight -= weightReduction;
    }

    // Ensure weight doesn't go below 1
    const wasClipped = newWeight < 1;
    newWeight = Math.max(1, newWeight);

    // Update state with new weight and timestamp
    await this.storage.updateProblemState(userId, normalized, {
      weight: newWeight,
      lastSeen: Date.now(),
      problemType: normalized.problemType
    });

    // Format problem description for logging
    let problemDesc = '';
    if (normalized.problemType === 'missing_factor') {
      problemDesc = `${normalized.missingOperandPosition === 'first' ? '?' : normalized.smaller}×${normalized.missingOperandPosition === 'second' ? '?' : normalized.larger}`;
    } else {
      problemDesc = `${normalized.smaller}×${normalized.larger}`;
    }

    // Enhanced logging for debugging
    console.log(`Problem ${problemDesc} weight updated:`, {
      userId,
      problemType: normalized.problemType,
      oldWeight: state.weight,
      newWeight,
      weightChange: newWeight - state.weight,
      correct,
      timeToAnswer,
      targetResponseTime: effectiveConfig.targetResponseTime,
      adjustmentReason,
      wasClipped: wasClipped ? 'Yes (minimum weight enforced)' : 'No'
    });
  }

  /**
   * Gets the current state of a problem for a user, using normalization
   * to ensure consistent state regardless of factor order.
   * 
   * @param userId User's ID
   * @param problem Problem to get state for (could be in any order)
   * @returns Current problem state
   */
  async getProblemState(userId: number, problem: Problem): Promise<ProblemStateData> {
    const normalized = this.normalizeProblem(problem);
    return await this.storage.getProblemState(userId, normalized);
  }
}

export const problemSelector = new ProblemSelector();