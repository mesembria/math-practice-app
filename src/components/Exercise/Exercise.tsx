import React, { useState, useEffect, useCallback } from 'react';
import ProblemDisplay from '../ProblemDisplay/ProblemDisplay';
import NumericKeyboard from '../NumericKeyboard/NumericKeyboard';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';

interface ExerciseProps {
  numberOfProblems?: number;
  minFactor?: number;
  maxFactor?: number;
}

interface Problem {
  factor1: number;
  factor2: number;
  answer: number;
}

const Exercise: React.FC<ExerciseProps> = ({
  numberOfProblems = 10,
  minFactor = 2,
  maxFactor = 12,
}) => {
  // State management
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('0');
  const [results, setResults] = useState<Array<boolean | null>>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate random problems
  const generateProblems = useCallback(() => {
    setIsLoading(true);
    const newProblems: Problem[] = Array.from({ length: numberOfProblems }, () => {
      const factor1 = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
      const factor2 = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
      return {
        factor1,
        factor2,
        answer: factor1 * factor2,
      };
    });
    setProblems(newProblems);
    setResults(new Array(numberOfProblems).fill(null));
    setIsLoading(false);
  }, [numberOfProblems, minFactor, maxFactor]);

  // Initialize problems on mount
  useEffect(() => {
    generateProblems();
  }, [generateProblems]);

  // Handle answer submission
  const handleNext = useCallback(() => {
    const currentProblem = problems[currentProblemIndex];
    const isCorrect = parseInt(currentAnswer) === currentProblem.answer;
    
    // Update results
    const newResults = [...results];
    newResults[currentProblemIndex] = isCorrect;
    setResults(newResults);

    // Move to next problem or complete
    if (currentProblemIndex < numberOfProblems - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setCurrentAnswer('0');
    } else {
      setIsComplete(true);
    }
  }, [currentAnswer, currentProblemIndex, numberOfProblems, problems, results]);

  if (isComplete) {
    const correctCount = results.filter(result => result === true).length;
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-8 p-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Exercise Complete!
        </h2>
        <p className="text-xl text-gray-600">
          You got {correctCount} out of {numberOfProblems} correct!
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <p className="text-xl text-gray-600">Loading problems...</p>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-4 p-4">
      <ProgressIndicator
        totalProblems={numberOfProblems}
        currentProblemIndex={currentProblemIndex}
        results={results}
        className="w-full max-w-4xl h-3"
      />
      
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
        <ProblemDisplay
          factor1={currentProblem.factor1}
          factor2={currentProblem.factor2}
          answer={currentAnswer}
          className="w-full min-h-[120px] text-5xl md:text-6xl"
        />

        <div className="flex gap-2 w-full max-w-md">
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
    </div>
  );
};

export default Exercise;
