import React from 'react';
import ProblemDisplay from '../ProblemDisplay/ProblemDisplay';
import NumericKeyboard from '../NumericKeyboard/NumericKeyboard';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import PauseOverlay from './PauseOverlay';
import ProgressStats from './ProgressStats';
import { Problem } from './types';

interface ExerciseViewProps {
  currentProblem: Problem;
  currentAnswer: string;
  setCurrentAnswer: (value: string) => void;
  results: Array<boolean | null>;
  totalProblems: number;
  isPaused: boolean;
  togglePause: () => void;
  handleNext: () => void;
}

/**
 * Presentation component for the exercise, responsible for rendering the UI
 */
const ExerciseView: React.FC<ExerciseViewProps> = ({
  currentProblem,
  currentAnswer,
  setCurrentAnswer,
  results,
  totalProblems,
  isPaused,
  togglePause,
  handleNext
}) => {
  const currentProblemIndex = results.findIndex(r => r === null) === -1 
    ? totalProblems - 1 
    : results.findIndex(r => r === null);

  return (
    <div className="flex flex-col items-center h-screen max-h-screen gap-4 p-4 overflow-hidden">
      {isPaused ? (
        <PauseOverlay onResume={togglePause} />
      ) : (
        <>
          {/* Combined progress indicator and pause button */}
          <div className="w-full max-w-4xl">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg shadow-md border border-blue-100">
              <div className="flex-grow">
                <ProgressIndicator
                  totalProblems={totalProblems}
                  currentProblemIndex={currentProblemIndex}
                  results={results}
                  className="w-full h-6"
                />
              </div>
              <button
                onClick={togglePause}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0"
                aria-label={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Main content area with flex-grow to take available space */}
          <div className="flex flex-col items-center gap-4 w-full max-w-2xl flex-grow">
            <div className="flex-grow flex items-center justify-center w-full min-h-0">
              <ProblemDisplay
                factor1={currentProblem.factor1}
                factor2={currentProblem.factor2}
                answer={currentAnswer}
                className="w-full text-5xl md:text-6xl"
              />
            </div>

            <div className="flex gap-2 w-full max-w-md mt-auto">
              <NumericKeyboard
                value={currentAnswer}
                onChange={setCurrentAnswer}
                onSubmit={currentAnswer !== '0' ? handleNext : undefined}
                maxLength={3}
                className="flex-1"
              />
              
              <button
                onClick={handleNext}
                disabled={currentAnswer === '0'}
                aria-label="Next"
                className={`
                  w-20 rounded-xl text-xl font-semibold p-3
                  transition-colors duration-150 flex items-center justify-center
                  h-[calc(48px*4+0.5rem*3+1.5rem*2)] sm:h-[calc(56px*4+0.5rem*3+1.5rem*2)] md:h-[calc(64px*4+0.5rem*3+1.5rem*2)]
                  ${currentAnswer === '0'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'}
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Progress stats at bottom */}
      <ProgressStats 
        results={results} 
        totalProblems={totalProblems} 
      />
    </div>
  );
};

export default ExerciseView;
