import React, { useState } from 'react';
import { ProblemType } from '../../services/api';
import { Problem } from './types';
import MultiplicationHint from './hints/MultiplicationHint';
import MissingFactorHint from './hints/MissingFactorHint';

interface IncorrectAnswerViewProps {
  problem: Problem;
  userAnswer: string;
  correctAnswer: number;
  onContinue: () => void;
  problemType: ProblemType;
}

/**
 * Displays a problem with incorrect answer, the correct solution, and helpful hints
 */
const IncorrectAnswerView: React.FC<IncorrectAnswerViewProps> = ({
  problem,
  userAnswer,
  correctAnswer,
  onContinue,
  problemType
}) => {
  const [showHint, setShowHint] = useState(false);

  // Format the problem text based on problem type
  const getProblemText = () => {
    if (problemType === ProblemType.MULTIPLICATION) {
      return `${problem.factor1} × ${problem.factor2} = `;
    } else if (problemType === ProblemType.MISSING_FACTOR) {
      if (problem.missingOperandPosition === 'first') {
        return `? × ${problem.factor2} = ${problem.product}`;
      } else {
        return `${problem.factor1} × ? = ${problem.product}`;
      }
    }
    return '';
  };

  // Generate the appropriate hint component based on problem type
  const getHintComponent = () => {
    if (problemType === ProblemType.MULTIPLICATION) {
      return (
        <MultiplicationHint 
          problem={problem}
          userAnswer={userAnswer}
          correctAnswer={correctAnswer}
        />
      );
    } else if (problemType === ProblemType.MISSING_FACTOR) {
      return (
        <MissingFactorHint 
          problem={problem}
          userAnswer={userAnswer}
          correctAnswer={correctAnswer}
        />
      );
    }
    
    // Fallback hint
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-700">General Math Hint</h3>
        <p>Take your time and double-check your work. Try drawing a picture to help visualize the problem.</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Not Quite Right</h2>
        <p className="text-gray-600">Let's see the correct answer</p>
      </div>
      
      {/* Problem Display */}
      <div className="w-full mb-8">
        <div className="text-3xl font-bold text-center py-4 px-6 bg-blue-50 rounded-lg">
          {getProblemText()}
        </div>
      </div>
      
      {/* Answers Display */}
      <div className="w-full mb-4 space-y-4">
        {/* User's incorrect answer */}
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex-shrink-0 mr-3">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Your answer</p>
            <p className="text-xl font-bold text-red-600">{userAnswer}</p>
          </div>
        </div>
        
        {/* Correct answer */}
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex-shrink-0 mr-3">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Correct answer</p>
            <p className="text-xl font-bold text-green-600">{correctAnswer}</p>
          </div>
        </div>
      </div>
      
      {/* Hint Button */}
      <button 
        onClick={() => setShowHint(!showHint)}
        className="w-full mb-4 py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
      >
        {showHint ? "Hide Hint" : "Show Hint"}
      </button>
      
      {/* Hint Content - shows only when showHint is true */}
      {showHint && (
        <div className="w-full mb-6 transition-all duration-300 ease-in-out">
          {getHintComponent()}
        </div>
      )}
      
      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Continue
      </button>
    </div>
  );
};

export default IncorrectAnswerView;