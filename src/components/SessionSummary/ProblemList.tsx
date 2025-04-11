import React from 'react';
import { ProblemAttempt } from '../../services/api';
import { formatTime } from './utils/formatters';

interface ProblemListProps {
  attempts: ProblemAttempt[];
}

const ProblemList: React.FC<ProblemListProps> = ({ attempts }) => {
  // System-wide target response time (5 seconds) from backend configuration
  // TODO: This should be past from the backend
  const TARGET_RESPONSE_TIME = 7000; // ms
  
  console.log('ProblemList - attempts count:', attempts.length);
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Scrollable container with fixed height */}
      <div className="relative">
        {/* Scrollable content area with fixed height - adjusted to be more compact */}
        <div className="max-h-[350px] overflow-y-auto">
          {attempts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No problems attempted in this session.
            </div>
          ) : (
            attempts.map((attempt, index) => {
              const correctAnswer = attempt.factor1 * attempt.factor2;
              const isCorrect = attempt.isCorrect;
              
              // Determine if this attempt was faster than target
              const isFasterThanTarget = attempt.responseTime < TARGET_RESPONSE_TIME;
              
              let displayProblem = '';
              if (attempt.problemType === 'missing_factor') {
                // Safely check for missingOperandPosition property
                const missingPosition = attempt.missingOperandPosition || 'second';
                if (missingPosition === 'first') {
                  displayProblem = `? × ${attempt.factor2} = ${attempt.factor1 * attempt.factor2}`;
                } else {
                  displayProblem = `${attempt.factor1} × ? = ${attempt.factor1 * attempt.factor2}`;
                }
              } else {
                displayProblem = `${attempt.factor1} × ${attempt.factor2} = ${correctAnswer}`;
              }
              
              // Determine the correct answer based on problem type
              const expectedAnswer = attempt.problemType === 'missing_factor'
                ? (attempt.missingOperandPosition === 'first' 
                  ? attempt.factor1 
                  : attempt.factor2)
                : correctAnswer;
              
              return (
                <div 
                  key={index} 
                  className={`
                    flex items-center p-2 border-b last:border-b-0
                    ${isCorrect ? 'bg-green-50' : 'bg-red-50'}
                  `}
                >
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 mr-4">
                    <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg font-medium whitespace-nowrap">
                      {displayProblem}
                    </span>
                    
                    {isCorrect ? (
                      <span className="text-lg font-semibold text-green-700">
                        {attempt.userAnswer}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-semibold text-red-600 line-through">
                          {attempt.userAnswer}
                        </span>
                        <span className="text-gray-500 text-sm">
                          (should be {expectedAnswer})
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Response time indicator */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-base font-medium ${isFasterThanTarget ? 'text-green-600' : 'text-amber-600'}`}>
                      {formatTime(attempt.responseTime)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isFasterThanTarget ? 'Faster' : 'Slower'} than target
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemList;