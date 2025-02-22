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
  maxFactor = 10,
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
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-8 p-4">
      <ProgressIndicator
        totalProblems={numberOfProblems}
        currentProblemIndex={currentProblemIndex}
        results={results}
        className="w-full max-w-3xl h-3"
      />
      
      <div className="flex flex-col items-center gap-6 w-full max-w-[75%]">
        <ProblemDisplay
          factor1={currentProblem.factor1}
          factor2={currentProblem.factor2}
          className="w-full min-h-[300px] text-7xl"
        />

        <div className="text-5xl font-bold text-gray-800 min-h-[60px] w-full text-center">
          {currentAnswer !== '0' ? currentAnswer : ''}
        </div>

        <NumericKeyboard
          value={currentAnswer}
          onChange={setCurrentAnswer}
          onSubmit={currentAnswer !== '0' ? handleNext : undefined}
          maxLength={3}
          className="w-full"
        />

        <button
          onClick={handleNext}
          disabled={currentAnswer === '0'}
          className={`
            w-full py-4 px-8 rounded-xl text-xl font-semibold
            transition-colors duration-150
            ${currentAnswer === '0'
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'}
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Exercise;
