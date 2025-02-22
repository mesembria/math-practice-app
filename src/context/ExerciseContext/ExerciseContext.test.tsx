import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { ExerciseProvider } from './ExerciseContext';
import { useExercise } from './useExercise';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ExerciseContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ExerciseProvider numberOfProblems={5}>{children}</ExerciseProvider>
  );

  describe('Initial State', () => {
    it('should initialize with correct number of problems', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      expect(result.current.state.problems.length).toBe(5);
    });

    it('should generate problems within factor range', () => {
      const { result } = renderHook(() => useExercise(), {
        wrapper: ({ children }) => (
          <ExerciseProvider numberOfProblems={10} minFactor={2} maxFactor={5}>
            {children}
          </ExerciseProvider>
        ),
      });

      result.current.state.problems.forEach((problem) => {
        expect(problem.factor1).toBeGreaterThanOrEqual(2);
        expect(problem.factor1).toBeLessThanOrEqual(5);
        expect(problem.factor2).toBeGreaterThanOrEqual(2);
        expect(problem.factor2).toBeLessThanOrEqual(5);
      });
    });

    it('should avoid immediate repetition of factors', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      const problems = result.current.state.problems;
      
      for (let i = 1; i < problems.length; i++) {
        const current = problems[i];
        const previous = problems[i - 1];
        expect(
          current.factor1 === previous.factor1 && 
          current.factor2 === previous.factor2
        ).toBe(false);
      }
    });
  });

  describe('Actions', () => {
    it('should handle setting answer', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      
      act(() => {
        result.current.setAnswer('42');
      });

      expect(result.current.state.currentAnswer).toBe('42');
    });

    it('should handle submitting correct answer', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      const problem = result.current.state.problems[0];
      
      act(() => {
        result.current.setAnswer(String(problem.answer));
        result.current.submitAnswer();
      });

      expect(result.current.state.results[0]).toBe(true);
      expect(result.current.state.isRetryMode).toBe(false);
    });

    it('should handle submitting incorrect answer', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      const problem = result.current.state.problems[0];
      
      act(() => {
        result.current.setAnswer(String(problem.answer + 1));
        result.current.submitAnswer();
      });

      expect(result.current.state.results[0]).toBe(false);
      expect(result.current.state.isRetryMode).toBe(true);
    });

    it('should handle moving to next problem', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      
      act(() => {
        result.current.nextProblem();
      });

      expect(result.current.state.currentIndex).toBe(1);
      expect(result.current.state.currentAnswer).toBe('');
    });

    it('should handle toggling pause', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      
      act(() => {
        result.current.togglePause();
      });

      expect(result.current.state.isPaused).toBe(true);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.state.isPaused).toBe(false);
    });

    it('should handle restarting exercise', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      
      // Progress through exercise
      act(() => {
        result.current.setAnswer('42');
        result.current.submitAnswer();
        result.current.nextProblem();
      });

      // Restart
      act(() => {
        result.current.restartExercise();
      });

      expect(result.current.state.currentIndex).toBe(0);
      expect(result.current.state.results).toHaveLength(0);
      expect(result.current.state.isComplete).toBe(false);
    });
  });

  describe('Computed Values', () => {
    it('should calculate isLastProblem correctly', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      
      expect(result.current.isLastProblem).toBe(false);

      // Progress to last problem
      act(() => {
        for (let i = 0; i < 4; i++) {
          result.current.nextProblem();
        }
      });

      expect(result.current.isLastProblem).toBe(true);
    });

    it('should calculate percentComplete correctly', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      
      expect(result.current.percentComplete).toBe(0);

      // Complete 2 problems
      act(() => {
        result.current.setAnswer('42');
        result.current.submitAnswer();
        result.current.nextProblem();
        result.current.setAnswer('42');
        result.current.submitAnswer();
      });

      expect(result.current.percentComplete).toBe(40); // 2/5 * 100
    });

  });

  describe('LocalStorage Persistence', () => {
    it('should save state to localStorage', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      
      act(() => {
        result.current.setAnswer('42');
        result.current.submitAnswer();
      });

      const savedState = JSON.parse(localStorage.getItem('exerciseState') || '');
      expect(savedState.results).toHaveLength(1);
    });

    it('should restore state from localStorage', () => {
      // Set up initial state in localStorage
      const initialState = {
        problems: [{ factor1: 2, factor2: 3, answer: 6 }],
        currentIndex: 0,
        currentAnswer: '42',
        isComplete: false,
        results: [true],
        startTime: Date.now(),
        problemStartTime: Date.now(),
        isPaused: false,
        isRetryMode: false
      };
      localStorage.setItem('exerciseState', JSON.stringify(initialState));

      const { result } = renderHook(() => useExercise(), { wrapper });
      
      expect(result.current.state.currentAnswer).toBe('42');
      expect(result.current.state.results).toHaveLength(1);
    });

    it('should clear localStorage when exercise is complete', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      
      // Complete all problems correctly
      for (let i = 0; i < 5; i++) {
        const problem = result.current.state.problems[i];
        act(() => {
          result.current.setAnswer(String(problem.answer));
          result.current.submitAnswer();
          if (i < 4) result.current.nextProblem();
        });
      }

      expect(localStorage.getItem('exerciseState')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useExercise is used outside provider', () => {
      try {
        renderHook(() => useExercise());
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toEqual(
          new Error(
            'useExercise must be used within an ExerciseProvider. ' +
            'Wrap a parent component in <ExerciseProvider> to fix this error.'
          )
        );
      }
    });
  });

  describe('Complete Exercise Flow', () => {
    it('should handle complete exercise flow', () => {
      const { result } = renderHook(() => useExercise(), { wrapper });
      
      // Start exercise
      expect(result.current.state.currentIndex).toBe(0);
      expect(result.current.state.isComplete).toBe(false);

      // Answer first problem correctly
      act(() => {
        const problem = result.current.state.problems[0];
        result.current.setAnswer(String(problem.answer));
        result.current.submitAnswer();
      });

      expect(result.current.state.results[0]).toBe(true);

      // Move to second problem
      act(() => {
        result.current.nextProblem();
      });

      expect(result.current.state.currentIndex).toBe(1);

      // Answer second problem incorrectly
      act(() => {
        const problem = result.current.state.problems[1];
        result.current.setAnswer(String(problem.answer + 1));
        result.current.submitAnswer();
      });

      expect(result.current.state.results[1]).toBe(false);
      expect(result.current.state.isRetryMode).toBe(true);

      // Complete remaining problems
      for (let i = 2; i < 5; i++) {
        act(() => {
          result.current.nextProblem();
        });
        
        act(() => {
          const problem = result.current.state.problems[i];
          result.current.setAnswer(String(problem.answer));
          result.current.submitAnswer();
        });
      }

      expect(result.current.state.isComplete).toBe(true);
      expect(result.current.state.results).toHaveLength(5);
    });
  });
});
