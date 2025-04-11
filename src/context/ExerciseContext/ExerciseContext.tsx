import React, { createContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { ExerciseState, ExerciseAction, ExerciseContextValue, ExerciseProviderProps, Problem } from './types';

const LOCAL_STORAGE_KEY = 'exerciseState';

const generateProblem = (minFactor: number, maxFactor: number, previousProblems: Problem[] = []): Problem => {
  let factor1: number, factor2: number;
  do {
    factor1 = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
    factor2 = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
  } while (
    previousProblems.length > 0 &&
    previousProblems[previousProblems.length - 1].factor1 === factor1 &&
    previousProblems[previousProblems.length - 1].factor2 === factor2
  );

  return {
    factor1,
    factor2,
    answer: factor1 * factor2
  };
};

const generateProblems = (count: number, minFactor: number, maxFactor: number): Problem[] => {
  const problems: Problem[] = [];
  for (let i = 0; i < count; i++) {
    problems.push(generateProblem(minFactor, maxFactor, problems));
  }
  return problems;
};

const createInitialState = (numberOfProblems: number, minFactor: number, maxFactor: number): ExerciseState => {
  return {
    problems: generateProblems(numberOfProblems, minFactor, maxFactor),
    currentIndex: 0,
    currentAnswer: '',
    isComplete: false,
    isPaused: false,
    isRetryMode: false,
    results: new Array(numberOfProblems).fill(null),
    startTime: Date.now(),
    problemStartTime: Date.now()
  };
};

const exerciseReducer = (state: ExerciseState, action: ExerciseAction): ExerciseState => {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        currentAnswer: action.payload
      };

    case 'SUBMIT_ANSWER': {
      const currentProblem = state.problems[state.currentIndex];
      const isCorrect = parseInt(state.currentAnswer) === currentProblem.answer;
      const newResults = [...state.results];
      newResults[state.currentIndex] = isCorrect;
      
      return {
        ...state,
        results: newResults,
        isRetryMode: !isCorrect,
        currentAnswer: '',
        isComplete: state.currentIndex === state.problems.length - 1 && isCorrect,
        problemStartTime: Date.now()
      };
    }

    case 'NEXT_PROBLEM': {
      const nextIndex = state.currentIndex + 1;
      return {
        ...state,
        currentIndex: Math.min(nextIndex, state.problems.length - 1),
        currentAnswer: '',
        isRetryMode: false,
        problemStartTime: Date.now()
      };
    }

    case 'TOGGLE_PAUSE':
      return {
        ...state,
        isPaused: !state.isPaused,
        problemStartTime: !state.isPaused ? Date.now() : state.problemStartTime
      };

    case 'RESTART_EXERCISE':
      return {
        ...state,
        currentIndex: 0,
        currentAnswer: '',
        isComplete: false,
        isPaused: false,
        isRetryMode: false,
        results: new Array(state.problems.length).fill(null),
        startTime: Date.now(),
        problemStartTime: Date.now()
      };

    default:
      return state;
  }
};

export const ExerciseContext = createContext<ExerciseContextValue | null>(null);

if (process.env.NODE_ENV === 'development') {
  ExerciseContext.displayName = 'ExerciseContext';
}

export const ExerciseProvider: React.FC<ExerciseProviderProps> = ({
  numberOfProblems,
  minFactor = 2,
  maxFactor = 12,
  children
}) => {
  const [state, dispatch] = useReducer(
    exerciseReducer,
    { numberOfProblems, minFactor, maxFactor },
    () => {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (!parsedState.isComplete) {
          return {
            ...parsedState,
            startTime: Date.now(),
            problemStartTime: Date.now()
          };
        }
      }
      return createInitialState(numberOfProblems, minFactor, maxFactor);
    }
  );

  useEffect(() => {
    if (state.isComplete) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const setAnswer = useCallback((value: string) => {
    dispatch({ type: 'SET_ANSWER', payload: value });
  }, []);

  const submitAnswer = useCallback(() => {
    dispatch({ type: 'SUBMIT_ANSWER' });
  }, []);

  const nextProblem = useCallback(() => {
    dispatch({ type: 'NEXT_PROBLEM' });
  }, []);

  const togglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, []);

  const restartExercise = useCallback(() => {
    dispatch({ type: 'RESTART_EXERCISE' });
  }, []);

  const contextValue = useMemo<ExerciseContextValue>(() => {
    // Get current time inside the memo to ensure it updates
    const now = Date.now();
    return {
      state,
      setAnswer,
      submitAnswer,
      nextProblem,
      togglePause,
      restartExercise,
      isLastProblem: state.currentIndex === state.problems.length - 1,
      currentProblem: state.problems[state.currentIndex],
      percentComplete: (state.results.filter(result => result !== null).length / state.problems.length) * 100,
      timeElapsed: now - state.startTime
    };
  }, [
    state,
    setAnswer,
    submitAnswer,
    nextProblem,
    togglePause,
    restartExercise
  ]);

  return (
    <ExerciseContext.Provider value={contextValue}>
      {children}
    </ExerciseContext.Provider>
  );
};
