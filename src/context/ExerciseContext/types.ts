export interface Problem {
  factor1: number;
  factor2: number;
  answer: number;
}

export interface ExerciseState {
  problems: Problem[];
  currentIndex: number;
  currentAnswer: string;
  isComplete: boolean;
  isPaused: boolean;
  isRetryMode: boolean;
  results: boolean[];
  startTime: number;
  problemStartTime: number;
}

export type ExerciseAction =
  | { type: 'SET_ANSWER'; payload: string }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'NEXT_PROBLEM' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'RESTART_EXERCISE' };

export interface ExerciseContextValue {
  state: ExerciseState;
  setAnswer: (value: string) => void;
  submitAnswer: () => void;
  nextProblem: () => void;
  togglePause: () => void;
  restartExercise: () => void;
  isLastProblem: boolean;
  currentProblem: Problem;
  percentComplete: number;
  timeElapsed: number;
}

export interface ExerciseProviderProps {
  numberOfProblems: number;
  minFactor?: number;
  maxFactor?: number;
  children: React.ReactNode;
}
