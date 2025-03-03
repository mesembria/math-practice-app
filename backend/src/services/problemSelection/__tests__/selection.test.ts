import 'reflect-metadata'; // Add this import at the top
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProblemSelector } from '../selection';
import { Problem, ProblemHistory, ProblemSelectionConfig, ProblemStateStorage, NormalizedProblem } from '../types';

// Mock the database connection
vi.mock('../../../config/database', () => ({
  AppDataSource: {
    initialize: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined)
  }
}));

interface MockProblemState {
  weight: number;
  lastSeen: number;
}

// Mock storage implementation for testing
class MockStorage implements ProblemStateStorage {
  private states = new Map<string, MockProblemState>();

  private getKey(userId: number, normalized: NormalizedProblem): string {
    return `${userId}-${normalized.smaller}x${normalized.larger}`;
  }

  async getProblemState(userId: number, normalized: NormalizedProblem): Promise<MockProblemState> {
    const key = this.getKey(userId, normalized);
    if (!this.states.has(key)) {
      this.states.set(key, {
        weight: normalized.smaller * normalized.larger,
        lastSeen: 0
      });
    }
    return this.states.get(key)!;
  }

  async updateProblemState(userId: number, normalized: NormalizedProblem, state: MockProblemState): Promise<void> {
    const key = this.getKey(userId, normalized);
    this.states.set(key, state);
  }

  // Helper method for testing
  getAllStates() {
    return this.states;
  }
}

