import { Problem, ProblemHistory, ProblemSelectionConfig, DEFAULT_CONFIG, ProblemStateStorage, NormalizedProblem, ProblemState } from './types';
import { SQLiteProblemStateStorage } from './sqliteStorage';

export class ProblemSelector {
  protected storage: ProblemStateStorage;

  constructor(storage?: ProblemStateStorage) {
    this.storage = storage || new SQLiteProblemStateStorage();
  }

  /**
   * Normalizes a problem by ensuring smaller factor comes first.
   * This ensures that commutative pairs (e.g., 3×4 and 4×3) are treated as the same problem.
   * 
   * @param problem Problem to normalize
   * @returns Normalized problem with smaller factor first
   */
  private normalizeProblem(problem: Problem): NormalizedProblem {
    return {
      smaller: Math.min(problem.factor1, problem.factor2),
      larger: Math.max(problem.factor1, problem.factor2)
    };
  }

  /**
   * Converts a normalized problem back to regular problem with randomized factor order.
   * This ensures that users see both orders of factors even though we treat them as the same problem.
   * 
   * @param normalized Normalized problem
   * @returns Problem with randomized factor order
   */
  private denormalizeProblem(normalized: NormalizedProblem): Problem {
    // Randomly decide factor order
    return Math.random() < 0.5
      ? { factor1: normalized.smaller, factor2: normalized.larger }
      : { factor1: normalized.larger, factor2: normalized.smaller };
  }

  /**
   * Generates all possible unique problems within the configured range.
   * Uses normalization to avoid duplicate commutative pairs.
   * 
   * @param config Configuration parameters
   * @returns Array of all possible normalized problems
   */
  private generateAllProblems(config: ProblemSelectionConfig = DEFAULT_CONFIG): NormalizedProblem[] {
    const problems: NormalizedProblem[] = [];
    for (let i = config.minFactor; i <= config.maxFactor; i++) {
      for (let j = i; j <= config.maxFactor; j++) {  // Start from i to avoid duplicates
        problems.push({ smaller: i, larger: j });
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
  console.log(`\nSelecting next problem for user ${userId}:`);
  console.log(`Config: recentProblemCount=${config.recentProblemCount}, minFactor=${config.minFactor}, maxFactor=${config.maxFactor}`);
  
  // Generate all possible problems
  const allProblems = this.generateAllProblems(config);
  console.log(`Total possible problems: ${allProblems.length}`);
  
  // Get recent problems, sorted by timestamp (newest first)
  const recentHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
  
  // Convert history to normalized form for comparison
  const recentNormalized = recentHistory
    .slice(0, config.recentProblemCount)
    .map(h => this.normalizeProblem(h));
  
  console.log(`Recent history count: ${recentHistory.length}`);
  console.log(`Problems to exclude: ${Math.min(recentNormalized.length, config.recentProblemCount)}`);
  
  if (recentNormalized.length > 0) {
    console.log('Most recent problems:');
    recentNormalized.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i+1}. ${p.smaller}×${p.larger} (${recentHistory[i].timestamp})`);
    });
  }
  
  // Filter out recently seen problems
  const availableProblems = allProblems.filter(p => 
    !recentNormalized.some(r => 
      r.smaller === p.smaller && r.larger === p.larger
    )
  );
  
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
  
  console.log(`Randomly selected problem: ${selected.smaller}×${selected.larger} (weight: ${highestWeight.toFixed(2)}) from ${highestWeightProblems.length} equally weighted problems`);
  
  // Return the selected problem in randomized factor order
  return this.denormalizeProblem(selected);
}

async updateProblemAfterAttempt(
  userId: number,
  problem: Problem,
  correct: boolean,
  timeToAnswer: number,
  config: ProblemSelectionConfig = DEFAULT_CONFIG
): Promise<void> {
  // Normalize problem to ensure consistent storage regardless of factor order
  const normalized = this.normalizeProblem(problem);
  const state = await this.storage.getProblemState(userId, normalized);
  
  // Update weight based on performance
  let newWeight = state.weight;
  let adjustmentReason = '';
  
  if (!correct) {
    // Incorrect answer: increase weight
    newWeight += config.weightIncreaseWrong;
    adjustmentReason = `incorrect answer (+${config.weightIncreaseWrong})`;
  } else if (timeToAnswer < config.targetResponseTime) {
    // Fast correct answer: decrease weight more
    newWeight -= config.weightDecreaseFast;
    adjustmentReason = `fast correct answer (-${config.weightDecreaseFast})`;
  } else {
    // Slow correct answer: decrease weight less
    newWeight -= config.weightDecreaseSlow;
    adjustmentReason = `slow correct answer (-${config.weightDecreaseSlow})`;
  }

  // Ensure weight doesn't go below 1
  const wasClipped = newWeight < 1;
  newWeight = Math.max(1, newWeight);

  // Update state with new weight and timestamp
  await this.storage.updateProblemState(userId, normalized, {
    weight: newWeight,
    lastSeen: Date.now()
  });

  // Enhanced logging for debugging
  console.log(`Problem ${normalized.smaller}x${normalized.larger} weight updated:`, {
    userId,
    oldWeight: state.weight,
    newWeight,
    weightChange: newWeight - state.weight,
    correct,
    timeToAnswer,
    targetResponseTime: config.targetResponseTime,
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
  async getProblemState(userId: number, problem: Problem): Promise<ProblemState> {
    const normalized = this.normalizeProblem(problem);
    return await this.storage.getProblemState(userId, normalized);
  }
}

export const problemSelector = new ProblemSelector();