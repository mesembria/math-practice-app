import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ProblemSelector } from '../selection';
import { Problem, ProblemHistory, ProblemSelectionConfig, ProblemStateStorage, NormalizedProblem } from '../types';

// Mock storage implementation for testing
class MockStorage implements ProblemStateStorage {
  private states = new Map<string, { weight: number; lastSeen: number }>();

  private getKey(userId: number, normalized: NormalizedProblem): string {
    return `${userId}-${normalized.smaller}x${normalized.larger}`;
  }

  getProblemState(userId: number, normalized: NormalizedProblem) {
    const key = this.getKey(userId, normalized);
    if (!this.states.has(key)) {
      this.states.set(key, {
        weight: normalized.smaller * normalized.larger,
        lastSeen: 0
      });
    }
    return this.states.get(key)!;
  }

  updateProblemState(userId: number, normalized: NormalizedProblem, state: { weight: number; lastSeen: number }) {
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
  let mockRandom: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    testConfig = {
      minFactor: 2,
      maxFactor: 5, // Using smaller range for tests
      recentProblemCount: 3,
      targetResponseTime: 5000,
      weightIncreaseWrong: 5,
      weightDecreaseFast: 3,
      weightDecreaseSlow: 1
    };
    storage = new MockStorage();
    selector = new ProblemSelector(storage);
    mockRandom = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    mockRandom.mockRestore();
  });

  describe('Problem Normalization', () => {
    it('should treat reversed factors as the same problem for weight updates', () => {
      const userId = 1;
      const problem1: Problem = { factor1: 3, factor2: 4 };
      
      // Update weight for the problem
      selector.updateProblemAfterAttempt(userId, problem1, false, 3000, testConfig);
      
      // Get state for problem2 - should have the same updated weight
      const normalized = { smaller: 3, larger: 4 };
      const state = storage.getProblemState(userId, normalized);
      
      expect(state.weight).toBe(17); // 12 + 5 (weightIncreaseWrong)
    });

    it('should randomize factor order in selected problems', () => {
      const history: ProblemHistory[] = [];
      
      // Force random to return 0 (smaller first)
      mockRandom.mockReturnValueOnce(0);
      const selected1 = selector.selectNextProblem(1, history, testConfig);
      expect(selected1.factor1).toBeLessThanOrEqual(selected1.factor2);
      
      // Force random to return 0.9 (larger first)
      mockRandom.mockReturnValueOnce(0.9);
      const selected2 = selector.selectNextProblem(1, history, testConfig);
      expect(selected2.factor1).toBeGreaterThanOrEqual(selected2.factor2);
    });
  });

  describe('Problem Weight Updates', () => {
    const userId = 1;
    const problem: Problem = { factor1: 3, factor2: 4 };

    it('should increase weight for wrong answers', () => {
      selector.updateProblemAfterAttempt(userId, problem, false, 3000, testConfig);
      
      const normalized = { smaller: 3, larger: 4 };
      const state = storage.getProblemState(userId, normalized);
      expect(state.weight).toBe(17); // 12 + 5 (weightIncreaseWrong)
    });

    it('should decrease weight more for fast correct answers', () => {
      selector.updateProblemAfterAttempt(userId, problem, true, 3000, testConfig);
      
      const normalized = { smaller: 3, larger: 4 };
      const state = storage.getProblemState(userId, normalized);
      expect(state.weight).toBe(9); // 12 - 3 (weightDecreaseFast)
    });

    it('should decrease weight less for slow correct answers', () => {
      selector.updateProblemAfterAttempt(userId, problem, true, 6000, testConfig);
      
      const normalized = { smaller: 3, larger: 4 };
      const state = storage.getProblemState(userId, normalized);
      expect(state.weight).toBe(11); // 12 - 1 (weightDecreaseSlow)
    });

    it('should not let weight go below 1', () => {
      // Multiple fast correct answers
      for (let i = 0; i < 5; i++) {
        selector.updateProblemAfterAttempt(userId, problem, true, 3000, testConfig);
      }
      
      const normalized = { smaller: 3, larger: 4 };
      const state = storage.getProblemState(userId, normalized);
      expect(state.weight).toBe(1);
    });
  });

  describe('Problem Selection', () => {
    const userId = 1;

    it('should select problem with highest weight when no history', () => {
      const history: ProblemHistory[] = [];
      mockRandom.mockReturnValue(0); // Force consistent order for test
      const selected = selector.selectNextProblem(userId, history, testConfig);
      
      // With factors 2-5, 5x5=25 should be the highest initial weight
      expect(Math.max(selected.factor1, selected.factor2)).toBe(5);
      expect(Math.min(selected.factor1, selected.factor2)).toBe(5);
    });

    it('should not select recently seen problems in either order', () => {
      const history: ProblemHistory[] = [
        {
          factor1: 5,
          factor2: 4,
          correct: true,
          timeToAnswer: 3000,
          timestamp: Date.now()
        }
      ];
      
      const selected = selector.selectNextProblem(userId, history, testConfig);
      
      // Should not select 5x4 or 4x5
      expect(selected).not.toEqual({ factor1: 5, factor2: 4 });
      expect(selected).not.toEqual({ factor1: 4, factor2: 5 });
    });
  });

  describe('Per-User Problem States', () => {
    it('should maintain separate weights for different users', () => {
      const problem: Problem = { factor1: 3, factor2: 4 };
      const normalized = { smaller: 3, larger: 4 };
      
      // User 1 gets it wrong
      selector.updateProblemAfterAttempt(1, problem, false, 3000, testConfig);
      
      // User 2 gets it right quickly
      selector.updateProblemAfterAttempt(2, problem, true, 3000, testConfig);
      
      const user1State = storage.getProblemState(1, normalized);
      const user2State = storage.getProblemState(2, normalized);
      
      expect(user1State.weight).toBe(17); // Increased for wrong answer
      expect(user2State.weight).toBe(9);  // Decreased for fast correct answer
    });
  });
});