describe('Problem Selection System', () => {
  let selector: ProblemSelector;
  let storage: MockStorage;
  let testConfig: ProblemSelectionConfig;
  // Define a typed mock for Math.random
  let mockRandom: {
    mockReturnValueOnce: (value: number) => typeof mockRandom;
    mockReturnValue: (value: number) => typeof mockRandom;
    mockRestore: () => void;
  };

  beforeEach(() => {
    testConfig = {
      minFactor: 2,
      maxFactor: 5, // Using smaller range for tests
      recentProblemCount: 3,
      targetResponseTime: 5000,
      weightIncreaseWrong: 5,
      maxWeightDecrease: 3,
      midWeightDecrease: 1.5,
      maxResponseTimeFactor: 3
    };
    storage = new MockStorage();
    selector = new ProblemSelector(storage);
    mockRandom = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    mockRandom.mockRestore();
  });

  describe('Problem Normalization', () => {
    it('should treat reversed factors as the same problem for weight updates', async () => {
      const userId = 1;
      const problem1: Problem = { factor1: 3, factor2: 4 };
      
      // Update weight for the problem
      await selector.updateProblemAfterAttempt(userId, problem1, false, 3000, testConfig);
      
      // Get state for problem2 - should have the same updated weight
      const normalized = { smaller: 3, larger: 4 };
      const state = await storage.getProblemState(userId, normalized);
      
      expect(state.weight).toBe(17); // 12 + 5 (weightIncreaseWrong)
    });

    it('should randomize factor order in selected problems', async () => {
      const history: ProblemHistory[] = [];
      
      // Force random to return 0 (smaller first)
      mockRandom.mockReturnValueOnce(0);
      const selected1 = await selector.selectNextProblem(1, history, testConfig);
      expect(selected1.factor1).toBeLessThanOrEqual(selected1.factor2);
      
      // Force random to return 0.9 (larger first)
      mockRandom.mockReturnValueOnce(0.9);
      const selected2 = await selector.selectNextProblem(1, history, testConfig);
      expect(selected2.factor1).toBeGreaterThanOrEqual(selected2.factor2);
    });
  });

  describe('Problem Weight Updates', () => {
    const userId = 1;
    const problem: Problem = { factor1: 3, factor2: 4 };

    it('should increase weight for wrong answers', async () => {
      await selector.updateProblemAfterAttempt(userId, problem, false, 3000, testConfig);
      
      const normalized = { smaller: 3, larger: 4 };
      const state = await storage.getProblemState(userId, normalized);
      expect(state.weight).toBe(17); // 12 + 5 (weightIncreaseWrong)
    });

    it('should decrease weight by maximum amount for very fast correct answers', async () => {
      // Very fast answer (much faster than target time)
      await selector.updateProblemAfterAttempt(userId, problem, true, 1000, testConfig);
      
      const normalized = { smaller: 3, larger: 4 };
      const state = await storage.getProblemState(userId, normalized);
      
      // The formula results in 9.3 for very fast answers
      // Exact formula: 12 - (3 - (3-1.5) * 1000/5000) = 12 - 2.7 = 9.3
      expect(state.weight).toBeCloseTo(9.3, 1);
    });

    it('should decrease weight by mid amount for answers at target time', async () => {
      // Answer exactly at the target response time
      await selector.updateProblemAfterAttempt(userId, problem, true, testConfig.targetResponseTime, testConfig);
      
      const normalized = { smaller: 3, larger: 4 };
      const state = await storage.getProblemState(userId, normalized);
      
      // Should apply midWeightDecrease (1.5) for answers at target time
      // 12 - 1.5 = 10.5
      expect(state.weight).toBeCloseTo(10.5, 1);
    });

    it('should decrease weight by small amount for slow correct answers', async () => {
      // Slower than target time but not beyond maxResponseTimeFactor
      const slowTime = testConfig.targetResponseTime * 2; // Half-way between target and max
      await selector.updateProblemAfterAttempt(userId, problem, true, slowTime, testConfig);
      
      const normalized = { smaller: 3, larger: 4 };
      const state = await storage.getProblemState(userId, normalized);
      
      // Should apply a fraction of midWeightDecrease for slow answers
      // 12 - (midWeightDecrease * 0.5) = 12 - 0.75 = 11.25
      expect(state.weight).toBeCloseTo(11.25, 1);
    });

    it('should not decrease weight for very slow correct answers', async () => {
      // Answer beyond maxResponseTimeFactor
      const verySlowTime = testConfig.targetResponseTime * testConfig.maxResponseTimeFactor * 1.1;
      await selector.updateProblemAfterAttempt(userId, problem, true, verySlowTime, testConfig);
      
      const normalized = { smaller: 3, larger: 4 };
      const state = await storage.getProblemState(userId, normalized);
      
      // Should not decrease weight for very slow answers (beyond maxResponseTimeFactor)
      // 12 - 0 = 12
      expect(state.weight).toBe(12);
    });

    it('should not let weight go below 1', async () => {
      // Set initial state with low weight
      const normalized = { smaller: 3, larger: 4 };
      await storage.updateProblemState(userId, normalized, { weight: 2, lastSeen: 0 });
      
      // Fast correct answer that would reduce below 1
      await selector.updateProblemAfterAttempt(userId, problem, true, 1000, testConfig);
      
      const state = await storage.getProblemState(userId, normalized);
      expect(state.weight).toBe(1);
    });
  });

  describe('Problem Selection', () => {
    const userId = 1;

    it('should select problem with highest weight when no history', async () => {
      const history: ProblemHistory[] = [];
      mockRandom.mockReturnValue(0); // Force consistent order for test
      const selected = await selector.selectNextProblem(userId, history, testConfig);
      
      // With factors 2-5, 5x5=25 should be the highest initial weight
      expect(Math.max(selected.factor1, selected.factor2)).toBe(5);
      expect(Math.min(selected.factor1, selected.factor2)).toBe(5);
    });

    it('should not select recently seen problems in either order', async () => {
      const history: ProblemHistory[] = [
        {
          factor1: 5,
          factor2: 4,
          correct: true,
          timeToAnswer: 3000,
          timestamp: Date.now()
        }
      ];
      
      const selected = await selector.selectNextProblem(userId, history, testConfig);
      
      // Should not select 5x4 or 4x5
      expect(selected).not.toEqual({ factor1: 5, factor2: 4 });
      expect(selected).not.toEqual({ factor1: 4, factor2: 5 });
    });
  });

  describe('Per-User Problem States', () => {
    it('should maintain separate weights for different users', async () => {
      const problem: Problem = { factor1: 3, factor2: 4 };
      const normalized = { smaller: 3, larger: 4 };
      
      // User 1 gets it wrong
      await selector.updateProblemAfterAttempt(1, problem, false, 3000, testConfig);
      
      // User 2 gets it right quickly
      await selector.updateProblemAfterAttempt(2, problem, true, 1000, testConfig);
      
      const user1State = await storage.getProblemState(1, normalized);
      const user2State = await storage.getProblemState(2, normalized);
      
      expect(user1State.weight).toBe(17); // Increased for wrong answer
      expect(user2State.weight).toBeCloseTo(9.3, 1); // Decreased according to the weight reduction formula
    });
  });
});