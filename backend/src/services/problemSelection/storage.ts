import { NormalizedProblem, ProblemState, ProblemStateStorage } from './types';

export class InMemoryProblemStateStorage implements ProblemStateStorage {
  private states: Map<string, ProblemState>;

  constructor() {
    this.states = new Map();
  }

  private getKey(userId: number, normalized: NormalizedProblem): string {
    return `${userId}-${normalized.smaller}x${normalized.larger}`;
  }

  async getProblemState(userId: number, normalized: NormalizedProblem): Promise<ProblemState> {
    const key = this.getKey(userId, normalized);
    if (!this.states.has(key)) {
      // Initialize with default weight of 10, consistent with SQLite implementation
      this.states.set(key, {
        weight: 10,
        lastSeen: 0
      });
    }
    return this.states.get(key)!;
  }

  async updateProblemState(userId: number, normalized: NormalizedProblem, state: ProblemState): Promise<void> {
    const key = this.getKey(userId, normalized);
    this.states.set(key, state);
  }
}